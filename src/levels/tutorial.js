import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL 0 — THE ASHWAY (tutorial). A single winding PATHWAY that introduces the
 * fundamentals one at a time, gently:
 *   Start (moss) → a fog-wall dead-end teaches "fog = a wall you can't pass"
 *   → SOUND room: hard crystal rings loud & draws a lone Vesper; soft moss is
 *     silent; two light towers show that light exposes you — keep to shadow
 *   → BLINK room: shadowstep across two bands of resonant floor, in silence
 *   → the rift.
 * No vials, no devouring here — those come later. Light, sound, and the
 * shadowstep are all this level asks the player to learn.
 */
export function buildTutorial() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "ashway";
  bag.name = "THE ASHWAY";
  bag.spawn.set(0, 0.42, 24);

  const W = (w, d, x, z) => kit.wall(w, 3.2, d, x, z); // wall helper, h = 3.2

  // ---------- Start room — x -5..5, z 20..28 (moss) ----------
  kit.floor(10.4, 8.4, 0, 24);
  kit.surface(-5, 20, 5, 28, "moss");
  W(10.4, 0.4, 0, 28.2);                 // north
  W(0.4, 8.4, 5.2, 24); W(0.4, 8.4, -5.2, 24); // sides
  W(3.5, 0.4, -3.25, 20); W(3.5, 0.4, 3.25, 20); // south, gap x -1.5..1.5
  kit.trim(3, 0.15, 0, 2.9, 20.05, 0, 0x8a5cff, 2.0);

  // ---------- Entry corridor — x -1.5..1.5, z 14..20 (moss) ----------
  kit.floor(3.8, 6.4, 0, 17);
  kit.surface(-1.5, 14, 1.5, 20, "moss");
  W(0.4, 6.4, 1.7, 17);                  // east
  W(0.4, 2.4, -1.7, 19); W(0.4, 1.4, -1.7, 14.5); // west, gap z 15..18 for the stub

  // ---------- Fog-wall dead-end (west stub) — teaches the barrier ----------
  kit.floor(7.9, 3.4, -5.25, 16.5);
  kit.surface(-9, 15, -1.5, 18, "moss");
  W(7.9, 0.4, -5.25, 18.2); W(7.9, 0.4, -5.25, 14.8); // stub N & S
  W(0.4, 3.4, -9.2, 16.5);               // solid cap behind the fog
  const fogA = kit.fogWall(-8.8, 16.5, 2.6, { rot: Math.PI / 2, h: 3.0 });

  // ---------- SOUND room — x -8..8, z 0..14 ----------
  kit.floor(16.4, 14.4, 0, 7);
  kit.surface(-8, 0, 8, 14, "moss");          // quiet moss all around
  kit.surface(-2, 4, 2, 10, "crystal");       // a loud shortcut straight down the middle
  W(6.5, 0.4, -4.75, 14.2); W(6.5, 0.4, 4.75, 14.2); // north, gap
  W(6.5, 0.4, -4.75, -0.2); W(6.5, 0.4, 4.75, -0.2); // south, gap
  W(0.4, 14.4, 8.2, 7); W(0.4, 14.4, -8.2, 7);       // sides
  // two light towers — pools to skirt around
  const towerHi = kit.torch(-4, 10, { intensity: 7, range: 8 });
  const towerLo = kit.torch(4, 4, { intensity: 7, range: 8 });
  // a single slow Vesper sweeping the middle — cross when it's turned away
  kit.guard([[-6, 7], [6, 7]], { speed: 1.0, pause: 2.0, range: 8 });

  // ---------- BLINK room — x -8..8, z -16..0 ----------
  kit.floor(16.4, 16.4, 0, -8);
  kit.surface(-8, -16, 8, 0, "moss");
  kit.surface(-8, -6, 8, -4, "crystal");      // resonant band 1  (z -6..-4)
  kit.surface(-8, -11, 8, -9, "crystal");     // resonant band 2  (z -11..-9)
  W(6.5, 0.4, -4.75, -16.2); W(6.5, 0.4, 4.75, -16.2); // south, gap
  W(0.4, 16.4, 8.2, -8); W(0.4, 16.4, -8.2, -8);       // sides
  kit.trim(3, 0.14, 0, 2.6, 0.05, 0, 0x39f0c0, 1.6);

  // ---------- Exit corridor + rift — x -1.5..1.5, z -20..-16 ----------
  kit.floor(3.8, 4.4, 0, -18);
  kit.surface(-1.5, -20, 1.5, -16, "moss");
  W(3.8, 0.4, 0, -20.2);
  W(0.4, 4.4, 1.7, -18); W(0.4, 4.4, -1.7, -18);
  kit.extraction(0, -18);
  kit.trim(3, 0.2, 0, 2.4, -20.0, 0, 0x39f0c0, 2.2);

  // ---------- ambient (low — torch pools & shadow must read) ----------
  const moon = new THREE.DirectionalLight(0x8ea0cc, 0.55);
  moon.position.set(-12, 22, 8);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  for (const [x, y, z] of [[0, 6, 22], [0, 6, -9]]) {
    const f = new THREE.PointLight(0x8098c0, 4, 15);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ---------- checkpoints ----------
  kit.checkpoint(0, 24, 3);
  kit.checkpoint(0, 12, 2);
  kit.checkpoint(0, -2, 2.4, 0, -1.5);

  // ---------- triggers / gentle teaching ----------
  kit.trigger("moved", 0, 18, 2.2);
  kit.trigger("stub", -6, 16.5, 2.4);
  kit.trigger("soundRoom", 0, 12, 2.6);
  kit.trigger("blinkRoom", 0, -2, 2.6);
  kit.trigger("exitRoom", 0, -15, 2.2);

  bag.stage = 0;
  bag.objective = "Follow the path";
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "moved":
        if (bag.stage === 0) {
          bag.stage = 1;
          p.prompt(game.isTouch
            ? "In <b>shadow</b> you are unseen — swift and silent. Follow the pathway. (A wall of <b>mist</b> to the west bars the way — barriers you cannot pass show as fog.)"
            : "In <b>shadow</b> you are unseen — swift and silent. Follow the pathway. (A wall of <b>mist</b> to the west bars the way — barriers you cannot pass show as fog.)");
        }
        break;
      case "stub":
        p.prompt("A <b>fog wall</b> — solid to you. Wherever mist stands like this, the way is shut. Turn back east.", 4);
        break;
      case "soundRoom":
        if (bag.stage === 1) {
          bag.stage = 2;
          game.setObjective("Slip past the Vesper");
          p.prompt("Hard <b>crystal</b> floor RINGS loud — watch the sound ripple out and draw the Vesper. Soft <b>moss</b> is silent. And the <b>light towers</b> expose you: keep to the dark, move on moss, cross when its gaze turns away.");
        }
        break;
      case "blinkRoom":
        if (bag.stage === 2) {
          bag.stage = 3;
          game.setObjective("Shadowstep the resonant floor");
          p.prompt(game.isTouch
            ? "Two bands of <b>resonant floor</b> ahead — loud to walk. <b>Shadowstep</b> over them: aim and tap <b>⤞</b>. Two leaps to the rift."
            : "Two bands of <b>resonant floor</b> ahead — loud to walk. <b>Shadowstep</b> over them: aim and press <span class='keycap'>SPACE</span>. Two leaps to the rift.");
        }
        break;
      case "exitRoom":
        if (bag.stage === 3) {
          bag.stage = 4;
          game.setObjective("Enter the rift");
          p.prompt("The rift calls. Step in, little shadow.");
        }
        break;
    }
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 7 + tc.x));
    }
  };

  bag.startVials = 0;
  // keep the fog-wall barrier permanent (it's a "you can't pass" demo)
  void fogA; void towerHi; void towerLo;
  return bag;
}
