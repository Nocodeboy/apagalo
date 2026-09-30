import { M } from './materials';
import type { Ent, EntType, LevelDef } from './types';

// ---------- ASCII legend ----------
// Ground
const GROUND: Record<string, number> = {
  '.': M.Grass,
  ',': M.Dry,
  l: M.Leaves,
  ':': M.Dirt,
  '=': M.Road,
  '-': M.Road,
  _: M.Stone,
  '#': M.Concrete,
  ';': M.Sand,
  '~': M.Water,
  w: M.Wood,
  o: M.Oil,
  '*': M.Dry,
  '^': M.Wood,
  '%': M.Oil,
  // v2
  O: M.Slick, // fuel on the sea (the docks)
  R: M.Rail, // railway track (rail yard)
  '+': M.Road, // zebra crossing (downtown)
  s: M.Snow, // snow (ski lodge)
  '!': M.Ice, // ice: you slide (ski lodge)
  '"': M.Carpet, // carpet (museum)
  j: M.TallGrass, // tall dry grass (campground)
};
const BURNING = new Set(['*', '^', '%']);

interface SingleDef {
  type: EntType;
  mat: number | null; // null -> keep ground from level.under
  height: number;
  walk?: boolean;
  value?: number;
  burning?: boolean;
}
// Single-cell objects
const SINGLE: Record<string, SingleDef> = {
  T: { type: 'tree', mat: M.Tree, height: 3.2 },
  P: { type: 'pine', mat: M.Tree, height: 3.8 },
  p: { type: 'palm', mat: M.Tree, height: 2.4 },
  h: { type: 'hedge', mat: M.Hedge, height: 1.1 },
  f: { type: 'fence', mat: M.Fence, height: 0.9 },
  b: { type: 'hay', mat: M.Hay, height: 1.3 },
  k: { type: 'pallet', mat: M.Pallet, height: 1.2 },
  n: { type: 'bench', mat: M.Wood, height: 0.6, walk: false, value: 1 },
  L: { type: 'lamp', mat: null, height: 0, walk: false },
  r: { type: 'rock', mat: M.Block, height: 0.7 },
  Y: { type: 'hydrant', mat: null, height: 0.8, walk: false },
  E: { type: 'elec', mat: M.Elec, height: 1.8 },
  Z: { type: 'lever', mat: null, height: 1.1, walk: false },
  G: { type: 'cylinder', mat: null, height: 0.8, walk: false },
  Q: { type: 'pump', mat: M.Block, height: 1.9 },
  u: { type: 'umbrella', mat: M.Thatch, height: 2.0, value: 1 },
  y: { type: 'bonfire', mat: M.Wood, height: 1.0, walk: false, burning: true },
  c: { type: 'cat', mat: null, height: 0 },
  d: { type: 'dog', mat: null, height: 0 },
  e: { type: 'sheep', mat: null, height: 0 },
  a: { type: 'goat', mat: null, height: 0 },
  v: { type: 'person', mat: null, height: 0 },
  m: { type: 'bystander', mat: null, height: 0 },
  // v2
  q: { type: 'seapump', mat: null, height: 0.9, walk: false }, // the docks: hook up here and the foam refills
  i: { type: 'post', mat: null, height: 0, walk: false }, // bollard, signal or traffic light (the look depends on the theme)
  J: { type: 'window', mat: null, height: 0 }, // someone at the window of the building just north: stand on this spot to get them down
  z: { type: 'canopy', mat: null, height: 0 }, // platform canopy (decoration, walkable)
  '|': { type: 'wall', mat: M.Block, height: 1.6 }, // inside wall (museum: shown cut away, water does not cross it)
  $: { type: 'art', mat: null, height: 0, walk: false }, // a painting on its easel or a sculpture: carry it to an exit
  '>': { type: 'exit', mat: null, height: 0 }, // museum door: artworks carried here are safe
};

interface RegionDef {
  type: EntType;
  mat: number;
  height: number;
  chunk?: number;
  value?: number;
}
// Multi-cell regions (rectangles of the same letter)
const REGION: Record<string, RegionDef> = {
  H: { type: 'house', mat: M.Building, height: 3.2, chunk: 4 },
  B: { type: 'barn', mat: M.Building, height: 4.0 },
  S: { type: 'stall', mat: M.Stall, height: 2.4, chunk: 3 },
  C: { type: 'churros', mat: M.Stall, height: 2.4, chunk: 3 },
  W: { type: 'warehouse', mat: M.Building, height: 4.6 },
  K: { type: 'shop', mat: M.Building, height: 3.0 },
  I: { type: 'church', mat: M.Building, height: 6.0, value: 10 },
  A: { type: 'car', mat: M.Vehicle, height: 1.4, chunk: 2 },
  X: { type: 'truck', mat: M.Block, height: 2.7 },
  U: { type: 'chiringuito', mat: M.Thatch, height: 2.6, chunk: 4 },
  V: { type: 'cabin', mat: M.Building, height: 2.8 },
  F: { type: 'fountain', mat: M.Water, height: 0.9 },
  // v2
  D: { type: 'boat', mat: M.Hull, height: 1.6, chunk: 3 },
  N: { type: 'container', mat: M.Vehicle, height: 2.4, chunk: 3 },
  x: { type: 'crane', mat: M.Block, height: 5.0 },
  M: { type: 'tower', mat: M.Office, height: 6.2, chunk: 4 },
  g: { type: 'wagon', mat: M.Hull, height: 2.3, chunk: 4 },
  t: { type: 'tent', mat: M.Thatch, height: 1.5, chunk: 2, value: 3 },
  '&': { type: 'rv', mat: M.Vehicle, height: 2.4, chunk: 3 },
  '1': { type: 'chalet', mat: M.Timber, height: 3.0, chunk: 3 },
};

export const RESCUE_TYPES = new Set<EntType>(['cat', 'dog', 'sheep', 'goat', 'person', 'window', 'onlooker']);
/** Rescues that are not a walk-up: the platform has to go up to the window (seconds standing on the spot). */
export const WINDOW_RESCUE_TIME = 1.5;

export interface Parsed {
  W: number;
  H: number;
  mat: Uint8Array;
  walk: Uint8Array;
  height: Float32Array;
  value: Float32Array;
  owner: Int16Array;
  burning: number[];
  ents: Ent[];
}

export function newEnt(id: number, type: EntType, x: number, z: number, w: number, h: number, height: number, W: number): Ent {
  const cells: number[] = [];
  for (let zz = z; zz < z + h; zz++) for (let xx = x; xx < x + w; xx++) cells.push(zz * W + xx);
  return {
    id,
    type,
    x,
    z,
    w,
    h,
    cells,
    cx: x + w / 2,
    cz: z + h / 2,
    height,
    variant: (x * 7 + z * 13 + id * 3) % 97,
    state: 0,
    t: 0,
    soakCd: 0,
    alert: 0,
    orient: w > h ? 1 : 0,
    prog: 0,
  };
}

export function parseLevel(def: LevelDef): Parsed {
  const rows = def.map;
  const H = rows.length;
  const W = rows[0].length;
  for (let z = 0; z < H; z++) {
    if (rows[z].length !== W) throw new Error(`Level ${def.id}: row ${z} has ${rows[z].length} chars, expected ${W}`);
  }
  const N = W * H;
  const mat = new Uint8Array(N);
  const walk = new Uint8Array(N);
  const height = new Float32Array(N);
  const value = new Float32Array(N);
  const owner = new Int16Array(N).fill(-1);
  const burning: number[] = [];
  const ents: Ent[] = [];
  const under = GROUND[def.under ?? '.'] ?? M.Grass;
  const seen = new Uint8Array(N);

  const setCell = (i: number, m: number, wk?: boolean, hgt = 0, val?: number) => {
    mat[i] = m;
    walk[i] = wk === undefined ? (m === M.Water || m === M.Block || m === M.Slick ? 0 : [M.Building, M.Tree, M.Hay, M.Hedge, M.Fence, M.Vehicle, M.Stall, M.Pallet, M.Thatch, M.Elec, M.Hull, M.Office, M.Timber].includes(m as never) ? 0 : 1) : wk ? 1 : 0;
    height[i] = hgt;
    value[i] = val ?? -1;
  };

  for (let z = 0; z < H; z++) {
    for (let x = 0; x < W; x++) {
      const i = z * W + x;
      if (seen[i]) continue;
      const ch = rows[z][x];
      if (ch in GROUND) {
        setCell(i, GROUND[ch]);
        if (BURNING.has(ch)) burning.push(i);
        seen[i] = 1;
        continue;
      }
      if (ch in SINGLE) {
        const s = SINGLE[ch];
        const e = newEnt(ents.length, s.type, x, z, 1, 1, s.height, W);
        ents.push(e);
        setCell(i, s.mat ?? under, s.walk ?? (s.mat === null ? true : undefined), s.height, s.value);
        if (s.mat === null && s.walk === false) walk[i] = 0;
        owner[i] = e.id;
        if (s.burning) burning.push(i);
        seen[i] = 1;
        continue;
      }
      if (ch in REGION) {
        const r = REGION[ch];
        // rectangle: extend right then down
        let w = 0;
        while (x + w < W && rows[z][x + w] === ch && !seen[z * W + x + w]) w++;
        let h = 0;
        outer: while (z + h < H) {
          for (let xx = x; xx < x + w; xx++) if (rows[z + h][xx] !== ch) break outer;
          h++;
        }
        // split into chunks along the long axis
        const long = Math.max(w, h);
        const n = r.chunk && long > r.chunk ? Math.max(1, Math.floor(long / r.chunk)) : 1;
        for (let k = 0; k < n; k++) {
          let ex = x,
            ez = z,
            ew = w,
            eh = h;
          if (n > 1) {
            if (w >= h) {
              ex = x + k * r.chunk!;
              ew = k === n - 1 ? w - k * r.chunk! : r.chunk!;
            } else {
              ez = z + k * r.chunk!;
              eh = k === n - 1 ? h - k * r.chunk! : r.chunk!;
            }
          }
          const e = newEnt(ents.length, r.type, ex, ez, ew, eh, r.height, W);
          ents.push(e);
          for (const ci of e.cells) {
            setCell(ci, r.mat, undefined, r.height, r.value);
            owner[ci] = e.id;
            seen[ci] = 1;
          }
        }
        continue;
      }
      throw new Error(`Level ${def.id}: unknown char '${ch}' at ${x},${z}`);
    }
  }

  // Fence orientation from neighbours
  for (const e of ents) {
    if (e.type === 'fence' || e.type === 'hedge') {
      const i = e.cells[0];
      const l = e.x > 0 && owner[i - 1] >= 0 && ents[owner[i - 1]].type === e.type;
      const r = e.x < W - 1 && owner[i + 1] >= 0 && ents[owner[i + 1]].type === e.type;
      e.orient = l || r ? 1 : 0;
    }
  }

  // Extra fire overlay
  if (def.fires) {
    for (const [zs, line] of Object.entries(def.fires)) {
      const z = Number(zs);
      for (let x = 0; x < line.length; x++) if (line[x] === 'X') burning.push(z * W + x);
    }
  }
  return { W, H, mat, walk, height, value, owner, burning, ents };
}
