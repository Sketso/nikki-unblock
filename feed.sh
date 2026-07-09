#!/bin/sh
# nikki-unblock installer.
#
#   wget -O - https://github.com/sketso/nikki-unblock/raw/main/feed.sh | sh
#
# On apk (OpenWrt >= 25.12) it adds a SIGNED package repository hosted on the project's
# GitHub Pages, so the package shows up in LuCI -> System -> Software and `apk upgrade`
# works. On opkg (OpenWrt <= 24.10) it installs the .ipk straight from the latest release.
#
# Prerequisite: nikki must already be installed (https://github.com/nikkinikki-org/OpenWrt-nikki).
set -e

REPO="sketso/nikki-unblock"
PKG="luci-app-nikki-unblock"
APKREPO="https://sketso.github.io/nikki-unblock/apk"        # signed apk repository (Pages)
RELEASE="https://github.com/$REPO/releases/latest/download" # opkg fallback

if [ -x /usr/bin/apk ]; then
	echo "==> apk detected — adding the signed nikki-unblock repository"
	# 1) trust the repo's signing key
	mkdir -p /etc/apk/keys
	wget -qO /etc/apk/keys/nikki-unblock.pem "$APKREPO/nikki-unblock.pem"
	# 2) register the repository
	mkdir -p /etc/apk/repositories.d
	echo "$APKREPO/packages.adb" > /etc/apk/repositories.d/nikki-unblock.list
	# 3) install (signed → no --allow-untrusted needed)
	apk update
	apk add "$PKG"
	echo "==> To update later:  apk upgrade $PKG   (or LuCI -> System -> Software)"
elif command -v opkg >/dev/null 2>&1; then
	echo "==> opkg detected — fetching $PKG.ipk from the latest release"
	TMP="/tmp/nikki-unblock.$$"; mkdir -p "$TMP"; trap 'rm -rf "$TMP"' EXIT
	wget -O "$TMP/$PKG.ipk" "$RELEASE/$PKG.ipk"
	opkg install "$TMP/$PKG.ipk"
else
	echo "!! Neither apk nor opkg found — is this OpenWrt?" >&2
	exit 1
fi

echo
echo "Installed. Open it in LuCI:  Services -> 'nikki · Unblock'"
echo "or directly:                 http://<router-ip>/nikki"
