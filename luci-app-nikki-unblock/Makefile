include $(TOPDIR)/rules.mk

PKG_VERSION:=2.9.0
PKG_RELEASE:=1
PKG_MAINTAINER:=sketso
PKG_LICENSE:=MIT

LUCI_TITLE:=Nipret — unblock via VPN (nikki) + DPI-bypass (zapret2)
LUCI_DEPENDS:=+luci-base +curl +jsonfilter
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature to be here
