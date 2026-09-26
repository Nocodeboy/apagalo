import { Bot, SKILL_CASUAL, SKILL_PRO } from '../src/sim/bot';
import { LEVELS } from '../src/sim/levels';
import { Sim, TUNE } from '../src/sim/world';
const combos = JSON.parse(process.argv[2]);
const runs = Number(process.argv[3] ?? 4);
for (const c of combos) {
  Object.assign(TUNE, c);
  const row: string[] = [];
  for (const L of LEVELS) {
    for (const [nm, sk] of [['P', SKILL_PRO], ['c', SKILL_CASUAL]] as const) {
      let w = 0, left = 0, sv = 0;
      for (let r = 0; r < runs; r++) {
        const sim = new Sim(L, { seed: 1000 + r * 77 });
        const bot = new Bot(sim, sk);
        let st = 0;
        while (sim.state === 'play' && st < 60 * 400) { sim.step(bot.update()); sim.events.length = 0; st++; }
        if (sim.result?.win) { w++; left += sim.result.timeLeft; }
        sv += sim.result?.saved ?? 0;
      }
      row.push(`${L.num}${nm}:${Math.round(w / runs * 100)}%/${w ? Math.round(left / w) : 0}s/${Math.round(sv / runs * 100)}`);
    }
  }
  console.log(JSON.stringify(c), row.join(' '));
}
