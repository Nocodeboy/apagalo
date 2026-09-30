import * as THREE from 'three';
import type { EntType } from '../sim/types';
import { box, cone, cyl, dode, ico, merge, part, prism, sphere, type Part } from './geo';
import type { Theme } from './themes';

const PI = Math.PI;
const WINDOW = 0x2d4a66;
const WINDOW_LIT = 0x8fc8e8;
const DOOR = 0x6b4128;
const DARK = 0x2b2b30;
const WHITE = 0xf7f4ee;

function pick<T>(arr: T[], v: number): T {
  return arr[Math.abs(v) % arr.length];
}

// ---------- buildings ----------
function house(w: number, d: number, v: number, t: Theme): Part[] {
  const P: Part[] = [];
  const wall = pick(t.wall, v);
  const roof = pick(t.roof, v >> 1);
  const W = w - 0.35;
  const D = d - 0.35;
  const H = 2.3;
  P.push(part(box(W + 0.1, 0.3, D + 0.1), 0xb8ab98, 0, 0.15, 0));
  P.push(part(box(W, H, D), wall, 0, H / 2 + 0.2, 0));
  P.push(part(prism(W + 0.35, D + 0.45, 1.15), roof, 0, H + 0.2, 0));
  // windows front/back
  for (const s of [-1, 1]) {
    P.push(part(box(0.6, 0.7, 0.06), WINDOW, -W / 4, 1.55, s * (D / 2 + 0.02)));
    P.push(part(box(0.6, 0.7, 0.06), WINDOW, W / 4 + 0.2, 1.55, s * (D / 2 + 0.02)));
    P.push(part(box(0.75, 0.08, 0.1), WHITE, -W / 4, 1.16, s * (D / 2 + 0.04)));
    P.push(part(box(0.75, 0.08, 0.1), WHITE, W / 4 + 0.2, 1.16, s * (D / 2 + 0.04)));
    P.push(part(box(0.06, 0.7, 0.6), WINDOW, s * (W / 2 + 0.02), 1.55, 0));
  }
  P.push(part(box(0.7, 1.25, 0.08), DOOR, -0.05, 0.82, D / 2 + 0.03));
  P.push(part(box(0.35, 0.8, 0.35), 0xa88f7a, W / 4, H + 1.0, -D / 5));
  // flower pots
  P.push(part(box(0.45, 0.25, 0.25), 0xb5652e, W / 4 + 0.2, 1.08, D / 2 + 0.18));
  P.push(part(ico(0.16), 0xe0457a, W / 4 + 0.1, 1.28, D / 2 + 0.18));
  P.push(part(ico(0.16), 0xf2c43a, W / 4 + 0.32, 1.28, D / 2 + 0.18));
  return P;
}

function church(w: number, d: number): Part[] {
  const P: Part[] = [];
  const stone = 0xe8dcc2;
  const H = 4.4;
  P.push(part(box(w - 3, H, d - 0.3), stone, 1.2, H / 2, 0));
  P.push(part(prism(w - 2.7, d + 0.2, 1.4), 0xb95a36, 1.2, H, 0));
  // bell tower on the left
  const tx = -w / 2 + 1.6;
  P.push(part(box(2.6, 8.2, 2.6), 0xe2d4b8, tx, 4.1, 0.2));
  P.push(part(box(2.8, 0.25, 2.8), 0xcdbd9e, tx, 6.2, 0.2));
  P.push(part(box(1.1, 1.3, 2.7), 0x3a3030, tx, 7.1, 0.2));
  P.push(part(box(2.7, 1.3, 1.1), 0x3a3030, tx, 7.1, 0.2));
  P.push(part(cyl(0.28, 0.42, 0.6, 8), 0xd4a93a, tx, 7.0, 0.2));
  P.push(part(cone(2.0, 2.0, 4), 0xb95a36, tx, 9.2, 0.2, 0, PI / 4, 0));
  P.push(part(box(0.06, 0.8, 0.06), 0x3a3a3a, tx, 10.5, 0.2));
  P.push(part(box(0.5, 0.06, 0.06), 0x3a3a3a, tx, 10.7, 0.2));
  // facade details
  P.push(part(box(1.4, 2.4, 0.1), DOOR, 1.2, 1.2, d / 2 - 0.1));
  P.push(part(cyl(0.7, 0.7, 0.12, 10), DOOR, 1.2, 2.4, d / 2 - 0.1, PI / 2, 0, 0));
  P.push(part(cyl(0.55, 0.55, 0.12, 10), 0x5a7fb0, 1.2, 3.55, d / 2 - 0.1, PI / 2, 0, 0));
  for (const x of [-2.2, 4.6]) P.push(part(box(0.5, 1.4, 0.1), WINDOW, 1.2 + x * 0.7, 2.6, d / 2 - 0.1));
  P.push(part(box(w - 2.6, 0.35, d + 0.2), 0xcdbd9e, 1.2, 0.17, 0.1));
  return P;
}

function barn(w: number, d: number): Part[] {
  const P: Part[] = [];
  const red = 0xb2402f;
  P.push(part(box(w - 0.3, 2.8, d - 0.3), red, 0, 1.4, 0));
  P.push(part(prism(w, d + 0.3, 1.6), 0x4a4a52, 0, 2.8, 0));
  // big doors with white X
  const z = d / 2 - 0.13;
  P.push(part(box(2.2, 2.2, 0.06), 0x8e2e22, 0, 1.1, z));
  P.push(part(box(2.3, 0.14, 0.08), WHITE, 0, 2.2, z + 0.02));
  P.push(part(box(0.14, 2.2, 0.08), WHITE, -1.1, 1.1, z + 0.02));
  P.push(part(box(0.14, 2.2, 0.08), WHITE, 1.1, 1.1, z + 0.02));
  P.push(part(box(0.12, 3.0, 0.08), WHITE, 0, 1.1, z + 0.03, 0, 0, 0.78));
  P.push(part(box(0.12, 3.0, 0.08), WHITE, 0, 1.1, z + 0.03, 0, 0, -0.78));
  P.push(part(box(0.8, 0.8, 0.06), 0x3a2a20, 0, 3.4, z + 0.05));
  for (const x of [-w / 2 + 0.16, w / 2 - 0.16]) P.push(part(box(0.1, 2.8, d - 0.2), WHITE, x, 1.4, 0));
  return P;
}

const STALL_COLORS = [0xd8433a, 0x3a76c8, 0x3aa35a, 0xe06aa0, 0xf09a2a];
function stall(w: number, d: number, v: number, churros = false): Part[] {
  const P: Part[] = [];
  const wood = 0xa8723f;
  const c = churros ? 0xf2b705 : pick(STALL_COLORS, v);
  const c2 = churros ? 0xd8433a : WHITE;
  const W = w - 0.15;
  const D = d - 0.2;
  P.push(part(box(W, 0.95, D * 0.55), wood, 0, 0.47, D * 0.2));
  P.push(part(box(W + 0.05, 0.08, D * 0.6), 0xd9b27a, 0, 0.97, D * 0.2));
  P.push(part(box(W, 1.6, 0.08), wood, 0, 0.8, -D / 2 + 0.05));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.push(part(box(0.09, 2.3, 0.09), 0x6b4a2a, (sx * W) / 2, 1.15, (sz * D) / 2));
  // striped sloped awning
  const n = Math.max(3, Math.round(W / 0.4));
  const sw = W / n;
  for (let k = 0; k < n; k++) {
    P.push(part(box(sw, 0.07, D + 0.35), k % 2 ? c2 : c, -W / 2 + sw * (k + 0.5), 2.35, 0.05, -0.18, 0, 0));
    P.push(part(box(sw, 0.28, 0.05), k % 2 ? c2 : c, -W / 2 + sw * (k + 0.5), 2.18, D / 2 + 0.23));
  }
  // goods on the counter
  for (let k = 0; k < Math.floor(W / 0.7); k++) {
    const col = churros ? 0xd99a3a : pick([0xf2c43a, 0xe25b5b, 0x7fc96b, 0x6fa8e0, 0xf28a3a], v + k);
    P.push(part(box(0.35, 0.22, 0.3), col, -W / 2 + 0.45 + k * 0.7, 1.12, D * 0.2));
  }
  if (churros) {
    P.push(part(box(W * 0.7, 0.4, 0.06), 0xd8433a, 0, 2.75, D / 2 + 0.2));
    P.push(part(box(W * 0.6, 0.12, 0.07), 0xfff3c0, 0, 2.75, D / 2 + 0.22));
  }
  return P;
}

function warehouse(w: number, d: number, v: number, t: Theme): Part[] {
  const P: Part[] = [];
  const wall = pick(t.wall, v);
  const H = 3.8;
  P.push(part(box(w - 0.3, H, d - 0.3), wall, 0, H / 2, 0));
  P.push(part(box(w - 0.1, 0.25, d - 0.1), 0x5f6a72, 0, H + 0.1, 0));
  for (let x = -w / 2 + 0.6; x < w / 2 - 0.3; x += 0.6) P.push(part(box(0.12, 0.12, d - 0.2), 0x707c85, x, H + 0.28, 0));
  // big roller door + hazard stripes
  const z = d / 2 - 0.13;
  P.push(part(box(3, 2.8, 0.06), 0x9aa3a8, -w / 6, 1.4, z));
  for (let y = 0.2; y < 2.8; y += 0.25) P.push(part(box(3, 0.04, 0.07), 0x7a8288, -w / 6, y, z + 0.01));
  for (const s of [-1, 1]) {
    for (let k = 0; k < 6; k++) P.push(part(box(0.18, 0.4, 0.08), k % 2 ? DARK : 0xf2c21a, -w / 6 + s * 1.62, 0.2 + k * 0.45, z + 0.01));
  }
  P.push(part(box(w * 0.3, 0.5, 0.06), WINDOW_LIT, w / 4, 3.0, z));
  P.push(part(box(1.8, 0.45, 0.08), 0x2f6fb5, w / 4, 2.2, z + 0.02));
  return P;
}

function shop(w: number, d: number): Part[] {
  const P: Part[] = [];
  const H = 2.7;
  P.push(part(box(w - 0.3, H, d - 0.3), 0xf4f1ea, 0, H / 2, 0));
  P.push(part(box(w - 0.1, 0.35, d - 0.1), 0xd8433a, 0, H + 0.05, 0));
  P.push(part(box(w - 0.1, 0.12, d - 0.1), 0xf2c21a, 0, H - 0.18, 0));
  const z = d / 2 - 0.13;
  P.push(part(box(w * 0.62, 1.4, 0.06), WINDOW_LIT, -w * 0.12, 1.25, z));
  P.push(part(box(1.0, 2.0, 0.07), 0x5a8fb8, w * 0.32, 1.0, z));
  P.push(part(box(2.4, 0.9, 0.3), 0xd8433a, w / 4, H + 0.75, 0));
  P.push(part(box(2.0, 0.5, 0.32), WHITE, w / 4, H + 0.75, 0));
  return P;
}

function cabin(w: number, d: number): Part[] {
  const P: Part[] = [];
  const log = 0x8a5a36;
  P.push(part(box(w - 0.3, 2.1, d - 0.3), log, 0, 1.05, 0));
  for (let y = 0.25; y < 2.1; y += 0.35) P.push(part(box(w - 0.2, 0.06, d - 0.2), 0x6e4527, 0, y, 0));
  P.push(part(prism(w + 0.3, d + 0.5, 1.3), 0x4f6b3a, 0, 2.1, 0));
  P.push(part(box(0.7, 1.3, 0.06), 0x4a2e1c, 0, 0.65, d / 2 - 0.13));
  P.push(part(box(0.6, 0.55, 0.06), WINDOW_LIT, w / 4, 1.3, d / 2 - 0.13));
  P.push(part(box(0.5, 1.4, 0.5), 0x8e8a82, -w / 4, 2.7, -0.2));
  return P;
}

function chiringuito(w: number, d: number): Part[] {
  const P: Part[] = [];
  const W = w - 0.3;
  const D = d - 0.3;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.push(part(cyl(0.07, 0.08, 2.2, 6), 0x8a6a42, (sx * W) / 2, 1.1, (sz * D) / 2));
  P.push(part(box(W, 1.0, 0.5), 0x9a7048, 0, 0.5, D / 2 - 0.2));
  P.push(part(box(W + 0.1, 0.08, 0.6), 0xd9b27a, 0, 1.02, D / 2 - 0.2));
  P.push(part(box(W, 1.6, 0.1), 0x9a7048, 0, 0.8, -D / 2 + 0.1));
  P.push(part(cone(Math.max(W, D) * 0.82, 1.4, 4), 0xd9b86a, 0, 2.85, 0, 0, PI / 4, 0));
  P.push(part(cone(Math.max(W, D) * 0.84, 0.25, 4), 0xc4a257, 0, 2.2, 0, 0, PI / 4, 0));
  for (let k = 0; k < 3; k++) P.push(part(cyl(0.16, 0.12, 0.7, 6), 0x6a4a30, -W / 3 + (k * W) / 3, 0.35, D / 2 + 0.45));
  for (let k = 0; k < 4; k++) P.push(part(box(0.25, 0.3, 0.2), pick([0xe25b5b, 0x6fa8e0, 0xf2c43a, 0x7fc96b], k), -W / 2 + 0.4 + k * 0.6, 1.2, D / 2 - 0.2));
  return P;
}

function fountain(w: number): Part[] {
  const P: Part[] = [];
  const r = w / 2 - 0.1;
  P.push(part(cyl(r, r + 0.1, 0.6, 8), 0xd9ccb2, 0, 0.3, 0));
  P.push(part(cyl(r - 0.22, r - 0.22, 0.04, 8), 0x4aa6d8, 0, 0.62, 0));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    P.push(part(box(r * 0.8, 0.14, 0.26), 0xe6dac2, Math.cos(a) * (r - 0.1), 0.66, Math.sin(a) * (r - 0.1), 0, -a + Math.PI / 2, 0));
  }
  P.push(part(cyl(0.25, 0.35, 1.3, 8), 0xd0c2a6, 0, 1.0, 0));
  P.push(part(cyl(0.7, 0.4, 0.25, 8), 0xd9ccb2, 0, 1.6, 0));
  P.push(part(cone(0.18, 0.7, 6), 0xbfe8ff, 0, 2.05, 0));
  return P;
}

// ---------- nature & small props ----------
function tree(v: number, t: Theme): Part[] {
  const P: Part[] = [];
  const c1 = pick(t.foliage, v);
  const c2 = pick(t.foliage, v + 1);
  const s = 0.9 + (v % 5) * 0.06;
  P.push(part(cyl(0.12, 0.19, 1.5, 5), t.trunk, 0, 0.75, 0));
  P.push(part(ico(0.95 * s), c1, 0, 2.15 * s, 0, v, v * 2, 0));
  P.push(part(ico(0.68 * s), c2, 0.45, 2.6 * s, 0.2, v * 3, 0, 0));
  P.push(part(ico(0.6 * s), c1, -0.4, 2.5 * s, -0.25, 0, v, 0));
  return P;
}
function pine(v: number): Part[] {
  const P: Part[] = [];
  const g = v % 2 ? 0x2f6b3a : 0x2a5f35;
  const s = 0.9 + (v % 4) * 0.07;
  P.push(part(cyl(0.1, 0.16, 1.2, 5), 0x5e3d25, 0, 0.6, 0));
  P.push(part(cone(0.95 * s, 1.5 * s, 7), g, 0, 1.55 * s, 0));
  P.push(part(cone(0.75 * s, 1.3 * s, 7), g, 0, 2.3 * s, 0, 0, 0.3, 0));
  P.push(part(cone(0.5 * s, 1.1 * s, 7), g, 0, 3.0 * s, 0));
  return P;
}
function palm(v: number): Part[] {
  const P: Part[] = [];
  let x = 0;
  let y = 0;
  const lean = 0.1 + (v % 3) * 0.05;
  for (let k = 0; k < 6; k++) {
    P.push(part(cyl(0.12 - k * 0.008, 0.15 - k * 0.008, 0.6, 6), k % 2 ? 0x8a6a45 : 0x7a5c3a, x, y + 0.3, 0, 0, 0, -lean));
    x += Math.sin(lean) * 0.6;
    y += Math.cos(lean) * 0.6;
  }
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * PI * 2;
    P.push(part(box(1.5, 0.05, 0.35), k % 2 ? 0x3f8a3a : 0x4f9a44, x + Math.cos(a) * 0.65, y - 0.15, Math.sin(a) * 0.65, 0, -a, -0.45));
  }
  P.push(part(ico(0.12), 0x6a4a2a, x + 0.12, y - 0.1, 0.05));
  P.push(part(ico(0.12), 0x6a4a2a, x - 0.1, y - 0.12, -0.06));
  return P;
}
function hedge(v: number, t: Theme): Part[] {
  const g = pick([0x4f8f3c, 0x5a9a44, 0x478635], v);
  void t;
  return [part(box(0.98, 0.8, 0.9), g, 0, 0.42, 0), part(ico(0.38), g, -0.22, 0.85, 0), part(ico(0.38), g, 0.24, 0.87, 0.05)];
}
function fence(): Part[] {
  const c = 0x9a6a3e;
  return [
    part(box(0.1, 0.95, 0.1), c, -0.42, 0.47, 0),
    part(box(0.1, 0.95, 0.1), c, 0.42, 0.47, 0),
    part(box(1.02, 0.1, 0.06), 0xb07c48, 0, 0.72, 0),
    part(box(1.02, 0.1, 0.06), 0xb07c48, 0, 0.4, 0),
  ];
}
function hay(v: number): Part[] {
  if (v % 3 === 0) return [part(box(0.95, 0.75, 0.75), 0xdcbc5c, 0, 0.38, 0), part(box(0.97, 0.05, 0.77), 0xb8963e, 0, 0.3, 0), part(box(0.97, 0.05, 0.77), 0xb8963e, 0, 0.55, 0)];
  return [part(cyl(0.55, 0.55, 0.9, 12), 0xe0c060, 0, 0.55, 0, 0, 0, PI / 2), part(cyl(0.42, 0.42, 0.92, 12), 0xcaa64a, 0, 0.55, 0, 0, 0, PI / 2)];
}
function pallet(v: number): Part[] {
  const P: Part[] = [];
  const n = 3 + (v % 3);
  for (let k = 0; k < n; k++) {
    P.push(part(box(0.92, 0.07, 0.92), 0xb5874f, 0, 0.1 + k * 0.17, 0, 0, (k % 2) * 0.08, 0));
    P.push(part(box(0.92, 0.07, 0.15), 0x9c7040, 0, 0.04 + k * 0.17, -0.35));
    P.push(part(box(0.92, 0.07, 0.15), 0x9c7040, 0, 0.04 + k * 0.17, 0.35));
  }
  if (v % 2) P.push(part(box(0.6, 0.45, 0.6), 0xc49a5c, 0.05, 0.1 + n * 0.17 + 0.2, 0, 0, 0.3, 0));
  return P;
}
function bench(): Part[] {
  return [
    part(box(0.95, 0.08, 0.4), 0xa8723f, 0, 0.45, 0),
    part(box(0.95, 0.3, 0.06), 0xa8723f, 0, 0.7, -0.18),
    part(box(0.06, 0.45, 0.4), 0x3a3a3a, -0.4, 0.22, 0),
    part(box(0.06, 0.45, 0.4), 0x3a3a3a, 0.4, 0.22, 0),
  ];
}
function rock(v: number): Part[] {
  return [part(dode(0.45), 0x8e8b86, 0, 0.3, 0, v, v * 2, 0, 1, 0.7, 1), part(dode(0.25), 0x7e7b76, 0.3, 0.18, 0.2, v, 0, 0)];
}
function hydrant(): Part[] {
  const r = 0xd8342a;
  return [
    part(cyl(0.26, 0.3, 0.12, 8), 0x9a2a22, 0, 0.06, 0),
    part(cyl(0.17, 0.2, 0.62, 8), r, 0, 0.42, 0),
    part(sphere(0.18, 8, 4), r, 0, 0.74, 0),
    part(cyl(0.06, 0.06, 0.18, 6), 0xd4a93a, 0, 0.92, 0),
    part(cyl(0.08, 0.08, 0.5, 6), 0xd4a93a, 0, 0.5, 0, 0, 0, PI / 2),
    part(cyl(0.09, 0.09, 0.22, 6), 0xd4a93a, 0, 0.5, 0.17, PI / 2, 0, 0),
  ];
}
function elec(): Part[] {
  return [
    part(box(0.95, 0.15, 0.75), 0x7a7a7a, 0, 0.07, 0),
    part(box(0.85, 1.45, 0.62), 0x9aa3a8, 0, 0.87, 0),
    part(box(0.87, 0.06, 0.64), 0x7a8288, 0, 1.6, 0),
    part(box(0.02, 1.2, 0.02), 0x5a6268, 0, 0.85, 0.32),
    part(cone(0.18, 0.3, 3), 0xf2c21a, 0.2, 1.15, 0.33, PI / 2, 0, 0),
    part(box(0.05, 0.14, 0.02), DARK, 0.2, 1.12, 0.36, 0, 0, 0.4),
    part(cyl(0.04, 0.04, 1.4, 5), DARK, -0.3, 1.9, -0.2),
  ];
}
function leverBase(): Part[] {
  return [part(box(0.18, 1.1, 0.18), 0x6a6a6a, 0, 0.55, 0), part(box(0.45, 0.5, 0.25), 0xb8c0c4, 0, 1.0, 0.05), part(box(0.2, 0.2, 0.05), 0xf2c21a, 0, 1.0, 0.19)];
}
function cylinder(): Part[] {
  const o = 0xf07a1a;
  return [
    part(cyl(0.21, 0.21, 0.5, 10), o, 0, 0.33, 0),
    part(sphere(0.21, 10, 4), o, 0, 0.58, 0, 0, 0, 0, 1, 0.45, 1),
    part(cyl(0.22, 0.22, 0.08, 10), 0xd06010, 0, 0.08, 0),
    part(cyl(0.05, 0.06, 0.12, 6), 0x8a8a8a, 0, 0.7, 0),
    part(box(0.14, 0.03, 0.03), 0x5a5a5a, 0, 0.76, 0),
  ];
}
function pump(): Part[] {
  return [
    part(box(1.0, 0.18, 0.7), 0xbcb8b0, 0, 0.09, 0),
    part(box(0.55, 1.55, 0.45), WHITE, 0, 0.95, 0),
    part(box(0.57, 0.35, 0.47), 0xd8433a, 0, 1.6, 0),
    part(box(0.35, 0.25, 0.02), DARK, 0, 1.25, 0.24),
    part(cyl(0.035, 0.035, 0.9, 5), DARK, 0.3, 0.8, 0.1, 0.2, 0, 0.1),
    part(box(0.1, 0.2, 0.12), DARK, 0.35, 0.35, 0.18),
  ];
}
function umbrella(v: number): Part[] {
  return [
    part(cyl(0.035, 0.035, 2.0, 5), 0xd9c9a8, 0, 1.0, 0),
    part(cone(1.0, 0.55, 8), 0xd4b265, 0, 2.05, 0, 0, v, 0),
    part(box(0.5, 0.08, 1.3), pick([0x3a76c8, 0xe25b5b, 0x3aa35a], v), 0.7, 0.25, 0.1, 0, 0, 0),
  ];
}
function bonfire(): Part[] {
  const P: Part[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * PI * 2;
    P.push(part(cyl(0.07, 0.09, 1.2, 5), 0x6a4526, Math.cos(a) * 0.22, 0.45, Math.sin(a) * 0.22, Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45));
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * PI * 2;
    P.push(part(dode(0.13), 0x8a8580, Math.cos(a) * 0.5, 0.08, Math.sin(a) * 0.5, k, k, 0));
  }
  return P;
}
function lampPole(): Part[] {
  return [part(cyl(0.12, 0.16, 0.3, 6), 0x2e3238, 0, 0.15, 0), part(cyl(0.05, 0.06, 3.0, 6), 0x2e3238, 0, 1.6, 0), part(box(0.5, 0.05, 0.05), 0x2e3238, 0.2, 3.05, 0)];
}
function car(v: number): Part[] {
  const c = pick([0xd8433a, 0x3a76c8, 0xf4f1ea, 0xf2c21a, 0x3aa35a, 0x6a6f78], v);
  const P: Part[] = [
    part(box(1.85, 0.55, 0.92), c, 0, 0.5, 0),
    part(box(1.05, 0.48, 0.84), 0x26384a, -0.1, 0.99, 0),
    part(box(1.0, 0.06, 0.86), c, -0.1, 1.24, 0),
    part(box(0.1, 0.15, 0.3), 0xfff2c0, 0.93, 0.55, 0.28),
    part(box(0.1, 0.15, 0.3), 0xfff2c0, 0.93, 0.55, -0.28),
    part(box(0.08, 0.12, 0.25), 0xc0202a, -0.93, 0.55, 0.3),
    part(box(0.08, 0.12, 0.25), 0xc0202a, -0.93, 0.55, -0.3),
  ];
  for (const sx of [-0.58, 0.58]) for (const sz of [-0.46, 0.46]) P.push(part(cyl(0.22, 0.22, 0.14, 10), 0x1f1f22, sx, 0.23, sz, PI / 2, 0, 0));
  return P;
}

// ---------- v2: the docks ----------
/** Fishing boat along X: hull with a pointed bow (+x), wheelhouse aft, mast and a boom. */
function boat(len: number, wid: number, v: number): Part[] {
  const P: Part[] = [];
  const hullC = pick([0xf4f1ea, 0x2f6fb5, 0xd8433a, 0x3a8a5a], v);
  const trim = pick([0x2f6fb5, 0xf4f1ea, 0xf4f1ea, 0xf2c21a], v);
  const L = len - 0.25;
  const B = wid - 0.35;
  // hull with a pointed bow (+x) and a light wooden deck, so it reads as a boat from above
  P.push(part(box(L - 1.0, 0.75, B), hullC, -0.5, 0.42, 0));
  const bow = cone(B / 2, 1.1, 4);
  bow.rotateY(PI / 4);
  bow.scale(0.75 / B, 1, 1);
  P.push(part(bow, hullC, L / 2 - 0.45, 0.42, 0, 0, 0, -PI / 2));
  P.push(part(box(L - 1.0, 0.1, B + 0.08), trim, -0.5, 0.8, 0));
  P.push(part(box(L - 1.25, 0.06, B - 0.22), 0xd9b27a, -0.55, 0.82, 0));
  // wheelhouse aft with a coloured roof
  P.push(part(box(1.05, 0.8, B - 0.3), WHITE, -L / 2 + 0.95, 1.25, 0));
  P.push(part(box(1.2, 0.1, B - 0.15), trim === WHITE ? hullC : trim, -L / 2 + 0.95, 1.7, 0));
  P.push(part(box(0.05, 0.3, B - 0.45), WINDOW, -L / 2 + 1.49, 1.4, 0));
  P.push(part(cyl(0.05, 0.06, 2.2, 5), 0xd9d2c4, 0.3, 1.85, 0));
  P.push(part(box(1.5, 0.05, 0.05), 0xd9d2c4, 0.85, 2.2, 0, 0, 0, -0.35));
  // nets and floats
  P.push(part(box(0.7, 0.25, 0.6), 0x3f6e8a, 0.9, 0.95, 0));
  for (const z of [-B / 2 + 0.05, B / 2 - 0.05]) P.push(part(sphere(0.12, 6, 4), 0xf07a1a, 0.2, 0.72, z));
  return P;
}
/** The ferry: a long white ship with two decks, a blue stripe and a funnel. */
function ferry(len: number, wid: number): Part[] {
  const P: Part[] = [];
  const L = len - 0.3;
  const B = wid - 0.4;
  P.push(part(box(L - 2, 1.4, B), 0xf4f1ea, -1, 0.75, 0));
  P.push(part(cone(B / 2, 2.4, 4), 0xf4f1ea, L / 2 - 1.1, 0.75, 0, 0, PI / 4, -PI / 2));
  P.push(part(box(L - 2, 0.35, B + 0.04), 0x2f6fb5, -1, 0.95, 0));
  P.push(part(box(L - 5, 1.1, B - 1), WHITE, -2, 2.0, 0));
  for (let x = -L / 2 + 2; x < L / 2 - 4; x += 0.9) for (const z of [-(B - 1) / 2 - 0.02, (B - 1) / 2 + 0.02]) P.push(part(box(0.5, 0.35, 0.04), WINDOW, x, 2.1, z));
  P.push(part(box(L - 8, 0.9, B - 2), WHITE, -3, 3.0, 0));
  P.push(part(cyl(0.55, 0.65, 1.4, 8), 0xd8433a, -L / 2 + 3.5, 3.9, 0));
  P.push(part(cyl(0.58, 0.58, 0.25, 8), 0x2b2b30, -L / 2 + 3.5, 4.55, 0));
  return P;
}
const CONTAINER_C = [0xc8452e, 0x2f6fb5, 0xe08a2a, 0x3a8a5a, 0x8a8f96, 0x6a3f8a];
/** Shipping containers: one row on the ground, another stacked on part of it. */
function container(w: number, d: number, v: number): Part[] {
  const P: Part[] = [];
  const c = pick(CONTAINER_C, v);
  const c2 = pick(CONTAINER_C, v + 3);
  const long = w >= d;
  const W = w - 0.15;
  const D = d - 0.15;
  P.push(part(box(W, 2.3, D), c, 0, 1.15, 0));
  // ribs along the long side
  const n = Math.floor((long ? W : D) / 0.45);
  for (let k = 0; k <= n; k++) {
    const t = -((long ? W : D) / 2) + (k * (long ? W : D)) / n;
    if (long) for (const z of [-D / 2 - 0.02, D / 2 + 0.02]) P.push(part(box(0.06, 2.2, 0.04), shade(c, 0.8), t, 1.15, z));
    else for (const x of [-W / 2 - 0.02, W / 2 + 0.02]) P.push(part(box(0.04, 2.2, 0.06), shade(c, 0.8), x, 1.15, t));
  }
  if (v % 3 !== 0) P.push(part(box(long ? W * 0.62 : W, 2.2, long ? D : D * 0.62), c2, long ? -W * 0.18 : 0, 3.4, long ? 0 : -D * 0.18));
  return P;
}
function shade(c: number, k: number): number {
  const r = Math.min(255, Math.round(((c >> 16) & 255) * k));
  const g = Math.min(255, Math.round(((c >> 8) & 255) * k));
  const b = Math.min(255, Math.round((c & 255) * k));
  return (r << 16) | (g << 8) | b;
}
/** Quayside gantry crane: two legs, a high beam and the boom reaching over the water (north). */
function crane(w: number, d: number): Part[] {
  const P: Part[] = [];
  const Y = 0xf2b705;
  for (const x of [-w / 2 + 0.3, w / 2 - 0.3]) {
    P.push(part(box(0.3, 5.6, 0.3), Y, x, 2.8, d / 2 - 0.3));
    P.push(part(box(0.3, 5.6, 0.3), Y, x, 2.8, -d / 2 + 0.3));
    P.push(part(box(0.5, 0.35, d), 0x3a3a3a, x, 0.18, 0));
  }
  P.push(part(box(w, 0.5, 0.5), Y, 0, 5.6, 0));
  P.push(part(box(0.6, 0.45, d + 6), Y, 0, 5.9, -3));
  P.push(part(box(1.2, 0.9, 1.1), 0xe8e2d4, 0, 5.2, -1));
  P.push(part(box(0.05, 3.0, 0.05), 0x2b2b30, 0, 4.2, -5.5));
  P.push(part(box(1.4, 0.4, 0.9), 0x2b2b30, 0, 2.7, -5.5));
  return P;
}
/** The sea pump: a yellow engine on skids with its suction hose going into the water to the north. */
function seapump(): Part[] {
  return [
    part(box(0.95, 0.12, 0.75), 0x5a5a5a, 0, 0.06, 0),
    part(box(0.75, 0.55, 0.6), 0xf2c21a, 0, 0.42, 0),
    part(cyl(0.2, 0.2, 0.45, 8), 0x3a3a3a, 0.1, 0.45, 0.05, PI / 2, 0, 0),
    part(box(0.35, 0.18, 0.25), 0xd8342a, -0.2, 0.78, 0),
    part(cyl(0.09, 0.09, 0.9, 6), 0x2b2b30, 0, 0.35, -0.6, PI / 2, 0, 0),
    part(cyl(0.09, 0.09, 0.8, 6), 0x2b2b30, 0, -0.05, -1.05),
  ];
}
function bollard(): Part[] {
  return [part(cyl(0.16, 0.2, 0.5, 8), 0x2b2b30, 0, 0.25, 0), part(cyl(0.24, 0.2, 0.12, 8), 0x2b2b30, 0, 0.55, 0), part(box(0.5, 0.06, 0.06), 0x9a9aa0, 0, 0.35, 0)];
}
/** A lighthouse: striped round tower, gallery and the lamp room. */
function lighthouse(w: number, d: number): Part[] {
  const P: Part[] = [];
  const r = Math.min(w, d) / 2 - 0.2;
  P.push(part(cyl(r + 0.2, r + 0.3, 0.5, 10), 0x8a8580, 0, 0.25, 0));
  for (let k = 0; k < 5; k++) P.push(part(cyl(r - k * 0.07, r - k * 0.07 + 0.07, 1.4, 10), k % 2 ? 0xd8433a : WHITE, 0, 1.2 + k * 1.4, 0));
  P.push(part(cyl(r * 0.9, r * 0.9, 0.12, 10), 0x2b2b30, 0, 7.6, 0));
  P.push(part(cyl(r * 0.55, r * 0.55, 0.8, 8), 0xfff2a0, 0, 8.1, 0));
  P.push(part(cone(r * 0.65, 0.7, 8), 0xd8433a, 0, 8.85, 0));
  return P;
}

// ---------- v2: downtown ----------
/** Office tower: tall box with a grid of windows (some lit), parapet and roof units. */
function tower(w: number, d: number, v: number, t: Theme): Part[] {
  const P: Part[] = [];
  const wall = pick(t.wall, v);
  const H = 6.6 + (v % 3) * 0.8;
  const W = w - 0.25;
  const D = d - 0.25;
  P.push(part(box(W, H, D), wall, 0, H / 2, 0));
  P.push(part(box(W + 0.12, 0.25, D + 0.12), shade(wall, 0.75), 0, H + 0.1, 0));
  P.push(part(box(W, 0.9, D), shade(wall, 0.85), 0, 0.45, 0));
  const lit = (k: number) => ((k * 7 + v * 3) % 5 === 0 ? WINDOW_LIT : WINDOW);
  let k = 0;
  for (let y = 1.6; y < H - 0.5; y += 1.05) {
    for (let x = -W / 2 + 0.5; x < W / 2 - 0.3; x += 0.8) {
      P.push(part(box(0.5, 0.62, 0.05), lit(k++), x, y, D / 2 + 0.01));
      P.push(part(box(0.5, 0.62, 0.05), lit(k++), x, y, -D / 2 - 0.01));
    }
    for (let z = -D / 2 + 0.5; z < D / 2 - 0.3; z += 0.8) {
      P.push(part(box(0.05, 0.62, 0.5), lit(k++), W / 2 + 0.01, y, z));
      P.push(part(box(0.05, 0.62, 0.5), lit(k++), -W / 2 - 0.01, y, z));
    }
  }
  // ground floor: glass doors
  P.push(part(box(Math.min(1.6, W - 0.6), 0.75, 0.05), WINDOW_LIT, 0, 0.45, D / 2 + 0.02));
  P.push(part(box(0.9, 0.5, 0.8), 0x9aa3a8, W / 4, H + 0.45, -D / 5));
  P.push(part(box(0.5, 0.35, 0.5), 0x7a8288, -W / 4, H + 0.35, D / 6));
  return P;
}
/** Downtown apartment block: three floors, flat roof, balconies. */
function apartments(w: number, d: number, v: number, t: Theme): Part[] {
  const P: Part[] = [];
  const wall = pick(t.wall, v + 2);
  const H = 3.4;
  const W = w - 0.3;
  const D = d - 0.3;
  P.push(part(box(W, H, D), wall, 0, H / 2, 0));
  P.push(part(box(W + 0.1, 0.2, D + 0.1), shade(wall, 0.8), 0, H + 0.1, 0));
  for (let x = -W / 2 + 0.55; x < W / 2 - 0.3; x += 1.0)
    for (const y of [1.2, 2.4]) {
      P.push(part(box(0.55, 0.6, 0.05), (x * 3 + y) % 2 > 1 ? WINDOW_LIT : WINDOW, x, y, D / 2 + 0.02));
      P.push(part(box(0.7, 0.06, 0.25), 0x6a6f78, x, y - 0.38, D / 2 + 0.12));
    }
  P.push(part(box(0.8, 1.1, 0.06), DOOR, 0, 0.55, D / 2 + 0.03));
  return P;
}
/** A theatre: stone facade with columns, a pediment and a red banner. */
function theatre(w: number, d: number): Part[] {
  const P: Part[] = [];
  const stone = 0xe6dcc6;
  const W = w - 0.3;
  const D = d - 0.3;
  P.push(part(box(W, 4.2, D - 1.2), stone, 0, 2.1, -0.6));
  P.push(part(box(W, 0.4, D), 0xd4c8b0, 0, 0.2, 0));
  for (let x = -W / 2 + 0.6; x <= W / 2 - 0.5; x += (W - 1.1) / 5) P.push(part(cyl(0.2, 0.22, 3.4, 8), WHITE, x, 2.1, D / 2 - 0.35));
  P.push(part(box(W, 0.45, 1.1), 0xd4c8b0, 0, 3.95, D / 2 - 0.5));
  P.push(part(prism(W, 1.2, 0.9), 0xd4c8b0, 0, 4.2, D / 2 - 0.5));
  P.push(part(box(W * 0.5, 0.7, 0.06), 0xc0282a, 0, 3.3, D / 2 + 0.05));
  P.push(part(box(W - 0.4, 0.5, D - 1.6), 0xb95a36, 0, 4.45, -0.8));
  return P;
}
function trafficLight(): Part[] {
  return [
    part(cyl(0.05, 0.06, 2.6, 6), 0x2e3238, 0, 1.3, 0),
    part(box(0.2, 0.62, 0.2), 0x2e3238, 0, 2.5, 0.08),
    part(sphere(0.06, 6, 4), 0xe23a2e, 0, 2.7, 0.19),
    part(sphere(0.06, 6, 4), 0xf2c21a, 0, 2.5, 0.19),
    part(sphere(0.06, 6, 4), 0x3cc46e, 0, 2.3, 0.19),
  ];
}

// ---------- v2: the rail yard ----------
/** Brick hall: the station building (clock and platform roof) or a goods shed. */
function brickHall(w: number, d: number, v: number, t: Theme, shed = false): Part[] {
  const P: Part[] = [];
  const brick = pick(t.wall, v);
  const W = w - 0.3;
  const D = d - 0.3;
  const H = shed ? 3.4 : 3.0;
  P.push(part(box(W, H, D), brick, 0, H / 2, 0));
  P.push(part(box(W + 0.1, 0.18, D + 0.1), 0xe0d6c2, 0, H - 0.1, 0));
  P.push(part(prism(W + 0.3, D + 0.4, shed ? 1.1 : 1.3), pick(t.roof, v), 0, H, 0));
  for (let x = -W / 2 + 0.7; x < W / 2 - 0.4; x += 1.2) {
    P.push(part(box(0.55, 0.9, 0.06), WINDOW, x, 1.6, D / 2 + 0.02));
    P.push(part(cyl(0.28, 0.28, 0.06, 8), 0xe0d6c2, x, 2.1, D / 2 + 0.03, PI / 2, 0, 0));
  }
  if (shed) P.push(part(box(Math.min(3, W - 1), 2.4, 0.06), 0x6e4a2c, 0, 1.2, D / 2 + 0.03));
  else {
    P.push(part(box(1.0, 1.0, 0.8), brick, 0, H + 1.3, 0));
    P.push(part(cyl(0.34, 0.34, 0.06, 12), WHITE, 0, H + 1.3, 0.42, PI / 2, 0, 0));
    P.push(part(box(0.04, 0.26, 0.02), DARK, 0, H + 1.38, 0.46));
    P.push(part(prism(1.2, 1.0, 0.5), pick(t.roof, v), 0, H + 1.8, 0));
  }
  return P;
}
/** Freight wagon along X: boxcar, tank wagon or open wagon with logs. */
function wagon(len: number, wid: number, v: number): Part[] {
  const P: Part[] = [];
  const L = len - 0.3;
  const B = Math.min(1.7, wid - 0.2);
  const kind = v % 3;
  P.push(part(box(L, 0.25, B), 0x2b2b30, 0, 0.6, 0));
  for (const x of [-L / 2 + 0.6, -L / 2 + 1.1, L / 2 - 1.1, L / 2 - 0.6]) for (const z of [-B / 2 + 0.1, B / 2 - 0.1]) P.push(part(cyl(0.3, 0.3, 0.1, 10), 0x1f1f22, x, 0.32, z, PI / 2, 0, 0));
  if (kind === 0) {
    const c = pick([0x8a3a2a, 0x3a5a8a, 0x6a6a3a], v >> 1);
    P.push(part(box(L, 1.6, B), c, 0, 1.55, 0));
    P.push(part(box(L + 0.05, 0.12, B + 0.1), shade(c, 0.7), 0, 2.4, 0));
    P.push(part(box(1.2, 1.3, 0.05), shade(c, 0.8), 0, 1.5, B / 2 + 0.01));
  } else if (kind === 1) {
    P.push(part(cyl(B / 2, B / 2, L - 0.3, 10), 0xd9d2c4, 0, 1.55, 0, 0, 0, PI / 2));
    P.push(part(cyl(0.25, 0.25, 0.3, 8), 0x9a9aa0, 0, 2.4, 0));
  } else {
    P.push(part(box(L, 0.9, B), 0x5a4a3a, 0, 1.15, 0));
    for (let k = 0; k < 4; k++) P.push(part(cyl(0.18, 0.18, L - 0.4, 6), 0x9a6a3e, 0, 1.7 + (k % 2) * 0.1, -B / 2 + 0.35 + k * 0.35, 0, 0, PI / 2));
  }
  return P;
}
/** Platform post with the station sign and a lamp (walkable around it). */
function canopy(): Part[] {
  return [
    part(cyl(0.06, 0.07, 2.7, 6), 0x2e4a3a, 0, 1.35, 0),
    part(box(1.3, 0.34, 0.06), 0x2f5f9f, 0, 2.35, 0.06),
    part(box(1.1, 0.12, 0.07), WHITE, 0, 2.35, 0.07),
    part(box(0.5, 0.08, 0.3), 0x2e4a3a, 0.15, 2.72, 0),
    part(sphere(0.09, 6, 4), 0xfff2c0, 0.3, 2.64, 0),
    part(box(0.95, 0.07, 0.35), 0xa8723f, 0, 0.45, 0.45),
    part(box(0.06, 0.45, 0.3), 0x3a3a3a, -0.38, 0.22, 0.45),
    part(box(0.06, 0.45, 0.3), 0x3a3a3a, 0.38, 0.22, 0.45),
  ];
}
function railSignal(): Part[] {
  return [part(cyl(0.05, 0.06, 2.4, 6), 0x2e3238, 0, 1.2, 0), part(box(0.24, 0.5, 0.18), 0x1f1f22, 0, 2.35, 0.05), part(sphere(0.07, 6, 4), 0xe23a2e, 0, 2.47, 0.15), part(sphere(0.07, 6, 4), 0x3cc46e, 0, 2.25, 0.15)];
}

// ---------- v2: events ----------
/** A gas riser with its valve wheel and warning plate. */
function gasPipe(): Part[] {
  return [
    part(box(0.5, 0.08, 0.5), 0x8a8a8a, 0, 0.04, 0),
    part(cyl(0.08, 0.08, 0.8, 8), 0xf2c21a, 0, 0.45, 0),
    part(cyl(0.08, 0.08, 0.5, 8), 0xf2c21a, 0.2, 0.75, 0, 0, 0, PI / 2),
    part(cyl(0.16, 0.16, 0.04, 10), 0xd8342a, 0.2, 0.92, 0),
    part(box(0.28, 0.2, 0.03), 0xf2c21a, 0, 0.45, 0.1),
  ];
}
function fishShed(w: number, d: number, v: number, t: Theme): Part[] {
  const P: Part[] = [];
  const wall = pick(t.wall, v);
  const W = w - 0.3;
  const D = d - 0.3;
  P.push(part(box(W, 2.4, D), wall, 0, 1.2, 0));
  P.push(part(prism(W + 0.3, D + 0.4, 0.9), pick(t.roof, v), 0, 2.4, 0));
  for (let x = -W / 2 + 0.6; x < W / 2 - 0.3; x += 1.1) P.push(part(box(0.5, 0.5, 0.05), WINDOW, x, 1.6, D / 2 + 0.02));
  P.push(part(box(Math.min(2, W - 1), 1.7, 0.06), 0x3f6e8a, -W / 5, 0.85, D / 2 + 0.03));
  P.push(part(box(W * 0.5, 0.35, 0.05), 0x2f6f8f, W / 5, 2.1, D / 2 + 0.03));
  return P;
}

// ---------- v2, entrega 2: the ski lodge ----------
const SNOW = 0xf1f5fa;
const WARM = 0xffc46e;

/** Log chalet: stone base, log walls, a steep snowy roof with its gable to the front, a balcony and warm windows.
 *  Big footprints (the hotel) get two floors. */
function chalet(w: number, d: number, v: number, t: Theme): Part[] {
  const P: Part[] = [];
  const W = w - 0.3;
  const D = d - 0.3;
  const floors = w * d >= 16 ? 2 : 1;
  const H = 1.9 * floors;
  const log = pick(t.wall, v);
  P.push(part(box(W + 0.1, 0.35, D + 0.1), 0x8a8f99, 0, 0.17, 0));
  P.push(part(box(W, H, D), log, 0, 0.35 + H / 2, 0));
  for (let y = 0.6; y < H + 0.3; y += 0.32) P.push(part(box(W + 0.05, 0.05, D + 0.05), shade(log, 0.72), 0, y, 0));
  // gable roof facing the front (+z): the ridge runs along z; the snow layer is a little shorter so the gable shows
  const rh = Math.min(2.2, 0.9 + W * 0.3);
  P.push(part(prism(D + 0.8, W + 0.6, rh), 0x5a3a24, 0, 0.35 + H, 0, 0, PI / 2, 0));
  P.push(part(prism(D + 0.5, W + 0.75, rh - 0.05), SNOW, 0, 0.35 + H + 0.13, 0, 0, PI / 2, 0));
  for (let f = 0; f < floors; f++)
    for (let x = -W / 2 + 0.55; x < W / 2 - 0.3; x += 1.0) P.push(part(box(0.5, 0.55, 0.05), (f + Math.round(x * 3) + v) % 3 ? WARM : WINDOW, x, 1.25 + f * 1.9, D / 2 + 0.02));
  P.push(part(box(0.42, 0.45, 0.05), WARM, 0, 0.35 + H + rh * 0.35, D / 2 + 0.42));
  // balcony across the front, with snow on the rail
  P.push(part(box(W * 0.8, 0.07, 0.5), 0x6e4527, 0, 0.1 + H, D / 2 + 0.25));
  P.push(part(box(W * 0.8, 0.3, 0.05), 0x6e4527, 0, 0.27 + H, D / 2 + 0.48));
  P.push(part(box(W * 0.8, 0.06, 0.12), SNOW, 0, 0.44 + H, D / 2 + 0.48));
  P.push(part(box(0.55, 1.1, 0.05), DOOR, W / 2 - 0.55, 0.9, D / 2 + 0.02));
  // chimney with snow on it
  P.push(part(box(0.3, 1.0, 0.3), 0x7a7f88, W / 4, 0.35 + H + rh * 0.6, -D / 5));
  P.push(part(box(0.36, 0.08, 0.36), SNOW, W / 4, 0.35 + H + rh * 0.6 + 0.52, -D / 5));
  return P;
}
/** A pine with snow on each layer. */
function snowPine(v: number): Part[] {
  const P = pine(v);
  const s = 0.9 + (v % 4) * 0.07;
  P.push(part(cone(0.78 * s, 0.7 * s, 7), SNOW, 0, 1.95 * s, 0));
  P.push(part(cone(0.6 * s, 0.6 * s, 7), SNOW, 0, 2.65 * s, 0, 0, 0.3, 0));
  P.push(part(cone(0.4 * s, 0.55 * s, 7), SNOW, 0, 3.3 * s, 0));
  return P;
}
function snowTree(v: number, t: Theme): Part[] {
  const P = tree(v, t);
  const s = 0.9 + (v % 5) * 0.06;
  P.push(part(ico(0.7 * s), SNOW, 0, 2.55 * s, 0, 0, 0, 0, 1, 0.45, 1));
  P.push(part(ico(0.45 * s), SNOW, 0.45, 2.95 * s, 0.2, 0, 0, 0, 1, 0.45, 1));
  return P;
}
function snowman(): Part[] {
  return [
    part(sphere(0.42, 10, 8), SNOW, 0, 0.38, 0),
    part(sphere(0.31, 10, 8), SNOW, 0, 0.98, 0),
    part(sphere(0.22, 10, 8), SNOW, 0, 1.42, 0),
    part(cone(0.05, 0.28, 5), 0xf07a1a, 0, 1.42, 0.3, PI / 2, 0, 0),
    part(box(0.05, 0.05, 0.04), DARK, -0.08, 1.5, 0.19),
    part(box(0.05, 0.05, 0.04), DARK, 0.08, 1.5, 0.19),
    part(cyl(0.15, 0.15, 0.26, 8), DARK, 0, 1.72, 0),
    part(cyl(0.25, 0.25, 0.03, 10), DARK, 0, 1.6, 0),
    part(box(0.55, 0.1, 0.55), 0xd8342a, 0, 1.2, 0, 0, 0.4, 0),
    part(box(0.04, 0.5, 0.04), 0x5a3a24, 0.35, 1.05, 0, 0, 0, -0.9),
    part(box(0.04, 0.5, 0.04), 0x5a3a24, -0.35, 1.05, 0, 0, 0, 0.9),
  ];
}
/** Chairlift pylon: a tall pole, the cross arm with the cable wheels and two chairs hanging from it. */
function liftPylon(): Part[] {
  const g = 0x6a7078;
  const P: Part[] = [part(cyl(0.12, 0.2, 5.2, 6), g, 0, 2.6, 0), part(box(2.4, 0.16, 0.22), g, 0, 5.2, 0)];
  for (const x of [-1.0, 1.0]) {
    P.push(part(cyl(0.16, 0.16, 0.08, 10), DARK, x, 5.05, 0, PI / 2, 0, 0));
    P.push(part(box(0.05, 0.9, 0.05), DARK, x, 4.6, 0));
    const c = x < 0 ? 0xd8342a : 0x2f6fb5;
    P.push(part(box(0.75, 0.08, 0.42), c, x, 4.15, 0));
    P.push(part(box(0.75, 0.42, 0.06), c, x, 4.38, -0.19));
  }
  return P;
}
/** Ski rack: skis and poles standing in a wooden rack. */
function skiRack(v: number): Part[] {
  const w = 0x5a3a24;
  const P: Part[] = [part(box(1.0, 0.08, 0.3), w, 0, 0.55, 0), part(box(0.08, 0.6, 0.3), w, -0.45, 0.3, 0), part(box(0.08, 0.6, 0.3), w, 0.45, 0.3, 0)];
  for (let k = 0; k < 4; k++) P.push(part(box(0.07, 1.5, 0.03), pick([0xd8342a, 0x2f6fb5, 0xf2c21a, 0x3aa35a, 0xf4f1ea], v + k), -0.33 + k * 0.22, 0.8, (k % 2) * 0.05, 0, 0, 0.05 * (k - 1.5)));
  return P;
}
/** Stacked firewood with the log ends to the front (snow on top at the ski lodge). */
function woodpile(v: number, snow: boolean): Part[] {
  const P: Part[] = [];
  for (let row = 0; row < 3; row++)
    for (let k = 0; k < 3 - (row === 2 ? 1 : 0); k++) {
      const x = -0.3 + k * 0.3 + (row === 2 ? 0.15 : row * 0.02);
      const y = 0.16 + row * 0.26;
      P.push(part(cyl(0.14, 0.14, 0.85, 7), (k + row + v) % 2 ? 0x8a5a36 : 0x7a4c2c, x, y, 0, PI / 2, 0, 0));
      P.push(part(cyl(0.11, 0.11, 0.02, 7), 0xd9b27a, x, y, 0.43, PI / 2, 0, 0));
    }
  if (snow) P.push(part(box(0.8, 0.1, 0.8), SNOW, 0.08, 0.8, 0));
  return P;
}
function snowmobile(v: number): Part[] {
  const c = pick([0xd8342a, 0x2f6fb5, 0xf2c21a, 0x3aa35a], v);
  return [
    part(box(1.4, 0.3, 0.55), 0x2b2b30, -0.15, 0.22, 0),
    part(box(1.15, 0.35, 0.6), c, 0.05, 0.55, 0),
    part(box(0.5, 0.28, 0.56), c, 0.72, 0.45, 0, 0, 0, -0.35),
    part(box(0.08, 0.3, 0.46), 0x8fc8e8, 0.42, 0.88, 0, 0, 0, -0.45),
    part(box(0.6, 0.15, 0.42), DARK, -0.25, 0.8, 0),
    part(box(0.95, 0.05, 0.1), 0x9a9aa0, 0.55, 0.05, 0.3),
    part(box(0.95, 0.05, 0.1), 0x9a9aa0, 0.55, 0.05, -0.3),
  ];
}
/** Christmas market stall: a wooden hut with a snowy roof and a string of lights. */
function marketStall(w: number, d: number, v: number): Part[] {
  const P: Part[] = [];
  const W = w - 0.2;
  const D = d - 0.2;
  const wood = 0x8a5a36;
  P.push(part(box(W, 1.0, D * 0.6), wood, 0, 0.5, D * 0.2));
  P.push(part(box(W, 2.0, 0.1), shade(wood, 0.85), 0, 1.0, -D / 2 + 0.05));
  for (const x of [-W / 2 + 0.05, W / 2 - 0.05]) P.push(part(box(0.1, 2.0, D), shade(wood, 0.85), x, 1.0, 0));
  P.push(part(prism(W + 0.4, D + 0.5, 0.7), 0x6e4527, 0, 2.0, 0));
  P.push(part(prism(W + 0.45, D + 0.6, 0.62), SNOW, 0, 2.1, 0));
  for (let k = 0; k < Math.floor(W / 0.5); k++) {
    P.push(part(sphere(0.06, 5, 4), pick([0xffe066, 0xff6a5a, 0x7fd0ff, 0x9cff8a], k + v), -W / 2 + 0.3 + k * 0.5, 1.95, D / 2 + 0.25));
    P.push(part(box(0.3, 0.2, 0.25), pick([0xd8342a, 0xf2c43a, 0x7fc96b, 0xf4f1ea], v + k), -W / 2 + 0.35 + k * 0.5, 1.12, D * 0.2));
  }
  return P;
}
/** Alpine chapel: white walls, a steep snowy roof and a bell tower with an onion dome. */
function chapel(w: number, d: number): Part[] {
  const P: Part[] = [];
  const W = w - 0.3;
  const D = d - 0.3;
  P.push(part(box(W - 1.2, 2.8, D), 0xf1ece2, 0.6, 1.4, 0));
  P.push(part(prism(W - 0.9, D + 0.5, 1.5), 0x5a3a24, 0.6, 2.8, 0));
  P.push(part(prism(W - 1.0, D + 0.6, 1.42), SNOW, 0.6, 2.9, 0));
  const tx = -W / 2 + 0.7;
  P.push(part(box(1.3, 5.0, 1.3), 0xf1ece2, tx, 2.5, 0));
  P.push(part(box(0.5, 0.8, 1.32), 0x3a3030, tx, 4.2, 0));
  P.push(part(sphere(0.75, 10, 8), 0x3f7a6a, tx, 5.4, 0, 0, 0, 0, 1, 1.1, 1));
  P.push(part(cone(0.25, 0.9, 8), 0x3f7a6a, tx, 6.4, 0));
  P.push(part(box(0.7, 1.2, 0.08), DOOR, 0.6, 0.6, D / 2 + 0.02));
  P.push(part(cyl(0.3, 0.3, 0.06, 10), WARM, 0.6, 1.9, D / 2 + 0.03, PI / 2, 0, 0));
  return P;
}

// ---------- v2, entrega 2: the museum ----------
/** An inside wall, cut at 1.5 m so the rooms can be seen: plaster, a dark skirting board and a gilt top. */
function museumWall(): Part[] {
  return [part(box(1.0, 1.5, 1.0), 0xe8e0d2, 0, 0.75, 0), part(box(1.02, 0.18, 1.02), 0x5a3a26, 0, 0.09, 0), part(box(1.04, 0.09, 1.04), 0xc9a54a, 0, 1.52, 0)];
}
/** A door out of the museum: a glowing green mat, the dark door frame and the exit sign over it. */
function exitDoor(): Part[] {
  return [
    part(box(0.98, 0.03, 0.98), 0x2fbf5a, 0, 0.02, 0),
    part(box(0.74, 0.03, 0.74), 0x7af0a0, 0, 0.035, 0),
    part(box(1.0, 0.16, 0.2), 0x4a2e1c, 0, 1.55, 0),
    part(box(0.8, 0.34, 0.12), 0x2fbf5a, 0, 1.85, 0.02),
    part(box(0.5, 0.1, 0.13), WHITE, 0, 1.85, 0.02),
  ];
}
/** The hose cabinet on the wall of a museum room (an anchor like a hydrant). */
function hoseCabinet(): Part[] {
  return [
    part(box(0.75, 1.05, 0.35), 0xd8342a, 0, 0.9, -0.2),
    part(box(0.62, 0.9, 0.04), 0x9fd0e8, 0, 0.9, -0.01),
    part(cyl(0.26, 0.26, 0.12, 12), 0xf2e6c8, 0, 0.95, -0.12, PI / 2, 0, 0),
    part(box(0.2, 0.12, 0.06), WHITE, 0, 1.52, -0.02),
  ];
}
/** Glass display case on a wooden base, with the pieces inside. */
function vitrine(w: number, d: number, v: number): Part[] {
  const P: Part[] = [];
  const W = w - 0.2;
  const D = d - 0.2;
  P.push(part(box(W, 0.8, D), 0x6e4527, 0, 0.4, 0));
  P.push(part(box(W - 0.1, 0.55, D - 0.1), 0xbfe3f0, 0, 1.08, 0));
  P.push(part(box(W, 0.05, D), 0xc9a54a, 0, 1.38, 0));
  for (let k = 0; k < Math.floor(W / 0.6); k++) P.push(part(k % 2 ? sphere(0.12, 6, 4) : box(0.2, 0.25, 0.2), pick([0xd9b04a, 0x7a3a8a, 0x3a8a7a, 0xc0452e], v + k), -W / 2 + 0.35 + k * 0.6, 0.98, 0));
  return P;
}
/** Bar or café counter. */
function counter(w: number, d: number, v: number): Part[] {
  const P: Part[] = [];
  const W = w - 0.15;
  const D = d - 0.15;
  P.push(part(box(W, 1.0, D), 0x5a3a26, 0, 0.5, 0));
  P.push(part(box(W + 0.08, 0.08, D + 0.08), 0xc9a54a, 0, 1.02, 0));
  const long = W >= D;
  const n = Math.floor((long ? W : D) / 0.35);
  for (let k = 0; k < n; k++) {
    const t = -(long ? W : D) / 2 + 0.2 + k * 0.35;
    P.push(part(cyl(0.05, 0.06, 0.3, 6), pick([0x2f7a3a, 0x8a2a2a, 0xe8e0d0, 0xd9b04a], v + k), long ? t : 0, 1.2, long ? 0 : t));
  }
  return P;
}
/** Bookshelf: the books show on the side the camera sees (the front), in blocks of colour. */
function bookshelf(v: number): Part[] {
  const P: Part[] = [part(box(0.96, 1.8, 0.6), 0x4a2e1c, 0, 0.9, 0)];
  for (let r = 0; r < 4; r++)
    for (let k = 0; k < 3; k++) {
      const c = pick([0x8a2a2a, 0x2a4a8a, 0x2f6a3a, 0xc9a54a, 0x6a3a7a, 0xd8d0b8], v + k * 3 + r);
      P.push(part(box(0.27, 0.32 - ((k + r + v) % 3) * 0.04, 0.03), c, -0.3 + k * 0.3, 0.3 + r * 0.42, 0.31));
    }
  P.push(part(box(0.9, 0.05, 0.62), 0xc9a54a, 0, 1.82, 0));
  return P;
}
function pottedPlant(v: number): Part[] {
  return [part(cyl(0.3, 0.22, 0.5, 8), 0xb5652e, 0, 0.25, 0), part(ico(0.55), 0x3f8a44, 0, 1.0, 0, v, v, 0), part(ico(0.4), 0x4f9a4a, 0.2, 1.4, 0.1, v, 0, 0), part(cyl(0.04, 0.05, 0.6, 5), 0x6a4a30, 0, 0.6, 0)];
}
/** The dinosaur skeleton on its plinth, as long as the plinth. */
function dinosaur(w: number, d: number): Part[] {
  const P: Part[] = [];
  const bone = 0xe9dfc6;
  const L = w - 0.4;
  P.push(part(box(w - 0.2, 0.4, d - 0.2), 0xb9b2a4, 0, 0.2, 0));
  P.push(part(box(w - 0.1, 0.06, d - 0.1), 0xc9a54a, 0, 0.42, 0));
  // spine: a curve from the tail (-x) to the neck (+x)
  const n = 14;
  let prev: [number, number] | null = null;
  for (let k = 0; k <= n; k++) {
    const u = k / n;
    const x = -L / 2 + u * L;
    const y = 0.9 + Math.sin(u * PI) * 1.6 + (u > 0.8 ? (u - 0.8) * 4 : 0);
    P.push(part(box(0.18, 0.18, 0.18), bone, x, y, 0));
    if (u > 0.3 && u < 0.7) P.push(part(box(0.06, 0.8, 0.6), bone, x, y - 0.45, 0, 0, 0, 0.1));
    prev = [x, y];
  }
  void prev;
  // skull and legs
  P.push(part(box(0.7, 0.4, 0.35), bone, L / 2 + 0.2, 2.7, 0, 0, 0, -0.2));
  P.push(part(box(0.5, 0.12, 0.3), bone, L / 2 + 0.3, 2.45, 0, 0, 0, -0.2));
  for (const [x, zs] of [
    [-L / 6, 1],
    [L / 6, 1],
  ] as const)
    for (const z of [-0.3 * zs, 0.3 * zs]) {
      P.push(part(cyl(0.07, 0.09, 1.3, 5), bone, x, 1.05, z, 0, 0, 0.15));
      P.push(part(box(0.3, 0.08, 0.2), bone, x - 0.1, 0.46, z));
    }
  return P;
}
function crates(v: number): Part[] {
  const c = 0xc49a5c;
  const P: Part[] = [part(box(0.9, 0.7, 0.9), c, 0, 0.35, 0), part(box(0.92, 0.08, 0.92), shade(c, 0.75), 0, 0.35, 0), part(box(0.08, 0.72, 0.92), shade(c, 0.75), 0, 0.35, 0)];
  if (v % 2) P.push(part(box(0.7, 0.55, 0.7), shade(c, 1.08), 0.05, 0.98, 0, 0, 0.3, 0));
  return P;
}
function forklift(): Part[] {
  return [
    part(box(1.2, 0.6, 0.8), 0xf2b705, -0.1, 0.5, 0),
    part(box(0.5, 0.8, 0.7), 0x2b2b30, -0.25, 1.2, 0),
    part(box(0.08, 1.9, 0.6), 0x3a3a3a, 0.55, 0.95, 0),
    part(box(0.6, 0.05, 0.12), 0x3a3a3a, 0.85, 0.15, 0.2),
    part(box(0.6, 0.05, 0.12), 0x3a3a3a, 0.85, 0.15, -0.2),
    part(cyl(0.2, 0.2, 0.1, 8), 0x1f1f22, 0.3, 0.2, 0.42, PI / 2, 0, 0),
    part(cyl(0.2, 0.2, 0.1, 8), 0x1f1f22, -0.5, 0.2, 0.42, PI / 2, 0, 0),
    part(cyl(0.2, 0.2, 0.1, 8), 0x1f1f22, 0.3, 0.2, -0.42, PI / 2, 0, 0),
    part(cyl(0.2, 0.2, 0.1, 8), 0x1f1f22, -0.5, 0.2, -0.42, PI / 2, 0, 0),
  ];
}

// ---------- v2, entrega 2: the campground ----------
const TENT_C = [0xf07a1a, 0x3aa35a, 0x2f7bd8, 0xf2c21a, 0xd8342a];
/** A-frame tent with its door flap to the front. */
function tent(w: number, d: number, v: number): Part[] {
  const c = pick(TENT_C, v);
  const W = w - 0.25;
  const D = d - 0.25;
  return [
    part(prism(D, W, 1.25), c, 0, 0.02, 0, 0, PI / 2, 0),
    part(box(0.5, 0.75, 0.04), shade(c, 0.6), 0, 0.38, D / 2 - 0.02),
    part(box(0.05, 1.4, 0.05), 0x9a9aa0, 0, 0.7, D / 2 + 0.05),
    part(box(W + 0.4, 0.03, D + 0.3), 0x4a5a3a, 0, 0.01, 0),
  ];
}
/** A motorhome: coloured lower half, white body, the bed alcove over the cab (+x), windows, a door, an awning. */
function rv(len: number, wid: number, v: number): Part[] {
  const P: Part[] = [];
  const L = len - 0.2;
  const B = Math.min(1.8, wid - 0.15);
  const col = pick([0x2f6fb5, 0xd8342a, 0x3a8a5a, 0xc9812a], v);
  const body = 0xfbfaf6;
  P.push(part(box(L - 0.3, 0.75, B), col, -0.15, 0.7, 0));
  P.push(part(box(L - 1.0, 1.15, B), body, -0.5, 1.63, 0));
  P.push(part(box(1.0, 0.55, B), body, L / 2 - 0.55, 1.93, 0));
  P.push(part(box(0.75, 0.75, B - 0.05), body, L / 2 - 0.42, 1.25, 0));
  P.push(part(box(0.06, 0.45, B - 0.3), WINDOW, L / 2 - 0.04, 1.3, 0, 0, 0, 0.25));
  P.push(part(box(L - 1.1, 0.1, B + 0.02), col, -0.5, 1.5, 0));
  for (let x = -L / 2 + 0.5; x < L / 2 - 1.3; x += 0.75) P.push(part(box(0.42, 0.34, 0.04), WINDOW_LIT, x, 1.8, B / 2 + 0.01));
  P.push(part(box(0.45, 1.0, 0.04), shade(col, 0.8), L / 2 - 1.3, 1.1, B / 2 + 0.01));
  P.push(part(box(L - 1.4, 0.05, 0.75), col, -0.75, 2.12, B / 2 + 0.37, -0.2, 0, 0));
  for (const x of [-L / 2 + 0.55, L / 2 - 0.6]) for (const z of [-B / 2, B / 2]) P.push(part(cyl(0.28, 0.28, 0.2, 10), 0x1f1f22, x, 0.3, z, PI / 2, 0, 0));
  return P;
}
/** The fire lookout: a wooden cabin with windows all round on four tall stilts. */
function lookout(w: number, d: number): Part[] {
  const P: Part[] = [];
  const wood = 0x7a5232;
  const S = Math.min(w, d) - 0.6;
  for (const x of [-S / 2, S / 2]) for (const z of [-S / 2, S / 2]) P.push(part(box(0.18, 5.0, 0.18), wood, x, 2.5, z));
  for (const y of [1.5, 3.2]) {
    P.push(part(box(S, 0.1, 0.1), wood, 0, y, S / 2, 0, 0, 0.5));
    P.push(part(box(S, 0.1, 0.1), wood, 0, y, -S / 2, 0, 0, -0.5));
    P.push(part(box(0.1, 0.1, S), wood, S / 2, y, 0, 0.5, 0, 0));
    P.push(part(box(0.1, 0.1, S), wood, -S / 2, y, 0, -0.5, 0, 0));
  }
  P.push(part(box(S + 0.6, 0.2, S + 0.6), wood, 0, 5.05, 0));
  P.push(part(box(S + 0.2, 1.3, S + 0.2), 0xd9c9a0, 0, 5.8, 0));
  for (const z of [-(S + 0.2) / 2 - 0.02, (S + 0.2) / 2 + 0.02]) P.push(part(box(S - 0.1, 0.6, 0.04), WINDOW_LIT, 0, 5.95, z));
  P.push(part(cone((S + 0.9) * 0.75, 1.0, 4), 0x6a3a24, 0, 6.95, 0, 0, PI / 4, 0));
  return P;
}
function picnicTable(): Part[] {
  const w = 0x9a6a3e;
  return [
    part(box(0.95, 0.07, 0.55), w, 0, 0.72, 0),
    part(box(0.95, 0.06, 0.2), w, 0, 0.42, 0.45),
    part(box(0.95, 0.06, 0.2), w, 0, 0.42, -0.45),
    part(box(0.06, 0.75, 1.1), shade(w, 0.8), -0.38, 0.36, 0, 0.0, 0, 0),
    part(box(0.06, 0.75, 1.1), shade(w, 0.8), 0.38, 0.36, 0, 0.0, 0, 0),
  ];
}
function canoe(len: number, v: number): Part[] {
  const c = pick([0xd8342a, 0x3a8a5a, 0xe08a2a], v);
  const L = len - 0.4;
  return [
    part(box(L - 0.6, 0.35, 0.55), c, 0, 0.2, 0),
    part(cone(0.28, 0.6, 4), c, L / 2 - 0.05, 0.2, 0, 0, PI / 4, -PI / 2),
    part(cone(0.28, 0.6, 4), c, -L / 2 + 0.05, 0.2, 0, 0, PI / 4, PI / 2),
    part(box(L - 0.8, 0.04, 0.45), 0xd9b27a, 0, 0.38, 0),
    part(box(0.05, 0.05, 1.3), 0x9a6a3e, 0.2, 0.45, 0, 0, 0.5, 0),
  ];
}

export interface ModelSpec {
  geo: THREE.BufferGeometry;
  rotY: number;
}

/** Build the static geometry for an entity. Returns null for dynamic/animated entities. */
export function entityModel(type: EntType, w: number, h: number, v: number, orient: number, t: Theme): ModelSpec | null {
  let P: Part[] | null = null;
  let rotY = 0;
  // multi-cell buildings are authored along X with the front facing +Z.
  switch (type) {
    case 'house':
      P = t.id === 'ciudad' ? apartments(w, h, v, t) : t.id === 'estacion' ? brickHall(w, h, v, t) : t.id === 'puerto' ? fishShed(w, h, v, t) : t.id === 'nieve' ? chalet(w, h, v, t) : house(w, h, v, t);
      break;
    case 'church':
      P = t.id === 'puerto' ? lighthouse(w, h) : t.id === 'ciudad' ? theatre(w, h) : t.id === 'nieve' ? chapel(w, h) : t.id === 'camping' ? lookout(w, h) : church(w, h);
      break;
    case 'barn':
      P = barn(w, h);
      break;
    case 'stall':
      P = t.id === 'nieve' ? marketStall(w, h, v) : t.id === 'museo' ? vitrine(w, h, v) : stall(w, h, v);
      break;
    case 'churros':
      P = t.id === 'museo' ? counter(w, h, v) : stall(w, h, v, true);
      break;
    case 'warehouse':
      P = t.id === 'estacion' ? brickHall(w, h, v, t, true) : warehouse(w, h, v, t);
      break;
    case 'shop':
      P = shop(w, h);
      break;
    case 'cabin':
      P = cabin(w, h);
      break;
    case 'chiringuito':
      P = chiringuito(w, h);
      break;
    case 'fountain':
      P = t.id === 'museo' ? dinosaur(Math.max(w, h), Math.min(w, h)) : fountain(Math.min(w, h));
      rotY = t.id === 'museo' && h > w ? PI / 2 : 0;
      break;
    case 'car':
      P = t.id === 'nieve' ? snowmobile(v) : t.id === 'museo' ? forklift() : car(t.id === 'ciudad' && v % 3 !== 2 ? 3 : v);
      rotY = w >= h ? 0 : PI / 2;
      break;
    // ---- v2, entrega 2 ----
    case 'chalet':
      P = chalet(w, h, v, t);
      break;
    case 'wall':
      P = museumWall();
      break;
    case 'exit':
      P = exitDoor();
      break;
    case 'tent':
      P = tent(w, h, v);
      break;
    case 'rv':
      P = rv(Math.max(w, h), Math.min(w, h), v);
      rotY = w >= h ? 0 : PI / 2;
      break;
    // ---- v2 ----
    case 'boat':
      P = w * h > 30 ? ferry(Math.max(w, h), Math.min(w, h)) : t.id === 'camping' ? canoe(Math.max(w, h), v) : boat(Math.max(w, h), Math.min(w, h), v);
      rotY = w >= h ? 0 : PI / 2;
      break;
    case 'container':
      P = container(w, h, v);
      break;
    case 'crane':
      P = crane(w, h);
      break;
    case 'seapump':
      P = seapump();
      break;
    case 'post':
      P = t.id === 'ciudad' ? trafficLight() : t.id === 'estacion' ? railSignal() : t.id === 'nieve' ? liftPylon() : bollard();
      break;
    case 'tower':
      P = tower(w, h, v, t);
      break;
    case 'wagon':
      P = wagon(Math.max(w, h), Math.min(w, h), v);
      rotY = w >= h ? 0 : PI / 2;
      break;
    case 'canopy':
      P = canopy();
      break;
    case 'leak':
      P = gasPipe();
      break;
    case 'tree':
      P = t.id === 'nieve' ? snowTree(v, t) : t.id === 'museo' ? pottedPlant(v) : tree(v, t);
      rotY = v;
      break;
    case 'pine':
      P = t.id === 'nieve' ? snowPine(v) : pine(v);
      rotY = v;
      break;
    case 'palm':
      P = palm(v);
      rotY = v * 1.3;
      break;
    case 'hedge':
      P = t.id === 'museo' ? bookshelf(v) : hedge(v, t);
      rotY = orient ? 0 : PI / 2;
      break;
    case 'fence':
      P = t.id === 'nieve' ? skiRack(v) : fence();
      rotY = orient ? 0 : PI / 2;
      break;
    case 'hay':
      P = hay(v);
      rotY = (v % 4) * 0.4;
      break;
    case 'pallet':
      P = t.id === 'nieve' || t.id === 'camping' ? woodpile(v, t.id === 'nieve') : t.id === 'museo' ? crates(v) : pallet(v);
      rotY = t.id === 'nieve' || t.id === 'camping' ? 0 : (v % 3) * 0.1;
      break;
    case 'bench':
      P = t.id === 'camping' ? picnicTable() : bench();
      break;
    case 'rock':
      P = t.id === 'nieve' ? snowman() : rock(v);
      break;
    case 'hydrant':
      P = t.id === 'museo' ? hoseCabinet() : hydrant();
      break;
    case 'elec':
      P = elec();
      break;
    case 'lever':
      P = leverBase();
      break;
    case 'pump':
      P = pump();
      rotY = PI / 2;
      break;
    case 'umbrella':
      P = umbrella(v);
      break;
    case 'bonfire':
      P = bonfire();
      break;
    case 'lamp':
      P = lampPole();
      break;
    case 'cylinder':
      P = cylinder();
      break;
    default:
      return null;
  }
  return { geo: merge(P), rotY };
}

// ---------- fire truck ----------
export function truckGroup(): { group: THREE.Group; lights: THREE.Mesh[]; reel: THREE.Object3D } {
  const red = 0xd42b22;
  const P: Part[] = [
    part(box(3.3, 1.55, 1.85), red, -0.25, 1.15, 0),
    part(box(1.05, 1.35, 1.85), red, 1.45, 1.05, 0),
    part(box(0.06, 0.6, 1.6), 0x26384a, 1.98, 1.35, 0),
    part(box(0.8, 0.55, 0.06), 0x26384a, 1.5, 1.35, 0.93),
    part(box(0.8, 0.55, 0.06), 0x26384a, 1.5, 1.35, -0.93),
    part(box(4.35, 0.14, 1.9), WHITE, 0.0, 0.95, 0),
    part(box(4.4, 0.3, 1.7), 0x3a3a3e, 0, 0.35, 0),
    part(box(0.12, 0.25, 1.7), 0xbfbfbf, 2.02, 0.5, 0),
    part(box(0.05, 0.14, 0.28), 0xfff3c0, 2.0, 0.8, 0.65),
    part(box(0.05, 0.14, 0.28), 0xfff3c0, 2.0, 0.8, -0.65),
    // compartment doors
    part(box(0.9, 0.9, 0.03), 0xb82520, -1.3, 1.25, 0.94),
    part(box(0.9, 0.9, 0.03), 0xb82520, -0.3, 1.25, 0.94),
    part(box(0.9, 0.9, 0.03), 0xb82520, -1.3, 1.25, -0.94),
    part(box(0.9, 0.9, 0.03), 0xb82520, -0.3, 1.25, -0.94),
    // ladder on the roof
    part(box(3.2, 0.08, 0.08), 0xc9ccd0, -0.35, 2.05, 0.35),
    part(box(3.2, 0.08, 0.08), 0xc9ccd0, -0.35, 2.05, -0.35),
  ];
  for (let k = 0; k < 9; k++) P.push(part(box(0.05, 0.05, 0.72), 0xc9ccd0, -1.85 + k * 0.38, 2.05, 0));
  for (const x of [-1.35, -0.55, 1.35]) for (const z of [-0.88, 0.88]) P.push(part(cyl(0.36, 0.36, 0.26, 12), 0x1f1f22, x, 0.36, z, PI / 2, 0, 0));
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const body = new THREE.Mesh(merge(P), mat);
  body.castShadow = true;
  body.receiveShadow = true;
  const group = new THREE.Group();
  group.add(body);
  const lights: THREE.Mesh[] = [];
  for (const z of [-0.45, 0.45]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.3), new THREE.MeshBasicMaterial({ color: 0x2f7bff }));
    m.position.set(1.55, 1.82, z);
    group.add(m);
    lights.push(m);
  }
  const reel = new THREE.Mesh(merge([part(cyl(0.45, 0.45, 0.5, 12), 0xf2e6c8, 0, 0, 0, PI / 2, 0, 0), part(cyl(0.5, 0.5, 0.06, 12), 0x9a9a9a, 0, 0, 0.27, PI / 2, 0, 0), part(cyl(0.5, 0.5, 0.06, 12), 0x9a9a9a, 0, 0, -0.27, PI / 2, 0, 0)]), mat);
  reel.position.set(-1.95, 1.2, 0);
  group.add(reel);
  return { group, lights, reel };
}

// ---------- characters ----------
const SKIN = [0xf1c7a0, 0xd9a07a, 0xa9704a, 0xf5d2b5];
const SHIRTS = [0x3a76c8, 0xe25b5b, 0x3aa35a, 0xf2c43a, 0x9a5ac8, 0xf28a3a, 0x40b8b0];

export function characterMesh(type: EntType, v: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  let P: Part[] = [];
  switch (type) {
    case 'cat': {
      const c = pick([0xf28a2a, 0x3a3a3a, 0xe8e2d8], v);
      P = [
        part(box(0.42, 0.22, 0.2), c, 0, 0.28, 0),
        part(box(0.22, 0.2, 0.2), c, 0.26, 0.42, 0),
        part(cone(0.06, 0.12, 3), c, 0.28, 0.58, 0.06),
        part(cone(0.06, 0.12, 3), c, 0.28, 0.58, -0.06),
        part(box(0.05, 0.3, 0.05), c, -0.25, 0.45, 0, 0, 0, 0.4),
        part(box(0.02, 0.04, 0.04), DARK, 0.37, 0.45, 0.05),
        part(box(0.02, 0.04, 0.04), DARK, 0.37, 0.45, -0.05),
      ];
      for (const x of [-0.14, 0.14]) for (const z of [-0.07, 0.07]) P.push(part(box(0.05, 0.18, 0.05), c, x, 0.09, z));
      break;
    }
    case 'dog': {
      const c = pick([0x9a6a3e, 0xd9b27a, 0x3a3a3a], v);
      P = [
        part(box(0.6, 0.3, 0.28), c, 0, 0.42, 0),
        part(box(0.28, 0.26, 0.26), c, 0.36, 0.62, 0),
        part(box(0.14, 0.12, 0.16), 0x5a3a22, 0.54, 0.58, 0),
        part(box(0.05, 0.16, 0.1), 0x5a3a22, 0.32, 0.72, 0.15),
        part(box(0.05, 0.16, 0.1), 0x5a3a22, 0.32, 0.72, -0.15),
        part(box(0.06, 0.25, 0.06), c, -0.34, 0.6, 0, 0, 0, 0.6),
      ];
      for (const x of [-0.2, 0.2]) for (const z of [-0.1, 0.1]) P.push(part(box(0.08, 0.28, 0.08), c, x, 0.14, z));
      break;
    }
    case 'sheep': {
      P = [part(ico(0.34, 0), 0xf4f1ea, 0, 0.5, 0, 0, 0, 0, 1.25, 0.9, 1), part(ico(0.2, 0), 0xf4f1ea, 0.15, 0.72, 0.12), part(box(0.2, 0.22, 0.18), 0x2a2a2a, 0.42, 0.56, 0)];
      for (const x of [-0.18, 0.18]) for (const z of [-0.12, 0.12]) P.push(part(box(0.07, 0.3, 0.07), 0x2a2a2a, x, 0.15, z));
      break;
    }
    case 'goat': {
      const c = v % 2 ? 0xf1ece2 : 0x8a6a4a;
      P = [part(box(0.62, 0.32, 0.28), c, 0, 0.5, 0), part(box(0.22, 0.26, 0.2), c, 0.38, 0.72, 0), part(cone(0.04, 0.2, 4), 0x6a6a6a, 0.34, 0.92, 0.06, 0, 0, -0.5), part(cone(0.04, 0.2, 4), 0x6a6a6a, 0.34, 0.92, -0.06, 0, 0, -0.5), part(box(0.06, 0.12, 0.06), 0xd9d2c4, 0.45, 0.55, 0)];
      for (const x of [-0.2, 0.2]) for (const z of [-0.1, 0.1]) P.push(part(box(0.07, 0.36, 0.07), c, x, 0.18, z));
      break;
    }
    default: {
      // person / bystander (chibi); onlookers hold a phone up, neighbours carry a bucket, people at windows wave
      const shirt = pick(SHIRTS, v);
      const skin = pick(SKIN, v >> 1);
      const hair = pick([0x3a2a1e, 0x1f1f22, 0x8a5a2a, 0xd9b26a, 0x9a9a9a], v >> 2);
      P = [
        part(box(0.14, 0.5, 0.16), 0x3a4a6a, 0, 0.25, 0.1),
        part(box(0.14, 0.5, 0.16), 0x3a4a6a, 0, 0.25, -0.1),
        part(box(0.3, 0.5, 0.46), shirt, 0, 0.75, 0),
        part(box(0.12, 0.42, 0.12), shirt, 0, 0.78, 0.3, 0.2, 0, 0),
        part(box(0.12, 0.42, 0.12), shirt, 0, 0.78, -0.3, -0.2, 0, 0),
        part(sphere(0.26, 8, 6), skin, 0, 1.25, 0),
        part(sphere(0.27, 8, 4), hair, -0.04, 1.33, 0, 0, 0, 0, 1, 0.7, 1),
        part(box(0.02, 0.06, 0.05), DARK, 0.25, 1.26, 0.09),
        part(box(0.02, 0.06, 0.05), DARK, 0.25, 1.26, -0.09),
      ];
      if (type === 'onlooker') P.push(part(box(0.06, 0.2, 0.12), 0x1f1f22, 0.3, 1.2, 0.22), part(box(0.1, 0.36, 0.1), shirt, 0.18, 1.05, 0.25, 0, 0, 0.9));
      if (type === 'neighbor') P.push(part(cyl(0.16, 0.12, 0.3, 8), 0x2f7bd8, 0.1, 0.55, 0.38), part(box(0.02, 0.2, 0.26), 0x9a9aa0, 0.1, 0.78, 0.38));
      if (type === 'window') P.push(part(box(0.12, 0.45, 0.12), shirt, 0, 1.45, 0.34, 0.5, 0, 0));
    }
  }
  const m = new THREE.Mesh(merge(P), mat);
  m.castShadow = true;
  g.add(m);
  return g;
}

// ---------- the firefighter ----------
export interface HeroRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  head: THREE.Object3D;
  nozzle: THREE.Object3D;
  tint: THREE.MeshLambertMaterial;
}

/** Colours of a firefighter: the player (navy with a red helmet) or the partner from the crew. */
export interface HeroPalette {
  suit: number;
  stripe: number;
  helmet: number;
}
export const PLAYER_PALETTE: HeroPalette = { suit: 0x243a5e, stripe: 0xf5e23a, helmet: 0xd8342a };
export const PARTNER_PALETTE: HeroPalette = { suit: 0x7a2e1e, stripe: 0xf5e23a, helmet: 0xf2c21a };

export function heroRig(pal: HeroPalette = PLAYER_PALETTE): HeroRig {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const navy = pal.suit;
  const stripe = pal.stripe;
  const mk = (P: Part[]) => {
    const m = new THREE.Mesh(merge(P), mat);
    m.castShadow = true;
    return m;
  };
  const root = new THREE.Group();
  const hips = new THREE.Group();
  root.add(hips);
  const leg = () => {
    const g = new THREE.Group();
    g.add(mk([part(box(0.2, 0.42, 0.22), navy, 0, -0.21, 0), part(box(0.22, 0.06, 0.24), stripe, 0, -0.28, 0), part(box(0.24, 0.16, 0.3), 0x1f1f22, 0.04, -0.46, 0)]));
    return g;
  };
  const legL = leg();
  legL.position.set(0, 0.54, 0.13);
  const legR = leg();
  legR.position.set(0, 0.54, -0.13);
  hips.add(legL, legR);
  const torso = new THREE.Group();
  torso.position.set(0, 0.54, 0);
  hips.add(torso);
  torso.add(
    mk([
      part(box(0.42, 0.52, 0.56), navy, 0, 0.3, 0),
      part(box(0.44, 0.07, 0.58), stripe, 0, 0.18, 0),
      part(box(0.44, 0.07, 0.58), 0xd9d9d9, 0, 0.26, 0),
      part(box(0.44, 0.1, 0.58), 0x1f1f22, 0, 0.05, 0),
      // air tank on the back
      part(cyl(0.12, 0.12, 0.5, 8), 0xf2c21a, -0.3, 0.32, 0),
      part(box(0.05, 0.3, 0.3), 0x3a3a3a, -0.22, 0.32, 0),
    ]),
  );
  const head = new THREE.Group();
  head.position.set(0, 0.82, 0);
  torso.add(head);
  head.add(
    mk([
      part(sphere(0.27, 10, 8), 0xf1c7a0, 0, 0, 0),
      part(box(0.02, 0.08, 0.06), DARK, 0.26, 0.02, 0.09),
      part(box(0.02, 0.08, 0.06), DARK, 0.26, 0.02, -0.09),
      part(box(0.02, 0.02, 0.12), 0xc0705a, 0.26, -0.1, 0),
      // helmet
      part(sphere(0.31, 10, 6, ), pal.helmet, 0, 0.08, 0, 0, 0, 0, 1, 0.8, 1),
      part(cyl(0.4, 0.42, 0.05, 12), pal.helmet, -0.04, 0.02, 0),
      part(box(0.05, 0.22, 0.16), 0xf5e23a, 0.3, 0.2, 0),
      part(box(0.36, 0.05, 0.08), 0xb82520, 0, 0.36, 0),
    ]),
  );
  const arm = (side: number) => {
    const g = new THREE.Group();
    g.add(mk([part(box(0.14, 0.14, 0.42), navy, 0.0, 0, side * 0.12), part(box(0.15, 0.06, 0.15), stripe, 0, 0, side * 0.26), part(box(0.16, 0.16, 0.16), 0x2a2a2a, 0.05, 0, side * 0.34)]));
    return g;
  };
  const armL = arm(1);
  armL.position.set(0.12, 0.45, 0.2);
  const armR = arm(-1);
  armR.position.set(0.12, 0.45, -0.2);
  torso.add(armL, armR);
  const nozzle = new THREE.Group();
  nozzle.position.set(0.32, 0.42, 0);
  nozzle.add(mk([part(cyl(0.06, 0.07, 0.5, 8), 0xc0c4c8, 0.2, 0, 0, 0, 0, PI / 2), part(cyl(0.09, 0.06, 0.12, 8), 0xd4a93a, 0.48, 0, 0, 0, 0, PI / 2), part(box(0.1, 0.12, 0.05), 0x2a2a2a, 0.05, -0.1, 0)]));
  torso.add(nozzle);
  root.scale.setScalar(1.12);
  return { root, hips, torso, legL, legR, armL, armR, head, nozzle, tint: mat };
}

export function leverHandle(): THREE.Mesh {
  const m = new THREE.Mesh(
    merge([part(box(0.06, 0.45, 0.06), 0x5a5a5a, 0, 0.22, 0), part(sphere(0.09, 8, 6), 0xd8342a, 0, 0.46, 0)]),
    new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }),
  );
  m.castShadow = true;
  return m;
}

// ---------- v2: moving things ----------
const mk = (P: Part[]) => {
  const m = new THREE.Mesh(merge(P), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  m.castShadow = true;
  return m;
};

/** A train `len` cells long along +x (front at x = 0, the rest behind it towards -x). */
export function trainGroup(len: number, freight: boolean): THREE.Group {
  const g = new THREE.Group();
  const B = 1.7;
  const P: Part[] = [];
  // locomotive
  const loco = freight ? 0xd8433a : 0x2f6fb5;
  P.push(part(box(3.2, 0.35, B), 0x2b2b30, -1.6, 0.55, 0));
  P.push(part(box(3.0, 1.9, B - 0.1), loco, -1.7, 1.7, 0));
  P.push(part(box(0.9, 1.2, B - 0.05), 0xf2c21a, -0.35, 1.3, 0));
  P.push(part(box(0.06, 0.6, B - 0.5), WINDOW_LIT, -0.2, 2.2, 0));
  P.push(part(box(0.1, 0.18, 0.3), 0xfff3c0, 0.02, 1.1, 0.5), part(box(0.1, 0.18, 0.3), 0xfff3c0, 0.02, 1.1, -0.5));
  for (const x of [-0.7, -2.6]) for (const z of [-B / 2 + 0.1, B / 2 - 0.1]) P.push(part(cyl(0.34, 0.34, 0.12, 10), 0x1f1f22, x, 0.36, z, PI / 2, 0, 0));
  // carriages
  let x = -3.3;
  let k = 0;
  while (-x < len - 0.5) {
    const L = Math.min(3.4, len + x);
    const c = freight ? pick([0x8a3a2a, 0x3a5a8a, 0x6a6a3a, 0xc8452e], k) : 0xd9dde3;
    P.push(part(box(L - 0.2, 0.3, B), 0x2b2b30, x - L / 2, 0.55, 0));
    P.push(part(box(L - 0.25, 1.8, B - 0.1), c, x - L / 2, 1.6, 0));
    if (!freight) {
      P.push(part(box(L - 0.25, 0.25, B - 0.08), 0x2f6fb5, x - L / 2, 1.0, 0));
      for (let wx = x - 0.5; wx > x - L + 0.4; wx -= 0.7) for (const z of [-B / 2 + 0.03, B / 2 - 0.03]) P.push(part(box(0.45, 0.45, 0.05), WINDOW_LIT, wx, 1.9, z));
    }
    for (const wx of [x - 0.5, x - L + 0.5]) for (const z of [-B / 2 + 0.1, B / 2 - 0.1]) P.push(part(cyl(0.3, 0.3, 0.1, 10), 0x1f1f22, wx, 0.32, z, PI / 2, 0, 0));
    x -= L;
    k++;
  }
  g.add(mk(P));
  return g;
}

/** The pick-ups on the ground: each one a small, readable object. */
export function powerModel(kind: string): THREE.Group {
  const g = new THREE.Group();
  let P: Part[];
  switch (kind) {
    case 'turbo':
      P = [part(cyl(0.22, 0.22, 0.5, 10), 0x2f7bd8, 0, 0.25, 0), part(cyl(0.1, 0.1, 0.18, 8), 0x9aa3a8, 0, 0.58, 0), part(box(0.12, 0.3, 0.03), 0xf2c21a, 0, 0.3, 0.22, 0, 0, 0.4)];
      break;
    case 'boots':
      P = [part(box(0.22, 0.42, 0.24), 0xd8342a, -0.04, 0.3, 0), part(box(0.42, 0.14, 0.26), 0xd8342a, 0.07, 0.07, 0), part(box(0.24, 0.05, 0.27), 0xf5e23a, -0.04, 0.4, 0)];
      break;
    case 'clock':
      P = [part(cyl(0.3, 0.3, 0.1, 14), 0xf2c21a, 0, 0.35, 0, PI / 2, 0, 0), part(cyl(0.24, 0.24, 0.11, 14), WHITE, 0, 0.35, 0.01, PI / 2, 0, 0), part(box(0.03, 0.18, 0.02), DARK, 0, 0.42, 0.07), part(box(0.1, 0.1, 0.06), 0xf2c21a, 0, 0.7, 0)];
      break;
    case 'extinguisher':
      P = [part(cyl(0.15, 0.15, 0.55, 10), 0xd8342a, 0, 0.28, 0), part(sphere(0.15, 10, 4), 0xd8342a, 0, 0.56, 0), part(box(0.2, 0.06, 0.06), 0x2b2b30, 0.05, 0.72, 0), part(cyl(0.03, 0.03, 0.3, 5), 0x2b2b30, 0.15, 0.55, 0, 0, 0, 0.8)];
      break;
    case 'suit':
      P = [part(box(0.4, 0.45, 0.22), 0xc9ccd0, 0, 0.3, 0), part(sphere(0.18, 8, 6), 0xc9ccd0, 0, 0.66, 0), part(box(0.22, 0.1, 0.05), 0xf2c21a, 0, 0.66, 0.15), part(box(0.42, 0.06, 0.24), 0xf5e23a, 0, 0.25, 0)];
      break;
    default: // heli
      P = [part(sphere(0.2, 8, 6), 0xd8342a, 0, 0.35, 0, 0, 0, 0, 1.4, 0.9, 1), part(box(0.5, 0.06, 0.06), 0xd8342a, -0.35, 0.38, 0), part(box(0.7, 0.03, 0.06), DARK, 0, 0.58, 0), part(box(0.06, 0.03, 0.7), DARK, 0, 0.58, 0)];
  }
  g.add(mk(P));
  return g;
}

/** Fire-fighting helicopter (red, with the water bucket hanging under it). The rotor is `rotor`. */
export function heliModel(): { group: THREE.Group; rotor: THREE.Object3D; bucket: THREE.Object3D } {
  const g = new THREE.Group();
  g.add(
    mk([
      part(sphere(0.8, 10, 8), 0xd8342a, 0, 0, 0, 0, 0, 0, 1.5, 0.9, 1),
      part(box(2.4, 0.25, 0.25), 0xd8342a, -1.9, 0.2, 0),
      part(box(0.15, 0.7, 0.5), 0xd8342a, -3.0, 0.45, 0),
      part(sphere(0.5, 8, 6), WINDOW_LIT, 0.7, 0.2, 0, 0, 0, 0, 1, 0.8, 1.2),
      part(box(1.6, 0.06, 0.08), 0x3a3a3a, 0, -0.85, 0.5),
      part(box(1.6, 0.06, 0.08), 0x3a3a3a, 0, -0.85, -0.5),
      part(box(0.2, 0.2, 0.9), WHITE, 0.2, -0.1, 0),
    ]),
  );
  const rotor = mk([part(box(5.2, 0.05, 0.3), 0x2b2b30, 0, 0, 0), part(box(0.3, 0.05, 5.2), 0x2b2b30, 0, 0, 0), part(cyl(0.12, 0.12, 0.4, 6), 0x2b2b30, 0, -0.2, 0)]);
  rotor.position.set(0, 0.95, 0);
  g.add(rotor);
  const bucket = mk([part(cyl(0.02, 0.02, 1.8, 4), 0x2b2b30, 0, 0.9, 0), part(cyl(0.45, 0.35, 0.6, 10), 0xf2c21a, 0, 0, 0)]);
  bucket.position.set(0, -2.8, 0);
  g.add(bucket);
  return { group: g, rotor, bucket };
}

/** The crew's drone: four rotors and a small water tank. */
export function droneModel(): THREE.Group {
  const g = new THREE.Group();
  const P: Part[] = [part(box(0.5, 0.14, 0.5), 0x2b2b30, 0, 0, 0), part(cyl(0.16, 0.16, 0.2, 8), 0x3fb6ff, 0, -0.16, 0)];
  for (const [x, z] of [
    [0.4, 0.4],
    [-0.4, 0.4],
    [0.4, -0.4],
    [-0.4, -0.4],
  ]) {
    P.push(part(box(0.5, 0.05, 0.06), 0x5a5a5a, x / 2, 0, z / 2, 0, Math.atan2(z, x), 0));
    P.push(part(cyl(0.22, 0.22, 0.03, 10), 0xf2c21a, x, 0.08, z));
  }
  g.add(mk(P));
  return g;
}

/** A work of art (museum), by variant: a painting on its easel, a bronze bust on a pedestal or a porcelain vase. */
export function artModel(v: number): THREE.Group {
  const g = new THREE.Group();
  const kind = v % 3;
  let P: Part[];
  if (kind === 0) {
    const wood = 0x6e4527;
    const pal = [
      [0x7fb2e5, 0x5a9a4a, 0xf2c21a],
      [0xe8a23a, 0xc0452e, 0x3a4a8a],
      [0x2f6a8a, 0xe8dcc0, 0x8a2a2a],
      [0x3a2a5a, 0xd9b04a, 0xf4f1ea],
    ][(v >> 2) % 4];
    P = [
      part(box(0.05, 1.5, 0.05), wood, -0.32, 0.72, 0.08, 0.12, 0, 0.12),
      part(box(0.05, 1.5, 0.05), wood, 0.32, 0.72, 0.08, 0.12, 0, -0.12),
      part(box(0.05, 1.5, 0.05), wood, 0, 0.72, -0.28, -0.3, 0, 0),
      part(box(0.8, 0.06, 0.1), wood, 0, 0.8, 0.14),
      part(box(1.0, 0.8, 0.07), 0xd9b04a, 0, 1.25, 0.12, -0.12, 0, 0),
      part(box(0.84, 0.34, 0.08), pal[0], 0, 1.4, 0.13, -0.12, 0, 0),
      part(box(0.84, 0.3, 0.08), pal[1], 0, 1.08, 0.17, -0.12, 0, 0),
      part(sphere(0.09, 6, 4), pal[2], 0.22, 1.45, 0.19),
    ];
  } else if (kind === 1) {
    const bronze = (v >> 1) % 2 ? 0xb07a3a : 0xe8e4dc;
    P = [
      part(box(0.5, 0.95, 0.5), 0xece8e0, 0, 0.47, 0),
      part(box(0.58, 0.08, 0.58), 0xc9a54a, 0, 0.97, 0),
      part(box(0.5, 0.22, 0.26), bronze, 0, 1.12, 0),
      part(cyl(0.08, 0.1, 0.16, 6), bronze, 0, 1.28, 0),
      part(sphere(0.17, 8, 6), bronze, 0, 1.46, 0.02),
    ];
  } else {
    const blue = (v >> 1) % 2 ? 0x2f5fa8 : 0x2f8a6a;
    P = [
      part(cyl(0.26, 0.3, 0.9, 8), 0xece8e0, 0, 0.45, 0),
      part(cyl(0.32, 0.32, 0.06, 8), 0xc9a54a, 0, 0.92, 0),
      part(sphere(0.26, 10, 8), blue, 0, 1.22, 0, 0, 0, 0, 1, 1.15, 1),
      part(cyl(0.27, 0.27, 0.08, 10), WHITE, 0, 1.2, 0),
      part(cyl(0.1, 0.14, 0.25, 8), blue, 0, 1.55, 0),
      part(cyl(0.15, 0.1, 0.05, 8), 0xd9b04a, 0, 1.68, 0),
    ];
  }
  g.add(mk(P));
  return g;
}

/** Ice over a frozen hydrant (the ski lodge): gone once the player has chipped it off. */
export function iceCap(): THREE.Mesh {
  const g = merge([part(box(0.62, 0.95, 0.62), 0xd6f0ff, 0, 0.47, 0), part(cone(0.07, 0.35, 4), 0xeaf8ff, 0.2, 0.8, 0.33, PI, 0, 0), part(cone(0.06, 0.3, 4), 0xeaf8ff, -0.15, 0.82, 0.33, PI, 0, 0), part(box(0.7, 0.12, 0.7), WHITE, 0, 0.98, 0)]);
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.78, flatShading: true }));
  return m;
}

/** Rescue dog vest (red with a white cross), to put on the dog model. */
export function dogVest(): THREE.Mesh {
  return mk([part(box(0.4, 0.2, 0.32), 0xd8342a, 0, 0.5, 0), part(box(0.2, 0.05, 0.04), WHITE, 0, 0.61, 0), part(box(0.05, 0.05, 0.2), WHITE, 0, 0.61, 0)]);
}

/** The aerial platform that goes up to a window: a basket on a scissor lift (scaled in y by the view). */
export function platformModel(): { base: THREE.Mesh; lift: THREE.Mesh; basket: THREE.Mesh } {
  const base = mk([part(box(0.9, 0.12, 0.9), 0xf2c21a, 0, 0.06, 0), part(box(0.8, 0.04, 0.05), DARK, 0, 0.13, 0.3), part(box(0.8, 0.04, 0.05), DARK, 0, 0.13, -0.3)]);
  const lift = mk([part(box(0.08, 1, 0.08), 0xd9d2c4, 0, 0.5, 0.25, 0, 0, 0.35), part(box(0.08, 1, 0.08), 0xd9d2c4, 0, 0.5, 0.25, 0, 0, -0.35), part(box(0.08, 1, 0.08), 0xd9d2c4, 0, 0.5, -0.25, 0, 0, 0.35), part(box(0.08, 1, 0.08), 0xd9d2c4, 0, 0.5, -0.25, 0, 0, -0.35)]);
  const basket = mk([part(box(0.9, 0.08, 0.8), 0xf2c21a, 0, 0, 0), part(box(0.9, 0.35, 0.05), 0xf2c21a, 0, 0.2, 0.38), part(box(0.9, 0.35, 0.05), 0xf2c21a, 0, 0.2, -0.38), part(box(0.05, 0.35, 0.8), 0xf2c21a, 0.43, 0.2, 0)]);
  return { base, lift, basket };
}
