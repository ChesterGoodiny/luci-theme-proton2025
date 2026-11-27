#!/bin/sh
# shellcheck shell=ash
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
DOWNLOAD_DIR=""
ATTEMPTS=3
CONNECT_TIMEOUT=15
DOWNLOAD_TIMEOUT=120
AUTO_INSTALL_CURL="${AUTO_INSTALL_CURL:-1}"
CURL_INSTALL_ATTEMPTED=0

# Dashboard widgets live in a separate package that isn't released yet.
WITH_DASHBOARD="${WITH_DASHBOARD:-0}"
DASHBOARD_PKG="luci-app-proton2025-dashboard"

# apk or opkg is fixed when the firmware is built, not by the release number.
PKG_IS_APK=0
command -v apk >/dev/null 2>&1 && PKG_IS_APK=1

DOWNLOADER=""
FETCH_RESPONSE=""
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
        # shellcheck source=/dev/null
        . /etc/openwrt_release
        ok "Detected: ${DISTRIB_DESCRIPTION}"
    else
        warn "This doesn't appear to be an OpenWrt system, continuing anyway"
    fi

    if [ "$PKG_IS_APK" -eq 1 ]; then
        ok "Package manager: apk"
    elif command -v opkg >/dev/null 2>&1; then
        ok "Package manager: opkg"
    else
        err "Neither apk nor opkg found, cannot install a package"
        exit 1
    fi

    if command -v wget >/dev/null 2>&1; then
        DOWNLOADER="wget"
    elif command -v curl >/dev/null 2>&1; then
        DOWNLOADER="curl"
    elif ensure_curl; then
        DOWNLOADER="curl"
    else
        err "No usable downloader available"
        exit 1
    fi

    ok "Primary downloader: $DOWNLOADER"
}

ensure_curl() {
    if command -v curl >/dev/null 2>&1; then
        return 0
    fi

    if [ "$AUTO_INSTALL_CURL" != "1" ]; then
        warn "Automatic curl installation is disabled"
        return 1
    fi

    if [ "$CURL_INSTALL_ATTEMPTED" -eq 1 ]; then
        return 1
    fi

    CURL_INSTALL_ATTEMPTED=1

    warn "curl is not installed"

    if [ "$PKG_IS_APK" -eq 1 ]; then
        info "Installing curl using apk..."

        if ! apk add curl; then
            warn "Initial installation failed, updating package indexes..."

            if apk update; then
                apk add curl || return 1
            else
                return 1
            fi
        fi
    else
        info "Installing curl using opkg..."

        if ! opkg install curl; then
            warn "Initial installation failed, updating package indexes..."

            if opkg update; then
                opkg install curl || return 1
            else
                return 1
            fi
        fi
    fi

    if command -v curl >/dev/null 2>&1; then
        ok "curl installed successfully"
        return 0
    fi

    err "curl installation failed"
    return 1
}

download_with() {
    local method="$1"
    local url="$2"
    local output="$3"
    local status

    rm -f "$output"

    info "Downloading using $method..."

    if [ "$method" = "curl" ]; then
        if curl -fsSL \
            --connect-timeout "$CONNECT_TIMEOUT" \
            --max-time "$DOWNLOAD_TIMEOUT" \
            -o "$output" "$url"; then
            status=0
        else
            status=$?
        fi
    else
        set --
        if wget --version 2>/dev/null | grep -q "GNU Wget"; then
            set -- -t 1
        fi

        if wget "$@" -T "$CONNECT_TIMEOUT" -O "$output" "$url"; then
            status=0
        else
            status=$?
        fi
    fi

    if [ "$status" -eq 0 ] && [ -s "$output" ]; then
        return 0
    fi

    if [ "$status" -ne 0 ]; then
        warn "$method failed (exit code: $status)"
    else
        warn "$method returned an empty file"
    fi

    rm -f "$output"
    return 1
}

download_with_fallback() {
    local url="$1"
    local output="$2"
    local primary="$DOWNLOADER"
    local fallback

    if download_with "$primary" "$url" "$output"; then
        return 0
    fi

    if [ "$primary" = "wget" ]; then
        if ! ensure_curl; then
            warn "curl fallback is unavailable"
            return 1
        fi
        fallback="curl"
    else
        if ! command -v wget >/dev/null 2>&1; then
            warn "wget fallback is unavailable"
            return 1
        fi
        fallback="wget"
    fi

    warn "$primary failed, falling back to $fallback..."

    if download_with "$fallback" "$url" "$output"; then
        DOWNLOADER="$fallback"
        return 0
    fi

    return 1
}

fetch() {
    local url="$1"
    local output="${DOWNLOAD_DIR}/release-metadata"

    FETCH_RESPONSE=""

    if download_with_fallback "$url" "$output"; then
        FETCH_RESPONSE=$(cat "$output")
        rm -f "$output"
        return 0
    fi

    rm -f "$output"
    return 1
}

# The ipk and apk assets don't share a naming scheme, so the exact file name is
# taken from the release metadata instead of a wildcard URL.
resolve_asset() {
    info "Looking up the latest release..."

    ext="ipk"
    [ "$PKG_IS_APK" -eq 1 ] && ext="apk"

    response=""
    if fetch "$API_URL"; then
        response="$FETCH_RESPONSE"
    fi

    if echo "$response" | grep -q "API rate limit"; then
        warn "GitHub API rate limit reached, using the releases feed instead"
        response=""
    fi

    ASSET_URL=$(printf "%s" "$response" |
        grep -o "https://[^\"]*${PKG_NAME}[^\"]*\.${ext}" | head -n1)

    if [ -z "$ASSET_URL" ]; then
        tag=""
        if fetch "$ATOM_URL"; then
            tag=$(printf "%s" "$FETCH_RESPONSE" |
                grep -o "releases/tag/[^\"]*" | head -n1 | sed 's|.*/||')
        fi

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
    local attempt=1

    while [ "$attempt" -le "$ATTEMPTS" ]; do
        info "Downloading package (attempt ${attempt}/${ATTEMPTS})..."

        if download_with_fallback "$ASSET_URL" "$ASSET_FILE"; then
            ok "Downloaded successfully using $DOWNLOADER"
            return 0
        fi

        attempt=$((attempt + 1))
    done

    err "Download failed: $ASSET_URL"
    err "Check network connectivity and the downloader errors above."
    err "On an SSL error install the CA bundle first:"

    if [ "$PKG_IS_APK" -eq 1 ]; then
        printf "  apk update && apk add ca-bundle ca-certificates\n"
    else
        printf "  opkg update && opkg install ca-bundle ca-certificates\n"
    fi

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
    if [ -n "$DOWNLOAD_DIR" ]; then
        rm -rf "$DOWNLOAD_DIR"
    fi
}

main() {
    DOWNLOAD_DIR=$(mktemp -d /tmp/proton2025-install.XXXXXX)
    trap cleanup EXIT

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
