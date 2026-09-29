// Campaign levels of the "castanar" scenario (theme 'castanar'), in order: index 0 = the 2nd level of this scenario
// (block 1, easiest) ... index 9 = the 11th (block 10, hardest). Ids: 'castanar-2' ... 'castanar-11'. See the note in ../levels.ts.
//
// The maps are smaller than the original 40×48 forest (≤ ~1000 cells), so their floor is mostly grass with patches of
// fallen leaves: leaves everywhere burn a whole small map in half a minute. Trails, the creek and stone walls are
// firebreaks. Every fire start is within reach of the truck's hose plus a jet, so the difficulty bot (which never
// reconnects at hydrants) measures real difficulty; the hydrants let a player get closer and move freely.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import { Rng } from '../rng';
import type { LevelDef } from '../types';

type Pt = [number, number];
type Area = [number, number, number, number];

/** Firebreak + road along the bottom edge, starting at row z (firebreak), road z+1..z+3, verge below. */
function southRoad(b: MB, z: number) {
  b.rect(0, z, b.W, 1, ':');
  b.rect(0, z + 1, b.W, 3, '=');
  b.hline(0, b.W - 1, z + 2, '-');
  if (z + 4 < b.H) b.rect(0, z + 4, b.W, b.H - z - 4, '.');
}

/** Chestnuts and a few pines scattered on the given ground chars inside an area. */
function woods(b: MB, area: Area, chestnuts: number, pines: number, seed: number, on = 'l,.') {
  b.scatter('T', chestnuts, on, seed, area, 2);
  b.scatter('P', pines, on.replace(',', ''), seed + 1, area, 2);
}

/** Patches of fallen leaves on the grass (circles of radius r0..r1) inside an area. */
function litter(b: MB, area: Area, count: number, seed: number, r0 = 1.4, r1 = 2.8) {
  const r = new Rng(seed);
  const [ax, az, aw, ah] = area;
  for (let k = 0; k < count; k++) b.circle(ax + r.next() * aw, az + r.next() * ah, r.range(r0, r1), 'l', '.');
}

/** Keeps the ground around (x, z) as plain grass, so a fire start does not sit in a patch of leaves. */
function clearing(b: MB, x: number, z: number, r: number) {
  b.circle(x, z, r, '.', 'l,');
}

// ---------------- A · The ranger's trail (block 1) ----------------
function senda() {
  const b = new MB(24, 26, '.');
  litter(b, [0, 0, 24, 20], 11, 11);
  southRoad(b, 20);
  // trail from the road up to the ranger's cabin
  b.path(
    [
      [12, 20],
      [11, 14],
      [8, 9],
      [10, 5],
      [14, 5],
    ],
    ':',
    1.5,
    'l.',
  );
  b.circle(17.5, 5.5, 3.6, '.');
  b.rect(16, 4, 3, 2, 'V');
  // dry patch where it starts
  b.circle(4, 9, 2.3, ',');
  b.put(10, 12, 'Y');
  woods(b, [0, 0, 24, 20], 52, 8, 21);
  b.circle(17.5, 5.5, 2.5, '.', 'TP');
  b.put(3, 25, 'T').put(9, 24, 'T').put(19, 25, 'T').put(22, 24, 'T');
  b.rect(10, 21, 4, 2, 'X');
  b.fire(3, 9, 2, 1);
  return b.done();
}

// ---------------- B · The picnic spot (block 2) ----------------
function merendero() {
  const b = new MB(26, 26, '.');
  litter(b, [5, 0, 21, 26], 14, 12);
  // forest road along the west edge
  b.rect(0, 0, 4, 26, '=');
  b.vline(1, 0, 25, '-');
  b.vline(4, 0, 25, ':');
  // picnic clearing with benches, the kiosk and a stone barbecue
  b.circle(13, 13, 5.3, '.');
  b.path(
    [
      [4, 13],
      [9, 13],
    ],
    ':',
    1.4,
    'l.',
  );
  b.rect(15, 10, 3, 2, 'V');
  b.put(12, 12, 'r').put(13, 12, 'r');
  for (const [x, z] of [
    [10, 10],
    [10, 16],
    [13, 17],
    [16, 15],
    [9, 13],
  ] as Pt[])
    b.put(x, z, 'n');
  // dry leaves east of the clearing, where the barbecue embers landed
  b.circle(20, 17, 2.4, ',');
  // trail up to the hydrant and the lookout where the hiker is
  b.path(
    [
      [16, 9],
      [18, 6],
      [21, 4],
    ],
    ':',
    1.2,
    'l.',
  );
  b.put(17, 7, 'Y');
  b.put(20, 4, 'v');
  woods(b, [5, 0, 21, 26], 58, 8, 31);
  b.circle(13, 13, 5.3, '.', 'TP');
  b.rect(2, 11, 2, 4, 'X');
  b.fire(19, 17, 2, 1);
  return b.done();
}

// ---------------- C · Across the creek (blocks 3 and 9) ----------------
function arroyo(leaves: number, starts: Pt[], clear = 2.2, dry: Pt[] = []) {
  const b = new MB(30, 24, '.');
  litter(b, [0, 0, 30, 19], leaves, 13);
  for (const [x, z] of starts) clearing(b, x, z, clear);
  const creek: Pt[] = [
    [0, 9],
    [8, 11],
    [15, 9.5],
    [22, 11.5],
    [29, 10],
  ];
  b.path(creek, '~', 3);
  b.rect(14, 7, 3, 7, '_');
  b.path(creek, '~', 3, 'l.');
  southRoad(b, 19);
  // trails: road -> stone bridge -> both ends of the far bank
  b.path(
    [
      [15, 19],
      [15, 13],
    ],
    ':',
    1.4,
    'l.',
  );
  b.path(
    [
      [15, 7],
      [11, 4],
      [5, 3],
    ],
    ':',
    1.3,
    'l.',
  );
  b.path(
    [
      [16, 7],
      [20, 5],
    ],
    ':',
    1.2,
    'l.',
  );
  // the ranger's cabin on the far bank
  b.circle(23.5, 3.5, 2.8, '.');
  b.rect(22, 2, 3, 2, 'V');
  b.circle(24, 15, 1.8, ',');
  for (const [x, z] of dry) b.circle(x, z, 2.2, ',', 'l.');
  b.put(8, 4, 'Y').put(6, 15, 'Y');
  woods(b, [0, 0, 30, 19], 62, 10, 41);
  b.circle(23.5, 3.5, 2.2, '.', 'TP');
  b.rect(13, 20, 4, 2, 'X');
  for (const [x, z] of starts) b.put(x, z, clear ? '.' : 'l').fire(x, z);
  return b.done();
}

// ---------------- D · Ancient chestnuts (block 4) ----------------
function centenarios() {
  const b = new MB(28, 26, '.');
  // mountain road along the top
  b.rect(0, 0, 28, 3, '=');
  b.hline(0, 27, 1, '-');
  b.rect(0, 3, 28, 1, ':');
  // a dense grove of old chestnuts on patches of leaf litter, split by one trail
  litter(b, [0, 4, 28, 22], 18, 51, 1.6, 3);
  b.path(
    [
      [13.5, 3],
      [13.5, 26],
    ],
    ':',
    1.6,
  );
  b.put(12, 9, 'Y').put(15, 20, 'Y');
  b.put(5, 21, 'v').put(4, 10, 'v');
  for (const [x, z] of [
    [2, 5],
    [26, 5],
    [1, 24],
    [26, 24],
    [18, 16],
  ] as Pt[])
    b.put(x, z, 'r');
  woods(b, [0, 4, 28, 22], 110, 6, 51);
  b.rect(12, 1, 4, 2, 'X');
  b.circle(22, 15, 1.4, ',');
  b.fire(22, 14, 1, 3);
  return b.done();
}

// ---------------- E · Night camp (block 5) ----------------
function acampada() {
  const b = new MB(28, 26, '.');
  litter(b, [0, 0, 28, 22], 14, 14);
  southRoad(b, 22);
  // campsite on bare ground: bungalows with their gas bottles, benches and the campfire that got away
  b.circle(14, 10, 6.4, '.');
  b.circle(14, 10, 5.2, ':');
  b.rect(11, 16, 6, 6, ':');
  b.rect(8, 5, 2, 2, 'V').rect(18, 5, 2, 2, 'V').rect(7, 12, 2, 2, 'V').rect(19, 12, 2, 2, 'V');
  b.put(10, 6, 'G').put(18, 7, 'G').put(9, 13, 'G').put(18, 13, 'G');
  b.put(14, 9, 'y');
  b.put(13, 11, 'n').put(15, 11, 'n').put(14, 7, 'n');
  b.put(21, 10, 'v').put(4, 9, 'v');
  b.put(16, 15, 'Y');
  // dry leaves blown against the NE bungalow
  b.circle(22, 4, 2, ',');
  woods(b, [0, 0, 28, 22], 60, 10, 61);
  b.rect(12, 18, 4, 2, 'X');
  b.fire(22, 3, 2, 1).fire(23, 4);
  return b.done();
}

// ---------------- F · The sawmill (block 6) ----------------
function aserradero() {
  const b = new MB(30, 28, '.');
  litter(b, [0, 0, 30, 24], 12, 15);
  southRoad(b, 24);
  // sawmill yard: shed, office, lumber stacks on sawdust and the live fuse box on the shed wall
  b.rect(5, 5, 20, 16, ':');
  b.rect(12, 20, 4, 4, ':');
  b.rect(7, 6, 7, 4, 'W');
  b.rect(19, 6, 3, 2, 'V');
  b.put(14, 8, 'E');
  // sawdust from the fuse box past the lumber to the woods on the east
  b.rect(15, 6, 10, 5, ',');
  b.rect(6, 12, 8, 3, ',');
  b.rect(16, 14, 9, 4, ',');
  b.rect(20, 10, 3, 4, ',');
  b.row(7, 17, 'kkk').row(8, 16, 'kkkk').row(9, 17, 'kkk');
  b.row(12, 7, 'kkk kkk');
  b.row(13, 7, 'kkk kkk');
  b.row(15, 17, 'kkk  kk');
  b.row(16, 17, 'kkk  kk');
  b.put(6, 18, 'Z');
  b.put(22, 19, 'Y');
  woods(b, [0, 0, 30, 24], 54, 12, 71, 'l.');
  b.rect(12, 18, 4, 2, 'X');
  b.fire(14, 8).fire(15, 7, 1, 3).fire(16, 8);
  return b.done();
}

// ---------------- G · Mountain pasture (block 7) ----------------
function pastos() {
  const b = new MB(30, 28, '.');
  // wooded edges with patches of fallen leaves, open fields inside
  litter(b, [0, 0, 30, 3], 5, 16, 1.2, 2.2);
  litter(b, [0, 24, 30, 3], 4, 17, 1.2, 2.2);
  litter(b, [0, 3, 3, 20], 3, 18, 1.2, 2.2);
  litter(b, [27, 3, 3, 20], 3, 19, 1.2, 2.2);
  // dirt track from the south up to the crossing where the truck waits
  b.rect(0, 24, 30, 4, '.');
  b.path(
    [
      [15, 28],
      [15, 16],
    ],
    ':',
    2.4,
  );
  // dry-stone walls split the meadow into four fields; the gaps are gates
  b.vline(13, 3, 22, 'r').hline(3, 26, 12, 'r');
  b.put(13, 7, '.').put(13, 17, '.').put(7, 12, '.').put(21, 12, '.');
  // NW field: dry grass by the forest edge, where it starts
  b.circle(5, 5, 2.2, ',');
  // NE field: the shepherd's hut and hay
  b.rect(19, 5, 4, 3, 'V');
  b.put(17, 9, 'b').put(24, 9, 'b').put(16, 4, 'b');
  // south fields: goat pen and sheep pen
  b.outline(5, 15, 6, 5, 'f');
  b.put(8, 15, '.');
  b.put(6, 16, 'a').put(8, 17, 'a').put(9, 18, 'e');
  b.outline(19, 15, 6, 5, 'f');
  b.put(21, 15, '.');
  b.put(20, 17, 'e').put(22, 16, 'e').put(23, 18, 'a');
  b.put(12, 13, 'Y');
  woods(b, [0, 0, 30, 3], 12, 2, 81, 'l.');
  woods(b, [0, 23, 30, 5], 10, 2, 82, 'l.');
  woods(b, [0, 3, 3, 20], 7, 2, 83, 'l.');
  woods(b, [27, 3, 3, 20], 7, 2, 84, 'l.');
  b.put(9, 8, 'T').put(25, 21, 'T').put(4, 21, 'T').put(18, 21, 'T');
  b.rect(14, 18, 2, 4, 'X');
  b.fire(4, 5, 2, 1);
  return b.done();
}

// ---------------- H · The village fiesta (block 8) ----------------
function fiestas() {
  const b = new MB(28, 26, '.');
  litter(b, [0, 0, 28, 16], 12, 17);
  // the village at the bottom: road, square, houses and the church
  b.rect(0, 16, 28, 1, ':');
  b.rect(0, 17, 28, 3, '=');
  b.hline(0, 27, 18, '-');
  b.rect(0, 20, 28, 6, '_');
  b.rect(0, 22, 3, 3, 'H').rect(25, 22, 3, 3, 'H');
  b.rect(12, 23, 4, 3, 'I');
  b.put(8, 21, 'L').put(19, 21, 'L').put(9, 23, 'm').put(18, 24, 'm').put(19, 22, 'm');
  // forest above with a spring clearing and the hermitage path
  b.circle(7, 7, 2.6, '.');
  b.circle(21, 6, 2.2, ',');
  b.path(
    [
      [13, 16],
      [13, 9],
      [8, 7],
    ],
    ':',
    1.3,
    'l.',
  );
  b.put(12, 9, 'Y');
  woods(b, [0, 0, 28, 16], 56, 8, 91);
  b.circle(7, 7, 2, '.', 'TP');
  b.rect(12, 17, 4, 2, 'X');
  b.fire(21, 6, 2, 1);
  return b.done();
}

// ---------------- I · The whole chestnut forest (block 10) ----------------
function castanarGrande() {
  const b = new MB(32, 32, '.');
  litter(b, [0, 0, 32, 32], 26, 18, 1.6, 3.2);
  // the mountain road crosses the forest; the truck stops halfway
  b.rect(0, 14, 32, 1, ':').rect(0, 18, 32, 1, ':');
  b.rect(0, 15, 32, 3, '=');
  b.hline(0, 31, 16, '-');
  // north: creek with a bridge, the cabin and a dry slope
  const creek: Pt[] = [
    [0, 6],
    [9, 8],
    [18, 6.5],
    [31, 8],
  ];
  b.path(creek, '~', 2.2);
  b.rect(8, 5, 3, 5, '_');
  b.path(creek, '~', 2.2, 'l.');
  b.circle(22, 3, 2.6, '.');
  b.rect(21, 2, 3, 2, 'V');
  b.circle(4, 11, 2.2, ',');
  b.circle(27, 11, 2, ',');
  // south: goat pasture, a hikers' shelter and dry leaves
  b.circle(22, 25, 3.6, '.');
  b.outline(20, 23, 5, 4, 'f');
  b.put(22, 26, '.');
  b.circle(7, 25, 2.4, ',');
  b.rect(5, 21, 3, 2, 'V');
  b.path(
    [
      [16, 19],
      [16, 27],
      [21, 27],
    ],
    ':',
    1.2,
    'l,.',
  );
  b.path(
    [
      [9, 13],
      [9, 10],
    ],
    ':',
    1.2,
    'l,.',
  );
  b.put(10, 11, 'Y').put(24, 11, 'Y').put(15, 23, 'Y').put(4, 27, 'Y');
  b.put(21, 24, 'a').put(23, 25, 'a').put(3, 3, 'v').put(28, 21, 'v');
  woods(b, [0, 0, 32, 14], 52, 8, 101);
  woods(b, [0, 19, 32, 13], 48, 8, 103);
  b.circle(22, 3, 2, '.', 'TP');
  b.rect(14, 15, 4, 2, 'X');
  b.fire(4, 11, 2, 1).fire(7, 25);
  return b.done();
}

export const CASTANAR: LevelDef[] = [
  L(
    {
      id: 'castanar-2',
      theme: 'castanar',
      name: { es: 'La senda del guarda', en: "Ranger's trail" },
      tip: { es: 'El viento girará hacia la cabaña del guarda. Ponte entre el fuego y ella a tiempo.', en: "The wind will turn toward the ranger's cabin. Get between the fire and the cabin in time." },
      time: 130,
      hose: 16,
      wind: { angle: 0, strength: 0.25 },
      windShifts: [{ t: 40, angle: -45, strength: 0.35 }],
      stars: [0.55, 0.88],
      minSaved: 0.47,
      under: 'l',
    },
    senda(),
  ),
  L(
    {
      id: 'castanar-3',
      theme: 'castanar',
      name: { es: 'El merendero', en: 'Picnic spot' },
      tip: { es: 'Cuando gire el viento, el fuego irá a por el excursionista. Engánchate en la boca de riego y sácalo.', en: 'When the wind turns, the fire heads for the hiker. Hook up at the hydrant and get them out.' },
      time: 140,
      hose: 16,
      wind: { angle: 180, strength: 0.25 },
      windShifts: [{ t: 45, angle: -90, strength: 0.35 }],
      stars: [0.7, 0.93],
      minSaved: 0.41,
      under: 'l',
    },
    merendero(),
  ),
  L(
    {
      id: 'castanar-4',
      theme: 'castanar',
      name: { es: 'Al otro lado del arroyo', en: 'Across the creek' },
      tip: { es: 'El fuego está al otro lado del arroyo. Cruza por el puente y engánchate en la otra orilla.', en: 'The fire is across the creek. Cross the stone bridge and hook up on the far bank.' },
      time: 120,
      hose: 16,
      wind: { angle: 180, strength: 0.25 },
      windShifts: [
        { t: 50, angle: 0, strength: 0.25 },
        { t: 100, angle: 90, strength: 0.22 },
      ],
      stars: [0.84, 0.94],
      minSaved: 0.77,
      under: 'l',
    },
    arroyo(
      22,
      [
        [16, 2],
        [17, 2],
      ],
      0,
      [[17, 2]],
    ),
  ),
  L(
    {
      id: 'castanar-5',
      theme: 'castanar',
      name: { es: 'Castaños centenarios', en: 'Ancient chestnuts' },
      tip: { es: 'Viento fuerte: los castaños sueltan pavesas que saltan los caminos. Saca a los excursionistas.', en: 'Strong wind: burning chestnuts throw embers over the trails. Watch downwind and get the hikers out.' },
      time: 130,
      hose: 16,
      wind: { angle: 180, strength: 0.5 },
      windShifts: [{ t: 60, angle: -90, strength: 0.45 }],
      stars: [0.8, 0.89],
      minSaved: 0.56,
      under: 'l',
    },
    centenarios(),
  ),
  L(
    {
      id: 'castanar-6',
      theme: 'castanar',
      name: { es: 'Acampada nocturna', en: 'Night camp' },
      tip: { es: 'Bombonas junto a las cabañas y poca luz. Enfríalas antes de que el fuego llegue.', en: "Gas bottles by the cabins, and it's dark. Cool them down before the flames get there." },
      time: 150,
      hose: 16,
      wind: { angle: 180, strength: 0.3 },
      windShifts: [{ t: 55, angle: 90, strength: 0.35 }],
      stars: [0.55, 0.71],
      minSaved: 0.47,
      night: true,
      under: 'l',
    },
    acampada(),
  ),
  L(
    {
      id: 'castanar-7',
      theme: 'castanar',
      name: { es: 'El aserradero', en: 'The sawmill' },
      tip: { es: 'El cuadro eléctrico del aserradero tiene corriente. Baja la palanca roja antes de mojarlo.', en: "The sawmill's fuse box is live. Pull the red lever before you spray it." },
      time: 130,
      hose: 16,
      wind: { angle: 0, strength: 0.3 },
      windShifts: [{ t: 60, angle: 90, strength: 0.35 }],
      stars: [0.76, 0.9],
      minSaved: 0.72,
      under: 'l',
    },
    aserradero(),
  ),
  L(
    {
      id: 'castanar-8',
      theme: 'castanar',
      name: { es: 'Los pastos', en: 'Mountain pasture' },
      tip: { es: 'Los muros de piedra frenan el fuego, los huecos no. Vigílalos y saca a los animales.', en: "Stone walls stop the fire, but the gaps don't. Guard them and get the animals out of the pens." },
      time: 170,
      hose: 16,
      wind: { angle: 0, strength: 0.3 },
      windShifts: [
        { t: 40, angle: 60, strength: 0.35 },
        { t: 85, angle: 150, strength: 0.35 },
        { t: 125, angle: -60, strength: 0.4 },
      ],
      stars: [0.5, 0.9],
      minSaved: 0.43,
      under: 'l',
    },
    pastos(),
  ),
  L(
    {
      id: 'castanar-9',
      theme: 'castanar',
      name: { es: 'Fiestas del pueblo', en: 'Village fiesta' },
      tip: { es: 'Los cohetes de las fiestas caen en el bosque. Moja cada zona marcada antes de que caigan.', en: 'The fiesta rockets are landing in the woods. Wet each marked spot before they come down.' },
      time: 180,
      hose: 16,
      wind: { angle: -90, strength: 0.3 },
      windShifts: [{ t: 75, angle: 20, strength: 0.35 }],
      fireworks: { count: 8, first: 14, every: 13 },
      stars: [0.73, 0.88],
      minSaved: 0.59,
      under: '_',
    },
    fiestas(),
  ),
  L(
    {
      id: 'castanar-10',
      theme: 'castanar',
      name: { es: 'Tormenta seca', en: 'Dry lightning' },
      tip: { es: 'Los rayos han prendido varios focos a la vez, y es de noche. Ataca antes los que empuja el viento.', en: 'Lightning has started several fires at once, at night. Hit the ones the wind is pushing first.' },
      time: 140,
      hose: 16,
      wind: { angle: 45, strength: 0.35 },
      windShifts: [
        { t: 50, angle: -45, strength: 0.4 },
        { t: 110, angle: 180, strength: 0.4 },
      ],
      stars: [0.6, 0.7],
      minSaved: 0.485,
      night: true,
      under: 'l',
    },
    arroyo(22, [
      [4, 2],
      [26, 6],
      [24, 15],
      [4, 16],
    ]),
  ),
  L(
    {
      id: 'castanar-11',
      theme: 'castanar',
      name: { es: 'El Castañar en llamas', en: 'The forest ablaze' },
      tip: { es: 'Arde a ambos lados de la carretera y hay gente atrapada. Usa las bocas de riego para llegar a todo.', en: 'Fire on both sides of the road and people trapped. Use the hydrants to reach every corner.' },
      time: 160,
      hose: 16,
      wind: { angle: -30, strength: 0.2 },
      windShifts: [
        { t: 45, angle: -100, strength: 0.28 },
        { t: 100, angle: 160, strength: 0.25 },
        { t: 150, angle: 60, strength: 0.25 },
      ],
      stars: [0.62, 0.88],
      minSaved: 0.57,
      under: 'l',
    },
    castanarGrande(),
  ),
];
