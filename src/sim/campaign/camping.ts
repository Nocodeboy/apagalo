// The campground (theme 'camping'), a US national park at golden hour. Star mechanic: the helicopter is always on
// call (level `heliEvery`): tap its button and it drops a load of water where you aim, then it goes to refill and
// comes back after a while. Tall dry grass ('j') is the fastest fire in the game and pines throw embers that start
// spot fires. Campfires ('y') burn from the start; tents ('t'), RVs ('&', with their propane bottles) and cabins are
// what you save. docs/diseno-v2.md §5.1.
// Index 0 is the scenario's intro; the route (../levels.ts) places every level. Ids never change once released.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

/** Trampled dirt (':', it does not burn) with the park road (3 rows from `roadZ`) and grass along it. */
function park(W: number, H: number, roadZ: number) {
  const b = new MB(W, H, ':');
  b.rect(0, roadZ, W, 3, '=');
  b.hline(0, W - 1, roadZ + 1, '-');
  if (roadZ + 3 < H) b.rect(0, roadZ + 3, W, H - roadZ - 3, '.');
  return b;
}
/** Pine woods: grass with pines in groves (they throw embers). */
function forest(b: MB, x: number, z: number, w: number, h: number, n: number, seed: number) {
  b.rect(x, z, w, h, '.');
  b.scatter('P', n, '.', seed, [x, z, w, h], 1);
}
/** A campsite: a tent (2 × 2) and its picnic table. */
function site(b: MB, x: number, z: number) {
  b.rect(x, z, 2, 2, 't');
  b.put(x + 2, z + 1, 'n');
}
/** An RV on its concrete pad with the propane bottle beside it. */
function pad(b: MB, x: number, z: number) {
  b.rect(x - 1, z - 1, 5, 4, '#');
  b.rect(x, z, 3, 2, '&');
  b.put(x + 3, z, 'G');
}
/** A campfire in its ring of dry, trampled grass, with the fire already out of the ring on `spill` cells. */
function campfire(b: MB, x: number, z: number, spill: [number, number][] = []) {
  b.rect(x - 1, z - 1, 3, 3, ',');
  b.put(x, z, 'y');
  for (const [dx, dz] of spill) b.fire(x + dx, z + dz);
}

// ---------- 1 · The campfire (intro): a campfire gets away into the tall grass; the helicopter is on call ----------
function hoguera() {
  const b = park(24, 22, 18);
  forest(b, 0, 0, 24, 4, 16, 101);
  b.circle(2, 8, 3.4, ';');
  b.circle(2, 8, 2.6, '~');
  // the campsite, its campfire and the meadow of tall dry grass the wind is pushing it into
  b.rect(6, 5, 16, 10, '.');
  site(b, 5, 11);
  b.rect(8, 7, 3, 4, ',');
  campfire(b, 9, 9, [
    [1, 0],
    [1, -1],
  ]);
  b.rect(12, 6, 8, 6, 'j');
  b.rect(11, 8, 1, 2, ',');
  // it has already reached the meadow
  b.fire(12, 8).fire(12, 9).fire(13, 8);
  // the tents on the far side, a couple of trees
  site(b, 16, 14);
  site(b, 20, 3);
  b.put(22, 8, 'T').put(22, 11, 'T').put(21, 13, 'T');
  b.put(14, 15, 'Y');
  b.put(19, 13, 'v');
  b.rect(10, 18, 4, 2, 'X');
  return b.done();
}

// ---------- 2 · Tent city: rows of tents, two campfires out of control, a strip of tall grass by the woods ----------
function tiendas() {
  const b = park(28, 24, 20);
  forest(b, 0, 0, 28, 4, 22, 111);
  b.rect(2, 4, 9, 2, 'j').rect(17, 4, 9, 2, 'j');
  // grass between the rows of tents
  for (const z of [7, 12, 17]) b.rect(0, z, 11, 2, '.').rect(15, z, 13, 2, '.');
  for (const z of [5, 10, 15]) for (const x of [1, 6, 16, 21]) site(b, x, z);
  campfire(b, 4, 8, [
    [1, 0],
    [-1, 0],
  ]);
  campfire(b, 19, 13, [
    [0, 1],
    [1, 1],
  ]);
  b.put(9, 7, 'k').put(25, 17, 'k');
  b.put(1, 13, 'v').put(24, 12, 'v').put(26, 17, 'd');
  b.put(11, 12, 'Y').put(14, 17, 'Y');
  b.put(27, 18, 'T').put(0, 18, 'T');
  b.rect(11, 20, 4, 2, 'X');
  return b.done();
}

// ---------- 3 · The RV park: RVs on their pads with propane bottles, strips of tall grass between the rows ----------
function caravanas() {
  const b = park(28, 26, 22);
  forest(b, 0, 0, 28, 3, 18, 121);
  b.rect(0, 3, 28, 17, '.');
  b.rect(0, 8, 28, 2, 'j').rect(0, 17, 28, 2, 'j');
  // the park's loop road
  b.rect(12, 3, 3, 19, ':');
  b.rect(0, 11, 28, 2, ':');
  for (const [x, z] of [
    [3, 5],
    [18, 5],
    [23, 5],
    [3, 14],
    [8, 14],
    [18, 14],
    [23, 14],
  ])
    pad(b, x, z);
  campfire(b, 9, 6, [
    [0, 1],
    [1, 1],
  ]);
  b.put(6, 19, 'n').put(21, 19, 'n').put(10, 4, 'n');
  b.fire(26, 18).fire(1, 17);
  b.put(11, 13, 'Y').put(16, 7, 'Y');
  b.put(26, 10, 'v').put(2, 20, 'v');
  b.rect(12, 22, 4, 2, 'X');
  return b.done();
}

// ---------- 4 · The lake shore: cabins by the water, fire coming through the meadow and the woods ----------
function lago() {
  const b = park(30, 28, 24);
  b.rect(0, 0, 30, 8, '~');
  b.circle(6, 8, 3, '~').circle(22, 9, 3.5, '~');
  b.rect(0, 8, 30, 3, ';');
  b.circle(6, 8, 2.5, '~').circle(22, 9, 2.8, '~');
  // the dock and the canoes
  b.rect(14, 3, 2, 6, 'w');
  b.rect(10, 9, 2, 1, 'D').rect(17, 10, 3, 1, 'D');
  // cabins along the shore with their porches, grass behind them
  b.rect(0, 11, 30, 5, '.');
  for (const x of [2, 9, 18, 25]) {
    b.rect(x, 12, 3, 3, 'V');
    b.rect(x, 15, 3, 1, 'w');
  }
  b.rect(8, 18, 14, 4, 'j');
  forest(b, 0, 16, 9, 8, 18, 141);
  forest(b, 22, 16, 8, 8, 16, 143);
  b.rect(13, 16, 3, 8, ':');
  b.put(3, 20, 'P').put(4, 20, 'P').put(26, 21, 'P');
  b.fire(3, 20).fire(4, 20).fire(26, 21).fire(20, 19);
  b.put(12, 16, 'Y').put(22, 16, 'Y');
  b.put(7, 13, 'v').put(24, 11, 'd').put(16, 11, 'v');
  b.rect(12, 24, 4, 2, 'X');
  return b.done();
}

// ---------- 5 · BIG FIRE: wildfire in the national park, from the forest down to the campground ----------
function parqueNacional() {
  const b = park(36, 34, 30);
  forest(b, 0, 0, 36, 12, 60, 151);
  b.rect(14, 3, 8, 4, 'l');
  // the lookout tower on its rise and the trail down
  b.rect(3, 2, 5, 5, ':');
  b.rect(4, 3, 3, 3, 'I');
  b.path(
    [
      [5, 7],
      [9, 14],
      [16, 20],
      [17, 30],
    ],
    ':',
    1.6,
  );
  // a meadow of tall grass in the clearing, and the lake to the east
  b.rect(10, 13, 10, 5, 'j');
  b.circle(30, 17, 4.5, ';');
  b.circle(30, 17, 3.5, '~');
  // the ranger station (south-west) and the campground (south-east)
  b.rect(0, 19, 9, 7, '.');
  b.rect(2, 20, 5, 4, 'V');
  b.rect(1, 24, 7, 1, 'w');
  b.rect(19, 21, 15, 8, '.');
  for (const [x, z] of [
    [20, 22],
    [24, 22],
    [28, 25],
    [20, 26],
  ])
    site(b, x, z);
  pad(b, 29, 21);
  campfire(b, 26, 26, [[1, 0]]);
  b.rect(9, 23, 6, 4, ',');
  b.put(8, 8, 'P').put(9, 8, 'P').put(20, 4, 'P');
  b.fire(8, 8).fire(9, 8).fire(20, 4).fire(15, 14).fire(10, 25);
  b.put(12, 20, 'Y').put(24, 19, 'Y').put(6, 27, 'Y').put(30, 28, 'Y');
  b.put(5, 26, 'v').put(33, 24, 'v').put(22, 24, 'd').put(14, 19, 'v');
  b.rect(16, 30, 4, 2, 'X');
  return b.done();
}

// ---------- 6 · The lookout: a dry ridge with the fire lookout at the top, the wind turns the fire back ----------
function mirador() {
  const b = park(30, 30, 26);
  forest(b, 0, 0, 10, 12, 20, 161);
  forest(b, 21, 0, 9, 10, 16, 163);
  b.rect(11, 1, 9, 6, ':');
  b.rect(13, 2, 4, 3, 'I');
  b.put(12, 6, 'n').put(18, 6, 'n');
  // dry slopes and patches of tall grass, cut by the trail down
  b.rect(0, 12, 10, 3, ',').rect(20, 10, 10, 3, ',');
  b.rect(1, 16, 6, 5, 'j').rect(23, 14, 6, 5, 'j');
  b.path(
    [
      [15, 7],
      [9, 13],
      [20, 18],
      [14, 26],
    ],
    ':',
    1.4,
  );
  b.rect(2, 22, 6, 4, '.').rect(20, 20, 8, 5, '.');
  site(b, 4, 23);
  site(b, 22, 22);
  b.rect(11, 20, 3, 3, 'V');
  b.put(5, 5, 'P');
  b.fire(3, 17).fire(26, 15).fire(5, 5);
  b.put(15, 11, 'Y').put(10, 23, 'Y').put(24, 7, 'Y');
  b.put(18, 4, 'v').put(27, 22, 'v');
  b.rect(13, 26, 4, 2, 'X');
  return b.done();
}

// ---------- 7 · Dry lightning: a storm with no rain, lightning strikes the park again and again ----------
function tormenta() {
  const b = park(32, 30, 26);
  forest(b, 0, 0, 32, 7, 36, 171);
  b.rect(0, 7, 32, 12, '.');
  b.rect(1, 8, 10, 4, 'j').rect(20, 14, 10, 4, 'j');
  b.rect(0, 19, 32, 3, ',');
  b.vline(15, 7, 25, ':').vline(16, 7, 25, ':');
  b.hline(0, 31, 13, ':');
  for (const [x, z] of [
    [3, 20],
    [8, 21],
    [21, 20],
    [26, 21],
  ])
    site(b, x, z);
  pad(b, 4, 15);
  pad(b, 24, 9);
  b.rect(10, 15, 3, 3, 'V');
  b.put(4, 3, 'P');
  b.fire(28, 16).fire(29, 16).fire(4, 3);
  b.put(14, 18, 'Y').put(18, 10, 'Y').put(9, 11, 'Y');
  b.put(12, 20, 'v').put(27, 13, 'v').put(6, 18, 'd');
  b.rect(14, 26, 4, 2, 'X');
  return b.done();
}

export const CAMPING: LevelDef[] = [
  L(
    {
      id: 'camping-1',
      theme: 'camping',
      name: { es: 'La hoguera', en: 'The campfire' },
      tip: {
        es: 'Una hoguera se ha escapado a la hierba alta, que arde volando. Aquí el HELICÓPTERO está siempre de guardia: pulsa su botón y soltará agua donde apuntes.',
        en: 'A campfire got away into the tall grass, which burns like crazy. Here the HELICOPTER is always on call: tap its button and it drops water where you aim.',
      },
      time: 130,
      hose: 15,
      heliEvery: 18,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.79, 0.83],
      minSaved: 0.49,
    },
    hoguera(),
  ),
  L(
    {
      id: 'camping-2',
      theme: 'camping',
      name: { es: 'Las tiendas', en: 'Tent city' },
      tip: { es: 'Dos hogueras se han descontrolado entre las tiendas. Los caminos de tierra no arden: úsalos de cortafuegos.', en: 'Two campfires got out of hand among the tents. The dirt paths do not burn: use them as firebreaks.' },
      time: 150,
      hose: 15,
      heliEvery: 26,
      wind: { angle: 90, strength: 0.25 },
      stars: [0.73, 0.78],
      minSaved: 0.62,
    },
    tiendas(),
  ),
  L(
    {
      id: 'camping-3',
      theme: 'camping',
      name: { es: 'Las caravanas', en: 'The RV park' },
      tip: { es: 'Entre las caravanas crece hierba alta y cada una tiene su bombona de propano. Manda el helicóptero a la hierba y enfría las bombonas.', en: 'Tall grass grows between the RVs and each has its propane bottle. Send the helicopter to the grass and cool the bottles.' },
      time: 150,
      hose: 16,
      heliEvery: 26,
      wind: { angle: 0, strength: 0.32 },
      stars: [0.85, 0.9],
      minSaved: 0.74,
    },
    caravanas(),
  ),
  L(
    {
      id: 'camping-4',
      theme: 'camping',
      name: { es: 'El lago', en: 'The lake shore' },
      tip: { es: 'El fuego viene por el prado y el pinar hacia las cabañas de la orilla. Cuando cambie el viento irá hacia el agua.', en: 'The fire is coming through the meadow and the woods towards the cabins on the shore. When the wind turns it will head for the water.' },
      time: 160,
      hose: 16,
      heliEvery: 28,
      wind: { angle: -90, strength: 0.35 },
      windShifts: [{ t: 80, angle: 0, strength: 0.4 }],
      stars: [0.65, 0.75],
      minSaved: 0.57,
    },
    lago(),
  ),
  L(
    {
      id: 'camping-5',
      theme: 'camping',
      name: { es: 'Incendio en el parque nacional', en: 'Wildfire at the national park' },
      tip: {
        es: 'Arde el bosque, el prado y el camping. El helicóptero para los frentes grandes; tú, para las tiendas, la caseta de los guardas y las pavesas.',
        en: 'The forest, the meadow and the campground are burning. The helicopter for the big fronts; you for the tents, the ranger station and the spot fires.',
      },
      headline: { es: 'INCENDIO EN EL PARQUE NACIONAL: EL CAMPING, A SALVO', en: 'WILDFIRE AT THE NATIONAL PARK: CAMPERS SAFE, FOREST SAVED' },
      time: 220,
      hose: 16,
      heliEvery: 24,
      wind: { angle: 70, strength: 0.4 },
      windShifts: [{ t: 110, angle: 0, strength: 0.45 }],
      stars: [0.67, 0.7],
      minSaved: 0.61,
    },
    parqueNacional(),
  ),
  L(
    {
      id: 'camping-6',
      theme: 'camping',
      name: { es: 'El mirador', en: 'The lookout' },
      tip: { es: 'La ladera seca arde hacia el mirador. El viento va a girar: guarda el helicóptero para el frente nuevo.', en: 'The dry slope is burning towards the lookout. The wind will turn: save the helicopter for the new front.' },
      time: 170,
      hose: 15,
      heliEvery: 28,
      wind: { angle: -90, strength: 0.4 },
      windShifts: [{ t: 70, angle: 90, strength: 0.45 }],
      stars: [0.66, 0.7],
      minSaved: 0.56,
    },
    mirador(),
  ),
  L(
    {
      id: 'camping-7',
      theme: 'camping',
      name: { es: 'Tormenta seca', en: 'Dry lightning' },
      tip: { es: 'Tormenta sin lluvia: caen rayos sobre el parque. Moja la zona marcada antes de que caiga el rayo y no prenderá.', en: 'A storm with no rain: lightning keeps striking the park. Wet the marked spot before the bolt hits and it will not catch.' },
      time: 180,
      hose: 16,
      heliEvery: 26,
      wind: { angle: 0, strength: 0.38 },
      fireworks: { count: 8, first: 14, every: 16 },
      stars: [0.49, 0.56],
      minSaved: 0.36,
    },
    tormenta(),
  ),
];
