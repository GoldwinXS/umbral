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
      gemNoise: document.getElementById("gemNoise"),
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
    this._noise = 0;     // decaying HUD noise-ping level
  }

  show(on) { this.el.hud.classList.toggle("hidden", !on); }

  setObjective(text) { this.el.objText.textContent = text; }

  prompt(html, dur = 6.5) {
    this.el.prompt.innerHTML = html;
    this.el.prompt.classList.add("show");
    this._promptT = dur;
  }

  /** A noise was emitted; intensity ~0..1 drives a ping around the light gem. */
  noisePulse(intensity) {
    this._noise = Math.max(this._noise, Math.min(1, intensity));
  }

  caughtFlash() {
    this.el.flash.style.opacity = "1";
    setTimeout(() => { this.el.flash.style.opacity = "0"; this.el.flash.style.transition = "opacity .5s"; }, 90);
  }

  update(dt, game) {
    // light gem (smoothed)
    this._gem += (game.playerVis - this._gem) * Math.min(1, dt * 10);
    const C = 201;
    this.el.gemFill.style.strokeDashoffset = String(C * (1 - this._gem));
    this.el.gemFill.style.stroke = this._gem > 0.55 ? "#ffd9a0" : this._gem > 0.25 ? "#c8a86a" : "#5a5470";
    this.el.gemCore.style.opacity = String(0.35 + this._gem * 0.65);

    // noise ping ring — grows + fades each footstep, echoing the world rings
    this._noise = Math.max(0, this._noise - dt * 1.6);
    if (this.el.gemNoise) {
      const n = this._noise;
      this.el.gemNoise.style.opacity = String(n * 0.85);
      this.el.gemNoise.style.transform = `translate(-50%,-50%) scale(${1 + (1 - n) * 0.9})`;
    }

    // what the gem MEANS: how lit you are (not how seen)
    const gs = this.el.gemState;
    if (game.playerConcealed) { gs.textContent = "veiled — in mist"; gs.style.color = "#7fe0d0"; }
    else if (game.playerHidden) { gs.textContent = "hidden"; gs.style.color = "#39f0c0"; }
    else if (this._gem > 0.55) { gs.textContent = "lit — exposed"; gs.style.color = "#ffd9a0"; }
    else if (this._gem > 0.25) { gs.textContent = "dim"; gs.style.color = "#c8a86a"; }
    else { gs.textContent = "in shadow"; gs.style.color = "#7a8499"; }

    // life pips track the blob's remaining mass
    const pips = this.el.lifePips.children;
    for (let i = 0; i < pips.length; i++) {
      pips[i].classList.toggle("on", i < game.player.health);
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
