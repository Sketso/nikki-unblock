#!/bin/sh
# Repo verification gate: shell/JS syntax, i18n parity, applist JSON validity.
# Runs locally (Git Bash / Linux) and in CI. Needs node; uses busybox ash when
# available (the dialect the router actually runs), plain sh -n otherwise.
set -u

cd "$(dirname "$0")/.." || exit 1
CGI=luci-app-nikki-unblock/root/www/cgi-bin/nikki-unblock
FAIL=0
err() { echo "FAIL: $*" >&2; FAIL=1; }
ok()  { echo "  ok: $*"; }

TMP_SH=$(mktemp) || exit 1
TMP_JS="$TMP_SH.js"   # node --check requires a .js extension
trap 'rm -f "$TMP_SH" "$TMP_JS"' EXIT

# --- 1. shell syntax (CGI + the small helper scripts) ---------------------
tr -d '\r' < "$CGI" > "$TMP_SH"
if command -v busybox >/dev/null 2>&1 && busybox ash -c true 2>/dev/null; then
	SH_CHECK="busybox ash"
else
	SH_CHECK="sh"
	echo "note: busybox not found — falling back to sh -n (CI uses busybox ash)"
fi
if $SH_CHECK -n "$TMP_SH"; then ok "$SH_CHECK -n $CGI"; else err "shell syntax: $CGI"; fi

for f in feed.sh uninstall.sh \
         luci-app-nikki-unblock/root/etc/uci-defaults/90-nikki-unblock \
         luci-app-nikki-unblock/root/usr/bin/nikki-unblock-z2-watchdog \
         tools/*.sh; do
	[ -f "$f" ] || continue
	tr -d '\r' < "$f" > "$TMP_JS"   # reuse tmp as scratch
	if $SH_CHECK -n "$TMP_JS"; then ok "$SH_CHECK -n $f"; else err "shell syntax: $f"; fi
done

# --- 2. JS syntax + HTML shell sanity --------------------------------------
APP=luci-app-nikki-unblock/root/www/nikki-unblock
tr -d '\r' < "$APP/app.js" > "$TMP_JS"
if node --check "$TMP_JS"; then ok "node --check $APP/app.js"; else err "JS syntax in $APP/app.js"; fi
for a in 'app.css?v=@VER@' 'app.js?v=@VER@'; do
	grep -q "$a" "$APP/app.html" || err "app.html lost its cache-busted $a link"
done
ok "app.html references @VER@-stamped assets"

# --- 3. i18n parity: ru and en must expose the same key set ---------------
if node -e '
	const fs = require("fs");
	const js = fs.readFileSync(process.argv[1], "utf8");
	const m = js.match(/const I18N = \{[\s\S]*?\n\};/);
	if (!m) { console.error("I18N block not found"); process.exit(1); }
	const I18N = new Function(m[0] + " return I18N;")();
	const ru = Object.keys(I18N.ru), en = Object.keys(I18N.en);
	const noEn = ru.filter(k => !(k in I18N.en));
	const noRu = en.filter(k => !(k in I18N.ru));
	if (noEn.length || noRu.length) {
		if (noEn.length) console.error("missing in en: " + noEn.join(", "));
		if (noRu.length) console.error("missing in ru: " + noRu.join(", "));
		process.exit(1);
	}
	console.log("  ok: i18n parity (" + ru.length + " keys)");
' "$TMP_JS"; then :; else err "i18n key sets diverge (ru vs en)"; fi

# --- 4. applist JSON validity ----------------------------------------------
for j in applist/index.json applist/z2/index.json applist/z2/version.json; do
	if node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$j" 2>/dev/null; then
		ok "valid JSON: $j"
	else
		err "invalid JSON: $j"
	fi
done

# --- 5. committed blobs must be LF (ash chokes on CRLF) --------------------
if git ls-files --eol | grep -E 'i/(crlf|mixed)'; then
	err "CRLF line endings in the index (see list above)"
else
	ok "all indexed files are LF"
fi

[ "$FAIL" = 0 ] && echo "ALL CHECKS PASSED" || echo "CHECKS FAILED" >&2
exit "$FAIL"
