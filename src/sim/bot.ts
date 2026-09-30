import { M, MATS } from './materials';
import { RESCUE_TYPES } from './parse';
import type { SimInput } from './types';
import type { Player, Sim } from './world';

export interface BotSkill {
  think: number; // seconds between decisions
  aimNoise: number; // radians
  speed: number; // 0..1 input magnitude
  smart: boolean; // threat-based targeting vs nearest fire
  usesFog: boolean;
}
export const SKILL_PRO: BotSkill = { think: 0.1, aimNoise: 0.02, speed: 1, smart: true, usesFog: true };
export const SKILL_CASUAL: BotSkill = { think: 0.35, aimNoise: 0.12, speed: 0.85, smart: false, usesFog: false };
/** The partner from the crew: goes for the fire that threatens most, a bit slower and less precise than the PRO. */
export const SKILL_PARTNER: BotSkill = { think: 0.3, aimNoise: 0.08, speed: 0.85, smart: true, usesFog: false };

type Goal =
  | { kind: 'fire'; cell: number }
  | { kind: 'cool'; ent: number }
  | { kind: 'wet'; cell: number }
  | { kind: 'rescue'; ent: number }
  | { kind: 'lever'; ent: number }
  | { kind: 'hydrant'; ent: number }
  // v2
  | { kind: 'anchor'; ent: number } // hook up to an anchor for real (sea pump, reconnecting a cut hose)
  | { kind: 'power' }
  | { kind: 'evade' }
  | { kind: 'fetch'; ent: number } // the museum: pick up an artwork the fire is getting close to
  | { kind: 'exit' } // ...and carry it out through the nearest door
  | { kind: 'hose' } // 2.2: walk back to the hose dropped to use the extinguisher
  | { kind: 'idle' };

/**
 * Plays the game: the difficulty measurements (tools/bot.ts), the attract mode behind the menus, the daily's
 * verification and the partner from the crew (role 'partner': fights fire only, never rescues nor picks things up).
 */
export class Bot {
  private t = 0;
  private goal: Goal = { kind: 'idle' };
  private path: number[] = [];
  private noise = 0;
  private out: SimInput = { mx: 0, mz: 0, ax: 0, az: 0, aimDist: 0, spray: false, nozzle: 0 };
  private prev = new Int32Array(0);
  private seen = new Uint8Array(0);
  private queue = new Int32Array(0);
  private me: Player;
  private hero: boolean;
  /** where to send the helicopter (biggest blaze), when the bot has a charge */
  private heliAim: { x: number; z: number } | null = null;

  constructor(
    private sim: Sim,
    private skill: BotSkill,
    me?: Player,
    role: 'hero' | 'partner' = 'hero',
  ) {
    const n = sim.N;
    this.prev = new Int32Array(n);
    this.seen = new Uint8Array(n);
    this.queue = new Int32Array(n);
    this.me = me ?? sim.player;
    this.hero = role === 'hero';
  }

  update(): SimInput {
    const s = this.sim;
    this.t -= 1 / 60;
    if (this.t <= 0) {
      this.t = this.skill.think;
      this.decide();
      this.noise = (s.rng.next() - 0.5) * 2 * this.skill.aimNoise;
    }
    this.act();
    return this.out;
  }

  private get hoseLen(): number {
    return this.me.hose;
  }
  private get foamLeft(): number {
    return this.hero ? this.sim.foamLeft : 0;
  }

  // ---------- decision ----------
  private reachFromAnchor(x: number, z: number, anchor = this.me.anchor) {
    const a = this.sim.anchorPoint(anchor);
    return Math.hypot(x - a.x, z - a.z);
  }

  /** Hydrant to connect to first so (x,z) comes within `need` of the hose end, or -1 if already fine / impossible. */
  private viaHydrant(x: number, z: number, need: number): number {
    const s = this.sim;
    if (this.reachFromAnchor(x, z) <= this.hoseLen + need) return -1;
    let hb = -1;
    let hd = 1e9;
    for (const id of s.anchors) {
      if (id === this.me.anchor) continue;
      const ap = s.anchorPoint(id);
      if (this.reachFromAnchor(ap.x, ap.z) > this.hoseLen - 0.5) continue;
      const d = Math.hypot(ap.x - x, ap.z - z);
      if (d < hd) {
        hd = d;
        hb = id;
      }
    }
    return hb >= 0 && hd < this.reachFromAnchor(x, z) - 1 ? hb : -2;
  }

  private blacklist = new Map<number, number>();
  private watchCell = -1;
  private watchFire = 0;
  private watchT = 0;

  private decide() {
    const s = this.sim;
    const p = this.me;
    const W = s.W;
    // stuck detection on fire goals
    if (this.goal.kind === 'fire') {
      const c = this.goal.cell;
      if (c !== this.watchCell) {
        this.watchCell = c;
        this.watchFire = s.fire[c];
        this.watchT = s.time;
      } else if (s.time - this.watchT > 3) {
        if (s.fire[c] >= this.watchFire - 0.05 && s.fire[c] > 0) this.blacklist.set(c, s.time + 5);
        this.watchFire = s.fire[c];
        this.watchT = s.time;
      }
    }
    // 0. a train is coming: off the tracks
    if (s.trains.length) {
      const here = s.cellAt(p.x, p.z);
      if (here >= 0 && s.trainDanger[here]) {
        this.goal = { kind: 'evade' };
        return;
      }
    }
    // 0a. the extinguisher put away (or empty) with the hose on the ground: go and pick it up
    if (this.hero && s.hoseDrop && !s.extOn) {
      this.goal = { kind: 'hose' };
      return;
    }
    // 0b. hose cut by a train: hook up again if an anchor is close (the PRO does; the casual waits for the splice)
    if (this.hero && p.cut > 0 && this.skill.smart) {
      let best = -1;
      let bd = 7;
      for (const id of s.anchors) {
        const ap = s.anchorPoint(id);
        const d = Math.hypot(ap.x - p.x, ap.z - p.z);
        if (d < bd && this.reachFromAnchor(ap.x, ap.z) <= this.hoseLen + 0.5) {
          bd = d;
          best = id;
        }
      }
      if (best >= 0) {
        this.goal = { kind: 'anchor', ent: best };
        return;
      }
    }
    // 1. power lever if the box is live
    const elec = this.hero ? s.ents.find((e) => e.type === 'elec' && e.state === 1) : undefined;
    const lever = elec ? s.ents.find((e) => e.type === 'lever' && e.state === 0 && !s.sprinklers.some((z) => z.lever === e.id)) : undefined;
    if (elec && lever && this.reachFromAnchor(lever.cx, lever.cz) < this.hoseLen + 1) {
      this.goal = { kind: 'lever', ent: lever.id };
      return;
    }
    // 1b. the museum: a sprinkler lever whose room is burning (the PRO goes sooner)
    if (this.hero && s.sprinklers.length) {
      let best = null;
      let bd = 1e9;
      for (const z of s.sprinklers) {
        const lv = s.ents[z.lever];
        if (lv.state !== 0) continue;
        const info = s.sprinklerFor(z.lever);
        if (!info || info.burning < (this.skill.smart ? 3 : 7)) continue;
        const d = Math.hypot(lv.cx - p.x, lv.cz - p.z);
        if (d < bd && this.reachFromAnchor(lv.cx, lv.cz) < this.hoseLen + 1) {
          bd = d;
          best = lv;
        }
      }
      if (best) {
        this.goal = { kind: 'lever', ent: best.id };
        return;
      }
    }
    // 2. cylinders under pressure (and a gas leak: always)
    const cylT = this.skill.smart ? 0.3 : 0.6;
    let cyl = null;
    for (const e of s.ents) if (e.type === 'cylinder' && e.state === 0 && e.t > cylT && (!cyl || e.t > cyl.t)) cyl = e;
    if (s.leak && s.leak.state === 0 && (!cyl || s.leak.t + 0.3 > cyl.t)) cyl = s.leak;
    if (cyl) {
      const h = this.viaHydrant(cyl.cx, cyl.cz, 6);
      if (h >= 0) {
        this.goal = { kind: 'hydrant', ent: h };
        return;
      }
      if (h === -1) {
        this.goal = { kind: 'cool', ent: cyl.id };
        return;
      }
    }
    // 2b. the museum: an artwork in hand goes out through the nearest door; one the fire is getting close to, into our hands
    if (this.hero && s.arts.length) {
      if (p.carry >= 0) {
        this.goal = { kind: 'exit' };
        return;
      }
      const artT = this.skill.smart ? 0.3 : 0.45;
      let art = null;
      let ad = 1e9;
      for (const e of s.arts) {
        if (e.state !== 0 || e.alert < artT) continue;
        const d = Math.hypot(e.cx - p.x, e.cz - p.z);
        if (d < ad && this.reachFromAnchor(e.cx, e.cz) <= this.hoseLen + 1) {
          ad = d;
          art = e;
        }
      }
      if (art) {
        this.goal = { kind: 'fetch', ent: art.id };
        return;
      }
    }
    // 3. rescues in danger (or anyone close by)
    if (this.hero) {
      const resT = this.skill.smart ? 0.4 : 0.5;
      let res = null;
      let resD = 1e9;
      let resH = -1;
      for (const e of s.ents) {
        if (!RESCUE_TYPES.has(e.type) || e.state !== 0) continue;
        const d = Math.hypot(e.cx - p.x, e.cz - p.z);
        // people at a window wait for the platform: go when the fire gets near them
        const urgent = e.alert > resT || (d < 4 && e.type !== 'window');
        if (!urgent) continue;
        const h = this.viaHydrant(e.cx, e.cz, 1);
        if (h === -2) continue;
        if (d < resD) {
          resD = d;
          res = e;
          resH = h;
        }
      }
      if (res) {
        this.goal = resH >= 0 ? { kind: 'hydrant', ent: resH } : { kind: 'rescue', ent: res.id };
        return;
      }
      // 4. incoming rockets: pre-wet the landing spot
      for (const r of s.rockets) {
        if (r.t < 2.3 && s.wet[r.cell] < 0.3 && Math.hypot(r.tx - p.x, r.tz - p.z) < 10) {
          this.goal = { kind: 'wet', cell: r.cell };
          return;
        }
      }
      // 4b. out of foam with fuel burning: hook up to the sea pump, which refills it
      if (s.foamMax > 0 && this.foamLeft < 1.5 && s.ents[p.anchor].type !== 'seapump') {
        const pump = s.ents.find((e) => e.type === 'seapump' && this.reachFromAnchor(e.cx, e.cz) <= this.hoseLen - 0.3);
        if (pump) {
          let oil = false;
          for (let i = 0; i < s.N && !oil; i++) if (s.fire[i] > 0 && MATS[s.mat[i]].oil) oil = true;
          if (oil) {
            this.goal = { kind: 'anchor', ent: pump.id };
            return;
          }
        }
      }
      // 4c. a power-up close by
      const pw = s.powerup;
      if (pw) {
        const d = Math.hypot(pw.x - p.x, pw.z - p.z);
        if (d <= (this.skill.smart ? 7 : 3.5) && this.reachFromAnchor(pw.x, pw.z) <= this.hoseLen + 0.4) {
          this.goal = { kind: 'power' };
          return;
        }
      }
      // helicopter ready: send it to the biggest blaze
      this.heliAim = null;
      if (s.heliReady() && s.burning >= (this.skill.smart ? 12 : 20)) this.heliAim = this.biggestBlaze();
    }
    // 5. pick a fire
    let best = -1;
    let bestS = -1e9;
    for (let i = 0; i < s.N; i++) {
      const f = s.fire[i];
      if (f <= 0) continue;
      const bl = this.blacklist.get(i);
      if (bl !== undefined && bl > s.time) continue;
      const x = (i % W) + 0.5;
      const z = Math.floor(i / W) + 0.5;
      const d = Math.hypot(x - p.x, z - p.z);
      let sc: number;
      if (this.skill.smart) {
        const oil = MATS[s.mat[i]].oil;
        if (oil && this.foamLeft <= 0) continue;
        let front = 0;
        for (let k = 1; k <= 3; k++) {
          const j = s.cellAt(x + s.windX * k, z + s.windZ * k);
          if (j >= 0 && s.fire[j] === 0 && s.fuel[j] > 0.1) front += s.value[j] * (1 - s.wet[j]);
        }
        for (const [dx, dz] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const j = s.cellAt(x + dx, z + dz);
          if (j >= 0 && s.fire[j] === 0 && s.fuel[j] > 0.1 && MATS[s.mat[j]].flam > 0) front += s.value[j];
        }
        sc = front * 0.25 + f - d * 0.12;
      } else {
        if (!this.hero && MATS[s.mat[i]].oil) continue;
        sc = -d;
      }
      const ra = this.reachFromAnchor(x, z);
      if (ra > this.hoseLen + 8) {
        // maybe via a hydrant
        sc -= 6;
      }
      if (sc > bestS) {
        bestS = sc;
        best = i;
      }
    }
    if (best < 0) {
      this.goal = { kind: 'idle' };
      return;
    }
    const bx = (best % W) + 0.5;
    const bz = Math.floor(best / W) + 0.5;
    const h = this.viaHydrant(bx, bz, 6);
    if (h >= 0) {
      this.goal = { kind: 'hydrant', ent: h };
      return;
    }
    this.goal = { kind: 'fire', cell: best };
  }

  /** Centre of the burning cell with most fire around it (3 m). */
  /** Burning cells within r of a point, and the nearest one. */
  private fireAround(x: number, z: number, r: number): { n: number; x: number; z: number } {
    const s = this.sim;
    const W = s.W;
    let n = 0;
    let bx = 0;
    let bz = 0;
    let bd = 1e9;
    for (let cz = Math.max(0, Math.floor(z - r)); cz <= Math.min(s.H - 1, Math.floor(z + r)); cz++)
      for (let cx = Math.max(0, Math.floor(x - r)); cx <= Math.min(W - 1, Math.floor(x + r)); cx++) {
        const i = cz * W + cx;
        if (s.fire[i] <= 0.02) continue;
        const d = Math.hypot(cx + 0.5 - x, cz + 0.5 - z);
        if (d > r) continue;
        n++;
        if (d < bd) {
          bd = d;
          bx = cx + 0.5;
          bz = cz + 0.5;
        }
      }
    return { n, x: bx, z: bz };
  }

  private biggestBlaze(): { x: number; z: number } | null {
    const s = this.sim;
    const W = s.W;
    const burn: number[] = [];
    for (let i = 0; i < s.N; i++) if (s.fire[i] > 0.1) burn.push(i);
    let best = -1;
    let bn = 0;
    const step = burn.length > 200 ? 3 : 1;
    for (let a = 0; a < burn.length; a += step) {
      const i = burn[a];
      const x = i % W;
      const z = Math.floor(i / W);
      let n = 0;
      for (const j of burn) {
        const dx = (j % W) - x;
        const dz = Math.floor(j / W) - z;
        if (dx * dx + dz * dz <= 9) n++;
      }
      if (n > bn) {
        bn = n;
        best = i;
      }
    }
    return best < 0 || bn < 6 ? null : { x: (best % W) + 0.5, z: Math.floor(best / W) + 0.5 };
  }

  // ---------- pathing ----------
  /** Line of sight for the water. With `wall`, hitting the target's own building counts: water on any wall of a
   *  building reaches its flames (Sim.hit), so a flame inside a block can be fought from the street. */
  private los(x0: number, z0: number, x1: number, z1: number, targetCell: number, wall = false): boolean {
    const s = this.sim;
    const D = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.ceil(D * 2);
    const own = wall && targetCell >= 0 ? s.owner[targetCell] : -1;
    // height of the jet along its arc (world.ts spray: it leaves the nozzle at 1.05 m and lands on the target), so a
    // low fence or bench right in front of the target stops it too
    const T = D / 13;
    const vy = T > 0 ? (6 * T * T - 1.05) / T : 0;
    for (let k = 1; k < n; k++) {
      const u = k / n;
      const x = x0 + (x1 - x0) * u;
      const z = z0 + (z1 - z0) * u;
      const c = s.cellAt(x, z);
      if (c < 0 || c === targetCell) continue;
      const y = 1.05 + vy * T * u - 6 * T * T * u * u;
      if (s.height[c] > Math.max(0.35, Math.min(1.0, y))) return own >= 0 && s.owner[c] === own && s.ents[own].cells.length > 1;
    }
    return true;
  }

  /** BFS to the nearest walkable cell satisfying `ok`. Returns path of cells (excluding start). */
  private bfs(ok: (c: number) => boolean): number[] {
    const s = this.sim;
    const W = s.W;
    const p = this.me;
    const start = s.cellAt(p.x, p.z);
    if (start < 0) return [];
    const a = s.anchorPoint(p.anchor);
    this.seen.fill(0);
    let qh = 0;
    let qt = 0;
    this.queue[qt++] = start;
    this.seen[start] = 1;
    this.prev[start] = -1;
    while (qh < qt) {
      const c = this.queue[qh++];
      if (ok(c)) {
        const path: number[] = [];
        let k = c;
        while (k !== start && k >= 0) {
          path.push(k);
          k = this.prev[k];
        }
        return path.reverse();
      }
      const x = c % W;
      const z = (c - x) / W;
      const nb = [x > 0 ? c - 1 : -1, x < W - 1 ? c + 1 : -1, z > 0 ? c - W : -1, z < s.H - 1 ? c + W : -1];
      for (const n of nb) {
        if (n < 0 || this.seen[n] || !s.walk[n]) continue;
        if (s.fire[n] > 0.35) continue;
        if (s.trainDanger[n]) continue;
        const nx = (n % W) + 0.5;
        const nz = Math.floor(n / W) + 0.5;
        if (Math.hypot(nx - a.x, nz - a.z) > this.hoseLen + 0.2) continue;
        this.seen[n] = 1;
        this.prev[n] = c;
        this.queue[qt++] = n;
      }
    }
    return [];
  }

  /** Already on the right cell but the line of sight is checked from its centre: step onto the centre. */
  private centred(path: number[]): number[] {
    if (path.length) return path;
    const c = this.sim.cellAt(this.me.x, this.me.z);
    return c >= 0 ? [c] : path;
  }

  private moveAlong(path: number[]) {
    const s = this.sim;
    const p = this.me;
    while (path.length) {
      const c = path[0];
      const x = (c % s.W) + 0.5;
      const z = Math.floor(c / s.W) + 0.5;
      const d = Math.hypot(x - p.x, z - p.z);
      if (d < 0.35 && path.length > 1) {
        path.shift();
        continue;
      }
      let mag = this.skill.speed;
      // on ice a good player lets go early so the slide ends where they want (the casual bot does not)
      if (this.skill.smart) {
        const here = s.cellAt(p.x, p.z);
        if (here >= 0 && s.mat[here] === M.Ice) {
          const last = path[path.length - 1];
          const rem = Math.hypot((last % s.W) + 0.5 - p.x, Math.floor(last / s.W) + 0.5 - p.z);
          mag = Math.min(mag, Math.max(0.2, rem * 0.45));
        }
      }
      this.out.mx = ((x - p.x) / Math.max(d, 0.001)) * mag;
      this.out.mz = ((z - p.z) / Math.max(d, 0.001)) * mag;
      if (d < 0.2) {
        this.out.mx = 0;
        this.out.mz = 0;
      }
      return;
    }
    this.out.mx = 0;
    this.out.mz = 0;
  }

  private sprayAt(x: number, z: number, nozzle: 0 | 1 | 2) {
    const p = this.me;
    const dx = x - p.x;
    const dz = z - p.z;
    const d = Math.hypot(dx, dz) || 1;
    const a = Math.atan2(dz, dx) + this.noise;
    this.out.ax = Math.cos(a);
    this.out.az = Math.sin(a);
    this.out.aimDist = d;
    this.out.spray = true;
    this.out.nozzle = nozzle;
  }

  private act() {
    const s = this.sim;
    const p = this.me;
    const o = this.out;
    o.mx = 0;
    o.mz = 0;
    o.spray = false;
    if (o.heli) o.heli = false;
    const W = s.W;
    const g = this.goal;
    const fogging = this.hero && this.skill.usesFog && p.heat > 0.55;
    // the helicopter: aim at the biggest blaze and call it (this frame only)
    if (this.heliAim && s.heliReady()) {
      const dx = this.heliAim.x - p.x;
      const dz = this.heliAim.z - p.z;
      const d = Math.hypot(dx, dz) || 1;
      o.ax = dx / d;
      o.az = dz / d;
      o.aimDist = d;
      o.heli = true;
      this.heliAim = null;
      return;
    }
    // the portable extinguisher: on a blaze at hand (the PRO sooner), and it keeps going while there are flames in reach
    if (this.hero) {
      o.ext = false;
      if (s.extLeft > 0 && p.carry < 0) {
        const f = this.fireAround(p.x, p.z, 3.2);
        if (f.n > 0 && (s.extOn || f.n >= (this.skill.smart ? 4 : 6))) {
          const dx = f.x - p.x;
          const dz = f.z - p.z;
          const d = Math.hypot(dx, dz) || 1;
          o.ax = dx / d;
          o.az = dz / d;
          o.aimDist = d;
          o.ext = true;
          o.spray = true;
          return;
        }
      }
    }
    const nearAt = (x: number, z: number, r: number) => (c: number) => {
      const cx = (c % W) + 0.5;
      const cz = Math.floor(c / W) + 0.5;
      return Math.hypot(cx - x, cz - z) <= r;
    };
    const standFor = (tx: number, tz: number, cell: number, range: number, wall = false) => (c: number) => {
      const cx = (c % W) + 0.5;
      const cz = Math.floor(c / W) + 0.5;
      const d = Math.hypot(cx - tx, cz - tz);
      return d <= range && d >= 1.2 && this.los(cx, cz, tx, tz, cell, wall);
    };
    switch (g.kind) {
      case 'idle':
        return;
      case 'evade': {
        const start = s.cellAt(p.x, p.z);
        this.moveAlong(this.bfs((c) => c !== start && !s.trainDanger[c]));
        return;
      }
      case 'anchor': {
        const ap = s.anchorPoint(g.ent);
        if (Math.hypot(ap.x - p.x, ap.z - p.z) <= 0.9) return;
        this.moveAlong(this.bfs(nearAt(ap.x, ap.z, 1.05)));
        if (p.cut <= 0) this.opportunistic();
        return;
      }
      case 'fetch': {
        const e = s.ents[g.ent];
        if (e.state !== 0) {
          this.t = 0;
          return;
        }
        this.moveAlong(this.centred(this.bfs(nearAt(e.cx, e.cz, 1.0))));
        this.opportunistic();
        return;
      }
      case 'exit': {
        if (p.carry < 0) {
          this.t = 0;
          return;
        }
        // the nearest door the hose lets us walk to
        this.moveAlong(this.centred(this.bfs((c) => s.exits.some((e) => Math.hypot((c % W) + 0.5 - e.cx, Math.floor(c / W) + 0.5 - e.cz) <= 0.9))));
        return;
      }
      case 'hose': {
        const hd = s.hoseDrop;
        if (!hd) {
          this.t = 0;
          return;
        }
        this.moveAlong(this.bfs(nearAt(hd.x, hd.z, 0.8)));
        return;
      }
      case 'power': {
        const pw = s.powerup;
        if (!pw) {
          this.t = 0;
          return;
        }
        this.moveAlong(this.bfs(nearAt(pw.x, pw.z, 0.6)));
        this.opportunistic();
        return;
      }
      case 'lever':
      case 'rescue':
      case 'hydrant': {
        const e = s.ents[g.ent];
        const r = g.kind === 'hydrant' ? 1.05 : e.type === 'window' ? 0.5 : 1.0;
        // a hydrant (or the truck) is hooked up at its anchor point, the truck's is beside it
        const t = g.kind === 'hydrant' ? s.anchorPoint(e.id) : { x: e.cx, z: e.cz };
        if (Math.hypot(t.x - p.x, t.z - p.z) <= r) return;
        const path = this.bfs(nearAt(t.x, t.z, r));
        this.moveAlong(this.centred(path));
        // spray the nearest fire on the way if any
        this.opportunistic();
        return;
      }
      case 'cool': {
        const e = s.ents[g.ent];
        const d = Math.hypot(e.cx - p.x, e.cz - p.z);
        // attack the flames heating the bottle first, then the bottle itself (a gas leak: straight at the pipe)
        let tx = e.cx;
        let tz = e.cz;
        let bd = 99;
        if (e.type !== 'leak')
          for (let z = Math.floor(e.cz) - 2; z <= e.cz + 2; z++)
            for (let x = Math.floor(e.cx) - 2; x <= e.cx + 2; x++) {
              const c = s.cellAt(x + 0.5, z + 0.5);
              if (c < 0 || s.fire[c] <= 0 || MATS[s.mat[c]].oil) continue;
              const dd = Math.hypot(x + 0.5 - e.cx, z + 0.5 - e.cz);
              if (dd < bd) {
                bd = dd;
                tx = x + 0.5;
                tz = z + 0.5;
              }
            }
        if (d <= 7 && this.los(p.x, p.z, tx, tz, s.cellAt(tx, tz))) this.sprayAt(tx, tz, 0);
        else this.moveAlong(this.centred(this.bfs(standFor(e.cx, e.cz, e.cells[0], 6))));
        if (!o.spray) this.opportunistic();
        return;
      }
      case 'wet': {
        const x = (g.cell % W) + 0.5;
        const z = Math.floor(g.cell / W) + 0.5;
        const d = Math.hypot(x - p.x, z - p.z);
        if (d <= 8.5 && this.los(p.x, p.z, x, z, g.cell)) this.sprayAt(x, z, 0);
        else this.moveAlong(this.centred(this.bfs(standFor(x, z, g.cell, 7))));
        return;
      }
      case 'fire': {
        const x = (g.cell % W) + 0.5;
        const z = Math.floor(g.cell / W) + 0.5;
        const oil = MATS[s.mat[g.cell]].oil;
        const noz: 0 | 1 | 2 = oil && this.foamLeft > 0 ? 2 : fogging ? 1 : 0;
        const range = s.rangeOf(p, noz) - 0.8;
        const d = Math.hypot(x - p.x, z - p.z);
        if (s.fire[g.cell] <= 0) {
          this.t = 0;
          return;
        }
        if (d <= range && this.los(p.x, p.z, x, z, g.cell)) {
          this.sprayAt(x, z, noz);
          if (fogging) {
            // back off a bit
            o.mx = ((p.x - x) / (d || 1)) * 0.6;
            o.mz = ((p.z - z) / (d || 1)) * 0.6;
          }
        } else {
          let path = this.bfs(standFor(x, z, g.cell, Math.min(range, 6.5)));
          if (!path.length) {
            // a flame hidden inside a building: its walls are enough
            if (d <= range && this.los(p.x, p.z, x, z, g.cell, true)) {
              this.sprayAt(x, z, noz);
              return;
            }
            path = this.bfs(standFor(x, z, g.cell, Math.min(range, 6.5), true));
          }
          if (!path.length) {
            this.blacklist.set(g.cell, s.time + 3);
            this.t = 0;
          }
          this.moveAlong(path);
          this.opportunistic();
        }
        return;
      }
    }
  }

  /** While walking, spray whatever burns in front. */
  private opportunistic() {
    const s = this.sim;
    const p = this.me;
    const mv = Math.hypot(this.out.mx, this.out.mz);
    const dx = mv > 0.1 ? this.out.mx / mv : p.aimX;
    const dz = mv > 0.1 ? this.out.mz / mv : p.aimZ;
    const t = s.findAimTarget(dx, dz, 8, 0.6, p);
    if (t && !MATS[s.mat[s.cellAt(t.x, t.z)]].oil) this.sprayAt(t.x, t.z, this.hero && this.skill.usesFog && p.heat > 0.55 ? 1 : 0);
  }
}
