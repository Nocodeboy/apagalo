/** Texts are written in Spanish and English ({@link Txt}); the other languages come from the locale dictionaries. */
export type Lang = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it';
export type Txt = { es: string; en: string };

/** Scenario of a level: its look (render/themes.ts) and, for the new ones, its star mechanic (docs/diseno-v2.md). */
export type ThemeId = 'plaza' | 'granja' | 'gasolinera' | 'poligono' | 'castanar' | 'sanjuan' | 'puerto' | 'ciudad' | 'estacion' | 'nieve' | 'museo' | 'camping';

/** Pick-ups that appear on the ground during a level (one at a time). */
export type PowerKind = 'turbo' | 'boots' | 'clock' | 'extinguisher' | 'heli' | 'suit';
export const POWER_KINDS: PowerKind[] = ['turbo', 'boots', 'clock', 'extinguisher', 'heli', 'suit'];

/** Surprise events, announced with a banner a few seconds before. */
export type EventKind = 'neighbors' | 'rain' | 'gust' | 'pressure' | 'leak' | 'onlookers' | 'blackout';
export const EVENT_KINDS: EventKind[] = ['neighbors', 'rain', 'gust', 'pressure', 'leak', 'onlookers', 'blackout'];

/** Crew members the player hires in the shop and takes to a level. */
export type CrewId = 'partner' | 'dog' | 'drone';
export const CREW_IDS: CrewId[] = ['partner', 'dog', 'drone'];

export interface WindShift {
  t: number; // seconds since start
  angle: number; // degrees, direction the wind blows TOWARDS (0 = +x/east, 90 = +z/south on screen)
  strength: number; // 0..1
}

export interface LevelEvent {
  kind: EventKind;
  /** seconds since the start of the level (the warning comes 3 s before) */
  t: number;
}

/** A railway track (rail yard): two rows of rail cells from `z`, a train crossing the map every `every` seconds. */
export interface TrainDef {
  z: number;
  /** +1: from west to east, -1: from east to west */
  dir: 1 | -1;
  first: number;
  every: number;
  /** length in cells (default 11) */
  len?: number;
  /** cells per second (default 13) */
  speed?: number;
}

/** What a level brings for the first time (shown on its intro screen). */
export interface News {
  kind: 'place' | 'power' | 'event' | 'crew' | 'big' | 'tool';
  id: string;
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
  /** rail yard: trains crossing the map */
  trains?: TrainDef[];
  /** big fire (every 10 levels): its first win prints a newspaper front page with this headline */
  big?: boolean;
  headline?: Txt;
  /** events this level wants if the route gives it any (e.g. a blackout for a night in the city) */
  wantEvents?: EventKind[];
  /** events this level always has, wherever it lands in the route (they are part of its design: the blizzard's
   *  blackout, the gala's guests); used instead of the route's own pick. Never in an intro or before level 8. */
  fixedEvents?: LevelEvent[];
  /** campground: the helicopter is always on call, ready again this many seconds after each drop */
  heliEvery?: number;
  /** museum: sprinkler zones, each switched on (once) by pulling the lever at `lever` (cell x, z); `area` is x, z, w, h */
  sprinklers?: { lever: [number, number]; area: [number, number, number, number] }[];
  // ---- set by the route (src/sim/levels.ts), not by the level files ----
  /** first level of a scenario: calm, no events nor power-ups */
  intro?: boolean;
  /** power-ups that can appear, and the one that comes first (the level that introduces it) */
  powerups?: PowerKind[];
  powerFirst?: PowerKind;
  events?: LevelEvent[];
  news?: News[];
  /** crew slots on this level (0 before the crew unlocks) */
  crewSlots?: number;
  /** 2.2: the Pulaski (dig firebreaks) is at hand */
  dig?: boolean;
  /** how fast the fire spreads compared with the base game (a gentle ramp along the second half of the route) */
  spread?: number;
}

/** Night levels: flagged, or in a place that is always at night (the beach on Midsummer night, the ski lodge, the
 *  museum after closing time). */
export function isNight(d: { night?: boolean; theme: ThemeId }): boolean {
  return !!d.night || d.theme === 'sanjuan' || d.theme === 'nieve' || d.theme === 'museo';
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
  | 'bystander'
  // v2: the docks, downtown and the rail yard
  | 'boat'
  | 'container'
  | 'seapump'
  | 'crane'
  | 'post'
  | 'tower'
  | 'window'
  | 'wagon'
  | 'canopy'
  // v2: the ski lodge, the museum and the campground
  | 'wall'
  | 'art'
  | 'exit'
  | 'tent'
  | 'rv'
  | 'chalet'
  // v2: spawned by events
  | 'leak'
  | 'onlooker'
  | 'neighbor';

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
  state: number; // generic: rescuee 0 idle / 1 rescued / 2 fled / 3 not there yet (events); cylinder 0 ok / 1 exploded; elec 1 live / 0 off; lever 0 up / 1 pulled; leak 3 dormant / 0 leaking / 1 exploded / 2 fixed; art 0 on show / 1 carried out / 2 burnt / 4 in the player's arms; hydrant (ski lodge) 0 frozen / 1 thawed
  t: number; // timers (danger for rescuees, pressure for cylinders and leaks)
  soakCd: number;
  alert: number; // 0..1 how close the fire is (rescuees) / pressure (cylinders)
  orient: number; // 0 = facing +z, 1 = facing +x (for fences/cars)
  /** progress of a rescue that takes time (people at windows: the platform goes up) */
  prog: number;
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
  | 'lose'
  // v2
  | 'powerSpawn'
  | 'powerup'
  | 'powerGone'
  | 'buffEnd'
  | 'heliCall'
  | 'heliDrop'
  | 'eventWarn'
  | 'eventStart'
  | 'eventEnd'
  | 'leakFixed'
  | 'bucket'
  | 'trainWarn'
  | 'trainHit'
  | 'hoseCut'
  | 'hoseFixed'
  | 'pumpFoam'
  | 'droneDrop'
  // v2, entrega 2
  | 'ice'
  | 'frozen'
  | 'artPick'
  | 'heliReady'
  | 'sprinkler'
  | 'deepSnow'
  // 2.2: the portable extinguisher
  | 'hoseDrop'
  | 'hosePick'
  | 'extEmpty'
  | 'needHose'
  | 'dug';

export interface SimEvent {
  type: SimEventType;
  x: number;
  z: number;
  n?: number;
  ent?: number;
  /** extra: power-up / event kind, or who did it ('dog', 'partner') */
  k?: string;
}

export interface SimInput {
  mx: number;
  mz: number;
  ax: number; // aim direction (unit) — 0,0 keeps last aim
  az: number;
  aimDist: number; // <=0 -> max range of nozzle
  spray: boolean;
  nozzle: 0 | 1 | 2; // 0 jet, 1 fog, 2 foam
  /** call the helicopter now (if a charge is ready) */
  heli?: boolean;
  /** use the portable extinguisher (while it has charge): the hose is dropped where you stand */
  ext?: boolean;
  /** hold the Pulaski: dig a firebreak in the vegetation in front (levels that have it) */
  dig?: boolean;
}

export const NOZZLES = [
  { key: 'jet', rate: 46, pow: 1, vh: 13, spread: 0.035, minR: 1.5, maxR: 9.5, slow: 0.72 },
  { key: 'fog', rate: 120, pow: 0.42, vh: 7, spread: 0.5, minR: 1.0, maxR: 3.4, slow: 0.9 },
  { key: 'foam', rate: 40, pow: 1.1, vh: 9, spread: 0.12, minR: 1.2, maxR: 6.0, slow: 0.8 },
] as const;
