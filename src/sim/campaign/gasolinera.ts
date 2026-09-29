// Campaign levels of the "gasolinera" scenario (theme 'gasolinera'), in order: index 0 = the 2nd level of this scenario
// (block 1, easiest) ... index 9 = the 11th (block 10, hardest). Ids: 'gasolinera-2' ... 'gasolinera-11'. See the note in ../levels.ts.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

// ---------------- 3 · Área de descanso: a spill that runs like a fuse ----------------
function restStop() {
  const b = new MB(24, 28, '.');
  // country road along the bottom
  b.rect(0, 22, 24, 5, '=').hline(0, 23, 24, '-');
  b.rect(17, 23, 4, 2, 'X');
  // forecourt and shop on the east
  b.rect(10, 0, 14, 22, '#');
  b.rect(15, 1, 8, 4, 'K');
  b.row(7, 12, 'oQ%%%Qo');
  b.rect(13, 6, 3, 1, 'A');
  b.fire(13, 6, 3, 1);
  b.row(13, 12, 'oQoooQo');
  b.rect(19, 12, 2, 1, 'A').rect(13, 17, 2, 1, 'A').rect(21, 19, 2, 1, 'A');
  // the spill runs downhill into the picnic area
  b.rect(0, 0, 10, 22, '.');
  b.rect(4, 8, 5, 12, ',');
  b.vline(9, 0, 21, 'h').put(9, 7, ':').put(9, 15, ':');
  b.vline(12, 8, 10, '%').vline(11, 10, 12, '%').vline(10, 12, 14, 'o').put(9, 14, 'o');
  for (const [x, z] of [
    [2, 1],
    [6, 3],
    [1, 10],
    [6, 12],
    [3, 18],
    [7, 20],
  ])
    b.put(x, z, 'T');
  for (const [x, z] of [
    [3, 4],
    [4, 9],
    [2, 13],
    [5, 17],
  ])
    b.put(x, z, 'n');
  b.put(6, 9, 'd');
  for (const x of [1, 7, 13, 19]) b.put(x, 27, 'T');
  return b.done();
}

// ---------------- 2 · Las bombonas: two gas cages next to a burning lot ----------------
function gasCage() {
  const b = new MB(24, 26, '.');
  // road on the east side
  b.rect(19, 0, 5, 26, '=').vline(21, 0, 25, '-');
  b.rect(19, 17, 2, 4, 'X');
  // lot behind the shop, with the rubbish pallets on dry weeds
  b.rect(6, 0, 13, 6, ',');
  b.row(5, 7, 'kkkk').row(2, 12, 'k').row(3, 12, 'k');
  b.fire(8, 1, 3, 2).fire(7, 3, 2, 2).fire(12, 2, 1, 2);
  b.put(0, 0, 'T').put(3, 2, 'T').put(18, 0, 'P');
  b.vline(5, 0, 5, ':').vline(6, 5, 7, ':');
  // forecourt
  b.rect(7, 6, 12, 20, '#');
  b.rect(14, 6, 5, 4, 'K');
  // two cages of butane bottles: one by the neighbours' garden, one behind the shop
  b.rect(7, 6, 3, 2, 'G');
  b.rect(15, 3, 3, 2, '#').put(15, 4, 'G').put(16, 4, 'G').put(17, 4, 'G').put(16, 3, 'G');
  b.row(14, 8, 'oQoooQo').row(19, 8, 'oQoooQo');
  b.rect(10, 15, 2, 1, 'A').rect(14, 20, 2, 1, 'A').rect(15, 12, 2, 1, 'A');
  b.rect(0, 10, 4, 4, 'H');
  for (const [x, z] of [
    [2, 7],
    [5, 9],
    [4, 16],
    [1, 19],
    [5, 22],
    [2, 25],
  ])
    b.put(x, z, 'T');
  b.vline(6, 8, 25, 'h').put(6, 12, '.').put(6, 20, '.');
  return b.done();
}

// ---------------- 4 · Hora punta: fire jumps bumper to bumper ----------------
function rushHour() {
  const b = new MB(26, 26, '#');
  // road along the top
  b.rect(0, 0, 26, 5, '=').hline(0, 25, 2, '-');
  b.rect(2, 1, 4, 2, 'X');
  // shop on the west side
  b.rect(0, 8, 3, 11, 'K');
  // three queues of cars waiting for the pumps on the east
  for (const z of [7, 12, 17]) {
    b.rect(20, z - 1, 3, 3, 'o').put(21, z, 'Q');
    b.rect(6, z, 14, 1, 'A');
  }
  b.put(20, 7, '%').put(20, 6, '%').put(20, 17, '%').put(20, 18, '%');
  b.fire(18, 7, 2, 1).fire(12, 12, 2, 1).fire(18, 17, 2, 1);
  // grass verges on the east and south
  b.rect(23, 5, 3, 16, '.');
  b.rect(0, 21, 26, 5, '.');
  b.hline(0, 25, 21, 'h').put(12, 21, '.').put(4, 21, '.');
  for (const [x, z] of [
    [2, 23],
    [7, 24],
    [13, 23],
    [18, 24],
    [23, 23],
    [25, 6],
    [24, 10],
    [25, 14],
    [24, 18],
  ])
    b.put(x, z, 'T');
  b.put(9, 5, 'G').put(10, 5, 'G').put(11, 5, 'G');
  return b.done();
}

// ---------------- the original station (level 3), with other fire starts ----------------
function station(fires: [number, number, number?, number?][], spill: [number, number][] = []) {
  const b = new MB(26, 26, '.');
  b.rect(0, 0, 5, 26, '=');
  b.vline(2, 0, 25, '-');
  b.rect(5, 2, 14, 17, '#');
  b.rect(19, 4, 7, 15, ',');
  b.rect(8, 2, 9, 4, 'K');
  b.rect(21, 0, 4, 4, 'H');
  b.put(17, 4, 'G').put(18, 4, 'G').put(17, 5, 'G').put(18, 5, 'G');
  b.put(8, 8, 'o').put(9, 8, 'Q').row(8, 10, 'AA').row(8, 14, 'oQo');
  b.vline(8, 6, 7, 'o');
  b.row(9, 8, 'oooooooooooo');
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
  for (const [x, z] of spill) b.put(x, z, '%');
  for (const [x, z, w, h] of fires) b.fire(x, z, w, h);
  return b.done();
}

// ---------------- 6 · Área de servicio: two forecourts across the motorway ----------------
function services(fires: 'a' | 'b') {
  const b = new MB(30, 32, '.');
  // dual carriageway through the middle; the truck waits on the hard shoulder between both
  b.rect(0, 13, 30, 6, '=').hline(0, 29, 14, '-').hline(0, 29, 17, '-');
  b.rect(13, 15, 4, 2, 'X');
  // north forecourt (westbound)
  b.rect(0, 0, 30, 3, ',');
  b.rect(4, 3, 20, 10, '#');
  b.rect(6, 3, 8, 3, 'K');
  b.put(15, 4, 'G').put(16, 4, 'G').put(15, 5, 'G');
  b.row(9, 7, 'oQoooQo').row(9, 16, 'oQo');
  b.rect(9, 8, 2, 1, 'A').rect(19, 11, 2, 1, 'A').rect(5, 11, 2, 1, 'A');
  b.hline(4, 23, 12, 'h').put(12, 12, '#').put(21, 12, '#');
  // south forecourt (eastbound)
  b.rect(6, 19, 20, 9, '#');
  b.hline(6, 25, 19, 'h').put(9, 19, '#').put(18, 19, '#');
  b.rect(16, 25, 8, 3, 'K');
  b.put(24, 25, 'G').put(24, 26, 'G');
  b.row(22, 9, 'oQoooQo').row(22, 18, 'oQo');
  b.rect(11, 23, 2, 1, 'A').rect(7, 26, 2, 1, 'A').rect(20, 21, 2, 1, 'A');
  b.rect(0, 28, 30, 4, ',');
  // farm tracks split the stubble fields
  b.vline(15, 0, 2, ':').vline(15, 28, 31, ':');
  // verges with trees
  for (const [x, z, c] of [
    [1, 4, 'T'],
    [2, 8, 'P'],
    [0, 11, 'T'],
    [26, 5, 'T'],
    [28, 9, 'P'],
    [25, 11, 'T'],
    [3, 3, 'P'],
    [2, 21, 'T'],
    [4, 25, 'P'],
    [1, 27, 'T'],
    [27, 21, 'T'],
    [28, 25, 'P'],
    [26, 29, 'T'],
    [12, 30, 'P'],
    [19, 29, 'T'],
    [6, 30, 'T'],
  ] as const)
    b.put(x, z, c);
  if (fires === 'a') {
    b.put(9, 9, '%').put(10, 9, '%');
    b.fire(9, 8, 2, 1).fire(26, 1, 2, 1).fire(1, 6).fire(11, 30, 2, 1).fire(27, 29);
  } else {
    b.put(18, 22, '%').put(20, 22, '%');
    b.fire(8, 1, 3, 1).fire(20, 21, 2, 1).fire(2, 20).fire(27, 3);
  }
  return b.done();
}

// ---------------- 7 · Parada de camioneros: livestock, bottles and diesel ----------------
function truckStop() {
  const b = new MB(28, 30, '.');
  b.rect(0, 0, 5, 30, '=').vline(2, 0, 29, '-');
  b.rect(3, 20, 2, 4, 'X');
  // lorry park and diesel islands
  b.rect(5, 6, 17, 16, '#');
  b.rect(8, 2, 10, 4, 'K');
  b.rect(5, 2, 3, 4, '#').rect(18, 2, 4, 4, '#');
  b.put(20, 4, 'G').put(21, 4, 'G').put(20, 5, 'G').put(21, 5, 'G');
  b.put(12, 7, 'd');
  b.row(11, 7, 'oQo%%%oQo').row(12, 10, '%oo').row(16, 7, 'oQo%ooo%o');
  b.rect(8, 12, 2, 1, 'A').rect(13, 17, 2, 1, 'A').rect(17, 8, 2, 1, 'A').rect(6, 19, 2, 1, 'A');
  b.fire(12, 11, 2, 1);
  // livestock pen and the hay store: hay throws embers downwind
  b.rect(21, 12, 7, 7, '#').outline(21, 12, 7, 7, 'f');
  b.put(24, 12, '#');
  b.put(23, 14, 'e').put(25, 15, 'e').put(23, 17, 'e');
  b.rect(22, 6, 2, 4, 'b').put(20, 13, 'b').put(20, 16, 'b').put(24, 19, 'b').put(26, 20, 'b');
  b.fire(22, 6, 1, 2);
  b.put(20, 20, 'Y');
  // stubble field to the south
  b.rect(5, 23, 23, 7, ',');
  for (const [x, z, c] of [
    [24, 1, 'T'],
    [26, 4, 'T'],
    [26, 9, 'P'],
    [7, 25, 'T'],
    [12, 27, 'P'],
    [17, 24, 'T'],
    [22, 27, 'T'],
    [26, 24, 'P'],
    [10, 23, 'T'],
    [6, 0, 'T'],
    [14, 0, 'T'],
  ] as const)
    b.put(x, z, c);
  b.hline(5, 27, 22, 'h').put(11, 22, '#').put(16, 22, '#').put(22, 22, '.');
  return b.done();
}

// ---------------- 8 · Túnel de lavado: a live box by the car wash ----------------
function carWash() {
  const b = new MB(26, 28, '#');
  // back gardens of the village behind a hedge
  b.rect(0, 0, 26, 4, '.');
  b.rect(1, 0, 4, 3, 'H').rect(10, 0, 4, 3, 'H').rect(19, 0, 4, 3, 'H');
  b.put(7, 1, 'T').put(16, 2, 'T').put(24, 1, 'P');
  b.hline(0, 25, 4, 'h').put(9, 4, '#').put(17, 4, '#');
  b.rect(0, 22, 26, 5, '=').hline(0, 25, 24, '-');
  b.rect(0, 27, 26, 1, '.');
  b.rect(19, 23, 4, 2, 'X');
  // shop, and the car wash tunnel with its live box at the end
  b.rect(1, 5, 7, 3, 'K');
  b.put(8, 6, 'G').put(8, 7, 'G');
  b.rect(13, 5, 9, 2, 'K');
  b.put(22, 6, 'E');
  b.put(7, 10, 'Z');
  // vacuum bay: an oil spill
  b.rect(18, 8, 4, 2, 'o');
  b.put(20, 8, '%').put(21, 8, '%');
  b.fire(22, 6);
  b.row(13, 5, 'oQoooQo').row(17, 5, 'oQoooQo');
  b.rect(7, 14, 2, 1, 'A').rect(12, 18, 2, 1, 'A').rect(15, 12, 2, 1, 'A').rect(19, 15, 2, 1, 'A');
  // grass strip with trees on the east
  b.rect(23, 5, 3, 17, '.');
  for (const [x, z] of [
    [24, 7],
    [25, 11],
    [24, 15],
    [25, 19],
  ])
    b.put(x, z, 'T');
  for (const x of [3, 9, 15, 21]) b.put(x, 27, 'T');
  return b.done();
}

// ---------------- 9 · Fiestas del pueblo: rockets over the forecourt ----------------
function fiesta() {
  const b = new MB(28, 30, '.');
  // village street with the fiesta lights
  b.rect(0, 0, 28, 7, '_');
  b.rect(0, 0, 5, 4, 'H').rect(7, 0, 5, 4, 'H').rect(16, 0, 5, 4, 'H').rect(23, 0, 5, 4, 'H');
  b.put(0, 5, 'L').put(9, 5, 'L').put(18, 5, 'L').put(27, 5, 'L');
  b.put(13, 2, 'm').put(3, 5, 'm').put(22, 6, 'm');
  // road
  b.rect(0, 7, 28, 4, '=').hline(0, 27, 9, '-');
  b.rect(11, 8, 4, 2, 'X');
  // forecourt
  b.rect(3, 11, 22, 13, '#');
  b.rect(15, 20, 8, 4, 'K');
  b.put(23, 21, 'G').put(23, 22, 'G');
  b.rect(6, 14, 7, 1, 'o').put(7, 14, 'Q').put(11, 14, 'Q');
  b.rect(6, 18, 7, 1, 'o').put(7, 18, 'Q').put(11, 18, 'Q');
  b.rect(16, 14, 4, 2, 'o').put(17, 14, 'Q');
  b.rect(8, 15, 2, 1, 'A').rect(4, 21, 2, 1, 'A').rect(19, 17, 2, 1, 'A');
  b.hline(3, 24, 11, 'h').put(13, 11, '#').put(14, 11, '#').put(4, 11, '#');
  // fields around
  b.rect(0, 24, 28, 6, ',');
  for (const [x, z, c] of [
    [1, 13, 'T'],
    [0, 18, 'T'],
    [2, 22, 'P'],
    [26, 13, 'T'],
    [25, 17, 'P'],
    [27, 21, 'T'],
    [5, 26, 'T'],
    [13, 28, 'P'],
    [20, 26, 'T'],
    [26, 28, 'P'],
  ] as const)
    b.put(x, z, c);
  b.fire(2, 25, 2, 1);
  b.put(12, 14, '%');
  return b.done();
}

// ---------------- 11 · La gran estación: everything at once ----------------
function bigStation() {
  const b = new MB(32, 32, '.');
  b.rect(0, 0, 5, 32, '=').vline(2, 0, 31, '-');
  b.rect(3, 14, 2, 4, 'X');
  // houses behind the station
  b.rect(6, 0, 4, 3, 'H').rect(13, 0, 4, 3, 'H').rect(20, 0, 4, 3, 'H');
  b.put(11, 1, 'T').put(18, 2, 'T').put(26, 1, 'T');
  b.rect(5, 4, 20, 24, '#');
  b.hline(5, 24, 3, 'h').put(11, 3, '#').put(18, 3, '#');
  // shop with its gas cage and a burning car next to it
  b.rect(7, 5, 8, 3, 'K');
  b.put(15, 5, 'G').put(16, 5, 'G').put(15, 6, 'G').put(16, 6, 'G');
  b.rect(15, 8, 2, 1, 'A');
  b.fire(15, 8, 2, 1);
  // tanker unloading: a big spill
  b.rect(9, 11, 7, 3, 'o');
  b.put(11, 12, '%').put(12, 12, '%').put(13, 12, '%').put(12, 11, '%');
  b.row(17, 7, 'oQoooQo').row(21, 7, 'oQoooQo');
  b.rect(9, 18, 2, 1, 'A').rect(13, 22, 2, 1, 'A').rect(6, 9, 2, 1, 'A').rect(19, 16, 2, 1, 'A').rect(20, 10, 2, 1, 'A');
  // car wash with its live box; the lever is by the road
  b.rect(17, 24, 7, 2, 'K');
  b.put(24, 25, 'E');
  b.fire(24, 25);
  b.put(7, 26, 'Z');
  b.put(19, 14, 'v').put(21, 27, 'd');
  // grass verge with pines on the east: the wind will bring that fire back
  b.hline(25, 25, 4, 'h');
  b.vline(25, 4, 27, 'h').put(25, 12, '.').put(25, 20, '.');
  b.scatter('P', 16, '.', 311, [26, 0, 6, 32], 2);
  b.rect(27, 10, 4, 5, ',');
  b.fire(28, 12, 2, 1);
  for (const x of [7, 13, 19]) b.put(x, 30, 'T');
  return b.done();
}

export const GASOLINERA: LevelDef[] = [
  L(
    {
      id: 'gasolinera-2',
      theme: 'gasolinera',
      name: { es: 'Las bombonas', en: 'The gas cage' },
      tip: { es: 'El fuego va hacia las bombonas. Moja las dos jaulas sin parar o explotarán.', en: 'The fire is heading for the gas bottles. Keep both cages wet or they will blow.' },
      time: 120,
      hose: 18,
      foam: 8,
      wind: { angle: 90, strength: 0.45 },
      stars: [0.84, 0.89],
      minSaved: 0.75,
      under: '#',
    },
    gasCage(),
  ),
  L(
    {
      id: 'gasolinera-3',
      theme: 'gasolinera',
      name: { es: 'Área de descanso', en: 'Rest stop' },
      tip: { es: 'El combustible corre hacia el merendero: echa espuma al reguero antes de que lo siga el fuego.', en: 'Fuel is trickling toward the picnic area. Foam the trail before the fire follows it.' },
      time: 120,
      hose: 18,
      foam: 16,
      wind: { angle: 180, strength: 0.25 },
      stars: [0.76, 0.92],
      minSaved: 0.64,
      under: '.',
    },
    restStop(),
  ),
  L(
    {
      id: 'gasolinera-4',
      theme: 'gasolinera',
      name: { es: 'Hora punta', en: 'Rush hour' },
      tip: { es: 'El fuego salta de coche en coche. Moja los siguientes de la cola para cortarlo.', en: 'Fire jumps from car to car. Soak the next ones in line to stop it.' },
      time: 130,
      hose: 18,
      foam: 10,
      wind: { angle: 180, strength: 0.35 },
      stars: [0.8, 0.93],
      minSaved: 0.68,
      under: '#',
    },
    rushHour(),
  ),
  L(
    {
      id: 'gasolinera-5',
      theme: 'gasolinera',
      name: { es: 'Turno de noche', en: 'Graveyard shift' },
      tip: { es: 'Un fuego de rastrojos avanza hacia la gasolinera. Enfría las bombonas del borde y vigila el reguero.', en: 'A field fire is creeping toward the station. Cool the bottles on the edge and watch the fuel line.' },
      time: 140,
      hose: 18,
      foam: 10,
      wind: { angle: 180, strength: 0.3 },
      stars: [0.7, 0.8],
      minSaved: 0.48,
      night: true,
      under: '#',
    },
    station([[24, 8, 1, 3], [25, 9], [23, 14, 2, 1]]),
  ),
  L(
    {
      id: 'gasolinera-6',
      theme: 'gasolinera',
      name: { es: 'Área de servicio', en: 'Motorway services' },
      tip: { es: 'Arde a los dos lados de la autovía. Ataca primero hacia donde sopla el viento: luego girará.', en: 'Fires on both sides of the motorway. Hit the downwind side first: the wind will turn.' },
      time: 160,
      hose: 18,
      foam: 12,
      wind: { angle: 90, strength: 0.3 },
      windShifts: [{ t: 70, angle: -90, strength: 0.35 }],
      stars: [0.72, 0.78],
      minSaved: 0.6,
      under: '#',
    },
    services('a'),
  ),
  L(
    {
      id: 'gasolinera-7',
      theme: 'gasolinera',
      name: { es: 'Parada de camioneros', en: 'Truck stop' },
      tip: { es: 'Saca a las ovejas del corral, apaga el gasóleo con espuma y vigila las bombonas del bar.', en: 'Get the sheep out of the pen, foam the diesel and watch the bottles by the diner.' },
      time: 160,
      hose: 20,
      foam: 10,
      wind: { angle: 60, strength: 0.35 },
      stars: [0.66, 0.72],
      minSaved: 0.585,
      under: '#',
    },
    truckStop(),
  ),
  L(
    {
      id: 'gasolinera-8',
      theme: 'gasolinera',
      name: { es: 'Túnel de lavado', en: 'Car wash' },
      tip: { es: 'El cuadro del lavadero tiene corriente. Baja la palanca junto a la tienda antes de mojarlo.', en: 'The car wash box is live. Pull the lever by the shop before you spray it.' },
      time: 150,
      hose: 18,
      foam: 10,
      wind: { angle: -150, strength: 0.4 },
      stars: [0.7, 0.76],
      minSaved: 0.545,
      under: '#',
    },
    carWash(),
  ),
  L(
    {
      id: 'gasolinera-9',
      theme: 'gasolinera',
      name: { es: 'Fiestas del pueblo', en: 'Fireworks night' },
      tip: { es: 'Caen cohetes de la fiesta. Moja la zona marcada antes de que llegue, también junto a los surtidores.', en: 'Rockets from the fiesta are coming down. Wet each marked spot before they land, even by the pumps.' },
      time: 170,
      hose: 18,
      foam: 10,
      wind: { angle: -90, strength: 0.35 },
      fireworks: { count: 12, first: 6, every: 7 },
      stars: [0.8, 0.88],
      minSaved: 0.68,
      night: true,
      under: '_',
    },
    fiesta(),
  ),
  L(
    {
      id: 'gasolinera-10',
      theme: 'gasolinera',
      name: { es: 'Vendaval', en: 'Gale warning' },
      tip: { es: 'Rachas muy fuertes que cambian dos veces. Espuma justa: guárdala para el combustible.', en: 'Strong gusts that shift twice. Foam is short: save it for the fuel.' },
      time: 170,
      hose: 18,
      foam: 8,
      wind: { angle: 0, strength: 0.5 },
      windShifts: [
        { t: 25, angle: 90, strength: 0.55 },
        { t: 55, angle: 200, strength: 0.5 },
      ],
      stars: [0.8, 0.86],
      minSaved: 0.68,
      under: '#',
    },
    services('b'),
  ),
  L(
    {
      id: 'gasolinera-11',
      theme: 'gasolinera',
      name: { es: 'La gran estación', en: 'Meltdown at the pumps' },
      tip: { es: 'Todo a la vez: espuma para la cisterna, palanca para el lavadero y agua para las bombonas.', en: 'Everything at once: foam for the tanker spill, the lever for the car wash, water for the bottles.' },
      time: 190,
      hose: 18,
      foam: 12,
      wind: { angle: 90, strength: 0.3 },
      windShifts: [{ t: 80, angle: 180, strength: 0.35 }],
      stars: [0.6, 0.66],
      minSaved: 0.535,
      under: '#',
    },
    bigStation(),
  ),
];
