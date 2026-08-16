/**
 * Part C.3: the two AmbientLight levels, three arms (four, actually).
 *
 * NOTE ON LEVEL NUMBERING: the spec says "L1 mission1 = the yards". mission1.js
 * is BRIGHTWARD GATE and it is LEVEL 3 in main.js's LEVELS array; level 1 is
 * dousing.js, THE DOUSING YARDS, which has no AmbientLight. The two levels that
 * build a THREE.AmbientLight are mission1 (L3, 0x25324a at 0.40) and chandlery
 * (L5, 0x2c3a55 at 0.42), so those are the two measured here.
 *
 * Arms:
 *   before   0.14.1 (:5183), which ignores AmbientLight entirely
 *   off      0.15.0 with ambient:false (what this upgrade ships)
 *   x0.10    0.15.0 with ambient:true and the authored intensities x 0.10
 *   full     0.15.0 with ambient:true at the AUTHORED intensity, i.e. what the
 *            library's own default would have shipped if _makeRT said nothing
 *
 * Numbers per arm: whole-frame luma percentiles of the traced image (p05 is the
 * deep shadow, p95 the lit surfaces), plus the analytic light meter at the
 * player's spawn. The meter is the game's single source of truth and it does not
 * read ambient lights at all, so whether it MOVES between arms is itself the
 * finding.
 *
 *   node tools/harness/ambient.mjs [levels]
 */
import { launch, newPage, boot, installHooks, freezeSim, frames, shot, frameLuma,
         mean, r2, r3, AFTER, BEFORE, LEVELS, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = (process.argv[2] || "3,5").split(",").map(Number);
const CONVERGE = 200;

const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const stats = (l) => ({ mean: r2(mean(l)), p05: r2(pct(l, 0.05)), p25: r2(pct(l, 0.25)), p50: r2(pct(l, 0.5)), p95: r2(pct(l, 0.95)) });

/** Set the level's AmbientLight intensities to scale x authored, and re-sync. */
async function setAmbient(page, { on, scale }) {
  return page.evaluate(({ on, scale }) => {
    const g = window.UMBRAL;
    const found = [];
    g.scene.traverse((o) => {
      if (o.isAmbientLight) {
        if (o.userData.__authored === undefined) o.userData.__authored = o.intensity;
        o.intensity = o.userData.__authored * scale;
        found.push({ color: "#" + o.color.getHexString(), authored: o.userData.__authored, now: o.intensity });
      }
    });
    g.rt.ambient = on;
    g.rt.updateLights(g.scene);
    if (g.rt.resetAccumulation) g.rt.resetAccumulation();
    return found;
  }, { on, scale });
}

async function armStats(page, tag, lv) {
  await frames(page, CONVERGE);
  const l = await frameLuma(page);
  const s = stats(l);
  const png = await shot(page, `ambient-${tag}-L${lv}-${LEVELS[lv]}`);
  // The meter is analytic: _collectLights() pushes only DirectionalLight and
  // PointLight, so an AmbientLight cannot reach it by construction. Measured
  // anyway, in every arm, because "by construction" is how bugs get shipped.
  const meter = await page.evaluate(() => window.UMBRAL._computePlayerVis());
  return { ...s, meter: r3(meter), png };
}

const out = [];
for (const lv of levels) {
  // --- before arm: its own browser, its own boot ---
  const b0 = await launch(); const p0 = await newPage(b0);
  const i0 = await boot(p0, BEFORE, lv, { preset: "perf" });
  await installHooks(p0); await freezeSim(p0);
  const before = await armStats(p0, "before", lv);
  const ambBefore = await p0.evaluate(() => {
    const f = []; window.UMBRAL.scene.traverse((o) => { if (o.isAmbientLight) f.push({ color: "#" + o.color.getHexString(), intensity: o.intensity }); });
    return { lights: f, hasAmbientOption: typeof window.UMBRAL.rt.ambient };
  });
  await b0.close();

  // --- after arm: one boot, three configurations ---
  const b1 = await launch(); const p1 = await newPage(b1);
  const i1 = await boot(p1, AFTER, lv, { preset: "perf" });
  await installHooks(p1); await freezeSim(p1);
  const lights = await setAmbient(p1, { on: false, scale: 1 });
  const off = await armStats(p1, "off", lv);
  await setAmbient(p1, { on: true, scale: 0.10 });
  const x010 = await armStats(p1, "amb010", lv);
  await setAmbient(p1, { on: true, scale: 1 });
  const full = await armStats(p1, "ambfull", lv);
  await setAmbient(p1, { on: false, scale: 1 }); // leave it as shipped
  await b1.close();

  const row = { level: lv, name: LEVELS[lv], authored: lights, beforeScene: ambBefore, versions: [i0.version, i1.version], before, off, x010, full };
  out.push(row);
  console.log(`\nL${lv} ${LEVELS[lv]}  authored ${JSON.stringify(lights)}`);
  for (const [k, v] of Object.entries({ before, off, x010, full })) {
    console.log(`  ${k.padEnd(7)} mean ${v.mean}  p05 ${v.p05}  p50 ${v.p50}  p95 ${v.p95}  meter ${v.meter}`);
  }
}
writeFileSync(resolve(HERE, "ambient.json"), JSON.stringify(out, null, 2));
console.log("\nwrote tools/harness/ambient.json");
