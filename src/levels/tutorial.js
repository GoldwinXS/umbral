import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL 0 — THE ASHWAY (tutorial). One winding PATHWAY, left → right, matching
 * the hand-drawn plan:
 *   Start (moss, pokes up off the path) → drop to the path; a FOG-WALL dead-end
 *   to the far left teaches "fog = a wall you can't pass"
 *   → SOUND room: two light towers to skirt, a loud CRYSTAL shortcut straight
 *     ahead vs silent MOSS detours, one slow Vesper looping the room
 *   → BLINK room: shadowstep across two bands of resonant floor while TWO
 *     Vespers sweep past each other in opposite directions
 *   → the rift.
 * Floors and surface plates are tiled with NO overlap (overlapping coplanar
 * plates z-fight). Light, sound, and the shadowstep are all this level teaches.
 */
export function buildTutorial() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "ashway";
  bag.name = "THE ASHWAY";
  bag.spawn.set(-28, 0.42, 10);

  const W = (w, d, x, z) => kit.wall(w, 3.2, d, x, z); // wall helper, h = 3.2

  // ================= FLOORS (one per cell, exactly abutting — no overlap) =====
  kit.floor(8, 8, -28, 10);      // START      x[-32,-24] z[6,14]  (now SOUTH of path)
  kit.floor(2, 3, -28, 4.5);     // start corr x[-29,-27] z[3,6]
  kit.floor(40, 3, -28, 1.5);    // PATH       x[-48,-8]  z[0,3]   (extends W past the fog)
  kit.floor(18, 21, 1, 1.5);     // SOUND      x[-8,10]   z[-9,12]
  kit.floor(6, 3, 13, 1.5);      // sound corr x[10,16]   z[0,3]
  kit.floor(18, 21, 25, 1.5);    // BLINK      x[16,34]   z[-9,12]
  kit.floor(4, 3, 36, 1.5);      // exit alcove x[34,38]  z[0,3]

  // ================= SURFACE PLATES (tiled, non-overlapping) ==================
  kit.surface(-32, 6, -24, 14, "moss");      // start room (south of path)
  kit.surface(-29, 3, -27, 6, "moss");       // start corridor
  kit.surface(-48, 0, -8, 3, "moss");        // path (continues west past the fog)
  // SOUND room: a LARGE loud crystal floor filling the centre (lit by the
  // towers) with only a thin MOSS border. Cross the middle and you must creep to
  // stay quiet — or hug the silent, dark edges the long way round.
  kit.surface(-8, -9, -5.5, 12, "moss");       // moss edge W
  kit.surface(7.5, -9, 10, 12, "moss");        // moss edge E
  kit.surface(-5.5, 9.5, 7.5, 12, "moss");     // moss edge N
  kit.surface(-5.5, -9, 7.5, -6.5, "moss");    // moss edge S
  kit.surface(-5.5, -6.5, 7.5, 9.5, "crystal"); // the big resonant floor
  kit.surface(10, 0, 16, 3, "moss");          // sound corridor
  // BLINK room: two vertical resonant bands with moss strips between
  kit.surface(16, -9, 21, 12, "moss");
  kit.surface(21, -9, 24, 12, "crystal");     // band 1
  kit.surface(24, -9, 27, 12, "moss");        // island
  kit.surface(27, -9, 30, 12, "crystal");     // band 2
  kit.surface(30, -9, 34, 12, "moss");
  kit.surface(34, 0, 38, 3, "moss");          // exit alcove

  // ================= WALLS ====================================================
  // START room x[-32,-24] z[6,14] (south of path), NORTH gap x[-29,-27]
  W(8.4, 0.4, -28, 14.2);                            // south
  W(0.4, 8.4, -32.2, 10); W(0.4, 8.4, -23.8, 10);   // sides
  W(3, 0.4, -30.5, 6); W(3, 0.4, -25.5, 6);          // north, gap x[-29,-27]
  // start corridor sides (z 3..6)
  W(0.4, 3.4, -29.2, 4.5); W(0.4, 3.4, -26.8, 4.5);
  // PATH x[-48,-8] z[0,3]: north solid; SOUTH gap for the corridor x[-29,-27]
  W(40.4, 0.4, -28, -0.2);                            // north (solid)
  W(19, 0.4, -38.5, 3.2); W(19, 0.4, -17.5, 3.2);    // south, gap x[-29,-27]
  // the hallway CONTINUES west into the mist — a world beyond reach. The fog
  // wall bars it; the corridor and its far wall are visible past the barrier.
  W(0.4, 3.4, -48.2, 1.5);                            // far west cap (dim, distant)
  const fogA = kit.fogWall(-34, 1.5, 2.6, { rot: Math.PI / 2, h: 3.0 });
  // SOUND room x[-8,10] z[-9,12], W gap z[0,3] (path), E gap z[0,3] (corridor)
  W(18.4, 0.4, 1, -9.2); W(18.4, 0.4, 1, 12.2);
  W(0.4, 9, -8.2, -4.5); W(0.4, 9, -8.2, 7.5);       // west, gap z[0,3]
  W(0.4, 9, 10.2, -4.5); W(0.4, 9, 10.2, 7.5);       // east, gap z[0,3]
  // sound corridor N/S
  W(6, 0.4, 13, 0); W(6, 0.4, 13, 3);
  // BLINK room x[16,34] z[-9,12], W gap z[0,3], E gap z[0,3]
  W(18.4, 0.4, 25, -9.2); W(18.4, 0.4, 25, 12.2);
  W(0.4, 9, 15.8, -4.5); W(0.4, 9, 15.8, 7.5);       // west, gap z[0,3]
  W(0.4, 9, 34.2, -4.5); W(0.4, 9, 34.2, 7.5);       // east, gap z[0,3]
  // exit alcove
  W(4, 0.4, 36, 0); W(4, 0.4, 36, 3); W(0.4, 3.4, 38.2, 1.5);
  kit.extraction(36, 1.5);
  kit.trim(2.6, 0.2, 36, 2.4, 0.05, 0, 0x39f0c0, 2.2);

  // ================= light towers (SOUND) =====================================
  const towerN = kit.torch(1, 7, { intensity: 10, range: 9, scale: 1.7 }); // a great lantern
  const towerS = kit.torch(1, -2, { intensity: 6, range: 7 });             // a lesser one

  // ================= guards ===================================================
  // SOUND: one slow Vesper sweeping the loud centre — so the safe line is the
  // dark, silent edges (or a slow creep across the middle when its gaze turns)
  kit.guard([[1, -5], [1, 8]], { speed: 1.0, pause: 1.8, range: 8 });
  // BLINK (final room): TWO Vespers sweeping in OPPOSITE directions
  kit.guard([[19, -7], [19, 10]], { speed: 1.1, pause: 1.0, range: 8 });   // starts heading +z
  kit.guard([[31, 10], [31, -7]], { speed: 1.1, pause: 1.0, range: 8 });   // starts heading -z

  // ================= ambient (low — pools & shadow must read) =================
  const moon = new THREE.DirectionalLight(0x8ea0cc, 0.55);
  moon.position.set(-12, 22, 8);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  for (const [x, y, z] of [[-18, 7, 1.5], [25, 7, 1.5]]) {
    const f = new THREE.PointLight(0x8098c0, 3.2, 13);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ================= checkpoints ==============================================
  kit.checkpoint(-28, 10, 3);
  kit.checkpoint(-10, 1.5, 2);
  kit.checkpoint(13, 1.5, 2, 13, 1.5);

  // ================= triggers / gentle teaching ===============================
  kit.trigger("moved", -28, 6, 2.4);
  kit.trigger("fogWall", -32, 1.5, 2.6);
  kit.trigger("soundRoom", -6, 1.5, 2.6);
  kit.trigger("blinkRoom", 17, 1.5, 2.6);
  kit.trigger("exitRoom", 33, 1.5, 2.2);

  bag.stage = 0;
  bag.objective = "Follow the path";
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "moved":
        if (bag.stage === 0) {
          bag.stage = 1;
          p.prompt("In <b>shadow</b> you are unseen — swift and silent. Head up into the hall, then follow it east.");
        }
        break;
      case "fogWall":
        p.prompt("West, the hall runs on into <b>mist</b> — the rest of the Ashway, a world not yet yours to walk. Wherever fog stands like this, the way is shut. Turn back east.", 4);
        break;
      case "soundRoom":
        if (bag.stage === 1) {
          bag.stage = 2;
          game.setObjective("Slip past the Vesper");
          p.prompt("Hard <b>crystal</b> floor RINGS loud — watch the sound ripple out and draw the Vesper. Soft <b>moss</b> is silent. The <b>light towers</b> expose you: skirt the dark edges, on moss, and cross when its gaze turns away.");
        }
        break;
      case "blinkRoom":
        if (bag.stage === 2) {
          bag.stage = 3;
          game.setObjective("Shadowstep past the wardens");
          p.prompt(game.isTouch
            ? "Two <b>resonant bands</b>, and two Vespers passing each other. <b>Shadowstep</b> over the loud floor in silence — aim and tap <b>⤞</b>, timing each leap between them."
            : "Two <b>resonant bands</b>, and two Vespers passing each other. <b>Shadowstep</b> over the loud floor in silence — aim and press <span class='keycap'>SPACE</span>, timing each leap between them.");
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
  void fogA; void towerN; void towerS;
  return bag;
}
