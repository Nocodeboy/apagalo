// The docks (theme 'puerto'), star mechanic: burning fuel on the sea drifts with the wind towards the boats and the
// wooden piers ('O' cells). Water makes it flare: only foam puts it out, and foam stops it drifting. The sea pump
// ('q') is an anchor like a hydrant: while the hose is hooked to it the foam refills. docs/diseno-v2.md §5.1.
// Index 0 is the scenario's intro; the route (../levels.ts) places every level. Ids never change once released.
import { L } from '../leveldef';
import { MB } from '../mapbuilder';
import type { LevelDef } from '../types';

/** Sea on the top `depth` rows, concrete quay below, bollards along the edge. */
function docks(W: number, H: number, depth: number) {
  const b = new MB(W, H, '#');
  b.rect(0, 0, W, depth, '~');
  for (let x = 2; x < W; x += 5) b.put(x, depth, 'i');
  return b;
}
/** Road with the lane line, `z` is its top row (3 rows). */
function road(b: MB, z: number) {
  b.rect(0, z, b.W, 3, '=');
  b.hline(0, b.W - 1, z + 1, '-');
}

// ---------- 1 · The quay (intro): a patch of burning fuel drifts onto a fishing boat by the pier ----------
function muelle() {
  const b = docks(24, 20, 8);
  b.rect(10, 1, 3, 7, 'w'); // the pier
  b.rect(6, 3, 3, 4, 'D').rect(14, 2, 3, 4, 'D'); // boats moored on both sides
  b.rect(4, 0, 4, 2, 'O').rect(17, 0, 3, 1, 'O');
  b.fire(4, 0, 4, 2).fire(18, 0).fire(4, 10);
  b.put(9, 8, 'q'); // sea pump at the root of the pier
  b.rect(4, 9, 16, 1, 'w'); // boardwalk along the quay
  b.put(4, 10, 'k').put(5, 10, 'k').put(4, 11, 'k');
  b.rect(15, 10, 5, 3, 'H');
  b.put(8, 11, 'n').put(13, 11, 'n');
  road(b, 14);
  b.rect(10, 14, 4, 2, 'X');
  b.rect(0, 17, 24, 3, '_');
  b.rect(0, 17, 4, 3, 'H').rect(5, 17, 4, 3, 'H').rect(15, 17, 4, 3, 'H').rect(20, 17, 4, 3, 'H');
  b.put(12, 18, 'T');
  return b.done();
}

// ---------- 2 · BIG FIRE: fire at the docks, a burning trawler leaks fuel among the fleet ----------
function fuegoPuerto() {
  const b = docks(32, 30, 11);
  // two piers with the fishing fleet
  b.rect(7, 2, 3, 9, 'w').rect(21, 1, 3, 10, 'w');
  b.rect(4, 3, 3, 5, 'D').rect(10, 5, 2, 4, 'D').rect(18, 3, 3, 5, 'D').rect(24, 4, 3, 5, 'D');
  // the burning trawler and its fuel, and more fuel coming in from the west
  b.rect(13, 1, 4, 3, 'D');
  b.rect(12, 4, 6, 2, 'O').rect(14, 6, 3, 2, 'O').rect(0, 1, 3, 3, 'O');
  b.fire(14, 1, 2, 1).fire(13, 4, 2, 1).fire(1, 2).fire(22, 2);
  b.put(10, 11, 'q').put(25, 11, 'q');
  // quay: a boardwalk, the fish market, nets drying, crates, gas bottles for the boats, containers
  b.rect(2, 12, 28, 1, 'w');
  b.rect(2, 14, 7, 4, 'H');
  b.fire(12, 14);
  b.put(11, 14, 'b').put(12, 14, 'b').put(14, 14, 'b');
  b.row(15, 11, 'kk kk').row(16, 11, 'k   k');
  b.put(17, 14, 'G').put(18, 14, 'G');
  b.rect(21, 14, 9, 2, 'N').rect(21, 17, 6, 2, 'N');
  b.put(15, 18, 'Y');
  b.rect(2, 19, 4, 2, 'S').rect(7, 19, 4, 2, 'S');
  road(b, 22);
  b.rect(14, 22, 4, 2, 'X');
  b.rect(0, 25, 32, 5, '_');
  for (const x of [0, 5, 10, 18, 23, 28]) b.rect(x, 26, 4, 4, 'H');
  b.put(15, 27, 'T').put(16, 27, 'T');
  b.put(12, 17, 'm').put(28, 20, 'v');
  return b.done();
}

// ---------- 3 · The fish market: the market hall on the quay, and fuel from a leaking boat ----------
function lonja() {
  const b = docks(26, 24, 7);
  b.rect(3, 1, 3, 6, 'w').rect(18, 2, 3, 5, 'w');
  b.rect(7, 2, 2, 4, 'D').rect(14, 1, 3, 2, 'D').rect(22, 2, 2, 4, 'D');
  b.rect(9, 0, 5, 2, 'O');
  b.fire(10, 1, 2, 1).fire(15, 1);
  b.put(9, 7, 'q');
  b.rect(1, 8, 24, 1, 'w');
  // the market hall with its stalls
  b.rect(4, 9, 12, 5, 'H');
  b.rect(17, 9, 3, 2, 'S').rect(17, 12, 3, 2, 'S').rect(21, 9, 3, 2, 'S');
  b.fire(4, 9).fire(21, 12);
  b.put(2, 15, 'k').put(3, 15, 'k').put(22, 14, 'k').put(23, 14, 'k').put(21, 12, 'b').put(23, 12, 'b');
  b.put(8, 15, 'm').put(14, 16, 'm');
  b.put(20, 15, 'Y');
  road(b, 17);
  b.rect(11, 17, 4, 2, 'X');
  b.rect(0, 20, 26, 4, '_');
  b.rect(0, 21, 4, 3, 'H').rect(6, 21, 4, 3, 'H').rect(16, 21, 4, 3, 'H').rect(22, 21, 4, 3, 'H');
  b.put(12, 21, 'T');
  return b.done();
}

// ---------- 4 · Container stacks: narrow lanes full of pallets between the boxes, a crane over the quay ----------
function contenedores() {
  const b = docks(28, 26, 5);
  b.rect(9, 1, 3, 4, 'D').rect(20, 0, 3, 2, 'D');
  b.rect(12, 0, 5, 2, 'O');
  b.fire(13, 1, 2, 1).fire(20, 1);
  b.put(14, 5, 'q');
  b.rect(3, 6, 2, 3, 'x').rect(23, 6, 2, 3, 'x');
  // the stacks, three rows of blocks; pallets and dunnage in the lanes
  for (const z of [9, 13, 17]) {
    b.rect(1, z, 6, 2, 'N').rect(9, z, 6, 2, 'N').rect(17, z, 9, 2, 'N');
    b.put(7, z, 'k').put(15, z + 1, 'k').put(16, z, 'k');
  }
  b.row(12, 2, 'kk   kk     kk');
  b.row(16, 10, 'kk  kkk');
  b.fire(10, 13).fire(17, 17).fire(3, 12);
  b.put(8, 11, 'Y').put(16, 15, 'Y');
  b.put(4, 16, 'v');
  road(b, 20);
  b.rect(2, 20, 4, 2, 'X');
  b.rect(0, 23, 28, 3, '.');
  b.scatter('T', 7, '.', 41, [0, 23, 28, 3], 3);
  return b.done();
}

// ---------- 5 · The boatyard: boats up on land among wooden slipways, fuel drifting in ----------
function varadero() {
  const b = docks(28, 26, 8);
  // slipways run from the sea up the beach
  b.rect(0, 8, 28, 5, ';');
  b.rect(4, 5, 3, 9, 'w').rect(13, 4, 3, 10, 'w').rect(22, 5, 3, 9, 'w');
  // boats on the slipways and on the sand
  b.rect(4, 9, 3, 2, 'D').rect(13, 10, 3, 2, 'D').rect(9, 9, 2, 3, 'D').rect(18, 9, 2, 3, 'D').rect(22, 11, 3, 2, 'D');
  b.rect(5, 1, 8, 2, 'O').rect(17, 1, 5, 3, 'O');
  b.fire(7, 2, 3, 1).fire(18, 2, 2, 1).fire(9, 9);
  b.put(17, 7, 'q');
  // the yard: sheds, timber, the boatwright's hut
  b.rect(2, 14, 6, 3, 'W');
  b.row(15, 10, 'kkk').row(16, 10, 'k k').row(14, 9, 'bb');
  b.rect(19, 14, 5, 3, 'H');
  b.put(15, 16, 'Y');
  b.put(26, 14, 'c');
  road(b, 18);
  b.rect(12, 18, 4, 2, 'X');
  b.rect(0, 21, 28, 5, '.');
  b.scatter('T', 9, '.', 5, [0, 21, 28, 5], 3);
  return b.done();
}

// ---------- 6 · BIG FIRE: the fuel terminal, tanks and pipes on the quay and a slick on the move ----------
function terminal() {
  const b = docks(32, 32, 9);
  b.rect(12, 1, 4, 8, 'w');
  b.rect(8, 2, 3, 6, 'D').rect(17, 2, 3, 6, 'D'); // two tankers at the jetty
  b.rect(1, 1, 6, 3, 'O').rect(21, 4, 7, 2, 'O').rect(9, 0, 2, 2, 'O').rect(26, 0, 4, 2, 'O');
  b.fire(2, 2, 2, 1).fire(23, 4, 2, 1).fire(27, 0).fire(9, 2);
  b.put(11, 9, 'q').put(21, 9, 'q');
  b.rect(1, 10, 30, 1, 'w');
  // tank farm: gas bottles (small tanks) with fuel on the ground
  b.rect(2, 11, 10, 6, '#');
  b.row(12, 3, 'oGo oGo').row(14, 3, 'oo%oooo').row(15, 3, 'oGo oGo');
  b.fire(5, 14);
  b.rect(14, 11, 6, 4, 'W').rect(22, 11, 8, 2, 'N').rect(22, 14, 8, 2, 'N');
  b.fire(27, 14).fire(15, 11);
  b.put(13, 18, 'Y').put(27, 19, 'Y');
  b.row(19, 2, 'kkkk').row(20, 2, 'k  k');
  b.rect(17, 18, 3, 2, 'A').rect(21, 18, 3, 2, 'A');
  b.put(9, 20, 'v').put(30, 17, 'd');
  road(b, 23);
  b.rect(14, 23, 4, 2, 'X');
  b.rect(0, 26, 32, 6, '_');
  for (const x of [1, 7, 20, 26]) b.rect(x, 27, 5, 4, 'H');
  b.put(14, 28, 'T').put(17, 28, 'T');
  return b.done();
}

// ---------- 7 · The lighthouse: a long breakwater out to the light, the wind turns the fuel around ----------
function faro() {
  const b = new MB(26, 30, '~');
  b.rect(0, 20, 26, 10, '#');
  for (let x = 1; x < 26; x += 5) b.put(x, 20, 'i');
  // the breakwater (stone) with the lighthouse and the keeper's hut at its end, a wooden walkway along it
  b.rect(10, 3, 4, 17, '_');
  b.rect(9, 1, 6, 4, '_');
  b.rect(10, 1, 3, 3, 'I');
  b.rect(13, 2, 2, 2, 'V');
  b.rect(10, 4, 1, 16, 'w');
  b.rect(14, 9, 6, 2, 'w'); // landing stage
  b.rect(16, 11, 3, 2, 'D').rect(6, 8, 3, 4, 'D').rect(4, 15, 3, 2, 'D').rect(17, 14, 3, 2, 'D').rect(15, 5, 3, 2, 'D');
  b.rect(1, 8, 4, 3, 'O').rect(20, 3, 5, 3, 'O').rect(21, 12, 4, 3, 'O').rect(0, 14, 3, 2, 'O');
  b.fire(2, 9, 2, 1).fire(22, 4).fire(13, 3).fire(0, 14);
  b.put(14, 19, 'q').put(14, 9, 'Y');
  b.put(12, 7, 'v');
  b.rect(2, 22, 6, 3, 'H').rect(18, 22, 6, 3, 'H');
  b.row(21, 9, 'kk bb');
  b.rect(0, 25, 26, 3, '=');
  b.hline(0, 25, 26, '-');
  b.rect(10, 25, 4, 2, 'X');
  b.rect(0, 28, 26, 2, '_');
  return b.done();
}

// ---------- 8 · The ferry: a big ship at the ramp, cars waiting on the quay ----------
function ferry() {
  const b = docks(30, 28, 10);
  b.rect(8, 2, 14, 6, 'D'); // the ferry
  b.rect(13, 8, 4, 2, 'w'); // ramp
  b.rect(1, 3, 5, 3, 'O').rect(24, 6, 4, 2, 'O');
  b.fire(2, 4, 2, 1).fire(25, 6, 2, 1).fire(8, 3);
  b.put(7, 10, 'q').put(23, 10, 'q');
  // cars queueing for the ferry
  for (const z of [12, 15]) for (const x of [2, 6, 10, 18, 22, 26]) b.rect(x, z, 2, 1, 'A');
  b.fire(10, 12, 2, 1);
  b.rect(2, 18, 6, 3, 'K'); // ticket office
  b.rect(20, 18, 8, 3, 'W');
  b.put(14, 18, 'Y');
  b.put(9, 19, 'm').put(16, 13, 'm');
  road(b, 22);
  b.rect(13, 22, 4, 2, 'X');
  b.rect(0, 25, 30, 3, '.');
  b.scatter('T', 8, '.', 17, [0, 25, 30, 3], 3);
  return b.done();
}

// ---------- 9 · Nets and ropes: the fishermen's quarter, dry nets and wooden sheds ----------
function redes() {
  const b = docks(28, 26, 7);
  b.rect(5, 1, 3, 6, 'w').rect(19, 2, 3, 5, 'w');
  b.rect(2, 2, 2, 4, 'D').rect(9, 2, 2, 4, 'D').rect(16, 3, 2, 4, 'D').rect(23, 2, 2, 4, 'D');
  b.rect(10, 0, 6, 2, 'O').rect(25, 0, 3, 2, 'O');
  b.fire(12, 1, 2, 1).fire(26, 1).fire(9, 2);
  b.put(12, 7, 'q');
  b.rect(0, 8, 28, 1, 'w');
  // drying nets (dry straw-like heaps) and the fishermen's sheds
  for (const x of [2, 3, 5, 8, 9, 18, 21, 22, 24]) b.put(x, 9, 'b');
  b.rect(1, 11, 4, 3, 'H').rect(6, 11, 4, 3, 'H').rect(17, 11, 4, 3, 'H').rect(22, 11, 4, 3, 'H');
  b.rect(11, 10, 5, 2, 'w');
  b.put(12, 12, 'G').put(14, 12, 'G');
  b.fire(21, 9).fire(2, 9);
  b.put(13, 15, 'Y');
  b.put(4, 15, 'e').put(24, 16, 'c');
  road(b, 17);
  b.rect(12, 17, 4, 2, 'X');
  b.rect(0, 20, 28, 6, '_');
  for (const x of [0, 5, 18, 23]) b.rect(x, 21, 5, 4, 'H');
  b.put(11, 22, 'T').put(15, 22, 'T');
  return b.done();
}

// ---------- 10 · Night on the docks: everything at once under the cranes ----------
function nocheMuelles() {
  const b = docks(32, 30, 9);
  b.rect(6, 1, 3, 8, 'w').rect(22, 2, 3, 7, 'w');
  b.rect(3, 2, 2, 5, 'D').rect(10, 3, 2, 5, 'D').rect(19, 2, 2, 5, 'D').rect(26, 3, 2, 5, 'D');
  b.rect(12, 0, 6, 2, 'O').rect(28, 0, 3, 2, 'O').rect(0, 0, 2, 2, 'O');
  b.fire(14, 1, 2, 1).fire(29, 1).fire(0, 1).fire(10, 3);
  b.put(9, 9, 'q').put(21, 9, 'q');
  b.rect(0, 10, 32, 1, 'w');
  b.rect(13, 11, 2, 3, 'x').rect(27, 11, 2, 3, 'x');
  b.rect(1, 12, 10, 2, 'N').rect(1, 15, 10, 2, 'N');
  b.rect(17, 12, 8, 4, 'W');
  b.put(12, 16, 'G').put(15, 16, 'G').put(12, 17, 'G');
  b.fire(1, 15).fire(17, 12).fire(4, 18);
  b.put(14, 19, 'Y').put(29, 17, 'Y');
  b.row(18, 3, 'kkk kkk').row(14, 26, 'bb');
  b.put(26, 19, 'v').put(6, 20, 'd');
  // a skip of rubbish burning right by the truck: nothing of value, but it catches the eye
  b.row(20, 16, 'kkk').row(21, 16, 'k k');
  b.fire(17, 20);
  road(b, 22);
  b.rect(14, 22, 4, 2, 'X');
  b.rect(0, 25, 32, 5, '_');
  for (const x of [0, 6, 20, 26]) b.rect(x, 26, 5, 4, 'H');
  b.put(12, 27, 'L').put(19, 27, 'L');
  return b.done();
}

export const PUERTO: LevelDef[] = [
  L(
    {
      id: 'puerto-1',
      theme: 'puerto',
      name: { es: 'El muelle', en: 'The quay' },
      tip: {
        es: 'El gasóleo arde sobre el agua y el viento lo arrastra hacia los barcos. El agua lo aviva: usa la ESPUMA. Engánchate a la bomba del muelle para rellenarla.',
        en: 'Burning fuel floats and the wind pushes it at the boats. Water makes it flare: use FOAM. Hook up to the sea pump to refill it.',
      },
      time: 130,
      hose: 16,
      foam: 7,
      wind: { angle: 30, strength: 0.22 },
      stars: [0.93, 0.97],
      minSaved: 0.6,
    },
    muelle(),
  ),
  L(
    {
      id: 'puerto-2',
      theme: 'puerto',
      big: true,
      name: { es: '¡Fuego en el puerto!', en: 'Fire at the docks!' },
      tip: {
        es: 'Arde un pesquero y su gasóleo va hacia la flota. Espuma para el mar, agua para el muelle, y ojo con las bombonas.',
        en: 'A trawler is burning and its fuel is drifting at the fleet. Foam for the sea, water for the quay, and mind the gas bottles.',
      },
      headline: { es: 'FUEGO EN EL PUERTO: UN BOMBERO SALVA LA FLOTA PESQUERA', en: 'FIRE AT THE DOCKS: FIREFIGHTER SAVES THE FISHING FLEET' },
      time: 190,
      hose: 17,
      foam: 10,
      wind: { angle: 70, strength: 0.28 },
      stars: [0.76, 0.79],
      minSaved: 0.7,
    },
    fuegoPuerto(),
  ),
  L(
    {
      id: 'puerto-3',
      theme: 'puerto',
      name: { es: 'La lonja', en: 'The fish market' },
      tip: { es: 'Arde la lonja y un barco pierde gasóleo. Apaga la nave antes de que salte a los puestos.', en: 'The market hall is on fire and a boat is leaking fuel. Put out the hall before it spreads to the stalls.' },
      time: 150,
      hose: 17,
      foam: 8,
      wind: { angle: 90, strength: 0.25 },
      stars: [0.93, 0.97],
      minSaved: 0.52,
    },
    lonja(),
  ),
  L(
    {
      id: 'puerto-4',
      theme: 'puerto',
      name: { es: 'Los contenedores', en: 'Container stacks' },
      tip: { es: 'Los contenedores arden despacio pero valen mucho. Busca las bocas de riego entre las pilas.', en: 'Containers burn slowly but they are worth a lot. Find the hydrants between the stacks.' },
      time: 160,
      hose: 16,
      foam: 8,
      wind: { angle: 0, strength: 0.3 },
      stars: [0.71, 0.77],
      minSaved: 0.65,
    },
    contenedores(),
  ),
  L(
    {
      id: 'puerto-5',
      theme: 'puerto',
      name: { es: 'El varadero', en: 'The boatyard' },
      tip: { es: 'Dos manchas de gasóleo vienen hacia las rampas de madera. Frénalas con espuma antes de que lleguen a los barcos.', en: 'Two fuel slicks are heading for the wooden slipways. Stop them with foam before they reach the boats.' },
      time: 150,
      hose: 17,
      foam: 9,
      wind: { angle: 90, strength: 0.3 },
      stars: [0.78, 0.89],
      minSaved: 0.4,
    },
    varadero(),
  ),
  L(
    {
      id: 'puerto-6',
      theme: 'puerto',
      big: true,
      name: { es: 'La terminal de combustible', en: 'The fuel terminal' },
      tip: {
        es: 'Gasóleo en el mar, gasolina en el muelle y bombonas entre medias. Engánchate a las bombas para no quedarte sin espuma.',
        en: 'Fuel on the sea, petrol on the quay and gas bottles in between. Use the sea pumps so you never run out of foam.',
      },
      headline: { es: 'NOCHE DE INFARTO EN LA TERMINAL DE COMBUSTIBLE: NI UNA EXPLOSIÓN', en: 'CLOSE CALL AT THE FUEL TERMINAL: NOT A SINGLE TANK BLOWS' },
      time: 210,
      hose: 17,
      foam: 12,
      wind: { angle: 80, strength: 0.32 },
      windShifts: [{ t: 90, angle: 20, strength: 0.4 }],
      stars: [0.64, 0.67],
      minSaved: 0.58,
    },
    terminal(),
  ),
  L(
    {
      id: 'puerto-7',
      theme: 'puerto',
      name: { es: 'El faro', en: 'The lighthouse' },
      tip: { es: 'El espigón es largo: engánchate a la boca de riego del final. El viento va a girar y traerá el gasóleo hacia el faro.', en: 'The breakwater is long: hook up to the hydrant at the end. The wind will turn and bring the fuel to the lighthouse.' },
      time: 170,
      hose: 16,
      foam: 10,
      wind: { angle: 0, strength: 0.35 },
      windShifts: [{ t: 50, angle: 180, strength: 0.45 }],
      stars: [0.92, 0.95],
      minSaved: 0.8,
    },
    faro(),
  ),
  L(
    {
      id: 'puerto-8',
      theme: 'puerto',
      name: { es: 'El ferry', en: 'The ferry' },
      tip: { es: 'El ferry vale una fortuna y las llamas bajan por su costado. Que no llegue el gasóleo a la rampa.', en: 'The ferry is worth a fortune and flames are licking its side. Keep the fuel away from the ramp.' },
      time: 170,
      hose: 17,
      foam: 10,
      wind: { angle: 90, strength: 0.32 },
      stars: [0.93, 0.97],
      minSaved: 0.63,
    },
    ferry(),
  ),
  L(
    {
      id: 'puerto-9',
      theme: 'puerto',
      name: { es: 'El barrio de pescadores', en: "Fishermen's row" },
      tip: { es: 'Las redes secas prenden como la paja y sueltan pavesas. Apágalas pronto y enfría las bombonas.', en: 'Dry nets catch like straw and throw embers. Put them out early and keep the gas bottles cool.' },
      time: 160,
      hose: 17,
      foam: 8,
      wind: { angle: 100, strength: 0.48 },
      stars: [0.7, 0.75],
      minSaved: 0.64,
    },
    redes(),
  ),
  L(
    {
      id: 'puerto-10',
      theme: 'puerto',
      name: { es: 'Noche en los muelles', en: 'Night on the docks' },
      tip: { es: 'De noche, con tres manchas en el agua y las naves ardiendo. Reparte la espuma y no pierdas de vista las bombonas.', en: 'At night, with three slicks on the water and the sheds on fire. Share out the foam and watch the gas bottles.' },
      time: 200,
      hose: 17,
      foam: 12,
      wind: { angle: 90, strength: 0.46 },
      windShifts: [{ t: 80, angle: 45, strength: 0.5 }],
      stars: [0.8, 0.84],
      minSaved: 0.74,
      night: true,
    },
    nocheMuelles(),
  ),
];
