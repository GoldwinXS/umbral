import * as THREE from "three";
import { makeKit } from "../levelKit.js";
import { workRank, barredVista } from "./_dressing.js";

/**
 * MISSION 5 — THE LANTERNWAYS  (level index 4) — CLIMB.
 *
 * ============================== SITE DOSSIER =================================
 * WHAT: The canal-and-bridge lamp district of Lanternspire — still black water
 *   threading between quays, doubling every lantern that leans over it; the
 *   lamp-tenders' workshops along the back alley; and the plank GALLERY, the
 *   catwalk service road the high-tenders walk to reach the district's high
 *   lanterns. The Vigil fears its own fuel here: no flame may lean over the
 *   dark water, so every quay is parapeted and the water is watched by things
 *   that carry no flame at all.
 * WHO: the SPAN-KEEPER (master of the bridge, the wharf, and the canal-head;
 *   tolls every mooring); the HIGH-TENDERS (walk the gallery each dusk to feed
 *   the high lanterns; their perches and rails are the road over every head);
 *   the WICK-BOYS (muster at the tenders' stair, run wicks and oil to the
 *   quays, dip buckets at the water-steps); the DREDGE (two Snuffed the Vigil
 *   set on the span basin — blind, flameless, fishing dead lamps from the
 *   water by ear, because no flame may go where the water could take it).
 * PARTI: tenders' stair (muster) → the fork court → EITHER the quays (bridge →
 *   promenade → lamp-landing lane) OR the tenders' alley (workshops → the span
 *   basin, unbridged) — both let out on the north concourse. ABOVE both runs
 *   the gallery: stair-balcony → fork ramp → wharf gallery → quay gallery →
 *   drying loft → down-ramp at the basin, where the high road ends at open
 *   water (the chain-ferry is not running tonight). Lanterns flow up the ramp
 *   by day; dead lamps flow down to the dredge; water flows east under the
 *   alley culvert to the canal-head. The road over their heads exists because
 *   the lanterns are high — the catwalk goes where the flames are.
 * WHY THE RELIC IS HERE: there is none (canon — kept from the shipped level
 *   and REDESIGN_5-8 E8). The Lanternways is the one mission Hush CROSSES a
 *   district instead of robbing it; the prize is passage north, and the rift
 *   waits on the concourse dais. The level does not explain itself.
 * TABLEAUX: (1) the wick-boys' muster — the night's refit lanterns ranked
 *   along the stair-hall wall under the one reveille lamp still burning;
 *   (2) ON THE GALLERY: the re-wicking perch — a lantern taken down and left
 *   lying on the planks, the tender's cold hand-pan beside it, tackle idle
 *   overhead; (3) the span-keeper's count — his crate-desk and supper at the
 *   canal-head, the dawn cargo staged under the gallery, the crane hook empty;
 *   (4) the dredge's haul — drowned lamps fished from the basin and ranked,
 *   still dripping, along the north bank the blind things pace.
 * THE NIGHT SHIFT: the NORTH-QUAY WARD and SOUTH-QUAY WARD each walk their own
 *   lantern row end to end, pausing at the row-heads. The BRIDGE-WARD crosses
 *   the great bridge quay to quay, pausing at each bridgehead — the busiest
 *   post in the district. The WHARF-WARD paces the canal-head walk before the
 *   staged cargo. The GALLERY-WARD walks the high road itself — the Vigil
 *   knows a road over heads is still a road. In the alley, the ALLEY-WARD
 *   works the ground while the LOFT-WARD keeps the drying gallery above him.
 *   The DREDGE — two Snuffed — pace the span basin's banks by ear. THE LAST
 *   WARDEN walks the concourse line before the rift dais. Nobody guards the
 *   tenders' stair: it is a muster room, and the shift already mustered.
 * =============================================================================
 *
 * Teaches CLIMB as "choose your tier," then turns it (REDESIGN_5-8, M5):
 *   E1 KI    — THE FIRST RUNG   : the stair-hall ramp and balcony; the first
 *              look DOWN a tier. No threat.
 *   E2 KI→SHŌ— THE FORK, 3-WAY  : west alley, north quays, and the ramp UP —
 *              the third throat is over their heads. No route hint.
 *   E3 SHŌ   — OVER THE QUAYS   : the gallery crosses above the lantern rows,
 *              but the gallery-ward owns it and two high lanterns light its
 *              gaps (DOUSE buys dark). Ground alternative: the bridge, where
 *              the water carries your reflection to the wards.
 *   E4 SHŌ   — THE STACKED ALLEY: dark, forgiving, two tiers watched by two
 *              wards — which tier is a guard on becomes a question.
 *   E5 TEN   — THE SPAN BASIN   : the Turn. The high road ENDS at open water;
 *              the ferry is not running. Climb DOWN, cross low and silent
 *              past the blind dredge, and blink the black gap.
 *   E6       — THE LAMP-LANDING : the lit landing lane; the last warden's
 *              cone rakes it — douse it or time it.
 *   E7 KETSU — THE CONCOURSE CLIMB: the rift stands on a raised dais; one
 *              final small climb through the last warden's gap.
 *   E8 KETSU — THE RIFT         : exhale.
 *
 * SHOWCASE — MIRROR-WATER CANALS: three deforming mirror pools (the plaza
 * canal in two reaches + the span basin) lie under lantern rows placed AT the
 * parapet edge, so with traced reflections ON every lantern, bridge and facade
 * doubles in the still black water; the reflection is also a MECHANIC — a lit
 * crossing on the great bridge can betray you to the quay wards through the
 * water (bag.reflectors). With reflections OFF the pools stay glossy black
 * water (low-rough GGX highlight + live ripple shimmer — no emissive, no area
 * lights), and the composition still reads: lamp rows, black gaps, parapets.
 * Deforming-mesh budget: 3 pools, kit defaults (seg 48 / amp 0.03).
 *
 * Verticality vocabulary (first level allowed): kit.platform/ramp/railing.
 * All walls are kit.wall runs — overlapped joints, ONE pier per corner
 * (PLACES.md geometry hygiene); low water parapets and under-deck grates are
 * kit.railing (height-banded) so the gallery passes over what the ground
 * cannot. No invisible fills — every light is a fixtured lamp, pan, or the
 * moon. Difficulty is the shipped roster: 10 wardens, same speed/pause/range/
 * cone numbers; only their posts moved with the architecture.
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
// Guard numbers are [KEPT] from the shipped level — the architecture moved,
// the difficulty did not.
const TUNE = {
  moon: 0.7,                                            // thin high moon; the removed invisible fills' duty moved here + into fixtures
  moonFrom: [-18, 20, 6],
  reveille:  { intensity: 4,  range: 6 },               // the stair-hall's last burning lamp (E1)            [KEPT 4/6]
  forkLamp:  { intensity: 6,  range: 8 },               // the fork court's liturgy lamp (the Vigil lights its own words)
  quay:      [ { intensity: 12, range: 10 }, { intensity: 11, range: 9 }, { intensity: 12, range: 10 },
               { intensity: 13, range: 11 }, { intensity: 12, range: 10 }, { intensity: 11, range: 9 } ], // the six quay lanterns [KEPT set: 6 × 11–13 / 9–11]
  highLamp:  { intensity: 8,  range: 8, scale: 1.6 },   // the two HIGH lanterns the gallery exists to feed — douseable (E3's dark segments)
  landing:   { intensity: 6,  range: 7 },               // the lamp-landing lane's counting lamp (E6)
  deadWater: { intensity: 3,  range: 6, color: 0x9a7bff }, // the basin's two drowned-lamp standards          [KEPT]
  vQuayN:   { speed: 1.5, pause: 1.0, range: 12 },      // north-quay ward (pauses = the row-heads)           [KEPT]
  vQuayS:   { speed: 1.4, pause: 1.2, range: 12 },      // south-quay ward                                    [KEPT]
  vWharf:   { speed: 1.4, pause: 1.2, range: 12 },      // wharf-ward on the canal-head walk                  [KEPT]
  vBridge:  { speed: 1.6, pause: 0.8, range: 11 },      // bridge-ward — the busiest post                     [KEPT]
  vGallery: { speed: 1.3, pause: 1.5, range: 13, coneAngle: 0.65 }, // gallery-ward, ON the high road (y 2.5) [KEPT]
  vAlley:   { speed: 1.3, pause: 1.5 },                 // alley-ward, ground                                 [KEPT]
  vLoft:    { speed: 1.3, pause: 1.6 },                 // loft-ward, ON the drying gallery (y 2.48)          [KEPT]
  sDredge:  { speed: 1.0, pause: 2.0, blind: true },    // the DREDGE — two blind Snuffed on the basin banks  [KEPT]
  vLast:    { speed: 1.3, pause: 1.4 },                 // the last warden, concourse                         [KEPT]
  deck: { y: 2.5 },                                     // the gallery tier (REDESIGN AWNING +2.5)
};

export function buildLanternWays() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "lanternways";
  bag.name = "THE LANTERN-WAYS";
  bag.spawn.set(0, 0.42, 36);
  bag.bounds = { x0: -38, z0: -44, x1: 24, z1: 44 };
  bag.startVials = 3;                                   // [KEPT]
  bag.blinkCdMul = 0.85;                                // [KEPT] faster blink recharge

  // base dark slab under the whole footprint — seams never read as void [KEPT]
  kit.floor(64, 88, -8, -2, kit.mats.dark, -0.18);

  // lift a prop group onto the gallery tier (props build at ground height; the
  // gallery's decor — fallen lantern, cold pan — rides the planks instead).
  const DECK = TUNE.deck.y;
  const lift = (grp, y = DECK + 0.02) => { grp.position.y += y; return grp; };

  // ======================= A · THE TENDERS' STAIR (x -6..6, z 30..40) ========
  // --- The wick-boys' muster hall at the district's south gate: the night
  // --- shift collects wicks and oil here before their rounds. One reveille
  // --- lamp still burns over the tally crate. The ramp along the east wall is
  // --- the service road's FIRST RUNG (E1): it climbs to the muster balcony
  // --- that overlooks the fork court — the first look down a tier.
  kit.floor(12, 10, 0, 35);
  kit.surface(-6, 30, 6, 40, "moss");
  kit.wall(-6, 40, 6, 40, { h: 3.2 });                    // north wall (owns its corners)
  kit.wall(-6, 30, -6, 40, { h: 3.0, piers: false });     // west wall (corners piered by neighbours)
  kit.wall(6, 30, 6, 40, { h: 3.0, piers: false });       // east wall
  kit.wall(-6, 30, -2, 30, { h: 3.2, piers: false });     // south wall, west of the door
  kit.pier(-2, 30, 3.3);                                  // door jambs
  kit.pier(2, 30, 3.3);
  // the muster porch parapet — a LOW wall east of the door the balcony passes
  // over (height-banded: blocks the ground, clears the gallery walker above)
  kit.railing(2.15, 30, 6, 30, { y: 0, h: 1.9, t: 0.4 });
  // E1 · the first rung: ramp up the east wall, balcony over the fork court
  kit.ramp(3.4, 31.0, 5.8, 37.4, { axis: "z", y0: 2.5, y1: 0, mat: kit.mats.wood, surface: "moss" });
  kit.platform(2.4, 27.6, 5.6, 31.2, { y: 2.52, mat: kit.mats.wood, surface: "moss", support: true });
  kit.railing(2.4, 27.6, 5.6, 27.6, { y: 2.52, h: 0.85, mat: kit.mats.rust }); // south lip — you LOOK over it; the west lip stays open (the drop is a lesson too)
  kit.torch(0, 35.5, TUNE.reveille);                      // the reveille lamp — the muster's one paid flame

  // ======================= B · THE FORK COURT (x -14..14, z 18..30) ==========
  // --- The lampkeepers' court where the district's three roads part: the west
  // --- arch to the tenders' alley, the north arch to the quays, and the ramp
  // --- UP to the gallery — the third throat is over your head (E2). The
  // --- Vigil lights its own liturgy here and nothing else.
  kit.floor(28, 12, 0, 24);
  kit.surface(-14, 18, 14, 30, "moss");
  kit.wall(-14, 30, -6, 30, { h: 3.4 });                  // north wall, west of the stair hall (owns (-14,30) and (-6,30))
  kit.wall(6, 30, 14, 30, { h: 3.4 });                    // north wall, east of it (owns (6,30) and (14,30))
  kit.wall(14, 18, 14, 30, { h: 3.2, piers: false });     // east wall — dead; the city goes on behind it
  kit.wall(-14, 26, -14, 30, { h: 3.0, piers: false });   // west wall, north of the alley door
  kit.wall(-14, 18, -14, 22, { h: 3.0, piers: false });   // west wall, south of it
  kit.pier(-14, 22, 3.2);                                 // alley door jambs
  kit.pier(-14, 26, 3.2);
  // E2 · the third throat: the gallery ramp and its landing deck. The ramp
  // exists because the high lanterns do — lanterns ride up it each dusk.
  kit.ramp(5.6, 20.4, 11.9, 22.4, { axis: "x", y0: 0, y1: 2.5, mat: kit.mats.wood, surface: "moss" }); // run 6.3m (~21.6°) — foot extended west into open moss floor
  kit.platform(11.8, 18.0, 13.7, 27.0, { y: 2.54, mat: kit.mats.wood, surface: "moss", support: true });
  kit.railing(11.8, 22.6, 11.8, 27.0, { y: 2.54, h: 0.85, mat: kit.mats.rust }); // west lip, north of the ramp mouth
  kit.railing(11.8, 27.0, 13.7, 27.0, { y: 2.54, h: 0.85, mat: kit.mats.rust }); // north lip
  kit.torch(0, 19.4, TUNE.forkLamp);                      // the liturgy lamp under the carved words

  // ======================= C · THE LANTERN QUAYS (x -14..20, z -6..18) =======
  // --- The district's heart: the canal crosses the square east-west between
  // --- two parapeted promenades whose lantern rows lean over the water — the
  // --- doubling IS the picture. Crossings: the great bridge (the spine), the
  // --- span-keeper's weir sill, and the GALLERY overhead. East of the canal-
  // --- head lies the wharf, the span-keeper's floor, under the gallery's
  // --- planks. The water enters by the alley culvert and leaves under the
  // --- canal-head — both ends imply more district.
  kit.floor(34, 24, 3, 6);
  // north wall z18 — the tenement frontage the gallery runs along. Tall; two
  // gaps: the quay arch (ground) and the night wicket (the gallery's high
  // pass, its ground barred by a grate the planks cross over).
  kit.wall(-14, 18, -3, 18, { h: 6.0 });                  // owns (-14,18) and (-3,18)
  kit.wall(3, 18, 10.8, 18, { h: 5.6 });                  // owns (3,18) and (10.8,18)
  kit.wall(14.8, 18, 20, 18, { h: 6.4 });                 // owns (14.8,18) and (20,18)
  kit.railing(10.9, 18, 14.7, 18, { y: 0, h: 1.05, t: 0.3 }); // the night wicket — barred below, planked above
  kit.wall(-14, -6, -3, -6, { h: 3.2 });                  // south wall, west of the lane door (owns (-14,-6) and (-3,-6))
  kit.wall(3, -6, 20, -6, { h: 3.2 });                    // south wall, east of it (owns (3,-6) and (20,-6))
  kit.wall(20, -6, 20, 18, { h: 3.2, piers: false });     // east wall — dead; the wharf backs onto it
  // west wall x -14 (the alley behind it): culvert gap + the gallery's pass
  kit.wall(-14, -6, -14, 4.95, { h: 3.4, piers: false }); // south run (ends at the culvert's south jamb)
  kit.pier(-14, 4.95, 3.6);
  kit.wall(-14, 9.55, -14, 14.35, { h: 3.4 });            // between culvert and gallery pass (owns both jambs)
  // THE ALLEY CULVERT — the water comes in from under the workshops. Barred
  // grate (banded), lintel above, a sealed dark recess behind on the alley side.
  kit.railing(-14, 5.15, -14, 9.35, { y: 0, h: 1.25, t: 0.25 });
  kit.solid(0.45, 1.9, 4.6, -14, 7.25, kit.mats.wall, 0, 2.45); // the culvert lintel
  kit.wall(-16.3, 5.05, -16.3, 9.45, { h: 3.0, piers: false }); // recess back wall
  kit.wall(-16.3, 5.05, -14, 5.05, { h: 3.0, piers: false });   // recess cheeks
  kit.wall(-16.3, 9.45, -14, 9.45, { h: 3.0, piers: false });
  // east tenements — the wharf's back row; the gallery hugs their faces
  kit.solid(2.6, 7.5, 4.6, 18.15, 1.6, kit.mats.wall);
  kit.solid(2.6, 6.2, 4.2, 18.15, 8.6, kit.mats.wall);
  kit.solid(2.6, 8.2, 4.6, 18.15, 15.2, kit.mats.wall);

  // --- THE CANAL (z 5.05..9.45, x -14..11.85) — still, black, deadly. The
  // --- water is a void with a mirror on it: fall in and it keeps you. Three
  // --- gaps interrupt it — the bridge, the weir, the culvert lip.
  kit.hole(-13.85, 5.05, -2.75, 9.45);                    // west reach
  kit.hole(2.75, 5.05, 8.15, 9.45);                       // east reach, bridge → weir
  kit.hole(9.85, 5.05, 11.8, 9.45);                       // canal-head pocket
  kit.mirrorPool(-15.9, 5.15, -2.75, 9.35);               // MIRROR-WATER, west reach (tongue runs under the culvert grate)
  kit.mirrorPool(2.75, 5.15, 11.75, 9.35);                // MIRROR-WATER, east reach
  kit.wall(11.9, 5.05, 11.9, 9.45, { h: 1.15, th: 0.4, piers: false }); // the canal-head bulkhead — the water goes on under the wharf
  // THE GREAT BRIDGE — a low stone hump on the door spine; the one ground
  // crossing the Vigil paid for. Its parapets keep flame from the water.
  kit.ramp(-2.6, 4.5, 2.6, 7.25, { axis: "z", y0: 0, y1: 0.4, surface: "obsidian" });
  kit.ramp(-2.6, 7.25, 2.6, 10.0, { axis: "z", y0: 0.4, y1: 0, surface: "obsidian" });
  kit.railing(-2.75, 4.4, -2.75, 10.1, { y: 0, h: 0.92 });
  kit.railing(2.75, 4.4, 2.75, 10.1, { y: 0, h: 0.92 });
  // THE WEIR SILL — the span-keeper's maintenance crossing: a bare stone sill
  // at water level, parapet gaps either end, black water both sides.
  kit.floor(1.7, 4.5, 9.0, 7.25, kit.mats.stone, 0.05);
  // quay parapets (low, banded — knee walls; the dipping-steps gap on the
  // south side is the one place the water can reach you)
  kit.railing(-13.85, 5.0, -6.85, 5.0, { y: 0, h: 0.6 }); // south parapet, west of the dipping steps
  kit.railing(-5.55, 5.0, -2.8, 5.0, { y: 0, h: 0.6 });   // …east of them
  kit.railing(2.8, 5.0, 8.1, 5.0, { y: 0, h: 0.6 });
  kit.railing(9.9, 5.0, 11.8, 5.0, { y: 0, h: 0.6 });
  kit.railing(-13.85, 9.5, -2.8, 9.5, { y: 0, h: 0.6 });  // north parapet
  kit.railing(2.8, 9.5, 8.1, 9.5, { y: 0, h: 0.6 });
  kit.railing(9.9, 9.5, 11.8, 9.5, { y: 0, h: 0.6 });

  // quay floors — the promenades at the water are glazed lamp-glass (they
  // SING underfoot: the lit route is also the loud one); the outer lanes and
  // the arcade under the gallery are dark and silent.
  kit.surface(-14, -6, -11.8, 3.35, "moss");              // south-west service lane (the maw's corner)
  kit.surface(-11.8, -6, 12.9, 3.35, "obsidian");         // south quay field
  kit.surface(-14, 3.35, 11.85, 5.05, "crystal");         // SOUTH PROMENADE — lamplit, singing
  kit.surface(-14, 9.45, 11.85, 11.15, "crystal");        // NORTH PROMENADE
  kit.surface(-14, 11.15, 12.9, 14.6, "obsidian");        // north quay field
  kit.surface(-14, 14.6, 12.9, 18, "moss");               // the dark lane under the gallery's north run
  kit.surface(11.85, 3.35, 12.9, 11.15, "obsidian");      // the canal-head walk
  kit.surface(12.9, -6, 20, 2, "obsidian");               // wharf staging floor
  kit.surface(12.9, 2, 20, 18, "moss");                   // the arcade under the wharf gallery

  // --- THE GALLERY (E3) — the high-tenders' service road over the quays,
  // --- planked, silent, and NOT free: the gallery-ward walks it and two high
  // --- lanterns light its gaps (douse one and a segment goes dark). It runs
  // --- from the fork deck through the night wicket, along the wharf tenements,
  // --- then west along the north frontage to the alley pass.
  kit.platform(12.4, -1.6, 16.9, 19.3, { y: 2.5, mat: kit.mats.wood, surface: "moss", support: true }); // wharf gallery — west/north edges extended so the fork-deck junction is a full 1.3m×1.3m landing, not a 0.45m sliver
  kit.platform(-13.6, 14.8, 14.2, 17.7, { y: 2.52, mat: kit.mats.wood, surface: "moss", support: true }); // north-frontage gallery
  kit.railing(13.25, -1.6, 13.25, 5.4, { y: 2.5, h: 0.85, mat: kit.mats.rust });  // wharf gallery, west lip…
  kit.railing(13.25, 9.2, 13.25, 14.8, { y: 2.5, h: 0.85, mat: kit.mats.rust });  // …with the drop-gap over the canal-head walk
  kit.railing(13.25, -1.6, 16.9, -1.6, { y: 2.5, h: 0.85, mat: kit.mats.rust });  // south end
  kit.railing(-13.6, 14.8, -6.4, 14.8, { y: 2.52, h: 0.85, mat: kit.mats.rust }); // north gallery south lip…
  kit.railing(-4.2, 14.8, 13.3, 14.8, { y: 2.52, h: 0.85, mat: kit.mats.rust });  // …with the drop-gap at the perch
  // (no west lip: the ALLEY PASS crosses here — the x-14 wall run deliberately
  // stops at z14.35 so the high road continues quay gallery → drying loft, and
  // the loft's planks carry the walker on the far side; a lip railing at -13.6
  // sealed the pass and severed the parti's high road. The loft deck IS the
  // fall-guard — there is no drop on this edge.)
  // the two HIGH LANTERNS the road exists to feed — tall standards whose
  // flames burn at gallery height. Douseable (E3's rehabilitated DOUSE).
  kit.torch(14.2, 10.4, TUNE.highLamp);                   // over the wharf gallery's north segment
  kit.torch(-2.5, 16.35, TUNE.highLamp);                  // over the north gallery's middle
  // the six QUAY LANTERNS — the doubling rows, standing AT the parapets
  kit.torch(-10.5, 4.55, TUNE.quay[0]);
  kit.torch(-3.4, 4.55, TUNE.quay[1]);
  kit.torch(4.2, 4.55, TUNE.quay[2]);
  kit.torch(-7, 9.95, TUNE.quay[3]);
  kit.torch(1.4, 9.95, TUNE.quay[4]);
  kit.torch(7.6, 9.95, TUNE.quay[5]);
  // the bridge crest reflects — a lit crossing shows the wards your double
  bag.reflectors.push({ x: 0, z: 7.25, r: 2.9 });
  kit.fogPatch(-14, 3, 12.9, 11.5, { density: 0.028 });   // (volumetrics on: lantern shafts over the water)

  kit.cache("plazaCache", 16.2, 6.4, 2);                  // [KEPT n=2] raised to the wharf gallery — a reward for the climb
  bag.caches[bag.caches.length - 1].mesh.position.y = DECK;
  kit.mawMote("plazaMaw", -10, -4);                       // [KEPT] the dark south-west corner the lamps never reach

  // THE NIGHT SHIFT of the quays (Law of the Watch — posts are jobs; all
  // speed/pause/range/cone numbers [KEPT] from the shipped five):
  kit.guard([[-12.5, 12.2], [11, 12.2]], TUNE.vQuayN);    // NORTH-QUAY WARD — walks his lantern row, pauses at the row-heads
  kit.guard([[-12.6, 3.7], [10.4, 3.7]], TUNE.vQuayS);    // SOUTH-QUAY WARD — the same round, opposite phase
  kit.guard([[12.75, 13.4], [12.75, -0.9]], TUNE.vWharf); // WHARF-WARD — the canal-head walk, before the staged cargo
  kit.guard([[0, 1.4], [0, 13.0]], TUNE.vBridge);         // BRIDGE-WARD — quay to quay over the hump, pause at each bridgehead
  const gGallery = kit.guard([[15.1, 2.5], [15.1, 16.2], [-11, 16.2], [15.1, 16.2]], TUNE.vGallery);
  gGallery.y = 2.5;                                       // GALLERY-WARD — walks the high road there and back (paths LOOP; the repeat keeps him on the planks)

  // ======================= D · THE TENDERS' ALLEY (x -34..-14, z 2..30) ======
  // --- The lamp-tenders' workshop row behind the quays: dark on purpose (the
  // --- Vigil lights fronts, not backs). Above the ground floor runs the
  // --- DRYING LOFT — the gallery's western leg, where wicks and washing hang
  // --- — with its own ward. Three tiers of shadow (E4): which tier is a
  // --- guard on is now a question you must OBSERVE.
  kit.floor(20, 28, -24, 16);
  kit.surface(-34, 2, -14, 30, "moss");
  kit.wall(-34, 30, -14, 30, { h: 3.2 });                 // north wall (owns its corners)
  kit.wall(-34, 2, -34, 30, { h: 3.0, piers: false });    // west wall — dead; more district behind it
  kit.wall(-34, 2, -26, 2, { h: 3.0, piers: false });     // south wall, west of the basin door
  kit.pier(-26, 2, 3.2);                                  // basin door jambs
  kit.pier(-22, 2, 3.2);
  kit.wall(-22, 2, -14, 2, { h: 3.0, piers: false });     // south wall, east of it (overlaps the quays' west wall)
  // workshop tenements — ground rooms below, loft doors above onto the walk
  kit.solid(6, 7, 3.0, -27, 23.2, kit.mats.wall);
  kit.solid(3.6, 5.5, 3.0, -17.6, 20.4, kit.mats.wall);
  kit.solid(6.4, 6.5, 4.0, -28.5, 9.6, kit.mats.wall);
  kit.solid(4.0, 4.2, 5.0, -19.4, 6.4, kit.mats.wall);
  // THE DRYING LOFT (the gallery's west leg) + its down-ramp: the high road's
  // last descent — past here the tenders cross the basin by chain-ferry only.
  kit.platform(-27.4, 14.6, -12.9, 17.6, { y: 2.48, mat: kit.mats.wood, surface: "moss", support: true }); // west edge receded 1.4m for the lengthened ramp below
  kit.ramp(-33.8, 15.0, -27.5, 17.4, { axis: "x", y0: 0, y1: 2.5, mat: kit.mats.wood, surface: "moss" }); // run 6.3m (~21.6°), 0.1 lap into the platform
  kit.railing(-27.4, 14.6, -22.6, 14.6, { y: 2.48, h: 0.85, mat: kit.mats.rust }); // south lip…
  kit.railing(-20.6, 14.6, -12.9, 14.6, { y: 2.48, h: 0.85, mat: kit.mats.rust }); // …with the devour drop-gap
  kit.railing(-27.4, 17.6, -12.9, 17.6, { y: 2.48, h: 0.85, mat: kit.mats.rust }); // north lip (the slot behind is a fall)
  kit.cache("alleyCache", -30, 18, 2);                    // [KEPT] tucked in the dark under the high road
  kit.mawMote("alleyMaw", -22, 8);                        // [KEPT] the drop-devour's charge (E4's aggressive outlet)
  kit.guard([[-32, 28], [-32, 21], [-20, 20], [-32, 21]], TUNE.vAlley); // ALLEY-WARD — the ground round past the workshop doors [KEPT posts; there-and-back so the loop's wrap leg stays clear of the tenements]
  const gLoft = kit.guard([[-27.5, 16.1], [-15.5, 16.1]], TUNE.vLoft);
  gLoft.y = 2.48;                                         // LOFT-WARD — keeps the drying walk above his colleague

  // ======================= E · THE SPAN BASIN (x -34..-14, z -16..2) =========
  // --- Where the district's canals meet: a wide black basin the Vigil never
  // --- bridged twice. The chain-ferry is the high-tenders' crossing and it is
  // --- not running tonight — the high road ENDS here (E5, the Turn: climb
  // --- DOWN, cross low). Two crystal maintenance ledges skirt the water
  // --- (loud, and the dredge listens); the moss banks are silent. No flame
  // --- may lean over this much dark water, so the Vigil posts the flameless:
  // --- the DREDGE, blind, fishing dead lamps out by ear.
  kit.floor(20, 4.5, -24, -0.25);                         // south bank
  kit.floor(20, 8, -24, -12);                             // north bank
  kit.floor(1, 5.5, -33.5, -5.25);                        // west maintenance ledge (spans the water)
  kit.floor(1, 5.5, -14.5, -5.25);                        // east maintenance ledge
  kit.hole(-33, -8, -15, -2.5);                           // the basin — blink it, or the water keeps you [KEPT]
  kit.mirrorPool(-32.9, -7.85, -15.1, -2.6);              // MIRROR-WATER, the span basin
  kit.surface(-33, -2.5, -15, 2, "moss");                 // south bank — silent approach [KEPT]
  kit.surface(-33, -16, -15, -8, "moss");                 // north bank — silent landing [KEPT]
  kit.surface(-34, -16, -33, 2, "crystal");               // west ledge — loud shortcut, listened to [KEPT]
  kit.surface(-15, -16, -14, 2, "crystal");               // east ledge [KEPT]
  kit.wall(-34, -16, -34, 2, { h: 3.0, piers: false });   // west wall — dead
  kit.wall(-14, -16, -14, -6, { h: 3.0, piers: false });  // east wall south of the quays' west run
  kit.torch(-24, 0.5, TUNE.deadWater);                    // the drowned-lamp standards — violet: the water's, not the Vigil's [KEPT]
  kit.torch(-24, -14, TUNE.deadWater);
  kit.fogPatch(-33, -16, -15, 2, { density: 0.035 });
  // THE DREDGE — two blind Snuffed pacing the banks by ear [KEPT paths/specs]
  kit.guard([[-30, -0.5], [-21, -0.5]], TUNE.sDredge);
  kit.guard([[-30, -9.5], [-18, -9.5]], TUNE.sDredge);

  // ======================= F · THE LAMP-LANDING (x -3..3, z -16..-6) =========
  // --- The lane where spent quay lanterns are queued for the dredge and new
  // --- ones counted north — the wick-boys' turnaround. The Vigil pays for ONE
  // --- lamp here: the counting lamp over the queue (E6 — the last warden's
  // --- cone rakes the lane; douse it or time it).
  kit.floor(6, 10, 0, -11);
  kit.surface(-3, -16, 3, -6, "obsidian");
  kit.wall(-3, -16, -3, -6, { h: 3.2, piers: false });    // side walls (jambs piered by the quay/concourse runs)
  kit.wall(3, -16, 3, -6, { h: 3.2, piers: false });
  kit.torch(0, -11, TUNE.landing);                        // the counting lamp — the lane's one paid flame

  // ======================= G · THE CONCOURSE (x -34..20, z -40..-16) =========
  // --- The muster ground before the north gate, where the district faces the
  // --- citadel. The rift stands on the old proclamation DAIS — one last small
  // --- climb (E7): the ramp is briefly in the last warden's cone, so the
  // --- whole sentence is spoken once — observe, wait, climb, go.
  kit.floor(54, 24, -7, -28);
  kit.surface(-34, -40, 20, -16, "moss");
  kit.wall(-34, -40, 20, -40, { h: 3.4 });                // south wall (owns its corners)
  kit.wall(-34, -40, -34, -16, { h: 3.0, piers: false }); // west wall
  kit.wall(20, -40, 20, -16, { h: 3.0, piers: false });   // east wall
  kit.wall(-34, -16, -26, -16, { h: 3.0 });               // north wall, west of the basin door (owns (-34,-16) and (-26,-16))
  kit.wall(-22, -16, -3, -16, { h: 3.0 });                // between the doors (owns (-22,-16) and (-3,-16))
  kit.wall(3, -16, 20, -16, { h: 3.0 });                  // east of the lane door (owns (3,-16) and (20,-16))
  // the rift dais — a raised stone stage, skirted (banded walls: solid to the
  // ground reading, no phantom colliders for the player standing on top)
  kit.platform(-11, -38, -2.9, -31, { y: 2.52, mat: kit.mats.block, support: false });
  kit.railing(-11, -38, -2.9, -38, { y: 0, h: 2.3, t: 0.3 });   // skirt, south
  kit.railing(-11, -38, -11, -31, { y: 0, h: 2.3, t: 0.3 });    // skirt, west
  kit.railing(-11, -31, -2.9, -31, { y: 0, h: 2.3, t: 0.3 });   // skirt, north
  kit.railing(-2.9, -38, -2.9, -36.3, { y: 0, h: 2.3, t: 0.3 }); // skirt, east — split at the ramp mouth
  kit.railing(-2.9, -33.7, -2.9, -31, { y: 0, h: 2.3, t: 0.3 });
  kit.railing(-11, -38, -11, -31, { y: 2.52, h: 0.8, mat: kit.mats.rust }); // dais rail, west lip
  kit.ramp(-3.0, -36.2, 3.2, -33.8, { axis: "x", y0: 2.5, y1: 0 });
  kit.extraction(-7, -34);
  bag.extract.disc.position.y = 2.59;                     // the rift stands ON the dais
  kit.trim(4, 0.2, -7, 5.15, -39.72, 0, 0x39f0c0, 2.2);
  kit.fogPatch(-14, -38, -2, -28, { density: 0.05 });
  kit.cache("concourseCache", 10, -30, 2);                // [KEPT]
  kit.guard([[-10, -25], [10, -25]], TUNE.vLast);         // THE LAST WARDEN — the concourse line; the ramp sits in his east reach [KEPT]
  kit.brazier(-11.6, -26.6, { lit: true, light: 3, seed: 81 }); // his watch-pan at the west pause — the post's amenity

  // ==========================================================================
  // DRESSING — every prop where its user left it. Keep-clear discipline:
  // nothing intrudes on a door lane, a patrol line, a ramp mouth, the spawn,
  // a cache or the weir walk.
  // ==========================================================================

  // ===== E1 · THE TENDERS' STAIR — the wick-boys' muster =====================
  {
    const clear = [
      { x: 0, z: 36, r: 2.2 },                            // spawn pad
      { x0: -2, z0: 29, x1: 2, z1: 31.5, pad: 0.3 },      // door lane
      { x0: 3.2, z0: 30.8, x1: 6, z1: 37.6, pad: 0.2 },   // the ramp
      { x: 0, z: 35.5, r: 1.2 },                          // the reveille lamp
    ];
    // TABLEAU 1: the muster — the night's refit lanterns ranked along the west
    // wall, the tally crate and supper under the one lamp still burning.
    workRank(kit, -5.2, 31.8, -5.2, 38.4, { prop: "deadLantern", count: 5, face: "wall", clear, seed: 3 });
    kit.crate(1.2, 34.3, { rot: 0.08, seed: 4 });
    kit.sack(1.8, 33.7, { r: 0.32, seed: 5 });
    kit.cluster(-4.6, 38.9, ["barrel", "sack"], { count: 3, footprint: 0.9, backDir: Math.atan2(-1, 1), clear, seed: 6 });
  }

  // ===== E2 · THE FORK COURT ================================================
  {
    const clear = [
      { x0: -2, z0: 28.5, x1: 2, z1: 30.5, pad: 0.3 },    // stair door lane
      { x0: -3, z0: 18, x1: 3, z1: 20.5, pad: 0.3 },      // quay arch lane
      { x0: -14, z0: 22, x1: -11.5, z1: 26, pad: 0.3 },   // alley door lane
      { x0: 5.3, z0: 20, x1: 12, z1: 22.8, pad: 0.3 },    // the gallery ramp's foot
      { x: 0, z: 24, r: 1.4 },                            // checkpoint pad
      { x: 0, z: 19.4, r: 1.3 },                          // the liturgy lamp
    ];
    // lanterns queued at the ramp foot for carriage up to the high posts —
    // the gallery's reason, visible from the fork
    workRank(kit, 6.6, 19.3, 10.4, 19.3, { prop: "deadLantern", count: 3, face: "wall", clear, seed: 8 });
    kit.corner({ x0: -14, z0: 18, x1: 14, z1: 30 }, "sw",
      [{ prop: "crateStack", w: 2, foot: 0.8 }, "barrel", "sack"], { count: 3, clear, seed: 9 });
    kit.banner(-8, 2.6, 29.72, 0, { w: 1.1, color: 0xffb46a, seed: 10 }); // court cloth on the north wall
  }

  // ===== E3 · THE LANTERN QUAYS =============================================
  {
    const clear = [
      { x0: -12.5, z0: 11.4, x1: 11, z1: 13.0, pad: 0.4 },  // north-quay ward's row
      { x0: -12.6, z0: 2.9, x1: 10.4, z1: 4.5, pad: 0.4 },  // south-quay ward's row
      { x0: -0.8, z0: 1.4, x1: 0.8, z1: 13.0, pad: 0.4 },   // bridge-ward's crossing
      { x0: 12.0, z0: -0.9, x1: 13.5, z1: 13.4, pad: 0.3 }, // wharf-ward's walk
      { x0: -3, z0: 14.5, x1: 3, z1: 18, pad: 0.3 },        // quay arch lane
      { x0: -3, z0: -6, x1: 3, z1: -4, pad: 0.3 },          // lane door
      { x0: 8.15, z0: 5, x1: 9.85, z1: 9.5, pad: 0.1 },     // the weir walk
      { x: -10, z: -4, r: 1.1 },                            // plazaMaw
      { x: 0, z: 11.8, r: 1.3 },                            // checkpoint pad
    ];
    // TABLEAU 3: the span-keeper's count — his crate-desk and supper at the
    // canal-head, the dawn cargo staged under the gallery, the crane idle.
    kit.crate(13.75, 8.8, { rot: 0.1, seed: 21 });        // his desk sits under the gallery, out of the ward's walk
    kit.sack(13.7, 8.0, { r: 0.3, seed: 22 });
    kit.pillar(0.35, 4.2, 18.6, 3.0);                     // the wharf crane post
    kit.chains(18.6, 3.0, { y: 4.0, len: 2.2, seed: 23 }); // its empty hook
    kit.cart(14.6, 0.3, { rot: 0.12, seed: 24 });         // the dawn cart, half-loaded
    kit.crateStack(16.55, 4.9, { seed: 25 });             // staged cargo under the planks, beside the gallery cache
    workRank(kit, 19.2, 4.5, 19.2, 12.5, { prop: "crate", propOpts: { size: 0.85 }, count: 4, face: "wall", clear, seed: 26 });
    // the dipping steps — the wick-boys' water access, the one parapet gap
    kit.urn(-7.3, 4.3, { scale: 0.85, seed: 27 });
    kit.sack(-5.2, 4.4, { r: 0.3, seed: 28 });
    // the poor south-west corner: the lamps the district let go dark
    kit.deadLantern(-12.9, -4.9, { seed: 29 });
    kit.rubble(-11.6, -3.2, { radius: 0.7, seed: 30 });
    // TABLEAU 2 · ON THE GALLERY: the re-wicking perch — a lantern taken down
    // and left on the planks, the tender's cold pan beside it, tackle idle.
    lift(kit.deadLantern(0.6, 16.6, { fallen: true, rot: 0.7, seed: 31 }));
    lift(kit.brazier(1.7, 16.9, { lit: false, seed: 32 }).group);
    kit.chains(0.2, 17.45, { y: 4.6, len: 1.4, seed: 33 });
    kit.banner(3.4, 3.9, 17.69, Math.PI, { w: 1.0, color: 0xffb46a, seed: 34 }); // frontage cloth over the planks
    kit.banner(-9.8, 3.7, 17.69, Math.PI, { w: 1.1, color: 0xffd76a, seed: 35 });
  }

  // ===== E4 · THE TENDERS' ALLEY ============================================
  {
    const clear = [
      { x0: -32.7, z0: 19, x1: -19, z1: 28.7, pad: 0.4 }, // alley-ward's round (both legs, boxed)
      { x0: -14, z0: 21.5, x1: -11.5, z1: 26.5, pad: 0.3 },// fork door lane
      { x0: -26, z0: 2, x1: -22, z1: 4.5, pad: 0.3 },     // basin door lane
      { x0: -34, z0: 14.6, x1: -27.1, z1: 17.8, pad: 0.3 },// the loft ramp's foot
      { x: -30, z: 18, r: 1.2 },                          // alleyCache
      { x: -22, z: 8, r: 1.1 },                           // alleyMaw
      { x: -24, z: 16, r: 1.2 },                          // checkpoint pad
    ];
    // workshop clutter at the tenement bases — squared to the walls, aisles clear
    kit.cluster(-31.6, 6.2, ["barrel", { prop: "crate", w: 2 }, "sack"], { count: 3, footprint: 1.0, backDir: Math.atan2(-1, -1), clear, seed: 41 });
    kit.cluster(-16.2, 10.6, [{ prop: "crateStack", w: 2, foot: 0.8 }, "sack"], { count: 3, footprint: 1.0, backDir: Math.atan2(1, 0), clear, seed: 42 });
    kit.deadLantern(-25.6, 4.6, { seed: 43 });            // the alley's own lamp — never relit; the Vigil lights fronts
    kit.rubble(-33.0, 28.6, { radius: 0.7, seed: 44 });
    // the drying loft's lines — washing and wick-cloth on the tenement faces
    kit.banner(-27.5, 3.6, 21.54, Math.PI, { w: 0.9, seed: 45 });
    kit.banner(-25.2, 3.4, 21.54, Math.PI, { w: 1.1, seed: 46 });
    kit.banner(-17.7, 3.2, 18.74, Math.PI, { w: 0.9, seed: 47 });
    kit.chains(-26.5, 21.5, { y: 4.6, len: 1.6, seed: 48 }); // hoist tackle off the loft door
  }

  // ===== E5 · THE SPAN BASIN ================================================
  {
    const clear = [
      { x0: -30, z0: -1.2, x1: -21, z1: 0.2, pad: 0.5 },  // south dredge's beat
      { x0: -30, z0: -10.2, x1: -18, z1: -8.8, pad: 0.5 },// north dredge's beat
      { x0: -34, z0: -16, x1: -33, z1: 2, pad: 0.1 },     // west ledge — keep the crystal clear
      { x0: -15, z0: -16, x1: -14, z1: 2, pad: 0.1 },     // east ledge
      { x0: -26, z0: 0, x1: -22, z1: 2, pad: 0.3 },       // alley door lane
      { x0: -26, z0: -16, x1: -22, z1: -14, pad: 0.3 },   // concourse door lane
      { x: -20, z: 0.5, r: 1.3 },                         // checkpoint pads
      { x: -20, z: -11, r: 1.3 },
      { x: -24, z: 0.5, r: 1.0 },                         // the drowned-lamp standards
      { x: -24, z: -14, r: 1.0 },
    ];
    // the FERRY CHAIN (the Turn made visible): windlass, idle chain, the
    // skiff-cart hauled out — the high-tenders' crossing, not running tonight
    kit.pillar(0.4, 2.4, -27.2, 1.3);
    kit.chains(-27.2, 1.3, { y: 2.3, len: 1.6, seed: 51 });
    kit.cart(-30.6, 1.2, { rot: -0.3, seed: 52 });
    kit.barrel(-28.4, 1.5, { seed: 53 });
    // TABLEAU 4: the dredge's haul — drowned lamps fished out and ranked,
    // still dripping, along the north bank the blind things pace
    workRank(kit, -31, -14.6, -18.5, -14.6, { prop: "deadLantern", count: 5, face: "wall", rotJitter: 0.14, clear, seed: 54 });
    kit.rubble(-17.2, -13.4, { radius: 0.8, seed: 55 });  // dredge spoil
    kit.sack(-31.8, -13.5, { r: 0.34, seed: 56 });
  }

  // ===== E6 · THE LAMP-LANDING ==============================================
  {
    const clear = [
      { x0: -1, z0: -16, x1: 1, z1: -6, pad: 0.3 },       // the lane spine
      { x: 0, z: -11, r: 1.4 },                           // the counting lamp + checkpoint
    ];
    // the queue for the dredge: spent quay lanterns ranked along the east wall
    workRank(kit, 2.2, -14.5, 2.2, -7.5, { prop: "deadLantern", count: 4, face: "wall", clear, seed: 61 });
    kit.urn(-2.3, -14.6, { scale: 0.8, seed: 62 });
  }

  // ===== E7 · THE CONCOURSE =================================================
  {
    const clear = [
      { x0: -10, z0: -25.8, x1: 10, z1: -24.2, pad: 0.5 },// the last warden's line
      { x0: -3.2, z0: -36.6, x1: 3.6, z1: -33.4, pad: 0.3 },// the dais ramp
      { x0: -26, z0: -16, x1: -22, z1: -13.5, pad: 0.3 }, // basin door lane
      { x0: -3, z0: -16, x1: 3, z1: -13.5, pad: 0.3 },    // lane door lane
      { x: 10, z: -30, r: 1.2 },                          // concourseCache
      { x: -7, z: -30, r: 1.4 },                          // checkpoint pad
      { x: -11.6, z: -26.6, r: 1.0 },                     // the warden's watch-pan
    ];
    // the muster ground stays open (negative space is the parade's job); the
    // stores hug the south wall, the vista says the city goes on west
    kit.wallRun(-30, -39.3, 16, -39.3, [{ prop: "crate", w: 2 }, "barrel", "sack"], {
      spacing: 3.4, inset: 0, face: "wall", clear, seed: 71,
    });
    barredVista(kit, -28, -32, { clear, seed: 72 });
    kit.crate(-12.4, -27.4, { size: 0.7, rot: 0.1, seed: 73 }); // the warden's stool by his pan
    // the dais wears the rift's honours: the gate's own dead lamps flank it
    lift(kit.deadLantern(-9.8, -36.8, { seed: 74 }), 2.54);
    lift(kit.deadLantern(-9.8, -31.4, { seed: 75 }), 2.54);
  }

  // ================= inscriptions (two voices only) ==========================
  kit.inscription(0, 2.5, 18.30, "KEEP THE FIRES FED", "n", "#ffb46a");                                    // [KEPT] the fork's liturgy, lit by its own lamp
  kit.inscription(0, 3.1, 17.71, "LET NO FLAME LEAN OVER THE DARK WATER", "s", "#ffd76a");                 // quay liturgy over the arch — why the parapets, why the dredge
  kit.inscription(-14.29, 2.4, 24, "You remember narrower doors, and kinder dark.", "w", "#9a86d8");       // [KEPT] Hush, at the alley door
  kit.inscription(-33.72, 2.3, -5.4, "You remember drowning was never the worst part of water.", "e", "#9a86d8"); // [KEPT] Hush, over the basin

  // ================= the moon ================================================
  // Thin and high — the lantern rows own the water; the moon only keeps the
  // dark rooms walkable. NO invisible fills (Law of Light): the shipped four
  // are removed; their duty lives in the fork lamp, the counting lamp, the
  // watch-pan, and this moon.
  const moon = new THREE.DirectionalLight(0x8ea0cc, TUNE.moon);
  moon.position.set(...TUNE.moonFrom);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);

  // ================= checkpoints ============================================= [KEPT coverage]
  kit.checkpoint(0, 36, 3);
  kit.checkpoint(0, 24, 3);
  kit.checkpoint(0, 11.8, 2.5, 0, 12.2);
  kit.checkpoint(-24, 16, 3, -24, 16);
  kit.checkpoint(-20, 0.5, 2.5, -20, 0.5);
  kit.checkpoint(-20, -11, 2.5, -20, -11);
  kit.checkpoint(0, -11, 2.5, 0, -11);
  kit.checkpoint(-7, -30, 3, -7, -30);

  // ================= triggers / beats (terse; the level explains little) =====
  kit.trigger("start", 0, 34, 3);                         // [KEPT]
  kit.trigger("rung", 4.6, 33, 2);                        // E1 — the first climb
  kit.trigger("hub", 0, 24, 5);                           // [KEPT]
  kit.trigger("highroad", 12.8, 20.6, 2.2);               // E2/E3 — the ramp's foot
  kit.trigger("plaza", 0, 12, 4);                         // [KEPT]
  kit.trigger("bridge", 0, 3.6, 2.2);                     // the reflection read
  kit.trigger("alley", -24, 20, 4);                       // [KEPT]
  kit.trigger("canal", -24, -1, 4);                       // [KEPT]
  kit.trigger("concourse", -7, -25, 5);                   // [KEPT]

  bag.objective = "The lanterns fork ahead";              // [KEPT]
  bag.onStart = (game) => game.hud.prompt("You remember when the lanterns did not follow you home.", 4.5); // [KEPT]
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    if (id === "rung") p.prompt("You remember when the city had a top to it.", 4);
    if (id === "hub") p.prompt("The Lantern-Ways fork like a held breath.", 4);                            // [KEPT]
    if (id === "highroad") p.prompt("The tenders' road never touches the ground. Neither must you.", 4);
    if (id === "plaza") p.prompt("KEEP THE FIRES FED, the quays insist, doubled in the black water.", 4);  // [KEPT, bent to the water]
    if (id === "bridge") p.prompt("The water carries your shape to them. Cross dark, or cross quick.", 4);
    if (id === "alley") p.prompt("You remember narrower doors, and kinder dark.", 4);                      // [KEPT]
    if (id === "canal") p.prompt("The high road ends at the water. Something below still counts its dead in ripples.", 4.5); // [KEPT, + the Turn]
    if (id === "concourse") p.prompt("The rift exhales, patient as always.", 3.5);                         // [KEPT]
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.88 + 0.12 * Math.sin(t * 7 + tc.x * 2)); // [KEPT flicker]
    }
    if (bag.extract) {
      bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
    }
  };

  return bag;
}
