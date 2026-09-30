// The finale (level 67 in 1.3.0, the last one, #120, of the 2.0 route). See the note in ../levels.ts.
// "El gran incendio" / "The Big One": the whole town on fiesta night, with the fire truck at the crossroads in the
// middle and a fire in each quarter around it: the fair (south-west), the gas station with gas bottles by the pumps
// (south-east), the warehouses with a live electrical box (north-east) and the old quarter with the church
// (north-west), where the wind turns at 75 s to push a burning house towards the church. Rockets fall from 35 s.
// Every mechanic of the campaign at once, with a hydrant in each quarter. The skill it asks for is choosing what to
// save first: nearest-fire-first loses the old quarter. Bot (npx tsx tools/bot.ts 10 finale): PRO 90 %, casual 30 %
// (docs/dificultad.md).
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

/** Id of the finale: the game gives its card in the level select and its end screen a special look. */
export const FINALE_ID = 'finale';

function finale() {
  const b = new MB(36, 36, '.');
  // ---- crossroads: the road east-west and the avenue north-south, with the truck in the middle
  b.rect(0, 16, 36, 3, '=');
  b.hline(0, 35, 17, '-');
  b.rect(16, 0, 3, 36, '=');
  b.vline(17, 0, 35, '-');
  b.rect(14, 17, 4, 2, 'X');

  // ---- north-west: the old quarter, with the church and a house on fire
  b.rect(0, 1, 3, 4, 'H');
  b.rect(4, 1, 8, 4, 'I');
  b.rect(13, 1, 3, 4, 'H');
  b.rect(0, 6, 16, 2, '_');
  b.rect(1, 9, 4, 4, 'H');
  b.rect(7, 9, 4, 4, 'H');
  b.fire(1, 9, 2, 1);
  b.put(13, 10, 'T').put(12, 13, 'T').put(6, 14, 'T').put(1, 14, 'T');
  b.hline(2, 10, 15, 'h');
  b.put(3, 6, 'L').put(12, 6, 'L');
  b.put(12, 11, 'c');
  b.put(12, 7, 'Y');

  // ---- north-east: the warehouse district, with the live electrical box on fire
  b.rect(19, 0, 17, 16, '#');
  b.rect(20, 0, 6, 4, 'W');
  b.rect(29, 0, 7, 4, 'W');
  b.hline(20, 35, 4, 'k');
  b.vline(27, 5, 7, 'k');
  b.put(27, 8, 'E');
  b.fire(27, 8);
  b.hline(20, 25, 11, 'k').hline(29, 34, 11, 'k');
  b.put(21, 14, 'Z');
  b.put(34, 9, 'v');
  b.put(33, 13, 'Y');

  // ---- south-west: the fair on the square, with the churros stand on fire
  b.rect(0, 19, 16, 17, '_');
  b.rect(1, 21, 6, 2, 'S');
  b.rect(7, 21, 3, 2, 'C');
  b.rect(10, 21, 5, 2, 'S');
  b.fire(7, 21, 3, 2);
  b.rect(1, 25, 5, 3, 'w');
  b.rect(9, 26, 4, 4, 'F');
  b.put(6, 24, 'm').put(13, 24, 'm').put(7, 31, 'm').put(3, 30, 'm');
  b.put(0, 24, 'L').put(15, 24, 'L').put(0, 32, 'L').put(15, 32, 'L');
  b.put(8, 25, 'n').put(13, 30, 'n');
  b.rect(1, 33, 4, 1, 'S').rect(6, 33, 4, 1, 'S').rect(11, 33, 4, 1, 'S');
  b.put(3, 31, 'T').put(12, 31, 'T');
  b.hline(0, 15, 35, 'h');
  b.put(14, 27, 'Y');

  // ---- south-east: the gas station, with a car burning next to a pump
  b.rect(19, 19, 17, 17, '#');
  b.rect(29, 20, 6, 4, 'K');
  b.row(24, 21, 'oQo').row(24, 26, 'oQo');
  b.row(25, 21, 'AA');
  b.row(26, 21, 'o%oooo');
  b.fire(21, 25, 2, 1).fire(22, 26);
  b.row(29, 21, 'oQo').row(29, 26, 'oQo');
  b.put(27, 25, 'G').put(27, 26, 'G').put(28, 26, 'G');
  b.rect(22, 33, 2, 1, 'A').rect(27, 33, 2, 1, 'A');
  b.put(31, 30, 'd');
  b.put(20, 31, 'Y');
  b.vline(35, 19, 35, ',');
  for (const z of [27, 31, 35]) b.put(35, z, 'P');
  return b.done();
}

export const FINALE: LevelDef[] = [
  L(
    {
      id: FINALE_ID,
      theme: 'plaza',
      name: { es: 'El gran incendio', en: 'The Big One' },
      tip: {
        es: 'Arde todo el pueblo: espuma para la gasolina, corta la luz y engánchate a las bocas de riego para llegar a todo.',
        en: "The whole town's on fire: foam the fuel, cut the power and hook up to the hydrants to reach every corner.",
      },
      time: 260,
      hose: 18,
      foam: 18,
      wind: { angle: 0, strength: 0.25 },
      windShifts: [
        { t: 75, angle: -90, strength: 0.45 },
        { t: 150, angle: 90, strength: 0.35 },
      ],
      fireworks: { count: 8, first: 35, every: 22 },
      stars: [0.66, 0.75],
      minSaved: 0.5,
      night: true,
      // the last big fire gets the two events that make it harder (no bucket brigade to help)
      wantEvents: ['gust', 'leak'],
      under: '_',
    },
    finale(),
  ),
];
