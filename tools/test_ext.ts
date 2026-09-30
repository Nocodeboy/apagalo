// Tests of the 2.2 tools. The portable extinguisher, without a browser: taking it out drops the hose, you move beyond the
// hose's reach, the powder puts out flames (fuel fires too), it runs out, and you have to walk back for the hose.
// And the Pulaski: it digs the cell in front and the fire does not cross it.
// Usage: npx tsx tools/test_ext.ts
import { LEVELS } from '../src/sim/levels';
import { MATS } from '../src/sim/materials';
import type { SimInput } from '../src/sim/types';
import { DIG_FROM } from '../src/sim/levels';
import { DIG_MATS, DIG_TIME, EXT_TIME, Sim } from '../src/sim/world';

let fails = 0;
function check(what: string, ok: boolean, extra = '') {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${what}${extra ? '  ' + extra : ''}`);
  if (!ok) fails++;
}
const idle: SimInput = { mx: 0, mz: 0, ax: 0, az: 0, aimDist: 0, spray: false, nozzle: 0 };
function run(s: Sim, sec: number, inp: Partial<SimInput>, events: string[] = []) {
  const n = Math.round(sec * 60);
  for (let i = 0; i < n && s.state === 'play'; i++) {
    s.step({ ...idle, ...inp });
    for (const e of s.events) events.push(e.type);
    s.events.length = 0;
  }
  return events;
}
const give = (s: Sim) => (s as unknown as { pickPower: (pw: object) => void }).pickPower({ kind: 'extinguisher', x: s.player.x, z: s.player.z, t: 5 });
/** A walkable, non-burning cell whose centre is between d0 and d1 metres from a point. */
function cellAround(s: Sim, x: number, z: number, d0: number, d1: number, extra: (c: number) => boolean = () => true): number {
  for (let c = 0; c < s.N; c++) {
    const d = Math.hypot((c % s.W) + 0.5 - x, Math.floor(c / s.W) + 0.5 - z);
    if (d >= d0 && d <= d1 && s.walk[c] && s.fire[c] <= 0 && extra(c)) return c;
  }
  return -1;
}
const put = (s: Sim, c: number) => {
  s.player.x = (c % s.W) + 0.5;
  s.player.z = Math.floor(c / s.W) + 0.5;
};

const def = LEVELS[9];
const s = new Sim(def);
const p = s.player;
// the level never ends during the test (no fire left would be a win)
(s as unknown as { checkEnd: () => void }).checkEnd = () => undefined;
// a quiet level: no fire but the one each test lights
// (one flame far from the truck keeps the level going: with no fire at all it would be won)
const a0 = s.anchorPoint(p.anchor);
let farFire = 0;
for (let c = 0, best = -1; c < s.N; c++) {
  const d = Math.hypot((c % s.W) + 0.5 - a0.x, Math.floor(c / s.W) + 0.5 - a0.z);
  if (MATS[s.mat[c]].flam > 0 && MATS[s.mat[c]].fuel >= 1 && d > best) {
    best = d;
    farFire = c;
  }
}
const calm = () => {
  s.fire.fill(0);
  s.heat.fill(0);
  s.fire[farFire] = 0.3;
  p.heat = 0;
  p.stun = 0;
};
calm();
// a short hose, so there is open ground beyond its reach
p.hose = 6;
check('no extinguisher at the start', s.extLeft === 0 && !s.extOn && s.hoseDrop === null);
run(s, 0.2, { ext: true });
check('no powder: the hose stays in hand', s.hoseDrop === null && !s.extOn);
give(s);
check('picked up: kept with its powder', s.extLeft === EXT_TIME && !s.extOn, `extLeft=${s.extLeft}`);

// a spot 2 m inside the hose's reach with open ground straight out from the truck
const a = s.anchorPoint(p.anchor);
let start = -1;
let ux = 0;
let uz = 0;
for (let c = 0; c < s.N && start < 0; c++) {
  const cx = (c % s.W) + 0.5;
  const cz = Math.floor(c / s.W) + 0.5;
  const d = Math.hypot(cx - a.x, cz - a.z);
  if (d < p.hose - 2.5 || d > p.hose - 1.5 || !s.walk[c]) continue;
  const vx = (cx - a.x) / d;
  const vz = (cz - a.z) / d;
  let open = true;
  for (let k = 0; k <= 12 && open; k++) if ((s as unknown as { isBlocked: (x: number, z: number) => boolean }).isBlocked(cx + vx * k * 0.5, cz + vz * k * 0.5)) open = false;
  if (open) {
    start = c;
    ux = vx;
    uz = vz;
  }
}
check('found open ground at the edge of the hose', start >= 0);
put(s, start);
run(s, 3, { mx: ux, mz: uz });
check('control: with the hose in hand you stop at its length', Math.hypot(p.x - a.x, p.z - a.z) <= p.hose + 0.05, `${Math.hypot(p.x - a.x, p.z - a.z).toFixed(1)} m, hose ${p.hose} m`);

// take it out: the hose is dropped there, and you walk on past its length
const at = { x: p.x, z: p.z };
let ev = run(s, 0.1, { ext: true });
check('taking it out drops the hose there', s.extOn && !!s.hoseDrop && Math.hypot(s.hoseDrop!.x - at.x, s.hoseDrop!.z - at.z) < 0.3 && ev.includes('hoseDrop'));
run(s, 1.2, { ext: true, mx: ux, mz: uz });
check('with the hose dropped you go past its length', Math.hypot(p.x - a.x, p.z - a.z) > p.hose + 1, `${Math.hypot(p.x - a.x, p.z - a.z).toFixed(1)} m, hose ${p.hose} m`);

// powder on flames: a fire 2 m away
const fireCell = cellAround(s, p.x, p.z, 1.8, 2.3, (c) => MATS[s.mat[c]].flam > 0 && !MATS[s.mat[c]].oil);
if (fireCell >= 0) {
  s.fire[fireCell] = 1;
  const fx = (fireCell % s.W) + 0.5 - p.x;
  const fz = Math.floor(fireCell / s.W) + 0.5 - p.z;
  const fd = Math.hypot(fx, fz);
  run(s, 1.0, { ext: true, spray: true, ax: fx / fd, az: fz / fd, aimDist: fd });
  check('the powder puts flames out', s.fire[fireCell] <= 0.05, `fire ${s.fire[fireCell].toFixed(2)}, powder left ${s.extLeft.toFixed(1)} s`);
} else console.log('(skip: nothing flammable 2 m away)');

// it runs out, and then no water until the hose is picked up
calm();
ev = run(s, EXT_TIME + 1, { ext: true, spray: true, ax: 1, az: 0 });
check('it runs out', s.extLeft === 0 && !s.extOn && ev.includes('extEmpty'));
ev = run(s, 0.5, { spray: true, ax: 1, az: 0 });
check('no hose in hand: no water, and a warning', !p.spraying && !!s.hoseDrop, ev.join());

// walk back to the hose and pick it up
const hd = s.hoseDrop!;
put(s, s.cellAt(hd.x, hd.z));
calm();
ev = run(s, 0.6, {});
check('back on the hose: picked up', s.hoseDrop === null && ev.includes('hosePick'));
calm();
run(s, 0.3, { spray: true, ax: 1, az: 0 });
check('water again', p.spraying, `stun ${p.stun.toFixed(2)} cut ${p.cut.toFixed(1)}`);

// fuel fires: water makes them flare, powder puts them out
const s2 = LEVELS.map((L) => new Sim(L)).find((x) => x.mat.some((m) => MATS[m].oil && MATS[m].walk));
if (s2) {
  const oil = s2.mat.findIndex((m) => !!MATS[m].oil && MATS[m].walk);
  const from = cellAround(s2, (oil % s2.W) + 0.5, Math.floor(oil / s2.W) + 0.5, 1.8, 2.4, (c) => !MATS[s2.mat[c]].oil);
  if (from >= 0) {
    give(s2);
    put(s2, from);
    s2.fire[oil] = 1;
    const fx = (oil % s2.W) + 0.5 - s2.player.x;
    const fz = Math.floor(oil / s2.W) + 0.5 - s2.player.z;
    const fd = Math.hypot(fx, fz);
    run(s2, 1.5, { ext: true, spray: true, ax: fx / fd, az: fz / fd, aimDist: fd });
    check('powder puts out a fuel fire', s2.fire[oil] <= 0.05, `${s2.def.id}: fire ${s2.fire[oil].toFixed(2)}`);
  } else console.log('(skip: no spot next to the fuel)');
} else console.log('(skip: no fuel on the ground in any level)');

// ---------------- the Pulaski ----------------
const early = new Sim(LEVELS.find((L) => L.num === DIG_FROM - 1)!);
check('Pulaski: not before its level', !early.canDig);
const forest = new Sim(LEVELS.find((L) => L.num === DIG_FROM)!);
(forest as unknown as { checkEnd: () => void }).checkEnd = () => undefined;
check('Pulaski: at hand from its level (castanar-3)', forest.canDig && forest.def.news!.some((n) => n.kind === 'tool'));
forest.fire.fill(0);
forest.heat.fill(0);
// two grass cells side by side with a burnable cell between them and the fire: dig one, leave the other
const q = forest.player;
let pair = -1;
for (let c = forest.W * 2; c < forest.N - forest.W * 2 && pair < 0; c++) {
  const x = c % forest.W;
  if (x < 2 || x > forest.W - 4) continue;
  const ok = (i: number) => DIG_MATS.has(forest.mat[i]) && forest.owner[i] < 0;
  if (ok(c) && ok(c + 1) && ok(c - forest.W) && ok(c + 1 - forest.W) && forest.walk[c + forest.W] && ok(c + forest.W)) pair = c;
}
check('Pulaski: found open grass', pair >= 0);
const dugCell = pair;
const keptCell = pair + 1;
// stand below the cell and dig it
q.x = (dugCell % forest.W) + 0.5;
q.z = Math.floor(dugCell / forest.W) + 1.5;
let evs = run(forest, DIG_TIME + 0.3, { dig: true, ax: 0, az: -1 });
check('Pulaski: the cell in front becomes bare earth', forest.mat[dugCell] !== forest.mat[keptCell] && !DIG_MATS.has(forest.mat[dugCell]) && evs.includes('dug'), `dug ${forest.dug}`);
check('Pulaski: no water while digging', !run(forest, 0.2, { dig: true, spray: true, ax: 0, az: -1 }).includes('extinguish') && !q.spraying);
// fire above both cells, kept hot: the dug one never catches, the other one does
q.x = 1.5;
q.z = 1.5;
const above = [dugCell - forest.W, keptCell - forest.W];
for (let i = 0; i < 300; i++) {
  for (const c of above) {
    forest.fire[c] = 1;
    forest.fuel[c] = forest.fuel0[c];
  }
  run(forest, 1 / 60, {});
}
check('Pulaski: the fire does not cross the dug cell', forest.fire[dugCell] <= 0 && forest.fuel[dugCell] === forest.fuel0[dugCell]);
check('control: the grass next to it burns', forest.fire[keptCell] > 0 || forest.fuel[keptCell] < forest.fuel0[keptCell]);

console.log(fails ? `${fails} FAILED` : 'all OK');
process.exit(fails ? 1 : 0);
