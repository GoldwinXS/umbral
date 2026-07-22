import * as THREE from "three";
import { makeKit } from "../levelKit.js";
import { vigilShrine } from "./_dressing.js";

/**
 * MISSION 3 — THE FLESHERS' ROW  (level index 2) — DEVOUR.
 *
 * ============================== SITE DOSSIER =================================
 * WHAT: The night-market row of Lanternspire's meat and tallow trade — narrow
 *   paired stalls, salting troughs, a tallow-render corner, and the Vigil's
 *   tax floor at the deep end. The Vigil watches this street harder than any
 *   shrine, because tallow feeds the city's candles: meat is food, but fat
 *   is FUEL, and fuel is money.
 * WHO: the FLESHERS and their SALT-BOYS (two to a stall — one cuts, one salts;
 *   the row's whole rhythm is pairs that split when the work does); the
 *   TALLOW-REEVE (the Vigil's taxman — weighs every render on his glazed
 *   counting floor before it leaves); the NIGHT-PORTERS (wheel carcasses in
 *   at the west dock all night, wheel rendered tallow out the east gate at
 *   dawn). Only a skeleton shift is on at this hour; their stuff is everywhere.
 * PARTI: carriage row (the city, barred) → carcass dock → hook walk → salting
 *   floor → the stall row → the render corner → the reeve's tax floor →
 *   porters' gate → the chandlery road. Carcasses run west→east and leave as
 *   tallow; the blood-gutters run back west to the dock. Both ends imply more
 *   city: carriages beyond the west sill, the chandlery road beyond the east cap.
 * WHY THE RELIC IS HERE: the DRIPSTONE — the first gob of tallow ever rendered
 *   on this row, gone hard and clear as amber. Every reeve since has sworn his
 *   weights against it; it IS the row's license to trade. So it stands on the
 *   weigh-plinth in the tax floor's south alcove — the deepest point of the
 *   route, between the reeve's two counting lamps, under the one Eye — because
 *   the Vigil lights what it values, and it values money most.
 * TABLEAUX: (1) a night-cart caught mid-unload at the carcass dock, its sacks
 *   spilled where Hush wakes; (2) a salting bench mid-job — barrow at the
 *   trough, salt sacks leaning, the flesher's supper waiting at his lit stall;
 *   (3) the day crew's stall gone cold — dead coal-pan, crate seat, empty
 *   sacks — right beside the night crew's pan still burning; (4) the dawn
 *   shipment staged at the porters' gate — a half-loaded cart and a crate row,
 *   the gate-pan burning for a porter who is out on the road.
 * THE NIGHT SHIFT: the NIGHT-FLESHER walks his salting aisle bench-end to
 *   bench-end, pausing at each to turn the meat — alone, because his salt-boy's
 *   half of the stall is dark and stripped. The LISTENER — a Snuffed the Vigil
 *   set on the stall cross-lane — paces mouth to mouth of the narrow lanes,
 *   pausing to hear; the stalls carry sound, which is why a blind thing works
 *   here. The RENDER-WATCH paces the vat line; his west pause is within earshot
 *   of the Listener's lane (the two beats meet at the band seam), his east
 *   pause is alone at the far vat. The PHAROS hangs over the tax floor's north
 *   face, raking the counting floor and the gate lane — it was mounted to watch
 *   the tallow LEAVE. Nobody guards the gate room; the Vigil trusts the Eye.
 * =============================================================================
 *
 * Teaches DEVOUR as "the guard is food," then shows the one thing you can never
 * eat (per docs/REDESIGN_1-4.md, MISSION 3 — beats canon, place rebuilt):
 *   E1 KI    — THE FIRST MOUTHFUL : feed a crimson mote, take the lone
 *              night-flesher from his blind rear arc — gone, and you a little
 *              larger. Clean power. The narrow bench aisle IS the lesson:
 *              a worker alone in a lane can be taken.
 *   E2 SHŌ   — WHAT YOU CANNOT EAT : the row conjugates DEVOUR by what is
 *              edible. The blind Listener on the silent rush-strewn stalls
 *              cannot be devoured and hunts your lunge by ear; the render-watch
 *              is a second swallow — but only on the leg of his round that
 *              takes him out of the Listener's earshot. Pairs that separate
 *              are the curriculum.
 *   E3 TEN   — UNDER THE EYE : the Turn. The Pharos cannot be doused, lured,
 *              or devoured — and the fuller you have fed, the more its sweep
 *              finds you. Set the power down: read the sweep, cross small,
 *              lift the Marrowlight from the alcove in the Eye's own blind spot.
 *   E4 KETSU — FED, AND FLEEING : take the relic → the row wakes → run.
 *
 * SHOWCASE — BRAZIER-LIT STALLS IN FOG: many small warm light-pools, one per
 * occupied stall or post, each from a visible coal-pan (kit.brazier: PointLight
 * + rtExclude ember — never an emissive-NEE area light), threading low
 * kit.fogPatch haze so the pools read as glowing islands with black lanes
 * between. The rhythm down the route: the flesher's pan → the DARK meat end
 * (the Listener's silence) → the porters' mess-pan and the vat-watch pan →
 * the reeve's two great counting lanterns → the gate-pan. With volumetrics ON
 * each pan gets a god-ray halo; with everything OFF it still reads as warm
 * pools and honest black gaps. Light budget matches the shipped level (6 flame
 * lights vs 5 torches + 2 fills); the two INVISIBLE fills are removed per the
 * Law of Light and their duty moved into fixtured pans.
 *
 * 0 vials by design — the player puts down DOUSE/LURE to learn DEVOUR clean.
 * Flat (verticality embargo M1–4). Geometry is kit.wall runs (overlapping
 * joints, one pier per corner — see PLACES.md geometry hygiene).
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
const TUNE = {
  moon: 0.55,                                       // ambient darkness (kept from shipped)
  moonFrom: [8, 22, 6],                             // near-overhead — the pans, not the moon, own this level's light
  vDevour: { speed: 1.1, pause: 1.5, range: 8 },    // the night-flesher (pauses = turning the meat at each bench-end)
  vMid:    { speed: 1.2, pause: 1.4, range: 9 },    // the render-watch (west pause = in the Listener's earshot; east = alone)
  snuffed: { speed: 1.0, pause: 2.0, blind: true }, // the Listener (pauses = hearing at each lane mouth)
  pharos:  { dir: -Math.PI / 2, sweep: 0.7, sweepSpeed: 0.45, range: 14, coneAngle: 0.24, height: 3.2 },
  pans: { flesher: 12, mess: 9, vats: 12, gate: 11 },   // coal-pan PointLight strengths (range is the brazier's own 6)
  countN: { intensity: 13, range: 11, scale: 1.8 }, // the reeve's counting lamp, north (kept great-lantern spec)
  countS: { intensity: 14, range: 11, scale: 2.0 }, // the reeve's counting lamp, south (pedestal light)
};

export function buildSwallow() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "fleshersrow";
  bag.name = "THE FLESHERS' ROW";
  bag.spawn.set(-17, 0.42, 0);
  bag.bounds = { x0: -28, z0: -12, x1: 63, z1: 12 };

  const H = 3.2;

  // ======================= GEOMETRY — the row, west to east ===================
  // All walls are kit.wall runs: boxes overshoot their endpoints th/2 so every
  // joint OVERLAPS, and each corner carries exactly ONE pier — owned by one run
  // or set explicitly with kit.pier where no run claims it. Stall dividers are
  // short piered runs off the outer walls (their end-piers read as stall posts).

  // --- THE CARRIAGE ROW (x -28..-21, z -4..4) — the city's street, going on
  // --- without you: night-carriages load beyond the dock's barred sill. Set
  // --- dressing only — walled, unlit, a vista over the sill, never a route.
  kit.floor(7, 8, -24.5, 0);
  kit.wall(-28, -4, -28, 4, { h: 2.5, piers: false });    // the far facade (corners piered by the cheeks)
  kit.wall(-28, 4, -21, 4, { h: 2.2 });                   // cheek walls own all four vista corners
  kit.wall(-28, -4, -21, -4, { h: 2.2 });
  kit.cart(-25.6, -1.2, { rot: -0.4, seed: 2 });          // a carriage waiting for a dawn that isn't yours
  kit.deadLantern(-24.3, 1.6, { seed: 3 });
  kit.rubble(-22.4, 0.5, { radius: 0.7, seed: 4 });

  // --- THE CARCASS DOCK (x -21..-12, z -5..5) — the night-porters' unloading
  // --- floor: carcasses come off the carts here and go up the hook walk. The
  // --- Vigil does not light the offal end — blood-rushes underfoot, and the
  // --- gutters of the whole row drain back to this dark. Hush wakes here.
  kit.floor(9, 10, -16.5, 0);
  kit.surface(-21, -5, -12, 5, "moss");
  kit.wall(-21, 5, -12, 5, { h: 3.0 });                   // north wall (owns its corners)
  kit.wall(-21, -5, -12, -5, { h: 3.0 });                 // south wall
  kit.wall(-21, -5, -21, -2, { h: 2.8, piers: false });   // west wall, south of the carriage gate
  kit.wall(-21, -2, -21, 2, { h: 1.05, piers: false });   // the barred sill — see the city over it, never cross
  kit.wall(-21, 2, -21, 5, { h: 2.8, piers: false });     // west wall, north of it
  kit.pier(-21, -2, 3.0);                                 // the carriage gate's own two piers
  kit.pier(-21, 2, 3.0);
  kit.wall(-12, -5, -12, -1.5, { h: 3.0, piers: false }); // east wall (jambs piered by the hook walk)
  kit.wall(-12, 1.5, -12, 5, { h: 3.0, piers: false });

  // --- THE HOOK WALK (x -12..-8, z -1.5..1.5) — the carcass throat: hooks and
  // --- chain-rails overhead, worn floor beneath. Kept bare — loads swing through.
  kit.floor(4, 3, -10, 0);
  kit.surface(-12, -1.5, -8, 1.5, "moss");
  kit.wall(-12, 1.5, -8, 1.5, { h: 3.0 });                // side walls own the jamb piers of both rooms
  kit.wall(-12, -1.5, -8, -1.5, { h: 3.0 });
  kit.chains(-10.7, 0.85, { y: 2.6, len: 1.3, seed: 6 }); // the hook-rail's idle chains
  kit.chains(-9.3, -0.8, { y: 2.6, len: 1.1, seed: 7 });

  // --- THE SALTING FLOOR (x -8..14, z -8..8) — the fleshers' work-hall: two
  // --- aligned rows of stone salting troughs flank a central aisle. One stall
  // --- on the north wall is still worked tonight (the night-flesher's, lit by
  // --- his coal-pan); his salt-boy's half is dark and stripped. The rest of
  // --- the floor is rush-strewn and black — the Vigil lights workers, not meat.
  kit.floor(22, 16, 3, 0);
  kit.surface(-8, -8, 14, 8, "moss");
  kit.wall(-8, 8, 3, 8, { h: 3.2 });                      // north wall, west of the stall (owns -8,8 and 3,8)
  kit.wall(3, 8, 14, 8, { h: 3.0, piers: false });
  kit.pier(14, 8, 3.25);                                  // NE corner (no run owns it)
  kit.wall(-8, -8, 6, -8, { h: 3.0 });                    // south wall
  kit.wall(6, -8, 14, -8, { h: 3.2, piers: false });
  kit.pier(14, -8, 3.45);                                 // SE corner
  kit.wall(-8, -8, -8, -1.5, { h: 3.0, piers: false });   // west wall (jambs piered by the hook walk)
  kit.wall(-8, 1.5, -8, 8, { h: 3.0, piers: false });
  kit.wall(14, -8, 14, -1.5, { h: 3.0, piers: false });   // east wall (jambs piered by the row throat)
  kit.wall(14, 1.5, 14, 8, { h: 3.0, piers: false });
  kit.wall(1.5, 6.2, 1.5, 8, { h: 2.3, th: 0.3 });        // the night-flesher's stall dividers
  kit.wall(5.5, 6.2, 5.5, 8, { h: 2.3, th: 0.3 });        //   (end piers read as stall posts)

  // --- THE ROW THROAT (x 14..18, z -1.5..1.5) — the gate between the salting
  // --- hall and the market row proper. Kept bare — barrows pass through it.
  kit.floor(4, 3, 16, 0);
  kit.surface(14, -1.5, 18, 1.5, "moss");
  kit.wall(14, 1.5, 18, 1.5, { h: 3.0 });
  kit.wall(14, -1.5, 18, -1.5, { h: 3.0 });

  // --- THE ROW (x 18..50, z -11..11) — the market row itself, one long street
  // --- of stalls in three bands the feet can read:
  // ---   west 18..28 (moss)     THE MEAT STALLS — the poor end, rush-strewn and
  // ---     silent, its own lamps long snuffed; the Listener's beat.
  // ---   mid 28..38 (obsidian)  THE RENDER CORNER — paved for the vat fires;
  // ---     the render-watch's beat, and the only stalls still lit.
  // ---   east 38..50 (crystal)  THE REEVE'S TAX FLOOR — glazed with years of
  // ---     spilled tallow; it RINGS underfoot, and the Eye watches it.
  kit.floor(32, 22, 34, 0);
  kit.surface(18, -11, 28, 11, "moss");     // west — the Listener's zone, MUST stay silent
  kit.surface(28, -11, 38, 11, "obsidian"); // mid  — the render corner, moderate noise
  kit.surface(38, -11, 50, 11, "crystal");  // east — the tallow-glaze sings; the finale
  kit.wall(18, 11, 28, 11, { h: 3.2 });                   // north frontage, band by band
  kit.wall(28, 11, 38, 11, { h: 3.0, piers: false });
  kit.wall(38, 11, 50, 11, { h: 3.4 });                   // tallest over the tax floor — the Eye's mount
  kit.wall(18, -11, 30, -11, { h: 3.0 });                 // south frontage
  kit.wall(30, -11, 42, -11, { h: 3.2, piers: false });
  kit.wall(42, -11, 50, -11, { h: 3.0 });
  kit.wall(18, -11, 18, -1.5, { h: 3.0, piers: false });  // west wall (jambs piered by the throat)
  kit.wall(18, 1.5, 18, 11, { h: 3.0, piers: false });
  kit.wall(50, -11, 50, -1.5, { h: 3.0, piers: false });  // east wall (jambs piered by the gate walk)
  kit.wall(50, 1.5, 50, 11, { h: 3.0, piers: false });
  // stall dividers, north side — meat stalls (west) then the render-corner
  // stalls (mid); every bay is a stall, and its end-piers are the stall posts.
  kit.wall(20.5, 8.4, 20.5, 11, { h: 2.4, th: 0.3 });
  kit.wall(23.5, 8.4, 23.5, 11, { h: 2.4, th: 0.3 });
  kit.wall(26.5, 8.4, 26.5, 11, { h: 2.4, th: 0.3 });
  kit.wall(29.5, 8.4, 29.5, 11, { h: 2.4, th: 0.3 });     // the shut stall (dark — the mote's pocket)
  kit.wall(32.5, 8.4, 32.5, 11, { h: 2.4, th: 0.3 });     // the porters' mess stall (lit)
  kit.wall(35.5, 8.4, 35.5, 11, { h: 2.4, th: 0.3 });     // the day crew's stall (cold)
  // stall dividers, south side — two more meat bays west of the vat line
  kit.wall(21, -11, 21, -8.4, { h: 2.4, th: 0.3 });
  kit.wall(24.5, -11, 24.5, -8.4, { h: 2.4, th: 0.3 });
  // the tax-floor alcove — the weigh-plinth's bay in the south wall
  kit.wall(44, -11, 44, -9.4, { h: 2.8, th: 0.35 });
  kit.wall(48, -11, 48, -9.4, { h: 2.8, th: 0.35 });
  // the old awning columns of the tax floor — the cover the Eye's sweep respects
  kit.pillar(0.55, H, 42, 5);                             // [KEPT positions]
  kit.pillar(0.55, H, 48, 7);

  // --- THE GATE WALK (x 50..54, z -1.5..1.5) — the reeve's gate: every load
  // --- out passes his floor first. Kept bare — the dawn carts fill it.
  kit.floor(4, 3, 52, 0);
  kit.surface(50, -1.5, 54, 1.5, "moss");
  kit.wall(50, 1.5, 54, 1.5, { h: 3.0 });
  kit.wall(50, -1.5, 54, -1.5, { h: 3.0 });

  // --- THE PORTERS' GATE (x 54..62, z -6..6) — the loading yard where rendered
  // --- tallow leaves for the Great Chandlery at dawn. The gate porter's pan
  // --- burns at his post; he is out on the road. Tonight the rift stands in
  // --- the gateway instead of the dawn cart.
  kit.floor(8, 12, 58, 0);
  kit.surface(54, -6, 62, 6, "moss");
  kit.wall(54, 6, 62, 6, { h: 3.0 });                     // north wall (owns its corners)
  kit.wall(54, -6, 62, -6, { h: 3.0 });                   // south wall
  kit.wall(62, -6, 62, 6, { h: 3.15, piers: false });     // east cap — the chandlery road is the rift's now
  kit.wall(54, -6, 54, -1.5, { h: 3.0, piers: false });   // west wall (jambs piered by the gate walk)
  kit.wall(54, 1.5, 54, 6, { h: 3.0, piers: false });

  kit.extraction(58, 0);

  // ================= THE PANS AND LAMPS (the showcase rhythm) =================
  // Every light is a fixture with an owner: four burning coal-pans (brazier =
  // PointLight + rtExclude ember) at the four occupied posts, and the reeve's
  // two great counting lamps on the tax floor. The gaps between the pools are
  // as deliberate as the pools — the meat end burns nothing at night.
  kit.brazier(3.4, 4.4, { lit: true, light: TUNE.pans.flesher, seed: 11 });   // the night-flesher's pan, dragged to his stall mouth
  kit.brazier(33.9, 7.7, { lit: true, light: TUNE.pans.mess, seed: 12 });     // the porters' mess-pan, mid-row north
  kit.brazier(33, -4.2, { lit: true, light: TUNE.pans.vats, seed: 13 });      // the render-watch's pan on the vat line
  kit.brazier(55, 4, { lit: true, light: TUNE.pans.gate, seed: 14 });         // the gate porter's pan (he is out on the road)
  kit.torch(40, 6, TUNE.countN);          // GREAT — the reeve's counting lamp, north
  kit.torch(46, -3, TUNE.countS);         // GREAT — the reeve's counting lamp, south (lights the weigh-plinth approach)
  // low haze threads the pools into glowing islands (god-ray halos when
  // volumetrics are on; a soft warm rhythm when they're off)
  kit.fogPatch(-8, -8, 14, 8, { density: 0.018 });
  kit.fogPatch(18, -11, 50, 11, { density: 0.022 });   // the busiest room — thinned so the stalls read
  kit.fogPatch(54, -6, 62, 6, { density: 0.018 });

  // ================= crimson maw motes — charge the devour =====================
  kit.mawMote("maw1", -13, -1);  // the first spot of red, at the dock's exit threshold where Hush wakes (reachable before the flesher's aisle)
  kit.mawMote("maw2", 31, 7);    // [KEPT] the shut stall's mouth — the one black bay in the mid-row's line of pans

  // ================= GUARDS — exactly three enemy TYPES ========================
  // [KEPT] roster + specs; the paths are the same beats walked as market jobs.
  // 1 · devourable Vespers (the swallow lessons).
  kit.guard([[-4, 0], [10, 0]], TUNE.vDevour);      // the NIGHT-FLESHER: bench-end to bench-end down his aisle — LESSON 1 (a worker alone)
  kit.guard([[30, -7], [36, -7]], TUNE.vMid);       // the RENDER-WATCH: the vat line — LESSON 2 (his east pause is out of the Listener's earshot)
  // 2 · the SNUFFED — blind, hunts by sound, cannot be devoured, only ONE.
  kit.guard([[22, 5], [22, -5]], TUNE.snuffed);     // the LISTENER: the stall cross-lane; the narrow bays carry every sound to it
  // 3 · the PHAROS — stationary; sweeps the tax floor and the way out; only ONE.
  kit.greatEye(44, 10, TUNE.pharos);                // mounted to watch the tallow LEAVE

  // ================= the relic (the weigh-plinth in the alcove) ================
  kit.scepterPedestal(46, -8);                      // [KEPT] the Marrowlight, sworn against and watched

  // ================= TABLEAU 1 · THE CARCASS DOCK (the wake) ===================
  // The spawn room: a night-cart caught mid-unload at the dock, its sacks spilled
  // toward the dark where Hush wakes, gnawed rubble crusting the offal gutters.
  // Framed off the spawn pad and the exit lane east (the offal end is unlit).
  {
    const clearDock = [
      { x: -17, z: 0, r: 2.0 },                             // spawn — Hush wakes here
      { x0: -21, z0: -1.5, x1: -12, z1: 1.5, pad: 0.4 },   // the exit route east (dock → hook walk)
      { x: -13, z: -1, r: 0.9 },                            // maw1 — the first red, keep it reachable
    ];
    kit.cart(-16.2, 3.3, { rot: 0.5, seed: 81 });          // the night-cart, halted mid-tip against the north wall
    kit.sack(-16.8, 2.3, { seed: 82 });                    //   …its load slid off toward the wake
    kit.sack(-15.2, 2.5, { r: 0.34, seed: 83 });
    kit.crateStack(-19.2, 3.4, { seed: 84 });              // the night's unload, stacked at the west revetment
    kit.cluster(-19.4, -3.2, [{ prop: "rubble", w: 3 }, "sack", "barrel"], {
      count: 3, footprint: 1.0, backDir: Math.atan2(-1, -1), clear: clearDock, seed: 85, // gnawed rubble + a split cask, south offal corner
    });
    kit.rubble(-14.3, -3.4, { radius: 0.6, seed: 86 });    // more gnawed spill along the south gutter
  }

  // ================= E1 · KI — "THE FIRST MOUTHFUL" ===========================
  // The salting floor. Two aligned trough rows leave one dark aisle — the
  // night-flesher's walk — and the troughs themselves are the rear-approach
  // cover the devour wants. The crimson mote glows in the gutter pocket where
  // the row's blood drains: the first red in a violet-and-amber world.
  {
    const clear = [
      { x0: -4, z0: 0, x1: 10, z1: 0, pad: 0.7 },            // the night-flesher's aisle
      { x0: -8, z0: -1.5, x1: 14, z1: 1.5, pad: 0.3 },       // through lane
      { x: -6, z: -5, r: 1.0 },                              // the blood-gutter pocket — the flesher's blind rear approach, kept open
      { x: 3, z: 0, r: 1.2 },                                // checkpoint pad
    ];
    // the trough rows — stone salting benches, squared to the aisle (their
    // users heave meat between them all day; nothing blocks the rows)
    kit.sarcophagus(-2, 3.4, { rot: 0.03 });
    kit.sarcophagus(2.5, 3.4, { rot: -0.02 });
    kit.sarcophagus(7, 3.4, { rot: 0.04 });
    kit.sarcophagus(0, -3.6, { rot: -0.03 });
    kit.sarcophagus(4.5, -3.6, { rot: 0.02 });
    kit.sarcophagus(9, -3.6, { rot: -0.04 });
    // TABLEAU 2: the bench mid-job — the barrow pulled up to a trough, salt
    // sacks leaning where the boy left them, supper waiting at the lit stall.
    kit.cart(5.9, 2.2, { rot: 0.12, seed: 21 });
    kit.sack(4.9, 3.0, { seed: 22 });
    kit.crate(2.4, 6.8, { size: 0.8, rot: 0.08, seed: 23 });    // his crate seat, by the pan
    kit.sack(4.5, 7.0, { r: 0.34, seed: 24 });                  // his supper sack
    // salt comes in at the west door and is stacked where the carts drop it
    kit.wallRun(-7.35, -6.5, -7.35, 6.5, [{ prop: "sack", w: 2 }, "barrel"], {
      spacing: 2.2, inset: 0, face: "wall", seed: 25, clear,
    });
    // the salt-boy's dark half of the stall wall, stripped to crates
    kit.corner({ x0: -8, z0: -8, x1: 14, z1: 8 }, "se",
      [{ prop: "crateStack", w: 2, foot: 0.8 }, "barrel"], { count: 3, clear, seed: 26 });
    kit.rubble(-7, -6.6, { radius: 0.7, seed: 27 });            // the gutter mouth, crusted
    kit.inscription(3, 2.4, 7.72, "THE MAW REMEMBERS WHAT THE EYE FORGETS", Math.PI, "#ff4a5e"); // [KEPT] red = the maw's own colour
  }

  // ================= E2 · SHŌ — "WHAT YOU CANNOT EAT" =========================
  // The row proper. West: the meat stalls, rush-silent and black — the
  // Listener's ground; its lamps are dead fixtures the Vigil never relit.
  // Mid: the render corner — vats banked for the night, the mess-pan burning,
  // the one shut stall dark in the line of pans (the mote's pocket). The
  // player walks from neglect toward tended light, which is the walk toward
  // the Eye.
  {
    const clear = [
      { x0: 22, z0: -5, x1: 22, z1: 5, pad: 0.7 },           // the Listener's cross-lane
      { x0: 30, z0: -7, x1: 36, z1: -7, pad: 0.7 },          // the render-watch's vat line
      { x0: 18, z0: -1.5, x1: 38, z1: 1.5, pad: 0.3 },       // through lane
      { x: 31, z: 7, r: 1.0 },                               // maw2 — the shut stall's mouth
      { x: 20, z: 8, r: 0.9 },                               // checkpoint pads
      { x: 34, z: -9, r: 0.9 },
    ];
    // WEST — the meat stalls (dark, silent; dressing hugs the bays, never the lanes)
    kit.chains(21.9, 9.6, { y: 2.7, len: 1.4, seed: 31 });   // hanging racks, emptied at close
    kit.chains(25.1, 9.4, { y: 2.7, len: 1.2, seed: 32 });
    kit.chains(22.6, -9.5, { y: 2.7, len: 1.3, seed: 33 });
    kit.crate(21.4, 9.0, { rot: 0.06, seed: 34 });           // a bay's counter crates, squared to the lane
    kit.crate(22.4, 9.05, { size: 0.8, rot: -0.05, seed: 35 });
    kit.sack(24.6, 9.1, { seed: 36 });                       // the stripped bay next door
    kit.rubble(25.6, 9.6, { radius: 0.6, seed: 37 });
    kit.deadLantern(19.4, 8.9, { seed: 38 });                // the row's own lamps, snuffed — never relit at the meat end
    kit.deadLantern(26.9, 7.6, { seed: 39 });
    kit.deadLantern(22.8, -8.9, { seed: 40 });
    kit.sack(19.8, -9.3, { seed: 41 });                      // south bays: the gutted end
    kit.sack(22.3, -9.6, { r: 0.35, seed: 42 });
    kit.rubble(26.2, -9.3, { radius: 0.8, seed: 43 });
    // MID — the render corner. The vat line along the south wall (the watch's
    // whole job), the mess stall burning, the day stall cold beside it.
    kit.barrel(29.8, -9.3, { r: 0.62, h: 1.1, seed: 44 });   // the render vats, banked for the night
    kit.barrel(32, -9.3, { r: 0.62, h: 1.1, seed: 45 });
    kit.barrel(36.3, -9.3, { r: 0.62, h: 1.1, seed: 46 });
    kit.crate(36.6, -8.2, { size: 0.75, rot: 0.05, seed: 47 }); // the watch's seat at his east pause — where he is most alone
    kit.wallRun(38.5, -10.15, 41.5, -10.15, [{ prop: "barrel", w: 2 }, "crate"], {
      spacing: 1.5, inset: 0, face: "wall", seed: 48, clear,   // the night's yield, queued for the reeve
    });
    // the shut stall (maw2's bay): counters closed up, dark behind them
    kit.crate(30.2, 8.8, { rot: 0.04, seed: 49 });
    kit.sack(31.9, 8.9, { seed: 50 });
    // the porters' mess stall (lit): crate table and supper around the pan
    kit.crate(33.1, 8.8, { size: 0.85, rot: -0.06, seed: 51 });
    kit.sack(34.9, 8.9, { r: 0.36, seed: 52 });
    kit.sack(32.9, 9.6, { seed: 53 });
    // TABLEAU 3: the day crew's stall gone cold — dead pan, crate seat, empty
    // sacks — one bay from the night crew's pan still burning.
    kit.brazier(36.6, 8.7, { lit: false, seed: 54 });
    kit.crate(37.3, 9.0, { size: 0.8, rot: 0.07, seed: 55 });
    kit.sack(36.0, 9.4, { r: 0.32, seed: 56 });
    kit.inscription(22, 1.8, 10.72, "IT DOES NOT SEE. IT ONLY LISTENS.", Math.PI, "#7a6bb0"); // [KEPT]
  }

  // ================= E3 · TEN — "UNDER THE EYE" ===============================
  // The tax floor. The Vigil's first engine hangs over the row's money: the
  // Pharos rakes the glazed floor and the gate lane it was mounted to watch.
  // Beneath it, the reeve's counting order — lamp-priest statues flanking the
  // Eye, offering urns at the counting lamps, the dawn shipment staged along
  // the east wall — and the Marrowlight on its weigh-plinth in the south alcove,
  // in the Eye's own blind spot at its foot.
  {
    const clear = [
      { x0: 38, z0: -1.5, x1: 50, z1: 1.5, pad: 0.3 },       // the gate lane the beam guards
      { x: 44, z: 10, r: 1.6 },                              // the Pharos base
      { x: 46, z: -8, r: 1.6 },                              // the weigh-plinth
      { x0: 38, z0: -11, x1: 50, z1: -6, pad: 0.2 },         // keep the alcove approach readable
      { x: 42, z: 5, r: 0.9 },                               // the awning columns are the real cover — leave them clean
      { x: 48, z: 7, r: 0.9 },
    ];
    kit.flank(44, 8.5, "statue", { gap: 2.6, dir: 0, face: "in", clear, seed: 61 }); // lamp-priests kneeling to the Eye
    kit.banner(44, 2.5, 10.7, Math.PI, { w: 1.4, color: 0xffb46a, seed: 62 });       // the reeve's tax banner beneath it
    vigilShrine(kit, 40, 6, { gap: 1.4, urnScale: 0.85, clear, seed: 63 });          // offering urns at each counting lamp —
    vigilShrine(kit, 46, -3, { gap: 1.5, urnScale: 0.9, clear, seed: 64 });          //   tended, sacred, "do not stand here"
    kit.brazier(41.2, 9.3, { lit: false, seed: 65 });        // offerings at the Eye's foot burn only on tithe-days
    kit.urn(47.4, 9.6, { scale: 0.8, seed: 66 });
    // the dawn shipment, weighed and staged along the east wall, gapped at the lane
    kit.wallRun(49.4, -6.5, 49.4, -2.5, [{ prop: "crate", w: 2 }, "barrel"], {
      spacing: 1.6, inset: 0, face: "wall", seed: 67, clear,
    });
    kit.wallRun(49.4, 2.5, 49.4, 9.5, [{ prop: "crateStack", w: 2, foot: 0.78 }, "sack"], {
      spacing: 2.2, inset: 0, face: "wall", seed: 68, clear,
    });
    kit.inscription(46, 2.0, -10.7, "TAKE WHAT THE EYE HAS NOT YET COUNTED", 0, "#ffd76a"); // [KEPT] in the alcove
  }

  // ================= E4 · KETSU — "FED, AND FLEEING" ==========================
  // The porters' gate disgorging you — plain, dark, fast. TABLEAU 4: the dawn
  // shipment staged and the gate-pan burning for a porter who is out on the
  // road; the rift stands in the gateway, flanked by the gate's own dead lamps.
  kit.crate(54.5, 4.9, { size: 0.8, rot: 0.05, seed: 71 });   // the porter's seat by his pan
  kit.cart(56, -3.4, { rot: 0.08, seed: 72 });                // the half-loaded tallow cart
  kit.crateStack(57.4, -4.4, { seed: 73 });
  kit.wallRun(58.5, -5.3, 61.2, -5.3, [{ prop: "crate", w: 2 }, "sack"], {
    spacing: 1.5, inset: 0, face: "wall", seed: 74,
    clear: [{ x: 58, z: 0, r: 1.6 }],
  });
  kit.deadLantern(58, 2.7, { seed: 75 });                     // the gate's dead lamps frame the rift
  kit.deadLantern(58, -2.7, { seed: 76 });

  // ================= ambient (low key — pans and shadow must read) ============
  // One near-overhead moon at the shipped intensity; NO invisible fills (Law of
  // Light) — their duty is carried by the fixtured pans above.
  const moon = new THREE.DirectionalLight(0x8ea0cc, TUNE.moon);
  moon.position.set(...TUNE.moonFrom);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);

  // ================= checkpoints ===============================================
  kit.checkpoint(-17, 0, 3);
  kit.checkpoint(3, 0, 3.5);
  kit.checkpoint(20, 8, 3, 20, 8);
  kit.checkpoint(34, -9, 3, 34, -9);
  kit.checkpoint(46, -9, 3, 46, -9);
  kit.checkpoint(58, 0, 3);

  // ================= triggers / four-beat teaching (terse, mechanic-first) =====
  kit.trigger("start", -14, 0, 3);
  kit.trigger("devourRoom", -6, 0, 3);
  kit.trigger("gorge", 20, 0, 4);
  kit.trigger("vesperZone", 29, -3, 3);
  kit.trigger("pharosZone", 39, 0, 4);
  kit.trigger("escape", 56, 0, 3);

  bag.stage = 0;
  bag.objective = "Find a way to feed";
  bag.onStart = (game) => game.hud.prompt("Something in you has gone hungry.", 3.5);
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "start":
        if (bag.stage === 0) {
          bag.stage = 1;
          p.prompt("A crimson mote waits ahead — drift over it to feed.", 4);
        }
        break;
      case "devourRoom":
        if (bag.stage === 1) {
          bag.stage = 2;
          game.setObjective("Feed, then devour a Vesper");
          p.prompt(game.isTouch
            ? "Feed on the mote, then tap <b>❖</b> behind a Vesper to swallow it. From the front it only shoves."
            : "Feed on the mote, then press <span class='keycap'>F</span> behind a Vesper to swallow it. From the front it only shoves.", 5);
        }
        break;
      case "gorge":
        if (bag.stage === 2) {
          bag.stage = 3;
          game.setObjective("Cross the row unseen");
          p.prompt("The <b>Snuffed</b> is blind — it hunts by sound. Keep to the moss; don't lunge here.", 4.5);
        }
        break;
      case "vesperZone":
        if (!bag._vesperSeen) {
          bag._vesperSeen = true;
          p.prompt("A second mote is near. Feed, circle behind, devour again.", 4);
        }
        break;
      case "pharosZone":
        if (bag.stage === 3) {
          bag.stage = 4;
          game.setObjective("Take the relic beneath the Eye");
          p.prompt("The <b>Pharos</b> can't be doused, lured, or eaten. Read its sweep and cross.", 4.5);
        }
        break;
      case "escape":
        if (game.scepterTaken && !bag._escapeSeen) {
          bag._escapeSeen = true;
          p.prompt("The rift is close. Run.", 3);
        }
        break;
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.3;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    game.hud.prompt("The relic wakes — every watcher knows your shape. <b>Run.</b>", 3);
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 7 + tc.x));
    }
    // scepter: bobbing/spinning, then rides the thief once taken
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

  bag.startVials = 0;
  return bag;
}
