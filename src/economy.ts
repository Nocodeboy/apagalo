// Meta progression: coins per level, permanent upgrades and what each store product grants.
// Pure rules on the save (no DOM, no analytics), shared by the game and tools/bot.ts.
import { PRODUCTS, type ProductId } from './monetize/types';
import type { CrewId } from './sim/types';
import type { Result, SimOptions } from './sim/world';
import type { Save } from './storage';

export type UpgradeId = 'hose' | 'power' | 'speed' | 'time';
export type UpgradeLevels = Record<UpgradeId, number>;
export const UPGRADE_IDS: UpgradeId[] = ['hose', 'power', 'speed', 'time'];
/** Price of each level of every track; its length is the maximum level. */
export const UPGRADE_COSTS = [200, 500, 1000, 2000, 4000];
export const MAX_UPGRADE = UPGRADE_COSTS.length;

/**
 * Effect of one level. Kept modest so the stars are still earned: measured with the bot
 * (`npx tsx tools/bot.ts 10 --up=max`, numbers in docs/dificultad.md).
 */
export const UPGRADE_STEP = {
  hose: 1, // metres of hose
  power: 0.04, // water power (+4 %)
  reach: 0.03, // nozzle reach (+3 %), same track as power
  speed: 0.03, // run speed (+3 %); more makes the race to the lever in level 4 trivial
  time: 5, // seconds on the clock
};

export function upgradeOptions(u: UpgradeLevels): SimOptions {
  return {
    hoseDelta: u.hose * UPGRADE_STEP.hose,
    powerMul: 1 + u.power * UPGRADE_STEP.power,
    reachMul: 1 + u.power * UPGRADE_STEP.reach,
    speedMul: 1 + u.speed * UPGRADE_STEP.speed,
    timeDelta: u.time * UPGRADE_STEP.time,
  };
}

export function hasUpgrades(u: UpgradeLevels): boolean {
  return UPGRADE_IDS.some((id) => u[id] > 0);
}

/** Cost of the next level, or null when the track is maxed. */
export function upgradeCost(level: number): number | null {
  return level < MAX_UPGRADE ? UPGRADE_COSTS[level] : null;
}

/** Buys the next level of a track. Returns the coins spent (0 if maxed or not affordable). */
export function buyUpgrade(save: Save, id: UpgradeId): number {
  const cost = upgradeCost(save.upgrades[id]);
  if (cost === null || save.coins < cost) return 0;
  save.coins -= cost;
  save.upgrades[id]++;
  return cost;
}

// ---------- crew (docs/diseno-v2.md §5.5) ----------
/** Price to hire (level 1) and to raise to levels 2 and 3. */
export const CREW_COSTS: Record<CrewId, number[]> = { partner: [2500, 4000, 7000], dog: [1500, 3000, 5000], drone: [2000, 3500, 6000] };
export const MAX_CREW = 3;

/** Cost of the next crew level, or null when maxed. */
export function crewCost(id: CrewId, level: number): number | null {
  return level < MAX_CREW ? CREW_COSTS[id][level] : null;
}

/** Hires or raises a crew member. Returns the coins spent (0 if maxed or not affordable). A new hire joins the team. */
export function buyCrew(save: Save, id: CrewId): number {
  const cost = crewCost(id, save.crew[id]);
  if (cost === null || save.coins < cost) return 0;
  save.coins -= cost;
  save.crew[id]++;
  if (save.crew[id] === 1 && !save.team.includes(id)) save.team.push(id);
  return cost;
}

/** The crew that goes to a level with `slots` places: the first hired members of the team. */
export function crewFor(save: Save, slots: number): Partial<Record<CrewId, number>> {
  const out: Partial<Record<CrewId, number>> = {};
  for (const id of save.team) {
    if (Object.keys(out).length >= slots) break;
    if (save.crew[id] > 0) out[id] = save.crew[id];
  }
  return out;
}

/** Takes a crew member to the levels (at the front of the team) or leaves them at the station. */
export function toggleTeam(save: Save, id: CrewId, slots: number) {
  if (save.crew[id] <= 0) return;
  const on = Object.keys(crewFor(save, slots)).includes(id);
  save.team = save.team.filter((x) => x !== id);
  if (!on) save.team.unshift(id);
}

// ---------- coins ----------
export const FREE_COINS = 150;
export const FREE_COINS_PER_DAY = 3;
/** Daily-challenge rewards allowed per rolling 24 h (normally one a day; 3 leaves room around midnight). */
export const DAILY_REWARDS_PER_DAY = 3;
const DAY_MS = 86_400_000;

/** Any level end, won or lost: 50 + 50 per star + up to 50 for the % saved (in steps of 5). */
export function levelCoins(r: Result): number {
  return 50 + 50 * r.stars + 5 * Math.round(r.saved * 10);
}

/** First result of the day in the daily challenge: 100 if lost, 200/250/300 for 1/2/3 stars. */
export function dailyCoins(r: Result): number {
  return r.win ? 150 + 50 * r.stars : 100;
}

/**
 * Claims made in the last 24 h. Guard against changing the phone's date: the per-day counters are keyed to the
 * local date, these timestamps are not. A timestamp in the future (the clock went back) is clamped to now, so it
 * blocks at most 24 h. Mutates the list (clamped, trimmed to the last `max`).
 */
function recentClaims(times: number[], now: number, max: number): number {
  for (let i = 0; i < times.length; i++) times[i] = Math.min(times[i], now);
  times.splice(0, Math.max(0, times.length - max));
  return times.filter((t) => now - t < DAY_MS).length;
}

export function freeCoinsLeft(save: Save, today: string, now = Date.now()): number {
  const byDay = save.ads.freeDay === today ? Math.max(0, FREE_COINS_PER_DAY - save.ads.freeClaims) : FREE_COINS_PER_DAY;
  return Math.min(byDay, Math.max(0, FREE_COINS_PER_DAY - recentClaims(save.ads.freeTimes, now, FREE_COINS_PER_DAY)));
}

/** Rewarded "free coins" in the shop. Returns the coins added (0 when today's claims are used up). */
export function claimFreeCoins(save: Save, today: string, now = Date.now()): number {
  if (freeCoinsLeft(save, today, now) <= 0) return 0;
  if (save.ads.freeDay !== today) {
    save.ads.freeDay = today;
    save.ads.freeClaims = 0;
  }
  save.ads.freeClaims++;
  save.ads.freeTimes.push(now);
  save.coins += FREE_COINS;
  return FREE_COINS;
}

/** The daily challenge's first-result reward is still allowed (at most 3 per rolling 24 h). Records it when true. */
export function takeDailyReward(save: Save, now = Date.now()): boolean {
  if (recentClaims(save.dailyTimes, now, DAILY_REWARDS_PER_DAY) >= DAILY_REWARDS_PER_DAY) return false;
  save.dailyTimes.push(now);
  return true;
}

// ---------- store ----------
export type NonConsumable = { [K in ProductId]: (typeof PRODUCTS)[K]['consumable'] extends false ? K : never }[ProductId];
export type Owned = Record<NonConsumable, boolean>;

export function isNonConsumable(id: ProductId): id is NonConsumable {
  return !PRODUCTS[id].consumable;
}

/**
 * Applies a completed (or restored) purchase. Idempotent for non-consumables: a product already
 * owned by this save grants nothing again. Returns the coins added.
 */
export function grantProduct(save: Save, id: ProductId): number {
  if (isNonConsumable(id)) {
    if (save.owned[id]) return 0;
    save.owned[id] = true;
  }
  save.coins += PRODUCTS[id].coins;
  return PRODUCTS[id].coins;
}
