import type { ThemeId } from '../sim/types';

export interface Theme {
  sky: number;
  fog: number;
  fogNear: number;
  fogFar: number;
  sun: number;
  sunI: number;
  sunDir: [number, number, number];
  hemiSky: number;
  hemiGround: number;
  hemiI: number;
  outside: number;
  outsideNorthWater?: boolean;
  grass: [string, string];
  dry: [string, string];
  leaves: [string, string, string];
  dirt: string;
  road: string;
  stone: [string, string];
  concrete: string;
  sand: string;
  water: string;
  wood: string;
  foliage: number[];
  trunk: number;
  wall: number[];
  roof: number[];
  night: boolean;
  fireLight: number;
}

const DAY = {
  sky: 0x9fd4f0,
  fog: 0xbfe3f2,
  fogNear: 40,
  fogFar: 95,
  sun: 0xfff1d6,
  sunI: 2.1,
  sunDir: [-0.55, 1, 0.45] as [number, number, number],
  hemiSky: 0xcfeaff,
  hemiGround: 0x6d7f4a,
  hemiI: 1.15,
  night: false,
  fireLight: 1,
};

export const THEMES: Record<ThemeId, Theme> = {
  plaza: {
    ...DAY,
    outside: 0x8fb45a,
    grass: ['#7fb24e', '#6aa041'],
    dry: ['#c9b35a', '#b39b45'],
    leaves: ['#b57b3c', '#d49a45', '#9a5a2e'],
    dirt: '#b69468',
    road: '#5c6068',
    stone: ['#e7d8bd', '#d9c7a6'],
    concrete: '#c9c6bd',
    sand: '#e9d6a8',
    water: '#46a9d6',
    wood: '#b07a48',
    foliage: [0x5fa344, 0x4f9440, 0x74b34d],
    trunk: 0x7a5231,
    wall: [0xf6efe2, 0xf3e1c3, 0xefd9b8],
    roof: [0xc9603a, 0xb85434, 0xd4724a],
  },
  granja: {
    ...DAY,
    sky: 0xf6cf96,
    fog: 0xf3d5a6,
    sun: 0xffd29a,
    sunI: 2.3,
    sunDir: [-0.9, 0.75, 0.35],
    hemiSky: 0xffe2b8,
    hemiGround: 0x8a7440,
    hemiI: 1.0,
    outside: 0xb7a452,
    grass: ['#9fb54e', '#8aa343'],
    dry: ['#d8bd62', '#c6a94f'],
    leaves: ['#b57b3c', '#d49a45', '#9a5a2e'],
    dirt: '#b98d5c',
    road: '#5c6068',
    stone: ['#e0cfb0', '#d3bf9c'],
    concrete: '#c9c6bd',
    sand: '#e9d6a8',
    water: '#4aa3c6',
    wood: '#a8733f',
    foliage: [0x6f9c3c, 0x86a843, 0x5d8a36],
    trunk: 0x6e4a2c,
    wall: [0xf3e6cf, 0xefe0c4],
    roof: [0x9c4a33, 0x7e5a3c],
  },
  gasolinera: {
    ...DAY,
    sky: 0xa8dcf5,
    outside: 0x98b85c,
    grass: ['#86b551', '#74a346'],
    dry: ['#ccb85e', '#b8a24b'],
    leaves: ['#b57b3c', '#d49a45', '#9a5a2e'],
    dirt: '#b69468',
    road: '#4f535b',
    stone: ['#e3d6be', '#d6c7aa'],
    concrete: '#d2d0c8',
    sand: '#e9d6a8',
    water: '#46a9d6',
    wood: '#b07a48',
    foliage: [0x5fa344, 0x4f9440, 0x74b34d],
    trunk: 0x7a5231,
    wall: [0xf4f1ea, 0xece6da],
    roof: [0xc9603a, 0x3f78b8],
  },
  poligono: {
    ...DAY,
    sky: 0xb9c6cf,
    fog: 0xc3ccd2,
    sun: 0xf1eee6,
    sunI: 1.6,
    sunDir: [-0.3, 1, 0.6],
    hemiSky: 0xdce4ea,
    hemiGround: 0x767a6a,
    hemiI: 1.35,
    outside: 0xa9a56a,
    grass: ['#8fa55a', '#7d944f'],
    dry: ['#bfae6a', '#aa9859'],
    leaves: ['#b57b3c', '#d49a45', '#9a5a2e'],
    dirt: '#a58c6c',
    road: '#50545b',
    stone: ['#d9d4c8', '#cbc5b7'],
    concrete: '#bdbcb6',
    sand: '#e9d6a8',
    water: '#4d95b8',
    wood: '#a97a4d',
    foliage: [0x5e8a44, 0x4e7a3c],
    trunk: 0x6a4d33,
    wall: [0x8fa3b3, 0xb8c2c9, 0x9aa7ad],
    roof: [0x5e6b75, 0x6f7a82],
  },
  castanar: {
    ...DAY,
    sky: 0xf1c7a1,
    fog: 0xe9c6a4,
    fogNear: 30,
    fogFar: 80,
    sun: 0xffd0a0,
    sunI: 2.0,
    sunDir: [-0.7, 0.8, 0.2],
    hemiSky: 0xffdcc0,
    hemiGround: 0x7a5236,
    hemiI: 1.05,
    outside: 0x9a6a3a,
    grass: ['#9aa84e', '#879443'],
    dry: ['#c9a257', '#b88f48'],
    leaves: ['#b8743a', '#d69440', '#9c4f28'],
    dirt: '#a78158',
    road: '#55575c',
    stone: ['#d6cbb6', '#c7baa2'],
    concrete: '#c9c6bd',
    sand: '#e9d6a8',
    water: '#3f9bb8',
    wood: '#9e6d3f',
    foliage: [0xd9822b, 0xe6a531, 0xc4562a, 0xb9a23a],
    trunk: 0x5c3d27,
    wall: [0x8a5a36, 0x7b4f2f],
    roof: [0x4f6b3a, 0x5b4a3a],
  },
  sanjuan: {
    sky: 0x0d1733,
    fog: 0x121c3a,
    fogNear: 30,
    fogFar: 85,
    sun: 0xaabfff,
    sunI: 0.95,
    sunDir: [0.4, 1, -0.5],
    hemiSky: 0x6070b0,
    hemiGround: 0x3a3246,
    hemiI: 1.05,
    outside: 0x4a4a5a,
    outsideNorthWater: true,
    grass: ['#5f7a45', '#52703d'],
    dry: ['#a8955a', '#94834c'],
    leaves: ['#8a5a30', '#a87038', '#6e4424'],
    dirt: '#8a7258',
    road: '#3d4048',
    stone: ['#b9ad98', '#aa9e88'],
    concrete: '#9d9a94',
    sand: '#d8c18f',
    water: '#1d4f7a',
    wood: '#9a6a40',
    foliage: [0x3f7a3f, 0x4a8a44],
    trunk: 0x6a4a30,
    wall: [0xf0e6d6, 0xe8dcc8],
    roof: [0xb8573a, 0xa24c34],
    night: true,
    fireLight: 2.2,
  },
};

/** Night variant for the daily "night shift" modifier. */
export function nightOf(t: Theme): Theme {
  if (t.night) return t;
  return {
    ...t,
    sky: 0x0e1834,
    fog: 0x131d3b,
    sun: 0xaabfff,
    sunI: 0.9,
    hemiSky: 0x6070b0,
    hemiGround: 0x3a3246,
    hemiI: 1.0,
    night: true,
    fireLight: 2.2,
  };
}
