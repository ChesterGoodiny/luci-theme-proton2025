(function () {
    "use strict";

    var LOCAL_TO_UCI = {
        "proton-theme-mode": "mode",
        "proton-accent-color": "accent",
        "proton-accent-custom": "accent_custom",
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
        "proton-login-animation": "login_animation"
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

        if (el.id === "proton-login-animation-select") {
            return "proton-login-animation";
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
