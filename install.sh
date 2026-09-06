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
# Proton2025 Theme Installer for OpenWrt/LuCI
# ============================================================
# Theme only:
#   wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/install.sh | sh
# Theme + dashboard widgets (dashboard repo not published yet):
#   wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/install.sh | WITH_DASHBOARD=1 sh
# ============================================================

set -e

PKG_NAME="luci-theme-proton2025"
THEME_NAME="proton2025"
REPO="ChesterGoodiny/luci-theme-proton2025"
API_URL="https://api.github.com/repos/${REPO}/releases/latest"
ATOM_URL="https://github.com/${REPO}/releases.atom"
DOWNLOAD_DIR="/tmp/proton2025-install"
ATTEMPTS=3

# Dashboard widgets live in a separate package that isn't released yet.
WITH_DASHBOARD="${WITH_DASHBOARD:-0}"
DASHBOARD_PKG="luci-app-proton2025-dashboard"

# apk or opkg is fixed when the firmware is built, not by the release number.
PKG_IS_APK=0
command -v apk >/dev/null 2>&1 && PKG_IS_APK=1

DOWNLOADER=""
ASSET_URL=""
ASSET_FILE=""

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

check_system() {
    if [ -f /etc/openwrt_release ]; then
        . /etc/openwrt_release
        ok "Detected: ${DISTRIB_DESCRIPTION}"
    else
        warn "This doesn't appear to be an OpenWrt system, continuing anyway"
    fi

    if command -v wget >/dev/null 2>&1; then
        DOWNLOADER="wget"
    elif command -v curl >/dev/null 2>&1; then
        DOWNLOADER="curl"
    else
        err "Neither wget nor curl found. Install one of them first:"
        printf "  opkg update && opkg install wget-ssl\n"
        printf "  apk update && apk add wget\n"
        exit 1
    fi

    if [ "$PKG_IS_APK" -eq 1 ]; then
        ok "Package manager: apk"
    elif command -v opkg >/dev/null 2>&1; then
        ok "Package manager: opkg"
    else
        err "Neither apk nor opkg found, cannot install a package"
        exit 1
    fi
}

fetch() {
    if [ "$DOWNLOADER" = "curl" ]; then
        curl -fsSL "$1" 2>/dev/null || true
    else
        wget -qO- "$1" 2>/dev/null || true
    fi
}

# The ipk and apk assets don't share a naming scheme, so the exact file name is
# taken from the release metadata instead of a wildcard URL.
resolve_asset() {
    info "Looking up the latest release..."

    ext="ipk"
    [ "$PKG_IS_APK" -eq 1 ] && ext="apk"

    response=$(fetch "$API_URL")

    if echo "$response" | grep -q "API rate limit"; then
        warn "GitHub API rate limit reached, using the releases feed instead"
        response=""
    fi

    ASSET_URL=$(printf "%s" "$response" |
        grep -o "https://[^\"]*${PKG_NAME}[^\"]*\.${ext}" | head -n1)

    if [ -z "$ASSET_URL" ]; then
        tag=$(fetch "$ATOM_URL" | grep -o "releases/tag/[^\"]*" | head -n1 | sed 's|.*/||')

        if [ -z "$tag" ]; then
            err "Could not determine the latest release"
            err "Download the package manually: https://github.com/${REPO}/releases"
            exit 1
        fi

        version="${tag#v}"

        if [ "$PKG_IS_APK" -eq 1 ]; then
            ASSET_URL="https://github.com/${REPO}/releases/download/${tag}/${PKG_NAME}-${version}-r1.apk"
        else
            ASSET_URL="https://github.com/${REPO}/releases/download/${tag}/${PKG_NAME}_${version}_all.ipk"
        fi
    fi

    ASSET_FILE="${DOWNLOAD_DIR}/$(basename "$ASSET_URL")"
    ok "Release asset: $(basename "$ASSET_URL")"
}

download_asset() {
    rm -rf "$DOWNLOAD_DIR"
    mkdir -p "$DOWNLOAD_DIR"

    attempt=1
    while [ "$attempt" -le "$ATTEMPTS" ]; do
        info "Downloading package (attempt ${attempt}/${ATTEMPTS})..."

        if [ "$DOWNLOADER" = "curl" ]; then
            curl -fsSL -o "$ASSET_FILE" "$ASSET_URL" || true
        else
            wget -q -O "$ASSET_FILE" "$ASSET_URL" || true
        fi

        if [ -s "$ASSET_FILE" ]; then
            ok "Downloaded successfully"
            return 0
        fi

        rm -f "$ASSET_FILE"
        attempt=$((attempt + 1))
    done

    err "Download failed: $ASSET_URL"
    err "On an SSL error install the CA bundle first:"
    printf "  opkg update && opkg install ca-bundle ca-certificates\n"
    printf "  apk update && apk add ca-bundle ca-certificates\n"
    exit 1
}

install_package() {
    info "Installing ${PKG_NAME}..."

    if [ "$PKG_IS_APK" -eq 1 ]; then
        # Release packages aren't signed by an OpenWrt feed key.
        apk add --allow-untrusted "$ASSET_FILE"
    else
        opkg install "$ASSET_FILE"
    fi

    ok "Package installed"
}

install_dashboard() {
    [ "$WITH_DASHBOARD" = "1" ] || return 0

    warn "${DASHBOARD_PKG} is not published yet, installed the theme only"
    warn "Re-run this command with WITH_DASHBOARD=1 once the package is released"
}

# The package registers the theme, but doesn't switch LuCI over to it.
activate_theme() {
    if ! command -v uci >/dev/null 2>&1; then
        warn "uci not found, select the theme manually in Language and Style"
        return 0
    fi

    uci set luci.main.mediaurlbase="/luci-static/$THEME_NAME"
    uci commit luci
    ok "Set as active LuCI theme"

    if [ -x /etc/init.d/uhttpd ]; then
        /etc/init.d/uhttpd reload >/dev/null 2>&1 || /etc/init.d/uhttpd restart >/dev/null 2>&1 || true
    fi
}

cleanup() {
    rm -rf "$DOWNLOAD_DIR"
}

main() {
    check_system
    resolve_asset
    download_asset
    install_package
    activate_theme
    install_dashboard
    cleanup

    printf "\n"
    printf "================================================\n"
    printf "    Installation Complete!\n"
    printf "================================================\n"
    printf "\n"
    printf "  [*] Refresh your browser (Ctrl+F5)\n"
    printf "  [*] Settings: System -> System -> Language and Style\n"
    printf "\n"
}

main
