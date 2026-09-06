/**
 * Proton2025 Theme - Search Semantic Translations
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 * Semantic search translations (split out of translations.js).
 * Requires protonGetLang() from translations.js (loaded earlier).
 */

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

window.protonGetSemanticTranslations = function () {
  const langBase = window.protonGetLang();

  return {
    lang: langBase,
    base: window.ProtonSearchSemanticTranslations?.base || {},
    locale: window.ProtonSearchSemanticTranslations?.[langBase] || {},
  };
};
