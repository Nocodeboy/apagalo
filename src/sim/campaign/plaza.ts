// Campaign levels of the "plaza" scenario (theme 'plaza'), in order: index 0 = the 2nd level of this scenario
// (block 1, easiest) ... index 9 = the 11th (block 10, hardest). Ids: 'plaza-2' ... 'plaza-11'. See the note in ../levels.ts.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

// The original square (level 1), redrawn here so a couple of levels can replay it with a new situation.
function plazaBase(b: MB) {
  b.rect(0, 0, 4, 4, 'H').rect(20, 0, 4, 4, 'H');
  b.rect(6, 0, 12, 4, 'I');
  b.vline(5, 0, 3, '.').vline(18, 0, 3, '.');
  b.put(5, 2, 'T').put(18, 2, 'T');
  b.put(0, 4, 'L').put(23, 4, 'L');
  b.row(4, 5, 'hh').row(4, 17, 'hh');
  b.rect(1, 6, 6, 2, 'S');
  b.rect(7, 6, 3, 2, 'C');
  b.rect(10, 6, 6, 2, 'S');
  b.rect(16, 5, 7, 3, 'w');
  b.put(5, 9, 'm').put(12, 9, 'm').put(20, 10, 'm');
  b.rect(10, 12, 4, 4, 'F');
  for (const [x, z] of [
    [3, 12],
    [20, 12],
    [3, 17],
    [20, 17],
  ]) {
    b.rect(x - 1, z - 1, 3, 3, '.');
    b.put(x, z, 'T');
  }
  b.put(0, 11, 'L').put(23, 11, 'L').put(0, 20, 'L').put(23, 20, 'L');
  b.put(8, 18, 'n').put(15, 18, 'n');
  b.rect(6, 20, 3, 1, 'S').rect(15, 20, 3, 1, 'S');
  b.hline(2, 6, 22, 'h').hline(17, 21, 22, 'h');
  b.rect(0, 23, 24, 5, '=');
  b.hline(0, 23, 25, '-');
  b.rect(2, 24, 4, 2, 'X');
  return b;
}

// ---------- 1 · Market day: a street market, two rows of stalls between two rows of houses ----------
function mercado() {
  const b = new MB(28, 22, '_');
  b.rect(0, 0, 8, 4, 'H').rect(9, 0, 8, 4, 'H').rect(18, 0, 6, 4, 'H');
  b.rect(24, 0, 4, 4, '.').put(25, 1, 'T').put(26, 3, 'T');
  b.put(8, 4, 'T').put(17, 4, 'T');
  // north row of stalls in front of the houses, south row across the street
  b.rect(1, 5, 6, 2, 'S').rect(7, 5, 3, 2, 'C').rect(10, 5, 6, 2, 'S').rect(17, 5, 6, 2, 'S').rect(24, 5, 3, 2, 'S');
  b.put(0, 8, 'L').put(27, 8, 'L');
  b.put(6, 9, 'm').put(19, 8, 'm').put(12, 10, 'm');
  b.rect(3, 12, 6, 2, 'S').rect(12, 12, 3, 2, 'S').rect(16, 12, 3, 2, 'C').rect(21, 12, 6, 2, 'S');
  b.put(1, 13, 'T').put(10, 14, 'n').put(20, 14, 'n');
  for (const x of [0, 6, 12, 18, 24]) b.rect(x, 15, 4, 3, 'H');
  b.rect(0, 18, 28, 4, '=');
  b.hline(0, 27, 20, '-');
  b.rect(11, 18, 4, 2, 'X');
  b.fire(10, 5, 2, 1);
  return b.done();
}

// ---------- 2 · The bullring: a ring of wooden stands around the sand ----------
function toros() {
  const b = new MB(26, 26, '_');
  const cx = 12.5;
  const cz = 11.5;
  b.circle(cx, cz, 11.6, 'w');
  b.circle(cx, cz, 8.6, '_');
  b.circle(cx, cz, 7.4, 'f');
  b.circle(cx, cz, 6.4, ';');
  // gates through the stands (south: to the truck, north: the bull pens)
  b.rect(11, 18, 4, 6, '_');
  b.rect(11, 0, 4, 4, '_');
  b.rect(12, 17, 2, 2, '_');
  // houses in the corners and a few trees
  b.rect(0, 0, 4, 4, 'H').rect(22, 0, 4, 4, 'H').rect(0, 19, 4, 4, 'H').rect(22, 19, 4, 4, 'H');
  b.put(5, 0, 'T').put(20, 0, 'T').put(0, 5, 'T').put(25, 5, 'T').put(5, 23, 'T').put(20, 23, 'T');
  b.put(9, 21, 'm').put(16, 22, 'm');
  b.rect(0, 24, 26, 2, '=');
  b.rect(16, 24, 4, 2, 'X');
  b.fire(1, 10, 2, 3);
  return b.done();
}

// ---------- 3 · The main square: houses on four sides, open corners ----------
function plazaMayor() {
  const b = new MB(28, 28, '_');
  // a back street runs all around the square, behind the houses
  for (const x of [4, 9, 15, 20]) b.rect(x, 1, 4, 3, 'H').rect(x, 20, 4, 3, 'H');
  b.rect(1, 5, 3, 14, 'H').rect(24, 5, 3, 14, 'H');
  b.rect(12, 10, 4, 4, 'F');
  b.put(10, 7, 'T').put(17, 7, 'T').put(10, 16, 'T').put(17, 16, 'T');
  // Sunday market: stalls along the arcades
  b.rect(6, 4, 6, 1, 'S').rect(16, 4, 6, 1, 'S');
  for (const z of [6, 9, 12, 15]) b.rect(4, z, 3, 2, z === 9 ? 'C' : 'S').rect(21, z, 3, 2, 'S');
  b.row(18, 10, 'n n').row(18, 15, 'n n');
  b.put(11, 9, 'm').put(16, 14, 'm').put(9, 12, 'm');
  b.put(0, 0, 'L').put(27, 0, 'L');
  b.rect(0, 24, 28, 4, '=');
  b.hline(0, 27, 26, '-');
  b.rect(12, 24, 4, 2, 'X');
  b.fire(4, 12, 2, 1).fire(22, 15, 2, 1);
  return b.done();
}

// ---------- 4 · The giant paella: a fair in the tree-lined park, with butane bottles by the cooking stands ----------
function paella() {
  const b = new MB(26, 24, '.');
  b.rect(0, 9, 26, 2, ':');
  b.rect(12, 0, 2, 19, ':');
  // the paella deck: a wooden floor with the cooking stands, their gas bottles and the long tables
  b.rect(1, 1, 10, 7, 'w');
  b.rect(2, 1, 3, 2, 'C').rect(7, 1, 3, 2, 'C');
  b.put(5, 1, 'G').put(5, 2, 'G').put(10, 2, 'G');
  b.row(4, 2, 'nnn nnn').row(6, 2, 'nnn nnn');
  // stalls on the other side of the avenue
  b.rect(15, 1, 10, 6, '_');
  b.rect(16, 2, 6, 2, 'S').put(22, 2, 'G');
  b.row(5, 16, 'nnn nnn');
  // the alameda: rows of trees along the paths
  for (let x = 1; x < 26; x += 3) if (x < 11 || x > 14) b.put(x, 11, 'T');
  for (let z = 1; z < 18; z += 3) b.put(11, z, 'T').put(14, z, 'T');
  // south lawns: dance floor and stalls
  b.rect(16, 13, 7, 4, 'w');
  b.rect(2, 13, 6, 2, 'S');
  b.put(4, 16, 'T').put(8, 17, 'T').put(24, 12, 'T');
  b.put(18, 15, 'm').put(6, 8, 'm').put(20, 7, 'm');
  b.rect(0, 19, 26, 1, '_');
  b.rect(0, 20, 26, 4, '=');
  b.hline(0, 25, 22, '-');
  b.rect(10, 20, 4, 2, 'X');
  b.fire(2, 1, 2, 2);
  return b.done();
}

// ---------- 6 · The pilgrimage: a hermitage at the top of a meadow ----------
function romeria() {
  // a meadow with bare patches; strips of dry grass lead up to the chapel
  const b = new MB(30, 28, '.');
  for (const [x, z, r] of [
    [3, 12, 2.5],
    [26, 12, 2.5],
    [10, 20, 2.5],
    [20, 20, 2.5],
    [8, 3, 2],
    [22, 3, 2],
  ])
    b.circle(x, z, r, ':');
  b.path(
    [
      [2, 21],
      [8, 15],
      [12, 8],
    ],
    ',',
    3,
  );
  b.path(
    [
      [24, 20],
      [20, 13],
      [19, 8],
    ],
    ',',
    3,
  );
  b.rect(8, 0, 14, 1, ':');
  b.rect(9, 1, 12, 4, 'I');
  b.rect(7, 5, 16, 2, '_');
  b.path(
    [
      [15, 23],
      [15, 17],
      [14, 11],
      [15, 7],
    ],
    ':',
    2,
  );
  b.rect(10, 9, 3, 2, 'S').rect(17, 12, 3, 2, 'S').rect(10, 15, 3, 2, 'S');
  b.put(9, 12, 'm').put(16, 15, 'm').put(13, 6, 'm').put(17, 6, 'm').put(11, 6, 'm');
  b.scatter('P', 22, ',.', 31, [0, 0, 30, 22], 3);
  b.rect(0, 23, 30, 1, ':');
  b.rect(0, 24, 30, 4, '=');
  b.hline(0, 29, 26, '-');
  b.rect(13, 24, 4, 2, 'X');
  b.fire(3, 19, 2, 2).fire(24, 20);
  return b.done();
}

// ---------- 7 · Fairground lights: the lighting box is on fire, the lever is across the square ----------
function luces() {
  const b = new MB(28, 26, '_');
  // houses behind the stage, with a lane behind them
  b.rect(1, 1, 7, 3, 'H').rect(9, 1, 10, 3, 'H').rect(20, 1, 7, 3, 'H');
  // the stage, the lighting box at its side and the stalls in front
  b.rect(6, 4, 14, 3, 'w');
  b.put(20, 5, 'E');
  b.rect(3, 7, 6, 2, 'S').rect(9, 7, 3, 2, 'C').rect(15, 7, 6, 2, 'S').rect(21, 7, 3, 2, 'S');
  b.put(1, 5, 'L').put(26, 5, 'L').put(1, 12, 'L').put(26, 12, 'L');
  b.put(12, 10, 'm').put(6, 11, 'm').put(19, 11, 'm');
  // second row of stalls, fountain and benches
  b.rect(3, 14, 6, 2, 'S').rect(12, 14, 4, 4, 'F').rect(19, 14, 6, 2, 'S');
  b.put(1, 18, 'T').put(26, 18, 'T').put(9, 19, 'n').put(18, 19, 'n');
  // the lever, on the far side of the square
  b.put(2, 17, 'Z');
  b.rect(0, 21, 28, 5, '=');
  b.hline(0, 27, 23, '-');
  b.rect(12, 22, 4, 2, 'X');
  b.fire(20, 5).fire(19, 5);
  return b.done();
}

// ---------- 8 · Fireworks night: garden beds and a wooden stage on a stone square ----------
function castillo() {
  const b = new MB(28, 28, '_');
  b.rect(0, 0, 4, 4, 'H').rect(5, 0, 4, 4, 'H').rect(19, 0, 4, 4, 'H').rect(24, 0, 4, 4, 'H');
  b.rect(10, 0, 8, 3, '.').put(12, 1, 'T').put(15, 1, 'T');
  // garden beds
  for (const [x, z] of [
    [2, 6],
    [21, 6],
    [2, 16],
    [21, 16],
  ]) {
    b.rect(x, z, 5, 4, '.');
    b.put(x + 2, z + 1, 'T');
    b.hline(x, x + 4, z + 3, 'h');
  }
  b.rect(9, 6, 10, 4, 'w');
  b.rect(10, 12, 3, 2, 'S').rect(15, 12, 3, 2, 'C');
  b.rect(12, 15, 4, 4, 'F');
  b.row(20, 8, 'n  n    n  n');
  b.put(0, 11, 'L').put(27, 11, 'L');
  b.put(8, 13, 'm').put(19, 13, 'm').put(13, 10, 'm');
  b.rect(0, 22, 28, 6, '=');
  b.hline(0, 27, 24, '-');
  b.rect(12, 23, 4, 2, 'X');
  b.fire(11, 6, 2, 1);
  return b.done();
}

// ---------- 10 · Last night of the fair: everything at once ----------
function finDeFiestas() {
  const b = new MB(30, 30, '_');
  b.rect(0, 0, 4, 4, 'H').rect(26, 0, 4, 4, 'H');
  b.rect(9, 0, 12, 4, 'I');
  b.rect(4, 0, 5, 3, '.').rect(21, 0, 5, 3, '.');
  b.put(6, 1, 'T').put(23, 1, 'T');
  // stage with the lighting box
  b.rect(10, 6, 10, 3, 'w');
  b.put(20, 7, 'E');
  // stalls, churros and the paella with gas bottles
  b.rect(1, 6, 6, 2, 'S').rect(23, 6, 6, 2, 'S');
  b.rect(2, 12, 3, 2, 'C').put(5, 12, 'G').put(5, 13, 'G');
  b.rect(24, 12, 3, 2, 'C').put(23, 12, 'G').put(27, 14, 'G');
  b.rect(9, 11, 12, 1, 'n');
  b.rect(13, 15, 4, 4, 'F');
  for (const [x, z] of [
    [4, 18],
    [25, 18],
  ]) {
    b.rect(x - 2, z - 1, 5, 4, '.');
    b.put(x, z, 'T');
  }
  b.rect(8, 20, 6, 2, 'S').rect(16, 20, 6, 2, 'S');
  b.put(0, 10, 'L').put(29, 10, 'L').put(0, 16, 'L').put(29, 16, 'L');
  b.put(15, 23, 'Z');
  b.put(9, 14, 'm').put(20, 14, 'm').put(12, 9, 'm').put(3, 9, 'm');
  b.rect(0, 25, 30, 5, '=');
  b.hline(0, 29, 27, '-');
  b.rect(13, 26, 4, 2, 'X');
  b.fire(20, 7).fire(18, 7, 2, 1).fire(2, 6, 2, 1).fire(24, 12, 2, 1);
  return b.done();
}

export const PLAZA: LevelDef[] = [
  L(
    {
      id: 'plaza-2',
      theme: 'plaza',
      name: { es: 'Día de mercado', en: 'Market day' },
      tip: { es: 'Los puestos están pegados: apaga el que arde antes de que prenda el de al lado.', en: 'The stalls are packed together: put out the burning one before it spreads to the next.' },
      time: 120,
      hose: 22,
      wind: { angle: 0, strength: 0.25 },
      stars: [0.8, 0.95],
      minSaved: 0.56,
      under: '_',
    },
    mercado(),
  ),
  L(
    {
      id: 'plaza-3',
      theme: 'plaza',
      name: { es: 'La plaza de toros', en: 'The bullring' },
      tip: { es: 'Las gradas de madera arden en círculo: rodea el fuego y córtalo por los dos lados.', en: 'The wooden stands burn in a ring: get around the fire and cut it off on both sides.' },
      time: 130,
      hose: 20,
      wind: { angle: 0, strength: 0.25 },
      stars: [0.8, 0.92],
      minSaved: 0.48,
      under: '_',
    },
    toros(),
  ),
  L(
    {
      id: 'plaza-4',
      theme: 'plaza',
      name: { es: 'La Plaza Mayor', en: 'The main square' },
      tip: { es: 'Arden dos puestos en lados opuestos. No dejes que uno crezca mientras apagas el otro.', en: "Two stalls are burning on opposite sides. Don't let one grow while you fight the other." },
      time: 140,
      hose: 22,
      wind: { angle: -60, strength: 0.45 },
      stars: [0.85, 0.93],
      minSaved: 0.6,
      under: '_',
    },
    plazaMayor(),
  ),
  L(
    {
      id: 'plaza-5',
      theme: 'plaza',
      name: { es: 'La paella gigante', en: 'The giant paella' },
      tip: { es: 'Las bombonas de butano explotan si se calientan: mójalas mientras apagas el fuego.', en: 'Butane bottles blow up if they get too hot: keep them wet while you fight the fire.' },
      time: 120,
      hose: 20,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.84, 0.89],
      minSaved: 0.73,
    },
    paella(),
  ),
  L(
    {
      id: 'plaza-6',
      theme: 'plaza',
      name: { es: 'Verbena nocturna', en: 'Night fair' },
      tip: { es: 'De noche se ve peor. Atento: el viento girará hacia la iglesia.', en: "It's harder to see at night. Watch out: the wind will turn toward the church." },
      time: 130,
      hose: 22,
      wind: { angle: 180, strength: 0.3 },
      windShifts: [{ t: 40, angle: -90, strength: 0.45 }],
      stars: [0.75, 0.9],
      minSaved: 0.66,
      night: true,
      under: '_',
    },
    (() => {
      const b = plazaBase(new MB(24, 28, '_'));
      b.fire(20, 5, 2, 2).fire(15, 20);
      return b.done();
    })(),
  ),
  L(
    {
      id: 'plaza-7',
      theme: 'plaza',
      name: { es: 'La romería', en: 'The pilgrimage' },
      tip: { es: 'Si arde la ermita, se acabó: frena el fuego de la pradera antes de que llegue.', en: "If the chapel burns, it's over: stop the grass fire before it gets there." },
      time: 150,
      hose: 20,
      wind: { angle: -70, strength: 0.3 },
      stars: [0.8, 0.9],
      minSaved: 0.58,
    },
    romeria(),
  ),
  L(
    {
      id: 'plaza-8',
      theme: 'plaza',
      name: { es: 'Las luces de la feria', en: 'Fairground lights' },
      tip: { es: 'El cuadro de las luces tiene corriente: baja la palanca roja antes de mojarlo.', en: 'The lighting box is live: pull the red lever before you spray it.' },
      time: 140,
      hose: 20,
      wind: { angle: 90, strength: 0.35 },
      stars: [0.8, 0.92],
      minSaved: 0.7,
      under: '_',
    },
    luces(),
  ),
  L(
    {
      id: 'plaza-9',
      theme: 'plaza',
      name: { es: 'Castillo de fuegos', en: 'Fireworks show' },
      tip: { es: 'Caen cohetes sobre la feria: moja la marca antes de que lleguen y no prenderán.', en: "Rockets are falling on the fair: wet the marked spot before they land and they won't catch." },
      time: 150,
      hose: 20,
      wind: { angle: 90, strength: 0.45 },
      fireworks: { count: 12, first: 8, every: 9 },
      stars: [0.85, 0.91],
      minSaved: 0.79,
      night: true,
      under: '_',
    },
    castillo(),
  ),
  L(
    {
      id: 'plaza-10',
      theme: 'plaza',
      name: { es: 'Tormenta de verano', en: 'Summer storm' },
      tip: { es: 'Tormenta seca: el viento va a cambiar dos veces. ¡Y hay bombonas junto a los churros!', en: 'Dry storm: the wind will shift twice. And there are gas bottles by the churro stand!' },
      time: 140,
      hose: 22,
      wind: { angle: 0, strength: 0.3 },
      windShifts: [
        { t: 35, angle: -90, strength: 0.45 },
        { t: 75, angle: 180, strength: 0.4 },
      ],
      stars: [0.75, 0.93],
      minSaved: 0.66,
      under: '_',
    },
    (() => {
      const b = plazaBase(new MB(24, 28, '_'));
      b.put(6, 8, 'G').put(10, 8, 'G');
      b.fire(1, 6, 2, 2).fire(3, 17);
      return b.done();
    })(),
  ),
  L(
    {
      id: 'plaza-11',
      theme: 'plaza',
      name: { es: 'Fin de fiestas', en: 'Last night of the fair' },
      tip: { es: 'Última noche: corta la luz, enfría las bombonas y no pierdas de vista los cohetes.', en: 'Last night: cut the power, cool the gas bottles and keep an eye on the rockets.' },
      time: 180,
      hose: 22,
      wind: { angle: 180, strength: 0.35 },
      windShifts: [{ t: 60, angle: 90, strength: 0.45 }],
      fireworks: { count: 12, first: 12, every: 10 },
      stars: [0.86, 0.92],
      minSaved: 0.8,
      night: true,
      under: '_',
    },
    finDeFiestas(),
  ),
];
