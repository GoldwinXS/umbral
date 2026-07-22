import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * MISSION 4 — BRIGHTWARD  (level index 3) — THE EXAM, and the last base word.
 *
 * The first DAYLIGHT level. A low, harsh sun rakes the citadel corner to corner;
 * there is no ambient dark to hide in — only the long black strips a low sun
 * throws behind anything tall. Open sunlit ground = exposure; a building's or
 * obelisk's shade = the only cover. Steal the Noonstaff from the reliquary keep
 * and run it back to the rift before the light finds you.
 *
 * Six beats (see docs/REDESIGN_1-4.md, MISSION 4):
 *   E1 KI    — FULL DAYLIGHT     : the parade court, three ways on (gate/E/W).
 *   E2 SHŌ   — THE FLANKS        : east shade-gallery (SNEAK/WAIT), west breach
 *              (LISTEN/BLINK past a Snuffed) — every old verb re-asked.
 *   E3 SHŌ   — THE THROWN SOUND  : NEW. LURE taught at a shadeless pinch — the
 *              M2 vial-throw re-read as bait, not a douse.
 *   E4 TEN   — THE SUN-RAKED COURT: the Turn. The shatter you feared, then aimed,
 *              is now the only way across a floor with no shade — LURE a guard
 *              into the sun to buy your own shadow. You cannot douse the sky.
 *   E5 TEN   — THE RELIQUARY KEEP: indoors, DOUSE works again; the full sentence
 *              spoken once; take the Noonstaff.
 *   E6 KETSU — THE NOONSTAFF, FLEEING: the citadel wakes, dormant lamps ignite,
 *              the relic's glow rides your back — run the shade lanes in reverse.
 *
 * FLAT by law (verticality embargo on 1–4): the fork is left/centre/right on one
 * plane; the breach `hole` is a horizontal BLINK, never a tier. Palette law:
 * amber/orange/red = Vigil, VIOLET = Hush only. Geometry is watertight
 * (kit.room/corridor, audited) and preserved verbatim.
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
const TUNE = {
  sun:  { color: 0xffdca8, intensity: 2.6, pos: [-30, 14, 20] }, // low day sun, elev ≈22° (tune)
  sky:  { color: 0x25324a, intensity: 0.4 },                     // visual-only sky fill
  vGate:    { speed: 1.3, pause: 1.3 },                // OUTER COURT gate Vesper
  vBastion: { speed: 1.3, pause: 1.4, range: 11 },     // EAST — the patient watcher
  sFlank:   { speed: 1.0, pause: 2.0, blind: true },   // WEST — the Snuffed (sound-hunter)
  vCross:   { speed: 1.4, pause: 1.0 },                // COURTYARD — crosses the sunlit centre
  vHedge:   { speed: 1.2, pause: 1.5 },                // COURTYARD — south beat, clear of fountain
  vKeep:    { speed: 1.3, pause: 1.1 },                // KEEP warden — boxes the pedestal
  greatLantern: { intensity: 14, range: 12, scale: 1.8 },
  keepLantern:  { intensity: 13, range: 11 },
  nookLamp:     { intensity: 5, range: 7, color: 0xffc07a }, // west derelict lamp (amber; was violet — palette fix)
  beaconMul:  1.3,                                     // guard speed ×on the theft
  trimAmber:  0xffb46a,                               // Vigil structural trim (replaces palette-illegal violet)
};

export function buildMission1() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x243044); // muted daylight — dim, not bright
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "citadel";
  bag.name = "BRIGHTWARD";
  bag.spawn.set(-9, 0.42, 26);
  bag.bounds = { x0: -34, z0: -36, x1: 34, z1: 30 };
  bag.startVials = 2;

  // ================= GEOMETRY (watertight, clean-corner; PRESERVED verbatim) ===
  //
  //           WEST FLANK  ---w-corr---  OUTER COURT  ---e-corr---  EAST BASTION
  //          (x-34..-20)                (x-16..16)                 (x20..34)
  //          h6, moss           h4.5, moss (spawn)          h9, obsidian
  //                \                    |                        /
  //               [breach]           gate-corr                e-corr2
  //               (hole)             (vertical)                (horiz)
  //                  \                  |                      /
  //                   \-----------  COURTYARD  --------------/
  //                        (x-16..16, z-15..1) h8, moss/crystal/moss
  //                                    |
  //                                 keep-corr
  //                                    |
  //                              RELIQUARY KEEP
  //                            (x-12..12, z-36..-20) h10, crystal

  const outerCourt = kit.room(-16, 6, 16, 30, {
    doors: { s: [[-2, 2]], e: [[16, 20]], w: [[16, 20]] },
    h: 4.5, surface: "moss",
  });
  kit.corridor(-2, 1, 2, 6, { h: 4.5, surface: "moss" }); // gate corridor (vertical)

  const courtyard = kit.room(-16, -15, 16, 1, {
    doors: { n: [[-2, 2]], e: [[-8, -4]], w: [[-8, -4]], s: [[-2, 2]] },
    h: 8,
  });
  kit.surface(-16, -15, -5, 1, "moss");    // west band — shade lane
  kit.surface(-5, -15, 5, 1, "crystal");   // centre band — open, sunlit, loud
  kit.surface(5, -15, 16, 1, "moss");      // east band — shade lane

  kit.corridor(16, 16, 20, 20, { h: 6, surface: "obsidian" }); // east-corr (court<->bastion)
  kit.corridor(16, -8, 20, -4, { h: 8, surface: "obsidian" }); // east-corr2 (courtyard<->bastion)

  const eastBastion = kit.room(20, -12, 34, 22, {
    doors: { w: [[16, 20], [-8, -4]] },
    h: 9, surface: "obsidian",
  });

  kit.corridor(-20, 16, -16, 20, { h: 5, surface: "moss" });   // west-corr

  const westFlank = kit.room(-34, -12, -20, 22, {
    doors: { e: [[16, 20], [-8, -4]] },
    h: 6, surface: "moss",
  });

  // the WEST BREACH: a real void gap in the wall — BLINK across (horizontal, per
  // the verticality embargo). kit.hole builds no walls; cap both ends so the open
  // x[-20,-16] channel can't leak north/south past the hole's z[-8,-4].
  kit.hole(-20, -8, -16, -4);
  kit.wall(3.6, 6, 0.4, -18, -8);
  kit.wall(3.6, 6, 0.4, -18, -4);

  kit.corridor(-2, -20, 2, -15, { h: 9, surface: "moss" });    // keep-corr (courtyard<->keep)

  const keep = kit.room(-12, -36, 12, -20, {
    doors: { n: [[-2, 2]] },
    h: 10, surface: "crystal",
  });

  // ================= SUN — the key light: low, harsh, one strong source ========
  const sun = new THREE.DirectionalLight(TUNE.sun.color, TUNE.sun.intensity);
  sun.position.set(...TUNE.sun.pos);
  sun.userData.rtRadius = 0.05;
  scene.add(sun, sun.target);
  const sky = new THREE.AmbientLight(TUNE.sky.color, TUNE.sky.intensity); // visual fill only
  scene.add(sky);

  // ================= GUARDS ====================================================
  kit.guard([[-4, 10], [4, 10]], TUNE.vGate);                          // E1 — gate Vesper
  kit.guard([[24, -8], [24, 16]], TUNE.vBastion);                      // E2 east — patient watcher
  kit.guard([[-24, -8], [-24, 14]], TUNE.sFlank);                      // E2 west — the Snuffed
  kit.guard([[-10, -5], [10, -5]], TUNE.vCross);                       // E4 — crosses the sunlit centre
  kit.guard([[3, -13], [3, -8]], TUNE.vHedge);                         // E4 — south beat
  kit.guard([[-4.2, -27], [4.2, -27], [4.2, -33], [-4.2, -33]], TUNE.vKeep); // E5 — the keep warden

  // ================= E1 · KI — "FULL DAYLIGHT" (the parade court) ==============
  // The Vigil parades the Noonstaff here to prove the dark is beaten (LORE Beat 2)
  // — a public square dressed for display, and you are the one dark thing in it.
  // The gate tower is the one reliable shade; it falls over the spawn.
  {
    const clear = [
      { x: -9, z: 26, r: 2.4 },                        // spawn (in the tower's shade)
      { x: 0, z: 27, r: 1.6 },                          // the rift
      { x0: -4, z0: 10, x1: 4, z1: 10, pad: 0.7 },      // V-gate patrol line
      { x0: -2, z0: 6, x1: 2, z1: 6, pad: 0.6 },        // S gate throat
      { x0: 16, z0: 16, x1: 20, z1: 20 },               // E throat (corridor)
      { x0: -20, z0: 16, x1: -16, z1: 20 },             // W throat (corridor)
      { x: -13, z: 29, r: 1.4 },                         // gate-tower pillar (KEPT shade-caster)
      { x: 5, z: 17, r: 1.2 },                           // the well
    ];
    // KEPT structural cover: the gate tower (long shade over spawn), two low
    // houses (trims recoloured amber — palette fix), the well.
    kit.pillar(1.3, 10, -13, 29, kit.mats.pillar);      // gate tower
    kit.solid(5, 6.5, 4, 8, 20, kit.mats.wall, 0.15);   // house
    kit.solid(4, 5, 5, -6, 14, kit.mats.wall, -0.1);    // house
    kit.pillar(0.9, 0.9, 5, 17, kit.mats.pillar);       // the well
    // the market: stalls along the back (north) wall, a parked cart, urns at the well
    kit.wallRunSide(outerCourt, "n", [{ prop: "crateStack", w: 1 }, { prop: "barrel", w: 1 }, "urn"],
      { spacing: 2.6, inset: 0.8, clear, seed: 61 });
    kit.cluster(11, 23.5, ["cart", { prop: "sack", w: 2 }], { count: 3, footprint: 1.2, clear, seed: 63 });
    kit.flank(5, 17, { prop: "urn", opts: { scale: 0.9 } }, { gap: 1.4, clear, seed: 65 });
    kit.banner(-4, 3.2, 29.6, Math.PI, { w: 1.2, color: TUNE.trimAmber, seed: 31 });
    kit.banner(8, 3.2, 29.6, Math.PI, { w: 1.2, color: TUNE.trimAmber, seed: 33 });
    // KEPT liturgy + rift
    kit.extraction(0, 27);
    kit.inscription(0, 2.3, 6.35, "KEEP THE FIRES FED, the stones say. The sun feeds itself.", 0, "#ffb46a");
  }

  // ================= E2 · SHŌ — "THE FLANKS" (the two roads) ==================
  // EAST: the citadel's outer rampart — a tall blank wall throwing a cliff of
  // shade; dress it sparse + military (a supply line, a founder's stone block).
  {
    const clearE = [
      { x0: 24, z0: -8, x1: 24, z1: 16, pad: 0.7 },     // V-bastion patrol line
      { x0: 16, z0: -8, x1: 20, z1: -4 },               // inner door (east-corr2)
      { x0: 16, z0: 16, x1: 20, z1: 20 },               // outer door (east-corr)
      { x: 30, z: -6, r: 1.4 },                          // KEPT pillar
      { x: 32, z: 10, r: 1.3 },                          // KEPT pillar
    ];
    kit.pillar(1.4, 10, 30, -6, kit.mats.pillar);       // rampart pillars (shade-casters)
    kit.pillar(1.3, 8, 32, 10, kit.mats.pillar);
    kit.sarcophagus(27, 0, { rot: 0.2 });               // a founder's stone block
    kit.wallRunSide(eastBastion, "e", [{ prop: "crate", w: 2 }, "barrel", "chains"],
      { spacing: 2.4, inset: 0.7, clear: clearE, seed: 71 }); // a supply line down the wall
  }
  // WEST: a neglected, half-fallen quarter — the breach is a wall the Vigil never
  // repaired; dress it as collapse (rubble, broken columns, dead lamps) so the
  // void reads as ruin, not a designed door.
  {
    const clearW = [
      { x0: -24, z0: -8, x1: -24, z1: 14, pad: 0.7 },   // S-flank (Snuffed) line
      { x0: -20, z0: -8, x1: -16, z1: -4, pad: 0.3 },   // breach BLINK lane — keep it clean
      { x: -31, z: 14, r: 1.0 },                         // c2 cache
      { x: -27, z: 4, r: 1.2 },                          // KEPT pillar
    ];
    kit.pillar(0.9, 6, -27, 4, kit.mats.pillar);
    kit.torch(-27, -8, TUNE.nookLamp);                  // the one derelict working lamp (amber)
    // the collapse framing the void gap (backDir points the tall pieces at the breach)
    kit.cluster(-22, -6.5, ["rubble", { prop: "brokenColumn", w: 2 }, "deadLantern"],
      { count: 4, footprint: 1.2, backDir: Math.atan2(4, 0.5), clear: clearW, seed: 73 });
    kit.corner(westFlank, "nw", ["rubble", "brokenColumn"], { count: 3, clear: clearW, seed: 75 });
    kit.cache("c2", -31, 14, 2);
  }

  // ================= E3 · SHŌ — "THE THROWN SOUND" (teaches LURE) ==============
  // A guarded checkpoint into the sacred inner court — a narrow, watched doorway
  // with no shade past the cone. Flanking urns make the lane single-file; the
  // stone the vial sails past + an unlit brazier BEYOND the guard say "a sound
  // thrown here lands there." LURE is taught in the insideE/insideW handlers.
  {
    const clearP = [
      { x0: 16, z0: -8, x1: 20, z1: -4 },               // the door lane (keep readable)
      { x0: -10, z0: -5, x1: 10, z1: -5, pad: 0.7 },    // V-cross line
    ];
    kit.flank(14, -6, { prop: "urn", opts: { scale: 0.9 } },
      { dir: 0, gap: 1.9, face: "in", clear: clearP, seed: 81 }); // urns at the door jambs
    kit.sarcophagus(13.5, -9.4, { rot: 0.3 });          // the landmark the thrown vial sails past
    kit.brazier(9, -6, { lit: false, seed: 83 });       // "here is where a sound would land" (decor)
  }

  // ================= E4 · TEN — "THE SUN-RAKED COURTYARD" ======================
  // The Turn. The centre crystal band is the only way to the keep corr, and it is
  // both LIT (sun) and LOUD (crystal) with a Vesper walking it. You cannot douse
  // the sky — but you can LURE V-cross off the centre, and slip it on the obelisk
  // shade in the gap. The two obelisks are light-gnomons; compose the court sacred
  // and symmetrical so the shade lanes read as the intended edges. Cover is kept
  // OUT of the shade lanes so they stay lanes, not camp spots.
  {
    const clearC = [
      { x0: -10, z0: -5, x1: 10, z1: -5, pad: 0.7 },    // V-cross line
      { x0: 3, z0: -13, x1: 3, z1: -8, pad: 0.6 },       // V-hedge line
      { x0: -2, z0: -15, x1: 2, z1: 1, pad: 0.5 },       // N–S crossing lane to the keep
      { x: 0, z: -7, r: 1.6 },                            // fountain
      { x: -13, z: -1, r: 1.0 },                          // mote m1 pocket
      { x: 12, z: -12.5, r: 1.0 },                        // cache c1
      { x: -8, z: -3, r: 1.1 },                           // obelisk 1
      { x: -3, z: -10, r: 1.1 },                          // obelisk 2
    ];
    // KEPT: two tall obelisks (the crossing shade-lanes' casters) + central fountain
    kit.solid(1.6, 9, 1.6, -8, -3, kit.mats.pillar, 0.2);
    kit.solid(1.8, 7, 1.8, -3, -10, kit.mats.pillar, -0.15);
    kit.pillar(1.5, 1.3, 0, -7, kit.mats.pillar);       // fountain / reflecting basin
    // obelisk-shrines: offerings at each base (urns are decor — no camp cover in the lanes)
    kit.flank(-8, -3, { prop: "urn", opts: { scale: 0.9 } }, { dir: Math.PI / 2, gap: 1.6, face: "in", clear: clearC, seed: 91 });
    kit.flank(-3, -10, { prop: "urn", opts: { scale: 0.9 } }, { dir: Math.PI / 2, gap: 1.6, face: "in", clear: clearC, seed: 93 });
    // priest-statues flanking the sacred descent to the keep, facing the crossing
    // (x±4.6 keeps their colliders clear of the V-hedge waypoint at (3,-13))
    kit.statue(-4.6, -14, { scale: 1.0, h: 2.7, rot: 0.552, seed: 95 });
    kit.statue(4.6, -14, { scale: 1.0, h: 2.7, rot: -0.552, seed: 96 });
    kit.cache("c1", 12, -12.5, 2);
    kit.mawMote("m1", -13, -1);                          // DEVOUR alt, in the west shade
    kit.inscription(0, 2.4, 0.65, "KEEP THE FIRES FED — the sun needs no wick.", 0, "#ffb46a");
  }

  // ================= E5 · TEN (resolve) — "THE RELIQUARY KEEP" =================
  // Indoors, out of the sun — DOUSE works again (the great lantern is a real torch
  // you can shatter). The sanctum of the paraded relic: pedestal as landmark,
  // priest-statues framing it, columned rows (trims recoloured amber — the worst
  // palette offender), offering urns + cold braziers behind, an amber banner.
  {
    const clearK = [
      { x0: -4.2, z0: -33, x1: 4.2, z1: -27, pad: 0.6 }, // V-keep patrol box
      { x: 0, z: -31, r: 1.4 },                           // pedestal
      { x: 0, z: -21.5, r: 1.4 },                         // great lantern
      { x0: -2, z0: -20, x1: 2, z1: -20, pad: 0.4 },      // N door lane
      { x: -9, z: -33.5, r: 1.0 },                        // c3 cache
      { x: 9, z: -33.5, r: 1.0 },                         // m2 mote
      { x: -6.5, z: -28, r: 1.0 }, { x: 6.5, z: -28, r: 1.0 }, // KEPT pillar rows (approx)
    ];
    for (const zz of [-24, -28, -32]) {                 // KEPT columned rows
      kit.pillar(0.6, 4.5, -6.5, zz);
      kit.pillar(0.6, 4.5, 6.5, zz);
    }
    kit.torch(-3, -27, TUNE.keepLantern);
    kit.torch(3, -27, TUNE.keepLantern);
    kit.torch(0, -21.5, TUNE.greatLantern);             // the keep's own guard-light (dousable)
    kit.scepterPedestal(0, -31);
    // (tune) statues widened to gap 5.5 (spec 2.6) so they never sit in the warden's box
    kit.flank(0, -26, "statue", { gap: 5.5, dir: Math.PI / 2, face: "in", clear: clearK, seed: 101 });
    kit.wallRunSide(keep, "s", [{ prop: "urn", w: 2 }, { prop: "brazier", opts: { lit: false } }],
      { spacing: 3.0, inset: 0.6, clear: clearK, seed: 103 });
    kit.banner(0, 3.4, -35.5, 0, { w: 1.4, color: TUNE.trimAmber, seed: 35 });
    kit.cache("c3", -9, -33.5, 2);
    kit.mawMote("m2", 9, -33.5);
    kit.inscription(0, 2.4, -20.35, "TAKE ONLY WHAT THE DARK WILL CARRY", 0, "#ffd76a");
    const relicFill = new THREE.PointLight(0x7088b0, 3, 14);
    relicFill.position.set(0, 7, -29);
    relicFill.userData.rtRadius = 0.85;
    scene.add(relicFill);
  }

  // ================= E6 · KETSU — dormant alarm lamps (ignite on the theft) ====
  // As the parade court you crossed in stealth lights up, it becomes a lit trap.
  for (const [x, z] of [[-10, -3], [10, -3], [-5, -25], [5, -25]]) {
    const l = new THREE.PointLight(0xff8866, 0, 13);
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

  // ================= checkpoints ==============================================
  kit.checkpoint(-9, 24, 3);
  kit.checkpoint(0, 3, 2.5);
  kit.checkpoint(0, -4, 3);   // clear of the central fountain pillar at (0,-7)
  kit.checkpoint(0, -17, 2.5, 0, -17);

  // ================= triggers / six-beat teaching =============================
  kit.trigger("approach", 0, 20, 6);
  kit.trigger("gate", 0, 8, 3.5);
  kit.trigger("eastflank", 18, 18, 3);
  kit.trigger("westflank", -18, 18, 3);
  kit.trigger("inside", 0, -2, 3);      // north gate entry
  kit.trigger("insideE", 17, -6, 3);    // east flank mouth — the LURE pinch
  kit.trigger("insideW", -14, -6, 3);   // west flank mouth — the LURE pinch
  kit.trigger("cross", 0, -6, 2.6);     // E4 TEN — the sunlit crossing
  kit.trigger("hall", 0, -21, 3);       // E5 — take the Noonstaff

  // ================= mission logic ============================================
  bag.stage = 0;
  bag.alarmT = 0;
  bag.objective = "Take the Noonstaff";
  bag.onStart = (game) => game.hud.prompt("Full daylight. Keep to the shade.", 4.5);

  const teachLure = (game) => {
    if (bag._lureTaught) return;
    bag._lureTaught = true;
    game.hud.prompt(game.isTouch
      ? "Throw a vial <b>◍</b> past the guard — its light follows the sound."
      : "Throw a vial <span class='keycap'>Q</span> past the guard — its light follows the sound.");
  };
  const enterCourt = (game) => { if (bag.stage === 0) bag.stage = 1; };

  bag.onTrigger = (id, game) => {
    const p = game.hud;
    if (id === "approach" && bag.stage === 0 && !bag._approachSeen) {
      bag._approachSeen = true;
      p.prompt("Find the shade the sun cannot reach.");
    }
    if (id === "gate" && bag.stage === 0 && !bag._gateSeen) {
      bag._gateSeen = true;
      p.prompt("The gate is fastest and worst. Two flanks wait.");
    }
    if (id === "eastflank" && !bag._eastSeen) {
      bag._eastSeen = true;
      p.prompt("East: a long shade, and a patient watcher.");
    }
    if (id === "westflank" && !bag._westSeen) {
      bag._westSeen = true;
      p.prompt("West: a broken wall. Blink the gap.");
    }
    if (id === "inside") { enterCourt(game); if (!bag._insideSeen) { bag._insideSeen = true; p.prompt("Inside the light. Cross in the obelisks' shade."); } }
    if (id === "insideE") { enterCourt(game); teachLure(game); }
    if (id === "insideW") { enterCourt(game); teachLure(game); }
    if (id === "cross" && !bag._crossSeen) {
      bag._crossSeen = true;
      p.prompt("The sun won't douse. Lure the watcher off the crossing.");
    }
    if (id === "hall" && bag.stage === 1) {
      bag.stage = 2;
      game.setObjective("Take the Noonstaff");
      p.prompt(game.isTouch
        ? "The Noonstaff. Drift close and tap <b>✦</b>."
        : "The Noonstaff. Drift close and press <span class='keycap'>E</span>.");
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = TUNE.beaconMul;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    // the one KETSU relic-beat line (brief)
    game.hud.prompt("The citadel wakes — your stolen light betrays you. Run.");
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
        const pl = game.player.pos;
        s.group.position.set(pl.x, 1.5 + Math.sin(t * 3) * 0.1, pl.z);
      } else {
        s.group.position.set(s.x, 1.9 + Math.sin(t * 2) * 0.12, s.z);
      }
    }
    // extraction rift pulse
    if (bag.extract) {
      bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
    }
  };

  return bag;
}
