// How much harder the second half of the route (levels 41-120) could get, per level, before the PRO bot drops below
// 90 %: the highest minimum ("out of control" line) the PRO still wins with, and what the casual wins at the current
// minimum, at +5 and +10 points, at that highest minimum and at it capped by two stars minus 6 points. With --spread=X
// the late-route fire-spread ramp goes up to X (now SPREAD_MAX, 0.12); with --time=F every level has F times its time.
// One JSON line per level. See docs/dificultad.md («Si los datos piden más dificultad»).
// Usage: npx tsx tools/headroom.ts [runs] [--spread=0.18] [--time=0.8] > out.jsonl
import { Bot, SKILL_CASUAL, SKILL_PRO, type BotSkill } from '../src/sim/bot';
import { LEVELS, SPREAD_FROM } from '../src/sim/levels';
import type { LevelDef } from '../src/sim/types';
import { Sim } from '../src/sim/world';
const runs = Number(process.argv[2] ?? 8);
const sp = process.argv.find((a) => a.startsWith('--spread='));
const spreadMax = sp ? Number(sp.slice(9)) : null;
const tm = process.argv.find((a) => a.startsWith('--time='));
const timeMul = tm ? Number(tm.slice(7)) : 1;
function play(def: LevelDef, skill: BotSkill, seed: number) {
  const sim = new Sim({ ...def, minSaved: 0 }, { seed });
  const bot = new Bot(sim, skill);
  let st = 0;
  while (sim.state === 'play' && st < 60 * 400) {
    sim.step(bot.update());
    sim.events.length = 0;
    st++;
  }
  return { saved: sim.result!.saved, out: sim.result!.win };
}
const rate = (rs: { saved: number; out: boolean }[], m: number) => rs.filter((r) => r.out && r.saved >= m).length / rs.length;
for (const L0 of LEVELS) {
  if (L0.num <= 40) continue;
  const L = { ...L0 };
  L.time = Math.round(L.time * timeMul);
  if (spreadMax !== null && !L.intro) L.spread = 1 + spreadMax * Math.min(1, (L.num - SPREAD_FROM) / (LEVELS.length - SPREAD_FROM));
  const pro = Array.from({ length: runs }, (_, k) => play(L, SKILL_PRO, 1000 + k * 77));
  const cas = Array.from({ length: runs }, (_, k) => play(L, SKILL_CASUAL, 1000 + k * 77));
  let top = 0;
  for (let m = 0.3; m <= 0.99; m += 0.01) if (rate(pro, m) >= 0.9) top = Math.round(m * 100) / 100;
  const cap = Math.min(top, L.stars[0] - 0.06);
  const casAtTop = rate(cas, Math.max(top, L.minSaved));
  console.log(JSON.stringify({ n: L.num, id: L.id, big: !!L.big, min: L.minSaved, top: cap, pro: rate(pro, L.minSaved), cas: rate(cas, L.minSaved), casTop: rate(cas, Math.max(cap, L.minSaved)), topPro: top, casAtTopPro: casAtTop, s2: L.stars[0], p5: rate(pro, L.minSaved + 0.05), c5: rate(cas, L.minSaved + 0.05), p10: rate(pro, L.minSaved + 0.1), c10: rate(cas, L.minSaved + 0.1) }));
}
