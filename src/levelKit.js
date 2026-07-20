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
  crystal:  { mult: 1.5,  color: 0x46607c, rough: 0.24, metal: 0.8 },
};

export function makeKit(scene) {
  const mats = {
    floor: new THREE.MeshStandardMaterial({ color: 0x20242f, roughness: 0.88, metalness: 0.05 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x2b3148, roughness: 0.92 }),
    block: new THREE.MeshStandardMaterial({ color: 0x363e56, roughness: 0.8 }),
    pillar: new THREE.MeshStandardMaterial({ color: 0x3d4560, roughness: 0.65, metalness: 0.1 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x171b26, roughness: 0.95 }),
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

  const kit = {
    mats,
    bag,

    /** Solid box: mesh + occluder + OBB collider. Walls, crates, cover. */
    solid(w, h, d, x, z, mat = mats.block, rot = 0, y = h / 2) {
      const m = new THREE.Mesh(boxGeo(w, h, d), mat);
      m.position.set(x, y, z);
      m.rotation.y = rot;
      scene.add(m);
      bag.occluders.push(m);
      bag.boxes.push({ x, z, hx: w / 2, hz: d / 2, rot, enabled: true });
      return m;
    },

    /** Wall segment helper (axis-aligned). */
    wall(w, h, d, x, z, y = h / 2) {
      return kit.solid(w, h, d, x, z, mats.wall, 0, y);
    },

    /** Cylinder: mesh + occluder + circle collider. */
    pillar(r, h, x, z, mat = mats.pillar) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 18), mat);
      m.position.set(x, h / 2, z);
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

    /** Douseable torch/lamp: PointLight + pole + rtExclude flame. */
    torch(x, z, { color = 0xffb36b, intensity = 6, range = 9, h = 2.2 } = {}) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, h, 8), mats.dark);
      pole.position.set(x, h / 2, z);
      scene.add(pole);
      bag.occluders.push(pole);
      const light = new THREE.PointLight(color, intensity, range);
      light.position.set(x, h + 0.15, z);
      light.userData.rtRadius = 0.12;
      scene.add(light);
      const flame = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16),
        new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 5 })
      );
      flame.position.set(x, h + 0.15, z);
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
     * A fog bank: a stealth-cover volume. Registers a concealment zone (wardens
     * see you far worse inside it) AND draws a drifting, visible haze so the
     * cover reads. conceal 0..1 = how much it blunts warden vision.
     */
    fogPatch(x0, z0, x1, z1, { conceal = 0.7, density = 0.05, color = 0xa9c4e6, puffs = 7 } = {}) {
      bag.fogZones.push({ min: [x0, -1, z0], max: [x1, 6, z1], density, conceal });
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      const w = x1 - x0, d = z1 - z0;
      const tex = hazeTex();
      const group = new THREE.Group();
      for (let i = 0; i < puffs; i++) {
        const s = Math.min(w, d) * (0.55 + Math.random() * 0.5);
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(s, s),
          new THREE.MeshBasicMaterial({
            map: tex, color, transparent: true, opacity: 0.1 + Math.random() * 0.08,
            depthWrite: false, blending: THREE.NormalBlending,
          })
        );
        m.rotation.x = -Math.PI / 2;
        m.position.set(
          cx + (Math.random() - 0.5) * w * 0.7,
          0.35 + Math.random() * 1.3,
          cz + (Math.random() - 0.5) * d * 0.7
        );
        m.userData.rtExclude = true;
        m.userData.drift = 0.1 + Math.random() * 0.2;
        m.userData.phase = Math.random() * Math.PI * 2;
        m.userData.baseX = m.position.x;
        m.userData.baseZ = m.position.z;
        m.renderOrder = 2;
        group.add(m);
      }
      scene.add(group);
      bag.fogGroups = bag.fogGroups || [];
      bag.fogGroups.push(group);
      return group;
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

    /** Guard spec: path of [x,z] waypoints (loops). */
    guard(path, opts = {}) {
      bag.guards.push({
        path,
        speed: opts.speed ?? 1.5,
        pause: opts.pause ?? 1.2,     // seconds at each waypoint
        range: opts.range ?? 12,      // vision range
        coneAngle: opts.coneAngle ?? 0.62,
        color: opts.color ?? 0xffd9a0,
      });
      return bag.guards[bag.guards.length - 1];
    },
  };

  return kit;
}
