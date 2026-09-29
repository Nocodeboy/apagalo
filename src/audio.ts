// Sound effects are synthesised live with WebAudio (no licences, ~0 KB).
// Music is played from audio files when available (see setMusicTracks).

type Mode = 'menu' | 'game' | 'none';

export class Audio {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfx!: GainNode;
  private musicGain!: GainNode;
  private noise!: AudioBuffer;
  private sprayGain!: GainNode;
  private sprayFilter!: BiquadFilterNode;
  private fireGain!: GainNode;
  private fireFilter!: BiquadFilterNode;
  private crackleT = 0;
  sfxOn = true;
  musicOn = true;
  /** silenced while an ad plays */
  private muted = false;
  private tracks: Partial<Record<Exclude<Mode, 'none'>, string>> = {};
  private musicEl: HTMLAudioElement | null = null;
  private musicMode: Mode = 'none';
  private last: Record<string, number> = {};

  setMusicTracks(t: Partial<Record<Exclude<Mode, 'none'>, string>>) {
    this.tracks = t;
  }

  /** Must be called from a user gesture. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = this.sfxOn ? 1 : 0;
    this.sfx.connect(this.master);
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.5;
    this.musicGain.connect(this.master);
    // white noise buffer
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    // water spray loop
    const sp = ctx.createBufferSource();
    sp.buffer = this.noise;
    sp.loop = true;
    this.sprayFilter = ctx.createBiquadFilter();
    this.sprayFilter.type = 'bandpass';
    this.sprayFilter.frequency.value = 2400;
    this.sprayFilter.Q.value = 0.6;
    this.sprayGain = ctx.createGain();
    this.sprayGain.gain.value = 0;
    sp.connect(this.sprayFilter).connect(this.sprayGain).connect(this.sfx);
    sp.start();
    // fire roar loop (brown-ish noise)
    const fr = ctx.createBufferSource();
    fr.buffer = this.noise;
    fr.loop = true;
    fr.playbackRate.value = 0.5;
    this.fireFilter = ctx.createBiquadFilter();
    this.fireFilter.type = 'lowpass';
    this.fireFilter.frequency.value = 420;
    this.fireGain = ctx.createGain();
    this.fireGain.gain.value = 0;
    fr.connect(this.fireFilter).connect(this.fireGain).connect(this.sfx);
    fr.start();
    if (this.musicMode !== 'none') this.music(this.musicMode, true);
  }

  setSfx(on: boolean) {
    this.sfxOn = on;
    if (this.ctx) this.sfx.gain.value = on ? 1 : 0;
  }
  setMusic(on: boolean) {
    this.musicOn = on;
    if (!on && this.musicEl) this.musicEl.pause();
    if (on) this.music(this.musicMode, true);
  }

  music(mode: Mode, force = false) {
    if (mode === this.musicMode && !force) return;
    this.musicMode = mode;
    const src = mode === 'none' ? undefined : this.tracks[mode];
    if (this.musicEl) {
      const old = this.musicEl;
      const fade = setInterval(() => {
        old.volume = Math.max(0, old.volume - 0.08);
        if (old.volume <= 0.01) {
          old.pause();
          clearInterval(fade);
        }
      }, 40);
      this.musicEl = null;
    }
    if (!src || !this.musicOn || !this.ctx || this.muted) return;
    const el = new window.Audio(src);
    el.loop = true;
    el.volume = 0;
    el.play().catch(() => undefined);
    const target = mode === 'game' ? 0.32 : 0.42;
    const up = setInterval(() => {
      el.volume = Math.min(target, el.volume + 0.03);
      if (el.volume >= target) clearInterval(up);
    }, 60);
    this.musicEl = el;
  }

  /** Silences effects and music while an ad plays. */
  mute(on: boolean) {
    this.muted = on;
    if (this.ctx) this.master.gain.value = on ? 0 : 0.9;
    if (on) this.musicEl?.pause();
    else if (this.musicOn) {
      if (this.musicEl) this.musicEl.play().catch(() => undefined);
      else this.music(this.musicMode, true);
    }
  }

  duck(on: boolean) {
    if (this.musicEl) this.musicEl.volume = on ? 0.12 : this.musicMode === 'game' ? 0.32 : 0.42;
  }

  // ---------- continuous ----------
  loops(spraying: boolean, nozzle: number, fireLevel: number, dt: number) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime;
    const sg = spraying ? (nozzle === 1 ? 0.2 : nozzle === 2 ? 0.16 : 0.24) : 0;
    this.sprayGain.gain.setTargetAtTime(sg, t, 0.04);
    this.sprayFilter.frequency.setTargetAtTime(nozzle === 1 ? 4200 : nozzle === 2 ? 1300 : 2300, t, 0.05);
    this.sprayFilter.Q.value = nozzle === 1 ? 0.35 : 0.7;
    const fl = Math.min(1, fireLevel);
    this.fireGain.gain.setTargetAtTime(fl * 0.55, t, 0.3);
    this.fireFilter.frequency.setTargetAtTime(300 + fl * 500, t, 0.3);
    // crackles
    this.crackleT -= dt;
    if (fl > 0.02 && this.crackleT <= 0) {
      this.crackleT = 0.03 + Math.random() * (0.25 / (0.2 + fl));
      this.click(0.04 + fl * 0.12);
    }
  }

  private click(vol: number) {
    const c = this.ctx!;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1500 + Math.random() * 3000;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.012 + Math.random() * 0.02);
    src.connect(f).connect(g).connect(this.sfx);
    src.start(t, Math.random() * 1.5, 0.05);
  }

  // ---------- one-shots ----------
  private limit(key: string, gap: number): boolean {
    const now = performance.now();
    if (now - (this.last[key] ?? 0) < gap * 1000) return false;
    this.last[key] = now;
    return true;
  }

  private noiseBurst(dur: number, type: BiquadFilterType, f0: number, f1: number, vol: number, q = 0.8, delay = 0) {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.sfx);
    src.start(t, Math.random() * 1.0, dur + 0.05);
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, slideTo?: number) {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.sfx);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  play(name: string, n = 0) {
    if (!this.ctx || !this.sfxOn) return;
    switch (name) {
      case 'hiss':
        if (!this.limit('hiss', 0.07)) return;
        this.noiseBurst(0.35 + Math.random() * 0.2, 'highpass', 3500 + Math.random() * 2000, 6000, 0.12);
        break;
      case 'clusterOut':
        this.noiseBurst(0.8, 'highpass', 2500, 7000, 0.18);
        [659, 880, 1175].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.12, i * 0.07));
        break;
      case 'ignite':
        if (!this.limit('ignite', 0.4)) return;
        this.noiseBurst(0.4, 'lowpass', 900, 200, 0.14);
        break;
      case 'flare':
        this.noiseBurst(0.9, 'lowpass', 2500, 150, 0.5);
        this.tone(90, 0.5, 'sine', 0.3, 0, 40);
        break;
      case 'explode':
        this.noiseBurst(1.4, 'lowpass', 3000, 60, 0.9);
        this.tone(70, 0.9, 'sine', 0.7, 0, 28);
        this.noiseBurst(0.3, 'highpass', 2000, 800, 0.3, 0.7, 0.05);
        break;
      case 'short':
        this.tone(110, 0.45, 'sawtooth', 0.2, 0, 90);
        this.tone(165, 0.45, 'square', 0.08);
        this.noiseBurst(0.35, 'bandpass', 5000, 3000, 0.25, 2);
        break;
      case 'soak':
        if (!this.limit('soak', 0.3)) return;
        this.tone(420, 0.18, 'square', 0.07, 0, 260);
        this.noiseBurst(0.25, 'bandpass', 1800, 900, 0.12);
        break;
      case 'rescue':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.16, i * 0.07));
        break;
      case 'fled':
        this.tone(392, 0.22, 'triangle', 0.14);
        this.tone(294, 0.35, 'triangle', 0.14, 0.18);
        break;
      case 'connect':
        this.tone(1600, 0.06, 'square', 0.08);
        this.tone(2200, 0.08, 'square', 0.07, 0.07);
        break;
      case 'overheat':
        this.tone(300, 0.3, 'sawtooth', 0.1, 0, 150);
        break;
      case 'powerOff':
        this.tone(200, 0.08, 'square', 0.12);
        this.tone(120, 0.5, 'sawtooth', 0.12, 0.05, 40);
        break;
      case 'hose':
        if (!this.limit('hose', 0.8)) return;
        this.tone(180, 0.1, 'triangle', 0.1, 0, 120);
        break;
      case 'windWarn':
        this.noiseBurst(1.4, 'bandpass', 300, 1400, 0.25, 1.5);
        break;
      case 'rocket':
        this.tone(700, 1.6, 'sine', 0.06, 0, 2600);
        break;
      case 'rocketHit':
        this.noiseBurst(0.6, 'lowpass', 2500, 200, 0.4);
        for (let i = 0; i < 6; i++) this.noiseBurst(0.05, 'highpass', 3000, 4000, 0.2, 0.7, 0.2 + Math.random() * 0.5);
        break;
      case 'fizzle':
        this.noiseBurst(0.7, 'highpass', 4000, 8000, 0.2);
        this.tone(880, 0.12, 'triangle', 0.1, 0.05);
        break;
      case 'combo':
        this.tone(660 + n * 20, 0.12, 'triangle', 0.12);
        this.tone(990 + n * 30, 0.14, 'triangle', 0.1, 0.06);
        break;
      case 'cylinderWarn':
        [0, 0.2, 0.4].forEach((d) => this.tone(1300, 0.1, 'square', 0.07, d));
        break;
      case 'starLost':
        this.tone(740, 0.12, 'square', 0.08);
        this.tone(494, 0.22, 'square', 0.08, 0.1);
        break;
      case 'click':
        this.tone(900, 0.05, 'triangle', 0.1);
        break;
      case 'coin':
        if (!this.limit('coin', 0.06)) return;
        this.tone(1480, 0.06, 'square', 0.04);
        this.tone(1980, 0.12, 'triangle', 0.07, 0.05);
        break;
      case 'nozzle':
        this.tone(500, 0.05, 'square', 0.06);
        this.noiseBurst(0.08, 'bandpass', 2000, 3000, 0.08);
        break;
      case 'star':
        this.tone(880 * Math.pow(1.26, n), 0.5, 'triangle', 0.16);
        this.tone(1760 * Math.pow(1.26, n), 0.35, 'sine', 0.06);
        break;
      case 'win':
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, i === 5 ? 0.6 : 0.15, 'sawtooth', 0.07, i * 0.11));
        [262, 330, 392].forEach((f) => this.tone(f, 0.9, 'triangle', 0.08, 0.55));
        break;
      case 'lose':
        [392, 349, 311, 262].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.13, i * 0.2));
        break;
      case 'siren': {
        // Spanish two-tone siren "nino-nino"
        for (let i = 0; i < 4; i++) this.tone(i % 2 ? 588 : 440, 0.36, 'square', 0.035, i * 0.38);
        break;
      }
      // ---- v2 ----
      case 'powerSpawn':
        [988, 1319].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.07, i * 0.09));
        break;
      case 'powerup':
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.1, 'square', 0.06, i * 0.05));
        this.noiseBurst(0.3, 'highpass', 4000, 8000, 0.08);
        break;
      case 'buffEnd':
        this.tone(660, 0.12, 'triangle', 0.08);
        this.tone(440, 0.18, 'triangle', 0.08, 0.1);
        break;
      case 'eventWarn':
        [0, 0.16, 0.32].forEach((d) => this.tone(1046, 0.1, 'triangle', 0.09, d));
        break;
      case 'eventStart':
        this.tone(523, 0.18, 'sawtooth', 0.07);
        this.tone(784, 0.3, 'sawtooth', 0.07, 0.12);
        break;
      case 'heli':
        // rotor chop
        for (let i = 0; i < 14; i++) this.noiseBurst(0.06, 'lowpass', 400, 200, 0.18, 0.8, i * 0.11);
        break;
      case 'heliDrop':
        this.noiseBurst(1.6, 'lowpass', 1800, 300, 0.45);
        this.noiseBurst(1.2, 'highpass', 3000, 6000, 0.15, 0.8, 0.1);
        break;
      case 'bell':
        // level crossing bell
        for (let i = 0; i < 6; i++) this.tone(i % 2 ? 1175 : 1397, 0.18, 'triangle', 0.09, i * 0.25);
        break;
      case 'train':
        this.noiseBurst(2.4, 'lowpass', 500, 180, 0.35, 0.9);
        this.tone(330, 0.6, 'sawtooth', 0.05, 0.1);
        this.tone(415, 0.6, 'sawtooth', 0.05, 0.1);
        break;
      case 'cut':
        this.noiseBurst(0.3, 'bandpass', 1800, 600, 0.4, 1.2);
        this.tone(200, 0.3, 'square', 0.08, 0, 90);
        break;
      case 'bucket':
        if (!this.limit('bucket', 0.25)) return;
        this.noiseBurst(0.35, 'bandpass', 1400, 700, 0.18);
        break;
      case 'lift':
        this.tone(300, 0.5, 'sine', 0.06, 0, 600);
        break;
      case 'page':
        this.noiseBurst(0.25, 'highpass', 2500, 5000, 0.2);
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.1, 0.1 + i * 0.08));
        break;
    }
  }
}

export const audio = new Audio();

export function vibrate(ms: number | number[]) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch {
    /* ignore */
  }
}
