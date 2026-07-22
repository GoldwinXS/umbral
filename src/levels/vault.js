import * as THREE from "three";
import { makeKit } from "../levelKit.js";
import { workRank, vigilShrine } from "./_dressing.js";

/**
 * MISSION 8 — THE MIRROR VAULT  (level index 7, menu "THE RELIQUARY") — FINALE.
 *
 * ============================== SITE DOSSIER =================================
 * WHAT: The reliquary undercroft of the Candent Vigil, sunk beneath the high
 *   sanctum of Lanternspire — polished basalt halls that double every lamp,
 *   scrying pools of still black water the order reads omens in, barred
 *   treasuries of offering-gold, and at the deepest point the FIRST EMBER
 *   enthroned before its own mirror. Beneath even that: the bleeding cellar
 *   where the Old Dark was rendered into fuel — the pit Hush was born in.
 * WHO: the VAULT-PRIOR (keeper of keys; his overwalk gallery rides the west
 *   flank of the great hall so he may watch his floor without walking it);
 *   the SCRYING-SISTERS (read the two pools each night by their pool-head
 *   lamps; the water must stay full, still, and dark); the TREASURY-WARDS
 *   (tally the barred offering-bays on the east aisle); the CRYPT-KEEPERS
 *   (two old monks who tend the offering crypts below and pretend the sealed
 *   stair beside the gate was never a stair).
 * PARTI: descent gate (a raised landing — the vault is ENTERED downward) →
 *   the procession (polished corridor of liturgy) → the hall of still water
 *   (pools, treasuries, the prior's overwalk, the Pharos in the shrine arch)
 *   → the Ember shrine — deepest, most-lit, most-guarded point in the whole
 *   campaign, the three laws conspiring. Service side: the sealed stair
 *   beside the gate → the pit → the offering crypts → the bleeding cellar →
 *   the keepers' passage, rising again BESIDE the shrine. Offerings flow in
 *   at the gate and down the procession; nothing is supposed to flow out.
 * WHY THE RELIC IS HERE: the First Ember is the Vigil's oldest light-heart —
 *   the first rendering of the Old Dark, the largest surviving piece of what
 *   Hush used to be. The order enthroned it at the vault's deepest point,
 *   flanked by vigil lamps, mirrored in its own scrying pool, behind every
 *   ward and grate the institution owns — lit because it is worshipped,
 *   deep because it is feared, guarded because it is FUEL. Never a bare
 *   pedestal: the whole undercroft is its reliquary case.
 * TABLEAUX: (1) a scrying-sister's station left mid-vigil at the west pool's
 *   reading edge — cushion, salt-urn, slate-crate, her lamp still burning;
 *   (2) the offering cart stands half-unloaded before the south treasury
 *   grate, the ward's tally-pan still lit beside it; (3) fresh lamp-oil and
 *   a spare lamp stacked against the sealed stair the Vigil declared
 *   "finished" years ago — someone still tends the door they deny; (4) ON
 *   THE OVERWALK: the prior's crate-desk and supper, hand-pan cold, keys
 *   gone with him.
 * THE NIGHT SHIFT: the GATE-WARD keeps the descent door line, facing the two
 *   ways down. In the hall the watch is a liturgy of circuits: the CIRCUIT-
 *   WARD walks the full perimeter of the nave, pausing at its corners; the
 *   POOL-WARD walks the sisters' reading-walk between the pool-head lamps;
 *   the OFFERTORY-WARD crosses between the pool feet before the shrine arch;
 *   the PROCESSION-WARD paces the spine itself between the pools, pausing at
 *   the reading edges and before the Eye; the TREASURY-WARD stations down
 *   the east grates, bay to bay. The EMBER-WARD walks behind the throne,
 *   between the glass cases, tending the Ember's mirror. Below, the two
 *   CRYPT-KEEPERS doze through their rounds among the urn ranks — and in the
 *   bleeding cellar something the Vigil does not roster paces blind in the
 *   dark, hunting by sound. The Pharos hangs in the shrine arch and sweeps
 *   the nave: the holiest engine watching the holiest floor.
 * =============================================================================
 *
 * THE EXAM (REDESIGN_5-8 M8): no new word — every verb recombined at full
 * pressure, and the level does not explain itself (KEPT):
 *   E1 KI    — THE DESCENT      : enter DOWNWARD off the gate landing (CLIMB
 *              conjugated as descent); the gate-ward owns the floor below.
 *   E2 SHŌ   — THE HALL OF STILL WATER : the tempting death — five wards,
 *              the Pharos, singing polished floor, and pools that carry your
 *              reflection to any cone that reads them (the Lanternways
 *              lesson, spoken back). Alt: the prior's overwalk (CLIMB) or
 *              the treasury aisle's lamp (DOUSE); the pools themselves must
 *              be BLINKED or rounded.
 *   E3 SHŌ   — THE SEALED STAIR : the kind road — slip the gate-ward, BLINK
 *              the pit into the crypts.
 *   E4 TEN   — THE BLEEDING CELLAR : the quiet climax. No Vigil light at all
 *              in the deep dark — only sound, memory, and the blind thing;
 *              the exam's hardest question has no light in it (LISTEN+SNEAK;
 *              DEVOUR is safe here — nothing rosters the starved).
 *   E5 TEN   — THE FIRST EMBER  : deepest, most-lit; the flanking lamps are
 *              dousable — the oldest verb handed back at the last moment.
 *   E6 KETSU — THE BEACON CLIMB : take the Ember, become the light, outrun
 *              the roused vault UP — spine or overwalk, then the gate ramp,
 *              ending the campaign on a climb into the rift.
 *
 * SHOWCASE — POLISHED STONE + MIRROR EVERYTHING: the reflections finale.
 * Low-roughness polished basalt floor plates (gate, procession, shrine) and
 * wainscot panels double every fixtured lamp; THREE deforming mirror pools
 * (kit.mirrorPool — the two scrying pools, and the Ember's mirror behind the
 * throne) double the hall and the relic itself; glass treasury cases (the
 * scepterPedestal glass generalized) refract their relics — including one
 * standing EMPTY where the Noonstaff stood before Brightward. With traced
 * reflections ON the whole undercroft doubles; with everything OFF the
 * polish still reads as lustrous dark marble under GGX highlights, the
 * pools stay glossy rippling black water (kit-guaranteed, no emissive), and
 * the case relics keep their rtExclude cores. NO emissive-NEE area lights;
 * every light has a fixture and a liturgical owner; no invisible fills (the
 * shipped three are removed — their duty lives in the fixtures + the dusk).
 *
 * Geometry is kit.wall runs — overlapped joints, ONE pier per corner
 * (PLACES.md hygiene); verticality (M5-8 vocabulary): the gate landing and
 * the prior's overwalk at +2.5. Difficulty is the shipped roster: 10
 * wardens + the Pharos, same speed/pause/range/cone numbers; only their
 * posts moved with the architecture. Beats, TUNE, triggers, relic +
 * extraction flow, checkpoints: preserved.
 */

// TUNE — the knobs we actually reach for. Change feel here, not in the body.
// Guard/lamp numbers are [KEPT] from the shipped level.
const TUNE = {
  dusk: 0.6,                                            // the last dusk dying down the gate shaft — the only sky this place ever sees (replaces the shipped 0.55 moon + THREE invisible fills, now removed)
  duskFrom: [6, 24, 30],                                // high, from over the north gate
  gateLamp:    { intensity: 4, range: 7 },              // the gate-ward's door lamp                       [KEPT 4/7]
  processionLamp: { intensity: 5, range: 8 },           // the procession's liturgy lamp                   [KEPT 5/8]
  hallLamp:    { intensity: 7, range: 11 },             // ×4: two pool-head reading lamps + two treasury-front tally lamps [KEPT 4 × 7/11]
  shrineLamp:  { intensity: 5, range: 7 },              // ×2: the Ember's flanking vigil lamps (DOUSE handed back)         [KEPT 2 × 5/7]
  cryptLamp:   { intensity: 3, range: 6, color: 0x9a7bff }, // ×2: the cellar's drowned standards — the old dark's light, not the Vigil's [KEPT]
  vGate:       { speed: 1.2, pause: 1.6, range: 11 },   // GATE-WARD (pauses = facing each way down)       [KEPT]
  vCircuit:    { speed: 1.5, pause: 1.0 },              // CIRCUIT-WARD (pauses = the nave corners)        [KEPT]
  vPool:       { speed: 1.4, pause: 1.0 },              // POOL-WARD (pauses = the pool-head lamps)        [KEPT]
  vOffertory:  { speed: 1.5, pause: 0.9 },              // OFFERTORY-WARD (the south cross-walk)           [KEPT]
  vProcession: { speed: 1.4, pause: 1.1 },              // PROCESSION-WARD (the spine between the pools)   [KEPT]
  vTreasury:   { speed: 1.5, pause: 0.8 },              // TREASURY-WARD (pauses = each barred bay)        [KEPT]
  vEmber:      { speed: 1.3, pause: 1.8 },              // EMBER-WARD (long pauses = tending the mirror)   [KEPT]
  keeperA:     { speed: 0.85, pause: 3.2, range: 8, coneAngle: 0.5 }, // dozing crypt-keepers              [KEPT]
  keeperB:     { speed: 0.85, pause: 3.4, range: 8, coneAngle: 0.5 }, //                                   [KEPT]
  snuffed:     { speed: 1.05, pause: 1.8, blind: true },// the starved thing in the bleeding cellar        [KEPT]
  pharos: { dir: Math.PI / 2, sweep: 0.8, sweepSpeed: 0.5, range: 19, coneAngle: 0.26, height: 3.2 }, //   [KEPT]
  deck: { y: 2.52 },                                    // the overwalk / gate-landing tier (+2.5)
};

export function buildVault() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "reliquary";
  bag.name = "THE RELIQUARY";                           // [KEPT] menu name
  bag.spawn.set(0.4, 2.94, 32.4);                       // on the gate landing — the vault is entered downward
  bag.bounds = { x0: -25, z0: -19.5, x1: 16.5, z1: 35.5 };
  bag.blinkCdMul = 0.65;                                // [KEPT] the step recharges faster here — you'll need it
  bag.startVials = 4;                                   // [KEPT] the finale: Hush arrives at full accumulated power

  const DECK = TUNE.deck.y;
  const lift = (grp, y = DECK + 0.02) => { grp.position.y += y; return grp; };

  // ---- the polished set (the showcase materials) ---------------------------
  // Follow the mirror-water recipe (low rough + some metal, NO emissive): with
  // reflections ON these are true mirrors of the fixtured lamps; OFF they keep
  // a lustrous GGX highlight — dark marble either way, never invisible.
  const polFloorMat = new THREE.MeshStandardMaterial({ color: 0x232a38, roughness: 0.16, metalness: 0.62 });
  const wainscotMat = new THREE.MeshStandardMaterial({ color: 0x1a2130, roughness: 0.12, metalness: 0.78 });
  // a POLISHED floor plate that is also a noise surface — same plate geometry
  // and height as kit.surface uses, but with the polished material.
  const polished = (x0, z0, x1, z1, type) => {
    bag.surfaces.push({ x0, z0, x1, z1, type });
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.06, z1 - z0), polFloorMat);
    m.position.set((x0 + x1) / 2, 0.031, (z0 + z1) / 2);
    scene.add(m);
    bag.occluders.push(m);
    return m;
  };
  // a polished WAINSCOT panel proud of a wall face (never coplanar: ≥0.02 off)
  const wainscot = (w, h, x, y, z, rotY = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), wainscotMat);
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    m.userData.fxOcclude = true;
    scene.add(m);
    bag.occluders.push(m);
    return m;
  };
  // a GLASS DISPLAY CASE — the scepterPedestal glass pattern generalized: a
  // stone plinth (real cover), a transmissive glass box (traced refraction —
  // never rtExclude, never emissive), a stone lid, and inside either a lesser
  // relic (rtExclude core so it reads at every setting) or honest emptiness.
  const caseCores = [];
  const displayCase = (x, z, { relic = 0xffd76a, empty = false } = {}) => {
    kit.solid(1.0, 0.9, 1.0, x, z, kit.mats.stone);     // plinth — one collider, real cover
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.8, 0.72),
      new THREE.MeshPhysicalMaterial({
        color: 0xcfe0e8, roughness: 0.06, metalness: 0.0,
        transmission: 1.0, thickness: 0.4, ior: 1.52, transparent: true,
      })
    );
    glass.position.set(x, 1.32, z);
    scene.add(glass);                                    // transparent: no occluder, no shadow
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.08, 0.84), kit.mats.stone);
    lid.position.set(x, 1.76, z);
    lid.userData.fxOcclude = true;
    scene.add(lid);
    bag.occluders.push(lid);
    if (!empty) {
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.13, 0),
        new THREE.MeshStandardMaterial({ color: 0x141019, emissive: relic, emissiveIntensity: 2.2 })
      );
      core.position.set(x, 1.3, z);
      core.userData.rtExclude = true;                    // faint self-glow, never an NEE emitter
      scene.add(core);
      caseCores.push(core);
    }
  };

  // base dark slab under the whole footprint — seams never read as void [KEPT]
  kit.floor(48, 60, -4.5, 7, kit.mats.dark, -0.18);

  // ======================= A · THE DESCENT GATE (x -7..7, z 26..34) ==========
  // --- The vault-prior's gate hall: the one door between the sanctum above
  // --- and everything the Vigil hoards below. Offerings come DOWN the ramp
  // --- off the raised landing; the gate-ward keeps the floor between the two
  // --- ways onward — the procession south, the "finished" stair west. The
  // --- rift stands on the landing: leaving is a climb (E1 in, E6 out).
  kit.floor(14, 8, 0, 30);
  polished(-7, 26, 7, 34, "obsidian");                  // polished gate floor — the first doubled lamp
  kit.wall(-7, 34, 7, 34, { h: 4.2 });                  // north wall (owns its corners)
  kit.wall(7, 26, 7, 34, { h: 4.0, piers: false });     // east wall
  kit.wall(-7, 26, -7, 28, { h: 4.0, piers: false });   // west wall, south of the stair door
  kit.wall(-7, 31, -7, 34, { h: 4.0, piers: false });   // west wall, north of it
  kit.pier(-7, 28, 4.2);                                // stair door jambs
  kit.pier(-7, 31, 4.2);
  kit.wall(-7, 26, -2, 26, { h: 4.2 });                 // south wall, west of the procession door (owns (-7,26),(-2,26))
  kit.wall(2, 26, 7, 26, { h: 4.2 });                   // south wall, east of it (owns (2,26),(7,26))
  kit.railing(-2.3, 26, 2.3, 26, { y: 2.65, h: 1.5, t: 0.5, mat: kit.mats.wall }); // the procession door's lintel (height-banded — the doorway stays a doorway)
  // THE GATE LANDING — a masonry stage (+2.5); the rift stands on it. Skirted
  // with height-banded walls (the lanternways dais pattern): solid to the
  // ground reading, no phantom colliders for whoever stands on top.
  kit.platform(-2.6, 31.4, 6.7, 31.4 + 2.6, { y: DECK, mat: kit.mats.stone, surface: "moss", support: false });
  kit.railing(-2.6, 31.4, 6.7, 31.4, { y: 0, h: 2.24, t: 0.35 });   // skirt, south (passes under the ramp's top lip — its band never touches a deck walker)
  kit.railing(-2.6, 31.4, -2.6, 34, { y: 0, h: 2.24, t: 0.35 });    // skirt, west
  kit.railing(-2.6, 31.4, -2.6, 34, { y: DECK, h: 0.85, mat: kit.mats.pillar });   // west lip — or blink-drop it
  kit.railing(-2.6, 31.4, 4.3, 31.4, { y: DECK, h: 0.85, mat: kit.mats.pillar });  // south lip, west of the ramp mouth
  kit.ramp(4.4, 27.0, 6.7, 31.4, { axis: "z", y0: 0, y1: 2.5, mat: kit.mats.stone, surface: "moss" }); // the descent ramp, east wall
  kit.extraction(2.4, 33);
  bag.extract.disc.position.y = DECK + 0.09;            // the rift stands ON the landing
  kit.trim(3.4, 0.2, 2.4, 4.1, 33.74, 0, 0x39f0c0, 2.0);
  wainscot(6.4, 1.8, 2.4, DECK + 1.1, 33.72);           // polished panel behind the rift — it doubles there
  kit.torch(0, 28, TUNE.gateLamp);                      // the gate-ward's lamp over the door junction
  kit.guard([[-3.5, 28.5], [3.5, 28.5]], TUNE.vGate);   // GATE-WARD — keeps the descent doors, facing each way down [KEPT]
  kit.inscription(0, 3.35, 26.29, "KEEP THE FIRES FED", "n", "#ffb46a"); // [KEPT] the liturgy over the tempting way

  // ======================= B · THE PROCESSION (x -3..3, z 14..26) ============
  // --- The liturgy way down: a polished corridor the offerings are carried
  // --- along, its one lamp doubled in floor and wainscot both — the Vigil
  // --- lights its processions, and the polish is the point (wealth, order,
  // --- reflection). Nothing is stored here; things PASS here.
  kit.floor(6, 12, 0, 20);
  polished(-3, 14, 3, 26, "obsidian");
  kit.wall(-3, 14, -3, 26, { h: 3.8, piers: false });   // west wall (z14 corner piered by the hall, z26 below)
  kit.wall(3, 14, 3, 26, { h: 3.8, piers: false });     // east wall
  kit.pier(-3, 26, 4.0);                                // the gate-end jambs
  kit.pier(3, 26, 4.0);
  kit.torch(0, 20, TUNE.processionLamp);                // the procession lamp [KEPT 5/8]
  wainscot(9.6, 1.8, -2.74, 1.0, 20, Math.PI / 2);      // wainscot both flanks — the lamp doubles four ways
  wainscot(9.6, 1.8, 2.74, 1.0, 20, Math.PI / 2);
  kit.banner(-2.68, 3.1, 17.5, "e", { w: 1.0, color: 0xffb46a, seed: 4 });
  kit.banner(2.68, 3.1, 22.5, "w", { w: 1.0, color: 0xffd76a, seed: 5 });

  // ======================= C · THE HALL OF STILL WATER (x -13..13, z -6..14) =
  // --- The nave of the vault: a singing lamp-glass floor between the two
  // --- SCRYING POOLS, the treasury grates on the east aisle, the prior's
  // --- overwalk on the west, and the Pharos hanging in the shrine arch,
  // --- sweeping its own congregation of lamplight. The tempting death: five
  // --- wards, the Eye, a floor that sings, and water that carries your
  // --- shape to any cone that reads it.
  kit.floor(26, 20, 0, 4);
  kit.wall(-13, 14, -3, 14, { h: 4.6 });                // north wall, west of the procession (owns (-13,14),(-3,14))
  kit.wall(3, 14, 13, 14, { h: 4.6 });                  // north wall, east of it (owns (3,14),(13,14))
  kit.wall(-13, -6, -2, -6, { h: 4.6 });                // south wall, west of the shrine arch (owns (-13,-6),(-2,-6))
  kit.wall(2, -6, 13, -6, { h: 4.6 });                  // south wall, east of it (owns (2,-6),(13,-6))
  // east wall x13 — three runs around the two barred treasury bays
  kit.wall(13, -6, 13, -4.2, { h: 4.2, piers: false }); // (corners owned by the south/north runs; jambs below)
  kit.wall(13, -1.2, 13, 0.8, { h: 4.2 });              // between the bays (owns both inner jambs)
  kit.wall(13, 3.8, 13, 14, { h: 4.2, piers: false });
  kit.pier(13, -4.2, 4.4);                              // outer bay jambs
  kit.pier(13, 3.8, 4.4);
  // west wall x-13 — the party wall with the crypts (solid here; the crypts'
  // passage door sits further south, past the shrine's own west wall)
  kit.wall(-13, -6, -13, 14, { h: 4.4, piers: false });

  // --- the floors: lamp-glass everywhere the Vigil walks (it SINGS — the lit
  // --- route is also the loud one), dark moss only under the overwalk, where
  // --- nobody important was ever meant to walk (the service side).
  kit.surface(-10.7, -6, 13, 2, "crystal");             // south field
  kit.surface(-10.7, 8, 13, 14, "crystal");             // north field
  kit.surface(-3.6, 2, 3.6, 8, "crystal");              // the spine between the pools
  kit.surface(-10.7, 2, -9.4, 8, "crystal");            // west sliver at the pool
  kit.surface(9.4, 2, 13, 8, "crystal");                // east sliver at the pool
  kit.surface(-13, -6, -10.7, 14, "moss");              // the under-walk aisle — dark, silent, watched

  // --- THE SCRYING POOLS — still black water the sisters read. Open at the
  // --- reading edges (they kneel there), curbed only on the outer flank; the
  // --- water is a void with a mirror on it — fall in and it keeps you, stand
  // --- lit over it and it shows the wards your double (bag.reflectors).
  kit.hole(-9.4, 2, -3.6, 8);                           // west pool
  kit.mirrorPool(-9.4, 2, -3.6, 8);                     // MIRROR-WATER (1/3)
  kit.hole(3.6, 2, 9.4, 8);                             // east pool
  kit.mirrorPool(3.6, 2, 9.4, 8);                       // MIRROR-WATER (2/3)
  kit.torch(-6.8, 10.6, TUNE.hallLamp);                 // west pool-head reading lamp — the sisters' light [KEPT 7/11]
  kit.torch(6.8, 10.6, TUNE.hallLamp);                  // east pool-head reading lamp                      [KEPT 7/11]

  // --- THE TREASURY BAYS (x 13..15.6) — barred offering-vaults read through
  // --- their grates: gold and lesser relics in glass, lit by the tally lamps
  // --- OUTSIDE the bars (the wards count through the grate; nobody unlocks
  // --- a treasury at night). Unreachable by foot — the grate sill blocks the
  // --- floor; a shadowstep gets in, and finds nothing it can carry.
  for (const [z0, z1] of [[0.8, 3.8], [-4.2, -1.2]]) {
    kit.floor(2.6, z1 - z0, 14.3, (z0 + z1) / 2);
    kit.surface(13, z0, 15.6, z1, "moss");
    kit.wall(15.6, z0, 15.6, z1, { h: 3.4 });           // bay back wall (owns its corners)
    kit.wall(13, z0, 15.6, z0, { h: 3.4, piers: false });   // cheeks (corners owned by back wall + east-wall jambs)
    kit.wall(13, z1, 15.6, z1, { h: 3.4, piers: false });
    kit.railing(13, z0, 13, z1, { y: 0, h: 1.15, t: 0.2 }); // the grate sill — barred below…
    for (const bz of [z0 + 0.75, z0 + 1.5, z0 + 2.25]) kit.pier(13, bz, 3.2, 0.06); // …and barred above
  }
  displayCase(14.5, 2.3, { relic: 0xffc36a });          // the offering-gold of the north bay
  displayCase(14.5, -2.7, { relic: 0xff9a4a });         // a lesser light-heart in the south bay
  kit.torch(10.9, 2.3, TUNE.hallLamp);                  // north tally lamp, before the grate [KEPT 7/11]
  kit.torch(10.9, -2.7, TUNE.hallLamp);                 // south tally lamp                   [KEPT 7/11]
  kit.inscription(12.72, 2.7, 8.9, "GIVEN TO THE LIGHT, KEPT BY THE LIGHT", "w", "#ffd76a");

  // --- THE PRIOR'S OVERWALK (x -13..-10.7, +2.5) — the gallery the vault-
  // --- prior watches his floor from, colonnaded over the service aisle; its
  // --- ramp lands at the hall's north-west corner (where the circuit-ward
  // --- pauses), and its south end simply stops — the prior never needed to
  // --- descend by the shrine; you might (the drop is the shortcut).
  kit.platform(-13, -5.6, -10.7, 8.4, { y: DECK, mat: kit.mats.stone, surface: "moss", support: false });
  kit.ramp(-12.9, 8.2, -10.8, 13.6, { axis: "z", y0: 2.5, y1: 0, mat: kit.mats.stone, surface: "moss" });
  kit.railing(-10.7, -4.6, -10.7, 8.4, { y: DECK, h: 0.85, mat: kit.mats.pillar }); // east lip — with the drop-gap at the south end
  for (const pz of [-4.5, -1.5, 1.5, 4.5, 7.5]) kit.pillar(0.32, DECK + 0.06, -11.0, pz); // the colonnade carrying the lip (tucked under the deck — the nave lane beside it stays a warden's walk)
  // the Pharos, hanging in the shrine arch, sweeping the nave [KEPT exactly]
  kit.greatEye(0, -6.4, TUNE.pharos);

  // THE NIGHT SHIFT of the nave (Law of the Watch — the rounds ARE liturgy;
  // all speed/pause numbers [KEPT] from the shipped five):
  kit.guard([[-10, -2], [-10, 11], [10, 11], [10, -2]], TUNE.vCircuit); // CIRCUIT-WARD — the perimeter office of the nave, corner to corner, skirting the gallery and the grates [KEPT corners]
  kit.guard([[-6.8, 12], [6.8, 12]], TUNE.vPool);           // POOL-WARD — the reading-walk behind the pool-head lamps, lamp to lamp
  kit.guard([[-7, 0], [7, 0]], TUNE.vOffertory);            // OFFERTORY-WARD — the cross-walk between the pool feet
  kit.guard([[0, -3], [0, 10]], TUNE.vProcession);          // PROCESSION-WARD — the spine between the waters, pausing at the reading edges and before the Eye
  kit.guard([[11.4, -4.6], [11.4, -2.7], [11.4, 2.3], [11.4, 10.6], [11.4, 2.3], [11.4, -2.7]], TUNE.vTreasury); // TREASURY-WARD — grate to grate down the tally line (explicit there-and-back: paths loop)
  kit.inscription(7.5, 3.4, -5.72, "THE STILL WATER KEEPS WHAT THE FLAME FORGETS", "n", "#ffb46a"); // scrying liturgy beside the arch

  // ======================= D · THE EMBER SHRINE (x -9..9, z -18..-6) =========
  // --- The deepest room in the campaign, and the most lit: the FIRST EMBER
  // --- enthroned before its own mirror-pool, flanked by vigil lamps and the
  // --- vault's glass honours — one case holding a lesser heart, one standing
  // --- EMPTY where the Noonstaff was paraded before Brightward. The three
  // --- laws conspire: lit because worshipped, deep because feared, guarded
  // --- because it is fuel. The lamps are dousable — the oldest verb, handed
  // --- back at the very end.
  kit.floor(18, 12, 0, -12);
  polished(-9, -18, 9, -6, "crystal");                  // the polished sanctuary floor — sings AND doubles
  kit.wall(-9, -18, 9, -18, { h: 4.2 });                // south wall (owns its corners)
  kit.wall(9, -18, 9, -6, { h: 4.0, piers: false });    // east wall
  kit.wall(-9, -18, -9, -13.5, { h: 4.0, piers: false });// west wall, south of the keepers' door
  kit.wall(-9, -9.5, -9, -6, { h: 4.0, piers: false }); // west wall, north of it
  kit.pier(-9, -13.5, 4.2);                             // keepers' door jambs
  kit.pier(-9, -9.5, 4.2);
  kit.scepterPedestal(0, -12);                          // THE FIRST EMBER [KEPT]
  // the Ember's mirror — the third pool, behind the throne: the order scries
  // the relic in its own water (the showcase's centre: relic + reflection)
  kit.hole(-4, -17.6, 4, -15.6);
  kit.mirrorPool(-4, -17.6, 4, -15.6);                  // MIRROR-WATER (3/3)
  wainscot(8.4, 2.0, 0, 1.3, -17.68);                   // polished panel over the mirror — Ember doubled twice
  kit.trim(5, 0.2, 0, 3.9, -17.7, 0, 0xffd76a, 2.2);    // [KEPT] the shrine's honour-trim, raised over the water
  kit.torch(-5, -8, TUNE.shrineLamp);                   // the flanking vigil lamps [KEPT 2 × 5/7] — DOUSE lives again
  kit.torch(5, -8, TUNE.shrineLamp);
  displayCase(-6.5, -15.8, { relic: 0xffb46a });        // a lesser light-heart in glass
  displayCase(6.5, -15.8, { empty: true });             // the Noonstaff's case — empty since Brightward
  kit.guard([[-5, -13.8], [5, -13.8]], TUNE.vEmber);    // EMBER-WARD — walks between throne and mirror, tending the double [KEPT]
  kit.inscription(0, 3.4, -17.74, "HERE THE FIRST DARK WAS FED TO THE FIRST FLAME", "n", "#ffb46a");

  // ======================= E · THE SEALED STAIR (x -13..-7, z 28..32) ========
  // --- "They sealed the stair and called the matter finished." The old way
  // --- down to the bleeding cellar, walled off beside the gate — but the
  // --- seal never held: the floor is a pit where the stairs were, and the
  // --- crypt-keepers still stock oil against the door they deny. The kind
  // --- road: slip the gate-ward, blink the pit.
  kit.floor(6, 4, -10, 30);
  kit.surface(-13, 28, -7, 32, "moss");
  kit.wall(-13, 32, -7, 32, { h: 3.8, piers: false });  // north wall (west corner piered by the crypts' north run; east tees into the gate wall)
  kit.wall(-13, 28, -7, 28, { h: 3.8, piers: false });  // south wall (jambs owned by the gate's west runs)
  kit.hole(-14, 28.6, -12, 31);                         // [KEPT] the pit where the stairs were — shadowstep it
  kit.inscription(-10, 1.7, 31.76, "You remember the way down.", "s", "#9a86d8"); // Hush, at the pit

  // ======================= THE CRYPTS (x -24..-13) ===========================
  // --- F · THE OFFERING CRYPTS (z 14..32) — the crypt-keepers' floor: urn
  // --- ranks of interred offerings along the west wall, the dead priors in
  // --- their sarcophagi along the east, and the two old keepers dozing
  // --- through their rounds. The Vigil pays for no light down here the
  // --- living would read by — only the drowned standards burn, and their
  // --- light is not the Vigil's colour.
  kit.floor(11, 18, -18.5, 23);
  kit.surface(-24, 14, -13, 32, "moss");
  kit.wall(-24, 32, -13, 32, { h: 4.2 });               // north wall (owns its corners)
  kit.wall(-24, 8, -24, 32, { h: 4.0, piers: false });  // west wall, upper run
  kit.wall(-13, 14, -13, 28.6, { h: 4.0, piers: false });// east party wall, up to the pit door
  kit.pier(-13, 28.6, 4.2);                             // the pit door's south jamb
  kit.wall(-13, 31, -13, 32, { h: 4.0, piers: false }); // sliver north of the pit door
  kit.wall(-24, 14, -20, 14, { h: 3.6, piers: false }); // the crypt screen, west of its door
  kit.wall(-16, 14, -13, 14, { h: 3.6, piers: false }); // east of it
  kit.pier(-20, 14, 3.8);                               // crypt door jambs
  kit.pier(-16, 14, 3.8);
  kit.torch(-18, 24, TUNE.cryptLamp);                   // [KEPT] a drowned standard — the old dark's own light

  // --- G · THE BLEEDING CELLAR (z -18..14) — the racks. The pit where the
  // --- Old Dark was rendered, and where one clot of it survived. No Vigil
  // --- lamp burns here at all; the deep half is true black. The walls
  // --- remember in sequence, north to south. This is the exam's quiet
  // --- climax: no light to read — only sound, and what hunts by it.
  kit.floor(11, 32, -18.5, -2);
  kit.surface(-24, -18, -13, 14, "moss");
  kit.wall(-24, -18, -13, -18, { h: 4.2 });             // south wall (owns its corners)
  kit.wall(-24, -18, -24, 8, { h: 4.0, piers: false }); // west wall, lower run (pier at the join)
  kit.pier(-24, 8, 4.2);
  kit.wall(-13, -18, -13, -13.5, { h: 4.0, piers: false }); // east wall, south of the keepers' passage
  kit.wall(-13, -9.5, -13, -6, { h: 4.0, piers: false });   // …north of it, up to the hall's party wall
  kit.pier(-13, -13.5, 4.2);                            // passage jambs
  kit.pier(-13, -9.5, 4.2);
  kit.torch(-18, -2, TUNE.cryptLamp);                   // [KEPT] the second drowned standard
  // the bleeding racks — posts and idle chains, off the walking lines
  for (const [rx, rz] of [[-21.5, 6], [-15.5, 6], [-21.5, -8], [-15.5, -8]]) {
    kit.solid(0.4, 2.6, 1.6, rx, rz, kit.mats.dark);
    kit.chains(rx, rz + 0.55, { y: 2.5, len: 1.4, seed: Math.round(rx * rz) });
  }
  // the walls remember — the eight lines, read descending, north → south [KEPT]
  const CELLAR_LINES = [
    "Before the citadel rose, this pit already held the dark.",
    "The first Vespers were not lanterns, but chains.",
    "Shadow does not burn. So they learned to bleed it instead.",
    "Each lamp above was lit on a stolen dusk.",
    "The vaults grew bright while the cellar grew silent.",
    "One night the chains sang, and no one answered.",
    "They sealed the stair and called the matter finished.",
    "It was never finished. It was only sleeping.",
  ];
  const zSeq = [28, 24, 20, 16, 10, 4, -4, -12];
  CELLAR_LINES.forEach((line, i) => kit.inscription(-23.76, 1.7, zSeq[i], line, "e", "#9a86d8"));
  kit.mawMote("rmaw", -20, -14);                        // [KEPT] the starved thing circles the old blood
  kit.cache("rc1", -20, 12, 2);                         // [KEPT]
  kit.cache("rc2", -16, 0, 2);                          // [KEPT]
  // the keepers' rounds [KEPT specs] — and the thing the Vigil doesn't roster
  kit.guard([[-19, 26], [-19, 18]], TUNE.keeperA);      // FIRST KEEPER — the urn-rank aisle, dozing at each end
  kit.guard([[-20, 9], [-15, 3]], TUNE.keeperB);        // SECOND KEEPER — the store round past the caches
  kit.guard([[-20, -2], [-16, -10], [-20, -14]], TUNE.snuffed); // THE STARVED THING — blind, circling the racks by ear [KEPT triangle; all legs clear]

  // ======================= H · THE KEEPERS' PASSAGE (x -13..-9, z -13.5..-9.5)
  // --- How the crypt-keepers reach the shrine to sweep it — the one honest
  // --- service link between the pit and the throne, and the kind road's
  // --- last leg: rise beside the prize instead of crossing the nave for it.
  kit.floor(4, 4, -11, -11.5);
  kit.surface(-13, -13.5, -9, -9.5, "moss");
  kit.wall(-13, -9.5, -9, -9.5, { h: 3.6, piers: false });  // caps (jambs owned by the flanking walls)
  kit.wall(-13, -13.5, -9, -13.5, { h: 3.6, piers: false });

  // ==========================================================================
  // DRESSING — every prop where its user left it. Keep-clear discipline:
  // nothing intrudes on a door lane, a patrol line, a ramp mouth, the spawn,
  // a cache, a pool edge or the pit's blink lane.
  // ==========================================================================

  // ===== A · THE DESCENT GATE ================================================
  {
    const clear = [
      { x: 0.4, z: 32.4, r: 2.0 },                      // spawn (on the landing)
      { x0: -2, z0: 26, x1: 2, z1: 28.2, pad: 0.3 },    // procession door lane
      { x0: -7, z0: 28, x1: -5, z1: 31, pad: 0.3 },     // stair door lane
      { x0: -3.5, z0: 27.7, x1: 3.5, z1: 29.3, pad: 0.3 }, // the gate-ward's line
      { x0: 4.4, z0: 26.6, x1: 6.7, z1: 31.4, pad: 0.2 }, // the ramp
      { x: 0, z: 28, r: 1.2 },                          // the gate lamp
      { x: 0, z: 30, r: 1.4 },                          // checkpoint pad
    ];
    // the night's offerings, ranked at the ramp foot for carrying down — the
    // vault's intake, seen before it is explained
    workRank(kit, 3.2, 26.7, 6.4, 26.7, { prop: "urn", propOpts: { scale: 0.85 }, count: 3, face: "wall", clear, seed: 7 });
    kit.corner({ x0: -7, z0: 26, x1: 7, z1: 31.3 }, "sw", ["barrel", { prop: "crate", w: 2 }, "sack"], { count: 3, clear, seed: 8 });
    kit.banner(-1.2, 3.6, 33.76, "s", { w: 1.1, color: 0xffb46a, seed: 9 });
  }

  // ===== C · THE HALL OF STILL WATER =========================================
  {
    const clear = [
      { x0: -10.6, z0: -2.6, x1: -9.4, z1: 11.6, pad: 0.3 },  // circuit-ward, west leg
      { x0: -10.6, z0: 10.4, x1: 10.6, z1: 12.6, pad: 0.3 },  // circuit north leg + pool-ward's walk
      { x0: -10.6, z0: -2.6, x1: 10.6, z1: -1.4, pad: 0.3 },  // circuit south leg
      { x0: 9.4, z0: -2.6, x1: 10.6, z1: 11.6, pad: 0.3 },    // circuit east leg
      { x0: 10.8, z0: -4.6, x1: 12.0, z1: 10.6, pad: 0.3 },   // treasury-ward's tally line
      { x0: -7.6, z0: -0.6, x1: 7.6, z1: 0.6, pad: 0.3 },     // offertory-ward's cross-walk
      { x0: -0.6, z0: -3.6, x1: 0.6, z1: 10.6, pad: 0.3 },    // procession-ward's spine
      { x0: -3, z0: 13, x1: 3, z1: 14, pad: 0.3 },            // procession door lane
      { x0: -2, z0: -6, x1: 2, z1: -4.5, pad: 0.3 },          // shrine arch lane
      { x0: -9.65, z0: 1.7, x1: -3.35, z1: 8.3, pad: 0.25 },  // west pool + curbs
      { x0: 3.35, z0: 1.7, x1: 9.65, z1: 8.3, pad: 0.25 },    // east pool + curbs
      { x0: -13, z0: 8.2, x1: -10.7, z1: 13.7, pad: 0.2 },    // the overwalk ramp
      { x: 0, z: 9, r: 1.6 },                                 // checkpoint pad
      { x: -6.8, z: 10.6, r: 1.1 },                           // pool-head lamps
      { x: 6.8, z: 10.6, r: 1.1 },
      { x: 10.9, z: 2.3, r: 1.1 },                            // tally lamps
      { x: 10.9, z: -2.7, r: 1.1 },
    ];
    // TABLEAU 1: the abandoned reading — a sister's station at the west
    // pool's reading edge: cushion, salt-urn, slate-crate, left mid-vigil.
    kit.sack(-7.5, 9.3, { r: 0.32, seed: 21 });         // her kneeling cushion
    kit.urn(-6.7, 9.55, { scale: 0.7, seed: 22 });      // the salt bowl
    kit.crate(-8.4, 9.1, { size: 0.7, rot: 0.1, seed: 23 }); // her slate-crate
    vigilShrine(kit, 6.8, 10.6, { gap: 1.5, urnScale: 0.85, clear, seed: 24 }); // the east lamp's votive pair — swept, symmetric, sacred
    // TABLEAU 2: the offering cart, half-unloaded before the south grate;
    // the ward's tally-pan still lit beside it (his post's amenity + light).
    kit.cart(8.2, -5.0, { rot: 0.1, seed: 25 });
    kit.crateStack(6.9, -5.25, { seed: 26 });
    kit.sack(9.1, -5.35, { r: 0.34, seed: 27 });
    kit.brazier(9.9, -5.05, { lit: true, light: 3, seed: 28 }); // the tally-pan (not douseable — a coal bed)
    // TABLEAU 4 · ON THE OVERWALK: the prior's crate-desk and supper, pan
    // cold, keys gone with him. (The gallery is the climb route — the story
    // sits ON it, against the parapet wall.)
    lift(kit.crate(-12.35, 6.6, { size: 0.8, rot: 0.06, seed: 31 }));
    lift(kit.sack(-12.3, 5.75, { r: 0.3, seed: 32 }));
    lift(kit.brazier(-12.4, 7.5, { lit: false, seed: 33 }).group);
    kit.banner(-3.4, 3.9, 13.76, "s", { w: 1.1, color: 0xffb46a, seed: 34 }); // nave cloth, north wall
    kit.banner(5.2, 3.9, 13.76, "s", { w: 1.0, color: 0xffd76a, seed: 35 });
    kit.fogPatch(-10, 1, 10, 9, { density: 0.028 });    // (volumetrics on: lamp shafts over the water)
  }

  // ===== D · THE EMBER SHRINE ================================================
  {
    const clear = [
      { x0: -5.6, z0: -14.4, x1: 5.6, z1: -13.2, pad: 0.3 }, // the ember-ward's walk
      { x0: -2, z0: -7.5, x1: 2, z1: -6, pad: 0.3 },         // the arch lane
      { x0: -9, z0: -13.5, x1: -7.5, z1: -9.5, pad: 0.3 },   // keepers' door lane
      { x0: -4.25, z0: -17.85, x1: 4.25, z1: -15.35, pad: 0.2 }, // the mirror pool
      { x: 0, z: -12, r: 1.6 },                              // the throne (pedestal + pickup)
      { x: -5, z: -8, r: 1.1 },                              // the vigil lamps
      { x: 5, z: -8, r: 1.1 },
      { x: -6.5, z: -15.8, r: 1.0 },                         // the glass cases
      { x: 6.5, z: -15.8, r: 1.0 },
    ];
    vigilShrine(kit, 0, -12, { gap: 2.1, urnScale: 0.95, clear, seed: 41 }); // the throne's offering urns
    kit.statue(-7.6, -7.2, { scale: 0.95, h: 2.6, seed: 42 });  // a founder of the order, watching his fire
    kit.statue(7.6, -7.2, { scale: 0.95, h: 2.6, seed: 43 });
    kit.fogPatch(-8, -17.5, 8, -7, { density: 0.035 });
  }

  // ===== E · THE SEALED STAIR ================================================
  {
    const clear = [
      { x0: -12, z0: 28.9, x1: -7, z1: 30.7, pad: 0.25 },    // the blink lane over the pit
      { x0: -14, z0: 28.6, x1: -12, z1: 31, pad: 0.15 },     // the pit itself
    ];
    // TABLEAU 3: the pretended door — fresh oil and a spare lamp stocked
    // against the seal the keepers officially do not tend.
    kit.urn(-8.3, 28.7, { scale: 0.9, seed: 51 });
    kit.urn(-9.1, 28.6, { scale: 0.8, seed: 52 });
    kit.sack(-7.7, 28.85, { r: 0.3, seed: 53 });
    kit.deadLantern(-11.5, 31.55, { seed: 54 });        // the spare lamp, waiting at the pit lip
    kit.rubble(-12.2, 28.25, { radius: 0.6, seed: 55 }); // the seal's spoil, never cleared
  }

  // ===== F/G · THE CRYPTS ====================================================
  {
    const clear = [
      { x0: -19.6, z0: 17.4, x1: -18.4, z1: 26.6, pad: 0.3 },  // first keeper's aisle
      { x0: -20.6, z0: 2.4, x1: -14.4, z1: 9.6, pad: 0.35 },   // second keeper's round (boxed)
      { x0: -20.6, z0: -14.6, x1: -15.4, z1: -1.4, pad: 0.35 },// the starved thing's triangle (boxed)
      { x0: -20, z0: 13, x1: -16, z1: 15, pad: 0.3 },          // crypt door lane
      { x0: -14, z0: 28.6, x1: -12, z1: 31, pad: 0.2 },        // the pit landing
      { x0: -13.5, z0: -13.5, x1: -13, z1: -9.5, pad: 0.3 },   // passage door lane
      { x: -20, z: 12, r: 1.2 },                               // rc1
      { x: -16, z: 0, r: 1.2 },                                // rc2
      { x: -20, z: -14, r: 1.1 },                              // rmaw
      { x: -18, z: 24, r: 1.0 },                               // the drowned standards
      { x: -18, z: -2, r: 1.0 },
      { x: -18, z: 26, r: 1.4 },                               // checkpoint pads
      { x: -18, z: -2, r: 1.4 },
    ];
    // the offering ranks — interred urns, ranked below the remembering walls
    workRank(kit, -23.1, 16, -23.1, 30.5, { prop: "urn", propOpts: { scale: 0.95 }, count: 6, face: "wall", clear, seed: 61 });
    // the dead priors, squared to the east wall, feet to the aisle
    kit.sarcophagus(-14.3, 18.5, { rot: Math.PI / 2, seed: 62 });
    kit.sarcophagus(-14.3, 22.5, { rot: Math.PI / 2 + 0.05, seed: 63 });
    kit.sarcophagus(-14.3, 26.5, { rot: Math.PI / 2 - 0.04, seed: 64 });
    kit.cluster(-22.8, 30.8, ["barrel", "sack"], { count: 3, footprint: 0.9, backDir: Math.atan2(-1, 1), clear, seed: 65 }); // the keepers' oil store, in the dark corner
    // the render-store: what the racks fed, staged and forgotten
    kit.cluster(-22.9, -16.8, [{ prop: "crate", w: 2 }, "barrel"], { count: 3, footprint: 1.0, backDir: Math.atan2(-1, -1), clear, seed: 66 });
    kit.rubble(-14.2, -16.9, { radius: 0.7, seed: 67 });
    kit.fogPatch(-23.5, -16, -13.5, 0, { density: 0.05 });   // the deep dark breathes
    kit.fogPatch(-23.5, 16, -13.5, 30, { density: 0.035 });
  }

  // ================= the dusk (the key light) ================================
  // The last of the sunset, falling down the gate shaft behind the spawn —
  // dying, as the campaign says it must. The shipped level's three invisible
  // fill lights are REMOVED (Law of Light): the fixtures above carry their
  // rooms, and the deep cellar is honestly, deliberately black.
  const dusk = new THREE.DirectionalLight(0x8ea0cc, TUNE.dusk);
  dusk.position.set(...TUNE.duskFrom);
  dusk.userData.rtRadius = 0.05;
  scene.add(dusk, dusk.target);

  // ================= checkpoints ============================================= [KEPT coverage]
  kit.checkpoint(0, 30, 3);                              // the gate floor, off the landing
  kit.checkpoint(-18, 26, 2.6, -18, 26);                 // entered the crypts [KEPT]
  kit.checkpoint(-18, -2, 2.6, -18, -2);                 // the bleeding cellar [KEPT]
  kit.checkpoint(0, 9, 2.4);                             // committed to the hall [KEPT]

  // ================= triggers (terse; the level explains almost nothing) =====
  kit.trigger("hall", 0, 11.8, 3);                       // first step into the nave
  kit.trigger("gallery", -11.8, 12.6, 1.8);              // the overwalk ramp's foot
  kit.trigger("cellar", -18, 27, 2.6);                   // [KEPT]
  kit.trigger("sanctum", 0, -13, 2.4);                   // [KEPT]

  // ================= mission logic (NO route hints) ========================== [KEPT flow]
  bag.stage = 0;
  bag.objective = "Reach the First Ember";
  bag.onStart = (game) => game.hud.prompt("You remember being larger.", 4.5);
  bag.onTrigger = (id, game) => {
    if (id === "hall" && !bag._hallSeen) {
      bag._hallSeen = true;
      game.hud.prompt("They read the still water for omens. Be no omen.", 4);
    }
    if (id === "gallery" && !bag._gallerySeen) {
      bag._gallerySeen = true;
      game.hud.prompt("A road over their heads.", 3.5);
    }
    if (id === "cellar" && !bag._cellarSeen) {
      bag._cellarSeen = true;
      game.hud.prompt("Something in these stones still counts the years it waited.", 4);
    }
    if (id === "sanctum" && bag.stage === 0) {
      bag.stage = 1;
      game.setObjective("Take the First Ember");
    }
  };

  bag.onAlarm = (game) => {                              // [KEPT] the Turn
    game.guardSpeedMul = 1.35;
    game.sfx.alarm();
    game.setObjective("Carry the Ember to the rift");
    game.hud.prompt("<b>The Ember blazes and you are fast.</b> Every lamp is your own light — take it home.", 3.2);
  };

  bag.update = (t, dt, game) => {                        // assigned exactly once (accessor)
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 6 + tc.x)); // [KEPT flicker]
    }
    for (const c of caseCores) c.rotation.y = t * 0.6;   // the cased relics turn, slowly, for nobody
    const s = bag.scepter;                               // [KEPT] Ember float + carry
    if (s) {
      s.core.rotation.y = t * 2;
      if (game.scepterTaken) s.group.position.set(game.player.pos.x, 1.5 + Math.sin(t * 3) * 0.1, game.player.pos.z);
      else s.group.position.set(s.x, 1.9 + Math.sin(t * 2) * 0.12, s.z);
    }
    if (bag.extract) bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
  };

  return bag;
}
