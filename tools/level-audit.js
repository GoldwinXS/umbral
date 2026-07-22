/**
 * LEVEL GEOMETRY AUDIT — the "no gaps / good corners" system.
 *
 * Paste this whole file into the browser devtools console while the game is
 * running (window.UMBRAL must exist). It loads every level and reports, per
 * level, from a spawn flood-fill over the collision grid:
 *   - leak         : can the player escape the intended play area to the grid edge?
 *   - reachExit    : is the extraction reachable from spawn?
 *   - abyssWalkable : count of reachable cells that have NO floor and are NOT a
 *                     kit.hole (i.e. you can walk out over the void without dying)
 *   - stuckWaypoints: guard patrol points sitting inside solid geometry
 *   - stepErr      : threw while stepping 40 frames
 *
 * A clean level is: leak=false, reachExit=true, abyssWalkable=0, stuckWaypoints=0.
 * "abyssWalkable" is the check that catches "a wall that opens onto the abyss" —
 * if a drop is INTENDED, make it a kit.hole so the player dies (holes don't count).
 *
 * Run this after authoring/editing ANY level before shipping.
 *
 * VERTICALITY NOTES (2026-07-22):
 * - Floor detection only ever found kit.floor() slabs (meshes at y≈-0.1,
 *   height≈0.2). A kit.platform() deck or a kit.ramp() slope IS the ground at
 *   its own height — by design neither sits on a matching y≈-0.1 slab beneath
 *   it (see levelKit.js) — so a raised deck or a climbing ramp used to read as
 *   pure "abyss" even though it's the intended walkable surface. Both are now
 *   counted as floor too, from window.UMBRAL.level.platforms/.ramps (the exact
 *   bag.platforms/bag.ramps arrays the runtime's own groundHeightAt() reads —
 *   see physics.js — so this matches what the player can actually stand on).
 * - The 2D flood-fill's wall check (`blk`) used to treat every collider in
 *   L.boxes as full-height, including height-BANDED ones (kit.railing pushes
 *   {y0,y1}: a catwalk-edge rail at y0≈2.5 stops someone ON the deck, not
 *   someone walking underneath it — see physics.js's bandMisses()/collideCircle
 *   feetY handling). The fill now skips a banded box when its band is entirely
 *   overhead (y0 >= ~1.2, well above a ground walker's ~0.8 body height); a
 *   ground-level band (a knee-wall/skirt, y0 < ~1.2) still blocks, same as an
 *   unbanded wall.
 * - The grid (X0/X1/Z0/Z1) is sized to contain every level's bag.bounds with
 *   margin; it used to clip the south edge (Z0=-46) short of the redesigned
 *   Spire's bounds (z0=-48, the crown shrine's floor reaches z=-47), so any
 *   ordinary walkable cell near the shrine's own south wall tripped the
 *   near-grid-edge "leak" heuristic. Z0 now clears every level's bounds.
 */
(() => {
  const g = window.UMBRAL;
  if (!g) return "no window.UMBRAL — start the game first";
  const inHole = (x, z, holes) => holes.some(h =>
    x >= Math.min(h.x0, h.x1) && x <= Math.max(h.x0, h.x1) &&
    z >= Math.min(h.z0, h.z1) && z <= Math.max(h.z0, h.z1));
  // grid big enough for every level, with margin (widest: dousing x -47..71;
  // deepest: spire z -48..46) — re-check bag.bounds across levels/ if a new
  // level pushes past this, widen it here rather than per-level.
  const X0 = -72, X1 = 82, Z0 = -56, Z1 = 88, st = 0.5;
  const audit = (lv) => {
    g.loadLevel(lv); g.state = "playing"; const L = g.level;
    const floors = [];
    g.scene.traverse(o => {
      if (!o.isMesh || !o.geometry || !o.geometry.parameters) return;
      const p = o.geometry.parameters; if (p.width == null || p.depth == null) return;
      if (Math.abs(o.position.y + 0.1) < 0.03 && Math.abs(p.height - 0.2) < 0.03)
        floors.push({ x0: o.position.x - p.width / 2, x1: o.position.x + p.width / 2, z0: o.position.z - p.depth / 2, z1: o.position.z + p.depth / 2 });
    });
    // VERTICALITY: platforms and ramps are walkable ground at their own
    // height (no matching floor slab underneath by design) — count their
    // footprints as floor too, same padding convention as the mesh scan.
    const plats = L.platforms || [], ramps = L.ramps || [];
    const overFloor = (x, z) =>
      floors.some(f => x >= f.x0 - 0.4 && x <= f.x1 + 0.4 && z >= f.z0 - 0.4 && z <= f.z1 + 0.4) ||
      plats.some(p => x >= p.x0 - 0.4 && x <= p.x1 + 0.4 && z >= p.z0 - 0.4 && z <= p.z1 + 0.4) ||
      ramps.some(r => x >= r.x0 - 0.4 && x <= r.x1 + 0.4 && z >= r.z0 - 0.4 && z <= r.z1 + 0.4);
    const holes = L.holes || [], boxes = L.boxes.filter(b => b.enabled);
    // Height-banded colliders (kit.railing: {y0,y1}) must not block a GROUND
    // walker's 2D path when their band is entirely overhead — a deck-edge
    // rail up at y0≈2.5 doesn't stop someone underneath it. A ground-level
    // band (a skirt/knee-wall, y0 < ~1.2) still blocks, same as an unbanded
    // wall (no y0 at all).
    const blk = (px, pz) => boxes.some(b => {
      if (b.y0 !== undefined && b.y0 >= 1.2) return false; // overhead band — clears a ground walker
      const c = Math.cos(-(b.rot || 0)), s = Math.sin(-(b.rot || 0)), dx = px - b.x, dz = pz - b.z;
      const lx = dx * c - dz * s, lz = dx * s + dz * c;
      return Math.abs(lx) <= b.hx + 0.25 && Math.abs(lz) <= b.hz + 0.25;
    });
    const key = (i, j) => i + "," + j;
    const sI = Math.round((L.spawn.x - X0) / st), sJ = Math.round((L.spawn.z - Z0) / st);
    const ex = L.extract, eI = Math.round((ex.x - X0) / st), eJ = Math.round((ex.z - Z0) / st);
    const seen = new Set([key(sI, sJ)]), q = [[sI, sJ]];
    let leak = false, reach = false, abyss = 0, sample = null;
    while (q.length) {
      const [i, j] = q.shift(); const px = X0 + i * st, pz = Z0 + j * st;
      if (px <= X0 + st || px >= X1 - st || pz <= Z0 + st || pz >= Z1 - st) leak = true;
      if (Math.abs(i - eI) <= 1 && Math.abs(j - eJ) <= 1) reach = true;
      if (!overFloor(px, pz) && !inHole(px, pz, holes)) { abyss++; if (!sample) sample = [+px.toFixed(1), +pz.toFixed(1)]; }
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj, k = key(ni, nj); if (seen.has(k)) continue;
        const nx = X0 + ni * st, nz = Z0 + nj * st;
        if (nx < X0 || nx > X1 || nz < Z0 || nz > Z1 || blk(nx, nz)) continue;
        seen.add(k); q.push([ni, nj]);
      }
    }
    let stuck = 0; g.wardens.forEach(w => w.spec.path.forEach(wp => { if (blk(wp[0], wp[1])) stuck++; }));
    let stepErr = null; try { let t = 0; for (let i = 0; i < 40; i++) { g._step(0.033, t); t += 0.033; } } catch (e) { stepErr = String(e.message || e); }
    return { name: L.name, leak, reachExit: reach, abyssWalkable: abyss, abyssSample: sample, stuckWaypoints: stuck, stepErr };
  };
  const out = [];
  for (let lv = 0; lv < (g.LEVELS ? g.LEVELS.length : 8); lv++) { try { out.push(audit(lv)); } catch (e) { out.push({ lv, err: String(e.message || e) }); } }
  console.table(out);
  return out;
})();
