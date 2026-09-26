// Android (Capacitor) adapters: AdMob (rewarded + interstitial, UMP consent) and Google Play Billing.
// STUB: replaced by the real implementation. Until then the Android build has no ads and no purchases.
import type { Providers } from './types';

export function createAndroidProviders(): Providers {
  return { ads: null, iap: null };
}
