/**
 * Proton2025 - Overview Decorations
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 *
 * Нативные украшения темы для страницы Overview, не зависящие от подсистемы
 * виджетов (вынесенной в отдельный пакет luci-app-proton2025-dashboard):
 *   - визуализация Load Average в системной таблице;
 *   - бейдж архитектуры пакетов рядом со строкой архитектуры;
 *   - перенос кнопки обновления на странице анализа каналов.
 */

(function () {
  "use strict";

  function t(key) {
    if (window.protonT) {
      const translated = window.protonT(key);
      if (translated !== key) return translated;
    }
    if (window.L && L.tr) {
      const translated = L.tr(key);
      if (translated !== key) return translated;
    }
    return key;
  }

  const LOAD_AVERAGE_PATTERN = /^\s*\d+\.\d+[\s,]+\d+\.\d+[\s,]+\d+\.\d+\s*$/;
  const LOAD_AVERAGE_ROW_INDEX = 8;
  let loadAvgNode = null;
  let loadAvgRefs = [];

  let overviewSystemInfo = null;
  let overviewSystemInfoPromise = null;
  let overviewBoardInfo = null;
  let overviewBoardInfoPromise = null;
  let overviewSystemInfoUnavailable = false;
  let overviewArchitectureObserver = null;
  let overviewArchitectureInFlight = false;

  function normalizeOverviewText(text) {
    return String(text || "")
      .replace(/[:\s]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getOverviewSystemInfoMethod() {
    if (!(window.L && L.rpc)) return null;

    if (!getOverviewSystemInfoMethod._method) {
      getOverviewSystemInfoMethod._method = L.rpc.declare({
        object: "luci.proton-system",
        method: "getSystemInfo",
      });
    }

    return getOverviewSystemInfoMethod._method;
  }

  function getOverviewBoardInfoMethod() {
    if (!(window.L && L.rpc)) return null;

    if (!getOverviewBoardInfoMethod._method) {
      getOverviewBoardInfoMethod._method = L.rpc.declare({
        object: "system",
        method: "board",
      });
    }

    return getOverviewBoardInfoMethod._method;
  }

  async function fetchOverviewBoardInfo() {
    if (overviewBoardInfo) return overviewBoardInfo;
    if (overviewBoardInfoPromise) return overviewBoardInfoPromise;

    const method = getOverviewBoardInfoMethod();
    if (!method || !(window.L && L.resolveDefault)) return null;

    overviewBoardInfoPromise = (async () => {
      try {
        const result = await L.resolveDefault(method(), null);
        overviewBoardInfo = result && typeof result === "object" ? result : {};
        return overviewBoardInfo;
      } finally {
        overviewBoardInfoPromise = null;
      }
    })();

    return overviewBoardInfoPromise;
  }

  async function fetchOverviewSystemInfo() {
    if (overviewSystemInfoUnavailable) return null;
    if (overviewSystemInfo) return overviewSystemInfo;
    if (overviewSystemInfoPromise) return overviewSystemInfoPromise;

    const method = getOverviewSystemInfoMethod();
    if (!method || !(window.L && L.resolveDefault)) return null;

    overviewSystemInfoPromise = (async () => {
      try {
        const result = await L.resolveDefault(method(), null);
        overviewSystemInfo = result && typeof result === "object" ? result : {};
        return overviewSystemInfo;
      } catch (e) {
        overviewSystemInfoUnavailable = true;
        return null;
      } finally {
        overviewSystemInfoPromise = null;
      }
    })();

    return overviewSystemInfoPromise;
  }

  function findArchitectureRow(table, boardInfo) {
    const rows = Array.from(table.querySelectorAll("tr"));
    const architectureValue = normalizeOverviewText(
      boardInfo && boardInfo.system,
    );

    if (!architectureValue) return null;

    for (let index = 0; index < rows.length; index++) {
      const secondCell = rows[index].querySelector("td:last-child");
      if (!secondCell) continue;

      const value = normalizeOverviewText(secondCell.textContent);
      if (value === architectureValue || value.includes(architectureValue)) {
        return rows[index];
      }
    }

    return null;
  }

  async function enhancePackageArchitecture() {
    const table = getOverviewSystemTable();
    if (!table) return;

    const [systemInfo, boardInfo] = await Promise.all([
      fetchOverviewSystemInfo(),
      fetchOverviewBoardInfo(),
    ]);

    if (!systemInfo || !boardInfo) return;

    const row = findArchitectureRow(table, boardInfo);
    if (!row) return;

    const secondCell = row.querySelector("td:last-child");
    if (!secondCell || secondCell.querySelector(".proton-package-arch")) return;

    const packageArch =
      systemInfo && typeof systemInfo.package_arch === "string"
        ? systemInfo.package_arch.trim()
        : "";

    if (!packageArch) return;

    const currentText = secondCell.textContent.replace(/\s+/g, " ").trim();
    if (currentText.toLowerCase().includes(packageArch.toLowerCase())) return;

    const feedUrl =
      systemInfo && typeof systemInfo.package_feed_url === "string"
        ? systemInfo.package_feed_url.trim()
        : "";

    const badge = document.createElement(feedUrl ? "a" : "span");
    badge.className = "proton-package-arch";
    badge.textContent = packageArch;
    badge.title = feedUrl
      ? `${packageArch} - ${window.protonT ? window.protonT("Open package repository") : "Open package repository"}`
      : packageArch;

    if (feedUrl) {
      badge.href = feedUrl;
      badge.target = "_blank";
      badge.rel = "noopener noreferrer";
    }

    secondCell.appendChild(document.createTextNode(" "));
    secondCell.appendChild(badge);
  }

  function stopOverviewArchitectureObserver() {
    if (overviewArchitectureObserver) {
      overviewArchitectureObserver.disconnect();
      overviewArchitectureObserver = null;
    }
  }

  function initOverviewArchitectureEnhancement() {
    if (!isOverviewPage()) {
      stopOverviewArchitectureObserver();
      return;
    }

    if (overviewSystemInfoUnavailable) return;

    const tryEnhance = async () => {
      if (overviewArchitectureInFlight) return;
      overviewArchitectureInFlight = true;

      try {
        await enhancePackageArchitecture();

        if (overviewSystemInfoUnavailable || !isOverviewPage()) {
          stopOverviewArchitectureObserver();
        }
      } finally {
        overviewArchitectureInFlight = false;
      }
    };

    void tryEnhance();

    if (overviewArchitectureObserver || overviewSystemInfoUnavailable) return;

    const maincontent =
      document.getElementById("maincontent") || document.getElementById("view");
    if (!maincontent) return;

    overviewArchitectureObserver = new MutationObserver(() => {
      if (!isOverviewPage()) {
        stopOverviewArchitectureObserver();
        return;
      }

      if (document.querySelector(".proton-package-arch")) return;

      void tryEnhance();
    });

    overviewArchitectureObserver.observe(maincontent, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

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
    if (
      !isOverviewPage() &&
      document.body.dataset.page !== "admin-status-overview"
    ) {
      return null;
    }

    const isWidgetTable = (t) =>
      !!t.closest(
        "#proton-widgets-container, .proton-widgets-section, .p2d-root",
      );

    const mark = (t) => {
      t.classList.add("proton-system-table");
      return t;
    };

    const tables = Array.from(
      document.querySelectorAll("#view table.table, #maincontent table.table"),
    ).filter((t) => !isWidgetTable(t));

    const marked = tables.find((t) =>
      t.classList.contains("proton-system-table"),
    );
    if (marked) return marked;

    for (const t of tables) {
      const rows = t.querySelectorAll("tr");
      if (rows.length > LOAD_AVERAGE_ROW_INDEX) {
        const cell =
          rows[LOAD_AVERAGE_ROW_INDEX].querySelector("td:last-child");
        if (cell && LOAD_AVERAGE_PATTERN.test(cell.textContent.trim())) {
          return mark(t);
        }
      }
    }

    return tables.length ? mark(tables[0]) : null;
  }

  function enhanceLoadAverage() {
    const table = getOverviewSystemTable();

    if (!table) return;

    const rows = table.querySelectorAll("tr");

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

    const loadText = secondCell.textContent.trim();

    if (!LOAD_AVERAGE_PATTERN.test(loadText)) {
      console.warn(
        "[Proton2025] Load Average: строка 9 не содержит паттерн Load Average.",
        "Ожидалось: 'X.XX, X.XX, X.XX', получено:",
        loadText,
        "| Label:",
        firstCell.textContent.trim(),
      );
      return;
    }

    if (secondCell.querySelector(".proton-load-average")) return;

    row.classList.add("proton-load-row");

    const loadValues = loadText.split(/[,\s]+/).filter((v) => v);
    if (loadValues.length < 3) return;

    const loads = loadValues.slice(0, 3).map((v) => parseFloat(v));

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

    function getLoadLevel(load, cores) {
      const normalized = load / cores;
      if (normalized < 0.7) return "low";
      if (normalized < 1.2) return "medium";
      return "high";
    }

    function getBarWidth(load, cores) {
      return Math.min((load / (cores * 2)) * 100, 100);
    }

    if (loadAvgNode && loadAvgRefs.length === loads.length) {
      loadAvgRefs.forEach((ref, i) => {
        const level = getLoadLevel(loads[i], cpuCores);
        ref.number.textContent = loads[i].toFixed(2);
        ref.number.setAttribute("data-level", level);
        ref.fill.setAttribute("data-level", level);
        ref.fill.style.width = getBarWidth(loads[i], cpuCores) + "%";
      });
      if (loadAvgNode.parentNode !== secondCell) {
        secondCell.textContent = "";
        secondCell.appendChild(loadAvgNode);
      }
      return;
    }

    const container = document.createElement("div");
    container.className = "proton-load-average";

    const labels = [t("1 min"), t("5 min"), t("15 min")];
    loadAvgRefs = [];

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
      loadAvgRefs.push({ number: number, fill: fill });
    });

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
    loadAvgNode = container;
  }

  function initLoadAverageEnhancement() {
    if (isOverviewPage()) {
      let observer = null;
      let lastEnhanceTime = 0;
      const enhanceThrottle = 200; // Минимальный интервал между обновлениями

      function throttledEnhance() {
        const now = Date.now();
        if (now - lastEnhanceTime < enhanceThrottle) {
          return;
        }
        lastEnhanceTime = now;

        const table = getOverviewSystemTable();
        if (!table) return;

        const rows = table.querySelectorAll("tr");
        if (rows.length <= LOAD_AVERAGE_ROW_INDEX) return;

        const row = rows[LOAD_AVERAGE_ROW_INDEX];
        const secondCell = row.querySelector("td:last-child");
        if (!secondCell) return;

        if (!secondCell.querySelector(".proton-load-average")) {
          enhanceLoadAverage();
        }
      }

      function setupObserver() {
        if (observer) {
          observer.disconnect();
        }

        const maincontent = document.getElementById("maincontent");
        if (!maincontent) return;

        observer = new MutationObserver((mutations) => {
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

      const initCheck = setInterval(() => {
        const table = getOverviewSystemTable();
        if (table && table.querySelectorAll("tr").length > 0) {
          throttledEnhance();
          clearInterval(initCheck);
          setupObserver();

          if (
            typeof L !== "undefined" &&
            L.poll &&
            typeof L.poll.add === "function"
          ) {
            L.poll.add(() => {
              setTimeout(throttledEnhance, 100);
            }, 5);
          }
        }
      }, 100);

      setTimeout(() => clearInterval(initCheck), 10000);

      const onHashChange = () => {
        setTimeout(() => {
          throttledEnhance();
        }, 500);
      };
      window.addEventListener("hashchange", onHashChange);

      const onVisibilityChange = () => {
        if (!document.hidden) {
          setTimeout(() => {
            throttledEnhance();
          }, 300);
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      window.addEventListener(
        "pagehide",
        () => {
          clearInterval(initCheck);
          window.removeEventListener("hashchange", onHashChange);
          document.removeEventListener("visibilitychange", onVisibilityChange);
          if (observer) {
            observer.disconnect();
            observer = null;
          }
        },
        { once: true },
      );
    }
  }

  function initChannelAnalysisEnhancements() {
    const pendingTimers = [];
    const cleanupTimers = () => {
      pendingTimers.forEach((timer) => clearTimeout(timer));
      pendingTimers.length = 0;
    };

    const tryMove = () => {
      if (!document.querySelector('[id="channel_graph"]')) return false;

      const tabMenu = document.querySelector("ul.cbi-tabmenu");
      if (!tabMenu) return false;

      const button = document.querySelector(
        ".cbi-title-section .cbi-title-buttons > button.cbi-button.cbi-button-edit",
      );
      if (!button) return false;

      if (tabMenu.contains(button)) return true;

      tabMenu.appendChild(button);
      tabMenu.classList.add("proton-has-tabmenu-button");
      button.classList.add("proton-tabmenu-refresh");

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

    const root =
      document.getElementById("view") || document.getElementById("maincontent");
    if (!root) return;

    const observer = new MutationObserver(() => {
      if (tryMove()) {
        observer.disconnect();
        cleanupTimers();
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    [250, 500, 1000].forEach((delay) => {
      pendingTimers.push(
        setTimeout(() => {
          tryMove();
        }, delay),
      );
    });

    window.addEventListener(
      "pagehide",
      () => {
        observer.disconnect();
        cleanupTimers();
      },
      { once: true },
    );
  }

  function initOverviewDecorations() {
    initOverviewArchitectureEnhancement();
    initLoadAverageEnhancement();
    initChannelAnalysisEnhancements();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOverviewDecorations);
  } else {
    initOverviewDecorations();
  }
})();
