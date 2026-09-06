/**
 * Proton2025 Theme - Settings Synchronization Module
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 *
 * Implements a hybrid storage approach:
 * - localStorage: Fast cache for instant UI updates (no flicker)
 * - UCI (via ubus): Persistent storage, syncs across browsers/devices
 *
 * Flow:
 * 1. On page load: Apply from localStorage immediately (sync, in <head>)
 * 2. After load: Fetch from UCI, update localStorage if different
 * 3. On change: Update localStorage + apply immediately, then save to UCI async
 */

"use strict";

(function () {
  const SETTINGS_MAP = {
    "proton-theme-mode": "mode",
    "proton-accent-color": "accent",
    "proton-accent-custom": "accent_custom",
    "proton-zoom": "zoom",
    "proton-transparency": "transparency",
    "proton-border-radius": "border_radius",
    "proton-tab-outline": "tab_outline",
    "proton-tab-style": "tab_style",
    "proton-animations": "animations",
    "proton-services-widget-enabled": "services_widget",
    "proton-temp-widget-enabled": "temp_widget",
    "proton-metrics-widget-enabled": "metrics_widget",
    "proton-throughput-widget-enabled": "throughput_widget",
    "proton-services-log": "services_log",
    "proton-log-highlight": "log_highlight",
    "proton-page-width": "page_width",
    "proton-menu-mode": "menu_mode",
    "proton-menu-collapsed": "menu_collapsed",
    "proton-background-pattern": "background_pattern",
    "proton-pattern-scale": "pattern_scale",
    "proton-custom-font": "custom_font",
    "proton-login-animation": "login_animation",
    "proton-login-branding": "login_branding",
    "proton-login-name": "login_name",
    "proton-login-logo": "login_logo",
    "proton-login-logo-only": "login_logo_only",
  };

  const UCI_TO_LOCAL = {};
  for (const [local, uci] of Object.entries(SETTINGS_MAP)) {
    UCI_TO_LOCAL[uci] = local;
  }

  const PENDING_SESSION_KEY = "proton-settings-pending";
  const SAVE_DEBOUNCE_MS = 500;

  const BOOLEAN_OPTIONS = [
    "transparency",
    "animations",
    "services_widget",
    "temp_widget",
    "metrics_widget",
    "throughput_widget",
    "services_log",
    "log_highlight",
    "custom_font",
    "tab_outline",
    "menu_collapsed",
    "login_branding",
    "login_logo_only",
  ];

  function isBooleanOption(uciName) {
    return BOOLEAN_OPTIONS.indexOf(uciName) !== -1;
  }

  function uciToLocal(uciName, uciValue) {
    if (isBooleanOption(uciName)) {
      return uciValue === "1" ? "true" : "false";
    }

    return uciValue;
  }

  function localToUci(localName, localValue) {
    const uciName = SETTINGS_MAP[localName];

    if (isBooleanOption(uciName)) {
      return localValue === "true" || localValue === true ? "1" : "0";
    }

    return String(localValue);
  }

  function getSessionStorage() {
    try {
      return window.sessionStorage;
    } catch (err) {
      return null;
    }
  }

  function readPendingChanges() {
    const storage = getSessionStorage();
    if (!storage) return {};

    try {
      const raw = storage.getItem(PENDING_SESSION_KEY);
      if (!raw) return {};

      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function hasPendingChanges() {
    return Object.keys(pendingChanges).length > 0;
  }

  function persistPendingChanges() {
    const storage = getSessionStorage();
    if (!storage) return;

    try {
      if (!hasPendingChanges()) {
        storage.removeItem(PENDING_SESSION_KEY);
        return;
      }

      storage.setItem(PENDING_SESSION_KEY, JSON.stringify(pendingChanges));
    } catch (err) {}
  }

  function getRpcPath() {
    return (window.L && L.env && L.env.ubuspath) || "/ubus/";
  }

  function getRpcSessionId() {
    return (
      (window.L && L.env && L.env.sessionid) ||
      "00000000000000000000000000000000"
    );
  }

  async function callSettingsRpc(method, args, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(getRpcPath(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: !!options.keepalive,
        signal: controller.signal,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "call",
          params: [
            getRpcSessionId(),
            "luci.proton-settings",
            method,
            args || {},
          ],
        }),
      });

      if (options.fireAndForget) {
        return null;
      }

      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  let syncInProgress = false;
  let pendingChanges = readPendingChanges();
  let saveTimeout = null;

  function scheduleSaveToUci(delayMs = SAVE_DEBOUNCE_MS) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      saveTimeout = null;
      saveToUci();
    }, delayMs);
  }

  async function saveToUci() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    if (!hasPendingChanges()) return;

    const changes = { ...pendingChanges };

    try {
      const result = await callSettingsRpc("setSettings", {
        settings: changes,
      });
      const payload = result?.result?.[1];

      if (!payload?.success) {
        if (payload?.errors?.length) {
          console.warn("[Proton2025] UCI save errors:", payload.errors);
        }

        throw new Error("Settings save was not confirmed by ubus");
      }

      for (const k of Object.keys(changes)) {
        if (pendingChanges[k] === changes[k]) delete pendingChanges[k];
      }
      persistPendingChanges();
    } catch (err) {
      console.warn("[Proton2025] Failed to save to UCI:", err);
    }
  }

  function flushPendingChangesOnPageHide() {
    if (!hasPendingChanges()) return;

    callSettingsRpc(
      "setSettings",
      { settings: { ...pendingChanges } },
      { keepalive: true, fireAndForget: true },
    ).catch(() => {});
  }

  async function syncFromUci() {
    if (syncInProgress || hasPendingChanges()) return;
    syncInProgress = true;

    try {
      const result = await callSettingsRpc("getSettings", {});

      const settings = result?.result?.[1]?.settings;
      if (!settings) {
        return;
      }

      let updated = false;

      isSyncingFromUci = true;

      for (const [uciName, uciValue] of Object.entries(settings)) {
        const localKey = UCI_TO_LOCAL[uciName];
        if (!localKey) continue;

        const localValue = uciToLocal(uciName, uciValue);
        const currentLocal = localStorage.getItem(localKey);

        if (currentLocal !== localValue) {
          originalSetItem(localKey, localValue); // Use original to avoid triggering save back
          updated = true;
        }
      }

      isSyncingFromUci = false;

      if (updated) {
        window.dispatchEvent(new CustomEvent("proton-settings-synced"));
      }
    } catch (err) {
      console.warn("[Proton2025] Failed to sync from UCI:", err);
    } finally {
      syncInProgress = false;
    }
  }

  let isSyncingFromUci = false;

  const originalSetItem = localStorage.setItem.bind(localStorage);

  localStorage.setItem = function (key, value) {
    originalSetItem(key, value);

    if (SETTINGS_MAP[key] && !isSyncingFromUci) {
      const uciName = SETTINGS_MAP[key];
      const uciValue = localToUci(key, value);
      pendingChanges[uciName] = uciValue;
      persistPendingChanges();
      scheduleSaveToUci();
    }
  };

  window.protonSettingsSync = {
    syncFromUci: syncFromUci,
    saveToUci: saveToUci,
    flushPendingChanges: saveToUci,

    forceSync: async function () {
      await syncFromUci();
    },

    resetToDefaults: async function () {
      const defaults = {
        "proton-theme-mode": "auto",
        "proton-accent-color": "blue",
        "proton-accent-custom": "#5e9eff",
        "proton-zoom": "100",
        "proton-transparency": "true",
        "proton-border-radius": "default",
        "proton-tab-outline": "false",
        "proton-tab-style": "modern",
        "proton-animations": "true",
        "proton-services-widget-enabled": "true",
        "proton-temp-widget-enabled": "true",
        "proton-metrics-widget-enabled": "true",
        "proton-throughput-widget-enabled": "true",
        "proton-services-log": "false",
        "proton-log-highlight": "true",
        "proton-page-width": "",
        "proton-menu-mode": "top",
        "proton-menu-collapsed": "false",
        "proton-background-pattern": "none",
        "proton-pattern-scale": "100",
        "proton-custom-font": "true",
        "proton-login-animation": "particles",
        "proton-login-branding": "false",
        "proton-login-name": "",
        "proton-login-logo": "",
        "proton-login-logo-only": "false",
      };

      Object.keys(SETTINGS_MAP).forEach((key) => {
        localStorage.removeItem(key);
      });

      Object.entries(defaults).forEach(([key, value]) => {
        if (value) {
          originalSetItem(key, value);
        }
      });

      try {
        const resetData = {};
        Object.keys(SETTINGS_MAP).forEach((key) => {
          const uciName = SETTINGS_MAP[key];
          const defaultValue = defaults[key];
          resetData[uciName] = defaultValue
            ? localToUci(key, defaultValue)
            : "";
        });

        await callSettingsRpc("setSettings", { settings: resetData });
      } catch (err) {
        console.warn("[Proton2025] Failed to reset UCI settings:", err);
      }

      window.location.reload();
    },
  };

  if (hasPendingChanges()) {
    scheduleSaveToUci(50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(syncFromUci, 1000);
    });
  } else {
    setTimeout(syncFromUci, 1000);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushPendingChangesOnPageHide();
      return;
    }

    syncFromUci();
  });

  window.addEventListener("pagehide", flushPendingChangesOnPageHide);
  window.addEventListener("beforeunload", flushPendingChangesOnPageHide);
})();
