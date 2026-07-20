import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL 3 — THE RELIQUARY.  (world bible: the vault of the Candent Vigil; the
 * cellar is the bleeding-undercroft where Hush was rendered as a leftover.)
 *
 * A single obvious route TEMPTS you: north up a corridor into a great courtyard
 * thick with Vespers and overwatched by the PHAROS, then to the reliquary where
 * the First Ember burns. Skilled thieves might force it. The kinder road is
 * hidden — slip past the Vesper by the start, find the side door, and descend
 * into the cellar. Down there the walls remember; sneak past a few dozing
 * keepers and rise again at a rear door, PAST the courtyard, beside the prize.
 * Take the Ember and it makes you a fast, blazing beacon — now flee out the
 * short obvious way, outrunning the roused vault.
 *
 * The level does not explain itself. That is the puzzle.
 */
export function buildVault() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "reliquary";
  bag.name = "THE RELIQUARY";
  bag.spawn.set(0, 0.42, 32);
  bag.bounds = { x0: -25, z0: -19.5, x1: 14, z1: 35.5 };
  bag.blinkCdMul = 0.65; // the step recharges faster here — you'll need it
  // the finale: Hush arrives at full accumulated power
  bag.upgrades = { blinkRange: 7, growthCap: 0.6, maxHealthCap: 7, maxHealth: 4 };

  const H = 3.4, TH = 0.5;

  // ---- watertight room helpers (walls with door gaps) ----
  const gapsCut = (a, b, gaps) => {
    const gs = (gaps || []).slice().sort((p, q) => p[0] - q[0]);
    const spans = []; let cur = a;
    for (const [g0, g1] of gs) { if (g0 > cur) spans.push([cur, Math.min(g0, b)]); cur = Math.max(cur, g1); }
    if (cur < b) spans.push([cur, b]);
    return spans;
  };
  const hWall = (z, x0, x1, gaps) => { for (const [a, b] of gapsCut(x0, x1, gaps)) if (b - a > 0.02) kit.wall(b - a, H, TH, (a + b) / 2, z); };
  const vWall = (x, z0, z1, gaps) => { for (const [a, b] of gapsCut(z0, z1, gaps)) if (b - a > 0.02) kit.wall(TH, H, b - a, x, (a + b) / 2); };
  const floorRect = (x0, z0, x1, z1, mat) => kit.floor(x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, mat);

  // base slab so no seam ever reads as the void
  kit.floor(44, 60, -6, 8, kit.mats.dark, -0.18);

  // ================= A · START HALL (x -7..7, z 26..34) =================
  floorRect(-7, 26, 7, 34);
  kit.surface(-7, 26, 7, 34, "obsidian");
  hWall(34, -7, 7);
  hWall(26, -7, 7, [[-2, 2]]);                 // north → obvious corridor
  vWall(7, 26, 34);
  vWall(-7, 26, 34, [[28, 31]]);               // west → the side door (easy to miss)
  kit.extraction(0, 31);
  kit.trim(3.4, 0.2, 0, 2.4, 33.8, 0, 0x39f0c0, 2.0);
  kit.torch(0, 28, { intensity: 4, range: 7 });
  // the Vesper you must slip past to reach the side door
  kit.guard([[-3.5, 28.5], [3.5, 28.5]], { speed: 1.2, pause: 1.6, range: 11 });
  kit.inscription(0, 2.4, 25.9, "KEEP THE FIRES FED", 0, "#ffb46a"); // Vigil liturgy, above the tempting way

  // ================= B · OBVIOUS CORRIDOR (x -3..3, z 14..26) ============
  floorRect(-3, 14, 3, 26);
  kit.surface(-3, 14, 3, 26, "obsidian");
  vWall(-3, 14, 26); vWall(3, 14, 26);
  kit.torch(0, 20, { intensity: 5, range: 8 });

  // ================= C · GREAT COURTYARD (x -13..13, z -6..14) ===========
  floorRect(-13, -6, 13, 14);
  kit.surface(-13, -6, 13, 14, "crystal");     // the whole floor sings — loud
  hWall(14, -13, 13, [[-2, 2]]);               // south (corridor door)
  vWall(13, -6, 14); vWall(-13, -6, 14);       // sides (west solid vs cellar)
  hWall(-6, -13, 13, [[-2, 2]]);               // north → reliquary door (under the Pharos)
  // bright, exposed, watched — the tempting death
  kit.torch(-9, 9, { intensity: 7, range: 11 });
  kit.torch(9, 9, { intensity: 7, range: 11 });
  kit.torch(-9, -2, { intensity: 7, range: 11 });
  kit.torch(9, -2, { intensity: 7, range: 11 });
  kit.reflectPool(-6, 4, 2.0);
  kit.reflectPool(6, 4, 2.0);
  // cover
  kit.solid(2.2, 1.2, 2.2, -4, 8, kit.mats.block, 0.2);
  kit.solid(2.2, 1.2, 2.2, 4, 0, kit.mats.block, -0.2);
  kit.pillar(0.6, H, -10, 3); kit.pillar(0.6, H, 10, 3);
  kit.pillar(0.6, H, 0, 6);
  // the PHAROS, set in the north wall, sweeping the courtyard you must cross
  kit.greatEye(0, -6.4, { dir: Math.PI / 2, sweep: 0.8, sweepSpeed: 0.5, range: 19, coneAngle: 0.26, height: 3.2 });
  // five Vespers thick on the ground
  kit.guard([[-10, -2], [-10, 11], [10, 11], [10, -2]], { speed: 1.5, pause: 1.0 });
  kit.guard([[10, 12], [-10, 12]], { speed: 1.4, pause: 1.0 });
  kit.guard([[-7, 1], [7, 1]], { speed: 1.5, pause: 0.9 });
  kit.guard([[0, -3], [0, 10]], { speed: 1.4, pause: 1.1 });
  kit.guard([[8, 7], [-8, 7]], { speed: 1.5, pause: 0.8 });

  // ================= D · RELIQUARY CHAMBER (x -9..9, z -18..-6) ==========
  floorRect(-9, -18, 9, -6);
  kit.surface(-9, -18, 9, -6, "crystal");
  vWall(9, -18, -6);
  vWall(-9, -18, -6, [[-13, -9]]);             // west → rear passage (the cellar's exit)
  hWall(-18, -9, 9);
  kit.scepterPedestal(0, -12);                 // THE FIRST EMBER
  kit.trim(5, 0.2, 0, 3.0, -17.8, 0, 0xffd76a, 2.2);
  kit.torch(-5, -8, { intensity: 5, range: 7 });
  kit.torch(5, -8, { intensity: 5, range: 7 });
  kit.guard([[-5, -14], [5, -14]], { speed: 1.3, pause: 1.8 });

  // ================= E · SIDE-DOOR STAIR (x -13..-7, z 28..32) ===========
  floorRect(-13, 28, -7, 32);
  kit.surface(-13, 28, -7, 32, "moss");
  hWall(32, -13, -7); hWall(28, -13, -7);
  vWall(-13, 28, 32, [[28.6, 31]]);            // west → cellar-upper
  kit.inscription(-10, 1.6, 31.7, "the pit below", 0, "#7a6bb0");

  // ================= CELLAR (the bleeding undercroft) ===================
  // upper cellar: x -24..-13, z 14..32
  floorRect(-24, 14, -13, 32);
  kit.surface(-24, 14, -13, 32, "moss");
  vWall(-24, 14, 32);
  vWall(-13, 14, 32, [[28.6, 31]]);            // east → stair door (rest solid)
  hWall(32, -24, -13);
  hWall(14, -24, -13, [[-20, -16]]);           // south → lower cellar
  // lower cellar: x -24..-13, z -18..14
  floorRect(-24, -18, -13, 14);
  kit.surface(-24, -18, -13, 14, "moss");
  vWall(-24, -18, 14);
  vWall(-13, -18, 14, [[-13, -9]]);            // east: solid vs courtyard + rear-passage door
  hWall(-18, -24, -13);
  // rear passage: x -13..-9, z -14..-8
  floorRect(-13, -14, -9, -8);
  kit.surface(-13, -14, -9, -8, "moss");
  hWall(-14, -13, -9); hWall(-8, -13, -9);
  // dim cellar light + fog cover
  kit.torch(-18, 24, { intensity: 3, range: 6, color: 0x9a7bff });
  kit.torch(-18, -2, { intensity: 3, range: 6, color: 0x9a7bff });
  kit.fogPatch(-23, 2, -14, 12, { conceal: 0.7, density: 0.06 });
  kit.fogPatch(-23, -16, -14, -6, { conceal: 0.66, density: 0.055 });
  // the walls remember — inscriptions read in sequence as you descend north→south
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
  CELLAR_LINES.forEach((line, i) => kit.inscription(-23.5, 1.7, zSeq[i], line, Math.PI / 2, "#9a86d8"));
  // bleeding racks (visual cover / dressing)
  for (const z of [22, 6, -8]) { kit.solid(0.4, 2.4, 1.6, -20, z, kit.mats.dark, 0); kit.solid(0.4, 2.4, 1.6, -16, z, kit.mats.dark, 0); }
  kit.mawMote("rmaw", -20, -14);
  kit.cache("rc1", -20, 12, 2);
  kit.cache("rc2", -16, 0, 2);
  // dozing keepers — slow, sleepy, easy to pass if you're patient
  kit.guard([[-19, 26], [-19, 18]], { speed: 0.85, pause: 3.2, range: 8, coneAngle: 0.5 });
  kit.guard([[-20, 9], [-15, 3]], { speed: 0.85, pause: 3.4, range: 8, coneAngle: 0.5 });
  // a SNUFFED prowls the deep cellar — blind, lightless, hunting by sound.
  // The moss floor is silent; creep and it never finds you. Make a sound and it comes.
  kit.guard([[-20, -2], [-16, -10], [-20, -14]], { speed: 1.05, pause: 1.8, blind: true });

  // ================= ambient =================
  const moon = new THREE.DirectionalLight(0x7a8cc0, 0.8);
  moon.position.set(-8, 22, 14);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  for (const [x, y, z, i] of [[0, 8, 30, 24], [0, 8, 20, 22], [0, 9, 4, 34], [0, 8, -12, 22], [-18, 7, 20, 16], [-18, 7, -4, 16]]) {
    const f = new THREE.PointLight(0x7088b0, i, 30);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.8;
    scene.add(f);
  }

  // ================= checkpoints / triggers =================
  kit.checkpoint(0, 32, 3);
  kit.checkpoint(-18, 26, 2.6, -18, 26);        // entered the cellar
  kit.checkpoint(-18, -2, 2.6, -18, -2);
  kit.checkpoint(0, 9, 2.4);                     // committed to the courtyard
  kit.trigger("cellar", -18, 27, 2.6);
  kit.trigger("sanctum", 0, -13, 2.4);

  bag.startVials = 3;

  // ================= mission logic (NO route hints) =================
  bag.stage = 0;
  bag.objective = "Reach the First Ember";
  bag.onStart = (game) => game.hud.prompt("You remember being larger.", 4.5);
  bag.onTrigger = (id, game) => {
    if (id === "cellar" && !bag._cellarSeen) {
      bag._cellarSeen = true;
      game.hud.prompt("Something in these stones still counts the years it waited.", 4);
    }
    if (id === "sanctum" && bag.stage === 0) {
      bag.stage = 1;
      game.setObjective("Take the First Ember");
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.35;
    game.sfx.alarm();
    game.setObjective("Carry the Ember to the rift");
    game.hud.prompt("<b>The Ember blazes and you are fast.</b> Every lamp is your own light — take it home.", 3.2);
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.9 + 0.1 * Math.sin(t * 6 + tc.x));
    }
    const s = bag.scepter;
    if (s) {
      s.core.rotation.y = t * 2;
      if (game.scepterTaken) s.group.position.set(game.player.pos.x, 1.5 + Math.sin(t * 3) * 0.1, game.player.pos.z);
      else s.group.position.set(s.x, 1.9 + Math.sin(t * 2) * 0.12, s.z);
    }
    if (bag.extract) bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
  };

  return bag;
}
