/**
 * Proton2025 Theme - Settings Synchronization Module
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
    "proton-zoom": "zoom",
    "proton-transparency": "transparency",
    "proton-border-radius": "border_radius",
    "proton-animations": "animations",
    "proton-services-widget-enabled": "services_widget",
    "proton-temp-widget-enabled": "temp_widget",
    "proton-services-log": "services_log",
    "proton-table-wrap": "table_wrap",
    "proton-log-highlight": "log_highlight",
    "proton-page-width": "page_width",
    "proton-custom-font": "custom_font",
  };

  // Reverse mapping
  const UCI_TO_LOCAL = {};
  for (const [local, uci] of Object.entries(SETTINGS_MAP)) {
    UCI_TO_LOCAL[uci] = local;
  }

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
    ];

    if (booleanOptions.includes(uciName)) {
      return localValue === "true" || localValue === true ? "1" : "0";
    }

    return String(localValue);
  }

  // Sync status tracking
  let syncInProgress = false;
  let pendingChanges = {};
  let saveTimeout = null;

  // Debounced save to UCI
  function scheduleSaveToUci() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      saveToUci();
    }, 500); // Debounce 500ms
  }

  // Save pending changes to UCI
  async function saveToUci() {
    if (Object.keys(pendingChanges).length === 0) return;

    const changes = { ...pendingChanges };
    pendingChanges = {};

    try {
      // Use L.Request if available (LuCI environment)
      if (window.L && window.L.Request) {
        const response = await L.Request.post(L.env.ubuspath || "/ubus/", {
          jsonrpc: "2.0",
          id: Date.now(),
          method: "call",
          params: [
            L.env.sessionid || "00000000000000000000000000000000",
            "luci.proton-settings",
            "setSettings",
            { settings: changes },
          ],
        });

        const result = response.json();
        if (result?.result?.[1]?.success) {
          // Settings saved successfully
        } else if (result?.result?.[1]?.errors) {
          console.warn(
            "[Proton2025] UCI save errors:",
            result.result[1].errors,
          );
        }
      } else {
        // Fallback: direct ubus call via fetch
        const response = await fetch("/ubus/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "call",
            params: [
              "00000000000000000000000000000000",
              "luci.proton-settings",
              "setSettings",
              { settings: changes },
            ],
          }),
        });

        const result = await response.json();
        if (result?.result?.[1]?.success) {
          // Settings saved successfully
        }
      }
    } catch (err) {
      console.warn("[Proton2025] Failed to save to UCI:", err);
      // Re-queue failed changes
      Object.assign(pendingChanges, changes);
    }
  }

  // Load settings from UCI and sync to localStorage
  async function syncFromUci() {
    if (syncInProgress) return;
    syncInProgress = true;

    try {
      let result;

      if (window.L && window.L.Request) {
        const response = await L.Request.post(L.env.ubuspath || "/ubus/", {
          jsonrpc: "2.0",
          id: Date.now(),
          method: "call",
          params: [
            L.env.sessionid || "00000000000000000000000000000000",
            "luci.proton-settings",
            "getSettings",
            {},
          ],
        });
        result = response.json();
      } else {
        const response = await fetch("/ubus/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "call",
            params: [
              "00000000000000000000000000000000",
              "luci.proton-settings",
              "getSettings",
              {},
            ],
          }),
        });
        result = await response.json();
      }

      const settings = result?.result?.[1]?.settings;
      if (!settings) {
        // No UCI settings found, using localStorage
        return;
      }

      let updated = false;

      // Set flag to prevent sync loop
      isSyncingFromUci = true;

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
      scheduleSaveToUci();
    }
  };

  // Export sync function for manual trigger
  window.protonSettingsSync = {
    syncFromUci: syncFromUci,
    saveToUci: saveToUci,

    // Force full sync (useful after login)
    forceSync: async function () {
      await syncFromUci();
    },

    // Reset all settings to defaults
    resetToDefaults: async function () {
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

        if (window.L && window.L.Request) {
          await L.Request.post(L.env.ubuspath || "/ubus/", {
            jsonrpc: "2.0",
            id: Date.now(),
            method: "call",
            params: [
              L.env.sessionid || "00000000000000000000000000000000",
              "luci.proton-settings",
              "setSettings",
              { settings: resetData },
            ],
          });
        } else {
          await fetch("/ubus/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: Date.now(),
              method: "call",
              params: [
                "00000000000000000000000000000000",
                "luci.proton-settings",
                "setSettings",
                { settings: resetData },
              ],
            }),
          });
        }
      } catch (err) {
        console.warn("[Proton2025] Failed to reset UCI settings:", err);
      }

      // Reload page to apply defaults
      window.location.reload();
    },
  };

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
    if (document.visibilityState === "visible") {
      syncFromUci();
    }
  });
})();
