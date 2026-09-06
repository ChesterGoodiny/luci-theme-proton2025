/**
 * Proton2025 - LuCI Menu Integration
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 */

"use strict";
"require baseclass";
"require ui";
"require dom";

var defined_E =
  typeof E !== "undefined"
    ? E
    : function (tag, attr, children) {
        return dom.create(tag, attr, children);
      };

var translate = function (s) {
  if (!s) return s;

  if (window.L && typeof window.L.tr === "function") {
    try {
      const translated = window.L.tr(s);
      if (translated && translated !== s) {
        return translated;
      }
    } catch (e) {}
  }

  if (typeof window._ !== "undefined" && typeof window._ === "function") {
    try {
      const translated = window._(s);
      if (translated && translated !== s) {
        return translated;
      }
    } catch (e) {}
  }

  return s;
};

var E = defined_E;
var _ = translate;
var safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },
  removeItem(key) {
    return this.remove(key);
  },
};
var SEARCH_INDEX_ACTIVITY_LOG_KEY = "proton-search-index-activity-log";
var SEARCH_INDEX_ACTIVITY_LOG_EXPANDED_KEY =
  "proton-search-index-activity-log-expanded";
var SEARCH_INDEX_ACTIVITY_LOG_LIMIT = 6;
var SEARCH_INDEX_ACTIVITY_DETAILS_LIMIT = 32;
var SEARCH_INDEX_PANEL_HASH = "#proton-search-index-panel";
var SEARCH_INDEX_PANEL_FOCUS_EVENT = "proton-focus-search-index-panel";

var PROTON_MENU_ICONS = {
  chart:
    '<path d="M3 3v18h18"/><path d="M7 15v3"/><path d="M12 10v8"/><path d="M17 6v12"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
};
var PROTON_MENU_ICON_MAP = {
  status: "chart",
  system: "gear",
  services: "plug",
  network: "globe",
  vpn: "lock",
  firewall: "shield",
  logout: "bolt",
};

return baseclass.extend({
  scheduleIdle(fn, fallbackDelay) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(fn, { timeout: 500 });
    } else {
      setTimeout(fn, fallbackDelay || 100);
    }
  },

  whenDomReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      this.scheduleIdle(fn);
    }
  },

  _loadedModules: {},

  loadMenuModule(name) {
    if (!this._loadModulePromises) this._loadModulePromises = {};
    if (this._loadModulePromises[name]) return this._loadModulePromises[name];

    var self = this;
    var promise = L.require(name)
      .then(function (mod) {
        if (mod && mod.protonMixin) {
          Object.assign(self, mod.protonMixin);
        }
        self._loadedModules[name] = true;
        return true;
      })
      .catch(function (err) {
        try {
          console.warn("[proton2025] failed to load module", name, err);
        } catch (e) {}
        return false;
      });

    this._loadModulePromises[name] = promise;
    return promise;
  },

  ensureSearchIndexModule() {
    return this.loadMenuModule("menu-search-index");
  },

  ensureDropdownsModule() {
    return this.loadMenuModule("menu-dropdowns");
  },

  ensureThemeSettingsModule() {
    var self = this;
    return this.ensureSearchIndexModule().then(function () {
      return self.loadMenuModule("menu-theme-settings");
    });
  },

  installSearchIndexLazyTrigger() {
    if (this._searchIndexLazyTriggerInstalled) return;
    this._searchIndexLazyTriggerInstalled = true;

    var self = this;
    var triggered = false;
    var activate = function () {
      if (triggered) return;
      triggered = true;
      self.ensureSearchIndexModule().then(function (ok) {
        if (!ok) return;
        self.initSearchIndexFeedback();
        self.maybeFocusSearchIndexPanelFromHash();
      });
    };

    var onFocus = function (ev) {
      var t = ev.target;
      if (
        t &&
        (t.id === "proton-search-input" ||
          (t.closest && t.closest("#proton-search-container")) ||
          (t.matches && t.matches('input[placeholder="Поиск..."]')))
      ) {
        activate();
      }
    };
    document.addEventListener("focusin", onFocus, true);
    document.addEventListener("pointerdown", onFocus, true);

    var onState = function (ev) {
      var status = (ev && ev.detail && ev.detail.status) || {};
      if (status.inProgress) {
        window.removeEventListener("proton-search-index-state", onState);
        activate();
      }
    };
    window.addEventListener("proton-search-index-state", onState);

    if (window.location.hash === SEARCH_INDEX_PANEL_HASH) {
      activate();
    }
  },

  __init__() {
    ui.menu.load().then((tree) => this.render(tree));

    this.installThemeModeObserver();

    this.installSearchIndexLazyTrigger();
    window.addEventListener(SEARCH_INDEX_PANEL_FOCUS_EVENT, () => {
      this.ensureSearchIndexModule().then((ok) => {
        if (ok) this.focusSearchIndexPanel();
      });
    });

    this.loadAndApplyThemeSettings();

    this.whenDomReady(() => this.maybeInitThemeSettings());

    window.addEventListener("proton-settings-synced", () => {
      this.loadAndApplyThemeSettings();
      this._themeSettingsInit = false;
      this.maybeInitThemeSettings();
    });

    window.addEventListener("proton-spa-navigated", (ev) => {
      const segs = ev && ev.detail && ev.detail.pathSegments;
      if (Array.isArray(segs) && segs.length) this.updateActiveMenu(segs);

      // При SPA-переходе whenDomReady больше не срабатывает, поэтому панель
      // настроек темы монтируем заново на каждой навигации.
      if (!document.getElementById("proton-theme-settings")) {
        this._themeSettingsInit = false;
      }
      this.maybeInitThemeSettings();
    });

    let _resizeTimer = null;
    let _resizeRafPending = false;
    const scheduledResize = () => {
      if (_resizeRafPending) return;
      _resizeRafPending = true;
      requestAnimationFrame(() => {
        _resizeRafPending = false;
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(() => {
          requestAnimationFrame(() => this.repositionAlerts());

          if (window.innerWidth < 800) return;
          const z = safeStorage.get("proton-zoom") || "100";
          this.applyZoom(z);
          const pw = parseInt(safeStorage.get("proton-page-width")) || 0;
          this.applyPageWidth(pw);
        }, 200);
      });
    };
    window.addEventListener("resize", scheduledResize, { passive: true });

    this.whenDomReady(() => this.initFloatingAlerts());
  },

  maybeInitThemeSettings() {
    if (!document.body.dataset.page?.includes("admin-system-system")) return;
    this.ensureThemeSettingsModule().then((ok) => {
      if (!ok) return;
      this.initThemeSettings();
      this.ensureLoginSettingsScript();
    });
  },

  // header.ut подключает этот скрипт только при обычной загрузке страницы
  // системы, поэтому при SPA-переходе его нужно догрузить вручную.
  ensureLoginSettingsScript() {
    if (document.querySelector('script[src*="login-animation-settings.js"]'))
      return;

    const media = L.env?.media;
    if (!media) return;

    const script = document.createElement("script");
    script.src =
      media +
      "/js/login-animation-settings.js?v=" +
      (L.env.resource_version || "");
    document.head.appendChild(script);
  },

  loadAndApplyThemeSettings() {
    const defaultZoom = "100";
    const storedThemeMode = localStorage.getItem("proton-theme-mode");
    const settings = {
      themeMode:
        storedThemeMode === "light" || storedThemeMode === "dark"
          ? storedThemeMode
          : "auto",
      accentColor: localStorage.getItem("proton-accent-color") || "blue",
      borderRadius: localStorage.getItem("proton-border-radius") || "default",
      tabOutline: localStorage.getItem("proton-tab-outline") === "true",
      tabsStyle: ["classic", "proton"].includes(
        localStorage.getItem("proton-tab-style"),
      )
        ? localStorage.getItem("proton-tab-style")
        : "modern",
      backgroundPattern:
        localStorage.getItem("proton-background-pattern") || "none",
      patternScale: localStorage.getItem("proton-pattern-scale") || "100",
      zoom: localStorage.getItem("proton-zoom") || defaultZoom,
      pageWidth: localStorage.getItem("proton-page-width") || "0",
      menuMode: this.getMenuMode(),
      animations: localStorage.getItem("proton-animations") !== "false",
      transparency: localStorage.getItem("proton-transparency") !== "false",
      logHighlight: localStorage.getItem("proton-log-highlight") !== "false",
      customFont: localStorage.getItem("proton-custom-font") !== "false",
    };

    this.applyThemeMode(settings.themeMode);
    this.applyThemeSettings(settings);
  },

  translateThemeText(key) {
    if (typeof window.protonT === "function") {
      try {
        return window.protonT(key);
      } catch (error) {}
    }

    return _(key);
  },

  updateAssoclistTitles() {
    const tables = document.querySelectorAll("table.assoclist");
    if (!tables.length) return;

    tables.forEach((table) => {
      table.querySelectorAll("td").forEach((td) => {
        if (td.classList.contains("cbi-section-actions")) return;
        if (td.querySelector("button, .btn, .cbi-button, .control-group"))
          return;

        const badge = td.querySelector(".ifacebadge");
        if (badge) {
          const text = (badge.innerText || badge.textContent || "").trim();
          // LuCI иногда сам ставит более подробный title (сигнал/шум/SNR) —
          // затираем только если наш текст информативнее.
          const current = badge.getAttribute("title") || "";
          if (text && text.length >= 10 && current.length <= text.length) {
            badge.setAttribute("title", text);

            const inner = badge.querySelector("span");
            if (inner) inner.setAttribute("title", text);
          }
          return;
        }

        const text = (td.innerText || td.textContent || "")
          .trim()
          .replace(/\s+/g, " ");
        if (text && text.length >= 10) td.setAttribute("title", text);
      });
    });

    this.updateSignalIndicators();
  },

  updateSignalIndicators() {
    const badges = document.querySelectorAll(
      "table.assoclist .ifacebadge, #wifi_assoclist_table .ifacebadge",
    );

    badges.forEach((badge) => {
      const text = (badge.innerText || badge.textContent || "").trim();

      const match = text.match(/(-\d+)\s*(?:dBm|дБм)?/i);
      if (!match) return;

      const signalValue = parseInt(match[1], 10);
      if (isNaN(signalValue)) return;

      badge.setAttribute("data-signal", signalValue.toString());

      badge.classList.add("proton-signal-badge");

      let strength, color;

      if (signalValue >= -50) {
        strength = "100%";
        color = "#4caf50";
      } else if (signalValue >= -60) {
        strength = "80%";
        color = "#8bc34a";
      } else if (signalValue >= -70) {
        strength = "60%";
        color = "#ffc107";
      } else if (signalValue >= -80) {
        strength = "40%";
        color = "#ff9800";
      } else {
        strength = "20%";
        color = "#f44336";
      }

      badge.style.setProperty("--signal-strength", strength);
      badge.style.setProperty("--signal-color", color);

      const td = badge.closest("td");
      if (td) {
        td.classList.add("proton-signal-cell");
      }
    });
  },

  installAssoclistTitleObserver() {
    if (this._assoclistTitleObserver) return;

    let scheduled = false;
    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        this.updateAssoclistTitles();
      });
    };

    this._assoclistTitleObserver = new MutationObserver(scheduleUpdate);

    // Таблица подключённых клиентов есть и на «Беспроводная сеть», и в «Обзоре»
    // (status include 60_wifi) — наблюдаем на обеих страницах, иначе в «Обзоре»
    // бейдж сигнала остаётся без индикатора уровня.
    const assoclistPages = ["admin-network-wireless", "admin-status-overview"];

    this._assoclistAttached = false;
    const syncAssoclistObserver = () => {
      const dp = document.body.dataset.page || "";
      const want = assoclistPages.some((p) => dp.indexOf(p) !== -1);
      if (want === this._assoclistAttached) return;
      this._assoclistAttached = want;
      if (want) {
        this._assoclistTitleObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
        scheduleUpdate();
      } else {
        this._assoclistTitleObserver.disconnect();
      }
    };
    syncAssoclistObserver();

    this._assoclistNavObserver = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === "data-page") {
          syncAssoclistObserver();
          return;
        }
      }
    });
    this._assoclistNavObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-page"],
    });

    window.addEventListener(
      "pagehide",
      () => {
        if (this._assoclistTitleObserver) {
          this._assoclistTitleObserver.disconnect();
          this._assoclistTitleObserver = null;
        }
        if (this._assoclistNavObserver) {
          this._assoclistNavObserver.disconnect();
          this._assoclistNavObserver = null;
        }
      },
      { once: true },
    );
  },

  getMenuMode() {
    try {
      return localStorage.getItem("proton-menu-mode") === "side"
        ? "side"
        : "top";
    } catch (e) {
      return "top";
    }
  },

  getMenuCollapsed() {
    try {
      return localStorage.getItem("proton-menu-collapsed") === "true";
    } catch (e) {
      return false;
    }
  },

  ensureMenuToggle() {
    const mainmenu = document.querySelector("#mainmenu");
    if (!mainmenu) return null;

    let btn = mainmenu.querySelector("#proton-menu-toggle");
    if (!btn) {
      const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML =
        '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';

      btn = E("button", { id: "proton-menu-toggle", type: "button" }, [
        icon,
        E("span", {}, []),
      ]);
      btn.addEventListener("click", () => {
        this.applyMenuCollapsed(!this.getMenuCollapsed(), true);
      });
    }

    if (btn !== mainmenu.lastElementChild) mainmenu.appendChild(btn);
    this.updateMenuToggleLabel(btn);
    return btn;
  },

  updateMenuToggleLabel(btn) {
    const el = btn || document.querySelector("#proton-menu-toggle");
    if (!el) return;
    const collapsed = this.getMenuCollapsed();
    const label = this.translateThemeText(
      collapsed ? "Expand menu" : "Collapse menu",
    );
    const span = el.querySelector("span");
    if (span) span.textContent = label;
    el.setAttribute("aria-label", label);
    el.setAttribute("title", label);
    el.setAttribute("aria-expanded", collapsed ? "false" : "true");
  },

  applyMenuCollapsed(collapsed, persist) {
    const on = collapsed === true || collapsed === "true";
    document.documentElement.classList.toggle("proton-menu-collapsed", on);

    if (persist) {
      try {
        localStorage.setItem("proton-menu-collapsed", on ? "true" : "false");
      } catch (e) {}
    }

    this.updateMenuToggleLabel();
  },

  buildMenuIcon(name) {
    const id = PROTON_MENU_ICON_MAP[String(name || "")] || "box";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "proton-menu-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = PROTON_MENU_ICONS[id];
    return svg;
  },

  ensureMenuPlacement(isMobile) {
    const menubar = document.querySelector("#menubar");
    const menubarInner = document.querySelector("#menubar-inner") || menubar;
    const mainmenu = document.querySelector("#mainmenu");
    if (!menubar || !mainmenu) return;

    if (isMobile) {
      if (menubar.contains(mainmenu)) {
        menubar.insertAdjacentElement("afterend", mainmenu);
      }
    } else if (this.getMenuMode() === "side") {
      const container = document.querySelector("#maincontainer");
      if (container && mainmenu.parentNode !== container) {
        container.insertAdjacentElement("afterbegin", mainmenu);
      }
    } else {
      if (!menubarInner.contains(mainmenu)) {
        const indicators =
          menubarInner.querySelector("#indicators") ||
          menubar.querySelector("#indicators");
        if (indicators)
          indicators.insertAdjacentElement("beforebegin", mainmenu);
        else menubarInner.appendChild(mainmenu);
      }
    }
  },

  initIndicatorBadges() {
    const container = document.querySelector("#indicators");
    if (!container) return;

    const KNOWN_TYPES = [
      {
        match: (el) =>
          /changes|apply|save/i.test(
            (el.getAttribute("href") || "") +
              " " +
              (el.id || "") +
              " " +
              (el.className || ""),
          ),
        icon: "changes",
        label: () => _("Unsaved changes"),
      },
    ];

    const detectType = (el) => {
      for (const t of KNOWN_TYPES) if (t.match(el)) return t;
      return null;
    };

    const extractCount = (text) => {
      const m = text.match(/[:：(]\s*(\d{1,3})\s*\)?\s*$/);
      return m ? parseInt(m[1], 10) : null;
    };

    const transform = (el) => {
      if (!(el instanceof HTMLElement)) return;
      if (el.dataset.protonBadge === "done") {
        if (!el.querySelector(".proton-indicator-label")) {
          delete el.dataset.protonBadge;
          el.classList.remove("proton-indicator-badge", "has-count", "has-dot");
        } else {
          sync(el);
          return;
        }
      }

      const original = (el.textContent || "").trim();
      if (!original) return;

      const typeInfo = detectType(el);
      const count = extractCount(original);

      if (!typeInfo && count === null) return;

      el.dataset.protonBadge = "done";
      el.classList.add("proton-indicator-badge");
      if (typeInfo) el.dataset.indicatorType = typeInfo.icon;

      const labelSpan = document.createElement("span");
      labelSpan.className = "proton-indicator-label";
      labelSpan.textContent = original;

      const icon = document.createElement("span");
      icon.className = "proton-indicator-glyph";
      icon.setAttribute("aria-hidden", "true");

      const badge = document.createElement("span");
      badge.className = "proton-indicator-num";
      badge.setAttribute("aria-hidden", "true");

      el.textContent = "";
      el.appendChild(icon);
      el.appendChild(labelSpan);
      el.appendChild(badge);

      sync(el);
    };

    const sync = (el) => {
      const labelSpan = el.querySelector(".proton-indicator-label");
      const badge = el.querySelector(".proton-indicator-num");
      if (!labelSpan || !badge) return;

      const text = (labelSpan.textContent || "").trim();
      const count = extractCount(text);

      if (el.title !== text) el.title = text;
      if (el.getAttribute("aria-label") !== text)
        el.setAttribute("aria-label", text);

      if (count !== null && count > 0) {
        const badgeText = count > 99 ? "99+" : String(count);
        if (badge.textContent !== badgeText) badge.textContent = badgeText;
        if (badge.hidden) badge.hidden = false;
        el.classList.add("has-count");
        el.classList.remove("has-dot");
      } else if (text) {
        if (badge.textContent !== "") badge.textContent = "";
        if (!badge.hidden) badge.hidden = true;
        el.classList.remove("has-count");
        el.classList.add("has-dot");
      } else {
        if (badge.textContent !== "") badge.textContent = "";
        if (!badge.hidden) badge.hidden = true;
        el.classList.remove("has-count", "has-dot");
      }
    };

    const transformAll = () => {
      Array.from(container.children).forEach(transform);
    };

    transformAll();

    if (this._indicatorBadgeObserver) {
      this._indicatorBadgeObserver.disconnect();
      this._indicatorBadgeObserver = null;
    }

    this._indicatorBadgeObserver = new MutationObserver((mutations) => {
      let relevant = false;

      for (const m of mutations) {
        if (m.type === "characterData") {
          const parent = m.target.parentElement;
          if (parent && parent.classList.contains("proton-indicator-label")) {
            relevant = true;
            break;
          }
          continue;
        }

        for (const node of m.addedNodes) {
          if (
            node instanceof HTMLElement &&
            node.parentElement === container &&
            node.dataset.protonBadge !== "done"
          ) {
            relevant = true;
            break;
          }
        }
        if (relevant) break;
      }

      if (relevant) transformAll();
    });
    this._indicatorBadgeObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener(
      "pagehide",
      () => {
        if (this._indicatorBadgeObserver) {
          this._indicatorBadgeObserver.disconnect();
          this._indicatorBadgeObserver = null;
        }
      },
      { once: true },
    );
  },

  render(tree) {
    let node = tree;
    let url = "";

    this._menuTree = tree;

    const mq = window.matchMedia("(max-width: 800px)");
    const onViewportChange = (isMobile) => {
      this.ensureMenuPlacement(isMobile);
      this.applyMenuCollapsed(
        !isMobile && this.getMenuMode() === "side" && this.getMenuCollapsed(),
        false,
      );
    };
    this.ensureMenuPlacement(mq.matches);
    if (typeof mq.addEventListener === "function")
      mq.addEventListener("change", (ev) => onViewportChange(ev.matches));
    else if (typeof mq.addListener === "function")
      mq.addListener((ev) => onViewportChange(ev.matches));

    if (mq.matches) {
      this.ensureMobileMenuIcon();
      this.addMobileMenuCloseButton();
    }

    this.renderModeMenu(node);

    this.ensureMenuToggle();

    if (L.env.dispatchpath.length >= 3) {
      for (var i = 0; i < 3 && node; i++) {
        node = node.children[L.env.dispatchpath[i]];
        url = url + (url ? "/" : "") + L.env.dispatchpath[i];
      }

      if (node) this.renderTabMenu(node, url);
    }

    const navToggle = document.querySelector("#menubar .navigation");
    if (navToggle)
      navToggle.addEventListener(
        "click",
        ui.createHandlerFn(this, "handleSidebarToggle"),
      );

    document.addEventListener("click", (ev) => {
      if (ev.target.closest("#mainmenu")) return;

      document.querySelectorAll("ul.mainmenu.l1.active").forEach((ul) => {
        ul.classList.remove("active");
      });

      document.querySelectorAll("ul.mainmenu.l1 > li.active").forEach((li) => {
        li.classList.remove("active");
      });
    });

    this.installAssoclistTitleObserver();

    this.initIndicatorBadges();

    this.setupMobileTableTitles();

    this.maybeSetupActionDropdowns();
  },

  maybeSetupActionDropdowns() {
    const path = (L.env && L.env.dispatchpath) || [];
    const route = path.join("/");
    const needsDropdowns =
      route.indexOf("admin/network/wireless") === 0 ||
      route.indexOf("admin/network/network") === 0 ||
      document.querySelector("#cbi-wireless") ||
      document.querySelector("#cbi-network-interface") ||
      document.querySelector("#cbi-network-device");

    if (!needsDropdowns) return;

    this.ensureDropdownsModule().then((ok) => {
      if (!ok) return;
      this.setupWirelessActionsDropdown();
      this.setupNetworkInterfaceActionsDropdown();
      this.setupDevicesActionsDropdown();
      this.setupGlobalDropdownHandlers();
    });
  },

  handleMenuExpand(ev) {
    const a = ev.currentTarget;
    const li = a.parentNode;
    const ul1 = li.parentNode;
    const ul2 = a.nextElementSibling;
    const isMobile = window.matchMedia("(max-width: 800px)").matches;
    const isTouchLike = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;
    const isSideMode = !isMobile && this.getMenuMode() === "side";

    if (!isMobile && !isTouchLike && !isSideMode) {
      document.querySelectorAll("ul.mainmenu.l1.active").forEach((ul) => {
        ul.classList.remove("active");
      });

      document
        .querySelectorAll("ul.mainmenu.l1 > li.active")
        .forEach((item) => {
          item.classList.remove("active");
        });

      return;
    }

    document.querySelectorAll("ul.mainmenu.l1 > li.active").forEach((item) => {
      if (item !== li) item.classList.remove("active");
    });

    if (!ul2) {
      if (isMobile) {
        this.closeMobileMenu();
      }
      return;
    }

    if (li.classList.contains("active")) {
      li.classList.remove("active");
      ul1.classList.remove("active");
      a.blur();
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }

    if (
      !isSideMode &&
      ul2.parentNode.offsetLeft + ul2.offsetWidth <=
        ul1.offsetLeft + ul1.offsetWidth
    )
      ul2.classList.add("align-left");

    ul1.classList.add("active");
    li.classList.add("active");
    a.blur();

    ev.preventDefault();
    ev.stopPropagation();
  },

  renderMainMenu(tree, url, level) {
    const l = (level || 0) + 1;
    const ul = E("ul", { class: "mainmenu l%d".format(l) });
    const children = ui.menu.getChildren(tree);

    if (children.length == 0 || l > 2) return E([]);

    children.forEach((child) => {
      const isActive = L.env.dispatchpath[l] == child.name;
      const activeClass = "mainmenu-item-%s%s".format(
        child.name,
        isActive ? " selected" : "",
      );

      const childChildren = ui.menu.getChildren(child);
      let menuHref;
      if (l == 1 && childChildren.length > 0) {
        menuHref = L.url(url, child.name, childChildren[0].name);
      } else {
        menuHref = L.url(url, child.name);
      }

      ul.appendChild(
        E("li", { class: activeClass }, [
          E(
            "a",
            {
              href: menuHref,
              title: l == 1 ? _(child.title) : null,
              click: l == 1 ? ui.createHandlerFn(this, "handleMenuExpand") : "",
            },
            l == 1
              ? [
                  this.buildMenuIcon(child.name),
                  E("span", { class: "proton-menu-label" }, [_(child.title)]),
                ]
              : [_(child.title)],
          ),
          this.renderMainMenu(child, url + "/" + child.name, l),
        ]),
      );
    });

    if (l == 1) document.querySelector("#mainmenu").appendChild(E("div", [ul]));

    return ul;
  },

  renderModeMenu(tree) {
    const menu = document.querySelector("#modemenu");
    const children = ui.menu.getChildren(tree);

    children.forEach((child, index) => {
      const firstPathItem = L.env.requestpath?.length
        ? L.env.requestpath[0]
        : L.env.dispatchpath?.length
          ? L.env.dispatchpath[0]
          : null;

      const isActive = firstPathItem
        ? child.name === firstPathItem
        : index === 0;

      if (index > 0) menu.appendChild(E([], ["\u00a0|\u00a0"]));

      menu.appendChild(
        E("div", { class: isActive ? "active" : "" }, [
          E("a", { href: L.url(child.name) }, [_(child.title)]),
        ]),
      );

      if (isActive) this.renderMainMenu(child, child.name);
    });

    if (menu.children.length > 1) menu.style.display = "";
  },

  renderTabMenu(tree, url, level) {
    const container = document.querySelector("#tabmenu");
    const l = (level || 0) + 1;
    const ul = E("ul", { class: "cbi-tabmenu" });
    const children = ui.menu.getChildren(tree);
    let activeNode = null;

    if (children.length == 0) return E([]);

    children.forEach((child) => {
      const isActive = L.env.dispatchpath[l + 2] == child.name;
      const activeClass = isActive ? " cbi-tab" : "";
      const className = "tabmenu-item-%s %s".format(child.name, activeClass);

      ul.appendChild(
        E("li", { class: className }, [
          E("a", { href: L.url(url, child.name) }, [_(child.title)]),
        ]),
      );

      if (isActive) activeNode = child;
    });

    container.appendChild(ul);
    container.style.display = "";

    if (activeNode)
      container.appendChild(
        this.renderTabMenu(activeNode, url + "/" + activeNode.name, l),
      );

    return ul;
  },

  updateActiveMenu(pathSegments) {
    try {
      const L = window.L;
      if (!Array.isArray(pathSegments) || !pathSegments.length) return;

      if (L && L.env) {
        L.env.dispatchpath = pathSegments.slice();
        L.env.requestpath = pathSegments.slice();
      }

      const applySelected = (selector, level) => {
        document.querySelectorAll(selector).forEach((li) => {
          const m = (li.className || "").match(/mainmenu-item-([^\s]+)/);
          const name = m ? m[1] : null;
          const active = !!name && pathSegments[level] === name;
          li.classList.toggle("selected", active);
        });
      };
      applySelected("#mainmenu ul.mainmenu.l1 > li", 1);
      applySelected("#mainmenu ul.mainmenu.l2 > li", 2);

      const modemenu = document.querySelector("#modemenu");
      if (modemenu && pathSegments[0]) {
        modemenu.querySelectorAll("div").forEach((div) => {
          const a = div.querySelector("a");
          const href = a ? a.getAttribute("href") || "" : "";
          const active = href
            .replace(/\/+$/, "")
            .endsWith("/" + pathSegments[0]);
          div.classList.toggle("active", active);
        });
      }

      const container = document.querySelector("#tabmenu");
      if (container) {
        container.innerHTML = "";
        container.style.display = "none";
        if (this._menuTree && pathSegments.length >= 3) {
          let node = this._menuTree;
          let url = "";
          for (let i = 0; i < 3 && node; i++) {
            node = node.children && node.children[pathSegments[i]];
            url = url + (url ? "/" : "") + pathSegments[i];
          }
          if (node) this.renderTabMenu(node, url);
        }
      }
    } catch (e) {
      console.warn("[Proton2025 menu] updateActiveMenu:", e);
    }
  },

  handleSidebarToggle(ev) {
    const btn = ev.currentTarget;
    const bar = document.querySelector("#mainmenu");
    const overlay = this.getOrCreateOverlay();

    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      bar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    } else {
      btn.classList.add("active");
      bar.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
    this.updateMobileMenuIcon(btn.classList.contains("active"));
  },

  ensureMobileMenuIcon() {
    const toggle = document.querySelector("#menubar .navigation");
    if (!toggle || toggle.querySelector(".proton-mobile-menu-icon")) return;

    toggle.appendChild(this.buildMobileMenuIcon(false));
  },

  updateMobileMenuIcon(close) {
    const toggle = document.querySelector("#menubar .navigation");
    const icon = toggle?.querySelector(".proton-mobile-menu-icon");
    if (!toggle || !icon) return;
    icon.replaceWith(this.buildMobileMenuIcon(close));
  },

  getOrCreateOverlay() {
    let overlay = document.querySelector("#menu-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "menu-overlay";
      overlay.addEventListener("click", () => {
        this.closeMobileMenu();
      });
      document.body.appendChild(overlay);
    }
    return overlay;
  },

  closeMobileMenu() {
    const btn = document.querySelector("#menubar .navigation");
    const bar = document.querySelector("#mainmenu");
    const overlay = document.querySelector("#menu-overlay");

    if (btn) btn.classList.remove("active");
    if (bar) bar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
    this.updateMobileMenuIcon(false);
  },

  addMobileMenuCloseButton() {
    const mainmenu = document.querySelector("#mainmenu");
    if (!mainmenu) return;

    if (mainmenu.querySelector(".menu-close")) return;

    const closeBtn = document.createElement("button");
    closeBtn.className = "menu-close";
    closeBtn.appendChild(this.buildMobileMenuIcon(true));
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.addEventListener("click", () => {
      this.closeMobileMenu();
    });

    mainmenu.insertBefore(closeBtn, mainmenu.firstChild);
  },

  buildMobileMenuIcon(close) {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.classList.add("proton-mobile-menu-icon");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = close
      ? '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>'
      : '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
    return icon;
  },

  setupMobileTableTitles() {
    const updateTitles = () => {
      if (window.innerWidth > 800) return;

      document.querySelectorAll("table").forEach((table) => {
        if (table.classList.contains("mobile-titles-set")) return;

        const headers = [];
        const headerRow = table.querySelector(
          "thead tr, tr.cbi-section-table-titles",
        );

        if (headerRow) {
          headerRow.querySelectorAll("th").forEach((th) => {
            headers.push((th.textContent || "").trim());
          });
        }

        if (headers.length === 0) return;

        table
          .querySelectorAll("tbody tr, tr.cbi-section-table-row")
          .forEach((row) => {
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, index) => {
              if (headers[index] && !cell.hasAttribute("data-title")) {
                cell.setAttribute("data-title", headers[index]);
              }
            });
          });

        table.classList.add("mobile-titles-set");
      });
    };

    updateTitles();

    let updateTitlesRaf = false;
    const scheduleTitles = () => {
      if (updateTitlesRaf) return;
      updateTitlesRaf = true;
      requestAnimationFrame(() => {
        updateTitlesRaf = false;
        updateTitles();
      });
    };
    window.addEventListener("resize", scheduleTitles, { passive: true });

    let titlesScheduled = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(titlesScheduled);
      titlesScheduled = setTimeout(updateTitles, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener(
      "pagehide",
      function () {
        observer.disconnect();
        clearTimeout(titlesScheduled);
        window.removeEventListener("resize", updateTitles);
      },
      { once: true },
    );
  },

  installThemeModeObserver() {
    if (this._themeModeObserverInstalled || !window.matchMedia) {
      return;
    }

    this._themeModeObserverInstalled = true;
    this._themeModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleThemeModeChange = () => {
      const storedMode = localStorage.getItem("proton-theme-mode") || "auto";
      if (storedMode === "auto") {
        this.applyThemeMode("auto");
      }
    };

    if (typeof this._themeModeMediaQuery.addEventListener === "function") {
      this._themeModeMediaQuery.addEventListener(
        "change",
        handleThemeModeChange,
      );
    } else if (typeof this._themeModeMediaQuery.addListener === "function") {
      this._themeModeMediaQuery.addListener(handleThemeModeChange);
    }
  },

  getResolvedThemeMode(mode) {
    if (mode === "auto" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    return mode === "light" ? "light" : "dark";
  },

  applyThemeMode(mode) {
    const resolvedMode = this.getResolvedThemeMode(mode);
    const root = document.documentElement;

    root.setAttribute("data-theme", resolvedMode);
    root.setAttribute(
      "data-darkmode",
      resolvedMode === "dark" ? "true" : "false",
    );
    root.style.setProperty(
      "background-color",
      resolvedMode === "light" ? "#ffffff" : "#0f1419",
    );

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        "content",
        resolvedMode === "light" ? "#ffffff" : "#0f1419",
      );
    }

    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.setAttribute("content", resolvedMode);
    }

    document.documentElement.style.removeProperty("--proton-pattern-image");

    return resolvedMode;
  },

  applyThemeSettings(settings) {
    if (settings.themeMode) {
      this.applyThemeMode(settings.themeMode);
    }

    this.applyAccentColor(settings.accentColor);
    this.applyBorderRadius(settings.borderRadius);
    this.applyTabOutline(settings.tabOutline);
    this.applyTabsStyle(settings.tabsStyle);
    this.applyBackgroundPattern(settings.backgroundPattern);
    this.applyPatternScale(settings.patternScale);
    this.applyZoom(settings.zoom);
    this.applyPageWidth(settings.pageWidth);
    this.applyMenuMode(settings.menuMode);
    this.applyAnimations(settings.animations);
    this.applyTransparency(settings.transparency);
    this.applyCustomFont(settings.customFont);
  },

  normalizeHex(hex) {
    if (typeof hex !== "string") return null;
    let h = hex.trim().replace(/^#/, "");
    if (/^[0-9a-fA-F]{3}$/.test(h)) {
      h = h
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    if (/^[0-9a-fA-F]{6}$/.test(h)) {
      return "#" + h.toLowerCase();
    }
    return null;
  },

  deriveAccent(hex) {
    const safe = this.normalizeHex(hex) || "#5e9eff";
    const r = parseInt(safe.slice(1, 3), 16);
    const g = parseInt(safe.slice(3, 5), 16);
    const b = parseInt(safe.slice(5, 7), 16);
    const lighten = (v) => Math.round(v + (255 - v) * 0.2);
    const toHex = (v) => v.toString(16).padStart(2, "0");
    return {
      accent: safe,
      hover: "#" + toHex(lighten(r)) + toHex(lighten(g)) + toHex(lighten(b)),
      glow: `rgba(${r}, ${g}, ${b}, 0.2)`,
      rgb: `${r}, ${g}, ${b}`,
    };
  },

  applyAccentColor(color) {
    const colors = {
      default: {
        accent: "#4b5563",
        hover: "#374151",
        glow: "rgba(75, 85, 99, 0.22)",
        rgb: "75, 85, 99",
      },
      blue: {
        accent: "#5e9eff",
        hover: "#7db2ff",
        glow: "rgba(94, 158, 255, 0.18)",
        rgb: "94, 158, 255",
      },
      purple: {
        accent: "#a78bfa",
        hover: "#c3b4ff",
        glow: "rgba(167, 139, 250, 0.22)",
        rgb: "167, 139, 250",
      },
      green: {
        accent: "#34d399",
        hover: "#2fb885",
        glow: "rgba(52, 211, 153, 0.18)",
        rgb: "52, 211, 153",
      },
      orange: {
        accent: "#fb923c",
        hover: "#f47c1f",
        glow: "rgba(251, 146, 60, 0.20)",
        rgb: "251, 146, 60",
      },
      red: {
        accent: "#f87171",
        hover: "#f04c4c",
        glow: "rgba(248, 113, 113, 0.20)",
        rgb: "248, 113, 113",
      },
    };

    const c =
      color === "custom"
        ? this.deriveAccent(localStorage.getItem("proton-accent-custom"))
        : colors[color] || colors.default;
    document.documentElement.style.setProperty("--proton-accent", c.accent);
    document.documentElement.style.setProperty(
      "--proton-accent-hover",
      c.hover,
    );
    document.documentElement.style.setProperty("--proton-accent-glow", c.glow);
    document.documentElement.style.setProperty("--proton-accent-rgb", c.rgb);
  },

  applyBorderRadius(radius) {
    const root = document.documentElement;
    root.classList.remove("proton-radius-sharp", "proton-radius-extra");

    if (radius === "sharp") {
      root.classList.add("proton-radius-sharp");
    } else if (radius === "extra") {
      root.classList.add("proton-radius-extra");
    }
  },

  applyTabOutline(enabled) {
    document.documentElement.classList.toggle(
      "proton-tab-outline",
      enabled === true || enabled === "true",
    );
  },

  applyTabsStyle(style) {
    const root = document.documentElement;
    root.classList.toggle("proton-tabs-classic", style === "classic");
    root.classList.toggle("proton-tabs-proton", style === "proton");
  },

  applyMenuMode(mode) {
    const side = mode === "side";
    document.documentElement.classList.toggle("proton-menu-side", side);

    const isMobile = window.matchMedia("(max-width: 800px)").matches;
    this.ensureMenuPlacement(isMobile);

    if (side && !isMobile) this.ensureMenuToggle();
    this.applyMenuCollapsed(
      side && !isMobile && this.getMenuCollapsed(),
      false,
    );

    if (!isMobile) {
      document
        .querySelectorAll("ul.mainmenu.l1.active, ul.mainmenu.l1 > li.active")
        .forEach((el) => el.classList.remove("active"));
      document
        .querySelectorAll("ul.mainmenu.l2.align-left")
        .forEach((el) => el.classList.remove("align-left"));
    }
  },

  applyBackgroundPattern(pattern) {
    const root = document.documentElement;
    root.classList.remove(
      "proton-pattern-grid",
      "proton-pattern-dots",
      "proton-pattern-stars",
      "proton-pattern-noise",
    );

    if (pattern === "noise") pattern = "stars"; // pattern was renamed

    if (pattern !== "stars")
      root.style.removeProperty("--proton-pattern-image");

    if (pattern && pattern !== "none") {
      root.classList.add("proton-pattern-" + pattern);
    }
  },

  applyPatternScale(scale) {
    const pct = Math.max(50, Math.min(200, parseInt(scale) || 100));
    document.documentElement.style.setProperty(
      "--proton-pattern-scale",
      pct / 100,
    );
  },

  buildStarfield() {
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    const color = isLight ? "#0f172a" : "#ffffff";
    const na = isLight ? ".07" : ".05";
    const mat = isLight
      ? "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " + na + " 0"
      : "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 " + na + " 0";
    const W = 200,
      m = 2,
      radii = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6],
      c = [];
    const put = (x, y, r, o) =>
      c.push(
        "<circle cx='" +
          x +
          "' cy='" +
          y +
          "' r='" +
          r +
          "' opacity='" +
          o +
          "'/>",
      );
    for (let i = 0; i < 46; i++) {
      const x = +(Math.random() * W).toFixed(1),
        y = +(Math.random() * W).toFixed(1),
        r = +(
          radii[(Math.random() * radii.length) | 0] *
          (0.8 + Math.random() * 0.3)
        ).toFixed(2),
        o = +(0.06 + Math.random() * 0.2).toFixed(3);
      const xs = [x];
      if (x < r + m) xs.push(x + W);
      if (x > W - (r + m)) xs.push(x - W);
      const ys = [y];
      if (y < r + m) ys.push(y + W);
      if (y > W - (r + m)) ys.push(y - W);
      for (const xx of xs)
        for (const yy of ys) put(+xx.toFixed(1), +yy.toFixed(1), r, o);
    }
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='" +
      W +
      "' height='" +
      W +
      "'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/>" +
      "<feColorMatrix type='matrix' values='" +
      mat +
      "'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#n)'/>" +
      "<g fill='" +
      color +
      "'>" +
      c.join("") +
      "</g></svg>";
    const uri = svg
      .replace(/%/g, "%25")
      .replace(/</g, "%3c")
      .replace(/>/g, "%3e")
      .replace(/#/g, "%23");
    return 'url("data:image/svg+xml,' + uri + '")';
  },

  refreshStarfield() {
    if (!document.documentElement.classList.contains("proton-pattern-stars"))
      return;
    document.documentElement.style.setProperty(
      "--proton-pattern-image",
      this.buildStarfield(),
    );
  },

  applyZoom(zoom) {
    if (window.innerWidth < 800) {
      document.documentElement.style.zoom = "";
      return;
    }
    const scale = parseInt(zoom) / 100;
    document.documentElement.style.zoom = scale;
  },

  applyPageWidth(width) {
    const val = parseInt(width) || 0;
    if (window.innerWidth < 800) {
      document.documentElement.style.setProperty(
        "--proton-page-max-width",
        "80%",
        "important",
      );
      return;
    }
    if (val >= 50 && val <= 100) {
      document.documentElement.style.setProperty(
        "--proton-page-max-width",
        val + "%",
        "important",
      );
    } else {
      document.documentElement.style.setProperty(
        "--proton-page-max-width",
        "1200px",
        "important",
      );
    }
  },

  applyAnimations(enabled) {
    if (!enabled) {
      document.documentElement.classList.add("proton-no-animations");
    } else {
      document.documentElement.classList.remove("proton-no-animations");
    }
  },

  applyTransparency(enabled) {
    if (enabled) {
      document.documentElement.classList.add("proton-transparency");
    } else {
      document.documentElement.classList.remove("proton-transparency");
    }
  },

  applyCustomFont(enabled) {
    const root = document.documentElement;
    if (enabled) {
      root.classList.remove("proton-system-font");
    } else {
      root.classList.add("proton-system-font");
    }
  },

  protonConfirm(options) {
    const opts = options || {};
    const t = (key) => this.translateThemeText(key);

    const openDialog = document.querySelector(
      ".proton-confirm-modal-overlay:not(.is-closing)",
    );
    if (openDialog) {
      openDialog
        .querySelector(".cbi-button-negative, .cbi-button-action")
        ?.focus();
      return Promise.resolve(false);
    }

    this._protonConfirmSeq = (this._protonConfirmSeq || 0) + 1;
    const uid = Date.now().toString(36) + "-" + this._protonConfirmSeq;

    return new Promise((resolve) => {
      const previousFocus = document.activeElement;
      let settled = false;

      const overlay = document.createElement("div");
      overlay.className = "proton-confirm-modal-overlay";

      const dialog = document.createElement("div");
      dialog.className = "proton-confirm-modal";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");

      const titleId = "proton-confirm-title-" + uid;
      const bodyId = "proton-confirm-body-" + uid;

      const title = document.createElement("h3");
      title.id = titleId;
      title.textContent = opts.title || t("Confirm");
      dialog.setAttribute("aria-labelledby", titleId);
      dialog.appendChild(title);

      const message = document.createElement("p");
      message.id = bodyId;
      message.textContent = opts.message || "";
      dialog.setAttribute("aria-describedby", bodyId);
      dialog.appendChild(message);

      const actions = document.createElement("div");
      actions.className = "proton-confirm-modal-actions";

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "cbi-button cbi-button-neutral";
      cancelBtn.textContent = opts.cancelLabel || t("Cancel");

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className =
        "cbi-button " +
        (opts.danger === false ? "cbi-button-action" : "cbi-button-negative");
      confirmBtn.textContent = opts.confirmLabel || t("Confirm");

      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
      dialog.appendChild(actions);
      overlay.appendChild(dialog);

      const finish = (result) => {
        if (settled) return;
        settled = true;

        document.removeEventListener("keydown", onKeyDown, true);
        overlay.classList.add("is-closing");

        if (previousFocus && typeof previousFocus.focus === "function") {
          try {
            previousFocus.focus();
          } catch (e) {}
        }

        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);

        resolve(result);
      };

      const onKeyDown = (event) => {
        if (!overlay.isConnected) {
          finish(false);
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          finish(false);
          return;
        }

        if (event.key !== "Tab") return;

        const focusable = [cancelBtn, confirmBtn];
        const index = focusable.indexOf(document.activeElement);
        event.preventDefault();
        const next = event.shiftKey
          ? focusable[(index <= 0 ? focusable.length : index) - 1]
          : focusable[(index + 1) % focusable.length];
        next.focus();
      };

      cancelBtn.addEventListener("click", () => finish(false));
      confirmBtn.addEventListener("click", () => finish(true));
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) finish(false);
      });
      document.addEventListener("keydown", onKeyDown, true);

      document.body.appendChild(overlay);
      requestAnimationFrame(() => confirmBtn.focus());
    });
  },

  initFloatingAlerts() {
    if (this._alertsInitialized) return;

    const processAlerts = () => {
      const alerts = document.querySelectorAll(
        ".alert-message:not([data-floating-init])",
      );
      if (!alerts.length) return;

      alerts.forEach((alert, index) => {
        try {
          if (this.isDialogAlert(alert)) {
            alert.dataset.floatingInit = "dialog";
            alert.classList.remove(
              "proton-alert-floating",
              "proton-alert-native",
            );
            return;
          }

          alert.dataset.floatingInit = "true";

          if (!this.isManagedAlert(alert)) {
            alert.classList.remove("proton-alert-floating");
            alert.classList.add("proton-alert-native");
            return;
          }

          alert.classList.remove("proton-alert-native");
          alert.classList.add("proton-alert-floating");

          const contentText = alert.textContent?.trim() || "";
          const alertId = `alert-${this.simpleHash(contentText)}`;
          alert.dataset.alertId = alertId;

          if (!this.isTransientAlert(alert)) {
            const dismissed = sessionStorage.getItem(
              `proton-alert-dismissed-${alertId}`,
            );
            if (dismissed === "true") {
              alert.remove();
              return;
            }
          }

          this.removeCoreDismissButton(alert);
          this.ensureAlertStructure(alert);

          if (!alert.querySelector(".alert-message-close")) {
            const closeBtn = this.createCloseButton(alert, alertId);
            const header = alert.querySelector(".alert-message-header");
            (
              header ||
              alert.querySelector(".alert-message-content") ||
              alert
            ).appendChild(closeBtn);
          }

          this._positionAlert(alert, index);

          requestAnimationFrame(() => {
            setTimeout(() => {
              alert.classList.add("is-visible");
              requestAnimationFrame(() => this.repositionAlerts());
              this.scheduleAlertTimeout(alert, alertId);
            }, 50 * index);
          });
        } catch (error) {
          console.error("Error initializing alert:", error);
        }
      });
    };

    processAlerts();

    if (!this._alertObserver) {
      let debounceTimer = null;

      this._alertObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            const candidates = node.classList?.contains("alert-message")
              ? [node]
              : Array.from(node.querySelectorAll?.(".alert-message") ?? []);
            for (const alert of candidates) {
              if (alert.dataset.floatingInit) continue;
              if (this.isDialogAlert(alert)) {
                alert.dataset.floatingInit = "dialog";
                alert.classList.remove(
                  "proton-alert-floating",
                  "proton-alert-native",
                );
              } else if (this.isManagedAlert(alert)) {
                alert.classList.remove("proton-alert-native");
                alert.classList.add("proton-alert-floating");
              } else {
                alert.classList.add("proton-alert-native");
                alert.classList.remove("proton-alert-floating");
                alert.dataset.floatingInit = "true";
              }
            }
          }
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          processAlerts();
        }, 100);
      });

      this._alertObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      window.addEventListener(
        "pagehide",
        () => {
          if (this._alertObserver) {
            this._alertObserver.disconnect();
            this._alertObserver = null;
          }
          clearTimeout(debounceTimer);
        },
        { once: true },
      );
    }

    this._alertsInitialized = true;
  },

  isManagedAlert(alert) {
    return alert?.dataset?.protonManaged === "true";
  },

  isTransientAlert(alert) {
    return parseInt(alert?.dataset?.protonTimeout, 10) > 0;
  },

  scheduleAlertTimeout(alert, alertId) {
    const timeout = parseInt(alert?.dataset?.protonTimeout, 10);
    if (!(timeout > 0)) return;

    alert._protonTimeoutId = setTimeout(() => {
      alert._protonTimeoutId = null;
      this.dismissAlert(alert, alertId, false);
    }, timeout);
  },

  isDialogAlert(alert) {
    return !!alert?.closest?.(
      "#modal_overlay, .modal, .proton-reboot-modal-overlay, .proton-confirm-modal-overlay",
    );
  },

  removeCoreDismissButton(alert) {
    const wrapper = alert.lastElementChild;
    if (!wrapper || wrapper.tagName !== "DIV" || wrapper.className) return;
    if (wrapper.childNodes.length !== 1) return;
    const btn = wrapper.firstElementChild;
    if (btn?.tagName === "BUTTON" && btn.classList.contains("btn"))
      wrapper.remove();
  },

  ensureAlertStructure(alert) {
    if (alert.querySelector(".alert-message-content")) {
      const content = alert.querySelector(".alert-message-content");

      if (!content.querySelector(".alert-message-header")) {
        const title = content.querySelector(":scope > h4");
        this._ensureHeader(content, title);
      }

      const looseButtons = Array.from(
        content.querySelectorAll(
          ":scope > button:not(.alert-message-close), :scope > .cbi-button, :scope > .btn, :scope > a.cbi-button",
        ),
      );
      if (
        looseButtons.length > 0 &&
        !content.querySelector(".alert-message-footer")
      ) {
        const footer = document.createElement("div");
        footer.className = "alert-message-footer";
        looseButtons.forEach((btn) => footer.appendChild(btn));
        content.appendChild(footer);
      }
      return;
    }

    const title = alert.querySelector(":scope > h4");
    const childNodes = Array.from(alert.childNodes);

    const wrapper = document.createElement("div");
    wrapper.className = "alert-message-content";

    this._ensureHeader(wrapper, title);

    const footerButtons = [];

    childNodes.forEach((node) => {
      if (node === title) {
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.trim()) {
          wrapper.appendChild(node);
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const element = node;

      if (
        element.matches(
          "button:not(.alert-message-close), .cbi-button, .btn, a.cbi-button",
        )
      ) {
        footerButtons.push(element);
        return;
      }

      if (element.matches(".right")) {
        const nestedButtons = Array.from(
          element.querySelectorAll(
            ":scope > button:not(.alert-message-close), :scope > .cbi-button, :scope > .btn, :scope > a.cbi-button",
          ),
        );

        if (
          nestedButtons.length > 0 &&
          nestedButtons.length === element.children.length
        ) {
          footerButtons.push(...nestedButtons);
          return;
        }
      }

      wrapper.appendChild(element);
    });

    if (footerButtons.length > 0) {
      const footer = document.createElement("div");
      footer.className = "alert-message-footer";
      footerButtons.forEach((btn) => footer.appendChild(btn));
      wrapper.appendChild(footer);
    }

    alert.replaceChildren(wrapper);
  },

  _ensureHeader(wrapper, title) {
    const header = document.createElement("div");
    header.className = "alert-message-header";
    if (title) header.appendChild(title);
    wrapper.insertBefore(header, wrapper.firstChild);
    return header;
  },

  createCloseButton(alert, alertId) {
    const closeBtn = document.createElement("button");
    closeBtn.className = "alert-message-close";
    closeBtn.innerHTML = "×";
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("aria-label", "Close alert");
    closeBtn.setAttribute("title", "Закрыть уведомление");

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dismissAlert(alert, alertId, !this.isTransientAlert(alert));
    });

    return closeBtn;
  },

  dismissAlert(alert, alertId, persist = true) {
    try {
      if (alert._protonTimeoutId) {
        clearTimeout(alert._protonTimeoutId);
        alert._protonTimeoutId = null;
      }

      if (persist) {
        sessionStorage.setItem(`proton-alert-dismissed-${alertId}`, "true");
      }

      alert.classList.remove("is-visible");
      alert.classList.add("is-hidden");

      setTimeout(() => {
        if (alert.parentNode) {
          alert.remove();
        }
        this.repositionAlerts();
      }, 300);
    } catch (error) {
      console.error("Error dismissing alert:", error);
      if (alert.parentNode) {
        alert.remove();
      }
    }
  },

  repositionAlerts() {
    const gap = 12;
    const baseTop = window.matchMedia("(max-width: 800px)").matches ? 72 : 84;
    let top = baseTop;

    const stacked = [
      document.querySelector(
        "#proton-search-index-hud.is-visible:not([hidden])",
      ),
      document.querySelector(
        "#proton-search-index-toast.is-visible:not([hidden])",
      ),
      ...Array.from(
        document.querySelectorAll(
          ".alert-message.proton-alert-floating.is-visible",
        ),
      ),
    ].filter(Boolean);

    stacked.forEach((el) => {
      el.style.top = top + "px";
      top += el.offsetHeight + gap;
    });
  },

  _positionAlert(alert, batchIndex) {
    const gap = 12;
    const baseTop = window.matchMedia("(max-width: 800px)").matches ? 72 : 84;
    let top = baseTop;

    [
      document.querySelector(
        "#proton-search-index-hud.is-visible:not([hidden])",
      ),
      document.querySelector(
        "#proton-search-index-toast.is-visible:not([hidden])",
      ),
    ]
      .filter(Boolean)
      .forEach((el) => {
        top += el.offsetHeight + gap;
      });

    Array.from(
      document.querySelectorAll(
        ".alert-message.proton-alert-floating.is-visible",
      ),
    ).forEach((a) => {
      top += a.offsetHeight + gap;
    });
    top += batchIndex * (120 + gap);
    alert.style.top = top + "px";
  },

  simpleHash(str) {
    let hash = 0;
    if (!str || str.length === 0) return hash.toString();

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36);
  },
});
