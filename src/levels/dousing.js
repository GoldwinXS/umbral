import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * MISSION 2 — THE DOUSING YARDS  (level index 1) — the DOUSE mission.
 *
 * ============================== SITE DOSSIER =================================
 * WHAT: The Candent Vigil's lamp-oil and snuffing yard — where Lanternspire's
 *   street-lanterns are brought at the end of their burning life. Their flames
 *   are carried home to the GREAT LANTERN, the yard's master flame; their oil
 *   is drained and stored; their wicks are pulled; their stripped hulls go back
 *   out by dawn dray. New lanterns are lit FROM the great flame and borne east
 *   into the lamp district each dusk. Nothing here dies — it is rendered.
 * WHO: the LANTERN-WARDEN (keeper of the great flame; performs the homing rite
 *   with the Everwick); the OIL-WARD (tallies every lantern in at the receiving
 *   door, masters the draining floor and the oil store); the WICK-PULLERS (the
 *   bench crew of the lit gallery); the DRAY-MEN (dead lamps in at dusk,
 *   stripped hulls out at dawn).
 * PARTI: street dray-gate → dray bay → receiving yard (the tally door) →
 *   draining floor → fork: oil store (DARK — no flame is allowed near the oil,
 *   so its only sentinel is a blind one) | wick gallery (LIT — fine work needs
 *   light) → lighting court (refit lanterns queue for flame) → THE GREAT HALL
 *   (the snuffing floor under the Great Lantern) → bearers' porch → the lamp
 *   district. Carcasses flow west by dray; FLAME flows east, always east.
 * WHY THE RELIC IS HERE: the SNUFFROD — the warden's ceremonial rod that has
 *   taken home every flame the city ever retired, its head a sealed gill of the
 *   first oil the Vigil ever rendered (a stolen dusk, per the liturgy). Between
 *   rites it stands on the snuffing altar at the hall's deep end, inside the
 *   Great Lantern's own pool — the most-lit, most-tended, deepest point of the
 *   yard. Hush leaves the dousers' yard carrying the instrument of dousing.
 * TABLEAUX: (1) a dray stands half-tipped in the bay, dead lanterns spilled
 *   where they slid — the dray-men quit at the shift bell; (2) the oil-ward's
 *   crate-desk by the tally door, supper sack beside it, his watch-brazier
 *   still burning — he stepped out mid-count; (3) one gallery bench abandoned
 *   mid-pull, the wick-sack spilled beside the stool, a gap in the bench row;
 *   (4) refit lanterns stood in a dressed rank along the lighting-court wall,
 *   dark, queued for a flame that will not come tonight.
 * THE NIGHT SHIFT: the OIL-WARD'S MAN walks the tally line inside the receiving
 *   door, pausing at the desk and at the intake rank. The BENCH-WARD paces the
 *   wick gallery bench row end to end under the bench-lamp. The CELLAR-BLIND —
 *   a Snuffed — keeps the oil store: the one sentinel allowed among the barrels
 *   because it carries no flame; it walks the rack aisle by ear. The RITE-WARD
 *   crosses the Great Lantern's pool between hall door and altar. The WALK-WARD
 *   paces the bearers' gate, facing the lamp district. The lighting court goes
 *   unwatched — every way into it is already a post.
 * =============================================================================
 *
 * Teaches DOUSE in beats, then TURNS the verb (per docs/REDESIGN_1-4.md):
 *   E1 KI    — THE FIRST DARK YOU MAKE : the clean douse (the lit tally door);
 *              the shatter-as-thunder hazard is NAMED but not yet bitten.
 *   E2 SHŌ   — THE FORK : DOUSE conjugated by where it is legal — south the
 *              bench-ward trusts its lamp (DOUSE), north the blind thing in the
 *              oil store listens (NEVER).
 *   E3 SHŌ   — THE LIGHTING COURT : a safe rehearsal of the loud douse (the
 *              warden's eve-lamp, no guard to punish it) so the cost is FELT.
 *   E4 TEN   — THE GREAT LANTERN : the Turn. Dousing is FORCED, LOUD, and the
 *              rite-ward walks the pool — the tool that saves you betrays you.
 *   E5 KETSU — THE WAKING LAMPS : take the Everwick, the yard wakes, outrun it.
 *
 * SHOWCASE — THE GREAT LANTERN DOUSE: the hall is lit by exactly ONE light,
 * the master flame on its tall standard at (44,0), over a lime-washed hall —
 * pale walls, pale piers, pale statues — sized so the lamp's pool washes the
 * whole snuffing floor and every pale face above it. No invisible fills
 * anywhere in the level (each of the old ones is now a fixtured, resident-owned
 * brazier), so when the vial lands, the entire hall's illumination dies in one
 * frame — night falls — and all that survives is two altar embers and the thin
 * moon. The light meter samples the real lights, so the same throw that makes
 * the image IS the throw that opens the dark route to the altar. Reads with
 * reflections and volumetrics OFF (a raw light-level change); with volumetrics
 * on, the hall's haze makes the dying pool a collapsing dome.
 *
 * Two enemy types only: Vespers (lit, cone-sighted) and one Snuffed (blind,
 * sound-hunting). Flat (embargo). All wall runs are kit.wall with overlapped
 * joints and one-pier-per-corner (PLACES.md geometry hygiene). Palette LAW:
 * amber/orange/red is the Vigil's; violet is Hush's alone.
 */

// TUNE — the knobs we reach for. Change feel here, not in the body. All guard,
// lamp, and vial numbers [KEPT] from the shipped level — the architecture moved,
// the difficulty did not.
const TUNE = {
  // ---- ART PASS · MOONLIGHT (meter-safe relight) --------------------------------
  // The light meter reads ONLY moon.intensity + direction (main.js), never colour.
  // moonBoost scales the render brightness via the hue and leaves the meter
  // bit-identical. Keep `moon` (intensity) + the moon.position (direction) as
  // shipped. This stays the THIN moon — the great lantern still owns the night —
  // it just no longer crushes the pale hall's surrounds to void.
  moon: 0.55,                                             // METER intensity — DO NOT CHANGE (thin high moon) [KEPT]
  moonHue: 0x8ea0cc,                                      // moon colour hue (cool moon-blue)
  moonBoost: 2.6,                                         // RENDER-only brightness × — meter never sees colour, safe to raise
  tallyLamp:    { intensity: 7,  range: 9,  scale: 1 },   // the oil-ward's tally-door lamp (E1)            [KEPT 7/9]
  rackLamp:     { intensity: 6,  range: 7,  scale: 1 },   // the draining floor's crossroads lamp (E2 hub)  [KEPT 6/7]
  benchLamp:    { intensity: 8,  range: 9,  scale: 1 },   // the wick gallery's bench-lamp (E2 south)       [KEPT 8/9]
  eveLamp:      { intensity: 14, range: 11, scale: 2.0 }, // the warden's eve-lamp (E3, safe rehearsal)     [KEPT 14/11]
  greatLantern: { intensity: 13, range: 11, scale: 2.2 }, // THE GREAT LANTERN (E4, forced douse)           [KEPT 13/11; taller standard]
  vTally:   { speed: 1.1, pause: 1.4, range: 8 },      // E2 · the oil-ward's man (pauses = desk / rank)  [KEPT]
  vBench:   { speed: 1.2, pause: 1.3, range: 8 },      // E2 · the bench-ward                             [KEPT]
  sOil:     { speed: 1.0, pause: 2.0, blind: true },   // E2 · the CELLAR-BLIND (Snuffed — ear only)      [KEPT]
  vRite:    { speed: 1.2, pause: 1.3, range: 9 },      // E4 · the rite-ward (far-turn dwell = pause)     [KEPT]
  vGate:    { speed: 1.3, pause: 1.0, range: 9 },      // E5 · the walk-ward at the bearers' gate         [KEPT]
};

export function buildDousing() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "dousingyards";
  bag.name = "THE DOUSING YARDS";
  bag.spawn.set(-37, 0.42, -1);                       // [KEPT] — Hush rode in under the last dray-load
  bag.bounds = { x0: -47, z0: -11, x1: 71, z1: 11 };

  // the GREAT HALL's limewash — pale surfaces that catch the master flame, so
  // the douse reads as night falling. Only the hall wears it (the work yards
  // stay soot-dark masonry); ~2x the luminance of the kit's default wall.
  const paleWall = new THREE.MeshStandardMaterial({ color: 0x565d72, roughness: 0.88, metalness: 0.04 });
  const palePier = new THREE.MeshStandardMaterial({ color: 0x636b83, roughness: 0.8, metalness: 0.06 });

  // ======================= GEOMETRY — the yards ==============================
  // All walls are kit.wall runs: joints OVERLAP (the box overshoots th/2), and
  // each corner/jamb carries exactly ONE pier — from whichever run "owns" it,
  // or an explicit kit.pier where no run reaches. piers:false marks runs whose
  // endpoints a neighbour already caps.

  // --- THE STREET (x -46..-40, beyond the dray gate — unreachable) — the dray
  // --- road back into Lanternspire; the fog plugs the gate. More city, going
  // --- on without you: a parked cart, a dead street-lantern, ruts.
  kit.floor(6, 4, -43, 0);
  kit.wall(-46, 2, -40, 2, { h: 2.6 });                   // street cheeks (own their ends)
  kit.wall(-46, -2, -40, -2, { h: 2.6 });
  kit.wall(-46, -2, -46, 2, { h: 2.7, piers: false });    // the haze-cap across the road
  kit.cart(-43.8, 1.0, { rot: 0.18 });
  kit.deadLantern(-44.9, -1.0, { seed: 3 });
  kit.rubble(-42.4, -1.1, { radius: 0.55, seed: 4 });
  kit.fogWall(-40.6, 0, 3, { rot: Math.PI / 2, h: 3.0 }); // the way back is shut

  // --- THE DRAY BAY (x -40..-32, z -4..4) — the dray-men's unloading bay; the
  // --- night's last load of dead lanterns came in here and nobody finished
  // --- tipping it. Unlit: the drays know their own gate. Hush wakes in it.
  kit.floor(8, 8, -36, 0);
  kit.surface(-40, -4, -32, 4, "moss");
  kit.wall(-40, 4, -32, 4, { h: 3.0 });                   // north wall (owns its corners)
  kit.wall(-40, -4, -32, -4, { h: 3.0 });                 // south wall (owns its corners)
  kit.wall(-40, -4, -40, -1.5, { h: 3.0, piers: false }); // street gate, south cheek
  kit.wall(-40, 1.5, -40, 4, { h: 3.0, piers: false });   // street gate, north cheek
  kit.pier(-40, -1.5, 3.2);                               // gate jambs
  kit.pier(-40, 1.5, 3.2);
  kit.wall(-32, -4, -32, -1.5, { h: 3.0, piers: false }); // east door cheeks (jambs piered by the wicket)
  kit.wall(-32, 1.5, -32, 4, { h: 3.0, piers: false });

  // --- THE WICKET (x -32..-28) — the tally throat between bay and yard; every
  // --- lantern is wheeled through here to be counted. Kept bare — loads pass.
  kit.floor(4, 3, -30, 0);
  kit.surface(-32, -1.5, -28, 1.5, "moss");
  kit.wall(-32, 1.5, -28, 1.5, { h: 2.8 });               // owns all four jambs
  kit.wall(-32, -1.5, -28, -1.5, { h: 2.8 });

  // --- THE RECEIVING YARD (x -28..-14, z -9..9) — the oil-ward's intake floor.
  // --- Dead lanterns stand in a dressed rank along the north wall awaiting the
  // --- rack; his tally desk sits at the lit east door, the one door he pays
  // --- light for (Law 2: the tally must be read). His man walks the line.
  kit.floor(14, 18, -21, 0);
  kit.surface(-28, -9, -14, 9, "moss");
  kit.wall(-28, 9, -14, 9, { h: 3.1 });                   // north wall (owns corners)
  kit.wall(-28, -9, -14, -9, { h: 3.0 });                 // south wall (owns corners)
  kit.wall(-28, -9, -28, -1.5, { h: 3.0, piers: false }); // west cheeks (jambs from the wicket)
  kit.wall(-28, 1.5, -28, 9, { h: 3.0, piers: false });
  kit.wall(-14, -9, -14, -1.5, { h: 3.0, piers: false }); // east cheeks (jambs from the rack throat)
  kit.wall(-14, 1.5, -14, 9, { h: 3.0, piers: false });

  // --- THE RACK THROAT (x -14..-10) — receiving to draining floor.
  kit.floor(4, 3, -12, 0);
  kit.surface(-14, -1.5, -10, 1.5, "moss");
  kit.wall(-14, 1.5, -10, 1.5, { h: 2.8 });
  kit.wall(-14, -1.5, -10, -1.5, { h: 2.8 });

  // --- THE DRAINING FLOOR (x -10..10, z -10..10) — the yard's crossroads and
  // --- the oil-ward's work floor: two free-standing rack rows where drained
  // --- lanterns hang and drip into barrels. His crossroads lamp burns at the
  // --- middle (a junction the Vigil pays for); the service edges stay dark.
  kit.floor(20, 20, 0, 0);
  kit.surface(-10, -10, 10, 10, "moss");
  kit.wall(-10, 10, 10, 10, { h: 3.2 });                  // north wall (owns corners)
  kit.wall(-10, -10, 10, -10, { h: 3.2 });                // south wall (owns corners)
  kit.wall(-10, -10, -10, -1.5, { h: 3.0, piers: false });// west cheeks (jambs from the rack throat)
  kit.wall(-10, 1.5, -10, 10, { h: 3.0, piers: false });
  kit.wall(10, -10, 10, -7, { h: 3.0, piers: false });    // east wall below the gallery mouth
  kit.wall(10, -3, 10, 3, { h: 3.0, piers: false });      // east wall between the fork doors
  kit.wall(10, 7, 10, 10, { h: 3.0, piers: false });      // east wall above the store mouth
  kit.pier(10, 7, 3.1);                                   // fork jambs no run reaches
  kit.pier(10, -7, 3.1);

  // --- THE OIL STORE (x 10..24, z 3..9) — the oil-ward's barrel store, DARK ON
  // --- PURPOSE: no flame is allowed within a spear-length of the oil, so the
  // --- Vigil posts the one sentinel that carries none — the Cellar-Blind. The
  // --- drained gills rack along the north wall under their hoist chains.
  kit.floor(14, 6, 17, 6);
  kit.surface(10, 3, 24, 9, "moss");
  kit.wall(10, 9, 24, 9, { h: 3.0 });                     // north wall (owns (10,9) T and (24,9))
  kit.wall(10, 3, 24, 3, { h: 3.0 });                     // south wall (owns the fork jamb (10,3) + court jamb (24,3))
  kit.wall(24, 7, 24, 9, { h: 3.0, piers: false });       // east cheek above the court door
  kit.pier(24, 7, 3.1);                                   // its jamb

  // --- THE WICK GALLERY (x 10..24, z -9..-3) — the wick-pullers' lit bench
  // --- row: fine work, so the Vigil lights it end to end (the bench-lamp).
  // --- The bench-ward paces the aisle and trusts its light entirely.
  kit.floor(14, 6, 17, -6);
  kit.surface(10, -9, 24, -3, "moss");
  kit.wall(10, -9, 24, -9, { h: 3.0 });                   // south wall (owns (10,-9) T and (24,-9))
  kit.wall(10, -3, 24, -3, { h: 3.0 });                   // north wall (owns the fork jamb (10,-3) + court jamb (24,-3))
  kit.wall(24, -9, 24, -7, { h: 3.0, piers: false });     // east cheek below the court door
  kit.pier(24, -7, 3.1);
  // (between the throats, x10..24 z-3..3, sits the sealed wick vault — walled
  // on all four sides by the runs above; a locked room the yard implies.)
  kit.floor(14, 6, 17, 0);                                 // the vault's floor slab — invisible in play, closes the hole (hygiene)

  // --- THE LIGHTING COURT (x 24..34, z -9..9) — the lantern-warden's own yard,
  // --- where refit lanterns queue to receive flame. His eve-lamp burns through
  // --- the night while he readies wicks; the court is unwatched — every way in
  // --- is already a post. (E3: the safe rehearsal of the loud douse.)
  kit.floor(10, 18, 29, 0);
  kit.surface(24, -9, 34, 9, "moss");
  kit.wall(24, 9, 34, 9, { h: 3.15, piers: false });      // north wall (west end capped by the store's run)
  kit.pier(34, 9, 3.4);
  kit.wall(24, -9, 34, -9, { h: 3.15, piers: false });    // south wall (west end capped by the gallery's run)
  kit.pier(34, -9, 3.4);
  kit.wall(24, -3, 24, 3, { h: 3.0, piers: false });      // west wall between the fork doors (jambs owned by throat runs)
  kit.wall(34, -9, 34, -1.5, { h: 3.0, piers: false });   // east cheeks (jambs from the rite door)
  kit.wall(34, 1.5, 34, 9, { h: 3.0, piers: false });

  // --- THE RITE DOOR (x 34..38) — court to hall; the warden's processional
  // --- throat. Flame passes through here twice a day, nothing else.
  kit.floor(4, 3, 36, 0);
  kit.surface(34, -1.5, 38, 1.5, "moss");
  kit.wall(34, 1.5, 38, 1.5, { h: 2.8 });
  kit.wall(34, -1.5, 38, -1.5, { h: 2.8 });

  // --- THE GREAT HALL (x 38..54, z -10..10) — the snuffing floor: the yard's
  // --- shrine and its showcase. Lime-washed walls and piers so the ONE light
  // --- (the Great Lantern on its standard) washes every pale face; the floor
  // --- is the vitrified rite-floor that rings underfoot (loud crystal). The
  // --- Everwick stands on the altar at the deep end, inside the pool. Douse
  // --- the master flame and night falls on the whole hall at once.
  kit.floor(16, 20, 46, 0);
  kit.surface(38, -10, 54, 10, "crystal");
  kit.wall(38, 10, 54, 10, { h: 3.6, mat: paleWall, pierMat: palePier });   // north wall (owns corners)
  kit.wall(38, -10, 54, -10, { h: 3.6, mat: paleWall, pierMat: palePier }); // south wall (owns corners)
  kit.wall(38, -10, 38, -1.5, { h: 3.4, piers: false, mat: paleWall });     // west cheeks (jambs from the rite door)
  kit.wall(38, 1.5, 38, 10, { h: 3.4, piers: false, mat: paleWall });
  kit.wall(54, -10, 54, -1.5, { h: 3.4, piers: false, mat: paleWall });     // east cheeks (jambs from the flame walk)
  kit.wall(54, 1.5, 54, 10, { h: 3.4, piers: false, mat: paleWall });

  // --- THE FLAME WALK (x 54..58) — hall to porch; the bearers' throat east.
  kit.floor(4, 3, 56, 0);
  kit.surface(54, -1.5, 58, 1.5, "moss");
  kit.wall(54, 1.5, 58, 1.5, { h: 2.8 });
  kit.wall(54, -1.5, 58, -1.5, { h: 2.8 });

  // --- THE BEARERS' PORCH (x 58..66, z -6..6) — where lit lanterns leave for
  // --- the city each dusk. The walk-ward paces the gate line facing out; the
  // --- gate's two watch-lamps hang dark until the yard has reason. Tonight
  // --- the rift stands where the bearers muster.
  kit.floor(8, 12, 62, 0);
  kit.surface(58, -6, 66, 6, "moss");
  kit.wall(58, 6, 66, 6, { h: 3.0 });                     // north wall (owns corners)
  kit.wall(58, -6, 66, -6, { h: 3.0 });                   // south wall (owns corners)
  kit.wall(58, -6, 58, -1.5, { h: 3.0, piers: false });   // west cheeks (jambs from the flame walk)
  kit.wall(58, 1.5, 58, 6, { h: 3.0, piers: false });
  kit.wall(66, -6, 66, -1.5, { h: 3.0, piers: false });   // east gate cheeks
  kit.wall(66, 1.5, 66, 6, { h: 3.0, piers: false });
  kit.pier(66, -1.5, 3.2);                                // gate jambs
  kit.pier(66, 1.5, 3.2);
  kit.fogWall(66.6, 0, 3, { rot: Math.PI / 2, h: 3.0 });  // the walk east is not yours either

  // --- THE LAMP WALK (x 66..70, beyond the gate — unreachable) — the bearers'
  // --- street into the lamp district; its nearest lantern stands dark because
  // --- tonight's bearers never came. More city, going on without you.
  kit.floor(4, 3, 68, 0);
  kit.wall(66, 1.5, 70, 1.5, { h: 2.6, piers: false });
  kit.wall(66, -1.5, 70, -1.5, { h: 2.6, piers: false });
  kit.pier(70, 1.5, 2.7);
  kit.pier(70, -1.5, 2.7);
  kit.wall(70, -1.5, 70, 1.5, { h: 2.7, piers: false });  // haze-cap
  kit.deadLantern(68.6, 0.9, { seed: 5 });
  kit.urn(68.2, -0.9, { scale: 0.85, seed: 6 });

  kit.extraction(62, 0);                                  // [KEPT]

  // ================= THE YARD'S LAMPS (every one owned + fixtured) ============
  kit.torch(-15, 0, TUNE.tallyLamp);      // the tally-door lamp — the oil-ward reads his count by it (E1)   [KEPT (-15,0)]
  kit.torch(0, 0, TUNE.rackLamp);         // the crossroads lamp over the draining floor's junction (E2)     [KEPT (0,0)]
  kit.torch(17, -5, TUNE.benchLamp);      // the bench-lamp the wick-pullers (and their ward) work by (E2)   [KEPT (17,-5)]
  kit.torch(29, 4, TUNE.eveLamp);         // the warden's eve-lamp in the lighting court (E3 rehearsal)      [KEPT (29,4)]
  kit.torch(44, 0, TUNE.greatLantern);    // THE GREAT LANTERN — the master flame on its standard (E4)       [KEPT (44,0)]

  // ================= VOID VIAL CACHES ========================================= [KEPT]
  kit.cache("capB", -25, 4, 2);   // receiving yard, BEFORE the lit tally door — arm, then meet the light
  kit.cache("capU", 17, 5, 1);    // the oil store aisle — a quiet find, no light to spend on
  kit.cache("capF", 29, -4, 2);   // the lighting court — refill before the hall

  // ================= THE NIGHT SHIFT (Law of the Watch — posts are jobs) ====== [KEPT paths/specs]
  kit.guard([[-15, -4], [-15, 4]], TUNE.vTally);   // the oil-ward's man: walks the tally line; pauses at the desk (N) and the rank (S)
  kit.guard([[13, -5], [21, -5]], TUNE.vBench);    // the bench-ward: paces the bench row, trusts the bench-lamp
  kit.guard([[13, 5], [21, 5]], TUNE.sOil);        // the CELLAR-BLIND: the flameless sentinel of the oil store, hunting by ear
  kit.guard([[44, -5], [44, 5]], TUNE.vRite);      // the rite-ward: crosses the great pool, altar door to altar door
  kit.guard([[60, -4], [60, 4]], TUNE.vGate);      // the walk-ward: paces the bearers' gate, facing the district

  // ================= relic — the Everwick on the snuffing altar =============== [KEPT (50,0)]
  kit.scepterPedestal(50, 0);

  // ==========================================================================
  // DRESSING — every prop placed where its user left it. Keep-clear discipline:
  // nothing intrudes on a door lane, a patrol line, the spawn, or a pickup.
  // ==========================================================================

  // ===== E1 · KI — "THE FIRST DARK YOU MAKE" (dray bay + receiving yard) =====
  {
    const clearA = [
      { x: -37, z: -1, r: 2.2 },                          // spawn pad
      { x0: -40, z0: -1.5, x1: -35, z1: 1.5, pad: 0.3 },  // the dray track in from the gate
      { x0: -33, z0: -1.5, x1: -28, z1: 1.5, pad: 0.4 },  // east door lane (bay → wicket)
    ];
    // TABLEAU 1: the stalled dray — half-tipped against the north wall, its
    // load of dead lanterns spilled where they slid. Hush came in under them.
    kit.cart(-35.2, 2.3, { rot: 0.12 });
    kit.cluster(-37.8, 2.5, [{ prop: "deadLantern", w: 3 }, { prop: "rubble", w: 1 }, "sack"],
      { count: 4, footprint: 1.1, backDir: 0, clear: clearA, seed: 2 });
    // the bay's empty return-crates, ranked along the south wall for the dawn run
    kit.wallRun(-39.2, -3.3, -32.8, -3.3, [{ prop: "crate", w: 2 }, "sack"],
      { spacing: 1.6, inset: 0, face: "wall", clear: clearA, seed: 4 });

    const clearB = [
      { x0: -16, z0: -4, x1: -14, z1: 4, pad: 0.5 },      // the tally line (the ward's man, x≈-15)
      { x0: -28, z0: -1.2, x1: -14, z1: 1.2, pad: 0.3 },  // the dray track across the yard
      { x: -25, z: 4, r: 1.2 },                           // capB cache
    ];
    // the intake rank: dead lanterns stood in the oil-ward's dressed row along
    // the north wall, each awaiting its turn on the racks. Order = his pride.
    kit.wallRun(-27, 8.3, -16, 8.3, [{ prop: "deadLantern", w: 3 }, { prop: "crate", w: 1 }],
      { spacing: 1.9, inset: 0, face: "wall", rotJitter: 0.1, clear: clearB, seed: 6 });
    // unloaded crates staged mid-yard where the dray-men left them [KEPT cover spots]
    kit.crateStack(-23, -5, { seed: 3 });
    kit.crateStack(-18, 6, { seed: 5 });
    // TABLEAU 2: the oil-ward's desk at his lit door — crate-desk, supper sack,
    // and his watch-brazier still burning (the fixtured light his corner earns).
    kit.crate(-17.2, 5.2, { rot: 0.08, seed: 21 });
    kit.sack(-17.8, 4.5, { r: 0.32, seed: 22 });
    kit.brazier(-18.4, 5.8, { lit: true, light: 3.2, seed: 23 });
    // the tended tally door: an offering pair + amber cloth — lit = watched = theirs
    kit.brazier(-14.5, -2.2, { lit: false, seed: 24 });
    kit.brazier(-14.5, 2.2, { lit: false, seed: 25 });
    kit.banner(-14.28, 2.4, 0, Math.PI / 2, { w: 1.1, color: 0xffb46a, seed: 26 });
  }

  // ===== E2 · SHŌ — "THE FORK: WHERE THE DARK IS SAFE" (floor + store + gallery) =====
  {
    const clearC = [
      { x0: -10, z0: -1.5, x1: 10, z1: 1.5, pad: 0.4 },   // the central dray lane
      { x0: 6.5, z0: 2.5, x1: 10, z1: 7.5, pad: 0.2 },    // approach to the store door
      { x0: 6.5, z0: -7.5, x1: 10, z1: -2.5, pad: 0.2 },  // approach to the gallery door
      { x: 0, z: 0, r: 1.6 },                             // the crossroads lamp
      { x: -6, z: -7, r: 1.3 },                           // the hoist post
    ];
    // the draining racks: two free rows of hung lanterns dripping into barrels —
    // the work floor's aisles. Their shadow lanes are the service route.
    kit.wallRun(-7, 6.4, 7, 6.4, [{ prop: "deadLantern", w: 2 }, "barrel"],
      { spacing: 2.0, inset: 0, face: "wall", rotJitter: 0.08, clear: clearC, seed: 12 });
    kit.wallRun(-7, -6.4, 7, -6.4, [{ prop: "deadLantern", w: 2 }, "barrel"],
      { spacing: 2.0, inset: 0, face: "wall", rotJitter: 0.08, clear: clearC, seed: 14 });
    kit.pillar(0.6, 3.2, -6, -7);                         // the rack-hoist post [KEPT pillar]
    kit.chains(-6, -7, { y: 3.1, len: 1.6, seed: 7 });    // its idle tackle
    // stock waiting for rack space, squared off the lanes
    kit.cluster(-6.5, 3.6, ["crateStack", "barrel"], { count: 3, footprint: 1.1, clear: clearC, seed: 12 });
    kit.cluster(5.5, -3.6, ["sack", { prop: "crate", w: 2 }], { count: 3, footprint: 1.1, clear: clearC, seed: 14 });
    // the NO-FLAME tell at the store mouth: workers park their lamps HERE
    // before entering the oil store. The dark throat is dark on purpose.
    kit.cluster(8.4, 8.4, [{ prop: "deadLantern", w: 1 }],
      { count: 3, footprint: 0.6, backDir: Math.atan2(1, 1), clear: clearC, seed: 16 });

    // THE OIL STORE (north fork): a kept store, not a ruin — barrels in a tight
    // rank under their hoist chains. Dark because oil and flame do not meet.
    const clearU = [
      { x0: 11, z0: 4.2, x1: 23, z1: 5.8, pad: 0.4 },     // the Cellar-Blind's aisle (z≈5)
      { x: 17, z: 5, r: 1.0 },                            // capU cache
      { x0: 10, z0: 3, x1: 11.5, z1: 7, pad: 0.2 },       // west mouth
      { x0: 22.5, z0: 3, x1: 24, z1: 7, pad: 0.2 },       // east door to the court
    ];
    kit.wallRun(11.5, 8.15, 23, 8.15, [{ prop: "barrel", w: 3 }, "sack"],
      { spacing: 1.35, inset: 0, face: "wall", jitter: 0.06, rotJitter: 0.1, clear: clearU, seed: 18 });
    kit.chains(14, 8.0, { y: 3.0, len: 1.5, seed: 8 });   // barrel-hoist tackle over the rank
    kit.chains(20, 8.0, { y: 3.0, len: 1.5, seed: 9 });
    kit.sack(22.6, 3.9, { r: 0.36, seed: 10 });           // wick-spares dumped by the court door

    // THE WICK GALLERY (south fork): the lit bench row — benches, wick bins,
    // the bench-lamp mid-aisle, amber cloth on the wall. Tended = theirs.
    const clearL = [
      { x0: 11, z0: -5.8, x1: 23, z1: -4.2, pad: 0.4 },   // the bench-ward's aisle (z≈-5)
      { x0: 10, z0: -7, x1: 11.5, z1: -3, pad: 0.2 },     // west mouth
      { x0: 22.5, z0: -7, x1: 24, z1: -3, pad: 0.2 },     // east door to the court
      { x: 19.8, z: -7.3, r: 1.0 },                       // the abandoned bench (TABLEAU 3's gap in the row)
    ];
    kit.wallRun(11.5, -8.15, 23, -8.15, [{ prop: "crate", w: 2 }, "barrel", "sack"],
      { spacing: 1.7, inset: 0, face: "wall", clear: clearL, seed: 26 });
    // TABLEAU 3: one bench abandoned mid-pull — the bench dragged out of the
    // row, the wick-sack spilled, the puller's stool still facing the work.
    kit.crate(19.8, -7.25, { rot: 0.1, seed: 27 });
    kit.sack(19.0, -6.95, { r: 0.34, seed: 28 });
    kit.crate(20.6, -6.85, { size: 0.62, rot: -0.12, seed: 29 });
    kit.banner(17, 2.4, -8.72, 0, { w: 1.0, color: 0xffb46a, seed: 30 }); // amber over the benches
  }

  // ===== E3 · SHŌ — "THE LIGHTING COURT, WHERE NOISE COSTS" ==================
  // The warden's yard: the flame queue waits, his supper goes cold, and there
  // is no guard — dousing his eve-lamp here is the loud act with no bill, so
  // E4's identical act WITH a bill lands as a Turn.
  {
    const clearF = [
      { x0: 24, z0: -1.5, x1: 38, z1: 1.5, pad: 0.4 },    // the rejoin / processional lane
      { x: 29, z: 4, r: 1.4 },                            // the eve-lamp
      { x: 29, z: -4, r: 1.0 },                           // capF cache
      { x0: 24, z0: 3, x1: 26.5, z1: 7, pad: 0.2 },       // store-door mouth
      { x0: 24, z0: -7, x1: 26.5, z1: -3, pad: 0.2 },     // gallery-door mouth
    ];
    // TABLEAU 4: the flame queue — refit lanterns in a dressed rank along the
    // north wall, dark, each waiting its turn at the great flame.
    kit.wallRun(26, 8.3, 33, 8.3, [{ prop: "deadLantern", w: 1 }],
      { spacing: 1.5, inset: 0, face: "wall", jitter: 0.04, rotJitter: 0.06, clear: clearF, seed: 32 });
    // the warden's wick-cart and stores, loaded for the morning round [KEPT cover]
    kit.cluster(31.5, 5.8, ["cart", { prop: "crateStack", w: 2, foot: 0.8 }, "barrel"],
      { count: 4, footprint: 1.3, backDir: Math.atan2(1, 1), clear: clearF, seed: 34 });
    kit.corner({ x0: 24, z0: -9, x1: 34, z1: 9 }, "se",
      ["barrel", "sack", { prop: "crate", w: 2 }], { count: 3, clear: clearF, seed: 36 });
    kit.cluster(27.5, -6.5, ["sack", "crate", "barrel"],
      { count: 3, footprint: 1.0, backDir: Math.PI, clear: clearF, seed: 38 }); // [KEPT south-edge cover]
    kit.brazier(31.8, -6.8, { lit: false, seed: 39 });    // his supper brazier, gone cold
  }

  // ===== E4 · TEN — "THE GREAT LANTERN" (the hall + the altar) ===============
  // The showcase and the Turn in one room: the master flame on its standard is
  // the hall's ONLY light. Pale piers and statues catch it; the altar's two
  // small flames (the only fire the Vigil permits beside it) are all that
  // survive the douse. The rite-ward walks the pool between you and the rod.
  {
    const clearG = [
      { x0: 44, z0: -5, x1: 44, z1: 5, pad: 0.7 },        // the rite-ward's crossing + the standard
      { x0: 38, z0: -1.5, x1: 54, z1: 1.5, pad: 0.3 },    // the altar approach — keep the crossing legible
      { x: 50, z: 0, r: 1.4 },                            // the altar
    ];
    kit.pillar(0.55, 3.4, 46, 6, palePier);               // the hall's two roof piers [KEPT cover spots]
    kit.pillar(0.55, 3.4, 42, -6, palePier);
    // the snuffing altar: lamp-priest statues flank the rod N/S of the approach,
    // offering urns at its feet, the altar flames burning low beside it —
    // fixtured light the Vigil pays for its holiest object (they outlive the douse).
    kit.flank(50, 0, "statue", { gap: 2.4, dir: 0, face: "in", clear: clearG, seed: 40 });
    kit.urn(49.2, 2.0, { scale: 0.8, seed: 41 });
    kit.urn(50.8, -2.0, { scale: 0.8, seed: 42 });
    kit.brazier(47.8, 2.5, { lit: true, light: 2.6, seed: 43 });
    kit.brazier(47.8, -2.5, { lit: true, light: 2.6, seed: 44 });
    kit.banner(53.72, 2.6, 0, -Math.PI / 2, { w: 1.1, color: 0xffd76a, seed: 45 }); // behind the altar
    kit.banner(44, 2.8, 9.72, Math.PI, { w: 1.2, color: 0xffb46a, seed: 46 });      // rite cloth either side of the flame
    kit.banner(44, 2.8, -9.72, 0, { w: 1.2, color: 0xffb46a, seed: 47 });
    kit.fogPatch(38, -10, 54, 10, { density: 0.024 });    // (volumetrics on: the pool becomes a dome that dies) — kept thickest of the play zones, the douse showcase
  }

  // ===== E5 · KETSU — "THE WAKING LAMPS" (the porch) =========================
  {
    const clearH = [
      { x0: 58, z0: -1.5, x1: 66, z1: 1.5, pad: 0.4 },    // the bearers' lane to the gate
      { x0: 59.4, z0: -4, x1: 60.6, z1: 4, pad: 0.4 },    // the walk-ward's line (x≈60)
      { x: 62, z: 0, r: 1.6 },                            // the rift
      { x: 62, z: 4, r: 0.9 },                            // the gate watch-lamp post
    ];
    // dead-lantern gateposts frame the rift — the muster point's own fixtures [KEPT]
    kit.flank(62, 0, "deadLantern", { gap: 2.0, dir: 0, clear: clearH, seed: 48 });
    // the funnel of offering urns down the flame walk [KEPT]
    kit.leadingLine(54.5, 0, 60, 0, { prop: "urn", opts: { scale: 0.8 } },
      { spacing: 2.4, offset: 1.2, face: "in",
        clear: [{ x0: 54, z0: -0.4, x1: 66, z1: 0.4, pad: 0.1 }], seed: 50 });
    // the bearers' parked carry-lamps by the gate, and the walk-ward's stool
    kit.cluster(64.6, -4.4, [{ prop: "deadLantern", w: 2 }, "sack"],
      { count: 3, footprint: 0.8, backDir: Math.atan2(1, -1), clear: clearH, seed: 52 });
    kit.crate(58.9, 5.0, { size: 0.7, rot: 0.1, seed: 54 });
  }

  // ================= inscriptions (lore — two voices only) ==================== [KEPT texts]
  kit.inscription(0, 2.45, 9.7, "THE LAMPS REMEMBER EVERY HAND THAT FED THEM", Math.PI, "#ffb46a"); // Vigil liturgy over the racks
  kit.inscription(17, 2.2, 8.7, "IT DOES NOT SEE. IT LISTENS.", Math.PI, "#7a6bb0");                // Hush's read of the store's keeper
  kit.inscription(38.3, 2.4, 3.2, "TAKE ONLY WHAT THE DARK WILL CARRY", Math.PI / 2, "#ffd76a");    // at the rite door

  // ================= the gate watch-lamps (the wake, after the theft) ========= [KEPT logic]
  // Dark bracket-lanterns at the flame walk and the bearers' gate — real poles,
  // dead cages — that flare amber when the Everwick leaves its altar: the gate
  // itself turning on to catch you.
  for (const [x, z, seed] of [[56, 1.1, 56], [62, 4, 57]]) {
    kit.deadLantern(x, z, { h: 2.8, seed });              // the visible fixture
    const l = new THREE.PointLight(0xff8866, 0, 12);
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
    bag.dormant.push({ light: l, fixture: flare, target: 8 });
  }

  // ================= the moon ================================================= [KEPT 0.55]
  // Thin and high — enough to walk by, never enough to read by. The yards'
  // pools of meaning are all lamp-made; there are NO invisible fills (Law 2):
  // every other light in the level hangs on a pole or sits in a brazier bowl.
  // colour carries the render boost; intensity (what the meter reads) stays TUNE.moon
  const moonColor = new THREE.Color(TUNE.moonHue).multiplyScalar(TUNE.moonBoost);
  const moon = new THREE.DirectionalLight(moonColor, TUNE.moon);
  moon.position.set(-14, 22, 8);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);

  // ================= checkpoints ============================================== [KEPT]
  kit.checkpoint(-36, 0, 3);
  kit.checkpoint(-21, 0, 3.5);
  kit.checkpoint(0, 0, 3);
  kit.checkpoint(17, -5, 2.5, 12.5, -7.5);   // trigger KEPT under the bench-lamp; respawn nudged to the dimmer SW corner, off the bench-ward's z-5 / x13-21 beat
  kit.checkpoint(29, 0, 3.5);
  kit.checkpoint(46, 0, 3.5);
  kit.checkpoint(62, 0, 3);

  // ================= triggers / teaching ====================================== [KEPT ids + positions]
  kit.trigger("start", -34, 0, 2.5);
  kit.trigger("chokeB", -24, 0, 5);
  kit.trigger("hub", 0, 0, 6);
  kit.trigger("upperWarn", 12, 5, 3);
  kit.trigger("lowerWarn", 12, -5, 3);
  kit.trigger("convergence", 25, 0, 4);
  kit.trigger("relicRoom", 39, 0, 4);
  kit.trigger("escapeCorr", 55, 0, 3);

  bag.stage = 0;
  bag.objective = "Find a way through the Dousing Yards";
  // Prompts terse + mechanic-focused [KEPT]; the world-building lives in the
  // props, the composition, and the inscriptions — not the HUD.
  bag.onStart = (game) => game.hud.prompt("Void vials ride your palm — spend them on the light.", 4);
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "start":
        if (bag.stage === 0) {
          bag.stage = 1;
          p.prompt("Shadow hides you. Head east.", 3.5);
        }
        break;
      case "chokeB":
        if (bag.stage === 1) {
          bag.stage = 2;
          game.setObjective("Douse the torch and slip through");
          p.prompt(game.isTouch
            ? "Torchlight pins the door — tap <b>◍</b> to douse it. The shatter is its own thunder."
            : "Torchlight pins the door — press <span class='keycap'>Q</span> to douse it. The shatter is its own thunder.", 5);
        }
        break;
      case "hub":
        if (bag.stage === 2) {
          bag.stage = 3;
          game.setObjective("Choose your way east");
          p.prompt("Two ways east: south lit, north dark.", 3.5);
        }
        break;
      case "upperWarn":
        if (!bag._upperSeen) {
          bag._upperSeen = true;
          p.prompt("The Snuffed hunts by ear — stay silent, never douse near it.", 4);
        }
        break;
      case "lowerWarn":
        if (!bag._lowerSeen) {
          bag._lowerSeen = true;
          p.prompt("A lit hall — douse the torch and pass.", 3.5);
        }
        break;
      case "convergence":
        if (bag.stage === 3) {
          bag.stage = 4;
          game.setObjective("Reach the relic chamber");
          p.prompt("Ahead, a vault kept too bright.", 3.5);
        }
        break;
      case "relicRoom":
        if (bag.stage === 4) {
          bag.stage = 5;
          game.setObjective("Take the relic beyond the light");
          p.prompt("Douse the great lantern on the guard's turn, then take the relic.", 4);
        }
        break;
      case "escapeCorr":
        if (game.scepterTaken && !bag._escapeSeen) {
          bag._escapeSeen = true;
          p.prompt("The rift is close — run.", 3);
        }
        break;
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.3;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    // one brief beacon line for the beacon-flight beat (the mission's KETSU). [KEPT]
    game.hud.prompt("The relic blazes — every lamp knows your shape now. <b>RUN.</b>", 3.5);
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 7 + tc.x));
    }
    // the gate watch-lamps flare after the theft [KEPT]
    if (game.scepterTaken && bag.alarmT === undefined) bag.alarmT = 0;
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
    if (bag.extract) {
      bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
    }
  };

  bag.startVials = 3;                                     // [KEPT] — the vial through-line (M2 grants 3)
  return bag;
}
