import * as THREE from "three";
import { makeKit } from "../levelKit.js";
import { workRank, barredVista } from "./_dressing.js";

/**
 * MISSION 6 — THE GREAT CHANDLERY  (level index 5) — SUN.
 *
 * ============================== SITE DOSSIER =================================
 * WHAT: The Candent Vigil's candle manufactory — the works where the Fleshers'
 *   Row's tallow is boiled, dipped, cured, counted, and crated into the candles
 *   that light every sill in Lanternspire. A wax-house fears its own trade:
 *   one loose flame and the season burns — so the Vigil boils under open sky,
 *   banishes fire from the stores and the curing court, and lets its greatest
 *   lamp, the noon sun, stand watch over the yards through the roof the last
 *   fire already took. Deepest, in the counting-crypt, rests the LIGHT-HEART:
 *   the master-gem the Vigil claims every candle is lit "in the image of."
 * WHO: the DOCK-STEWARD (receives the tallow wagons, tallies the casks in);
 *   the VAT-STOKERS (feed the boil-hearths and skim the melt from the raised
 *   walk); the DIPPERS and their DIP-MASTER (walk the trough lines, sinking
 *   frames of wicks); the RACK-HANDS (wheel dipped frames to the curing court
 *   — where no flame may follow them); the TALLY-CLERK (counts the finished
 *   candles and checks the glass chimney-ware for flaws in the sun-scar).
 * PARTI: loading dock → melt court (roofless — the boil goes under open sky)
 *   → dipping gallery (the works' dark heart, the Pharos' floor) → racking
 *   court (roofless, flameless — wax cures in still air) → counting room →
 *   THE CRYPT of the Light-Heart. Tallow flows in at the dock and west down
 *   the intake lane to the WAX STORES — the cold, flameless cellar-run where
 *   finished candles wait, watched by things that carry no flame at all. Work
 *   flows south: melt → dip → cure → count → the crypt. The two roads meet
 *   again at the crypt's landing.
 * WHY THE RELIC IS HERE: the LIGHT-HEART is the works' consecration — a glass
 *   heart the Vigil set where the counting ends, so every tally closes under
 *   its light. The crypt's builders cut a NOON-SLOT in the south wall, aimed
 *   so the sun itself lays a blade of light on the pedestal each day: the one
 *   lamp in the Chandlery that cannot gutter, spilled on the one thing the
 *   Vigil will not let the dark reclaim. Deepest room, behind court, gallery,
 *   racks, and the clerk's door — and lit by the enemy's own sky.
 * TABLEAUX: (1) the Fleshers' Row wagon stands half-unloaded inside the barred
 *   dock gate, casks still lashed — the noon bell broke the porters mid-shift;
 *   (2) a shelf-rank of surrendered lamps at the wax-stores door, one cold
 *   hand-pan beside the jamb — no flame passes, and no sign needs to say it;
 *   (3) a dipping frame left sunk mid-dip in the trough, the dipper's stool
 *   pushed back, his supper still on it; (4) the flaw-check — glass chimneys
 *   ranked in the counting room's sun-scar, one reject set apart on its sack,
 *   the clerk's lamp still burning over an open tally desk.
 * THE NIGHT SHIFT (the noon shift — the works break for the meal, the watch
 *   does not): the DOCK-WARD paces inside the works door, facing it; his
 *   pauses are the tally desk (east) and the stalled wagon (west). The STOKER
 *   walks the vat line, pausing at each hearth — someone must keep the boil.
 *   The COURT-WARD walks the west flank in full sun, the one road no thief
 *   should want. The DIP-MASTER owns the trough line; the RACK-OVERSEER walks
 *   the south aisle, glancing through the rack-check windows. The RACK-WARD
 *   crosses the curing court's open moat, pausing to count the staged stacks.
 *   In the crypt, the HEART-WARD walks the sun-scar before the pedestal and
 *   the LANDING-WARD wanders the west landing where the stores let out. The
 *   STORE-BLIND — three Snuffed — thread the flameless cells by ear alone.
 *   Over the dipping floor hangs the PHAROS-LENS: the Vigil's eye on the one
 *   floor where its fuel runs molten.
 * =============================================================================
 *
 * Teaches SUN — the one light you cannot switch off (REDESIGN_5-8, M6):
 *   E1 KI    — THE THRESHOLD    : the dark dock; one blazing door-patch where
 *              the works door opens south. First read of the sun. No threat.
 *   E2 SHŌ   — THE MELT COURT   : roofless, ringing wax-glass floor; shade
 *              only at the far wall's foot, under the skimming walk, and in
 *              the vats' hard lees. CLIMB re-used in the sun's service; the
 *              door vigil-lamp is the douse that changes nothing.
 *   E3 SHŌ   — THE DIPPING GALLERY: indoors, dark, and owned by the PHAROS —
 *              the temporal light, back to back with E2's spatial one. Sun
 *              enters only as the burned north aisle and two window-patches.
 *   E4 TEN   — THE RACKING COURT: the Turn. No flame is permitted here, so
 *              there is NOTHING TO DOUSE — only the rack-shade, the staged
 *              stacks' lees, and the far wall's band. The sun is weather;
 *              stand where the world already turned it off.
 *   E5 TEN   — THE CRYPT        : the Light-Heart stands in the noon-slot's
 *              blade. Douse can darken the approach — never the blade.
 *   E6 KETSU — THE HALL WAKES   : the shade-map in reverse, as a beacon.
 *
 * SHOWCASE — GLASS AND REFRACTION: the Light-Heart is the kit's transmission
 * gem, and this level builds outward from it: the noon-slot lays real sun on
 * real glass; the tally-clerk ranks glass lamp-chimneys in the counting room's
 * sun-scar to check them for flaws (glass deliberately stood in direct sun,
 * with a resident reason); the crypt's inspection window and the gallery's two
 * rack-check windows are glazed panes the light crosses; and wax aprons — the
 * years of spill around vats and troughs, scrubbed to amber gloss — carry the
 * sheen across the floors. All glass is MeshPhysicalMaterial transmission in
 * the traced pass (the scepterPedestal pattern — never emissive, never an NEE
 * emitter); with refraction OFF it degrades to glossy transparent PBR and the
 * wax aprons to dark-amber GGX gloss, so every composition still reads with
 * reflections AND volumetrics off. No emissive-NEE area lights anywhere.
 *
 * THE SUN: one white-gold directional key from the kit-south at ~52° elevation
 * (the fiction says noon; the geometry says "as high as a roofless engine can
 * carry" — every interior here is shaded by a tall sun-side wall, so the sun
 * must still clear a room's own height to be blocked by it). Shadow bands run
 * ~0.79× a wall's height along its kit-north foot — so every wall the player
 * MARCHES TOWARD offers a shade footing, and every wall behind them is bare.
 * It cannot be doused: vials snuff bag.torches, and the sky is not on that
 * list. The meter reads it LOS-gated, exactly as the tracer draws it.
 *
 * Geometry is kit.wall runs — overlapped joints, ONE pier per corner
 * (PLACES.md hygiene); the skimming walk is kit.platform/ramp/railing (5–8
 * vocabulary). No invisible fills (the shipped three are removed — their duty
 * moves into the sun, the hearths, and the sky tint the meter never reads).
 * Difficulty is the shipped roster: 8 Vespers + 3 Snuffed + 1 Pharos, same
 * speed/pause/range/cone numbers — only their posts moved with the site.
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
// Guard/eye/vial numbers are [KEPT] from the shipped level.
const TUNE = {
  sun: { color: 0xfff1cf, intensity: 3.0, pos: [6, 34, -26] }, // kit-south noon key, elev ≈52° → shade bands ≈0.79×h on north wall-feet
  sky: { color: 0x2c3a55, intensity: 0.42 },            // visual-only sky fill (AmbientLight — the light meter never reads it)
  bg: 0x2b3a52,                                         // washed noon sky, dimmed to the game's register
  shrine:    { intensity: 5, range: 8 },                // the dock's gate-shrine lamp (piety burns at noon too)      [KEPT 5/8]
  vigilLamp: { intensity: 8, range: 7 },                // the work door's vigil-flame (E2's douse-that-changes-nothing)
  tallyLamp: { intensity: 6, range: 7 },                // the clerk's desk lamp — the counting room's dark half needs it
  cryptLamp: { intensity: 6, range: 9 },                // the crypt's flanking pair — dousable; they shape the road, never the blade [KEPT 6/9 ×2]
  hearth:    { light: 3.5 },                            // a boil-hearth's coal glow (brazier — NOT douseable; you can't vial a coal bed)
  vDock:    { speed: 1.2, pause: 1.4, range: 9 },       // the dock-ward (pauses = tally desk / the wagon)            [KEPT]
  vStoker:  { speed: 1.4, pause: 1.0 },                 // the stoker's vat line (pauses = the hearths)               [KEPT]
  vCourt:   { speed: 1.4, pause: 1.0 },                 // the court-ward, west flank in full sun                     [KEPT]
  vDip:     { speed: 1.5, pause: 0.8, range: 9 },       // the dip-master on the trough line (short cone — indoors)   [KEPT]
  vRackO:   { speed: 1.3, pause: 1.2 },                 // the rack-overseer, south aisle + window checks             [KEPT]
  vRackW:   { speed: 1.3, pause: 1.2 },                 // the rack-ward on the curing court's moat                   [KEPT]
  vHeart:   { speed: 1.3, pause: 1.5 },                 // the heart-ward before the pedestal                         [KEPT]
  vLanding: { speed: 1.1, pause: 1.8 },                 // the landing-ward where the stores let out                  [KEPT]
  sBlind1:  { speed: 0.95, pause: 2.6, blind: true },   // the STORE-BLIND — three Snuffed in the flameless cells     [KEPT]
  sBlind2:  { speed: 1.0,  pause: 2.2, blind: true },   //                                                            [KEPT]
  sBlind3:  { speed: 1.05, pause: 1.8, blind: true },   //                                                            [KEPT]
  pharos: { dir: 0, sweep: 0.85, sweepSpeed: 0.45, range: 24, coneAngle: 0.24, height: 3.4 }, // the PHAROS-LENS (dir 0 = facing kit-east down the gallery) [KEPT numbers]
  beaconMul: 1.35,                                      // guard speed × on the theft                                 [KEPT]
  deck: { y: 2.55 },                                    // the skimming walk's tier
  cloth: 0xffb46a,                                      // Vigil amber
};

export function buildChandlery() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(TUNE.bg);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "chandlery";
  bag.name = "THE CHANDLERY";
  bag.spawn.set(0, 0.42, 35);
  bag.bounds = { x0: -34, z0: -33, x1: 21, z1: 42 };
  bag.startVials = 4;                                   // [KEPT]
  bag.blinkCdMul = 0.7;                                 // [KEPT] fast blink

  // base dark slab under the whole footprint — seams never read as void [KEPT]
  kit.floor(58, 76, -7, 4, kit.mats.dark, -0.18);

  // ---- local showcase builders (glass + wax — see SHOWCASE note above) ------
  // A GLASS piece follows the scepterPedestal pattern exactly: transmission
  // MeshPhysicalMaterial, kept IN the traced pass (never rtExclude) so 0.4.0
  // refracts through it; transparent materials never occlude, so none of these
  // join bag.occluders (glass must not cast gameplay shade or block LoS) and
  // none carry colliders (they are shelf/sill ware, not cover).
  const glassMat = () => new THREE.MeshPhysicalMaterial({
    color: 0xe9ddc6, roughness: 0.06, metalness: 0.0,
    transmission: 1.0, thickness: 0.25, ior: 1.5, transparent: true,
  });
  /** A lamp-chimney: an open glass tube on a small stone foot. */
  const glassChimney = (x, z, o = {}) => {
    const { h = 0.56, r = 0.15, rot = 0 } = o;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.15, r * 1.25, 0.07, 10), kit.mats.stone);
    foot.position.y = 0.035;
    g.add(foot);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.78, r, h, 10, 1, true), glassMat());
    tube.position.y = 0.07 + h / 2;
    g.add(tube);
    scene.add(g);
    return g;
  };
  /** A glazed pane filling a window opening (the wall run leaves the gap). */
  const glassPane = (x, y, z, w, h, rotY = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), glassMat());
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    scene.add(m);
    return m;
  };
  // A WAX APRON — years of spill scrubbed to deep amber gloss. Proud of the
  // floor by design (wax builds UP): top ≥0.02 above any surface plate, so no
  // coplanar faces. Dark low-rough standard PBR (the mirrorPool degrade
  // recipe): a GGX sheen at every preset, a traced gloss with reflections on.
  const waxMat = new THREE.MeshStandardMaterial({ color: 0x4a2a08, roughness: 0.12, metalness: 0.45 });
  const waxApron = (x0, z0, x1, z1) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.05, z1 - z0), waxMat);
    m.position.set((x0 + x1) / 2, 0.106, (z0 + z1) / 2);
    scene.add(m);
    return m;
  };

  // ======================= A · THE LOADING DOCK (x -8..8, z 30..38) ==========
  // --- The dock-steward's floor: the Fleshers' Row wagons come in at dawn by
  // --- the north gate (barred now), tallow is tallied at the desk and rolled
  // --- west down the intake lane to the stores. The works wall (z30, h10)
  // --- keeps the whole dock in its own shade — the one dark room the sun
  // --- never argues with — and the rift stands here, at Hush's back.
  kit.floor(16, 8, 0, 34);
  kit.surface(-8, 30, 8, 38, "obsidian");
  kit.wall(-8, 38, 8, 38, { h: 5 });                      // gate wall (owns its corners)
  kit.pier(-2.6, 38, 5.6, 0.5);                           // the wagon gate's own piers
  kit.pier(2.6, 38, 5.6, 0.5);
  kit.solid(1.9, 4.4, 0.28, -1.02, 37.55, kit.mats.dark); // the barred gate leaves — shut till the dawn wagons
  kit.solid(1.9, 4.4, 0.28, 1.02, 37.53, kit.mats.dark);
  kit.wall(8, 30, 8, 38, { h: 5, piers: false });         // east wall (corners owned by neighbours)
  kit.wall(-8, 33, -8, 38, { h: 5, piers: false });       // west wall, north of the intake lane mouth
  // the WORKS WALL — the tall spine between dock and melt court. Its height is
  // the dock's roof: at this sun, h10 shades the full 8m room. One work door.
  kit.wall(-18, 30, -2, 30, { h: 10, th: 0.5 });          // west of the work door (owns (-18,30) + the west jamb)
  kit.wall(2, 30, 8, 30, { h: 10, th: 0.5 });             // east of it (owns the east jamb + (8,30))
  kit.railing(-2.3, 30.02, 2.3, 30.02, { y: 2.7, h: 7.2, t: 0.48, mat: kit.mats.wall }); // the door's LINTEL (banded — walkers pass
                                                          // beneath): the sun enters the dark dock as ONE door-shaped patch (the E1 read), not a 10m slit
  kit.extraction(-3, 36);                                 // [KEPT] the rift, in the gate's deepest shade
  kit.trim(3.0, 0.2, -3, 2.2, 37.72, 0, 0x39f0c0, 1.8);   // [KEPT] its glow-trim on the gate wall
  kit.torch(5.9, 30.9, TUNE.shrine);                      // the GATE-SHRINE lamp by the works door — piety burns at noon too [KEPT 5/8]
  kit.guard([[-3, 31.6], [3, 31.6]], TUNE.vDock);         // the DOCK-WARD: paces inside the works door, facing it; pauses = tally desk (E) / the wagon (W) [KEPT]
  kit.inscription(0, 2.5, 30.32, "KEEP THE FIRES FED", "n", "#ffb46a"); // [KEPT] the works' liturgy over its own door

  // ======================= B · THE INTAKE LANE (x -18..-8, z 30..33) =========
  // --- The fat-porters' barrow run: dock to stores, three strides wide, in
  // --- the works wall's shade the whole way. Moss — barrow wheels want quiet
  // --- floors, and so does Hush. The stores' door at its west end is where
  // --- the fire law begins.
  kit.floor(10, 3, -13, 31.5);
  kit.surface(-18, 30, -8, 33, "moss");
  kit.wall(-18, 33, -8, 33, { h: 6 });                    // lane's north wall (owns (-18,33) and (-8,33))

  // TABLEAU 1 · THE HALF-UNLOADED WAGON — the Fleshers' Row cart inside the
  // barred gate, two casks still lashed; the noon bell broke the porters
  // mid-shift and their meal waits by the door. (M3's trade, arriving here.)
  {
    const clear = [
      { x: 0, z: 35, r: 2.2 },                            // spawn pad
      { x: -3, z: 36, r: 1.7 },                           // the rift
      { x0: -3.6, z0: 30.9, x1: 3.6, z1: 32.3, pad: 0.4 },// the dock-ward's line
      { x0: -2.2, z0: 29.4, x1: 2.2, z1: 31.6, pad: 0.3 },// the work-door lane
      { x0: -8.6, z0: 30, x1: -7.4, z1: 33, pad: 0.3 },   // the intake-lane mouth
      { x0: -2.2, z0: 36.9, x1: 2.2, z1: 38 },            // the barred gate leaves
      { x: 5.9, z: 30.9, r: 1.2 },                        // the shrine lamp
    ];
    kit.cart(3.4, 35.3, { rot: 2.85, seed: 3 });          // the wagon, swung round for unloading
    kit.barrel(2.1, 34.2, { seed: 4 });                   // two casks down…
    kit.barrel(1.3, 35.4, { r: 0.4, seed: 5 });
    kit.sack(4.6, 34.3, { r: 0.34, seed: 6 });            // …the lashings' dunnage
    workRank(kit, -6.9, 33.6, -6.9, 37.2,                 // the intake queue: casks ranked at the lane mouth, in from the last wagons
      { prop: "barrel", count: 3, face: "wall", clear, seed: 7 });
    kit.crate(4.9, 32.6, { rot: 0.08, seed: 8 });         // the tally desk under the shrine lamp
    kit.crate(6.1, 33.3, { size: 0.62, rot: -0.1, seed: 9 }); // the steward's stool
    kit.sack(-4.9, 30.9, { r: 0.32, seed: 10 });          // the porters' meal, set down at the bell
    kit.banner(-4.8, 3.6, 30.34, "n", { w: 1.2, color: TUNE.cloth, seed: 11 }); // works cloth on the tall wall
    kit.banner(4.8, 3.55, 30.36, "n", { w: 1.2, color: TUNE.cloth, seed: 12 });
  }

  // ======================= C · THE WAX STORES (x -30..-18, z -12..33) ========
  // --- The cold cellar-run where the season's candles wait: NO FLAME PASSES
  // --- this door — heat is the one thief the Vigil fears more than Hush — so
  // --- the cells hold no lamp at all, and the watch is three Snuffed, blind,
  // --- flameless, fishing for footsteps by ear. Tall shelf-walls partition
  // --- the run into six cells; the burned roof lets the sun in only as thin
  // --- dashes at each cell's north lip. Moss underfoot — cool, damp, silent.
  // --- The ghost road: dock → intake lane → the cells → the crypt landing.
  kit.floor(12, 45, -24, 10.5);
  kit.surface(-30, -12, -18, 33, "moss");
  kit.wall(-30, 33, -18, 33, { h: 6, piers: false });     // north wall ((-18,33) piered by the lane's run)
  kit.pier(-30, 33, 6.3);                                 // its own west corner
  kit.wall(-30, -12, -30, 33, { h: 7, piers: false });    // west wall — dead; more works behind it
  kit.pier(-30, 10, 7.3, 0.42);                           // its mid-run pier
  // east wall x-18 — shared with court/gallery/rack court. Two doors: the
  // intake door (z30..33, the lane) and the RACK DOOR (z10..13 — cooled
  // candles come in from the gallery; the shipped "vent", made a legal door).
  kit.wall(-18, -12, -18, 10, { h: 7, piers: false });    // south run, up to the rack door
  kit.pier(-18, 10, 7.4);                                 // rack door jambs
  kit.pier(-18, 13, 7.4);
  kit.wall(-18, 13, -18, 30, { h: 7, piers: false });     // between rack door and intake door ((-18,30) piered by the works wall run)
  // the SHELF-WALLS — six cells. h7 racks: at this sun each cell's own south
  // shelf shades all but a thin dash at its north lip (the burned-roof light).
  // Door gaps alternate mid-west / mid-east → the serpentine the Blind walk.
  kit.wall(-29.85, 25, -24.6, 25, { h: 7, piers: false }); // cell shelf, gap EAST (x -24.6..-21.6)
  kit.wall(-21.6, 25, -18.15, 25, { h: 7, piers: false });
  kit.wall(-29.85, 19, -26.4, 19, { h: 7, piers: false }); // gap WEST (x -26.4..-23.4)
  kit.wall(-23.4, 19, -18.15, 19, { h: 7, piers: false });
  kit.wall(-29.85, 13, -24.6, 13, { h: 7, piers: false }); // gap EAST
  kit.wall(-21.6, 13, -18.15, 13, { h: 7, piers: false });
  kit.wall(-29.85, 7, -26.4, 7, { h: 7, piers: false });   // gap WEST
  kit.wall(-23.4, 7, -18.15, 7, { h: 7, piers: false });
  kit.wall(-29.85, 1, -24.6, 1, { h: 7, piers: false });   // gap EAST
  kit.wall(-21.6, 1, -18.15, 1, { h: 7, piers: false });
  kit.pier(-24.6, 25, 7.2, 0.32); kit.pier(-21.6, 25, 7.2, 0.32); // shelf-end piers at the gap jambs
  kit.pier(-26.4, 19, 7.2, 0.32); kit.pier(-23.4, 19, 7.2, 0.32); // (west/east shelf ends tuck into the long walls)
  kit.pier(-24.6, 13, 7.2, 0.32); kit.pier(-21.6, 13, 7.2, 0.32);
  kit.pier(-26.4, 7, 7.2, 0.32);  kit.pier(-23.4, 7, 7.2, 0.32);
  kit.pier(-24.6, 1, 7.2, 0.32);  kit.pier(-21.6, 1, 7.2, 0.32);
  kit.cache("c1", -27.5, 22, 2);                          // [KEPT n=2] deep in cell two
  kit.cache("c2", -20.5, 3.5, 2);                         // [KEPT n=2] cell five, off the serpentine
  kit.mawMote("cmaw", -27.5, -9);                         // [KEPT] the last cell's darkest corner
  // THE STORE-BLIND — three Snuffed thread the cells by ear [KEPT specs]; the
  // south round is an explicit there-and-back (paths LOOP — no wrap diagonal).
  kit.guard([[-23, 29], [-23, 21.5]], TUNE.sBlind1);      // cells one–two, through the z25 east gap
  kit.guard([[-22.4, 16.5], [-22.4, 9.5]], TUNE.sBlind2); // cells three–four, through the z13 east gap
  kit.guard([[-23, 4.5], [-23, -1.5], [-27.5, -5], [-23, -1.5]], TUNE.sBlind3); // cells five–six through the z1 gap: an L-round, walked there and back
  // the walls remember, in order, as you creep south [KEPT lines]
  kit.inscription(-29.6, 1.9, 22, "I remember the vats. I remember being poured.", "e", "#9a86d8");
  kit.inscription(-29.6, 1.9, 4, "What the Old Dark surrenders, the Vigil renders bright.", "e", "#ffb46a");

  // TABLEAU 2 · THE SURRENDERED LAMPS — a shelf-rank of dead lanterns at the
  // stores' door, one cold hand-pan by the jamb: no flame passes, and no sign
  // needs to say it. The law, stated in ironmongery.
  {
    const clear = [
      { x0: -18.6, z0: 30, x1: -17.4, z1: 33, pad: 0.3 }, // the intake door lane
      { x0: -24, z0: 20.5, x1: -22, z1: 30, pad: 0.4 },   // the north Blind's beat
      { x: -27, z: 28, r: 1.4 },                          // checkpoint pad, west aisle
      { x: -27.5, z: 22, r: 1.1 },                        // c1
    ];
    workRank(kit, -19.6, 29.2, -23.8, 29.2,               // the lamp-shelf, squared to the north wall
      { prop: "deadLantern", count: 4, face: "wall", clear, seed: 15 });
    kit.brazier(-18.9, 31.9, { lit: false, seed: 16 });   // the cold hand-pan, set down at the jamb
    // candle crates, ranked cell by cell where the shelf-walls want them
    workRank(kit, -29.0, 26.2, -29.0, 31.5, { prop: "crate", propOpts: { size: 0.85 }, count: 3, face: "wall", clear, seed: 17 });
    workRank(kit, -19.2, 20.2, -19.2, 24.2, { prop: "crate", propOpts: { size: 0.8 }, count: 3, face: "wall", clear, seed: 18 });
    kit.cluster(-28.6, 15.2, [{ prop: "crateStack", w: 2, foot: 0.8 }, "sack"], { count: 3, footprint: 1.0, backDir: Math.atan2(-1, -0.4), clear, seed: 19 });
    workRank(kit, -19.2, -0.6, -19.2, -4.6, { prop: "barrel", count: 3, face: "wall", clear, seed: 20 }); // wick-spool casks, cell six
    kit.sack(-28.8, -6.2, { r: 0.36, seed: 21 });
    kit.rubble(-28.9, -10.6, { radius: 0.7, seed: 22 });  // the roof-fall the fire left, swept to the dead corner
  }

  // ======================= D · THE MELT COURT (x -18..16, z 14..30) ==========
  // --- The boil goes under open sky — a wax-house never roofs its fires. The
  // --- floor is years of spill scrubbed to wax-glass: it RINGS underfoot, and
  // --- at noon it blazes — light and noise stack on the open crossing. Three
  // --- boil-vats stand in their hearths' heat down the east-centre line, each
  // --- throwing one hard lee of shade; the works wall's band (the dock side)
  // --- is bare sun, the gallery wall's band (the far side) is the one long
  // --- shade lane, and the SKIMMING WALK rides the east wall — the stokers
  // --- skim the melt from above, and its planks shade the drip-lane beneath.
  kit.floor(34, 16, -1, 22);
  kit.surface(-18, 14, 12.6, 30, "crystal");              // the wax-glass field — lit AND loud
  kit.surface(12.6, 14, 16, 30, "moss");                  // the drip-lane under the walk — never scrubbed, soft with wax-moss
  kit.wall(16, 14, 16, 30, { h: 3.4, piers: false });     // east wall — the walk's parapet rides its top
  kit.wall(8, 30, 16, 30, { h: 5, piers: false });        // north-east stub, dock's east shoulder ((8,30) piered by the works run)
  kit.pier(16, 30, 5.3);                                  // its outer corner
  kit.pier(16, 14, 8.2);                                  // the SE corner where court, gallery and walk-parapet meet
  // GALLERY WALL (z14, h8) — the court's far shade-maker: its band is the one
  // continuous dark lane, and it leads to the two gallery doors.
  kit.wall(-18, 14, -4, 14, { h: 8 });                    // west of the work door (owns (-18,14) and the jamb)
  kit.wall(0, 14, 13, 14, { h: 8 });                      // between work door and skimmers' door
  kit.wall(15.5, 14, 16, 14, { h: 8, piers: false });     // east jamb stub
  kit.railing(-4.3, 14.02, 0.3, 14.02, { y: 2.7, h: 5.3, t: 0.46, mat: kit.mats.wall });  // the doors' lintels (banded) — each admits one LOW
  kit.railing(12.7, 14.04, 15.8, 14.04, { y: 2.7, h: 5.3, t: 0.46, mat: kit.mats.wall }); // glow into the far shade lane, not a wall-high slit of noon
  kit.torch(-1.9, 15.1, TUNE.vigilLamp);                  // the WORK DOOR's vigil-flame — the Vigil's piety over the threshold.
                                                          // Douse it: its little pool dies, and the court blazes on. First proof.
  // the BOIL-VATS + their hearths (braziers — coal beds, not douse targets)
  for (const vz of [18.5, 22.5, 26.5]) {
    kit.pillar(1.15, 2.9, 2, vz, kit.mats.rust);          // a vat — its hard lee falls north of it
    kit.brazier(0.35, vz, { lit: true, light: TUNE.hearth.light, seed: 30 + vz }); // its firing hearth, west side where the stoker tends
    waxApron(0.4, vz - 1.9, 3.9, vz + 1.9);               // the spill apron, scrubbed to amber gloss (showcase sheen)
  }
  // THE SKIMMING WALK — the stokers' raised road along the east wall: vat rims
  // sit at plank height, and the melt is skimmed from above. Ramp up mid-court;
  // a drop-gap in the west rail where the skimmers jump the drip-lane… and
  // where something patient could drop on the stoker's line below.
  kit.platform(12.6, 15, 16, 29, { y: TUNE.deck.y, mat: kit.mats.wood, surface: "moss", support: true });
  kit.ramp(6.4, 25.6, 12.7, 28.0, { axis: "x", y0: 0, y1: TUNE.deck.y, mat: kit.mats.wood, surface: "moss" });
  kit.railing(12.6, 15, 12.6, 20, { y: TUNE.deck.y, h: 0.85, mat: kit.mats.rust });   // west lip, south of the drop-gap
  kit.railing(12.6, 21.6, 12.6, 25.4, { y: TUNE.deck.y, h: 0.85, mat: kit.mats.rust });// …north of it, up to the ramp mouth
  kit.railing(12.6, 29, 16, 29, { y: TUNE.deck.y, h: 0.85, mat: kit.mats.rust });     // north lip
  kit.railing(12.6, 15, 16, 15, { y: TUNE.deck.y, h: 0.85, mat: kit.mats.rust });     // south lip
  kit.cache("c3", 14.4, 27, 1);                           // [KEPT n=1] bright and exposed — the climb's reward sits in full sun
  bag.caches[bag.caches.length - 1].mesh.position.y = TUNE.deck.y;
  // THE NOON SHIFT of the court [KEPT specs]:
  kit.guard([[-1, 17], [-1, 27.5]], TUNE.vStoker);        // the STOKER: the vat line, pausing at each hearth — someone keeps the boil
  kit.guard([[-13.5, 16.5], [-13.5, 28]], TUNE.vCourt);   // the COURT-WARD: the west flank in full sun — the road no thief should want
  kit.inscription(1, 2.6, 14.32, "Every wick in Lanternspire drinks a stolen dusk.", "n", "#ffb46a"); // [KEPT] over the work door

  // court dressing — the stokers' stores against the walls, the lanes honest
  {
    const clear = [
      { x0: -2.2, z0: 28.2, x1: 2.2, z1: 30, pad: 0.3 },  // work door lane (dock side)
      { x0: -4.2, z0: 14, x1: 0.2, z1: 16.2, pad: 0.3 },  // work door lane (gallery side)
      { x0: 13, z0: 14, x1: 15.7, z1: 16.2, pad: 0.3 },   // skimmers' door lane
      { x0: -2.4, z0: 16, x1: 0.4, z1: 28.5, pad: 0.5 },  // the stoker's line + hearths
      { x0: -14.5, z0: 15.5, x1: -12.5, z1: 29, pad: 0.4 },// the court-ward's flank
      { x0: 6.2, z0: 25.2, x1: 12.9, z1: 28.4, pad: 0.3 },// the ramp
      { x: -1.9, z: 15.1, r: 1.2 },                       // the vigil-lamp
      { x: -4, z: 17.5, r: 1.4 },                         // checkpoint pad
      { x0: 3.6, z0: 16.5, x1: 5.2, z1: 28.5, pad: 0.2 }, // the east work aisle past the vats
    ];
    // hearth-fuel billets, staged under the walk where the planks keep them dry
    kit.cluster(14.2, 17.6, [{ prop: "crateStack", w: 2, foot: 0.8 }, "barrel"], { count: 3, footprint: 1.0, backDir: Math.atan2(1, 0.3), clear, seed: 33 });
    kit.barrel(14.6, 21.2, { seed: 34 });
    // the skim-cask queue at the ramp's foot — full casks go up empty, come down heavy
    workRank(kit, 5.4, 24.6, 5.4, 20.6, { prop: "barrel", count: 3, face: "wall", clear, seed: 35 });
    // the west flank the court-ward owns: bare on purpose (sun + his cone —
    // honest negative space; the Vigil keeps its open floor open)
    kit.rubble(-17.2, 28.8, { radius: 0.8, seed: 36 });   // roof-fall against the dead corner
    kit.deadLantern(-16.9, 15.6, { fallen: true, rot: 0.6, seed: 37 }); // the court's old night-lamp — knocked flat and never re-hung; the sun does its shift now
    kit.banner(-8, 5.2, 14.34, "n", { w: 1.1, color: TUNE.cloth, seed: 38 }); // works cloth high on the gallery wall
  }

  // ======================= E · THE DIPPING GALLERY (x -18..16, z 2..14) ======
  // --- The works' dark heart: two long troughs of molten wax, the dipping
  // --- frames ranked between them, and the PHAROS-LENS in the west wall —
  // --- the Vigil's eye on the one floor where its fuel runs molten. The fire
  // --- took the roof over the NORTH aisle: ash-moss grew in the scar, so the
  // --- lit aisle is also the silent one, while the dark trough floor RINGS.
  // --- Two kinds of light, back to back: the sun stands still; the Eye does
  // --- not. Sun otherwise enters only as two window-patches through the
  // --- rack-check glass in the south wall.
  kit.floor(34, 12, -1, 8);
  kit.surface(-18, 2, 16, 4.6, "obsidian");               // south aisle — the overseer's walk
  kit.surface(-18, 4.6, 16, 11, "crystal");               // the trough floor — wax-glass, it sings
  kit.surface(-18, 11, 16, 14, "moss");                   // the burned north aisle — ash-moss in the scar, lit and silent
  kit.wall(16, 2, 16, 14, { h: 6, piers: false });        // east wall — dead; the works yard beyond
  kit.pier(16, 2, 6.3);
  // SOUTH WALL (z2, h8) — the gallery's shade-maker, shared with the curing
  // court. The RACK BAY (x -6..0) is the wide mouth the frame-carts roll
  // through; either side, a RACK-CHECK WINDOW — glazed, so the overseer can
  // watch the curing court without letting a draft (or a flame) cross it.
  kit.wall(-18, 2, -13, 2, { h: 8 });                     // west run (owns (-18,2) and the west window jamb)
  kit.wall(-11, 2, -6, 2, { h: 8 });                      // window to bay
  kit.wall(0, 2, 5, 2, { h: 8 });                         // bay to window
  kit.wall(7, 2, 16, 2, { h: 8, piers: false });          // east run ((16,2) piered above)
  kit.railing(-6.3, 2.02, 0.3, 2.02, { y: 3.0, h: 5.0, t: 0.48, mat: kit.mats.wall }); // the bay's LINTEL (banded) — the sun's tongue
                                                          // through the bay stays a low door-band on the south aisle; the trough floor keeps its dark
  // the two windows: sill + lintel close the gap outside the glazed band, the
  // pane fills it. Sun crosses the 1.2–2.8 band and lays a bright parallelogram
  // on the gallery floor at each window — doors in the light-map, not in the wall.
  for (const wx of [-12, 6]) {
    kit.solid(2.1, 1.2, 0.46, wx, 2, kit.mats.wall, 0, 0.6);        // sill
    kit.solid(2.1, 5.2, 0.46, wx, 2.02, kit.mats.wall, 0, 5.4);     // lintel (up to the wall head)
    glassPane(wx, 2.0, 2, 1.96, 1.56);                              // the glazing — refraction showcase, no occluder
  }
  // the DIPPING TROUGHS — molten lines the dippers walk, kept warm by hearth
  // pans beneath (coal beds — the gallery's only flames, and not douseable).
  kit.solid(13, 0.9, 1.15, -6.5, 9.4, kit.mats.rust);     // north trough
  kit.solid(13, 0.9, 1.15, 5.5, 5.9, kit.mats.rust);      // south trough
  kit.brazier(-11.5, 9.4, { lit: true, light: TUNE.hearth.light, seed: 41 }); // trough pans at the line-heads
  kit.brazier(10.6, 5.9, { lit: true, light: TUNE.hearth.light, seed: 42 });
  waxApron(-12.6, 8.5, -0.6, 10.3);                       // spill aprons along the trough sides — the amber gloss underfoot
  waxApron(-0.4, 5.0, 11.6, 6.8);
  // the DIPPING FRAMES — tall rack bays at the trough heads and walls; the
  // dark cover of the floor, and the bays a patient thing could feed in
  // (E3's outlet). None stands on the dip-master's line (z 7.6) — dippers
  // do not rack frames across their own walk.
  for (const [fx, fz] of [[-15.6, 9.4], [2.2, 9.4], [-3.4, 5.9], [14.2, 5.9], [-16.2, 5.4], [11.8, 9.6]])
    kit.solid(1.0, 3.2, 2.2, fx, fz, kit.mats.dark);
  // THE PHAROS-LENS — set in the west wall, staring east down the trough
  // floor; its sweep crosses the rack bay's mouth, so a blade of it rakes the
  // curing court beyond. [KEPT numbers]
  kit.greatEye(-17.4, 7, TUNE.pharos);
  kit.fogPatch(-18, 2, 16, 14, { density: 0.04 });        // (volumetrics on: the beam becomes a visible shaft)
  // THE NOON SHIFT of the gallery [KEPT specs]:
  kit.guard([[-12, 7.6], [8, 7.6]], TUNE.vDip);           // the DIP-MASTER: the trough line, end to end
  kit.guard([[9, 3.4], [-9, 3.4]], TUNE.vRackO);          // the RACK-OVERSEER: the south aisle, glancing through the glass

  // TABLEAU 3 · THE ABANDONED DIP — a frame left sunk mid-dip at the north
  // trough's head; the dipper's stool pushed back, his supper still on it.
  {
    const clear = [
      { x0: -13, z0: 6.9, x1: 9, z1: 8.3, pad: 0.4 },     // the dip-master's line
      { x0: -10, z0: 2.7, x1: 10, z1: 4.1, pad: 0.4 },    // the overseer's aisle
      { x0: -5.8, z0: 1.5, x1: -0.2, z1: 4.4, pad: 0.3 }, // the rack bay lane
      { x0: -4.2, z0: 12.6, x1: 0.2, z1: 14.5, pad: 0.3 },// work door lane (court side)
      { x0: 13, z0: 12.6, x1: 15.7, z1: 14.5, pad: 0.3 }, // skimmers' door lane
      { x0: -18.5, z0: 10, x1: -17.5, z1: 13, pad: 0.3 }, // the stores' rack door
      { x: -15, z: 5, r: 1.4 },                           // checkpoint pad
      { x: -17.4, z: 7, r: 1.6 },                         // the Pharos' mount
    ];
    kit.solid(0.9, 2.6, 0.4, -12.4, 10.6, kit.mats.dark); // the sunk frame, still hanging in the trough head
    kit.crate(-13.6, 11.4, { size: 0.62, rot: -0.15, seed: 43 }); // the stool, pushed back
    kit.sack(-13.5, 12.1, { r: 0.3, seed: 44 });          // the supper on it
    // wick-spool baskets under the south trough, where the dippers reach
    workRank(kit, 1.4, 4.9, 9.4, 4.9, { prop: "sack", propOpts: { r: 0.32 }, count: 3, face: "wall", clear, seed: 45 });
    // spare frames and their crates, leaned at the east wall's dark foot —
    // the aisles themselves stay clear (the overseer's walk is a walk)
    kit.cluster(14.7, 10.2, [{ prop: "crateStack", w: 2, foot: 0.8 }, "crate"], { count: 2, footprint: 0.9, backDir: Math.atan2(1, 0), clear, seed: 46 });
    kit.chains(-6.6, 10.4, { y: 3.4, len: 1.3, seed: 47 });// frame-hoist tackle over the north trough
    kit.chains(3.4, 6.7, { y: 3.4, len: 1.1, seed: 48 });
  }

  // ======================= F · THE RACKING COURT (x -18..16, z -12..2) =======
  // --- The Turn. Dipped frames cure here in still air under open sky, and NO
  // --- FLAME IS PERMITTED — the season's wax hangs in the balance, so the
  // --- Vigil banished every lamp from this court. There is NOTHING TO DOUSE.
  // --- The rack row's shade, the staged stacks' lees, and the far wall's band
  // --- are the only dark, and the open MOAT between them lies in full sun
  // --- with the rack-ward crossing it and the Pharos' blade raking in from
  // --- the bay. The sun is weather here: stand where the world already
  // --- turned it off, and time the one light that moves.
  kit.floor(34, 14, -1, -5);
  kit.surface(-18, -12, 16, -10, "moss");                 // the far wall's shaded lane — trodden soft by the rack-hands
  kit.surface(-18, -10, 16, 2, "obsidian");               // the court floor — swept stone, the moat
  kit.wall(16, -12, 16, 2, { h: 3.4, piers: false });     // east wall — dead
  kit.pier(16, -12, 3.7);
  // SOUTH WALL (z-12, h8) — the crypt block's face: its band is the goal-side
  // shade. One door, east — through the counting room; nothing else passes.
  kit.wall(-18, -12, 8, -12, { h: 8 });                   // west of the counting door (owns (-18,-12) and the jamb)
  kit.wall(11, -12, 16, -12, { h: 8, piers: false });     // east of it ((16,-12) piered above)
  kit.railing(7.7, -11.98, 11.3, -11.98, { y: 2.7, h: 5.3, t: 0.46, mat: kit.mats.wall }); // the counting door's lintel (banded) — its sun-patch glows low in the shade lane
  // THE CURING RACKS — two tall rack-walls just south of the bay: their north
  // strips catch whoever enters, then the moat is the question.
  kit.solid(8.5, 4.2, 0.55, -11.5, -0.8, kit.mats.wood);  // west rack run
  kit.solid(8.5, 4.2, 0.55, 6.5, -0.8, kit.mats.wood);    // east rack run
  // THE STAGED STACKS — crated candles waiting for the stores, mid-moat: the
  // two hard lees that break the crossing into readable steps.
  kit.solid(2.3, 3.6, 1.2, -8.6, -4.4, kit.mats.wood);
  kit.solid(2.3, 3.6, 1.2, 2.8, -4.4, kit.mats.wood);
  kit.guard([[-13, -6], [10, -6]], TUNE.vRackW);          // the RACK-WARD: the moat line, pausing to count the stacks [KEPT]
  kit.fogPatch(-18, -12, 16, 2, { density: 0.022 });      // (volumetrics on: the sun shafts + the visiting blade)
  kit.inscription(-3, 2.7, 1.68, "NO FLAME PASSES THE RACK DOOR", "s", "#ffd76a"); // the fire law, carved over the bay's court side

  // court dressing — the rack-hands' order: honest open floor, wear at walls
  {
    const clear = [
      { x0: -14, z0: -6.7, x1: 11, z1: -5.3, pad: 0.5 },  // the rack-ward's line
      { x0: -5.8, z0: -0.4, x1: -0.2, z1: 2.5, pad: 0.3 },// the bay lane
      { x0: 8, z0: -12, x1: 11, z1: -9.6, pad: 0.3 },     // the counting door lane
      { x: -8.6, z: -4.4, r: 1.9 },                       // the staged stacks' lees stay open
      { x: 2.8, z: -4.4, r: 1.9 },
      { x: -3, z: 0, r: 1.5 },                            // checkpoint pad
    ];
    // the frame-cart, left at the west rack with its load half-hung
    kit.cart(-15.9, -1.9, { rot: 1.62, seed: 51 });
    kit.crate(-16.2, -3.4, { size: 0.75, rot: 0.1, seed: 52 });
    // empty frames stacked against the far wall, in the shade lane's east end
    workRank(kit, 12.2, -10.9, 15.2, -10.9, { prop: "crate", propOpts: { size: 0.8 }, count: 2, face: "wall", clear, seed: 53 });
    kit.rubble(-17.1, -11, { radius: 0.7, seed: 54 });    // roof-fall, swept to the corner
    kit.deadLantern(14.9, 0.9, { fallen: true, rot: -0.8, seed: 55 }); // the lamp the law evicted, dumped over the east wall's foot
  }

  // ======================= G · THE CRYPT OF THE LIGHT-HEART ==================
  // --- (x -30..6, z -26..-12) The works' consecration, deepest room on the
  // --- route: every tally closes under the Heart's light. The builders cut a
  // --- NOON-SLOT in the south wall, aimed so the sun lays a blade across the
  // --- pedestal each day — the one lamp here that cannot gutter, on the one
  // --- thing the Vigil will not give back. The burned roof left a sun-scar
  // --- across the north strip (the door side); between scar and blade lies
  // --- the dark band the flanking lamps guard — douse THEM, and the road
  // --- goes black; the blade stays. West, the moss landing where the stores
  // --- let out: the ghost road ends here, in the same room as the loud one.
  kit.floor(36, 14, -12, -19);
  kit.surface(-30, -26, -18, -12, "moss");                // the west landing — the stores' cold air spills out with you
  kit.surface(-18, -26, 6, -12, "obsidian");              // the crypt floor proper
  // stores' south wall (z-12, west stretch) — the ghost door drops in here
  kit.wall(-30, -12, -26, -12, { h: 8, piers: false });   // west of the stores door
  kit.wall(-23, -12, -18, -12, { h: 8, piers: false });   // east of it ((-18,-12) owned by the rack court's run)
  kit.pier(-26, -12, 8.3, 0.34);                          // the door jambs
  kit.pier(-23, -12, 8.3, 0.34);
  kit.railing(-26.3, -11.98, -22.7, -11.98, { y: 2.7, h: 5.3, t: 0.46, mat: kit.mats.wall }); // its lintel (banded) — the ghost road's last door glows low, not tall
  kit.pier(-30, -12, 8.2);                                // the NW corner (stores west wall ends here unpiered)
  kit.wall(-30, -26, -30, -12, { h: 7, piers: false });   // west wall — dead; the cold under-works beyond
  // SOUTH WALL (z-26, h10) with the NOON-SLOT: a masonry sill at x -5.6..-2.4
  // the wall steps down to — sky above it, and the blade it was built to cast.
  kit.wall(-30, -26, -5.6, -26, { h: 10 });               // west run (owns (-30,-26) and the slot's west jamb)
  kit.wall(-5.6, -26, -2.4, -26, { h: 2.4, piers: false });// THE SLOT SILL — the sun's own door
  kit.wall(-2.4, -26, 6, -26, { h: 10 });                 // east run (owns the east jamb and (6,-26))
  // east wall (x6, h6) — the clerk's wall: his door and his inspection window
  kit.wall(6, -26, 6, -24, { h: 6, piers: false });       // south of the window
  kit.wall(6, -22.5, 6, -20, { h: 6, piers: false });     // window to door
  kit.wall(6, -17, 6, -12, { h: 6, piers: false });       // north of the door ((6,-12) capped below)
  kit.pier(6, -20, 6.3, 0.32);                            // door jambs
  kit.pier(6, -17, 6.3, 0.32);
  kit.pier(6, -12, 8.2);                                  // the junction corner (rack-court wall + clerk's wall)
  // THE INSPECTION WINDOW — glazed, so the clerk counts under the Heart's
  // light without ever standing in its room. Sill + lintel + pane.
  kit.solid(0.46, 1.1, 1.55, 6, -23.25, kit.mats.wall, 0, 0.55);
  kit.solid(0.46, 3.3, 1.55, 6.02, -23.27, kit.mats.wall, 0, 4.35);
  glassPane(6, 1.85, -23.25, 1.5, 1.5, Math.PI / 2);
  // THE LIGHT-HEART — the kit's glass gem, stood in the blade the slot casts.
  kit.scepterPedestal(-5, -21);
  kit.torch(-9.5, -17.5, TUNE.cryptLamp);                 // the flanking lamps: they light the DARK BAND between scar and blade. [KEPT 6/9 ×2]
  kit.torch(-0.5, -17.5, TUNE.cryptLamp);                 // Douse them and the road goes black — the blade stays. Douse shapes the road, never the sky.
  kit.guard([[-10, -15.5], [1, -15.5]], TUNE.vHeart);     // the HEART-WARD: walks the sun-scar before the pedestal [KEPT]
  kit.guard([[-20, -14], [-12, -18]], TUNE.vLanding);     // the LANDING-WARD: wanders where the stores let out [KEPT]
  kit.inscription(-4, 3.4, -25.7, "This heart was mine before they set it burning.", "n", "#9a86d8"); // [KEPT] Hush, over the slot

  // crypt dressing — veneration, and the cold landing
  {
    const clear = [
      { x0: -11, z0: -16.3, x1: 2, z1: -14.7, pad: 0.4 }, // the heart-ward's scar walk
      { x0: -21, z0: -19, x1: -11, z1: -13, pad: 0.4 },   // the landing-ward's wander
      { x0: -26.6, z0: -14.5, x1: -22.4, z1: -11.5, pad: 0.3 }, // the stores door drop
      { x0: 4.5, z0: -20, x1: 6.5, z1: -17, pad: 0.3 },   // the clerk's door lane
      { x: -5, z: -21, r: 1.8 },                          // the pedestal + its blade
      { x: -9.5, z: -17.5, r: 1.2 },                      // the flanking lamps
      { x: -0.5, z: -17.5, r: 1.2 },
      { x: -14, z: -17, r: 1.4 },                         // checkpoint pad
    ];
    kit.flank(-5, -21, { prop: "urn", opts: { scale: 0.9 } }, { gap: 1.6, dir: 0, face: "in", clear, seed: 61 }); // the offering urns, either side of the blade
    kit.banner(-8.2, 4.6, -25.68, "n", { w: 1.2, color: TUNE.cloth, seed: 62 }); // the works' colours beside the slot
    kit.rubble(-28.7, -24.8, { radius: 0.8, seed: 63 });  // the landing's dead corner — roof-fall never cleared
    kit.sack(-19.2, -24.6, { r: 0.34, seed: 64 });        // a dropped store-sack at the landing's mouth
    kit.brazier(-11.2, -14.2, { lit: false, seed: 65 });  // the heart-ward's pan — dark: even HIS flame stops at the rack door
  }

  // ======================= H · THE COUNTING ROOM (x 6..16, z -26..-12) =======
  // --- The tally-clerk's office between the racks and the Heart: every candle
  // --- is counted through here, and the glass chimney-ware for the citadel's
  // --- lanterns is checked for flaws in the SUN-SCAR — flawed glass throws
  // --- crooked light, so the clerk ranks it where the light is honest. His
  // --- lamp burns over the desk in the dark half: the one interior lamp the
  // --- works still pays for at noon, because his corner never sees the sky.
  kit.floor(10, 14, 11, -19);
  kit.surface(6, -26, 16, -12, "obsidian");
  kit.wall(6, -26, 16, -26, { h: 10, piers: false });     // south wall — the scar-maker ((6,-26) owned by the crypt run)
  kit.pier(16, -26, 10.3);
  kit.wall(16, -26, 16, -12, { h: 3.4, piers: false });   // east wall — low; the works yard beyond

  // TABLEAU 4 · THE FLAW-CHECK — chimneys ranked in the sun-scar, one reject
  // set apart on its sack; the desk lamp still burning over an open tally.
  {
    const clear = [
      { x0: 8, z0: -12.6, x1: 11, z1: -11.4, pad: 0.4 },  // the rack-court door lane
      { x0: 4.5, z0: -20, x1: 7.5, z1: -17, pad: 0.3 },   // the crypt door lane
      { x0: 6.5, z0: -24.2, x1: 7.5, z1: -22.3 },         // the inspection window's reach
    ];
    workRank(kit, 8.2, -14.6, 14.8, -14.6,                // THE FLAW RANK — glass in the honest light (the showcase, on the route)
      { prop: glassChimney, count: 6, face: "wall", jitter: 0.06, rotJitter: 0.1, clear, seed: 67 });
    kit.sack(14.6, -17.3, { r: 0.32, seed: 68 });         // the reject, set apart on its sack
    glassChimney(14.55, -17.05, { h: 0.5, r: 0.14 });
    kit.crate(9.4, -22.8, { rot: 0.06, seed: 69 });       // the tally desk, facing the window to the Heart
    kit.crate(8.3, -23.6, { size: 0.62, rot: -0.12, seed: 70 }); // the clerk's stool
    kit.sack(10.3, -23.3, { r: 0.3, seed: 71 });          // the day's count, sacked
    kit.torch(11.4, -21.6, TUNE.tallyLamp);               // the CLERK'S LAMP — his corner never sees the sky
    workRank(kit, 15.2, -24.8, 15.2, -20.4, { prop: "crate", propOpts: { size: 0.8 }, count: 3, face: "wall", clear, seed: 72 }); // counted and crated, against the east wall
  }

  // ================= THE SUN (the key light — the level's one new word) ======
  // White-gold, from the kit-south at ≈52°: every wall's kit-north foot gets a
  // ≈0.79×h shade band, so the works read as bands of dark laid at the feet of
  // the walls you march toward. It is LOS-gated by the same geometry the
  // tracer shades, and it is NOT in bag.torches — no vial touches it. The
  // AmbientLight is a visual-only sky tint the light meter never reads; the
  // shipped level's three invisible point fills are REMOVED (Law of Light).
  const sun = new THREE.DirectionalLight(TUNE.sun.color, TUNE.sun.intensity);
  sun.position.set(...TUNE.sun.pos);
  sun.userData.rtRadius = 0.05;
  scene.add(sun, sun.target);
  const sky = new THREE.AmbientLight(TUNE.sky.color, TUNE.sky.intensity);
  scene.add(sky);

  // ================= checkpoints ============================================
  kit.checkpoint(0, 35, 3);                               // [KEPT] the dock
  kit.checkpoint(-27, 28, 3, -27, 28);                    // the stores' first cell, west aisle
  kit.checkpoint(-4, 17.5, 2.5, -4, 17.5);                // the court's far shade lane
  kit.checkpoint(-15, 5, 2.5, -15, 5);                    // the gallery's dark west end
  kit.checkpoint(-3, 0, 2.5, -3, 0);                      // the rack bay's shade apron
  kit.checkpoint(-14, -17, 2.5, -14, -17);                // the crypt landing's edge
  kit.trigger("threshold", 0, 30.7, 2.2);                 // E1 — the first sun read, in the work door
  kit.trigger("hall", -1, 27, 3);                         // [KEPT id] the melt court
  kit.trigger("undercroft", -12, 31.5, 2.4);              // [KEPT id] the intake lane
  kit.trigger("gallery", -2, 12.5, 2.4);                  // E3 — the Eye's floor
  kit.trigger("noflame", -3, 0.6, 2.6);                   // E4 — the Turn, named by absence
  kit.trigger("sanctum", -5, -21, 6);                     // [KEPT id] the Heart's room, any approach

  // ================= mission logic (NO route hints) ========================== [KEPT flow]
  bag.stage = 0;
  bag.objective = "Reach the Light-Heart";
  bag.onStart = (game) => game.hud.prompt("They call this place the Chandlery. You remember the heat.", 4.5); // [KEPT]
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    if (id === "threshold" && !bag._sunSeen) {
      bag._sunSeen = true;
      p.prompt("Noon. They keep one lamp I cannot reach.", 4);
    }
    if (id === "hall" && !bag._hallSeen) {
      bag._hallSeen = true;
      p.prompt("<b>KEEP THE FIRES FED.</b> Every lamp in the city was bled from something like me.", 4); // [KEPT]
    }
    if (id === "undercroft" && !bag._underSeen) {
      bag._underSeen = true;
      p.prompt("Quiet down here. The moss remembers how to be quiet too.", 3.6); // [KEPT]
    }
    if (id === "gallery" && !bag._eyeSeen) {
      bag._eyeSeen = true;
      p.prompt("The Eye sweeps. The sun stands still. Read them apart.", 4);
    }
    if (id === "noflame" && !bag._lawSeen) {
      bag._lawSeen = true;
      p.prompt("Nothing here to douse. Stand where the sun already fails.", 4);
    }
    if (id === "sanctum" && bag.stage === 0) {
      bag.stage = 1;
      game.setObjective("Take the Light-Heart");                                // [KEPT]
    }
  };

  bag.onAlarm = (game) => {                               // [KEPT verbatim]
    game.guardSpeedMul = TUNE.beaconMul;
    game.sfx.alarm();
    game.setObjective("Carry the Light-Heart to the rift");
    game.hud.prompt("<b>The hall wakes.</b> Every vat, every rack, every eye — all of it, awake, and looking for what was theirs.", 3.2);
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 6 + tc.x)); // [KEPT flicker]
    }
    const s = bag.scepter;                                // [KEPT scepter ride]
    if (s) {
      s.core.rotation.y = t * 2;
      if (game.scepterTaken) s.group.position.set(game.player.pos.x, 1.5 + Math.sin(t * 3) * 0.1, game.player.pos.z);
      else s.group.position.set(s.x, 1.9 + Math.sin(t * 2) * 0.12, s.z);
    }
    if (bag.extract) bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7; // [KEPT pulse]
  };

  return bag;
}
