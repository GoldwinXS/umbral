/**
 * Umbral RT harness (2026-08-15, for the three-realtime-rt 0.15.0 upgrade).
 *
 * There was no surviving harness on this machine, so this is a small one, built
 * around the four rules the last two agents learned the hard way:
 *
 *  1. HEADED CHROMIUM, with ANGLE on the GL backend. A headless tab reports
 *     document.visibilityState === "hidden", the game's _loop returns early when
 *     hidden, the boot overlay never clears, and every capture is a blank frame
 *     that LOOKS like a hang. installVisibility() below redefines
 *     visibilityState/hidden before any page script runs.
 *  2. ONE LEVEL PER BROWSER BOOT. Reloading to switch level loses the GL context
 *     often enough to poison a run.
 *  3. NEVER JUDGE A CAPTURE BY FILE SIZE. A converged night frame in this game is
 *     a few kB and is correct. Every number here comes from real pixels read
 *     inside the render task; the PNGs are for human eyes.
 *  4. EVERY NUMBER BESIDE ITS FLOOR. Every measurement function is written to be
 *     run twice on the identical arm, and the caller prints run-to-run spread
 *     next to the effect.
 *
 * Pixels are read with drawImage(glCanvas) -> getImageData INSIDE the wrapped
 * rt.render call, i.e. inside the rAF task, because the drawing buffer is
 * cleared on composite and a readback outside that task returns zeros (the
 * library's own waterfall gate was fooled by exactly this).
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Playwright is not a dependency of this game and node_modules here is
// npm-pristine for the upgrade, so it is loaded from a sibling project that has
// it installed. Browsers come from the machine-wide ms-playwright cache.
const require = createRequire("file:///C:/ClaudeSessions/KingstonWebCensus/package.json");
export const { chromium } = require("playwright");

export const HERE = dirname(fileURLToPath(import.meta.url));
export const SHOTS = resolve(HERE, "shots");
mkdirSync(SHOTS, { recursive: true });

export const AFTER = "http://localhost:5182/";  // this worktree, 0.15.0
export const BEFORE = "http://localhost:5183/"; // the owner's main checkout, 0.14.1

export const LEVELS = {
  0: "ashway", 1: "dousing-yards", 2: "fleshers-row", 3: "brightward-gate",
  4: "lantern-ways", 5: "chandlery", 6: "spire", 7: "reliquary",
};

const GL_ARGS = ["--use-angle=gl", "--enable-webgl", "--ignore-gpu-blocklist"];

export async function launch(extraArgs = []) {
  return chromium.launch({ headless: false, args: [...GL_ARGS, ...extraArgs] });
}

/**
 * A page with the visibility override installed, sized to a real 1280x720
 * drawing buffer (deviceScaleFactor 1 so devicePixelRatio is 1 and the canvas
 * pixel ratio is exactly what Settings computes).
 */
export async function newPage(browser, { seedStorage = null, width = 1280, height = 720 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    // Visible by default (rule 1). Made a MUTABLE flag rather than a constant so
    // an idle arm can be parked: the game's _loop returns before rt.render when
    // the document reads hidden, which is how two browsers can share one GPU for
    // an interleaved A/B without contending with each other.
    window.__vis = true;
    Object.defineProperty(document, "visibilityState", { get: () => (window.__vis ? "visible" : "hidden"), configurable: true });
    Object.defineProperty(document, "hidden", { get: () => !window.__vis, configurable: true });
    document.hasFocus = () => true;
  });
  if (seedStorage) {
    await ctx.addInitScript((blob) => {
      for (const [k, v] of Object.entries(blob)) localStorage.setItem(k, v);
    }, seedStorage);
  }
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.__errors = errors;
  return page;
}

/** Boot the game and load ONE level. Returns the tracer's own report. */
export async function boot(page, url, level, { preset = null, freezeGovernor = true, settings = {} } = {}) {
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.UMBRAL && window.UMBRAL.rt, null, { timeout: 60000 });
  await page.evaluate((lv) => {
    // The menu buttons hide the overlays BEFORE calling loadLevel; calling it
    // straight leaves the title panel (and its backdrop blur) drawn over the
    // level, which does not affect the in-page pixel readback but ruins every
    // screenshot a human has to look at.
    if (window.UMBRAL._hideOverlays) window.UMBRAL._hideOverlays();
    window.UMBRAL.loadLevel(lv);
  }, level);
  await page.waitForFunction(() => window.UMBRAL.state === "playing", null, { timeout: 120000 });
  return page.evaluate(({ preset, freezeGovernor, settings }) => {
    const g = window.UMBRAL;
    if (preset) g.settings.setPreset(preset);
    for (const [k, v] of Object.entries(settings)) g.settings.set(k, v);
    // The governor is the point of the game's defaults, but it is death to an
    // A/B: it moves renderScale and the canvas ladder under the measurement and
    // the two arms drift apart. Frozen for measurement, and said so in the
    // report. governorScale is reset first so a rung it already took is undone.
    if (freezeGovernor) {
      g.settings.governorScale = 1;
      g.settings._applyResolution();
      g.rt.adaptiveQuality = false;
      g.rt.overloadProtection = false;
    }
    const rt = g.rt;
    return {
      lib: {
        renderScale: rt.renderScale, denoiseIterations: rt.denoiseIterations, taa: rt.taa,
        gi: rt.gi, restir: rt.restir, ambient: rt.ambient, motionVectors: rt.motionVectors,
        motionVectorsSupported: rt.motionVectorsSupported,
        restirDirectionalBypass: rt.restirDirectionalBypass,
        restirReprojectionRescue: rt.restirReprojectionRescue,
        restirCandidateImportance: rt.restirCandidateImportance,
        restirClampRel: rt.restirClampRel, stochasticLights: rt.stochasticLights,
        reflections: rt.reflections, refraction: rt.refraction, volumetric: rt.volumetric.enabled,
        adaptiveQuality: rt.adaptiveQuality, overscan: Number(rt.overscan.toFixed(3)),
      },
      settings: { preset: g.settings.preset, renderScale: g.settings.renderScale, resolution: g.settings.resolution, denoise: g.settings.denoise },
      scene: {
        lights: rt.compiled ? rt.compiled.lightCount : null,
        emissiveTris: rt.compiled ? rt.compiled.emissiveTriCount : null,
        diagonal: rt.compiled ? Math.round(rt.compiled.sceneDiagonal) : null,
        directional: (() => { let n = 0; g.scene.traverse((o) => { if (o.isDirectionalLight && o.visible) n++; }); return n; })(),
        ambientLights: (() => { const a = []; g.scene.traverse((o) => { if (o.isAmbientLight) a.push({ color: "#" + o.color.getHexString(), intensity: o.intensity }); }); return a; })(),
        warnings: (rt.status && rt.status.warnings) || [],
        compileError: rt.compileError || null,
        coreFailure: (rt.status && rt.status.coreFailure) || null,
      },
      canvas: [g.renderer.domElement.width, g.renderer.domElement.height],
      version: (window.UMBRAL.rt.constructor.DEFAULTS ? "0.15.x (has DEFAULTS)" : "pre-0.15 (no DEFAULTS)"),
    };
  }, { preset, freezeGovernor, settings });
}

/**
 * Install the per-frame hook. Wraps rt.render so everything happens inside the
 * rAF task: the GPU sync for the timing, and the readback for the pixels.
 *
 *   __H.ft      per-frame ms (render call + a 1x1 readPixels sync)
 *   __H.lum     downsampled luma frames, only while __H.capture is true
 *   __H.yawRate rad/s applied to camYaw before each render (with the sim frozen)
 */
export async function installHooks(page, { sampleW = 320, sampleH = 180 } = {}) {
  await page.evaluate(({ sampleW, sampleH }) => {
    const g = window.UMBRAL;
    if (g.__hooked) return;
    g.__hooked = true;
    const rt = g.rt, gl = g.renderer.getContext();
    const px = new Uint8Array(4);
    const c2 = document.createElement("canvas");
    c2.width = sampleW; c2.height = sampleH;
    const ctx = c2.getContext("2d", { willReadFrequently: true });
    const H = window.__H = {
      ft: [], lum: [], frames: 0, capture: false, yawRate: 0, dt: 1 / 60,
      maxLum: 400, sampleW, sampleH,
    };
    const orig = rt.render.bind(rt);
    rt.render = function (scene, camera) {
      if (H.yawRate) { g.camYaw += H.yawRate * H.dt; g._followCamera(H.dt); }
      const t0 = performance.now();
      const r = orig(scene, camera);
      // Synchronise: without this the timer measures command submission, not work.
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      H.ft.push(performance.now() - t0);
      H.frames++;
      if (H.capture && H.lum.length < H.maxLum) {
        // INSIDE the render task: the drawing buffer is still intact here.
        ctx.drawImage(gl.canvas, 0, 0, sampleW, sampleH);
        const d = ctx.getImageData(0, 0, sampleW, sampleH).data;
        const f = new Float32Array(sampleW * sampleH);
        for (let i = 0, j = 0; i < d.length; i += 4, j++) {
          f[j] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        }
        H.lum.push(f);
      }
      return r;
    };
  }, { sampleW, sampleH });
}

/**
 * Freeze the simulation (guards, player, timers) so ONLY the camera moves, then
 * snap the camera onto its follow target. Frozen at frame 0 rather than after a
 * few seconds of play on purpose: guard AI advances on wall-clock dt, so two
 * arms running at different frame rates would put the wardens in different
 * places and the "difference" between the arms would be a warden.
 * _followCamera eases exponentially, so a few big-dt calls settle it exactly.
 */
export async function freezeSim(page) {
  await page.evaluate(() => {
    const g = window.UMBRAL;
    g.state = "frozen";            // anything but "playing": _loop skips _step, still renders
    g.settings.autoFollow = false; // or _autoYaw fights a scripted turn
    for (let i = 0; i < 8; i++) g._followCamera(0.5);
    if (g.rt.resetAccumulation) g.rt.resetAccumulation();
  });
}

/** Park / wake an arm so two browsers can share one GPU without overlapping. */
export async function park(page) { await page.evaluate(() => { window.__vis = false; }); }
export async function wake(page) { await page.evaluate(() => { window.__vis = true; }); }

/** Apply a game preset and re-freeze the governor (apply() turns it back on). */
export async function applyPreset(page, name) {
  return page.evaluate((n) => {
    const g = window.UMBRAL;
    g.settings.setPreset(n);
    g.settings.governorScale = 1;
    g.settings._applyResolution();
    g.rt.adaptiveQuality = false;
    g.rt.overloadProtection = false;
    if (g.rt.resetAccumulation) g.rt.resetAccumulation();
    return { renderScale: g.rt.renderScale, canvas: [g.renderer.domElement.width, g.renderer.domElement.height], denoise: g.rt.denoiseIterations, volumetric: g.rt.volumetric.enabled, reflections: g.rt.reflections };
  }, name);
}

/**
 * Switch camera view AND settle it. setViewMode only sets the target: the
 * tactical<->shoulder crossfade (`_viewBlend`, VIEW_TAU) is eased inside
 * _followCamera, which the frozen sim never calls, so without the big-dt
 * settling below the "third-person" arm would quietly render from the tactical
 * boom and the whole noise protocol would measure the wrong camera.
 */
export async function setView(page, mode) {
  await page.evaluate((m) => {
    const g = window.UMBRAL;
    g.setViewMode(m);
    for (let i = 0; i < 12; i++) g._followCamera(0.5);
    if (g.rt.resetAccumulation) g.rt.resetAccumulation();
    return g._viewBlend;
  }, mode);
  return page.evaluate(() => ({ viewMode: window.UMBRAL.viewMode, viewBlend: window.UMBRAL._viewBlend, overscan: window.UMBRAL.rt.overscan }));
}

export async function placePlayer(page, [x, y, z]) {
  await page.evaluate(({ x, y, z }) => {
    const g = window.UMBRAL;
    g.player.pos.set(x, y, z);
    for (let i = 0; i < 8; i++) g._followCamera(0.5); // snap, do not ease
    if (g.rt.resetAccumulation) g.rt.resetAccumulation();
  }, { x, y, z });
}

/** Wait for N rendered frames (counted in the hook, so they are real renders). */
export async function frames(page, n) {
  await page.evaluate((n) => {
    const start = window.__H.frames;
    return new Promise((res) => {
      const tick = () => (window.__H.frames - start >= n ? res() : requestAnimationFrame(tick));
      tick();
    });
  }, n);
}

export async function resetTimers(page) {
  await page.evaluate(() => { window.__H.ft.length = 0; window.__H.lum.length = 0; });
}

export async function readFt(page) {
  return page.evaluate(() => window.__H.ft.slice());
}

export const median = (a) => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
export const r2 = (x) => (Number.isFinite(x) ? Math.round(x * 100) / 100 : x);
export const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : x);

/** Turn the camera, stop, then report noise at the settled pose. See the report. */
export async function turnAndSettle(page, { yawRate = 2.4, turnFrames = 60, settleFrames = 30, convergeFrames = 200 } = {}) {
  await page.evaluate(() => { window.__H.capture = false; window.__H.lum.length = 0; });
  // 1. turn
  await page.evaluate((y) => { window.__H.yawRate = y; }, yawRate);
  await frames(page, turnFrames);
  // 2. stop; capture the 30 frames right after the turn, at a fixed pose
  await page.evaluate(() => { window.__H.yawRate = 0; window.__H.capture = true; });
  await frames(page, settleFrames + 1);
  const settled = await page.evaluate((n) => {
    window.__H.capture = false;
    const l = window.__H.lum.splice(0, n);
    return l.map((f) => Array.from(f));
  }, settleFrames);
  // 3. converge at the SAME pose and capture the reference
  await frames(page, convergeFrames);
  const ref = await page.evaluate(() => {
    window.__H.capture = true;
    return new Promise((res) => {
      const start = window.__H.frames;
      const tick = () => {
        if (window.__H.frames - start >= 2 && window.__H.lum.length) {
          window.__H.capture = false;
          res(Array.from(window.__H.lum[window.__H.lum.length - 1]));
        } else requestAnimationFrame(tick);
      };
      tick();
    });
  });
  // flicker: |frame_t - frame_{t+1}| at a STATIC pose (pure estimator instability)
  let flick = 0, n = 0;
  for (let i = 1; i < settled.length; i++) {
    let s = 0;
    for (let j = 0; j < settled[i].length; j++) s += Math.abs(settled[i][j] - settled[i - 1][j]);
    flick += s / settled[i].length; n++;
  }
  // grain: |frame - converged| over the same window
  let grain = 0;
  for (const f of settled) {
    let s = 0;
    for (let j = 0; j < f.length; j++) s += Math.abs(f[j] - ref[j]);
    grain += s / f.length;
  }
  return {
    flicker: flick / Math.max(1, n),
    grain: grain / Math.max(1, settled.length),
    refMean: mean(ref),
    frames: settled.length,
  };
}

/** Mean luma of a rectangular patch of the CURRENT frame, in 0..1 screen coords. */
export async function patchLuma(page, rects) {
  return page.evaluate((rects) => {
    const g = window.UMBRAL, gl = g.renderer.getContext();
    return new Promise((res) => {
      const c2 = document.createElement("canvas");
      const W = 640, H = 360;
      c2.width = W; c2.height = H;
      const ctx = c2.getContext("2d", { willReadFrequently: true });
      const rt = g.rt, orig = rt.render.bind(rt);
      // one-shot: read at the end of the very next render task
      const once = function (scene, camera) {
        const r = orig(scene, camera);
        ctx.drawImage(gl.canvas, 0, 0, W, H);
        const d = ctx.getImageData(0, 0, W, H).data;
        const out = {};
        for (const [name, [x0, y0, x1, y1]] of Object.entries(rects)) {
          const px0 = Math.floor(x0 * W), px1 = Math.ceil(x1 * W);
          const py0 = Math.floor(y0 * H), py1 = Math.ceil(y1 * H);
          let s = 0, n = 0;
          for (let y = py0; y < py1; y++) for (let x = px0; x < px1; x++) {
            const i = (y * W + x) * 4;
            s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++;
          }
          out[name] = n ? s / n : NaN;
        }
        rt.render = orig;
        res(out);
        return r;
      };
      rt.render = once;
    });
  }, rects);
}

/** Full-frame luma of the current image, downsampled, as a flat array. */
export async function frameLuma(page, W = 320, H = 180) {
  return page.evaluate(({ W, H }) => {
    const g = window.UMBRAL, gl = g.renderer.getContext();
    return new Promise((res) => {
      const c2 = document.createElement("canvas");
      c2.width = W; c2.height = H;
      const ctx = c2.getContext("2d", { willReadFrequently: true });
      const rt = g.rt, orig = rt.render.bind(rt);
      rt.render = function (scene, camera) {
        const r = orig(scene, camera);
        ctx.drawImage(gl.canvas, 0, 0, W, H);
        const d = ctx.getImageData(0, 0, W, H).data;
        const out = new Array(W * H);
        for (let i = 0, j = 0; i < d.length; i += 4, j++) out[j] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        rt.render = orig;
        res(out);
        return r;
      };
    });
  }, { W, H });
}

export async function shot(page, name) {
  const path = resolve(SHOTS, name.endsWith(".png") ? name : name + ".png");
  await page.screenshot({ path });
  return path;
}

/** The analytic light meter at a world position: the game's single source of truth. */
export async function meterAt(page, [x, y, z]) {
  return page.evaluate(({ x, y, z }) => {
    const g = window.UMBRAL;
    const p = g.player.pos.clone();
    g.player.pos.set(x, y, z);
    const v = g._computePlayerVis();
    g.player.pos.copy(p);
    return v;
  }, { x, y, z });
}
