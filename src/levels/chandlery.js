import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL — THE CHANDLERY. (world bible: the rendering hall of the Candent
 * Vigil, where captured Old Dark is bled and boiled down into lamp-fuel for
 * every wick in Lanternspire.)
 *
 * The obvious way north from the start is a single blazing hall lined with
 * molten light-vats — a dramatic, ray-traced showpiece, and a death trap:
 * the PHAROS sweeps it end to end and half a dozen Vespers walk its rows.
 * A shadowed spine runs straight up the middle of that same hall, threaded
 * between the bleeding-racks, for those who trust the dark over their legs.
 * The kinder road slips out the side door into a dim maintenance undercroft
 * where a few Snuffed things drift, blind, listening — the moss never
 * betrays a footstep, but any other floor will. A vent partway along lets
 * you dodge between the two at need. Both roads end at the Light-Heart.
 * Take it, and the whole hall wakes, and you flee it the way you came,
 * fast now, straight back to the rift.
 *
 * The level does not explain itself. That is the puzzle.
 */
export function buildChandlery() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "chandlery";
  bag.name = "THE CHANDLERY";
  bag.spawn.set(0, 0.42, 35);
  bag.bounds = { x0: -34, z0: -24, x1: 21, z1: 42 };
  bag.startVials = 4;
  bag.blinkCdMul = 0.7;                                   // fast blink
  bag.upgrades = { blinkCdMul: 0.7, growthCap: 0.55 };     // grants faster blink + bigger growth

  const H = 3.4, TH = 0.5;

  // ---- watertight room helpers (walls with door gaps) ----
  const gapsCut = (a, b, gaps) => { const gs = (gaps || []).slice().sort((p, q) => p[0] - q[0]); const spans = []; let cur = a; for (const [g0, g1] of gs) { if (g0 > cur) spans.push([cur, Math.min(g0, b)]); cur = Math.max(cur, g1); } if (cur < b) spans.push([cur, b]); return spans; };
  const hWall = (z, x0, x1, gaps) => { for (const [a, b] of gapsCut(x0, x1, gaps)) if (b - a > 0.02) kit.wall(b - a, H, TH, (a + b) / 2, z); };
  const vWall = (x, z0, z1, gaps) => { for (const [a, b] of gapsCut(z0, z1, gaps)) if (b - a > 0.02) kit.wall(TH, H, b - a, x, (a + b) / 2); };
  const floorRect = (x0, z0, x1, z1, mat) => kit.floor(x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, mat);

  // dark base slab so no seam ever reads as the void
  kit.floor(56, 68, -7, 9, kit.mats.dark, -0.18);

  // ================= A · START HALL (x -6..6, z 28..38) =================
  floorRect(-6, 28, 6, 38);
  kit.surface(-6, 28, 6, 38, "obsidian");
  hWall(38, -6, 6);                       // south, outer
  vWall(6, 28, 38);                       // east, outer
  vWall(-6, 28, 38, [[30, 33]]);          // west → undercroft access (hidden road)
  hWall(28, -6, 6, [[-2, 2]]);            // north → the Chandlery hall (obvious road)
  bag.spawn.set(0, 0.42, 35);
  kit.extraction(-3, 36);
  kit.trim(3.0, 0.2, -3, 2.2, 37.6, 0, 0x39f0c0, 1.8);
  kit.torch(0, 30, { intensity: 5, range: 8 });
  kit.guard([[-3, 30], [3, 30]], { speed: 1.2, pause: 1.4, range: 9 }); // paces the obvious door
  kit.inscription(0, 2.4, 27.85, "KEEP THE FIRES FED", 0, "#ffb46a");

  // ================= B · UNDERCROFT ACCESS (x -18..-6, z 30..33) =========
  floorRect(-18, 30, -6, 33);
  kit.surface(-18, 30, -6, 33, "moss");
  hWall(33, -18, -6);                     // north, outer
  hWall(30, -18, -6);                     // south, outer
  // east/west open — doors owned by the rooms either side

  // ================= C · UNDERCROFT — Snuffed maintenance tunnels ========
  // (x -30..-18, z -8..33)
  floorRect(-30, -8, -18, 33);
  kit.surface(-30, -8, -18, 33, "moss");
  vWall(-18, -8, 33, [[10, 14], [30, 33]]); // east: vent shortcut into the hall + the access door
  vWall(-30, -8, 33);                       // west, outer
  hWall(33, -30, -18);                      // south, outer
  hWall(-8, -30, -18, [[-26, -22]]);        // north → the Chandlery's relic chamber
  kit.torch(-24, 26, { intensity: 3, range: 6, color: 0xaa4422 });
  kit.torch(-24, 10, { intensity: 3, range: 6, color: 0xaa4422 });
  kit.torch(-24, -4, { intensity: 3, range: 6, color: 0xaa4422 });
  kit.fogPatch(-29, 20, -19, 32, { conceal: 0.7, density: 0.05 });
  kit.fogPatch(-29, -6, -19, 18, { conceal: 0.68, density: 0.05 });
  // bleeding racks — dressing / partial cover
  for (const z of [24, 10, -2]) { kit.solid(0.4, 2.4, 1.6, -27, z, kit.mats.dark); kit.solid(0.4, 2.4, 1.6, -22, z, kit.mats.dark); }
  kit.cache("c1", -26, 24, 2);
  kit.cache("c2", -22, 4, 2);
  kit.mawMote("cmaw", -26, -4);
  // the walls remember, in order, as you creep north
  kit.inscription(-29.8, 1.7, 22, "I remember the vats. I remember being poured.", Math.PI / 2, "#9a86d8");
  kit.inscription(-29.8, 1.7, 4, "What the Old Dark surrenders, the Vigil renders bright.", Math.PI / 2, "#ffb46a");
  // three Snuffed drift the tunnels, blind, hunting sound — moss keeps you silent
  kit.guard([[-26, 28], [-26, 18]], { speed: 0.95, pause: 2.6, blind: true });
  kit.guard([[-24, 10], [-24, -2]], { speed: 1.0, pause: 2.2, blind: true });
  kit.guard([[-27, 0], [-20, -6], [-27, -6]], { speed: 1.05, pause: 1.8, blind: true });

  // ================= D · THE CHANDLERY HALL — molten vats ================
  // (x -18..16, z -2..28) — the dramatic set piece
  floorRect(-18, -2, 16, 28);
  kit.surface(-18, -2, 16, 28, "crystal");   // it sings underfoot; don't dawdle
  hWall(28, -18, -6);                        // south flank (Start owns the door segment)
  hWall(28, 6, 16);                          // south flank
  vWall(16, -2, 28);                         // east, outer
  hWall(-2, -18, 16, [[-3, 3]]);             // north → relic chamber
  // west wall owned by the undercroft (vent gap at z 10..14) — nothing built here

  // two rows of blazing light-vats flanking a shadowed central spine
  const vatRowZ = [22, 14, 6];
  for (const z of vatRowZ) {
    kit.torch(-9, z, { intensity: 10, range: 6.5 }); // tighter pool → the center spine stays dark
    kit.trim(2.2, 1.3, -9, 1.7, z + 1.6, 0, 0xff8a3c, 3.2);
    kit.torch(9, z, { intensity: 10, range: 6.5 });
    kit.trim(2.2, 1.3, 9, 1.7, z + 1.6, 0, 0xff8a3c, 3.2);
    kit.fogPatch(-10.5, z - 1.5, -7.5, z + 1.5, { conceal: 0.15, density: 0.09 }); // god-rays
    kit.fogPatch(7.5, z - 1.5, 10.5, z + 1.5, { conceal: 0.15, density: 0.09 });
  }
  // the wall of glowing vats — backdrop blaze along the east wall
  kit.trim(28, 1.6, 15.8, 2.4, 13, -Math.PI / 2, 0xffae55, 2.2);
  kit.inscription(9, 2.2, -1.85, "Every wick in Lanternspire drinks a stolen dusk.", 0, "#ffb46a");
  // bleeding-rack pillars between the vat rows — shadow the center spine
  kit.solid(1.0, 5.5, 5.0, -5, 18, kit.mats.dark);
  kit.solid(1.0, 8.0, 5.0, -5, 10, kit.mats.dark);
  kit.solid(1.0, 4.5, 5.0, 5, 18, kit.mats.dark);
  kit.solid(1.0, 7.0, 5.0, 5, 10, kit.mats.dark);
  kit.pillar(0.6, H, -16, 12, kit.mats.pillar); // cover at the vent mouth
  kit.pillar(0.6, H, -2, 20, kit.mats.pillar);
  kit.pillar(0.6, H, 2, 8, kit.mats.pillar);
  kit.cache("c3", 12, 22, 1); // a risk-reward vial, bright and exposed
  // the PHAROS, set in the north wall, sweeping the length of the hall
  kit.greatEye(0, -1.6, { dir: Math.PI / 2, sweep: 0.85, sweepSpeed: 0.45, range: 24, coneAngle: 0.24, height: 3.4 });
  // five Vespers work the rows and the crossing
  kit.guard([[-8, 25], [-8, 3]], { speed: 1.4, pause: 1.0 });
  kit.guard([[8, 3], [8, 25]], { speed: 1.4, pause: 1.0 });
  kit.guard([[-10, 14], [10, 14]], { speed: 1.5, pause: 0.8, range: 9 }); // shorter cone → doesn't sweep the whole hall
  kit.guard([[-4, 1.5], [4, 1.5]], { speed: 1.3, pause: 1.2 });
  kit.guard([[-4, 25], [4, 25]], { speed: 1.3, pause: 1.2 });

  // ================= E · RELIC CHAMBER (x -30..16, z -20..-2) ============
  floorRect(-30, -20, 16, -2);
  kit.surface(-30, -20, -18, -2, "moss");     // the undercroft's landing
  kit.surface(-18, -20, 16, -2, "obsidian");  // the chamber proper
  vWall(-30, -20, -2);                        // west, outer
  vWall(16, -20, -2);                         // east, outer
  hWall(-20, -30, 16);                        // north, outer
  // south boundary at z=-2 is owned by the hall's north wall — no rebuild
  kit.scepterPedestal(0, -11);                // THE LIGHT-HEART
  kit.trim(5, 0.2, 0, 3.0, -19.8, 0, 0xffd76a, 2.2);
  kit.torch(-6, -8, { intensity: 6, range: 9 });
  kit.torch(6, -8, { intensity: 6, range: 9 });
  kit.pillar(0.6, H, -6, -14, kit.mats.pillar);
  kit.pillar(0.6, H, 6, -14, kit.mats.pillar);
  kit.inscription(0, 2.0, -19.8, "This heart was mine before they set it burning.", 0, "#9a86d8");
  kit.guard([[-6, -8], [6, -8]], { speed: 1.3, pause: 1.5 });
  kit.guard([[-20, -12], [-10, -16]], { speed: 1.1, pause: 1.8 });

  // ================= ambient =================
  const moon = new THREE.DirectionalLight(0x7a8cc0, 0.55);
  moon.position.set(-10, 24, 10);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  // dim, sparse fill — the hall's own vats/torches carry that room; the
  // undercroft (no torches beyond a few dim reds) gets the lift instead
  for (const [x, y, z, i] of [[0, 9, 33, 4], [-24, 7, 12, 4], [-24, 7, -2, 4]]) {
    const f = new THREE.PointLight(0x7088b0, i, 16);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.8;
    scene.add(f);
  }

  // ================= checkpoints / triggers =================
  kit.checkpoint(0, 35, 3);
  kit.checkpoint(-24, 20, 3, -24, 20);          // deep in the undercroft
  kit.checkpoint(0, 14, 3);                      // committed to the hall crossing
  kit.checkpoint(0, -9, 3);                      // at the relic chamber
  kit.trigger("hall", 0, 24, 3);
  kit.trigger("undercroft", -14, 31.5, 2.4);
  kit.trigger("sanctum", 0, -6, 3);

  // ================= mission logic (NO route hints) =================
  bag.stage = 0;
  bag.objective = "Reach the Light-Heart";
  bag.onStart = (game) => game.hud.prompt("They call this place the Chandlery. You remember the heat.", 4.5);
  bag.onTrigger = (id, game) => {
    if (id === "hall" && !bag._hallSeen) {
      bag._hallSeen = true;
      game.hud.prompt("<b>KEEP THE FIRES FED.</b> Every lamp in the city was bled from something like me.", 4);
    }
    if (id === "undercroft" && !bag._underSeen) {
      bag._underSeen = true;
      game.hud.prompt("Quiet down here. The moss remembers how to be quiet too.", 3.6);
    }
    if (id === "sanctum" && bag.stage === 0) {
      bag.stage = 1;
      game.setObjective("Take the Light-Heart");
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.35;
    game.sfx.alarm();
    game.setObjective("Carry the Light-Heart to the rift");
    game.hud.prompt("<b>The hall wakes.</b> Every vat, every rack, every eye — all of it, awake, and looking for what was theirs.", 3.2);
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
