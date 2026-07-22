import * as THREE from "three";
import { makeKit } from "../levelKit.js";
import { lampMidden, vigilShrine, barredVista } from "./_dressing.js";

/**
 * MISSION 1 — THE ASHWAY  (level index 0) — THE PRIMER.
 *
 * ============================== SITE DOSSIER =================================
 * WHAT: A burned lamplighters' terrace street of Lanternspire — one row of the
 *   lamp-tenders' quarter that caught and gutted a season ago — now being
 *   stripped for salvage by the Candent Vigil, who keep exactly one shrine lit
 *   among the ruins. Behind the row: the ash-pits where its dead lamps go.
 * WHO: the ASH-CARTERS (tip snuffed and broken lamps into the pit at dusk);
 *   the SHRINE-KEEPER (feeds the street's last two flames through the night);
 *   the SALVAGE-MASTER and his two TALLY-MEN (pry the fire-glassed lamp-glass,
 *   lay it in rows, count and crate it for the citadel).
 * PARTI: ash-pit → the burnt row (the Ashway) → shrine court → salvage yard →
 *   carters' gate. Deliveries run east: pried glass to the yard, crates out the
 *   gate at dawn. Ash runs west: dead lamps out the back to the pit.
 * WHY THE RELIC IS HERE: the WICKSTONE — the first wick ever lit on this row,
 *   the street's founding relic — hung in the street shrine and survived the
 *   fire. The salvage-master had it crated with the rest of the take; tonight
 *   it stands on his tally plinth in the yard, deepest point of the route,
 *   between the laid glass rows, awaiting the morning cart to Lanternspire.
 *   The fire took every working lamp here, so no lamp lights it — instead the
 *   Vigil posts both tally-men on the yard, and the moon does the rest.
 * TABLEAUX: (1) an ash-cart tipped mid-dump at the pit mouth, dead lanterns
 *   spilled where Hush wakes; (2) stripped fittings crated against a surviving
 *   facade, staged for the morning cart; (3) the keeper's crate-seat and supper
 *   sack beside his swept, urn-flanked shrine — the one tended spot in the
 *   ruin; (4) a half-loaded cart standing at the carters' gate while the day
 *   crew's brazier goes cold on the yard's edge.
 * THE NIGHT SHIFT: the KEEPER'S MAN walks the shrine walk between the court's
 *   two flames, pausing at each to tend the wick. The two TALLY-MEN each pace
 *   their own row of laid glass end to end, opposite ways, pausing at the
 *   row-heads to count. Nobody guards the pit — the Vigil does not watch its
 *   own trash.
 * =============================================================================
 *
 * Teaches the four nouns-and-verbs of the whole game as four clean beats, and
 * lets the last one TURN (per docs/REDESIGN_1-4.md):
 *   E1 KI    — WAKING IN THE ASH : HIDE (dark = unseen) + SNEAK; the fog = wall.
 *   E2 SHŌ   — THE SOUND FLOOR   : LISTEN (crystal rings, moss silent) + HIDE
 *              from the shrine pools; one slow Vesper.
 *   E3 TEN   — THE RESONANCE GAP : the Turn. Crystal has meant "do not step" —
 *              now the path is MADE of it and BLINK makes the forbidden floor
 *              the floor you cross. Two counter-sweeping Vespers.
 *   E4 KETSU — THE WICKSTONE     : take Hush's first relic, the memory flash,
 *              step into the rift (LORE Beat 1 payoff).
 *
 * SHOWCASE — MOONLIT RUIN CONTRAST: one strong directional moon, low in the
 * WNW (~25° elevation), rakes hard shadow blades east through the broken wall
 * skyline. Wall runs deliberately alternate surviving-facade height (~3) with
 * burnt-to-the-sill stubs (~1), so the lane the player walks alternates deep
 * facade shadow with moonlit breaches — legible hide/exposed lanes with the
 * moon's own logic, no invisible fills, readable with all extras off.
 *
 * Night is total and free here — the only level where ambient dark alone hides
 * you everywhere, on purpose. Geometry is kit.wall runs (overlapping joints,
 * piers on every corner — see PLACES.md geometry hygiene). Flat (embargo).
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
const TUNE = {
  // ---- ART PASS · MOONLIGHT (meter-safe relight) --------------------------------
  // The light meter reads ONLY moon.intensity + moon direction (main.js
  // _computePlayerVis / _collectLights). It NEVER reads the light's colour. So the
  // RENDER brightness of the moon (= colour × intensity) is decoupled from what
  // guards can detect: brighten the night by scaling moonHue up via moonBoost, and
  // the meter stays bit-identical. DO NOT change `moon` (intensity) or `moonFrom`
  // (direction) — either one moves the meter. Only moonBoost/moonHue are free.
  moon: 0.9,                                        // METER intensity — DO NOT CHANGE (feeds detection; keep ≥ 0.9 primer floor)
  moonHue: 0x8ea0cc,                                // moon colour hue (cool moon-blue)
  moonBoost: 2.7,                                   // RENDER-only brightness × on the hue — meter never sees colour, safe to raise
  moonFrom: [-26, 13, 9],                           // WNW, ~25° up → shadows ~2.1× wall height, raking east — DO NOT CHANGE (meter LOS)
  towerN: { intensity: 10, range: 9, scale: 1.7 },  // the shrine's great flame, SHRINE COURT
  towerS: { intensity: 6, range: 7 },               // the lesser walk-lamp
  vSound: { speed: 1.0, pause: 1.8, range: 8 },     // the keeper's man (pauses = tending each flame)
  vBlink: { speed: 1.1, pause: 1.0, range: 8 },     // the two tally-men (pauses = counting at the row-heads)
};

export function buildTutorial() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "ashway";
  bag.name = "THE ASHWAY";
  bag.spawn.set(-28, 0.42, 10);

  // ======================= GEOMETRY — the burnt row ==========================
  // All walls are kit.wall runs: boxes overshoot their endpoints th/2 so every
  // joint OVERLAPS, and each corner carries exactly ONE pier (from whichever
  // run "owns" it) — never two, which would put coincident cylinders in the
  // corner. Heights vary run to run: ~3 = surviving facade, ~1 = burnt to the
  // sill (still a collider — Hush is knee-high — but the moon pours over it).

  // --- THE ASH-PIT (x -32..-24, z 6..14) — the ash-carters' dumping ground;
  // --- where the row's dead lamps are tipped, and where Hush wakes. Unlit,
  // --- unwatched: the Vigil does not light or guard its own trash.
  kit.floor(8, 8, -28, 10);
  kit.surface(-32, 6, -24, 14, "moss");
  kit.wall(-32, 14, -24, 14, { h: 2.4 });                 // back wall of the pit (owns its corners)
  kit.wall(-32, 6, -32, 14, { h: 2.0, piers: false });    // west revetment (corners piered by neighbours)
  kit.wall(-24, 6, -24, 14, { h: 2.2, piers: false });    // east revetment
  kit.wall(-32, 6, -29, 6, { h: 2.8 });                   // street-side wall, west of the carters' cut
  kit.wall(-27, 6, -24, 6, { h: 2.8 });                   // street-side wall, east of the cut

  // --- THE CARTERS' CUT (x -29..-27, z 3..6) — the narrow ramp-cut the
  // --- ash-carters wheel their barrows down from the street to the pit.
  kit.floor(2, 3, -28, 4.5);
  kit.surface(-29, 3, -27, 6, "moss");
  kit.wall(-29, 3, -29, 6, { h: 2.6, piers: false });     // cut cheeks (jambs piered below/above)
  kit.wall(-27, 3, -27, 6, { h: 2.6, piers: false });

  // --- THE ASHWAY ITSELF (x -48..-8, z 0..3) — the burnt lamplighters' row.
  // --- Both ends imply more city: west, the street runs on into the citadel
  // --- (barred by the mist; the vista beyond is intact Vigil grandeur); east
  // --- it opens into the shrine court. The NORTH frontage is the showcase
  // --- caster: facade / stub / facade alternation throws the shadow blades.
  kit.floor(40, 3, -28, 1.5);
  kit.surface(-48, 0, -8, 3, "moss");
  // north frontage, west→east (heights = the ruin skyline the moon reads):
  kit.wall(-48, 3, -42, 3, { h: 3.0 });                   // surviving facade (beyond the mist)
  kit.wall(-42, 3, -38, 3, { h: 1.0, piers: false });     // burnt to the sill — a moonlit breach
  kit.wall(-38, 3, -34, 3, { h: 2.8 });                   // facade framing the mist line
  kit.wall(-34, 3, -29, 3, { h: 2.6, piers: false });     // scorched but standing
  kit.pier(-29, 3, 2.9);                                  // west jamb of the carters' cut
  kit.wall(-27, 3, -20, 3, { h: 3.2 });                   // the tallest survivor — deepest shadow on the lane
  kit.wall(-20, 3, -15, 3, { h: 1.1, piers: false });     // long burnt breach — the moon floods the lane here
  kit.wall(-15, 3, -8, 3, { h: 3.0 });                    // facade running to the court door
  // south frontage (the moon's far side — its own shadows fall away from the lane):
  kit.wall(-48, 0, -36, 0, { h: 2.8 });
  kit.wall(-36, 0, -24, 0, { h: 1.2, piers: false });     // collapsed stretch
  kit.wall(-24, 0, -8, 0, { h: 3.0 });
  kit.wall(-48, 0, -48, 3, { h: 3.0, piers: false });     // west cap — the street continues beyond it, unreachable
  // broken pier stumps of the old lamp-arcade — thin moon-blades across the lane
  kit.pier(-22, 0.55, 1.2, 0.24);
  kit.pier(-12.5, 2.45, 1.0, 0.24);
  const fogA = kit.fogWall(-34, 1.5, 2.6, { rot: Math.PI / 2, h: 3.0 }); // the barred west
  kit.fogPatch(-34, 0, -8, 3, { density: 0.04 });         // (volumetrics on: the blades become visible shafts)

  // --- THE SHRINE COURT (x -8..10, z -9..12) — the shrine-keeper's charge;
  // --- the ONE place the Vigil still lights on this street. The fire glassed
  // --- the court's paving into fused lamp-glass that rings underfoot (the
  // --- crystal centre); ash-moss has taken the unswept edges (the silent
  // --- border). His two flames are the only working lamps left on the row.
  kit.floor(18, 21, 1, 1.5);
  kit.surface(-8, -9, -5.5, 12, "moss");                  // ash-moss border (silent, dark, unswept)
  kit.surface(7.5, -9, 10, 12, "moss");
  kit.surface(-5.5, 9.5, 7.5, 12, "moss");
  kit.surface(-5.5, -9, 7.5, -6.5, "moss");
  kit.surface(-5.5, -6.5, 7.5, 9.5, "crystal");           // the fire-glassed court (loud — it sings)
  kit.wall(-8, -9, -8, 0, { h: 2.8, piers: false });      // west wall, south of the street door
  kit.wall(-8, 3, -8, 12, { h: 2.8, piers: false });      // west wall, north of it
  kit.wall(-8, 12, -2, 12, { h: 3.2 });                   // north wall
  kit.wall(-2, 12, 4, 12, { h: 3.4, piers: false });      // the shrine's back wall (tallest — it was re-mortared)
  kit.wall(4, 12, 10, 12, { h: 3.0 });
  kit.wall(-8, -9, -4, -9, { h: 2.9 });                   // south wall, west of the collapsed side-lane
  kit.wall(-4, -9, -1, -9, { h: 0.55, piers: false });    // the collapse itself — a rubble sill you can see over, not cross
  kit.wall(-1, -9, 10, -9, { h: 3.1 });                   // south wall, east of it
  kit.wall(10, 3, 10, 12, { h: 2.7, piers: false });      // east wall, north of the tally walk
  kit.wall(10, -9, 10, 0, { h: 2.7, piers: false });      // east wall, south of it

  // the collapsed SIDE-LANE beyond the sill (unreachable) — more city, going on
  // without you: a burnt facade and one more dead street-lamp down the lane.
  kit.floor(3.4, 5, -2.5, -11.5);
  kit.wall(-4, -13.5, -4, -9, { h: 2.2, piers: false });  // lane cheeks
  kit.wall(-1, -13.5, -1, -9, { h: 2.2, piers: false });
  kit.wall(-4, -13.5, -1, -13.5, { h: 2.6 });             // the facade across the lane's end
  kit.deadLantern(-2.5, -11.6, { seed: 61 });
  kit.rubble(-3.3, -8.8, { radius: 0.8, seed: 62 });      // the fall, spilling over the sill
  kit.rubble(-1.5, -9.2, { radius: 0.7, seed: 63 });

  // --- THE TALLY WALK (x 10..16, z 0..3) — the salvage-master's counting
  // --- passage: the one unburnt throat between court and yard, where every
  // --- load is tallied on its way out. Kept bare — loads pass through it.
  kit.floor(6, 3, 13, 1.5);
  kit.surface(10, 0, 16, 3, "moss");
  kit.wall(10, 3, 16, 3, { h: 2.9 });
  kit.wall(10, 0, 16, 0, { h: 2.9 });

  // --- THE SALVAGE YARD (x 16..34, z -9..12) — the salvage-master's floor.
  // --- The pried fire-glass is laid out in two long ROWS (the crystal bands)
  // --- to be crated; the bare scorched strips between them are the tally-men's
  // --- walking lines. Deepest room on the route; the Wickstone waits here.
  kit.floor(18, 21, 25, 1.5);
  kit.surface(16, -9, 21, 12, "moss");                    // west strip (scorched earth, silent)
  kit.surface(21, -9, 24, 12, "crystal");                 // laid glass, row one (loud — leap it)
  kit.surface(24, -9, 27, 12, "moss");                    // the centre strip — the tally plinth's island
  kit.surface(27, -9, 30, 12, "crystal");                 // laid glass, row two
  kit.surface(30, -9, 34, 12, "moss");                    // east strip, against the gate wall
  kit.wall(16, 3, 16, 12, { h: 2.6, piers: false });      // west wall, north of the tally walk
  kit.wall(16, -9, 16, 0, { h: 2.6, piers: false });      // west wall, south of it
  kit.wall(16, 12, 23, 12, { h: 3.0 });                   // north wall
  kit.wall(23, 12, 28, 12, { h: 1.0, piers: false });     // burnt breach behind the centre strip — the moon finds the Wickstone through it
  kit.wall(28, 12, 34, 12, { h: 3.2 });
  kit.wall(16, -9, 25, -9, { h: 2.8 });                   // south wall
  kit.wall(25, -9, 30, -9, { h: 1.1, piers: false });     // collapsed stretch (skyline only — the moon is northerly)
  kit.wall(30, -9, 34, -9, { h: 3.0 });
  kit.wall(34, 3, 34, 12, { h: 2.7, piers: false });      // east wall, north of the carters' gate
  kit.wall(34, -9, 34, 0, { h: 2.7, piers: false });      // east wall, south of it
  kit.pier(17.15, -5.6, 1.15, 0.24);                      // stump of the yard's old lamp-arcade
  kit.fogPatch(16, -9, 34, 12, { density: 0.02 });

  // --- THE CARTERS' GATE (x 34..38, z 0..3) — the loading gap where the
  // --- street's salvage leaves for Lanternspire. Its gate-lamps burned with
  // --- the row; tonight the rift stands in the gateway instead.
  kit.floor(4, 3, 36, 1.5);
  kit.surface(34, 0, 38, 3, "moss");
  kit.wall(34, 3, 38, 3, { h: 2.9 });
  kit.wall(34, 0, 38, 0, { h: 2.9 });
  kit.wall(38, 0, 38, 3, { h: 3.1, piers: false });       // the gate's east arch (capped — the road beyond is the rift's)
  kit.extraction(36, 1.5);

  // the shrine's two flames (SHRINE COURT) — the keeper's whole job, and the
  // only working lamps on the street. Visible fixtures, real PointLights.
  const towerN = kit.torch(1, 7, TUNE.towerN);   // the great flame, at the shrine
  const towerS = kit.torch(1, -2, TUNE.towerS);  // the lesser walk-lamp on his round

  // THE NIGHT SHIFT (Law of the Watch — posts are jobs):
  kit.guard([[1, -5], [1, 8]], TUNE.vSound);     // the keeper's man: walks flame to flame, pauses to tend each wick
  kit.guard([[19, -7], [19, 10]], TUNE.vBlink);  // west tally-man: paces his glass row, counts at the row-heads
  kit.guard([[31, 10], [31, -7]], TUNE.vBlink);  // east tally-man: same round, walked the opposite way

  // ================= E1 · KI — "WAKING IN THE ASH" ============================
  // The lamp-midden: the tipped heap of snuffed lamps Hush wakes from — under
  // the pit's west wall, in the one wedge of full moon-shadow. Crawling out of
  // the heap means crawling toward the moonlit half of the pit: the first
  // image IS the lesson (dark hides, light shows).
  {
    const clear = [
      { x: -28, z: 10, r: 2.4 },                          // spawn
      { x0: -29, z0: 3, x1: -27, z1: 14, pad: 0.4 },      // the carters' cut lane
      { x0: -34, z0: 0.9, x1: -8, z1: 2.1, pad: 0.2 },    // the east walking strip
    ];
    lampMidden(kit, -30.5, 8.4, { backDir: Math.atan2(-1, 1), count: 5, footprint: 1.3, clear, seed: 3 });
    kit.cart(-25.4, 7.2, { rot: 2.5, seed: 2 });          // TABLEAU 1: the ash-cart, tipped mid-dump and left
    kit.sack(-24.9, 8.4, { seed: 4 });                    //   …its load half-spilled beside it
    kit.cluster(-25.2, 12.8, [{ prop: "deadLantern", w: 2 }, { prop: "rubble", w: 2 }], {
      count: 3, footprint: 1.0, backDir: Math.atan2(1, 1), clear, seed: 6, // an older tip against the back wall
    });
    // the barred vista beyond the mist (x -48..-34, unreachable) — the street
    // running on into intact Vigil grandeur: the citadel goes on without you.
    barredVista(kit, -42, 1.5, { clear: [], seed: 11 });
    kit.cart(-44, 2.3, { rot: -0.5, seed: 13 });
    kit.deadLantern(-46.6, 1.5, { seed: 16 });
    kit.chains(-33.6, 2.55, { y: 2.6, len: 1.1, seed: 8 }); // torn lamp-chain off the facade by the mist line
    // the row's own dead street-lamps, pacing the lane east — the discard
    // route reads as a street BECAUSE its lamps still stand, all snuffed
    kit.leadingLine(-33.5, 1.5, -9.5, 1.5, [{ prop: "urn", w: 2 }, "deadLantern"], {
      spacing: 5.5, offset: 1.05, face: "in", seed: 9,
      clear: [{ x0: -29, z0: 2, x1: -27, z1: 3, pad: 0.3 }],   // keep the cut's mouth clear
    });
    // TABLEAU 2: stripped fittings crated against the tall facade, staged for
    // the morning cart — the salvage operation, seen before it is explained.
    kit.wallRun(-23, 2.6, -17.5, 2.6, [{ prop: "crateStack", w: 2, foot: 0.78 }, "sack"], {
      spacing: 2.6, inset: 0, face: "wall", seed: 18,
      clear: [{ x0: -34, z0: 0.9, x1: -8, z1: 2.1, pad: 0.2 }],
    });
  }

  // ================= E2 · SHŌ — "THE SOUND FLOOR" ============================
  // The shrine court. The two flames mark what the Vigil still values (Law of
  // Light); the urn-flanked shrine says the enemy is PIOUS, and doubles as the
  // gameplay tell — lit, tended, central = do not stand here. Cover sits only
  // on the dark unswept borders, where a keeper would shove what he salvaged.
  {
    const clear = [
      { x0: 0, z0: -9, x1: 2, z1: 12, pad: 0.4 },         // the keeper's man's line, x≈1
      { x0: -5.5, z0: -6.5, x1: 7.5, z1: 9.5, pad: 0.2 }, // keep the glassed floor open/loud
      { x0: -1.5, z0: 9.5, x1: 1.5, z1: 12 },             // north edge lane
    ];
    // urns flank each flame EAST–WEST (dir π/2): a z-separated pair (the default
    // dir:0) falls straight down the keeper's-man patrol band {x0:0,x1:2} and
    // every urn nudges along z INSIDE the band → all four discarded. Separating
    // on x lands them at x≈3 and x≈-1, clear of the band. Urns are non-blocking
    // decor and the shrine BELONGS on its lit glass, so the pair rides the
    // crystal — kept off the patrol band + north lane only, not the loud floor.
    const shrineClear = [
      { x0: 0, z0: -9, x1: 2, z1: 12, pad: 0.4 },        // the keeper's man's line, x≈1
      { x0: -1.5, z0: 9.5, x1: 1.5, z1: 12 },            // north edge lane
    ];
    vigilShrine(kit, 1, 7, { gap: 2.0, urnScale: 0.9, dir: Math.PI / 2, clear: shrineClear, seed: 27 });    // the shrine, urn-flanked and swept
    vigilShrine(kit, 1, -2, { gap: 2.0, urnScale: 0.85, dir: Math.PI / 2, clear: shrineClear, seed: 29 });  // the walk-lamp's lesser pair
    kit.banner(1, 2.4, 11.75, Math.PI, { w: 1.2, color: 0xffb46a, seed: 31 }); // fresh amber cloth on the re-mortared wall
    // TABLEAU 3: the keeper's seat — a crate, his supper sack, his cold hand
    // brazier — beside the great flame, on the dark border where he rests
    // between rounds. He stepped away an hour ago.
    kit.crate(-5.6, 10.3, { rot: 0.12, seed: 33 });
    kit.sack(-5.5, 11.1, { r: 0.32, seed: 34 });
    kit.brazier(-4.5, 10.5, { lit: false, seed: 35 });
    // salvage the keeper dragged off his floor, heaped in the corners (cover
    // exactly where the silent border wants it):
    kit.corner({ x0: -8, z0: -9, x1: 10, z1: 12 }, "sw",
      [{ prop: "crateStack", w: 2, foot: 0.8 }, "barrel", "sack"], { count: 4, clear, seed: 21 });
    kit.corner({ x0: -8, z0: -9, x1: 10, z1: 12 }, "ne",
      ["brokenColumn", { prop: "rubble", w: 2 }], { count: 3, clear, seed: 22 });
  }

  // ================= E3 · TEN — "THE RESONANCE GAP" (+ the WICKSTONE) =========
  // The Turn. The yard's two rows of laid fire-glass wall the path — no silent
  // way around, only OVER: blink from strip to strip. The crated Wickstone
  // stands on the salvage-master's tally plinth on the centre strip (canon:
  // between the bands, not on the exit), moonlit through the burnt breach
  // behind it. Its glow is dimmed so the strip stays a viable dark step.
  const wick = kit.scepterPedestal(25.5, 6);          // the tally plinth, off the z0..3 lane
  wick.core.material.emissive.set(0xffd76a);
  wick.light.intensity = 1.2; wick.light.distance = 4; // a faint relic glow, not a detection pool
  {
    const clear = [
      { x0: 16, z0: 0, x1: 34, z1: 3, pad: 0.4 },         // the z0..3 landing lane
      { x0: 18, z0: -9, x1: 20, z1: 12, pad: 0.4 },       // west tally-man's line, x≈19
      { x0: 30, z0: -9, x1: 32, z1: 12, pad: 0.4 },       // east tally-man's line, x≈31
      { x0: 21, z0: -9, x1: 24, z1: 12 },                 // glass row one — keep clear (leap it)
      { x0: 27, z0: -9, x1: 30, z1: 12 },                 // glass row two — keep clear
      { x: 25.5, z: 6, r: 1.1 },                          // keep dressing off the plinth
    ];
    kit.flank(25.5, 6, { prop: "urn", opts: { scale: 0.8 } }, { gap: 1.4, dir: 0, face: "in", clear, seed: 45 }); // the master's counting urns frame the crate
    kit.statue(25.5, 11, { scale: 0.9, h: 2.4, seed: 41 });        // a pried-out shrine statue, staged for haulage — the blink's landmark
    kit.rubble(25.5, -7.2, { radius: 0.9, seed: 42 });             // spill at a row's lip
    // TABLEAU 4a: the day crew's corner — brazier long cold, supper crate
    // still waiting for a shift that never came back.
    kit.brazier(17.4, 10.6, { lit: false, seed: 43 });
    kit.crate(16.95, 9.3, { size: 0.8, rot: 0.1, seed: 46 });
    kit.sack(16.9, 8.4, { r: 0.34, seed: 47 });
    kit.brazier(32.6, -7.6, { lit: false, seed: 44 });            // its twin at the far row-head, also cold
    // crates of counted glass staged along the gate wall, gapped at the lane:
    kit.wallRun(33.4, -6.5, 33.4, 10.5, [{ prop: "crate", w: 2 }, "barrel", "sack"], {
      spacing: 1.8, inset: 0, face: "wall", seed: 48, clear,
    });
    // TABLEAU 4b: the half-loaded cart standing at the carters' gate — the
    // last load of the day, half-lashed, abandoned at the shift bell.
    kit.cart(33.0, 4.6, { rot: 0.08, seed: 49 });
    kit.crateStack(33.2, 6.3, { seed: 50 });
  }

  // ================= E4 · KETSU — "THE GATE OF DEAD LAMPS" ====================
  // The rift stands in the carters' gateway, framed by the gate's own two dead
  // lamps — you leave the graveyard of lights through its own gate.
  kit.deadLantern(35.0, 0.35, { seed: 51 });
  kit.deadLantern(35.2, 2.75, { seed: 52 });
  kit.inscription(37.75, 2.0, 1.5, "THE ASH REMEMBERS WHAT THE FLAME FORGOT", -Math.PI / 2, "#ffb46a");

  // ================= the moon (the showcase key light) ========================
  // Low WNW moon: every surviving facade throws a hard blade ~2.1× its height
  // east-southeast. The composition it plays against: the pit's west wall
  // shadows the spawn heap; the street's north frontage alternates blade and
  // breach down the whole lane; the court and yard west walls darken their
  // silent moss borders; the burnt breach at the yard's back lets one blade of
  // moonlight fall on the Wickstone. No invisible fills — the two shrine
  // flames are the only other lights, and both have fixtures.
  // colour carries the render boost; intensity (what the meter reads) stays TUNE.moon
  const moonColor = new THREE.Color(TUNE.moonHue).multiplyScalar(TUNE.moonBoost);
  const moon = new THREE.DirectionalLight(moonColor, TUNE.moon);
  moon.position.set(...TUNE.moonFrom);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);

  // ================= checkpoints ==============================================
  kit.checkpoint(-28, 10, 3);
  kit.checkpoint(-10, 1.5, 2);
  kit.checkpoint(13, 1.5, 2, 13, 1.5);

  // ================= triggers / four-beat teaching ============================
  kit.trigger("moved", -28, 6, 2.4);
  kit.trigger("fogWall", -32, 1.5, 2.6);
  kit.trigger("soundRoom", -6, 1.5, 2.6);    // E2 entry — LISTEN
  kit.trigger("towerHide", 1, 2, 3.0);       // E2 near the pools — HIDE from light
  kit.trigger("blinkRoom", 17, 1.5, 2.6);    // E3 — the Turn (+ the Wickstone on the centre strip)

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

  // Taking the Wickstone (walking up to the plinth) fires this — no threats to
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
