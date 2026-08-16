/**
 * Part C.5: the settings rework, proven rather than asserted.
 *
 *  1. RESET: change five things THROUGH THE CONTROLS (not through the model),
 *     poison localStorage, press the button, and read back both the game state
 *     and the tracer's own properties against RealtimeRaytracer.DEFAULTS.
 *  2. MIGRATION: seed a 0.14-shaped save (v2, with `stochastic: true`) in three
 *     shapes (named preset, custom, and a v1 save with no version field), boot,
 *     and read back what survived.
 *  3. PHONE LANDSCAPE: 812x375, the panel open, with and without the Advanced
 *     group expanded; screenshots plus the measured scroll geometry and the
 *     smallest touch target.
 *
 *   node tools/harness/settings.mjs
 */
import { launch, newPage, shot, r3, AFTER, HERE } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const KEY = "umbral.settings";
const out = {};

async function openPanel(page) {
  await page.waitForFunction(() => window.UMBRAL && window.UMBRAL.settings && document.getElementById("set_renderScale"));
  await page.click("#btnSettings");
  await page.waitForSelector("#settings:not(.hidden)");
}

// ---------------------------------------------------------------- 1. RESET
{
  const browser = await launch();
  const page = await newPage(browser);
  await page.goto(AFTER, { waitUntil: "load" });
  await openPanel(page);

  const before = await page.evaluate(() => {
    const s = window.UMBRAL.settings, rt = window.UMBRAL.rt;
    return { preset: s.preset, renderScale: s.renderScale, volumetric: s.volumetric, gi: s.gi, reflections: s.reflections, restirClampRel: s.restirClampRel, rtClamp: rt.restirClampRel, rtGi: rt.gi };
  });

  // five changes, each through the control the player uses
  await page.evaluate(() => {
    const drag = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); };
    drag("set_renderScale", 0.9);
    document.getElementById("set_volumetric").click();
    document.getElementById("set_reflections").click();
    document.getElementById("set_gi").click();
    document.querySelector(".setgroup:nth-of-type(3)").open = true;
    drag("set_restirClampRel", 0);
    // and a knob nobody exposes, moved behind the panel's back, plus a poisoned save
    window.UMBRAL.rt.restirMCap = 40;
    localStorage.setItem("umbral.settings", JSON.stringify({ v: 3, preset: "custom", renderScale: 0.9, junk: 1 }));
  });
  const changed = await page.evaluate(() => {
    const s = window.UMBRAL.settings, rt = window.UMBRAL.rt;
    return { preset: s.preset, renderScale: s.renderScale, volumetric: s.volumetric, gi: s.gi, reflections: s.reflections, restirClampRel: s.restirClampRel, rtClamp: rt.restirClampRel, rtGi: rt.gi, rtRenderScale: rt.renderScale, rtMCap: rt.restirMCap, saved: localStorage.getItem("umbral.settings") };
  });

  await page.click("#setReset");
  const after = await page.evaluate(() => {
    const g = window.UMBRAL, s = g.settings, rt = g.rt;
    const D = rt.constructor.DEFAULTS;
    // Every DEFAULTS key that the game does not deliberately override must now
    // equal the library's own default on the live tracer.
    const skip = new Set(["dispersion", "volumetric", "overscan", "ambient", "renderScale", "denoiseIterations", "targetFps", "adaptiveQuality"]);
    const wrong = [];
    for (const [k, v] of Object.entries(D)) {
      if (skip.has(k)) continue;
      if (rt[k] !== v) wrong.push([k, v, rt[k]]);
    }
    // and the UI must agree with the model, control by control
    const uiWrong = [];
    for (const k of ["renderScale", "resolution", "denoise", "targetFps", "overlayOpacity", "restirClampRel"]) {
      const el = document.getElementById("set_" + k);
      if (el && Number(el.value) !== Number(s[k])) uiWrong.push([k, el.value, s[k]]);
    }
    for (const k of ["taa", "volumetric", "reflections", "refraction", "gi", "restirDirectionalBypass", "restirReprojectionRescue", "restirCandidateImportance", "motionVectors", "adaptive", "touch", "view3p", "autoFollow"]) {
      const el = document.getElementById("set_" + k);
      if (el && el.classList.contains("on") !== !!s[k]) uiWrong.push([k, el.classList.contains("on"), s[k]]);
    }
    return {
      preset: s.preset, renderScale: s.renderScale, volumetric: s.volumetric, gi: s.gi,
      reflections: s.reflections, restirClampRel: s.restirClampRel,
      rtClamp: rt.restirClampRel, rtGi: rt.gi, rtRenderScale: rt.renderScale, rtMCap: rt.restirMCap,
      rtAmbient: rt.ambient, rtDispersion: rt.dispersion,
      libDefaultsWrong: wrong, uiWrong,
      savedAfterReset: localStorage.getItem("umbral.settings"),
      presetSelected: document.getElementById("prePerf").classList.contains("sel"),
    };
  });
  out.reset = { before, changed, after };
  console.log("RESET");
  console.log("  changed:", JSON.stringify(changed));
  console.log("  after  :", JSON.stringify(after));
  await browser.close();
}

// ------------------------------------------------------------ 2. MIGRATION
const SEEDS = {
  "v2 named preset": { v: 2, preset: "perf", renderScale: 0.55, resolution: 0.6, taa: true, denoise: 2, volumetric: false, reflections: false, stochastic: true, adaptive: true, targetFps: 50, sound: true, overlayOpacity: 0.2, touch: false, view3p: false, autoFollow: true, gi: false },
  "v2 custom": { v: 2, preset: "custom", renderScale: 0.85, resolution: 0.9, taa: false, denoise: 4, volumetric: true, reflections: true, stochastic: true, adaptive: false, targetFps: 60, sound: false, overlayOpacity: 0.3, touch: false, view3p: true, autoFollow: false, gi: true },
  "v1 custom (no version field)": { preset: "custom", renderScale: 0.4, resolution: 0.6, taa: true, denoise: 3, volumetric: false, reflections: false, stochastic: true, adaptive: true, targetFps: 50, sound: true, overlayOpacity: 1.0, touch: false, view3p: false, autoFollow: true, gi: false },
};
out.migration = {};
for (const [name, blob] of Object.entries(SEEDS)) {
  const browser = await launch();
  const page = await newPage(browser, { seedStorage: { [KEY]: JSON.stringify(blob) } });
  await page.goto(AFTER, { waitUntil: "load" });
  await page.waitForFunction(() => window.UMBRAL && window.UMBRAL.settings);
  const got = await page.evaluate(() => {
    const s = window.UMBRAL.settings, rt = window.UMBRAL.rt, D = rt.constructor.DEFAULTS;
    const libKnobs = ["restirClampRel", "restirDirectionalBypass", "restirReprojectionRescue", "restirCandidateImportance", "motionVectors"];
    return {
      v: s.v, preset: s.preset, renderScale: s.renderScale, resolution: s.resolution,
      denoise: s.denoise, taa: s.taa, volumetric: s.volumetric, reflections: s.reflections,
      refraction: s.refraction, adaptive: s.adaptive, targetFps: s.targetFps, gi: s.gi,
      view3p: s.view3p, autoFollow: s.autoFollow, overlayOpacity: s.overlayOpacity,
      stochasticPresent: "stochastic" in s,
      libKnobs: Object.fromEntries(libKnobs.map((k) => [k, s[k]])),
      libKnobsMatchLibrary: libKnobs.every((k) => s[k] === D[k]),
      rtStochastic: rt.stochasticLights,
      savedBlob: localStorage.getItem("umbral.settings"),
    };
  });
  out.migration[name] = { seeded: blob, got };
  console.log(`\nMIGRATION ${name}`);
  console.log("  ", JSON.stringify(got));
  await browser.close();
}

// ------------------------------------------------------- 3. PHONE LANDSCAPE
// Each section is wrapped: on this machine a Chromium renderer occasionally dies
// outright while the GPU is saturated by other sessions, and one dead browser
// should cost one section, not the whole run.
try {
  const browser = await launch();
  const page = await newPage(browser, { width: 812, height: 375 });
  await page.goto(AFTER, { waitUntil: "load" });
  await openPanel(page);
  const geomClosed = await page.evaluate(() => {
    const p = document.querySelector("#settings .panel");
    const boxes = [...document.querySelectorAll("#settings .toggle, #settings .btn, #settings input[type=range], #settings summary")].map((e) => { const r = e.getBoundingClientRect(); return { tag: e.id || e.tagName, w: Math.round(r.width), h: Math.round(r.height) }; });
    return { scrollHeight: p.scrollHeight, clientHeight: p.clientHeight, scrollable: p.scrollHeight > p.clientHeight, minTouchH: Math.min(...boxes.map((b) => b.h)), boxes: boxes.slice(0, 6) };
  });
  const s1 = await shot(page, "settings-phone-landscape-closed");
  await page.evaluate(() => { document.querySelectorAll("#settings .setgroup").forEach((d) => (d.open = true)); });
  const geomOpen = await page.evaluate(() => {
    const p = document.querySelector("#settings .panel");
    p.scrollTop = p.scrollHeight;
    return { scrollHeight: p.scrollHeight, clientHeight: p.clientHeight, scrolledTo: p.scrollTop, bottomReached: Math.abs(p.scrollTop + p.clientHeight - p.scrollHeight) < 2 };
  });
  const s2 = await shot(page, "settings-phone-landscape-open-bottom");
  await page.evaluate(() => { document.querySelector("#settings .panel").scrollTop = 0; });
  const s3 = await shot(page, "settings-phone-landscape-open-top");
  out.phone = { geomClosed, geomOpen, shots: [s1, s2, s3] };
  console.log("\nPHONE 812x375:", JSON.stringify({ geomClosed, geomOpen }));
  await browser.close();
} catch (e) { out.phoneError = String(e.message || e).split("\n")[0]; console.log("PHONE section failed:", out.phoneError); }

// --------------------------------------------------- 4. DESKTOP PANEL SHOT
try {
  const browser = await launch();
  const page = await newPage(browser);
  await page.goto(AFTER, { waitUntil: "load" });
  await openPanel(page);
  await shot(page, "settings-desktop-closed");
  await page.evaluate(() => { document.querySelectorAll("#settings .setgroup").forEach((d) => (d.open = true)); });
  await shot(page, "settings-desktop-all-open");
  await page.evaluate(() => { const p = document.querySelector("#settings .panel"); p.scrollTop = p.scrollHeight; });
  await shot(page, "settings-desktop-all-open-bottom");
  console.log("desktop panel shots taken");
  await browser.close();
} catch (e) { out.desktopError = String(e.message || e).split("\n")[0]; console.log("DESKTOP section failed:", out.desktopError); }

writeFileSync(resolve(HERE, "settings.json"), JSON.stringify(out, null, 2));
console.log("\nwrote tools/harness/settings.json");
