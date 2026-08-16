/**
 * Scene census: what each level actually contains, on the 0.15.0 build. The
 * report's cost claims only mean something beside these numbers, because the library's
 * own defaults benchmark ran on a scene with NO directional, ambient or
 * hemisphere light at all, which is why "the correctness fixes are free" does
 * not transfer to this game unexamined.
 *
 * One level per browser boot (rule 2).
 *
 *   node tools/harness/scenes.mjs [levels]
 */
import { launch, newPage, boot, AFTER, LEVELS, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = (process.argv[2] || "0,1,2,3,4,5,6,7").split(",").map(Number);
const out = [];
for (const lv of levels) {
  let info = null, err = null;
  // Retry once: a browser launch on this machine occasionally dies outright
  // while the GPU is loaded, and one dead launch should not cost the census.
  for (let attempt = 0; attempt < 3 && !info; attempt++) {
    const browser = await launch();
    try {
      const page = await newPage(browser);
      info = await boot(page, AFTER, lv, { preset: "perf" });
    } catch (e) { err = String(e.message || e).split("\n")[0]; }
    finally { await browser.close(); }
  }
  if (!info) { console.log(`L${lv} ${LEVELS[lv]} FAILED: ${err}`); out.push({ level: lv, name: LEVELS[lv], error: err }); continue; }
  out.push({ level: lv, name: LEVELS[lv], ...info.scene, canvas: info.canvas, motionVectorsSupported: info.lib.motionVectorsSupported });
  console.log(`L${lv} ${LEVELS[lv].padEnd(14)} lights ${String(info.scene.lights).padStart(3)}  emissiveTris ${String(info.scene.emissiveTris).padStart(4)}  directional ${info.scene.directional}  ambient ${JSON.stringify(info.scene.ambientLights)}  diag ${info.scene.diagonal}  warn ${info.scene.warnings.length}`);
}
writeFileSync(resolve(HERE, "scenes.json"), JSON.stringify(out, null, 2));
console.log("\nwrote tools/harness/scenes.json");
