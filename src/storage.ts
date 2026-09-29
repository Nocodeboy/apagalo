import type { Owned, UpgradeLevels } from './economy';
import { migrate } from './progress';
import { CREW_IDS, type CrewId, type Lang } from './sim/types';

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
  /** Date.now() of the free-coins claims in the last 24 h (at most 3, oldest first): a changed clock or date cannot give more */
  freeTimes: number[];
  /** Date.now() of the last interstitial */
  lastInterstitial: number;
  /** Date.now() of the last full-screen ad of any kind (interstitial or rewarded): the interstitial gap counts from it */
  lastFullscreen: number;
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
  /** Date.now() of the last daily-challenge rewards (at most 3): at most 3 per rolling 24 h whatever the date says */
  dailyTimes: number[];
  /** store purchase tokens already granted (newest last), so a purchase is never granted twice */
  iapTokens: string[];
  // ---- v2 (docs/diseno-v2.md §5.9) ----
  /** version of the route whose levels were opened for this save (src/progress.ts) */
  route: number;
  /** id of the furthest open level at the last save: a route change keeps everything up to it open */
  reach: string;
  /** levels opened by a route change (inserted behind the point the player had reached) */
  open: string[];
  /** crew hired (level 1-3, 0 = not hired) and who goes to the levels, in order */
  crew: Record<CrewId, number>;
  team: CrewId[];
  /** newspaper front pages won (big fires), by level id. The photo lives apart (src/ui/frontpage.ts) */
  pages: Record<string, FrontPage>;
  /** "what's new" notice seen for this version (2 = 2.0) */
  whatsNew: number;
}
export interface FrontPage {
  /** Date.now() when it was won */
  t: number;
  stars: number;
  saved: number;
  score: number;
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
    ads: { freeDay: '', freeClaims: 0, freeTimes: [], lastInterstitial: 0, lastFullscreen: 0, levelEnds: 0, sinceInterstitial: 0 },
    starterOffered: false,
    dailyTimes: [],
    iapTokens: [],
    route: 0,
    reach: '',
    open: [],
    crew: { partner: 0, dog: 0, drone: 0 },
    team: [],
    pages: {},
    whatsNew: 0,
  };
}

const nums = (a: unknown): number[] => (Array.isArray(a) ? a.filter((x): x is number => Number.isFinite(x)) : []);
const strs = (a: unknown): string[] => (Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string' && x !== '') : []);

const lvl = (n: unknown) => (Number.isFinite(n) ? Math.max(0, Math.min(3, Math.floor(n as number))) : 0);
function pages(p: unknown): Record<string, FrontPage> {
  const out: Record<string, FrontPage> = {};
  if (!p || typeof p !== 'object') return out;
  for (const [k, v] of Object.entries(p as Record<string, Partial<FrontPage>>)) if (v && Number.isFinite(v.t)) out[k] = { t: Number(v.t), stars: Number(v.stars) || 0, saved: Number(v.saved) || 0, score: Number(v.score) || 0 };
  return out;
}

/** Fills in what older saves (or the portal copy from an older version) do not have, and applies route changes. */
function normalize(s: Partial<Save>): Save {
  const out = fill(s);
  migrate(out);
  return out;
}

function fill(s: Partial<Save>): Save {
  const f = fresh();
  const ads = { ...f.ads, ...s.ads };
  const crew = (s.crew ?? {}) as Partial<Record<CrewId, number>>;
  return {
    ...f,
    ...s,
    settings: { ...f.settings, ...s.settings },
    upgrades: { ...f.upgrades, ...s.upgrades },
    owned: { ...f.owned, ...s.owned },
    // saves from 1.3.0 only had lastInterstitial
    ads: { ...ads, freeTimes: nums(ads.freeTimes), lastFullscreen: Math.max(Number(ads.lastFullscreen) || 0, Number(ads.lastInterstitial) || 0) },
    coins: Number.isFinite(s.coins) ? Math.max(0, Math.floor(s.coins!)) : 0,
    dailyTimes: nums(s.dailyTimes),
    iapTokens: strs(s.iapTokens),
    route: Number.isFinite(s.route) ? Number(s.route) : 0,
    reach: typeof s.reach === 'string' ? s.reach : '',
    open: strs(s.open),
    crew: Object.fromEntries(CREW_IDS.map((id) => [id, lvl(crew[id])])) as Record<CrewId, number>,
    team: strs(s.team).filter((id): id is CrewId => (CREW_IDS as string[]).includes(id)),
    pages: pages(s.pages),
    whatsNew: Number.isFinite(s.whatsNew) ? Number(s.whatsNew) : 0,
  };
}

let mem: Save = normalize({});

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

/**
 * Clears the progress (stars, records, coins, upgrades): bought coins are lost too (the settings screen says so).
 * Settings, non-consumable purchases, ad counters, claim limits and granted purchase tokens stay.
 */
export function reset() {
  const { settings, owned, ads, starterOffered, dailyTimes, iapTokens } = mem;
  mem = normalize({ ...fresh(), settings, owned, ads, starterOffered, dailyTimes, iapTokens, firstOpen: false, whatsNew: 2 });
  save();
}

export function totalStars(): number {
  return Object.values(mem.stars).reduce((a, b) => a + b, 0);
}
