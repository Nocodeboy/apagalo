// The rail yard (theme 'estacion'), star mechanic: trains run on a timetable (`trains` in each level). Three seconds of
// bells and lights, then the train crosses the whole map: it blocks the way, takes the water, pushes you off the rails
// and cuts your hose if the track lies between you and your truck or hydrant (no water until you hook up again or
// 6 s pass). Tracks are two rows of 'R'; rows of 'R' with no train are sidings. docs/diseno-v2.md §5.1.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

/** A track: two rows of rail from row `z`. */
function track(b: MB, z: number) {
  b.rect(0, z, b.W, 2, 'R');
}
/** Road with the lane line, `z` is the top row (3 rows). */
function road(b: MB, z: number) {
  b.rect(0, z, b.W, 3, '=');
  b.hline(0, b.W - 1, z + 1, '-');
}

// ---------- 1 · The platform (intro): the kiosk on the far side is burning, trains keep coming ----------
function anden() {
  const b = new MB(26, 24, ':');
  b.rect(1, 0, 7, 4, 'W');
  b.rect(8, 0, 17, 6, ',');
  b.rect(12, 3, 3, 2, 'S');
  b.fire(12, 3, 2, 1).fire(20, 2);
  b.put(19, 2, 'k').put(20, 2, 'k').put(22, 4, 'T').put(9, 5, 'Y');
  b.rect(0, 6, 26, 1, '_');
  track(b, 7);
  b.rect(0, 9, 26, 3, '_');
  for (const x of [5, 12, 19]) b.put(x, 10, 'z');
  b.put(8, 11, 'n').put(16, 11, 'n').put(22, 10, 'm');
  b.rect(3, 12, 8, 3, 'H');
  b.rect(0, 15, 26, 1, '_');
  road(b, 16);
  b.rect(14, 16, 4, 2, 'X');
  b.rect(0, 19, 26, 5, '.');
  b.rect(1, 20, 4, 3, 'H').rect(20, 20, 4, 3, 'H');
  b.scatter('T', 6, '.', 3, [6, 19, 13, 5], 3);
  return b.done();
}

// ---------- 2 · Freight wagons: a train of boxcars burning on the siding beyond the main line ----------
function vagones() {
  const b = new MB(28, 26, ':');
  b.rect(0, 0, 28, 3, ',');
  b.scatter('P', 7, ',', 5, [0, 0, 28, 3], 3);
  track(b, 4); // siding
  b.rect(2, 4, 16, 2, 'g');
  b.fire(10, 4, 3, 2);
  b.rect(0, 6, 28, 3, '_');
  b.row(7, 20, 'kk kk');
  b.put(22, 8, 'Y').put(4, 7, 'v');
  track(b, 9); // main line
  b.rect(0, 11, 28, 3, '_');
  for (const x of [4, 12, 20]) b.put(x, 12, 'z');
  b.put(8, 12, 'n').put(16, 12, 'n');
  b.rect(2, 14, 7, 3, 'H').rect(19, 14, 7, 3, 'K');
  road(b, 18);
  b.rect(11, 18, 4, 2, 'X');
  b.rect(0, 21, 28, 5, '.');
  b.scatter('T', 8, '.', 9, [0, 21, 28, 5], 3);
  return b.done();
}

// ---------- 3 · The level crossing: cars queue at the barriers, one of them on fire ----------
function pasoNivel() {
  const b = new MB(28, 26, '.');
  b.rect(12, 0, 4, 26, '=');
  b.vline(13, 0, 25, '-');
  b.rect(0, 0, 11, 7, '_').rect(17, 0, 11, 7, '_');
  b.rect(1, 1, 5, 4, 'H').rect(7, 1, 4, 4, 'K').rect(18, 1, 4, 4, 'H').rect(23, 1, 4, 4, 'H');
  b.rect(12, 3, 1, 2, 'A').rect(15, 2, 1, 2, 'A').rect(12, 6, 1, 2, 'A');
  b.fire(12, 6, 1, 2).fire(7, 1, 2, 2).fire(19, 1);
  b.put(11, 7, 'i').put(16, 7, 'i').put(17, 8, 'Y');
  track(b, 9);
  b.put(11, 12, 'i').put(16, 12, 'i');
  b.rect(15, 13, 1, 2, 'A').rect(12, 15, 1, 2, 'A');
  b.rect(0, 11, 11, 5, ',').rect(17, 11, 11, 5, ',');
  b.scatter('T', 8, ',', 13, [0, 11, 11, 5], 2);
  b.scatter('T', 8, ',', 17, [17, 11, 11, 5], 2);
  b.put(5, 14, 'e').put(22, 13, 'a');
  b.fire(3, 12).fire(24, 15);
  b.rect(0, 17, 11, 9, '_').rect(17, 17, 11, 9, '_');
  b.rect(1, 18, 5, 4, 'H').rect(22, 18, 5, 4, 'H');
  b.rect(12, 20, 2, 4, 'X');
  b.put(9, 20, 'Y');
  return b.done();
}

// ---------- 4 · BIG FIRE: blaze at the station, the old building and both platforms ----------
function estacionArde() {
  const b = new MB(32, 30, ':');
  // north: goods sheds and wagons on the siding
  b.rect(1, 0, 8, 3, 'W').rect(22, 0, 9, 3, 'W');
  track(b, 3);
  b.rect(10, 3, 10, 2, 'g');
  b.fire(22, 1, 3, 2).fire(15, 3);
  b.rect(0, 5, 32, 3, '_');
  b.put(6, 6, 'Y').put(26, 6, 'Y').put(15, 6, 'm');
  track(b, 8); // line 1
  b.rect(0, 10, 32, 4, '_'); // island platform
  for (const x of [4, 10, 16, 22, 28]) b.put(x, 11, 'z');
  b.put(8, 12, 'v').put(20, 12, 'm').put(13, 11, 'n').put(25, 11, 'n');
  b.put(16, 13, 'Y');
  track(b, 14); // line 2
  b.rect(0, 16, 32, 2, '_');
  // the station building, on fire at one wing
  b.rect(6, 18, 20, 5, 'H');
  b.fire(6, 18, 3, 2).fire(24, 20);
  b.rect(0, 23, 32, 1, '_');
  road(b, 24);
  b.rect(14, 24, 4, 2, 'X');
  b.rect(0, 27, 32, 3, '.');
  b.scatter('T', 8, '.', 21, [0, 27, 32, 3], 3);
  b.put(2, 19, 'T').put(29, 19, 'T');
  return b.done();
}

// ---------- 5 · The engine shed: locomotives and oil drums in the depot ----------
function cochera() {
  const b = new MB(28, 26, ':');
  b.rect(1, 0, 12, 6, 'W');
  b.rect(15, 1, 12, 2, 'g').rect(15, 4, 12, 2, 'g');
  b.rect(14, 1, 1, 5, 'R');
  b.fire(20, 1, 3, 2).fire(1, 4, 2, 2);
  b.put(4, 7, 'G').put(5, 7, 'G').put(4, 8, 'G');
  b.row(8, 9, 'kkk');
  b.put(24, 8, 'Y').put(13, 8, 'd');
  track(b, 10);
  b.rect(0, 12, 28, 3, '_');
  for (const x of [5, 14, 23]) b.put(x, 13, 'z');
  b.rect(3, 15, 6, 3, 'H').rect(18, 15, 7, 3, 'K');
  road(b, 19);
  b.rect(12, 19, 4, 2, 'X');
  b.rect(0, 22, 28, 4, '.');
  b.scatter('T', 7, '.', 27, [0, 22, 28, 4], 3);
  return b.done();
}

// ---------- 6 · Two tracks: trains in both directions between you and the fire ----------
function dosVias() {
  const b = new MB(28, 28, ':');
  b.rect(0, 0, 28, 5, ',');
  b.rect(2, 1, 6, 3, 'H').rect(19, 0, 7, 3, 'W');
  b.scatter('T', 6, ',', 33, [9, 0, 9, 5], 2);
  b.fire(2, 1, 2, 2).fire(12, 2, 2, 2);
  b.put(24, 5, 'Y');
  track(b, 6);
  b.rect(0, 8, 28, 3, '_');
  for (const x of [6, 14, 22]) b.put(x, 9, 'z');
  b.put(10, 9, 'Y').put(18, 10, 'v');
  track(b, 11);
  b.rect(0, 13, 28, 2, '_');
  b.rect(2, 15, 6, 3, 'H').rect(19, 15, 6, 3, 'K');
  b.rect(10, 16, 3, 2, 'S');
  b.fire(10, 16, 1, 2);
  road(b, 19);
  b.rect(12, 19, 4, 2, 'X');
  b.rect(0, 22, 28, 6, '.');
  b.scatter('T', 9, '.', 35, [0, 22, 28, 6], 3);
  return b.done();
}

// ---------- 7 · The goods depot: straw and pallets waiting for the freight train ----------
function almacen() {
  const b = new MB(28, 26, ':');
  b.rect(10, 0, 8, 5, ',').rect(0, 5, 28, 3, ',');
  b.rect(1, 0, 9, 4, 'W').rect(18, 0, 9, 4, 'W');
  for (const [x, z] of [
    [11, 1],
    [13, 1],
    [15, 1],
    [11, 3],
    [15, 3],
    [2, 6],
    [4, 6],
    [21, 6],
    [23, 6],
  ])
    b.put(x, z, 'b');
  b.row(6, 8, 'kk kk').row(7, 8, 'k   k');
  b.fire(13, 1).fire(2, 6).fire(23, 6);
  b.put(18, 7, 'Y').put(26, 5, 'c');
  track(b, 9);
  b.rect(0, 11, 28, 3, '_');
  for (const x of [5, 14, 23]) b.put(x, 12, 'z');
  b.put(9, 12, 'm');
  b.rect(2, 14, 6, 3, 'H').rect(20, 14, 6, 3, 'H');
  road(b, 18);
  b.rect(12, 18, 4, 2, 'X');
  b.rect(0, 21, 28, 5, '.');
  b.scatter('T', 7, '.', 37, [0, 21, 28, 5], 3);
  return b.done();
}

// ---------- 8 · BIG FIRE: the freight yard, three tracks of wagons and the warehouses ----------
function playaVias() {
  const b = new MB(34, 32, ':');
  b.rect(1, 0, 10, 4, 'W').rect(13, 0, 8, 4, 'W').rect(23, 0, 10, 4, 'W');
  b.fire(13, 0, 2, 2).fire(30, 2, 2, 2);
  b.put(12, 5, 'Y').put(22, 5, 'Y').put(5, 5, 'G').put(6, 5, 'G');
  track(b, 6); // siding with wagons
  b.rect(2, 6, 12, 2, 'g').rect(20, 6, 12, 2, 'g');
  b.fire(8, 6, 2, 2);
  b.rect(0, 8, 34, 2, '_');
  track(b, 10); // line 1
  b.rect(0, 12, 34, 3, '_');
  for (const x of [5, 13, 21, 29]) b.put(x, 13, 'z');
  b.put(17, 13, 'Y').put(9, 13, 'v');
  track(b, 15); // line 2
  b.rect(0, 17, 34, 3, '_');
  b.row(18, 3, 'kkk kkk').row(18, 24, 'kkk kkk');
  b.rect(12, 18, 3, 2, 'S');
  b.fire(24, 18, 2, 1);
  b.rect(3, 20, 8, 4, 'H').rect(23, 20, 8, 4, 'H');
  road(b, 25);
  b.rect(15, 25, 4, 2, 'X');
  b.rect(0, 28, 34, 4, '.');
  b.scatter('T', 9, '.', 39, [0, 28, 34, 4], 3);
  return b.done();
}

// ---------- 9 · Night train: the last train of the night and a fire in the sleepers' store ----------
function nocturno() {
  const b = new MB(28, 26, ':');
  b.rect(0, 0, 28, 4, ',');
  b.scatter('P', 8, ',', 41, [0, 0, 28, 4], 3);
  b.rect(4, 4, 8, 3, 'W');
  b.row(5, 14, 'kkkk').row(6, 14, 'k  k');
  b.fire(14, 5, 2, 1).fire(24, 1, 2, 2).fire(3, 2).fire(7, 4);
  b.put(21, 6, 'Y').put(2, 6, 'L').put(25, 6, 'L');
  track(b, 8);
  b.rect(0, 10, 28, 3, '_');
  for (const x of [5, 14, 23]) b.put(x, 11, 'z');
  b.put(10, 11, 'v').put(18, 12, 'm').put(14, 12, 'Y');
  track(b, 13);
  b.rect(0, 15, 28, 2, '_');
  b.rect(3, 17, 8, 3, 'H').rect(17, 17, 8, 3, 'H');
  b.fire(17, 17, 2, 1).fire(9, 18);
  road(b, 20);
  b.rect(12, 20, 4, 2, 'X');
  b.rect(0, 23, 28, 3, '.');
  b.scatter('T', 6, '.', 43, [0, 23, 28, 3], 3);
  return b.done();
}

// ---------- 10 · Rush hour at the station: a train every few seconds on both lines ----------
function horaPuntaEstacion() {
  const b = new MB(30, 28, ':');
  b.rect(1, 0, 8, 4, 'H').rect(11, 0, 8, 4, 'K').rect(21, 0, 8, 4, 'H');
  b.rect(0, 4, 30, 2, '_');
  b.fire(11, 0, 2, 2).fire(27, 2, 2, 2);
  b.put(10, 5, 'Y').put(20, 5, 'Y').put(4, 5, 'm');
  track(b, 6);
  b.rect(0, 8, 30, 4, '_');
  for (const x of [4, 11, 18, 25]) b.put(x, 9, 'z');
  b.rect(13, 10, 3, 2, 'S');
  b.fire(13, 10, 1, 2);
  b.put(8, 10, 'v').put(22, 10, 'm').put(28, 11, 'Y');
  track(b, 12);
  b.rect(0, 14, 30, 2, '_');
  b.rect(2, 16, 8, 4, 'H').rect(20, 16, 8, 4, 'W');
  b.fire(26, 16, 2, 2);
  road(b, 21);
  b.rect(13, 21, 4, 2, 'X');
  b.rect(0, 24, 30, 4, '.');
  b.scatter('T', 8, '.', 45, [0, 24, 30, 4], 3);
  return b.done();
}

export const ESTACION: LevelDef[] = [
  L(
    {
      id: 'estacion-1',
      theme: 'estacion',
      name: { es: 'El andén', en: 'The platform' },
      tip: {
        es: 'Los trenes pasan cada pocos segundos: espera a que se apaguen las luces. Si un tren pisa tu manguera la corta: engánchate a una boca de riego del otro lado.',
        en: 'Trains come every few seconds: wait for the lights. A train crossing your hose cuts it: hook up to a hydrant on the other side.',
      },
      time: 130,
      hose: 17,
      wind: { angle: 180, strength: 0.25 },
      trains: [{ z: 7, dir: 1, first: 12, every: 18 }],
      stars: [0.88, 0.91],
      minSaved: 0.6,
      under: ':',
    },
    anden(),
  ),
  L(
    {
      id: 'estacion-2',
      theme: 'estacion',
      name: { es: 'Los vagones', en: 'Freight wagons' },
      tip: { es: 'Arden los vagones de la vía muerta, al otro lado de la principal. Apunta por encima de la vía y ojo con el tren.', en: 'The wagons on the siding are burning, across the main line. Spray over the track and mind the trains.' },
      time: 150,
      hose: 17,
      wind: { angle: 0, strength: 0.3 },
      trains: [{ z: 9, dir: -1, first: 10, every: 16 }],
      stars: [0.88, 0.92],
      minSaved: 0.79,
      under: ':',
    },
    vagones(),
  ),
  L(
    {
      id: 'estacion-3',
      theme: 'estacion',
      name: { es: 'El paso a nivel', en: 'The level crossing' },
      tip: { es: 'Un coche arde en la cola del paso a nivel. Cruza la vía cuando no venga el tren y engánchate a la boca de riego del otro lado.', en: 'A car is burning in the queue at the crossing. Cross when no train is coming and hook up to the hydrant on the far side.' },
      time: 150,
      hose: 17,
      wind: { angle: -60, strength: 0.3 },
      trains: [{ z: 9, dir: 1, first: 8, every: 15 }],
      stars: [0.74, 0.77],
      minSaved: 0.68,
      under: '.',
    },
    pasoNivel(),
  ),
  L(
    {
      id: 'estacion-4',
      theme: 'estacion',
      big: true,
      name: { es: 'Incendio en la estación', en: 'Blaze at the station' },
      tip: {
        es: 'Arde un ala de la estación y las naves del otro lado de las dos vías. Usa las bocas de riego de los andenes para no cruzar con la manguera.',
        en: 'A wing of the station and the sheds beyond both tracks are burning. Use the platform hydrants so your hose never crosses a track.',
      },
      headline: { es: 'LA VIEJA ESTACIÓN SE SALVA ENTRE TREN Y TREN', en: 'OLD STATION SAVED BETWEEN TRAINS' },
      time: 210,
      hose: 17,
      wind: { angle: 0, strength: 0.3 },
      trains: [
        { z: 8, dir: 1, first: 14, every: 20 },
        { z: 14, dir: -1, first: 22, every: 20 },
      ],
      stars: [0.72, 0.75],
      minSaved: 0.59,
      under: ':',
    },
    estacionArde(),
  ),
  L(
    {
      id: 'estacion-5',
      theme: 'estacion',
      name: { es: 'La cochera', en: 'The engine shed' },
      tip: { es: 'La cochera tiene bidones de gasóleo junto a la puerta: enfríalos mientras apagas las locomotoras.', en: 'There are fuel drums by the shed door: keep them cool while you put out the engines.' },
      time: 160,
      hose: 17,
      wind: { angle: 90, strength: 0.3 },
      trains: [{ z: 10, dir: -1, first: 10, every: 17 }],
      stars: [0.62, 0.74],
      minSaved: 0.46,
      under: ':',
    },
    cochera(),
  ),
  L(
    {
      id: 'estacion-6',
      theme: 'estacion',
      name: { es: 'Dos vías', en: 'Two tracks' },
      tip: { es: 'Dos vías, trenes en los dos sentidos. Busca el hueco entre tren y tren y engánchate a la boca de riego del andén.', en: 'Two tracks, trains both ways. Find the gap between trains and hook up to the platform hydrant.' },
      time: 170,
      hose: 17,
      wind: { angle: 0, strength: 0.32 },
      trains: [
        { z: 6, dir: 1, first: 9, every: 16 },
        { z: 11, dir: -1, first: 17, every: 16 },
      ],
      stars: [0.78, 0.81],
      minSaved: 0.71,
      under: ':',
    },
    dosVias(),
  ),
  L(
    {
      id: 'estacion-7',
      theme: 'estacion',
      name: { es: 'El almacén de mercancías', en: 'The goods depot' },
      tip: { es: 'Las pacas de paja sueltan pavesas y el tren no espera. Apaga primero la paja que empuja el viento.', en: 'The straw bales throw embers and the train waits for no one. Hit the straw the wind is pushing first.' },
      time: 160,
      hose: 17,
      wind: { angle: 0, strength: 0.38 },
      trains: [{ z: 9, dir: 1, first: 8, every: 14 }],
      stars: [0.71, 0.75],
      minSaved: 0.65,
      under: ':',
    },
    almacen(),
  ),
  L(
    {
      id: 'estacion-8',
      theme: 'estacion',
      big: true,
      name: { es: 'La playa de vías', en: 'The freight yard' },
      tip: {
        es: 'Tres vías, vagones ardiendo y bombonas junto a las naves. Muévete por los andenes y engánchate a sus bocas de riego.',
        en: 'Three tracks, burning wagons and gas bottles by the sheds. Move along the platforms and hook up to their hydrants.',
      },
      headline: { es: 'ARDE LA PLAYA DE VÍAS Y NO DESCARRILA NI UN VAGÓN', en: 'FREIGHT YARD ABLAZE: NOT ONE WAGON LOST' },
      time: 230,
      hose: 17,
      wind: { angle: 0, strength: 0.32 },
      windShifts: [{ t: 110, angle: 180, strength: 0.38 }],
      trains: [
        { z: 10, dir: -1, first: 12, every: 18 },
        { z: 15, dir: 1, first: 21, every: 18 },
      ],
      stars: [0.7, 0.78],
      minSaved: 0.57,
      under: ':',
    },
    playaVias(),
  ),
  L(
    {
      id: 'estacion-9',
      theme: 'estacion',
      name: { es: 'El último tren', en: 'The night train' },
      tip: { es: 'De noche y con dos vías. Los faros del tren avisan: aprovecha los huecos para cruzar.', en: 'At night, with two tracks. The headlights warn you: use the gaps to cross.' },
      time: 180,
      hose: 17,
      wind: { angle: 0, strength: 0.34 },
      trains: [
        { z: 8, dir: 1, first: 10, every: 15 },
        { z: 13, dir: -1, first: 18, every: 15 },
      ],
      stars: [0.68, 0.73],
      minSaved: 0.62,
      night: true,
      under: ':',
    },
    nocturno(),
  ),
  L(
    {
      id: 'estacion-10',
      theme: 'estacion',
      name: { es: 'Hora punta en la estación', en: 'Rush hour at the station' },
      tip: { es: 'Un tren cada pocos segundos en las dos vías. Quédate en el andén central y engánchate a sus bocas de riego.', en: 'A train every few seconds on both lines. Stay on the island platform and use its hydrants.' },
      time: 190,
      hose: 17,
      wind: { angle: 0, strength: 0.36 },
      trains: [
        { z: 6, dir: 1, first: 8, every: 11 },
        { z: 12, dir: -1, first: 13, every: 11 },
      ],
      stars: [0.8, 0.83],
      minSaved: 0.74,
      under: ':',
    },
    horaPuntaEstacion(),
  ),
];
