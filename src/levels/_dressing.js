/**
 * SHARED SET-DRESSING MOTIFS — reusable environmental-storytelling recipes
 * composed from the prop library + the placement helpers (see levelKit.js).
 *
 * WHY THIS FILE: it is the "systematic change" layer. Tweak a recipe here and
 * every level that uses it updates at once (e.g. re-tune what a Vigil shrine
 * looks like across the whole campaign). Each recipe still returns the created
 * prop handles, so an individual placement stays locally tweakable in the level.
 *
 * Every recipe takes `kit` first, then a world position, then an opts bag that
 * ALWAYS accepts `clear` (keep-clear zones: door lanes, guard lines, spawn) and
 * `seed` (deterministic variation). Coordinates are world units.
 */

/** A dumped heap of dead lamps + rubble — the Vigil's discard, the pile Hush
 *  crawls out of. Tall broken column to the back, spent lanterns spilling front.
 *  (deadLantern/rubble are decor/near-decor; brokenColumn gives one cover stump.) */
export function lampMidden(kit, x, z, { backDir = 0, count = 5, footprint = 1.3, clear = [], seed = 1 } = {}) {
  return kit.cluster(x, z, [{ prop: "deadLantern", w: 3 }, { prop: "rubble", w: 2 }, "brokenColumn"],
    { count, footprint, backDir, spread: 0.7, clear, seed });
}

/** Offering urns flanking a tended lamp — the Vigil's piety made visible, and a
 *  gameplay tell that a lit pool is "sacred = do not stand here." Urns are decor
 *  (no colliders), so they never block a patrol; they just mark the danger. */
export function vigilShrine(kit, x, z, { gap = 1.7, urnScale = 0.9, dir = 0, clear = [], seed = 11 } = {}) {
  return kit.flank(x, z, { prop: "urn", opts: { scale: urnScale } },
    { gap, dir, face: "in", clear, seed });
}

/** A WORK RANK — a neat human-made row of one prop: an intake rank of crates
 *  at a dock door, a bench row, refit lanterns queued for flame, kegs along a
 *  stall counter. Humans stack in rows (PLACES.md Law of Wear): even spacing
 *  down the segment (x0,z0)→(x1,z1), each piece squared to the row's axis,
 *  rotation jitter ≤ ~8° + a small positional wobble. Pass either an explicit
 *  `count` (exactly that many, spread end-to-end, endpoints included) or a
 *  `spacing` (fills the segment with half-spacing end margins, like wallRun).
 *  `prop` is a builder name ("crate"|"barrel"|"deadLantern"|…) or any palette
 *  spelling; `propOpts` pins fixed builder opts (e.g. { lit:false }). Fully
 *  deterministic from `seed`; `clear` keep-clear rects/discs are honoured
 *  (blocked pieces nudge sideways or drop — a rank never plugs a lane).
 *  Returns the array of created handles. */
export function workRank(kit, x0, z0, x1, z1, {
  prop = "crate", propOpts = null, count, spacing = 1.6,
  jitter = 0.08, rotJitter = 0.12, face = "wall",
  inset = 0, clear = [], seed = 21,
} = {}) {
  const palette = propOpts ? { prop, opts: propOpts } : prop;
  const L = Math.hypot(x1 - x0, z1 - z0);
  let sp = spacing, em; // em undefined → wallRun's default (spacing/2)
  if (count >= 2) {
    // exact count, endpoints included: shave an epsilon off the step so
    // wallRun's floor(usable/spacing)+1 lands on `count` despite float error
    sp = (L / (count - 1)) * (1 - 1e-9);
    em = 0;
  } else if (count === 1) {
    sp = Math.max(L, 1); em = L / 2; // one piece, centred on the segment
  }
  return kit.wallRun(x0, z0, x1, z1, palette, {
    spacing: sp, endMargin: em, inset, jitter, rotJitter, face, clear, seed,
  });
}

/** A framed distant vista — a landmark statue with flanking columns and a base
 *  scatter, read through a barrier/mist as "a real place, going on without you."
 *  Returns { center, flanks, scatter }. */
export function barredVista(kit, x, z, { clear = [], seed = 11 } = {}) {
  return kit.focal(x, z, {
    landmark: "statue", landmarkOpts: { h: 3.0, rot: 0.4 },
    flankProp: "brokenColumn", flankGap: 2.6,
    scatterProp: "rubble", scatterCount: 3, scatterRing: 1.9,
    clear, seed,
  });
}
