/**
 * Smoke test: does the arm boot, load a level, render non-black pixels, and
 * report the option set we think it has? Run this before believing any number
 * from the other scripts.
 *   node tools/harness/smoke.mjs <url> <level>
 */
import { launch, newPage, boot, installHooks, freezeSim, frames, readFt, shot, median, r2, mean, frameLuma, AFTER, LEVELS } from "./lib.mjs";

const url = process.argv[2] || AFTER;
const level = Number(process.argv[3] ?? 0);
const tag = url.includes("5183") ? "before" : "after";

const browser = await launch();
const page = await newPage(browser);
const info = await boot(page, url, level, { preset: "perf" });
console.log(JSON.stringify(info, null, 2));
await installHooks(page);
await freezeSim(page);
await frames(page, 200);
const ft = await readFt(page);
const lum = await frameLuma(page);
const nonzero = lum.filter((v) => v > 1).length;
console.log(`frames=${ft.length} medianFrameMs=${r2(median(ft.slice(20)))} meanLuma=${r2(mean(lum))} pixels>1=${nonzero}/${lum.length}`);
const p = await shot(page, `smoke-${tag}-L${level}-${LEVELS[level]}`);
console.log("shot:", p);
console.log("console errors:", page.__errors.length ? page.__errors : "none");
await browser.close();
