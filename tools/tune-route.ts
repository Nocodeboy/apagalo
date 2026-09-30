// Sets the thresholds of a group of levels from the bots, with the casual target that fits each level's place in the
// route (docs/dificultad.md): 95 % in a new place's intro, then from 90 % at the start of the route down to 50 % at the
// end, 10 points less on a big fire and 10 more right after one. Prints the suggestions (tools/tune.ts rules) and, with
// --json=file, writes them for tools/apply-tune.py.
// With --min-only the stars stay as they are and only the minimum ("out of control" line) moves, never above two
// stars minus 6 points (so losing is always well below two stars) nor above 80 %.
// Usage: npx tsx tools/tune-route.ts [runs] <levelId|theme|from-to>... [--json=file] [--min-only]
import { writeFileSync } from 'node:fs';
import { Bot, SKILL_CASUAL, SKILL_PRO, type BotSkill } from '../src/sim/bot';
import { LEVELS } from '../src/sim/levels';
import type { LevelDef } from '../src/sim/types';
import { Sim } from '../src/sim/world';

const args = process.argv.slice(2);
const pos = args.filter((a) => !a.startsWith('--'));
const runs = /^\d+$/.test(pos[0] ?? '') ? Number(pos.shift()) : 16;
const jsonFile = args.find((a) => a.startsWith('--json='))?.slice(7);
const minOnly = args.includes('--min-only');
const ids: string[] = [];
for (const p of pos) {
  if (/^\d+-\d+$/.test(p)) {
    const [a, b] = p.split('-').map(Number);
    for (const L of LEVELS) if (L.num >= a && L.num <= b) ids.push(L.id);
  } else if (LEVELS.some((L) => L.theme === p)) {
    for (const L of LEVELS) if (L.theme === p) ids.push(L.id);
  } else ids.push(p);
}

export function casualTarget(L: LevelDef): number {
  if (L.intro) return 0.95;
  const n = L.num;
  let t = 0.9 - (0.4 * (n - 1)) / (LEVELS.length - 1);
  if (L.big) t -= 0.1;
  if (LEVELS[n - 2]?.big) t += 0.1;
  return Math.round(Math.max(0.45, Math.min(0.95, t)) * 100) / 100;
}

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
const q = (xs: number[], p: number) => [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.max(0, Math.floor(p * (xs.length - 1))))];
const rate = (rs: { saved: number; out: boolean }[], m: number) => rs.filter((r) => r.out && r.saved >= m).length / rs.length;
const r2 = (x: number) => Math.round(x * 100) / 100;
const out: Record<string, { minSaved: number; stars: [number, number]; pro: number; casual: number; target: number }> = {};
for (const id of ids) {
  const L = LEVELS.find((d) => d.id === id)!;
  const pro = Array.from({ length: runs }, (_, k) => play(L, SKILL_PRO, 1000 + k * 77));
  const cas = Array.from({ length: runs }, (_, k) => play(L, SKILL_CASUAL, 1000 + k * 77));
  const want = casualTarget(L);
  let best = 0.3;
  for (let m = 0.3; m <= 0.99; m += 0.01) if (rate(pro, m) >= 0.95 && rate(cas, m) >= want) best = m;
  const ps = pro.map((r) => r.saved);
  // (with --min-only the stars only come down, and only when the PRO no longer reaches two stars in most games)
  const s2new = r2(Math.min(0.93, q(ps, 0.5) - 0.02));
  const s3new = r2(Math.min(0.97, Math.max(q(ps, 0.8), s2new + 0.03)));
  const lower = minOnly && q(ps, 0.5) < L.stars[0] + 0.01;
  const s2 = minOnly && !lower ? L.stars[0] : s2new;
  const s3 = minOnly && !lower ? L.stars[1] : Math.min(s3new, minOnly ? L.stars[1] : 1);
  const m = r2(Math.max(0.3, Math.min(best, s2 - 0.06, L.intro ? 0.6 : 0.8)));
  out[id] = { minSaved: m, stars: [s2, s3], pro: rate(pro, m), casual: rate(cas, m), target: want };
  if (minOnly && Math.abs(m - L.minSaved) < 0.005 && !lower) delete out[id];
  const pct = (x: number) => `${Math.round(x * 100)}`.padStart(3);
  console.log(
    `${String(L.num).padStart(3)} ${id.padEnd(12)}${L.big ? ' BIG' : L.intro ? ' INT' : '    '} PRO p10/50/90 ${pct(q(ps, 0.1))}/${pct(q(ps, 0.5))}/${pct(q(ps, 0.9))} cas p50 ${pct(q(cas.map((r) => r.saved), 0.5))} | want cas ${pct(want)} -> min ${pct(m)} ★★ ${pct(s2)} ★★★ ${pct(s3)}  PRO ${pct(rate(pro, m))}% cas ${pct(rate(cas, m))}%`,
  );
}
if (jsonFile) writeFileSync(jsonFile, JSON.stringify(out, null, 1));
