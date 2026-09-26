// Game-side monetization: picks the ad and store providers for this build, applies the ad rules
// (interstitial caps, pause and mute while an ad plays) and reports ads and purchases to analytics.
// The rest of the game only calls the functions exported here.
import { track } from '../analytics';
import { grantProduct, isNonConsumable } from '../economy';
import * as store from '../storage';
import { androidPrivacyOptionsRequired, createAndroidProviders, showAndroidPrivacyOptions } from './android';
import { createCrazyGamesAds } from './crazygames';
import { createFakeProviders } from './fake';
import type { Product, ProductId, Providers, RewardedPlacement } from './types';

// Interstitial between levels (when leaving the end screen). It only shows if all of these hold,
// never in the player's first session and never once "remove_ads" is owned.
const INTERSTITIAL_MIN_LEVEL_ENDS = 3; // level ends in total
const INTERSTITIAL_EVERY_LEVEL_ENDS = 2; // level ends since the last one
const INTERSTITIAL_GAP_MS = 120_000; // time since the last one

/** An ad that never resolves must not freeze the game: stop waiting after this long. */
const WATCHDOG_MS = 180_000;

declare const __TARGET__: string;
declare const __CG_ADS__: boolean;
const TARGET = typeof __TARGET__ !== 'undefined' ? __TARGET__ : 'web';
const CG_ADS = typeof __CG_ADS__ !== 'undefined' && __CG_ADS__;

let P: Providers = { ads: null, iap: null };
let products: Product[] = [];
let firstSession = true;
let busy = false;
let pause: (on: boolean) => void = () => undefined;

// The test double only exists on local servers: on the live web or CrazyGames it would hand out free coins
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

function pick(): Providers {
  const fake = LOCAL_HOST ? new URLSearchParams(location.search).get('fakeads') : null;
  if (fake && TARGET !== 'android') return createFakeProviders(fake === 'fail');
  if (TARGET === 'android') return createAndroidProviders();
  if (TARGET === 'crazygames' && CG_ADS) return { ads: createCrazyGamesAds(), iap: null };
  return { ads: null, iap: null }; // web: no ads for now; purchases only through Google Play
}

/**
 * Loads the providers (consent, SDKs, store catalog) and quietly restores the non-consumables the
 * store account owns. `onPause(true)` runs before every ad and `onPause(false)` after it.
 */
export async function initMonetize(o: { firstSession: boolean; onPause: (on: boolean) => void }): Promise<void> {
  firstSession = o.firstSession;
  pause = o.onPause;
  try {
    P = pick();
  } catch {
    P = { ads: null, iap: null };
  }
  const ads = P.ads;
  const iap = P.iap;
  await Promise.all([
    (async () => {
      try {
        await ads?.init();
      } catch {
        /* no ads this session */
      }
    })(),
    (async () => {
      if (!iap) return;
      try {
        products = (await iap.init()).filter((p) => p.price);
      } catch {
        products = [];
      }
      await restorePurchases();
    })(),
  ]);
}

// ---------- ads ----------
export function canReward(): boolean {
  try {
    return !busy && !!P.ads?.rewardedReady();
  } catch {
    return false;
  }
}

/** The game showed an opt-in rewarded button. */
export function adOffered(pl: RewardedPlacement) {
  track('ad_offer', { pl });
}

async function whilePaused<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  busy = true;
  pause(true);
  let timer = 0;
  try {
    return await Promise.race([run(), new Promise<T>((r) => (timer = window.setTimeout(() => r(fallback), WATCHDOG_MS)))]);
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
    busy = false;
    pause(false);
  }
}

/** Shows a rewarded ad. True only if the player earned the reward. */
export async function showRewarded(pl: RewardedPlacement): Promise<boolean> {
  const ads = P.ads;
  if (!ads || busy) return false;
  track('ad_show', { pl, type: 'rewarded' });
  const ok = await whilePaused(() => ads.showRewarded(pl), false);
  track(ok ? 'ad_reward' : 'ad_fail', { pl });
  return ok;
}

/** Counts a level end (won or lost, levels and daily) for the interstitial caps. */
export function noteLevelEnd() {
  const a = store.data().ads;
  a.levelEnds++;
  a.sinceInterstitial++;
}

function interstitialDue(): boolean {
  const s = store.data();
  return (
    !firstSession &&
    !s.owned.remove_ads &&
    s.ads.levelEnds >= INTERSTITIAL_MIN_LEVEL_ENDS &&
    s.ads.sinceInterstitial >= INTERSTITIAL_EVERY_LEVEL_ENDS &&
    Date.now() - s.ads.lastInterstitial >= INTERSTITIAL_GAP_MS
  );
}

/** Leaving the end screen: shows the interstitial if the caps allow it. Resolves when the game can go on. */
export async function maybeInterstitial(): Promise<void> {
  const ads = P.ads;
  if (!ads || busy || !interstitialDue()) return;
  const a = store.data().ads;
  a.lastInterstitial = Date.now();
  a.sinceInterstitial = 0;
  store.save();
  track('ad_show', { pl: 'between_levels', type: 'interstitial' });
  await whilePaused(() => ads.showInterstitial('between_levels'), undefined);
}

// ---------- purchases ----------
export function hasStore(): boolean {
  return !!P.iap;
}

/** Products the store returned with a price (the shop hides the rest). */
export function storeProducts(): Product[] {
  return products;
}

function grant(id: ProductId, src: 'iap' | 'restore'): number {
  const n = grantProduct(store.data(), id);
  store.save();
  if (n) track('coins_earn', { src, n });
  return n;
}

/** Buys and grants a product. Resolves with the coins added, or null if the purchase did not complete. */
export async function buy(id: ProductId): Promise<number | null> {
  const iap = P.iap;
  if (!iap || busy) return null;
  busy = true;
  track('iap_start', { id });
  let ok = false;
  try {
    ok = await iap.purchase(id);
  } catch {
    ok = false;
  } finally {
    busy = false;
  }
  track(ok ? 'iap_ok' : 'iap_fail', { id });
  return ok ? grant(id, 'iap') : null;
}

/** Grants the non-consumables owned by the store account that this save lacks. Returns those ids. */
export async function restorePurchases(): Promise<ProductId[]> {
  const iap = P.iap;
  if (!iap) return [];
  let ids: ProductId[] = [];
  try {
    ids = await iap.restore();
  } catch {
    ids = [];
  }
  const s = store.data();
  const missing = ids.filter((id) => isNonConsumable(id) && !s.owned[id]);
  for (const id of missing) grant(id, 'restore');
  return missing;
}

// ---------- ad consent ----------
/** Google's EU consent rules: players in the EEA/UK must be able to change their ad choice later (Settings). */
export function privacyOptionsAvailable(): boolean {
  try {
    return TARGET === 'android' && androidPrivacyOptionsRequired();
  } catch {
    return false;
  }
}

export async function openPrivacyOptions(): Promise<void> {
  if (TARGET === 'android') await showAndroidPrivacyOptions();
}
