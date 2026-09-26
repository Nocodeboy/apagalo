// Test double for automated tests, enabled with ?fakeads=1: every ad "plays" for about a second behind
// a plain overlay and rewards the player, and every purchase succeeds. ?fakeads=fail makes them all fail.
// Counters for the tests live in window.__fakeads; the "store account" (owned non-consumables, for
// Restore purchases) in localStorage under apagalo.fakeiap.
import { PRODUCTS, SUGGESTED_PRICE_USD, type Placement, type ProductId, type Providers } from './types';

const ACCOUNT = 'apagalo.fakeiap';

export function createFakeProviders(fail: boolean): Providers {
  const log = { rewarded: [] as string[], interstitial: [] as string[], purchases: [] as string[] };
  (window as unknown as { __fakeads: typeof log }).__fakeads = log;
  const owned = new Set<ProductId>();
  try {
    for (const id of JSON.parse(localStorage.getItem(ACCOUNT) ?? '[]') as ProductId[]) owned.add(id);
  } catch {
    /* no account yet */
  }

  const play = (label: string, p: Placement) =>
    new Promise<void>((resolve) => {
      const n = document.createElement('div');
      n.className = 'fake-ad';
      n.style.cssText = 'position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:#000d;color:#fff;font:800 24px system-ui';
      n.textContent = `TEST AD · ${label} · ${p}`;
      document.body.appendChild(n);
      setTimeout(() => {
        n.remove();
        resolve();
      }, 1000);
    });

  return {
    ads: {
      name: 'fake',
      init: async () => undefined,
      rewardedReady: () => true,
      async showRewarded(p) {
        log.rewarded.push(p);
        await play('rewarded', p);
        return !fail;
      },
      async showInterstitial(p) {
        log.interstitial.push(p);
        await play('interstitial', p);
      },
    },
    iap: {
      name: 'fake',
      init: async () => (Object.keys(PRODUCTS) as ProductId[]).map((id) => ({ id, price: `$${SUGGESTED_PRICE_USD[id]}` })),
      async purchase(id) {
        log.purchases.push(id);
        await new Promise((r) => setTimeout(r, 300));
        if (fail) return false;
        if (!PRODUCTS[id].consumable) {
          owned.add(id);
          try {
            localStorage.setItem(ACCOUNT, JSON.stringify([...owned]));
          } catch {
            /* ignore */
          }
        }
        return true;
      },
      restore: async () => [...owned],
    },
  };
}
