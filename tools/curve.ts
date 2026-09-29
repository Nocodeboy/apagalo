// Saved area and burning cells over time for a level: nobody playing, the casual bot and the PRO bot.
// Shows whether the losses come from the start (the same for everyone) or from fire spreading (where skill counts).
// Usage: npx tsx tools/curve.ts <levelId> [seed]
import { Bot, SKILL_CASUAL, SKILL_PRO, type BotSkill } from '../src/sim/bot';
import { LEVELS } from '../src/sim/levels';
import { Sim } from '../src/sim/world';

const id = process.argv[2];
const seed = Number(process.argv[3] ?? 1000);
const def = LEVELS.find((L) => L.id === id);
if (!def) throw new Error(`no level ${id}`);
const idle = { mx: 0, mz: 0, ax: 0, az: 0, aimDist: 0, spray: false, nozzle: 0 as const };
for (const [name, skill] of [['idle', null], ['casual', SKILL_CASUAL], ['PRO', SKILL_PRO]] as [string, BotSkill | null][]) {
  const sim = new Sim({ ...def, minSaved: 0 }, { seed });
  const bot = skill ? new Bot(sim, skill) : null;
  const marks: string[] = [];
  let step = 0;
  while (sim.state === 'play' && step < 60 * 400) {
    sim.step(bot ? bot.update() : idle);
    sim.events.length = 0;
    if (step % (60 * 10) === 0) marks.push(`${(step / 60) | 0}s ${Math.round(sim.saved * 100)}%/${sim.burning}`);
    step++;
  }
  console.log(`${name.padEnd(6)} ${marks.join('  ')}  -> ${sim.state} ${Math.round(sim.saved * 100)}% at ${sim.time.toFixed(0)}s`);
}
