#!/bin/sh
# nikki-unblock (Nipret) uninstaller — the mirror image of feed.sh.
#
#   wget -O - https://github.com/sketso/nikki-unblock/raw/main/uninstall.sh | sh
#   wget -O - https://github.com/sketso/nikki-unblock/raw/main/uninstall.sh | sh -s -- zapret2
#
# Reverts every change Nipret ever made — nikki routing rules, device ACLs, the QUIC/MSS/IPv6 toggles,
# the zapret2 desync marks — then removes the package AND the signed repo that feed.sh added (apk del
# never touches those). nikki itself is left untouched; pass `zapret2` to also remove /opt/zapret2.
# A safety backup is written to /tmp/nu-prepurge.tar.gz before anything is deleted.
set -e

PKG="luci-app-nikki-unblock"
CGI="/www/cgi-bin/nikki-unblock"
Z2="$1"   # "zapret2" → also remove /opt/zapret2

# 1) full revert through the panel's own purge core — the single source of truth shared with the
#    in-panel "Remove Nipret" button, so the two entry points can never drift apart.
if [ -x "$CGI" ]; then
	echo "==> reverting Nipret changes (nikki / firewall / zapret2 marks)"
	"$CGI" purge "$Z2" || echo "!! purge reported a problem — continuing with package removal"
else
	# The CGI is already gone (half-removed install). Best-effort inline cleanup of the artifacts that
	# a bare `apk del` would leave behind — mirrors the important bits of purge_run().
	echo "==> CGI missing — minimal inline cleanup"
	rm -rf /etc/nikki-unblock 2>/dev/null || true
	rm -f /etc/config/nikki-unblock 2>/dev/null || true
	rm -f /tmp/nikki-unblock-* 2>/dev/null || true
	[ -f /etc/crontabs/root ] && sed -i '/nikki-unblock/d; /nikki-domains/d' /etc/crontabs/root
	nft delete table inet nipret_bypass 2>/dev/null || true
	rm -f /etc/nftables.d/10-mss-clamp.nft /etc/nftables.d/20-nipret-block-quic.nft 2>/dev/null || true
	nft delete chain inet fw4 mss_clamp_all 2>/dev/null || true
	nft delete chain inet fw4 nipret_block_quic 2>/dev/null || true
	fw4 reload >/dev/null 2>&1 || true
fi

# 2) remove the package (apk on OpenWrt >= 25.12, opkg on <= 24.10)
if [ -x /usr/bin/apk ]; then
	echo "==> apk: removing $PKG"
	apk del "$PKG" 2>/dev/null || true
	# 3) drop the signed repository feed.sh registered — apk del never removes the key/list
	rm -f /etc/apk/keys/nikki-unblock.pem /etc/apk/repositories.d/nikki-unblock.list
	apk update 2>/dev/null || true
elif command -v opkg >/dev/null 2>&1; then
	echo "==> opkg: removing $PKG"
	opkg remove "$PKG" 2>/dev/null || true
else
	echo "!! Neither apk nor opkg found — is this OpenWrt?" >&2
fi

rm -f /tmp/luci-indexcache* 2>/dev/null || true
rm -rf /tmp/luci-modulecache 2>/dev/null || true

echo
if [ "$Z2" = zapret2 ]; then
	echo "Nipret removed. zapret2 (/opt/zapret2) removed too. nikki was left untouched."
else
	echo "Nipret removed. nikki and zapret2 were left untouched."
fi
echo "Pre-removal backup: /tmp/nu-prepurge.tar.gz  (feed it to a fresh install's Restore if you regret this)."
