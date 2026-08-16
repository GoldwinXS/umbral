/**
 * Part C.2: noise in motion, before vs after, on L0 (Ashway, night + moon) and
 * L7 (Reliquary, emissive-heavy at the 256-triangle cap).
 *
 * THE PROTOCOL, written out because the spec's one-line version ("2.4 rad/s yaw
 * for 60 frames, mean |frame_t - frame_{t+1}| over the last 30") is ambiguous in
 * a way that decides the result. While the camera is turning at 2.4 rad/s the
 * image moves ~2.3 degrees BETWEEN FRAMES, so an inter-frame difference taken
 * during the turn is parallax, not noise: it measures the level, not the
 * estimator. What players actually complain about is the state the turn LEAVES
 * behind, so:
 *
 *   1. third-person (shoulder) view, sim frozen, camera yawed 2.4 rad/s for 60
 *      frames. Every pixel on screen is freshly disoccluded: no reservoir
 *      history, no irradiance history. This is "rotation is the multiplier".
 *   2. STOP. Capture the next 30 frames at that fixed pose.
 *        flicker = mean |frame_t - frame_{t+1}| over those 30 (a static pose, so
 *                  any inter-frame change is the estimator, not the scene)
 *   3. converge 200 more frames at the SAME pose and capture the reference.
 *        grain   = mean |frame - converged| over the same 30 frames
 *   Both in luma of 0..255, on a 320x180 downsample of the traced image (the
 *   overlay pass is not in it: the readback happens inside rt.render).
 *
 * FLOOR: --floor runs the identical arm twice, so the printed floor is the same
 * instrument measuring the same build under the same GPU load.
 *
 *   node tools/harness/noise.mjs [levels] [floor?]
 */
import { launch, newPage, boot, installHooks, freezeSim, setView, turnAndSettle,
         shot, park, wake, r3, AFTER, BEFORE, LEVELS, HERE, frames } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const levels = (process.argv[2] || "0,7").split(",").map(Number);
const floorMode = process.argv[3] === "floor";
const URL_A = floorMode ? AFTER : BEFORE;

const out = [];
for (const lv of levels) {
  const bA = await launch(), bB = await launch();
  const pA = await newPage(bA), pB = await newPage(bB);
  const infoA = await boot(pA, URL_A, lv, { preset: "perf" });
  const infoB = await boot(pB, AFTER, lv, { preset: "perf" });
  const views = [];
  for (const p of [pA, pB]) { await installHooks(p); await freezeSim(p); views.push(await setView(p, "shoulder")); }
  console.log(`  view state: ${JSON.stringify(views)}`);
  // let the view ease settle in both arms, then start from the same pose
  await wake(pA); await park(pB); await frames(pA, 60);
  await wake(pB); await park(pA); await frames(pB, 60);

  await wake(pA); await park(pB);
  const a = await turnAndSettle(pA);
  const shotA = await shot(pA, `noise-${floorMode ? "floorA" : "before"}-L${lv}-${LEVELS[lv]}`);
  await wake(pB); await park(pA);
  const b = await turnAndSettle(pB);
  const shotB = await shot(pB, `noise-${floorMode ? "floorB" : "after"}-L${lv}-${LEVELS[lv]}`);

  const row = {
    level: lv, name: LEVELS[lv], mode: floorMode ? "floor (after vs after)" : "before vs after", views,
    before: { flicker: r3(a.flicker), grain: r3(a.grain), refMean: r3(a.refMean), frames: a.frames },
    after: { flicker: r3(b.flicker), grain: r3(b.grain), refMean: r3(b.refMean), frames: b.frames },
    dFlicker: r3(b.flicker - a.flicker), dGrain: r3(b.grain - a.grain),
    shots: [shotA, shotB],
    versions: [infoA.version, infoB.version],
  };
  out.push(row);
  console.log(`L${lv} ${LEVELS[lv]} ${row.mode}: flicker ${row.before.flicker} -> ${row.after.flicker} | grain ${row.before.grain} -> ${row.after.grain} | refMean ${row.before.refMean} / ${row.after.refMean}`);
  await bA.close(); await bB.close();
}
writeFileSync(resolve(HERE, floorMode ? "noise-floor.json" : "noise.json"), JSON.stringify(out, null, 2));
console.log(`wrote tools/harness/${floorMode ? "noise-floor.json" : "noise.json"}`);
