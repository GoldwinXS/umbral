# SPEC: Umbral on three-realtime-rt 0.15.0, and a graphics-settings rework to match

Owner of the design: Fable (main session). Implementer: an Opus agent in THIS worktree
(`C:\ClaudeSessions\umbral-wt\rt015`, branch `rt-0.15`, dev server
`node node_modules/vite/bin/vite.js --port 5182 --strictPort` from this directory; the repo's own dev
scripts use 5180/5181, which other sessions may hold). Do not run git. Do not touch
`C:\ClaudeSessions\KimiGame\umbral` (the owner's main checkout) or `node_modules` (npm-pristine 0.15.0
is already installed here: `package.json` says `three-realtime-rt@0.15.0`, keep it). No em dashes, no
emojis. Deploy is not yours: Fable commits, pushes to `main`, and GitHub Actions builds `dist` to Pages
(https://goldwinxs.github.io/umbral/), so `npm run build` must pass at the end.

## The owner's words

"Can you also get an agent to upgrade umbral to 0.15.0? That is my showcase RT game and I think it
desperately needs these fixes. We might want to have that agent rework the graphics settings a bit."

## What 0.15.0 changes that matters to Umbral (read the library's CHANGELOG.md and README first:
`C:\ClaudeSessions\RayTracingUpgradeChallenge\CHANGELOG.md`, `README.md` options table, and
`dev/PORT-0.15-REPORT.md` for the measured numbers; the source is `node_modules/three-realtime-rt/src`)

1. **Defaults changed**: `gi:false` (Umbral already), `stochasticLights:false` (Umbral's `perf`
   preset sets `stochastic:true`; under `restir:true` the flag is dead anyway, and Umbral's own note
   from 2026-07-25 says "stochasticLights dead under restir"), `restirDirectionalBypass`,
   `restirReprojectionRescue`, `restirCandidateImportance` on, `restirClampRel 2`, `motionVectors`
   on. Together they measured 1.01x the 0.14.1 frame time on the library's museum, and they are the
   estimator being RIGHT: the sun no longer poisons reservoirs (M6 Chandlery's ~52 degree
   directional; M5 dawn), thin geometry warms under TAA jitter (Umbral's third-person "rotation is
   the multiplier" flicker finding), candidates follow light power (four levels sit exactly at the
   256 emissive-tri cap: Lantern-Ways, Chandlery, Spire, Reliquary; stock spent most candidates on
   the dimmest tris), and the relative firefly cap stops bright surfaces converging dark.
2. **`ambient` is NEW and defaults to `true`: `AmbientLight`/`HemisphereLight` are now honoured as an
   unoccluded flat term.** Umbral has `new THREE.AmbientLight(TUNE.sky.color, TUNE.sky.intensity)` in
   `src/levels/mission1.js:554` (0x25324a, 0.4) and `src/levels/chandlery.js:664` (0x2c3a55, 0.42),
   authored as "visual-only sky fill the light meter never reads" when the engine IGNORED it. On
   0.15.0 those two levels will suddenly get 0.4 x colour of flat light on every surface, which
   contradicts the analytic light meter (the game's single source of truth: darkness must READ dark).
   Decision for this upgrade: construct the tracer with **`ambient: false`** (bit-identical to the
   pre-0.15 handling), then run the A/B in Part C and report whether a faint ambient (try 0.10 x
   those colours) improves the two levels without lifting the deep shadow the meter calls 0.06; if
   it does, propose the numbers, do not ship them without saying so.
3. **New `RealtimeRaytracer.DEFAULTS`** (frozen flat object of every live-assignable default) exists
   for exactly the reset button Umbral lacks. `PRESETS.balanced` = the constructor defaults written
   out; `recommendedOptions(tier)` still exists (Umbral calls it at `src/main.js:345`).
4. New options to consider exposing: `restirClampRel` (0-4), `restirWarmAge` (0 default; the cold
   fallback costs a lot, leave 0), `restirSamples`, and the two toggles above; `motionVectors`
   requires nothing from the game beyond the `dynamicMeshes` it already registers.
5. Governor behaviour changed in 0.14 -> 0.15 (two-way adaptive governor + GpuTimer deadlock fix): the
   `denoiseIterations` property override at `src/main.js:377-395` (the game intercepts the library's
   overload brake) must be re-read against 0.15.0's `RealtimeRaytracer.js` and either kept, adapted,
   or removed with a sentence of proof.

## Part A: the upgrade (mechanical, then honest)

- `src/main.js` `_makeRT` (line ~345): pass `ambient:false` explicitly; keep `gi:false`, `restir:true`,
  `emissiveNEE`, `specular`, `overscan`, `dispersion 0.12` as they are; DROP `stochasticLights` from
  the constructor unless the settings model still needs it (see Part B); check every option name
  against 0.15.0's README table and `index.d.ts` (a renamed or removed option must not silently
  no-op: assert each key exists on the instance after construction, log any that do not).
- `src/settings.js`: `rt.stochasticLights = this.stochastic` (line ~143) and the `stochastic` preset
  field: remove or retire (Part B decides).
- The `denoiseIterations` interceptor: verify against 0.15.0 (Part A.5 above).
- `taaJitterScale = resolution * governorScale` (settings.js:132): confirm 0.15.0 still has
  `taaJitterScale`; keep.
- `npm run build` passes; the built `dist` runs (`vite preview`) with no console errors on level 0.

## Part B: the graphics-settings rework

Constraints from the owner's history (do not break them): conservative defaults so it ALWAYS loads
on weak GPUs and phones ("if it doesn't work I want it to feel like user error"); the adaptive
governor ON so strong GPUs climb; beauty opt-in; a returning player's explicit choices survive an
upgrade; RT unsupported still falls back to raster with the "flat-lighting fallback" prompt.

Design:
1. **Presets re-derived on 0.15.0**: keep three tiers (`perf`, `bal`, `beauty`) but define each as
   the 0.15.0 constructor defaults PLUS a short list of deltas (`renderScale`, canvas `resolution`,
   `denoise` iterations, `volumetric`, `reflections`, `refraction`, `targetFps`, `adaptive`), and
   nothing else. `stochastic` disappears from presets and UI (dead under restir; if the governor
   turns it on internally that is the library's business). Print each preset as JSON in the report.
2. **Reset to defaults** button in the settings panel: restores the game's `perf` preset AND
   re-applies `RealtimeRaytracer.DEFAULTS` for every knob the panel exposes, clears the saved
   settings key, resets accumulation. Verify by changing five things, pressing it, reading back.
3. **Saved-settings migration**: bump the localStorage key or add a `schema` field: settings saved
   under 0.14.x are migrated field by field (known keys copied; `stochastic` dropped; a saved named
   preset adopts the retuned tier as today; a saved `custom` keeps its explicit values). The Hangar
   lesson this week: stale persisted knobs silently override new defaults and hide the fix from the
   owner's iPad until Reset is pressed. Do not let that happen here: anything not explicitly set by
   the player must come from the NEW defaults.
4. **Panel structure**: Quality (preset buttons + Reset), Picture (trace resolution, canvas
   resolution, denoise, TAA, effects opacity), Traced features (volumetric, reflections, refraction,
   GI + half-rate as today with its meter caveat), Advanced (ReSTIR relative cap slider 0-4, sun
   bypass, reprojection rescue, candidate importance, motion vectors, adaptive governor + target FPS,
   overscan readout). Touch, view, auto-follow stay where they are. Every knob has the same
   live-apply path as today (`Settings.apply()` -> `_applyRT`).
5. Keep the panel usable on a phone in landscape (it is a stealth game played on iPad; check the
   panel's scroll and touch targets at 812x375).

## Part C: proof (real GPU, headed Chromium, floors beside every number)

Harness in `tools/harness/` (there is no surviving harness on this machine; write a small one:
Playwright, `chromium.launch(headless=False, args=["--use-angle=gl","--enable-webgl",
"--ignore-gpu-blocklist"])`, `page.add_init_script` that redefines `document.visibilityState`/
`document.hidden` to report visible (the game's `_loop` returns early when hidden and never clears the
boot overlay: this bit two agents before), ONE level per browser boot (multi-reload loses the GL
context), never judge a capture by file size (a dark night frame is a few kB), open the PNG. Drive
levels via `window.UMBRAL` (`g.loadLevel(i)`, `g._step(dt,t)`, `g.player.pos`, `g.input`), and
converge 200 frames before a still. Levels to measure: L0 (Ashway, night, moon), L5 (Chandlery, day,
directional sun), L7 (Reliquary, emissive-heavy at the 256 cap), plus L4 (Lanternways, mirror
water). Two arms: **before** = the owner's main checkout on 0.14.1 (start it yourself on port 5183:
`node node_modules/vite/bin/vite.js --port 5183 --strictPort` from `C:\ClaudeSessions\KimiGame\umbral`,
read-only, and stop it when done) and **after** = this worktree on 5182.

1. **Frame time** at 1280x720 on each level and preset (perf/bal/beauty), before vs after, twice
   each; report median ms and the ratio. Expectation from the library: ~1.0x; the sun bypass costs
   one shadow ray per pixel on L5 (report it).
2. **Noise in motion**: the third-person turn (2.4 rad/s yaw for 60 frames, the game's own noise
   protocol from 2026-07-25) on L0 and L7: mean |frame_t - frame_{t+1}| luminance over the last 30
   frames (flicker) and mean |frame - converged| (grain), before vs after, floors beside. Expectation:
   after < before on both, by a margin above 2x the floor; if not, say so plainly.
3. **The two AmbientLight levels** (L1 mission1 = the yards, L5 chandlery): stills of the spawn view
   and one dark corner, three arms: 0.14.1, 0.15.0 `ambient:false`, 0.15.0 `ambient:true` at 0.10 x
   the authored colours. Report mean luma of a marked deep-shadow patch and of a lit patch in each
   arm, and the analytic meter value at that spot (`g._computePlayerVis()` after `g.player.pos.set`)
   so the picture/meter agreement can be judged.
4. **Sun levels**: L5 spawn view converged, before vs after (the reservoir-poisoning fix should show
   as less speckle in sun-shadowed interiors); mean |before - after| with a floor.
5. **Settings**: the five-change Reset test, the migration test (seed a 0.14-shaped saved blob incl.
   `stochastic:true` and `preset:"perf"`, boot, read back), and a phone-landscape screenshot of the
   panel.
6. `npm run build` clean; `dist` boots on L0 via `vite preview` in headed Chromium with zero console
   errors; the raster fallback prompt still appears when WebGL2 is forced off (`--disable-webgl2`
   or `chromium.launch(args=["--disable-gpu"])`, say which you used).

Save every frame under `tools/harness/shots/` with arm and level in the name. Fable views them.

## Deliverables

The code, `tools/harness/*.mjs|py`, `docs/RT-0.15-REPORT.md` with every table (numbers with floors),
the preset JSON, the ambient recommendation, anything that surprised you, and the URLs
(`http://localhost:5182/` for the worktree, `http://localhost:5183/` for the before arm while it is
up). Final message = that report verbatim.
