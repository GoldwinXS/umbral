import * as THREE from "three";

/**
 * Level construction kit. A level build returns a plain "bag" that main.js
 * knows how to run:
 *
 *   scene, spawn, boxes[], cylinders[], occluders[], holes[], surfaces[],
 *   guards[] (specs), torches[], caches[], scepter, extract, checkpoints[],
 *   triggers[], gates[], dormant[], fogZones[], objective, startVials,
 *   update?(t,dt,game), onTrigger?(id,game), onAlarm?(game)
 *
 * Colliders are plain data (circle-vs-OBB solver in main.js), so gates can be
 * opened without a BVH recompile — only the *ray traced* scene is structural.
 */

export const SURFACES = {
  moss:     { mult: 0.3,  color: 0x10302a, rough: 1.0,  metal: 0.0 },
  obsidian: { mult: 0.65, color: 0x1b1e26, rough: 0.85, metal: 0.05 },
  // crystal was glossy-metallic (rough .24 / metal .8), which threw shifting
  // white specular hotspots off every torch as you moved. Matte it: still a
  // cool bluish "singing" floor, but no mirror-glare. (Reflective POOLS are a
  // separate, deliberate mechanic.)
  crystal:  { mult: 1.5,  color: 0x46607c, rough: 0.7,  metal: 0.1 },
};

export function makeKit(scene) {
  const mats = {
    floor: new THREE.MeshStandardMaterial({ color: 0x20242f, roughness: 0.88, metalness: 0.05 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x2b3148, roughness: 0.92 }),
    block: new THREE.MeshStandardMaterial({ color: 0x363e56, roughness: 0.8 }),
    pillar: new THREE.MeshStandardMaterial({ color: 0x3d4560, roughness: 0.65, metalness: 0.1 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x171b26, roughness: 0.95 }),
    // prop-library materials — kept dark/desaturated to match the palette above
    wood: new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.92, metalness: 0.02 }),
    rust: new THREE.MeshStandardMaterial({ color: 0x3f2e22, roughness: 0.75, metalness: 0.45 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x2c2e36, roughness: 0.95, metalness: 0.03 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0x3a3a48, roughness: 0.97, metalness: 0.0, side: THREE.DoubleSide }),
  };

  const bag = {
    scene,
    spawn: new THREE.Vector3(),
    boxes: [],      // {x,z,hx,hz,rot,enabled,gate?}
    cylinders: [],  // {x,z,r,enabled}
    occluders: [],
    holes: [],      // {x0,z0,x1,z1}
    surfaces: [],   // {x0,z0,x1,z1,type}
    guards: [],
    eyes: [],       // Great Eye sentinel specs
    torches: [],    // douseable {x,z,light,flame,doused}
    caches: [],     // {id,x,z,n,mesh,taken}
    maws: [],       // crimson devour motes {id,x,z,mesh,taken}
    reflectors: [], // reflective pools {x,z,r} that catch the player's reflection
    scepter: null,
    extract: null,
    checkpoints: [],// {x,z,r,spawn}
    triggers: [],   // {id,x,z,r,fired}
    gates: [],      // {id,mesh,collider,open}
    dormant: [],    // {light,fixture} ignited on alarm
    fogZones: [],
    objective: "",
    startVials: 0,
  };

  const boxGeoCache = new Map();
  function boxGeo(w, h, d) {
    const k = w + "," + h + "," + d;
    if (!boxGeoCache.has(k)) boxGeoCache.set(k, new THREE.BoxGeometry(w, h, d));
    return boxGeoCache.get(k);
  }

  // Deterministic per-call jitter for the prop library: pass a seed to get a
  // repeatable "random" value in [0,1); omit it to just fall back to Math.random
  // (fine to call at prop-build time — only module-scope randomness is banned).
  function rand(seed) {
    if (seed === undefined || seed === null) return Math.random();
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  // soft radial alpha sprite, shared by fog banks (built lazily)
  let _hazeTex = null;
  function hazeTex() {
    if (_hazeTex) return _hazeTex;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g2 = c.getContext("2d");
    const grd = g2.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,0.9)");
    grd.addColorStop(0.5, "rgba(255,255,255,0.4)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g2.fillStyle = grd; g2.fillRect(0, 0, 128, 128);
    _hazeTex = new THREE.CanvasTexture(c);
    return _hazeTex;
  }

  // split a span [a,b] into solid runs around the door gaps [[g0,g1],...]
  function gapsCut(a, b, gaps) {
    const gs = (gaps || []).slice().sort((p, q) => p[0] - q[0]);
    const spans = []; let cur = a;
    for (const [g0, g1] of gs) { if (g0 > cur) spans.push([cur, Math.min(g0, b)]); cur = Math.max(cur, g1); }
    if (cur < b) spans.push([cur, b]);
    return spans;
  }

  const kit = {
    mats,
    bag,

    /** Solid box: mesh + occluder + OBB collider. Walls, crates, cover. */
    solid(w, h, d, x, z, mat = mats.block, rot = 0, y = h / 2) {
      const m = new THREE.Mesh(boxGeo(w, h, d), mat);
      m.position.set(x, y, z);
      m.rotation.y = rot;
      m.userData.fxOcclude = true; // walls/structural cover hide overlay effects
      scene.add(m);
      bag.occluders.push(m);
      bag.boxes.push({ x, z, hx: w / 2, hz: d / 2, rot, enabled: true });
      return m;
    },

    /** Wall segment helper (axis-aligned). */
    wall(w, h, d, x, z, y = h / 2) {
      return kit.solid(w, h, d, x, z, mats.wall, 0, y);
    },

    /**
     * A watertight room with CLEAN corners. Builds the floor (+ optional moss/
     * crystal surface) and four walls. The N/S walls own the corners (they span
     * the full outer width); the E/W walls inset BETWEEN them — so no two wall
     * boxes ever overlap, which is what made corners show a doubled-rectangle
     * seam. `h` sets wall height (verticality — a room can be a tall hall or a
     * low courtyard wall); `wallMat` overrides the material.
     *
     * doors: { n, s, e, w } — each an array of [from,to] gap ranges in WORLD
     * coords (x for n/s walls, z for e/w walls).
     * Returns { x0, z0, x1, z1 } for chaining/connecting.
     */
    room(x0, z0, x1, z1, { doors = {}, surface, floorMat, wallMat = mats.wall, h = 3.2, t = 0.4 } = {}) {
      const ht = t / 2;
      kit.floor(x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, floorMat);
      if (surface) kit.surface(x0, z0, x1, z1, surface);
      const hRun = (z, a, b, gaps) => { for (const [p, q] of gapsCut(a, b, gaps)) if (q - p > 0.02) kit.solid(q - p, h, t, (p + q) / 2, z, wallMat); };
      const vRun = (x, a, b, gaps) => { for (const [p, q] of gapsCut(a, b, gaps)) if (q - p > 0.02) kit.solid(t, h, q - p, x, (p + q) / 2, wallMat); };
      hRun(z1, x0 - ht, x1 + ht, doors.n);   // north — spans full width, owns corners
      hRun(z0, x0 - ht, x1 + ht, doors.s);   // south — owns corners
      vRun(x1, z0 + ht, z1 - ht, doors.e);   // east  — inset between N/S
      vRun(x0, z0 + ht, z1 - ht, doors.w);   // west  — inset
      return { x0, z0, x1, z1 };
    },

    /**
     * A connector between rooms: floor (+ surface) and only the two LONG side
     * walls — the short ends stay open so it joins the rooms through their door
     * gaps. Horizontal if wider than deep, else vertical.
     */
    corridor(x0, z0, x1, z1, { surface, floorMat, wallMat = mats.wall, h = 3.2, t = 0.4 } = {}) {
      const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      kit.floor(w, d, cx, cz, floorMat);
      if (surface) kit.surface(x0, z0, x1, z1, surface);
      if (w >= d) { kit.solid(w, h, t, cx, z0, wallMat); kit.solid(w, h, t, cx, z1, wallMat); }
      else { kit.solid(t, h, d, x0, cz, wallMat); kit.solid(t, h, d, x1, cz, wallMat); }
      return { x0, z0, x1, z1 };
    },

    /** Cylinder: mesh + occluder + circle collider. */
    pillar(r, h, x, z, mat = mats.pillar) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 18), mat);
      m.position.set(x, h / 2, z);
      m.userData.fxOcclude = true; // structural pillar hides overlay effects
      scene.add(m);
      bag.occluders.push(m);
      bag.cylinders.push({ x, z, r, enabled: true });
      return m;
    },

    /** Walkable floor slab (visual + occlusion for LoS raycasts, no collider). */
    floor(w, d, x, z, mat = mats.floor, y = -0.1) {
      const m = new THREE.Mesh(boxGeo(w, 0.2, d), mat);
      m.position.set(x, y, z);
      scene.add(m);
      bag.occluders.push(m);
      return m;
    },

    /** Noise surface region (with a distinct visual plate). */
    surface(x0, z0, x1, z1, type) {
      const s = SURFACES[type];
      bag.surfaces.push({ x0, z0, x1, z1, type });
      const mat = new THREE.MeshStandardMaterial({ color: s.color, roughness: s.rough, metalness: s.metal });
      const m = new THREE.Mesh(boxGeo(x1 - x0, 0.06, z1 - z0), mat);
      m.position.set((x0 + x1) / 2, 0.031, (z0 + z1) / 2);
      scene.add(m);
      bag.occluders.push(m);
      return m;
    },

    /** A void region the player falls into. Adds faint violet rim glow. */
    hole(x0, z0, x1, z1) {
      bag.holes.push({ x0, z0, x1, z1 });
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x000000, emissive: 0x5a3fd0, emissiveIntensity: 1.6, side: THREE.DoubleSide,
      });
      const mk = (w, d, x, z) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), rimMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.02, z);
        scene.add(m);
      };
      mk(x1 - x0, 0.1, (x0 + x1) / 2, z0 + 0.05);
      mk(x1 - x0, 0.1, (x0 + x1) / 2, z1 - 0.05);
      mk(0.1, z1 - z0, x0 + 0.05, (z0 + z1) / 2);
      mk(0.1, z1 - z0, x1 - 0.05, (z0 + z1) / 2);
    },

    /** Static emissive trim — a FREE area light via emissive NEE (no light slot). */
    trim(w, h, x, y, z, rotY, color = 0x8a5cff, intensity = 2.5) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity, side: THREE.DoubleSide })
      );
      m.position.set(x, y, z);
      m.rotation.y = rotY;
      scene.add(m);
      return m;
    },

    /** Douseable torch/lamp: PointLight + pole + rtExclude flame. `scale` makes
     *  a bigger, taller lantern (pass higher intensity/range for a brighter one)
     *  so the map can carry a mix of small and great lanterns. */
    torch(x, z, { color = 0xffb36b, intensity = 6, range = 9, h = 2.2, scale = 1 } = {}) {
      intensity *= 2.2; // global lantern brightness lift — the lamps burn brighter
      const ph = h * scale;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.09 * scale, ph, 8), mats.dark);
      pole.position.set(x, ph / 2, z);
      scene.add(pole);
      // NOTE: the pole is NOT an occluder — a thin stick shouldn't block sight or
      // (crucially) the torch's own light. Adding it made a torch directly
      // overhead self-occlude, so standing on a torch read as unlit.
      const light = new THREE.PointLight(color, intensity, range);
      light.position.set(x, ph + 0.15, z);
      light.userData.rtRadius = 0.12 * scale;
      scene.add(light);
      const flame = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16 * scale),
        new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 5 })
      );
      flame.position.set(x, ph + 0.15, z);
      flame.userData.rtExclude = true; // rasterized glow, stays out of the BVH/NEE
      scene.add(flame);
      const t = { x, z, light, flame, baseIntensity: intensity, doused: false };
      bag.torches.push(t);
      return t;
    },

    /** Light-barrier gate: transparent (BVH-free) mesh + toggleable collider. */
    gate(id, w, x, z, rot = 0, h = 2.6) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x8a5cff, transparent: true, opacity: 0.35, side: THREE.DoubleSide,
        depthWrite: false,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(x, h / 2, z);
      m.rotation.y = rot;
      scene.add(m);
      const collider = { x, z, hx: rot === 0 ? w / 2 : 0.15, hz: rot === 0 ? 0.15 : w / 2, rot: 0, enabled: true };
      bag.boxes.push(collider);
      const g = {
        id, mesh: m, collider, opened: false,
        open() {
          if (this.opened) return;
          this.opened = true;
          collider.enabled = false;
          // fade out over ~0.6s via update loop in main (gates list)
          m.userData.fade = 1;
        },
      };
      bag.gates.push(g);
      return g;
    },

    /** Vial cache — auto-picked-up cluster of void vials. */
    cache(id, x, z, n = 3) {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x39f0c0, emissiveIntensity: 2.2 });
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), mat);
        s.position.set(Math.cos(i * 2.1) * 0.22, 0.35 + i * 0.06, Math.sin(i * 2.1) * 0.22);
        s.userData.rtExclude = true;
        group.add(s);
      }
      group.position.set(x, 0, z);
      scene.add(group);
      const c = { id, x, z, n, mesh: group, taken: false };
      bag.caches.push(c);
      return c;
    },

    /**
     * DEPRECATED / no-op. Fog is no longer a stealth-cover mechanic — the ONLY
     * meaning of fog now is a barrier (see fogWall). Kept as a stub so existing
     * level calls don't break; it registers no concealment and draws no haze.
     * (Shadow is the sole invisibility mechanic.)
     */
    fogPatch() {
      return new THREE.Group();
    },

    /**
     * A FOG WALL: a dense, drifting curtain of mist that PLUGS a doorway. Unlike
     * fogPatch (thin ground haze / stealth cover), this reads as a solid barrier
     * — it blocks passage with a collider and clearly says "not yet." Call
     * .open() when the section's condition is met and the curtain lifts and
     * thins away over ~1.2s. Reusable gating cue for any level.
     *
     * rot 0 → the doorway faces ±z (curtain spans x); rot Math.PI/2 → faces ±x.
     */
    fogWall(x, z, w, { h = 3.4, rot = 0, color = 0xb7c8ec, thick = 0.7 } = {}) {
      const collider = {
        x, z,
        hx: rot === 0 ? w / 2 : thick, hz: rot === 0 ? thick : w / 2,
        rot: 0, enabled: true,
      };
      bag.boxes.push(collider);

      const tex = hazeTex();
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;

      // A VOLUME of billboarded sprites filling the doorway box. Sprites always
      // face the camera, so the cloud reads as a genuine 3-D body of fog from any
      // angle (not a flat curtain), and it renders in the overlay pass.
      const puffs = [];
      const COLS = Math.max(3, Math.round(w / 1.1));
      const ROWS = 4, DEPTH = 3;
      let i = 0;
      for (let cx = 0; cx < COLS; cx++) {
        for (let cy = 0; cy < ROWS; cy++) {
          for (let cz = 0; cz < DEPTH; cz++) {
            // jittered lattice through the box → even, cloud-like fill
            const jx = (cx + 0.5) / COLS - 0.5 + (((i * 13) % 7) / 7 - 0.5) * 0.12;
            const jy = (cy + 0.5) / ROWS + (((i * 17) % 5) / 5 - 0.5) * 0.12;
            const jz = (cz + 0.5) / DEPTH - 0.5 + (((i * 11) % 5) / 5 - 0.5) * 0.18;
            const s = 1.3 + ((i * 7) % 5) / 5 * 0.9;
            const mat = new THREE.SpriteMaterial({
              map: tex, color, transparent: true, opacity: 0.34,
              depthWrite: false, blending: THREE.NormalBlending,
            });
            const sp = new THREE.Sprite(mat);
            sp.position.set(jx * w, jy * h, jz * thick * 3.2);
            sp.scale.set(s, s, 1);
            sp.userData.rtExclude = true;
            sp.userData.baseOp = 0.34;
            sp.userData.baseY = sp.position.y;
            sp.userData.phase = i * 0.7;
            sp.renderOrder = 3;
            group.add(sp); puffs.push(sp);
            i++;
          }
        }
      }
      scene.add(group);

      bag.fogWalls = bag.fogWalls || [];
      const fw = {
        group, collider, layers: puffs, opened: false, _diss: 0,
        open() {
          if (this.opened) return;
          this.opened = true;
          this.collider.enabled = false;
          this._diss = 0.0001; // begin lifting
        },
        update(dt, t) {
          if (this.opened) {
            if (this._diss > 0 && this._diss < 1) {
              this._diss = Math.min(1, this._diss + dt / 1.2);
              const e = this._diss;
              for (const m of this.layers) {
                m.material.opacity = m.userData.baseOp * (1 - e);
                m.position.y = m.userData.baseY + e * 2.6; // the whole body rises + thins
              }
              if (this._diss >= 1) this.group.visible = false;
            }
            return;
          }
          // idle: each puff breathes + drifts a little, so the body churns
          for (const m of this.layers) {
            m.material.opacity = m.userData.baseOp * (0.72 + 0.28 * Math.sin(t * 0.9 + m.userData.phase));
            m.position.y = m.userData.baseY + Math.sin(t * 0.5 + m.userData.phase) * 0.1;
          }
        },
      };
      bag.fogWalls.push(fw);
      return fw;
    },

    /** A glowing carved inscription on a wall (world lore). */
    inscription(x, y, z, text, rotY = 0, color = "#9a86d8") {
      const cvs = document.createElement("canvas");
      cvs.width = 1024; cvs.height = 128;
      const g2 = cvs.getContext("2d");
      let size = 46;
      do {
        g2.font = `italic ${size}px Georgia, 'Times New Roman', serif`;
        if (g2.measureText(text).width <= 980) break;
        size -= 2;
      } while (size > 18);
      g2.textAlign = "center"; g2.textBaseline = "middle";
      g2.shadowColor = color; g2.shadowBlur = 16;
      g2.fillStyle = color;
      g2.fillText(text, 512, 64);
      const tex = new THREE.CanvasTexture(cvs);
      tex.anisotropy = 4;
      const w = 5.2, h = w * (128 / 1024);
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      m.position.set(x, y, z);
      m.rotation.y = rotY;
      m.userData.rtExclude = true;
      m.renderOrder = 2;
      scene.add(m);
      return m;
    },

    /** Crimson maw mote — pick up to charge one devour. */
    mawMote(id, x, z) {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0x1a0004, emissive: 0xff2530, emissiveIntensity: 3.2 });
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), mat);
      core.userData.rtExclude = true;
      group.add(core);
      // a faint blood halo on the ground
      const halo = new THREE.Mesh(
        new THREE.CircleGeometry(0.4, 20),
        new THREE.MeshBasicMaterial({ color: 0xff2530, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = -0.32;
      halo.userData.rtExclude = true;
      group.add(halo);
      group.position.set(x, 0.55, z);
      scene.add(group);
      const m = { id, x, z, mesh: group, core, taken: false };
      bag.maws.push(m);
      return m;
    },

    /** A still, mirror-dark reflective pool. Registers a reflection zone. */
    reflectPool(x, z, r) {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, 0.06, 32),
        new THREE.MeshStandardMaterial({ color: 0x05070d, roughness: 0.04, metalness: 1.0 })
      );
      m.position.set(x, 0.04, z);
      scene.add(m);
      bag.occluders.push(m);
      // faint rim so it reads as water/mirror even before reflections kick in
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.04, 6, 40),
        new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x5aa0ff, emissiveIntensity: 1.4 })
      );
      rim.rotation.x = -Math.PI / 2;
      rim.position.set(x, 0.07, z);
      rim.userData.rtExclude = true;
      scene.add(rim);
      bag.reflectors.push({ x, z, r });
      return m;
    },

    /** The Scepter relic on its pedestal, with its own (moving) glow light. */
    scepterPedestal(x, z) {
      kit.pillar(0.7, 1.0, x, z, mats.pillar);
      const group = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.9, 6),
        new THREE.MeshStandardMaterial({ color: 0x1a1020, emissive: 0xffd76a, emissiveIntensity: 3.5 })
      );
      core.userData.rtExclude = true;
      group.add(core);
      const light = new THREE.PointLight(0xffd76a, 5, 8);
      light.userData.rtRadius = 0.1;
      group.add(light);
      group.position.set(x, 1.9, z);
      scene.add(group);
      bag.scepter = { x, z, group, light, core, taken: false };
      return bag.scepter;
    },

    /** Extraction rift — win trigger. */
    extraction(x, z) {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.3, 0.1, 24),
        new THREE.MeshStandardMaterial({ color: 0x06120e, emissive: 0x39f0c0, emissiveIntensity: 1.8 })
      );
      disc.position.set(x, 0.05, z);
      scene.add(disc);
      bag.extract = { x, z, disc };
      return bag.extract;
    },

    checkpoint(x, z, r = 2.5, spawnX = x, spawnZ = z) {
      bag.checkpoints.push({ x, z, r, spawn: new THREE.Vector3(spawnX, 0.42, spawnZ) });
    },

    trigger(id, x, z, r = 2) {
      bag.triggers.push({ id, x, z, r, fired: false });
    },

    /** Great Eye sentinel spec (stationary; rallies nearby wardens). */
    greatEye(x, z, opts = {}) {
      bag.eyes.push({ x, z, ...opts });
      return bag.eyes[bag.eyes.length - 1];
    },

    /** Guard spec: path of [x,z] waypoints (loops). opts.blind → a Snuffed. */
    guard(path, opts = {}) {
      bag.guards.push({
        path,
        speed: opts.speed ?? 1.5,
        pause: opts.pause ?? 1.2,     // seconds at each waypoint
        range: opts.range ?? 12,      // vision range
        coneAngle: opts.coneAngle ?? 0.62,
        color: opts.color ?? 0xffd9a0,
        blind: opts.blind ?? false,   // a Snuffed: no light, hunts by sound
      });
      return bag.guards[bag.guards.length - 1];
    },

    // ========================================================================
    // PROP LIBRARY — varied low-poly decorative + cover pieces built from
    // primitives, so levels can be cluttered without going back to bare boxes.
    //
    // COVER props (crate, crateStack, barrel, sack, brokenColumn, rubble,
    // statue, sarcophagus, cart) are built from real meshes added to `scene` +
    // `bag.occluders` (they cast shadows and sit in the ray-traced BVH) and get
    // ONE approximate collider in bag.boxes/bag.cylinders. Never rtExclude.
    //
    // PURE DECOR (urn, banner, chains, brazier, deadLantern) skips the
    // collider; still added to scene + bag.occluders so it casts/occludes,
    // except tiny emissive bits (an ember, a glow) which are rtExclude.
    // ========================================================================

    /** Wooden crate — cover. One box body + two thin rust-metal straps for a
     *  beveled/trimmed look. `seed` varies the strap tint/offset call-to-call. */
    crate(x, z, opts = {}) {
      const { size = 0.9, rot = 0, seed = 0 } = opts;
      const s = size;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const body = new THREE.Mesh(boxGeo(s, s, s), mats.wood);
      body.position.set(0, s / 2, 0);
      group.add(body);
      const strapY = s * (0.32 + rand(seed + 1) * 0.16);
      const strapA = new THREE.Mesh(boxGeo(s * 1.01, s * 0.08, s * 0.08), mats.rust);
      strapA.position.set(0, strapY, 0);
      group.add(strapA);
      const strapB = new THREE.Mesh(boxGeo(s * 0.08, s * 0.08, s * 1.01), mats.rust);
      strapB.position.set(0, s * 0.7, 0);
      group.add(strapB);
      scene.add(group);
      bag.occluders.push(body, strapA, strapB);
      bag.boxes.push({ x, z, hx: s / 2, hz: s / 2, rot, enabled: true });
      return group;
    },

    /** A stack of 2-4 offset crates — cover, one bounding-box collider so the
     *  whole pile blocks as a unit. `seed` varies count/offsets/sizes. */
    crateStack(x, z, opts = {}) {
      const { size = 0.85, rot = 0, count, seed = 1 } = opts;
      const n = count ?? (3 + Math.floor(rand(seed) * 2)); // 3-4
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const meshes = [];
      let maxFoot = size * 0.6;
      let y = 0;
      for (let i = 0; i < n; i++) {
        const s = size * (0.78 + rand(seed + i * 3.1) * 0.3);
        const jx = (rand(seed + i * 5.7) - 0.5) * size * 0.5;
        const jz = (rand(seed + i * 9.3) - 0.5) * size * 0.5;
        const jr = (rand(seed + i * 2.2) - 0.5) * 0.6;
        const b = new THREE.Mesh(boxGeo(s, s, s), mats.wood);
        b.position.set(jx, y + s / 2, jz);
        b.rotation.y = jr;
        group.add(b);
        meshes.push(b);
        maxFoot = Math.max(maxFoot, Math.abs(jx) + s / 2, Math.abs(jz) + s / 2);
        y += s * (0.55 + rand(seed + i * 4.4) * 0.15); // partial overlap, not a clean tower
      }
      scene.add(group);
      bag.occluders.push(...meshes);
      bag.boxes.push({ x, z, hx: maxFoot, hz: maxFoot, rot, enabled: true });
      return group;
    },

    /** Barrel — cover. Cylinder body + 2 thin torus hoops. */
    barrel(x, z, opts = {}) {
      const { r = 0.42, h = 0.95, rot = 0, seed = 0 } = opts;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.94, h, 10), mats.wood);
      body.position.set(0, h / 2, 0);
      group.add(body);
      const hoops = [body];
      for (const t of [0.28, 0.72]) {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(r * 1.01, r * 0.06, 5, 14), mats.rust);
        hoop.rotation.x = Math.PI / 2;
        hoop.position.set(0, h * t + (rand(seed + t * 10) - 0.5) * 0.04, 0);
        group.add(hoop);
        hoops.push(hoop);
      }
      scene.add(group);
      bag.occluders.push(...hoops);
      bag.cylinders.push({ x, z, r, enabled: true });
      return group;
    },

    /** Sack of grain/loot — small cover. A squashed, slightly tilted sphere
     *  with a knotted top, cloth material. */
    sack(x, z, opts = {}) {
      const { r = 0.4, rot = 0, seed = 0 } = opts;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.set(0, rot, (rand(seed) - 0.5) * 0.3);
      const body = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mats.cloth);
      body.scale.set(1, 0.72, 1);
      body.position.set(0, r * 0.72, 0);
      group.add(body);
      const knot = new THREE.Mesh(new THREE.OctahedronGeometry(r * 0.28, 0), mats.cloth);
      knot.position.set(0, r * 1.28, 0);
      group.add(knot);
      scene.add(group);
      bag.occluders.push(body, knot);
      bag.boxes.push({ x, z, hx: r * 0.85, hz: r * 0.85, rot, enabled: true });
      return group;
    },

    /** Urn / vase — pure decor. A Lathe-revolved profile, stone material.
     *  `tall` gives a slender floor urn instead of a squat table vase. */
    urn(x, z, opts = {}) {
      const { scale = 1, rot = 0, tall = true, seed = 0 } = opts;
      const pts = tall
        ? [[0.02, 0], [0.22, 0.02], [0.28, 0.18], [0.16, 0.55], [0.24, 0.78], [0.19, 0.95], [0.1, 1.0]]
        : [[0.02, 0], [0.26, 0.03], [0.3, 0.16], [0.2, 0.34], [0.24, 0.42], [0.15, 0.48]];
      const vpts = pts.map(([px, py]) => new THREE.Vector2(px * scale, py * scale));
      const geo = new THREE.LatheGeometry(vpts, 9);
      const m = new THREE.Mesh(geo, mats.stone);
      m.position.set(x, 0, z);
      m.rotation.y = rot + rand(seed) * Math.PI * 2;
      scene.add(m);
      bag.occluders.push(m);
      return m;
    },

    /** Broken column — cover. A jagged standing stump plus 1-2 fallen drum
     *  segments scattered beside it. Tall stump = a good shadow caster. */
    brokenColumn(x, z, opts = {}) {
      const { r = 0.42, h = 1.6, rot = 0, seed = 0 } = opts;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const meshes = [];
      const stumpH = h * (0.5 + rand(seed) * 0.4);
      const stump = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, stumpH, 10), mats.stone);
      stump.position.set(0, stumpH / 2, 0);
      stump.rotation.z = (rand(seed + 1) - 0.5) * 0.06; // slight lean
      group.add(stump); meshes.push(stump);
      const drumN = 1 + Math.floor(rand(seed + 2) * 2); // 1-2 fallen drums
      for (let i = 0; i < drumN; i++) {
        const dh = r * (1.1 + rand(seed + 3 + i) * 0.6);
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.98, r * 0.98, dh, 10), mats.stone);
        const ang = rand(seed + 5 + i) * Math.PI * 2;
        const dist = r * 1.7 + i * r * 1.6;
        drum.position.set(Math.cos(ang) * dist, r * 0.98, Math.sin(ang) * dist);
        drum.rotation.z = Math.PI / 2;
        drum.rotation.y = rand(seed + 8 + i) * Math.PI;
        group.add(drum); meshes.push(drum);
      }
      scene.add(group);
      bag.occluders.push(...meshes);
      bag.cylinders.push({ x, z, r: r * 2.6, enabled: true }); // covers stump + nearby drums
      return group;
    },

    /** Rubble pile — low cover. A cluster of 4-8 small angled rock chunks. */
    rubble(x, z, opts = {}) {
      const { radius = 0.9, n, rot = 0, seed = 0 } = opts;
      const count = n ?? (4 + Math.floor(rand(seed) * 5)); // 4-8
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const meshes = [];
      for (let i = 0; i < count; i++) {
        const rs = seed + i * 3.3;
        const rr = 0.14 + rand(rs) * 0.22;
        const rock = new THREE.Mesh(new THREE.OctahedronGeometry(rr, 0), mats.stone);
        const ang = rand(rs + 1) * Math.PI * 2;
        const dist = rand(rs + 2) * radius;
        rock.position.set(Math.cos(ang) * dist, rr * 0.5, Math.sin(ang) * dist);
        rock.rotation.set(rand(rs + 3) * Math.PI, rand(rs + 4) * Math.PI, rand(rs + 5) * Math.PI);
        rock.scale.set(1, 0.7 + rand(rs + 6) * 0.4, 1);
        group.add(rock); meshes.push(rock);
      }
      scene.add(group);
      bag.occluders.push(...meshes);
      bag.cylinders.push({ x, z, r: radius * 0.75, enabled: true });
      return group;
    },

    /** Statue — tall cover, a great shadow caster. Stone plinth + a simple
     *  robed/obelisk figure (tapered body + hood + head). */
    statue(x, z, opts = {}) {
      const { scale = 1, rot = 0, h = 2.6, seed = 0 } = opts;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const meshes = [];
      const plinthW = 0.9 * scale, plinthH = 0.35 * scale;
      const plinth = new THREE.Mesh(boxGeo(plinthW, plinthH, plinthW), mats.stone);
      plinth.position.set(0, plinthH / 2, 0);
      group.add(plinth); meshes.push(plinth);
      const bodyH = h * scale - plinthH;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.34 * scale, bodyH, 8), mats.stone);
      body.position.set(0, plinthH + bodyH / 2, 0);
      body.rotation.y = rand(seed) * Math.PI;
      group.add(body); meshes.push(body);
      const hood = new THREE.Mesh(new THREE.ConeGeometry(0.22 * scale, 0.42 * scale, 8), mats.stone);
      hood.position.set(0, plinthH + bodyH + 0.16 * scale, 0);
      group.add(hood); meshes.push(hood);
      scene.add(group);
      bag.occluders.push(...meshes);
      bag.boxes.push({ x, z, hx: plinthW / 2, hz: plinthW / 2, rot, enabled: true });
      return group;
    },

    /** Sarcophagus — low, wide stone cover with a lid lip. */
    sarcophagus(x, z, opts = {}) {
      const { w = 1.8, d = 0.8, h = 0.7, rot = 0 } = opts;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const body = new THREE.Mesh(boxGeo(w, h, d), mats.stone);
      body.position.set(0, h / 2, 0);
      const lidH = h * 0.22;
      const lid = new THREE.Mesh(boxGeo(w * 1.04, lidH, d * 1.08), mats.stone);
      lid.position.set(0, h - lidH / 2 + 0.01, 0);
      group.add(body, lid);
      scene.add(group);
      bag.occluders.push(body, lid);
      bag.boxes.push({ x, z, hx: (w * 1.04) / 2, hz: (d * 1.08) / 2, rot, enabled: true });
      return group;
    },

    /** Cart — cover. Wood box body on two side wheels + a front handle pole. */
    cart(x, z, opts = {}) {
      const { w = 1.4, d = 0.8, h = 0.55, rot = 0 } = opts;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const wheelR = h * 0.55;
      const bodyY = wheelR * 1.15;
      const body = new THREE.Mesh(boxGeo(w, h, d), mats.wood);
      body.position.set(0, bodyY + h / 2, 0);
      const meshes = [body];
      for (const sx of [-1, 1]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(wheelR, wheelR, 0.1, 10), mats.rust);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(sx * (w / 2 - 0.05), wheelR, 0);
        group.add(wheel); meshes.push(wheel);
      }
      const handle = new THREE.Mesh(boxGeo(0.08, 0.08, d * 0.9), mats.wood);
      handle.position.set(w / 2 + d * 0.4, bodyY * 0.6, 0);
      handle.rotation.y = 0.15;
      group.add(body, handle); meshes.push(handle);
      scene.add(group);
      bag.occluders.push(...meshes);
      bag.boxes.push({ x, z, hx: w / 2 + 0.15, hz: d / 2, rot, enabled: true });
      return group;
    },

    /** Hanging wall banner — pure decor, no collider. A tall cloth quad with
     *  a gentle wave baked into its vertices. Takes explicit x,y,z (mount
     *  height matters) + rot (face direction). */
    banner(x, y, z, rot = 0, opts = {}) {
      const { w = 1.0, h = 2.2, color, seed = 0 } = opts;
      const geo = new THREE.PlaneGeometry(w, h, 1, 7);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i); // -h/2..h/2
        const t = py / h + 0.5;
        pos.setZ(i, Math.sin(t * Math.PI * 1.6 + seed) * 0.05 * t);
      }
      geo.computeVertexNormals();
      const mat = color
        ? new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide })
        : mats.cloth;
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.y = rot;
      scene.add(m);
      bag.occluders.push(m);
      return m;
    },

    /** A couple of thin hanging chain links — pure decor, no collider. `y`
     *  is the top mount height; the chain hangs `len` down from there. */
    chains(x, z, opts = {}) {
      const { y = 3.0, len = 1.2, links, seed = 0 } = opts;
      const n = links ?? 5;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      const meshes = [];
      const step = len / n;
      for (let i = 0; i < n; i++) {
        const link = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, step * 0.92, 5), mats.rust);
        link.position.set((rand(seed + i) - 0.5) * 0.02, y - step * (i + 0.5), 0);
        link.rotation.x = (i % 2) * (Math.PI / 2);
        group.add(link); meshes.push(link);
      }
      scene.add(group);
      bag.occluders.push(...meshes);
      return group;
    },

    /** Brazier — pure decor. A dark tripod bowl, UNLIT by default. Pass
     *  {lit:true} for a small rtExclude ember glow, or {light:N} for a real
     *  (small) PointLight — neither is on unless asked for. */
    brazier(x, z, opts = {}) {
      const { r = 0.34, h = 0.7, rot = 0, lit = false, light = 0, seed = 0 } = opts;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const meshes = [];
      for (let i = 0; i < 3; i++) {
        const a = rot + (i / 3) * Math.PI * 2 + rand(seed + i) * 0.2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, h, 5), mats.rust);
        leg.position.set(Math.cos(a) * r * 0.6, h / 2, Math.sin(a) * r * 0.6);
        leg.rotation.z = Math.cos(a) * 0.25;
        leg.rotation.x = -Math.sin(a) * 0.25;
        group.add(leg); meshes.push(leg);
      }
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mats.dark);
      bowl.position.set(0, h, 0);
      bowl.rotation.x = Math.PI; // concave side up
      group.add(bowl); meshes.push(bowl);
      scene.add(group);
      bag.occluders.push(...meshes);
      if (lit) {
        const ember = new THREE.Mesh(
          new THREE.OctahedronGeometry(r * 0.35),
          new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff7a2a, emissiveIntensity: 4 })
        );
        ember.position.set(x, h + r * 0.3, z);
        ember.userData.rtExclude = true;
        scene.add(ember);
      }
      if (light > 0) {
        const pl = new THREE.PointLight(0xff8a3a, light, 6);
        pl.position.set(x, h + r * 0.3, z);
        pl.userData.rtRadius = 0.08;
        scene.add(pl);
      }
      return group;
    },

    /** Dead (unlit) hanging lantern fixture — pure decor, no collider, no
     *  light. A dark pole/bracket + cage housing, ready to be re-lit by a
     *  level script if ever needed (it deliberately does NOT use kit.torch). */
    deadLantern(x, z, opts = {}) {
      const { h = 2.4, rot = 0, seed = 0 } = opts;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rot;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 6), mats.rust);
      pole.position.set(0, h / 2, 0);
      const cage = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), mats.dark);
      cage.position.set(0, h + 0.05, 0);
      cage.rotation.y = rand(seed) * Math.PI;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 5, 10), mats.rust);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, h - 0.08, 0);
      group.add(pole, cage, ring);
      scene.add(group);
      bag.occluders.push(pole, cage, ring);
      return group;
    },
  };

  return kit;
}
