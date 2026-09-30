// Campaign levels of the "poligono" scenario (theme 'poligono'), in order: index 0 = the 2nd level of this scenario
// (block 1, easiest) ... index 9 = the 11th (block 10, hardest). Ids: 'poligono-2' ... 'poligono-11'. See the note in ../levels.ts.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

// ---------------- 3 · El taller: the box in the yard (5 · Turno de noche: the same yard at night) ----------------
function workshop(night = false) {
  const b = new MB(24, 22, ',');
  b.rect(0, 18, 24, 4, '=').hline(0, 23, 19, '-');
  b.rect(3, 18, 4, 2, 'X');
  b.rect(0, 3, 24, 13, '#');
  // the workshop and the tyre store, with a dry verge behind them
  b.rect(2, 3, 7, 3, 'W');
  b.rect(16, 3, 6, 3, 'W');
  // the yard's power box among the stock pallets
  b.put(12, 6, 'E');
  b.fire(12, 6).fire(11, 6).fire(13, 5);
  b.row(5, 11, 'kkk').row(6, 11, 'k').row(6, 13, 'k').row(7, 11, 'kkk').vline(12, 3, 4, 'k').row(6, 3, 'kkkkkkk');
  b.row(10, 14, 'kkkk').row(11, 14, 'kkkk').row(9, 3, 'kkk');
  b.rect(5, 12, 2, 1, 'A').rect(18, 8, 2, 1, 'A');
  b.put(9, 14, 'Z');
  b.put(20, 12, 'v');
  b.put(0, 0, 'P').put(6, 1, 'P').put(12, 0, 'P').put(22, 1, 'P').put(10, 16, 'P').put(20, 17, 'P');
  // night shift: two more workers, and the tyre stock is burning too
  if (night) b.put(1, 8, 'v').put(22, 7, 'v').fire(15, 10, 2, 1);
  return b.done();
}

// ---------------- 4 · La serrería: sawdust burns ----------------
function sawmill() {
  const b = new MB(28, 28, '.');
  b.rect(0, 0, 5, 28, '=').vline(2, 0, 27, '-');
  b.rect(3, 18, 2, 4, 'X');
  // yard: sawdust in front of the saw shed and under the log piles
  b.rect(5, 4, 17, 19, '#');
  b.rect(8, 1, 7, 3, 'W');
  b.rect(7, 5, 15, 2, 'w');
  b.put(17, 6, 'E');
  b.rect(12, 10, 8, 6, 'w').rect(15, 7, 2, 3, 'w');
  for (const [x, z] of [
    [7, 10],
    [7, 14],
    [13, 11],
    [13, 14],
    [17, 11],
    [17, 14],
  ])
    b.rect(x, z, 2, 2, 'k');
  b.rect(10, 18, 2, 1, 'A');
  b.put(9, 20, 'Z');
  // pine wood on the east, meadow to the south
  b.rect(22, 0, 6, 28, ',');
  b.scatter('P', 14, ',', 51, [22, 0, 6, 28], 2);
  b.scatter('T', 5, '.', 52, [5, 23, 17, 5], 3);
  b.put(20, 20, 'Y');
  b.fire(17, 6).fire(15, 5, 2, 2);
  return b.done();
}

// ---------------- 2 · La palanca del fondo: a long yard ----------------
function longYard() {
  const b = new MB(22, 32, '#');
  b.rect(0, 28, 22, 4, '=').hline(0, 21, 30, '-');
  b.rect(9, 28, 4, 2, 'X');
  b.rect(0, 0, 22, 2, ',');
  b.rect(0, 25, 22, 3, ',');
  b.put(3, 0, 'P').put(12, 1, 'P').put(19, 0, 'P').put(2, 26, 'P').put(19, 25, 'P').put(7, 27, 'P');
  // offices at the top; the main switch between them
  b.rect(1, 2, 6, 3, 'W').rect(15, 2, 6, 3, 'W');
  b.put(11, 7, 'Z');
  // the stock yard: rows of pallets on both sides of the aisle, the live box half way down
  for (const z of [9, 12, 15, 18, 21]) b.row(z, 1, 'kkkkkkkk').row(z, 13, 'kkkkkkkk');
  b.vline(1, 9, 21, 'k').vline(20, 9, 21, 'k');
  b.put(9, 15, 'E');
  b.fire(9, 15).fire(6, 15, 3, 1).fire(15, 26, 2, 1);
  b.put(4, 7, 'v').put(18, 23, 'v');
  b.rect(10, 23, 2, 1, 'A');
  return b.done();
}

// ---------------- 6 · Desguace: oil, wrecks and bottles ----------------
function scrapyard() {
  const b = new MB(28, 28, ',');
  b.rect(0, 23, 28, 4, '=').hline(0, 27, 24, '-');
  b.rect(12, 23, 4, 2, 'X');
  // dirt tracks between weedy rows of wrecks
  for (const z of [1, 5, 9, 13, 17, 21]) b.rect(1, z, 17, 1, ':');
  b.rect(1, 1, 1, 21, ':').rect(9, 1, 1, 21, ':').rect(17, 1, 1, 21, ':');
  for (const z of [3, 7, 11, 15, 19]) b.rect(3, z, 5, 1, 'A').rect(11, z, 5, 1, 'A');
  // oil everywhere
  b.rect(2, 12, 3, 2, 'o').rect(10, 6, 5, 2, 'o').rect(12, 16, 4, 2, 'o').rect(4, 20, 3, 1, 'o');
  b.put(11, 6, '%').put(12, 6, '%').put(3, 12, '%');
  b.fire(13, 15, 2, 1);
  // office with its box, and the welding bottles by the stock
  b.rect(19, 2, 7, 3, 'W');
  b.rect(18, 5, 10, 18, ':');
  b.put(22, 5, 'E');
  b.put(20, 9, 'G').put(21, 9, 'G').put(22, 9, 'G');
  b.row(10, 19, 'kkkkk').row(11, 19, 'kkkkk');
  b.put(24, 17, 'Z');
  b.put(25, 12, 'v');
  b.scatter('P', 8, ',', 61, [18, 0, 10, 23], 3);
  return b.done();
}

// ---------------- 7 · La subestación: every box is live (10 · Tormenta seca: lightning on the same site) ----------------
function substation(fires: 'a' | 'b') {
  const b = new MB(28, 28, '.');
  b.rect(0, 23, 28, 5, '=').hline(0, 27, 25, '-');
  b.rect(2, 24, 4, 2, 'X');
  // fenced compound with four boxes
  b.rect(8, 4, 12, 11, '#');
  b.outline(8, 4, 12, 11, 'f');
  b.put(13, 14, '#').put(14, 14, '#');
  b.put(11, 7, 'E').put(16, 7, 'E').put(11, 11, 'E').put(16, 11, 'E');
  b.rect(12, 7, 4, 1, 'k').rect(12, 11, 4, 1, 'k');
  // control hut and its main switch
  b.rect(3, 16, 4, 3, 'W');
  b.put(7, 18, 'Z');
  b.rect(19, 17, 6, 4, 'W');
  b.rect(22, 21, 2, 1, 'A');
  b.rect(0, 0, 8, 8, ',').rect(21, 0, 7, 12, ',');
  b.scatter('P', 18, ',.', 71, [0, 0, 28, 22], 3);
  b.put(24, 9, 'v');
  if (fires === 'a') b.fire(11, 7).fire(16, 11).fire(3, 3, 2, 1);
  else b.fire(11, 11).fire(16, 7).fire(24, 2, 2, 1).fire(2, 10).fire(25, 14);
  return b.done();
}

// ---------------- 8 · Almacén de butano: cages everywhere ----------------
function gasDepot() {
  const b = new MB(28, 28, ',');
  b.rect(0, 0, 5, 28, '=').vline(2, 0, 27, '-');
  b.rect(3, 12, 2, 4, 'X');
  b.rect(5, 1, 21, 18, '#');
  b.rect(16, 2, 8, 3, 'W');
  // cages of bottles, each with its stack of pallets right behind
  for (const [x, z] of [
    [7, 8],
    [16, 8],
    [7, 16],
    [16, 16],
  ]) {
    b.rect(x, z, 3, 2, 'G').rect(x + 3, z, 2, 2, 'k');
  }
  b.rect(8, 3, 3, 2, 'G');
  b.fire(10, 8, 2, 1).fire(19, 17, 2, 1);
  b.put(6, 13, 'Y').put(23, 8, 'Y');
  b.scatter('P', 16, ',', 81, [5, 20, 23, 8], 2);
  b.scatter('P', 6, ',', 82, [26, 0, 2, 28], 2);
  return b.done();
}

// ---------------- 9 · La fábrica de pinturas: solvents next to a live box ----------------
function paintFactory() {
  const b = new MB(28, 30, ',');
  b.rect(0, 25, 28, 4, '=').hline(0, 27, 26, '-');
  b.rect(20, 25, 4, 2, 'X');
  b.rect(3, 3, 22, 19, '#');
  b.rect(4, 3, 9, 3, 'W');
  b.rect(16, 3, 8, 3, 'W');
  // solvent store: a spill on the floor, a live box and drums; the solvent runs down the yard
  b.rect(4, 10, 6, 3, 'o');
  b.put(6, 11, '%').put(7, 11, '%');
  b.put(10, 11, 'E');
  b.fire(10, 11);
  b.put(12, 10, 'G').put(12, 12, 'G');
  b.vline(7, 13, 16, 'o').row(16, 8, 'oooooo').rect(14, 13, 4, 3, 'o');
  b.row(7, 4, 'kkkkk').row(7, 17, 'kkkkk').row(19, 4, 'kkkkk').row(19, 17, 'kkkk');
  b.put(21, 16, 'Z');
  b.put(5, 17, 'v').put(22, 10, 'v');
  b.rect(11, 20, 2, 1, 'A');
  b.put(24, 21, 'Y');
  b.scatter('P', 10, ',', 91, [0, 0, 28, 3], 2);
  b.scatter('P', 5, ',', 92, [0, 3, 3, 22], 2);
  return b.done();
}

// ---------------- 11 · Polígono en llamas: the whole estate ----------------
function bigPark() {
  const b = new MB(32, 34, ',');
  // the estate road runs through the middle; the truck waits on it
  b.rect(0, 15, 32, 4, '=').hline(0, 31, 17, '-');
  b.rect(14, 15, 4, 2, 'X');
  // north block: two warehouses, the pallet yard and the gas cage
  b.rect(1, 2, 30, 13, '#');
  b.rect(2, 3, 8, 3, 'W').rect(22, 3, 8, 3, 'W');
  b.row(7, 2, 'kkkkkkkk').row(7, 22, 'kkkkkkkk');
  for (const z of [4, 7, 10]) b.row(z, 12, 'kkkkkkkk');
  b.put(11, 10, 'E');
  b.put(22, 11, 'G').put(23, 11, 'G').put(22, 12, 'G').put(23, 12, 'G');
  b.fire(11, 10).fire(12, 10, 2, 1).fire(26, 7, 2, 1);
  // south block: solvent store, a third warehouse and the main switch
  b.rect(1, 19, 30, 12, '#');
  b.rect(3, 22, 6, 3, 'o').put(5, 23, '%').put(6, 23, '%');
  // the solvent has run down the yard
  b.vline(5, 25, 27, 'o').row(25, 9, 'oooooooooooo').vline(20, 25, 27, 'o');
  b.rect(21, 26, 8, 3, 'W');
  b.row(24, 21, 'kkkkkkkk').row(28, 3, 'kkkkkk');
  b.put(28, 20, 'Z');
  // three workers sheltering in corners between the stacks
  b.put(30, 12, 'v').put(30, 11, 'k').put(30, 13, 'k').put(31, 12, 'k');
  b.put(1, 26, 'v').put(1, 25, 'k').put(1, 27, 'k').put(0, 26, 'k');
  b.put(20, 4, 'v').put(20, 3, 'k').put(20, 5, 'k');
  b.rect(12, 21, 2, 1, 'A').rect(17, 29, 2, 1, 'A');
  b.scatter('P', 10, ',', 111, [0, 0, 32, 2], 2);
  b.scatter('P', 8, ',', 112, [0, 31, 32, 3], 2);
  b.fire(8, 32, 2, 1);
  return b.done();
}

export const POLIGONO: LevelDef[] = [
  L(
    {
      id: 'poligono-2',
      theme: 'poligono',
      name: { es: 'La palanca del fondo', en: 'The far switch' },
      tip: { es: 'La palanca está al fondo del patio. Corre hasta ella sin mojar el cuadro y vuelve a por el fuego.', en: 'The switch is at the far end of the yard. Run to it without spraying the box, then come back.' },
      time: 140,
      hose: 20,
      wind: { angle: 90, strength: 0.3 },
      stars: [0.77, 0.8],
      minSaved: 0.71,
      under: '#',
    },
    longYard(),
  ),
  L(
    {
      id: 'poligono-3',
      theme: 'poligono',
      name: { es: 'El taller', en: 'Repair shop' },
      tip: { es: 'El cuadro del patio tiene corriente. Baja la palanca y luego apágalo.', en: "The yard's power box is live. Pull the lever first, then put it out." },
      time: 120,
      hose: 18,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.8, 0.87],
      minSaved: 0.66,
      under: '#',
    },
    workshop(),
  ),
  L(
    {
      id: 'poligono-4',
      theme: 'poligono',
      name: { es: 'La serrería', en: 'Sawmill' },
      tip: { es: 'El serrín arde como yesca. Corta la luz y frena el fuego antes de que llegue a los troncos.', en: 'Sawdust burns like tinder. Cut the power and stop the fire before it reaches the logs.' },
      time: 140,
      hose: 18,
      wind: { angle: 90, strength: 0.4 },
      stars: [0.66, 0.85],
      minSaved: 0.5,
      under: '#',
    },
    sawmill(),
  ),
  L(
    {
      id: 'poligono-5',
      theme: 'poligono',
      name: { es: 'Turno de noche', en: 'Night shift' },
      tip: { es: 'Aún quedan operarios dentro. Sácalos antes de que el fuego llegue a ellos.', en: 'Workers are still on site. Get them out before the fire reaches them.' },
      time: 150,
      hose: 18,
      wind: { angle: 180, strength: 0.35 },
      stars: [0.75, 0.82],
      minSaved: 0.61,
      night: true,
      under: '#',
    },
    workshop(true),
  ),
  L(
    {
      id: 'poligono-6',
      theme: 'poligono',
      name: { es: 'El desguace', en: 'Scrapyard' },
      tip: { es: 'Aceite por todas partes y poca espuma: guárdala para los charcos y usa agua en los coches.', en: 'Oil everywhere and little foam: save it for the puddles, use water on the wrecks.' },
      time: 150,
      hose: 18,
      foam: 4,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.76, 0.8],
      minSaved: 0.7,
      under: ':',
    },
    scrapyard(),
  ),
  L(
    {
      id: 'poligono-7',
      theme: 'poligono',
      name: { es: 'La subestación', en: 'Substation' },
      tip: { es: 'Todos los cuadros tienen corriente. No mojes la valla hasta bajar la palanca de la caseta.', en: 'Every box here is live. Keep the water off the fence until you pull the lever at the hut.' },
      time: 150,
      hose: 18,
      wind: { angle: 135, strength: 0.35 },
      stars: [0.8, 0.9],
      minSaved: 0.74,
      under: '.',
    },
    substation('a'),
  ),
  L(
    {
      id: 'poligono-8',
      theme: 'poligono',
      name: { es: 'Almacén de butano', en: 'Gas depot' },
      tip: { es: 'Bombonas por todas partes: si una explota, calienta a las vecinas. Enfría primero las más cercanas.', en: 'Gas cages everywhere. One blast heats the next: cool the nearest ones first.' },
      time: 160,
      hose: 18,
      wind: { angle: 90, strength: 0.3 },
      stars: [0.74, 0.79],
      minSaved: 0.68,
      under: '#',
    },
    gasDepot(),
  ),
  L(
    {
      id: 'poligono-9',
      theme: 'poligono',
      name: { es: 'Fábrica de pinturas', en: 'Paint factory' },
      tip: { es: 'Disolvente junto a un cuadro con corriente: palanca primero y luego espuma. No la malgastes.', en: "Solvent next to a live box: pull the lever, then foam it. Don't waste the foam." },
      time: 170,
      hose: 18,
      foam: 6,
      wind: { angle: 0, strength: 0.3 },
      windShifts: [{ t: 60, angle: 180, strength: 0.4 }],
      stars: [0.85, 0.975],
      minSaved: 0.45,
      under: '#',
    },
    paintFactory(),
  ),
  L(
    {
      id: 'poligono-10',
      theme: 'poligono',
      name: { es: 'Tormenta seca', en: 'Dry storm' },
      tip: { es: 'Rayos sin lluvia sobre la subestación: varios focos y el viento gira dos veces. Corta la luz.', en: 'Dry lightning over the substation: several fires and a wind that turns twice. Cut the power first.' },
      time: 170,
      hose: 18,
      wind: { angle: 90, strength: 0.3 },
      windShifts: [
        { t: 45, angle: 180, strength: 0.45 },
        { t: 100, angle: -60, strength: 0.45 },
      ],
      stars: [0.62, 0.72],
      minSaved: 0.4,
      night: true,
      under: '.',
    },
    substation('b'),
  ),
  L(
    {
      id: 'poligono-11',
      theme: 'poligono',
      name: { es: 'Polígono en llamas', en: 'Industrial blaze' },
      tip: { es: 'Todo el polígono: bombonas, disolvente y operarios. Palanca primero; al minuto gira el viento.', en: 'The whole estate: gas bottles, spilled solvent and workers. Lever first; the wind turns in a minute.' },
      time: 200,
      hose: 20,
      foam: 6,
      wind: { angle: 90, strength: 0.4 },
      windShifts: [{ t: 60, angle: -90, strength: 0.45 }],
      stars: [0.74, 0.77],
      minSaved: 0.68,
      under: '#',
    },
    bigPark(),
  ),
];
