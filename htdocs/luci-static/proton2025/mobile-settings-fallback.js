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

    var TITLE_TO_KEY = {
        "Theme Mode": "proton-theme-mode",
        "Режим темы": "proton-theme-mode",

        "Accent Color": "proton-accent-color",
        "Акцентный цвет": "proton-accent-color",

        "Login Page Animation": "proton-login-animation",
        "Анимация страницы входа": "proton-login-animation",

        "Border Radius": "proton-border-radius",
        "Скругление углов": "proton-border-radius",
        "Стиль скругления углов": "proton-border-radius",

        "Zoom": "proton-zoom",
        "Масштаб": "proton-zoom",

        "Animations": "proton-animations",
        "Анимации": "proton-animations",

        "Transparency": "proton-transparency",
        "Прозрачность": "proton-transparency",

        "Custom Font": "proton-custom-font",
        "Пользовательский шрифт": "proton-custom-font",

        "Wrap Tables": "proton-table-wrap",
        "Перенос таблиц": "proton-table-wrap",

        "Log Highlight": "proton-log-highlight",
        "Подсветка логов": "proton-log-highlight",

        "Services Widget": "proton-services-widget-enabled",
        "Виджет сервисов": "proton-services-widget-enabled",

        "Temperature Widget": "proton-temp-widget-enabled",
        "Виджет температуры": "proton-temp-widget-enabled",

        "Services Log": "proton-services-log",
        "Журнал сервисов": "proton-services-log"
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

    function getTitle(el) {
        var row = el && el.closest ? el.closest(".cbi-value") : null;
        if (!row) return "";

        var title = row.querySelector(".cbi-value-title, label, .control-label");
        return title ? (title.textContent || "").trim() : "";
    }

    function getKey(el) {
        if (!el) return "";

        // The login logo is handled by login-animation-settings.js
        // (FileReader -> data URI). Never let this fallback store a file
        // input's fake path.
        if (el.type === "file") return "";

        if (el.id === "proton-login-animation-select") {
            return "proton-login-animation";
        }
        if (el.id === "proton-login-branding-check") {
            return "proton-login-branding";
        }
        // The display-mode radios (proton-login-mode-*) write
        // proton-login-logo-only directly via login-animation-settings.js,
        // so this fallback intentionally does not key them.

        // The custom-accent colour picker and hex field share the
        // "Accent Color" row, so the title-based lookup below would
        // mis-map them to proton-accent-color and store a raw hex there
        // (which then falls back to the grey/default accent). Map them
        // explicitly: the picker/hex → the custom hex, the select → mode.
        if (
            el.id === "proton-accent-custom-color" ||
            el.id === "proton-accent-custom-hex"
        ) {
            return "proton-accent-custom";
        }
        if (el.id === "proton-accent-select") {
            return "proton-accent-color";
        }

        // The tab-outline checkbox lives in the "Border Radius" row, so
        // the title lookup would mis-map it; key it explicitly.
        if (el.id === "proton-tab-outline-check") {
            return "proton-tab-outline";
        }

        return TITLE_TO_KEY[getTitle(el)] || "";
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
