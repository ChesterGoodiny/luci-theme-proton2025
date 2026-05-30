/**
 * Proton2025 - Search Data Registry
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 */

"use strict";

(function () {
  const globalScope = window;
  const registry =
    globalScope.ProtonSearchData ||
    (globalScope.ProtonSearchData = {
      semanticEntries: [],

      registerSemantic(entries) {
        if (!Array.isArray(entries)) return;

        entries.forEach((entry) => {
          if (!entry || typeof entry !== "object") return;

          const normalized = {
            id: typeof entry.id === "string" ? entry.id : "",
            title: typeof entry.title === "string" ? entry.title : "",
            category:
              typeof entry.category === "string" ? entry.category : "General",
            description:
              typeof entry.description === "string" ? entry.description : "",
            boost: Number.isFinite(entry.boost) ? entry.boost : 0,
            hrefIncludes: Array.isArray(entry.hrefIncludes)
              ? entry.hrefIncludes.filter(Boolean)
              : [],
            keywords: Array.isArray(entry.keywords)
              ? entry.keywords.filter(Boolean)
              : [],
          };

          if (
            normalized.id &&
            this.semanticEntries.some(
              (existing) => existing.id === normalized.id,
            )
          ) {
            return;
          }

          this.semanticEntries.push(normalized);
        });
      },
    });

  const semanticManifest = [
    {
      id: "status-overview",
      boost: 20,
      hrefIncludes: ["admin/status/overview"],
    },
    {
      id: "status-temperature",
      boost: 24,
      hrefIncludes: ["admin/status/realtime/temperature"],
    },
    {
      id: "network-interfaces",
      boost: 18,
      hrefIncludes: ["admin/network/network", "admin/network/interfaces"],
    },
    {
      id: "network-wireless",
      boost: 24,
      hrefIncludes: ["admin/network/wireless"],
    },
    {
      id: "network-firewall",
      boost: 22,
      hrefIncludes: ["admin/network/firewall"],
    },
    { id: "network-dhcp", boost: 18, hrefIncludes: ["admin/network/dhcp"] },
    { id: "system-system", boost: 18, hrefIncludes: ["admin/system/system"] },
    { id: "system-startup", boost: 20, hrefIncludes: ["admin/system/startup"] },
    {
      id: "system-software",
      boost: 22,
      hrefIncludes: ["admin/system/software"],
    },
  ];

  function firstNonEmptyString(values) {
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    return "";
  }

  function dedupeStrings(values) {
    const unique = [];

    values.forEach((value) => {
      const normalized = String(value || "").trim();
      if (!normalized) return;
      if (unique.indexOf(normalized) !== -1) return;
      unique.push(normalized);
    });

    return unique;
  }

  function getSemanticCatalog() {
    if (typeof globalScope.protonGetSemanticTranslations === "function") {
      return globalScope.protonGetSemanticTranslations();
    }

    return { base: {}, locale: {} };
  }

  function buildSemanticEntries() {
    const catalog = getSemanticCatalog();

    return semanticManifest.map((item) => {
      const baseEntry = catalog.base[item.id] || {};
      const localeEntry = catalog.locale[item.id] || {};

      return {
        id: item.id,
        title: firstNonEmptyString([
          localeEntry.title,
          baseEntry.title,
          item.title,
        ]),
        category: firstNonEmptyString([
          localeEntry.category,
          baseEntry.category,
          item.category,
          "General",
        ]),
        description: firstNonEmptyString([
          localeEntry.description,
          baseEntry.description,
          item.description,
        ]),
        boost: Number.isFinite(item.boost) ? item.boost : 0,
        hrefIncludes: Array.isArray(item.hrefIncludes)
          ? item.hrefIncludes.filter(Boolean)
          : [],
        keywords: dedupeStrings(
          []
            .concat(Array.isArray(baseEntry.keywords) ? baseEntry.keywords : [])
            .concat(
              Array.isArray(localeEntry.keywords) ? localeEntry.keywords : [],
            ),
        ),
      };
    });
  }

  registry.registerSemantic(buildSemanticEntries());
})();
