import * as THREE from "three";
import { collideCircle, circleHits, pointInHole, groundHeightAt } from "./physics.js";

/**
 * The player: an umbral blob — a void-black, morphing creature.
 *
 * - Movement: velocity/accel model, three stances (creep / flow / surge) which
 *   trade speed for silence. Footsteps emit NOISE events (the core Thief-style
 *   surface mechanic) consumed by wardens.
 * - Shadowstep: a short blink on a cooldown; cannot pass walls, must land on
 *   solid ground (can cross void gaps).
 * - Void vials: lobbed projectiles that douse torches where they land.
 * - The blob is a CPU-morphed icosphere (squash/stretch + idle wobble). Its
 *   BVH shadow comes from the base shape via updateDynamic() — close enough
 *   for a blob, and free.
 */

export const PLAYER_R = 0.42;
// The blob is SLOWER than a hunting warden (chase ≈ 3.2–3.6): once seen you
// cannot simply outrun them — you break line of sight, blink, or die. Mobility
// comes from the shadowstep, not foot speed. (The beacon breaks this rule on
// purpose for the finale — see carrySpeedMul.)
export const SPEEDS = { sneak: 1.35, walk: 2.3, run: 3.0 };
const ACCEL = 26;
const DAMPING = 11;
export const BLINK_RANGE = 5.0;
export const BLINK_CD = 4.0;   // shorter than before — the step is your lifeline now
export const THROW_DIST = 4.6;   // how far a lobbed vial travels
export const DOUSE_RADIUS = 2.1; // world radius a vial douses / its splash reach
export const SWALLOW_RANGE = 2.7; // reach of the maw (buffed) — a warden inside this, from behind, can be devoured
// Shadow is the blob's element: pitch dark ≈ beacon-carry speed (2.4×), full
// light drags it to a crawl. This is the core risk/reward — race through the
// dark, creep through the light.
const SHADOW_SPEED = 2.4;
const LIT_SPEED = 0.72;

// ---------------- GHIBLI-GOOP FEEL (each independently toggleable) ----------
// Diagnosis: the blob read as a RIGID BODY wearing effects — the roil, tail and
// smear all deform the surface but nothing gave it WEIGHT (a mass that pools
// under gravity and stays planted on the floor) or CONTACT (a body that presses
// against the world and peels away from its own footprint). These do that.
// All of it is pure vertex-loop / visual work: collider radius, speeds and
// every gameplay number are untouched.
const GOOP_SETTLE  = true; // 1) gravity pooling: rest-sag, base spread, meniscus lip, 0.15Hz breathing settle, slosh-rebound spring
const GOOP_PLANT   = true; // 1b) the belly stays PLANTED: vertical squash drops the crown instead of lifting the base off the floor
const GOOP_CONTACT = true; // 2) contact smear: flatten against a wall, bulge along it (goop pressed on glass)
const GOOP_POUR    = true; // 3) pour-into-motion: the base anchors then peels away on acceleration, the crown leads
const GOOP_DRIPS   = true; // 4) tiny droplets shed from the tail at high stretch

// (1) settle tuning
const SETTLE_SAG     = 0.18; // fraction of height lost at full rest-sag
const SETTLE_SPREAD  = 0.26; // base widening at full sag (the lost height goes sideways)
const SETTLE_LIP     = 0.12; // meniscus rim bulge where the base meets the ground
const SETTLE_CROWN   = 0.07; // crown narrowing at full sag (wider below than above)
const SETTLE_MIN     = 0.30; // sag floor while moving — the mass is ALWAYS bottom-heavy
const SETTLE_BREATHE = 0.15; // Hz of the idle breathing settle (rides under the roil)
const SETTLE_K       = 120;  // sag spring stiffness — underdamped, so a stop
const SETTLE_D       = 7.0;  //   lands with 1–2 diminishing slosh rebounds (~0.8s)

// (2) contact tuning
const CONTACT_FLAT  = 0.42; // max wallward compression (capped well short of a pancake)
const CONTACT_BULGE = 0.26; // tangential bulge along the wall plane (volume goes sideways)
const CONTACT_PUSH  = 0.30; // wall-side shove toward the plane (of PLAYER_R) — the flattened
                            // face must BUNCH UP AGAINST the wall, not hover off it
const CONTACT_RISE  = 12;   // how fast the press builds on touch
const CONTACT_FALL  = 5;    // how fast it recovers (the stretch spring adds the jiggle)

// (3) pour tuning
const POUR_MAX   = 0.55; // base-drag cap, in body radii
const POUR_CATCH = 3.5;  // base catch-up rate at rest…
const POUR_SNAP  = 15;   //  …plus this at full speed: the drag is BRIEF — peel, then follow
const POUR_LEAN  = 0.45; // the crown leads opposite the base drag (pouring forward)
const POUR_CRUISE = 0.35; // fraction of the drag kept at full speed — the peel is a
                          // DEPARTURE event; at cruise only a grounded trace remains

// (4) drip tuning
const DRIP_MAX     = 4;    // hard cap on live droplets (pooled, reused)
const DRIP_LIFE    = 0.42; // seconds to fall + fade
const DRIP_STRETCH = 1.85; // shed when the body is stretched past this
const DRIP_CD      = 0.09; // min seconds between sheds (a blink smear sheds ~2)

export class Player {
  constructor(scene, overlay) {
    this.scene = scene;
    this.fx = overlay || scene; // transparent HUD-in-world effects go here (plain forward pass)
    this.fxOpacity = 1;         // global multiplier from the Effects-opacity setting
    this._litSmooth = 0;        // time-smoothed litness → continuous shadow-speed
    const geo = new THREE.IcosahedronGeometry(PLAYER_R, 2);
    this.base = geo.getAttribute("position").array.slice();
    // per-vertex vertical-profile weights for the goop deformations, computed
    // ONCE from the base shape (zero per-frame allocation):
    //   pool:  1 at the belly → 0 above the equator (base spread / pour anchor)
    //   lip:   a narrow band just above the ground ring (the meniscus bulge)
    //   crown: 1 at the top → 0 below the equator (narrowing / forward lean)
    const vcount = this.base.length / 3;
    this._poolW = new Float32Array(vcount);
    this._lipW = new Float32Array(vcount);
    this._crownW = new Float32Array(vcount);
    for (let i = 0; i < vcount; i++) {
      const hN = Math.max(-1, Math.min(1, this.base[i * 3 + 1] / PLAYER_R));
      this._poolW[i] = Math.pow(Math.max(0, -hN), 1.4);
      const lip = (hN + 0.78) / 0.16;
      this._lipW[i] = Math.exp(-lip * lip);
      this._crownW[i] = Math.max(0, hN);
    }
    this.mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0x07080d, roughness: 0.32, metalness: 0.15,
        emissive: 0x241040, emissiveIntensity: 0.55,
      })
    );
    this.mesh.position.y = PLAYER_R;
    scene.add(this.mesh);

    // BEACON: while carrying a stolen relic, Hush stops being a shadow-thing and
    // becomes a LIGHT — the blob blazes amber and casts a real, moving point
    // light. Added here (before the RT compiles the scene) at intensity 0, ramped
    // in update() when carrySpeedMul>1. `_beaconGlow` is the 0→1 transition.
    this._beaconGlow = 0;
    this.beaconLight = new THREE.PointLight(0xffd8a0, 0, 14);
    this.beaconLight.userData.rtRadius = 0.3;
    scene.add(this.beaconLight);

    // BEACON MOLTEN POOL (0.6.0 dynamic NEE emitter): the PointLight above feeds
    // the analytic meter and is the KEY light, but casts no *area* light. So the
    // stolen light "leaks home" as an amber emissive DISC pooled at the blob's
    // feet — a real area light that underlights Hush and spills onto the floor +
    // nearby walls. Crucially the disc is OFF the body: the dark creature stays
    // FULLY VISIBLE above it, its goop morph (settle/pour/contact) intact, lit
    // from beneath. (A translucent shell was tried first but transparency
    // disqualifies a mesh from the NEE table — SceneCompiler skips any transparent
    // material at compile, verified: 0 emitter rows. So the pool is OPAQUE.)
    //
    // Runtime emissive changes do NOT reach the NEE table (the lib freezes emit
    // colour+intensity at compile and only re-derives world geometry + the power
    // CDF each updateDynamic — confirmed in SceneCompiler._refreshDynamicEmissive).
    // So the pool is COMPILED at full amber; we modulate its light at runtime by
    // SCALING the mesh: area→~0 when not carrying (no glow at spawn), growing with
    // _beaconGlow. The power CDF tracks area, so scale IS the dimmer. Compiling at
    // full scale also guarantees it survives the shared MAX_EMISSIVE_TRIS cap.
    // A DEEP amber emissive (not the pale blaze colour) holds hue instead of
    // clipping to white; the disc reads as molten light, not a lamp.
    // Radius 2.0x the body: an amber RING extends beyond the blob's footprint so
    // the pool is not fully occluded by the creature sitting on it — the exposed
    // ring spills onto the floor + grazes nearby walls, while the rim under the
    // blob underlights the goop.
    const poolR = PLAYER_R * 2.0;
    this.beaconPool = new THREE.Mesh(
      new THREE.CircleGeometry(poolR, 14), // 14 tris, up-facing when laid flat
      new THREE.MeshStandardMaterial({
        color: 0x000000, roughness: 1, metalness: 0,
        // DEEP amber holds hue at brightness instead of clipping to white.
        emissive: new THREE.Color(1.0, 0.6, 0.24), emissiveIntensity: 5.0,
        side: THREE.DoubleSide,
      })
    );
    this.beaconPool.rotation.x = -Math.PI / 2; // lie flat on the ground, normal +y
    // a SEPARATE scene object (not a child of the deforming body); update() places
    // it at the blob's feet each frame. Lifted a hair to avoid floor z-fighting.
    this.beaconPool.position.set(this.mesh.position.x, 0.04, this.mesh.position.z);
    scene.add(this.beaconPool);

    // eyes — rasterized glow only (rtExclude), they track the facing direction.
    // Calm violet normally; they smoulder RED while the maw is charged (hungry).
    this.eyeCalm = new THREE.Color(0xb9a0ff);
    this.eyeHungry = new THREE.Color(0xff2530);
    this.eyes = [];
    for (const s of [-1, 1]) {
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: this.eyeCalm.clone(), emissiveIntensity: 4 });
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), eyeMat);
      e.userData.rtExclude = true;
      e.userData.side = s;
      scene.add(e);
      this.eyes.push(e);
    }
    this._eyeColor = this.eyeCalm.clone();

    // engulf sac — a dark bulge the blob extrudes to envelop a warden it swallows
    this.engulf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(PLAYER_R, 2),
      new THREE.MeshStandardMaterial({
        color: 0x05060c, roughness: 0.4, metalness: 0.1,
        emissive: 0x3a0a14, emissiveIntensity: 1.0, transparent: true, opacity: 0.94,
      })
    );
    this.engulf.userData.rtExclude = true;
    this.engulf.visible = false;
    this.fx.add(this.engulf);
    this.engulfTarget = null;

    // douse reticle — just a subtle teal dot at the vial's predicted landing
    this.reticle = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 20),
      new THREE.MeshBasicMaterial({ color: 0x39f0c0, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    this.reticle.rotation.x = -Math.PI / 2;
    this.reticle.userData.rtExclude = true;
    this.reticle.renderOrder = 4;
    this.reticle.visible = false;
    this.fx.add(this.reticle);
    this._reticleOp = 0;

    // maw range ring — a thin red ring MESH (crosshair-style) shown while
    // hungry, marking how close a warden must be to be swallowed. A mesh, not a
    // line, so the ray tracer actually composites it.
    this.mawRing = new THREE.Mesh(
      new THREE.RingGeometry(SWALLOW_RANGE - 0.06, SWALLOW_RANGE, 64),
      new THREE.MeshBasicMaterial({ color: 0xff3a44, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    this.mawRing.rotation.x = -Math.PI / 2;
    this.mawRing.userData.rtExclude = true;
    this.mawRing.renderOrder = 4;
    this.mawRing.visible = false;
    this.fx.add(this.mawRing);
    this._mawOp = 0;

    // afterimage pool for the blink trail
    this.afterimages = [];
    const aiMat = new THREE.MeshBasicMaterial({ color: 0x6a48d8, transparent: true, opacity: 0, depthWrite: false });
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(PLAYER_R, 1), aiMat.clone());
      m.visible = false;
      m.userData.rtExclude = true;
      this.fx.add(m);
      this.afterimages.push({ mesh: m, t: 1, delay: 0 });
    }

    // droplet pool — tiny goop beads the tail sheds at high stretch. Pooled,
    // hard-capped, rtExclude (raster-only), each fades over DRIP_LIFE.
    this.drips = [];
    if (GOOP_DRIPS) {
      for (let i = 0; i < DRIP_MAX; i++) {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 6, 5),
          new THREE.MeshBasicMaterial({ color: 0x2a1650, transparent: true, opacity: 0, depthWrite: false })
        );
        m.visible = false;
        m.userData.rtExclude = true;
        this.fx.add(m);
        this.drips.push({ mesh: m, t: 1, vx: 0, vy: 0, vz: 0 });
      }
    }
    this._dripCd = 0;

    // thrown vials
    this.vials = [];
    this.vialGeo = new THREE.OctahedronGeometry(0.12);
    this.vialMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x39f0c0, emissiveIntensity: 2.5 });

    this.vel = new THREE.Vector3();
    this.facing = new THREE.Vector2(0, -1);
    this.morphDir = new THREE.Vector2(0, -1); // the BODY's axis — lags facing (fluid turns)
    this._stretchS = 1;  // sprung elongation (low viscosity: sloshes past its target)
    this._stretchV = 0;
    this._sag = 1;       // gravity-settle spring (1 = fully pooled at rest)
    this._sagV = 0;
    this._press = 0;     // contact-smear strength 0..1 (eased)
    this._pressT = 0;    // target set by move() when the collider corrects us
    this._cnX = 0; this._cnZ = 0;           // last contact normal (points AWAY from the wall)
    this._anchorX = 0; this._anchorZ = 0;   // the base's lagged footprint (pour-into-motion)
    this.vialCount = 0;
    this.blinkCd = 0;
    this.blinkCdMax = BLINK_CD; // actual cooldown of the last blink (for HUD + per-level buffs)
    this.blinkRange = BLINK_RANGE; // per-level upgradable (progression)
    this.growthCap = 0.42;      // how large devouring can make the blob
    this.maxHealthCap = 5;      // ceiling that devouring can raise maxHealth to
    this.carrySpeedMul = 1;     // >1 while carrying the beacon — the outrun finale
    this.strideAcc = 0;
    this.speedFrac = 0;   // smoothed 0..1 of run speed — drives morph + noise
    this.blinkAnim = 0;   // 1 → 0 after a blink
    this.falling = 0;     // >0 while falling into a void
    this.frozen = false;  // input locked (falling / caught)
    this.launch = 0;      // >0 while flung by a warden hit (physics fling, no input)
    this.groundY = 0;     // height of the surface the blob is standing on (verticality)

    // life: the blob shrinks as it takes hits, slowly regrows in safety
    this.maxHealth = 3;
    this.health = 3;
    this.scale = 1;
    this.invuln = 0;      // seconds of post-hit invulnerability
    this.sinceHit = 99;   // drives regrowth
    this.regenT = 0;

    // the maw: swallow wardens from behind. Charges are picked up (crimson
    // motes); each devour grows the blob a little.
    this.mawCharges = 0;
    this.growth = 0;      // permanent-this-level size bonus from devouring
    this.devourAnim = 0;  // 1 → 0 gulp squash pulse
    this.eyeFlash = 0;    // 1 → 0 red eye flare on a devour
  }

  /** Current body radius (shrinks with damage). */
  get radius() { return PLAYER_R * this.scale; }

  /** Maw reach — a bigger predator swallows from further. This is the REWARD
   *  that balances growth's exposure cost: the more you eat, the easier eating
   *  gets (longer reach), even as hiding gets harder. bulk 0 = base, maxed ≈ +50%. */
  get swallowRange() {
    const bulk = Math.min(1.4, Math.max(0, this.scale - 1));
    return SWALLOW_RANGE * (1 + bulk * 0.35);
  }

  /**
   * A warden connects. Knock the blob AWAY hard; it loses a chunk of itself.
   * Returns "dead" when the last chunk is gone, "hit" otherwise, null if immune.
   */
  hit(fromX, fromZ) {
    if (this.invuln > 0 || this.frozen) return null;
    this.health--;
    this.sinceHit = 0;
    this.invuln = 1.6;
    let dx = this.pos.x - fromX, dz = this.pos.z - fromZ;
    const l = Math.hypot(dx, dz) || 1;
    dx /= l; dz /= l;
    // FLING the blob away — a hard launch that resets the encounter. move()
    // lets this play out uncapped + bouncing off walls while `launch` runs.
    this.vel.x = dx * 17;
    this.vel.z = dz * 17;
    this.launch = 0.65;
    if (this.health <= 0) return "dead";
    return "hit";
  }

  healFull() {
    this.health = this.maxHealth;
    this.invuln = 0;
  }

  /** Swallow a warden: consume a maw charge, engulf it, gulp, and grow. */
  beginDevour(gx, gz) {
    this.mawCharges = Math.max(0, this.mawCharges - 1);
    this.growth = Math.min(this.growthCap, this.growth + 0.08); // visual bulk
    this.devourAnim = 1;
    this.eyeFlash = 1;
    if (gx != null) this.engulfTarget = { x: gx, z: gz };
    // EVERY feast adds a SIZE: +1 max life, and the new pip arrives filled —
    // grow past 3 and a 4th pip appears, past 4 a 5th, up to the cap. Dying
    // completely rebuilds a fresh 3-life blob (loadLevel without carry).
    if (this.maxHealth < this.maxHealthCap) {
      this.maxHealth++;
      this.health = Math.min(this.maxHealth, this.health + 1);
    }
  }

  get pos() { return this.mesh.position; }

  spawnAt(v) {
    this.groundY = v.y > 0.6 ? v.y - PLAYER_R : 0; // spawn on a deck if y is raised
    this.mesh.position.set(v.x, this.groundY + PLAYER_R, v.z);
    this.vel.set(0, 0, 0);
    this.falling = 0;
    this.frozen = false;
    this.launch = 0;
    this._anchorX = v.x; this._anchorZ = v.z;
    this._press = 0; this._pressT = 0;
    this._sag = 1; this._sagV = 0;
  }

  /**
   * Movement + footsteps. ctx: {input, level, onNoise(x,z,radius,surface), sfx}
   */
  move(dt, ctx) {
    const { input, level } = ctx;
    if (this.frozen) {
      this.vel.set(0, 0, 0);
      this._pressT = 0;
      return;
    }

    // --- flung by a hit: fly free, bounce off walls, no player control ---
    if (this.launch > 0) {
      this.launch -= dt;
      const d = Math.max(0, 1 - 3.0 * dt);   // air drag so the fling settles
      this.vel.x *= d; this.vel.z *= d;
      const speed = Math.hypot(this.vel.x, this.vel.z);
      const steps = Math.max(1, Math.ceil(speed * dt / 0.22)); // substep: never tunnel a wall
      if (GOOP_CONTACT) this._pressT = 0;
      for (let i = 0; i < steps; i++) {
        this.pos.x += (this.vel.x * dt) / steps;
        this.pos.z += (this.vel.z * dt) / steps;
        const preX = this.pos.x, preZ = this.pos.z;
        collideCircle(this.pos, this.radius, this.vel, level.boxes, level.cylinders, 0.7, this.groundY, this.radius * 2);
        // a wall bounce mid-fling SMEARS the body against the wall it hit
        if (GOOP_CONTACT) {
          const cx = this.pos.x - preX, cz = this.pos.z - preZ;
          const cl = Math.hypot(cx, cz);
          if (cl > 1e-5) {
            this._cnX = cx / cl; this._cnZ = cz / cl;
            this._pressT = Math.min(1, speed / 8);
          }
        }
      }
      const gf = groundHeightAt(this.pos.x, this.pos.z, level.platforms, level.ramps, this.groundY);
      if (gf > this.groundY) this.groundY = gf;
      else this.groundY += (gf - this.groundY) * Math.min(1, dt * 10);
      this.pos.y = this.groundY + this.radius;
      this.speedFrac += (Math.min(1, speed / SPEEDS.run) - this.speedFrac) * Math.min(1, dt * 8);
      this.facing.set(this.vel.x, this.vel.z);
      if (this.facing.lengthSq() > 0.01) this.facing.normalize();
      if (this.launch <= 0 || speed < 0.6) { this.launch = 0; } // land
      return;
    }

    let ix = input.move.x, iz = input.move.z;
    const moving = Math.hypot(ix, iz) > 0.01;
    let maxSpeed = SPEEDS.walk;
    if (input.sneak) maxSpeed = SPEEDS.sneak;
    else if (input.run) maxSpeed = SPEEDS.run;
    if (input.joy && input.joy.active) maxSpeed = Math.max(SPEEDS.sneak, SPEEDS.run * input.joy.mag);

    // LIGHT DRAG: darkness is the blob's element. In full shadow it POURS along
    // — as fast as it moves carrying the beacon — and near-silent; out in the
    // light it turns sluggish and loud. `lit` is 0 (pitch dark) → 1 (fully
    // exposed), supplied from the light gem.
    // how-lit-am-I drives speed, but the raw value SNAPS when line-of-sight to a
    // light flips on/off (that's what read as a "step"). Ease it over time so the
    // speed is a smooth continuous function of lighting, then map it with a
    // smoothstep through reasonable bounds (SHADOW_SPEED dark → LIT_SPEED lit).
    const litTarget = ctx.litness || 0;
    this._litSmooth += (litTarget - this._litSmooth) * Math.min(1, dt * 3.5);
    const e = this._litSmooth * this._litSmooth * (3 - 2 * this._litSmooth); // smoothstep
    const shadowSpeedMul = SHADOW_SPEED - e * (SHADOW_SPEED - LIT_SPEED);
    let mul = shadowSpeedMul;
    // the beacon guarantees a fast floor even out in the blazing open
    if (this.carrySpeedMul > 1) mul = Math.max(mul, this.carrySpeedMul);
    maxSpeed *= mul;

    if (moving) {
      this.vel.x += ix * ACCEL * dt;
      this.vel.z += iz * ACCEL * dt;
      this.facing.set(ix, iz).normalize();
    } else {
      const d = Math.max(0, 1 - DAMPING * dt);
      this.vel.x *= d; this.vel.z *= d;
    }
    const sp = Math.hypot(this.vel.x, this.vel.z);
    if (sp > maxSpeed) { this.vel.x = (this.vel.x / sp) * maxSpeed; this.vel.z = (this.vel.z / sp) * maxSpeed; }

    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    const preX = this.pos.x, preZ = this.pos.z;
    collideCircle(this.pos, this.radius, this.vel, level.boxes, level.cylinders, 0, this.groundY, this.radius * 2);
    // CONTACT: the collider's position correction IS the wall normal — no new
    // physics needed. Press strength = how hard the INPUT keeps driving into
    // the wall (so brushing past a corner barely registers, leaning in does).
    if (GOOP_CONTACT) {
      const cx = this.pos.x - preX, cz = this.pos.z - preZ;
      const cl = Math.hypot(cx, cz);
      if (cl > 1e-5) {
        this._cnX = cx / cl; this._cnZ = cz / cl;
        this._pressT = Math.min(1, Math.max(0, -(ix * this._cnX + iz * this._cnZ)) * 1.25);
      } else this._pressT = 0;
    }
    // VERTICALITY: settle onto the surface under our feet. Step UP snaps (a ramp
    // rises only a hair per frame; never sink into it); DROP eases (a soft fall
    // off a catwalk edge). Flat levels have no platforms/ramps → groundY stays 0.
    const g = groundHeightAt(this.pos.x, this.pos.z, level.platforms, level.ramps, this.groundY);
    if (g > this.groundY) this.groundY = g;
    else this.groundY += (g - this.groundY) * Math.min(1, dt * 10);
    this.pos.y = this.groundY + this.radius;

    // --- footsteps → noise events ---
    const speedNow = Math.hypot(this.vel.x, this.vel.z);
    this.speedFrac += (Math.min(1, speedNow / SPEEDS.run) - this.speedFrac) * Math.min(1, dt * 8);
    if (speedNow > 0.4) {
      this.strideAcc += speedNow * dt;
      const stride = 0.55 + speedNow * 0.16;
      if (this.strideAcc >= stride) {
        this.strideAcc = 0;
        const surf = ctx.surfaceAt(this.pos.x, this.pos.z);
        const stance = input.sneak ? 0.45 : 1;
        // shadow muffles your steps, light makes every footfall carry
        const lightNoise = 0.55 + this._litSmooth * 0.95; // ~0.55× dark → ~1.5× lit
        const radius = 8.5 * (speedNow / SPEEDS.run) * ctx.surfaceMult(surf) * stance * lightNoise;
        if (radius > 0.25) ctx.onNoise(this.pos.x, this.pos.z, radius, surf);
      }
    } else {
      this.strideAcc = 0;
    }
  }

  /** Attempt a shadowstep toward the input/facing direction. */
  tryBlink(ctx) {
    if (this.blinkCd > 0 || this.frozen) return false;
    let dx = ctx.input.move.x, dz = ctx.input.move.z;
    if (Math.hypot(dx, dz) < 0.01) { dx = this.facing.x; dz = this.facing.y; }
    const l = Math.hypot(dx, dz);
    dx /= l; dz /= l;

    // march outward; keep the farthest valid landing (clear of walls + not void)
    let best = 0;
    for (let d = 1.2; d <= this.blinkRange; d += 0.25) {
      const x = this.pos.x + dx * d, z = this.pos.z + dz * d;
      if (circleHits(x, z, this.radius * 0.9, ctx.level.boxes, ctx.level.cylinders, this.groundY, this.radius * 2)) break;
      if (pointInHole(x, z, ctx.level.holes)) continue; // may cross, not land
      best = d;
    }
    if (best < 1.2) { ctx.sfx.blinkFail(); return false; }

    const ox = this.pos.x, oz = this.pos.z; // origin, before the step

    // a slick trail of afterimages stretched along the step — still instant
    const steps = Math.min(6, Math.max(3, Math.round(best) + 1));
    for (let i = 0; i < steps; i++) {
      const f = (i / (steps - 1)) * 0.9;
      this._afterimage(ox + dx * best * f, oz + dz * best * f, i * 0.04);
    }
    this.pos.x += dx * best;
    this.pos.z += dz * best;
    // land on the surface under the blob (ramps/drops resolve like a step)
    this.groundY = groundHeightAt(this.pos.x, this.pos.z, ctx.level.platforms, ctx.level.ramps, this.groundY);
    this.pos.y = this.groundY + this.radius;
    this.blinkCdMax = BLINK_CD * (ctx.blinkCdMul || 1);
    this.blinkCd = this.blinkCdMax;
    this.blinkAnim = 1;
    // the body just POURED through space along (dx,dz): its axis is that
    // direction NOW — no lag — so the arrival smear stretches the right way
    this.morphDir.set(dx, dz);
    // a blink is a teleport: the footprint arrives WITH the body (the smear
    // owns the arrival — the base-drag must not fight it across 5 units)
    this._anchorX = this.pos.x; this._anchorZ = this.pos.z;
    this.eyeFlash = Math.max(this.eyeFlash, 0.6);
    ctx.sfx.blink();
    // origin implosion + landing shockwave (pure visuals — a blink is silent)
    ctx.onBlink && ctx.onBlink(ox, oz, this.pos.x, this.pos.z);
    return true;
  }

  /** Lob a void vial toward facing/move direction. */
  throwVial(ctx) {
    if (this.vialCount <= 0 || this.frozen) return false;
    let dx = ctx.input.move.x, dz = ctx.input.move.z;
    if (Math.hypot(dx, dz) < 0.01) { dx = this.facing.x; dz = this.facing.y; }
    const l = Math.hypot(dx, dz);
    dx /= l; dz /= l;
    this.vialCount--;
    const mesh = new THREE.Mesh(this.vialGeo, this.vialMat);
    mesh.userData.rtExclude = true;
    this.scene.add(mesh);
    const dist = THROW_DIST;
    this.vials.push({
      mesh, t: 0, dur: 0.55,
      x0: this.pos.x, z0: this.pos.z,
      x1: this.pos.x + dx * dist, z1: this.pos.z + dz * dist,
    });
    ctx.sfx.throwVial();
    return true;
  }

  _afterimage(x, z, delay = 0) {
    const a = this.afterimages.find((a) => a.t >= 1) || this.afterimages[0];
    a.mesh.position.set(x, this.pos.y, z);
    a.mesh.scale.set(1, 1, 1);
    a.mesh.visible = delay <= 0;
    a.t = -delay / 0.5; // staggered start: t<0 until the delay elapses
    a.delay = delay;
  }

  /** Per-frame visuals: morph, eyes, vials, cooldowns, afterimages. */
  update(dt, t, ctx) {
    this.blinkCd = Math.max(0, this.blinkCd - dt);
    this.blinkAnim = Math.max(0, this.blinkAnim - dt * 2.2); // ~0.45s: room for the smear's snap-back jiggle
    this.invuln = Math.max(0, this.invuln - dt);
    this.sinceHit += dt;
    this.devourAnim = Math.max(0, this.devourAnim - dt * 2.2);
    this.eyeFlash = Math.max(0, this.eyeFlash - dt * 2.5);

    // slow regrowth after ten quiet seconds
    if (this.health < this.maxHealth && this.sinceHit > 10) {
      this.regenT += dt;
      if (this.regenT > 6) { this.regenT = 0; this.health++; }
    }

    // body scale tracks remaining life + devour growth (unless mid-fall). Above
    // the default 3 lives the blob keeps GROWING — every extra life fattens it,
    // so a well-fed Hush is visibly a bigger creature.
    if (this.falling <= 0) {
      const lifeT = this.health >= 3 ? 1 : this.health === 2 ? 0.8 : 0.65;
      const bigLife = 1 + Math.max(0, this.maxHealth - 3) * 0.18; // >3 lives → larger
      // a gulp: quick swell then settle
      const gulp = 1 + this.devourAnim * (this.devourAnim > 0.5 ? -0.12 : 0.22);
      const target = lifeT * bigLife * (1 + this.growth) * gulp;
      this.scale += (target - this.scale) * Math.min(1, dt * 8);
      this.mesh.scale.setScalar(this.scale);
      // flicker while invulnerable
      this.mesh.material.emissiveIntensity = this.invuln > 0
        ? 0.55 + Math.sin(t * 30) * 0.4 : 0.55;
    }

    // BEACON transformation — shadow-monster → light-monster while carrying a
    // relic (carrySpeedMul>1). The blob's emissive lerps from its dark violet
    // toward blazing amber and a real point light kindles at its body; both fade
    // back if the beacon is ever dropped. Overrides the emissive set just above.
    const beaconOn = this.carrySpeedMul > 1 ? 1 : 0;
    this._beaconGlow += (beaconOn - this._beaconGlow) * Math.min(1, dt * 2.2);
    const bg = this._beaconGlow;
    if (bg > 0.01) {
      const em = this.mesh.material.emissive;
      // hue shifts to a deep EMBER (not bright amber): the emissive COLOUR itself
      // must stay dark or the near-black body renders pale after sRGB gamma.
      em.setRGB(0.141 + bg * (1.0 - 0.141), 0.063 + bg * (0.6 - 0.063), 0.251 + bg * (0.24 - 0.251));
      // DARK CREATURE, not a glowing ball: the self-emissive nearly EXTINGUISHES
      // during carry (~0.08) so the body is near-black albedo LIT FROM BENEATH by
      // the molten pool — a dark shadow-thing with an amber underglow gradient
      // (dark crown, molten belly), not a self-luminous ball. The amber BLAZE is
      // the pool + PointLight. (Director note: dark creature in an amber blaze.)
      this.mesh.material.emissiveIntensity = 0.55 - bg * 0.47 + Math.sin(t * 8) * 0.04 * bg;
      this.beaconLight.intensity = bg * 13.5 * (0.92 + Math.sin(t * 8) * 0.08);
      this.beaconLight.position.set(this.pos.x, this.pos.y + 0.25, this.pos.z);
    } else if (this.beaconLight.intensity !== 0) {
      this.beaconLight.intensity = 0;
    }
    // BEACON MOLTEN POOL area light: scale IS the dimmer (see constructor). It
    // pours from BENEATH the blob — placed at the feet (pos.x/z + groundY, lifted
    // a hair off the floor) so it follows Hush and underlights the goop while the
    // creature stays fully visible above it. Near-zero + hidden when not carrying
    // (no glow at spawn); RT registration is already baked at compile.
    if (this.beaconPool) {
      const bp = bg > 0.01 ? bg * (0.96 + Math.sin(t * 7) * 0.06) : 0.0015;
      this.beaconPool.scale.setScalar(bp);
      this.beaconPool.position.set(this.pos.x, this.groundY + 0.04, this.pos.z);
      this.beaconPool.visible = bg > 0.02;
    }

    // engulf: the blob reaches out a dark sac, swells to swallow the warden,
    // then draws it in — reads as the monster ENGULFING the guard.
    if (this.devourAnim > 0 && this.engulfTarget) {
      const p = 1 - this.devourAnim;                 // 0 → 1 over the anim
      const reach = Math.min(1, p * 2.2);            // sac travels to the guard first
      const cx = this.pos.x + (this.engulfTarget.x - this.pos.x) * reach;
      const cz = this.pos.z + (this.engulfTarget.z - this.pos.z) * reach;
      // swell to envelop (first half), then contract as it's absorbed (second half)
      const grow = p < 0.5 ? 0.5 + p * 2 * 1.7 : Math.max(0.001, 2.2 * (1 - (p - 0.5) * 2));
      this.engulf.visible = true;
      this.engulf.position.set(cx, this.groundY + 0.5 * this.scale + 0.1, cz);
      this.engulf.scale.setScalar(grow * this.scale);
      this.engulf.rotation.y += dt * 9;
      this.engulf.rotation.x += dt * 5;
      this.engulf.material.opacity = 0.94 * Math.min(1, this.devourAnim * 1.6);
    } else if (this.engulf.visible) {
      this.engulf.visible = false;
      this.engulfTarget = null;
    }

    // eyes smoulder red while hungry (maw charged), flaring on a devour.
    // The eyes stay LIT while carrying (only a slight dim): Hush is now a DARK
    // creature standing in the amber pool, so its glowing eyes are the read — the
    // old beacon-inversion (near-total dim) only made sense when the body blazed
    // white, which it no longer does.
    const hunger = this.mawCharges > 0 ? 1 : 0;
    this._eyeColor.lerp(hunger ? this.eyeHungry : this.eyeCalm, Math.min(1, dt * 6));
    const eyeGlow = (4 + hunger * (1.2 + Math.sin(t * 5) * 0.6) + this.eyeFlash * 8 + this.blinkAnim * 3)
      * (1 - this._beaconGlow * 0.2);
    for (const e of this.eyes) {
      e.material.emissive.copy(this._eyeColor);
      e.material.emissiveIntensity = eyeGlow;
    }

    // --- blob morph ---
    const posAttr = this.mesh.geometry.getAttribute("position");
    const arr = posAttr.array;
    const base = this.base;
    // FLUID TURNING: a solid pivots; a fluid reforms. The morph axis LAGS the
    // true facing (eased, ~0.2s), and while they disagree (`turn` 0 aligned →
    // 2 reversed) the elongation/tail collapse — the blob balls up, churns,
    // and re-pours along the new heading instead of rotating as a rigid shape.
    // eased in ANGLE space: lerp+normalize is degenerate on an exact 180°
    // reversal (the radial nudge normalizes straight back — the axis would
    // stick forever), and W→S reversals are routine on a keyboard.
    const md = this.morphDir;
    const ta = Math.atan2(this.facing.y, this.facing.x);
    let ma = Math.atan2(md.y, md.x);
    let dAng = ta - ma;
    while (dAng > Math.PI) dAng -= Math.PI * 2;
    while (dAng < -Math.PI) dAng += Math.PI * 2;
    ma += dAng * Math.min(1, dt * 5);
    md.set(Math.cos(ma), Math.sin(ma));
    const turn = Math.max(0, 1 - (md.x * this.facing.x + md.y * this.facing.y));
    const reform = 1 / (1 + turn * 2.2);
    const fx = md.x, fz = md.y;
    // SNAKE MORPH: the bigger Hush grows, the more a moving body ELONGATES —
    // a small blob just leans into its step, a well-fed one thins out into a
    // pouring blob-snake. At rest (speedFrac→0) it stays a round blob. `bigness`
    // rises with devour-growth and extra lives.
    const bigness = Math.min(1.4, this.growth * 1.8 + Math.max(0, this.maxHealth - 3) * 0.14);
    // BLINK SMEAR: a blink isn't a fade — it's liquid. The body SMEARS long on
    // arrival, then snaps back elastically, overshooting into a squash bounce
    // before settling (a damped oscillation over blinkAnim 1→0, ~3 half-swings).
    const bA = this.blinkAnim;
    const smear = bA > 0 ? Math.pow(bA, 1.3) * Math.cos((1 - bA) * Math.PI * 3) * 0.85 : 0;
    // speed-elongation collapses by `reform` mid-turn (balling up); the blink
    // smear does NOT — a blink snaps morphDir to its direction, turn ≈ 0.
    const stretchT = Math.max(0.4, 1 + this.speedFrac * (0.38 + bigness * 1.6) * reform);
    // LOW VISCOSITY: the elongation doesn't TRACK its target, it SLOSHES onto
    // it through an underdamped spring (ζ≈0.47) — every speed change and turn
    // overshoots ~17% and rings for ~1s. Water, not honey. The blink smear is
    // ALREADY its own damped oscillation and rides on top UNfiltered (its
    // ~3.3Hz swing sits past the spring's ~1.5Hz corner and would be eaten).
    // sdt caps the step so a background-tab dt spike can't blow the spring up.
    const sdt = Math.min(dt, 1 / 30);
    this._stretchV += ((stretchT - this._stretchS) * 90 - this._stretchV * 9) * sdt;
    this._stretchS += this._stretchV * sdt;
    const stretch = Math.min(5, Math.max(0.4,
      this._stretchS + (smear >= 0 ? smear : smear * 0.45)));
    // floor at 0.3: speed-squash + smear-squash can stack (big blob, full
    // sprint, mid-blink) and would flatten the body into a near-2D ribbon.
    // volume coupling on the SPRING's displacement: overshooting long flattens
    // extra, the rebound bulges (the smear's own squash term handles itself).
    const squash = Math.max(0.3,
      1 - this.speedFrac * (0.18 + bigness * 0.34) * reform - smear * 0.3
      - (this._stretchS - stretchT) * 0.3);
    const breathe = 1 + Math.sin(t * 2.1) * 0.03;
    // TRAILING TAIL: when pouring, the REAR of the body lags and tapers — the
    // silhouette becomes a comma/tadpole (heavy nose, droplet tail) instead of
    // a symmetric ellipse. Quadratic in `rear` so only the back end deforms;
    // grows with speed and with bigness (a well-fed blob trails a longer tail).
    const tailAmp = this.speedFrac * (0.55 + bigness * 0.6) * reform;
    // A body of living tar. TWO octaves of pseudo-noise make the surface ROIL
    // slowly (a churning gunk, not a rigid jitter): a broad slow swell plus a
    // finer faster ripple riding on it. It churns harder the faster you pour
    // (speedFrac), so a resting blob just breathes and a moving one boils.
    // churn harder mid-turn: the balled-up mass boils while it re-pours.
    // thinner fluid = livelier surface: more amplitude, slightly quicker swells
    const roil = (0.115 + this.speedFrac * 0.085) * (1 + turn * 1.2);

    // ---- GOOP: weight + contact + pour (scalar state, before the loop) ----
    // (1) GRAVITY SETTLE: restness rises as motion dies; the sag SPRING chases
    // it underdamped, so a stop lands with 1–2 diminishing slosh rebounds over
    // ~0.8s. Idle is never static — a slow 0.15Hz breathing settle rides the
    // target underneath the roil. Even at speed, sag keeps a floor: the mass
    // is always bottom-heavy.
    let sag = 0;
    if (GOOP_SETTLE) {
      const restness = 1 - Math.min(1, this.speedFrac * 2.6);
      const sagT = (SETTLE_MIN + (1 - SETTLE_MIN) * restness)
        * (1 + Math.sin(t * SETTLE_BREATHE * Math.PI * 2) * 0.12 * restness);
      this._sagV += ((sagT - this._sag) * SETTLE_K - this._sagV * SETTLE_D) * sdt;
      this._sag += this._sagV * sdt;
      sag = Math.max(0, Math.min(1.35, this._sag));
    }
    // (2) CONTACT SMEAR: ease toward what move() measured — fast on touch,
    // slower on release (the stretch spring supplies the recovery jiggle).
    if (GOOP_CONTACT) {
      const rate = this._pressT > this._press ? CONTACT_RISE : CONTACT_FALL;
      this._press += (this._pressT - this._press) * Math.min(1, dt * rate);
    }
    const press = GOOP_CONTACT ? this._press : 0;
    const wallX = -this._cnX, wallZ = -this._cnZ; // unit vector TOWARD the wall
    // (3) POUR-INTO-MOTION: the footprint anchor chases the body slowly from
    // rest and fast at speed — so departure DRAGS the base (peel-away) while
    // cruise carries it along. pourX/Z is the local-space base drag.
    let pourX = 0, pourZ = 0;
    if (GOOP_POUR) {
      const catchUp = POUR_CATCH + this.speedFrac * POUR_SNAP;
      this._anchorX += (this.pos.x - this._anchorX) * Math.min(1, dt * catchUp);
      this._anchorZ += (this.pos.z - this._anchorZ) * Math.min(1, dt * catchUp);
      // fade the drag with speed: at cruise the lag saturates the cap, and a
      // CONSTANT shear reads as a rig offset, not a peel — keep only a trace
      const fade = 1 - (1 - POUR_CRUISE) * this.speedFrac;
      pourX = ((this._anchorX - this.pos.x) / this.scale) * fade;
      pourZ = ((this._anchorZ - this.pos.z) / this.scale) * fade;
      const pl = Math.hypot(pourX, pourZ), pmax = POUR_MAX * PLAYER_R;
      if (pl > pmax) { pourX *= pmax / pl; pourZ *= pmax / pl; }
    }
    // GROUND PLANT: every vertical squash (speed, smear, sag) used to scale y
    // about the CENTRE, lifting the belly off the floor — the classic rigid-
    // body tell. Fold all vertical scaling into ySquash and translate the body
    // DOWN by the gap so the base always kisses the ground: squashing now
    // drops the crown instead of hovering the belly.
    const ySquash = squash * breathe * (1 - sag * SETTLE_SAG);
    const plant = GOOP_PLANT ? PLAYER_R * (1 - ySquash) : 0;

    for (let i = 0; i < arr.length; i += 3) {
      const idx = i / 3;
      const bx = base[i], by = base[i + 1], bz = base[i + 2];
      const n1 = Math.sin(t * 2.6 + bx * 6.1 + by * 4.7) * Math.sin(t * 2.0 + bz * 5.9);
      const n2 = Math.sin(t * 5.1 + bz * 8.3 + bx * 3.7) * Math.sin(t * 3.8 + by * 7.0);
      const w = 1 + roil * (n1 + n2 * 0.45);
      // pooling profile: base spreads + a meniscus lip at the ground ring,
      // crown narrows — wider below than above, like a settled drop
      let lat = 1;
      if (GOOP_SETTLE) {
        lat += sag * (SETTLE_SPREAD * this._poolW[idx]
          + SETTLE_LIP * this._lipW[idx]
          - SETTLE_CROWN * this._crownW[idx]);
      }
      let x = bx * w * lat, y = by * w, z = bz * w * lat;
      // directional squash/stretch (project onto facing)
      const along = x * fx + z * fz;
      x += fx * along * (stretch - 1);
      z += fz * along * (stretch - 1);
      // trailing tail: drag the rear hemisphere backward and pinch it toward
      // the tip (lateral + vertical taper) so it pours off as a droplet trail
      const rear = Math.max(0, -along) / 0.45;
      if (rear > 0 && tailAmp > 0.01) {
        const drag = tailAmp * rear * rear;
        x -= fx * drag * 0.6;
        z -= fz * drag * 0.6;
        const a2 = x * fx + z * fz;
        const pinch = 1 - Math.min(0.65, drag * 0.9);
        const lx = x - fx * a2, lz = z - fz * a2;
        x = fx * a2 + lx * pinch;
        z = fz * a2 + lz * pinch;
        y *= 1 - Math.min(0.5, drag * 0.7);
      }
      // CONTACT SMEAR: the wallward half flattens toward the contact plane and
      // the displaced volume bulges ALONG it (tangent + a little upward) — the
      // goop-pressed-on-glass look. k→0 at the body centre so it stays smooth.
      if (press > 0.02) {
        const aw = x * wallX + z * wallZ;
        if (aw > 0) {
          const k = aw / PLAYER_R;
          const flat = Math.min(0.6, CONTACT_FLAT * press * k);
          // compress toward the centre, then shove the flattened half back
          // AGAINST the plane (never past it: flat removes more than push adds)
          const shove = CONTACT_PUSH * PLAYER_R * press * k;
          x += wallX * (shove - aw * flat);
          z += wallZ * (shove - aw * flat);
          const tx = -wallZ, tz = wallX;
          const at = x * tx + z * tz;
          const bul = CONTACT_BULGE * press * k;
          x += tx * at * bul;
          z += tz * at * bul;
          y *= 1 + bul * 0.55;
        }
      }
      // POUR: the belly clings to the old footprint, the crown leans ahead —
      // acceleration reads as the mass peeling away and pouring forward.
      if (GOOP_POUR) {
        x += pourX * (this._poolW[idx] - POUR_LEAN * this._crownW[idx]);
        z += pourZ * (this._poolW[idx] - POUR_LEAN * this._crownW[idx]);
      }
      y *= ySquash;
      y -= plant;
      arr[i] = x; arr[i + 1] = y; arr[i + 2] = z;
    }
    posAttr.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();

    // falling into a void: sink + spin
    if (this.falling > 0) {
      this.falling -= dt;
      this.pos.y -= dt * 2.2;
      this.mesh.rotation.y += dt * 9;
      const s = Math.max(0.01, this.falling / 0.7);
      this.mesh.scale.set(s, s, s);
      if (this.falling <= 0) {
        this.mesh.scale.set(1, 1, 1);
        this.mesh.rotation.y = 0;
      }
    }

    // eyes ride the FRONT of the morphed body toward facing. The body STRETCHES
    // forward with speed (snake morph, `stretch` can reach ~3.6 on a big fast
    // blob) and SQUASHES vertically — so the eyes must ride out with that same
    // `stretch`, or the elongating nose swallows them, and sit down with `squash`
    // so they stay on the flattened surface rather than floating above it.
    // 0.38: the surface at the eyes' lateral offset sits at ~0.40*stretch, so
    // the eye centre must track close behind it — at 0.34 the gap (0.06*stretch)
    // outgrows the eye's fixed 0.055 poke-out radius on a big fast blob and the
    // roil re-submerges them.
    const eyeOut = 0.38 * stretch; // local units — scaled to world below
    for (const e of this.eyes) {
      const s = e.userData.side;
      let ox = fx * eyeOut - fz * s * 0.13;
      let oz = fz * eyeOut + fx * s * 0.13;
      // CONTACT: give the eyes the same flatten+shove as the face vertices, or
      // they'd hover in the gap the smear opened between skin and wall
      if (press > 0.02) {
        const aw = ox * wallX + oz * wallZ;
        if (aw > 0) {
          const k = aw / PLAYER_R;
          const flat = Math.min(0.6, CONTACT_FLAT * press * k);
          const shove = CONTACT_PUSH * PLAYER_R * press * k;
          ox += wallX * (shove - aw * flat);
          oz += wallZ * (shove - aw * flat);
        }
      }
      // ride the PLANTED, sagged surface: same vertical scale + drop as the body
      e.position.set(
        this.pos.x + ox * this.scale,
        this.pos.y + (0.13 * ySquash - plant) * this.scale,
        this.pos.z + oz * this.scale
      );
    }
    // douse reticle: a subtle dot marking where a vial would land. Present
    // when you hold vials; a touch clearer when you slow to aim.
    const wantReticle = this.vialCount > 0 && this.falling <= 0 && !this.frozen;
    const aimClarity = 1 - Math.min(1, this.speedFrac * 1.3); // still = clear
    const targetOp = wantReticle ? 0.08 + aimClarity * 0.17 : 0; // subtle
    this._reticleOp += (targetOp - this._reticleOp) * Math.min(1, dt * 8);
    if (this._reticleOp > 0.01) {
      this.reticle.visible = true;
      const rx = this.pos.x + this.facing.x * THROW_DIST;
      const rz = this.pos.z + this.facing.y * THROW_DIST;
      this.reticle.position.set(rx, this.groundY + 0.06, rz);
      this.reticle.material.opacity = this._reticleOp * this.fxOpacity;
    } else {
      this.reticle.visible = false;
    }

    // maw range ring — subtle red circle while a devour is charged
    const wantMaw = this.mawCharges > 0 && this.falling <= 0 && !this.frozen;
    this._mawOp += ((wantMaw ? 0.5 : 0) - this._mawOp) * Math.min(1, dt * 8);
    if (this._mawOp > 0.01) {
      this.mawRing.visible = true;
      this.mawRing.position.set(this.pos.x, this.groundY + 0.06, this.pos.z);
      this.mawRing.scale.setScalar(this.swallowRange / SWALLOW_RANGE); // ring shows the true (size-scaled) reach
      this.mawRing.material.opacity = this._mawOp * 0.8 * this.fxOpacity; // steady, no pulse
    } else {
      this.mawRing.visible = false;
    }

    // afterimages fade (staggered starts via negative t)
    for (const a of this.afterimages) {
      if (a.t >= 1) { a.mesh.visible = false; continue; }
      a.t = Math.min(1, a.t + dt / 0.5);
      if (a.t < 0) continue; // still waiting for its slot in the trail
      a.mesh.visible = true;
      a.mesh.material.opacity = 0.5 * (1 - a.t) * this.fxOpacity;
      const s = this.scale * (1 + a.t * 0.9);
      a.mesh.scale.set(s, s * (1 - a.t * 0.6), s);
    }

    // DRIPS: at high stretch (blink-smear peak, full pour) the goop can't quite
    // hold itself together — 1–2 tiny beads shed from the tail tip, fall, fade.
    // Pooled + hard-capped; raster-only (rtExclude); respects fxOpacity.
    if (GOOP_DRIPS) {
      this._dripCd -= dt;
      const wantDrip = (stretch > DRIP_STRETCH || this.blinkAnim > 0.72)
        && this.falling <= 0 && !this.frozen;
      if (wantDrip && this._dripCd <= 0) {
        const d = this.drips.find((d) => d.t >= 1);
        if (d) {
          this._dripCd = DRIP_CD;
          d.t = 0;
          const tipd = (0.42 * stretch + 0.2) * this.scale;
          d.mesh.position.set(
            this.pos.x - fx * tipd,
            this.groundY + this.radius * 0.55,
            this.pos.z - fz * tipd
          );
          d.vx = this.vel.x * 0.25 - fx * 0.5;
          d.vz = this.vel.z * 0.25 - fz * 0.5;
          d.vy = 1.1;
          d.mesh.scale.setScalar(0.7 + Math.random() * 0.6);
          d.mesh.visible = true;
        }
      }
      for (const d of this.drips) {
        if (d.t >= 1) { if (d.mesh.visible) d.mesh.visible = false; continue; }
        d.t += dt / DRIP_LIFE;
        d.vy -= 9.5 * dt;
        const m = d.mesh;
        m.position.x += d.vx * dt;
        m.position.y = Math.max(this.groundY + 0.03, m.position.y + d.vy * dt);
        m.position.z += d.vz * dt;
        m.material.opacity = Math.max(0, 0.85 * (1 - d.t * d.t)) * this.fxOpacity;
        if (d.t >= 1) m.visible = false;
      }
    }

    // vial projectiles
    for (let i = this.vials.length - 1; i >= 0; i--) {
      const v = this.vials[i];
      v.t += dt / v.dur;
      if (v.t >= 1) {
        this.scene.remove(v.mesh);
        this.vials.splice(i, 1);
        ctx.onVialLand(v.x1, v.z1);
      } else {
        const x = v.x0 + (v.x1 - v.x0) * v.t;
        const z = v.z0 + (v.z1 - v.z0) * v.t;
        const y = 0.4 + Math.sin(v.t * Math.PI) * 1.5;
        v.mesh.position.set(x, y, z);
        v.mesh.rotation.x += dt * 9;
      }
    }
  }
}
