import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL — THE SPIRE ASCENT.
 *
 * The last climb: no relic here, only the reliquary spire itself, rising out
 * of the dark toward a rift at its crown. A switchback of terraces, each one
 * funnelling into a choice at its northern wall — a blazing outer stair,
 * watched by sighted Vespers and lit like a beacon, or a black inner stair
 * where the lamps were long since put out, and something blind waits in the
 * silence to hear you. The routes braid back together in a courtyard, then
 * narrow to a single dreadful crossing: a bridge over nothing, raked by the
 * Pharos's eye. Beyond it, the last terraces, and the rift at the top.
 *
 * Hush arrives changed. Larger. Slower to tire, longer of stride between one
 * shadow and the next. The climb makes him more of what he is.
 */
export function buildSpire() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "spire";
  bag.name = "THE SPIRE ASCENT";
  bag.spawn.set(0, 0.42, 74);
  bag.bounds = { x0: -15, z0: -24, x1: 15, z1: 82 };
  bag.startVials = 4;
  bag.blinkCdMul = 0.65;
  bag.upgrades = { maxHealthCap: 7, maxHealth: 4, blinkRange: 7 }; // grow larger + longer blink

  const H = 3.4, TH = 0.5;

  // ---- watertight room helpers (walls with door gaps) ----
  const gapsCut = (a, b, gaps) => { const gs = (gaps || []).slice().sort((p, q) => p[0] - q[0]); const spans = []; let cur = a; for (const [g0, g1] of gs) { if (g0 > cur) spans.push([cur, Math.min(g0, b)]); cur = Math.max(cur, g1); } if (cur < b) spans.push([cur, b]); return spans; };
  const hWall = (z, x0, x1, gaps) => { for (const [a, b] of gapsCut(x0, x1, gaps)) if (b - a > 0.02) kit.wall(b - a, H, TH, (a + b) / 2, z); };
  const vWall = (x, z0, z1, gaps) => { for (const [a, b] of gapsCut(z0, z1, gaps)) if (b - a > 0.02) kit.wall(TH, H, b - a, x, (a + b) / 2); };
  const floorRect = (x0, z0, x1, z1, mat) => kit.floor(x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, mat);

  // ================= A · FOOT OF THE SPIRE — start terrace ===============
  // x -13..13, z 66..80. North wall funnels into two mouths: outer(east,
  // bright) and inner(west, dark); the middle stays solid — no straight path.
  floorRect(-13, 66, 13, 80);
  kit.surface(-13, 66, 13, 80, "obsidian");
  hWall(80, -13, 13);                          // south — spawn wall, dead end
  hWall(66, -13, 13, [[-13, -9], [9, 13]]);     // north — two mouths, middle solid
  kit.torch(0, 72, { intensity: 5, range: 8 });
  kit.guard([[-6, 72], [6, 72]], { speed: 1.3, pause: 1.5, range: 11 });
  kit.inscription(0, 2.6, 65.9, "KEEP THE FIRES FED", 0, "#ffb46a");

  // ================= B · OUTER STAIR (bright, watched) ====================
  // x 9..13, z 38..66 — blazing, fast, exposed to sighted Vespers.
  floorRect(9, 38, 13, 66);
  kit.surface(9, 38, 13, 66, "obsidian");
  kit.torch(11, 46, { intensity: 9, range: 10 });
  kit.torch(11, 60, { intensity: 8, range: 9 });
  kit.trim(0.2, 3.0, 13.2, 1.6, 52, Math.PI / 2, 0xffb46a, 1.6);
  kit.guard([[11, 42], [11, 62]], { speed: 1.6, pause: 1.0, range: 12 });
  kit.guard([[10, 50], [12, 58]], { speed: 1.4, pause: 1.2, range: 10 });

  // ================= C · INNER STAIR (dark, Snuffed-guarded) ==============
  // x -13..-9, z 38..66 — the lamps here are dead; go silent on moss or die.
  floorRect(-13, 38, -9, 66);
  kit.surface(-13, 38, -9, 66, "moss");
  kit.torch(-11, 50, { intensity: 2.2, range: 5, color: 0x6a5aa0 });
  kit.fogPatch(-13, 40, -9, 64, { conceal: 0.72, density: 0.06, puffs: 6 });
  kit.cache("innerc1", -11, 55, 2);
  kit.guard([[-11, 42], [-11, 62]], { speed: 1.0, pause: 2.0, blind: true });
  kit.guard([[-12, 48], [-10, 58]], { speed: 0.95, pause: 2.2, blind: true });
  kit.inscription(-12.6, 1.6, 52, "The dark stair remembers every foot that did not fall.", Math.PI / 2, "#9a86d8");

  // interior mountain mass filling the non-walkable core between the stairs
  kit.solid(18, 7, 28, 0, 52, kit.mats.block);
  vWall(9, 38, 66);
  vWall(-9, 38, 66);
  // outer perimeter of the whole foot+stairs+courtyard block
  vWall(13, 24, 80);
  vWall(-13, 24, 80);

  // ================= D · CONVERGENCE COURTYARD =============================
  // x -13..13, z 24..38. The two stairs braid back together here. Partitioned
  // west(moss, dark alcove)/mid(obsidian)/east(crystal, loud & lit).
  floorRect(-13, 24, 13, 38);
  kit.surface(-13, 24, -4, 38, "moss");
  kit.surface(-4, 24, 4, 38, "obsidian");
  kit.surface(4, 24, 13, 38, "crystal");
  hWall(38, -13, 13, [[-13, -9], [9, 13]]);     // south — the two stair mouths
  hWall(24, -13, 13, [[-2, 2]]);                // north — the single bridge gate
  kit.torch(9, 27, { intensity: 8, range: 11 });
  kit.torch(9, 35, { intensity: 8, range: 11 });
  kit.torch(-9, 31, { intensity: 2.2, range: 5, color: 0x6a5aa0 });
  kit.reflectPool(5, 32, 1.8);
  kit.solid(1.4, 6, 1.4, -2, 32, kit.mats.pillar, 0.15);
  kit.solid(1.6, 6.5, 1.6, 7, 26, kit.mats.pillar, 0.3);
  kit.mawMote("maw1", -8, 34);
  kit.guard([[-10, 28], [-6, 34]], { speed: 0.9, pause: 2.5, blind: true });
  kit.guard([[-2, 26], [2, 36]], { speed: 1.4, pause: 1.0 });
  kit.guard([[6, 27], [10, 35]], { speed: 1.5, pause: 0.9 });
  kit.guard([[8, 30], [-8, 30]], { speed: 1.3, pause: 1.1 });
  kit.inscription(-6, 2.6, 23.9, "Cross where the light finds you, or not at all.", 0, "#ffb46a");
  kit.trigger("courtyard", 0, 30, 3);

  // ================= E · THE BRIDGE — MANDATORY ABYSS CROSSING ============
  // x -13..13, z 8..24. A thin walkable spar (x -2..2) flanked on both sides
  // by true void; tall canyon walls; the Pharos rakes the crossing.
  kit.floor(4, 16, 0, 16, kit.mats.dark, -0.18);  // base slab UNDER the bridge only
  floorRect(-2, 8, 2, 24);
  kit.surface(-2, 8, 2, 24, "obsidian");
  kit.hole(-13, 8, -2, 24);
  kit.hole(2, 8, 13, 24);
  kit.wall(TH, 8, 16, 13, 16);                  // east canyon wall (tall — deep chasm)
  kit.wall(TH, 8, 16, -13, 16);                 // west canyon wall
  hWall(8, -13, 13, [[-2, 2]]);                 // north — bridge exit
  kit.torch(0, 16, { intensity: 11, range: 16 });
  kit.fogPatch(-2, 10, 2, 22, { conceal: 0.25, density: 0.08, puffs: 5 });
  kit.greatEye(0, 7.6, { dir: Math.PI / 2, sweep: 0.9, sweepSpeed: 0.6, range: 22, coneAngle: 0.24, height: 3.2 });
  kit.trigger("bridge", 0, 20, 3);

  // ================= F · UPPER TERRACE ======================================
  // x -13..13, z -6..8. Post-crossing breather, then the last funnel north.
  floorRect(-13, -6, 13, 8);
  kit.surface(-13, -6, 13, 8, "obsidian");
  vWall(13, -6, 8);
  vWall(-13, -6, 8);
  hWall(-6, -13, 13, [[-4, 4]]);                // north — narrows toward the summit
  kit.torch(-6, 1, { intensity: 5, range: 8 });
  kit.torch(6, -3, { intensity: 5, range: 8 });
  kit.solid(1.4, 6, 1.4, -3, -2, kit.mats.pillar, 0.2);
  kit.solid(1.4, 6, 1.4, 4, 4, kit.mats.pillar, -0.2);
  kit.mawMote("maw2", -6, 1);
  kit.cache("upperc1", -8, 3, 2);
  kit.guard([[-9, -1.5], [9, -1.5]], { speed: 1.4, pause: 1.0 }); // nudged off the terrace pillar
  kit.guard([[9, 5], [-9, 5]], { speed: 1.5, pause: 0.9 });

  // ================= G · SUMMIT — the rift =================================
  // x -9..9, z -22..-6. The spire narrows to its crown.
  floorRect(-9, -22, 9, -6);
  kit.surface(-9, -22, 9, -6, "obsidian");
  vWall(9, -22, -6);
  vWall(-9, -22, -6);
  hWall(-22, -9, 9);                            // north — the crown, dead end
  kit.torch(0, -10, { intensity: 6, range: 9 });
  kit.solid(1.6, 7, 1.6, 3, -12, kit.mats.pillar, 0.25);
  kit.solid(1.6, 7, 1.6, -4, -16, kit.mats.pillar, -0.15);
  kit.extraction(0, -18);
  kit.trim(3.4, 0.2, 0, 2.6, -21.8, 0, 0x39f0c0, 2.0);
  kit.guard([[-6, -10], [6, -10]], { speed: 1.3, pause: 1.2 });
  kit.guard([[4, -19], [-4, -13.5]], { speed: 1.2, pause: 1.4, range: 10 }); // waypoint clear of the summit pillar
  kit.inscription(0, 2.6, -21.9, "I have climbed this before. I did not remember climbing.", 0, "#9a86d8");
  kit.trigger("summit", 0, -14, 3);

  // ================= checkpoints =================
  kit.checkpoint(0, 74, 3);
  kit.checkpoint(0, 31, 3, 0, 31);
  kit.checkpoint(0, 4, 3, 0, 4);
  kit.checkpoint(0, -16, 3, 0, -16);

  // ================= ambient =================
  const moon = new THREE.DirectionalLight(0x8ea0cc, 1.4);
  moon.position.set(-16, 24, 10);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  for (const [x, y, z, i] of [
    [0, 9, 73, 24], [11, 7, 50, 14], [-11, 7, 50, 10],
    [0, 8, 30, 22], [0, 7, 16, 18], [0, 8, 1, 20], [0, 8, -14, 22],
  ]) {
    const f = new THREE.PointLight(0x7088b0, i, 30);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ================= mission logic =================
  bag.objective = "Climb to the summit";
  bag.onStart = (game) => game.hud.prompt("The spire again. You always end up climbing.", 4.5);
  bag.onTrigger = (id, game) => {
    if (id === "courtyard" && !bag._courtyardSeen) {
      bag._courtyardSeen = true;
      game.hud.prompt("Every road up this stair was built to be watched.", 4);
    }
    if (id === "bridge" && !bag._bridgeSeen) {
      bag._bridgeSeen = true;
      game.hud.prompt("Nothing under my feet but the eye deciding whether it sees me.", 4);
    }
    if (id === "summit" && !bag._summitSeen) {
      bag._summitSeen = true;
      game.hud.prompt("<b>The rift is close.</b> Almost the whole of me again.", 3.5);
    }
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 6 + tc.x));
    }
    if (bag.extract) bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
  };

  return bag;
}
