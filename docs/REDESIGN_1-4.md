# UMBRAL — REDESIGN, MISSIONS 1–4 (Level indices 0–3) — THE TEACHING ARC

*Written design spec. No code. Applies the same verb-grammar / four-beat
(kishōtenketsu) method used in `REDESIGN_5-8.md` to the FRONT HALF of the
campaign — the levels that teach the base vocabulary one word at a time, so that
by Mission 5 **CLIMB** is genuinely the one new word. A builder should be able to
grey-box **and dress** each level from this document without a follow-up
question. All invented values are flagged **(tune)**. Studio rule: no emojis.*

---

## Method recap (read `REDESIGN_5-8.md` §"Method recap" first)

**The sentence.** Umbral's core clause, spoken over and over with different words
filled in:

> READ the light (OBSERVE/LISTEN) → become invisible (HIDE in shadow) → travel on
> a floor that won't betray you (SNEAK on moss / BLINK across crystal) → bend the
> situation (DOUSE / LURE / DEVOUR) → take the relic → outrun the beacon.

Missions 1–4 are where every one of those words is first *learned*. 5–8 assume
all of them and add only CLIMB, SUN, RELIEVE. **This document's job is to make
that assumption true** — cleanly, one word at a time, with no word arriving
before the level that owns it.

**Escalation is by CONJUGATION, not addition.** After the primer level (M1), each
level teaches **at most one new word** and then re-uses every old word in a new
grammatical position.

**Notation.** Each encounter is parsed as:

`OBSTACLE(config) → intended: VERB+VERB | alt: VERB+VERB ; counter: NAMED-PRESSURE`

Anything vestigial, incoherent, or teaching nothing is marked `NOISE(...)` — a
finding, not a feature.

**Palette law (canon, on-screen).** Amber / orange / red = the Candent Vigil
(calm amber → suspect orange → hunting red). **VIOLET belongs only to Hush** — its
eyes, its blink, its void-vials' teal-violet glow, the rim of the void it crawled
from. Any violet on a Vigil structure is a bug (see the M4 defect list). Wall text
uses `kit.inscription`, sparingly; the world's story is told mostly by *how the
props are arranged*, not by text.

**Two voices only (canon).** Hush's half-memory fragments ("You remember being
larger.") and found Vigil liturgy ("KEEP THE FIRES FED"). Nothing else speaks.

---

## THE VERTICALITY EMBARGO (the single most important consistency rule for 1–4)

**Missions 1–4 are deliberately FLAT.** No `kit.platform`, no `kit.ramp`, no
tiers, no rooftops, no sunken beds. Every guard, every prop, every hide-zone sits
on ground `y = 0`. This is not an oversight — it is the setup for the entire back
half. Mission 5's whole thesis ("the safest road is the one *over* their heads")
only lands if the player has spent four levels thinking in two dimensions. If a
1–4 room seems to *want* a ledge, the answer is a shadow lane or a cover
composition, never a tier.

The one thing that looks vertical but is not: **the M4 west-breach `hole`** — a
void gap you BLINK across. That is a horizontal traversal puzzle (blink range),
not a height change, and it is exactly the seed Mission 5's sunken-canal TEN pays
off. Keep it.

---

## CAMPAIGN ARC (one page) — the teaching half

| # | Level (idx) | Focus word | The ONE new word | Time / in–out | Verticality | One-sentence fantasy |
|---|---|---|---|---|---|---|
| 1 | THE ASHWAY (0) | **the primer** — shadow, sound, step | *(the base set: HIDE, SNEAK, LISTEN, BLINK)* | **Night**, indoor service run | **Flat (embargo)** | *You wake in the heap of dead lamps, learn you are invisible in the dark, that hard floors betray you, and that you can step through a place instead of across it.* |
| 2 | THE LAMPWAY (1) | **DOUSE** — light is a switch you can throw | **DOUSE** | **Night**, indoor lamplighters' route | **Flat** | *A lamp is a wound you can close: shatter it and the light it kept is gone — but the breaking is its own small thunder.* |
| 3 | THE GORGE (2) | **DEVOUR** — the guard is food | **DEVOUR / ENGULF** | **Night**, indoor feeding-cut | **Flat** | *Your hunger has a use: take a watcher from behind and it is simply gone, and you are a little more yourself — but one Eye you can never eat.* |
| 4 | BRIGHTWARD (3) | **LURE** — noise is a tool, not only a danger | **LURE** | **Day** (first daylight), outdoor citadel | **Flat (the fork is left/right, not up)** | *In full sun there is no dark to hide in — only the strips behind tall things, and the guard you can throw a sound to send the wrong way.* |

**Why this order of words.**
- **M1 is the primer** and the *only* level allowed more than one new word,
  because it teaches the game's nouns (shadow = invisibility; moss = silent,
  crystal = loud) and its three most basic verbs. Each gets its own beat.
- **DOUSE (M2)** first among the "bend the situation" verbs, because it is the
  most literal: a lamp is an object, dousing it deletes a light-zone. It also
  plants the seed the arc will harvest — *the shatter makes noise, and noise
  calls watchers.* That hazard becomes M4's tool.
- **DEVOUR (M3)** second, because it requires the player to already read guard
  facing and noise (M1) and to already value scarce hide-zones (so removing a
  guard *feels* like power). Its cost — you grow bigger and brighter — is planted
  here and billed in Mission 7.
- **LURE (M4)** last, in the consolidation level, because it is not a new verb so
  much as a **re-reading of the M2 vial-throw**: the same thrown vial that
  *shattered a lamp* now *makes a noise on purpose to move a guard.* Teaching it
  last lets M4 spend the whole known sentence and still have one fresh word.

**The vial through-line (a deliberate put-it-down / pick-it-up).** M2 grants **3
vials** (DOUSE). M3 grants **0** (pure DEVOUR — the player sets the tool down to
learn a different one). M4 grants **2** and hands the vial back conjugated as
LURE. By Mission 5 the player owns the whole grammar and the game can start
bending it.

**The night→day handoff to 5–8.** M1–M3 are night (ambient dark is free
concealment). M4 is the first daylight — "Brightward," toward the light — where
concealment becomes a scarce, directional resource. That is the exact read
Mission 6 (noon) escalates and Mission 8 (dusk) animates. M4 does the gentle
version: a low sun, long hard shadow strips, and a DOUSE that already barely
bites the sky — the first whisper of "your favourite verb stops working," which
is the whole spine of the back half.

---

## What each level must have TEACHING-taught by its end (builder's contract)

| By end of… | The player reliably knows… |
|---|---|
| M1 THE ASHWAY | HIDE (shadow = unseen); SNEAK on moss (silent) vs the ring of crystal (loud) = LISTEN/noise-floor; BLINK/shadowstep over a floor you cannot walk; OBSERVE + WAIT a cone's sweep; that FOG = an impassable wall. |
| M2 THE LAMPWAY | DOUSE (shatter a lamp, delete its pool); that a **Vesper** trusts its light and a **Snuffed** is blind and hunts by sound; that the shatter is *noise* and noise is dangerous near the Snuffed. |
| M3 THE GORGE | DEVOUR (feed on a mote → strike a Vesper's blind rear arc → it is gone, no body, you grow); that the Snuffed cannot be eaten and hears the lunge; that the **Pharos** is an Eye you can neither douse nor devour, only out-time. |
| M4 BRIGHTWARD | LURE (throw a vial to send a guard toward the sound); how to read a **directional sun** (open = lit = exposed, the long strip behind a tall thing = shade = safe); and how to speak the whole sentence at once under a beacon-flight. |

---
---

# MISSION 1 — THE ASHWAY  (level index 0)

*Focus: the primer. Time: night, indoor. New words: HIDE, SNEAK, LISTEN, BLINK
(one per beat). Verticality: none (embargo). Relic (lore): the **Wickstone**.*

## 1.1 Diagnosis of the current level

**Current room parse** (from `src/levels/tutorial.js`), west→east along +x:

- **START** `(x−32..−24, z6..14, moss)` → intended: SNEAK+HIDE (spawn sits in
  shade) | alt: WAIT ; counter: *none (a breather).* **KEPT strength** — a safe
  threshold.
- **PATH + FOG DEAD-END** `(x−48..−8, z0..3, moss; fog wall at x−34; a dressed
  vista beyond)` → teaches `FOG = impassable`. Environmental win, but the fog
  rule is a *barrier grammar*, not one of the core sentence verbs. **KEPT.**
- **SOUND ROOM** `(x−8..10, z−9..12; crystal centre sings, moss border, 2 towers,
  1 slow Vesper looping (1,−5)→(1,8))` → intended: SNEAK(moss edge)+HIDE(off the
  tower pools)+WAIT | alt: creep the crystal when the gaze turns ; counter: *the
  singing centre + the towers.* **KEPT strength.**
- **BLINK ROOM** `(x16..34, z−9..12; moss/crystal/moss/crystal/moss bands; 2
  Vespers sweeping opposite (19,−7)↔(19,10) and (31,10)↔(31,−7))` → intended:
  BLINK the resonant bands | alt: none really ; counter: *two counter-sweeping
  cones.* **KEPT strength** — the mechanical peak.
- **EXIT ALCOVE** `(x34..38, z0..3, rift at (36,1.5))` → walk into the rift.

**Defects found (location · severity):**

1. **The four verbs are taught, but not as four clean BEATS** · *whole level* ·
   **Med.** HIDE and LISTEN are currently fused into one prompt in the SOUND room
   ("the towers expose you; moss is silent"). The brief wants each fundamental met
   in its own beat. The rooms already exist to support this; only the *framing*
   and one prompt-split are needed.
2. **No real TEN** · *whole level* · **Med.** The level is a rising list (learn,
   learn, learn, exit). The BLINK room can be recontextualised into a true Turn
   (see §1.2) instead of just being "the third new thing."
3. **No relic, so no Beat-1 lore payoff** · *EXIT* · **Med.** LORE Beat 1 is
   explicit: Hush swallows the **Wickstone** and gets its first flash of memory
   (the black tide, the men with hooks of light). The level currently ends at a
   bare rift — the single most important story beat of the opening is missing.
4. **Dressing is hand-placed, not composed** · *whole level* · **Low/Med.** Every
   prop is an individual `kit.crate(...)` call. The new placement system
   (`cluster`/`focal`/`flank`/`wallRun`/`leadingLine`) exists precisely so these
   heaps read as *purposeful* — a dumped-lamp midden, a shrine, a barred vista —
   rather than as scattered furniture. The layout is good; the *composition
   grammar* is unused.
5. **The ash-pit identity is under-sold** · *START + PATH* · **Med.** LORE: Hush
   wakes "in the ash-pits where the Vigil dumps snuffed and broken lamps." The
   current start has a few dead lanterns but does not *read* as a discard heap —
   the place where broken lamps (pieces of Hush's own kin) are thrown away.

## 1.2 Design statement

*Teach the four nouns-and-verbs of the whole game as four clean beats, and let
the last one turn.* KI = you are invisible in the dark (HIDE) and hard floors
betray you (SNEAK/LISTEN, gently). SHŌ = the sound floor proper (LISTEN, with the
towers teaching HIDE-from-light). TEN = the BLINK room, and here is the Turn:
for two rooms the player has been taught **"the singing crystal is the floor you
must not step on."** The blink room removes the option to go *around* the crystal
(bands wall the path), and hands the player a verb that makes the forbidden floor
*the floor you cross* — silently, over the top, mid-leap. **The thing you were
taught to fear becomes the thing you travel on.** That is a real
recontextualisation of the noise-floor, not just a harder room. KETSU = swallow
the Wickstone (NEW), take the first flash of memory, step into the rift.

Night is total and free — this is the only level where ambient dark alone hides
you everywhere, on purpose. Every later level makes concealment cost something
(a lamp to douse, a shade to occupy, a beacon on your back). Here it is a gift,
so the player learns what invisibility *feels* like before it is taken away.

## 1.3 Encounter spec (4 beats)

Coordinate convention: **+x = east (toward the rift)**, **−x = west (the fog)**,
**+z = "back"/north**, movement runs west→east. Footprints KEPT from the shipped
level unless marked.

---

### E1 · KI — "WAKING IN THE ASH"  [MODIFIED — from START + PATH]

- **Sentence:** `DISCARD-HEAP(a lightless moss threshold; one barred vista west;
  a long silent lane east) → intended: HIDE(just be in the dark)+SNEAK(east on
  moss) | alt: OBSERVE the vista, WAIT ; counter: THE MIST (the way west is shut).`
- **Room:** START `x−32..−24 · z6..14` (8 m × 8 m) + the reachable PATH stretch
  `x−34..−8 · z0..3`. Indoor, **night**, moss (silent) throughout. Spawn `(−28,
  10)` sits in full shadow. No guard. The KEPT fog wall at `(−34, 1.5)` bars the
  west; the KEPT dressed vista beyond it is visible but unreachable.
- **Light/shadow:** near-total dark; a single faint moon fill. Everything is a
  hide-zone — the point of the beat.
- **Teach:** movement + "in shadow you are unseen." HUD (Hush): KEPT *"In shadow
  you are unseen — swift and silent."* Then, at the fog: KEPT *"…the way is
  shut."* First lesson that **FOG = wall.**
- **Tools:** none (0 vials, no blink yet granted in this beat — blink is E3's
  grant; **tune** whether blink is available from spawn or unlocked at the blink
  room; recommend unlocked at E3 so the TEN owns it).

**Environmental storytelling — "the lamp-midden."** This is where the Vigil dumps
snuffed and broken lamps, and Hush is the one discard that did not fully die
(LORE Beat 1). The arrangement must *say* "trash heap of dead light" with no
text: a **cart** that hauled the dead lamps, tipped by the wall; a **cluster** of
**deadLanterns** tangled with **rubble** and a **brokenColumn** — the pile Hush
crawls out of. The KEPT vista beyond the fog says the opposite: intact Vigil
grandeur (a robed **statue**, standing columns, a full cart) — *the citadel proper
goes on without you; you are in its back-of-house.* The contrast (dead lamps here
/ living order there) is the whole opening image.

**Asset / placement plan (E1):**
- Keep-clear once: `clear = [ {x:−28,z:10,r:2.4} /*spawn*/,
  {x0:−29,z0:3,x1:−27,z1:14, pad:0.4} /*the start-corridor lane*/,
  {x0:−34,z0:0,x1:−8,z1:3, pad:0.3} /*the east walking lane*/ ]`.
- **The heap Hush wakes from** — `kit.cluster(−30.5, 8.4, [{prop:"deadLantern",
  w:3}, {prop:"rubble", w:2}, "brokenColumn"], { count:5, footprint:1.3,
  backDir: <toward NW corner ≈ atan2(−1,1)>, clear })`. Tall broken column to the
  back, dead lanterns spilling toward the front/spawn — a still-life that reads
  "dumped." (Dead lanterns are pure decor, no colliders; the column gives one
  cover cylinder — fine, it is off the spawn disc.)
- **The dumping cart**, tipped against the south wall: `kit.cart(−25.4, 7.2,
  {rot: 2.5, seed:2})` — angled as if shoved and abandoned.
- **The barred vista** (west of the fog, x−48..−34): compose it as one framed
  picture with `kit.focal(−42, 1.5, { landmark:"statue", landmarkOpts:{h:3.0,
  rot:0.4}, flankProp:"brokenColumn", flankGap:2.6, scatterProp:"rubble",
  scatterCount:3, clear:[] })`, plus a KEPT `cart` and `deadLantern` at the far
  wall so the eye reads depth through the mist. Why `focal`: symmetry + a central
  landmark instantly reads "a real place, on purpose," which sells the "world
  going on beyond your reach."
- **The lane east** (the discard route): `kit.leadingLine(−34, 1.5, −9, 1.5,
  [{prop:"urn", w:2}, "deadLantern"], { spacing:5.5, offset:1.15, face:"in",
  clear })` — a sparse, rhythmic file of spent urns and dead lanterns that funnels
  the eye (and the player) toward the SOUND room door at `(0..3)`. Why
  `leadingLine`: the level is a corridor; a gentle two-sided funnel says "this
  way" without a marker, and the props themselves (more dead lamps) keep telling
  the midden story down the whole hall.

---

### E2 · SHŌ — "THE SOUND FLOOR"  [MODIFIED — from SOUND ROOM]

- **Sentence:** `LIT-SINGING-FLOOR(a loud crystal centre lit by two towers; a
  silent dark moss border; 1 slow Vesper on the centre) → intended: SNEAK(moss
  border)+HIDE(off the tower pools)+WAIT(the gaze) | alt: creep the crystal when
  the cone turns away ; counter: THE TOWERS + THE SINGING SQUARE.`
- **Room:** SOUND `x−8..10 · z−9..12` (18 m × 21 m), indoor night. **Noise-floor:
  crystal centre** `x−5.5..7.5 · z−6.5..9.5` (loud — your footfalls ring and draw
  the Vesper), **moss border** on all four sides (silent). KEPT.
- **Light/shadow:** two KEPT towers — a **great lantern** at `(1, 7)` (intensity
  10, range 9) and a **lesser** at `(1, −2)` (intensity 6, range 7) — throw two
  overlapping amber pools across the crystal. The moss border is unlit = hide.
- **Guards:** one, KEPT:
  | id | path (x,z) | speed | pause | range | cone |
  |----|-----------|-------|-------|-------|------|
  | V-sound | `[(1,−5),(1,8)]` | 1.0 | 1.8 s | 8 m | 0.62 |
- **The two lessons, now split into their own beat (fixes Defect 1):** this beat
  owns **LISTEN** (the crystal rings; moss is silent) and **HIDE-from-light** (the
  towers are the only thing that can expose you in an otherwise dark room). Split
  the KEPT combined prompt into two: on entry, LISTEN (the ripple + the Vesper
  turning to it); on nearing a tower pool, HIDE (light exposes even here).
- **Tools:** none.

**Environmental storytelling — "the testing floor."** The Vigil brings rendered
dark here to hear it "sing" — the crystal is a resonance floor, and the two
towers are working lanterns kept lit at all hours (KEEP THE FIRES FED). The two
towers are little **shrines**: the Vigil tends them, flanks them with offering
urns, hangs a banner. This says the enemy is *pious*, not merely armed — the
horror the lore wants is that their cruelty is worship. It also does gameplay
work: the flanked urns visually *mark the pools as danger* (bright, tended,
central) versus the neglected dark edges (safe).

**Asset / placement plan (E2):**
- `clear = [ {x0:−1.5,z0:9.5,x1:1.5,z1:12} /*N door lane*/,
  {x0:−1.5,z0:−9,x1:1.5,z1:−6.5} /*S? (edges)*/,
  {x0:0,z0:−9,x1:2,z1:12, pad:0.4} /*the Vesper's line x≈1*/,
  {x0:−5.5,z0:−6.5,x1:7.5,z1:9.5, pad:0.2} /*keep the crystal itself clear so it
  reads as open, loud floor*/ ]`.
- **Tower shrines (mark the danger):** two `kit.flank` pairs of offering urns
  around each tower base, facing in — `kit.flank(1, 7, "urn", {gap:1.7,
  face:"in", clear})` and `kit.flank(1, −2, {prop:"urn", opts:{scale:0.85}},
  {gap:1.6, face:"in", clear})`. (Both towers sit on the Vesper's x≈1 line, so
  the urns land just off it to either side — deliberately *not* on the patrol
  lane.) Why `flank`: a mirrored pair reads "an altar" at a glance; it frames the
  pool as sacred/lit = "do not stand here."
- **The safe dark edges (reward the long way round):** cover only on the silent
  moss border, via two `kit.corner` piles — `kit.corner(room, "sw",
  [{prop:"crateStack",w:2,foot:0.8}, "barrel", "sack"], {count:4, clear})` and
  `kit.corner(room, "ne", ["brokenColumn", {prop:"rubble",w:2}], {count:3,
  clear})`. Why corners: they brace the walls (tall to the back), leave the
  centre open, and give the ghost real hiding geometry exactly where the level
  wants them to walk.
- **One KEPT banner** high on the north wall in Vigil amber (recolour any blue
  banner toward `0xffb46a`/`0x243a5c` is acceptable as cold night-cloth; prefer a
  single amber banner over the pool to reinforce "tended").

---

### E3 · TEN — "THE RESONANCE GAP"  [MODIFIED — from BLINK ROOM]

**The Turn. For two rooms crystal has meant "the floor you must not touch." Here
the path is *made of* crystal, and a new verb makes the forbidden floor the floor
you cross.**

- **Sentence:** `RESONANT-BANDS(two loud crystal bands walling the path, a silent
  moss island between; 2 Vespers sweeping opposite) → intended: BLINK(over each
  crystal band, landing silent on moss)+WAIT | alt: OBSERVE the two counter-sweeps
  and time a creep across a band when both cones point away (harder, loud) ;
  counter: THE COUNTER-SWEEP (a cone always arriving from one side).`
- **Room:** BLINK `x16..34 · z−9..12` (18 m × 21 m), indoor night. **Bands
  (KEPT):** moss `16..21` / crystal `21..24` / **moss island `24..27`** / crystal
  `27..30` / moss `30..34`. The two crystal bands are the "gap" you cannot walk
  quietly; the central moss island is the safe stepping-stone between blinks.
- **Guards:** two, KEPT, sweeping in opposition so a cone is always inbound:
  | id | path (x,z) | speed | pause | range | cone | starts |
  |----|-----------|-------|-------|-------|------|--------|
  | V-w | `[(19,−7),(19,10)]` | 1.1 | 1.0 s | 8 | 0.62 | +z |
  | V-e | `[(31,10),(31,−7)]` | 1.1 | 1.0 s | 8 | 0.62 | −z |
- **The bend, spelled out:** the player's trained instinct is "find the moss,
  avoid the crystal." Here the crystal bands *are* the walls of the corridor —
  there is no moss detour around them. The only silent way across a ringing floor
  is to not touch it: BLINK from moss, over the band, onto the next moss. The
  verb the level hands you re-labels crystal from "hazard to avoid" to "gap to
  leap." **Same noun, opposite meaning.** BLINK range must be **exactly enough**
  to clear one 3 m band from a moss lip with margin — **blink range ≈ 4.5–5 m
  (tune)** against a 3 m band; verify the land zone is the moss island, not the
  next crystal.
- **Tools:** BLINK granted here (the level's one traversal grant). HUD (KEPT,
  touch/desktop split): "*Two resonant bands… Shadowstep over the loud floor in
  silence — aim and press SPACE…*"

**Environmental storytelling — "where the dark is made to sing."** These bands are
where the Vigil listens to rendered dark resonate — a test-rig of tuned crystal.
The **moss island** in the middle is the one dead spot in the resonance, and the
level puts a small **landmark** there to make it read as a destination you *aim
your blink at*. The braziers in the back corners are unlit (the Vigil does not
waste flame on the far dark) — dead cold tripods, reinforcing that light is
rationed and precious to them.

**Asset / placement plan (E3):**
- `clear = [ {x0:16,z0:0,x1:34,z1:3, pad:0.4} /*the z0..3 landing lane the blinks
  cross into*/, {x0:18,z0:−9,x1:20,z1:12, pad:0.4} /*V-w line x≈19*/,
  {x0:30,z0:−9,x1:32,z1:12, pad:0.4} /*V-e line x≈31*/ ]`.
- **Blink-target landmark on the moss island:** `kit.statue(25.5, 10.2, {scale:
  1.0, h:2.7, seed:41})` (KEPT position) — a tall silhouette on the island so the
  player instinctively blinks *toward* a thing, not into a void. Optionally frame
  it: `kit.flank(25.5, 8.5, {prop:"urn",opts:{scale:0.8}}, {gap:1.2, dir:Math.PI/2,
  clear})` so the island reads as a small stage.
- **Cold unlit braziers** in the two back corners (KEPT `brazier(17.4,10.6)` and
  `brazier(32.6,−7.6)`, both `{lit:false}`) — decor that says "flame is rationed."
- **Rubble** at the near crystal lip `kit.rubble(25.5, −7.2, {radius:0.9})`
  (KEPT) — a low marker of where a band begins.
- Keep the bands themselves *clear of cover* — a crystal band with a crate on it
  would read as walkable/coverable and muddy the "leap this" message.

---

### E4 · KETSU — "THE WICKSTONE"  [NEW — replaces the bare rift]

Fixes Defect 3: the opening's lore beat exists on-screen.

- **Sentence:** `RELIC-THRESHOLD(a dead-lantern gate; the Wickstone on a low
  plinth; the rift beyond) → intended: take the Wickstone (memory flash) + step
  into the rift ; counter: none — the exhale.`
- **Room:** EXIT alcove `x34..38 · z0..3` (KEPT), moss, dark, no guard. Add a low
  plinth just before the rift.
- **The beat:** the player takes the **Wickstone** (their first relic) and gets
  the LORE flash — a vast black tide, men with hooks of light. This is the whole
  reason Mission 1 exists in the story; it must be felt, not skipped. Then the
  KEPT rift.
- **Tools/logic:** reuse `kit.scepterPedestal` for the plinth (recolour the relic
  glow amber `0xffd76a` as elsewhere — the Wickstone is stolen Vigil light) OR a
  simpler `kit.trigger` that fires the memory HUD and lights the rift. No alarm
  here — M1 is too early for the beacon-flight; that mechanic debuts in M2. HUD
  (Hush): *"You remember… a black tide, and men with hooks of light."* (Draw the
  exact line from LORE Beat 1.)

**Environmental storytelling — "the gate of dead lamps."** Two KEPT `deadLantern`
fixtures flank the rift like a threshold arch (`deadLantern(35.0, 0.35)` and
`(35.0, 2.65)` — KEPT). Now they mean something: the doorway out of the discard
heap is framed by two of the very dead lamps Hush was thrown away among — you
leave the graveyard through its own gate. Add a single `kit.inscription` on the
alcove's east cap in Vigil amber, e.g. *"THE ASH REMEMBERS WHAT THE FLAME
FORGOT"* (a new liturgy line in the Vigil voice, `#ffb46a`) — one text beat,
earned, at the exit.

## 1.4 Pacing map

```
E1 KI    ·  breath   (wake, wander, learn HIDE)      [·]
E2 SHŌ   ·  TENSION  (the sound floor, LISTEN+HIDE)  [!!]
E3 TEN   ·  spike    (blink the gap — the Turn)      [!!]
E4 KETSU ·  breath   (Wickstone, memory, rift)       [·]
```
A clean four-beat: two breathers bracket a two-room rise; the TEN is a mechanical
spike, not a threat spike (only two slow Vespers) — right for a primer.

## 1.5 Playtest predictions

- **Ghost (no touch):** E1 walks the dark lane, reads the vista, hits the fog and
  turns back → E2 hugs the moss border, waits the single slow cone, never lit →
  E3 blinks band-to-island-to-band, timing the counter-sweep → E4 takes the
  Wickstone. Fully solvable, zero risk if patient. *Risk:* if the two E3 cones are
  phased so a cone is *always* on the island, the ghost has no landing window —
  **verify the counter-sweep leaves the island dark ~1.5 s per cycle (tune)**.
- **Distraction:** nothing to distract with yet (0 vials) — correct for the
  primer; the player has no "bend" verb, only HIDE/SNEAK/BLINK. This is the level
  that proves the base sentence is complete on its own.
- **Aggressive:** no devour, no maw motes — also correct. M1 gives the player no
  way to remove a guard, so they *must* learn avoidance first. Aggression debuts
  in M3.

## 1.6 Change log

- [KEPT] All five room footprints; the fog wall + vista; the SOUND-room towers,
  crystal/moss layout, and single Vesper; the BLINK-room bands and two
  counter-sweeping Vespers; the exit alcove + rift + flanking dead lanterns; the
  moon/fill lighting; checkpoints.
- [MODIFIED] Beat framing (four clean beats); the SOUND-room prompt split into a
  LISTEN beat and a HIDE beat; the BLINK room reframed as the TEN (crystal =
  "leap it," not "avoid it"); all dressing re-authored through the placement
  helpers (cluster/focal/flank/corner/leadingLine) to read as a *lamp-midden*, a
  *barred vista*, *tower shrines*, and a *resonance rig*.
- [NEW] E4 the **Wickstone** relic + first memory flash (LORE Beat 1 payoff); one
  earned inscription at the exit.
- [CUT] Nothing structural. (No `fogPatch` in this file to remove.)

---
---

# MISSION 2 — THE LAMPWAY  (level index 1)

*Focus word: DOUSE. Time: night, indoor. New word: DOUSE. Enemy types: 2 (Vesper
+ Snuffed). Verticality: none (embargo). Vials: 3.*

## 2.1 Diagnosis of the current level

**Current room parse** (from `src/levels/dousing.js`), west→east:

- **A START HALL** `(x−40..−32, moss)` → breather; 3 vials granted. **KEPT.**
- **B CHOKE** `(x−28..−14, moss; torch (−15,0); 1 Vesper (−15,±4))` → intended:
  DOUSE(the door torch)+SNEAK | alt: WAIT the cone then slip ; counter: *a lit,
  watched door.* The DOUSE tutorial proper. **KEPT strength.**
- **C HUB (fork)** `(x−10..10, moss; torch (0,0); forks east: upper z3..7 / lower
  z−7..−3)` → intended: OBSERVE+choose | counter: *the choice itself.* **KEPT.**
- **U SNUFFED CORRIDOR (upper)** `(x10..24, z3..7; blind Snuffed (13..21,5);
  cache)` → intended: LISTEN+SNEAK(silent) | alt: none — do NOT throw here ;
  counter: *the sound-hunter.* **KEPT strength.**
- **L LIT CORRIDOR (lower)** `(x10..24, z−7..−3; torch (17,−5); Vesper (13..21,−5))`
  → intended: DOUSE+SNEAK | alt: WAIT ; counter: *a hall lit end to end.* **KEPT.**
- **F STAGING** `(x24..34; great lantern (29,4) ambience; cache)` → rejoin.
  **KEPT.**
- **G RELIC CHAMBER** `(x38..54, crystal; GREAT lantern (44,0) range 11; Vesper
  (44,±5); pedestal (50,0))` → intended: DOUSE(great lantern)+SNEAK+take |
  counter: *the guarded, over-lit vault.* **KEPT strength.**
- **H EXTRACTION** `(x58..66, moss; Vesper (60,±4); rift (62,0))` → escape.

**Defects found (location · severity):**

1. **The relic chamber is a bigger CHOKE, not a TEN** · *G* · **Med.** It is the
   third "douse a torch and pass" in a row. A teaching level's climax should
   *recontextualise* DOUSE, not just enlarge it (see §2.2).
2. **DOUSE-as-hazard is stated but never mechanically bitten** · *B → U* · **Low/
   Med.** The prompts say "the shatter is thunder, it can call a watcher," and the
   Snuffed corridor says "do not spend a vial near it" — but nothing forces the
   player to *feel* the shatter cost. The arc needs this hazard to land, because
   M4's LURE is its payoff.
3. **Two idle Vespers on the tail** · *F ambience + H* · **Low.** The staging
   great-lantern's role is pure ambience and the extraction Vesper `(60,±4)` is a
   speed-bump. Fine as pacing, but the STAGING is a candidate to carry the DOUSE-
   hazard lesson (Defect 2) rather than just being a refill room.
4. **Dressing is bare `kit.solid` blocks** · *whole level* · **Med.** Every cover
   piece is a grey box (`kit.solid(1.7,1.3,1.7,...)`). This is a *lamplighters'
   service route* — it should be dense with the trade's stuff (oil barrels, lamp
   crates, offering braziers), composed, not boxed. The prop + placement systems
   are entirely unused here.
5. **The two throats look identical** · *HUB fork* · **Med.** The player is told
   in text which fork is the Snuffed and which is lit, but the two corridors are
   dressed the same. Environmental storytelling should make the *neglected dark*
   throat and the *over-tended lit* throat legible before the prompt.

## 2.2 Design statement

*Teach DOUSE as "delete a light," then turn it into "spend your own noise."* KI:
DOUSE is a switch — shatter the door-lamp, the pool is gone, walk through the
dark it leaves (the pure, clean version). SHŌ: the fork conjugates DOUSE by
*where it is legal* — south you SHOULD douse (a Vesper who trusts its torch), north
you must NOT (a Snuffed who hears the shatter). Same verb, two opposite verdicts,
chosen by reading the enemy. TEN (the relic chamber, reframed): the great
lantern's pool is too wide to sneak around — you *must* douse it — but the shatter
is loud and the relic-guard is right there. **The tool that saves you is the same
act that betrays you.** You cannot avoid the noise; you can only *time* it, doused
the instant the guard's back is turned. This is the exact hazard M4 will hand
back as a *tool* (LURE) — here it is first felt as an unavoidable cost.

## 2.3 Encounter spec (5 beats)

Coordinate convention: **+x = east (toward the rift)**, west→east.

---

### E1 · KI — "THE FIRST DARK YOU MAKE"  [MODIFIED — from A START + B CHOKE]

- **Sentence:** `LIT-DOOR(one torch pinning a doorway; one Vesper watching it) →
  intended: DOUSE(the torch)+SNEAK | alt: WAIT the cone's turn then slip lit-but-
  uncones ; counter: THE WATCHED THRESHOLD.`
- **Room:** START HALL `x−40..−32` (breather, 3 vials) + CHOKE `x−28..−14 · z−9..9`
  (14 m × 18 m), moss, night. One KEPT torch at `(−15, 0)` (intensity 7, range 9)
  lights the east door.
- **Guards:** one, KEPT:
  | id | path (x,z) | speed | pause | range | cone |
  |----|-----------|-------|-------|-------|------|
  | V-choke | `[(−15,−4),(−15,4)]` | 1.1 | 1.4 s | 8 | 0.62 |
- **Teach:** the clean DOUSE. Grab the KEPT `capB (−25, 4)` vials *before* the
  lit door (the cache is deliberately on the near side — you arm, then meet the
  light). HUD (KEPT): "*…hurl a vial and shatter the flame — the dark it leaves
  will hide you. But breaking glass is its own small thunder…*" The hazard is
  **named** here but not yet bitten.
- **Tools:** 3 vials.

**Environmental storytelling — "the lamplighters' staging."** This is the service
route where the Vigil's lamp-tenders arm themselves each dusk — so the start hall
is a supply depot: **oil barrels**, crates of spare wicks, sacks. The clean
message: *these people maintain the light as a job.* The lit door in the choke
room is a small tended threshold — a **brazier** or offering **urn** to either
side, an amber banner over it — so "lit = watched = theirs" reads instantly.

**Asset / placement plan (E1):**
- START HALL `clear=[{x:−37,z:−1,r:2.2}/*spawn*/, {x0:−32,z0:−1.5,x1:−28,z1:1.5,
  pad:0.4}/*east door lane*/]`. Supply wall:
  `kit.wallRunSide({x0:−40,z0:−4,x1:−32,z1:4}, "n", [{prop:"barrel",w:2},
  {prop:"crate",w:1}, "sack"], {spacing:1.4, inset:0.7, clear})` — a rhythmic run
  of oil barrels + lamp crates along the back wall. Why `wallRun`: even spacing +
  wall-alignment reads "stores," not "clutter."
- CHOKE `clear=[{x0:−15,z0:−4,x1:−15,z1:4,pad:0.6}/*Vesper line*/,
  {x0:−14,z0:−1.5,x1:−10,z1:1.5,pad:0.4}/*east door lane*/,
  {x:−25,z:4,r:1.2}/*capB cache*/]`. Flank the lit door with an offering pair:
  `kit.flank(−14, 0, {prop:"brazier",opts:{lit:false}}, {gap:1.3, dir:Math.PI/2,
  face:"in", clear})` (the door faces ±z at the east wall), and one KEPT-style
  cover crate NW of the torch replaced by `kit.crateStack(−23, −5, {seed:3})`
  (KEPT position, now a composed pile). One amber `kit.inscription` KEPT: "*THE
  LAMPS REMEMBER EVERY HAND THAT FED THEM*" (`#ffb46a`).

---

### E2 · SHŌ — "THE FORK: WHERE THE DARK IS SAFE"  [MODIFIED — from C HUB + U/L]

- **Sentence:** `TWO-THROATS(north = lightless, a blind Snuffed listening; south =
  lit end-to-end, a Vesper trusting its torch) → intended (north): LISTEN+SNEAK,
  never DOUSE | intended (south): DOUSE+SNEAK ; alt: either throat is a full
  solution ; counter: THE SOUND-HUNTER (north) / THE LIT HALL (south).`
- **Room:** HUB `x−10..10 · z−10..10` (breather fork, KEPT small torch (0,0)) →
  two KEPT corridors: **U upper** `x10..24 · z3..7` (dark, Snuffed) and **L lower**
  `x10..24 · z−7..−3` (lit, Vesper + torch (17,−5)).
- **Guards:** two, KEPT — the level's whole enemy roster (2 types):
  | id | type | path (x,z) | speed | pause | range | notes |
  |----|------|-----------|-------|-------|-------|-------|
  | V-lit | Vesper | `[(13,−5),(21,−5)]` | 1.2 | 1.3 | 8 | trusts torch (17,−5) |
  | S-up | **Snuffed** | `[(13,5),(21,5)]` | 1.0 | 2.0 | (blind) | hunts by sound |
- **The conjugation:** the fork is the whole DOUSE lesson turned into a *question*:
  the verb is only correct where the enemy sees by light. North, DOUSE is worse
  than useless — the shatter is exactly what the Snuffed listens for (Defect 2's
  first real bite: a player who reflexively douses in the dark corridor draws the
  Snuffed onto themselves). South, DOUSE is the clean answer. **Reading the enemy
  type decides the verb.**
- **Tools:** KEPT caches `capU (17,5)` (a quiet find in the dark — no light to
  spend on, the game *not* rewarding vials where they are dangerous) and later
  `capF`.

**Environmental storytelling — "the tended hall and the forgotten one."** The two
throats must look like what they are *before* the text says so. **South (lit):**
well-kept — offering **braziers**, an amber **banner**, urns at the torch base;
the Vigil's maintained corridor. **North (dark):** abandoned — **deadLanterns**,
hanging **chains**, **rubble**, a collapsed **brokenColumn**; the passage the
lamplighters stopped tending, where the blind thing was left to wander. The
contrast *is* the tell: bright-and-cared-for vs dark-and-derelict.

**Asset / placement plan (E2):**
- HUB `clear=[{x0:−1.5,z0:−10,x1:1.5,z1:10,pad:0.4}/*through-lane*/,
  {x0:3,z0:3,x1:7,z1:7}/*upper door*/, {x0:3,z0:−7,x1:7,z1:−3}/*lower door*/,
  {x:0,z:0,r:1.6}/*torch+centre*/]`. Keep KEPT hub pillar (−6,−7) and two cover
  blocks (replace the two `kit.solid` blocks with `kit.cluster(−5,6,["crateStack",
  "barrel"],{count:3,clear})` and `kit.cluster(5,−6,["sack",{prop:"crate",w:2}],
  {count:3,clear})`).
- **South throat (lit):** `kit.wallRun(11, −6.4, 23, −6.4, [{prop:"brazier",
  opts:{lit:false},w:2}, "urn"], {spacing:3.2, inset:0.4, clear:[{x0:13,z0:−5,
  x1:21,z1:−5,pad:0.6}]})` + one amber banner high on the south wall. KEPT
  inscription "*IT DOES NOT SEE. IT LISTENS.*" (`#7a6bb0`) belongs on the NORTH
  throat (it describes the Snuffed) — move/confirm it there.
- **North throat (dark):** `kit.wallRun(11, 6.6, 23, 6.6, [{prop:"deadLantern",
  w:3}, "rubble", "brokenColumn"], {spacing:2.8, inset:0.3, clear:[{x0:13,z0:5,
  x1:21,z1:5,pad:0.6}/*Snuffed line*/, {x:17,z:5,r:1.0}/*capU*/]})` + a couple of
  `kit.chains(x, z, {y:3.0, len:1.4})` hanging from the ceiling line. Nothing here
  is lit — the darkness is the point.

---

### E3 · SHŌ — "THE STAGING, WHERE NOISE COSTS"  [MODIFIED — from F STAGING]

Carries the DOUSE-hazard lesson so the TEN can assume it (fixes Defect 2/3).

- **Sentence:** `REFILL-UNDER-A-GREAT-LAMP(a wide staging lit by one great lantern;
  the two throats rejoin here; a refill cache) → intended: SNEAK(the shadowed
  edges)+OBSERVE the rejoin | alt: DOUSE the great lantern (loud — teaches the
  cost with no guard to punish it, a safe rehearsal) ; counter: THE OPEN FLOOR.`
- **Room:** STAGING `x24..34 · z−9..9`, moss, KEPT. One KEPT **great lantern** at
  `(29, 4)` (intensity 14, range 11) floods most of the room; the shadowed strips
  are the south edge and behind the KEPT cover.
- **Guards:** none inside (KEPT) — this is the deliberate *safe rehearsal* of the
  loud douse: a player may shatter the great lantern here and hear how far the
  thunder carries, with nothing to punish it. That felt cost is what makes the
  TEN's timing tense two rooms later.
- **Tools:** KEPT `capF (29, −4)` refill before the relic chamber.

**Environmental storytelling — "the depot."** Where the tenders stage oil and
tools mid-route: **carts** loaded with barrels, **crateStacks**, sacks — a working
yard under one big work-lamp. It reads "people pass through here hauling fuel,"
which quietly reinforces the whole level's thesis: light is a *supply chain* the
Vigil feeds, and Hush is unmaking it one lamp at a time.

**Asset / placement plan (E3):**
- `clear=[{x0:24,z0:−1.5,x1:38,z1:1.5,pad:0.4}/*the through/rejoin lanes*/,
  {x:29,z:4,r:1.4}/*great lantern*/, {x:29,z:−4,r:1.0}/*capF*/,
  {x0:24,z0:−9,x1:28,z1:−9}/*west door pair from the throats*/]`.
- `kit.cluster(31.5, 6.5, ["cart", {prop:"crateStack",w:2,foot:0.8}, "barrel"],
  {count:4, footprint:1.4, backDir:<toward NE>, clear})` (a loaded corner yard)
  + `kit.corner({x0:24,z0:−9,x1:34,z1:9}, "se", ["barrel","sack",{prop:"crate",
  w:2}], {count:3, clear})`. KEPT cover blocks (28,−6)/(30,6) → recompose as small
  `kit.cluster` piles so nothing is a bare box.

---

### E4 · TEN — "THE OVER-LIT VAULT"  [MODIFIED — from G RELIC CHAMBER]

**The Turn. DOUSE has meant "make a dark spot to hide in." Here dousing is
*forced* and *loud*, and the guard is on top of it — the verb is no longer a free
switch, it is a noise you must spend at exactly the right instant.**

- **Sentence:** `FORCED-DOUSE(a great lantern whose pool covers the only approach
  to the pedestal; a Vesper patrolling that pool; a crystal floor that rings) →
  intended: OBSERVE(the guard's far turn)+DOUSE(on the beat)+SNEAK+take | alt:
  WAIT for the cone to face away and cross the pool lit-but-uncones (very tight),
  BLINK a lit gap if armed with the step ; counter: THE GUARD ON THE LAMP + THE
  SINGING FLOOR.`
- **Room:** RELIC CHAMBER `x38..54 · z−10..10` (16 m × 20 m), **crystal (loud)**,
  KEPT. One KEPT **great lantern** at `(44, 0)` (intensity 13, range 11) whose
  pool spans the room's waist — you cannot walk around it to the pedestal at
  `(50, 0)`. KEPT pillars `(46,6)`, `(42,−6)` give the only cover.
- **Guards:** one, KEPT, walking the lantern's own pool:
  | id | path (x,z) | speed | pause | range | cone |
  |----|-----------|-------|-------|-------|------|
  | V-relic | `[(44,−5),(44,4)]` *(KEPT (44,±5))* | 1.2 | 1.3 s | 9 | 0.62 |
- **The bend, spelled out:** for three beats DOUSE was a clean deletion you did at
  leisure. Here the pool is unavoidable *and* the shatter is loud *and* the guard
  is standing in it. You must read V-relic's patrol, throw at the exact moment its
  back is turned (so the thunder does not land while it faces you), and be moving
  before it completes its turn. The crystal floor means your footsteps after the
  douse also ring — so the douse buys darkness but not silence. **DOUSE stops
  being free.** This is the felt cost that becomes M4's deliberate LURE.
- **Tools:** vials (from `capF`). A ghost with a spare vial and good timing needs
  exactly one douse.

**Environmental storytelling — "the most-tended lamp."** The relic (the mission's
scepter, LORE: rendered from a stolen dusk) sits under the single most cared-for
lamp on the route — an altar. Compose the chamber as a **shrine**: the pedestal as
landmark, flanked by braziers and statues of lamp-priests, offering urns at the
base, an amber banner behind. The great lantern is the shrine's eternal flame. The
image: *you are about to snuff the holiest light in the room and take what it
guards* — the litany "KEEP THE FIRES FED" reads as horror here.

**Asset / placement plan (E4):**
- `clear=[{x0:44,z0:−5,x1:44,z1:5,pad:0.7}/*V-relic line + lantern*/,
  {x0:38,z0:−1.5,x1:54,z1:1.5,pad:0.3}/*the pedestal approach lane — keep the
  crossing legible*/, {x:50,z:0,r:1.4}/*pedestal*/]`.
- `kit.focal(50, 0, { landmark: (x,z,o)=>bag.scepter /*the KEPT pedestal at
  (50,0)*/, flankProp:"statue", flankGap:2.4, flankDir:Math.PI/2, flankFace:"in",
  scatterProp:"urn", scatterCount:2, scatterRing:1.8, clear })` — two lamp-priest
  statues framing the relic, urns at its feet. (If wiring `focal` to an existing
  pedestal is awkward, place the two statues with `kit.flank(50, 0, "statue",
  {gap:2.4, dir:Math.PI/2, face:"in", clear})` and scatter urns manually.)
- Recolour the KEPT relic-wall trim amber `0xffd76a` (already correct). KEPT
  inscription on the entry: "*TAKE ONLY WHAT THE DARK WILL CARRY*" (`#ffd76a`).

---

### E5 · KETSU — "THE WAKING LAMPS"  [KEPT logic, MODIFIED dressing]

- **Sentence:** `BEACON-FLIGHT(take the relic → the lamps down the route wake,
  guardSpeed ×1.3 → outrun to the rift) → intended: SNEAK/BLINK the shortest lit
  line | alt: DOUSE a waking lamp to buy a beat ; counter: THE ROUSED LAMPWAY.`
- **Room:** EXTRACTION `x58..66 · z−6..6`, moss, KEPT rift `(62,0)`; the KEPT
  extraction Vesper `[(60,−4),(60,4)]`; the KEPT dormant lamps `(56,0)`, `(62,4)`
  that ignite on the theft. This is the campaign's first **beacon-flight** — the
  mechanic (steal → world wakes → run) that every later mission reprises.
- **Guards:** V-extract KEPT; `onAlarm` KEPT (speed ×1.3, alarm sfx).
- **Teach:** the theft has a consequence — the light comes *looking*. HUD (KEPT):
  "*The relic wakes and blazes in your hands…* RUN."

**Environmental storytelling — "the gate lamps that light against you."** The two
dormant lamps flanking the escape are dead until you steal; then they flare amber
(KEPT logic). Frame the rift with two dead-lantern fixtures so the flare reads as
"the gate itself turning on to catch you." A `leadingLine` of urns down the escape
corridor funnels the run.

**Asset / placement plan (E5):** `kit.flank(62, 0, "deadLantern", {gap:2.0,
dir:Math.PI/2, clear:[{x:62,z:0,r:1.4}]})` at the rift; `kit.leadingLine(54.5,
0, 60, 0, {prop:"urn",opts:{scale:0.8}}, {spacing:2.4, offset:1.0, clear:[
{x0:54,z0:−1.5,x1:66,z1:1.5,pad:0.4}]})` down the escape.

## 2.4 Pacing map

```
E1 KI    ·  breath   (clean douse, named hazard)     [·]
E2 SHŌ   ·  TENSION  (fork: where dark is safe)      [!!]
E3 SHŌ   ·  release  (safe rehearsal of the cost)    [!]
E4 TEN   ·  spike    (forced, loud, guarded douse)   [!!!]
E5 KETSU ·  out      (first beacon-flight)           [!!→·]
```
E3 is the deliberate comma: a loud douse with no punishment, so E4's identical act
*with* a punishment lands as a Turn, not a surprise.

## 2.5 Playtest predictions

- **Ghost:** E1 douse the door on the cone's turn → E2 take the **north** Snuffed
  throat on pure LISTEN+SNEAK (never throwing) → E3 skirt the great-lantern pool in
  shadow, refill → E4 one perfectly-timed douse on V-relic's back-turn, cross the
  ringing crystal fast → E5 outrun. One vial spent, two banked. *Verify:* the E4
  guard's far-turn dwell is long enough (**pause ≥ 1.3 s, tune**) to throw + start
  moving before it faces back.
- **Distraction:** douses liberally (E1, L-throat in E2, E4) — burns all 3 vials
  by the rift. The level's scarcity (3 vials, 3 real lamps + optional rehearsal)
  makes this a *just-enough* budget, which is the intended honest pressure.
- **Aggressive:** no maw motes in M2 (devour debuts in M3) — correct. The
  aggressive player's only "power" is the douse itself; the level channels that
  urge into the DOUSE lesson rather than into eating.

## 2.6 Change log

- [KEPT] All room footprints; the three douse torches + two great lanterns; the
  Vesper/Snuffed roster (2 types); the fork; caches; the beacon-flight `onAlarm`
  + dormant lamps; extraction; inscriptions; checkpoints.
- [MODIFIED] The relic chamber reframed from "big choke" to the **TEN** (forced,
  loud, guarded douse); the STAGING repurposed as a *safe rehearsal* of the
  shatter cost; the HUB fork's two throats dressed to read (tended-lit vs
  derelict-dark) *before* the prompt; all bare `kit.solid` cover recomposed
  through the prop + placement systems into a lamplighters' route (oil barrels,
  carts, braziers, shrines).
- [NEW] Nothing structural; the storytelling + placement layer.
- [CUT] No `fogPatch` calls present. (If any bare block reads as random, replace
  with a composed pile.)

---
---

# MISSION 3 — THE GORGE  (level index 2)

*Focus word: DEVOUR. Time: night, indoor. New word: DEVOUR/ENGULF. Enemy types: 3
(Vesper + Snuffed + Pharos). Verticality: none (embargo). Vials: 0.*

## 3.1 Diagnosis of the current level

**Current room parse** (from `src/levels/swallow.js`), west→east:

- **A START HALL** `(x−20..−12, moss)` → breather; "something in you has gone
  hungry." **KEPT.**
- **B DEVOUR ROOM** `(x−8..14, moss; maw mote (−6,−5); 1 Vesper (−4,0)→(10,0);
  small torch (3,5))` → intended: feed(mote)+DEVOUR(rear arc) | alt: SNEAK past ;
  counter: *the front arc shoves you.* The devour tutorial. **KEPT strength.**
- **C THE GORGE** `(x18..50)` — one wide chamber, three surface bands:
  - **west moss `18..28`** (Snuffed `(22,5)↔(22,−5)`, dim torch (22,0)) → LISTEN+
    SNEAK, cannot devour it.
  - **mid obsidian `28..38`** (Vesper `(30,−7)↔(36,−7)`, torch (33,−3), maw2
    (24,9)) → feed+DEVOUR again.
  - **east crystal `38..50`** (Pharos `greatEye(44,10)`, pedestal (46,−8), two
    great lanterns) → OBSERVE+WAIT the sweep+take.
- **D EXTRACTION** `(x54..62, moss; rift (58,0))`.

**Defects found (location · severity):**

1. **The three enemy types are introduced, but DEVOUR never turns** · *C east* ·
   **Med.** The Pharos beat is currently "time the sweep, grab the relic" — a good
   obstacle, but it does not *recontextualise* the new verb. The climax of the
   devour level should make DEVOUR *mean* something new (see §3.2).
2. **The growth cost is invisible** · *whole level* · **Med.** LORE + the 5–8 arc
   both lean on "devour makes Hush bigger and brighter" (`growthCap`), and Mission
   7's whole design bills it. M3 is where the *cost* should first be *felt*
   (pleasantly), so its later removal lands. Right now eating is pure upside.
3. **maw2 placement is a backtrack** · *C* · **Low.** `maw2 (24,9)` sits in the
   Gorge's far NW corner — behind the player relative to the mid-Vesper it feeds.
   A player who wants the second swallow must walk *back* west into the Snuffed's
   zone. Either move it forward (mid band) or make the backtrack a deliberate risk.
4. **Bare `kit.solid`/`kit.pillar` cover** · *whole level* · **Med.** Same as M2:
   grey boxes where the prop + placement systems should build a *feeding-gorge*.
5. **Dim near-dark torch is doing shadow's job** · *C west, torch (22,0) violet-
   ish `0x6a5aa0`* · **Low.** A faint violet-blue lamp in the Snuffed zone: the
   colour edges toward Hush's violet on a *Vigil* fixture. Recolour to a cold amber
   or drop it; the Snuffed zone should be genuinely dark, not tinted.

## 3.2 Design statement

*Teach DEVOUR as "the guard is food," then show the one thing you can never eat.*
KI: feed on a mote, take a Vesper from its blind rear arc — it is simply gone, no
body, and you are a little larger (the clean power fantasy). SHŌ: the Gorge
conjugates DEVOUR by *what is edible* — the mid Vesper is food, but the Snuffed is
not (no mote will feed off it, and it hears your lunge). TEN (the Pharos, reframed
so the verb turns): everything Hush has learned says "a watcher can be removed."
The Pharos is a watcher that **cannot** be doused, lured, or devoured — and worse,
the more you have eaten, the **bigger and brighter** you are, so its sweeping beam
finds you *more* easily. **The verb that made you powerful is exactly what makes
you a target under the one light you cannot switch off.** You beat the Eye not with
your new power but by setting it down: shrink into cover, read the sweep, cross
small. That is the felt cost (Defect 2) and the first "un-switchable light"
(seeding M6's SUN) in one beat.

## 3.3 Encounter spec (5 beats)

Coordinate convention: **+x = east (toward the rift)**, west→east.

---

### E1 · KI — "THE FIRST MOUTHFUL"  [MODIFIED — from A START + B DEVOUR ROOM]

- **Sentence:** `LONE-WATCHER(one Vesper on an open moss floor; a crimson mote in
  shadow) → intended: feed(mote)+DEVOUR(rear arc) | alt: SNEAK past on the dark
  edge ; counter: THE FRONT ARC (a face-on strike only shoves).`
- **Room:** START HALL `x−20..−12` (breather, 0 vials, hungry) + DEVOUR ROOM
  `x−8..14 · z−8..8` (22 m × 16 m), moss, night. KEPT small torch `(3, 5)` gives
  one pool to avoid; the rest is dark.
- **Guards:** one, KEPT:
  | id | path (x,z) | speed | pause | range | cone |
  |----|-----------|-------|-------|-------|------|
  | V-devour | `[(−4,0),(10,0)]` | 1.1 | 1.5 s | 8 | 0.62 |
- **Teach:** the swallow. KEPT `mawMote maw1 (−6,−5)` sits in shadow off the
  patrol line — feed (eyes kindle red = briefly speaking the enemy's colour, LORE),
  then take the Vesper from behind. HUD (KEPT): "*…find the Vesper's blind rear arc
  and press F to swallow it whole. Catch it from the front instead and it only
  feels a shove — the maw only opens behind.*"
- **Tools:** 0 vials (deliberate — the player *puts down* DOUSE/LURE to learn
  DEVOUR clean).

**Environmental storytelling — "the feeding-cut."** This is a service cut behind
the wardens' watch that ends in a Vesper's own feeding-gorge (level premise). The
devour room should read as a place of *consumption*: a **cart** left with empty
sacks, gnawed **rubble**, a single low work-lamp. The crimson mote glowing in the
dark is the first spot of red in a violet-and-amber world — the hunger made
visible. Keep it tucked in shadow so *finding* it is the first act of appetite.

**Asset / placement plan (E1):**
- `clear=[{x:−17,z:0,r:2.0}/*spawn*/, {x0:−4,z0:0,x1:10,z1:0,pad:0.7}/*V line*/,
  {x0:−8,z0:−1.5,x1:14,z1:1.5,pad:0.3}/*through lane*/, {x:−6,z:−5,r:1.0}/*maw1 —
  keep its shadow pocket clear so it's reachable*/]`.
- Replace the three KEPT cover blocks with composed piles: `kit.cluster(−2, 4.4,
  ["cart", {prop:"sack",w:2}], {count:3, clear})` (an abandoned haul near the
  torch), and `kit.corner({x0:−8,z0:−8,x1:14,z1:8}, "se", [{prop:"crateStack",
  w:2,foot:0.8}, "barrel"], {count:3, clear})` giving the rear-approach cover the
  KEPT block at (8,−5) provided. `kit.flank(3, 5, {prop:"urn",opts:{scale:0.8}},
  {gap:1.3, clear})` at the torch base (a small tended pool). KEPT inscription
  "*THE MAW REMEMBERS WHAT THE EYE FORGETS*" (`#ff4a5e` — red is licensed here as
  the maw's own colour, tied to the mote).

---

### E2 · SHŌ — "THE GORGE: WHAT YOU CANNOT EAT"  [MODIFIED — from C west + mid]

- **Sentence:** `MIXED-FLOOR(a silent west moss walked by a blind Snuffed; a mid
  obsidian walked by a lone Vesper; a mote for a second swallow) → intended: LISTEN
  +SNEAK(past the Snuffed, silent) then feed+DEVOUR(the mid Vesper) | alt: SNEAK
  both, eat neither ; counter: THE SOUND-HUNTER (west) + THE OPEN OBSIDIAN (mid).`
- **Room:** THE GORGE, west + mid bands. **west moss `18..28`** (silent — the
  Snuffed's medium; DO NOT lunge here, the devour-strike makes a sound), **mid
  obsidian `28..38`** (moderate noise). KEPT.
- **Guards:** two of the three types:
  | id | type | path (x,z) | speed | pause | notes |
  |----|------|-----------|-------|-------|-------|
  | S-gorge | **Snuffed** | `[(22,5),(22,−5)]` | 1.0 | 2.0 | blind; cannot be devoured; hears the lunge |
  | V-mid | Vesper | `[(30,−7),(36,−7)]` | 1.2 | 1.4 | second swallow |
- **The conjugation:** DEVOUR is not universal. The Snuffed teaches the verb's
  *limit* — there is no mote to charge off it, and the very lunge that eats a
  Vesper is a noise the Snuffed hunts. So the player must hold the new power in
  check on the west band (pure SNEAK) and spend it on the mid band. **Reading the
  enemy type decides whether the verb is even available.**
- **Tools:** KEPT `mawMote maw2` — **[MODIFIED] move from (24,9) to ≈(31, 7)**
  (mid band, NE of V-mid) so the second feed does not force a backtrack into the
  Snuffed's zone (fixes Defect 3). It stays a small risk (near the mid Vesper's
  loop) without sending the player the wrong way.

**Environmental storytelling — "quiet dark to open ground."** The bands already
escalate spatially (silent-dark → moderate → singing-lit toward the Eye);
dressing should track it. **West (Snuffed):** neglected, near-black — deadLanterns,
rubble, chains, a collapsed column; the forgotten end where the blind thing
paces. **Mid (obsidian):** a working stretch — a cart, crates, one low lamp; the
Vesper's beat. The player physically walks from *abandonment* toward *tended
light*, which is the walk toward the Pharos shrine.

**Asset / placement plan (E2):**
- `clear=[{x0:22,z0:−5,x1:22,z1:5,pad:0.7}/*S line*/, {x0:30,z0:−7,x1:36,z1:−7,
  pad:0.7}/*V-mid line*/, {x0:18,z0:−1.5,x1:38,z1:1.5,pad:0.3}/*through lane*/,
  {x:31,z:7,r:1.0}/*relocated maw2*/]`.
- **West band:** `kit.wallRun(19, 10, 27, 10, [{prop:"deadLantern",w:3},"rubble",
  "brokenColumn"], {spacing:3.0, inset:0.4, clear})` + `kit.wallRun(19, −10, 27,
  −10, ["chains","rubble"], {spacing:3.5, inset:0.4, clear})`. Recolour/drop the
  KEPT dim violet-ish torch (22,0) → a cold, low amber or none (fixes Defect 5).
- **Mid band:** `kit.cluster(34, 6.5, ["cart", {prop:"crateStack",w:2,foot:0.8},
  "barrel"], {count:4, backDir:<NE>, clear})`; KEPT mid pillar (33,4) and cover
  block (30,6) → recompose as `kit.corner` piles. KEPT inscription (on the west
  wall) "*IT DOES NOT SEE. IT ONLY LISTENS.*" (`#7a6bb0`).

---

### E3 · TEN — "UNDER THE EYE"  [MODIFIED — from C east / Pharos]

**The Turn. Every watcher so far could be removed — doused, sneaked, or eaten.
The Pharos can be none of those, and the fuller Hush has fed, the more the Eye can
see of it.**

- **Sentence:** `UN-EATABLE-WATCHER(a stationary Pharos sweeping the only east
  door; a singing crystal floor; the pedestal in an alcove beneath it) → intended:
  OBSERVE(the sweep period)+WAIT(cover)+SNEAK(the crystal on the beam's return) |
  alt: pillar-to-pillar in the beam gaps, BLINK a lit strip if armed ; counter:
  THE SWEEPING EYE + YOUR OWN SIZE (a devour-fattened Hush is caught sooner).`
- **Room:** THE GORGE, east crystal band `38..50` (loud), KEPT. KEPT **Pharos**
  `greatEye(44, 10, {dir:−π/2, sweep:0.7, sweepSpeed:0.45, range:14, coneAngle:
  0.24, height:3.2})` rakes the door out. KEPT pedestal `(46, −8)` in the south
  alcove; KEPT two great lanterns `(40,6)`, `(46,−3)` and pillars `(42,5)`,
  `(48,7)` for cover.
- **Guards:** the Pharos only (third enemy type), KEPT. No walking guard here — the
  Eye *is* the encounter.
- **The bend, spelled out:** the player arrives flush with two swallows, feeling
  unstoppable — and meets a watcher immune to every verb they own. Neither DOUSE
  (no vials, and it is not a torch), nor LURE (unlearned; and an Eye does not
  chase noise), nor DEVOUR (you cannot swallow the sky) touches it. Its beam is
  temporal, not a pool — you read its *period* and cross on the return. And here is
  the sting: **if the growth-brightness model is on (tune), each Vesper you ate has
  made Hush larger and brighter**, so a two-swallow Hush must hug cover tighter and
  time the sweep finer than a no-swallow Hush. The power had a price, felt for the
  first time. (If growth-brightness is not wired, the TEN still holds on
  un-eatability alone; flag the size sting as **(tune / optional)**.)
- **Tools:** none. Pure OBSERVE + WAIT + SNEAK/BLINK.

**Environmental storytelling — "the shrine of the Eye."** The Pharos is the
Vigil's first and holiest engine (LORE) — so its band is the most sacred, most
tended space in the level: a **focal** composition with the Pharos as the
landmark, flanked by **statues** of lamp-priests kneeling toward it, offering
**urns** and unlit **braziers** at its base, an amber **banner**. The pedestal
sits in the Eye's own shadow (the alcove beneath it) — you take the relic from
directly under the thing that cannot be fooled. The image: the holiest light,
worshipped, and you slipping the relic out of the one blind spot at its foot.

**Asset / placement plan (E3):**
- `clear=[{x0:38,z0:−1.5,x1:50,z1:1.5,pad:0.3}/*door lane the beam guards*/,
  {x:44,z:10,r:1.6}/*Pharos base*/, {x:46,z:−8,r:1.6}/*pedestal alcove*/,
  {x0:38,z0:−11,x1:50,z1:−6,pad:0.2}/*keep the alcove approach readable*/]`.
- `kit.focal(44, 8.5, { landmark:(x,z)=>null /*Pharos already placed by
  greatEye*/, flankProp:"statue", flankGap:2.6, flankDir:0, flankFace:"in",
  scatterProp:[{prop:"urn",w:2},{prop:"brazier",opts:{lit:false}}], scatterCount:3,
  clear })` — two priest-statues flanking the Eye, offerings scattered at its
  base. KEPT pillars (42,5)/(48,7) are the cover you actually use (leave clear of
  props). KEPT inscription in the alcove "*TAKE WHAT THE EYE HAS NOT YET COUNTED*"
  (`#ffd76a`) — perfect here.

---

### E4 · KETSU — "FED, AND FLEEING"  [KEPT logic]

- **Sentence:** `BEACON-FLIGHT(take the relic → the Gorge wakes, guardSpeed ×1.3 →
  outrun to the rift) → intended: SNEAK the dark on the Eye's return | alt: nothing
  fancy — run ; counter: THE ROUSED GORGE.`
- **Room:** EXTRACTION `x54..62 · z−6..6`, moss, KEPT rift `(58,0)`. KEPT
  `onAlarm` (×1.3, sfx). Note the KEPT small torch `(55,4)` deliberately off the
  rift line.
- HUD (KEPT): "*The relic wakes in your grip…* RUN."

**Environmental storytelling:** the escape corridor is the mouth of the gorge
disgorging you — keep it plain, dark, fast. One dead-lantern pair at the rift.

## 3.4 Pacing map

```
E1 KI    ·  breath   (first swallow, clean power)    [·]
E2 SHŌ   ·  TENSION  (what you cannot eat)           [!!]
E3 TEN   ·  CLIMAX   (the un-eatable Eye + your size)[!!!]
E4 KETSU ·  out      (beacon-flight)                 [!!→·]
```
A tight four-beat: the power fantasy (E1) is checked (E2) then inverted (E3) — the
verb that felt free is billed under the Eye — before the exhale.

## 3.5 Playtest predictions

- **Ghost:** E1 swallow the lone Vesper from behind → E2 SNEAK the Snuffed silent,
  swallow V-mid off the relocated mote → E3 read the Pharos period, pillar-to-
  pillar, lift the relic from the alcove → E4 run. *Verify:* the Pharos
  `sweepSpeed 0.45` leaves a cover-to-alcove window ≥ ~1.6 s (**tune**); if
  growth-brightness is on, verify a two-swallow Hush still has a window (may need
  `sweepSpeed` down to 0.4).
- **Distraction:** no vials in M3 — LURE/DOUSE unavailable by design. The level
  refuses the distraction toolkit so the player *must* engage DEVOUR and then
  raw OBSERVE-timing. Intentional narrowing.
- **Aggressive:** eats both Vespers (and wants to eat the Snuffed and the Eye — and
  learns it cannot). The aggressive player is the one the TEN is *for*: arriving
  fattest, they feel the size sting hardest at the Pharos. Exactly the re-education
  Mission 7 will complete.

## 3.6 Change log

- [KEPT] All room footprints; the three-band Gorge; both mawMotes' existence; the
  Vesper/Snuffed/Pharos roster (3 types); the pedestal + great lanterns; beacon-
  flight; extraction; inscriptions; checkpoints.
- [MODIFIED] The Pharos beat reframed as the **TEN** (the un-eatable watcher +
  the growth cost); `maw2` moved from (24,9) to ≈(31,7) to kill the backtrack; the
  dim violet-ish Snuffed torch recoloured/removed (palette); all bare box/pillar
  cover recomposed through the prop + placement systems into a feeding-cut and an
  Eye-shrine.
- [NEW] Nothing structural; the storytelling + placement layer; the (optional,
  tune) growth-brightness sting made explicit as the TEN's second pressure.
- [CUT] No `fogPatch` calls present.

---
---

# MISSION 4 — BRIGHTWARD  (level index 3)

*Focus word: LURE. Time: DAY (first daylight). New word: LURE. Verticality: none
— the fork is left/right, deliberately NOT up (that is Mission 5's reveal). Vials:
2. Relic (lore): the **Noonstaff**.*

## 4.1 Diagnosis of the current level

**Current room parse** (from `src/levels/mission1.js`):

- **OUTER COURT** `(x−16..16, z6..30; moss, h4.5; spawn (−9,26) in a tower's
  shade; gate Vesper (−4..4,10); rift (0,27))` → the three-way fork hub. **KEPT
  strength.**
- **Three ways in:** **MAIN GATE** (the gate-corridor, sun-blasted, gate Vesper);
  **EAST BASTION** `(x20..34, z−12..22; obsidian shadow gallery, h9; Vesper
  (24,−8)↔(24,16))`; **WEST FLANK** `(x−34..−20; moss, quiet; Snuffed
  (−24,−8)↔(−24,14); the WEST BREACH hole (−20..−16,−8..−4) = blink across)`.
- **COURTYARD** `(x−16..16, z−15..1; moss/crystal/moss bands, h8, sun-raked;
  obelisks cast shadow lanes; 2 Vespers (−10..10,−5) & (3,−13..−8); mote m1
  (−13,−1); cache c1 (12,−12.5))` → the braided crossing. **KEPT strength.**
- **RELIQUARY KEEP** `(x−12..12, z−36..−20; crystal, h10; Noonstaff (0,−31); relic
  Vesper (patrol box −4.2..4.2,−27..−33); great lantern (0,−21.5); mote m2, cache
  c3)` → take → beacon-flight.

**Defects found (location · severity):**

1. **LURE is never taught — the arc's last base word is missing** · *whole level*
   · **High.** M4 restores 2 vials but the level treats them only as (implicit)
   douse/blink fuel. The consolidation level must *teach LURE* (throw a vial to
   send a guard toward the sound), or the 5–8 arc inherits a verb the player was
   never shown.
2. **Palette-law violation: VIOLET on Vigil structures** · *OUTER COURT houses,
   RELIQUARY KEEP pillars* · **High (canon).** `kit.trim(..., 0x8a5cff, ...)` puts
   **Hush's violet** on Vigil buildings (lines ~130, 132, 172–173: house trims and
   the keep's pillar trims). Violet belongs only to Hush. Recolour all structural
   trim to Vigil amber/orange (`0xffb46a` / `0xff8866` / `0xffd76a`). Keep violet
   only on Hush's own things (the void-rim of the breach `hole`, vials, the
   extraction is teal — fine).
3. **The daytime read is asserted, not staged** · *COURTYARD* · **Med.** The sun +
   obelisk shadow lanes are the level's signature, but the crossing does not
   *force* the player to read shade vs sun the way M6 will — it can be rushed
   through the moss bands ignoring the sun entirely. LURE is the tool that should
   make the sunlit centre *usable* (send a guard into it), tying the new verb to
   the new light.
4. **Two `"inside"` triggers share one id** · *COURTYARD entrances* · **Low
   (bug-ish).** `kit.trigger("inside", ...)` is declared three times (0,−2 / 17,−6
   / −14,−6). Whichever fires first flips `bag.stage`; the others are dead. Give
   the flank entrances their own ids or make the handler idempotent (it mostly is).
   Cosmetic, but flag it.
5. **Bare-box dressing + under-told story** · *whole level* · **Med.** Houses and
   cover are `kit.solid` boxes; the courtyard obelisks are bare pillars. This is
   the citadel's public face by day — a parade ground for the Noonstaff — and
   should read as one (banners, a well, offering urns, a paraded relic's empty
   plinth-marks), composed.

## 4.2 Design statement

*Spend the whole sentence in daylight, and teach the last word — LURE — as the
verb that makes the sun usable.* This is the exam of the teaching arc: OBSERVE,
HIDE, SNEAK, LISTEN, BLINK, DOUSE, DEVOUR all re-asked in one level, under a new
light that makes concealment scarce and directional. The one new word, LURE, is
the M2 vial-throw *re-read*: in M2 the shatter was a **hazard** (noise that could
call a watcher); here it is a **tool** (noise you throw on purpose to move a
watcher). The TEN is exactly that inversion — *the danger becomes the answer* —
and it is wired to the sun: the sunlit centre band is a place you cannot cross
unseen, so you LURE a guard away from a shade lane (or into the open) to open the
line. DOUSE, meanwhile, gets its first taste of impotence (you cannot douse the
sky) — the gentlest whisper of Mission 6.

**The flat fork is deliberate.** The three ways in (gate / east / west) are a
left-centre-right choice on one plane. Mission 5 opens by re-drawing *this very
fork* as a vertical question (the safe third way is *up*). Keep M4's fork strictly
horizontal so that reveal is genuinely new.

## 4.3 Encounter spec (6 beats)

Coordinate convention: **+z = south (spawn/outside), −z = north (inward, the
keep)**, **+x = east, −x = west**, matching the source. Sun is low from the
**west-and-south** (`sun.position (−30,14,20)`, elevation ≈ 20–25°, **tune**); hard
shadows fall **east-and-north** (toward +x, −z). Every tall thing throws a long
strip you can hide in; open ground is lit = exposed.

---

### E1 · KI — "FULL DAYLIGHT"  [MODIFIED — from OUTER COURT]

- **Sentence:** `SUNLIT-COURT-WITH-THREE-THROATS(open lit ground; one tower's long
  shade over spawn; a gate Vesper; three ways on) → intended: HIDE(the tower
  strip)+OBSERVE(the three throats)+choose | alt: SNEAK the shaded edges, WAIT the
  gate cone ; counter: THE NOON GLARE + THE GATE WATCH.`
- **Room:** OUTER COURT `x−16..16 · z6..30` (32 m × 24 m), **outdoor day**, moss
  (silent) ground, low walls (h4.5). Spawn `(−9, 26)` sits in the long west-cast
  shade of the KEPT gate tower (`pillar (−13,29) h10`). The KEPT rift `(0,27)` is
  here (you flee back to it — the level is a loop out and back).
- **Light/shadow:** the level's first daytime read — open moss = lit = exposed;
  the tower's long east-north shade strip = safe. Teach it on the safe spawn strip
  before it is dangerous.
- **Guards:** the gate Vesper, KEPT:
  | id | path (x,z) | speed | pause | range | cone |
  |----|-----------|-------|-------|-------|------|
  | V-gate | `[(−4,10),(4,10)]` | 1.3 | 1.3 s | 12 | 0.62 |
- **The fork (KEPT, horizontal):** MAIN GATE (south throat, straight/exposed),
  EAST BASTION (east corridor, shadowed), WEST BREACH (west corridor, unwatched
  but voided). The KEPT prompts already name the trade-offs; keep them.
- **Tools:** 2 vials (the return of the throw — but not yet named as LURE; that is
  E3).

**Environmental storytelling — "the parade court."** By day the Vigil parades the
Noonstaff here to prove the dark is beaten (LORE Beat 2). So the outer court is a
public square dressed for display: **banners** (amber), a **well** (KEPT pillar),
market **carts** and **crateStacks**, offering **urns** along the walls — daily
life under the light. The gate tower stands over it all, casting the one reliable
shade. The image the player wakes to: a bright, ordinary, pious town square — and
they are the one dark thing in it (HUD KEPT: "*Full daylight, and you have never
felt so seen.*").

**Asset / placement plan (E1):**
- `clear=[{x:−9,z:26,r:2.4}/*spawn*/, {x:0,z:27,r:1.6}/*rift*/, {x0:−4,z0:10,
  x1:4,z1:10,pad:0.7}/*V-gate line*/, {x0:−2,z0:6,x1:2,z1:6}/*S gate throat*/,
  {x0:16,z0:16,x1:20,z1:20}/*E throat*/, {x0:−20,z0:16,x1:−16,z1:20}/*W throat*/]`.
- Keep the KEPT houses (`solid(8,20)`, `solid(−6,14)`) but recolour their trims
  amber (fix Defect 2). Dress the square: `kit.wallRunSide({x0:−16,z0:6,x1:16,
  z1:30}, "n", [{prop:"crateStack",w:1}, {prop:"barrel",w:1}, "urn"], {spacing:2.6,
  inset:0.8, clear})` (market stalls along the back wall); `kit.cluster(11, 23.5,
  ["cart",{prop:"sack",w:2}], {count:3, clear})` (a parked market cart);
  `kit.flank(5, 17, {prop:"urn",opts:{scale:0.9}}, {gap:1.4, clear})` at the well.
  A couple of amber `kit.banner`s high on the walls. KEPT inscription (recolour
  amber, KEPT text): "*KEEP THE FIRES FED, the stones say. The sun feeds itself.*"

---

### E2 · SHŌ — "THE FLANKS"  [KEPT — the two roads]

- **Sentence (east):** `SHADOW-GALLERY(a long obsidian flank under a tall wall; a
  patient Vesper) → intended: SNEAK(the shade)+WAIT+OBSERVE | alt: DEVOUR the
  patient Vesper if fed ; counter: THE PATIENT WATCHER.`
- **Sentence (west):** `VOIDED-BREACH(an unwatched moss flank; a blind Snuffed; a
  broken wall = a void gap) → intended: LISTEN+SNEAK(silent) then BLINK(the breach)
  | alt: LURE the Snuffed off the gap (once LURE is known) ; counter: THE
  SOUND-HUNTER + THE DROP.`
- **Rooms:** EAST BASTION `x20..34 · z−12..22` (obsidian, h9, the world-edge wall
  casts a deep permanent shade — the forgiving road) and WEST FLANK `x−34..−20`
  (moss, quiet) ending at the KEPT **breach** `hole (−20..−16, −8..−4)` you BLINK.
- **Guards:** one per flank, KEPT:
  | id | type | path (x,z) | speed | pause | range | flank |
  |----|------|-----------|-------|-------|-------|-------|
  | V-bastion | Vesper | `[(24,−8),(24,16)]` | 1.3 | 1.4 | 11 | east |
  | S-flank | **Snuffed** | `[(−24,−8),(−24,14)]` | 1.0 | 2.0 | (blind) | west |
- **The read:** the two flanks re-ask two different old verbs — east is a SNEAK/
  WAIT patience test in generous shade, west is a LISTEN/BLINK test past a
  sound-hunter and over a void. Both braid into the courtyard. This is the "every
  word still works" checkpoint before the new word arrives.
- **Tools:** 2 vials; blink.

**Environmental storytelling — "the world-edge and the ruin."** EAST BASTION is
the citadel's outer rampart — a tall, blank defensive wall (the KEPT h9 wall and
`pillar (30,−6) h10`) throwing a cliff of shade; dress it sparsely and
militarily (a few crates, a `sarcophagus`-like stone block, chains) — a
functional, watched edge. WEST FLANK is a neglected, half-fallen quarter — the
breach is a wall the Vigil never repaired; dress it with **rubble**, **broken
columns**, **deadLanterns**, so the void gap reads as *collapse*, not a designed
door. The KEPT dim nook lamp (`torch (−27,−8)`) — recolour off the violet-blue to
a cold amber, or keep it as the one derelict working lamp.

**Asset / placement plan (E2):**
- EAST `clear=[{x0:24,z0:−8,x1:24,z1:16,pad:0.7}/*V-bastion line*/,
  {x0:16,z0:−8,x1:20,z1:−4}/*inner door*/, {x0:16,z0:16,x1:20,z1:20}/*outer
  door*/]`. `kit.wallRunSide({x0:20,z0:−12,x1:34,z1:22}, "e", [{prop:"crate",w:2},
  "barrel","chains"], {spacing:2.4, inset:0.7, clear})` (a supply line along the
  rampart wall) + KEPT pillars/block recomposed.
- WEST `clear=[{x0:−24,z0:−8,x1:−24,z1:14,pad:0.7}/*S-flank line*/,
  {x0:−20,z0:−8,x1:−16,z1:−4,pad:0.3}/*the breach approach — keep the blink
  lane clean*/, {x:−31,z:14,r:1.0}/*c2 cache*/]`. `kit.cluster(−22, −6.5,
  ["rubble",{prop:"brokenColumn",w:2},"deadLantern"], {count:4, footprint:1.4,
  backDir:<toward the breach>, clear})` right at the breach lip so the collapse
  frames the void gap. `kit.corner({x0:−34,z0:−12,x1:−20,z1:22}, "nw", ["rubble",
  "brokenColumn"], {count:3, clear})`.

---

### E3 · SHŌ — "THE THROWN SOUND"  [NEW — teaches LURE]

The arc's last base word, at a pinch just inside the braid.

- **Sentence:** `PINCH(a chokepoint into the courtyard watched by one cone with no
  shade lane past it) → intended: LURE(throw a vial past the guard; it turns to the
  shatter, opening the lane)+SNEAK | alt: WAIT a long cone cycle (slow), DEVOUR if
  fed ; counter: THE ONE WATCHER, NO SHADE.`
- **Room:** the courtyard-side mouth of whichever flank the player took (the
  east-corr2 `x16..20 · z−8..−4` or the breach exit), a short obsidian/moss pinch
  where a single Vesper cone covers the only opening and there is *no* shade strip
  to sneak — the first place an old verb fails and the new one is needed.
- **Guards:** reuse the flank Vesper's reach here (no new guard needed — position
  the teaching so V-bastion's cone, or a KEPT courtyard Vesper's, owns the pinch).
- **Teach LURE explicitly.** HUD (Hush + prompt, touch/desktop split): *"That
  shatter you feared in the Lampway — a watcher runs toward it. Throw a vial past
  the guard [Q / tap], and its light turns the wrong way. Walk through where it
  was looking."* This is the first time the thrown vial is framed as *bait*, not a
  douse.
- **Tools:** 2 vials — now explicitly a LURE resource (and still a douse resource;
  the player learns one throw, two meanings).

**Environmental storytelling — "the checkpoint."** A guarded threshold into the
sacred inner court: a small **gate shrine** — flanking urns/braziers, a banner,
maybe a stone **sarcophagus** of a founder — the kind of narrow, watched doorway
where a *sound* thrown past it genuinely pulls the lone guard's attention. The
props also physically make the lane single-file, so the LURE reads as *the* answer.

**Asset / placement plan (E3):** `clear` around the actual cone line + the door
lane. `kit.flank(<door centre>, "urn", {gap:1.3, face:"in", clear})` +
`kit.sarcophagus(<just off the lane>, {rot:...})` as the landmark the thrown vial
sails past. Place one `kit.brazier({lit:false})` a few metres *beyond* the guard
as the visual "here is where a sound would land" affordance.

---

### E4 · TEN — "THE SUN-RAKED COURTYARD"  [MODIFIED — from COURTYARD]

**The Turn. The shatter you were taught to fear (M2) and just learned to aim (E3)
is now the only way across a floor with no shadow — you throw a guard into the sun
to buy your own shade. The danger is the answer, and the sun is a light you cannot
douse.**

- **Sentence:** `SUNLIT-CROSSING(a crystal centre band in open sun, flanked by two
  moss shade lanes the obelisks throw; 2 Vespers, one crossing the lit centre) →
  intended: OBSERVE(the obelisk shade lanes)+LURE(pull the centre Vesper aside/into
  the open)+SNEAK(the shade) | alt: WAIT the two patrols' overlap, DEVOUR (mote
  m1) a Vesper in shade, DOUSE (proves useless on the sun — a taught dead end) ;
  counter: THE FAILING SHADE + THE CROSSING WATCH.`
- **Room:** COURTYARD `x−16..16 · z−15..1` (32 m × 16 m), **outdoor day**, roofless,
  tall walls (h8). **Noise-floor (KEPT):** moss west band `−16..−5` and moss east
  band `5..16` (silent shade lanes), **crystal centre `−5..5`** (loud *and* sunlit
  — doubly bad). The KEPT obelisks (`solid (−8,−3) h9`, `solid (−3,−10) h7`) throw
  the two crossing shadow lanes over the crystal; the KEPT fountain `pillar (0,−7)`
  is central cover.
- **Guards:** two, KEPT:
  | id | path (x,z) | speed | pause | notes |
  |----|-----------|-------|-------|-------|
  | V-cross | `[(−10,−5),(10,−5)]` | 1.4 | 1.0 | crosses the sunlit crystal centre |
  | V-hedge | `[(3,−13),(3,−8)]` | 1.2 | 1.5 | south beat, clear of the fountain |
- **The bend, spelled out:** the crystal centre is the only way to the keep
  corridor at `(−2..2, −15)`, and it is both lit (sun) and loud (crystal) with a
  Vesper walking it. You cannot douse the sun (throw a vial at it and nothing
  happens — a deliberate, taught dead end, the first whisper of Mission 6). What
  the vial *can* do is LURE V-cross off the centre — toward a thrown shatter in the
  east moss lane — so you slip the sunlit crystal on the fountain-and-obelisk shade
  in the gap. **The verb you feared, then aimed, now buys you a road across the one
  light you cannot switch off.** DEVOUR (mote m1 at (−13,−1), in the west shade)
  is the aggressive alt; WAIT-the-overlap is the ghost alt.
- **Tools:** 2 vials (LURE / futile DOUSE); mote m1; cache c1 (12,−12.5).

**Environmental storytelling — "the sundial court."** The inner court is the
Vigil's holy of holies for the *sun* — the two obelisks are light-gnomons (they
worship the sky as their largest lamp; LORE's SUN-as-Vigil-lamp), the central
fountain a reflecting basin, the crystal floor a resonant sun-stage where the
Noonstaff is displayed at zenith. Compose it as sacred and symmetrical: obelisks
as **focal** landmarks with offerings at their bases, statues of priests facing the
centre, banners. The symmetry does gameplay work too — it frames the two shade
lanes as the intended edges and the lit centre as the dangerous stage.

**Asset / placement plan (E4):**
- `clear=[{x0:−10,z0:−5,x1:10,z1:−5,pad:0.7}/*V-cross line*/, {x0:3,z0:−13,
  x1:3,z1:−8,pad:0.6}/*V-hedge line*/, {x0:−2,z0:−15,x1:2,z1:1,pad:0.5}/*the N-S
  crossing lane to the keep corr — keep it readable*/, {x:0,z:−7,r:1.6}/*fountain*/,
  {x:−13,z:−1,r:1.0}/*mote m1 pocket*/, {x:12,z:−12.5,r:1.0}/*c1*/]`.
- Obelisk shrines: `kit.focal(−8, −3, { landmark:(x,z)=>null /*KEPT obelisk solid*/,
  flankProp:{prop:"urn",opts:{scale:0.9}}, flankGap:1.6, flankDir:Math.PI/2,
  scatterProp:"rubble", scatterCount:2, clear })` and the same at `(−3, −10)`.
  Keep the shade lanes themselves *clear of cover* (a crate in a shade lane would
  let the player camp instead of move — the lane must stay a *lane*).
- Recolour any courtyard trim amber (fix Defect 2). One inscription on the north
  wall in amber, e.g. KEEP THE FIRES FED variant tying the sun.

---

### E5 · TEN (resolve) — "THE RELIQUARY KEEP"  [MODIFIED — from KEEP]

The full sentence spoken once, and DOUSE's last hurrah before daytime takes it.

- **Sentence:** `SANCTUM(the Noonstaff on a pedestal in a crystal hall; a great
  lantern flooding the approach; a boxing-patrol Vesper) → intended: OBSERVE(the
  patrol box)+DOUSE(the great lantern — indoors, dousable again!)+SNEAK+take | alt:
  LURE the guard out of its box with a thrown vial, DEVOUR (mote m2) it, BLINK a
  lit gap ; counter: THE KEEP WARDEN + THE SINGING FLOOR.`
- **Room:** RELIQUARY KEEP `x−12..12 · z−36..−20` (24 m × 16 m), **crystal (loud)**,
  tall (h10), KEPT. KEPT **great lantern** `(0, −21.5)` (intensity 14, range 12)
  floods the entrance; small lanterns `(±3, −27)` flank the pedestal `(0,−31)`.
- **Guards:** one, KEPT, patrolling a box around the pedestal:
  | id | path (x,z) | speed | pause | range |
  |----|-----------|-------|-------|-------|
  | V-keep | `[(−4.2,−27),(4.2,−27),(4.2,−33),(−4.2,−33)]` | 1.3 | 1.1 | 12 |
- **The read (the exam):** indoors, out of the sun, **DOUSE works again** — the
  great lantern is a real torch you can shatter to darken the approach (the verb the
  courtyard just proved useless gets a small dignity back the moment you step into
  shade). Or LURE V-keep out of its box with a thrown vial; or DEVOUR it via mote
  m2 (9,−33.5); or BLINK a lit strip. Every base verb is a valid line to the
  Noonstaff — that is the point of the consolidation.
- **Tools:** 2 vials; mote m2; cache c3 (−9,−33.5).

**Environmental storytelling — "the sanctum of the paraded relic."** The keep is
where the Noonstaff rests between parades — the most sacred interior, a **focal**
shrine: the pedestal as landmark, flanked by priest-statues and the KEPT columned
rows (recolour their trim amber — Defect 2's worst offender is here), braziers and
offering urns, an amber banner behind. The great lantern is the sanctum's eternal
flame over the door. KEPT inscription "*TAKE ONLY WHAT THE DARK WILL CARRY*"
(`#ffd76a`).

**Asset / placement plan (E5):**
- `clear=[{x0:−4.2,z0:−33,x1:4.2,z1:−27,pad:0.6}/*V-keep box*/, {x:0,z:−31,r:1.4}
  /*pedestal*/, {x:0,z:−21.5,r:1.4}/*great lantern*/, {x0:−2,z0:−20,x1:2,z1:−20}
  /*N door lane*/, {x:−9,z:−33.5,r:1.0}/*c3*/, {x:9,z:−33.5,r:1.0}/*m2*/]`.
- Recolour the KEPT keep pillar-row trims from `0x8a5cff` → `0xffb46a` amber
  (the single most important palette fix). `kit.flank(0, −31, "statue", {gap:2.6,
  dir:Math.PI/2, face:"in", clear})` framing the Noonstaff; `kit.wallRunSide(
  {x0:−12,z0:−36,x1:12,z1:−20}, "s", [{prop:"urn",w:2},{prop:"brazier",
  opts:{lit:false}}], {spacing:3.0, inset:0.6, clear})` behind the pedestal.

---

### E6 · KETSU — "THE NOONSTAFF, FLEEING"  [KEPT logic]

- **Sentence:** `BEACON-FLIGHT(take the Noonstaff → the citadel wakes, guardSpeed
  ×1.3, dormant lamps ignite → outrun back out to the rift in the outer court) →
  intended: SNEAK the shade lanes in reverse | alt: LURE/DOUSE to buy a beat,
  BLINK the breach again ; counter: THE ROUSED CITADEL + THE SUN (you cannot hide
  in shade AND you now glow).`
- **Room:** reverse the E5→E4→E1 route to the KEPT rift `(0,27)`. KEPT `onAlarm`
  (×1.3, sfx) + KEPT dormant lamps `(−10,−3)`, `(10,−3)`, `(−5,−25)`, `(5,−25)`
  igniting on the theft.
- **The recontextualisation of HIDE (the campaign's recurring KETSU move):** all
  level you were *the dark*; now you carry the Noonstaff and are a **light source**
  — the shade you relied on is on your own back. You cannot hide; the shade lanes
  become a *speed map* (shortest lit-exposure line), and LURE/DOUSE only buy beats.
  HUD (KEPT): "*The citadel wakes. The Noonstaff's glow betrays you — run, shadow,
  RUN.*"

**Environmental storytelling:** as the dormant lamps flare, the parade court you
crossed in stealth is now a lit trap — the same banners and shrines, now hostile.
Last image of the teaching arc: the one dark thing in a bright town, carrying a
stolen light back into the dark.

## 4.4 Pacing map

```
E1 KI      ·  breath   (daytime read + choose)        [·]
E2 SHŌ     ·  TENSION  (the flanks, old verbs re-asked)[!!]
E3 SHŌ     ·  spike    (LURE taught at a pinch)        [!!]
E4 TEN     ·  CLIMAX   (sun crossing — LURE weaponised)[!!!]
E5 TEN     ·  spike    (keep — the full sentence)      [!!]
E6 KETSU   ·  out      (beacon-flight in daylight)     [!!!→·]
```
The exam shape: a fork (E1), two re-asked verbs (E2), the new word (E3), the new
word turned (E4), the whole sentence (E5), the flight (E6).

## 4.5 Playtest predictions

- **Ghost:** E1 shade-hop the court, take the **east** shadow flank → E2 patient
  SNEAK past V-bastion → E3 LURE the pinch guard (first vial) → E4 LURE V-cross
  off the sunlit centre (second vial), cross on the obelisk shade in the gap → E5
  read V-keep's box, take the Noonstaff from shade → E6 run the shade-as-speed map.
  Both vials spent on LURE, none on douse — a clean ghost line. *Verify:* E4 has a
  no-DEVOUR, no-DOUSE line (the LURE + WAIT-overlap must both open the centre);
  and that the sun's shade lanes are wide enough to actually walk (**tune** obelisk
  heights / sun elevation so the west+east moss bands stay shaded).
- **Distraction:** LURE everywhere (the level's native verb) — pinch, courtyard,
  keep. Two vials is a tight budget across E3–E5, so the distraction player must
  choose *which* watcher to bait — honest scarcity.
- **Aggressive:** DEVOUR the east Vesper (E2), the courtyard Vesper via m1 (E4),
  the keep warden via m2 (E5). Works — but a fattened Hush is brighter in the sun
  (the M3 growth sting, now under real daylight), tightening every lit crossing.
  The daytime punishes the eater more than the night did — a bridge to Missions
  6–7.

## 4.6 Change log

- [KEPT] All room footprints; the three-way fork; the sun `DirectionalLight`; the
  courtyard obelisk shade lanes + fountain; the west breach `hole` (blink); the
  keep + Noonstaff + great lantern + boxing warden; both motes + caches; the
  beacon-flight `onAlarm` + dormant lamps; extraction; checkpoints.
- [MODIFIED] **Palette fix** — recolour all violet `0x8a5cff` structural trim
  (outer-court houses, keep pillar rows) to Vigil amber (canon); the courtyard
  reframed as the **TEN** that weaponises LURE against the un-dousable sun; the
  duplicate `"inside"` trigger id given distinct ids (or handler confirmed
  idempotent); all bare-box dressing recomposed (parade court, world-edge rampart,
  ruined breach, sundial court, sanctum) through the prop + placement systems.
- [NEW] **E3 teaches LURE** (the arc's last base word — the M2 vial-throw re-read
  as bait); the daytime sun-read made a *forced* crossing rather than an optional
  flourish.
- [CUT] No `fogPatch` calls present; the "just rush the moss bands and ignore the
  sun" degenerate line (closed by making the centre the only route and LURE its
  key).

---
---

## APPENDIX A — Arc-wide consistency checklist for the builder (Missions 1–4)

- **Verticality embargo:** NO `platform`/`ramp`/tiers anywhere in 1–4. Everything
  on `y = 0`. The M4 breach `hole` is horizontal (blink), not a tier. This
  reserves CLIMB as Mission 5's genuine one-new-word.
- **One-new-word discipline** (after the primer): M1 = the base set (HIDE, SNEAK,
  LISTEN, BLINK — the *only* multi-word level, because it teaches the nouns);
  M2 = DOUSE; M3 = DEVOUR; M4 = LURE. If a room seems to need a fifth verb to
  solve, it is over-scoped — cut, don't add.
- **The vial arc:** M2 grants 3 (DOUSE), M3 grants 0 (pure DEVOUR), M4 grants 2
  (LURE + douse). Do not leak vials into M3.
- **Every encounter has ≥2 valid verb phrases + a NAMED counter-pressure.** If a
  room collapses to one line in playtest, widen it with a shade lane or a cover
  composition — never a tier (embargo).
- **TEN must recontextualise, not just spike:** M1 = crystal flips from "avoid it"
  to "leap it" (BLINK); M2 = DOUSE flips from "free switch" to "loud, timed cost";
  M3 = DEVOUR flips from "remove any watcher" to "the one you can't eat, and your
  size betrays you"; M4 = LURE flips the shatter from "hazard" to "the tool that
  crosses the un-dousable sun." Each changes what an old verb *means*.
- **Ghost route guaranteed in every level:** verify a full no-DEVOUR (and in M2/M4
  a no-DOUSE) line start-to-rift before shipping.
- **Palette law:** amber/orange/red = Vigil; **violet = Hush only.** Fix the M4
  `0x8a5cff` structural trims. The daytime sun is white-gold amber (the Vigil's
  largest lamp — narratively on their side). The maw motes' red is licensed (it is
  Hush's hunger briefly speaking the enemy's colour). Extraction teal is Hush's.
- **Storytelling is arrangement, not text.** Use `kit.inscription` for at most the
  KEPT one-per-room liturgy lines. Everything else — the lamp-midden, the tended-vs-
  derelict throats, the Eye-shrine, the parade court — is told by *how the props
  are composed*.
- **No `fogPatch`:** none of the four files call it (M1 uses the real `fogWall`
  barrier — keep it). If any future edit adds `fogPatch`, delete it (deprecated
  no-op).
- **No VENT/crouch/hack/disguise verbs.** Every connector is a doorway or a
  light-read, never a new traversal verb.

## APPENDIX B — Placement-helper cheat-sheet used in this doc

| Intent in 1–4 | Helper | Typical call shape |
|---|---|---|
| A supply/derelict line along a wall | `wallRun` / `wallRunSide` | rhythmic barrels/crates or deadLanterns, `{spacing, inset, clear}` |
| A shrine / altar / mark-the-danger pair | `flank` | mirrored urns/braziers around a torch, door, or relic |
| A dumped heap / loaded yard / collapse | `cluster` / `corner` | tall-to-back pile, `{count, footprint, backDir, clear}` |
| A landmark + framing + offerings in one | `focal` | Eye-shrine, obelisk-shrine, pedestal-shrine |
| Funnel the eye down a corridor to the exit | `leadingLine` | sparse two-sided file of urns/lanterns |
| Keep cover off door lanes / patrol lines / spawn | every helper's `clear` | build the `clear` array once per room, pass to every call |

## APPENDIX C — Tunable constants collected (all **tune**)

| Constant | Proposed | Where |
|---|---|---|
| Blink range (teaching) | 4.5–5 m (clears a 3 m band) | M1 E3, M4 breach |
| Awareness ramp calm→suspect→chase | 0.7 s / 1.6 s (match 5–8) | global |
| M1 E3 counter-sweep island-dark window | ≥ 1.5 s / cycle | M1 E3 |
| M2 E4 relic-guard far-turn dwell | pause ≥ 1.3 s | M2 E4 |
| M3 Pharos sweepSpeed / cover→alcove window | 0.45 / ≥ 1.6 s | M3 E3 |
| Growth-brightness sting (devour → bigger/brighter) | on (optional) | M3 E3, M4 aggressive |
| M4 sun elevation / shadow length | ≈ 20–25°, long hard strips | M4 (all) |
| M4 obelisk heights vs shade-lane width | h7 / h9 keep bands shaded | M4 E4 |
| Beacon guard speed mult | ×1.3 (KEPT) | M2, M3, M4 |
| Vials granted | M2 = 3, M3 = 0, M4 = 2 | per level |
