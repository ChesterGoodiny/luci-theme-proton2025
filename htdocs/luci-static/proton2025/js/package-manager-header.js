/**
 * Proton2025 — Package Manager header decoration (System -> Packages)
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under Apache License 2.0
 *
 * Перекомпоновывает верхний блок страницы пакетов под дизайн из превью.
 * Все нативные узлы LuCI переносятся (не клонируются), чтобы сохранить
 * обработчики событий view-JS. Идемпотентная инициализация — повторно
 * вызывается при SPA-навигации.
 */

(function () {
  "use strict";

  const SCOPE = 'body[data-page="admin-system-package-manager"]';
  const MARK = 'data-pk-header-decorated';

  // --- i18n ---
  // Все подписи страницы берём из нативных узлов LuCI: они уже переведены
  // языковым пакетом, поэтому тема не дублирует строки LuCI в своих словарях
  // (иначе каждый новый язык требовал бы правки XX-xx.js).
  // Собственных строк только две — «free»/«used» для дискового кольца.
  const tr = function (key) {
    if (typeof window.protonT === "function") {
      return window.protonT(key);
    }
    return key;
  };

  // Текст нативной подписи без двоеточия ("Фильтр:" -> "Фильтр")
  function labelOf(node) {
    if (!node) return "";
    const lbl = node.querySelector(":scope > label") || node.querySelector("label");
    return lbl ? (lbl.textContent || "").trim().replace(/:\s*$/, "") : "";
  }

  function init() {
    const scope = document.querySelector(SCOPE);
    if (!scope) return;

    // LuCI SPA рендерит #view асинхронно: пока h2/.controls нет — выходим
    const view = document.getElementById("view") || scope;
    const titleNode = view.querySelector("h2");
    const controls = view.querySelector(".controls");
    if (!titleNode || !controls) return;

    // Идемпотентность в пределах ТЕКУЩЕГО рендера: если у актуального h2
    // уже есть декоративная обёртка — повторно не оформляем
    if (titleNode.closest(".pk-header")) {
      buildListCard(view);
      refreshTabCounts();
      bindCounters(view);
      installCounterHook();
      return;
    }

    // Остатки декора от предыдущего рендера view убираем: в них только
    // наши узлы и узлы прошлой генерации, актуальному рендеру они не нужны
    const liveTable = view.querySelector("#packages");
    view.querySelectorAll(".pk-panel, .pk-header, .pk-toolbar, .pk-list-card").forEach(function (el) {
      if (!el.contains(titleNode) && !el.contains(controls) && !el.contains(liveTable)) el.remove();
    });

    buildHeader(view, titleNode);
    buildToolbar(view, controls);
    buildTabs(view);
    buildListCard(view);
    bindExpand(view);
    bindShortcuts(scope);
    bindCounters(view);
  }

  // Пересчёт бейджей при смене режима i18n-фильтра (нативное радио LuCI
  // перерисовывает таблицу — счётчики должны совпадать с пагинацией).
  function bindCounters(view) {
    if (!view || view.__pkCountersBound) return;
    view.__pkCountersBound = true;
    view.addEventListener("change", function (e) {
      if (e.target && e.target.name === "filter_i18n") {
        refreshTabCounts();
      }
    });
  }

  // ===== Иконки (декоративные, stroke — currentColor) =====
  const ICONS = {
    update: '<path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/>',
    chev: '<polyline points="6 9 12 15 18 9"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    opkg: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    warn: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
  };

  function makeIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "pk-ic");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = ICONS[name] || "";
    return svg;
  }

  // Иконочная кнопка: нативный текст прячем в .pk-act-short (виден на мобиле),
  // подпись — в aria-label. Нативные обработчики не затрагиваются.
  function decorateActionButton(btn) {
    const text = (btn.textContent || "").trim();
    // Тип определяем по нативным признакам LuCI, а не по тексту кнопки:
    // подпись переводится языковым пакетом, искать в ней RU/EN слова нельзя.
    let kind = "opkg";
    const cmd = (btn.getAttribute("data-command") || "").toLowerCase();
    if (cmd === "update" || btn.classList.contains("cbi-button-positive")) {
      kind = "update";
    } else if (btn.classList.contains("cbi-button-neutral")) {
      kind = "opkg";
    } else if (btn.classList.contains("cbi-button-action")) {
      kind = "upload";
    } else if (/обновить|update/i.test(text)) {
      kind = "update";
    } else if (/загрузить|upload/i.test(text)) {
      kind = "upload";
    }
    while (btn.firstChild) btn.removeChild(btn.firstChild);
    btn.appendChild(makeIcon(kind));
    const span = document.createElement("span");
    span.className = "pk-act-short";
    span.textContent = text;
    btn.appendChild(span);
    btn.classList.add("pk-act");
    if (kind === "update") {
      btn.classList.add("pk-act--green");
      // Спиннер (как в превью jp.act.busy): с клика до обновления таблицы
      btn.addEventListener("click", function () {
        if (btn.classList.contains("pk-busy")) return;
        btn.classList.add("pk-busy");
        const fin = function () {
          btn.classList.remove("pk-busy");
          tmo.disconnect();
          clearTimeout(watch);
        };
        const table = document.querySelector("#view table.table");
        const tmo = new MutationObserver(fin);
        if (table) tmo.observe(table, { childList: true, subtree: true });
        const watch = window.setTimeout(fin, 30000);
      });
    }
    btn.setAttribute("aria-label", text);
    btn.title = text;
  }

  // ===== HEADER: заголовок + описание/предупреждение + диск-пилюля =====
  // Вся шапка (заголовок, тулбар, табы) живёт в одной карточке — как в превью.
  function getPanel(view) {
    let panel = view.querySelector(".pk-panel");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.className = "pk-panel";
    const h2 = view.querySelector("h2");
    if (h2 && h2.parentNode) h2.parentNode.insertBefore(panel, h2);
    else view.appendChild(panel);
    return panel;
  }

  function buildHeader(view, titleNode) {
    const wrap = document.createElement("div");
    wrap.className = "pk-header";
    getPanel(view).appendChild(wrap);

    // Строка заголовка: h2 + нотка в одну строку (как .pk-top в превью)
    const titleRow = document.createElement("div");
    titleRow.className = "pk-title-row";
    titleRow.appendChild(titleNode);
    wrap.appendChild(titleRow);

    // Описание + предупреждение (cbi-map-descr) — переносим в строку заголовка,
    // добавляем warn-иконку (как в превью: иконка ⚠ перед ноткой)
    const descr = view.querySelector(".cbi-map-descr");
    if (descr) {
      const warn = makeIcon("warn");
      warn.setAttribute("class", "pk-warn-ic");
      descr.insertBefore(warn, descr.firstChild);
      titleRow.appendChild(descr);
    }

    // Диск-пилюля: переносим нативный progress-узел, не клонируем!
    const diskNative = view.querySelector(".cbi-progressbar");
    if (diskNative) {
      const pill = document.createElement("div");
      pill.className = "pk-disk-pill";
      pill.title = diskNative.title || "";
      const diskLabel = labelOf(diskNative.parentElement);
      if (diskLabel) pill.setAttribute("aria-label", diskLabel);

      const ring = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      ring.setAttribute("class", "pk-ring");
      ring.setAttribute("viewBox", "0 0 36 36");

      const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bg.setAttribute("class", "pk-ring-bg");
      bg.setAttribute("cx", "18");
      bg.setAttribute("cy", "18");
      bg.setAttribute("r", "15.5");
      ring.appendChild(bg);

      const val = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      val.setAttribute("class", "pk-ring-val");
      val.setAttribute("cx", "18");
      val.setAttribute("cy", "18");
      val.setAttribute("r", "15.5");
      ring.appendChild(val);
      pill.appendChild(ring);

      const label = document.createElement("span");
      pill.appendChild(label);

      const pct = document.createElement("span");
      pct.className = "pk-pct";
      pill.appendChild(pct);

      wrap.appendChild(pill);

      // Скрываем нативный узел, но не удаляем — LuCI может обновить его
      diskNative.style.display = "none";

      updateDisk(pill, label, pct, diskNative);

      // MutationObserver: если LuCI перерендерит прогресс — обновляем пилюлю
      const mo = new MutationObserver(function () {
        updateDisk(pill, label, pct, diskNative);
      });
      mo.observe(diskNative, { attributes: true, subtree: true, childList: true });
    }
  }

  function updateDisk(pill, label, pct, src) {
    const source = src || pill;
    const title = source.title || "";

    // Формат подсказки LuCI (RU): "75% использовано (65.68 MiB использовано из 86.91 MiB, 21.23 MiB свободно)"
    //                            (EN): "75% used (65.68 MiB used of 86.91 MiB, 21.23 MiB free)"
    // проценты:
    const pm = title.match(/(\d+)\s*%/);
    let pctVal = pm ? parseInt(pm[1], 10) : 0;

    // пары «число единица»: первая — занято, вторая — всего
    const pairs = title.match(/[\d.]+\s*[A-Za-zА-Яа-я]{2,4}/g) || [];
    let free = null;
    let unit = "";
    if (pairs.length >= 2) {
      const used = parseFloat(pairs[0]);
      const total = parseFloat(pairs[1]);
      const um = pairs[1].match(/([A-Za-zА-Яа-я]{2,4})$/);
      if (um) unit = um[1];
      if (total > 0) {
        free = total - used;
        if (!pctVal) pctVal = Math.round((used / total) * 100);
      }
    }

    if (title) pill.title = title;

    if (free !== null) {
      label.innerHTML = "<b>" + free.toFixed(2) + " " + unit + "</b> " + (tr("free") || "free");
    } else {
      label.textContent = tr("used") || "used";
    }

    pct.textContent = pctVal + "%";

    const ring = pill.querySelector(".pk-ring-val");
    if (ring) {
      const dash = 97.4;
      ring.style.strokeDashoffset = (dash - dash * pctVal / 100) + "";
    }
  }

  // ===== TOOLBAR: собираем из нативных узлов .controls новую панель =====
  function buildToolbar(view, controls) {
    const firstControls = controls;
    if (!firstControls) return;

    const bar = document.createElement("div");
    bar.className = "pk-toolbar";
    getPanel(view).appendChild(bar);

    // Нативные подписи групп (переведены LuCI) — нужны до переноса узлов
    const installInput = firstControls.querySelector('input[name="install"]');
    const installLabel = installInput ? labelOf(installInput.closest("div")) : "";
    const i18nRadios = firstControls.querySelectorAll('input[name="filter_i18n"]');
    const i18nGroup = i18nRadios.length ? i18nRadios[0].closest("div") : null;
    const i18nLabel = i18nGroup ? labelOf(i18nGroup.parentElement) : "";

    // --- Блок 1: Дисковое пространство уже в заголовке, пропускаем ---

    // --- Блок 2: Фильтр-пилюля ---
    const filterInput = firstControls.querySelector('input[name="filter"]');
    if (filterInput) {
      const searchOriginalParent = filterInput.parentNode;
      const search = document.createElement("label");
      search.className = "pk-search";
      const searchLabel = (filterInput.placeholder || "").trim();
      if (searchLabel) search.setAttribute("aria-label", searchLabel);

      const searchSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      searchSvg.setAttribute("class", "pk-ic");
      searchSvg.setAttribute("viewBox", "0 0 24 24");
      searchSvg.setAttribute("fill", "none");
      searchSvg.setAttribute("stroke", "currentColor");
      searchSvg.setAttribute("stroke-width", "2");
      searchSvg.setAttribute("stroke-linecap", "round");
      searchSvg.setAttribute("stroke-linejoin", "round");
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "11");
      circle.setAttribute("cy", "11");
      circle.setAttribute("r", "7");
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "21");
      line.setAttribute("y1", "21");
      line.setAttribute("x2", "16.65");
      line.setAttribute("y2", "16.65");
      searchSvg.appendChild(circle);
      searchSvg.appendChild(line);
      search.appendChild(searchSvg);

      // Переносим нативный input
      search.appendChild(filterInput);

      // Нативная кнопка сброса фильтра — в пилюлю как «✕» (видна при вводе)
      const filterGroup = searchOriginalParent || filterInput.parentNode;
      const clearBtn = filterGroup ? filterGroup.querySelector("button") : null;
      if (clearBtn) {
        clearBtn.classList.add("pk-clear");
        const clearLabel = (clearBtn.textContent || "").trim();
        clearBtn.textContent = "";
        if (clearLabel) {
          clearBtn.setAttribute("aria-label", clearLabel);
          clearBtn.title = clearLabel;
        }
        clearBtn.appendChild(makeIcon("close"));
        search.appendChild(clearBtn);
      }

      const kbd = document.createElement("kbd");
      kbd.textContent = "/";
      kbd.setAttribute("aria-hidden", "true");
      search.appendChild(kbd);

      bar.appendChild(search);
    }

    // --- Блок 3: Иконочные действия ---
    const actions = document.createElement("div");
    actions.className = "pk-actions";

    // Группа действий — control-group без текстовых полей ввода
    // (группы фильтра и установки содержат <input>, группа действий — нет)
    let actionGroup = null;
    firstControls.querySelectorAll(".control-group").forEach(function (cg) {
      if (!cg.querySelector("input")) actionGroup = cg;
    });
    const actionButtons = actionGroup ? actionGroup.querySelectorAll("button") : [];
    actionButtons.forEach(function (btn) {
      decorateActionButton(btn);
      actions.appendChild(btn);
    });

    // Если кнопки не найдены — ищем по всем кнопкам в controls
    if (actions.children.length === 0) {
      const allBtns = firstControls.querySelectorAll("button");
      allBtns.forEach(function (btn) {
        // Пропускаем кнопки в группах фильтра/установки (с input) и пагинацию
        const holder = btn.closest(".control-group");
        if (holder && holder.querySelector("input")) return;
        if (/«|»|prev|next/i.test(btn.textContent || "")) return;
        decorateActionButton(btn);
        actions.appendChild(btn);
      });
    }

    // Собственная кнопка-toggle раскрытия установки — отдельный узел,
    // нативные обработчики кнопок LuCI не трогаем
    if (installInput) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "pk-act pk-act--toggle";
      if (installLabel) toggle.setAttribute("aria-label", installLabel);
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "pk-install-expand");
      toggle.appendChild(makeIcon("download"));
      const full = document.createElement("span");
      full.className = "pk-act-full";
      full.textContent = installLabel;
      toggle.appendChild(full);
      const short = document.createElement("span");
      short.className = "pk-act-short";
      short.textContent = installLabel;
      toggle.appendChild(short);
      // Чеврон: разворачивается при открытии раскрытия (как в превью)
      const chev = makeIcon("chev");
      chev.classList.add("pk-chev");
      toggle.appendChild(chev);
      actions.appendChild(toggle);
    }

    if (actions.children.length > 0) {
      bar.appendChild(actions);
    }

    // --- Вертикальный разделитель ---
    if (actions.children.length > 0) {
      const vsep = document.createElement("span");
      vsep.className = "pk-vsep";
      bar.appendChild(vsep);
    }

    // --- Блок 4: Сегмент локализаций ---
    if (i18nRadios.length) {
      const seg = document.createElement("div");
      seg.className = "pk-seg";
      seg.setAttribute("role", "group");
      if (i18nLabel) seg.setAttribute("aria-label", i18nLabel);

      i18nRadios.forEach(function (radio) {
        const lbl = document.createElement("label");
        const span = document.createElement("span");
        span.className = "pk-seg-btn";

        const srcLabel = radio.parentNode;
        span.textContent = srcLabel ? srcLabel.textContent.trim() : radio.value;

        lbl.appendChild(radio);
        lbl.appendChild(span);

        if (radio.checked) span.classList.add("is-on");

        radio.addEventListener("change", function () {
          seg.querySelectorAll(".pk-seg-btn").forEach(function (s) {
            s.classList.remove("is-on");
          });
          span.classList.add("is-on");
        });

        seg.appendChild(lbl);
      });

      bar.appendChild(seg);
    }

    // --- Блок 5: Раскрытие «Установить по URL» ---
    if (installInput) {
      const expand = document.createElement("div");
      expand.className = "pk-expand";
      expand.id = "pk-install-expand";

      const group = document.createElement("div");
      group.className = "pk-input-group";

      // Кнопка подтверждения живёт в нативном .control-group рядом с input —
      // забираем её ДО переноса input (иначе parentNode уже наш контейнер).
      // Текст кнопки нативный (переведён LuCI), не подменяем.
      const installGroup = installInput.parentNode;
      const acceptBtn = installGroup ? installGroup.querySelector("button") : null;

      group.appendChild(installInput);
      if (acceptBtn) {
        group.appendChild(acceptBtn);
      }

      expand.appendChild(group);
      bar.appendChild(expand);
    }

    // Оригинальный .controls прячем (не удаляем — могут быть скрытые узлы/обработчики).
    // Класс pk-is-hidden нужен, т.к. cascade.css держит панель открытой через
    // display:flex !important.
    firstControls.classList.add("pk-is-hidden");
    firstControls.style.display = "none";
  }

  // ===== СЧЁТЧИКИ ТАБОВ: только живые данные LuCI =====
  // View-скрипт сам грузит списки через fs.exec_direct('/usr/libexec/package-manager-call',
  // ['list-available'|'list-installed']). Перехватываем уже загруженные ответы
  // (без повторных тяжёлых вызовов opkg) и считаем строки тем же алгоритмом,
  // что display() во view: available — все пакеты, installed — status=installed,
  // updates — установленные, для которых версия в available больше.
  const PKG_MAPS = { available: null, installed: null };
  const TAB_COUNTS = { available: null, installed: null, updates: null };
  let hookState = 0; // 0 — не установлен, 1 — ставится/установлен

  function orderOf(c) {
    if (c === "~") return -1;
    if (c === "" || (c >= "0" && c <= "9")) return 0;
    if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) return c.charCodeAt(0);
    return c.charCodeAt(0) + 256;
  }

  // Копия compareVersion() из view-скрипта — счётчик «Обновления» обязан
  // совпадать с тем, что реально покажет таблица.
  function compareVersion(val, ref) {
    let vi = 0, ri = 0;
    const isdigit = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 };
    val = val || "";
    ref = ref || "";
    if (val === ref) return 0;
    while (vi < val.length || ri < ref.length) {
      let firstDiff = 0;
      while ((vi < val.length && !isdigit[val.charAt(vi)]) ||
             (ri < ref.length && !isdigit[ref.charAt(ri)])) {
        const vc = orderOf(val.charAt(vi));
        const rc = orderOf(ref.charAt(ri));
        if (vc !== rc) return vc - rc;
        vi++; ri++;
      }
      while (val.charAt(vi) === "0") vi++;
      while (ref.charAt(ri) === "0") ri++;
      while (isdigit[val.charAt(vi)] && isdigit[ref.charAt(ri)]) {
        firstDiff = firstDiff || (val.charCodeAt(vi) - ref.charCodeAt(ri));
        vi++; ri++;
      }
      if (isdigit[val.charAt(vi)]) return 1;
      if (isdigit[ref.charAt(ri)]) return -1;
      if (firstDiff) return firstDiff;
    }
    return 0;
  }

  // Разбор станз opkg/apk (те же правила, что parseList во view: значение
  // «Package:» начинает новую станзу, пустая строка — коммитит её).
  function parsePkgStanzas(text) {
    const dest = { pkgs: {} };
    if (typeof text !== "string" || !text) return dest;

    const re = /([^\n]*)\n/g;
    let pkg = null, key = null, val = null, m;
    while ((m = re.exec(text)) !== null) {
      if (/^\s/.test(m[1])) {
        if (pkg !== null && key !== null && val !== null)
          val += "\n" + m[1].trim();
        continue;
      }
      if (key !== null && val !== null) {
        if (key === "package") {
          pkg = { name: val };
        } else if (pkg) {
          if (key === "version") pkg.version = val;
          else if (key === "status") {
            const st = val.split(/\s+/);
            if (st[2] === "installed") pkg.installed = true;
          }
        }
        key = val = null;
      }
      const kv = m[1].trim().match(/^([\w-]+)\s*:(.+)$/);
      if (kv) {
        key = kv[1].toLowerCase();
        val = kv[2].trim();
      } else if (pkg) {
        dest.pkgs[pkg.name] = pkg;
      }
    }
    return dest;
  }

  function recalcTabCounts() {
    const avail = PKG_MAPS.available;
    const inst = PKG_MAPS.installed;
    // Ждём оба списка: режим lang зависит от установленных luci-i18n-base-*
    if (!avail || !inst) return;
    let installedCount = 0, updatesCount = 0, availableCount = 0;

    // Таблица скрывает luci-i18n-* по радио «Отображать пакеты локализации LuCI»:
    // none — скрыть все, all — показать все, lang — только base-* и текущие языки.
    const radio = document.querySelector('#view input[name="filter_i18n"]:checked');
    const mode = radio ? radio.value : "none";
    let langRe = null;
    if (mode === "lang") {
      const langs = ["en"];
      if (inst) {
        for (const name in inst.pkgs) {
          if (name.indexOf("luci-i18n-base-") === 0) langs.push(name.substring(15));
        }
      }
      langRe = new RegExp("^luci-i18n-(base-.+|.+-(" + langs.join("|") + "))$");
    }
    const visible = function (name) {
      if (name.indexOf("luci-i18n-") !== 0) return true;
      if (mode === "all") return true;
      if (mode === "lang") return langRe.test(name);
      return false;
    };

    if (avail) {
      for (const name in avail.pkgs) if (visible(name)) availableCount++;
    }

    if (inst) {
      for (const name in inst.pkgs) {
        const pkg = inst.pkgs[name];
        if (!pkg || !pkg.installed || !visible(name)) continue;
        installedCount++;
        const ap = avail && avail.pkgs[name];
        if (ap && compareVersion(ap.version, pkg.version) > 0) updatesCount++;
      }
    }

    TAB_COUNTS.available = availableCount;
    TAB_COUNTS.installed = installedCount;
    TAB_COUNTS.updates = updatesCount;
  }

  // Пересчёт + отрисовка. Данные могут прийти раньше, чем LuCI построит
  // радио-фильтр: тогда init() вызовет это повторно уже после рендера.
  function refreshTabCounts() {
    recalcTabCounts();
    applyTabCounts();
  }

  function applyTabCounts() {
    const scope = document.querySelector(SCOPE);
    if (!scope) return;

    scope.querySelectorAll("ul.cbi-tabmenu li[data-mode], .tabs li[data-mode]").forEach(function (li) {
      const mode = li.getAttribute("data-mode");
      const n = TAB_COUNTS[mode];
      const target = li.querySelector("button, a") || li;
      let badge = target.querySelector(".pk-count");

      if (n === null || n === undefined) {
        if (badge) badge.remove();
        return;
      }
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "pk-count";
        target.appendChild(badge);
      }
      const txt = String(n);
      // не трогаем DOM, если число не изменилось (MutationObserver → init)
      if (badge.textContent !== txt) badge.textContent = txt;
    });
  }

  // Патчим singleton-модуль fs: view держит тот же объект (AMD-модуль),
  // поэтому перехват видит его собственные вызовы exec_direct.
  function patchFsCounter(fs) {
    if (!fs || typeof fs.exec_direct !== "function" || fs.__pkCounters) return false;
    fs.__pkCounters = true;

    const orig = fs.exec_direct;
    fs.exec_direct = function (cmd, args) {
      const out = orig.apply(fs, arguments);
      try {
        const kind = Array.isArray(args) ? args[0] : null;
        if ((kind === "list-available" || kind === "list-installed") &&
            out && typeof out.then === "function") {
          out.then(function (data) {
            PKG_MAPS[kind === "list-available" ? "available" : "installed"] = parsePkgStanzas(data);
            refreshTabCounts();
          }).catch(function () { /* данные не пришли — счётчики не трогаем */ });
        }
      } catch (e) { /* декорация не должна ломать страницу */ }
      return out;
    };
    return true;
  }

  function installCounterHook() {
    if (hookState) return;
    if (typeof window.L === "undefined" || typeof window.L.require !== "function") return;

    let mod;
    try { mod = window.L.require("fs"); } catch (e) { return; }
    if (!mod) return;

    hookState = 1;
    if (typeof mod.then === "function") {
      mod.then(function (fs) {
        if (!patchFsCounter(fs)) hookState = 0;
        else refreshTabCounts();
      }).catch(function () { hookState = 0; });
    } else if (!patchFsCounter(mod)) {
      hookState = 0;
    } else {
      refreshTabCounts();
    }
  }

  // ===== TABS: декорируем нативные табы подчёркиванием =====
  function buildTabs(scope) {
    const tabs = scope.querySelectorAll("ul.cbi-tabmenu li[data-mode], .tabs li[data-mode]");
    if (!tabs.length) return;

    const ul = tabs[0].parentNode;
    ul.classList.add("pk-tabs");
    // Табы — часть той же карточки, что заголовок и тулбар
    getPanel(scope).appendChild(ul);

    refreshTabCounts();
  }

  // ===== КАРТОЧКА СПИСКА: pager-крышка + таблица + pager-подвал =====
  // Собираем одну карточку переносом нативных узлов (без cloneNode), чтобы
  // сохранить обработчики view-JS. Идемпотентно: при повторном рендере
  // таблица и пагинации просто переезжают в существующую обёртку.
  function buildListCard(view) {
    const table = view.querySelector("#packages");
    if (!table) return;

    const isPager = function (el) {
      return !!el && el.classList && el.classList.contains("controls") &&
        !el.classList.contains("pk-is-hidden") && !!el.querySelector(".pager");
    };

    let card = view.querySelector(".pk-list-card");
    if (card && !card.contains(table)) {
      card.remove();
      card = null;
    }
    if (!card) {
      card = document.createElement("div");
      card.className = "pk-list-card";
      table.parentNode.insertBefore(card, table);
    }

    // верхний pager (крышка) → таблица → нижний pager (подвал)
    const prev = card.previousElementSibling;
    if (isPager(prev)) card.insertBefore(prev, card.firstChild);
    if (table.parentNode !== card) card.appendChild(table);
    const next = card.nextElementSibling;
    if (isPager(next)) card.appendChild(next);
  }

  // ===== РАСКРЫТИЕ «Установить по URL» =====
  function bindExpand(scope) {
    const toggle = scope.querySelector(".pk-act--toggle");
    const expand = scope.querySelector(".pk-expand");
    if (!toggle || !expand) return;

    toggle.addEventListener("click", function (e) {
      const open = expand.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open);
      if (open) {
        setTimeout(function () {
          const input = expand.querySelector("input");
          if (input) input.focus();
        }, 200);
      }
    });
  }

  // ===== ГОРЯЧАЯ КЛАВИША "/" для поиска =====
  function bindShortcuts(scope) {
    window.addEventListener("keydown", function (e) {
      if (e.key !== "/") return;
      if (!scope.contains(document.activeElement)) return;
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      e.preventDefault();
      const input = scope.querySelector(".pk-search input");
      if (input) input.focus();
    });
  }

  // ===== HOOK: SPA-навигация =====
  function attachPageObserver() {
    const bodyObserver = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === "data-page") {
          const page = document.body.getAttribute("data-page");
          if (page === "admin-system-package-manager") {
            // Сбрасываем метку для повторной инициализации
            const scope = document.querySelector(SCOPE);
            if (scope) scope.removeAttribute(MARK);
            setTimeout(init, 50);
          } else {
            const scope = document.querySelector(SCOPE);
            if (scope) scope.removeAttribute(MARK);
          }
          break;
        }
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["data-page"] });
  }

  // ===== HOOK: содержимое #view появляется/перерендеривается позже шапки —
  // наблюдатель догоняет и при новом рендере переоформляет шапку заново.
  function attachViewObserver() {
    const vp = document.getElementById("view");
    if (!vp) return;
    const io = new MutationObserver(function () {
      if (document.body.getAttribute("data-page") !== "admin-system-package-manager") return;
      if (!vp.querySelector("h2") || !vp.querySelector(".controls")) return;
      init();
    });
    io.observe(vp, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  document.addEventListener("luci-loaded", init);
  document.addEventListener("luci-loaded", installCounterHook);
  document.addEventListener("proton-spa-navigated", init);

  // Ставим перехват ДО того, как view начнёт грузить списки
  installCounterHook();

  attachPageObserver();
  attachViewObserver();

})();
