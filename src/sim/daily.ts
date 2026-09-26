import { BASE_LEVELS } from './levels';
import { MATS } from './materials';
import { parseLevel } from './parse';
import { hashString, Rng } from './rng';
import type { LevelDef, Txt } from './types';
import type { SimOptions } from './world';

export const DAILY_EPOCH = Date.UTC(2026, 8, 25); // Reto #1 = 25 Sep 2026

export interface DailyModifier {
  key: 'wind' | 'short' | 'double' | 'night' | 'fast';
  label: Txt;
}
const MODS: DailyModifier[] = [
  { key: 'wind', label: { es: 'Viento fuerte', en: 'Strong wind' } },
  { key: 'short', label: { es: 'Manguera corta', en: 'Short hose' } },
  { key: 'double', label: { es: 'Doble foco', en: 'Double blaze' } },
  { key: 'night', label: { es: 'De noche', en: 'Night shift' } },
  { key: 'fast', label: { es: 'Contrarreloj', en: 'Against the clock' } },
];

export interface Daily {
  num: number;
  key: string; // yyyy-mm-dd
  def: LevelDef;
  opts: SimOptions;
  mod: DailyModifier;
}

export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function dailyNumber(d = new Date()): number {
  const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(1, Math.floor((local - DAILY_EPOCH) / 86400000) + 1);
}

export function makeDaily(d = new Date(), salt = 0): Daily {
  const key = dayKey(d);
  const num = dailyNumber(d);
  const rng = new Rng(hashString('apagalo-' + key + (salt ? '#' + salt : '')));
  const base = BASE_LEVELS[Math.floor(rng.next() * BASE_LEVELS.length)];
  let mod = rng.pick(MODS);
  if (mod.key === 'night' && base.night) mod = MODS[0];
  const def: LevelDef = JSON.parse(JSON.stringify(base));
  def.id = 'daily';
  def.name = { es: `Reto diario #${num}`, en: `Daily #${num}` };
  def.tip = mod.label;
  if (mod.key === 'night') def.night = true;
  if (mod.key === 'fast') def.time = Math.round(base.time * 0.75);
  const strength = Math.min(0.7, rng.range(0.15, 0.5) + (mod.key === 'wind' ? 0.25 : 0));
  const angle = Math.round(rng.range(-180, 180));
  def.windShifts = base.windShifts?.map((s) => ({ ...s, angle: s.angle + angle })) ?? undefined;

  // random fire starts: flammable, walkable-ish cells away from the truck
  const p = parseLevel(base);
  const truck = p.ents.find((e) => e.type === 'truck')!;
  const cands: number[] = [];
  for (let i = 0; i < p.W * p.H; i++) {
    const m = MATS[p.mat[i]];
    if (m.flam <= 0.45) continue;
    const x = (i % p.W) + 0.5;
    const z = Math.floor(i / p.W) + 0.5;
    const d2 = Math.hypot(x - truck.cx, z - truck.cz);
    if (d2 < 8 || d2 > base.hose + 6) continue;
    cands.push(i);
  }
  const n = mod.key === 'double' ? 3 : 2;
  const extra: number[] = [];
  for (let k = 0; k < n && cands.length; k++) {
    const c = cands[Math.floor(rng.next() * cands.length)];
    extra.push(c);
    if (c + 1 < p.W * p.H) extra.push(c + 1);
  }
  // keep the level's own start too, so the daily always opens with action
  const opts: SimOptions = {
    seed: hashString(key) + salt,
    hoseDelta: mod.key === 'short' ? -3 : 0,
    windOverride: { angle, strength },
    extraFires: extra,
  };
  return { num, key, def, opts, mod };
}
