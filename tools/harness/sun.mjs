/**
 * Part C.4: the sun levels. L5 (Chandlery) is the game's daylight level: a
 * DirectionalLight at roughly 52 degrees, i.e. exactly the case
 * restirDirectionalBypass exists for (a reservoir scores its candidates
 * UNSHADOWED, so a directional light wins every interior pixel's reservoir,
 * spends the one visibility ray on the wall in between, and resolves black with
 * the odd frame's runner-up as a speck).
 *
 * Two comparisons, because they answer different questions:
 *   A. before (0.14.1, :5183) vs after (0.15.0, :5182), converged spawn view.
 *      Whole-image mean |before - after| per pixel, with the floor being the
 *      same instrument run twice on the SAME arm.
 *   B. in-page, the bypass alone: restirDirectionalBypass false vs true on the
 *      0.15.0 build, converged, mean |off - on| and the noise of each. This is
 *      the attributable half; the cross-build number carries every other change
 *      with it.
 *
 *   node tools/harness/sun.mjs [levels]
 */
import { launch, newPage, boot, installHooks, freezeSim, frames, shot, frameLuma,
         mean, r2, r3, AFTER, BEFORE, LEVELS, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = (process.argv[2] || "5").split(",").map(Number);
const CONVERGE = 220;

const absDiff = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

/** Inter-frame instability at a settled pose: the speckle metric. */
async function settleNoise(page, n = 24) {
  const fs = [];
  for (let i = 0; i < n; i++) { await frames(page, 1); fs.push(await frameLuma(page)); }
  let s = 0;
  for (let i = 1; i < fs.length; i++) s += absDiff(fs[i], fs[i - 1]);
  return { flicker: r3(s / (fs.length - 1)), last: fs[fs.length - 1] };
}

const out = [];
for (const lv of levels) {
  // ---- A: cross-build ----
  const b0 = await launch(); const p0 = await newPage(b0);
  const i0 = await boot(p0, BEFORE, lv, { preset: "perf" });
  await installHooks(p0); await freezeSim(p0);
  await frames(p0, CONVERGE);
  const beforeA = await frameLuma(p0);
  const beforeNoise = await settleNoise(p0);
  await frames(p0, 60);
  const beforeB = await frameLuma(p0); // same arm, later: the floor
  await shot(p0, `sun-before-L${lv}-${LEVELS[lv]}`);
  await b0.close();

  const b1 = await launch(); const p1 = await newPage(b1);
  const i1 = await boot(p1, AFTER, lv, { preset: "perf" });
  await installHooks(p1); await freezeSim(p1);
  await frames(p1, CONVERGE);
  const afterA = await frameLuma(p1);
  const afterNoise = await settleNoise(p1);
  await frames(p1, 60);
  const afterB = await frameLuma(p1);
  await shot(p1, `sun-after-L${lv}-${LEVELS[lv]}`);

  // ---- B: the bypass alone, in one page ----
  await page_setBypass(p1, false);
  await frames(p1, CONVERGE);
  const offImg = await frameLuma(p1);
  const offNoise = await settleNoise(p1);
  await shot(p1, `sun-bypassOFF-L${lv}-${LEVELS[lv]}`);
  await page_setBypass(p1, true);
  await frames(p1, CONVERGE);
  const onImg = await frameLuma(p1);
  const onNoise = await settleNoise(p1);
  await shot(p1, `sun-bypassON-L${lv}-${LEVELS[lv]}`);
  const dirInfo = await p1.evaluate(() => {
    const l = [];
    window.UMBRAL.scene.traverse((o) => { if (o.isDirectionalLight && o.visible) l.push({ intensity: o.intensity, color: "#" + o.color.getHexString(), pos: [o.position.x, o.position.y, o.position.z].map((v) => Math.round(v * 100) / 100 ) }); });
    return l;
  });
  await b1.close();

  const row = {
    level: lv, name: LEVELS[lv], directional: dirInfo, versions: [i0.version, i1.version],
    crossBuild: {
      meanAbsDiff: r3(absDiff(beforeA, afterA)),
      floorBefore: r3(absDiff(beforeA, beforeB)),
      floorAfter: r3(absDiff(afterA, afterB)),
      beforeMean: r2(mean(beforeA)), afterMean: r2(mean(afterA)),
      beforeP05: r2(pct(beforeA, 0.05)), afterP05: r2(pct(afterA, 0.05)),
      beforeFlicker: beforeNoise.flicker, afterFlicker: afterNoise.flicker,
    },
    bypassAlone: {
      meanAbsDiff: r3(absDiff(offImg, onImg)),
      offMean: r2(mean(offImg)), onMean: r2(mean(onImg)),
      offP05: r2(pct(offImg, 0.05)), onP05: r2(pct(onImg, 0.05)),
      offP95: r2(pct(offImg, 0.95)), onP95: r2(pct(onImg, 0.95)),
      offFlicker: offNoise.flicker, onFlicker: onNoise.flicker,
    },
  };
  out.push(row);
  console.log(`\nL${lv} ${LEVELS[lv]} directional=${JSON.stringify(dirInfo)}`);
  console.log("  cross-build:", JSON.stringify(row.crossBuild));
  console.log("  bypass alone:", JSON.stringify(row.bypassAlone));
}
writeFileSync(resolve(HERE, "sun.json"), JSON.stringify(out, null, 2));
console.log("\nwrote tools/harness/sun.json");

async function page_setBypass(page, on) {
  await page.evaluate((v) => {
    const rt = window.UMBRAL.rt;
    rt.restirDirectionalBypass = v;
    if (rt.resetAccumulation) rt.resetAccumulation();
  }, on);
}
