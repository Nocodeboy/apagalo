import { LEVELS } from '../src/sim/levels';
for (const d of LEVELS) console.log(String(d.num).padStart(3), d.theme.padEnd(10), d.id.padEnd(14), d.big ? 'BIG' : '   ', (d.events ?? []).map((e) => e.kind + '@' + e.t).join(','), (d.powerups ?? []).length, JSON.stringify(d.news));
