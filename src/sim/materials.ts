// Cell materials. Numbers are tuned with the difficulty bot (tools/bot.ts).
export const M = {
  Grass: 0,
  Dry: 1,
  Leaves: 2,
  Dirt: 3,
  Road: 4,
  Stone: 5,
  Concrete: 6,
  Sand: 7,
  Water: 8,
  Wood: 9,
  Oil: 10,
  Building: 11,
  Tree: 12,
  Hay: 13,
  Hedge: 14,
  Fence: 15,
  Vehicle: 16,
  Stall: 17,
  Pallet: 18,
  Block: 19,
  Thatch: 20,
  Elec: 21,
  // v2
  Slick: 22, // burning fuel floating on the water (the docks): drifts with the wind, only foam puts it out
  Rail: 23, // railway track (rail yard): gravel and sleepers, trains cross it
  Hull: 24, // wooden fishing boats and freight wagons: catch easier than a car and burn longer
  Office: 25, // downtown towers: floors full of paper and furniture, the fire runs along the block
  Snow: 26, // the ski lodge: deep snow, nothing burns
  Ice: 27, // the ski lodge: frozen ground, you slide on it
  Carpet: 28, // the museum: carpets and rugs, the fire runs along them
  TallGrass: 29, // the campground: tall dry grass, the fastest fire of the game
  Timber: 30, // the ski lodge: log chalets, they catch easier than a brick house, burn fast and throw embers
} as const;
export type MatId = (typeof M)[keyof typeof M];

export interface MatDef {
  key: string;
  flam: number; // how easily it catches (0 = never)
  fuel: number; // how much there is to burn
  burn: number; // fuel consumed per second at full intensity
  heatOut: number; // heat radiated to neighbours
  ember: number; // embers per second at full intensity
  value: number; // worth of the cell for the "saved" score
  walk: boolean;
  oil?: boolean;
}

export const MATS: MatDef[] = [];
function def(id: number, d: MatDef) {
  MATS[id] = d;
}
def(M.Grass, { key: 'grass', flam: 0.45, fuel: 0.6, burn: 0.11, heatOut: 0.8, ember: 0, value: 1, walk: true });
def(M.Dry, { key: 'dry', flam: 0.85, fuel: 0.7, burn: 0.11, heatOut: 1.0, ember: 0.015, value: 1, walk: true });
def(M.Leaves, { key: 'leaves', flam: 0.68, fuel: 0.5, burn: 0.12, heatOut: 0.85, ember: 0.01, value: 1, walk: true });
def(M.Dirt, { key: 'dirt', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: true });
def(M.Road, { key: 'road', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: true });
def(M.Stone, { key: 'stone', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: true });
def(M.Concrete, { key: 'concrete', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: true });
def(M.Sand, { key: 'sand', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: true });
def(M.Water, { key: 'water', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: false });
def(M.Wood, { key: 'wood', flam: 0.7, fuel: 1.0, burn: 0.055, heatOut: 1.1, ember: 0.03, value: 2, walk: true });
def(M.Oil, { key: 'oil', flam: 1.0, fuel: 1.0, burn: 0.045, heatOut: 1.3, ember: 0, value: 2, walk: true, oil: true });
def(M.Building, { key: 'building', flam: 0.35, fuel: 1.4, burn: 0.035, heatOut: 1.2, ember: 0.05, value: 6, walk: false });
def(M.Tree, { key: 'tree', flam: 0.6, fuel: 1.2, burn: 0.045, heatOut: 1.3, ember: 0.08, value: 3, walk: false });
def(M.Hay, { key: 'hay', flam: 1.0, fuel: 1.0, burn: 0.07, heatOut: 1.6, ember: 0.22, value: 2, walk: false });
def(M.Hedge, { key: 'hedge', flam: 0.7, fuel: 0.8, burn: 0.07, heatOut: 1.0, ember: 0.03, value: 2, walk: false });
def(M.Fence, { key: 'fence', flam: 0.5, fuel: 0.6, burn: 0.06, heatOut: 0.7, ember: 0, value: 1, walk: false });
def(M.Vehicle, { key: 'vehicle', flam: 0.3, fuel: 1.0, burn: 0.04, heatOut: 1.3, ember: 0, value: 8, walk: false });
def(M.Stall, { key: 'stall', flam: 0.8, fuel: 1.0, burn: 0.05, heatOut: 1.2, ember: 0.05, value: 4, walk: false });
def(M.Pallet, { key: 'pallet', flam: 0.85, fuel: 1.0, burn: 0.06, heatOut: 1.3, ember: 0.08, value: 2, walk: false });
def(M.Block, { key: 'block', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: false });
def(M.Thatch, { key: 'thatch', flam: 1.0, fuel: 0.9, burn: 0.06, heatOut: 1.4, ember: 0.15, value: 4, walk: false });
def(M.Elec, { key: 'elec', flam: 0.4, fuel: 2.5, burn: 0.03, heatOut: 1.1, ember: 0.04, value: 6, walk: false });
// Oil on the sea: worth nothing itself, but it carries the fire to the boats and the wooden pier
def(M.Slick, { key: 'slick', flam: 1.0, fuel: 1.6, burn: 0.035, heatOut: 1.35, ember: 0, value: 0, walk: false, oil: true });
def(M.Hull, { key: 'hull', flam: 0.5, fuel: 1.2, burn: 0.045, heatOut: 1.3, ember: 0.04, value: 6, walk: false });
def(M.Office, { key: 'office', flam: 0.28, fuel: 1.4, burn: 0.035, heatOut: 1.2, ember: 0.05, value: 6, walk: false });
def(M.Snow, { key: 'snow', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: true });
def(M.Ice, { key: 'ice', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: true });
def(M.Carpet, { key: 'carpet', flam: 0.6, fuel: 0.7, burn: 0.07, heatOut: 0.95, ember: 0.01, value: 1, walk: true });
def(M.TallGrass, { key: 'tallgrass', flam: 1.0, fuel: 0.5, burn: 0.14, heatOut: 1.2, ember: 0.03, value: 1, walk: true });
def(M.Timber, { key: 'timber', flam: 0.55, fuel: 1.1, burn: 0.05, heatOut: 1.35, ember: 0.1, value: 6, walk: false });
def(M.Rail, { key: 'rail', flam: 0, fuel: 0, burn: 0, heatOut: 0, ember: 0, value: 0, walk: true });

export function isFlammable(m: number): boolean {
  return MATS[m].flam > 0;
}
