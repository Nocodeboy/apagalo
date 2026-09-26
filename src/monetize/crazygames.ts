// CrazyGames SDK v3 video ads: "midgame" (our interstitial) and "rewarded".
// https://docs.crazygames.com/sdk/video-ads/  Only used when the build sets __CG_ADS__ (CrazyGames does
// not allow ads during Basic Launch). The game mutes the audio and calls gameplayStop around every ad
// (src/monetize/index.ts), as the portal requires. No purchases on CrazyGames.
import type { AdProvider } from './types';

interface CGAdError {
  code: 'unfilled' | 'adsDisabledBasicLaunch' | 'adblock' | 'adCooldown' | 'other';
  message: string;
}
interface CGAdModule {
  requestAd(type: 'midgame' | 'rewarded', cb: { adStarted?: () => void; adFinished?: () => void; adError?: (e: CGAdError) => void }): void;
  hasAdblock?: () => Promise<boolean>;
}

/** If the SDK has not started the ad by then, give up so the game never waits forever. */
const START_TIMEOUT_MS = 15000;

function adModule(): CGAdModule | null {
  const sdk = (window as unknown as { CrazyGames?: { SDK?: { environment?: string; ad?: CGAdModule } } }).CrazyGames?.SDK;
  return sdk && sdk.environment !== 'disabled' && sdk.ad ? sdk.ad : null;
}

export function createCrazyGamesAds(): AdProvider {
  // ads unavailable for the rest of the session (ad blocker, or the game is still in Basic Launch)
  let off = false;

  const request = (type: 'midgame' | 'rewarded') =>
    new Promise<boolean>((resolve) => {
      const ad = adModule();
      if (!ad || off) {
        resolve(false);
        return;
      }
      let started = false;
      let done = false;
      const end = (ok: boolean) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(ok);
      };
      const timer = setTimeout(() => {
        if (!started) end(false);
      }, START_TIMEOUT_MS);
      try {
        ad.requestAd(type, {
          adStarted: () => (started = true),
          adFinished: () => end(true),
          adError: (e) => {
            if (e?.code === 'adblock' || e?.code === 'adsDisabledBasicLaunch') off = true;
            end(false);
          },
        });
      } catch {
        end(false);
      }
    });

  return {
    name: 'crazygames',
    async init() {
      try {
        if (await adModule()?.hasAdblock?.()) off = true;
      } catch {
        /* keep trying ads; a failed request resolves false */
      }
    },
    rewardedReady: () => !off && !!adModule(),
    showRewarded: () => request('rewarded'),
    async showInterstitial() {
      await request('midgame');
    },
  };
}
