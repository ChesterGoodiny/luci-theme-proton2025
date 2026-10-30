/**
 * Proton2025 - LuCI Menu Integration (action dropdowns)
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 *
 * Lazy module: loaded only on network pages (WiFi / Interfaces / Devices).
 * Methods are merged into the core menu-proton2025 singleton via `protonMixin`.
 */

"use strict";
"require baseclass";

return baseclass.extend({
  protonMixin: {
  // Row actions (Restart / Stop / Edit / Delete...) used to be folded into
  // the ⋮ menu at every width. Each cell remembers its buttons; on wide
  // screens they are shown inline whenever the whole table still fits, and
  // folded only when they would overflow the table, wrap onto a second line
  // or squeeze another cell. Phones keep the per-table default.
  registerActionCell(cell, wrapper, dropdown, buttons) {
    cell._protonActions = { wrapper, dropdown, buttons: buttons.slice() };
  },

  setActionCellInline(cell, inline) {
    const actions = cell._protonActions;
    if (!actions) return;

    const target = inline ? actions.wrapper : actions.dropdown;
    actions.buttons.forEach((btn) => target.appendChild(btn));
    actions.wrapper.style.display = inline ? "" : "none";
    actions.dropdown.classList.remove("open", "open-up");
    cell.classList.toggle("actions-inline", inline);
    this.setActionColumnWidth(cell, inline);
  },

  // These tables use table-layout: fixed, so the actions column keeps its
  // share of the width whatever it holds. Inline buttons get exactly the
  // width they need (on the cell and on its header cell, which is what a
  // fixed layout reads); the other columns give up the difference.
  setActionColumnWidth(cell, inline) {
    const row = cell.parentElement;
    const table = cell.closest("table");
    const index = row ? Array.prototype.indexOf.call(row.children, cell) : -1;
    const header =
      table && index >= 0
        ? table.querySelector("tr.cbi-section-table-titles, thead tr")
        : null;
    const headerCell = header && header !== row ? header.children[index] : null;

    let width = "";
    if (inline) {
      const cs = getComputedStyle(cell);
      const needed =
        cell._protonActions.wrapper.scrollWidth +
        parseFloat(cs.paddingLeft) +
        parseFloat(cs.paddingRight) +
        2;
      width = `${Math.ceil(needed)}px`;
    }

    cell.style.width = width;
    if (headerCell) headerCell.style.width = width;
  },

  actionCellsFit(cells) {
    for (const cell of cells) {
      const actions = cell._protonActions;
      if (!actions || !cell.offsetParent) continue;

      const tops = new Set(
        actions.buttons
          .filter((btn) => btn.offsetParent)
          .map((btn) => Math.round(btn.getBoundingClientRect().top)),
      );
      if (tops.size > 1) return false;

      const row = cell.closest("tr, .tr") || cell.parentElement;
      for (const other of row ? row.children : []) {
        if (other.scrollWidth > other.clientWidth + 1) return false;
      }

      const table = cell.closest("table, .table");
      const box = table && table.parentElement;
      if (table && box && table.scrollWidth > box.clientWidth + 1) {
        return false;
      }
    }
    return true;
  },

  // Re-lays a table out when its container changes size: a hidden tab
  // becoming visible, the side menu collapsing, the page width setting.
  observeActionTable(table, box, collapseOnMobile) {
    if (!table || !box || box._protonActionsObserver) return;
    if (typeof ResizeObserver !== "function") return;

    let raf = 0;
    const observer = new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!box.isConnected) {
          observer.disconnect();
          return;
        }
        this.layoutActionCells(
          box.querySelectorAll("td.cbi-section-actions"),
          collapseOnMobile,
        );
      });
    });
    observer.observe(box);
    box._protonActionsObserver = observer;
  },

  layoutActionCells(cells, collapseOnMobile) {
    cells = Array.from(cells).filter((cell) => cell._protonActions);
    if (!cells.length) return;

    const table = cells[0].closest("table, .table");
    const box = (table && table.parentElement) || document.body;
    this.observeActionTable(table, box, collapseOnMobile);

    // A table on a hidden tab has no width to measure (LuCI still redraws
    // its rows while polling); laying it out then gave the actions column
    // only its padding and the buttons spilled out when the tab was shown.
    // Leave it alone: the ResizeObserver lays it out once it is visible.
    if (!box.clientWidth || (table && !table.offsetParent)) return;

    // Moving the buttons triggers the tables' MutationObservers, which call
    // this again: only re-measure when a cell is new or the width changed.
    const key = `${window.innerWidth}:${box.clientWidth}`;
    if (cells.every((cell) => cell._protonActionsKey === key)) return;
    cells.forEach((cell) => {
      cell._protonActionsKey = key;
    });

    if (window.innerWidth < 800) {
      cells.forEach((cell) => this.setActionCellInline(cell, !collapseOnMobile));
      return;
    }

    // Measure with every row inline; fold all rows if any of them
    // does not fit, so the table keeps one consistent look.
    cells.forEach((cell) => this.setActionCellInline(cell, true));
    if (!this.actionCellsFit(cells)) {
      cells.forEach((cell) => this.setActionCellInline(cell, false));
    }
  },

  setupGlobalDropdownHandlers() {
    if (this._globalDropdownHandlersInit) return;
    this._globalDropdownHandlersInit = true;

    document.addEventListener("click", (ev) => {
      if (
        !ev.target.closest(".actions-dropdown") &&
        !ev.target.closest(".actions-toggle")
      ) {
        document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
          d.classList.remove("open");
        });
      }
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
          d.classList.remove("open");
        });
      }
    });
  },
  setupWirelessActionsDropdown() {
    if (this._wirelessDropdownInit) return;
    this._wirelessDropdownInit = true;

    const installDropdowns = () => {
      const wirelessSection = document.querySelector("#cbi-wireless");
      if (!wirelessSection) return;

      const positionDropdown = (toggle, dropdown) => {
        if (!toggle || !dropdown || !dropdown.classList.contains("open")) {
          return;
        }

        dropdown.classList.remove("open-up");

        requestAnimationFrame(() => {
          const scrollContainer =
            toggle.closest("#cbi-wireless-wifi-device") ||
            document.getElementById("maincontent");
          const toggleRect = toggle.getBoundingClientRect();
          const containerRect = scrollContainer
            ? scrollContainer.getBoundingClientRect()
            : document.documentElement.getBoundingClientRect();

          const visibleTop = Math.max(containerRect.top, 0);
          const visibleBottom = Math.min(
            containerRect.bottom,
            window.innerHeight,
          );
          const availableAbove = toggleRect.top - visibleTop;
          const availableBelow = visibleBottom - toggleRect.bottom;
          const dropdownHeight = Math.max(
            dropdown.offsetHeight,
            dropdown.scrollHeight,
            dropdown.getBoundingClientRect().height,
          );

          if (
            availableBelow < dropdownHeight + 4 &&
            availableAbove >= dropdownHeight + 4
          ) {
            dropdown.classList.add("open-up");
          }
        });
      };

      const actionCells = wirelessSection.querySelectorAll(
        "td.cbi-section-actions",
      );

      actionCells.forEach((cell) => {
        if (cell.classList.contains("actions-dropdown-ready")) return;

        const wrapper = cell.querySelector("div");
        if (!wrapper) return;

        const buttons = Array.from(
          wrapper.querySelectorAll("button, input[type='button'], .cbi-button"),
        );
        if (buttons.length === 0) return;

        const toggle = document.createElement("button");
        toggle.className = "actions-toggle";
        toggle.innerHTML = "⋮";
        toggle.setAttribute("aria-label", "Actions menu");
        toggle.setAttribute("type", "button");

        const dropdown = document.createElement("div");
        dropdown.className = "actions-dropdown";

        buttons.forEach((btn) => {
          dropdown.appendChild(btn);
        });

        wrapper.style.display = "none";
        this.registerActionCell(cell, wrapper, dropdown, buttons);

        toggle.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();

          document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
            if (d !== dropdown) d.classList.remove("open");
            if (d !== dropdown) d.classList.remove("open-up");
          });

          dropdown.classList.toggle("open");

          if (dropdown.classList.contains("open")) {
            positionDropdown(toggle, dropdown);
          } else {
            dropdown.classList.remove("open-up");
          }
        });

        dropdown.addEventListener("click", (ev) => {
          if (ev.target.matches("button, input[type='button'], .cbi-button")) {
            setTimeout(() => {
              dropdown.classList.remove("open");
              dropdown.classList.remove("open-up");
            }, 100);
          }
        });

        cell.appendChild(toggle);
        cell.appendChild(dropdown);
        cell.classList.add("actions-dropdown-ready");
      });

      this.layoutActionCells(actionCells, true);
    };

    setTimeout(installDropdowns, 300);

    let wirelessResizeRaf = false;
    const scheduleWirelessDropdowns = () => {
      if (wirelessResizeRaf) return;
      wirelessResizeRaf = true;
      requestAnimationFrame(() => {
        wirelessResizeRaf = false;
        installDropdowns();
      });
    };
    window.addEventListener("resize", scheduleWirelessDropdowns, {
      passive: true,
    });

    let wlScheduled = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(wlScheduled);
      wlScheduled = setTimeout(installDropdowns, 150);
    });

    const wirelessContainer =
      document.querySelector("#cbi-wireless") || document.body;
    observer.observe(wirelessContainer, {
      childList: true,
      subtree: true,
    });

    window.addEventListener(
      "pagehide",
      function () {
        observer.disconnect();
        clearTimeout(wlScheduled);
        window.removeEventListener("resize", scheduleWirelessDropdowns);
      },
      { once: true },
    );
  },

  setupNetworkInterfaceActionsDropdown() {
    if (this._interfaceDropdownInit) return;
    this._interfaceDropdownInit = true;

    const installDropdowns = () => {
      const networkSection = document.querySelector("#cbi-network-interface");
      if (!networkSection) return;

      const actionCells = networkSection.querySelectorAll(
        "table.cbi-section-table td.cbi-section-actions",
      );

      actionCells.forEach((cell) => {
        if (cell.classList.contains("actions-dropdown-ready")) return;

        const wrapper = cell.querySelector("div");
        if (!wrapper) return;

        const buttons = Array.from(
          wrapper.querySelectorAll("button, input[type='button'], .cbi-button"),
        );
        if (buttons.length === 0) return;

        const toggle = document.createElement("button");
        toggle.className = "actions-toggle";
        toggle.innerHTML = "⋮";
        toggle.setAttribute("aria-label", "Actions menu");
        toggle.setAttribute("type", "button");

        const dropdown = document.createElement("div");
        dropdown.className = "actions-dropdown";

        buttons.forEach((btn) => {
          dropdown.appendChild(btn);
        });

        wrapper.style.display = "none";
        this.registerActionCell(cell, wrapper, dropdown, buttons);

        toggle.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();

          document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
            if (d !== dropdown) d.classList.remove("open");
          });

          dropdown.classList.toggle("open");
        });

        dropdown.addEventListener("click", (ev) => {
          if (ev.target.matches("button, input[type='button'], .cbi-button")) {
            setTimeout(() => {
              dropdown.classList.remove("open");
            }, 100);
          }
        });

        cell.appendChild(toggle);
        cell.appendChild(dropdown);
        cell.classList.add("actions-dropdown-ready");
      });

      this.layoutActionCells(actionCells, true);
    };

    setTimeout(installDropdowns, 300);

    let networkResizeRaf = false;
    const scheduleNetworkDropdowns = () => {
      if (networkResizeRaf) return;
      networkResizeRaf = true;
      requestAnimationFrame(() => {
        networkResizeRaf = false;
        installDropdowns();
      });
    };
    window.addEventListener("resize", scheduleNetworkDropdowns, {
      passive: true,
    });

    let netScheduled = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(netScheduled);
      netScheduled = setTimeout(installDropdowns, 150);
    });

    const networkContainer =
      document.querySelector("#cbi-network-interface") || document.body;
    observer.observe(networkContainer, {
      childList: true,
      subtree: true,
    });

    window.addEventListener(
      "pagehide",
      function () {
        observer.disconnect();
        clearTimeout(netScheduled);
        window.removeEventListener("resize", scheduleNetworkDropdowns);
      },
      { once: true },
    );
  },

  setupDevicesActionsDropdown() {
    if (this._devicesDropdownInit) return;
    this._devicesDropdownInit = true;

    const installDropdowns = () => {
      const devicesSection = document.querySelector("#cbi-network-device");
      if (!devicesSection) return;

      const actionCells = devicesSection.querySelectorAll(
        "td.cbi-section-actions",
      );

      actionCells.forEach((cell) => {
        if (cell.classList.contains("actions-dropdown-ready")) return;

        let buttons = Array.from(
          cell.querySelectorAll("button, input[type='button'], .cbi-button"),
        );

        buttons = buttons.filter(
          (btn) => !btn.classList.contains("actions-toggle"),
        );

        if (buttons.length === 0) return;

        let wrapper = cell.querySelector("div");
        if (!wrapper) {
          wrapper = document.createElement("div");
          buttons.forEach((btn) => wrapper.appendChild(btn));
          cell.insertBefore(wrapper, cell.firstChild);
        }

        const toggle = document.createElement("button");
        toggle.className = "actions-toggle";
        toggle.innerHTML = "⋮";
        toggle.setAttribute("aria-label", "Actions menu");
        toggle.setAttribute("type", "button");

        const dropdown = document.createElement("div");
        dropdown.className = "actions-dropdown";

        buttons.forEach((btn) => {
          dropdown.appendChild(btn);
        });

        wrapper.style.display = "none";
        this.registerActionCell(cell, wrapper, dropdown, buttons);

        toggle.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();

          document.querySelectorAll(".actions-dropdown.open").forEach((d) => {
            if (d !== dropdown) d.classList.remove("open");
          });

          dropdown.classList.toggle("open");
        });

        dropdown.addEventListener("click", (ev) => {
          if (ev.target.matches("button, input[type='button'], .cbi-button")) {
            setTimeout(() => {
              dropdown.classList.remove("open");
            }, 100);
          }
        });

        cell.appendChild(toggle);
        cell.appendChild(dropdown);
        cell.classList.add("actions-dropdown-ready");
      });

      this.layoutActionCells(actionCells, false);
    };

    setTimeout(installDropdowns, 300);
    setTimeout(installDropdowns, 600); // Additional attempt after longer delay
    setTimeout(installDropdowns, 1000); // Final attempt for slow-loading content

    let deviceResizeRaf = false;
    const scheduleDeviceDropdowns = () => {
      if (deviceResizeRaf) return;
      deviceResizeRaf = true;
      requestAnimationFrame(() => {
        deviceResizeRaf = false;
        installDropdowns();
      });
    };
    window.addEventListener("resize", scheduleDeviceDropdowns, {
      passive: true,
    });

    let devScheduled = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(devScheduled);
      devScheduled = setTimeout(installDropdowns, 150);
    });

    const devicesContainer =
      document.querySelector("#cbi-network-device") || document.body;
    observer.observe(devicesContainer, {
      childList: true,
      subtree: true,
    });

    let tabScheduled = 0;
    const tabObserver = new MutationObserver(() => {
      const devicesSection = document.querySelector("#cbi-network-device");
      if (devicesSection && devicesSection.dataset.tabActive === "true") {
        clearTimeout(tabScheduled);
        tabScheduled = setTimeout(installDropdowns, 200);
      }
    });

    const cbiNetwork = document.querySelector("#cbi-network");
    if (cbiNetwork) {
      tabObserver.observe(cbiNetwork, {
        attributes: true,
        attributeFilter: ["data-tab-active"],
        subtree: true,
      });
    }

    window.addEventListener(
      "pagehide",
      function () {
        observer.disconnect();
        tabObserver.disconnect();
        clearTimeout(devScheduled);
        clearTimeout(tabScheduled);
        window.removeEventListener("resize", installDropdowns);
      },
      { once: true },
    );
  },
  },
});
