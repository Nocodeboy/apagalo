// Quick look at a set of levels while designing them: how much is lost with nobody playing (idle), and what the
// casual and PRO bots save (median of a few games, with no "minimum saved" so every game goes to the end).
// Usage: npx tsx tools/probe.ts [runs] <levelId|from-to>...
import { Bot, SKILL_CASUAL, SKILL_PRO, type BotSkill } from '../src/sim/bot';
import { LEVELS } from '../src/sim/levels';
import { Sim } from '../src/sim/world';

const args = process.argv.slice(2);
const runs = /^\d+$/.test(args[0] ?? '') ? Number(args.shift()) : 4;
const ids: string[] = [];
for (const a of args) {
  if (/^\d+-\d+$/.test(a)) {
    const [x, y] = a.split('-').map(Number);
    for (const L of LEVELS) if (L.num >= x && L.num <= y) ids.push(L.id);
  } else ids.push(a);
}
const idle = { mx: 0, mz: 0, ax: 0, az: 0, aimDist: 0, spray: false, nozzle: 0 as const };
function play(id: string, skill: BotSkill | null, seed: number) {
  const def = LEVELS.find((L) => L.id === id)!;
  const sim = new Sim({ ...def, minSaved: 0 }, { seed });
  const bot = skill ? new Bot(sim, skill) : null;
  let st = 0;
  let peak = 0;
  while (sim.state === 'play' && st < 60 * 400) {
    sim.step(bot ? bot.update() : idle);
    sim.events.length = 0;
    if (sim.burning > peak) peak = sim.burning;
    st++;
  }
  return { saved: sim.saved, t: sim.time, out: sim.result?.win ?? false, peak, fled: sim.fled, resc: sim.rescued, tot: sim.rescuees.length, pw: sim.powerPicked };
}
const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor((xs.length - 1) / 2)];
const pct = (x: number) => `${Math.round(x * 100)}`.padStart(3);
for (const id of ids) {
  const def = LEVELS.find((L) => L.id === id);
  if (!def) {
    console.log(id, 'no such level');
    continue;
  }
  const i = play(id, null, 1000);
  const row = (skill: BotSkill) => {
    const rs = Array.from({ length: runs }, (_, k) => play(id, skill, 1000 + k * 77));
    return `saved ${pct(med(rs.map((r) => r.saved)))} (min ${pct(Math.min(...rs.map((r) => r.saved)))}) out ${rs.filter((r) => r.out).length}/${runs} t ${med(rs.map((r) => r.t)).toFixed(0).padStart(3)}s fled ${med(rs.map((r) => r.fled))}/${rs[0].tot}`;
  };
  console.log(`${String(def.num).padStart(3)} ${id.padEnd(12)} ${def.time}s idle ${pct(i.saved)}% peak ${String(i.peak).padStart(3)} | PRO ${row(SKILL_PRO)} | cas ${row(SKILL_CASUAL)} | now min ${pct(def.minSaved)} ★ ${pct(def.stars[0])}/${pct(def.stars[1])}`);
}
