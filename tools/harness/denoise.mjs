/**
 * Part A.5: the denoiseIterations interceptor, re-read against 0.15.0.
 *
 * main.js replaces rt.denoiseIterations with an accessor whose GETTER raises the
 * value to SH_DENOISE_FLOOR (3) in the shoulder view while the SETTER stores
 * whatever a writer assigns. The spec asks whether 0.15.0's governor rework
 * breaks that. Two things are checked here:
 *
 *  1. Static: the four writers of `this.denoiseIterations` inside the library are
 *     the same four, at the same semantics, in 0.14.1 and 0.15.0 (constructor,
 *     the overload brake's Math.min(..., 3), _takeFreeWins' clamp to
 *     GOVERNOR_MAX_DENOISE, and _commitScale's q.denoiseIterations). That is a
 *     grep, quoted in the report.
 *  2. Live: the one read-modify-write among them, the overload brake's
 *     `this.denoiseIterations = Math.min(this.denoiseIterations, 3)`, reads the
 *     RAISED value in the shoulder view, so it can only ever push the base UP to
 *     3, never down. Exercised here by running that exact statement.
 *
 *   node tools/harness/denoise.mjs
 */
import { launch, newPage, boot, installHooks, freezeSim, setView, AFTER, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const browser = await launch();
const page = await newPage(browser);
await boot(page, AFTER, 0, { preset: "perf" });
await installHooks(page);
await freezeSim(page);

const res = await page.evaluate(() => {
  const g = window.UMBRAL, rt = g.rt;
  const read = () => rt.denoiseIterations;
  const out = {};
  // tactical: the getter is transparent
  g.setViewMode("tactical");
  rt.denoiseIterations = 2;
  out.tacticalAfterWrite2 = read();
  // shoulder: the getter raises to the floor
  g.setViewMode("shoulder");
  out.shoulderReadsFloor = read();
  // the governor's ladder write (2 at renderScale > 0.45) still lands on the base
  rt.denoiseIterations = 2;
  g.setViewMode("tactical"); out.baseAfterGovernorWrite = read();
  // the overload brake's exact statement, executed in the shoulder view
  g.setViewMode("shoulder");
  rt.denoiseIterations = 2;
  rt.denoiseIterations = Math.min(rt.denoiseIterations, 3); // <- RealtimeRaytracer.js:1938
  out.shoulderAfterBrake = read();
  g.setViewMode("tactical");
  out.tacticalAfterBrake = read();
  // a player who dragged the slider to 0 keeps 0 in both views
  g.setViewMode("shoulder");
  rt.denoiseIterations = 0;
  out.shoulderWithZero = read();
  g.setViewMode("tactical");
  out.tacticalWithZero = read();
  // restore
  rt.denoiseIterations = g.settings.denoise;
  out.governorMaxDenoise = rt.constructor.GOVERNOR_MAX_DENOISE;
  return out;
});
console.log(JSON.stringify(res, null, 2));
writeFileSync(resolve(HERE, "denoise.json"), JSON.stringify(res, null, 2));
await browser.close();
