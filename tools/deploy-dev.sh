#!/bin/sh
# Deploy the panel to a router over ssh (default: the devrouter ssh alias).
#
# Pushes ALL of the package's PROGRAM files (CR-stripped) and syntax-checks the CGI on the router —
# so LuCI integration (menu.d / rpcd acl.d / the LuCI view) is always complete, not just the CGI +
# static app. This mirrors what an apk install lays down, with ONE deliberate exception: it never
# touches /etc (config, uci-defaults, crontab). Those are live state — re-deploying during iteration
# must not clobber the router's config or re-trigger install-time seeding.
#
# So this is a CODE deploy, not a full install. On a from-scratch box (config also wiped, e.g. right
# after `apk del`), restore config separately (a backup, or run root/etc/uci-defaults/90-nikki-unblock
# once) — or use the Ansible install playbook (planned) which does the whole thing properly.
#
# Usage: tools/deploy-dev.sh [ssh-host]
set -eu

cd "$(dirname "$0")/.."
HOST="${1:-devrouter}"
PKG=luci-app-nikki-unblock
SSH="ssh -F $HOME/.ssh/config $HOST"

sh tools/check.sh >/dev/null || { echo "checks failed — not deploying" >&2; exit 1; }

# read a local file on stdin (CR already stripped), ensure the remote dir exists, write it there
put() { $SSH "mkdir -p '$(dirname "$1")' && cat > '$1'"; }

# root/<path> -> /<path>, but NEVER root/etc/** (config / uci-defaults / crontabs = state, not code)
find "$PKG/root" -type f ! -path "$PKG/root/etc/*" | while IFS= read -r src; do
	dst="/${src#"$PKG/root/"}"
	tr -d '\r' < "$src" | put "$dst"
	echo "pushed: $dst"
done

# htdocs/<path> -> /www/<path> (LuCI static resources, incl. the authenticated LuCI view app.js)
find "$PKG/htdocs" -type f | while IFS= read -r src; do
	dst="/www/${src#"$PKG/htdocs/"}"
	tr -d '\r' < "$src" | put "$dst"
	echo "pushed: $dst"
done

# Post-copy, idempotent and safe every run: make executables runnable, drop the LuCI/rpcd caches so a
# freshly-restored menu.d/acl.d shows up, and syntax-check the CGI in the router's own busybox ash.
$SSH '
	chmod 0755 /www/cgi-bin/nikki-unblock /usr/bin/nikki-unblock-z2-watchdog 2>/dev/null
	rm -f /tmp/luci-indexcache* 2>/dev/null; rm -rf /tmp/luci-modulecache 2>/dev/null
	/etc/init.d/rpcd reload >/dev/null 2>&1
	sh -n /www/cgi-bin/nikki-unblock && echo "router syntax OK"
'
