import * as THREE from "three";
import { collideCircle } from "./physics.js";

/**
 * A Lumen Warden — a floating lantern-sentinel. It sees LIGHT, not the player:
 * vision gain scales with how lit the player is (the light-gem mechanic).
 * It also hears noise events.
 *
 * States: patrol → suspect (investigates a point) → chase (knows/last-known
 * position, catches on contact) → search → patrol. "out" when knocked out
 * from behind. Its spot cone IS its vision; cone colour broadcasts state
 * (amber calm / orange suspicious / red hunting).
 */

const CALM = new THREE.Color(0xffd9a0);
const SUSPECT = new THREE.Color(0xff9440);
const CHASE = new THREE.Color(0xff4a4a);
const OUT = new THREE.Color(0x1a1c22);

export class Warden {
  constructor(scene, spec) {
    this.scene = scene;
    this.spec = spec;
    this.pos = new THREE.Vector3(spec.path[0][0], 1.45, spec.path[0][1]);
    this.vel = new THREE.Vector3();
    this.angle = Math.atan2(
      spec.path[1] ? spec.path[1][1] - spec.path[0][1] : 0,
      spec.path[1] ? spec.path[1][0] - spec.path[0][0] : 1
    );
    this.state = "patrol";
    this.alertness = 0;
    this.wp = 1;
    this.pauseT = 0;
    this.scanT = 0;
    this.investigate = new THREE.Vector2();
    this.lastKnown = new THREE.Vector2();
    this.lostT = 0;
    this.searchPts = [];
    this.tip = 0; // knockout tip-over animation
    this.deathStyle = null; // "swallow" when devoured
    this.swallowT = 0;      // 0→1 swallow animation progress
    this.bobPhase = Math.random() * Math.PI * 2;
    this.alertCounted = false;

    // --- body (dynamic mesh → casts a real moving shadow) ---
    this.body = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.34, 0),
      new THREE.MeshStandardMaterial({ color: 0x11131c, roughness: 0.35, metalness: 0.85 })
    );
    this.body.position.copy(this.pos);
    scene.add(this.body);

    // --- glowing core (rasterized only) ---
    this.core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.17),
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: CALM.clone(), emissiveIntensity: 4 })
    );
    this.core.userData.rtExclude = true;
    scene.add(this.core);

    // --- vision cone = spot light ---
    const l = new THREE.SpotLight(spec.color, 30, spec.range + 7, spec.coneAngle, 0.4);
    l.position.set(this.pos.x, 2.7, this.pos.z);
    l.userData.rtRadius = 0.12;
    scene.add(l);
    scene.add(l.target);
    this.light = l;
    this._lightColor = CALM.clone();
  }

  get fx() { return Math.cos(this.angle); }
  get fz() { return Math.sin(this.angle); }

  /** A noise happened at (x,z) audible within `radius`. */
  hearNoise(x, z, radius, game) {
    if (this.state === "out") return;
    const d = Math.hypot(x - this.pos.x, z - this.pos.z);
    if (d > radius) return;
    const bump = (1 - d / radius) * 0.8;
    const before = this.alertness;
    this.alertness = Math.min(1, this.alertness + bump);
    if (this.state !== "chase") {
      this.investigate.set(x, z);
      if (this.alertness >= 0.92) this._toChase(game);
      else if (this.alertness >= 0.4 && this.state === "patrol") this._toSuspect(game);
    }
    if (before < 0.4 && this.alertness >= 0.4) game.sfx.suspicious();
  }

  /** Is the point (x,z) within the warden's rear ~109° arc (a safe approach)? */
  isBehind(x, z) {
    const dx = this.pos.x - x, dz = this.pos.z - z;
    return this.fx * -dx + this.fz * -dz < Math.cos(1.9);
  }

  /** Swallowed from behind by the charged maw. Sinks into the blob. */
  devour(game) {
    if (this.state === "out") return null;
    this.state = "out";
    this.alertness = 0;
    this.deathStyle = "swallow";
    this.swallowT = 0.0001;
    this.light.intensity = 0;
    return "devour";
  }

  /** A shove with no charge: staggers the warden and gives it a fright. */
  stagger(game) {
    if (this.state === "out") return null;
    this.alertness = Math.min(1, this.alertness + 0.5);
    this.investigate.set(game.player.pos.x, game.player.pos.z);
    if (this.alertness >= 0.92) this._toChase(game);
    else if (this.state === "patrol") this._toSuspect(game);
    return "stagger";
  }

  /** Frontal strike attempt: it feels the whoosh and turns hostile. */
  tryStrike(x, z, game) {
    if (this.state === "out") return null;
    const dx = this.pos.x - x, dz = this.pos.z - z;
    if (Math.hypot(dx, dz) > 1.6) return null;
    this.alertness = Math.min(1, this.alertness + 0.55);
    this.investigate.set(x, z);
    if (this.alertness >= 0.92) this._toChase(game);
    else if (this.state === "patrol") this._toSuspect(game);
    return "whiff";
  }

  _toSuspect(game) {
    this.state = "suspect";
    this.scanT = 0;
  }

  _toChase(game) {
    if (this.state !== "chase") {
      this.state = "chase";
      this.lostT = 0;
      if (!this.alertCounted) { this.alertCounted = true; game.onAlert(); }
      game.sfx.alert();
    }
  }

  reset(path0Only = false) {
    if (this.state === "out") return; // the fallen stay fallen
    this.state = "patrol";
    this.alertness = 0;
    this.lostT = 0;
    this.alertCounted = false;
    if (path0Only) {
      this.pos.set(this.spec.path[0][0], 1.45, this.spec.path[0][1]);
      this.wp = 1;
    }
  }

  /**
   * Can this warden catch the player's reflection in a mirror pool? True when
   * the player stands over/near a reflector and the warden's cone has clear
   * line-of-sight to that pool (even if not to the player directly).
   */
  _seesReflection(game, spec) {
    const refs = game.level.reflectors;
    if (!refs || !refs.length) return false;
    const p = game.player.pos;
    for (const rf of refs) {
      if (Math.hypot(p.x - rf.x, p.z - rf.z) > rf.r + 1.4) continue;  // must be over the pool
      const dwr = Math.hypot(rf.x - this.pos.x, rf.z - this.pos.z);
      if (dwr > spec.range) continue;                                 // pool within sight range
      const toR = Math.atan2(rf.z - this.pos.z, rf.x - this.pos.x);
      let diff = toR - this.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) > spec.coneAngle * 1.1) continue;            // pool in the cone
      if (!game.los(this.pos.x, 2.2, this.pos.z, rf.x, 0.2, rf.z)) continue;
      return true;
    }
    return false;
  }

  _moveToward(tx, tz, speed, dt, game) {
    const dx = tx - this.pos.x, dz = tz - this.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.3) return true;
    const step = Math.min(d, speed * dt);
    this.pos.x += (dx / d) * step;
    this.pos.z += (dz / d) * step;
    collideCircle(this.pos, 0.3, null, game.level.boxes, game.level.cylinders);
    // face travel direction smoothly
    const want = Math.atan2(dz, dx);
    let diff = want - this.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.angle += diff * Math.min(1, dt * 6);
    return d - step < 0.3;
  }

  update(dt, t, game) {
    const spec = this.spec;

    if (this.state === "out") {
      if (this.deathStyle === "swallow" && this.swallowT < 1) {
        // enveloped in place by the blob's engulf sac: crumple, sink, wink out
        this.swallowT = Math.min(1, this.swallowT + dt * 3.0);
        const e = this.swallowT;
        const s = Math.max(0.001, 1 - e * e);
        this.body.scale.setScalar(s);
        this.core.scale.setScalar(s);
        this.body.position.set(this.pos.x, 1.45 - e * 0.6, this.pos.z);
        this.body.rotation.z = e * 1.2;
        this.core.position.copy(this.body.position);
        this.core.material.emissive.copy(CHASE);
        if (this.swallowT >= 1) { this.body.visible = false; this.core.visible = false; }
        return;
      }
      // tip over and sink (legacy fallback)
      if (this.tip > 0) {
        this.tip = Math.min(1, this.tip + dt * 2.5);
        this.body.rotation.z = this.tip * 1.5;
        this.body.position.y = 1.45 - this.tip * 1.1;
        this.core.position.y = this.body.position.y + 0.1;
        if (this.tip >= 1) this.tip = 0;
      }
      this._syncVisual(t, OUT);
      return;
    }

    const p = game.player.pos;
    const dx = p.x - this.pos.x, dz = p.z - this.pos.z;
    const dist = Math.hypot(dx, dz);

    // ---------- vision ----------
    let sees = false;
    if (dist < spec.range && !game.playerHidden) {
      const toP = Math.atan2(dz, dx);
      let diff = toP - this.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) < spec.coneAngle * 1.05) {
        if (game.los(this.pos.x, 2.2, this.pos.z, p.x, 0.5, p.z)) sees = true;
      }
    }
    // reflected sight: a lit blob over a still mirror pool is given away even
    // behind cover, if the warden's cone catches the pool.
    let reflMul = 1;
    if (!sees && !game.playerHidden) sees = this._seesReflection(game, spec) && (reflMul = 0.8, true);

    if (sees) {
      // fog cover blunts recognition sharply; sneaking helps too
      const fog = 1 - (game.fogCover || 0);
      const effVis = game.playerVis * (game.playerSneaking ? 0.65 : 1) * fog * reflMul;
      const gain = effVis * (1.3 - dist / spec.range) * 1.9;
      this.alertness = Math.min(1, this.alertness + Math.max(0, gain) * dt);
      this.lastKnown.set(p.x, p.z);
      this.lostT = 0;
      if (this.alertness >= 0.92) this._toChase(game);
      else if (this.alertness >= 0.4 && this.state === "patrol") {
        this.investigate.set(p.x, p.z);
        this._toSuspect(game);
        game.sfx.suspicious();
      }
    } else if (this.state !== "chase" && this.state !== "search") {
      this.alertness = Math.max(0, this.alertness - 0.13 * dt);
    }

    // close proximity: they sense the blob even unlit
    if (dist < 1.9 && this.state !== "chase") {
      this.alertness = Math.min(1, this.alertness + 0.85 * dt);
      this.investigate.set(p.x, p.z);
      if (this.alertness >= 0.92) this._toChase(game);
      else if (this.state === "patrol") this._toSuspect(game);
    }

    // ---------- state behaviour ----------
    if (this.state === "patrol") {
      if (this.pauseT > 0) {
        this.pauseT -= dt;
        this.angle += Math.sin(t * 1.4 + this.bobPhase) * dt * 0.8; // idle scan
      } else {
        const [tx, tz] = spec.path[this.wp];
        if (this._moveToward(tx, tz, spec.speed * game.guardSpeedMul, dt, game)) {
          this.wp = (this.wp + 1) % spec.path.length;
          this.pauseT = spec.pause;
        }
      }
    } else if (this.state === "suspect") {
      const arrived = this._moveToward(this.investigate.x, this.investigate.y, spec.speed * 1.7 * game.guardSpeedMul, dt, game);
      if (arrived) {
        this.scanT += dt;
        this.angle += dt * 1.6 * (Math.sin(t * 0.9 + this.bobPhase) > 0 ? 1 : -1) * 0.9;
        if (this.scanT > 2.6) {
          this.scanT = 0;
          this.state = "patrol";
          this.pauseT = 0;
        }
      }
      if (this.alertness <= 0.05) { this.state = "patrol"; this.scanT = 0; }
    } else if (this.state === "chase") {
      if (sees) this.lostT = 0; else this.lostT += dt;
      this._moveToward(this.lastKnown.x, this.lastKnown.y, Math.max(3.2, spec.speed * 2.4) * game.guardSpeedMul, dt, game);
      if (dist < 0.9 && sees) game.onCaught(this.pos.x, this.pos.z);
      else if (dist < 0.55) game.onCaught(this.pos.x, this.pos.z); // they feel the blob brushing past
      if (this.lostT > 2.8) {
        // lose the trail → search nearby
        this.state = "search";
        this.searchPts = [];
        for (let i = 0; i < 3; i++) {
          const a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 2.5;
          this.searchPts.push([this.lastKnown.x + Math.cos(a) * r, this.lastKnown.y + Math.sin(a) * r]);
        }
      }
    } else if (this.state === "search") {
      const pt = this.searchPts[0];
      if (!pt) {
        this.state = "patrol";
        this.alertness = Math.min(this.alertness, 0.3);
        this.alertCounted = false;
      } else if (this._moveToward(pt[0], pt[1], spec.speed * 1.8 * game.guardSpeedMul, dt, game)) {
        this.searchPts.shift();
        this.angle += dt * 3;
      }
    }

    this._syncVisual(t, null);
  }

  _syncVisual(t, forceColor) {
    // float bob
    const bobY = this.state === "out" ? this.body.position.y : 1.45 + Math.sin(t * 1.8 + this.bobPhase) * 0.08;
    this.body.position.set(this.pos.x, bobY, this.pos.z);
    if (this.state !== "out") this.body.rotation.y = -this.angle;

    // light follows, aimed down-forward along the facing
    const lead = this.state === "chase" ? 3.0 : 2.4;
    this.light.position.set(this.pos.x, 2.7, this.pos.z);
    this.light.target.position.set(this.pos.x + this.fx * lead, 0.1, this.pos.z + this.fz * lead);

    // state colour
    let col = forceColor;
    if (!col) {
      col = CALM;
      if (this.state === "suspect" || this.state === "search") col = SUSPECT;
      else if (this.state === "chase") col = CHASE;
      else if (this.alertness > 0.15) col = CALM.clone().lerp(SUSPECT, this.alertness / 0.4);
    }
    this._lightColor.lerp(col, 0.12);
    this.light.color.copy(this._lightColor);
    this.core.position.set(this.pos.x, bobY + 0.05, this.pos.z);
    this.core.material.emissive.copy(this._lightColor);
    this.core.rotation.y = t * 1.5;
  }
}
