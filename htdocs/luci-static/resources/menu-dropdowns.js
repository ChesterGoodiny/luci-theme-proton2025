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
      if (window.innerWidth < 800) return;

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
