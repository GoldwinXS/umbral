/**
 * Graphics settings: state, persistence (localStorage), live-apply to the
 * RealtimeRaytracer, and the settings-panel UI. Direct light + emissive NEE is
 * the default look; GI is an opt-in row (rt.gi is a live uniform, so it needs
 * no recompile) and is half-rate when on — see apply().
 */
// DEFAULTS start on the CONSERVATIVE "perf" tier ON PURPOSE — the game should
// load and run on weak/integrated GPUs out of the box, so a machine that still
// can't handle it reads as the user's hardware, not a broken game. The tracer
// starts low-but-ray-traced and the adaptive governor scales quality UP toward
// targetFps on capable hardware within a couple of seconds, so strong GPUs lose
// nothing. Beauty (full res, reflections, god-rays) is an opt-in in Settings.
export const DEFAULTS = {
  preset: "perf",
  // TRACE RESOLUTION — fraction of the CANVAS DRAWING BUFFER that the lighting
  // is traced at, and since 2026-07-25 that is literally true: main.js sizes the
  // tracer in drawing-buffer pixels, so 0.55 means 0.55 on screen. It used to be
  // sized in CSS pixels, which silently multiplied it by 1/resolution (0.40 was
  // really ~0.67) — see SCHEMA_VERSION below for what that means for saves.
  renderScale: 0.55,
  resolution: 0.6,    // canvas pixel ratio as a fraction of native DPR
  taa: true,
  denoise: 2,         // à-trous iterations (governor raises this as it lowers res)
  volumetric: false,  // god-ray single scatter — opt-in (a perf cost)
  reflections: false, // traced mirror/glossy reflections — opt-in
  stochastic: true,   // 1 shadow ray/px/frame (many-light perf lever)
  adaptive: true,     // governor steers quality toward targetFps (scales UP)
  targetFps: 50,
  sound: true,
  overlayOpacity: 0.2, // multiplier for in-world effects (sound rings, reticles…); 0.2 is the new "100%"
  touch: null,        // null = auto-detect; true = on-screen controls, false = desktop
  view3p: false,      // camera view: false = tactical 3/4 boom (the default — stealth routing needs the overview), true = close third-person
  autoFollow: true,   // third-person only: swing the camera behind the blob's heading. ON by default — hand-steering a low camera every corner is the main reason third-person views feel bad
  gi: false,          // one bounce of indirect light. OFF by default: it is the single most expensive switch here and the game targets weak GPUs
};

// RETUNED 2026-07-25 against corrected tracer sizing (main.js, near
// OVERSCAN_TACTICAL). Every renderScale here used to be inflated by 1/resolution
// on the way to the tracer, so the EFFECTIVE trace density was:
//   perf 0.40/0.60 = 0.67   bal 0.60/0.75 = 0.80   beauty 0.90/1.00 = 0.90
// The numbers below are the density each tier actually gets now. perf and bal
// deliberately buy LESS density than they used to and spend the difference on
// third-person overscan + denoise passes, which the measurements say is by far
// the better trade for the noise players actually complain about; beauty is
// unchanged because at resolution 1.0 on a 1x display the old maths was already
// a no-op (on a HiDPI screen it was undersizing instead, and is now correct).
const PRESETS = {
  perf:   { renderScale: 0.55, resolution: 0.6, taa: true, denoise: 2, volumetric: false, reflections: false, stochastic: true, adaptive: true, targetFps: 50 },
  bal:    { renderScale: 0.7, resolution: 0.75, taa: true, denoise: 3, volumetric: true, reflections: false, stochastic: false, adaptive: true, targetFps: 55 },
  beauty: { renderScale: 0.9, resolution: 1.0, taa: true, denoise: 4, volumetric: true, reflections: true, stochastic: false, adaptive: true, targetFps: 60 },
};

const KEY = "umbral.settings";
// Bumped when a saved value's MEANING changes (not when a default changes).
// v2: tracer sizing moved from CSS to drawing-buffer pixels, so a stored
//     renderScale now delivers renderScale (not renderScale/resolution) of the
//     canvas. See the migration in the constructor.
const SCHEMA_VERSION = 2;

export class Settings {
  constructor() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) {}
    Object.assign(this, DEFAULTS, saved);
    // ---- SCHEMA MIGRATION (see SCHEMA_VERSION) ----------------------------
    // A save written before the tracer-sizing fix stores a renderScale that was
    // being multiplied by 1/resolution on its way to the tracer. Loading it
    // as-is would silently DOWNGRADE a returning player's image (perf's 0.40
    // used to trace ~67% of the canvas and would now trace 40%), which is
    // exactly what a version field is for.
    //   * On a named preset: adopt the retuned tier. A preset is the game's
    //     definition of a quality tier, and these were re-derived against the
    //     corrected sizing — so "perf" keeps meaning "our cheap tier", which is
    //     what the player chose, rather than a frozen pair of numbers.
    //   * Custom: preserve the EFFECTIVE density they had, renderScale /
    //     resolution, snapped to the slider's 0.05 step and its 0.3..1.0 range.
    //     Same picture, and cheaper than before, because the correctly-sized
    //     targets are the ones being traced at that density.
    if (Object.keys(saved).length && saved.v !== SCHEMA_VERSION) {
      if (PRESETS[saved.preset]) Object.assign(this, PRESETS[saved.preset]);
      else if (saved.renderScale > 0 && saved.resolution > 0) {
        const eff = Math.round((saved.renderScale / saved.resolution) / 0.05) * 0.05;
        this.renderScale = Math.max(0.3, Math.min(1, eff));
      }
    }
    this.v = SCHEMA_VERSION;
    // effects-opacity scale was recentred so 0.2 is the new "100%": snap any
    // stale higher saved value (old default 1.0, old range up to 1.5) down into
    // the new range so nobody is stuck with the old too-strong effects.
    if (!(this.overlayOpacity <= 0.4)) this.overlayOpacity = DEFAULTS.overlayOpacity;
    // resolve auto → detected touch capability (only if never chosen)
    if (this.touch === null || this.touch === undefined) {
      this.touch = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    }
    this.governorScale = 1; // adaptive governor's deepest lever (canvas scale)
    this._rt = null;
    this._renderer = null;
    this._onResize = null;
    this._onSound = null;
  }

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: SCHEMA_VERSION, // omit and the next boot re-runs the v2 migration
        preset: this.preset, renderScale: this.renderScale, resolution: this.resolution,
        taa: this.taa, denoise: this.denoise, volumetric: this.volumetric,
        reflections: this.reflections, stochastic: this.stochastic,
        adaptive: this.adaptive, targetFps: this.targetFps, sound: this.sound,
        overlayOpacity: this.overlayOpacity, touch: this.touch,
        view3p: this.view3p, autoFollow: this.autoFollow, gi: this.gi,
      }));
    } catch (_) {}
  }

  attach(rt, renderer, onResize, onSound) {
    this._rt = rt; this._renderer = renderer;
    this._onResize = onResize; this._onSound = onSound;
    rt.canvasScaleHook = (s) => { this.governorScale = s; this._applyResolution(); };
    this.apply();
  }

  _applyResolution() {
    if (!this._renderer) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this._renderer.setPixelRatio(dpr * this.resolution * this.governorScale);
    // 0.5.0: the drawing buffer is CSS-stretched by resolution × governorScale,
    // which magnifies the TAA's buffer-pixel jitter into visible screen wobble
    // at low canvas scales. Matching taaJitterScale to the stretch keeps the
    // jitter constant in SCREEN pixels. (renderScale is unrelated: jitter is
    // applied at G-buffer resolution, not lighting resolution.)
    if (this._rt) this._rt.taaJitterScale = this.resolution * this.governorScale;
    if (this._onResize) this._onResize();
  }

  apply() {
    const rt = this._rt;
    if (rt && rt.supported) {
      rt.taa = this.taa;
      rt.denoiseIterations = this.denoise;
      rt.volumetric.enabled = this.volumetric;
      rt.reflections = this.reflections;
      rt.stochasticLights = this.stochastic;
      rt.adaptiveQuality = this.adaptive;
      rt.targetFps = this.targetFps;
      // GI: `gi` feeds a per-frame uniform, so this is a LIVE toggle — no
      // recompile, no tracer rebuild. It is always paired with giHalfRate
      // (bounce traced on alternating checkerboard parity: unbiased, converges
      // to the same brightness, ~half the ray cost), because this game targets
      // weak GPUs and full-rate GI is not a trade they should have to discover.
      // One user-facing knob, not two.
      const giWas = rt.gi;
      rt.gi = this.gi;
      rt.giHalfRate = this.gi;
      // ...and drop the temporal history, or the pre-GI lighting smears through
      // the accumulation for a second after the switch.
      if (giWas !== this.gi && rt.resetAccumulation) rt.resetAccumulation();
      rt.renderScale = this.renderScale; // setter reallocates targets
    }
    this._applyResolution();
    if (this._onSound) this._onSound(this.sound);
    document.body.classList.toggle("coarse", !!this.touch); // show only the right control UI
    this.save();
    this._syncUI();
  }

  set(key, value) {
    this[key] = value;
    // The governor owns these three while it runs — touching them turns it off.
    if (["renderScale", "denoise", "stochastic"].includes(key)) this.adaptive = false;
    // Neither the control mode nor the camera view is a GRAPHICS setting, so
    // neither one should knock the preset off "perf"/"bal"/"beauty" — a player
    // who picks third-person has not customised their quality tier.
    // GI is deliberately NOT exempt — it is a real graphics cost, so turning it
    // on is exactly the kind of change "custom" is meant to record.
    if (key !== "touch" && key !== "view3p" && key !== "autoFollow") this.preset = "custom";
    this.apply();
  }

  setPreset(name) {
    Object.assign(this, PRESETS[name]);
    this.preset = name;
    this.apply();
  }

  // ---------- UI ----------
  buildUI() {
    const rows = document.getElementById("setRows");
    rows.innerHTML = "";
    const slider = (label, key, min, max, step, fmt, hint) => {
      const row = document.createElement("div");
      row.className = "setrow";
      row.innerHTML = `<label>${label}${hint ? `<span class="hint">${hint}</span>` : ""}</label>`;
      const input = document.createElement("input");
      input.type = "range"; input.min = min; input.max = max; input.step = step;
      input.id = "set_" + key;
      const val = document.createElement("span");
      val.className = "val"; val.id = "val_" + key;
      input.addEventListener("input", () => { this.set(key, parseFloat(input.value)); });
      row.appendChild(input); row.appendChild(val);
      rows.appendChild(row);
      this._fmt = this._fmt || {}; this._fmt[key] = fmt;
    };
    const toggle = (label, key, hint) => {
      const row = document.createElement("div");
      row.className = "setrow";
      row.innerHTML = `<label>${label}${hint ? `<span class="hint">${hint}</span>` : ""}</label>`;
      const t = document.createElement("div");
      t.className = "toggle"; t.id = "set_" + key;
      t.addEventListener("click", () => this.set(key, !this[key]));
      row.appendChild(t);
      rows.appendChild(row);
    };

    // HONEST LABEL: this really is the fraction of the canvas render buffer that
    // the lighting is traced at (main.js sizes the tracer in drawing-buffer
    // pixels). Third-person pads the traced image off-screen, but the final draw
    // takes the proportional central crop, so the on-screen density is this
    // number in both views. The two resolution rows multiply: 55% trace x 60%
    // canvas is 33% of your display's pixels.
    slider("Trace resolution", "renderScale", 0.3, 1.0, 0.05, (v) => Math.round(v * 100) + "%", "Lighting samples per canvas pixel");
    slider("Canvas resolution", "resolution", 0.4, 1.0, 0.05, (v) => Math.round(v * 100) + "%", "Render buffer size vs native display");
    slider("Denoise passes", "denoise", 0, 5, 1, (v) => String(v), "Shadow smoothing iterations");
    slider("Target FPS", "targetFps", 30, 60, 5, (v) => String(v), "For the adaptive governor");
    slider("Effects opacity", "overlayOpacity", 0.04, 0.4, 0.02, (v) => Math.round(v / 0.2 * 100) + "%", "Sound rings & your own effects — enemy tells and fog stay full-strength");
    toggle("Temporal AA", "taa", "Smooths edges, slight lag");
    toggle("Volumetric light beams", "volumetric", "Visible light shafts through haze");
    toggle("Reflections", "reflections", "Traced gloss on crystal floors — costly");
    toggle("Indirect light (GI)", "gi", "One bounce of light off walls — the costliest option here. Looks richer; hiding is unchanged, so a corner can now look brighter than the gem reads.");
    toggle("Stochastic shadows", "stochastic", "1 shadow ray/px — faster, noisier");
    toggle("Adaptive quality", "adaptive", "Auto-tunes quality to hold target FPS");
    toggle("Touch controls", "touch", "On-screen stick + buttons (mobile). Off = desktop keys.");
    toggle("Third-person camera", "view3p", "Low view just behind you (V). Off = the high tactical boom.");
    toggle("Auto-follow camera", "autoFollow", "Third-person: the camera swings behind the way you are moving. Steering it by hand always takes over.");

    // preset buttons
    const pres = { prePerf: "perf", preBal: "bal", preBeauty: "beauty" };
    for (const [id, name] of Object.entries(pres)) {
      document.getElementById(id).addEventListener("click", () => this.setPreset(name));
    }
    document.getElementById("tglSound").addEventListener("click", () => {
      this.sound = !this.sound; this.apply();
    });
    this._syncUI();
  }

  _syncUI() {
    if (!document.getElementById("set_renderScale")) return;
    for (const key of ["renderScale", "resolution", "denoise", "targetFps", "overlayOpacity"]) {
      const input = document.getElementById("set_" + key);
      const val = document.getElementById("val_" + key);
      if (input) input.value = this[key];
      if (val) val.textContent = this._fmt[key](this[key]);
    }
    for (const key of ["taa", "volumetric", "reflections", "gi", "stochastic", "adaptive", "touch", "view3p", "autoFollow"]) {
      const t = document.getElementById("set_" + key);
      if (t) t.classList.toggle("on", !!this[key]);
    }
    document.getElementById("tglSound").classList.toggle("on", !!this.sound);
    for (const [id, name] of Object.entries({ prePerf: "perf", preBal: "bal", preBeauty: "beauty" })) {
      document.getElementById(id).classList.toggle("sel", this.preset === name);
    }
  }
}
