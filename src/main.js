import * as THREE from "three";
import { RealtimeRaytracer } from "three-realtime-rt";
import { Input } from "./input.js";
import { Settings } from "./settings.js";
import { Sfx } from "./audio.js";
import { Hud } from "./hud.js";
import { Player, PLAYER_R, BLINK_CD, DOUSE_RADIUS, SWALLOW_RANGE } from "./player.js";
import { Warden } from "./guards.js";
import { GreatEye } from "./greatEye.js";
import { pointInHole, surfaceAt } from "./physics.js";
import { SURFACES } from "./levelKit.js";
import { NoiseRings } from "./noiseRings.js";
import { buildTutorial } from "./levels/tutorial.js";
import { buildDousing } from "./levels/dousing.js";
import { buildSwallow } from "./levels/swallow.js";
import { buildMission1 } from "./levels/mission1.js";
import { buildLanternWays } from "./levels/lanternways.js";
import { buildVault } from "./levels/vault.js";
import { buildSpire } from "./levels/spire.js";
import { buildChandlery } from "./levels/chandlery.js";

const LEVELS = [
  { name: "THE ASHWAY", build: buildTutorial },
  { name: "THE LAMPWAY", build: buildDousing },
  { name: "THE GORGE", build: buildSwallow },
  { name: "BRIGHTWARD", build: buildMission1 },
  { name: "THE LANTERN-WAYS", build: buildLanternWays },
  { name: "THE CHANDLERY", build: buildChandlery },
  { name: "THE SPIRE ASCENT", build: buildSpire },
  { name: "THE RELIQUARY", build: buildVault },
];
const CAM_OFFSET = new THREE.Vector3(0, 12.5, 6.3);
const PROGRESS_KEY = "umbral.progress";
// Light-gem calibration. The analytic direct-light SUM at the player's feet is
// mapped to 0 (shadow) .. 1 (fully lit). The tracer runs gi:false, so a LOS-gated
// sum of the real scene lights matches what's on screen — and it's deterministic,
// so it can be unit-tested. Point lights (torches/fills) use INVERSE-SQUARE
// falloff on the ground plane, matching the tracer: a tight bright pool that
// falls off to near-nothing within a few metres, so a torch across the room no
// longer bleeds light into a dark corner.
const VIS_ENV = 0.15;   // sky/env floor — the world is never pitch black
const VIS_MOON = 1.0;   // moon (directional) weight
const VIS_NORM = 9.0;
// CUMULATIVE progression by level index — Hush only ever gets stronger. This
// is the single source of truth (per-level bag.upgrades are ignored), so a
// later level can never silently regress an earlier grant.
const POWER = [
  {},                                                                  // 0 Ashway
  {},                                                                  // 1 Lampway (dousing)
  {},                                                                  // 2 The Gorge (swallow)
  {},                                                                  // 3 Brightward
  { blinkRange: 6.5 },                                                 // 4 Lantern-Ways
  { blinkRange: 6.5, growthCap: 0.55 },                                // 5 Chandlery
  { blinkRange: 7, growthCap: 0.55, maxHealthCap: 7, maxHealth: 4 },   // 6 Spire Ascent
  { blinkRange: 7, growthCap: 0.6, maxHealthCap: 7, maxHealth: 4 },    // 7 Reliquary (finale)
];

const boot = document.getElementById("boot");
const bootMsg = document.getElementById("boot-msg");

class Game {
  constructor() {
    this.state = "title";
    this.levelIndex = 0;
    this.level = null;
    this.scene = null;
    this.camera = null;
    this.player = null;
    this.wardens = [];
    this.sfx = new Sfx();
    this.input = new Input();
    this.hud = new Hud();
    this.isTouch = document.body.classList.contains("coarse");
    this.progress = this._loadProgress();

    // counters
    this.alerts = 0;
    this.caughtCount = 0;
    this.kos = 0;
    this.vialsUsed = 0;
    this.elapsed = 0;
    this.playerVis = 0.06;
    this._lights = [];           // scene lights (moon + all point lights), collected per level
    this._tmpDir = new THREE.Vector3();
    this._origin = new THREE.Vector3();
    this._occludedT = 0;         // seconds the camera view of the blob has been blocked
    this._camHintCd = 0;         // cooldown before the "rotate/zoom" hint can show again
    this._camHintCount = 0;      // times the hint has shown this level (capped)
    this.litness = 0;            // 0 (dark) → 1 (exposed), derived from playerVis
    this.spotting = 0;           // hottest warden awareness that currently sees me
    this.SEEN_THRESHOLD = 0.18;  // gem below this = in shadow, unseen (see hud.js)
    this.playerSneaking = false;
    this.playerHidden = false;
    this.playerConcealed = false; // standing in a fog bank
    this.fogCover = 0;            // 0..1 concealment from fog at the player
    this.maxDanger = 0;
    this.guardSpeedMul = 1;
    this.scepterTaken = false;
    this.interactHint = false;
    this.checkpoint = new THREE.Vector3();

    this._ray = new THREE.Raycaster();
    this._tmpV = new THREE.Vector3();
    this.noise = null; // NoiseRings, rebuilt per level
    this._camPos = new THREE.Vector3();
    this._camOff = new THREE.Vector3();
    this.camDist = 1;   // zoom (0.5 close … 2.0 far)
    this.camYaw = 0;    // orbit rotation about the player

    this._initRenderer();
    this._initUI();
    this.input.enabled = true;

    // audio unlock on first gesture
    const unlock = () => this.sfx.resume();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    window.addEventListener("resize", () => this._onResize());
    this._initCameraControls();

    this._lastT = performance.now();
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);

    window.UMBRAL = this; // debug / test hook
  }

  // ---------------- setup ----------------

  _initRenderer() {
    // "high-performance" forces the discrete GPU and can FAIL to get a context on
    // some laptops / sandboxed or locked-down browsers even when a plain context
    // works fine (a friend's machine ran another WebGL game but not this one).
    // So try progressively more permissive options before giving up.
    const attempts = [
      { antialias: false, powerPreference: "high-performance" },
      { antialias: false, powerPreference: "default" },
      { antialias: false, powerPreference: "low-power", failIfMajorPerformanceCaveat: false },
    ];
    let renderer, lastErr;
    for (const opts of attempts) {
      try { renderer = new THREE.WebGLRenderer(opts); break; }
      catch (e) { lastErr = e; }
    }
    if (!renderer) {
      const err = new Error("WebGL could not start on this browser/computer.");
      err.webgl = true; err.cause = lastErr;
      throw err;
    }
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth || 1280, window.innerHeight || 720);
    document.getElementById("app").appendChild(renderer.domElement);
    this.renderer = renderer;

    this.rtSupported = RealtimeRaytracer.isSupported(renderer);
    this.settings = new Settings();
    this._makeRT();
  }

  _makeRT() {
    if (this.rt) this.rt.dispose();
    const tier = RealtimeRaytracer.detectTier(this.renderer);
    const opts = RealtimeRaytracer.recommendedOptions(tier);
    this.rt = new RealtimeRaytracer(this.renderer, {
      ...opts,
      gi: false,               // direct light + emissive NEE is the look (and the budget)
      emissiveNEE: true,       // trims/studs light the scene for free
      restir: true,            // flat cost in light count — many-light scenes stay cheap
      maxHistory: 48,
      // a LOW, cold ambient floor — shadows must go genuinely dark so torches
      // and warden beams pool bright and the "shadow = unseen" mechanic reads.
      envColor: new THREE.Color(0x0a0e1a),
      envIntensity: 0.28,
      volumetric: { enabled: true, density: 0 },
      overloadProtection: true,
    });
    this.settings.attach(this.rt, this.renderer, () => this._onResize(), (on) => this.sfx.setEnabled(on));
  }

  _onResize() {
    const w = window.innerWidth || 1280, h = window.innerHeight || 720;
    this.renderer.setSize(w, h);
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    if (this.rt) this.rt.setSize(w, h);
  }

  // ---------------- camera zoom + orbit ----------------

  _clampZoom() { this.camDist = Math.max(0.5, Math.min(2.0, this.camDist)); }

  /** The follow offset for the current zoom + yaw (base is a high 3/4 view). */
  _camOffset() {
    const d = this.camDist, s = Math.sin(this.camYaw), c = Math.cos(this.camYaw);
    // base offset (0, 12.5, 6.3) rotated about Y and scaled by zoom
    return this._camOff.set(-6.3 * d * s, 12.5 * d, 6.3 * d * c);
  }

  _initCameraControls() {
    const playing = () => this.state === "playing";
    // desktop: wheel = zoom
    window.addEventListener("wheel", (e) => {
      if (!playing()) return;
      this.camDist += (e.deltaY > 0 ? 0.12 : -0.12);
      this._clampZoom();
      e.preventDefault();
    }, { passive: false });
    // desktop: right-drag = orbit
    let rx = null;
    window.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && e.button === 2 && playing()) rx = e.clientX; });
    window.addEventListener("pointermove", (e) => { if (rx != null) { this.camYaw += (e.clientX - rx) * 0.008; rx = e.clientX; } });
    window.addEventListener("pointerup", () => { rx = null; });
    window.addEventListener("contextmenu", (e) => { if (playing()) e.preventDefault(); });
    // touch: two-finger pinch = zoom, twist = orbit
    const pts = new Map();
    let pd = 0, pa = 0;
    const two = () => { const it = [...pts.values()]; return [it[0], it[1]]; };
    window.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      pts.set(e.pointerId, e);
      if (pts.size === 2) { const [a, b] = two(); pd = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); pa = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX); }
    });
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "touch" || !pts.has(e.pointerId)) return;
      pts.set(e.pointerId, e);
      if (pts.size >= 2 && playing()) {
        const [a, b] = two();
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const ang = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
        if (pd > 0) {
          this.camDist *= pd / Math.max(1, dist); this._clampZoom();
          let da = ang - pa; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
          this.camYaw += da;
        }
        pd = dist; pa = ang;
        e.preventDefault();
      }
    }, { passive: false });
    const drop = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pd = 0; };
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", drop);
  }

  _initUI() {
    const $ = (id) => document.getElementById(id);
    const show = (id) => $(id).classList.remove("hidden");
    const hide = (id) => $(id).classList.add("hidden");
    this._show = show; this._hide = hide;
    const overlays = ["title", "levels", "how", "settings", "pause", "win"];
    const hideAll = () => overlays.forEach((o) => hide(o));
    this._hideOverlays = hideAll;

    const click = (id, fn) => $(id).addEventListener("click", (e) => {
      this.sfx.ui(); fn();
      if (e.currentTarget && e.currentTarget.blur) e.currentTarget.blur(); // keep Space/Enter from re-firing buttons
    });

    click("btnPlay", () => { hideAll(); this.loadLevel(Math.min(this.progress.unlocked, LEVELS.length - 1)); });
    click("btnLevels", () => { hideAll(); this._refreshLevels(); show("levels"); });
    click("btnHow", () => { hideAll(); show("how"); });
    click("btnSettings", () => { this._settingsReturn = "title"; hideAll(); show("settings"); });
    click("howBack", () => { hideAll(); show("title"); });
    click("lvBack", () => { hideAll(); show("title"); });
    click("setBack", () => {
      hideAll();
      if (this._settingsReturn === "pause") show("pause");
      else show("title");
    });
    for (let i = 0; i < LEVELS.length; i++) {
      click("lv" + i, () => {
        if (i > this.progress.unlocked) return;
        hideAll(); this.loadLevel(i);
      });
    }
    click("btnResume", () => this.resume());
    click("btnRestart", () => { hideAll(); this.loadLevel(this.levelIndex); });
    click("btnPauseSettings", () => { this._settingsReturn = "pause"; hideAll(); show("settings"); });
    click("btnQuit", () => this._toTitle());
    click("btnNext", () => {
      hideAll();
      const next = this.levelIndex + 1;
      if (next < LEVELS.length && next <= this.progress.unlocked) this.loadLevel(next);
      else this._toTitle();
    });
    click("btnReplay", () => { hideAll(); this.loadLevel(this.levelIndex); });
    click("btnWinTitle", () => this._toTitle());

    this.settings.buildUI();
    this._refreshLevels();
    show("title");
    boot.classList.add("hidden"); // menus render over the empty canvas until a level loads
  }

  _toTitle() {
    this.state = "title";
    this.hud.show(false);
    this._hideOverlays();
    this._refreshLevels();
    this._show("title");
    this.input.clearActions();
  }

  _refreshLevels() {
    for (let i = 0; i < LEVELS.length; i++) {
      const btn = document.getElementById("lv" + i);
      const locked = i > this.progress.unlocked;
      btn.disabled = locked;
      btn.classList.toggle("locked", locked);
      const best = this.progress.best[LEVELS[i].name];
      document.getElementById("best" + i).textContent = best
        ? ` — ${best.time.toFixed(1)}s · ${best.rating}`
        : locked ? "" : " — uncleared";
    }
  }

  _loadProgress() {
    try {
      const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null");
      if (p && typeof p.unlocked === "number") return { unlocked: p.unlocked, best: p.best || {} };
    } catch (_) {}
    return { unlocked: 0, best: {} };
  }

  _saveProgress() {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress)); } catch (_) {}
  }

  // ---------------- level lifecycle ----------------

  _disposeScene() {
    if (!this.scene) return;
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach((m) => m.dispose());
      }
    });
    this.scene = null;
  }

  loadLevel(index) {
    bootMsg.textContent = "shaping the dark…";
    boot.classList.remove("hidden");
    this.isTouch = document.body.classList.contains("coarse"); // reflects the control-mode setting
    this.levelIndex = index;
    this._disposeScene();
    this._makeRT(); // fresh raytracer for the fresh scene (no stale GPU state)

    const bag = LEVELS[index].build();
    this.level = bag;
    this.scene = bag.scene;

    // a plain-rendered overlay scene for transparent in-world HUD effects
    this.overlayScene = new THREE.Scene();

    // depth-proxy of the solid geometry: rendered depth-only before the overlay
    // pass so overlay effects (sound rings, fog barriers…) are OCCLUDED by walls
    // instead of showing through them.
    this._depthScene = new THREE.Scene();
    const depthMat = new THREE.MeshBasicMaterial({ colorWrite: false });
    for (const o of bag.occluders) {
      // Only TALL geometry (walls, cover, pillars) should occlude overlay effects.
      // Flat floors (h 0.2) and surface plates (h 0.06) sit right under the
      // ground-hugging effects (rings/reticle at y≈0.05) and would z-fight them
      // into the floor ("effects below the ground") — skip them.
      const gh = o.geometry && o.geometry.parameters ? o.geometry.parameters.height : 99;
      if (gh <= 0.4) continue;
      const m = new THREE.Mesh(o.geometry, depthMat);
      m.position.copy(o.position); m.quaternion.copy(o.quaternion); m.scale.copy(o.scale);
      this._depthScene.add(m);
    }

    // Fog-wall barriers are transparent haze — the tracer's raster pass DROPS
    // transparent meshes from the main scene, so they'd be invisible there. Move
    // their visuals into the overlay pass (where alpha composites) so the barrier
    // actually shows. The collider stays in bag.boxes and still blocks passage.
    for (const fw of bag.fogWalls || []) {
      if (fw.group.parent) fw.group.parent.remove(fw.group);
      this.overlayScene.add(fw.group);
    }

    this.player = new Player(this.scene, this.overlayScene);
    this.player.spawnAt(bag.spawn);
    this.player.vialCount = bag.startVials || 0;
    // progression: cumulative by level index (never regresses)
    const up = POWER[index] || {};
    if (up.blinkRange) this.player.blinkRange = up.blinkRange;
    if (up.growthCap) this.player.growthCap = up.growthCap;
    if (up.maxHealthCap) this.player.maxHealthCap = up.maxHealthCap;
    if (up.maxHealth) { this.player.maxHealth = up.maxHealth; this.player.health = up.maxHealth; }

    this.wardens = bag.guards.map((spec) => new Warden(this.scene, spec, this.overlayScene));
    this.eyes = (bag.eyes || []).map((spec) => new GreatEye(this.scene, spec));
    // threats = everything that can spot you (wardens + sentinels). Only real
    // wardens have bodies / are devourable, so they stay a separate list too.
    this.threats = [...this.wardens, ...this.eyes];

    // snapshot the scene's lights so the gem can sum their real contribution
    this._collectLights();
    this._occludedT = 0; this._camHintCd = 3; this._camHintCount = 0; // fresh camera-hint state

    this.camDist = 1; this.camYaw = 0; // reset view each level
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 160);
    this.camera.position.copy(bag.spawn).add(this._camOffset());
    this.camera.lookAt(bag.spawn);

    bootMsg.textContent = "tracing light…";
    const t0 = performance.now();
    this.rt.compileScene(this.scene, {
      dynamicMeshes: [this.player.mesh, ...this.wardens.map((w) => w.body)],
    });
    console.log(`[umbral] ${bag.name} compiled in ${Math.round(performance.now() - t0)}ms:`,
      this.rt.compiled ? `${this.rt.compiled.triangleCount} tris, ${this.rt.compiled.lightCount} lights` : "unsupported platform");
    if (this.rt.supported) {
      this.rt.volumetric.zones = bag.fogZones.slice(0, 8).map((z) => ({ min: z.min, max: z.max, density: z.density }));
      // reflective pools are a mechanic here — force traced reflections on so
      // the player can SEE guard cones (and their own tell) in the mirror.
      if (bag.reflectors && bag.reflectors.length) this.rt.reflections = true;
    }

    // sound-made-visible ring system (fresh per scene) — in the overlay pass
    this.noise = new NoiseRings(this.overlayScene);

    // state
    this.alerts = 0; this.caughtCount = 0; this.kos = 0; this.vialsUsed = 0;
    this.elapsed = 0;
    this.guardSpeedMul = 1;
    this.scepterTaken = false;
    this.maxDanger = 0;
    this.checkpoint.copy(bag.spawn);
    this.setObjective(bag.objective);
    this.state = "playing";
    this.hud.show(true);
    this.input.clearActions();
    this._onResize();

    if (!this.rtSupported) {
      this.hud.prompt("Ray tracing is not supported on this device — running flat-lighting fallback.", 6);
    } else if (index === 0) {
      this.hud.prompt(this.isTouch
        ? "You are the dark between stars. <b>Push the left stick</b> to move. In <b>shadow</b> you are unseen — and <b>swift and silent</b>. The light betrays you."
        : "You are the dark between stars. <b>Move</b> — <span class='keycap'>W</span><span class='keycap'>A</span><span class='keycap'>S</span><span class='keycap'>D</span> or arrows. In <b>shadow</b> you are unseen — and <b>swift and silent</b>. The light betrays you.", 9);
    } else if (bag.onStart) {
      bag.onStart(this);
    }
    setTimeout(() => boot.classList.add("hidden"), 120);
  }

  setObjective(text) { this.hud.setObjective(text); }
  onAlert() { this.alerts++; }

  onCaught(x, z) {
    if (this.state !== "playing") return;
    const result = this.player.hit(x, z);
    if (result === null) return; // still invulnerable from the last hit
    this.hud.caughtFlash();
    if (result === "dead") {
      this.caughtCount++;
      this.sfx.caught();
      this._respawn();
    } else {
      this.sfx.hitFlesh();
      // the knockback + a moment of confusion buys the escape: hunting
      // wardens lose the trail and have to re-acquire
      for (const w of this.wardens) {
        if (w.state === "chase") {
          w.state = "suspect";
          w.alertness = Math.min(w.alertness, 0.55);
          w.lostT = 0;
          w.scanT = 0;
        }
      }
    }
  }

  _respawn() {
    this.player.spawnAt(this.checkpoint);
    this.player.healFull();
    for (const w of this.threats) w.reset();
    this.maxDanger = 0;
    this.rt.resetAccumulation();
    this.camera.position.copy(this.checkpoint).add(this._camOffset());
  }

  pause() {
    if (this.state !== "playing") return;
    this.state = "paused";
    this._show("pause");
    this.input.clearActions();
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this._hideOverlays();
    this.input.clearActions();
  }

  _win() {
    if (this.state !== "playing") return;
    this.state = "win";
    this.sfx.win();
    const t = this.elapsed;
    const rating = this.alerts === 0 && this.kos === 0 && this.caughtCount === 0 ? "GHOST"
      : this.alerts <= 2 && this.caughtCount <= 1 ? "SHADE" : "PROWLER";
    const name = LEVELS[this.levelIndex].name;
    const prev = this.progress.best[name];
    if (!prev || t < prev.time) {
      this.progress.best[name] = { time: t, rating };
    }
    if (this.levelIndex + 1 < LEVELS.length) {
      this.progress.unlocked = Math.max(this.progress.unlocked, this.levelIndex + 1);
    }
    this._saveProgress();

    document.getElementById("winTitle").textContent = name + " — CLEARED";
    document.getElementById("winRating").textContent = rating;
    document.getElementById("winTime").textContent = t.toFixed(1) + "s";
    document.getElementById("winAlerts").textContent = this.alerts;
    document.getElementById("winKOs").textContent = this.kos;
    document.getElementById("winVials").textContent = this.vialsUsed;
    const best = this.progress.best[name];
    document.getElementById("winBest").textContent = `best — ${best.time.toFixed(1)}s · ${best.rating}`;
    document.getElementById("btnNext").style.display =
      this.levelIndex + 1 < LEVELS.length ? "" : "none";
    this._show("win");
  }

  // ---------------- queries ----------------

  /** Line-of-sight between two world points against level occluders. */
  los(x0, y0, z0, x1, y1, z1) {
    const dir = this._tmpV.set(x1 - x0, y1 - y0, z1 - z0);
    const dist = dir.length();
    if (dist < 0.001) return true;
    dir.divideScalar(dist);
    this._ray.set(new THREE.Vector3(x0, y0, z0), dir);
    this._ray.far = dist - 0.15;
    return this._ray.intersectObjects(this.level.occluders, false).length === 0;
  }

  /**
   * Collect the level's ambient lights (moon + fills) once, so _computePlayerVis
   * can sum their real contribution. Torches / warden spots / scepter are read
   * from their own lists; these are the raw scene lights nothing else tracks.
   */
  _collectLights() {
    this._lights.length = 0;
    this.scene.traverse((o) => {
      if (!o.isLight) return;
      // moon (dir) + every point light: torches, fills, dormant lamps, scepter.
      // Warden/eye SpotLights are handled separately (cone logic), so skip them.
      if (o.isDirectionalLight) this._lights.push({ kind: "dir", light: o });
      else if (o.isPointLight) this._lights.push({ kind: "point", light: o });
    });
  }

  /**
   * How lit is the player right now? Drives the gem AND warden vision.
   *
   * The tracer runs gi:false — the picture IS direct light + emissive. So we sum
   * the real scene lights' contribution at the blob's feet, each gated by
   * line-of-sight (a wall or building between you and a light = shadow, exactly
   * as rendered), and normalize. Deterministic → unit-testable, and it tracks
   * what's on screen because it computes the same thing the screen does.
   */
  _computePlayerVis() {
    const p = this.player.pos;
    const px = p.x, pz = p.z;
    let raw = VIS_ENV;

    // point lights: torches, fills, dormant lamps, the scepter (all PointLights).
    // INVERSE-SQUARE pool on the ground plane — bright on the light, gone within a
    // few metres — so a torch across the room does NOT light a dark corner.
    for (const L of this._lights) {
      const lt = L.light;
      if (L.kind === "dir") {
        // moon / key: uniform unless a building blocks the sightline to the sky
        if (lt.intensity <= 0.001) continue;
        const dir = this._tmpDir.copy(lt.position).sub(lt.target ? lt.target.position : this._origin);
        if (dir.lengthSq() < 1e-6) continue;
        dir.normalize();
        const sx = px + dir.x * 40, sy = 0.5 + dir.y * 40, sz = pz + dir.z * 40;
        if (!this.los(sx, sy, sz, px, 0.5, pz)) continue;
        raw += lt.intensity * VIS_MOON;
      } else {
        const lp = lt.position;
        const dist = lt.distance || 20;
        const d = Math.hypot(lp.x - px, lp.z - pz);
        if (d >= dist || lt.intensity <= 0.001) continue;
        if (!this.los(lp.x, lp.y, lp.z, px, 0.5, pz)) continue;
        const win = 1 - (d / dist) * (d / dist);      // smooth cutoff at range
        raw += lt.intensity * win / (1 + d * d);       // inverse-square core
      }
    }

    // warden + sentinel spot cones — a focused beam ON you lights you (and gives
    // you away). Gentler falloff than a torch: a spotlight reaches across its cone.
    for (const w of this.threats) {
      if (w.state === "out" || w.blind || !w.light) continue;
      const d = Math.hypot(w.pos.x - px, w.pos.z - pz);
      const range = w.spec.range;
      if (d > range) continue;
      const toP = Math.atan2(pz - w.pos.z, px - w.pos.x);
      let diff = toP - w.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const adiff = Math.abs(diff);
      if (adiff > w.spec.coneAngle) continue;
      if (!this.los(w.pos.x, 2.2, w.pos.z, px, 0.5, pz)) continue;
      const centering = 1 - Math.min(1, adiff / w.spec.coneAngle);
      const f = 1 - d / range;
      raw += w.light.intensity * 0.25 * f * f * (0.4 + 0.6 * centering);
    }

    // the relic is a blazing beacon strapped to you — always reads exposed
    let vis = raw / VIS_NORM;
    if (this.level.scepter && this.scepterTaken) vis = Math.max(vis, 0.62);
    return Math.min(1, Math.max(0.06, vis));
  }

  /**
   * A sound was made at (x,z) that carries `radius` world units.
   * opts: { surface, type, loud, silentSfx } — see NoiseRings.emit.
   * Wardens (and the Great Eye) hear it; the ring makes it visible.
   */
  /** How thick is the fog cover at (x,z)? 0 = clear, 1 = you all but vanish. */
  _fogCoverAt(x, z) {
    let c = 0;
    for (const zn of this.level.fogZones) {
      if (x >= zn.min[0] && x <= zn.max[0] && z >= zn.min[2] && z <= zn.max[2]) {
        const conceal = zn.conceal != null ? zn.conceal : Math.min(0.8, (zn.density || 0) * 110);
        if (conceal > c) c = conceal;
      }
    }
    return c;
  }

  _onNoise(x, z, radius, opts = {}) {
    const surface = typeof opts === "string" ? opts : opts.surface;
    const o = typeof opts === "string" ? { surface } : opts;
    this.hud.noisePulse(Math.min(1, radius / 11));
    if (!o.silentSfx) this.sfx.step(Math.min(1, radius / 9), surface);
    for (const w of this.threats) w.hearNoise(x, z, radius, this);
    this.noise.emit(x, z, radius, o);
  }

  _onVialLand(x, z) {
    this.vialsUsed++;
    this.sfx.splash();
    // dual-use: the shatter is a LOUD lure — wardens (and the Snuffed) hear it
    // and come investigate, so a vial both douses a light AND draws a crowd
    // away. A wide teal ring shows the douse reach.
    this._onNoise(x, z, 10, { type: "vial", loud: 0.6, silentSfx: true });
    this.noise.emit(x, z, DOUSE_RADIUS * 2, { type: "vial", loud: 0.5, gain: 0.7 });
    let hit = false;
    for (const tc of this.level.torches) {
      if (tc.doused) continue;
      if (Math.hypot(tc.x - x, tc.z - z) < DOUSE_RADIUS) {
        tc.doused = true;
        tc.light.intensity = 0;
        tc.flame.material.emissiveIntensity = 0.12;
        tc.flame.scale.setScalar(0.55);
        hit = true;
      }
    }
    if (hit) this.hud.prompt("The flame dies with a sigh.", 2.5);
  }

  // ---------------- per-frame ----------------

  _step(dt, t) {
    const { input, level, player } = this;
    input.poll();

    if (input.consume("pause")) { this.pause(); return; }
    if (input.consume("mute")) { this.settings.sound = !this.settings.sound; this.settings.apply(); }

    // keyboard camera: , / . orbit, - / = zoom
    const k = input.keys;
    if (k.has(",")) this.camYaw -= dt * 1.7;
    if (k.has(".")) this.camYaw += dt * 1.7;
    if (k.has("-")) { this.camDist += dt * 1.1; this._clampZoom(); }
    if (k.has("=") || k.has("+")) { this.camDist -= dt * 1.1; this._clampZoom(); }

    // movement is camera-relative: rotate the input by the orbit so "up" is
    // always away from the camera, whatever the yaw
    if (this.camYaw) {
      const cs = Math.cos(this.camYaw), sn = Math.sin(this.camYaw);
      const mx = input.move.x * cs - input.move.z * sn;
      const mz = input.move.x * sn + input.move.z * cs;
      input.move.x = mx; input.move.z = mz;
    }

    this.elapsed += dt;
    this.playerSneaking = input.sneak;

    // movement + footsteps
    player.move(dt, {
      input, level,
      litness: this.litness,   // last frame's how-lit-am-I → shadow speed & silence
      surfaceAt: (x, z) => surfaceAt(x, z, level.surfaces),
      surfaceMult: (type) => SURFACES[type].mult,
      onNoise: (x, z, r, s) => this._onNoise(x, z, r, s),
      sfx: this.sfx,
    });

    // hard safety net: a hard fling must never punt the blob out of the world
    const b = level.bounds;
    if (b && (player.pos.x < b.x0 || player.pos.x > b.x1 || player.pos.z < b.z0 || player.pos.z > b.z1)) {
      player.pos.x = Math.min(b.x1, Math.max(b.x0, player.pos.x));
      player.pos.z = Math.min(b.z1, Math.max(b.z0, player.pos.z));
      player.vel.set(0, 0, 0);
      player.launch = 0;
    }

    // actions
    if (input.consume("blink")) player.tryBlink({
      input, level, sfx: this.sfx,
      blinkCdMul: level.blinkCdMul ?? 1,
      onBlink: (ox, oz, nx, nz) => {
        // silent, violet: a quick gather at the origin and a shock at the landing
        this.noise.emit(ox, oz, 1.6, { type: "blink", loud: 0.55, gain: 0.7 });
        this.noise.emit(nx, nz, 2.6, { type: "blink", loud: 0.7 });
      },
    });
    if (input.consume("vial")) {
      if (player.vialCount > 0) player.throwVial({ input, level, sfx: this.sfx });
      else this.sfx.blinkFail();
    }
    if (input.consume("strike")) {
      let bestD = 1e9, bestW = null;
      for (const w of this.wardens) {
        if (w.state === "out" || w.noDevour) continue;
        const d = Math.hypot(w.pos.x - player.pos.x, w.pos.z - player.pos.z);
        if (d < bestD) { bestD = d; bestW = w; }
      }
      if (bestW && bestD < SWALLOW_RANGE) {
        const behind = bestW.isBehind(player.pos.x, player.pos.z);
        if (behind && player.mawCharges > 0) {
          // FEAST — swallow the warden from behind, grow, flash red
          bestW.devour(this);
          player.beginDevour(bestW.pos.x, bestW.pos.z);
          this.kos++;
          this.sfx.devour();
          this.noise.emit(player.pos.x, player.pos.z, 3.0, { type: "devour", loud: 0.4 });
          this.hud.prompt("You swallow it whole. You grow.", 1.8);
        } else if (behind) {
          // hungry but empty — a shove that only startles
          bestW.stagger(this);
          this.sfx.whiff();
          this.hud.prompt("Your maw is empty — feed on a <b>crimson mote</b> first.", 2.2);
        } else {
          // caught from the front — it feels the strike and turns
          bestW.tryStrike(player.pos.x, player.pos.z, this);
          this.sfx.whiff();
        }
      } else {
        this.sfx.whiff();
      }
    }

    // falling into the void
    if (player.falling <= 0 && !player.frozen && pointInHole(player.pos.x, player.pos.z, level.holes)) {
      player.falling = 0.7;
      player.frozen = true;
      this.sfx.blink(); // a wailing whoosh as the void takes you
    }
    if (player.frozen && player.falling <= 0) this._respawn();

    // checkpoints
    for (const cp of level.checkpoints) {
      if (Math.hypot(cp.x - player.pos.x, cp.z - player.pos.z) < cp.r) {
        this.checkpoint.copy(cp.spawn);
      }
    }
    // triggers
    for (const tr of level.triggers) {
      if (!tr.fired && Math.hypot(tr.x - player.pos.x, tr.z - player.pos.z) < tr.r) {
        tr.fired = true;
        if (level.onTrigger) level.onTrigger(tr.id, this);
      }
    }
    // caches (auto-pickup, refill after a while)
    for (const c of level.caches) {
      if (!c.taken && Math.hypot(c.x - player.pos.x, c.z - player.pos.z) < 1.2) {
        c.taken = true;
        c.respawnT = 15;
        c.mesh.visible = false;
        player.vialCount = Math.min(6, player.vialCount + c.n);
        this.sfx.pickup();
        this.hud.prompt(`+${c.n} void vials`, 2);
      }
      if (c.taken) {
        c.respawnT -= dt;
        if (c.respawnT <= 0) { c.taken = false; c.mesh.visible = true; }
      }
    }
    // crimson maw motes — charge a devour
    for (const m of level.maws) {
      m.mesh.rotation.y += dt * 1.5;
      m.mesh.position.y = 0.55 + Math.sin(t * 2.4 + m.x) * 0.08;
      if (!m.taken && Math.hypot(m.x - player.pos.x, m.z - player.pos.z) < 1.2) {
        m.taken = true;
        m.mesh.visible = false;
        player.mawCharges = Math.min(3, player.mawCharges + 1);
        this.sfx.pickup();
        this.hud.prompt("A <b>crimson mote</b> — your eyes kindle red. Strike from behind to <b>swallow</b>.", 3);
      }
    }
    // scepter interact
    this.interactHint = false;
    const sc = level.scepter;
    if (sc && !this.scepterTaken) {
      const d = Math.hypot(sc.x - player.pos.x, sc.z - player.pos.z);
      if (d < 1.7) {
        this.interactHint = true;
        if (input.consume("interact")) {
          this.scepterTaken = true;
          this.sfx.scepter();
          // the beacon ignites: it makes you FAST but blazing — the escape is
          // an outrun, not a sneak
          player.carrySpeedMul = 2.4;
          if (sc.light) { sc.light.intensity = 14; sc.light.distance = 16; }
          if (sc.core) sc.core.material.emissiveIntensity = 7;
          if (level.onAlarm) level.onAlarm(this);
          else this.setObjective("Escape to the rift!");
        }
      }
    }
    // extraction / win
    if (level.extract) {
      const d = Math.hypot(level.extract.x - player.pos.x, level.extract.z - player.pos.z);
      if (d < 1.5 && (!sc || this.scepterTaken)) this._win();
    }

    // fog-wall barriers: idle shimmer + dissipate once opened. (Fog is no longer
    // a concealment mechanic — shadow alone hides you; fog means "barrier".)
    if (level.fogWalls) for (const fw of level.fogWalls) fw.update(dt, t);

    // vision + wardens
    this.playerVis = this._computePlayerVis();
    // how lit am I, 0 (pitch dark) → 1 (fully exposed) — drives shadow-speed,
    // footstep loudness, and the gem. Ambient floor (0.06) reads as full dark.
    this.litness = Math.min(1, Math.max(0, (this.playerVis - 0.06) / 0.64));
    this.maxDanger = 0;
    this.spotting = 0; // hottest awareness among wardens who can see me RIGHT NOW
    for (const w of this.threats) {
      w.update(dt, t, this);
      const danger = w.state === "chase" || w.state === "alarm" ? 1 : w.alertness * 0.75;
      if (danger > this.maxDanger) this.maxDanger = danger;
      if (w.canSeePlayer && w.alertness > this.spotting) this.spotting = w.alertness;
    }

    // gate fade-out
    for (const g of level.gates) {
      if (g.opened && g.mesh.userData.fade > 0) {
        g.mesh.userData.fade = Math.max(0, g.mesh.userData.fade - dt * 1.7);
        g.mesh.material.opacity = 0.35 * g.mesh.userData.fade;
        if (g.mesh.userData.fade <= 0) g.mesh.visible = false;
      }
    }
    // sound rings
    this.noise.update(dt);

    if (level.update) level.update(t, dt, this);

    player.update(dt, t, {
      onVialLand: (x, z) => this._onVialLand(x, z),
      sfx: this.sfx,
    });

    // light + dynamic sync for the tracer
    this.rt.updateLights(this.scene);
    this.rt.updateDynamic();

    // camera follows with a little velocity lead, at the current zoom + orbit
    const off = this._camOffset();
    const lead = 0.4;
    this._camPos.set(
      player.pos.x + off.x + player.vel.x * lead * 0.2,
      off.y,
      player.pos.z + off.z + player.vel.z * lead * 0.2
    );
    this.camera.position.lerp(this._camPos, 1 - Math.pow(0.001, dt));
    this.camera.lookAt(player.pos.x + player.vel.x * lead * 0.15, 0.4, player.pos.z + player.vel.z * lead * 0.15);

    // camera-obstruction hint: if the blob is hidden behind geometry (a tall
    // building/wall between camera and player) for a few seconds, teach the
    // player they can rotate/zoom around it. Shown a couple of times per level.
    const cp = this.camera.position;
    const blocked = !player.frozen && !this.los(cp.x, cp.y, cp.z, player.pos.x, player.pos.y + 0.35, player.pos.z);
    this._occludedT = blocked ? this._occludedT + dt : 0;
    this._camHintCd = Math.max(0, this._camHintCd - dt);
    if (this._occludedT > 2.5 && this._camHintCd <= 0 && this._camHintCount < 3) {
      this.hud.prompt(this.isTouch
        ? "View blocked? <b>Twist</b> two fingers to rotate the camera, <b>pinch</b> to zoom around it."
        : "View blocked? <b>Right-drag</b> (or <span class='keycap'>,</span> <span class='keycap'>.</span>) to rotate, <b>scroll</b> (or <span class='keycap'>-</span> <span class='keycap'>=</span>) to zoom around it.", 4);
      this._camHintCd = 22;
      this._camHintCount++;
      this._occludedT = 0;
    }

    // live effects-opacity setting → in-world overlays
    const fxo = this.settings.overlayOpacity ?? 1;
    if (this.noise) this.noise.opacity = fxo;
    this.player.fxOpacity = fxo;

    this.hud.update(dt, this);
  }

  _loop() {
    requestAnimationFrame(this._loop);
    if (document.visibilityState === "hidden") { this._lastT = performance.now(); return; }
    const now = performance.now();
    const dt = Math.min((now - this._lastT) / 1000, 0.05);
    this._lastT = now;
    const t = now / 1000;

    if (this.state === "playing") {
      this._step(dt, t);
    } else {
      // consume stray actions so they don't queue up in menus
      this.input.consume("blink"); this.input.consume("strike");
      this.input.consume("vial"); this.input.consume("interact");
      if (this.state === "paused" && this.input.consume("pause")) this.resume();
      else this.input.consume("pause");
    }

    if (this.scene && this.camera && this.rt) {
      this.rt.render(this.scene, this.camera);
      // The ray tracer's raster pass drops transparent overlays (GBufferPass
      // hides opacity < 0.5). So draw the in-world HUD effects — sound rings,
      // reticles, fog barriers, trails — in a plain forward pass over the traced
      // image, where normal alpha blending works. First lay down the solid
      // geometry's DEPTH (colour-less) so those effects are hidden BEHIND walls
      // instead of showing through them.
      if (this.overlayScene) {
        this.renderer.autoClear = false;
        this.renderer.clearDepth();
        if (this._depthScene) this.renderer.render(this._depthScene, this.camera);
        this.renderer.render(this.overlayScene, this.camera);
        this.renderer.autoClear = true;
      }
      if (!this._booted) { this._booted = true; boot.classList.add("hidden"); }
    }
  }
}

try {
  new Game();
} catch (err) {
  console.error(err);
  boot.classList.remove("hidden");
  const isWebGL = (err && err.webgl) || /webgl|context/i.test(String(err && err.message));
  boot.innerHTML = isWebGL
    ? `<div class="err"><b>3D graphics (WebGL) couldn't start.</b>\n\nUmbral renders with WebGL, and your browser couldn't create it — almost always because <b>hardware acceleration is turned off</b>.\n\n<b>Chrome / Edge:</b> Settings → System → turn ON “Use hardware acceleration when available”, then fully quit and reopen the browser.\n\nIf that doesn't help: update your graphics drivers, or open <b>chrome://gpu</b> to see what's blocked. A WebGL2-capable GPU is required.</div>`
    : `<div class="err"><b>Failed to start.</b>\n\n${err && err.message ? err.message : err}\n\nSee the console for details.</div>`;
}
