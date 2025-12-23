#!/bin/sh
# ============================================================
# Proton2025 Theme Uninstaller for OpenWrt/LuCI
# ============================================================
# Run: wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/uninstall.sh | sh
# ============================================================

set -e

THEME_NAME="proton2025"

info() { printf "[*] %s\n" "$1"; }
ok() { printf "[+] %s\n" "$1"; }
warn() { printf "[!] %s\n" "$1"; }
err() { printf "[-] %s\n" "$1"; }

printf "\n"
printf "================================================\n"
printf "    Proton2025 Theme Uninstaller\n"
printf "================================================\n"
printf "\n"

info "Removing Proton2025 theme..."
printf "\n"

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

info "Removing theme files..."

# Remove static files
rm -rf "/www/luci-static/$THEME_NAME"
ok "Removed static files"

# Remove JS
rm -f "/www/luci-static/resources/menu-proton2025.js"
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

# Remove translations
for p in "/usr/share/luci/i18n" "/usr/lib/lua/luci/i18n"; do
    if [ -d "$p" ]; then
        rm -f "$p/theme-proton2025".*.lmo 2>/dev/null || true
    fi
done
ok "Removed translations"

# Clear cache
info "Clearing cache..."
rm -rf /tmp/luci-modulecache 2>/dev/null || true
rm -rf /tmp/luci-indexcache* 2>/dev/null || true
ok "Cache cleared"

printf "\n"
printf "================================================\n"
printf "    Uninstallation Complete!\n"
printf "================================================\n"
printf "\n"
printf "  [*] Refresh your browser (Ctrl+F5)\n"
printf "\n"
