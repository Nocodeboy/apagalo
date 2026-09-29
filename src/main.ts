import { initAnalytics, localeProps, setAnalyticsEnabled, submitDaily, track } from './analytics';
import { cloudStore, exitApp, gameplayStart, gameplayStop, happytime, loadingDone, onAndroidBack, platformInit } from './platform';
import { audio, vibrate } from './audio';
import { buyUpgrade, claimFreeCoins, dailyCoins, FREE_COINS, freeCoinsLeft, hasUpgrades, isNonConsumable, levelCoins, takeDailyReward, upgradeOptions, type UpgradeId } from './economy';
import { detectLang, getLang, num, setLang, t, tx } from './i18n';
import { adOffered, buy, canReward, hasStore, initMonetize, maybeInterstitial, noteLevelEnd, openPrivacyOptions, privacyOptionsAvailable, restorePurchases, showRewarded, storeProducts, type BuyResult, type Delivered } from './monetize';
import type { ProductId } from './monetize/types';
import { Input } from './input';
import { Stage, type Tier } from './render/stage';
import { Bot, SKILL_PRO } from './sim/bot';
import { dayKey, makeDaily, type Daily } from './sim/daily';
import { DAILY_SALTS } from './sim/dailyTable';
import { FINALE_ID } from './sim/campaign/finale';
import { BASE_LEVELS, LEVELS } from './sim/levels';
import { MATS } from './sim/materials';
import { RESCUE_TYPES } from './sim/parse';
import type { Lang, LevelDef, SimEvent, SimInput } from './sim/types';
import { Sim, SIM_DT, type Result } from './sim/world';
import * as store from './storage';
import type { Settings } from './storage';
import { Minimap } from './ui/minimap';
import { shopScreen, starterOffer } from './ui/shop';
import {
  $,
  banner,
  buildHud,
  goalsHtml,
  setStarLostHandler,
  clearFloaters,
  clearScreens,
  continueScreen,
  el,
  endScreen,
  floater,
  fmtTime,
  introScreen,
  levelsScreen,
  pauseScreen,
  resetHudCache,
  settingsScreen,
  titleScreen,
  toast,
  updateFloaters,
  updateHud,
  updateIcons,
} from './ui/ui';

declare const __MUSIC__: { menu?: string; game?: string };
declare const __GAME_URL__: string;
declare const __TARGET__: string;
declare const __PRIVACY_URL__: string;
declare const __VERSION__: string;
const TARGET_ANDROID = typeof __TARGET__ !== 'undefined' && __TARGET__ === 'android';
const TARGET_CG = typeof __TARGET__ !== 'undefined' && __TARGET__ === 'crazygames';
const PRIVACY_URL = typeof __PRIVACY_URL__ !== 'undefined' ? __PRIVACY_URL__ : '';
const GAME_URL = typeof __GAME_URL__ !== 'undefined' ? __GAME_URL__ : '';
let dailyRank: { players: number; below: number } | null = null;
/** Seconds added by the rewarded continue when time runs out. */
const CONTINUE_SECS = 30;

type Mode = 'attract' | 'intro' | 'play' | 'paused' | 'offer' | 'end';

const canvas = $<HTMLCanvasElement>('#c');
const stage = new Stage(canvas);
const input = new Input($('#touch'), $('#stickL'), $('#stickR'));
let save = store.load();
let mode: Mode = 'attract';
let sim: Sim | null = null;
let bot: Bot | null = null;
let current: { kind: 'level'; index: number } | { kind: 'daily'; daily: Daily } | null = null;
let acc = 0;
let time = 0;
let last = performance.now();
let endTimer = -1;
let attractIdx = 0;
let tutorialNodes: HTMLElement[] = [];
let tutT = 0;
const fps = { t: 0, n: 0, slow: 0, fast: 0, down: false, up: false };
let lastTick = 0;
let timeScale = 1;
let slowTarget = 1;
let slowHold = 0;
let minimap: Minimap | null = null;
let playStart = 0;
let wakeLock: { release: () => Promise<void> } | null = null;
const flags = { flares: 0, overheat: 0, hose: false, rocket: false };
/** rewarded +30 s in this attempt: offered once, and whether the player took it */
let continueState: 'none' | 'offered' | 'taken' = 'none';
/** an ad is on screen: the loop and the audio are paused */
let adBusy = false;
const firstSession = save.firstOpen;

// ---------- boot ----------
applyLang(save.settings.lang ?? detectLang());
audio.setSfx(save.settings.sfx);
audio.musicOn = save.settings.music;
try {
  audio.setMusicTracks(typeof __MUSIC__ !== 'undefined' ? __MUSIC__ : {});
} catch {
  /* no music bundled */
}
const isMobile = 'ontouchstart' in window && Math.min(screen.width, screen.height) < 820;
function effectiveTier(): Tier {
  const g = save.settings.gfx ?? 'auto';
  return g === 'auto' ? (save.settings.autoTier ?? (isMobile ? 'medium' : 'high')) : g;
}
stage.setTier(effectiveTier());
setAnalyticsEnabled(save.settings.stats !== false);
initAnalytics();
platformInit().finally(() => {
  // CrazyGames: progress lives in the SDK Data module (synced to the player's account)
  const kv = cloudStore();
  if (kv && store.useCloud(kv)) {
    applyLang(save.settings.lang ?? detectLang());
    audio.setSfx(save.settings.sfx);
    audio.musicOn = save.settings.music;
    stage.setTier(effectiveTier());
    setAnalyticsEnabled(save.settings.stats !== false);
    if (document.querySelector('#screens .title-screen')) showTitle();
  }
  // after the first frame, or shortly after if the tab is hidden and frames are paused
  let loaded = false;
  const done = () => {
    if (loaded) return;
    loaded = true;
    loadingDone();
  };
  requestAnimationFrame(done);
  setTimeout(done, 400);
  // ads and store after the portal SDK is ready; restored purchases may change the balance
  initMonetize({ firstSession, onPause: adPause, onDelivered: purchaseDelivered }).then(() => {
    if (document.querySelector('#screens .title-screen')) showTitle();
    else refreshShop();
  });
});
if (save.firstOpen) {
  track('first_open', { lang: getLang(), ...localeProps() });
  save.firstOpen = false;
  store.save();
}
track('session_start', { stars: store.totalStars(), ...localeProps() });
initHud();
setStarLostHandler(() => {
  audio.play('starLost');
  if (save.settings.vibration) vibrate(30);
});
input.onPause = pauseGame;
input.onNozzle = setNozzle;
// Android back: pause while playing, otherwise the top screen's own back/resume/menu button; on the title, leave
onAndroidBack(() => {
  if (adBusy) return;
  if (mode === 'play') {
    pauseGame();
    return;
  }
  const top = document.querySelector('#screens > .screen:last-child');
  const btn = top?.querySelector<HTMLElement>('[data-a=back], [data-a=resume], [data-a=decline], [data-a=menu]');
  if (btn) btn.click();
  else if (mode === 'attract') exitApp(); // title screen
});
window.addEventListener('resize', () => stage.resize());
document.addEventListener('visibilitychange', () => {
  if (document.hidden && mode === 'play') pauseGame();
});
// unlock audio on the first interaction anywhere
const unlock = () => {
  audio.unlock();
  audio.music(mode === 'play' ? 'game' : 'menu');
};
window.addEventListener('pointerdown', unlock, { once: true });
window.addEventListener('keydown', unlock, { once: true });

startAttract();
showTitle();
requestAnimationFrame(frame);

// ---------- helpers ----------
/** Language, plus the texts outside the screens (tab title, canvas label). */
function applyLang(l: Lang) {
  setLang(l);
  document.title = t('pageTitle');
  canvas.setAttribute('aria-label', t('gameName'));
}
/** A purchase paid earlier (app closed before delivery, slow payment cleared) was delivered at launch or on return. */
function purchaseDelivered(d: Delivered) {
  audio.play('coin');
  toast(d.coins ? t('buyDelivered', { n: num(d.coins) }) : t('buyOk'), 'good', 3200);
  if (document.querySelector('#screens .title-screen')) showTitle();
  else refreshShop();
}
/** Toast after a Buy tap. */
function buyToast(r: BuyResult) {
  if (r === 'pending') toast(t('buyPending'), '', 4200);
  else if (r === null) toast(t('buyFail'), 'warn');
  else {
    audio.play('coin');
    toast(t('buyOk'), 'good');
  }
}
/** Around every ad: silence, stop the loop and tell the portal the game is not being played. */
function adPause(on: boolean) {
  adBusy = on;
  audio.mute(on);
  if (on) gameplayStop();
  last = performance.now();
}
function initHud() {
  buildHud(pauseGame, setNozzle);
  minimap = new Minimap($<HTMLCanvasElement>('#minimap'));
  if (sim) minimap.setSim(sim);
}
function fireCentroid(s: Sim): { x: number; z: number } | null {
  let sx = 0;
  let sz = 0;
  let n = 0;
  for (let i = 0; i < s.N; i++) {
    if (s.fire[i] <= 0) continue;
    sx += (i % s.W) + 0.5;
    sz += Math.floor(i / s.W) + 0.5;
    n++;
  }
  return n ? { x: sx / n, z: sz / n } : null;
}
/** Linear unlocking: win the previous level (1 star or more). A level already won stays open whatever comes before it. */
function unlocked(i: number): boolean {
  if (i === 0) return true;
  return (save.stars[LEVELS[i - 1].id] ?? 0) >= 1 || (save.stars[LEVELS[i].id] ?? 0) >= 1;
}
function nextLevelIndex(): number {
  for (let i = 0; i < LEVELS.length; i++) if (!save.stars[LEVELS[i].id]) return unlocked(i) ? i : Math.max(0, i - 1);
  return LEVELS.length - 1;
}
function todayDaily(): Daily {
  const base = makeDaily(new Date());
  const salt = DAILY_SALTS[base.num - 1] ?? 0;
  return salt ? makeDaily(new Date(), salt) : base;
}
function setHudVisible(v: boolean) {
  $('#hud').hidden = !v;
  $('#nozzles').hidden = !v;
}
function setNozzle(n: 0 | 1 | 2) {
  if (!sim || mode !== 'play') return;
  if (n === 2 && sim.foamLeft <= 0) {
    if (sim.foamMax > 0) toast(t('tFoamEmpty'), 'warn', 1400);
    return;
  }
  if (input.nozzle !== n) audio.play('nozzle');
  input.nozzle = n;
}

// ---------- attract mode (bot plays behind the menus): only the 6 original levels, cheap and always the same ----------
function startAttract() {
  const L = BASE_LEVELS[attractIdx % BASE_LEVELS.length];
  attractIdx++;
  sim = new Sim(L, { seed: 777 + attractIdx });
  bot = new Bot(sim, SKILL_PRO);
  stage.setLevel(sim);
  stage.zoom = stage.zoomTarget = 1.25;
  mode = 'attract';
  gameplayStop();
  setHudVisible(false);
  input.enabled = false;
  input.reset();
  clearTutorial();
}

// ---------- screens ----------
function showTitle() {
  if (mode !== 'attract') startAttract();
  audio.music('menu');
  const d = todayDaily();
  const done = !!save.daily[d.key];
  const next = nextLevelIndex();
  const anyStars = store.totalStars() > 0;
  titleScreen({
    playLabel: anyStars ? t('continue') : t('play'),
    playLevel: anyStars ? LEVELS[next].num : null,
    stars: store.totalStars(),
    maxStars: LEVELS.length * 3,
    dailyNum: d.num,
    dailyDone: done,
    streak: save.streak.last === d.key || isYesterday(save.streak.last) ? save.streak.count : 0,
    coins: save.coins,
    // CrazyGames: games that collect their own data must show a privacy notice to new players
    privacyUrl: TARGET_CG && PRIVACY_URL && save.settings.stats !== false && !anyStars ? PRIVACY_URL : undefined,
    onPlay: () => {
      audio.play('click');
      // first ever game: straight into level 1 (the tutorial explains it) — one click from the title to playing
      if (!anyStars && !save.tutorialDone && next === 0) quickStart(0);
      else openLevel(next);
    },
    onLevels: () => {
      audio.play('click');
      showLevels();
    },
    onDaily: () => {
      audio.play('click');
      openDaily();
    },
    onSettings: () => {
      audio.play('click');
      showSettings();
    },
    onShop: () => {
      audio.play('click');
      showShop('title');
    },
  });
}

// ---------- shop ----------
let shopFrom: 'title' | 'end' = 'title';

function showShop(from: 'title' | 'end') {
  shopFrom = from;
  track('shop_open', { from });
  renderShop();
  if (canReward() && freeCoinsLeft(save, dayKey()) > 0) adOffered('free_coins');
}

function renderShop() {
  const today = dayKey();
  shopScreen({
    coins: save.coins,
    upgrades: save.upgrades,
    free: canReward() ? { left: freeCoinsLeft(save, today), amount: FREE_COINS } : null,
    products: hasStore() ? storeProducts().filter((p) => !(isNonConsumable(p.id) && save.owned[p.id])) : null,
    onUpgrade: (id: UpgradeId) => {
      const cost = buyUpgrade(save, id);
      if (!cost) return;
      store.save();
      track('coins_spend', { item: `up_${id}`, n: cost });
      track('upgrade', { id, lvl: save.upgrades[id] });
      audio.play('star', save.upgrades[id] - 1);
      toast(t('upgraded'), 'good', 1400);
      renderShop();
    },
    onFree: async () => {
      if (await showRewarded('free_coins')) {
        const n = claimFreeCoins(save, today);
        store.save();
        track('coins_earn', { src: 'free', n });
        audio.play('coin');
        toast(`+${n}`, 'good', 1400);
      } else toast(t('adFail'), 'warn');
      refreshShop();
    },
    onBuy: async (id: ProductId) => {
      buyToast(await buy(id));
      refreshShop();
    },
    onRestore: async () => {
      const ids = await restorePurchases();
      toast(ids.length ? t('restored') : t('restoreNone'), ids.length ? 'good' : '');
      refreshShop();
    },
    onBack: () => {
      audio.play('click');
      if (shopFrom === 'end' && sim?.result) renderEnd(true);
      else showTitle();
    },
  });
}

/** After an ad or a purchase: redraw the shop if the player is still on it. */
function refreshShop() {
  if (document.querySelector('#screens .shop-screen')) renderShop();
}

function isYesterday(key: string): boolean {
  if (!key) return false;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return dayKey(y) === key;
}

/** Level select, on the page of the next level to play (or of `focus`, coming back from a level's intro). */
function showLevels(focus?: number) {
  levelsScreen({
    levels: LEVELS,
    stars: save.stars,
    best: save.best,
    unlocked,
    next: nextLevelIndex(),
    focus,
    onPick: (i) => {
      audio.play('click');
      openLevel(i);
    },
    onBack: () => {
      audio.play('click');
      showTitle();
    },
  });
}

function showSettings() {
  const st = save.settings;
  settingsScreen({
    sfx: st.sfx,
    music: st.music,
    vibration: st.vibration,
    stats: st.stats !== false,
    privacyUrl: PRIVACY_URL || undefined,
    onAdChoices: privacyOptionsAvailable() ? () => void openPrivacyOptions() : undefined,
    version: typeof __VERSION__ !== 'undefined' ? __VERSION__ : '',
    gfx: st.gfx ?? 'auto',
    lang: getLang(),
    onChange: (k, v) => {
      if (k === 'sfx') {
        st.sfx = v as boolean;
        audio.setSfx(st.sfx);
      } else if (k === 'music') {
        st.music = v as boolean;
        audio.setMusic(st.music);
      } else if (k === 'vibration') st.vibration = v as boolean;
      else if (k === 'stats') {
        st.stats = v as boolean;
        setAnalyticsEnabled(st.stats);
      }
      else if (k === 'gfx') {
        st.gfx = v as Settings['gfx'];
        stage.setTier(effectiveTier());
        fps.t = fps.n = fps.slow = fps.fast = 0;
      } else if (k === 'lang') {
        st.lang = v as Lang;
        applyLang(st.lang);
        initHud();
        store.save();
        showSettings();
        return;
      }
      store.save();
      audio.play('click');
    },
    onReset: () => {
      store.reset();
      save = store.data();
      toast('OK', 'good');
      showTitle();
    },
    onBack: () => {
      audio.play('click');
      showTitle();
    },
  });
}

function prepare(def: LevelDef, opts: ConstructorParameters<typeof Sim>[1] = {}, night = false) {
  sim = new Sim(def, opts);
  bot = null;
  stage.setLevel(sim, night);
  mode = 'intro';
  setHudVisible(false);
  input.enabled = false;
  input.reset();
  input.nozzle = 0;
  clearFloaters();
  flags.flares = 0;
  flags.overheat = 0;
  flags.hose = false;
  flags.rocket = false;
  continueState = 'none';
  timeScale = slowTarget = 1;
  slowHold = 0;
  minimap?.setSim(sim);
  // intro: glide over to the fire so the player can read the situation
  const fc = fireCentroid(sim);
  if (fc) {
    stage.focus = { x: (fc.x * 2 + sim.player.x) / 3, z: (fc.z * 2 + sim.player.z) / 3 };
    stage.zoomTarget = stage.reducedMotion ? 1 : 1.3;
  }
}

/** Levels are played with the player's upgrades (never the daily: its ranking is shared). */
function levelOpts() {
  return upgradeOptions(save.upgrades);
}

function openLevel(i: number) {
  const L = LEVELS[i];
  current = { kind: 'level', index: i };
  prepare(L, levelOpts());
  introScreen({
    def: L,
    eyebrow: `${t('level')} ${L.num}`,
    title: tx(L.name),
    tip: tx(L.tip),
    time: sim!.timeLeft,
    wind: L.wind,
    hasRescues: sim!.rescuees.length > 0,
    onGo: () => startPlay(),
    onBack: () => {
      audio.play('click');
      startAttract();
      showLevels(i);
    },
  });
}

function quickStart(i: number) {
  current = { kind: 'level', index: i };
  prepare(LEVELS[i], levelOpts());
  startPlay();
}

function openDaily() {
  const d = todayDaily();
  current = { kind: 'daily', daily: d };
  prepare(d.def, d.opts, !!d.def.night); // no upgrades: same challenge for everyone
  const rec = save.daily[d.key];
  introScreen({
    def: d.def,
    eyebrow: `${t('daily')} · ${tx(BASE_LEVELS.find((l) => l.theme === d.def.theme)!.name)}`,
    title: t('dailyTitle', { n: d.num }),
    tip: rec ? t('dailyPlayed', { s: rec.score.toLocaleString() }) : `${tx(d.mod.label)} · ${tx(BASE_LEVELS.find((l) => l.theme === d.def.theme)!.tip)}`,
    time: sim!.timeLeft,
    wind: d.opts.windOverride ?? d.def.wind,
    hasRescues: sim!.rescuees.length > 0,
    extra: `<span class="pill">⚡ ${tx(d.mod.label)}</span>`,
    note: hasUpgrades(save.upgrades) ? t('noUpgradesNote') : undefined,
    onGo: () => startPlay(),
    onBack: () => {
      audio.play('click');
      startAttract();
      showTitle();
    },
  });
  track('daily_open', { num: d.num, mod: d.mod.key, played: !!rec });
}

function startPlay() {
  if (!sim) return;
  audio.unlock();
  audio.play('siren');
  audio.music('game');
  clearScreens();
  resetHudCache();
  setHudVisible(true);
  stage.focus = null;
  stage.zoomTarget = 1;
  mode = 'play';
  gameplayStart();
  input.enabled = true;
  input.reset();
  acc = 0;
  playStart = performance.now();
  endTimer = -1;
  // level events carry the level id (stable, what saves use) and its number in the campaign order
  if (current?.kind === 'daily') track('level_start', { level: `daily-${current.daily.num}` });
  else track('level_start', { level: sim.def.id, num: sim.def.num });
  if (current?.kind === 'daily') track('daily_start', { num: current.daily.num });
  if (current?.kind === 'level' && current.index === 0 && !save.tutorialDone) showTutorial();
  try {
    (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock
      ?.request('screen')
      .then((w) => (wakeLock = w))
      .catch(() => undefined);
  } catch {
    /* ignore */
  }
}

function pauseGame() {
  if (mode !== 'play') return;
  mode = 'paused';
  gameplayStop();
  input.reset();
  audio.loops(false, 0, 0, 0);
  audio.duck(true);
  pauseScreen({
    goals: sim ? `<div class="eyebrow">${t('goalsNow')} · ${Math.round(sim.saved * 100)}%</div>` + goalsHtml(sim.def, sim.rescuees.length > 0, sim.saved) : '',
    sfx: save.settings.sfx,
    music: save.settings.music,
    onResume: () => {
      clearScreens();
      mode = 'play';
      gameplayStart();
      audio.duck(false);
      last = performance.now();
    },
    onRestart: () => {
      audio.duck(false);
      retry();
    },
    onMenu: () => {
      audio.duck(false);
      track('level_quit', current?.kind === 'daily' ? { level: `daily-${current.daily.num}` } : { level: sim?.def.id ?? '', num: sim?.def.num ?? 0 });
      startAttract();
      showTitle();
    },
    onSfx: (on) => {
      save.settings.sfx = on;
      audio.setSfx(on);
      store.save();
    },
    onMusic: (on) => {
      save.settings.music = on;
      audio.setMusic(on);
      store.save();
    },
  });
}

function retry() {
  if (!current) return;
  if (current.kind === 'level') {
    prepare(LEVELS[current.index], levelOpts());
  } else {
    prepare(current.daily.def, current.daily.opts, !!current.daily.def.night);
  }
  startPlay();
}

// ---------- tutorial ----------
function showTutorial() {
  clearTutorial();
  const app = $('#app');
  if (input.mode === 'touch') {
    tutorialNodes = [el(`<div class="tut l"><div class="ghost"><i></i></div><div>${t('tutMove')}</div></div>`), el(`<div class="tut r"><div class="ghost"><i></i></div><div>${t('tutAim')}</div></div>`)];
  } else {
    tutorialNodes = [el(`<div class="tut desk">${t('tutDesk')}</div>`)];
  }
  tutorialNodes.forEach((n) => app.appendChild(n));
  input.usedMove = false;
  input.usedAim = false;
  tutT = 0;
}
function clearTutorial() {
  tutorialNodes.forEach((n) => n.remove());
  tutorialNodes = [];
}

// ---------- input -> sim ----------
function buildInput(s: Sim): SimInput {
  input.poll();
  const hold = (window as unknown as { __hold?: SimInput }).__hold;
  if (hold) return hold;
  if (rec.driver) return rec.driver.update();
  const p = s.player;
  const inp: SimInput = { mx: input.moveX, mz: input.moveY, ax: 0, az: 0, aimDist: 0, spray: input.spray, nozzle: input.nozzle };
  const maxR = s.nozzleRange(input.nozzle);
  if (input.mode === 'mouse') {
    if (input.mouseX >= 0) {
      const g = stage.toGround(input.mouseX, input.mouseY);
      if (g) {
        const dx = g.x - p.x;
        const dz = g.z - p.z;
        const d = Math.hypot(dx, dz);
        if (d > 0.3) {
          inp.ax = dx / d;
          inp.az = dz / d;
          inp.aimDist = d;
        }
      }
    }
  } else if (input.spray) {
    let ax = input.aimMag > 0 ? input.aimX : p.aimX;
    let az = input.aimMag > 0 ? input.aimY : p.aimZ;
    // aim assist: snap range (and gently the angle) to the flames in the cone
    const tgt = s.findAimTarget(ax, az, maxR, Math.cos((24 * Math.PI) / 180));
    if (tgt) {
      const dx = tgt.x - p.x;
      const dz = tgt.z - p.z;
      const d = Math.hypot(dx, dz) || 1;
      ax = ax * 0.45 + (dx / d) * 0.55;
      az = az * 0.45 + (dz / d) * 0.55;
      const l = Math.hypot(ax, az) || 1;
      inp.ax = ax / l;
      inp.az = az / l;
      inp.aimDist = tgt.d;
    } else {
      inp.ax = ax;
      inp.az = az;
      inp.aimDist = maxR * (input.aimMag > 0 ? 0.45 + 0.55 * input.aimMag : 1);
    }
  }
  return inp;
}

// ---------- events -> feedback ----------
const ANIMAL_SOUND: Record<string, { es: string; en: string }> = {
  cat: { es: '¡Miau!', en: 'Meow!' },
  dog: { es: '¡Guau!', en: 'Woof!' },
  sheep: { es: '¡Beee!', en: 'Baa!' },
  goat: { es: '¡Meee!', en: 'Meh!' },
};

function handleEvent(ev: SimEvent) {
  const s = sim!;
  stage.view?.onEvent(ev);
  const vib = save.settings.vibration;
  switch (ev.type) {
    case 'extinguish':
      audio.play('hiss');
      break;
    case 'clusterOut':
      audio.play('clusterOut');
      floater(t('tClusterOut'), ev.x, 1.5, ev.z, 'water');
      break;
    case 'combo':
      audio.play('combo', ev.n);
      floater(t('tCombo', { n: ev.n ?? 0 }), s.player.x, 2.4, s.player.z, 'gold');
      break;
    case 'ignite':
      audio.play('ignite');
      break;
    case 'rescue':
      audio.play('rescue');
      floater(t('tRescue'), ev.x, 1.8, ev.z, 'good');
      if (vib) vibrate(25);
      break;
    case 'fled':
      audio.play('fled');
      floater(t('tFled'), ev.x, 1.8, ev.z, 'bad');
      break;
    case 'soak': {
      audio.play('soak');
      const e = ev.ent !== undefined ? s.ents[ev.ent] : null;
      const txt = e && ANIMAL_SOUND[e.type] ? ANIMAL_SOUND[e.type][getLang()] : t('tSoak');
      floater(txt, ev.x, 2, ev.z, 'bad');
      break;
    }
    case 'short':
      audio.play('short');
      floater('⚡', ev.x, 2, ev.z, 'bad');
      toast(t('tShort'), 'warn', 2600);
      if (vib) vibrate([40, 30, 60]);
      break;
    case 'flare':
      audio.play('flare');
      if (flags.flares++ < 2) toast(s.foamMax > 0 ? t('tFlare') : t('tFlareNoFoam'), 'warn', 3200);
      if (vib) vibrate(50);
      break;
    case 'explode':
      audio.play('explode');
      toast(t('tExplode'), 'warn', 3000);
      $('#flash').style.transition = 'none';
      $('#flash').style.opacity = '0.75';
      requestAnimationFrame(() => {
        $('#flash').style.transition = 'opacity .6s';
        $('#flash').style.opacity = '0';
      });
      if (vib) vibrate([120, 40, 200]);
      break;
    case 'cylinderWarn':
      audio.play('cylinderWarn');
      toast(t('tCylinder'), 'warn', 3000);
      break;
    case 'powerOff':
      audio.play('powerOff');
      toast(t('tPowerOff'), 'good', 2400);
      break;
    case 'connect':
      audio.play('connect');
      floater(t('tConnect'), ev.x, 1.6, ev.z, 'water');
      break;
    case 'hose':
      audio.play('hose');
      if (!flags.hose && s.anchors.length > 1) {
        flags.hose = true;
        toast(t('tHose'), '', 3000);
      }
      break;
    case 'overheat':
      audio.play('overheat');
      if (flags.overheat++ < 2) toast(t('tOverheat'), 'warn', 3000);
      if (vib) vibrate(60);
      break;
    case 'windWarn':
      audio.play('windWarn');
      toast(t('tWindWarn'), 'warn', 2400);
      break;
    case 'rocket':
      audio.play('rocket');
      if (!flags.rocket) {
        flags.rocket = true;
        toast(t('tRocket'), 'warn', 3000);
      }
      break;
    case 'rocketHit':
      audio.play('rocketHit');
      break;
    case 'fizzle':
      audio.play('fizzle');
      floater(t('tFizzle'), ev.x, 1.6, ev.z, 'good');
      break;
    case 'foamEmpty':
      toast(t('tFoamEmpty'), 'warn');
      input.nozzle = 0;
      break;
    case 'win':
      audio.play('win');
      finishSoon();
      break;
    case 'lose':
      audio.play('lose');
      if (canContinue()) offerContinue();
      else finishSoon();
      break;
  }
}

/** Time ran out in a level (never the daily: its ranking is shared) and a rewarded ad is ready. */
function canContinue(): boolean {
  return current?.kind === 'level' && continueState === 'none' && sim?.result?.reason === 'time' && canReward();
}

function offerContinue() {
  const s = sim!;
  continueState = 'offered';
  mode = 'offer';
  gameplayStop();
  input.enabled = false;
  input.reset();
  audio.loops(false, 0, 0, 0);
  adOffered('continue_time');
  continueScreen({
    eyebrow: `${t('level')} ${s.def.num} · ${tx(s.def.name)}`,
    secs: CONTINUE_SECS,
    onYes: async () => {
      const ok = await showRewarded('continue_time');
      if (ok && sim === s && s.continueWithTime(CONTINUE_SECS)) {
        continueState = 'taken';
        clearScreens();
        mode = 'play';
        gameplayStart();
        input.enabled = true;
        input.reset();
        acc = 0;
        toast(t('contGo', { n: CONTINUE_SECS }), 'good');
        return;
      }
      if (!ok) toast(t('adFail'), 'warn');
      if (sim === s) finishSoon(true);
    },
    onNo: () => {
      audio.play('click');
      finishSoon(true);
    },
  });
}

/** The level is over: save it now and show the end screen after the banner (right away after the continue offer). */
function finishSoon(afterOffer = false) {
  const s = sim!;
  const r = s.result;
  endTimer = afterOffer ? 0.5 : 2.3;
  mode = 'end';
  gameplayStop();
  commitResult();
  if (afterOffer) clearScreens();
  if (r?.win) {
    banner(t('bannerWin'), 'win');
    if (!stage.reducedMotion) {
      slowTarget = 0.35;
      slowHold = 0.9;
      stage.focus = { x: s.player.x, z: s.player.z };
      stage.zoomTarget = 0.82;
    }
  } else {
    if (!afterOffer) banner(r?.reason === 'time' ? t('bannerTime') : t('bannerLost'), 'lose');
    const fc = fireCentroid(s);
    if (fc && !stage.reducedMotion) {
      stage.focus = fc;
      stage.zoomTarget = 1.45;
    }
    slowTarget = 1;
  }
  input.enabled = false;
  input.reset();
}

function shareFor(r: Result): string {
  const stars = '⭐'.repeat(r.stars) + '☆'.repeat(3 - r.stars);
  const blocks = Array.from({ length: 5 }, (_, i) => {
    const v = r.saved * 5 - i;
    return v >= 1 ? '🟩' : v > 0.5 ? '🟨' : v > 0 ? '🟧' : '⬛';
  }).join('');
  const head = `${t('gameName')} 🚒 ${current?.kind === 'daily' ? t('dailyTitle', { n: current.daily.num }) : `${t('level')} ${sim!.def.num} · ${tx(sim!.def.name)}`}`;
  const animals = r.rescueTotal ? ` · 🐾 ${r.rescueTotal - r.fled}/${r.rescueTotal}` : '';
  const rank = current?.kind === 'daily' && dailyRank && dailyRank.players > 1 ? ` · 🏆 Top ${Math.max(1, 100 - rankPct(dailyRank))}%` : '';
  const c = endInfo?.campaign;
  const camp = c && r.win ? `\n${t('shareCampaign', { n: c.levels, s: c.stars, m: c.maxStars })}` : '';
  return `${head}\n${stars} ${Math.round(r.saved * 100)}% ${t('saved').toLowerCase()} · ⏱ ${fmtTime(r.timeUsed)}${animals}\n${blocks}${rank}${camp}${GAME_URL ? '\n' + GAME_URL : ''}`;
}

function rankPct(rk: { players: number; below: number }): number {
  return Math.round((rk.below / Math.max(1, rk.players - 1)) * 100);
}

interface EndInfo {
  best: number;
  newBest: boolean;
  eyebrow: string;
  footer?: string;
  hasNext: boolean;
  unlockedNext: number | null;
  /** coins earned (doubled after the rewarded x2) */
  coins: number;
  doubled: boolean;
  /** the player already saw an ad or an offer on this end screen: no interstitial when leaving */
  adSeen: boolean;
  /** the finale was won: the campaign is complete */
  campaign?: { levels: number; stars: number; maxStars: number };
}
let endInfo: EndInfo | null = null;

/** Stars of the whole campaign (only ids of levels that exist). */
function campaignStats() {
  return { levels: LEVELS.length, stars: LEVELS.reduce((a, L) => a + (save.stars[L.id] ?? 0), 0), maxStars: LEVELS.length * 3 };
}

function rankText(rk: { players: number; below: number }): string {
  return rk.players <= 1 ? t('dailyFirst') : t('dailyRank', { p: rankPct(rk), n: rk.players.toLocaleString() });
}

/** Save progress and report the result the moment the level ends (not when the panel appears). */
function commitResult() {
  const s = sim!;
  const r = s.result!;
  const dur = Math.round((performance.now() - playStart) / 1000);
  // a +30 s ad in this attempt counts as this transition's ad: never an interstitial right after it
  const info: EndInfo = { best: 0, newBest: false, eyebrow: '', hasNext: false, unlockedNext: null, coins: levelCoins(r), doubled: false, adSeen: continueState === 'taken' };
  const cont: { cont?: boolean } = continueState === 'taken' ? { cont: true } : {};
  if (current?.kind === 'level') {
    const id = s.def.id;
    const idx = current.index;
    const nextWasLocked = idx < LEVELS.length - 1 && !unlocked(idx + 1);
    info.eyebrow = `${t('level')} ${s.def.num} · ${tx(s.def.name)}`;
    if (r.win) {
      save.stars[id] = Math.max(save.stars[id] ?? 0, r.stars);
      if (r.score > (save.best[id] ?? 0)) {
        info.newBest = (save.best[id] ?? 0) > 0;
        save.best[id] = r.score;
      }
      if (idx === 0) save.tutorialDone = true;
    }
    info.best = save.best[id] ?? 0;
    info.hasNext = idx < LEVELS.length - 1;
    if (nextWasLocked && unlocked(idx + 1)) info.unlockedNext = idx + 2;
    track(r.win ? 'level_complete' : 'level_fail', { level: id, num: s.def.num, stars: r.stars, saved: Math.round(r.saved * 100), time: Math.round(r.timeUsed), reason: r.reason, dur, ...cont });
    // the finale's level_complete already marks the end of the campaign in the analytics
    if (r.win && id === FINALE_ID) info.campaign = campaignStats();
  } else if (current?.kind === 'daily') {
    const d = current.daily;
    info.eyebrow = t('dailyTitle', { n: d.num });
    const prev = save.daily[d.key];
    // today's daily reward, once (and at most 3 in any 24 h, whatever the phone's date says); replays pay like a level
    if (!prev && takeDailyReward(save)) info.coins = dailyCoins(r);
    if (!prev || r.score > prev.score) {
      info.newBest = !!prev && r.win;
      save.daily[d.key] = { score: r.score, stars: r.stars, saved: r.saved, time: r.timeUsed, win: r.win };
    }
    if (r.win && save.streak.last !== d.key) {
      save.streak.count = isYesterday(save.streak.last) ? save.streak.count + 1 : 1;
      save.streak.last = d.key;
    }
    info.best = save.daily[d.key]?.score ?? 0;
    info.footer = t('dailyAgain', { n: d.num + 1 });
    dailyRank = null;
    submitDaily(d.key, d.num, r.score, r.stars, r.saved, r.timeUsed).then((rk) => {
      dailyRank = rk;
      const el = document.getElementById('end-rank');
      if (!el || !rk) return;
      el.hidden = false;
      el.textContent = rankText(rk);
    });
    track(r.win ? 'daily_complete' : 'daily_fail', { num: d.num, stars: r.stars, saved: Math.round(r.saved * 100), time: Math.round(r.timeUsed), mod: d.mod.key, dur });
  }
  save.coins += info.coins;
  track('coins_earn', { src: current?.kind ?? 'level', n: info.coins });
  noteLevelEnd();
  store.save();
  endInfo = info;
}

function showEnd() {
  const r = sim!.result!;
  const info = endInfo!;
  mode = 'end';
  gameplayStop();
  if ((r.win && r.stars === 3) || info.campaign) happytime();
  setHudVisible(false);
  clearTutorial();
  wakeLock?.release().catch(() => undefined);
  wakeLock = null;
  audio.loops(false, 0, 0, 0);
  if (info.unlockedNext) {
    const n = info.unlockedNext;
    setTimeout(() => {
      if (mode === 'end') {
        toast(t('unlocked', { n }), 'good', 3200);
        audio.play('star', 3);
      }
    }, 1700);
  }
  renderEnd(false);
  maybeStarterOffer();
}

/** End screen. `instant` when coming back from the shop: no animations and nothing granted again. */
function renderEnd(instant: boolean) {
  const s = sim!;
  const r = s.result!;
  const info = endInfo!;
  const canDouble = !info.doubled && info.coins > 0 && canReward();
  if (canDouble && !instant) adOffered('double_coins');
  endScreen({
    r,
    eyebrow: info.eyebrow,
    best: info.best,
    newBest: info.newBest,
    hasNext: info.hasNext,
    footer: info.footer,
    shareText: () => shareFor(r),
    extraHtml: current?.kind === 'daily' ? `<div id="end-rank" class="rank"${dailyRank ? '' : ' hidden'}>${dailyRank ? rankText(dailyRank) : ''}</div>` : '',
    coins: info.coins,
    balance: save.coins,
    canDouble,
    instant,
    campaign: info.campaign,
    // the interstitial only goes before the next level's intro screen: never right before play (Retry) nor on
    // navigation (Menu, Android back)
    onNext: () =>
      leaveEnd(() => {
        if (current?.kind === 'level') openLevel(current.index + 1);
      }, true),
    onRetry: () => leaveEnd(retry),
    onMenu: () =>
      leaveEnd(() => {
        startAttract();
        showTitle();
      }),
    onShop: () => {
      audio.play('click');
      showShop('end');
    },
    onDouble: async () => {
      info.adSeen = true;
      if (!(await showRewarded('double_coins'))) {
        toast(t('adFail'), 'warn');
        return null;
      }
      save.coins += info.coins;
      track('coins_earn', { src: 'x2', n: info.coins });
      info.coins *= 2;
      info.doubled = true;
      store.save();
      return { coins: info.coins, balance: save.coins };
    },
    onShared: () => track('share', current?.kind === 'daily' ? { level: s.def.id, stars: r.stars } : { level: s.def.id, num: s.def.num, stars: r.stars }),
    onStar: (i) => {
      audio.play('star', i);
      if (save.settings.vibration) vibrate(15);
    },
    onCoin: () => audio.play('coin'),
  });
}

let leaving = false;
/** Next / Retry / Menu from the end screen; with `interstitial` (Next only), the interstitial in between when it is due. */
async function leaveEnd(go: () => void, interstitial = false) {
  if (leaving || adBusy) return;
  leaving = true;
  audio.play('click');
  if (interstitial && !endInfo?.adSeen) await maybeInterstitial();
  leaving = false;
  go();
}

/** One-time starter pack offer over the end screen, after the player's 2nd completed level (store only). */
function maybeStarterOffer() {
  const info = endInfo!;
  const product = storeProducts().find((p) => p.id === 'starter_pack');
  const completed = LEVELS.filter((L) => save.stars[L.id]).length;
  if (current?.kind !== 'level' || !sim?.result?.win || completed < 2 || save.starterOffered || save.owned.starter_pack || !product?.price) return;
  const price = product.price;
  setTimeout(() => {
    // still on this end screen, with nothing on top of it
    if (endInfo !== info || adBusy || !document.querySelector('#screens > .end-screen:last-child')) return;
    save.starterOffered = true;
    store.save();
    info.adSeen = true;
    track('offer_show', { id: 'starter_pack' });
    starterOffer({
      price,
      onBuy: async () => {
        buyToast(await buy('starter_pack'));
        if (endInfo === info && mode === 'end') renderEnd(true);
      },
      onClose: () => audio.play('click'),
    });
  }, 2600);
}

// ---------- main loop ----------
function adaptQuality(raw: number) {
  if ((save.settings.gfx ?? 'auto') !== 'auto' || document.hidden || mode === 'paused') return;
  if (raw > 0.2) return; // tab switch or hitch: ignore
  fps.t += raw;
  fps.n++;
  if (fps.t < 2.5) return;
  const avg = fps.t / fps.n;
  fps.t = fps.n = 0;
  fps.slow = avg > 1 / 40 ? fps.slow + 1 : 0;
  fps.fast = avg < 1 / 55 ? fps.fast + 1 : 0;
  const tier = stage.tier;
  let next: Tier | null = null;
  if (fps.slow >= 2 && tier !== 'low') {
    next = tier === 'high' ? 'medium' : 'low';
    fps.down = true;
  } else if (fps.fast >= 5 && tier === 'medium' && !fps.down && !fps.up) {
    next = 'high';
    fps.up = true;
  }
  if (next) {
    fps.slow = fps.fast = 0;
    stage.setTier(next);
    save.settings.autoTier = next;
    store.save();
    track('quality_tier', { tier: next, ms: Math.round(avg * 1000) });
  }
}

/** The last one or two flames: slow the world down and lean the camera in (great for clips). */
function lastFlameDrama(s: Sim) {
  if (stage.reducedMotion || (window as unknown as { __poster?: boolean }).__poster) return;
  let target = -1;
  if (s.burning > 0 && s.burning <= 2 && s.rocketsPending === 0 && s.embers.length === 0 && s.time > 6 && s.player.spraying) {
    let bd = 11;
    for (let i = 0; i < s.N; i++) {
      if (s.fire[i] <= 0) continue;
      const d = Math.hypot((i % s.W) + 0.5 - s.player.x, Math.floor(i / s.W) + 0.5 - s.player.z);
      if (d < bd) {
        bd = d;
        target = i;
      }
    }
  }
  if (target >= 0) {
    slowTarget = 0.42;
    const x = (target % s.W) + 0.5;
    const z = Math.floor(target / s.W) + 0.5;
    stage.focus = { x: (x + s.player.x) / 2, z: (z + s.player.z) / 2 };
    stage.zoomTarget = 0.8;
  } else if (slowTarget !== 1 || stage.focus) {
    slowTarget = 1;
    stage.focus = null;
    stage.zoomTarget = 1;
  }
}

// Detect high refresh screens (>= ~100 Hz) and render every other frame there: 120 Hz would otherwise
// double GPU work and battery drain. 60 and 90 Hz screens render every frame.
const raf = { prev: 0, samples: [] as number[], cap: false };
function frame(now: number) {
  requestAnimationFrame(frame);
  if (raf.samples.length < 40) {
    if (raf.prev) raf.samples.push(now - raf.prev);
    raf.prev = now;
    if (raf.samples.length === 40) {
      const sorted = [...raf.samples].sort((a, b) => a - b);
      raf.cap = sorted[20] < 9.6;
    }
  }
  if (raf.cap && now - lastTick < 12) return;
  lastTick = now;
  const raw = (now - last) / 1000;
  let dt = raw;
  last = now;
  if (dt > 0.1) dt = 0.1;
  if (dt < 0) dt = 0;
  if (rec.manual || adBusy) return;
  adaptQuality(raw);
  tick(dt);
}

/** Offline recording (promo videos): the page stops its own loop and advances exactly when asked. */
const rec = { manual: false, driver: null as Bot | null, render: true };

function tick(dt: number) {
  const s = sim;
  if (!s) return;
  if (slowHold > 0) {
    slowHold -= dt;
    if (slowHold <= 0) slowTarget = 1;
  }
  timeScale += (slowTarget - timeScale) * (1 - Math.exp(-8 * dt));
  const sdt = dt * timeScale;
  let steps = 0;
  if (mode === 'play' || mode === 'end') {
    acc += sdt;
    while (acc >= SIM_DT && steps < 6) {
      const inp = mode === 'play' ? buildInput(s) : { mx: 0, mz: 0, ax: 0, az: 0, aimDist: 0, spray: false, nozzle: 0 as const };
      s.step(inp);
      for (const ev of s.events) handleEvent(ev);
      s.events.length = 0;
      acc -= SIM_DT;
      steps++;
    }
    if (acc > SIM_DT * 3) acc = 0;
  } else if (mode === 'attract' && bot) {
    acc += dt;
    while (acc >= SIM_DT && steps < 6) {
      s.step(bot.update());
      for (const ev of s.events) stage.view?.onEvent(ev);
      s.events.length = 0;
      acc -= SIM_DT;
      steps++;
    }
    if (s.state !== 'play' && s.drops.length === 0) {
      startAttract();
      return;
    }
  }
  const paused = mode === 'paused';
  time += paused ? 0 : sdt;
  if (rec.render) stage.frame(paused ? 0 : sdt, time);

  if (mode === 'play') {
    const p = s.player;
    // fire loudness near the player
    let near = 0;
    const cx = Math.floor(p.x);
    const cz = Math.floor(p.z);
    for (let z = cz - 10; z <= cz + 10; z += 2)
      for (let x = cx - 10; x <= cx + 10; x += 2) {
        const c = s.cellAt(x + 0.5, z + 0.5);
        if (c >= 0 && s.fire[c] > 0) near++;
      }
    audio.loops(p.spraying, p.nozzle, near / 18, dt);
    $('#vignette').style.opacity = String(Math.min(1, Math.max(0, (p.heat - 0.3) / 0.6)));
    lastFlameDrama(s);
    minimap?.update(dt, stage, time);
    const states = s.rescuees.map((e) => e.state);
    updateHud({
      stars: s.def.stars,
      minSaved: s.def.minSaved,
      fled: s.fled,
      control: s.control,
      time: s.timeLeft,
      saved: s.saved,
      rescue: { total: s.rescuees.length, states },
      wind: s.windAngle,
      windStrength: s.windStrength,
      nozzle: p.nozzle,
      foam: s.foamLeft,
      foamMax: s.foamMax,
      rockets: s.rocketsPending,
      hasRockets: !!s.def.fireworks,
    });
    if (input.nozzle !== p.nozzle && p.nozzle === 0 && input.nozzle === 2) input.nozzle = 0;
    // tutorial
    if (tutorialNodes.length) {
      tutT += dt;
      if ((input.usedMove && input.usedAim) || tutT > 30) {
        clearTutorial();
        save.tutorialDone = true;
        store.save();
      }
    }
  } else {
    $('#vignette').style.opacity = '0';
  }
  if (mode === 'end' && endTimer > 0) {
    endTimer -= dt;
    if (endTimer <= 0) showEnd();
  }
  // world-anchored UI
  if (stage.view && (mode === 'play' || mode === 'end')) {
    const v = stage.view;
    const edges = mode === 'play' ? v.centers : [];
    updateIcons(stage, mode === 'play' ? v.labels : [], edges, t('tLever'));
  } else updateIcons(stage, [], [], '');
  updateFloaters(stage, dt);
}

// keep references used only for typing
void MATS;
void RESCUE_TYPES;

// test hook (used by the screenshot tool)
(window as unknown as { __apagalo: unknown }).__apagalo = {
  get mode() {
    return mode;
  },
  get sim() {
    return sim;
  },
  get input() {
    return input;
  },
  /** live save (coins, upgrades, ad counters) */
  get save() {
    return save;
  },
  /** ids of the campaign levels, in play order */
  get levels() {
    return LEVELS.map((L) => L.id);
  },
  get info() {
    const r = stage.renderer.info;
    return { calls: r.render.calls, tris: r.render.triangles, geos: r.memory.geometries, tex: r.memory.textures };
  },
  stage,
  /** fast-forward the running level with a fixed input (testing only) */
  advance(sec: number, inp: Partial<SimInput> = {}) {
    if (!sim) return;
    const full: SimInput = { mx: 0, mz: 0, ax: 0, az: 0, aimDist: 0, spray: false, nozzle: 0, ...inp };
    const n = Math.round(sec / SIM_DT);
    for (let i = 0; i < n && sim.state === 'play'; i++) {
      sim.step(full);
      for (const ev of sim.events) handleEvent(ev);
      sim.events.length = 0;
      if (i % 6 === 0) stage.view?.update(SIM_DT * 6, (time += SIM_DT * 6), stage.camera, stage.pxScale);
    }
  },
  /** promo recording: take over the loop; the bot plays the level */
  recStart() {
    rec.manual = true;
    rec.driver = sim ? new Bot(sim, SKILL_PRO) : null;
    (window as unknown as { __poster?: boolean }).__poster = false;
  },
  /** advance `n` steps of `dt` seconds; only the last one is rendered */
  recTick(dt: number, n = 1) {
    for (let i = 0; i < n; i++) {
      rec.render = i === n - 1;
      tick(dt);
    }
    rec.render = true;
  },
  /** CPU profile: bot plays `sec` seconds; returns ms per sim step, per view update and per render */
  profile(sec: number) {
    if (!sim) return null;
    const b = new Bot(sim, SKILL_PRO);
    const n = Math.round(sec / SIM_DT);
    let tSim = 0;
    let tBot = 0;
    let tView = 0;
    let views = 0;
    let maxBurn = 0;
    for (let i = 0; i < n && sim.state === 'play'; i++) {
      const a = performance.now();
      const inp = b.update();
      const c = performance.now();
      sim.step(inp);
      sim.events.length = 0;
      tSim += performance.now() - c;
      tBot += c - a;
      maxBurn = Math.max(maxBurn, sim.burning);
      if (i % 2 === 0) {
        const v0 = performance.now();
        stage.view?.update(SIM_DT * 2, (time += SIM_DT * 2), stage.camera, stage.pxScale);
        tView += performance.now() - v0;
        views++;
      }
    }
    const r0 = performance.now();
    for (let k = 0; k < 3; k++) stage.renderer.render(stage.scene, stage.camera);
    const tRender = (performance.now() - r0) / 3;
    return { simMs: +(tSim / n).toFixed(3), botMs: +(tBot / n).toFixed(3), viewMs: +(tView / views).toFixed(3), renderMsSwiftShader: +tRender.toFixed(1), maxBurn };
  },
  bot(sec: number) {
    if (!sim) return;
    const b = new Bot(sim, SKILL_PRO);
    const n = Math.round(sec / SIM_DT);
    for (let i = 0; i < n && sim.state === 'play'; i++) {
      sim.step(b.update());
      for (const ev of sim.events) handleEvent(ev);
      sim.events.length = 0;
      if (i % 6 === 0) stage.view?.update(SIM_DT * 6, (time += SIM_DT * 6), stage.camera, stage.pxScale);
    }
  },
};
