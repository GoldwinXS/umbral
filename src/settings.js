/**
 * Graphics settings: state, persistence (localStorage), live-apply to the
 * RealtimeRaytracer, and the settings-panel UI. GI is deliberately not
 * exposed — direct-light + emissive NEE is the look.
 */
export const DEFAULTS = {
  preset: "bal",
  renderScale: 0.6,   // trace resolution (fraction of full res)
  resolution: 0.75,   // canvas pixel ratio as a fraction of native DPR
  taa: true,
  denoise: 3,         // à-trous iterations
  volumetric: true,   // god-ray single scatter
  reflections: false, // traced mirror/glossy reflections
  stochastic: false,  // 1 shadow ray/px/frame (many-light perf lever)
  adaptive: true,     // governor steers quality toward targetFps
  targetFps: 55,
  sound: true,
  overlayOpacity: 1.0, // multiplier for in-world effects (sound rings, reticles…)
  touch: null,        // null = auto-detect; true = on-screen controls, false = desktop
};

const PRESETS = {
  perf:   { renderScale: 0.4, resolution: 0.6, taa: true, denoise: 2, volumetric: false, reflections: false, stochastic: true, adaptive: true, targetFps: 50 },
  bal:    { renderScale: 0.6, resolution: 0.75, taa: true, denoise: 3, volumetric: true, reflections: false, stochastic: false, adaptive: true, targetFps: 55 },
  beauty: { renderScale: 0.9, resolution: 1.0, taa: true, denoise: 4, volumetric: true, reflections: true, stochastic: false, adaptive: true, targetFps: 60 },
};

const KEY = "umbral.settings";

export class Settings {
  constructor() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) {}
    Object.assign(this, DEFAULTS, saved);
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
        preset: this.preset, renderScale: this.renderScale, resolution: this.resolution,
        taa: this.taa, denoise: this.denoise, volumetric: this.volumetric,
        reflections: this.reflections, stochastic: this.stochastic,
        adaptive: this.adaptive, targetFps: this.targetFps, sound: this.sound,
        overlayOpacity: this.overlayOpacity, touch: this.touch,
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
    if (key !== "touch") this.preset = "custom"; // control mode isn't a graphics preset
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

    slider("Trace resolution", "renderScale", 0.3, 1.0, 0.05, (v) => Math.round(v * 100) + "%", "Ray traced lighting sample rate");
    slider("Canvas resolution", "resolution", 0.4, 1.0, 0.05, (v) => Math.round(v * 100) + "%", "Render buffer size vs native display");
    slider("Denoise passes", "denoise", 0, 5, 1, (v) => String(v), "Shadow smoothing iterations");
    slider("Target FPS", "targetFps", 30, 60, 5, (v) => String(v), "For the adaptive governor");
    slider("Effects opacity", "overlayOpacity", 0.2, 1.5, 0.05, (v) => Math.round(v * 100) + "%", "Sound rings, reticles & other on-screen effects");
    toggle("Temporal AA", "taa", "Smooths edges, slight lag");
    toggle("Volumetric light beams", "volumetric", "Visible light shafts through haze");
    toggle("Reflections", "reflections", "Traced gloss on crystal floors — costly");
    toggle("Stochastic shadows", "stochastic", "1 shadow ray/px — faster, noisier");
    toggle("Adaptive quality", "adaptive", "Auto-tunes quality to hold target FPS");
    toggle("Touch controls", "touch", "On-screen stick + buttons (mobile). Off = desktop keys.");

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
    for (const key of ["taa", "volumetric", "reflections", "stochastic", "adaptive", "touch"]) {
      const t = document.getElementById("set_" + key);
      if (t) t.classList.toggle("on", !!this[key]);
    }
    document.getElementById("tglSound").classList.toggle("on", !!this.sound);
    for (const [id, name] of Object.entries({ prePerf: "perf", preBal: "bal", preBeauty: "beauty" })) {
      document.getElementById(id).classList.toggle("sel", this.preset === name);
    }
  }
}
