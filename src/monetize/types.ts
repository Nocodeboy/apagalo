// Monetization contract shared by the game and the platform adapters.
// The game only talks to AdProvider / IapProvider; each platform (Android/AdMob, CrazyGames SDK,
// web, test double) implements them in its own file. Keep this file free of platform code.

/** Where an ad is shown. Rewarded placements are always opt-in (the player taps a button). */
export type RewardedPlacement = 'continue_time' | 'double_coins' | 'free_coins';
export type InterstitialPlacement = 'between_levels';
export type Placement = RewardedPlacement | InterstitialPlacement;

export interface AdProvider {
  readonly name: string;
  /** Load SDKs, ask for consent where required (UMP in the EEA/UK), preload the first ads. Never throws. */
  init(): Promise<void>;
  /** True when a rewarded ad can be shown right now (the game hides rewarded buttons otherwise). */
  rewardedReady(): boolean;
  /** Shows a rewarded ad. Resolves true only if the player earned the reward. Never throws. */
  showRewarded(p: RewardedPlacement): Promise<boolean>;
  /** Shows an interstitial if one is loaded. Resolves when it is closed (or immediately if none). Never throws. */
  showInterstitial(p: InterstitialPlacement): Promise<void>;
}

export interface Product {
  id: ProductId;
  /** Localized price string from the store, e.g. "2,99 €" (null until the store answers). */
  price: string | null;
}

export interface IapProvider {
  readonly name: string;
  /** Connects to the store and returns the products it knows. Never throws (returns [] on failure). */
  init(): Promise<Product[]>;
  /** Starts a purchase. Resolves true when the purchase is completed and acknowledged/consumed. Never throws. */
  purchase(id: ProductId): Promise<boolean>;
  /** Non-consumables owned by this store account (used by "Restore purchases"). Never throws. */
  restore(): Promise<ProductId[]>;
}

/** Store catalog. Ids must match the in-app products created in Google Play Console. */
export const PRODUCTS = {
  remove_ads: { consumable: false, coins: 500 },
  starter_pack: { consumable: false, coins: 3000 },
  coins_s: { consumable: true, coins: 1000 },
  coins_m: { consumable: true, coins: 6000 },
  coins_l: { consumable: true, coins: 14000 },
} as const;
export type ProductId = keyof typeof PRODUCTS;
/** Suggested base prices (USD) to set in Play Console; the store localizes them per country. */
export const SUGGESTED_PRICE_USD: Record<ProductId, number> = {
  remove_ads: 2.99,
  starter_pack: 1.99,
  coins_s: 0.99,
  coins_m: 4.99,
  coins_l: 9.99,
};

export interface Providers {
  ads: AdProvider | null;
  iap: IapProvider | null;
}
