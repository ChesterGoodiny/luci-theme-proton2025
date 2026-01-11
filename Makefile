#
# Copyright (C) 2025
#
# This is free software, licensed under the Apache License, Version 2.0
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-theme-proton2025
PKG_RELEASE:=1

LUCI_TITLE:=Proton2025 - Elegant Dark Theme for LuCI
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all

PKG_LICENSE:=Apache-2.0

ifneq ($(wildcard $(TOPDIR)/feeds/luci/luci.mk),)
  include $(TOPDIR)/feeds/luci/luci.mk
else
  include ../../luci.mk
endif

define Package/$(PKG_NAME)/install
  $(INSTALL_DIR) $(1)/www/luci-static/proton2025
  $(CP) ./htdocs/luci-static/proton2025/* $(1)/www/luci-static/proton2025/

  $(INSTALL_DIR) $(1)/www/luci-static/resources
  $(INSTALL_DATA) ./htdocs/luci-static/resources/menu-proton2025.js $(1)/www/luci-static/resources/

  $(INSTALL_DIR) $(1)/usr/share/ucode/luci/template/themes/proton2025
  $(CP) ./ucode/template/themes/proton2025/* $(1)/usr/share/ucode/luci/template/themes/proton2025/

  $(INSTALL_DIR) $(1)/etc/uci-defaults
  $(INSTALL_BIN) ./root/etc/uci-defaults/30_luci-theme-proton2025 $(1)/etc/uci-defaults/

  $(INSTALL_DIR) $(1)/etc/config
  $(INSTALL_CONF) ./root/etc/config/proton2025 $(1)/etc/config/

  $(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
  $(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-theme-proton2025.json $(1)/usr/share/rpcd/acl.d/

  $(INSTALL_DIR) $(1)/usr/share/rpcd/ucode
  $(INSTALL_DATA) ./root/usr/share/rpcd/ucode/luci.proton-temp $(1)/usr/share/rpcd/ucode/
  $(INSTALL_DATA) ./root/usr/share/rpcd/ucode/luci.proton-settings $(1)/usr/share/rpcd/ucode/
endef

# call BuildPackage - OpenWrt buildroot signature
$(eval $(call BuildPackage,$(PKG_NAME)))
