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
import { buildMission1 } from "./levels/mission1.js";
import { buildVault } from "./levels/vault.js";

const LEVELS = [
  { name: "THE ASHWAY", build: buildTutorial },
  { name: "BRIGHTWARD", build: buildMission1 },
  { name: "THE RELIQUARY", build: buildVault },
];
const CAM_OFFSET = new THREE.Vector3(0, 12.5, 6.3);
const PROGRESS_KEY = "umbral.progress";

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
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
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
      envColor: new THREE.Color(0x101527),
      envIntensity: 0.9,
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

    this.player = new Player(this.scene, this.overlayScene);
    this.player.spawnAt(bag.spawn);
    this.player.vialCount = bag.startVials || 0;

    this.wardens = bag.guards.map((spec) => new Warden(this.scene, spec));
    this.eyes = (bag.eyes || []).map((spec) => new GreatEye(this.scene, spec));
    // threats = everything that can spot you (wardens + sentinels). Only real
    // wardens have bodies / are devourable, so they stay a separate list too.
    this.threats = [...this.wardens, ...this.eyes];

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
        ? "You are the dark between stars. <b>Push the left stick</b> to move — gently to creep, fully to flow."
        : "You are the dark between stars. <b>Move</b> — <span class='keycap'>W</span><span class='keycap'>A</span><span class='keycap'>S</span><span class='keycap'>D</span> or arrows.", 9);
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

  /** How lit is the player right now? Drives the gem AND warden vision. */
  _computePlayerVis() {
    const p = this.player.pos;
    let vis = 0.06; // ambient floor — the world is never fully black
    // warden + sentinel cones (the Snuffed is dark — it lights nothing)
    for (const w of this.threats) {
      if (w.state === "out" || w.blind) continue;
      const d = Math.hypot(w.pos.x - p.x, w.pos.z - p.z);
      const range = w.spec.range;
      if (d > range) continue;
      const toP = Math.atan2(p.z - w.pos.z, p.x - w.pos.x);
      let diff = toP - w.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) > w.spec.coneAngle) continue;
      if (!this.los(w.pos.x, 2.2, w.pos.z, p.x, 0.5, p.z)) continue;
      vis = Math.max(vis, 1 - d / range);
    }
    // static light sources: torches, dormant lamps, the scepter
    const pointSrc = (x, y, z, range, k) => {
      const d = Math.hypot(x - p.x, z - p.z);
      if (d > range) return;
      if (!this.los(x, y, z, p.x, 0.5, p.z)) return;
      vis = Math.max(vis, k * (1 - d / range));
    };
    for (const tc of this.level.torches) {
      if (tc.doused) continue;
      pointSrc(tc.x, 2.3, tc.z, tc.light.distance || 9, 0.9);
    }
    for (const d of this.level.dormant) {
      if (d.light.intensity <= 0.05) continue;
      pointSrc(d.light.position.x, 3.2, d.light.position.z, 13, 0.85);
    }
    const s = this.level.scepter;
    if (s) {
      if (this.scepterTaken) vis = Math.max(vis, 0.62); // the relic betrays you
      else pointSrc(s.x, 1.9, s.z, 8, 0.8);
    }
    return Math.min(1, vis);
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

    // fog concealment — blunts warden vision while the blob is in the mist
    this.fogCover = this._fogCoverAt(player.pos.x, player.pos.z);
    this.playerConcealed = this.fogCover > 0.35;

    // drifting fog banks
    if (level.fogGroups) {
      for (const grp of level.fogGroups) {
        for (const m of grp.children) {
          const u = m.userData;
          m.position.x = u.baseX + Math.sin(t * u.drift + u.phase) * 1.1;
          m.position.z = u.baseZ + Math.cos(t * u.drift * 0.8 + u.phase) * 0.9;
          m.rotation.z = t * u.drift * 0.3;
        }
      }
    }

    // vision + wardens
    this.playerVis = this._computePlayerVis();
    this.maxDanger = 0;
    for (const w of this.threats) {
      w.update(dt, t, this);
      const danger = w.state === "chase" || w.state === "alarm" ? 1 : w.alertness * 0.75;
      if (danger > this.maxDanger) this.maxDanger = danger;
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
      // reticles, aura, trails — in a plain forward pass ON TOP of the traced
      // image, where normal alpha blending works.
      if (this.overlayScene) {
        this.renderer.autoClear = false;
        this.renderer.clearDepth();
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
  boot.innerHTML = `<div class="err"><b>Failed to start.</b>\n\n${err && err.message ? err.message : err}\n\nSee the console for details.</div>`;
}
