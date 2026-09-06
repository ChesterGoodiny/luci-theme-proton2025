/**
 * Proton2025 Theme - Translation runtime
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 *
 * v1.5.29: per-locale strings moved to XX-xx.js (loaded on demand from header.ut).
 * This file keeps only the language detection + lookup runtime; the active
 * locale file assigns a FLAT window.ProtonTranslations map used by protonT().
 */

window.protonGetLang = function () {
  if (!window._protonLangCache) {
    let lang = "en";

    if (document.body && document.body.dataset && document.body.dataset.lang) {
      lang = document.body.dataset.lang;
    } else if (document.body && document.body.className) {
      const langMatch = document.body.className.match(/\blang_([a-z]{2})\b/i);
      if (langMatch) {
        lang = langMatch[1];
      }
    } else if (document.documentElement) {
      const htmlLang =
        document.documentElement.lang ||
        document.documentElement.getAttribute("lang");
      if (htmlLang && htmlLang !== "en") {
        lang = htmlLang;
      }
    }

    if (lang === "en") {
      const scripts = document.querySelectorAll(
        'script[src*="/translations/"]',
      );
      for (const script of scripts) {
        const match = script.src.match(/\/translations\/([a-z]{2})(?:\?|$)/i);
        if (match) {
          lang = match[1];
          break;
        }
      }
    }

    if (lang === "en" && window.L && typeof window.L.tr === "function") {
      try {
        const testTranslation = window.L.tr("Save");
        if (testTranslation === "Сохранить") lang = "ru";
        else if (testTranslation === "Speichern") lang = "de";
        else if (testTranslation === "Зберегти") lang = "uk";
      } catch (e) {
      }
    }

    if (lang === "en") {
      const metaLang = document.querySelector('meta[name="language"]')?.content;
      if (metaLang) lang = metaLang;
    }

    window._protonLangCache = lang.split("-")[0].split("_")[0].toLowerCase();
  }

  return window._protonLangCache;
};


window.protonT = function (key) {
  if (window.ProtonTranslations && window.ProtonTranslations[key]) {
    return window.ProtonTranslations[key];
  }
  return key;
};
