/**
 * HUD: light gem, noise ping, tool states, devour charge, objective, stats,
 * prompt toasts.
 */

// The GOAL COLOR, as CSS. Same hue as levelKit's GOAL_TEAL (0x39f0c0) — the
// relic, the woken rift and the vial caches all wear it in the world, so the
// OBJECTIVE line wears it too and text-goal and world-goal say the same thing.
// Kept as a literal rather than imported: hud.js is DOM-only and has no other
// reason to pull in the level kit.
const GOAL_TEAL_CSS = "#39f0c0";

export class Hud {
  constructor() {
    this.el = {
      hud: document.getElementById("hud"),
      objective: document.getElementById("objective"),
      objLabel: document.querySelector("#objective .obj-label"),
      objText: document.getElementById("objText"),
      statTime: document.getElementById("statTime"),
      statAlerts: document.getElementById("statAlerts"),
      statCaught: document.getElementById("statCaught"),
      gemFill: document.getElementById("gemFill"),
      gemCore: document.getElementById("gemCore"),
      gemState: document.getElementById("gemState"),
      lifePips: document.getElementById("lifePips"),
      vialCount: document.getElementById("vialCount"),
      vialCountT: document.getElementById("vialCountT"),
      cdBlink: document.getElementById("cdBlink"),
      cdBlinkT: document.getElementById("cdBlinkT"),
      toolVial: document.getElementById("toolVial"),
      toolStrike: document.getElementById("toolStrike"),
      btnStrike: document.getElementById("btnStrike"),
      mawCount: document.getElementById("mawCount"),
      prompt: document.getElementById("prompt"),
      vignette: document.getElementById("vignette"),
      flash: document.getElementById("flash"),
    };
    this._promptT = 0;
    this._gem = 0;

    // OBJECTIVE ACCENT — colour only, no layout: the label goes goal-teal and
    // the box's hairline follows it. (Deliberately not a left border: that would
    // add 3px of width and shift the text, and this pass is not allowed to move
    // anything.) The violet stays everywhere else — violet is Hush's own colour,
    // teal is "the thing you want".
    if (this.el.objLabel) this.el.objLabel.style.color = GOAL_TEAL_CSS;
    if (this.el.objective) this.el.objective.style.borderColor = "rgba(57,240,192,.30)";
  }

  show(on) { this.el.hud.classList.toggle("hidden", !on); }

  /** Blend two #rrggbb colors, w=0 → a, w=1 → b. */
  _mix(a, b, w) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(((pa >> 16) & 255) * (1 - w) + ((pb >> 16) & 255) * w);
    const g = Math.round(((pa >> 8) & 255) * (1 - w) + ((pb >> 8) & 255) * w);
    const bl = Math.round((pa & 255) * (1 - w) + (pb & 255) * w);
    return `rgb(${r},${g},${bl})`;
  }

  setObjective(text) { this.el.objText.textContent = text; }

  prompt(html, dur = 6.5) {
    this.el.prompt.innerHTML = html;
    this.el.prompt.classList.add("show");
    this._promptT = dur;
  }

  caughtFlash() {
    this.el.flash.style.opacity = "1";
    setTimeout(() => { this.el.flash.style.opacity = "0"; this.el.flash.style.transition = "opacity .5s"; }, 90);
  }

  update(dt, game) {
    // light gem (smoothed)
    this._gem += (game.playerVis - this._gem) * Math.min(1, dt * 10);
    const seenAt = game.SEEN_THRESHOLD ?? 0.18; // the real "can be seen" line
    const C = 201;
    this.el.gemFill.style.strokeDashoffset = String(C * (1 - this._gem));

    // a warden closing in on a spot whitens the gem so the danger is unmissable
    const spot = game.spotting || 0;
    let stroke = this._gem > 0.55 ? "#ffd9a0" : this._gem > seenAt ? "#c8a86a" : "#4d6a63";
    if (spot > 0.02) {
      // amber → hot white as awareness fills; a fast flash near a full spot
      const flash = spot > 0.8 ? 0.5 + 0.5 * Math.abs(Math.sin(performance.now() / 90)) : 1;
      const w = Math.min(1, spot) * flash;
      stroke = this._mix("#ffcf8a", "#ffffff", w);
    }
    this.el.gemFill.style.stroke = stroke;
    this.el.gemCore.style.opacity = String(0.35 + Math.max(this._gem, spot) * 0.65);

    // what the gem MEANS: how lit you are, and whether something's onto you.
    // When Hush has fed to real bulk, the visible-band tells name the reason —
    // growth is why this cover no longer holds — so the size cost is legible.
    const gs = this.el.gemState;
    const bulky = game.player.scale > 1.55;
    if (spot > 0.55) { gs.textContent = "SPOTTED — being seen!"; gs.style.color = "#ff5a5a"; }
    else if (spot > 0.12) { gs.textContent = "a warden stirs…"; gs.style.color = "#ffb056"; }
    else if (this._gem > 0.55) { gs.textContent = bulky ? "too big — blazing" : "lit — exposed"; gs.style.color = "#ffd9a0"; }
    else if (this._gem > seenAt) { gs.textContent = bulky ? "your bulk betrays you" : "dim — visible"; gs.style.color = "#c8a86a"; }
    else { gs.textContent = "in shadow — unseen"; gs.style.color = "#5fd6b8"; }

    // life pips track the blob's remaining mass — the row grows/shrinks to the
    // current max (default 3; extra pips appear once devouring has bulked Hush up)
    const pipBox = this.el.lifePips;
    const want = Math.max(1, game.player.maxHealth);
    while (pipBox.children.length < want) pipBox.appendChild(pipBox.children[0].cloneNode(true));
    while (pipBox.children.length > want) pipBox.removeChild(pipBox.lastChild);
    const pips = pipBox.children;
    for (let i = 0; i < pips.length; i++) {
      pips[i].classList.toggle("on", i < game.player.health);
      pips[i].classList.toggle("extra", i >= 3); // pips beyond the base 3
    }

    // tools
    const cdFrac = game.player.blinkCd / (game.player.blinkCdMax || 6);
    this.el.cdBlink.style.setProperty("--p", (cdFrac * 100).toFixed(1) + "%");
    this.el.cdBlinkT.style.setProperty("--p", (cdFrac * 100).toFixed(1) + "%");
    this.el.vialCount.textContent = game.player.vialCount;
    this.el.vialCountT.textContent = game.player.vialCount;
    this.el.toolVial.classList.toggle("empty", game.player.vialCount <= 0);

    // maw / devour charges — strike tool glows when hungry
    const maw = game.player.mawCharges;
    if (this.el.mawCount) this.el.mawCount.textContent = maw > 0 ? maw : "";
    if (this.el.toolStrike) this.el.toolStrike.classList.toggle("hungry", maw > 0);
    if (this.el.btnStrike) this.el.btnStrike.classList.toggle("hungry", maw > 0);

    // stats
    const s = Math.floor(game.elapsed);
    this.el.statTime.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    this.el.statAlerts.textContent = `${game.alerts} alert${game.alerts === 1 ? "" : "s"}`;
    this.el.statCaught.textContent = `${game.caughtCount} caught`;

    // danger vignette tracks the hottest warden
    const danger = game.maxDanger;
    this.el.vignette.style.opacity = danger > 0.05 ? String(Math.min(0.85, danger)) : "0";

    // prompt timeout
    if (this._promptT > 0) {
      this._promptT -= dt;
      if (this._promptT <= 0) this.el.prompt.classList.remove("show");
    }
  }
}

/* ----------------------------------------------------------------------
 * Icon buttons: fullscreen toggle + camera-view toggle.
 *
 * Self-contained — wires its own DOM and runs once at module load (this
 * file is only ever imported once, by main.js). Deliberately independent
 * of the Hud class/instance above: the fullscreen button must work from
 * the title screen, before any Hud.update() loop or level is running.
 *
 * View toggle is a thin client of a contract owned elsewhere (the camera
 * work in main.js): window.UMBRAL.toggleView() flips the mode and
 * dispatches a "umbral-view" CustomEvent with { detail: { mode } }, mode
 * being "tactical" or "shoulder". We only ever read window.UMBRAL.viewMode
 * once up front and then listen for that event — no rAF polling, and no
 * camera logic lives here.
 * -------------------------------------------------------------------- */

const ICON_EXPAND =
  '<svg viewBox="0 0 24 24"><path d="M4,9 L4,4 L9,4 M15,4 L20,4 L20,9 M20,15 L20,20 L15,20 M9,20 L4,20 L4,15"/></svg>';
const ICON_CONTRACT =
  '<svg viewBox="0 0 24 24"><path d="M9,4 L9,9 L4,9 M15,4 L15,9 L20,9 M15,20 L15,15 L20,15 M9,20 L9,15 L4,15"/></svg>';
const ICON_CAMERA =
  '<svg viewBox="0 0 24 24"><path d="M4,8 L7,8 L8.5,5.5 L15.5,5.5 L17,8 L20,8 A1,1 0 0 1 21,9 L21,18 A1,1 0 0 1 20,19 L4,19 A1,1 0 0 1 3,18 L3,9 A1,1 0 0 1 4,8 Z"/><circle cx="12" cy="13.5" r="3.2"/></svg>';

function initHudIcons() {
  const fsBtn = document.getElementById("btnFullscreen");
  const viewBtn = document.getElementById("btnView");
  const hudRoot = document.getElementById("hud");

  // keep the touch joystick from ever treating a tap on these as a grab —
  // same defensive pattern as the other on-screen controls (see input.js).
  const guard = (btn) => {
    btn.addEventListener("pointerdown", (e) => e.stopPropagation());
    btn.addEventListener("click", (e) => {
      if (e.currentTarget && e.currentTarget.blur) e.currentTarget.blur(); // Space/Enter shouldn't re-fire it
    });
  };

  // --- fullscreen ---
  if (fsBtn) {
    const requestFs = () =>
      document.documentElement.requestFullscreen
        ? document.documentElement.requestFullscreen()
        : document.documentElement.webkitRequestFullscreen
        ? document.documentElement.webkitRequestFullscreen()
        : null;
    const exitFs = () =>
      document.exitFullscreen
        ? document.exitFullscreen()
        : document.webkitExitFullscreen
        ? document.webkitExitFullscreen()
        : null;
    const supported = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);

    if (!supported) {
      fsBtn.classList.add("hidden"); // no dead controls
    } else {
      const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
      const syncIcon = () => {
        const on = isFs();
        fsBtn.classList.toggle("active", on);
        fsBtn.innerHTML = on ? ICON_CONTRACT : ICON_EXPAND;
        const label = on ? "Exit fullscreen" : "Enter fullscreen";
        fsBtn.title = label;
        fsBtn.setAttribute("aria-label", label);
      };
      guard(fsBtn);
      fsBtn.addEventListener("click", () => {
        try {
          const p = isFs() ? exitFs() : requestFs();
          if (p && p.catch) p.catch(() => {}); // rejects without a user gesture; nothing to do
        } catch (_) {
          // some browsers throw synchronously instead of rejecting
        }
      });
      document.addEventListener("fullscreenchange", syncIcon);
      document.addEventListener("webkitfullscreenchange", syncIcon);
      syncIcon();
    }
  }

  // --- view toggle (third-person / tactical) ---
  if (viewBtn && hudRoot) {
    const syncMode = (mode) => {
      const shoulder = mode === "shoulder";
      viewBtn.classList.toggle("active", shoulder);
      const label = shoulder ? "Tactical view (V)" : "Third-person view (V)";
      viewBtn.title = label;
      viewBtn.setAttribute("aria-label", label);
    };
    viewBtn.innerHTML = ICON_CAMERA;
    guard(viewBtn);
    viewBtn.addEventListener("click", () => window.UMBRAL?.toggleView?.());
    window.addEventListener("umbral-view", (e) => syncMode(e.detail && e.detail.mode));
    syncMode(window.UMBRAL?.viewMode); // initial read only — no polling

    // mirror #hud's own hidden state (view only makes sense during play);
    // this is purely reflecting existing state, not new game-state logic.
    const syncVisible = () => viewBtn.classList.toggle("hidden", hudRoot.classList.contains("hidden"));
    syncVisible();
    new MutationObserver(syncVisible).observe(hudRoot, { attributes: true, attributeFilter: ["class"] });
  }
}

initHudIcons();
