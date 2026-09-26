import type { LevelDef } from './types';

/** Builds a level from its settings and a map drawn with MB (`b.done()`). `num` is assigned by the campaign order. */
export function L(d: Omit<LevelDef, 'map' | 'fires' | 'num'> & { num?: number }, m: { map: string[]; fires: Record<number, string> }): LevelDef {
  return { num: 0, ...d, map: m.map, fires: m.fires };
}
