/*
 * Proton2025 Login Animation setting injector.
 * Adds "Login Page Animation" selector to System -> System -> Language and Style.
 */
(function () {
    "use strict";

    var STORAGE_KEY = "proton-login-animation";

    var OPTIONS = [
        ["off", "Off"],
        ["particles", "Classic Particles"],
        ["constellation", "Constellation"],
        ["plexus", "Plexus / Neural"],
        ["breathing", "Breathing Particles"],
        ["gravity", "Gravity Hover"],
        ["lowpoly", "Low Poly Mesh"],
        ["dataflow", "Data Flow"],
        ["flowfield", "Flow Field"],
        ["circuit", "Circuit Board"],
        ["packetpulses", "Packet Pulses"],
        ["hex", "Hex Grid"]
    ];

    function _t(key) {
        return (window.protonT && window.protonT(key)) || key;
    }

    function getTitleText(row) {
        var title = row.querySelector(".cbi-value-title, label, .control-label");
        return title ? (title.textContent || "").trim() : "";
    }

    function findRowByTitle(names) {
        var rows = Array.prototype.slice.call(document.querySelectorAll(".cbi-value"));

        for (var i = 0; i < rows.length; i++) {
            var title = getTitleText(rows[i]);

            for (var j = 0; j < names.length; j++) {
                if (title === names[j]) {
                    return rows[i];
                }
            }
        }

        return null;
    }

    function createRow() {
        var current = localStorage.getItem(STORAGE_KEY) || "particles";

        var row = document.createElement("div");
        row.id = "proton-login-animation-row";
        row.className = "cbi-value";

        var title = document.createElement("label");
        title.className = "cbi-value-title";
        title.textContent = _t("Login Page Animation");

        var field = document.createElement("div");
        field.className = "cbi-value-field";

        var select = document.createElement("select");
        select.id = "proton-login-animation-select";
        select.className = "cbi-input-select";

        OPTIONS.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item[0];
            option.textContent = _t(item[1]);

            if (item[0] === current) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        var desc = document.createElement("div");
        desc.className = "cbi-value-description";
        desc.textContent = _t("Animation used on the LuCI login page. The color follows the selected Proton accent color.");

        select.addEventListener("change", function () {
            localStorage.setItem(STORAGE_KEY, select.value);

            if (window.protonSettingsSync && typeof window.protonSettingsSync.saveToUci === "function") {
                window.protonSettingsSync.saveToUci();
            }

            showToast(_t("Login animation saved"));
        });

        field.appendChild(select);
        field.appendChild(desc);

        row.appendChild(title);
        row.appendChild(field);

        return row;
    }

    function showToast(text) {
        var old = document.getElementById("proton-login-animation-toast");
        if (old) old.remove();

        var toast = document.createElement("div");
        toast.id = "proton-login-animation-toast";
        toast.textContent = text;
        toast.style.cssText =
            "position:fixed;" +
            "right:20px;" +
            "bottom:20px;" +
            "z-index:99999;" +
            "background:var(--proton-accent,#5e9eff);" +
            "color:#fff;" +
            "padding:10px 16px;" +
            "border-radius:10px;" +
            "font-weight:700;" +
            "box-shadow:0 12px 32px rgba(0,0,0,.35);";

        document.body.appendChild(toast);

        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 1800);
    }

    function inject() {
        if (document.getElementById("proton-login-animation-select")) {
            return;
        }

        var accentRow = findRowByTitle([
            "Accent Color",
            "Акцентный цвет",
            "强调色",
            "Akzentfarbe",
            "Couleur d'Accent",
            "Color de Acento",
            "Cor de Destaque"
        ]);

        var themeRow = findRowByTitle([
            "Theme Mode",
            "Режим темы"
        ]);

        var borderRow = findRowByTitle([
            "Border Radius",
            "Скругление углов"
        ]);

        var anchor = accentRow || themeRow || borderRow;

        if (!anchor || !anchor.parentNode) {
            console.warn("[Proton2025] Could not find Proton settings row for login animation");
            return;
        }

        var row = createRow();

        if (accentRow) {
            accentRow.parentNode.insertBefore(row, accentRow.nextSibling);
        } else if (themeRow) {
            themeRow.parentNode.insertBefore(row, themeRow.nextSibling);
        } else if (borderRow) {
            borderRow.parentNode.insertBefore(row, borderRow);
        }

        console.log("[Proton2025] Login animation setting injected");
    }

    function init() {
        inject();

        var attempts = 0;
        var timer = setInterval(function () {
            attempts++;
            inject();

            if (document.getElementById("proton-login-animation-select") || attempts > 20) {
                clearInterval(timer);
            }
        }, 300);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
