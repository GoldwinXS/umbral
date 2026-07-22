import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * MISSION 3 — THE GORGE  (level index 2) — DEVOUR.
 *
 * Teaches DEVOUR as "the guard is food," then shows the one thing you can never
 * eat (per docs/REDESIGN_1-4.md, MISSION 3):
 *   E1 KI    — THE FIRST MOUTHFUL : feed a crimson mote, take a lone Vesper from
 *              its blind rear arc — gone, and you a little larger. Clean power.
 *   E2 SHŌ   — WHAT YOU CANNOT EAT : the Gorge conjugates DEVOUR by what is
 *              edible. A blind Snuffed on the silent west moss cannot be devoured
 *              and hunts your lunge by ear; the mid Vesper is a second swallow.
 *   E3 TEN   — UNDER THE EYE : the Turn. The Pharos cannot be doused, lured, or
 *              devoured — and the fuller you have fed, the more its sweep finds
 *              you. Set the power down: read the sweep, cross small, lift the
 *              relic from the alcove in the Eye's own blind spot.
 *   E4 KETSU — FED, AND FLEEING : take the relic → the Gorge wakes → run.
 *
 * 0 vials by design — the player puts down DOUSE/LURE to learn DEVOUR clean.
 * Geometry is watertight (kit.room/corridor, audited); surface plates never
 * overlap (coplanar plates z-fight).
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
const TUNE = {
  moon: 0.55,                                                     // ambient darkness
  vDevour: { speed: 1.1, pause: 1.5, range: 8 },                  // E1 lone Vesper
  vMid:    { speed: 1.2, pause: 1.4, range: 9 },                  // E2 mid Vesper (2nd swallow)
  snuffed: { speed: 1.0, pause: 2.0, blind: true },               // E2 blind Snuffed
  pharos:  { dir: -Math.PI / 2, sweep: 0.7, sweepSpeed: 0.45, range: 14, coneAngle: 0.24, height: 3.2 },
  torchDevour: { intensity: 6, range: 8, scale: 1 },             // E1 work-lamp
  torchMid:    { intensity: 6, range: 8, scale: 1 },             // E2 mid Vesper's lamp
  greatN:  { intensity: 13, range: 11, scale: 1.8 },             // E3 great lantern (under the Eye)
  greatS:  { intensity: 14, range: 11, scale: 2.0 },             // E3 great lantern (pedestal light)
  torchExit: { intensity: 6, range: 8, scale: 1 },               // E4 extraction corner
};

export function buildSwallow() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "gorge";
  bag.name = "THE GORGE";
  bag.spawn.set(-17, 0.42, 0);
  bag.bounds = { x0: -21, z0: -12, x1: 63, z1: 12 };

  const H = 3.2;

  // ================= GEOMETRY (watertight, clean-corner kit.room/corridor) =====
  // [KEPT] All room footprints, door gaps, and the three-band Gorge floor.
  const START = kit.room(-20, -4, -12, 4, { doors: { e: [[-1.5, 1.5]] }, surface: "moss" });   // A START HALL
  kit.corridor(-12, -1.5, -8, 1.5, { surface: "moss" });                                         // AB
  const DEVOUR = kit.room(-8, -8, 14, 8, { doors: { w: [[-1.5, 1.5]], e: [[-1.5, 1.5]] }, surface: "moss" }); // B DEVOUR ROOM
  kit.corridor(14, -1.5, 18, 1.5, { surface: "moss" });                                          // BC
  const GORGE = kit.room(18, -11, 50, 11, { doors: { w: [[-1.5, 1.5]], e: [[-1.5, 1.5]] } });    // C THE GORGE
  kit.surface(18, -11, 28, 11, "moss");     // west  — Snuffed zone, MUST stay silent
  kit.surface(28, -11, 38, 11, "obsidian"); // mid   — second Vesper, moderate noise
  kit.surface(38, -11, 50, 11, "crystal");  // east  — Pharos + pedestal, the finale sings
  kit.corridor(50, -1.5, 54, 1.5, { surface: "moss" });                                          // CD
  kit.room(54, -6, 62, 6, { doors: { w: [[-1.5, 1.5]] }, surface: "moss" });                     // D EXTRACTION

  kit.extraction(58, 0);

  // ================= LANTERNS (small pools + two GREAT lanterns) ===============
  // [KEPT] work-lamps; [MODIFIED] the dim violet-ish Snuffed torch (22,0) DROPPED
  // — violet belongs only to Hush (LORE palette law); the Snuffed zone is left
  // genuinely dark, its dead lamps rendered as unlit deadLanterns in E2 dressing.
  kit.torch(3, 5, TUNE.torchDevour);      // small — devour room
  kit.torch(33, -3, TUNE.torchMid);       // small — mid Vesper's stretch
  kit.torch(40, 6, TUNE.greatN);          // GREAT — under the Pharos
  kit.torch(46, -3, TUNE.greatS);         // GREAT — pedestal guard light
  kit.torch(55, 4, TUNE.torchExit);       // small — extraction corner (OFF the rift at 58,0)

  // ================= crimson maw motes — charge the devour =====================
  kit.mawMote("maw1", -6, -5);   // [KEPT] devour room — off the Vesper's line, in shadow
  kit.mawMote("maw2", 31, 7);    // [MODIFIED] moved from (24,9) → (31,7): mid band, NE of
                                 //   V-mid, so the second feed never backtracks into the Snuffed's zone.

  // ================= GUARDS — exactly three enemy TYPES ========================
  // [KEPT] roster. 1 · devourable Vespers (the swallow lesson).
  kit.guard([[-4, 0], [10, 0]], TUNE.vDevour);      // E1 devour room — LESSON 1
  kit.guard([[30, -7], [36, -7]], TUNE.vMid);       // E2 Gorge mid — LESSON 2
  // 2 · the SNUFFED — blind, hunts by sound, cannot be devoured, only ONE.
  kit.guard([[22, 5], [22, -5]], TUNE.snuffed);
  // 3 · the PHAROS — stationary; sweeps the one door out of the Gorge; only ONE.
  kit.greatEye(44, 10, TUNE.pharos);

  // ================= relic (in the alcove beneath the Eye) =====================
  kit.scepterPedestal(46, -8);                                    // [KEPT]

  // ================= E1 · KI — "THE FIRST MOUTHFUL" ===========================
  // [MODIFIED — dressing] The feeding-cut: a place of consumption. Abandoned haul
  // near the one work-lamp, gnawed cover on the rear approach, tended urns at the
  // lamp. The crimson mote in shadow is the first red in a violet-and-amber world.
  {
    const clear = [
      { x: -17, z: 0, r: 2.0 },                              // spawn
      { x0: -4, z0: 0, x1: 10, z1: 0, pad: 0.7 },            // V-devour patrol line
      { x0: -8, z0: -1.5, x1: 14, z1: 1.5, pad: 0.3 },       // through lane
      { x: -6, z: -5, r: 1.0 },                              // maw1 — keep its shadow pocket reachable
    ];
    kit.cluster(-2, 4.4, ["cart", { prop: "sack", w: 2 }], { count: 3, clear, seed: 3 });   // abandoned haul by the lamp
    kit.corner(DEVOUR, "se", [{ prop: "crateStack", w: 2, foot: 0.8 }, "barrel"], { count: 3, clear, seed: 4 }); // rear-approach cover
    kit.flank(3, 5, { prop: "urn", opts: { scale: 0.8 } }, { gap: 1.3, clear, seed: 5 });   // tended pool at the lamp base
    kit.inscription(3, 2.4, 7.7, "THE MAW REMEMBERS WHAT THE EYE FORGETS", 0, "#ff4a5e");   // [KEPT] red = the maw's own colour
  }

  // ================= E2 · SHŌ — "WHAT YOU CANNOT EAT" =========================
  // [MODIFIED — dressing] Quiet dark → open ground. West (Snuffed): neglected,
  // near-black — dead lanterns, rubble, chains, a collapsed column; the forgotten
  // end. Mid (obsidian): a working stretch — cart, crates, the one low lamp.
  {
    const clear = [
      { x0: 22, z0: -5, x1: 22, z1: 5, pad: 0.7 },           // Snuffed patrol line
      { x0: 30, z0: -7, x1: 36, z1: -7, pad: 0.7 },          // V-mid patrol line
      { x0: 18, z0: -1.5, x1: 38, z1: 1.5, pad: 0.3 },       // through lane
      { x: 31, z: 7, r: 1.0 },                               // relocated maw2
    ];
    // West band — the abandoned end (dead/ember lamps, no live flame).
    kit.wallRun(19, 10, 27, 10, [{ prop: "deadLantern", w: 3 }, "rubble", "brokenColumn"], { spacing: 3.0, inset: 0.4, clear, seed: 21 });
    kit.wallRun(19, -10, 27, -10, ["chains", "rubble"], { spacing: 3.5, inset: 0.4, clear, seed: 22 });
    // Mid band — the working stretch. Clusters stand in for the KEPT bare pillar
    // (33,4) + cover block (30,6), recomposed as feeding-cut cover on the Vesper's
    // north side (kit.corner wants a room corner; these are mid-floor). // (tune)
    kit.cluster(34, 6.5, ["cart", { prop: "crateStack", w: 2, foot: 0.8 }, "barrel"], { count: 4, backDir: Math.PI / 4, clear, seed: 23 });
    kit.cluster(30.5, 5, [{ prop: "crateStack", w: 2, foot: 0.8 }, "brokenColumn"], { count: 3, footprint: 1.1, backDir: Math.PI / 4, clear, seed: 24 });
    kit.inscription(22, 1.8, 10.7, "IT DOES NOT SEE. IT ONLY LISTENS.", 0, "#7a6bb0");       // [KEPT]
  }

  // ================= E3 · TEN — "UNDER THE EYE" ===============================
  // [MODIFIED — dressing] The shrine of the Eye: the Vigil's first, holiest engine.
  // Priest-statues kneel toward the Pharos, offerings (urns + unlit braziers) at
  // its base. The pedestal sits in the Eye's own shadow — take the relic from the
  // one blind spot at its foot. The KEPT pillars (42,5)/(48,7) are the real cover.
  {
    const clear = [
      { x0: 38, z0: -1.5, x1: 50, z1: 1.5, pad: 0.3 },       // door lane the beam guards
      { x: 44, z: 10, r: 1.6 },                              // Pharos base
      { x: 46, z: -8, r: 1.6 },                              // pedestal alcove
      { x0: 38, z0: -11, x1: 50, z1: -6, pad: 0.2 },         // keep the alcove approach readable
    ];
    kit.focal(44, 8.5, {
      landmark: (x, z) => null,                              // Pharos already placed by greatEye
      flankProp: "statue", flankGap: 2.6, flankDir: 0, flankFace: "in",
      scatterProp: [{ prop: "urn", w: 2 }, { prop: "brazier", opts: { lit: false } }],
      scatterCount: 3, clear, seed: 31,
    });
    kit.pillar(0.55, H, 42, 5);                              // [KEPT] cover from the Pharos gaze
    kit.pillar(0.55, H, 48, 7);                              // [KEPT]
    kit.inscription(40, 2.4, -10.6, "TAKE WHAT THE EYE HAS NOT YET COUNTED", 0, "#ffd76a");  // [KEPT] in the alcove
  }

  // ================= E4 · KETSU — "FED, AND FLEEING" ==========================
  // [KEPT logic] The mouth disgorging you — plain, dark, fast. One dead-lantern
  // pair at the rift (decor, off the 58,0 rift line).
  kit.deadLantern(55.5, 3, { seed: 41 });
  kit.deadLantern(55.5, -3, { seed: 42 });

  // ================= ambient (low key — pools & shadow must read) ==============
  const moon = new THREE.DirectionalLight(0x8ea0cc, TUNE.moon);
  moon.position.set(8, 22, 6);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  for (const [x, y, z] of [[3, 8, 2], [34, 8, -2]]) {   // faint fills, clear of spawn + guarded stretches
    const f = new THREE.PointLight(0x7088b0, 3.4, 14);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ================= checkpoints ===============================================
  kit.checkpoint(-17, 0, 3);
  kit.checkpoint(3, 0, 3.5);
  kit.checkpoint(20, 8, 3, 20, 8);
  kit.checkpoint(34, -9, 3, 34, -9);
  kit.checkpoint(46, -9, 3, 46, -9);
  kit.checkpoint(58, 0, 3);

  // ================= triggers / four-beat teaching (terse, mechanic-first) =====
  kit.trigger("start", -14, 0, 3);
  kit.trigger("devourRoom", -6, 0, 3);
  kit.trigger("gorge", 20, 0, 4);
  kit.trigger("vesperZone", 29, -3, 3);
  kit.trigger("pharosZone", 39, 0, 4);
  kit.trigger("escape", 56, 0, 3);

  bag.stage = 0;
  bag.objective = "Find a way to feed";
  bag.onStart = (game) => game.hud.prompt("Something in you has gone hungry.", 3.5);
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "start":
        if (bag.stage === 0) {
          bag.stage = 1;
          p.prompt("A crimson mote waits ahead — drift over it to feed.", 4);
        }
        break;
      case "devourRoom":
        if (bag.stage === 1) {
          bag.stage = 2;
          game.setObjective("Feed, then devour a Vesper");
          p.prompt(game.isTouch
            ? "Feed on the mote, then tap <b>🗡</b> behind a Vesper to swallow it. From the front it only shoves."
            : "Feed on the mote, then press <span class='keycap'>F</span> behind a Vesper to swallow it. From the front it only shoves.", 5);
        }
        break;
      case "gorge":
        if (bag.stage === 2) {
          bag.stage = 3;
          game.setObjective("Cross the Gorge unseen");
          p.prompt("The <b>Snuffed</b> is blind — it hunts by sound. Keep to the moss; don't lunge here.", 4.5);
        }
        break;
      case "vesperZone":
        if (!bag._vesperSeen) {
          bag._vesperSeen = true;
          p.prompt("A second mote is near. Feed, circle behind, devour again.", 4);
        }
        break;
      case "pharosZone":
        if (bag.stage === 3) {
          bag.stage = 4;
          game.setObjective("Take the relic beneath the Eye");
          p.prompt("The <b>Pharos</b> can't be doused, lured, or eaten. Read its sweep and cross.", 4.5);
        }
        break;
      case "escape":
        if (game.scepterTaken && !bag._escapeSeen) {
          bag._escapeSeen = true;
          p.prompt("The rift is close. Run.", 3);
        }
        break;
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.3;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    game.hud.prompt("The relic wakes — every watcher knows your shape. <b>Run.</b>", 3);
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 7 + tc.x));
    }
    // scepter: bobbing/spinning, then rides the thief once taken
    const s = bag.scepter;
    if (s) {
      s.core.rotation.y = t * 2;
      if (game.scepterTaken) {
        const pl = game.player.pos;
        s.group.position.set(pl.x, 1.5 + Math.sin(t * 3) * 0.1, pl.z);
      } else {
        s.group.position.set(s.x, 1.9 + Math.sin(t * 2) * 0.12, s.z);
      }
    }
    if (bag.extract) {
      bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
    }
  };

  bag.startVials = 0;
  void START; void GORGE;
  return bag;
}
