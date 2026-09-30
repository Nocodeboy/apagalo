import { CAMPING } from './campaign/camping';
import { CASTANAR } from './campaign/castanar';
import { CIUDAD } from './campaign/ciudad';
import { ESTACION } from './campaign/estacion';
import { FINALE, FINALE_ID } from './campaign/finale';
import { GASOLINERA } from './campaign/gasolinera';
import { GRANJA } from './campaign/granja';
import { MUSEO } from './campaign/museo';
import { NIEVE } from './campaign/nieve';
import { PLAZA } from './campaign/plaza';
import { POLIGONO } from './campaign/poligono';
import { PUERTO } from './campaign/puerto';
import { SANJUAN } from './campaign/sanjuan';
import { L } from './leveldef';
import { MB } from './mapbuilder';
import { hashString, Rng } from './rng';
import { EVENT_KINDS, isNight, POWER_KINDS, type EventKind, type LevelDef, type LevelEvent, type News, type PowerKind, type ThemeId, type Txt } from './types';

// ---------------- 1 · Verbena en la plaza ----------------
function plaza() {
  const b = new MB(24, 28, '_');
  b.rect(0, 0, 4, 4, 'H').rect(20, 0, 4, 4, 'H');
  b.rect(6, 0, 12, 4, 'I');
  b.vline(5, 0, 3, '.').vline(18, 0, 3, '.');
  b.put(5, 2, 'T').put(18, 2, 'T');
  b.put(0, 4, 'L').put(23, 4, 'L');
  b.row(4, 5, 'hh').row(4, 17, 'hh');
  // row of fair stalls + churros stand + wooden stage
  b.rect(1, 6, 6, 2, 'S');
  b.rect(7, 6, 3, 2, 'C');
  b.rect(10, 6, 6, 2, 'S');
  b.rect(16, 5, 7, 3, 'w');
  b.fire(7, 6, 3, 2);
  b.put(5, 9, 'm').put(12, 9, 'm').put(20, 10, 'm');
  // fountain and planters
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
  return b.done();
}

// ---------------- 2 · La granja ----------------
function granja() {
  const b = new MB(28, 24, '.');
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
  // hay stacks — the fire starts here
  b.put(1, 10, 'b').put(1, 12, 'b').put(0, 13, 'b').put(1, 13, 'b').put(4, 14, 'b');
  b.row(11, 0, '**');
  b.fire(1, 12).fire(0, 13).fire(1, 13).fire(6, 5);
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
  // sheep pen
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
  return b.done();
}

// ---------------- 3 · La gasolinera ----------------
function gasolinera() {
  const b = new MB(26, 26, '.');
  b.rect(0, 0, 5, 26, '=');
  b.vline(2, 0, 25, '-');
  b.rect(5, 2, 14, 17, '#');
  b.rect(19, 4, 7, 15, ',');
  b.rect(8, 2, 9, 4, 'K');
  b.rect(21, 0, 4, 4, 'H');
  b.put(17, 4, 'G').put(18, 4, 'G').put(17, 5, 'G').put(18, 5, 'G');
  // island 1 with the burning car
  b.put(8, 8, 'o').put(9, 8, 'Q').row(8, 10, 'AA').row(8, 14, 'oQo');
  b.vline(8, 6, 7, 'o');
  b.row(9, 8, 'o%ooooooooo');
  b.fire(10, 8, 2, 1).fire(8, 8).fire(8, 9).fire(10, 9).fire(20, 9).fire(20, 10);
  // island 2
  b.row(12, 8, 'oQo').row(12, 14, 'oQo').row(13, 14, 'AA');
  b.rect(16, 16, 2, 2, 'k');
  b.put(6, 17, 'G').put(7, 17, 'G');
  b.put(19, 11, 'Y');
  for (const [x, z, c] of [
    [23, 5, 'T'],
    [22, 7, 'P'],
    [23, 11, 'T'],
    [22, 15, 'P'],
    [24, 17, 'T'],
    [25, 9, 'P'],
  ] as const)
    b.put(x, z, c);
  b.rect(5, 19, 21, 7, '#');
  b.hline(6, 17, 20, 'h');
  b.hline(19, 25, 19, 'h');
  b.rect(8, 22, 2, 1, 'A').rect(13, 22, 2, 1, 'A').rect(20, 23, 2, 1, 'A');
  b.rect(3, 19, 2, 4, 'X');
  for (const x of [6, 11, 17, 24]) b.put(x, 25, 'T');
  return b.done();
}

// ---------------- 4 · El polígono ----------------
function poligono() {
  const b = new MB(30, 28, ',');
  b.put(4, 0, 'P').put(5, 0, 'P').put(23, 0, 'P').put(24, 0, 'P');
  b.rect(2, 1, 9, 5, 'W').rect(19, 1, 9, 5, 'W');
  b.rect(0, 6, 30, 11, '#');
  // loading docks full of pallets, touching the warehouses
  b.row(6, 3, 'kkkkkkk').row(6, 20, 'kkkkkkk');
  // live electrical box on fire, wired to the west dock
  b.put(6, 9, 'E');
  b.fire(6, 9);
  b.vline(6, 7, 8, 'k');
  b.vline(6, 10, 10, 'k');
  // long pallet rows across the yard (gap in the middle)
  b.row(11, 1, 'kkkkkkkkkkkk').row(11, 17, 'kkkkkkkkkkk');
  b.row(12, 1, 'k').row(12, 12, 'k').row(12, 17, 'k');
  // east stock next to the gas bottles
  b.rect(22, 8, 3, 2, 'k').vline(23, 7, 7, 'k');
  b.put(26, 8, 'G').put(27, 8, 'G').put(26, 9, 'G');
  b.put(15, 14, 'Z');
  b.put(13, 3, 'v').put(28, 13, 'v');
  b.rect(8, 14, 2, 1, 'A').rect(21, 14, 2, 1, 'A');
  b.rect(0, 20, 30, 4, '=');
  b.hline(0, 29, 21, '-');
  b.rect(3, 20, 4, 2, 'X');
  b.put(14, 17, 'Y');
  b.scatter('P', 8, ',', 44, [0, 24, 30, 4], 2);
  b.scatter('P', 6, ',', 45, [0, 17, 30, 3], 3);
  return b.done();
}

// ---------------- 5 · El Castañar ----------------
function castanar() {
  const b = new MB(40, 48, 'l');
  // stream with three stone bridges
  b.path(
    [
      [0, 21],
      [14, 23],
      [26, 22],
      [39, 24],
    ],
    '~',
    2.2,
  );
  for (const x of [8, 20, 32]) b.rect(x - 1, 20, 3, 6, '_');
  b.path(
    [
      [0, 21],
      [14, 23],
      [26, 22],
      [39, 24],
    ],
    '~',
    2.2,
    'l',
  );
  // clearing with the cabin
  b.circle(20, 9, 4.5, '.');
  b.rect(18, 8, 4, 3, 'V');
  // dry patches
  b.circle(7, 32, 3.5, ',');
  b.circle(31, 14, 3, ',');
  b.circle(30, 34, 3, ',');
  // firebreak trail and road
  b.rect(0, 42, 40, 2, ':');
  b.rect(0, 44, 40, 3, '=');
  b.hline(0, 39, 45, '-');
  b.hline(0, 39, 47, '.');
  b.path(
    [
      [20, 42],
      [21, 30],
      [20, 20],
      [20, 13],
    ],
    ':',
    1.5,
    'l,.',
  );
  b.path(
    [
      [20, 16],
      [30, 13],
      [34, 10],
    ],
    ':',
    1.2,
    'l,.',
  );
  b.rect(18, 44, 4, 2, 'X');
  // hydrant chain
  b.put(22, 31, 'Y').put(22, 19, 'Y').put(32, 12, 'Y').put(8, 37, 'Y');
  // people and animals
  b.put(13, 9, 'v').put(35, 6, 'v').put(30, 32, 'a').put(33, 35, 'a');
  // chestnut trees + a few pines
  b.scatter('T', 170, 'l,', 7, [0, 0, 40, 42], 2);
  b.scatter('P', 25, 'l', 8, [0, 0, 40, 42], 2);
  b.circle(20, 9, 4.5, '.', 'TP');
  b.fire(7, 31, 2, 1);
  return b.done();
}

// ---------------- 6 · Noche de San Juan ----------------
function sanjuan() {
  const b = new MB(30, 34, ';');
  b.rect(0, 0, 30, 5, '~');
  b.path(
    [
      [0, 5],
      [10, 6],
      [20, 5],
      [29, 6],
    ],
    '~',
    1.2,
  );
  // dunes
  b.rect(0, 13, 8, 5, ',');
  b.rect(22, 12, 8, 5, ',');
  b.circle(4, 15, 2, ',');
  b.put(2, 14, 'P').put(5, 16, 'P').put(25, 13, 'P').put(27, 15, 'P');
  // boardwalk and beach bars
  b.vline(14, 11, 24, 'w').vline(15, 11, 24, 'w');
  b.hline(2, 27, 23, 'w').hline(2, 27, 24, 'w');
  b.rect(3, 19, 4, 3, 'U').rect(22, 19, 4, 3, 'U');
  b.row(22, 3, 'ww').row(22, 24, 'ww');
  // bonfires with the party
  b.put(7, 9, 'y').put(15, 8, 'y').put(23, 10, 'y');
  b.put(6, 8, 'm').put(9, 10, 'm').put(14, 9, 'm').put(17, 7, 'm').put(22, 9, 'm').put(24, 11, 'm');
  // beach umbrellas
  for (const [x, z] of [
    [10, 13],
    [11, 16],
    [18, 13],
    [19, 16],
    [8, 18],
    [20, 19],
    [11, 20],
    [17, 20],
  ])
    b.put(x, z, 'u');
  // promenade, palms, houses, road
  b.rect(0, 25, 30, 4, '_');
  for (let x = 1; x < 30; x += 4) b.put(x, 25, 'p');
  b.rect(0, 26, 4, 3, 'H').rect(26, 26, 4, 3, 'H');
  b.put(8, 28, 'L').put(21, 28, 'L');
  b.rect(0, 29, 30, 3, '=');
  b.hline(0, 29, 30, '-');
  b.rect(0, 32, 30, 2, '_');
  b.rect(13, 29, 4, 2, 'X');
  b.put(3, 16, 'v').put(26, 14, 'v');
  b.fire(2, 15).fire(1, 16);
  return b.done();
}

/** The 6 original levels, one per scenario. They teach one mechanic each and are also the maps of the daily challenge. */
export const BASE_LEVELS: LevelDef[] = [
  L(
    {
      id: 'plaza',
      num: 1,
      theme: 'plaza',
      name: { es: 'Verbena en la plaza', en: 'Village fair' },
      tip: { es: 'Apunta a la base de las llamas. ¡Que no llegue a la iglesia!', en: 'Aim at the base of the flames. Keep it away from the church!' },
      time: 120,
      hose: 24,
      wind: { angle: -90, strength: 0.25 },
      stars: [0.8, 0.93],
      minSaved: 0.5,
      under: '_',
    },
    plaza(),
  ),
  L(
    {
      id: 'granja',
      num: 2,
      theme: 'granja',
      name: { es: 'La granja de Doña Rosa', en: "Rosa's farm" },
      tip: { es: 'Rescata a los animales acercándote. Si quema mucho, usa el abanico: te protege del calor.', en: 'Walk up to animals to rescue them. Too hot? The fog nozzle shields you from heat.' },
      time: 150,
      hose: 17,
      wind: { angle: 0, strength: 0.35 },
      stars: [0.75, 0.9],
      minSaved: 0.45,
    },
    granja(),
  ),
  L(
    {
      id: 'gasolinera',
      num: 3,
      theme: 'gasolinera',
      name: { es: 'La gasolinera', en: 'Gas station' },
      tip: { es: 'La gasolina no se apaga con agua: ¡usa la ESPUMA! Y enfría las bombonas de butano.', en: "Water won't put out fuel: use FOAM! And keep the gas bottles cool." },
      time: 140,
      hose: 18,
      foam: 16,
      wind: { angle: -90, strength: 0.2 },
      stars: [0.75, 0.9],
      minSaved: 0.45,
      under: '#',
    },
    gasolinera(),
  ),
  L(
    {
      id: 'poligono',
      num: 4,
      theme: 'poligono',
      name: { es: 'El polígono', en: 'Industrial park' },
      tip: { es: 'Con la luz dada, el agua da calambre. Baja la palanca roja antes de mojar el cuadro eléctrico.', en: 'Live power + water = zap. Pull the red lever before you spray the electrical box.' },
      time: 160,
      hose: 18,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.7, 0.85],
      minSaved: 0.45,
      under: '#',
    },
    poligono(),
  ),
  L(
    {
      id: 'castanar',
      num: 5,
      theme: 'castanar',
      name: { es: 'El Castañar', en: 'Chestnut forest' },
      tip: { es: 'El viento cambia. Quédate un momento en una boca de riego para enganchar la manguera y llegar más lejos.', en: 'The wind shifts. Stand on a hydrant for a moment to reconnect your hose and reach further.' },
      time: 200,
      hose: 16,
      wind: { angle: -20, strength: 0.35 },
      windShifts: [
        { t: 35, angle: -90, strength: 0.5 },
        { t: 85, angle: 160, strength: 0.4 },
      ],
      stars: [0.6, 0.75],
      minSaved: 0.3,
      under: 'l',
    },
    castanar(),
  ),
  L(
    {
      id: 'sanjuan',
      num: 6,
      theme: 'sanjuan',
      name: { es: 'Noche de San Juan', en: "Midsummer night" },
      tip: { es: 'Caen cohetes. Moja la zona marcada antes de que llegue y no prenderá.', en: 'Rockets incoming. Wet the marked spot before they land and it will fizzle.' },
      time: 180,
      hose: 18,
      wind: { angle: 90, strength: 0.3 },
      fireworks: { count: 9, first: 10, every: 14 },
      stars: [0.68, 0.82],
      minSaved: 0.45,
      night: true,
      under: ';',
    },
    sanjuan(),
  ),
];

// =====================================================================================================================
// The route (v2, docs/diseno-v2.md §5.2): every level of every scenario in one mixed road, never two levels in a row in
// the same place. Level ids never change once released (saves and analytics use them); `num` is the position.
// =====================================================================================================================

/** Bumped every time the route changes: saves re-open what they had reached (src/progress.ts). */
export const ROUTE_VERSION = 3;

/** Order of the 1.3.0 campaign (67 levels), kept to migrate saves from 1.2.0 and 1.3.0. Never edit. */
export const LEGACY_ROUTE_13 = [
  'plaza', 'granja', 'gasolinera', 'poligono', 'castanar', 'sanjuan', 'plaza-2', 'granja-2', 'gasolinera-2', 'poligono-2', 'castanar-2', 'sanjuan-2',
  'granja-3', 'gasolinera-3', 'poligono-3', 'castanar-3', 'sanjuan-3', 'plaza-3', 'gasolinera-4', 'poligono-4', 'castanar-4', 'sanjuan-4', 'plaza-4',
  'granja-4', 'poligono-5', 'castanar-5', 'sanjuan-5', 'plaza-5', 'granja-5', 'gasolinera-5', 'castanar-6', 'sanjuan-6', 'plaza-6', 'granja-6',
  'gasolinera-6', 'poligono-6', 'sanjuan-7', 'plaza-7', 'granja-7', 'gasolinera-7', 'poligono-7', 'castanar-7', 'plaza-8', 'granja-8', 'gasolinera-8',
  'poligono-8', 'castanar-8', 'sanjuan-8', 'granja-9', 'gasolinera-9', 'poligono-9', 'castanar-9', 'sanjuan-9', 'plaza-9', 'gasolinera-10', 'poligono-10',
  'castanar-10', 'sanjuan-10', 'plaza-10', 'granja-10', 'poligono-11', 'castanar-11', 'sanjuan-11', 'plaza-11', 'granja-11', 'gasolinera-11', 'finale',
];

interface Scenario {
  theme: ThemeId;
  name: Txt;
  /** levels in difficulty order; the first one opens the scenario */
  levels: LevelDef[];
  /** position of its first level in the route */
  intro: number;
}

/** Scenarios in the order they open. */
export const SCENARIOS: Scenario[] = [
  { theme: 'plaza', name: { es: 'La plaza', en: 'The village square' }, levels: [BASE_LEVELS[0], ...PLAZA], intro: 1 },
  { theme: 'granja', name: { es: 'La granja', en: 'The farm' }, levels: [BASE_LEVELS[1], ...GRANJA], intro: 2 },
  { theme: 'gasolinera', name: { es: 'La gasolinera', en: 'The gas station' }, levels: [BASE_LEVELS[2], ...GASOLINERA], intro: 3 },
  { theme: 'poligono', name: { es: 'El polígono', en: 'The industrial park' }, levels: [BASE_LEVELS[3], ...POLIGONO], intro: 4 },
  { theme: 'castanar', name: { es: 'El Castañar', en: 'The chestnut forest' }, levels: [BASE_LEVELS[4], ...CASTANAR], intro: 5 },
  { theme: 'sanjuan', name: { es: 'La playa', en: 'The beach' }, levels: [BASE_LEVELS[5], ...SANJUAN], intro: 6 },
  { theme: 'puerto', name: { es: 'El puerto', en: 'The docks' }, levels: PUERTO, intro: 7 },
  { theme: 'ciudad', name: { es: 'El centro', en: 'Downtown' }, levels: CIUDAD, intro: 12 },
  { theme: 'estacion', name: { es: 'La estación', en: 'The rail yard' }, levels: ESTACION, intro: 17 },
  { theme: 'nieve', name: { es: 'La estación de esquí', en: 'The ski lodge' }, levels: NIEVE, intro: 24 },
  { theme: 'museo', name: { es: 'El museo', en: 'The museum' }, levels: MUSEO, intro: 33 },
  { theme: 'camping', name: { es: 'El camping', en: 'The campground' }, levels: CAMPING, intro: 44 },
];

export function scenarioOf(theme: ThemeId): Scenario {
  return SCENARIOS.find((s) => s.theme === theme)!;
}

/** Big fires: every 10 levels (and the finale at the end). Their first win prints a front page. */
const BIG_SLOTS: Record<number, string> = {
  10: 'puerto-2',
  20: 'ciudad-3',
  30: 'estacion-4',
  40: 'puerto-6',
  50: 'ciudad-7',
  60: 'nieve-5',
  70: 'museo-5',
  80: 'estacion-8',
  90: 'camping-5',
  100: 'castanar-11',
  110: 'plaza-11',
};
/** Headlines of the big fires whose level files come from 1.3.0 (the new ones carry theirs). */
const OLD_HEADLINES: Record<string, Txt> = {
  'plaza-11': { es: 'LA ÚLTIMA NOCHE DE FIESTAS NO ACABA EN TRAGEDIA', en: 'LAST NIGHT OF THE FAIR ENDS WITH CHEERS, NOT ASHES' },
  'sanjuan-11': { es: 'NOCHE DE SAN JUAN: LA PLAYA SE SALVA POR LOS PELOS', en: 'MIDSUMMER NIGHT: THE BEACH SAVED BY A WHISKER' },
  'castanar-11': { es: 'EL CASTAÑAR RESISTE: EL BOSQUE SIGUE EN PIE', en: 'THE FOREST STANDS: CHESTNUT WOOD SAVED' },
  [FINALE_ID]: { es: 'EL GRAN INCENDIO, APAGADO: EL PUEBLO ENTERO LO CELEBRA', en: 'THE BIG ONE IS OUT: THE WHOLE TOWN CELEBRATES' },
};

// Power-ups, events and the crew arrive one at a time along the route (docs/diseno-v2.md §5.3-5.5).
export const POWER_FROM: Record<PowerKind, number> = { turbo: 3, boots: 4, clock: 6, extinguisher: 8, heli: 11, suit: 14 };
export const EVENT_FROM: Record<EventKind, number> = { neighbors: 8, rain: 11, gust: 14, pressure: 16, leak: 19, onlookers: 22, blackout: 26 };
export const CREW_FROM = 9;
/** 2.2: the Pulaski, from the third visit to the chestnut forest (nothing else is new there) */
export const DIG_FROM = 23;
/** Fire spread ramp: from this level on it grows up to +SPREAD_MAX at the last level. */
export const SPREAD_FROM = 40;
export const SPREAD_MAX = 0.12;
export const CREW_TWO_FROM = 40;

function buildRoute(): LevelDef[] {
  // a scenario being written may still be empty
  const SCN = SCENARIOS.filter((s) => s.levels.length);
  const all = SCN.flatMap((s) => s.levels);
  const total = all.length + FINALE.length;
  const byId = new Map(all.map((d) => [d.id, d]));
  const scnOf = new Map<string, number>();
  SCN.forEach((s, k) => s.levels.forEach((d) => scnOf.set(d.id, k)));
  // fixed slots: each scenario's first level, the big fires and the finale
  const fixed = new Map<number, LevelDef>();
  SCN.forEach((s) => fixed.set(s.intro, s.levels[0]));
  for (const [pos, id] of Object.entries(BIG_SLOTS)) {
    const d = byId.get(id);
    if (d) fixed.set(Number(pos), d);
  }
  fixed.set(total, FINALE[0]);
  const fixedPos = new Map([...fixed].map(([p, d]) => [d.id, p]));
  // the other levels of each scenario get a target spot (spread between its fixed ones) and a deadline
  const queues = SCN.map((s) => {
    const anchors = s.levels.map((d, j) => [j, fixedPos.get(d.id)] as const).filter(([, p]) => p !== undefined) as [number, number][];
    const out: { d: LevelDef; target: number; deadline: number }[] = [];
    s.levels.forEach((d, j) => {
      if (fixedPos.has(d.id)) return;
      const a = [...anchors].reverse().find(([ja]) => ja < j)!;
      const next = anchors.find(([jb]) => jb > j);
      const [jb, pb] = next ?? [s.levels.length, total - 1];
      // the deadline leaves room for the no-two-in-a-row rule next to the fixed level
      out.push({ d, target: a[1] + ((j - a[0]) * (pb - a[1])) / (jb - a[0]), deadline: pb - 2 * (jb - j) });
    });
    return out;
  });
  const route: LevelDef[] = [];
  let prev = -1;
  for (let pos = 1; pos <= total; pos++) {
    const f = fixed.get(pos);
    if (f) {
      route.push(f);
      prev = scnOf.get(f.id) ?? -1;
      continue;
    }
    const after = fixed.get(pos + 1);
    const nextScn = after ? (scnOf.get(after.id) ?? -1) : -1;
    const cands = queues
      .map((q, k) => ({ q, k }))
      .filter(({ q, k }) => q.length && SCN[k].intro < pos && k !== prev && k !== nextScn);
    if (!cands.length) throw new Error(`route: nothing fits at level ${pos}`);
    const due = cands.filter(({ q }) => q[0].deadline <= pos).sort((a, b) => a.q[0].deadline - b.q[0].deadline || a.k - b.k);
    const pick = due[0] ?? cands.sort((a, b) => a.q[0].target - b.q[0].target || a.k - b.k)[0];
    const d = pick.q.shift()!.d;
    route.push(d);
    prev = pick.k;
  }
  return decorate(route);
}

/** Numbers, big fires, power-ups, events, crew slots and what each level brings for the first time. */
function decorate(route: LevelDef[]): LevelDef[] {
  const seenTheme = new Set<ThemeId>();
  const powerDone = new Set<PowerKind>();
  const eventDone = new Set<EventKind>();
  const recent: EventKind[] = [];
  return route.map((d0, i) => {
    const n = i + 1;
    const d: LevelDef = { ...d0, num: n };
    const news: News[] = [];
    const firstOfTheme = !seenTheme.has(d.theme);
    seenTheme.add(d.theme);
    // a new place (the six originals were each the first of their place before too)
    d.intro = firstOfTheme && n > 6;
    if (firstOfTheme && n > 1) news.push({ kind: 'place', id: d.theme });
    d.big = n % 10 === 0 || d.id === FINALE_ID;
    if (d.big) {
      d.headline = d.headline ?? OLD_HEADLINES[d.id];
      news.push({ kind: 'big', id: d.id });
    } else {
      delete d.headline;
    }
    const rng = new Rng(hashString('apagalo/route/' + d.id));
    // power-ups: from level 3, never in the calm intro of a new place
    if (n >= 3 && !d.intro) {
      d.powerups = POWER_KINDS.filter((k) => POWER_FROM[k] <= n);
      const fresh = d.powerups.find((k) => !powerDone.has(k));
      if (fresh) {
        d.powerFirst = fresh;
        news.push({ kind: 'power', id: fresh });
      }
      d.powerups.forEach((k) => powerDone.add(k));
    } else d.powerups = [];
    // events: from level 8, one in half the levels, two in the big fires, none in the intros
    const events: LevelEvent[] = [];
    if (n >= 8 && !d.intro && d.fixedEvents?.length) {
      for (const ev of d.fixedEvents) {
        events.push({ kind: ev.kind, t: ev.t });
        if (!eventDone.has(ev.kind)) news.push({ kind: 'event', id: ev.kind });
        eventDone.add(ev.kind);
        // (they leave the route's own picks for the other levels as they were)
      }
    } else if (n >= 8 && !d.intro) {
      const open = EVENT_KINDS.filter((k) => EVENT_FROM[k] <= n && (k !== 'blackout' || isNight(d)));
      const fresh = open.find((k) => !eventDone.has(k));
      const want = d.big ? 2 : fresh || rng.next() < 0.5 ? 1 : 0;
      const kinds: EventKind[] = [];
      if (fresh) kinds.push(fresh);
      for (const k of d.wantEvents ?? []) if (kinds.length < want && open.includes(k) && !kinds.includes(k)) kinds.push(k);
      while (kinds.length < want) {
        const pool = open.filter((k) => !kinds.includes(k) && !recent.includes(k) && eventDone.has(k));
        const from = pool.length ? pool : open.filter((k) => !kinds.includes(k));
        if (!from.length) break;
        kinds.push(from[Math.floor(rng.next() * from.length)]);
      }
      kinds.forEach((k, j) => {
        const at = j === 0 ? 0.22 + 0.2 * rng.next() : 0.55 + 0.15 * rng.next();
        events.push({ kind: k, t: Math.max(20, Math.round(d.time * at)) });
        if (!eventDone.has(k)) news.push({ kind: 'event', id: k });
        eventDone.add(k);
        recent.push(k);
        if (recent.length > 2) recent.shift();
      });
    }
    d.events = events;
    d.crewSlots = n >= CREW_TWO_FROM ? 2 : n >= CREW_FROM ? 1 : 0;
    // the fire spreads a little faster along the second half of the route (never in a new place's intro)
    d.spread = d.intro || n <= SPREAD_FROM ? 1 : Math.round((1 + SPREAD_MAX * Math.min(1, (n - SPREAD_FROM) / (route.length - SPREAD_FROM))) * 1000) / 1000;
    if (n === CREW_FROM) news.push({ kind: 'crew', id: 'crew' });
    d.dig = n >= DIG_FROM;
    if (n === DIG_FROM) news.push({ kind: 'tool', id: 'dig' });
    if (n === CREW_TWO_FROM) news.push({ kind: 'crew', id: 'crew2' });
    d.news = news;
    return d;
  });
}

/** Every level in play order; `num` is the position (1-based). Ids never change once released: saves use them. */
export const LEVELS: LevelDef[] = buildRoute();

/** Index of a level in the route, or -1. */
export function levelIndex(id: string): number {
  return LEVELS.findIndex((d) => d.id === id);
}
