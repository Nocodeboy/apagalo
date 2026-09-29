// Prints the ASCII map of levels (with the cells that start burning marked as '@'), to design and review them, and
// warns about fires put on cells that cannot burn. Usage: npx tsx tools/map.ts <levelId>... (or "all" to only check)
import { LEVELS } from '../src/sim/levels';
import { MATS } from '../src/sim/materials';
import { Sim } from '../src/sim/world';

const args = process.argv.slice(2);
if (args[0] === 'all') {
  for (const L of LEVELS) {
    const s = new Sim(L, { seed: 1 });
    const bad: string[] = [];
    for (const [z, row] of Object.entries(L.fires ?? {}))
      [...row].forEach((c, x) => {
        const i = Number(z) * s.W + x;
        if (c === 'X' && MATS[s.mat[i]].flam <= 0) bad.push(`${x},${z} (${MATS[s.mat[i]].key})`);
      });
    if (bad.length) console.log(`${L.num} ${L.id}: fire on cells that cannot burn: ${bad.join(' ')}`);
  }
  process.exit(0);
}

for (const id of args) {
  const L = LEVELS.find((d) => d.id === id);
  if (!L) {
    console.log(`${id}: no such level`);
    continue;
  }
  const fires = new Set<string>();
  for (const [z, row] of Object.entries(L.fires ?? {})) [...row].forEach((c, x) => c === 'X' && fires.add(`${x},${z}`));
  console.log(`== ${L.num} ${L.id} ${L.map[0].length}x${L.map.length} time ${L.time}s hose ${L.hose} wind ${JSON.stringify(L.wind)}`);
  console.log('    ' + Array.from({ length: L.map[0].length }, (_, x) => String(x % 10)).join(''));
  L.map.forEach((row, z) => console.log(String(z).padStart(3) + ' ' + [...row].map((c, x) => (fires.has(`${x},${z}`) ? '@' : c)).join('')));
}
