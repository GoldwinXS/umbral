/**
 * Graphics settings: state, persistence (localStorage), live-apply to the
 * RealtimeRaytracer, and the settings-panel UI. Direct light + emissive NEE is
 * the default look; GI is an opt-in row (rt.gi is a live uniform, so it needs
 * no recompile) and is half-rate when on — see apply().
 *
 * 0.15.0 REWORK (2026-08-15). Three rules, in order of how much trouble they
 * save:
 *   1. THE LIBRARY OWNS ITS OWN DEFAULTS. Every knob that is really a
 *      three-realtime-rt option now takes its default from
 *      `RealtimeRaytracer.DEFAULTS` rather than from a number copied into this
 *      file. A library upgrade that retunes a default therefore reaches a
 *      returning player, which is the whole point of the upgrade.
 *   2. A PRESET IS A SHORT LIST OF DELTAS, not a snapshot of everything. Each
 *      tier is "the library defaults, plus these eight" (see PRESETS), so a knob
 *      nobody tiered cannot silently freeze at an old value inside a preset.
 *   3. RESET MEANS RESET. The panel has a Reset button that clears the saved
 *      blob, restores the game's conservative tier AND writes
 *      `RealtimeRaytracer.DEFAULTS` back over the tracer. The Hangar lost a week
 *      to stale persisted knobs overriding new defaults on a device nobody could
 *      inspect; a save is not allowed to be the only way out of that.
 */
import { RealtimeRaytracer } from "three-realtime-rt";

// The library's own defaults for every live-assignable option (0.15.0+). Frozen
// and flat. If a build ever ships without it, fail LOUDLY here rather than
// silently substituting numbers: a wrong default is invisible in a screenshot.
const RTD = RealtimeRaytracer.DEFAULTS || {};
if (!RealtimeRaytracer.DEFAULTS) {
  console.error("[umbral] three-realtime-rt has no static DEFAULTS (needs >= 0.15.0); advanced knobs will fall back to hard-coded values.");
}

/**
 * Library options the panel exposes and therefore has to mirror in game state,
 * with the fallback used only if the installed library is missing the key. The
 * fallbacks are the 0.15.0 values and exist so a mismatched install degrades to
 * "the setting still works" rather than "undefined is written to the tracer".
 */
const LIB_KNOBS = {
  restirClampRel: 2,             // relative firefly cap on the ReSTIR direct term (0 = off)
  restirDirectionalBypass: true, // the sun is shaded exactly, once, instead of poisoning reservoirs
  restirReprojectionRescue: true,// sub-texel + 4-neighbour history rescue, so thin geometry warms under TAA jitter
  restirCandidateImportance: true,// candidates drawn by light power, like NEE draws them
  motionVectors: true,           // 5th G-buffer attachment: history lookup for MOVING meshes
};
const libDefault = (k) => (RTD[k] !== undefined ? RTD[k] : LIB_KNOBS[k]);

// DEFAULTS start on the CONSERVATIVE "perf" tier ON PURPOSE — the game should
// load and run on weak/integrated GPUs out of the box, so a machine that still
// can't handle it reads as the user's hardware, not a broken game. The tracer
// starts low-but-ray-traced and the adaptive governor scales quality UP toward
// targetFps on capable hardware within a couple of seconds, so strong GPUs lose
// nothing. Beauty (full res, reflections, god-rays) is an opt-in in Settings.
//
// The ReSTIR block below is NOT a taste choice: every one of those four is the
// estimator being CORRECT (the library measured them at 1.01x frame time
// together), so they are on for everyone, on every tier, and live in Advanced
// for the one player in a thousand who wants to see what each one does.
export const DEFAULTS = {
  preset: "perf",
  // TRACE RESOLUTION — fraction of the CANVAS DRAWING BUFFER that the lighting
  // is traced at, and since 2026-07-25 that is literally true: main.js sizes the
  // tracer in drawing-buffer pixels, so 0.55 means 0.55 on screen. It used to be
  // sized in CSS pixels, which silently multiplied it by 1/resolution (0.40 was
  // really ~0.67) — see SCHEMA_VERSION below for what that means for saves.
  renderScale: 0.55,
  resolution: 0.6,    // canvas pixel ratio as a fraction of native DPR
  taa: RTD.taa !== undefined ? RTD.taa : true,
  denoise: 2,         // à-trous iterations (governor picks 2..3 by itself; the slider's range is wider)
  volumetric: false,  // god-ray single scatter — opt-in (a perf cost)
  reflections: false, // traced mirror/glossy reflections — opt-in
  refraction: RTD.refraction !== undefined ? RTD.refraction : true, // glass: the relic gem is the only one in the game
  adaptive: true,     // governor steers quality toward targetFps (scales UP)
  targetFps: 50,
  // --- library-owned advanced knobs (see LIB_KNOBS) ---
  restirClampRel: libDefault("restirClampRel"),
  restirDirectionalBypass: libDefault("restirDirectionalBypass"),
  restirReprojectionRescue: libDefault("restirReprojectionRescue"),
  restirCandidateImportance: libDefault("restirCandidateImportance"),
  motionVectors: libDefault("motionVectors"),
  // --- not graphics ---
  sound: true,
  overlayOpacity: 0.2, // multiplier for in-world effects (sound rings, reticles…); 0.2 is the new "100%"
  touch: null,        // null = auto-detect; true = on-screen controls, false = desktop
  view3p: false,      // camera view: false = tactical 3/4 boom (the default — stealth routing needs the overview), true = close third-person
  autoFollow: true,   // third-person only: swing the camera behind the blob's heading. ON by default — hand-steering a low camera every corner is the main reason third-person views feel bad
  gi: false,          // one bounce of indirect light. OFF by default: it is the single most expensive switch here and the game targets weak GPUs
};

// A TIER IS A SHORT LIST OF DELTAS off the library defaults, and this is the
// whole list it is allowed to contain: the picture-size knobs, the three traced
// features that cost rays, and the governor's two dials. Anything else a player
// changes (TAA, GI, the ReSTIR block, effects opacity) survives a tier change,
// because a tier is a statement about how much GPU to spend, not a factory
// reset. Reset is the factory reset, and it is one button away.
//
// The numbers were RETUNED 2026-07-25 against corrected tracer sizing (main.js,
// near OVERSCAN_TACTICAL) and are UNCHANGED by the 0.15.0 upgrade, deliberately:
// holding them fixed is what makes the before/after measurement in
// docs/RT-0.15-REPORT.md a measurement of the library rather than of a retune.
// What changed here is that `stochastic: true` left the perf tier. Under
// `restir: true` (which this game always sets) the shader reads
// `useStochastic = !uRestirEnabled && uLightStochastic`, so that flag has been
// dead in every frame this game has ever rendered. It was never a lever; it was
// a lie in the panel.
const PRESETS = {
  perf:   { renderScale: 0.55, resolution: 0.6,  denoise: 2, volumetric: false, reflections: false, refraction: true, adaptive: true, targetFps: 50 },
  bal:    { renderScale: 0.7,  resolution: 0.75, denoise: 3, volumetric: true,  reflections: false, refraction: true, adaptive: true, targetFps: 55 },
  beauty: { renderScale: 0.9,  resolution: 1.0,  denoise: 4, volumetric: true,  reflections: true,  refraction: true, adaptive: true, targetFps: 60 },
};

const KEY = "umbral.settings";
// Every key we persist. A save is FILTERED through this list on the way in, so a
// retired key (v2's `stochastic`) cannot ride along in the live object and be
// written straight back out on the next save.
const SAVED_KEYS = [
  "preset", "renderScale", "resolution", "taa", "denoise", "volumetric",
  "reflections", "refraction", "adaptive", "targetFps",
  "restirClampRel", "restirDirectionalBypass", "restirReprojectionRescue",
  "restirCandidateImportance", "motionVectors",
  "sound", "overlayOpacity", "touch", "view3p", "autoFollow", "gi",
];
// Bumped when a saved value's MEANING changes (not when a default changes).
// v2: tracer sizing moved from CSS to drawing-buffer pixels, so a stored
//     renderScale now delivers renderScale (not renderScale/resolution) of the
//     canvas. See the migration in the constructor.
// v3: three-realtime-rt 0.15.0. `stochastic` retired (dead under restir), and
//     five library knobs joined the panel. The migration's job is that a v2 save
//     does not pin a returning player to 0.14-era behaviour: a named tier
//     re-adopts the tier, and every knob that did not exist in v2 comes from the
//     NEW library defaults rather than from anything on disk.
const SCHEMA_VERSION = 3;

/**
 * Library options that Reset must NOT restore from RealtimeRaytracer.DEFAULTS,
 * because main.js chose them deliberately at construction and they are part of
 * the game's look, not of its quality tier:
 *   dispersion: the relic gem's chromatic edge (0.12; the library default is 0)
 *   volumetric: a live object carrying the LEVEL's density and zones
 *   overscan:   owned per camera view by main.js `_applyViewTuning`
 *   ambient:    the library defaults it TRUE; this game must keep it false, or
 *                two levels' authored "visual-only" sky fill becomes real flat
 *                light on every surface and the picture stops agreeing with the
 *                analytic light meter. See _makeRT. A Reset that quietly turned
 *                this on would be the worst kind of bug: it only shows up as
 *                "the dark corners went grey" on somebody else's machine.
 */
const RESET_SKIP = new Set(["dispersion", "volumetric", "overscan", "ambient"]);

export class Settings {
  constructor() {
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) {}
    const hadSave = Object.keys(raw).length > 0;
    const savedV = Number(raw.v) || 1;
    // KNOWN KEYS ONLY (see SAVED_KEYS). This is also what makes rule 1 true: a
    // key that is not in the save comes from DEFAULTS, and for a library knob
    // DEFAULTS is the library's own current value.
    const saved = {};
    for (const k of SAVED_KEYS) if (raw[k] !== undefined) saved[k] = raw[k];
    Object.assign(this, DEFAULTS, saved);

    // ---- SCHEMA MIGRATION (see SCHEMA_VERSION) ----------------------------
    if (hadSave && savedV !== SCHEMA_VERSION) {
      // v1 -> v2. A save written before the tracer-sizing fix stores a
      // renderScale that was being multiplied by 1/resolution on its way to the
      // tracer. Loading it as-is would silently DOWNGRADE a returning player's
      // image (perf's 0.40 used to trace ~67% of the canvas and would now trace
      // 40%), which is exactly what a version field is for. Custom saves keep
      // the EFFECTIVE density they had, snapped to the slider's step and range.
      if (savedV < 2 && !PRESETS[saved.preset] && saved.renderScale > 0 && saved.resolution > 0) {
        const eff = Math.round((saved.renderScale / saved.resolution) / 0.05) * 0.05;
        this.renderScale = Math.max(0.3, Math.min(1, eff));
      }
      // v(any) -> v3. On a NAMED tier: adopt the tier as it is defined today. A
      // preset is the game's definition of a quality tier, so "perf" keeps
      // meaning "our cheap tier", which is what the player chose, rather than a
      // frozen set of numbers from whichever version they last played.
      // On "custom": keep every explicit value, and note that the knobs added in
      // v3 are not in `saved` at all, so they are already the new library
      // defaults from the Object.assign above. That is the Hangar rule: a value
      // the player never set must come from the new defaults, not from disk.
      if (PRESETS[saved.preset]) Object.assign(this, PRESETS[saved.preset]);
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
    // Reset deliberately leaves NO saved blob behind (see reset()): with no save
    // on disk, the next boot takes every value from the current defaults, which
    // is the only state in which a library upgrade can reach a returning player
    // without them pressing anything.
    if (this._noSave) return;
    try {
      const blob = { v: SCHEMA_VERSION }; // omit and the next boot re-runs the migration
      for (const k of SAVED_KEYS) blob[k] = this[k];
      localStorage.setItem(KEY, JSON.stringify(blob));
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
    // applied at G-buffer resolution, not lighting resolution.) Still present
    // and still live-assignable in 0.15.0.
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
      rt.refraction = this.refraction;
      rt.adaptiveQuality = this.adaptive;
      rt.targetFps = this.targetFps;
      // ReSTIR correctness block (0.15.0). These are live uniforms/flags, so the
      // panel can toggle them mid-frame with no recompile and no rebuild.
      rt.restirClampRel = this.restirClampRel;
      rt.restirDirectionalBypass = this.restirDirectionalBypass;
      rt.restirReprojectionRescue = this.restirReprojectionRescue;
      rt.restirCandidateImportance = this.restirCandidateImportance;
      // motionVectors reallocates the G-buffer when it flips, and is ignored
      // (with a one-time library warning) where the GPU has fewer than 5 draw
      // buffers. Read rt.motionVectorsSupported, which the panel does.
      rt.motionVectors = this.motionVectors;
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
    // The governor owns these two while it runs, so touching them turns it off.
    // (`stochastic` used to be the third; it is gone, and it was dead anyway.)
    if (["renderScale", "denoise"].includes(key)) this.adaptive = false;
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

  /**
   * RESET TO DEFAULTS. Three things, and it needs all three to mean anything:
   *   1. forget the saved blob (so nothing on disk can re-assert itself),
   *   2. restore the game's own conservative tier and every non-graphics
   *      default, re-running the touch auto-detect,
   *   3. write `RealtimeRaytracer.DEFAULTS` back over the tracer, so a knob the
   *      panel does NOT expose (restirMCap, maxHistory, the governor's own
   *      levers, anything a future library version adds) also returns to the
   *      library's current opinion rather than staying wherever the governor,
   *      the overload brake or an old session left it.
   * Then reset accumulation, because half of the above changes what a pixel
   * means and the temporal history is now a lie.
   */
  reset() {
    try { localStorage.removeItem(KEY); } catch (_) {}
    const rt = this._rt;
    if (rt && rt.supported && RealtimeRaytracer.DEFAULTS) {
      for (const [k, v] of Object.entries(RealtimeRaytracer.DEFAULTS)) {
        if (RESET_SKIP.has(k)) continue;
        if (k in rt) rt[k] = v;
      }
    }
    for (const k of Object.keys(DEFAULTS)) this[k] = DEFAULTS[k];
    Object.assign(this, PRESETS.perf);
    this.preset = "perf";
    this.v = SCHEMA_VERSION;
    this.governorScale = 1;
    if (this.touch === null || this.touch === undefined) {
      this.touch = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    }
    this._noSave = true;
    this.apply(); // writes the game's own choices back over the bulk restore
    this._noSave = false;
    if (rt && rt.resetAccumulation) rt.resetAccumulation();
    window.dispatchEvent(new CustomEvent("umbral-settings-reset"));
  }

  /** Re-read the tracer and redraw every control. Called when the panel opens. */
  refresh() { this._syncUI(); }

  // ---------- UI ----------
  buildUI() {
    const rows = document.getElementById("setRows");
    rows.innerHTML = "";
    this._fmt = {}; this._sliders = []; this._toggles = []; // rebuilt with the rows
    // Sections keep the panel readable on a phone: the two groups a player
    // actually touches are open, and the long tail is a closed <details> so the
    // panel is no taller than it was before this rework.
    let host = rows;
    const section = (title, open, hint) => {
      const d = document.createElement("details");
      d.className = "setgroup";
      d.open = !!open;
      d.innerHTML = `<summary>${title}${hint ? `<span class="hint">${hint}</span>` : ""}</summary>`;
      rows.appendChild(d);
      host = d;
    };
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
      host.appendChild(row);
      this._fmt[key] = fmt;
      this._sliders.push(key);
    };
    const toggle = (label, key, hint) => {
      const row = document.createElement("div");
      row.className = "setrow";
      row.id = "row_" + key;
      row.innerHTML = `<label>${label}${hint ? `<span class="hint">${hint}</span>` : ""}</label>`;
      const t = document.createElement("div");
      t.className = "toggle"; t.id = "set_" + key;
      t.addEventListener("click", () => { if (!row.classList.contains("disabled")) this.set(key, !this[key]); });
      row.appendChild(t);
      host.appendChild(row);
      this._toggles.push(key);
    };
    const readout = (label, id, hint) => {
      const row = document.createElement("div");
      row.className = "setrow";
      row.innerHTML = `<label>${label}${hint ? `<span class="hint">${hint}</span>` : ""}</label>`;
      const val = document.createElement("span");
      val.className = "val"; val.id = id;
      row.appendChild(val);
      host.appendChild(row);
    };

    // ---- PICTURE ----
    section("Picture", true);
    // HONEST LABEL: this really is the fraction of the canvas render buffer that
    // the lighting is traced at (main.js sizes the tracer in drawing-buffer
    // pixels). Third-person pads the traced image off-screen, but the final draw
    // takes the proportional central crop, so the on-screen density is this
    // number in both views. The two resolution rows multiply: 55% trace x 60%
    // canvas is 33% of your display's pixels.
    slider("Trace resolution", "renderScale", 0.3, 1.0, 0.05, (v) => Math.round(v * 100) + "%", "Lighting samples per canvas pixel");
    slider("Canvas resolution", "resolution", 0.4, 1.0, 0.05, (v) => Math.round(v * 100) + "%", "Render buffer size vs native display");
    slider("Denoise passes", "denoise", 0, 5, 1, (v) => String(v), "Shadow smoothing iterations");
    slider("Effects opacity", "overlayOpacity", 0.04, 0.4, 0.02, (v) => Math.round(v / 0.2 * 100) + "%", "Sound rings & your own effects — enemy tells and fog stay full-strength");
    toggle("Temporal AA", "taa", "Smooths edges, slight lag");

    // ---- TRACED FEATURES (the ones that cost rays) ----
    section("Traced features", true);
    toggle("Volumetric light beams", "volumetric", "Visible light shafts through haze");
    toggle("Reflections", "reflections", "Traced gloss on crystal floors — costly");
    toggle("Refraction", "refraction", "Glass: the relic gem's amber bends light through it");
    toggle("Indirect light (GI)", "gi", "One bounce of light off walls — the costliest option here. Looks richer; hiding is unchanged, so a corner can now look brighter than the gem reads.");

    // ---- ADVANCED ----
    // Closed by default. Everything in here is ON because the library measured
    // it as the estimator being right at ~1.01x the frame time, so these rows
    // exist to be LOOKED at, not to be turned off. Each hint carries the finding.
    section("Advanced", false, "Estimator and governor internals");
    slider("Firefly cap (relative)", "restirClampRel", 0, 4, 0.5, (v) => (v ? v.toFixed(1) + "x" : "off"), "Caps a light sample against this pixel's own estimate. 0 = off; an ABSOLUTE cap used to converge bright surfaces dark.");
    toggle("Sun bypass", "restirDirectionalBypass", "Shade directional light exactly, once, instead of letting it win every reservoir and then be shadowed. Costs one shadow ray/px on sunlit levels.");
    toggle("Reprojection rescue", "restirReprojectionRescue", "Sub-texel history lookup + a 4-neighbour rescue, so thin geometry stops restarting from scratch every jittered frame. ALU only.");
    toggle("Candidate importance", "restirCandidateImportance", "Draw light candidates by power, as NEE does. Uniform sampling spent ~91% of the budget on ~4% of the light.");
    toggle("Motion vectors", "motionVectors", "History lookup for MOVING meshes (wardens, doors) instead of camera-only reprojection. Needs 5 draw buffers.");
    toggle("Adaptive quality", "adaptive", "Auto-tunes quality to hold target FPS. Two-way since 0.15: it climbs again on a fast GPU.");
    slider("Target FPS", "targetFps", 30, 60, 5, (v) => String(v), "For the adaptive governor");
    readout("Overscan", "val_overscan", "Traced padding outside the frame, so a turning camera reveals converged pixels. Set per camera view.");

    // ---- CONTROLS / VIEW (not graphics: these never touch the preset) ----
    section("Controls & view", true);
    toggle("Touch controls", "touch", "On-screen stick + buttons (mobile). Off = desktop keys.");
    toggle("Third-person camera", "view3p", "Low view just behind you (V). Off = the high tactical boom.");
    toggle("Auto-follow camera", "autoFollow", "Third-person: the camera swings behind the way you are moving. Steering it by hand always takes over.");

    // preset buttons + reset
    const pres = { prePerf: "perf", preBal: "bal", preBeauty: "beauty" };
    for (const [id, name] of Object.entries(pres)) {
      document.getElementById(id).addEventListener("click", () => this.setPreset(name));
    }
    const rst = document.getElementById("setReset");
    if (rst) rst.addEventListener("click", () => this.reset());
    document.getElementById("tglSound").addEventListener("click", () => {
      this.sound = !this.sound; this.apply();
    });
    this._syncUI();
  }

  _syncUI() {
    if (!document.getElementById("set_renderScale")) return;
    for (const key of (this._sliders || [])) {
      const input = document.getElementById("set_" + key);
      const val = document.getElementById("val_" + key);
      if (input) input.value = this[key];
      if (val && this._fmt[key]) val.textContent = this._fmt[key](this[key]);
    }
    for (const key of (this._toggles || [])) {
      const t = document.getElementById("set_" + key);
      if (t) t.classList.toggle("on", !!this[key]);
    }
    // Motion vectors need a 5th draw buffer. Where the GPU has only the WebGL2
    // guaranteed 4 the library ignores the option, so the row says so instead of
    // pretending to be a switch.
    const mvRow = document.getElementById("row_motionVectors");
    if (mvRow && this._rt) {
      const unsupported = this._rt.supported && this._rt.motionVectorsSupported === false;
      mvRow.classList.toggle("disabled", unsupported);
      const hint = mvRow.querySelector(".hint");
      if (unsupported && hint && !hint.dataset.mvNote) {
        hint.dataset.mvNote = "1";
        hint.textContent = "Unavailable: this GPU exposes only 4 draw buffers.";
      }
    }
    const ov = document.getElementById("val_overscan");
    if (ov) ov.textContent = this._rt && this._rt.supported ? Math.round((this._rt.overscan || 0) * 100) + "%" : "n/a";
    document.getElementById("tglSound").classList.toggle("on", !!this.sound);
    for (const [id, name] of Object.entries({ prePerf: "perf", preBal: "bal", preBeauty: "beauty" })) {
      document.getElementById(id).classList.toggle("sel", this.preset === name);
    }
  }
}
