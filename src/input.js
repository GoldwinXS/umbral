/**
 * Unified input: keyboard + an analog virtual joystick (touch / pointer) and
 * on-screen action buttons. Produces a single `Input` state the game reads:
 *   move {x,z} (-1..1 analog), sneak (bool), run (bool),
 * and edge-triggered actions consumed via consume(name):
 *   blink, strike, vial, pause
 */
export class Input {
  constructor() {
    this.keys = new Set();
    this.move = { x: 0, z: 0 };
    this.sneak = false;
    this.run = false;
    this._actions = new Set();
    this.enabled = false; // game captures input only while playing

    // --- keyboard ---
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(k);
      if (!this.enabled) return;
      if (k === " ") this._actions.add("blink");
      if (k === "f") this._actions.add("strike");
      if (k === "q") this._actions.add("vial");
      if (k === "escape" || k === "p") this._actions.add("pause");
      if (k === "m") this._actions.add("mute");
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener("blur", () => this.keys.clear());

    // --- virtual joystick (left half of screen) ---
    this.joy = { active: false, x: 0, z: 0, mag: 0 };
    const layer = document.getElementById("touchLayer");
    const base = document.getElementById("joyBase");
    const knob = document.getElementById("joyKnob");
    const R = 52;
    let joyId = null, ox = 0, oy = 0;

    const joyMove = (e) => {
      if (e.pointerId !== joyId) return;
      const dx = e.clientX - ox, dy = e.clientY - oy;
      const len = Math.hypot(dx, dy);
      const cl = Math.min(len, R);
      const kx = len > 0 ? (dx / len) * cl : 0;
      const ky = len > 0 ? (dy / len) * cl : 0;
      knob.style.left = ox + kx + "px";
      knob.style.top = oy + ky + "px";
      this.joy.active = true;
      this.joy.x = kx / R;
      this.joy.z = ky / R; // screen up (-dy) → -Z, matches W
      this.joy.mag = cl / R;
      e.preventDefault();
    };
    const joyEnd = (e) => {
      if (e.pointerId !== joyId) return;
      joyId = null;
      this.joy.active = false; this.joy.x = 0; this.joy.z = 0; this.joy.mag = 0;
      base.classList.remove("on"); knob.classList.remove("on");
    };
    layer.addEventListener("pointerdown", (e) => {
      if (joyId !== null) return;
      if (e.clientX > window.innerWidth * 0.55) return; // left zone only
      if (e.target.closest && e.target.closest(".tbtn, #pauseBtn, .overlay, button")) return;
      joyId = e.pointerId;
      try { layer.setPointerCapture(joyId); } catch (_) {}
      ox = e.clientX; oy = e.clientY;
      base.style.left = ox + "px"; base.style.top = oy + "px";
      base.classList.add("on"); knob.classList.add("on");
      joyMove(e);
      e.preventDefault();
    });
    layer.addEventListener("pointermove", joyMove);
    layer.addEventListener("pointerup", joyEnd);
    layer.addEventListener("pointercancel", joyEnd);

    // --- touch action buttons ---
    const bind = (id, action) => {
      const el = document.getElementById(id);
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault(); e.stopPropagation();
        if (this.enabled) this._actions.add(action);
      });
    };
    bind("btnBlink", "blink");
    bind("btnStrike", "strike");
    bind("btnVial", "vial");
    bind("pauseBtn", "pause");

    // coarse pointer → touch UI visible
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
      document.body.classList.add("coarse");
    }
  }

  /** Call once per frame before game logic. */
  poll() {
    if (this.joy.active) {
      this.move.x = this.joy.x;
      this.move.z = this.joy.z;
      // analog tiers: gentle push = creep, full = flow fast
      this.sneak = this.joy.mag < 0.42;
      this.run = this.joy.mag > 0.88;
    } else {
      const k = this.keys;
      let x = 0, z = 0;
      if (k.has("w") || k.has("arrowup")) z -= 1;
      if (k.has("s") || k.has("arrowdown")) z += 1;
      if (k.has("a") || k.has("arrowleft")) x -= 1;
      if (k.has("d") || k.has("arrowright")) x += 1;
      const l = Math.hypot(x, z);
      if (l > 0) { x /= l; z /= l; }
      this.move.x = x; this.move.z = z;
      this.run = k.has("shift");
      this.sneak = k.has("c");
    }
  }

  consume(name) {
    if (this._actions.has(name)) { this._actions.delete(name); return true; }
    return false;
  }
  clearActions() { this._actions.clear(); }
}
