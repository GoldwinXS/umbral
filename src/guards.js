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

// Below this effective exposure the blob is IN SHADOW and simply cannot be
// seen — the whole point of being a creature of darkness. Matches the "in
// shadow" band on the HUD light gem (game.SEEN_THRESHOLD / hud.js).
const SEEN_THRESHOLD = 0.18;

// Spotting is NOT instant. A fully-lit blob in the open takes ~SPOT_TIME
// seconds of continuous sight to fully register (awareness 0→1); partial
// light, distance, and cone-edge all slow that down. Awareness is per-warden
// and shown above its head so the player can read exactly how close each one
// is to raising the alarm.
const SPOT_TIME = 1.8;               // sec of full open exposure to a full spot
const SPOT_RATE = 1 / SPOT_TIME;     // awareness gained per second at full strength
const FULL_LIT = 0.7;                // exposure at/above this reads as "fully in the open"
const SUSPECT_AT = 0.35;             // awareness → investigate
const CHASE_AT = 0.999;              // awareness → alarm/chase
const FORGET_RATE = 0.5;             // awareness bled off per second when unseen

export class Warden {
  constructor(scene, spec, overlay) {
    this.scene = scene;
    this.overlay = overlay || scene; // transparent glow halo lives in the overlay pass
    this.spec = spec;
    this.groundY = spec.y || 0; // VERTICALITY: the tier this warden patrols on
    this.pos = new THREE.Vector3(spec.path[0][0], this.groundY + 1.45, spec.path[0][1]);
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

    // A "Snuffed" — its lamp died. It emits NO light (so it can't reveal you,
    // and can't see) and hunts purely by SOUND. Silence beats it, the way
    // shadow beats a normal Vesper.
    this.blind = !!spec.blind;

    // --- body (dynamic mesh → casts a real moving shadow) ---
    this.body = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.34, 0),
      new THREE.MeshStandardMaterial({ color: 0x11131c, roughness: 0.35, metalness: 0.85 })
    );
    this.body.position.copy(this.pos);
    scene.add(this.body);

    // --- glowing core (rasterized only; the Snuffed's is a dim dying ember) ---
    const coreCol = this.blind ? new THREE.Color(0xff3a18) : CALM.clone();
    this.core = new THREE.Mesh(
      new THREE.OctahedronGeometry(this.blind ? 0.13 : 0.17),
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: coreCol, emissiveIntensity: this.blind ? 2.2 : 4 })
    );
    this.core.userData.rtExclude = true;
    scene.add(this.core);
    this._lightColor = coreCol.clone();

    if (this.blind) {
      // a ring of ember flecks + smoke so the player can SEE it in the dark,
      // though it casts no light of its own (all rtExclude → glow, not lights)
      this.embers = [];
      for (let i = 0; i < 4; i++) {
        const e = new THREE.Mesh(
          new THREE.TetrahedronGeometry(0.05),
          new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff5a20, emissiveIntensity: 1.6 })
        );
        e.userData.rtExclude = true; e.userData.a = (i / 4) * Math.PI * 2;
        scene.add(e); this.embers.push(e);
      }
      this.light = null; // NO light
    } else {
      // --- vision cone = spot light ---
      const l = new THREE.SpotLight(spec.color, 30, spec.range + 7, spec.coneAngle, 0.4);
      l.position.set(this.pos.x, 2.7, this.pos.z);
      l.userData.rtRadius = 0.12;
      scene.add(l);
      scene.add(l.target);
      this.light = l;
    }

    // --- alert glow halo: a soft additive aura enveloping the WHOLE body that
    // brightens amber → red as this sentinel grows suspicious. Lives in the
    // overlay pass (like the sound rings) so its transparency animates smoothly
    // in the traced view. Invisible when calm — the enemy itself lights up. ---
    this.glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 18, 14),
      new THREE.MeshBasicMaterial({
        color: SUSPECT.clone(), transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    this.glow.userData.rtExclude = true;
    this.glow.renderOrder = 3;
    this.overlay.add(this.glow);

    this.canSeePlayer = false;
  }

  get fx() { return Math.cos(this.angle); }
  get fz() { return Math.sin(this.angle); }

  /** A noise happened at (x,z) audible within `radius`. */
  hearNoise(x, z, radius, game) {
    if (this.state === "out") return;
    // the Snuffed hears keenly — and a little beyond a sound's normal reach
    const reach = this.blind ? radius * 1.35 : radius;
    const d = Math.hypot(x - this.pos.x, z - this.pos.z);
    if (d > reach) return;
    const bump = (1 - d / reach) * (this.blind ? 1.15 : 0.8);
    const before = this.alertness;
    this.alertness = Math.min(1, this.alertness + bump);
    // the Snuffed tracks purely by ear — fresh sound re-locks its hunt
    if (this.blind) { this.lastKnown.set(x, z); this.lostT = 0; }
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
    if (this.light) this.light.intensity = 0;
    if (this.glow) this.glow.material.opacity = 0;
    this.canSeePlayer = false;
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

  /** A LOCAL alarm reached this warden — a colleague's shout on spotting Hush,
   *  or a comrade vanishing nearby. It converges to INVESTIGATE the reported
   *  spot (going suspect, not straight to chase), so the group hunts an AREA and
   *  the player can still break away and reset. It only knows where the event
   *  happened, not where Hush actually is now. */
  hearAlarm(tx, tz) {
    if (this.state === "chase" || this.state === "out") return;
    this.alertness = Math.max(this.alertness, 0.6);
    this.investigate.set(tx, tz);
    this.lastKnown.set(tx, tz);
    if (this.state === "patrol") this._toSuspect();
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
      // SHOUT: nearby wardens hear it and converge on where Hush was seen
      // (stale info — they hunt the area, they don't teleport onto the player)
      game.alertNear(this.pos.x, this.pos.z, game.player.pos.x, game.player.pos.z, this);
    }
  }

  reset(path0Only = false) {
    if (this.state === "out") return; // the fallen stay fallen
    this.state = "patrol";
    this.alertness = 0;
    this.lostT = 0;
    this.alertCounted = false;
    if (path0Only) {
      this.pos.set(this.spec.path[0][0], this.groundY + 1.45, this.spec.path[0][1]);
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
    // height-banded: a warden on a tier ignores railings/cover banded to OTHER
    // tiers (same rule the player uses), so upper-deck patrols don't snag below
    collideCircle(this.pos, 0.3, null, game.level.boxes, game.level.cylinders, 0, this.groundY, 1.6);
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
        this.body.position.set(this.pos.x, this.groundY + 1.45 - e * 0.6, this.pos.z);
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
        this.body.position.y = this.groundY + 1.45 - this.tip * 1.1;
        this.core.position.y = this.body.position.y + 0.1;
        if (this.tip >= 1) this.tip = 0;
      }
      this._syncVisual(t, OUT);
      return;
    }

    const p = game.player.pos;
    const dx = p.x - this.pos.x, dz = p.z - this.pos.z;
    const dist = Math.hypot(dx, dz);

    // ---------- vision (a Snuffed is blind — it hunts by sound only) ----------
    // A warden's tight spot cone is its bright, sure sight; beyond it lies a
    // WIDER, LONGER band of peripheral awareness that only catches a blob out
    // in the LIGHT (being in the open is what gives you away). Either way it
    // takes ~2s of continuous sight to fully register — never an instant spot.
    let sees = false;
    let strength = 0; // 0..1 how strongly seen right now → how fast awareness climbs
    if (!this.blind) {
      const exposure = game.playerVis * (game.playerSneaking ? 0.7 : 1);
      const lit = exposure >= SEEN_THRESHOLD; // in shadow → truly invisible

      if (lit && dist < spec.range * 1.5) {
        const toP = Math.atan2(dz, dx);
        let diff = toP - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const adiff = Math.abs(diff);
        const inTight = adiff < spec.coneAngle * 1.05 && dist < spec.range;
        const inWide = adiff < spec.coneAngle * 1.9;
        // VERTICALITY: the cone has a vertical spread too — a target more than
        // ~0.55 rad off this warden's tier (in vertical angle) is out of sight,
        // so height is concealment up close but exposed across a distance.
        const inV = Math.abs(Math.atan2((game.player.groundY || 0) - this.groundY, dist)) < 0.55;
        if (inV && (inTight || inWide) &&
            game.los(this.pos.x, this.groundY + 1.9, this.pos.z, p.x, (game.player.groundY || 0) + 0.4, p.z)) {
          sees = true;
          // how far into the seeable band you are (dim → 0, fully open → 1)
          const expN = Math.min(1, (exposure - SEEN_THRESHOLD) / (FULL_LIT - SEEN_THRESHOLD));
          // centred in the beam = full; the peripheral band tapers off
          const cone = inTight ? 1 : Math.max(0.2, 1 - (adiff - spec.coneAngle) / (spec.coneAngle * 0.95)) * 0.75;
          const near = 0.55 + 0.45 * Math.max(0, 1 - dist / (spec.range * 1.5));
          strength = expN * cone * near;
        }
      }
      // reflected sight: a lit blob over a still mirror pool is given away even
      // behind cover, if the warden's cone catches the pool.
      if (!sees && lit && this._seesReflection(game, spec)) {
        sees = true;
        const expN = Math.min(1, (exposure - SEEN_THRESHOLD) / (FULL_LIT - SEEN_THRESHOLD));
        strength = expN * 0.5;
      }

      if (sees) {
        this.alertness = Math.min(1, this.alertness + SPOT_RATE * strength * dt);
        this.lastKnown.set(p.x, p.z);
        this.lostT = 0;
        if (this.alertness >= CHASE_AT) this._toChase(game);
        else if (this.alertness >= SUSPECT_AT && this.state === "patrol") {
          this.investigate.set(p.x, p.z);
          this._toSuspect(game);
          game.sfx.suspicious();
        }
      } else if (this.state !== "chase" && this.state !== "search") {
        this.alertness = Math.max(0, this.alertness - FORGET_RATE * dt); // lose the thread
      }
    } else if (this.state !== "chase" && this.state !== "search") {
      this.alertness = Math.max(0, this.alertness - 0.28 * dt); // the Snuffed loses interest fast in silence
    }
    this.canSeePlayer = sees;

    // they only physically sense the blob if it's all but touching them
    if (dist < 0.8 && this.state !== "chase") {
      this.alertness = Math.min(1, this.alertness + 0.7 * dt);
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
    // float bob (offset onto this warden's tier)
    const bobY = this.state === "out" ? this.body.position.y : this.groundY + 1.45 + Math.sin(t * 1.8 + this.bobPhase) * 0.08;
    this.body.position.set(this.pos.x, bobY, this.pos.z);
    if (this.state !== "out") this.body.rotation.y = -this.angle;

    // light follows, aimed down-forward along the facing (Snuffed has none)
    if (this.light) {
      const lead = this.state === "chase" ? 3.0 : 2.4;
      this.light.position.set(this.pos.x, this.groundY + 2.7, this.pos.z);
      this.light.target.position.set(this.pos.x + this.fx * lead, this.groundY + 0.1, this.pos.z + this.fz * lead);
    }

    // awareness 0..1 — the sentinel KINDLES brighter and redder as it closes in
    // on you. This IS the alert read: a calm amber ember → a swelling orange
    // glow → a fierce red glare the instant before it raises the alarm.
    const aw = this.state === "chase" ? 1 : Math.max(this.alertness, this.state === "search" ? 0.5 : 0);

    // state colour, blended continuously by awareness
    let col = forceColor;
    if (!col) {
      if (this.blind) {
        // ember stays red; brightens when it's roused by a sound
        col = this.state === "chase" ? new THREE.Color(0xff5a20)
          : (this.state === "suspect" || this.state === "search") ? new THREE.Color(0xff4418)
          : new THREE.Color(0xd8280a);
      } else {
        col = CALM.clone().lerp(SUSPECT, Math.min(1, aw / 0.55)).lerp(CHASE, Math.max(0, (aw - 0.55) / 0.45));
      }
    }
    this._lightColor.lerp(col, 0.16);
    if (this.light) {
      this.light.color.copy(this._lightColor);
      // hold the beam's reach steady (so detection stays fair) but flare it a
      // touch brighter as it hunts, for drama
      this.light.intensity = 30 * (1 + aw * 0.35);
    }

    // THE WHOLE CREATURE kindles: calm = a dark body with just a dim core; as it
    // grows suspicious a glowing halo swells around its entire silhouette, amber
    // → red, blazing on the hunt. This is the alert read — the enemy itself
    // lighting up, not a pip. The halo (overlay, additive) is the reliable tell;
    // the body emissive complements it in the raster/NEE.
    const pulse = aw > 0.85 ? Math.max(0, Math.sin(t * 13)) : 0;
    this.glow.position.set(this.pos.x, bobY + 0.02, this.pos.z);
    this.glow.material.color.copy(this._lightColor);
    if (!this.blind) {
      this.glow.material.opacity = Math.min(0.9, aw * aw * 0.95 + pulse * 0.25);
      this.glow.scale.setScalar(0.9 + aw * 0.7 + pulse * 0.08);
      this.body.material.emissive.copy(this._lightColor);
      this.body.material.emissiveIntensity = aw * aw * 1.6 + pulse * 0.5;
    } else {
      // the Snuffed has no lamp, but its embered body glows redder when roused
      const e = 0.25 + (this.state !== "patrol" ? 0.55 : 0) + Math.sin(t * 6) * 0.08;
      this.glow.material.opacity = Math.min(0.7, e * 0.6);
      this.glow.scale.setScalar(0.85 + e * 0.4);
      this.body.material.emissive.setHex(0x2a0805);
      this.body.material.emissiveIntensity = e;
    }

    this.core.position.set(this.pos.x, bobY + 0.05, this.pos.z);
    this.core.material.emissive.copy(this._lightColor);
    // the core stays a small, steady eye — the BODY is the alert tell now, so the
    // core no longer swells into a "pip"
    this.core.material.emissiveIntensity = this.blind
      ? (2.2 + (this.state !== "patrol" ? 1.5 : 0) + Math.sin(t * 8) * 0.5)
      : 4 + aw * 5;
    this.core.rotation.y = t * 1.5;

    // ember flecks orbit the Snuffed so it's readable in the dark
    if (this.embers) {
      for (const e of this.embers) {
        const a = e.userData.a + t * 1.3;
        e.position.set(this.pos.x + Math.cos(a) * 0.32, bobY + Math.sin(t * 2 + e.userData.a) * 0.12, this.pos.z + Math.sin(a) * 0.32);
      }
    }
  }
}
