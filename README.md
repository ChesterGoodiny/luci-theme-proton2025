# luci-theme-proton2025

An elegant LuCI theme (OpenWrt 23.x+) with a dark design and optional light mode.

![OpenWrt](https://img.shields.io/badge/OpenWrt-23.x%2B-blue)
![LuCI](https://img.shields.io/badge/LuCI-ucode-green)
![License](https://img.shields.io/badge/License-Apache%202.0-orange)

## Screenshots

### LuCI Status

<div align="center">
  <img src="docs/status.png" alt="LuCI Status" />
</div>

### Services monitoring widget

<div align="center">
  <img src="docs/widgets-dashboard.png" alt="Widgets and Monitoring Dashboard" />
</div>

### Theme Settings

<div align="center">
  <img src="docs/settings.png" alt="Theme Settings" />
</div>

## Features

- 🌙 Dark glass/blur design
- 🎨 Customizable accent color, border radius, zoom
- 📱 Responsive layout for mobile devices
- ⚡ Compatible with LuCI ucode (OpenWrt 23.x+)
- 📊 Services monitoring widget on Status → Overview page
- 🌡️ Temperature monitoring widget with thermal sensors
- 📈 Elegant Load Average visualization with color-coded progress bars
- 🌐 Multi-language support (9 languages: EN, RU, ZH, DE, UK, ES, PT, PL, FR, IT)
- 🔄 Settings sync across browsers/devices (localStorage + UCI)

## Widgets

### Services Widget

The main page (Status → Overview) displays a widget showing system service statuses:

- Status visualization (Running/Stopped)
- Add services via modal or custom input
- Settings saved in browser

### Temperature Widget

Real-time temperature monitoring on Status → Overview:

- Reads data from `/sys/class/thermal/` and `/sys/class/hwmon/`
- Color-coded levels (Normal, Warm, Hot, Critical)
- Peak temperature tracking
- Auto-refresh every 5 seconds
- Built-in ucode RPC module (no external dependencies)

## Theme Settings

Available at **System → System → Language and Style**:

- Theme mode (Dark/Light)
- Accent color (Blue, Purple, Green, Orange, Red)
- Border radius
- Interface zoom
- Animations and transparency
- Services widget (enable/disable, grouping, log)
- Temperature widget (enable/disable)
- Table text wrap (for Wireless Associated Stations)

### Settings Synchronization

Theme settings are stored using a hybrid approach:

- **localStorage** — instant application without flickering
- **UCI** (`/etc/config/proton2025`) — persistent storage, syncs across browsers/devices

Benefits:

- Settings are included in router backup (`sysupgrade -b`)
- Works across different browsers and devices
- Instant UI updates without page reload

## Installation

### Recommended: Install from IPK Package

Download the latest release (`*_all.ipk` is universal and works on any architecture):

```bash
wget https://github.com/ChesterGoodiny/luci-theme-proton2025/releases/latest/download/luci-theme-proton2025_*_all.ipk
opkg install luci-theme-proton2025_*_all.ipk
```

Or download from [GitHub Releases](https://github.com/ChesterGoodiny/luci-theme-proton2025/releases) manually.

If you updated and don’t see changes (e.g. icons), do a hard refresh (Ctrl+F5) or clear the browser cache.

**Benefits:**

- ✅ Includes compiled translations
- ✅ Proper package management (easy updates/removal)
- ✅ Dependency tracking

### Quick Install (Testing Only)

> ⚠️ **Note:** This method is intended for testing purposes. Translations may not work if the release has not yet been created on GitHub.

```bash
wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/install.sh | sh
```

Or:

```bash
curl -fsSL https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/install.sh | sh
```

### Building .ipk from Source

```bash
cp -r luci-theme-proton2025 ~/openwrt/feeds/luci/themes/
cd ~/openwrt
./scripts/feeds update -a && ./scripts/feeds install -a
make menuconfig  # LuCI -> Themes -> luci-theme-proton2025
make package/luci-theme-proton2025/compile V=s
```

## Removal

```bash
wget -O uninstall.sh https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/uninstall.sh
chmod +x uninstall.sh
./uninstall.sh
```

### Revert to Default Theme

```sh
uci set luci.main.mediaurlbase=/luci-static/bootstrap
uci commit luci
/etc/init.d/uhttpd restart
```

## Structure

```
luci-theme-proton2025/
├── Makefile
├── htdocs/luci-static/
│   ├── proton2025/
│   │   ├── cascade.css
│   │   ├── services-widget.js
│   │   ├── settings-sync.js
│   │   ├── translations.js
│   │   ├── icons/
│   │   ├── logo.svg
│   │   └── spinner.svg
│   └── resources/menu-proton2025.js
├── root/
│   ├── etc/
│   │   ├── config/proton2025
│   │   └── uci-defaults/30_luci-theme-proton2025
│   └── usr/share/rpcd/
│       ├── acl.d/luci-theme-proton2025.json
│       └── ucode/
│           ├── luci.proton-temp
│           └── luci.proton-settings
└── ucode/template/themes/proton2025/
    ├── header.ut
    ├── footer.ut
    └── sysauth.ut
```

## License

Apache-2.0

## Stargazers over time

[![Stargazers over time](https://starchart.cc/ChesterGoodiny/luci-theme-proton2025.svg?variant=adaptive)](https://starchart.cc/ChesterGoodiny/luci-theme-proton2025)
