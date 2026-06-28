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
var SEARCH_INDEX_ACTIVITY_LOG_KEY = "proton-search-index-activity-log";
var SEARCH_INDEX_ACTIVITY_LOG_EXPANDED_KEY =
  "proton-search-index-activity-log-expanded";
var SEARCH_INDEX_ACTIVITY_LOG_LIMIT = 6;
var SEARCH_INDEX_ACTIVITY_DETAILS_LIMIT = 32;
var SEARCH_INDEX_PANEL_HASH = "#proton-search-index-panel";
var SEARCH_INDEX_PANEL_FOCUS_EVENT = "proton-focus-search-index-panel";

return baseclass.extend({
  __init__() {
    ui.menu.load().then((tree) => this.render(tree));

    this.installThemeModeObserver();
    this.initSearchIndexFeedback();
    window.addEventListener(SEARCH_INDEX_PANEL_FOCUS_EVENT, () => {
      this.focusSearchIndexPanel();
    });

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
        requestAnimationFrame(() => this.repositionAlerts());

        // На мобильных resize часто вызывается скрытием/показом адресной строки —
        // пропускаем, чтобы не дёргать layout и не сбивать скролл
        if (window.innerWidth < 800) return;
        const z = localStorage.getItem("proton-zoom") || "100";
        this.applyZoom(z);
        const pw = parseInt(localStorage.getItem("proton-page-width")) || 0;
        this.applyPageWidth(pw);
      }, 200);
    });

    // Initialize floating alert messages
    document.addEventListener("DOMContentLoaded", () => {
      this.initFloatingAlerts();
    });
    setTimeout(() => this.initFloatingAlerts(), 100);
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

    this.applyThemeMode(settings.themeMode);
    this.applyThemeSettings(settings);
  },

  translateThemeText(key) {
    if (typeof window.protonT === "function") {
      try {
        return window.protonT(key);
      } catch (error) {
        // Fall back to LuCI translation helpers below.
      }
    }

    return _(key);
  },

  focusSearchIndexPanel() {
    const focusPanel = () => {
      const panel = document.getElementById("proton-search-index-panel");
      if (!panel) return false;

      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      panel.classList.add("proton-search-index-panel-focus");

      if (this._searchIndexPanelFocusTimer) {
        clearTimeout(this._searchIndexPanelFocusTimer);
      }

      this._searchIndexPanelFocusTimer = setTimeout(() => {
        panel.classList.remove("proton-search-index-panel-focus");
      }, 1600);

      const runButton = document.getElementById("proton-search-index-run");
      if (runButton && typeof runButton.focus === "function") {
        runButton.focus({ preventScroll: true });
      }

      return true;
    };

    if (focusPanel()) return true;

    let attempts = 0;
    const maxAttempts = 12;

    const retryFocus = () => {
      attempts += 1;
      if (focusPanel() || attempts >= maxAttempts) return;
      setTimeout(retryFocus, 160);
    };

    setTimeout(retryFocus, 120);
    return false;
  },

  maybeFocusSearchIndexPanelFromHash() {
    if (window.location.hash !== SEARCH_INDEX_PANEL_HASH) return false;
    this.focusSearchIndexPanel();
    return true;
  },

  normalizeSearchIndexActivityDetails(details) {
    return Array.isArray(details)
      ? details
          .map((detail) =>
            String(detail || "")
              .replace(/\s+/g, " ")
              .trim(),
          )
          .filter(Boolean)
          .slice(0, SEARCH_INDEX_ACTIVITY_DETAILS_LIMIT)
      : [];
  },

  normalizeSearchIndexActivityDetailsLabel(label) {
    const normalizedLabel = String(label || "")
      .replace(/\s+/g, " ")
      .trim();
    return normalizedLabel || "";
  },

  loadSearchIndexActivityEntries() {
    if (Array.isArray(this._searchIndexActivityEntries)) {
      return this._searchIndexActivityEntries;
    }

    let entries = [];

    try {
      const rawValue = localStorage.getItem(SEARCH_INDEX_ACTIVITY_LOG_KEY);
      const parsed = rawValue ? JSON.parse(rawValue) : [];

      if (Array.isArray(parsed)) {
        entries = parsed
          .filter((entry) => entry && typeof entry.message === "string")
          .map((entry) => ({
            timestamp: Number(entry.timestamp) || Date.now(),
            tone: typeof entry.tone === "string" ? entry.tone : "info",
            message: String(entry.message || "").trim(),
            details: this.normalizeSearchIndexActivityDetails(entry.details),
            detailsLabel: this.normalizeSearchIndexActivityDetailsLabel(
              entry.detailsLabel,
            ),
          }))
          .filter((entry) => entry.message)
          .slice(0, SEARCH_INDEX_ACTIVITY_LOG_LIMIT);
      }
    } catch (error) {
      entries = [];
    }

    this._searchIndexActivityEntries = entries;
    return entries;
  },

  persistSearchIndexActivityEntries() {
    try {
      localStorage.setItem(
        SEARCH_INDEX_ACTIVITY_LOG_KEY,
        JSON.stringify(
          (this._searchIndexActivityEntries || []).slice(
            0,
            SEARCH_INDEX_ACTIVITY_LOG_LIMIT,
          ),
        ),
      );
    } catch (error) {
      // Ignore localStorage write failures.
    }
  },

  loadSearchIndexActivityExpanded() {
    if (typeof this._searchIndexActivityExpanded === "boolean") {
      return this._searchIndexActivityExpanded;
    }

    let expanded = false;

    try {
      expanded =
        localStorage.getItem(SEARCH_INDEX_ACTIVITY_LOG_EXPANDED_KEY) === "true";
    } catch (error) {
      expanded = false;
    }

    this._searchIndexActivityExpanded = expanded;
    return expanded;
  },

  persistSearchIndexActivityExpanded() {
    try {
      localStorage.setItem(
        SEARCH_INDEX_ACTIVITY_LOG_EXPANDED_KEY,
        this._searchIndexActivityExpanded ? "true" : "false",
      );
    } catch (error) {
      // Ignore localStorage write failures.
    }
  },

  setSearchIndexActivityExpanded(expanded) {
    const normalizedExpanded = expanded === true;
    const rootNode = document.getElementById("proton-search-index-log-root");
    const toggleNode = document.getElementById(
      "proton-search-index-log-toggle",
    );
    const contentNode = document.getElementById(
      "proton-search-index-log-content",
    );

    this._searchIndexActivityExpanded = normalizedExpanded;
    this.persistSearchIndexActivityExpanded();

    if (rootNode) {
      rootNode.classList.toggle("is-expanded", normalizedExpanded);
    }

    if (toggleNode) {
      toggleNode.setAttribute(
        "aria-expanded",
        normalizedExpanded ? "true" : "false",
      );
      toggleNode.classList.toggle("is-expanded", normalizedExpanded);
    }

    if (contentNode) {
      contentNode.hidden = !normalizedExpanded;
    }
  },

  formatSearchIndexActivityTime(timestamp) {
    const date = new Date(Number(timestamp) || Date.now());

    if (Number.isNaN(date.getTime())) {
      return "--:--:--";
    }

    try {
      return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);
    } catch (error) {
      const pad = (value) => String(value).padStart(2, "0");
      return [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
      ].join(":");
    }
  },

  formatSearchIndexBytes(bytes) {
    const value = Number(bytes) || 0;
    if (value <= 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    let size = value;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
  },

  buildSearchIndexIssueSummary(state, options) {
    const status = state?.status || {};
    const routeErrorCount = Number(status.routeErrorCount) || 0;
    const persistenceErrorCount = Number(status.persistenceErrorCount) || 0;
    const totalErrorCount = Number(status.errorCount) || 0;
    const details = [];

    if (options?.includeRouteErrors && routeErrorCount > 0) {
      details.push(
        routeErrorCount === 1
          ? "1 route error"
          : `${routeErrorCount} route errors`,
      );
    }

    if (options?.includePersistenceErrors && persistenceErrorCount > 0) {
      details.push(
        persistenceErrorCount === 1
          ? "cache persistence failed"
          : `${persistenceErrorCount} cache persistence issues`,
      );
    }

    if (
      !details.length &&
      options?.includeGenericErrors &&
      totalErrorCount > 0
    ) {
      details.push(
        totalErrorCount === 1
          ? "1 index issue"
          : `${totalErrorCount} index issues`,
      );
    }

    return details.join(", ");
  },

  buildSearchIndexActivitySummary(state, options) {
    const status = state?.status || {};
    const routeCount = Number(status.routeCount) || 0;
    const indexedRouteCount = Number(status.indexedRouteCount) || routeCount;
    const cachedEntryCount = Number(state?.cachedEntryCount) || 0;
    const cacheBytes = Number(state?.cacheBytes) || 0;
    const durationMs = Number(options?.durationMs) || 0;
    const details = [];

    if (routeCount > 0) {
      details.push(`${indexedRouteCount}/${routeCount} routes`);
    }

    if (cachedEntryCount > 0) {
      details.push(`${cachedEntryCount} cached entries`);
    }

    if (cacheBytes > 0) {
      details.push(this.formatSearchIndexBytes(cacheBytes));
    }

    if (durationMs > 0) {
      details.push(this.formatSearchIndexDuration(durationMs));
    }

    const issueSummary = this.buildSearchIndexIssueSummary(state, {
      includeRouteErrors: options?.includeErrors === true,
      includePersistenceErrors: options?.includeErrors === true,
      includeGenericErrors: options?.includeErrors === true,
    });
    if (issueSummary) {
      details.push(issueSummary);
    }

    return details.join(", ");
  },

  appendSearchIndexActivityEntry(message, tone, key, details, detailsLabel) {
    const normalizedMessage = String(message || "").trim();
    const normalizedDetails = this.normalizeSearchIndexActivityDetails(details);
    const normalizedDetailsLabel =
      this.normalizeSearchIndexActivityDetailsLabel(detailsLabel);
    if (!normalizedMessage) {
      return;
    }

    if (key && key === this._lastSearchIndexActivityEventKey) {
      return;
    }

    if (key) {
      this._lastSearchIndexActivityEventKey = key;
    }

    const entries = this.loadSearchIndexActivityEntries().slice();
    entries.unshift({
      timestamp: Date.now(),
      tone: tone || "info",
      message: normalizedMessage,
      details: normalizedDetails,
      detailsLabel: normalizedDetailsLabel,
    });

    this._searchIndexActivityEntries = entries.slice(
      0,
      SEARCH_INDEX_ACTIVITY_LOG_LIMIT,
    );
    this.persistSearchIndexActivityEntries();
    this.renderSearchIndexActivity(this._lastObservedSearchIndexState);
  },

  recordSearchIndexCleared() {
    this.appendSearchIndexActivityEntry(
      "Cached index cleared.",
      "muted",
      `clear:${Date.now()}`,
    );
  },

  buildSearchIndexErrorDetails(state, options) {
    const status = state?.status || {};
    const details = this.normalizeSearchIndexActivityDetails(
      status.recentErrors,
    );
    const fallbackMessage = String(options?.errorMessage || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!fallbackMessage) {
      return details;
    }

    if (details.indexOf(fallbackMessage) !== -1) {
      return details;
    }

    return [fallbackMessage]
      .concat(details)
      .slice(0, SEARCH_INDEX_ACTIVITY_DETAILS_LIMIT);
  },

  buildSearchIndexIndexedPageDetails(state) {
    return this.normalizeSearchIndexActivityDetails(
      state?.status?.indexedPages,
    );
  },

  buildSearchIndexLiveMessage(state) {
    const status = state?.status || {};
    if (!status.inProgress) {
      return "";
    }

    const routeCount = Number(status.routeCount) || 0;
    const indexedRouteCount = Number(status.indexedRouteCount) || 0;
    const cachedEntryCount = Number(state?.cachedEntryCount) || 0;
    const routeErrorCount = Number(status.routeErrorCount) || 0;
    const details = [];

    if (routeCount > 0) {
      details.push(`${indexedRouteCount}/${routeCount} routes indexed`);
    } else {
      details.push("preparing route list");
    }

    if (cachedEntryCount > 0) {
      details.push(`${cachedEntryCount} cached entries ready`);
    }

    if (routeErrorCount > 0) {
      details.push(
        routeErrorCount === 1
          ? "1 route error"
          : `${routeErrorCount} route errors`,
      );
    }

    return `Running now: ${details.join(" · ")}.`;
  },

  buildSearchIndexActivityEntriesKey(entries) {
    if (!Array.isArray(entries) || !entries.length) {
      return "";
    }

    return entries
      .map(
        (entry) =>
          `${Number(entry?.timestamp) || 0}|${String(entry?.tone || "info")}|${String(entry?.message || "")}|${this.normalizeSearchIndexActivityDetails(entry?.details).join("||")}|${this.normalizeSearchIndexActivityDetailsLabel(entry?.detailsLabel)}`,
      )
      .join("\n");
  },

  renderSearchIndexActivity(state) {
    const liveNode = document.getElementById("proton-search-index-log-live");
    const listNode = document.getElementById("proton-search-index-log-list");
    const emptyNode = document.getElementById("proton-search-index-log-empty");

    if (!liveNode || !listNode || !emptyNode) {
      return;
    }

    const liveMessage = this.buildSearchIndexLiveMessage(state);
    liveNode.textContent = liveMessage;
    liveNode.hidden = !liveMessage;
    liveNode.classList.toggle("is-visible", !!liveMessage);

    const entries = this.loadSearchIndexActivityEntries();
    const entriesKey = this.buildSearchIndexActivityEntriesKey(entries);

    if (entriesKey === this._searchIndexActivityRenderKey) {
      emptyNode.hidden = entries.length > 0;
      return;
    }

    this._searchIndexActivityRenderKey = entriesKey;
    listNode.textContent = "";

    entries.forEach((entry) => {
      const itemNode = document.createElement("div");
      itemNode.className = `proton-search-index-log-entry proton-search-index-log-entry-${entry.tone || "info"}`;

      const timeNode = document.createElement("div");
      timeNode.className = "proton-search-index-log-time";
      timeNode.textContent = this.formatSearchIndexActivityTime(
        entry.timestamp,
      );

      const contentNode = document.createElement("div");
      contentNode.className = "proton-search-index-log-entry-body";

      const messageNode = document.createElement("div");
      messageNode.className = "proton-search-index-log-message";
      messageNode.textContent = entry.message;

      contentNode.appendChild(messageNode);

      const entryDetails = this.normalizeSearchIndexActivityDetails(
        entry.details,
      );
      if (entryDetails.length) {
        const detailsNode = document.createElement("details");
        detailsNode.className = "proton-search-index-log-entry-details";

        const summaryNode = document.createElement("summary");
        summaryNode.className = "proton-search-index-log-entry-details-toggle";
        const detailsLabel =
          this.normalizeSearchIndexActivityDetailsLabel(entry.detailsLabel) ||
          "Details";
        summaryNode.textContent =
          entryDetails.length > 1
            ? `${detailsLabel} (${entryDetails.length})`
            : detailsLabel;

        const detailsListNode = document.createElement("ul");
        detailsListNode.className =
          "proton-search-index-log-entry-details-list";

        entryDetails.forEach((detail) => {
          const detailNode = document.createElement("li");
          detailNode.className = "proton-search-index-log-entry-detail";
          detailNode.textContent = detail;
          detailsListNode.appendChild(detailNode);
        });

        detailsNode.appendChild(summaryNode);
        detailsNode.appendChild(detailsListNode);
        contentNode.appendChild(detailsNode);
      }

      itemNode.appendChild(timeNode);
      itemNode.appendChild(contentNode);
      listNode.appendChild(itemNode);
    });

    emptyNode.hidden = entries.length > 0;
  },

  maybeRecordSearchIndexActivity(previousState, currentState, options) {
    const previousStatus = previousState?.status || {};
    const status = currentState?.status || {};
    const forceError = options?.forceError === true;

    if (status.inProgress && !previousStatus.inProgress) {
      const routeCount = Number(status.routeCount) || 0;
      const message =
        routeCount > 0
          ? `Index run started: ${routeCount} routes queued.`
          : "Index run started.";

      this.appendSearchIndexActivityEntry(
        message,
        "info",
        `start:${this._searchIndexRunStartedAt || Date.now()}:${routeCount}`,
      );
      return;
    }

    const completedTransition =
      !!previousStatus.inProgress && !status.inProgress;

    if (!completedTransition && !forceError) {
      return;
    }

    if (status.canceled) {
      const routeCount = Number(status.routeCount) || 0;
      const indexedRouteCount = Number(status.indexedRouteCount) || 0;
      const message =
        routeCount > 0
          ? `Index run canceled: ${indexedRouteCount}/${routeCount} routes processed.`
          : "Index run canceled.";

      this.appendSearchIndexActivityEntry(
        message,
        "warning",
        `cancel:${Number(status.lastIndexedAt) || 0}:${indexedRouteCount}:${routeCount}`,
      );
      return;
    }

    if (forceError) {
      const errorCount = Number(status.errorCount) || 0;
      const errorDetails = this.buildSearchIndexErrorDetails(
        currentState,
        options,
      );
      const summary = this.buildSearchIndexActivitySummary(currentState, {
        includeErrors: errorCount > 0,
      });
      const issueSummary = this.buildSearchIndexIssueSummary(currentState, {
        includeRouteErrors: true,
        includePersistenceErrors: true,
        includeGenericErrors: true,
      });
      const message = summary
        ? `Index run failed: ${summary}.`
        : issueSummary
          ? `Index run failed: ${issueSummary}.`
          : "Index run failed before completion.";

      this.appendSearchIndexActivityEntry(
        message,
        "error",
        `fail:${Number(status.lastIndexedAt) || 0}:${errorCount}:${Number(currentState?.cachedEntryCount) || 0}`,
        errorDetails,
        errorDetails.length ? "Error details" : "",
      );
      return;
    }

    const errorCount = Number(status.errorCount) || 0;
    const indexedPageDetails =
      this.buildSearchIndexIndexedPageDetails(currentState);
    const errorDetails =
      errorCount > 0
        ? this.buildSearchIndexErrorDetails(currentState, options)
        : [];
    const summary = this.buildSearchIndexActivitySummary(currentState, {
      durationMs: options?.durationMs,
      includeErrors: errorCount > 0,
    });
    const message =
      errorCount > 0
        ? summary
          ? `Index run completed with warnings: ${summary}.`
          : "Index run completed with warnings."
        : summary
          ? `Index run completed: ${summary}.`
          : "Index run completed.";

    this.appendSearchIndexActivityEntry(
      message,
      errorCount > 0 ? "warning" : "success",
      `complete:${Number(status.lastIndexedAt) || 0}:${errorCount}:${Number(currentState?.cachedEntryCount) || 0}`,
      errorCount > 0 ? errorDetails : indexedPageDetails,
      errorCount > 0
        ? errorDetails.length
          ? "Error details"
          : ""
        : indexedPageDetails.length
          ? "Indexed pages"
          : "",
    );
  },

  ensureSearchIndexFeedbackUi() {
    let progressRoot = document.getElementById("proton-search-index-progress");
    if (!progressRoot) {
      progressRoot = document.createElement("div");
      progressRoot.id = "proton-search-index-progress";
      progressRoot.className = "proton-search-index-progress";
      progressRoot.hidden = true;

      const progressBar = document.createElement("div");
      progressBar.className = "proton-search-index-progress-bar";
      progressRoot.appendChild(progressBar);
      document.body.appendChild(progressRoot);
    }

    let toastRoot = document.getElementById("proton-search-index-toast");
    if (!toastRoot) {
      toastRoot = document.createElement("div");
      toastRoot.id = "proton-search-index-toast";
      toastRoot.className = "proton-search-index-toast";
      toastRoot.hidden = true;
      toastRoot.innerHTML =
        '<div class="proton-search-index-toast-content"><div class="proton-search-index-toast-title"></div><div class="proton-search-index-toast-body"></div></div>';
      document.body.appendChild(toastRoot);
    }

    let hudRoot = document.getElementById("proton-search-index-hud");
    if (!hudRoot) {
      hudRoot = document.createElement("div");
      hudRoot.id = "proton-search-index-hud";
      hudRoot.className = "proton-search-index-hud";
      hudRoot.hidden = true;
      hudRoot.innerHTML =
        '<div class="proton-search-index-hud-content"><div class="proton-search-index-hud-title"></div><div class="proton-search-index-hud-body"></div></div><button type="button" class="proton-search-index-hud-cancel cbi-button cbi-button-negative"></button>';
      document.body.appendChild(hudRoot);
    }

    const hudCancelButton = hudRoot.querySelector(
      ".proton-search-index-hud-cancel",
    );
    if (hudCancelButton && !hudCancelButton.dataset.boundCancel) {
      hudCancelButton.dataset.boundCancel = "1";
      hudCancelButton.addEventListener("click", () => {
        if (
          window.protonSearchIndex &&
          typeof window.protonSearchIndex.cancel === "function"
        ) {
          window.protonSearchIndex.cancel("user");
        }
      });
    }

    return {
      progressRoot: progressRoot,
      progressBar: progressRoot.querySelector(
        ".proton-search-index-progress-bar",
      ),
      toastRoot: toastRoot,
      toastTitle: toastRoot.querySelector(".proton-search-index-toast-title"),
      toastBody: toastRoot.querySelector(".proton-search-index-toast-body"),
      hudRoot: hudRoot,
      hudTitle: hudRoot.querySelector(".proton-search-index-hud-title"),
      hudBody: hudRoot.querySelector(".proton-search-index-hud-body"),
      hudCancelButton: hudCancelButton,
    };
  },

  setSearchIndexFeedbackState(state) {
    const ui = this.ensureSearchIndexFeedbackUi();
    const status = state?.status || {};
    const t = this.translateThemeText.bind(this);

    window.clearTimeout(this._searchIndexProgressHideTimer);

    if (status.inProgress) {
      const routeCount = Number(status.routeCount) || 0;
      const indexedRouteCount = Number(status.indexedRouteCount) || 0;
      const progress =
        routeCount > 0 ? Math.max(indexedRouteCount / routeCount, 0.06) : 0.08;

      ui.progressRoot.hidden = false;
      ui.progressRoot.classList.add("is-visible");
      ui.progressRoot.classList.remove("is-complete");
      ui.progressBar.style.transform = `scaleX(${Math.min(progress, 0.94)})`;

      if (ui.hudTitle) {
        ui.hudTitle.textContent = t("Indexing in progress...");
      }
      if (ui.hudBody) {
        ui.hudBody.textContent =
          routeCount > 0
            ? `${t("Indexed routes")}: ${indexedRouteCount}/${routeCount}`
            : t("Search index is ready to be built.");
      }
      if (ui.hudCancelButton) {
        ui.hudCancelButton.textContent = t("Cancel Indexing");
      }
      if (ui.hudRoot) {
        ui.hudRoot.hidden = false;
        ui.hudRoot.classList.add("is-visible");
        requestAnimationFrame(() => this.repositionAlerts());
      }
      return;
    }

    if (ui.hudRoot) {
      ui.hudRoot.classList.remove("is-visible");
      ui.hudRoot.hidden = true;
      this.repositionAlerts();
    }

    if (ui.progressRoot.hidden) {
      return;
    }

    ui.progressRoot.classList.add("is-complete");
    ui.progressBar.style.transform = "scaleX(1)";
    this._searchIndexProgressHideTimer = window.setTimeout(() => {
      ui.progressRoot.classList.remove("is-visible", "is-complete");
      ui.progressRoot.hidden = true;
      ui.progressBar.style.transform = "scaleX(0)";
    }, 520);
  },

  showSearchIndexFeedbackToast(message, isError) {
    const ui = this.ensureSearchIndexFeedbackUi();

    window.clearTimeout(this._searchIndexToastHideTimer);
    ui.toastTitle.textContent = this.translateThemeText("Search Page Index");
    ui.toastBody.textContent = message;
    ui.toastRoot.hidden = false;
    ui.toastRoot.classList.toggle("is-error", !!isError);

    window.requestAnimationFrame(() => {
      ui.toastRoot.classList.add("is-visible");
      this.repositionAlerts();
    });

    this._searchIndexToastHideTimer = window.setTimeout(() => {
      ui.toastRoot.classList.remove("is-visible");
      this.repositionAlerts();
      window.setTimeout(() => {
        if (!ui.toastRoot.classList.contains("is-visible")) {
          ui.toastRoot.hidden = true;
        }
      }, 220);
    }, 7000);
  },

  buildSearchIndexToastPayload(state, options) {
    const status = state?.status || {};
    const routeCount = Number(status.routeCount) || 0;
    const indexedRouteCount = Number(status.indexedRouteCount) || routeCount;
    const errorCount = Number(status.errorCount) || 0;
    const cachedEntryCount = Number(state?.cachedEntryCount) || 0;
    const durationMs = Number(options?.durationMs) || 0;
    const forceError = options?.forceError === true;
    const t = this.translateThemeText.bind(this);

    if (status.canceled) {
      const details = [];

      if (routeCount > 0) {
        details.push(
          `${t("Indexed routes")}: ${indexedRouteCount}/${routeCount}`,
        );
      }

      details.push(t("You can start indexing again at any time."));

      return {
        key: `canceled:${Number(status.lastIndexedAt) || 0}:${routeCount}:${indexedRouteCount}`,
        message: `${t("Indexing canceled.")} ${details.join(" · ")}`,
        isError: false,
      };
    }

    if (forceError || errorCount > 0) {
      return {
        key: `error:${Number(status.lastIndexedAt) || 0}:${routeCount}:${indexedRouteCount}:${Math.max(errorCount, 1)}`,
        message:
          errorCount > 0
            ? `${t("Index errors")}: ${errorCount}`
            : t("Index errors"),
        isError: true,
      };
    }

    return {
      key: `success:${Number(status.lastIndexedAt) || 0}:${routeCount}:${indexedRouteCount}:${Number(state?.cachedEntryCount) || 0}`,
      message: (() => {
        const details = [];

        if (routeCount > 0) {
          details.push(
            `${t("Indexed routes")}: ${indexedRouteCount}/${routeCount}`,
          );
        }

        if (cachedEntryCount > 0) {
          details.push(`${t("Cached entries")}: ${cachedEntryCount}`);
        }

        if (durationMs > 0) {
          details.push(this.formatSearchIndexDuration(durationMs));
        }

        return details.length
          ? `${t("Search index updated successfully.")} ${details.join(" · ")}`
          : t("Search index updated successfully.");
      })(),
      isError: false,
    };
  },

  formatSearchIndexDuration(durationMs) {
    const t = this.translateThemeText.bind(this);
    const totalSeconds = Math.max(
      Math.round(Number(durationMs || 0) / 1000),
      0,
    );
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes <= 0) {
      return `${totalSeconds} ${t("s")}`;
    }

    if (seconds === 0) {
      return `${minutes} ${t("min")}`;
    }

    return `${minutes} ${t("min")} ${seconds} ${t("s")}`;
  },

  maybeNotifySearchIndexCompletion(previousState, currentState, options) {
    const previousStatus = previousState?.status || {};
    const status = currentState?.status || {};
    const forceError = options?.forceError === true;
    const completedTransition =
      !!previousStatus.inProgress && !status.inProgress;

    if (!completedTransition && !forceError) {
      return;
    }

    const toastPayload = this.buildSearchIndexToastPayload(
      currentState,
      options,
    );
    if (!toastPayload) {
      return;
    }

    if (!forceError && toastPayload.key === this._lastSearchIndexToastKey) {
      return;
    }

    this._lastSearchIndexToastKey = toastPayload.key;
    this.showSearchIndexFeedbackToast(
      toastPayload.message,
      toastPayload.isError,
    );
  },

  initSearchIndexFeedback() {
    if (this._searchIndexFeedbackInit) {
      return;
    }

    this._searchIndexFeedbackInit = true;
    this._searchIndexProgressHideTimer = 0;
    this._searchIndexToastHideTimer = 0;
    this._lastSearchIndexToastKey = "";
    this._lastSearchIndexActivityEventKey = "";
    this._searchIndexActivityRenderKey = "";
    this._lastObservedSearchIndexState = null;
    this._searchIndexRunStartedAt = 0;
    this.loadSearchIndexActivityEntries();

    window.addEventListener("proton-search-index-state", (event) => {
      const previousState = this._lastObservedSearchIndexState;
      const previousStatus = previousState?.status || {};
      const nextState = event.detail || {};
      const nextStatus = nextState?.status || {};
      let durationMs = 0;

      if (nextStatus.inProgress && !previousStatus.inProgress) {
        this._searchIndexRunStartedAt = Date.now();
      }

      if (
        !nextStatus.inProgress &&
        previousStatus.inProgress &&
        this._searchIndexRunStartedAt > 0
      ) {
        durationMs = Math.max(
          (Number(nextStatus.lastIndexedAt) || Date.now()) -
            this._searchIndexRunStartedAt,
          0,
        );
        this._searchIndexRunStartedAt = 0;
      }

      this.maybeNotifySearchIndexCompletion(
        previousState,
        nextState,
        durationMs > 0 ? { durationMs: durationMs } : undefined,
      );
      this.maybeRecordSearchIndexActivity(
        previousState,
        nextState,
        durationMs > 0 ? { durationMs: durationMs } : undefined,
      );
      this._lastObservedSearchIndexState = nextState;
      this.setSearchIndexFeedbackState(nextState);
      this.renderSearchIndexActivity(nextState);
    });
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

      const positionDropdown = (toggle, dropdown) => {
        if (!toggle || !dropdown || !dropdown.classList.contains("open")) {
          return;
        }

        dropdown.classList.remove("open-up");

        requestAnimationFrame(() => {
          const scrollContainer =
            toggle.closest("#cbi-wireless-wifi-device") ||
            document.getElementById("maincontent");
          const toggleRect = toggle.getBoundingClientRect();
          const containerRect = scrollContainer
            ? scrollContainer.getBoundingClientRect()
            : document.documentElement.getBoundingClientRect();

          const visibleTop = Math.max(containerRect.top, 0);
          const visibleBottom = Math.min(
            containerRect.bottom,
            window.innerHeight,
          );
          const availableAbove = toggleRect.top - visibleTop;
          const availableBelow = visibleBottom - toggleRect.bottom;
          const dropdownHeight = Math.max(
            dropdown.offsetHeight,
            dropdown.scrollHeight,
            dropdown.getBoundingClientRect().height,
          );

          if (
            availableBelow < dropdownHeight + 4 &&
            availableAbove >= dropdownHeight + 4
          ) {
            dropdown.classList.add("open-up");
          }
        });
      };

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
            if (d !== dropdown) d.classList.remove("open-up");
          });

          dropdown.classList.toggle("open");

          if (dropdown.classList.contains("open")) {
            positionDropdown(toggle, dropdown);
          } else {
            dropdown.classList.remove("open-up");
          }
        });

        // Close dropdown after button click
        dropdown.addEventListener("click", (ev) => {
          if (ev.target.matches("button, input[type='button'], .cbi-button")) {
            setTimeout(() => {
              dropdown.classList.remove("open");
              dropdown.classList.remove("open-up");
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

    const wirelessContainer =
      document.querySelector("#cbi-wireless") || document.body;
    observer.observe(wirelessContainer, {
      childList: true,
      subtree: true,
    });
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
      if (document.getElementById("proton-theme-settings")) {
        this.maybeFocusSearchIndexPanelFromHash();
        return true;
      }
      const designField = document.querySelector('[data-name="_mediaurlbase"]');
      if (!designField) return false;

      // Get the parent container
      const parentContainer = designField.closest(".cbi-section-node");
      if (!parentContainer) return false;

      // Newer LuCI versions render the built-in "Table Filters" field after
      // the design selector. Keep Proton custom settings after that field when
      // present, but gracefully fall back for older LuCI builds where it does
      // not exist.
      const tableFiltersField = parentContainer.querySelector(
        '[data-name="_tablefilters"]',
      );
      const insertAfterField = tableFiltersField || designField;

      // Load saved settings
      const defaultZoom = "100";
      const storedThemeMode = localStorage.getItem("proton-theme-mode");
      const settings = {
        themeMode:
          storedThemeMode === "light" || storedThemeMode === "dark"
            ? storedThemeMode
            : "auto",
        accentColor: localStorage.getItem("proton-accent-color") || "blue",
        accentCustom:
          localStorage.getItem("proton-accent-custom") || "#5e9eff",
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
                <option value="auto" ${
                  settings.themeMode === "auto" ? "selected" : ""
                }>${t("Auto")} (${t("System")})</option>
                <option value="dark" ${
                  settings.themeMode === "dark" ? "selected" : ""
                }>${t("Dark")}</option>
                <option value="light" ${
                  settings.themeMode === "light" ? "selected" : ""
                }>${t("Light")}</option>
              </select>
              <div class="cbi-value-description">${t(
                "Choose light, dark, or follow system theme",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-accent-select">${t(
              "Accent Color",
            )}</label>
            <div class="cbi-value-field">
              <div style="display: flex; align-items: center; gap: 10px;">
                <select id="proton-accent-select" class="cbi-input-select" style="flex: 1 1 auto; min-width: 0;">
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
                  <option value="custom" ${
                    settings.accentColor === "custom" ? "selected" : ""
                  }>${t("Custom")}</option>
                </select>
                <span id="proton-accent-custom-row" style="display: ${
                  settings.accentColor === "custom" ? "inline-flex" : "none"
                }; align-items: center; gap: 8px; flex: 0 0 auto;">
                  <input type="color" id="proton-accent-custom-color" value="${
                    settings.accentCustom
                  }" title="${t(
                    "Custom Color",
                  )}" class="proton-accent-color-input" style="width: 40px; height: 34px; cursor: pointer; border-radius: var(--proton-radius-sm);">
                  <input type="text" id="proton-accent-custom-hex" value="${
                    settings.accentCustom
                  }" maxlength="7" spellcheck="false" autocomplete="off" placeholder="#5e9eff" style="width: 90px; flex: 0 0 auto; font-family: monospace; text-transform: lowercase;">
                </span>
              </div>
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
                  settings.pageWidth > 0 ? settings.pageWidth : 80
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

          <div class="cbi-value proton-update-setting">
            <label class="cbi-value-title" for="proton-update-check">${t(
              "Proton2025 Update",
            )}</label>
            <div class="cbi-value-field">
              <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 8px;">
                <button type="button" id="proton-update-check" class="cbi-button cbi-button-action">${t(
                  "Check for Updates",
                )}</button>
                <button type="button" id="proton-update-install" class="cbi-button cbi-button-positive" style="display: none;">${t(
                  "Install Update",
                )}</button>
                <a id="proton-update-release" class="cbi-button" href="https://github.com/ChesterGoodiny/luci-theme-proton2025/releases/latest" target="_blank" rel="noopener noreferrer" style="display: none;">${t(
                  "Open Release Page",
                )}</a>
              </div>
              <div class="cbi-value-description">
                <div>${t("Current version")}: <strong id="proton-update-current">—</strong></div>
                <div>${t("Latest version")}: <strong id="proton-update-latest">—</strong></div>
                <div id="proton-update-status" style="margin-top: 4px;">${t(
                  "Click the button to check for a new Proton2025 release.",
                )}</div>
              </div>
            </div>
          </div>

          <div class="cbi-value proton-search-index-setting">
            <label class="cbi-value-title" for="proton-search-index-run">${t(
              "Search Page Index",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-value-description">${t(
                "Build or clear the cached LuCI search index manually when menu pages change.",
              )}</div>
            </div>
          </div>

          <div id="proton-search-index-panel" class="proton-search-index-panel">
            <div class="proton-search-index-toolbar">
              <button type="button" id="proton-search-index-run" class="cbi-button cbi-button-action proton-search-index-btn proton-search-index-btn-primary">${t(
                "Index Pages Now",
              )}</button>
              <div class="proton-search-index-field proton-search-index-field-size">
                <div class="proton-search-index-label">${t(
                  "Indexed Data Size",
                )}</div>
                <div id="proton-search-index-size" class="proton-search-index-size">0 B</div>
              </div>
              <button type="button" id="proton-search-index-clear" class="cbi-button proton-search-index-btn proton-search-index-btn-secondary proton-search-index-btn-icon" title="${t(
                "Clear Indexed Data",
              )}" aria-label="${t("Clear Indexed Data")}">
                <svg class="proton-search-index-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </div>
            <div id="proton-search-index-status" class="cbi-value-description proton-search-index-status" aria-live="polite">${t(
              "Search index is ready to be built.",
            )}</div>
            <div id="proton-search-index-log-root" class="proton-search-index-log">
              <button type="button" id="proton-search-index-log-toggle" class="proton-search-index-log-toggle" aria-expanded="false" aria-controls="proton-search-index-log-content">
                <span class="proton-search-index-log-title">Activity Log</span>
                <svg class="proton-search-index-log-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div id="proton-search-index-log-content" class="proton-search-index-log-content" aria-live="polite" hidden>
                <div id="proton-search-index-log-live" class="proton-search-index-log-live" hidden></div>
                <div id="proton-search-index-log-list" class="proton-search-index-log-list"></div>
                <div id="proton-search-index-log-empty" class="proton-search-index-log-empty">No activity recorded yet.</div>
              </div>
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

      // Insert after the last built-in LuCI field in this group.
      insertAfterField.insertAdjacentHTML("afterend", settingsHTML);

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
        this.applyThemeMode(mode);
        if (zoomRange) updateSliderFill(zoomRange);
        if (pageWidthRange) updateSliderFill(pageWidthRange);
      });

      const accentCustomRow = document.getElementById(
        "proton-accent-custom-row",
      );
      const accentCustomColor = document.getElementById(
        "proton-accent-custom-color",
      );
      const accentCustomHex = document.getElementById(
        "proton-accent-custom-hex",
      );

      accentSelect?.addEventListener("change", (e) => {
        const color = e.target.value;
        localStorage.setItem("proton-accent-color", color);
        if (accentCustomRow) {
          accentCustomRow.style.display =
            color === "custom" ? "inline-flex" : "none";
        }
        this.applyAccentColor(color);
        if (zoomRange) updateSliderFill(zoomRange);
        if (pageWidthRange) updateSliderFill(pageWidthRange);
      });

      // Apply a custom HEX accent from the picker / text field.
      const applyCustomAccent = (raw, syncColor, syncHex) => {
        const hex = this.normalizeHex(raw);
        if (!hex) return;
        localStorage.setItem("proton-accent-custom", hex);
        if (syncColor && accentCustomColor) accentCustomColor.value = hex;
        if (syncHex && accentCustomHex) accentCustomHex.value = hex;
        this.applyAccentColor("custom");
        if (zoomRange) updateSliderFill(zoomRange);
        if (pageWidthRange) updateSliderFill(pageWidthRange);
      };

      accentCustomColor?.addEventListener("input", (e) => {
        applyCustomAccent(e.target.value, false, true);
      });

      accentCustomHex?.addEventListener("input", (e) => {
        // Only act once the field holds a complete, valid colour.
        if (this.normalizeHex(e.target.value)) {
          applyCustomAccent(e.target.value, true, false);
        }
      });

      // Normalise / restore the text field when focus leaves it.
      accentCustomHex?.addEventListener("blur", (e) => {
        const hex =
          this.normalizeHex(e.target.value) ||
          localStorage.getItem("proton-accent-custom") ||
          "#5e9eff";
        e.target.value = hex;
        if (accentCustomColor) accentCustomColor.value = hex;
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
          const notif = L.ui.addNotification(null, E("p", msg), "info");
          if (notif) notif.dataset.protonManaged = "true";
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
          const notif = L.ui.addNotification(null, E("p", msg), "info");
          if (notif) notif.dataset.protonManaged = "true";
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

      const callProtonSettingsRpc = async (method, args = {}) => {
        const rpcPath = (window.L && L.env && L.env.ubuspath) || "/ubus/";
        const sessionId =
          (window.L && L.env && L.env.sessionid) ||
          "00000000000000000000000000000000";

        const response = await fetch(rpcPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "call",
            params: [sessionId, "luci.proton-settings", method, args || {}],
          }),
        });

        const result = await response.json();
        return result?.result?.[1] || null;
      };

      const updateCheckButton = document.getElementById("proton-update-check");
      const updateInstallButton = document.getElementById(
        "proton-update-install",
      );
      const updateReleaseLink = document.getElementById(
        "proton-update-release",
      );
      const updateCurrent = document.getElementById("proton-update-current");
      const updateLatest = document.getElementById("proton-update-latest");
      const updateStatus = document.getElementById("proton-update-status");

      const setUpdateStatus = (message, isError) => {
        if (!updateStatus) return;
        updateStatus.textContent = message;
        updateStatus.style.color = isError ? "#ff6b6b" : "";
      };

      const setUpdateInstallVisible = (visible) => {
        if (!updateInstallButton) return;
        updateInstallButton.style.display = visible ? "" : "none";
      };

      const loadInstalledThemeVersion = async () => {
        if (updateCurrent) {
          updateCurrent.textContent = t("Loading...");
        }

        try {
          const payload = await callProtonSettingsRpc("getVersion");

          if (!payload) {
            throw new Error("Empty RPC response");
          }

          if (updateCurrent) {
            updateCurrent.textContent = payload.current_version || "—";
          }

          if (updateReleaseLink && payload.release_url) {
            updateReleaseLink.href = payload.release_url;
          }

          if (!payload.success && updateCurrent) {
            updateCurrent.textContent = "—";
          }
        } catch (error) {
          if (updateCurrent) {
            updateCurrent.textContent = "—";
          }
        }
      };

      loadInstalledThemeVersion();

      updateInstallButton?.addEventListener("click", async () => {
        updateInstallButton.disabled = true;
        updateCheckButton.disabled = true;
        updateInstallButton.textContent = t("Installing...");
        setUpdateStatus(t("Installing Proton2025 update..."), false);

        try {
          const payload = await callProtonSettingsRpc("installUpdate");

          if (!payload) {
            throw new Error("Empty RPC response");
          }

          if (updateCurrent) {
            updateCurrent.textContent =
              payload.installed_version || payload.current_version || "—";
          }

          if (updateLatest) {
            updateLatest.textContent =
              payload.latest_version || payload.latest_tag || "—";
          }

          if (updateReleaseLink && payload.release_url) {
            updateReleaseLink.href = payload.release_url;
            updateReleaseLink.style.display = "";
          }

          if (!payload.success) {
            setUpdateInstallVisible(true);
            setUpdateStatus(
              payload.error || t("Failed to install update."),
              true,
            );
            return;
          }

          if (payload.update_available) {
            setUpdateInstallVisible(true);
            setUpdateStatus(
              t("Update installed, but a newer version is still available.") +
                ` ${payload.current_version || "—"} → ${payload.latest_version || "—"}`,
              true,
            );
          } else {
            setUpdateInstallVisible(false);
            setUpdateStatus(t("Proton2025 update installed."), false);
          }
        } catch (error) {
          setUpdateInstallVisible(true);
          setUpdateStatus(
            t("Failed to install update.") +
              " " +
              (error && error.message ? error.message : String(error || "")),
            true,
          );
        } finally {
          updateInstallButton.disabled = false;
          updateCheckButton.disabled = false;
          updateInstallButton.textContent = t("Install Update");
        }
      });

      updateCheckButton?.addEventListener("click", async () => {
        updateCheckButton.disabled = true;
        updateCheckButton.textContent = t("Checking...");
        setUpdateStatus(t("Checking latest Proton2025 release..."), false);
        setUpdateInstallVisible(false);

        try {
          const payload = await callProtonSettingsRpc("checkUpdate");

          if (!payload) {
            throw new Error("Empty RPC response");
          }

          if (updateCurrent) {
            updateCurrent.textContent = payload.current_version || "—";
          }

          if (updateLatest) {
            updateLatest.textContent =
              payload.latest_version || payload.latest_tag || "—";
          }

          if (updateReleaseLink && payload.release_url) {
            updateReleaseLink.href = payload.release_url;
            updateReleaseLink.style.display = "";
          }

          if (!payload.success) {
            setUpdateInstallVisible(false);
            setUpdateStatus(
              payload.error || t("Failed to check for updates."),
              true,
            );
            return;
          }

          if (payload.update_available) {
            setUpdateInstallVisible(true);
            setUpdateStatus(
              t("A new Proton2025 version is available.") +
                ` ${payload.current_version} → ${payload.latest_version}`,
              false,
            );
          } else {
            setUpdateInstallVisible(false);
            setUpdateStatus(t("Proton2025 is up to date."), false);
          }
        } catch (error) {
          setUpdateStatus(
            t("Failed to check for updates.") +
              " " +
              (error && error.message ? error.message : String(error || "")),
            true,
          );
        } finally {
          updateCheckButton.disabled = false;
          updateCheckButton.textContent = t("Check for Updates");
        }
      });

      const formatBytes = (bytes) => {
        const value = Number(bytes) || 0;
        if (value <= 0) return "0 B";

        const units = ["B", "KB", "MB", "GB"];
        let size = value;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024;
          unitIndex += 1;
        }

        return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
      };

      const formatIndexedDate = (timestamp) => {
        if (!timestamp) return t("Not indexed yet");

        try {
          const date = new Date(timestamp);
          if (Number.isNaN(date.getTime())) {
            return t("Not indexed yet");
          }

          const locale = document.documentElement?.lang || undefined;
          return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(date);
        } catch (e) {
          return t("Not indexed yet");
        }
      };

      const getSearchIndexApi = () =>
        window.protonSearchIndex &&
        typeof window.protonSearchIndex.getState === "function"
          ? window.protonSearchIndex
          : null;

      const searchIndexRunButton = document.getElementById(
        "proton-search-index-run",
      );
      const searchIndexClearButton = document.getElementById(
        "proton-search-index-clear",
      );
      const searchIndexSize = document.getElementById(
        "proton-search-index-size",
      );
      const searchIndexStatus = document.getElementById(
        "proton-search-index-status",
      );
      const searchIndexLogToggle = document.getElementById(
        "proton-search-index-log-toggle",
      );

      this.setSearchIndexActivityExpanded(
        this.loadSearchIndexActivityExpanded(),
      );

      const updateSearchIndexUi = (state) => {
        const currentState = state || getSearchIndexApi()?.getState?.() || {};
        const status = currentState.status || {};
        const cachedEntryCount = Number(currentState.cachedEntryCount) || 0;
        const routeCount = Number(status.routeCount) || 0;
        const indexedRouteCount = Number(status.indexedRouteCount) || 0;
        const errorCount = Number(status.errorCount) || 0;

        if (searchIndexSize) {
          searchIndexSize.textContent = formatBytes(
            currentState.cacheBytes || 0,
          );
        }

        if (searchIndexRunButton) {
          const canCancel = !!status.inProgress && !!status.cancelable;
          searchIndexRunButton.disabled = !!status.inProgress && !canCancel;
          searchIndexRunButton.textContent = status.inProgress
            ? canCancel
              ? t("Cancel Indexing")
              : t("Indexing in progress...")
            : t("Index Pages Now");
        }

        if (searchIndexClearButton) {
          searchIndexClearButton.disabled = !!status.inProgress;
        }

        if (searchIndexStatus) {
          if (status.inProgress) {
            searchIndexStatus.textContent =
              t("Indexed routes") +
              `: ${indexedRouteCount}/${routeCount || "?"} · ` +
              t("Cached entries") +
              `: ${cachedEntryCount}`;
          } else if (status.canceled) {
            searchIndexStatus.textContent =
              t("Indexing canceled") +
              ` · ${t("Indexed routes")}: ${indexedRouteCount}/${routeCount || "?"}`;
          } else {
            searchIndexStatus.textContent =
              t("Cached entries") +
              `: ${cachedEntryCount} · ` +
              t("Last indexed") +
              `: ${formatIndexedDate(status.lastIndexedAt)}${
                errorCount > 0 ? ` · ${t("Index errors")}: ${errorCount}` : ""
              }`;
          }
        }
      };

      searchIndexRunButton?.addEventListener("click", async () => {
        const api = getSearchIndexApi();

        if (api?.getState?.()?.status?.inProgress) {
          if (typeof api?.cancel === "function") {
            api.cancel("user");
          }
          return;
        }

        if (!api?.refresh) return;

        try {
          await api.refresh(true);
        } catch (error) {
          const previousState = this._lastObservedSearchIndexState;
          const failedState = api.getState();
          updateSearchIndexUi(failedState);
          this.maybeRecordSearchIndexActivity(previousState, failedState, {
            forceError: true,
            errorMessage:
              error && typeof error.message === "string"
                ? error.message
                : String(error || ""),
          });
          this.maybeNotifySearchIndexCompletion(null, failedState, {
            forceError: true,
          });
        }
      });

      searchIndexClearButton?.addEventListener("click", async () => {
        if (
          !confirm(
            t(
              "Clear indexed search data? This removes cached search pages on the router until the next indexing run.",
            ),
          )
        ) {
          return;
        }

        const api = getSearchIndexApi();
        if (api?.clear) {
          await api.clear();
          this.recordSearchIndexCleared();
        } else {
          updateSearchIndexUi({
            cacheBytes: 0,
            cachedEntryCount: 0,
            status: {},
          });
          this.recordSearchIndexCleared();
        }
      });

      searchIndexLogToggle?.addEventListener("click", () => {
        this.setSearchIndexActivityExpanded(
          !this.loadSearchIndexActivityExpanded(),
        );
      });

      window.addEventListener("proton-search-index-state", (event) => {
        updateSearchIndexUi(event.detail || {});
      });

      const initialSearchIndexState = getSearchIndexApi()?.getState?.() || {};
      updateSearchIndexUi(initialSearchIndexState);
      this.renderSearchIndexActivity(initialSearchIndexState);

      // --- Backup & Restore ---
      const PROTON_SETTINGS_KEYS = [
        "proton-theme-mode",
        "proton-accent-color",
        "proton-accent-custom",
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
          const notif = L.ui.addNotification(
            null,
            E("p", msg),
            isError ? "danger" : "info",
          );
          if (notif) notif.dataset.protonManaged = "true";
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
              "proton-theme-mode": "auto",
              "proton-accent-color": "blue",
              "proton-accent-custom": "#5e9eff",
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

      this.maybeFocusSearchIndexPanelFromHash();

      return true;
    };

    // Fallbacks: immediate + delayed attempts + observer for dynamic LuCI renders.
    // Keep the observer alive because LuCI may re-render the form after Save/Apply
    // and remove injected Proton2025 settings from the DOM.
    const root = document.getElementById("maincontent") || document.body;

    if (this._themeSettingsObserver) {
      this._themeSettingsObserver.disconnect();
    }

    let remountTimer = null;
    const observer = new MutationObserver(() => {
      clearTimeout(remountTimer);
      remountTimer = setTimeout(() => {
        if (!document.body.dataset.page?.includes("admin-system-system")) {
          return;
        }

        if (document.getElementById("proton-theme-settings")) {
          return;
        }

        if (!document.querySelector('[data-name="_mediaurlbase"]')) {
          return;
        }

        this._themeSettingsInit = false;
        observer.disconnect();
        this._themeSettingsObserver = null;
        this.initThemeSettings();
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("proton-theme-settings-mounted"),
          );
        }, 200);
      }, 150);
    });

    this._themeSettingsObserver = observer;
    observer.observe(root, { childList: true, subtree: true });

    // Immediate and delayed attempts
    tryMount();
    setTimeout(tryMount, 300);
    setTimeout(tryMount, 800);
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

    return resolvedMode;
  },

  applyThemeSettings(settings) {
    if (settings.themeMode) {
      this.applyThemeMode(settings.themeMode);
    }

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

  // Accept "#rgb" / "#rrggbb" (with or without leading #), return a
  // canonical lowercase "#rrggbb" string, or null when invalid.
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

  // Derive the accent / hover / glow / rgb set from a single HEX colour.
  deriveAccent(hex) {
    const safe = this.normalizeHex(hex) || "#5e9eff";
    const r = parseInt(safe.slice(1, 3), 16);
    const g = parseInt(safe.slice(3, 5), 16);
    const b = parseInt(safe.slice(5, 7), 16);
    // Hover = the accent lightened ~20% toward white (works on dark UI).
    const lighten = (v) => Math.round(v + (255 - v) * 0.2);
    const toHex = (v) => v.toString(16).padStart(2, "0");
    return {
      accent: safe,
      hover:
        "#" + toHex(lighten(r)) + toHex(lighten(g)) + toHex(lighten(b)),
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
        "990px",
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

  /**
   * Initialize floating alert messages with close buttons
   * Improved version with better error handling and memory management
   */
  initFloatingAlerts() {
    // Prevent multiple initializations
    if (this._alertsInitialized) return;

    const processAlerts = () => {
      const alerts = document.querySelectorAll(
        ".alert-message:not([data-floating-init])",
      );
      if (!alerts.length) return;

      alerts.forEach((alert, index) => {
        try {
          // Mark as initialized
          alert.dataset.floatingInit = "true";

          // Floating alerts are opt-in. Unmarked LuCI system notifications stay native.
          if (!this.isManagedAlert(alert)) {
            alert.classList.remove("proton-alert-floating");
            alert.classList.add("proton-alert-native");
            return;
          }

          alert.classList.remove("proton-alert-native");
          alert.classList.add("proton-alert-floating");

          // Generate unique ID based on content hash
          const contentText = alert.textContent?.trim() || "";
          const alertId = `alert-${this.simpleHash(contentText)}`;
          alert.dataset.alertId = alertId;

          // Check if alert was dismissed in this session
          const dismissed = sessionStorage.getItem(
            `proton-alert-dismissed-${alertId}`,
          );
          if (dismissed === "true") {
            alert.remove();
            return;
          }

          // Ensure proper structure before showing
          this.ensureAlertStructure(alert);

          // Add close button to header if not yet added
          if (!alert.querySelector(".alert-message-close")) {
            const closeBtn = this.createCloseButton(alert, alertId);
            const header = alert.querySelector(".alert-message-header");
            (
              header ||
              alert.querySelector(".alert-message-content") ||
              alert
            ).appendChild(closeBtn);
          }

          // Set initial position: below all already-visible alerts
          this._positionAlert(alert, index);

          // Show alert with staggered animation, then reposition using real heights
          requestAnimationFrame(() => {
            setTimeout(() => {
              alert.classList.add("is-visible");
              requestAnimationFrame(() => this.repositionAlerts());
            }, 50 * index);
          });
        } catch (error) {
          console.error("Error initializing alert:", error);
        }
      });
    };

    // Initial processing — only explicitly managed alerts float on first paint.
    processAlerts();

    // Watch for new alerts (with debouncing)
    if (!this._alertObserver) {
      let debounceTimer = null;

      this._alertObserver = new MutationObserver((mutations) => {
        // Synchronously classify new alerts before the browser paints.
        // Floating behavior is opt-in via proton-alert-floating, so both paths
        // are tagged here before the debounce handler does the heavier setup.
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            const candidates = node.classList?.contains("alert-message")
              ? [node]
              : Array.from(node.querySelectorAll?.(".alert-message") ?? []);
            for (const alert of candidates) {
              if (alert.dataset.floatingInit) continue;
              if (this.isManagedAlert(alert)) {
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
    }

    this._alertsInitialized = true;
  },

  isManagedAlert(alert) {
    return alert?.dataset?.protonManaged === "true";
  },

  /**
   * Ensure alert has proper structure for styling
   */
  ensureAlertStructure(alert) {
    // Already structured — normalise if needed and return
    if (alert.querySelector(".alert-message-content")) {
      const content = alert.querySelector(".alert-message-content");

      // Ensure header exists (needed for close button)
      if (!content.querySelector(".alert-message-header")) {
        const title = content.querySelector(":scope > h4");
        this._ensureHeader(content, title);
      }

      // Move any loose buttons to footer
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

    // Build structure from raw children
    const title = alert.querySelector(":scope > h4");
    const childNodes = Array.from(alert.childNodes);

    const wrapper = document.createElement("div");
    wrapper.className = "alert-message-content";

    // Always create header (close button will be appended here, even without a title)
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

  /**
   * Always create .alert-message-header (even without a title) so close button
   * always lands at the top of the card.
   */
  _ensureHeader(wrapper, title) {
    const header = document.createElement("div");
    header.className = "alert-message-header";
    if (title) header.appendChild(title);
    wrapper.insertBefore(header, wrapper.firstChild);
    return header;
  },

  /**
   * Create close button for alert
   */
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
      this.dismissAlert(alert, alertId);
    });

    return closeBtn;
  },

  /**
   * Dismiss alert with animation
   */
  dismissAlert(alert, alertId) {
    try {
      // Mark as dismissed for this session
      sessionStorage.setItem(`proton-alert-dismissed-${alertId}`, "true");

      // Hide with animation
      alert.classList.remove("is-visible");
      alert.classList.add("is-hidden");

      // Remove from DOM after animation
      setTimeout(() => {
        if (alert.parentNode) {
          alert.remove();
        }
        // Reposition remaining alerts
        this.repositionAlerts();
      }, 300);
    } catch (error) {
      console.error("Error dismissing alert:", error);
      // Fallback: just remove it
      if (alert.parentNode) {
        alert.remove();
      }
    }
  },

  /**
   * Reposition all visible alerts using their real rendered heights.
   * Includes proton-search-index-hud and -toast in the stack.
   */
  repositionAlerts() {
    const gap = 12;
    const baseTop = window.matchMedia("(max-width: 800px)").matches ? 72 : 84;
    let top = baseTop;

    // Unified stack: HUD → toast → alert-messages (in that priority order)
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

  /**
   * Set preliminary top position for a not-yet-visible alert.
   * Uses actual heights of already-visible alerts + a rough estimate
   * (120px) for each unshown sibling in the current batch.
   */
  _positionAlert(alert, batchIndex) {
    const gap = 12;
    const baseTop = window.matchMedia("(max-width: 800px)").matches ? 72 : 84;
    let top = baseTop;

    // Account for HUD and toast already visible above
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

  /**
   * Simple hash function for generating alert IDs
   */
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
