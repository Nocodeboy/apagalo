// The museum (theme 'museo'), star mechanic: the artworks ('$', paintings and sculptures on their rugs). Walk up to one
// to pick it up and carry it out through a green door ('>'): while carrying you are slower and cannot spray. Each one
// saved counts a lot, and one that burns loses the third star. Sprinkler levers ('Z'): pull one and its room is
// soaked for a while (level `sprinklers`): the fire stops spreading there, what already burns still has to be put
// out. Inside walls ('|') stop the water, so you go room by room. Night, after closing time. docs/diseno-v2.md §5.1.
// Index 0 is the scenario's intro; the route (../levels.ts) places every level. Ids never change once released.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

/** The street along the bottom: a sidewalk row at `z` and the road (3 rows) under it. */
function street(b: MB, z: number) {
  b.rect(0, z, b.W, 1, '#');
  b.rect(0, z + 1, b.W, 3, '=');
  b.hline(0, b.W - 1, z + 2, '-');
}
/** The museum: marble floor ('_') inside its outer wall ('|'), from (x, z), size w × h. */
function hall(b: MB, x: number, z: number, w: number, h: number) {
  b.rect(x, z, w, h, '_');
  b.outline(x, z, w, h, '|');
}
/** A doorway `n` cells long from (x, z) along x (or down z). Doors in the outer wall are exits ('>'). */
function door(b: MB, x: number, z: number, n: number, ch = '_', down = false) {
  for (let k = 0; k < n; k++) b.put(down ? x : x + k, down ? z + k : z, ch);
}
/** An artwork on its rug: the rug (3 × 3 carpet) catches, and then the artwork is in danger. */
function art(b: MB, x: number, z: number) {
  b.rect(x - 1, z - 1, 3, 3, '"');
  b.put(x, z, '$');
}

// ---------- 1 · The gallery (intro): the carpet is burning towards the paintings ----------
function galeria() {
  const b = new MB(22, 20, '#');
  hall(b, 1, 1, 20, 14);
  street(b, 16);
  door(b, 9, 14, 4, '>');
  // the gallery floor is old parquet ('w'), the carpet runner along the middle
  b.rect(2, 4, 18, 7, 'w');
  b.rect(3, 6, 16, 3, '"');
  b.put(5, 5, '$').put(10, 5, '$').put(15, 5, '$');
  b.put(7, 7, 'n').put(12, 7, 'n');
  b.rect(3, 11, 3, 2, 'S').rect(16, 11, 3, 2, 'S');
  b.put(3, 3, 'T').put(18, 3, 'T');
  b.put(19, 10, 'Z');
  b.fire(18, 8).fire(18, 7).fire(17, 11).fire(18, 11);
  b.rect(9, 17, 4, 2, 'X');
  return b.done();
}

// ---------- 2 · The sculpture hall: two rooms, a bench on fire among the sculptures, the gallery carpet too ----------
function esculturas() {
  const b = new MB(26, 24, '#');
  hall(b, 1, 1, 24, 18);
  b.vline(12, 1, 18, '|');
  door(b, 12, 8, 3, '_', true);
  street(b, 20);
  door(b, 5, 18, 4, '>');
  door(b, 24, 13, 2, '>', true);
  // parquet floors in both rooms, marble along the walls
  b.rect(3, 3, 8, 13, 'w').rect(14, 3, 9, 10, 'w');
  // west: sculptures on their rugs and the benches between them
  art(b, 4, 4);
  art(b, 9, 4);
  art(b, 4, 11);
  b.put(7, 7, 'n').put(9, 9, 'n').put(10, 7, 'n');
  b.rect(3, 15, 8, 1, '"');
  b.put(2, 16, 'Z');
  // east: the painting gallery with its carpet runner and the vitrines
  b.rect(14, 4, 9, 2, '"');
  b.rect(10, 9, 5, 1, '"');
  b.put(16, 3, '$').put(21, 3, '$');
  art(b, 21, 14);
  b.rect(15, 9, 3, 2, 'S').rect(19, 9, 3, 2, 'S');
  b.put(23, 7, 'Z');
  b.put(13, 16, 'Y');
  // (the carpet fire starts at the far end of the runner from the paintings)
  b.fire(14, 5).fire(14, 4).fire(10, 7);
  b.rect(5, 21, 4, 2, 'X');
  return b.done();
}

// ---------- 3 · The museum shop: the stockroom is burning, next to the shop and under the gallery ----------
function tienda() {
  const b = new MB(26, 24, '#');
  hall(b, 1, 1, 24, 18);
  b.hline(1, 24, 9, '|');
  door(b, 11, 9, 3);
  b.vline(19, 9, 18, '|');
  door(b, 19, 12, 2, '_', true);
  street(b, 20);
  door(b, 6, 18, 4, '>');
  door(b, 24, 4, 2, '>', true);
  // north: the gallery
  art(b, 4, 4);
  art(b, 10, 4);
  art(b, 16, 4);
  b.rect(3, 7, 18, 1, '"');
  b.put(2, 2, 'Z');
  // south: the shop (parquet floor, shelves, the café counter) and the stockroom full of boxes
  b.rect(2, 10, 17, 8, 'w');
  b.rect(3, 11, 2, 4, 'S').rect(7, 11, 2, 4, 'S').rect(11, 12, 5, 1, 'S');
  b.rect(13, 15, 4, 2, 'C');
  b.rect(20, 10, 4, 7, 'k');
  b.rect(21, 11, 2, 5, 'w');
  b.put(20, 12, 'w').put(20, 13, 'w');
  door(b, 19, 12, 2, 'w', true);
  // the stockroom also opens onto the gallery: the fire can climb through there
  door(b, 21, 9, 2, 'w');
  b.put(21, 10, 'w').put(22, 10, 'w');
  b.rect(20, 7, 4, 2, '"');
  b.put(2, 11, 'Z');
  b.put(17, 11, 'Y');
  b.fire(22, 16).fire(23, 16).fire(23, 11);
  b.put(4, 16, 'v');
  b.rect(6, 21, 4, 2, 'X');
  return b.done();
}

// ---------- 4 · The library: rows of bookshelves, the rare manuscripts on their lecterns ----------
function biblioteca() {
  const b = new MB(28, 26, '#');
  hall(b, 1, 1, 26, 20);
  street(b, 22);
  door(b, 12, 20, 4, '>');
  door(b, 1, 9, 2, '>', true);
  for (const z of [4, 6, 8, 10, 12]) b.hline(3, 10, z, '"');
  for (const z of [3, 5, 7, 9, 11, 13]) b.hline(3, 10, z, 'h').hline(17, 24, z, 'h');
  // the manuscripts at the end of the stacks and in the reading room
  b.put(11, 6, '$').put(16, 10, '$').put(11, 12, '$');
  b.rect(4, 16, 20, 2, '"');
  art(b, 7, 17);
  art(b, 21, 17);
  b.put(10, 16, 'n').put(13, 17, 'n').put(17, 16, 'n');
  b.put(13, 2, 'Z').put(14, 2, 'Z');
  b.put(12, 18, 'Y');
  b.fire(3, 5).fire(4, 5).fire(24, 9);
  b.put(25, 3, 'v');
  b.rect(12, 23, 4, 2, 'X');
  return b.done();
}

// ---------- 5 · BIG FIRE: night at the museum, three wings burning and eight works of art ----------
function nocheMuseo() {
  const b = new MB(34, 32, '#');
  hall(b, 1, 1, 32, 26);
  b.vline(11, 1, 26, '|').vline(22, 1, 26, '|');
  door(b, 11, 12, 3, '_', true);
  door(b, 11, 20, 2, '_', true);
  door(b, 22, 12, 3, '_', true);
  door(b, 22, 20, 2, '_', true);
  street(b, 28);
  door(b, 15, 26, 4, '>');
  door(b, 1, 22, 2, '>', true);
  door(b, 32, 5, 2, '>', true);
  // west wing: parquet in the painting rooms, a long carpet down the middle
  b.rect(2, 2, 9, 11, 'w').rect(2, 16, 9, 8, 'w');
  b.rect(5, 2, 2, 24, '"');
  b.put(3, 4, '$').put(8, 4, '$').put(3, 11, '$').put(8, 19, '$');
  b.put(3, 24, 'k').put(4, 24, 'k');
  // centre: the grand hall (parquet) with the dinosaur, the benches and the carpet from the main door
  b.rect(12, 2, 10, 13, 'w');
  b.rect(14, 5, 6, 4, 'F');
  b.rect(12, 16, 10, 3, '"');
  b.rect(13, 11, 8, 1, '"');
  b.put(13, 13, 'n').put(20, 13, 'n');
  art(b, 17, 3);
  // east wing: parquet, sculptures and vitrines
  b.rect(23, 2, 9, 22, 'w');
  art(b, 25, 4);
  art(b, 29, 10);
  art(b, 26, 20);
  b.rect(24, 14, 3, 2, 'S').rect(28, 16, 3, 2, 'S');
  b.put(10, 25, 'Z').put(21, 2, 'Z').put(23, 25, 'Z');
  b.put(12, 24, 'Y').put(21, 24, 'Y');
  b.rect(23, 12, 9, 1, '"');
  b.fire(9, 12).fire(4, 24).fire(20, 11).fire(30, 17).fire(29, 16);
  b.put(6, 20, 'v').put(27, 12, 'v');
  b.rect(15, 29, 4, 2, 'X');
  return b.done();
}

// ---------- 6 · The storeroom: aisles of crates, works of art waiting in storage ----------
function almacen() {
  const b = new MB(28, 26, '#');
  hall(b, 1, 1, 26, 20);
  street(b, 22);
  door(b, 11, 20, 4, '>');
  door(b, 26, 16, 2, '>', true);
  for (const x of [4, 8, 12, 16, 20]) {
    b.vline(x, 3, 7, 'k').vline(x, 10, 14, 'k');
    b.vline(x + 1, 3, 7, 'k').vline(x + 1, 10, 14, 'k');
  }
  b.put(6, 3, '$').put(10, 14, '$').put(14, 3, '$').put(18, 14, '$').put(23, 8, '$');
  b.rect(22, 16, 2, 1, 'A');
  b.rect(3, 17, 6, 2, 'k');
  b.put(25, 3, 'Z');
  b.put(13, 17, 'Y');
  b.fire(4, 5).fire(21, 12).fire(3, 17);
  b.put(2, 9, 'v');
  b.rect(11, 23, 4, 2, 'X');
  return b.done();
}

// ---------- 7 · Natural history: the dinosaur hall between two galleries ----------
function historiaNatural() {
  const b = new MB(30, 28, '#');
  hall(b, 1, 1, 28, 22);
  b.vline(8, 1, 22, '|').vline(21, 1, 22, '|');
  door(b, 8, 10, 3, '_', true);
  door(b, 21, 10, 3, '_', true);
  door(b, 8, 18, 2, '_', true);
  street(b, 24);
  door(b, 13, 22, 4, '>');
  door(b, 28, 4, 2, '>', true);
  // centre: the dinosaur skeleton on its plinth, a carpet around it, benches
  b.rect(11, 4, 8, 5, 'F');
  b.rect(10, 10, 10, 1, '"').rect(10, 17, 10, 2, '"');
  b.put(11, 13, 'n').put(18, 13, 'n');
  art(b, 14, 19);
  // carpets along the galleries
  b.rect(3, 7, 4, 11, '"').rect(23, 10, 4, 10, '"');
  // west: the paintings of the explorers, potted palms
  art(b, 4, 4);
  art(b, 4, 12);
  b.put(6, 8, 'T').put(3, 17, 'T').put(6, 20, 'T');
  // east: minerals in vitrines and the golden mask
  b.rect(23, 14, 4, 2, 'S').rect(23, 18, 4, 2, 'S');
  art(b, 25, 8);
  b.put(2, 21, 'Z').put(15, 2, 'Z').put(27, 21, 'Z');
  b.put(10, 20, 'Y');
  b.fire(3, 17).fire(26, 19).fire(19, 17);
  b.put(16, 14, 'v').put(24, 4, 'v');
  b.rect(13, 25, 4, 2, 'X');
  return b.done();
}

// ---------- 8 · The gala: a party in the great hall, guests to get out and the art around the walls ----------
function gala() {
  const b = new MB(30, 28, '#');
  hall(b, 1, 1, 28, 22);
  street(b, 24);
  door(b, 13, 22, 4, '>');
  door(b, 1, 11, 2, '>', true);
  door(b, 28, 11, 2, '>', true);
  // the stage with its wooden floor, the long carpet, the tables and the bar
  b.rect(9, 2, 12, 3, 'w');
  b.rect(4, 8, 22, 3, '"');
  b.rect(4, 12, 22, 7, 'w');
  for (const x of [5, 9, 13, 17, 21, 25]) b.put(x, 14, 'n').put(x, 17, 'n');
  b.rect(3, 13, 1, 6, 'C');
  b.rect(26, 13, 1, 6, 'C');
  art(b, 4, 4);
  art(b, 25, 4);
  art(b, 4, 20);
  art(b, 25, 20);
  b.put(15, 19, '$');
  b.put(2, 2, 'Z').put(27, 2, 'Z');
  b.put(8, 20, 'Y').put(21, 20, 'Y');
  b.fire(10, 2).fire(11, 2).fire(26, 16).fire(3, 14);
  b.put(12, 12, 'v').put(18, 16, 'v').put(7, 18, 'v');
  b.put(10, 16, 'm').put(20, 12, 'm').put(16, 7, 'm');
  b.rect(13, 25, 4, 2, 'X');
  return b.done();
}

const INDOOR = { angle: 90, strength: 0.12 };

export const MUSEO: LevelDef[] = [
  L(
    {
      id: 'museo-1',
      theme: 'museo',
      name: { es: 'La galería', en: 'The gallery' },
      tip: {
        es: 'Acércate a un cuadro para cogerlo y sácalo por la puerta verde (cargado no puedes echar agua). La palanca roja enciende los rociadores de la sala.',
        en: 'Walk up to a painting to pick it up and carry it out of the green door (no spraying while you carry). The red lever turns the room sprinklers on.',
      },
      time: 130,
      hose: 15,
      wind: { angle: 180, strength: 0.12 },
      stars: [0.93, 0.96],
      minSaved: 0.6,
      under: '_',
      sprinklers: [{ lever: [19, 10], area: [2, 2, 18, 12] }],
    },
    galeria(),
  ),
  L(
    {
      id: 'museo-2',
      theme: 'museo',
      name: { es: 'La sala de esculturas', en: 'The sculpture hall' },
      tip: { es: 'Arden un banco entre las esculturas y la alfombra de la galería. Cada sala tiene su palanca de rociadores.', en: 'A bench among the sculptures and the gallery carpet are burning. Each room has its own sprinkler lever.' },
      time: 150,
      hose: 16,
      wind: INDOOR,
      stars: [0.93, 0.96],
      minSaved: 0.55,
      under: '_',
      sprinklers: [
        { lever: [2, 16], area: [2, 2, 10, 16] },
        { lever: [23, 7], area: [13, 2, 11, 16] },
      ],
    },
    esculturas(),
  ),
  L(
    {
      id: 'museo-3',
      theme: 'museo',
      name: { es: 'La tienda del museo', en: 'The museum shop' },
      tip: { es: 'El almacén de la tienda está en llamas y la galería está justo encima. Saca las obras antes de que llegue el fuego.', en: 'The shop stockroom is on fire, right under the gallery. Get the art out before the fire gets there.' },
      time: 150,
      hose: 16,
      wind: { angle: -90, strength: 0.12 },
      stars: [0.92, 0.95],
      minSaved: 0.8,
      under: '_',
      sprinklers: [
        { lever: [2, 11], area: [2, 10, 17, 8] },
        { lever: [2, 2], area: [2, 2, 22, 7] },
      ],
    },
    tienda(),
  ),
  L(
    {
      id: 'museo-4',
      theme: 'museo',
      name: { es: 'La biblioteca', en: 'The library' },
      tip: { es: 'Los libros arden como la paja. Los manuscritos valen una fortuna: sácalos primero y enciende los rociadores de las estanterías.', en: 'Books burn like straw. The manuscripts are priceless: get them out first and turn on the stack sprinklers.' },
      time: 160,
      hose: 16,
      wind: { angle: 0, strength: 0.14 },
      stars: [0.62, 0.65],
      minSaved: 0.56,
      under: '_',
      sprinklers: [
        { lever: [13, 2], area: [2, 2, 10, 13] },
        { lever: [14, 2], area: [16, 2, 10, 13] },
      ],
    },
    biblioteca(),
  ),
  L(
    {
      id: 'museo-5',
      theme: 'museo',
      name: { es: 'Noche en el museo', en: 'Night at the museum' },
      tip: {
        es: 'Arden las tres alas y hay ocho obras de arte. Sal por la puerta más cercana, usa los armarios de manguera y los rociadores de cada ala.',
        en: 'All three wings are burning and there are eight works of art. Use the nearest door, the hose cabinets and each wing’s sprinklers.',
      },
      headline: { es: 'NOCHE EN EL MUSEO: EL BOMBERO QUE SALVÓ LAS OBRAS MAESTRAS', en: 'NIGHT AT THE MUSEUM: FIREFIGHTER SAVES THE MASTERPIECES' },
      time: 220,
      hose: 16,
      wind: INDOOR,
      stars: [0.71, 0.74],
      minSaved: 0.58,
      under: '_',
      sprinklers: [
        { lever: [10, 25], area: [2, 2, 9, 24] },
        { lever: [21, 2], area: [12, 2, 10, 24] },
        { lever: [23, 25], area: [23, 2, 9, 24] },
      ],
    },
    nocheMuseo(),
  ),
  L(
    {
      id: 'museo-6',
      theme: 'museo',
      name: { es: 'El almacén', en: 'The storeroom' },
      tip: { es: 'Pasillos de cajas que arden deprisa y obras de arte esperando en el almacén. La palanca de rociadores está al fondo.', en: 'Aisles of crates that burn fast and works of art waiting in storage. The sprinkler lever is at the far end.' },
      time: 160,
      hose: 16,
      wind: { angle: 0, strength: 0.15 },
      stars: [0.65, 0.69],
      minSaved: 0.55,
      under: '_',
      sprinklers: [{ lever: [25, 3], area: [2, 2, 24, 14] }],
    },
    almacen(),
  ),
  L(
    {
      id: 'museo-7',
      theme: 'museo',
      name: { es: 'Historia natural', en: 'Natural history' },
      tip: { es: 'La sala del dinosaurio y sus dos galerías. Las plantas y las vitrinas arden; el dinosaurio no.', en: 'The dinosaur hall and its two galleries. The plants and the vitrines burn; the dinosaur does not.' },
      time: 170,
      hose: 16,
      wind: INDOOR,
      stars: [0.78, 0.81],
      minSaved: 0.68,
      under: '_',
      sprinklers: [
        { lever: [2, 21], area: [2, 2, 6, 20] },
        { lever: [15, 2], area: [9, 2, 12, 20] },
        { lever: [27, 21], area: [22, 2, 6, 20] },
      ],
    },
    historiaNatural(),
  ),
  L(
    {
      id: 'museo-8',
      theme: 'museo',
      name: { es: 'La gala', en: 'The gala' },
      tip: { es: 'Fiesta de gala en el gran salón: saca a los invitados, salva las obras de las paredes y que no prenda la alfombra.', en: 'A gala night in the great hall: get the guests out, save the art on the walls and keep the carpet from catching.' },
      time: 180,
      hose: 16,
      wind: { angle: 180, strength: 0.14 },
      stars: [0.72, 0.75],
      minSaved: 0.49,
      under: '_',
      // guests wander towards the fire, then the power goes out: always, wherever the level is in the route
      fixedEvents: [
        { kind: 'onlookers', t: 45 },
        { kind: 'blackout', t: 100 },
      ],
      sprinklers: [
        { lever: [2, 2], area: [2, 2, 13, 20] },
        { lever: [27, 2], area: [15, 2, 13, 20] },
      ],
    },
    gala(),
  ),
];
