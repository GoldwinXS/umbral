import * as THREE from "three";

/**
 * Sound made visible — as clean expanding RING OUTLINES that radiate from the
 * player, drawn like the HUD crosshair (thin vector lines, never a fill).
 *
 * Each footfall/tool sound emits a "band" of one or more concentric line-loops:
 *   - REACH   (max radius)     = how far the sound carries
 *   - SPEED   (expansion rate) = urgency / sharpness
 *   - THICKNESS (line count)   = loudness — a soft step is a single hairline,
 *                                a smash is a thick band of stacked rings
 *   - COLOUR                   = what made it (surface tint / tool type)
 *   - FREQUENCY (how often)    = driven by stride, upstream
 *
 * These are real LineLoop circles (1px), rtExclude'd, so they are pure overlay
 * and can never wash the floor to a bright fill (the old shader-plane did).
 */

const SEG = 72;
function circleGeometry() {
  const pts = [];
  for (let i = 0; i <= SEG; i++) {
    const a = (i / SEG) * Math.PI * 2;
    pts.push(Math.cos(a), 0, Math.sin(a)); // unit circle in the XZ (ground) plane
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

// Same teal LANGUAGE as the HUD crosshair (0x39f0c0), lightly tinted by surface
// so louder/harsher floors still read distinct — but never white.
const SURFACE_COLOR = {
  crystal:  new THREE.Color(0x39f0c0), // glassy — the crosshair teal
  obsidian: new THREE.Color(0x46d8e6), // stone — cyan
  moss:     new THREE.Color(0x5ce6a4), // soft — mint
};
const EVENT_COLOR = {
  vial:   new THREE.Color(0x39f0c0),
  blink:  new THREE.Color(0x9a72ff),
  strike: new THREE.Color(0xff5a6e),
  devour: new THREE.Color(0xff2d3d),
  land:   new THREE.Color(0xbfa0ff),
};

export class NoiseRings {
  constructor(scene, pool = 40) {
    this.scene = scene;
    this.rings = [];
    const geo = circleGeometry();
    for (let i = 0; i < pool; i++) {
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
      const m = new THREE.LineLoop(geo, mat);
      m.visible = false;
      m.userData.rtExclude = true;
      m.renderOrder = 4;
      scene.add(m);
      this.rings.push({ mesh: m, active: false, t: 0, dur: 1, maxR: 1, gain: 1 });
    }
  }

  _free() {
    for (const r of this.rings) if (!r.active) return r;
    let best = this.rings[0];
    for (const r of this.rings) if (r.t > best.t) best = r;
    return best;
  }

  /**
   * Emit a sound.
   *   radius   how far it carries (world units) → reach + loudness
   *   opts.surface / opts.type   colour
   *   opts.loud  0..1 loudness override (line-count + brightness)
   *   opts.gain  overall opacity scale
   */
  emit(x, z, radius, opts = {}) {
    const loud = opts.loud != null ? opts.loud : Math.min(1, radius / 11);
    const color = opts.type ? EVENT_COLOR[opts.type] : (SURFACE_COLOR[opts.surface] || SURFACE_COLOR.obsidian);
    // LOUDNESS IS THE READ: a quiet creep is a lone faint hairline; a loud
    // dash is a bright, thick, fast band — so "I was too loud" is obvious.
    const lines = 1 + Math.round(loud * 3);     // 1 … 4 stacked rings (loud = thick band)
    const speed = 3.5 + loud * 6.0;             // louder → faster leading edge
    const peak = 0.28 + loud * 0.6;             // louder → brighter/more visible
    const reach = Math.max(0.5, radius);
    for (let i = 0; i < lines; i++) {
      const r = this._free();
      r.active = true;
      r.t = 0;
      r.maxR = reach * (1 - i * 0.05);          // near-parallel lines → a thick band
      r.dur = r.maxR / speed;
      r.peak = peak;
      r.gain = (opts.gain ?? 1) * (1 - i * 0.12);
      const m = r.mesh;
      m.position.set(x, 0.05, z);
      m.material.color.copy(color);
      m.material.opacity = 0;
      m.scale.setScalar(0.02);
      m.visible = true;
    }
  }

  update(dt) {
    for (const r of this.rings) {
      if (!r.active) continue;
      r.t += dt;
      const f = r.t / r.dur;                     // 0..1 life
      if (f >= 1) { r.active = false; r.mesh.visible = false; continue; }
      r.mesh.scale.setScalar(Math.max(0.02, f * r.maxR));
      // hold brightness through the first half, then fade — visible but clean
      r.mesh.material.opacity = r.peak * (1 - f * f) * r.gain;
    }
  }

  reset() {
    for (const r of this.rings) { r.active = false; r.mesh.visible = false; }
  }
}
