#!/bin/sh
# ============================================================
# Proton2025 Theme Installer for OpenWrt/LuCI
# ============================================================
# One-line install:
# wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/install.sh | sh
# or with curl:
# curl -fsSL https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/install.sh | sh
# ============================================================

set -e

# Theme info
THEME_NAME="proton2025"
REPO_URL="https://github.com/ChesterGoodiny/luci-theme-proton2025"
BRANCH="main"
ARCHIVE_URL="${REPO_URL}/archive/refs/heads/${BRANCH}.tar.gz"

# Paths
TMP_DIR="/tmp/proton2025-install"
LUCI_STATIC="/www/luci-static"
LUCI_RESOURCES="/www/luci-static/resources"
LUCI_THEMES=""
UCI_DEFAULTS="/etc/uci-defaults"

# Detect LuCI ucode template themes directory.
detect_luci_themes_dir() {
    for p in \
        "/usr/share/ucode/luci/template/themes" \
        "/usr/lib/ucode/luci/template/themes"; do
        if [ -d "$p" ]; then
            LUCI_THEMES="$p"
            return 0
        fi
    done
    LUCI_THEMES="/usr/share/ucode/luci/template/themes"
    return 0
}

info() { printf "[*] %s\n" "$1"; }
ok() { printf "[+] %s\n" "$1"; }
warn() { printf "[!] %s\n" "$1"; }
err() { printf "[-] %s\n" "$1"; }

printf "\n"
printf "================================================\n"
printf "    Proton2025 Theme Installer\n"
printf "    Modern Dark Theme for LuCI\n"
printf "================================================\n"
printf "\n"

# Check if running on OpenWrt
check_openwrt() {
    if [ ! -f /etc/openwrt_release ]; then
        warn "This doesn't appear to be an OpenWrt system."
        warn "Continuing anyway..."
    else
        . /etc/openwrt_release
        ok "Detected: ${DISTRIB_DESCRIPTION}"
    fi
}

# Check for required tools
check_dependencies() {
    info "Checking dependencies..."
    
    if command -v wget >/dev/null 2>&1; then
        DOWNLOADER="wget"
        ok "wget found"
    elif command -v curl >/dev/null 2>&1; then
        DOWNLOADER="curl"
        ok "curl found"
    else
        err "Neither wget nor curl found. Please install one:"
        printf "  opkg update && opkg install wget\n"
        exit 1
    fi
    
    if ! command -v tar >/dev/null 2>&1; then
        err "tar not found. Please install:"
        printf "  opkg update && opkg install tar\n"
        exit 1
    fi
    ok "tar found"
}

# Download theme
download_theme() {
    info "Downloading theme..."
    
    rm -rf "$TMP_DIR"
    mkdir -p "$TMP_DIR"
    
    cd "$TMP_DIR" || exit 1
    
    if [ "$DOWNLOADER" = "wget" ]; then
        wget -q --no-check-certificate -O theme.tar.gz "$ARCHIVE_URL"
    else
        curl -fsSL -o theme.tar.gz "$ARCHIVE_URL"
    fi
    
    if [ ! -f theme.tar.gz ]; then
        err "Failed to download theme"
        exit 1
    fi
    
    ok "Downloaded successfully"
}

# Extract and install
install_theme() {
    info "Installing theme..."
    
    cd "$TMP_DIR" || exit 1
    
    tar -xzf theme.tar.gz
    
    EXTRACT_DIR=$(find . -maxdepth 1 -type d -name "luci-theme-proton2025*" | head -1)
    
    if [ -z "$EXTRACT_DIR" ]; then
        err "Failed to extract theme"
        exit 1
    fi
    
    mkdir -p "$LUCI_STATIC/$THEME_NAME"
    mkdir -p "$LUCI_RESOURCES"
    mkdir -p "$LUCI_THEMES/$THEME_NAME"
    mkdir -p "$UCI_DEFAULTS"
    
    if [ -d "$EXTRACT_DIR/htdocs/luci-static/$THEME_NAME" ]; then
        cp -rf "$EXTRACT_DIR/htdocs/luci-static/$THEME_NAME/"* "$LUCI_STATIC/$THEME_NAME/"
        ok "Installed static files"
    fi
    
    if [ -d "$EXTRACT_DIR/htdocs/luci-static/resources" ]; then
        cp -rf "$EXTRACT_DIR/htdocs/luci-static/resources/"* "$LUCI_RESOURCES/"
        ok "Installed JavaScript resources"
    fi
    
    if [ -d "$EXTRACT_DIR/ucode/template/themes/$THEME_NAME" ]; then
        cp -rf "$EXTRACT_DIR/ucode/template/themes/$THEME_NAME/"* "$LUCI_THEMES/$THEME_NAME/"
        ok "Installed template files"
    fi
    
    if [ -d "$EXTRACT_DIR/root/etc/uci-defaults" ]; then
        cp -rf "$EXTRACT_DIR/root/etc/uci-defaults/"* "$UCI_DEFAULTS/"
        ok "Installed uci-defaults"
    fi
    
    # Install RPC module for temperature widget
    if [ -d "$EXTRACT_DIR/root/usr/share/rpcd" ]; then
        mkdir -p /usr/share/rpcd/acl.d
        mkdir -p /usr/share/rpcd/ucode
        if [ -f "$EXTRACT_DIR/root/usr/share/rpcd/ucode/luci.proton-temp" ]; then
            cp -f "$EXTRACT_DIR/root/usr/share/rpcd/ucode/luci.proton-temp" /usr/share/rpcd/ucode/
            ok "Installed temperature RPC module"
        fi
        if [ -f "$EXTRACT_DIR/root/usr/share/rpcd/ucode/luci.proton-settings" ]; then
            cp -f "$EXTRACT_DIR/root/usr/share/rpcd/ucode/luci.proton-settings" /usr/share/rpcd/ucode/
            ok "Installed settings RPC module"
        fi
        if [ -f "$EXTRACT_DIR/root/usr/share/rpcd/acl.d/luci-theme-proton2025.json" ]; then
            cp -f "$EXTRACT_DIR/root/usr/share/rpcd/acl.d/luci-theme-proton2025.json" /usr/share/rpcd/acl.d/
            ok "Installed ACL configuration"
        fi
    fi
    
    install_translations
}

# Install translations
install_translations() {
    # Translations are now embedded in JavaScript (translations.js)
    # No need to download separate .lmo files
    ok "Translations included in theme files"
}

# Register theme
register_theme() {
    info "Registering theme..."
    
    if [ -f "$UCI_DEFAULTS/30_luci-theme-proton2025" ]; then
        sh "$UCI_DEFAULTS/30_luci-theme-proton2025"
        ok "Theme registered"
    fi
    
    if command -v uci >/dev/null 2>&1; then
        uci set luci.main.mediaurlbase="/luci-static/$THEME_NAME"
        uci commit luci
        ok "Set as default theme"
    fi
    
    # Restart rpcd to load temperature RPC module
    if [ -x /etc/init.d/rpcd ]; then
        /etc/init.d/rpcd restart 2>/dev/null || true
        ok "Restarted rpcd service"
    fi
}

# Cleanup
cleanup() {
    info "Cleaning up..."
    rm -rf "$TMP_DIR"
    rm -rf /tmp/luci-modulecache 2>/dev/null || true
    rm -rf /tmp/luci-indexcache* 2>/dev/null || true
    ok "Cleanup complete"
}

# Main
main() {
    check_openwrt
    check_dependencies
    detect_luci_themes_dir
    download_theme
    install_theme
    register_theme
    cleanup
    
    printf "\n"
    printf "================================================\n"
    printf "    Installation Complete!\n"
    printf "================================================\n"
    printf "\n"
    printf "  [*] Refresh your browser (Ctrl+F5)\n"
    printf "  [*] Theme: System -> System -> Language and Style\n"
    printf "\n"
}

main
