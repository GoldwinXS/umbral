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

  const H = 3.2;

  // ================= ROOMS (watertight, clean-corner, via kit.room/corridor) =
  // Each cell's floor + surface + walls build together; door gaps are the old
  // hWall/vWall gaps translated 1:1 into doors:{n,s,e,w}. Every cell is a
  // single surface, so `surface:` rides on the room. Corridors wall only their
  // two long sides; the open short ends join rooms through their door gaps.
  // Default kit height/thickness (3.2 / 0.4) already match this level.
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
