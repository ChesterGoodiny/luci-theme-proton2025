(function () {
  "use strict";

  var STORAGE_KEY = "proton-login-animation";
  var BRANDING_KEY = "proton-login-branding";
  var LOGO_KEY = "proton-login-logo";
  var NAME_KEY = "proton-login-name";
  var LOGO_ONLY_KEY = "proton-login-logo-only";

  var safeStorage = {
    get: function (key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    },
    removeItem: function (key) {
      return this.remove(key);
    },
  };
  var LOGO_MAX_BYTES = 200 * 1024;
  var LOGO_MAX = 300000;

  function flushToUci() {
    if (
      window.protonSettingsSync &&
      typeof window.protonSettingsSync.saveToUci === "function"
    ) {
      window.protonSettingsSync.saveToUci();
    }
  }

  function refreshHostnameLogo() {
    if (typeof window.protonApplyHostnameLogo === "function") {
      window.protonApplyHostnameLogo();
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
    ["underwater", tr("Underwater Depths")],
  ];

  function findRowByControlId(id, root) {
    var container = root || document;
    var control = container.querySelector("#" + id);

    return control && control.closest ? control.closest(".cbi-value") : null;
  }

  function createRow() {
    var current = safeStorage.get(STORAGE_KEY) || "particles";

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
      "Animation used on the LuCI login page. The color follows the selected Proton accent color.",
    );

    select.addEventListener("change", function () {
      safeStorage.set(STORAGE_KEY, select.value);

      window.dispatchEvent(
        new CustomEvent("proton-login-animation-change", {
          detail: { value: select.value },
        }),
      );

      if (
        window.protonSettingsSync &&
        typeof window.protonSettingsSync.saveToUci === "function"
      ) {
        window.protonSettingsSync.saveToUci();
      }

      showToast(
        tr("Login animation saved"),
        tr("Login Page Animation"),
        "success",
      );
    });

    field.appendChild(select);
    field.appendChild(desc);

    row.appendChild(title);
    row.appendChild(field);

    return row;
  }

  function createBrandingRow() {
    var on = safeStorage.get(BRANDING_KEY) === "true";
    var logoOnly = safeStorage.get(LOGO_ONLY_KEY) === "true";

    var row = document.createElement("div");
    row.id = "proton-login-branding-row";
    row.className = "cbi-value";

    var title = document.createElement("label");
    title.className = "cbi-value-title";
    title.setAttribute("for", "proton-login-branding-check");
    title.textContent = tr("Custom login branding");

    var field = document.createElement("div");
    field.className = "cbi-value-field";

    var cbWrap = document.createElement("span");
    cbWrap.style.cssText = "display:inline-flex;align-items:center;";
    var input = document.createElement("input");
    input.id = "proton-login-branding-check";
    input.type = "checkbox";
    input.checked = on;
    cbWrap.appendChild(input);

    var nameWrap = document.createElement("div");
    nameWrap.id = "proton-login-name-controls";
    nameWrap.style.cssText =
      "display:" + (on ? "flex" : "none") + ";flex-direction:column;gap:6px;";

    var nameLabel = document.createElement("span");
    nameLabel.textContent = tr("Name on login screen:");
    nameLabel.style.cssText =
      "font-size:0.85rem;color:var(--proton-fg-secondary);";

    var nameInput = document.createElement("input");
    nameInput.id = "proton-login-name-input";
    nameInput.type = "text";
    nameInput.style.cssText = "max-width:240px;";
    var savedName = safeStorage.get(NAME_KEY);
    nameInput.value =
      savedName !== null && savedName !== ""
        ? savedName
        : window.protonHostname || "";

    nameInput.addEventListener("input", function () {
      var v = nameInput.value.trim();
      var host = window.protonHostname || "";
      safeStorage.set(NAME_KEY, v === host ? "" : v);
    });

    nameWrap.appendChild(nameLabel);
    nameWrap.appendChild(nameInput);

    var modeWrap = document.createElement("div");
    modeWrap.id = "proton-login-mode-controls";
    modeWrap.style.cssText = "display:flex;flex-direction:column;gap:6px;";

    var modeLabel = document.createElement("span");
    modeLabel.textContent = tr("What to show:");
    modeLabel.style.cssText =
      "font-size:0.85rem;color:var(--proton-fg-secondary);";

    var seg = document.createElement("div");
    seg.className = "proton-seg";
    seg.setAttribute("role", "radiogroup");

    function makeSeg(value, text, checked) {
      var lab = document.createElement("label");
      lab.className =
        "proton-seg-option" + (checked ? " proton-seg-active" : "");
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

    var modeRow = document.createElement("div");
    modeRow.id = "proton-login-mode-row";
    modeRow.style.cssText =
      "display:" +
      (on ? "flex" : "none") +
      ";flex-wrap:wrap;align-items:flex-end;gap:16px;margin-top:12px;";
    modeRow.appendChild(modeWrap);
    modeRow.appendChild(nameWrap);

    function updateNameVisibility() {
      var showName = on && !segLogo.input.checked;
      nameWrap.style.display = showName ? "flex" : "none";
    }

    function applyMode(logoOnlyChecked) {
      segBoth.label.classList.toggle("proton-seg-active", !logoOnlyChecked);
      segLogo.label.classList.toggle("proton-seg-active", logoOnlyChecked);
      safeStorage.set(LOGO_ONLY_KEY, logoOnlyChecked ? "true" : "false");
      updateNameVisibility();
    }
    updateNameVisibility();

    segBoth.input.addEventListener("change", function () {
      if (!segBoth.input.checked) return;
      applyMode(false);
      flushToUci();
      showToast(
        tr("Showing logo and name"),
        tr("Custom login branding"),
        "success",
      );
    });
    segLogo.input.addEventListener("change", function () {
      if (!segLogo.input.checked) return;
      applyMode(true);
      flushToUci();
      showToast(
        tr("Showing logo only"),
        tr("Custom login branding"),
        "success",
      );
    });

    var logo = document.createElement("div");
    logo.id = "proton-login-logo-controls";
    logo.style.cssText =
      "display:" +
      (on ? "flex" : "none") +
      ";align-items:center;flex-wrap:wrap;gap:10px;margin-top:12px;";

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
      var data = safeStorage.get(LOGO_KEY);
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
      'On the login page, show the router name instead of "Proton2025" and an optional uploaded logo. SVG or small PNG (≤ 200 KB) recommended.',
    );

    input.addEventListener("change", function () {
      safeStorage.set(BRANDING_KEY, input.checked ? "true" : "false");
      on = input.checked;
      modeRow.style.display = on ? "flex" : "none";
      logo.style.display = on ? "flex" : "none";
      updateNameVisibility();
      flushToUci();
      refreshHostnameLogo();
      showToast(
        tr("Login branding saved"),
        tr("Custom login branding"),
        "success",
      );
    });

    file.addEventListener("change", function () {
      var f = file.files && file.files[0];
      if (!f) return;
      if (f.size > LOGO_MAX_BYTES) {
        showToast(
          tr("Logo is too large (max 200 KB). Use a smaller image or an SVG."),
          tr("Custom login branding"),
          "warning",
        );
        file.value = "";
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var data = String(reader.result || "");
        if (data.length > LOGO_MAX) {
          showToast(
            tr("Logo is too large. Use a smaller image or an SVG."),
            tr("Custom login branding"),
            "warning",
          );
          file.value = "";
          return;
        }
        safeStorage.set(LOGO_KEY, data);
        file.value = "";
        refreshStatus();
        flushToUci();
        refreshHostnameLogo();
        showToast(tr("Logo uploaded"), tr("Custom login branding"), "success");
      };
      reader.readAsDataURL(f);
    });

    clear.addEventListener("click", function () {
      safeStorage.set(LOGO_KEY, "");
      file.value = "";
      refreshStatus();
      flushToUci();
      refreshHostnameLogo();
      showToast(tr("Logo removed"), tr("Custom login branding"), "success");
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
        animationRow.nextSibling,
      );
    }
  }

  var NOTIFY_TIMEOUT = 4000;

  function showToast(text, title, type) {
    var host = document.body;
    if (!host) return;

    var old = document.getElementById("proton-login-settings-notify");
    if (old) old.remove();

    var alert = document.createElement("div");
    alert.id = "proton-login-settings-notify";
    alert.className = "alert-message " + (type || "success");
    alert.dataset.protonManaged = "true";
    alert.dataset.protonTimeout = String(NOTIFY_TIMEOUT);

    var heading = document.createElement("h4");
    heading.textContent = title || tr("Proton2025 Theme Settings");
    alert.appendChild(heading);

    var body = document.createElement("p");
    body.textContent = text;
    alert.appendChild(body);

    host.appendChild(alert);

    setTimeout(function () {
      if (alert.parentNode && !alert.dataset.floatingInit) alert.remove();
    }, NOTIFY_TIMEOUT + 1000);
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

      if (
        document.getElementById("proton-login-animation-select") ||
        attempts > 20
      ) {
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
        subtree: true,
      });

      window.addEventListener(
        "pagehide",
        function () {
          clearTimeout(observerTimer);
          clearInterval(timer);

          if (window.__protonLoginAnimationObserver) {
            window.__protonLoginAnimationObserver.disconnect();
            window.__protonLoginAnimationObserver = null;
          }
        },
        { once: true },
      );
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
