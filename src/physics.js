/**
 * 2D (XZ-plane) collision + queries shared by player and wardens.
 * Colliders are plain data: boxes {x,z,hx,hz,rot,enabled}, cylinders {x,z,r,enabled}.
 *
 * VERTICALITY: a collider may carry an optional height band {y0,y1} (bottom/top
 * of the solid, world Y). When the caller passes the mover's foot height feetY
 * (+ bodyH), a banded collider is IGNORED unless the mover's vertical extent
 * [feetY, feetY+bodyH] overlaps [y0,y1] — so a railing on a raised catwalk
 * (y0≈2) doesn't block a blob down on the floor, and vice-versa. Colliders with
 * NO band span all heights (the flat-level default → unchanged behavior).
 */

// Does a collider's optional height band clear the mover's vertical extent?
// Returns true = "skip this collider" (no vertical overlap). Unbanded or no
// feetY given → always false (collider applies, i.e. old planar behavior).
const EPS_Y = 0.02;
function bandMisses(c, feetY, bodyH) {
  if (feetY === undefined) return false;
  if (c.y0 === undefined && c.y1 === undefined) return false;
  const y0 = c.y0 ?? -Infinity, y1 = c.y1 ?? Infinity;
  return feetY + bodyH <= y0 + EPS_Y || feetY >= y1 - EPS_Y;
}

/**
 * Resolve a moving circle against all colliders.
 * bounce = 0 (default) slides along faces; bounce > 0 reflects the velocity's
 * inward normal component with that restitution (a pingpong off walls).
 * feetY/bodyH (optional) enable height-banded colliders (see file header).
 */
export function collideCircle(pos, r, vel, boxes, cylinders, bounce = 0, feetY = undefined, bodyH = 0.8) {
  const push = 1 + bounce; // how much of the inward normal velocity to remove/flip
  for (let pass = 0; pass < 2; pass++) {
    for (const b of boxes) {
      if (b.enabled === false) continue;
      if (bandMisses(b, feetY, bodyH)) continue;
      const cs = Math.cos(b.rot || 0), sn = Math.sin(b.rot || 0);
      const dx = pos.x - b.x, dz = pos.z - b.z;
      const lx = dx * cs + dz * sn;
      const lz = -dx * sn + dz * cs;
      const clx = Math.max(-b.hx, Math.min(b.hx, lx));
      const clz = Math.max(-b.hz, Math.min(b.hz, lz));
      let nx = lx - clx, nz = lz - clz;
      const d2 = nx * nx + nz * nz;
      if (d2 > r * r) continue;
      let px, pz;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2), pen = r - d;
        px = (nx / d) * pen; pz = (nz / d) * pen;
      } else {
        const penX = b.hx - Math.abs(lx) + r;
        const penZ = b.hz - Math.abs(lz) + r;
        if (penX < penZ) { px = lx < 0 ? -penX : penX; pz = 0; }
        else { px = 0; pz = lz < 0 ? -penZ : penZ; }
      }
      const wx = px * cs - pz * sn;
      const wz = px * sn + pz * cs;
      pos.x += wx; pos.z += wz;
      if (vel) {
        const nl = Math.hypot(wx, wz);
        if (nl > 1e-6) {
          const ux = wx / nl, uz = wz / nl;
          const vn = vel.x * ux + vel.z * uz;
          if (vn < 0) { vel.x -= push * vn * ux; vel.z -= push * vn * uz; }
        }
      }
    }
    for (const c of cylinders) {
      if (c.enabled === false) continue;
      if (bandMisses(c, feetY, bodyH)) continue;
      const dx = pos.x - c.x, dz = pos.z - c.z;
      const rr = c.r + r;
      const d2 = dx * dx + dz * dz;
      if (d2 > rr * rr || d2 < 1e-8) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d, nz = dz / d;
      const pen = rr - d;
      pos.x += nx * pen; pos.z += nz * pen;
      if (vel) {
        const vn = vel.x * nx + vel.z * nz;
        if (vn < 0) { vel.x -= push * vn * nx; vel.z -= push * vn * nz; }
      }
    }
  }
}

/** Is the circle at (x,z,r) overlapping any collider? (height-band aware) */
export function circleHits(x, z, r, boxes, cylinders, feetY = undefined, bodyH = 0.8) {
  for (const b of boxes) {
    if (b.enabled === false) continue;
    if (bandMisses(b, feetY, bodyH)) continue;
    const cs = Math.cos(b.rot || 0), sn = Math.sin(b.rot || 0);
    const dx = x - b.x, dz = z - b.z;
    const lx = dx * cs + dz * sn;
    const lz = -dx * sn + dz * cs;
    const cx = Math.max(-b.hx, Math.min(b.hx, lx));
    const cz = Math.max(-b.hz, Math.min(b.hz, lz));
    const ex = lx - cx, ez = lz - cz;
    if (ex * ex + ez * ez < r * r) return true;
  }
  for (const c of cylinders) {
    if (c.enabled === false) continue;
    if (bandMisses(c, feetY, bodyH)) continue;
    const dx = x - c.x, dz = z - c.z;
    const rr = c.r + r;
    if (dx * dx + dz * dz < rr * rr) return true;
  }
  return false;
}

/**
 * VERTICALITY — resolve the walkable ground height at (x,z) for a mover
 * currently at foot height curY. Candidates are the base floor (0), any raised
 * PLATFORM/catwalk covering (x,z) at its height, and any RAMP covering (x,z) at
 * its interpolated height. The mover stands on the HIGHEST candidate it can
 * reach: you may step UP only within `stepUp` (so a sheer catwalk edge is not
 * climbable — you must take a ramp; a ramp's low lip is ~level with the floor so
 * it IS reachable), but you may DROP to any lower surface (walk off an edge).
 * With no platforms/ramps this always returns 0 → flat levels are unchanged.
 * `base` is the ground-floor height (usually 0; pass a level's sunken base).
 */
export function groundHeightAt(x, z, platforms, ramps, curY = 0, stepUp = 0.4, base = 0) {
  let ground = base;
  const consider = (h) => {
    if (h <= curY + stepUp && h > ground) ground = h; // highest reachable
  };
  consider(base);
  if (platforms) {
    for (const p of platforms) {
      if (x >= p.x0 && x <= p.x1 && z >= p.z0 && z <= p.z1) consider(p.y);
    }
  }
  if (ramps) {
    for (const r of ramps) {
      if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
      const t = r.axis === "x"
        ? (x - r.x0) / Math.max(1e-6, r.x1 - r.x0)
        : (z - r.z0) / Math.max(1e-6, r.z1 - r.z0);
      consider(r.y0 + (r.y1 - r.y0) * Math.min(1, Math.max(0, t)));
    }
  }
  return ground;
}

/** Highest walkable surface at (x,z) IGNORING the step-up limit — used for
 *  blink landings (a shadowstep can carry you UP onto a ledge/catwalk). */
export function topSurfaceAt(x, z, platforms, ramps, base = 0) {
  return groundHeightAt(x, z, platforms, ramps, Infinity, Infinity, base);
}

export function pointInHole(x, z, holes) {
  for (const h of holes) {
    if (x >= h.x0 && x <= h.x1 && z >= h.z0 && z <= h.z1) return true;
  }
  return false;
}

export function surfaceAt(x, z, surfaces) {
  for (const s of surfaces) {
    if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1) return s.type;
  }
  return "obsidian";
}
