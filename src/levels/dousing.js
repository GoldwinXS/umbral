import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * MISSION 2 — THE LAMPWAY  (level index 1) — the DOUSE mission.
 *
 * A lamplighters' service route behind Lanternspire's outer wall. Hush is given
 * three void vials and taught DOUSE in beats, then the verb is TURNED:
 *   E1 KI    — THE FIRST DARK YOU MAKE : the clean douse (a lit, watched door);
 *              the shatter-as-thunder hazard is NAMED but not yet bitten.
 *   E2 SHŌ   — THE FORK : DOUSE conjugated by where it is legal — south a Vesper
 *              trusts its torch (DOUSE), north a blind Snuffed listens (NEVER).
 *   E3 SHŌ   — THE STAGING : a safe rehearsal of the loud douse (no guard to
 *              punish it) so the cost is FELT before it matters.
 *   E4 TEN   — THE OVER-LIT VAULT : the Turn. Dousing is FORCED, LOUD, and the
 *              guard is standing in the pool — the tool that saves you betrays you.
 *   E5 KETSU — THE WAKING LAMPS : take the relic, the lampway wakes, outrun it.
 *              The campaign's first beacon-flight (steal → world wakes → run).
 *
 * Two enemy types only: Vespers (lit, cone-sighted) and the Snuffed (blind,
 * sound-hunting). Geometry is watertight (kit.room/corridor, audited). The
 * whole level is dressed as a working lamplighters' route through the prop +
 * placement systems — no bare cover boxes. Palette LAW: amber/orange/red is the
 * Vigil's; violet is Hush's alone (never on a Vigil object).
 */

// TUNE — the knobs we reach for. Change feel here, not in the body. All values
// [KEPT] from the audited conversion unless flagged.
const TUNE = {
  moon: 0.55,                                          // ambient darkness
  torchChoke:   { intensity: 7,  range: 9,  scale: 1 },   // small — CHOKE #1 (E1)
  torchLit:     { intensity: 8,  range: 9,  scale: 1 },   // small — LIT throat (E2 south)
  torchHub:     { intensity: 6,  range: 7,  scale: 1 },   // small — hub ambience
  greatStaging: { intensity: 14, range: 11, scale: 2.0 }, // GREAT — staging (E3, safe rehearsal)
  greatRelic:   { intensity: 13, range: 11, scale: 1.8 }, // GREAT — relic (E4, forced douse)
  vChoke:   { speed: 1.1, pause: 1.4, range: 8 },      // E1 · choke Vesper
  vLit:     { speed: 1.2, pause: 1.3, range: 8 },      // E2 · lit-throat Vesper
  sUp:      { speed: 1.0, pause: 2.0, blind: true },   // E2 · the SNUFFED (blind)
  vRelic:   { speed: 1.2, pause: 1.3, range: 9 },      // E4 · relic-guard Vesper (far-turn dwell = pause)
  vExtract: { speed: 1.3, pause: 1.0, range: 9 },      // E5 · extraction Vesper
};

export function buildDousing() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "lampway";
  bag.name = "THE LAMPWAY";
  bag.spawn.set(-37, 0.42, -1);
  bag.bounds = { x0: -41, z0: -11, x1: 67, z1: 11 };

  const H = 3.2;

  // ================= ROOMS (watertight, clean-corner, via kit.room/corridor) = [KEPT]
  // Room bounds, door gaps, surfaces — all 1:1 from the audited conversion.
  kit.room(-40, -4, -32, 4, { doors: { e: [[-1.5, 1.5]] }, surface: "moss" });                   // A START HALL
  kit.corridor(-32, -1.5, -28, 1.5, { surface: "moss" });                                         // AB
  kit.room(-28, -9, -14, 9, { doors: { w: [[-1.5, 1.5]], e: [[-1.5, 1.5]] }, surface: "moss" });  // B CHOKE ROOM
  kit.corridor(-14, -1.5, -10, 1.5, { surface: "moss" });                                         // BC
  kit.room(-10, -10, 10, 10, { doors: { w: [[-1.5, 1.5]], e: [[3, 7], [-7, -3]] }, surface: "moss" }); // C HUB (fork east)
  kit.corridor(10, 3, 24, 7, { surface: "moss" });                                                // U upper (Snuffed)
  kit.corridor(10, -7, 24, -3, { surface: "moss" });                                              // L lower (douse #2)
  kit.room(24, -9, 34, 9, { doors: { w: [[3, 7], [-7, -3]], e: [[-1.5, 1.5]] }, surface: "moss" }); // F STAGING (fork rejoin)
  kit.corridor(34, -1.5, 38, 1.5, { surface: "moss" });                                           // FG
  kit.room(38, -10, 54, 10, { doors: { w: [[-1.5, 1.5]], e: [[-1.5, 1.5]] }, surface: "crystal" }); // G RELIC CHAMBER
  kit.corridor(54, -1.5, 58, 1.5, { surface: "moss" });                                           // GH escape
  kit.room(58, -6, 66, 6, { doors: { w: [[-1.5, 1.5]] }, surface: "moss" });                      // H EXTRACTION

  kit.extraction(62, 0);

  // ================= LANTERNS (small pools + two GREAT lanterns) ============== [KEPT]
  kit.torch(-15, 0, TUNE.torchChoke);      // small — CHOKE #1 (E1 lit door)
  kit.torch(17, -5, TUNE.torchLit);        // small — LIT throat (E2 south)
  kit.torch(0, 0, TUNE.torchHub);          // small — hub ambience
  kit.torch(29, 4, TUNE.greatStaging);     // GREAT — staging ambience (E3)
  kit.torch(44, 0, TUNE.greatRelic);       // GREAT — relic guard (E4, forced douse)

  // ================= VOID VIAL CACHES ========================================= [KEPT]
  kit.cache("capB", -25, 4, 2);   // choke room, BEFORE the lit door — arm, then meet the light
  kit.cache("capU", 17, 5, 1);    // Snuffed corridor — a quiet find, no light to spend on
  kit.cache("capF", 29, -4, 2);   // staging — refill before the relic chamber

  // ================= GUARDS ==================================================== [KEPT]
  // Exactly two enemy types: Vespers (cone-sighted) and the Snuffed (blind).
  kit.guard([[-15, -4], [-15, 4]], TUNE.vChoke);   // E1 · choke Vesper (watches the lit door)
  kit.guard([[13, -5], [21, -5]], TUNE.vLit);      // E2 · lit-throat Vesper (trusts torch (17,-5))
  kit.guard([[13, 5], [21, 5]], TUNE.sUp);         // E2 · the SNUFFED — silence only
  kit.guard([[44, -5], [44, 5]], TUNE.vRelic);     // E4 · relic-guard Vesper (walks the pool)
  kit.guard([[60, -4], [60, 4]], TUNE.vExtract);   // E5 · extraction Vesper

  // ================= relic ===================================================== [KEPT]
  kit.scepterPedestal(50, 0);

  // ==========================================================================
  // ENVIRONMENTAL STORYTELLING + COVER (composed via the placement system).
  // Every bare kit.solid cover box is replaced by a purposeful pile; the route
  // reads as a lamplighters' supply chain (barrels/crates/carts) with tended
  // (amber, lit) vs derelict (dark, dead) throats. Keep-clear discipline: cover
  // colliders never intrude a door lane, patrol line, spawn, or a pickup.
  // ==========================================================================

  // ===== E1 · KI — "THE FIRST DARK YOU MAKE"  [MODIFIED — from A START + B CHOKE] =====
  // The lamplighters' staging: START HALL is a supply depot; the CHOKE's lit
  // east door is a tended threshold (offering braziers + amber banner) so
  // "lit = watched = theirs" reads before the prompt.
  {
    // START HALL — rhythmic supply wall of oil barrels + lamp crates along the back wall.
    const clearStart = [
      { x: -37, z: -1, r: 2.2 },                        // spawn pad
      { x0: -32, z0: -1.5, x1: -28, z1: 1.5, pad: 0.4 },// east door lane (A→AB)
    ];
    kit.wallRunSide({ x0: -40, z0: -4, x1: -32, z1: 4 }, "n",
      [{ prop: "barrel", w: 2 }, { prop: "crate", w: 1 }, "sack"],
      { spacing: 1.4, inset: 0.7, clear: clearStart, seed: 3 });

    // CHOKE — the two KEPT cover spots become composed piles (positions [KEPT]).
    kit.crateStack(-23, -5, { seed: 3 });               // KEPT (-23,-5)
    kit.crateStack(-18, 6, { seed: 5 });                // KEPT (-18,6)
    // tended lit door: an offering pair + amber banner (decor — direct calls, no
    // collider, kept out of the ~3-wide door gap visually).
    kit.brazier(-14.4, -2.2, { lit: false, seed: 2 });
    kit.brazier(-14.4, 2.2, { lit: false, seed: 4 });
    kit.banner(-14.35, 2.4, 0, -Math.PI / 2, { w: 1.1, color: 0xffb46a, seed: 6 });
  }

  // ===== E2 · SHŌ — "THE FORK: WHERE THE DARK IS SAFE"  [MODIFIED — from C HUB + U/L] =====
  // The two throats read before the prompt: SOUTH lit = tended (braziers/urns/
  // amber banner); NORTH dark = derelict (dead lanterns, rubble, broken column,
  // chains). The contrast IS the tell.
  {
    const clearHub = [
      { x0: -1.5, z0: -10, x1: 1.5, z1: 10, pad: 0.4 },// central through-lane
      { x0: 7, z0: 3, x1: 10, z1: 7, pad: 0.3 },       // upper door mouth (KEPT cover at (-5,6)/(5,-6) sits west of the mouths)
      { x0: 7, z0: -7, x1: 10, z1: -3, pad: 0.3 },     // lower door mouth
      { x: 0, z: 0, r: 1.6 },                          // hub torch + centre
    ];
    kit.pillar(0.6, H, -6, -7);                        // KEPT hub pillar
    kit.cluster(-5, 6, ["crateStack", "barrel"], { count: 3, footprint: 1.1, clear: clearHub, seed: 12 }); // KEPT (-5,6)
    kit.cluster(5, -6, ["sack", { prop: "crate", w: 2 }], { count: 3, footprint: 1.1, clear: clearHub, seed: 14 }); // KEPT (5,-6)

    // SOUTH throat (lit) — tended maintenance corridor. inset pulled to 0.3 so the
    // run clears the Vesper's z=-5 patrol line (spec inset 0.4 grazed it — (tune)).
    kit.wallRun(11, -6.6, 23, -6.6, [{ prop: "brazier", opts: { lit: false }, w: 2 }, "urn"],
      { spacing: 3.2, inset: 0.3, clear: [{ x0: 13, z0: -5, x1: 21, z1: -5, pad: 0.6 }], seed: 16 });
    kit.banner(17, 2.4, -6.85, 0, { w: 1.0, color: 0xffb46a, seed: 18 }); // amber over the lit hall

    // NORTH throat (dark) — the forgotten passage where the blind thing wanders.
    kit.wallRun(11, 6.6, 23, 6.6, [{ prop: "deadLantern", w: 3 }, "rubble", "brokenColumn"],
      { spacing: 2.8, inset: 0.3, clear: [
        { x0: 13, z0: 5, x1: 21, z1: 5, pad: 0.6 },    // S-up (Snuffed) patrol line
        { x: 17, z: 5, r: 1.0 },                       // capU cache
      ], seed: 20 });
    kit.chains(13.5, 6.7, { y: 3.0, len: 1.4, seed: 8 });
    kit.chains(20.5, 6.7, { y: 3.0, len: 1.4, seed: 9 });
  }

  // ===== E3 · SHŌ — "THE STAGING, WHERE NOISE COSTS"  [MODIFIED — from F STAGING] =====
  // The depot: a working yard under one great work-lamp — carts of barrels, crate
  // stacks, sacks. No guard here: a safe rehearsal of the loud douse. Cover only
  // survives on the shadowed south edge + corners.
  {
    const clearStage = [
      { x0: 24, z0: -1.5, x1: 38, z1: 1.5, pad: 0.4 }, // through / rejoin lane
      { x: 29, z: 4, r: 1.4 },                         // great lantern
      { x: 29, z: -4, r: 1.0 },                        // capF cache
      { x0: 24, z0: 3, x1: 26.5, z1: 7 },              // west upper door mouth (throat rejoin)
      { x0: 24, z0: -7, x1: 26.5, z1: -3 },            // west lower door mouth (throat rejoin)
    ];
    kit.cluster(31.5, 6.5, ["cart", { prop: "crateStack", w: 2, foot: 0.8 }, "barrel"],
      { count: 4, footprint: 1.4, backDir: Math.atan2(1, 1), clear: clearStage, seed: 22 }); // loaded NE corner yard
    kit.corner({ x0: 24, z0: -9, x1: 34, z1: 9 }, "se",
      ["barrel", "sack", { prop: "crate", w: 2 }], { count: 3, clear: clearStage, seed: 24 });
    kit.cluster(27.5, -6.5, ["sack", "crate", "barrel"],
      { count: 3, footprint: 1.0, backDir: Math.PI, clear: clearStage, seed: 26 }); // KEPT (28,-6) south-edge cover
  }

  // ===== E4 · TEN — "THE OVER-LIT VAULT"  [MODIFIED — from G RELIC CHAMBER] =====
  // The shrine: the relic under the route's most-tended lamp. Lamp-priest statues
  // flank the pedestal, offerings at its foot, an amber banner behind — the great
  // lantern is the shrine's eternal flame you must snuff to take what it guards.
  {
    const clearRelic = [
      { x0: 44, z0: -5, x1: 44, z1: 5, pad: 0.7 },     // V-relic line + great lantern pool
      { x0: 38, z0: -1.5, x1: 54, z1: 1.5, pad: 0.3 }, // pedestal approach — keep the crossing legible
      { x: 50, z: 0, r: 1.4 },                         // pedestal
    ];
    kit.pillar(0.55, H, 46, 6);    // KEPT relic-chamber cover pillar (the only cover)
    kit.pillar(0.55, H, 42, -6);   // KEPT relic-chamber cover pillar
    // two lamp-priest statues framing the KEPT pedestal, split on the z-axis
    // (dir:0). Spec said Math.PI/2, but that seats them ON the approach lane at
    // z=0 — flipped to frame it N/S instead — (tune).
    kit.flank(50, 0, "statue", { gap: 2.4, dir: 0, face: "in", clear: clearRelic, seed: 30 });
    // offerings at the altar foot (decor — direct, off the crossing lane)
    kit.urn(49.2, 2.0, { scale: 0.8, seed: 31 });
    kit.urn(50.8, -2.0, { scale: 0.8, seed: 33 });
    kit.brazier(47.8, 2.5, { lit: false, seed: 35 });
    kit.brazier(47.8, -2.5, { lit: false, seed: 37 });
    kit.banner(53.5, 2.6, 0, -Math.PI / 2, { w: 1.1, color: 0xffd76a, seed: 39 }); // amber behind the pedestal
  }

  // ===== E5 · KETSU — "THE WAKING LAMPS"  [KEPT logic, MODIFIED dressing] =====
  // The gate lamps that light against you: dead-lantern gateposts frame the rift
  // (they flare on the theft — KEPT logic), a funnel of offering urns down the
  // escape corridor pulls the run onward.
  {
    kit.flank(62, 0, "deadLantern", { gap: 2.0, dir: 0, clear: [{ x: 62, z: 0, r: 1.4 }], seed: 40 }); // gateposts N/S of the rift (dir:0 — (tune))
    // funnel urns down the escape. A NARROW centre-strip clear (not the whole
    // lane) so the run frames the corridor without every piece being rejected.
    kit.leadingLine(54.5, 0, 60, 0, { prop: "urn", opts: { scale: 0.8 } },
      { spacing: 2.4, offset: 1.2, face: "in",
        clear: [{ x0: 54, z0: -0.4, x1: 66, z1: 0.4, pad: 0.1 }], seed: 42 });
  }

  // ================= inscriptions (lore) ====================================== [KEPT]
  kit.inscription(0, 2.4, 9.6, "THE LAMPS REMEMBER EVERY HAND THAT FED THEM", 0, "#ffb46a"); // hub (amber = Vigil)
  kit.inscription(17, 2.2, 6.7, "IT DOES NOT SEE. IT LISTENS.", 0, "#7a6bb0");               // NORTH throat — describes the Snuffed
  kit.inscription(38.4, 2.4, 3.2, "TAKE ONLY WHAT THE DARK WILL CARRY", -Math.PI / 2, "#ffd76a"); // relic entry (amber)

  // ================= dormant alarm lamps (the wake, after the theft) ========== [KEPT]
  for (const [x, z] of [[56, 0], [62, 4]]) {
    const l = new THREE.PointLight(0xff8866, 0, 12);
    l.position.set(x, 3.0, z);
    l.userData.rtRadius = 0.2;
    scene.add(l);
    const fixture = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16),
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x662222, emissiveIntensity: 0.6 })
    );
    fixture.position.set(x, 3.0, z);
    fixture.userData.rtExclude = true;
    scene.add(fixture);
    bag.dormant.push({ light: l, fixture, target: 8 });
  }

  // ================= ambient (low key — pools & shadow must read) ============= [KEPT]
  const moon = new THREE.DirectionalLight(0x8ea0cc, TUNE.moon);
  moon.position.set(-14, 22, 8);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  for (const [x, y, z] of [[-24, 7, 4], [0, 8, 0], [49, 8, 5]]) {
    const f = new THREE.PointLight(0x7088b0, 3.4, 14);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ================= checkpoints ============================================== [KEPT]
  kit.checkpoint(-36, 0, 3);
  kit.checkpoint(-21, 0, 3.5);
  kit.checkpoint(0, 0, 3);
  kit.checkpoint(17, -5, 2.5, 17, -5);
  kit.checkpoint(29, 0, 3.5);
  kit.checkpoint(46, 0, 3.5);
  kit.checkpoint(62, 0, 3);

  // ================= triggers / teaching ====================================== [KEPT positions]
  kit.trigger("start", -34, 0, 2.5);
  kit.trigger("chokeB", -24, 0, 5);
  kit.trigger("hub", 0, 0, 6);
  kit.trigger("upperWarn", 12, 5, 3);
  kit.trigger("lowerWarn", 12, -5, 3);
  kit.trigger("convergence", 25, 0, 4);
  kit.trigger("relicRoom", 39, 0, 4);
  kit.trigger("escapeCorr", 55, 0, 3);

  bag.stage = 0;
  bag.objective = "Find a way through the Lampway";
  // Prompts are terse + mechanic-focused: one short line naming the verb/objective.
  // The world-building lives in the props/composition/inscriptions, not the HUD.
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
    // one brief beacon line for the beacon-flight beat (the mission's KETSU).
    game.hud.prompt("The relic blazes — every lamp knows your shape now. <b>RUN.</b>", 3.5);
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 7 + tc.x));
    }
    // dormant lamps ignite after the theft
    if (game.scepterTaken && bag.alarmT === undefined) bag.alarmT = 0;
    if (game.scepterTaken && bag.alarmT < 1) {
      bag.alarmT = Math.min(1, bag.alarmT + dt);
      for (const d of bag.dormant) {
        d.light.intensity = d.target * bag.alarmT;
        d.fixture.material.emissive.setHex(0xff8866);
        d.fixture.material.emissiveIntensity = 0.6 + bag.alarmT * 4;
      }
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

  bag.startVials = 3;
  return bag;
}
