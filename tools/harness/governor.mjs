/**
 * The number a player actually feels: where the ADAPTIVE GOVERNOR settles.
 *
 * Every other timing here freezes the governor so the two arms can be compared
 * at a fixed configuration. But the game ships with the governor ON, so a cost
 * increase does not show up as a slower game. It shows up as a LOWER SETTLED
 * RESOLUTION at the same frame rate. That is the trade the owner is really
 * making, so it is measured directly: boot each arm as it ships, let it run for
 * 30 s, and record where renderScale and the canvas ladder come to rest.
 *
 * Both arms are run twice, alternating, so a drift in the machine's GPU load
 * shows up as a difference between the two runs of the SAME arm (the floor).
 *
 *   node tools/harness/governor.mjs [levels] [seconds]
 */
import { launch, newPage, boot, installHooks, freezeSim, frames, readFt, resetTimers,
         median, r2, r3, AFTER, BEFORE, LEVELS, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = (process.argv[2] || "0,5").split(",").map(Number);
const SECONDS = Number(process.argv[3] || 30);

async function runArm(url, lv) {
  const browser = await launch();
  try {
    const page = await newPage(browser);
    // freezeGovernor:false, which is the whole point of this script
    const info = await boot(page, url, lv, { preset: "perf", freezeGovernor: false });
    await installHooks(page);
    await freezeSim(page);
    await page.evaluate((sec) => {
      window.__gov = [];
      const g = window.UMBRAL, t0 = performance.now();
      const id = setInterval(() => {
        window.__gov.push({
          t: Math.round(performance.now() - t0),
          renderScale: g.rt.renderScale,
          canvasScale: g.settings.governorScale,
          canvas: [g.renderer.domElement.width, g.renderer.domElement.height],
          denoise: g.rt.denoiseIterations,
          stochastic: g.rt.stochasticLights,
          gpuCostMs: g.rt.gpuCostMs === undefined ? null : g.rt.gpuCostMs,
        });
        if (performance.now() - t0 > sec * 1000) clearInterval(id);
      }, 1000);
    }, SECONDS);
    await page.waitForTimeout((SECONDS + 2) * 1000);
    await resetTimers(page);
    await frames(page, 60);
    const ft = (await readFt(page)).slice(20);
    const samples = await page.evaluate(() => window.__gov);
    const last = samples[samples.length - 1] || {};
    // effective on-screen lighting pixels = canvas pixels x renderScale^2
    const eff = last.canvas ? Math.round(last.canvas[0] * last.canvas[1] * last.renderScale * last.renderScale) : null;
    return {
      version: info.version, settled: last, effectiveLightingPixels: eff,
      finalFrameMs: r2(median(ft)),
      trajectory: samples.map((s) => `${s.t}ms rs=${s.renderScale} cs=${s.canvasScale}`),
    };
  } finally { await browser.close(); }
}

const out = [];
for (const lv of levels) {
  const runs = { before: [], after: [] };
  for (let i = 0; i < 2; i++) {
    runs.before.push(await runArm(BEFORE, lv));
    runs.after.push(await runArm(AFTER, lv));
  }
  out.push({ level: lv, name: LEVELS[lv], runs });
  console.log(`\n=== L${lv} ${LEVELS[lv]} governor settling after ${SECONDS}s ===`);
  for (const arm of ["before", "after"]) {
    for (const [i, r] of runs[arm].entries()) {
      console.log(`  ${arm} run${i + 1}: renderScale ${r.settled.renderScale}  canvasScale ${r.settled.canvasScale}  canvas ${JSON.stringify(r.settled.canvas)}  denoise ${r.settled.denoise}  lighting px ${r.effectiveLightingPixels}  frame ${r.finalFrameMs} ms  gpuCostMs ${r.settled.gpuCostMs}`);
    }
  }
}
writeFileSync(resolve(HERE, "governor.json"), JSON.stringify(out, null, 2));
console.log("\nwrote tools/harness/governor.json");
