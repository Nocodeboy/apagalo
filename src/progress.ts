// Which levels are open, and how a save keeps what it had reached when the route changes (docs/diseno-v2.md §5.9).
// Pure rules on the save (no DOM), shared by the game and the tests.
import { LEGACY_ROUTE_13, LEVELS, levelIndex, ROUTE_VERSION } from './sim/levels';
import type { Save } from './storage';

const won = (save: Save, id: string) => (save.stars[id] ?? 0) >= 1;

/**
 * Linear unlocking: win the previous level (1 star or more). A level already won stays open whatever comes before it,
 * and so does a level the migration opened (it was behind the point the player had reached).
 */
export function isUnlocked(save: Save, i: number): boolean {
  if (i <= 0) return true;
  const L = LEVELS[i];
  if (!L) return false;
  return won(save, LEVELS[i - 1].id) || won(save, L.id) || save.open.includes(L.id);
}

/** The next level to play: the first open one without stars. */
export function nextLevelIndex(save: Save): number {
  for (let i = 0; i < LEVELS.length; i++) if (!won(save, LEVELS[i].id) && isUnlocked(save, i)) return i;
  // everything open is won: the first locked one's predecessor, or the last level
  for (let i = 0; i < LEVELS.length; i++) if (!isUnlocked(save, i)) return Math.max(0, i - 1);
  return LEVELS.length - 1;
}

/** Index of the furthest open level. */
export function reachIndex(save: Save): number {
  let r = 0;
  for (let i = 0; i < LEVELS.length; i++) if (isUnlocked(save, i)) r = i;
  return r;
}

/** Remember the furthest open level (by id): a later route change keeps everything up to it open. */
export function noteReach(save: Save) {
  save.reach = LEVELS[reachIndex(save)].id;
}

/**
 * After a route change (or on a save from 1.2.0 / 1.3.0, which has no `reach`): opens every level of the new route up
 * to the point the player had reached. Stars stay by id, so won levels keep them. Returns true if it ran.
 */
export function migrate(save: Save): boolean {
  if ((save.route ?? 0) >= ROUTE_VERSION) return false;
  const hadProgress = Object.values(save.stars).some((n) => n >= 1);
  let frontier = save.reach && levelIndex(save.reach) >= 0 ? save.reach : '';
  if (!frontier) {
    // older saves: the level after the furthest one won, in the 1.3.0 order (1.2.0 had its first 6 levels)
    let f = 0;
    LEGACY_ROUTE_13.forEach((id, k) => {
      if (won(save, id)) f = Math.max(f, k + 1);
    });
    frontier = LEGACY_ROUTE_13[Math.min(f, LEGACY_ROUTE_13.length - 1)];
  }
  let P = Math.max(0, levelIndex(frontier));
  LEVELS.forEach((L, i) => {
    if (won(save, L.id)) P = Math.max(P, i);
  });
  const open = new Set(save.open);
  for (let i = 0; i <= P; i++) if (!won(save, LEVELS[i].id)) open.add(LEVELS[i].id);
  save.open = LEVELS.filter((L) => open.has(L.id)).map((L) => L.id);
  // a player coming from an older version with progress sees what is new once
  if (!hadProgress || (save.route ?? 0) >= 2) save.whatsNew = Math.max(save.whatsNew ?? 0, 2);
  save.route = ROUTE_VERSION;
  noteReach(save);
  return true;
}
