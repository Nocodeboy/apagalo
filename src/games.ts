// The studio's other games, for the "More games" entry of the title screen (cross-promotion, docs/diseno-v2.md §5.11).
// One list for every build: web and Android show it; CrazyGames never does (no external links allowed there), nor
// does the Claude artifact. A game without `url` is not shown until it has one (set `url` and it appears).
import type { Txt } from './sim/types';

export interface StudioGame {
  id: string;
  name: Txt;
  tagline: Txt;
  /** public page of the game (web build); null while it is not out */
  url: string | null;
  /** accent colour and emoji of its card */
  color: string;
  emoji: string;
}

export const STUDIO_GAMES: StudioGame[] = [
  {
    id: 'tray-runner',
    name: { en: 'Tray Runner: Restaurant Rush', es: 'Tray Runner: Restaurant Rush' },
    tagline: { en: 'The fastest waiter in town: serve every table before they lose patience', es: 'El camarero más rápido del barrio: sirve cada mesa antes de que se cansen de esperar' },
    url: 'https://tray-runner.vercel.app',
    color: '#e8743a',
    emoji: '🍝',
  },
  {
    // the sheepdog game: hidden until it is published (give it its url then)
    id: 'round-em-up',
    name: { en: "Round 'Em Up!", es: '¡Pastoréalo!' },
    tagline: { en: 'Be the sheepdog: bring the flock home before sunset', es: 'Eres el perro pastor: lleva el rebaño al redil antes de que anochezca' },
    url: null,
    color: '#5aa84a',
    emoji: '🐑',
  },
];

/** Games to list on this build (none on CrazyGames or in the artifact). */
export function moreGames(target: string): StudioGame[] {
  if (target !== 'web' && target !== 'android') return [];
  return STUDIO_GAMES.filter((g) => g.url);
}

/** The game's link with the campaign tags, so the analytics of the other game see where players come from. */
export function gameLink(g: StudioGame, target: string): string {
  const u = new URL(g.url!);
  u.searchParams.set('utm_source', 'apagalo');
  u.searchParams.set('utm_medium', 'more_games');
  u.searchParams.set('utm_campaign', 'crosspromo');
  u.searchParams.set('utm_content', target);
  return u.toString();
}
