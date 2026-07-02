/*
 * Proton2025 Login Animation setting injector.
 * Adds "Login Page Animation" selector to System -> System -> Language and Style.
 */
(function () {
    "use strict";

    var STORAGE_KEY = "proton-login-animation";
    var BRANDING_KEY = "proton-login-branding";
    var LOGO_KEY = "proton-login-logo";
    var NAME_KEY = "proton-login-name";
    var LOGO_ONLY_KEY = "proton-login-logo-only";
    // Logo caps: LOGO_MAX_BYTES is the source file size; LOGO_MAX is the
    // resulting data-URI length (base64 adds ~37%, so allow headroom).
    var LOGO_MAX_BYTES = 200 * 1024;
    var LOGO_MAX = 300000;

    function flushToUci() {
        if (window.protonSettingsSync && typeof window.protonSettingsSync.saveToUci === "function") {
            window.protonSettingsSync.saveToUci();
        }
    }

    function tr(key) {
        if (window.protonT && typeof window.protonT === "function") {
            return window.protonT(key);
        }

        if (window.L && typeof window.L.tr === "function") {
            var luciTranslated = window.L.tr(key);
            if (luciTranslated && luciTranslated !== key) {
                return luciTranslated;
            }
        }

        return key;
    }

    var OPTIONS = [
        ["off", tr("Off")],
        ["particles", tr("Classic Particles")],
        ["constellation", tr("Constellation")],
        ["plexus", tr("Plexus / Neural")],
        ["breathing", tr("Breathing Particles")],
        ["gravity", tr("Gravity Hover")],
        ["lowpoly", tr("Low Poly Mesh")],
        ["dataflow", tr("Data Flow")],
        ["flowfield", tr("Flow Field")],
        ["circuit", tr("Circuit Board")],
        ["packetpulses", tr("Packet Pulses")],
        ["hex", tr("Hex Grid")],
        ["underwater", tr("Underwater Depths")]
    ];

    function findRowByControlId(id, root) {
        var container = root || document;
        var control = container.querySelector("#" + id);

        return control && control.closest ? control.closest(".cbi-value") : null;
    }

    function createRow() {
        var current = localStorage.getItem(STORAGE_KEY) || "particles";

        var row = document.createElement("div");
        row.id = "proton-login-animation-row";
        row.className = "cbi-value";

        var title = document.createElement("label");
        title.className = "cbi-value-title";
        title.textContent = tr("Login Page Animation");

        var field = document.createElement("div");
        field.className = "cbi-value-field";

        var select = document.createElement("select");
        select.id = "proton-login-animation-select";
        select.className = "cbi-input-select";

        OPTIONS.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item[0];
            option.textContent = item[1];

            if (item[0] === current) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        var desc = document.createElement("div");
        desc.className = "cbi-value-description";
        desc.textContent = tr(
            "Animation used on the LuCI login page. The color follows the selected Proton accent color."
        );

        select.addEventListener("change", function () {
            localStorage.setItem(STORAGE_KEY, select.value);

            if (window.protonSettingsSync && typeof window.protonSettingsSync.saveToUci === "function") {
                window.protonSettingsSync.saveToUci();
            }

            showToast(tr("Login animation saved"));
        });

        field.appendChild(select);
        field.appendChild(desc);

        row.appendChild(title);
        row.appendChild(field);

        return row;
    }

    function createBrandingRow() {
        var on = localStorage.getItem(BRANDING_KEY) === "true";
        var logoOnly = localStorage.getItem(LOGO_ONLY_KEY) === "true";

        var row = document.createElement("div");
        row.id = "proton-login-branding-row";
        row.className = "cbi-value";

        var title = document.createElement("label");
        title.className = "cbi-value-title";
        title.setAttribute("for", "proton-login-branding-check");
        title.textContent = tr("Custom login branding");

        var field = document.createElement("div");
        field.className = "cbi-value-field";

        /* Wrap the checkbox so it is NOT a direct child of .cbi-value-field
           (which would trigger the toggle-row grid layout and scramble the
           logo controls below). */
        var cbWrap = document.createElement("span");
        cbWrap.style.cssText = "display:inline-flex;align-items:center;";
        var input = document.createElement("input");
        input.id = "proton-login-branding-check";
        input.type = "checkbox";
        input.checked = on;
        cbWrap.appendChild(input);

        /* Editable display name, pre-filled with the router hostname. */
        var nameWrap = document.createElement("div");
        nameWrap.id = "proton-login-name-controls";
        nameWrap.style.cssText =
            "display:" + (on ? "flex" : "none") +
            ";flex-direction:column;gap:6px;";

        var nameLabel = document.createElement("span");
        nameLabel.textContent = tr("Name on login screen:");
        nameLabel.style.cssText = "font-size:0.85rem;color:var(--proton-fg-secondary);";

        var nameInput = document.createElement("input");
        nameInput.id = "proton-login-name-input";
        nameInput.type = "text";
        nameInput.style.cssText = "max-width:240px;";
        var savedName = localStorage.getItem(NAME_KEY);
        nameInput.value = (savedName !== null && savedName !== "")
            ? savedName
            : (window.protonHostname || "");

        nameInput.addEventListener("input", function () {
            var v = nameInput.value.trim();
            var host = window.protonHostname || "";
            // Store empty when it equals the hostname, so the login page
            // keeps following the live hostname unless a custom name is set.
            // (settings-sync debounces the actual UCI write.)
            localStorage.setItem(NAME_KEY, v === host ? "" : v);
        });

        nameWrap.appendChild(nameLabel);
        nameWrap.appendChild(nameInput);

        /* Display-mode picker: a segmented control (two mutually exclusive
           radios) reads better than a second checkbox that crowds the
           branding one. "Logo only" hides the name and centers the logo. */
        var modeWrap = document.createElement("div");
        modeWrap.id = "proton-login-mode-controls";
        modeWrap.style.cssText = "display:flex;flex-direction:column;gap:6px;";

        var modeLabel = document.createElement("span");
        modeLabel.textContent = tr("What to show:");
        modeLabel.style.cssText = "font-size:0.85rem;color:var(--proton-fg-secondary);";

        var seg = document.createElement("div");
        seg.className = "proton-seg";
        seg.setAttribute("role", "radiogroup");

        function makeSeg(value, text, checked) {
            var lab = document.createElement("label");
            lab.className = "proton-seg-option" + (checked ? " proton-seg-active" : "");
            var radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "proton-login-mode";
            radio.value = value;
            radio.checked = checked;
            var span = document.createElement("span");
            span.textContent = text;
            lab.appendChild(radio);
            lab.appendChild(span);
            return { label: lab, input: radio };
        }

        var segBoth = makeSeg("both", tr("Logo & name"), !logoOnly);
        var segLogo = makeSeg("logo", tr("Logo only"), logoOnly);
        segBoth.input.id = "proton-login-mode-both";
        segLogo.input.id = "proton-login-mode-logo";

        seg.appendChild(segBoth.label);
        seg.appendChild(segLogo.label);
        modeWrap.appendChild(modeLabel);
        modeWrap.appendChild(seg);

        /* Put the picker and the name field on one level (side by side,
           wrapping on narrow screens), bottoms aligned. */
        var modeRow = document.createElement("div");
        modeRow.id = "proton-login-mode-row";
        modeRow.style.cssText =
            "display:" + (on ? "flex" : "none") +
            ";flex-wrap:wrap;align-items:flex-end;gap:16px;margin-top:12px;";
        modeRow.appendChild(modeWrap);
        modeRow.appendChild(nameWrap);

        // The name field is meaningless when only the logo is shown.
        function updateNameVisibility() {
            var showName = on && !segLogo.input.checked;
            nameWrap.style.display = showName ? "flex" : "none";
        }

        function applyMode(logoOnlyChecked) {
            segBoth.label.classList.toggle("proton-seg-active", !logoOnlyChecked);
            segLogo.label.classList.toggle("proton-seg-active", logoOnlyChecked);
            localStorage.setItem(LOGO_ONLY_KEY, logoOnlyChecked ? "true" : "false");
            updateNameVisibility();
        }
        updateNameVisibility();

        segBoth.input.addEventListener("change", function () {
            if (!segBoth.input.checked) return;
            applyMode(false);
            flushToUci();
            showToast(tr("Showing logo and name"));
        });
        segLogo.input.addEventListener("change", function () {
            if (!segLogo.input.checked) return;
            applyMode(true);
            flushToUci();
            showToast(tr("Showing logo only"));
        });

        var logo = document.createElement("div");
        logo.id = "proton-login-logo-controls";
        logo.style.cssText =
            "display:" + (on ? "flex" : "none") +
            ";align-items:center;flex-wrap:wrap;gap:10px;margin-top:12px;";

        // Native file input is hidden; a themed, translated button triggers
        // it (the browser "Choose File / No file chosen" text isn't
        // styleable or translatable).
        var file = document.createElement("input");
        file.id = "proton-login-logo-file";
        file.type = "file";
        file.accept = "image/png,image/jpeg,image/svg+xml,image/webp,image/gif";
        file.style.cssText = "display:none;";

        var chooseBtn = document.createElement("button");
        chooseBtn.id = "proton-login-logo-choose";
        chooseBtn.type = "button";
        chooseBtn.className = "cbi-button cbi-button-action";
        chooseBtn.textContent = tr("Choose file…");
        chooseBtn.addEventListener("click", function () {
            file.click();
        });

        var clear = document.createElement("button");
        clear.id = "proton-login-logo-clear";
        clear.type = "button";
        clear.className = "cbi-button cbi-button-remove";
        clear.textContent = tr("Remove logo");

        var status = document.createElement("span");
        status.id = "proton-login-logo-status";
        status.style.cssText = "font-size:0.85rem;color:var(--proton-muted);";

        var preview = document.createElement("img");
        preview.id = "proton-login-logo-preview";
        preview.alt = "";
        preview.style.cssText =
            "height:38px;max-width:120px;object-fit:contain;border-radius:6px;" +
            "border:1px solid var(--proton-border);padding:3px;" +
            "background:var(--proton-bg-secondary);";

        function refreshStatus() {
            var data = localStorage.getItem(LOGO_KEY);
            status.textContent = data
                ? tr("Custom logo set")
                : tr("No logo — default icon is used");
            if (data) {
                preview.src = data;
                preview.style.display = "inline-block";
            } else {
                preview.removeAttribute("src");
                preview.style.display = "none";
            }
        }
        refreshStatus();

        logo.appendChild(preview);
        logo.appendChild(chooseBtn);
        logo.appendChild(clear);
        logo.appendChild(status);
        logo.appendChild(file);

        var desc = document.createElement("div");
        desc.className = "cbi-value-description";
        desc.textContent = tr(
            "On the login page, show the router name instead of \"Proton2025\" and an optional uploaded logo. SVG or small PNG (≤ 200 KB) recommended."
        );

        input.addEventListener("change", function () {
            localStorage.setItem(BRANDING_KEY, input.checked ? "true" : "false");
            on = input.checked;
            modeRow.style.display = on ? "flex" : "none";
            logo.style.display = on ? "flex" : "none";
            updateNameVisibility();
            flushToUci();
            showToast(tr("Login branding saved"));
        });

        file.addEventListener("change", function () {
            var f = file.files && file.files[0];
            if (!f) return;
            if (f.size > LOGO_MAX_BYTES) {
                showToast(tr(
                    "Logo is too large (max 200 KB). Use a smaller image or an SVG."
                ));
                file.value = "";
                return;
            }
            var reader = new FileReader();
            reader.onload = function () {
                var data = String(reader.result || "");
                if (data.length > LOGO_MAX) {
                    showToast(tr(
                        "Logo is too large. Use a smaller image or an SVG."
                    ));
                    file.value = "";
                    return;
                }
                localStorage.setItem(LOGO_KEY, data);
                file.value = "";
                refreshStatus();
                flushToUci();
                showToast(tr("Logo uploaded"));
            };
            reader.readAsDataURL(f);
        });

        clear.addEventListener("click", function () {
            localStorage.setItem(LOGO_KEY, "");
            file.value = "";
            refreshStatus();
            flushToUci();
            showToast(tr("Logo removed"));
        });

        field.appendChild(cbWrap);
        field.appendChild(modeRow);
        field.appendChild(logo);
        field.appendChild(desc);
        row.appendChild(title);
        row.appendChild(field);

        return row;
    }

    function ensureBrandingRow(animationRow) {
        var settingsBlock = document.getElementById("proton-theme-settings");
        var existing = document.getElementById("proton-login-branding-row");

        if (existing && settingsBlock && settingsBlock.contains(existing)) {
            return;
        }
        if (existing) existing.remove();

        if (animationRow && animationRow.parentNode) {
            animationRow.parentNode.insertBefore(
                createBrandingRow(),
                animationRow.nextSibling
            );
        }
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
        var settingsBlock = document.getElementById("proton-theme-settings");

        if (!settingsBlock) {
            return;
        }

        var existingRow = document.getElementById("proton-login-animation-row");

        if (existingRow) {
            if (settingsBlock.contains(existingRow)) {
                ensureBrandingRow(existingRow);
                return;
            }

            existingRow.remove();
        }

        var accentRow = findRowByControlId("proton-accent-select", settingsBlock);
        var themeRow = findRowByControlId("proton-mode-select", settingsBlock);
        var borderRow = findRowByControlId("proton-radius-select", settingsBlock);

        var row = createRow();

        if (accentRow && accentRow.parentNode) {
            accentRow.parentNode.insertBefore(row, accentRow.nextSibling);
        } else if (themeRow && themeRow.parentNode) {
            themeRow.parentNode.insertBefore(row, themeRow.nextSibling);
        } else if (borderRow && borderRow.parentNode) {
            borderRow.parentNode.insertBefore(row, borderRow);
        } else {
            var firstValue = settingsBlock.querySelector(".cbi-value");

            if (firstValue && firstValue.parentNode) {
                firstValue.parentNode.insertBefore(row, firstValue.nextSibling);
            } else {
                settingsBlock.appendChild(row);
            }
        }

        ensureBrandingRow(row);
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

        var root = document.getElementById("maincontent") || document.body;
        if (root && !window.__protonLoginAnimationObserver) {
            var observerTimer = null;
            window.__protonLoginAnimationObserver = new MutationObserver(function () {
                clearTimeout(observerTimer);
                observerTimer = setTimeout(function () {
                    inject();
                }, 100);
            });

            window.__protonLoginAnimationObserver.observe(root, {
                childList: true,
                subtree: true
            });
        }
    }

    window.addEventListener("proton-theme-settings-mounted", function () {
        setTimeout(inject, 50);
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
