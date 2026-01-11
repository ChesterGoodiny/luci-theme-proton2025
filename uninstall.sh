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

# Check if theme is installed
if [ ! -d "/www/luci-static/$THEME_NAME" ] && [ ! -f "/www/luci-static/resources/menu-proton2025.js" ]; then
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

# Remove RPC module and ACL
rm -f "/usr/share/rpcd/ucode/luci.proton-temp"
rm -f "/usr/share/rpcd/ucode/luci.proton-settings"
rm -f "/usr/share/rpcd/acl.d/luci-theme-proton2025.json"
ok "Removed RPC modules"

# Remove config (optional - keep user settings)
# Uncomment to remove settings on uninstall:
# rm -f "/etc/config/proton2025"
# ok "Removed config"

# Clear cache
info "Clearing cache..."
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
