/**
 * HUD: light gem, noise ping, tool states, devour charge, objective, stats,
 * prompt toasts.
 */
export class Hud {
  constructor() {
    this.el = {
      hud: document.getElementById("hud"),
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
      btnInteract: document.getElementById("btnInteract"),
    };
    this._promptT = 0;
    this._gem = 0;
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

    // contextual interact button (touch)
    this.el.btnInteract.classList.toggle("hidden", !game.interactHint);

    // prompt timeout
    if (this._promptT > 0) {
      this._promptT -= dt;
      if (this._promptT <= 0) this.el.prompt.classList.remove("show");
    }
  }
}
