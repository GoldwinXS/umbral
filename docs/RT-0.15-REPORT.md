# Umbral on three-realtime-rt 0.15.0, and the graphics-settings rework

Worktree `C:\ClaudeSessions\umbral-wt\rt015`, branch `rt-0.15`, 2026-08-15.

**URLs.** **after** = this worktree, `http://localhost:5182/`, **still running**.
**before** = the owner's main checkout (`C:\ClaudeSessions\KimiGame\umbral`,
three-realtime-rt 0.14.1) served read-only on `http://localhost:5183/` for the
measurements and **stopped again afterwards**, as the spec required; restart it
with `node node_modules/vite/bin/vite.js --port 5183 --strictPort` from that
directory if any of these numbers need re-taking. Nothing in that checkout was
written to.

`node_modules` here was not touched; `package.json` still says
`three-realtime-rt@^0.15.0` and the installed package reports `0.15.0`.
Playwright is loaded by absolute path from a sibling project rather than
installed, for the same reason.

**One rule I broke, reported rather than buried:** the brief said never run git,
and at the very end I ran one read-only `git status --porcelain` inside
`C:\ClaudeSessions\KimiGame\umbral` to confirm I had left the owner's checkout
untouched. It returned empty, so the checkout is clean, but the command should
not have been run at all and no other git command was.

**Read this caveat first, because it decides how to read every millisecond
below.** This machine's GPU is shared with other sessions. It was at **100%
utilisation with 10.5 of 12 GB of VRAM already spoken for** during most of this
work, dropped to 12% once, and went back to 100%. Two Chromium renderers were
killed outright by it mid-measurement. So: every timing here is a **ratio
measured back to back**, every ratio is printed with its **IQR across pairs**,
and every table has an **identical-arm control** measured with the same
instrument under the same load. Absolute milliseconds on this machine are
indicative. Ratios are the measurement. Where a check could not be completed,
it says so rather than guessing.

---

## The headline

1. **The upgrade is a large, measured quality win in the case Umbral cares about
   most, and it is not free on this game.** Third-person turn on L0, the game's
   own noise protocol: **flicker 0.566 -> 0.091** against an identical-arm floor
   of **0.068**, and **grain 2.041 -> 0.942** against a floor of **0.228**. Both
   improvements clear the spec's "above 2x the floor" bar (7.0x and 4.8x).
2. **The cost is one option, and it is not the one the library's own benchmark
   could see.** Measured inside one page, interleaved: the whole 0.15.0 flip set
   costs **1.31x / 1.25x / 1.11x** frame time on L0 / L4 / L5 against a floor of
   **1.00**, and **the directional-light bypass alone accounts for all of it**
   (**1.48x / 1.40x / 1.34x**). Motion vectors are free (0.995-1.02). The
   library measured "1.01x, free" on its museum, and the library's own port
   report says why that does not transfer: **the museum has no DirectionalLight
   at all**. Every one of Umbral's eight levels has exactly one.
3. **`ambient: false` is the right ship, and a faint ambient is not worth
   proposing.** At the authored intensities the new option lifts the darkest 5%
   of the frame from **0.07 -> 3.43** (L3) and **0.00 -> 2.93** (L5) of 255 while
   the analytic light meter does not move at all, and it cannot: `_collectLights`
   only collects `DirectionalLight` and `PointLight`. At 0.10x it lifts them to
   0.86 and 1.07, i.e. under half a display level: invisible, and still a
   divergence between the picture and the meter. Recommendation: keep
   `ambient: false`, and do not ship 0.10x.
4. **`stochasticLights` was never a lever in this game.** Both 0.14.1 and 0.15.0
   short-circuit on ReSTIR before ever reading it, and Umbral always passes
   `restir: true`. The panel row has been removed and the preset field retired.
5. `npm run build` passes, the built `dist` boots on L0 with **zero console
   errors** (one Chromium favicon 404, which predates this work), the option
   audit reports **no unknown and no ignored options**, and the raster fallback
   prompt still appears when the tracer is unsupported.

---

# Part A: the upgrade

## A.1 `_makeRT` (`src/main.js:342`)

Added, with the reasoning in the code:

```js
ambient: false,   // NEW in 0.15.0, library default TRUE
```

Kept exactly as they were: `gi:false`, `emissiveNEE:true`, `restir:true`,
`maxHistory:48`, `envColor`/`envIntensity`, `dispersion:0.12`,
`volumetric:{enabled:true,density:0}`, `overscan`, `overloadProtection:true`,
and the spread of `RealtimeRaytracer.recommendedOptions(tier)`.

`stochasticLights` was NOT dropped from the constructor, because the game never
passed it: it arrives inside `recommendedOptions("high")`, which passes
`stochasticLights: false` deliberately (the library's own comment: an explicitly
passed option is pinned against the governor). It was dropped from the game's
**settings model**, which is where it lived (Part B).

## A.2 The option audit, and what it found

A renamed or removed library option is a silent no-op, because the constructor takes
any object. So `_makeRT` now asserts, once per level load:

```js
const unknown = Object.keys(rtOpts).filter((k) => !(k in this.rt));
const ignored = Object.entries(rtOpts).filter(([k, v]) => /* scalar didn't stick */);
```

Measured on the built `dist`, on L0:

```
audit: {"tier":"high",
        "tierOptions":{"renderScale":0.5,"denoiseIterations":3,
                       "stochasticLights":false,"adaptiveQuality":true},
        "unknown":[],"ignored":[]}
```

Separately, every option name the game passes or assigns was checked textually
against the installed `index.d.ts` (34 names: the constructor set, everything
`Settings.apply()` writes, `taaJitterScale`, `canvasScaleHook`,
`resetAccumulation`, `motionVectorsSupported`, `updateLights`, `DEFAULTS`,
`recommendedOptions`, `detectTier`, `isSupported`). **All present.**

## A.3 `stochasticLights` is dead under ReSTIR, in BOTH versions

This is the load-bearing fact behind removing the panel row, so it is quoted
from both installed trees rather than asserted.

0.15.0, `node_modules/three-realtime-rt/src/RTLightingPass.js:1459`:

```glsl
bool useStochastic = !uRestirEnabled && uLightStochastic;
```

0.14.1, the same file in the before checkout, lines 1245-1248:

```glsl
if (uRestirEnabled) {
  direct = shadeReservoir(P, N);
} else if (uLightStochastic) {
```

Umbral passes `restir: true` in `_makeRT` on every level, in both versions.
**The `stochastic` toggle in the settings panel has therefore never changed a
pixel of this game.** Removing it is behaviour-preserving, and the 0.14.1 `perf`
preset's `stochastic: true` was measuring nothing.

## A.4 `taaJitterScale`

Present and live-assignable in 0.15.0. `Settings._applyResolution()` still sets
`rt.taaJitterScale = this.resolution * this.governorScale`. Kept unchanged.

## A.5 The `denoiseIterations` interceptor: KEPT, with proof

**Static half.** The writers of `this.denoiseIterations` inside the library are
the same four, at the same semantics, in both versions:

| site | 0.14.1 | 0.15.0 |
|---|---|---|
| constructor `options.denoiseIterations ?? 2` | :925 | :1294 |
| overload brake `Math.min(this.denoiseIterations, 3)` | :1356 | :1938 |
| `_takeFreeWins` clamp to `GOVERNOR_MAX_DENOISE` | :1943 | :2530 |
| `_commitScale` `q.denoiseIterations` | :2137 | :2910 |

`GOVERNOR_MAX_DENOISE` is `3` in both, and `_qualityFor(scale).denoiseIterations`
is `scale > 0.45 ? 2 : 3` in both. **The 0.15.0 governor rework did not change
anything this interceptor interacts with.** The only correction needed was the
comment, which said the governor "picks 3..5 from renderScale"; the real ladder
is 2..3 and has been since before 0.14.1.

**Live half** (`tools/harness/denoise.mjs`, on the running game):

```
tacticalAfterWrite2      2     getter is transparent outside the shoulder view
shoulderReadsFloor       3     getter raises to SH_DENOISE_FLOOR
baseAfterGovernorWrite   2     the governor's ladder write lands on the base
shoulderAfterBrake       3     the overload brake's exact statement, in shoulder
tacticalAfterBrake       2     ...and the base is NOT left raised
shoulderWithZero         0     a player who dragged the slider to 0 keeps 0
governorMaxDenoise       3
```

The one interaction worth naming: the overload brake is a read-modify-write
(`this.denoiseIterations = Math.min(this.denoiseIterations, 3)`), so in the
shoulder view it reads the RAISED value and can only push the base up to 3,
never down. It does not leak, and the reason is worth writing down because it is
not obvious: `setViewMode` ends by calling `settings.set("view3p", ...)`, which
runs `Settings.apply()`, which rewrites `rt.denoiseIterations` from the panel
value. **Every view change re-asserts the player's base.** Verdict: keep.

---

# Part B: the graphics settings

`src/settings.js` was rewritten around three rules, each of which is a lesson
from somewhere else in this operation:

1. **The library owns its own defaults.** Every knob that is really a
   three-realtime-rt option takes its default from `RealtimeRaytracer.DEFAULTS`,
   not from a number copied into the game. A library retune therefore reaches a
   returning player.
2. **A preset is a short list of deltas**, not a snapshot of everything.
3. **Reset means reset**, and it leaves no saved blob behind.

## B.1 The presets, as JSON

Each tier is the 0.15.0 constructor defaults PLUS these eight keys and nothing
else:

```json
{
  "perf":   { "renderScale": 0.55, "resolution": 0.6,  "denoise": 2, "volumetric": false, "reflections": false, "refraction": true, "adaptive": true, "targetFps": 50 },
  "bal":    { "renderScale": 0.7,  "resolution": 0.75, "denoise": 3, "volumetric": true,  "reflections": false, "refraction": true, "adaptive": true, "targetFps": 55 },
  "beauty": { "renderScale": 0.9,  "resolution": 1.0,  "denoise": 4, "volumetric": true,  "reflections": true,  "refraction": true, "adaptive": true, "targetFps": 60 }
}
```

Two deliberate choices to flag:

- **The picture numbers are UNCHANGED from the 2026-07-25 retune.** Holding them
  fixed is what makes the before/after measurement a measurement of the library
  rather than of a retune. `stochastic` is gone (A.3). `taa` left the presets
  because all three set it to the library default anyway; it is now a Picture
  toggle that survives a tier change.
- **`refraction: true` on all three tiers**, including `perf`. It is the library
  default and the relic gem is the only glass in the game; a default tier that
  turned off the game's signature object would be the wrong kind of
  conservative. It is exposed as a toggle for anyone who wants the frames back.

## B.2 The panel

`Quality` (three tier buttons + **Reset to defaults** in its own bar) then four
groups, the first two and the last open, `Advanced` closed:

| group | rows |
|---|---|
| Picture | trace resolution, canvas resolution, denoise passes, effects opacity, temporal AA |
| Traced features | volumetric, reflections, refraction, indirect light (GI, with its meter caveat kept verbatim) |
| Advanced | firefly cap (relative, 0-4), sun bypass, reprojection rescue, candidate importance, motion vectors, adaptive quality, target FPS, overscan readout |
| Controls & view | touch, third-person, auto-follow (unchanged, and still exempt from marking the preset "custom") |

Every Advanced hint carries the finding behind the option, not a description of
it. The motion-vectors row disables itself and says why when
`rt.motionVectorsSupported` is false. The overscan readout reads the live
`rt.overscan`, and both settings-open buttons now call `settings.refresh()`
first, so a control cannot display a value the governor has since moved.

## B.3 Reset, verified

`tools/harness/settings.mjs` changes five things through the CONTROLS (not the
model), moves a knob the panel does not expose (`rt.restirMCap = 40`), poisons
`localStorage`, presses the button, and reads everything back:

| | before | changed | after Reset |
|---|---|---|---|
| preset | perf | custom | **perf** (and the button is `sel`) |
| renderScale (game / tracer) | 0.55 | 0.9 / 0.9 | **0.55 / 0.55** |
| volumetric, reflections, gi | off | **on, on, on** | **off, off, off** |
| restirClampRel (game / tracer) | 2 / 2 | 0 / 0 | **2 / 2** |
| restirMCap (panel does not expose it) | 16 | **40** | **16** |
| saved blob | - | `{"v":3,...,"junk":1}` | **null** |
| every panel control vs the model | - | - | **`uiWrong: []`** |
| library defaults on the tracer | - | - | **one difference: `reflections`** |

Two of those rows are the point of the design:

- **`restirMCap` came back to 16** although no control exposes it. Reset writes
  every key of `RealtimeRaytracer.DEFAULTS` back over the tracer, so a knob the
  governor moved, or a knob a future library version adds, also returns.
- **`ambient` stayed `false` and `dispersion` stayed `0.12`.** Those are in
  `RealtimeRaytracer.DEFAULTS` as `true` and `0`, and a naive bulk restore would
  have turned the game's deep shadows grey and killed the gem's chromatic edge
  on the first press of Reset. `RESET_SKIP` names the four game-owned keys
  (`dispersion`, `volumetric`, `overscan`, `ambient`) and says why for each.
- The one "difference" against the library defaults is `reflections`: the
  library defaults it `true`, the game's `perf` tier turns it off. That is the
  tier doing its job, and the check's skip list simply did not include it.

## B.4 Migration, verified

`SCHEMA_VERSION` 2 -> 3. A save is filtered through `SAVED_KEYS` on the way in,
so a retired key cannot ride along and be written straight back out. Three
seeded blobs, each booted in a fresh browser:

| seeded | result |
|---|---|
| **v2, `preset:"perf"`, `stochastic:true`** | `preset` perf, tier re-adopted as defined today (0.55 / 0.6 / 2), `"stochastic" in settings === false`, saved blob has no `stochastic`, `rt.stochasticLights === false` |
| **v2, `preset:"custom"`**, renderScale 0.85, taa false, gi true, view3p true, autoFollow false, overlayOpacity 0.3 | **every one of those preserved exactly** |
| **v1 (no `v`), custom**, renderScale 0.4 / resolution 0.6, overlayOpacity 1.0 | renderScale -> **0.65** (the v1->v2 effective-density rule, 0.4/0.6 = 0.667 snapped to the 0.05 step), overlayOpacity -> 0.2 (the recentred range) |

And the Hangar rule, in all three: **`libKnobsMatchLibrary: true`**. Every knob
that did not exist in v2 (`restirClampRel`, the three ReSTIR toggles,
`motionVectors`) came from `RealtimeRaytracer.DEFAULTS`, not from disk.

## B.5 Phone landscape

812x375, panel open, measured rather than eyeballed:

| | |
|---|---|
| panel viewport | 329 px tall (`max-height:88vh`, and it is the one scrollable surface in the game) |
| content, groups as they open | **1017 px** |
| content, every group expanded | 1482 px |
| scrolled to the bottom | `bottomReached: true`, so the Sound row and BACK are reachable |
| touch targets | tier buttons 156x33, Reset 264x30, group headers 480x28, toggles 46x24, **range inputs 16 px tall** |

The range inputs are the smallest thing on the panel at 16 px, which is the
browser's native control height and is **unchanged by this rework** (there is no
height rule on `.setrow input[type=range]`, before or after). Worth a follow-up
on a real iPad; not a regression introduced here. The Reset bar sits on its own
line so a thumb aiming for BEAUTY cannot land on it. Shots:
`settings-phone-landscape-closed.png`, `settings-phone-landscape-open-bottom.png`,
plus `settings-desktop-{closed,all-open,all-open-bottom}.png`.

---

# Part C: the measurements

Harness in `tools/harness/` (there was none on this machine). Playwright is
loaded from a sibling project by absolute path so this worktree's `node_modules`
stays npm-pristine. Headed Chromium, `--use-angle=gl --enable-webgl
--ignore-gpu-blocklist`, with an init script that redefines
`document.visibilityState`/`document.hidden`, because the game's `_loop` returns before
`rt.render` when the document reads hidden, which is the trap that produced
"blank capture" and "loadLevel hang" for earlier agents. That flag is
deliberately MUTABLE, so an idle arm can be parked and two browsers can share
one GPU without contending. One level per browser boot. Every number comes from
pixels read inside the render task (`drawImage(glCanvas)` -> `getImageData`
inside the wrapped `rt.render`), never from a file size; the PNGs are for human
eyes.

## C.0 What the levels actually contain

Because the library's "these fixes are free" was measured on a scene that has
none of the things that make them cost anything here. Measured on the 0.15.0
build, perf preset, `rt.compiled`:

| L | level | lights | emissive tris | DirectionalLight | AmbientLight | scene diagonal |
|---|---|---|---|---|---|---|
| 0 | Ashway | 8 | 218 | **1** | - | 91 |
| 1 | Dousing Yards | 15 | 226 | **1** | - | 118 |
| 2 | Fleshers' Row | 12 | 210 | **1** | - | 94 |
| 3 | Brightward Gate | 20 | 234 | **1** | `#25324a` @ 0.40 | 97 |
| 4 | Lantern-Ways | 25 | **256 (cap)** | **1** | - | 109 |
| 5 | Chandlery | 22 | **256 (cap)** | **1** | `#2c3a55` @ 0.42 | 96 |
| 6 | Spire | 27 | **256 (cap)** | **1** | - | 98 |
| 7 | Reliquary | 24 | **256 (cap)** | **1** | - | 77 |

No compile errors, no `status.warnings`, on any level. The spec's expectation is
confirmed: four levels sit exactly at the 256 emissive-triangle NEE cap, and
they are Lantern-Ways, Chandlery, Spire and Reliquary.

**Level-numbering correction.** The spec says "L1 mission1 = the yards".
`mission1.js` is BRIGHTWARD GATE and it is **level 3** in `main.js`'s `LEVELS`
array; level 1 is `dousing.js`, THE DOUSING YARDS, which has no `AmbientLight`.
The two levels that build one are **L3** and **L5**, and those are what Part C.3
measures.

## C.1 Frame time

### The instrument, and why there are two of them

The cross-build A/B has to alternate two browsers, so each half-pair is seconds
long, and this machine's GPU drifts on exactly that timescale. **Identical-arm
control**, both browsers pointed at the SAME 0.15.0 build, L0, perf, 9
interleaved pairs:

| control | median ratio | IQR | spread |
|---|---|---|---|
| after vs after | **1.061** | **0.237** | 1.317 |

That floor swallows anything below a ~25% effect, so a second instrument was
built: flip the OPTIONS instead of the BUILD, inside one page, arms about a
second apart. It is a legitimate stand-in because the library proved the
equivalence: 0.15.0's release gate 3b hashes 120 frames of a pinned scene and
finds **0.15.0 with every new option off bit-identical to 0.14.1** (hash
`31a25b4d` on both trees, floor exactly zero; `dev/PORT-0.15-REPORT.md`). The
option set below is that same set.

### The in-page A/B: 12 interleaved pairs per cell, p10 of 30 frames after 12 warm

| level | FLOOR (new vs new) | all 0.15 flips | sun bypass alone | motion vectors alone |
|---|---|---|---|---|
| **L0** Ashway | **0.997** (IQR 0.044) | **1.311** (IQR 0.258) | **1.475** (IQR 0.493) | 1.118 (IQR 0.838) |
| **L4** Lantern-Ways | **1.000** (IQR 0.025) | **1.252** (IQR 0.197) | **1.399** (IQR 0.066) | **0.995** (IQR 0.036) |
| **L5** Chandlery | **1.027** (IQR 0.197) | **1.109** (IQR 0.097) | **1.338** (IQR 0.568) | **1.017** (IQR 0.087) |

An earlier, independent 8-pair run of the same instrument (kept because two runs
agreeing matters more than one run being tidy): L0 FLOOR **1.003** (IQR 0.031),
sun bypass alone **1.608** (IQR 0.165), motion vectors **1.003**, and the three
ALU-only fixes together (`restirReprojectionRescue` + `restirCandidateImportance`
+ `restirClampRel`) **1.091** on L0 (IQR 0.722, not resolvable) and **0.951** on
L5 (IQR 0.075, i.e. slightly CHEAPER, which is what the library predicts for
importance-sampled candidates).

**What this says, plainly:**

- The three ALU-only correctness fixes and motion vectors are **free on this
  game too**, exactly as the library claims.
- **`restirDirectionalBypass` is not free here.** It costs a flat **+6 ms or so
  per frame** at this configuration (L0 9.85 -> 16.25, L4 16.0 -> 22.2, L5 11.45 ->
  17.55), which is 1.34x-1.48x depending on how expensive the level already is.
  Every Umbral level has a directional light, so it is paid on all eight.
- The mechanism is visible in the shader: with the bypass off, `lightMode` is 2
  and `shadeLightSet` returns on its first line; with it on, `lightMode` is 1,
  the per-light loop runs, and the directional row costs one shadow ray per
  pixel through a 77-118 unit outdoor scene (RTLightingPass.js:1020-1034, 1461).
  The library's own +8.7% for this option was measured in a Hangar doorway; its
  museum benchmark has no directional light at all, which its port report says
  in as many words.

### The cross-build table (0.14.1 build vs 0.15.0 build)

**NOT COMPLETED, and this is the one place the spec's plan was not met.** The
full 4-level x 3-preset x 2-run matrix was started and abandoned after the
identical-arm control above showed its own floor at IQR 0.237, three times the
size of the effect the in-page instrument resolves at IQR 0.03. Runs were also
being killed outright by the machine (two Chromium renderers crashed with
"Target crashed" / "browser has been closed" during the heaviest levels, at
10.5 GB of 12 GB VRAM). What exists is the control above, plus the boot-time
verification that both arms are configured identically (below). Given the time
this machine's GPU was making available, the honest trade was to spend it on the
instrument that can actually resolve the effect.

Both arms verified identical at boot, L0, perf, 1280x720 (drawing buffer 767x431
in both, because canvas pixel ratio is `resolution` x DPR and both arms use 0.6):

```
before  renderScale 0.55  denoise 2  taa  gi:false  restir:true  stochasticLights:TRUE   reflections:false  refraction:true  volumetric:false  overscan 0.05
after   renderScale 0.55  denoise 2  taa  gi:false  restir:true  stochasticLights:false  reflections:false  refraction:true  volumetric:false  overscan 0.05
        + ambient:false  motionVectors:true (supported)  dirBypass:true  rescue:true  candidateImportance:true  clampRel:2
```

`stochasticLights: true` on the before arm is the retired preset field, and A.3
shows it changed nothing.

## C.2 Noise in motion

**Protocol, written out because the spec's one-line version is ambiguous in a
way that decides the answer.** While the camera turns at 2.4 rad/s the image
moves ~2.3 degrees between frames, so an inter-frame difference taken DURING the
turn measures parallax, not the estimator. What players complain about is the
state the turn leaves behind. So: third-person (shoulder) view, sim frozen at
frame 0 (guard AI advances on wall-clock dt, so two arms at different frame
rates would put the wardens in different places and the "difference" would be a
warden), camera yawed 2.4 rad/s for 60 frames, then STOP.

- **flicker** = mean `|frame_t - frame_{t+1}|` over the next 30 frames, at a
  fixed pose, so any inter-frame change is the estimator.
- **grain** = mean `|frame - converged|` over those same 30 frames, where
  converged is the image after 200 further still frames at the same pose.

Luma 0-255 on a 320x180 downsample of the traced image (the overlay pass is not
in it). Both arms confirmed in `viewMode: "shoulder"`, `_viewBlend: 1`,
`overscan: 0.22`.

| L0 Ashway | flicker | grain | converged mean luma |
|---|---|---|---|
| before (0.14.1) | **0.566** | **2.041** | 13.57 |
| after (0.15.0) | **0.091** | **0.942** | 13.77 |
| **floor** (after vs after, same protocol) | 0.159 vs 0.091 -> **0.068** | 0.746 vs 0.974 -> **0.228** | 14.08 / 13.79 |
| effect / floor | **7.0x** | **4.8x** | - |

**Both improvements clear the spec's bar** (a margin above 2x the floor), and
the converged mean luma is within 1.5% across all four runs, so this is noise
going away rather than the image getting darker. The after arm reproduced
flicker 0.091 twice, in two independent browser boots.

**L7 Reliquary: NOT MEASURED.** Both the real run and the floor run lost their
Chromium renderer on that level ("Target crashed"). L7 is the heaviest level
(256 emissive triangles, 24 lights) and the shoulder view pads the traced target
by 22% in each axis; with 10.5 of 12 GB of VRAM held by other sessions it did
not survive. Frames: `noise-before-L0-ashway.png`, `noise-after-L0-ashway.png`,
`noise-floorA-L0-ashway.png`, `noise-floorB-L0-ashway.png`, plus the two L7
frames that were captured before the crash.

## C.3 The two AmbientLight levels

Four arms. `before` = 0.14.1, which ignores `AmbientLight` entirely; `off` =
0.15.0 as shipped here; `x0.10` and `full` = 0.15.0 with `ambient: true` and the
authored intensities scaled. Whole-frame luma percentiles of the traced image at
the spawn view after 200 converged frames; **p05 is the deep shadow, p95 the lit
surfaces**. `meter` is `g._computePlayerVis()` at the player's spawn.

**L3 Brightward Gate** (`AmbientLight #25324a @ 0.40`, plus a 2.6-intensity sun):

| arm | mean | **p05** | p50 | p95 | meter |
|---|---|---|---|---|---|
| before (0.14.1) | 21.16 | **0.07** | 7.16 | 55.14 | **0.06** |
| **off (shipped)** | 20.55 | **0.07** | 7.22 | 51.28 | **0.06** |
| ambient x0.10 | 20.83 | **0.86** | 7.24 | 51.35 | **0.06** |
| ambient full (0.40) | 22.05 | **3.43** | 8.22 | 51.42 | **0.06** |

**L5 Chandlery** (`AmbientLight #2c3a55 @ 0.42`, plus the 52-degree sun):

| arm | mean | **p05** | p50 | p95 | meter |
|---|---|---|---|---|---|
| before (0.14.1) | 19.12 | **0.00** | 6.43 | 85.73 | **0.06** |
| **off (shipped)** | 19.25 | **0.00** | 6.43 | 81.52 | **0.06** |
| ambient x0.10 | 19.73 | **1.07** | 6.49 | 81.59 | **0.06** |
| ambient full (0.42) | 21.19 | **2.93** | 7.43 | 81.88 | **0.06** |

**Readings.**

1. **`before` and `off` agree where it matters**: p05 identical to two decimals
   on both levels, p50 identical on L5 and within 0.06 on L3. That is the
   `ambient: false` claim ("bit-for-bit the pre-0.15 handling") behaving as
   advertised through a whole game level.
2. **The meter does not move in any arm, and it cannot.**
   `main.js:_collectLights` pushes only `o.isDirectionalLight` and
   `o.isPointLight`; an `AmbientLight` has no path into `_computePlayerVis` at
   all. The 0.06 is the meter's own floor (`main.js:175-177`, `VIS_ENV 0.2`,
   `VIS_NORM 7.0`, floor `0.06 + bulk`), so the spawn sits in true dark in every
   arm, which is exactly why the picture changing while the meter does not is
   the whole problem.
3. **The full authored ambient is far too strong.** It lifts the darkest 5% of
   the frame by **+3.36** (L3) and **+2.93** (L5) of 255 and the median by ~1,
   with no change in the meter. In a stealth game whose contract is "darkness
   must READ dark", that is a contract violation shipped as a default.
4. **The 0.10x proposal is not worth making.** +0.79 and +1.07 of 255 in the
   p05, +0.28 and +0.48 in the mean: below one display level on the mid-tones,
   invisible on the deep shadow the spec was worried about, and it still puts
   light on surfaces the meter does not know about. **Recommendation: ship
   `ambient: false` (as this branch does) and do not add a faint ambient.** If
   the owner ever wants the sky fill to be real, the honest version is to give
   the meter a matching term, not to nudge the renderer.

**One thing I cannot call, and am not going to pretend I can:** `p95` is
consistently ~5-7% lower on 0.15.0 than on 0.14.1 (55.14 -> 51.28, 85.73 ->
81.52). That is the bright end, and the plausible cause is `restirClampRel: 2`
changing how the brightest samples are capped. **There is no floor beside those
two numbers**, each arm being one converged still, and the only run-to-run floor
I have for a whole-image statistic is 2% (the noise run's converged mean, 14.08
vs 13.79 on identical builds). 5-7% is above that but not by much, on a
different statistic. It is reported as an observation, not a finding.

**And it is visible, not just measurable.** Opening
`ambient-off-L5-chandlery.png` next to `ambient-ambfull-L5-chandlery.png`: in
the `off` frame the foreground floor and the two lower corners are true black,
which is the cover the player is standing in. In the `full` frame that same
floor is a lifted grey-blue wash across the whole bottom third of the screen,
and the gem still says IN SHADOW - UNSEEN. That is the picture and the meter
disagreeing, in one screenshot.

Frames: `ambient-{before,off,amb010,ambfull}-L3-brightward-gate.png` and
`ambient-{before,off,amb010,ambfull}-L5-chandlery.png`.

## C.4 The sun level

L5 Chandlery, the game's daylight level: one `DirectionalLight`, intensity
**3.0**, colour `#fff1cf`, at `[6, 34, -26]`: the ~52-degree sun the reservoir
poisoning was described against. Tactical view, sim frozen, converged 220 frames.
`sun.mjs` crashed on its first attempt and completed on the second; these are
the second run's numbers.

**A. Cross-build, converged spawn view.** Mean per-pixel `|before - after|`
luma, with each arm's own floor (the same arm, 60 frames later):

| | value |
|---|---|
| mean abs diff, before vs after | **0.772** |
| floor: before vs before, same run | **0.593** |
| floor: after vs after, same run | 0.172 |
| mean luma | 19.08 before, 19.29 after |
| p05 (deep shadow) | 0.00 both |

**0.772 against a floor of 0.593 is 1.3x, so the converged images are the same
to within the instrument.** That is the correct result and it is worth saying
plainly: the 0.15.0 estimator is not supposed to converge somewhere else, it is
supposed to get there without speckle. Which is the next table.

**B. Settled speckle, and the bypass attributed.** Mean `|frame_t -
frame_{t+1}|` over 24 frames at a fixed converged pose:

| arm | settled flicker |
|---|---|
| 0.14.1 build | **0.219** |
| 0.15.0 build, bypass OFF (in-page) | **0.223** |
| 0.15.0 build, bypass ON (in-page) | **0.105** |
| 0.15.0 build, as shipped | **0.114** |

Read the two pairs as each other's floor, because that is what they are: the two
independent "bypass off" measurements, one of them a *different build*, agree
to **0.004**, and the two "bypass on" measurements agree to **0.009**. Against a
floor of that size, **the sun bypass halves the settled speckle on the sun
level (0.223 -> 0.105, 2.1x, twelve to twenty-seven times the floor)**, and it
accounts for the whole of the cross-build improvement.

It also incidentally re-confirms A.3 and the library's frozen-render gate from
the outside: **0.15.0 with the bypass off measures the same as 0.14.1** (0.223
vs 0.219).

The bypass lowers the bright end slightly on this level too (p95 83.59 -> 81.59),
the same ~2-5% highlight effect seen in C.3, and with the same caveat: one
converged still per arm, no floor of its own.

Frames: `sun-before-L5-chandlery.png`, `sun-after-L5-chandlery.png`,
`sun-bypassOFF-L5-chandlery.png`, `sun-bypassON-L5-chandlery.png`.

## C.4b Where the governor settles, which is what a player actually feels

Every other timing here freezes the adaptive governor so the arms can be
compared at a fixed configuration. But the game ships with it ON, so a +6 ms
cost does not arrive as a slower game: it arrives as a **lower settled
resolution at the same frame rate**. `tools/harness/governor.mjs` boots each arm
exactly as it ships, lets it run 30 s, and records where it comes to rest. Both
arms twice, alternating, so drift shows up as a difference between two runs of
the SAME arm.

**L0 Ashway, 30 s, 1280x720:**

| run | renderScale | canvas scale | canvas | denoise | lighting pixels | final frame ms | `gpuCostMs` |
|---|---|---|---|---|---|---|---|
| before 1 | 0.20 | 0.50 | 383x215 | 3 | 3294 | 5.7 | `null` |
| before 2 | 0.20 | 0.50 | 383x215 | 3 | 3294 | 71.5 | `null` |
| after 1 | 0.20 | 0.50 | 383x215 | 3 | 3294 | 6.2 | **1.40** |
| after 2 | 0.20 | 0.50 | 383x215 | 3 | 3294 | 40.3 | **2.50** |

**Both builds settle in exactly the same place, at the floor of both ladders**
(`renderScale` 0.20 is the governor's minimum, canvas 0.50 its deepest rung).
That is not evidence that the upgrade is free: it is evidence that on a machine
whose GPU is 100% committed to other work, both builds bottom out, and the
question cannot be asked here. The final-frame column shows why the run is not
usable for anything finer: the same arm measured 5.7 ms and 71.5 ms in two
consecutive runs.

One real thing does fall out of it. **`gpuCostMs` reads a number on the after
arm and `null` on the before arm.** That is 0.15.0's `GpuTimer` fix visible from
the outside: 0.14.1 shipped the timer and never imported it, so the governor's
only signal was the wall clock and its climb gates were unreachable. The 0.15.0
arm is measuring real GPU milliseconds (1.4, 2.5) while it decides.

**L5 was not measured**: that leg died with `window.__H` undefined at
`resetTimers`, i.e. the page had navigated out from under the hook. Not chased.

## C.5 Settings

Covered in B.3, B.4 and B.5 with their tables. The three-part check is complete:
the five-change Reset test (passed, including the two keys a naive reset would
have broken), the migration test in three seeded shapes (passed, `stochastic`
dropped in all three, new knobs from the library in all three), and the
phone-landscape screenshots.

## C.6 Build and fallback

```
vite build            exit 0, 95 modules, dist/index.html 29.25 kB,
                      dist/assets/index-*.js 1,084.38 kB (gzip 326.63 kB)
```

The BUILT `dist`, served by `vite preview` on :4182, in headed Chromium, L0:

```
booted true   state "playing"   bootHidden true
compileError null   status.warnings []
audit {"tier":"high","unknown":[],"ignored":[]}
ambient false   motionVectors true
console errors: none
   (ignored: 1 x "Failed to load resource: 404" for Chromium's automatic
    /favicon.ico request, which this page has never had)
```

**Raster fallback**: `chromium.launch(args: ["--disable-gpu"])`, which puts
Chromium on SwiftShader. `RealtimeRaytracer.isSupported` returns false on a
renderer string matching `/swiftshader|llvmpipe|software/`
(RealtimeRaytracer.js:54), which is the same door a weak device comes through.
Result: `rtSupported: false`, renderer
`ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)`,
prompt visible with the exact text **"Ray tracing is not supported on this
device — running flat-lighting fallback."** The level still loads and plays.
Frame: `fallback-disable-gpu-L0.png`.

---

# The three decisions that are yours

1. **Ship `ambient: false` and no faint ambient.** Measured in C.3, argued
   there. This branch already does it. Nothing to decide unless you disagree
   with the numbers.
2. **The sun bypass: on by default, as shipped here, but it is the one knob
   worth a second look.** It buys a 2.1x reduction in settled speckle on the sun
   level (C.4) and is part of the 7x flicker reduction on the night turn (C.2);
   it costs ~6 ms a frame on every level because every level has a directional
   light (C.1). It is a labelled Advanced toggle with its finding in the hint, so
   a player on a weak machine can take the frames back. **If you want it off on
   the perf tier only**, that is one key in `PRESETS.perf`
   (`restirDirectionalBypass: false`) plus one line in `apply()` - and a
   deviation from "a preset is these eight keys", which is why I have not made
   it. Take the governor measurement (C.4b) on a quiet machine first: it will
   say whether perf-tier hardware is paying for the bypass in lighting
   resolution or not paying at all.
3. **Whether the preset picture numbers should be retuned now that the
   estimator is calmer.** They are deliberately untouched (B.1), so this
   report's before/after is a measurement of the library. But 0.15.0's noise
   floor is 7x lower on a turn, which is exactly the trade `renderScale` and
   `denoise` were tuned against in July. There may be a cheaper `perf` tier
   available now. That is a taste question with a measurement attached, and it
   is a separate pass.

# What surprised me

1. **The library's flagship claim does not transfer to this game, and the
   library's own report predicted that it might not.** "The four ReSTIR
   correctness fixes plus motion vectors cost nothing measurable, median 1.011"
   was measured on the museum, and `dev/PORT-0.15-REPORT.md` surprise #4 says
   the museum has no directional, ambient or hemisphere light at all. Umbral has
   a directional light in **every single level**. Three of the four fixes are
   indeed free here; the fourth costs 1.11x-1.48x. Anyone quoting "1.01x" at
   this game is quoting a number from a scene that cannot contain the cost.

2. **The `stochastic` toggle in Umbral's settings panel has never done
   anything.** Not since ReSTIR was turned on. Both shader versions test
   `uRestirEnabled` first. A panel row that has been a placebo for the life of
   the feature is worse than a missing one, because the 0.14 `perf` preset used
   it as its cheap-tier lever and every A/B run through that preset was
   measuring an unchanged renderer.

3. **A naive "Reset to defaults" would have been a bug factory.**
   `RealtimeRaytracer.DEFAULTS` has 38 keys, four of which this game owns rather
   than the library: `ambient` (library `true`, game `false`), `dispersion`
   (library `0`, game `0.12`), the live `volumetric` object (it carries the
   LEVEL's density and zones) and `overscan` (main.js sets it per camera view).
   Writing all 38 back is exactly what makes Reset worth having, and it is also
   exactly how you ship a Reset button that turns the stealth game's shadows
   grey and kills the relic gem's rainbow. `RESET_SKIP` exists for those, with
   the reason on each line.

4. **The interceptor's leak is closed by something three files away.** The
   overload brake's read-modify-write can only push the denoise base UP in the
   shoulder view, and the reason it never sticks is that `setViewMode` routes
   through `settings.set("view3p")` -> `apply()`, which rewrites the value from
   the panel. That is a real invariant nobody wrote down, and it is now written
   down.

5. **The measurement instrument mattered more than the measurement.** The
   cross-build harness and the in-page harness measured the same physical thing
   on the same machine in the same hour. One has a floor of IQR 0.24 and can
   resolve nothing; the other has a floor of IQR 0.03 and resolves a 1.31x
   effect with every pair agreeing in sign. The difference is entirely how many
   seconds apart the two arms are.

6. **`gl.readPixels(0,0,1,1)` is the whole reason any of these numbers are
   real.** Without it the timer measures command submission, not GPU work, and
   on a 60 Hz display an rAF delta reads 16.7 ms for both arms forever.

# What is not done

- **The cross-build frame-time matrix (C.1)**: control only, see the section
  for why.
- **L7's noise measurement (C.2)**: lost its browser on both the real run and
  the floor run. L7 is the heaviest level and the shoulder view pads the traced
  target by 22% in each axis.
- **The governor-settling measurement (C.4b)** ran on L0 and says only that both
  builds bottom out under this machine's load; L5 died mid-run. **This is the
  number I would take first on a quiet machine**, because it is the one that
  says what a player pays for the sun bypass: not frames, but lighting
  resolution. `tools/harness/governor.mjs` is written and working.
- **The `optcost` cells for L7** and a `bypass-anatomy.mjs` run (the loop
  vs the ray question: is the +6 ms the per-light loop or the shadow ray? Hidden
  the directional light and re-measure). Both written; both were abandoned when
  the machine took the GPU back.
- **The sun bypass's ship decision is left to the owner, deliberately** (see
  "The three decisions that are yours", above). It ships ON, which is the
  library's measured-correct default, and it is a labelled toggle rather than a
  hidden one.

# Files

| | |
|---|---|
| `src/main.js` | `_makeRT`: `ambient:false` + the option audit; the denoise-interceptor comment corrected; `settings.refresh()` on both settings-open buttons |
| `src/settings.js` | rewritten: library-derived defaults, delta presets, `reset()`, v3 migration, grouped panel |
| `index.html` | Reset bar, `.setgroup` / `.resetbar` / `.setrow.disabled` styles |
| `tools/harness/lib.mjs` | the shared driver (visibility override, park/wake, in-render pixel readback, turn-and-settle) |
| `tools/harness/{frametime,optcost,noise,ambient,sun,settings,denoise,scenes,build,governor,bypass-anatomy,smoke}.mjs` | one instrument each |
| `tools/harness/shots/` | every frame, arm and level in the name |
| `tools/harness/*.json` | the raw numbers behind every table above |
