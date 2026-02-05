/**
 * Proton2025 - Services Widget
 * Мониторинг сервисов с группировкой и поиском
 */

(function () {
  "use strict";

  // =====================================================
  // Утилита: управление видимостью секции виджетов
  // =====================================================
  function updateWidgetsSectionVisibility() {
    const section = document.querySelector(".proton-widgets-section");
    if (!section) return;

    const servicesWidget = section.querySelector(".proton-services-widget");
    const tempWidget = section.querySelector(".proton-temp-widget");

    // Проверяем видимость виджетов (display !== 'none' и элемент существует)
    const servicesVisible =
      servicesWidget && servicesWidget.style.display !== "none";
    const tempVisible = tempWidget && tempWidget.style.display !== "none";

    // Скрываем секцию если все виджеты скрыты
    section.style.display = servicesVisible || tempVisible ? "" : "none";
  }

  // Делаем функцию доступной глобально для внешних вызовов
  window.updateWidgetsSectionVisibility = updateWidgetsSectionVisibility;

  class ProtonServicesWidget {
    constructor() {
      this.services = this.loadServices();

      // Категории сервисов
      this.categories = {
        custom: { icon: "⭐", priority: 0 },
        network: { icon: "🌐", priority: 1 },
        security: { icon: "🛡️", priority: 2 },
        vpn: { icon: "🔒", priority: 3 },
        adblock: { icon: "🚫", priority: 4 },
        system: { icon: "⚙️", priority: 5 },
        other: { icon: "📦", priority: 99 },
      };

      // База известных сервисов с категориями
      // daemon: false - скрипты-настройщики без постоянного процесса (скрыты из списка выбора)
      this.knownServices = {
        // Сеть
        dnsmasq: { category: "network", icon: "🌐" },
        network: { category: "network", icon: "🔌", daemon: false },
        odhcpd: { category: "network", icon: "📡" },
        uhttpd: { category: "network", icon: "🌍" },
        nginx: { category: "network", icon: "🌍" },
        squid: { category: "network", icon: "🦑" },

        // Безопасность
        firewall: { category: "security", icon: "🔥", daemon: false },
        dropbear: { category: "security", icon: "🔐" },
        openssh: { category: "security", icon: "🔐" },
        sshd: { category: "security", icon: "🔐" },

        // VPN
        openvpn: { category: "vpn", icon: "🔒" },
        wireguard: { category: "vpn", icon: "🔒", daemon: false },
        zerotier: { category: "vpn", icon: "🔒" },
        tailscale: { category: "vpn", icon: "🔒" },
        shadowsocks: { category: "vpn", icon: "🔒" },
        v2ray: { category: "vpn", icon: "🔒" },
        xray: { category: "vpn", icon: "🔒" },
        clash: { category: "vpn", icon: "🔒" },
        passwall: { category: "vpn", icon: "🔒" },
        passwall2: { category: "vpn", icon: "🔒" },
        ssr: { category: "vpn", icon: "🔒" },
        trojan: { category: "vpn", icon: "🔒" },
        singbox: { category: "vpn", icon: "🔒" },
        "sing-box": { category: "vpn", icon: "🔒" },
        podkop: { category: "vpn", icon: "🔒", daemon: false },

        // AdBlock / DNS фильтрация
        adblock: { category: "adblock", icon: "🚫" },
        adguardhome: { category: "adblock", icon: "🛡️" },
        pihole: { category: "adblock", icon: "🕳️" },

        // Система
        cron: { category: "system", icon: "⏰" },
        sysntpd: { category: "system", icon: "🕐" },
        ntpd: { category: "system", icon: "🕐" },
        log: { category: "system", icon: "📝", daemon: false },
        syslog: { category: "system", icon: "📝" },
        rpcd: { category: "system", icon: "⚡" },
        ubus: { category: "system", icon: "🔗" },

        // Системные скрипты (скрыты)
        boot: { category: "system", icon: "🚀", daemon: false },
        done: { category: "system", icon: "✅", daemon: false },
        sysfixtime: { category: "system", icon: "🕐", daemon: false },
        sysctl: { category: "system", icon: "⚙️", daemon: false },
        led: { category: "system", icon: "💡", daemon: false },
        gpio_switch: { category: "system", icon: "🔘", daemon: false },
        umount: { category: "system", icon: "💾", daemon: false },
        urandom_seed: { category: "system", icon: "🎲", daemon: false },
        ucitrack: { category: "system", icon: "📋", daemon: false },
        bootcount: { category: "system", icon: "🔢", daemon: false },
        packet_steering: { category: "network", icon: "📡", daemon: false },
      };

      this.availableServices = [];
      this.checkInterval = null;
      this.pollIntervalMs = 10000;
      this.pollIntervalExecMs = 30000; // Увеличенный интервал для exec-режима
      this._onVisibilityChange = null;
      this._statusCache = new Map();
      this._serviceElements = new Map(); // Кэш DOM-элементов
      this._rcListAll = null;
      this._rcListOne = null;
      this._initdCache = null;
      this._initdCacheAt = 0;
      this._initdCacheTtlMs = 5 * 60 * 1000; // 5 минут
      this._initActionCache = new Map(); // serviceName -> 'running' | 'status'
      this._mounted = false;
      this._useExecMode = false; // Флаг использования медленного exec
      this._mutationObserver = null; // Для отслеживания удаления виджета
      this._updateQueue = []; // Очередь для последовательного опроса
      this._isUpdating = false;

      // Логирование: info (старт/конец цикла) всегда, debug (по сервисам) можно включить
      // localStorage['proton-services-widget-debug']='1' или window.protonServicesWidgetDebug=true
      this._debug =
        this._safeGetItem("proton-services-widget-debug") === "1" ||
        window.protonServicesWidgetDebug === true;

      // UI-лог (внизу секции виджета)
      this._uiLogLines = [];

      // Стартовый retry, если LuCI API (L.rpc/L.fs) ещё не готов
      this._backendRetryTimer = null;
      this._backendRetryAttempts = 0;
      this._backendRetryDelaysMs = [250, 500, 1000, 2000, 4000];
    }

    // ==================== Helpers ====================

    _safeGetItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }

    _safeSetItem(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        return false;
      }
    }

    escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    _isValidServiceName(value) {
      // Жёсткое ограничение: имена init.d/rc обычно [A-Za-z0-9_-]
      // Запрещаем '/', '.', пробелы и прочее, чтобы не дать собрать путь.
      if (typeof value !== "string") return false;
      if (value.length < 1 || value.length > 64) return false;
      return /^[A-Za-z0-9_-]+$/.test(value);
    }

    _normalizeServiceList(list) {
      if (!Array.isArray(list)) return [];
      const out = [];
      const seen = new Set();
      for (const name of list) {
        if (!this._isValidServiceName(name)) continue;
        if (seen.has(name)) continue;
        seen.add(name);
        out.push(name);
      }
      return out;
    }

    _logInfo(message, extra) {
      try {
        if (
          typeof console !== "undefined" &&
          console &&
          typeof console.info === "function"
        ) {
          if (typeof extra !== "undefined")
            console.info("[ProtonServicesWidget]", message, extra);
          else console.info("[ProtonServicesWidget]", message);
        }
      } catch (e) {
        // Ignore console errors in restricted environments
      }
    }

    _logDebug(message, extra) {
      if (!this._debug) return;
      try {
        if (
          typeof console !== "undefined" &&
          console &&
          typeof console.debug === "function"
        ) {
          if (typeof extra !== "undefined")
            console.debug("[ProtonServicesWidget]", message, extra);
          else console.debug("[ProtonServicesWidget]", message);
        }
      } catch (e) {
        // Ignore console errors in restricted environments
      }
    }

    _getUiLogEl() {
      return document.getElementById("proton-services-log");
    }

    _formatTime(d) {
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
        d.getSeconds(),
      )}`;
    }

    _formatElapsedMs(ms) {
      if (typeof ms !== "number" || !isFinite(ms)) return "";
      if (ms < 1000) return `${Math.round(ms)}ms`;
      return `${(ms / 1000).toFixed(1)}s`;
    }

    _appendUiLogLine(text) {
      if (!text) return;
      const el = this._getUiLogEl();
      if (!el) return;

      const time = this._formatTime(new Date());
      this._uiLogLines.push({ time, text: String(text) });
      if (this._uiLogLines.length > 6)
        this._uiLogLines.splice(0, this._uiLogLines.length - 6);

      el.innerHTML = this._uiLogLines
        .map(
          (l) =>
            `<div class="proton-services-log-line"><span class="proton-services-log-time">${this.escapeHtml(
              l.time,
            )}</span><span class="proton-services-log-text">${this.escapeHtml(
              l.text,
            )}</span></div>`,
        )
        .join("");
    }

    _clearBackendRetry() {
      if (this._backendRetryTimer) {
        clearTimeout(this._backendRetryTimer);
        this._backendRetryTimer = null;
      }
      this._backendRetryAttempts = 0;
    }

    _scheduleBackendRetry(reason) {
      if (!this._mounted) return;
      if (this._backendRetryTimer) return;
      if (this._backendRetryAttempts >= this._backendRetryDelaysMs.length)
        return;

      const delay =
        this._backendRetryDelaysMs[this._backendRetryAttempts++] || 1000;
      this._logDebug("Scheduling backend retry", { reason, delay });
      this._appendUiLogLine(
        `${this._t("Waiting for LuCI API...")} ${this._formatElapsedMs(delay)}`,
      );

      this._backendRetryTimer = setTimeout(() => {
        this._backendRetryTimer = null;
        if (!this._mounted) return;
        // Не запускаем поверх текущей проверки
        if (this._isUpdating) return;
        this.updateAllStatuses();
      }, delay);
    }

    // ==================== Локализация ====================

    _t(key) {
      // Используем глобальную функцию из translations.js
      if (window.protonT) {
        return window.protonT(key);
      }

      // Fallback на LuCI i18n
      if (window.L && L.tr) {
        const translated = L.tr(key);
        if (translated !== key) return translated;
      }

      return key;
    }

    getCategoryName(category) {
      const names = {
        custom: this._t("My Services"),
        network: this._t("Network"),
        security: this._t("Security"),
        vpn: this._t("VPN"),
        adblock: this._t("Ad Blocking"),
        system: this._t("System"),
        other: this._t("Other"),
      };
      return names[category] || category;
    }

    getServiceDescription(serviceName) {
      const descriptions = {
        dnsmasq: this._t("DNS and DHCP server"),
        firewall: this._t("Firewall"),
        network: this._t("Network interfaces"),
        uhttpd: this._t("LuCI web server"),
        odhcpd: this._t("DHCPv6 server"),
        dropbear: this._t("SSH access"),
        sysntpd: this._t("Time sync"),
        cron: this._t("Task scheduler"),
      };

      if (descriptions[serviceName]) return descriptions[serviceName];

      // Автоопределение по категории
      const info = this.knownServices[serviceName];
      if (info) {
        if (info.category === "vpn") return this._t("VPN service");
        if (info.category === "adblock") return this._t("Ad blocking");
      }

      return this._t("System service");
    }

    // ==================== Инициализация ====================

    init() {
      // Проверяем настройку отключения виджета
      if (this._safeGetItem("proton-services-widget-enabled") === "false") {
        return;
      }

      if (!this.isOverviewPage()) return;

      if (!this.injectWidget()) return;

      this.refreshAvailableServices()
        .then(() => this.renderServices())
        .catch(() => {});

      this.startStatusMonitoring();
    }

    isOverviewPage() {
      // Проверяем через dispatchpath (надёжнее чем data-page, который пустой на корневой странице)
      if (
        typeof L !== "undefined" &&
        L.env &&
        Array.isArray(L.env.dispatchpath)
      ) {
        const dp = L.env.dispatchpath;
        if (dp[0] === "admin" && dp[1] === "status" && dp[2] === "overview") {
          return true;
        }
      }
      return (
        document.body.dataset.page === "admin-status-overview" ||
        window.location.pathname.includes("/admin/status/overview")
      );
    }

    loadServices() {
      const saved = this._safeGetItem("proton-services-widget");
      // Если ничего не сохранено - показываем дефолтные сервисы
      if (saved === null || saved === undefined) return ["dnsmasq", "dropbear"];
      // Если сохранён пустой массив - возвращаем пустой (пользователь специально очистил)
      try {
        const parsed = JSON.parse(saved);
        return this._normalizeServiceList(parsed);
      } catch (e) {
        return ["dnsmasq", "dropbear"];
      }
    }

    saveServices() {
      this._safeSetItem(
        "proton-services-widget",
        JSON.stringify(this.services),
      );
    }

    // ==================== Виджет ====================

    injectWidget() {
      const maincontent = document.getElementById("maincontent");
      if (!maincontent) return false;

      // Prevent duplicate insertion
      const existing = document.getElementById("proton-services-widget");
      if (existing) {
        this._mounted = true;
        return true;
      }

      let insertPoint =
        maincontent.querySelector("h2") ||
        maincontent.querySelector("h3") ||
        maincontent.querySelector(".cbi-map") ||
        maincontent.firstElementChild;

      if (!insertPoint) return false;

      // Создаем или находим общий контейнер для виджетов
      let widgetsContainer = document.getElementById(
        "proton-widgets-container",
      );
      if (!widgetsContainer) {
        // Создаём секцию с заголовком "Виджеты" и кнопкой настроек
        const widgetsSection = document.createElement("div");
        widgetsSection.className = "proton-widgets-section";

        const sectionHeader = document.createElement("div");
        sectionHeader.className = "proton-widgets-section-header";

        const sectionTitle = document.createElement("h2");
        sectionTitle.className = "proton-widgets-section-title";
        sectionTitle.textContent = this._t("Widgets");

        const settingsBtn = document.createElement("button");
        settingsBtn.className = "proton-widgets-settings-btn";
        settingsBtn.title = this._t("Widget Settings");
        settingsBtn.innerHTML = `
          <svg class="proton-widgets-settings-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <circle cx="9" cy="6" r="2"></circle>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <circle cx="15" cy="12" r="2"></circle>
            <line x1="4" y1="18" x2="20" y2="18"></line>
            <circle cx="7" cy="18" r="2"></circle>
          </svg>
        `;
        settingsBtn.addEventListener("click", () => this.showAddServiceModal());

        sectionHeader.appendChild(sectionTitle);
        sectionHeader.appendChild(settingsBtn);
        widgetsSection.appendChild(sectionHeader);

        widgetsContainer = document.createElement("div");
        widgetsContainer.className = "proton-widgets-container";
        widgetsContainer.id = "proton-widgets-container";
        widgetsSection.appendChild(widgetsContainer);

        insertPoint.parentNode.insertBefore(widgetsSection, insertPoint);
      }

      const widget = document.createElement("div");
      widget.className = "proton-services-widget";
      widget.id = "proton-services-widget";

      // Проверяем настройку отображения лога (по умолчанию выключен)
      const showLog = this._safeGetItem("proton-services-log") === "true";

      widget.innerHTML = `
                <div class="proton-services-header">
                    <h3 class="proton-services-title">${this._t(
                      "Services Monitor",
                    )}</h3>
                    <div class="proton-services-info">?
                        <div class="proton-services-tooltip">
                            <div class="proton-services-tooltip-title">${this._t(
                              "Services Monitor",
                            )}</div>
                            <div class="proton-services-tooltip-text">
                                ${this._t(
                                  "Monitor and manage system services. Click on service card to view details and control actions.",
                                )}
                            </div>
                            <div class="proton-services-tooltip-legend">
                                <div class="proton-services-tooltip-legend-item">
                                    <span class="proton-services-tooltip-legend-dot running"></span>
                                    <span>${this._t("Running")}</span>
                                </div>
                                <div class="proton-services-tooltip-legend-item">
                                    <span class="proton-services-tooltip-legend-dot stopped"></span>
                                    <span>${this._t("Stopped")}</span>
                                </div>
                                <div class="proton-services-tooltip-legend-item">
                                    <span class="proton-services-tooltip-legend-dot disabled"></span>
                                    <span>${this._t("Disabled")}</span>
                                </div>
                                <div class="proton-services-tooltip-legend-item">
                                    <span class="proton-services-tooltip-legend-dot unknown"></span>
                                    <span>${this._t("Unknown")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="proton-services-grid" id="proton-services-grid"></div>
                <div class="proton-services-log" id="proton-services-log" aria-live="polite" style="${
                  showLog ? "" : "display:none"
                }"></div>
            `;

      widgetsContainer.appendChild(widget);

      this._mounted = true;

      this.renderServices();

      this._appendUiLogLine(this._t("Ready"));

      return true;
    }

    getServiceInfo(serviceName) {
      const known = this.knownServices[serviceName] || {};
      return {
        name: serviceName,
        displayName: this.formatDisplayName(serviceName),
        description: this.getServiceDescription(serviceName),
        category: known.category || "other",
        icon: known.icon || "📦",
      };
    }

    formatDisplayName(name) {
      // Преобразуем имя в читаемый формат
      return name
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    cssEscape(value) {
      if (window.CSS && typeof window.CSS.escape === "function") {
        return window.CSS.escape(value);
      }
      return String(value).replace(/["\\]/g, "\\$&");
    }

    renderServices() {
      const grid = document.getElementById("proton-services-grid");
      if (!grid) return;

      // Очищаем кэш элементов при полной перерисовке
      this._serviceElements.clear();
      grid.innerHTML = "";

      // Если нет сервисов - показываем минималистичный placeholder
      if (this.services.length === 0) {
        const placeholder = document.createElement("div");
        placeholder.className = "proton-services-empty";
        placeholder.innerHTML = `<span class="proton-services-empty-hint">${this._t(
          "Click ⚙ to add services",
        )}</span>`;
        grid.appendChild(placeholder);
        return;
      }

      // Проверяем настройку группировки (по умолчанию выключена)
      const isGrouped = this._safeGetItem("proton-services-grouped") === "true";

      if (!isGrouped) {
        // Без группировки - просто показываем все сервисы
        this.services.forEach((serviceName) => {
          const info = this.getServiceInfo(serviceName);
          const card = this.createServiceCard({ ...info, serviceName });
          grid.appendChild(card);
        });
        this.updateAllStatuses();
        return;
      }

      // Группируем сервисы по категориям
      const grouped = new Map();

      this.services.forEach((serviceName) => {
        const info = this.getServiceInfo(serviceName);
        if (!grouped.has(info.category)) {
          grouped.set(info.category, []);
        }
        grouped.get(info.category).push({ ...info, serviceName });
      });

      // Сортируем категории по приоритету
      const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
        return (
          (this.categories[a]?.priority || 99) -
          (this.categories[b]?.priority || 99)
        );
      });

      // Рендерим по категориям
      sortedCategories.forEach((category) => {
        const services = grouped.get(category);
        const catInfo = this.categories[category] || {};

        // Заголовок категории (если больше одной категории)
        if (sortedCategories.length > 1 && services.length > 0) {
          const header = document.createElement("div");
          header.className = "proton-services-category-header";
          header.innerHTML = `<span>${
            catInfo.icon || ""
          } ${this.getCategoryName(category)}</span>`;
          grid.appendChild(header);
        }

        services.forEach((info) => {
          const card = this.createServiceCard(info);
          grid.appendChild(card);
        });
      });

      this.updateAllStatuses();
    }

    createServiceCard(info) {
      const card = document.createElement("div");
      card.className = "proton-service-card";
      card.dataset.service = info.serviceName;
      card.dataset.category = info.category;

      const safeDisplayName = this.escapeHtml(info.displayName);
      const safeDescription = this.escapeHtml(info.description);
      const safeIcon = this.escapeHtml(info.icon);

      card.innerHTML = `
                <div class="proton-service-card-header">
                    <span class="proton-service-icon">${safeIcon}</span>
                    <h4 class="proton-service-name">${safeDisplayName}</h4>
                    <button class="proton-service-remove" title="${this._t(
                      "Remove",
                    )}">×</button>
                </div>
                <div class="proton-service-status">
                    <span class="proton-service-status-dot" data-status="checking"></span>
                    <span class="proton-service-status-text">${this._t(
                      "Checking...",
                    )}</span>
                </div>
                <p class="proton-service-description">${safeDescription}</p>
            `;

      card
        .querySelector(".proton-service-remove")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          this.removeService(info.serviceName);
        });

      // Кэшируем ссылки на DOM-элементы для быстрого обновления
      this._serviceElements.set(info.serviceName, {
        card: card,
        dot: card.querySelector(".proton-service-status-dot"),
        text: card.querySelector(".proton-service-status-text"),
      });

      // Если статус уже известен из предыдущих проверок, применяем его к новому DOM.
      // Иначе после полной перерисовки карточки могут зависать на "Checking...".
      const cachedStatus = this._statusCache.get(info.serviceName);
      if (cachedStatus) {
        this.updateServiceCard(info.serviceName, cachedStatus);
      }

      return card;
    }

    // ==================== Модальное окно ====================

    async showAddServiceModal() {
      this._appendUiLogLine(this._t("Opening service list..."));

      // Проверяем текущее состояние виджета температуры
      const tempWidgetEnabled =
        localStorage.getItem("proton-temp-widget-enabled") !== "false";

      const modal = document.createElement("div");
      modal.className = "proton-service-modal";
      modal.innerHTML = `
                <div class="proton-service-modal-content">
                    <div class="proton-service-modal-header">
                        <h3 class="proton-service-modal-title">${this._t(
                          "Widget Settings",
                        )}</h3>
                        <button class="proton-service-modal-close">×</button>
                    </div>
                    
                    <div class="proton-widget-toggles">
                        <label class="proton-widget-toggle">
                            <span class="proton-widget-toggle-info">
                                <span class="proton-widget-toggle-icon">🌡</span>
                                <span class="proton-widget-toggle-name">${this._t(
                                  "Temperature Widget",
                                )}</span>
                            </span>
                            <input type="checkbox" id="proton-temp-widget-toggle" ${
                              tempWidgetEnabled ? "checked" : ""
                            }>
                            <span class="proton-widget-toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="proton-service-modal-section-title">${this._t(
                      "Services",
                    )}</div>
                    
                    <div class="proton-service-search">
                        <input type="text" id="proton-service-search-input" 
                               placeholder="${this._t(
                                 "Search or add custom service...",
                               )}" autocomplete="off" maxlength="64">
                    </div>
                    <div class="proton-service-list" id="proton-service-list">
                        <div class="proton-service-loading">
                            <div class="proton-service-loading-spinner"></div>
                            <span>${this._t("Loading services...")}</span>
                        </div>
                    </div>
                </div>
            `;

      document.body.appendChild(modal);

      // Обработчик переключателя виджета температуры
      const tempToggle = modal.querySelector("#proton-temp-widget-toggle");
      tempToggle.addEventListener("change", () => {
        const enabled = tempToggle.checked;
        localStorage.setItem("proton-temp-widget-enabled", enabled);

        // Находим виджет температуры и показываем/скрываем
        const tempWidget = document.querySelector(".proton-temp-widget");
        if (tempWidget) {
          tempWidget.style.display = enabled ? "" : "none";
        }

        // Обновляем видимость секции виджетов
        updateWidgetsSectionVisibility();
      });

      let onEscape;
      const closeModal = () => {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 250);
        if (onEscape) {
          document.removeEventListener("keydown", onEscape);
          onEscape = null;
        }
      };

      modal
        .querySelector(".proton-service-modal-close")
        .addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });

      // Escape для закрытия
      onEscape = (e) => {
        if (e.key === "Escape") {
          closeModal();
        }
      };
      document.addEventListener("keydown", onEscape);

      await this.refreshAvailableServices();

      const list = modal.querySelector("#proton-service-list");
      const searchInput = modal.querySelector("#proton-service-search-input");

      // Функция добавления пользовательского сервиса из поиска
      const addCustomFromSearch = (name) => {
        const normalizedName = name.trim().toLowerCase();
        if (!this._isValidServiceName(normalizedName)) return;
        if (this.services.includes(normalizedName)) return;

        this.addService(normalizedName);
        searchInput.value = "";
        this.renderServiceList(list, "", this, addCustomFromSearch);
      };

      // Рендерим список с группировкой
      const initialCount = this.renderServiceList(
        list,
        "",
        this,
        addCustomFromSearch,
      );
      this._appendUiLogLine(
        `${this._t("Available services")}: ${initialCount}`,
      );

      // Поиск с debounce
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const q = String(e.target.value || "").toLowerCase();
          const count = this.renderServiceList(
            list,
            q,
            this,
            addCustomFromSearch,
          );
          if (q) {
            this._appendUiLogLine(`${this._t("Search")}: "${q}" - ${count}`);
          } else {
            this._appendUiLogLine(`${this._t("Available services")}: ${count}`);
          }
        }, 150);
      });

      // Enter в поле поиска — добавить как custom если валидно
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const q = searchInput.value.trim();
          if (
            q &&
            this._isValidServiceName(q) &&
            !this.services.includes(q.toLowerCase())
          ) {
            addCustomFromSearch(q);
          }
        }
      });

      setTimeout(() => {
        modal.classList.add("active");
        searchInput.focus();
      }, 10);
    }

    renderServiceList(container, filter, widget, addCustomCallback) {
      container.innerHTML = "";

      let matchCount = 0;
      const filterLower = (filter || "").toLowerCase().trim();

      // Группируем по категориям
      const grouped = new Map();

      // Сначала добавляем пользовательские сервисы (которых нет в availableServices)
      const availableNames = new Set(this.availableServices.map((s) => s.name));
      const customServices = this.services.filter(
        (name) => !availableNames.has(name),
      );

      if (customServices.length > 0) {
        customServices.forEach((serviceName) => {
          const info = this.getServiceInfo(serviceName);

          // Фильтрация по поиску
          if (filterLower) {
            const searchText =
              `${serviceName} ${info.displayName} ${info.description}`.toLowerCase();
            if (!searchText.includes(filterLower)) return;
          }

          if (!grouped.has("custom")) {
            grouped.set("custom", []);
          }
          grouped.get("custom").push({
            ...info,
            name: serviceName,
            installed: false,
            isCustom: true,
          });
          matchCount++;
        });
      }

      this.availableServices.forEach((service) => {
        const info = this.getServiceInfo(service.name);

        // Скрываем скрипты-настройщики (daemon: false)
        const knownInfo = this.knownServices[service.name];
        if (knownInfo && knownInfo.daemon === false) return;

        // Фильтрация по поиску
        if (filterLower) {
          const searchText =
            `${service.name} ${info.displayName} ${info.description}`.toLowerCase();
          if (!searchText.includes(filterLower)) return;
        }

        if (!grouped.has(info.category)) {
          grouped.set(info.category, []);
        }
        grouped
          .get(info.category)
          .push({ ...info, ...service, installed: service.fromInitd === true });
        matchCount++;
      });

      // Сортируем категории (custom первым)
      const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
        if (a === "custom") return -1;
        if (b === "custom") return 1;
        return (
          (this.categories[a]?.priority || 99) -
          (this.categories[b]?.priority || 99)
        );
      });

      // Если ничего не найдено и есть фильтр — предложить добавить как custom
      if (sortedCategories.length === 0 && filterLower) {
        const isValid = this._isValidServiceName(filterLower);
        const alreadyAdded = this.services.includes(filterLower);

        const emptyDiv = document.createElement("div");
        emptyDiv.className = "proton-service-empty-custom";

        if (!isValid) {
          emptyDiv.innerHTML = `
            <div class="proton-service-empty-icon">🔍</div>
            <div class="proton-service-empty-text">${this._t(
              "No services found",
            )}</div>
            <div class="proton-service-empty-hint">${this._t(
              "Invalid name. Use only: a-z, 0-9, -, _",
            )}</div>
          `;
        } else if (alreadyAdded) {
          emptyDiv.innerHTML = `
            <div class="proton-service-empty-icon">✓</div>
            <div class="proton-service-empty-text">"${this.escapeHtml(
              filterLower,
            )}" ${this._t("already added")}</div>
          `;
        } else {
          emptyDiv.innerHTML = `
            <div class="proton-service-empty-icon">📦</div>
            <div class="proton-service-empty-text">${this._t(
              "Service not found in system",
            )}</div>
            <button class="proton-service-add-custom-btn" data-name="${this.escapeHtml(
              filterLower,
            )}">
              + ${this._t("Add")} "${this.escapeHtml(filterLower)}" ${this._t(
                "as custom",
              )}
            </button>
            <div class="proton-service-empty-hint">${this._t(
              "Or press Enter",
            )}</div>
          `;

          const btn = emptyDiv.querySelector(".proton-service-add-custom-btn");
          if (btn && addCustomCallback) {
            btn.addEventListener("click", () => {
              addCustomCallback(filterLower);
            });
          }
        }

        container.appendChild(emptyDiv);
        return 0;
      }

      if (sortedCategories.length === 0) {
        container.innerHTML = `<div class="proton-service-empty">${this._t(
          "No services found",
        )}</div>`;
        return 0;
      }

      sortedCategories.forEach((category) => {
        const services = grouped.get(category);
        const catInfo = this.categories[category] || {};

        // Заголовок категории
        const header = document.createElement("div");
        header.className = "proton-service-list-category";
        header.innerHTML = `${catInfo.icon || ""} ${this.getCategoryName(
          category,
        )}`;
        container.appendChild(header);

        services.forEach((service) => {
          const isAdded = this.services.includes(service.name);
          const isInstalled = service.installed === true;
          const isCustom = service.isCustom === true;

          const safeDisplayName = this.escapeHtml(service.displayName);
          const safeDescription = this.escapeHtml(service.description);
          const safeIcon = this.escapeHtml(service.icon);
          const safeNameAttr = this.escapeHtml(service.name);

          // Определяем текст и класс кнопки
          let btnClass = "proton-service-item-add";
          let btnText = "+ " + this._t("Add");

          if (isCustom) {
            // Пользовательские сервисы всегда показывают "Remove"
            btnClass += " added";
            btnText = this._t("Remove");
          } else if (!isInstalled) {
            btnClass += " not-installed";
            btnText = this._t("Not installed");
          } else if (isAdded) {
            btnClass += " added";
            btnText = this._t("Remove");
          }

          const item = document.createElement("div");
          item.className =
            "proton-service-item" +
            (isCustom ? " proton-service-item-custom" : "");
          item.innerHTML = `
                        <div class="proton-service-item-info">
                            <span class="proton-service-item-icon">${safeIcon}</span>
                            <div>
                                <h4>${safeDisplayName}${
                                  isCustom
                                    ? ' <span class="proton-custom-badge">' +
                                      this._t("custom") +
                                      "</span>"
                                    : ""
                                }</h4>
                                <p>${safeDescription}</p>
                            </div>
                        </div>
                        <button class="${btnClass}" data-service="${safeNameAttr}">
                            ${btnText}
                        </button>
                    `;

          if (isCustom || isInstalled) {
            const btn = item.querySelector(".proton-service-item-add");
            btn.addEventListener("click", () => {
              if (btn.classList.contains("added")) {
                // Удаляем сервис
                this.removeService(service.name);
                if (isCustom) {
                  // Для custom сервисов — убираем из списка
                  item.remove();
                } else {
                  btn.classList.remove("added");
                  btn.textContent = "+ " + this._t("Add");
                }
              } else {
                // Добавляем сервис
                this.addService(service.name);
                btn.classList.add("added");
                btn.textContent = this._t("Remove");
              }
            });
          }

          container.appendChild(item);
        });
      });

      return matchCount;
    }

    // ==================== Управление сервисами ====================

    addService(serviceName) {
      if (!this._isValidServiceName(serviceName)) return;
      if (!this.services.includes(serviceName)) {
        this.services.push(serviceName);
        this.saveServices();
        this._statusCache.delete(serviceName);
        this._initActionCache.delete(serviceName);
        this._appendUiLogLine(`${this._t("Added")}: ${serviceName}`);
        this.renderServices();
      }
    }

    removeService(serviceName) {
      const index = this.services.indexOf(serviceName);
      if (index > -1) {
        this.services.splice(index, 1);
        this.saveServices();
        this._statusCache.delete(serviceName);
        this._initActionCache.delete(serviceName);
        this._appendUiLogLine(`${this._t("Removed")}: ${serviceName}`);

        // Инкрементальное удаление без полной перерисовки
        const cached = this._serviceElements.get(serviceName);
        if (cached && cached.card && cached.card.parentNode) {
          cached.card.remove();
          this._serviceElements.delete(serviceName);

          // Проверяем, нужно ли удалить пустые заголовки категорий
          this._cleanupEmptyCategoryHeaders();
        } else {
          // Fallback на полную перерисовку
          this.renderServices();
        }
      }
    }

    // Удаляет пустые заголовки категорий
    _cleanupEmptyCategoryHeaders() {
      const grid = document.getElementById("proton-services-grid");
      if (!grid) return;

      const headers = grid.querySelectorAll(".proton-services-category-header");
      headers.forEach((header) => {
        let nextEl = header.nextElementSibling;
        // Если следующий элемент - другой заголовок или конец, удаляем текущий
        if (
          !nextEl ||
          nextEl.classList.contains("proton-services-category-header")
        ) {
          header.remove();
        }
      });
    }

    // ==================== Обнаружение сервисов ====================

    discoverServicesFromMenu() {
      const out = [];
      const seen = new Set();

      const anchors = document.querySelectorAll(
        '#mainmenu a[href*="/admin/services/"]',
      );
      anchors.forEach((a) => {
        const href = a.getAttribute("href") || "";
        const m = href.match(/\/admin\/services\/(.+)$/);
        if (!m) return;
        const slug = decodeURIComponent(m[1]).split(/[?#]/)[0].split("/")[0];
        if (!this._isValidServiceName(slug)) return;
        if (!slug || slug === "services") return;
        if (seen.has(slug)) return;
        seen.add(slug);
        out.push({ name: slug, fromMenu: true });
      });

      return out;
    }

    async discoverServicesFromUbus() {
      const now = Date.now();
      // Используем кэш только если он НЕ пустой и не истёк
      if (
        this._initdCache &&
        this._initdCache.length > 0 &&
        now - this._initdCacheAt < this._initdCacheTtlMs
      ) {
        this._logDebug("Using cached init.d list", this._initdCache.length);
        return this._initdCache;
      }

      // Способ 1: Через RPC rc list (предпочтительный - работает если есть доступ к rc)
      if (window.L && L.resolveDefault && L.rpc) {
        try {
          if (!this._rcListAll) {
            this._rcListAll = L.rpc.declare({
              object: "rc",
              method: "list",
              params: [],
              expect: { "": {} },
            });
          }
          const allServices = await L.resolveDefault(this._rcListAll(), {});
          if (allServices && typeof allServices === "object") {
            const names = Object.keys(allServices);
            if (names.length > 0) {
              this._initdCache = names
                .filter((name) => this._isValidServiceName(name))
                .map((name) => ({ name, fromInitd: true }));
              this._initdCacheAt = now;
              this._logDebug(
                "Discovered services via rc list",
                this._initdCache.length,
              );
              return this._initdCache;
            }
          }
        } catch (e) {
          this._logDebug("rc list error", e);
        }
      }

      // Способ 2: Через L.fs.list (fallback)
      if (window.L && L.fs && L.fs.list) {
        try {
          const files = await L.fs.list("/etc/init.d");
          this._logDebug("L.fs.list result", files);
          if (files && Array.isArray(files)) {
            this._initdCache = files
              .filter(
                (f) =>
                  f.type === "file" &&
                  !f.name.startsWith(".") &&
                  this._isValidServiceName(f.name),
              )
              .map((f) => ({ name: f.name, fromInitd: true }));
            this._initdCacheAt = now;
            this._logDebug(
              "Discovered init.d services via fs.list",
              this._initdCache.length,
            );
            return this._initdCache;
          }
        } catch (e) {
          this._logDebug("L.fs.list error", e);
        }
      } else {
        this._logDebug("L.fs.list not available", {
          L: !!window.L,
          fs: !!(window.L && L.fs),
          list: !!(window.L && L.fs && L.fs.list),
        });
      }

      // Не кэшируем пустой результат - попробуем снова при следующем вызове
      this._logDebug("No services discovered, not caching");
      return [];
    }

    async refreshAvailableServices() {
      this._appendUiLogLine(this._t("Loading services..."));
      const merged = new Map();

      // Сначала читаем init.d - это даёт нам список реально установленных сервисов
      const initdServices = await this.discoverServicesFromUbus();
      const initdSet = new Set(initdServices.map((s) => s.name));

      // Логируем для отладки
      const initdCount = initdSet.size;
      if (initdCount === 0) {
        this._appendUiLogLine(this._t("Warning: init.d list empty"));
      } else {
        this._appendUiLogLine(`${this._t("init.d services")}: ${initdCount}`);
      }

      // Известные сервисы (добавляем fromInitd если найден в init.d)
      Object.keys(this.knownServices).forEach((name) => {
        if (this._isValidServiceName(name)) {
          merged.set(name, { name, fromInitd: initdSet.has(name) });
        }
      });

      // Из меню (добавляем fromInitd если найден в init.d)
      this.discoverServicesFromMenu().forEach((s) => {
        if (!merged.has(s.name)) {
          merged.set(s.name, { ...s, fromInitd: initdSet.has(s.name) });
        }
      });

      // Из init.d - добавляем остальные (которых нет в known/menu)
      initdServices.forEach((s) => {
        if (!merged.has(s.name)) merged.set(s.name, s);
      });

      this.availableServices = Array.from(merged.values());
      this._appendUiLogLine(
        `${this._t("Services loaded")}: ${this.availableServices.length}`,
      );
    }

    // ==================== Проверка статуса ====================

    async updateAllStatuses() {
      if (!this._mounted) return;
      if (this._isUpdating) {
        this._logDebug("Skip: update already in progress");
        return;
      }
      this._isUpdating = true;

      const startedAt = Date.now();
      let mode = "unknown";
      this._logInfo("Checking services...");
      this._appendUiLogLine(this._t("Checking services..."));

      const hasRpc = !!(window.L && L.resolveDefault && L.rpc);
      const hasExec = !!(window.L && L.fs && L.fs.exec);

      try {
        if (!hasRpc && !hasExec) {
          mode = "none";
          for (const serviceName of this.services) {
            if (this._statusCache.get(serviceName) !== "unknown") {
              this._statusCache.set(serviceName, "unknown");
              this.updateServiceCard(serviceName, "unknown");
            }
          }

          // Частый кейс после reload: LuCI JS API ещё не готов.
          // Запланируем несколько коротких ретраев (не периодический таймер).
          this._scheduleBackendRetry("no-backend");
          return;
        }

        // Backend доступен - сбрасываем ретраи
        this._clearBackendRetry();

        if (hasRpc) {
          try {
            if (!this._rcListAll) {
              this._rcListAll = L.rpc.declare({
                object: "rc",
                method: "list",
                params: [],
                expect: { "": {} },
              });
            }
            const allServices = await L.resolveDefault(this._rcListAll(), {});

            // Проверяем, что RPC вернул валидные данные
            if (
              allServices &&
              typeof allServices === "object" &&
              Object.keys(allServices).length > 0
            ) {
              this._useExecMode = false; // RPC работает, используем быстрый режим
              mode = "rpc";

              for (const serviceName of this.services) {
                if (!this._isValidServiceName(serviceName)) continue;

                let status = "stopped";

                if (allServices[serviceName]) {
                  status =
                    allServices[serviceName].running === true
                      ? "running"
                      : "stopped";
                }

                if (this._statusCache.get(serviceName) !== status) {
                  this._statusCache.set(serviceName, status);
                  this.updateServiceCard(serviceName, status);
                }
              }
              return;
            }
          } catch (e) {
            // RPC parsing failed, fallback to exec mode
          }
        }

        // Fallback на exec-режим - используем последовательный опрос для снижения нагрузки
        this._useExecMode = true;
        mode = hasExec ? "exec" : hasRpc ? "rpc-empty" : "none";
        await this._updateStatusesSequentiallyNoLock();
      } finally {
        this._isUpdating = false;
        const elapsedMs = Date.now() - startedAt;
        this._logInfo("Check complete", { mode, elapsedMs });
        this._appendUiLogLine(
          `${this._t("Check complete")}: ${mode}${
            elapsedMs ? " - " + this._formatElapsedMs(elapsedMs) : ""
          }`,
        );
      }
    }

    // Последовательное обновление статусов для снижения нагрузки на CPU
    async _updateStatusesSequentiallyNoLock() {
      for (const serviceName of this.services) {
        // Проверяем, не был ли виджет удален
        if (!this._mounted) break;
        if (!this._isValidServiceName(serviceName)) continue;

        this._logDebug("Checking service", serviceName);

        await this.updateServiceStatus(serviceName);

        this._logDebug("Checked service", serviceName);

        // Небольшая пауза между проверками для снижения нагрузки
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    async updateServiceStatus(serviceName) {
      try {
        const status = await this.checkServiceStatus(serviceName);
        if (this._statusCache.get(serviceName) !== status) {
          this._statusCache.set(serviceName, status);
          this.updateServiceCard(serviceName, status);
        }
      } catch (error) {
        if (this._statusCache.get(serviceName) !== "error") {
          this._statusCache.set(serviceName, "error");
          this.updateServiceCard(serviceName, "error");
        }
      }
    }

    async checkServiceStatus(serviceName) {
      try {
        if (!this._isValidServiceName(serviceName)) return "unknown";

        if (window.L && L.resolveDefault && L.rpc) {
          try {
            if (!this._rcListOne) {
              this._rcListOne = L.rpc.declare({
                object: "rc",
                method: "list",
                params: ["name"],
                expect: { "": {} },
              });
            }

            const result = await L.resolveDefault(
              this._rcListOne(serviceName),
              null,
            );

            if (result && result[serviceName]) {
              if (result[serviceName].running === true) {
                return "running";
              }
              if (result[serviceName].enabled === true) {
                const initCheck = await this.checkViaInitScript(serviceName);
                if (initCheck === "running") return "running";
              }
              return "stopped";
            }
          } catch (e) {
            // RPC check failed, fallback to init script
          }
        }

        const initCheck = await this.checkViaInitScript(serviceName);
        if (initCheck !== null) return initCheck;

        return "unknown";
      } catch (error) {
        return "error";
      }
    }

    async checkViaInitScript(serviceName) {
      if (window.L && L.fs && L.fs.exec) {
        if (!this._isValidServiceName(serviceName)) return null;

        const path = "/etc/init.d/" + serviceName;
        const preferred = this._initActionCache.get(serviceName);

        const runAction = async (action) => {
          const result = await L.fs.exec(path, [action]);
          if (result && result.code === 0) return "running";
          if (result && typeof result.code === "number") return "stopped";
          return null;
        };

        // Если уже знаем рабочую команду - используем ровно один exec
        if (preferred === "running" || preferred === "status") {
          try {
            const res = await runAction(preferred);
            if (res !== null) return res;
          } catch (e) {
            this._initActionCache.delete(serviceName);
          }
        }

        // Пробуем "running", затем "status" и кэшируем удачную
        try {
          const res = await runAction("running");
          if (res !== null) {
            this._initActionCache.set(serviceName, "running");
            return res;
          }
        } catch (e) {
          // "running" action not supported, try "status"
        }

        try {
          const res = await runAction("status");
          if (res !== null) {
            this._initActionCache.set(serviceName, "status");
            return res;
          }
        } catch (e) {
          // "status" action also not supported
        }
      }
      return null;
    }

    updateServiceCard(serviceName, status) {
      // Используем кэшированные элементы вместо querySelector
      const cached = this._serviceElements.get(serviceName);
      if (!cached || !cached.card) return;

      const { dot, text } = cached;

      dot.className = "proton-service-status-dot " + status;
      text.className = "proton-service-status-text " + status;

      const statusTexts = {
        running: this._t("Running"),
        stopped: this._t("Stopped"),
        error: this._t("Error"),
        unknown: this._t("Unknown"),
      };
      text.textContent = statusTexts[status] || status;
    }

    // ==================== Мониторинг ====================

    startStatusMonitoring() {
      if (!this._mounted) return;

      this._setupMutationObserver();
      // Таймерный опрос отключён по требованию: обновления происходят
      // при первичном рендере, при действиях пользователя и при возврате на вкладку.

      if (!this._onVisibilityChange) {
        let lastVisibleTime = Date.now();
        this._onVisibilityChange = () => {
          if (document.hidden) {
            lastVisibleTime = Date.now();
            return;
          }
          const elapsed = Date.now() - lastVisibleTime;
          if (elapsed > 3000) {
            this.updateAllStatuses();
          }
        };
        document.addEventListener("visibilitychange", this._onVisibilityChange);
      }
    }

    // Планируем следующее обновление с динамическим интервалом
    _scheduleNextUpdate() {
      if (this.checkInterval) {
        clearTimeout(this.checkInterval);
        this.checkInterval = null;
      }

      if (!this._mounted) return;

      // Используем увеличенный интервал в exec-режиме
      const interval = this._useExecMode
        ? this.pollIntervalExecMs
        : this.pollIntervalMs;

      this.checkInterval = setTimeout(() => {
        if (document.hidden) {
          this._scheduleNextUpdate();
          return;
        }
        this.updateAllStatuses().finally(() => {
          this._scheduleNextUpdate();
        });
      }, interval);
    }

    // MutationObserver для автоматической очистки при удалении виджета из DOM
    _setupMutationObserver() {
      if (this._mutationObserver) return;

      const widget = document.getElementById("proton-services-widget");
      if (!widget || !widget.parentNode) return;

      this._mutationObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const removed of mutation.removedNodes) {
            if (
              removed === widget ||
              (removed.contains && removed.contains(widget))
            ) {
              this.stop();
              return;
            }
          }
        }
      });

      this._mutationObserver.observe(widget.parentNode, {
        childList: true,
        subtree: true,
      });
    }

    stop() {
      this._mounted = false;

      this._clearBackendRetry();

      if (this.checkInterval) {
        clearTimeout(this.checkInterval);
        this.checkInterval = null;
      }

      if (this._onVisibilityChange) {
        document.removeEventListener(
          "visibilitychange",
          this._onVisibilityChange,
        );
        this._onVisibilityChange = null;
      }

      if (this._mutationObserver) {
        this._mutationObserver.disconnect();
        this._mutationObserver = null;
      }

      this._statusCache.clear();
      this._serviceElements.clear();
      this._initActionCache.clear();
      this._updateQueue = [];
      this._isUpdating = false;
    }
  }

  // =====================================================
  // Temperature Widget - Мониторинг температуры
  // =====================================================

  class ProtonTemperatureWidget {
    constructor() {
      this._mounted = false;
      this._pollInterval = null;
      this._pollIntervalMs = 5000; // Обновление каждые 5 секунд
      this._sensors = [];
      this._sensorElements = new Map();
      this._onVisibilityChange = null;
      this._rpcMethods = null;
      this._mutationObserver = null; // Для очистки при остановке
      this._waitTimeout = null; // Для очистки таймаута
      this._isFirstLoad = true; // Флаг первой загрузки
      this._emptyAttempts = 0; // Счетчик попыток без датчиков
      this._maxEmptyAttempts = 3; // Максимум попыток перед показом "Не найдены"

      // Debug mode: localStorage['proton-temp-debug']='1' или window.protonTempDebug=true
      this._debug =
        (function () {
          try {
            return localStorage.getItem("proton-temp-debug") === "1";
          } catch (e) {
            return false;
          }
        })() || window.protonTempDebug === true;

      // Пороговые значения температуры (°C)
      this._thresholds = {
        warm: 50, // >= 50°C - тёплый
        hot: 70, // >= 70°C - горячий
        critical: 85, // >= 85°C - критический
      };
    }

    _log(...args) {
      if (this._debug) {
        console.log("[ProtonTemp]", ...args);
      }
    }

    // Локализация
    _t(key) {
      if (window.protonT) {
        return window.protonT(key);
      }
      if (window.L && L.tr) {
        const translated = L.tr(key);
        if (translated !== key) return translated;
      }
      return key;
    }

    // Определение типа датчика по имени
    _getSensorType(name) {
      const lowerName = name.toLowerCase();
      if (lowerName.includes("cpu") || lowerName.includes("processor"))
        return "cpu";
      if (lowerName.includes("soc")) return "soc";
      if (
        lowerName.includes("wifi") ||
        lowerName.includes("wireless") ||
        lowerName.includes("wlan")
      )
        return "wifi";
      if (
        lowerName.includes("ddr") ||
        lowerName.includes("ram") ||
        lowerName.includes("memory")
      )
        return "ddr";
      if (lowerName.includes("board") || lowerName.includes("system"))
        return "board";
      return "default";
    }

    // Форматирование имени датчика
    _formatSensorName(name) {
      // Убираем технические префиксы/суффиксы
      let formatted = name
        .replace(/^thermal_zone\d+_/, "")
        .replace(/_temp$/, "")
        .replace(/_input$/, "")
        .replace(/[-_]/g, " ")
        .trim();

      // Капитализация первой буквы каждого слова
      formatted = formatted.replace(/\b\w/g, (c) => c.toUpperCase());

      // Локализация известных имён
      const translations = {
        Cpu: this._t("CPU"),
        Soc: this._t("SoC"),
        Wifi: this._t("WiFi"),
        Ddr: this._t("DDR"),
        Board: this._t("Board"),
      };

      for (const [key, value] of Object.entries(translations)) {
        formatted = formatted.replace(new RegExp(`\\b${key}\\b`, "gi"), value);
      }

      return formatted || this._t("Sensor");
    }

    // Определение уровня температуры
    _getTempLevel(temp) {
      if (temp >= this._thresholds.critical) return "critical";
      if (temp >= this._thresholds.hot) return "hot";
      if (temp >= this._thresholds.warm) return "warm";
      return "normal";
    }

    // Получение текста статуса
    _getTempStatusText(level) {
      const statusTexts = {
        normal: this._t("Normal"),
        warm: this._t("Warm"),
        hot: this._t("Hot"),
        critical: this._t("Critical"),
      };
      return statusTexts[level] || statusTexts.normal;
    }

    // Расчёт процента для прогресс-бара (динамический диапазон до 100°C)
    _getTempPercent(temp) {
      // Используем диапазон 0-100°C, но ограничиваем максимум 100%
      // Для температур выше 100°C показываем 100%
      const maxTemp = 100;
      return Math.min(Math.max((temp / maxTemp) * 100, 0), 100);
    }

    // Проверка, что мы на странице Overview
    isOverviewPage() {
      if (
        typeof L !== "undefined" &&
        L.env &&
        Array.isArray(L.env.dispatchpath)
      ) {
        const dp = L.env.dispatchpath;
        if (dp[0] === "admin" && dp[1] === "status" && dp[2] === "overview") {
          return true;
        }
      }
      return (
        document.body.dataset.page === "admin-status-overview" ||
        window.location.pathname.includes("/admin/status/overview")
      );
    }

    // Инициализация виджета
    init() {
      // Проверяем настройку отключения виджета
      try {
        if (localStorage.getItem("proton-temp-widget-enabled") === "false") {
          return;
        }
      } catch (e) {
        // localStorage may be unavailable in some contexts
      }

      if (!this.isOverviewPage()) return;

      // Ждём появления виджета сервисов, чтобы вставить температуру после него
      this._waitForServicesWidget();
    }

    _waitForServicesWidget() {
      const tryInject = () => {
        // Ищем общий контейнер виджетов или виджет сервисов
        const widgetsContainer = document.getElementById(
          "proton-widgets-container",
        );
        const servicesWidget = document.getElementById(
          "proton-services-widget",
        );

        if (widgetsContainer) {
          // Если контейнер есть, вставляем в него
          this._injectWidget(widgetsContainer);
          return true;
        } else if (servicesWidget) {
          // Если виджет сервисов есть, но контейнера нет - используем его родителя
          this._injectWidget(servicesWidget);
          return true;
        }
        return false;
      };

      if (tryInject()) return;

      // Наблюдаем за появлением виджета сервисов
      this._mutationObserver = new MutationObserver(() => {
        if (tryInject()) {
          this._mutationObserver.disconnect();
          this._mutationObserver = null;
        }
      });

      const maincontent = document.getElementById("maincontent");
      if (maincontent) {
        this._mutationObserver.observe(maincontent, {
          childList: true,
          subtree: true,
        });
      }

      // Таймаут на случай, если виджет сервисов отключен
      this._waitTimeout = setTimeout(() => {
        if (this._mutationObserver) {
          this._mutationObserver.disconnect();
          this._mutationObserver = null;
        }
        // Если виджет сервисов не появился, создаем контейнер и вставляем температуру
        if (!document.getElementById("proton-temp-widget")) {
          const maincontent = document.getElementById("maincontent");
          if (maincontent) {
            let widgetsContainer = document.getElementById(
              "proton-widgets-container",
            );
            if (!widgetsContainer) {
              const insertPoint =
                maincontent.querySelector("h2") ||
                maincontent.querySelector("h3") ||
                maincontent.querySelector(".cbi-map") ||
                maincontent.firstElementChild;
              if (insertPoint) {
                // Создаём секцию с заголовком "Виджеты"
                const widgetsSection = document.createElement("div");
                widgetsSection.className = "proton-widgets-section";

                const sectionHeader = document.createElement("div");
                sectionHeader.className = "proton-widgets-section-header";

                const sectionTitle = document.createElement("h2");
                sectionTitle.className = "proton-widgets-section-title";
                sectionTitle.textContent = this._t("Widgets");
                sectionHeader.appendChild(sectionTitle);

                widgetsSection.appendChild(sectionHeader);

                widgetsContainer = document.createElement("div");
                widgetsContainer.className = "proton-widgets-container";
                widgetsContainer.id = "proton-widgets-container";
                widgetsSection.appendChild(widgetsContainer);

                insertPoint.parentNode.insertBefore(
                  widgetsSection,
                  insertPoint,
                );
              }
            }
            if (widgetsContainer) {
              this._injectWidget(widgetsContainer);
            }
          }
        }
        this._waitTimeout = null;
      }, 2000);
    }

    _injectWidget(referenceElement, insertBefore = false) {
      if (!referenceElement) {
        this._log("Cannot inject widget: invalid reference element");
        return;
      }

      if (document.getElementById("proton-temp-widget")) {
        this._mounted = true;
        return;
      }

      const widget = document.createElement("div");
      widget.className = "proton-temp-widget";
      widget.id = "proton-temp-widget";

      widget.innerHTML = `
        <div class="proton-temp-header">
          <h3 class="proton-temp-title">
            ${this._t("Temperature")}
          </h3>
          <div class="proton-temp-info">?
            <div class="proton-temp-tooltip">
              <div class="proton-temp-tooltip-title">${this._t(
                "Temperature Monitor",
              )}</div>
              <div class="proton-temp-tooltip-text">
                ${this._t(
                  "Thermal sensors monitoring. Colors indicate: green - normal, yellow - warm, orange - hot, red - critical.",
                )}
              </div>
              <div class="proton-temp-tooltip-legend">
                <div class="proton-temp-tooltip-legend-item">
                  <span class="proton-temp-tooltip-legend-dot normal"></span>
                  <span>${this._t("Normal")} (&lt; ${
                    this._thresholds.warm
                  }°C)</span>
                </div>
                <div class="proton-temp-tooltip-legend-item">
                  <span class="proton-temp-tooltip-legend-dot warm"></span>
                  <span>${this._t("Warm")} (${this._thresholds.warm}-${
                    this._thresholds.hot - 1
                  }°C)</span>
                </div>
                <div class="proton-temp-tooltip-legend-item">
                  <span class="proton-temp-tooltip-legend-dot hot"></span>
                  <span>${this._t("Hot")} (${this._thresholds.hot}-${
                    this._thresholds.critical - 1
                  }°C)</span>
                </div>
                <div class="proton-temp-tooltip-legend-item">
                  <span class="proton-temp-tooltip-legend-dot critical"></span>
                  <span>${this._t("Critical")} (≥ ${
                    this._thresholds.critical
                  }°C)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="proton-temp-grid" id="proton-temp-grid">
          <div class="proton-temp-empty">
            ${this._t("Checking...")}
          </div>
        </div>
      `;

      // Если referenceElement - это контейнер виджетов, добавляем в него
      if (referenceElement.id === "proton-widgets-container") {
        referenceElement.appendChild(widget);
      } else if (referenceElement.parentNode) {
        // Иначе вставляем после элемента
        if (insertBefore) {
          referenceElement.parentNode.insertBefore(widget, referenceElement);
        } else {
          referenceElement.parentNode.insertBefore(
            widget,
            referenceElement.nextSibling,
          );
        }
      }

      this._mounted = true;
      this._startMonitoring();
    }

    // Запуск мониторинга температуры
    _startMonitoring() {
      // При первой загрузке даем небольшую задержку для инициализации RPC
      if (this._isFirstLoad) {
        setTimeout(() => {
          if (this._mounted) {
            this._updateTemperatures();
          }
        }, 300); // 300ms задержка для первой загрузки
      } else {
        // Первоначальное обновление
        this._updateTemperatures();
      }

      // Периодическое обновление
      this._pollInterval = setInterval(() => {
        if (document.hidden) return;
        this._updateTemperatures();
      }, this._pollIntervalMs);

      // Обработка видимости вкладки
      this._onVisibilityChange = () => {
        if (!document.hidden && this._mounted) {
          this._updateTemperatures();
        }
      };
      document.addEventListener("visibilitychange", this._onVisibilityChange);
    }

    // Получение данных о температуре
    async _updateTemperatures() {
      if (!this._mounted) return;

      try {
        const sensors = await this._fetchSensorData();
        this._log("Fetched sensors:", sensors);

        if (!sensors || sensors.length === 0) {
          this._log("No sensors found, attempt:", this._emptyAttempts + 1);
          this._emptyAttempts++;

          // Если это первая загрузка или еще не достигли максимума попыток - показываем загрузку
          if (
            this._isFirstLoad ||
            this._emptyAttempts < this._maxEmptyAttempts
          ) {
            this._renderLoading();
            // Очищаем старые датчики только если это не первая попытка
            if (!this._isFirstLoad) {
              this._sensors = [];
            }
            return;
          }

          // После нескольких попыток показываем "Не найдены"
          this._log("No sensors found after", this._emptyAttempts, "attempts");
          this._renderEmpty();
          this._sensors = [];
          this._isFirstLoad = false;
          return;
        }

        // Датчики найдены - сбрасываем счетчики
        this._emptyAttempts = 0;
        this._isFirstLoad = false;

        // Обновляем список датчиков
        this._sensors = sensors;
        this._renderSensors();
      } catch (e) {
        console.debug("[ProtonTemperatureWidget] Error fetching temps:", e);
        this._emptyAttempts++;

        // При ошибке на первой загрузке показываем загрузку
        if (this._isFirstLoad || this._emptyAttempts < this._maxEmptyAttempts) {
          this._renderLoading();
          return;
        }

        // После нескольких ошибок показываем пустое состояние, но не очищаем существующие датчики
        // чтобы не было мерцания при временных ошибках сети
        if (this._sensors.length === 0) {
          this._renderEmpty();
        }
      }
    }

    // Кэшируем RPC-декларации для повторного использования
    _getRpcMethods() {
      if (!this._rpcMethods && window.L && L.rpc) {
        this._log("Initializing RPC methods");
        this._rpcMethods = {
          // Наш собственный RPC модуль (требует установки темы)
          getSensors: L.rpc.declare({
            object: "luci.proton-temp",
            method: "getSensors",
            expect: { sensors: [] },
          }),
          // Fallback: стандартный file.list для проверки директорий
          list: L.rpc.declare({
            object: "file",
            method: "list",
            params: ["path"],
          }),
        };
      }
      return this._rpcMethods;
    }

    // Нормализация ответа RPC list - может быть массив или объект с entries
    _normalizeEntries(result) {
      if (Array.isArray(result)) {
        return result;
      }
      if (result && Array.isArray(result.entries)) {
        return result.entries;
      }
      return [];
    }

    // Нормализация ответа RPC read - может быть строка или объект с data
    _normalizeData(result) {
      if (typeof result === "string") {
        return result;
      }
      if (result && typeof result.data === "string") {
        return result.data;
      }
      return "";
    }

    // Получение данных с датчиков через наш ucode RPC модуль
    async _fetchSensorData() {
      const sensors = [];
      this._log("Starting sensor scan...");
      const rpc = this._getRpcMethods();

      if (!rpc) {
        console.debug("[ProtonTemperatureWidget] RPC not available");
        return sensors;
      }

      try {
        // Используем наш RPC модуль luci.proton-temp
        // expect: { sensors: [] } автоматически извлекает поле sensors
        const result = await L.resolveDefault(rpc.getSensors(), []);
        this._log("RPC getSensors result:", result);

        // result уже является массивом sensors благодаря expect
        if (result && Array.isArray(result)) {
          for (const sensor of result) {
            if (sensor.temp !== undefined && !isNaN(sensor.temp)) {
              const tempC = Math.round(sensor.temp / 1000); // милли°C -> °C
              const peakC =
                sensor.peak !== undefined
                  ? Math.round(sensor.peak / 1000)
                  : tempC;
              sensors.push({
                name: sensor.name || "Sensor",
                temp: tempC,
                peak: peakC,
                path: sensor.path || "",
              });
            }
          }
        }

        // Если наш RPC не вернул данные, пробуем альтернативный метод
        if (sensors.length === 0) {
          this._log("No sensors from proton-temp RPC, trying alternative...");

          // Проверяем есть ли thermal zones через file.list
          const thermalResult = await L.resolveDefault(
            rpc.list("/sys/class/thermal"),
            [],
          );
          const thermalEntries = this._normalizeEntries(thermalResult);
          this._log("thermal entries (alt):", thermalEntries);

          // Если thermal zones есть но данных нет - значит RPC модуль не установлен
          if (
            thermalEntries.some(
              (e) => e.name && e.name.startsWith("thermal_zone"),
            )
          ) {
            this._log(
              "Thermal zones exist but RPC module not available. Please reinstall theme.",
            );
          }
        }
      } catch (e) {
        console.debug("[ProtonTemperatureWidget] RPC error:", e);
      }

      this._log("Final sensors:", sensors);
      return sensors;
    }

    // Рендеринг датчиков
    _renderSensors() {
      const grid = document.getElementById("proton-temp-grid");
      if (!grid) return;

      // Проверяем, нужно ли пересоздать карточки
      const needsRecreate =
        grid.querySelector(".proton-temp-empty") ||
        grid.children.length !== this._sensors.length ||
        // Проверяем, изменились ли пути датчиков (новые датчики или удаленные)
        Array.from(grid.children).some((child, index) => {
          const sensor = this._sensors[index];
          if (!sensor) return true;
          const cardSensor = child.dataset.sensor;
          return cardSensor !== (sensor.path || sensor.name);
        });

      if (needsRecreate) {
        grid.innerHTML = "";
        this._sensorElements.clear();

        for (const sensor of this._sensors) {
          const card = this._createSensorCard(sensor);
          grid.appendChild(card);
        }
      } else {
        // Обновляем существующие карточки
        for (const sensor of this._sensors) {
          this._updateSensorCard(sensor);
        }
      }
    }

    // Создание карточки датчика
    _createSensorCard(sensor) {
      const card = document.createElement("div");
      card.className = "proton-temp-card";
      card.dataset.sensor = sensor.path || sensor.name;

      const level = this._getTempLevel(sensor.temp);
      card.dataset.level = level;

      // Используем peak из ответа сервера (хранится на роутере)
      const peak = sensor.peak || sensor.temp;

      const formattedName = this._formatSensorName(sensor.name);
      const statusText = this._getTempStatusText(level);
      const percent = this._getTempPercent(sensor.temp);

      card.innerHTML = `
        <div class="proton-temp-value-container">
          <div class="proton-temp-value-wrapper">
            <span class="proton-temp-value">${sensor.temp}</span>
            <span class="proton-temp-unit">°C</span>
          </div>
          <h4 class="proton-temp-sensor-name" title="${
            sensor.name
          }">${formattedName}</h4>
        </div>
        <div class="proton-temp-bar-container">
          <div class="proton-temp-bar" style="width: ${percent}%"></div>
        </div>
        <div class="proton-temp-status">
          <span class="proton-temp-status-dot"></span>
          <span class="proton-temp-status-text">${statusText}</span>
          <span class="proton-temp-peak">${this._t("Peak")}: ${peak}°C</span>
        </div>
      `;

      // Кэшируем элементы для быстрого обновления
      this._sensorElements.set(sensor.path || sensor.name, {
        card: card,
        value: card.querySelector(".proton-temp-value"),
        bar: card.querySelector(".proton-temp-bar"),
        statusText: card.querySelector(".proton-temp-status-text"),
        peak: card.querySelector(".proton-temp-peak"),
      });

      return card;
    }

    // Обновление карточки датчика
    _updateSensorCard(sensor) {
      const elements = this._sensorElements.get(sensor.path || sensor.name);
      if (!elements) return;

      const level = this._getTempLevel(sensor.temp);
      const statusText = this._getTempStatusText(level);
      const percent = this._getTempPercent(sensor.temp);

      // Используем peak из ответа сервера
      const peak = sensor.peak || sensor.temp;

      elements.card.dataset.level = level;
      elements.value.textContent = sensor.temp;
      elements.bar.style.width = `${percent}%`;
      elements.statusText.textContent = statusText;
      elements.peak.textContent = `${this._t("Peak")}: ${peak}°C`;
    }

    // Рендеринг состояния загрузки
    _renderLoading() {
      const grid = document.getElementById("proton-temp-grid");
      if (!grid) return;

      // Не перерисовываем, если уже показываем загрузку
      if (grid.querySelector(".proton-temp-loading")) return;

      grid.innerHTML = `
        <div class="proton-temp-loading">
          ${this._t("Checking...")}
        </div>
      `;
    }

    // Рендеринг пустого состояния (датчики не найдены)
    _renderEmpty() {
      const grid = document.getElementById("proton-temp-grid");
      if (!grid) return;

      grid.innerHTML = `
        <div class="proton-temp-empty">
          ${this._t("No temperature sensors found")}
        </div>
      `;
    }

    // Остановка виджета
    stop() {
      this._mounted = false;

      if (this._pollInterval) {
        clearInterval(this._pollInterval);
        this._pollInterval = null;
      }

      if (this._onVisibilityChange) {
        document.removeEventListener(
          "visibilitychange",
          this._onVisibilityChange,
        );
        this._onVisibilityChange = null;
      }

      // Очищаем MutationObserver
      if (this._mutationObserver) {
        this._mutationObserver.disconnect();
        this._mutationObserver = null;
      }

      // Очищаем таймаут
      if (this._waitTimeout) {
        clearTimeout(this._waitTimeout);
        this._waitTimeout = null;
      }

      this._sensorElements.clear();
      // Очищаем пиковые температуры при остановке (опционально - можно оставить для истории)
      // this._peakTemps.clear();
    }
  }

  function initChannelAnalysisEnhancements() {
    const tryMove = () => {
      // Ограничиваемся страницей анализа каналов
      if (!document.querySelector('[id="channel_graph"]')) return false;

      const tabMenu = document.querySelector("ul.cbi-tabmenu");
      if (!tabMenu) return false;

      const button = document.querySelector(
        ".cbi-title-section .cbi-title-buttons > button.cbi-button.cbi-button-edit",
      );
      if (!button) return false;

      // Уже перемещено
      if (tabMenu.contains(button)) return true;

      tabMenu.appendChild(button);
      tabMenu.classList.add("proton-has-tabmenu-button");
      button.classList.add("proton-tabmenu-refresh");

      // Компактная кнопка: оставляем подсказку/доступность
      const label =
        button.textContent && button.textContent.trim()
          ? button.textContent.trim()
          : "Обновить данные";
      button.textContent = "↻";
      if (!button.getAttribute("title")) button.setAttribute("title", label);
      if (!button.getAttribute("aria-label"))
        button.setAttribute("aria-label", label);

      const titleButtons = document.querySelector(
        ".cbi-title-section .cbi-title-buttons",
      );
      if (titleButtons && titleButtons.children.length === 0)
        titleButtons.remove();

      return true;
    };

    if (tryMove()) return;

    // LuCI может дорисовывать view асинхронно — ловим появление элементов
    const root =
      document.getElementById("view") || document.getElementById("maincontent");
    if (!root) return;

    const observer = new MutationObserver(() => {
      if (tryMove()) observer.disconnect();
    });

    observer.observe(root, { childList: true, subtree: true });

    // Фоллбек: попытка через небольшой таймер
    setTimeout(() => {
      tryMove();
    }, 250);
  }

  // Инициализация
  function initWidget() {
    // Avoid duplicate instances and timers
    if (window.protonServicesWidget && window.protonServicesWidget._mounted) {
      return;
    }
    if (
      window.protonServicesWidget &&
      typeof window.protonServicesWidget.stop === "function"
    ) {
      window.protonServicesWidget.stop();
    }
    window.protonServicesWidget = new ProtonServicesWidget();
    window.protonServicesWidget.init();
  }

  // Инициализация виджета температуры
  function initTemperatureWidget() {
    // Avoid duplicate instances
    if (
      window.protonTemperatureWidget &&
      window.protonTemperatureWidget._mounted
    ) {
      return;
    }
    if (
      window.protonTemperatureWidget &&
      typeof window.protonTemperatureWidget.stop === "function"
    ) {
      window.protonTemperatureWidget.stop();
    }
    window.protonTemperatureWidget = new ProtonTemperatureWidget();
    window.protonTemperatureWidget.init();
  }

  // =====================================================
  // Load Average - Элегантная визуализация
  // =====================================================

  // Функция локализации для Load Average
  function t(key) {
    // Сначала пробуем наш словарь переводов
    if (window.protonT) {
      const translated = window.protonT(key);
      if (translated !== key) return translated;
    }
    // Затем LuCI
    if (window.L && L.tr) {
      const translated = L.tr(key);
      if (translated !== key) return translated;
    }
    return key;
  }

  // Паттерн для проверки значений Load Average: "X.XX, X.XX, X.XX" или "X.XX X.XX X.XX"
  const LOAD_AVERAGE_PATTERN = /^\s*\d+\.\d+[\s,]+\d+\.\d+[\s,]+\d+\.\d+\s*$/;
  // Позиция строки Load Average в таблице System (9-я строка, индекс 8)
  const LOAD_AVERAGE_ROW_INDEX = 8;

  function isOverviewPage() {
    if (document.body.dataset.page === "admin-status-overview") return true;
    if (window.location.pathname.includes("/admin/status/overview"))
      return true;
    if (window.location.pathname.match(/\/admin\/?$/)) return true;
    if (window.location.pathname.match(/\/admin\/status\/?$/)) return true;

    try {
      if (
        window.L &&
        L.env &&
        Array.isArray(L.env.dispatchpath) &&
        L.env.dispatchpath.join("/") === "admin/status/overview"
      ) {
        return true;
      }

      if (
        window.L &&
        L.env &&
        Array.isArray(L.env.dispatchpath) &&
        L.env.dispatchpath.join("/") === "admin/status"
      ) {
        return true;
      }

      if (window.L && L.env && L.env.nodespec && L.env.nodespec.action) {
        const action = L.env.nodespec.action;
        if (
          action.type === "template" &&
          action.path === "admin_status/index"
        ) {
          return true;
        }
      }
    } catch (e) {}

    return false;
  }

  function getOverviewSystemTable() {
    // Preferred selector when body[data-page] is present
    const byDataPage = document.querySelector(
      'body[data-page="admin-status-overview"] .cbi-section:first-of-type table.table',
    );
    if (byDataPage) return byDataPage;

    // Fallback: when entering via /cgi-bin/luci/ request_path may be empty,
    // so body[data-page] may be missing or set later.
    if (!isOverviewPage()) return null;
    return document.querySelector(
      "#view .cbi-section:first-of-type table.table, #maincontent #view .cbi-section:first-of-type table.table",
    );
  }

  function enhanceLoadAverage() {
    // Находим таблицу System на странице Overview
    const table = getOverviewSystemTable();

    if (!table) return;

    const rows = table.querySelectorAll("tr");

    // Проверяем 9-ю строку (индекс 8)
    if (rows.length <= LOAD_AVERAGE_ROW_INDEX) {
      console.warn(
        "[Proton2025] Load Average: таблица System содержит меньше 9 строк",
      );
      return;
    }

    const row = rows[LOAD_AVERAGE_ROW_INDEX];
    const firstCell = row.querySelector("td:first-child");
    const secondCell = row.querySelector("td:last-child");

    if (!firstCell || !secondCell) return;

    // Проверяем паттерн значений Load Average
    const loadText = secondCell.textContent.trim();

    if (!LOAD_AVERAGE_PATTERN.test(loadText)) {
      // Это не Load Average - структура таблицы изменилась
      console.warn(
        "[Proton2025] Load Average: строка 9 не содержит паттерн Load Average.",
        "Ожидалось: 'X.XX, X.XX, X.XX', получено:",
        loadText,
        "| Label:",
        firstCell.textContent.trim(),
      );
      return;
    }

    // Уже обработано?
    if (secondCell.querySelector(".proton-load-average")) return;

    row.classList.add("proton-load-row");

    // Парсим значения
    const loadValues = loadText.split(/[,\s]+/).filter((v) => v);
    if (loadValues.length < 3) return;

    const loads = loadValues.slice(0, 3).map((v) => parseFloat(v));

    // Определяем количество ядер CPU (по умолчанию 1)
    let cpuCores = 1;
    rows.forEach((r) => {
      const fc = r.querySelector("td:first-child");
      if (fc && fc.textContent.includes("CPU")) {
        const sc = r.querySelector("td:last-child");
        if (sc) {
          const coresMatch = sc.textContent.match(/(\d+)\s*x/i);
          if (coresMatch) {
            cpuCores = parseInt(coresMatch[1]);
          }
        }
      }
    });

    // Функция определения уровня загрузки
    function getLoadLevel(load, cores) {
      const normalized = load / cores;
      if (normalized < 0.7) return "low";
      if (normalized < 1.2) return "medium";
      return "high";
    }

    // Функция расчета процента заполнения бара (максимум = cores * 2)
    function getBarWidth(load, cores) {
      return Math.min((load / (cores * 2)) * 100, 100);
    }

    // Создаем новую разметку
    const container = document.createElement("div");
    container.className = "proton-load-average";

    const labels = [t("1 min"), t("5 min"), t("15 min")];

    loads.forEach((load, index) => {
      const level = getLoadLevel(load, cpuCores);
      const barWidth = getBarWidth(load, cpuCores);

      const item = document.createElement("div");
      item.className = "proton-load-item";

      const label = document.createElement("div");
      label.className = "proton-load-label";
      label.textContent = labels[index];

      const valueRow = document.createElement("div");
      valueRow.className = "proton-load-value-row";

      const number = document.createElement("span");
      number.className = "proton-load-number";
      number.setAttribute("data-level", level);
      number.textContent = load.toFixed(2);

      const bar = document.createElement("div");
      bar.className = "proton-load-bar";

      const fill = document.createElement("div");
      fill.className = "proton-load-bar-fill";
      fill.setAttribute("data-level", level);
      fill.style.width = barWidth + "%";

      bar.appendChild(fill);
      valueRow.appendChild(number);
      valueRow.appendChild(bar);
      item.appendChild(label);
      item.appendChild(valueRow);
      container.appendChild(item);
    });

    // Добавляем информационную иконку с tooltip
    const infoIcon = document.createElement("div");
    infoIcon.className = "proton-load-info";
    infoIcon.innerHTML = "?";

    const tooltip = document.createElement("div");
    tooltip.className = "proton-load-tooltip";

    tooltip.innerHTML = `
              <div class="proton-load-tooltip-title">${t(
                "System Load Average",
              )}</div>
              <div class="proton-load-tooltip-text">
                ${t(
                  "Shows the average number of processes waiting for CPU execution. Three values represent the last 1, 5, and 15 minutes.",
                )}
              </div>
              <div class="proton-load-tooltip-legend">
                <div class="proton-load-tooltip-legend-item">
                  <span class="proton-load-tooltip-legend-dot low"></span>
                  <span>${t("Low load")} (&lt; 0.7 × ${t("cores")})</span>
                </div>
                <div class="proton-load-tooltip-legend-item">
                  <span class="proton-load-tooltip-legend-dot medium"></span>
                  <span>${t("Medium load")} (0.7-1.2 × ${t("cores")})</span>
                </div>
                <div class="proton-load-tooltip-legend-item">
                  <span class="proton-load-tooltip-legend-dot high"></span>
                  <span>${t("High load")} (&gt; 1.2 × ${t("cores")})</span>
                </div>
              </div>
            `;

    infoIcon.appendChild(tooltip);
    container.appendChild(infoIcon);

    secondCell.innerHTML = "";
    secondCell.appendChild(container);
  }

  // Запускаем enhancement после загрузки страницы
  function initLoadAverageEnhancement() {
    if (isOverviewPage()) {
      let observer = null;
      let lastEnhanceTime = 0;
      const enhanceThrottle = 200; // Минимальный интервал между обновлениями

      // Функция с защитой от частых вызовов
      function throttledEnhance() {
        const now = Date.now();
        if (now - lastEnhanceTime < enhanceThrottle) {
          return;
        }
        lastEnhanceTime = now;

        // Проверяем, не был ли уже применен enhancement
        const table = getOverviewSystemTable();
        if (!table) return;

        const rows = table.querySelectorAll("tr");
        if (rows.length <= LOAD_AVERAGE_ROW_INDEX) return;

        const row = rows[LOAD_AVERAGE_ROW_INDEX];
        const secondCell = row.querySelector("td:last-child");
        if (!secondCell) return;

        // Проверяем, есть ли уже наш enhancement
        if (!secondCell.querySelector(".proton-load-average")) {
          enhanceLoadAverage();
        }
      }

      // Настраиваем наблюдение за изменениями в maincontent
      function setupObserver() {
        if (observer) {
          observer.disconnect();
        }

        const maincontent = document.getElementById("maincontent");
        if (!maincontent) return;

        observer = new MutationObserver((mutations) => {
          // Проверяем, есть ли изменения в содержимом таблицы
          let shouldCheck = false;
          for (const mutation of mutations) {
            if (
              mutation.type === "childList" ||
              mutation.type === "characterData"
            ) {
              shouldCheck = true;
              break;
            }
          }
          if (shouldCheck) {
            throttledEnhance();
          }
        });

        observer.observe(maincontent, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      // Первоначальная инициализация
      const initCheck = setInterval(() => {
        const table = getOverviewSystemTable();
        if (table && table.querySelectorAll("tr").length > 0) {
          enhanceLoadAverage();
          clearInterval(initCheck);
          setupObserver();

          // Подписываемся на LuCI poll события для повторного применения enhancement
          if (typeof L !== "undefined" && L.poll) {
            L.poll.add(() => {
              // Небольшая задержка чтобы LuCI успел обновить DOM
              setTimeout(throttledEnhance, 100);
            }, 5);
          }
        }
      }, 100);

      // Таймаут через 10 секунд
      setTimeout(() => clearInterval(initCheck), 10000);

      // Дополнительно: отслеживаем события hashchange (навигация в LuCI)
      window.addEventListener("hashchange", () => {
        setTimeout(() => {
          throttledEnhance();
        }, 500);
      });

      // Отслеживаем возвращение на вкладку
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          setTimeout(() => {
            throttledEnhance();
          }, 300);
        }
      });
    }
  }

  // Инициализация всех виджетов и обновление видимости секции
  function initAllWidgets() {
    initWidget();
    initTemperatureWidget();
    initLoadAverageEnhancement();
    initChannelAnalysisEnhancements();
    // Отложенно проверяем видимость секции (после инжекта виджетов)
    setTimeout(updateWidgetsSectionVisibility, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllWidgets);
  } else {
    if (document.getElementById("maincontent")) {
      initAllWidgets();
    } else {
      setTimeout(initAllWidgets, 100);
    }
  }
})();
