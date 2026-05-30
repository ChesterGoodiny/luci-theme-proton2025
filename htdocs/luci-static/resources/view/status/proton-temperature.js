/**
 * Proton2025 - Temperature Status View
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 */

"use strict";
"require view";
"require poll";
"require rpc";

const callGetSensors = rpc.declare({
  object: "luci.proton-temp",
  method: "getSensors",
  expect: { sensors: [] },
});

const SENSOR_COLORS = [
  "#6bcf7f",
  "#38bdf8",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#14b8a6",
  "#a78bfa",
  "#ec4899",
];

const SENSOR_PATTERNS = ["", "10 4", "5 4", "14 4 4 4", "2 4", "12 4 2 4"];

const POLL_INTERVAL = 5;
const DEFAULT_WINDOW_MINUTES = 1;
const WINDOW_OPTIONS = [
  { minutes: 1, label: "1 min" },
  { minutes: 5, label: "5 min" },
  { minutes: 10, label: "10 min" },
  { minutes: 15, label: "15 min" },
];
const GRAPH_WIDTH = 960;
const GRAPH_HEIGHT = 320;
const GRAPH_PADDING = { top: 18, right: 24, bottom: 40, left: 56 };
const THRESHOLDS = {
  warm: 50,
  hot: 70,
  critical: 85,
};

const SVG_NS = "http://www.w3.org/2000/svg";

function t(key) {
  if (typeof window !== "undefined" && typeof window.protonT === "function")
    return window.protonT(key);

  if (typeof L !== "undefined" && typeof L.tr === "function") {
    const translated = L.tr(key);
    if (translated !== key) return translated;
  }

  return key;
}

function getSensorId(sensor) {
  return sensor.path || sensor.source || sensor.name || "sensor";
}

function formatSensorName(name) {
  let formatted = String(name || "")
    .replace(/^thermal_zone\d+_/, "")
    .replace(/_temp$/, "")
    .replace(/_input$/, "")
    .replace(/[-_]/g, " ")
    .trim();

  formatted = formatted.replace(/\b\w/g, function (c) {
    return c.toUpperCase();
  });

  const aliases = {
    Cpu: t("CPU"),
    Soc: t("SoC"),
    Wifi: t("WiFi"),
    Ddr: t("DDR"),
    Board: t("Board"),
  };

  Object.keys(aliases).forEach(function (key) {
    formatted = formatted.replace(
      new RegExp("\\b" + key + "\\b", "gi"),
      aliases[key],
    );
  });

  return formatted || t("Sensor");
}

function getTempLevel(temp) {
  if (temp >= THRESHOLDS.critical) return "critical";
  if (temp >= THRESHOLDS.hot) return "hot";
  if (temp >= THRESHOLDS.warm) return "warm";
  return "normal";
}

function getTempStatus(level) {
  return (
    {
      normal: t("Normal"),
      warm: t("Warm"),
      hot: t("Hot"),
      critical: t("Critical"),
    }[level] || t("Normal")
  );
}

function normalizeSensors(rawSensors) {
  if (!Array.isArray(rawSensors)) return [];

  return rawSensors
    .reduce(function (list, sensor) {
      if (!sensor || sensor.temp == null || isNaN(sensor.temp)) return list;

      const current = sensor.temp / 1000;
      const peak =
        sensor.peak != null && !isNaN(sensor.peak)
          ? sensor.peak / 1000
          : current;

      list.push({
        id: getSensorId(sensor),
        name: sensor.name || "Sensor",
        label: formatSensorName(sensor.name || "Sensor"),
        temp: current,
        peak: peak,
        path: sensor.path || "",
        source: sensor.source || "",
        level: getTempLevel(current),
      });

      return list;
    }, [])
    .sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });
}

function average(list) {
  if (!list.length) return 0;

  const total = list.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  return total / list.length;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatClock(date) {
  if (!(date instanceof Date)) return "-";

  return date.toLocaleTimeString(
    typeof navigator !== "undefined" ? navigator.language : undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    },
  );
}

function formatSeconds(seconds) {
  return "%d %s".format(seconds, t("s"));
}

function formatMinutesShort(minutes) {
  if (minutes % 1 !== 0) return "%.1f %s".format(minutes, t("min"));

  return "%d %s".format(minutes, t("min"));
}

function formatSampleOffset(seconds) {
  if (seconds <= 0) return t("Now");

  if (seconds < 60) return "-" + formatSeconds(seconds);

  return "-" + formatMinutesShort(seconds / 60);
}

function formatSampleMoment(referenceDate, seconds) {
  const offsetLabel = formatSampleOffset(seconds);

  if (!(referenceDate instanceof Date)) return offsetLabel;

  const sampleDate = new Date(referenceDate.getTime() - seconds * 1000);
  const clockLabel = formatClock(sampleDate);

  if (seconds <= 0) return clockLabel;

  return clockLabel + " (" + offsetLabel + ")";
}

function formatTempDelta(value) {
  const sign = value > 0 ? "+" : "";
  return sign + formatTemp(value, 1);
}

function formatTemp(value, digits) {
  return digits != null
    ? ("%." + digits + "f°C").format(value)
    : "%d°C".format(value);
}

function createSvgElement(tag, attrs, textContent) {
  const node = document.createElementNS(SVG_NS, tag);

  Object.keys(attrs || {}).forEach(function (key) {
    node.setAttribute(key, attrs[key]);
  });

  if (textContent != null) node.textContent = textContent;

  return node;
}

return view.extend({
  load: function () {
    return L.resolveDefault(callGetSensors(), null);
  },

  initState: function () {
    this.history = new Map();
    this.colors = new Map();
    this.patterns = new Map();
    this.currentSensors = [];
    this.selectedSensorId = null;
    this.windowMinutes = DEFAULT_WINDOW_MINUTES;
    this.maxPoints = (this.windowMinutes * 60) / POLL_INTERVAL;
    this.lastUpdate = null;
    this.errorState = false;
  },

  getColor: function (sensorId) {
    if (!this.colors.has(sensorId))
      this.colors.set(
        sensorId,
        SENSOR_COLORS[this.colors.size % SENSOR_COLORS.length],
      );

    return this.colors.get(sensorId);
  },

  getLinePattern: function (sensorId) {
    if (!this.patterns.has(sensorId))
      this.patterns.set(
        sensorId,
        SENSOR_PATTERNS[this.patterns.size % SENSOR_PATTERNS.length],
      );

    return this.patterns.get(sensorId);
  },

  buildTooltipRow: function (label, value, color) {
    const keyNodes = [];

    if (color)
      keyNodes.push(
        E("span", {
          class: "proton-temp-tooltip-swatch",
          style: "--sensor-color:%s".format(color),
        }),
      );

    keyNodes.push(E("span", { class: "proton-temp-tooltip-label" }, [label]));

    return E("div", { class: "proton-temp-tooltip-row" }, [
      E("div", { class: "proton-temp-tooltip-key" }, keyNodes),
      E("strong", { class: "proton-temp-tooltip-value" }, [value]),
    ]);
  },

  showChartTooltip: function (state) {
    if (!this.chartTooltipNode || !this.chartWrapNode) return;

    const tooltip = this.chartTooltipNode;
    const headNodes = [];
    const bodyNodes = (state.rows || []).map(
      L.bind(function (row) {
        return this.buildTooltipRow(row.label, row.value, row.color);
      }, this),
    );

    if (state.title)
      headNodes.push(
        E("strong", { class: "proton-temp-tooltip-title" }, [state.title]),
      );

    if (state.time)
      headNodes.push(
        E("span", { class: "proton-temp-tooltip-time" }, [state.time]),
      );

    tooltip.replaceChildren(
      E("div", { class: "proton-temp-tooltip-head" }, headNodes),
      E("div", { class: "proton-temp-tooltip-body" }, bodyNodes),
    );

    const bounds = this.chartWrapNode.getBoundingClientRect();
    const alignRight = state.x > bounds.width * 0.62;
    const placeAbove = state.y > bounds.height * 0.45;

    tooltip.hidden = false;
    tooltip.setAttribute("data-align", alignRight ? "right" : "left");
    tooltip.setAttribute("data-placement", placeAbove ? "top" : "bottom");

    if (alignRight) {
      tooltip.style.left = "auto";
      tooltip.style.right =
        Math.max(8, Math.round(bounds.width - state.x + 14)) + "px";
    } else {
      tooltip.style.right = "auto";
      tooltip.style.left = Math.max(8, Math.round(state.x + 14)) + "px";
    }

    tooltip.style.top =
      (placeAbove
        ? Math.max(52, Math.round(state.y - 10))
        : Math.max(8, Math.round(state.y + 18))) + "px";
  },

  hideChartTooltip: function () {
    if (!this.chartTooltipNode) return;

    this.chartTooltipNode.hidden = true;
    this.chartTooltipNode.replaceChildren();
  },

  setWindow: function (minutes) {
    this.windowMinutes = minutes;
    this.maxPoints = (minutes * 60) / POLL_INTERVAL;

    this.history.forEach(
      L.bind(function (history, sensorId) {
        if (history.length > this.maxPoints)
          this.history.set(sensorId, history.slice(-this.maxPoints));
      }, this),
    );

    this.buildWindowSelector();
    this.refreshFocusedView();
  },

  buildWindowSelector: function () {
    if (!this.windowSelectorNode) return;

    this.windowSelectorNode.replaceChildren();

    WINDOW_OPTIONS.forEach(
      L.bind(function (option) {
        const button = E(
          "button",
          {
            class: "proton-temp-window-btn",
            type: "button",
            "data-active":
              option.minutes === this.windowMinutes ? "true" : "false",
            click: L.bind(
              function (mins) {
                this.setWindow(mins);
              },
              this,
              option.minutes,
            ),
          },
          [formatMinutesShort(option.minutes)],
        );

        this.windowSelectorNode.appendChild(button);
      }, this),
    );
  },

  buildLayout: function () {
    this.windowSelectorNode = E("div", {
      class: "proton-temp-window-selector",
    });
    this.buildWindowSelector();

    this.selectorNode = E("div", { class: "proton-temp-selector" });
    this.chartTitleNode = E("h3", { class: "proton-temp-chart-title" }, [
      t("Temperature history"),
    ]);
    this.chartToolbarNode = E("div", { class: "proton-temp-chart-toolbar" }, [
      E("span", { class: "proton-temp-chart-toolbar-label" }, [t("Window")]),
      this.windowSelectorNode,
    ]);
    this.chartSummaryNode = E("div", { class: "proton-temp-chart-summary" });
    this.svgNode = createSvgElement("svg", {
      class: "proton-temp-chart-svg",
      viewBox: "0 0 %d %d".format(GRAPH_WIDTH, GRAPH_HEIGHT),
      preserveAspectRatio: "none",
      role: "img",
      "aria-label": t("Temperature history chart"),
    });
    this.emptyNode = E("div", { class: "proton-temp-chart-empty" }, [
      t("No temperature sensors found"),
    ]);
    this.chartTooltipNode = E("div", {
      class: "proton-temp-chart-tooltip",
      hidden: "hidden",
    });
    this.chartWrapNode = E("div", { class: "proton-temp-chart-wrap" }, [
      this.svgNode,
      this.emptyNode,
      this.chartTooltipNode,
    ]);
    this.statusNode = E("div", { class: "proton-temp-realtime-status" });
    this.tableBody = E("tbody");

    return E("div", { class: "cbi-map proton-temp-realtime-page" }, [
      E("h2", {}, [t("Temperature Realtime")]),
      E("div", { class: "cbi-map-descr" }, [
        t(
          "Select a sensor to view a clean temperature history. The chart keeps a rolling local buffer, while peak values come from the current rpcd session on the router.",
        ),
      ]),
      E("div", { class: "cbi-section proton-temp-chart-section" }, [
        E("div", { class: "proton-temp-chart-head" }, [
          E("div", { class: "proton-temp-chart-title-wrap" }, [
            this.chartTitleNode,
          ]),
          this.chartToolbarNode,
        ]),
        this.selectorNode,
        this.chartSummaryNode,
        this.chartWrapNode,
        this.statusNode,
      ]),
      E("div", { class: "cbi-section proton-temp-table-section" }, [
        E("h3", { class: "proton-temp-table-title" }, [t("Sensor statistics")]),
        E("div", { class: "table proton-temp-table" }, [
          E("table", {}, [
            E("thead", {}, [
              E("tr", { class: "tr table-titles" }, [
                E("th", { class: "th" }, [t("Sensor")]),
                E("th", { class: "th" }, [t("Current")]),
                E("th", { class: "th" }, [t("Average")]),
                E("th", { class: "th" }, [t("Minimum")]),
                E("th", { class: "th" }, [t("Peak")]),
                E("th", { class: "th" }, [t("Status")]),
              ]),
            ]),
            this.tableBody,
          ]),
        ]),
      ]),
    ]);
  },

  setStatusMessage: function (message, level) {
    if (!this.statusNode) return;

    this.statusNode.textContent = message || "";
    this.statusNode.setAttribute("data-state", level || "neutral");
    this.statusNode.style.display = message ? "" : "none";
  },

  updateHistory: function (sensors) {
    const activeIds = new Set();

    sensors.forEach(
      L.bind(function (sensor) {
        const history = this.history.get(sensor.id) || [];
        history.push(sensor.temp);
        while (history.length > this.maxPoints) history.shift();

        this.history.set(sensor.id, history);
        activeIds.add(sensor.id);
        this.getColor(sensor.id);
      }, this),
    );

    Array.from(this.history.keys()).forEach(
      L.bind(function (sensorId) {
        if (!activeIds.has(sensorId)) this.history.delete(sensorId);
      }, this),
    );
  },

  ensureSelectedSensor: function (sensors) {
    if (!sensors.length) {
      this.selectedSensorId = null;
      return null;
    }

    if (this.selectedSensorId == null) return null;

    const existing = sensors.find(
      L.bind(function (sensor) {
        return sensor.id === this.selectedSensorId;
      }, this),
    );

    if (existing) return existing;

    this.selectedSensorId = null;
    return null;
  },

  buildSelector: function (sensors) {
    this.selectorNode.replaceChildren();

    this.selectorNode.appendChild(
      E(
        "button",
        {
          class: "proton-temp-selector-chip proton-temp-selector-chip-all",
          type: "button",
          "data-active": this.selectedSensorId == null ? "true" : "false",
          style: "--sensor-color:var(--proton-muted)",
          click: L.bind(function () {
            this.selectedSensorId = null;
            this.refreshFocusedView();
          }, this),
        },
        [
          E("span", { class: "proton-temp-selector-label" }, [
            t("All sensors"),
          ]),
        ],
      ),
    );

    sensors.forEach(
      L.bind(function (sensor) {
        const button = E(
          "button",
          {
            class: "proton-temp-selector-chip",
            type: "button",
            "data-active":
              sensor.id === this.selectedSensorId ? "true" : "false",
            "data-level": sensor.level,
            title:
              sensor.label +
              ": " +
              formatTemp(sensor.temp, 1) +
              " · " +
              getTempStatus(sensor.level),
            style: "--sensor-color:%s".format(this.getColor(sensor.id)),
            click: L.bind(
              function (sensorId) {
                this.selectedSensorId = sensorId;
                this.refreshFocusedView();
              },
              this,
              sensor.id,
            ),
          },
          [
            E("span", { class: "proton-temp-selector-label" }, [sensor.label]),
            E("span", { class: "proton-temp-selector-meta" }, [
              formatTemp(sensor.temp, 1),
            ]),
          ],
        );

        this.selectorNode.appendChild(button);
      }, this),
    );
  },

  buildSummaryCard: function (label, value, extraClass) {
    return E(
      "div",
      {
        class:
          "proton-temp-summary-card" + (extraClass ? " " + extraClass : ""),
      },
      [
        E("span", { class: "proton-temp-summary-label" }, [label]),
        E("strong", { class: "proton-temp-summary-value" }, [value]),
      ],
    );
  },

  buildChartSummary: function (sensor) {
    this.chartSummaryNode.replaceChildren();

    if (!sensor) {
      if (!this.currentSensors.length) return;

      const hottestSensor = this.currentSensors.slice().sort(function (a, b) {
        return b.temp - a.temp;
      })[0];
      const currentValues = this.currentSensors.map(function (item) {
        return item.temp;
      });
      const warmCount = this.currentSensors.filter(function (item) {
        return item.level !== "normal";
      }).length;

      this.chartSummaryNode.appendChild(
        this.buildSummaryCard(
          t("Sensors online"),
          String(this.currentSensors.length),
        ),
      );
      this.chartSummaryNode.appendChild(
        this.buildSummaryCard(
          t("Current maximum"),
          formatTemp(hottestSensor.temp, 1),
        ),
      );
      this.chartSummaryNode.appendChild(
        this.buildSummaryCard(
          t("Average now"),
          formatTemp(average(currentValues), 1),
        ),
      );
      this.chartSummaryNode.appendChild(
        this.buildSummaryCard(t("Sensors above warm"), String(warmCount)),
      );
      return;
    }

    const history = this.history.get(sensor.id) || [];
    const avg = average(history);
    const min = history.length ? Math.min.apply(null, history) : sensor.temp;
    const peak = Math.max(
      sensor.peak || sensor.temp,
      history.length ? Math.max.apply(null, history) : sensor.temp,
    );

    this.chartSummaryNode.appendChild(
      this.buildSummaryCard(t("Current reading"), formatTemp(sensor.temp, 1)),
    );
    this.chartSummaryNode.appendChild(
      this.buildSummaryCard(t("Window average"), formatTemp(avg, 1)),
    );
    this.chartSummaryNode.appendChild(
      this.buildSummaryCard(t("Window minimum"), formatTemp(min, 1)),
    );
    this.chartSummaryNode.appendChild(
      this.buildSummaryCard(t("Router peak"), formatTemp(peak, 1)),
    );
    this.chartSummaryNode.appendChild(
      this.buildSummaryCard(
        t("Status"),
        getTempStatus(sensor.level),
        "is-status",
      ),
    );
  },

  createAxisLabel: function (text, x, y, anchor, cssClass) {
    return createSvgElement(
      "text",
      {
        x: String(x),
        y: String(y),
        class: cssClass || "proton-temp-axis-label",
        "text-anchor": anchor || "end",
      },
      text,
    );
  },

  renderChart: function (sensor) {
    const svg = this.svgNode;
    svg.replaceChildren();
    this.hideChartTooltip();

    if (!this.currentSensors.length) {
      this.emptyNode.style.display = "";
      return;
    }

    this.emptyNode.style.display = "none";

    const sensors = sensor
      ? [sensor]
      : this.currentSensors.filter(
          L.bind(function (item) {
            return (this.history.get(item.id) || []).length;
          }, this),
        );

    if (!sensors.length) {
      this.emptyNode.style.display = "";
      return;
    }

    const allValues = [];
    sensors.forEach(
      L.bind(function (item) {
        const history = this.history.get(item.id) || [];
        history.forEach(function (value) {
          allValues.push(value);
        });
        allValues.push(item.peak || item.temp);
      }, this),
    );

    const maxTemp = Math.max(
      90,
      THRESHOLDS.critical,
      Math.max.apply(null, allValues) + 5,
    );
    const minTemp = Math.max(
      0,
      Math.min(35, Math.min.apply(null, allValues) - 5),
    );
    const roundedMax = Math.ceil(maxTemp / 5) * 5;
    const roundedMin = Math.floor(minTemp / 5) * 5;
    const plotWidth = GRAPH_WIDTH - GRAPH_PADDING.left - GRAPH_PADDING.right;
    const plotHeight = GRAPH_HEIGHT - GRAPH_PADDING.top - GRAPH_PADDING.bottom;

    var maxPts = this.maxPoints;
    const mapX = function (index, count) {
      if (maxPts <= 1) return GRAPH_PADDING.left + plotWidth;

      var offset = maxPts - count;
      return GRAPH_PADDING.left + ((offset + index) / (maxPts - 1)) * plotWidth;
    };

    const mapY = function (value) {
      const ratio = (value - roundedMin) / Math.max(1, roundedMax - roundedMin);
      return GRAPH_PADDING.top + (1 - clamp(ratio, 0, 1)) * plotHeight;
    };

    svg.appendChild(
      createSvgElement("rect", {
        x: String(GRAPH_PADDING.left),
        y: String(GRAPH_PADDING.top),
        width: String(plotWidth),
        height: String(plotHeight),
        class: "proton-temp-chart-bg",
      }),
    );

    for (let step = 0; step <= 5; step++) {
      const value = roundedMin + ((roundedMax - roundedMin) / 5) * step;
      const y = mapY(value);
      svg.appendChild(
        createSvgElement("line", {
          x1: String(GRAPH_PADDING.left),
          y1: String(y),
          x2: String(GRAPH_WIDTH - GRAPH_PADDING.right),
          y2: String(y),
          class: "proton-temp-grid-line",
        }),
      );
      svg.appendChild(
        this.createAxisLabel(
          "%d°C".format(Math.round(value)),
          GRAPH_PADDING.left - 10,
          y + 4,
        ),
      );
    }

    [
      { value: THRESHOLDS.warm, cssClass: "warm" },
      { value: THRESHOLDS.hot, cssClass: "hot" },
      { value: THRESHOLDS.critical, cssClass: "critical" },
    ].forEach(
      L.bind(function (line) {
        if (line.value <= roundedMin || line.value >= roundedMax) return;

        const y = mapY(line.value);
        svg.appendChild(
          createSvgElement("line", {
            x1: String(GRAPH_PADDING.left),
            y1: String(y),
            x2: String(GRAPH_WIDTH - GRAPH_PADDING.right),
            y2: String(y),
            class:
              "proton-temp-threshold proton-temp-threshold-" + line.cssClass,
          }),
        );
        svg.appendChild(
          this.createAxisLabel(
            formatTemp(line.value),
            GRAPH_WIDTH - GRAPH_PADDING.right - 6,
            y - 6,
            "end",
            "proton-temp-threshold-label",
          ),
        );
      }, this),
    );

    sensors.forEach(
      L.bind(function (item) {
        const history = this.history.get(item.id) || [];
        const color = this.getColor(item.id);
        const linePattern = this.getLinePattern(item.id);

        if (!history.length) return;

        if (sensor) {
          const avg = average(history);
          const averageY = mapY(avg);
          svg.appendChild(
            createSvgElement("line", {
              x1: String(GRAPH_PADDING.left),
              y1: String(averageY),
              x2: String(GRAPH_WIDTH - GRAPH_PADDING.right),
              y2: String(averageY),
              class: "proton-temp-average-line",
            }),
          );
        }

        const points = history
          .map(function (value, index) {
            return (
              String(mapX(index, history.length)) + "," + String(mapY(value))
            );
          })
          .join(" ");

        if (sensor) {
          const areaPoints =
            points +
            " " +
            String(mapX(history.length - 1, history.length)) +
            "," +
            String(GRAPH_HEIGHT - GRAPH_PADDING.bottom) +
            " " +
            String(mapX(0, history.length)) +
            "," +
            String(GRAPH_HEIGHT - GRAPH_PADDING.bottom);
          svg.appendChild(
            createSvgElement("polygon", {
              points: areaPoints,
              class: "proton-temp-area",
              style: "fill:%s".format(color),
            }),
          );
        }

        svg.appendChild(
          createSvgElement("polyline", {
            points: points,
            class: "proton-temp-line",
            style: "stroke:%s;stroke-dasharray:%s".format(
              color,
              linePattern || "none",
            ),
          }),
        );

        const lastX = mapX(history.length - 1, history.length);
        const lastY = mapY(history[history.length - 1]);
        svg.appendChild(
          createSvgElement("circle", {
            cx: String(lastX),
            cy: String(lastY),
            r: "4",
            class: "proton-temp-point",
            style: "fill:%s".format(color),
          }),
        );

        var labelText = sensor
          ? formatTemp(history[history.length - 1], 1)
          : item.label + " " + formatTemp(history[history.length - 1], 1);
        var labelAnchor =
          lastX > GRAPH_WIDTH - GRAPH_PADDING.right - 60 ? "end" : "start";
        var labelOffsetX = labelAnchor === "end" ? lastX - 10 : lastX + 10;
        svg.appendChild(
          this.createAxisLabel(
            labelText,
            labelOffsetX,
            lastY - 8,
            labelAnchor,
            "proton-temp-series-label",
          ),
        );
      }, this),
    );

    const hoverGuide = createSvgElement("line", {
      x1: String(GRAPH_PADDING.left),
      y1: String(GRAPH_PADDING.top),
      x2: String(GRAPH_PADDING.left),
      y2: String(GRAPH_HEIGHT - GRAPH_PADDING.bottom),
      class: "proton-temp-hover-guide",
    });
    const hoverPoints = createSvgElement("g", {
      class: "proton-temp-hover-points",
    });
    const hoverLayer = createSvgElement("rect", {
      x: String(GRAPH_PADDING.left),
      y: String(GRAPH_PADDING.top),
      width: String(plotWidth),
      height: String(plotHeight),
      class: "proton-temp-hover-layer",
    });

    hoverGuide.style.display = "none";

    const clearHover = L.bind(function () {
      hoverGuide.style.display = "none";
      hoverPoints.replaceChildren();
      this.hideChartTooltip();
    }, this);

    const updateHover = L.bind(function (ev) {
      const rect = svg.getBoundingClientRect();
      const scaleX = GRAPH_WIDTH / Math.max(1, rect.width);
      const scaleY = GRAPH_HEIGHT / Math.max(1, rect.height);
      const pointerX = clamp(
        (ev.clientX - rect.left) * scaleX,
        GRAPH_PADDING.left,
        GRAPH_WIDTH - GRAPH_PADDING.right,
      );
      const pointerY = clamp(
        (ev.clientY - rect.top) * scaleY,
        GRAPH_PADDING.top,
        GRAPH_HEIGHT - GRAPH_PADDING.bottom,
      );
      const slot = Math.round(
        ((pointerX - GRAPH_PADDING.left) / Math.max(1, plotWidth)) *
          Math.max(1, maxPts - 1),
      );
      const guideX =
        GRAPH_PADDING.left + (slot / Math.max(1, maxPts - 1)) * plotWidth;
      const rows = [];
      const dots = [];
      const offsetSeconds = (maxPts - 1 - slot) * POLL_INTERVAL;
      const timeLabel = formatSampleMoment(this.lastUpdate, offsetSeconds);

      sensors.forEach(
        L.bind(function (item) {
          const history = this.history.get(item.id) || [];
          const offset = maxPts - history.length;
          const dataIndex = slot - offset;

          if (dataIndex < 0 || dataIndex >= history.length) return;

          const sampleValue = history[dataIndex];
          dots.push({
            color: this.getColor(item.id),
            y: mapY(sampleValue),
          });

          if (sensor) {
            rows.push({
              label: t("Point value"),
              value: formatTemp(sampleValue, 1),
            });
            rows.push({
              label: t("Status"),
              value: getTempStatus(getTempLevel(sampleValue)),
            });

            if (dataIndex > 0)
              rows.push({
                label: t("Change vs previous"),
                value: formatTempDelta(sampleValue - history[dataIndex - 1]),
              });
          } else {
            rows.push({
              label: item.label,
              value: formatTemp(sampleValue, 1),
              color: this.getColor(item.id),
            });
          }
        }, this),
      );

      if (!rows.length) {
        clearHover();
        return;
      }

      hoverGuide.setAttribute("x1", String(guideX));
      hoverGuide.setAttribute("x2", String(guideX));
      hoverGuide.style.display = "";

      hoverPoints.replaceChildren();
      dots.forEach(function (dot) {
        hoverPoints.appendChild(
          createSvgElement("circle", {
            cx: String(guideX),
            cy: String(dot.y),
            r: "4.5",
            class: "proton-temp-hover-point",
            style: "fill:%s".format(dot.color),
          }),
        );
      });

      this.showChartTooltip({
        title: sensor ? sensor.label : t("Temperature history"),
        time: timeLabel,
        rows: rows,
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
      });
    }, this);

    hoverLayer.addEventListener("pointermove", updateHover);
    hoverLayer.addEventListener("pointerdown", updateHover);
    hoverLayer.addEventListener("pointerleave", clearHover);
    hoverLayer.addEventListener("pointercancel", clearHover);

    svg.appendChild(hoverGuide);
    svg.appendChild(hoverPoints);
    svg.appendChild(hoverLayer);

    svg.appendChild(
      this.createAxisLabel(
        "-" + formatMinutesShort(this.windowMinutes),
        GRAPH_PADDING.left,
        GRAPH_HEIGHT - 10,
        "start",
      ),
    );
    svg.appendChild(
      this.createAxisLabel(
        "-" + formatMinutesShort(this.windowMinutes / 2),
        GRAPH_WIDTH / 2,
        GRAPH_HEIGHT - 10,
        "middle",
      ),
    );
    svg.appendChild(
      this.createAxisLabel(
        t("Now"),
        GRAPH_WIDTH - GRAPH_PADDING.right,
        GRAPH_HEIGHT - 10,
        "end",
      ),
    );
  },

  renderTable: function (sensors) {
    this.tableBody.replaceChildren();

    if (!sensors.length) {
      this.tableBody.appendChild(
        E("tr", { class: "tr" }, [
          E(
            "td",
            {
              class: "td proton-temp-table-empty",
              colspan: "6",
            },
            [t("No temperature sensors found")],
          ),
        ]),
      );
      return;
    }

    sensors.forEach(
      L.bind(function (sensor) {
        const history = this.history.get(sensor.id) || [];
        const avg = average(history);
        const min = history.length
          ? Math.min.apply(null, history)
          : sensor.temp;
        const peak = Math.max(
          sensor.peak || sensor.temp,
          history.length ? Math.max.apply(null, history) : sensor.temp,
        );
        const row = E("tr", { class: "tr" }, [
          E("td", { class: "td proton-temp-sensor-cell" }, [
            E(
              "span",
              {
                class: "proton-temp-sensor-chip",
                style: "--sensor-color:%s".format(this.getColor(sensor.id)),
              },
              [sensor.label],
            ),
            E(
              "div",
              {
                class: "proton-temp-sensor-path",
                title: sensor.path || sensor.name,
              },
              [sensor.path || sensor.name],
            ),
          ]),
          E(
            "td",
            {
              class: "td proton-temp-metric-value",
              "data-label": t("Current"),
            },
            [formatTemp(sensor.temp, 1)],
          ),
          E(
            "td",
            {
              class: "td proton-temp-metric-value",
              "data-label": t("Average"),
            },
            [formatTemp(avg, 1)],
          ),
          E(
            "td",
            {
              class: "td proton-temp-metric-value",
              "data-label": t("Minimum"),
            },
            [formatTemp(min, 1)],
          ),
          E(
            "td",
            { class: "td proton-temp-metric-value", "data-label": t("Peak") },
            [formatTemp(peak, 1)],
          ),
          E(
            "td",
            { class: "td proton-temp-status-cell", "data-label": t("Status") },
            [
              E(
                "span",
                {
                  class: "proton-temp-state-badge",
                  "data-level": sensor.level,
                },
                [getTempStatus(sensor.level)],
              ),
            ],
          ),
        ]);

        this.tableBody.appendChild(row);
      }, this),
    );
  },

  refreshFocusedView: function () {
    const selectedSensor = this.ensureSelectedSensor(this.currentSensors);
    this.buildSelector(this.currentSensors);
    this.buildChartSummary(selectedSensor);

    if (selectedSensor) {
      this.chartTitleNode.textContent =
        t("Temperature history") + " · " + selectedSensor.label;
    } else {
      this.chartTitleNode.textContent = t("Temperature history");
    }

    this.renderChart(selectedSensor);
    this.renderTable(this.currentSensors);
  },

  applySensors: function (rawSensors) {
    const sensors = normalizeSensors(rawSensors);
    this.currentSensors = sensors;
    this.updateHistory(sensors);
    this.refreshFocusedView();

    this.lastUpdate = new Date();
    this.setStatusMessage(
      sensors.length ? "" : t("No temperature sensors found"),
      sensors.length ? "neutral" : "warning",
    );
  },

  pollSensors: function () {
    return L.resolveDefault(callGetSensors(), null).then(
      L.bind(function (rawSensors) {
        if (rawSensors == null) {
          this.errorState = true;
          this.setStatusMessage(
            t(
              "RPC is temporarily unavailable. Showing the last successful sample.",
            ),
            "warning",
          );
          return;
        }

        this.errorState = false;
        this.applySensors(rawSensors);
      }, this),
    );
  },

  render: function (rawSensors) {
    this.initState();
    const node = this.buildLayout();

    if (rawSensors == null)
      this.setStatusMessage(
        t("RPC is temporarily unavailable. Waiting for temperature data..."),
        "warning",
      );
    else this.applySensors(rawSensors);

    poll.add(L.bind(this.pollSensors, this), POLL_INTERVAL);

    return node;
  },

  handleSaveApply: null,
  handleSave: null,
  handleReset: null,
});
