import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL 1 — BRIGHTWARD.
 * A village crouched outside a floating obsidian citadel. Steal the Noonstaff
 * from the reliquary and escape back to the rift.
 *
 * Three ways in, Thief-style:
 *   - the lit main gate (guarded, bright — fast but hot)
 *   - the east postern (dark, but the approach is loud crystal gravel)
 *   - the west moat gap (unwatched — but only a shadowstep crosses the void)
 * Taking the Noonstaff wakes the citadel: dormant lamps ignite, wardens quicken,
 * and the relic's own glow makes YOU a light source on the way out.
 */
export function buildMission1() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "citadel";
  bag.name = "BRIGHTWARD";
  bag.spawn.set(0, 0.42, 24);

  const W = (w, d, x, z, h = 3.2) => kit.wall(w, h, d, x, z);

  // ================= VILLAGE (z 0..26, x -20..20) =================
  kit.floor(43, 28.5, 0, 13);
  // perimeter
  W(43, 0.6, 0, 26.8);
  W(0.6, 28.5, -21.2, 13);
  W(0.6, 28.5, 21.2, 13);
  // houses — tall dark blocks that throw long shadows (dark = safe lanes)
  const house = (x, z, w, d, h = 5.5) => {
    kit.solid(w, h, d, x, z, kit.mats.wall, 0);
    kit.trim(w * 0.7, 0.14, x, h - 0.5, z + d / 2 + 0.02, 0, 0x8a5cff, 1.4);
  };
  house(-13, 17, 6, 5, 6.5);
  house(-4, 21.5, 5, 4, 7.5);   // a tall tower
  house(6.5, 19.5, 6, 5, 6);
  house(14.5, 15.5, 5, 5, 8);   // the tallest — long shadow across the lane
  house(-14.5, 8, 5, 4, 5.5);
  house(12, 5.5, 4, 4, 6);
  // freestanding obelisks: shadow-casting cover you can duck behind
  kit.solid(1.2, 5.5, 1.2, -8, 20, kit.mats.pillar, 0.4);
  kit.solid(1.2, 4.5, 1.2, 2, 16, kit.mats.pillar, 0.2);
  kit.solid(1.4, 6, 1.4, 9, 22, kit.mats.pillar, 0.3);
  // market stalls (low cover) + well
  kit.solid(2.2, 1.1, 1.2, -3, 13, kit.mats.block, 0.2);
  kit.solid(2.2, 1.1, 1.2, 3.5, 13.5, kit.mats.block, -0.25);
  kit.solid(1.4, 1.1, 2.4, 0.5, 8.5, kit.mats.block, 0.1);
  kit.pillar(1.1, 0.9, 0, 11.5, kit.mats.pillar); // the well
  // surfaces: risky glass plaza shortcut + quiet moss gardens
  kit.surface(-4, 9, 4, 14.5, "crystal");
  kit.surface(-18, 10, -9.5, 16, "moss");
  kit.surface(9, 8, 17, 13.5, "moss");
  kit.surface(11, 1, 17, 5, "crystal");   // postern gravel
  kit.surface(-2.2, 3.5, 2.2, 8, "moss"); // soft approach to the main gate
  // village torch (douse practice / mood)
  kit.torch(-8, 12, { intensity: 11, range: 10 });
  // the rift home — bring the Noonstaff back here
  kit.extraction(0, 25);
  kit.trim(4, 0.2, 0, 2.6, 26.5, Math.PI, 0x39f0c0, 2.2);

  // ================= CITADEL WALL (z = 0) =================
  // main gate gap x -2..2, postern gap x 13..15, moat gap x -21..-10 (no wall)
  W(8, 1.2, -6, 0, 5.5);              // x -10..-2
  W(11, 1.2, 7.5, 0, 5.5);            // x 2..13
  W(6, 1.2, 18, 0, 5.5);              // x 15..21
  kit.trim(8, 0.18, -6, 5.2, 0.65, 0, 0x8a5cff, 2.5);
  kit.trim(11, 0.18, 7.5, 5.2, 0.65, 0, 0x8a5cff, 2.5);
  // the west moat: a void strip where the wall is broken — blink it
  kit.hole(-21, -1, -10, 2);
  // gatehouse torches
  kit.torch(-2.8, 1.4, { intensity: 14, range: 12 });
  kit.torch(2.8, 1.4, { intensity: 14, range: 12 });

  // ================= COURTYARD (z -18..0, x -19..19) =================
  kit.floor(41, 19.5, 0, -9);
  W(0.6, 19.5, -19.6, -9);
  W(0.6, 19.5, 19.6, -9);
  // hedges + garden blocks for cover
  kit.solid(7, 1.2, 1.1, -10, -6, kit.mats.block, 0);
  kit.solid(1.1, 1.2, 6, -6, -12, kit.mats.block, 0);
  kit.solid(7, 1.2, 1.1, 10, -12, kit.mats.block, 0);
  kit.solid(1.1, 1.2, 6, 6, -6, kit.mats.block, 0);
  kit.pillar(1.5, 1.2, 0, -9, kit.mats.pillar); // fountain
  kit.surface(-17, -15, -6.5, -3, "moss");
  kit.surface(6.5, -15, 17, -3, "moss");
  kit.surface(-2, -18, 2, 0, "crystal");  // the grand approach — loud
  kit.torch(-8, -8, { intensity: 13, range: 11 });
  kit.torch(8, -8, { intensity: 13, range: 11 });

  // ================= RELIQUARY HALL (z -34..-18, x -11..11) =================
  kit.floor(23.5, 17.5, 0, -26);
  // front wall with door gap x -1.5..1.5
  W(8.2, 0.8, -6.6, -18, 4.5);
  W(8.2, 0.8, 6.6, -18, 4.5);
  W(0.8, 17.5, -11.4, -26, 4.5);
  W(0.8, 17.5, 11.4, -26, 4.5);
  W(23.5, 0.8, 0, -34.2, 4.5);
  kit.surface(-10.5, -33.5, 10.5, -18.5, "crystal"); // the whole hall sings
  // pillar rows
  for (const zz of [-22, -26, -30]) {
    kit.pillar(0.55, 4.2, -6, zz);
    kit.pillar(0.55, 4.2, 6, zz);
    kit.trim(1.4, 0.14, -6, 3.6, zz + 0.6, 0, 0x8a5cff, 2.0);
    kit.trim(1.4, 0.14, 6, 3.6, zz + 0.6, 0, 0x8a5cff, 2.0);
  }
  kit.torch(-3, -26, { intensity: 14, range: 12 });
  kit.torch(3, -26, { intensity: 14, range: 12 });
  kit.scepterPedestal(0, -29);
  kit.trim(6, 0.25, 0, 4.0, -33.8, 0, 0xffd76a, 2.2);

  // ================= caches + maw motes =================
  kit.cache("c1", 16, 11, 2);
  kit.cache("c2", -14, -12.5, 2);
  kit.cache("c3", -8.5, -31.5, 2);
  kit.mawMote("m1", -16, 6);      // village garden
  kit.mawMote("m2", 12, -12.5);   // courtyard east hedge
  kit.mawMote("m3", 8.5, -31.5);  // reliquary corner

  // ================= wardens =================
  kit.guard([[-9, 18], [9, 18]], { speed: 1.5, pause: 1.6 });                 // 0 village lane
  kit.guard([[5, 11], [5, 7], [-5, 7], [-5, 11]], { speed: 1.3, pause: 1.2 }); // 1 plaza orbit
  kit.guard([[-4, 2.2], [4, 2.2]], { speed: 1.4, pause: 1.3 });               // 2 gatehouse
  kit.guard([[14, 8], [14, 3]], { speed: 1.2, pause: 2.0 });                  // 3 postern
  kit.guard([[-12, -4], [-12, -14], [-4, -14], [-4, -4]], { speed: 1.5, pause: 1.0 }); // 4 courtyard W
  kit.guard([[12, -4], [12, -14]], { speed: 1.4, pause: 1.6 });               // 5 courtyard E
  kit.guard([[5, -24], [5, -31], [-5, -31], [-5, -24]], { speed: 1.4, pause: 0.8 });   // 6 relic orbit
  kit.guard([[-6, -20.5], [6, -20.5]], { speed: 1.5, pause: 1.2 });           // 7 hall lane

  // ================= dormant alarm lamps =================
  for (const [x, z] of [[-6, -6], [6, -6], [-4, -22], [4, -22]]) {
    const l = new THREE.PointLight(0xff8866, 0, 13); // intensity 0 → not in the light table
    l.position.set(x, 3.2, z);
    l.userData.rtRadius = 0.2;
    scene.add(l);
    const fixture = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18),
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x662222, emissiveIntensity: 0.6 })
    );
    fixture.position.set(x, 3.2, z);
    fixture.userData.rtExclude = true;
    scene.add(fixture);
    bag.dormant.push({ light: l, fixture, target: 9 });
  }

  // ================= ambient =================
  const moon = new THREE.DirectionalLight(0x8ea0cc, 1.5); // stronger key → longer shadows
  moon.position.set(-16, 22, 9);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  // much dimmer, tighter fill so shadows read DARK between the bright torch
  // pools — high contrast now that shadow = invisibility
  for (const [x, y, z, i] of [[0, 9, 12, 12], [0, 9, -9, 13], [0, 9, -26, 11]]) {
    const f = new THREE.PointLight(0x7088b0, i, 22);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ================= checkpoints / triggers =================
  kit.checkpoint(0, 24, 3);
  kit.checkpoint(0, 5, 2.5);
  kit.checkpoint(0, -4, 3);
  kit.checkpoint(0, -19.5, 2.5, 0, -19.8);
  kit.trigger("inside", 0, -2, 3);
  kit.trigger("inside", 14, -2, 3);
  kit.trigger("inside", -16, -2, 3);
  kit.trigger("hall", 0, -19.5, 3);
  kit.trigger("village", 0, 16, 6);
  kit.trigger("gate", 0, 4, 3.5);

  // (no fog in Brightward — fog cover is introduced in the Reliquary cellar)

  // ================= mission logic =================
  bag.stage = 0;
  bag.alarmT = 0;
  bag.objective = "Take the Noonstaff";
  bag.onStart = (game) => game.hud.prompt("You have been here. You have never been here.", 4.5);
  bag.onTrigger = (id, game) => {
    if (id === "village" && bag.stage === 0) {
      game.hud.prompt("So many little fires. Each one a piece of something that was taken.");
    }
    if (id === "inside" && bag.stage === 0) {
      bag.stage = 1;
      game.hud.prompt("Inside the light now. It does not know you are the dark it fears.");
    }
    if (id === "hall" && bag.stage === 1) {
      bag.stage = 2;
      game.setObjective("Take the Noonstaff");
      game.hud.prompt(game.isTouch
        ? "The Noonstaff. Drift close and tap <b>✦</b> to take it."
        : "The Noonstaff. Drift close and press <span class='keycap'>E</span> to take it.");
    }
    if (id === "gate" && bag.stage === 0) {
      game.hud.prompt("KEEP THE FIRES FED, the stones say. You mean to.");
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.3;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    game.hud.prompt("<b>The citadel wakes.</b> The Noonstaff's glow betrays you — run, shadow, RUN.");
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.88 + 0.12 * Math.sin(t * 7 + tc.x * 2));
    }
    // dormant lamps ignite after the theft
    if (game.scepterTaken && bag.alarmT < 1) {
      bag.alarmT = Math.min(1, bag.alarmT + dt);
      for (const d of bag.dormant) {
        d.light.intensity = d.target * bag.alarmT;
        d.fixture.material.emissive.setHex(0xff8866);
        d.fixture.material.emissiveIntensity = 0.6 + bag.alarmT * 4;
      }
    }
    // scepter: bobbing, spinning — and riding the thief once taken
    const s = bag.scepter;
    if (s) {
      s.core.rotation.y = t * 2;
      if (game.scepterTaken) {
        const p = game.player.pos;
        s.group.position.set(p.x, 1.5 + Math.sin(t * 3) * 0.1, p.z);
      } else {
        s.group.position.set(s.x, 1.9 + Math.sin(t * 2) * 0.12, s.z);
      }
    }
    // extraction rift pulse
    if (bag.extract) {
      bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
    }
  };

  bag.startVials = 2;
  return bag;
}
