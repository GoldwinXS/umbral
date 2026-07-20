import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL 0 — THE ASHWAY (tutorial).
 * A linear chain of small rooms, each teaching one mechanic:
 *   A shadow = fast/silent/unseen vs light = slow/loud/seen
 *   → B noisy crystal vs silent moss (sound draws Vespers)
 *   → C the light gem & how a Vesper takes ~2s to spot you (it kindles brighter)
 *   → D shadowstep across a void → E void vials (douse + lure) → F devour from
 *   behind → G the rift (exit).
 * Each locked door is a DENSE FOG WALL (kit.fogWall) that lifts once the room's
 * lesson is done — an unmistakable "not yet" barrier the player can read.
 */
export function buildTutorial() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "nursery";
  bag.name = "THE ASHWAY";
  bag.spawn.set(0, 0.42, 8);

  const W = (w, d, x, z) => kit.wall(w, 3.2, d, x, z); // wall helper, h=3.2

  // ---------- Room A (spawn) — x -5..5, z 0..10 ----------
  kit.floor(11.6, 11.6, 0, 5);
  kit.surface(-5, 0, 5, 10, "moss");
  W(11.6, 0.4, 0, 10.2);                    // back
  W(0.4, 11.6, -5.6, 5); W(0.4, 11.6, 5.6, 5); // sides
  W(4.1, 0.4, -3.75, 0); W(4.1, 0.4, 3.75, 0);  // front, gap x -1.5..1.5
  const gateA = kit.fogWall(0, 0, 3.2);
  kit.trim(3, 0.15, 0, 2.9, 10.0, Math.PI, 0x8a5cff, 2.0);

  // ---------- Corridor B — x -1.5..1.5, z -8..0 ----------
  kit.floor(3.8, 8.4, 0, -4);
  W(0.4, 8.4, -1.7, -4); W(0.4, 8.4, 1.7, -4);
  kit.surface(-1.5, -6, 1.5, -2, "crystal"); // the "singing" stretch
  // wall between corridor and room C (gap at corridor)
  W(5.1, 0.4, -4.15, -8); W(5.1, 0.4, 4.15, -8);
  const gateB = kit.fogWall(0, -8, 3.2);

  // ---------- Room C (light gem) — x -6..6, z -18..-8 ----------
  kit.floor(13.2, 10.4, 0, -13);
  kit.surface(-6, -18, -2, -8, "moss");      // quiet west lane
  kit.surface(2, -18, 6, -8, "moss");        // quiet east lane
  W(0.4, 10.4, -6.6, -13); W(0.4, 10.4, 6.6, -13);
  W(5.1, 0.4, -4.15, -18); W(5.1, 0.4, 4.15, -18);
  const gateC = kit.fogWall(0, -18, 3.2);
  kit.solid(1.8, 1.6, 1.8, -4, -11, kit.mats.block, 0.15);
  kit.solid(1.8, 1.6, 1.8, 4, -15, kit.mats.block, -0.2);
  const torchC = kit.torch(0, -13, { intensity: 7, range: 10 });

  // ---------- Corridor D (the gap) — x -1.5..1.5, z -26..-18 ----------
  kit.floor(3.8, 1.9, 0, -18.95);            // near lip
  kit.floor(3.8, 3.4, 0, -24.7);             // far lip
  W(0.4, 8.4, -1.7, -22); W(0.4, 8.4, 1.7, -22);
  kit.hole(-1.5, -23, 1.5, -19.5);
  // wall between corridor D and room E
  W(5.1, 0.4, -4.15, -26); W(5.1, 0.4, 4.15, -26);

  // ---------- Room E (vials) — x -6..6, z -36..-26 ----------
  kit.floor(13.2, 10.4, 0, -31);
  kit.surface(-6, -36, -2, -26, "moss");
  W(0.4, 10.4, -6.6, -31); W(0.4, 10.4, 6.6, -31);
  W(5.1, 0.4, -4.15, -36); W(5.1, 0.4, 4.15, -36);
  const gateE = kit.fogWall(0, -36, 3.2);
  const torchE = kit.torch(0, -31, { intensity: 8, range: 11 });
  kit.cache("cacheE", -4.5, -28.5, 3);
  kit.solid(1.6, 1.4, 1.6, 4.5, -28.5, kit.mats.block, 0.3);

  // ---------- Room F (strike) — x -6..6, z -46..-36 ----------
  kit.floor(13.2, 10.4, 0, -41);
  kit.surface(-6, -46, 6, -42.5, "moss");
  W(0.4, 10.4, -6.6, -41); W(0.4, 10.4, 6.6, -41);
  W(5.1, 0.4, -4.15, -46); W(5.1, 0.4, 4.15, -46);
  const gateF = kit.fogWall(0, -46, 3.2);
  kit.pillar(0.5, 2.6, -3.5, -38.5);
  kit.pillar(0.5, 2.6, 3.5, -44);
  kit.mawMote("mawF", -3.5, -37.5); // feed before the strike lesson

  // ---------- Room G (rift) — x -4..4, z -54..-46 ----------
  kit.floor(9.2, 8.4, 0, -50);
  kit.surface(-4, -54, 4, -46, "moss");
  W(9.2, 0.4, 0, -54.2);
  W(0.4, 8.4, -4.6, -50); W(0.4, 8.4, 4.6, -50);
  kit.extraction(0, -51.5);
  kit.trim(4, 0.2, 0, 2.6, -54.0, 0, 0x39f0c0, 2.2);

  // ---------- wardens ----------
  kit.guard([[-4.5, -13], [4.5, -13]], { speed: 1.5, pause: 1.4 });                    // 0: room C
  kit.guard([[2.5, -32], [-2.5, -32]], { speed: 1.1, pause: 2.0 });                    // 1: room E
  kit.guard([[0, -40.5], [3.2, -43], [0, -45], [-3.2, -43]], { speed: 1.3, pause: 0.8 }); // 2: room F

  // ---------- ambient light ----------
  // low moon + faint fills: rooms without a torch sit in navigable gloom (safe,
  // unseen), torch pools blaze bright. Contrast is the whole lesson.
  const moon = new THREE.DirectionalLight(0x8ea0cc, 0.55);
  moon.position.set(-12, 22, 6);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  const fills = [[0, 6, 5], [0, 6, -31]];
  for (const [x, y, z] of fills) {
    const f = new THREE.PointLight(0x8098c0, 5, 16);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ---------- checkpoints ----------
  kit.checkpoint(0, 8, 3);
  kit.checkpoint(0, -10, 2.5);
  kit.checkpoint(0, -18.9, 1.4, 0, -18.6);   // before the gap
  kit.checkpoint(0, -24.5, 1.6, 0, -24.5);   // after the gap
  kit.checkpoint(0, -28, 2.5);
  kit.checkpoint(0, -38, 2.5);

  // ---------- triggers ----------
  kit.trigger("moved", 0, 5.2, 2.0);
  kit.trigger("crystal", 0, -3.8, 2.2);
  kit.trigger("crossedB", 0, -7.2, 1.6);
  kit.trigger("lightRoom", 0, -10, 3);
  kit.trigger("crossedC", 0, -17.2, 1.6);
  kit.trigger("gap", 0, -18.9, 1.4);
  kit.trigger("across", 0, -24.3, 1.8);
  kit.trigger("vialRoom", 0, -28, 3);
  kit.trigger("strikeRoom", 0, -38, 3);
  kit.trigger("exitRoom", 0, -48, 3);

  // (no fog in the tutorial — mechanics are introduced later)

  // ---------- stage machine ----------
  bag.stage = 0;
  bag.objective = "Slip through the dark";
  const named = { gateA, gateB, gateC, gateE, gateF, torchE };
  bag.named = named;

  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "moved":
        if (bag.stage === 0) {
          bag.stage = 1;
          gateA.open(); game.sfx.gate();
          game.setObjective("Cross the singing floor");
          p.prompt(game.isTouch
            ? "In <b>shadow</b> you pour along fast and silent — in <b>light</b> you crawl and glow. Ahead, glassy <b>crystal</b> rings loud underfoot; soft <b>moss</b> is silent. Sound draws the Vespers."
            : "In <b>shadow</b> you pour along fast and silent — in <b>light</b> you crawl and glow. Ahead, glassy <b>crystal</b> rings loud underfoot; soft <b>moss</b> is silent. Sound draws the Vespers.");
        }
        break;
      case "crossedB":
        if (bag.stage === 1) {
          bag.stage = 2;
          gateB.open(); game.sfx.gate();
          game.setObjective("Pass the Vesper unseen");
          p.prompt("Your <b>eye-gem</b> (top-left) reads how lit you are — dark means <b>unseen</b>. A Vesper needs a moment to fix on you: it <b>kindles brighter and redder</b> as it does. Stay in shadow, or break its gaze before it flares red.");
        }
        break;
      case "crossedC":
        if (bag.stage === 2) {
          bag.stage = 3;
          gateC.open(); game.sfx.gate();
          game.setObjective("Shadowstep across the void");
          p.prompt(game.isTouch
            ? "A hungry void — fall in and it takes you. Aim at the far lip and tap <b>⤞</b> to shadowstep across."
            : "A hungry void — fall in and it takes you. Aim at the far lip and press <span class='keycap'>SPACE</span> to shadowstep across.");
        }
        break;
      case "across":
        if (bag.stage === 3) {
          bag.stage = 4;
          game.setObjective("Douse the flame with a void vial");
          p.prompt(game.isTouch
            ? "Take the <b>void vials</b>, face the flame, and tap <b>◍</b>. It drinks the light — and the <b>shatter lures</b> Vespers to the sound. Douse the flame and the mist lifts."
            : "Take the <b>void vials</b>, face the flame, and press <span class='keycap'>Q</span>. It drinks the light — and the <b>shatter lures</b> Vespers to the sound. Douse the flame and the mist lifts.");
        }
        break;
      case "strikeRoom":
        if (bag.stage === 5) {
          game.setObjective("Feed, then swallow the Vesper from behind");
          p.prompt(game.isTouch
            ? "Take the <b>crimson mote</b> — your eyes kindle red. Drift <b>behind</b> the Vesper and tap <b>🗡</b> to <b>swallow</b> it whole. Face it and you only shove."
            : "Take the <b>crimson mote</b> — your eyes kindle red. Drift <b>behind</b> the Vesper and press <span class='keycap'>F</span> to <b>swallow</b> it whole. Face it and you only shove.");
        }
        break;
      case "exitRoom":
        if (bag.stage === 6) {
          bag.stage = 7;
          game.setObjective("Enter the rift");
          p.prompt("The rift calls. Step in, little shadow.");
        }
        break;
    }
  };

  bag.update = (t, dt, game) => {
    // vial-room gate: opens when the torch is doused (or the guard is felled)
    if (bag.stage === 4 && (named.torchE.doused || game.wardens[1].state === "out")) {
      bag.stage = 5;
      gateE.open(); game.sfx.gate();
      game.setObjective("Slip past, or fell the Vesper from behind");
    }
    // strike-room gate: opens when the training warden is out
    if (bag.stage === 5 && game.wardens[2].state === "out") {
      bag.stage = 6;
      gateF.open(); game.sfx.gate();
      game.setObjective("Enter the rift");
      game.hud.prompt("It unravels into smoke. The way is open.");
    }
    // torch flame flicker
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.88 + 0.12 * Math.sin(t * 7 + tc.x));
    }
  };

  bag.startVials = 0;
  return bag;
}
