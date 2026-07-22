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
  // crystal reads better with a wet SHEEN than dead-matte, but full gloss
  // (the old rough .24 / metal .8) threw shifting white specular hotspots off
  // every torch. This is the middle ground: a soft, damp crystalline highlight
  // that catches the tower light, no mirror-glare. (Traced mirror reflections
  // are a separate graphics-preset lever — off in "balanced", on in "beauty".)
  crystal:  { mult: 1.5,  color: 0x46607c, rough: 0.5,  metal: 0.32 },
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
    platforms: [],  // raised catwalks/decks {x0,z0,x1,z1,y} — walk on top, pass beneath
    ramps: [],      // sloped connectors {x0,z0,x1,z1,y0,y1,axis} — climb between heights
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

  // ==========================================================================
  // COMPOSITION INTERNALS — shared machinery for the placement helpers at the
  // bottom of the kit. Not meant to be called directly by levels.
  // ==========================================================================

  // Approximate footprint RADIUS (world units) per prop builder. Used ONLY for
  // keep-clear testing (would this piece intrude on a door lane / patrol line /
  // spawn pad?) and for tall-back/short-front sorting inside clusters.
  const PROP_FOOT = {
    crate: 0.5, crateStack: 0.78, barrel: 0.45, sack: 0.42, urn: 0.3,
    brokenColumn: 0.55, rubble: 0.7, statue: 0.5, sarcophagus: 0.95,
    cart: 0.85, brazier: 0.36, deadLantern: 0.2, banner: 0.1, chains: 0.1,
  };

  // Normalize the many palette spellings into a list of [{make,w,foot}]. An
  // entry may be any of:
  //   "crate"                                → builder looked up by name, weight 1
  //   (x,z,o) => kit.crate(x,z,o)            → a raw builder function
  //   { prop:"barrel", w:2, opts:{r:0.5} }   → named builder + weight + fixed opts
  //   { make:(x,z,o)=>…, w:1, foot:0.6 }     → fully custom builder + footprint
  // A bare string/function (not wrapped in an array) is treated as a 1-entry
  // palette, so `wallRun(...,"crate",...)` just works.
  function _normPalette(pal) {
    const list = Array.isArray(pal) ? pal : [pal];
    return list.map((e) => {
      if (typeof e === "string")
        return { make: (x, z, o) => kit[e](x, z, o), w: 1, foot: PROP_FOOT[e] ?? 0.5 };
      if (typeof e === "function")
        return { make: e, w: 1, foot: 0.5 };
      if (e.make)
        return { make: e.make, w: e.w ?? 1, foot: e.foot ?? 0.5 };
      const name = e.prop, opts = e.opts || {};
      return {
        make: (x, z, o) => kit[name](x, z, { ...opts, ...o }),
        w: e.w ?? 1,
        foot: e.foot ?? PROP_FOOT[name] ?? 0.5,
      };
    });
  }

  // Weighted pick from a normalized palette given r in [0,1) (seeded upstream).
  function _pick(norm, r) {
    const total = norm.reduce((s, e) => s + e.w, 0);
    let t = r * total;
    for (const e of norm) if ((t -= e.w) < 0) return e;
    return norm[norm.length - 1];
  }

  // Does a footprint circle (x,z,foot) intrude on any keep-clear zone? A zone is
  // either a RECT {x0,z0,x1,z1,pad?} (door lanes ~3 wide, spawn pads, patrol
  // corridors) or a DISC {x,z,r} (a landmark / point to leave open). This is the
  // single gate every helper routes cover placements through.
  function _clearHit(x, z, foot, clear) {
    if (!clear || !clear.length) return false;
    for (const c of clear) {
      if (c.x0 !== undefined) {
        const x0 = Math.min(c.x0, c.x1), x1 = Math.max(c.x0, c.x1);
        const z0 = Math.min(c.z0, c.z1), z1 = Math.max(c.z0, c.z1);
        const pad = (c.pad || 0) + foot;
        if (x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad) return true;
      } else if (c.r !== undefined) {
        const dx = x - c.x, dz = z - c.z, rr = c.r + foot;
        if (dx * dx + dz * dz < rr * rr) return true;
      }
    }
    return false;
  }

  // Build one palette entry at (x,z). If it lands in a keep-clear zone and a
  // nudge direction is supplied, push it out in up to 3 short steps; if it still
  // won't fit, SKIP it (return null) rather than block a lane. This is what lets
  // authors pass door lanes / patrol lines and trust the composition stays legal.
  function _tryPlace(entry, x, z, rot, seed, clear, nudge) {
    let px = x, pz = z;
    for (let k = 0; k < 4; k++) {
      if (!_clearHit(px, pz, entry.foot, clear)) return entry.make(px, pz, { rot, seed });
      if (!nudge) return null;
      px += nudge.x * 0.55; pz += nudge.z * 0.55;
    }
    return null;
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

    // ===== VERTICALITY — raised catwalks/decks, ramps, and edge railings =====
    // A PLATFORM is a walk-on-top deck at height `y`; it is OPEN beneath (a blob
    // on the floor passes under it, a guard patrols on top of it — the "above /
    // below you" fantasy). Reach it via a `ramp`. Registers bag.platforms so the
    // movement system resolves the blob's ground height. The deck slab is a real
    // occluder (it shadows what's beneath). Optional `surface` plate + noise type.
    platform(x0, z0, x1, z1, { y = 2, mat = mats.block, surface, thickness = 0.3, support = false } = {}) {
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
      const m = new THREE.Mesh(boxGeo(w, thickness, d), mat);
      m.position.set(cx, y - thickness / 2, cz); // top face sits exactly at y
      m.userData.fxOcclude = true;
      scene.add(m);
      bag.occluders.push(m);
      bag.platforms.push({ x0, z0, x1, z1, y });
      if (surface) {
        const s = SURFACES[surface];
        const sm = new THREE.Mesh(boxGeo(w, 0.06, d), new THREE.MeshStandardMaterial({ color: s.color, roughness: s.rough, metalness: s.metal }));
        sm.position.set(cx, y + 0.031, cz);
        scene.add(sm); bag.occluders.push(sm);
        bag.surfaces.push({ x0, z0, x1, z1, type: surface }); // noise-floor follows the deck
      }
      if (support) { // cosmetic corner posts down to the floor (no collider)
        for (const [sx, sz] of [[x0 + 0.4, z0 + 0.4], [x1 - 0.4, z0 + 0.4], [x0 + 0.4, z1 - 0.4], [x1 - 0.4, z1 - 0.4]]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, y, 6), mats.dark);
          post.position.set(sx, y / 2, sz); post.userData.rtExclude = false;
          scene.add(post); bag.occluders.push(post);
        }
      }
      return m;
    },

    // A RAMP: sloped walkable slab from height y0 (at its x0/z0 lip) up to y1
    // (at its far lip), sloping along `axis` ('x' or 'z'). No collider — it IS
    // the ground. Its low lip must sit ~level with the floor/deck it connects to
    // so the blob can step onto it. Registers bag.ramps for height resolution.
    ramp(x0, z0, x1, z1, { y0 = 0, y1 = 2, axis = "x", mat = mats.block, surface } = {}) {
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
      const runLen = axis === "x" ? w : d;
      const rise = y1 - y0;
      const slabLen = Math.hypot(runLen, rise);
      const geo = boxGeo(axis === "x" ? slabLen : w, 0.16, axis === "x" ? d : slabLen);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(cx, (y0 + y1) / 2, cz);
      const ang = Math.atan2(rise, runLen);
      if (axis === "x") m.rotation.z = -ang; else m.rotation.x = ang;
      m.userData.fxOcclude = true;
      scene.add(m);
      bag.occluders.push(m);
      bag.ramps.push({ x0, z0, x1, z1, y0, y1, axis });
      if (surface) bag.surfaces.push({ x0, z0, x1, z1, type: surface });
      return m;
    },

    // A RAILING: a low wall sitting ON a deck at height `y`, blocking ONLY movers
    // at that height (height-banded collider y..y+h) — it keeps a blob from
    // walking off a catwalk edge but does NOT block anyone on the floor below.
    // Runs from (ax,az) to (bx,bz). Set `openFall` where a ramp/gap should be.
    railing(ax, az, bx, bz, { y = 2, h = 0.85, t = 0.14, mat = mats.pillar } = {}) {
      const cx = (ax + bx) / 2, cz = (az + bz) / 2;
      const w = Math.max(t, Math.abs(bx - ax)), d = Math.max(t, Math.abs(bz - az));
      const m = new THREE.Mesh(boxGeo(w, h, d), mat);
      m.position.set(cx, y + h / 2, cz);
      m.userData.fxOcclude = true;
      scene.add(m);
      bag.occluders.push(m);
      bag.boxes.push({ x: cx, z: cz, hx: w / 2, hz: d / 2, rot: 0, enabled: true, y0: y, y1: y + h });
      return m;
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
     * Volumetric god-ray zone. Fog is NOT a stealth mechanic (shadow is the
     * sole invisibility; fogWall is the sole barrier) — this only registers a
     * box of scattering media with the tracer so light beams passing through
     * it render as visible shafts. Purely visual: no concealment, no collider.
     */
    fogPatch(x0, z0, x1, z1, { density = 0.05 } = {}) {
      bag.fogZones.push({ min: [x0, -1, z0], max: [x1, 6, z1], density });
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

    // ========================================================================
    // PLACEMENT / COMPOSITION SYSTEM
    //
    // These helpers dress a room so props read as PURPOSEFUL, not scattered.
    // Each just drives the prop builders above at composed positions, returns
    // the created handles (an array, or a small {} of arrays for `focal`), and
    // respects KEEP-CLEAR zones so nothing ever blocks a door/patrol/spawn.
    //
    // ---- COMPOSITION GUIDE (the rules baked in) ---------------------------
    //  1. ALIGN TO WALLS & AXES. Props hug walls, corners, and the room's
    //     axes — never dotted at random into open floor. `wallRun` lines a
    //     wall; `corner` tucks into a corner; `flank`/`focal` sit on an axis.
    //  2. KEEP THE CENTRE OPEN. Circulation runs through the middle of a room.
    //     Helpers frame the edges and focal points and leave the centre clear;
    //     if you want something central, make it a `focal` LANDMARK, not clutter.
    //  3. SYMMETRY IS CHEAP INTENT. A mirrored `flank` pair either side of a
    //     door / statue / light instantly reads "placed on purpose."
    //  4. RHYTHM. `wallRun`/`leadingLine` use even spacing with only gentle
    //     seeded jitter in offset & rotation — regular, but not sterile.
    //  5. VARY HEIGHT IN A PILE. `cluster` sorts a weighted palette tall-at-
    //     the-back, short-at-the-front, inside one coherent footprint.
    //  6. FACE COHERENTLY. Flanks face their focal point; wall runs align to
    //     the wall; leading lines face the alley — rotations aren't random.
    //
    // ---- KEEP-CLEAR ZONES -------------------------------------------------
    //  Every helper takes `opts.clear` — an array of zones no COVER prop may
    //  intrude on. A zone is a RECT {x0,z0,x1,z1,pad?} (door lanes ~3 units
    //  wide, guard patrol corridors, the spawn pad) or a DISC {x,z,r} (a point
    //  to keep open). Blocked placements are nudged out or dropped. Build the
    //  list ONCE per room and pass it to every call:
    //     const clear = [
    //       { x0:-1.5, z0:5.6, x1:1.5, z1:6.4 },   // north door lane
    //       { x:0, z:-5, r:2.2 },                  // spawn pad
    //     ];
    //
    // ---- USAGE EXAMPLES (room = kit.room(-8,-6, 8,6, {doors:{n:[[-1.5,1.5]]}})) --
    //   // A) A wall of supply crates + barrels down the WEST wall, rhythmic,
    //   //    aligned, clear of the north door lane:
    //   kit.wallRunSide(room, "w",
    //     [ { prop:"crate", w:2 }, { prop:"barrel", w:1 } ],
    //     { spacing:1.5, inset:0.7, clear });
    //
    //   // B) A shrine as the room's focal point: a statue dead-centre-north,
    //   //    a mirrored pair of urns flanking it, rubble scattered at its feet:
    //   kit.focal(0, 4, {
    //     landmark:"statue", landmarkOpts:{ h:2.8 },
    //     flankProp:"urn", flankGap:1.4, flankDir:0,     // urns left/right on x
    //     scatterProp:"rubble", scatterCount:3, clear });
    //
    //   // C) A lived-in corner: a pile of stacked crates + a barrel + a sack
    //   //    wedged into the south-east corner, tall pieces to the back:
    //   kit.corner(room, "se",
    //     [ { prop:"crateStack", w:2, foot:0.8 }, "barrel", "sack" ],
    //     { count:4, footprint:1.1, clear });
    // ========================================================================

    /**
     * WALL-RUN: line props along the segment A→B, inset toward one side, with
     * even RHYTHM and gentle seeded jitter. `palette` is any palette spelling
     * (see _normPalette). opts:
     *   spacing   centre-to-centre step (world units)         default 1.6
     *   inset     perpendicular offset from the line; sign    default 0.6
     *             chooses the side (+ = left of A→B direction)
     *   jitter    max random offset in inset & along-wall     default 0.12
     *   rotJitter max random rotation wobble (radians)        default 0.12
     *   face      "wall" (align to wall) | "in" | "out" |     default "wall"
     *             a fixed rotation number
     *   endMargin gap left at each end (keeps corners clean)  default spacing/2
     *   clear     keep-clear zones (see header)               default []
     *   seed      deterministic variation seed                default 7
     * Returns the array of created handles (skipped placements omitted).
     */
    wallRun(ax, az, bx, bz, palette, opts = {}) {
      const {
        spacing = 1.6, inset = 0.6, jitter = 0.12, rotJitter = 0.12,
        face = "wall", clear = [], seed = 7, endMargin = null,
      } = opts;
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      if (L < 1e-3) return [];
      const ux = dx / L, uz = dz / L;          // along-wall unit
      const nx = -uz, nz = ux;                 // left-hand normal
      const sgn = Math.sign(inset || 1);
      const norm = _normPalette(palette);
      const wallAng = Math.atan2(ux, uz);
      const inAng = Math.atan2(nx * sgn, nz * sgn);
      const baseRot = typeof face === "number" ? face
        : face === "in" ? inAng
        : face === "out" ? inAng + Math.PI
        : wallAng;
      const em = endMargin ?? spacing * 0.5;
      const usable = L - em * 2;
      if (usable < 0) return [];
      const count = Math.max(1, Math.floor(usable / spacing) + 1);
      const step = count > 1 ? usable / (count - 1) : 0;
      const nudge = { x: nx * sgn, z: nz * sgn };
      const out = [];
      for (let i = 0; i < count; i++) {
        const s = seed + i * 3.7;
        const t = em + step * i;
        const jN = (rand(s) - 0.5) * 2 * jitter;
        const jT = (rand(s + 1) - 0.5) * 2 * jitter;
        const px = ax + ux * (t + jT) + nx * (inset + jN);
        const pz = az + uz * (t + jT) + nz * (inset + jN);
        const rot = baseRot + (rand(s + 2) - 0.5) * 2 * rotJitter;
        const entry = _pick(norm, rand(s + 3));
        const h = _tryPlace(entry, px, pz, rot, s + 4, clear, nudge);
        if (h) out.push(h);
      }
      return out;
    },

    /**
     * WALL-RUN by ROOM + SIDE — the ergonomic form. `room` is a {x0,z0,x1,z1}
     * (what kit.room returns); `side` is "n"|"s"|"e"|"w". Computes the wall
     * segment and forces `inset` to point INTO the room, then delegates to
     * wallRun. All wallRun opts pass through (`inset` magnitude respected).
     */
    wallRunSide(room, side, palette, opts = {}) {
      const { x0, z0, x1, z1 } = room;
      const ins = Math.abs(opts.inset ?? 0.6);
      let ax, az, bx, bz, signed;
      if (side === "s")      { ax = x0; az = z0; bx = x1; bz = z0; signed =  ins; }
      else if (side === "n") { ax = x0; az = z1; bx = x1; bz = z1; signed = -ins; }
      else if (side === "e") { ax = x1; az = z0; bx = x1; bz = z1; signed =  ins; }
      else                   { ax = x0; az = z0; bx = x0; bz = z1; signed = -ins; } // "w"
      return kit.wallRun(ax, az, bx, bz, palette, { ...opts, inset: signed });
    },

    /**
     * FLANK: a mirrored pair (or pair of receding rows) either side of a focal
     * point, facing inward — the cheapest way to read "intentional." opts:
     *   dir      angle of the separation axis, 0 = the x-axis   default 0
     *   gap      distance from centre to each item              default 1.6
     *   rows     items per side (a receding row if >1)          default 1
     *   rowStep  spacing between rows (perpendicular to dir)    default 1.2
     *   face     "in" (toward focal) | "out" | fixed number     default "in"
     *   clear    keep-clear zones                               default []
     *   seed     variation seed                                 default 11
     * Both sides share the same palette pick & build-seed per row, so the pair
     * is a true mirror. Returns the array of handles.
     */
    flank(fx, fz, palette, opts = {}) {
      const {
        dir = 0, gap = 1.6, rows = 1, rowStep = 1.2,
        face = "in", seed = 11, clear = [],
      } = opts;
      const dux = Math.sin(dir), duz = Math.cos(dir);   // separation unit
      const pux = duz, puz = -dux;                      // receding (perp) unit
      const norm = _normPalette(palette);
      const out = [];
      for (let r = 0; r < rows; r++) {
        const s = seed + r * 7;
        const entry = _pick(norm, rand(s));             // shared → mirrored pair
        for (const sg of [1, -1]) {
          const bx = fx + dux * gap * sg + pux * rowStep * r;
          const bz = fz + duz * gap * sg + puz * rowStep * r;
          const toC = Math.atan2(fx - bx, fz - bz);     // face the focal point
          const rot = typeof face === "number" ? face
            : face === "out" ? toC + Math.PI : toC;
          const nudge = { x: dux * sg, z: duz * sg };   // push outward if blocked
          const h = _tryPlace(entry, bx, bz, rot, s + 3, clear, nudge);
          if (h) out.push(h);
        }
      }
      return out;
    },

    /**
     * CLUSTER / still-life: a purposeful pile within one footprint, sorted so
     * the biggest/tallest pieces sit at the BACK and the smallest at the FRONT.
     * opts:
     *   count      how many pieces                              default 4
     *   footprint  radius of the pile (world units)             default 1.1
     *   backDir    angle the pile recedes toward (its "back")   default 0
     *   spread     lateral scatter as a fraction of footprint   default 0.7
     *   clear      keep-clear zones                             default []
     *   seed       variation seed                               default 5
     * Returns the array of handles. Height variation comes for free from the
     * PROP_FOOT-based sort — feed it a mix (e.g. crateStack + barrel + sack).
     */
    cluster(cx, cz, palette, opts = {}) {
      const {
        count = 4, footprint = 1.1, backDir = 0, spread = 0.7,
        seed = 5, clear = [],
      } = opts;
      const bux = Math.sin(backDir), buz = Math.cos(backDir);   // back unit
      const pux = buz, puz = -bux;                              // lateral unit
      const norm = _normPalette(palette);
      const picks = [];
      for (let i = 0; i < count; i++) picks.push(_pick(norm, rand(seed + i * 2.3)));
      picks.sort((a, b) => b.foot - a.foot);                    // big → back
      const out = [];
      for (let i = 0; i < picks.length; i++) {
        const s = seed + i * 4.1;
        const frac = count > 1 ? i / (count - 1) : 0;           // 0 back .. 1 front
        const along = (0.5 - frac) * footprint * 1.4;           // + toward back
        const lat = (rand(s) - 0.5) * 2 * footprint * spread;
        const px = cx + bux * along + pux * lat;
        const pz = cz + buz * along + puz * lat;
        const rot = rand(s + 1) * Math.PI * 2;
        const nudge = { x: pux * (rand(s + 2) < 0.5 ? 1 : -1), z: puz * (rand(s + 2) < 0.5 ? 1 : -1) };
        const h = _tryPlace(picks[i], px, pz, rot, s + 3, clear, nudge);
        if (h) out.push(h);
      }
      return out;
    },

    /**
     * FOCAL COMPOSITION around a landmark, in one call: a central landmark, a
     * mirrored flanking pair, and a low scatter ring at its base. opts:
     *   landmark      prop name or (x,z,o)=>handle              default "statue"
     *   landmarkOpts  opts passed to the landmark builder       default {}
     *   flankProp     palette for the flanking pair             default "urn"
     *   flankGap      centre→flank distance                     default 1.5
     *   flankDir      separation axis angle (0 = x-axis)        default 0
     *   flankFace     "in" | "out" | number                    default "in"
     *   scatterProp   palette for the base scatter              default "rubble"
     *   scatterCount  scatter pieces around the base            default 3
     *   scatterRing   scatter radius                            default 1.8
     *   clear         keep-clear zones                          default []
     *   seed          variation seed                            default 3
     * Returns { center, flanks:[...], scatter:[...] }.
     */
    focal(cx, cz, opts = {}) {
      const {
        landmark = "statue", landmarkOpts = {}, seed = 3,
        flankProp = "urn", flankGap = 1.5, flankDir = 0, flankFace = "in",
        scatterProp = "rubble", scatterCount = 3, scatterRing = 1.8,
        clear = [],
      } = opts;
      const out = { center: null, flanks: [], scatter: [] };
      out.center = typeof landmark === "function"
        ? landmark(cx, cz, { ...landmarkOpts, seed })
        : kit[landmark](cx, cz, { ...landmarkOpts, seed });
      out.flanks = kit.flank(cx, cz, flankProp, {
        dir: flankDir, gap: flankGap, face: flankFace, seed: seed + 20, clear,
      });
      // keep the scatter off the landmark's own footprint too
      const baseClear = clear.concat([{ x: cx, z: cz, r: 0.8 }]);
      const norm = _normPalette(scatterProp);
      for (let i = 0; i < scatterCount; i++) {
        const s = seed + 40 + i * 5.5;
        const ang = (i / scatterCount) * Math.PI * 2 + rand(s) * 0.6;
        const dist = scatterRing * (0.7 + rand(s + 1) * 0.5);
        const px = cx + Math.cos(ang) * dist, pz = cz + Math.sin(ang) * dist;
        const entry = _pick(norm, rand(s + 2));
        const h = _tryPlace(entry, px, pz, rand(s + 3) * Math.PI * 2, s + 4, baseClear, null);
        if (h) out.scatter.push(h);
      }
      return out;
    },

    /**
     * CORNER-ANCHOR: tuck a cluster into a room corner, receding into the
     * corner so the tall pieces brace the walls. `which` is "nw"|"ne"|"sw"|"se".
     * opts: margin (inset from the walls, default 0.8) plus all cluster opts
     * (count, footprint, spread, clear, seed). Returns the cluster's handles.
     */
    corner(room, which, palette, opts = {}) {
      const { margin = 0.8 } = opts;
      const { x0, z0, x1, z1 } = room;
      const cx = which.includes("w") ? x0 + margin : x1 - margin;
      const cz = which.includes("s") ? z0 + margin : z1 - margin;
      const bx = which.includes("w") ? -1 : 1;         // point back into the corner
      const bz = which.includes("s") ? -1 : 1;
      return kit.cluster(cx, cz, palette, {
        footprint: 1.0, count: 3, spread: 0.6, ...opts,
        backDir: Math.atan2(bx, bz),
      });
    },

    /**
     * LEADING LINE: flank a path A→B on both sides to funnel the eye toward an
     * objective/exit at B. Like a two-sided wallRun. opts:
     *   spacing   step down the line                            default 2.2
     *   offset    half-width of the alley                       default 1.2
     *   converge  narrow the alley toward B (a forced-perspective default false
     *             funnel that pulls the eye onward)
     *   face      "in" (toward the alley) | "out" | number      default "in"
     *   jitter    along-line seeded jitter                      default 0.1
     *   clear     keep-clear zones                              default []
     *   seed      variation seed                                default 13
     * Returns the array of handles.
     */
    leadingLine(ax, az, bx, bz, palette, opts = {}) {
      const {
        spacing = 2.2, offset = 1.2, converge = false, seed = 13,
        face = "in", clear = [], jitter = 0.1,
      } = opts;
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      if (L < 1e-3) return [];
      const ux = dx / L, uz = dz / L;
      const nx = -uz, nz = ux;
      const norm = _normPalette(palette);
      const count = Math.max(1, Math.floor(L / spacing));
      const out = [];
      for (let i = 0; i <= count; i++) {
        const t = (i / count) * L;
        const off = converge ? offset * (1 - 0.6 * (t / L)) : offset;
        for (const sg of [1, -1]) {
          const s = seed + i * 6.1 + (sg > 0 ? 0 : 3);
          const jt = (rand(s) - 0.5) * 2 * jitter;
          const px = ax + ux * (t + jt) + nx * off * sg;
          const pz = az + uz * (t + jt) + nz * off * sg;
          const toLine = Math.atan2(-nx * sg, -nz * sg);   // face inward across the alley
          const rot = typeof face === "number" ? face
            : face === "out" ? toLine + Math.PI : toLine;
          const entry = _pick(norm, rand(s + 2));
          const nudge = { x: nx * sg, z: nz * sg };
          const h = _tryPlace(entry, px, pz, rot, s + 4, clear, nudge);
          if (h) out.push(h);
        }
      }
      return out;
    },
  };

  return kit;
}
