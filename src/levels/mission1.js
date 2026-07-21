import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL 4 — BRIGHTWARD.
 *
 * A daytime infiltration. The citadel stands lit by a low, harsh sun — no
 * moon, no forgiving dark — and for once the shadow you need is not ambient
 * night but the long black strips a low sun throws behind anything tall
 * enough to block it. Steal the Noonstaff from the reliquary keep at the
 * citadel's heart and get back out to the rift before the light finds you.
 *
 * Three ways in from the outer court, Thief-style:
 *   - the MAIN GATE, straight and sun-blasted, watched by a Vesper who trusts
 *     the light completely (fast, hot)
 *   - the EAST BASTION flank, a long shadowed gallery under a tall outer
 *     wall — safer footing, more distance, a patient Vesper on the beat
 *   - the WEST BREACH, an unwatched gap in the outer wall — but the wall
 *     was broken clean through, and only a shadowstep crosses the drop; a
 *     Snuffed prowls the flank leading up to it, blind and listening
 * All three braid together into the INTERIOR COURTYARD, a roofless, walled
 * square the sun rakes corner to corner — cross it in the shade of its own
 * obelisks or pay for the shortcut through the light. Beyond it, a corridor
 * drops south into the RELIQUARY KEEP, tall and crystal-voiced, where the
 * Noonstaff waits. Taking it wakes the citadel — dormant lamps ignite, the
 * relic's own glow rides your back all the way to the rift.
 */
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

  // ================= ROOMS (watertight, clean-corner, via kit.room) =========
  //
  //           WEST FLANK  ---w-corr---  OUTER COURT  ---e-corr---  EAST BASTION
  //          (x-34..-20)                (x-16..16)                 (x20..34)
  //          h6, moss           h4.5, moss (spawn)          h9, obsidian
  //                \                    |                        /
  //               [moat]             gate-corr                e-corr2
  //               (hole)             (vertical)                (horiz)
  //                  \                  |                      /
  //                   \-----------  COURTYARD  --------------/
  //                        (x-16..16, z-15..1) h8, moss/crystal/moss
  //                                    |
  //                                 keep-corr
  //                                    |
  //                              RELIQUARY KEEP
  //                            (x-12..12, z-36..-20) h10, crystal

  // ---- OUTER COURT (spawn, exterior, sun-blasted village ground) ----
  kit.room(-16, 6, 16, 30, {
    doors: { s: [[-2, 2]], e: [[16, 20]], w: [[16, 20]] },
    h: 4.5, surface: "moss",
  });

  // ---- gate corridor (Outer Court -> Courtyard, vertical) ----
  kit.corridor(-2, 1, 2, 6, { h: 4.5, surface: "moss" });

  // ---- COURTYARD (interior, roofless, tall walls, sun-raked) ----
  kit.room(-16, -15, 16, 1, {
    doors: { n: [[-2, 2]], e: [[-8, -4]], w: [[-8, -4]], s: [[-2, 2]] },
    h: 8,
  });
  kit.surface(-16, -15, -5, 1, "moss");    // west band — shadow lane
  kit.surface(-5, -15, 5, 1, "crystal");   // center band — open, sunlit, loud
  kit.surface(5, -15, 16, 1, "moss");      // east band — shadow lane

  // ---- east-corr (Outer Court <-> East Bastion, horizontal) ----
  kit.corridor(16, 16, 20, 20, { h: 6, surface: "obsidian" });
  // ---- east-corr2 (Courtyard <-> East Bastion, horizontal) ----
  kit.corridor(16, -8, 20, -4, { h: 8, surface: "obsidian" });

  // ---- EAST BASTION (shadowed flank, tall outer wall on the world edge) ----
  kit.room(20, -12, 34, 22, {
    doors: { w: [[16, 20], [-8, -4]] },
    h: 9, surface: "obsidian",
  });

  // ---- west-corr (Outer Court <-> West Flank, horizontal) ----
  kit.corridor(-20, 16, -16, 20, { h: 5, surface: "moss" });

  // ---- WEST FLANK (unwatched, quiet, ends at the breach) ----
  kit.room(-34, -12, -20, 22, {
    doors: { e: [[16, 20], [-8, -4]] },
    h: 6, surface: "moss",
  });

  // ---- the WEST BREACH: the wall gap is real void — shadowstep only ----
  // kit.hole builds no walls of its own (unlike kit.corridor, which self-caps
  // both long sides) — it just sits in the gap between West Flank's and
  // Courtyard's independently-built walls. Left alone, the open channel at
  // x[-20,-16] would run past the hole's z[-8,-4] in both directions with
  // nothing to stop north/south drift — a leak out the bottom of the map and
  // an unmarked "walkable abyss" strip up toward west-corr. Cap both ends,
  // exactly as spire.js flanks its bridge holes with explicit canyon walls.
  kit.hole(-20, -8, -16, -4);
  kit.wall(3.6, 6, 0.4, -18, -8);
  kit.wall(3.6, 6, 0.4, -18, -4);

  // ---- keep-corr (Courtyard <-> Reliquary Keep, vertical) ----
  kit.corridor(-2, -20, 2, -15, { h: 9, surface: "moss" });

  // ---- RELIQUARY KEEP (tall sanctum, crystal floor sings) ----
  kit.room(-12, -36, 12, -20, {
    doors: { n: [[-2, 2]] },
    h: 10, surface: "crystal",
  });

  // ================= SUN — the key light, low, harsh, one strong source ====
  const sun = new THREE.DirectionalLight(0xffdca8, 2.6);
  sun.position.set(-30, 14, 20);
  sun.userData.rtRadius = 0.05;
  scene.add(sun, sun.target);
  // gentle sky fill — purely visual (Ambient isn't summed by the vis model),
  // keeps shadow strips dark-but-not-void so the courtyard still reads
  const sky = new THREE.AmbientLight(0x25324a, 0.4);
  scene.add(sky);

  // ================= OUTER COURT dressing (spawn, exterior) =================
  // gate tower: the tall shadow-caster that keeps the spawn point in shade
  kit.pillar(1.3, 10, -13, 29, kit.mats.pillar);
  // low houses/cover — varied heights, none identical
  kit.solid(5, 6.5, 4, 8, 20, kit.mats.wall, 0.15);
  kit.trim(3.4, 0.14, 8, 6.2, 22, 0, 0x8a5cff, 1.3);
  kit.solid(4, 5, 5, -6, 14, kit.mats.wall, -0.1);
  kit.trim(2.8, 0.14, -6, 4.7, 16.5, -0.1, 0x8a5cff, 1.3);
  kit.pillar(0.9, 0.9, 5, 17, kit.mats.pillar); // the well
  kit.solid(1.8, 1.1, 1.2, 3, 12, kit.mats.block, 0.2);
  kit.solid(1.6, 1.1, 1.6, 10, 24, kit.mats.block, -0.15);
  kit.extraction(0, 27);
  kit.trim(4, 0.2, 0, 2.6, 29.7, Math.PI, 0x39f0c0, 2.2);
  kit.inscription(0, 2.3, 6.35, "KEEP THE FIRES FED, the stones say. The sun feeds itself.", 0, "#ffb46a");
  kit.guard([[-4, 10], [4, 10]], { speed: 1.3, pause: 1.3 }); // gate Vesper

  // ================= COURTYARD dressing (interior, sun-raked) ===============
  // two tall obelisks, offset so the sun (from -x,+z) throws two crossing
  // shadow lanes through the crystal center band
  kit.solid(1.6, 9, 1.6, -8, -3, kit.mats.pillar, 0.2);
  kit.solid(1.8, 7, 1.8, -3, -10, kit.mats.pillar, -0.15);
  kit.pillar(1.5, 1.3, 0, -7, kit.mats.pillar); // fountain
  kit.solid(6, 1.2, 1.1, -9, -13, kit.mats.block, 0);
  kit.solid(1.1, 1.2, 5, 9, -9, kit.mats.block, 0);
  kit.solid(6, 1.2, 1.1, 8, -2, kit.mats.block, 0);
  kit.cache("c1", 12, -12.5, 2);
  kit.mawMote("m1", -13, -1);
  kit.guard([[-10, -5], [10, -5]], { speed: 1.4, pause: 1.0 }); // crosses the sunlit center
  kit.guard([[3, -13], [3, -8]], { speed: 1.2, pause: 1.5 });   // south hedge beat, clear of the fountain

  // ================= EAST BASTION dressing (shadowed flank) =================
  kit.pillar(1.4, 10, 30, -6, kit.mats.pillar);
  kit.pillar(1.3, 8, 32, 10, kit.mats.pillar);
  kit.solid(1.8, 1.2, 1.8, 27, 0, kit.mats.block, 0.2);
  kit.guard([[24, -8], [24, 16]], { speed: 1.3, pause: 1.4, range: 11 });

  // ================= WEST FLANK dressing (unwatched, quiet) =================
  kit.pillar(0.9, 6, -27, 4, kit.mats.pillar);
  kit.solid(1.6, 1.2, 1.6, -30, -6, kit.mats.block, 0.15);
  kit.torch(-27, -8, { intensity: 5, range: 7, color: 0x6a5aa0 }); // dim nook, secondary to the sun
  kit.cache("c2", -31, 14, 2);
  kit.guard([[-24, -8], [-24, 14]], { speed: 1.0, pause: 2.0, blind: true }); // the Snuffed

  // ================= RELIQUARY KEEP dressing =================================
  for (const zz of [-24, -28, -32]) {
    kit.pillar(0.6, 4.5, -6.5, zz);
    kit.pillar(0.6, 4.5, 6.5, zz);
    kit.trim(1.4, 0.14, -6.5, 3.8, zz + 0.6, 0, 0x8a5cff, 2.0);
    kit.trim(1.4, 0.14, 6.5, 3.8, zz + 0.6, 0, 0x8a5cff, 2.0);
  }
  kit.torch(-3, -27, { intensity: 13, range: 11 });
  kit.torch(3, -27, { intensity: 13, range: 11 });
  kit.torch(0, -21.5, { intensity: 14, range: 12, scale: 1.8 }); // GREAT lantern, the keep's own guard-light
  kit.scepterPedestal(0, -31);
  kit.trim(6, 0.25, 0, 4.0, -35.8, 0, 0xffd76a, 2.2);
  kit.cache("c3", -9, -33.5, 2);
  kit.mawMote("m2", 9, -33.5);
  kit.inscription(0, 2.4, -20.35, "TAKE ONLY WHAT THE DARK WILL CARRY", 0, "#ffd76a");
  const relicFill = new THREE.PointLight(0x7088b0, 3, 14);
  relicFill.position.set(0, 7, -29);
  relicFill.userData.rtRadius = 0.85;
  scene.add(relicFill);
  kit.guard([[-4.2, -27], [4.2, -27], [4.2, -33], [-4.2, -33]], { speed: 1.3, pause: 1.1 }); // relic-guard Vesper

  // ================= dormant alarm lamps (ignite after the theft) ============
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

  // ================= checkpoints =================
  kit.checkpoint(-9, 24, 3);
  kit.checkpoint(0, 3, 2.5);
  kit.checkpoint(0, -4, 3); // clear of the central fountain pillar at (0,-7)
  kit.checkpoint(0, -17, 2.5, 0, -17);

  // ================= triggers / teaching =========================================
  kit.trigger("approach", 0, 20, 6);
  kit.trigger("gate", 0, 8, 3.5);
  kit.trigger("eastflank", 18, 18, 3);
  kit.trigger("westflank", -18, 18, 3);
  kit.trigger("inside", 0, -2, 3);
  kit.trigger("inside", 17, -6, 3);
  kit.trigger("inside", -14, -6, 3);
  kit.trigger("hall", 0, -21, 3);

  // ================= mission logic =================
  bag.stage = 0;
  bag.alarmT = 0;
  bag.objective = "Take the Noonstaff";
  bag.onStart = (game) => game.hud.prompt("Full daylight, and you have never felt so seen.", 4.5);
  bag.onTrigger = (id, game) => {
    if (id === "approach" && bag.stage === 0 && !bag._approachSeen) {
      bag._approachSeen = true;
      game.hud.prompt("The sun does not blink. Find what it cannot reach.");
    }
    if (id === "gate" && bag.stage === 0 && !bag._gateSeen) {
      bag._gateSeen = true;
      game.hud.prompt("Straight through the gate is fastest, and worst. Two flanks wait, if you'd rather live.");
    }
    if (id === "eastflank" && !bag._eastSeen) {
      bag._eastSeen = true;
      game.hud.prompt("A long shadow under a tall wall. Slower, safer — a patient watcher walks it.");
    }
    if (id === "westflank" && !bag._westSeen) {
      bag._westSeen = true;
      game.hud.prompt("The wall is broken here, and nothing watches the gap. But nothing walks on broken stone either — only the dark between one step and the next.");
    }
    if (id === "inside" && bag.stage === 0) {
      bag.stage = 1;
      game.hud.prompt("Inside the light now. It does not know you are the dark it fears.");
    }
    if (id === "hall" && bag.stage === 1) {
      bag.stage = 2;
      game.setObjective("Take the Noonstaff");
      game.hud.prompt(game.isTouch
        ? "The Noonstaff. Drift close and tap <b>✦</b> to take it."
        : "The Noonstaff. Drift close and press <span class='keycap'>E</span> to take it.");
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.3;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    game.hud.prompt("<b>The citadel wakes.</b> The Noonstaff's glow betrays you — run, shadow, RUN.");
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
        const p = game.player.pos;
        s.group.position.set(p.x, 1.5 + Math.sin(t * 3) * 0.1, p.z);
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
