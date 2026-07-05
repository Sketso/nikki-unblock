#!/bin/sh
# nikki-unblock installer — installs the (architecture-independent) package straight from
# the latest GitHub release. Works on apk (OpenWrt >= 25.12) and opkg (OpenWrt <= 24.10).
#
#   wget -O - https://github.com/sketso/nikki-unblock/raw/main/feed.sh | sh
#
# Prerequisite: nikki must already be installed (see https://github.com/nikkinikki-org/OpenWrt-nikki).
set -e

REPO="sketso/nikki-unblock"
PKG="luci-app-nikki-unblock"
BASE="https://github.com/$REPO/releases/latest/download"

TMP="/tmp/nikki-unblock.$$"
mkdir -p "$TMP"
trap 'rm -rf "$TMP"' EXIT

if [ -x /usr/bin/apk ]; then
	echo "==> apk detected — fetching $PKG.apk"
	wget -O "$TMP/$PKG.apk" "$BASE/$PKG.apk"
	apk add --allow-untrusted "$TMP/$PKG.apk"
elif command -v opkg >/dev/null 2>&1; then
	echo "==> opkg detected — fetching $PKG.ipk"
	wget -O "$TMP/$PKG.ipk" "$BASE/$PKG.ipk"
	opkg install "$TMP/$PKG.ipk"
else
	echo "!! Neither apk nor opkg found — is this OpenWrt?" >&2
	exit 1
fi

echo
echo "Installed. Open it in LuCI:  Services -> 'nikki · Unblock'"
echo "or directly:                 http://<router-ip>/nikki"
