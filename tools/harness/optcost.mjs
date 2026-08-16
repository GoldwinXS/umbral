/**
 * Part C.1b: what the 0.15.0 default flips COST, measured inside one page.
 *
 * WHY THIS EXISTS. The cross-server A/B (frametime.mjs) alternates two browsers,
 * so each half-pair is seconds long, and on this machine the GPU is shared with
 * other sessions and drifts on exactly that timescale: an identical-arm control
 * measured a ratio IQR of 0.24. That floor swallows anything below a ~25%
 * effect.
 *
 * This instrument flips the OPTIONS instead of the BUILD, inside one page, so
 * the two arms are a second apart and the drift largely cancels. It is a
 * legitimate stand-in for the build A/B because the library proved the
 * equivalence: 0.15.0's release gate 3b ("the frozen render") hashes 120 frames
 * of a pinned scene and finds 0.15.0 with every new option off BIT-IDENTICAL to
 * 0.14.1 (dev/PORT-0.15-REPORT.md: hash 31a25b4d on both trees, floor exactly
 * zero). OLD below is that same option set.
 *
 * One browser per CELL. Toggling motionVectors reallocates the G-buffer, and on
 * a machine whose GPU is at 100% with 10.5 of 12 GB of VRAM already spoken for,
 * doing that a hundred times in one context lost the context and killed a run.
 *
 *   node tools/harness/optcost.mjs [levels] [pairs] [cells]
 */
import { launch, newPage, boot, installHooks, freezeSim, frames, resetTimers, readFt,
         median, r2, r3, AFTER, LEVELS, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = (process.argv[2] || "0,5").split(",").map(Number);
const PAIRS = Number(process.argv[3] || 8), WIN = 30, WARM = 12;

const OLD = {
  restirDirectionalBypass: false, restirReprojectionRescue: false,
  restirCandidateImportance: false, restirClampRel: 0, motionVectors: false,
  stochasticLights: true, ambient: false,
};
const NEW = {
  restirDirectionalBypass: true, restirReprojectionRescue: true,
  restirCandidateImportance: true, restirClampRel: 2, motionVectors: true,
  stochasticLights: false, ambient: false,
};
const ALL_CELLS = {
  "FLOOR new vs new": [NEW, NEW],
  "all 0.15 flips": [OLD, NEW],
  // Same comparison with motionVectors held ON in both arms. Flipping
  // motionVectors reallocates the G-buffer (a 5th RG32F attachment), and on the
  // heaviest levels, on a machine with 10.5 of 12 GB of VRAM already taken by
  // other sessions, doing that every two seconds lost the WebGL context and
  // killed the cell. This variant never reallocates.
  "all flips, MV pinned on": [{ ...OLD, motionVectors: true }, NEW],
  "sun bypass alone": [{ ...NEW, restirDirectionalBypass: false }, NEW],
  "motion vectors alone": [{ ...NEW, motionVectors: false }, NEW],
  "rescue+importance+cap": [{ ...NEW, restirReprojectionRescue: false, restirCandidateImportance: false, restirClampRel: 0 }, NEW],
};
const wanted = (process.argv[4] || "").split(",").filter(Boolean);
const CELLS = Object.fromEntries(Object.entries(ALL_CELLS).filter(([k]) => !wanted.length || wanted.some((w) => k.includes(w))));

const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

async function armMs(page, opts) {
  await page.evaluate((o) => {
    const rt = window.UMBRAL.rt;
    for (const [k, v] of Object.entries(o)) rt[k] = v;
    if (rt.resetAccumulation) rt.resetAccumulation();
  }, opts);
  await resetTimers(page);
  await frames(page, WARM + WIN);
  const ft = (await readFt(page)).slice(WARM);
  return pct(ft, 0.1);
}

async function runCell(lv, [a, b]) {
  const browser = await launch();
  try {
    const page = await newPage(browser);
    let crashed = false;
    page.on("crash", () => { crashed = true; });
    const info = await boot(page, AFTER, lv, { preset: "perf" });
    await installHooks(page);
    await freezeSim(page);
    const ratios = [], A = [], B = [];
    for (let i = 0; i < PAIRS; i++) {
      if (crashed) throw new Error("renderer crashed");
      const ra = await armMs(page, a);
      const rb = await armMs(page, b);
      A.push(ra); B.push(rb); ratios.push(rb / ra);
    }
    return {
      aP10: r2(median(A)), bP10: r2(median(B)), ratio: r3(median(ratios)),
      iqr: r3(pct(ratios, 0.75) - pct(ratios, 0.25)),
      spread: r3(Math.max(...ratios) - Math.min(...ratios)), ratios: ratios.map(r3),
      canvas: info.canvas,
    };
  } finally { await browser.close(); }
}

const out = [];
for (const lv of levels) {
  console.log(`\n=== L${lv} ${LEVELS[lv]} ===`);
  const cells = {};
  for (const [name, arms] of Object.entries(CELLS)) {
    let r = null, err = null;
    for (let attempt = 0; attempt < 2 && !r; attempt++) {
      try { r = await runCell(lv, arms); } catch (e) { err = String(e.message || e); }
    }
    cells[name] = r || { error: err };
    console.log(r
      ? `  ${name.padEnd(24)} ${r.aP10} -> ${r.bP10} ms   ratio ${r.ratio}  (IQR ${r.iqr}, spread ${r.spread})`
      : `  ${name.padEnd(24)} FAILED: ${err}`);
  }
  out.push({ level: lv, name: LEVELS[lv], cells });
}
writeFileSync(resolve(HERE, "optcost.json"), JSON.stringify(out, null, 2));
console.log("\nwrote tools/harness/optcost.json");
