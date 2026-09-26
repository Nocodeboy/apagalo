export type Lang = 'es' | 'en';
export type Txt = { es: string; en: string };

export type ThemeId = 'plaza' | 'granja' | 'gasolinera' | 'poligono' | 'castanar' | 'sanjuan';

export interface WindShift {
  t: number; // seconds since start
  angle: number; // degrees, direction the wind blows TOWARDS (0 = +x/east, 90 = +z/south on screen)
  strength: number; // 0..1
}

export interface LevelDef {
  id: string;
  num: number;
  name: Txt;
  tip: Txt;
  theme: ThemeId;
  map: string[];
  fires?: Record<number, string>; // row -> string with 'X' where a cell starts burning
  under?: string; // ground char under rescuees/bystanders (default '.')
  time: number;
  hose: number;
  wind: { angle: number; strength: number };
  windShifts?: WindShift[];
  stars: [number, number]; // saved ratio for 2 and 3 stars
  minSaved: number; // below this saved ratio the fire is out of control -> lose
  foam?: number; // seconds of foam
  fireworks?: { count: number; first: number; every: number };
  night?: boolean;
}

export type EntType =
  | 'house'
  | 'barn'
  | 'stall'
  | 'churros'
  | 'warehouse'
  | 'shop'
  | 'church'
  | 'car'
  | 'truck'
  | 'chiringuito'
  | 'cabin'
  | 'fountain'
  | 'tree'
  | 'pine'
  | 'palm'
  | 'hedge'
  | 'fence'
  | 'hay'
  | 'pallet'
  | 'bench'
  | 'lamp'
  | 'rock'
  | 'hydrant'
  | 'elec'
  | 'lever'
  | 'cylinder'
  | 'pump'
  | 'umbrella'
  | 'bonfire'
  | 'cat'
  | 'dog'
  | 'sheep'
  | 'goat'
  | 'person'
  | 'bystander';

export interface Ent {
  id: number;
  type: EntType;
  x: number; // cell of top-left corner
  z: number;
  w: number;
  h: number;
  cells: number[];
  cx: number; // world centre
  cz: number;
  height: number;
  variant: number;
  // behaviour state
  state: number; // generic: rescuee 0 idle / 1 rescued / 2 fled; cylinder 0 ok / 1 exploded; elec 1 live / 0 off; lever 0 up / 1 pulled
  t: number; // timers (danger for rescuees, pressure for cylinders)
  soakCd: number;
  alert: number; // 0..1 how close the fire is (rescuees) / pressure (cylinders)
  orient: number; // 0 = facing +z, 1 = facing +x (for fences/cars)
}

export type SimEventType =
  | 'extinguish'
  | 'ignite'
  | 'clusterOut'
  | 'flare'
  | 'explode'
  | 'rescue'
  | 'fled'
  | 'short'
  | 'soak'
  | 'connect'
  | 'overheat'
  | 'windWarn'
  | 'windShift'
  | 'rocket'
  | 'rocketHit'
  | 'fizzle'
  | 'powerOff'
  | 'cylinderWarn'
  | 'combo'
  | 'hose'
  | 'foamEmpty'
  | 'win'
  | 'lose';

export interface SimEvent {
  type: SimEventType;
  x: number;
  z: number;
  n?: number;
  ent?: number;
}

export interface SimInput {
  mx: number;
  mz: number;
  ax: number; // aim direction (unit) — 0,0 keeps last aim
  az: number;
  aimDist: number; // <=0 -> max range of nozzle
  spray: boolean;
  nozzle: 0 | 1 | 2; // 0 jet, 1 fog, 2 foam
}

export const NOZZLES = [
  { key: 'jet', rate: 46, pow: 1, vh: 13, spread: 0.035, minR: 1.5, maxR: 9.5, slow: 0.72 },
  { key: 'fog', rate: 120, pow: 0.42, vh: 7, spread: 0.5, minR: 1.0, maxR: 3.4, slow: 0.9 },
  { key: 'foam', rate: 40, pow: 1.1, vh: 9, spread: 0.12, minR: 1.2, maxR: 6.0, slow: 0.8 },
] as const;
