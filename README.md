# luci-theme-proton2025

Элегантная тёмная тема для LuCI (OpenWrt 23.x+).

![OpenWrt](https://img.shields.io/badge/OpenWrt-23.x%2B-blue)
![LuCI](https://img.shields.io/badge/LuCI-ucode-green)
![License](https://img.shields.io/badge/License-Apache%202.0-orange)

## Скриншот

![LuCI Status](docs/status.png)

## Особенности

- 🌙 Тёмный glass/blur дизайн
- 🎨 Единая система CSS-переменных для кастомизации
- 📱 Адаптивная вёрстка
- ⚡ Совместимость с LuCI ucode (OpenWrt 23.x+)

## Установка

### Быстрый тест (без сборки .ipk)

```bash
# Скопируй файлы на роутер (замени 192.168.1.1 на IP роутера)
scp -r ./ucode/template/themes/proton2025 root@192.168.1.1:/usr/share/ucode/luci/template/themes/
scp -r ./htdocs/luci-static/proton2025 root@192.168.1.1:/www/luci-static/
scp ./htdocs/luci-static/resources/menu-proton2025.js root@192.168.1.1:/www/luci-static/resources/

# Активируй тему
ssh root@192.168.1.1 "uci set luci.themes.Proton2025=/luci-static/proton2025; \
  uci set luci.main.mediaurlbase=/luci-static/proton2025; \
  uci commit luci; /etc/init.d/uhttpd restart"
```

### Сборка .ipk (OpenWrt Buildroot)

```bash
cp -r luci-theme-proton2025 ~/openwrt/feeds/luci/themes/
cd ~/openwrt
./scripts/feeds update -a && ./scripts/feeds install -a
make menuconfig  # LuCI -> Themes -> luci-theme-proton2025
make package/luci-theme-proton2025/compile V=s
```

## Откат на стандартную тему

```sh
uci set luci.main.mediaurlbase=/luci-static/bootstrap
uci commit luci
/etc/init.d/uhttpd restart
```

## Структура

```
luci-theme-proton2025/
├── Makefile
├── htdocs/luci-static/
│   ├── proton2025/
│   │   ├── cascade.css
│   │   ├── logo.svg
│   │   └── spinner.svg
│   └── resources/menu-proton2025.js
├── root/etc/uci-defaults/30_luci-theme-proton2025
└── ucode/template/themes/proton2025/
    ├── header.ut
    ├── footer.ut
    └── sysauth.ut
```

## Лицензия

Apache-2.0
