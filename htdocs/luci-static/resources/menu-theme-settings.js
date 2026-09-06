/**
 * Proton2025 - LuCI Menu Integration (theme settings UI)
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 *
 * Lazy module: loaded only on the System settings page (admin-system-system).
 * Methods are merged into the core menu-proton2025 singleton via `protonMixin`.
 */

"use strict";
"require baseclass";
"require dom";

var defined_E =
  typeof E !== "undefined"
    ? E
    : function (tag, attr, children) {
        return dom.create(tag, attr, children);
      };
var E = defined_E;

return baseclass.extend({
  protonMixin: {
    initThemeSettings() {
      if (!document.body.dataset.page?.includes("admin-system-system")) return;

      if (this._themeSettingsInit) return;
      this._themeSettingsInit = true;

      const tryMount = () => {
        if (document.getElementById("proton-theme-settings")) {
          this.maybeFocusSearchIndexPanelFromHash();
          return true;
        }
        const designField = document.querySelector(
          '[data-name="_mediaurlbase"]',
        );
        if (!designField) return false;

        const parentContainer = designField.closest(".cbi-section-node");
        if (!parentContainer) return false;

        const tableFiltersField = parentContainer.querySelector(
          '[data-name="_tablefilters"]',
        );
        const insertAfterField = tableFiltersField || designField;

        const defaultZoom = "100";
        const storedThemeMode = localStorage.getItem("proton-theme-mode");
        const settings = {
          themeMode:
            storedThemeMode === "light" || storedThemeMode === "dark"
              ? storedThemeMode
              : "auto",
          accentColor: localStorage.getItem("proton-accent-color") || "blue",
          accentCustom:
            localStorage.getItem("proton-accent-custom") || "#5e9eff",
          borderRadius:
            localStorage.getItem("proton-border-radius") || "default",
          tabOutline: localStorage.getItem("proton-tab-outline") === "true",
          tabsStyle: ["classic", "proton"].includes(
            localStorage.getItem("proton-tab-style"),
          )
            ? localStorage.getItem("proton-tab-style")
            : "modern",
          backgroundPattern: (
            localStorage.getItem("proton-background-pattern") || "none"
          ).replace(/^noise$/, "stars"),
          patternScale: parseInt(
            localStorage.getItem("proton-pattern-scale") || "100",
          ),
          zoom: parseInt(localStorage.getItem("proton-zoom") || defaultZoom),
          pageWidth: parseInt(localStorage.getItem("proton-page-width") || "0"),
          menuMode:
            localStorage.getItem("proton-menu-mode") === "side"
              ? "side"
              : "top",
          animations: localStorage.getItem("proton-animations") !== "false",
          transparency: localStorage.getItem("proton-transparency") !== "false",
          logHighlight:
            localStorage.getItem("proton-log-highlight") !== "false",
          customFont: localStorage.getItem("proton-custom-font") !== "false",
          clientRouting: localStorage.getItem("proton-client-routing") === "on",
        };

        const t = (key) => (window.protonT ? window.protonT(key) : key);

        const settingsHTML = `
        <div id="proton-theme-settings" class="proton-settings-card">
          <div class="proton-settings-card-head">
            <h4 class="proton-settings-card-title">${t(
              "Proton2025 Theme Settings",
            )}</h4>
          </div>

          <div class="proton-tabs-navigation" role="tablist">
            <button type="button" class="proton-tab-button active" data-tab="appearance" role="tab" aria-selected="true">${t("Appearance")}</button>
            <button type="button" class="proton-tab-button" data-tab="layout" role="tab" aria-selected="false">${t("Layout")}</button>
            <button type="button" class="proton-tab-button" data-tab="features" role="tab" aria-selected="false">${t("Features")}</button>
            <button type="button" class="proton-tab-button" data-tab="tools" role="tab" aria-selected="false">${t("Tools")}</button>
          </div>

          <div class="proton-tab-content active" id="tab-appearance" role="tabpanel">

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-mode-select">${t(
              "Theme Mode",
            )}</label>
            <div class="cbi-value-field">
              <select id="proton-mode-select" class="cbi-input-select">
                <option value="auto" ${
                  settings.themeMode === "auto" ? "selected" : ""
                }>${t("Auto")} (${t("System")})</option>
                <option value="dark" ${
                  settings.themeMode === "dark" ? "selected" : ""
                }>${t("Dark")}</option>
                <option value="light" ${
                  settings.themeMode === "light" ? "selected" : ""
                }>${t("Light")}</option>
              </select>
              <div class="cbi-value-description">${t(
                "Choose light, dark, or follow system theme",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-accent-select">${t(
              "Accent Color",
            )}</label>
            <div class="cbi-value-field">
              <div style="display: flex; align-items: center; gap: 10px;">
                <select id="proton-accent-select" class="cbi-input-select" style="flex: 1 1 auto; min-width: 0;">
                  <option value="default" ${
                    settings.accentColor === "default" ? "selected" : ""
                  }>${t("Neutral")}</option>
                  <option value="blue" ${
                    settings.accentColor === "blue" ? "selected" : ""
                  }>${t("Blue")} (${t("Default")})</option>
                  <option value="purple" ${
                    settings.accentColor === "purple" ? "selected" : ""
                  }>${t("Purple")}</option>
                  <option value="green" ${
                    settings.accentColor === "green" ? "selected" : ""
                  }>${t("Green")}</option>
                  <option value="orange" ${
                    settings.accentColor === "orange" ? "selected" : ""
                  }>${t("Orange")}</option>
                  <option value="red" ${
                    settings.accentColor === "red" ? "selected" : ""
                  }>${t("Red")}</option>
                  <option value="custom" ${
                    settings.accentColor === "custom" ? "selected" : ""
                  }>${t("Custom")}</option>
                </select>
                <span id="proton-accent-custom-row" style="display: ${
                  settings.accentColor === "custom" ? "inline-flex" : "none"
                }; align-items: center; gap: 8px; flex: 0 0 auto;">
                  <input type="color" id="proton-accent-custom-color" value="${
                    settings.accentCustom
                  }" title="${t(
                    "Custom Color",
                  )}" class="proton-accent-color-input" style="width: 40px; height: 34px; cursor: pointer; border-radius: var(--proton-radius-sm);">
                  <input type="text" id="proton-accent-custom-hex" value="${
                    settings.accentCustom
                  }" maxlength="7" spellcheck="false" autocomplete="off" placeholder="#5e9eff" style="width: 90px; flex: 0 0 auto; font-family: monospace; text-transform: lowercase;">
                </span>
              </div>
              <div class="cbi-value-description">${t(
                "Choose theme accent color",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-radius-select">${t(
              "Border Radius",
            )}</label>
            <div class="cbi-value-field">
              <select id="proton-radius-select" class="cbi-input-select">
                  <option value="sharp" ${
                    settings.borderRadius === "sharp" ? "selected" : ""
                  }>${t("Sharp")}</option>
                  <option value="default" ${
                    settings.borderRadius === "default" ? "selected" : ""
                  }>${t("Rounded")} (${t("Default")})</option>
                  <option value="extra" ${
                    settings.borderRadius === "extra" ? "selected" : ""
                  }>${t("Extra Rounded")}</option>
                </select>
              <div class="cbi-value-description">${t(
                "Corner rounding style",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-tab-outline-check">${t(
              "Tab outlines",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-tab-outline-check" type="checkbox" ${
                  settings.tabOutline ? "checked" : ""
                }>
                <label for="proton-tab-outline-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Outline inactive tabs on LuCI pages",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-tab-style-select">${t(
              "Tab Style",
            )}</label>
            <div class="cbi-value-field">
              <select id="proton-tab-style-select" class="cbi-input-select">
                <option value="modern" ${
                  settings.tabsStyle === "modern" ? "selected" : ""
                }>${t("Modern tabs")}</option>
                <option value="classic" ${
                  settings.tabsStyle === "classic" ? "selected" : ""
                }>${t("Classic LuCI tabs")}</option>
                <option value="proton" ${
                  settings.tabsStyle === "proton" ? "selected" : ""
                }>${t("Old Proton tabs")}</option>
              </select>
              <div class="cbi-value-description">${t(
                "Choose the appearance of LuCI page tabs. Navigation and page addresses stay unchanged.",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-background-pattern-select">${t(
              "Background Pattern",
            )}</label>
            <div class="cbi-value-field">
              <select id="proton-background-pattern-select" class="cbi-input-select">
                <option value="none" ${
                  settings.backgroundPattern === "none" ? "selected" : ""
                }>${t("None")}</option>
                <option value="grid" ${
                  settings.backgroundPattern === "grid" ? "selected" : ""
                }>${t("Grid")}</option>
                <option value="dots" ${
                  settings.backgroundPattern === "dots" ? "selected" : ""
                }>${t("Dots")}</option>
                <option value="stars" ${
                  settings.backgroundPattern === "stars" ? "selected" : ""
                }>${t("Stars")}</option>
              </select>
              <div class="cbi-value-description">${t(
                "Background texture behind the interface",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-animations-check">${t(
              "Animations",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-animations-check" type="checkbox" ${
                  settings.animations ? "checked" : ""
                }>
                <label for="proton-animations-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Enable smooth transitions and effects",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-transparency-check">${t(
              "Transparency",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-transparency-check" type="checkbox" ${
                  settings.transparency ? "checked" : ""
                }>
                <label for="proton-transparency-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Enable blur and transparency effects",
              )}</div>
            </div>
          </div>

          </div>

          <div class="proton-tab-content" id="tab-layout" role="tabpanel">

          <div class="cbi-value" id="proton-pattern-size-row" style="display: ${settings.backgroundPattern !== "none" ? "flex" : "none"};">
            <label class="cbi-value-title" for="proton-pattern-scale-range">${t(
              "Pattern size",
            )} <span id="proton-pattern-scale-value">${settings.patternScale}%</span></label>
            <div class="cbi-value-field">
              <div style="display: flex; align-items: center; gap: 12px;">
                <button type="button" id="proton-pattern-scale-minus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">−</button>
                <input type="range" id="proton-pattern-scale-range" min="50" max="200" step="10" value="${
                  settings.patternScale
                }" style="flex: 1; accent-color: var(--proton-accent);">
                <button type="button" id="proton-pattern-scale-plus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">+</button>
                <button type="button" id="proton-pattern-scale-reset" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">${t(
                  "Reset",
                )}</button>
              </div>
              <div class="cbi-value-description">${t(
                "Size of the background pattern",
              )} (50% - 200%)</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-zoom-range">${t(
              "Zoom",
            )} <span id="proton-zoom-value">${settings.zoom}%</span></label>
            <div class="cbi-value-field">
              <div style="display: flex; align-items: center; gap: 12px;">
                <button type="button" id="proton-zoom-minus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">−</button>
                <input type="range" id="proton-zoom-range" min="75" max="150" step="5" value="${
                  settings.zoom
                }" style="flex: 1; accent-color: var(--proton-accent);">
                <button type="button" id="proton-zoom-plus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">+</button>
                <button type="button" id="proton-zoom-reset" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">${t(
                  "Reset",
                )}</button>
              </div>
              <div class="cbi-value-description">${t(
                "Interface scale",
              )} (75% - 150%)</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-page-width-check">${t(
              "Page Width",
            )} <span id="proton-page-width-value">${
              settings.pageWidth >= 100
                ? "100% (" + t("Full width") + ")"
                : settings.pageWidth > 0
                  ? settings.pageWidth + "%"
                  : ""
            }</span></label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox" style="margin-bottom: 8px;">
                <input id="proton-page-width-check" type="checkbox" ${
                  settings.pageWidth > 0 ? "checked" : ""
                }>
                <label for="proton-page-width-check"></label>
              </div>
              <div id="proton-page-width-slider" style="display: ${settings.pageWidth > 0 ? "flex" : "none"}; align-items: center; gap: 12px; margin-top: 8px;">
                <button type="button" id="proton-page-width-minus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">−</button>
                <input type="range" id="proton-page-width-range" min="50" max="100" step="5" value="${
                  settings.pageWidth > 0 ? settings.pageWidth : 80
                }" style="flex: 1; accent-color: var(--proton-accent);">
                <button type="button" id="proton-page-width-plus" class="cbi-button" style="padding: 0.4rem 0.8rem; min-width: auto;">+</button>
              </div>
              <div class="cbi-value-description">${t(
                "Content area width",
              )} (50% - 100%)</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-menu-mode-select">${t(
              "Desktop Menu Layout",
            )}</label>
            <div class="cbi-value-field">
              <select id="proton-menu-mode-select" class="cbi-input-select">
                <option value="top" ${
                  settings.menuMode === "top" ? "selected" : ""
                }>${t("Top navigation")}</option>
                <option value="side" ${
                  settings.menuMode === "side" ? "selected" : ""
                }>${t("Side panel")}</option>
              </select>
              <div class="cbi-value-description">${t(
                "Where the main menu is placed on desktop screens. Mobile always uses the slide-out menu.",
              )}</div>
            </div>
          </div>

          </div>

          <div class="proton-tab-content" id="tab-features" role="tabpanel">

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-log-highlight-check">${t(
              "Log Highlighting",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-log-highlight-check" type="checkbox" ${
                  settings.logHighlight ? "checked" : ""
                }>
                <label for="proton-log-highlight-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Custom log viewer with syntax highlighting, line numbers, and toolbar on System Log and Kernel Log pages.",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-custom-font-check">${t(
              "Custom Font (Inter)",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-custom-font-check" type="checkbox" ${
                  settings.customFont ? "checked" : ""
                }>
                <label for="proton-custom-font-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Use the built-in Inter font for consistent typography across all devices. Disable to use the default system font.",
              )}</div>
            </div>
          </div>

          <div class="cbi-value">
            <label class="cbi-value-title" for="proton-client-routing-check">${t(
              "Client-side navigation (experimental)",
            )}</label>
            <div class="cbi-value-field">
              <div class="cbi-checkbox">
                <input id="proton-client-routing-check" type="checkbox" ${
                  settings.clientRouting ? "checked" : ""
                }>
                <label for="proton-client-routing-check"></label>
              </div>
              <div class="cbi-value-description">${t(
                "Navigate between pages without full reloads (SPA). Experimental — disable if you notice issues. A full page reload applies the change.",
              )}</div>
            </div>
          </div>

          </div>

          <div class="proton-tab-content" id="tab-tools" role="tabpanel">

          <div class="cbi-value proton-update-setting">
            <label class="cbi-value-title" for="proton-update-check">${t(
              "Proton2025 Update",
            )}</label>
            <div class="cbi-value-field">
              <div class="proton-update-buttons">
                <button type="button" id="proton-update-check" class="cbi-button cbi-button-action">${t(
                  "Check for Updates",
                )}</button>
                <button type="button" id="proton-update-install" class="cbi-button cbi-button-positive" style="display: none;">${t(
                  "Install Update",
                )}</button>
                <a id="proton-update-release" class="cbi-button" href="https://github.com/ChesterGoodiny/luci-theme-proton2025/releases/latest" target="_blank" rel="noopener noreferrer" style="display: none;">${t(
                  "Open Release Page",
                )}</a>
              </div>
              <div class="cbi-value-description proton-update-meta">
                <div>${t("Current version")}: <strong id="proton-update-current">—</strong></div>
                <div>${t("Latest version")}: <strong id="proton-update-latest">—</strong></div>
                <div id="proton-update-status">${t(
                  "Click the button to check for a new Proton2025 release.",
                )}</div>
              </div>
            </div>
          </div>

          <div id="proton-search-index-panel" class="cbi-value proton-search-index-setting proton-search-index-panel">
            <label class="cbi-value-title" for="proton-search-index-run">${t(
              "Search Page Index",
            )}</label>
            <div class="cbi-value-field">
              <div class="proton-search-index-toolbar">
              <button type="button" id="proton-search-index-run" class="cbi-button cbi-button-action">${t(
                "Index Pages Now",
              )}</button>
              <div class="proton-search-index-field proton-search-index-field-size">
                <div class="proton-search-index-label">${t(
                  "Indexed Data Size",
                )}</div>
                <div id="proton-search-index-size" class="proton-search-index-size">0 B</div>
              </div>
              <button type="button" id="proton-search-index-clear" class="cbi-button proton-search-index-btn proton-search-index-btn-secondary proton-search-index-btn-icon" title="${t(
                "Clear Indexed Data",
              )}" aria-label="${t("Clear Indexed Data")}">
                <svg class="proton-search-index-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </div>
              <div class="cbi-value-description proton-search-index-description">${t(
                "Build or clear the cached LuCI search index manually when menu pages change.",
              )}</div>
            <div id="proton-search-index-status" class="cbi-value-description proton-search-index-status" aria-live="polite">${t(
              "Search index is ready to be built.",
            )}</div>
            <div id="proton-search-index-log-root" class="proton-search-index-log">
              <button type="button" id="proton-search-index-log-toggle" class="proton-search-index-log-toggle" aria-expanded="false" aria-controls="proton-search-index-log-content">
                <span class="proton-search-index-log-title">${t(
                  "Activity Log",
                )}</span>
                <svg class="proton-search-index-log-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div id="proton-search-index-log-content" class="proton-search-index-log-content" aria-live="polite" hidden>
                <div id="proton-search-index-log-live" class="proton-search-index-log-live" hidden></div>
                <div id="proton-search-index-log-list" class="proton-search-index-log-list"></div>
                <div id="proton-search-index-log-empty" class="proton-search-index-log-empty">${t(
                  "No activity recorded yet.",
                )}</div>
              </div>
            </div>
            </div>
          </div>

          </div>
        </div>
      `;

        const backupHTML = `
        <div id="proton-backup-restore" class="proton-backup-section">
          <div class="proton-backup-inner">
            <div class="proton-backup-head">
              <h4 class="proton-backup-title">${t("Backup & Restore")}</h4>
              <div class="cbi-value-description proton-backup-subtitle">${t(
                "Export your theme settings to a file or import from a previously saved backup.",
              )}</div>
            </div>
            <div class="proton-backup-actions">
              <button type="button" id="proton-export-settings" class="cbi-button cbi-button-action proton-backup-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="proton-backup-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${t(
                  "Export Settings",
                )}
              </button>
              <button type="button" id="proton-import-settings" class="cbi-button proton-backup-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="proton-backup-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>${t(
                  "Import Settings",
                )}
              </button>
              <button type="button" id="proton-reset-settings" class="cbi-button cbi-button-negative proton-backup-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="proton-backup-icon"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>${t(
                  "Reset to Defaults",
                )}
              </button>
              <input type="file" id="proton-import-file" accept=".json" style="display: none;">
            </div>
          </div>
        </div>
      `;

        insertAfterField.insertAdjacentHTML("afterend", settingsHTML);

        const toolsTab = document.getElementById("tab-tools");
        if (toolsTab) {
          toolsTab.insertAdjacentHTML("beforeend", backupHTML);
        }

        this.applyThemeSettings(settings);

        const tabButtons = document.querySelectorAll(".proton-tab-button");
        const tabContents = document.querySelectorAll(".proton-tab-content");

        tabButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const tabName = button.dataset.tab;

            tabButtons.forEach((btn) => {
              btn.classList.remove("active");
              btn.setAttribute("aria-selected", "false");
            });
            tabContents.forEach((content) =>
              content.classList.remove("active"),
            );

            button.classList.add("active");
            button.setAttribute("aria-selected", "true");
            const activeContent = document.getElementById(`tab-${tabName}`);
            if (activeContent) {
              activeContent.classList.add("active");
            }
          });
        });

        const modeSelect = document.getElementById("proton-mode-select");
        const accentSelect = document.getElementById("proton-accent-select");
        const radiusSelect = document.getElementById("proton-radius-select");
        const fontsizeSelect = document.getElementById(
          "proton-fontsize-select",
        );
        const animationsCheck = document.getElementById(
          "proton-animations-check",
        );
        const transparencyCheck = document.getElementById(
          "proton-transparency-check",
        );

        modeSelect?.addEventListener("change", (e) => {
          const mode = e.target.value;
          localStorage.setItem("proton-theme-mode", mode);
          this.applyThemeMode(mode);
          if (zoomRange) updateSliderFill(zoomRange);
          if (pageWidthRange) updateSliderFill(pageWidthRange);
          if (patternScaleRange) updateSliderFill(patternScaleRange);
        });

        const accentCustomRow = document.getElementById(
          "proton-accent-custom-row",
        );
        const accentCustomColor = document.getElementById(
          "proton-accent-custom-color",
        );
        const accentCustomHex = document.getElementById(
          "proton-accent-custom-hex",
        );

        accentSelect?.addEventListener("change", (e) => {
          const color = e.target.value;
          localStorage.setItem("proton-accent-color", color);
          if (color === "custom") {
            const hex =
              this.normalizeHex(accentCustomColor && accentCustomColor.value) ||
              this.normalizeHex(localStorage.getItem("proton-accent-custom")) ||
              "#5e9eff";
            localStorage.setItem("proton-accent-custom", hex);
            if (accentCustomColor) accentCustomColor.value = hex;
            if (accentCustomHex) accentCustomHex.value = hex;
          }
          if (accentCustomRow) {
            accentCustomRow.style.display =
              color === "custom" ? "inline-flex" : "none";
          }
          this.applyAccentColor(color);
          if (zoomRange) updateSliderFill(zoomRange);
          if (pageWidthRange) updateSliderFill(pageWidthRange);
          if (patternScaleRange) updateSliderFill(patternScaleRange);
        });

        const applyCustomAccent = (raw, syncColor, syncHex) => {
          const hex = this.normalizeHex(raw);
          if (!hex) return;
          localStorage.setItem("proton-accent-custom", hex);
          localStorage.setItem("proton-accent-color", "custom");
          if (syncColor && accentCustomColor) accentCustomColor.value = hex;
          if (syncHex && accentCustomHex) accentCustomHex.value = hex;
          this.applyAccentColor("custom");
          if (zoomRange) updateSliderFill(zoomRange);
          if (pageWidthRange) updateSliderFill(pageWidthRange);
          if (patternScaleRange) updateSliderFill(patternScaleRange);
        };

        accentCustomColor?.addEventListener("input", (e) => {
          applyCustomAccent(e.target.value, false, true);
        });

        accentCustomHex?.addEventListener("input", (e) => {
          if (this.normalizeHex(e.target.value)) {
            applyCustomAccent(e.target.value, true, false);
          }
        });

        accentCustomHex?.addEventListener("blur", (e) => {
          const hex =
            this.normalizeHex(e.target.value) ||
            localStorage.getItem("proton-accent-custom") ||
            "#5e9eff";
          e.target.value = hex;
          if (accentCustomColor) accentCustomColor.value = hex;
        });

        radiusSelect?.addEventListener("change", (e) => {
          const radius = e.target.value;
          localStorage.setItem("proton-border-radius", radius);
          this.applyBorderRadius(radius);
        });

        const patternSelect = document.getElementById(
          "proton-background-pattern-select",
        );
        patternSelect?.addEventListener("change", (e) => {
          const pattern = e.target.value;
          localStorage.setItem("proton-background-pattern", pattern);
          this.applyBackgroundPattern(pattern);
          if (pattern === "stars") this.refreshStarfield();
          const sizeRow = document.getElementById("proton-pattern-size-row");
          if (sizeRow)
            sizeRow.style.display = pattern !== "none" ? "flex" : "none";
        });

        const tabOutlineCheck = document.getElementById(
          "proton-tab-outline-check",
        );
        tabOutlineCheck?.addEventListener("change", (e) => {
          const enabled = e.target.checked;
          localStorage.setItem("proton-tab-outline", enabled);
          this.applyTabOutline(enabled);
        });

        const tabStyleSelect = document.getElementById(
          "proton-tab-style-select",
        );
        tabStyleSelect?.addEventListener("change", (e) => {
          const style = ["classic", "proton"].includes(e.target.value)
            ? e.target.value
            : "modern";
          localStorage.setItem("proton-tab-style", style);
          this.applyTabsStyle(style);
        });

        const menuModeSelect = document.getElementById(
          "proton-menu-mode-select",
        );
        menuModeSelect?.addEventListener("change", (e) => {
          const mode = e.target.value === "side" ? "side" : "top";
          localStorage.setItem("proton-menu-mode", mode);
          this.applyMenuMode(mode);
        });

        const zoomRange = document.getElementById("proton-zoom-range");
        const zoomValue = document.getElementById("proton-zoom-value");
        const zoomMinus = document.getElementById("proton-zoom-minus");
        const zoomPlus = document.getElementById("proton-zoom-plus");
        const zoomReset = document.getElementById("proton-zoom-reset");

        const updateSliderFill = (slider) => {
          if (!slider) return;
          const min = parseFloat(slider.min) || 0;
          const max = parseFloat(slider.max) || 100;
          const val = parseFloat(slider.value) || 0;
          const percent = ((val - min) / (max - min)) * 100;
          const isLight =
            document.documentElement.getAttribute("data-theme") === "light";
          const fillColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--proton-accent")
            .trim();
          const trackColor = isLight
            ? "rgba(0,0,0,0.12)"
            : "rgba(255,255,255,0.05)";
          slider.style.background = `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percent}%, ${trackColor} ${percent}%, ${trackColor} 100%)`;
        };

        if (zoomRange) updateSliderFill(zoomRange);

        const updateZoom = (displayValue) => {
          displayValue = Math.max(75, Math.min(150, parseInt(displayValue)));
          zoomRange.value = displayValue;
          zoomValue.textContent = displayValue + "%";
          localStorage.setItem("proton-zoom", displayValue);
          this.applyZoom(displayValue);
          updateSliderFill(zoomRange);

          window.dispatchEvent(
            new CustomEvent("proton-setting-changed", {
              detail: { key: "proton-zoom", value: displayValue },
            }),
          );
        };

        zoomRange?.addEventListener("input", (e) => updateZoom(e.target.value));
        zoomMinus?.addEventListener("click", () =>
          updateZoom(parseInt(zoomRange.value) - 5),
        );
        zoomPlus?.addEventListener("click", () =>
          updateZoom(parseInt(zoomRange.value) + 5),
        );
        zoomReset?.addEventListener("click", () => updateZoom(100));

        const patternScaleRange = document.getElementById(
          "proton-pattern-scale-range",
        );
        const patternScaleValue = document.getElementById(
          "proton-pattern-scale-value",
        );
        const patternScaleMinus = document.getElementById(
          "proton-pattern-scale-minus",
        );
        const patternScalePlus = document.getElementById(
          "proton-pattern-scale-plus",
        );
        const patternScaleReset = document.getElementById(
          "proton-pattern-scale-reset",
        );

        if (patternScaleRange) updateSliderFill(patternScaleRange);

        const updatePatternScale = (displayValue) => {
          displayValue = Math.max(50, Math.min(200, parseInt(displayValue)));
          patternScaleRange.value = displayValue;
          patternScaleValue.textContent = displayValue + "%";
          localStorage.setItem("proton-pattern-scale", displayValue);
          this.applyPatternScale(displayValue);
          this.refreshStarfield(); // reshuffle the sky on each size change
          updateSliderFill(patternScaleRange);

          window.dispatchEvent(
            new CustomEvent("proton-setting-changed", {
              detail: { key: "proton-pattern-scale", value: displayValue },
            }),
          );
        };

        patternScaleRange?.addEventListener("input", (e) =>
          updatePatternScale(e.target.value),
        );
        patternScaleMinus?.addEventListener("click", () =>
          updatePatternScale(parseInt(patternScaleRange.value) - 10),
        );
        patternScalePlus?.addEventListener("click", () =>
          updatePatternScale(parseInt(patternScaleRange.value) + 10),
        );
        patternScaleReset?.addEventListener("click", () =>
          updatePatternScale(100),
        );

        const pageWidthCheck = document.getElementById(
          "proton-page-width-check",
        );
        const pageWidthSlider = document.getElementById(
          "proton-page-width-slider",
        );
        const pageWidthRange = document.getElementById(
          "proton-page-width-range",
        );
        const pageWidthValue = document.getElementById(
          "proton-page-width-value",
        );
        const pageWidthMinus = document.getElementById(
          "proton-page-width-minus",
        );
        const pageWidthPlus = document.getElementById("proton-page-width-plus");

        if (pageWidthRange) updateSliderFill(pageWidthRange);

        const updatePageWidth = (val) => {
          val = Math.max(50, Math.min(100, parseInt(val)));
          pageWidthRange.value = val;
          pageWidthValue.textContent =
            val >= 100 ? "100% (" + t("Full width") + ")" : val + "%";
          localStorage.setItem("proton-page-width", val);
          this.applyPageWidth(val);
          updateSliderFill(pageWidthRange);
        };

        pageWidthCheck?.addEventListener("change", (e) => {
          const enabled = e.target.checked;
          if (pageWidthSlider)
            pageWidthSlider.style.display = enabled ? "flex" : "none";
          if (enabled) {
            const val = parseInt(pageWidthRange?.value) || 75;
            updatePageWidth(val);
          } else {
            pageWidthValue.textContent = "";
            localStorage.setItem("proton-page-width", "0");
            this.applyPageWidth(0);
          }
        });

        pageWidthRange?.addEventListener("input", (e) =>
          updatePageWidth(e.target.value),
        );
        pageWidthMinus?.addEventListener("click", () =>
          updatePageWidth(parseInt(pageWidthRange.value) - 5),
        );
        pageWidthPlus?.addEventListener("click", () =>
          updatePageWidth(parseInt(pageWidthRange.value) + 5),
        );

        animationsCheck?.addEventListener("change", (e) => {
          const enabled = e.target.checked;
          localStorage.setItem("proton-animations", enabled);
          this.applyAnimations(enabled);
        });

        transparencyCheck?.addEventListener("change", (e) => {
          const enabled = e.target.checked;
          localStorage.setItem("proton-transparency", enabled);
          this.applyTransparency(enabled);
        });

        const logHighlightCheck = document.getElementById(
          "proton-log-highlight-check",
        );
        logHighlightCheck?.addEventListener("change", (e) => {
          const enabled = e.target.checked;
          localStorage.setItem("proton-log-highlight", enabled);
        });

        const customFontCheck = document.getElementById(
          "proton-custom-font-check",
        );
        customFontCheck?.addEventListener("change", (e) => {
          const enabled = e.target.checked;
          localStorage.setItem("proton-custom-font", enabled);
          this.applyCustomFont(enabled);
        });

        const clientRoutingCheck = document.getElementById(
          "proton-client-routing-check",
        );
        clientRoutingCheck?.addEventListener("change", (e) => {
          const enabled = e.target.checked;
          localStorage.setItem("proton-client-routing", enabled ? "on" : "off");
          if (typeof L !== "undefined" && L.ui && L.ui.addNotification) {
            const notif = L.ui.addNotification(
              null,
              E(
                "p",
                t(
                  "Reload the page to apply the client-side navigation change.",
                ),
              ),
              "info",
            );
            if (notif) notif.dataset.protonManaged = "true";
          }
        });

        const callProtonSettingsRpc = async (method, args = {}) => {
          const rpcPath = (window.L && L.env && L.env.ubuspath) || "/ubus/";
          const sessionId =
            (window.L && L.env && L.env.sessionid) ||
            "00000000000000000000000000000000";

          const response = await fetch(rpcPath, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: Date.now(),
              method: "call",
              params: [sessionId, "luci.proton-settings", method, args || {}],
            }),
          });

          const result = await response.json();
          return result?.result?.[1] || null;
        };

        const updateCheckButton = document.getElementById(
          "proton-update-check",
        );
        const updateInstallButton = document.getElementById(
          "proton-update-install",
        );
        const updateReleaseLink = document.getElementById(
          "proton-update-release",
        );
        const updateCurrent = document.getElementById("proton-update-current");
        const updateLatest = document.getElementById("proton-update-latest");
        const updateStatus = document.getElementById("proton-update-status");

        const setUpdateStatus = (message, isError) => {
          if (!updateStatus) return;
          updateStatus.textContent = message;
          updateStatus.style.color = isError ? "#ff6b6b" : "";
        };

        const setUpdateInstallVisible = (visible) => {
          if (!updateInstallButton) return;
          updateInstallButton.style.display = visible ? "" : "none";
        };

        const loadInstalledThemeVersion = async () => {
          if (updateCurrent) {
            updateCurrent.textContent = t("Loading...");
          }

          try {
            const payload = await callProtonSettingsRpc("getVersion");

            if (!payload) {
              throw new Error("Empty RPC response");
            }

            if (updateCurrent) {
              updateCurrent.textContent = payload.current_version || "—";
            }

            if (updateReleaseLink && payload.release_url) {
              updateReleaseLink.href = payload.release_url;
            }

            if (!payload.success && updateCurrent) {
              updateCurrent.textContent = "—";
            }
          } catch (error) {
            if (updateCurrent) {
              updateCurrent.textContent = "—";
            }
          }
        };

        loadInstalledThemeVersion();

        updateInstallButton?.addEventListener("click", async () => {
          updateInstallButton.disabled = true;
          updateCheckButton.disabled = true;
          updateInstallButton.textContent = t("Installing...");
          setUpdateStatus(t("Installing Proton2025 update..."), false);

          try {
            const payload = await callProtonSettingsRpc("installUpdate");

            if (!payload) {
              throw new Error("Empty RPC response");
            }

            if (updateCurrent) {
              updateCurrent.textContent =
                payload.installed_version || payload.current_version || "—";
            }

            if (updateLatest) {
              updateLatest.textContent =
                payload.latest_version || payload.latest_tag || "—";
            }

            if (updateReleaseLink && payload.release_url) {
              updateReleaseLink.href = payload.release_url;
              updateReleaseLink.style.display = "";
            }

            if (!payload.success) {
              setUpdateInstallVisible(true);
              setUpdateStatus(
                payload.error || t("Failed to install update."),
                true,
              );
              return;
            }

            if (payload.update_available) {
              setUpdateInstallVisible(true);
              setUpdateStatus(
                t("Update installed, but a newer version is still available.") +
                  ` ${payload.current_version || "—"} → ${payload.latest_version || "—"}`,
                true,
              );
            } else {
              setUpdateInstallVisible(false);
              setUpdateStatus(t("Proton2025 update installed."), false);
            }
          } catch (error) {
            setUpdateInstallVisible(true);
            setUpdateStatus(
              t("Failed to install update.") +
                " " +
                (error && error.message ? error.message : String(error || "")),
              true,
            );
          } finally {
            updateInstallButton.disabled = false;
            updateCheckButton.disabled = false;
            updateInstallButton.textContent = t("Install Update");
          }
        });

        updateCheckButton?.addEventListener("click", async () => {
          updateCheckButton.disabled = true;
          updateCheckButton.textContent = t("Checking...");
          setUpdateStatus(t("Checking latest Proton2025 release..."), false);
          setUpdateInstallVisible(false);

          try {
            const payload = await callProtonSettingsRpc("checkUpdate");

            if (!payload) {
              throw new Error("Empty RPC response");
            }

            if (updateCurrent) {
              updateCurrent.textContent = payload.current_version || "—";
            }

            if (updateLatest) {
              updateLatest.textContent =
                payload.latest_version || payload.latest_tag || "—";
            }

            if (updateReleaseLink && payload.release_url) {
              updateReleaseLink.href = payload.release_url;
              updateReleaseLink.style.display = "";
            }

            if (!payload.success) {
              setUpdateInstallVisible(false);
              setUpdateStatus(
                payload.error || t("Failed to check for updates."),
                true,
              );
              return;
            }

            if (payload.update_available) {
              setUpdateInstallVisible(true);
              setUpdateStatus(
                t("A new Proton2025 version is available.") +
                  ` ${payload.current_version} → ${payload.latest_version}`,
                false,
              );
            } else {
              setUpdateInstallVisible(false);
              setUpdateStatus(t("Proton2025 is up to date."), false);
            }
          } catch (error) {
            setUpdateStatus(
              t("Failed to check for updates.") +
                " " +
                (error && error.message ? error.message : String(error || "")),
              true,
            );
          } finally {
            updateCheckButton.disabled = false;
            updateCheckButton.textContent = t("Check for Updates");
          }
        });

        const formatBytes = (bytes) => {
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
        };

        const formatIndexedDate = (timestamp) => {
          if (!timestamp) return t("Not indexed yet");

          try {
            const date = new Date(timestamp);
            if (Number.isNaN(date.getTime())) {
              return t("Not indexed yet");
            }

            const locale = document.documentElement?.lang || undefined;
            return new Intl.DateTimeFormat(locale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }).format(date);
          } catch (e) {
            return t("Not indexed yet");
          }
        };

        const getSearchIndexApi = () =>
          window.protonSearchIndex &&
          typeof window.protonSearchIndex.getState === "function"
            ? window.protonSearchIndex
            : null;

        const searchIndexRunButton = document.getElementById(
          "proton-search-index-run",
        );
        const searchIndexClearButton = document.getElementById(
          "proton-search-index-clear",
        );
        const searchIndexSize = document.getElementById(
          "proton-search-index-size",
        );
        const searchIndexStatus = document.getElementById(
          "proton-search-index-status",
        );
        const searchIndexLogToggle = document.getElementById(
          "proton-search-index-log-toggle",
        );

        this.setSearchIndexActivityExpanded(
          this.loadSearchIndexActivityExpanded(),
        );

        const updateSearchIndexUi = (state) => {
          const currentState = state || getSearchIndexApi()?.getState?.() || {};
          const status = currentState.status || {};
          const cachedEntryCount = Number(currentState.cachedEntryCount) || 0;
          const routeCount = Number(status.routeCount) || 0;
          const indexedRouteCount = Number(status.indexedRouteCount) || 0;
          const errorCount = Number(status.errorCount) || 0;

          if (searchIndexSize) {
            searchIndexSize.textContent = formatBytes(
              currentState.cacheBytes || 0,
            );
          }

          if (searchIndexRunButton) {
            const canCancel = !!status.inProgress && !!status.cancelable;
            searchIndexRunButton.disabled = !!status.inProgress && !canCancel;
            searchIndexRunButton.textContent = status.inProgress
              ? canCancel
                ? t("Cancel Indexing")
                : t("Indexing in progress...")
              : t("Index Pages Now");
          }

          if (searchIndexClearButton) {
            searchIndexClearButton.disabled = !!status.inProgress;
          }

          if (searchIndexStatus) {
            if (status.inProgress) {
              searchIndexStatus.textContent =
                t("Indexed routes") +
                `: ${indexedRouteCount}/${routeCount || "?"} · ` +
                t("Cached entries") +
                `: ${cachedEntryCount}`;
            } else if (status.canceled) {
              searchIndexStatus.textContent =
                t("Indexing canceled") +
                ` · ${t("Indexed routes")}: ${indexedRouteCount}/${routeCount || "?"}`;
            } else {
              searchIndexStatus.textContent =
                t("Cached entries") +
                `: ${cachedEntryCount} · ` +
                t("Last indexed") +
                `: ${formatIndexedDate(status.lastIndexedAt)}${
                  errorCount > 0 ? ` · ${t("Index errors")}: ${errorCount}` : ""
                }`;
            }
          }
        };

        searchIndexRunButton?.addEventListener("click", async () => {
          const api = getSearchIndexApi();

          if (api?.getState?.()?.status?.inProgress) {
            if (typeof api?.cancel === "function") {
              api.cancel("user");
            }
            return;
          }

          if (!api?.refresh) return;

          try {
            await api.refresh(true);
          } catch (error) {
            const previousState = this._lastObservedSearchIndexState;
            const failedState = api.getState();
            updateSearchIndexUi(failedState);
            this.maybeRecordSearchIndexActivity(previousState, failedState, {
              forceError: true,
              errorMessage:
                error && typeof error.message === "string"
                  ? error.message
                  : String(error || ""),
            });
            this.maybeNotifySearchIndexCompletion(null, failedState, {
              forceError: true,
            });
          }
        });

        searchIndexClearButton?.addEventListener("click", async () => {
          const confirmed = await this.protonConfirm({
            title: t("Clear Indexed Data"),
            message: t(
              "Clear indexed search data? This removes cached search pages on the router until the next indexing run.",
            ),
            confirmLabel: t("Clear Indexed Data"),
          });

          if (!confirmed) return;

          const api = getSearchIndexApi();
          if (api?.clear) {
            await api.clear();
            this.recordSearchIndexCleared();
          } else {
            updateSearchIndexUi({
              cacheBytes: 0,
              cachedEntryCount: 0,
              status: {},
            });
            this.recordSearchIndexCleared();
          }
        });

        searchIndexLogToggle?.addEventListener("click", () => {
          this.setSearchIndexActivityExpanded(
            !this.loadSearchIndexActivityExpanded(),
          );
        });

        window.addEventListener("proton-search-index-state", (event) => {
          updateSearchIndexUi(event.detail || {});
        });

        const initialSearchIndexState = getSearchIndexApi()?.getState?.() || {};
        updateSearchIndexUi(initialSearchIndexState);
        this.renderSearchIndexActivity(initialSearchIndexState);

        const PROTON_SETTINGS_KEYS = [
          "proton-theme-mode",
          "proton-accent-color",
          "proton-accent-custom",
          "proton-border-radius",
          "proton-tab-outline",
          "proton-tab-style",
          "proton-zoom",
          "proton-page-width",
          "proton-menu-mode",
          "proton-menu-collapsed",
          "proton-animations",
          "proton-transparency",
          "proton-services-log",
          "proton-log-highlight",
          "proton-custom-font",
        ];
        const showBackupStatus = (msg, isError) => {
          if (typeof L !== "undefined" && L.ui && L.ui.addNotification) {
            const notif = L.ui.addNotification(
              null,
              E("p", msg),
              isError ? "danger" : "info",
            );
            if (notif) notif.dataset.protonManaged = "true";
          } else {
            alert(msg);
          }
        };

        document
          .getElementById("proton-export-settings")
          ?.addEventListener("click", () => {
            const now = new Date();
            const data = {
              _proton_backup: true,
              _version: "1.1.0",
              _date: now.toISOString(),
            };
            PROTON_SETTINGS_KEYS.forEach((key) => {
              const val = localStorage.getItem(key);
              if (val !== null) data[key] = val;
            });
            const customWidgets = localStorage.getItem("proton-custom-widgets");
            if (customWidgets !== null) {
              data["proton-custom-widgets"] = customWidgets;
            }
            const customTemplates = localStorage.getItem(
              "proton-custom-templates",
            );
            if (customTemplates !== null) {
              data["proton-custom-templates"] = customTemplates;
            }
            const tplSnapshots = localStorage.getItem(
              "proton-template-snapshots",
            );
            if (tplSnapshots !== null) {
              data["proton-template-snapshots"] = tplSnapshots;
            }
            Object.keys(localStorage).forEach((key) => {
              if (
                key.startsWith("proton-widget-") &&
                key.endsWith("-enabled")
              ) {
                data[key] = localStorage.getItem(key);
              }
            });
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const dateStr =
              now.getFullYear() +
              "-" +
              String(now.getMonth() + 1).padStart(2, "0") +
              "-" +
              String(now.getDate()).padStart(2, "0") +
              "_" +
              String(now.getHours()).padStart(2, "0") +
              "-" +
              String(now.getMinutes()).padStart(2, "0") +
              "-" +
              String(now.getSeconds()).padStart(2, "0");
            a.download = `proton2025-settings-backup-${dateStr}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showBackupStatus(t("Settings exported successfully"), false);
          });

        document
          .getElementById("proton-reset-settings")
          ?.addEventListener("click", async () => {
            const confirmed = await this.protonConfirm({
              title: t("Reset to Defaults"),
              message: t(
                "Are you sure you want to reset all theme settings to defaults? This action cannot be undone.",
              ),
              confirmLabel: t("Reset"),
            });

            if (!confirmed) return;

            if (window.protonSettingsSync?.resetToDefaults) {
              await window.protonSettingsSync.resetToDefaults();
            } else {
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
                "proton-services-log": "false",
                "proton-log-highlight": "true",
                "proton-page-width": "",
                "proton-menu-mode": "top",
                "proton-menu-collapsed": "false",
                "proton-custom-font": "true",
              };

              Object.keys(defaults).forEach((key) => {
                localStorage.removeItem(key);
              });

              Object.entries(defaults).forEach(([key, value]) => {
                if (value) {
                  localStorage.setItem(key, value);
                }
              });

              window.location.reload();
            }
          });

        const importFileInput = document.getElementById("proton-import-file");
        document
          .getElementById("proton-import-settings")
          ?.addEventListener("click", () => {
            importFileInput?.click();
          });

        importFileInput?.addEventListener("change", (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              const data = JSON.parse(ev.target.result);
              if (!data._proton_backup) {
                showBackupStatus(t("Invalid backup file"), true);
                return;
              }

              let imported = 0;
              PROTON_SETTINGS_KEYS.forEach((key) => {
                if (key in data) {
                  localStorage.setItem(key, data[key]);
                  imported++;
                }
              });

              if ("proton-custom-widgets" in data) {
                localStorage.setItem(
                  "proton-custom-widgets",
                  data["proton-custom-widgets"],
                );
                imported++;
              }
              if ("proton-custom-templates" in data) {
                try {
                  JSON.parse(data["proton-custom-templates"]);
                  localStorage.setItem(
                    "proton-custom-templates",
                    data["proton-custom-templates"],
                  );
                  imported++;
                } catch (err) {}
              }
              if ("proton-template-snapshots" in data) {
                try {
                  JSON.parse(data["proton-template-snapshots"]);
                  localStorage.setItem(
                    "proton-template-snapshots",
                    data["proton-template-snapshots"],
                  );
                  imported++;
                } catch (err) {}
              }
              Object.keys(data).forEach((key) => {
                if (
                  key.startsWith("proton-widget-") &&
                  key.endsWith("-enabled")
                ) {
                  localStorage.setItem(key, data[key]);
                  imported++;
                }
              });

              if (imported === 0) {
                showBackupStatus(t("No settings found in file"), true);
                return;
              }

              this.loadAndApplyThemeSettings();

              this._themeSettingsInit = false;
              const panel = document.getElementById("proton-theme-settings");
              if (panel) panel.remove();
              const backupSection = document.getElementById(
                "proton-backup-restore",
              );
              if (backupSection) backupSection.remove();
              this.initThemeSettings();

              showBackupStatus(
                t("Settings imported successfully") + " (" + imported + ")",
                false,
              );
            } catch (err) {
              showBackupStatus(t("Failed to read backup file"), true);
            }
          };
          reader.readAsText(file);
          e.target.value = "";
        });

        this.maybeFocusSearchIndexPanelFromHash();

        return true;
      };

      const root = document.getElementById("maincontent") || document.body;

      if (this._themeSettingsObserver) {
        this._themeSettingsObserver.disconnect();
      }

      let remountTimer = null;
      const observer = new MutationObserver(() => {
        clearTimeout(remountTimer);
        remountTimer = setTimeout(() => {
          if (!document.body.dataset.page?.includes("admin-system-system")) {
            return;
          }

          if (document.getElementById("proton-theme-settings")) {
            return;
          }

          if (!document.querySelector('[data-name="_mediaurlbase"]')) {
            return;
          }

          this._themeSettingsInit = false;
          observer.disconnect();
          this._themeSettingsObserver = null;
          this.initThemeSettings();
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("proton-theme-settings-mounted"),
            );
          }, 200);
        }, 150);
      });

      this._themeSettingsObserver = observer;
      observer.observe(root, { childList: true, subtree: true });

      tryMount();
      setTimeout(tryMount, 300);
      setTimeout(tryMount, 800);
    },
  },
});
