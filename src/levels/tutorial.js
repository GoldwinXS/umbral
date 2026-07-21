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

  // ================= ROOMS (watertight, clean-corner, via kit.room/corridor) ==
  // Floor + surface + walls build together; the old hand-placed W() segments and
  // their gaps map 1:1 to doors:{n,s,e,w}. SOUND and BLINK keep their tiled
  // multi-surface plates explicit (their kit.room builds only a plain floor).
  // Default kit height/thickness (3.2 / 0.4) match this level's old W() walls.

  // START room x[-32,-24] z[6,14]; gap toward the path at x[-29,-27]
  kit.room(-32, 6, -24, 14, { doors: { s: [[-29, -27]] }, surface: "moss" });
  // start corridor x[-29,-27] z[3,6]
  kit.corridor(-29, 3, -27, 6, { surface: "moss" });
  // PATH x[-48,-8] z[0,3]: solid on the z=0 side, gap x[-29,-27] toward the start
  // corridor, OPEN east into SOUND, capped west at the fogged dead-end
  kit.room(-48, 0, -8, 3, { doors: { n: [[-29, -27]], e: [[0, 3]] }, surface: "moss" });
  // the hallway CONTINUES west into the mist — a world beyond reach. The fog
  // wall bars it; the corridor and its west cap are visible past the barrier.
  const fogA = kit.fogWall(-34, 1.5, 2.6, { rot: Math.PI / 2, h: 3.0 });
  // SOUND room x[-8,10] z[-9,12]; west + east door gaps z[0,3]
  kit.room(-8, -9, 10, 12, { doors: { w: [[0, 3]], e: [[0, 3]] } });
  // a LARGE loud crystal floor filling the centre (lit by the towers) with only
  // a thin MOSS border — creep the middle, or hug the silent dark edges.
  kit.surface(-8, -9, -5.5, 12, "moss");       // moss edge W
  kit.surface(7.5, -9, 10, 12, "moss");        // moss edge E
  kit.surface(-5.5, 9.5, 7.5, 12, "moss");     // moss edge N
  kit.surface(-5.5, -9, 7.5, -6.5, "moss");    // moss edge S
  kit.surface(-5.5, -6.5, 7.5, 9.5, "crystal"); // the big resonant floor
  // sound corridor x[10,16] z[0,3]
  kit.corridor(10, 0, 16, 3, { surface: "moss" });
  // BLINK room x[16,34] z[-9,12]; west + east door gaps z[0,3]
  kit.room(16, -9, 34, 12, { doors: { w: [[0, 3]], e: [[0, 3]] } });
  kit.surface(16, -9, 21, 12, "moss");
  kit.surface(21, -9, 24, 12, "crystal");     // band 1
  kit.surface(24, -9, 27, 12, "moss");        // island
  kit.surface(27, -9, 30, 12, "crystal");     // band 2
  kit.surface(30, -9, 34, 12, "moss");
  // exit alcove x[34,38] z[0,3]: OPEN west into BLINK, capped east
  kit.room(34, 0, 38, 3, { doors: { w: [[0, 3]] }, surface: "moss" });
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

  // ================= DRESSING (props) =========================================
  // Rules: never intrude the central z[0,3] walking lane or a door gap; keep
  // colliders off the guard lines (sound x=1; blink x=19 / x=31) and off spawn.
  // Cover props (crate/barrel/column/statue/…) push colliders; urn/banner/
  // chains/brazier/deadLantern are pure decor.

  // START room x[-32,-24] z[6,14] — the safe threshold. Cover hugs the walls,
  // clear of spawn (-28,10) and the north gap x[-29,-27].
  kit.crateStack(-30.6, 8.2, { seed: 3 });
  kit.barrel(-30.4, 12.2, { seed: 5 });
  kit.sack(-25.2, 7.4, { seed: 2 });
  kit.crate(-24.9, 12.4, { size: 0.8, rot: 0.5, seed: 7 });
  kit.deadLantern(-31.3, 13.1, { seed: 1 });
  kit.banner(-28, 2.0, 13.85, Math.PI, { w: 1.1, color: 0x2c3b6a, seed: 4 }); // south wall

  // PATH (reachable stretch x[-34,-8]) — decor only, snug to the north wall so
  // the 3-wide lane stays open.
  kit.urn(-20.5, 0.55, { scale: 1.1, tall: true, seed: 9 });
  kit.deadLantern(-13.5, 0.45, { seed: 6 });
  kit.chains(-32.8, 1.5, { y: 3.0, len: 1.4, seed: 8 });   // just this side of the fog

  // BEYOND THE FOG (unreachable x[-48,-34]) — a full little vista glimpsed
  // through the mist, so the barred hall reads as a real world going on.
  kit.statue(-42, 1.5, { scale: 1.15, h: 3.0, rot: 0.4, seed: 11 });
  kit.brokenColumn(-45.2, 0.7, { h: 2.0, seed: 12 });
  kit.cart(-44, 2.3, { rot: -0.5, seed: 13 });
  kit.rubble(-38.5, 2.3, { radius: 1.0, seed: 14 });
  kit.barrel(-37, 0.6, { seed: 15 });
  kit.deadLantern(-46.6, 1.5, { seed: 16 });

  // SOUND room — cover ONLY on the silent dark moss edges (west x≈-6.8, east
  // x≈8.8), rewarding the long way round; nothing on the loud crystal centre
  // or the Vesper's line (x=1). Urns flank the two towers like little shrines.
  kit.crateStack(-6.9, 4.4, { seed: 21 });
  kit.brokenColumn(-6.7, 8.6, { h: 1.7, seed: 22 });
  kit.barrel(-6.8, -3.2, { seed: 23 });
  kit.crateStack(8.8, -4.2, { seed: 24 });
  kit.sarcophagus(8.6, 6.2, { rot: Math.PI / 2, seed: 25 });
  kit.statue(8.7, 10.4, { scale: 0.9, h: 2.4, seed: 26 });
  kit.urn(-0.7, 6.3, { scale: 0.9, seed: 27 });   // tower N (1,7) base
  kit.urn(2.7, 7.7, { scale: 0.9, seed: 28 });
  kit.urn(-0.7, -2.7, { scale: 0.8, seed: 29 });  // tower S (1,-2) base
  kit.urn(2.7, -1.3, { scale: 0.8, seed: 30 });
  kit.banner(-4, 2.2, 12.05, Math.PI, { w: 1.0, color: 0x243a5c, seed: 31 });
  kit.banner(6, 2.2, 12.05, Math.PI, { w: 1.0, color: 0x243a5c, seed: 32 });

  // BLINK room — only the central moss island (x[24,27]) and back corners get
  // landmarks, well clear of the z[0,3] landing lane and the guard lines
  // (x=19, x=31). They read as things to blink *toward*.
  kit.statue(25.5, 10.2, { scale: 1.0, h: 2.7, seed: 41 });
  kit.rubble(25.5, -7.2, { radius: 0.9, seed: 42 });
  kit.brazier(17.4, 10.6, { seed: 43 });
  kit.brazier(32.6, -7.6, { seed: 44 });

  // EXIT alcove — two dead lanterns flanking the rift like a gate (decor only).
  kit.deadLantern(35.0, 0.35, { seed: 51 });
  kit.deadLantern(35.0, 2.65, { seed: 52 });

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
