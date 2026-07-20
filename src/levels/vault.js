import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL 2 — THE MIRROR VAULT (interior).
 *
 * A tight indoor heist that is a PUZZLE as much as a stealth run. From the
 * entry hall the way forks:
 *
 *   • WEST — the Scrying Gallery: short, but its mirror pools betray your
 *     reflection to the wardens unless you kill the braziers or hug the dark.
 *   • EAST — the Service Corridor: longer and darker, but paved in singing
 *     crystal; creep it, or douse and dash.
 *
 * Both meet at the Reliquary Antechamber, watched by a GREAT EYE that sweeps a
 * long gaze across the only door to the inner sanctum. Cross it by timing the
 * sweep, veiling yourself in the mist banks, dousing the lamps that light you,
 * or blinking through the gap. Take the Heart and carry it back out — the Eye
 * and every warden now hunting.
 *
 * New mechanics introduced: mirror reflections + the Great Eye. Everything
 * else (noise, fog, blink, vials, the maw) is assumed learned.
 */
export function buildVault() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "vault";
  bag.name = "THE MIRROR VAULT";
  bag.spawn.set(0, 0.42, 29);

  const H = 3.4;
  const W = (w, d, x, z, h = H) => kit.wall(w, h, d, x, z);

  // ===================== ENTRY HALL  (x -7..7, z 22..32) =====================
  kit.floor(15, 11, 0, 27);
  kit.surface(-7, 22, 7, 32, "obsidian");
  W(15, 0.5, 0, 32);                       // south wall
  W(0.5, 11, -7.2, 27); W(0.5, 11, 7.2, 27); // sides
  // north wall of entry with a central door (gap x -2..2)
  W(5.2, 0.5, -4.6, 22); W(5.2, 0.5, 4.6, 22);
  kit.trim(4, 0.16, 0, 3.0, 31.8, 0, 0x8a5cff, 1.8);
  kit.extraction(0, 28);                    // carry the Heart back here
  kit.trim(3.4, 0.2, 0, 2.4, 31.6, 0, 0x39f0c0, 2.0);

  // ===================== T-JUNCTION  (x -18..18, z 16..22) ====================
  kit.floor(37, 7, 0, 19);
  W(37, 0.5, 0, 15.7);                      // north wall of the junction (blocks straight-north)
  W(0.5, 7, -18.2, 19); W(0.5, 7, 18.2, 19);
  // reconnect: the entry door leads in; wings branch at the ends
  // west branch door (gap at x -18 west wall) and east branch door handled by wing walls
  kit.torch(0, 19, { intensity: 5, range: 8 });

  // ===================== WEST — SCRYING GALLERY (x -22..-10, z -2..16) ========
  kit.floor(13, 19, -16, 7);
  kit.surface(-22, -2, -10, 16, "moss");    // quiet stone — silence is not your problem here; light is
  W(0.5, 19, -22.2, 7);                     // west wall
  W(13, 0.5, -16, -2.3);                    // north wall (door gap to antechamber, cut below)
  // seam wall between junction and gallery, with a door at z 16..12
  W(0.5, 5, -10, 5.5);                      // partial wall x=-10 lower
  W(0.5, 6, -10, -0.5);
  // (door gap around z 8..12 on the x=-10 seam is the entry from the junction west end)
  // mirror pools — stand over one while lit and a warden across the room sees you
  kit.reflectPool(-16, 11, 2.1);
  kit.reflectPool(-18, 3, 1.8);
  kit.reflectPool(-13, -0.5, 1.6);
  // braziers that light the gallery (douse them to kill your reflection)
  kit.torch(-19, 8, { intensity: 7, range: 10 });
  kit.torch(-13, 4, { intensity: 7, range: 10 });
  // cover columns
  kit.pillar(0.5, H, -16, 7);
  kit.solid(1.4, 1.2, 1.4, -19, -0.5, kit.mats.block, 0.2);
  kit.mawMote("vmawW", -20, 13);
  kit.cache("vcW", -20.5, 1, 2);

  // ===================== EAST — SERVICE CORRIDOR (x 10..22, z -2..16) =========
  kit.floor(13, 19, 16, 7);
  W(0.5, 19, 22.2, 7);                      // east wall
  W(13, 0.5, 16, -2.3);                     // north wall (door gap cut below)
  W(0.5, 5, 10, 5.5); W(0.5, 6, 10, -0.5);  // seam wall x=10 with a door gap z 8..12
  kit.surface(12, -2, 20, 14, "crystal");   // the whole run sings
  // chicane cover
  kit.solid(1.2, 1.4, 4, 13, 11, kit.mats.block, 0);
  kit.solid(1.2, 1.4, 4, 19, 4, kit.mats.block, 0);
  kit.solid(4, 1.4, 1.2, 15.5, -0.5, kit.mats.block, 0);
  kit.torch(20, 12, { intensity: 5, range: 8 });
  kit.cache("vcE", 20.5, 6, 2);
  kit.mawMote("vmawE", 12.5, 1);

  // ===================== ANTECHAMBER  (x -14..14, z -12..-2) ==================
  kit.floor(29, 11, 0, -7);
  kit.surface(-14, -12, 14, -2, "obsidian");
  W(0.5, 11, -14.2, -7); W(0.5, 11, 14.2, -7);         // side walls
  // south wall of antechamber with the two wing doors (gaps at x -13..-10 and 10..13)
  W(6, 0.5, -3.5, -2.3); W(6, 0.5, 3.5, -2.3);
  // north wall = the Eye's wall, single central door (gap x -2..2) into the sanctum
  W(12, 0.5, -8, -12); W(12, 0.5, 8, -12);
  // corner lamps that expose the room (part of the Eye puzzle: douse them to pass dark)
  kit.torch(-11, -4, { intensity: 6, range: 9 });
  kit.torch(11, -4, { intensity: 6, range: 9 });
  // fog banks: cover lanes to cross the gaze
  kit.fogPatch(-9, -11, -1, -3, { conceal: 0.68, density: 0.055 });
  kit.fogPatch(2, -10, 9, -4, { conceal: 0.6, density: 0.05 });
  // a mirror pool right before the door — reflection tell under the Eye
  kit.reflectPool(0, -4, 1.7);
  kit.pillar(0.5, H, -6, -6); kit.pillar(0.5, H, 6, -6);

  // THE GREAT EYE — sits in the north wall, sweeping south across the door
  kit.greatEye(0, -12.6, {
    dir: Math.PI / 2,        // stare south (+z)
    sweep: 0.72, sweepSpeed: 0.55,
    range: 22, coneAngle: 0.24,
    height: 3.2,
  });

  // ===================== SANCTUM  (x -6..6, z -22..-12) =======================
  kit.floor(13, 11, 0, -17);
  kit.surface(-6, -22, 6, -12, "crystal");
  W(13, 0.5, 0, -22.3);
  W(0.5, 11, -6.2, -17); W(0.5, 11, 6.2, -17);
  kit.scepterPedestal(0, -18);               // "the Heart" — reuse the relic
  kit.trim(5, 0.2, 0, 3.0, -22.1, 0, 0xffd76a, 2.2);
  kit.torch(-4, -14, { intensity: 6, range: 8 });
  kit.torch(4, -14, { intensity: 6, range: 8 });

  // ===================== wardens =====================
  kit.guard([[-19, 12], [-19, 2], [-13, 2], [-13, 12]], { speed: 1.4, pause: 1.2 }); // 0 gallery orbit
  kit.guard([[13, 13], [19, 13], [19, 2], [13, 2]], { speed: 1.5, pause: 1.0 });     // 1 corridor orbit
  kit.guard([[19, 8], [12, 0]], { speed: 1.3, pause: 1.4 });                          // 2 corridor sweeper
  kit.guard([[-10, -5], [10, -5]], { speed: 1.4, pause: 1.6 });                       // 3 antechamber lane

  // ===================== ambient =====================
  const moon = new THREE.DirectionalLight(0x7a8cc0, 0.9);
  moon.position.set(-10, 22, 12);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  for (const [x, y, z, i] of [[0, 8, 27, 30], [0, 8, 19, 26], [-16, 8, 7, 24], [16, 8, 7, 24], [0, 8, -7, 30], [0, 8, -17, 22]]) {
    const f = new THREE.PointLight(0x7088b0, i, 34);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.8;
    scene.add(f);
  }

  // ===================== checkpoints / triggers =====================
  kit.checkpoint(0, 28, 3);
  kit.checkpoint(0, 18, 2.4);
  kit.checkpoint(-16, 2, 2.4, -16, 2);
  kit.checkpoint(16, 3, 2.4, 16, 3);
  kit.checkpoint(0, -3.5, 2.2, 0, -3.2);
  kit.trigger("fork", 0, 19, 3);
  kit.trigger("ante", 0, -3, 3.2);
  kit.trigger("sanctum", 0, -15, 2.6);

  bag.startVials = 3;

  // ===================== mission logic =====================
  bag.stage = 0;
  bag.alarmT = 0;
  bag.objective = "Find the Heart of the Vault";
  bag.onTrigger = (id, game) => {
    if (id === "fork" && bag.stage === 0) {
      bag.stage = 1;
      game.hud.prompt("Two ways up: the <b>west gallery</b> of mirrors, or the <b>east crystal corridor</b>. Both reach the antechamber.");
    }
    if (id === "ante" && bag.stage <= 1) {
      bag.stage = 2;
      game.setObjective("Cross the Eye's gaze to the sanctum");
      game.hud.prompt("<b>The Great Eye</b> sweeps the door. It won't chase — but if it catches you lit, it calls the whole vault. <b>Time the sweep</b>, hide in mist, or kill the lamps.");
    }
    if (id === "sanctum" && bag.stage === 2) {
      bag.stage = 3;
      game.setObjective("Take the Heart");
      game.hud.prompt(game.isTouch
        ? "The <b>Heart</b>. Drift close and tap <b>✦</b> to take it."
        : "The <b>Heart</b>. Drift close and press <span class='keycap'>E</span> to take it.");
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.35;
    game.sfx.alarm();
    game.setObjective("Escape with the Heart!");
    game.hud.prompt("<b>The vault wakes.</b> Carry the Heart back to the entry rift — RUN.");
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 6 + tc.x));
    }
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
    if (bag.extract) bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
  };

  return bag;
}
