import * as THREE from "three";
import { makeKit } from "../levelKit.js";
import { workRank, vigilShrine } from "./_dressing.js";

/**
 * MISSION 7 — THE SPIRE ASCENT  (level index 6) — THE VIGIL SPIRE.
 *
 * ============================== SITE DOSSIER =================================
 * WHAT: The Candent Vigil's administrative bell-spire — the order's HOME: the
 *   house that rings the hours for all Lanternspire and keeps the Pharos, the
 *   Great Eye, roosted at its crown. Discipline made stone: a gate cloister,
 *   the refectory and scriptorium stacked in the spire's core, the brothers'
 *   cells, the grand processional stair rising to the belfry, and beyond the
 *   bells a bare span to the roost where the Eye watches the one approach it
 *   was built to watch.
 * WHO: the PRIOR (rules the house; his proof-desk stands at the scriptorium's
 *   head); the PORTER (minds the cloister doors after the gate is barred); the
 *   STAIR-WARDS (call the hours up and down the processional flight); the
 *   BROTHERS (asleep in the cells — their lamps burned to violet dregs); the
 *   BELL-WARDS (keep the belfry deck and its ropes); the UNLIT (blind Snuffed
 *   penitents the order keeps where flame is not wanted: the dorter, the
 *   hoist, and under the bells); the ROOST-KEEPER and his MATE (feed the Eye
 *   its oil each night and meet at its foot to trade the watch).
 * PARTI: gate cloister → the offices (refectory → scriptorium, stacked in the
 *   core) → UP: the processional stair (west, lit, liturgical) or the bell-
 *   hoist way (east, dark, through the cells) → the BELFRY DECK over the
 *   columned undercroft → the warden's descent to the bridgehead forecourt →
 *   the roost span over the crown chasm — raked end to end by the Eye — → the
 *   roost court (the keepers' yard at the Eye's foot) → the crown shrine and
 *   the rift. The stair exists because the bells and the Eye are HIGH; every
 *   corridor is a procession route, and the Eye watches its own approach.
 * WHY THE RELIC IS HERE: there is none (canon, kept from the shipped level) —
 *   the Spire is the one mission Hush climbs THROUGH the order's house rather
 *   than robbing it; the prize is the rift at the crown, and the house itself
 *   is the treasure the Vigil guards: its hours, its bells, its Eye.
 * TABLEAUX: (1) the returned procession — the evening's route-lanterns ranked
 *   along the cloister's west walk, the oil cart half-unloaded at the porter's
 *   lodge; (2) the abandoned meal — refectory benches pushed back, supper left
 *   mid-bite the night the Eye called every eye to the roost; (3) ON THE
 *   HEIGHTS: the rope-splice — a bell-rope taken down and left mid-work on
 *   the belfry's east arm, the bell-ward's cold hand-pan beside it, tackle
 *   idle overhead; (4) the Eye's feeding — the oil sledge stopped mid-carry
 *   at the roost tower's foot, the keeper's supper interrupted at his lodge.
 * THE NIGHT SHIFT: the PORTER walks the cloister's door walk, pausing at the
 *   west and east passage doors. The LOWER STAIR-WARD walks the stair-foot
 *   hall; the UPPER STAIR-WARD walks the flight-head above him — they call
 *   the hour up and down the flight, a watch kept in pairs one landing apart.
 *   Three BELL-WARDS keep the belfry deck (west arm, the sounding dais, the
 *   rope store); beneath the bells a blind UNLIT paces the undercroft, set
 *   there to hear what the bells' loudness would mask. Two more UNLIT keep
 *   the dorter walk and the hoist chamber — no flame among the sleepers. The
 *   ROOST-KEEPER and his MATE round the roost court and meet at the Eye's
 *   foot brazier to trade the watch. Two CROWN WARDS walk the shrine before
 *   the rift. And the PHAROS itself — deaf, unblinking — stares down the span
 *   and the forecourt, the approach it was built to watch.
 * =============================================================================
 *
 * Beats (REDESIGN_5-8 M7; RELIEVE/MISSING-WATCH is pending author approval, so
 * its social grammar is realized as READABLE ROSTER FICTION — paired watches
 * with shared pause-points — not engine mechanics; the safe-devour teaching
 * stands: the Unlit are loners, the sighted watch in pairs):
 *   E1 KI    — THE CLOISTER    : one slow porter, a lit door, a dark garth.
 *   E2 SHŌ   — THE LIT STAIR   : the processional flight — moon-blades through
 *              the lancets, station lamps (douseable), stair-wards above and
 *              below. Climb seen, or buy dark, or take the other way.
 *   E3 SHŌ   — THE DARK WAY    : dorter and hoist — blind Unlit, moss, dreg
 *              lamps; the safe place to be a monster (loners tell no one).
 *   E4 TEN   — THE BELFRY      : both ways top out on the bell deck — three
 *              wards, a singing crystal dais, and a listener underneath.
 *   E5 TEN   — THE SPAN        : the bridgehead forecourt and the roost span,
 *              raked by the Pharos over the crown chasm.  [KEPT beat]
 *   E6 KETSU — THE ROOST/CROWN : the keepers' paired round, then the rift.
 *
 * SHOWCASE — GOD-RAY SHAFTS ON THE PROCESSIONAL STAIR: the flight's west wall
 * is a lancet wall — real slit openings between kit.wall runs (sills block the
 * blob) — and the moon stands low WNW behind them, so hard blades of moonlight
 * rake down the treads; fogPatch zones on the flight, the belfry and the span
 * turn the blades and the Eye's beam into visible shafts when volumetrics are
 * ON. With everything OFF the same openings still paint legible bright lanes
 * on the stairs (a real DirectionalLight through real gaps), the station lamps
 * are real fixtured PointLights, and the Eye's redesigned gaze (ground pool +
 * thin ray) reads at any setting. No emissive-NEE area lights; glow is
 * rtExclude; the shipped level's four invisible fill lights are REMOVED — their
 * duty moved into the moon (0.55 → 0.7) and two fixtured watch-pan braziers.
 *
 * Difficulty is the shipped roster, verbatim: 13 wardens (10 sighted, 3 blind
 * Snuffed) with the same speed/pause/range/cone numbers; the same 11 lamps
 * (intensity/range kept, incl. the two violet dreg-lamps); the Great Eye with
 * identical parameters at the same relative post (far end of the crossing,
 * staring back down it); 4 vials, 0.65 blink recharge, two 2-vial caches, two
 * maw motes, four checkpoints at the shipped spacing. Only the architecture
 * moved. Verticality: platforms/ramps only (blink cannot ascend tiers); paths
 * that must not loop through walls are explicit A-B-C-B rounds.
 */

// TUNE — the knobs we actually reach for. Guard/lamp/Eye numbers are [KEPT]
// from the shipped level — the architecture moved, the difficulty did not.
const TUNE = {
  moon: 0.7,                                            // raised 0.55→0.7: the four removed invisible fills' duty lives here + in the fixtures
  moonFrom: [-30, 16, 6],                               // low WNW — blades through the west lancets, long shadows east
  gate:      { intensity: 5,  range: 8 },               // the cloister's liturgy lamp over the refectory door   [KEPT 5/8]
  stairFoot: { intensity: 9,  range: 10 },              // lower station lamp at the flight's foot               [KEPT 9/10]
  stairHead: { intensity: 8,  range: 9, scale: 1.6 },   // upper station lamp at the flight's head (deck-height) [KEPT 8/9]
  dreg:      { intensity: 2.2, range: 5, color: 0x6a5aa0 }, // the brothers' vigil-lamps, burned to violet dregs [KEPT 2× 2.2/5]
  belfry:    { intensity: 8,  range: 11, scale: 1.6 },  // the two belfry standards (dais + rope store)          [KEPT 2× 8/11]
  span:      { intensity: 11, range: 16 },              // the span's warding lamp, mid-crossing                 [KEPT 11/16]
  lodge:     { intensity: 5,  range: 8 },               // the roost-keeper's lodge lamp                         [KEPT 5/8]
  store:     { intensity: 5,  range: 8 },               // the oil-store door lamp                               [KEPT 5/8]
  crown:     { intensity: 6,  range: 9 },               // the crown shrine lamp                                 [KEPT 6/9]
  vPorter:    { speed: 1.3,  pause: 1.5, range: 11 },   // the porter, door walk                                 [KEPT]
  vStairLow:  { speed: 1.6,  pause: 1.0, range: 12 },   // lower stair-ward, stair-foot hall                     [KEPT]
  vStairHigh: { speed: 1.4,  pause: 1.2, range: 10 },   // upper stair-ward, flight head (deck)                  [KEPT]
  sDorter:    { speed: 1.0,  pause: 2.0, blind: true }, // the Unlit of the dorter walk                          [KEPT]
  sHoist:     { speed: 0.95, pause: 2.2, blind: true }, // the Unlit of the hoist chamber                        [KEPT]
  sUnder:     { speed: 0.9,  pause: 2.5, blind: true }, // the Unlit under the bells (undercroft)                [KEPT]
  vBellW:     { speed: 1.4,  pause: 1.0 },              // bell-ward, west arm                                   [KEPT]
  vBellDais:  { speed: 1.5,  pause: 0.9 },              // bell-ward, the sounding dais                          [KEPT]
  vBellE:     { speed: 1.3,  pause: 1.1 },              // bell-ward, the rope store                             [KEPT]
  vKeeper:    { speed: 1.4,  pause: 1.0 },              // the roost-keeper, west round                          [KEPT]
  vMate:      { speed: 1.5,  pause: 0.9 },              // his mate, east round                                  [KEPT]
  vCrownWalk: { speed: 1.3,  pause: 1.2 },              // crown ward, the shrine walk                           [KEPT]
  vCrownRift: { speed: 1.2,  pause: 1.4, range: 10 },   // crown ward, the rift round                            [KEPT]
  eye: { dir: Math.PI / 2, sweep: 0.9, sweepSpeed: 0.6, range: 22, coneAngle: 0.24, height: 3.2 }, // the Pharos [KEPT, all]
  deck: { y: 2.5 },                                     // the belfry tier
};

export function buildSpire() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "spire";
  bag.name = "THE SPIRE ASCENT";
  bag.spawn.set(0, 0.42, 40.5);
  bag.bounds = { x0: -18, z0: -48, x1: 18, z1: 46 };
  bag.startVials = 4;                                   // [KEPT]
  bag.blinkCdMul = 0.65;                                // [KEPT]

  const DECK = TUNE.deck.y;
  // lift a prop group onto the belfry tier (props build at ground height)
  const lift = (grp, y = DECK + 0.04) => { grp.position.y += y; return grp; };

  // ======================= A · THE GATE CLOISTER (x -16..16, z 28..44) =======
  // --- The order's front room: a walled garth the brothers circle and never
  // --- cross — walks of obsidian, the lawn swept moss, the founder's statue
  // --- at its centre. The mountain gate (barred at dusk) opens gateward; the
  // --- three passage doors open spireward: stair, refectory, dorter. The
  // --- porter's lodge keeps the south-east corner. The Vigil lights its own
  // --- liturgy over the refectory door and nothing else — the sacred lawn is
  // --- dark, and nobody walks on it. Hush does.
  kit.floor(34, 16, 0, 36);
  kit.surface(-16, 28, 16, 32, "obsidian");             // door walk
  kit.surface(-16, 40, 16, 44, "obsidian");             // gate walk
  kit.surface(-16, 32, -8, 40, "obsidian");             // west walk
  kit.surface(8, 32, 16, 40, "obsidian");               // east walk (the lodge's)
  kit.surface(-8, 32, 8, 40, "moss");                   // the garth — swept, silent, unwalked
  kit.wall(-16, 44, -2, 44, { h: 3.6 });                // gate wall, west of the arch (owns (-16,44),(-2,44))
  kit.wall(2, 44, 16, 44, { h: 3.6 });                  // gate wall, east of it (owns (2,44),(16,44))
  kit.railing(-2.15, 44, 2.15, 44, { y: 0, h: 2.3, t: 0.4 });   // the barred mountain gate — the road home, closed
  kit.railing(-2.3, 44, 2.3, 44, { y: 2.9, h: 0.62, t: 0.46 }); // its lintel (banded — nothing stands on a gate)
  kit.wall(-16, 28, -16, 44, { h: 3.4, piers: false }); // west range wall (corners owned by neighbours)
  kit.wall(16, 28, 16, 44, { h: 3.4, piers: false });   // east range wall
  // the south range — three passage doors, jambs piered (a colonnaded range):
  kit.wall(-16, 28, -12.7, 28, { h: 3.5 });             // owns (-16,28) + the stair door's west jamb
  kit.wall(-9.3, 28, -1.7, 28, { h: 3.5 });             // between stair and refectory doors
  kit.wall(1.7, 28, 6.6, 28, { h: 3.5 });               // between refectory and dorter doors
  kit.wall(10.2, 28, 16, 28, { h: 3.5 });               // owns the dorter door's east jamb + (16,28)
  kit.torch(0, 29.3, TUNE.gate);                        // the liturgy lamp — the Vigil lights its own words
  // the founder in the garth — lit by nothing; the order knows him by heart
  kit.statue(0, 36.5, { h: 2.9, rot: Math.PI, seed: 3 });
  vigilShrine(kit, 0, 36.5, { gap: 1.6, urnScale: 0.85, dir: Math.PI / 2, seed: 4 });
  kit.guard([[-7, 30.2], [7, 30.2]], TUNE.vPorter);     // THE PORTER — walks the door walk, pauses at the passage doors

  // ======================= B · THE STAIR-FOOT HALL (x -16..-6, z 19..28) =====
  // --- Where the procession forms up before the climb: the west range's
  // --- ground room, ranked with the route-lanterns the evening procession
  // --- carried home. The lower station lamp burns at the flight's foot; the
  // --- LOWER STAIR-WARD walks the hall and calls the hour up the flight.
  kit.floor(10, 9, -11, 23.5);
  kit.surface(-16, 19, -6, 28, "obsidian");
  kit.wall(-16, 19, -16, 28, { h: 3.4, piers: false }); // west wall of the hall (below the lancet wall)
  kit.pier(-16, 19, 4.5);                               // buttress where hall wall meets lancet wall
  kit.wall(-6, 7, -6, 28, { h: 4.6 });                  // the core wall: stair hall | refectory + scriptorium (owns (-6,7),(-6,28))
  kit.torch(-11, 20.2, TUNE.stairFoot);                 // the lower station lamp — douseable: dark buys the flight
  kit.guard([[-14, 24.5], [-8, 24.5], [-11, 20.8], [-8, 24.5]], TUNE.vStairLow); // LOWER STAIR-WARD — hall round with the hour-call pause at the flight's foot

  // ======================= C · THE PROCESSIONAL FLIGHT (x -16..-6, z 7..19) ==
  // --- The grand stair itself: one shallow ceremonial ramp the full width of
  // --- the west range, climbing to the belfry. Its west wall is the LANCET
  // --- WALL — three tall slits between wall runs, silled at knee height — and
  // --- the moon stands behind them: blades of light rake the treads (the
  // --- showcase). The Vigil climbs in the light on purpose. ASCEND SEEN.
  kit.ramp(-15.85, 7, -6.15, 19, { axis: "z", y0: 2.5, y1: 0, mat: kit.mats.block, surface: "obsidian" }); // edges tuck under both walls — no void sliver

  // lancet wall (x -16): runs deliberately short of each slit so the th/2
  // overshoot leaves a 0.6 clear opening; sills block the blob, light passes.
  kit.wall(-16, 7, -16, 9.5, { h: 4.4, piers: false });
  kit.wall(-16, 10.5, -16, 13.0, { h: 4.4, piers: false });
  kit.wall(-16, 14.0, -16, 16.5, { h: 4.4, piers: false });
  kit.wall(-16, 17.5, -16, 19, { h: 4.4, piers: false });
  kit.solid(0.46, 0.95, 1.1, -16, 10, kit.mats.wall);   // lancet sills — knee-height masonry in each slit
  kit.solid(0.46, 0.95, 1.1, -16, 13.5, kit.mats.wall);
  kit.solid(0.46, 0.95, 1.1, -16, 17, kit.mats.wall);
  kit.pier(-16, 7, 4.9);                                // buttress at the flight's head
  // the wall under the flight's head seals the cavity beneath the high treads.
  // HEIGHT-BANDED (kit.railing, 0..2.3): a kit.wall here registers a full-height
  // collider that invisibly walls the ramp→deck seam at z=7 (the flight tops out
  // at y2.5 exactly where the west arm begins) — the band seals the ground cavity
  // and lets the deck crossing pass over. Endpoints keep the th/2 overlap.
  kit.railing(-16.18, 7, -5.82, 7, { y: 0, h: 2.3, t: 0.36, mat: kit.mats.wall });
  kit.fogPatch(-15.8, 7, -6.2, 19, { density: 0.05 });  // volumetrics ON: the lancet blades become shafts down the stair

  // ======================= D · THE REFECTORY (x -6..6, z 17..28) =============
  // --- The brothers' table hall, the core's first room: two bench-tables in
  // --- rows, the hearth-pan cold on the west wall. TABLEAU 2: the meal was
  // --- abandoned mid-bite — benches pushed back, bowls left — the night the
  // --- Eye called every eye to the roost. Nobody has sat since.
  kit.floor(12, 11, 0, 22.5);
  kit.surface(-6, 17, 6, 28, "obsidian");
  kit.wall(6, 7, 6, 28, { h: 4.6 });                    // the core wall: offices | dorter range (owns (6,7),(6,28))
  kit.wall(-6, 17, -1.7, 17, { h: 4.4 });               // refectory | scriptorium wall, west of the door (owns (-6,17)*,(-1.7,17))
  kit.wall(1.7, 17, 6, 17, { h: 4.4, piers: false });   // east of it ((6,17) owned by the core wall run)
  kit.pier(1.7, 17, 4.6);                               // the door's east jamb

  // ======================= E · THE SCRIPTORIUM (x -6..6, z 7..17) ============
  // --- The order's writing floor, deepest office of the core: two desk ranks
  // --- face the aisle, the prior's proof-desk at their head. Closed at night
  // --- — the Vigil lights what it values, and the scriptorium's value sleeps
  // --- — so the room is moon and spill only: the office route's dark heart.
  kit.floor(12, 10, 0, 12);
  kit.surface(-6, 7, 6, 17, "obsidian");
  kit.wall(-6, 7, -1.7, 7, { h: 4.6, piers: false });   // scriptorium | undercroft wall, west of the door
  kit.pier(-1.7, 7, 4.8);
  kit.wall(1.7, 7, 6, 7, { h: 4.6, piers: false });     // east of the door
  kit.pier(1.7, 7, 4.8);
  kit.railing(-1.9, 7, 1.9, 7, { y: 2.35, h: 2.2, t: 0.46, mat: kit.mats.wall }); // door lintel (banded): deck walkers cannot cross the gap

  // ======================= F · THE DORTER RANGE (x 6..16, z 15..28) ==========
  // --- The brothers' cells: three low bays against the east range wall, each
  // --- with its pallet, opening onto the dorter walk. Moss underfoot — the
  // --- house keeps its sleepers in silence — and no flame but one vigil-lamp
  // --- burned down to violet dregs. The UNLIT of the walk paces past the
  // --- doors by ear. The safe place to be a monster: loners tell no one.
  kit.floor(10, 13, 11, 21.5);
  kit.surface(6, 15, 16, 28, "moss");
  kit.wall(16, 7, 16, 28, { h: 3.4, piers: false });    // east range wall ((16,28) owned by the cloister range; (16,7) by the belfry's east wall)
  kit.wall(9.4, 15, 16, 15, { h: 3.3 });                // dorter | hoist wall, east of the walk door (owns (9.4,15),(16,15))
  // the cell fronts (x 10.2) — low walls with a door gap per bay, so the moon
  // over the west range leaves the bays in their own shadow: dark, as sleep is
  kit.wall(10.2, 15.2, 10.2, 16.65, { h: 2.6, piers: false });
  kit.wall(10.2, 18.15, 10.2, 20.25, { h: 2.6, piers: false });
  kit.wall(10.2, 21.75, 10.2, 23.85, { h: 2.6, piers: false });
  kit.wall(10.2, 25.35, 10.2, 28, { h: 2.6, piers: false });
  kit.wall(10.4, 19.2, 15.8, 19.2, { h: 2.55, piers: false }); // cell partitions — ends tuck into front/range walls
  kit.wall(10.4, 22.8, 15.8, 22.8, { h: 2.55, piers: false });
  kit.torch(8.2, 21.5, TUNE.dreg);                      // the walk's vigil-lamp, burned to dregs — violet: nearly gone home
  kit.cache("dorterCache", 13.4, 21, 2);                // [KEPT n=2] in the middle cell's dark
  kit.guard([[8, 26.5], [8, 16.5]], TUNE.sDorter);      // THE UNLIT OF THE WALK — past the cell doors, by ear

  // ======================= G · THE HOIST CHAMBER (x 6..16, z 7..15) ==========
  // --- Where the bells' tackle and the house's provisions ride up: the crane
  // --- post, the staged crates, and the HOIST-WAY — the servants' ramp to the
  // --- belfry's east arm. Dark, moss-floored, kept by the second Unlit. The
  // --- dark route's climb: silent all the way to the top.
  kit.floor(10, 8, 11, 11);
  kit.surface(6, 7, 16, 15, "moss");
  kit.wall(6, 7, 11.8, 7, { h: 4.6, piers: false });    // hoist | undercroft wall, west of the ramp bay
  kit.pier(11.8, 7, 4.8);                               // the ramp bay's jamb
  kit.ramp(12.2, 7, 15.2, 15, { axis: "z", y0: 2.5, y1: 0, mat: kit.mats.wood, surface: "moss" }); // THE HOIST-WAY
  kit.pillar(0.32, 5.6, 8.8, 9.4);                      // the crane post
  kit.chains(8.8, 9.4, { y: 5.4, len: 2.9, seed: 7 });  // its idle fall — tonight nothing rides up
  kit.torch(8.2, 12.6, TUNE.dreg);                      // the hoist's dreg-lamp                                 [KEPT 2nd violet]
  kit.mawMote("hoistMaw", 9.6, 11);                     // [KEPT] the dark route's devour charge — spent where eating is free
  kit.guard([[7.6, 13.6], [10.9, 8.6]], TUNE.sHoist);   // THE UNLIT OF THE HOIST — rounds the staged goods, clear of the ramp

  // ======================= H · THE BELFRY DECK (y 2.5, z 0..7) ===============
  // --- The bell platform: the tier both climbs exist to reach. Three arms —
  // --- the west arm at the flight's head, the SOUNDING DAIS in the centre
  // --- (crystal: the bell floor is a resonant chamber, and it SINGS underfoot
  // --- — the lit route is also the loud one), and the east rope store (moss —
  // --- the ropes are coiled where silence is cheap). The great bells hang in
  // --- their timber headstocks from columns that rise out of the undercroft.
  // --- Three BELL-WARDS keep the deck; under it, a blind Unlit listens.
  kit.floor(34, 7, 0, 3.5);                             // the shoulder floor (the undercroft's ground)
  kit.platform(-16, 0, -5, 7, { y: 2.52, mat: kit.mats.block, surface: "obsidian", support: true }); // west arm
  kit.platform(-5.02, 0, 7.02, 7, { y: 2.54, mat: kit.mats.block, surface: "crystal", support: true }); // the sounding dais
  kit.platform(7.0, 0, 15.7, 7, { y: 2.5, mat: kit.mats.block, surface: "moss", support: true }); // the rope store (0.02 under-lap with the dais — decks overlap, never gap)
  // west range wall above the deck — with one high lancet over the belfry
  kit.wall(-16, 0, -16, 2.2, { h: 4.8, piers: false });
  kit.wall(-16, 3.2, -16, 7, { h: 4.8, piers: false });
  kit.railing(-16, 2.1, -16, 3.3, { y: 0, h: 3.42, t: 0.46, mat: kit.mats.wall }); // the high lancet's sill — a moon-blade lands on the deck
  kit.wall(16, -5, 16, 7, { h: 4.6 });                  // east range wall, forecourt through belfry (owns (16,-5),(16,7))
  // deck edge rail over the forecourt drop — open only at the warden's descent
  kit.railing(-12.5, 0, 15.75, 0, { y: DECK, h: 0.85, mat: kit.mats.rust });
  kit.railing(15.2, 7, 15.72, 7, { y: DECK, h: 0.85, mat: kit.mats.rust }); // stub east of the hoist-way mouth
  // THE BELL FRAME — columns out of the undercroft, beams and bells hung as
  // height-banded masses (they block eyes and heads on the deck, and nothing
  // on the floor below them):
  kit.pillar(0.42, 5.6, -3.5, 3.5);
  kit.pillar(0.42, 5.65, 1, 3.5);
  kit.pillar(0.42, 5.55, 5.5, 3.5);
  kit.railing(-3.5, 3.5, 1, 3.5, { y: 4.78, h: 0.28, t: 0.22, mat: kit.mats.wood });  // west headstock beam
  kit.railing(1, 3.5, 5.5, 3.5, { y: 4.74, h: 0.28, t: 0.22, mat: kit.mats.wood });   // east headstock beam
  kit.railing(-1.85, 3.5, -0.65, 3.5, { y: 3.4, h: 1.0, t: 1.0, mat: kit.mats.dark }); // the GREAT BELL — duck under it
  kit.railing(2.55, 3.5, 3.75, 3.5, { y: 3.44, h: 1.0, t: 1.0, mat: kit.mats.dark });  // the second bell
  kit.torch(-11, 5.2, TUNE.stairHead);                  // the upper station lamp at the flight's head (deck-height standard)
  kit.torch(1.2, 1.1, TUNE.belfry);                     // the dais standard                                     [KEPT 8/11]
  kit.torch(11.2, 1.2, TUNE.belfry);                    // the rope-store standard                               [KEPT 8/11]
  kit.fogPatch(-16, 0, 15.7, 7, { density: 0.03 });     // the crown stands in cloud — shafts through lancet + around the bells
  const gHigh = kit.guard([[-14, 4.8], [-6.8, 4.8], [-11.2, 6.2], [-6.8, 4.8]], TUNE.vStairHigh);
  gHigh.y = 2.52;                                       // UPPER STAIR-WARD — flight-head round; the hour-call pause looks down the flight
  const gBellW = kit.guard([[-14.2, 2.2], [-6.6, 2.2]], TUNE.vBellW);
  gBellW.y = 2.52;                                      // BELL-WARD, WEST ARM — the lamp-to-rail lane
  const gBellDais = kit.guard([[-3.6, 1.6], [5, 1.6]], TUNE.vBellDais);
  gBellDais.y = 2.54;                                   // BELL-WARD, THE DAIS — south of the bell row, ear to the crystal
  const gBellE = kit.guard([[8.6, 2.2], [14, 5.2]], TUNE.vBellE);
  gBellE.y = 2.5;                                       // BELL-WARD, ROPE STORE — rounds the coils to the hoist mouth

  // ======================= I · THE UNDERCROFT (ground, z 0..7) ===============
  // --- Beneath the bells: a columned service passage from the scriptorium
  // --- door to the forecourt colonnade. No lamp — the house never paid to
  // --- light its own crawlspace — so the Vigil posts what needs none: the
  // --- third UNLIT, set under the bells to hear what their loudness masks.
  // --- The shoulder is floored in the SAME stones above and below (engine
  // --- surfaces are 2D — the deck's entries resolve first for both tiers, so
  // --- the ground plates below MATCH them, made diegetic): the sounding
  // --- crystal sings on both its faces — which is exactly why the listener
  // --- is posted under it. Crossing the undercroft means crossing the song.
  kit.surface(-16, 0, -5.02, 7, "obsidian");            // under the west arm
  kit.surface(-5.02, 0, 7, 7, "crystal");               // under the dais — the singing band, visible from below
  kit.surface(7, 0, 15.7, 7, "moss");                   // under the rope store
  kit.guard([[-10, 1.6], [9, 1.6]], TUNE.sUnder);       // THE UNLIT UNDER THE BELLS — the colonnade lane, by ear

  // ======================= J · THE FORECOURT (x -16..16, z -5..0) ============
  // --- The bridgehead muster: the warden's descent lands here, the undercroft
  // --- lets out here, and the Eye's gaze reaches here — the Pharos watches
  // --- its own approach, and the approach begins at this door. Bare on
  // --- purpose: a muster floor offers nothing to hide behind but its dark.
  kit.floor(34, 5, 0, -2.5);
  kit.surface(-16, -5, 16, 0, "obsidian");
  kit.ramp(-15.5, -5, -12.5, 0, { axis: "z", y0: 0, y1: 2.5, mat: kit.mats.block, surface: "obsidian" }); // THE WARDEN'S DESCENT
  kit.wall(-16, -5, -16, 0, { h: 3.6 });                // west wall (owns (-16,-5),(-16,0))
  kit.wall(-16, -5, -2, -5, { h: 3.6, piers: false });  // span-gate wall, west of the gap
  kit.pier(-2, -5, 3.8);                                // the span gate's jambs
  kit.pier(2, -5, 3.8);
  kit.wall(2, -5, 16, -5, { h: 3.6, piers: false });    // east of the gap ((16,-5) owned by the east range wall)
  kit.trigger("courtyard", 0, -2.5, 3);                 // [KEPT id] — the convergence, now under the Eye's reach

  // ======================= K · THE ROOST SPAN (x -16..16, z -21..-5) =========
  // --- The crown chasm: the spire's split summit, bridged once. A bare spar,
  // --- no parapet — the Vigil trusts the Eye, not railings — with the span's
  // --- warding lamp burning at mid-crossing and the PHAROS at the far end,
  // --- staring back down the one approach it was built to watch. [KEPT beat:
  // --- spar x -2..2, void both sides, canyon walls, Eye params identical.]
  kit.floor(4, 16, 0, -13, kit.mats.dark, -0.18);       // base slab under the spar only — the void is real
  kit.floor(4, 16, 0, -13);                             // the walkable spar
  kit.surface(-2, -21, 2, -5, "obsidian");
  kit.hole(-15.8, -21, -2, -5);                         // west void
  kit.hole(2, -21, 15.8, -5);                           // east void
  kit.wall(-16, -21, -16, -5, { h: 8, piers: false });  // canyon walls — the split crown, sheer
  kit.wall(16, -21, 16, -5, { h: 8, piers: false });
  kit.torch(0, -13, TUNE.span);                         // the span's warding lamp — the Vigil lights what it fears for
  kit.fogPatch(-2.5, -19, 2.5, -7, { density: 0.08 });  // [KEPT] the Eye's beam threads this
  kit.greatEye(0, -21.6, TUNE.eye);                     // THE PHAROS — same post as shipped: the far end, staring back
  kit.trigger("bridge", 0, -6.8, 2.5);                  // [KEPT id]

  // ======================= L · THE ROOST COURT (x -16..16, z -35..-21) =======
  // --- The keepers' yard at the Eye's foot: the lodge on the west, the oil
  // --- store on the east, the feeding sledge between. The ROOST-KEEPER and
  // --- his MATE round their halves and MEET at the foot brazier to trade the
  // --- watch — the house watches in pairs, even here. Eat one, and the next
  // --- meeting finds only the brazier burning.
  kit.floor(34, 14, 0, -28);
  kit.surface(-16, -35, -10, -21, "moss");              // the lodge's dark margin
  kit.surface(-10, -35, 16, -21, "obsidian");
  kit.wall(-16, -21, -2, -21, { h: 3.6 });              // chasm-side wall, west of the bridgehead (owns (-16,-21),(-2,-21))
  kit.wall(2, -21, 16, -21, { h: 3.6 });                // east of it (owns (2,-21),(16,-21))
  kit.wall(-16, -35, -16, -21, { h: 3.4, piers: false });
  kit.wall(16, -35, 16, -21, { h: 3.4, piers: false });
  kit.wall(-16, -35, -10, -35, { h: 3.5 });             // crown-side wall, west shoulder (owns (-16,-35),(-10,-35))
  kit.wall(10, -35, 16, -35, { h: 3.5 });               // east shoulder (owns (10,-35),(16,-35))
  kit.wall(-10, -35, -3, -35, { h: 3.5, piers: false });// between shoulder and crown door
  kit.pier(-3, -35, 3.7);                               // crown door jambs
  kit.pier(3, -35, 3.7);
  kit.wall(3, -35, 10, -35, { h: 3.5, piers: false });
  kit.torch(-9.5, -31, TUNE.lodge);                     // the lodge lamp
  kit.torch(10, -30.5, TUNE.store);                     // the oil-store door lamp
  kit.brazier(0, -24.3, { lit: true, light: 3, seed: 21 }); // the foot brazier — where the watch is traded
  kit.fogPatch(-10, -33, 10, -21, { density: 0.04 });   // the Eye's beam and the yard lamps, threaded in crown-cloud
  kit.cache("roostCache", 13.2, -33.4, 2);              // [KEPT n=2] behind the oil store's shadow
  kit.mawMote("roostMaw", -12.5, -32.5);                // [KEPT] the yard's dark west corner
  kit.guard([[-9, -31], [-2.5, -23.5]], TUNE.vKeeper);  // THE ROOST-KEEPER — lodge to the Eye's foot
  kit.guard([[9, -31], [2.5, -23.5]], TUNE.vMate);      // HIS MATE — store to the Eye's foot; they meet at the brazier

  // ======================= M · THE CROWN SHRINE (x -10..10, z -47..-35) ======
  // --- The spire's true crown: the narrowest, oldest room in the house, where
  // --- the order keeps its first altar — and where the rift now stands. Two
  // --- hooded saints flank the aisle; two CROWN WARDS walk the shrine. The
  // --- last lit place. The last watched place.
  kit.floor(21, 12, 0, -41);
  kit.surface(-10, -47, 10, -35, "obsidian");
  kit.wall(-10, -47, -10, -35, { h: 3.6, piers: false });
  kit.wall(10, -47, 10, -35, { h: 3.6, piers: false });
  kit.wall(-10, -47, 10, -47, { h: 3.8 });              // the crown's end wall (owns its corners)
  kit.statue(-4.6, -37.2, { h: 2.7, rot: 0.5, seed: 31 });
  kit.statue(4.6, -37.4, { h: 2.7, rot: -0.5, seed: 32 });
  kit.torch(0, -38.6, TUNE.crown);                      // the shrine lamp                                       [KEPT 6/9]
  kit.extraction(0, -43);
  vigilShrine(kit, 0, -43, { gap: 1.9, urnScale: 0.9, dir: 0, seed: 33 }); // the altar's urns now flank the rift
  kit.trim(3.4, 0.2, 0, 2.4, -46.72, 0, 0x39f0c0, 2.0); // [KEPT]
  kit.guard([[-6, -39], [6, -39]], TUNE.vCrownWalk);    // CROWN WARD — the shrine walk before the saints
  kit.guard([[4, -44.5], [-4, -41.5]], TUNE.vCrownRift);// CROWN WARD — the rift round                            [KEPT diagonal]
  kit.trigger("summit", 0, -39, 3);                     // [KEPT id]

  // ==========================================================================
  // DRESSING — every prop where its user left it. Keep-clear discipline:
  // nothing intrudes on a door lane, a patrol line, a ramp mouth, the spawn,
  // a cache, a mote, or a checkpoint pad.
  // ==========================================================================

  // ===== A · THE GATE CLOISTER ==============================================
  {
    const clear = [
      { x: 0, z: 40.5, r: 2.2 },                          // spawn pad
      { x0: -7.5, z0: 29.4, x1: 7.5, z1: 31.0, pad: 0.4 },// the porter's walk
      { x0: -12.5, z0: 27, x1: -9.5, z1: 30, pad: 0.3 },  // stair door lane
      { x0: -1.7, z0: 27, x1: 1.7, z1: 30, pad: 0.3 },    // refectory door lane
      { x0: 6.8, z0: 27, x1: 10, z1: 30, pad: 0.3 },      // dorter door lane
      { x0: -2.2, z0: 42.5, x1: 2.2, z1: 44, pad: 0.3 },  // the barred gate
      { x: 0, z: 36.5, r: 2.6 },                          // the founder's garth shrine
      { x: 0, z: 29.3, r: 1.2 },                          // the liturgy lamp
    ];
    // TABLEAU 1: the returned procession — the evening's route-lanterns ranked
    // along the west walk, the oil cart half-unloaded at the porter's lodge.
    workRank(kit, -15.1, 31.5, -15.1, 41.5, { prop: "deadLantern", count: 5, face: "wall", clear, seed: 41 });
    kit.cart(11.6, 41.2, { rot: 0.14, seed: 42 });
    kit.sack(10.2, 40.4, { r: 0.32, seed: 43 });
    kit.barrel(12.8, 39.9, { seed: 44 });
    // the porter's lodge corner: stool-crate, watch-pan, the night's tally
    kit.brazier(13.2, 42.6, { lit: true, light: 3, seed: 45 }); // his watch-pan — the post's amenity (and its light pool)
    kit.crate(14.3, 41.6, { size: 0.7, rot: 0.1, seed: 46 });
    kit.banner(-4.5, 2.6, 28.32, "n", { w: 1.1, color: 0xffb46a, seed: 47 }); // range cloth beside the doors
    kit.banner(4.5, 2.5, 28.32, "n", { w: 1.1, color: 0xffd76a, seed: 48 });
  }

  // ===== B/C · STAIR-FOOT HALL + FLIGHT =====================================
  {
    const clear = [
      { x0: -14.6, z0: 20.2, x1: -7.4, z1: 25.1, pad: 0.35 }, // the lower stair-ward's round (boxed)
      { x0: -12.5, z0: 26.5, x1: -9.5, z1: 28, pad: 0.3 },    // cloister door lane
      { x0: -15.6, z0: 7, x1: -6.4, z1: 19.6, pad: 0.2 },     // the flight itself
      { x: -11, z: 20.2, r: 1.3 },                            // the lower station lamp
      { x: -11, z: 24, r: 1.4 },                              // checkpoint pad
    ];
    // the procession's spares: poles and wicks racked along the core wall
    workRank(kit, -6.9, 21, -6.9, 26.6, { prop: "deadLantern", count: 3, face: "wall", clear, seed: 51 });
    kit.cluster(-14.6, 27, ["barrel", "sack"], { count: 2, footprint: 0.8, backDir: Math.atan2(-1, 1), clear, seed: 52 });
  }

  // ===== D · THE REFECTORY ==================================================
  {
    const clear = [
      { x0: -1.7, z0: 26.5, x1: 1.7, z1: 28, pad: 0.3 },  // cloister door lane
      { x0: -1.7, z0: 17, x1: 1.7, z1: 18.5, pad: 0.3 },  // scriptorium door lane
      { x0: -0.9, z0: 17, x1: 0.9, z1: 28, pad: 0.2 },    // the aisle between the tables
    ];
    // TABLEAU 2: the abandoned meal — two bench-tables in rows, benches pushed
    // back, a bowl and bread-sack left mid-bite. The hearth-pan long cold.
    workRank(kit, -3.4, 19.5, -3.4, 25.5, { prop: "crate", propOpts: { size: 0.75 }, count: 4, face: "wall", clear, seed: 55 });
    workRank(kit, 3.4, 19.5, 3.4, 25.5, { prop: "crate", propOpts: { size: 0.75 }, count: 4, face: "wall", clear, seed: 56 });
    kit.urn(-2.5, 22.4, { scale: 0.7, tall: false, seed: 57 });  // the bowl, where it was set down
    kit.sack(2.5, 20.1, { r: 0.3, seed: 58 });                   // the bread-sack, still leaning
    kit.brazier(-5.1, 18.2, { lit: false, seed: 59 });           // the hearth-pan — cold since the drill
  }

  // ===== E · THE SCRIPTORIUM ================================================
  {
    const clear = [
      { x0: -1.7, z0: 15.5, x1: 1.7, z1: 17, pad: 0.3 },  // refectory door lane
      { x0: -1.7, z0: 7, x1: 1.7, z1: 8.5, pad: 0.3 },    // undercroft door lane
      { x0: -0.9, z0: 7, x1: 0.9, z1: 17, pad: 0.2 },     // the aisle
    ];
    // the writing floor: two desk ranks facing the aisle; the prior's
    // proof-desk at their head, his chair pushed back, the seal-urn beside it
    workRank(kit, -3.6, 9.5, -3.6, 14.5, { prop: "crate", propOpts: { size: 0.8 }, count: 3, face: "wall", clear, seed: 61 });
    workRank(kit, 3.6, 9.5, 3.6, 14.5, { prop: "crate", propOpts: { size: 0.8 }, count: 3, face: "wall", clear, seed: 62 });
    kit.crate(-4.6, 8.2, { size: 0.9, rot: 0.06, seed: 63 });    // the prior's proof-desk
    kit.urn(-3.6, 8.0, { scale: 0.8, seed: 64 });
    kit.banner(0, 3.4, 16.68, "s", { w: 1.2, color: 0xffb46a, seed: 65 }); // the order's rule, hung over the hall
  }

  // ===== F/G · DORTER + HOIST ===============================================
  {
    const clear = [
      { x0: 7.4, z0: 15.9, x1: 8.6, z1: 27.1, pad: 0.35 },   // the walk Unlit's beat
      { x0: 6.8, z0: 26.5, x1: 10, z1: 28, pad: 0.3 },       // cloister door lane
      { x0: 6.4, z0: 13.5, x1: 9.4, z1: 15, pad: 0.3 },      // walk | hoist door lane
      { x0: 7.0, z0: 8.0, x1: 11.5, z1: 14.2, pad: 0.35 },   // the hoist Unlit's beat (boxed)
      { x0: 12.2, z0: 7, x1: 15.2, z1: 15.6, pad: 0.25 },    // the hoist-way ramp
      { x: 13.4, z: 21, r: 1.2 },                            // dorterCache
      { x: 9.6, z: 11, r: 1.1 },                             // hoistMaw
      { x: 8.2, z: 21.5, r: 1.1 },                           // the dreg-lamp
      { x: 8.8, z: 9.4, r: 0.8 },                            // the crane post
    ];
    // the cells: a pallet against the east wall in each bay; the near bay
    // interrupted — its lantern knocked over in the doorway, supper unfinished
    // (the brother was called to the roost mid-rest)
    kit.cluster(14.6, 17.2, ["sack", { prop: "crate", opts: { size: 0.7 } }], { count: 2, footprint: 0.7, backDir: Math.atan2(1, 0), clear, seed: 71 });
    kit.deadLantern(11.1, 17.5, { fallen: true, rot: 2.4, seed: 72 });
    kit.sack(13.9, 16.4, { r: 0.28, seed: 73 });
    kit.cluster(14.6, 24.6, ["sack", { prop: "crate", opts: { size: 0.7 } }], { count: 2, footprint: 0.7, backDir: Math.atan2(1, 0), clear, seed: 74 });
    // the hoist's staged goods, squared to the walls, aisle clear
    kit.crateStack(6.9, 7.9, { seed: 75 });
    kit.cluster(14.8, 8.2, ["barrel", "sack"], { count: 3, footprint: 0.9, backDir: Math.atan2(1, -1), clear, seed: 76 });
  }

  // ===== H · THE BELFRY DECK (props ride the planks) ========================
  {
    // TABLEAU 3 · ON THE HEIGHTS: the rope-splice — a bell-rope taken down and
    // left mid-work on the east arm: the fallen fixture it hung from, the
    // ward's cold hand-pan, the splicer's kit, tackle idle overhead.
    lift(kit.deadLantern(13.8, 4.9, { fallen: true, rot: 0.9, seed: 81 }), 2.54);
    lift(kit.brazier(12.7, 4.2, { lit: false, seed: 82 }).group, 2.54);
    lift(kit.urn(14.5, 3.6, { scale: 0.85, seed: 83 }), 2.54); // the splicer's tallow-pot (urns carry no collider — nothing phantom below the planks)
    kit.railing(12.6, 4.6, 15.1, 4.6, { y: 4.9, h: 0.26, t: 0.2, mat: kit.mats.wood }); // the tackle beam
    kit.chains(13.9, 4.6, { y: 4.86, len: 2.1, seed: 84 });                             // its idle fall
    // the dais keeps its floor clear — the bells' floor is swept, and it sings
  }

  // ===== J/K/L · FORECOURT, SPAN, ROOST COURT ===============================
  {
    const clear = [
      { x0: -2.2, z0: -6.5, x1: 2.2, z1: 0, pad: 0.3 },      // the span-gate lane
      { x0: -15.5, z0: -5.2, x1: -12.5, z1: 0.4, pad: 0.3 }, // the warden's descent foot
      { x0: -9.2, z0: -31.6, x1: -2.1, z1: -23.1, pad: 0.35 },// the keeper's round (boxed)
      { x0: 2.1, z0: -31.6, x1: 9.2, z1: -23.1, pad: 0.35 }, // the mate's round
      { x0: -3, z0: -35, x1: 3, z1: -33, pad: 0.3 },         // crown door lane
      { x: 0, z: -24.3, r: 1.2 },                            // the foot brazier
      { x: 0, z: -21.6, r: 1.6 },                            // the Pharos tower
      { x: 13.2, z: -33.4, r: 1.2 },                         // roostCache
      { x: -12.5, z: -32.5, r: 1.1 },                        // roostMaw
      { x: 0, z: -2.5, r: 1.5 },                             // forecourt checkpoint pad
      { x: 0, z: -28, r: 1.5 },                              // roost checkpoint pad
      { x: -9.5, z: -31, r: 1.1 },                           // the lodge lamp
      { x: 10, z: -30.5, r: 1.1 },                           // the store lamp
    ];
    // the forecourt musters bare; only the descent's marker and old damage
    kit.deadLantern(-11.9, -1.2, { seed: 91 });
    kit.rubble(14.6, -3.8, { radius: 0.7, seed: 92 });
    // TABLEAU 4: the Eye's feeding — the oil sledge stopped mid-carry at the
    // tower's foot, one barrel down, the keeper's supper interrupted at the lodge
    kit.cart(5.8, -22.7, { rot: -0.18, seed: 93 });
    kit.barrel(4.7, -23.0, { seed: 94 });
    kit.barrel(6.9, -23.5, { r: 0.4, seed: 95 });
    kit.crate(-10.6, -32.4, { size: 0.8, rot: 0.08, seed: 96 }); // the keeper's table-crate
    kit.sack(-9.9, -33.2, { r: 0.3, seed: 97 });                 // his supper, unfinished
    kit.sack(-11.4, -31.6, { r: 0.34, seed: 98 });               // his cot-roll behind the lodge lamp
    // the oil store: the Eye's nightly ration, ranked along the east wall
    workRank(kit, 14.9, -33, 14.9, -25.5, { prop: "barrel", count: 4, face: "wall", clear, seed: 99 });
    kit.crateStack(14.4, -22.6, { seed: 100 });
  }

  // ===== M · THE CROWN SHRINE ===============================================
  {
    const clear = [
      { x0: -6.6, z0: -39.7, x1: 6.6, z1: -38.3, pad: 0.4 }, // the shrine walk ward
      { x0: -4.6, z0: -45.1, x1: 4.6, z1: -40.9, pad: 0.4 }, // the rift round
      { x0: -3, z0: -37, x1: 3, z1: -35, pad: 0.3 },         // crown door lane
      { x: 0, z: -43, r: 2.4 },                              // the rift + its urns
      { x: 0, z: -38.6, r: 1.2 },                            // the shrine lamp
      { x: -4.6, z: -37.2, r: 1.0 },                         // the saints
      { x: 4.6, z: -37.4, r: 1.0 },
      { x: 0, z: -40, r: 1.4 },                              // checkpoint pad
    ];
    // the first altar's furniture, kept swept: candle-urns against the walls
    kit.urn(-9.1, -44.5, { scale: 0.9, seed: 101 });
    kit.urn(9.1, -44.7, { scale: 0.9, seed: 102 });
    kit.deadLantern(-9.2, -36.2, { seed: 103 });             // the crown's old lamp — the Eye replaced it
  }

  // ================= inscriptions (two voices only) ==========================
  kit.inscription(0, 2.6, 28.32, "KEEP THE FIRES FED", "n", "#ffb46a");                           // [KEPT] the cloister liturgy, lit by its own lamp
  kit.inscription(-15.72, 2.8, 23.2, "ASCEND SEEN", "e", "#ffb46a");                              // the stair's whole doctrine, over the forming floor
  kit.inscription(0, 2.7, -4.72, "Cross where the light finds you, or not at all.", "n", "#ffb46a"); // [KEPT text] over the span gate, in the Eye's reach
  kit.inscription(6.28, 1.7, 21.5, "The dark stair remembers every foot that did not fall.", "e", "#9a86d8"); // [KEPT text] Hush, in the dorter walk
  kit.inscription(0, 3.1, -46.68, "I have climbed this before. I did not remember climbing.", "n", "#9a86d8"); // [KEPT] Hush, at the crown

  // ================= the moon ================================================
  // Low WNW behind the lancet wall: the showcase's blade-caster. NO invisible
  // fills (Law of Light) — the shipped four are removed; their duty lives in
  // this moon, the station lamps, and the two watch-pans.
  const moon = new THREE.DirectionalLight(0x8ea0cc, TUNE.moon);
  moon.position.set(...TUNE.moonFrom);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);

  // ================= checkpoints ============================================= [KEPT count + spacing]
  kit.checkpoint(0, 40.5, 3);
  kit.checkpoint(0, -2.5, 3, 0, -2.5);
  kit.checkpoint(0, -28, 3, 0, -28);
  kit.checkpoint(0, -40, 3, 0, -40);

  // ================= triggers / beats (terse; the level explains little) =====
  kit.trigger("flight", -11, 19.8, 3);                  // the flight's foot
  kit.trigger("dorter", 8, 26.2, 2.5);                  // the dark way's door
  kit.trigger("belfry", -11, 6.5, 2.5);                 // the flight's head (deck-only: the ground below is sealed)
  // "courtyard" / "bridge" / "summit" are declared with their rooms above [KEPT]

  // ================= mission logic ===========================================
  bag.objective = "Climb to the summit";                // [KEPT]
  bag.onStart = (game) => game.hud.prompt("The spire again. You always end up climbing.", 4.5); // [KEPT]
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    if (id === "flight") p.prompt("ASCEND SEEN, the stair demands. Ascend otherwise.", 4);
    if (id === "dorter") p.prompt("The brothers sleep. Even here, something listens.", 4);
    if (id === "belfry") p.prompt("You remember when bells meant weather, not watching.", 4);
    if (id === "courtyard") p.prompt("Every road up this stair was built to be watched.", 4);            // [KEPT]
    if (id === "bridge") p.prompt("Nothing under my feet but the eye deciding whether it sees me.", 4);  // [KEPT]
    if (id === "summit") p.prompt("<b>The rift is close.</b> Almost the whole of me again.", 3.5);       // [KEPT]
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 6 + tc.x)); // [KEPT flicker]
    }
    if (bag.extract) bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;   // [KEPT]
  };

  return bag;
}
