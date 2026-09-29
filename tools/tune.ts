// Level tuning helper: plays levels with no "minimum saved" (so every run goes to the end) and prints how much each bot
// saves, so the thresholds (minSaved and the stars) can be set from the numbers instead of by feel.
// Usage: npx tsx tools/tune.ts [runs] <levelId[:casual]|from-to>... [--casual=0.7] [--pro=0.95] [--json=file]
//   --casual / --pro: the win rates to aim for; the suggested minSaved is the highest one that keeps both.
//   levelId:0.6 sets the casual target for that level only. --json writes the suggestions to a file.
// Saved area only goes down during a level, so "saved at the end with minSaved 0" tells exactly at which minSaved
// each run would have been lost.
import { writeFileSync } from 'node:fs';
import { Bot, SKILL_CASUAL, SKILL_PRO, type BotSkill } from '../src/sim/bot';
import { LEVELS } from '../src/sim/levels';
import type { LevelDef } from '../src/sim/types';
import { Sim } from '../src/sim/world';

const args = process.argv.slice(2);
const pos = args.filter((a) => !a.startsWith('--'));
const runs = /^\d+$/.test(pos[0] ?? '') ? Number(pos.shift()) : 16;
const flag = (k: string, d: number) => Number(args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d);
const wantCasual = flag('casual', 0.7);
const wantPro = flag('pro', 0.95);

interface Run {
  saved: number;
  out: boolean; // the fire was put out in time
  t: number; // seconds used
  rescued: number;
  rescueTotal: number;
}
// --windx=1.3 tries the level with a stronger wind (every shift too), to see if it would separate the bots more
const windx = flag('windx', 1);
function play(def: LevelDef, skill: BotSkill, seed: number): Run {
  const w = (x: { angle: number; strength: number }) => ({ ...x, strength: Math.min(0.9, x.strength * windx) });
  const d = windx === 1 ? def : { ...def, wind: w(def.wind), windShifts: def.windShifts?.map((s) => ({ ...s, ...w(s) })) };
  const sim = new Sim({ ...d, minSaved: 0 }, { seed });
  const bot = new Bot(sim, skill);
  let steps = 0;
  while (sim.state === 'play' && steps < 60 * 400) {
    sim.step(bot.update());
    sim.events.length = 0;
    steps++;
  }
  const r = sim.result!;
  return { saved: r.saved, out: r.win, t: sim.time, rescued: r.rescued, rescueTotal: r.rescueTotal };
}
const pct = (x: number) => `${Math.round(x * 100)}`.padStart(3);
function q(xs: number[], p: number) {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))];
}
/** Win rate at a given minSaved. */
const rate = (rs: Run[], m: number) => rs.filter((r) => r.out && r.saved >= m).length / rs.length;

const ids: string[] = [];
const target: Record<string, number> = {};
for (const p of pos) {
  if (/^\d+-\d+$/.test(p)) {
    const [a, b] = p.split('-').map(Number);
    for (const L of LEVELS) if (L.num >= a && L.num <= b) ids.push(L.id);
  } else {
    const [id, t] = p.split(':');
    ids.push(id);
    if (t) target[id] = Number(t);
  }
}
const out: Record<string, { minSaved: number; stars: [number, number]; pro: number; casual: number }> = {};
const jsonFile = args.find((a) => a.startsWith('--json='))?.slice(7);
for (const id of ids) {
  const def = LEVELS.find((L) => L.id === id);
  if (!def) {
    console.log(`${id}: no such level`);
    continue;
  }
  const pro: Run[] = [];
  const cas: Run[] = [];
  for (let r = 0; r < runs; r++) {
    pro.push(play(def, SKILL_PRO, 1000 + r * 77));
    cas.push(play(def, SKILL_CASUAL, 1000 + r * 77));
  }
  // highest minSaved (in whole points) that keeps both targets
  const wantC = target[id] ?? wantCasual;
  let best = 0;
  for (let m = 0.3; m <= 0.99; m += 0.01) if (rate(pro, m) >= wantPro && rate(cas, m) >= wantC) best = m;
  const line = (k: string, rs: Run[]) => {
    const s = rs.map((r) => r.saved);
    const outs = rs.filter((r) => r.out);
    return `${k} out ${pct(outs.length / rs.length)}%  saved p10 ${pct(q(s, 0.1))} p50 ${pct(q(s, 0.5))} p90 ${pct(q(s, 0.9))}  t ${(outs.reduce((a, r) => a + r.t, 0) / Math.max(1, outs.length)).toFixed(0).padStart(3)}s  rescued ${(rs.reduce((a, r) => a + r.rescued, 0) / rs.length).toFixed(1)}/${rs[0].rescueTotal}`;
  };
  const now = `now min ${pct(def.minSaved)} ★★ ${pct(def.stars[0])} ★★★ ${pct(def.stars[1])} -> PRO ${pct(rate(pro, def.minSaved))}% casual ${pct(rate(cas, def.minSaved))}%`;
  console.log(`${String(def.num).padStart(3)} ${id.padEnd(14)} time ${def.time}s  ${now}`);
  console.log(`      ${line('PRO   ', pro)}`);
  console.log(`      ${line('casual', cas)}`);
  // two stars around what the PRO bot usually saves, three for its best games; always a few points apart
  const ps = pro.map((r) => r.saved);
  const r2 = (x: number) => Math.round(x * 100) / 100;
  const s2 = r2(Math.min(0.93, q(ps, 0.5) - 0.02));
  const s3 = r2(Math.min(0.97, Math.max(q(ps, 0.8), s2 + 0.03)));
  // losing stays well below two stars (never above 80 %)
  const m = r2(Math.min(best, s2 - 0.06, 0.8));
  out[id] = { minSaved: m, stars: [s2, s3], pro: rate(pro, m), casual: rate(cas, m) };
  console.log(`      suggest minSaved ${pct(m)}  ★★ ${pct(s2)}  ★★★ ${pct(s3)}  (casual ${pct(wantC)}% wanted -> PRO ${pct(rate(pro, m))}% casual ${pct(rate(cas, m))}%)`);
}
if (jsonFile) writeFileSync(jsonFile, JSON.stringify(out, null, 1));
