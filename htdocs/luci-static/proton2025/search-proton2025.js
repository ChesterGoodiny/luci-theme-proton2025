/**
 * Proton2025 - Search UI and Indexing
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 */

"use strict";

(function () {
  const SEARCH_COLLAPSE_DURATION_MS = 450;

  let searchInput;
  let searchResults;
  let searchContainer = null;
  let searchWrapper = null;
  let searchCloseAnimationTimer = 0;
  let menuItems = [];
  let isIndexed = false;
  let indexedSemanticCount = -1;
  let selectedIndex = -1;
  let liveDataItems = [];
  let liveDataLoaded = false;
  let liveDataLoading = null;
  let prefetchedPageEntries = [];
  let prefetchCacheMeta = null;
  let prefetchCacheStale = false;
  let prefetchRequestVersion = 0;
  let preindexLoading = null;
  let prefetchAbortController = null;
  let prefetchCacheLoadPromise = null;
  let prefetchCacheInvalidLoadCount = 0;
  let activeHashHighlightNode = null;
  let activeHashHighlightAnimation = null;
  let activeHashHighlightRestore = null;
  let hashHighlightTimerId = null;
  let prefetchStatus = {
    inProgress: false,
    cancelable: false,
    canceled: false,
    cancelReason: "",
    routeCount: 0,
    indexedRouteCount: 0,
    lastIndexedAt: 0,
    errorCount: 0,
    routeErrorCount: 0,
    persistenceErrorCount: 0,
    recentErrors: [],
    indexedPages: [],
  };

  const MAX_RESULTS = 10;
  const LIVE_TARGET_PREFIX = "proton-search-live-";
  const MIN_FUZZY_TOKEN_LENGTH = 4;
  const PREFETCH_FRAME_NAME = "proton-search-prefetch-frame";
  const PREFETCH_FRAME_STYLE =
    "position:absolute;width:1px;height:1px;left:-9999px;top:-9999px;opacity:0;pointer-events:none;border:0;";
  const PREFETCH_PAGE_TIMEOUT = 12000;
  const PREFETCH_NAVIGATION_TIMEOUT = 16000;
  const PREFETCH_POLL_INTERVAL = 160;
  const PREFETCH_ROUTE_DELAY = 320;
  const PREFETCH_ERROR_DETAILS_LIMIT = 5;
  const PREFETCH_INDEXED_PAGE_DETAILS_LIMIT = 32;
  const HASH_TAB_RETRY_LIMIT = 30;
  const HASH_TAB_RETRY_DELAY = 200;
  const HASH_HIGHLIGHT_DURATION = 1600;
  const HASH_HIGHLIGHT_CLASS = "proton-anchor-highlight-target";
  const SEARCH_CACHE_VERSION = 2;
  const LEGACY_SEARCH_CACHE_STORAGE_KEY = "proton-search-prefetch-cache";
  const LEGACY_SEARCH_CACHE_META_KEY = "proton-search-prefetch-cache-meta";
  const SEARCH_CACHE_OBJECT = "luci.proton-search-cache";
  const UBUS_STATUS_OK = 0;
  const SEARCH_CACHE_READY_TIMEOUT = 2000;
  const SEARCH_CACHE_RPC_TIMEOUT = 5000;
  const SEARCH_CACHE_RETRY_DELAY = 250;
  const SEARCH_CACHE_RETRY_ATTEMPTS = 8;
  const SEARCH_CACHE_ALT_TEXT_LIMIT = 1;
  const SEARCH_INDEX_SETTINGS_ROUTE = "admin/system/system";
  const SEARCH_INDEX_SETTINGS_HASH = "proton-search-index-panel";
  const SEARCH_INDEX_SETTINGS_FOCUS_EVENT = "proton-focus-search-index-panel";
  const INTERFACE_ROUTE_CANDIDATES = [
    "admin/network/network",
    "admin/network/interfaces",
  ];
  const isPrefetchFrame = window.name === PREFETCH_FRAME_NAME;
  const KEYBOARD_LAYOUT_LAT_TO_RU = {
    q: "й",
    w: "ц",
    e: "у",
    r: "к",
    t: "е",
    y: "н",
    u: "г",
    i: "ш",
    o: "щ",
    p: "з",
    "[": "х",
    "]": "ъ",
    a: "ф",
    s: "ы",
    d: "в",
    f: "а",
    g: "п",
    h: "р",
    j: "о",
    k: "л",
    l: "д",
    ";": "ж",
    "'": "э",
    z: "я",
    x: "ч",
    c: "с",
    v: "м",
    b: "и",
    n: "т",
    m: "ь",
    ",": "б",
    ".": "ю",
    "`": "ё",
  };
  const KEYBOARD_LAYOUT_RU_TO_LAT = Object.keys(
    KEYBOARD_LAYOUT_LAT_TO_RU,
  ).reduce((map, key) => {
    map[KEYBOARD_LAYOUT_LAT_TO_RU[key]] = key;
    return map;
  }, {});
  const CYRILLIC_TO_LATIN_SEQUENCES = [
    ["щ", "shch"],
    ["ш", "sh"],
    ["ч", "ch"],
    ["ц", "ts"],
    ["ю", "yu"],
    ["я", "ya"],
    ["ё", "yo"],
    ["ж", "zh"],
    ["х", "kh"],
    ["ъ", ""],
    ["ь", ""],
  ];
  const CYRILLIC_TO_LATIN_SINGLE = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    ы: "y",
    э: "e",
  };
  const LATIN_TO_CYRILLIC_SEQUENCES = [
    ["shch", "щ"],
    ["sch", "щ"],
    ["yo", "ё"],
    ["zh", "ж"],
    ["kh", "х"],
    ["ts", "ц"],
    ["ch", "ч"],
    ["sh", "ш"],
    ["yu", "ю"],
    ["ya", "я"],
  ];

  function safeGetLocalStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeRemoveLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getCurrentSearchLanguage() {
    return document.documentElement.lang || document.body.lang || "";
  }

  function getPrefetchRouteHash(routes) {
    const normalizedRoutes = Array.isArray(routes)
      ? routes
          .filter(Boolean)
          .map((route) => String(route))
          .sort()
      : [];

    if (!normalizedRoutes.length) return "";

    let hash = 2166136261;

    normalizedRoutes.forEach((route) => {
      for (let index = 0; index < route.length; index++) {
        hash ^= route.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }

      hash ^= 10;
      hash = Math.imul(hash, 16777619);
    });

    return `${normalizedRoutes.length}:${(hash >>> 0).toString(16)}`;
  }

  function getCurrentPrefetchRoutes() {
    return getPrefetchRouteList({
      includeCurrentPage: true,
      includeTabMenu: true,
    });
  }

  function getStablePrefetchRouteHash() {
    return getPrefetchRouteHash(
      getPrefetchRouteList({
        includeCurrentPage: true,
        includeTabMenu: false,
      }),
    );
  }

  function getCurrentPrefetchRouteHash() {
    return getStablePrefetchRouteHash();
  }

  function updatePrefetchCacheState(routeHash) {
    if (!prefetchedPageEntries.length) {
      prefetchCacheStale = false;
      return prefetchCacheStale;
    }

    const meta = prefetchCacheMeta || {};

    let stale =
      meta.version !== SEARCH_CACHE_VERSION ||
      !meta.language ||
      meta.language !== getCurrentSearchLanguage() ||
      !meta.href ||
      meta.href !== window.location.origin ||
      !meta.storedAt;

    if (routeHash) {
      stale = stale || !meta.routeHash || meta.routeHash !== routeHash;
    }

    prefetchCacheStale = stale;
    return prefetchCacheStale;
  }

  function normalizePrefetchErrorRoute(route) {
    const value = String(route || "").trim();
    if (!value) {
      return "unknown route";
    }

    const normalizedValue = value
      .replace(/^https?:\/\/[^/]+\/cgi-bin\/luci\/?/i, "")
      .replace(/^\/+/, "");

    return normalizedValue || value;
  }

  function normalizePrefetchErrorMessage(error) {
    let normalizedMessage = "";

    if (error && typeof error.message === "string") {
      normalizedMessage = error.message;
    } else if (typeof error === "string") {
      normalizedMessage = error;
    } else if (error != null) {
      normalizedMessage = String(error);
    }

    normalizedMessage = normalizedMessage.replace(/\s+/g, " ").trim();

    if (!normalizedMessage) {
      normalizedMessage = "Unknown error";
    }

    if (
      error &&
      typeof error.name === "string" &&
      error.name &&
      error.name !== "Error" &&
      normalizedMessage.indexOf(`${error.name}:`) !== 0
    ) {
      normalizedMessage = `${error.name}: ${normalizedMessage}`;
    }

    if (normalizedMessage.length > 220) {
      normalizedMessage = `${normalizedMessage.slice(0, 217)}...`;
    }

    return normalizedMessage;
  }

  function recordPrefetchError(route, error) {
    const detail = `${normalizePrefetchErrorRoute(route)}: ${normalizePrefetchErrorMessage(error)}`;
    const recentErrors = Array.isArray(prefetchStatus.recentErrors)
      ? prefetchStatus.recentErrors.slice()
      : [];

    recentErrors.push(detail);
    prefetchStatus.recentErrors = recentErrors.slice(
      -PREFETCH_ERROR_DETAILS_LIMIT,
    );
  }

  function getPrefetchRecentErrors() {
    return Array.isArray(prefetchStatus.recentErrors)
      ? prefetchStatus.recentErrors
          .map((detail) => String(detail || "").trim())
          .filter(Boolean)
      : [];
  }

  function buildPrefetchIndexedPageLabel(route, entries) {
    const normalizedRoute = normalizePrefetchErrorRoute(route);
    const normalizedHref = normalizeRouteHref(route);
    const preferredEntry = Array.isArray(entries)
      ? entries.find(
          (entry) =>
            entry &&
            normalizeRouteHref(entry.href) === normalizedHref &&
            shouldIndexPageText(entry.text),
        )
      : null;
    const pageLabel = String(
      preferredEntry?.text || preferredEntry?.pageContext || "",
    )
      .replace(/\s+/g, " ")
      .trim();

    if (!pageLabel) {
      return normalizedRoute;
    }

    return pageLabel.toLowerCase() === normalizedRoute.toLowerCase()
      ? pageLabel
      : `${pageLabel} (${normalizedRoute})`;
  }

  function recordPrefetchIndexedPage(route, entries) {
    const detail = buildPrefetchIndexedPageLabel(route, entries);
    if (!detail) {
      return;
    }

    const indexedPages = Array.isArray(prefetchStatus.indexedPages)
      ? prefetchStatus.indexedPages.slice()
      : [];

    indexedPages.push(detail);
    prefetchStatus.indexedPages = indexedPages.slice(
      -PREFETCH_INDEXED_PAGE_DETAILS_LIMIT,
    );
  }

  function getPrefetchIndexedPages() {
    return Array.isArray(prefetchStatus.indexedPages)
      ? prefetchStatus.indexedPages
          .map((detail) => String(detail || "").trim())
          .filter(Boolean)
      : [];
  }

  function getPrefetchStatusSnapshot() {
    return {
      inProgress: prefetchStatus.inProgress,
      cancelable: prefetchStatus.cancelable,
      canceled: prefetchStatus.canceled,
      cancelReason: prefetchStatus.cancelReason,
      routeCount: prefetchStatus.routeCount,
      indexedRouteCount: prefetchStatus.indexedRouteCount,
      lastIndexedAt: prefetchStatus.lastIndexedAt,
      errorCount: prefetchStatus.errorCount,
      routeErrorCount: prefetchStatus.routeErrorCount,
      persistenceErrorCount: prefetchStatus.persistenceErrorCount,
      recentErrors: getPrefetchRecentErrors(),
      indexedPages: getPrefetchIndexedPages(),
    };
  }

  function dispatchSearchIndexState() {
    const detail = {
      cachedEntryCount: prefetchedPageEntries.length,
      cacheBytes: getCachedPrefetchBytes(),
      stale: prefetchCacheStale,
      status: getPrefetchStatusSnapshot(),
    };

    window.dispatchEvent(
      new CustomEvent("proton-search-index-state", { detail: detail }),
    );
  }

  function createPrefetchAbortError(reason) {
    const error = new Error(reason || "Search indexing canceled.");
    error.name = "AbortError";
    return error;
  }

  function isPrefetchAbortError(error) {
    if (!error) return false;
    if (error.name === "AbortError") return true;

    const message = String(error.message || "").toLowerCase();
    return (
      message.indexOf("canceled") !== -1 || message.indexOf("aborted") !== -1
    );
  }

  function cancelPrefetchIndexing(reason) {
    const isActive = prefetchStatus.inProgress || !!preindexLoading;
    if (!isActive) {
      return false;
    }

    prefetchRequestVersion += 1;
    prefetchStatus.canceled = true;
    prefetchStatus.cancelReason = String(reason || "user");

    if (prefetchAbortController) {
      try {
        prefetchAbortController.abort();
      } catch (error) {
        // Ignore already-aborted controller state.
      }
    }

    dispatchSearchIndexState();
    return true;
  }

  function getCachedPrefetchPayload(routeHash, storedAt) {
    const hrefs = [];
    const hrefIndexes = Object.create(null);
    const contexts = [];
    const contextIndexes = Object.create(null);

    return {
      version: SEARCH_CACHE_VERSION,
      storedAt: storedAt || Date.now(),
      language: getCurrentSearchLanguage(),
      href: window.location.origin,
      routeHash: routeHash || getCurrentPrefetchRouteHash(),
      hrefs: hrefs,
      contexts: contexts,
      entries: prefetchedPageEntries.map((entry) => {
        const href = String(entry?.href || "");
        let hrefIndex = hrefIndexes[href];

        if (hrefIndex == null) {
          hrefIndex = hrefs.length;
          hrefIndexes[href] = hrefIndex;
          hrefs.push(href);
        }

        const pageContext = String(entry?.pageContext || "").trim();
        let contextIndex = null;

        if (pageContext) {
          contextIndex = contextIndexes[pageContext];

          if (contextIndex == null) {
            contextIndex = contexts.length;
            contextIndexes[pageContext] = contextIndex;
            contexts.push(pageContext);
          }
        }

        const altTexts = dedupeStrings(
          Array.isArray(entry?.altTexts) ? entry.altTexts : [],
        )
          .filter(
            (value) =>
              normalizeText(value) !== normalizeText(entry?.text || ""),
          )
          .slice(0, SEARCH_CACHE_ALT_TEXT_LIMIT);

        const compactEntry = [
          String(entry?.text || ""),
          hrefIndex,
          altTexts.length ? altTexts : null,
          contextIndex != null ? contextIndex : null,
        ];

        while (
          compactEntry.length > 2 &&
          compactEntry[compactEntry.length - 1] == null
        ) {
          compactEntry.pop();
        }

        return compactEntry;
      }),
    };
  }

  function normalizeCachedPrefetchEntries(entries, hrefs, contexts) {
    if (!Array.isArray(entries)) return [];

    return entries
      .map((entry) => {
        if (Array.isArray(entry)) {
          const text = String(entry[0] || "").trim();
          const href =
            typeof entry[1] === "number" && Array.isArray(hrefs)
              ? normalizeIndexedHref(hrefs[entry[1]])
              : normalizeIndexedHref(entry[1]);
          const altTexts = Array.isArray(entry[2])
            ? entry[2]
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            : [];
          const pageContext =
            typeof entry[3] === "number" && Array.isArray(contexts)
              ? String(contexts[entry[3]] || "").trim()
              : String(entry[3] || "").trim();

          if (!text || !href) return null;

          return {
            text: text,
            href: href,
            altTexts: altTexts,
            pageContext: pageContext,
          };
        }

        if (!entry || typeof entry !== "object") return null;

        const text = String(entry.text || "").trim();
        const href = normalizeIndexedHref(entry.href);
        if (!text || !href) return null;

        return {
          text: text,
          href: href,
          altTexts: Array.isArray(entry.altTexts)
            ? entry.altTexts
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            : [],
          pageContext: String(entry.pageContext || "").trim(),
        };
      })
      .filter(Boolean);
  }

  function buildPrefetchCacheMeta(payload, rawCache, rawMeta, options) {
    return {
      version: payload.version,
      storedAt: payload.storedAt,
      language: payload.language,
      href: payload.href,
      routeHash: payload.routeHash,
      entryCount: Array.isArray(payload.entries) ? payload.entries.length : 0,
      cacheBytes: rawCache.length + rawMeta.length,
      lastIndexedAt: options?.lastIndexedAt || payload.storedAt,
      errorCount:
        options && Number.isFinite(options.errorCount) ? options.errorCount : 0,
    };
  }

  function clearLegacyPrefetchCache() {
    safeRemoveLocalStorage(LEGACY_SEARCH_CACHE_STORAGE_KEY);
    safeRemoveLocalStorage(LEGACY_SEARCH_CACHE_META_KEY);
  }

  function applyLoadedPrefetchCache(rawCache, rawMeta) {
    if (!rawCache) return "empty";

    try {
      const cache = JSON.parse(rawCache);
      if (!cache || !Array.isArray(cache.entries)) {
        return "invalid";
      }
      if (Number(cache.version) !== SEARCH_CACHE_VERSION) {
        return "outdated";
      }
      const normalizedEntries = normalizeCachedPrefetchEntries(
        cache.entries,
        cache.hrefs,
        cache.contexts,
      );
      if (!normalizedEntries.length && cache.entries.length) {
        return "invalid";
      }

      let meta = null;
      if (rawMeta) {
        try {
          meta = JSON.parse(rawMeta);
        } catch (error) {
          meta = null;
        }
      }

      const fallbackMeta = buildPrefetchCacheMeta(cache, rawCache, rawMeta, {
        lastIndexedAt: cache.storedAt,
        errorCount: 0,
      });

      prefetchCacheMeta =
        meta && typeof meta === "object"
          ? Object.assign({}, fallbackMeta, meta)
          : fallbackMeta;
      prefetchCacheMeta.entryCount = normalizedEntries.length;
      prefetchCacheMeta.cacheBytes = rawCache.length + rawMeta.length;

      prefetchedPageEntries = normalizedEntries;
      prefetchStatus.lastIndexedAt =
        Number(
          prefetchCacheMeta.lastIndexedAt ||
            prefetchCacheMeta.storedAt ||
            cache.storedAt,
        ) || 0;
      prefetchStatus.errorCount = 0;
      prefetchStatus.routeErrorCount = 0;
      prefetchStatus.persistenceErrorCount = 0;
      prefetchStatus.recentErrors = [];
      prefetchStatus.indexedPages = [];
      isIndexed = false;
      updatePrefetchCacheState();

      return "loaded";
    } catch (error) {
      return "invalid";
    }
  }

  async function callSearchCacheRpc(method, payload) {
    const requestBody = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "call",
      params: [
        (window.L && L.env && L.env.sessionid) ||
          "00000000000000000000000000000000",
        SEARCH_CACHE_OBJECT,
        method,
        payload || {},
      ],
    };
    const abortController =
      typeof AbortController === "function" ? new AbortController() : null;
    let timeoutId = null;

    try {
      if (abortController) {
        timeoutId = window.setTimeout(() => {
          abortController.abort();
        }, SEARCH_CACHE_RPC_TIMEOUT);
      }

      const response = await fetch(
        (window.L && L.env && L.env.ubuspath) || "/ubus/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: abortController ? abortController.signal : undefined,
        },
      );
      const result = await response.json();

      return {
        status: Array.isArray(result?.result)
          ? Number(result.result[0] || 0)
          : Number.NaN,
        data: extractUbusPayload(result),
      };
    } catch (error) {
      if (error && error.name === "AbortError") {
        console.warn("[Proton2025] Search cache RPC timed out:", method);
      }
      return { status: Number.NaN, data: null };
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  }

  async function readRemotePrefetchCache() {
    const response = await callSearchCacheRpc("loadCache", {});
    const rawCache =
      response.status === UBUS_STATUS_OK &&
      response.data?.success &&
      typeof response.data?.cache === "string"
        ? response.data.cache
        : "";
    const rawMeta =
      response.status === UBUS_STATUS_OK &&
      response.data?.success &&
      typeof response.data?.meta === "string"
        ? response.data.meta
        : "";

    return {
      status: response.status,
      success: response.status === UBUS_STATUS_OK && response.data?.success,
      rawCache: rawCache,
      rawMeta: rawMeta,
      cacheBytes:
        Number(response.data?.cacheBytes) || rawCache.length + rawMeta.length,
    };
  }

  async function writeRemotePrefetchCache(rawCache, rawMeta) {
    const response = await callSearchCacheRpc("saveCache", {
      cache: rawCache,
      meta: rawMeta,
    });

    return {
      status: response.status,
      success: response.status === UBUS_STATUS_OK && response.data?.success,
      cacheBytes:
        Number(response.data?.cacheBytes) || rawCache.length + rawMeta.length,
    };
  }

  async function clearRemotePrefetchCache() {
    const response = await callSearchCacheRpc("clearCache", {});

    return {
      status: response.status,
      success: response.status === UBUS_STATUS_OK && response.data?.success,
    };
  }

  function isSearchCacheRpcReady() {
    return !!(window.L && L.env && L.env.sessionid);
  }

  async function waitForSearchCacheRpcReady(timeoutMs) {
    if (isSearchCacheRpcReady()) return true;

    const deadline = Date.now() + Math.max(Number(timeoutMs) || 0, 0);

    while (Date.now() < deadline) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, Math.min(SEARCH_CACHE_RETRY_DELAY, 100));
      });

      if (isSearchCacheRpcReady()) {
        return true;
      }
    }

    return isSearchCacheRpcReady();
  }

  async function readRemotePrefetchCacheWithRetry() {
    await waitForSearchCacheRpcReady(SEARCH_CACHE_READY_TIMEOUT);

    let remoteCache = await readRemotePrefetchCache();

    for (
      let attempt = 0;
      !remoteCache.success && attempt < SEARCH_CACHE_RETRY_ATTEMPTS;
      attempt += 1
    ) {
      await waitForSearchCacheRpcReady(SEARCH_CACHE_RETRY_DELAY);
      await new Promise((resolve) => {
        window.setTimeout(resolve, SEARCH_CACHE_RETRY_DELAY);
      });
      remoteCache = await readRemotePrefetchCache();
    }

    return remoteCache;
  }

  function getCachedPrefetchBytes() {
    return Number(prefetchCacheMeta?.cacheBytes) || 0;
  }

  async function savePrefetchCache(routeHash, storedAt) {
    const payload = getCachedPrefetchPayload(routeHash, storedAt);
    const meta = buildPrefetchCacheMeta(payload, "", "", {
      lastIndexedAt: prefetchStatus.lastIndexedAt || payload.storedAt,
      errorCount: prefetchStatus.errorCount,
    });

    const rawCache = JSON.stringify(payload);
    const rawMeta = JSON.stringify(
      buildPrefetchCacheMeta(payload, rawCache, "", {
        lastIndexedAt: meta.lastIndexedAt,
        errorCount: meta.errorCount,
      }),
    );
    meta.cacheBytes = rawCache.length + rawMeta.length;

    const remoteResult = await writeRemotePrefetchCache(rawCache, rawMeta);

    if (remoteResult.success) {
      meta.cacheBytes = remoteResult.cacheBytes || meta.cacheBytes;
      prefetchCacheMeta = meta;
      prefetchCacheStale = false;
      clearLegacyPrefetchCache();
      return true;
    }

    clearLegacyPrefetchCache();
    prefetchCacheMeta = null;
    prefetchCacheStale = true;
    return false;
  }

  async function loadPrefetchCache() {
    if (prefetchCacheLoadPromise) return prefetchCacheLoadPromise;

    prefetchCacheLoadPromise = (async () => {
      const requestVersion = prefetchRequestVersion;
      const remoteCache = await readRemotePrefetchCacheWithRetry();

      if (requestVersion !== prefetchRequestVersion) return;

      clearLegacyPrefetchCache();

      let outcome = remoteCache.success
        ? applyLoadedPrefetchCache(remoteCache.rawCache, remoteCache.rawMeta)
        : "unavailable";

      if (outcome === "outdated") {
        await clearRemotePrefetchCache();
        prefetchCacheInvalidLoadCount = 0;
        outcome = "empty";
      }

      if (outcome === "invalid") {
        prefetchCacheInvalidLoadCount += 1;

        if (prefetchCacheInvalidLoadCount >= 2) {
          await clearRemotePrefetchCache();
          prefetchCacheInvalidLoadCount = 0;
          outcome = "empty";
        } else {
          outcome = "unavailable";
        }
      } else if (outcome === "loaded" || outcome === "empty") {
        prefetchCacheInvalidLoadCount = 0;
      }

      if (requestVersion !== prefetchRequestVersion) return;

      if (outcome === "loaded") {
        indexMenu(true);
        if (searchInput && normalizeText(searchInput.value)) {
          onInput();
        }
      } else {
        updatePrefetchCacheState();
      }

      dispatchSearchIndexState();
    })().finally(() => {
      prefetchCacheLoadPromise = null;
    });

    return prefetchCacheLoadPromise;
  }

  function clearPrefetchCache() {
    prefetchRequestVersion += 1;

    if (prefetchAbortController) {
      try {
        prefetchAbortController.abort();
      } catch (error) {
        // Ignore abort races while clearing cache state.
      }
    }

    prefetchedPageEntries = [];
    prefetchStatus.cancelable = false;
    prefetchStatus.canceled = false;
    prefetchStatus.cancelReason = "";
    prefetchStatus.lastIndexedAt = 0;
    prefetchStatus.errorCount = 0;
    prefetchStatus.routeErrorCount = 0;
    prefetchStatus.persistenceErrorCount = 0;
    prefetchStatus.recentErrors = [];
    prefetchStatus.indexedPages = [];
    prefetchStatus.routeCount = 0;
    prefetchStatus.indexedRouteCount = 0;
    isIndexed = false;
    prefetchCacheMeta = null;
    prefetchCacheStale = false;
    prefetchCacheInvalidLoadCount = 0;
    clearLegacyPrefetchCache();

    const clearPromise = clearRemotePrefetchCache().then((result) => {
      if (!result.success) {
        clearLegacyPrefetchCache();
      }

      return result;
    });

    indexMenu(true);
    dispatchSearchIndexState();

    return clearPromise;
  }

  function normalizePrefetchRequestOptions(forceRefresh) {
    if (typeof forceRefresh === "object" && forceRefresh) {
      return {
        forceRefresh: forceRefresh.forceRefresh === true,
        preserveExistingEntries: forceRefresh.preserveExistingEntries === true,
        routeHash: forceRefresh.routeHash || "",
      };
    }

    return {
      forceRefresh: forceRefresh === true,
      preserveExistingEntries: forceRefresh === true,
      routeHash: "",
    };
  }

  const LATIN_TO_CYRILLIC_SINGLE = {
    a: "а",
    b: "б",
    v: "в",
    g: "г",
    d: "д",
    e: "е",
    z: "з",
    i: "и",
    y: "й",
    k: "к",
    l: "л",
    m: "м",
    n: "н",
    o: "о",
    p: "п",
    r: "р",
    s: "с",
    t: "т",
    u: "у",
    f: "ф",
    c: "к",
    w: "в",
    x: "кс",
    q: "к",
  };

  function translate(text) {
    if (typeof window.protonT === "function") {
      try {
        const translated = window.protonT(text);
        if (translated && translated !== text) {
          return translated;
        }
      } catch (e) {
        // Игнорируем ошибки ProtonTranslations
      }
    }

    if (window.L && typeof L.tr === "function") {
      try {
        const translated = L.tr(text);
        if (translated && translated !== text) {
          return translated;
        }
      } catch (e) {
        // Игнорируем ошибки LuCI i18n
      }
    }

    return text;
  }

  function escapeHtml(unsafe) {
    return (unsafe || "").replace(/[&<"']/g, function (m) {
      switch (m) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#039;";
        default:
          return m;
      }
    });
  }

  function decodeHtmlEntities(value, sourceDocument) {
    const doc = sourceDocument || document;
    const textarea = doc.createElement("textarea");
    textarea.innerHTML = String(value || "");
    return String(textarea.value || "").trim();
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function mapCharacters(value, map) {
    return String(value || "")
      .split("")
      .map((char) => map[char] || char)
      .join("");
  }

  function transliterateCyrillicToLatin(value) {
    let normalized = normalizeText(value);

    CYRILLIC_TO_LATIN_SEQUENCES.forEach(([from, to]) => {
      normalized = normalized.split(from).join(to);
    });

    return normalized
      .split("")
      .map((char) => CYRILLIC_TO_LATIN_SINGLE[char] || char)
      .join("");
  }

  function transliterateLatinToCyrillic(value) {
    let normalized = normalizeText(value);

    LATIN_TO_CYRILLIC_SEQUENCES.forEach(([from, to]) => {
      normalized = normalized.split(from).join(to);
    });

    return normalized
      .split("")
      .map((char) => LATIN_TO_CYRILLIC_SINGLE[char] || char)
      .join("");
  }

  function buildQueryVariants(value) {
    const normalized = normalizeText(value);
    if (!normalized) return [];

    const variants = [normalized];
    const latToRu = normalizeText(
      mapCharacters(normalized, KEYBOARD_LAYOUT_LAT_TO_RU),
    );
    const ruToLat = normalizeText(
      mapCharacters(normalized, KEYBOARD_LAYOUT_RU_TO_LAT),
    );
    const translitToLat = normalizeText(
      transliterateCyrillicToLatin(normalized),
    );
    const translitToRu = normalizeText(
      transliterateLatinToCyrillic(normalized),
    );

    [latToRu, ruToLat, translitToLat, translitToRu].forEach((variant) => {
      if (variant && variants.indexOf(variant) === -1) {
        variants.push(variant);
      }
    });

    return variants;
  }

  function tokenize(value) {
    const normalized = normalizeText(value);
    return normalized
      ? normalized.split(/[^a-z0-9\u0400-\u04ff]+/i).filter(Boolean)
      : [];
  }

  function tokenizeVariants(values) {
    return dedupeStrings(
      [].concat(values || []).reduce((tokens, value) => {
        return tokens.concat(tokenize(value));
      }, []),
    );
  }

  function getBlobTokens(blob) {
    return tokenize(blob || "");
  }

  function isFuzzyTokenMatch(term, candidate) {
    const normalizedTerm = normalizeText(term);
    const normalizedCandidate = normalizeText(candidate);
    if (
      normalizedTerm.length < MIN_FUZZY_TOKEN_LENGTH ||
      normalizedCandidate.length < MIN_FUZZY_TOKEN_LENGTH
    ) {
      return false;
    }

    if (
      Math.abs(normalizedTerm.length - normalizedCandidate.length) > 1 ||
      normalizedTerm[0] !== normalizedCandidate[0]
    ) {
      return false;
    }

    let mismatches = 0;
    const minLength = Math.min(
      normalizedTerm.length,
      normalizedCandidate.length,
    );

    for (let index = 0; index < minLength; index++) {
      if (normalizedTerm[index] !== normalizedCandidate[index]) {
        mismatches += 1;
        if (mismatches > 1) return false;
      }
    }

    mismatches += Math.abs(normalizedTerm.length - normalizedCandidate.length);
    return mismatches <= 1;
  }

  function findFuzzyMatches(terms, blob) {
    if (!terms.length || !blob) return [];

    const candidates = getBlobTokens(blob);
    const matches = [];

    terms.forEach((term) => {
      const fuzzyMatch = candidates.find((candidate) =>
        isFuzzyTokenMatch(term, candidate),
      );
      if (fuzzyMatch) {
        matches.push({ term: term, candidate: fuzzyMatch });
      }
    });

    return matches;
  }

  function dedupeStrings(values) {
    const unique = [];

    values.forEach((value) => {
      const normalized = normalizeText(value);
      if (!normalized) return;

      if (
        unique.some(
          (existingValue) => normalizeText(existingValue) === normalized,
        )
      ) {
        return;
      }

      unique.push(String(value).trim());
    });

    return unique;
  }

  function mergeAltTexts(item, values) {
    dedupeStrings(values).forEach((value) => {
      if (normalizeText(value) === normalizeText(item.text)) return;

      if (
        item.altTexts.some(
          (existingValue) =>
            normalizeText(existingValue) === normalizeText(value),
        )
      ) {
        return;
      }

      item.altTexts.push(value);
    });
  }

  function getSearchPlaceholder() {
    return translate("Search...");
  }

  function getNoResultsText() {
    return translate("No results found");
  }

  function getNoResultsSearchIndexPrompt() {
    return `${translate("Search Page Index")}?`;
  }

  function getNoResultsSearchIndexActionText() {
    return translate("Index Pages Now");
  }

  function getSemanticRegistry() {
    if (
      window.ProtonSearchData &&
      Array.isArray(window.ProtonSearchData.semanticEntries)
    ) {
      return window.ProtonSearchData.semanticEntries;
    }

    return [];
  }

  function getSemanticEntryCount() {
    return getSemanticRegistry().length;
  }

  function buildHrefFromPath(path) {
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    if (!normalizedPath) return "";

    if (window.L && typeof L.url === "function") {
      return L.url.apply(L, normalizedPath.split("/"));
    }

    return "/" + normalizedPath;
  }

  function getCurrentPageHref() {
    return String(window.location.href || "").split("#")[0];
  }

  function normalizeIndexedHref(href) {
    try {
      const url = new URL(String(href || ""), window.location.href);
      const normalizedHref = url.href;
      return url.hash ? normalizedHref : normalizedHref.replace(/#$/, "");
    } catch (e) {
      return "";
    }
  }

  function normalizeRouteHref(href) {
    try {
      return new URL(String(href || ""), window.location.href).href.split(
        "#",
      )[0];
    } catch (e) {
      return "";
    }
  }

  function resolveCompatibleRoutePath(path) {
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    const candidates =
      normalizedPath === "admin/network/network" ||
      normalizedPath === "admin/network/interfaces"
        ? INTERFACE_ROUTE_CANDIDATES
        : [normalizedPath];
    const routeLinks = Array.from(
      document.querySelectorAll(
        "#mainmenu a[href], #modemenu a[href], #tabmenu a[href]",
      ),
    );
    const matchedCandidate = candidates.find((candidate) => {
      const candidateHref = normalizeRouteHref(buildHrefFromPath(candidate));
      if (!candidateHref) return false;

      return routeLinks.some(
        (link) =>
          normalizeRouteHref(link.getAttribute("href")) === candidateHref,
      );
    });

    return matchedCandidate || candidates[0] || normalizedPath;
  }

  function isSystemSettingsPage() {
    return !!document.body.dataset.page?.includes("admin-system-system");
  }

  function getSearchIndexSettingsHash() {
    return `#${SEARCH_INDEX_SETTINGS_HASH}`;
  }

  function getSearchIndexSettingsHref() {
    const routeHref = buildHrefFromPath(SEARCH_INDEX_SETTINGS_ROUTE);
    if (!routeHref) return "";

    try {
      const targetUrl = new URL(routeHref, window.location.href);
      targetUrl.hash = SEARCH_INDEX_SETTINGS_HASH;
      return targetUrl.toString();
    } catch (error) {
      return `${window.location.origin}/${SEARCH_INDEX_SETTINGS_ROUTE}${getSearchIndexSettingsHash()}`;
    }
  }

  function requestSearchIndexPanelFocus() {
    window.dispatchEvent(
      new CustomEvent(SEARCH_INDEX_SETTINGS_FOCUS_EVENT, {
        detail: { source: "search-no-results" },
      }),
    );
  }

  function openSearchIndexSettingsFromSearch() {
    const settingsHash = getSearchIndexSettingsHash();

    if (isSystemSettingsPage()) {
      if (window.location.hash !== settingsHash) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}${settingsHash}`,
        );
      }

      requestSearchIndexPanelFocus();
      return;
    }

    const targetHref = getSearchIndexSettingsHref();
    if (targetHref) {
      window.location.href = targetHref;
      return;
    }

    window.location.href = `/${SEARCH_INDEX_SETTINGS_ROUTE}${settingsHash}`;
  }

  function isIndexableRouteHref(href) {
    try {
      const url = new URL(String(href || ""), window.location.href);
      const scriptName =
        (window.L && L.env && L.env.scriptname) || "/cgi-bin/luci";
      if (url.origin !== window.location.origin) return false;
      if (url.pathname.indexOf(scriptName + "/admin") !== 0) return false;
      if (/\/logout$/.test(url.pathname)) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function getPrefetchRouteList(options) {
    const settings = options || {};
    const routeMap = Object.create(null);
    const currentPageHref = getCurrentPageHref();
    const selectors = ["#mainmenu a[href]", "#modemenu a[href]"];

    if (settings.includeTabMenu !== false) {
      selectors.push("#tabmenu a[href]");
    }

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((link) => {
        const href = normalizeRouteHref(link.getAttribute("href"));
        if (!href || !isIndexableRouteHref(href)) return;
        if (settings.includeCurrentPage !== true && href === currentPageHref) {
          return;
        }
        routeMap[href] = true;
      });
    });

    return Object.keys(routeMap);
  }

  function getDocumentPageTitle(sourceDocument) {
    if (!sourceDocument) return "";

    return getElementText(
      sourceDocument.querySelector(
        "#view h2, #maincontent h2, .main h2, .cbi-map h2",
      ),
    );
  }

  function getClosestTabTitle(sourceDocument, node) {
    const pane =
      node && typeof node.closest === "function"
        ? node.closest("[data-tab][data-tab-title]")
        : null;
    if (!pane) return "";

    return decodeHtmlEntities(
      pane.getAttribute("data-tab-title") || "",
      sourceDocument,
    );
  }

  function getStableTargetNode(node) {
    if (!node || typeof node.closest !== "function") return null;

    return node.closest(
      ".cbi-value[id], .cbi-section-table-row[id], tr[id], table[id], [data-tab][id], fieldset[id], .cbi-section[id], .cbi-section-node[id], .cbi-map[id], [id]",
    );
  }

  function getPrefetchedPageContext(sourceDocument, node, pageTitle) {
    return dedupeStrings([
      pageTitle || getDocumentPageTitle(sourceDocument),
      getClosestTabTitle(sourceDocument, node),
      getClosestSectionText(node),
    ]).join(" › ");
  }

  function registerPrefetchedEntry(
    prefetchedItems,
    prefetchedByHref,
    text,
    href,
    context,
    altTexts,
  ) {
    const normalizedText = String(text || "").trim();
    if (!shouldIndexPageText(normalizedText) || !href) return null;

    let item = prefetchedByHref[href];
    if (!item) {
      item = {
        text: normalizedText,
        href: href,
        altTexts: [],
        pageContext: context || "",
      };
      prefetchedByHref[href] = item;
      prefetchedItems.push(item);
    } else if (item.text !== normalizedText) {
      mergeAltTexts(item, [normalizedText]);
    }

    if (
      context &&
      (!item.pageContext || context.length > item.pageContext.length)
    ) {
      item.pageContext = context;
    }

    mergeAltTexts(item, altTexts || []);
    return item;
  }

  function collectDocumentTabEntries(
    sourceDocument,
    baseHref,
    prefetchedItems,
    prefetchedByHref,
  ) {
    const pageTitle = getDocumentPageTitle(sourceDocument);

    sourceDocument
      .querySelectorAll("[data-tab][data-tab-title][id]")
      .forEach((pane) => {
        const title = decodeHtmlEntities(
          pane.getAttribute("data-tab-title") || "",
          sourceDocument,
        );
        if (!shouldIndexPageText(title)) return;

        registerPrefetchedEntry(
          prefetchedItems,
          prefetchedByHref,
          title,
          baseHref + "#" + pane.id,
          dedupeStrings([pageTitle, getClosestSectionText(pane)]).join(" › "),
          [pane.getAttribute("data-tab") || ""],
        );
      });
  }

  function collectDocumentStructuredEntries(
    sourceDocument,
    baseHref,
    prefetchedItems,
    prefetchedByHref,
  ) {
    const pageTitle = getDocumentPageTitle(sourceDocument);
    const sources = [
      {
        selector: "#view .cbi-value-title, #maincontent .cbi-value-title",
        getText: getElementText,
      },
      {
        selector: "#view fieldset > legend, #maincontent fieldset > legend",
        getText: getElementText,
      },
      {
        selector:
          "#view h2, #view h3, #view h4, #maincontent h2, #maincontent h3, #maincontent h4",
        getText: getElementText,
      },
      {
        selector: "#view table th, #maincontent table th",
        getText: getElementText,
      },
      {
        selector: "#view tr[data-title], #maincontent tr[data-title]",
        getText: (node) => node.getAttribute("data-title") || "",
      },
      {
        selector:
          "#view .cbi-button, #view button, #maincontent .cbi-button, #maincontent button",
        getText: getElementText,
      },
    ];

    sources.forEach((source) => {
      sourceDocument.querySelectorAll(source.selector).forEach((node) => {
        const text = String(source.getText(node) || "").trim();
        if (!shouldIndexPageText(text)) return;

        const targetNode = getStableTargetNode(node);
        if (!targetNode || !targetNode.id) return;

        registerPrefetchedEntry(
          prefetchedItems,
          prefetchedByHref,
          text,
          baseHref + "#" + targetNode.id,
          getPrefetchedPageContext(sourceDocument, node, pageTitle),
          [],
        );
      });
    });
  }

  function collectDocumentTabLinkEntries(
    sourceDocument,
    prefetchedItems,
    prefetchedByHref,
  ) {
    const pageTitle = getDocumentPageTitle(sourceDocument);

    sourceDocument
      .querySelectorAll(".cbi-tabmenu a[href], #tabmenu a[href]")
      .forEach((link) => {
        const text = getElementText(link);
        const href = normalizeRouteHref(link.getAttribute("href"));

        if (
          !shouldIndexPageText(text) ||
          !href ||
          !isIndexableRouteHref(href)
        ) {
          return;
        }

        registerPrefetchedEntry(
          prefetchedItems,
          prefetchedByHref,
          text,
          href,
          pageTitle,
          [],
        );
      });
  }

  function extractPrefetchedPageEntries(sourceDocument, routeHref) {
    if (!sourceDocument) return [];

    const prefetchedItems = [];
    const prefetchedByHref = Object.create(null);
    const baseHref = normalizeRouteHref(routeHref);
    if (!baseHref) return prefetchedItems;

    const pageTitle = getDocumentPageTitle(sourceDocument);
    if (shouldIndexPageText(pageTitle)) {
      registerPrefetchedEntry(
        prefetchedItems,
        prefetchedByHref,
        pageTitle,
        baseHref,
        pageTitle,
        [],
      );
    }

    collectDocumentTabEntries(
      sourceDocument,
      baseHref,
      prefetchedItems,
      prefetchedByHref,
    );
    collectDocumentTabLinkEntries(
      sourceDocument,
      prefetchedItems,
      prefetchedByHref,
    );
    collectDocumentStructuredEntries(
      sourceDocument,
      baseHref,
      prefetchedItems,
      prefetchedByHref,
    );

    return prefetchedItems;
  }

  function isPrefetchDocumentReady(sourceDocument) {
    if (!sourceDocument) return false;

    const view = sourceDocument.querySelector("#view");
    if (!view) return false;

    if (
      view.querySelector(
        "[data-tab][data-tab-title], .cbi-value-title, fieldset, table, .cbi-section, .cbi-map",
      )
    ) {
      return true;
    }

    return (
      !view.querySelector(".spinning") &&
      normalizeText(view.textContent).length > 0
    );
  }

  function waitForPrefetchRender(frame) {
    return new Promise((resolve) => {
      const startedAt = Date.now();

      function check() {
        const elapsed = Date.now() - startedAt;
        let sourceDocument = null;

        try {
          sourceDocument = frame.contentDocument;
        } catch (e) {
          resolve(null);
          return;
        }

        if (isPrefetchDocumentReady(sourceDocument)) {
          resolve(sourceDocument);
          return;
        }

        if (elapsed >= PREFETCH_PAGE_TIMEOUT) {
          resolve(sourceDocument);
          return;
        }

        window.setTimeout(check, PREFETCH_POLL_INTERVAL);
      }

      check();
    });
  }

  async function preindexRoute(href, signal) {
    return new Promise((resolve, reject) => {
      if (signal && signal.aborted) {
        reject(
          createPrefetchAbortError(
            "Search indexing canceled before route prefetch.",
          ),
        );
        return;
      }

      const frame = document.createElement("iframe");
      frame.name = PREFETCH_FRAME_NAME;
      frame.tabIndex = -1;
      frame.setAttribute("aria-hidden", "true");
      frame.style.cssText = PREFETCH_FRAME_STYLE;
      let settled = false;
      let navigationTimerId = null;
      let abortHandler = null;

      const cleanup = () => {
        if (navigationTimerId) {
          window.clearTimeout(navigationTimerId);
          navigationTimerId = null;
        }
        frame.onload = null;
        frame.onerror = null;
        if (signal && abortHandler) {
          signal.removeEventListener("abort", abortHandler);
          abortHandler = null;
        }
        try {
          frame.src = "about:blank";
        } catch (e) {
          // Ignore teardown failures while resetting the iframe.
        }
        if (frame.parentNode) {
          frame.parentNode.removeChild(frame);
        }
      };

      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback(value);
      };

      navigationTimerId = window.setTimeout(() => {
        finish(reject, new Error(`Prefetch navigation timed out: ${href}`));
      }, PREFETCH_NAVIGATION_TIMEOUT);

      frame.onerror = () => {
        finish(reject, new Error(`Prefetch navigation failed: ${href}`));
      };

      if (signal) {
        abortHandler = () => {
          finish(reject, createPrefetchAbortError("Search indexing canceled."));
        };
        signal.addEventListener("abort", abortHandler, { once: true });
      }

      frame.onload = async () => {
        try {
          const sourceDocument = await waitForPrefetchRender(frame);
          const entries = extractPrefetchedPageEntries(sourceDocument, href);
          finish(resolve, entries);
        } catch (error) {
          finish(reject, error);
        }
      };

      document.body.appendChild(frame);
      frame.src = href;
    });
  }

  async function ensurePrefetchedPagesIndexed(forceRefresh) {
    const request = normalizePrefetchRequestOptions(forceRefresh);

    if (isPrefetchFrame) return [];
    if (preindexLoading) return preindexLoading;
    if (prefetchCacheLoadPromise) {
      await prefetchCacheLoadPromise;
      if (preindexLoading) return preindexLoading;
    }
    if (
      !request.forceRefresh &&
      prefetchedPageEntries.length &&
      !prefetchCacheStale
    ) {
      dispatchSearchIndexState();
      return prefetchedPageEntries;
    }

    preindexLoading = (async () => {
      const requestVersion = ++prefetchRequestVersion;
      prefetchAbortController =
        typeof AbortController === "function" ? new AbortController() : null;
      const prefetchAbortSignal = prefetchAbortController
        ? prefetchAbortController.signal
        : null;
      const routes = getCurrentPrefetchRoutes();
      const routeHash = request.routeHash || getCurrentPrefetchRouteHash();
      const existingEntries = request.preserveExistingEntries
        ? prefetchedPageEntries.slice()
        : [];
      const nextPrefetchedEntries = [];
      let canceled = false;

      prefetchStatus.inProgress = true;
      prefetchStatus.cancelable = true;
      prefetchStatus.canceled = false;
      prefetchStatus.cancelReason = "";
      prefetchStatus.routeCount = routes.length;
      prefetchStatus.indexedRouteCount = 0;
      prefetchStatus.errorCount = 0;
      prefetchStatus.routeErrorCount = 0;
      prefetchStatus.persistenceErrorCount = 0;
      prefetchStatus.recentErrors = [];
      prefetchStatus.indexedPages = [];
      dispatchSearchIndexState();

      for (let index = 0; index < routes.length; index++) {
        if (prefetchAbortSignal && prefetchAbortSignal.aborted) {
          canceled = true;
          break;
        }

        const route = routes[index];
        try {
          const entries = await preindexRoute(route, prefetchAbortSignal);
          if (requestVersion !== prefetchRequestVersion) {
            canceled = true;
            return prefetchedPageEntries;
          }
          if (Array.isArray(entries) && entries.length) {
            nextPrefetchedEntries.push.apply(nextPrefetchedEntries, entries);
          }
          recordPrefetchIndexedPage(route, entries);
          prefetchStatus.indexedRouteCount = index + 1;
        } catch (error) {
          if (
            isPrefetchAbortError(error) ||
            (prefetchAbortSignal && prefetchAbortSignal.aborted) ||
            requestVersion !== prefetchRequestVersion
          ) {
            canceled = true;
            break;
          }

          prefetchStatus.errorCount += 1;
          prefetchStatus.routeErrorCount += 1;
          recordPrefetchError(route, error);
          console.warn("[Proton2025] Failed to preindex route:", route, error);
        } finally {
          dispatchSearchIndexState();
        }

        if (index < routes.length - 1) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, PREFETCH_ROUTE_DELAY);
          });
        }
      }

      if (requestVersion !== prefetchRequestVersion) {
        prefetchStatus.canceled = true;
        return prefetchedPageEntries;
      }

      if (canceled) {
        prefetchedPageEntries = existingEntries;
        prefetchStatus.canceled = true;
        if (!prefetchStatus.cancelReason) {
          prefetchStatus.cancelReason = "user";
        }
        updatePrefetchCacheState(routeHash);
        dispatchSearchIndexState();
        return prefetchedPageEntries;
      }

      const completedAt = Date.now();
      const shouldReplaceCache =
        (prefetchStatus.errorCount === 0 && nextPrefetchedEntries.length > 0) ||
        (routes.length === 0 && !existingEntries.length);

      if (shouldReplaceCache) {
        prefetchedPageEntries = nextPrefetchedEntries;
        prefetchStatus.lastIndexedAt = completedAt;
        if (!(await savePrefetchCache(routeHash, completedAt))) {
          prefetchStatus.errorCount += 1;
          prefetchStatus.persistenceErrorCount += 1;
          recordPrefetchError(
            "search cache persistence",
            "Failed to persist search cache on the router.",
          );
          console.warn("[Proton2025] Failed to persist search prefetch cache.");
        }
        indexMenu(true);

        if (searchInput && normalizeText(searchInput.value)) {
          onInput();
        }
      } else {
        prefetchedPageEntries = existingEntries;
        dispatchSearchIndexState();
      }

      updatePrefetchCacheState(routeHash);

      return prefetchedPageEntries;
    })().finally(() => {
      prefetchStatus.inProgress = false;
      prefetchStatus.cancelable = false;
      prefetchAbortController = null;
      preindexLoading = null;
      dispatchSearchIndexState();
    });

    return preindexLoading;
  }

  function activateCurrentTabFromHash(retriesLeft) {
    const targetId = String(window.location.hash || "").replace(/^#/, "");
    if (!targetId || targetId.indexOf(LIVE_TARGET_PREFIX) === 0) {
      clearHashTargetHighlight();
      return;
    }

    const targetNode = document.getElementById(targetId);
    if (!targetNode) {
      if (retriesLeft > 0) {
        window.setTimeout(() => {
          activateCurrentTabFromHash(retriesLeft - 1);
        }, HASH_TAB_RETRY_DELAY);
      }
      return;
    }

    const pane =
      targetNode && typeof targetNode.closest === "function"
        ? targetNode.closest("[data-tab][data-tab-title]")
        : null;

    if (!pane) {
      if (!flashHashTarget(targetNode) && retriesLeft > 0) {
        window.setTimeout(() => {
          activateCurrentTabFromHash(retriesLeft - 1);
        }, HASH_TAB_RETRY_DELAY);
      }
      return;
    }

    const targetTitle = normalizeText(
      decodeHtmlEntities(pane.getAttribute("data-tab-title") || "", document),
    );
    if (!targetTitle) return;

    const link = Array.from(document.querySelectorAll(".cbi-tabmenu a")).find(
      (tabLink) => normalizeText(getElementText(tabLink)) === targetTitle,
    );

    if (link) {
      link.click();
    }

    window.setTimeout(() => {
      if (targetNode && typeof targetNode.scrollIntoView === "function") {
        targetNode.scrollIntoView({ block: "center" });
      }

      if (!flashHashTarget(targetNode) && retriesLeft > 0) {
        activateCurrentTabFromHash(retriesLeft - 1);
      }
    }, 40);
  }

  function getHashHighlightNode(targetNode) {
    if (!targetNode || typeof targetNode.closest !== "function") {
      return targetNode || null;
    }

    return (
      targetNode.closest(
        ".cbi-value, .cbi-section-table-row, tr, table, [data-tab][data-tab-title], fieldset, .cbi-section, .cbi-section-node, .cbi-map",
      ) || targetNode
    );
  }

  function clearHashTargetHighlight() {
    if (hashHighlightTimerId) {
      window.clearTimeout(hashHighlightTimerId);
      hashHighlightTimerId = null;
    }

    if (activeHashHighlightAnimation) {
      activeHashHighlightAnimation.cancel();
      activeHashHighlightAnimation = null;
    }

    if (activeHashHighlightNode && activeHashHighlightRestore) {
      activeHashHighlightNode.style.outline =
        activeHashHighlightRestore.outline;
      activeHashHighlightNode.style.outlineOffset =
        activeHashHighlightRestore.outlineOffset;
      activeHashHighlightRestore = null;
    }

    if (activeHashHighlightNode && activeHashHighlightNode.classList) {
      activeHashHighlightNode.classList.remove(HASH_HIGHLIGHT_CLASS);
    }

    activeHashHighlightNode = null;
  }

  function flashHashTarget(targetNode) {
    const highlightNode = getHashHighlightNode(targetNode);

    if (
      !highlightNode ||
      !highlightNode.classList ||
      typeof highlightNode.getClientRects !== "function" ||
      !highlightNode.getClientRects().length
    ) {
      return false;
    }

    clearHashTargetHighlight();

    highlightNode.classList.remove(HASH_HIGHLIGHT_CLASS);
    void highlightNode.offsetWidth;
    highlightNode.classList.add(HASH_HIGHLIGHT_CLASS);

    activeHashHighlightRestore = {
      outline: highlightNode.style.outline,
      outlineOffset: highlightNode.style.outlineOffset,
    };
    highlightNode.style.outline = "2px solid transparent";
    highlightNode.style.outlineOffset = "3px";

    if (typeof highlightNode.animate === "function") {
      activeHashHighlightAnimation = highlightNode.animate(
        [
          {
            backgroundColor: "rgba(79, 141, 255, 0)",
            boxShadow: "0 0 0 0 rgba(79, 141, 255, 0)",
            outlineColor: "rgba(79, 141, 255, 0)",
          },
          {
            backgroundColor: "rgba(79, 141, 255, 0.16)",
            boxShadow: "0 0 0 8px rgba(79, 141, 255, 0.14)",
            outlineColor: "rgba(79, 141, 255, 0.92)",
            offset: 0.18,
          },
          {
            backgroundColor: "rgba(79, 141, 255, 0)",
            boxShadow: "0 0 0 0 rgba(79, 141, 255, 0)",
            outlineColor: "rgba(79, 141, 255, 0)",
          },
        ],
        {
          duration: HASH_HIGHLIGHT_DURATION,
          easing: "ease-out",
        },
      );
    }

    activeHashHighlightNode = highlightNode;

    if (hashHighlightTimerId) {
      window.clearTimeout(hashHighlightTimerId);
    }

    hashHighlightTimerId = window.setTimeout(() => {
      if (
        activeHashHighlightNode === highlightNode &&
        highlightNode.classList
      ) {
        clearHashTargetHighlight();
      }

      hashHighlightTimerId = null;
    }, HASH_HIGHLIGHT_DURATION);

    return true;
  }

  function createLiveSlug(value, fallback) {
    const slug = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || fallback;
  }

  function buildLiveHref(path, kind, key) {
    const baseHref = buildHrefFromPath(resolveCompatibleRoutePath(path));
    if (!baseHref) return "";

    return (
      baseHref +
      "#" +
      LIVE_TARGET_PREFIX +
      kind +
      "-" +
      createLiveSlug(key, kind)
    );
  }

  function buildLiveNavigateHref(path) {
    return buildHrefFromPath(resolveCompatibleRoutePath(path));
  }

  function normalizeOptionList(value) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item || "").trim()).filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(/\s+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (value == null) return [];

    const normalized = String(value).trim();
    return normalized ? [normalized] : [];
  }

  async function ubusCall(object, method, payload) {
    const requestBody = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "call",
      params: [
        (window.L && L.env && L.env.sessionid) ||
          "00000000000000000000000000000000",
        object,
        method,
        payload || {},
      ],
    };

    if (window.L && L.Request) {
      const response = await L.Request.post(
        (L.env && L.env.ubuspath) || "/ubus/",
        requestBody,
      );
      return response.json();
    }

    const response = await fetch("/ubus/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    return await response.json();
  }

  function extractUciValues(result) {
    const data =
      result &&
      result.result &&
      result.result[1] &&
      typeof result.result[1] === "object"
        ? result.result[1]
        : null;

    if (data && data.values && typeof data.values === "object") {
      return data.values;
    }

    return {};
  }

  function extractUbusPayload(result) {
    if (
      result &&
      result.result &&
      result.result[1] &&
      typeof result.result[1] === "object"
    ) {
      return result.result[1];
    }

    return {};
  }

  function getConfigSections(values, expectedType) {
    return Object.keys(values || {}).reduce((sections, sectionName) => {
      const section = values[sectionName];
      if (!section || typeof section !== "object") return sections;

      const normalizedSection = Object.assign(
        { ".name": sectionName },
        section,
      );
      if (
        expectedType &&
        String(normalizedSection[".type"] || "").trim() !== expectedType
      ) {
        return sections;
      }

      sections.push(normalizedSection);
      return sections;
    }, []);
  }

  function createLiveEntry(text, href, altTexts, profile, navigateHref) {
    if (!String(text || "").trim() || !href) return null;

    return {
      text: String(text).trim(),
      href: href,
      navigateHref: navigateHref || href,
      altTexts: dedupeStrings(altTexts || []),
      profile: profile || null,
    };
  }

  function getIpv4Addresses(runtime) {
    return dedupeStrings(
      (Array.isArray(runtime && runtime["ipv4-address"])
        ? runtime["ipv4-address"]
        : []
      )
        .map((entry) =>
          entry && entry.address ? String(entry.address).trim() : "",
        )
        .filter(Boolean),
    );
  }

  function getIpv6Addresses(runtime) {
    return dedupeStrings(
      (Array.isArray(runtime && runtime["ipv6-address"])
        ? runtime["ipv6-address"]
        : []
      )
        .map((entry) =>
          entry && entry.address ? String(entry.address).trim() : "",
        )
        .filter(Boolean),
    );
  }

  function collectRuntimeInterfaceItems(payload) {
    const interfaces = Array.isArray(payload && payload.interface)
      ? payload.interface
      : [];

    return interfaces
      .map((runtime) => {
        const name = String(
          runtime && runtime.interface ? runtime.interface : "",
        ).trim();
        if (!name) return null;

        const ipv4Addresses = getIpv4Addresses(runtime);
        const ipv6Addresses = getIpv6Addresses(runtime);
        const devices = dedupeStrings(
          []
            .concat(runtime && runtime.device ? [runtime.device] : [])
            .concat(runtime && runtime.l3_device ? [runtime.l3_device] : []),
        );
        const state = runtime && runtime.up ? "UP" : "DOWN";
        const keywords = dedupeStrings(
          [name, state]
            .concat(devices)
            .concat(ipv4Addresses)
            .concat(ipv6Addresses)
            .concat(runtime && runtime.proto ? [runtime.proto] : []),
        );
        const details = dedupeStrings(
          [state].concat(devices).concat(ipv4Addresses).concat(ipv6Addresses),
        );

        return createLiveEntry(
          name,
          buildLiveHref("admin/network/network", "interface", name),
          keywords,
          {
            category: translate("Network interfaces"),
            description: details.join(" · "),
            keywords: keywords,
            boost: 20,
          },
          buildLiveNavigateHref("admin/network/network"),
        );
      })
      .filter(Boolean);
  }

  function collectRuntimeLeaseItems(payload) {
    const ipv4Leases = Array.isArray(payload && payload.dhcp_leases)
      ? payload.dhcp_leases
      : [];
    const ipv6Leases = Array.isArray(payload && payload.dhcp6_leases)
      ? payload.dhcp6_leases
      : [];

    return ipv4Leases
      .map((lease) => ({
        lease: lease,
        version: 4,
        href: buildHrefFromPath("admin/status/overview") + "#status_leases",
      }))
      .concat(
        ipv6Leases.map((lease) => ({
          lease: lease,
          version: 6,
          href: buildHrefFromPath("admin/status/overview") + "#status_leases6",
        })),
      )
      .map((entry) => {
        const lease = entry.lease || {};
        const hostName = String(
          lease.hostname || lease.host || lease.name || "",
        ).trim();
        const address = String(
          lease.ipaddr || lease.ip6addr || lease.address || "",
        ).trim();
        const mac = String(lease.macaddr || lease.mac || "").trim();
        const title = hostName || address || mac;
        if (!title) return null;

        const leaseTag = entry.version === 6 ? "DHCPv6" : "DHCP";
        const keywords = dedupeStrings([
          title,
          hostName,
          address,
          mac,
          leaseTag,
        ]);
        const details = dedupeStrings([leaseTag, address, mac]);

        return createLiveEntry(title, entry.href, keywords, {
          category: leaseTag,
          description: details.join(" · "),
          keywords: keywords,
          boost: 14,
        });
      })
      .filter(Boolean);
  }

  function collectLiveInterfaceItems(values) {
    return getConfigSections(values, "interface")
      .map((section) => {
        const name = String(section[".name"] || "").trim();
        if (!name) return null;

        const proto = String(section.proto || "").trim();
        const devices = dedupeStrings(
          normalizeOptionList(section.device).concat(
            normalizeOptionList(section.ifname),
          ),
        );
        const details = dedupeStrings(
          []
            .concat(proto ? [proto.toUpperCase()] : [])
            .concat(devices.length ? [devices.join(", ")] : []),
        );
        const keywords = dedupeStrings([name].concat(devices).concat(proto));

        return createLiveEntry(
          name,
          buildLiveHref("admin/network/network", "interface", name),
          keywords,
          {
            category: translate("Network interfaces"),
            description: details.join(" · "),
            keywords: keywords,
            boost: 18,
          },
          buildLiveNavigateHref("admin/network/network"),
        );
      })
      .filter(Boolean);
  }

  function collectLiveWirelessItems(values) {
    return getConfigSections(values, "wifi-iface")
      .map((section) => {
        const sectionName = String(section[".name"] || "").trim();
        const ssid = String(section.ssid || "").trim();
        const title = ssid || sectionName;
        if (!title) return null;

        const networkNames = normalizeOptionList(section.network);
        const keywords = dedupeStrings(
          [title, sectionName]
            .concat(networkNames)
            .concat(normalizeOptionList(section.device))
            .concat(normalizeOptionList(section.mode))
            .concat(normalizeOptionList(section.encryption)),
        );
        const details = dedupeStrings(
          []
            .concat(networkNames.length ? [networkNames.join(", ")] : [])
            .concat(normalizeOptionList(section.device))
            .concat(normalizeOptionList(section.mode))
            .concat(normalizeOptionList(section.encryption)),
        );

        return createLiveEntry(
          title,
          buildLiveHref("admin/network/wireless", "wifi", title),
          keywords,
          {
            category: translate("WiFi"),
            description: details.join(" · "),
            keywords: keywords,
            boost: 24,
          },
          buildLiveNavigateHref("admin/network/wireless"),
        );
      })
      .filter(Boolean);
  }

  function collectLiveDhcpHostItems(values) {
    return getConfigSections(values, "host")
      .map((section) => {
        const hostName = String(section.name || "").trim();
        const ipAddress = String(section.ip || section.hostid || "").trim();
        const macs = normalizeOptionList(section.mac);
        const title = hostName || ipAddress || macs[0];
        if (!title) return null;

        const keywords = dedupeStrings(
          [title, hostName, ipAddress].concat(macs),
        );
        const details = dedupeStrings([ipAddress].concat(macs));

        return createLiveEntry(
          title,
          buildLiveHref("admin/network/dhcp", "host", title),
          keywords,
          {
            category: translate("DHCP"),
            description: details.join(" · "),
            keywords: keywords,
            boost: 16,
          },
          buildLiveNavigateHref("admin/network/dhcp"),
        );
      })
      .filter(Boolean);
  }

  function collectLiveDataEntries(indexedItems, indexedByHref) {
    liveDataItems.forEach((entry) => {
      const item = registerIndexedItem(
        indexedItems,
        indexedByHref,
        entry.text,
        entry.href,
      );

      if (!item) return;

      mergeAltTexts(item, entry.altTexts);

      if (entry.navigateHref) {
        item.navigateHref = normalizeIndexedHref(entry.navigateHref);
      }

      if (entry.profile) {
        item.semanticProfiles.push(entry.profile);
      }
    });
  }

  async function ensureLiveDataLoaded() {
    if (liveDataLoaded) return liveDataItems;
    if (liveDataLoading) return liveDataLoading;

    liveDataLoading = Promise.allSettled([
      ubusCall("uci", "get", { config: "network" }),
      ubusCall("uci", "get", { config: "wireless" }),
      ubusCall("uci", "get", { config: "dhcp" }),
      ubusCall("network.interface", "dump", {}),
      ubusCall("luci-rpc", "getDHCPLeases", {}),
    ])
      .then((results) => {
        const networkValues =
          results[0] && results[0].status === "fulfilled"
            ? extractUciValues(results[0].value)
            : {};
        const wirelessValues =
          results[1] && results[1].status === "fulfilled"
            ? extractUciValues(results[1].value)
            : {};
        const dhcpValues =
          results[2] && results[2].status === "fulfilled"
            ? extractUciValues(results[2].value)
            : {};
        const runtimeInterfacePayload =
          results[3] && results[3].status === "fulfilled"
            ? extractUbusPayload(results[3].value)
            : {};
        const runtimeLeasePayload =
          results[4] && results[4].status === "fulfilled"
            ? extractUbusPayload(results[4].value)
            : {};

        liveDataItems = []
          .concat(collectLiveInterfaceItems(networkValues))
          .concat(collectLiveWirelessItems(wirelessValues))
          .concat(collectLiveDhcpHostItems(dhcpValues))
          .concat(collectRuntimeInterfaceItems(runtimeInterfacePayload))
          .concat(collectRuntimeLeaseItems(runtimeLeasePayload));
        liveDataLoaded = true;

        indexMenu(true);

        if (searchInput && normalizeText(searchInput.value)) {
          onInput();
        }

        return liveDataItems;
      })
      .catch((error) => {
        console.warn("[Proton2025] Failed to load live search data:", error);
        return [];
      })
      .finally(() => {
        liveDataLoading = null;
      });

    return liveDataLoading;
  }

  function createMenuItem(text, href, navigateHref) {
    return {
      text: text,
      href: href,
      navigateHref: navigateHref || href,
      altTexts: [],
      pageContext: "",
      semanticProfiles: [],
      semanticKeywords: [],
      semanticCategories: [],
      semanticDescription: "",
      semanticBoost: 0,
      titleBlob: "",
      keywordBlob: "",
      descriptionBlob: "",
      categoryBlob: "",
      semanticBlob: "",
    };
  }

  function registerIndexedItem(
    indexedItems,
    indexedByHref,
    text,
    href,
    navigateHref,
  ) {
    const normalizedText = String(text || "").trim();
    const rawHref = String(href || "").trim();
    const normalizedHref = normalizeIndexedHref(href);
    if (
      !normalizedText ||
      !rawHref ||
      !normalizedHref ||
      rawHref === "#" ||
      rawHref.indexOf("javascript:") === 0
    ) {
      return null;
    }

    const normalizedNavigateHref =
      normalizeIndexedHref(navigateHref || href) || normalizedHref;

    let item = indexedByHref[normalizedHref];
    if (!item) {
      item = createMenuItem(
        normalizedText,
        normalizedHref,
        normalizedNavigateHref,
      );
      indexedByHref[normalizedHref] = item;
      indexedItems.push(item);
      return item;
    }

    if (item.text !== normalizedText) {
      mergeAltTexts(item, [normalizedText]);
    }

    if (
      normalizedNavigateHref &&
      item.navigateHref === item.href &&
      normalizedNavigateHref !== item.href
    ) {
      item.navigateHref = normalizedNavigateHref;
    }

    return item;
  }

  function extractMainMenuText(link) {
    if (!link.closest("#mainmenu")) return "";

    const pathTitle = [];
    let current = link;

    while (current && current.id !== "mainmenu") {
      if (current.tagName === "LI") {
        const labelNode = current.querySelector(":scope > a");
        if (labelNode && labelNode !== link) {
          pathTitle.unshift(labelNode.textContent.trim());
        }
      } else if (
        current.tagName === "UL" &&
        current.previousElementSibling &&
        current.previousElementSibling.tagName === "A"
      ) {
        pathTitle.unshift(current.previousElementSibling.textContent.trim());
      }

      current = current.parentElement;
    }

    pathTitle.push(link.textContent.trim());
    return pathTitle.filter(Boolean).join(" › ");
  }

  function extractLinkText(link) {
    const mainMenuText = extractMainMenuText(link);
    if (mainMenuText) return mainMenuText;

    return String(link.textContent || "").trim();
  }

  function collectLinks(selector, indexedItems, indexedByHref) {
    const links = document.querySelectorAll(selector);
    links.forEach((link) => {
      registerIndexedItem(
        indexedItems,
        indexedByHref,
        extractLinkText(link),
        link.getAttribute("href"),
      );
    });
  }

  function getElementText(node) {
    return String(node && node.textContent ? node.textContent : "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isVisibleElement(node) {
    if (!node || typeof node.getClientRects !== "function") return false;

    const style = window.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }

    return node.getClientRects().length > 0;
  }

  function shouldIndexPageText(text) {
    const normalized = normalizeText(text);
    if (!normalized || normalized.length < 2 || normalized.length > 120) {
      return false;
    }

    return !/^\d+$/.test(normalized);
  }

  function getPageTitle() {
    const titleNode = document.querySelector(
      "#view h2, #maincontent h2, .main h2, .cbi-map h2",
    );

    return getElementText(titleNode);
  }

  function getClosestSectionText(node) {
    const fieldset = node.closest("fieldset");
    if (fieldset) {
      const legend = getElementText(fieldset.querySelector("legend"));
      if (legend) return legend;
    }

    const section = node.closest(".cbi-section, .cbi-section-node, .cbi-map");
    if (!section) return "";

    const heading = section.querySelector("h3, h4, .cbi-map-descr");
    return getElementText(heading);
  }

  function collectPrefetchedPageEntries(indexedItems, indexedByHref) {
    prefetchedPageEntries.forEach((entry) => {
      const item = registerIndexedItem(
        indexedItems,
        indexedByHref,
        entry.text,
        entry.href,
      );
      if (!item) return;

      mergeAltTexts(item, entry.altTexts);

      if (
        entry.pageContext &&
        (!item.pageContext ||
          entry.pageContext.length > item.pageContext.length)
      ) {
        item.pageContext = entry.pageContext;
      }
    });
  }

  function resolveSemanticItem(entry) {
    const title = String(entry && entry.title ? entry.title : "").trim();
    const href = String(entry && entry.href ? entry.href : "").trim();
    const path = String(entry && entry.path ? entry.path : "").trim();

    if (!title) return null;

    const resolvedHref = href || buildHrefFromPath(path);
    if (!resolvedHref) return null;

    return {
      text: title,
      href: resolvedHref,
    };
  }

  function matchesSemanticEntry(item, entry) {
    const hrefIncludes = Array.isArray(entry.hrefIncludes)
      ? entry.hrefIncludes
      : [];
    const titleIncludes = Array.isArray(entry.titleIncludes)
      ? entry.titleIncludes
      : [];

    if (hrefIncludes.some((fragment) => item.href.indexOf(fragment) !== -1)) {
      return true;
    }

    if (
      titleIncludes.some(
        (fragment) => item.titleBlob.indexOf(normalizeText(fragment)) !== -1,
      )
    ) {
      return true;
    }

    return false;
  }

  function refreshDerivedFields(item) {
    const profileKeywords = [];
    const profileCategories = [];
    const profileDescriptions = [];
    let semanticBoost = 0;

    item.semanticProfiles.forEach((profile) => {
      if (Array.isArray(profile.keywords)) {
        profileKeywords.push.apply(profileKeywords, profile.keywords);
      }

      if (profile.category) {
        profileCategories.push(profile.category);
      }

      if (profile.description) {
        profileDescriptions.push(profile.description);
      }

      if (Number.isFinite(profile.boost)) {
        semanticBoost += profile.boost;
      }
    });

    item.semanticKeywords = dedupeStrings(profileKeywords);
    item.semanticCategories = dedupeStrings(profileCategories);
    item.semanticDescription = profileDescriptions.length
      ? profileDescriptions[0]
      : "";
    item.semanticBoost = semanticBoost;
    item.titleBlob = normalizeText([item.text].concat(item.altTexts).join(" "));
    item.keywordBlob = normalizeText(item.semanticKeywords.join(" "));
    item.descriptionBlob = normalizeText(item.semanticDescription);
    item.categoryBlob = normalizeText(item.semanticCategories.join(" "));
    item.semanticBlob = normalizeText(
      [item.text]
        .concat(item.altTexts)
        .concat(item.semanticKeywords)
        .concat(item.semanticCategories)
        .concat(item.semanticDescription ? [item.semanticDescription] : [])
        .join(" "),
    );
  }

  function applySemanticMetadata(indexedItems, indexedByHref) {
    const semanticEntries = getSemanticRegistry();

    semanticEntries.forEach((entry) => {
      let matched = false;

      indexedItems.forEach((item) => {
        if (matchesSemanticEntry(item, entry)) {
          item.semanticProfiles.push(entry);
          matched = true;
        }
      });

      if (!matched) {
        const standaloneItem = resolveSemanticItem(entry);
        if (!standaloneItem) return;

        const registeredItem = registerIndexedItem(
          indexedItems,
          indexedByHref,
          standaloneItem.text,
          standaloneItem.href,
        );

        if (registeredItem) {
          registeredItem.semanticProfiles.push(entry);
        }
      }
    });

    indexedItems.forEach(refreshDerivedFields);
  }

  function indexMenu(force) {
    const semanticCount = getSemanticEntryCount();
    if (isIndexed && !force && indexedSemanticCount === semanticCount) return;

    const indexedItems = [];
    const indexedByHref = Object.create(null);

    collectLinks("#mainmenu a[href]", indexedItems, indexedByHref);
    collectLinks("#modemenu a[href]", indexedItems, indexedByHref);
    collectLinks("#tabmenu a[href]", indexedItems, indexedByHref);
    collectLiveDataEntries(indexedItems, indexedByHref);
    collectPrefetchedPageEntries(indexedItems, indexedByHref);
    applySemanticMetadata(indexedItems, indexedByHref);

    menuItems = indexedItems;
    isIndexed = menuItems.length > 0 || semanticCount > 0;
    indexedSemanticCount = semanticCount;
  }

  function highlightText(text, queryVariants) {
    const lowerText = String(text || "").toLowerCase();
    const variants = Array.isArray(queryVariants)
      ? queryVariants
      : buildQueryVariants(queryVariants);
    const normalizedQuery = variants[0] || "";
    let fragment =
      variants.find((variant) => lowerText.indexOf(variant) !== -1) ||
      normalizedQuery;
    let startIndex = lowerText.indexOf(fragment);

    if (startIndex === -1) {
      const terms = tokenizeVariants(variants);
      fragment = terms.find((term) => lowerText.indexOf(term) !== -1) || "";
      startIndex = fragment ? lowerText.indexOf(fragment) : -1;
    }

    if (startIndex === -1 || !fragment) {
      return escapeHtml(text);
    }

    const before = escapeHtml(text.substring(0, startIndex));
    const match = escapeHtml(
      text.substring(startIndex, startIndex + fragment.length),
    );
    const after = escapeHtml(text.substring(startIndex + fragment.length));

    return `${before}<b>${match}</b>${after}`;
  }

  function getKeywordHint(item, queryVariants) {
    const variants = Array.isArray(queryVariants)
      ? queryVariants
      : buildQueryVariants(queryVariants);
    const normalizedQuery = variants[0] || "";
    const terms = tokenizeVariants(variants);
    const matchedKeywords = item.semanticKeywords.filter((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) return false;

      if (
        variants.some(
          (variant) => variant && normalizedKeyword.indexOf(variant) !== -1,
        )
      ) {
        return true;
      }

      return terms.some((term) => normalizedKeyword.indexOf(term) !== -1);
    });

    return dedupeStrings(matchedKeywords).slice(0, 3).join(", ");
  }

  function getResultMeta(item, queryVariants) {
    const metaParts = [];
    if (item.pageContext) {
      metaParts.push(item.pageContext);
    }

    if (item.semanticCategories.length) {
      metaParts.push(item.semanticCategories[0]);
    }

    if (item.semanticDescription) {
      metaParts.push(item.semanticDescription);
    }

    const keywordHint = getKeywordHint(item, queryVariants);
    if (keywordHint) {
      metaParts.push(keywordHint);
    }

    return metaParts.join(" · ");
  }

  function renderNoResults() {
    const noMatch = document.createElement("div");
    noMatch.className = "proton-search-empty";

    const noMatchText = document.createElement("div");
    noMatchText.className = "proton-search-empty-text";
    noMatchText.textContent = getNoResultsText();
    noMatch.appendChild(noMatchText);

    const noMatchActionLabel = document.createElement("div");
    noMatchActionLabel.className = "proton-search-empty-prompt";
    noMatchActionLabel.textContent = getNoResultsSearchIndexPrompt();
    noMatch.appendChild(noMatchActionLabel);

    const noMatchAction = document.createElement("button");
    noMatchAction.type = "button";
    noMatchAction.className = "proton-search-empty-action";
    noMatchAction.textContent = getNoResultsSearchIndexActionText();
    noMatchAction.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openSearchIndexSettingsFromSearch();
    });
    noMatch.appendChild(noMatchAction);

    searchResults.appendChild(noMatch);
  }

  function renderResults(matches, queryVariants) {
    if (!matches.length) {
      renderNoResults();
      showResults();
      return;
    }

    const maxResults = Math.min(matches.length, MAX_RESULTS);
    for (let i = 0; i < maxResults; i++) {
      const item = matches[i].item || matches[i];
      const link = document.createElement("a");
      link.href = item.navigateHref || item.href;
      link.className = "proton-search-result-item";

      const titleHtml = highlightText(item.text, queryVariants);
      const metaText = getResultMeta(item, queryVariants);
      const metaHtml = metaText
        ? `<span class="proton-search-result-meta">${escapeHtml(metaText)}</span>`
        : "";

      link.innerHTML = `<span class="proton-search-result-main"><span class="proton-search-result-title">${titleHtml}</span></span>${metaHtml}`;

      link.addEventListener("mouseenter", () => {
        const items = searchResults.querySelectorAll(
          "a.proton-search-result-item",
        );
        selectedIndex = Array.from(items).indexOf(link);
        updateSelection(items);
      });

      link.addEventListener("click", () => {
        try {
          const nextUrl = new URL(link.href, window.location.href);
          const currentUrl = new URL(window.location.href);

          if (
            nextUrl.origin === currentUrl.origin &&
            nextUrl.pathname === currentUrl.pathname &&
            nextUrl.search === currentUrl.search &&
            nextUrl.hash &&
            nextUrl.hash === currentUrl.hash
          ) {
            window.setTimeout(() => {
              activateCurrentTabFromHash(1);
            }, 0);
          }
        } catch (error) {
          return;
        }
      });

      searchResults.appendChild(link);
    }

    showResults();
  }

  function getResultTargetHref(item) {
    return normalizeIndexedHref(item?.navigateHref || item?.href);
  }

  function getResultRouteKey(item) {
    return normalizeRouteHref(getResultTargetHref(item) || item?.href);
  }

  function hasOwnSearchSignal(item, queryVariants, queryTerms) {
    const ownBlob = item.titleBlob || "";
    if (!ownBlob) return false;

    if (queryVariants.some((query) => query && ownBlob.indexOf(query) !== -1)) {
      return true;
    }

    if (queryTerms.some((term) => term && ownBlob.indexOf(term) !== -1)) {
      return true;
    }

    return queryTerms.length
      ? findFuzzyMatches(queryTerms, ownBlob).length === queryTerms.length
      : false;
  }

  function collapseSamePageMatches(matches, queryVariants, queryTerms) {
    const routeInfo = Object.create(null);

    matches.forEach((match) => {
      const routeKey = getResultRouteKey(match.item);
      if (!routeKey) return;

      const targetHref = getResultTargetHref(match.item);
      const isPageResult = targetHref === routeKey;
      const ownSignal = hasOwnSearchSignal(
        match.item,
        queryVariants,
        queryTerms,
      );
      let info = routeInfo[routeKey];

      if (!info) {
        info = {
          pageMatch: null,
          ownHashMatches: [],
          genericHashMatch: null,
        };
        routeInfo[routeKey] = info;
      }

      if (isPageResult) {
        if (!info.pageMatch) {
          info.pageMatch = match;
        }
        return;
      }

      if (ownSignal) {
        info.ownHashMatches.push(match);
        return;
      }

      if (!info.genericHashMatch) {
        info.genericHashMatch = match;
      }
    });

    return matches.filter((match) => {
      const routeKey = getResultRouteKey(match.item);
      if (!routeKey) return true;

      const info = routeInfo[routeKey];
      if (!info) return true;

      const pageOwnSignal =
        info.pageMatch &&
        hasOwnSearchSignal(info.pageMatch.item, queryVariants, queryTerms);

      if (pageOwnSignal) {
        return info.pageMatch === match;
      }

      const targetHref = getResultTargetHref(match.item);
      if (info.ownHashMatches.length) {
        return (
          !!targetHref &&
          targetHref !== routeKey &&
          info.ownHashMatches.indexOf(match) !== -1
        );
      }

      if (info.pageMatch) {
        return info.pageMatch === match;
      }

      return info.genericHashMatch === match;
    });
  }

  function scoreSemanticSearch(item, queries, terms) {
    const queryVariants = Array.isArray(queries)
      ? queries.filter(Boolean)
      : buildQueryVariants(queries);
    const queryTerms =
      Array.isArray(terms) && terms.length
        ? terms
        : tokenizeVariants(queryVariants);
    const variantTermGroups = queryVariants
      .map((variant) => tokenize(variant))
      .filter((group) => group.length);

    if (!queryVariants.length) return 0;

    const hasDirectSemanticMatch = queryVariants.some(
      (query) => item.semanticBlob.indexOf(query) !== -1,
    );
    const matchingTermGroup = variantTermGroups.find((group) =>
      group.every((term) => item.semanticBlob.indexOf(term) !== -1),
    );
    const fuzzyGroupMatch = variantTermGroups
      .map((group) => ({
        group: group,
        matches: findFuzzyMatches(group, item.semanticBlob),
      }))
      .find(({ group, matches }) => matches.length === group.length);
    const scoringTerms = matchingTermGroup
      ? matchingTermGroup
      : fuzzyGroupMatch
        ? fuzzyGroupMatch.group
        : queryTerms.filter((term) => item.semanticBlob.indexOf(term) !== -1);
    const fuzzyMatches = fuzzyGroupMatch
      ? fuzzyGroupMatch.matches
      : findFuzzyMatches(scoringTerms, item.semanticBlob);
    const hasTermCoverage = !!matchingTermGroup;
    const hasFuzzyCoverage = !!fuzzyGroupMatch;

    if (!hasDirectSemanticMatch && !hasTermCoverage && !hasFuzzyCoverage) {
      return 0;
    }

    let score = 0;

    queryVariants.forEach((query, index) => {
      if (!query) return;

      const weight = index === 0 ? 1 : 0.72;

      if (item.titleBlob === query) score += 180 * weight;
      else if (item.titleBlob.indexOf(query) !== -1) score += 110 * weight;

      if (item.keywordBlob.indexOf(query) !== -1) score += 130 * weight;
      if (item.descriptionBlob.indexOf(query) !== -1) score += 70 * weight;
      if (item.categoryBlob.indexOf(query) !== -1) score += 40 * weight;
    });

    if (hasTermCoverage) score += 55;
    if (hasFuzzyCoverage && !hasTermCoverage) score += 26;

    scoringTerms.forEach((term) => {
      if (item.titleBlob.indexOf(term) !== -1) score += 14;
      if (item.keywordBlob.indexOf(term) !== -1) score += 20;
      if (item.descriptionBlob.indexOf(term) !== -1) score += 8;
      if (item.categoryBlob.indexOf(term) !== -1) score += 6;
    });

    fuzzyMatches.forEach((match) => {
      if (item.titleBlob.indexOf(match.candidate) !== -1) score += 6;
      else if (item.keywordBlob.indexOf(match.candidate) !== -1) score += 8;
      else score += 3;
    });

    if (item.semanticProfiles.length) {
      score += Math.min(item.semanticBoost, 40);
    }

    return score;
  }

  function getMatches(query) {
    const queryVariants = buildQueryVariants(query);
    const terms = tokenizeVariants(queryVariants);

    return collapseSamePageMatches(
      menuItems
        .map((item) => ({
          item: item,
          score: scoreSemanticSearch(item, queryVariants, terms),
        }))
        .filter((match) => match.score > 0)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }

          return left.item.text.localeCompare(right.item.text);
        }),
      queryVariants,
      terms,
    );
  }

  function initSearch() {
    const containerEl = document.getElementById("proton-search-container");
    if (!containerEl) return;
    searchContainer = containerEl;

    const wrapper = document.createElement("div");
    wrapper.className = "proton-search-wrapper";

    const iconLabel = document.createElement("label");
    iconLabel.className = "proton-search-icon";
    iconLabel.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';

    searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = getSearchPlaceholder();
    searchInput.className = "proton-search-input";
    searchInput.autocomplete = "off";

    searchResults = document.createElement("div");
    searchResults.className = "proton-search-results";
    searchResults.id = "proton-search-results";
    searchResults.setAttribute("role", "listbox");
    searchResults.style.display = "none";

    iconLabel.appendChild(searchInput);
    wrapper.appendChild(iconLabel);
    wrapper.appendChild(searchResults);
    containerEl.appendChild(wrapper);
    searchWrapper = wrapper;

    searchInput.setAttribute("aria-controls", "proton-search-results");
    searchInput.setAttribute("spellcheck", "false");

    searchInput.addEventListener("focus", onFocus);
    searchInput.addEventListener("blur", onBlur);
    searchInput.addEventListener("input", onInput);
    searchInput.addEventListener("keydown", onKeyDown);

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        hideResults();
      }
    });
  }

  function clearSearchCloseAnimation() {
    if (searchCloseAnimationTimer) {
      window.clearTimeout(searchCloseAnimationTimer);
      searchCloseAnimationTimer = 0;
    }

    if (searchContainer) {
      searchContainer.classList.remove("search-closing");
    }

    if (searchWrapper) {
      searchWrapper.classList.remove("closing");
    }
  }

  function startSearchCloseAnimation() {
    if (!searchWrapper) return;

    clearSearchCloseAnimation();
    if (searchContainer) {
      searchContainer.classList.add("search-closing");
    }
    searchWrapper.classList.add("closing");
    searchCloseAnimationTimer = window.setTimeout(() => {
      if (searchContainer) {
        searchContainer.classList.remove("search-closing");
      }
      if (searchWrapper) {
        searchWrapper.classList.remove("closing");
      }
      searchCloseAnimationTimer = 0;
    }, SEARCH_COLLAPSE_DURATION_MS);
  }

  function onFocus() {
    clearSearchCloseAnimation();
    indexMenu(true);
    void ensureLiveDataLoaded();
    dispatchSearchIndexState();
    if (searchInput.value.trim() !== "") {
      onInput();
    }
  }

  function onBlur() {
    startSearchCloseAnimation();
    // Скрытие контролируем через общий click handler, чтобы клики по результатам не терялись.
  }

  function onKeyDown(e) {
    const items = searchResults.querySelectorAll("a.proton-search-result-item");
    if (!items.length && e.key !== "Escape") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    } else if (e.key === "Escape") {
      searchInput.blur();
      searchInput.value = "";
      hideResults();
    }
  }

  function updateSelection(items) {
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add("selected");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("selected");
      }
    });
  }

  function onInput() {
    indexMenu(false);

    const query = normalizeText(searchInput.value);
    const queryVariants = buildQueryVariants(query);
    searchResults.innerHTML = "";
    selectedIndex = -1;

    if (!query) {
      hideResults();
      return;
    }

    renderResults(getMatches(query), queryVariants);
  }

  function showResults() {
    if (!searchWrapper) return;
    clearSearchCloseAnimation();
    searchResults.style.display = "block";
    searchWrapper.classList.add("active");
  }

  function hideResults() {
    if (!searchWrapper) return;
    searchResults.style.display = "none";
    searchWrapper.classList.remove("active");
    selectedIndex = -1;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (isPrefetchFrame) return;

    void loadPrefetchCache();
    initSearch();
    indexMenu(true);

    const initialRouteHash = getCurrentPrefetchRouteHash();
    if (initialRouteHash) {
      updatePrefetchCacheState(initialRouteHash);
    }

    activateCurrentTabFromHash(HASH_TAB_RETRY_LIMIT);
    window.addEventListener("hashchange", () => {
      activateCurrentTabFromHash(HASH_TAB_RETRY_LIMIT);
    });

    const menuContainer = document.getElementById("mainmenu");
    if (menuContainer) {
      const observer = new MutationObserver(() => {
        if (menuContainer.querySelector("a")) {
          indexMenu(true);
          updatePrefetchCacheState(getCurrentPrefetchRouteHash());
          observer.disconnect();
        }
      });

      observer.observe(menuContainer, { childList: true, subtree: true });
    }

    window.protonSearchIndex = {
      refresh(forceRefresh) {
        return ensurePrefetchedPagesIndexed(forceRefresh !== false);
      },
      cancel(reason) {
        return cancelPrefetchIndexing(reason || "user");
      },
      clear() {
        return clearPrefetchCache().then(() => getState());
      },
      getState() {
        return getState();
      },
    };

    function getState() {
      return {
        cachedEntryCount: prefetchedPageEntries.length,
        cacheBytes: getCachedPrefetchBytes(),
        stale: prefetchCacheStale,
        status: getPrefetchStatusSnapshot(),
      };
    }

    dispatchSearchIndexState();

    window.addEventListener("beforeunload", (event) => {
      if (!prefetchStatus.inProgress) return;

      const message =
        "Search indexing is still running. Stay on this page until it finishes, or cancel indexing first.";
      event.preventDefault();
      event.returnValue = message;
      return message;
    });
  });
})();
