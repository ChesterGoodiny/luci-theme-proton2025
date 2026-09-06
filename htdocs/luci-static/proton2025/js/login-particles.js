(function () {
  "use strict";

  var STORAGE_KEY = "proton-login-animation";

  var REDUCED_MOTION = !!(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  var _colorCache = new Map();

  function parseColorToRgb(color) {
    var cached = _colorCache.get(color);
    if (cached) return cached;

    var tmp = document.createElement("div");
    tmp.style.color = color;
    document.body.appendChild(tmp);
    var computed = getComputedStyle(tmp).color;
    document.body.removeChild(tmp);

    var match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

    var rgb = match
      ? {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
        }
      : { r: 94, g: 158, b: 255 };

    _colorCache.set(color, rgb);
    return rgb;
  }

  function getCssVar(name, fallback) {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback
    );
  }

  function getThemeColors() {
    var accent =
      getCssVar("--proton-accent", "") ||
      getCssVar("--primary-color-high", "") ||
      "#5e9eff";

    var hover =
      getCssVar("--proton-accent-hover", "") ||
      getCssVar("--primary-color-medium", "") ||
      accent;

    return {
      accent: parseColorToRgb(accent),
      hover: parseColorToRgb(hover),
    };
  }

  function rgba(c, a) {
    if (document.documentElement.getAttribute("data-theme") === "light") {
      a = Math.min(1, a * 2.25);
    }
    return (
      "rgba(" +
      Math.round(c.r) +
      "," +
      Math.round(c.g) +
      "," +
      Math.round(c.b) +
      "," +
      a +
      ")"
    );
  }

  function lighten(c, k) {
    return {
      r: c.r + (255 - c.r) * k,
      g: c.g + (255 - c.g) * k,
      b: c.b + (255 - c.b) * k,
    };
  }

  function darken(c, k) {
    return { r: c.r * (1 - k), g: c.g * (1 - k), b: c.b * (1 - k) };
  }
  function mix(a, b, k) {
    return {
      r: a.r + (b.r - a.r) * k,
      g: a.g + (b.g - a.g) * k,
      b: a.b + (b.b - a.b) * k,
    };
  }
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getMode() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "particles";
    } catch (e) {
      return "particles";
    }
  }

  function init() {
    var mode = getMode();

    if (mode === "off") {
      return;
    }

    if (document.getElementById("particles-js")) {
      return;
    }

    var canvas = document.createElement("canvas");
    canvas.id = "particles-js";
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext("2d");

    var w = 0;
    var h = 0;
    var dpr = 1;
    var time = 0;

    var rafId = 0;
    var running = false;
    var lastFrame = 0;
    var FRAME_MS = 1000 / 30;
    var needThemeRefresh = false;

    var cores = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    var particleScale = cores <= 2 || mem <= 2 ? 0.5 : cores <= 4 ? 0.75 : 1;

    var lastMode = mode;
    var theme = getThemeColors();

    var mouse = { x: null, y: null };

    var points = [];
    var pulses = [];
    var streams = [];
    var circuitNodes = [];
    var hexPhase = 0;

    function resize() {
      var doc = document.documentElement;
      var vv = window.visualViewport;

      w = Math.max(
        window.innerWidth || 0,
        doc ? doc.clientWidth || 0 : 0,
        vv ? Math.floor(vv.width) || 0 : 0,
      );

      h = Math.max(
        window.innerHeight || 0,
        doc ? doc.clientHeight || 0 : 0,
        vv ? Math.floor(vv.height) || 0 : 0,
      );
      dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      theme = getThemeColors();
      mode = getMode();
      lastMode = mode;

      initEffect();
    }

    function baseBackground(strength) {
      strength = strength == null ? 1 : strength;

      var g = ctx.createLinearGradient(0, 0, w, h);
      if (document.documentElement.getAttribute("data-theme") === "light") {
        g.addColorStop(0, "#f4f7fb");
        g.addColorStop(0.45, "#e9f0f9");
        g.addColorStop(1, "#dfe9f6");
      } else {
        g.addColorStop(0, "#07111f");
        g.addColorStop(0.45, "#10283a");
        g.addColorStop(1, "#050914");
      }

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      var glow = ctx.createRadialGradient(
        w * 0.5,
        h * 0.42,
        0,
        w * 0.5,
        h * 0.42,
        Math.max(w, h) * 0.72,
      );

      glow.addColorStop(0, rgba(theme.accent, 0.2 * strength));
      glow.addColorStop(0.45, rgba(theme.accent, 0.07 * strength));
      glow.addColorStop(1, rgba(theme.accent, 0));

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }

    function createPoints(countMul, minSpeed, maxSpeed, minR, maxR) {
      var n = Math.max(
        Math.round(42 * particleScale),
        Math.round(
          Math.min(145, Math.floor((w * h) / countMul)) * particleScale,
        ),
      );

      points = [];

      for (var i = 0; i < n; i++) {
        var a = rand(0, Math.PI * 2);
        var s = rand(minSpeed, maxSpeed);

        points.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          r: rand(minR, maxR),
          seed: rand(0, 9999),
          bright: Math.random() > 0.88,
          trail: [],
        });
      }
    }

    function createFlowPoints() {
      var n = Math.max(
        Math.round(90 * particleScale),
        Math.round(Math.min(190, Math.floor((w * h) / 9800)) * particleScale),
      );

      points = [];

      for (var i = 0; i < n; i++) {
        points.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(0.8, 1.8),
          seed: rand(0, 9999),
          trail: [],
        });
      }
    }

    function createDataStreams() {
      var n = Math.max(
        Math.round(18 * particleScale),
        Math.round(Math.floor(w / 42) * particleScale),
      );

      streams = [];

      for (var i = 0; i < n; i++) {
        streams.push({
          x: i * 42 + rand(-12, 12),
          y: rand(-h, h),
          speed: rand(0.75, 1.9),
          len: Math.floor(rand(4, 11)),
          gap: rand(14, 25),
          phase: rand(0, 999),
        });
      }
    }

    function createCircuit() {
      circuitNodes = [];

      var cols = Math.ceil(w / 105);
      var rows = Math.ceil(h / 86);

      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          if (Math.random() > 0.34) {
            circuitNodes.push({
              x: x * 105 + rand(18, 86),
              y: y * 86 + rand(18, 68),
              pulse: rand(0, Math.PI * 2),
            });
          }
        }
      }
    }

    function initEffect() {
      pulses = [];

      if (mode === "particles") {
        createPoints(15500, 0.16, 0.48, 1.15, 2.2);
      } else if (mode === "constellation") {
        createPoints(14500, 0.045, 0.18, 1.0, 2.7);
      } else if (mode === "plexus") {
        createPoints(9800, 0.08, 0.3, 1.0, 2.0);
      } else if (mode === "breathing") {
        createPoints(15500, 0.08, 0.28, 1.1, 2.1);
      } else if (mode === "gravity") {
        createPoints(14500, 0.09, 0.3, 1.1, 2.2);
      } else if (mode === "lowpoly") {
        createPoints(12200, 0.045, 0.18, 1.0, 1.8);
      } else if (mode === "dataflow") {
        createDataStreams();
      } else if (mode === "flowfield") {
        createFlowPoints();
      } else if (mode === "circuit") {
        createCircuit();
      } else if (mode === "packetpulses") {
        createPoints(14200, 0.1, 0.34, 1.1, 2.2);
      } else if (mode === "hex") {
        createPoints(26000, 0.08, 0.22, 0.9, 1.6);
      } else if (mode === "underwater") {
        createUnderwaterPoints();
      } else {
        createPoints(15500, 0.16, 0.48, 1.15, 2.2);
      }
    }

    function updateWrap() {
      for (var i = 0; i < points.length; i++) {
        var p = points[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30;
        if (p.y > h + 30) p.y = -30;
      }
    }

    function distance(a, b) {
      var dx = a.x - b.x;
      var dy = a.y - b.y;

      return Math.sqrt(dx * dx + dy * dy);
    }

    function getEdges(maxDist) {
      var edges = [];

      for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
          var d = distance(points[i], points[j]);

          if (d < maxDist) {
            edges.push({
              a: points[i],
              b: points[j],
              d: d,
            });
          }
        }
      }

      return edges;
    }

    function drawDots(dotOpacity, boost) {
      dotOpacity = dotOpacity == null ? 0.85 : dotOpacity;
      boost = boost || 0;

      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var color = p.bright
          ? lighten(theme.hover, 0.48)
          : lighten(theme.hover, 0.24);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + boost + (p.bright ? 0.7 : 0), 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, p.bright ? 0.98 : dotOpacity);
        ctx.fill();

        if (p.bright) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2);
          ctx.fillStyle = rgba(theme.accent, 0.08);
          ctx.fill();
        }
      }
    }

    function drawNetwork(maxDist, lineOpacity, dotOpacity, mouseConnect) {
      updateWrap();

      var edges = getEdges(maxDist);

      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        var op = (1 - e.d / maxDist) * lineOpacity;

        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.strokeStyle = rgba(theme.accent, op);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (mouseConnect !== false && mouse.x !== null) {
        for (var m = 0; m < points.length; m++) {
          var p = points[m];
          var md = Math.sqrt(
            (p.x - mouse.x) * (p.x - mouse.x) +
              (p.y - mouse.y) * (p.y - mouse.y),
          );

          if (md < 180) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = rgba(theme.hover, (1 - md / 180) * 0.55);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      drawDots(dotOpacity, 0);

      return edges;
    }

    function drawParticles() {
      baseBackground(1);
      drawNetwork(135, 0.42, 0.85, true);
    }

    function drawConstellation() {
      baseBackground(0.94);
      updateWrap();

      var edges = getEdges(165);

      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];

        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.strokeStyle = rgba(theme.accent, (1 - e.d / 165) * 0.19);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (var s = 0; s < 7; s++) {
        var x = (Math.sin(time * 0.00016 + s * 2.2) * 0.5 + 0.5) * w;
        var y = (Math.cos(time * 0.00013 + s * 1.9) * 0.5 + 0.5) * h;

        var g = ctx.createRadialGradient(x, y, 0, x, y, 85);
        g.addColorStop(0, rgba(lighten(theme.hover, 0.55), 0.1));
        g.addColorStop(1, rgba(theme.accent, 0));

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      drawDots(0.76, 0.15);
    }

    function drawPlexus() {
      baseBackground(1.02);
      updateWrap();

      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var near = [];

        for (var j = 0; j < points.length; j++) {
          if (i === j) continue;

          var d = distance(p, points[j]);

          if (d < 118) {
            near.push({
              p: points[j],
              d: d,
            });
          }
        }

        near.sort(function (a, b) {
          return a.d - b.d;
        });

        if (near.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(near[0].p.x, near[0].p.y);
          ctx.lineTo(near[1].p.x, near[1].p.y);
          ctx.closePath();
          ctx.fillStyle = rgba(theme.accent, 0.018);
          ctx.fill();
        }
      }

      var edges = getEdges(152);

      for (var e = 0; e < edges.length; e++) {
        var edge = edges[e];

        ctx.beginPath();
        ctx.moveTo(edge.a.x, edge.a.y);
        ctx.lineTo(edge.b.x, edge.b.y);
        ctx.strokeStyle = rgba(theme.accent, (1 - edge.d / 152) * 0.31);
        ctx.stroke();
      }

      drawDots(0.82, 0.1);
    }

    function drawBreathing() {
      var breath = 0.86 + Math.sin(time * 0.00105) * 0.24;

      baseBackground(breath);
      drawNetwork(138, 0.34 * breath, 0.76, true);
    }

    function drawGravity() {
      baseBackground(1);

      for (var i = 0; i < points.length; i++) {
        var p = points[i];

        if (mouse.x !== null) {
          var dx = mouse.x - p.x;
          var dy = mouse.y - p.y;
          var d = Math.sqrt(dx * dx + dy * dy);

          if (d < 230) {
            var force = (1 - d / 230) * 0.045;

            p.vx += dx * force * 0.012;
            p.vy += dy * force * 0.012;
          }
        }

        p.vx *= 0.994;
        p.vy *= 0.994;

        var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        if (speed < 0.08) {
          p.vx += Math.sin(time * 0.0008 + p.seed) * 0.004;
          p.vy += Math.cos(time * 0.0007 + p.seed) * 0.004;
        }
      }

      drawNetwork(145, 0.34, 0.82, true);
    }

    function drawLowPoly() {
      baseBackground(0.96);
      updateWrap();

      for (var i = 0; i < points.length; i++) {
        var a = points[i];
        var near = [];

        for (var j = 0; j < points.length; j++) {
          if (i === j) continue;

          var d = distance(a, points[j]);

          if (d < 128) {
            near.push({
              p: points[j],
              d: d,
            });
          }
        }

        near.sort(function (x, y) {
          return x.d - y.d;
        });

        if (near.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(near[0].p.x, near[0].p.y);
          ctx.lineTo(near[1].p.x, near[1].p.y);
          ctx.closePath();
          ctx.fillStyle = rgba(theme.accent, 0.028);
          ctx.fill();

          ctx.strokeStyle = rgba(theme.accent, 0.085);
          ctx.stroke();
        }
      }

      drawDots(0.66, -0.1);
    }

    function drawDataFlow() {
      baseBackground(0.9);

      ctx.lineWidth = 1;

      for (var i = 0; i < streams.length; i++) {
        var s = streams[i];

        s.y += s.speed;

        if (s.y > h + 210) {
          s.y = rand(-300, -60);
          s.x = rand(0, w);
        }

        var tail = s.y - s.len * s.gap;
        var grad = ctx.createLinearGradient(s.x, tail, s.x, s.y);
        grad.addColorStop(0, rgba(theme.accent, 0));
        grad.addColorStop(1, rgba(theme.accent, 0.22));

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(s.x, tail);
        ctx.lineTo(s.x + Math.sin(time * 0.001 + s.phase) * 12, s.y);
        ctx.stroke();

        for (var j = 0; j < s.len; j++) {
          var y = s.y - j * s.gap;
          var op = Math.max(0, 0.56 - j * 0.055);
          var x = s.x + Math.sin((y + time * 0.02) * 0.02 + s.phase) * 10;

          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.6, 2.4 - j * 0.1), 0, Math.PI * 2);
          ctx.fillStyle = rgba(lighten(theme.hover, 0.34), op);
          ctx.fill();
        }
      }
    }

    function drawFlowField() {
      baseBackground(1.0);

      for (var i = 0; i < points.length; i++) {
        var p = points[i];

        if (!p.trail) {
          p.trail = [];
        }

        p.trail.push({ x: p.x, y: p.y });

        if (p.trail.length > 7) {
          p.trail.shift();
        }

        var angle =
          Math.sin(p.x * 0.004 + time * 0.00035) +
          Math.cos(p.y * 0.004 + time * 0.00028) +
          Math.sin((p.x + p.y) * 0.002 + p.seed);

        p.x += Math.cos(angle) * 0.48;
        p.y += Math.sin(angle) * 0.48;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();

        for (var k = 0; k < p.trail.length; k++) {
          if (k === 0) ctx.moveTo(p.trail[k].x, p.trail[k].y);
          else ctx.lineTo(p.trail[k].x, p.trail[k].y);
        }

        ctx.strokeStyle = rgba(theme.accent, 0.1);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lighten(theme.hover, 0.35), 0.7);
        ctx.fill();
      }
    }

    function drawCircuit() {
      baseBackground(0.72);

      ctx.lineWidth = 1;

      for (var i = 0; i < circuitNodes.length; i++) {
        var a = circuitNodes[i];
        var nearest = null;
        var nearestDistance = Infinity;

        for (var j = 0; j < circuitNodes.length; j++) {
          if (i === j) continue;

          var b = circuitNodes[j];
          var manhattan = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

          if (manhattan < nearestDistance && manhattan < 165) {
            nearestDistance = manhattan;
            nearest = b;
          }
        }

        if (nearest) {
          ctx.strokeStyle = rgba(theme.accent, 0.14);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(nearest.x, a.y);
          ctx.lineTo(nearest.x, nearest.y);
          ctx.stroke();

          var prog = (Math.sin(time * 0.001 + a.pulse) + 1) / 2;
          var px = a.x + (nearest.x - a.x) * prog;
          var py = a.y;

          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = rgba(theme.hover, 0.38);
          ctx.fill();
        }

        var op = 0.4 + 0.34 * Math.sin(time * 0.0012 + a.pulse);

        ctx.beginPath();
        ctx.arc(a.x, a.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(theme.accent, op);
        ctx.fill();
      }
    }

    function drawPacketPulses() {
      baseBackground(1);

      var edges = drawNetwork(142, 0.27, 0.78, true);

      if (Math.random() < 0.045 && edges.length > 0 && pulses.length < 26) {
        var e = edges[Math.floor(Math.random() * edges.length)];

        pulses.push({
          a: e.a,
          b: e.b,
          p: 0,
          speed: rand(0.01, 0.02),
        });
      }

      var active = [];

      for (var i = 0; i < pulses.length; i++) {
        var pulse = pulses[i];

        pulse.p += pulse.speed;

        if (pulse.p < 1.08) {
          active.push(pulse);
        }

        var x = pulse.a.x + (pulse.b.x - pulse.a.x) * pulse.p;
        var y = pulse.a.y + (pulse.b.y - pulse.a.y) * pulse.p;

        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lighten(theme.hover, 0.6), 0.88);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.fillStyle = rgba(theme.accent, 0.09);
        ctx.fill();
      }

      pulses = active;
    }

    function drawHexCell(cx, cy, r) {
      ctx.beginPath();

      for (var i = 0; i < 6; i++) {
        var a = Math.PI / 6 + (i * Math.PI) / 3;
        var x = cx + Math.cos(a) * r;
        var y = cy + Math.sin(a) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.stroke();
    }

    function drawHex() {
      baseBackground(0.78);

      hexPhase += 0.12;

      var size = 34;
      var dx = size * Math.sqrt(3);
      var dy = size * 1.5;

      ctx.strokeStyle = rgba(theme.accent, 0.12);
      ctx.lineWidth = 1;

      for (var y = -dy; y < h + dy; y += dy) {
        for (var x = -dx; x < w + dx; x += dx) {
          var ox = x + ((Math.round(y / dy) % 2) * dx) / 2;

          drawHexCell(
            ox + Math.sin(time * 0.0002) * 8,
            y + (hexPhase % dy),
            size,
          );
        }
      }

      drawNetwork(105, 0.1, 0.52, false);
    }

    function createUnderwaterPoints() {
      var n = Math.max(90, Math.min(220, Math.floor((w * h) / 6000)));
      points = [];
      for (var i = 0; i < n; i++) {
        var large = Math.random() < 0.12;
        points.push({
          x: rand(0, w),
          y: rand(0, h),
          r: large ? rand(2.45, 3.65) : rand(0.75, 2.35),
          speed: large ? rand(0.38, 1.1) : rand(0.45, 1.55),
          seed: rand(0, 9999),
          bright: Math.random() > (large ? 0.72 : 0.86),
          large: large,
        });
      }
      drawUnderwater._bgReady = false;
    }
    function drawUnderwater() {
      var accentKey = [
        Math.round(theme.accent.r),
        Math.round(theme.accent.g),
        Math.round(theme.accent.b),
      ].join("-");
      var bgW = Math.max(1, Math.floor(w));
      var bgH = Math.max(1, Math.floor(h));
      if (!drawUnderwater._bgCanvas) {
        drawUnderwater._bgCanvas = document.createElement("canvas");
        drawUnderwater._bgCtx = drawUnderwater._bgCanvas.getContext("2d");
      }
      var bgCanvas = drawUnderwater._bgCanvas;
      var bgCtx = drawUnderwater._bgCtx;
      if (
        !drawUnderwater._bgReady ||
        drawUnderwater._accentKey !== accentKey ||
        bgCanvas.width !== bgW ||
        bgCanvas.height !== bgH
      ) {
        bgCanvas.width = bgW;
        bgCanvas.height = bgH;
        var deepBase = { r: 1, g: 4, b: 8 };
        var waterTop = mix(
          darken(theme.accent, 0.28),
          { r: 18, g: 58, b: 82 },
          0.34,
        );
        var waterMid = mix(
          darken(theme.accent, 0.58),
          { r: 10, g: 39, b: 61 },
          0.46,
        );
        var waterDeep = mix(
          darken(theme.accent, 0.78),
          { r: 3, g: 17, b: 29 },
          0.58,
        );
        var bgGrad = bgCtx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, rgba(waterTop, 1));
        bgGrad.addColorStop(0.3, rgba(waterMid, 1));
        bgGrad.addColorStop(0.68, rgba(waterDeep, 1));
        bgGrad.addColorStop(1, rgba(deepBase, 1));
        bgCtx.fillStyle = bgGrad;
        bgCtx.fillRect(0, 0, w, h);
        var surfaceGlow = bgCtx.createRadialGradient(
          w * 0.5,
          -h * 0.12,
          0,
          w * 0.5,
          -h * 0.12,
          Math.max(w, h) * 0.96,
        );
        surfaceGlow.addColorStop(0, rgba(lighten(theme.accent, 0.85), 0.4));
        surfaceGlow.addColorStop(0.2, rgba(lighten(theme.accent, 0.58), 0.2));
        surfaceGlow.addColorStop(0.52, rgba(theme.accent, 0.055));
        surfaceGlow.addColorStop(1, rgba(theme.accent, 0));
        bgCtx.fillStyle = surfaceGlow;
        bgCtx.fillRect(0, 0, w, h);
        var rayScale = 0.2;
        var rw = Math.max(1, Math.floor(w * rayScale));
        var rh = Math.max(1, Math.floor(h * rayScale));
        if (!drawUnderwater._rayCanvas) {
          drawUnderwater._rayCanvas = document.createElement("canvas");
          drawUnderwater._rayCtx = drawUnderwater._rayCanvas.getContext("2d");
        }
        var rc = drawUnderwater._rayCanvas;
        var rctx = drawUnderwater._rayCtx;
        rc.width = rw;
        rc.height = rh;
        rctx.setTransform(1, 0, 0, 1, 0, 0);
        rctx.clearRect(0, 0, rw, rh);
        rctx.setTransform(rayScale, 0, 0, rayScale, 0, 0);
        rctx.globalCompositeOperation = "screen";
        rctx.lineCap = "round";
        rctx.lineJoin = "round";
        rctx.filter = "blur(9px)";
        var rayCount = Math.max(3, Math.min(5, Math.floor(w / 360)));
        for (var i = 0; i < rayCount; i++) {
          var seed = i * 6.731 + 1.37;
          var n1 = Math.sin(seed * 12.9898) * 43758.5453;
          var n2 = Math.sin(seed * 78.233) * 24634.6345;
          var n3 = Math.sin(seed * 37.719) * 10371.1931;
          var a = n1 - Math.floor(n1);
          var b = n2 - Math.floor(n2);
          var c = n3 - Math.floor(n3);
          var baseX = ((i + 0.54) / rayCount) * w + (a - 0.5) * 210;
          var reach = h * (0.72 + b * 0.24);
          var sway = Math.sin(seed) * (46 + b * 54);
          var tilt = Math.sin(seed * 0.73) * (95 + c * 145);
          var pulse = 0.92;
          var x0 = baseX + sway;
          var x1 = baseX + sway * 0.7 + tilt * 0.16;
          var x2 = baseX + tilt * 0.38;
          var x3 = baseX + tilt;
          var halo = rctx.createLinearGradient(0, 0, 0, reach);
          halo.addColorStop(
            0,
            rgba(lighten(theme.accent, 0.95), 0.108 * pulse),
          );
          halo.addColorStop(
            0.28,
            rgba(lighten(theme.accent, 0.7), 0.052 * pulse),
          );
          halo.addColorStop(
            0.68,
            rgba(lighten(theme.accent, 0.34), 0.018 * pulse),
          );
          halo.addColorStop(1, rgba(theme.accent, 0));
          rctx.strokeStyle = halo;
          rctx.lineWidth = 86 + b * 78;
          rctx.beginPath();
          rctx.moveTo(x0, -70);
          rctx.bezierCurveTo(x1, reach * 0.2, x2, reach * 0.5, x3, reach);
          rctx.stroke();
          var body = rctx.createLinearGradient(0, 0, 0, reach * 0.86);
          body.addColorStop(
            0,
            rgba(lighten(theme.accent, 0.98), 0.082 * pulse),
          );
          body.addColorStop(
            0.38,
            rgba(lighten(theme.accent, 0.7), 0.03 * pulse),
          );
          body.addColorStop(1, rgba(theme.accent, 0));
          rctx.strokeStyle = body;
          rctx.lineWidth = 30 + c * 28;
          rctx.beginPath();
          rctx.moveTo(x0 + (c - 0.5) * 26, -55);
          rctx.bezierCurveTo(
            x1 + 20,
            reach * 0.24,
            x2 - 34,
            reach * 0.54,
            x3 + 18,
            reach * 0.88,
          );
          rctx.stroke();
        }
        rctx.filter = "none";
        var haze = rctx.createLinearGradient(0, 0, 0, h * 0.42);
        haze.addColorStop(0, rgba(lighten(theme.accent, 0.82), 0.075));
        haze.addColorStop(0.34, rgba(lighten(theme.accent, 0.48), 0.03));
        haze.addColorStop(1, rgba(theme.accent, 0));
        rctx.fillStyle = haze;
        rctx.fillRect(0, 0, w, h * 0.42);
        bgCtx.save();
        bgCtx.globalCompositeOperation = "screen";
        bgCtx.imageSmoothingEnabled = true;
        bgCtx.drawImage(rc, 0, 0, w, h);
        bgCtx.restore();
        var vignette = bgCtx.createRadialGradient(
          w * 0.5,
          h * 0.45,
          Math.min(w, h) * 0.18,
          w * 0.5,
          h * 0.52,
          Math.max(w, h) * 0.86,
        );
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(0.74, "rgba(0,0,0,0.15)");
        vignette.addColorStop(1, "rgba(0,0,0,0.50)");
        bgCtx.fillStyle = vignette;
        bgCtx.fillRect(0, 0, w, h);
        drawUnderwater._accentKey = accentKey;
        drawUnderwater._bgReady = true;
      }
      ctx.drawImage(bgCanvas, 0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      var span = h + 48;
      for (var pIdx = 0; pIdx < points.length; pIdx++) {
        var p = points[pIdx];
        var driftY = (time * 0.03 * p.speed + p.seed * 0.37) % span;
        var y = ((p.y - driftY + span * 4) % span) - 24;
        var x =
          p.x +
          Math.sin(time * 0.00055 + p.seed) * 0.26 +
          Math.sin(y * 0.013 + p.seed) * 0.06;
        var depthFade = 0.22 + 0.58 * (1 - y / h);
        var twinkle = 0.7 + 0.3 * Math.sin(time * 0.001 + p.seed);
        var size = p.large ? p.r : p.bright ? p.r * 1.25 : p.r;
        var alpha = (p.large || p.bright ? 0.44 : 0.29) * depthFade * twinkle;
        ctx.fillStyle = rgba(
          lighten(theme.accent, p.large || p.bright ? 0.9 : 0.56),
          alpha,
        );
        ctx.fillRect(x, y, Math.max(1, size), Math.max(1, size));
        if (p.bright || p.large) {
          var s = Math.max(1, size * 0.72);
          ctx.fillStyle = rgba(
            lighten(theme.accent, 0.95),
            alpha * (p.large ? 0.34 : 0.42),
          );
          ctx.fillRect(x - s, y, s * 2.1, 1);
          ctx.fillRect(x, y - s, 1, s * 2.1);
        }
      }
      ctx.restore();
    }
    function draw(now) {
      if (mode === "off") {
        rafId = requestAnimationFrame(draw);
        return;
      }

      if (now - lastFrame < FRAME_MS) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      time = now || 0;

      if (needThemeRefresh) {
        theme = getThemeColors();
        needThemeRefresh = false;
      }

      ctx.clearRect(0, 0, w, h);

      if (mode === "particles") drawParticles();
      else if (mode === "constellation") drawConstellation();
      else if (mode === "plexus") drawPlexus();
      else if (mode === "breathing") drawBreathing();
      else if (mode === "gravity") drawGravity();
      else if (mode === "lowpoly") drawLowPoly();
      else if (mode === "dataflow") drawDataFlow();
      else if (mode === "flowfield") drawFlowField();
      else if (mode === "circuit") drawCircuit();
      else if (mode === "packetpulses") drawPacketPulses();
      else if (mode === "hex") drawHex();
      else if (mode === "underwater") drawUnderwater();
      else drawParticles();

      rafId = requestAnimationFrame(draw);
    }

    function start() {
      if (running) return;
      running = true;
      lastFrame = 0;
      rafId = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    function applyMode(next) {
      if (next === lastMode) return;
      mode = next;
      lastMode = next;

      if (mode === "off") {
        ctx.clearRect(0, 0, w, h);
        canvas.style.display = "none";
      } else {
        canvas.style.display = "block";
        needThemeRefresh = true;
        initEffect();
      }
    }

    window.addEventListener("resize", resize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resize);
    }

    var mouseRaf = 0;
    window.addEventListener(
      "mousemove",
      function (e) {
        if (mouseRaf) return;
        mouseRaf = requestAnimationFrame(function () {
          mouseRaf = 0;
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        });
      },
      { passive: true },
    );

    window.addEventListener("mouseout", function () {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener(
      "touchmove",
      function (e) {
        if (e.touches && e.touches.length > 0) {
          mouse.x = e.touches[0].clientX;
          mouse.y = e.touches[0].clientY;
        }
      },
      { passive: true },
    );

    window.addEventListener("touchend", function () {
      mouse.x = null;
      mouse.y = null;
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (mode !== "off") start();
    });

    window.addEventListener("storage", function (e) {
      if (!e || e.key === null || e.key === STORAGE_KEY) applyMode(getMode());
      needThemeRefresh = true;
    });
    window.addEventListener("proton-settings-synced", function () {
      needThemeRefresh = true;
    });
    window.addEventListener("proton-setting-changed", function () {
      needThemeRefresh = true;
    });
    window.addEventListener("proton-login-animation-change", function () {
      applyMode(getMode());
    });

    resize();

    if (REDUCED_MOTION) {
      needThemeRefresh = true;
      theme = getThemeColors();
      if (mode !== "off") {
        ctx.clearRect(0, 0, w, h);
        if (mode === "particles") drawParticles();
        else if (mode === "constellation") drawConstellation();
        else if (mode === "plexus") drawPlexus();
        else if (mode === "breathing") drawBreathing();
        else if (mode === "gravity") drawGravity();
        else if (mode === "lowpoly") drawLowPoly();
        else if (mode === "dataflow") drawDataFlow();
        else if (mode === "flowfield") drawFlowField();
        else if (mode === "circuit") drawCircuit();
        else if (mode === "packetpulses") drawPacketPulses();
        else if (mode === "hex") drawHex();
        else if (mode === "underwater") drawUnderwater();
        else drawParticles();
      }
      return;
    }

    needThemeRefresh = true;
    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
