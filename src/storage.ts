import type { Owned, UpgradeLevels } from './economy';
import type { Lang } from './sim/types';

export interface Settings {
  sfx: boolean;
  music: boolean;
  vibration: boolean;
  /** legacy field from v1 builds, ignored */
  quality?: 'high' | 'low';
  gfx: 'auto' | 'high' | 'medium' | 'low';
  /** last tier chosen by the automatic mode on this device */
  autoTier: 'high' | 'medium' | 'low' | null;
  lang: Lang | null;
  /** anonymous gameplay statistics (opt-out) */
  stats?: boolean;
}
export interface DailyRecord {
  score: number;
  stars: number;
  saved: number;
  time: number;
  win: boolean;
}
/** Ad frequency bookkeeping (see src/monetize/index.ts). */
export interface AdCounters {
  /** day (yyyy-mm-dd) of the free-coins claims and how many were claimed that day */
  freeDay: string;
  freeClaims: number;
  /** Date.now() of the last interstitial */
  lastInterstitial: number;
  /** level ends in total and since the last interstitial */
  levelEnds: number;
  sinceInterstitial: number;
}
export interface Save {
  v: 1;
  stars: Record<string, number>;
  best: Record<string, number>;
  daily: Record<string, DailyRecord>;
  streak: { count: number; last: string };
  settings: Settings;
  tutorialDone: boolean;
  firstOpen: boolean;
  seenTips: string[];
  coins: number;
  upgrades: UpgradeLevels;
  /** non-consumable purchases */
  owned: Owned;
  ads: AdCounters;
  /** the one-time starter pack offer was shown */
  starterOffered: boolean;
}

const KEY = 'apagalo.v1';

function fresh(): Save {
  return {
    v: 1,
    stars: {},
    best: {},
    daily: {},
    streak: { count: 0, last: '' },
    settings: { sfx: true, music: true, vibration: true, gfx: 'auto', autoTier: null, lang: null, stats: true },
    tutorialDone: false,
    firstOpen: true,
    seenTips: [],
    coins: 0,
    upgrades: { hose: 0, power: 0, speed: 0, time: 0 },
    owned: { remove_ads: false, starter_pack: false },
    ads: { freeDay: '', freeClaims: 0, lastInterstitial: 0, levelEnds: 0, sinceInterstitial: 0 },
    starterOffered: false,
  };
}

/** Fills in what older saves (or the portal copy from an older version) do not have. */
function normalize(s: Partial<Save>): Save {
  const f = fresh();
  return {
    ...f,
    ...s,
    settings: { ...f.settings, ...s.settings },
    upgrades: { ...f.upgrades, ...s.upgrades },
    owned: { ...f.owned, ...s.owned },
    ads: { ...f.ads, ...s.ads },
    coins: Number.isFinite(s.coins) ? Math.max(0, Math.floor(s.coins!)) : 0,
  };
}

let mem: Save = fresh();

export function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) mem = normalize(JSON.parse(raw) as Partial<Save>);
  } catch {
    /* private mode or blocked storage: keep in memory */
  }
  return mem;
}

/** Portal-provided key/value store (CrazyGames SDK Data module: local for guests, cloud once logged in). */
export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
let cloud: KV | null = null;

/**
 * Switch the save to the portal store. The portal copy wins if it exists (it may come from another
 * device); otherwise the local save is copied into it. Mutates the live save object in place so
 * every reference held elsewhere stays valid. Returns true when the loaded progress changed.
 */
export function useCloud(kv: KV): boolean {
  cloud = kv;
  let raw: string | null = null;
  try {
    raw = kv.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw) {
    try {
      const merged = normalize(JSON.parse(raw) as Partial<Save>);
      const before = JSON.stringify(mem);
      Object.assign(mem, merged, { settings: mem.settings });
      Object.assign(mem.settings, merged.settings);
      try {
        localStorage.setItem(KEY, JSON.stringify(mem));
      } catch {
        /* ignore */
      }
      return JSON.stringify(mem) !== before;
    } catch {
      /* unreadable portal copy: keep the local save and overwrite it below */
    }
  }
  save();
  return false;
}

export function save() {
  const raw = JSON.stringify(mem);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    /* ignore */
  }
  try {
    cloud?.setItem(KEY, raw);
  } catch {
    /* the portal store must never break the game */
  }
}

export function data(): Save {
  return mem;
}

/** Clears the progress (stars, records, coins, upgrades). Settings, purchases and ad counters stay. */
export function reset() {
  const { settings, owned, ads, starterOffered } = mem;
  mem = { ...fresh(), settings, owned, ads, starterOffered, firstOpen: false };
  save();
}

export function totalStars(): number {
  return Object.values(mem.stars).reduce((a, b) => a + b, 0);
}
