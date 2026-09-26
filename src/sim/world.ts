import { M, MATS } from './materials';
import { parseLevel, RESCUE_TYPES } from './parse';
import { Rng } from './rng';
import { NOZZLES, type Ent, type LevelDef, type SimEvent, type SimEventType, type SimInput } from './types';

export const SIM_DT = 1 / 60;
const FIRE_DT = 1 / 20;
const GRAV = 12;
const SPEED = 4.7;
export const TUNE = { K: 0.9, Q: 0.035, grow: 0.32 };
const PLAYER_R = 0.3;

export interface Drop {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  pow: number;
  kind: number;
}
export interface Ember {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}
export interface Rocket {
  sx: number;
  sz: number;
  tx: number;
  tz: number;
  cell: number;
  t: number;
  total: number;
}

export interface Player {
  x: number;
  z: number;
  vx: number;
  vz: number;
  kx: number;
  kz: number;
  face: number;
  aimX: number;
  aimZ: number;
  aimDist: number;
  spraying: boolean;
  nozzle: 0 | 1 | 2;
  heat: number;
  stun: number;
  anchor: number; // ent id
  connectT: number;
  connectEnt: number;
  hoseTaut: number;
}

export interface Result {
  win: boolean;
  reason: 'win' | 'time' | 'control';
  stars: number;
  saved: number;
  timeUsed: number;
  timeLeft: number;
  rescued: number;
  rescueTotal: number;
  fled: number;
  score: number;
  soaks: number;
  shorts: number;
  explosions: number;
  maxCombo: number;
  extinguished: number;
}

export interface SimOptions {
  seed?: number;
  hoseDelta?: number;
  windOverride?: { angle: number; strength: number };
  extraFires?: number[];
}

export class Sim {
  readonly def: LevelDef;
  readonly W: number;
  readonly H: number;
  readonly N: number;
  readonly mat: Uint8Array;
  readonly walk: Uint8Array;
  readonly height: Float32Array;
  readonly owner: Int16Array;
  readonly value: Float32Array;
  readonly fuel0: Float32Array;
  readonly fuel: Float32Array;
  readonly fire: Float32Array;
  readonly heat: Float32Array;
  readonly wet: Float32Array;
  readonly foam: Float32Array;
  private flareCd: Float32Array;
  readonly ents: Ent[];
  readonly anchors: number[] = [];
  readonly rescuees: Ent[] = [];
  readonly soakables: Ent[] = [];
  readonly player: Player;
  drops: Drop[] = [];
  embers: Ember[] = [];
  rockets: Rocket[] = [];
  events: SimEvent[] = [];
  /** visual only: x,y,z,kind of water impacts since last frame (renderer clears it) */
  splashes: number[] = [];
  rng: Rng;

  time = 0;
  timeLeft: number;
  state: 'play' | 'won' | 'lost' = 'play';
  result: Result | null = null;
  hoseLen: number;
  foamLeft: number;
  foamMax: number;
  windAngle = 0;
  windStrength = 0;
  windX = 0;
  windZ = 0;
  private windIdx = 0;
  private windWarned = -1;
  private wf: { dx: number; dz: number; w: number }[] = [];
  private fireAcc = 0;
  private emitAcc = 0;
  private rocketsLeft = 0;
  private nextRocket = 0;
  private rocketCells: number[] = [];

  burning = 0;
  extinguished = 0;
  totalValue = 0;
  lostValue = 0;
  extraLost = 0;
  saved = 1;
  peakBurning = 0;
  rescued = 0;
  fled = 0;
  soaks = 0;
  shorts = 0;
  explosions = 0;
  combo = 0;
  maxCombo = 0;
  private comboT = 0;
  private lastCluster = -10;
  private igniteSfxT = 0;
  private foamWarned = false;
  hints = { cylinder: false, oil: false, elec: false, heat: false, hydrant: false };

  constructor(def: LevelDef, opts: SimOptions = {}) {
    this.def = def;
    const p = parseLevel(def);
    this.W = p.W;
    this.H = p.H;
    this.N = p.W * p.H;
    this.mat = p.mat;
    this.walk = p.walk;
    this.height = p.height;
    this.owner = p.owner;
    this.ents = p.ents;
    this.value = new Float32Array(this.N);
    this.fuel0 = new Float32Array(this.N);
    this.fuel = new Float32Array(this.N);
    this.fire = new Float32Array(this.N);
    this.heat = new Float32Array(this.N);
    this.wet = new Float32Array(this.N);
    this.foam = new Float32Array(this.N);
    this.flareCd = new Float32Array(this.N);
    this.rng = new Rng(opts.seed ?? 12345);
    for (let i = 0; i < this.N; i++) {
      const md = MATS[this.mat[i]];
      this.fuel0[i] = md.fuel;
      this.fuel[i] = md.fuel;
      this.value[i] = md.flam > 0 ? (p.value[i] >= 0 ? p.value[i] : md.value) : 0;
      this.totalValue += this.value[i];
    }
    for (const e of this.ents) {
      if (e.type === 'truck' || e.type === 'hydrant') this.anchors.push(e.id);
      if (RESCUE_TYPES.has(e.type)) this.rescuees.push(e);
      if (RESCUE_TYPES.has(e.type) || e.type === 'bystander') this.soakables.push(e);
      if (e.type === 'elec') e.state = 1;
      if (e.type === 'cylinder') this.totalValue += 8;
    }
    for (const i of p.burning) this.fire[i] = 0.7;
    for (const i of opts.extraFires ?? []) this.fire[i] = 0.7;

    this.timeLeft = def.time;
    this.hoseLen = def.hose + (opts.hoseDelta ?? 0);
    this.foamMax = def.foam ?? 0;
    this.foamLeft = this.foamMax;
    const w = opts.windOverride ?? def.wind;
    this.setWind(w.angle, w.strength);

    const truck = this.ents.find((e) => e.type === 'truck');
    if (!truck) throw new Error('Level has no truck');
    const a = this.anchorPoint(truck.id);
    this.player = {
      x: a.x,
      z: a.z,
      vx: 0,
      vz: 0,
      kx: 0,
      kz: 0,
      face: -Math.PI / 2,
      aimX: 0,
      aimZ: -1,
      aimDist: 0,
      spraying: false,
      nozzle: 0,
      heat: 0,
      stun: 0,
      anchor: truck.id,
      connectT: 0,
      connectEnt: -1,
      hoseTaut: 0,
    };
    // aim towards the nearest fire at start
    let best = 1e9;
    for (let i = 0; i < this.N; i++) {
      if (this.fire[i] > 0) {
        const dx = (i % this.W) + 0.5 - a.x;
        const dz = Math.floor(i / this.W) + 0.5 - a.z;
        const d = dx * dx + dz * dz;
        if (d < best) {
          best = d;
          const l = Math.sqrt(d) || 1;
          this.player.aimX = dx / l;
          this.player.aimZ = dz / l;
          this.player.face = Math.atan2(dz, dx);
        }
      }
    }
    if (def.fireworks) {
      this.rocketsLeft = def.fireworks.count;
      this.nextRocket = def.fireworks.first;
      for (let i = 0; i < this.N; i++) if (MATS[this.mat[i]].flam > 0 && this.walk[i]) this.rocketCells.push(i);
    }
    this.recount();
    this.peakBurning = this.burning;
  }

  // ---------- helpers ----------
  cellAt(x: number, z: number): number {
    const cx = Math.floor(x);
    const cz = Math.floor(z);
    if (cx < 0 || cz < 0 || cx >= this.W || cz >= this.H) return -1;
    return cz * this.W + cx;
  }
  private emit(type: SimEventType, x: number, z: number, n?: number, ent?: number) {
    this.events.push({ type, x, z, n, ent });
  }

  /** Hose connection point for an anchor entity. */
  anchorPoint(id: number): { x: number; z: number } {
    const e = this.ents[id];
    if (e.type === 'hydrant') return { x: e.cx, z: e.cz };
    // truck: walkable cell next to the footprint closest to the map centre
    const mx = this.W / 2;
    const mz = this.H / 2;
    let best = { x: e.cx, z: e.cz, d: 1e9 };
    for (let z = e.z - 1; z <= e.z + e.h; z++) {
      for (let x = e.x - 1; x <= e.x + e.w; x++) {
        if (x < 0 || z < 0 || x >= this.W || z >= this.H) continue;
        const inside = x >= e.x && x < e.x + e.w && z >= e.z && z < e.z + e.h;
        if (inside || !this.walk[z * this.W + x]) continue;
        const px = x + 0.5;
        const pz = z + 0.5;
        const d = (px - mx) ** 2 + (pz - mz) ** 2 + ((px - e.cx) ** 2 + (pz - e.cz) ** 2) * 2;
        if (d < best.d) best = { x: px, z: pz, d };
      }
    }
    return { x: best.x, z: best.z };
  }

  setWind(angleDeg: number, strength: number) {
    this.windAngle = angleDeg;
    this.windStrength = strength;
    const a = (angleDeg * Math.PI) / 180;
    this.windX = Math.cos(a);
    this.windZ = Math.sin(a);
    const wf: { dx: number; dz: number; w: number }[] = [];
    for (let dz = -2; dz <= 2; dz++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (!dx && !dz) continue;
        const d = Math.hypot(dx, dz);
        const align = (dx * this.windX + dz * this.windZ) / d;
        let w = 0;
        if (d < 1.5) {
          const base = d > 1.1 ? 0.7 : 1;
          w = base * Math.max(0.15, 1 + 1.8 * strength * align);
        } else if (strength > 0.1 && align > 0.3) {
          w = 0.8 * strength * align * align;
        }
        if (w > 0) wf.push({ dx, dz, w });
      }
    }
    this.wf = wf;
  }

  private isBlocked(x: number, z: number): boolean {
    const x0 = Math.floor(x - PLAYER_R);
    const x1 = Math.floor(x + PLAYER_R);
    const z0 = Math.floor(z - PLAYER_R);
    const z1 = Math.floor(z + PLAYER_R);
    if (x0 < 0 || z0 < 0 || x1 >= this.W || z1 >= this.H) return true;
    for (let cz = z0; cz <= z1; cz++) for (let cx = x0; cx <= x1; cx++) if (!this.walk[cz * this.W + cx]) return true;
    return false;
  }

  /** Aim assist: distance to the best burning cell inside a cone. */
  findAimTarget(dirX: number, dirZ: number, maxR: number, coneCos = 0.93): { d: number; x: number; z: number } | null {
    const p = this.player;
    const r = Math.ceil(maxR + 1);
    const cx = Math.floor(p.x);
    const cz = Math.floor(p.z);
    let best: { d: number; x: number; z: number } | null = null;
    let bestScore = -1e9;
    for (let z = cz - r; z <= cz + r; z++) {
      if (z < 0 || z >= this.H) continue;
      for (let x = cx - r; x <= cx + r; x++) {
        if (x < 0 || x >= this.W) continue;
        const i = z * this.W + x;
        const f = this.fire[i];
        if (f <= 0.02) continue;
        const vx = x + 0.5 - p.x;
        const vz = z + 0.5 - p.z;
        const d = Math.hypot(vx, vz);
        if (d < 0.7 || d > maxR + 0.6) continue;
        const c = (vx * dirX + vz * dirZ) / d;
        if (c < coneCos) continue;
        const s = c * 3 - (d / maxR) * 0.8 + f * 0.4;
        if (s > bestScore) {
          bestScore = s;
          best = { d: Math.min(d, maxR), x: x + 0.5, z: z + 0.5 };
        }
      }
    }
    return best;
  }

  // ---------- main step ----------
  step(inp: SimInput) {
    const dt = SIM_DT;
    this.updateDrops(dt);
    this.updateEmbers(dt);
    if (this.state !== 'play') return;
    this.time += dt;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.updatePlayer(dt, inp);
    this.emitWater(dt, inp);
    this.updateRockets(dt);
    this.updateWind();
    if (this.comboT > 0) {
      this.comboT -= dt;
      if (this.comboT <= 0) this.combo = 0;
    }
    this.fireAcc += dt;
    while (this.fireAcc >= FIRE_DT) {
      this.fireAcc -= FIRE_DT;
      this.fireTick(FIRE_DT);
    }
    this.checkEnd();
  }

  private updatePlayer(dt: number, inp: SimInput) {
    const p = this.player;
    p.stun = Math.max(0, p.stun - dt);
    let mx = inp.mx;
    let mz = inp.mz;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) {
      mx /= ml;
      mz /= ml;
    }
    if (p.stun > 0) {
      mx = 0;
      mz = 0;
    }
    if (inp.ax || inp.az) {
      const l = Math.hypot(inp.ax, inp.az);
      p.aimX = inp.ax / l;
      p.aimZ = inp.az / l;
    }
    p.aimDist = inp.aimDist;
    if (inp.nozzle !== p.nozzle) {
      if (inp.nozzle === 2 && this.foamLeft <= 0) {
        // no foam left
      } else p.nozzle = inp.nozzle;
    }
    const nz = NOZZLES[p.nozzle];
    const sp = SPEED * (p.spraying ? nz.slow : 1);
    const k = 1 - Math.exp(-14 * dt);
    p.vx += (mx * sp - p.vx) * k;
    p.vz += (mz * sp - p.vz) * k;
    const kd = Math.exp(-7 * dt);
    p.kx *= kd;
    p.kz *= kd;
    const dx = (p.vx + p.kx) * dt;
    const dz = (p.vz + p.kz) * dt;
    if (Math.hypot(mx, mz) > 0.1) p.face = Math.atan2(p.vz, p.vx);

    const ox = p.x;
    const oz = p.z;
    if (!this.isBlocked(p.x + dx, p.z + dz)) {
      p.x += dx;
      p.z += dz;
    } else {
      if (!this.isBlocked(p.x + dx, p.z)) p.x += dx;
      if (!this.isBlocked(p.x, p.z + dz)) p.z += dz;
    }
    // hose leash
    const a = this.anchorPoint(p.anchor);
    const hx = p.x - a.x;
    const hz = p.z - a.z;
    const hd = Math.hypot(hx, hz);
    if (hd > this.hoseLen) {
      const nx = a.x + (hx / hd) * this.hoseLen;
      const nz2 = a.z + (hz / hd) * this.hoseLen;
      if (!this.isBlocked(nx, nz2)) {
        p.x = nx;
        p.z = nz2;
      } else {
        p.x = ox;
        p.z = oz;
      }
      if (p.hoseTaut < 1 && Math.hypot(mx, mz) > 0.2) this.emit('hose', p.x, p.z);
      p.hoseTaut = 1;
    } else p.hoseTaut = hd / this.hoseLen;

    // hydrants / truck reconnection
    let near = -1;
    for (const id of this.anchors) {
      if (id === p.anchor) continue;
      const ap = this.anchorPoint(id);
      if (Math.hypot(ap.x - p.x, ap.z - p.z) < 1.25) near = id;
    }
    if (near >= 0) {
      if (p.connectEnt !== near) {
        p.connectEnt = near;
        p.connectT = 0;
      }
      p.connectT += dt;
      if (p.connectT >= 0.6) {
        p.anchor = near;
        p.connectT = 0;
        p.connectEnt = -1;
        const ap = this.anchorPoint(near);
        this.emit('connect', ap.x, ap.z, 0, near);
      }
    } else {
      p.connectEnt = -1;
      p.connectT = 0;
    }

    // rescues, levers
    for (const e of this.ents) {
      if (e.state !== 0) continue;
      if (RESCUE_TYPES.has(e.type)) {
        if (Math.hypot(e.cx - p.x, e.cz - p.z) < 1.25) {
          e.state = 1;
          this.rescued++;
          this.emit('rescue', e.cx, e.cz, this.rescued, e.id);
        }
      } else if (e.type === 'lever') {
        if (Math.hypot(e.cx - p.x, e.cz - p.z) < 1.3) {
          e.state = 1;
          for (const o of this.ents) if (o.type === 'elec') o.state = 0;
          this.emit('powerOff', e.cx, e.cz, 0, e.id);
        }
      }
    }
    for (const e of this.ents) if (e.soakCd > 0) e.soakCd -= dt;

    // heat from nearby fire
    let hs = 0;
    const cx = Math.floor(p.x);
    const cz = Math.floor(p.z);
    let fx = 0;
    let fz = 0;
    for (let z = cz - 3; z <= cz + 3; z++) {
      if (z < 0 || z >= this.H) continue;
      for (let x = cx - 3; x <= cx + 3; x++) {
        if (x < 0 || x >= this.W) continue;
        const f = this.fire[z * this.W + x];
        if (f <= 0) continue;
        const d = Math.hypot(x + 0.5 - p.x, z + 0.5 - p.z);
        if (d >= 3) continue;
        const h = f * Math.pow(1 - d / 3, 1.5) * MATS[this.mat[z * this.W + x]].heatOut;
        hs += h;
        fx += (x + 0.5 - p.x) * h;
        fz += (z + 0.5 - p.z) * h;
      }
    }
    const fog = p.spraying && p.nozzle === 1;
    const gain = hs * 0.26 * (fog ? 0.22 : 1);
    if (gain > 0.05) p.heat += gain * dt;
    else p.heat -= 0.35 * dt;
    p.heat = Math.max(0, p.heat);
    if (p.heat > 0.55 && !this.hints.heat) {
      this.hints.heat = true;
    }
    if (p.heat >= 1) {
      p.heat = 0.5;
      p.stun = 1.1;
      const l = Math.hypot(fx, fz) || 1;
      p.kx = (-fx / l) * 7;
      p.kz = (-fz / l) * 7;
      this.emit('overheat', p.x, p.z);
    }
  }

  private emitWater(dt: number, inp: SimInput) {
    const p = this.player;
    const want = inp.spray && p.stun <= 0;
    if (want && p.nozzle === 2 && this.foamLeft <= 0) {
      if (!this.foamWarned) {
        this.foamWarned = true;
        this.emit('foamEmpty', p.x, p.z);
      }
      p.nozzle = 0;
    }
    p.spraying = want;
    if (!want) {
      this.emitAcc = 0;
      return;
    }
    if (p.nozzle === 2) this.foamLeft = Math.max(0, this.foamLeft - dt);
    const nz = NOZZLES[p.nozzle];
    this.emitAcc += nz.rate * dt;
    const baseAng = Math.atan2(p.aimZ, p.aimX);
    while (this.emitAcc >= 1) {
      this.emitAcc -= 1;
      const ang = baseAng + (this.rng.next() - 0.5) * 2 * nz.spread;
      let d = p.aimDist > 0 ? Math.min(nz.maxR, Math.max(nz.minR, p.aimDist)) : nz.maxR;
      d *= p.nozzle === 1 ? this.rng.range(0.4, 1.0) : this.rng.range(0.95, 1.05);
      const vh = nz.vh * (p.nozzle === 1 ? this.rng.range(0.8, 1.1) : 1);
      const y0 = 1.05;
      const T = d / vh;
      const vy = (GRAV * T * T * 0.5 - y0) / T;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      this.drops.push({ x: p.x + c * 0.55, y: y0, z: p.z + s * 0.55, vx: c * vh, vy, vz: s * vh, pow: nz.pow, kind: p.nozzle });
    }
  }

  private updateDrops(dt: number) {
    const drops = this.drops;
    let w = 0;
    for (let r = 0; r < drops.length; r++) {
      const d = drops[r];
      d.x += d.vx * dt;
      d.z += d.vz * dt;
      d.y += d.vy * dt;
      d.vy -= GRAV * dt;
      const ci = this.cellAt(d.x, d.z);
      if (ci < 0) continue;
      let dead = false;
      if (d.y < 1.6 && this.state === 'play') {
        for (const e of this.soakables) {
          if (e.state !== 0) continue;
          if (Math.abs(e.cx - d.x) < 0.42 && Math.abs(e.cz - d.z) < 0.42) {
            if (e.soakCd <= 0) {
              e.soakCd = 1.6;
              if (e.type === 'bystander' || e.type === 'person') this.soaks++;
              this.emit('soak', e.cx, e.cz, 0, e.id);
            }
            dead = true;
            break;
          }
        }
      }
      if (!dead && d.y <= this.height[ci]) {
        if (this.state === 'play') this.hit(ci, d);
        dead = true;
      }
      if (dead && this.splashes.length < 400) this.splashes.push(d.x, Math.max(0, d.y), d.z, d.kind);
      if (!dead) drops[w++] = d;
    }
    drops.length = w;
  }

  private hit(ci: number, d: Drop) {
    const pow = d.pow;
    const oid = this.owner[ci];
    if (oid >= 0) {
      const e = this.ents[oid];
      if (e.type === 'cylinder' && e.state === 0) e.t = Math.max(0, e.t - 0.08 * pow);
      if (e.type === 'elec' && e.state === 1) {
        this.short(e);
        return;
      }
    }
    this.douse(ci, pow, d.kind, 1);
    // multi-cell objects (houses, stalls, cars...) act as one: water on any wall reaches its nearest flames
    if (oid >= 0) {
      const e = this.ents[oid];
      if (e.cells.length > 1) {
        let best = -1;
        let bd = 1e9;
        for (const c of e.cells) {
          if (c === ci || this.fire[c] <= 0) continue;
          const dd = Math.hypot((c % this.W) + 0.5 - d.x, Math.floor(c / this.W) + 0.5 - d.z);
          if (dd < bd) {
            bd = dd;
            best = c;
          }
        }
        if (best >= 0) this.douse(best, pow, d.kind, 0.85);
      }
    }
    const W = this.W;
    const x = ci % W;
    if (x > 0) this.douse(ci - 1, pow, d.kind, 0.25);
    if (x < W - 1) this.douse(ci + 1, pow, d.kind, 0.25);
    if (ci - W >= 0) this.douse(ci - W, pow, d.kind, 0.25);
    if (ci + W < this.N) this.douse(ci + W, pow, d.kind, 0.25);
  }

  private douse(i: number, pow: number, kind: number, k: number) {
    const oid = this.owner[i];
    if (k < 1 && oid >= 0) {
      const e = this.ents[oid];
      if (e.type === 'elec' && e.state === 1) return;
      if (e.type === 'cylinder' && e.state === 0) e.t = Math.max(0, e.t - 0.04 * pow);
    }
    const oil = MATS[this.mat[i]].oil;
    if (this.fire[i] > 0) {
      if (oil && kind !== 2) {
        if (k >= 1) this.flare(i);
      } else {
        this.fire[i] -= TUNE.Q * pow * k * (kind === 2 ? 1.3 : 1);
        if (this.fire[i] <= 0) this.extinguish(i, true);
      }
    }
    this.wet[i] = Math.min(1, this.wet[i] + 0.14 * pow * k);
    this.heat[i] *= 1 - 0.4 * k;
    if (kind === 2) this.foam[i] = Math.min(1, this.foam[i] + 0.3 * k);
  }

  private extinguish(i: number, byPlayer: boolean) {
    this.fire[i] = 0;
    this.heat[i] = 0;
    this.extinguished++;
    const x = (i % this.W) + 0.5;
    const z = Math.floor(i / this.W) + 0.5;
    if (!byPlayer) return;
    this.emit('extinguish', x, z);
    this.combo++;
    this.comboT = 1.1;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    if (this.combo >= 8 && this.combo % 8 === 0) this.emit('combo', x, z, this.combo);
    // cluster out?
    if (this.time - this.lastCluster > 1.2) {
      const cx = i % this.W;
      const cz = Math.floor(i / this.W);
      let any = false;
      for (let zz = cz - 3; zz <= cz + 3 && !any; zz++) {
        if (zz < 0 || zz >= this.H) continue;
        for (let xx = cx - 3; xx <= cx + 3; xx++) {
          if (xx < 0 || xx >= this.W) continue;
          if (this.fire[zz * this.W + xx] > 0) {
            any = true;
            break;
          }
        }
      }
      if (!any && this.burning > 1) {
        this.lastCluster = this.time;
        this.emit('clusterOut', x, z);
      }
    }
  }

  private flare(i: number) {
    if (this.flareCd[i] > 0) return;
    this.flareCd[i] = 0.9;
    this.fire[i] = 1;
    const cx = i % this.W;
    const cz = Math.floor(i / this.W);
    for (let z = cz - 2; z <= cz + 2; z++) {
      if (z < 0 || z >= this.H) continue;
      for (let x = cx - 2; x <= cx + 2; x++) {
        if (x < 0 || x >= this.W) continue;
        const j = z * this.W + x;
        if (MATS[this.mat[j]].flam <= 0 || this.fuel[j] <= 0.02) continue;
        if (this.fire[j] > 0) this.fire[j] = Math.min(1, this.fire[j] + 0.3);
        else this.heat[j] += 0.7 * (1 - this.foam[j]);
      }
    }
    const p = this.player;
    const d = Math.hypot(p.x - cx - 0.5, p.z - cz - 0.5);
    if (d < 3) p.heat = Math.min(0.95, p.heat + 0.25);
    this.hints.oil = true;
    this.emit('flare', cx + 0.5, cz + 0.5);
  }

  private short(e: Ent) {
    if (e.soakCd > 0) return;
    e.soakCd = 1.4;
    this.shorts++;
    this.player.stun = Math.max(this.player.stun, 0.8);
    this.hints.elec = true;
    this.emit('short', e.cx, e.cz, 0, e.id);
  }

  private explode(e: Ent) {
    e.state = 1;
    this.explosions++;
    this.extraLost += 8;
    const cx = e.cx;
    const cz = e.cz;
    for (let z = Math.floor(cz - 3); z <= cz + 3; z++) {
      if (z < 0 || z >= this.H) continue;
      for (let x = Math.floor(cx - 3); x <= cx + 3; x++) {
        if (x < 0 || x >= this.W) continue;
        const j = z * this.W + x;
        const d = Math.hypot(x + 0.5 - cx, z + 0.5 - cz);
        if (d > 3) continue;
        this.wet[j] = 0;
        this.foam[j] = 0;
        if (MATS[this.mat[j]].flam > 0 && this.fuel[j] > 0.02 && d < 2.6) {
          this.fire[j] = Math.max(this.fire[j], 0.95 - d * 0.2);
          this.fuel[j] = Math.max(0.02, this.fuel[j] - this.fuel0[j] * 0.25 * (1 - d / 3));
        } else this.heat[j] += 0.6;
      }
    }
    for (const o of this.ents) {
      if (o.type === 'cylinder' && o.state === 0 && Math.hypot(o.cx - cx, o.cz - cz) < 4) o.t = Math.min(0.97, o.t + 0.45);
    }
    const p = this.player;
    const d = Math.hypot(p.x - cx, p.z - cz);
    if (d < 4.5) {
      const l = d || 1;
      p.kx = ((p.x - cx) / l) * 10;
      p.kz = ((p.z - cz) / l) * 10;
      p.stun = Math.max(p.stun, 0.7);
      p.heat = Math.min(0.9, p.heat + 0.4);
    }
    this.emit('explode', cx, cz, 0, e.id);
  }

  private spawnEmber(i: number) {
    if (this.embers.length > 36) return;
    const r = this.rng;
    const s = 1.5 + 3.2 * this.windStrength;
    this.embers.push({
      x: (i % this.W) + 0.5,
      y: Math.max(1.2, this.height[i] + 0.4),
      z: Math.floor(i / this.W) + 0.5,
      vx: this.windX * s + r.range(-0.9, 0.9),
      vy: r.range(2.2, 4),
      vz: this.windZ * s + r.range(-0.9, 0.9),
    });
  }

  private updateEmbers(dt: number) {
    let w = 0;
    for (let k = 0; k < this.embers.length; k++) {
      const e = this.embers[k];
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.z += e.vz * dt;
      e.vy -= 4.5 * dt;
      const ci = this.cellAt(e.x, e.z);
      if (ci < 0) continue;
      if (e.y <= Math.max(0.05, this.height[ci] * 0.8)) {
        if (this.state === 'play' && this.fire[ci] === 0 && this.fuel[ci] > 0.02) {
          const m = MATS[this.mat[ci]];
          this.heat[ci] += 1.25 * m.flam * (1 - 0.97 * this.wet[ci]) * (1 - this.foam[ci]);
        }
        continue;
      }
      this.embers[w++] = e;
    }
    this.embers.length = w;
  }

  private updateRockets(dt: number) {
    const fw = this.def.fireworks;
    if (fw && this.rocketsLeft > 0 && this.time >= this.nextRocket && this.rocketCells.length) {
      // pick a flammable, not burning cell
      let cell = -1;
      for (let tries = 0; tries < 30; tries++) {
        const c = this.rng.pick(this.rocketCells);
        if (this.fire[c] === 0 && this.fuel[c] > 0.3) {
          cell = c;
          break;
        }
      }
      if (cell >= 0) {
        this.rocketsLeft--;
        const tx = (cell % this.W) + 0.5;
        const tz = Math.floor(cell / this.W) + 0.5;
        const bon = this.ents.filter((e) => e.type === 'bonfire');
        const src = bon.length ? this.rng.pick(bon) : null;
        this.rockets.push({ sx: src ? src.cx : tx, sz: src ? src.cz : 0, tx, tz, cell, t: 2.6, total: 2.6 });
        this.emit('rocket', tx, tz);
      }
      this.nextRocket = this.time + fw.every * this.rng.range(0.75, 1.25);
    }
    let w = 0;
    for (let k = 0; k < this.rockets.length; k++) {
      const r = this.rockets[k];
      r.t -= dt;
      if (r.t <= 0) {
        const c = r.cell;
        if (this.wet[c] > 0.22 || this.foam[c] > 0.2) this.emit('fizzle', r.tx, r.tz);
        else {
          this.fire[c] = Math.max(this.fire[c], 0.6);
          const x = c % this.W;
          const z = Math.floor(c / this.W);
          for (const [dx, dz] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            const j = this.cellAt(x + dx + 0.5, z + dz + 0.5);
            if (j >= 0 && this.fuel[j] > 0.02 && MATS[this.mat[j]].flam > 0) this.heat[j] += 0.6 * (1 - this.wet[j]);
          }
          this.emit('rocketHit', r.tx, r.tz);
        }
        continue;
      }
      this.rockets[w++] = r;
    }
    this.rockets.length = w;
  }

  get rocketsPending(): number {
    return this.rocketsLeft + this.rockets.length;
  }

  private updateWind() {
    const shifts = this.def.windShifts;
    if (!shifts || this.windIdx >= shifts.length) return;
    const s = shifts[this.windIdx];
    if (this.time >= s.t - 3 && this.windWarned !== this.windIdx) {
      this.windWarned = this.windIdx;
      this.emit('windWarn', 0, 0, s.angle);
    }
    if (this.time >= s.t) {
      this.setWind(s.angle, s.strength);
      this.windIdx++;
      this.emit('windShift', 0, 0, s.angle);
    }
  }

  private fireTick(dt: number) {
    const W = this.W;
    const H = this.H;
    const { fire, fuel, fuel0, heat, wet, foam, mat } = this;
    const wf = this.wf;
    let ignSfx = false;
    this.igniteSfxT -= dt;
    for (let i = 0; i < this.N; i++) {
      if (this.flareCd[i] > 0) this.flareCd[i] -= dt;
      const f = fire[i];
      if (f > 0) {
        const md = MATS[mat[i]];
        fuel[i] -= md.burn * (0.35 + 0.65 * f) * dt;
        if (fuel[i] <= 0) {
          fuel[i] = 0;
          fire[i] = Math.max(0, f - 0.9 * dt);
        } else {
          const fr = fuel[i] / fuel0[i];
          const grow = fr > 0.15 ? TUNE.grow : -0.6;
          let nf = f + dt * grow * (1 - wet[i]) - dt * Math.max(0, wet[i] - 0.45) * 0.9;
          if (nf > 1) nf = 1;
          if (nf <= 0) {
            this.extinguish(i, false);
            continue;
          }
          fire[i] = nf;
        }
        wet[i] = Math.max(0, wet[i] - 0.22 * f * dt);
        // spread heat
        const out = f * md.heatOut * TUNE.K * dt;
        const x = i % W;
        const z = (i - x) / W;
        for (let k = 0; k < wf.length; k++) {
          const o = wf[k];
          const nx = x + o.dx;
          const nz = z + o.dz;
          if (nx < 0 || nz < 0 || nx >= W || nz >= H) continue;
          const j = nz * W + nx;
          if (fire[j] > 0 || fuel[j] <= 0.02) continue;
          const fl = MATS[mat[j]].flam;
          if (fl <= 0) continue;
          heat[j] += out * o.w * fl * (1 - 0.97 * wet[j]) * (1 - foam[j]);
        }
        if (md.ember > 0 && f > 0.5 && this.rng.next() < md.ember * f * dt * (0.4 + this.windStrength * 1.2)) this.spawnEmber(i);
      } else if (heat[i] > 0) {
        if (heat[i] >= 1 && fuel[i] > 0.02 && MATS[mat[i]].flam > 0) {
          fire[i] = 0.3;
          heat[i] = 0;
          if (!ignSfx && this.igniteSfxT <= 0) {
            ignSfx = true;
            this.igniteSfxT = 0.35;
            this.emit('ignite', (i % W) + 0.5, Math.floor(i / W) + 0.5);
          }
        } else heat[i] = Math.max(0, heat[i] - 0.16 * dt);
      }
      if (wet[i] > 0) wet[i] = Math.max(0, wet[i] - 0.018 * dt);
      if (foam[i] > 0) foam[i] = Math.max(0, foam[i] - 0.006 * dt);
    }

    // rescuees in danger
    for (const e of this.rescuees) {
      if (e.state !== 0) continue;
      const cx = Math.floor(e.cx);
      const cz = Math.floor(e.cz);
      let danger = 0;
      let nearest = 99;
      for (let z = cz - 5; z <= cz + 5; z++) {
        if (z < 0 || z >= H) continue;
        for (let x = cx - 5; x <= cx + 5; x++) {
          if (x < 0 || x >= W) continue;
          const f = fire[z * W + x];
          if (f <= 0) continue;
          const d = Math.hypot(x - cx, z - cz);
          if (d < nearest) nearest = d;
          if (d < 1.5 && f > danger) danger = f;
        }
      }
      e.alert = Math.max(0, 1 - nearest / 5.5);
      if (danger > 0.3) e.t += dt;
      else e.t = Math.max(0, e.t - dt * 0.5);
      if (e.t > 2.2) {
        e.state = 2;
        this.fled++;
        this.emit('fled', e.cx, e.cz, 0, e.id);
      }
    }
    // gas cylinders
    for (const e of this.ents) {
      if (e.type !== 'cylinder' || e.state !== 0) continue;
      const cx = Math.floor(e.cx);
      const cz = Math.floor(e.cz);
      let s = 0;
      for (let z = cz - 2; z <= cz + 2; z++) {
        if (z < 0 || z >= H) continue;
        for (let x = cx - 2; x <= cx + 2; x++) {
          if (x < 0 || x >= W) continue;
          const f = fire[z * W + x];
          if (f <= 0) continue;
          const d = Math.hypot(x - cx, z - cz);
          if (d < 2.3) s += f * (1 - d / 2.6);
        }
      }
      if (s > 0.01) e.t += s * 0.045 * dt;
      else e.t = Math.max(0, e.t - 0.03 * dt);
      if (e.t > 0.4 && !this.hints.cylinder) {
        this.hints.cylinder = true;
        this.emit('cylinderWarn', e.cx, e.cz, 0, e.id);
      }
      e.alert = e.t;
      if (e.t >= 1) this.explode(e);
    }
    this.recount();
  }

  private recount() {
    let burning = 0;
    let lost = 0;
    for (let i = 0; i < this.N; i++) {
      if (this.fire[i] > 0) burning++;
      const f0 = this.fuel0[i];
      if (f0 > 0 && this.value[i] > 0) lost += this.value[i] * (1 - this.fuel[i] / f0);
    }
    this.burning = burning;
    if (burning > this.peakBurning) this.peakBurning = burning;
    this.lostValue = lost + this.extraLost;
    this.saved = Math.max(0, 1 - this.lostValue / Math.max(1, this.totalValue));
  }

  get control(): number {
    if (this.burning === 0) return 1;
    return this.extinguished / (this.extinguished + this.burning);
  }

  private checkEnd() {
    if (this.state !== 'play') return;
    if (this.time > 1 && this.burning === 0 && this.embers.length === 0 && this.rocketsPending === 0) this.finish(true, 'win');
    else if (this.timeLeft <= 0) this.finish(false, 'time');
    else if (this.saved < this.def.minSaved) this.finish(false, 'control');
  }

  private finish(win: boolean, reason: Result['reason']) {
    this.state = win ? 'won' : 'lost';
    const rescueTotal = this.rescuees.length;
    let stars = 0;
    if (win) {
      stars = 1;
      if (this.saved >= this.def.stars[0]) stars = 2;
      if (this.saved >= this.def.stars[1] && this.fled === 0) stars = 3;
    }
    const score = win
      ? Math.max(0, Math.round(this.saved * 1000 + this.rescued * 150 + this.timeLeft * 4 + this.maxCombo * 5 - this.soaks * 20 - this.shorts * 40 - this.explosions * 100))
      : 0;
    this.result = {
      win,
      reason,
      stars,
      saved: this.saved,
      timeUsed: this.time,
      timeLeft: this.timeLeft,
      rescued: this.rescued,
      rescueTotal,
      fled: this.fled,
      score,
      soaks: this.soaks,
      shorts: this.shorts,
      explosions: this.explosions,
      maxCombo: this.maxCombo,
      extinguished: this.extinguished,
    };
    this.emit(win ? 'win' : 'lose', this.player.x, this.player.z);
  }
}
