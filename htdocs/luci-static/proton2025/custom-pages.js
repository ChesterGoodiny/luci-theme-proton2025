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
