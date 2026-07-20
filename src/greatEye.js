import * as THREE from "three";

/**
 * The Great Eye — a Sauron-style sentinel. It does not move and it does not
 * give chase. It STARES down a long, narrow cone that sweeps slowly. Catch its
 * gaze while lit and it screams your position to every warden nearby: the whole
 * district mobilizes on you at once. Fog and shadow still hide you from it.
 *
 * It duck-types as a "warden" so it drops straight into the game's warden list:
 * it exposes { spec:{range,coneAngle}, pos, angle, state, alertness, update,
 * hearNoise, reset, noDevour }. It cannot be devoured.
 */

const CALM = new THREE.Color(0xffb43a);
const WAKE = new THREE.Color(0xff8a2a);
const LOCK = new THREE.Color(0xff2a2a);

export class GreatEye {
  constructor(scene, spec) {
    this.scene = scene;
    this.noDevour = true;
    this.spec = {
      range: spec.range ?? 34,
      coneAngle: spec.coneAngle ?? 0.26, // narrow — a searchlight, not a floodlight
    };
    this.x = spec.x; this.z = spec.z;
    this.baseDir = spec.dir ?? -Math.PI / 2;   // centre of the sweep
    this.sweep = spec.sweep ?? 0.6;            // half-angle of the sweep
    this.sweepSpeed = spec.sweepSpeed ?? 0.35; // radians/sec-ish
    this.alarmRadius = spec.alarmRadius ?? 60;  // who it can rally (huge — it shouts)
    this.height = spec.height ?? 3.4;

    this.pos = new THREE.Vector3(this.x, this.height, this.z);
    this.angle = this.baseDir;
    this.state = "watch";     // "watch" | "wake" | "alarm"
    this.alertness = 0;
    this.lockT = 0;           // build-up before it screams
    this.alarmHold = 0;       // stays red for a beat after alarming
    this.cooldown = 0;        // won't re-scream instantly
    this._col = CALM.clone();

    // ---- tower ----
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.9, this.height, 14),
      new THREE.MeshStandardMaterial({ color: 0x15121c, roughness: 0.7, metalness: 0.3 })
    );
    tower.position.set(this.x, this.height / 2, this.z);
    scene.add(tower);
    this.tower = tower;

    // ---- the eye: dark sclera + glowing iris ----
    this.eyeBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0x0a0910, roughness: 0.35, metalness: 0.2 })
    );
    this.eyeBall.position.copy(this.pos);
    scene.add(this.eyeBall);
    this.iris = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 18, 14),
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: CALM.clone(), emissiveIntensity: 5 })
    );
    this.iris.userData.rtExclude = true;
    scene.add(this.iris);
    this.pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    this.pupil.userData.rtExclude = true;
    scene.add(this.pupil);

    // ---- the gaze: a long spotlight + a telegraphing beam ----
    this.light = new THREE.SpotLight(CALM.clone(), 26, this.spec.range + 6, this.spec.coneAngle, 0.5, 1.2);
    this.light.position.copy(this.pos);
    this.light.userData.rtRadius = 0.15;
    scene.add(this.light);
    scene.add(this.light.target);

    const beamLen = this.spec.range;
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(Math.tan(this.spec.coneAngle) * beamLen, beamLen, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: CALM.clone(), transparent: true, opacity: 0.09, side: THREE.DoubleSide,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    beam.userData.rtExclude = true;
    beam.renderOrder = 1;
    scene.add(beam);
    this.beam = beam;
    this.beamLen = beamLen;
  }

  get fx() { return Math.cos(this.angle); }
  get fz() { return Math.sin(this.angle); }

  hearNoise() { /* the Eye is deaf — it only watches */ }

  reset() {
    this.state = "watch";
    this.alertness = 0;
    this.lockT = 0;
    this.alarmHold = 0;
    this.cooldown = 0;
  }

  /** Rally every warden within earshot onto the player's position. */
  _screamOn(game) {
    const p = game.player.pos;
    for (const w of game.wardens) {
      if (w === this || w.state === "out" || w.noDevour) continue;
      if (Math.hypot(w.pos.x - this.x, w.pos.z - this.z) > this.alarmRadius) continue;
      // hurl them straight into a hunt WITHOUT each logging its own alert —
      // the Eye's gaze is a single event on the player's record.
      w.alertness = 1;
      w.lastKnown && w.lastKnown.set(p.x, p.z);
      w.investigate && w.investigate.set(p.x, p.z);
      w.state = "chase";
      w.lostT = 0;
      w.alertCounted = true;
    }
    game.onAlert();     // one alert for the whole Eye event
    game.sfx.alarm();
    if (game.hud) game.hud.prompt("<b>THE EYE SEES YOU.</b> It calls the wardens down on you.", 2.6);
  }

  update(dt, t, game) {
    // sweep the gaze (frozen while locking on / alarming)
    if (this.state === "watch") {
      this.angle = this.baseDir + Math.sin(t * this.sweepSpeed) * this.sweep;
    }
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.alarmHold = Math.max(0, this.alarmHold - dt);

    // can it see the player?
    const p = game.player.pos;
    const dx = p.x - this.x, dz = p.z - this.z;
    const dist = Math.hypot(dx, dz);
    let inGaze = false;
    if (dist < this.spec.range && !game.playerHidden) {
      const toP = Math.atan2(dz, dx);
      let diff = toP - this.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) < this.spec.coneAngle) {
        if (game.los(this.x, this.height, this.z, p.x, 0.5, p.z)) {
          // you must be visible — light minus fog cover
          const exposure = game.playerVis * (1 - (game.fogCover || 0));
          if (exposure > 0.18) inGaze = true;
        }
      }
    }

    if (inGaze && this.cooldown <= 0) {
      this.lockT += dt;
      this.state = "wake";
      this.alertness = Math.min(1, this.lockT / 0.9);
      if (this.lockT >= 0.9) {           // a short lock-on window to escape the beam
        this._screamOn(game);
        this.state = "alarm";
        this.alarmHold = 1.4;
        this.cooldown = 6;
        this.lockT = 0;
      }
    } else {
      this.lockT = Math.max(0, this.lockT - dt * 1.5);
      if (this.alarmHold <= 0) {
        this.state = "watch";
        this.alertness = Math.max(0, this.alertness - dt * 0.8);
      }
    }

    this._syncVisual(t);
  }

  _syncVisual(t) {
    // colour by state
    let col = CALM;
    if (this.state === "alarm") col = LOCK;
    else if (this.state === "wake") col = WAKE.clone().lerp(LOCK, this.alertness);
    this._col.lerp(col, 0.15);

    this.iris.material.emissive.copy(this._col);
    this.iris.material.emissiveIntensity = 5 + (this.state !== "watch" ? 4 : 0) + Math.sin(t * 6) * 0.4;
    this.light.color.copy(this._col);
    this.beam.material.color.copy(this._col);
    this.beam.material.opacity = this.state === "watch" ? 0.09 : 0.18;

    // aim the gaze
    const fx = this.fx, fz = this.fz;
    this.light.target.position.set(this.x + fx * this.spec.range, 0.1, this.z + fz * this.spec.range);
    // iris + pupil ride the front of the eyeball toward the gaze
    this.iris.position.set(this.x + fx * 0.34, this.height + Math.sin(t * 1.2) * 0.02, this.z + fz * 0.34);
    this.pupil.position.set(this.x + fx * 0.52, this.iris.position.y, this.z + fz * 0.52);

    // beam sits halfway along the gaze, pointing outward (cone apex at the eye)
    const midX = this.x + fx * this.beamLen / 2;
    const midZ = this.z + fz * this.beamLen / 2;
    this.beam.position.set(midX, this.height * 0.7, midZ);
    // cone's +Y axis points from base to apex; we want apex at the eye → aim -forward
    this.beam.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(-fx, -0.28, -fz).normalize()
    );
  }
}
