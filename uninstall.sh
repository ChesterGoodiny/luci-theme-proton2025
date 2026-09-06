#!/bin/sh
# Copyright 2025-2026 ChesterGoodiny
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# ============================================================
# Proton2025 Theme Uninstaller for OpenWrt/LuCI
# ============================================================
# Run: wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/uninstall.sh | sh
# ============================================================

set -e

PKG_NAME="luci-theme-proton2025"
THEME_NAME="proton2025"

PKG_IS_APK=0
command -v apk >/dev/null 2>&1 && PKG_IS_APK=1

info() { printf "[*] %s\n" "$1"; }
ok() { printf "[+] %s\n" "$1"; }
warn() { printf "[!] %s\n" "$1"; }
err() { printf "[-] %s\n" "$1"; }

pkg_is_installed() {
    if [ "$PKG_IS_APK" -eq 1 ]; then
        apk info -e "$PKG_NAME" 2>/dev/null | grep -q "$PKG_NAME"
    else
        opkg list-installed 2>/dev/null | grep -q "^${PKG_NAME} "
    fi
}

printf "\n"
printf "================================================\n"
printf "    Proton2025 Theme Uninstaller\n"
printf "================================================\n"
printf "\n"

info "Removing Proton2025 theme..."
printf "\n"

# Check if theme is installed
if ! pkg_is_installed &&
    [ ! -d "/www/luci-static/$THEME_NAME" ] &&
    [ ! -f "/www/luci-static/resources/menu-proton2025.js" ]; then
    warn "Theme is not installed"
    exit 0
fi

info "Switching to default theme..."
if command -v uci >/dev/null 2>&1; then
    if [ -d "/www/luci-static/bootstrap" ]; then
        uci set luci.main.mediaurlbase="/luci-static/bootstrap"
    else
        uci set luci.main.mediaurlbase="/luci-static/openwrt"
    fi
    uci commit luci
    ok "Switched to default theme"
fi

info "Removing theme from LuCI registry..."
if command -v uci >/dev/null 2>&1; then
    uci delete luci.themes.Proton2025 2>/dev/null || true
    uci commit luci
    ok "Theme removed from registry"
fi

# Installed as a package: let the package manager do the work.
if pkg_is_installed; then
    info "Removing package ${PKG_NAME}..."
    if [ "$PKG_IS_APK" -eq 1 ]; then
        apk del "$PKG_NAME" >/dev/null 2>&1 || true
    else
        opkg remove "$PKG_NAME" >/dev/null 2>&1 || true
    fi
    ok "Package removed"
fi

# Leftovers from a package removal or from a manual/script install.
info "Removing theme files..."

# Remove static files
rm -rf "/www/luci-static/$THEME_NAME"
ok "Removed static files"

# Remove JS
rm -f "/www/luci-static/resources/menu-proton2025.js"
rm -f "/www/luci-static/resources/menu-proton2025.core.js"
rm -f "/www/luci-static/resources/menu-search-index.js"
rm -f "/www/luci-static/resources/menu-dropdowns.js"
rm -f "/www/luci-static/resources/menu-theme-settings.js"
rm -f "/www/luci-static/resources/router-proton2025.js"
rm -f "/www/luci-static/resources/view/status/proton-temperature.js"
ok "Removed JavaScript"

# Remove templates
for p in \
    "/usr/share/ucode/luci/template/themes" \
    "/usr/lib/ucode/luci/template/themes"; do
    if [ -d "$p" ]; then
        rm -rf "$p/$THEME_NAME" 2>/dev/null || true
    fi
done
ok "Removed templates"

# Remove uci-defaults
rm -f "/etc/uci-defaults/30_luci-theme-proton2025"
ok "Removed uci-defaults"

# Remove RPC module and ACL
rm -f "/usr/share/rpcd/ucode/luci.proton-temp"
rm -f "/usr/share/rpcd/ucode/luci.proton-system"
rm -f "/usr/share/rpcd/ucode/luci.proton-settings"
rm -f "/usr/share/rpcd/ucode/luci.proton-search-cache"
rm -f "/usr/share/rpcd/acl.d/luci-theme-proton2025.json"
rm -f "/usr/share/luci/menu.d/luci-theme-proton2025.json"
ok "Removed RPC modules"

# Remove config (optional - keep user settings)
# Uncomment to remove settings on uninstall:
# rm -f "/etc/config/proton2025"
# ok "Removed config"

# Clear cache
info "Clearing cache..."
rm -f /tmp/proton-search-prefetch-cache.json /tmp/proton-search-prefetch-cache-meta.json 2>/dev/null || true
rm -rf /tmp/proton-search-cache /tmp/proton-search-cache-meta 2>/dev/null || true
rm -rf /tmp/luci-modulecache 2>/dev/null || true
rm -rf /tmp/luci-indexcache* 2>/dev/null || true
ok "Cache cleared"

# Restart services
info "Restarting LuCI services..."
if command -v /etc/init.d/rpcd >/dev/null 2>&1; then
    /etc/init.d/rpcd restart >/dev/null 2>&1 || true
fi
if command -v /etc/init.d/uhttpd >/dev/null 2>&1; then
    /etc/init.d/uhttpd restart >/dev/null 2>&1 || true
fi
ok "Services restarted"

printf "\n"
printf "================================================\n"
printf "    Uninstallation Complete!\n"
printf "================================================\n"
printf "\n"
printf "  [*] Refresh your browser (Ctrl+F5)\n"
printf "  [*] Clear browser cache if needed\n"
printf "\n"
