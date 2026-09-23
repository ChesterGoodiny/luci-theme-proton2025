/*!
MIT License

Copyright (c) 2017 Pavel Dobryakov
Source: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  "use strict";

  // Loaded on demand by login-particles.js; never participates in authentication.
  if (!document.body || !document.body.classList.contains("login-page")) return;

  var STORAGE_KEY = "proton-login-animation";
  var motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var canvas = null;
  var renderer = null;
  var frameId = 0;
  var lastFrame = 0;
  var failed = false;
  var pageActive = true;
  function stored(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }

  function pause() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
    if (renderer) renderer.resetPointer();
  }

  function destroy() {
    pause();
    if (canvas) canvas.removeEventListener("webglcontextlost", contextLost);
    var previous = renderer;
    renderer = null;
    if (previous) previous.dispose();
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    canvas = null;
  }

  function fail(error) {
    failed = true;
    destroy();
    // The existing login background and form remain fully usable.
    if (window.console && console.warn)
      console.warn("Proton2025 Fluid: using the static background.", error);
  }

  function contextLost(event) {
    event.preventDefault();
    fail("WebGL context lost");
  }

  function frame(now) {
    frameId = 0;
    if (!renderer || document.hidden || !pageActive) return;

    var dt = lastFrame
      ? Math.min((now - lastFrame) / 1000, 1 / 60)
      : 1 / 60;

    lastFrame = now;

    try {
      renderer.tick(dt);
    } catch (error) {
      fail(error);
      return;
    }

    frameId = requestAnimationFrame(frame);
  }

  function sync() {
    var enabled = stored(STORAGE_KEY) === "fluid" &&
      stored("proton-animations") !== "false" &&
      !document.documentElement.classList.contains("proton-no-animations") &&
      !(motionQuery && motionQuery.matches) && pageActive;
    if (!enabled) {
      destroy();
      return;
    }
    if (document.hidden) {
      pause();
      return;
    }
    if (failed) return;
    if (!renderer) {
      try {
        canvas = document.createElement("canvas");
        canvas.id = "proton-login-fluid";
        canvas.setAttribute("aria-hidden", "true");
        canvas.addEventListener("webglcontextlost", contextLost);
        document.body.insertBefore(canvas, document.body.firstChild);
        renderer = createRenderer(canvas);
      } catch (error) {
        fail(error);
        return;
      }
    }
    if (!frameId) frameId = requestAnimationFrame(frame);
  }

  // Passive window listeners let the form retain all mouse and touch handling.
  function pointerMove(event) {
    if (!renderer || document.hidden || event.isPrimary === false) return;
    if (event.pointerType === "touch" && !event.buttons) return;
    renderer.move(event.clientX, event.clientY);
  }

  function resetPointer() {
    if (renderer) renderer.resetPointer();
  }

  window.addEventListener("pointermove", pointerMove, { passive: true });
  window.addEventListener("pointerdown", pointerMove, { passive: true });
  window.addEventListener("pointerup", resetPointer, { passive: true });
  window.addEventListener("pointercancel", resetPointer, { passive: true });
  window.addEventListener("pointerout", function (event) {
    if (!event.relatedTarget) resetPointer();
  }, { passive: true });
  window.addEventListener("blur", resetPointer);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("storage", function (event) {
    if (!event || event.key === null || event.key === STORAGE_KEY ||
        event.key === "proton-animations") sync();
  });
  window.addEventListener("proton-login-animation-change", sync);
  window.addEventListener("proton-settings-synced", sync);
  window.addEventListener("proton-setting-changed", sync);
  window.addEventListener("pagehide", function () {
    pageActive = false;
    destroy();
  });
  window.addEventListener("pageshow", function () {
    pageActive = true;
    sync();
  });
  if (motionQuery) {
    if (motionQuery.addEventListener) motionQuery.addEventListener("change", sync);
    else if (motionQuery.addListener) motionQuery.addListener(sync);
  }
  if (window.MutationObserver) {
    new MutationObserver(sync).observe(document.documentElement, {
      attributes: true, attributeFilter: ["class"]
    });
  }

  function createRenderer(canvas) {
    const resources = [];
    let renderingContext = null;

    function remember(context, kind, object) {
      if (object) resources.push({ context: context, kind: kind, object: object });
      return object;
    }

    function release(context, kind, object) {
      if (!object) return;
      const index = resources.findIndex(item => item.object === object);
      if (index !== -1) resources.splice(index, 1);
      context["delete" + kind](object);
    }

    function dispose() {
      resources.splice(0).reverse().forEach(item => {
        try { item.context["delete" + item.kind](item.object); } catch (error) {}
      });
      if (renderingContext) {
        const context = renderingContext;
        renderingContext = null;
        const extension = context.getExtension("WEBGL_lose_context");
        if (extension) extension.loseContext();
      }
    }

    try {
      return initialize();
    } catch (error) {
      dispose();
      throw error;
    }

    function initialize() {
      // Simulation section

      resizeCanvas();

      const config = {
          SIM_RESOLUTION: 128,
          DYE_RESOLUTION: 512,
          DENSITY_DISSIPATION: 1.3,
          VELOCITY_DISSIPATION: 0.6,
          PRESSURE: 0.8,
          PRESSURE_ITERATIONS: 16,
          CURL: 22,
          SPLAT_RADIUS: 0.2,
          SPLAT_FORCE: 5000,
          SHADING: true,
          COLORFUL: true,
          COLOR_UPDATE_SPEED: 3
      };

      function pointerPrototype () {
          this.id = -1;
          this.texcoordX = 0;
          this.texcoordY = 0;
          this.prevTexcoordX = 0;
          this.prevTexcoordY = 0;
          this.deltaX = 0;
          this.deltaY = 0;
          this.down = false;
          this.moved = false;
          this.color = [30, 0, 300];
      }

      let pointers = [];
      pointers.push(new pointerPrototype());

      const { gl, ext } = getWebGLContext(canvas);

      if (isMobile()) {
          config.DYE_RESOLUTION = 256;
      }
      if (!ext.supportLinearFiltering) {
          config.DYE_RESOLUTION = 256;
          config.SHADING = false;
      }

      function getWebGLContext (canvas) {
          const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

          let gl = canvas.getContext('webgl2', params);
          const isWebGL2 = !!gl;
          if (!isWebGL2)
              gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

          if (!gl) throw new Error("WebGL is unavailable");
          renderingContext = gl;

          let halfFloat;
          let supportLinearFiltering;
          if (isWebGL2) {
              gl.getExtension('EXT_color_buffer_float');
              supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
          } else {
              halfFloat = gl.getExtension('OES_texture_half_float');
              supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
              if (!halfFloat) throw new Error('Floating-point textures are unavailable');
          }

          gl.clearColor(0.0, 0.0, 0.0, 1.0);

          const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
          let formatRGBA;
          let formatRG;
          let formatR;

          if (isWebGL2)
          {
              formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
              formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
              formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
          }
          else
          {
              formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
              formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
              formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
          }

          if (!formatRGBA || !formatRG || !formatR) throw new Error('Floating-point render targets are unavailable');

          return {
              gl,
              ext: {
                  formatRGBA,
                  formatRG,
                  formatR,
                  halfFloatTexType,
                  supportLinearFiltering
              }
          };
      }

      function getSupportedFormat (gl, internalFormat, format, type)
      {
          if (!supportRenderTextureFormat(gl, internalFormat, format, type))
          {
              switch (internalFormat)
              {
                  case gl.R16F:
                      return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                  case gl.RG16F:
                      return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                  default:
                      return null;
              }
          }

          return {
              internalFormat,
              format
          }
      }

      function supportRenderTextureFormat (gl, internalFormat, format, type) {
          let texture = remember(gl, "Texture", gl.createTexture());
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

          let fbo = remember(gl, "Framebuffer", gl.createFramebuffer());
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

          let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
          release(gl, "Framebuffer", fbo);
          release(gl, "Texture", texture);
          return status == gl.FRAMEBUFFER_COMPLETE;
      }

      function isMobile () {
          return /Mobi|Android/i.test(navigator.userAgent);
      }

      class Material {
          constructor (vertexShader, fragmentShaderSource) {
              this.vertexShader = vertexShader;
              this.fragmentShaderSource = fragmentShaderSource;
              this.programs = [];
              this.activeProgram = null;
              this.uniforms = [];
          }

          setKeywords (keywords) {
              let hash = 0;
              for (let i = 0; i < keywords.length; i++)
                  hash += hashCode(keywords[i]);

              let program = this.programs[hash];
              if (program == null)
              {
                  let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
                  program = createProgram(this.vertexShader, fragmentShader);
                  this.programs[hash] = program;
              }

              if (program == this.activeProgram) return;

              this.uniforms = getUniforms(program);
              this.activeProgram = program;
          }

          bind () {
              gl.useProgram(this.activeProgram);
          }
      }

      class Program {
          constructor (vertexShader, fragmentShader) {
              this.uniforms = {};
              this.program = createProgram(vertexShader, fragmentShader);
              this.uniforms = getUniforms(this.program);
          }

          bind () {
              gl.useProgram(this.program);
          }
      }

      function createProgram (vertexShader, fragmentShader) {
          let program = remember(gl, "Program", gl.createProgram());
          gl.attachShader(program, vertexShader);
          gl.attachShader(program, fragmentShader);
          gl.linkProgram(program);

          if (!gl.getProgramParameter(program, gl.LINK_STATUS))
              throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed');

          return program;
      }

      function getUniforms (program) {
          let uniforms = [];
          let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
          for (let i = 0; i < uniformCount; i++) {
              let uniformName = gl.getActiveUniform(program, i).name;
              uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
          }
          return uniforms;
      }

      function compileShader (type, source, keywords) {
          source = addKeywords(source, keywords);

          const shader = remember(gl, "Shader", gl.createShader(type));
          gl.shaderSource(shader, source);
          gl.compileShader(shader);

          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
              throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed');

          return shader;
      };

      function addKeywords (source, keywords) {
          if (keywords == null) return source;
          let keywordsString = '';
          keywords.forEach(keyword => {
              keywordsString += '#define ' + keyword + '\n';
          });
          return keywordsString + source;
      }

      const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
          precision highp float;

          attribute vec2 aPosition;
          varying vec2 vUv;
          varying vec2 vL;
          varying vec2 vR;
          varying vec2 vT;
          varying vec2 vB;
          uniform vec2 texelSize;

          void main () {
              vUv = aPosition * 0.5 + 0.5;
              vL = vUv - vec2(texelSize.x, 0.0);
              vR = vUv + vec2(texelSize.x, 0.0);
              vT = vUv + vec2(0.0, texelSize.y);
              vB = vUv - vec2(0.0, texelSize.y);
              gl_Position = vec4(aPosition, 0.0, 1.0);
          }
      `);

      const copyShader = compileShader(gl.FRAGMENT_SHADER, `
          precision mediump float;
          precision mediump sampler2D;

          varying highp vec2 vUv;
          uniform sampler2D uTexture;

          void main () {
              gl_FragColor = texture2D(uTexture, vUv);
          }
      `);

      const clearShader = compileShader(gl.FRAGMENT_SHADER, `
          precision mediump float;
          precision mediump sampler2D;

          varying highp vec2 vUv;
          uniform sampler2D uTexture;
          uniform float value;

          void main () {
              gl_FragColor = value * texture2D(uTexture, vUv);
          }
      `);

      const displayShaderSource = `
          precision highp float;
          precision highp sampler2D;
          varying vec2 vUv;
          varying vec2 vL;
          varying vec2 vR;
          varying vec2 vT;
          varying vec2 vB;
          uniform sampler2D uTexture;
          uniform vec2 texelSize;

          void main () {
              vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;
              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);
              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              float diffuse = clamp(n.z + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif
              c = clamp(c, 0.0, 1.0);
              float alpha = max(c.r, max(c.g, c.b));
              gl_FragColor = vec4(c, alpha);
          }
      `;

      const splatShader = compileShader(gl.FRAGMENT_SHADER, `
          precision highp float;
          precision highp sampler2D;

          varying vec2 vUv;
          uniform sampler2D uTarget;
          uniform float aspectRatio;
          uniform vec3 color;
          uniform vec2 point;
          uniform float radius;

          void main () {
              vec2 p = vUv - point.xy;
              p.x *= aspectRatio;
              vec3 splat = exp(-dot(p, p) / radius) * color;
              vec3 base = texture2D(uTarget, vUv).xyz;
              gl_FragColor = vec4(base + splat, 1.0);
          }
      `);

      const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
          precision highp float;
          precision highp sampler2D;

          varying vec2 vUv;
          uniform sampler2D uVelocity;
          uniform sampler2D uSource;
          uniform vec2 texelSize;
          uniform vec2 dyeTexelSize;
          uniform float dt;
          uniform float dissipation;

          vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
              vec2 st = uv / tsize - 0.5;

              vec2 iuv = floor(st);
              vec2 fuv = fract(st);

              vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
              vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
              vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
              vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

              return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
          }

          void main () {
          #ifdef MANUAL_FILTERING
              vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
              vec4 result = bilerp(uSource, coord, dyeTexelSize);
          #else
              vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
              vec4 result = texture2D(uSource, coord);
          #endif
              float decay = 1.0 + dissipation * dt;
              gl_FragColor = result / decay;
          }`,
          ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']
      );

      const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
          precision mediump float;
          precision mediump sampler2D;

          varying highp vec2 vUv;
          varying highp vec2 vL;
          varying highp vec2 vR;
          varying highp vec2 vT;
          varying highp vec2 vB;
          uniform sampler2D uVelocity;

          void main () {
              float L = texture2D(uVelocity, vL).x;
              float R = texture2D(uVelocity, vR).x;
              float T = texture2D(uVelocity, vT).y;
              float B = texture2D(uVelocity, vB).y;

              vec2 C = texture2D(uVelocity, vUv).xy;
              if (vL.x < 0.0) { L = -C.x; }
              if (vR.x > 1.0) { R = -C.x; }
              if (vT.y > 1.0) { T = -C.y; }
              if (vB.y < 0.0) { B = -C.y; }

              float div = 0.5 * (R - L + T - B);
              gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
          }
      `);

      const curlShader = compileShader(gl.FRAGMENT_SHADER, `
          precision mediump float;
          precision mediump sampler2D;

          varying highp vec2 vUv;
          varying highp vec2 vL;
          varying highp vec2 vR;
          varying highp vec2 vT;
          varying highp vec2 vB;
          uniform sampler2D uVelocity;

          void main () {
              float L = texture2D(uVelocity, vL).y;
              float R = texture2D(uVelocity, vR).y;
              float T = texture2D(uVelocity, vT).x;
              float B = texture2D(uVelocity, vB).x;
              float vorticity = R - L - T + B;
              gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
          }
      `);

      const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
          precision highp float;
          precision highp sampler2D;

          varying vec2 vUv;
          varying vec2 vL;
          varying vec2 vR;
          varying vec2 vT;
          varying vec2 vB;
          uniform sampler2D uVelocity;
          uniform sampler2D uCurl;
          uniform float curl;
          uniform float dt;

          void main () {
              float L = texture2D(uCurl, vL).x;
              float R = texture2D(uCurl, vR).x;
              float T = texture2D(uCurl, vT).x;
              float B = texture2D(uCurl, vB).x;
              float C = texture2D(uCurl, vUv).x;

              vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
              force /= length(force) + 0.0001;
              force *= curl * C;
              force.y *= -1.0;

              vec2 velocity = texture2D(uVelocity, vUv).xy;
              velocity += force * dt;
              velocity = min(max(velocity, -1000.0), 1000.0);
              gl_FragColor = vec4(velocity, 0.0, 1.0);
          }
      `);

      const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
          precision mediump float;
          precision mediump sampler2D;

          varying highp vec2 vUv;
          varying highp vec2 vL;
          varying highp vec2 vR;
          varying highp vec2 vT;
          varying highp vec2 vB;
          uniform sampler2D uPressure;
          uniform sampler2D uDivergence;

          void main () {
              float L = texture2D(uPressure, vL).x;
              float R = texture2D(uPressure, vR).x;
              float T = texture2D(uPressure, vT).x;
              float B = texture2D(uPressure, vB).x;
              float C = texture2D(uPressure, vUv).x;
              float divergence = texture2D(uDivergence, vUv).x;
              float pressure = (L + R + B + T - divergence) * 0.25;
              gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
          }
      `);

      const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
          precision mediump float;
          precision mediump sampler2D;

          varying highp vec2 vUv;
          varying highp vec2 vL;
          varying highp vec2 vR;
          varying highp vec2 vT;
          varying highp vec2 vB;
          uniform sampler2D uPressure;
          uniform sampler2D uVelocity;

          void main () {
              float L = texture2D(uPressure, vL).x;
              float R = texture2D(uPressure, vR).x;
              float T = texture2D(uPressure, vT).x;
              float B = texture2D(uPressure, vB).x;
              vec2 velocity = texture2D(uVelocity, vUv).xy;
              velocity.xy -= vec2(R - L, T - B);
              gl_FragColor = vec4(velocity, 0.0, 1.0);
          }
      `);

      const blit = (() => {
          gl.bindBuffer(gl.ARRAY_BUFFER, remember(gl, "Buffer", gl.createBuffer()));
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, remember(gl, "Buffer", gl.createBuffer()));
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(0);

          return (target, clear = false) => {
              if (target == null)
              {
                  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
              }
              else
              {
                  gl.viewport(0, 0, target.width, target.height);
                  gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
              }
              if (clear)
              {
                  gl.clearColor(0.0, 0.0, 0.0, 1.0);
                  gl.clear(gl.COLOR_BUFFER_BIT);
              }
              gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
          }
      })();

      let dye;
      let velocity;
      let divergence;
      let curl;
      let pressure;

      const copyProgram            = new Program(baseVertexShader, copyShader);
      const clearProgram           = new Program(baseVertexShader, clearShader);
      const splatProgram           = new Program(baseVertexShader, splatShader);
      const advectionProgram       = new Program(baseVertexShader, advectionShader);
      const divergenceProgram      = new Program(baseVertexShader, divergenceShader);
      const curlProgram            = new Program(baseVertexShader, curlShader);
      const vorticityProgram       = new Program(baseVertexShader, vorticityShader);
      const pressureProgram        = new Program(baseVertexShader, pressureShader);
      const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

      const displayMaterial = new Material(baseVertexShader, displayShaderSource);

      function initFramebuffers () {
          let simRes = getResolution(config.SIM_RESOLUTION);
          let dyeRes = getResolution(config.DYE_RESOLUTION);

          const texType = ext.halfFloatTexType;
          const rgba    = ext.formatRGBA;
          const rg      = ext.formatRG;
          const r       = ext.formatR;
          const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

          gl.disable(gl.BLEND);

          if (dye == null)
              dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
          else
              dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

          if (velocity == null)
              velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
          else
              velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

          disposeFBO(divergence);
          disposeFBO(curl);
          if (pressure) { disposeFBO(pressure.read); disposeFBO(pressure.write); }
          divergence = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
          curl       = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
          pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);

      }

      function disposeFBO (target) {
          if (!target) return;
          release(gl, "Texture", target.texture);
          release(gl, "Framebuffer", target.fbo);
      }

      function createFBO (w, h, internalFormat, format, type, param) {
          gl.activeTexture(gl.TEXTURE0);
          let texture = remember(gl, "Texture", gl.createTexture());
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

          let fbo = remember(gl, "Framebuffer", gl.createFramebuffer());
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
          gl.viewport(0, 0, w, h);
          gl.clear(gl.COLOR_BUFFER_BIT);

          let texelSizeX = 1.0 / w;
          let texelSizeY = 1.0 / h;

          return {
              texture,
              fbo,
              width: w,
              height: h,
              texelSizeX,
              texelSizeY,
              attach (id) {
                  gl.activeTexture(gl.TEXTURE0 + id);
                  gl.bindTexture(gl.TEXTURE_2D, texture);
                  return id;
              }
          };
      }

      function createDoubleFBO (w, h, internalFormat, format, type, param) {
          let fbo1 = createFBO(w, h, internalFormat, format, type, param);
          let fbo2 = createFBO(w, h, internalFormat, format, type, param);

          return {
              width: w,
              height: h,
              texelSizeX: fbo1.texelSizeX,
              texelSizeY: fbo1.texelSizeY,
              get read () {
                  return fbo1;
              },
              set read (value) {
                  fbo1 = value;
              },
              get write () {
                  return fbo2;
              },
              set write (value) {
                  fbo2 = value;
              },
              swap () {
                  let temp = fbo1;
                  fbo1 = fbo2;
                  fbo2 = temp;
              }
          }
      }

      function resizeFBO (target, w, h, internalFormat, format, type, param) {
          let newFBO = createFBO(w, h, internalFormat, format, type, param);
          copyProgram.bind();
          gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
          blit(newFBO);
          disposeFBO(target);
          return newFBO;
      }

      function resizeDoubleFBO (target, w, h, internalFormat, format, type, param) {
          if (target.width == w && target.height == h)
              return target;
          target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
          disposeFBO(target.write);
          target.write = createFBO(w, h, internalFormat, format, type, param);
          target.width = w;
          target.height = h;
          target.texelSizeX = 1.0 / w;
          target.texelSizeY = 1.0 / h;
          return target;
      }

      displayMaterial.setKeywords(config.SHADING ? ["SHADING"] : []);
      initFramebuffers();
      render(null);
      let colorUpdateTimer = 0.0;

      function tick(dt) {
          if (resizeCanvas()) {
              initFramebuffers();
              resetPointer();
          }
          updateColors(dt);
          applyInputs();
          step(dt);
          render(null);
      }

      function resizeCanvas () {
          const rect = canvas.getBoundingClientRect();
          let width = Math.max(1, scaleByPixelRatio(rect.width));
          let height = Math.max(1, scaleByPixelRatio(rect.height));
          if (canvas.width != width || canvas.height != height) {
              canvas.width = width;
              canvas.height = height;
              return true;
          }
          return false;
      }

      function updateColors (dt) {
          if (!config.COLORFUL) return;

          colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
          if (colorUpdateTimer >= 1) {
              colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
              pointers.forEach(p => {
                  p.color = generateColor();
              });
          }
      }

      function applyInputs () {
          pointers.forEach(p => {
              if (p.moved) {
                  p.moved = false;
                  splatPointer(p);
              }
          });
      }

      function step (dt) {
          gl.disable(gl.BLEND);

          curlProgram.bind();
          gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
          gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
          blit(curl);

          vorticityProgram.bind();
          gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
          gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
          gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
          gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
          gl.uniform1f(vorticityProgram.uniforms.dt, dt);
          blit(velocity.write);
          velocity.swap();

          divergenceProgram.bind();
          gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
          gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
          blit(divergence);

          clearProgram.bind();
          gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
          gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
          blit(pressure.write);
          pressure.swap();

          pressureProgram.bind();
          gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
          gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
          for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
              gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
              blit(pressure.write);
              pressure.swap();
          }

          gradienSubtractProgram.bind();
          gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
          gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
          gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
          blit(velocity.write);
          velocity.swap();

          advectionProgram.bind();
          gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
          if (!ext.supportLinearFiltering)
              gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
          let velocityId = velocity.read.attach(0);
          gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
          gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
          gl.uniform1f(advectionProgram.uniforms.dt, dt);
          gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
          blit(velocity.write);
          velocity.swap();

          if (!ext.supportLinearFiltering)
              gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
          gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
          gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
          gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
          blit(dye.write);
          dye.swap();
      }

      function render (target) {
          // Premultiplied transparent output preserves Proton's light/dark background.
          gl.disable(gl.BLEND);
          displayMaterial.bind();
          if (config.SHADING)
              gl.uniform2f(displayMaterial.uniforms.texelSize,
                  1.0 / gl.drawingBufferWidth, 1.0 / gl.drawingBufferHeight);
          gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
          blit(target);
      }

      function splatPointer (pointer) {
          let dx = pointer.deltaX * config.SPLAT_FORCE;
          let dy = pointer.deltaY * config.SPLAT_FORCE;
          splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
      }

      function splat (x, y, dx, dy, color) {
          splatProgram.bind();
          gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
          gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
          gl.uniform2f(splatProgram.uniforms.point, x, y);
          gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
          gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
          blit(velocity.write);
          velocity.swap();

          gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
          gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
          blit(dye.write);
          dye.swap();
      }

      function correctRadius (radius) {
          let aspectRatio = canvas.width / canvas.height;
          if (aspectRatio > 1)
              radius *= aspectRatio;
          return radius;
      }

      function move(clientX, clientY) {
          const rect = canvas.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const x = (clientX - rect.left) / rect.width * canvas.width;
          const y = (clientY - rect.top) / rect.height * canvas.height;
          if (!pointers[0].down) updatePointerDownData(pointers[0], -1, x, y);
          else updatePointerMoveData(pointers[0], x, y);
      }

      function resetPointer() {
          pointers[0].down = false;
          pointers[0].moved = false;
      }

      function updatePointerDownData (pointer, id, posX, posY) {
          pointer.id = id;
          pointer.down = true;
          pointer.moved = false;
          pointer.texcoordX = posX / canvas.width;
          pointer.texcoordY = 1.0 - posY / canvas.height;
          pointer.prevTexcoordX = pointer.texcoordX;
          pointer.prevTexcoordY = pointer.texcoordY;
          pointer.deltaX = 0;
          pointer.deltaY = 0;
          pointer.color = generateColor();
      }

      function updatePointerMoveData (pointer, posX, posY) {
          pointer.prevTexcoordX = pointer.texcoordX;
          pointer.prevTexcoordY = pointer.texcoordY;
          pointer.texcoordX = posX / canvas.width;
          pointer.texcoordY = 1.0 - posY / canvas.height;
          pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
          pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
          pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
      }

      function correctDeltaX (delta) {
          let aspectRatio = canvas.width / canvas.height;
          if (aspectRatio < 1) delta *= aspectRatio;
          return delta;
      }

      function correctDeltaY (delta) {
          let aspectRatio = canvas.width / canvas.height;
          if (aspectRatio > 1) delta /= aspectRatio;
          return delta;
      }

      function generateColor () {
          let c = HSVtoRGB(Math.random(), 1.0, 1.0);
          c.r *= 0.15;
          c.g *= 0.15;
          c.b *= 0.15;
          return c;
      }

      function HSVtoRGB (h, s, v) {
          let r, g, b, i, f, p, q, t;
          i = Math.floor(h * 6);
          f = h * 6 - i;
          p = v * (1 - s);
          q = v * (1 - f * s);
          t = v * (1 - (1 - f) * s);

          switch (i % 6) {
              case 0: r = v, g = t, b = p; break;
              case 1: r = q, g = v, b = p; break;
              case 2: r = p, g = v, b = t; break;
              case 3: r = p, g = q, b = v; break;
              case 4: r = t, g = p, b = v; break;
              case 5: r = v, g = p, b = q; break;
          }

          return {
              r,
              g,
              b
          };
      }

      function wrap (value, min, max) {
          let range = max - min;
          if (range == 0) return min;
          return (value - min) % range + min;
      }

      function getResolution (resolution) {
          let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
          if (aspectRatio < 1)
              aspectRatio = 1.0 / aspectRatio;

          let min = Math.round(resolution);
          let max = Math.round(resolution * aspectRatio);

          if (gl.drawingBufferWidth > gl.drawingBufferHeight)
              return { width: max, height: min };
          else
              return { width: min, height: max };
      }

      function scaleByPixelRatio (input) {
          let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
          return Math.floor(input * pixelRatio);
      }

      function hashCode (s) {
          if (s.length == 0) return 0;
          let hash = 0;
          for (let i = 0; i < s.length; i++) {
              hash = (hash << 5) - hash + s.charCodeAt(i);
              hash |= 0; // Convert to 32bit integer
          }
          return hash;
      };
      return { tick: tick, move: move, resetPointer: resetPointer, dispose: dispose };
    }
  }

  sync();
})();
