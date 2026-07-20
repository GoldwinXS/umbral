import * as THREE from "three";
import { collideCircle, circleHits, pointInHole } from "./physics.js";

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
export const SPEEDS = { sneak: 1.7, walk: 3.7, run: 6.1 };
const ACCEL = 30;
const DAMPING = 11;
export const BLINK_RANGE = 5.0;
export const BLINK_CD = 6.0;
export const THROW_DIST = 4.6;   // how far a lobbed vial travels
export const DOUSE_RADIUS = 2.1; // world radius a vial douses / its splash reach

export class Player {
  constructor(scene) {
    this.scene = scene;
    const geo = new THREE.IcosahedronGeometry(PLAYER_R, 2);
    this.base = geo.getAttribute("position").array.slice();
    this.mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0x07080d, roughness: 0.32, metalness: 0.15,
        emissive: 0x241040, emissiveIntensity: 0.55,
      })
    );
    this.mesh.position.y = PLAYER_R;
    scene.add(this.mesh);

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

    // soft umbral aura under the blob — keeps the player readable in the dark
    this.aura = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 24),
      new THREE.MeshBasicMaterial({
        color: 0x7a52ff, transparent: true, opacity: 0.28,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    this.aura.rotation.x = -Math.PI / 2;
    this.aura.userData.rtExclude = true;
    scene.add(this.aura);

    // douse reticle — shows the vial's predicted landing + effective radius
    this.reticle = new THREE.Group();
    const douseRing = new THREE.Mesh(
      new THREE.RingGeometry(DOUSE_RADIUS - 0.08, DOUSE_RADIUS, 44),
      new THREE.MeshBasicMaterial({ color: 0x39f0c0, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
    );
    douseRing.rotation.x = -Math.PI / 2;
    this.reticle.add(douseRing);
    const pip = new THREE.Mesh(
      new THREE.CircleGeometry(0.14, 16),
      new THREE.MeshBasicMaterial({ color: 0x39f0c0, transparent: true, opacity: 0.8, depthWrite: false })
    );
    pip.rotation.x = -Math.PI / 2;
    this.reticle.add(pip);
    // crosshair ticks
    for (let a = 0; a < 4; a++) {
      const tick = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.05),
        new THREE.MeshBasicMaterial({ color: 0x39f0c0, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false })
      );
      tick.rotation.x = -Math.PI / 2;
      tick.rotation.z = a * Math.PI / 2;
      tick.position.set(Math.cos(a * Math.PI / 2) * (DOUSE_RADIUS - 0.35), 0, Math.sin(a * Math.PI / 2) * (DOUSE_RADIUS - 0.35));
      this.reticle.add(tick);
    }
    this.reticle.traverse((o) => { o.userData.rtExclude = true; });
    this.reticle.visible = false;
    scene.add(this.reticle);
    this._reticleOp = 0;

    // afterimage pool for the blink trail
    this.afterimages = [];
    const aiMat = new THREE.MeshBasicMaterial({ color: 0x6a48d8, transparent: true, opacity: 0, depthWrite: false });
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(PLAYER_R, 1), aiMat.clone());
      m.visible = false;
      m.userData.rtExclude = true;
      scene.add(m);
      this.afterimages.push({ mesh: m, t: 1, delay: 0 });
    }

    // thrown vials
    this.vials = [];
    this.vialGeo = new THREE.OctahedronGeometry(0.12);
    this.vialMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x39f0c0, emissiveIntensity: 2.5 });

    this.vel = new THREE.Vector3();
    this.facing = new THREE.Vector2(0, -1);
    this.vialCount = 0;
    this.blinkCd = 0;
    this.strideAcc = 0;
    this.speedFrac = 0;   // smoothed 0..1 of run speed — drives morph + noise
    this.blinkAnim = 0;   // 1 → 0 after a blink
    this.falling = 0;     // >0 while falling into a void
    this.frozen = false;  // input locked (falling / caught)

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
    this.vel.x = dx * 13;
    this.vel.z = dz * 13;
    if (this.health <= 0) return "dead";
    return "hit";
  }

  healFull() {
    this.health = this.maxHealth;
    this.invuln = 0;
  }

  /** Swallow a warden: consume a maw charge, gulp, and grow a little. */
  beginDevour() {
    this.mawCharges = Math.max(0, this.mawCharges - 1);
    this.growth = Math.min(0.42, this.growth + 0.08); // cap the bloat
    this.devourAnim = 1;
    this.eyeFlash = 1;
    // every third feast thickens the hide — one more hit to spare
    if (this.growth > 0 && Math.round(this.growth / 0.08) % 3 === 0 && this.maxHealth < 5) {
      this.maxHealth++;
      this.health = Math.min(this.maxHealth, this.health + 1);
    }
  }

  get pos() { return this.mesh.position; }

  spawnAt(v) {
    this.mesh.position.set(v.x, PLAYER_R, v.z);
    this.vel.set(0, 0, 0);
    this.falling = 0;
    this.frozen = false;
  }

  /**
   * Movement + footsteps. ctx: {input, level, onNoise(x,z,radius,surface), sfx}
   */
  move(dt, ctx) {
    const { input, level } = ctx;
    if (this.frozen) {
      this.vel.set(0, 0, 0);
      return;
    }
    let ix = input.move.x, iz = input.move.z;
    const moving = Math.hypot(ix, iz) > 0.01;
    let maxSpeed = SPEEDS.walk;
    if (input.sneak) maxSpeed = SPEEDS.sneak;
    else if (input.run) maxSpeed = SPEEDS.run;
    if (input.joy && input.joy.active) maxSpeed = Math.max(SPEEDS.sneak, SPEEDS.run * input.joy.mag);

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
    collideCircle(this.pos, this.radius, this.vel, level.boxes, level.cylinders);
    this.pos.y = this.radius;

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
        const radius = 8.5 * (speedNow / SPEEDS.run) * ctx.surfaceMult(surf) * stance;
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
    for (let d = 1.2; d <= BLINK_RANGE; d += 0.25) {
      const x = this.pos.x + dx * d, z = this.pos.z + dz * d;
      if (circleHits(x, z, this.radius * 0.9, ctx.level.boxes, ctx.level.cylinders)) break;
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
    this.blinkCd = BLINK_CD;
    this.blinkAnim = 1;
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
    this.blinkAnim = Math.max(0, this.blinkAnim - dt * 4);
    this.invuln = Math.max(0, this.invuln - dt);
    this.sinceHit += dt;
    this.devourAnim = Math.max(0, this.devourAnim - dt * 2.2);
    this.eyeFlash = Math.max(0, this.eyeFlash - dt * 2.5);

    // slow regrowth after ten quiet seconds
    if (this.health < this.maxHealth && this.sinceHit > 10) {
      this.regenT += dt;
      if (this.regenT > 6) { this.regenT = 0; this.health++; }
    }

    // body scale tracks remaining life + devour growth (unless mid-fall)
    if (this.falling <= 0) {
      const lifeT = this.health >= 3 ? 1 : this.health === 2 ? 0.8 : 0.65;
      // a gulp: quick swell then settle
      const gulp = 1 + this.devourAnim * (this.devourAnim > 0.5 ? -0.12 : 0.22);
      const target = lifeT * (1 + this.growth) * gulp;
      this.scale += (target - this.scale) * Math.min(1, dt * 8);
      this.mesh.scale.setScalar(this.scale);
      // flicker while invulnerable
      this.mesh.material.emissiveIntensity = this.invuln > 0
        ? 0.55 + Math.sin(t * 30) * 0.4 : 0.55;
    }

    // eyes smoulder red while hungry (maw charged), flaring on a devour
    const hunger = this.mawCharges > 0 ? 1 : 0;
    this._eyeColor.lerp(hunger ? this.eyeHungry : this.eyeCalm, Math.min(1, dt * 6));
    const eyeGlow = 4 + hunger * (1.2 + Math.sin(t * 5) * 0.6) + this.eyeFlash * 8 + this.blinkAnim * 3;
    for (const e of this.eyes) {
      e.material.emissive.copy(this._eyeColor);
      e.material.emissiveIntensity = eyeGlow;
    }

    // --- blob morph ---
    const posAttr = this.mesh.geometry.getAttribute("position");
    const arr = posAttr.array;
    const base = this.base;
    const fx = this.facing.x, fz = this.facing.y;
    const stretch = 1 + this.speedFrac * 0.38 + this.blinkAnim * 0.5;
    const squash = 1 - this.speedFrac * 0.18 - this.blinkAnim * 0.25;
    const breathe = 1 + Math.sin(t * 2.1) * 0.03;
    for (let i = 0; i < arr.length; i += 3) {
      const bx = base[i], by = base[i + 1], bz = base[i + 2];
      // wobble: cheap pseudo-noise from the base direction
      const w = 1 + 0.09 * Math.sin(t * 3.3 + bx * 7.1 + by * 5.3) * Math.sin(t * 2.2 + bz * 6.7);
      let x = bx * w, y = by * w, z = bz * w;
      // directional squash/stretch (project onto facing)
      const along = x * fx + z * fz;
      x += fx * along * (stretch - 1);
      z += fz * along * (stretch - 1);
      y *= squash * breathe;
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

    // eyes ride the surface toward the facing direction
    const eyeOut = (0.34 + this.speedFrac * 0.05) * this.scale;
    for (const e of this.eyes) {
      const s = e.userData.side;
      const px = this.pos.x + fx * eyeOut - fz * s * 0.13 * this.scale;
      const pz = this.pos.z + fz * eyeOut + fx * s * 0.13 * this.scale;
      e.position.set(px, this.pos.y + 0.13 * this.scale, pz);
    }
    // aura hugs the floor under the blob, brightens a touch when lit
    this.aura.position.set(this.pos.x, 0.035, this.pos.z);
    this.aura.scale.setScalar(this.scale);
    this.aura.material.opacity = 0.22 + this.speedFrac * 0.1 + this.blinkAnim * 0.3;

    // douse reticle: shows where a vial lands + its effective radius. Present
    // when you hold vials; sharpens when you slow to aim, dims at a sprint.
    const wantReticle = this.vialCount > 0 && this.falling <= 0 && !this.frozen;
    const aimClarity = 1 - Math.min(1, this.speedFrac * 1.3); // still = clear
    const targetOp = wantReticle ? 0.25 + aimClarity * 0.75 : 0;
    this._reticleOp += (targetOp - this._reticleOp) * Math.min(1, dt * 8);
    if (this._reticleOp > 0.01) {
      this.reticle.visible = true;
      const rx = this.pos.x + this.facing.x * THROW_DIST;
      const rz = this.pos.z + this.facing.y * THROW_DIST;
      this.reticle.position.set(rx, 0.06, rz);
      const pulse = 1 + Math.sin(t * 4) * 0.03;
      this.reticle.scale.setScalar(pulse);
      this.reticle.traverse((o) => {
        if (o.material) o.material.opacity = (o.userData.baseOp ?? (o.userData.baseOp = o.material.opacity)) * this._reticleOp;
      });
    } else {
      this.reticle.visible = false;
    }

    // afterimages fade (staggered starts via negative t)
    for (const a of this.afterimages) {
      if (a.t >= 1) { a.mesh.visible = false; continue; }
      a.t = Math.min(1, a.t + dt / 0.5);
      if (a.t < 0) continue; // still waiting for its slot in the trail
      a.mesh.visible = true;
      a.mesh.material.opacity = 0.5 * (1 - a.t);
      const s = this.scale * (1 + a.t * 0.9);
      a.mesh.scale.set(s, s * (1 - a.t * 0.6), s);
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
