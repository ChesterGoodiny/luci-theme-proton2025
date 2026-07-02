(function () {
    "use strict";

    var LOCAL_TO_UCI = {
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
        "proton-login-logo-only": "login_logo_only"
    };

    var ID_TO_KEY = {
        "proton-mode-select": "proton-theme-mode",
        "proton-accent-select": "proton-accent-color",
        "proton-accent-custom-color": "proton-accent-custom",
        "proton-accent-custom-hex": "proton-accent-custom",
        "proton-radius-select": "proton-border-radius",
        "proton-tab-outline-check": "proton-tab-outline",
        "proton-zoom-range": "proton-zoom",
        "proton-transparency-check": "proton-transparency",
        "proton-animations-check": "proton-animations",
        "proton-custom-font-check": "proton-custom-font",
        "proton-table-wrap-check": "proton-table-wrap",
        "proton-log-highlight-check": "proton-log-highlight",
        "proton-services-widget-check": "proton-services-widget-enabled",
        "proton-temp-widget-check": "proton-temp-widget-enabled",
        "proton-services-log-check": "proton-services-log",
        "proton-page-width-check": "proton-page-width",
        "proton-page-width-range": "proton-page-width",
        "proton-login-animation-select": "proton-login-animation",
        "proton-login-branding-check": "proton-login-branding",
        "proton-login-name-input": "proton-login-name"
    };

    var pending = {};
    var saveTimer = null;

    function getRpcPath() {
        return (window.L && L.env && L.env.ubuspath) || "/ubus/";
    }

    function getSessionId() {
        return (window.L && L.env && L.env.sessionid) || "00000000000000000000000000000000";
    }

    function localToUci(localKey, value) {
        if (value === true || value === "true") return "1";
        if (value === false || value === "false") return "0";
        if (value === null || value === undefined) return "";

        return String(value);
    }

    function getKey(el) {
        if (!el) return "";

        // The login logo is handled by login-animation-settings.js
        // (FileReader -> data URI). Never let this fallback store a file
        // input's fake path.
        if (el.type === "file") return "";

        // The display-mode radios (proton-login-mode-*) write
        // proton-login-logo-only directly via login-animation-settings.js,
        // so this fallback intentionally does not key them.
        if (el.name === "proton-login-mode") return "";

        return ID_TO_KEY[el.id] || "";
    }

    function getValue(el) {
        if (!el) return "";

        if (el.matches && el.matches('input[type="checkbox"]')) {
            return el.checked ? "true" : "false";
        }

        return String(el.value);
    }

    function savePending() {
        var settings = {};

        Object.keys(pending).forEach(function (localKey) {
            var uciKey = LOCAL_TO_UCI[localKey];

            if (uciKey) {
                settings[uciKey] = localToUci(localKey, pending[localKey]);
            }
        });

        pending = {};

        if (!Object.keys(settings).length) return;

        fetch(getRpcPath(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: Date.now(),
                method: "call",
                params: [
                    getSessionId(),
                    "luci.proton-settings",
                    "setSettings",
                    {
                        settings: settings
                    }
                ]
            })
        }).catch(function (err) {
            console.warn("[Proton2025] mobile settings fallback failed:", err);
        });
    }

    function queueSave(localKey, value) {
        if (!localKey) return;

        localStorage.setItem(localKey, value);
        pending[localKey] = value;

        if (saveTimer) {
            clearTimeout(saveTimer);
        }

        saveTimer = setTimeout(function () {
            saveTimer = null;
            savePending();
        }, 250);
    }

    function handler(e) {
        var el = e.target;
        if (!el) return;

        if (el.tagName !== "SELECT" && el.tagName !== "INPUT") {
            return;
        }

        var key = getKey(el);
        if (!key) return;

        queueSave(key, getValue(el));
    }

    document.addEventListener("change", handler, true);
    document.addEventListener("input", handler, true);
})();
