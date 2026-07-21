import * as THREE from "three";
import { makeKit } from "../levelKit.js";

/**
 * LEVEL — THE LAMPWAY (a dousing tutorial-mission).
 *
 * A lamplighters' service route behind Lanternspire's outer wall. Hush is
 * given three void vials and taught, in three clear steps, what they are
 * for: torches pin a Vesper's watch to one bright spot; douse the torch and
 * the watch goes blind. The shatter is also a small thunder of its own — it
 * can call a guard as surely as light unmakes you. One creature down this
 * route cares nothing for any of that: a Snuffed, blind and lampless,
 * hunting by sound alone. Silence beats it; a thrown vial does not.
 *
 * START HALL → CHOKE (douse #1, a Vesper's lit door) → HUB, which forks:
 *   north = SNUFFED CORRIDOR (silence, no light, no vials)
 *   south = LIT CORRIDOR (douse #2, a Vesper strung the whole hall)
 * both rejoin at a STAGING room → RELIC CHAMBER (douse #3, a GREAT lantern
 * guards the pedestal) → take the relic (it wakes the lamps behind you) →
 * ESCAPE CORRIDOR → the rift.
 *
 * Floors and surface plates are tiled with NO overlap (overlapping coplanar
 * plates z-fight). Every room is fully walled with gaps only at doorways.
 */
export function buildDousing() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);
  const kit = makeKit(scene);
  const bag = kit.bag;
  bag.id = "lampway";
  bag.name = "THE LAMPWAY";
  bag.spawn.set(-37, 0.42, -1);
  bag.bounds = { x0: -41, z0: -11, x1: 67, z1: 11 };

  const H = 3.2, TH = 0.4;

  // ---- watertight room helpers (walls with door gaps), same shape as the
  // helpers used in vault.js / lanternways.js / chandlery.js ----
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
  floorRect(-40, -4, -32, 4);     // A   START HALL      x[-40,-32] z[-4,4]
  floorRect(-32, -1.5, -28, 1.5); // AB  corridor         x[-32,-28] z[-1.5,1.5]
  floorRect(-28, -9, -14, 9);     // B   CHOKE ROOM       x[-28,-14] z[-9,9]
  floorRect(-14, -1.5, -10, 1.5); // BC  corridor         x[-14,-10] z[-1.5,1.5]
  floorRect(-10, -10, 10, 10);    // C   HUB              x[-10,10]  z[-10,10]
  floorRect(10, 3, 24, 7);        // U   upper (Snuffed)  x[10,24]   z[3,7]
  floorRect(10, -7, 24, -3);      // L   lower (douse #2) x[10,24]   z[-7,-3]
  floorRect(24, -9, 34, 9);       // F   STAGING          x[24,34]   z[-9,9]
  floorRect(34, -1.5, 38, 1.5);   // FG  corridor         x[34,38]   z[-1.5,1.5]
  floorRect(38, -10, 54, 10);     // G   RELIC CHAMBER    x[38,54]   z[-10,10]
  floorRect(54, -1.5, 58, 1.5);   // GH  escape corridor  x[54,58]   z[-1.5,1.5]
  floorRect(58, -6, 66, 6);       // H   EXTRACTION       x[58,66]   z[-6,6]

  // ================= SURFACE PLATES (tiled, non-overlapping, 1:1 w/ floors) ==
  kit.surface(-40, -4, -32, 4, "moss");    // start — silent, dark
  kit.surface(-32, -1.5, -28, 1.5, "moss");
  kit.surface(-28, -9, -14, 9, "moss");    // choke room — silent once doused
  kit.surface(-14, -1.5, -10, 1.5, "moss");
  kit.surface(-10, -10, 10, 10, "moss");   // hub — safe breathing room
  kit.surface(10, 3, 24, 7, "moss");       // Snuffed corridor — MUST stay silent
  kit.surface(10, -7, 24, -3, "moss");     // lit corridor — silent once doused
  kit.surface(24, -9, 34, 9, "moss");      // staging
  kit.surface(34, -1.5, 38, 1.5, "moss");
  kit.surface(38, -10, 54, 10, "crystal"); // relic chamber sings — the finale is loud
  kit.surface(54, -1.5, 58, 1.5, "moss");  // escape — quiet dash
  kit.surface(58, -6, 66, 6, "moss");

  // ================= WALLS =====================================================
  // A · START HALL x[-40,-32] z[-4,4] — dead west/north/south, door east
  hWall(4, -40, -32); hWall(-4, -40, -32);
  vWall(-40, -4, 4);
  vWall(-32, -4, 4, [[-1.5, 1.5]]);
  // AB corridor
  hWall(1.5, -32, -28); hWall(-1.5, -32, -28);
  // B · CHOKE ROOM x[-28,-14] z[-9,9] — dead north/south, doors west+east
  hWall(9, -28, -14); hWall(-9, -28, -14);
  vWall(-28, -9, 9, [[-1.5, 1.5]]);
  vWall(-14, -9, 9, [[-1.5, 1.5]]);
  // BC corridor
  hWall(1.5, -14, -10); hWall(-1.5, -14, -10);
  // C · HUB x[-10,10] z[-10,10] — dead north/south, door west, TWO doors east (fork)
  hWall(10, -10, 10); hWall(-10, -10, 10);
  vWall(-10, -10, 10, [[-1.5, 1.5]]);
  vWall(10, -10, 10, [[3, 7], [-7, -3]]);
  // U · upper (Snuffed) corridor x[10,24] z[3,7]
  hWall(7, 10, 24); hWall(3, 10, 24);
  // L · lower (douse #2) corridor x[10,24] z[-7,-3]
  hWall(-3, 10, 24); hWall(-7, 10, 24);
  // F · STAGING x[24,34] z[-9,9] — dead north/south, TWO doors west (fork rejoin), door east
  hWall(9, 24, 34); hWall(-9, 24, 34);
  vWall(24, -9, 9, [[3, 7], [-7, -3]]);
  vWall(34, -9, 9, [[-1.5, 1.5]]);
  // FG corridor
  hWall(1.5, 34, 38); hWall(-1.5, 34, 38);
  // G · RELIC CHAMBER x[38,54] z[-10,10] — dead north/south, door west+east
  hWall(10, 38, 54); hWall(-10, 38, 54);
  vWall(38, -10, 10, [[-1.5, 1.5]]);
  vWall(54, -10, 10, [[-1.5, 1.5]]);
  // GH escape corridor
  hWall(1.5, 54, 58); hWall(-1.5, 54, 58);
  // H · EXTRACTION x[58,66] z[-6,6] — dead north/south/east, door west
  hWall(6, 58, 66); hWall(-6, 58, 66);
  vWall(58, -6, 6, [[-1.5, 1.5]]);
  vWall(66, -6, 6);

  kit.extraction(62, 0);
  kit.trim(3.4, 0.2, 62, 2.4, 5.7, 0, 0x39f0c0, 2.0);

  // ================= LANTERNS (a mix — small pools + two GREAT lanterns) ======
  kit.torch(-15, 0, { intensity: 7, range: 9, scale: 1 });      // small — CHOKE #1
  kit.torch(17, -5, { intensity: 8, range: 9, scale: 1 });      // small — CHOKE #2
  kit.torch(0, 0, { intensity: 6, range: 7, scale: 1 });        // small — hub ambience
  kit.torch(29, 4, { intensity: 14, range: 11, scale: 2.0 });   // GREAT — staging ambience
  kit.torch(44, 0, { intensity: 13, range: 11, scale: 1.8 });   // GREAT — CHOKE #3 (relic guard)

  // ================= VOID VIAL CACHES (refills along the route) ===============
  // capB sits in Room B BEFORE the lit door + its torch — you grab vials, then
  // meet the light you spend them on (not on the far side of the obstacle).
  kit.cache("capB", -25, 4, 2);   // choke room, near the entrance — before the lit door
  kit.cache("capU", 17, 5, 1);    // Snuffed corridor — a quiet find, no light needed
  kit.cache("capF", 29, -4, 2);   // staging — refill before the relic chamber

  // ================= cover / obstacles (break sightlines, give hiding spots) ==
  kit.solid(1.7, 1.3, 1.7, -23, -5, kit.mats.block, 0.2);  // choke room crate
  kit.solid(1.6, 1.3, 1.6, -18, 6, kit.mats.block, -0.2);  // choke room crate
  kit.solid(2.0, 1.3, 1.4, -5, 6, kit.mats.block, 0);      // hub cover
  kit.solid(1.4, 1.3, 2.0, 5, -6, kit.mats.block, 0);      // hub cover
  kit.pillar(0.6, H, -6, -7);                              // hub pillar
  kit.solid(1.6, 1.3, 1.6, 28, -6, kit.mats.block, 0.15);  // staging crate
  kit.solid(1.6, 1.3, 1.6, 30, 6, kit.mats.block, -0.15);  // staging crate
  kit.pillar(0.55, H, 46, 6);                              // relic chamber pillar
  kit.pillar(0.55, H, 42, -6);                             // relic chamber pillar

  // ================= GUARDS =====================================================
  // exactly two enemy types: normal Vespers (lit, cone-sighted) and Snuffed
  // (blind({blind:true}), lightless, sound-hunting only)
  kit.guard([[-15, -4], [-15, 4]], { speed: 1.1, pause: 1.4, range: 8 });   // 1 · choke room Vesper
  kit.guard([[13, -5], [21, -5]], { speed: 1.2, pause: 1.3, range: 8 });    // 2 · lit corridor Vesper (choke #2)
  kit.guard([[13, 5], [21, 5]], { speed: 1.0, pause: 2.0, blind: true });   // 3 · the SNUFFED — silence only
  kit.guard([[44, -5], [44, 5]], { speed: 1.2, pause: 1.3, range: 9 });     // 4 · relic-guard Vesper (choke #3)
  kit.guard([[60, -4], [60, 4]], { speed: 1.3, pause: 1.0, range: 9 });     // 5 · extraction-chamber Vesper

  // ================= relic ======================================================
  kit.scepterPedestal(50, 0);
  kit.trim(5, 0.2, 53.7, 3.0, 0, Math.PI / 2, 0xffd76a, 2.0); // on the wall behind the pedestal

  // ================= inscriptions (lore) =========================================
  kit.inscription(0, 2.4, 9.6, "THE LAMPS REMEMBER EVERY HAND THAT FED THEM", 0, "#ffb46a");
  kit.inscription(17, 2.2, 6.7, "IT DOES NOT SEE. IT LISTENS.", 0, "#7a6bb0");
  kit.inscription(38.4, 2.4, 3.2, "TAKE ONLY WHAT THE DARK WILL CARRY", -Math.PI / 2, "#ffd76a");

  // ================= dormant alarm lamps (the wake, after the theft) ============
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

  // ================= ambient (low key — pools & shadow must read) ================
  const moon = new THREE.DirectionalLight(0x8ea0cc, 0.55);
  moon.position.set(-14, 22, 8);
  moon.userData.rtRadius = 0.05;
  scene.add(moon, moon.target);
  // faint fills, well clear of the spawn and of the guarded choke lines
  for (const [x, y, z] of [[-24, 7, 4], [0, 8, 0], [49, 8, 5]]) {
    const f = new THREE.PointLight(0x7088b0, 3.4, 14);
    f.position.set(x, y, z);
    f.userData.rtRadius = 0.85;
    scene.add(f);
  }

  // ================= checkpoints ==================================================
  kit.checkpoint(-36, 0, 3);
  kit.checkpoint(-21, 0, 3.5);
  kit.checkpoint(0, 0, 3);
  kit.checkpoint(17, -5, 2.5, 17, -5);
  kit.checkpoint(29, 0, 3.5);
  kit.checkpoint(46, 0, 3.5);
  kit.checkpoint(62, 0, 3);

  // ================= triggers / teaching =========================================
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
  bag.onStart = (game) => game.hud.prompt("Cold glass rides your palm — void, waiting to be spent.", 4);
  bag.onTrigger = (id, game) => {
    const p = game.hud;
    switch (id) {
      case "start":
        if (bag.stage === 0) {
          bag.stage = 1;
          p.prompt("You are Hush, smaller now, but still the dark between the lamps. Three void vials ride your palm — ahead, torchlight will betray you.", 5);
        }
        break;
      case "chokeB":
        if (bag.stage === 1) {
          bag.stage = 2;
          game.setObjective("Douse the torch and slip through");
          p.prompt(game.isTouch
            ? "Torchlight pins that door, and something watches it. Tap <b>◍</b> to hurl a vial and shatter the flame — the dark it leaves will hide you. But breaking glass is its own small thunder; it can call a watcher as surely as light unmakes you."
            : "Torchlight pins that door, and something watches it. Press <span class='keycap'>Q</span> to hurl a vial and shatter the flame — the dark it leaves will hide you. But breaking glass is its own small thunder; it can call a watcher as surely as light unmakes you.", 6);
        }
        break;
      case "hub":
        if (bag.stage === 2) {
          bag.stage = 3;
          game.setObjective("Choose your way east");
          p.prompt("Two ways lead on. South: a lit throat, and a Vesper who trusts its own torch. North: true dark — but something blind still listens there.", 5);
        }
        break;
      case "upperWarn":
        if (!bag._upperSeen) {
          bag._upperSeen = true;
          p.prompt("This one they call <b>Snuffed</b>. No torch feeds it, no cone betrays its ground — it hunts by ear alone. Keep to the moss, and do not spend a vial anywhere near it; the shatter is exactly what it listens for.", 5.5);
        }
        break;
      case "lowerWarn":
        if (!bag._lowerSeen) {
          bag._lowerSeen = true;
          p.prompt("Another flame, another watcher, the whole hall lit end to end. Douse it as before, and the corridor goes quiet as a held breath.", 4.5);
        }
        break;
      case "convergence":
        if (bag.stage === 3) {
          bag.stage = 4;
          game.setObjective("Reach the relic chamber");
          p.prompt("Both ways remember the same door. Ahead, a vault kept far too bright.", 4);
        }
        break;
      case "relicRoom":
        if (bag.stage === 4) {
          bag.stage = 5;
          game.setObjective("Take the relic beyond the light");
          p.prompt("One great lantern guards the last stretch to the pedestal, and the watcher beneath it trusts that light completely. Douse it, and the relic is yours to take.", 5.5);
        }
        break;
      case "escapeCorr":
        if (game.scepterTaken && !bag._escapeSeen) {
          bag._escapeSeen = true;
          p.prompt("The rift is close. Outrun what the light has already told them.", 3.5);
        }
        break;
    }
  };

  bag.onAlarm = (game) => {
    game.guardSpeedMul = 1.3;
    game.sfx.alarm();
    game.setObjective("Escape to the rift!");
    game.hud.prompt("<b>The relic wakes and blazes in your hands</b> — every lamp down the Lampway now knows your shape. Run, Hush. <b>RUN.</b>", 3.5);
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
