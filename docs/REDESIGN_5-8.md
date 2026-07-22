# UMBRAL — REDESIGN, MISSIONS 5–8 (Level indices 4–7)

*Written design spec. No code. Applies the verb-grammar / four-beat
(kishōtenketsu) method to Umbral's REAL shipped vocabulary. A builder should be
able to grey-box each level from this document without asking a follow-up
question. All invented values are flagged **(tune)**.*

---

## CORRECTIONS — director's errata, 2026-07-22 (these OVERRIDE the body text)

1. **`fogPatch` is LIVE — ignore every "vestigial no-op / delete every fogPatch
   call" instruction below** (§5 defect 5, §6/§7/§8 defect lists, Appendix A).
   That guidance dates from when the kit stubbed it. `fogPatch` now feeds
   `bag.fogZones` → the tracer's volumetric zones and is load-bearing for the
   god-ray showcases (the Spire's lancet shafts, the Eye's beam in fog). Keep
   the calls; place new ones wherever a light shaft should be visible.
2. **M8 SUN-quiz beat: WAIVED (resolved canon).** PLACES.md fixes the finale as
   an indoor reliquary undercroft (polished-stone reflections showcase), which
   cannot host a spatial sun-read; SUN received its full examination in M6. The
   shipped M8 exam = CLIMB + reflection + dark-stealth + the Ember, with the
   E2 "sunset courtyard" reframed as the reflection hall. The animated dusk-set
   / guttering-lamp crossover remains a WISHLIST enhancement, not a defect.
3. **Palette law refined** (also amended in PLACES.md/LORE.md): violet = **the
   Old Dark itself** — Hush, and the Vigil's imprisoned residue of it (drowned
   canal-lamps, dreg-lamps, crypt-lamps are canon). The Vigil's OWN light is
   never violet. Violet on Vigil trim/banners/UI remains a violation.

---

## Method recap (how to read this doc)

**The sentence.** Umbral's core sentence is one clause, spoken over and over
with different words filled in:

> READ the light (OBSERVE/LISTEN) → become invisible (HIDE in shadow) → travel on
> a floor that won't betray you (SNEAK on moss / BLINK across crystal) → bend the
> situation (DOUSE / LURE / DEVOUR / CLIMB) → take the relic → outrun the beacon.

**Escalation is by CONJUGATION, not addition.** Each of these four levels teaches
**at most one new word** and then re-uses every old word in a new grammatical
position. We do not pile on mechanics; we bend the ones the player has.

**Notation.** Each encounter is parsed as:

`OBSTACLE(config) → intended: VERB+VERB | alt: VERB+VERB ; counter: NAMED-PRESSURE`

Anything that reads as incoherent, vestigial, or teaches nothing is marked
`NOISE(...)` — that is a finding, not a feature.

**Palette law (canon, on-screen).** Amber/orange/red = the Candent Vigil (calm
amber → suspect orange → hunting red). **Violet belongs only to Hush.** The new
daytime SUN is white-gold and is *the Vigil's largest lamp* — narratively it is
on their side.

**Global detection rule, restated for daytime + verticality** (assumed engine
behaviour; **tune** the constants):

- Guards (Vespers) do not see Hush. They see **light on Hush**. Hush is "lit"
  when standing in **direct sun**, in a **lamp pool**, or inside a **Pharos
  beam**. In cast shadow Hush is literally invisible.
- Awareness ramps only when a lit Hush sits **inside a guard's cone**: calm →
  suspect (~0.7 s) → chase (~1.6 s) **(tune)**. Lit-but-uncones = safe-but-risky
  (a cone may arrive).
- **Sun** converts all open, un-shadowed ground into a single standing lit zone.
  It cannot be DOUSED. It is read spatially (where the shade falls), and at dusk
  it also moves.
- **Vertical cones (NEW rule, tune):** a guard's cone has a vertical half-spread
  of ~8°, centred on eye height (≈1.6 m) with a slight −5° down-tilt. Practical
  consequence: a ground guard **cannot see a target one tier up (+2.5 m)** beyond
  ~6 m range, and **cannot see down into a −3 m sunken pit** beyond ~5 m range.
  Height is concealment — but only against cones aimed at the wrong tier. A
  **rooftop Vesper** and the **tall Pharos beam** (height 3.2–3.4) rake multiple
  tiers.

**Height tiers used throughout (tune):**
`GROUND 0m · AWNING +2.5m · ROOFTOP/CATWALK +5m · SUNKEN PIT −3m`. Ramps at
~22° grade (a +2.5 m gain over ~6.2 m run). Blink-up: a shadowstep may also gain
one tier (≤+2.6 m) if it lands on a ledge within blink range.

---

## CAMPAIGN ARC (one page)

| # | Level (idx) | Focus word | The ONE new word | Time / indoor–outdoor | Verticality role | One-sentence fantasy |
|---|---|---|---|---|---|---|
| 5 | THE LANTERN-WAYS (4) | **CLIMB** — traversal becomes 3-D | **CLIMB / RAMP** | **Dawn**, mostly outdoor streets | Teach up *and* down: rooftops and a sunken canal are just new shadow layers | *The city stacks — the safest road is the one over their heads, or under their feet.* |
| 6 | THE CHANDLERY (5) | **SUN** — a spatial light you read | **SUN / directional-shadow** | **High noon**, alternating indoor↔outdoor | Eaves and awnings hold the only thin noon shade; ride them | *At noon the Vigil owns one lamp you cannot douse — the sky — so read its shadows or burn.* |
| 7 | THE SPIRE ASCENT (6) | **RELIEVE** — the devour counter | **RELIEVE / MISSING-WATCH** *(PENDING AUTHOR APPROVAL)* | **Afternoon**, outdoor vertical climb | Braided stairs with relief posts patrolling above *and* below | *Eat your fill on the way up — but the empty post you leave behind screams louder than any corpse.* |
| 8 | THE RELIQUARY (7) | **THE FULL SENTENCE** — exam | none (integration only) | **Dusk → dark**, outdoor down into deep indoor | Descend to the birthplace, climb out ablaze as the beacon | *Every word you were taught, spoken back to a dying city, as the sun sets and the lamps you are made of go home.* |

**Why this order of words.** CLIMB first, because it is a pure *traversal* verb —
it changes where shadow can be, without changing what light means, so it is the
gentlest new grammar. SUN second, because once the player thinks in 3-D they can
be taught a light that is defined by 3-D geometry (shade under eaves) and that
**cannot be doused** — the arc's first real recontextualisation of the whole
verb set. RELIEVE third, because by now the player has hoarded power and is
DEVOUR-happy; RELIEVE is the punctuation that makes eating cost something without
removing it. The finale adds nothing — it conjugates all three at once, and hands
DOUSE back (dusk relights the lamps) exactly as it takes SUN away (it sets),
which *is* the story's Turn.

**The through-line that ties DOUSE to the whole arc:** the player has spent the
night levels learning that light is a switch you can throw (DOUSE a lamp = delete
a hide-zone-killer). Daytime quietly breaks that promise. You cannot douse the
sun. Every daytime level is, underneath, about what you do when your favourite
verb stops working.

---
---

# MISSION 5 — THE LANTERN-WAYS  (level index 4)

*Focus word: CLIMB. Time: dawn. Mostly outdoor. New engine word introduced:
CLIMB/RAMP.*

## 5.1 Diagnosis of the current level

**Current room parse** (from `src/levels/lanternways.js`):

- **B · HUB / THE FORK** `(x−14..14, z18..30, moss)` → intended: OBSERVE+choose |
  alt: WAIT+OBSERVE ; counter: *the silence* (level refuses to hint). **KEPT
  strength** — a genuine kishōtenketsu KI: two throats, no explanation.
- **C · GREAT PLAZA** `(x−20..20, z−6..18; crystal centre sings, moss side lanes,
  6 torches, 5 Vespers, fountain pillar + 2 blocks)` → intended: SNEAK(moss
  lanes)+WAIT | alt: DOUSE(torch)+SNEAK, BLINK, DEVOUR(plazaMaw) ; counter: *five
  overlapping cones on singing crystal.*
- **D · ALLEY** `(x−34..−14, z2..30, moss, tenements, 2 Vespers)` → intended:
  SNEAK+HIDE | alt: DEVOUR(alleyMaw)+SNEAK ; counter: *tenement blind corners.*
- **E · CANAL / UNDERCROFT** `(x−34..−14, z−16..2; moss banks, crystal ledges,
  a hole, 2 blind Snuffed)` → intended: BLINK(across the hole, silent)+HIDE | alt:
  LISTEN+SNEAK(moss banks), LURE(Snuffed) ; counter: *the ledge-walkers own the
  water's silence.* **KEPT strength** — the mechanical high point (BLINK + LISTEN).
- **F · THE LANE** `(x−3..3, z−16..−6, obsidian, empty)` → `NOISE(empty closet)`.
- **G · CONCOURSE + RIFT** `(x−34..20, z−40..−16, moss, 1 Vesper, extraction)` →
  intended: SNEAK+extract ; counter: *one lonely patrol.*

**Defects found (location · severity):**

1. **No verticality at all** · *whole level* · **High (by design of the remit).**
   The level is flat; it is the natural place to introduce CLIMB.
2. **Dominant strategy: the dark alley eats the plaza** · *C vs D* · **High.** The
   plaza is a lovingly built 5-Vesper set-piece that a reading player simply never
   enters — the safe moss alley strictly dominates. A whole encounter's content is
   bypassed, not chosen against.
3. **DOUSE is a near-dead verb in the plaza** · *C* · **Med.** Six torches, five
   guards: dousing one lamp barely dents the exposure, so nobody does it.
4. **NOISE: The Lane (F)** · *F* · **Med.** An empty obsidian corridor that teaches
   and threatens nothing; pure connective tissue.
5. **Vestigial `fogPatch` call** · *G concourse* · **Low.** `fogPatch` is now a
   no-op stub (kit deprecates it); the call is dead. (Also present but harmless in
   other rooms.)
6. **Weak KETSU** · *G* · **Med.** After the canal's TEN, the finale is "walk
   across a moss room past one guard." The sentence isn't spoken in full at the end.

## 5.2 Design statement

*Recontextualise the fork as a **vertical** question.* The player currently reads
the fork as left/right (loud plaza vs safe alley). We add a third axis and then
prove it is the real axis: the safest line across the plaza is **over** it
(dawn-shadowed rooftops), and the safest line across the canal is **under** it
(a sunken bed in permanent shade). CLIMB is taught as "go up to hide," and the
TEN inverts it to "go down to hide" — same verb, opposite direction, so the
player learns CLIMB is about *choosing your tier*, not about *going up*.

Dawn keeps the SUN read trivial on purpose (that lesson belongs to Mission 6):
the sun is low in the **east-south-east (≈15° elevation)**, so every tenement
throws a **long, hard, static** shadow lane to the west-north-west (~3.7× object
height — a 7 m block shades ~26 m). These long shadows read exactly like night's
moss lanes did; the *only* new thing to learn is that shadows now live at
different heights and you can move between them.

## 5.3 Encounter spec (8 beats)

Coordinate convention: **+z = south (spawn side), −z = north (rift)**, **−x =
west**, **y = up**, matching the source. Room footprints are kept from the
shipped level where marked [KEPT]/[MODIFIED].

---

### E1 · KI — "THE FIRST RUNG"  [MODIFIED — from A Start Hall]

- **Sentence:** `RAMP(safe vantage, one slow watcher below) → intended:
  CLIMB+OBSERVE | alt: SNEAK(ground)+OBSERVE ; counter: the reveille lamp.`
- **Room:** Start hall, `x−6..6 · z30..40` (12 m × 10 m), **outdoor, dawn**.
  Noise-floor **moss** (silent). A single night-lamp still burns at `(0,35)` —
  "the reveille lamp," a small amber pool r≈4 m the Vigil has not doused yet
  (flavour: at dawn the city is briefly *over*-lit). A **ramp** rises along the
  east wall from `z34` to a **+2.5 m ledge** at `(4, 31)` overlooking the hub.
  Long ESE dawn shadow from the east wall covers the ramp itself.
- **Vertical layout:** GROUND hall + one AWNING ledge (+2.5). The ledge is a safe
  balcony — nothing can reach Hush there yet.
- **Guards:** one Vesper, slow, on the ground:
  | id | path (x,z) | speed | pause | range | cone |
  |----|-----------|-------|-------|-------|------|
  | V-reveille | `[(-3,33),(3,33)]` | 1.1 | 1.6 s | 9 m | 0.55 rad |
- **Player tools:** 3 vials (kept), blink range 6.5 (kept, the level's grant),
  `blinkCdMul 0.85`.
- **Teach:** the ledge is bathed in shadow and shows Hush the hub below. First
  time the camera can *look down a tier.* HUD (Hush voice): *"You remember when
  the city had a top to it."*

### E2 · KI→SHŌ — "THE FORK, NOW THREE-WAY"  [MODIFIED — from B Hub]

- **Sentence:** `FORK(street-left / street-right / rooftop-up) → intended:
  OBSERVE+CLIMB | alt: OBSERVE+SNEAK ; counter: the silence (no route hint).`
- **Room:** Hub, `x−14..14 · z18..30` (28 m × 12 m), outdoor moss. The KEPT
  inscription **"KEEP THE FIRES FED"** on the north face. Two ground throats kept:
  **west → alley**, **north → plaza**. **NEW third throat:** a market-awning
  **catwalk** at **+2.5 m** running north over the plaza wall, reached by a ramp
  at `(10, 22)`. Its underside is in dawn shadow.
- **Vertical layout:** GROUND fork + a rising AWNING catwalk that becomes E3.
- **Guards:** none (KI stays breathable). A `mawMote` at `(-8, 24)` **[NEW
  placement]** tempts the aggressive player up the alley.
- **Teach:** the level's thesis in one room — the third way is *up*. No prompt
  names it; the ramp is simply visible from the E1 ledge, so a player who climbed
  E1 already knows it exists (reward for climbing).

### E3 · SHŌ — "OVER THE PLAZA"  [MODIFIED — from C Great Plaza]

- **Sentence:** `LIT-CROSSING(5 ground Vespers, singing crystal below; shadowed
  catwalk above) → intended: CLIMB+SNEAK(awning, in tenement shadow) | alt:
  SNEAK(moss ground lane)+WAIT, DOUSE(a hanging lantern to darken a catwalk gap) ;
  counter: THE ROOFTOP WATCH + THE SINGING SQUARE.`
- **Room:** Great Plaza `x−20..20 · z−6..18` (40 m × 24 m), outdoor. Floors KEPT:
  **crystal** singing centre `x−12..12`, **moss** side lanes. **NEW upper tier:**
  a ring of **awning catwalks at +2.5 m** hugging the tenement rows on the east
  and west, joined by two plank bridges over the crystal at `z12` and `z2`. Dawn
  shadow from the (now taller, **9 m**) tenements blankets the catwalks and the
  side lanes; the crystal centre and the plank-bridge midpoints are in **direct
  dawn sun = lit**.
- **Vertical layout:** GROUND (5 Vespers, loud crystal) vs AWNING (+2.5, shadowed,
  but watched by one rooftop Vesper). This is the payoff of CLIMB: the ground
  set-piece is now something you cross *above*, fixing Defect 2 — the plaza is no
  longer bypassed, it is the floor of a room you traverse.
- **Guards:**
  | id | tier | path (x,z) | speed | pause | range | cone | notes |
  |----|------|-----------|-------|-------|-------|------|-------|
  | V1 | ground | `[(-13,15),(14,15)]` | 1.5 | 1.0 | 12 | 0.62 | KEPT |
  | V2 | ground | `[(14,15),(14,-1)]` | 1.4 | 1.2 | 12 | 0.62 | KEPT |
  | V3 | ground | `[(-13,-1),(-13,15)]` | 1.4 | 1.2 | 12 | 0.62 | KEPT |
  | V4 | ground | `[(-8,0),(8,0)]` | 1.6 | 0.8 | 11 | 0.62 | KEPT |
  | **V5-roof** | **AWNING +2.5** | `[(-6,12),(-6,2),(6,2),(6,12)]` | 1.3 | 1.4 | 11 | 0.55 | **[NEW] the rooftop watch — patrols the catwalk you want** |
- **The bend:** a player who thinks "up = free" meets V5 on their own tier. The
  answer is timing V5's loop and using the **plank-bridge shadow** — or dropping
  back to ground moss when V5 comes, i.e. *using both tiers*. DOUSE is
  rehabilitated (Defect 3): three **hanging lanterns** light gaps in the catwalk
  ring; dousing one buys a dark segment past V5. Only 3 vials, so DOUSE is a
  scarce, real choice, not spam.
- **Counter-pressure names:** THE ROOFTOP WATCH (V5, denies the naive up-route),
  THE SINGING SQUARE (crystal, denies the naive ground-route).
- **Cache:** `plazaCache (15.5,6)` KEPT but **raised to +2.5** on the east catwalk
  — a vial reward for committing to the climb.

### E4 · SHŌ — "THE STACKED ALLEY"  [MODIFIED — from D Alley]

- **Sentence:** `VERTICAL-MAZE(tenement ledges, ramps, 2 Vespers on split tiers)
  → intended: CLIMB+HIDE | alt: SNEAK+DEVOUR(alleyMaw, drop from above) ; counter:
  THE BLIND CORNER + (soft) growth-cost.`
- **Room:** Alley `x−34..−14 · z2..30` (20 m × 28 m), outdoor. Moss ground KEPT.
  **NEW:** the four tenements gain external **ramps** and connect via two **+2.5 m
  ledges**; one tenement roof at **+5 m** holds the alley cache. Deep, permanent
  dawn shadow throughout (the alley faces away from the low sun) — this is the
  forgiving room, almost all hide-zone.
- **Vertical layout:** the fullest 3-tier space so far (0 / +2.5 / +5). One Vesper
  patrols ground, one patrols a +2.5 ledge — teaching that "which tier is a guard
  on?" is now a question you must OBSERVE.
- **Guards:**
  | id | tier | path (x,z) | speed | pause | range | cone |
  |----|------|-----------|-------|-------|-------|------|
  | V6 | ground | `[(-32,28),(-32,21),(-20,20)]` | 1.3 | 1.5 | 12 | 0.62 |
  | V7-ledge | +2.5 | `[(-30,13.5),(-22,13.5)]` | 1.3 | 1.6 | 11 | 0.55 |
- **Aggressive outlet + first soft cost:** the `alleyMaw` at `(-22,8)` lets you
  **CLIMB above V6 and blink-drop a DEVOUR** — a satisfying takedown that leaves no
  body. But note (foreshadow of Mission 7): devouring makes Hush **bigger and
  brighter** (growthCap), so the next lit gap is riskier. No RELIEVE punishment
  yet — L5 is where devour still feels free, so its removal later lands.
- **Counter:** THE BLIND CORNER (tenement occluders make cones snap on suddenly at
  corners — punishes blind ground-sprinting, rewards OBSERVE-from-height).

### E5 · TEN — "UNDER THE CANAL"  [MODIFIED — from E Canal/Undercroft]

**This is the recontextualisation. CLIMB has meant *up = safe*. Here the safe tier
is DOWN.**

- **Sentence:** `INVERTED-CROSSING(sunlit loud crystal ledges ABOVE with 2 blind
  Snuffed; shadowed silent moss bed −3 m BELOW; a void gap) → intended:
  CLIMB-DOWN+SNEAK(the shaded bed) then BLINK(the gap) | alt: LISTEN+SNEAK(bed),
  LURE(a Snuffed off the ledge with a vial) ; counter: THE LEDGE-WALKERS.`
- **Room:** Canal `x−34..−14 · z−16..2` (20 m × 18 m), outdoor. **NEW vertical
  reframe:** the two crystal ledges (KEPT loud) are now the **upper** rim at
  ground level and catch the low dawn sun (**lit + loud** — doubly bad); a
  **sunken bed at −3 m** runs between them, floored in **moss** (silent) and in
  permanent shade (the sun cannot reach the pit bottom). The KEPT **hole**
  `(-33..-15, −8..−2.5)` remains as a true void break in the bed that must be
  BLINKED. Descent by ramps at `(-33, 1)` and re-ascent at `(-15, −15)`.
- **Vertical layout:** SUNKEN −3 (safe: shaded, silent) vs GROUND ledges (unsafe:
  sunlit, singing). Exact inversion of E3–E4's "up is safe." Same verb, flipped.
- **Guards:** the two blind **Snuffed** now walk the **upper ledges** (they hunt by
  sound; the loud crystal is *their* medium), so the pit below is doubly yours if
  you stay silent:
  | id | tier | path (x,z) | speed | pause | blind |
  |----|------|-----------|-------|-------|-------|
  | S1 | ledge (ground) | `[(-30,-0.5),(-21,-0.5)]` | 1.0 | 2.0 | yes |
  | S2 | ledge (ground) | `[(-30,-9.5),(-18,-9.5)]` | 1.0 | 2.0 | yes |
- **The bend, spelled out:** every instinct trained in E1–E4 says climb *up* to the
  ledges to get over the void — but up is sunlit crystal owned by sound-hunters.
  The answer is to drop into the pit, cross in shade and silence, and BLINK the one
  gap. LISTEN matters again (your own noise rings on the moss are tiny but the
  Snuffed are right above you). **BLINK 6.5** is exactly enough to clear the hole.
- **Counter:** THE LEDGE-WALKERS (a mistimed climb onto a ledge = lit + within a
  Snuffed's earshot).

### E6 · TEN (resolve) — "THE STACKED JUNCTION"  [NEW — replaces F The Lane]

Fixes Defect 4 (the empty Lane) by making the connector a real vertical puzzle.

- **Sentence:** `SWITCHBACK(descend under a Vesper, ascend past a Snuffed, one
  lit landing) → intended: CLIMB(down+up)+WAIT | alt: BLINK-up+SNEAK, DOUSE the
  landing lamp ; counter: THE PINCH (a watcher on each tier).`
- **Room:** replace the old Lane closet with a compact 8 m × 10 m **vertical
  junction** at `x−3..5 · z−16..−6`. A ground Vesper paces the top, a moss bed
  runs beneath at −2.5, one **lit landing** (a single lamp, dousable) sits between
  the descent and ascent ramps.
- **Vertical layout:** three quick tier-changes in a small box — the "compound
  sentence" that proves E5's lesson stuck.
- **Guards:** one ground Vesper `[(-1,-8),(3,-8)]` speed 1.3, pause 1.2, range 10,
  cone 0.6; the E5 Snuffed S2 wanders to the ascent lip (shared).
- **Counter:** THE PINCH — you cannot solve it on one tier; you must change tiers
  twice while a watcher owns each.

### E7 · KETSU — "THE CONCOURSE CLIMB"  [MODIFIED — from G Concourse]

Fixes Defect 6 (weak ending): the full sentence, spoken once, on the way to the
rift.

- **Sentence:** `FINAL-APPROACH(open moss concourse, one Vesper, a raised rift-
  ledge) → intended: OBSERVE+CLIMB(the rift ramp)+SNEAK | alt: LURE(the Vesper
  with a thrown vial)+SNEAK, BLINK-up to the ledge ; counter: THE LAST WARDEN.`
- **Room:** Concourse `x−34..20 · z−40..−16` (54 m × 24 m), outdoor moss, KEPT.
  **NEW:** the extraction rift is lifted onto a **+2.5 m ledge** at `(-7,-34)`
  reached by a single ramp — a small final climb so the level *ends on its own
  verb.* Delete the dead `fogPatch` call (Defect 5).
- **Guards:** one Vesper `[(-10,-25),(10,-25)]` speed 1.3, pause 1.4 (KEPT).
- **Counter:** THE LAST WARDEN, positioned so the ramp is briefly in its cone —
  you must OBSERVE its loop and CLIMB in the gap, i.e. the whole sentence at once.

### E8 · KETSU (coda) — "THE RIFT"  [KEPT]

- Extraction disc on the raised ledge. HUD (Hush): *"You remember when the lanterns
  did not follow you home."* No guard. Pure exhale.

## 5.4 Pacing map

```
E1 KI      ·  breath      (climb, no threat)          [·]
E2 KI→SHŌ  ·  breath      (fork, choose)              [·]
E3 SHŌ     ·  TENSION     (over the plaza, 6 guards)   [!!!]
E4 SHŌ     ·  release-ish  (forgiving 3-tier alley)    [!]
E5 TEN     ·  TENSION     (invert the tier — the turn) [!!!]
E6 TEN     ·  spike       (compound junction)          [!!]
E7 KETSU   ·  TENSION→out (full sentence)              [!!]
E8 KETSU   ·  breath      (rift)                        [·]
```
Punctuation: two clear breathers (E1–E2, E8) bracket a rising body; E4 is the
deliberate comma after E3's clause so E5's turn hits fresh.

## 5.5 Playtest predictions

- **Ghost (no touch):** E1 climb → E2 up the catwalk → E3 times V5 and uses plank-
  bridge shadow, dropping to moss when needed → E4 stays high in shadow → **E5
  drops into the pit**, silent moss, one blink over the hole → E6 double tier-change
  → E7 climb in the warden's gap. Fully solvable with zero DOUSE/LURE/DEVOUR.
  *Risk:* if E3's V5 loop is too tight, the ghost is forced to DOUSE; **tune V5
  pause up to 1.6 s** if playtests show no shadow window.
- **Distraction:** DOUSE the E3 catwalk lantern to walk past V5; LURE an E5 Snuffed
  off its ledge with a thrown vial to open the pit exit; LURE the E7 warden. Uses
  all 3 vials by E7 — scarcity keeps it honest.
- **Aggressive:** blink-drop DEVOUR on V6 (E4) and the E7 warden. Works, but every
  devour brightens Hush, making E5's ledge-adjacency and E7's cone-gap tighter.
  This is the *pleasant* version of the cost that Mission 7 will weaponise.

## 5.6 Change log

- [KEPT] Hub fork KI; plaza 5-Vesper roster (V1–V4); alley Vespers (re-tiered);
  canal hole + 2 Snuffed; concourse Vesper; extraction; all inscriptions.
- [MODIFIED] Plaza gains an awning catwalk tier + rooftop Vesper V5 (fixes bypass);
  hanging-lantern DOUSE gaps (revives DOUSE); alley gains 3 tiers; **canal inverted
  to a sunken shaded bed with Snuffed moved up to the ledges** (the TEN); rift
  raised onto a ledge (KETSU).
- [NEW] E1 vantage ramp; E2 third (up) throat; E6 stacked junction replacing the
  empty Lane.
- [CUT] The Lane empty closet (F); the dead `fogPatch` in the concourse.

---
---

# MISSION 6 — THE CHANDLERY  (level index 5)

*Focus word: SUN. Time: high noon. Alternating indoor↔outdoor. New engine word:
SUN / directional hard-shadow as a spatial light.*

## 6.1 Diagnosis of the current level

**Current room parse** (from `src/levels/chandlery.js`):

- **D · CHANDLERY HALL** `(x−18..16, z−2..28; crystal sings, molten vats, Pharos
  sweeping, 5 Vespers, dark central spine)` → intended: SNEAK(spine, in Pharos
  gaps)+WAIT | alt: BLINK, DEVOUR ; counter: *Pharos rally + 5 cones + crystal.*
  **KEPT strength** — the ray-traced showpiece.
- **C · UNDERCROFT** `(x−30..−18, z−8..33; moss, 3 blind Snuffed, red torches,
  racks)` → intended: SNEAK+HIDE | alt: LURE, DEVOUR ; counter: *3 sound-hunters
  in the dark.*
- **The "vent" gap** `(east wall, z10..14)` connecting undercroft↔hall →
  `NOISE(nonexistent verb)`. Umbral has **no VENT/crawl verb**; this reads as a
  mechanic that isn't in the language.
- **E · RELIC CHAMBER** `(x−30..16, z−20..−2; obsidian, Light-Heart, 2 Vespers)` →
  intended: SNEAK+take | counter: *2 wardens by the prize.*

**Defects (location · severity):**

1. **Remit: no SUN, no indoor/outdoor** · *whole level* · **High (by design).**
2. **The "vent"** · *hall↔undercroft* · **High.** Uses a verb (VENT/crawl) that is
   explicitly *not* in Umbral's vocabulary. Must be reframed as a legal word.
3. **Dominant strategy: the central spine** · *D* · **Med.** The hall reduces to
   one memorised safe line up the middle; guards rarely intersect it, so the
   set-piece is a corridor in disguise.
4. **DOUSE is fully dead here** · *D* · **Med.** The vats are the light and they
   are not dousable torches; the player's signature verb has nothing to bite — an
   accident today, a *theme* after this redesign.
5. **Pharos role duplicates Spire & Reliquary** · *D* · **Low.** Same "beam sweeps
   a hall you cross." Fine as a signature, but we should give this Pharos a *new*
   partner (the sun) so the room isn't a third copy.
6. **Vestigial `fogPatch` calls** · *C, D* · **Low.**

## 6.2 Design statement

*Teach the one light you cannot switch off.* The Chandlery becomes a building with
its **roof half burned away**: you move indoor↔outdoor↔indoor, and outdoors the
**noon sun (≈78° elevation)** turns open ground into a standing lit zone. Shadows
at noon are **short and hard** (~0.2× height: a 6 m wall casts ~1.3 m of shade),
so hiding outdoors means *hugging north faces and eaves* and CLIMBING onto awnings
to ride the only thin shade — CLIMB conjugated into the service of SUN.

The recontextualisation (the arc's centre): the player reaches for **DOUSE** — the
verb that has always meant "delete this light" — and it does nothing, because the
light is the sky. Defect 4 stops being a bug and becomes the lesson. The Pharos
(temporal, sweeping) and the sun (spatial, fixed) are deliberately paired so the
player must read two *kinds* of light at once, killing the single-spine dominant
strategy (Defect 3).

The "vent" (Defect 2) is reframed as a legal Umbral thing: a **collapsed
window-gap** between the shaded interior and the sunlit courtyard — not a crawl,
just a **doorway in the light-map** you SNEAK through, choosing your moment by the
sun and the Pharos.

## 6.3 Encounter spec (7 beats)

---

### E1 · KI — "THE THRESHOLD"  [MODIFIED — from A Start Hall]

- **Sentence:** `DOORWAY(dark interior → blazing courtyard; the doorframe casts one
  short hard shadow) → intended: OBSERVE(the shade)+WAIT | alt: SNEAK(hug the
  frame's shadow) ; counter: THE NOON GLARE.`
- **Room:** Start hall `x−6..6 · z28..38`, **indoor, shadowed** (roof intact),
  obsidian floor KEPT. The north door opens onto the first sunlit sliver. The KEPT
  extraction disc stays here (you flee back to it). A single hard doorframe shadow
  falls ~1.3 m into the sun outside.
- **Vertical layout:** flat, indoor. Establishes the indoor = safe-shadow baseline
  before the sun is dangerous.
- **Guards:** the KEPT door Vesper `[(-3,30),(3,30)]` speed 1.2, pause 1.4, range 9.
- **Teach:** step to the threshold; the HUD shows the light-meter *spiking to lit*
  the instant Hush's nose crosses into sun, and dropping in the doorframe shade.
  First read of the sun. HUD (Hush): *"They keep one lamp I cannot reach."*

### E2 · SHŌ — "THE COURTYARD OF VATS"  [MODIFIED — from D Hall, exterior half]

- **Sentence:** `SUNLIT-COURT(open lit ground; short wall/eave shade; 1 Vesper
  patrol) → intended: SNEAK(north-face shade)+CLIMB(awning to ride shade) | alt:
  WAIT(let the patrol clear a shaded lane)+SNEAK ; counter: THE PATROL-IN-THE-SUN.`
- **Room:** the eastern half of the old hall becomes a **roofless courtyard**
  `x−2..16 · z−2..28` (18 m × 30 m), **outdoor, noon**. Floor **crystal** KEPT
  (still sings — noise *and* light now stack). The molten vats become
  freestanding, each casting a hard **1.3 m** north-shadow; **awnings at +2.5 m**
  along the north wall cast the only continuous shade lane.
- **Vertical layout:** GROUND (lit crystal) + AWNING (+2.5, the shade highway).
  CLIMB is reused, now in service of reading the sun.
- **Guards:**
  | id | tier | path (x,z) | speed | pause | range | cone |
  |----|------|-----------|-------|-------|-------|------|
  | V1 | ground | `[(-1,25),(14,25)]` | 1.4 | 1.0 | 12 | 0.62 |
  | V2 | ground | `[(14,3),(14,25)]` | 1.4 | 1.0 | 12 | 0.62 |
- **The read:** a lit Hush is only *caught* if a cone crosses it. So the game is
  spatial-timing: stay in the moving jigsaw of vat-shadows and the awning lane,
  and never be lit when V1/V2's cone points your way. DOUSE does nothing to the
  sun (first proof). **A dead-end temptation:** a single **dousable lamp** by the
  door — dousing it changes nothing about the courtyard, quietly teaching "not
  every light is yours."
- **Counter:** THE PATROL-IN-THE-SUN (cones sweeping a fully-lit floor — no lamp
  pools to predict them by; you predict by their *route*, i.e. OBSERVE).

### E3 · SHŌ — "BACK INDOORS: THE RENDERING NAVE"  [MODIFIED — from D Hall, interior half]

- **Sentence:** `PHAROS-HALL(roofed, shadowed, crystal; Pharos sweeps; 3 Vespers)
  → intended: SNEAK(shadow, in beam gaps)+WAIT | alt: BLINK a lit segment,
  DEVOUR(a Vesper in a dark bay) ; counter: THE SWEEPING EYE.`
- **Room:** the western half stays **indoor and roofed** `x−18..−2 · z−2..28`,
  crystal floor KEPT, the KEPT bleeding-rack pillars shadowing bays. The **Pharos**
  is KEPT in the north wall: `greatEye(-10,-1.6, dir π/2, sweep 0.85, sweepSpeed
  0.45, range 24, cone 0.24, height 3.4)`.
- **Vertical layout:** flat indoor — a deliberate contrast beat: no sun here, the
  danger is the *temporal* light. The player feels the two light-kinds back to
  back (E2 spatial sun / E3 temporal beam).
- **Guards:** 3 Vespers `[(-8,25),(-8,3)]`, `[(-14,14),(-6,14)]`, `[(-4,25),(-4,3)]`
  (a subset of the KEPT roster; **tune** counts to keep it a comma, not a climax).
- **The window-gap (fixes Defect 2):** the wall between E2 courtyard and E3 nave
  has a **collapsed window** at `z14` — a doorway in the light-map, sunlit on the
  courtyard side, shadow on the nave side. You SNEAK through it choosing your moment
  by *both* lights. No crawl/vent verb — it is just a door you read.
- **Counter:** THE SWEEPING EYE.

### E4 · TEN — "THE ROOFLESS NAVE"  [NEW — the recontextualisation]

**The turn: the room where sun AND Pharos both fall from above, and DOUSE is
proven useless — the only shade is what structures *cast*, and at noon that is
almost nothing.**

- **Sentence:** `DOUBLE-LIT-HALL(noon sun through a burned roof + Pharos beam;
  shade only in the lee of vat-stacks; short and shifting as the beam moves) →
  intended: CLIMB(into a structure's lee)+WAIT(the beam)+BLINK | alt: LURE(throw a
  vial to pull a Vesper out of your one shaded bay)+SNEAK ; counter: NOWHERE TO
  DOUSE.`
- **Room:** a 20 m × 14 m hall `x−18..2 · z−20..−6` whose roof is **gone**, so the
  **noon sun** lights the whole floor *and* the KEPT-style **Pharos** rakes it. The
  only shade is the hard north-lee of a few **vat-stacks (+3 m tall)** and one
  **leaning column** — patches ~1.3 m wide that you must CLIMB partly into (stand in
  a doorway-notch at +1.5 m) to fit.
- **Vertical layout:** GROUND lit + micro-ledges (+1.5) in structure-lees. The
  player who tries to "make shadow" by DOUSING finds no lamp to douse — the shade
  is a fixed geometric fact you must *occupy*, not create.
- **Guards:** 2 Vespers patrol the lit floor `[(-14,-10),(-4,-10)]` and
  `[(-10,-8),(-10,-18)]`, speed 1.3, pause 1.2, plus the Pharos.
- **The bend, spelled out:** for five levels light was a switch. Here it is
  weather. You cannot turn it off; you can only stand where the world already
  turned it off, and time the one moving light (the beam) that briefly darkens a
  strip as it passes. LURE still works (pull a Vesper off your one shaded notch);
  DOUSE explicitly does not.
- **Counter:** NOWHERE TO DOUSE (the named absence — the room *is* the lesson).

### E5 · TEN (resolve) — "THE LIGHT-HEART IN THE SHAFT"  [MODIFIED — from E Relic Chamber]

- **Sentence:** `RELIC-IN-LIGHT(the Light-Heart sits in a noon sun-shaft from a
  skylight oculus; you cannot shadow it; 2 wardens) → intended: OBSERVE(the sweep +
  warden gap)+SNEAK(grab-and-go, accept exposure) | alt: DOUSE the two flanking
  lamps to darken the approach (but never the shaft), BLINK out ; counter: THE
  OCULUS.`
- **Room:** relic chamber `x−30..16 · z−20..−2`, KEPT footprint, now **indoor with
  a round skylight** dropping a **3 m sun-shaft** straight onto the KEPT
  `scepterPedestal(0,-11)` = the **Light-Heart**. The shaft is un-shadowable — the
  relic is *in the enemy's light.*
- **Guards:** 2 Vespers KEPT `[(-6,-8),(6,-8)]`, `[(-20,-12),(-10,-16)]`.
- **The bend:** every prior relic could be approached from shadow. This one sits in
  a pillar of the very light you cannot douse — the arc's thesis made physical.
  DOUSE can darken the *approach* (the two flanking lamps *are* dousable, unlike the
  sun), but the last two metres are lit; you must accept exposure and time it. This
  is where DOUSE gets a small dignity back — it can shape the road, never the sky.
- **Counter:** THE OCULUS (the light on the prize itself).

### E6 · KETSU — "THE HALL WAKES"  [KEPT logic, MODIFIED route]

- **Sentence:** `BEACON-FLIGHT(take the Light-Heart → the hall wakes, guardSpeed
  ×1.35 → flee to the start-hall rift, now a blazing beacon) → intended:
  CLIMB+SNEAK the shade-map in reverse | alt: BLINK the sunlit gaps ; counter: THE
  ROUSED CHANDLERY.`
- **Room:** reverse the E5→E2→E1 route back to the extraction at the start hall.
  KEPT `onAlarm` (speed ×1.35, alarm sfx, "the hall wakes"). **The twist:** as a
  lit beacon you can no longer hide in shade *anyway* — so the shade-map you spent
  the level learning becomes a **speed map** (shortest lit-exposure line), not a
  hide map. Pure outrun.
- **Counter:** THE ROUSED CHANDLERY (every Vesper + Pharos converging).

### E7 · KETSU (coda) — "THE THRESHOLD, LEAVING"  [KEPT]

- Extraction at the start hall. HUD (Hush): *"Every wick in Lanternspire drinks a
  stolen dusk. I am taking one back."*

## 6.4 Pacing map

```
E1 KI      ·  breath    (read the sun, safe)          [·]
E2 SHŌ     ·  TENSION   (sunlit courtyard)            [!!]
E3 SHŌ     ·  spike     (indoor Pharos contrast)      [!!]
E4 TEN     ·  CLIMAX    (roofless, no douse — turn)   [!!!]
E5 TEN     ·  spike     (relic in the shaft)          [!!]
E6 KETSU   ·  TENSION→out (beacon outrun)             [!!!]
E7 KETSU   ·  breath    (leave)                        [·]
```
Indoor↔outdoor alternation *is* the punctuation: E1 in, E2 out, E3 in, E4 out
(roofless), E5 in, E6 mixed. The player breathes on every threshold.

## 6.5 Playtest predictions

- **Ghost:** E1 read the frame-shadow → E2 north-face + awning shade, timing the two
  patrols → E3 beam-gap the nave, through the window-gap → E4 occupy a vat-lee, time
  the beam → E5 accept the shaft exposure, grab in the warden gap → E6 outrun.
  Solvable with zero devour; **DOUSE never required and often useless** — the
  intended feeling.
- **Distraction:** LURE a Vesper off the E4 shaded notch; DOUSE the E5 flanking
  lamps to blacken the approach. Notably, a distraction player who *relies* on DOUSE
  hits a wall in E2/E4 and must adapt — the level actively retrains them.
- **Aggressive:** DEVOUR a Vesper in an E3 dark bay (safe, roofed). Try it in the
  E2/E4 sun and you're lit mid-devour — punished by the sun, not by RELIEVE yet.
  This teaches "devour wants shadow," setting up Mission 7.

## 6.6 Change log

- [KEPT] Pharos in the nave; molten-vat showpiece aesthetic; relic pedestal;
  onAlarm beacon logic; extraction at start; Snuffed undercroft available as an
  optional ghost lane (**re-use the old C undercroft as a fully-shaded alt route to
  E5** for players who refuse the sun — preserves the two-roads identity).
- [MODIFIED] East hall → roofless sunlit courtyard (E2); relic gains a sun-shaft
  oculus (E5); the "vent" → a legible window-gap in the light-map (E3).
- [NEW] E4 roofless nave (the TEN); awning shade-tiers; the sun as a light source.
- [CUT] The "vent"/crawl concept; dead `fogPatch` calls.

---
---

# MISSION 7 — THE SPIRE ASCENT  (level index 6)

*Focus word: RELIEVE. Time: afternoon. Outdoor vertical climb. New engine word:
**RELIEVE / MISSING-WATCH — PENDING AUTHOR APPROVAL.** Used in this one level
only, as its single new word.*

> **AUTHOR SIGN-OFF REQUIRED.** RELIEVE introduces social/timed guard behaviour
> (patrols react to a *missing* colleague). If rejected, Mission 7 falls back to
> its current identity with the daytime/afternoon-sun reskin only, and the arc's
> devour-counter is deferred. Everything below is written so RELIEVE can be lifted
> out cleanly.

## 7.1 Diagnosis of the current level

**Current room parse** (from `src/levels/spire.js`):

- **B/C · OUTER vs INNER STAIR** `(bright sighted-Vesper stair vs dark Snuffed
  stair)` → intended: (outer) SNEAK+WAIT | (inner) LISTEN+SNEAK ; counter: *lit &
  watched vs blind & silent.* **KEPT strength** — real braided routes, real
  verticality.
- **D · CONVERGENCE COURTYARD** `(moss/obsidian/crystal bands, 4 guards incl. a
  Snuffed, 2 pillars)` → intended: SNEAK+HIDE | alt: DEVOUR, LURE ; counter: *a
  guard on every band.*
- **E · THE BRIDGE** `(thin spar over true void, Pharos rakes it)` → intended:
  BLINK/SNEAK+WAIT(the beam) ; counter: *the eye over the abyss.* **KEPT strength**
  — an excellent existing TEN.
- **F/G · UPPER TERRACE + SUMMIT** → intended: SNEAK+extract ; counter: *last
  wardens.*

**Defects (location · severity):**

1. **DEVOUR is a consequence-free dominant strategy** · *B, D, F* · **High.** Maw
   motes + no witnesses + no body = the aggressive player simply eats the sighted
   Vespers up the whole spire. Nothing pushes back. This is precisely the hole
   RELIEVE is designed to fill.
2. **Bright/dark binary is now third-hand** · *B/C* · **Med.** "Blazing watched
   stair vs black silent stair" is the same fork as Lantern-Ways and Reliquary.
   Needs a new axis (relief timing) to feel distinct.
3. **Vestigial `fogPatch`** · *C, D, E* · **Low.**
4. **Remit: needs the afternoon-sun daytime reskin** · *whole level* · **Med.**

## 7.2 Design statement

*Give DEVOUR a bill.* Hush arrives on the Spire "larger, slower to tire" — flush
with accumulated power and every incentive to eat their way up. RELIEVE makes the
*absence* a devoured guard leaves behind into the alarm: paired and rostered
Vespers expect to meet, nod, and relieve each other on a schedule; a Vesper who
reaches a rendezvous and finds **no partner**, or a post that goes **unrelieved**
past its timer, RAISES-ALARM. Because devour leaves no body, the player cannot
hide the crime — they can only *out-time* it (get past the rendezvous window
before the miss is noticed) or *avoid eating linked guards at all.*

Crucially, RELIEVE is taught as a *readable social pattern*, so it rewards
OBSERVE, the arc's quietest verb. Snuffed remain blind loners (unrostered), so the
inner stair stays a **safe devour outlet** — teaching *where* eating is free vs
billed, which is more interesting than a blanket nerf.

Afternoon sun (**≈30° elevation, from the west**) rakes long hard shadows east
across every terrace — the L6 spatial-sun read, now conjugated with the spire's
verticality and the new RELIEVE timing. Three lights at once by the bridge:
sun (spatial), Pharos (temporal), and the *social clock* of the relief roster.

## 7.3 The RELIEVE mechanic (builder spec)

Assumed additions to a guard spec (**all tune**):

- `link: "postA"` — guards sharing a link id form a **relief pair/roster**.
- `rendezvous: {x, z, every: 14}` — they are scheduled to both be at/near this
  point every 14 s (their loops are phase-set so they meet there).
- `noticeDelay: 4` — if, at a scheduled rendezvous, a linked partner is **absent**
  (devoured, or dragged out of position by a long LURE), the present guard enters
  **SUSPECT** for `noticeDelay` seconds, walking to the partner's last-known post;
  if the partner is still missing at the end, it **RAISES-ALARM** (Pharos-style
  rally of the local group, not the whole map).
- `postUnrelieved: 8` — a static "post" waypoint that must be re-manned by the
  roster every `every` seconds; if a devour leaves it unmanned past
  `postUnrelieved`, the roster RAISES-ALARM. (This is the E4 time-bomb.)

**Telegraphing (essential for fairness):** linked guards show a faint **violet-safe
amber tether line** between partners when both are alive and a small "meeting"
animation at each rendezvous. When a partner goes missing, the survivor's lamp
flicks **amber→orange** and a countdown ring appears over the rendezvous point.
The player must be able to *see the clock they are racing.*

## 7.4 Encounter spec (6 beats)

---

### E1 · KI — "THE PAIRED WATCH"  [MODIFIED — from A Foot of the Spire]

- **Sentence:** `TAUGHT-PAIR(two linked Vespers meet at a rendezvous, nod, part) →
  intended: OBSERVE(the pairing)+SNEAK | alt: WAIT+SNEAK ; counter: THE FIRST
  MISSING-WATCH.`
- **Room:** foot terrace `x−13..13 · z66..80`, outdoor, afternoon, obsidian KEPT.
  Long west-sun shadow from the east wall gives a safe east-side lane.
- **Vertical layout:** flat start terrace; the two stair-mouths (kept) rise from
  its north wall.
- **Guards (the teaching pair):**
  | id | link | path (x,z) | rendezvous | every | speed | pause | range | cone |
  |----|------|-----------|-----------|-------|-------|-------|-------|------|
  | V1 | footwatch | `[(-6,73),(0,72)]` | (0,72) | 12 s | 1.3 | 1.2 | 11 | 0.6 |
  | V2 | footwatch | `[(6,73),(0,72)]` | (0,72) | 12 s | 1.3 | 1.2 | 11 | 0.6 |
- **Teach:** the tether line and the meeting are shown with no threat pressure. If
  the player devours V1 here (a maw mote is placed to tempt it), V2 reaches (0,72),
  the countdown ring appears, and unless the player is past the north mouth within
  `noticeDelay 4 s`, V2 rallies — a **loud, survivable first lesson.** HUD (Hush):
  *"They keep each other. Eat one and the other goes looking."*

### E2 · SHŌ — "THE OUTER STAIR, WATCHED & PAIRED"  [MODIFIED — from B Outer Stair]

- **Sentence:** `LIT-STAIR(west-sun blaze on the treads; a linked pair climbing) →
  intended: SNEAK(east-wall shadow)+OBSERVE(the rendezvous window) | alt: WAIT for
  the meeting to pass then climb, BLINK a lit landing ; counter: THE SUN ON THE
  STAIR + THE ROSTER.`
- **Room:** outer stair `x9..13 · z38..66`, outdoor. **Afternoon sun** makes the
  west-facing treads blaze (lit); the east parapet casts a ~1.7× shadow lane you
  hug. KEPT torches become *redundant* by day (leave 1 as a dusk-foreshadow ember).
- **Vertical layout:** the climb proper — a long ascending shade-lane beside a lit
  one. CLIMB + SUN together.
- **Guards:** a linked pair patrolling the stair:
  | id | link | path (x,z) | rendezvous | every | speed | pause | range | cone |
  |----|------|-----------|-----------|-------|-------|-------|-------|------|
  | V3 | outerA | `[(11,42),(11,54)]` | (11,54) | 14 s | 1.5 | 1.0 | 12 | 0.6 |
  | V4 | outerA | `[(11,62),(11,54)]` | (11,54) | 14 s | 1.4 | 1.1 | 12 | 0.6 |
- **The tension:** devour is *right there* and the shade-lane is narrow. Eating V3
  starts the roster clock mid-climb — you must summit the stair before V4 notices.
  Or don't eat, and simply time the rendezvous gap.
- **Counter:** THE SUN ON THE STAIR (spatial), THE ROSTER (social clock).

### E3 · SHŌ — "THE INNER STAIR, BLIND & LONELY"  [MODIFIED — from C Inner Stair]

- **Sentence:** `DARK-STAIR(dead lamps, 2 blind Snuffed, unlinked) → intended:
  LISTEN+SNEAK(moss) | alt: DEVOUR(a Snuffed — SAFE here, no roster) ; counter: THE
  SILENCE THAT HEARS.`
- **Room:** inner stair `x−13..−9 · z38..66`, outdoor but in the spire's own deep
  west-sun shadow (the mountain mass blocks the low sun) — permanently shaded, moss
  floor KEPT.
- **Vertical layout:** the parallel climb; a ghost/quiet route.
- **Guards:** 2 **Snuffed**, blind, **unlinked** `[(-11,42),(-11,62)]`,
  `[(-12,48),(-10,58)]`, speed 1.0/0.95, pause 2.0/2.2.
- **The teaching contrast (fixes Defect 2):** this is the *safe* place to DEVOUR —
  loners with no roster leave no missing-watch. The level explicitly offers eating
  as a reward on one route and bills it on the other, so the bright/dark fork is now
  about *where devour is free*, a genuinely new axis.
- **Counter:** THE SILENCE THAT HEARS (Snuffed hunt your noise rings; devour lunges
  make a sound — LISTEN first).

### E4 · TEN — "THE CONVERGENCE ROSTER"  [MODIFIED — from D Courtyard]  *(the recontextualisation)*

**The turn: so far a missing guard was noticed by a *partner*. Here the missing
guard is a missing *shift* — an empty post is the alarm, even with no one around to
witness it. Absence itself becomes the sentinel.**

- **Sentence:** `RELIEF-ROSTER(3 Vespers rotate: one always off to a guardroom while
  another arrives to man a post; the post must be re-manned every cycle) →
  intended: OBSERVE(the rotation)+SNEAK(cross during a hand-off) | alt: LURE(delay a
  reliever so the roster self-jams, opening a gap)+CLIMB, DEVOUR(only if you can
  clear the post before postUnrelieved) ; counter: THE UNRELIEVED POST.`
- **Room:** convergence courtyard `x−13..13 · z24..38`, outdoor. KEPT
  moss/obsidian/crystal bands. **NEW:** a raised **guardroom balcony at +2.5 m** on
  the east (where the "off" guard retires) and a **manned post** at the north
  bridge-gate `(0,25)` that the roster keeps filled. Long west-sun shadow across the
  moss band gives the ghost lane.
- **Vertical layout:** GROUND bands + a +2.5 guardroom balcony (a reliever descends a
  ramp each cycle — a guard arriving *from above*).
- **Guards (rostered trio):**
  | id | link | role | path (x,z) | every | postUnrelieved | speed | pause |
  |----|------|------|-----------|-------|----------------|-------|-------|
  | V5 | gate | mans post (0,25) | `[(0,25),(-6,31)]` | 10 s | 8 s | 1.4 | 1.0 |
  | V6 | gate | reliever | `[(8,27)balcony,(0,25)]` | 10 s | — | 1.5 | 0.9 |
  | V7 | gate | off-shift | `[(0,25),(8,35)balcony]` | 10 s | — | 1.3 | 1.1 |
  Plus one KEPT **Snuffed** on the moss band `[(-10,28),(-6,34)]` (unlinked, the safe
  devour if you must).
- **The bend, spelled out:** the player's trained fix for RELIEVE ("get past the
  rendezvous before the partner notices") fails here, because there is no partner to
  outrun — there is a *post* that notices its own emptiness. Devouring the gate-manner
  V5 starts `postUnrelieved 8 s`; you must be through the bridge-gate and out of the
  local rally radius before the roster registers the empty post. The subtler answer
  is to LURE the reliever V6 off its ramp so the roster **jams itself** (nobody mans
  the post *legitimately*), opening a clean hand-off gap you SNEAK through — using
  their own procedure against them. TEN: the empty space is the threat.
- **Counter:** THE UNRELIEVED POST (absence as alarm).

### E5 · TEN — "THE BRIDGE"  [KEPT — under new time pressure]

- **Sentence:** `ABYSS-CROSSING(thin spar over void, Pharos rakes it) → intended:
  WAIT(the beam)+SNEAK/BLINK the spar | alt: BLINK the far gap ; counter: THE EYE
  OVER NOTHING (+ any roster clock you started in E4).`
- **Room:** the bridge `x−13..13 · z8..24`, KEPT geometry (spar `x−2..2`, void both
  sides, tall canyon walls, `greatEye(0,7.6,...)` KEPT).
- **Vertical layout:** the void crossing — verticality as *threat below* (a fall),
  the opposite of a hide-tier. A deliberate palate-cleanse: no RELIEVE here (nowhere
  to stand a post), pure Pharos timing — *unless* you arrive with an E4 roster alarm
  ticking, in which case the beam-wait becomes a genuine dilemma. This is why E4's
  clock and E5's patience are adjacent: the level makes you choose between eating
  fast and crossing calm.
- **Counter:** THE EYE OVER NOTHING.

### E6 · KETSU — "THE SUMMIT"  [MODIFIED — from F/G]

- **Sentence:** `FINAL-FUNNEL(upper terrace + summit, one last linked pair, the
  rift) → intended: OBSERVE(the last pair)+CLIMB+SNEAK | alt: LURE+BLINK, DEVOUR
  only if you can clear before the miss ; counter: THE LAST RELIEF.`
- **Room:** upper terrace `x−13..13 · z−6..8` + summit `x−9..9 · z−22..−6`, KEPT,
  outdoor. Long west-sun shadow gives a final shade lane; KEPT pillars. The rift on
  the summit, KEPT.
- **Guards:** one last linked pair `link:"summit"` `[(-9,-1.5),(0,1)]` /
  `[(9,-1.5),(0,1)]`, rendezvous (0,1) every 12 s — the sentence spoken once more,
  now that the player fully reads it.
- **Counter:** THE LAST RELIEF.
- HUD (Hush): *"Almost the whole of me again."*

## 7.5 Pacing map

```
E1 KI    ·  breath   (learn the pair, safe)        [·]
E2 SHŌ   ·  TENSION  (sun stair + roster clock)    [!!]
E3 SHŌ   ·  release  (dark stair, safe devour)     [!]
E4 TEN   ·  CLIMAX   (unrelieved post — the turn)  [!!!]
E5 TEN   ·  spike    (Pharos bridge, held breath)  [!!!]
E6 KETSU ·  out      (last pair, summit)           [!!]
```
E3 is the intentional exhale between the roster-heavy E2 and the roster-climax E4.
E5 immediately after E4 is the double-TEN the spire already earned — kept.

## 7.6 Playtest predictions

- **Ghost:** never eats; reads every tether and rotation, crosses on hand-offs and
  beam-gaps, hugs west-sun shadow lanes. Fully solvable — RELIEVE *rewards* the
  ghost most (OBSERVE is their native verb). Verify a no-devour line exists through
  E4 (the LURE-jam or the plain hand-off gap must both work).
- **Distraction:** LUREs the E4 reliever to jam the roster; LUREs the E6 pair apart.
  The strongest archetype on this level — its verbs *are* the intended answer to
  RELIEVE.
- **Aggressive:** wants to eat the whole spire. Now billed: E1 teaches the miss, E2
  forces a race, E4 punishes a devoured post outright. **Safe outlet preserved** on
  the E3 inner stair (loner Snuffed). Predicted behaviour: aggressive players learn
  to *bank* devours for the inner stair and the E4 Snuffed, and go stealth on the
  linked pairs — exactly the intended re-education. **Tune** `noticeDelay`/
  `postUnrelieved` up if playtests show the race is unwinnable, down if devour-spam
  survives.

## 7.7 Change log

- [KEPT] Braided outer/inner stairs; the Pharos bridge (E5); summit rift; growth +
  blink grants; mountain-mass core geometry.
- [MODIFIED] Every sighted-Vesper group becomes a linked pair/roster; afternoon-sun
  shadow lanes replace night contrast; courtyard gains a guardroom balcony + manned
  post (the TEN); inner stair reframed as the safe-devour route.
- [NEW] RELIEVE/MISSING-WATCH mechanic *(pending approval)*; tether/countdown
  telegraphing; E4 unrelieved-post time-bomb.
- [CUT] Consequence-free devour dominance; dead `fogPatch` calls.

---
---

# MISSION 8 — THE RELIQUARY  (level index 7)  — FINALE / EXAM

*Focus: THE FULL SENTENCE. Time: dusk → dark. Outdoor down into deep indoor. **No
new word** — integration only. The relic is the First Ember; taking it is the
story's Turn.*

## 8.1 Diagnosis of the current level

**Current room parse** (from `src/levels/vault.js`):

- **C · GREAT COURTYARD** `(crystal sings, Pharos, 5 Vespers, cover blocks/pillars)`
  → intended: SNEAK(in beam gaps, behind cover)+WAIT | alt: BLINK, DEVOUR ; counter:
  *Pharos + 5 cones on singing floor.* — the tempting death.
- **CELLAR** `(moss, 2 dozing keepers + 1 blind Snuffed, racks, inscriptions)` →
  intended: SNEAK+HIDE | alt: LURE, DEVOUR ; counter: *the deep dark.* — the kind
  road; *the place Hush was born.*
- **D · RELIQUARY** `(crystal, First Ember, 1 Vesper)` → take → beacon flight.

**Defects (location · severity):**

1. **Remit: must become the exam** · *whole level* · **High (by design).** Currently
   it is a strong stealth level but it quizzes only the night vocabulary; the finale
   of this arc must demand CLIMB, SUN, and RELIEVE too.
2. **Flat / no verticality** · *whole level* · **Med.** The finale of a verticality
   arc should climax in 3-D.
3. **Vestigial `fogPatch`** · *cellar* · **Low.**
4. **The beacon flight is short and flat** · *post-Ember* · **Med.** The KETSU of the
   *entire campaign* deserves a vertical outrun, not a straight dash.

## 8.2 Design statement

*Spell the whole sentence, then let the world speak it back.* No new word — every
room re-asks one the player has learned, in order, then the finale fuses them. Dusk
is the engine of the finale's meaning: as the mission runs, **the sun sets** (a
*moving* spatial light — the ultimate SUN conjugation, the L6 read now animated) and
**the Vigil's lamps come on** (handing DOUSE back exactly as SUN leaves). By the
time Hush reaches the Ember, the sun is gone and the city is all lamplight — and
taking the Ember guts every lamp at once (Beat 4, the Turn). The player *feels* the
two light-systems cross over in real time.

The exam structure: E1 quizzes CLIMB, E2 quizzes SUN, E3 quizzes RELIEVE, E4 is the
recontextualising TEN (a room with *no light to read at all* — the birthplace),
E5 is the Ember/Turn, E6 is the vertical beacon KETSU.

## 8.3 Encounter spec (6 beats)

---

### E1 · KI — "THE DESCENT" (quizzes CLIMB)  [MODIFIED — from A Start Hall]

- **Sentence:** `VERTICAL-ENTRY(a sunset-lit upper court; ramps down into shadow; the
  side-door pit KEPT) → intended: CLIMB-down+SNEAK | alt: BLINK-down, SNEAK the
  ground lane ; counter: THE LONG DUSK SHADOW (shrinking as the sun drops).`
- **Room:** start hall `x−7..7 · z26..34` KEPT + **NEW raised entry court at +2.5 m**
  overlooking it. Outdoor, **dusk** (sun ≈18° and falling). The KEPT side-door pit
  (`hole (-14..-12, 28.6..31)`) and the KEPT extraction disc stay. Long east-cast
  dusk shadows — but they *shorten and shift* as the sun sets over the mission
  (subtle here, dramatic by E6).
- **Vertical layout:** +2.5 entry court → GROUND hall → the pit (a −tier) to the
  cellar. Re-asks CLIMB (up-court, down-pit) immediately.
- **Guards:** the KEPT start Vesper `[(-3.5,28.5),(3.5,28.5)]` speed 1.2, pause 1.6,
  range 11.
- HUD (Hush): *"You remember being larger."* (KEPT.)

### E2 · SHŌ — "THE SUNSET COURTYARD" (quizzes SUN)  [MODIFIED — from C Courtyard]

- **Sentence:** `SETTING-SUN-COURT(crystal court, Pharos, sighted Vespers; long west
  shadows that shorten as the sun sets) → intended: OBSERVE(sun + beam)+SNEAK(shade)
  +WAIT | alt: CLIMB a colonnade ledge to ride shade, DOUSE a just-lit lamp ;
  counter: THE FAILING LIGHT (your shade lanes are moving).`
- **Room:** great courtyard `x−13..13 · z−6..14` KEPT crystal + KEPT Pharos
  `greatEye(0,-6.4, sweep 0.8, sweepSpeed 0.5, range 19, cone 0.26)`. **NEW:** a
  **colonnade at +2.5 m** on the west casts the main shade lane; as the sun sets the
  lane **widens then vanishes** (whole court falls into shade near E5), while lamps
  begin lighting. This is the L6 sun-read *animated* — the exam's hardest reading.
- **Vertical layout:** GROUND crystal + colonnade shade-ledge. CLIMB + SUN fused.
- **Guards:** a subset of the KEPT 5-Vesper roster (**tune** to 3 for pacing):
  `[(-10,-2),(-10,11),(10,11),(10,-2)]`, `[(-7,1),(7,1)]`, `[(0,-3),(0,10)]`.
- **Counter:** THE FAILING LIGHT (shade lanes shift under your feet as the sun
  drops — you cannot memorise them; you must keep reading).

### E3 · SHŌ — "THE RELIEVED GATE" (quizzes RELIEVE)  [NEW — inserted before the cellar]

- **Sentence:** `ROSTERED-DESCENT(a linked pair + a manned post guarding the side-
  door stair down) → intended: OBSERVE(the rotation)+SNEAK(a hand-off) | alt: LURE
  the reliever to jam it, DEVOUR only if you clear the post in time ; counter: THE
  UNRELIEVED STAIR.`
- **Room:** the KEPT side-door stair `x−13..−7 · z28..32` + its landing, now guarded
  by a rostered pair (link `"stair"`, rendezvous at the stair-head, every 12 s,
  postUnrelieved 8 s). Dusk shadow covers the approach.
- **Vertical layout:** the transition tier (ground → pit → cellar). RELIEVE re-asked
  right at the mouth of the descent, so the player must pass the exam's third word to
  reach the birthplace.
- **Guards:** pair as in Mission 7's spec (reuse the mechanic; **omit entirely if
  RELIEVE is not approved** — fall back to the KEPT single side-door Vesper).
- **Counter:** THE UNRELIEVED STAIR.

### E4 · TEN — "THE BLEEDING CELLAR" (recontextualisation)  [MODIFIED — from Cellar]

**The turn: after four missions of *reading light*, the climax room has NO light to
read. In the pit where Hush was rendered, there is only sound, memory, and the dark
Hush is made of. The exam's hardest question is the one with no light in it.**

- **Sentence:** `LIGHTLESS-DEPTH(near-black moss undercroft; a blind Snuffed; the
  inscriptions of Hush's birth; no sun, no beam, no lamps) → intended: LISTEN+SNEAK
  | alt: DEVOUR(the Snuffed — safe, unlinked), LURE ; counter: THE DARK THAT
  REMEMBERS.`
- **Room:** the KEPT cellar `x−24..−13, z−18..32` (upper + lower + rear passage),
  moss, KEPT 8-line birth inscription sequence, KEPT racks. Delete the dead
  `fogPatch` calls. **Deliberately unlit** — the one room the light-verbs cannot
  touch, so the player falls back to the arc's *quietest* verbs (LISTEN, SNEAK) in
  the story's most intimate space.
- **Vertical layout:** flat and deep — verticality *rests* here on purpose, a held
  low note before the vertical finale. (Keep it flat; the contrast makes E6's climb
  soar.)
- **Guards:** KEPT — 2 dozing keepers (slow, sleepy) + 1 blind **Snuffed** in the
  deep cellar (`[(-20,-2),(-16,-10),(-20,-14)]`).
- **Counter:** THE DARK THAT REMEMBERS. HUD (Hush, at the last inscription): *"It was
  never finished. It was only sleeping."* (KEPT lore.)

### E5 · TEN (resolve) — "THE FIRST EMBER / THE TURN"  [MODIFIED — from D Reliquary]

- **Sentence:** `THE-RELIC(the First Ember on its pedestal; the sun now fully set,
  every lamp at max blaze — the Vigil's last stand of light) → intended:
  OBSERVE(the final warden + last beam)+SNEAK+take | alt: DOUSE the flanking lamps
  (now that lamps are back!), BLINK in ; counter: THE VIGIL'S LAST BLAZE.`
- **Room:** reliquary chamber `x−9..9 · z−18..−6` KEPT, crystal, KEPT
  `scepterPedestal(0,-12)` = **First Ember**. **NEW dusk logic:** the sun has set, so
  the room is now pure lamplight — and **DOUSE is fully alive again** (the arc's
  bookend: the verb the daytime took away is handed back for the finale). The KEPT
  warden `[(-5,-14),(5,-14)]`.
- **The bend:** the finale gives the player their oldest verb back at the last
  moment — a small mercy and a thesis statement: light was always a switch; the sun
  was the exception; now the exception is gone.
- **On take (KEPT `onAlarm`, extended):** the Ember blazes, Hush is fast (speed
  ×1.35). **NEW:** every lamp in the level flares then begins **guttering out** over
  the escape — the fuel is leaving (Beat 4). HUD (KEPT): *"Every lamp is your own
  light — take it home."*
- **Counter:** THE VIGIL'S LAST BLAZE.

### E6 · KETSU — "THE BEACON CLIMB"  [MODIFIED — from the flight]  *(campaign KETSU)*

**The whole arc's sentence, spoken back to the city.** As a lit beacon Hush can no
longer hide — so every verb the player learned to use *for concealment* is re-tasked
*for speed and defiance.*

- **Sentence:** `BEACON-OUTRUN(you are the light; the sun is gone; the lamps die
  around you; a vertical climb-and-drop route back to the rift; the roused vault +
  a final RELIEVE swarm behind) → intended: CLIMB(ramps/drops for speed)+BLINK the
  gaps+SNEAK the dying dark | alt: LURE/DOUSE to buy a beat ; counter: THE DYING
  CITADEL.`
- **Room:** a **vertical escape** back up through the courtyard and out — reuse the
  E1 raised court and E2 colonnade as a **climb-and-drop speed route** (ramps up,
  blink-drops down), the KEPT extraction disc at the start hall as the finish.
- **Vertical layout:** the campaign's fullest vertical run — the verticality arc
  climaxing in motion. As lamps gutter out room by room, the *dark itself spreads*
  behind the fleeing beacon (the world going home).
- **Counter:** THE DYING CITADEL (Pharos screaming, Vespers guttering, any roster you
  provoked swarming — but each lamp that dies removes a hunter, so the run gets
  *darker and safer* the closer you get, a KETSU that resolves toward peace).
- **Last image (KEPT lore):** a dark city, silent, two violet eyes moving away —
  sated, whole, enormous.

## 8.4 Pacing map

```
E1 KI    ·  breath   (descent, quiz CLIMB)          [·]
E2 SHŌ   ·  TENSION  (setting-sun court, quiz SUN)  [!!]
E3 SHŌ   ·  spike    (relieved gate, quiz RELIEVE)  [!!]
E4 TEN   ·  CLIMAX-quiet (lightless birthplace)     [!!! low]
E5 TEN   ·  spike    (the Ember / the Turn)         [!!!]
E6 KETSU ·  release-in-motion (beacon climb)        [!!!→ · ]
```
Note E4 is a *quiet* climax — the arc's boldest pacing move: the loudest emotional
beat is the darkest, stillest room. E6 then resolves the whole campaign from maximum
intensity *down* to silence as the city goes dark — the only KETSU that ends softer
than it began, because the story's win is an extinguishing.

## 8.5 Playtest predictions

- **Ghost:** CLIMB down (E1) → ride the shrinking colonnade shade (E2) → hand-off the
  relieved gate (E3) → LISTEN through the black cellar (E4) → time the last warden for
  the Ember (E5) → beacon-climb out (E6). A ghost who reached here has every verb;
  the exam should feel like a victory lap with teeth. **Verify** the E2 shade lane
  never fully vanishes *before* the player can reasonably cross (**tune** sun-set
  rate to the median clear time).
- **Distraction:** DOUSE returns as a real tool in E5; LURE jams the E3 roster and
  buys beats in E6. A distraction main who felt starved of DOUSE in Missions 6–7 gets
  a cathartic payoff.
- **Aggressive:** safe devour on the E4 Snuffed and dozing keepers; billed on the E3
  roster. In E6 the beacon can't stealth anyway, so aggression finally has a free
  hand — devour anything in the way of the exit. The arc lets the aggressive player
  off the leash exactly at the end, as a reward.

## 8.6 Change log

- [KEPT] Courtyard + Pharos; the birthplace cellar and its full inscription
  sequence; the First Ember pedestal; the side-door pit; onAlarm beacon logic;
  extraction; growth/blink finale grants; the closing image.
- [MODIFIED] Dusk-set sun as a moving spatial light; lamps relight as the sun sets
  (DOUSE handed back); raised entry court + colonnade shade-ledge (verticality); the
  cellar reframed as the deliberately-lightless TEN; the flight rebuilt as a vertical
  beacon climb.
- [NEW] E3 relieved gate (quizzes RELIEVE — *omit if unapproved*); the animated
  sunset light-crossover; the vertical escape route.
- [CUT] Dead `fogPatch` calls; the flat straight-line flight.

---
---

## APPENDIX A — Arc-wide consistency checklist for the builder

- **One-new-word discipline:** L5 introduces only CLIMB; L6 only SUN; L7 only
  RELIEVE; L8 nothing. If a room seems to need a fifth verb to solve, it is
  over-scoped — cut, don't add.
- **Every encounter has ≥2 valid verb phrases and a NAMED counter-pressure.** If any
  room collapses to a single line in playtest, widen it (usually by adding a tier or
  a shade lane), don't just move a guard.
- **TEN must recontextualise, not just spike:** L5 inverts CLIMB (down = safe); L6
  proves DOUSE impotent (un-dousable sun); L7 makes absence the alarm (unrelieved
  post); L8 removes light entirely (the birthplace). Each TEN changes what an old
  verb *means*, not just how hard it is.
- **Ghost route guaranteed in every level:** verify a full no-DEVOUR, no-DOUSE line
  exists start-to-rift before shipping any level.
- **Palette law:** sun = white-gold (Vigil's light); all Hush UI/eyes/blink/void-vial
  glow stays violet; RELIEVE tethers/countdowns use amber→orange (Vigil social
  signalling), never violet.
- **Delete every `fogPatch` call** encountered (deprecated no-op).
- **The "no VENT/crouch/hack/disguise" rule:** any connector that smells like a crawl
  or a hack must be reframed as a *doorway in the light-map* (a window-gap read by
  sun/beam), never a new traversal verb.

## APPENDIX B — Tunable constants collected (all **tune**)

| Constant | Proposed | Where |
|---|---|---|
| Awareness ramp: calm→suspect / →chase | 0.7 s / 1.6 s | global |
| Cone vertical half-spread / down-tilt | 8° / −5° | global |
| Height tiers | 0 / +2.5 / +5 / −3 m | global |
| Ramp grade / run for +2.5 | 22° / 6.2 m | global |
| Blink range (L5+) | 6.5–7 m, +≤2.6 m vertical | per level, KEPT grants |
| Dawn sun elevation (L5) | 15° (shadows ~3.7× h) | L5 |
| Noon sun elevation (L6) | 78° (shadows ~0.2× h) | L6 |
| Afternoon sun elevation (L7) | 30° (shadows ~1.7× h) | L7 |
| Dusk sun elevation (L8) | 18° → 0° over mission | L8 |
| RELIEVE `every` (rendezvous cycle) | 10–14 s | L7, L8 |
| RELIEVE `noticeDelay` | 4 s | L7, L8 |
| RELIEVE `postUnrelieved` | 8 s | L7 E4, L8 E3 |
| Beacon guard speed mult | ×1.35 (KEPT) | L6, L8 |
| L8 lamp-gutter duration | full escape (~30–45 s) | L8 E6 |
