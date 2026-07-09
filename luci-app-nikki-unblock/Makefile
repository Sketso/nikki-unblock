include $(TOPDIR)/rules.mk

PKG_VERSION:=1.15.0
PKG_RELEASE:=1
PKG_MAINTAINER:=sketso
PKG_LICENSE:=MIT

LUCI_TITLE:=nikki-unblock — one-click unblock presets & routing rules over nikki
LUCI_DEPENDS:=+luci-base +nikki +curl +jsonfilter
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature to be here
