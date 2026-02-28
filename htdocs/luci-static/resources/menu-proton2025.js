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

// Helper function for translations - проверяем каждый раз при вызове
var translate = function (s) {
  if (!s) return s;

  // 1. Используем L.tr() из LuCI (основной способ для меню)
  if (window.L && typeof window.L.tr === "function") {
    try {
      const translated = window.L.tr(s);
      // L.tr() возвращает переведенный текст или оригинал, если перевод не найден
      if (translated && translated !== s) {
        return translated;
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }

  // 2. Используем глобальную функцию _() из LuCI если доступна
  if (typeof window._ !== "undefined" && typeof window._ === "function") {
    try {
      const translated = window._(s);
      // Проверяем, что это не просто заглушка (которая вернет оригинал)
      if (translated && translated !== s) {
        return translated;
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }

  // 3. Возвращаем оригинал если переводы недоступны
  return s;
};

// Use safe wrappers
var E = defined_E;
var _ = translate;

return baseclass.extend({
  __init__() {
    ui.menu.load().then((tree) => this.render(tree));

    // Apply saved theme settings on every page
    this.loadAndApplyThemeSettings();

    // Initialize theme settings UI on System page
    document.addEventListener("DOMContentLoaded", () => {
      this.initThemeSettings();
    });

    // Also try after a delay in case DOMContentLoaded already fired
    setTimeout(() => this.initThemeSettings(), 100);

    // Listen for settings sync from UCI
    window.addEventListener("proton-settings-synced", () => {
      this.loadAndApplyThemeSettings();
      // Re-init settings UI if on settings page
      this._themeSettingsInit = false;
      this.initThemeSettings();
    });

    // Re-apply zoom and page width on resize (desktop only — mobile ↔ desktop transition)
    let _resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(() => {
        // На мобильных resize часто вызывается скрытием/показом адресной строки —
        // пропускаем, чтобы не дёргать layout и не сбивать скролл
        if (window.innerWidth < 800) return;
        const z = localStorage.getItem("proton-zoom") || "100";
        this.applyZoom(z);
        const pw = parseInt(localStorage.getItem("proton-page-width")) || 0;
        this.applyPageWidth(pw);
      }, 200);
    });
  },

  loadAndApplyThemeSettings() {
    const defaultZoom = "100";
    const settings = {
      themeMode: localStorage.getItem("proton-theme-mode") || "dark",
      accentColor: localStorage.getItem("proton-accent-color") || "blue",
      borderRadius: localStorage.getItem("proton-border-radius") || "default",
      zoom: localStorage.getItem("proton-zoom") || defaultZoom,
      pageWidth: localStorage.getItem("proton-page-width") || "0",
      animations: localStorage.getItem("proton-animations") !== "false",
      transparency: localStorage.getItem("proton-transparency") !== "false",
      servicesWidget:
        localStorage.getItem("proton-services-widget-enabled") !== "false",
      temperatureWidget:
        localStorage.getItem("proton-temp-widget-enabled") !== "false",
      servicesLog: localStorage.getItem("proton-services-log") === "true",
      tableWrap: localStorage.getItem("proton-table-wrap") !== "false",
      logHighlight: localStorage.getItem("proton-log-highlight") !== "false",
      customFont: localStorage.getItem("proton-custom-font") !== "false",
    };

    // Apply theme mode
    document.documentElement.setAttribute("data-theme", settings.themeMode);

    this.applyThemeSettings(settings);
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
          if (text && text.length >= 10) {
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

    // Обновляем индикаторы сигнала
    this.updateSignalIndicators();
  },

  /**
   * Обновляет индикаторы сигнала в таблице Associated Stations.
   * Устанавливает data-signal атрибут и CSS переменные для визуализации.
   */
  updateSignalIndicators() {
    // Ищем все ifacebadge которые содержат dBm значения
    const badges = document.querySelectorAll(
      "table.assoclist .ifacebadge, #wifi_assoclist_table .ifacebadge",
    );

    badges.forEach((badge) => {
      const text = (badge.innerText || badge.textContent || "").trim();

      // Ищем паттерн dBm: -XX dBm или просто -XX
      const match = text.match(/(-\d+)\s*(?:dBm|дБм)?/i);
      if (!match) return;

      const signalValue = parseInt(match[1], 10);
      if (isNaN(signalValue)) return;

      // Устанавливаем data-signal атрибут
      badge.setAttribute("data-signal", signalValue.toString());

      // Добавляем CSS класс для стилизации
      badge.classList.add("proton-signal-badge");

      // Устанавливаем CSS переменные напрямую для надёжности
      let strength, color;

      if (signalValue >= -50) {
        // Отличный сигнал
        strength = "100%";
        color = "#4caf50";
      } else if (signalValue >= -60) {
        // Хороший сигнал
        strength = "80%";
        color = "#8bc34a";
      } else if (signalValue >= -70) {
        // Средний сигнал
        strength = "60%";
        color = "#ffc107";
      } else if (signalValue >= -80) {
        // Плохой сигнал
        strength = "40%";
        color = "#ff9800";
      } else {
        // Очень плохой сигнал
        strength = "20%";
        color = "#f44336";
      }

      badge.style.setProperty("--signal-strength", strength);
      badge.style.setProperty("--signal-color", color);

      // Добавляем класс на родительскую ячейку td для CSS селекторов
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
    this._assoclistTitleObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    scheduleUpdate();
  },

  ensureMenuPlacement(isMobile) {
    const menubar = document.querySelector("#menubar");
    const menubarInner = document.querySelector("#menubar-inner") || menubar;
    const mainmenu = document.querySelector("#mainmenu");
    if (!menubar || !mainmenu) return;

    if (isMobile) {
      // On some browsers, position:fixed inside backdrop-filter'ed header may
      // behave like position:absolute and get clipped to header height.
      // Move #mainmenu out of #menubar for mobile slide-out panel.
      if (menubar.contains(mainmenu)) {
        menubar.insertAdjacentElement("afterend", mainmenu);
      }
    } else {
      // Keep #mainmenu inside the header on desktop (top navigation)
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

  render(tree) {
    let node = tree;
    let url = "";

    const mq = window.matchMedia("(max-width: 800px)");
    this.ensureMenuPlacement(mq.matches);
    if (typeof mq.addEventListener === "function")
      mq.addEventListener("change", (ev) =>
        this.ensureMenuPlacement(ev.matches),
      );
    else if (typeof mq.addListener === "function")
      mq.addListener((ev) => this.ensureMenuPlacement(ev.matches));

    // Добавляем кнопку закрытия в мобильное меню
    if (mq.matches) {
      this.addMobileMenuCloseButton();
    }

    this.renderModeMenu(node);

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

    // LuCI is SPA-like: views update the DOM after initial load.
    // Add hover-to-reveal titles for assoclist (Associated Stations).
    this.installAssoclistTitleObserver();

    // Setup mobile table data-title attributes
    this.setupMobileTableTitles();

    // Setup wireless actions dropdown menu (⋮) for desktop
    this.setupWirelessActionsDropdown();

    // Setup network interface actions dropdown menu (⋮) for desktop
    this.setupNetworkInterfaceActionsDropdown();

    // Setup network devices actions dropdown menu (⋮) for desktop
    this.setupDevicesActionsDropdown();

    // Global handler for all dropdowns - close on outside click
    this.setupGlobalDropdownHandlers();
  },

  /**
   * Global dropdown handlers (click outside & Escape)
   * Shared by WiFi, Interfaces, and Devices dropdowns
   */
  setupGlobalDropdownHandlers() {
    // Prevent duplicate initialization
    if (this._globalDropdownHandlersInit) return;
    this._globalDropdownHandlersInit = true;

    // Close all dropdowns on outside click
    document.addEventListener("click", (ev) => {
      if (
        !ev.target.closest(".actions-dropdown") &&
        !ev.target.closest(".actions-toggle")
      ) {
        document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
          d.classList.remove("open");
        });
      }
    });

    // Close all dropdowns on Escape key
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
          d.classList.remove("open");
        });
      }
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

    // On desktop with mouse/hover, do not toggle persistent dropdown state.
    // Rely on CSS :hover to show submenus. This avoids "frozen" dropdowns and
    // prevents multiple submenus from being open at the same time.
    if (!isMobile && !isTouchLike) {
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

    // Close other open dropdowns
    document.querySelectorAll("ul.mainmenu.l1 > li.active").forEach((item) => {
      if (item !== li) item.classList.remove("active");
    });

    if (!ul2) {
      // No submenu - allow normal navigation
      // On mobile, close the sidebar after click
      if (isMobile) {
        this.closeMobileMenu();
      }
      return;
    }

    // Toggle submenu
    if (li.classList.contains("active")) {
      li.classList.remove("active");
      ul1.classList.remove("active");
      a.blur();
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }

    if (
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

      // Для родительских пунктов (l == 1) ссылка ведёт на первый дочерний элемент
      const childChildren = ui.menu.getChildren(child);
      let menuHref;
      if (l == 1 && childChildren.length > 0) {
        // Ссылка на первый дочерний элемент
        menuHref = L.url(url, child.name, childChildren[0].name);
      } else {
        // Обычная ссылка на сам пункт
        menuHref = L.url(url, child.name);
      }

      ul.appendChild(
        E("li", { class: activeClass }, [
          E(
            "a",
            {
              href: menuHref,
              click: l == 1 ? ui.createHandlerFn(this, "handleMenuExpand") : "",
            },
            [_(child.title)],
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
  },

  addMobileMenuCloseButton() {
    const mainmenu = document.querySelector("#mainmenu");
    if (!mainmenu) return;

    // Проверяем, не добавлена ли уже кнопка
    if (mainmenu.querySelector(".menu-close")) return;

    const closeBtn = document.createElement("button");
    closeBtn.className = "menu-close";
    closeBtn.innerHTML = "✕";
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.addEventListener("click", () => {
      this.closeMobileMenu();
    });

    mainmenu.insertBefore(closeBtn, mainmenu.firstChild);
  },

  setupMobileTableTitles() {
    const updateTitles = () => {
      if (window.innerWidth > 800) return;

      document.querySelectorAll("table").forEach((table) => {
        // Skip tables that are already processed or empty
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

    // Run initially
    updateTitles();

    // Run on window resize
    window.addEventListener("resize", updateTitles);

    // Run on DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      setTimeout(updateTitles, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },

  /**
   * WiFi frequency detection based on real data from radio rows
   * Adds data-freq attribute to wifinet rows for CSS styling
   * Works with any device names: radio0, MT7981_1_1, ath0, wl0, etc.
   */
  markWifiFrequencies() {
    const wirelessTable = document.querySelector("#cbi-wireless");
    if (!wirelessTable) return;

    // Map to store radio frequencies: "radio0" -> "2.4", "MT7981_1_1" -> "5", etc.
    const radioFreqMap = new Map();

    // Step 1: Parse radio device rows (marked by data-radio-device attribute from header.ut)
    const radioRows = wirelessTable.querySelectorAll("tr[data-radio-device]");
    radioRows.forEach((row) => {
      const radioId = row.getAttribute("data-radio-device"); // e.g., "radio0" or "MT7981_1_1"
      const text = row.textContent || "";

      // Detect frequency from text content
      // 2.4 GHz: "2.412 GHz", "2.437 ГГц", "Channel 1 (2412 MHz)", etc.
      // 5 GHz: "5.180 GHz", "5.745 ГГц", "Channel 36 (5180 MHz)", etc.
      // 6 GHz: "6.xxx GHz", etc.

      let freq = null;
      if (
        /\b2[.,]\d{3}\s*(ГГц|GHz|MHz)/i.test(text) ||
        /\b24[0-4]\d\s*MHz/i.test(text)
      ) {
        freq = "2.4";
      } else if (
        /\b5[.,]\d{3}\s*(ГГц|GHz|MHz)/i.test(text) ||
        /\b5[0-9]{3}\s*MHz/i.test(text)
      ) {
        freq = "5";
      } else if (
        /\b6[.,]\d{3}\s*(ГГц|GHz|MHz)/i.test(text) ||
        /\b6[0-9]{3}\s*MHz/i.test(text)
      ) {
        freq = "6";
      }

      if (freq && radioId) {
        radioFreqMap.set(radioId, freq);
        row.setAttribute("data-freq", freq);
      }
    });

    // Step 2: Assign frequencies to WiFi network rows (those without data-radio-device)
    const wifinetRows = wirelessTable.querySelectorAll(
      "tr[data-section-id]:not([data-radio-device])",
    );
    wifinetRows.forEach((row) => {
      // Skip if already processed
      if (row.hasAttribute("data-freq")) return;

      // Find parent radio by looking at preceding rows
      let currentRow = row.previousElementSibling;
      let parentRadio = null;

      while (currentRow) {
        const radioDevice = currentRow.getAttribute("data-radio-device");
        if (radioDevice) {
          parentRadio = radioDevice;
          break;
        }
        currentRow = currentRow.previousElementSibling;
      }

      // Fallback: check badge text for device name reference
      if (!parentRadio) {
        const deviceCell = row.querySelector('[data-name="_badge"]');
        if (deviceCell) {
          const badgeText = deviceCell.textContent || "";
          // Look for any known wireless device name in the badge
          if (window._protonWirelessDevices) {
            for (const devName of window._protonWirelessDevices) {
              if (badgeText.indexOf(devName) !== -1) {
                parentRadio = devName;
                break;
              }
            }
          }
        }
      }

      // Apply frequency from parent radio
      if (parentRadio && radioFreqMap.has(parentRadio)) {
        row.setAttribute("data-freq", radioFreqMap.get(parentRadio));
      }
    });
  },

  /**
   * Wireless actions dropdown menu (⋮)
   * Converts action buttons in #cbi-wireless into a compact dropdown
   */
  setupWirelessActionsDropdown() {
    // Prevent duplicate initialization
    if (this._wirelessDropdownInit) return;
    this._wirelessDropdownInit = true;

    const installDropdowns = () => {
      const wirelessSection = document.querySelector("#cbi-wireless");
      if (!wirelessSection) return;

      // Find all action cells in wireless table
      const actionCells = wirelessSection.querySelectorAll(
        "td.cbi-section-actions",
      );

      actionCells.forEach((cell) => {
        // Skip if already processed
        if (cell.classList.contains("actions-dropdown-ready")) return;

        // Buttons are inside a div wrapper
        const wrapper = cell.querySelector("div");
        if (!wrapper) return;

        const buttons = Array.from(
          wrapper.querySelectorAll("button, input[type='button'], .cbi-button"),
        );
        if (buttons.length === 0) return;

        // Create toggle button (⋮)
        const toggle = document.createElement("button");
        toggle.className = "actions-toggle";
        toggle.innerHTML = "⋮";
        toggle.setAttribute("aria-label", "Actions menu");
        toggle.setAttribute("type", "button");

        // Create dropdown container
        const dropdown = document.createElement("div");
        dropdown.className = "actions-dropdown";

        // MOVE original buttons into dropdown (not clone!) to preserve event handlers
        buttons.forEach((btn) => {
          dropdown.appendChild(btn);
        });

        // Hide original empty wrapper
        wrapper.style.display = "none";

        // Toggle dropdown on click
        toggle.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();

          // Close other open dropdowns
          document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
            if (d !== dropdown) d.classList.remove("open");
          });

          dropdown.classList.toggle("open");
        });

        // Close dropdown after button click
        dropdown.addEventListener("click", (ev) => {
          if (ev.target.matches("button, input[type='button'], .cbi-button")) {
            setTimeout(() => {
              dropdown.classList.remove("open");
            }, 100);
          }
        });

        cell.appendChild(toggle);
        cell.appendChild(dropdown);
        cell.classList.add("actions-dropdown-ready");
      });
    };

    // Run initially with delay for LuCI to render
    setTimeout(installDropdowns, 300);

    // Run on window resize
    window.addEventListener("resize", installDropdowns);

    // Run on DOM changes (for dynamic content like LuCI updates)
    const observer = new MutationObserver(() => {
      setTimeout(installDropdowns, 150);
      // Also update WiFi frequencies when table changes
      this.markWifiFrequencies();
    });

    const wirelessContainer =
      document.querySelector("#cbi-wireless") || document.body;
    observer.observe(wirelessContainer, {
      childList: true,
      subtree: true,
    });

    // Initial frequency marking
    setTimeout(() => this.markWifiFrequencies(), 350);
  },

  /**
   * Network interface actions dropdown menu (⋮)
   * Converts action buttons in #cbi-network-interface into a compact dropdown
   */
  setupNetworkInterfaceActionsDropdown() {
    // Prevent duplicate initialization
    if (this._interfaceDropdownInit) return;
    this._interfaceDropdownInit = true;

    const installDropdowns = () => {
      const networkSection = document.querySelector("#cbi-network-interface");
      if (!networkSection) return;

      // Find all action cells in network interface table
      const actionCells = networkSection.querySelectorAll(
        "table.cbi-section-table td.cbi-section-actions",
      );

      actionCells.forEach((cell) => {
        // Skip if already processed
        if (cell.classList.contains("actions-dropdown-ready")) return;

        // Buttons are inside a div wrapper
        const wrapper = cell.querySelector("div");
        if (!wrapper) return;

        const buttons = Array.from(
          wrapper.querySelectorAll("button, input[type='button'], .cbi-button"),
        );
        if (buttons.length === 0) return;

        // Create toggle button (⋮)
        const toggle = document.createElement("button");
        toggle.className = "actions-toggle";
        toggle.innerHTML = "⋮";
        toggle.setAttribute("aria-label", "Actions menu");
        toggle.setAttribute("type", "button");

        // Create dropdown container
        const dropdown = document.createElement("div");
        dropdown.className = "actions-dropdown";

        // MOVE original buttons into dropdown (not clone!) to preserve event handlers
        buttons.forEach((btn) => {
          dropdown.appendChild(btn);
        });

        // Hide original empty wrapper
        wrapper.style.display = "none";

        // Toggle dropdown on click
        toggle.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();

          // Close other open dropdowns
          document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
            if (d !== dropdown) d.classList.remove("open");
          });

          dropdown.classList.toggle("open");
        });

        // Close dropdown after button click
        dropdown.addEventListener("click", (ev) => {
          if (ev.target.matches("button, input[type='button'], .cbi-button")) {
            setTimeout(() => {
              dropdown.classList.remove("open");
            }, 100);
          }
        });

        cell.appendChild(toggle);
        cell.appendChild(dropdown);
        cell.classList.add("actions-dropdown-ready");
      });
    };

    // Run initially with delay for LuCI to render
    setTimeout(installDropdowns, 300);

    // Run on window resize
    window.addEventListener("resize", installDropdowns);

    // Run on DOM changes (for dynamic content like LuCI updates)
    const observer = new MutationObserver(() => {
      setTimeout(installDropdowns, 150);
    });

    const networkContainer =
      document.querySelector("#cbi-network-interface") || document.body;
    observer.observe(networkContainer, {
      childList: true,
      subtree: true,
    });
  },

  /**
   * Network devices actions dropdown menu (⋮)
   * Converts action buttons in #cbi-network-device into a compact dropdown
   * Only for desktop (width >= 800px)
   */
  setupDevicesActionsDropdown() {
    // Prevent duplicate initialization
    if (this._devicesDropdownInit) return;
    this._devicesDropdownInit = true;

    const installDropdowns = () => {
      // Only for desktop
      if (window.innerWidth < 800) return;

      const devicesSection = document.querySelector("#cbi-network-device");
      if (!devicesSection) return;

      // Find all action cells in network devices table
      const actionCells = devicesSection.querySelectorAll(
        "td.cbi-section-actions",
      );

      actionCells.forEach((cell) => {
        // Skip if already processed
        if (cell.classList.contains("actions-dropdown-ready")) return;

        // Try to find buttons directly or inside a div wrapper
        let buttons = Array.from(
          cell.querySelectorAll("button, input[type='button'], .cbi-button"),
        );

        // Filter out already created toggle buttons
        buttons = buttons.filter(
          (btn) => !btn.classList.contains("actions-toggle"),
        );

        if (buttons.length === 0) return;

        // Find or create wrapper
        let wrapper = cell.querySelector("div");
        if (!wrapper) {
          wrapper = document.createElement("div");
          buttons.forEach((btn) => wrapper.appendChild(btn));
          cell.insertBefore(wrapper, cell.firstChild);
        }

        // Create toggle button (⋮)
        const toggle = document.createElement("button");
        toggle.className = "actions-toggle";
        toggle.innerHTML = "⋮";
        toggle.setAttribute("aria-label", "Actions menu");
        toggle.setAttribute("type", "button");

        // Create dropdown container
        const dropdown = document.createElement("div");
        dropdown.className = "actions-dropdown";

        // MOVE original buttons into dropdown (not clone!) to preserve event handlers
        buttons.forEach((btn) => {
          dropdown.appendChild(btn);
        });

        // Hide original empty wrapper
        wrapper.style.display = "none";

        // Toggle dropdown on click
        toggle.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();

          // Close other open dropdowns
          document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
            if (d !== dropdown) d.classList.remove("open");
          });

          dropdown.classList.toggle("open");
        });

        // Close dropdown after button click
        dropdown.addEventListener("click", (ev) => {
          if (ev.target.matches("button, input[type='button'], .cbi-button")) {
            setTimeout(() => {
              dropdown.classList.remove("open");
            }, 100);
          }
        });

        cell.appendChild(toggle);
        cell.appendChild(dropdown);
        cell.classList.add("actions-dropdown-ready");
      });
    };

    // Run initially with delay for LuCI to render
    setTimeout(installDropdowns, 300);
    setTimeout(installDropdowns, 600); // Additional attempt after longer delay
    setTimeout(installDropdowns, 1000); // Final attempt for slow-loading content

    // Run on window resize
    window.addEventListener("resize", installDropdowns);

    // Run on DOM changes (for dynamic content like LuCI updates)
    const observer = new MutationObserver(() => {
      setTimeout(installDropdowns, 150);
    });

    const devicesContainer =
      document.querySelector("#cbi-network-device") || document.body;
    observer.observe(devicesContainer, {
      childList: true,
      subtree: true,
    });

    // Watch for tab activation
    const tabObserver = new MutationObserver(() => {
      const devicesSection = document.querySelector("#cbi-network-device");
      if (devicesSection && devicesSection.dataset.tabActive === "true") {
        setTimeout(installDropdowns, 200);
      }
    });

    const cbiNetwork = document.querySelector("#cbi-network");
    if (cbiNetwork) {
      tabObserver.observe(cbiNetwork, {
        attributes: true,
        attributeFilter: ["data-tab-active"],
        subtree: true,
      });
    }
  },

  initThemeSettings() {
    // Only run on System settings page
    if (!document.body.dataset.page?.includes("admin-system-system")) return;

    // Ensure we attach only once per page
    if (this._themeSettingsInit) return;
    this._themeSettingsInit = true;

    const tryMount = () => {
      if (document.getElementById("proton-theme-settings")) return true;
      const designField = document.querySelector('[data-name="_mediaurlbase"]');
      if (!designField) return false;

      // Get the parent container
      const parentContainer = designField.closest(".cbi-section-node");
      if (!parentContainer) return false;

      // Load saved settings
      const defaultZoom = "100";
      const settings = {
        themeMode: localStorage.getItem("proton-theme-mode") || "dark",
        accentColor: localStorage.getItem("proton-accent-color") || "blue",
        borderRadius: localStorage.getItem("proton-border-radius") || "default",
        zoom: parseInt(localStorage.getItem("proton-zoom") || defaultZoom),
        pageWidth: parseInt(localStorage.getItem("proton-page-width") || "0"),
        animations: localStorage.getItem("proton-animations") !== "false",
        transparency: localStorage.getItem("proton-transparency") !== "false",
        servicesWidget:
          localStorage.getItem("proton-services-widget-enabled") !== "false",
        temperatureWidget:
          localStorage.getItem("proton-temp-widget-enabled") !== "false",
        servicesLog: localStorage.getItem("proton-services-log") === "true",
        tableWrap: localStorage.getItem("proton-table-wrap") !== "false",
        logHighlight: localStorage.getItem("proton-log-highlight") !== "false",
        customFont: localStorage.getItem("proton-custom-font") !== "false",
      };

      // Helper function for translations
      const t = (key) => (window.protonT ? window.protonT(key) : key);

      // Create theme settings HTML
      const settingsHTML = `
        <div id="proton-theme-settings" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
          <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; font-weight: 600; color: var(--proton-accent); opacity: 0.9;">${t(
            "Proton2025 Theme Settings",
          )}</h4>
          
          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-mode-select">${t(
              "Theme Mode",
            )}</label>
            <div class="cbi-value-field">
              <select id="proton-mode-select" class="cbi-input-select">
                <option value="dark" ${
                  settings.themeMode === "dark" ? "selected" : ""
                }>${t("Dark")} (${t("Default")})</option>
                <option value="light" ${
                  settings.themeMode === "light" ? "selected" : ""
                }>${t("Light")}</option>
              </select>
              <div class="cbi-value-description">${t(
                "Choose light or dark theme",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-accent-select">${t(
              "Accent Color",
            )}</label>
            <div class="cbi-value-field">
              <select id="proton-accent-select" class="cbi-input-select">
                <option value="default" ${
                  settings.accentColor === "default" ? "selected" : ""
                }>${t("Neutral")}</option>
                <option value="blue" ${
                  settings.accentColor === "blue" ? "selected" : ""
                }>${t("Blue")} (${t("Default")})</option>
                <option value="purple" ${
                  settings.accentColor === "purple" ? "selected" : ""
                }>${t("Purple")}</option>
                <option value="green" ${
                  settings.accentColor === "green" ? "selected" : ""
                }>${t("Green")}</option>
                <option value="orange" ${
                  settings.accentColor === "orange" ? "selected" : ""
                }>${t("Orange")}</option>
                <option value="red" ${
                  settings.accentColor === "red" ? "selected" : ""
                }>${t("Red")}</option>
              </select>
              <div class="cbi-value-description">${t(
                "Choose theme accent color",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-radius-select">${t(
              "Border Radius",
            )}</label>
            <div class="cbi-value-field">
              <select id="proton-radius-select" class="cbi-input-select">
                <option value="sharp" ${
                  settings.borderRadius === "sharp" ? "selected" : ""
                }>${t("Sharp")}</option>
                <option value="default" ${
                  settings.borderRadius === "default" ? "selected" : ""
                }>${t("Rounded")} (${t("Default")})</option>
                <option value="extra" ${
                  settings.borderRadius === "extra" ? "selected" : ""
                }>${t("Extra Rounded")}</option>
              </select>
              <div class="cbi-value-description">${t(
                "Corner rounding style",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-zoom-range">${t(
              "Zoom",
            )} <span id="proton-zoom-value">${settings.zoom}%</span></label>
            <div class="cbi-value-field">
              <div style="display: flex; align-items: center; gap: 12px;">
                <button type="button" id="proton-zoom-minus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">−</button>
                <input type="range" id="proton-zoom-range" min="75" max="150" step="5" value="${
                  settings.zoom
                }" style="flex: 1; accent-color: var(--proton-accent);">
                <button type="button" id="proton-zoom-plus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">+</button>
                <button type="button" id="proton-zoom-reset" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">${t(
                  "Reset",
                )}</button>
              </div>
              <div class="cbi-value-description">${t(
                "Interface scale",
              )} (75% - 150%)</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-page-width-check">${t(
              "Page Width",
            )} <span id="proton-page-width-value">${
              settings.pageWidth >= 100
                ? "100% (" + t("Full width") + ")"
                : settings.pageWidth > 0
                  ? settings.pageWidth + "%"
                  : ""
            }</span></label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox" style="margin-bottom: 8px;">
                <input id="proton-page-width-check" type="checkbox" ${
                  settings.pageWidth > 0 ? "checked" : ""
                }>
                <label for="proton-page-width-check"></label>
              </div>
              <div id="proton-page-width-slider" style="display: ${settings.pageWidth > 0 ? "flex" : "none"}; align-items: center; gap: 12px; margin-top: 8px;">
                <button type="button" id="proton-page-width-minus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">−</button>
                <input type="range" id="proton-page-width-range" min="50" max="100" step="5" value="${
                  settings.pageWidth > 0 ? settings.pageWidth : 75
                }" style="flex: 1; accent-color: var(--proton-accent);">
                <button type="button" id="proton-page-width-plus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">+</button>
              </div>
              <div class="cbi-value-description">${t(
                "Content area width",
              )} (50% - 100%)</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-animations-check">${t(
              "Animations",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-animations-check" type="checkbox" ${
                  settings.animations ? "checked" : ""
                }>
                <label for="proton-animations-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Enable smooth transitions and effects",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-transparency-check">${t(
              "Transparency",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-transparency-check" type="checkbox" ${
                  settings.transparency ? "checked" : ""
                }>
                <label for="proton-transparency-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Enable blur and transparency effects",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-services-widget-check">${t(
              "Services Widget",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-services-widget-check" type="checkbox" ${
                  settings.servicesWidget ? "checked" : ""
                }>
                <label for="proton-services-widget-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Show services monitor on Overview page",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-temp-widget-check">${t(
              "Temperature Widget",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-temp-widget-check" type="checkbox" ${
                  settings.temperatureWidget ? "checked" : ""
                }>
                <label for="proton-temp-widget-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Show temperature monitor on Overview page",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-services-log-check">${t(
              "Widget Log",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-services-log-check" type="checkbox" ${
                  settings.servicesLog ? "checked" : ""
                }>
                <label for="proton-services-log-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Show activity log under the widget",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-table-wrap-check">${t(
              "Table Text Wrap",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-table-wrap-check" type="checkbox" ${
                  settings.tableWrap ? "checked" : ""
                }>
                <label for="proton-table-wrap-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Wrap long AP names in Associated Stations table. Disable to truncate with ellipsis.",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-log-highlight-check">${t(
              "Log Highlighting",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-log-highlight-check" type="checkbox" ${
                  settings.logHighlight ? "checked" : ""
                }>
                <label for="proton-log-highlight-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-custom-font-check">${t(
              "Custom Font (Inter)",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-custom-font-check" type="checkbox" ${
                  settings.customFont ? "checked" : ""
                }>
                <label for="proton-custom-font-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.",
              )}</div>
            </div>
          </div>
        </div>
      `;

      // Backup & Restore section - отдельный блок
      const backupHTML = `
        <div id="proton-backup-restore" class="proton-backup-section" style="margin-top: 1.5rem; padding: 1.5rem; background: var(--proton-bg-card); border: 1px solid var(--proton-border); border-radius: var(--proton-radius); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 1.25rem;">
              <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: var(--proton-accent);">${t(
                "Backup & Restore",
              )}</h4>
              <div class="cbi-value-description" style="opacity: 0.7;">${t(
                "Export your theme settings to a file or import from a previously saved backup.",
              )}</div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <button type="button" id="proton-export-settings" class="cbi-button cbi-button-action proton-backup-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="proton-backup-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${t(
                  "Export Settings",
                )}
              </button>
              <button type="button" id="proton-import-settings" class="cbi-button proton-backup-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="proton-backup-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>${t(
                  "Import Settings",
                )}
              </button>
              <button type="button" id="proton-reset-settings" class="cbi-button cbi-button-negative proton-backup-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="proton-backup-icon"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>${t(
                  "Reset to Defaults",
                )}
              </button>
              <input type="file" id="proton-import-file" accept=".json" style="display: none;">
            </div>
          </div>
        </div>
      `;

      // Insert after the design field
      designField.insertAdjacentHTML("afterend", settingsHTML);

      // Insert backup section after settings
      const settingsBlock = document.getElementById("proton-theme-settings");
      if (settingsBlock) {
        settingsBlock.insertAdjacentHTML("afterend", backupHTML);
      }

      // Apply current settings
      this.applyThemeSettings(settings);

      // Add event listeners
      const modeSelect = document.getElementById("proton-mode-select");
      const accentSelect = document.getElementById("proton-accent-select");
      const radiusSelect = document.getElementById("proton-radius-select");
      const fontsizeSelect = document.getElementById("proton-fontsize-select");
      const animationsCheck = document.getElementById(
        "proton-animations-check",
      );
      const transparencyCheck = document.getElementById(
        "proton-transparency-check",
      );

      modeSelect?.addEventListener("change", (e) => {
        const mode = e.target.value;
        localStorage.setItem("proton-theme-mode", mode);
        document.documentElement.setAttribute("data-theme", mode);
      });

      accentSelect?.addEventListener("change", (e) => {
        const color = e.target.value;
        localStorage.setItem("proton-accent-color", color);
        this.applyAccentColor(color);
      });

      radiusSelect?.addEventListener("change", (e) => {
        const radius = e.target.value;
        localStorage.setItem("proton-border-radius", radius);
        this.applyBorderRadius(radius);
      });

      const zoomRange = document.getElementById("proton-zoom-range");
      const zoomValue = document.getElementById("proton-zoom-value");
      const zoomMinus = document.getElementById("proton-zoom-minus");
      const zoomPlus = document.getElementById("proton-zoom-plus");
      const zoomReset = document.getElementById("proton-zoom-reset");

      // Update slider fill (progress indicator)
      const updateSliderFill = (slider) => {
        if (!slider) return;
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value) || 0;
        const percent = ((val - min) / (max - min)) * 100;
        const isLight =
          document.documentElement.getAttribute("data-theme") === "light";
        const fillColor = getComputedStyle(document.documentElement)
          .getPropertyValue("--proton-accent")
          .trim();
        const trackColor = isLight
          ? "rgba(0,0,0,0.12)"
          : "rgba(255,255,255,0.05)";
        slider.style.background = `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percent}%, ${trackColor} ${percent}%, ${trackColor} 100%)`;
      };

      // Initial fill update
      if (zoomRange) updateSliderFill(zoomRange);

      const updateZoom = (displayValue) => {
        displayValue = Math.max(75, Math.min(150, parseInt(displayValue)));
        zoomRange.value = displayValue;
        zoomValue.textContent = displayValue + "%";
        localStorage.setItem("proton-zoom", displayValue);
        this.applyZoom(displayValue);
        updateSliderFill(zoomRange);

        // Trigger sync to UCI
        window.dispatchEvent(
          new CustomEvent("proton-setting-changed", {
            detail: { key: "proton-zoom", value: displayValue },
          }),
        );
      };

      zoomRange?.addEventListener("input", (e) => updateZoom(e.target.value));
      zoomMinus?.addEventListener("click", () =>
        updateZoom(parseInt(zoomRange.value) - 5),
      );
      zoomPlus?.addEventListener("click", () =>
        updateZoom(parseInt(zoomRange.value) + 5),
      );
      zoomReset?.addEventListener("click", () => updateZoom(100));

      // Page width: checkbox + slider
      const pageWidthCheck = document.getElementById("proton-page-width-check");
      const pageWidthSlider = document.getElementById(
        "proton-page-width-slider",
      );
      const pageWidthRange = document.getElementById("proton-page-width-range");
      const pageWidthValue = document.getElementById("proton-page-width-value");
      const pageWidthMinus = document.getElementById("proton-page-width-minus");
      const pageWidthPlus = document.getElementById("proton-page-width-plus");

      if (pageWidthRange) updateSliderFill(pageWidthRange);

      const updatePageWidth = (val) => {
        val = Math.max(50, Math.min(100, parseInt(val)));
        pageWidthRange.value = val;
        pageWidthValue.textContent =
          val >= 100 ? "100% (" + t("Full width") + ")" : val + "%";
        localStorage.setItem("proton-page-width", val);
        this.applyPageWidth(val);
        updateSliderFill(pageWidthRange);
      };

      pageWidthCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        if (pageWidthSlider)
          pageWidthSlider.style.display = enabled ? "flex" : "none";
        if (enabled) {
          const val = parseInt(pageWidthRange?.value) || 75;
          updatePageWidth(val);
        } else {
          pageWidthValue.textContent = "";
          localStorage.setItem("proton-page-width", "0");
          this.applyPageWidth(0);
        }
      });

      pageWidthRange?.addEventListener("input", (e) =>
        updatePageWidth(e.target.value),
      );
      pageWidthMinus?.addEventListener("click", () =>
        updatePageWidth(parseInt(pageWidthRange.value) - 5),
      );
      pageWidthPlus?.addEventListener("click", () =>
        updatePageWidth(parseInt(pageWidthRange.value) + 5),
      );

      animationsCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("proton-animations", enabled);
        this.applyAnimations(enabled);
      });

      transparencyCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("proton-transparency", enabled);
        this.applyTransparency(enabled);
      });

      const servicesWidgetCheck = document.getElementById(
        "proton-services-widget-check",
      );
      servicesWidgetCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("proton-services-widget-enabled", enabled);
        // Показываем уведомление о применении
        const msg = enabled
          ? _("Services widget enabled. Visit Status → Overview to see it.")
          : _("Services widget disabled.");
        if (typeof L !== "undefined" && L.ui && L.ui.addNotification) {
          L.ui.addNotification(null, E("p", msg), "info");
        } else {
          alert(msg);
        }
      });

      const tempWidgetCheck = document.getElementById(
        "proton-temp-widget-check",
      );
      tempWidgetCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("proton-temp-widget-enabled", enabled);
        // Показываем уведомление о применении
        const msg = enabled
          ? _("Temperature widget enabled. Visit Status → Overview to see it.")
          : _("Temperature widget disabled.");
        if (typeof L !== "undefined" && L.ui && L.ui.addNotification) {
          L.ui.addNotification(null, E("p", msg), "info");
        } else {
          alert(msg);
        }
      });

      const servicesLogCheck = document.getElementById(
        "proton-services-log-check",
      );
      servicesLogCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("proton-services-log", enabled);
        // Сразу применяем - показываем/скрываем лог
        const logEl = document.getElementById("proton-services-log");
        if (logEl) {
          logEl.style.display = enabled ? "" : "none";
        }
      });

      const tableWrapCheck = document.getElementById("proton-table-wrap-check");
      tableWrapCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("proton-table-wrap", enabled);
        this.applyTableWrap(enabled);
      });

      const logHighlightCheck = document.getElementById(
        "proton-log-highlight-check",
      );
      logHighlightCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("proton-log-highlight", enabled);
      });

      const customFontCheck = document.getElementById(
        "proton-custom-font-check",
      );
      customFontCheck?.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("proton-custom-font", enabled);
        this.applyCustomFont(enabled);
      });

      // --- Backup & Restore ---
      const PROTON_SETTINGS_KEYS = [
        "proton-theme-mode",
        "proton-accent-color",
        "proton-border-radius",
        "proton-zoom",
        "proton-page-width",
        "proton-animations",
        "proton-transparency",
        "proton-services-widget-enabled",
        "proton-temp-widget-enabled",
        "proton-services-log",
        "proton-table-wrap",
        "proton-log-highlight",
        "proton-custom-font",
      ];

      const showBackupStatus = (msg, isError) => {
        if (typeof L !== "undefined" && L.ui && L.ui.addNotification) {
          L.ui.addNotification(null, E("p", msg), isError ? "danger" : "info");
        } else {
          alert(msg);
        }
      };

      // Export
      document
        .getElementById("proton-export-settings")
        ?.addEventListener("click", () => {
          const now = new Date();
          const data = {
            _proton_backup: true,
            _version: "1.1.0",
            _date: now.toISOString(),
          };
          PROTON_SETTINGS_KEYS.forEach((key) => {
            const val = localStorage.getItem(key);
            if (val !== null) data[key] = val;
          });
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          // Генерируем имя файла с датой и временем
          const dateStr =
            now.getFullYear() +
            "-" +
            String(now.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(now.getDate()).padStart(2, "0") +
            "_" +
            String(now.getHours()).padStart(2, "0") +
            "-" +
            String(now.getMinutes()).padStart(2, "0") +
            "-" +
            String(now.getSeconds()).padStart(2, "0");
          a.download = `proton2025-settings-backup-${dateStr}.json`;
          a.click();
          URL.revokeObjectURL(url);
          showBackupStatus(t("Settings exported successfully"), false);
        });

      // Reset to defaults
      document
        .getElementById("proton-reset-settings")
        ?.addEventListener("click", async () => {
          if (
            !confirm(
              t(
                "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.",
              ),
            )
          ) {
            return;
          }

          if (window.protonSettingsSync?.resetToDefaults) {
            await window.protonSettingsSync.resetToDefaults();
          } else {
            // Fallback if sync module not loaded
            const defaults = {
              "proton-theme-mode": "dark",
              "proton-accent-color": "blue",
              "proton-zoom": "100",
              "proton-transparency": "true",
              "proton-border-radius": "default",
              "proton-animations": "true",
              "proton-services-widget-enabled": "true",
              "proton-temp-widget-enabled": "true",
              "proton-services-log": "false",
              "proton-table-wrap": "false",
              "proton-log-highlight": "true",
              "proton-page-width": "",
              "proton-custom-font": "true",
            };

            Object.keys(defaults).forEach((key) => {
              localStorage.removeItem(key);
            });

            Object.entries(defaults).forEach(([key, value]) => {
              if (value) {
                localStorage.setItem(key, value);
              }
            });

            window.location.reload();
          }
        });

      // Import
      const importFileInput = document.getElementById("proton-import-file");
      document
        .getElementById("proton-import-settings")
        ?.addEventListener("click", () => {
          importFileInput?.click();
        });

      importFileInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (!data._proton_backup) {
              showBackupStatus(t("Invalid backup file"), true);
              return;
            }

            let imported = 0;
            PROTON_SETTINGS_KEYS.forEach((key) => {
              if (key in data) {
                localStorage.setItem(key, data[key]);
                imported++;
              }
            });

            if (imported === 0) {
              showBackupStatus(t("No settings found in file"), true);
              return;
            }

            // Re-apply all settings
            this.loadAndApplyThemeSettings();

            // Re-init settings UI to reflect new values
            this._themeSettingsInit = false;
            const panel = document.getElementById("proton-theme-settings");
            if (panel) panel.remove();
            const backupSection = document.getElementById(
              "proton-backup-restore",
            );
            if (backupSection) backupSection.remove();
            this.initThemeSettings();

            showBackupStatus(
              t("Settings imported successfully") + " (" + imported + ")",
              false,
            );
          } catch (err) {
            showBackupStatus(t("Failed to read backup file"), true);
          }
        };
        reader.readAsText(file);
        // Reset input so the same file can be re-imported
        e.target.value = "";
      });

      return true;
    };

    // Fallbacks: immediate + delayed attempts + observer for dynamic LuCI renders
    const root = document.getElementById("maincontent") || document.body;
    const observer = new MutationObserver(() => {
      if (tryMount()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });

    // Immediate and delayed attempts
    tryMount();
    setTimeout(tryMount, 300);
    setTimeout(tryMount, 800);
  },

  applyThemeSettings(settings) {
    this.applyAccentColor(settings.accentColor);
    this.applyBorderRadius(settings.borderRadius);
    this.applyZoom(settings.zoom);
    this.applyPageWidth(settings.pageWidth);
    this.applyAnimations(settings.animations);
    this.applyTransparency(settings.transparency);
    this.applyTableWrap(settings.tableWrap);
    this.applyCustomFont(settings.customFont);
    this.applyServicesWidget(settings.servicesWidget);
    this.applyTemperatureWidget(settings.temperatureWidget);
    this.applyServicesLog(settings.servicesLog);
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

    const c = colors[color] || colors.default;
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

  applyZoom(zoom) {
    // На мобильных экранах не применяем zoom — конфликтует с viewport и pinch-to-zoom
    if (window.innerWidth < 800) {
      document.documentElement.style.zoom = "";
      return;
    }
    const scale = parseInt(zoom) / 100;
    // Use CSS zoom on html element for true browser-like scaling
    document.documentElement.style.zoom = scale;
  },

  applyPageWidth(width) {
    const val = parseInt(width) || 0;
    // На мобильных экранах не ограничиваем ширину — контент и так занимает 100%
    if (window.innerWidth < 800) {
      document.documentElement.style.setProperty(
        "--proton-page-max-width",
        "990px",
      );
      return;
    }
    if (val >= 50 && val <= 100) {
      document.documentElement.style.setProperty(
        "--proton-page-max-width",
        val + "%",
      );
    } else {
      document.documentElement.style.setProperty(
        "--proton-page-max-width",
        "990px",
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

  applyServicesWidget(enabled) {
    const widget = document.getElementById("proton-services-widget");
    if (widget) {
      widget.style.display = enabled ? "" : "none";
    }
    if (typeof window.updateWidgetsSectionVisibility === "function") {
      window.updateWidgetsSectionVisibility();
    }
  },

  applyTemperatureWidget(enabled) {
    const widget = document.querySelector(".proton-temp-widget");
    if (widget) {
      widget.style.display = enabled ? "" : "none";
    }
    if (typeof window.updateWidgetsSectionVisibility === "function") {
      window.updateWidgetsSectionVisibility();
    }
  },

  applyServicesLog(enabled) {
    const logEl = document.getElementById("proton-services-log");
    if (logEl) {
      logEl.style.display = enabled ? "" : "none";
    }
  },

  applyTableWrap(enabled) {
    const root = document.documentElement;
    if (enabled) {
      root.classList.remove("proton-table-truncate");
    } else {
      root.classList.add("proton-table-truncate");
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
});
