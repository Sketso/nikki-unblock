#!/bin/sh
# Deploy the panel to a router over ssh (default: the devrouter ssh alias).
# Pushes the CGI + the static app files, CR-stripped, and syntax-checks on the router.
# Usage: tools/deploy-dev.sh [ssh-host]
set -eu

cd "$(dirname "$0")/.."
HOST="${1:-devrouter}"
ROOT=luci-app-nikki-unblock/root

sh tools/check.sh >/dev/null || { echo "checks failed — not deploying" >&2; exit 1; }

ssh -F ~/.ssh/config "$HOST" 'mkdir -p /www/nikki-unblock'
for f in www/cgi-bin/nikki-unblock www/nikki-unblock/app.html www/nikki-unblock/app.css www/nikki-unblock/app.js; do
	tr -d '\r' < "$ROOT/$f" | ssh -F ~/.ssh/config "$HOST" "cat > /$f"
	echo "pushed: /$f"
done
ssh -F ~/.ssh/config "$HOST" 'chmod 755 /www/cgi-bin/nikki-unblock && sh -n /www/cgi-bin/nikki-unblock && echo "router syntax OK"'
