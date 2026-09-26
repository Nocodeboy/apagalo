// Meta progression: coins per level, permanent upgrades and what each store product grants.
// Pure rules on the save (no DOM, no analytics), shared by the game and tools/bot.ts.
import { PRODUCTS, type ProductId } from './monetize/types';
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

// ---------- coins ----------
export const FREE_COINS = 150;
export const FREE_COINS_PER_DAY = 3;

/** Any level end, won or lost: 50 + 50 per star + up to 50 for the % saved (in steps of 5). */
export function levelCoins(r: Result): number {
  return 50 + 50 * r.stars + 5 * Math.round(r.saved * 10);
}

/** First result of the day in the daily challenge: 100 if lost, 200/250/300 for 1/2/3 stars. */
export function dailyCoins(r: Result): number {
  return r.win ? 150 + 50 * r.stars : 100;
}

export function freeCoinsLeft(save: Save, today: string): number {
  return save.ads.freeDay === today ? Math.max(0, FREE_COINS_PER_DAY - save.ads.freeClaims) : FREE_COINS_PER_DAY;
}

/** Rewarded "free coins" in the shop. Returns the coins added (0 when today's claims are used up). */
export function claimFreeCoins(save: Save, today: string): number {
  if (freeCoinsLeft(save, today) <= 0) return 0;
  if (save.ads.freeDay !== today) {
    save.ads.freeDay = today;
    save.ads.freeClaims = 0;
  }
  save.ads.freeClaims++;
  save.coins += FREE_COINS;
  return FREE_COINS;
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
