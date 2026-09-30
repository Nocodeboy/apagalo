// Downtown (theme 'ciudad'), star mechanic: people trapped at the windows. A 'J' cell is the yellow spot on the
// pavement right under a window of the building north of it: standing there for 1.5 s brings the aerial platform up and
// gets them down. If the fire reaches their window (the building cells next to it) for 4.5 s they escape over the
// roof: the third star is lost and they count against the saved area. docs/diseno-v2.md §5.1.
// Towers ('M') are 4-cell chunks, tall, slow to catch and worth a lot; keep alleys between blocks so fires can be held.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

/** Street with its lane line, `z` is the top row (3 rows), pavement on both sides. */
function street(b: MB, z: number, crossings: number[] = []) {
  b.rect(0, z, b.W, 3, '=');
  b.hline(0, b.W - 1, z + 1, '-');
  for (const x of crossings) b.rect(x, z, 2, 3, '+');
}

// ---------- 1 · Main Street (intro): a tower on fire in a row of towers, people at the windows ----------
function calleMayor() {
  const b = new MB(26, 22, '_');
  b.rect(1, 2, 24, 4, 'M');
  b.fire(9, 3, 2, 1).fire(21, 3).fire(2, 3);
  b.put(4, 6, 'J').put(10, 6, 'J').put(16, 6, 'J');
  b.put(1, 6, 'T').put(7, 6, 'T').put(13, 6, 'T').put(19, 6, 'T').put(24, 6, 'T');
  street(b, 8, [5]);
  b.rect(14, 8, 4, 2, 'X');
  b.put(21, 11, 'Y').put(3, 11, 'i').put(12, 11, 'i');
  b.rect(1, 12, 5, 3, 'K').rect(8, 13, 3, 2, 'S').rect(13, 12, 12, 3, 'K');
  b.fire(19, 13);
  b.rect(0, 16, 26, 6, '.');
  b.scatter('T', 9, '.', 3, [0, 16, 26, 6], 3);
  b.put(9, 17, 'n').put(15, 17, 'n');
  return b.done();
}

// ---------- 2 · The corner café: a terrace with straw parasols under the buildings ----------
function cafe() {
  const b = new MB(26, 24, '_');
  b.rect(1, 1, 8, 5, 'M').rect(9, 1, 8, 5, 'K').rect(17, 1, 8, 5, 'M');
  b.put(3, 6, 'J').put(21, 6, 'J');
  // the terrace: parasols, the café kiosk, planters and trees
  for (const [x, z] of [
    [10, 9],
    [12, 9],
    [14, 9],
    [16, 9],
    [11, 11],
    [13, 11],
    [15, 11],
  ])
    b.put(x, z, 'u');
  b.rect(12, 7, 3, 1, 'S');
  b.fire(12, 7, 2, 1).fire(16, 9).fire(11, 2).fire(22, 3);
  b.hline(2, 8, 8, 'h').hline(18, 24, 8, 'h');
  b.put(2, 9, 'T').put(6, 9, 'T').put(20, 9, 'T').put(24, 9, 'T');
  b.put(4, 11, 'm').put(18, 12, 'm');
  street(b, 14, [12]);
  b.rect(2, 14, 4, 2, 'X');
  b.put(23, 17, 'Y').put(9, 17, 'i');
  b.rect(1, 18, 24, 4, 'M');
  b.rect(9, 18, 8, 4, 'K');
  b.put(3, 22, 'J').put(21, 22, 'J');
  return b.done();
}

// ---------- 3 · BIG FIRE: towering inferno, a whole block alight with people at the windows ----------
function inferno() {
  const b = new MB(32, 30, '_');
  // north block: the burning tower in the middle of a row of towers
  b.rect(1, 2, 30, 5, 'M');
  b.fire(14, 2, 2, 1).fire(19, 5).fire(5, 3);
  b.put(2, 7, 'J').put(11, 7, 'J').put(15, 7, 'J').put(19, 7, 'J').put(27, 7, 'J');
  b.put(9, 7, 'Y').put(23, 7, 'T').put(6, 7, 'T');
  street(b, 9, [8, 22]);
  b.rect(1, 9, 2, 1, 'A').rect(27, 10, 2, 1, 'A');
  b.fire(27, 10);
  // middle: shops, a café terrace and the hotel
  b.rect(1, 13, 7, 4, 'K').rect(9, 13, 3, 2, 'S').rect(14, 13, 17, 4, 'M');
  b.rect(24, 13, 7, 4, 'K');
  b.put(9, 16, 'u').put(11, 16, 'u');
  b.put(16, 17, 'J').put(20, 17, 'J');
  b.put(10, 17, 'm').put(12, 17, 'i');
  street(b, 19, [12]);
  b.rect(14, 19, 4, 2, 'X');
  b.put(6, 22, 'Y').put(26, 22, 'Y');
  b.rect(1, 23, 8, 6, 'M').rect(11, 23, 10, 6, '.').rect(23, 23, 8, 6, 'M');
  b.rect(12, 24, 8, 3, ',');
  b.scatter('T', 8, '.,', 7, [11, 23, 10, 6], 2);
  b.put(3, 29, 'J').put(28, 29, 'J');
  b.fire(16, 14).fire(15, 25).fire(26, 24);
  return b.done();
}

// ---------- 4 · The food market: a covered hall full of stalls in the middle of the block ----------
function mercado() {
  const b = new MB(28, 24, '_');
  b.rect(1, 1, 7, 5, 'M').rect(20, 1, 7, 5, 'M');
  b.rect(8, 1, 12, 7, 'H');
  b.rect(8, 8, 3, 2, 'S').rect(12, 8, 3, 2, 'S').rect(16, 8, 3, 2, 'S');
  b.fire(8, 5, 2, 1).fire(17, 8);
  b.put(2, 6, 'J').put(5, 6, 'J').put(24, 6, 'J');
  b.put(13, 10, 'm').put(6, 9, 'T').put(21, 9, 'T').put(20, 7, 'h').put(21, 7, 'h');
  street(b, 11, [6, 20]);
  b.rect(12, 11, 4, 2, 'X');
  b.rect(3, 12, 2, 1, 'A');
  b.put(9, 14, 'Y').put(24, 14, 'i');
  b.rect(1, 15, 26, 4, 'K');
  b.rect(10, 15, 8, 4, 'M');
  b.put(12, 19, 'J').put(16, 19, 'J');
  b.rect(0, 20, 28, 4, '.');
  b.scatter('T', 8, '.', 11, [0, 20, 28, 4], 3);
  return b.done();
}

// ---------- 5 · The city park: dry lawns and trees in front of the towers ----------
function parque() {
  const b = new MB(30, 28, '_');
  b.rect(1, 1, 28, 5, 'M');
  b.put(2, 6, 'J').put(11, 6, 'J').put(18, 6, 'J').put(25, 6, 'J');
  street(b, 7, [14]);
  b.rect(4, 7, 2, 1, 'A');
  // the park
  b.rect(1, 11, 28, 10, '.');
  b.rect(3, 12, 9, 5, ',').rect(16, 13, 11, 6, ',');
  b.rect(12, 13, 4, 4, 'F');
  b.rect(19, 11, 3, 2, 'S');
  b.hline(1, 28, 10, 'h');
  b.scatter('T', 26, '.,', 9, [1, 11, 28, 10], 2);
  b.put(8, 18, 'n').put(22, 20, 'n').put(6, 17, 'm').put(27, 12, 'd');
  b.fire(5, 14).fire(23, 17);
  b.put(14, 11, 'Y');
  street(b, 22, [14]);
  b.rect(8, 22, 4, 2, 'X');
  b.rect(0, 25, 30, 3, '_');
  b.put(20, 25, 'Y');
  return b.done();
}

// ---------- 6 · The car park: rows of cars and planters in front of the shopping centre ----------
function aparcamiento() {
  const b = new MB(28, 26, '_');
  b.rect(1, 1, 26, 6, 'M');
  b.put(3, 7, 'J').put(12, 7, 'J').put(21, 7, 'J');
  b.hline(1, 26, 8, 'h');
  b.rect(1, 9, 26, 10, '#');
  for (const z of [10, 13, 16]) for (let x = 2; x < 26; x += 3) b.rect(x, z, 2, 1, 'A');
  for (const z of [11, 14]) for (let x = 2; x < 26; x += 3) b.put(x + 2, z, 'h');
  for (const z of [12, 15]) for (const x of [4, 10, 16, 22]) b.put(x, z, 'T');
  b.fire(20, 10).fire(8, 13).fire(14, 16).fire(2, 10).fire(24, 16);
  b.put(0, 12, 'Y').put(27, 15, 'Y').put(14, 19, 'i');
  street(b, 20, [12]);
  b.rect(3, 20, 4, 2, 'X');
  b.rect(0, 23, 28, 3, '.');
  b.scatter('T', 7, '.', 23, [0, 23, 28, 3], 3);
  return b.done();
}

// ---------- 7 · BIG FIRE: downtown blackout, a night with the whole avenue on fire ----------
function apagon() {
  const b = new MB(32, 30, '_');
  b.rect(1, 2, 30, 5, 'M');
  b.fire(9, 4, 2, 1).fire(26, 5);
  b.put(2, 7, 'J').put(10, 7, 'J').put(13, 7, 'J').put(26, 7, 'J').put(29, 7, 'J');
  b.put(8, 7, 'Y').put(24, 7, 'Y').put(5, 7, 'T').put(18, 7, 'T');
  street(b, 9, [7, 23]);
  b.rect(12, 10, 2, 1, 'A').rect(18, 9, 2, 1, 'A');
  b.fire(18, 9);
  b.rect(1, 13, 7, 5, 'K').rect(10, 13, 3, 2, 'S').rect(14, 13, 4, 2, 'S').rect(20, 13, 11, 5, 'M');
  b.fire(1, 13);
  b.put(11, 16, 'u').put(15, 16, 'u');
  b.put(21, 18, 'J').put(28, 18, 'J');
  b.put(11, 17, 'm').put(16, 17, 'i');
  street(b, 19, [12]);
  b.rect(14, 19, 4, 2, 'X');
  b.rect(1, 23, 9, 6, 'M').rect(12, 23, 8, 6, '.').rect(22, 23, 9, 6, 'M');
  b.rect(13, 24, 6, 3, ',');
  b.scatter('T', 7, '.,', 13, [12, 23, 8, 6], 2);
  b.put(3, 29, 'J').put(25, 29, 'J').put(11, 22, 'Y');
  return b.done();
}

// ---------- 8 · The hotel: a tall block full of guests at the windows ----------
function hotel() {
  const b = new MB(28, 26, '_');
  b.rect(1, 2, 26, 4, 'M');
  b.rect(9, 2, 12, 6, 'M');
  b.fire(11, 5).fire(19, 4);
  b.put(9, 8, 'J').put(12, 8, 'J').put(15, 8, 'J').put(18, 8, 'J').put(20, 8, 'J').put(3, 6, 'J');
  b.put(5, 6, 'T').put(24, 6, 'T').put(7, 8, 'Y');
  b.rect(22, 7, 3, 2, 'S');
  b.put(22, 9, 'u').put(24, 9, 'u');
  street(b, 10, [7]);
  b.rect(15, 10, 4, 2, 'X');
  b.rect(3, 11, 2, 1, 'A');
  b.rect(1, 14, 26, 5, 'K');
  b.rect(10, 14, 8, 5, 'M');
  b.put(12, 19, 'J').put(21, 13, 'Y');
  b.rect(0, 21, 28, 5, '.');
  b.scatter('T', 9, '.', 29, [0, 21, 28, 5], 3);
  return b.done();
}

// ---------- 9 · Opening night: the theatre on the square, full of people ----------
function teatro() {
  const b = new MB(28, 28, '_');
  b.rect(1, 1, 7, 6, 'M').rect(20, 1, 7, 6, 'M');
  b.rect(8, 1, 12, 5, 'I');
  b.fire(9, 4);
  b.put(2, 7, 'J').put(5, 7, 'J').put(24, 7, 'J');
  b.rect(8, 7, 12, 6, '_');
  b.rect(12, 9, 4, 4, 'F');
  b.put(9, 8, 'm').put(18, 8, 'm').put(9, 12, 'v').put(19, 11, 'm');
  b.put(8, 10, 'L').put(19, 10, 'L').put(7, 13, 'T').put(20, 13, 'T');
  b.put(10, 7, 'u').put(17, 7, 'u');
  b.rect(1, 9, 6, 3, 'K').rect(21, 9, 6, 3, 'K');
  b.hline(1, 6, 12, 'h').hline(21, 26, 12, 'h');
  b.fire(22, 9);
  street(b, 15, [13]);
  b.rect(3, 15, 4, 2, 'X');
  b.put(20, 18, 'Y').put(9, 18, 'i');
  b.rect(1, 19, 26, 5, 'M');
  b.rect(11, 19, 6, 5, 'K');
  b.put(3, 24, 'J').put(22, 24, 'J');
  b.rect(0, 25, 28, 3, '.');
  b.scatter('T', 6, '.', 31, [0, 25, 28, 3], 3);
  return b.done();
}

// ---------- 10 · Rush hour: gusty wind down the avenue, cars and windows everywhere ----------
function horaPunta() {
  const b = new MB(32, 28, '_');
  b.rect(1, 2, 30, 4, 'M');
  b.fire(9, 4).fire(28, 3);
  b.put(2, 6, 'J').put(10, 6, 'J').put(13, 6, 'J').put(19, 6, 'J').put(26, 6, 'J');
  b.put(6, 6, 'T').put(16, 6, 'T').put(23, 6, 'T');
  street(b, 8, [6, 23]);
  for (const x of [1, 9, 13, 20, 28]) b.rect(x, 8, 2, 1, 'A');
  for (const x of [3, 11, 17, 25]) b.rect(x, 10, 2, 1, 'A');
  b.fire(13, 8);
  b.put(7, 11, 'Y').put(24, 11, 'Y');
  b.rect(1, 12, 30, 4, 'K');
  b.rect(9, 12, 7, 4, 'M').rect(18, 12, 4, 2, 'S');
  b.put(10, 16, 'J').put(14, 16, 'J');
  b.put(4, 16, 'T').put(20, 16, 'T').put(27, 16, 'T');
  street(b, 18, [16]);
  b.rect(10, 18, 4, 2, 'X');
  b.rect(1, 22, 30, 5, 'M');
  b.rect(11, 22, 10, 5, 'K');
  b.put(3, 27, 'J').put(27, 27, 'J').put(21, 21, 'Y');
  return b.done();
}

export const CIUDAD: LevelDef[] = [
  L(
    {
      id: 'ciudad-1',
      theme: 'ciudad',
      name: { es: 'La calle mayor', en: 'Main Street' },
      tip: {
        es: 'Hay vecinos atrapados en las ventanas. Quédate en la marca amarilla bajo cada ventana y la plataforma los bajará.',
        en: 'People are trapped at the windows. Stand on the yellow spot under each window and the platform brings them down.',
      },
      time: 130,
      hose: 17,
      wind: { angle: 180, strength: 0.2 },
      stars: [0.91, 0.95],
      minSaved: 0.6,
      under: '_',
    },
    calleMayor(),
  ),
  L(
    {
      id: 'ciudad-2',
      theme: 'ciudad',
      name: { es: 'El café de la esquina', en: 'The corner café' },
      tip: { es: 'Arde el quiosco del café y las sombrillas son de paja. Frénalo antes de que llegue a los edificios.', en: 'The café kiosk is burning and the parasols are straw. Stop it before it reaches the buildings.' },
      time: 130,
      hose: 17,
      wind: { angle: -90, strength: 0.3 },
      stars: [0.85, 0.9],
      minSaved: 0.79,
      under: '_',
    },
    cafe(),
  ),
  L(
    {
      id: 'ciudad-3',
      theme: 'ciudad',
      big: true,
      name: { es: 'Rascacielos en llamas', en: 'Towering inferno' },
      tip: {
        es: 'Arde la torre del centro con gente en las ventanas. Rescata primero a quien tenga el fuego más cerca.',
        en: 'The tower in the middle is on fire with people at its windows. Rescue first whoever has the fire closest.',
      },
      headline: { es: 'RESCATE DE ALTURA: TODOS A SALVO EN LA TORRE EN LLAMAS', en: 'SKY-HIGH RESCUE: EVERYONE OUT OF THE BURNING TOWER' },
      time: 200,
      hose: 18,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.76, 0.79],
      minSaved: 0.64,
      under: '_',
    },
    inferno(),
  ),
  L(
    {
      id: 'ciudad-4',
      theme: 'ciudad',
      name: { es: 'El mercado de abastos', en: 'The food hall' },
      tip: { es: 'El mercado arde por un rincón y los puestos están pegados. Ataja el fuego antes de que cruce la nave.', en: 'The hall is burning at one corner and the stalls are packed. Cut the fire off before it crosses the hall.' },
      time: 150,
      hose: 17,
      wind: { angle: 0, strength: 0.32 },
      stars: [0.66, 0.71],
      minSaved: 0.6,
      under: '_',
    },
    mercado(),
  ),
  L(
    {
      id: 'ciudad-5',
      theme: 'ciudad',
      name: { es: 'El parque', en: 'City park' },
      tip: { es: 'El césped seco del parque arde deprisa y hay gente en las ventanas de enfrente. Que el fuego no cruce la calle.', en: "The dry lawns burn fast and there are people at the windows across the street. Don't let it cross the road." },
      time: 150,
      hose: 17,
      wind: { angle: -90, strength: 0.35 },
      stars: [0.8, 0.84],
      minSaved: 0.74,
      under: '_',
    },
    parque(),
  ),
  L(
    {
      id: 'ciudad-6',
      theme: 'ciudad',
      name: { es: 'El aparcamiento', en: 'The car park' },
      tip: { es: 'Los coches arden despacio pero pasan el fuego al de al lado. Apágalos por filas y vigila las ventanas.', en: 'Cars burn slowly but pass the fire to the next one. Clear them row by row and watch the windows.' },
      time: 160,
      hose: 17,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.89, 0.92],
      minSaved: 0.8,
      under: '_',
    },
    aparcamiento(),
  ),
  L(
    {
      id: 'ciudad-7',
      theme: 'ciudad',
      big: true,
      name: { es: 'Apagón en el centro', en: 'Downtown blackout' },
      tip: {
        es: 'Noche cerrada, la avenida entera ardiendo y va a irse la luz. Memoriza dónde están las ventanas y las bocas de riego.',
        en: "Pitch dark, the whole avenue burning and the power's about to go. Remember where the windows and hydrants are.",
      },
      headline: { es: 'LA CIUDAD A OSCURAS Y EN LLAMAS: UN BOMBERO LA DEVUELVE A LA NORMALIDAD', en: 'DOWNTOWN IN THE DARK AND ABLAZE: ONE FIREFIGHTER TURNS IT AROUND' },
      time: 220,
      hose: 18,
      wind: { angle: 0, strength: 0.32 },
      windShifts: [{ t: 100, angle: 180, strength: 0.38 }],
      stars: [0.75, 0.78],
      minSaved: 0.67,
      night: true,
      under: '_',
      wantEvents: ['blackout'],
    },
    apagon(),
  ),
  L(
    {
      id: 'ciudad-8',
      theme: 'ciudad',
      name: { es: 'El hotel', en: 'The hotel' },
      tip: { es: 'El hotel arde por dos sitios y está lleno de huéspedes. Reparte el tiempo entre el fuego y la plataforma.', en: 'The hotel is burning in two places and full of guests. Split your time between the fire and the platform.' },
      time: 180,
      hose: 18,
      wind: { angle: 90, strength: 0.28 },
      stars: [0.73, 0.76],
      minSaved: 0.67,
      under: '_',
    },
    hotel(),
  ),
  L(
    {
      id: 'ciudad-9',
      theme: 'ciudad',
      name: { es: 'Noche de estreno', en: 'Opening night' },
      tip: { es: 'Noche de estreno y el teatro empieza a arder. Saca a la gente de la plaza y que no salte a los edificios.', en: 'Opening night and the theatre is catching fire. Get people off the square and keep it off the buildings.' },
      time: 170,
      hose: 17,
      wind: { angle: 90, strength: 0.32 },
      stars: [0.77, 0.97],
      minSaved: 0.6,
      night: true,
      under: '_',
    },
    teatro(),
  ),
  L(
    {
      id: 'ciudad-10',
      theme: 'ciudad',
      name: { es: 'Hora punta', en: 'Rush hour' },
      tip: { es: 'Rachas de viento por la avenida, coches en llamas y ventanas por todas partes. Engánchate a las bocas de riego.', en: 'Gusts down the avenue, cars on fire and windows everywhere. Use the hydrants to reach it all.' },
      time: 200,
      hose: 17,
      wind: { angle: 0, strength: 0.4 },
      windShifts: [
        { t: 60, angle: 180, strength: 0.45 },
        { t: 130, angle: 0, strength: 0.4 },
      ],
      stars: [0.84, 0.88],
      minSaved: 0.61,
      under: '_',
    },
    horaPunta(),
  ),
];
