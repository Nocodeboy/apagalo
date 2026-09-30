import { Rng } from './rng';

/** Small helper to author level maps with drawing commands instead of hand-counted ASCII. */
export class MB {
  g: string[][];
  fires: [number, number][] = [];
  constructor(
    public W: number,
    public H: number,
    fill: string,
  ) {
    this.g = Array.from({ length: H }, () => Array.from({ length: W }, () => fill));
  }
  private ok(x: number, z: number) {
    return x >= 0 && z >= 0 && x < this.W && z < this.H;
  }
  put(x: number, z: number, ch: string) {
    if (this.ok(x, z)) this.g[z][x] = ch;
    return this;
  }
  row(z: number, x: number, s: string) {
    for (let k = 0; k < s.length; k++) if (s[k] !== ' ') this.put(x + k, z, s[k]);
    return this;
  }
  rect(x: number, z: number, w: number, h: number, ch: string) {
    for (let zz = z; zz < z + h; zz++) for (let xx = x; xx < x + w; xx++) this.put(xx, zz, ch);
    return this;
  }
  hline(x0: number, x1: number, z: number, ch: string) {
    for (let x = x0; x <= x1; x++) this.put(x, z, ch);
    return this;
  }
  vline(x: number, z0: number, z1: number, ch: string) {
    for (let z = z0; z <= z1; z++) this.put(x, z, ch);
    return this;
  }
  outline(x: number, z: number, w: number, h: number, ch: string) {
    this.hline(x, x + w - 1, z, ch);
    this.hline(x, x + w - 1, z + h - 1, ch);
    this.vline(x, z, z + h - 1, ch);
    this.vline(x + w - 1, z, z + h - 1, ch);
    return this;
  }
  circle(cx: number, cz: number, r: number, ch: string, onlyOn?: string) {
    for (let z = Math.floor(cz - r); z <= cz + r; z++)
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        if (!this.ok(x, z)) continue;
        if ((x - cx) ** 2 + (z - cz) ** 2 > r * r) continue;
        if (onlyOn && !onlyOn.includes(this.g[z][x])) continue;
        this.g[z][x] = ch;
      }
    return this;
  }
  /** Thick line between two points (for streams / trails). */
  path(pts: [number, number][], ch: string, width = 1, onlyOn?: string) {
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, z0] = pts[k];
      const [x1, z1] = pts[k + 1];
      const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 2);
      for (let s = 0; s <= n; s++) {
        const x = x0 + ((x1 - x0) * s) / n;
        const z = z0 + ((z1 - z0) * s) / n;
        this.circle(x, z, width / 2, ch, onlyOn);
      }
    }
    return this;
  }
  /** Scatter single-cell objects on given ground chars, keeping a Chebyshev spacing so paths stay open. */
  scatter(ch: string, count: number, onlyOn: string, seed: number, area?: [number, number, number, number], spacing = 2) {
    const r = new Rng(seed);
    const [ax, az, aw, ah] = area ?? [0, 0, this.W, this.H];
    let placed = 0;
    for (let tries = 0; tries < count * 30 && placed < count; tries++) {
      const x = ax + Math.floor(r.next() * aw);
      const z = az + Math.floor(r.next() * ah);
      if (!this.ok(x, z) || !onlyOn.includes(this.g[z][x])) continue;
      let clear = true;
      for (let dz = -spacing + 1; dz < spacing && clear; dz++)
        for (let dx = -spacing + 1; dx < spacing; dx++) {
          const xx = x + dx;
          const zz = z + dz;
          if (!this.ok(xx, zz)) continue;
          const c = this.g[zz][xx];
          // (v2 grounds s ! " j are new: no map from before them has any, so old maps are unchanged)
          if (!'.,l:;_#=-w~os!"j'.includes(c)) {
            clear = false;
            break;
          }
        }
      if (!clear) continue;
      this.g[z][x] = ch;
      placed++;
    }
    return this;
  }
  fire(x: number, z: number, w = 1, h = 1) {
    for (let zz = z; zz < z + h; zz++) for (let xx = x; xx < x + w; xx++) this.fires.push([xx, zz]);
    return this;
  }
  done(): { map: string[]; fires: Record<number, string> } {
    const fires: Record<number, string> = {};
    for (const [x, z] of this.fires) {
      const line = (fires[z] ?? '').padEnd(this.W, ' ').split('');
      line[x] = 'X';
      fires[z] = line.join('');
    }
    return { map: this.g.map((r) => r.join('')), fires };
  }
}
