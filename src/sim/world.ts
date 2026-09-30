import { Bot, SKILL_PARTNER } from './bot';
import { M, MATS } from './materials';
import { newEnt, parseLevel, RESCUE_TYPES, WINDOW_RESCUE_TIME } from './parse';
import { hashString, Rng } from './rng';
import { isNight, NOZZLES, type CrewId, type Ent, type EventKind, type LevelDef, type PowerKind, type SimEvent, type SimEventType, type SimInput } from './types';

export const SIM_DT = 1 / 60;
const FIRE_DT = 1 / 20;
const GRAV = 12;
const SPEED = 4.7;
export const TUNE = { K: 0.9, Q: 0.035, grow: 0.32 };
const PLAYER_R = 0.3;

// ---- v2 systems (docs/diseno-v2.md) ----
/** Seconds a power-up stays on the ground. */
export const POWER_LIFE = 14;
/** Duration of the timed power-ups. */
export const BUFF_TIME = { turbo: 12, boots: 10, suit: 15 } as const;
export const CLOCK_SECS = 20;
/** Helicopter: seconds from the call to the drop, and the radius it puts out. */
export const HELI_DELAY = 2.2;
export const HELI_R = 3.3;
/** Events: warning before they start, and how long the timed ones last. */
export const EVENT_WARN = 3;
export const EVENT_TIME: Record<EventKind, number> = { neighbors: 18, rain: 14, gust: 10, pressure: 12, leak: 0, onlookers: 0, blackout: 20 };
/** A hose cut by a train is spliced by itself after this, or at once by hooking up to the truck or a hydrant. */
export const HOSE_SPLICE = 6;
/**
 * Portable extinguisher (the power-up): seconds of powder it carries (a second one adds up, to a cap), and its jet.
 * Using it drops the hose where you stand: you move freely, beyond the hose's reach, until it runs out; then you walk
 * back to pick the hose up. Dry powder knocks flames down fast and works on fuel fires, but reaches only 3.6 m.
 */
export const EXT_TIME = 6;
export const EXT_MAX = 9;
export const EXT_NOZZLE = { key: 'ext', rate: 70, pow: 1.5, vh: 6.5, spread: 0.3, minR: 0.9, maxR: 3.6, slow: 1 } as const;
/** Seconds standing on the dropped hose to pick it up again. */
const HOSE_PICK_TIME = 0.25;
/**
 * The Pulaski (half axe, half hoe, the wildland firefighter's tool): holding it digs the cell in front, turning grass,
 * dry grass, leaf litter or tall grass into bare earth that does not burn (the cell still counts as saved). A cell
 * takes DIG_TIME; you move slowly and cannot spray while you dig, and burning cells cannot be dug.
 */
export const DIG_TIME = 0.5;
const DIG_SPEED = 0.4;
export const DIG_MATS = new Set<number>([M.Grass, M.Dry, M.Leaves, M.TallGrass]);
/** Seconds a rescuee stands the fire next to it before it runs off (people at windows hold on longer). */
const FLEE_TIME: Partial<Record<Ent['type'], number>> = { window: 4.5, onlooker: 3.2, art: 3 };
/** A person at a window is worth this much of the "saved" score (lost if they have to escape). */
const WINDOW_VALUE = 15;
/** The museum: each artwork is worth this much of the "saved" score (lost if it burns). */
const ART_VALUE = 20;
/** Seconds it takes to hook up to an anchor (a frozen hydrant at the ski lodge: the ice has to be chipped off first). */
const CONNECT_TIME = 0.6;
const FROZEN_CONNECT_TIME = 2.4;
/** Walking on ice: how fast you get up to speed and stop (on the ground it is 14). */
const ICE_GRIP = 2.2;
/** Wading through deep snow (ski lodge): slower. */
const SNOW_SPEED = 0.68;
/** Carrying an artwork: slower, and no water. */
const CARRY_SPEED = 0.72;
/** Museum sprinklers: seconds they run once their lever is pulled, water they put on every cell per second, and how
 *  much they weaken flames already burning (per second). They stop the spread; what burns still has to be put out. */
export const SPRINKLER_TIME = 16;
const SPRINKLER_WET = 0.24;
const SPRINKLER_DOUSE = 0.1;
/** Crew stats by level (1-3), see docs/diseno-v2.md §5.5. */
export const CREW_STATS = {
  partner: { pow: [0.45, 0.6, 0.75], hose: [-3, -2, -1] },
  dog: { speed: [4, 5, 6] },
  drone: { every: [10, 8, 6] },
} as const;

export interface Drop {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  pow: number;
  kind: number;
  /** 1: thrown by a helper (partner, neighbours): soaking someone does not count against the player */
  own?: number;
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

/** A firefighter: the player, or the partner from the crew (moved by the bot). */
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
  /** hose cut by a train: seconds until it is spliced by itself (0 = fine) */
  cut: number;
  /** length of this firefighter's hose */
  hose: number;
  /** water power relative to the player (the partner is weaker) */
  pow: number;
  /** the museum: id of the artwork being carried (-1: none) */
  carry: number;
}

export interface PowerUp {
  kind: PowerKind;
  x: number;
  z: number;
  /** seconds left on the ground */
  t: number;
}

export interface Train {
  z: number;
  dir: 1 | -1;
  len: number;
  speed: number;
  every: number;
  /** time of the next pass */
  next: number;
  /** x of the front of the train while it passes */
  head: number;
  /** 0 idle, 1 warning (bells and lights), 2 passing */
  st: 0 | 1 | 2;
}

export interface Dog {
  x: number;
  z: number;
  face: number;
  target: number;
  path: number[];
  repath: number;
  speed: number;
  moving: boolean;
}
export interface Drone {
  x: number;
  z: number;
  tx: number;
  tz: number;
  t: number;
  every: number;
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
  powerups: number;
}

export interface SimOptions {
  seed?: number;
  hoseDelta?: number;
  windOverride?: { angle: number; strength: number };
  extraFires?: number[];
  /** Upgrades (see src/economy.ts): multipliers on water power, nozzle reach and run speed, and extra seconds. */
  powerMul?: number;
  reachMul?: number;
  speedMul?: number;
  timeDelta?: number;
  /** Crew taken to this level and their level (1-3). */
  crew?: Partial<Record<CrewId, number>>;
  /** Helicopter charges at the start (rewarded "air support"). */
  heli?: number;
}

/** A planned event: it starts at `t`, or earlier if the fire is already `ctl` under control (a fast player sees it too). */
type EventRun = { kind: EventKind; t: number; ctl: number; st: 0 | 1 | 2 | 3 };
/** Events never start before this second, however fast the fire goes out. */
export const EVENT_MIN_T = 10;

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
  /** plans of power-ups and events: fixed per level (and per day in the daily), whatever the player does */
  readonly prng: Rng;

  time = 0;
  timeLeft: number;
  state: 'play' | 'won' | 'lost' = 'play';
  result: Result | null = null;
  foamLeft: number;
  foamMax: number;
  readonly powerMul: number;
  readonly reachMul: number;
  readonly speedMul: number;
  /** fire spread of this level (route ramp) */
  readonly spread: number;
  windAngle = 0;
  windStrength = 0;
  windX = 0;
  windZ = 0;
  private windIdx = 0;
  private windWarned = -1;
  private wf: { dx: number; dz: number; w: number }[] = [];
  private fireAcc = 0;
  private emitAcc = 0;
  private partnerAcc = 0;
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
  hints = { cylinder: false, oil: false, elec: false, heat: false, hydrant: false, pump: false, ice: false, frozen: false, snow: false };
  /** the museum: artworks and the doors to carry them out */
  readonly arts: Ent[] = [];
  readonly exits: Ent[] = [];
  /** the museum: sprinkler zones (cells x0..x1, z0..z1 inclusive), their lever and the seconds they have left */
  readonly sprinklers: { lever: number; x0: number; z0: number; x1: number; z1: number; t: number }[] = [];
  /** the campground: seconds until the helicopter is ready again (0: ready or not on call) */
  heliCd = 0;

  // ---- v2 ----
  /** power-up on the ground, and the timed ones running */
  powerup: PowerUp | null = null;
  buffs = { turbo: 0, boots: 0, suit: 0 };
  powerPicked = 0;
  private powerPlan: { t: number; kind: PowerKind; cell: number }[] = [];
  private powerIdx = 0;
  /** portable extinguisher: seconds of powder left, in use now, and where the hose was dropped (null: in hand) */
  extLeft = 0;
  extOn = false;
  hoseDrop: { x: number; z: number } | null = null;
  private hosePickT = 0;
  private needHoseWarned = false;
  /** the Pulaski: available on this level, digging now, the cell and its progress, cells dug */
  canDig = false;
  digging = false;
  digCell = -1;
  digT = 0;
  dug = 0;
  /** helicopter: charges ready, and drops on their way */
  heliCharges: number;
  helis: { x: number; z: number; t: number }[] = [];
  /** events: the plan and the seconds left of the timed ones running */
  readonly eventPlan: EventRun[] = [];
  private evLast = -99;
  evT: Record<EventKind, number> = { neighbors: 0, rain: 0, gust: 0, pressure: 0, leak: 0, onlookers: 0, blackout: 0 };
  private gustBase: { angle: number; strength: number } | null = null;
  leak: Ent | null = null;
  private onlookers: Ent[] = [];
  neighbors: Ent[] = [];
  /** rail yard */
  trains: Train[] = [];
  /** cells a train covers right now, and the rows of a track with a train coming or passing */
  readonly trainCells: Uint8Array;
  readonly trainDanger: Uint8Array;
  /** crew */
  partner: Player | null = null;
  private partnerBot: Bot | null = null;
  dog: Dog | null = null;
  drone: Drone | null = null;
  private slickAcc = 0;
  private hasSlick = false;
  private bfsPrev: Int32Array;
  private bfsSeen: Uint8Array;
  private bfsQ: Int32Array;
  private reachable: number[] | null = null;

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
    this.trainCells = new Uint8Array(this.N);
    this.trainDanger = new Uint8Array(this.N);
    this.bfsPrev = new Int32Array(this.N);
    this.bfsSeen = new Uint8Array(this.N);
    this.bfsQ = new Int32Array(this.N);
    this.rng = new Rng(opts.seed ?? 12345);
    this.prng = new Rng(hashString('apagalo/plan/' + def.id) ^ (opts.seed ?? 12345));
    for (let i = 0; i < this.N; i++) {
      const md = MATS[this.mat[i]];
      this.fuel0[i] = md.fuel;
      this.fuel[i] = md.fuel;
      this.value[i] = md.flam > 0 ? (p.value[i] >= 0 ? p.value[i] : md.value) : 0;
      this.totalValue += this.value[i];
      if (this.mat[i] === M.Slick) this.hasSlick = true;
    }
    for (const e of this.ents) {
      if (e.type === 'truck' || e.type === 'hydrant' || e.type === 'seapump') this.anchors.push(e.id);
      if (RESCUE_TYPES.has(e.type) || e.type === 'art') this.rescuees.push(e);
      if (e.type === 'art') {
        this.arts.push(e);
        this.totalValue += ART_VALUE;
      }
      if (e.type === 'exit') this.exits.push(e);
      // (people at a window are up at the window: the water passes under them)
      if ((RESCUE_TYPES.has(e.type) && e.type !== 'window') || e.type === 'bystander') this.soakables.push(e);
      if (e.type === 'elec') e.state = 1;
      if (e.type === 'cylinder') this.totalValue += 8;
      if (e.type === 'window') this.totalValue += WINDOW_VALUE;
    }
    for (const i of p.burning) this.fire[i] = 0.7;
    for (const i of opts.extraFires ?? []) this.fire[i] = 0.7;

    this.timeLeft = def.time + (opts.timeDelta ?? 0);
    this.powerMul = opts.powerMul ?? 1;
    this.reachMul = opts.reachMul ?? 1;
    this.speedMul = opts.speedMul ?? 1;
    this.spread = def.spread ?? 1;
    this.foamMax = def.foam ?? 0;
    this.foamLeft = this.foamMax;
    this.heliCharges = opts.heli ?? 0;
    // the campground: the helicopter is on call from the start
    if (this.def.heliEvery) this.heliCharges = Math.max(1, this.heliCharges);
    const w = opts.windOverride ?? def.wind;
    this.setWind(w.angle, w.strength);

    const truck = this.ents.find((e) => e.type === 'truck');
    if (!truck) throw new Error('Level has no truck');
    const a = this.anchorPoint(truck.id);
    this.player = this.newFighter(a.x, a.z, truck.id, def.hose + (opts.hoseDelta ?? 0), 1);
    this.canDig = !!def.dig && this.mat.some((m) => DIG_MATS.has(m));
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
    for (const t of def.trains ?? []) this.trains.push({ z: t.z, dir: t.dir, len: t.len ?? 11, speed: t.speed ?? 13, every: t.every, next: t.first, head: 0, st: 0 });
    for (const sp of def.sprinklers ?? []) {
      const [lx, lz] = sp.lever;
      const o = this.owner[lz * this.W + lx];
      if (o < 0 || this.ents[o].type !== 'lever') throw new Error(`Level ${def.id}: sprinkler lever at ${lx},${lz} is not a lever`);
      const [x, z, w, h] = sp.area;
      this.sprinklers.push({ lever: o, x0: Math.max(0, x), z0: Math.max(0, z), x1: Math.min(this.W - 1, x + w - 1), z1: Math.min(this.H - 1, z + h - 1), t: 0 });
    }
    this.planPowerups(opts);
    this.planEvents();
    this.addCrew(opts, a);
    this.recount();
    this.peakBurning = this.burning;
  }

  private newFighter(x: number, z: number, anchor: number, hose: number, pow: number): Player {
    return { x, z, vx: 0, vz: 0, kx: 0, kz: 0, face: -Math.PI / 2, aimX: 0, aimZ: -1, aimDist: 0, spraying: false, nozzle: 0, heat: 0, stun: 0, anchor, connectT: 0, connectEnt: -1, hoseTaut: 0, cut: 0, hose, pow, carry: -1 };
  }

  /** Length of the player's hose (with the upgrade). */
  get hoseLen(): number {
    return this.player.hose;
  }

  // ---------- helpers ----------
  cellAt(x: number, z: number): number {
    const cx = Math.floor(x);
    const cz = Math.floor(z);
    if (cx < 0 || cz < 0 || cx >= this.W || cz >= this.H) return -1;
    return cz * this.W + cx;
  }
  private emit(type: SimEventType, x: number, z: number, n?: number, ent?: number, k?: string) {
    this.events.push(k === undefined ? { type, x, z, n, ent } : { type, x, z, n, ent, k });
  }

  /** Hose connection point for an anchor entity. */
  anchorPoint(id: number): { x: number; z: number } {
    const e = this.ents[id];
    if (e.type === 'hydrant' || e.type === 'seapump') return { x: e.cx, z: e.cz };
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
    for (let cz = z0; cz <= z1; cz++)
      for (let cx = x0; cx <= x1; cx++) {
        const c = cz * this.W + cx;
        if (!this.walk[c] || this.trainCells[c]) return true;
      }
    return false;
  }

  /** Water power right now (upgrades, turbo pump, pressure drop). */
  get waterPow(): number {
    return this.powerMul * (this.buffs.turbo > 0 ? 1.7 : 1) * (this.evT.pressure > 0 ? 0.5 : 1);
  }
  /** Nozzle reach multiplier right now. */
  get reachNow(): number {
    return this.reachMul * (this.buffs.turbo > 0 ? 1.2 : 1) * (this.evT.pressure > 0 ? 0.8 : 1);
  }

  /** Maximum reach of a nozzle, including the pressure upgrade (and the turbo pump / pressure drop). */
  nozzleRange(n: 0 | 1 | 2): number {
    return NOZZLES[n].maxR * this.reachNow;
  }
  /** Maximum reach of a nozzle for a firefighter (the partner has no turbo). */
  rangeOf(p: Player, n: 0 | 1 | 2): number {
    return p === this.player ? this.nozzleRange(n) : NOZZLES[n].maxR * this.reachMul * (this.evT.pressure > 0 ? 0.8 : 1);
  }

  /** Rewarded continue: reopens a level that just ran out of time, with `sec` seconds on the clock. */
  continueWithTime(sec: number): boolean {
    if (this.state !== 'lost' || this.result?.reason !== 'time') return false;
    this.state = 'play';
    this.result = null;
    this.timeLeft = sec;
    return true;
  }

  /** Aim assist: distance to the best burning cell inside a cone. */
  findAimTarget(dirX: number, dirZ: number, maxR: number, coneCos = 0.93, p: Player = this.player): { d: number; x: number; z: number } | null {
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
    if (this.trains.length) this.updateTrains(dt);
    this.updateExtMode(inp);
    this.updateFighter(this.player, dt, inp, true);
    if (this.canDig) this.updateDig(inp, dt);
    this.spray(this.player, dt, inp, true);
    if (inp.heli) this.callHeli();
    if (this.partner && this.partnerBot) {
      const pi = this.partnerBot.update();
      this.updateFighter(this.partner, dt, pi, false);
      this.spray(this.partner, dt, pi, false);
    }
    this.updateRockets(dt);
    this.updateWind();
    if (this.powerPlan.length || this.powerup) this.updatePowerups(dt);
    if (this.eventPlan.length) this.updateEvents(dt);
    if (this.helis.length) this.updateHelis(dt);
    if (this.def.heliEvery && this.heliCharges === 0 && this.helis.length === 0) {
      this.heliCd = Math.max(0, this.heliCd - dt);
      if (this.heliCd <= 0) {
        this.heliCharges = 1;
        this.emit('heliReady', this.player.x, this.player.z);
      }
    }
    if (this.dog) this.updateDog(dt);
    if (this.drone) this.updateDrone(dt);
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

  private updateFighter(p: Player, dt: number, inp: SimInput, hero: boolean) {
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
      if (inp.nozzle === 2 && (!hero || this.foamLeft <= 0)) {
        // no foam left (the partner never has any)
      } else p.nozzle = inp.nozzle;
    }
    const nz = NOZZLES[p.nozzle];
    // the ski lodge: on ice you slide (slow to get going, slower to stop), deep snow slows you down
    const here = this.cellAt(p.x, p.z);
    const onIce = here >= 0 && this.mat[here] === M.Ice;
    const inSnow = here >= 0 && this.mat[here] === M.Snow;
    if (onIce && hero && !this.hints.ice) {
      this.hints.ice = true;
      this.emit('ice', p.x, p.z);
    }
    if (inSnow && hero && !this.hints.snow && Math.hypot(mx, mz) > 0.3) {
      this.hints.snow = true;
      this.emit('deepSnow', p.x, p.z);
    }
    const sp =
      SPEED *
      (hero ? this.speedMul * (this.buffs.boots > 0 ? 1.35 : 1) : this.speedMul * 0.92) *
      (p.spraying && !(hero && this.extOn) ? nz.slow : 1) *
      (hero && this.digging ? DIG_SPEED : 1) *
      (p.carry >= 0 ? CARRY_SPEED : 1) *
      (inSnow ? SNOW_SPEED : 1);
    const k = 1 - Math.exp(-(onIce ? ICE_GRIP : 14) * dt);
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
    // hose leash (none while the hero has dropped it to use the extinguisher)
    const a = this.anchorPoint(p.anchor);
    const hx = p.x - a.x;
    const hz = p.z - a.z;
    const hd = Math.hypot(hx, hz);
    const free = hero && this.hoseDrop !== null;
    if (free) {
      p.hoseTaut = 0;
      // back on the dropped hose (and not spraying powder): pick it up
      const hdp = this.hoseDrop!;
      if (!this.extOn && Math.hypot(hdp.x - p.x, hdp.z - p.z) < 1.1) {
        this.hosePickT += dt;
        if (this.hosePickT >= HOSE_PICK_TIME) this.pickHose(p);
      } else this.hosePickT = 0;
    } else if (hd > p.hose) {
      const nx = a.x + (hx / hd) * p.hose;
      const nz2 = a.z + (hz / hd) * p.hose;
      if (!this.isBlocked(nx, nz2)) {
        p.x = nx;
        p.z = nz2;
      } else {
        p.x = ox;
        p.z = oz;
      }
      if (hero && p.hoseTaut < 1 && Math.hypot(mx, mz) > 0.2) this.emit('hose', p.x, p.z);
      p.hoseTaut = 1;
    } else p.hoseTaut = hd / p.hose;

    // hydrants / truck reconnection (a cut hose also reconnects to its own anchor)
    let near = -1;
    for (const id of this.anchors) {
      if (id === p.anchor && p.cut <= 0 && !(hero && this.hoseDrop)) continue;
      if (hero && this.extOn) continue;
      const ap = this.anchorPoint(id);
      if (Math.hypot(ap.x - p.x, ap.z - p.z) < 1.25) near = id;
    }
    if (near >= 0) {
      if (p.connectEnt !== near) {
        p.connectEnt = near;
        p.connectT = 0;
      }
      p.connectT += dt;
      if (hero && p.connectT > 0.3 && this.connectTime(near) > CONNECT_TIME && !this.hints.frozen) {
        this.hints.frozen = true;
        this.emit('frozen', this.ents[near].cx, this.ents[near].cz, 0, near);
      }
      if (p.connectT >= this.connectTime(near)) {
        const wasCut = p.cut > 0;
        // a hydrant chipped free of ice stays free
        if (this.ents[near].type === 'hydrant') this.ents[near].state = 1;
        p.anchor = near;
        p.connectT = 0;
        p.connectEnt = -1;
        p.cut = 0;
        // a dropped hose is left where it was: this one comes from the truck or hydrant just hooked up to
        if (hero && this.hoseDrop) {
          this.hoseDrop = null;
          this.hosePickT = 0;
          this.needHoseWarned = false;
        }
        const ap = this.anchorPoint(near);
        if (hero) {
          this.emit('connect', ap.x, ap.z, 0, near);
          if (wasCut) this.emit('hoseFixed', p.x, p.z);
          if (this.ents[near].type === 'seapump' && !this.hints.pump) {
            this.hints.pump = true;
            this.emit('pumpFoam', ap.x, ap.z, 0, near);
          }
        }
      }
    } else {
      p.connectEnt = -1;
      p.connectT = 0;
    }
    if (p.cut > 0) {
      p.cut -= dt;
      if (p.cut <= 0) {
        p.cut = 0;
        if (hero) this.emit('hoseFixed', p.x, p.z);
      }
    }
    if (!hero) return;

    // the sea pump refills the foam while the hose is hooked to it
    if (this.foamMax > 0 && this.ents[p.anchor].type === 'seapump' && this.foamLeft < this.foamMax) this.foamLeft = Math.min(this.foamMax, this.foamLeft + dt * 0.8);

    // rescues, levers
    for (const e of this.ents) {
      if (e.state !== 0) continue;
      if (e.type === 'window') {
        // the platform goes up while the player stands on the spot under the window
        if (Math.hypot(e.cx - p.x, e.cz - p.z) < 0.8) {
          e.prog += dt;
          if (e.prog >= WINDOW_RESCUE_TIME) this.rescue(e);
        } else e.prog = Math.max(0, e.prog - dt * 2);
      } else if (RESCUE_TYPES.has(e.type)) {
        if (Math.hypot(e.cx - p.x, e.cz - p.z) < 1.25) this.rescue(e);
      } else if (e.type === 'art') {
        if (p.carry < 0 && Math.hypot(e.cx - p.x, e.cz - p.z) < 1.3) {
          e.state = 4;
          p.carry = e.id;
          this.emit('artPick', e.cx, e.cz, 0, e.id);
        }
      } else if (e.type === 'lever') {
        if (Math.hypot(e.cx - p.x, e.cz - p.z) < 1.3) {
          e.state = 1;
          // the museum: the lever of a sprinkler zone turns its sprinklers on; elsewhere it cuts the power
          const zone = this.sprinklers.find((z) => z.lever === e.id);
          if (zone) {
            zone.t = SPRINKLER_TIME;
            this.emit('sprinkler', e.cx, e.cz, 0, e.id);
          } else {
            for (const o of this.ents) if (o.type === 'elec') o.state = 0;
            this.emit('powerOff', e.cx, e.cz, 0, e.id);
          }
        }
      }
    }
    // the museum: an artwork carried to a door is safe
    if (p.carry >= 0) {
      for (const x of this.exits) {
        if (Math.hypot(x.cx - p.x, x.cz - p.z) >= 1.3) continue;
        const a = this.ents[p.carry];
        p.carry = -1;
        a.cx = x.cx;
        a.cz = x.cz;
        this.rescue(a, 'art');
        break;
      }
    }
    for (const e of this.ents) if (e.soakCd > 0) e.soakCd -= dt;
    // power-up pick-up
    const pw = this.powerup;
    if (pw && Math.hypot(pw.x - p.x, pw.z - p.z) < 0.95) this.pickPower(pw);

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
    const gain = this.buffs.suit > 0 ? 0 : hs * 0.26 * (fog ? 0.22 : 1);
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

  private rescue(e: Ent, by?: string) {
    e.state = 1;
    this.rescued++;
    this.emit('rescue', e.cx, e.cz, this.rescued, e.id, by);
  }

  private spray(p: Player, dt: number, inp: SimInput, hero: boolean) {
    const ext = hero && this.extOn;
    // the hose on the ground: no water until it is picked up again
    const noHose = hero && this.hoseDrop !== null && !ext;
    if (noHose && inp.spray && !this.needHoseWarned) {
      this.needHoseWarned = true;
      this.emit('needHose', this.hoseDrop!.x, this.hoseDrop!.z);
    }
    const want = inp.spray && p.stun <= 0 && p.carry < 0 && !(hero && this.digging) && (ext || (p.cut <= 0 && !noHose));
    if (hero && want && !ext && p.nozzle === 2 && this.foamLeft <= 0) {
      if (!this.foamWarned) {
        this.foamWarned = true;
        this.emit('foamEmpty', p.x, p.z);
      }
      p.nozzle = 0;
    }
    p.spraying = want;
    if (!want) {
      if (hero) this.emitAcc = 0;
      else this.partnerAcc = 0;
      return;
    }
    if (ext) {
      this.extLeft -= dt;
      if (this.extLeft <= 0) {
        this.extLeft = 0;
        this.extOn = false;
        this.emit('extEmpty', p.x, p.z);
      }
    } else if (hero && p.nozzle === 2) this.foamLeft = Math.max(0, this.foamLeft - dt);
    const nz = ext ? EXT_NOZZLE : NOZZLES[p.nozzle];
    const kind = ext ? 3 : p.nozzle;
    let acc = (hero ? this.emitAcc : this.partnerAcc) + nz.rate * dt;
    const baseAng = Math.atan2(p.aimZ, p.aimX);
    // powder: its own jet, no upgrades, no water pressure events
    const reach = ext ? 1 : hero ? this.reachNow : this.reachMul * (this.evT.pressure > 0 ? 0.8 : 1);
    const pow = ext ? 1 : hero ? this.waterPow : this.powerMul * p.pow * (this.evT.pressure > 0 ? 0.5 : 1);
    while (acc >= 1) {
      acc -= 1;
      const ang = baseAng + (this.rng.next() - 0.5) * 2 * nz.spread;
      const maxR = nz.maxR * reach;
      let d = p.aimDist > 0 ? Math.min(maxR, Math.max(nz.minR, p.aimDist)) : maxR;
      d *= kind === 1 ? this.rng.range(0.4, 1.0) : kind === 3 ? this.rng.range(0.8, 1.08) : this.rng.range(0.95, 1.05);
      const vh = nz.vh * (kind === 1 ? this.rng.range(0.8, 1.1) : 1);
      const y0 = 1.05;
      const T = d / vh;
      const vy = (GRAV * T * T * 0.5 - y0) / T;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const drop: Drop = { x: p.x + c * 0.55, y: y0, z: p.z + s * 0.55, vx: c * vh, vy, vz: s * vh, pow: nz.pow * pow, kind };
      if (!hero) drop.own = 1;
      this.drops.push(drop);
    }
    if (hero) this.emitAcc = acc;
    else this.partnerAcc = acc;
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
              if ((e.type === 'bystander' || e.type === 'person' || e.type === 'onlooker') && !d.own) this.soaks++;
              this.emit('soak', e.cx, e.cz, 0, e.id);
            }
            dead = true;
            break;
          }
        }
      }
      // a passing train takes the water
      if (!dead && this.trainCells[ci] && d.y <= 2.6) dead = true;
      else if (!dead && d.y <= this.height[ci]) {
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
      if (e.type === 'leak' && e.state === 0) this.coolLeak(e, 0.03 * pow);
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
      if (e.type === 'leak' && e.state === 0) this.coolLeak(e, 0.015 * pow);
    }
    const oil = MATS[this.mat[i]].oil;
    if (this.fire[i] > 0) {
      if (oil && kind !== 2 && kind !== 3) {
        if (k >= 1) this.flare(i);
      } else {
        this.fire[i] -= TUNE.Q * pow * k * (kind === 2 ? 1.3 : kind === 3 ? 1.4 : 1);
        if (this.fire[i] <= 0) this.extinguish(i, true);
      }
    }
    this.wet[i] = Math.min(1, this.wet[i] + 0.14 * pow * k * (kind === 3 ? 0.35 : 1));
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
      // during a gust the shift waits: the gust ends into it
      if (this.evT.gust > 0) this.gustBase = { angle: s.angle, strength: s.strength };
      else this.setWind(s.angle, s.strength);
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
    const rain = this.evT.rain > 0;
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
          if (rain) nf -= dt * 0.035;
          if (nf > 1) nf = 1;
          if (nf <= 0) {
            this.extinguish(i, false);
            continue;
          }
          fire[i] = nf;
        }
        wet[i] = Math.max(0, wet[i] - 0.22 * f * dt);
        // spread heat
        const out = f * md.heatOut * TUNE.K * this.spread * dt;
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
        } else heat[i] = Math.max(0, heat[i] - (rain ? 0.4 : 0.16) * dt);
      }
      if (wet[i] > 0) wet[i] = Math.max(0, wet[i] - 0.018 * dt);
      if (foam[i] > 0) foam[i] = Math.max(0, foam[i] - 0.006 * dt);
      if (rain && fuel[i] > 0.02 && fire[i] === 0) wet[i] = Math.min(1, wet[i] + 0.03 * dt);
    }
    if (this.hasSlick) this.updateSlicks(dt);
    if (this.sprinklers.length) this.updateSprinklers(dt);

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
      if (e.t > (FLEE_TIME[e.type] ?? 2.2)) {
        e.state = 2;
        this.fled++;
        if (e.type === 'window') this.extraLost += WINDOW_VALUE;
        if (e.type === 'art') this.extraLost += ART_VALUE;
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

  /**
   * The docks: burning fuel on the sea drifts downwind, one cell at a time (faster with more wind). It stops at the
   * quay, the boats and the pier (and sets them on fire), and a foamed patch stays put. Burnt out, it is sea again.
   */
  private updateSlicks(dt: number) {
    const { mat, fuel, fuel0, fire, heat, wet, foam, flareCd } = this;
    let any = false;
    for (let i = 0; i < this.N; i++) {
      if (mat[i] !== M.Slick) continue;
      if (fuel[i] <= 0.02 && fire[i] <= 0) {
        mat[i] = M.Water;
        fuel[i] = 0;
        fuel0[i] = 0;
        heat[i] = 0;
        continue;
      }
      any = true;
    }
    this.hasSlick = any;
    if (!any) return;
    this.slickAcc += (dt * Math.max(0.25, this.windStrength)) / 0.9;
    if (this.slickAcc < 1) return;
    this.slickAcc -= 1;
    const dx = Math.round(this.windX);
    const dz = Math.round(this.windZ);
    if (!dx && !dz) return;
    const list: number[] = [];
    for (let i = 0; i < this.N; i++) if (mat[i] === M.Slick) list.push(i);
    const W = this.W;
    const proj = (i: number) => (i % W) * this.windX + Math.floor(i / W) * this.windZ;
    list.sort((a, b) => proj(b) - proj(a) || a - b);
    for (const i of list) {
      if (foam[i] > 0.25) continue;
      const x = (i % W) + dx;
      const z = Math.floor(i / W) + dz;
      if (x < 0 || z < 0 || x >= W || z >= this.H) continue;
      const j = z * W + x;
      if (mat[j] !== M.Water) continue;
      mat[j] = M.Slick;
      fuel0[j] = fuel0[i];
      fuel[j] = fuel[i];
      fire[j] = fire[i];
      heat[j] = heat[i];
      wet[j] = wet[i];
      foam[j] = foam[i];
      flareCd[j] = flareCd[i];
      mat[i] = M.Water;
      fuel0[i] = fuel[i] = fire[i] = heat[i] = wet[i] = foam[i] = flareCd[i] = 0;
    }
  }

  /** The museum: a running sprinkler zone soaks every cell in it and weakens the flames (not on fuel). */
  private updateSprinklers(dt: number) {
    const { fire, wet, heat, W } = this;
    for (const z of this.sprinklers) {
      if (z.t <= 0) continue;
      z.t = Math.max(0, z.t - dt);
      for (let cz = z.z0; cz <= z.z1; cz++)
        for (let cx = z.x0; cx <= z.x1; cx++) {
          const i = cz * W + cx;
          if (MATS[this.mat[i]].flam <= 0) continue;
          wet[i] = Math.min(1, wet[i] + SPRINKLER_WET * dt);
          heat[i] *= 1 - Math.min(1, 1.5 * dt);
          if (fire[i] > 0 && !MATS[this.mat[i]].oil) {
            fire[i] -= SPRINKLER_DOUSE * dt;
            if (fire[i] <= 0) this.extinguish(i, false);
          }
        }
    }
  }

  /** A sprinkler zone that is on, or still waiting for its lever, with fire in it. */
  sprinklerFor(lever: number): { t: number; burning: number } | null {
    const z = this.sprinklers.find((s) => s.lever === lever);
    if (!z) return null;
    let n = 0;
    for (let cz = z.z0; cz <= z.z1; cz++) for (let cx = z.x0; cx <= z.x1; cx++) if (this.fire[cz * this.W + cx] > 0.05) n++;
    return { t: z.t, burning: n };
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
    if (this.time > 1 && this.burning === 0 && this.embers.length === 0 && this.rocketsPending === 0 && !(this.leak && this.leak.state === 0)) this.finish(true, 'win');
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
      powerups: this.powerPicked,
    };
    this.emit(win ? 'win' : 'lose', this.player.x, this.player.z);
  }

  // =====================================================================================================
  // v2 systems
  // =====================================================================================================

  /** Walkable cells reachable on foot from the truck (the map as drawn: trains and fire aside). Sorted. */
  reachableCells(): number[] {
    if (this.reachable) return this.reachable;
    const truck = this.ents.find((e) => e.type === 'truck')!;
    const a = this.anchorPoint(truck.id);
    const start = this.cellAt(a.x, a.z);
    const out: number[] = [];
    const seen = this.bfsSeen;
    seen.fill(0);
    const q = this.bfsQ;
    let qh = 0;
    let qt = 0;
    if (start >= 0) {
      q[qt++] = start;
      seen[start] = 1;
    }
    const W = this.W;
    while (qh < qt) {
      const c = q[qh++];
      out.push(c);
      const x = c % W;
      const z = (c - x) / W;
      const nb = [x > 0 ? c - 1 : -1, x < W - 1 ? c + 1 : -1, z > 0 ? c - W : -1, z < this.H - 1 ? c + W : -1];
      for (const n of nb) {
        if (n < 0 || seen[n] || !this.walk[n]) continue;
        seen[n] = 1;
        q[qt++] = n;
      }
    }
    out.sort((x, y) => x - y);
    this.reachable = out;
    return out;
  }

  /** A cell can be reached with the hose: close enough to the truck or to a hydrant (base hose, no upgrades). */
  private hoseReach(c: number, extra = 0): boolean {
    const x = (c % this.W) + 0.5;
    const z = Math.floor(c / this.W) + 0.5;
    for (const id of this.anchors) {
      const a = this.anchorPoint(id);
      if (Math.hypot(a.x - x, a.z - z) <= this.def.hose + extra) return true;
    }
    return false;
  }

  private distTruck(c: number): number {
    const truck = this.ents.find((e) => e.type === 'truck')!;
    const a = this.anchorPoint(truck.id);
    return Math.hypot((c % this.W) + 0.5 - a.x, Math.floor(c / this.W) + 0.5 - a.z);
  }

  // ---------- power-ups ----------
  /** The schedule of power-ups: times, kinds and spots are fixed by the level (and the day's seed in the daily). */
  private planPowerups(opts: SimOptions) {
    const kinds = this.def.powerups ?? [];
    if (!kinds.length) return;
    const W = this.W;
    const cands = this.reachableCells().filter((c) => {
      if (this.owner[c] >= 0 || this.mat[c] === M.Rail || this.distTruck(c) < 3 || !this.hoseReach(c, -1)) return false;
      const x = c % W;
      const z = Math.floor(c / W);
      // not on the edge of the map (under the HUD, behind the trees)
      if (x < 2 || z < 2 || x > W - 3 || z > this.H - 3) return false;
      let n = 0;
      for (let zz = z - 2; zz <= z + 2; zz++)
        for (let xx = x - 2; xx <= x + 2; xx++) {
          if (xx < 0 || zz < 0 || xx >= W || zz >= this.H) continue;
          const j = zz * W + xx;
          if (MATS[this.mat[j]].flam > 0 && this.value[j] > 0) n++;
        }
      return n >= 3;
    });
    if (!cands.length) return;
    const r = this.prng;
    const until = this.def.time + (opts.timeDelta ?? 0) + 60;
    let t = 12 + r.next() * 6;
    let first = this.def.powerFirst && kinds.includes(this.def.powerFirst) ? this.def.powerFirst : undefined;
    const bag: PowerKind[] = [];
    while (t < until && this.powerPlan.length < 14) {
      let kind: PowerKind;
      if (first) {
        kind = first;
        first = undefined;
      } else {
        if (!bag.length) {
          const b = [...kinds];
          for (let i = b.length - 1; i > 0; i--) {
            const j = Math.floor(r.next() * (i + 1));
            [b[i], b[j]] = [b[j], b[i]];
          }
          bag.push(...b);
        }
        kind = bag.pop()!;
      }
      const cell = cands[Math.floor(r.next() * cands.length)];
      this.powerPlan.push({ t, kind, cell });
      t += 22 + r.next() * 8;
    }
  }

  private updatePowerups(dt: number) {
    const b = this.buffs;
    for (const k of ['turbo', 'boots', 'suit'] as const) {
      if (b[k] > 0) {
        b[k] -= dt;
        if (b[k] <= 0) {
          b[k] = 0;
          this.emit('buffEnd', this.player.x, this.player.z, 0, undefined, k);
        }
      }
    }
    const pw = this.powerup;
    if (pw) {
      pw.t -= dt;
      if (pw.t <= 0) {
        this.powerup = null;
        this.emit('powerGone', pw.x, pw.z, 0, undefined, pw.kind);
      }
    }
    const next = this.powerPlan[this.powerIdx];
    if (!this.powerup && next && this.time >= next.t) {
      this.powerIdx++;
      const x = (next.cell % this.W) + 0.5;
      const z = Math.floor(next.cell / this.W) + 0.5;
      this.powerup = { kind: next.kind, x, z, t: POWER_LIFE };
      this.emit('powerSpawn', x, z, 0, undefined, next.kind);
    } else if (next && this.time > next.t + POWER_LIFE) this.powerIdx++; // still one on the ground: this one is skipped
  }

  private pickPower(pw: PowerUp) {
    this.powerup = null;
    this.powerPicked++;
    const p = this.player;
    switch (pw.kind) {
      case 'turbo':
        this.buffs.turbo = BUFF_TIME.turbo;
        break;
      case 'boots':
        this.buffs.boots = BUFF_TIME.boots;
        break;
      case 'suit':
        this.buffs.suit = BUFF_TIME.suit;
        p.heat = 0;
        break;
      case 'clock':
        this.timeLeft += CLOCK_SECS;
        break;
      case 'heli':
        this.heliCharges++;
        break;
      case 'extinguisher':
        // kept for later: the player chooses where to use it (it used to go off where it was picked up, usually
        // somewhere with nothing burning)
        this.extLeft = Math.min(EXT_MAX, this.extLeft + EXT_TIME);
        break;
    }
    this.emit('powerup', pw.x, pw.z, this.powerPicked, undefined, pw.kind);
  }

  // ---------- the Pulaski ----------
  /** A cell that can be dug: vegetation on the ground, not burning, with nothing on it. */
  canDigCell(c: number): boolean {
    return c >= 0 && DIG_MATS.has(this.mat[c]) && this.fire[c] <= 0 && this.owner[c] < 0;
  }

  /** Where the Pulaski digs now: the cell in front (aim direction), else the one underfoot. */
  digTarget(): number {
    const p = this.player;
    const front = this.cellAt(p.x + p.aimX * 0.9, p.z + p.aimZ * 0.9);
    if (this.canDigCell(front)) return front;
    const here = this.cellAt(p.x, p.z);
    return this.canDigCell(here) ? here : -1;
  }

  private updateDig(inp: SimInput, dt: number) {
    const p = this.player;
    this.digging = false;
    const target = inp.dig && p.stun <= 0 && p.carry < 0 && !this.extOn ? this.digTarget() : -1;
    if (target < 0) {
      this.digCell = -1;
      this.digT = 0;
      return;
    }
    this.digging = true;
    if (target !== this.digCell) {
      this.digCell = target;
      this.digT = 0;
    }
    this.digT += dt;
    if (this.digT >= DIG_TIME) {
      this.mat[target] = M.Dirt;
      this.heat[target] = 0;
      this.dug++;
      this.emit('dug', (target % this.W) + 0.5, Math.floor(target / this.W) + 0.5, this.dug, target);
      this.digCell = -1;
      this.digT = 0;
    }
  }

  // ---------- portable extinguisher ----------
  /** Turns the extinguisher on while the input asks for it and it has powder; the first use drops the hose. */
  private updateExtMode(inp: SimInput) {
    const p = this.player;
    const want = !!inp.ext && this.extLeft > 0 && p.carry < 0;
    if (want && !this.extOn) {
      this.extOn = true;
      if (!this.hoseDrop) {
        this.hoseDrop = { x: p.x, z: p.z };
        this.hosePickT = 0;
        this.needHoseWarned = false;
        this.emit('hoseDrop', p.x, p.z);
      }
    } else if (!want && this.extOn) this.extOn = false;
  }

  private pickHose(p: Player) {
    this.hoseDrop = null;
    this.hosePickT = 0;
    this.needHoseWarned = false;
    this.emit('hosePick', p.x, p.z);
  }

  // ---------- helicopter ----------
  heliReady(): boolean {
    return this.heliCharges > 0 && this.helis.length === 0 && this.state === 'play';
  }

  /** Where the helicopter would drop now: the fire in the aim direction, else the nearest one, else in front. */
  heliTarget(): { x: number; z: number } {
    const p = this.player;
    let t: { x: number; z: number } | null = this.findAimTarget(p.aimX, p.aimZ, 13, Math.cos((38 * Math.PI) / 180));
    if (!t) {
      let bd = 16;
      for (let i = 0; i < this.N; i++) {
        if (this.fire[i] <= 0.02) continue;
        const x = (i % this.W) + 0.5;
        const z = Math.floor(i / this.W) + 0.5;
        const d = Math.hypot(x - p.x, z - p.z);
        if (d < bd) {
          bd = d;
          t = { x, z };
        }
      }
    }
    if (!t) return { x: Math.min(this.W - 1, Math.max(1, p.x + p.aimX * 6)), z: Math.min(this.H - 1, Math.max(1, p.z + p.aimZ * 6)) };
    // centre of the flames around it
    let sx = 0;
    let sz = 0;
    let sw = 0;
    const cx = Math.floor(t.x);
    const cz = Math.floor(t.z);
    for (let z = cz - 3; z <= cz + 3; z++)
      for (let x = cx - 3; x <= cx + 3; x++) {
        if (x < 0 || z < 0 || x >= this.W || z >= this.H) continue;
        const f = this.fire[z * this.W + x];
        if (f <= 0 || Math.hypot(x - cx, z - cz) > 3) continue;
        sx += (x + 0.5) * f;
        sz += (z + 0.5) * f;
        sw += f;
      }
    return sw > 0 ? { x: sx / sw, z: sz / sw } : t;
  }

  /** Seconds standing next to an anchor to hook up to it: a frozen hydrant at the ski lodge takes longer (once). */
  connectTime(id: number): number {
    return this.isFrozen(id) ? FROZEN_CONNECT_TIME : CONNECT_TIME;
  }
  /** A hydrant at the ski lodge nobody has chipped free of ice yet. */
  isFrozen(id: number): boolean {
    const e = this.ents[id];
    return this.def.theme === 'nieve' && e.type === 'hydrant' && e.state === 0;
  }

  /** Calls the helicopter (uses a charge). Returns false if none is ready. */
  callHeli(): boolean {
    if (!this.heliReady()) return false;
    const t = this.heliTarget();
    this.heliCharges--;
    if (this.def.heliEvery) this.heliCd = this.def.heliEvery + HELI_DELAY;
    this.helis.push({ x: t.x, z: t.z, t: HELI_DELAY });
    this.emit('heliCall', t.x, t.z);
    return true;
  }

  private updateHelis(dt: number) {
    let w = 0;
    for (const h of this.helis) {
      h.t -= dt;
      if (h.t > 0) {
        this.helis[w++] = h;
        continue;
      }
      const cx = Math.floor(h.x);
      const cz = Math.floor(h.z);
      for (let z = cz - 5; z <= cz + 5; z++)
        for (let x = cx - 5; x <= cx + 5; x++) {
          if (x < 0 || z < 0 || x >= this.W || z >= this.H) continue;
          const i = z * this.W + x;
          const d = Math.hypot(x + 0.5 - h.x, z + 0.5 - h.z);
          if (d > 4.6) continue;
          if (d <= HELI_R) {
            if (this.fire[i] > 0) this.extinguish(i, true);
            this.heat[i] = 0;
          }
          this.wet[i] = Math.max(this.wet[i], Math.min(1, 1.15 - d / 4.6));
        }
      for (const e of this.ents) {
        if (Math.hypot(e.cx - h.x, e.cz - h.z) > HELI_R + 0.5) continue;
        if (e.type === 'cylinder' && e.state === 0) e.t = Math.max(0, e.t - 0.6);
        if (e.type === 'leak' && e.state === 0) this.coolLeak(e, 0.8);
      }
      this.emit('heliDrop', h.x, h.z);
    }
    this.helis.length = w;
  }

  // ---------- events ----------
  private planEvents() {
    for (const ev of this.def.events ?? []) {
      if (ev.kind === 'blackout' && !isNight(this.def)) continue;
      if (ev.kind === 'leak') {
        if (this.leak) continue;
        const e = this.makeLeak();
        if (!e) continue;
      }
      if (ev.kind === 'onlookers' && !this.onlookers.length) {
        for (let k = 0; k < 2; k++) this.onlookers.push(this.addEnt('onlooker', 0, 0));
      }
      if (ev.kind === 'neighbors' && !this.neighbors.length) {
        for (let k = 0; k < 3; k++) this.neighbors.push(this.addEnt('neighbor', 0, 0));
      }
      this.eventPlan.push({ kind: ev.kind, t: ev.t, ctl: 1, st: 0 });
    }
    this.eventPlan.sort((a, b) => a.t - b.t);
    // the first one also starts at a third of the fire under control, the second at two thirds
    this.eventPlan.forEach((ev, k) => (ev.ctl = k === 0 ? 0.33 : 0.66));
  }

  private addEnt(type: Ent['type'], x: number, z: number): Ent {
    const e = newEnt(this.ents.length, type, x, z, 1, 1, 0, this.W);
    e.cells = [];
    e.state = 3;
    this.ents.push(e);
    return e;
  }

  /** The gas leak: a pipe on the ground next to a building, somewhere the hose reaches from the truck. */
  private makeLeak(): Ent | null {
    const W = this.W;
    const cands = this.reachableCells().filter((c) => {
      if (this.owner[c] >= 0 || this.mat[c] === M.Rail || this.distTruck(c) < 4 || this.distTruck(c) > this.def.hose + 1) return false;
      const x = c % W;
      const z = Math.floor(c / W);
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const xx = x + dx;
        const zz = z + dz;
        if (xx < 0 || zz < 0 || xx >= W || zz >= this.H) continue;
        const j = zz * W + xx;
        const o = this.owner[j];
        if (o >= 0 && !this.walk[j] && MATS[this.mat[j]].flam > 0 && ['house', 'warehouse', 'shop', 'stall', 'churros', 'barn', 'cabin', 'container', 'tower', 'chiringuito'].includes(this.ents[o].type)) return true;
      }
      return false;
    });
    if (!cands.length) return null;
    const c = cands[Math.floor(this.prng.next() * cands.length)];
    const e = newEnt(this.ents.length, 'leak', c % W, Math.floor(c / W), 1, 1, 0.5, W);
    e.state = 3;
    e.t = 0.3;
    this.ents.push(e);
    this.owner[c] = e.id;
    this.totalValue += 8;
    this.leak = e;
    return e;
  }

  private coolLeak(e: Ent, k: number) {
    e.t -= k;
    if (e.t <= 0) {
      e.t = 0;
      e.alert = 0;
      e.state = 2;
      this.emit('leakFixed', e.cx, e.cz, 0, e.id);
    }
  }

  private updateEvents(dt: number) {
    for (const ev of this.eventPlan) {
      if (ev.st === 0 && (this.time >= ev.t - EVENT_WARN || (this.time >= EVENT_MIN_T && this.time >= this.evLast + 12 && this.control >= ev.ctl))) {
        ev.st = 1;
        ev.t = Math.min(ev.t, this.time + EVENT_WARN);
        this.evLast = ev.t;
        this.emit('eventWarn', this.player.x, this.player.z, EVENT_WARN, undefined, ev.kind);
      }
      if (ev.st === 1 && this.time >= ev.t) {
        ev.st = 2;
        this.startEvent(ev.kind);
        const pos = ev.kind === 'leak' && this.leak ? this.leak : null;
        this.emit('eventStart', pos ? pos.cx : this.player.x, pos ? pos.cz : this.player.z, 0, pos?.id, ev.kind);
      }
    }
    const T = this.evT;
    for (const k of ['neighbors', 'rain', 'gust', 'pressure', 'blackout'] as const) {
      if (T[k] <= 0) continue;
      T[k] -= dt;
      if (T[k] <= 0) {
        T[k] = 0;
        this.endEvent(k);
      }
    }
    // the gas leak builds up pressure until it is closed with water (or blows up)
    const lk = this.leak;
    if (lk && lk.state === 0) {
      lk.t += dt * 0.05;
      lk.alert = Math.min(1, lk.t);
      if (lk.t >= 1) {
        this.explode(lk);
        this.emit('eventEnd', lk.cx, lk.cz, 0, lk.id, 'leak');
      }
    }
    for (const e of this.onlookers) if (e.state === 0) this.moveOnlooker(e, dt);
    if (T.neighbors > 0) for (const e of this.neighbors) if (e.state === 0) this.neighborThrow(e, dt);
  }

  private startEvent(k: EventKind) {
    const T = this.evT;
    switch (k) {
      case 'rain':
      case 'pressure':
      case 'blackout':
        T[k] = EVENT_TIME[k];
        break;
      case 'gust': {
        T.gust = EVENT_TIME.gust;
        this.gustBase = { angle: this.windAngle, strength: this.windStrength };
        const turn = (this.prng.next() < 0.5 ? -1 : 1) * (40 + this.prng.next() * 50);
        this.setWind(this.windAngle + turn, Math.min(0.95, this.windStrength + 0.45));
        this.emit('windShift', 0, 0, this.windAngle);
        break;
      }
      case 'leak':
        if (this.leak && this.leak.state === 3) {
          this.leak.state = 0;
          this.leak.t = 0.3;
        }
        break;
      case 'onlookers':
        this.placeOnlookers();
        break;
      case 'neighbors':
        T.neighbors = EVENT_TIME.neighbors;
        this.placeNeighbors();
        break;
    }
  }

  private endEvent(k: EventKind) {
    if (k === 'gust' && this.gustBase) {
      this.setWind(this.gustBase.angle, this.gustBase.strength);
      this.gustBase = null;
      this.emit('windShift', 0, 0, this.windAngle);
    }
    if (k === 'neighbors') for (const e of this.neighbors) if (e.state === 0) e.state = 1;
    this.emit('eventEnd', this.player.x, this.player.z, 0, undefined, k);
  }

  private burningCells(): number[] {
    const out: number[] = [];
    for (let i = 0; i < this.N; i++) if (this.fire[i] > 0.05) out.push(i);
    return out;
  }

  private nearestFire(x: number, z: number, max: number, list?: number[]): { i: number; d: number } | null {
    let best: { i: number; d: number } | null = null;
    for (const i of list ?? this.burningCells()) {
      const d = Math.hypot((i % this.W) + 0.5 - x, Math.floor(i / this.W) + 0.5 - z);
      if (d <= max && (!best || d < best.d)) best = { i, d };
    }
    return best;
  }

  /** Two curious passers-by walk in from a safe spot and head for the fire. */
  private placeOnlookers() {
    const burn = this.burningCells();
    const cands = this.reachableCells().filter((c) => {
      if (this.owner[c] >= 0 || this.mat[c] === M.Rail) return false;
      const nf = this.nearestFire((c % this.W) + 0.5, Math.floor(c / this.W) + 0.5, 99, burn);
      return !!nf && nf.d >= 7 && nf.d <= 13;
    });
    this.onlookers.forEach((e, k) => {
      if (!cands.length) return;
      const c = cands[Math.floor(this.prng.next() * cands.length)];
      e.x = c % this.W;
      e.z = Math.floor(c / this.W);
      e.cx = e.x + 0.5 + (k ? 0.3 : -0.3);
      e.cz = e.z + 0.5;
      e.state = 0;
      e.t = 0;
      e.soakCd = 0;
      this.rescuees.push(e);
      this.soakables.push(e);
    });
  }

  private onlookerGoal = new Map<number, number>();
  private moveOnlooker(e: Ent, dt: number) {
    // re-aim at the nearest flames twice a second
    e.prog -= dt;
    if (e.prog <= 0) {
      e.prog = 0.5;
      const nf = this.nearestFire(e.cx, e.cz, 40);
      this.onlookerGoal.set(e.id, nf && nf.d > 3.2 ? nf.i : -1);
    }
    const goal = this.onlookerGoal.get(e.id) ?? -1;
    if (goal < 0 || this.fire[goal] <= 0) return;
    const tx = (goal % this.W) + 0.5;
    const tz = Math.floor(goal / this.W) + 0.5;
    const l = Math.hypot(tx - e.cx, tz - e.cz) || 1;
    if (l <= 3.2) return;
    const sp = 0.85 * dt;
    const nx = e.cx + ((tx - e.cx) / l) * sp;
    const nz = e.cz + ((tz - e.cz) / l) * sp;
    const ok = (x: number, z: number) => {
      const c = this.cellAt(x, z);
      return c >= 0 && this.walk[c] && !this.trainCells[c] && this.fire[c] <= 0;
    };
    if (ok(nx, nz)) {
      e.cx = nx;
      e.cz = nz;
    } else if (ok(nx, e.cz)) e.cx = nx;
    else if (ok(e.cx, nz)) e.cz = nz;
    e.x = Math.floor(e.cx);
    e.z = Math.floor(e.cz);
  }

  /** Three neighbours with buckets take a spot 2-4 m from the fire, near the biggest blaze. */
  private placeNeighbors() {
    const burn = this.burningCells();
    if (!burn.length) return;
    const W = this.W;
    const scored: { c: number; s: number }[] = [];
    for (const c of this.reachableCells()) {
      if (this.owner[c] >= 0 || this.fire[c] > 0 || this.mat[c] === M.Rail) continue;
      const x = (c % W) + 0.5;
      const z = Math.floor(c / W) + 0.5;
      let near = 0;
      let dmin = 99;
      for (const i of burn) {
        const d = Math.hypot((i % W) + 0.5 - x, Math.floor(i / W) + 0.5 - z);
        if (d < dmin) dmin = d;
        if (d < 5) near++;
      }
      if (dmin >= 2.2 && dmin <= 4) scored.push({ c, s: near });
    }
    scored.sort((a, b) => b.s - a.s || a.c - b.c);
    const picked: number[] = [];
    for (const { c } of scored) {
      if (picked.length >= this.neighbors.length) break;
      if (picked.some((o) => Math.hypot((o % W) - (c % W), Math.floor(o / W) - Math.floor(c / W)) < 3)) continue;
      picked.push(c);
    }
    this.neighbors.forEach((e, k) => {
      const c = picked[k];
      if (c === undefined) return;
      e.x = c % W;
      e.z = Math.floor(c / W);
      e.cx = e.x + 0.5;
      e.cz = e.z + 0.5;
      e.state = 0;
      e.t = 0.4 + k * 0.4;
    });
  }

  private neighborThrow(e: Ent, dt: number) {
    e.t -= dt;
    if (e.t > 0) return;
    e.t = 1.3;
    const nf = this.nearestFire(e.cx, e.cz, 4.5);
    if (!nf) return;
    const o = this.owner[nf.i];
    if (o >= 0 && this.ents[o].type === 'elec' && this.ents[o].state === 1) return;
    const x = (nf.i % this.W) + 0.5;
    const z = Math.floor(nf.i / this.W) + 0.5;
    e.alert = Math.atan2(z - e.cz, x - e.cx); // facing, for the view
    this.hit(nf.i, { x, y: 0, z, vx: 0, vy: 0, vz: 0, pow: 1.3, kind: 0, own: 1 });
    this.emit('bucket', x, z, nf.i, e.id);
  }

  // ---------- rail yard ----------
  private updateTrains(dt: number) {
    const W = this.W;
    for (const tr of this.trains) {
      if (tr.st === 0 && this.time >= tr.next - 3) {
        tr.st = 1;
        this.emit('trainWarn', tr.dir > 0 ? 0.5 : W - 0.5, tr.z + 1, tr.dir);
      } else if (tr.st === 1 && this.time >= tr.next) {
        tr.st = 2;
        tr.head = tr.dir > 0 ? 0 : W;
      } else if (tr.st === 2) {
        tr.head += tr.dir * tr.speed * dt;
        if (tr.dir > 0 ? tr.head - tr.len > W : tr.head + tr.len < 0) {
          tr.st = 0;
          tr.next += tr.every;
        }
      }
      for (let r = tr.z; r <= tr.z + 1; r++) {
        if (r < 0 || r >= this.H) continue;
        const row = r * W;
        for (let x = 0; x < W; x++) {
          this.trainCells[row + x] = 0;
          this.trainDanger[row + x] = tr.st > 0 ? 1 : 0;
        }
        if (tr.st === 2) {
          const x0 = tr.dir > 0 ? tr.head - tr.len : tr.head;
          for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(W - 1, Math.floor(x0 + tr.len)); x++) this.trainCells[row + x] = 1;
        }
      }
    }
    // nobody stays on the tracks in front of a train: it pushes them off
    for (const f of this.partner ? [this.player, this.partner] : [this.player]) {
      const c = this.cellAt(f.x, f.z);
      if (c < 0 || !this.trainCells[c]) continue;
      const tr = this.trains.find((t) => Math.floor(f.z) >= t.z && Math.floor(f.z) <= t.z + 1);
      if (!tr) continue;
      const up = tr.z - 0.45;
      const down = tr.z + 2.45;
      const free = (z: number) => !this.isBlocked(f.x, z);
      const toUp = Math.abs(f.z - up) <= Math.abs(f.z - down);
      const nz = toUp ? (free(up) ? up : down) : free(down) ? down : up;
      f.z = nz;
      f.kz = nz < tr.z ? -5 : 5;
      f.vz = 0;
      if (f === this.player) {
        f.stun = Math.max(f.stun, 0.9);
        this.emit('trainHit', f.x, f.z);
      }
    }
    // a hose lying across the tracks is cut by the train
    const p = this.player;
    if (p.cut <= 0 && this.trains.some((t) => t.st === 2)) {
      const a = this.anchorPoint(p.anchor);
      // the hose ends in the firefighter's hands, or where it was dropped
      const ex = this.hoseDrop ? this.hoseDrop.x : p.x;
      const ez = this.hoseDrop ? this.hoseDrop.z : p.z;
      const d = Math.hypot(ex - a.x, ez - a.z);
      const n = Math.ceil(d / 0.35);
      for (let k = 1; k < n; k++) {
        const c = this.cellAt(a.x + ((ex - a.x) * k) / n, a.z + ((ez - a.z) * k) / n);
        if (c >= 0 && this.trainCells[c]) {
          p.cut = HOSE_SPLICE;
          if (!this.extOn) p.spraying = false;
          this.emit('hoseCut', a.x + ((ex - a.x) * k) / n, a.z + ((ez - a.z) * k) / n);
          break;
        }
      }
    }
  }

  /** True while a train is coming or passing on the track at this row. */
  trackBusy(z: number): boolean {
    return this.trains.some((t) => t.st > 0 && z >= t.z && z <= t.z + 1);
  }

  // ---------- crew ----------
  private addCrew(opts: SimOptions, a: { x: number; z: number }) {
    const c = opts.crew ?? {};
    const lv = (id: CrewId) => Math.max(0, Math.min(3, Math.floor(c[id] ?? 0)));
    const truck = this.ents.find((e) => e.type === 'truck')!;
    if (lv('partner')) {
      const L = lv('partner') - 1;
      // starts next to the player, on the other side if possible
      let sx = a.x;
      let sz = a.z;
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        if (!this.isBlocked(a.x + dx, a.z + dz)) {
          sx = a.x + dx;
          sz = a.z + dz;
          break;
        }
      }
      this.partner = this.newFighter(sx, sz, truck.id, Math.max(8, this.def.hose + CREW_STATS.partner.hose[L]), CREW_STATS.partner.pow[L]);
      this.partner.face = this.player.face;
      this.partnerBot = new Bot(this, SKILL_PARTNER, this.partner, 'partner');
    }
    if (lv('dog')) this.dog = { x: a.x - 0.6, z: a.z + 0.4, face: 0, target: -1, path: [], repath: 0, speed: CREW_STATS.dog.speed[lv('dog') - 1], moving: false };
    if (lv('drone')) this.drone = { x: a.x, z: a.z, tx: a.x, tz: a.z, t: CREW_STATS.drone.every[lv('drone') - 1] * 0.6, every: CREW_STATS.drone.every[lv('drone') - 1] };
  }

  /** BFS over walkable cells (no fire, no train) to the nearest cell satisfying `ok`; path excludes the start. */
  private walkPath(from: number, ok: (c: number) => boolean, maxLen = 4000): number[] {
    const W = this.W;
    const seen = this.bfsSeen;
    const prev = this.bfsPrev;
    const q = this.bfsQ;
    seen.fill(0);
    let qh = 0;
    let qt = 0;
    q[qt++] = from;
    seen[from] = 1;
    prev[from] = -1;
    while (qh < qt && qt < maxLen) {
      const c = q[qh++];
      if (ok(c)) {
        const path: number[] = [];
        let k = c;
        while (k !== from && k >= 0) {
          path.push(k);
          k = prev[k];
        }
        return path.reverse();
      }
      const x = c % W;
      const z = (c - x) / W;
      const nb = [x > 0 ? c - 1 : -1, x < W - 1 ? c + 1 : -1, z > 0 ? c - W : -1, z < this.H - 1 ? c + W : -1];
      for (const n of nb) {
        if (n < 0 || seen[n] || !this.walk[n] || this.trainDanger[n] || this.fire[n] > 0.35) continue;
        seen[n] = 1;
        prev[n] = c;
        q[qt++] = n;
      }
    }
    return [];
  }

  /** Sparky runs to the animal or person in most danger and gets them out; otherwise follows the player. */
  private updateDog(dt: number) {
    const d = this.dog!;
    if (d.target >= 0 && this.ents[d.target].state !== 0) d.target = -1;
    d.repath -= dt;
    const W = this.W;
    if (d.repath <= 0) {
      d.repath = 0.4;
      let best = -1;
      let bs = -1e9;
      for (const e of this.rescuees) {
        // (people at windows wait for the platform, and paintings are not for a dog to carry)
        if (e.state !== 0 || e.type === 'window' || e.type === 'art') continue;
        const danger = e.alert + e.t;
        if (danger < 0.2) continue;
        const s = danger * 4 - Math.hypot(e.cx - d.x, e.cz - d.z) * 0.1;
        if (s > bs) {
          bs = s;
          best = e.id;
        }
      }
      d.target = best;
      const from = this.cellAt(d.x, d.z);
      if (from >= 0) {
        if (best >= 0) {
          const e = this.ents[best];
          d.path = this.walkPath(from, (c) => Math.hypot((c % W) + 0.5 - e.cx, Math.floor(c / W) + 0.5 - e.cz) <= 1.0);
        } else {
          const p = this.player;
          const dd = Math.hypot(p.x - d.x, p.z - d.z);
          d.path = dd > 2.5 ? this.walkPath(from, (c) => Math.hypot((c % W) + 0.5 - p.x, Math.floor(c / W) + 0.5 - p.z) <= 1.6) : [];
        }
      }
    }
    // follow the path
    d.moving = false;
    while (d.path.length) {
      const c = d.path[0];
      const x = (c % W) + 0.5;
      const z = Math.floor(c / W) + 0.5;
      const dd = Math.hypot(x - d.x, z - d.z);
      if (dd < 0.2) {
        d.path.shift();
        continue;
      }
      const step = Math.min(dd, d.speed * dt);
      d.x += ((x - d.x) / dd) * step;
      d.z += ((z - d.z) / dd) * step;
      d.face = Math.atan2(z - d.z, x - d.x);
      d.moving = true;
      break;
    }
    if (d.target >= 0) {
      const e = this.ents[d.target];
      if (Math.hypot(e.cx - d.x, e.cz - d.z) < 1.1) {
        this.rescue(e, 'dog');
        d.target = -1;
        d.repath = 0;
      }
    }
  }

  /** The drone waters the spot closest to catching fire near the player, every few seconds. */
  private updateDrone(dt: number) {
    const dr = this.drone!;
    const p = this.player;
    dr.t -= dt;
    const k = 1 - Math.exp(-2.5 * dt);
    if (dr.t < dr.every - 1.2) {
      dr.tx = p.x - 0.8;
      dr.tz = p.z + 0.8;
    }
    dr.x += (dr.tx - dr.x) * k;
    dr.z += (dr.tz - dr.z) * k;
    if (dr.t > 0) return;
    dr.t = dr.every;
    const W = this.W;
    let best = -1;
    let bs = 0.25;
    const cx = Math.floor(p.x);
    const cz = Math.floor(p.z);
    for (let z = cz - 12; z <= cz + 12; z++)
      for (let x = cx - 12; x <= cx + 12; x++) {
        if (x < 0 || z < 0 || x >= W || z >= this.H) continue;
        const i = z * W + x;
        if (this.fire[i] > 0 || this.fuel[i] <= 0.02 || MATS[this.mat[i]].flam <= 0) continue;
        if (this.heat[i] > bs) {
          bs = this.heat[i];
          best = i;
        }
      }
    if (best < 0) {
      let bf = 0.05;
      for (let z = cz - 10; z <= cz + 10; z++)
        for (let x = cx - 10; x <= cx + 10; x++) {
          if (x < 0 || z < 0 || x >= W || z >= this.H) continue;
          const i = z * W + x;
          if (this.fire[i] > bf && !MATS[this.mat[i]].oil) {
            bf = this.fire[i];
            best = i;
          }
        }
    }
    if (best < 0) return;
    const tx = (best % W) + 0.5;
    const tz = Math.floor(best / W) + 0.5;
    const bx = Math.floor(tx);
    const bz = Math.floor(tz);
    for (let z = bz - 2; z <= bz + 2; z++)
      for (let x = bx - 2; x <= bx + 2; x++) {
        if (x < 0 || z < 0 || x >= W || z >= this.H) continue;
        const i = z * W + x;
        const d = Math.hypot(x + 0.5 - tx, z + 0.5 - tz);
        if (d > 1.7) continue;
        this.wet[i] = Math.min(1, this.wet[i] + 0.7 * (1 - d / 1.9));
        this.heat[i] *= 0.15;
        if (this.fire[i] > 0 && !MATS[this.mat[i]].oil) {
          this.fire[i] -= 0.18 * (1 - d / 2);
          if (this.fire[i] <= 0) this.extinguish(i, true);
        }
      }
    dr.tx = tx;
    dr.tz = tz;
    this.emit('droneDrop', tx, tz);
  }
}
