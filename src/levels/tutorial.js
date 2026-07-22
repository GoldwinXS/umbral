import * as THREE from "three";
import { makeKit } from "../levelKit.js";
import { lampMidden, vigilShrine, barredVista } from "./_dressing.js";

/**
 * MISSION 1 — THE ASHWAY  (level index 0) — THE PRIMER.
 *
 * Teaches the four nouns-and-verbs of the whole game as four clean beats, and
 * lets the last one TURN (per docs/REDESIGN_1-4.md):
 *   E1 KI    — WAKING IN THE ASH : HIDE (dark = unseen) + SNEAK; the fog = wall.
 *   E2 SHŌ   — THE SOUND FLOOR   : LISTEN (crystal rings, moss silent) + HIDE
 *              from the tower pools; one slow Vesper.
 *   E3 TEN   — THE RESONANCE GAP : the Turn. Crystal has meant "do not step" —
 *              now the path is MADE of it and BLINK makes the forbidden floor
 *              the floor you cross. Two counter-sweeping Vespers.
 *   E4 KETSU — THE WICKSTONE     : take Hush's first relic, the memory flash,
 *              step into the rift (LORE Beat 1 payoff).
 *
 * Night is total and free here — the only level where ambient dark alone hides
 * you everywhere, on purpose. Geometry is watertight (kit.room/corridor, audited).
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
const TUNE = {
  moon: 0.9,                                        // moonlight fill (raised — the primer was too dark to read)
  towerN: { intensity: 10, range: 9, scale: 1.7 },  // great lantern, SOUND room
  towerS: { intensity: 6, range: 7 },               // lesser lantern
  vSound: { speed: 1.0, pause: 1.8, range: 8 },      // the one SOUND-room Vesper
  vBlink: { speed: 1.1, pause: 1.0, range: 8 },      // the two BLINK-room Vespers
};

export function buildTutorial() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "ashway";
  bag.name = "THE ASHWAY";
  bag.spawn.set(-28, 0.42, 10);

  // ================= GEOMETRY (watertight, clean-corner kit.room/corridor) =====
  // START room x[-32,-24] z[6,14]; gap toward the path at x[-29,-27]
  kit.room(-32, 6, -24, 14, { doors: { s: [[-29, -27]] }, surface: "moss" });
  kit.corridor(-29, 3, -27, 6, { surface: "moss" });                       // start corridor
  // PATH x[-48,-8] z[0,3]: gap to start corridor, OPEN east into SOUND, west cap
  kit.room(-48, 0, -8, 3, { doors: { n: [[-29, -27]], e: [[0, 3]] }, surface: "moss" });
  const fogA = kit.fogWall(-34, 1.5, 2.6, { rot: Math.PI / 2, h: 3.0 });   // the barred west
  // SOUND room x[-8,10] z[-9,12]; west + east door gaps z[0,3]
  kit.room(-8, -9, 10, 12, { doors: { w: [[0, 3]], e: [[0, 3]] } });
  kit.surface(-8, -9, -5.5, 12, "moss");        // moss border (silent, safe)
  kit.surface(7.5, -9, 10, 12, "moss");
  kit.surface(-5.5, 9.5, 7.5, 12, "moss");
  kit.surface(-5.5, -9, 7.5, -6.5, "moss");
  kit.surface(-5.5, -6.5, 7.5, 9.5, "crystal"); // the big resonant floor (loud)
  kit.corridor(10, 0, 16, 3, { surface: "moss" });                         // sound corridor
  // BLINK room x[16,34] z[-9,12]; west + east door gaps z[0,3]
  kit.room(16, -9, 34, 12, { doors: { w: [[0, 3]], e: [[0, 3]] } });
  kit.surface(16, -9, 21, 12, "moss");
  kit.surface(21, -9, 24, 12, "crystal");       // band 1 (leap it)
  kit.surface(24, -9, 27, 12, "moss");          // the safe island between blinks
  kit.surface(27, -9, 30, 12, "crystal");       // band 2
  kit.surface(30, -9, 34, 12, "moss");
  // EXIT alcove x[34,38] z[0,3]: OPEN west into BLINK, capped east
  const exitRoom = kit.room(34, 0, 38, 3, { doors: { w: [[0, 3]] }, surface: "moss" });
  kit.extraction(36, 1.5);

  // light towers (SOUND room)
  const towerN = kit.torch(1, 7, TUNE.towerN);   // a great lantern
  const towerS = kit.torch(1, -2, TUNE.towerS);  // a lesser one

  // guards
  kit.guard([[1, -5], [1, 8]], TUNE.vSound);              // SOUND: one slow sweep
  kit.guard([[19, -7], [19, 10]], TUNE.vBlink);           // BLINK: counter-sweep, +z
  kit.guard([[31, 10], [31, -7]], TUNE.vBlink);           // BLINK: counter-sweep, -z

  // ================= E1 · KI — "WAKING IN THE ASH" ============================
  // The lamp-midden: where the Vigil dumps snuffed lamps — the pile Hush wakes
  // from. Dead lanterns + rubble + a broken column, a tipped hauling cart.
  {
    const clear = [
      { x: -28, z: 10, r: 2.4 },                          // spawn
      { x0: -29, z0: 3, x1: -27, z1: 14, pad: 0.4 },      // start-corridor lane
      { x0: -34, z0: 0.9, x1: -8, z1: 2.1, pad: 0.2 },    // the east walking strip
    ];
    lampMidden(kit, -30.5, 8.4, { backDir: Math.atan2(-1, 1), count: 5, footprint: 1.3, clear, seed: 3 });
    kit.cart(-25.4, 7.2, { rot: 2.5, seed: 2 });          // the dumping cart, shoved aside
    // the barred vista beyond the fog (x[-48,-34], unreachable) — intact Vigil
    // grandeur, "the citadel goes on without you." Colliders here are harmless.
    barredVista(kit, -42, 1.5, { clear: [], seed: 11 });
    kit.cart(-44, 2.3, { rot: -0.5, seed: 13 });
    kit.deadLantern(-46.6, 1.5, { seed: 16 });
    kit.chains(-32.8, 1.5, { y: 3.0, len: 1.4, seed: 8 }); // hanging just this side of the fog
    // the discard route east — a sparse rhythmic file of spent lamps funnelling
    // toward the SOUND door (decor only, so it never blocks the lane)
    kit.leadingLine(-33.5, 1.5, -9.5, 1.5, [{ prop: "urn", w: 2 }, "deadLantern"], {
      spacing: 5.5, offset: 1.2, face: "in", seed: 9,
      clear: [{ x0: -29, z0: 2, x1: -27, z1: 3, pad: 0.3 }],   // keep the corridor mouth clear
    });
  }

  // ================= E2 · SHŌ — "THE SOUND FLOOR" ============================
  // Tower shrines mark the lit pools as sacred/danger; cover only on the silent
  // dark moss edges (the reward for the long way round).
  {
    const clear = [
      { x0: 0, z0: -9, x1: 2, z1: 12, pad: 0.4 },         // the Vesper's line x≈1
      { x0: -5.5, z0: -6.5, x1: 7.5, z1: 9.5, pad: 0.2 }, // keep the crystal open/loud
      { x0: -1.5, z0: 9.5, x1: 1.5, z1: 12 },             // N edge lane
    ];
    vigilShrine(kit, 1, 7, { gap: 1.7, urnScale: 0.9, clear, seed: 27 });    // great tower altar
    vigilShrine(kit, 1, -2, { gap: 1.6, urnScale: 0.85, clear, seed: 29 });  // lesser tower altar
    kit.corner({ x0: -8, z0: -9, x1: 10, z1: 12 }, "sw",
      [{ prop: "crateStack", w: 2, foot: 0.8 }, "barrel", "sack"], { count: 4, clear, seed: 21 });
    kit.corner({ x0: -8, z0: -9, x1: 10, z1: 12 }, "ne",
      ["brokenColumn", { prop: "rubble", w: 2 }], { count: 3, clear, seed: 22 });
    kit.banner(1, 2.4, 12.05, Math.PI, { w: 1.2, color: 0xffb46a, seed: 31 }); // tended amber banner over the pool
  }

  // ================= E3 · TEN — "THE RESONANCE GAP" (+ the WICKSTONE) =========
  // The Turn. Bands of crystal wall the path; the safe moss island between them
  // holds Hush's first relic — you blink to it, take it, blink on. The Wickstone
  // (amber = stolen Vigil light) gates the win and fires the first memory
  // (bag.onAlarm). Its glow is dimmed so the island stays a viable dark step.
  const wick = kit.scepterPedestal(25.5, 6);          // on the island, off the z0..3 lane
  wick.core.material.emissive.set(0xffd76a);
  wick.light.intensity = 1.2; wick.light.distance = 4; // a faint relic glow, not a detection pool
  {
    const clear = [
      { x0: 16, z0: 0, x1: 34, z1: 3, pad: 0.4 },         // the z0..3 landing lane
      { x0: 18, z0: -9, x1: 20, z1: 12, pad: 0.4 },       // V-w line x≈19
      { x0: 30, z0: -9, x1: 32, z1: 12, pad: 0.4 },       // V-e line x≈31
      { x0: 21, z0: -9, x1: 24, z1: 12 },                 // band 1 — keep clear (leap it)
      { x0: 27, z0: -9, x1: 30, z1: 12 },                 // band 2 — keep clear
      { x: 25.5, z: 6, r: 1.1 },                          // keep dressing off the plinth
    ];
    kit.flank(25.5, 6, { prop: "urn", opts: { scale: 0.8 } }, { gap: 1.4, dir: 0, face: "in", clear, seed: 45 }); // frame the relic
    kit.statue(25.5, 11, { scale: 0.9, h: 2.4, seed: 41 });        // a watcher at the island's back
    kit.rubble(25.5, -7.2, { radius: 0.9, seed: 42 });             // low marker at a band lip
    kit.brazier(17.4, 10.6, { lit: false, seed: 43 });            // cold — flame is rationed
    kit.brazier(32.6, -7.6, { lit: false, seed: 44 });
  }

  // ================= E4 · KETSU — "THE GATE OF DEAD LAMPS" ====================
  // The rift, framed by two of the very dead lamps Hush was thrown among.
  kit.deadLantern(35.0, 0.35, { seed: 51 });
  kit.deadLantern(35.2, 2.75, { seed: 52 });
  kit.inscription(38.0, 2.0, 1.5, "THE ASH REMEMBERS WHAT THE FLAME FORGOT", -Math.PI / 2, "#ffb46a");

  // ================= ambient (low — pools & shadow must read) =================
  const moon = new THREE.DirectionalLight(0x8ea0cc, TUNE.moon);
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

  // ================= triggers / four-beat teaching ============================
  kit.trigger("moved", -28, 6, 2.4);
  kit.trigger("fogWall", -32, 1.5, 2.6);
  kit.trigger("soundRoom", -6, 1.5, 2.6);    // E2 entry — LISTEN
  kit.trigger("towerHide", 1, 2, 3.0);       // E2 near the pools — HIDE from light
  kit.trigger("blinkRoom", 17, 1.5, 2.6);    // E3 — the Turn (+ the Wickstone on the island)

  bag.stage = 0;
  bag.objective = "Wake, and follow the ashway";
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "moved":
        if (bag.stage === 0) {
          bag.stage = 1;
          p.prompt("In <b>shadow</b> you are unseen. Follow the hall east.");
        }
        break;
      case "fogWall":
        p.prompt("<b>Fog</b> is a wall — the way west is shut. Go east.", 4);
        break;
      case "soundRoom":
        if (bag.stage === 1) {
          bag.stage = 2;
          game.setObjective("Cross the singing floor");
          p.prompt("<b>Crystal</b> rings loud and draws them. <b>Moss</b> is silent.");
        }
        break;
      case "towerHide":
        if (bag.stage === 2 && !bag.towerTaught) {
          bag.towerTaught = true;
          p.prompt("<b>Light</b> exposes you — keep to the dark edges.", 4);
        }
        break;
      case "blinkRoom":
        if (bag.stage === 2) {
          bag.stage = 3;
          game.setObjective("Shadowstep to the Wickstone");
          p.prompt(game.isTouch
            ? "No way round the loud floor. <b>Shadowstep</b> the bands to the <b>Wickstone</b> — aim and tap <b>⤞</b>."
            : "No way round the loud floor. <b>Shadowstep</b> the bands to the <b>Wickstone</b> — aim and press <span class='keycap'>SPACE</span>.");
        }
        break;
    }
  };

  // Taking the Wickstone (interact at the plinth) fires this — no threats to
  // rouse in the primer; it is purely Hush's first flash of memory.
  bag.onAlarm = (game) => {
    game.setObjective("Escape through the rift");
    game.hud.prompt("You remember — a black tide, and men with hooks of light.", 5);
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 7 + tc.x));
    }
  };

  bag.startVials = 0;
  return bag;
}
