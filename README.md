# UMBRAL — a shadow heist

A ray-traced stealth game for the browser. You are the umbral — a void-black
creature of living shadow. Wardens see **light**, not you: stay dark, and their
gaze slides off. Slip through three hand-built missions of stealth-puzzle
infiltration, rendered in real time with [three-realtime-rt](https://www.npmjs.com/package/three-realtime-rt).

▶ **Play:** https://goldwinxs.github.io/umbral/

## The mechanics, learned one at a time

- **Move & noise** — glassy crystal floors ring underfoot; soft moss is silent; speed is loud. Every sound you make ripples outward as a visible ring — its thickness, speed and colour tell wardens (and you) how far it carries.
- **The light gem** — reads how *lit* you are. Light is the enemy; the dark is yours.
- **Shadowstep** — blink a short distance on a cooldown; cross voids no warden can.
- **Void vials** — lob them to douse torches and lamps. A reticle shows the tool's reach.
- **The maw** — feed on a crimson mote and your eyes kindle red; strike a warden from **behind** to **swallow** it whole and grow larger.
- **Fog** — drifting banks that veil you from watching eyes. Cover, not scenery.
- **Mirrors** — still pools throw your reflection; a warden across the room can catch you in the glass. Kill the lamps or hug the dark.
- **The Great Eye** — a stationary sentinel that sweeps a long, narrow gaze. It won't chase — but catch its eye while lit and it calls the whole vault down on you.

## Controls

| | |
|---|---|
| **W A S D** / arrows | move (analog stick on touch — push gently to creep) |
| **Shift** | flow fast (loud) &nbsp;·&nbsp; **C** creep (quiet) |
| **Space** | shadowstep |
| **F** | strike / swallow from behind |
| **Q** | hurl a void vial |
| **E** | interact &nbsp;·&nbsp; **Esc** pause &nbsp;·&nbsp; **M** mute |

## Develop

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # → dist/
```

Ray tracing needs **WebGL2 + `EXT_color_buffer_float`**. Where that's missing the
renderer falls back to flat lighting automatically. Tune quality in **Settings**
(or pick a preset) — reflections, volumetrics, denoise passes and an adaptive
FPS governor are all exposed.

Built with [three.js](https://threejs.org) + [three-realtime-rt](https://www.npmjs.com/package/three-realtime-rt).
