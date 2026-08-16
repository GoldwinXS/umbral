/**
 * Where does the sun bypass's cost actually go?
 *
 * `restirDirectionalBypass` turns `lightMode` from 2 into 1 at
 * RTLightingPass.js:1461. Mode 2 returns from shadeLightSet immediately; mode 1
 * walks the whole light table, skips every non-directional row, and calls
 * lightContribution (one shadow ray) for the directional ones. So the cost is
 * either the LOOP or the RAY, and the fix for each would be different.
 *
 * Decided by measuring the same on/off pair twice: once with the level's
 * directional light visible, and once with it hidden. With it hidden the loop
 * still runs and still walks every row; only the ray is gone.
 *
 *   node tools/harness/bypass-anatomy.mjs [levels] [pairs]
 */
import { launch, newPage, boot, installHooks, freezeSim, frames, resetTimers, readFt,
         median, r2, r3, AFTER, LEVELS, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = (process.argv[2] || "0,5").split(",").map(Number);
const PAIRS = Number(process.argv[3] || 10), WIN = 30, WARM = 12;
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

async function armMs(page, bypass) {
  await page.evaluate((v) => {
    const rt = window.UMBRAL.rt;
    rt.restirDirectionalBypass = v;
    if (rt.resetAccumulation) rt.resetAccumulation();
  }, bypass);
  await resetTimers(page);
  await frames(page, WARM + WIN);
  return pct((await readFt(page)).slice(WARM), 0.1);
}

async function pairRun(page) {
  const A = [], B = [], ratios = [];
  for (let i = 0; i < PAIRS; i++) {
    const a = await armMs(page, false), b = await armMs(page, true);
    A.push(a); B.push(b); ratios.push(b / a);
  }
  return { off: r2(median(A)), on: r2(median(B)), deltaMs: r2(median(B) - median(A)), ratio: r3(median(ratios)), iqr: r3(pct(ratios, 0.75) - pct(ratios, 0.25)) };
}

const out = [];
for (const lv of levels) {
  const browser = await launch();
  const page = await newPage(browser);
  const info = await boot(page, AFTER, lv, { preset: "perf" });
  await installHooks(page);
  await freezeSim(page);
  const withSun = await pairRun(page);
  const hidden = await page.evaluate(() => {
    const g = window.UMBRAL; let n = 0;
    g.scene.traverse((o) => { if (o.isDirectionalLight && o.visible) { o.visible = false; n++; } });
    g.rt.updateLights(g.scene);
    if (g.rt.resetAccumulation) g.rt.resetAccumulation();
    return { hidden: n, lightCount: g.rt.compiled.lightCount };
  });
  const withoutSun = await pairRun(page);
  await page.evaluate(() => {
    const g = window.UMBRAL;
    g.scene.traverse((o) => { if (o.isDirectionalLight) o.visible = true; });
    g.rt.updateLights(g.scene);
  });
  const row = { level: lv, name: LEVELS[lv], lights: info.scene.lights, directional: info.scene.directional, hidden, withSun, withoutSun };
  out.push(row);
  console.log(`\nL${lv} ${LEVELS[lv]}  lights=${info.scene.lights} directional=${info.scene.directional}`);
  console.log(`  directional VISIBLE: off ${withSun.off} -> on ${withSun.on} ms  (+${withSun.deltaMs} ms, ratio ${withSun.ratio}, IQR ${withSun.iqr})`);
  console.log(`  directional HIDDEN : off ${withoutSun.off} -> on ${withoutSun.on} ms  (+${withoutSun.deltaMs} ms, ratio ${withoutSun.ratio}, IQR ${withoutSun.iqr})  [loop only, no ray]`);
  await browser.close();
}
writeFileSync(resolve(HERE, "bypass-anatomy.json"), JSON.stringify(out, null, 2));
console.log("\nwrote tools/harness/bypass-anatomy.json");
