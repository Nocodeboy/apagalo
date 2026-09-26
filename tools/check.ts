import { LEVELS } from '../src/sim/levels';
import { Sim } from '../src/sim/world';
import { makeDaily } from '../src/sim/daily';
for (const L of LEVELS) {
  const s = new Sim(L);
  const counts: Record<string, number> = {};
  for (const e of s.ents) counts[e.type] = (counts[e.type] ?? 0) + 1;
  console.log(`\n== ${L.num} ${L.id} ${s.W}x${s.H} burning=${s.burning} totalValue=${s.totalValue.toFixed(0)} player=(${s.player.x},${s.player.z})`);
  console.log(JSON.stringify(counts));
  if (process.argv.includes('--map')) console.log(L.map.join('\n'));
  // passive run: no input
  const idle = { mx: 0, mz: 0, ax: 0, az: 0, aimDist: 0, spray: false, nozzle: 0 as const };
  const marks: string[] = [];
  for (let t = 0; t < 60 * 90 && s.state === 'play'; t++) {
    s.step(idle);
    s.events.length = 0;
    if (t % (60 * 15) === 0) marks.push(`t${(t / 60) | 0}: burn=${s.burning} saved=${(s.saved * 100).toFixed(0)}%`);
  }
  console.log(marks.join(' | '), '->', s.state, s.result?.reason, `t=${s.time.toFixed(0)}`);
}
const d = makeDaily();
console.log('\nDaily', d.num, d.key, d.def.theme, d.mod.key, d.opts);
