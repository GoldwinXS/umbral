/**
 * Part C.1: frame time, before (0.14.1, :5183) vs after (0.15.0, :5182), at
 * 1280x720, on four levels and three presets.
 *
 * PROTOCOL, and every part of it is there because the alternative lies:
 *  - Two browsers, both alive, only ONE rendering at a time (the other is parked
 *    via the visibility flag, which makes the game's _loop return before
 *    rt.render). Pairs are INTERLEAVED so drift from other sessions' GPU load
 *    lands on both halves of a pair and cancels in the ratio.
 *  - The timer wraps rt.render ONLY and ends with a 1x1 readPixels, i.e. it
 *    measures traced-frame GPU work, not the vsync-capped frame period and not
 *    the game's overlay pass. A wall-clock rAF delta on a 60 Hz display reads
 *    16.7 ms for both arms and proves nothing.
 *  - Per window we report p10 as well as the median. This machine's GPU is
 *    shared and was at 100% utilisation throughout; contention can only ADD
 *    time, so the low percentile is the better estimator of the real cost and
 *    the median is printed beside it as the honest alternative.
 *  - The simulation is frozen at frame 0 and the governor is off in both arms,
 *    so neither a warden nor an adaptive rung can move under the measurement.
 *  - FLOOR: run with `control` as the third argument and BOTH browsers point at
 *    the same (after) build. Every ratio in that run is a 1.000 by construction,
 *    so its spread is the instrument's own floor, measured under the same load.
 *
 *   node tools/harness/frametime.mjs [levels] [presets] [control?]
 */
import { launch, newPage, boot, installHooks, freezeSim, frames, resetTimers, readFt,
         park, wake, applyPreset, median, r2, r3, AFTER, BEFORE, LEVELS, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = (process.argv[2] || "0,4,5,7").split(",").map(Number);
const presets = (process.argv[3] || "perf,bal,beauty").split(",");
const control = process.argv[4] === "control";
const URL_A = control ? AFTER : BEFORE, URL_B = AFTER;
const PAIRS = 6, WIN = 30, WARM = 15;

const pct = (a, p) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};

const out = [];
for (const lv of levels) {
  const bA = await launch(), bB = await launch();
  const pA = await newPage(bA), pB = await newPage(bB);
  const infoA = await boot(pA, URL_A, lv, { preset: "perf" });
  const infoB = await boot(pB, URL_B, lv, { preset: "perf" });
  await installHooks(pA); await installHooks(pB);
  await freezeSim(pA); await freezeSim(pB);
  console.log(`\n=== L${lv} ${LEVELS[lv]}${control ? "  [CONTROL: both arms = after]" : ""} ===`);
  console.log("  A:", infoA.version, JSON.stringify(infoA.lib));
  console.log("  B:", infoB.version, JSON.stringify(infoB.lib));

  for (const preset of presets) {
    const cfgA = await applyPreset(pA, preset), cfgB = await applyPreset(pB, preset);
    const ratios = [], msA = [], msB = [], medA = [], medB = [];
    for (let i = 0; i < PAIRS; i++) {
      await wake(pA); await park(pB);
      await resetTimers(pA); await frames(pA, WARM + WIN);
      const fa = (await readFt(pA)).slice(WARM);
      await wake(pB); await park(pA);
      await resetTimers(pB); await frames(pB, WARM + WIN);
      const fb = (await readFt(pB)).slice(WARM);
      const a = pct(fa, 0.1), b = pct(fb, 0.1);
      msA.push(a); msB.push(b); medA.push(median(fa)); medB.push(median(fb));
      ratios.push(b / a);
    }
    const row = {
      level: lv, name: LEVELS[lv], preset, control,
      cfgBefore: cfgA, cfgAfter: cfgB,
      beforeP10: msA.map(r2), afterP10: msB.map(r2),
      beforeP10Median: r2(median(msA)), afterP10Median: r2(median(msB)),
      beforeP10Spread: r2(Math.max(...msA) - Math.min(...msA)),
      afterP10Spread: r2(Math.max(...msB) - Math.min(...msB)),
      beforeMedianOfMedians: r2(median(medA)), afterMedianOfMedians: r2(median(medB)),
      ratios: ratios.map(r3), ratioMedian: r3(median(ratios)),
      ratioSpread: r3(Math.max(...ratios) - Math.min(...ratios)),
      ratioIqr: r3(pct(ratios, 0.75) - pct(ratios, 0.25)),
    };
    out.push(row);
    console.log(`  ${preset.padEnd(6)} p10 ${row.beforeP10Median} -> ${row.afterP10Median} ms | median ${row.beforeMedianOfMedians} -> ${row.afterMedianOfMedians} | ratio ${row.ratioMedian} (IQR ${row.ratioIqr}, spread ${row.ratioSpread})`);
  }
  await bA.close(); await bB.close();
}
writeFileSync(resolve(HERE, control ? "frametime-control.json" : "frametime.json"), JSON.stringify(out, null, 2));
console.log(`\nwrote tools/harness/${control ? "frametime-control.json" : "frametime.json"}`);
