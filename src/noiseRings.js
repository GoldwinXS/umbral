import * as THREE from "three";

/**
 * Sound made visible. Every noise the player emits spawns one or more ground
 * rings that expand outward. The RING ITSELF is the read:
 *
 *   - RADIUS it reaches  = how far the sound carries (its audible range)
 *   - THICKNESS          = loudness (a soft footfall is a hairline; a smash is a band)
 *   - SPEED of expansion = urgency / sharpness of the sound
 *   - RING COUNT (burst) = a louder event throws several stacked ripples
 *   - COLOUR             = what made it (steps tinted by surface; tools by type)
 *
 * Rings are drawn by a tiny fragment shader on flat ground quads (pooled,
 * rtExclude'd so they stay out of the ray-traced BVH — pure overlay).
 */

const RING_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// r = 0..1 across the quad (0 = centre, 1 = edge). A crisp vector-drawn ring:
// a thin bright stroke at uRadius with a hairline inner echo — reads like the
// HUD crosshair, not a glow. No ground-washing halo.
const RING_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform vec3  uColor;
  uniform float uRadius;   // 0..1 current ring radius in quad space
  uniform float uThick;    // 0..1 half-thickness in quad space
  uniform float uOpacity;  // overall fade
  void main() {
    float r = length(vUv - 0.5) * 2.0;      // 0 at centre, 1 at quad edge
    float d = abs(r - uRadius);
    // crisp main stroke (sharp inner falloff so it looks drawn, not blurred)
    float stroke = smoothstep(uThick, uThick * 0.25, d);
    // a faint hairline just inside, for a little instrument detail
    float echo = smoothstep(uThick * 0.6, 0.0, abs(r - uRadius * 0.86)) * 0.35;
    float a = (stroke + echo) * uOpacity;
    a *= smoothstep(1.0, 0.92, r);          // hide the quad clip
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

const SURFACE_COLOR = {
  crystal:  new THREE.Color(0x9fe8ff), // glassy, bright — rings loud & sharp
  obsidian: new THREE.Color(0xffb478), // stone — warm amber
  moss:     new THREE.Color(0x63c79a), // soft green — barely there
};
const EVENT_COLOR = {
  vial:   new THREE.Color(0x39f0c0),
  blink:  new THREE.Color(0x9a72ff),
  strike: new THREE.Color(0xff5a6e),
  devour: new THREE.Color(0xff2d3d),
  land:   new THREE.Color(0xbfa0ff),
};

export class NoiseRings {
  constructor(scene, pool = 26) {
    this.scene = scene;
    this.rings = [];
    const geo = new THREE.PlaneGeometry(1, 1); // scaled per-ring to 2*maxRadius
    for (let i = 0; i < pool; i++) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending, // no additive white-wash of the ground
        uniforms: {
          uColor: { value: new THREE.Color(0xffffff) },
          uRadius: { value: 0 },
          uThick: { value: 0.05 },
          uOpacity: { value: 0 },
        },
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.visible = false;
      m.userData.rtExclude = true;
      m.renderOrder = 3;
      scene.add(m);
      this.rings.push({ mesh: m, active: false, t: 0, dur: 1, maxR: 1, speed: 1, thick: 0.05, gain: 1 });
    }
  }

  _free() {
    for (const r of this.rings) if (!r.active) return r;
    // steal the oldest if the pool is exhausted
    let best = this.rings[0];
    for (const r of this.rings) if (r.t > best.t) best = r;
    return best;
  }

  /**
   * Emit a sound event.
   *   x,z      world position
   *   radius   how far it carries (world units) — sets ring reach + loudness
   *   opts.surface   surface name (tints step rings)
   *   opts.type      "vial" | "blink" | "strike" | "devour" | "land" (tints tool rings)
   *   opts.loud      0..1 override loudness (thickness/burst); defaults from radius
   */
  emit(x, z, radius, opts = {}) {
    const loud = opts.loud != null ? opts.loud : Math.min(1, radius / 11);
    const color = opts.type ? EVENT_COLOR[opts.type] : (SURFACE_COLOR[opts.surface] || SURFACE_COLOR.obsidian);
    const burst = 1 + Math.floor(loud * 1.8);   // louder → more stacked ripples
    const speed = 3.0 + loud * 6.0;             // louder → faster leading edge
    const thick = 0.03 + loud * 0.08;           // louder → thicker stroke
    for (let i = 0; i < burst; i++) {
      const r = this._free();
      r.active = true;
      r.t = -i * 0.09;                          // stagger the burst
      r.maxR = Math.max(0.6, radius) * (1 - i * 0.12);
      r.speed = speed;
      r.dur = r.maxR / speed;
      r.thick = thick * (1 - i * 0.18);
      r.gain = (opts.gain ?? 1) * (1 - i * 0.22);
      const m = r.mesh;
      m.position.set(x, 0.05 + i * 0.002, z);
      m.scale.set(r.maxR * 2, r.maxR * 2, 1);
      m.material.uniforms.uColor.value.copy(color);
      m.material.uniforms.uThick.value = r.thick / r.maxR; // world thick → frag units (frag r=1 ↔ maxR)
      m.material.uniforms.uOpacity.value = 0;
      m.visible = true;
    }
  }

  update(dt) {
    for (const r of this.rings) {
      if (!r.active) continue;
      r.t += dt;
      if (r.t < 0) { r.mesh.material.uniforms.uOpacity.value = 0; continue; }
      const f = r.t / r.dur;                    // 0..1 life
      if (f >= 1) { r.active = false; r.mesh.visible = false; continue; }
      const u = r.mesh.material.uniforms;
      // frag radius 1.0 ↔ maxR world; grow 0 → maxR over the ring's life
      u.uRadius.value = f;
      u.uOpacity.value = (0.7 * (1 - f) + 0.15) * r.gain;
    }
  }

  reset() {
    for (const r of this.rings) { r.active = false; r.mesh.visible = false; }
  }
}
