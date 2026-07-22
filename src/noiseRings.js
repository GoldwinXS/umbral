import * as THREE from "three";

/**
 * Sound made visible — thin expanding RING OUTLINES that radiate from the
 * player, drawn in the HUD crosshair's teal. Loudness is the read:
 *   REACH (max radius) = how far it carries · SPEED = urgency
 *   THICKNESS (line count + natural band) = loudness · COLOUR = source
 *
 * These are flat RING MESHES (annuli), NOT lines: the ray tracer composites
 * mesh triangles but not line primitives, so meshes are what actually show up.
 * rtExclude keeps them out of the BVH — pure overlay that lights nothing.
 */

// Same teal LANGUAGE as the HUD crosshair (0x39f0c0), lightly tinted by surface.
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
  alarm:  new THREE.Color(0xff8a2a), // amber pulse — a guard raising a local alarm
};

export class NoiseRings {
  constructor(scene, pool = 40) {
    this.scene = scene;
    this.opacity = 1;   // global multiplier from the Effects-opacity setting
    this.rings = [];
    // a thin unit annulus (radius ~1); scaling grows the ring, band stays
    // proportional so a loud/large ring reads as a slightly thicker band
    const geo = new THREE.RingGeometry(0.955, 1.0, 64);
    for (let i = 0; i < pool; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;      // lay it flat on the ground
      m.visible = false;
      m.userData.rtExclude = true;
      m.renderOrder = 4;
      scene.add(m);
      this.rings.push({ mesh: m, active: false, t: 0, dur: 1, maxR: 1, peak: 0.6, gain: 1 });
    }
  }

  _free() {
    for (const r of this.rings) if (!r.active) return r;
    let best = this.rings[0];
    for (const r of this.rings) if (r.t > best.t) best = r;
    return best;
  }

  emit(x, z, radius, opts = {}) {
    const loud = opts.loud != null ? opts.loud : Math.min(1, radius / 11);
    const color = opts.type ? EVENT_COLOR[opts.type] : (SURFACE_COLOR[opts.surface] || SURFACE_COLOR.obsidian);
    // quiet creep = a lone faint ring; loud dash = a bright, thick, fast band
    const lines = 1 + Math.round(loud * 3);
    const speed = 3.5 + loud * 6.0;
    const peak = 0.1 + loud * 0.28;    // subtle — a hint of how loud you were
    const reach = Math.max(0.5, radius);
    for (let i = 0; i < lines; i++) {
      const r = this._free();
      r.active = true;
      r.t = 0;
      r.maxR = reach * (1 - i * 0.06);
      r.dur = r.maxR / speed;
      r.peak = peak;
      r.gain = (opts.gain ?? 1) * (1 - i * 0.12);
      const m = r.mesh;
      m.position.set(x, 0.05, z);
      m.material.color.copy(color);
      m.material.opacity = 0;
      m.scale.set(0.02, 0.02, 0.02);
      m.visible = true;
    }
  }

  update(dt) {
    for (const r of this.rings) {
      if (!r.active) continue;
      r.t += dt;
      const f = r.t / r.dur;
      if (f >= 1) { r.active = false; r.mesh.visible = false; continue; }
      const s = Math.max(0.02, f * r.maxR);
      r.mesh.scale.set(s, s, s);
      // hold brightness through the first half, then fade — visible but clean
      r.mesh.material.opacity = r.peak * (1 - f * f) * r.gain * this.opacity;
    }
  }

  reset() {
    for (const r of this.rings) { r.active = false; r.mesh.visible = false; }
  }
}
