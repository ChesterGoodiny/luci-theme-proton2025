/**
 * Proton2025 - LuCI Menu Integration (search index feedback)
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 *
 * Lazy module: loaded on first search focus / panel request.
 * Methods are merged into the core menu-proton2025 singleton via `protonMixin`.
 */

"use strict";
"require baseclass";

var SEARCH_INDEX_ACTIVITY_LOG_KEY = "proton-search-index-activity-log";
var SEARCH_INDEX_ACTIVITY_LOG_EXPANDED_KEY =
  "proton-search-index-activity-log-expanded";
var SEARCH_INDEX_ACTIVITY_LOG_LIMIT = 20;
var SEARCH_INDEX_ACTIVITY_DETAILS_LIMIT = 32;
var SEARCH_INDEX_PANEL_HASH = "#proton-search-index-panel";
var SEARCH_INDEX_PANEL_FOCUS_EVENT = "proton-focus-search-index-panel";

return baseclass.extend({
  protonMixin: {
    revealSearchIndexPanel(panel) {
      if (!panel || typeof panel.closest !== "function") return;

      const safeName = (value) =>
        /^[\w-]+$/.test(String(value || "")) ? String(value) : "";

      const luciPane = panel.closest("[data-tab][data-tab-title]");
      if (luciPane && !luciPane.getClientRects().length) {
        const luciTabName = safeName(luciPane.getAttribute("data-tab"));
        const luciTabLink = luciTabName
          ? document.querySelector(
              `.cbi-tabmenu li[data-tab="${luciTabName}"] a`,
            )
          : null;
        if (luciTabLink) luciTabLink.click();
      }

      const protonPane = panel.closest(".proton-tab-content");
      if (protonPane && !protonPane.classList.contains("active")) {
        const protonTabName = safeName(protonPane.id.replace(/^tab-/, ""));
        const protonTabButton = protonTabName
          ? document.querySelector(
              `.proton-tab-button[data-tab="${protonTabName}"]`,
            )
          : null;
        if (protonTabButton) protonTabButton.click();
        else protonPane.classList.add("active");
      }
    },

    focusSearchIndexPanel() {
      const focusPanel = () => {
        const panel = document.getElementById("proton-search-index-panel");
        if (!panel) return false;

        this.revealSearchIndexPanel(panel);

        if (!panel.getClientRects().length) return false;

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
      }
    },

    loadSearchIndexActivityExpanded() {
      if (typeof this._searchIndexActivityExpanded === "boolean") {
        return this._searchIndexActivityExpanded;
      }

      let expanded = false;

      try {
        expanded =
          localStorage.getItem(SEARCH_INDEX_ACTIVITY_LOG_EXPANDED_KEY) ===
          "true";
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
      const t = this.translateThemeText.bind(this);
      const details = [];

      if (options?.includeRouteErrors && routeErrorCount > 0) {
        details.push(`${t("Route errors")}: ${routeErrorCount}`);
      }

      if (options?.includePersistenceErrors && persistenceErrorCount > 0) {
        details.push(`${t("Cache write errors")}: ${persistenceErrorCount}`);
      }

      if (
        !details.length &&
        options?.includeGenericErrors &&
        totalErrorCount > 0
      ) {
        details.push(`${t("Index issues")}: ${totalErrorCount}`);
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
      const t = this.translateThemeText.bind(this);
      const details = [];

      if (routeCount > 0) {
        details.push(
          `${t("Indexed routes")}: ${indexedRouteCount}/${routeCount}`,
        );
      }

      if (cachedEntryCount > 0) {
        details.push(`${t("Cached entries")}: ${cachedEntryCount}`);
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
      const normalizedDetails =
        this.normalizeSearchIndexActivityDetails(details);
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
        this.translateThemeText("Cached index cleared."),
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
      const t = this.translateThemeText.bind(this);
      const details = [];

      if (routeCount > 0) {
        details.push(
          `${t("Indexed routes")}: ${indexedRouteCount}/${routeCount}`,
        );
      } else {
        details.push(t("Preparing route list"));
      }

      if (cachedEntryCount > 0) {
        details.push(`${t("Cached entries")}: ${cachedEntryCount}`);
      }

      if (routeErrorCount > 0) {
        details.push(`${t("Route errors")}: ${routeErrorCount}`);
      }

      return `${t("Running now")}: ${details.join(" · ")}.`;
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
      const emptyNode = document.getElementById(
        "proton-search-index-log-empty",
      );

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
          summaryNode.className =
            "proton-search-index-log-entry-details-toggle";
          const detailsLabel =
            this.normalizeSearchIndexActivityDetailsLabel(entry.detailsLabel) ||
            this.translateThemeText("Details");
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
      const t = this.translateThemeText.bind(this);

      if (status.inProgress && !previousStatus.inProgress) {
        const routeCount = Number(status.routeCount) || 0;
        const message =
          routeCount > 0
            ? `${t("Index run started.")} ${t("Routes queued")}: ${routeCount}`
            : t("Index run started.");

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
            ? `${t("Index run canceled.")} ${t("Indexed routes")}: ${indexedRouteCount}/${routeCount}`
            : t("Index run canceled.");

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
          ? `${t("Index run failed.")} ${summary}`
          : issueSummary
            ? `${t("Index run failed.")} ${issueSummary}`
            : t("Index run failed before completion.");

        this.appendSearchIndexActivityEntry(
          message,
          "error",
          `fail:${Number(status.lastIndexedAt) || 0}:${errorCount}:${Number(currentState?.cachedEntryCount) || 0}:${errorDetails.join("||")}`,
          errorDetails,
          errorDetails.length ? t("Error details") : "",
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
            ? `${t("Index run completed with warnings.")} ${summary}`
            : t("Index run completed with warnings.")
          : summary
            ? `${t("Index run completed.")} ${summary}`
            : t("Index run completed.");

      this.appendSearchIndexActivityEntry(
        message,
        errorCount > 0 ? "warning" : "success",
        `complete:${Number(status.lastIndexedAt) || 0}:${errorCount}:${Number(currentState?.cachedEntryCount) || 0}`,
        errorCount > 0 ? errorDetails : indexedPageDetails,
        errorCount > 0
          ? errorDetails.length
            ? t("Error details")
            : ""
          : indexedPageDetails.length
            ? t("Indexed pages")
            : "",
      );
    },

    ensureSearchIndexFeedbackUi() {
      let progressRoot = document.getElementById(
        "proton-search-index-progress",
      );
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
          routeCount > 0
            ? Math.max(indexedRouteCount / routeCount, 0.06)
            : 0.08;

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
  },
});
