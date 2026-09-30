// The ski lodge (theme 'nieve'), star mechanic: ice and snow. On ice ('!': frozen ponds, the skating rink, icy lanes)
// you slide: slow to get going and slower to stop. Deep snow ('s') slows you down and never burns: it is the
// firebreak, and the fire has to jump it with embers. The hydrants are frozen: the first time you hook up to one you
// chip the ice off (2.4 s instead of 0.6). The log chalets ('1') catch easier than brick, burn fast and throw embers.
// Always at blue hour (night). docs/diseno-v2.md §5.1.
// Index 0 is the scenario's intro; the route (../levels.ts) places every level. Ids never change once released.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

/** Packed snow (':') everywhere, the plowed road (3 rows from `roadZ`) and a snowbank under it. */
function resort(W: number, H: number, roadZ: number) {
  const b = new MB(W, H, ':');
  b.rect(0, roadZ, W, 3, '=');
  b.hline(0, W - 1, roadZ + 1, '-');
  if (roadZ + 3 < H) b.rect(0, roadZ + 3, W, H - roadZ - 3, 's');
  return b;
}
/** A strip of deep snow with pines on it. */
function woods(b: MB, x: number, z: number, w: number, h: number, n: number, seed: number) {
  b.rect(x, z, w, h, 's');
  b.scatter('P', n, 's', seed, [x, z, w, h], 2);
}

// ---------- 1 · The mountain hut (intro): a woodpile burns by the hut, a frozen pond on the way ----------
function refugio() {
  const b = resort(22, 20, 16);
  woods(b, 0, 0, 22, 3, 9, 21);
  // the hut, its deck and the woodpiles: the fire starts in the woodpile by its west wall
  b.rect(12, 3, 5, 4, '1');
  b.rect(11, 7, 7, 1, 'w');
  b.put(10, 3, 'k').put(10, 4, 'k').put(10, 5, 'k').put(10, 6, 'k').put(17, 4, 'k');
  b.put(13, 2, 'P').put(14, 2, 'P');
  b.fire(10, 4).fire(10, 5).fire(11, 7).fire(13, 2);
  // the ski shed to the east, with the skis in their rack
  b.rect(18, 9, 3, 3, '1');
  b.put(17, 10, 'f').put(17, 11, 'f');
  // a frozen pond between the road and the hut, and a frozen hydrant past it
  b.circle(7, 10, 3.2, '!');
  b.put(14, 11, 'Y');
  // drifts, snowmen, a bench and a lamp
  b.circle(2, 13, 2.2, 's');
  b.circle(20, 14, 1.6, 's');
  b.put(3, 6, 'r').put(18, 14, 'r');
  b.put(12, 13, 'n').put(9, 14, 'L');
  b.rect(2, 16, 4, 2, 'X');
  return b.done();
}

// ---------- 2 · The hotel terrace: a patio heater falls over on the terrace, a chalet's woodpile catches ----------
function terraza() {
  const b = resort(26, 24, 19);
  woods(b, 0, 0, 26, 2, 10, 31);
  // the hotel with its big wooden terrace, the tables and the ski racks
  b.rect(3, 2, 11, 5, 'H');
  b.rect(2, 7, 13, 3, 'w');
  b.put(4, 8, 'n').put(7, 8, 'n').put(10, 8, 'n').put(13, 8, 'n');
  b.hline(2, 6, 10, 'f');
  // chalets to the east
  b.rect(17, 3, 3, 3, '1').rect(21, 3, 3, 3, '1');
  b.rect(17, 8, 6, 3, '1');
  b.put(24, 9, 'k').put(24, 10, 'k');
  b.fire(2, 8).fire(3, 8).fire(24, 9).fire(22, 4);
  // the icy path up from the road, two frozen hydrants
  b.rect(9, 12, 7, 3, '!');
  b.put(15, 12, 'Y').put(3, 13, 'Y');
  b.circle(1, 15, 2.5, 's');
  b.circle(24, 16, 2, 's');
  b.put(20, 14, 'r').put(6, 15, 'L').put(18, 16, 'L');
  b.put(1, 8, 'v').put(22, 13, 'd');
  b.rect(10, 19, 4, 2, 'X');
  return b.done();
}

// ---------- 3 · The chairlift: the snack bar's kitchen and the lift's motor room are on fire ----------
function telesilla() {
  const b = resort(26, 26, 21);
  woods(b, 0, 0, 26, 3, 8, 41);
  // the lift line up the slope (pylons) and the station, with the queue fences and the snowmobiles
  b.put(13, 1, 'i').put(13, 3, 'i');
  b.rect(10, 5, 6, 3, '1');
  b.vline(9, 8, 11, 'f').vline(16, 8, 11, 'f');
  b.rect(19, 9, 2, 1, 'A').rect(19, 11, 2, 1, 'A').rect(22, 9, 2, 1, 'A');
  // the snack bar with its gas bottles and terrace
  b.rect(2, 6, 5, 3, '1');
  b.rect(2, 9, 5, 2, 'w');
  b.put(7, 7, 'G').put(7, 8, 'G');
  b.put(3, 10, 'n').put(5, 10, 'n');
  woods(b, 19, 3, 7, 5, 7, 43);
  b.put(23, 5, 'P').put(24, 5, 'P').put(23, 6, 'P');
  b.fire(2, 7).fire(15, 6).fire(23, 5);
  // the icy run-out at the bottom of the slope
  b.circle(12, 14, 3, '!');
  b.put(5, 14, 'Y').put(20, 15, 'Y');
  b.circle(2, 18, 2, 's');
  b.put(8, 17, 'r').put(17, 17, 'L').put(4, 17, 'L');
  b.put(12, 10, 'v').put(24, 13, 'v');
  b.rect(11, 21, 4, 2, 'X');
  return b.done();
}

// ---------- 4 · The skating rink: fire on both sides of the rink; across the ice is fast, if you can stop ----------
function pista() {
  const b = resort(28, 26, 21);
  woods(b, 0, 0, 28, 2, 9, 51);
  b.rect(1, 2, 6, 3, '1').rect(8, 2, 3, 3, '1').rect(17, 2, 3, 3, '1').rect(21, 2, 6, 3, '1');
  b.rect(1, 5, 26, 1, 'w');
  // the rink with its low fence, and gaps to get on and off
  b.rect(7, 8, 14, 8, '!');
  b.hline(6, 21, 7, 'f').hline(6, 21, 16, 'f').vline(6, 7, 16, 'f').vline(21, 7, 16, 'f');
  for (const [x, z] of [
    [13, 7],
    [14, 7],
    [13, 16],
    [14, 16],
    [6, 11],
    [6, 12],
    [21, 11],
    [21, 12],
  ])
    b.put(x, z, '!');
  // a Christmas tree in the middle of the rink
  b.put(14, 11, 'P');
  // the Christmas market to the south: stalls, benches and lamps
  b.rect(22, 17, 5, 2, 'S').rect(1, 17, 5, 2, 'S');
  b.put(9, 18, 'n').put(18, 18, 'n').put(8, 17, 'L').put(19, 17, 'L');
  b.fire(2, 3).fire(3, 3).fire(25, 17);
  b.put(3, 11, 'Y').put(24, 11, 'Y');
  b.circle(1, 9, 1.6, 's').circle(26, 9, 1.6, 's');
  b.put(10, 19, 'v').put(24, 7, 'v');
  b.rect(12, 21, 4, 2, 'X');
  return b.done();
}

// ---------- 5 · BIG FIRE: the whole resort on fire, from the hotel to the pine forest ----------
function estacionEsqui() {
  const b = resort(34, 32, 27);
  woods(b, 0, 0, 34, 3, 12, 61);
  // the hotel and its terrace (north-west)
  b.rect(2, 4, 10, 5, 'H');
  b.rect(2, 9, 10, 2, 'w');
  b.put(4, 10, 'n').put(8, 10, 'n');
  b.put(12, 6, 'G').put(12, 7, 'G');
  // the lift station (north) with its pylons
  b.put(18, 0, 'i').put(18, 2, 'i');
  b.rect(15, 4, 6, 3, '1');
  b.vline(14, 7, 9, 'f').vline(21, 7, 9, 'f');
  // the pine forest on the north-east slope
  woods(b, 23, 3, 11, 10, 16, 63);
  // the frozen lake (west) and the chalets in the middle
  b.circle(5, 17, 4, '!');
  b.rect(13, 11, 6, 3, '1').rect(13, 15, 6, 3, '1');
  b.put(19, 12, 'k').put(19, 16, 'k');
  // the Christmas market and the snowmobile garage (south-east)
  b.rect(21, 16, 5, 2, 'S');
  b.rect(26, 19, 6, 4, 'W');
  b.rect(22, 20, 2, 1, 'A').rect(22, 22, 2, 1, 'A');
  b.put(31, 18, 'k').put(30, 18, 'k');
  b.circle(11, 23, 2.2, 's');
  // four hydrants, all frozen
  b.put(12, 10, 'Y').put(22, 14, 'Y').put(9, 21, 'Y').put(25, 24, 'Y');
  b.put(27, 6, 'P').put(28, 5, 'P').put(26, 7, 'P');
  b.fire(8, 9).fire(9, 9).fire(27, 6).fire(31, 18);
  b.put(3, 12, 'v').put(20, 9, 'v').put(29, 14, 'd');
  b.put(17, 21, 'r').put(3, 24, 'r').put(14, 20, 'L').put(28, 25, 'L');
  b.rect(15, 27, 4, 2, 'X');
  return b.done();
}

// ---------- 6 · The snowy forest: pines on deep snow, embers jumping between them, a frozen creek ----------
function bosque() {
  const b = resort(30, 32, 27);
  b.rect(0, 0, 30, 27, 's');
  // trails through the forest
  b.path(
    [
      [15, 27],
      [14, 20],
      [9, 13],
      [8, 4],
    ],
    ':',
    1.6,
  );
  b.path(
    [
      [14, 20],
      [21, 14],
      [24, 5],
    ],
    ':',
    1.6,
  );
  // the frozen creek
  b.path(
    [
      [0, 17],
      [8, 16],
      [16, 12],
      [29, 10],
    ],
    '!',
    1.8,
  );
  // the forest cabin with its woodpiles, and a hunters' hide
  b.rect(4, 5, 4, 3, 'V');
  b.put(3, 8, 'k').put(4, 8, 'k').put(8, 6, 'k');
  b.rect(21, 18, 3, 3, '1');
  b.scatter('P', 150, 's', 71, [0, 0, 30, 26], 1);
  b.put(24, 4, 'P').put(25, 3, 'P').put(23, 2, 'P');
  b.fire(3, 8).fire(4, 8).fire(24, 4);
  b.put(9, 11, 'Y').put(19, 16, 'Y').put(25, 7, 'Y');
  b.put(10, 5, 'v').put(18, 22, 'd');
  b.rect(13, 27, 4, 2, 'X');
  return b.done();
}

// ---------- 7 · The alpine village: rows of log chalets and narrow icy lanes, and the chapel ----------
function aldea() {
  const b = resort(30, 28, 23);
  woods(b, 0, 0, 30, 2, 10, 81);
  // three rows of chalets with icy lanes between them
  for (const z of [3, 8, 13]) {
    b.rect(1, z, 6, 3, '1').rect(9, z, 3, 3, '1').rect(17, z, 6, 3, '1').rect(25, z, 3, 3, '1');
    b.rect(0, z + 3, 30, 2, '!');
  }
  b.rect(0, 18, 30, 2, '!');
  // the square with the chapel and the frozen fountain
  b.rect(12, 3, 5, 5, '_');
  b.rect(12, 3, 4, 3, 'I');
  b.rect(13, 11, 3, 3, '_');
  b.rect(13, 11, 2, 2, 'F');
  // woodpiles against the chalets and some wooden balconies
  b.put(8, 4, 'k').put(16, 9, 'k').put(24, 14, 'k').put(8, 14, 'k');
  b.rect(1, 11, 6, 1, 'w').rect(17, 11, 6, 1, 'w');
  b.fire(2, 3).fire(24, 14).fire(10, 8).fire(26, 4);
  b.put(12, 17, 'Y').put(24, 12, 'Y').put(5, 7, 'Y');
  b.put(27, 7, 'v').put(4, 19, 'c');
  b.rect(1, 20, 4, 2, 's').rect(22, 20, 6, 2, 's');
  b.put(8, 20, 'L').put(20, 20, 'L');
  b.rect(13, 23, 4, 2, 'X');
  return b.done();
}

// ---------- 8 · Blizzard night: strong wind, drifts across the paths, fire everywhere ----------
function ventisca() {
  const b = resort(32, 30, 25);
  woods(b, 0, 0, 32, 3, 12, 91);
  b.rect(3, 4, 9, 5, 'H');
  b.rect(3, 9, 9, 2, 'w');
  b.rect(15, 4, 3, 3, '1').rect(20, 4, 6, 3, '1');
  b.rect(15, 11, 6, 3, '1').rect(24, 10, 3, 3, '1');
  woods(b, 27, 4, 5, 12, 7, 93);
  b.rect(2, 14, 6, 3, '1');
  b.rect(10, 17, 5, 2, 'S');
  b.rect(19, 17, 2, 1, 'A').rect(22, 17, 2, 1, 'A');
  b.put(12, 7, 'G').put(12, 8, 'G');
  // snow drifts blown across the paths
  b.path(
    [
      [0, 12],
      [8, 12],
      [14, 15],
    ],
    's',
    1.5,
  );
  b.path(
    [
      [17, 8],
      [22, 9],
      [22, 15],
    ],
    's',
    1.5,
  );
  b.circle(26, 21, 2.5, '!').circle(7, 21, 2.2, '!');
  b.put(28, 7, 'P').put(29, 6, 'P');
  b.fire(4, 9).fire(21, 4).fire(15, 12).fire(28, 7).fire(3, 14);
  b.put(14, 9, 'Y').put(23, 15, 'Y').put(9, 19, 'Y').put(28, 20, 'Y');
  b.put(8, 12, 'v').put(18, 8, 'v').put(30, 22, 'd');
  b.put(16, 21, 'L').put(4, 22, 'L');
  b.rect(14, 25, 4, 2, 'X');
  return b.done();
}

export const NIEVE: LevelDef[] = [
  L(
    {
      id: 'nieve-1',
      theme: 'nieve',
      name: { es: 'El refugio', en: 'The mountain hut' },
      tip: {
        es: 'Sobre el HIELO resbalas: suelta antes de llegar. La nieve honda te frena. Las bocas de riego están heladas: quédate encima hasta romper el hielo.',
        en: 'On ICE you slide: let go before you get there. Deep snow slows you down. Hydrants are frozen: stand on one until the ice breaks.',
      },
      time: 130,
      hose: 14,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.93, 0.97],
      minSaved: 0.6,
    },
    refugio(),
  ),
  L(
    {
      id: 'nieve-2',
      theme: 'nieve',
      name: { es: 'La terraza del hotel', en: 'The hotel terrace' },
      tip: { es: 'Arde la terraza de madera y un montón de leña junto a los chalés. El camino helado es rápido, pero cuesta frenar.', en: 'The wooden terrace and a woodpile by the chalets are burning. The icy path is fast, but hard to stop on.' },
      time: 150,
      hose: 15,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.85, 0.88],
      minSaved: 0.42,
    },
    terraza(),
  ),
  L(
    {
      id: 'nieve-3',
      theme: 'nieve',
      name: { es: 'El telesilla', en: 'The chairlift' },
      tip: { es: 'Arden la cocina del bar y la sala de máquinas del telesilla. Enfría las bombonas del bar antes de que revienten.', en: 'The snack bar kitchen and the lift motor room are on fire. Cool the snack bar gas bottles before they blow.' },
      time: 150,
      hose: 15,
      wind: { angle: -90, strength: 0.3 },
      stars: [0.81, 0.84],
      minSaved: 0.55,
    },
    telesilla(),
  ),
  L(
    {
      id: 'nieve-4',
      theme: 'nieve',
      name: { es: 'La pista de patinaje', en: 'The skating rink' },
      tip: { es: 'Arde a los dos lados de la pista. Cruzar el hielo es lo más rápido si sabes frenar a tiempo.', en: 'Fire on both sides of the rink. Crossing the ice is quickest, if you know when to stop.' },
      time: 160,
      hose: 15,
      wind: { angle: 0, strength: 0.32 },
      stars: [0.73, 0.77],
      minSaved: 0.49,
    },
    pista(),
  ),
  L(
    {
      id: 'nieve-5',
      theme: 'nieve',
      name: { es: 'Fuego en la estación de esquí', en: 'Fire at the ski resort' },
      tip: {
        es: 'Arden el hotel, los chalés y el pinar. Rompe el hielo de las bocas de riego pronto: las vas a necesitar todas.',
        en: 'The hotel, the chalets and the pine forest are burning. Chip the ice off the hydrants early: you will need them all.',
      },
      headline: { es: 'FUEGO EN LA NIEVE: LA ESTACIÓN DE ESQUÍ SE SALVA', en: 'FIRE ON THE SLOPES: SKI RESORT SAVED' },
      time: 210,
      hose: 16,
      wind: { angle: 30, strength: 0.35 },
      windShifts: [{ t: 100, angle: -60, strength: 0.4 }],
      stars: [0.87, 0.93],
      minSaved: 0.63,
    },
    estacionEsqui(),
  ),
  L(
    {
      id: 'nieve-6',
      theme: 'nieve',
      name: { es: 'El bosque nevado', en: 'The snowy forest' },
      tip: { es: 'La nieve no arde, pero las pavesas saltan de pino en pino. Ve por los senderos: la nieve honda te frena.', en: "Snow won't burn, but embers leap from pine to pine. Stick to the trails: deep snow slows you down." },
      time: 170,
      hose: 15,
      wind: { angle: -30, strength: 0.45 },
      stars: [0.8, 0.85],
      minSaved: 0.74,
    },
    bosque(),
  ),
  L(
    {
      id: 'nieve-7',
      theme: 'nieve',
      name: { es: 'La aldea alpina', en: 'The alpine village' },
      tip: { es: 'Los chalés de troncos están pegados y los callejones, helados. Corta el fuego antes de que salte de una fila a otra.', en: 'The log chalets stand close and the lanes are icy. Cut the fire off before it jumps from one row to the next.' },
      time: 170,
      hose: 15,
      wind: { angle: 90, strength: 0.35 },
      windShifts: [{ t: 80, angle: 0, strength: 0.4 }],
      stars: [0.65, 0.7],
      minSaved: 0.59,
    },
    aldea(),
  ),
  L(
    {
      id: 'nieve-8',
      theme: 'nieve',
      name: { es: 'Noche de ventisca', en: 'Blizzard night' },
      tip: { es: 'Ventisca: viento muy fuerte que cambia, ventisqueros en los caminos y fuego por todas partes. Elige bien por dónde empezar.', en: 'A blizzard: a strong, shifting wind, drifts across the paths and fire everywhere. Pick where to start well.' },
      time: 190,
      hose: 16,
      wind: { angle: 0, strength: 0.5 },
      windShifts: [
        { t: 60, angle: 60, strength: 0.55 },
        { t: 130, angle: -45, strength: 0.5 },
      ],
      stars: [0.69, 0.74],
      minSaved: 0.56,
      // the blizzard knocks the power out, then a gust from the side: always, wherever the level is in the route
      fixedEvents: [
        { kind: 'blackout', t: 50 },
        { kind: 'gust', t: 105 },
      ],
    },
    ventisca(),
  ),
];
