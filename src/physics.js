/**
 * 2D (XZ-plane) collision + queries shared by player and wardens.
 * Colliders are plain data: boxes {x,z,hx,hz,rot,enabled}, cylinders {x,z,r,enabled}.
 */

/**
 * Resolve a moving circle against all colliders.
 * bounce = 0 (default) slides along faces; bounce > 0 reflects the velocity's
 * inward normal component with that restitution (a pingpong off walls).
 */
export function collideCircle(pos, r, vel, boxes, cylinders, bounce = 0) {
  const push = 1 + bounce; // how much of the inward normal velocity to remove/flip
  for (let pass = 0; pass < 2; pass++) {
    for (const b of boxes) {
      if (b.enabled === false) continue;
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

/** Is the circle at (x,z,r) overlapping any collider? */
export function circleHits(x, z, r, boxes, cylinders) {
  for (const b of boxes) {
    if (b.enabled === false) continue;
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
    const dx = x - c.x, dz = z - c.z;
    const rr = c.r + r;
    if (dx * dx + dz * dz < rr * rr) return true;
  }
  return false;
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
