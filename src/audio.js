/**
 * Tiny WebAudio synth for game feedback. No assets — every sound is a couple
 * of oscillators / filtered noise bursts. Volume of footsteps is tied to the
 * noise mechanic: loud surfaces literally sound louder.
 */
export class Sfx {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this._lastStep = 0;
  }

  _ensure() {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch (_) { return false; }
    return true;
  }

  resume() { if (this._ensure() && this.ctx.state === "suspended") this.ctx.resume(); }
  setEnabled(on) { this.enabled = on; if (on) this.resume(); }

  _tone(freq, dur, { type = "sine", gain = 0.2, slide = 0, delay = 0 } = {}) {
    if (!this.enabled || !this._ensure()) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  _noise(dur, { freq = 1200, q = 1, gain = 0.2, delay = 0 } = {}) {
    if (!this.enabled || !this._ensure()) return;
    const t0 = this.ctx.currentTime + delay;
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain(); g.gain.value = gain;
    src.connect(f).connect(g).connect(this.master);
    src.start(t0);
  }

  /** Footstep; loudness 0..1, surface changes timbre. */
  step(loudness, surface) {
    const now = performance.now();
    if (now - this._lastStep < 90) return;
    this._lastStep = now;
    const g = 0.02 + loudness * 0.16;
    if (surface === "crystal") { this._noise(0.09, { freq: 2600, q: 3, gain: g * 1.2 }); this._tone(1900, 0.05, { type: "triangle", gain: g * 0.5 }); }
    else if (surface === "moss") { this._noise(0.07, { freq: 420, q: 1, gain: g * 0.6 }); }
    else { this._noise(0.06, { freq: 900, q: 1.2, gain: g }); }
  }

  blink() { this._noise(0.22, { freq: 700, q: 0.8, gain: 0.22 }); this._tone(180, 0.22, { type: "sine", gain: 0.2, slide: 520 }); }
  blinkFail() { this._tone(140, 0.1, { type: "square", gain: 0.08 }); }
  strike() { this._noise(0.12, { freq: 300, q: 1, gain: 0.3 }); this._tone(90, 0.16, { type: "sine", gain: 0.3, slide: -40 }); }
  // a wet, descending gulp as a warden is swallowed
  devour() {
    this._tone(240, 0.28, { type: "sine", gain: 0.28, slide: -170 });
    this._noise(0.16, { freq: 420, q: 0.8, gain: 0.22 });
    this._tone(120, 0.34, { type: "triangle", gain: 0.16, slide: -60, delay: 0.06 });
  }
  whiff() { this._noise(0.1, { freq: 1500, q: 0.7, gain: 0.08 }); }
  // a warden connects — a dull fleshy thud + the whoosh of being flung
  hitFlesh() {
    this._tone(130, 0.18, { type: "sine", gain: 0.26, slide: -50 });
    this._noise(0.2, { freq: 320, q: 0.7, gain: 0.2 });
    this._noise(0.3, { freq: 900, q: 0.5, gain: 0.1, delay: 0.04 });
  }
  throwVial() { this._noise(0.14, { freq: 1100, q: 0.8, gain: 0.1 }); }
  splash() {
    this._noise(0.28, { freq: 2400, q: 0.6, gain: 0.24 });
    this._tone(700, 0.3, { type: "sine", gain: 0.12, slide: -500 });
    this._noise(0.5, { freq: 500, q: 0.8, gain: 0.12, delay: 0.05 }); // sizzle
  }
  pickup() { this._tone(660, 0.09, { type: "triangle", gain: 0.14 }); this._tone(990, 0.14, { type: "triangle", gain: 0.12, delay: 0.07 }); }
  suspicious() { this._tone(340, 0.18, { type: "sawtooth", gain: 0.07, slide: 60 }); }
  alert() { this._tone(220, 0.3, { type: "sawtooth", gain: 0.16, slide: 180 }); this._tone(440, 0.34, { type: "square", gain: 0.08, slide: 220, delay: 0.05 }); }
  caught() { this._tone(160, 0.5, { type: "sawtooth", gain: 0.25, slide: -110 }); this._noise(0.4, { freq: 250, q: 0.6, gain: 0.25 }); }
  scepter() { [523, 659, 784, 1047].forEach((f, i) => this._tone(f, 0.35, { type: "triangle", gain: 0.12, delay: i * 0.09 })); }
  alarm() { this._tone(520, 0.22, { type: "square", gain: 0.1, slide: -140 }); this._tone(520, 0.22, { type: "square", gain: 0.1, slide: -140, delay: 0.3 }); }
  gate() { this._tone(120, 0.5, { type: "sine", gain: 0.18, slide: 90 }); this._noise(0.4, { freq: 350, q: 1, gain: 0.1 }); }
  win() { [392, 523, 659, 784, 1047].forEach((f, i) => this._tone(f, 0.5, { type: "sine", gain: 0.11, delay: i * 0.11 })); }
  ui() { this._tone(800, 0.05, { type: "triangle", gain: 0.07 }); }
}
