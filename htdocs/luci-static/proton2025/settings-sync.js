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
  // Mapping between localStorage keys and UCI option names
  const SETTINGS_MAP = {
    "proton-theme-mode": "mode",
    "proton-accent-color": "accent",
    "proton-accent-custom": "accent_custom",
    "proton-zoom": "zoom",
    "proton-transparency": "transparency",
    "proton-border-radius": "border_radius",
    "proton-tab-outline": "tab_outline",
    "proton-animations": "animations",
    "proton-services-widget-enabled": "services_widget",
    "proton-temp-widget-enabled": "temp_widget",
    "proton-services-log": "services_log",
    "proton-table-wrap": "table_wrap",
    "proton-log-highlight": "log_highlight",
    "proton-page-width": "page_width",
    "proton-custom-font": "custom_font",
    "proton-login-animation": "login_animation",
    "proton-login-branding": "login_branding",
    "proton-login-name": "login_name",
    "proton-login-logo": "login_logo",
    "proton-login-logo-only": "login_logo_only",
  };

  // Reverse mapping
  const UCI_TO_LOCAL = {};
  for (const [local, uci] of Object.entries(SETTINGS_MAP)) {
    UCI_TO_LOCAL[uci] = local;
  }

  const PENDING_SESSION_KEY = "proton-settings-pending";
  const SAVE_DEBOUNCE_MS = 500;

  // Convert UCI value to localStorage format
  function uciToLocal(uciName, uciValue) {
    // Boolean options stored as '0'/'1' in UCI
    const booleanOptions = [
      "transparency",
      "animations",
      "services_widget",
      "temp_widget",
      "services_log",
      "table_wrap",
      "log_highlight",
      "custom_font",
      "tab_outline",
      "login_branding",
      "login_logo_only",
    ];

    if (booleanOptions.includes(uciName)) {
      return uciValue === "1" ? "true" : "false";
    }

    // Numeric options: keep as-is
    return uciValue;
  }

  // Convert localStorage value to UCI format
  function localToUci(localName, localValue) {
    const uciName = SETTINGS_MAP[localName];
    const booleanOptions = [
      "transparency",
      "animations",
      "services_widget",
      "temp_widget",
      "services_log",
      "table_wrap",
      "log_highlight",
      "custom_font",
      "tab_outline",
      "login_branding",
      "login_logo_only",
    ];

    if (booleanOptions.includes(uciName)) {
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
    } catch (err) {
      // Ignore sessionStorage failures
    }
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
    const response = await fetch(getRpcPath(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: !!options.keepalive,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "call",
        params: [getRpcSessionId(), "luci.proton-settings", method, args || {}],
      }),
    });

    if (options.fireAndForget) {
      return null;
    }

    return response.json();
  }

  // Sync status tracking
  let syncInProgress = false;
  let pendingChanges = readPendingChanges();
  let saveTimeout = null;

  // Debounced save to UCI
  function scheduleSaveToUci(delayMs = SAVE_DEBOUNCE_MS) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      saveTimeout = null;
      saveToUci();
    }, delayMs);
  }

  // Save pending changes to UCI
  async function saveToUci() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    if (!hasPendingChanges()) return;

    // Keep the pending changes queued (persisted) until the save is
    // *confirmed*. If we cleared them up front and the page navigated
    // mid-save, the next page would see no pending changes, run its UCI
    // sync against not-yet-committed data, and clobber the new value
    // (e.g. a freshly chosen custom accent reverting on navigation).
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

      // Confirmed — drop only the keys we saved (and only if they weren't
      // changed again meanwhile).
      for (const k of Object.keys(changes)) {
        if (pendingChanges[k] === changes[k]) delete pendingChanges[k];
      }
      persistPendingChanges();
    } catch (err) {
      console.warn("[Proton2025] Failed to save to UCI:", err);
      // Leave the pending changes in place so they are retried on the
      // next page load (and guard that page's sync in the meantime).
    }
  }

  function flushPendingChangesOnPageHide() {
    if (!hasPendingChanges()) return;

    callSettingsRpc(
      "setSettings",
      { settings: { ...pendingChanges } },
      { keepalive: true, fireAndForget: true },
    ).catch(() => {
      // The session-backed queue will be retried on the next page.
    });
  }

  // Load settings from UCI and sync to localStorage
  async function syncFromUci() {
    if (syncInProgress || hasPendingChanges()) return;
    syncInProgress = true;

    try {
      const result = await callSettingsRpc("getSettings", {});

      const settings = result?.result?.[1]?.settings;
      if (!settings) {
        // No UCI settings found, using localStorage
        return;
      }

      let updated = false;

      // Set flag to prevent sync loop
      isSyncingFromUci = true;

      // A deliberately-picked-but-not-yet-saved local value is already
      // protected: syncFromUci() bails out at the top while hasPendingChanges()
      // is true (that queue is persisted in sessionStorage across navigation).
      // So by the time we get here UCI is authoritative for every option, the
      // custom accent included — no per-option guard. Guarding the accent here
      // used to make it "sticky" to whatever the browser had in localStorage
      // and ignore the value shipped in /etc/config/proton2025 on a freshly
      // flashed device (accent=custom + a stale/empty accent_custom fell back
      // to the built-in #5e9eff instead of the configured colour).
      for (const [uciName, uciValue] of Object.entries(settings)) {
        const localKey = UCI_TO_LOCAL[uciName];
        if (!localKey) continue;

        const localValue = uciToLocal(uciName, uciValue);
        const currentLocal = localStorage.getItem(localKey);

        // UCI takes precedence - update localStorage if different
        if (currentLocal !== localValue) {
          originalSetItem(localKey, localValue); // Use original to avoid triggering save back
          updated = true;
        }
      }

      isSyncingFromUci = false;

      if (updated) {
        // Dispatch event for UI to update
        window.dispatchEvent(new CustomEvent("proton-settings-synced"));
      }
    } catch (err) {
      console.warn("[Proton2025] Failed to sync from UCI:", err);
    } finally {
      syncInProgress = false;
    }
  }

  // Flag to prevent sync loop
  let isSyncingFromUci = false;

  // Intercept localStorage.setItem for proton settings
  const originalSetItem = localStorage.setItem.bind(localStorage);

  localStorage.setItem = function (key, value) {
    originalSetItem(key, value);

    // If this is a proton setting and not syncing from UCI, queue for UCI save
    if (SETTINGS_MAP[key] && !isSyncingFromUci) {
      const uciName = SETTINGS_MAP[key];
      const uciValue = localToUci(key, value);
      pendingChanges[uciName] = uciValue;
      persistPendingChanges();
      scheduleSaveToUci();
    }
  };

  // Export sync function for manual trigger
  window.protonSettingsSync = {
    syncFromUci: syncFromUci,
    saveToUci: saveToUci,
    flushPendingChanges: saveToUci,

    // Force full sync (useful after login)
    forceSync: async function () {
      await syncFromUci();
    },

    // Reset all settings to defaults
    resetToDefaults: async function () {
      const defaults = {
        "proton-theme-mode": "auto",
        "proton-accent-color": "blue",
        "proton-accent-custom": "#5e9eff",
        "proton-zoom": "100",
        "proton-transparency": "true",
        "proton-border-radius": "default",
        "proton-tab-outline": "false",
        "proton-animations": "true",
        "proton-services-widget-enabled": "true",
        "proton-temp-widget-enabled": "true",
        "proton-services-log": "false",
        "proton-table-wrap": "false",
        "proton-log-highlight": "true",
        "proton-page-width": "",
        "proton-custom-font": "true",
        "proton-login-animation": "particles",
        "proton-login-branding": "false",
        "proton-login-name": "",
        "proton-login-logo": "",
        "proton-login-logo-only": "false",
      };

      // Clear all proton settings from localStorage
      Object.keys(SETTINGS_MAP).forEach((key) => {
        localStorage.removeItem(key);
      });

      // Apply defaults to localStorage
      Object.entries(defaults).forEach(([key, value]) => {
        if (value) {
          originalSetItem(key, value);
        }
      });

      // Reset UCI settings on server
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

      // Reload page to apply defaults
      window.location.reload();
    },
  };

  if (hasPendingChanges()) {
    scheduleSaveToUci(50);
  }

  // Auto-sync after page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // Delay sync to let LuCI initialize
      setTimeout(syncFromUci, 1000);
    });
  } else {
    setTimeout(syncFromUci, 1000);
  }

  // Re-sync when tab becomes visible (user might have changed settings in another tab)
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
