#
# Copyright 2025-2026 ChesterGoodiny
#
# Licensed under the Apache License, Version 2.0.
# See LICENSE and NOTICE for details.
#
# Simplified Makefile for APK/IPK compatibility
# Thanks to @smalleaves for the suggestion (GitHub issue #8)
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-theme-proton2025
PROTON_VERSION?=1.2.7
PROTON_RELEASE?=1

PKG_VERSION:=$(PROTON_VERSION)
PKG_RELEASE:=$(PROTON_RELEASE)

LUCI_TITLE:=Proton2025 - Elegant Dark Theme for LuCI
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all

LUCI_MINIFY_CSS:=0
PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE NOTICE

include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)/postinst
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] || {
	[ -f /etc/uci-defaults/30_luci-theme-proton2025 ] && sh /etc/uci-defaults/30_luci-theme-proton2025 >/dev/null 2>&1 || true
	/etc/init.d/rpcd restart >/dev/null 2>&1 || true
	rm -f /tmp/proton-search-prefetch-cache.json /tmp/proton-search-prefetch-cache-meta.json >/dev/null 2>&1 || true
	rm -rf /tmp/proton-search-cache /tmp/proton-search-cache-meta >/dev/null 2>&1 || true
	rm -rf /tmp/luci-indexcache* /tmp/luci-modulecache >/dev/null 2>&1 || true
	/etc/init.d/uhttpd reload >/dev/null 2>&1 || /etc/init.d/uhttpd restart >/dev/null 2>&1 || true
}

exit 0
endef

define Package/$(PKG_NAME)/postrm
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] || {
	/etc/init.d/rpcd restart >/dev/null 2>&1 || true
	rm -f /tmp/proton-search-prefetch-cache.json /tmp/proton-search-prefetch-cache-meta.json >/dev/null 2>&1 || true
	rm -rf /tmp/proton-search-cache /tmp/proton-search-cache-meta >/dev/null 2>&1 || true
	rm -rf /tmp/luci-indexcache* /tmp/luci-modulecache >/dev/null 2>&1 || true
	/etc/init.d/uhttpd reload >/dev/null 2>&1 || /etc/init.d/uhttpd restart >/dev/null 2>&1 || true
}

exit 0
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
