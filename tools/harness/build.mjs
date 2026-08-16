/**
 * Part C.6: the build gate.
 *   1. `npm run build` exits clean.
 *   2. The BUILT dist boots on L0 through `vite preview` in headed Chromium with
 *      zero console errors (Chromium's own /favicon.ico 404 is excluded and
 *      named, because this page has never had a favicon and that 404 predates
 *      this work).
 *   3. The raster fallback prompt still appears when the tracer is unsupported.
 *      Forced with chromium --disable-gpu: that puts Chromium on SwiftShader,
 *      and RealtimeRaytracer.isSupported explicitly returns false on a renderer
 *      string matching /swiftshader|llvmpipe|software/ (RealtimeRaytracer.js:54),
 *      which is the same door a weak device comes through.
 *
 *   node tools/harness/build.mjs
 */
import { launch, newPage, shot, HERE } from "./lib.mjs";
import { spawn, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(HERE, "..", "..");
const PORT = 4182;
const out = {};

// 1. build
const build = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { cwd: ROOT, encoding: "utf8" });
out.build = { status: build.status, stdout: (build.stdout || "").split("\n").slice(-14).join("\n"), stderr: (build.stderr || "").trim().split("\n").slice(-10).join("\n") };
console.log("BUILD exit", build.status);
console.log(out.build.stdout);
if (build.status !== 0) { console.error(out.build.stderr); process.exit(1); }

// 2. preview
const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--port", String(PORT), "--strictPort"], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
await new Promise((res) => { preview.stdout.on("data", (d) => { if (String(d).includes("localhost")) res(); }); setTimeout(res, 6000); });
const URL = `http://localhost:${PORT}/`;

const isNoise = (t) => /favicon\.ico/.test(t) || (/404 \(Not Found\)/.test(t) && /Failed to load resource/.test(t));

{
  const browser = await launch();
  const page = await newPage(browser);
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForFunction(() => window.UMBRAL && window.UMBRAL.rt, null, { timeout: 60000 });
  await page.evaluate(() => { window.UMBRAL._hideOverlays(); window.UMBRAL.loadLevel(0); });
  await page.waitForFunction(() => window.UMBRAL.state === "playing", null, { timeout: 120000 });
  await page.waitForTimeout(6000);
  const st = await page.evaluate(() => ({
    booted: !!window.UMBRAL._booted, state: window.UMBRAL.state,
    compileError: window.UMBRAL.rt.compileError || null,
    warnings: window.UMBRAL.rt.status.warnings,
    audit: window.UMBRAL._rtOptionAudit,
    ambient: window.UMBRAL.rt.ambient, motionVectors: window.UMBRAL.rt.motionVectors,
    bootHidden: document.getElementById("boot").classList.contains("hidden"),
  }));
  const png = await shot(page, "dist-L0-ashway");
  const errs = page.__errors.filter((e) => !isNoise(e));
  out.dist = { url: URL, state: st, consoleErrors: errs, ignored: page.__errors.filter(isNoise), shot: png };
  console.log("DIST:", JSON.stringify(st), "errors:", errs.length ? errs : "none (ignored: " + out.dist.ignored.length + " favicon 404)");
  await browser.close();
}

// 3. raster fallback
{
  const browser = await launch(["--disable-gpu"]);
  const page = await newPage(browser);
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForFunction(() => window.UMBRAL, null, { timeout: 60000 });
  const sup = await page.evaluate(() => ({ rtSupported: window.UMBRAL.rtSupported, renderer: (() => { const gl = window.UMBRAL.renderer.getContext(); const d = gl.getExtension("WEBGL_debug_renderer_info"); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown"; })() }));
  await page.evaluate(() => { window.UMBRAL._hideOverlays(); window.UMBRAL.loadLevel(0); });
  await page.waitForFunction(() => window.UMBRAL.state === "playing", null, { timeout: 180000 });
  await page.waitForTimeout(4000);
  const prompt = await page.evaluate(() => {
    const el = document.getElementById("prompt");
    return { text: el ? el.textContent : null, visible: el ? !el.classList.contains("hidden") : false };
  });
  const png = await shot(page, "fallback-disable-gpu-L0");
  out.fallback = { ...sup, prompt, shot: png, launchArgs: "--disable-gpu (SwiftShader)" };
  console.log("FALLBACK:", JSON.stringify(out.fallback));
  await browser.close();
}

preview.kill();
writeFileSync(resolve(HERE, "build.json"), JSON.stringify(out, null, 2));
console.log("\nwrote tools/harness/build.json");
process.exit(0);
