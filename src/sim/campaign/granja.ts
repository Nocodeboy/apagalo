// Campaign levels of the "granja" scenario (theme 'granja'), in order: index 0 = the 2nd level of this scenario
// (block 1, easiest) ... index 9 = the 11th (block 10, hardest). Ids: 'granja-2' ... 'granja-11'. See the note in ../levels.ts.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

// Rosa's farm (level 2), redrawn here so a couple of levels can replay it with a new situation.
function granjaBase(b: MB) {
  b.rect(11, 0, 17, 17, ',');
  for (const z of [1, 4, 11, 14]) b.hline(11, 27, z, '.');
  b.rect(22, 9, 6, 8, '.');
  b.vline(10, 0, 16, ':');
  b.rect(0, 17, 28, 3, ':');
  b.rect(5, 0, 5, 4, 'H');
  b.put(3, 2, 'd');
  b.rect(24, 0, 4, 3, '~');
  b.put(23, 0, 'T').put(22, 1, 'T');
  b.rect(3, 8, 6, 5, 'B');
  b.put(1, 10, 'b').put(1, 12, 'b').put(0, 13, 'b').put(1, 13, 'b').put(4, 14, 'b');
  b.vline(2, 4, 6, 'h');
  for (const [x, z] of [
    [17, 2],
    [15, 12],
    [22, 12],
    [19, 15],
    [25, 7],
    [12, 6],
  ])
    b.put(x, z, 'b');
  b.outline(14, 5, 8, 5, 'f');
  b.put(16, 9, ',');
  b.put(16, 6, 'e').put(19, 7, 'e').put(17, 8, 'e');
  for (const [x, z] of [
    [0, 0],
    [2, 1],
    [27, 4],
    [27, 10],
    [0, 15],
    [27, 15],
    [13, 15],
  ])
    b.put(x, z, 'T');
  b.put(5, 15, 'Y');
  b.rect(12, 18, 4, 2, 'X');
  b.put(20, 21, 'T').put(21, 21, 'T').put(6, 22, 'T').put(12, 21, 'h').put(13, 21, 'h').put(14, 21, 'h');
  return b;
}

// ---------- 1 · The sheep pen: hay bales burning against its fence ----------
function redil() {
  const b = new MB(24, 22, ':');
  b.rect(1, 1, 5, 3, 'H');
  b.put(2, 6, 'd');
  // the pen on its patch of pasture, with the gate to the south
  b.rect(12, 2, 8, 6, '.');
  b.outline(12, 2, 8, 6, 'f');
  b.put(15, 7, ':');
  b.put(15, 4, 'e').put(17, 3, 'e').put(18, 5, 'e').put(16, 6, 'e');
  // hay bales against the west fence
  b.put(11, 3, 'b').put(11, 4, 'b').put(10, 5, 'b').put(11, 6, 'b');
  // stubble downwind of the pen, and some pasture to the south
  b.rect(20, 0, 4, 12, ',');
  b.put(22, 2, 'T').put(21, 8, 'T');
  b.rect(0, 9, 10, 8, '.').rect(14, 10, 10, 7, '.');
  for (const [x, z] of [
    [2, 10],
    [6, 12],
    [16, 11],
    [19, 14],
    [3, 16],
  ])
    b.put(x, z, 'T');
  b.put(8, 14, 'b').put(15, 15, 'b');
  b.rect(10, 18, 4, 2, 'X');
  b.put(1, 20, 'T').put(22, 20, 'T');
  b.fire(11, 4).fire(11, 3);
  return b.done();
}

// ---------- 2 · The wheat field: hay bales burning on the track, ripe wheat all around ----------
function trigal() {
  const b = new MB(28, 26, ',');
  b.rect(0, 7, 28, 2, ':');
  b.rect(13, 0, 2, 16, ':');
  // a few green patches and trees on the field edges
  b.rect(23, 10, 5, 5, '.');
  b.put(25, 12, 'T').put(1, 12, 'T').put(20, 3, 'T');
  // hay bales left on the track after the harvest: the fire starts here
  b.put(5, 7, 'b').put(6, 7, 'b').put(20, 8, 'b').put(13, 12, 'b');
  // the farm, right below the field
  b.rect(0, 16, 28, 6, '.');
  b.rect(2, 18, 6, 3, 'H');
  b.rect(19, 18, 6, 3, 'B');
  b.put(10, 17, 'b').put(11, 17, 'b').put(16, 18, 'b');
  b.put(9, 18, 'd').put(26, 20, 'e').put(17, 20, 'e');
  b.rect(0, 22, 28, 4, ':');
  b.rect(12, 22, 4, 2, 'X');
  b.put(3, 24, 'T').put(24, 24, 'T');
  b.fire(5, 7, 2, 1);
  return b.done();
}

// ---------- 3 · The orchard: rows of fruit trees throwing embers on the wind ----------
function frutales() {
  // each row of trees stands on a band of grass, with a mown path between the rows
  const b = new MB(26, 26, ':');
  for (let z = 1; z < 18; z += 3) {
    b.rect(0, z, 22, 3, '.');
    for (let x = 0; x < 22; x++) if (x % 7 !== 3 && z < 16) b.put(x, z + 2, ':');
    for (let x = 1; x < 22; x += 2) b.put(x, z, 'T');
  }
  // the farmhouse and the hay store downwind of the orchard
  b.rect(23, 1, 3, 3, 'H');
  b.rect(23, 6, 3, 2, 'b').put(24, 8, 'b');
  b.rect(23, 12, 3, 5, '.');
  b.put(24, 14, 'a').put(24, 11, 'a');
  b.rect(0, 19, 26, 1, '.');
  b.rect(3, 21, 5, 3, 'B');
  b.rect(11, 22, 4, 2, 'X');
  b.put(20, 21, 'T').put(24, 23, 'T');
  b.fire(1, 7).fire(0, 7).fire(2, 7);
  return b.done();
}

// ---------- 4 · The irrigation ditch: cross by the footbridges ----------
function acequia() {
  const b = new MB(28, 28, '.');
  // the far bank: a dirt yard with the hay, and the stubble downwind of it
  b.rect(14, 0, 14, 22, ':');
  b.rect(15, 7, 13, 14, ',');
  b.path(
    [
      [11, 0],
      [13, 8],
      [11, 15],
      [13, 21],
    ],
    '~',
    2.2,
  );
  // footbridges
  b.rect(10, 4, 5, 2, '_');
  b.rect(10, 11, 5, 2, '_');
  b.rect(10, 18, 6, 2, '_');
  // west bank: the farmhouse and the vegetable garden
  b.rect(0, 0, 9, 1, ':');
  b.rect(1, 1, 6, 3, 'H');
  b.rect(1, 7, 6, 5, ':');
  for (let z = 7; z < 12; z += 2) b.hline(1, 6, z, 'h');
  b.put(3, 14, 'T').put(7, 16, 'T');
  // east bank: hay, goats and a shed
  b.put(19, 3, 'b').put(20, 3, 'b').put(19, 4, 'b').put(24, 5, 'b').put(17, 14, 'b');
  b.rect(22, 1, 5, 3, 'B');
  b.put(16, 1, 'a').put(26, 5, 'a').put(3, 5, 'd');
  b.put(26, 17, 'T').put(21, 11, 'T').put(18, 18, 'T');
  b.rect(0, 22, 28, 6, ':');
  b.rect(3, 23, 4, 2, 'X');
  b.put(20, 24, 'T').put(25, 25, 'T');
  b.fire(19, 3, 2, 2);
  return b.done();
}

// ---------- 5 · Diesel spill: the tractor shed ----------
function gasoleo() {
  const b = new MB(26, 24, ':');
  b.rect(1, 1, 6, 4, 'W');
  // the diesel spill under the tractor, the hay stack right next to it and the barn
  b.rect(8, 2, 6, 4, 'o');
  b.rect(9, 1, 2, 1, 'A');
  b.put(8, 3, '%').put(9, 3, '%').put(8, 4, '%').put(9, 4, '%');
  b.put(14, 2, 'b').put(14, 3, 'b').put(14, 4, 'b').put(15, 3, 'b').put(15, 4, 'b');
  b.rect(17, 1, 6, 4, 'B');
  b.row(7, 8, 'kkk kkk');
  b.put(3, 7, 'd').put(24, 6, 'c');
  // stubble between the yard and the house
  b.rect(0, 10, 26, 7, ',');
  b.put(5, 12, 'T').put(19, 14, 'T').put(12, 11, 'e').put(22, 12, 'e');
  b.rect(2, 18, 5, 3, 'H');
  b.rect(12, 19, 4, 2, 'X');
  return b.done();
}

// ---------- 7 · The well pump: its power box is on fire, the lever is at the house ----------
function pozo() {
  // the wheat is ripe on the north half; the pump stands at its edge
  const b = new MB(28, 26, ':');
  b.rect(0, 0, 28, 7, ',');
  b.rect(9, 0, 1, 7, ':').rect(19, 0, 1, 7, ':');
  b.rect(2, 10, 6, 3, 'B');
  // well, pump house and its power box, with hay around it
  b.rect(12, 10, 3, 3, '~');
  b.put(15, 11, 'E');
  b.put(16, 10, 'b').put(16, 11, 'b').put(15, 10, 'b').put(11, 10, 'b');
  // the sheep pen on its pasture
  b.rect(19, 9, 7, 6, '.');
  b.outline(19, 9, 7, 6, 'f');
  b.put(22, 14, ':');
  b.put(21, 11, 'e').put(23, 12, 'e').put(24, 10, 'a');
  b.rect(8, 15, 10, 3, '.');
  b.put(4, 15, 'T').put(22, 17, 'T').put(25, 19, 'T').put(9, 16, 'T');
  // farmhouse with the lever by the door
  b.rect(1, 19, 6, 3, 'H');
  b.put(7, 20, 'Z');
  b.put(3, 17, 'c');
  b.rect(14, 22, 4, 2, 'X');
  b.fire(15, 11).fire(16, 11).fire(16, 10).fire(2, 10, 2, 1);
  return b.done();
}

// ---------- 9 · The farmhouse: a courtyard with gas bottles by the kitchen ----------
function cortijo() {
  // olive grove around the farmhouse, stubble to the south
  const b = new MB(30, 28, ':');
  b.rect(0, 0, 30, 2, '.');
  b.rect(0, 18, 30, 4, ',');
  for (const [x, z] of [
    [1, 1],
    [6, 0],
    [13, 1],
    [21, 0],
    [28, 1],
    [1, 8],
    [28, 7],
    [1, 14],
    [28, 14],
  ])
    b.put(x, z, 'T');
  // buildings around the courtyard: house and kitchen to the west, barn and stables to the east
  b.rect(4, 3, 10, 3, 'H');
  b.rect(16, 3, 10, 3, 'B');
  b.rect(4, 7, 3, 9, 'H');
  b.rect(23, 7, 3, 9, 'B');
  // the courtyard garden, the gas bottles by the kitchen door and the hay against the barn
  b.rect(7, 7, 16, 9, '.');
  b.rect(7, 11, 16, 1, ':');
  b.put(8, 7, 'G').put(9, 7, 'G').put(7, 9, 'G');
  b.put(11, 9, 'T').put(18, 9, 'T').put(11, 13, 'T').put(18, 13, 'T');
  b.put(20, 7, 'b').put(21, 7, 'b').put(22, 7, 'b').put(21, 8, 'b').put(22, 8, 'b').put(22, 15, 'b').put(21, 15, 'b');
  b.put(12, 15, 'e').put(16, 8, 'd').put(20, 12, 'a').put(9, 13, 'c');
  b.rect(13, 23, 4, 2, 'X');
  b.put(3, 25, 'T').put(26, 25, 'T');
  b.fire(20, 7, 3, 1);
  return b.done();
}

// ---------- 10 · Harvest blaze: everything at once ----------
function cosecha() {
  // two wheat fields to the north, the farmyard in the middle, the house to the south
  const b = new MB(30, 30, ':');
  b.rect(0, 0, 13, 9, ',').rect(17, 0, 13, 9, ',');
  b.rect(0, 12, 30, 9, '.');
  b.rect(0, 16, 30, 1, ':').rect(10, 12, 2, 9, ':');
  // the shed with the grain dryer's power box
  b.rect(17, 12, 6, 3, 'W');
  b.put(23, 13, 'E');
  // barn, gas bottles and hay
  b.rect(2, 12, 6, 3, 'B');
  b.put(8, 12, 'G').put(8, 13, 'G');
  for (const [x, z] of [
    [4, 9],
    [5, 9],
    [20, 9],
    [21, 9],
    [26, 10],
    [13, 18],
    [25, 18],
  ])
    b.put(x, z, 'b');
  b.put(2, 19, 'e').put(27, 19, 'e').put(1, 15, 'a').put(28, 13, 'd');
  b.rect(2, 23, 6, 3, 'H');
  b.put(8, 24, 'Z');
  b.put(12, 23, 'T').put(20, 24, 'T').put(25, 22, 'T');
  b.rect(13, 26, 4, 2, 'X');
  b.fire(23, 13).fire(22, 12).fire(4, 9, 2, 1);
  return b.done();
}

export const GRANJA: LevelDef[] = [
  L(
    {
      id: 'granja-2',
      theme: 'granja',
      name: { es: 'El redil', en: 'The sheep pen' },
      tip: { es: 'Arden las pacas junto al redil. Acércate a las ovejas para sacarlas a tiempo.', en: 'The hay by the pen is on fire. Walk up to the sheep to lead them out in time.' },
      time: 120,
      hose: 18,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.8, 0.92],
      minSaved: 0.5,
    },
    redil(),
  ),
  L(
    {
      id: 'granja-3',
      theme: 'granja',
      name: { es: 'El trigal', en: 'The wheat field' },
      tip: { es: 'El trigo seco arde en un momento: apaga las pacas antes de que el fuego salte al campo.', en: 'Dry wheat goes up in seconds: put out the bales before the fire jumps into the field.' },
      time: 120,
      hose: 20,
      wind: { angle: 90, strength: 0.38 },
      stars: [0.86, 0.93],
      minSaved: 0.75,
    },
    trigal(),
  ),
  L(
    {
      id: 'granja-4',
      theme: 'granja',
      name: { es: 'Los frutales', en: 'The orchard' },
      tip: { es: 'Las copas sueltan pavesas con el viento: vigila las filas de delante.', en: 'Burning treetops throw embers on the wind: watch the rows ahead.' },
      time: 90,
      hose: 20,
      wind: { angle: 0, strength: 0.5 },
      stars: [0.85, 0.93],
      minSaved: 0.7,
    },
    frutales(),
  ),
  L(
    {
      id: 'granja-5',
      theme: 'granja',
      name: { es: 'La acequia', en: 'The irrigation ditch' },
      tip: { es: 'Cruza la acequia por las pasarelas y apaga la paja antes de que prenda el rastrojo.', en: 'Cross the ditch by the footbridges and put out the hay before the stubble catches.' },
      time: 120,
      hose: 18,
      wind: { angle: 90, strength: 0.5 },
      stars: [0.9, 0.96],
      minSaved: 0.8,
    },
    acequia(),
  ),
  L(
    {
      id: 'granja-6',
      theme: 'granja',
      name: { es: 'Gasóleo derramado', en: 'Diesel spill' },
      tip: { es: 'El gasóleo no se apaga con agua: ESPUMA para el charco y agua para la paja.', en: "Water won't put out diesel: FOAM for the spill, water for the hay." },
      time: 80,
      hose: 18,
      foam: 12,
      wind: { angle: 0, strength: 0.35 },
      stars: [0.86, 0.93],
      minSaved: 0.7,
    },
    gasoleo(),
  ),
  L(
    {
      id: 'granja-7',
      theme: 'granja',
      name: { es: 'Viento revuelto', en: 'Shifting winds' },
      tip: { es: 'El viento girará dos veces: adelántate y moja por donde va a ir el fuego.', en: "The wind will shift twice: get ahead and wet the ground where the fire's heading." },
      time: 160,
      hose: 18,
      wind: { angle: 180, strength: 0.3 },
      windShifts: [
        { t: 40, angle: 90, strength: 0.45 },
        { t: 90, angle: 0, strength: 0.45 },
      ],
      stars: [0.7, 0.8],
      minSaved: 0.45,
    },
    (() => {
      const b = granjaBase(new MB(28, 24, '.'));
      b.fire(25, 7).fire(22, 12);
      return b.done();
    })(),
  ),
  L(
    {
      id: 'granja-8',
      theme: 'granja',
      name: { es: 'La bomba del pozo', en: 'The well pump' },
      tip: { es: 'El cuadro de la bomba tiene corriente: baja la palanca de la casa antes de mojarlo.', en: "The pump's power box is live: pull the lever by the house before you spray it." },
      time: 120,
      hose: 20,
      wind: { angle: -60, strength: 0.45 },
      stars: [0.88, 0.95],
      minSaved: 0.785,
    },
    pozo(),
  ),
  L(
    {
      id: 'granja-9',
      theme: 'granja',
      name: { es: 'Noche en la granja', en: 'Night on the farm' },
      tip: { es: 'De noche y con los animales sueltos: rescátalos a todos para la tercera estrella.', en: "It's night and the animals are loose: rescue them all for the third star." },
      time: 150,
      hose: 18,
      wind: { angle: 90, strength: 0.4 },
      stars: [0.86, 0.93],
      minSaved: 0.79,
      night: true,
    },
    (() => {
      const b = granjaBase(new MB(28, 24, '.'));
      b.put(12, 3, 'a').put(24, 13, 'a').put(8, 6, 'c');
      b.fire(4, 14).fire(12, 6);
      return b.done();
    })(),
  ),
  L(
    {
      id: 'granja-10',
      theme: 'granja',
      name: { es: 'El cortijo', en: 'The farmhouse' },
      tip: { es: 'Hay bombonas de butano en el patio: enfríalas, y ojo, que el viento va a girar.', en: 'There are gas bottles in the courtyard: keep them cool, and mind the wind shift.' },
      time: 90,
      hose: 20,
      wind: { angle: 160, strength: 0.5 },
      windShifts: [{ t: 60, angle: 90, strength: 0.45 }],
      stars: [0.88, 0.94],
      minSaved: 0.8,
    },
    cortijo(),
  ),
  L(
    {
      id: 'granja-11',
      theme: 'granja',
      name: { es: 'La gran cosecha', en: 'Harvest blaze' },
      tip: { es: 'Todo a la vez: la palanca, las bombonas, los animales y un viento que no para de girar.', en: "Everything at once: the lever, the gas bottles, the animals and a wind that won't settle." },
      time: 150,
      hose: 20,
      wind: { angle: -90, strength: 0.4 },
      windShifts: [
        { t: 50, angle: 90, strength: 0.45 },
        { t: 110, angle: 0, strength: 0.4 },
      ],
      stars: [0.72, 0.84],
      minSaved: 0.67,
    },
    cosecha(),
  ),
];
