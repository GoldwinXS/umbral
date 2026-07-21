import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL — THE GORGE (a swallowing tutorial-mission).
 *
 * A narrow service cut behind the wardens' watch, ending in a Vesper's own
 * feeding-gorge. Hush arrives hungry for the first time and is taught, in
 * two clear strikes, what that hunger is for: a crimson mote kindles the
 * maw, and a Vesper caught from its blind rear arc can be swallowed whole —
 * removed, and Hush a little larger for it. Strike one from the front
 * instead and it only shoves you back; the maw does not open that way.
 *
 * START HALL → DEVOUR ROOM (lone Vesper, mote #1 — first swallow) →
 * THE GORGE, a single wide chamber that folds all three watchers into one
 * lesson: a blind Snuffed hunting the west moss by ear alone, a second lone
 * Vesper in the middle stretch (mote #2, second swallow), and the PHAROS
 * itself set in the north wall of the east reach, sweeping the one door out
 * — time its gaze, take the relic from the alcove beneath it, and go.
 * → EXTRACTION.
 *
 * Floors and surface plates are tiled with NO overlap (overlapping coplanar
 * plates z-fight). Every room is fully walled with gaps only at doorways.
 */
export function buildSwallow() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "gorge";
  bag.name = "THE GORGE";
  bag.spawn.set(-17, 0.42, 0);
  bag.bounds = { x0: -21, z0: -12, x1: 63, z1: 12 };

  const H = 3.2, TH = 0.4;

  // ---- watertight room helpers (walls with door gaps), same shape as the
  // helpers used in dousing.js / vault.js / spire.js ----
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

  // ================= FLOORS (one per cell, exactly abutting — no overlap) ====
  floorRect(-20, -4, -12, 4);     // A   START HALL      x[-20,-12] z[-4,4]
  floorRect(-12, -1.5, -8, 1.5);  // AB  corridor         x[-12,-8]  z[-1.5,1.5]
  floorRect(-8, -8, 14, 8);       // B   DEVOUR ROOM      x[-8,14]   z[-8,8]
  floorRect(14, -1.5, 18, 1.5);   // BC  corridor         x[14,18]   z[-1.5,1.5]
  floorRect(18, -11, 50, 11);     // C   THE GORGE        x[18,50]   z[-11,11]
  floorRect(50, -1.5, 54, 1.5);   // CD  corridor         x[50,54]   z[-1.5,1.5]
  floorRect(54, -6, 62, 6);       // D   EXTRACTION       x[54,62]   z[-6,6]

  // ================= SURFACE PLATES (tiled, non-overlapping) =================
  kit.surface(-20, -4, -12, 4, "moss");    // start — silent, dark
  kit.surface(-12, -1.5, -8, 1.5, "moss");
  kit.surface(-8, -8, 14, 8, "moss");      // devour room — silent, ideal for a rear approach
  kit.surface(14, -1.5, 18, 1.5, "moss");
  // THE GORGE — one floor cell, three tiled bands (all exactly abut, no gaps/overlap)
  kit.surface(18, -11, 28, 11, "moss");     // west  — Snuffed zone, MUST stay silent
  kit.surface(28, -11, 38, 11, "obsidian"); // mid   — second Vesper, moderate noise
  kit.surface(38, -11, 50, 11, "crystal");  // east  — Pharos + pedestal, the finale sings
  kit.surface(50, -1.5, 54, 1.5, "moss");
  kit.surface(54, -6, 62, 6, "moss");       // escape — quiet dash

  // ================= WALLS =====================================================
  // A · START HALL x[-20,-12] z[-4,4] — dead west/north/south, door east
  hWall(4, -20, -12); hWall(-4, -20, -12);
  vWall(-20, -4, 4);
  vWall(-12, -4, 4, [[-1.5, 1.5]]);
  // AB corridor
  hWall(1.5, -12, -8); hWall(-1.5, -12, -8);
  // B · DEVOUR ROOM x[-8,14] z[-8,8] — dead north/south, doors west+east
  hWall(8, -8, 14); hWall(-8, -8, 14);
  vWall(-8, -8, 8, [[-1.5, 1.5]]);
  vWall(14, -8, 8, [[-1.5, 1.5]]);
  // BC corridor
  hWall(1.5, 14, 18); hWall(-1.5, 14, 18);
  // C · THE GORGE x[18,50] z[-11,11] — dead north/south, door west+east
  hWall(11, 18, 50); hWall(-11, 18, 50);
  vWall(18, -11, 11, [[-1.5, 1.5]]);
  vWall(50, -11, 11, [[-1.5, 1.5]]);
  // CD corridor
  hWall(1.5, 50, 54); hWall(-1.5, 50, 54);
  // D · EXTRACTION x[54,62] z[-6,6] — dead north/south/east, door west
  hWall(6, 54, 62); hWall(-6, 54, 62);
  vWall(54, -6, 6, [[-1.5, 1.5]]);
  vWall(62, -6, 6);

  kit.extraction(58, 0);
  kit.trim(3.4, 0.2, 61.7, 2.4, 0, Math.PI / 2, 0x39f0c0, 2.0);

  // ================= LANTERNS (a mix — small pools + two GREAT lanterns) ======
  kit.torch(3, 5, { intensity: 6, range: 8, scale: 1 });                       // small — devour room
  kit.torch(22, 0, { intensity: 2.5, range: 5, color: 0x6a5aa0, scale: 1 });   // small, dim — Snuffed zone (near-dark)
  kit.torch(33, -3, { intensity: 6, range: 8, scale: 1 });                     // small — second Vesper's stretch
  kit.torch(40, 6, { intensity: 13, range: 11, scale: 1.8 });                  // GREAT — under the Pharos
  kit.torch(46, -3, { intensity: 14, range: 11, scale: 2.0 });                 // GREAT — pedestal guard light
  kit.torch(58, 0, { intensity: 6, range: 8, scale: 1 });                      // small — extraction

  // ================= crimson maw motes — charge the devour =====================
  kit.mawMote("maw1", -6, -5);  // devour room — tucked off the Vesper's line, in shadow
  kit.mawMote("maw2", 24, 9);   // Gorge, far NW corner — a safe top-up before the finale

  // ================= decoration / light cover ===================================
  kit.solid(1.4, 1.2, 1.4, -2, 4, kit.mats.block, 0.15);
  kit.pillar(0.6, H, 33, 4);

  // ================= GUARDS — exactly three enemy TYPES ========================
  // 1 · normal Vespers (devourable — the swallow lesson)
  kit.guard([[-4, 0], [10, 0]], { speed: 1.1, pause: 1.5, range: 8 });     // devour room — LESSON 1
  kit.guard([[30, -7], [36, -7]], { speed: 1.2, pause: 1.4, range: 9 });   // Gorge mid stretch — LESSON 2
  // 2 · the SNUFFED — blind, hunts by sound, only ONE in the level
  kit.guard([[22, 5], [22, -5]], { speed: 1.0, pause: 2.0, blind: true });
  // 3 · the PHAROS — stationary, sweeps the one door out of the Gorge, only ONE
  kit.greatEye(44, 10, { dir: -Math.PI / 2, sweep: 0.7, sweepSpeed: 0.45, range: 14, coneAngle: 0.24, height: 3.2 });

  // ================= relic =======================================================
  kit.scepterPedestal(46, -8);
  kit.trim(5, 0.2, 40, 3.0, -10.7, 0, 0xffd76a, 2.0); // on the south wall, near the pedestal alcove

  // ================= inscriptions (lore) =========================================
  kit.inscription(3, 2.4, 7.7, "THE MAW REMEMBERS WHAT THE EYE FORGETS", 0, "#ff4a5e");
  kit.inscription(22, 1.8, 10.7, "IT DOES NOT SEE. IT ONLY LISTENS.", 0, "#7a6bb0");
  kit.inscription(40, 2.4, -10.6, "TAKE WHAT THE EYE HAS NOT YET COUNTED", 0, "#ffd76a");

  // ================= ambient (low key — pools & shadow must read) ================
  const moon = new THREE.DirectionalLight(0x8ea0cc, 0.55);
  moon.position.set(8, 22, 6);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  // faint fills, well clear of the spawn and of the guarded stretches
  for (const [x, y, z] of [[3, 8, 2], [34, 8, -2]]) {
    const f = new THREE.PointLight(0x7088b0, 3.4, 14);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ================= checkpoints ==================================================
  kit.checkpoint(-17, 0, 3);
  kit.checkpoint(3, 0, 3.5);
  kit.checkpoint(20, 8, 3, 20, 8);
  kit.checkpoint(34, -9, 3, 34, -9);
  kit.checkpoint(46, -9, 3, 46, -9);
  kit.checkpoint(58, 0, 3);

  // ================= triggers / teaching =========================================
  kit.trigger("start", -14, 0, 3);
  kit.trigger("devourRoom", -6, 0, 3);
  kit.trigger("gorge", 20, 0, 4);
  kit.trigger("vesperZone", 29, -3, 3);
  kit.trigger("pharosZone", 39, 0, 4);
  kit.trigger("escape", 56, 0, 3);

  bag.stage = 0;
  bag.objective = "Find a way to feed";
  bag.onStart = (game) => game.hud.prompt("Something in you has gone hungry, Hush. Find what feeds it.", 4.5);
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "start":
        if (bag.stage === 0) {
          bag.stage = 1;
          p.prompt("You are still the dark between the lamps — but lean now, wanting. Ahead, a crimson glimmer waits to teach your mouth what it's for.", 5);
        }
        break;
      case "devourRoom":
        if (bag.stage === 1) {
          bag.stage = 2;
          game.setObjective("Feed, then swallow a Vesper whole");
          p.prompt(game.isTouch
            ? "A <b>crimson mote</b> glimmers ahead — drift over it to feed; your eyes will kindle red. Then find the Vesper's blind rear arc and tap <b>🗡</b> to swallow it whole. Catch it from the front instead and it only feels a shove — the maw only opens behind."
            : "A <b>crimson mote</b> glimmers ahead — drift over it to feed; your eyes will kindle red. Then find the Vesper's blind rear arc and press <span class='keycap'>F</span> to swallow it whole. Catch it from the front instead and it only feels a shove — the maw only opens behind.", 6);
        }
        break;
      case "gorge":
        if (bag.stage === 2) {
          bag.stage = 3;
          game.setObjective("Cross the Gorge unseen");
          p.prompt("Beyond this door the Gorge opens wide. Something blind hunts the near side by ear alone — they call it <b>Snuffed</b>. No mote will feed you off it; no cone betrays its ground. Keep to the moss and give it nothing to hear.", 5.5);
        }
        break;
      case "vesperZone":
        if (!bag._vesperSeen) {
          bag._vesperSeen = true;
          p.prompt("Another Vesper walks this stretch, trusting no torch and no eye but its own. A second mote waits nearby if your maw has already emptied — feed, circle behind, and swallow again.", 5);
        }
        break;
      case "pharosZone":
        if (bag.stage === 3) {
          bag.stage = 4;
          game.setObjective("Take the relic beneath the Eye's gaze");
          p.prompt("The <b>Pharos</b> watches this stretch — it does not move, does not give chase, only stares down a long cone that sweeps side to side. Catch its gaze while lit and it screams your ground to everything that still walks nearby. Time its sweep; take the relic from the alcove when its eye has turned.", 6);
        }
        break;
      case "escape":
        if (game.scepterTaken && !bag._escapeSeen) {
          bag._escapeSeen = true;
          p.prompt("The rift is close. Whatever the Eye has already told them is already running.", 3.5);
        }
        break;
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.3;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    game.hud.prompt("<b>The relic wakes in your grip</b> — every watcher in the Gorge now knows your shape. Run, Hush. <b>RUN.</b>", 3.2);
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
