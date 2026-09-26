import { MATS } from './materials';
import { RESCUE_TYPES } from './parse';
import type { SimInput } from './types';
import type { Sim } from './world';

export interface BotSkill {
  think: number; // seconds between decisions
  aimNoise: number; // radians
  speed: number; // 0..1 input magnitude
  smart: boolean; // threat-based targeting vs nearest fire
  usesFog: boolean;
}
export const SKILL_PRO: BotSkill = { think: 0.1, aimNoise: 0.02, speed: 1, smart: true, usesFog: true };
export const SKILL_CASUAL: BotSkill = { think: 0.35, aimNoise: 0.12, speed: 0.85, smart: false, usesFog: false };

type Goal =
  | { kind: 'fire'; cell: number }
  | { kind: 'cool'; ent: number }
  | { kind: 'wet'; cell: number }
  | { kind: 'rescue'; ent: number }
  | { kind: 'lever'; ent: number }
  | { kind: 'hydrant'; ent: number }
  | { kind: 'idle' };

export class Bot {
  private t = 0;
  private goal: Goal = { kind: 'idle' };
  private path: number[] = [];
  private noise = 0;
  private out: SimInput = { mx: 0, mz: 0, ax: 0, az: 0, aimDist: 0, spray: false, nozzle: 0 };
  private prev = new Int32Array(0);
  private seen = new Uint8Array(0);
  private queue = new Int32Array(0);

  constructor(
    private sim: Sim,
    private skill: BotSkill,
  ) {
    const n = sim.N;
    this.prev = new Int32Array(n);
    this.seen = new Uint8Array(n);
    this.queue = new Int32Array(n);
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

  // ---------- decision ----------
  private reachFromAnchor(x: number, z: number, anchor = this.sim.player.anchor) {
    const a = this.sim.anchorPoint(anchor);
    return Math.hypot(x - a.x, z - a.z);
  }

  /** Hydrant to connect to first so (x,z) comes within `need` of the hose end, or -1 if already fine / impossible. */
  private viaHydrant(x: number, z: number, need: number): number {
    const s = this.sim;
    if (this.reachFromAnchor(x, z) <= s.hoseLen + need) return -1;
    let hb = -1;
    let hd = 1e9;
    for (const id of s.anchors) {
      if (id === s.player.anchor) continue;
      const ap = s.anchorPoint(id);
      if (this.reachFromAnchor(ap.x, ap.z) > s.hoseLen - 0.5) continue;
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
    const p = s.player;
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
    // 1. power lever if the box is live
    const elec = s.ents.find((e) => e.type === 'elec' && e.state === 1);
    const lever = s.ents.find((e) => e.type === 'lever' && e.state === 0);
    if (elec && lever && this.reachFromAnchor(lever.cx, lever.cz) < s.hoseLen + 1) {
      this.goal = { kind: 'lever', ent: lever.id };
      return;
    }
    // 2. cylinders under pressure
    const cylT = this.skill.smart ? 0.3 : 0.6;
    let cyl = null;
    for (const e of s.ents) if (e.type === 'cylinder' && e.state === 0 && e.t > cylT && (!cyl || e.t > cyl.t)) cyl = e;
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
    // 3. rescues in danger (or anyone close by)
    const resT = this.skill.smart ? 0.4 : 0.5;
    let res = null;
    let resD = 1e9;
    let resH = -1;
    for (const e of s.ents) {
      if (!RESCUE_TYPES.has(e.type) || e.state !== 0) continue;
      const d = Math.hypot(e.cx - p.x, e.cz - p.z);
      const urgent = e.alert > resT || d < 4;
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
        if (oil && s.foamLeft <= 0) continue;
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
      } else sc = -d;
      const ra = this.reachFromAnchor(x, z);
      if (ra > s.hoseLen + 8) {
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

  // ---------- pathing ----------
  private los(x0: number, z0: number, x1: number, z1: number, targetCell: number): boolean {
    const s = this.sim;
    const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 2);
    for (let k = 1; k < n; k++) {
      const x = x0 + ((x1 - x0) * k) / n;
      const z = z0 + ((z1 - z0) * k) / n;
      const c = s.cellAt(x, z);
      if (c < 0 || c === targetCell) continue;
      if (s.height[c] > 1.0) return false;
    }
    return true;
  }

  /** BFS to the nearest walkable cell satisfying `ok`. Returns path of cells (excluding start). */
  private bfs(ok: (c: number) => boolean): number[] {
    const s = this.sim;
    const W = s.W;
    const p = s.player;
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
        const nx = (n % W) + 0.5;
        const nz = Math.floor(n / W) + 0.5;
        if (Math.hypot(nx - a.x, nz - a.z) > s.hoseLen + 0.2) continue;
        this.seen[n] = 1;
        this.prev[n] = c;
        this.queue[qt++] = n;
      }
    }
    return [];
  }

  private moveAlong(path: number[]) {
    const s = this.sim;
    const p = s.player;
    while (path.length) {
      const c = path[0];
      const x = (c % s.W) + 0.5;
      const z = Math.floor(c / s.W) + 0.5;
      const d = Math.hypot(x - p.x, z - p.z);
      if (d < 0.35 && path.length > 1) {
        path.shift();
        continue;
      }
      this.out.mx = ((x - p.x) / Math.max(d, 0.001)) * this.skill.speed;
      this.out.mz = ((z - p.z) / Math.max(d, 0.001)) * this.skill.speed;
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
    const p = this.sim.player;
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
    const p = s.player;
    const o = this.out;
    o.mx = 0;
    o.mz = 0;
    o.spray = false;
    const W = s.W;
    const g = this.goal;
    const fogging = this.skill.usesFog && p.heat > 0.55;
    const nearAt = (x: number, z: number, r: number) => (c: number) => {
      const cx = (c % W) + 0.5;
      const cz = Math.floor(c / W) + 0.5;
      return Math.hypot(cx - x, cz - z) <= r;
    };
    const standFor = (tx: number, tz: number, cell: number, range: number) => (c: number) => {
      const cx = (c % W) + 0.5;
      const cz = Math.floor(c / W) + 0.5;
      const d = Math.hypot(cx - tx, cz - tz);
      return d <= range && d >= 1.2 && this.los(cx, cz, tx, tz, cell);
    };
    switch (g.kind) {
      case 'idle':
        return;
      case 'lever':
      case 'rescue':
      case 'hydrant': {
        const e = s.ents[g.ent];
        const r = g.kind === 'hydrant' ? 0.9 : 1.0;
        if (Math.hypot(e.cx - p.x, e.cz - p.z) <= r) return;
        const path = this.bfs(nearAt(e.cx, e.cz, r));
        this.moveAlong(path);
        // spray the nearest fire on the way if any
        this.opportunistic();
        return;
      }
      case 'cool': {
        const e = s.ents[g.ent];
        const d = Math.hypot(e.cx - p.x, e.cz - p.z);
        // attack the flames heating the bottle first, then the bottle itself
        let tx = e.cx;
        let tz = e.cz;
        let bd = 99;
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
        else this.moveAlong(this.bfs(standFor(e.cx, e.cz, e.cells[0], 6)));
        if (!o.spray) this.opportunistic();
        return;
      }
      case 'wet': {
        const x = (g.cell % W) + 0.5;
        const z = Math.floor(g.cell / W) + 0.5;
        const d = Math.hypot(x - p.x, z - p.z);
        if (d <= 8.5 && this.los(p.x, p.z, x, z, g.cell)) this.sprayAt(x, z, 0);
        else this.moveAlong(this.bfs(standFor(x, z, g.cell, 7)));
        return;
      }
      case 'fire': {
        const x = (g.cell % W) + 0.5;
        const z = Math.floor(g.cell / W) + 0.5;
        const oil = MATS[s.mat[g.cell]].oil;
        const noz: 0 | 1 | 2 = oil && s.foamLeft > 0 ? 2 : fogging ? 1 : 0;
        const range = s.nozzleRange(noz) - 0.8;
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
          const path = this.bfs(standFor(x, z, g.cell, Math.min(range, 6.5)));
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
    const p = s.player;
    const mv = Math.hypot(this.out.mx, this.out.mz);
    const dx = mv > 0.1 ? this.out.mx / mv : p.aimX;
    const dz = mv > 0.1 ? this.out.mz / mv : p.aimZ;
    const t = s.findAimTarget(dx, dz, 8, 0.6);
    if (t && !MATS[s.mat[s.cellAt(t.x, t.z)]].oil) this.sprayAt(t.x, t.z, this.skill.usesFog && p.heat > 0.55 ? 1 : 0);
  }
}
