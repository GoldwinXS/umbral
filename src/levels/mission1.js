import * as THREE from "three";
import { makeKit } from "../levelKit.js";
import { workRank } from "./_dressing.js";

/**
 * MISSION 4 — BRIGHTWARD GATE  (level index 3) — THE EXAM, and the last base word.
 *
 * ============================== SITE DOSSIER =================================
 * WHAT: Brightward Gate — the garrison gatehouse district on Lanternspire's
 *   processional road: the fortified door the Noonstaff leaves by when the
 *   Vigil parades it at noon, and the home of the soldiery that marches at its
 *   side. Outer gate (barred for the night), muster yard, gate throat, parade
 *   square, the armory walk under the east curtain wall, barracks row with its
 *   unhealed west breach, and — deepest — the Hall of Colors, where the staff
 *   stands between parades the way any garrison keeps its colors.
 * WHO: the GATE-CAPTAIN (keeps the gate and the rolls; his lodging overlooks
 *   the muster yard); the DRILL-SERJEANT (owns the parade stone — drills the
 *   companies by planted torchlight, because the gate's own walls steal the
 *   morning sun from the square); the ARMORER (keeps the arms chests and the
 *   whetting trough under the curtain wall); the COLORS WARD (the honor post —
 *   polishes the staff nightly and never leaves the hall); the WICK-BOYS
 *   (plant, light, and trim the torch standards, rank by straight rank).
 * PARTI: processional road → outer gate → muster yard → gate throat → parade
 *   square → flanks: armory walk (east) | barracks row (west, the breach) →
 *   colors porch → THE HALL OF COLORS. Provisions stop at the yard; soldiers
 *   flow yard → square → walls; nothing but honor passes the porch. The relic
 *   sits deepest, behind gate, square, watch, and honor guard in that order.
 * WHY THE RELIC IS HERE: the NOONSTAFF — the scepter the Vigil parades to
 *   prove the dark is beaten — is a STANDARD, and a standard lives with its
 *   garrison. Between parades it stands on the colors plinth at the district's
 *   deepest point, under the door-flame and its two watch-lanterns, inside the
 *   colors ward's boxed round: the Vigil lights and guards what it values,
 *   and it values proof most of all.
 * TABLEAUX: (1) a provisioner's wagon halted overnight in the muster-yard
 *   queue, sacks still lashed — the gate barred before it reached the arch;
 *   (2) the whetting trough left mid-edge on the armory walk — blade-chest
 *   open beside the stone, the armorer's pan banked cold; (3) the bedroll rank
 *   in barracks row squared to a string-line, one late supper abandoned on the
 *   mess barrel beside it; (4) the spent torch-standards racked along the
 *   square's west verge — the burning ranks on the stone were planted by hand,
 *   and these are that hand's leavings.
 * THE NIGHT SHIFT: the OUT-WARD paces the gate front in the muster yard,
 *   facing the barred road — a gate guard watches the way a gate opens; his
 *   pauses are the toll desk (east) and the queue rail (west). The WALL-WARD
 *   walks the armory lane under the curtain, pausing at the tower door (north)
 *   and the wicket (south). The BREACH-BLIND — a Snuffed — keeps barracks row:
 *   the one sentinel that carries no flame and wakes no sleeper, walking the
 *   cot lane by ear; the Vigil hangs a single warning-lamp by the breach so no
 *   soldier walks into the void half-asleep. The SQUARE-SERJEANT crosses the
 *   parade stone between the torch ranks, verge to verge. The PORCH-WARD keeps
 *   the short beat between the colors porch and the square. The COLORS WARD
 *   boxes the staff, corner to corner, and never leaves the hall.
 * =============================================================================
 *
 * The first DAYLIGHT level, and the capstone of the flat arc — every verb from
 * M1–3 re-asked, plus the one new word (per docs/REDESIGN_1-4.md, MISSION 4):
 *   E1 KI    — FULL DAYLIGHT     : the sunlit muster yard, three ways on
 *              (gate / east wicket / west wicket).
 *   E2 SHŌ   — THE FLANKS        : armory shade-walk (SNEAK/WAIT past the
 *              wall-ward), barracks row (LISTEN past the Blind, BLINK the
 *              breach) — every old verb re-asked.
 *   E3 SHŌ   — THE THROWN SOUND  : NEW. LURE taught at the shadeless wicket —
 *              the M2 vial-throw re-read as bait, not a douse.
 *   E4 TEN   — THE PARADE STONE  : the Turn. The crossing is lit by a GRID of
 *              torch ranks and walked by the serjeant; you cannot douse the
 *              sky, and two vials cannot douse eight standards — LURE the
 *              watcher off the stone, or carve one dark seam and slip it.
 *   E5 TEN   — THE HALL OF COLORS: indoors, DOUSE works again; the full
 *              sentence spoken once; walk up to the Noonstaff and it is yours.
 *   E6 KETSU — THE NOONSTAFF, FLEEING: the garrison wakes, the alarm cressets
 *              flare, the relic's glow rides your back — run the shade lanes
 *              in reverse to the rift before the barred gate.
 *
 * SHOWCASE — MASSED TORCHLIGHT ON PARADE STONE: at this low sun the square
 * lies all morning in its own gate-wall's shadow (h8 walls vs a ~21° sun), so
 * the garrison drills by planted flame — EIGHT torch standards in two dressed
 * ranks of four flank the pale ringing parade stone, every one a fixtured,
 * douseable kit.torch. Their warm pools tile the stone and overlap; anything
 * standing among them — the cistern, the honor steles, the serjeant, you —
 * throws several soft, criss-crossed shadows (stochastic light sampling; each
 * light carries rtRadius). It reads with reflections AND volumetrics OFF as
 * overlapping pools with honest dark seams; and because the sun is LOS-gated
 * by the wall, every douse blows a hole of TRUE dark in the grid — the Law of
 * Light holds: the ranks exist because soldiers plant torches in rows, and
 * each hole Hush carves reads as a wound in the garrison's order. Budget: 12
 * fixtured lights vs the shipped 5 fixtures + 1 invisible fill (removed — an
 * illegal fill per the Law of Light); same order of magnitude, under 2x, with
 * the parade standards kept small so the massed read comes from ARRANGEMENT.
 *
 * FLAT by law (verticality embargo M1–4): the fork is left/centre/right on one
 * plane; the west breach `hole` is a horizontal BLINK, never a tier. Palette
 * law: amber/orange/red = Vigil; VIOLET = Hush only (the breach rim, the
 * vials, one Hush line at the breach). Geometry is kit.wall runs — overlapped
 * joints, one pier per corner (PLACES.md geometry hygiene).
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
// All guard, cache, mote, and vial numbers [KEPT] from the shipped level —
// the architecture moved, the difficulty did not.
const TUNE = {
  sun:  { color: 0xffdca8, intensity: 2.6, pos: [-30, 14, 20] }, // low WSW day sun, elev ≈21° [KEPT]
  sky:  { color: 0x25324a, intensity: 0.4 },                     // visual-only sky fill (AmbientLight — not read by the light meter) [KEPT]
  vGate:    { speed: 1.3, pause: 1.3 },                // E1 · the out-ward (pauses = toll desk / queue rail)      [KEPT]
  vBastion: { speed: 1.3, pause: 1.4, range: 11 },     // E2 · the wall-ward (pauses = tower door / wicket)        [KEPT]
  sFlank:   { speed: 1.0, pause: 2.0, blind: true },   // E2 · the BREACH-BLIND (Snuffed — flameless, ear only)    [KEPT]
  vCross:   { speed: 1.4, pause: 1.0 },                // E4 · the square-serjeant (crosses the torch-lit stone)   [KEPT]
  vHedge:   { speed: 1.2, pause: 1.5 },                // E4 · the porch-ward (porch door ↔ square beat)           [KEPT]
  vKeep:    { speed: 1.3, pause: 1.1 },                // E5 · the colors ward (boxes the staff)                   [KEPT]
  paradeTorch:  { intensity: 5, range: 7, h: 2.5 },    // one planted standard (×8 — the ranks; small on purpose)
  greatLantern: { intensity: 14, range: 12, scale: 1.8 }, // the hall's door-flame (E5 — dousable again)           [KEPT 14/12]
  keepLantern:  { intensity: 13, range: 11 },          // the staff's two watch-lanterns                           [KEPT 13/11]
  breachLamp:   { intensity: 5, range: 7, color: 0xffc07a }, // the breach warning-lamp (amber — palette law)      [KEPT 5/7]
  beaconMul: 1.3,                                      // guard speed × on the theft                               [KEPT]
  cloth: 0xffb46a,                                     // Vigil banner amber
};

export function buildMission1() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x243044); // muted daylight — dim, not bright [KEPT]
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "citadel";
  bag.name = "BRIGHTWARD GATE";
  bag.spawn.set(-9, 0.42, 26);                  // in the watch tower's long shade [KEPT]
  bag.bounds = { x0: -34, z0: -36, x1: 34, z1: 30 }; // [KEPT]

  // ======================= GEOMETRY — the gate district =======================
  //
  //        BARRACKS ROW  --w wicket--  MUSTER YARD  --e wicket--  ARMORY WALK
  //        (x-34..-20)                 (x-16..16,      (x20..34)
  //        h6, moss                     z6..30) moss    h9, obsidian
  //             \                          |                /
  //          [BREACH]                 gate throat        wicket 2
  //          (the hole)                    |                /
  //              \------------  PARADE SQUARE  ------------/
  //                     (x-16..16, z-15..1) h8, moss/crystal/moss
  //                                        |
  //                                  colors porch
  //                                        |
  //                                 HALL OF COLORS
  //                             (x-12..12, z-36..-20) h10, crystal
  //
  // All walls are kit.wall runs: boxes overshoot their endpoints th/2 so every
  // joint OVERLAPS, and each corner carries exactly ONE pier — from whichever
  // run owns it, or an explicit kit.pier. piers:false marks runs whose ends a
  // neighbour already caps. Footprints, doors, and the breach [KEPT] verbatim.

  // --- THE MUSTER YARD (x -16..16, z 6..30) — the gate-captain's outer ward:
  // --- where wagons queue for inspection and companies form up before the
  // --- march. Low walls, so the low sun floods it — the district's one truly
  // --- SUNLIT floor, and the first daytime read. The rift stands before the
  // --- barred outer gate: Hush's door, in front of the Vigil's.
  kit.floor(32, 24, 0, 18);
  kit.surface(-16, 6, 16, 30, "moss");
  kit.wall(-16, 30, 16, 30, { h: 5.2 });                  // the outer wall + barred gate (owns its corners)
  kit.pier(-2.6, 30, 5.8, 0.5);                           // the gate arch's own two piers
  kit.pier(2.6, 30, 5.8, 0.5);
  kit.solid(1.9, 4.6, 0.28, -1.02, 29.5, kit.mats.dark);  // the barred gate leaves — shut for the night
  kit.solid(1.9, 4.6, 0.28, 1.02, 29.48, kit.mats.dark);
  kit.wall(-16, 6, -2, 6, { h: 4.5 });                    // inner wall, west of the gate throat (owns (-16,6),(-2,6))
  kit.wall(2, 6, 16, 6, { h: 4.5 });                      // inner wall, east of it
  kit.wall(-16, 6, -16, 16, { h: 4.5, piers: false });    // west wall, south of the barracks wicket
  kit.wall(-16, 20, -16, 30, { h: 4.5, piers: false });   // west wall, north of it
  kit.wall(16, 6, 16, 16, { h: 4.5, piers: false });      // east wall, south of the armory wicket
  kit.wall(16, 20, 16, 30, { h: 4.5, piers: false });     // east wall, north of it
  kit.pillar(1.3, 10, -13, 29, kit.mats.pillar);          // the SW watch tower — its long shade covers the spawn [KEPT]

  // --- THE GATE THROAT (x -2..2, z 1..6) — the gatehouse passage itself:
  // --- thick-walled, kept bare (columns march through it four abreast). The
  // --- portcullis tackle hangs idle overhead.
  kit.floor(4, 5, 0, 3.5);
  kit.surface(-2, 1, 2, 6, "moss");
  kit.wall(-2, 1, -2, 6, { h: 5, th: 0.5, piers: false }); // throat cheeks (jambs piered by the yard + square walls)
  kit.wall(2, 1, 2, 6, { h: 5, th: 0.5, piers: false });
  kit.chains(-1.45, 5.3, { y: 4.4, len: 1.2, seed: 8 });  // portcullis chains, wound up for the night
  kit.chains(1.5, 5.35, { y: 4.4, len: 1.0, seed: 9 });

  // --- THE PARADE SQUARE (x -16..16, z -15..1) — the drill-serjeant's floor,
  // --- and the showcase. Its h8 walls steal the morning sun (the low WSW sun
  // --- clears none of them), so drill happens by PLANTED FLAME: the pale
  // --- parade stone (crystal — it rings under boots, which is how a serjeant
  // --- likes it) runs down the centre, flanked by two dressed ranks of torch
  // --- standards; the trodden verges under the walls stay silent moss. The
  // --- honor steles and the cistern stand among the pools and catch their
  // --- criss-crossed shadows.
  kit.floor(32, 16, 0, -7);
  kit.surface(-16, -15, -5, 1, "moss");                   // west verge — the squads' form-up lane (silent, dark)
  kit.surface(-5, -15, 5, 1, "crystal");                  // THE PARADE STONE — pale, ringing, torch-tiled
  kit.surface(5, -15, 16, 1, "moss");                     // east verge
  kit.wall(-16, 1, -2, 1, { h: 8 });                      // north wall, west of the throat (owns (-16,1),(-2,1))
  kit.wall(2, 1, 16, 1, { h: 8 });                        // north wall, east of it
  kit.wall(-16, -15, -2, -15, { h: 8 });                  // south wall, west of the colors porch
  kit.wall(2, -15, 16, -15, { h: 8 });                    // south wall, east of it
  kit.wall(-16, -15, -16, -8, { h: 8, piers: false });    // west wall, south of the breach mouth
  kit.wall(-16, -4, -16, 1, { h: 8, piers: false });      // west wall, north of it
  kit.wall(16, -15, 16, -8, { h: 8, piers: false });      // east wall, south of the inner wicket
  kit.wall(16, -4, 16, 1, { h: 8, piers: false });        // east wall, north of it
  kit.solid(1.6, 9, 1.6, -8, -3, kit.mats.pillar, 0.2);   // honor stele, west — battle-honors read at muster [KEPT]
  kit.solid(1.8, 7, 1.8, -3, -10, kit.mats.pillar, -0.15);// honor stele, south [KEPT]
  kit.pillar(1.5, 1.3, 0, -7, kit.mats.pillar);           // the garrison cistern — the square's low central cover [KEPT]
  kit.fogPatch(-16, -15, 16, 1, { density: 0.02 });       // (volumetrics on: each pool gets its halo)

  // --- THE WICKETS EAST (x 16..20) — the two watched doors between yard/square
  // --- and the armory walk. Obsidian underfoot — soldiers' boots, not moss.
  kit.floor(4, 4, 18, 18);
  kit.surface(16, 16, 20, 20, "obsidian");
  kit.wall(16, 20, 20, 20, { h: 6 });                     // outer wicket (owns all four jambs)
  kit.wall(16, 16, 20, 16, { h: 6 });
  kit.floor(4, 4, 18, -6);
  kit.surface(16, -8, 20, -4, "obsidian");
  kit.wall(16, -4, 20, -4, { h: 8 });                     // inner wicket — E3's pinch (owns its jambs)
  kit.wall(16, -8, 20, -8, { h: 8 });

  // --- THE ARMORY WALK (x 20..34, z -12..22) — the armorer's lane under the
  // --- great east curtain wall (the district's outer face — h9, blank, the
  // --- forgiving cliff of shade). Arms chests rank along the curtain; the
  // --- whetting trough sits mid-walk; the two tower doors are barred stumps.
  // --- No lamp: the wall-ward walks it by the light of the sky he watches.
  kit.floor(14, 34, 27, 5);
  kit.surface(20, -12, 34, 22, "obsidian");
  kit.wall(20, 22, 34, 22, { h: 9 });                     // north wall (owns (20,22),(34,22))
  kit.wall(20, -12, 34, -12, { h: 9 });                   // south wall (owns (20,-12),(34,-12))
  kit.wall(34, -12, 34, 22, { h: 9, piers: false });      // THE CURTAIN WALL — the world-edge
  kit.pier(34, 5, 9.4, 0.5);                              // its mid-run pier
  kit.wall(20, -12, 20, -8, { h: 9, piers: false });      // inner wall, south of the inner wicket
  kit.wall(20, -4, 20, 16, { h: 9, piers: false });       // inner wall, between the wickets
  kit.wall(20, 20, 20, 22, { h: 9, piers: false });       // inner wall, north of the outer wicket
  kit.pillar(1.4, 10, 30, -6, kit.mats.pillar);           // south tower base (door barred) [KEPT]
  kit.pillar(1.3, 8, 32, 10, kit.mats.pillar);            // north tower base [KEPT]

  // --- THE WICKET WEST (x -20..-16, z 16..20) — yard to barracks row.
  kit.floor(4, 4, -18, 18);
  kit.surface(-20, 16, -16, 20, "moss");
  kit.wall(-20, 20, -16, 20, { h: 5 });                   // (owns all four jambs)
  kit.wall(-20, 16, -16, 16, { h: 5 });

  // --- BARRACKS ROW (x -34..-20, z -12..22) — the soldiery's sleeping quarter:
  // --- bedrolls stowed to a string-line, the mess corner, the repair stone
  // --- nobody ever laid. At its south end, THE BREACH: a stretch of the west
  // --- range that fell into the void a season ago and was never healed — the
  // --- Vigil bricked nothing, posted the one sentinel that needs no light,
  // --- and hung a warning-lamp so no sleeper walks off the edge.
  kit.floor(14, 34, -27, 5);
  kit.surface(-34, -12, -20, 22, "moss");
  kit.wall(-34, 22, -20, 22, { h: 6 });                   // north wall (owns (-34,22),(-20,22))
  kit.wall(-34, -12, -20, -12, { h: 6 });                 // south wall (owns (-34,-12),(-20,-12))
  kit.wall(-34, -12, -34, 22, { h: 6, piers: false });    // west range wall
  kit.pier(-34, 5, 6.4, 0.42);                            // its mid-run pier
  kit.wall(-20, -12, -20, -8, { h: 6, piers: false });    // east wall, south of the breach
  kit.wall(-20, -4, -20, 16, { h: 6, piers: false });     // east wall, breach to wicket
  kit.wall(-20, 20, -20, 22, { h: 6, piers: false });     // east wall, north of the wicket

  // --- THE BREACH (x -20..-16, z -8..-4) — a real void gap where the passage
  // --- to the square once ran: BLINK across (horizontal — the verticality
  // --- embargo holds; this gap is M5's sunken-canal seed). kit.hole builds no
  // --- walls; the two cap runs close the channel's sides. [KEPT]
  kit.hole(-20, -8, -16, -4);
  kit.wall(-20, -8, -16, -8, { h: 6.5 });                 // south cap (owns (-20,-8),(-16,-8))
  kit.wall(-20, -4, -16, -4, { h: 6.5 });                 // north cap (owns (-20,-4),(-16,-4))

  // --- THE COLORS PORCH (x -2..2, z -20..-15) — the honor throat: nothing but
  // --- the staff and its escort ever passes. Kept bare and swept.
  kit.floor(4, 5, 0, -17.5);
  kit.surface(-2, -20, 2, -15, "moss");
  kit.wall(-2, -20, -2, -15, { h: 9, piers: false });     // porch cheeks (jambs piered by square + hall walls)
  kit.wall(2, -20, 2, -15, { h: 9, piers: false });

  // --- THE HALL OF COLORS (x -12..12, z -36..-20) — the garrison's shrine to
  // --- its own proof: a tall crystal-floored hall, the muster columns in two
  // --- rows, the Noonstaff on the colors plinth at the deep end. The door-
  // --- flame floods the entrance (the one lamp a thief must pass); the watch
  // --- pair burns beside the staff. The colors ward walks his box and never
  // --- leaves. Indoors, out of the sun — DOUSE works again here.
  kit.floor(24, 16, 0, -28);
  kit.surface(-12, -36, 12, -20, "crystal");
  kit.wall(-12, -20, -2, -20, { h: 10 });                 // north wall, west of the porch (owns (-12,-20),(-2,-20))
  kit.wall(2, -20, 12, -20, { h: 10 });                   // north wall, east of it
  kit.wall(-12, -36, 12, -36, { h: 10 });                 // south wall (owns its corners)
  kit.wall(-12, -36, -12, -20, { h: 10, piers: false });  // west wall
  kit.wall(12, -36, 12, -20, { h: 10, piers: false });    // east wall
  for (const zz of [-24, -28, -32]) {                     // the muster columns [KEPT rows]
    kit.pillar(0.6, 4.5, -6.5, zz);
    kit.pillar(0.6, 4.5, 6.5, zz);
  }

  // ================= THE DISTRICT'S LAMPS (every one owned + fixtured) ========
  // THE TORCH RANKS — the showcase. Two dressed ranks of four standards flank
  // the parade stone, planted by the wick-boys for the pre-dawn drill. Every
  // one is a douseable kit.torch: the grid of pools IS the E4 crossing, and
  // each douse carves a hole of true dark into the garrison's order.
  for (const rx of [-4.4, 4.4])
    for (const rz of [-12.4, -9.2, -6.0, -2.8])
      kit.torch(rx, rz, TUNE.paradeTorch);
  kit.torch(-27, -8, TUNE.breachLamp);    // the breach warning-lamp — hung so no sleeper walks into the void [KEPT (-27,-8)]
  kit.torch(-3, -27, TUNE.keepLantern);   // the staff's watch pair — the honor light beside the colors      [KEPT (±3,-27)]
  kit.torch(3, -27, TUNE.keepLantern);
  kit.torch(0, -21.5, TUNE.greatLantern); // THE DOOR-FLAME over the hall entrance — dousable (E5)           [KEPT (0,-21.5)]
  // (the shipped level's invisible relic fill is REMOVED — Law of Light: no
  // unfixtured lights; the door-flame, watch pair, and the staff's own glow
  // carry the hall.)

  // ================= VOID VIAL CACHES + MAW MOTES ============================= [KEPT]
  kit.cache("c1", 12, -12.5, 2);          // parade square, east verge — beside the serjeant's water store
  kit.cache("c2", -31, 14, 2);            // barracks row — tucked along the cot lane
  kit.cache("c3", -9, -33.5, 2);          // the hall's dark west aisle
  kit.mawMote("m1", -13, -1);             // DEVOUR alt — the west verge's darkest pocket
  kit.mawMote("m2", 9, -33.5);            // DEVOUR alt — behind the colors ward's box

  // ================= THE DAY WATCH (Law of the Watch — posts are jobs) ======== [KEPT paths/specs]
  kit.guard([[-4, 10], [4, 10]], TUNE.vGate);      // the OUT-WARD: paces the gate front facing the barred road; pauses at the toll desk (E) and the queue rail (W)
  kit.guard([[24, -8], [24, 16]], TUNE.vBastion);  // the WALL-WARD: walks the armory lane under the curtain; pauses at the tower door (N) and the wicket (S)
  kit.guard([[-24, -8], [-24, 14]], TUNE.sFlank);  // the BREACH-BLIND: flameless among the sleepers, walking the cot lane by ear
  kit.guard([[-10, -5], [10, -5]], TUNE.vCross);   // the SQUARE-SERJEANT: crosses the parade stone between the torch ranks, verge to verge
  kit.guard([[3, -13], [3, -8]], TUNE.vHedge);     // the PORCH-WARD: the short beat between the colors porch and the square
  kit.guard([[-4.2, -27], [4.2, -27], [4.2, -33], [-4.2, -33]], TUNE.vKeep); // the COLORS WARD: boxes the staff and never leaves the hall

  // ================= relic — the Noonstaff on the colors plinth =============== [KEPT (0,-31)]
  kit.scepterPedestal(0, -31);

  // ==========================================================================
  // DRESSING — every prop placed where its user left it. Keep-clear discipline:
  // nothing intrudes on a door lane, a patrol line, the spawn, or a pickup.
  // ==========================================================================

  // ===== E1 · KI — "FULL DAYLIGHT" (the muster yard) =========================
  // The captain's outer ward at the hour the gate is barred: the queue stalled,
  // the toll desk empty, the well waiting for the dawn muster. Hush wakes in
  // the watch tower's one long shade — the first image IS the daytime lesson.
  {
    const clearY = [
      { x: -9, z: 26, r: 2.4 },                           // spawn (the tower's shade)
      { x: 0, z: 27, r: 1.6 },                            // the rift
      { x0: -4, z0: 10, x1: 4, z1: 10, pad: 0.7 },        // the out-ward's line
      { x0: -2, z0: 6, x1: 2, z1: 10, pad: 0.5 },         // the gate-throat lane
      { x0: 12, z0: 16, x1: 16, z1: 20, pad: 0.3 },       // east wicket approach
      { x0: -16, z0: 16, x1: -12, z1: 20, pad: 0.3 },     // west wicket approach
      { x: -13, z: 29, r: 1.5 },                          // the watch tower
      { x: 5, z: 17, r: 1.1 },                            // the well
      { x0: -2.2, z0: 28.8, x1: 2.2, z1: 30 },            // the barred gate leaves
    ];
    // the gate-captain's lodging + the muster office — the yard's two working
    // buildings (their long shades are the E1 hide-lanes) [KEPT masses]
    kit.solid(5, 6.5, 4, 8, 20, kit.mats.wall, 0.15);     // the captain's lodging
    kit.solid(4, 5, 5, -6, 14, kit.mats.wall, -0.1);      // the muster office (the rolls live here)
    kit.pillar(0.9, 0.9, 5, 17, kit.mats.pillar);         // the garrison well [KEPT]
    kit.flank(5, 17, { prop: "urn", opts: { scale: 0.9 } }, { gap: 1.4, clear: clearY, seed: 65 }); // its water urns
    // the provisioners' stalls along the outer wall — the trade that feeds a
    // garrison, shuttered for the night
    kit.wallRunSide({ x0: -16, z0: 6, x1: 16, z1: 30 }, "n",
      [{ prop: "crateStack", w: 1 }, { prop: "barrel", w: 1 }, "urn"],
      { spacing: 2.6, inset: 0.8, clear: clearY, seed: 61 });
    // TABLEAU 1: the provisioner's wagon, halted overnight in the queue — the
    // gate barred before it reached the arch; its sacks are still lashed.
    kit.cluster(11, 23.5, ["cart", { prop: "sack", w: 2 }], { count: 3, footprint: 1.2, clear: clearY, seed: 63 });
    // the toll desk at the throat's shoulder — the out-ward's east pause, and
    // the amenity his post earns (Law of the Watch)
    kit.crate(3.6, 8.1, { rot: 0.06, seed: 67 });         // the desk
    kit.crate(4.5, 7.5, { size: 0.62, rot: 0.1, seed: 68 }); // his stool
    kit.sack(2.95, 7.35, { r: 0.34, seed: 69 });          // the toll sack
    // the quartermaster's issue, delivered to the muster office door
    kit.crateStack(-3.2, 13.4, { seed: 71 });
    kit.sack(-3.4, 14.8, { r: 0.36, seed: 72 });
    // the garrison's cloth over its gates
    kit.banner(0, 3.9, 6.32, "n", { w: 1.4, color: TUNE.cloth, seed: 31 });   // over the throat
    kit.banner(-4.5, 3.6, 29.55, "s", { w: 1.2, color: TUNE.cloth, seed: 33 }); // flanking the barred gate
    kit.banner(4.5, 3.6, 29.52, "s", { w: 1.2, color: TUNE.cloth, seed: 34 });
    kit.extraction(0, 27);                                // the rift — Hush's door before the Vigil's [KEPT]
    kit.inscription(0, 2.6, 6.4, "KEEP THE FIRES FED, the stones say. The sun feeds itself.", "n", "#ffb46a");
  }

  // ===== E2 · SHŌ — "THE FLANKS" (armory walk + barracks row) ================
  // EAST — the armorer's lane: military, sparse, ranked. The curtain's shade is
  // the forgiving road; the wall-ward is its patient toll.
  {
    const clearE = [
      { x0: 24, z0: -8, x1: 24, z1: 16, pad: 0.7 },       // the wall-ward's line
      { x0: 16, z0: -8, x1: 20, z1: -4 },                 // inner wicket lane
      { x0: 16, z0: 16, x1: 20, z1: 20 },                 // outer wicket lane
      { x: 30, z: -6, r: 1.5 },                           // south tower base
      { x: 32, z: 10, r: 1.4 },                           // north tower base
      { x: 27, z: 0, r: 1.4 },                            // the whetting trough
    ];
    // the arms chests, ranked along the curtain wall — issued steel, counted
    // and squared (a rank because soldiers stack in ranks)
    workRank(kit, 33.1, -10, 33.1, 20,
      { prop: "crate", propOpts: { size: 0.8 }, spacing: 2.2, face: "wall", clear: clearE, seed: 73 });
    kit.chains(33.6, 2, { y: 4.2, len: 1.6, seed: 10 });  // the wall-hoist tackle, idle
    kit.chains(33.62, 14, { y: 4.0, len: 1.4, seed: 11 });
    // TABLEAU 2: the whetting trough left mid-edge — blade-chest open beside
    // the stone, the armorer's pan banked cold, his stool still facing the work.
    kit.sarcophagus(27, 0, { rot: 0.2 });                 // the whetting trough [KEPT block]
    kit.crate(28.4, 1.0, { size: 0.75, rot: 0.14, seed: 75 }); // the open blade-chest
    kit.brazier(25.9, 1.5, { lit: false, seed: 76 });     // the banked pan (cold — flame is rationed)
    kit.crate(27.8, -1.3, { size: 0.6, rot: -0.1, seed: 77 }); // his stool
    // the wall-ward's north pause: a stool and waterskin by the tower door
    kit.crate(25.5, 17.3, { size: 0.65, rot: 0.08, seed: 78 });
    kit.sack(26.2, 16.7, { r: 0.32, seed: 79 });
  }
  // WEST — the sleepers' row and the wound in the wall. Order at the north end
  // (the garrison squares even its sleep), collapse at the south (the breach
  // the Vigil never healed — void, violet, Hush's colour, not theirs).
  {
    const clearW = [
      { x0: -24, z0: -8, x1: -24, z1: 14, pad: 0.7 },     // the Breach-Blind's line
      { x0: -20, z0: -8, x1: -16, z1: -4, pad: 0.3 },     // the breach BLINK lane — keep it clean
      { x: -31, z: 14, r: 1.0 },                          // c2 cache
      { x: -27, z: -8, r: 1.2 },                          // the warning-lamp
      { x: -34, z: 5, r: 0.6 },                           // the range wall's mid pier
    ];
    // TABLEAU 3: the bedroll rank, stowed to a string-line down the west range
    // — and the mess corner beside it, one late supper abandoned on the barrel.
    workRank(kit, -33.0, -1, -33.0, 12,
      { prop: "sack", propOpts: { r: 0.34 }, spacing: 1.4, face: "wall", clear: clearW, seed: 81 });
    kit.barrel(-30.5, 18.6, { seed: 82 });                // the mess barrel-table
    kit.sack(-29.85, 18.15, { r: 0.3, seed: 83 });        // the late supper
    kit.crate(-31.4, 18.0, { size: 0.62, rot: 0.12, seed: 84 }); // two crate-stools
    kit.crate(-29.9, 19.3, { size: 0.6, rot: -0.08, seed: 85 });
    // the repair stone — cut for the breach a season ago, never laid
    kit.corner({ x0: -34, z0: -12, x1: -20, z1: 22 }, "nw", ["rubble", "brokenColumn"],
      { count: 3, clear: clearW, seed: 75 });
    // the collapse framing the void gap (tall pieces lean toward the breach) [KEPT]
    kit.cluster(-22, -6.5, ["rubble", { prop: "brokenColumn", w: 2 }, "deadLantern"],
      { count: 4, footprint: 1.2, backDir: Math.atan2(4, 0.5), clear: clearW, seed: 73 });
    kit.deadLantern(-21.3, -9.3, { fallen: true, rot: 2.1, seed: 86 }); // the old lane-lamp, knocked flat when the wall went
    kit.rubble(-21.6, -2.5, { radius: 0.7, seed: 87 });   // spill past the north cap
    // the one Hush line of the level, at the wound (violet — Hush's colour)
    kit.inscription(-20.38, 1.9, -2.9, "You remember this dark. It reaches back.", "w", "#7a6bb0");
  }

  // ===== E3 · SHŌ — "THE THROWN SOUND" (the inner wicket — teaches LURE) =====
  // The watched door onto the square, with no shade past the cone: the first
  // place an old verb fails. The oath-stone every soldier touches going on
  // watch sits beside the lane; the serjeant's check-pan — banked till morning
  // — stands a few strides BEYOND the watcher: where a thrown sound would land.
  {
    const clearP = [
      { x0: 16, z0: -8, x1: 20, z1: -4 },                 // the wicket lane (keep it readable)
      { x0: -10, z0: -5, x1: 10, z1: -5, pad: 0.7 },      // the square-serjeant's line
    ];
    kit.flank(14, -6, { prop: "urn", opts: { scale: 0.9 } },
      { dir: 0, gap: 1.9, face: "in", clear: clearP, seed: 81 }); // offering urns at the wicket jambs
    kit.sarcophagus(13.5, -9.4, { rot: 0.3 });            // THE OATH-STONE — the landmark the vial sails past [KEPT]
    kit.brazier(9, -6, { lit: false, seed: 83 });         // the check-pan, banked — "a sound lands there"
  }

  // ===== E4 · TEN — "THE PARADE STONE" (the square, under the ranks) =========
  // The Turn. The stone is the only way to the porch, and it is loud (crystal)
  // and tiled with torch-pools, with the serjeant walking it. You cannot douse
  // the sky, and two vials cannot douse eight standards — LURE the serjeant
  // off the stone, or spend both vials carving one dark seam through the grid.
  // Verges and lanes stay clear of cover (a lane must stay a lane); the wear
  // sits against the walls, where the wick-boys and the serjeant left it.
  {
    const clearC = [
      { x0: -10, z0: -5, x1: 10, z1: -5, pad: 0.7 },      // the square-serjeant's line
      { x0: 3, z0: -13, x1: 3, z1: -8, pad: 0.6 },        // the porch-ward's beat
      { x0: -2, z0: -15, x1: 2, z1: 1, pad: 0.5 },        // the N–S crossing lane — keep it legible
      { x: 0, z: -7, r: 1.6 },                            // the cistern
      { x: -13, z: -1, r: 1.0 },                          // m1 pocket
      { x: 12, z: -12.5, r: 1.0 },                        // c1 cache
      { x: -8, z: -3, r: 1.3 },                           // stele W
      { x: -3, z: -10, r: 1.4 },                          // stele S
      { x0: -16, z0: -8, x1: -14, z1: -4, pad: 0.3 },     // breach mouth (parade side)
      { x0: 14, z0: -8, x1: 16, z1: -4, pad: 0.3 },       // inner wicket mouth
      { x: -4.6, z: -14, r: 0.8 }, { x: 4.6, z: -14, r: 0.8 }, // the porch statues
    ];
    // honors at the steles' feet — offerings, not cover (urns are decor)
    kit.flank(-8, -3, { prop: "urn", opts: { scale: 0.9 } }, { dir: Math.PI / 2, gap: 1.6, face: "in", clear: clearC, seed: 91 });
    kit.flank(-3, -10, { prop: "urn", opts: { scale: 0.9 } }, { dir: Math.PI / 2, gap: 1.6, face: "in", clear: clearC, seed: 93 });
    // the sentinel statues flanking the colors porch — the honor threshold [KEPT]
    kit.statue(-4.6, -14, { scale: 1.0, h: 2.7, rot: 0.552, seed: 95 });
    kit.statue(4.6, -14, { scale: 1.0, h: 2.7, rot: -0.552, seed: 96 });
    // TABLEAU 4: the spent standards, racked along the west verge — burnt-out
    // torches the wick-boys pulled when they planted tonight's ranks. The rank
    // on the wall explains the ranks on the stone.
    workRank(kit, -15.1, -12.5, -15.1, -2.5,
      { prop: "deadLantern", spacing: 2.0, face: "wall", clear: clearC, seed: 97 });
    // the serjeant's water store on the east verge, beside the wicket lane
    kit.barrel(12.6, -13.8, { seed: 98 });
    kit.crate(11.2, -13.6, { size: 0.7, rot: 0.1, seed: 99 });
    kit.inscription(0, 2.4, 0.62, "KEEP THE FIRES FED — the sun needs no wick.", "s", "#ffb46a");
  }

  // ===== E5 · TEN (resolve) — "THE HALL OF COLORS" ===========================
  // The sanctum of the paraded relic: the staff on its plinth between the
  // muster columns, the honor guard's statues facing it, the offering row
  // along the south wall, the ward's polish-kit at a column base — the staff
  // is polished nightly, and the kit sits where he left it an hour ago.
  {
    const clearK = [
      { x0: -4.2, z0: -33, x1: 4.2, z1: -27, pad: 0.6 },  // the colors ward's box
      { x: 0, z: -31, r: 1.4 },                           // the plinth
      { x: 0, z: -21.5, r: 1.4 },                         // the door-flame
      { x0: -2, z0: -20, x1: 2, z1: -20, pad: 0.4 },      // the porch lane
      { x: -9, z: -33.5, r: 1.0 },                        // c3 cache
      { x: 9, z: -33.5, r: 1.0 },                         // m2 mote
      { x: -6.5, z: -24, r: 0.9 }, { x: -6.5, z: -28, r: 0.9 }, { x: -6.5, z: -32, r: 0.9 }, // the columns
      { x: 6.5, z: -24, r: 0.9 }, { x: 6.5, z: -28, r: 0.9 }, { x: 6.5, z: -32, r: 0.9 },
    ];
    // the honor guard in stone, framing the staff (gap 5.5 keeps them out of
    // the living ward's box) [KEPT]
    kit.flank(0, -26, "statue", { gap: 5.5, dir: Math.PI / 2, face: "in", clear: clearK, seed: 101 });
    // the offering row along the south wall behind the colors
    kit.wallRunSide({ x0: -12, z0: -36, x1: 12, z1: -20 }, "s",
      [{ prop: "urn", w: 2 }, { prop: "brazier", opts: { lit: false } }],
      { spacing: 3.0, inset: 0.6, clear: clearK, seed: 103 });
    // TABLEAU (small wear): the ward's polish-kit at a column base
    kit.crate(6.3, -30.3, { size: 0.65, rot: 0.1, seed: 105 }); // the oil-crate
    kit.sack(6.35, -29.5, { r: 0.3, seed: 106 });               // the polishing cloths
    kit.banner(0, 3.4, -35.55, "n", { w: 1.4, color: TUNE.cloth, seed: 35 }); // the garrison's colors-cloth behind the staff
    kit.inscription(0, 2.4, -20.42, "TAKE ONLY WHAT THE DARK WILL CARRY", "s", "#ffd76a");
  }

  // ===== E6 · KETSU — the alarm cressets (ignite on the theft) ================
  // Dark iron alarm-lamps — filled, fixtured, and deliberately unlit (the
  // garrison does not waste oil on a quiet night) — at the steles' lane and
  // the hall door. When the Noonstaff moves, they flare: the square you
  // crossed in the seams becomes a lit trap. [KEPT positions/logic]
  for (const [x, z, seed] of [[-10, -3, 56], [10, -3, 57], [-5, -25, 58], [5, -25, 59]]) {
    kit.deadLantern(x, z, { h: 2.8, seed });              // the visible fixture
    const l = new THREE.PointLight(0xff8866, 0, 13);
    l.position.set(x, 2.92, z);
    l.userData.rtRadius = 0.2;
    scene.add(l);
    const flare = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12),
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x662222, emissiveIntensity: 0.6 })
    );
    flare.position.set(x, 2.9, z);                        // inside the dead cage
    flare.userData.rtExclude = true;
    scene.add(flare);
    bag.dormant.push({ light: l, fixture: flare, target: 9 });
  }

  // ================= THE SUN (the key light) ================================== [KEPT]
  // Low WSW, elev ≈21°: it floods the low-walled muster yard (the E1 read) and
  // clears NONE of the square's h8 walls — which is why the garrison plants
  // torches, and why a douse there carves true dark (the meter's sun term is
  // LOS-gated by the same walls the tracer shades). No invisible fills: the
  // AmbientLight is a visual-only sky tint the light meter never reads.
  const sun = new THREE.DirectionalLight(TUNE.sun.color, TUNE.sun.intensity);
  sun.position.set(...TUNE.sun.pos);
  sun.userData.rtRadius = 0.05;
  scene.add(sun, sun.target);
  const sky = new THREE.AmbientLight(TUNE.sky.color, TUNE.sky.intensity);
  scene.add(sky);

  // ================= checkpoints ============================================== [KEPT]
  kit.checkpoint(-9, 24, 3);
  kit.checkpoint(0, 3, 2.5);
  kit.checkpoint(0, -4, 3);   // clear of the cistern at (0,-7)
  kit.checkpoint(0, -17, 2.5, 0, -17);

  // ================= triggers / six-beat teaching ============================= [KEPT ids + positions]
  kit.trigger("approach", 0, 20, 6);
  kit.trigger("gate", 0, 8, 3.5);
  kit.trigger("eastflank", 18, 18, 3);
  kit.trigger("westflank", -18, 18, 3);
  kit.trigger("inside", 0, -2, 3);      // gate-throat entry to the square
  kit.trigger("insideE", 17, -6, 3);    // inner wicket — the LURE pinch
  kit.trigger("insideW", -14, -6, 3);   // breach exit — the LURE pinch
  kit.trigger("cross", 0, -6, 2.6);     // E4 TEN — the torch-lit crossing
  kit.trigger("hall", 0, -21, 3);       // E5 — the Noonstaff

  // ================= mission logic ============================================ [KEPT verbatim]
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
    if (id === "inside") { enterCourt(game); if (!bag._insideSeen) { bag._insideSeen = true; p.prompt("Inside the light. Cross in the seams of the torch ranks."); } }
    if (id === "insideE") { enterCourt(game); teachLure(game); }
    if (id === "insideW") { enterCourt(game); teachLure(game); }
    if (id === "cross" && !bag._crossSeen) {
      bag._crossSeen = true;
      p.prompt("The sun won't douse. Lure the watcher off the crossing.");
    }
    if (id === "hall" && bag.stage === 1) {
      bag.stage = 2;
      game.setObjective("Take the Noonstaff");
      p.prompt("The Noonstaff waits ahead. Reach it and it is yours.", 4);
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = TUNE.beaconMul;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    game.hud.prompt("The garrison wakes — your stolen light betrays you. Run.");
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.88 + 0.12 * Math.sin(t * 7 + tc.x * 2));
    }
    // the alarm cressets flare after the theft [KEPT]
    if (game.scepterTaken && bag.alarmT < 1) {
      bag.alarmT = Math.min(1, bag.alarmT + dt);
      for (const d of bag.dormant) {
        d.light.intensity = d.target * bag.alarmT;
        d.fixture.material.emissive.setHex(0xff8866);
        d.fixture.material.emissiveIntensity = 0.6 + bag.alarmT * 4;
      }
    }
    // scepter: bobbing/spinning, then rides the thief once taken [KEPT]
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
    // extraction rift pulse [KEPT]
    if (bag.extract) {
      bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
    }
  };

  bag.startVials = 2;                                     // [KEPT] — the vial arc (M4 grants 2: LURE + douse)
  return bag;
}
