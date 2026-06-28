/**
 * Proton2025 Theme - Translations
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 * Локализация для JavaScript компонентов темы
 */

window.ProtonTranslations = {
  ru: {
    // Services Widget - Header
    "Services Monitor": "Мониторинг сервисов",
    "Widget Settings": "Настройки виджетов",
    "Add Service": "Добавить сервис",
    Services: "Сервисы",
    Widgets: "Виджеты",
    Ready: "Готов",

    // Empty state
    "Click ⚙ to add services": "Нажмите ⚙ для добавления сервисов",

    // Categories
    "My Services": "Мои сервисы",
    Network: "Сеть",
    Security: "Безопасность",
    VPN: "VPN",
    "Ad Blocking": "Блокировка рекламы",
    System: "Система",
    Other: "Другое",

    // Service descriptions
    "DNS and DHCP server": "DNS и DHCP сервер",
    Firewall: "Межсетевой экран",
    "Network interfaces": "Сетевые интерфейсы",
    "LuCI web server": "Веб-сервер LuCI",
    "DHCPv6 server": "DHCPv6 сервер",
    "SSH access": "SSH доступ",
    "Time sync": "Синхронизация времени",
    "Task scheduler": "Планировщик задач",
    "VPN service": "VPN сервис",
    "Ad blocking": "Блокировка рекламы",
    "System service": "Системный сервис",

    // Status (uppercase - for badges)
    RUNNING: "РАБОТАЕТ",
    STOPPED: "ОСТАНОВЛЕН",
    UNKNOWN: "НЕИЗВЕСТНО",

    // Status (capitalized - for logs)
    Running: "Работает",
    Stopped: "Остановлен",
    Error: "Ошибка",
    Unknown: "Неизвестно",
    Disabled: "Отключён",
    "Checking...": "Проверка...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "Мониторинг и управление системными сервисами. Нажмите на карточку сервиса для просмотра деталей и управления.",

    // Actions
    Start: "Запустить",
    Stop: "Остановить",
    Restart: "Перезапустить",
    Enable: "Включить",
    Disable: "Отключить",
    Remove: "Убрать",
    Cancel: "Отмена",
    Add: "Добавить",
    Close: "Закрыть",
    Reset: "Сброс",

    // Reboot confirmation
    "Confirm Reboot": "Подтвердите перезагрузку",
    "Are you sure you want to reboot the system?":
      "Вы уверены, что хотите перезагрузить систему?",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "Это действие перезапустит ваш роутер и временно прервет сетевое соединение.",
    "Reboot Now": "Перезагрузить",

    // Modal - service list
    "Available services": "Доступные сервисы",
    "Selected services": "Выбранные сервисы",
    "Search...": "Поиск...",
    "Semantic search...": "Семантический поиск...",
    "No results found": "Ничего не найдено",
    "No semantic matches": "Ничего не найдено по смыслу",
    "Enable semantic search": "Включить семантический поиск",
    "Disable semantic search": "Выключить семантический поиск",
    "Search services...": "Поиск сервисов...",
    "Search or add custom service...": "Поиск или добавление сервиса...",
    Search: "Поиск",
    "Opening service list...": "Открытие списка сервисов...",
    "Custom service name": "Имя сервиса",
    "Enter custom service name...": "Введите имя сервиса...",
    "Add custom service": "Добавить свой сервис",
    "No services found": "Сервисы не найдены",
    "Service not found in system": "Сервис не найден в системе",
    "as custom": "как свой",
    "Or press Enter": "Или нажмите Enter",
    "already added": "уже добавлен",
    custom: "свой",

    // Modal - validation
    "Letters, numbers, dash, underscore only":
      "Только буквы, цифры, дефис, подчёркивание",
    "Name too long (max 64 chars)": "Имя слишком длинное (макс. 64 символа)",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "Недопустимые символы! Используйте: a-z, 0-9, -, _",
    "Already in your list": "Уже в вашем списке",
    "Found in system": "Найден в системе",
    "Custom service (not found in system)":
      "Пользовательский сервис (не найден в системе)",
    "Added successfully!": "Успешно добавлено!",
    "Not installed": "Не установлен",
    Added: "Добавлено",
    Removed: "Удалено",

    // Loading states
    "Waiting for LuCI API...": "Ожидание LuCI API...",
    "Loading...": "Загрузка...",
    "Loading services...": "Загрузка сервисов...",
    "Checking services...": "Проверка сервисов...",
    "Services loaded": "Сервисы загружены",
    "Check complete": "Проверка завершена",

    // init.d
    "init.d services": "Сервисы init.d",
    "Warning: init.d list empty": "Внимание: список init.d пуст",

    // Messages
    "Service started": "Сервис запущен",
    "Service stopped": "Сервис остановлен",
    "Service restarted": "Сервис перезапущен",
    "Service enabled": "Сервис включён",
    "Service disabled": "Сервис отключён",
    Success: "Успешно",

    // Empty state
    "No services selected": "Сервисы не выбраны",
    "Click + to add services": "Нажмите + чтобы добавить",

    // Theme Settings
    "Proton2025 Theme Settings": "Настройки темы Proton2025",
    "Theme Mode": "Режим темы",
    Auto: "Авто",
    Dark: "Тёмный",
    Light: "Светлый",
    "Choose light, dark, or follow system theme":
      "Выберите светлую, тёмную тему или следование системной теме",
    "Choose light or dark theme": "Выберите светлую или тёмную тему",
    "Accent Color": "Акцентный цвет",
    "Choose theme accent color": "Выберите акцентный цвет темы",
    Custom: "Свой",
    "Custom Color": "Свой цвет",
    "Pick a color or enter a HEX value (#rrggbb)":
      "Выберите цвет или введите HEX-значение (#rrggbb)",
    Blue: "Синий",
    Purple: "Фиолетовый",
    Green: "Зелёный",
    Orange: "Оранжевый",
    Red: "Красный",
    Default: "По умолчанию",
    "Border Radius": "Скругление углов",
    "Corner rounding style": "Стиль скругления углов",
    Sharp: "Острые",
    Rounded: "Скруглённые",
    "Extra Rounded": "Сильно скруглённые",
    Zoom: "Масштаб",
    "Interface scale": "Масштаб интерфейса",
    "Page Width": "Ширина страницы",
    "Content area width": "Ширина области контента",
    "Full width": "Во всю ширину",
    Animations: "Анимации",
    "Enable smooth transitions and effects":
      "Включить плавные переходы и эффекты",
    Transparency: "Прозрачность",
    "Enable blur and transparency effects":
      "Включить эффекты размытия и прозрачности",
    "Services Widget": "Виджет сервисов",
    "Show services monitor on Overview page":
      "Показывать монитор сервисов на странице обзора",
    "Temperature Widget": "Виджет температуры",
    "Show temperature monitor on Overview page":
      "Показывать монитор температуры на странице обзора",
    "Deep Service Check": "Глубокая проверка сервисов",
    "Accurate status for adblock, banip, etc.":
      "Точный статус для adblock, banip и подобных",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "Виджет температуры включён. Перейдите в Статус → Обзор, чтобы увидеть его.",
    "Temperature widget disabled.": "Виджет температуры отключён.",
    "Widget Log": "Лог виджета",
    "Show activity log under the widget":
      "Показывать лог активности под виджетом",
    "Table Text Wrap": "Перенос текста (Wireless)",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "Переносить длинные имена AP в таблице Associated Stations. Отключите для обрезки с многоточием.",
    "Log Highlighting": "Подсветка логов",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "Кастомный просмотрщик логов с подсветкой синтаксиса, нумерацией строк и панелью инструментов на страницах Системного журнала и Журнала ядра.",
    "Custom Font (Inter)": "Шрифт Inter",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "Использовать встроенный шрифт Inter для единообразного отображения текста на всех устройствах. Отключите, чтобы использовать системный шрифт.",
    "Proton2025 Update": "Обновление Proton2025",
    "Check for Updates": "Проверить обновления",
    "Open Release Page": "Открыть страницу релиза",
    "Install Update": "Установить обновление",
    "Installing...": "Установка...",
    "Installing Proton2025 update...": "Устанавливаем обновление Proton2025...",
    "Failed to install update.": "Не удалось установить обновление.",
    "Proton2025 update installed.": "Обновление Proton2025 установлено.",
    "Update installed, but a newer version is still available.": "Обновление установлено, но более новая версия всё ещё доступна.",
    "Current version": "Текущая версия",
    "Latest version": "Последняя версия",
    "Click the button to check for a new Proton2025 release.": "Нажмите кнопку, чтобы проверить наличие новой версии Proton2025.",
    "Loading...": "Загрузка...",
    "Checking...": "Проверка...",
    "Checking latest Proton2025 release...": "Проверяем последнюю версию Proton2025...",
    "Failed to check for updates.": "Не удалось проверить обновления.",
    "A new Proton2025 version is available.": "Доступна новая версия Proton2025.",
    "Proton2025 is up to date.": "Proton2025 обновлён до последней версии.",
    "Search Page Index": "Индекс страниц поиска",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "Вручную собирайте или очищайте кэшированный индекс поиска LuCI, когда меняется состав страниц меню.",
    "Indexed Data Size": "Размер индексированных данных",
    "Index Pages Now": "Индексировать сейчас",
    "Clear Indexed Data": "Очистить индексированные данные",
    "Search index is ready to be built.": "Индекс поиска готов к построению.",
    "Indexing in progress...": "Идёт индексация...",
    "Cancel Indexing": "Отменить индексацию",
    "Indexing canceled.": "Индексация остановлена.",
    "Indexing canceled": "Индексация остановлена",
    "You can start indexing again at any time.":
      "Вы можете запустить индексацию повторно в любой момент.",
    "Indexed routes": "Индексировано маршрутов",
    "Cached entries": "Записей в кэше",
    "Last indexed": "Последняя индексация",
    "Index errors": "Ошибки индексации",
    "Not indexed yet": "Ещё не индексировалось",
    "Search index updated successfully.": "Индекс поиска успешно обновлён.",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "Очистить индексированные данные поиска? Это удалит кэш поисковых страниц на роутере до следующего запуска индексации.",

    // Log Viewer UI
    lines: "строк",
    "crit.": "крит.",
    "err.": "ош.",
    "warn.": "пред.",
    "den.": "откл.",
    "disc.": "дисконн.",
    ok: "усп.",
    Critical: "Критические",
    Errors: "Ошибки",
    Warnings: "Предупреждения",
    Denied: "Отклонения",
    Disconnects: "Отключения",
    Successful: "Успешные",
    "Word Wrap": "Перенос строк",
    "Hide Timestamps": "Скрыть таймстампы",
    "Copy Log": "Копировать лог",
    "Download Log": "Скачать лог",
    "Scroll to Top": "В начало",
    "Scroll to Bottom": "В конец",
    "Fullscreen Mode": "Полноэкранный режим",
    "Exit Fullscreen": "Выйти из полноэкранного режима",

    "Services widget enabled. Visit Status → Overview to see it.":
      "Виджет сервисов включён. Перейдите в Статус → Обзор, чтобы увидеть его.",
    "Services widget disabled.": "Виджет сервисов отключён.",

    // Load Average
    "1 min": "1 мин",
    "5 min": "5 мин",
    "15 min": "15 мин",
    "1 MIN": "1 МИН",
    "5 MIN": "5 МИН",
    "15 MIN": "15 МИН",
    "System Load Average": "Средняя нагрузка системы",
    "Load Average": "Средняя нагрузка",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "Показывает количество процессов, ожидающих выполнения процессором. Три значения — за последние 1, 5 и 15 минут.",
    "Low load": "Низкая нагрузка",
    "Medium load": "Средняя нагрузка",
    "High load": "Высокая нагрузка",
    cores: "ядра",

    // Footer
    "Powered by": "Работает на",

    // Temperature Widget
    Temperature: "Температура",
    "Temperature Monitor": "Мониторинг температуры",
    "No temperature sensors found": "Датчики температуры не найдены",
    CPU: "Процессор",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "Плата",
    Normal: "Норма",
    Warm: "Тепло",
    Hot: "Горячо",
    Critical: "Критично",
    "Temperature normal": "Температура в норме",
    "Temperature elevated": "Температура повышена",
    "Temperature high": "Высокая температура",
    "Temperature critical": "Критическая температура",
    Sensor: "Датчик",
    Current: "Текущая",
    Peak: "Пик",
    s: "с",
    min: "мин",
    "5 min": "5 мин",
    "10 min": "10 мин",
    "15 min": "15 мин",
    "All sensors": "Все датчики",
    Sensors: "Датчики",
    Window: "Окно",
    Interval: "Интервал",
    "Data received at": "Данные получены в",
    "Last update": "Последнее обновление",
    "Temperature Realtime": "Температура в реальном времени",
    "Temperature history": "История температуры",
    "Temperature history chart": "График истории температуры",
    "Sensor statistics": "Статистика датчиков",
    "Point value": "Значение точки",
    "Change vs previous": "Изменение к прошлой точке",
    Minimum: "Минимум",
    Average: "Среднее",
    Status: "Статус",
    "Current reading": "Текущее значение",
    "Window average": "Среднее за окно",
    "Window minimum": "Минимум за окно",
    "Router peak": "Пик на роутере",
    "Sensors online": "Датчиков онлайн",
    "Current maximum": "Текущий максимум",
    "Average now": "Среднее сейчас",
    "Sensors above warm": "Датчиков выше нормы",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "Выберите датчик, чтобы смотреть понятную историю температуры. График хранит локальное скользящее окно, а пиковые значения приходят из текущей сессии rpcd на роутере.",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC временно недоступен. Показан последний успешно полученный снимок.",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC временно недоступен. Ожидание данных температуры...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "Мониторинг термодатчиков. Цвета означают: зелёный — норма, жёлтый — тепло, оранжевый — горячо, красный — критично.",

    // Backup & Restore
    "Backup & Restore": "Резервное копирование",
    "Export your theme settings to a file or import from a previously saved backup.":
      "Экспортируйте настройки темы в файл или импортируйте из ранее сохранённой копии.",
    "Export Settings": "Экспорт настроек",
    "Import Settings": "Импорт настроек",
    "Reset to Defaults": "Сбросить по умолчанию",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "Вы уверены, что хотите сбросить все настройки темы? Это действие нельзя отменить.",
    "Import Settings": "Импорт настроек",
    "Settings exported successfully": "Настройки успешно экспортированы",
    "Settings imported successfully": "Настройки успешно импортированы",
    "Invalid backup file": "Неверный файл резервной копии",
    "No settings found in file": "В файле не найдено настроек",
    "Failed to read backup file": "Ошибка чтения файла резервной копии",
    "Open package repository": "Открыть репозиторий пакетов",
  },

  zh: {
    // Services Widget - Header
    "Services Monitor": "服务监控",
    "Widget Settings": "小部件设置",
    "Add Service": "添加服务",
    Services: "服务",
    Widgets: "小部件",
    Ready: "就绪",

    // Empty state
    "Click ⚙ to add services": "点击 ⚙ 添加服务",

    // Categories
    "My Services": "我的服务",
    Network: "网络",
    Security: "安全",
    VPN: "VPN",
    "Ad Blocking": "广告拦截",
    System: "系统",
    Other: "其他",

    // Service descriptions
    "DNS and DHCP server": "DNS 和 DHCP 服务器",
    Firewall: "防火墙",
    "Network interfaces": "网络接口",
    "LuCI web server": "LuCI 网页服务器",
    "DHCPv6 server": "DHCPv6 服务器",
    "SSH access": "SSH 访问",
    "Time sync": "时间同步",
    "Task scheduler": "任务调度器",
    "VPN service": "VPN 服务",
    "Ad blocking": "广告拦截",
    "System service": "系统服务",

    // Status (uppercase - for badges)
    RUNNING: "运行中",
    STOPPED: "已停止",
    UNKNOWN: "未知",

    // Status (capitalized - for logs)
    Running: "运行中",
    Stopped: "已停止",
    Error: "错误",
    Unknown: "未知",
    Disabled: "已禁用",
    "Checking...": "检查中...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "监控和管理系统服务。点击服务卡片查看详情和控制操作。",

    // Actions
    Start: "启动",
    Stop: "停止",
    Restart: "重启",
    Enable: "启用",
    Disable: "禁用",
    Remove: "移除",
    Cancel: "取消",
    Add: "添加",
    Close: "关闭",
    Reset: "重置",

    // Reboot confirmation
    "Confirm Reboot": "确认重启",
    "Are you sure you want to reboot the system?": "您确定要重启系统吗？",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "此操作将重启您的路由器并暂时中断网络连接。",
    "Reboot Now": "立即重启",

    // Modal - service list
    "Available services": "可用服务",
    "Selected services": "已选服务",
    "Search...": "搜索...",
    "Semantic search...": "语义搜索...",
    "No results found": "未找到结果",
    "No semantic matches": "未找到语义匹配",
    "Enable semantic search": "启用语义搜索",
    "Disable semantic search": "禁用语义搜索",
    "Search services...": "搜索服务...",
    "Search or add custom service...": "搜索或添加自定义服务...",
    Search: "搜索",
    "Opening service list...": "正在打开服务列表...",
    "Custom service name": "服务名称",
    "Enter custom service name...": "输入服务名称...",
    "Add custom service": "添加自定义服务",
    "No services found": "未找到服务",
    "Service not found in system": "系统中未找到服务",
    "as custom": "作为自定义",
    "Or press Enter": "或按回车键",
    "already added": "已添加",
    custom: "自定义",

    // Modal - validation
    "Letters, numbers, dash, underscore only": "仅限字母、数字、短横线、下划线",
    "Name too long (max 64 chars)": "名称过长（最多64个字符）",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "无效字符！请使用：a-z、0-9、-、_",
    "Already in your list": "已在列表中",
    "Found in system": "在系统中找到",
    "Custom service (not found in system)": "自定义服务（系统中未找到）",
    "Added successfully!": "添加成功！",
    "Not installed": "未安装",
    Added: "已添加",
    Removed: "已移除",

    // Loading states
    "Waiting for LuCI API...": "等待 LuCI API...",
    "Loading...": "加载中...",
    "Loading services...": "加载服务...",
    "Checking services...": "检查服务...",
    "Services loaded": "服务已加载",
    "Check complete": "检查完成",

    // init.d
    "init.d services": "init.d 服务",
    "Warning: init.d list empty": "警告：init.d 列表为空",

    // Messages
    "Service started": "服务已启动",
    "Service stopped": "服务已停止",
    "Service restarted": "服务已重启",
    "Service enabled": "服务已启用",
    "Service disabled": "服务已禁用",
    Success: "成功",

    // Empty state
    "No services selected": "未选择服务",
    "Click + to add services": "点击 + 添加服务",

    // Theme Settings
    "Proton2025 Theme Settings": "Proton2025 主题设置",
    "Theme Mode": "主题模式",
    Auto: "自动",
    Dark: "深色",
    Light: "浅色",
    "Choose light, dark, or follow system theme":
      "选择浅色、深色主题或跟随系统设置",
    "Choose light or dark theme": "选择浅色或深色主题",
    "Accent Color": "强调色",
    "Choose theme accent color": "选择主题强调色",
    Blue: "蓝色",
    Purple: "紫色",
    Green: "绿色",
    Orange: "橙色",
    Red: "红色",
    Default: "默认",
    "Border Radius": "圆角",
    "Corner rounding style": "圆角样式",
    Sharp: "尖角",
    Rounded: "圆角",
    "Extra Rounded": "超圆角",
    Zoom: "缩放",
    "Interface scale": "界面缩放",
    "Page Width": "页面宽度",
    "Content area width": "内容区域宽度",
    "Full width": "全宽",
    Animations: "动画",
    "Enable smooth transitions and effects": "启用平滑过渡和效果",
    Transparency: "透明度",
    "Enable blur and transparency effects": "启用模糊和透明效果",
    "Services Widget": "服务小部件",
    "Show services monitor on Overview page": "在概览页面显示服务监控",
    "Temperature Widget": "温度小部件",
    "Show temperature monitor on Overview page": "在概览页面显示温度监控",
    "Deep Service Check": "深度服务检查",
    "Accurate status for adblock, banip, etc.": "adblock、banip 等的准确状态",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "温度小部件已启用。前往 状态 → 概览 查看。",
    "Temperature widget disabled.": "温度小部件已禁用。",
    "Widget Log": "小部件日志",
    "Show activity log under the widget": "在小部件下方显示活动日志",
    "Table Text Wrap": "文本换行（无线）",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "在关联站点表中换行显示长 AP 名称。禁用则用省略号截断。",
    "Log Highlighting": "日志高亮",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "系统日志和内核日志页面的自定义日志查看器，具有语法高亮、行号和工具栏功能。",
    "Custom Font (Inter)": "自定义字体 (Inter)",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "使用内置 Inter 字体在所有设备上保持一致的排版。禁用则使用默认系统字体。",
    "Proton2025 Update": "Proton2025 更新",
    "Check for Updates": "检查更新",
    "Open Release Page": "打开发布页面",
    "Install Update": "安装更新",
    "Installing...": "正在安装...",
    "Installing Proton2025 update...": "正在安装 Proton2025 更新...",
    "Failed to install update.": "安装更新失败。",
    "Proton2025 update installed.": "Proton2025 更新已安装。",
    "Update installed, but a newer version is still available.": "更新已安装，但仍有更新版本可用。",
    "Current version": "当前版本",
    "Latest version": "最新版本",
    "Click the button to check for a new Proton2025 release.": "点击按钮检查新的 Proton2025 版本。",
    "Checking latest Proton2025 release...": "正在检查最新的 Proton2025 版本...",
    "Failed to check for updates.": "检查更新失败。",
    "A new Proton2025 version is available.": "有新的 Proton2025 版本可用。",
    "Proton2025 is up to date.": "Proton2025 已是最新版本。",
    "Search Page Index": "搜索页面索引",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "当菜单页面发生变化时，手动构建或清除缓存的 LuCI 搜索索引。",
    "Indexed Data Size": "已索引数据大小",
    "Index Pages Now": "立即索引页面",
    "Clear Indexed Data": "清除已索引数据",
    "Search index is ready to be built.": "搜索索引已准备好构建。",
    "Indexing in progress...": "正在索引...",
    "Cancel Indexing": "取消索引",
    "Indexing canceled.": "索引已取消。",
    "Indexing canceled": "索引已取消",
    "You can start indexing again at any time.":
      "你可以随时重新开始索引。",
    "Indexed routes": "已索引路由",
    "Cached entries": "缓存条目",
    "Last indexed": "上次索引时间",
    "Index errors": "索引错误",
    "Not indexed yet": "尚未索引",
    "Search index updated successfully.": "搜索索引已成功更新。",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "要清除已索引的搜索数据吗？这将删除路由器上的缓存搜索页面，直到下次重新索引。",

    // Log Viewer UI
    lines: "行",
    "crit.": "严重",
    "err.": "错误",
    "warn.": "警告",
    "den.": "拒绝",
    "disc.": "断开",
    ok: "成功",
    Critical: "严重",
    Errors: "错误",
    Warnings: "警告",
    Denied: "拒绝",
    Disconnects: "断开",
    Successful: "成功",
    "Word Wrap": "自动换行",
    "Hide Timestamps": "隐藏时间戳",
    "Copy Log": "复制日志",
    "Download Log": "下载日志",
    "Scroll to Top": "到顶部",
    "Scroll to Bottom": "到底部",
    "Fullscreen Mode": "全屏模式",
    "Exit Fullscreen": "退出全屏",

    "Services widget enabled. Visit Status → Overview to see it.":
      "服务小部件已启用。前往 状态 → 概览 查看。",
    "Services widget disabled.": "服务小部件已禁用。",

    // Load Average
    "1 min": "1 分钟",
    "5 min": "5 分钟",
    "15 min": "15 分钟",
    "1 MIN": "1 分钟",
    "5 MIN": "5 分钟",
    "15 MIN": "15 分钟",
    "System Load Average": "系统平均负载",
    "Load Average": "平均负载",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "显示等待 CPU 执行的平均进程数。三个值分别代表过去 1、5 和 15 分钟。",
    "Low load": "低负载",
    "Medium load": "中等负载",
    "High load": "高负载",
    cores: "核心",

    // Footer
    "Powered by": "技术支持",

    // Temperature Widget
    Temperature: "温度",
    "Temperature Monitor": "温度监控",
    "No temperature sensors found": "未找到温度传感器",
    CPU: "处理器",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "主板",
    Normal: "正常",
    Warm: "温暖",
    Hot: "过热",
    Critical: "危险",
    "Temperature normal": "温度正常",
    "Temperature elevated": "温度偏高",
    "Temperature high": "温度过高",
    "Temperature critical": "温度危险",
    Sensor: "传感器",
    Current: "当前",
    Peak: "峰值",
    s: "秒",
    min: "分",
    "1 min": "1 分",
    "5 min": "5 分",
    "10 min": "10 分",
    "15 min": "15 分",
    "All sensors": "全部传感器",
    Sensors: "传感器数量",
    Window: "时间窗口",
    Interval: "刷新间隔",
    "Data received at": "数据获取于",
    "Last update": "最后更新",
    "Temperature Realtime": "实时温度",
    "Temperature history": "温度历史",
    "Temperature history chart": "温度历史图表",
    "Sensor statistics": "传感器统计",
    "Point value": "该点数值",
    "Change vs previous": "相对上一点变化",
    Minimum: "最低值",
    Average: "平均值",
    Status: "状态",
    "Current reading": "当前读数",
    "Window average": "窗口平均值",
    "Window minimum": "窗口最低值",
    "Router peak": "路由器峰值",
    "Sensors online": "在线传感器",
    "Current maximum": "当前最高值",
    "Average now": "当前平均值",
    "Sensors above warm": "高于温热阈值的传感器",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "选择一个传感器以查看更清晰的温度历史。图表使用本地滚动缓冲区，而峰值来自路由器当前的 rpcd 会话。",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC 暂时不可用。正在显示上一次成功获取的数据。",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC 暂时不可用。正在等待温度数据...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "热传感器监控。颜色表示：绿色 - 正常，黄色 - 温暖，橙色 - 过热，红色 - 危险。",

    // Backup & Restore
    "Backup & Restore": "备份与恢复",
    "Export your theme settings to a file or import from a previously saved backup.":
      "将主题设置导出为文件，或从之前保存的备份中导入。",
    "Export Settings": "导出设置",
    "Import Settings": "导入设置",
    "Reset to Defaults": "恢复默认",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "确定要将所有主题设置恢复为默认值吗？此操作无法撤销。",
    "Settings exported successfully": "设置导出成功",
    "Settings imported successfully": "设置导入成功",
    "Invalid backup file": "无效的备份文件",
    "No settings found in file": "文件中未找到设置",
    "Failed to read backup file": "读取备份文件失败",
    "Open package repository": "打开软件包仓库",
  },

  de: {
    // Services Widget - Header
    "Services Monitor": "Dienste-Monitor",
    "Widget Settings": "Widget-Einstellungen",
    "Add Service": "Dienst hinzufügen",
    Services: "Dienste",
    Widgets: "Widgets",
    Ready: "Bereit",

    // Empty state
    "Click ⚙ to add services": "Klicken Sie auf ⚙, um Dienste hinzuzufügen",

    // Categories
    "My Services": "Meine Dienste",
    Network: "Netzwerk",
    Security: "Sicherheit",
    VPN: "VPN",
    "Ad Blocking": "Werbeblocker",
    System: "System",
    Other: "Sonstiges",

    // Service descriptions
    "DNS and DHCP server": "DNS- und DHCP-Server",
    Firewall: "Firewall",
    "Network interfaces": "Netzwerkschnittstellen",
    "LuCI web server": "LuCI-Webserver",
    "DHCPv6 server": "DHCPv6-Server",
    "SSH access": "SSH-Zugriff",
    "Time sync": "Zeitsynchronisation",
    "Task scheduler": "Aufgabenplaner",
    "VPN service": "VPN-Dienst",
    "Ad blocking": "Werbeblocker",
    "System service": "Systemdienst",

    // Status (uppercase - for badges)
    RUNNING: "LÄUFT",
    STOPPED: "GESTOPPT",
    UNKNOWN: "UNBEKANNT",

    // Status (capitalized - for logs)
    Running: "Läuft",
    Stopped: "Gestoppt",
    Error: "Fehler",
    Unknown: "Unbekannt",
    Disabled: "Deaktiviert",
    "Checking...": "Überprüfe...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "Systemdienste überwachen und verwalten. Klicken Sie auf eine Dienstkarte, um Details anzuzeigen und Aktionen auszuführen.",

    // Actions
    Start: "Starten",
    Stop: "Stoppen",
    Restart: "Neustarten",
    Enable: "Aktivieren",
    Disable: "Deaktivieren",
    Remove: "Entfernen",
    Cancel: "Abbrechen",
    Add: "Hinzufügen",
    Close: "Schließen",
    Reset: "Zurücksetzen",

    // Reboot confirmation
    "Confirm Reboot": "Neustart bestätigen",
    "Are you sure you want to reboot the system?":
      "Sind Sie sicher, dass Sie das System neu starten möchten?",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "Diese Aktion startet Ihren Router neu und unterbricht vorübergehend die Netzwerkverbindung.",
    "Reboot Now": "Jetzt neu starten",

    // Modal - service list
    "Available services": "Verfügbare Dienste",
    "Selected services": "Ausgewählte Dienste",
    "Search...": "Suchen...",
    "Semantic search...": "Semantische Suche...",
    "No results found": "Keine Ergebnisse gefunden",
    "No semantic matches": "Keine semantischen Treffer gefunden",
    "Enable semantic search": "Semantische Suche aktivieren",
    "Disable semantic search": "Semantische Suche deaktivieren",
    "Search services...": "Dienste suchen...",
    "Search or add custom service...":
      "Suchen oder benutzerdefinierten Dienst hinzufügen...",
    Search: "Suchen",
    "Opening service list...": "Dienstliste wird geöffnet...",
    "Custom service name": "Dienstname",
    "Enter custom service name...": "Dienstname eingeben...",
    "Add custom service": "Benutzerdefinierten Dienst hinzufügen",
    "No services found": "Keine Dienste gefunden",
    "Service not found in system": "Dienst nicht im System gefunden",
    "as custom": "als benutzerdefiniert",
    "Or press Enter": "Oder Enter drücken",
    "already added": "bereits hinzugefügt",
    custom: "benutzerdefiniert",

    // Modal - validation
    "Letters, numbers, dash, underscore only":
      "Nur Buchstaben, Zahlen, Bindestrich, Unterstrich",
    "Name too long (max 64 chars)": "Name zu lang (max. 64 Zeichen)",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "Ungültige Zeichen! Verwenden Sie: a-z, 0-9, -, _",
    "Already in your list": "Bereits in Ihrer Liste",
    "Found in system": "Im System gefunden",
    "Custom service (not found in system)":
      "Benutzerdefinierter Dienst (nicht im System gefunden)",
    "Added successfully!": "Erfolgreich hinzugefügt!",
    "Not installed": "Nicht installiert",
    Added: "Hinzugefügt",
    Removed: "Entfernt",

    // Loading states
    "Waiting for LuCI API...": "Warte auf LuCI API...",
    "Loading...": "Laden...",
    "Loading services...": "Dienste werden geladen...",
    "Checking services...": "Dienste werden überprüft...",
    "Services loaded": "Dienste geladen",
    "Check complete": "Überprüfung abgeschlossen",

    // init.d
    "init.d services": "init.d-Dienste",
    "Warning: init.d list empty": "Warnung: init.d-Liste ist leer",

    // Messages
    "Service started": "Dienst gestartet",
    "Service stopped": "Dienst gestoppt",
    "Service restarted": "Dienst neugestartet",
    "Service enabled": "Dienst aktiviert",
    "Service disabled": "Dienst deaktiviert",
    Success: "Erfolg",

    // Empty state
    "No services selected": "Keine Dienste ausgewählt",
    "Click + to add services": "Klicken Sie auf + zum Hinzufügen",

    // Theme Settings
    "Proton2025 Theme Settings": "Proton2025 Theme-Einstellungen",
    "Theme Mode": "Theme-Modus",
    Auto: "Auto",
    Dark: "Dunkel",
    Light: "Hell",
    "Choose light, dark, or follow system theme":
      "Helles, dunkles Theme oder Systemeinstellung wählen",
    "Choose light or dark theme": "Helles oder dunkles Theme wählen",
    "Accent Color": "Akzentfarbe",
    "Choose theme accent color": "Theme-Akzentfarbe wählen",
    Blue: "Blau",
    Purple: "Lila",
    Green: "Grün",
    Orange: "Orange",
    Red: "Rot",
    Default: "Standard",
    "Border Radius": "Eckenradius",
    "Corner rounding style": "Eckenrundungsstil",
    Sharp: "Scharf",
    Rounded: "Abgerundet",
    "Extra Rounded": "Stark abgerundet",
    Zoom: "Zoom",
    "Interface scale": "Oberflächenskalierung",
    "Page Width": "Seitenbreite",
    "Content area width": "Breite des Inhaltsbereichs",
    "Full width": "Volle Breite",
    Animations: "Animationen",
    "Enable smooth transitions and effects":
      "Sanfte Übergänge und Effekte aktivieren",
    Transparency: "Transparenz",
    "Enable blur and transparency effects":
      "Unschärfe- und Transparenzeffekte aktivieren",
    "Services Widget": "Dienste-Widget",
    "Show services monitor on Overview page":
      "Dienste-Monitor auf der Übersichtsseite anzeigen",
    "Temperature Widget": "Temperatur-Widget",
    "Show temperature monitor on Overview page":
      "Temperatur-Monitor auf der Übersichtsseite anzeigen",
    "Deep Service Check": "Tiefgehende Dienst-Prüfung",
    "Accurate status for adblock, banip, etc.":
      "Genauer Status für adblock, banip usw.",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "Temperatur-Widget aktiviert. Besuchen Sie Status → Übersicht, um es zu sehen.",
    "Temperature widget disabled.": "Temperatur-Widget deaktiviert.",
    "Widget Log": "Widget-Protokoll",
    "Show activity log under the widget":
      "Aktivitätsprotokoll unter dem Widget anzeigen",
    "Table Text Wrap": "Textumbruch (WLAN)",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "Lange AP-Namen in der Tabelle Zugeordnete Stationen umbrechen. Deaktivieren, um mit Auslassungspunkten abzuschneiden.",
    "Log Highlighting": "Log-Hervorhebung",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "Benutzerdefinierter Log-Viewer mit Syntaxhervorhebung, Zeilennummern und Symbolleiste auf den Seiten Systemprotokoll und Kernelprotokoll.",
    "Custom Font (Inter)": "Schriftart Inter",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "Verwenden Sie die integrierte Inter-Schriftart für einheitliche Typografie auf allen Geräten. Deaktivieren, um die Standard-Systemschrift zu verwenden.",
    "Proton2025 Update": "Proton2025-Aktualisierung",
    "Check for Updates": "Nach Updates suchen",
    "Open Release Page": "Release-Seite öffnen",
    "Install Update": "Update installieren",
    "Installing...": "Installation...",
    "Installing Proton2025 update...": "Proton2025-Update wird installiert...",
    "Failed to install update.": "Update konnte nicht installiert werden.",
    "Proton2025 update installed.": "Proton2025-Update wurde installiert.",
    "Update installed, but a newer version is still available.": "Update installiert, aber eine neuere Version ist weiterhin verfügbar.",
    "Current version": "Aktuelle Version",
    "Latest version": "Neueste Version",
    "Click the button to check for a new Proton2025 release.": "Klicken Sie auf die Schaltfläche, um nach einem neuen Proton2025-Release zu suchen.",
    "Checking latest Proton2025 release...": "Neueste Proton2025-Version wird geprüft...",
    "Failed to check for updates.": "Suche nach Updates fehlgeschlagen.",
    "A new Proton2025 version is available.": "Eine neue Proton2025-Version ist verfügbar.",
    "Proton2025 is up to date.": "Proton2025 ist auf dem neuesten Stand.",
    "Search Page Index": "Suchseiten-Index",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "Erstellen oder löschen Sie den zwischengespeicherten LuCI-Suchindex manuell, wenn sich Menüseiten ändern.",
    "Indexed Data Size": "Größe der indexierten Daten",
    "Index Pages Now": "Seiten jetzt indexieren",
    "Clear Indexed Data": "Indexierte Daten löschen",
    "Search index is ready to be built.": "Der Suchindex kann erstellt werden.",
    "Indexing in progress...": "Indexierung läuft...",
    "Cancel Indexing": "Indizierung abbrechen",
    "Indexing canceled.": "Indizierung abgebrochen.",
    "Indexing canceled": "Indizierung abgebrochen",
    "You can start indexing again at any time.":
      "Sie können die Indizierung jederzeit erneut starten.",
    "Indexed routes": "Indexierte Routen",
    "Cached entries": "Zwischengespeicherte Einträge",
    "Last indexed": "Zuletzt indexiert",
    "Index errors": "Indexierungsfehler",
    "Not indexed yet": "Noch nicht indexiert",
    "Search index updated successfully.": "Suchindex erfolgreich aktualisiert.",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "Indexierte Suchdaten löschen? Dadurch werden die zwischengespeicherten Suchseiten auf dem Router bis zum nächsten Indexierungslauf entfernt.",

    // Log Viewer UI
    lines: "Zeilen",
    "crit.": "krit.",
    "err.": "Fehl.",
    "warn.": "Warn.",
    "den.": "abgel.",
    "disc.": "getr.",
    ok: "ok",
    Critical: "Kritisch",
    Errors: "Fehler",
    Warnings: "Warnungen",
    Denied: "Abgelehnt",
    Disconnects: "Getrennt",
    Successful: "Erfolgreich",
    "Word Wrap": "Zeilenumbruch",
    "Hide Timestamps": "Zeitstempel ausblenden",
    "Copy Log": "Log kopieren",
    "Download Log": "Log herunterladen",
    "Scroll to Top": "Nach oben",
    "Scroll to Bottom": "Nach unten",
    "Fullscreen Mode": "Vollbildmodus",
    "Exit Fullscreen": "Vollbild beenden",

    "Services widget enabled. Visit Status → Overview to see it.":
      "Dienste-Widget aktiviert. Besuchen Sie Status → Übersicht, um es zu sehen.",
    "Services widget disabled.": "Dienste-Widget deaktiviert.",

    // Load Average
    "1 min": "1 Min",
    "5 min": "5 Min",
    "15 min": "15 Min",
    "1 MIN": "1 MIN",
    "5 MIN": "5 MIN",
    "15 MIN": "15 MIN",
    "System Load Average": "Systemlastdurchschnitt",
    "Load Average": "Lastdurchschnitt",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "Zeigt die durchschnittliche Anzahl der Prozesse, die auf CPU-Ausführung warten. Drei Werte repräsentieren die letzten 1, 5 und 15 Minuten.",
    "Low load": "Niedrige Last",
    "Medium load": "Mittlere Last",
    "High load": "Hohe Last",
    cores: "Kerne",

    // Footer
    "Powered by": "Betrieben von",

    // Temperature Widget
    Temperature: "Temperatur",
    "Temperature Monitor": "Temperatur-Monitor",
    "No temperature sensors found": "Keine Temperatursensoren gefunden",
    CPU: "CPU",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "Platine",
    Normal: "Normal",
    Warm: "Warm",
    Hot: "Heiß",
    Critical: "Kritisch",
    "Temperature normal": "Temperatur normal",
    "Temperature elevated": "Temperatur erhöht",
    "Temperature high": "Temperatur hoch",
    "Temperature critical": "Temperatur kritisch",
    Sensor: "Sensor",
    Current: "Aktuell",
    Peak: "Spitze",
    s: "s",
    min: "Min",
    "10 min": "10 Min",
    "All sensors": "Alle Sensoren",
    Sensors: "Sensoren",
    Window: "Zeitfenster",
    Interval: "Intervall",
    "Data received at": "Daten empfangen um",
    "Last update": "Letzte Aktualisierung",
    "Temperature Realtime": "Echtzeit-Temperatur",
    "Temperature history": "Temperaturverlauf",
    "Temperature history chart": "Temperaturverlauf-Diagramm",
    "Sensor statistics": "Sensorstatistiken",
    "Point value": "Punktwert",
    "Change vs previous": "Änderung zum Vorherigen",
    Minimum: "Minimum",
    Average: "Durchschnitt",
    Status: "Status",
    "Current reading": "Aktueller Messwert",
    "Window average": "Fensterdurchschnitt",
    "Window minimum": "Fensterminimum",
    "Router peak": "Router-Spitzenwert",
    "Sensors online": "Sensoren online",
    "Current maximum": "Aktuelles Maximum",
    "Average now": "Aktueller Schnitt",
    "Sensors above warm": "Sensoren über Warm",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "Wählen Sie einen Sensor für einen übersichtlichen Temperaturverlauf. Das Diagramm speichert einen lokalen Rollpuffer, Spitzenwerte stammen aus der aktuellen rpcd-Sitzung des Routers.",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC vorübergehend nicht verfügbar. Zeige letzte erfolgreiche Messung.",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC vorübergehend nicht verfügbar. Warte auf Temperaturdaten...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "Thermosensor-Überwachung. Farben bedeuten: grün - normal, gelb - warm, orange - heiß, rot - kritisch.",

    // Backup & Restore
    "Backup & Restore": "Sichern & Wiederherstellen",
    "Export your theme settings to a file or import from a previously saved backup.":
      "Exportieren Sie Ihre Theme-Einstellungen in eine Datei oder importieren Sie aus einer zuvor gespeicherten Sicherung.",
    "Export Settings": "Einstellungen exportieren",
    "Import Settings": "Einstellungen importieren",
    "Reset to Defaults": "Auf Standard zurücksetzen",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "Sind Sie sicher, dass Sie alle Theme-Einstellungen zurücksetzen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
    "Settings exported successfully": "Einstellungen erfolgreich exportiert",
    "Settings imported successfully": "Einstellungen erfolgreich importiert",
    "Invalid backup file": "Ungültige Sicherungsdatei",
    "No settings found in file": "Keine Einstellungen in der Datei gefunden",
    "Failed to read backup file": "Sicherungsdatei konnte nicht gelesen werden",
    "Open package repository": "Paket-Repository öffnen",
  },

  uk: {
    // Services Widget - Header
    "Services Monitor": "Моніторинг сервісів",
    "Widget Settings": "Налаштування віджетів",
    "Add Service": "Додати сервіс",
    Services: "Сервіси",
    Widgets: "Віджети",
    Ready: "Готовий",

    // Empty state
    "Click ⚙ to add services": "Натисніть ⚙ для додавання сервісів",

    // Categories
    "My Services": "Мої сервіси",
    Network: "Мережа",
    Security: "Безпека",
    VPN: "VPN",
    "Ad Blocking": "Блокування реклами",
    System: "Система",
    Other: "Інше",

    // Service descriptions
    "DNS and DHCP server": "DNS та DHCP сервер",
    Firewall: "Міжмережевий екран",
    "Network interfaces": "Мережеві інтерфейси",
    "LuCI web server": "Веб-сервер LuCI",
    "DHCPv6 server": "DHCPv6 сервер",
    "SSH access": "SSH доступ",
    "Time sync": "Синхронізація часу",
    "Task scheduler": "Планувальник завдань",
    "VPN service": "VPN сервіс",
    "Ad blocking": "Блокування реклами",
    "System service": "Системний сервіс",

    // Status (uppercase - for badges)
    RUNNING: "ПРАЦЮЄ",
    STOPPED: "ЗУПИНЕНО",
    UNKNOWN: "НЕВІДОМО",

    // Status (capitalized - for logs)
    Running: "Працює",
    Stopped: "Зупинено",
    Error: "Помилка",
    Unknown: "Невідомо",
    Disabled: "Вимкнено",
    "Checking...": "Перевірка...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "Моніторинг та керування системними сервісами. Натисніть на картку сервісу для перегляду деталей та керування.",

    // Actions
    Start: "Запустити",
    Stop: "Зупинити",
    Restart: "Перезапустити",
    Enable: "Увімкнути",
    Disable: "Вимкнути",
    Remove: "Прибрати",
    Cancel: "Скасувати",
    Add: "Додати",
    Close: "Закрити",
    Reset: "Скинути",

    // Reboot confirmation
    "Confirm Reboot": "Підтвердіть перезавантаження",
    "Are you sure you want to reboot the system?":
      "Ви впевнені, що хочете перезавантажити систему?",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "Ця дія перезапустить ваш роутер і тимчасово перерве мережеве з'єднання.",
    "Reboot Now": "Перезавантажити",

    // Modal - service list
    "Available services": "Доступні сервіси",
    "Selected services": "Вибрані сервіси",
    "Search...": "Пошук...",
    "Semantic search...": "Семантичний пошук...",
    "No results found": "Нічого не знайдено",
    "No semantic matches": "Нічого не знайдено за змістом",
    "Enable semantic search": "Увімкнути семантичний пошук",
    "Disable semantic search": "Вимкнути семантичний пошук",
    "Search services...": "Пошук сервісів...",
    "Search or add custom service...": "Пошук або додавання сервісу...",
    Search: "Пошук",
    "Opening service list...": "Відкриття списку сервісів...",
    "Custom service name": "Ім'я сервісу",
    "Enter custom service name...": "Введіть ім'я сервісу...",
    "Add custom service": "Додати свій сервіс",
    "No services found": "Сервіси не знайдено",
    "Service not found in system": "Сервіс не знайдено в системі",
    "as custom": "як свій",
    "Or press Enter": "Або натисніть Enter",
    "already added": "вже додано",
    custom: "свій",

    // Modal - validation
    "Letters, numbers, dash, underscore only":
      "Тільки літери, цифри, дефіс, підкреслення",
    "Name too long (max 64 chars)": "Ім'я занадто довге (макс. 64 символи)",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "Недопустимі символи! Використовуйте: a-z, 0-9, -, _",
    "Already in your list": "Вже у вашому списку",
    "Found in system": "Знайдено в системі",
    "Custom service (not found in system)":
      "Користувацький сервіс (не знайдено в системі)",
    "Added successfully!": "Успішно додано!",
    "Not installed": "Не встановлено",
    Added: "Додано",
    Removed: "Видалено",

    // Loading states
    "Waiting for LuCI API...": "Очікування LuCI API...",
    "Loading...": "Завантаження...",
    "Loading services...": "Завантаження сервісів...",
    "Checking services...": "Перевірка сервісів...",
    "Services loaded": "Сервіси завантажено",
    "Check complete": "Перевірку завершено",

    // init.d
    "init.d services": "Сервіси init.d",
    "Warning: init.d list empty": "Увага: список init.d порожній",

    // Messages
    "Service started": "Сервіс запущено",
    "Service stopped": "Сервіс зупинено",
    "Service restarted": "Сервіс перезапущено",
    "Service enabled": "Сервіс увімкнено",
    "Service disabled": "Сервіс вимкнено",
    Success: "Успішно",

    // Empty state
    "No services selected": "Сервіси не вибрано",
    "Click + to add services": "Натисніть + щоб додати",

    // Theme Settings
    "Proton2025 Theme Settings": "Налаштування теми Proton2025",
    "Theme Mode": "Режим теми",
    Auto: "Авто",
    Dark: "Темний",
    Light: "Світлий",
    "Choose light, dark, or follow system theme":
      "Виберіть світлу, темну тему або слідування системній темі",
    "Choose light or dark theme": "Виберіть світлу або темну тему",
    "Accent Color": "Акцентний колір",
    "Choose theme accent color": "Виберіть акцентний колір теми",
    Blue: "Синій",
    Purple: "Фіолетовий",
    Green: "Зелений",
    Orange: "Помаранчевий",
    Red: "Червоний",
    Default: "За замовчуванням",
    "Border Radius": "Заокруглення кутів",
    "Corner rounding style": "Стиль заокруглення кутів",
    Sharp: "Гострі",
    Rounded: "Заокруглені",
    "Extra Rounded": "Сильно заокруглені",
    Zoom: "Масштаб",
    "Interface scale": "Масштаб інтерфейсу",
    "Page Width": "Ширина сторінки",
    "Content area width": "Ширина області вмісту",
    "Full width": "На всю ширину",
    Animations: "Анімації",
    "Enable smooth transitions and effects":
      "Увімкнути плавні переходи та ефекти",
    Transparency: "Прозорість",
    "Enable blur and transparency effects":
      "Увімкнути ефекти розмиття та прозорості",
    "Services Widget": "Віджет сервісів",
    "Show services monitor on Overview page":
      "Показувати монітор сервісів на сторінці огляду",
    "Temperature Widget": "Віджет температури",
    "Show temperature monitor on Overview page":
      "Показувати монітор температури на сторінці огляду",
    "Deep Service Check": "Глибока перевірка сервісів",
    "Accurate status for adblock, banip, etc.":
      "Точний статус для adblock, banip та подібних",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "Віджет температури увімкнено. Перейдіть до Статус → Огляд, щоб побачити його.",
    "Temperature widget disabled.": "Віджет температури вимкнено.",
    "Widget Log": "Лог віджета",
    "Show activity log under the widget":
      "Показувати лог активності під віджетом",
    "Table Text Wrap": "Перенесення тексту (Wireless)",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "Переносити довгі імена AP у таблиці Associated Stations. Вимкніть для обрізання з трикрапкою.",
    "Log Highlighting": "Підсвічування логів",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "Кастомний переглядач логів із підсвічуванням синтаксису, нумерацією рядків та панеллю інструментів на сторінках Системного журналу та Журналу ядра.",
    "Custom Font (Inter)": "Шрифт Inter",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "Використовувати вбудований шрифт Inter для однакового відображення тексту на всіх пристроях. Вимкніть, щоб використовувати системний шрифт.",
    "Proton2025 Update": "Оновлення Proton2025",
    "Check for Updates": "Перевірити оновлення",
    "Open Release Page": "Відкрити сторінку релізу",
    "Install Update": "Встановити оновлення",
    "Installing...": "Встановлення...",
    "Installing Proton2025 update...": "Встановлюємо оновлення Proton2025...",
    "Failed to install update.": "Не вдалося встановити оновлення.",
    "Proton2025 update installed.": "Оновлення Proton2025 встановлено.",
    "Update installed, but a newer version is still available.": "Оновлення встановлено, але новіша версія все ще доступна.",
    "Current version": "Поточна версія",
    "Latest version": "Остання версія",
    "Click the button to check for a new Proton2025 release.": "Натисніть кнопку, щоб перевірити наявність нового релізу Proton2025.",
    "Checking latest Proton2025 release...": "Перевіряємо останній реліз Proton2025...",
    "Failed to check for updates.": "Не вдалося перевірити оновлення.",
    "A new Proton2025 version is available.": "Доступна нова версія Proton2025.",
    "Proton2025 is up to date.": "Proton2025 оновлено до останньої версії.",
    "Search Page Index": "Індекс сторінок пошуку",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "Вручну створюйте або очищайте кешований індекс пошуку LuCI, коли змінюються сторінки меню.",
    "Indexed Data Size": "Розмір індексованих даних",
    "Index Pages Now": "Індексувати зараз",
    "Clear Indexed Data": "Очистити індексовані дані",
    "Search index is ready to be built.": "Індекс пошуку готовий до побудови.",
    "Indexing in progress...": "Триває індексація...",
    "Cancel Indexing": "Скасувати індексацію",
    "Indexing canceled.": "Індексацію скасовано.",
    "Indexing canceled": "Індексацію скасовано",
    "You can start indexing again at any time.":
      "Ви можете запустити індексацію знову в будь-який момент.",
    "Indexed routes": "Індексовано маршрутів",
    "Cached entries": "Записів у кеші",
    "Last indexed": "Остання індексація",
    "Index errors": "Помилки індексації",
    "Not indexed yet": "Ще не індексувалося",
    "Search index updated successfully.": "Індекс пошуку успішно оновлено.",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "Очистити індексовані дані пошуку? Це видалить кеш пошукових сторінок на роутері до наступного запуску індексації.",

    // Log Viewer UI
    lines: "рядків",
    "crit.": "крит.",
    "err.": "пом.",
    "warn.": "попер.",
    "den.": "відхил.",
    "disc.": "від'єдн.",
    ok: "усп.",
    Critical: "Критичні",
    Errors: "Помилки",
    Warnings: "Попередження",
    Denied: "Відхилення",
    Disconnects: "Від'єднання",
    Successful: "Успішні",
    "Word Wrap": "Перенос рядків",
    "Hide Timestamps": "Приховати мітки часу",
    "Copy Log": "Копіювати лог",
    "Download Log": "Завантажити лог",
    "Scroll to Top": "На початок",
    "Scroll to Bottom": "В кінець",
    "Fullscreen Mode": "Повноекранний режим",
    "Exit Fullscreen": "Вийти з повноекранного режиму",

    "Services widget enabled. Visit Status → Overview to see it.":
      "Віджет сервісів увімкнено. Перейдіть до Статус → Огляд, щоб побачити його.",
    "Services widget disabled.": "Віджет сервісів вимкнено.",

    // Load Average
    "1 min": "1 хв",
    "5 min": "5 хв",
    "15 min": "15 хв",
    "1 MIN": "1 ХВ",
    "5 MIN": "5 ХВ",
    "15 MIN": "15 ХВ",
    "System Load Average": "Середнє навантаження системи",
    "Load Average": "Середнє навантаження",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "Показує кількість процесів, що очікують виконання процесором. Три значення — за останні 1, 5 та 15 хвилин.",
    "Low load": "Низьке навантаження",
    "Medium load": "Середнє навантаження",
    "High load": "Високе навантаження",
    cores: "ядра",

    // Footer
    "Powered by": "Працює на",

    // Temperature Widget
    Temperature: "Температура",
    "Temperature Monitor": "Моніторинг температури",
    "No temperature sensors found": "Датчики температури не знайдено",
    CPU: "Процесор",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "Плата",
    Normal: "Норма",
    Warm: "Тепло",
    Hot: "Гаряче",
    Critical: "Критично",
    "Temperature normal": "Температура в нормі",
    "Temperature elevated": "Температура підвищена",
    "Temperature high": "Висока температура",
    "Temperature critical": "Критична температура",
    Sensor: "Датчик",
    Current: "Поточна",
    Peak: "Пік",
    s: "с",
    min: "хв",
    "10 min": "10 хв",
    "All sensors": "Всі датчики",
    Sensors: "Датчики",
    Window: "Вікно",
    Interval: "Інтервал",
    "Data received at": "Дані отримано о",
    "Last update": "Останнє оновлення",
    "Temperature Realtime": "Температура в реальному часі",
    "Temperature history": "Історія температури",
    "Temperature history chart": "Графік історії температури",
    "Sensor statistics": "Статистика датчиків",
    "Point value": "Значення точки",
    "Change vs previous": "Зміна до попередньої точки",
    Minimum: "Мінімум",
    Average: "Середнє",
    Status: "Статус",
    "Current reading": "Поточний показник",
    "Window average": "Середнє за вікно",
    "Window minimum": "Мінімум за вікно",
    "Router peak": "Пік на роутері",
    "Sensors online": "Датчиків онлайн",
    "Current maximum": "Поточний максимум",
    "Average now": "Середнє зараз",
    "Sensors above warm": "Датчиків вище норми",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "Виберіть датчик для перегляду зрозумілої історії температури. Графік зберігає локальне ковзне вікно, а пікові значення надходять із поточної сесії rpcd роутера.",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC тимчасово недоступний. Показано останній успішно отриманий знімок.",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC тимчасово недоступний. Очікування даних температури...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "Моніторинг термодатчиків. Кольори означають: зелений — норма, жовтий — тепло, помаранчевий — гаряче, червоний — критично.",

    // Backup & Restore
    "Backup & Restore": "Резервне копіювання",
    "Export your theme settings to a file or import from a previously saved backup.":
      "Експортуйте налаштування теми у файл або імпортуйте з раніше збереженої копії.",
    "Export Settings": "Експорт налаштувань",
    "Import Settings": "Імпорт налаштувань",
    "Reset to Defaults": "Скинути до стандартних",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "Ви впевнені, що хочете скинути всі налаштування теми? Цю дію не можна скасувати.",
    "Settings exported successfully": "Налаштування успішно експортовано",
    "Settings imported successfully": "Налаштування успішно імпортовано",
    "Invalid backup file": "Невірний файл резервної копії",
    "No settings found in file": "У файлі не знайдено налаштувань",
    "Failed to read backup file": "Помилка читання файлу резервної копії",
    "Open package repository": "Відкрити репозиторій пакетів",
  },

  es: {
    // Services Widget - Header
    "Services Monitor": "Monitor de Servicios",
    "Widget Settings": "Configuración de Widgets",
    "Add Service": "Añadir Servicio",
    Services: "Servicios",
    Widgets: "Widgets",
    Ready: "Listo",

    // Empty state
    "Click ⚙ to add services": "Haga clic en ⚙ para añadir servicios",

    // Categories
    "My Services": "Mis Servicios",
    Network: "Red",
    Security: "Seguridad",
    VPN: "VPN",
    "Ad Blocking": "Bloqueo de Anuncios",
    System: "Sistema",
    Other: "Otro",

    // Service descriptions
    "DNS and DHCP server": "Servidor DNS y DHCP",
    Firewall: "Cortafuegos",
    "Network interfaces": "Interfaces de red",
    "LuCI web server": "Servidor web LuCI",
    "DHCPv6 server": "Servidor DHCPv6",
    "SSH access": "Acceso SSH",
    "Time sync": "Sincronización de hora",
    "Task scheduler": "Programador de tareas",
    "VPN service": "Servicio VPN",
    "Ad blocking": "Bloqueo de anuncios",
    "System service": "Servicio del sistema",

    // Status (uppercase - for badges)
    RUNNING: "EJECUTANDO",
    STOPPED: "DETENIDO",
    UNKNOWN: "DESCONOCIDO",

    // Status (capitalized - for logs)
    Running: "Ejecutando",
    Stopped: "Detenido",
    Error: "Error",
    Unknown: "Desconocido",
    Disabled: "Deshabilitado",
    "Checking...": "Comprobando...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "Monitorear y gestionar servicios del sistema. Haga clic en la tarjeta del servicio para ver detalles y controlar acciones.",

    // Actions
    Start: "Iniciar",
    Stop: "Detener",
    Restart: "Reiniciar",
    Enable: "Habilitar",
    Disable: "Deshabilitar",
    Remove: "Eliminar",
    Cancel: "Cancelar",
    Add: "Añadir",
    Close: "Cerrar",
    Reset: "Restablecer",

    // Reboot confirmation
    "Confirm Reboot": "Confirmar reinicio",
    "Are you sure you want to reboot the system?":
      "¿Está seguro de que desea reiniciar el sistema?",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "Esta acción reiniciará su router e interrumpirá temporalmente la conectividad de red.",
    "Reboot Now": "Reiniciar ahora",

    // Modal - service list
    "Available services": "Servicios disponibles",
    "Selected services": "Servicios seleccionados",
    "Search...": "Buscar...",
    "Semantic search...": "Búsqueda semántica...",
    "No results found": "No se encontraron resultados",
    "No semantic matches": "No se encontraron coincidencias semánticas",
    "Enable semantic search": "Activar búsqueda semántica",
    "Disable semantic search": "Desactivar búsqueda semántica",
    "Search services...": "Buscar servicios...",
    "Search or add custom service...":
      "Buscar o añadir servicio personalizado...",
    Search: "Buscar",
    "Opening service list...": "Abriendo lista de servicios...",
    "Custom service name": "Nombre del servicio",
    "Enter custom service name...": "Introduzca nombre del servicio...",
    "Add custom service": "Añadir servicio personalizado",
    "No services found": "No se encontraron servicios",
    "Service not found in system": "Servicio no encontrado en el sistema",
    "as custom": "como personalizado",
    "Or press Enter": "O presione Enter",
    "already added": "ya añadido",
    custom: "personalizado",

    // Modal - validation
    "Letters, numbers, dash, underscore only":
      "Solo letras, números, guión, guión bajo",
    "Name too long (max 64 chars)":
      "Nombre demasiado largo (máx. 64 caracteres)",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "¡Caracteres inválidos! Use: a-z, 0-9, -, _",
    "Already in your list": "Ya está en su lista",
    "Found in system": "Encontrado en el sistema",
    "Custom service (not found in system)":
      "Servicio personalizado (no encontrado en el sistema)",
    "Added successfully!": "¡Añadido exitosamente!",
    "Not installed": "No instalado",
    Added: "Añadido",
    Removed: "Eliminado",

    // Loading states
    "Waiting for LuCI API...": "Esperando API de LuCI...",
    "Loading...": "Cargando...",
    "Loading services...": "Cargando servicios...",
    "Checking services...": "Comprobando servicios...",
    "Services loaded": "Servicios cargados",
    "Check complete": "Comprobación completada",

    // init.d
    "init.d services": "Servicios init.d",
    "Warning: init.d list empty": "Advertencia: lista init.d vacía",

    // Messages
    "Service started": "Servicio iniciado",
    "Service stopped": "Servicio detenido",
    "Service restarted": "Servicio reiniciado",
    "Service enabled": "Servicio habilitado",
    "Service disabled": "Servicio deshabilitado",
    Success: "Éxito",

    // Empty state
    "No services selected": "No hay servicios seleccionados",
    "Click + to add services": "Haga clic en + para añadir",

    // Theme Settings
    "Proton2025 Theme Settings": "Configuración del Tema Proton2025",
    "Theme Mode": "Modo del Tema",
    Auto: "Auto",
    Dark: "Oscuro",
    Light: "Claro",
    "Choose light, dark, or follow system theme":
      "Elegir tema claro, oscuro o seguir el tema del sistema",
    "Choose light or dark theme": "Elegir tema claro u oscuro",
    "Accent Color": "Color de Acento",
    "Choose theme accent color": "Elegir color de acento del tema",
    Blue: "Azul",
    Purple: "Púrpura",
    Green: "Verde",
    Orange: "Naranja",
    Red: "Rojo",
    Default: "Predeterminado",
    "Border Radius": "Radio de Borde",
    "Corner rounding style": "Estilo de redondeo de esquinas",
    Sharp: "Afilado",
    Rounded: "Redondeado",
    "Extra Rounded": "Muy Redondeado",
    Zoom: "Zoom",
    "Interface scale": "Escala de interfaz",
    "Page Width": "Ancho de página",
    "Content area width": "Ancho del área de contenido",
    "Full width": "Ancho completo",
    Animations: "Animaciones",
    "Enable smooth transitions and effects":
      "Habilitar transiciones y efectos suaves",
    Transparency: "Transparencia",
    "Enable blur and transparency effects":
      "Habilitar efectos de desenfoque y transparencia",
    "Services Widget": "Widget de Servicios",
    "Show services monitor on Overview page":
      "Mostrar monitor de servicios en la página de resumen",
    "Temperature Widget": "Widget de Temperatura",
    "Show temperature monitor on Overview page":
      "Mostrar monitor de temperatura en la página de resumen",
    "Deep Service Check": "Verificación profunda de servicios",
    "Accurate status for adblock, banip, etc.":
      "Estado preciso para adblock, banip, etc.",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "Widget de temperatura habilitado. Visite Estado → Resumen para verlo.",
    "Temperature widget disabled.": "Widget de temperatura deshabilitado.",
    "Widget Log": "Registro del Widget",
    "Show activity log under the widget":
      "Mostrar registro de actividad bajo el widget",
    "Table Text Wrap": "Ajuste de Texto (Wireless)",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "Ajustar nombres largos de AP en la tabla de Estaciones Asociadas. Desactivar para truncar con puntos suspensivos.",
    "Log Highlighting": "Resaltado de Registros",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "Visor de registros personalizado con resaltado de sintaxis, números de línea y barra de herramientas en las páginas de Registro del Sistema y Registro del Kernel.",
    "Custom Font (Inter)": "Fuente Inter",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "Usar la fuente Inter integrada para una tipografía consistente en todos los dispositivos. Desactivar para usar la fuente del sistema.",
    "Proton2025 Update": "Actualización de Proton2025",
    "Check for Updates": "Buscar actualizaciones",
    "Open Release Page": "Abrir página de lanzamiento",
    "Install Update": "Instalar actualización",
    "Installing...": "Instalando...",
    "Installing Proton2025 update...": "Instalando la actualización de Proton2025...",
    "Failed to install update.": "No se pudo instalar la actualización.",
    "Proton2025 update installed.": "Actualización de Proton2025 instalada.",
    "Update installed, but a newer version is still available.": "Actualización instalada, pero todavía hay una versión más reciente disponible.",
    "Current version": "Versión actual",
    "Latest version": "Última versión",
    "Click the button to check for a new Proton2025 release.": "Haz clic en el botón para buscar una nueva versión de Proton2025.",
    "Checking latest Proton2025 release...": "Comprobando la última versión de Proton2025...",
    "Failed to check for updates.": "No se pudieron buscar actualizaciones.",
    "A new Proton2025 version is available.": "Hay una nueva versión de Proton2025 disponible.",
    "Proton2025 is up to date.": "Proton2025 está actualizado.",
    "Search Page Index": "Índice de páginas de búsqueda",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "Crea o borra manualmente el índice de búsqueda LuCI en caché cuando cambien las páginas del menú.",
    "Indexed Data Size": "Tamaño de los datos indexados",
    "Index Pages Now": "Indexar páginas ahora",
    "Clear Indexed Data": "Borrar datos indexados",
    "Search index is ready to be built.":
      "El índice de búsqueda está listo para generarse.",
    "Indexing in progress...": "Indexando...",
    "Cancel Indexing": "Cancelar indexación",
    "Indexing canceled.": "Indexación cancelada.",
    "Indexing canceled": "Indexación cancelada",
    "You can start indexing again at any time.":
      "Puedes iniciar la indexación de nuevo en cualquier momento.",
    "Indexed routes": "Rutas indexadas",
    "Cached entries": "Entradas en caché",
    "Last indexed": "Última indexación",
    "Index errors": "Errores de indexación",
    "Not indexed yet": "Aún no se ha indexado",
    "Search index updated successfully.":
      "Índice de búsqueda actualizado correctamente.",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "¿Borrar los datos de búsqueda indexados? Esto eliminará las páginas de búsqueda en caché en el router hasta la próxima indexación.",

    // Log Viewer UI
    lines: "líneas",
    "crit.": "crít.",
    "err.": "err.",
    "warn.": "adv.",
    "den.": "den.",
    "disc.": "desc.",
    ok: "ok",
    Critical: "Críticos",
    Errors: "Errores",
    Warnings: "Advertencias",
    Denied: "Denegados",
    Disconnects: "Desconexiones",
    Successful: "Exitosos",
    "Word Wrap": "Ajuste de línea",
    "Hide Timestamps": "Ocultar marcas de tiempo",
    "Copy Log": "Copiar registro",
    "Download Log": "Descargar registro",
    "Scroll to Top": "Ir al inicio",
    "Scroll to Bottom": "Ir al final",
    "Fullscreen Mode": "Modo pantalla completa",
    "Exit Fullscreen": "Salir de pantalla completa",

    "Services widget enabled. Visit Status → Overview to see it.":
      "Widget de servicios habilitado. Visite Estado → Resumen para verlo.",
    "Services widget disabled.": "Widget de servicios deshabilitado.",

    // Load Average
    "1 min": "1 min",
    "5 min": "5 min",
    "15 min": "15 min",
    "1 MIN": "1 MIN",
    "5 MIN": "5 MIN",
    "15 MIN": "15 MIN",
    "System Load Average": "Carga Promedio del Sistema",
    "Load Average": "Carga Promedio",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "Muestra el número promedio de procesos esperando ejecución de CPU. Los tres valores representan los últimos 1, 5 y 15 minutos.",
    "Low load": "Carga baja",
    "Medium load": "Carga media",
    "High load": "Carga alta",
    cores: "núcleos",

    // Footer
    "Powered by": "Desarrollado por",

    // Temperature Widget
    Temperature: "Temperatura",
    "Temperature Monitor": "Monitor de Temperatura",
    "No temperature sensors found": "No se encontraron sensores de temperatura",
    CPU: "CPU",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "Placa",
    Normal: "Normal",
    Warm: "Cálido",
    Hot: "Caliente",
    Critical: "Crítico",
    "Temperature normal": "Temperatura normal",
    "Temperature elevated": "Temperatura elevada",
    "Temperature high": "Temperatura alta",
    "Temperature critical": "Temperatura crítica",
    Sensor: "Sensor",
    Current: "Actual",
    Peak: "Pico",
    s: "s",
    min: "min",
    "10 min": "10 min",
    "All sensors": "Todos los sensores",
    Sensors: "Sensores",
    Window: "Ventana",
    Interval: "Intervalo",
    "Data received at": "Datos recibidos a las",
    "Last update": "Última actualización",
    "Temperature Realtime": "Temperatura en tiempo real",
    "Temperature history": "Historial de temperatura",
    "Temperature history chart": "Gráfico del historial de temperatura",
    "Sensor statistics": "Estadísticas del sensor",
    "Point value": "Valor del punto",
    "Change vs previous": "Cambio respecto al anterior",
    Minimum: "Mínimo",
    Average: "Promedio",
    Status: "Estado",
    "Current reading": "Lectura actual",
    "Window average": "Promedio de ventana",
    "Window minimum": "Mínimo de ventana",
    "Router peak": "Pico del router",
    "Sensors online": "Sensores en línea",
    "Current maximum": "Máximo actual",
    "Average now": "Promedio actual",
    "Sensors above warm": "Sensores por encima de cálido",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "Seleccione un sensor para ver el historial de temperatura limpio. El gráfico mantiene un búfer local rotativo, mientras que los valores pico provienen de la sesión rpcd actual del router.",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC no disponible temporalmente. Mostrando la última muestra exitosa.",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC no disponible temporalmente. Esperando datos de temperatura...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "Monitoreo de sensores térmicos. Los colores indican: verde - normal, amarillo - cálido, naranja - caliente, rojo - crítico.",

    // Backup & Restore
    "Backup & Restore": "Copia de seguridad",
    "Export your theme settings to a file or import from a previously saved backup.":
      "Exporte la configuración del tema a un archivo o importe desde una copia de seguridad guardada anteriormente.",
    "Export Settings": "Exportar configuración",
    "Import Settings": "Importar configuración",
    "Reset to Defaults": "Restablecer valores predeterminados",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "¿Está seguro de que desea restablecer toda la configuración del tema? Esta acción no se puede deshacer.",
    "Settings exported successfully": "Configuración exportada con éxito",
    "Settings imported successfully": "Configuración importada con éxito",
    "Invalid backup file": "Archivo de copia de seguridad no válido",
    "No settings found in file": "No se encontró configuración en el archivo",
    "Failed to read backup file":
      "Error al leer el archivo de copia de seguridad",
    "Open package repository": "Abrir repositorio de paquetes",
  },

  pt: {
    // Services Widget - Header
    "Services Monitor": "Monitor de Serviços",
    "Widget Settings": "Configurações de Widgets",
    "Add Service": "Adicionar Serviço",
    Services: "Serviços",
    Widgets: "Widgets",
    Ready: "Pronto",

    // Empty state
    "Click ⚙ to add services": "Clique em ⚙ para adicionar serviços",

    // Categories
    "My Services": "Meus Serviços",
    Network: "Rede",
    Security: "Segurança",
    VPN: "VPN",
    "Ad Blocking": "Bloqueio de Anúncios",
    System: "Sistema",
    Other: "Outro",

    // Service descriptions
    "DNS and DHCP server": "Servidor DNS e DHCP",
    Firewall: "Firewall",
    "Network interfaces": "Interfaces de rede",
    "LuCI web server": "Servidor web LuCI",
    "DHCPv6 server": "Servidor DHCPv6",
    "SSH access": "Acesso SSH",
    "Time sync": "Sincronização de hora",
    "Task scheduler": "Agendador de tarefas",
    "VPN service": "Serviço VPN",
    "Ad blocking": "Bloqueio de anúncios",
    "System service": "Serviço do sistema",

    // Status (uppercase - for badges)
    RUNNING: "EXECUTANDO",
    STOPPED: "PARADO",
    UNKNOWN: "DESCONHECIDO",

    // Status (capitalized - for logs)
    Running: "Executando",
    Stopped: "Parado",
    Error: "Erro",
    Unknown: "Desconhecido",
    Disabled: "Desabilitado",
    "Checking...": "Verificando...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "Monitorar e gerenciar serviços do sistema. Clique no cartão do serviço para ver detalhes e controlar ações.",

    // Actions
    Start: "Iniciar",
    Stop: "Parar",
    Restart: "Reiniciar",
    Enable: "Habilitar",
    Disable: "Desabilitar",
    Remove: "Remover",
    Cancel: "Cancelar",
    Add: "Adicionar",
    Close: "Fechar",
    Reset: "Redefinir",

    // Reboot confirmation
    "Confirm Reboot": "Confirmar reinicialização",
    "Are you sure you want to reboot the system?":
      "Tem certeza de que deseja reiniciar o sistema?",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "Esta ação reiniciará seu roteador e interromperá temporariamente a conectividade de rede.",
    "Reboot Now": "Reiniciar agora",

    // Modal - service list
    "Available services": "Serviços disponíveis",
    "Selected services": "Serviços selecionados",
    "Search...": "Pesquisar...",
    "Semantic search...": "Pesquisa semântica...",
    "No results found": "Nenhum resultado encontrado",
    "No semantic matches": "Nenhuma correspondência semântica encontrada",
    "Enable semantic search": "Ativar pesquisa semântica",
    "Disable semantic search": "Desativar pesquisa semântica",
    "Search services...": "Pesquisar serviços...",
    "Search or add custom service...":
      "Pesquisar ou adicionar serviço personalizado...",
    Search: "Pesquisar",
    "Opening service list...": "Abrindo lista de serviços...",
    "Custom service name": "Nome do serviço",
    "Enter custom service name...": "Digite o nome do serviço...",
    "Add custom service": "Adicionar serviço personalizado",
    "No services found": "Nenhum serviço encontrado",
    "Service not found in system": "Serviço não encontrado no sistema",
    "as custom": "como personalizado",
    "Or press Enter": "Ou pressione Enter",
    "already added": "já adicionado",
    custom: "personalizado",

    // Modal - validation
    "Letters, numbers, dash, underscore only":
      "Apenas letras, números, hífen, sublinhado",
    "Name too long (max 64 chars)": "Nome muito longo (máx. 64 caracteres)",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "Caracteres inválidos! Use: a-z, 0-9, -, _",
    "Already in your list": "Já está na sua lista",
    "Found in system": "Encontrado no sistema",
    "Custom service (not found in system)":
      "Serviço personalizado (não encontrado no sistema)",
    "Added successfully!": "Adicionado com sucesso!",
    "Not installed": "Não instalado",
    Added: "Adicionado",
    Removed: "Removido",

    // Loading states
    "Waiting for LuCI API...": "Aguardando API do LuCI...",
    "Loading...": "Carregando...",
    "Loading services...": "Carregando serviços...",
    "Checking services...": "Verificando serviços...",
    "Services loaded": "Serviços carregados",
    "Check complete": "Verificação concluída",

    // init.d
    "init.d services": "Serviços init.d",
    "Warning: init.d list empty": "Aviso: lista init.d vazia",

    // Messages
    "Service started": "Serviço iniciado",
    "Service stopped": "Serviço parado",
    "Service restarted": "Serviço reiniciado",
    "Service enabled": "Serviço habilitado",
    "Service disabled": "Serviço desabilitado",
    Success: "Sucesso",

    // Empty state
    "No services selected": "Nenhum serviço selecionado",
    "Click + to add services": "Clique em + para adicionar",

    // Theme Settings
    "Proton2025 Theme Settings": "Configurações do Tema Proton2025",
    "Theme Mode": "Modo do Tema",
    Auto: "Auto",
    Dark: "Escuro",
    Light: "Claro",
    "Choose light, dark, or follow system theme":
      "Escolher tema claro, escuro ou seguir o tema do sistema",
    "Choose light or dark theme": "Escolher tema claro ou escuro",
    "Accent Color": "Cor de Destaque",
    "Choose theme accent color": "Escolher cor de destaque do tema",
    Blue: "Azul",
    Purple: "Roxo",
    Green: "Verde",
    Orange: "Laranja",
    Red: "Vermelho",
    Default: "Padrão",
    "Border Radius": "Raio da Borda",
    "Corner rounding style": "Estilo de arredondamento de cantos",
    Sharp: "Afiado",
    Rounded: "Arredondado",
    "Extra Rounded": "Muito Arredondado",
    Zoom: "Zoom",
    "Interface scale": "Escala da interface",
    "Page Width": "Largura da página",
    "Content area width": "Largura da área de conteúdo",
    "Full width": "Largura total",
    Animations: "Animações",
    "Enable smooth transitions and effects":
      "Habilitar transições e efeitos suaves",
    Transparency: "Transparência",
    "Enable blur and transparency effects":
      "Habilitar efeitos de desfoque e transparência",
    "Services Widget": "Widget de Serviços",
    "Show services monitor on Overview page":
      "Mostrar monitor de serviços na página de visão geral",
    "Temperature Widget": "Widget de Temperatura",
    "Show temperature monitor on Overview page":
      "Mostrar monitor de temperatura na página de visão geral",
    "Deep Service Check": "Verificação profunda de serviços",
    "Accurate status for adblock, banip, etc.":
      "Status preciso para adblock, banip, etc.",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "Widget de temperatura habilitado. Visite Status → Visão Geral para vê-lo.",
    "Temperature widget disabled.": "Widget de temperatura desabilitado.",
    "Widget Log": "Registro do Widget",
    "Show activity log under the widget":
      "Mostrar registro de atividade sob o widget",
    "Table Text Wrap": "Quebra de Texto (Wireless)",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "Quebrar nomes longos de AP na tabela de Estações Associadas. Desativar para truncar com reticências.",
    "Log Highlighting": "Destaque de Logs",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "Visualizador de logs personalizado com destaque de sintaxe, números de linha e barra de ferramentas nas páginas de Log do Sistema e Log do Kernel.",
    "Custom Font (Inter)": "Fonte Inter",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "Usar a fonte Inter integrada para tipografia consistente em todos os dispositivos. Desativar para usar a fonte padrão do sistema.",
    "Proton2025 Update": "Atualização do Proton2025",
    "Check for Updates": "Verificar atualizações",
    "Open Release Page": "Abrir página de lançamento",
    "Install Update": "Instalar atualização",
    "Installing...": "Instalando...",
    "Installing Proton2025 update...": "Instalando atualização do Proton2025...",
    "Failed to install update.": "Falha ao instalar a atualização.",
    "Proton2025 update installed.": "Atualização do Proton2025 instalada.",
    "Update installed, but a newer version is still available.": "Atualização instalada, mas uma versão mais recente ainda está disponível.",
    "Current version": "Versão atual",
    "Latest version": "Versão mais recente",
    "Click the button to check for a new Proton2025 release.": "Clique no botão para verificar uma nova versão do Proton2025.",
    "Checking latest Proton2025 release...": "Verificando a versão mais recente do Proton2025...",
    "Failed to check for updates.": "Falha ao verificar atualizações.",
    "A new Proton2025 version is available.": "Uma nova versão do Proton2025 está disponível.",
    "Proton2025 is up to date.": "O Proton2025 está atualizado.",
    "Search Page Index": "Índice de páginas de pesquisa",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "Crie ou limpe manualmente o índice de pesquisa LuCI em cache quando as páginas do menu mudarem.",
    "Indexed Data Size": "Tamanho dos dados indexados",
    "Index Pages Now": "Indexar páginas agora",
    "Clear Indexed Data": "Limpar dados indexados",
    "Search index is ready to be built.":
      "O índice de pesquisa está pronto para ser criado.",
    "Indexing in progress...": "Indexação em andamento...",
    "Cancel Indexing": "Cancelar indexação",
    "Indexing canceled.": "Indexação cancelada.",
    "Indexing canceled": "Indexação cancelada",
    "You can start indexing again at any time.":
      "Você pode iniciar a indexação novamente a qualquer momento.",
    "Indexed routes": "Rotas indexadas",
    "Cached entries": "Entradas em cache",
    "Last indexed": "Última indexação",
    "Index errors": "Erros de indexação",
    "Not indexed yet": "Ainda não indexado",
    "Search index updated successfully.":
      "Índice de pesquisa atualizado com sucesso.",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "Limpar os dados de pesquisa indexados? Isso removerá as páginas de pesquisa em cache no roteador até a próxima indexação.",

    // Log Viewer UI
    lines: "linhas",
    "crit.": "crít.",
    "err.": "err.",
    "warn.": "alerta",
    "den.": "neg.",
    "disc.": "desc.",
    ok: "ok",
    Critical: "Críticos",
    Errors: "Erros",
    Warnings: "Alertas",
    Denied: "Negados",
    Disconnects: "Desconexões",
    Successful: "Sucesso",
    "Word Wrap": "Quebra de linha",
    "Hide Timestamps": "Ocultar carimbos de hora",
    "Copy Log": "Copiar log",
    "Download Log": "Baixar log",
    "Scroll to Top": "Ir ao topo",
    "Scroll to Bottom": "Ir ao final",
    "Fullscreen Mode": "Modo tela cheia",
    "Exit Fullscreen": "Sair da tela cheia",

    "Services widget enabled. Visit Status → Overview to see it.":
      "Widget de serviços habilitado. Visite Status → Visão Geral para vê-lo.",
    "Services widget disabled.": "Widget de serviços desabilitado.",

    // Load Average
    "1 min": "1 min",
    "5 min": "5 min",
    "15 min": "15 min",
    "1 MIN": "1 MIN",
    "5 MIN": "5 MIN",
    "15 MIN": "15 MIN",
    "System Load Average": "Carga Média do Sistema",
    "Load Average": "Carga Média",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "Mostra o número médio de processos aguardando execução da CPU. Os três valores representam os últimos 1, 5 e 15 minutos.",
    "Low load": "Carga baixa",
    "Medium load": "Carga média",
    "High load": "Carga alta",
    cores: "núcleos",

    // Footer
    "Powered by": "Desenvolvido por",

    // Temperature Widget
    Temperature: "Temperatura",
    "Temperature Monitor": "Monitor de Temperatura",
    "No temperature sensors found": "Nenhum sensor de temperatura encontrado",
    CPU: "CPU",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "Placa",
    Normal: "Normal",
    Warm: "Morno",
    Hot: "Quente",
    Critical: "Crítico",
    "Temperature normal": "Temperatura normal",
    "Temperature elevated": "Temperatura elevada",
    "Temperature high": "Temperatura alta",
    "Temperature critical": "Temperatura crítica",
    Sensor: "Sensor",
    Current: "Atual",
    Peak: "Pico",
    s: "s",
    min: "min",
    "10 min": "10 min",
    "All sensors": "Todos os sensores",
    Sensors: "Sensores",
    Window: "Janela",
    Interval: "Intervalo",
    "Data received at": "Dados recebidos às",
    "Last update": "Última atualização",
    "Temperature Realtime": "Temperatura em tempo real",
    "Temperature history": "Histórico de temperatura",
    "Temperature history chart": "Gráfico do histórico de temperatura",
    "Sensor statistics": "Estatísticas do sensor",
    "Point value": "Valor do ponto",
    "Change vs previous": "Variação em relação ao anterior",
    Minimum: "Mínimo",
    Average: "Média",
    Status: "Status",
    "Current reading": "Leitura atual",
    "Window average": "Média da janela",
    "Window minimum": "Mínimo da janela",
    "Router peak": "Pico do roteador",
    "Sensors online": "Sensores online",
    "Current maximum": "Máximo atual",
    "Average now": "Média atual",
    "Sensors above warm": "Sensores acima de morno",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "Selecione um sensor para visualizar o histórico de temperatura limpo. O gráfico mantém um buffer local rotativo, enquanto os valores de pico vêm da sessão rpcd atual do roteador.",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC temporariamente indisponível. Exibindo a última amostra bem-sucedida.",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC temporariamente indisponível. Aguardando dados de temperatura...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "Monitoramento de sensores térmicos. As cores indicam: verde - normal, amarelo - morno, laranja - quente, vermelho - crítico.",

    // Backup & Restore
    "Backup & Restore": "Backup e restauração",
    "Export your theme settings to a file or import from a previously saved backup.":
      "Exporte as configurações do tema para um arquivo ou importe de um backup salvo anteriormente.",
    "Export Settings": "Exportar configurações",
    "Import Settings": "Importar configurações",
    "Reset to Defaults": "Restaurar padrões",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "Tem certeza de que deseja redefinir todas as configurações do tema? Esta ação não pode ser desfeita.",
    "Settings exported successfully": "Configurações exportadas com sucesso",
    "Settings imported successfully": "Configurações importadas com sucesso",
    "Invalid backup file": "Arquivo de backup inválido",
    "No settings found in file": "Nenhuma configuração encontrada no arquivo",
    "Failed to read backup file": "Falha ao ler o arquivo de backup",
    "Open package repository": "Abrir repositório de pacotes",
  },

  pl: {
    // Services Widget - Header
    "Services Monitor": "Monitor Usług",
    "Widget Settings": "Ustawienia Widżetów",
    "Add Service": "Dodaj Usługę",
    Services: "Usługi",
    Widgets: "Widżety",
    Ready: "Gotowy",

    // Empty state
    "Click ⚙ to add services": "Kliknij ⚙, aby dodać usługi",

    // Categories
    "My Services": "Moje Usługi",
    Network: "Sieć",
    Security: "Bezpieczeństwo",
    VPN: "VPN",
    "Ad Blocking": "Blokowanie Reklam",
    System: "System",
    Other: "Inne",

    // Service descriptions
    "DNS and DHCP server": "Serwer DNS i DHCP",
    Firewall: "Zapora sieciowa",
    "Network interfaces": "Interfejsy sieciowe",
    "LuCI web server": "Serwer WWW LuCI",
    "DHCPv6 server": "Serwer DHCPv6",
    "SSH access": "Dostęp SSH",
    "Time sync": "Synchronizacja czasu",
    "Task scheduler": "Harmonogram zadań",
    "VPN service": "Usługa VPN",
    "Ad blocking": "Blokowanie reklam",
    "System service": "Usługa systemowa",

    // Status (uppercase - for badges)
    RUNNING: "DZIAŁA",
    STOPPED: "ZATRZYMANY",
    UNKNOWN: "NIEZNANY",

    // Status (capitalized - for logs)
    Running: "Działa",
    Stopped: "Zatrzymany",
    Error: "Błąd",
    Unknown: "Nieznany",
    Disabled: "Wyłączony",
    "Checking...": "Sprawdzanie...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "Monitoruj i zarządzaj usługami systemowymi. Kliknij kartę usługi, aby zobaczyć szczegóły i kontrolować działania.",

    // Actions
    Start: "Uruchom",
    Stop: "Zatrzymaj",
    Restart: "Uruchom ponownie",
    Enable: "Włącz",
    Disable: "Wyłącz",
    Remove: "Usuń",
    Cancel: "Anuluj",
    Add: "Dodaj",
    Close: "Zamknij",
    Reset: "Resetuj",

    // Reboot confirmation
    "Confirm Reboot": "Potwierdź restart",
    "Are you sure you want to reboot the system?":
      "Czy na pewno chcesz zrestartować system?",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "Ta akcja zrestartuje router i tymczasowo przerwie połączenie sieciowe.",
    "Reboot Now": "Restartuj teraz",

    // Modal - service list
    "Available services": "Dostępne usługi",
    "Selected services": "Wybrane usługi",
    "Search...": "Szukaj...",
    "Semantic search...": "Wyszukiwanie semantyczne...",
    "No results found": "Nie znaleziono wyników",
    "No semantic matches": "Nie znaleziono dopasowań semantycznych",
    "Enable semantic search": "Włącz wyszukiwanie semantyczne",
    "Disable semantic search": "Wyłącz wyszukiwanie semantyczne",
    "Search services...": "Szukaj usług...",
    "Search or add custom service...": "Szukaj lub dodaj własną usługę...",
    Search: "Szukaj",
    "Opening service list...": "Otwieranie listy usług...",
    "Custom service name": "Nazwa usługi",
    "Enter custom service name...": "Wprowadź nazwę usługi...",
    "Add custom service": "Dodaj własną usługę",
    "No services found": "Nie znaleziono usług",
    "Service not found in system": "Usługa nie znaleziona w systemie",
    "as custom": "jako własna",
    "Or press Enter": "Lub naciśnij Enter",
    "already added": "już dodana",
    custom: "własna",

    // Modal - validation
    "Letters, numbers, dash, underscore only":
      "Tylko litery, cyfry, myślnik, podkreślenie",
    "Name too long (max 64 chars)": "Nazwa za długa (maks. 64 znaki)",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "Nieprawidłowe znaki! Użyj: a-z, 0-9, -, _",
    "Already in your list": "Już na Twojej liście",
    "Found in system": "Znaleziono w systemie",
    "Custom service (not found in system)":
      "Własna usługa (nie znaleziona w systemie)",
    "Added successfully!": "Dodano pomyślnie!",
    "Not installed": "Nie zainstalowano",
    Added: "Dodano",
    Removed: "Usunięto",

    // Loading states
    "Waiting for LuCI API...": "Oczekiwanie na API LuCI...",
    "Loading...": "Ładowanie...",
    "Loading services...": "Ładowanie usług...",
    "Checking services...": "Sprawdzanie usług...",
    "Services loaded": "Usługi załadowane",
    "Check complete": "Sprawdzanie zakończone",

    // init.d
    "init.d services": "Usługi init.d",
    "Warning: init.d list empty": "Uwaga: lista init.d jest pusta",

    // Messages
    "Service started": "Usługa uruchomiona",
    "Service stopped": "Usługa zatrzymana",
    "Service restarted": "Usługa uruchomiona ponownie",
    "Service enabled": "Usługa włączona",
    "Service disabled": "Usługa wyłączona",
    Success: "Sukces",

    // Empty state
    "No services selected": "Nie wybrano usług",
    "Click + to add services": "Kliknij + aby dodać",

    // Theme Settings
    "Proton2025 Theme Settings": "Ustawienia Motywu Proton2025",
    "Theme Mode": "Tryb Motywu",
    Auto: "Auto",
    Dark: "Ciemny",
    Light: "Jasny",
    "Choose light, dark, or follow system theme":
      "Wybierz jasny, ciemny motyw lub podążanie za motywem systemowym",
    "Choose light or dark theme": "Wybierz jasny lub ciemny motyw",
    "Accent Color": "Kolor Akcentu",
    "Choose theme accent color": "Wybierz kolor akcentu motywu",
    Blue: "Niebieski",
    Purple: "Fioletowy",
    Green: "Zielony",
    Orange: "Pomarańczowy",
    Red: "Czerwony",
    Default: "Domyślny",
    "Border Radius": "Promień Obramowania",
    "Corner rounding style": "Styl zaokrąglenia rogów",
    Sharp: "Ostre",
    Rounded: "Zaokrąglone",
    "Extra Rounded": "Bardzo Zaokrąglone",
    Zoom: "Powiększenie",
    "Interface scale": "Skala interfejsu",
    "Page Width": "Szerokość strony",
    "Content area width": "Szerokość obszaru treści",
    "Full width": "Pełna szerokość",
    Animations: "Animacje",
    "Enable smooth transitions and effects": "Włącz płynne przejścia i efekty",
    Transparency: "Przezroczystość",
    "Enable blur and transparency effects":
      "Włącz efekty rozmycia i przezroczystości",
    "Services Widget": "Widżet Usług",
    "Show services monitor on Overview page":
      "Pokaż monitor usług na stronie przeglądu",
    "Temperature Widget": "Widżet Temperatury",
    "Show temperature monitor on Overview page":
      "Pokaż monitor temperatury na stronie przeglądu",
    "Deep Service Check": "Głęboka kontrola usług",
    "Accurate status for adblock, banip, etc.":
      "Dokładny status dla adblock, banip itp.",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "Widżet temperatury włączony. Odwiedź Status → Przegląd, aby go zobaczyć.",
    "Temperature widget disabled.": "Widżet temperatury wyłączony.",
    "Widget Log": "Dziennik Widżetu",
    "Show activity log under the widget":
      "Pokaż dziennik aktywności pod widżetem",
    "Table Text Wrap": "Zawijanie Tekstu (Wireless)",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "Zawijaj długie nazwy AP w tabeli Powiązanych Stacji. Wyłącz, aby obciąć wielokropkiem.",
    "Log Highlighting": "Podświetlanie Logów",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "Niestandardowa przeglądarka logów z podświetlaniem składni, numerami wierszy i paskiem narzędzi na stronach Dziennika Systemowego i Dziennika Jądra.",
    "Custom Font (Inter)": "Czcionka Inter",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "Użyj wbudowanej czcionki Inter dla spójnej typografii na wszystkich urządzeniach. Wyłącz, aby użyć domyślnej czcionki systemowej.",
    "Proton2025 Update": "Aktualizacja Proton2025",
    "Check for Updates": "Sprawdź aktualizacje",
    "Open Release Page": "Otwórz stronę wydania",
    "Install Update": "Zainstaluj aktualizację",
    "Installing...": "Instalowanie...",
    "Installing Proton2025 update...": "Instalowanie aktualizacji Proton2025...",
    "Failed to install update.": "Nie udało się zainstalować aktualizacji.",
    "Proton2025 update installed.": "Aktualizacja Proton2025 została zainstalowana.",
    "Update installed, but a newer version is still available.": "Aktualizacja została zainstalowana, ale nowsza wersja nadal jest dostępna.",
    "Current version": "Bieżąca wersja",
    "Latest version": "Najnowsza wersja",
    "Click the button to check for a new Proton2025 release.": "Kliknij przycisk, aby sprawdzić nowe wydanie Proton2025.",
    "Checking latest Proton2025 release...": "Sprawdzanie najnowszego wydania Proton2025...",
    "Failed to check for updates.": "Nie udało się sprawdzić aktualizacji.",
    "A new Proton2025 version is available.": "Dostępna jest nowa wersja Proton2025.",
    "Proton2025 is up to date.": "Proton2025 jest aktualny.",
    "Search Page Index": "Indeks stron wyszukiwania",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "Ręcznie zbuduj lub wyczyść buforowany indeks wyszukiwania LuCI, gdy zmienią się strony menu.",
    "Indexed Data Size": "Rozmiar zindeksowanych danych",
    "Index Pages Now": "Indeksuj strony teraz",
    "Clear Indexed Data": "Wyczyść zindeksowane dane",
    "Search index is ready to be built.":
      "Indeks wyszukiwania jest gotowy do utworzenia.",
    "Indexing in progress...": "Trwa indeksowanie...",
    "Cancel Indexing": "Anuluj indeksowanie",
    "Indexing canceled.": "Indeksowanie anulowane.",
    "Indexing canceled": "Indeksowanie anulowane",
    "You can start indexing again at any time.":
      "Możesz ponownie uruchomić indeksowanie w dowolnym momencie.",
    "Indexed routes": "Zindeksowane trasy",
    "Cached entries": "Wpisy w pamięci podręcznej",
    "Last indexed": "Ostatnie indeksowanie",
    "Index errors": "Błędy indeksowania",
    "Not indexed yet": "Jeszcze nie zindeksowano",
    "Search index updated successfully.":
      "Indeks wyszukiwania został pomyślnie zaktualizowany.",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "Czy wyczyścić zindeksowane dane wyszukiwania? To usunie zapisane w pamięci podręcznej strony wyszukiwania na routerze do następnego uruchomienia indeksowania.",

    // Log Viewer UI
    lines: "wierszy",
    "crit.": "kryt.",
    "err.": "bł.",
    "warn.": "ostrz.",
    "den.": "odrz.",
    "disc.": "rozł.",
    ok: "ok",
    Critical: "Krytyczne",
    Errors: "Błędy",
    Warnings: "Ostrzeżenia",
    Denied: "Odrzucone",
    Disconnects: "Rozłączenia",
    Successful: "Udane",
    "Word Wrap": "Zawijanie wierszy",
    "Hide Timestamps": "Ukryj znaczniki czasu",
    "Copy Log": "Kopiuj log",
    "Download Log": "Pobierz log",
    "Scroll to Top": "Na początek",
    "Scroll to Bottom": "Na koniec",
    "Fullscreen Mode": "Tryb pełnoekranowy",
    "Exit Fullscreen": "Opuść pełny ekran",

    "Services widget enabled. Visit Status → Overview to see it.":
      "Widżet usług włączony. Odwiedź Status → Przegląd, aby go zobaczyć.",
    "Services widget disabled.": "Widżet usług wyłączony.",

    // Load Average
    "1 min": "1 min",
    "5 min": "5 min",
    "15 min": "15 min",
    "1 MIN": "1 MIN",
    "5 MIN": "5 MIN",
    "15 MIN": "15 MIN",
    "System Load Average": "Średnie Obciążenie Systemu",
    "Load Average": "Średnie Obciążenie",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "Pokazuje średnią liczbę procesów oczekujących na wykonanie przez CPU. Trzy wartości reprezentują ostatnie 1, 5 i 15 minut.",
    "Low load": "Niskie obciążenie",
    "Medium load": "Średnie obciążenie",
    "High load": "Wysokie obciążenie",
    cores: "rdzenie",

    // Footer
    "Powered by": "Napędzane przez",

    // Temperature Widget
    Temperature: "Temperatura",
    "Temperature Monitor": "Monitor Temperatury",
    "No temperature sensors found": "Nie znaleziono czujników temperatury",
    CPU: "CPU",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "Płyta",
    Normal: "Normalna",
    Warm: "Ciepła",
    Hot: "Gorąca",
    Critical: "Krytyczna",
    "Temperature normal": "Temperatura normalna",
    "Temperature elevated": "Temperatura podwyższona",
    "Temperature high": "Temperatura wysoka",
    "Temperature critical": "Temperatura krytyczna",
    Sensor: "Czujnik",
    Current: "Aktualna",
    Peak: "Szczyt",
    s: "s",
    min: "min",
    "10 min": "10 min",
    "All sensors": "Wszystkie czujniki",
    Sensors: "Czujniki",
    Window: "Okno",
    Interval: "Interwał",
    "Data received at": "Dane odebrane o",
    "Last update": "Ostatnia aktualizacja",
    "Temperature Realtime": "Temperatura w czasie rzeczywistym",
    "Temperature history": "Historia temperatury",
    "Temperature history chart": "Wykres historii temperatury",
    "Sensor statistics": "Statystyki czujnika",
    "Point value": "Wartość punktu",
    "Change vs previous": "Zmiana względem poprzedniego",
    Minimum: "Minimum",
    Average: "Średnia",
    Status: "Status",
    "Current reading": "Bieżący odczyt",
    "Window average": "Średnia okna",
    "Window minimum": "Minimum okna",
    "Router peak": "Szczyt routera",
    "Sensors online": "Czujniki online",
    "Current maximum": "Bieżące maksimum",
    "Average now": "Bieżąca średnia",
    "Sensors above warm": "Czujniki powyżej ciepłej",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "Wybierz czujnik, aby wyświetlić czytelną historię temperatury. Wykres przechowuje lokalny bufor kroczący, a wartości szczytowe pochodzą z bieżącej sesji rpcd routera.",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC tymczasowo niedostępny. Pokazuję ostatnią pomyślną próbkę.",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC tymczasowo niedostępny. Oczekiwanie na dane temperatury...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "Monitorowanie czujników termicznych. Kolory oznaczają: zielony - normalna, żółty - ciepła, pomarańczowy - gorąca, czerwony - krytyczna.",

    // Backup & Restore
    "Backup & Restore": "Kopia zapasowa",
    "Export your theme settings to a file or import from a previously saved backup.":
      "Wyeksportuj ustawienia motywu do pliku lub zaimportuj z wcześniej zapisanej kopii zapasowej.",
    "Export Settings": "Eksportuj ustawienia",
    "Import Settings": "Importuj ustawienia",
    "Reset to Defaults": "Przywróć domyślne",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "Czy na pewno chcesz zresetować wszystkie ustawienia motywu? Tej operacji nie można cofnąć.",
    "Settings exported successfully": "Ustawienia wyeksportowane pomyślnie",
    "Settings imported successfully": "Ustawienia zaimportowane pomyślnie",
    "Invalid backup file": "Nieprawidłowy plik kopii zapasowej",
    "No settings found in file": "Nie znaleziono ustawień w pliku",
    "Failed to read backup file":
      "Nie udało się odczytać pliku kopii zapasowej",
    "Open package repository": "Otwórz repozytorium pakietów",
  },

  fr: {
    // Services Widget - Header
    "Services Monitor": "Moniteur de Services",
    "Widget Settings": "Paramètres des Widgets",
    "Add Service": "Ajouter un Service",
    Services: "Services",
    Widgets: "Widgets",
    Ready: "Prêt",

    // Empty state
    "Click ⚙ to add services": "Cliquez sur ⚙ pour ajouter des services",

    // Categories
    "My Services": "Mes Services",
    Network: "Réseau",
    Security: "Sécurité",
    VPN: "VPN",
    "Ad Blocking": "Blocage de Publicités",
    System: "Système",
    Other: "Autre",

    // Service descriptions
    "DNS and DHCP server": "Serveur DNS et DHCP",
    Firewall: "Pare-feu",
    "Network interfaces": "Interfaces réseau",
    "LuCI web server": "Serveur web LuCI",
    "DHCPv6 server": "Serveur DHCPv6",
    "SSH access": "Accès SSH",
    "Time sync": "Synchronisation de l'heure",
    "Task scheduler": "Planificateur de tâches",
    "VPN service": "Service VPN",
    "Ad blocking": "Blocage de publicités",
    "System service": "Service système",

    // Status (uppercase - for badges)
    RUNNING: "EN COURS",
    STOPPED: "ARRÊTÉ",
    UNKNOWN: "INCONNU",

    // Status (capitalized - for logs)
    Running: "En cours",
    Stopped: "Arrêté",
    Error: "Erreur",
    Unknown: "Inconnu",
    Disabled: "Désactivé",
    "Checking...": "Vérification...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "Surveiller et gérer les services système. Cliquez sur la carte du service pour voir les détails et contrôler les actions.",

    // Actions
    Start: "Démarrer",
    Stop: "Arrêter",
    Restart: "Redémarrer",
    Enable: "Activer",
    Disable: "Désactiver",
    Remove: "Supprimer",
    Cancel: "Annuler",
    Add: "Ajouter",
    Close: "Fermer",
    Reset: "Réinitialiser",

    // Reboot confirmation
    "Confirm Reboot": "Confirmer le redémarrage",
    "Are you sure you want to reboot the system?":
      "Êtes-vous sûr de vouloir redémarrer le système ?",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "Cette action redémarrera votre routeur et interrompra temporairement la connectivité réseau.",
    "Reboot Now": "Redémarrer maintenant",

    // Modal - service list
    "Available services": "Services disponibles",
    "Selected services": "Services sélectionnés",
    "Search...": "Rechercher...",
    "Semantic search...": "Recherche sémantique...",
    "No results found": "Aucun résultat trouvé",
    "No semantic matches": "Aucune correspondance sémantique trouvée",
    "Enable semantic search": "Activer la recherche sémantique",
    "Disable semantic search": "Désactiver la recherche sémantique",
    "Search services...": "Rechercher des services...",
    "Search or add custom service...":
      "Rechercher ou ajouter un service personnalisé...",
    Search: "Rechercher",
    "Opening service list...": "Ouverture de la liste des services...",
    "Custom service name": "Nom du service",
    "Enter custom service name...": "Entrez le nom du service...",
    "Add custom service": "Ajouter un service personnalisé",
    "No services found": "Aucun service trouvé",
    "Service not found in system": "Service non trouvé dans le système",
    "as custom": "comme personnalisé",
    "Or press Enter": "Ou appuyez sur Entrée",
    "already added": "déjà ajouté",
    custom: "personnalisé",

    // Modal - validation
    "Letters, numbers, dash, underscore only":
      "Lettres, chiffres, tiret, souligné uniquement",
    "Name too long (max 64 chars)": "Nom trop long (max. 64 caractères)",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "Caractères invalides ! Utilisez : a-z, 0-9, -, _",
    "Already in your list": "Déjà dans votre liste",
    "Found in system": "Trouvé dans le système",
    "Custom service (not found in system)":
      "Service personnalisé (non trouvé dans le système)",
    "Added successfully!": "Ajouté avec succès !",
    "Not installed": "Non installé",
    Added: "Ajouté",
    Removed: "Supprimé",

    // Loading states
    "Waiting for LuCI API...": "En attente de l'API LuCI...",
    "Loading...": "Chargement...",
    "Loading services...": "Chargement des services...",
    "Checking services...": "Vérification des services...",
    "Services loaded": "Services chargés",
    "Check complete": "Vérification terminée",

    // init.d
    "init.d services": "Services init.d",
    "Warning: init.d list empty": "Attention : liste init.d vide",

    // Messages
    "Service started": "Service démarré",
    "Service stopped": "Service arrêté",
    "Service restarted": "Service redémarré",
    "Service enabled": "Service activé",
    "Service disabled": "Service désactivé",
    Success: "Succès",

    // Empty state
    "No services selected": "Aucun service sélectionné",
    "Click + to add services": "Cliquez sur + pour ajouter",

    // Theme Settings
    "Proton2025 Theme Settings": "Paramètres du Thème Proton2025",
    "Theme Mode": "Mode du Thème",
    Auto: "Auto",
    Dark: "Sombre",
    Light: "Clair",
    "Choose light, dark, or follow system theme":
      "Choisir un thème clair, sombre ou suivre le thème du système",
    "Choose light or dark theme": "Choisir un thème clair ou sombre",
    "Accent Color": "Couleur d'Accent",
    "Choose theme accent color": "Choisir la couleur d'accent du thème",
    Blue: "Bleu",
    Purple: "Violet",
    Green: "Vert",
    Orange: "Orange",
    Red: "Rouge",
    Default: "Par défaut",
    "Border Radius": "Rayon de Bordure",
    "Corner rounding style": "Style d'arrondi des coins",
    Sharp: "Net",
    Rounded: "Arrondi",
    "Extra Rounded": "Très Arrondi",
    Zoom: "Zoom",
    "Interface scale": "Échelle de l'interface",
    "Page Width": "Largeur de page",
    "Content area width": "Largeur de la zone de contenu",
    "Full width": "Pleine largeur",
    Animations: "Animations",
    "Enable smooth transitions and effects":
      "Activer les transitions et effets fluides",
    Transparency: "Transparence",
    "Enable blur and transparency effects":
      "Activer les effets de flou et de transparence",
    "Services Widget": "Widget de Services",
    "Show services monitor on Overview page":
      "Afficher le moniteur de services sur la page d'aperçu",
    "Temperature Widget": "Widget de Température",
    "Show temperature monitor on Overview page":
      "Afficher le moniteur de température sur la page d'aperçu",
    "Deep Service Check": "Vérification approfondie des services",
    "Accurate status for adblock, banip, etc.":
      "Statut précis pour adblock, banip, etc.",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "Widget de température activé. Visitez Statut → Aperçu pour le voir.",
    "Temperature widget disabled.": "Widget de température désactivé.",
    "Widget Log": "Journal du Widget",
    "Show activity log under the widget":
      "Afficher le journal d'activité sous le widget",
    "Table Text Wrap": "Retour à la Ligne (Sans-fil)",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "Retourner à la ligne les noms d'AP longs dans le tableau des Stations Associées. Désactiver pour tronquer avec des points de suspension.",
    "Log Highlighting": "Coloration des Journaux",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "Visionneuse de journaux personnalisée avec coloration syntaxique, numéros de ligne et barre d'outils sur les pages Journal Système et Journal du Noyau.",
    "Custom Font (Inter)": "Police Inter",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "Utiliser la police Inter intégrée pour une typographie cohérente sur tous les appareils. Désactiver pour utiliser la police système par défaut.",
    "Proton2025 Update": "Mise à jour de Proton2025",
    "Check for Updates": "Rechercher des mises à jour",
    "Open Release Page": "Ouvrir la page de publication",
    "Install Update": "Installer la mise à jour",
    "Installing...": "Installation...",
    "Installing Proton2025 update...": "Installation de la mise à jour Proton2025...",
    "Failed to install update.": "Impossible d’installer la mise à jour.",
    "Proton2025 update installed.": "Mise à jour de Proton2025 installée.",
    "Update installed, but a newer version is still available.": "Mise à jour installée, mais une version plus récente est toujours disponible.",
    "Current version": "Version actuelle",
    "Latest version": "Dernière version",
    "Click the button to check for a new Proton2025 release.": "Cliquez sur le bouton pour rechercher une nouvelle version de Proton2025.",
    "Checking latest Proton2025 release...": "Recherche de la dernière version de Proton2025...",
    "Failed to check for updates.": "Impossible de rechercher les mises à jour.",
    "A new Proton2025 version is available.": "Une nouvelle version de Proton2025 est disponible.",
    "Proton2025 is up to date.": "Proton2025 est à jour.",
    "Search Page Index": "Index des pages de recherche",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "Créez ou effacez manuellement l’index de recherche LuCI en cache lorsque les pages du menu changent.",
    "Indexed Data Size": "Taille des données indexées",
    "Index Pages Now": "Indexer les pages maintenant",
    "Clear Indexed Data": "Effacer les données indexées",
    "Search index is ready to be built.":
      "L'index de recherche est prêt à être créé.",
    "Indexing in progress...": "Indexation en cours...",
    "Cancel Indexing": "Annuler l’indexation",
    "Indexing canceled.": "Indexation annulée.",
    "Indexing canceled": "Indexation annulée",
    "You can start indexing again at any time.":
      "Vous pouvez relancer l’indexation à tout moment.",
    "Indexed routes": "Routes indexées",
    "Cached entries": "Entrées en cache",
    "Last indexed": "Dernière indexation",
    "Index errors": "Erreurs d'indexation",
    "Not indexed yet": "Pas encore indexé",
    "Search index updated successfully.":
      "Index de recherche mis à jour avec succès.",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "Effacer les données de recherche indexées ? Cela supprimera les pages de recherche mises en cache sur le routeur jusqu'à la prochaine indexation.",

    // Log Viewer UI
    lines: "lignes",
    "crit.": "crit.",
    "err.": "err.",
    "warn.": "avert.",
    "den.": "refusé",
    "disc.": "déconn.",
    ok: "ok",
    Critical: "Critiques",
    Errors: "Erreurs",
    Warnings: "Avertissements",
    Denied: "Refusés",
    Disconnects: "Déconnexions",
    Successful: "Réussis",
    "Word Wrap": "Retour à la ligne",
    "Hide Timestamps": "Masquer horodatages",
    "Copy Log": "Copier le journal",
    "Download Log": "Télécharger le journal",
    "Scroll to Top": "Aller en haut",
    "Scroll to Bottom": "Aller en bas",
    "Fullscreen Mode": "Mode plein écran",
    "Exit Fullscreen": "Quitter le plein écran",

    "Services widget enabled. Visit Status → Overview to see it.":
      "Widget de services activé. Visitez Statut → Aperçu pour le voir.",
    "Services widget disabled.": "Widget de services désactivé.",

    // Load Average
    "1 min": "1 min",
    "5 min": "5 min",
    "15 min": "15 min",
    "1 MIN": "1 MIN",
    "5 MIN": "5 MIN",
    "15 MIN": "15 MIN",
    "System Load Average": "Charge Moyenne du Système",
    "Load Average": "Charge Moyenne",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "Affiche le nombre moyen de processus en attente d'exécution CPU. Les trois valeurs représentent les dernières 1, 5 et 15 minutes.",
    "Low load": "Charge faible",
    "Medium load": "Charge moyenne",
    "High load": "Charge élevée",
    cores: "cœurs",

    // Footer
    "Powered by": "Propulsé par",

    // Temperature Widget
    Temperature: "Température",
    "Temperature Monitor": "Moniteur de Température",
    "No temperature sensors found": "Aucun capteur de température trouvé",
    CPU: "CPU",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "Carte",
    Normal: "Normal",
    Warm: "Chaud",
    Hot: "Très chaud",
    Critical: "Critique",
    "Temperature normal": "Température normale",
    "Temperature elevated": "Température élevée",
    "Temperature high": "Température haute",
    "Temperature critical": "Température critique",
    Sensor: "Capteur",
    Current: "Actuelle",
    Peak: "Pic",
    s: "s",
    min: "min",
    "10 min": "10 min",
    "All sensors": "Tous les capteurs",
    Sensors: "Capteurs",
    Window: "Fenêtre",
    Interval: "Intervalle",
    "Data received at": "Données reçues à",
    "Last update": "Dernière mise à jour",
    "Temperature Realtime": "Température en temps réel",
    "Temperature history": "Historique de température",
    "Temperature history chart": "Graphique de l'historique de température",
    "Sensor statistics": "Statistiques des capteurs",
    "Point value": "Valeur du point",
    "Change vs previous": "Variation par rapport au précédent",
    Minimum: "Minimum",
    Average: "Moyenne",
    Status: "État",
    "Current reading": "Lecture actuelle",
    "Window average": "Moyenne de la fenêtre",
    "Window minimum": "Minimum de la fenêtre",
    "Router peak": "Pic du routeur",
    "Sensors online": "Capteurs en ligne",
    "Current maximum": "Maximum actuel",
    "Average now": "Moyenne actuelle",
    "Sensors above warm": "Capteurs au-dessus de chaud",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "Sélectionnez un capteur pour afficher un historique de température clair. Le graphique maintient un tampon local glissant, les valeurs de pic proviennent de la session rpcd actuelle du routeur.",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC temporairement indisponible. Affichage du dernier échantillon réussi.",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC temporairement indisponible. En attente des données de température...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "Surveillance des capteurs thermiques. Les couleurs indiquent : vert - normal, jaune - chaud, orange - très chaud, rouge - critique.",

    // Backup & Restore
    "Backup & Restore": "Sauvegarde et restauration",
    "Export your theme settings to a file or import from a previously saved backup.":
      "Exportez les paramètres du thème dans un fichier ou importez depuis une sauvegarde précédemment enregistrée.",
    "Export Settings": "Exporter les paramètres",
    "Import Settings": "Importer les paramètres",
    "Reset to Defaults": "Réinitialiser les paramètres",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "Êtes-vous sûr de vouloir réinitialiser tous les paramètres du thème ? Cette action ne peut pas être annulée.",
    "Settings exported successfully": "Paramètres exportés avec succès",
    "Settings imported successfully": "Paramètres importés avec succès",
    "Invalid backup file": "Fichier de sauvegarde invalide",
    "No settings found in file": "Aucun paramètre trouvé dans le fichier",
    "Failed to read backup file":
      "Échec de la lecture du fichier de sauvegarde",
    "Open package repository": "Ouvrir le dépôt de paquets",
  },

  it: {
    // Services Widget - Header
    "Services Monitor": "Monitor dei Servizi",
    "Widget Settings": "Impostazioni Widget",
    "Add Service": "Aggiungi Servizio",
    Services: "Servizi",
    Widgets: "Widget",
    Ready: "Pronto",

    // Empty state
    "Click ⚙ to add services": "Fai clic su ⚙ per aggiungere servizi",

    // Categories
    "My Services": "I Miei Servizi",
    Network: "Rete",
    Security: "Sicurezza",
    VPN: "VPN",
    "Ad Blocking": "Blocco Annunci",
    System: "Sistema",
    Other: "Altro",

    // Service descriptions
    "DNS and DHCP server": "Server DNS e DHCP",
    Firewall: "Firewall",
    "Network interfaces": "Interfacce di rete",
    "LuCI web server": "Server web LuCI",
    "DHCPv6 server": "Server DHCPv6",
    "SSH access": "Accesso SSH",
    "Time sync": "Sincronizzazione ora",
    "Task scheduler": "Pianificatore attività",
    "VPN service": "Servizio VPN",
    "Ad blocking": "Blocco annunci",
    "System service": "Servizio di sistema",

    // Status (uppercase - for badges)
    RUNNING: "IN ESECUZIONE",
    STOPPED: "FERMATO",
    UNKNOWN: "SCONOSCIUTO",

    // Status (capitalized - for logs)
    Running: "In esecuzione",
    Stopped: "Fermato",
    Error: "Errore",
    Unknown: "Sconosciuto",
    Disabled: "Disabilitato",
    "Checking...": "Controllo...",

    // Tooltips
    "Monitor and manage system services. Click on service card to view details and control actions.":
      "Monitora e gestisci i servizi di sistema. Fai clic sulla scheda del servizio per visualizzare i dettagli e controllare le azioni.",

    // Actions
    Start: "Avvia",
    Stop: "Ferma",
    Restart: "Riavvia",
    Enable: "Abilita",
    Disable: "Disabilita",
    Remove: "Rimuovi",
    Cancel: "Annulla",
    Add: "Aggiungi",
    Close: "Chiudi",
    Reset: "Ripristina",

    // Reboot confirmation
    "Confirm Reboot": "Conferma riavvio",
    "Are you sure you want to reboot the system?":
      "Sei sicuro di voler riavviare il sistema?",
    "This action will restart your router and temporarily interrupt network connectivity.":
      "Questa azione riavvierà il router e interromperà temporaneamente la connettività di rete.",
    "Reboot Now": "Riavvia ora",

    // Modal - service list
    "Available services": "Servizi disponibili",
    "Selected services": "Servizi selezionati",
    "Search...": "Cerca...",
    "Semantic search...": "Ricerca semantica...",
    "No results found": "Nessun risultato trovato",
    "No semantic matches": "Nessuna corrispondenza semantica trovata",
    "Enable semantic search": "Abilita ricerca semantica",
    "Disable semantic search": "Disabilita ricerca semantica",
    "Search services...": "Cerca servizi...",
    "Search or add custom service...":
      "Cerca o aggiungi servizio personalizzato...",
    Search: "Cerca",
    "Opening service list...": "Apertura elenco servizi...",
    "Custom service name": "Nome del servizio",
    "Enter custom service name...": "Inserisci nome del servizio...",
    "Add custom service": "Aggiungi servizio personalizzato",
    "No services found": "Nessun servizio trovato",
    "Service not found in system": "Servizio non trovato nel sistema",
    "as custom": "come personalizzato",
    "Or press Enter": "Oppure premi Invio",
    "already added": "già aggiunto",
    custom: "personalizzato",

    // Modal - validation
    "Letters, numbers, dash, underscore only":
      "Solo lettere, numeri, trattino, trattino basso",
    "Name too long (max 64 chars)": "Nome troppo lungo (max. 64 caratteri)",
    "Invalid characters! Use: a-z, 0-9, -, _":
      "Caratteri non validi! Usa: a-z, 0-9, -, _",
    "Already in your list": "Già nella tua lista",
    "Found in system": "Trovato nel sistema",
    "Custom service (not found in system)":
      "Servizio personalizzato (non trovato nel sistema)",
    "Added successfully!": "Aggiunto con successo!",
    "Not installed": "Non installato",
    Added: "Aggiunto",
    Removed: "Rimosso",

    // Loading states
    "Waiting for LuCI API...": "In attesa dell'API LuCI...",
    "Loading...": "Caricamento...",
    "Loading services...": "Caricamento servizi...",
    "Checking services...": "Controllo servizi...",
    "Services loaded": "Servizi caricati",
    "Check complete": "Controllo completato",

    // init.d
    "init.d services": "Servizi init.d",
    "Warning: init.d list empty": "Attenzione: elenco init.d vuoto",

    // Messages
    "Service started": "Servizio avviato",
    "Service stopped": "Servizio fermato",
    "Service restarted": "Servizio riavviato",
    "Service enabled": "Servizio abilitato",
    "Service disabled": "Servizio disabilitato",
    Success: "Successo",

    // Empty state
    "No services selected": "Nessun servizio selezionato",
    "Click + to add services": "Fai clic su + per aggiungere",

    // Theme Settings
    "Proton2025 Theme Settings": "Impostazioni Tema Proton2025",
    "Theme Mode": "Modalità Tema",
    Auto: "Auto",
    Dark: "Scuro",
    Light: "Chiaro",
    "Choose light, dark, or follow system theme":
      "Scegli tema chiaro, scuro o segui il tema di sistema",
    "Choose light or dark theme": "Scegli tema chiaro o scuro",
    "Accent Color": "Colore Accento",
    "Choose theme accent color": "Scegli il colore accento del tema",
    Blue: "Blu",
    Purple: "Viola",
    Green: "Verde",
    Orange: "Arancione",
    Red: "Rosso",
    Default: "Predefinito",
    "Border Radius": "Raggio Bordo",
    "Corner rounding style": "Stile arrotondamento angoli",
    Sharp: "Spigoloso",
    Rounded: "Arrotondato",
    "Extra Rounded": "Molto Arrotondato",
    Zoom: "Zoom",
    "Interface scale": "Scala interfaccia",
    "Page Width": "Larghezza pagina",
    "Content area width": "Larghezza dell'area contenuto",
    "Full width": "Larghezza piena",
    Animations: "Animazioni",
    "Enable smooth transitions and effects":
      "Abilita transizioni ed effetti fluidi",
    Transparency: "Trasparenza",
    "Enable blur and transparency effects":
      "Abilita effetti di sfocatura e trasparenza",
    "Services Widget": "Widget Servizi",
    "Show services monitor on Overview page":
      "Mostra monitor servizi nella pagina panoramica",
    "Temperature Widget": "Widget Temperatura",
    "Show temperature monitor on Overview page":
      "Mostra monitor temperatura nella pagina panoramica",
    "Deep Service Check": "Controllo approfondito dei servizi",
    "Accurate status for adblock, banip, etc.":
      "Stato accurato per adblock, banip, ecc.",
    "Temperature widget enabled. Visit Status → Overview to see it.":
      "Widget temperatura abilitato. Visita Stato → Panoramica per vederlo.",
    "Temperature widget disabled.": "Widget temperatura disabilitato.",
    "Widget Log": "Registro Widget",
    "Show activity log under the widget":
      "Mostra registro attività sotto il widget",
    "Table Text Wrap": "A Capo Testo (Wireless)",
    "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.":
      "Mandare a capo i nomi AP lunghi nella tabella Stazioni Associate. Disabilitare per troncare con puntini di sospensione.",
    "Log Highlighting": "Evidenziazione dei Log",
    "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.":
      "Visualizzatore di log personalizzato con evidenziazione della sintassi, numeri di riga e barra degli strumenti nelle pagine Registro di Sistema e Registro del Kernel.",
    "Custom Font (Inter)": "Font Inter",
    "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.":
      "Usa il font Inter integrato per una tipografia uniforme su tutti i dispositivi. Disattiva per usare il font di sistema predefinito.",
    "Proton2025 Update": "Aggiornamento Proton2025",
    "Check for Updates": "Controlla aggiornamenti",
    "Open Release Page": "Apri pagina release",
    "Install Update": "Installa aggiornamento",
    "Installing...": "Installazione...",
    "Installing Proton2025 update...": "Installazione aggiornamento Proton2025...",
    "Failed to install update.": "Impossibile installare l’aggiornamento.",
    "Proton2025 update installed.": "Aggiornamento Proton2025 installato.",
    "Update installed, but a newer version is still available.": "Aggiornamento installato, ma è ancora disponibile una versione più recente.",
    "Current version": "Versione attuale",
    "Latest version": "Ultima versione",
    "Click the button to check for a new Proton2025 release.": "Fai clic sul pulsante per controllare una nuova release di Proton2025.",
    "Checking latest Proton2025 release...": "Controllo dell’ultima release di Proton2025...",
    "Failed to check for updates.": "Impossibile controllare gli aggiornamenti.",
    "A new Proton2025 version is available.": "È disponibile una nuova versione di Proton2025.",
    "Proton2025 is up to date.": "Proton2025 è aggiornato.",
    "Search Page Index": "Indice delle pagine di ricerca",
    "Build or clear the cached LuCI search index manually when menu pages change.":
      "Crea o cancella manualmente l’indice di ricerca LuCI nella cache quando cambiano le pagine del menu.",
    "Indexed Data Size": "Dimensione dei dati indicizzati",
    "Index Pages Now": "Indicizza le pagine ora",
    "Clear Indexed Data": "Cancella dati indicizzati",
    "Search index is ready to be built.":
      "L'indice di ricerca è pronto per essere creato.",
    "Indexing in progress...": "Indicizzazione in corso...",
    "Cancel Indexing": "Annulla indicizzazione",
    "Indexing canceled.": "Indicizzazione annullata.",
    "Indexing canceled": "Indicizzazione annullata",
    "You can start indexing again at any time.":
      "Puoi avviare nuovamente l’indicizzazione in qualsiasi momento.",
    "Indexed routes": "Percorsi indicizzati",
    "Cached entries": "Voci in cache",
    "Last indexed": "Ultima indicizzazione",
    "Index errors": "Errori di indicizzazione",
    "Not indexed yet": "Non ancora indicizzato",
    "Search index updated successfully.":
      "Indice di ricerca aggiornato correttamente.",
    "Clear indexed search data? This removes cached search pages on the router until the next indexing run.":
      "Cancellare i dati di ricerca indicizzati? Questo rimuoverà le pagine di ricerca memorizzate nella cache sul router fino alla prossima indicizzazione.",

    // Log Viewer UI
    lines: "righe",
    "crit.": "crit.",
    "err.": "err.",
    "warn.": "avv.",
    "den.": "neg.",
    "disc.": "disc.",
    ok: "ok",
    Critical: "Critici",
    Errors: "Errori",
    Warnings: "Avvisi",
    Denied: "Negati",
    Disconnects: "Disconnessioni",
    Successful: "Riusciti",
    "Word Wrap": "A capo automatico",
    "Hide Timestamps": "Nascondi timestamp",
    "Copy Log": "Copia log",
    "Download Log": "Scarica log",
    "Scroll to Top": "Vai in cima",
    "Scroll to Bottom": "Vai in fondo",
    "Fullscreen Mode": "Modalità schermo intero",
    "Exit Fullscreen": "Esci dallo schermo intero",

    "Services widget enabled. Visit Status → Overview to see it.":
      "Widget servizi abilitato. Visita Stato → Panoramica per vederlo.",
    "Services widget disabled.": "Widget servizi disabilitato.",

    // Load Average
    "1 min": "1 min",
    "5 min": "5 min",
    "15 min": "15 min",
    "1 MIN": "1 MIN",
    "5 MIN": "5 MIN",
    "15 MIN": "15 MIN",
    "System Load Average": "Carico Medio del Sistema",
    "Load Average": "Carico Medio",
    "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.":
      "Mostra il numero medio di processi in attesa di esecuzione CPU. I tre valori rappresentano gli ultimi 1, 5 e 15 minuti.",
    "Low load": "Carico basso",
    "Medium load": "Carico medio",
    "High load": "Carico alto",
    cores: "core",

    // Footer
    "Powered by": "Sviluppato da",

    // Temperature Widget
    Temperature: "Temperatura",
    "Temperature Monitor": "Monitor Temperatura",
    "No temperature sensors found": "Nessun sensore di temperatura trovato",
    CPU: "CPU",
    SoC: "SoC",
    WiFi: "WiFi",
    DDR: "DDR",
    Board: "Scheda",
    Normal: "Normale",
    Warm: "Caldo",
    Hot: "Molto caldo",
    Critical: "Critico",
    "Temperature normal": "Temperatura normale",
    "Temperature elevated": "Temperatura elevata",
    "Temperature high": "Temperatura alta",
    "Temperature critical": "Temperatura critica",
    Sensor: "Sensore",
    Current: "Attuale",
    Peak: "Picco",
    s: "s",
    min: "min",
    "10 min": "10 min",
    "All sensors": "Tutti i sensori",
    Sensors: "Sensori",
    Window: "Finestra",
    Interval: "Intervallo",
    "Data received at": "Dati ricevuti alle",
    "Last update": "Ultimo aggiornamento",
    "Temperature Realtime": "Temperatura in tempo reale",
    "Temperature history": "Cronologia temperatura",
    "Temperature history chart": "Grafico cronologia temperatura",
    "Sensor statistics": "Statistiche sensore",
    "Point value": "Valore del punto",
    "Change vs previous": "Variazione rispetto al precedente",
    Minimum: "Minimo",
    Average: "Media",
    Status: "Stato",
    "Current reading": "Lettura attuale",
    "Window average": "Media della finestra",
    "Window minimum": "Minimo della finestra",
    "Router peak": "Picco del router",
    "Sensors online": "Sensori online",
    "Current maximum": "Massimo attuale",
    "Average now": "Media attuale",
    "Sensors above warm": "Sensori sopra caldo",
    "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.":
      "Seleziona un sensore per visualizzare una cronologia della temperatura chiara. Il grafico mantiene un buffer locale scorrevole, i valori di picco provengono dalla sessione rpcd attuale del router.",
    "RPC is temporarily unavailable. Showing the last successful sample.":
      "RPC temporaneamente non disponibile. Visualizzazione dell'ultimo campione riuscito.",
    "RPC is temporarily unavailable. Waiting for temperature data...":
      "RPC temporaneamente non disponibile. In attesa dei dati di temperatura...",
    "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.":
      "Monitoraggio sensori termici. I colori indicano: verde - normale, giallo - caldo, arancione - molto caldo, rosso - critico.",

    // Backup & Restore
    "Backup & Restore": "Backup e ripristino",
    "Export your theme settings to a file or import from a previously saved backup.":
      "Esporta le impostazioni del tema in un file o importa da un backup salvato in precedenza.",
    "Export Settings": "Esporta impostazioni",
    "Import Settings": "Importa impostazioni",
    "Reset to Defaults": "Ripristina predefiniti",
    "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.":
      "Sei sicuro di voler ripristinare tutte le impostazioni del tema? Questa azione non può essere annullata.",
    "Settings exported successfully": "Impostazioni esportate con successo",
    "Settings imported successfully": "Impostazioni importate con successo",
    "Invalid backup file": "File di backup non valido",
    "No settings found in file": "Nessuna impostazione trovata nel file",
    "Failed to read backup file": "Impossibile leggere il file di backup",
    "Open package repository": "Apri repository pacchetti",
  },
};

window.ProtonSearchSemanticTranslations = {
  base: {
    "status-overview": {
      title: "Status › Overview",
      category: "Status",
      description: "Dashboard, uptime, CPU, memory and router summary",
      keywords: [
        "dashboard",
        "home",
        "router",
        "overview",
        "status",
        "uptime",
        "cpu",
        "memory",
        "ram",
        "load",
      ],
    },
    "status-temperature": {
      title: "Status › Temperature",
      category: "Status",
      description: "Thermal sensors, chip temperature and peak values",
      keywords: [
        "temperature",
        "thermal",
        "sensor",
        "sensors",
        "chip temp",
        "cpu temp",
        "heat",
        "temp",
      ],
    },
    "network-interfaces": {
      title: "Network › Interfaces",
      category: "Network",
      description: "LAN, WAN, bridges, IP addressing and gateways",
      keywords: [
        "lan",
        "wan",
        "bridge",
        "pppoe",
        "gateway",
        "dhcp client",
        "ip address",
        "interface",
        "interfaces",
      ],
    },
    "network-wireless": {
      title: "Network › Wireless",
      category: "Network",
      description: "Wi-Fi radios, SSID, channels, encryption and guests",
      keywords: [
        "wifi",
        "wi-fi",
        "wireless",
        "wlan",
        "ssid",
        "radio",
        "channel",
        "guest",
        "encryption",
        "2.4g",
        "5g",
      ],
    },
    "network-firewall": {
      title: "Network › Firewall",
      category: "Network",
      description: "Zones, NAT, forwarding, port forwards and traffic rules",
      keywords: [
        "firewall",
        "nat",
        "port forward",
        "forwarding",
        "zone",
        "traffic rule",
        "open port",
        "masquerade",
      ],
    },
    "network-dhcp": {
      title: "Network › DHCP and DNS",
      category: "Network",
      description: "DHCP leases, DNS, static hosts and name resolution",
      keywords: [
        "dhcp",
        "dns",
        "lease",
        "leases",
        "static host",
        "resolver",
        "hostname",
      ],
    },
    "system-system": {
      title: "System › System",
      category: "System",
      description: "Hostname, timezone, NTP, language, logging and password",
      keywords: [
        "system",
        "hostname",
        "timezone",
        "ntp",
        "password",
        "logging",
        "language",
      ],
    },
    "system-startup": {
      title: "System › Startup",
      category: "System",
      description: "Init scripts, services, autostart and boot sequence",
      keywords: [
        "startup",
        "services",
        "service",
        "boot",
        "autostart",
        "daemon",
        "init",
        "service manager",
      ],
    },
    "system-software": {
      title: "System › Software",
      category: "System",
      description: "Package manager, repositories, install and updates",
      keywords: [
        "software",
        "packages",
        "package",
        "opkg",
        "apk",
        "repository",
        "install",
        "update",
        "plugin",
      ],
    },
  },
  ru: {
    "status-overview": {
      title: "Статус › Обзор",
      category: "Статус",
      description:
        "Панель состояния, аптайм, процессор, память и сводка роутера",
      keywords: ["главная", "обзор", "статус", "аптайм", "память", "нагрузка"],
    },
    "status-temperature": {
      title: "Статус › Температура",
      category: "Статус",
      description: "Термодатчики, температура чипа и пиковые значения",
      keywords: ["температура", "темп", "датчик", "датчики", "нагрев", "термо"],
    },
    "network-interfaces": {
      title: "Сеть › Интерфейсы",
      category: "Сеть",
      description: "LAN, WAN, мосты, IP-адресация и шлюзы",
      keywords: ["интерфейс", "интерфейсы", "шлюз", "адрес", "бридж", "мост"],
    },
    "network-wireless": {
      title: "Сеть › Wi-Fi",
      category: "Сеть",
      description:
        "Радиомодули Wi-Fi, SSID, каналы, шифрование и гостевые сети",
      keywords: [
        "вайфай",
        "wi fi",
        "беспроводная",
        "сеть",
        "гостевая",
        "канал",
      ],
    },
    "network-firewall": {
      title: "Сеть › Межсетевой экран",
      category: "Сеть",
      description: "Зоны, NAT, проброс портов, переадресация и правила трафика",
      keywords: ["фаервол", "fire wall", "проброс", "порт", "правило", "зона"],
    },
    "network-dhcp": {
      title: "Сеть › DHCP и DNS",
      category: "Сеть",
      description: "Аренды DHCP, DNS, статические хосты и разрешение имён",
      keywords: ["днс", "аренда", "хост", "хостнейм", "имя узла"],
    },
    "system-system": {
      title: "Система › Система",
      category: "Система",
      description: "Имя хоста, часовой пояс, NTP, язык, логирование и пароль",
      keywords: [
        "система",
        "хостнейм",
        "часовой пояс",
        "пароль",
        "лог",
        "язык",
      ],
    },
    "system-startup": {
      title: "Система › Автозагрузка",
      category: "Система",
      description: "Скрипты init, сервисы, автозапуск и загрузка системы",
      keywords: ["автозагрузка", "сервисы", "службы", "запуск", "демон"],
    },
    "system-software": {
      title: "Система › ПО",
      category: "Система",
      description: "Менеджер пакетов, репозитории, установка и обновления",
      keywords: [
        "пакеты",
        "пакет",
        "репозиторий",
        "установить",
        "обновить",
        "плагин",
      ],
    },
  },
  zh: {
    "status-overview": {
      title: "状态 › 概览",
      category: "状态",
      description: "状态面板、运行时间、处理器、内存和路由器摘要",
      keywords: ["概览", "状态", "主页", "运行时间", "内存", "负载"],
    },
    "status-temperature": {
      title: "状态 › 温度",
      category: "状态",
      description: "热传感器、芯片温度和峰值记录",
      keywords: ["温度", "热量", "传感器", "芯片温度", "处理器温度"],
    },
    "network-interfaces": {
      title: "网络 › 接口",
      category: "网络",
      description: "LAN、WAN、网桥、IP 地址和网关",
      keywords: ["接口", "网关", "地址", "网桥", "内网", "外网"],
    },
    "network-wireless": {
      title: "网络 › 无线",
      category: "网络",
      description: "Wi-Fi 射频、SSID、信道、加密和访客网络",
      keywords: ["无线", "WiFi", "SSID", "信道", "加密", "访客网络"],
    },
    "network-firewall": {
      title: "网络 › 防火墙",
      category: "网络",
      description: "区域、NAT、转发、端口转发和流量规则",
      keywords: ["防火墙", "端口转发", "规则", "区域", "NAT", "伪装"],
    },
    "network-dhcp": {
      title: "网络 › DHCP 和 DNS",
      category: "网络",
      description: "DHCP 租约、DNS、静态主机和名称解析",
      keywords: ["租约", "静态主机", "主机名", "解析", "域名"],
    },
    "system-system": {
      title: "系统 › 系统",
      category: "系统",
      description: "主机名、时区、NTP、语言、日志和密码",
      keywords: ["系统", "主机名", "时区", "密码", "日志", "语言"],
    },
    "system-startup": {
      title: "系统 › 启动项",
      category: "系统",
      description: "init 脚本、服务、自启动和引导顺序",
      keywords: ["启动", "服务", "自启动", "守护进程", "引导"],
    },
    "system-software": {
      title: "系统 › 软件",
      category: "系统",
      description: "软件包管理、软件源、安装和更新",
      keywords: ["软件", "软件包", "仓库", "安装", "更新", "插件"],
    },
  },
  de: {
    "status-overview": {
      title: "Status › Übersicht",
      category: "Status",
      description: "Dashboard, Laufzeit, CPU, Speicher und Routerübersicht",
      keywords: [
        "übersicht",
        "startseite",
        "status",
        "laufzeit",
        "speicher",
        "last",
      ],
    },
    "status-temperature": {
      title: "Status › Temperatur",
      category: "Status",
      description: "Temperatursensoren, Chiptemperatur und Spitzenwerte",
      keywords: ["temperatur", "sensor", "sensoren", "chiptemperatur", "wärme"],
    },
    "network-interfaces": {
      title: "Netzwerk › Schnittstellen",
      category: "Netzwerk",
      description: "LAN, WAN, Bridges, IP-Adressierung und Gateways",
      keywords: [
        "schnittstelle",
        "schnittstellen",
        "gateway",
        "adresse",
        "bridge",
      ],
    },
    "network-wireless": {
      title: "Netzwerk › WLAN",
      category: "Netzwerk",
      description: "WLAN-Funkmodule, SSID, Kanäle, Verschlüsselung und Gäste",
      keywords: ["wlan", "funk", "kanal", "verschlüsselung", "gastnetz"],
    },
    "network-firewall": {
      title: "Netzwerk › Firewall",
      category: "Netzwerk",
      description:
        "Zonen, NAT, Weiterleitungen, Portfreigaben und Verkehrsregeln",
      keywords: ["firewall", "portfreigabe", "weiterleitung", "regel", "zone"],
    },
    "network-dhcp": {
      title: "Netzwerk › DHCP und DNS",
      category: "Netzwerk",
      description: "DHCP-Leases, DNS, statische Hosts und Namensauflösung",
      keywords: [
        "lease",
        "leases",
        "statischer host",
        "hostname",
        "namensauflösung",
      ],
    },
    "system-system": {
      title: "System › System",
      category: "System",
      description:
        "Hostname, Zeitzone, NTP, Sprache, Protokollierung und Passwort",
      keywords: [
        "system",
        "hostname",
        "zeitzone",
        "passwort",
        "protokoll",
        "sprache",
      ],
    },
    "system-startup": {
      title: "System › Autostart",
      category: "System",
      description: "Init-Skripte, Dienste, Autostart und Boot-Reihenfolge",
      keywords: ["autostart", "dienste", "dienst", "start", "daemon"],
    },
    "system-software": {
      title: "System › Software",
      category: "System",
      description: "Paketmanager, Repositories, Installation und Updates",
      keywords: [
        "software",
        "pakete",
        "paket",
        "repository",
        "installieren",
        "aktualisieren",
      ],
    },
  },
  uk: {
    "status-overview": {
      title: "Статус › Огляд",
      category: "Статус",
      description: "Панель стану, аптайм, процесор, пам'ять і зведення роутера",
      keywords: [
        "огляд",
        "статус",
        "головна",
        "аптайм",
        "пам'ять",
        "навантаження",
      ],
    },
    "status-temperature": {
      title: "Статус › Температура",
      category: "Статус",
      description: "Термодатчики, температура чипа та пікові значення",
      keywords: ["температура", "датчик", "датчики", "нагрів", "термо"],
    },
    "network-interfaces": {
      title: "Мережа › Інтерфейси",
      category: "Мережа",
      description: "LAN, WAN, мости, IP-адресація та шлюзи",
      keywords: ["інтерфейс", "інтерфейси", "шлюз", "адреса", "міст"],
    },
    "network-wireless": {
      title: "Мережа › Wi-Fi",
      category: "Мережа",
      description:
        "Wi-Fi радіомодулі, SSID, канали, шифрування та гостьові мережі",
      keywords: ["вайфай", "бездротова", "мережа", "гостьова", "канал"],
    },
    "network-firewall": {
      title: "Мережа › Брандмауер",
      category: "Мережа",
      description: "Зони, NAT, переадресація, проброс портів і правила трафіку",
      keywords: ["брандмауер", "порт", "правило", "зона", "проброс"],
    },
    "network-dhcp": {
      title: "Мережа › DHCP і DNS",
      category: "Мережа",
      description: "Оренди DHCP, DNS, статичні хости та розв'язання імен",
      keywords: ["оренда", "хост", "ім'я вузла", "резолвер", "днс"],
    },
    "system-system": {
      title: "Система › Система",
      category: "Система",
      description: "Ім'я хоста, часовий пояс, NTP, мова, логи та пароль",
      keywords: [
        "система",
        "хостнейм",
        "часовий пояс",
        "пароль",
        "лог",
        "мова",
      ],
    },
    "system-startup": {
      title: "Система › Автозапуск",
      category: "Система",
      description: "init-скрипти, сервіси, автозапуск і порядок завантаження",
      keywords: ["автозапуск", "сервіси", "служби", "запуск", "демон"],
    },
    "system-software": {
      title: "Система › ПЗ",
      category: "Система",
      description: "Менеджер пакунків, репозиторії, встановлення й оновлення",
      keywords: [
        "пакунки",
        "пакунок",
        "репозиторій",
        "встановити",
        "оновити",
        "плагін",
      ],
    },
  },
  es: {
    "status-overview": {
      title: "Estado › Resumen",
      category: "Estado",
      description:
        "Panel principal, tiempo activo, CPU, memoria y resumen del router",
      keywords: [
        "resumen",
        "inicio",
        "estado",
        "tiempo activo",
        "memoria",
        "carga",
      ],
    },
    "status-temperature": {
      title: "Estado › Temperatura",
      category: "Estado",
      description: "Sensores térmicos, temperatura del chip y valores máximos",
      keywords: ["temperatura", "sensor", "sensores", "calor", "cpu"],
    },
    "network-interfaces": {
      title: "Red › Interfaces",
      category: "Red",
      description: "LAN, WAN, puentes, direccionamiento IP y puertas de enlace",
      keywords: [
        "interfaz",
        "interfaces",
        "puerta de enlace",
        "dirección",
        "puente",
      ],
    },
    "network-wireless": {
      title: "Red › Wi-Fi",
      category: "Red",
      description: "Radios Wi-Fi, SSID, canales, cifrado e invitados",
      keywords: ["inalámbrico", "wifi", "canal", "cifrado", "invitados"],
    },
    "network-firewall": {
      title: "Red › Cortafuegos",
      category: "Red",
      description: "Zonas, NAT, reenvíos, puertos y reglas de tráfico",
      keywords: ["cortafuegos", "puerto", "reenvío", "regla", "zona"],
    },
    "network-dhcp": {
      title: "Red › DHCP y DNS",
      category: "Red",
      description:
        "Concesiones DHCP, DNS, hosts estáticos y resolución de nombres",
      keywords: [
        "concesión",
        "host estático",
        "nombre de host",
        "resolución",
        "dns",
      ],
    },
    "system-system": {
      title: "Sistema › Sistema",
      category: "Sistema",
      description:
        "Nombre del host, zona horaria, NTP, idioma, registros y contraseña",
      keywords: [
        "sistema",
        "hostname",
        "zona horaria",
        "contraseña",
        "registro",
        "idioma",
      ],
    },
    "system-startup": {
      title: "Sistema › Inicio",
      category: "Sistema",
      description:
        "Scripts init, servicios, arranque automático y secuencia de inicio",
      keywords: ["inicio", "arranque", "servicios", "autoinicio", "demonio"],
    },
    "system-software": {
      title: "Sistema › Software",
      category: "Sistema",
      description:
        "Gestor de paquetes, repositorios, instalación y actualizaciones",
      keywords: [
        "software",
        "paquetes",
        "repositorio",
        "instalar",
        "actualizar",
        "plugin",
      ],
    },
  },
  pt: {
    "status-overview": {
      title: "Estado › Visão geral",
      category: "Estado",
      description: "Painel inicial, uptime, CPU, memória e resumo do roteador",
      keywords: [
        "visão geral",
        "início",
        "estado",
        "uptime",
        "memória",
        "carga",
      ],
    },
    "status-temperature": {
      title: "Estado › Temperatura",
      category: "Estado",
      description: "Sensores térmicos, temperatura do chip e picos registrados",
      keywords: ["temperatura", "sensor", "sensores", "calor", "cpu"],
    },
    "network-interfaces": {
      title: "Rede › Interfaces",
      category: "Rede",
      description: "LAN, WAN, bridges, endereçamento IP e gateways",
      keywords: ["interface", "interfaces", "gateway", "endereço", "bridge"],
    },
    "network-wireless": {
      title: "Rede › Wi-Fi",
      category: "Rede",
      description:
        "Rádios Wi-Fi, SSID, canais, criptografia e redes de convidados",
      keywords: ["wifi", "sem fio", "canal", "criptografia", "convidado"],
    },
    "network-firewall": {
      title: "Rede › Firewall",
      category: "Rede",
      description: "Zonas, NAT, encaminhamento, portas e regras de tráfego",
      keywords: ["firewall", "porta", "encaminhamento", "regra", "zona"],
    },
    "network-dhcp": {
      title: "Rede › DHCP e DNS",
      category: "Rede",
      description: "Leases DHCP, DNS, hosts estáticos e resolução de nomes",
      keywords: ["lease", "host estático", "nome do host", "resolução", "dns"],
    },
    "system-system": {
      title: "Sistema › Sistema",
      category: "Sistema",
      description: "Hostname, fuso horário, NTP, idioma, logs e senha",
      keywords: [
        "sistema",
        "hostname",
        "fuso horário",
        "senha",
        "log",
        "idioma",
      ],
    },
    "system-startup": {
      title: "Sistema › Inicialização",
      category: "Sistema",
      description:
        "Scripts init, serviços, inicialização automática e sequência de boot",
      keywords: ["inicialização", "serviços", "autostart", "boot", "daemon"],
    },
    "system-software": {
      title: "Sistema › Software",
      category: "Sistema",
      description:
        "Gerenciador de pacotes, repositórios, instalação e atualizações",
      keywords: [
        "software",
        "pacotes",
        "repositório",
        "instalar",
        "atualizar",
        "plugin",
      ],
    },
  },
  pl: {
    "status-overview": {
      title: "Status › Przegląd",
      category: "Status",
      description:
        "Panel główny, czas pracy, CPU, pamięć i podsumowanie routera",
      keywords: [
        "przegląd",
        "start",
        "status",
        "czas pracy",
        "pamięć",
        "obciążenie",
      ],
    },
    "status-temperature": {
      title: "Status › Temperatura",
      category: "Status",
      description:
        "Czujniki temperatury, temperatura układu i wartości szczytowe",
      keywords: ["temperatura", "czujnik", "czujniki", "ciepło", "cpu"],
    },
    "network-interfaces": {
      title: "Sieć › Interfejsy",
      category: "Sieć",
      description: "LAN, WAN, mosty, adresacja IP i bramy",
      keywords: ["interfejs", "interfejsy", "brama", "adres", "most"],
    },
    "network-wireless": {
      title: "Sieć › Wi-Fi",
      category: "Sieć",
      description: "Radia Wi-Fi, SSID, kanały, szyfrowanie i sieci gościnne",
      keywords: ["wifi", "bezprzewodowa", "kanał", "szyfrowanie", "gościnna"],
    },
    "network-firewall": {
      title: "Sieć › Zapora",
      category: "Sieć",
      description: "Strefy, NAT, przekierowania, porty i reguły ruchu",
      keywords: ["zapora", "port", "przekierowanie", "reguła", "strefa"],
    },
    "network-dhcp": {
      title: "Sieć › DHCP i DNS",
      category: "Sieć",
      description: "Dzierżawy DHCP, DNS, statyczne hosty i rozwiązywanie nazw",
      keywords: [
        "dzierżawa",
        "host statyczny",
        "nazwa hosta",
        "rozwiązywanie",
        "dns",
      ],
    },
    "system-system": {
      title: "System › System",
      category: "System",
      description: "Nazwa hosta, strefa czasowa, NTP, język, logi i hasło",
      keywords: [
        "system",
        "hostname",
        "strefa czasowa",
        "hasło",
        "log",
        "język",
      ],
    },
    "system-startup": {
      title: "System › Autostart",
      category: "System",
      description: "Skrypty init, usługi, autostart i sekwencja rozruchu",
      keywords: ["autostart", "usługi", "start", "boot", "demon"],
    },
    "system-software": {
      title: "System › Oprogramowanie",
      category: "System",
      description: "Menedżer pakietów, repozytoria, instalacja i aktualizacje",
      keywords: [
        "oprogramowanie",
        "pakiety",
        "repozytorium",
        "instalacja",
        "aktualizacja",
        "wtyczka",
      ],
    },
  },
  fr: {
    "status-overview": {
      title: "Statut › Vue d'ensemble",
      category: "Statut",
      description:
        "Tableau de bord, disponibilité, CPU, mémoire et résumé du routeur",
      keywords: [
        "vue d'ensemble",
        "accueil",
        "statut",
        "uptime",
        "mémoire",
        "charge",
      ],
    },
    "status-temperature": {
      title: "Statut › Température",
      category: "Statut",
      description:
        "Capteurs thermiques, température de la puce et pics enregistrés",
      keywords: ["température", "capteur", "capteurs", "chaleur", "cpu"],
    },
    "network-interfaces": {
      title: "Réseau › Interfaces",
      category: "Réseau",
      description: "LAN, WAN, ponts, adressage IP et passerelles",
      keywords: ["interface", "interfaces", "passerelle", "adresse", "pont"],
    },
    "network-wireless": {
      title: "Réseau › Wi-Fi",
      category: "Réseau",
      description: "Radios Wi-Fi, SSID, canaux, chiffrement et réseaux invités",
      keywords: ["wifi", "sans fil", "canal", "chiffrement", "invité"],
    },
    "network-firewall": {
      title: "Réseau › Pare-feu",
      category: "Réseau",
      description: "Zones, NAT, redirections, ports et règles de trafic",
      keywords: ["pare-feu", "port", "redirection", "règle", "zone"],
    },
    "network-dhcp": {
      title: "Réseau › DHCP et DNS",
      category: "Réseau",
      description: "Baux DHCP, DNS, hôtes statiques et résolution de noms",
      keywords: ["bail", "hôte statique", "nom d'hôte", "résolution", "dns"],
    },
    "system-system": {
      title: "Système › Système",
      category: "Système",
      description:
        "Nom d'hôte, fuseau horaire, NTP, langue, journaux et mot de passe",
      keywords: [
        "système",
        "hostname",
        "fuseau horaire",
        "mot de passe",
        "journal",
        "langue",
      ],
    },
    "system-startup": {
      title: "Système › Démarrage",
      category: "Système",
      description:
        "Scripts init, services, démarrage automatique et séquence de boot",
      keywords: ["démarrage", "services", "autostart", "boot", "daemon"],
    },
    "system-software": {
      title: "Système › Logiciels",
      category: "Système",
      description:
        "Gestionnaire de paquets, dépôts, installation et mises à jour",
      keywords: [
        "logiciels",
        "paquets",
        "dépôt",
        "installer",
        "mettre à jour",
        "plugin",
      ],
    },
  },
  it: {
    "status-overview": {
      title: "Stato › Panoramica",
      category: "Stato",
      description: "Dashboard, uptime, CPU, memoria e riepilogo del router",
      keywords: ["panoramica", "home", "stato", "uptime", "memoria", "carico"],
    },
    "status-temperature": {
      title: "Stato › Temperatura",
      category: "Stato",
      description: "Sensori termici, temperatura del chip e valori di picco",
      keywords: ["temperatura", "sensore", "sensori", "calore", "cpu"],
    },
    "network-interfaces": {
      title: "Rete › Interfacce",
      category: "Rete",
      description: "LAN, WAN, bridge, indirizzamento IP e gateway",
      keywords: ["interfaccia", "interfacce", "gateway", "indirizzo", "bridge"],
    },
    "network-wireless": {
      title: "Rete › Wi-Fi",
      category: "Rete",
      description: "Radio Wi-Fi, SSID, canali, crittografia e reti ospiti",
      keywords: ["wifi", "wireless", "canale", "crittografia", "ospite"],
    },
    "network-firewall": {
      title: "Rete › Firewall",
      category: "Rete",
      description: "Zone, NAT, inoltro, port forwarding e regole di traffico",
      keywords: ["firewall", "porta", "inoltro", "regola", "zona"],
    },
    "network-dhcp": {
      title: "Rete › DHCP e DNS",
      category: "Rete",
      description: "Lease DHCP, DNS, host statici e risoluzione dei nomi",
      keywords: ["lease", "host statico", "nome host", "risoluzione", "dns"],
    },
    "system-system": {
      title: "Sistema › Sistema",
      category: "Sistema",
      description: "Hostname, fuso orario, NTP, lingua, log e password",
      keywords: [
        "sistema",
        "hostname",
        "fuso orario",
        "password",
        "log",
        "lingua",
      ],
    },
    "system-startup": {
      title: "Sistema › Avvio",
      category: "Sistema",
      description: "Script init, servizi, avvio automatico e sequenza di boot",
      keywords: ["avvio", "servizi", "autostart", "boot", "demone"],
    },
    "system-software": {
      title: "Sistema › Software",
      category: "Sistema",
      description:
        "Gestore pacchetti, repository, installazione e aggiornamenti",
      keywords: [
        "software",
        "pacchetti",
        "repository",
        "installare",
        "aggiornare",
        "plugin",
      ],
    },
  },
};

window.protonGetLang = function () {
  if (!window._protonLangCache) {
    let lang = "en";

    if (document.body && document.body.dataset && document.body.dataset.lang) {
      lang = document.body.dataset.lang;
    } else if (document.body && document.body.className) {
      const langMatch = document.body.className.match(/\blang_([a-z]{2})\b/i);
      if (langMatch) {
        lang = langMatch[1];
      }
    } else if (document.documentElement) {
      const htmlLang =
        document.documentElement.lang ||
        document.documentElement.getAttribute("lang");
      if (htmlLang && htmlLang !== "en") {
        lang = htmlLang;
      }
    }

    if (lang === "en") {
      const scripts = document.querySelectorAll(
        'script[src*="/translations/"]',
      );
      for (const script of scripts) {
        const match = script.src.match(/\/translations\/([a-z]{2})(?:\?|$)/i);
        if (match) {
          lang = match[1];
          break;
        }
      }
    }

    if (lang === "en" && window.L && typeof window.L.tr === "function") {
      try {
        const testTranslation = window.L.tr("Save");
        if (testTranslation === "Сохранить") lang = "ru";
        else if (testTranslation === "Speichern") lang = "de";
        else if (testTranslation === "Зберегти") lang = "uk";
      } catch (e) {
        // Игнорируем ошибки
      }
    }

    if (lang === "en") {
      const metaLang = document.querySelector('meta[name="language"]')?.content;
      if (metaLang) lang = metaLang;
    }

    window._protonLangCache = lang.split("-")[0].split("_")[0].toLowerCase();
  }

  return window._protonLangCache;
};

window.protonGetSemanticTranslations = function () {
  const langBase = window.protonGetLang();

  return {
    lang: langBase,
    base: window.ProtonSearchSemanticTranslations?.base || {},
    locale: window.ProtonSearchSemanticTranslations?.[langBase] || {},
  };
};

/**
 * Функция перевода для использования в любом JS
 * @param {string} key - Ключ перевода (английский текст)
 * @returns {string} - Переведённый текст или оригинал
 */
window.protonT = function (key) {
  const langBase = window.protonGetLang();

  if (
    window.ProtonTranslations &&
    window.ProtonTranslations[langBase] &&
    window.ProtonTranslations[langBase][key]
  ) {
    return window.ProtonTranslations[langBase][key];
  }

  return key;
};
