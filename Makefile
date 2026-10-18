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
# Дефолт для локальной сборки без тега; в CI перекрывается тегом релиза.
PROTON_VERSION?=1.4.3
PROTON_RELEASE?=1

PKG_VERSION:=$(PROTON_VERSION)
PKG_RELEASE:=$(PROTON_RELEASE)

LUCI_TITLE:=Proton2025 - Elegant Dark Theme for LuCI
LUCI_DEPENDS:=+luci-base +uhttpd-mod-ubus
LUCI_PKGARCH:=all

LUCI_MINIFY_CSS:=0
LUCI_MINIFY_UT:=0
PKG_LICENSE:=Apache-2.0 MIT
PKG_LICENSE_FILES:=LICENSE NOTICE LICENSES/MIT-fluid.txt

define Package/$(PKG_NAME)/conffiles
/etc/config/proton2025
endef

include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)/postinst
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] || {
	ubus_config_changed=0
	if ! uci -q get uhttpd.main.ubus_prefix >/dev/null; then
		uci set uhttpd.main.ubus_prefix='/ubus'
		ubus_config_changed=1
	fi
	if ! uci -q get uhttpd.main.ubus_socket >/dev/null; then
		uci set uhttpd.main.ubus_socket='/var/run/ubus/ubus.sock'
		ubus_config_changed=1
	fi
	if [ "$$ubus_config_changed" = "1" ]; then
		uci commit uhttpd
	fi
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
	# Откатываем регистрации темы в /etc/config/luci, чтобы после удаления
	# она не оставалась активной и в выпадающем списке тем (issue #75).
	proton_luci_changed=0
	if uci -q get luci.main.mediaurlbase 2>/dev/null | grep -q "luci-static/proton2025"; then
		if [ -d /www/luci-static/bootstrap ]; then
			uci set luci.main.mediaurlbase="/luci-static/bootstrap"
		elif [ -d /www/luci-static/openwrt2020 ]; then
			uci set luci.main.mediaurlbase="/luci-static/openwrt2020"
		else
			# Ни одного знакомого пакета тем нет: снимаем опцию, LuCI подставит дефолт.
			uci -q delete luci.main.mediaurlbase >/dev/null 2>&1 || true
		fi
		proton_luci_changed=1
	fi
	if uci -q get luci.themes.Proton2025 2>/dev/null | grep -q "luci-static/proton2025"; then
		uci -q delete luci.themes.Proton2025 >/dev/null 2>&1 || true
		proton_luci_changed=1
	fi
	[ "$$proton_luci_changed" = "1" ] && uci commit luci
	# Настройки темы удаляются вместе с пакетом: экспорт JSON через
	# Инструменты -> Резервная копия остаётся единственным способом сохранить их.
	# Строго имена собственной темы: proton2025 и её opkg-копия конффайла;
	# proton2025_dashboard и прочие чужие каталоги не затрагиваются.
	rm -f /etc/config/proton2025 /etc/config/proton2025-opkg >/dev/null 2>&1 || true
	# opkg/apk оставляют пустые каталоги — выносим в best-effort.
	for d in \
		/www/luci-static/proton2025/css /www/luci-static/proton2025/js \
		/www/luci-static/proton2025/i18n /www/luci-static/proton2025/img \
		/www/luci-static/proton2025/icons /www/luci-static/proton2025/fonts \
		/www/luci-static/proton2025 /www/luci-static/resources/view/status \
		/usr/share/ucode/luci/template/themes/proton2025 \
		/usr/lib/ucode/luci/template/themes/proton2025; do
		rmdir "$$d" >/dev/null 2>&1 || true
	done
	/etc/init.d/rpcd restart >/dev/null 2>&1 || true
	rm -f /tmp/proton-search-prefetch-cache.json /tmp/proton-search-prefetch-cache-meta.json >/dev/null 2>&1 || true
	rm -rf /tmp/proton-search-cache /tmp/proton-search-cache-meta >/dev/null 2>&1 || true
	rm -rf /tmp/luci-indexcache* /tmp/luci-modulecache >/dev/null 2>&1 || true
	/etc/init.d/uhttpd reload >/dev/null 2>&1 || /etc/init.d/uhttpd restart >/dev/null 2>&1 || true
}

exit 0
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
