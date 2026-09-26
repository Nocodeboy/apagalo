// Headless difficulty bot: plays every level N times and reports win rate / stars.
// Usage: npx tsx tools/bot.ts [runs] [levelId] [--up=max|N|hose,power,speed,time]
//   --up plays the levels with upgrades: "max" (all at 5), one level for every track, or one per track.
//   The daily challenge never uses upgrades, so it is skipped then.
import { MAX_UPGRADE, UPGRADE_IDS, upgradeOptions, type UpgradeLevels } from '../src/economy';
import { Bot, SKILL_CASUAL, SKILL_PRO, type BotSkill } from '../src/sim/bot';
import { makeDaily } from '../src/sim/daily';
import { LEVELS } from '../src/sim/levels';
import type { LevelDef } from '../src/sim/types';
import { Sim, type SimOptions } from '../src/sim/world';

const args = process.argv.slice(2);
const pos = args.filter((a) => !a.startsWith('--'));
const runs = Number(pos[0] ?? 12);
const only = pos[1];
const up = parseUp(args.find((a) => a.startsWith('--up='))?.slice(5));
const levelOpts: SimOptions = up ? upgradeOptions(up) : {};

function parseUp(v: string | undefined): UpgradeLevels | null {
  if (!v) return null;
  const n = v.split(',').map((x) => (x === 'max' ? MAX_UPGRADE : Math.min(MAX_UPGRADE, Math.max(0, Number(x) || 0))));
  return Object.fromEntries(UPGRADE_IDS.map((id, i) => [id, n.length === 1 ? n[0] : (n[i] ?? 0)])) as UpgradeLevels;
}

function play(def: LevelDef, skill: BotSkill, seed: number, opts: SimOptions = {}) {
  const sim = new Sim(def, { ...opts, seed });
  const bot = new Bot(sim, skill);
  let steps = 0;
  while (sim.state === 'play' && steps < 60 * 400) {
    sim.step(bot.update());
    sim.events.length = 0;
    steps++;
  }
  return sim;
}

function report(name: string, def: LevelDef, skill: BotSkill, opts: SimOptions = {}) {
  let wins = 0;
  let saved = 0;
  let tl = 0;
  let resc = 0;
  let expl = 0;
  let shorts = 0;
  const stars = [0, 0, 0, 0];
  const reasons: Record<string, number> = {};
  let rt = 0;
  for (let r = 0; r < runs; r++) {
    const s = play(def, skill, 1000 + r * 77, opts);
    const res = s.result!;
    if (!res) {
      reasons['timeout'] = (reasons['timeout'] ?? 0) + 1;
      continue;
    }
    if (res.win) wins++;
    stars[res.stars]++;
    saved += res.saved;
    tl += res.win ? res.timeLeft : 0;
    resc += res.rescued;
    rt = res.rescueTotal;
    expl += res.explosions;
    shorts += res.shorts;
    reasons[res.reason] = (reasons[res.reason] ?? 0) + 1;
  }
  console.log(
    `${name.padEnd(22)} win ${String(Math.round((wins / runs) * 100)).padStart(3)}%  saved ${((saved / runs) * 100).toFixed(0).padStart(3)}%  ` +
      `left ${(wins ? tl / wins : 0).toFixed(0).padStart(3)}s  ★ ${stars.join('/')}  rescued ${(resc / runs).toFixed(1)}/${rt}  boom ${(expl / runs).toFixed(1)}  zap ${(shorts / runs).toFixed(1)}  ${JSON.stringify(reasons)}`,
  );
}

if (up) console.log(`upgrades ${UPGRADE_IDS.map((id) => `${id} ${up[id]}`).join(' · ')} -> ${JSON.stringify(levelOpts)}`);
for (const L of LEVELS) {
  if (only && L.id !== only) continue;
  report(`${L.num} ${L.id} PRO`, L, SKILL_PRO, levelOpts);
  report(`${L.num} ${L.id} casual`, L, SKILL_CASUAL, levelOpts);
}
if (!up && (!only || only === 'daily')) {
  for (let k = 0; k < 7; k++) {
    const d = makeDaily(new Date(2026, 8, 25 + k));
    report(`daily#${d.num} ${d.def.theme.slice(0, 5)} ${d.mod.key}`, d.def, SKILL_PRO, d.opts);
  }
}
