# UMBRAL — PLACES (the world bible)

*Director document. This is the layer the verb specs (`REDESIGN_1-4.md`,
`REDESIGN_5-8.md`) do not cover, and the reason rebuilt levels have read as
"things randomly placed": those specs parse levels as ENCOUNTERS
(`OBSTACLE → VERB`), so builders produced arrangements of obstacles. This
document makes them produce PLACES. Both documents apply to every level;
where they seem to conflict, the resolution is always: satisfy the verb
grammar WITH the place's own furniture, never with abstract cover.*

**The one-sentence rule: design the site as a real workplace or neighborhood
of the Candent Vigil at the hour its people stepped away — the stealth course
is whatever Hush finds when it crosses that place at night. Nothing in the
level may exist "for the player."**

---

## The Five Laws

### 1. LAW OF PURPOSE — every room has an owner and a job
Before placing anything, write one comment line naming the room:
`// TALLOW STORE — night stock for the dipping gallery; the fat-porter's domain`.
Every prop in that room is then placed where ITS USER would put it, for the
user's convenience. If you cannot say who put a crate there and why, delete
the crate. Corollary: rooms differ because jobs differ — a store-room is
dense and dark, a work-hall is open-floored with light over the benches, a
shrine is symmetric and swept.

### 2. LAW OF LIGHT — lamps serve the inhabitants, never the puzzle
The Vigil lights what it values: gates, shrines, workbenches, junctions,
the relic. Darkness is simply everywhere the Vigil had no reason to pay for
light — store rooms, service alleys, back stairs, ruins. NEVER place or
douse a light "to tune difficulty"; instead move the VALUE the light serves.
Every light source must have a visible fixture (lamp, brazier, sconce,
window-spill). An invisible fill light is a bug (we removed two from M1).
This law is why stealth emerges naturally: the safe route through a real
place is its service side.

### 3. LAW OF CIRCULATION — space connects the way its people move
Deliveries: street → gate → yard → store. Work: entrance → public room →
work floor → private/valuables, with the most guarded thing deepest. Streets
go somewhere (both ends imply more city, per the barredVista motif). No
corridor may exist only to route the player; if a passage has no resident
reason, it is a NOISE finding. Aisles stay clear — workers do not climb over
crates, so cover sits AGAINST walls and BESIDE routes, never confettied
across the working floor. Doors sit where a builder would put doors.

### 4. LAW OF WEAR — the place was used an hour ago
Each site gets 2–4 **tableaux**: small clustered arrangements that each tell
a one-sentence story a player can reconstruct without text. A cart caught
mid-unload with its crates half-stacked. A meal abandoned on a barrel-top.
Chalk tally-marks by the tallow vats. A cot and slippers behind the watch
post. Tableaux go ON or BESIDE the player's likely routes (storytelling
nobody walks past is wasted). Text (`kit.inscription`) stays rare; the
arrangement IS the sentence. Alignment rule: humans square things to walls
and stack them in rows — rotation jitter ≤ ~8°, clusters not scatter, and
leave honest negative space (real rooms have open floor).

### 5. LAW OF THE WATCH — guarding is a job with a shift pattern
Every warden answers: what is my post, what do I face, where do I pause?
A gate guard faces OUT through the gate. A patrol is a plausible round with
human pauses — at a brazier, a doorway, a colleague (paired pause-points
make the DEVOUR-isolation readable). Posts imply amenities: a stool, a
brazier, a lamp — which is also where their light pools. The Great Eye and
Snuffed follow the same law (a deaf tower watches the approach it was BUILT
to watch). If a patrol route would look absurd to a resident ("why does he
walk into the store-room and back?"), it fails.

---

## Room grammar (the composition kit)

Compose every room in this order:
1. **Anchor** — the object that IS the room's job (bench, vat, altar, gate,
   bed, counting desk). Place it first, oriented for its user.
2. **Light for the anchor** — the fixture its user works by (Law 2).
3. **Storage & walls** — supplies against walls, in corners, in rows.
4. **Circulation** — walk the resident's path through the room; keep it
   clear; this usually leaves the shadowed service lane the player wants.
5. **Wear** — one tableau or trace of use, if this room earns one.
6. **Verb check** — LAST, verify the encounter grammar from the redesign
   spec still parses (intended verb + alt both possible). Adjust using the
   room's own furniture: need more cover? The room gains stock its owner
   would plausibly store, not a crate from nowhere.

## Site dossier (required per level, ~15 lines in the file header)

Every level file opens with a dossier comment:
- **WHAT**: the institution, in one line. **WHO**: 2–3 named roles that work
  here (they need not appear; their stuff does).
- **PARTI**: the floorplan logic as an arrow chain, e.g. chandlery =
  `loading dock → vat hall → dipping gallery → counting room → strongroom`.
- **WHY THE RELIC IS HERE**: the institution's own reason, and why its spot
  is the lit, venerated, deepest point (Laws 1+2+3 conspire to make the
  finale hard — never a bare pedestal in a corridor).
- **TABLEAUX**: the 2–4 wear-stories, one sentence each.
- **THE NIGHT SHIFT**: each warden's post/round in the residents' terms.

## The eight sites (canon identities — dossiers to be authored per level)

| Level file | Mission | Site |
|---|---|---|
| tutorial.js | M1 | **The Ashway** — a burned lamplighters' street being stripped for salvage; the Vigil keeps one shrine lit among ruins. |
| dousing.js | M2 | **The Dousing Yards** — lamp-oil / snuffing yard where the Vigil services street-lanterns; oil racks, wick stores, the great lantern. |
| swallow.js | M3 | **The Fleshers' Row** — night-market row (meat/tallow trade) whose narrow stalls and paired porters teach isolation + DEVOUR. |
| mission1.js | M4 | **Brightward Gate** — the garrison gatehouse district that guards the Noonstaff; parade square, armory, watch-walls. |
| lanternways.js | M5 | **The Lanternways** — canal-and-bridge lamp district; mirror-water, catwalk service routes over the plaza (CLIMB's home). |
| chandlery.js | M6 | **The Great Chandlery** — candle manufactory; vats, dipping galleries, wax stores, the Light-Heart in its counting-crypt. |
| spire.js | M7 | **The Vigil Spire** — the order's administrative bell-spire; cells, scriptorium, processional stair, the Great Eye's warden-roost. |
| vault.js | M8 | **The Mirror Vault** — reliquary undercroft of polished stone; scrying pools, barred treasuries, the final relic enthroned. |

Each rebuild authors the dossier FIRST (from this identity + the verb spec's
beats), gets it approved in the brief, then builds to it.

## Showcase mandate — the game is a demo of three-realtime-rt

Full license exists to REBUILD levels from the ground up. Each site is
composed around ONE signature rendering moment the library is uniquely good
at — sited where the parti naturally puts the player, and degrading
gracefully on the conservative defaults (the moment must still read as good
art with reflections/volumetrics off):

| Site | Signature moment |
|---|---|
| Ashway | moonlit ruin contrast — hard moon shadows raking charred walls |
| Dousing Yards | the great lantern douse — a whole yard's bounce light dying at once |
| Fleshers' Row | brazier-lit stalls — many small warm soft-shadow pools in fog |
| Brightward Gate | massed torchlight on parade stone — overlapping soft shadows |
| Lanternways | mirror-water canals doubling every lantern (reflections on) |
| Chandlery | glass + refraction — wax-glazed floors, the Light-Heart gem |
| Spire | god-ray shafts down the processional stair; the Eye's beam in fog |
| Mirror Vault | polished-stone reflections everywhere; glass treasury cases |

## Geometry hygiene — no "broken corners"

Axis-aligned boxes meeting EXACTLY edge-to-edge read as broken: coplanar
faces z-fight, and traced light leaks through zero-width seams. Rules:
- Wall joints OVERLAP: at any corner or T-junction, run one box PAST the
  other by at least the wall's thickness. Never butt two boxes flush.
- Cap exposed corners with a PIER (a `kit.pillar` quoin slightly fatter
  than the wall) — hides the seam and reads as real masonry. Long runs get
  piers at intervals; ruins get broken pier stumps.
- No two coplanar faces anywhere (offset by ≥0.02 if surfaces must nest).
- Prefer adding a `kit.wall(x0,z0,x1,z1,{h,th})` helper that does the
  overlap + optional piers automatically over hand-placing `kit.solid`
  runs, so the fix is systematic, not per-level diligence.

## Build constraints (unchanged canon — violating these fails review)

- Verticality embargo M1–4 (flat); platforms/ramps are 5–8 vocabulary.
- No emissive area lights: glow = `rtExclude` shells; real light = point/spot
  with a visible fixture. Conservative-defaults rule: everything must read
  with reflections/volumetrics OFF.
- Palette law (refined 2026-07-22): amber/orange/red = the Vigil's own light;
  violet = the OLD DARK itself — Hush, and the Vigil's imprisoned residue of it
  (drowned canal-lamps, dreg-lamps, crypt-lamps are canon violet). Violet on
  Vigil trim, banners, or UI is still a violation.
- Two voices only (Hush fragments / Vigil liturgy); prompts terse.
- Systematic tuning stays possible: keep per-level `TUNE` blocks, beat
  structure, and `_dressing.js` motifs (extend motifs; don't fork them).
- `npm run build` must pass; keep `bag.*` contracts (boxes/cylinders/
  platforms/mirrors/fogZones/scepter/onAlarm) intact.

## QA gate (the reviewer's five questions)

A reviewer agent walks the level and must answer YES to all:
1. Can I name every room's owner and job from its contents alone?
2. Does every light have a fixture and a resident reason?
3. Could a resident walk their daily route without climbing over anything?
4. Do at least two tableaux tell a story I can say in one sentence?
5. Does every warden's post/round make sense as a JOB — and does the verb
   grammar of the spec still parse on top of all of it?
