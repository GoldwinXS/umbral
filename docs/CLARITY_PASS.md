# CLARITY PASS — director's spec (waves 2 and 3)

Source: the 2026-07-25 playtest. Real players asked, in the first level:
"why can't I go this way?", "why am I slower in the light?", "why can't I
leave the level?", "I can't see anything, it's too dark." Every one of those
is a legibility failure, not a difficulty failure. This pass makes the game's
language explicit — starting with one color that always means the same thing.

Constraints that bind every change below (from three-realtime-rt 0.14.0):
- Runtime emissive changes DO NOT propagate to the NEE emitter table; any mesh
  whose glow must animate at runtime must be `rtExclude` (raster/glow-only).
- Light intensity/color are per-frame uniforms — always safe to animate.
- MAX_EMISSIVE_TRIS = 256 shared cap (THE LANTERN-WAYS sits exactly at it) —
  do not add new NEE emitters anywhere.
- The stealth meter (`_computePlayerVis`) reads light INTENSITY + direction,
  never color. Recoloring a light is meter-bit-identical. Lights tagged
  `userData.meterIgnore` are excluded from the meter entirely.

---

## WAVE 2 — THE GOAL COLOR (one color, one meaning)

`GOAL_TEAL = 0x39f0c0`. Already worn by the extraction rift and the vial
caches. After this wave it is worn by exactly the set of things the player
should move toward or want: the relic, the lit rift, vial caches. It must
never appear on anything hostile; flame-gold (0xffd76a family) must never
again appear on anything the player is meant to approach as a goal.

Export the constant once (levelKit.js) and use it at every site — no more
scattered hex literals for this family.

### 2a. The relic goes teal (levelKit.scepterPedestal + per-level overrides)
- `core` emissive: 0xffd76a → GOAL_TEAL (rtExclude already — safe).
- `light` color: 0xffd76a → GOAL_TEAL, same intensity/range (meter unchanged
  by design: the meter never reads color).
- glass `shell` color: 0xffd8a0 → a cool tint (≈ 0xb0fff0) so refraction
  agrees with the glow.
- tutorial.js hand-overrides the wick back to gold (`wick.core.material
  .emissive.set(0xffd76a)`) — DELETE that override; keep its dimmed
  intensity/distance override (that one is a detection-design choice).
- Grep all levels for other per-level scepter recolors and remove them.

### 2b. The exit is DORMANT until the relic is taken (levelKit.extraction + main.js)
Current: a flat disc glowing full teal from frame one — it advertises an exit
that will not work, which is exactly the "why can't I leave?" confusion.

New extraction() builds a small rift group:
- GROUND DISC: keep, but slightly smaller (r 1.1) and dormant by default —
  emissive GOAL_TEAL at intensity ≈ 0.12, color near-black. A slow ~0.15 Hz
  shimmer (sin on emissiveIntensity, ±30%) so it reads "something is here,
  and it is asleep." rtExclude (already is).
- THE TEAR: a vertical lens — two crossed planes (additive, transparent,
  rtExclude, depthWrite false), ~2.2 m tall, teal, opacity ~0 when dormant.
- THE BEACON COLUMN: a thin additive cylinder (rtExclude) rising ~14 m,
  opacity 0 when dormant. This is the "go this way" signal — when lit it must
  be visible OVER the walls from anywhere in the level.
- LIGHT: one PointLight, GOAL_TEAL, intensity 0 dormant / ~6 lit, range ~10,
  `userData.meterIgnore = true` (lore: the Vigil sees by flame; riftlight is
  void — and mechanically the meter must not shift when the exit wakes),
  `userData.rtRadius = 0.15`.
- API: `bag.extract.setLit(f)` where f is 0..1 — sets all four in one place.
  Store the pieces on bag.extract.

main.js drives it:
- On loadLevel: lit = level has no scepter (if any such level exists);
  dormant otherwise.
- On scepter grab (where scepterTaken is set): animate 0 → 1 over ~1.2 s with
  a brief overshoot flare (peak ~1.6 at ~0.4 s). One small piece of state in
  _step or the extract update — follow the house pattern used for pulses.
- Death reset rebuilds the level, so dormancy resets for free.

### 2c. The sealed-exit answer
If the player touches the extraction radius without the relic (the existing
proximity check already knows this case — it currently just refuses), prompt
once per visit: "The rift is sealed. It wakes when the <relic name> is in
your grasp." Use bag's relic display name if present (e.g. "the Wickstone");
fall back to "relic". This turns a silent refusal into a taught rule.

### 2d. HUD agreement (cheap, do it)
The objective line in the HUD gets a GOAL_TEAL accent (left border or the
objective label color) so text-goal and world-goal share the color. hud.js
only — no layout changes.

### Verification (wave 2)
- Probe: on a scepter level, exit light intensity == 0 and meter reading at
  the exit is bit-identical before/after setLit(1) (meterIgnore holds).
- Probe: grab the scepter programmatically → setLit animates to 1; beacon
  column vertices exist; no new entries in the NEE emitter table on any level
  (re-run emitter-count.mjs — counts must be UNCHANGED per level).
- npm run build clean; gameplay audit 8/8 reachExit.

---

## WAVE 3 — THE ASHWAY teaches like it means it (tutorial.js + small main.js hooks)

Principles: every rule the player must know is (1) shown by the world,
(2) said once in words at the moment it first bites, (3) never said again.
New pickups are placed ON the walking line, not beside it.

### 3a. "It's too dark"
- TUNE.moonBoost 2.7 → 3.6 on THE ASHWAY only (render-only knob; the meter
  reads TUNE.moon which DOES NOT CHANGE — the file's own comment block
  documents this contract).
- Do not touch other levels' lighting in this wave.

### 3b. "Why am I slower in the light?" — say it when it first bites
- main.js: a one-shot hint, level 0 only: the first time the player is moving
  (speed > 0.8) with litness high (_litSmooth > 0.55) for > 0.6 s continuous,
  prompt: "Light clings to you — you are slow and seen in it. The dark makes
  you swift." Fires once per run (flag on the game, cleared on loadLevel).
- The existing towerHide prompt stays (it covers HIDE; this covers SLOW).

### 3c. "Why can't I go this way?" — make the impassable look impassable
- The two long burnt breaches on the lane's north frontage (h ≈ 1.0–1.1 at
  x −42..−38 and x −20..−15) plus the yard's south collapsed stretch
  (x 25..30) read as hoppable but are colliders. Heap rubble along their
  sills (kit.rubble, 2–3 per breach, riding ON the sill line) so the eye
  reads "choked with debris," not "low wall I should vault."
- The court's rubble sill at z −9 already does this correctly — copy its
  look.
- fogWall stays the hard "world edge" language; its prompt already exists.

### 3d. Pickups in the path (THE ASHWAY gets its first pickups)
- One vial cache (kit.cache) ON the lane's walking strip at ≈ (−16, 1.5) —
  the moonlit breach stretch, unmissable. On pickup (first cache ever taken,
  any level): prompt "Void vials. Throw one to drown a flame." (check for an
  existing douse teaching prompt in dousing.js before wording — do not
  double-teach; if dousing.js already teaches the throw, this line becomes
  "Void vials — the shrine's flames will fear them." and dousing keeps the
  mechanics line).
- bag.startVials stays 0 — the cache IS the grant, in the path.
- NO maw mote on level 0 (devour is taught by THE SWALLOW; a primer mote
  would teach a verb the level gives no target for).

### 3e. Swallow (maw) abundance — game-wide rebalance
User verdict: motes are so scarce the devour verb feels "never worth using."
- Inventory every kit.mawMote across all 8 levels (grep). Target: roughly
  DOUBLE the count per level (minimum 2 on any level with wardens), with the
  additions placed ON or immediately beside the critical path, each within
  ~12 m BEFORE a spot where devour genuinely shines (a chokepoint patrol, a
  lone straggler, a Snuffed in a corridor).
- THE SWALLOW (the teaching level) gets its first mote in a corridor the
  player cannot avoid.
- Do not change mawCharges cap or devour rules — supply only.
- List every added mote (level, position, the encounter it serves) in the
  report.

### 3f. Relic naming in the objective line (small, high-flavor)
Where levels set objectives generically, use the relic's name if the bag
carries one ("Shadowstep to the Wickstone" already does this — level bags
that say "the relic" get their proper noun). Audit only; small text edits.

### Verification (wave 3)
- Playwright: drive the lane route on level 0; assert the light-slow hint
  fires exactly once, the cache grants vials, prompts render.
- Emitter counts unchanged (rubble is non-emissive; cache/motes rtExclude).
- npm run build clean; audit 8/8 reachExit.
- Screenshot the lane and the yard for the director (use the harness boot()
  — it carries the required visibilityState override).

---

## Sequencing / ownership
- Wave 2 first (levelKit.js + main.js + hud.js + per-level recolor deletes).
- Wave 3 after wave 2 lands (tutorial.js depends on the goal-color language;
  3e touches all level files — must not run concurrently with the geometry
  fix agent).
- Agents never run git. The director reviews diffs and commits.
- No emojis anywhere — code, comments, strings, UI, reports.
