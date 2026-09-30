// Save migration and route checks (no browser): saves from 1.2.0, 1.3.0 (at several points, with gaps, finished),
// from 2.0 entrega 1 (route 2) and CrazyGames cloud data must keep everything they had: stars, records, coins,
// upgrades, purchases and front pages, and have open every level up to where the player had got in the new route
// (including the levels inserted behind that point), and nothing far beyond it. Also checks the route itself.
// Usage: npx tsx tools/test_migration.ts   (npm run test:migration). Ends with "ALL OK" or the list of failures.

import { isUnlocked, migrate, nextLevelIndex, reachIndex } from '../src/progress';
import { FINALE_ID } from '../src/sim/campaign/finale';
import { LEGACY_ROUTE_13, LEVELS, levelIndex, ROUTE_VERSION } from '../src/sim/levels';
import * as store from '../src/storage';
import type { Save } from '../src/storage';

// storage.ts reads localStorage (only when loading/saving): a plain in-memory one for Node
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
} as Storage;


const fails: string[] = [];
let checks = 0;
function check(ok: boolean, what: string) {
  checks++;
  if (!ok) fails.push(what);
}
const KEY = 'apagalo.v1';
const ids = LEVELS.map((L) => L.id);
const won = (s: Save, id: string) => (s.stars[id] ?? 0) >= 1;

/** A save as an older version wrote it (only the fields it had). */
function oldSave(stars: Record<string, number>, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    v: 1,
    stars,
    best: Object.fromEntries(Object.keys(stars).map((id) => [id, 1000])),
    daily: { '2026-09-27': { score: 900, stars: 2, saved: 0.8, time: 90, win: true } },
    streak: { count: 2, last: '2026-09-28' },
    settings: { sfx: true, music: false, vibration: true, gfx: 'auto', autoTier: null, lang: 'en', stats: true },
    tutorialDone: true,
    firstOpen: false,
    seenTips: ['oil'],
    ...extra,
  };
}
/** Loads a raw save the way the game does (localStorage -> normalize -> migrate). */
function loadRaw(raw: Record<string, unknown>): Save {
  mem.clear();
  mem.set(KEY, JSON.stringify(raw));
  return store.load();
}
/**
 * Everything a save must have open after the migration: every level up to the point it had reached (`frontier`), or
 * up to its furthest won level in the new order if that is further (a level won in 1.3.0 may now sit later).
 */
function checkOpenUpTo(s: Save, frontier: string, tag: string) {
  check(levelIndex(frontier) >= 0, `${tag}: frontier ${frontier} is in the route`);
  let f = levelIndex(frontier);
  ids.forEach((id, i) => {
    if (won(s, id)) f = Math.max(f, i);
  });
  const closed = ids.slice(0, f + 1).filter((_, i) => !isUnlocked(s, i));
  check(!closed.length, `${tag}: everything up to #${f + 1} (${ids[f]}) is open (closed: ${closed.slice(0, 5).join(', ')})`);
  // nothing well beyond it, except levels that were won (and the one right after a won level)
  const far = ids.filter((id, i) => i > f + 1 && isUnlocked(s, i) && !won(s, id) && !won(s, ids[i - 1]));
  check(!far.length, `${tag}: nothing opened beyond the point reached (${far.slice(0, 5).join(', ')})`);
}

// ---------- the route ----------
{
  check(LEVELS.length === 120, `the route has 120 levels (${LEVELS.length})`);
  check(new Set(ids).size === ids.length, 'level ids are unique');
  check(LEVELS.every((L, i) => L.num === i + 1), 'num is the position');
  const missing = LEGACY_ROUTE_13.filter((id) => levelIndex(id) < 0);
  check(!missing.length, `every 1.3.0 level is still in the route (${missing.join(', ')})`);
  const twice = LEVELS.filter((L, i) => i > 0 && L.theme === LEVELS[i - 1].theme).map((L) => L.num);
  check(!twice.length, `never two levels in a row in the same place (${twice.join(', ')})`);
  const bigs = LEVELS.filter((L) => L.big).map((L) => L.num);
  check(JSON.stringify(bigs) === JSON.stringify([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]), `a big fire every 10 levels (${bigs.join(', ')})`);
  check(LEVELS[119].id === FINALE_ID, 'the finale is the last level');
  check(LEVELS.filter((L) => L.big).every((L) => !!L.headline), 'every big fire has its headline (front page)');
  const firsts = new Map<string, number>();
  LEVELS.forEach((L) => firsts.has(L.theme) || firsts.set(L.theme, L.num));
  check(firsts.size === 12, `12 places (${firsts.size})`);
  check((firsts.get('puerto') ?? 99) <= 15, 'a new place within the first 15 levels');
  for (const [th, n] of [
    ['nieve', 24],
    ['museo', 33],
    ['camping', 44],
  ] as const)
    check(firsts.get(th) === n && LEVELS[n - 1].intro === true, `${th} opens at ${n} with its calm intro`);
  check(LEVELS.filter((L) => L.intro).every((L) => !L.events?.length && !L.powerups?.length), 'intro levels have no events nor power-ups');
}

// ---------- a new player ----------
{
  const s = loadRaw({});
  check(s.route === ROUTE_VERSION && isUnlocked(s, 0) && !isUnlocked(s, 1), 'new player: only level 1 open');
  check(nextLevelIndex(s) === 0, 'new player: next level is the first');
}

// ---------- 1.2.0 (6 levels, no coins) ----------
{
  const s = loadRaw(oldSave({ plaza: 3 }));
  check(s.stars.plaza === 3 && s.coins === 0 && s.upgrades.hose === 0, '1.2.0 (1 won): stars kept, coins and upgrades at 0');
  checkOpenUpTo(s, 'granja', '1.2.0 (1 won)');
  check(nextLevelIndex(s) === 1, '1.2.0 (1 won): next is level 2');
  check(s.whatsNew < 2, "1.2.0: sees what's new in 2.0");
}
{
  const six = { plaza: 3, granja: 2, gasolinera: 1, poligono: 3, castanar: 2, sanjuan: 1 };
  const s = loadRaw(oldSave(six));
  check(Object.entries(six).every(([id, n]) => s.stars[id] === n), '1.2.0 (all 6): every star kept');
  checkOpenUpTo(s, 'plaza-2', '1.2.0 (all 6)');
  check(ids[nextLevelIndex(s)] === 'puerto-1', `1.2.0 (all 6): next is the docks (${ids[nextLevelIndex(s)]})`);
}

// ---------- 1.3.0 at several points of its 67-level campaign ----------
for (const k of [1, 7, 20, 33, 50, 66, 67]) {
  const stars = Object.fromEntries(LEGACY_ROUTE_13.slice(0, k).map((id, j) => [id, 1 + (j % 3)]));
  const pages = { 'plaza-11': { t: 1790000000000, stars: 3, saved: 0.9, score: 1500 } };
  const s = loadRaw(
    oldSave(stars, {
      coins: 4321,
      upgrades: { hose: 2, power: 1, speed: 0, time: 3 },
      owned: { remove_ads: true, starter_pack: true },
      iapTokens: ['tok-1', 'tok-2'],
      pages,
    }),
  );
  const tag = `1.3.0 (${k} won)`;
  check(Object.entries(stars).every(([id, n]) => s.stars[id] === n), `${tag}: every star kept`);
  check(Object.keys(stars).every((id) => s.best[id] === 1000), `${tag}: records kept`);
  check(s.coins === 4321 && s.upgrades.hose === 2 && s.upgrades.time === 3 && s.owned.remove_ads && s.owned.starter_pack, `${tag}: coins, upgrades and purchases kept`);
  check(JSON.stringify(s.iapTokens) === '["tok-1","tok-2"]', `${tag}: granted purchase tokens kept`);
  check(!!s.daily['2026-09-27'] && s.streak.count === 2, `${tag}: daily records and streak kept`);
  check(Object.keys(stars).every((id) => isUnlocked(s, levelIndex(id))), `${tag}: every won level is open`);
  const frontier = LEGACY_ROUTE_13[Math.min(k, LEGACY_ROUTE_13.length - 1)];
  checkOpenUpTo(s, frontier, tag);
  const nx = nextLevelIndex(s);
  check(isUnlocked(s, nx) && (!won(s, ids[nx]) || k === 67), `${tag}: the next level is open and not won yet (${ids[nx]})`);
  check(reachIndex(s) >= levelIndex(frontier) && s.reach === ids[reachIndex(s)], `${tag}: reach noted (${s.reach})`);
  // the new places inserted behind the point reached are playable
  const inserted = ids.slice(0, levelIndex(frontier) + 1).filter((id) => !LEGACY_ROUTE_13.includes(id));
  check(inserted.every((id) => isUnlocked(s, levelIndex(id))), `${tag}: the ${inserted.length} new levels behind the point reached are open`);
  if (k === 67) check(ids.every((_, i) => isUnlocked(s, i)), '1.3.0 (finished): the whole new route is open');
}

// ---------- 1.3.0 with gaps: some later levels won, earlier ones skipped ----------
{
  const stars = { plaza: 3, granja: 3, 'sanjuan-5': 2, 'castanar-6': 1 };
  const s = loadRaw(oldSave(stars));
  check(Object.keys(stars).every((id) => isUnlocked(s, levelIndex(id))), '1.3.0 with gaps: every won level open');
  const f = LEGACY_ROUTE_13[LEGACY_ROUTE_13.indexOf('castanar-6') + 1];
  checkOpenUpTo(s, f, '1.3.0 with gaps');
}

// ---------- 2.0 entrega 1 (route 2, 97 levels): its reach and open list ----------
{
  const s = loadRaw(
    oldSave(
      { plaza: 3, granja: 2, gasolinera: 3, poligono: 3, castanar: 2, sanjuan: 3, 'puerto-1': 3, 'plaza-2': 2, 'granja-2': 1, 'puerto-2': 3, 'ciudad-1': 2 },
      { route: 2, reach: 'castanar-2', open: ['gasolinera-2'], coins: 900, crew: { partner: 1, dog: 0, drone: 2 }, team: ['drone'], whatsNew: 2, pages: { 'puerto-2': { t: 1790000000000, stars: 3, saved: 0.9, score: 1500 } } },
    ),
  );
  check(s.route === ROUTE_VERSION, '2.0 entrega 1: migrated to the final route');
  checkOpenUpTo(s, 'castanar-2', '2.0 entrega 1');
  check(s.crew.partner === 1 && s.crew.drone === 2 && s.team[0] === 'drone' && s.coins === 900, '2.0 entrega 1: crew, team and coins kept');
  check(!!s.pages['puerto-2'], '2.0 entrega 1: front page kept');
  check(s.whatsNew === 2, "2.0 entrega 1: what's new is not shown again");
}

// ---------- idempotent ----------
{
  const s = loadRaw(oldSave(Object.fromEntries(LEGACY_ROUTE_13.slice(0, 25).map((id) => [id, 2]))));
  const before = JSON.stringify(s);
  check(!migrate(s) && JSON.stringify(s) === before, 'migrating twice changes nothing');
  store.save();
  const again = store.load();
  check(JSON.stringify(again) === before, 'saved and loaded again: the same');
}

// ---------- CrazyGames cloud data (the portal copy wins, and is migrated too) ----------
{
  mem.clear();
  const local = store.load();
  local.coins = 50;
  store.save();
  const portal = new Map<string, string>();
  const kv = { getItem: (k: string) => portal.get(k) ?? null, setItem: (k: string, v: string) => void portal.set(k, v) };
  // no portal copy yet: the local save is copied there
  check(!store.useCloud(kv) && JSON.parse(portal.get(KEY)!).coins === 50, 'cloud: the local save is copied to the portal the first time');
  // a 1.3.0 copy in the portal (from another device)
  const stars = Object.fromEntries(LEGACY_ROUTE_13.slice(0, 30).map((id) => [id, 3]));
  portal.set(KEY, JSON.stringify(oldSave(stars, { coins: 7000, upgrades: { hose: 5, power: 5, speed: 5, time: 5 } })));
  const live = store.data();
  const changed = store.useCloud(kv);
  const s = store.data();
  check(changed && s === live, 'cloud: the portal copy is loaded into the live save object');
  check(s.coins === 7000 && Object.entries(stars).every(([id, n]) => s.stars[id] === n), 'cloud: portal progress kept (coins, stars)');
  checkOpenUpTo(s, LEGACY_ROUTE_13[30], 'cloud (1.3.0 copy)');
  check(JSON.parse(mem.get(KEY)!).route === ROUTE_VERSION, 'cloud: the migrated save is written back locally');
  store.save();
  check(JSON.parse(portal.get(KEY)!).route === ROUTE_VERSION, 'cloud: and to the portal');
}

console.log(`${checks} checks`);
if (fails.length) {
  console.log('FAILED:\n- ' + fails.join('\n- '));
  process.exit(1);
}
console.log('ALL OK');
