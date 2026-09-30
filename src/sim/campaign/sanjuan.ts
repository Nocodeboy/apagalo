// Campaign levels of the "sanjuan" scenario (theme 'sanjuan'), in order: index 0 = the 2nd level of this scenario
// (block 1, easiest) ... index 9 = the 11th (block 10, hardest). Ids: 'sanjuan-2' ... 'sanjuan-11'. See the note in ../levels.ts.
//
// Every map has the sea along the top (the theme paints water beyond the north edge). Sand does not burn: the fire
// lives on the dunes, the wooden boardwalks and piers, the beach bars, umbrellas, stalls and pines.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

type Pt = [number, number];

/** Sea on rows 0..z-1 with a wavy shoreline. */
function sea(b: MB, z: number) {
  b.rect(0, 0, b.W, z, '~');
  const pts: Pt[] = [];
  for (let x = 0; x <= b.W + 3; x += 7) pts.push([x, z + (x % 14 ? 0.6 : -0.2)]);
  b.path(pts, '~', 1.2);
}

/** Promenade with palms (row z..z+1), road (z+2..z+4) and pavement below. */
function seafront(b: MB, z: number, palmsFrom = 1) {
  b.rect(0, z, b.W, 2, '_');
  for (let x = palmsFrom; x < b.W; x += 4) b.put(x, z, 'p');
  b.rect(0, z + 2, b.W, 3, '=');
  b.hline(0, b.W - 1, z + 3, '-');
  if (z + 5 < b.H) b.rect(0, z + 5, b.W, b.H - z - 5, '_');
}

// ---------------- A · Bonfires in the cove (block 1) ----------------
function cala() {
  const b = new MB(24, 24, ';');
  sea(b, 4);
  b.put(0, 5, 'r').put(1, 6, 'r').put(23, 5, 'r').put(22, 6, 'r');
  // dunes with dry grass and pines on both sides
  b.rect(0, 10, 5, 4, ',').circle(2, 11, 2, ',');
  b.rect(19, 9, 5, 4, ',').circle(21, 10, 2, ',');
  b.put(1, 12, 'P').put(3, 10, 'P').put(20, 11, 'P').put(22, 9, 'P');
  // the party: three bonfires and people around them
  b.put(6, 8, 'y').put(12, 7, 'y').put(17, 9, 'y');
  for (const [x, z] of [
    [5, 7],
    [7, 9],
    [11, 8],
    [13, 6],
    [16, 8],
    [18, 10],
  ] as Pt[])
    b.put(x, z, 'm');
  for (const [x, z] of [
    [9, 12],
    [15, 12],
    [5, 14],
    [18, 14],
  ] as Pt[])
    b.put(x, z, 'u');
  // wooden walkway down to the sand
  b.vline(11, 13, 16, 'w').vline(12, 13, 16, 'w');
  b.hline(2, 21, 17, 'w');
  seafront(b, 18);
  b.put(6, 19, 'L').put(17, 19, 'L');
  b.rect(10, 20, 4, 2, 'X');
  b.fire(1, 11);
  return b.done();
}

// ---------------- B · The seafront boardwalk (blocks 2 and 8) ----------------
function paseo() {
  const b = new MB(28, 26, ';');
  sea(b, 4);
  // beach with umbrellas and two bonfires by the water
  b.put(7, 6, 'y').put(20, 7, 'y');
  b.put(6, 7, 'm').put(8, 5, 'm').put(19, 6, 'm').put(21, 8, 'm');
  for (const [x, z] of [
    [3, 7],
    [11, 6],
    [15, 8],
    [25, 6],
    [10, 9],
    [17, 5],
  ] as Pt[])
    b.put(x, z, 'u');
  // three beach bars on the boardwalk
  b.rect(0, 12, 28, 2, 'w');
  b.rect(2, 9, 4, 3, 'U').rect(12, 9, 4, 3, 'U').rect(22, 9, 4, 3, 'U');
  b.rect(1, 11, 6, 1, 'w').rect(11, 11, 6, 1, 'w').rect(21, 11, 6, 1, 'w');
  // dune grass behind the boardwalk
  b.rect(0, 14, 9, 2, ',').rect(10, 14, 8, 2, ',').rect(19, 14, 9, 2, ',');
  b.put(3, 15, 'P').put(14, 14, 'P').put(24, 15, 'P');
  b.rect(0, 16, 28, 1, ';');
  seafront(b, 17, 2);
  b.rect(0, 23, 3, 3, 'H').rect(25, 23, 3, 3, 'H');
  b.put(8, 22, 'L').put(19, 22, 'L');
  b.rect(12, 19, 4, 2, 'X');
  return b.done();
}

// ---------------- C · The pier (block 3) ----------------
function espigon() {
  const b = new MB(26, 30, '~');
  // beach, boardwalk, promenade
  b.rect(0, 18, 26, 4, ';');
  b.path(
    [
      [0, 18],
      [8, 17.6],
      [17, 18.2],
      [26, 17.8],
    ],
    ';',
    1.2,
  );
  b.rect(0, 22, 26, 1, 'w');
  seafront(b, 23);
  // the pier: a long wooden walkway with a fair on its head and a stall halfway
  b.rect(11, 6, 3, 16, 'w');
  b.rect(7, 2, 11, 4, '_');
  b.rect(7, 2, 3, 1, 'S').rect(10, 2, 3, 1, 'C').rect(15, 2, 3, 1, 'S').rect(7, 5, 3, 1, 'S').rect(15, 5, 3, 1, 'S');
  b.rect(8, 10, 3, 3, 'w');
  b.rect(8, 10, 2, 1, 'S');
  b.rect(14, 14, 3, 2, 'w');
  b.put(15, 14, 'k');
  b.put(12, 12, 'Y');
  for (const [x, z] of [
    [8, 4],
    [16, 4],
    [12, 7],
    [9, 12],
    [13, 17],
    [4, 22],
    [21, 22],
  ] as Pt[])
    b.put(x, z, 'm');
  // bonfires on the beach and a couple of umbrellas
  b.put(4, 19, 'y').put(21, 20, 'y');
  b.put(7, 20, 'u').put(17, 19, 'u');
  b.rect(11, 25, 4, 2, 'X');
  b.fire(7, 2, 2, 1);
  return b.done();
}

// ---------------- D · Midsummer night (the original map, block 4) ----------------
function sanjuanBase() {
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
  b.rect(0, 13, 8, 5, ',');
  b.rect(22, 12, 8, 5, ',');
  b.circle(4, 15, 2, ',');
  b.put(2, 14, 'P').put(5, 16, 'P').put(25, 13, 'P').put(27, 15, 'P');
  b.vline(14, 11, 24, 'w').vline(15, 11, 24, 'w');
  b.hline(2, 27, 23, 'w').hline(2, 27, 24, 'w');
  b.rect(3, 19, 4, 3, 'U').rect(22, 19, 4, 3, 'U');
  b.row(22, 3, 'ww').row(22, 24, 'ww');
  b.put(7, 9, 'y').put(15, 8, 'y').put(23, 10, 'y');
  b.put(6, 8, 'm').put(9, 10, 'm').put(14, 9, 'm').put(17, 7, 'm').put(22, 9, 'm').put(24, 11, 'm');
  for (const [x, z] of [
    [10, 13],
    [11, 16],
    [18, 13],
    [19, 16],
    [8, 18],
    [20, 19],
    [11, 20],
    [17, 20],
  ] as Pt[])
    b.put(x, z, 'u');
  b.rect(0, 25, 30, 4, '_');
  for (let x = 1; x < 30; x += 4) b.put(x, 25, 'p');
  b.rect(0, 26, 4, 3, 'H').rect(26, 26, 4, 3, 'H');
  b.put(8, 28, 'L').put(21, 28, 'L');
  b.rect(0, 29, 30, 3, '=');
  b.hline(0, 29, 30, '-');
  b.rect(0, 32, 30, 2, '_');
  b.rect(13, 29, 4, 2, 'X');
  b.put(3, 16, 'v').put(26, 14, 'v');
  return b.done();
}

// ---------------- E · Beach bars and their gas bottles (blocks 5 and 10) ----------------
function chiringuitos(people: boolean) {
  const b = new MB(28, 28, ';');
  sea(b, 4);
  // bonfires, umbrellas and the crowd on the sand
  b.put(7, 6, 'y').put(19, 7, 'y');
  b.put(6, 7, 'm').put(8, 5, 'm').put(18, 6, 'm').put(20, 8, 'm').put(13, 6, 'm');
  for (const [x, z] of [
    [3, 8],
    [11, 8],
    [15, 9],
    [24, 7],
    [9, 16],
    [18, 16],
  ] as Pt[])
    b.put(x, z, 'u');
  // three beach bars on wooden decks, gas bottles out back (two each, or one each in the finale; the middle
  // bar's sit either side of the walkway)
  for (const x of [2, 12, 22]) {
    b.rect(x - 1, 10, 6, 5, 'w');
    b.rect(x, 11, 4, 3, 'U');
    const spots = x === 12 ? [x, x + 3] : [x + 1, x + 2];
    for (const gx of people ? spots.slice(0, 1) : spots) b.put(gx, 15, 'G');
  }
  // dunes with grass and pines between the bars and the promenade
  b.rect(0, 17, 11, 3, ',').rect(17, 17, 11, 3, ',');
  b.put(2, 18, 'P').put(7, 17, 'P').put(20, 18, 'P').put(25, 17, 'P');
  b.vline(13, 16, 20, 'w').vline(14, 16, 20, 'w');
  if (people) b.put(8, 16, 'v').put(24, 16, 'v').put(11, 20, 'd');
  seafront(b, 21);
  b.rect(12, 23, 4, 2, 'X');
  return b.done();
}

// ---------------- F · Fairground on the promenade (block 6) ----------------
function feria() {
  const b = new MB(30, 28, ';');
  sea(b, 4);
  b.put(8, 7, 'y').put(21, 6, 'y');
  for (const [x, z] of [
    [4, 8],
    [14, 7],
    [17, 9],
    [26, 8],
    [11, 10],
  ] as Pt[])
    b.put(x, z, 'u');
  b.rect(0, 12, 30, 2, 'w');
  // the fair on the promenade: a long row of stalls with the fuse box for the lights, and a second row
  b.rect(0, 14, 30, 7, '_');
  b.rect(1, 15, 6, 2, 'S').rect(7, 15, 3, 2, 'C').rect(11, 15, 6, 2, 'S').rect(18, 15, 9, 2, 'S');
  b.put(10, 15, 'E').put(10, 16, 'h');
  b.rect(4, 19, 3, 1, 'S').rect(10, 19, 3, 1, 'S').rect(17, 19, 3, 1, 'S').rect(23, 19, 3, 1, 'S');
  b.put(28, 18, 'Z');
  for (const [x, z] of [
    [5, 18],
    [9, 17],
    [16, 18],
    [20, 17],
    [26, 18],
    [1, 18],
  ] as Pt[])
    b.put(x, z, 'm');
  b.put(8, 20, 'L').put(21, 20, 'L');
  b.rect(0, 21, 30, 3, '=');
  b.hline(0, 29, 22, '-');
  b.rect(0, 24, 30, 4, '_');
  b.rect(0, 25, 3, 3, 'H').rect(27, 25, 3, 3, 'H');
  b.put(7, 25, 'L').put(22, 25, 'L').put(10, 26, 'n').put(19, 26, 'n');
  b.rect(13, 21, 4, 2, 'X');
  b.fire(10, 15).fire(9, 15, 1, 2).fire(10, 16);
  return b.done();
}

// ---------------- G · Pines behind the beach (block 7) ----------------
function pinar() {
  const b = new MB(30, 30, ';');
  sea(b, 4);
  b.put(9, 6, 'y').put(21, 7, 'y');
  b.put(8, 7, 'm').put(10, 5, 'm').put(20, 6, 'm').put(22, 8, 'm');
  // low dunes, then the pine wood on grass and needles, with sandy tracks
  b.rect(0, 10, 30, 3, ',');
  b.rect(0, 13, 30, 10, '.');
  for (const [x, z, r] of [
    [4, 15, 2.2],
    [12, 18, 2.4],
    [22, 15, 2.2],
    [26, 20, 2],
    [7, 21, 1.8],
    [17, 21, 2],
  ] as [number, number, number][])
    b.circle(x, z, r, 'l');
  b.path(
    [
      [14, 10],
      [14, 24],
    ],
    ';',
    1.6,
  );
  b.path(
    [
      [0, 17],
      [30, 17],
    ],
    ';',
    1.3,
  );
  b.scatter('P', 44, '.l,', 71, [0, 10, 30, 13], 2);
  // campers and their dog in the pines
  b.put(5, 18, 'v').put(24, 18, 'v').put(20, 13, 'd');
  b.put(15, 16, 'Y');
  seafront(b, 23);
  b.rect(12, 25, 4, 2, 'X');
  b.fire(3, 11, 2, 1);
  return b.done();
}

// ---------------- H · The fishing harbour (block 9) ----------------
function puerto() {
  const b = new MB(30, 30, '~');
  // stone quay, two wooden jetties and a small beach on the east where the party is
  b.rect(0, 7, 30, 12, '#');
  b.rect(4, 1, 2, 6, 'w').rect(13, 2, 2, 5, 'w');
  b.rect(21, 3, 9, 4, ';');
  b.put(23, 4, 'y').put(27, 5, 'y');
  // planked edge of the quay where the nets dry
  b.rect(0, 7, 21, 2, 'w');
  // fish market with the fuse box on its wall and crates stacked against it
  b.rect(2, 10, 8, 4, 'W');
  b.put(10, 11, 'E');
  b.rect(11, 10, 2, 3, 'k');
  b.row(15, 2, 'kk kk kk');
  b.row(16, 2, 'kk kk kk');
  // fishermen's huts on a wooden deck, each with its gas bottle
  b.rect(14, 10, 13, 4, 'w');
  b.rect(15, 10, 2, 2, 'V').rect(19, 10, 2, 2, 'V').rect(23, 10, 2, 2, 'V');
  b.put(17, 12, 'G').put(21, 12, 'G').put(25, 12, 'G');
  b.put(27, 16, 'Z');
  b.put(17, 16, 'Y');
  // grass verge, road and houses
  b.rect(0, 19, 30, 2, '.');
  b.put(3, 19, 'T').put(12, 20, 'T').put(22, 19, 'T').put(28, 20, 'T');
  b.rect(0, 21, 30, 3, '=');
  b.hline(0, 29, 22, '-');
  b.rect(0, 24, 30, 6, '_');
  b.rect(0, 26, 4, 3, 'H').rect(26, 26, 4, 3, 'H');
  b.put(8, 25, 'L').put(21, 25, 'L');
  b.rect(13, 21, 4, 2, 'X');
  b.fire(10, 11).fire(11, 10, 2, 3);
  return b.done();
}

export const SANJUAN: LevelDef[] = [
  L(
    {
      id: 'sanjuan-2',
      theme: 'sanjuan',
      name: { es: 'Hogueras en la cala', en: 'Bonfires in the cove' },
      tip: { es: 'Las hogueras se han desmadrado: apágalas todas y moja donde vayan a caer los cohetes.', en: 'The bonfires got out of hand. Put them all out and wet the spots where rockets will land.' },
      time: 140,
      hose: 18,
      wind: { angle: 90, strength: 0.2 },
      fireworks: { count: 4, first: 14, every: 16 },
      stars: [0.8, 0.88],
      minSaved: 0.71,
      night: true,
      under: ';',
    },
    cala(),
  ),
  L(
    {
      id: 'sanjuan-3',
      theme: 'sanjuan',
      name: { es: 'El paseo de tablas', en: 'The boardwalk' },
      tip: { es: 'El viento lleva el fuego por la pasarela. Córtale el paso antes de que llegue a los chiringuitos.', en: 'The wind drives the fire along the wooden boardwalk. Cut it off before it reaches the beach bars.' },
      time: 150,
      hose: 18,
      wind: { angle: 0, strength: 0.3 },
      fireworks: { count: 6, first: 12, every: 15 },
      stars: [0.77, 0.88],
      minSaved: 0.55,
      night: true,
      under: ';',
    },
    (() => {
      const m = paseo();
      return { map: m.map, fires: { 12: 'XX', 13: 'XX' } };
    })(),
  ),
  L(
    {
      id: 'sanjuan-4',
      theme: 'sanjuan',
      name: { es: 'El espigón', en: 'The pier' },
      tip: { es: 'El espigón es más largo que tu manguera. Engánchala en la boca de riego que hay a mitad.', en: 'The pier is longer than your hose. Hook up at the hydrant halfway along.' },
      time: 160,
      hose: 18,
      wind: { angle: 90, strength: 0.25 },
      fireworks: { count: 6, first: 14, every: 15 },
      stars: [0.82, 0.93],
      minSaved: 0.45,
      night: true,
      under: 'w',
    },
    espigon(),
  ),
  L(
    {
      id: 'sanjuan-5',
      theme: 'sanjuan',
      name: { es: 'Brisa de mar', en: 'Sea breeze' },
      tip: { es: 'La brisa empuja el fuego de las dunas tierra adentro. Saca a la gente y salva los chiringuitos.', en: 'The sea breeze pushes the dune fires inland. Get the people off the dunes and save the beach bars.' },
      time: 180,
      hose: 18,
      wind: { angle: 90, strength: 0.32 },
      windShifts: [{ t: 70, angle: 45, strength: 0.28 }],
      fireworks: { count: 8, first: 12, every: 14 },
      stars: [0.5, 0.72],
      minSaved: 0.35,
      night: true,
      under: ';',
    },
    (() => {
      const m = sanjuanBase();
      return { map: m.map, fires: { 13: '       X              X', 14: '      XX              XX' } };
    })(),
  ),
  L(
    {
      id: 'sanjuan-6',
      theme: 'sanjuan',
      name: { es: 'Los chiringuitos', en: 'Beach bars' },
      tip: { es: 'Detrás de cada chiringuito hay bombonas de gas. Enfríalas antes de que las alcance el fuego.', en: 'Each beach bar keeps gas bottles out back. Cool them down before the flames reach them.' },
      time: 170,
      hose: 18,
      wind: { angle: -90, strength: 0.18 },
      windShifts: [{ t: 60, angle: 0, strength: 0.22 }],
      fireworks: { count: 5, first: 14, every: 16 },
      stars: [0.73, 0.85],
      minSaved: 0.57,
      night: true,
      under: ';',
    },
    (() => {
      const m = chiringuitos(false);
      return { map: m.map, fires: { 18: ' XX                      XX' } };
    })(),
  ),
  L(
    {
      id: 'sanjuan-7',
      theme: 'sanjuan',
      name: { es: 'Verbena en el paseo', en: 'Fair on the seafront' },
      tip: { es: 'Arde el cuadro de las luces de la feria. Baja la palanca roja del final antes de mojarlo.', en: "The fair's fuse box is on fire. Pull the red lever at the far end before you spray it." },
      time: 170,
      hose: 18,
      wind: { angle: 0, strength: 0.42 },
      windShifts: [{ t: 65, angle: 180, strength: 0.45 }],
      fireworks: { count: 7, first: 16, every: 14 },
      stars: [0.76, 0.88],
      minSaved: 0.63,
      night: true,
      under: '_',
    },
    feria(),
  ),
  L(
    {
      id: 'sanjuan-8',
      theme: 'sanjuan',
      name: { es: 'El pinar de la playa', en: 'Beachside pines' },
      tip: { es: 'Caen cohetes sobre el pinar y el viento va a girar. Saca a los campistas y a su perro.', en: 'Rockets are falling on the pine wood and the wind will turn. Get the campers and their dog out.' },
      time: 180,
      hose: 18,
      wind: { angle: 0, strength: 0.3 },
      windShifts: [
        { t: 50, angle: 90, strength: 0.35 },
        { t: 110, angle: 200, strength: 0.35 },
      ],
      fireworks: { count: 7, first: 15, every: 15 },
      stars: [0.71, 0.91],
      minSaved: 0.65,
      night: true,
      under: ';',
    },
    pinar(),
  ),
  L(
    {
      id: 'sanjuan-9',
      theme: 'sanjuan',
      name: { es: 'La traca final', en: 'Grand finale' },
      tip: { es: 'La traca final: cae un cohete cada pocos segundos. Mantén la pasarela bien mojada.', en: 'The grand finale: a rocket every few seconds. Keep the boardwalk soaked.' },
      time: 150,
      hose: 18,
      wind: { angle: 180, strength: 0.45 },
      fireworks: { count: 16, first: 6, every: 5 },
      stars: [0.69, 0.79],
      minSaved: 0.57,
      night: true,
      under: ';',
    },
    (() => {
      const m = paseo();
      return { map: m.map, fires: { 12: '                          XX' } };
    })(),
  ),
  L(
    {
      id: 'sanjuan-10',
      theme: 'sanjuan',
      name: { es: 'El puerto pesquero', en: 'Fishing harbor' },
      tip: { es: 'Baja la palanca de la lonja antes de mojar su cuadro, y vigila las bombonas de las casetas.', en: "Pull the lever before you spray the fish market's fuse box, and watch the huts' gas bottles." },
      time: 180,
      hose: 18,
      wind: { angle: 180, strength: 0.35 },
      windShifts: [{ t: 70, angle: 0, strength: 0.4 }],
      fireworks: { count: 8, first: 15, every: 14 },
      stars: [0.85, 0.91],
      minSaved: 0.7,
      night: true,
      under: '#',
    },
    puerto(),
  ),
  L(
    {
      id: 'sanjuan-11',
      theme: 'sanjuan',
      name: { es: 'La noche más corta', en: 'The shortest night' },
      tip: { es: 'La noche más corta y la más larga de apagar: cohetes, bombonas, gente en las dunas y viento que gira.', en: 'The shortest night of the year: rockets, gas bottles, people on the dunes and a shifting wind.' },
      time: 190,
      hose: 18,
      wind: { angle: 90, strength: 0.35 },
      windShifts: [
        { t: 50, angle: 0, strength: 0.4 },
        { t: 100, angle: 180, strength: 0.4 },
        { t: 145, angle: 90, strength: 0.45 },
      ],
      fireworks: { count: 9, first: 12, every: 12 },
      stars: [0.62, 0.74],
      minSaved: 0.56,
      night: true,
      under: ';',
    },
    (() => {
      const m = chiringuitos(true);
      return { map: m.map, fires: { 10: '                     XX' } };
    })(),
  ),
];
