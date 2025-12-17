"use strict";
"require baseclass";
"require ui";

return baseclass.extend({
  __init__() {
    ui.menu.load().then((tree) => this.render(tree));
  },

  installAssoclistRowHoverExpand() {
    if (this._assoclistRowHoverExpandInstalled) return;
    this._assoclistRowHoverExpandInstalled = true;

    const isHoverDesktop = () =>
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const overlay = document.createElement("div");
    overlay.className = "proton-assoclist-row-hover";
    overlay.style.display = "none";
    document.body.appendChild(overlay);
    this._assoclistRowHoverOverlay = overlay;

    const hide = () => {
      overlay.style.display = "none";
      overlay.innerHTML = "";
      this._assoclistRowHoverAnchor = null;
    };

    const getHeaders = (table) => {
      let ths = Array.from(table.querySelectorAll("thead th"));
      if (!ths.length)
        ths = Array.from(
          table.querySelectorAll("tr.cbi-section-table-titles th")
        );
      if (!ths.length) ths = Array.from(table.querySelectorAll("tr th"));
      if (!ths.length) return null;

      return ths
        .map((th) => (th.innerText || th.textContent || "").trim())
        .map((s) => s.replace(/\s+/g, " "));
    };

    const getCellText = (td) => {
      const badge = td.querySelector(".ifacebadge");
      if (badge) {
        // Avoid pulling text from the tooltip container (it's always in DOM)
        const children = Array.from(badge.children || []);
        const label = children
          .filter(
            (el) =>
              el &&
              el.tagName === "SPAN" &&
              !el.classList.contains("cbi-tooltip-container")
          )
          .pop();

        const text = (label ? label.textContent : badge.textContent) || "";
        return text.trim().replace(/\s+/g, " ");
      }

      return ((td.innerText || td.textContent || "") + "")
        .trim()
        .replace(/\s+/g, " ");
    };

    const buildRowHtml = (tr) => {
      const table = tr.closest("table");
      if (!table) return "";

      const headers = getHeaders(table);
      const tds = Array.from(tr.querySelectorAll("td"));
      if (!tds.length) return "";

      const parts = [];
      for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        if (td.classList.contains("cbi-section-actions")) continue;

        const key =
          headers && headers[i]
            ? headers[i]
            : (td.getAttribute("data-title") || "").trim();

        const val = getCellText(td);

        if (!val) continue;

        const k = key ? `<span class="k">${key}:</span>` : "";
        parts.push(
          `<span class="cell">${k}<span class="v">${val}</span></span>`
        );
      }

      if (!parts.length) return "";
      return `<div class="row">${parts.join("")}</div>`;
    };

    const position = (anchor) => {
      if (!anchor || overlay.style.display === "none") return;

      const rect = anchor.getBoundingClientRect();
      const margin = 10;

      // Measure after content set
      overlay.style.left = "-9999px";
      overlay.style.top = "-9999px";
      const ow = overlay.offsetWidth;
      const oh = overlay.offsetHeight;

      let left = rect.left;
      let top = rect.top - oh - 8;

      // If not enough space above, show below
      if (top < margin) top = rect.bottom + 8;

      // Clamp to viewport
      left = Math.max(margin, Math.min(left, window.innerWidth - ow - margin));
      top = Math.max(margin, Math.min(top, window.innerHeight - oh - margin));

      overlay.style.left = `${left}px`;
      overlay.style.top = `${top}px`;
    };

    document.addEventListener(
      "mouseover",
      (ev) => {
        if (!isHoverDesktop()) return;

        const tr =
          ev.target && ev.target.closest
            ? ev.target.closest(
                "table.assoclist tbody tr, #cbi-network-device table.cbi-section-table tr.cbi-section-table-row, #cbi-network-interface table.cbi-section-table tr.cbi-section-table-row"
              )
            : null;
        if (!tr) return;

        const html = buildRowHtml(tr);
        if (!html) return;

        overlay.innerHTML = html;
        overlay.style.display = "block";
        this._assoclistRowHoverAnchor = tr;
        position(tr);
      },
      true
    );

    document.addEventListener(
      "mouseout",
      (ev) => {
        const tr =
          ev.target && ev.target.closest
            ? ev.target.closest(
                "table.assoclist tbody tr, #cbi-network-device table.cbi-section-table tr.cbi-section-table-row, #cbi-network-interface table.cbi-section-table tr.cbi-section-table-row"
              )
            : null;
        if (!tr) return;

        // If moving within the row, ignore
        if (ev.relatedTarget && tr.contains(ev.relatedTarget)) return;
        hide();
      },
      true
    );

    window.addEventListener(
      "scroll",
      () => position(this._assoclistRowHoverAnchor),
      true
    );
    window.addEventListener(
      "resize",
      () => position(this._assoclistRowHoverAnchor),
      true
    );
  },

  updateAssoclistTitles() {
    const tables = document.querySelectorAll("table.assoclist");
    if (!tables.length) return;

    tables.forEach((table) => {
      table.querySelectorAll("td").forEach((td) => {
        if (td.classList.contains("cbi-section-actions")) return;
        if (td.querySelector("button, .btn, .cbi-button, .control-group"))
          return;

        const badge = td.querySelector(".ifacebadge");
        if (badge) {
          const text = (badge.innerText || badge.textContent || "").trim();
          if (text && text.length >= 10) {
            badge.setAttribute("title", text);

            const inner = badge.querySelector("span");
            if (inner) inner.setAttribute("title", text);
          }
          return;
        }

        const text = (td.innerText || td.textContent || "")
          .trim()
          .replace(/\s+/g, " ");
        if (text && text.length >= 10) td.setAttribute("title", text);
      });
    });
  },

  installAssoclistTitleObserver() {
    if (this._assoclistTitleObserver) return;

    let scheduled = false;
    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        this.updateAssoclistTitles();
      });
    };

    this._assoclistTitleObserver = new MutationObserver(scheduleUpdate);
    this._assoclistTitleObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    scheduleUpdate();
  },

  ensureMenuPlacement(isMobile) {
    const menubar = document.querySelector("#menubar");
    const menubarInner = document.querySelector("#menubar-inner") || menubar;
    const mainmenu = document.querySelector("#mainmenu");
    if (!menubar || !mainmenu) return;

    if (isMobile) {
      // On some browsers, position:fixed inside backdrop-filter'ed header may
      // behave like position:absolute and get clipped to header height.
      // Move #mainmenu out of #menubar for mobile slide-out panel.
      if (menubar.contains(mainmenu)) {
        menubar.insertAdjacentElement("afterend", mainmenu);
      }
    } else {
      // Keep #mainmenu inside the header on desktop (top navigation)
      if (!menubarInner.contains(mainmenu)) {
        const indicators =
          menubarInner.querySelector("#indicators") ||
          menubar.querySelector("#indicators");
        if (indicators)
          indicators.insertAdjacentElement("beforebegin", mainmenu);
        else menubarInner.appendChild(mainmenu);
      }
    }
  },

  render(tree) {
    let node = tree;
    let url = "";

    const mq = window.matchMedia("(max-width: 800px)");
    this.ensureMenuPlacement(mq.matches);
    if (typeof mq.addEventListener === "function")
      mq.addEventListener("change", (ev) =>
        this.ensureMenuPlacement(ev.matches)
      );
    else if (typeof mq.addListener === "function")
      mq.addListener((ev) => this.ensureMenuPlacement(ev.matches));

    this.renderModeMenu(node);

    if (L.env.dispatchpath.length >= 3) {
      for (var i = 0; i < 3 && node; i++) {
        node = node.children[L.env.dispatchpath[i]];
        url = url + (url ? "/" : "") + L.env.dispatchpath[i];
      }

      if (node) this.renderTabMenu(node, url);
    }

    const navToggle = document.querySelector("#menubar .navigation");
    if (navToggle)
      navToggle.addEventListener(
        "click",
        ui.createHandlerFn(this, "handleSidebarToggle")
      );

    document.addEventListener("click", (ev) => {
      if (ev.target.closest("#mainmenu")) return;

      document.querySelectorAll("ul.mainmenu.l1.active").forEach((ul) => {
        ul.classList.remove("active");
      });

      document.querySelectorAll("ul.mainmenu.l1 > li.active").forEach((li) => {
        li.classList.remove("active");
      });
    });

    // LuCI is SPA-like: views update the DOM after initial load.
    // Add hover-to-reveal titles for assoclist (Associated Stations).
    this.installAssoclistTitleObserver();
    this.installAssoclistRowHoverExpand();
  },

  handleMenuExpand(ev) {
    const a = ev.currentTarget;
    const li = a.parentNode;
    const ul1 = li.parentNode;
    const ul2 = a.nextElementSibling;
    const isMobile = window.matchMedia("(max-width: 800px)").matches;
    const isTouchLike = window.matchMedia(
      "(hover: none), (pointer: coarse)"
    ).matches;

    // On desktop with mouse/hover, do not toggle persistent dropdown state.
    // Rely on CSS :hover to show submenus. This avoids "frozen" dropdowns and
    // prevents multiple submenus from being open at the same time.
    if (!isMobile && !isTouchLike) {
      document.querySelectorAll("ul.mainmenu.l1.active").forEach((ul) => {
        ul.classList.remove("active");
      });

      document
        .querySelectorAll("ul.mainmenu.l1 > li.active")
        .forEach((item) => {
          item.classList.remove("active");
        });

      return;
    }

    // Close other open dropdowns
    document.querySelectorAll("ul.mainmenu.l1 > li.active").forEach((item) => {
      if (item !== li) item.classList.remove("active");
    });

    if (!ul2) {
      // No submenu - allow normal navigation
      // On mobile, close the sidebar after click
      if (isMobile) {
        document.querySelector("#mainmenu").classList.remove("active");
        document
          .querySelector("#menubar .navigation")
          .classList.remove("active");
      }
      return;
    }

    // Toggle submenu
    if (li.classList.contains("active")) {
      li.classList.remove("active");
      ul1.classList.remove("active");
      a.blur();
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }

    if (
      ul2.parentNode.offsetLeft + ul2.offsetWidth <=
      ul1.offsetLeft + ul1.offsetWidth
    )
      ul2.classList.add("align-left");

    ul1.classList.add("active");
    li.classList.add("active");
    a.blur();

    ev.preventDefault();
    ev.stopPropagation();
  },

  renderMainMenu(tree, url, level) {
    const l = (level || 0) + 1;
    const ul = E("ul", { class: "mainmenu l%d".format(l) });
    const children = ui.menu.getChildren(tree);

    if (children.length == 0 || l > 2) return E([]);

    children.forEach((child) => {
      const isActive = L.env.dispatchpath[l] == child.name;
      const activeClass = "mainmenu-item-%s%s".format(
        child.name,
        isActive ? " selected" : ""
      );

      ul.appendChild(
        E("li", { class: activeClass }, [
          E(
            "a",
            {
              href: L.url(url, child.name),
              click: l == 1 ? ui.createHandlerFn(this, "handleMenuExpand") : "",
            },
            [_(child.title)]
          ),
          this.renderMainMenu(child, url + "/" + child.name, l),
        ])
      );
    });

    if (l == 1) document.querySelector("#mainmenu").appendChild(E("div", [ul]));

    return ul;
  },

  renderModeMenu(tree) {
    const menu = document.querySelector("#modemenu");
    const children = ui.menu.getChildren(tree);

    children.forEach((child, index) => {
      const isActive = L.env.requestpath.length
        ? child.name === L.env.requestpath[0]
        : index === 0;

      if (index > 0) menu.appendChild(E([], ["\u00a0|\u00a0"]));

      menu.appendChild(
        E("div", { class: isActive ? "active" : "" }, [
          E("a", { href: L.url(child.name) }, [_(child.title)]),
        ])
      );

      if (isActive) this.renderMainMenu(child, child.name);
    });

    if (menu.children.length > 1) menu.style.display = "";
  },

  renderTabMenu(tree, url, level) {
    const container = document.querySelector("#tabmenu");
    const l = (level || 0) + 1;
    const ul = E("ul", { class: "cbi-tabmenu" });
    const children = ui.menu.getChildren(tree);
    let activeNode = null;

    if (children.length == 0) return E([]);

    children.forEach((child) => {
      const isActive = L.env.dispatchpath[l + 2] == child.name;
      const activeClass = isActive ? " cbi-tab" : "";
      const className = "tabmenu-item-%s %s".format(child.name, activeClass);

      ul.appendChild(
        E("li", { class: className }, [
          E("a", { href: L.url(url, child.name) }, [_(child.title)]),
        ])
      );

      if (isActive) activeNode = child;
    });

    container.appendChild(ul);
    container.style.display = "";

    if (activeNode)
      container.appendChild(
        this.renderTabMenu(activeNode, url + "/" + activeNode.name, l)
      );

    return ul;
  },

  handleSidebarToggle(ev) {
    const btn = ev.currentTarget;
    const bar = document.querySelector("#mainmenu");

    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      bar.classList.remove("active");
    } else {
      btn.classList.add("active");
      bar.classList.add("active");
    }
  },
});
