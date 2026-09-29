// Headless difficulty bot: plays every level N times and reports win rate / stars.
// Usage: npx tsx tools/bot.ts [runs] [levelId|from-to] [--up=max|N|hose,power,speed,time] [--crew=partner:3,dog:1] [--sum] [--pro]
//   levelId plays one level (e.g. puerto-2); from-to plays a stretch of the route by number (e.g. 1-30).
//   --up plays the levels with upgrades: "max" (all at 5), one level for every track, or one per track.
//   --crew takes crew members (level 1-3) to every level that has room for them (as the game does).
//   --sum prints a table per chapter (10 levels) and per scenario at the end. --pro skips the casual bot.
//   The daily challenge never uses upgrades nor crew, so it is skipped then.
import { MAX_UPGRADE, UPGRADE_IDS, upgradeOptions, type UpgradeLevels } from '../src/economy';
import { Bot, SKILL_CASUAL, SKILL_PRO, type BotSkill } from '../src/sim/bot';
import { makeDaily } from '../src/sim/daily';
import { LEVELS } from '../src/sim/levels';
import type { CrewId, LevelDef } from '../src/sim/types';
import { Sim, type SimOptions } from '../src/sim/world';

const args = process.argv.slice(2);
const pos = args.filter((a) => !a.startsWith('--'));
const runs = Number(pos[0] ?? 12);
const only = pos[1];
const range = only && /^\d+-\d+$/.test(only) ? only.split('-').map(Number) : null;
const up = parseUp(args.find((a) => a.startsWith('--up='))?.slice(5));
const crew = parseCrew(args.find((a) => a.startsWith('--crew='))?.slice(7));
const sum = args.includes('--sum');
const proOnly = args.includes('--pro');
const levelOpts: SimOptions = up ? upgradeOptions(up) : {};

function parseUp(v: string | undefined): UpgradeLevels | null {
  if (!v) return null;
  const n = v.split(',').map((x) => (x === 'max' ? MAX_UPGRADE : Math.min(MAX_UPGRADE, Math.max(0, Number(x) || 0))));
  return Object.fromEntries(UPGRADE_IDS.map((id, i) => [id, n.length === 1 ? n[0] : (n[i] ?? 0)])) as UpgradeLevels;
}
function parseCrew(v: string | undefined): Partial<Record<CrewId, number>> | null {
  if (!v) return null;
  return Object.fromEntries(v.split(',').map((p) => p.split(':')).map(([id, l]) => [id, Number(l ?? 1)])) as Partial<Record<CrewId, number>>;
}
/** The crew the game would take: the first ones that fit in the level's slots. */
function crewFor(def: LevelDef): Partial<Record<CrewId, number>> | undefined {
  if (!crew) return undefined;
  const slots = def.crewSlots ?? 0;
  return Object.fromEntries(Object.entries(crew).slice(0, slots));
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

interface Stat {
  win: number;
  saved: number;
}
function report(name: string, def: LevelDef, skill: BotSkill, opts: SimOptions = {}): Stat {
  let wins = 0;
  let saved = 0;
  let tl = 0;
  let resc = 0;
  let expl = 0;
  let shorts = 0;
  let pw = 0;
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
    pw += res.powerups;
    reasons[res.reason] = (reasons[res.reason] ?? 0) + 1;
  }
  console.log(
    `${name.padEnd(22)} win ${String(Math.round((wins / runs) * 100)).padStart(3)}%  saved ${((saved / runs) * 100).toFixed(0).padStart(3)}%  ` +
      `left ${(wins ? tl / wins : 0).toFixed(0).padStart(3)}s  ★ ${stars.join('/')}  rescued ${(resc / runs).toFixed(1)}/${rt}  boom ${(expl / runs).toFixed(1)}  zap ${(shorts / runs).toFixed(1)}  pw ${(pw / runs).toFixed(1)}  ${JSON.stringify(reasons)}`,
  );
  return { win: wins / runs, saved: saved / runs };
}

if (up) console.log(`upgrades ${UPGRADE_IDS.map((id) => `${id} ${up[id]}`).join(' · ')} -> ${JSON.stringify(levelOpts)}`);
if (crew) console.log(`crew ${JSON.stringify(crew)}`);
const rows: { def: LevelDef; pro: Stat; casual: Stat | null }[] = [];
for (const L of LEVELS) {
  if (range ? L.num < range[0] || L.num > range[1] : only && L.id !== only) continue;
  const opts = { ...levelOpts, crew: crewFor(L) };
  const pro = report(`${L.num} ${L.id} PRO`, L, SKILL_PRO, opts);
  const casual = proOnly ? null : report(`${L.num} ${L.id} casual`, L, SKILL_CASUAL, opts);
  rows.push({ def: L, pro, casual });
}
if (!up && !crew && !range && (!only || only === 'daily')) {
  for (let k = 0; k < 7; k++) {
    const d = makeDaily(new Date(2026, 8, 25 + k));
    report(`daily#${d.num} ${d.def.theme.slice(0, 5)} ${d.mod.key}`, d.def, SKILL_PRO, d.opts);
  }
}
if (sum && rows.length) {
  const pct = (n: number) => `${Math.round(n * 100)} %`;
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  const table = (title: string, groups: [string, typeof rows][]) => {
    console.log(`\n| ${title} | Niveles | PRO gana | Casual gana | Casual salva |\n|---|---|---|---|---|`);
    for (const [k, g] of groups) {
      const cas = g.filter((r) => r.casual).map((r) => r.casual!);
      console.log(`| ${k} | ${g.length} | ${pct(avg(g.map((r) => r.pro.win)))} | ${cas.length ? pct(avg(cas.map((c) => c.win))) : '-'} | ${cas.length ? pct(avg(cas.map((c) => c.saved))) : '-'} |`);
    }
  };
  const chapters = new Map<string, typeof rows>();
  for (const r of rows) {
    const c = Math.floor((r.def.num - 1) / 10);
    const k = `${c * 10 + 1}-${Math.min(LEVELS.length, c * 10 + 10)}`;
    if (!chapters.has(k)) chapters.set(k, []);
    chapters.get(k)!.push(r);
  }
  table('Capítulo', [...chapters]);
  const scn = new Map<string, typeof rows>();
  for (const r of rows) {
    if (!scn.has(r.def.theme)) scn.set(r.def.theme, []);
    scn.get(r.def.theme)!.push(r);
  }
  table('Escenario', [...scn]);
  const big = rows.filter((r) => r.def.big);
  if (big.length) table('Grandes incendios', [['todos', big]]);
}
