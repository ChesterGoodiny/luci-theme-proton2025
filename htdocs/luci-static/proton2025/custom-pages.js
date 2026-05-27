/**
 * Proton2025 - Custom Pages Detection
 * Применяет класс proton-custom-page для страниц сторонних пакетов
 * и динамически расширяет контейнер вправо если контент шире
 */

(function () {
  "use strict";

  // Some LuCI entrypoints (e.g. /cgi-bin/luci/) may render a view while keeping
  // ctx.request_path empty, resulting in an empty body[data-page].
  // Populate it from LuCI dispatchpath to keep page-specific CSS/JS consistent.
  try {
    if (typeof L !== "undefined" && L.env) {
      let canonical = null;

      // LuCI aliases: /admin/ and /admin/status/ often resolve to the Overview view
      // but may have requestpath like ["admin"] or ["admin", "status"].
      // Nodespec action is a stable way to identify the Overview template.
      if (L.env.nodespec && L.env.nodespec.action) {
        const action = L.env.nodespec.action;
        if (
          action.type === "template" &&
          action.path === "admin_status/index"
        ) {
          canonical = "admin-status-overview";
        }
      }

      if (
        !canonical &&
        Array.isArray(L.env.dispatchpath) &&
        L.env.dispatchpath.length
      ) {
        canonical = L.env.dispatchpath.join("-");
      }

      if (canonical && document.body.dataset.page !== canonical) {
        document.body.dataset.page = canonical;
      }
    }
  } catch (e) {}

  // Список стандартных LuCI страниц (используют Proton стили)
  const standardPagePrefixes = [
    "admin-status",
    "admin-system",
    "admin-network-wireless",
    "admin-network-network",
    "admin-network-diagnostics",
  ];

  // Debounce утилита
  let adjustDebounceTimer = null;
  const DEBOUNCE_DELAY = 150;

  function debouncedAdjust() {
    clearTimeout(adjustDebounceTimer);
    adjustDebounceTimer = setTimeout(adjustContainerWidth, DEBOUNCE_DELAY);
  }

  function detectCustomPage() {
    // Проверяем data-page атрибут
    const dataPage = document.body.dataset.page;

    // Также проверяем URL как fallback (для случаев когда data-page ещё не установлен)
    const path = window.location.pathname;

    // Если есть data-page - используем его
    if (dataPage) {
      const isStandard = standardPagePrefixes.some((prefix) =>
        dataPage.startsWith(prefix),
      );
      return !isStandard;
    }

    // Fallback: проверяем URL
    // Стандартные пути которые НЕ нужно расширять
    const standardUrlPatterns = [
      "/admin/status",
      "/admin/system",
      "/admin/network/wireless",
      "/admin/network/network",
      "/admin/network/diagnostics",
    ];

    const isStandardUrl = standardUrlPatterns.some((pattern) =>
      path.includes(pattern),
    );

    // Если путь содержит /admin/ но не стандартный - это custom page
    if (path.includes("/admin/") && !isStandardUrl) {
      return true;
    }

    return false;
  }

  // Измеряет "естественную" ширину таблицы, временно снимая CSS-ограничения
  function measureNaturalTableWidth(table) {
    // Сохраняем оригинальные стили
    const originalTableStyle = table.style.cssText;
    const originalCellStyles = [];
    const cells = table.querySelectorAll("th, td");

    cells.forEach((cell) => {
      originalCellStyles.push(cell.style.cssText);
    });

    // Временно снимаем ограничения
    table.style.tableLayout = "auto";
    table.style.width = "auto";
    table.style.maxWidth = "none";

    cells.forEach((cell) => {
      cell.style.overflow = "visible";
      cell.style.textOverflow = "clip";
      cell.style.whiteSpace = "nowrap";
      cell.style.maxWidth = "none";
    });

    // Принудительный reflow для применения стилей
    void table.offsetWidth;

    // Измеряем
    const naturalWidth = table.scrollWidth;

    // Восстанавливаем стили
    table.style.cssText = originalTableStyle;
    cells.forEach((cell, i) => {
      cell.style.cssText = originalCellStyles[i];
    });

    return naturalWidth;
  }

  // Расширяет контейнер вправо если контент требует больше места
  function adjustContainerWidth() {
    const maincontent = document.getElementById("maincontent");
    if (!maincontent) {
      return;
    }

    // На мобильных экранах не расширяем — там своя адаптивная вёрстка
    if (window.innerWidth < 800) {
      maincontent.style.maxWidth = "";
      maincontent.style.marginLeft = "";
      maincontent.style.marginRight = "";
      return;
    }

    // Сбрасываем стили для измерения
    maincontent.style.maxWidth = "";
    maincontent.style.marginLeft = "";
    maincontent.style.marginRight = "";

    // Получаем реальное положение контейнера после сброса стилей
    const rect = maincontent.getBoundingClientRect();
    const realLeftOffset = rect.left;

    // Вычисляем параметры
    const viewportWidth = window.innerWidth;
    const standardMaxWidth = 990; // --proton-page-max-width
    const gutter = 20; // --proton-page-gutter

    // Находим самый широкий элемент внутри (включая tabmenu)
    let maxContentWidth = 0;

    // Для таблиц измеряем "естественную" ширину без CSS-ограничений
    const tables = maincontent.querySelectorAll("table, .table");
    tables.forEach((table) => {
      const naturalWidth = measureNaturalTableWidth(table);
      if (naturalWidth > maxContentWidth) {
        maxContentWidth = naturalWidth;
      }
    });

    // Другие элементы
    const otherElements = maincontent.querySelectorAll(
      ".cbi-section, .cbi-tabmenu, #tabmenu",
    );
    otherElements.forEach((el) => {
      const w = el.scrollWidth;
      if (w > maxContentWidth) {
        maxContentWidth = w;
      }
    });

    // Также проверяем общую ширину maincontent
    const maincontentScroll = maincontent.scrollWidth;
    if (maincontentScroll > maxContentWidth) {
      maxContentWidth = maincontentScroll;
    }

    // Если контент шире стандартной ширины - расширяем вправо
    if (maxContentWidth > standardMaxWidth) {
      const availableWidth = viewportWidth - realLeftOffset - gutter;
      const newWidth = Math.min(maxContentWidth + 40, availableWidth);

      maincontent.style.maxWidth = newWidth + "px";
      maincontent.style.marginLeft = realLeftOffset + "px";
      maincontent.style.marginRight = "auto";
    }
  }

  function applyCustomPageClass() {
    const isCustom = detectCustomPage();
    const isMobile = window.innerWidth < 800;

    // На мобильных экранах не применяем кастомные стили
    if (isMobile) {
      document.body.classList.remove("proton-custom-page");
      const maincontent = document.getElementById("maincontent");
      if (maincontent) {
        maincontent.style.maxWidth = "";
        maincontent.style.marginLeft = "";
        maincontent.style.marginRight = "";
      }
      return;
    }

    if (isCustom) {
      document.body.classList.add("proton-custom-page");
      // MutationObserver сам отследит изменения, просто делаем debounced вызов
      debouncedAdjust();
    } else {
      document.body.classList.remove("proton-custom-page");
      const maincontent = document.getElementById("maincontent");
      if (maincontent) {
        maincontent.style.maxWidth = "";
        maincontent.style.marginLeft = "";
        maincontent.style.marginRight = "";
      }
    }
  }

  // Применяем при загрузке
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyCustomPageClass);
  } else {
    applyCustomPageClass();
  }

  // Дополнительно после полной загрузки страницы (включая все ресурсы)
  window.addEventListener("load", () => {
    if (detectCustomPage()) {
      debouncedAdjust();
    }
  });

  // При изменении размера окна — пересчитываем всё (включая добавление/удаление класса)
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyCustomPageClass, 100);
  });

  // При клике по JS-табам (не ссылкам — те перезагружают страницу)
  document.addEventListener("click", (e) => {
    const target = e.target;
    // Только для табов без href или с href="#" (SPA-табы)
    const link = target.closest("a");
    if (
      link &&
      link.href &&
      !link.href.endsWith("#") &&
      !link.href.includes("javascript:")
    ) {
      // Это обычная ссылка — пропускаем, страница перезагрузится
      return;
    }
    // Проверяем клик по табам (.cbi-tab, .tab, .tabs > li, [data-tab], [role="tab"])
    if (
      target.matches(
        '.cbi-tab, .cbi-tab-descr, .tabs > li, [data-tab], [role="tab"]',
      ) ||
      target.closest(
        '.cbi-tab, .cbi-tab-descr, .tabs > li, [data-tab], [role="tab"]',
      )
    ) {
      if (detectCustomPage()) {
        debouncedAdjust();
      }
    }
  });

  // При изменении data-page (SPA навигация)
  const pageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-page"
      ) {
        applyCustomPageClass();
      }
    });
  });

  pageObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-page"],
  });

  // Наблюдаем за изменениями в maincontent (динамическая загрузка)
  const contentObserver = new MutationObserver(() => {
    if (detectCustomPage()) {
      debouncedAdjust();
    }
  });

  // Подключаем observer к maincontent когда он появится
  function attachContentObserver() {
    const maincontent = document.getElementById("maincontent");
    if (maincontent) {
      contentObserver.observe(maincontent, {
        childList: true,
        subtree: true,
      });
      if (detectCustomPage()) {
        debouncedAdjust();
      }
      return true;
    }
    return false;
  }

  // Пробуем подключить сразу, или ждём через MutationObserver
  if (!attachContentObserver()) {
    const bodyObserver = new MutationObserver(() => {
      if (attachContentObserver()) {
        bodyObserver.disconnect();
      }
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
})();

/**
 * Proton2025 - Log Viewer Syntax Highlighting
 * Токенизатор с однопроходной подсветкой, тулбар, нумерация строк, severity-gutter
 */

(function () {
  "use strict";

  /* ── translation helper ─────────────────────────── */

  var tr =
    window.protonT ||
    function (k) {
      return k;
    };

  /* ── helpers ─────────────────────────────────────── */

  function stripAnsi(text) {
    return text.replace(/\x1b\[[0-9;]*m|\[\d+(?:;\d+)*m/g, "");
  }

  var ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, function (c) {
      return ESC_MAP[c];
    });
  }

  /* ── master regex (однопроходный токенизатор) ───── */

  function buildMasterRegex() {
    var parts = [
      // 1: Временная метка (syslog: Sat Feb 14 11:00:33 2026 | kernel: [    0.000000])
      /^([A-Z][a-z]{2}\s+[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\d{4}|\[\s*\d+\.\d+\])\s*/
        .source,
      // 2: Префикс уровня лога
      /\b((?:daemon|kern|user|authpriv|cron|syslog|local\d)\.(?:emerg|alert|crit|err|warn|warning|notice|info|debug))\b/
        .source,
      // 3: Процесс с PID
      /\b(\w[\w.-]*\[\d+\]:)/.source,
      // 4: MAC адрес
      /\b((?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2})\b/.source,
      // 5: IPv4 адрес
      /\b((?:\d{1,3}\.){3}\d{1,3}(?::\d+)?)\b/.source,
      // 6: Ключевые слова
      buildKeywordPattern(),
    ];
    return new RegExp(parts.join("|"), "gi");
  }

  function buildKeywordPattern() {
    // Regex uses 'i' flag — no case duplicates needed
    var allWords = [
      "EMERGENCY",
      "CRITICAL",
      "PANIC",
      "EMERG",
      "AP-STA-DISCONNECTED",
      "AP-STA-CONNECTED",
      "EAPOL-4WAY-HS-COMPLETED",
      "DEAUTHENTICATED",
      "DISASSOCIATED",
      "DISCONNECTED",
      "AUTHENTICATED",
      "ASSOCIATED",
      "CONNECTED",
      "COMPLETED",
      "SUCCESSFUL",
      "SUCCESSFULLY",
      "OBTAINED",
      "ACCEPTED",
      "SUCCESS",
      "FAILED",
      "FAILURE",
      "ERROR",
      "FAIL",
      "WARNING",
      "WARN",
      "NOTICE",
      "INFO",
      "DEBUG",
      "DENIED",
      "REJECTED",
      "STARTED",
      "ENABLED",
      "STARTING",
      "STOPPED",
      "DISABLED",
      "STOPPING",
    ];
    return "\\b(" + allWords.join("|") + ")\\b";
  }

  /* ── severity classification ────────────────────── */

  var SEVERITY_ORDER = {
    critical: 0,
    error: 1,
    warning: 2,
    denied: 3,
    disconnected: 4,
    notice: 5,
    info: 6,
    success: 7,
    started: 8,
    stopped: 9,
    debug: 10,
  };

  // O(1) keyword → severity lookup
  var KEYWORD_SEV_MAP = {};
  (function () {
    var defs = [
      [["EMERGENCY", "CRITICAL", "PANIC", "EMERG"], "critical"],
      [["ERROR", "FAILED", "FAILURE", "FAIL"], "error"],
      [["WARNING", "WARN"], "warning"],
      [["NOTICE"], "notice"],
      [["INFO"], "info"],
      [["DEBUG"], "debug"],
      [
        [
          "AP-STA-DISCONNECTED",
          "DISCONNECTED",
          "DISASSOCIATED",
          "DEAUTHENTICATED",
        ],
        "disconnected",
      ],
      [
        [
          "AP-STA-CONNECTED",
          "EAPOL-4WAY-HS-COMPLETED",
          "CONNECTED",
          "ASSOCIATED",
          "AUTHENTICATED",
          "COMPLETED",
          "SUCCESS",
          "SUCCESSFUL",
          "SUCCESSFULLY",
          "OBTAINED",
          "ACCEPTED",
        ],
        "success",
      ],
      [["DENIED", "REJECTED"], "denied"],
      [["STARTED", "ENABLED", "STARTING"], "started"],
      [["STOPPED", "DISABLED", "STOPPING"], "stopped"],
    ];
    for (var i = 0; i < defs.length; i++)
      for (var j = 0; j < defs[i][0].length; j++)
        KEYWORD_SEV_MAP[defs[i][0][j]] = defs[i][1];
  })();

  function classifyKeyword(word) {
    return KEYWORD_SEV_MAP[word.toUpperCase()] || null;
  }

  // Module-level maps (avoid per-call object allocation)
  var LOG_LEVEL_SEV = {
    emerg: "critical",
    alert: "critical",
    crit: "critical",
    err: "error",
    warn: "warning",
    warning: "warning",
    notice: "notice",
    info: "info",
    debug: "debug",
  };
  var LOG_LEVEL_CSS = {
    emerg: "proton-log-level-emerg",
    alert: "proton-log-level-alert",
    crit: "proton-log-level-crit",
    err: "proton-log-level-err",
    warn: "proton-log-level-warn",
    warning: "proton-log-level-warn",
    notice: "proton-log-level-notice",
    info: "proton-log-level-info",
    debug: "proton-log-level-debug",
  };

  function classifyLogPrefix(prefix) {
    return LOG_LEVEL_SEV[prefix.split(".")[1]] || "info";
  }

  function prefixCssClass(prefix) {
    return LOG_LEVEL_CSS[prefix.split(".")[1]] || "proton-log-level-info";
  }

  // Только "сильные" keyword-severity влияют на классификацию строки
  var STRONG_KEYWORD_SEVERITIES = {
    critical: true,
    error: true,
    warning: true,
    denied: true,
    disconnected: true,
    success: true,
  };

  var masterRegex = buildMasterRegex();

  /* ── parse single line ──────────────────────────── */

  function parseLine(line) {
    if (!line.trim()) return null;
    line = stripAnsi(line);
    masterRegex.lastIndex = 0;

    var tokens = [];
    var severity = null; // highest severity found in line
    var lastIndex = 0;
    var match;

    while ((match = masterRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: "text",
          value: line.slice(lastIndex, match.index),
        });
      }

      if (match[1] !== undefined) {
        tokens.push({ type: "timestamp", value: match[1] });
      } else if (match[2] !== undefined) {
        var prefSev = classifyLogPrefix(match[2]);
        tokens.push({ type: "prefix", value: match[2], severity: prefSev });
        if (
          severity === null ||
          SEVERITY_ORDER[prefSev] < SEVERITY_ORDER[severity]
        ) {
          severity = prefSev;
        }
      } else if (match[3] !== undefined) {
        tokens.push({ type: "process", value: match[3] });
      } else if (match[4] !== undefined) {
        tokens.push({ type: "mac", value: match[4] });
      } else if (match[5] !== undefined) {
        tokens.push({ type: "ip", value: match[5] });
      } else if (match[6] !== undefined) {
        var kwSev = classifyKeyword(match[6]);
        tokens.push({ type: "keyword", value: match[6], severity: kwSev });
        // Только "сильные" category (error, warning, denied, disconnected, success, critical)
        // влияют на severity строки; started/stopped/info/debug — только подсветка
        if (
          kwSev &&
          STRONG_KEYWORD_SEVERITIES[kwSev] &&
          (severity === null ||
            SEVERITY_ORDER[kwSev] < SEVERITY_ORDER[severity])
        ) {
          severity = kwSev;
        }
      }
      lastIndex = masterRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push({ type: "text", value: line.slice(lastIndex) });
    }

    return { tokens: tokens, severity: severity };
  }

  /* ── render tokens → HTML ───────────────────────── */

  function renderTokens(tokens) {
    var html = "";
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var escaped = escapeHtml(t.value);
      switch (t.type) {
        case "timestamp":
          html += '<span class="proton-log-timestamp">' + escaped + "</span> ";
          break;
        case "prefix":
          html +=
            '<span class="proton-log-prefix ' +
            prefixCssClass(t.value) +
            '">' +
            escaped +
            "</span>";
          break;
        case "process":
          html += '<span class="proton-log-process">' + escaped + "</span>";
          break;
        case "mac":
          html += '<span class="proton-log-mac">' + escaped + "</span>";
          break;
        case "ip":
          html += '<span class="proton-log-ip">' + escaped + "</span>";
          break;
        case "keyword":
          var cls = t.severity ? "proton-log-keyword-" + t.severity : "";
          html += cls
            ? '<span class="' + cls + '">' + escaped + "</span>"
            : escaped;
          break;
        default:
          html += escaped;
      }
    }
    return html;
  }

  /* ── parse all lines → structured data ──────────── */

  function parseLinesData(text) {
    var rawLines = text.split("\n");
    var parsed = [];
    var stats = {
      total: 0,
      critical: 0,
      error: 0,
      warning: 0,
      notice: 0,
      info: 0,
      debug: 0,
      success: 0,
      disconnected: 0,
      denied: 0,
    };

    for (var i = 0; i < rawLines.length; i++) {
      var p = parseLine(rawLines[i]);
      if (!p) continue;
      stats.total++;
      var sev = p.severity || "info";
      if (stats.hasOwnProperty(sev)) stats[sev]++;
      else stats.info++;
      parsed.push({ tokens: p.tokens, severity: sev });
    }

    return { parsed: parsed, stats: stats };
  }

  /* ── render parsed lines → HTML string ──────────── */

  function renderParsedLines(parsed, startIdx, gutterWidth) {
    var parts = new Array(parsed.length);
    for (var i = 0; i < parsed.length; i++) {
      var num = String(startIdx + i + 1);
      while (num.length < gutterWidth) num = " " + num;
      parts[i] =
        '<div class="proton-log-line" data-severity="' +
        parsed[i].severity +
        '">' +
        '<span class="proton-log-gutter" aria-hidden="true">' +
        num +
        "</span>" +
        '<span class="proton-log-content">' +
        renderTokens(parsed[i].tokens) +
        "</span>" +
        "</div>";
    }
    return parts.join("");
  }

  /* ── stats HTML builder (shared by init & poll) ─── */

  function buildStatsHtml(stats) {
    var p = [];
    p.push(
      '<span class="proton-log-stat-total">' +
        stats.total +
        " " +
        tr("lines") +
        "</span>",
    );
    if (stats.critical > 0)
      p.push(
        '<span class="proton-log-stat proton-log-stat-critical" data-filter="critical" title="' +
          tr("Critical") +
          '">' +
          stats.critical +
          " " +
          tr("crit.") +
          "</span>",
      );
    if (stats.error > 0)
      p.push(
        '<span class="proton-log-stat proton-log-stat-error" data-filter="error" title="' +
          tr("Errors") +
          '">' +
          stats.error +
          " " +
          tr("err.") +
          "</span>",
      );
    if (stats.warning > 0)
      p.push(
        '<span class="proton-log-stat proton-log-stat-warning" data-filter="warning" title="' +
          tr("Warnings") +
          '">' +
          stats.warning +
          " " +
          tr("warn.") +
          "</span>",
      );
    if (stats.denied > 0)
      p.push(
        '<span class="proton-log-stat proton-log-stat-denied" data-filter="denied" title="' +
          tr("Denied") +
          '">' +
          stats.denied +
          " " +
          tr("den.") +
          "</span>",
      );
    if (stats.disconnected > 0)
      p.push(
        '<span class="proton-log-stat proton-log-stat-disconnected" data-filter="disconnected" title="' +
          tr("Disconnects") +
          '">' +
          stats.disconnected +
          " " +
          tr("disc.") +
          "</span>",
      );
    if (stats.success > 0)
      p.push(
        '<span class="proton-log-stat proton-log-stat-success" data-filter="success" title="' +
          tr("Successful") +
          '">' +
          stats.success +
          " " +
          tr("ok") +
          "</span>",
      );
    return p.join('<span class="proton-log-stat-sep">·</span>');
  }

  /* ── toolbar ────────────────────────────────────── */

  function buildToolbar(stats, wrapper) {
    var toolbar = document.createElement("div");
    toolbar.className = "proton-log-toolbar";

    // Left: stats
    var statsEl = document.createElement("div");
    statsEl.className = "proton-log-stats";

    statsEl.innerHTML = buildStatsHtml(stats);
    toolbar.appendChild(statsEl);

    // Right: actions
    var actions = document.createElement("div");
    actions.className = "proton-log-actions";

    // Word wrap toggle
    var wrapBtn = document.createElement("button");
    wrapBtn.className = "proton-log-btn";
    wrapBtn.title = tr("Word Wrap") + " (W)";
    wrapBtn.innerHTML = "⏎";
    wrapBtn.setAttribute("aria-label", "Toggle word wrap");
    actions.appendChild(wrapBtn);

    // Hide timestamps toggle
    var tsBtn = document.createElement("button");
    tsBtn.className = "proton-log-btn";
    tsBtn.title = tr("Hide Timestamps") + " (T)";
    tsBtn.innerHTML = "🕐";
    tsBtn.setAttribute("aria-label", "Toggle timestamps");
    actions.appendChild(tsBtn);

    // Separator
    var sep = document.createElement("span");
    sep.className = "proton-log-btn-sep";
    actions.appendChild(sep);

    // Copy log
    var copyBtn = document.createElement("button");
    copyBtn.className = "proton-log-btn";
    copyBtn.title = tr("Copy Log") + " (Ctrl+C)";
    copyBtn.innerHTML = "📋";
    copyBtn.setAttribute("aria-label", "Copy log to clipboard");
    actions.appendChild(copyBtn);

    // Download log
    var dlBtn = document.createElement("button");
    dlBtn.className = "proton-log-btn";
    dlBtn.title = tr("Download Log") + " (Ctrl+S)";
    dlBtn.innerHTML = "💾";
    dlBtn.setAttribute("aria-label", "Download log");
    actions.appendChild(dlBtn);

    // Separator
    var sep2 = document.createElement("span");
    sep2.className = "proton-log-btn-sep";
    actions.appendChild(sep2);

    // Scroll to top
    var topBtn = document.createElement("button");
    topBtn.className = "proton-log-btn";
    topBtn.title = tr("Scroll to Top") + " (Home)";
    topBtn.innerHTML = "↑";
    topBtn.setAttribute("aria-label", "Scroll to top");
    actions.appendChild(topBtn);

    // Scroll to bottom
    var bottomBtn = document.createElement("button");
    bottomBtn.className = "proton-log-btn";
    bottomBtn.title = tr("Scroll to Bottom") + " (End)";
    bottomBtn.innerHTML = "↓";
    bottomBtn.setAttribute("aria-label", "Scroll to bottom");
    actions.appendChild(bottomBtn);

    // Fullscreen toggle
    var fsBtn = document.createElement("button");
    fsBtn.className = "proton-log-btn";
    fsBtn.title = tr("Fullscreen Mode") + " (F11)";
    fsBtn.innerHTML = "⛶";
    fsBtn.setAttribute("aria-label", "Toggle fullscreen");
    actions.appendChild(fsBtn);

    toolbar.appendChild(actions);
    return {
      toolbar: toolbar,
      wrapBtn: wrapBtn,
      topBtn: topBtn,
      bottomBtn: bottomBtn,
      tsBtn: tsBtn,
      copyBtn: copyBtn,
      dlBtn: dlBtn,
      fsBtn: fsBtn,
    };
  }

  /* ── severity filter (event delegation) ─────────── */

  function attachFilterHandlers(statsEl, viewer) {
    if (!statsEl || statsEl._protonFilter) return;
    statsEl._protonFilter = true;
    var activeFilter = null;

    statsEl.addEventListener("click", function (e) {
      var badge = e.target;
      while (badge && badge !== statsEl) {
        if (badge.getAttribute && badge.getAttribute("data-filter")) break;
        badge = badge.parentNode;
      }
      if (!badge || badge === statsEl) return;

      var filter = badge.getAttribute("data-filter");

      if (activeFilter === filter) {
        activeFilter = null;
        viewer.removeAttribute("data-active-filter");
        badge.classList.remove("active");
        return;
      }

      var prev = statsEl.querySelector(".proton-log-stat.active");
      if (prev) prev.classList.remove("active");

      activeFilter = filter;
      viewer.setAttribute("data-active-filter", filter);
      badge.classList.add("active");

      var first = viewer.querySelector(
        '.proton-log-line[data-severity="' + filter + '"]',
      );
      if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  /* ── capture & restyle LuCI native filter controls ─ */

  function captureNativeFilters(textarea, wrapper) {
    // LuCI renders filter divs as siblings before textarea.
    // Structure: <div>filters...</div> <div>filters...</div> <div>scroll btn</div> <textarea>
    var parent = textarea.parentNode;
    if (!parent) return;

    var filterContainer = document.createElement("div");
    filterContainer.className = "proton-log-filters";
    var found = false;

    // Collect all preceding sibling divs that contain filter controls
    // Covers both syslog (facility/severity/text) and dmesg (time range/sort) pages
    var filterSelector = [
      "#logFacilitySelect",
      "#logSeveritySelect",
      "#logTextFilter",
      "#scrollDownButton",
      "#scrollUpButton",
      "#invertLogFacilitySearch",
      "#invertLogSeveritySearch",
      "#invertLogTextSearch",
      "#invertLogRangeTime",
      "#logFromTime",
      "#logToTime",
      "#invertAscendingSort",
      "select.cbi-input-select",
      "input.cbi-input-text",
      "input.cbi-input-checkbox",
    ].join(", ");

    var sibling = textarea.previousElementSibling;
    var divsToMove = [];
    while (sibling) {
      var prev = sibling.previousElementSibling;
      // Check if this div contains LuCI filter controls
      if (sibling.tagName === "DIV" && sibling.querySelector(filterSelector)) {
        divsToMove.unshift(sibling); // prepend to keep order
        found = true;
      }
      sibling = prev;
    }

    if (!found) return;

    // Move filter divs into our styled container
    for (var i = 0; i < divsToMove.length; i++) {
      var div = divsToMove[i];

      // Hide the native scroll buttons (we have our own ↑ ↓)
      var scrollBtnInDiv = div.querySelector(
        "#scrollDownButton, #scrollUpButton",
      );
      if (scrollBtnInDiv) {
        div.style.display = "none";
        continue;
      }

      // Remove inline styles from LuCI
      div.removeAttribute("style");
      div.className = "proton-log-filter-row";

      // Style labels
      var labels = div.querySelectorAll("label");
      for (var j = 0; j < labels.length; j++) {
        labels[j].removeAttribute("style");
        labels[j].classList.add("proton-log-filter-label");
      }

      // Style selects
      var selects = div.querySelectorAll("select");
      for (var k = 0; k < selects.length; k++) {
        selects[k].removeAttribute("style");
        selects[k].classList.add("proton-log-filter-select");
      }

      // Style inputs
      var inputs = div.querySelectorAll("input");
      for (var m = 0; m < inputs.length; m++) {
        inputs[m].removeAttribute("style");
        if (inputs[m].type === "checkbox") {
          inputs[m].classList.add("proton-log-filter-checkbox");
        } else {
          inputs[m].classList.add("proton-log-filter-input");
        }
      }

      filterContainer.appendChild(div);
    }

    // Insert filter container as first child of wrapper
    wrapper.insertBefore(filterContainer, wrapper.firstChild);
  }

  /* ── main: process textarea ─────────────────────── */

  function processLogTextarea(textarea) {
    if (textarea.dataset.protonHighlighted === "done") return;
    var logContent = textarea.value;
    if (!logContent || !logContent.trim()) return;

    // Build wrapper
    var wrapper = document.createElement("div");
    wrapper.className = "proton-log-wrapper";

    // Parse log lines
    var result = parseLinesData(logContent);
    var gutterWidth = Math.max(String(result.parsed.length).length, 4);

    // Capture native LuCI filters into wrapper
    captureNativeFilters(textarea, wrapper);

    // Toolbar
    var tb = buildToolbar(result.stats, wrapper);
    wrapper.appendChild(tb.toolbar);

    // Viewer
    var viewer = document.createElement("div");
    viewer.className = "proton-log-viewer";
    viewer.setAttribute("role", "log");
    viewer.setAttribute("aria-label", "Log viewer");
    viewer.setAttribute("tabindex", "0");
    viewer.innerHTML = renderParsedLines(result.parsed, 0, gutterWidth);
    wrapper.appendChild(viewer);

    // Hide textarea, insert wrapper
    textarea.style.display = "none";
    textarea.style.visibility = "";
    textarea.style.height = "";
    textarea.style.overflow = "";
    textarea.dataset.protonHighlighted = "done";
    textarea.parentNode.insertBefore(wrapper, textarea.nextSibling);

    // Hide native "Scroll to top/bottom" buttons outside wrapper
    var nativeScrollBtns = ["scrollUpButton", "scrollDownButton"];
    for (var s = 0; s < nativeScrollBtns.length; s++) {
      var nBtn = document.getElementById(nativeScrollBtns[s]);
      if (nBtn && nBtn.parentNode && nBtn.parentNode !== wrapper) {
        nBtn.parentNode.style.display = "none";
      }
    }

    // ── Button handlers ──

    // Word wrap toggle
    var wrapped = false;
    tb.wrapBtn.addEventListener("click", function () {
      wrapped = !wrapped;
      viewer.classList.toggle("proton-log-wrapped", wrapped);
      tb.wrapBtn.classList.toggle("active", wrapped);
    });

    // Hide timestamps toggle
    var tsHidden = false;
    tb.tsBtn.addEventListener("click", function () {
      tsHidden = !tsHidden;
      viewer.classList.toggle("proton-log-hide-ts", tsHidden);
      tb.tsBtn.classList.toggle("active", tsHidden);
    });

    // Copy log to clipboard
    tb.copyBtn.addEventListener("click", function () {
      var text = textarea.value || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showBtnFeedback(tb.copyBtn, "✓");
        });
      } else {
        // Fallback
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showBtnFeedback(tb.copyBtn, "✓");
      }
    });

    // Download log as .txt
    tb.dlBtn.addEventListener("click", function () {
      var text = textarea.value || "";
      var pageType = textarea.id === "syslog" ? "syslog" : "dmesg";
      var now = new Date();
      var dateStr =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0");
      var filename = pageType + "_" + dateStr + ".txt";
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showBtnFeedback(tb.dlBtn, "✓");
    });

    // Fullscreen toggle
    var isFullscreen = false;
    tb.fsBtn.addEventListener("click", function () {
      isFullscreen = !isFullscreen;
      wrapper.classList.toggle("proton-log-fullscreen", isFullscreen);
      document.body.classList.toggle("proton-log-fs-active", isFullscreen);
      tb.fsBtn.classList.toggle("active", isFullscreen);
      tb.fsBtn.innerHTML = isFullscreen ? "✕" : "⛶";
      tb.fsBtn.title = isFullscreen
        ? tr("Exit Fullscreen") + " (Esc)"
        : tr("Fullscreen Mode") + " (F11)";
    });

    // ESC to exit fullscreen
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isFullscreen) {
        isFullscreen = false;
        wrapper.classList.remove("proton-log-fullscreen");
        document.body.classList.remove("proton-log-fs-active");
        tb.fsBtn.classList.remove("active");
        tb.fsBtn.innerHTML = "⛶";
        tb.fsBtn.title = tr("Fullscreen Mode");
      }
    });

    // ── Keyboard Shortcuts ──
    var keyboardHandler = function (e) {
      // Only handle shortcuts when wrapper is in DOM
      if (!document.contains(wrapper)) {
        document.removeEventListener("keydown", keyboardHandler);
        return;
      }

      // Ignore if user is typing in an input/textarea
      var target = e.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      var handled = false;

      // Ctrl/Cmd + C: Copy log (only if no text is selected)
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        var selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          e.preventDefault();
          tb.copyBtn.click();
          handled = true;
        }
      }

      // Ctrl/Cmd + S: Download log
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        tb.dlBtn.click();
        handled = true;
      }

      // Home: Scroll to top
      if (e.key === "Home") {
        e.preventDefault();
        viewer.scrollTo({ top: 0, behavior: "smooth" });
        handled = true;
      }

      // End: Scroll to bottom
      if (e.key === "End") {
        e.preventDefault();
        viewer.scrollTo({ top: viewer.scrollHeight, behavior: "smooth" });
        handled = true;
      }

      // F11: Toggle fullscreen (if not already handled by browser)
      if (e.key === "F11") {
        e.preventDefault();
        tb.fsBtn.click();
        handled = true;
      }

      // W: Toggle word wrap
      if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        tb.wrapBtn.click();
        handled = true;
      }

      // T: Toggle timestamps
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        tb.tsBtn.click();
        handled = true;
      }

      // Escape: Exit fullscreen or clear filter
      if (e.key === "Escape") {
        if (isFullscreen) {
          isFullscreen = false;
          wrapper.classList.remove("proton-log-fullscreen");
          document.body.classList.remove("proton-log-fs-active");
          tb.fsBtn.classList.remove("active");
          tb.fsBtn.innerHTML = "⛶";
          tb.fsBtn.title = tr("Fullscreen Mode") + " (F11)";
          handled = true;
        } else {
          // Clear active filter
          var activeFilter = viewer.getAttribute("data-active-filter");
          if (activeFilter) {
            e.preventDefault();
            viewer.removeAttribute("data-active-filter");
            var activeBadge = statsEl.querySelector(".proton-log-stat.active");
            if (activeBadge) activeBadge.classList.remove("active");
            handled = true;
          }
        }
      }

      // Show brief tooltip on handled shortcuts (optional feedback)
      if (handled && e.key !== "Escape") {
        showShortcutFeedback(e.key);
      }
    };

    document.addEventListener("keydown", keyboardHandler);

    // Brief shortcut feedback (optional visual indicator)
    function showShortcutFeedback(key) {
      var feedback = document.createElement("div");
      feedback.className = "proton-log-shortcut-feedback";
      feedback.textContent = "⌨ " + key.toUpperCase();
      feedback.style.cssText =
        "position: fixed; top: 20px; right: 20px; background: var(--proton-accent); color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; z-index: 99999; pointer-events: none; animation: fadeInOut 1s ease;";
      document.body.appendChild(feedback);
      setTimeout(function () {
        if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
      }, 1000);
    }

    // Brief visual feedback helper
    function showBtnFeedback(btn, text) {
      var orig = btn.innerHTML;
      btn.innerHTML = text;
      btn.classList.add("proton-log-btn-ok");
      setTimeout(function () {
        btn.innerHTML = orig;
        btn.classList.remove("proton-log-btn-ok");
      }, 1200);
    }

    // Scroll top/bottom
    tb.topBtn.addEventListener("click", function () {
      viewer.scrollTo({ top: 0, behavior: "smooth" });
    });
    tb.bottomBtn.addEventListener("click", function () {
      viewer.scrollTo({ top: viewer.scrollHeight, behavior: "smooth" });
    });

    // Hook external "Scroll to bottom" button (may still exist hidden)
    var scrollBtn = document.getElementById("scrollDownButton");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", function () {
        viewer.scrollTo({ top: viewer.scrollHeight, behavior: "smooth" });
      });
    }

    // Severity filter (event delegation — called once, survives innerHTML)
    var statsEl = tb.toolbar.querySelector(".proton-log-stats");
    attachFilterHandlers(statsEl, viewer);

    // ── Auto-scroll indicator ──
    var autoScroll = true;
    viewer.addEventListener("scroll", function () {
      var atBottom =
        viewer.scrollHeight - viewer.scrollTop - viewer.clientHeight < 40;
      autoScroll = atBottom;
      tb.bottomBtn.classList.toggle("proton-log-btn-pulse", !atBottom);
    });

    // ── Poll for textarea updates (diff-based) ──
    var lastContent = logContent;
    var currentParsedCount = result.parsed.length;
    var currentStats = {};
    for (var _sk in result.stats) currentStats[_sk] = result.stats[_sk];

    function _refreshStats(stats) {
      if (!statsEl) return;
      var af = viewer.getAttribute("data-active-filter");
      statsEl.innerHTML = buildStatsHtml(stats);
      if (af) {
        var ab = statsEl.querySelector(
          '.proton-log-stat[data-filter="' + af + '"]',
        );
        if (ab) ab.classList.add("active");
      }
    }

    var pollInterval = setInterval(function () {
      if (!document.contains(textarea)) {
        clearInterval(pollInterval);
        return;
      }
      var newContent = textarea.value;
      if (newContent === lastContent) return;

      // Detect pure append: old content is exact prefix of new
      var appended = false;
      if (newContent.length > lastContent.length) {
        if (newContent.substring(0, lastContent.length) === lastContent) {
          var newPart = newContent.substring(lastContent.length);
          var appendData = parseLinesData(newPart);
          if (appendData.parsed.length > 0) {
            var newGW = Math.max(
              String(currentParsedCount + appendData.parsed.length).length,
              4,
            );
            if (newGW <= gutterWidth) {
              // Efficient DOM append — no full rebuild
              var frag = document.createDocumentFragment();
              var temp = document.createElement("div");
              temp.innerHTML = renderParsedLines(
                appendData.parsed,
                currentParsedCount,
                gutterWidth,
              );
              while (temp.firstChild) frag.appendChild(temp.firstChild);
              viewer.appendChild(frag);
              currentParsedCount += appendData.parsed.length;
              for (var _k in appendData.stats)
                currentStats[_k] += appendData.stats[_k];
              _refreshStats(currentStats);
              appended = true;
            }
          } else {
            appended = true; // whitespace-only append
          }
        }
      }

      if (!appended) {
        // Full rebuild (content rotated or changed significantly)
        var fullData = parseLinesData(newContent);
        currentParsedCount = fullData.parsed.length;
        gutterWidth = Math.max(String(currentParsedCount).length, 4);
        viewer.innerHTML = renderParsedLines(fullData.parsed, 0, gutterWidth);
        currentStats = {};
        for (var _fk in fullData.stats) currentStats[_fk] = fullData.stats[_fk];
        _refreshStats(currentStats);
      }

      lastContent = newContent;
      if (autoScroll) {
        viewer.scrollTop = viewer.scrollHeight;
      }
    }, 2000);
  }

  /* ── init ────────────────────────────────────────── */

  function initLogHighlighting() {
    // Check if user disabled custom log viewer in settings
    if (localStorage.getItem("proton-log-highlight") === "false") {
      // Mark textareas so CSS anti-FOUC :not([data-proton-visible]) no longer hides them
      var hiddenTAs = document.querySelectorAll("textarea[readonly]");
      for (var h = 0; h < hiddenTAs.length; h++) {
        hiddenTAs[h].setAttribute("data-proton-visible", "");
      }
      return;
    }

    var dataPage = document.body.dataset.page || "";
    var isLogPage =
      dataPage.indexOf("logs") !== -1 ||
      dataPage.indexOf("syslog") !== -1 ||
      dataPage.indexOf("dmesg") !== -1;
    if (!isLogPage) return;

    var selectors = [
      "textarea#syslog",
      "textarea#dmesg",
      'textarea[id*="syslog"]',
      'textarea[id*="dmesg"]',
      "textarea[readonly][wrap=off]",
    ];
    var textareas = document.querySelectorAll(selectors.join(", "));
    for (var i = 0; i < textareas.length; i++) {
      processLogTextarea(textareas[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLogHighlighting);
  } else {
    initLogHighlighting();
  }
  window.addEventListener("load", initLogHighlighting);

  // SPA navigation
  var logPageObserver = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "data-page") {
        setTimeout(initLogHighlighting, 50);
        break;
      }
    }
  });
  logPageObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-page"],
  });

  // Dynamic textarea insertion (skip own DOM mutations)
  var contentDebounce = null;
  var contentLogObserver = new MutationObserver(function (mutations) {
    // Quick check: if first mutation is inside our viewer, skip
    var first = mutations[0] && mutations[0].target;
    var node = first;
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains("proton-log-wrapper"))
        return;
      node = node.parentNode;
    }

    clearTimeout(contentDebounce);
    contentDebounce = setTimeout(function () {
      var dp = document.body.dataset.page || "";
      if (
        dp.indexOf("logs") !== -1 ||
        dp.indexOf("syslog") !== -1 ||
        dp.indexOf("dmesg") !== -1
      ) {
        initLogHighlighting();
      }
    }, 50);
  });
  contentLogObserver.observe(document.body, { childList: true, subtree: true });
})();

/**
 * Proton2025 - Reboot Confirmation
 * Добавляет подтверждение перед перезагрузкой системы
 */

(function () {
  "use strict";

  // Translation helper
  function tr(key) {
    if (typeof window.protonT === "function") {
      return window.protonT(key);
    }
    return key;
  }

  function initRebootConfirmation() {
    // Check if we're on the reboot page
    const dataPage = document.body.dataset.page;
    if (dataPage !== "admin-system-reboot") {
      return;
    }

    // Wait for LuCI to be ready
    if (typeof L === "undefined" || !L.ui) {
      setTimeout(initRebootConfirmation, 100);
      return;
    }

    // Find the reboot button
    const rebootButton = document.querySelector(
      'body[data-page="admin-system-reboot"] .cbi-button-action, body[data-page="admin-system-reboot"] .cbi-button-apply',
    );

    if (!rebootButton || rebootButton.dataset.protonConfirm === "attached") {
      return;
    }

    // Mark as processed
    rebootButton.dataset.protonConfirm = "attached";

    // Intercept LuCI's ui.changes.apply() method
    if (L.ui && L.ui.changes && typeof L.ui.changes.apply === "function") {
      const originalApply = L.ui.changes.apply;
      L.ui.changes.apply = function () {
        // Check if we're on reboot page
        if (document.body.dataset.page === "admin-system-reboot") {
          // Show confirmation modal instead
          showRebootConfirmation(originalApply, this, arguments);
          return Promise.resolve();
        }
        // For other pages, call original
        return originalApply.apply(this, arguments);
      };
    }

    // Also intercept direct button clicks
    rebootButton.addEventListener(
      "click",
      function (e) {
        // Check if this is a reboot action
        if (rebootButton.dataset.protonConfirm === "executing") {
          // Allow execution
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Show confirmation modal
        showRebootConfirmation(function () {
          // Mark as executing to allow next click
          rebootButton.dataset.protonConfirm = "executing";
          // Trigger click again
          setTimeout(function () {
            rebootButton.click();
            // Reset after execution
            setTimeout(function () {
              rebootButton.dataset.protonConfirm = "attached";
            }, 1000);
          }, 50);
        });
      },
      true,
    ); // Use capture phase to intercept before LuCI handlers

    function showRebootConfirmation(executeCallback, context, args) {
      // Create modal overlay
      const overlay = document.createElement("div");
      overlay.className = "proton-reboot-modal-overlay";
      overlay.style.cssText =
        "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease;";

      // Create modal
      const modal = document.createElement("div");
      modal.className = "proton-reboot-modal";
      modal.style.cssText =
        "background: var(--proton-bg-secondary); border: 1px solid var(--proton-border); border-radius: var(--proton-radius); padding: 28px; max-width: 440px; width: calc(100% - 40px); box-shadow: var(--proton-shadow-lg); animation: slideUp 0.3s ease;";

      // Modal header
      const header = document.createElement("div");
      header.style.cssText =
        "display: flex; align-items: center; gap: 12px; margin-bottom: 16px;";
      header.innerHTML =
        '<span style="font-size: 28px;">⚠️</span><h3 style="margin: 0; font-size: 1.3rem; color: var(--proton-fg);">' +
        tr("Confirm Reboot") +
        "</h3>";
      modal.appendChild(header);

      // Modal body
      const body = document.createElement("div");
      body.style.cssText = "margin-bottom: 24px;";
      body.innerHTML =
        '<p style="margin: 0 0 12px; color: var(--proton-fg); font-size: 1rem; line-height: 1.6;">' +
        tr("Are you sure you want to reboot the system?") +
        '</p><p style="margin: 0; color: var(--proton-muted); font-size: 0.9rem; line-height: 1.5;">' +
        tr(
          "This action will restart your router and temporarily interrupt network connectivity.",
        ) +
        "</p>";
      modal.appendChild(body);

      // Modal footer (buttons)
      const footer = document.createElement("div");
      footer.style.cssText =
        "display: flex; gap: 12px; justify-content: flex-end;";

      // Close on Escape key
      const escHandler = function (e) {
        if (e.key === "Escape") {
          closeModal();
        }
      };
      document.addEventListener("keydown", escHandler);

      // Unified close function
      function closeModal() {
        document.removeEventListener("keydown", escHandler);
        overlay.style.animation = "fadeOut 0.2s ease";
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
      }

      // Cancel button
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "cbi-button cbi-button-neutral";
      cancelBtn.textContent = tr("Cancel");
      cancelBtn.style.cssText = "padding: 10px 24px; min-width: 100px;";
      cancelBtn.addEventListener("click", closeModal);
      footer.appendChild(cancelBtn);

      // Confirm button
      const confirmBtn = document.createElement("button");
      confirmBtn.className = "cbi-button cbi-button-negative";
      confirmBtn.innerHTML = "⭮ " + tr("Reboot Now");
      confirmBtn.style.cssText =
        "padding: 10px 24px; min-width: 120px; background: #e53e3e !important; border-color: #e53e3e !important; color: #fff !important;";

      var isSubmitting = false;
      confirmBtn.addEventListener("click", function () {
        // Prevent double-click
        if (isSubmitting) return;
        isSubmitting = true;

        // Disable button
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.6";
        confirmBtn.style.cursor = "not-allowed";

        // Close modal
        document.removeEventListener("keydown", escHandler);
        overlay.style.animation = "fadeOut 0.2s ease";
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);

        // Execute reboot after modal closes
        setTimeout(function () {
          if (executeCallback) {
            if (context && args) {
              executeCallback.apply(context, args);
            } else {
              executeCallback();
            }
          }
        }, 250);
      });
      footer.appendChild(confirmBtn);

      modal.appendChild(footer);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Close on overlay click
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          closeModal();
        }
      });

      // Focus confirm button
      setTimeout(function () {
        confirmBtn.focus();
      }, 100);
    }
  }

  // Initialize on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRebootConfirmation);
  } else {
    initRebootConfirmation();
  }

  // Re-initialize on SPA navigation
  const rebootObserver = new MutationObserver(function (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "data-page") {
        setTimeout(initRebootConfirmation, 50);
        break;
      }
    }
  });
  rebootObserver.observe(document.body, { attributes: true });

  // Also watch for button injection
  const buttonObserver = new MutationObserver(function () {
    if (document.body.dataset.page === "admin-system-reboot") {
      initRebootConfirmation();
    }
  });
  buttonObserver.observe(document.body, { childList: true, subtree: true });
})();

// =====================================================
// luci-mod-dashboard — fix section inline backgrounds
// luci-mod-dashboard may assign var(--proton-bg) via
// inline style. CSS !important handles class-based rules;
// this handles any remaining inline style overrides.
// =====================================================
(function () {
  "use strict";

  function fixDashboardSectionBackgrounds() {
    var page = document.body.dataset.page || "";
    if (page.indexOf("admin-dashboard") !== 0) return;

    var sections = document.querySelectorAll(".cbi-section");
    for (var i = 0; i < sections.length; i++) {
      var el = sections[i];
      var inlineStyle = el.getAttribute("style") || "";
      // Только если инлайн-стиль явно выставляет var(--proton-bg) без суффикса
      if (inlineStyle && /--proton-bg\b/.test(inlineStyle) && !/--proton-bg-/.test(inlineStyle)) {
        el.style.background = "var(--proton-bg-secondary)";
        el.style.borderColor = "var(--proton-border)";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixDashboardSectionBackgrounds);
  } else {
    fixDashboardSectionBackgrounds();
  }

  // SPA navigation
  var dashBgObserver = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "data-page") {
        setTimeout(fixDashboardSectionBackgrounds, 100);
        break;
      }
    }
  });
  dashBgObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-page"],
  });

  // Watch for dynamically added sections on dashboard
  var dashContentObserver = new MutationObserver(function () {
    var page = document.body.dataset.page || "";
    if (page.indexOf("admin-dashboard") === 0) {
      fixDashboardSectionBackgrounds();
    }
  });
  dashContentObserver.observe(document.body, { childList: true, subtree: true });
})();
