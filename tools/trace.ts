import { Bot, SKILL_PRO } from '../src/sim/bot';
import { LEVELS } from '../src/sim/levels';
import { Sim } from '../src/sim/world';
import { MATS } from '../src/sim/materials';
const id = process.argv[2] ?? 'gasolinera';
const L = LEVELS.find((l) => l.id === id)!;
const sim = new Sim(L, { seed: 1000 });
const bot = new Bot(sim, SKILL_PRO);
let step = 0;
const evc: Record<string, number> = {};
while (sim.state === 'play' && step < 60 * 300) {
  sim.step(bot.update());
  for (const e of sim.events) evc[e.type] = (evc[e.type] ?? 0) + 1;
  sim.events.length = 0;
  step++;
  if (step % 300 === 0) {
    const g = (bot as any).goal;
    const byMat: Record<string, number> = {};
    for (let i = 0; i < sim.N; i++) if (sim.fire[i] > 0) byMat[MATS[sim.mat[i]].key] = (byMat[MATS[sim.mat[i]].key] ?? 0) + 1;
    console.log(`t=${sim.time.toFixed(0)} burn=${sim.burning} saved=${(sim.saved*100).toFixed(0)} foam=${sim.foamLeft.toFixed(1)} p=(${sim.player.x.toFixed(1)},${sim.player.z.toFixed(1)}) noz=${sim.player.nozzle} goal=${JSON.stringify(g)} ${JSON.stringify(byMat)}`);
  }
}
console.log(sim.state, sim.result, evc);
// burnt map
const rows: string[] = [];
for (let z = 0; z < sim.H; z++) { let r=''; for (let x=0;x<sim.W;x++){ const i=z*sim.W+x; const f0=sim.fuel0[i]; r += f0>0 ? (sim.fire[i]>0?'F': (1-sim.fuel[i]/f0)>0.5?'#': (1-sim.fuel[i]/f0)>0.05?'+':'.') : ' '; } rows.push(r); }
console.log(rows.join('\n'));
