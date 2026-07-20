import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL — THE LANTERN-WAYS.
 * The outer thoroughfares of Lanternspire, pushed into after Brightward.
 * From a small junction, two throats of the city lead north to the rift:
 *   - the GREAT PLAZA: wide, blazing, cobbled in singing crystal, thick with
 *     Vespers — fast if you dare it, murderous if you don't read the shadows
 *     thrown by its own tenements.
 *   - the LANTERN-WAYS proper: dark alleys behind tall tenements, descending
 *     to a canal the Vigil never bothered to bridge twice. Cross it on a
 *     shadowstep, past a pair of blind, sound-hunting Snuffed who own the
 *     water's silence absolutely.
 * Both throats let out into a last concourse before the rift. No relic here.
 * The level does not explain itself. That is the puzzle.
 */
export function buildLanternWays() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "lanternways";
  bag.name = "THE LANTERN-WAYS";
  bag.spawn.set(0, 0.42, 36);
  bag.bounds = { x0: -38, z0: -44, x1: 24, z1: 44 };
  bag.startVials = 3;
  bag.blinkCdMul = 0.85;              // faster blink recharge than earlier levels
  bag.upgrades = { blinkRange: 6.5 }; // THIS LEVEL GRANTS A LONGER SHADOWSTEP
  const H = 3.4, TH = 0.5;

  // ---- watertight room helpers (walls with door gaps) ----
  const gapsCut = (a, b, gaps) => { const gs=(gaps||[]).slice().sort((p,q)=>p[0]-q[0]); const spans=[]; let cur=a; for (const [g0,g1] of gs){ if(g0>cur) spans.push([cur,Math.min(g0,b)]); cur=Math.max(cur,g1);} if(cur<b) spans.push([cur,b]); return spans; };
  const hWall = (z, x0, x1, gaps) => { for (const [a,b] of gapsCut(x0,x1,gaps)) if (b-a>0.02) kit.wall(b-a, H, TH, (a+b)/2, z); };
  const vWall = (x, z0, z1, gaps) => { for (const [a,b] of gapsCut(z0,z1,gaps)) if (b-a>0.02) kit.wall(TH, H, b-a, x, (a+b)/2); };
  const floorRect = (x0, z0, x1, z1, mat) => kit.floor(x1-x0, z1-z0, (x0+x1)/2, (z0+z1)/2, mat);

  // base dark slab under the whole footprint — seams never read as void
  kit.floor(64, 88, -8, -2, kit.mats.dark, -0.18);

  // a shared tenement helper — a tall dark block with a violet edge-trim
  const tenement = (x, z, w, d, h = 7) => {
    kit.solid(w, h, d, x, z, kit.mats.wall, 0);
    kit.trim(w * 0.7, 0.14, x, h - 0.6, z + d / 2 + 0.02, 0, 0x8a5cff, 1.3);
  };

  // ================= A · START HALL (x -6..6, z 30..40) =================
  floorRect(-6, 30, 6, 40);
  kit.surface(-6, 30, 6, 40, "moss");
  hWall(40, -6, 6);
  vWall(-6, 30, 40);
  vWall(6, 30, 40);
  // north wall shared with the Hub (drawn there)
  kit.torch(0, 35, { intensity: 4, range: 6 });
  kit.checkpoint(0, 36, 3);
  kit.trigger("start", 0, 34, 3);

  // ================= B · HUB / THE FORK (x -14..14, z 18..30) ============
  floorRect(-14, 18, 14, 30);
  kit.surface(-14, 18, 14, 30, "moss");
  hWall(30, -14, 14, [[-2, 2]]);       // south → start hall
  vWall(14, 18, 30);                    // east: dead wall, no route
  // west wall (→ alley) drawn by the alley room; north wall (→ plaza) drawn by the plaza
  kit.inscription(0, 2.5, 17.9, "KEEP THE FIRES FED", 0, "#ffb46a");
  kit.checkpoint(0, 24, 3);
  kit.trigger("hub", 0, 24, 5);

  // ================= C · GREAT PLAZA (x -20..20, z -6..18) ===============
  floorRect(-20, -6, 20, 18);
  kit.surface(-20, -6, -12, 18, "moss");    // west shadow lane behind tenements
  kit.surface(-12, -6, 12, 18, "crystal");  // the open square — sings underfoot
  kit.surface(12, -6, 20, 18, "moss");      // east shadow lane behind tenements
  hWall(18, -20, 20, [[-3, 3]]);            // south → hub
  hWall(-6, -20, 20, [[-3, 3]]);            // north → the lane, toward the concourse
  vWall(-20, -6, 18);
  vWall(20, -6, 18);
  // tenement rows carving the dark side-lanes
  tenement(-16, 13, 3.4, 4.6, 7);
  tenement(-16, 3, 3.4, 4.6, 6.5);
  tenement(16, 13, 3.4, 4.6, 7);
  tenement(16, 3, 3.4, 4.6, 6.5);
  tenement(-16, -3.5, 3, 3.4, 6);
  tenement(16, -3.5, 3, 3.4, 6);
  // exposed crystal square: hanging-lantern light pools + a little cover
  kit.torch(0, 14, { intensity: 13, range: 11 });
  kit.torch(-8, 9, { intensity: 12, range: 10 });
  kit.torch(8, 9, { intensity: 12, range: 10 });
  kit.torch(-6, 1, { intensity: 12, range: 10 });
  kit.torch(6, 1, { intensity: 12, range: 10 });
  kit.torch(0, -3, { intensity: 11, range: 9 });
  kit.pillar(1.3, 1.2, 0, 6, kit.mats.pillar);       // the plaza fountain
  kit.reflectPool(0, 9.5, 2.1);                      // watches for a thief's reflection
  kit.solid(2, 1.2, 2, -4, 8, kit.mats.block, 0.2);
  kit.solid(2, 1.2, 2, 4, 3.5, kit.mats.block, -0.2);
  kit.cache("plazaCache", 15.5, 6, 2);
  kit.mawMote("plazaMaw", -10, -4);
  // the temptation — five Vespers thick on the ground
  kit.guard([[-14, 15], [14, 15]], { speed: 1.5, pause: 1.0, range: 12 });
  kit.guard([[14, 15], [14, -1]], { speed: 1.4, pause: 1.2, range: 12 });
  kit.guard([[-14, -1], [-14, 15]], { speed: 1.4, pause: 1.2, range: 12 });
  kit.guard([[-8, 0], [8, 0]], { speed: 1.6, pause: 0.8, range: 11 });
  kit.guard([[2.5, 15.5], [2.5, -3.5]], { speed: 1.3, pause: 1.5, range: 13, coneAngle: 0.65 });
  kit.checkpoint(0, 10, 3);
  kit.trigger("plaza", 0, 12, 4);

  // ================= D · ALLEY (x -34..-14, z 2..30) ======================
  floorRect(-34, 2, -14, 30);
  kit.surface(-34, 2, -14, 30, "moss");
  hWall(30, -34, -14);                       // south: dead wall
  vWall(-34, 2, 30);                         // west: dead wall
  vWall(-14, 2, 30, [[22, 26]]);             // east → hub
  hWall(2, -34, -14, [[-26, -22]]);          // north → canal
  tenement(-28, 24, 6, 4.4, 7.5);
  tenement(-19, 16, 5, 5, 6.5);
  tenement(-29, 10, 7, 4.2, 8);
  tenement(-19, 6, 4.2, 6, 6);
  kit.cache("alleyCache", -30, 18, 2);
  kit.mawMote("alleyMaw", -22, 8);
  kit.guard([[-28, 28], [-20, 20]], { speed: 1.3, pause: 1.5 });
  kit.guard([[-30, 12], [-18, 12]], { speed: 1.3, pause: 1.6 });
  kit.inscription(-14.1, 2.4, 24, "You remember narrower doors, and kinder dark.", -Math.PI / 2, "#9a86d8");
  kit.checkpoint(-24, 16, 3, -24, 16);
  kit.trigger("alley", -24, 20, 4);

  // ================= E · CANAL / UNDERCROFT (x -34..-14, z -16..2) =======
  floorRect(-34, -2.5, -14, 2);               // south bank (incl. ledges)
  floorRect(-34, -16, -14, -8);               // north bank (incl. ledges)
  floorRect(-34, -8, -33, -2.5);              // west ledge, spanning the water
  floorRect(-15, -8, -14, -2.5);              // east ledge, spanning the water
  kit.hole(-33, -8, -15, -2.5);               // the canal itself — blink it
  kit.surface(-33, -2.5, -15, 2, "moss");     // south bank — silent approach
  kit.surface(-33, -16, -15, -8, "moss");     // north bank — silent landing
  kit.surface(-34, -16, -33, 2, "crystal");   // west ledge — a loud shortcut, watched
  kit.surface(-15, -16, -14, 2, "crystal");   // east ledge — a loud shortcut, watched
  vWall(-34, -16, 2);                         // west: dead wall
  vWall(-14, -16, 2);                         // east: dead wall
  // south wall shared with the alley; north wall drawn by the concourse
  kit.torch(-24, 0.5, { intensity: 3, range: 6, color: 0x9a7bff });
  kit.torch(-24, -14, { intensity: 3, range: 6, color: 0x9a7bff });
  kit.inscription(-33.9, 2.3, -7, "You remember drowning was never the worst part of water.", Math.PI / 2, "#9a86d8");
  // two Snuffed own this water's silence
  kit.guard([[-30, -0.5], [-18, -0.5]], { speed: 1.0, pause: 2.0, blind: true });
  kit.guard([[-30, -9.5], [-18, -9.5]], { speed: 1.0, pause: 2.0, blind: true });
  kit.checkpoint(-20, 0.5, 2.5, -20, 0.5);
  kit.checkpoint(-20, -11, 2.5, -20, -11);
  kit.trigger("canal", -24, -1, 4);

  // ================= F · THE LANE (x -3..3, z -16..-6) ====================
  floorRect(-3, -16, 3, -6);
  kit.surface(-3, -16, 3, -6, "obsidian");
  vWall(-3, -16, -6);
  vWall(3, -16, -6);
  // south wall shared with the plaza; north wall drawn by the concourse
  kit.checkpoint(0, -11, 2.5, 0, -11);

  // ================= G · CONCOURSE + RIFT (x -34..20, z -40..-16) ========
  floorRect(-34, -40, 20, -16);
  kit.surface(-34, -40, 20, -16, "moss");
  hWall(-16, -34, 20, [[-26, -22], [-3, 3]]); // south: canal door + lane door
  hWall(-40, -34, 20);                        // north: dead wall
  vWall(-34, -40, -16);
  vWall(20, -40, -16);
  kit.extraction(-7, -34);
  kit.trim(4, 0.2, -7, 2.6, -39.6, 0, 0x39f0c0, 2.2);
  kit.fogPatch(-14, -38, -2, -28, { conceal: 0.65, density: 0.05 });
  kit.cache("concourseCache", 10, -30, 2);
  kit.guard([[-10, -25], [10, -25]], { speed: 1.3, pause: 1.4 });
  kit.checkpoint(-7, -30, 3, -7, -30);
  kit.trigger("concourse", -7, -25, 5);

  // ================= ambient =================
  const moon = new THREE.DirectionalLight(0x8ea0cc, 1.3);
  moon.position.set(-16, 22, 10);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  for (const [x, y, z, i] of [
    [0, 8, 34, 12], [0, 8, 24, 12], [0, 9, 6, 10],
    [-24, 7, 16, 12], [-24, 7, -7, 11], [0, 8, -11, 10], [-7, 8, -28, 12],
  ]) {
    const f = new THREE.PointLight(0x7088b0, i, 24);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ================= mission logic (NO route hints) =================
  bag.objective = "The lanterns fork ahead";
  bag.onStart = (game) => game.hud.prompt("You remember when the lanterns did not follow you home.", 4.5);
  bag.onTrigger = (id, game) => {
    if (id === "hub") game.hud.prompt("The Lantern-Ways fork like a held breath.", 4);
    if (id === "plaza") game.hud.prompt("KEEP THE FIRES FED, the square insists, in a hundred tongues of flame.", 4);
    if (id === "alley") game.hud.prompt("You remember narrower doors, and kinder dark.", 4);
    if (id === "canal") game.hud.prompt("Something under the water still counts its dead in ripples.", 4);
    if (id === "concourse") game.hud.prompt("The rift exhales, patient as always.", 3.5);
  };

  bag.update = (t, dt, game) => {
    for (const tc of bag.torches) {
      if (!tc.doused) tc.light.intensity = tc.baseIntensity * (0.88 + 0.12 * Math.sin(t * 7 + tc.x * 2));
    }
    if (bag.extract) {
      bag.extract.disc.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.7;
    }
  };

  return bag;
}
