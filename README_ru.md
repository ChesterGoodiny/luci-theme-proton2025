# luci-theme-proton2025

Тёмная тема для LuCI (OpenWrt 23.05+, ucode) с опциональным светлым режимом,
встроенным поиском по страницам и настройками темы прямо в интерфейсе LuCI.

![OpenWrt](https://img.shields.io/badge/OpenWrt-23.05%2B-blue)
![LuCI](https://img.shields.io/badge/LuCI-ucode-green)
![License](https://img.shields.io/badge/License-Apache%202.0-orange)

<div align="center">
  <img src="docs/status.png" alt="Страница Status с темой Proton2025" width="80%" />
  <img src="docs/status-sidebar.png" alt="Страница Status с боковой панелью Proton2025" width="80%" />
</div>

<details>
<summary>Больше скриншотов</summary>

<div align="center">
  <img src="docs/settings.png" alt="Настройки темы" width="48%" />
  <img src="docs/temperature.png" alt="Страница температуры" width="48%" />
  <img src="docs/system-log.png" alt="Системный журнал с подсветкой" width="48%" />
  <img src="docs/wireless.png" alt="Беспроводные сети" width="48%" />
  <img src="docs/interfaces.png" alt="Сетевые интерфейсы" width="48%" />
  <img src="docs/login.png" alt="Страница входа" width="48%" />
</div>

<div align="center">
  <img src="docs/status-mobile.png" alt="Страница Status на мобильном" width="23%" />
  <img src="docs/settings-mobile.png" alt="Настройки темы на мобильном" width="23%" />
  <img src="docs/temperature-mobile.png" alt="Страница температуры на мобильном" width="23%" />
  <img src="docs/login-mobile.png" alt="Страница входа на мобильном" width="23%" />
</div>

</details>

## Требования

- OpenWrt 23.05 или новее с LuCI на ucode (`luci-base`)
- Пакет не зависит от архитектуры — одна сборка подходит любому устройству
- Доступ по SSH под root

## Установка

Одна команда по SSH. Всё остальное скрипт определяет сам: какой менеджер пакетов
в прошивке (`apk` или `opkg`), текущий релиз, точное имя файла для этого формата,
после чего ставит пакет и переключает LuCI на тему.

**Только тема:**

```sh
wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/install.sh | sh
```

**Тема вместе с виджетами дашборда:**

```sh
wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/install.sh | WITH_DASHBOARD=1 sh
```

Виджеты на Status → Overview больше не часть темы — они выделяются в отдельный пакет
`luci-app-proton2025-dashboard`. Пакет пока не опубликован, поэтому вторая команда
сейчас ставит только тему и сообщает об этом. После релиза дашборда та же
команда будет подтягивать его автоматически.

После установки обновите страницу LuCI через Ctrl+F5. Если хочется поставить пакет
вручную, возьмите точное имя файла со страницы
[Releases](https://github.com/ChesterGoodiny/luci-theme-proton2025/releases): `.apk`, если
`command -v apk` выводит путь, иначе `.ipk`.

## Обновление

Запустите команду установки ещё раз либо обновите тему из её же интерфейса:
**System → System → Language and Style → Инструменты → Проверить обновления**.

Настройки хранятся в `/etc/config/proton2025` и сохраняются при обновлении.

## Удаление

```sh
wget -qO- https://raw.githubusercontent.com/ChesterGoodiny/luci-theme-proton2025/main/uninstall.sh | sh
```

Скрипт возвращает LuCI на штатную тему, удаляет пакет и оставшиеся файлы,
после чего перезапускает веб-сервер. `/etc/config/proton2025` остаётся на месте,
так что повторная установка подхватит ваши настройки.

## Настройки темы

**System → System → Language and Style**, четыре вкладки:

| Вкладка     | Содержит                                                                                                                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Внешний вид | Режим темы (авто / тёмный / светлый), акцентный цвет (нейтральный, синий, фиолетовый, зелёный, оранжевый или свой hex), скругление углов, обводка вкладок, фоновый узор (нет / сетка / точки / звёзды), анимации, прозрачность и размытие |
| Макет       | Масштаб фонового узора, масштаб интерфейса, ширина страницы (50–100%), расположение меню на десктопе (верхняя панель или боковая)                                                                                                         |
| Функции     | Подсветка системного журнала, встроенный шрифт Inter, клиентская навигация (SPA — экспериментальная, по умолчанию выключена)                                                                                                              |
| Инструменты | Проверка и установка обновлений, индекс поиска (сборка, очистка, размер, журнал активности), резервная копия и восстановление настроек, сброс к значениям по умолчанию                                                                    |

Настройки пишутся дважды: в `localStorage` — чтобы применяться без мерцания
нестилизованной страницы, и в UCI (`/etc/config/proton2025`) — чтобы следовать за
роутером, а не за браузером, и попадать в `sysupgrade -b`.

## Поиск

В верхней панели есть поле поиска по страницам, вкладкам и отдельным настройкам
LuCI. Он терпим к опечаткам, понимает перепутанную раскладку RU/LAT и
транслитерацию. Индекс страниц собирается по требованию в **Инструменты → Индекс
поиска** и кэшируется на роутере.

## Прочие возможности

- Status → Realtime → **Температура** — страница самой темы, читающая
  `/sys/class/thermal/` и `/sys/class/hwmon/` через собственный ucode RPC-модуль,
  без внешних зависимостей
- Load Average с цветовой индикацией и прогресс-барами на странице состояния
- Автоматическая стилизация сторонних пакетов и кастомных страниц
- 10 языков интерфейса: EN, RU, ZH, DE, UK, ES, PT, PL, FR, IT

Виджеты сервисов, температуры и трафика на Status → Overview больше не входят в
тему — они переезжают в отдельный пакет `luci-app-proton2025-dashboard`, который
пока не опубликован. Тема только оформляет их и переносит их настройки через
резервную копию.

## Устранение неполадок

**`404 Not Found`, либо `opkg`/`apk` сообщает об отсутствующем файле или
`no such package`.** В URL, набранном вручную, был `*` — `wget` не раскрывает
маски, поэтому на GitHub уходит буквальная звёздочка. Используйте команду
установки выше или точное имя файла со страницы Releases.

**`API rate limit exceeded`.** 60 неавторизованных запросов к API GitHub в час на
IP. Скрипт переключается на фид релизов, у которого нет лимита; иначе подождите
или скачайте файл вручную.

**`SSL certificate verification failed` / `wget: bad address`.** На роутере ещё
нет набора корневых сертификатов:

```sh
opkg update && opkg install ca-bundle ca-certificates
```

```sh
apk update && apk add ca-bundle ca-certificates
```

**После обновления видны старые стили или иконки.** Это кэш браузера. Жёсткая
перезагрузка Ctrl+F5 (Cmd+Shift+R на macOS).

**LuCI по-прежнему рисует штатную тему.** Проверьте, куда указывает LuCI и на
месте ли файлы:

```sh
uci get luci.main.mediaurlbase   # ожидается: /luci-static/proton2025
ls -l /www/luci-static/proton2025
logread | grep -i uhttpd
```

Если путь неверный, задайте его и перезапустите веб-сервер:

```sh
uci set luci.main.mediaurlbase=/luci-static/proton2025
uci commit luci
/etc/init.d/uhttpd restart
```

**`/bin/sh^M: bad interpreter`.** Скрипт сохранён с windows-переводами строк
(CRLF). Исправляется на месте:

```sh
sed -i 's/\r$//' install.sh
```

**`apk` не принимает пакет.** Валидны только пакеты, собранные OpenWrt
SDK/buildroot; `tar.gz`, переименованный в `.apk`, установить нельзя. В релизах
до 1.1.2 лежали именно такие перепакованные файлы.

**Проверить, что установлено:**

```sh
opkg list-installed | grep -i proton2025
```

```sh
apk info -e luci-theme-proton2025
```

## Сборка из исходников

```bash
cd ~/openwrt
git clone https://github.com/ChesterGoodiny/luci-theme-proton2025 package/luci-theme-proton2025
./scripts/feeds update -a && ./scripts/feeds install -a
make menuconfig  # LuCI -> Themes -> luci-theme-proton2025
make package/luci-theme-proton2025/compile V=s
```

Пакет появится в `bin/packages/*/` — как `.ipk` при SDK на базе opkg или как
`.apk` при SDK на базе apk (`CONFIG_USE_APK=y`). `tar.gz`, переименованный в
`.apk`, валидным пакетом не является.

## Структура проекта

```
htdocs/luci-static/proton2025/     # ресурсы темы: css/, js/, i18n/, img/, icons/, fonts/
htdocs/luci-static/resources/      # модули со стороны LuCI: меню, дропдауны, индекс поиска,
                                   # настройки темы, SPA-роутер,
                                   # view/status/proton-temperature.js
ucode/template/themes/proton2025/  # header.ut, footer.ut, sysauth.ut
root/etc/config/proton2025         # настройки UCI (conffile — сохраняется при обновлении)
root/usr/share/luci/menu.d/        # пункт меню для страницы Температура
root/usr/share/rpcd/ucode/         # RPC: proton-search-cache, proton-settings,
                                   # proton-system, proton-temp
install.sh / uninstall.sh          # установка и удаление одной командой
```

## Лицензия

Apache-2.0

Copyright 2025-2026 ChesterGoodiny.

Иконки и встроенные SVG-ассеты проекта являются оригинальными first-party ресурсами и покрываются Apache-2.0.

Подробности по лицензии и атрибуции проекта см. в LICENSE и NOTICE.

### Сторонние ресурсы

Эта тема включает следующие сторонние ресурсы:

- **Шрифт Inter** - Copyright 2020 The Inter Project Authors (https://github.com/rsms/inter)
  - Лицензия: SIL Open Font License 1.1
  - Файл лицензии: `htdocs/luci-static/proton2025/fonts/LICENSE.txt`
  - Используется для единообразной типографики на всех платформах

### Благодарности

- Опциональный режим SPA (навигация внутри одного документа) заимствует часть
  идей у [luci-theme-footstrap](https://github.com/VizzleTF/luci-theme-footstrap),
  который первым реализовал клиентскую навигацию для тем LuCI. К мысли перенести
  этот подход в свою тему я пришёл, увидев, как его переняли темы Aurora и Shadcn
  (eamonxg). Роутер proton2025 — независимая реализация на базе браузерного
  Navigation API.
- Логика разрешения alias/firstchild портирована из штатного `dispatcher.uc`
  LuCI (luci-base, Apache-2.0), чтобы клик по ссылке и перезагрузка страницы
  разрешались в точности в одну и ту же view.
- Спасибо репозиторию [lastik9/openwrt-luci-theme-proton2025](https://github.com/lastik9/openwrt-luci-theme-proton2025)
  за помощь в выявлении проблем старых инструкций по установке и создании
  более простого сценария установки.

## Статистика

<a href="https://www.star-history.com/?repos=ChesterGoodiny%2Fluci-theme-proton2025&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ChesterGoodiny/luci-theme-proton2025&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ChesterGoodiny/luci-theme-proton2025&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=ChesterGoodiny/luci-theme-proton2025&type=date&legend=top-left" />
 </picture>
</a>
