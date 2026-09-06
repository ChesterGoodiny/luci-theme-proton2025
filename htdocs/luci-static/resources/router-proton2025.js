/**
 * Proton2025 Theme - Client-side Router (SPA navigation)
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 *
 * Благодарности / Acknowledgements:
 *   • Идея SPA-навигации внутри одного документа заимствована у
 *     luci-theme-footstrap (https://github.com/VizzleTF/luci-theme-footstrap),
 *     первым реализовавшего клиентскую навигацию для тем LuCI; к переносу этого
 *     подхода подтолкнул пример тем Aurora и Shadcn (eamonxg). Данный роутер —
 *     независимая реализация на базе браузерного Navigation API.
 *   • Разрешение alias/firstchild портировано из штатного dispatcher.uc
 *     LuCI (luci-base, Apache-2.0): клик и перезагрузка обязаны разрешаться
 *     в одну и ту же view, иначе URL и содержимое разойдутся.
 *
 * =====================================================================
 * Фаза 3 — клиентский роутинг для LuCI темы proton2025.
 *
 * ВНИМАНИЕ: это самая сложная и рискованная часть темы. Работаем поэтапно.
 * Каждый этап должен иметь работающий откат. По умолчанию роутинг ВЫКЛЮЧЕН.
 *
 * Этап 1 — базовый каркас:
 *   • Feature-gate по Navigation API (нет API → остаёмся классическим MPA).
 *   • Проверка рантайм-контракта LuCI (нет любой зависимости → MPA).
 *   • routerEnabled(): тумблер в localStorage 'proton-client-routing',
 *     по умолчанию OFF.
 *
 * Этап 3 — перехват навигации для безопасно разрешаемых menu-узлов:
 *   • Загружаем дерево меню LuCI (ui.menu.load) и строим карту
 *     обслуживаемых view, alias и firstchild-URL.
 *   • Alias/firstchild разрешаются по правилам dispatcher.uc; URL и история
 *     остаются запрошенными, а view/data-page/dispatchpath — разрешёнными.
 *   • navigation.addEventListener('navigate', ...) перехватывает переходы
 *     на обслуживаемые URL; всё остальное — обычная полная загрузка (MPA).
 *   • teardown уходящей страницы: сброс Poll-очереди, инвалидация UCI-кэша,
 *     закрытие модалок.
 *   • staged render: инстанцируем view штатным механизмом LuCI
 *     (ui.instantiateView / new constructor()); #view НЕ пересоздаём —
 *     View рендерит в живой #view через dom.content, идентичность узла
 *     сохраняется (это критично для observer'ов темы на data-page).
 *   • template/call/function/rewrite, blacklist и любые неразрешимые узлы
 *     остаются на честной полной загрузке.
 *
 * Дизайн-принцип на все этапы: при ЛЮБОЙ ошибке или сомнении — полная
 * загрузка страницы (window.location). SPA-режим не должен ронять панель.
 * =====================================================================
 */

"use strict";

(function () {
  var ROUTING_FLAG_KEY = "proton-client-routing";

  function getContractTargets() {
    var L = window.L;
    if (!L) return null;

    return [
      ["L.require", typeof L.require === "function"],
      ["L.Class", !!L.Class],
      ["L.dom", !!L.dom],
      ["L.dom.content", !!(L.dom && typeof L.dom.content === "function")],
      ["L.url", typeof L.url === "function"],
      ["L.env", !!L.env],
      ["L.env.base_url", !!(L.env && typeof L.env.base_url !== "undefined")],
      [
        "L.env.dispatchpath",
        !!(L.env && typeof L.env.dispatchpath !== "undefined"),
      ],
      [
        "L.env.requestpath",
        !!(L.env && typeof L.env.requestpath !== "undefined"),
      ],
      ["L.env.pathinfo", !!(L.env && typeof L.env.pathinfo !== "undefined")],
      ["L.env.nodespec", !!(L.env && typeof L.env.nodespec !== "undefined")],
      ["L.Poll", !!L.Poll],
      ["L.Poll.queue", !!(L.Poll && L.Poll.queue)],
      ["L.Poll.start", !!(L.Poll && typeof L.Poll.start === "function")],
      ["L.Poll.stop", !!(L.Poll && typeof L.Poll.stop === "function")],
      ["L.Request", !!L.Request],
      [
        "L.Request.addInterceptor",
        !!(L.Request && typeof L.Request.addInterceptor === "function"),
      ],
    ];
  }

  function hasNavigationApi() {
    return typeof window !== "undefined" && "navigation" in window;
  }

  function contractMissing() {
    var targets = getContractTargets();
    if (!targets) return ["window.L"];

    var missing = [];
    for (var i = 0; i < targets.length; i++) {
      if (!targets[i][1]) missing.push(targets[i][0]);
    }
    return missing;
  }

  function routerEnabled() {
    try {
      return localStorage.getItem(ROUTING_FLAG_KEY) === "on";
    } catch (e) {
      return false;
    }
  }

  function init() {
    if (!hasNavigationApi()) {
      console.info(
        "[Proton2025 router] Navigation API недоступен — остаёмся в MPA-режиме.",
      );
      return;
    }

    if (!routerEnabled()) {
      console.info(
        "[Proton2025 router] Клиентский роутинг выключен (тумблер OFF) — MPA-режим.",
      );
      return;
    }

    var missing = contractMissing();
    if (missing.length) {
      console.warn(
        "[Proton2025 router] Не выполнен рантайм-контракт LuCI, роутинг отключён. " +
          "Отсутствует: " +
          missing.join(", "),
      );
      return;
    }

    enableRouting();
  }

  var _nodeMap = null;

  var _gen = 0;

  var _inflight = false;

  var _seen = null;

  var NODE_BLACKLIST = ["admin/network/firewall", "admin/network/network"];

  var PER_PAGE_STYLES = [
    ["cascade-dashboard.css", [["^", "admin-dashboard"]]],
    ["cascade-diagnostics.css", [["=", "admin-network-diagnostics"]]],
    ["cascade-leds.css", [["=", "admin-system-leds"]]],
    [
      "cascade-logs.css",
      [
        ["*", "logs"],
        ["*", "syslog"],
        ["*", "dmesg"],
      ],
    ],
    ["cascade-overview.css", [["=", "admin-status-overview"]]],
    ["cascade-passwall2.css", [["^", "admin-services-passwall2"]]],
    ["cascade-processes.css", [["=", "admin-status-processes"]]],
    [
      "cascade-proxy.css",
      [
        ["*", "ssclash"],
        ["*", "mihomo"],
      ],
    ],
    [
      "cascade-realtime.css",
      [
        ["=", "admin-status-realtime-load"],
        ["=", "admin-status-realtime-bandwidth"],
        ["=", "admin-status-realtime-wireless"],
        ["=", "admin-status-realtime-connections"],
        ["=", "admin-status-realtime-temperature"],
        ["^", "admin-status-realtime"],
      ],
    ],
    ["cascade-reboot.css", [["=", "admin-system-reboot"]]],
    ["cascade-repokeys.css", [["=", "admin-system-admin-repokeys"]]],
    ["cascade-routes.css", [["=", "admin-status-routes"]]],
    ["cascade-startup.css", [["=", "admin-system-startup"]]],
    ["cascade-status.css", [["^", "admin-status"]]],
    ["cascade-system.css", [["=", "admin-system-system"]]],
    ["cascade-temperature.css", [["=", "admin-status-realtime-temperature"]]],
    ["cascade-wifihistory.css", [["=", "admin-status-wifihistory"]]],
  ];

  function pageStyleMatches(page, conditions) {
    for (var i = 0; i < conditions.length; i++) {
      var operator = conditions[i][0];
      var value = conditions[i][1];
      if (operator === "=" && page === value) return true;
      if (operator === "^" && page.indexOf(value) === 0) return true;
      if (operator === "*" && page.indexOf(value) !== -1) return true;
    }
    return false;
  }

  function getThemeMediaBase() {
    var commonStyle = document.querySelector(
      'link[rel="stylesheet"][href*="/css/cascade.css"]',
    );
    if (!commonStyle) return null;

    try {
      return new URL(commonStyle.href).href.replace(
        /\/css\/cascade\.css(?:\?.*)?$/,
        "",
      );
    } catch (e) {
      return null;
    }
  }

  function syncPageStyles(nodeInfo) {
    var page = nodeInfo.pathSegments.join("-");
    var mediaBase = getThemeMediaBase();
    if (!mediaBase) return Promise.resolve();

    var wanted = {};
    for (var i = 0; i < PER_PAGE_STYLES.length; i++) {
      var entry = PER_PAGE_STYLES[i];
      if (pageStyleMatches(page, entry[1])) wanted[entry[0]] = true;
    }

    var known = {};
    for (var j = 0; j < PER_PAGE_STYLES.length; j++)
      known[PER_PAGE_STYLES[j][0]] = true;

    var links = document.querySelectorAll('link[rel="stylesheet"][href]');
    for (var k = links.length - 1; k >= 0; k--) {
      var link = links[k];
      var pathname;
      try {
        pathname = new URL(link.href).pathname;
      } catch (e) {
        continue;
      }

      for (var filename in known) {
        if (
          pathname.slice(-(filename.length + 1)) === "/" + filename &&
          !wanted[filename]
        ) {
          link.parentNode.removeChild(link);
          break;
        }
      }
    }

    var pending = [];
    for (var name in wanted) {
      var exists = false;
      var expectedSuffix = "/" + name;
      var currentLinks = document.querySelectorAll(
        'link[rel="stylesheet"][href]',
      );
      for (var n = 0; n < currentLinks.length; n++) {
        try {
          if (
            new URL(currentLinks[n].href).pathname.slice(
              -expectedSuffix.length,
            ) === expectedSuffix
          ) {
            exists = true;
            break;
          }
        } catch (e) {
        }
      }
      if (exists) continue;

      pending.push(
        (function (filename) {
          return new Promise(function (resolve) {
            var style = document.createElement("link");
            var settled = false;
            function done() {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              resolve();
            }
            var timer = setTimeout(done, 2500);
            style.rel = "stylesheet";
            style.media = "screen";
            style.href = mediaBase + "/css/pages/" + filename;
            style.dataset.protonSpaPerpage = "true";
            style.onload = done;
            style.onerror = done;
            document.head.appendChild(style);
          });
        })(name),
      );
    }

    return Promise.all(pending);
  }

  function buildNodeMap(tree) {
    var map = {};

    function walk(node, segs) {
      if (!node || !node.children) return;
      for (var key in node.children) {
        if (!Object.prototype.hasOwnProperty.call(node.children, key)) continue;
        var child = node.children[key];
        var path = segs.concat(key);
        var info = describeNode(tree, child, path);
        if (info) map[info.url] = info;
        walk(child, path);
      }
    }

    walk(tree, []);
    return map;
  }

  function nodeWeight(node) {
    return (
      Math.min(node.order != null ? node.order : 9999, 9999) +
      (node.auth && node.auth.login ? 10000 : 0)
    );
  }

  function firstChildOf(node) {
    var bestName = null;
    var best = null;
    var kids = node.children || {};

    for (var name in kids) {
      if (!Object.prototype.hasOwnProperty.call(kids, name)) continue;
      var child = kids[name];
      if (
        !child ||
        !child.satisfied ||
        !child.title ||
        !child.action ||
        typeof child.action !== "object"
      ) {
        continue;
      }

      if (child.action.type === "firstchild") {
        if (
          (!best || nodeWeight(best) > nodeWeight(child)) &&
          firstChildOf(child)
        ) {
          best = child;
          bestName = name;
        }
      } else if (!child.firstchild_ineligible) {
        if (!best || nodeWeight(best) > nodeWeight(child)) {
          best = child;
          bestName = name;
        }
      }
    }

    return best ? { name: bestName, node: best } : null;
  }

  function nodeForSegs(tree, segs) {
    var node = tree;
    for (var i = 0; i < segs.length; i++) {
      node = node && node.children && node.children[segs[i]];
      if (!node) return null;
    }
    return node;
  }

  function resolveSegs(tree, segs) {
    var resolvedSegs = segs.slice();
    var node = nodeForSegs(tree, resolvedSegs);

    for (var hops = 0; node && node.action && hops < 8; hops++) {
      var type = node.action.type;
      if (type === "alias") {
        resolvedSegs = String(node.action.path).split("/");
        node = nodeForSegs(tree, resolvedSegs);
      } else if (type === "firstchild") {
        var firstChild = firstChildOf(node);
        if (!firstChild) return null;
        resolvedSegs = resolvedSegs.concat([firstChild.name]);
        node = firstChild.node;
      } else {
        return { segs: resolvedSegs, node: node };
      }
    }

    return null;
  }

  function isBlacklistedRoute(route) {
    for (var i = 0; i < NODE_BLACKLIST.length; i++) {
      if (route.indexOf(NODE_BLACKLIST[i]) === 0) return true;
    }
    return false;
  }

  function describeNode(tree, node, pathSegments) {
    var L = window.L;
    if (!node || !L.isObject(node.action)) return null;

    var requestedSegments = pathSegments.slice();
    var requestedRoute = requestedSegments.join("/");
    if (isBlacklistedRoute(requestedRoute)) return null;

    var resolvedNode = node;
    var resolvedSegments = requestedSegments;

    if (node.action.type === "view") {
      if (node.satisfied === false) return null;
    } else if (
      node.action.type === "alias" ||
      node.action.type === "firstchild"
    ) {
      var resolved = resolveSegs(tree, requestedSegments);
      if (!resolved) return null;

      resolvedNode = resolved.node;
      resolvedSegments = resolved.segs;
      if (
        !resolvedNode ||
        !L.isObject(resolvedNode.action) ||
        resolvedNode.action.type !== "view" ||
        resolvedNode.satisfied === false ||
        isBlacklistedRoute(resolvedSegments.join("/"))
      ) {
        return null;
      }
    } else {
      return null;
    }

    var url;
    try {
      url = L.url.apply(L, requestedSegments);
    } catch (e) {
      return null;
    }
    if (!url) return null;

    return {
      url: url,
      route: requestedRoute,
      viewPath: resolvedNode.action.path,
      title: resolvedNode.title || requestedRoute,
      pathSegments: resolvedSegments.slice(),
    };
  }

  function loadMenuTree() {
    return window.L.require("ui").then(function (ui) {
      return ui.menu.load();
    });
  }

  function enableRouting() {
    loadMenuTree()
      .then(function (tree) {
        _nodeMap = buildNodeMap(tree);
        _seen = new Set();

        var here = normalizeUrl(window.location.pathname);
        if (here && _nodeMap[here]) {
          _seen.add(_nodeMap[here].viewPath);
        }

        window.navigation.addEventListener("navigate", handleNavigation);

        console.info(
          "[Proton2025 router] Этап 3 активен: перехват навигации включён. " +
            "Обслуживаемых узлов: " +
            Object.keys(_nodeMap).length +
            ".",
        );
      })
      .catch(function (err) {
        console.warn(
          "[Proton2025 router] Не удалось загрузить дерево меню, роутинг отключён:",
          err,
        );
      });
  }

  function normalizeUrl(pathname) {
    if (!pathname) return pathname;
    if (pathname.length > 1 && pathname.charAt(pathname.length - 1) === "/")
      return pathname.slice(0, -1);
    return pathname;
  }

  function handleNavigation(event) {
    try {
      if (!event.canIntercept) return;
      if (event.hashChange) return;
      if (event.downloadRequest !== null) return;

      var dest = event.destination;
      if (!dest || !dest.url) return;

      var url = new URL(dest.url);

      if (url.origin !== window.location.origin) return;

      if (url.search || url.hash) return;

      var key = normalizeUrl(url.pathname);
      var nodeInfo = _nodeMap ? _nodeMap[key] : null;

      if (!nodeInfo) {
        console.info(
          "[Proton2025 router] Не обслуживается, полная загрузка: " +
            url.pathname,
        );
        return;
      }

      if (key === normalizeUrl(window.location.pathname)) return;

      if (_inflight) return;

      event.intercept({
        scroll: "after-transition",
        handler: function () {
          return navigateTo(nodeInfo);
        },
      });
    } catch (e) {
      console.warn("[Proton2025 router] Ошибка в handleNavigation:", e);
    }
  }

  function teardownCurrentPage() {
    var L = window.L;

    try {
      if (L.Poll && L.Poll.queue) {
        L.Poll.queue.length = 0;
        if (typeof L.Poll.stop === "function") L.Poll.stop();
        if (typeof L.Poll.start === "function") L.Poll.start();
      }
    } catch (e) {
      console.warn("[Proton2025 router] teardown: сбой Poll:", e);
    }

    flushUciCache();

    try {
      if (L.ui && typeof L.ui.hideModal === "function") L.ui.hideModal();
    } catch (e) {
    }
  }

  function flushUciCache() {
    try {
      var uci = window.L.uci;
      if (uci && typeof uci.unload === "function") {
        uci.unload(["network", "wireless", "luci"]);
      }
    } catch (e) {
    }
  }

  function navigateTo(nodeInfo) {
    var L = window.L;
    var myGen = ++_gen;
    _inflight = true;

    return Promise.resolve()
      .then(function () {
        teardownCurrentPage();

        swapDataPage(nodeInfo);

        return syncPageStyles(nodeInfo).then(function () {
          showViewSpinner();
          return instantiateView(nodeInfo);
        });
      })
      .then(function () {
        if (myGen !== _gen) return;

        _seen.add(nodeInfo.viewPath);
        _inflight = false;

        try {
          window.dispatchEvent(
            new CustomEvent("proton-spa-navigated", {
              detail: { pathSegments: nodeInfo.pathSegments.slice() },
            }),
          );
        } catch (e) {
        }

        try {
          if (L.env) L.env.requestpath = nodeInfo.route.split("/");
        } catch (e) {
        }
      })
      .catch(function (err) {
        _inflight = false;
        if (myGen !== _gen) return;
        console.warn(
          "[Proton2025 router] Ошибка рендера, полная загрузка:",
          err,
        );
        window.location = nodeInfo.url;
      });
  }

  function swapDataPage(nodeInfo) {
    try {
      document.body.dataset.page = nodeInfo.pathSegments.join("-");
    } catch (e) {
    }
  }

  function showViewSpinner() {
    try {
      var vp = document.getElementById("view");
      if (vp && window.L.dom && typeof window.L.dom.content === "function") {
        var label =
          typeof window._ === "function"
            ? window._("Loading view…")
            : "Loading view…";
        window.L.dom.content(
          vp,
          window.E("div", { class: "spinning" }, [label]),
        );
      }
    } catch (e) {
    }
  }

  function instantiateView(nodeInfo) {
    var L = window.L;
    var viewPath = nodeInfo.viewPath;
    var className = "view." + viewPath.replace(/\//g, ".");

    return L.require("ui").then(function (ui) {
      if (!_seen.has(viewPath)) {
        return ui.instantiateView(viewPath);
      }
      return L.require(className).then(function (instance) {
        var Ctor = instance && instance.constructor;
        if (typeof Ctor !== "function") {
          return ui.instantiateView(viewPath);
        }
        return new Ctor();
      });
    });
  }

  window.protonRouter = window.protonRouter || {};
  window.protonRouter.isEnabled = routerEnabled;
  window.protonRouter.hasNavigationApi = hasNavigationApi;
  window.protonRouter.contractMissing = contractMissing;
  window.protonRouter.servicedCount = function () {
    return _nodeMap ? Object.keys(_nodeMap).length : null;
  };
  window.protonRouter.nodeMap = function () {
    return _nodeMap;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
