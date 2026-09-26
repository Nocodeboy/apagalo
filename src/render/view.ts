import * as THREE from 'three';
import { MATS } from '../sim/materials';
import { RESCUE_TYPES } from '../sim/parse';
import type { Ent, EntType, SimEvent } from '../sim/types';
import type { Sim } from '../sim/world';
import { flameGeometry } from './geo';
import { Ground } from './ground';
import { Hose } from './hose';
import { characterMesh, entityModel, heroRig, leverHandle, truckGroup, type HeroRig } from './models';
import { FxList, Particles } from './particles';
import type { Theme } from './themes';

const TALL: Partial<Record<EntType, number>> = {
  tree: 1.9,
  pine: 2.0,
  palm: 2.6,
  house: 2.2,
  church: 3.2,
  barn: 2.4,
  warehouse: 2.6,
  shop: 1.9,
  cabin: 1.8,
  stall: 1.3,
  churros: 1.3,
  chiringuito: 1.6,
  car: 0.9,
  hay: 0.7,
  hedge: 0.6,
  fence: 0.5,
  pallet: 0.7,
  elec: 1.0,
  umbrella: 1.7,
  bonfire: 0.25,
  bench: 0.4,
};
const BIG_FLAME: Partial<Record<EntType, number>> = {
  house: 1.45,
  church: 1.6,
  barn: 1.5,
  warehouse: 1.5,
  shop: 1.35,
  cabin: 1.35,
  tree: 1.25,
  pine: 1.3,
  palm: 1.1,
  stall: 1.2,
  churros: 1.2,
  chiringuito: 1.35,
  car: 1.15,
  hay: 1.3,
  bonfire: 1.5,
  pallet: 1.15,
};
const DARK_SMOKE = new Set<EntType>(['car', 'house', 'barn', 'warehouse', 'shop', 'elec', 'church', 'cabin']);

function hash(i: number): number {
  let h = i * 374761393;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

interface PropInst {
  mesh: THREE.InstancedMesh;
  idx: number;
  ent: Ent;
  base: THREE.Matrix4;
  burnable: boolean;
  collapsed: number;
}

interface CharView {
  ent: Ent;
  obj: THREE.Group;
  t: number;
  mode: 'idle' | 'saved' | 'fled';
  vx: number;
  vz: number;
  hop: number;
}

export interface Label {
  x: number;
  y: number;
  z: number;
  kind: 'alert' | 'pressure' | 'lever' | 'hydrant' | 'rocket';
  v: number;
  ent?: number;
}

export class LevelView {
  readonly group = new THREE.Group();
  readonly ground: Ground;
  readonly hero: HeroRig;
  private hose: Hose;
  private props: PropInst[] = [];
  private propByEnt = new Map<number, PropInst>();
  private chars: CharView[] = [];
  private cylinders = new Map<number, THREE.Object3D>();
  private levers = new Map<number, THREE.Mesh>();
  private truckLights: THREE.Mesh[] = [];
  private flames: THREE.InstancedMesh;
  private glow = new Particles(1400, { additive: true, soft: 0.0 });
  private smokeP = new Particles(1500, { soft: 0.15 });
  private waterP = new Particles(1400, { soft: 0.35 });
  private sparkP = new Particles(900, { additive: true, soft: 0.2 });
  private smoke = new FxList(900);
  private steam = new FxList(300);
  private splash = new FxList(400);
  private sparks = new FxList(700);
  private lights: THREE.PointLight[] = [];
  private lightTargets: { x: number; z: number; k: number }[] = [];
  private hydrantRings = new Map<number, THREE.Mesh>();
  private rocketRings: THREE.Mesh[] = [];
  private shock: { mesh: THREE.Mesh; t: number }[] = [];
  private m = new THREE.Matrix4();
  private m2 = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private v = new THREE.Vector3();
  private s = new THREE.Vector3();
  private col = new THREE.Color();
  private legYaw = 0;
  private aimYaw = 0;
  private walkPh = 0;
  private lastAnchor = -1;
  private smokeAcc = 0;
  labels: Label[] = [];
  centers: { x: number; z: number; k: number }[] = [];
  shake = 0;
  flash = 0;

  private tier: 'high' | 'medium' | 'low' = 'high';
  private smokeRate = 1;
  private groundT = 0;
  private hoseMat: THREE.MeshLambertMaterial;
  private hoseCream = new THREE.Color(0xf3e3bf);
  private hoseTaut = new THREE.Color(0xff8a3a);

  constructor(
    private sim: Sim,
    private theme: Theme,
    tier: 'high' | 'medium' | 'low' = 'high',
  ) {
    this.ground = new Ground(sim, theme);
    this.group.add(this.ground.mesh, this.ground.outside);
    this.buildProps();
    this.buildOutside();
    this.buildBunting();

    this.hero = heroRig();
    this.group.add(this.hero.root);
    // x-ray silhouettes: visible only where something (a tree, a roof) hides the character
    const silHero = new THREE.MeshBasicMaterial({ color: 0x8fdcff, transparent: true, opacity: 0.6, depthWrite: false, depthFunc: THREE.GreaterDepth });
    const silChar = new THREE.MeshBasicMaterial({ color: 0xffc04a, transparent: true, opacity: 0.55, depthWrite: false, depthFunc: THREE.GreaterDepth });
    const addSil = (root: THREE.Object3D, mat: THREE.Material) => {
      const meshes: THREE.Mesh[] = [];
      root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
      });
      for (const m of meshes) {
        const sm = new THREE.Mesh(m.geometry, mat);
        sm.renderOrder = 20;
        m.add(sm);
      }
    };
    // Order: environment (opaque) -> silhouettes (only where the environment is in front) -> the character itself.
    // Drawing the character after its silhouette avoids self-occlusion (arms showing the torso's x-ray).
    const late = (root: THREE.Object3D) =>
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || m.material === silHero || m.material === silChar) return;
        (m.material as THREE.Material).transparent = true;
        m.renderOrder = 21;
      });
    addSil(this.hero.root, silHero);
    late(this.hero.root);
    for (const c of this.chars)
      if (c.ent.type !== 'bystander') {
        addSil(c.obj, silChar);
        late(c.obj);
      }
    this.hose = new Hose(sim);
    this.hoseMat = this.hose.mesh.material as THREE.MeshLambertMaterial;
    this.group.add(this.hose.mesh);

    const fgeo = flameGeometry();
    this.flames = new THREE.InstancedMesh(fgeo, new THREE.MeshBasicMaterial({ vertexColors: true }), 3200);
    this.flames.count = 0;
    this.flames.frustumCulled = false;
    this.flames.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(3200 * 3), 3);
    this.group.add(this.flames);
    this.group.add(this.smokeP.points, this.glow.points, this.waterP.points, this.sparkP.points);
    this.smokeP.points.renderOrder = 2;
    this.glow.points.renderOrder = 3;
    this.waterP.points.renderOrder = 4;
    this.sparkP.points.renderOrder = 5;

    const nl = theme.night ? 4 : 3;
    for (let k = 0; k < nl; k++) {
      const l = new THREE.PointLight(0xff8a3a, 0, 16, 1.4);
      l.position.set(0, 2.2, 0);
      this.group.add(l);
      this.lights.push(l);
      this.lightTargets.push({ x: 0, z: 0, k: 0 });
    }
    this.setTier(tier);
  }

  /** Scale the expensive bits (fire lights, particle budgets) to the rendering tier. */
  setTier(t: 'high' | 'medium' | 'low') {
    this.tier = t;
    const night = this.theme.night;
    const nLights = t === 'high' ? this.lights.length : t === 'medium' ? 2 : night ? 1 : 0;
    this.lights.forEach((l, i) => (l.visible = i < nLights));
    const k = t === 'high' ? 1 : t === 'medium' ? 0.6 : 0.3;
    this.smoke.cap = Math.round(900 * k);
    this.steam.cap = Math.round(300 * Math.max(0.5, k));
    this.sparks.cap = Math.round(700 * Math.max(0.45, k));
    this.splash.cap = Math.round(400 * Math.max(0.45, k));
    this.smokeRate = t === 'high' ? 1 : t === 'medium' ? 0.7 : 0.45;
  }

  // ---------- construction ----------
  private buildProps() {
    const s = this.sim;
    const groups = new Map<string, Ent[]>();
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
    for (const e of s.ents) {
      if (RESCUE_TYPES.has(e.type) || e.type === 'bystander') {
        const obj = characterMesh(e.type, e.variant);
        obj.position.set(e.cx, 0, e.cz);
        obj.rotation.y = hash(e.id) * Math.PI * 2;
        this.group.add(obj);
        this.chars.push({ ent: e, obj, t: hash(e.id) * 10, mode: 'idle', vx: 0, vz: 0, hop: 0 });
        continue;
      }
      if (e.type === 'truck') {
        const tg = truckGroup();
        tg.group.position.set(e.cx, 0, e.cz);
        tg.group.rotation.y = e.w >= e.h ? 0 : Math.PI / 2;
        this.group.add(tg.group);
        this.truckLights = tg.lights;
        continue;
      }
      if (e.type === 'cylinder') {
        const spec = entityModel('cylinder', 1, 1, e.variant, 0, this.theme)!;
        const mesh = new THREE.Mesh(spec.geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
        mesh.castShadow = true;
        mesh.position.set(e.cx, 0, e.cz);
        this.group.add(mesh);
        this.cylinders.set(e.id, mesh);
        continue;
      }
      if (e.type === 'lever') {
        const h = leverHandle();
        h.position.set(e.cx, 1.0, e.cz + 0.18);
        h.rotation.z = 0.7;
        this.group.add(h);
        this.levers.set(e.id, h);
      }
      if (e.type === 'hydrant') {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.2, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(e.cx, 0.04, e.cz);
        this.group.add(ring);
        this.hydrantRings.set(e.id, ring);
      }
      const vb = e.type === 'tree' || e.type === 'pine' || e.type === 'palm' ? e.variant % 4 : e.variant % 3;
      const key = `${e.type}:${e.w}x${e.h}:${vb}:${e.orient}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    for (const [, ents] of groups) {
      const e0 = ents[0];
      const spec = entityModel(e0.type, e0.w, e0.h, e0.variant, e0.orient, this.theme);
      if (!spec) continue;
      const mesh = new THREE.InstancedMesh(spec.geo, mat, ents.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(ents.length * 3).fill(1), 3);
      ents.forEach((e, idx) => {
        const rot = e0.type === 'tree' || e0.type === 'pine' || e0.type === 'palm' || e0.type === 'hay' ? spec.rotY + hash(e.id) * 6 : spec.rotY;
        const base = new THREE.Matrix4().compose(new THREE.Vector3(e.cx, 0, e.cz), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), new THREE.Vector3(1, 1, 1));
        mesh.setMatrixAt(idx, base);
        const burnable = e.cells.some((c) => this.sim.fuel0[c] > 0);
        const pi: PropInst = { mesh, idx, ent: e, base, burnable, collapsed: 0 };
        this.props.push(pi);
        this.propByEnt.set(e.id, pi);
      });
      this.group.add(mesh);
    }
  }

  private buildOutside() {
    const s = this.sim;
    const t = this.theme;
    const rnd = (() => {
      let k = s.def.num * 999 + 17;
      return () => {
        k = (Math.imul(k, 1664525) + 1013904223) >>> 0;
        return k / 4294967296;
      };
    })();
    const pts: [number, number][] = [];
    const dense = s.def.theme === 'castanar' ? 3 : 1;
    const n = Math.round((s.W + s.H) * 1.6 * dense);
    for (let k = 0; k < n; k++) {
      const side = Math.floor(rnd() * 4);
      const d = 1.5 + rnd() * (dense > 1 ? 14 : 10);
      let x = 0;
      let z = 0;
      if (side === 0) {
        x = rnd() * (s.W + 20) - 10;
        z = -d;
        if (t.outsideNorthWater) continue;
      } else if (side === 1) {
        x = rnd() * (s.W + 20) - 10;
        z = s.H + d;
      } else if (side === 2) {
        x = -d;
        z = rnd() * (s.H + 20) - 10;
      } else {
        x = s.W + d;
        z = rnd() * (s.H + 20) - 10;
      }
      if (t.outsideNorthWater && z < 6) continue;
      pts.push([x, z]);
    }
    const kinds: EntType[] = s.def.theme === 'sanjuan' ? ['palm', 'pine'] : s.def.theme === 'poligono' ? ['pine', 'tree'] : s.def.theme === 'castanar' ? ['tree', 'tree', 'pine'] : ['tree', 'tree', 'pine'];
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    for (let ki = 0; ki < kinds.length; ki++) {
      const mine = pts.filter((_, i) => i % kinds.length === ki);
      if (!mine.length) continue;
      const spec = entityModel(kinds[ki], 1, 1, ki * 3 + 1, 0, t)!;
      const mesh = new THREE.InstancedMesh(spec.geo, mat, mine.length);
      mine.forEach(([x, z], i) => {
        const sc = 0.9 + rnd() * 0.5;
        this.m.compose(this.v.set(x, 0, z), this.q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6), this.s.set(sc, sc, sc));
        mesh.setMatrixAt(i, this.m);
      });
      mesh.castShadow = false;
      this.group.add(mesh);
    }
    // a few neighbouring houses for village-like maps
    if (['plaza', 'sanjuan', 'gasolinera', 'granja'].includes(s.def.theme)) {
      const spec = entityModel('house', 4, 4, 1, 0, t)!;
      const spots: [number, number][] = [];
      for (let x = -6; x < s.W + 6; x += 6) spots.push([x, s.H + 5 + (x % 3)]);
      for (let z = 2; z < s.H; z += 7) {
        spots.push([-5.5, z]);
        spots.push([s.W + 5.5, z]);
      }
      const mesh = new THREE.InstancedMesh(spec.geo, mat, spots.length);
      spots.forEach(([x, z], i) => {
        this.m.compose(this.v.set(x, 0, z), this.q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), x < 0 ? Math.PI / 2 : x > s.W ? -Math.PI / 2 : 0), this.s.set(1, 1, 1));
        mesh.setMatrixAt(i, this.m);
      });
      this.group.add(mesh);
    }
  }

  private buildBunting() {
    const lamps = this.sim.ents.filter((e) => e.type === 'lamp');
    const rows = new Map<number, Ent[]>();
    for (const l of lamps) {
      if (!rows.has(l.z)) rows.set(l.z, []);
      rows.get(l.z)!.push(l);
    }
    const flags: { x: number; y: number; z: number; c: number }[] = [];
    const colors = [0xe2413a, 0xf2c21a, 0x2f7bd8, 0x3aa35a, 0xf5f2ea, 0xe06aa0];
    for (const [, ls] of rows) {
      ls.sort((a, b) => a.x - b.x);
      for (let k = 0; k < ls.length - 1; k++) {
        const a = ls[k];
        const b = ls[k + 1];
        const len = b.cx - a.cx;
        const n = Math.floor(len / 0.55);
        for (let i = 1; i < n; i++) {
          const t = i / n;
          flags.push({ x: a.cx + len * t, y: 3.05 - Math.sin(t * Math.PI) * 0.9, z: a.cz, c: colors[i % colors.length] });
        }
      }
    }
    if (!flags.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.2, 0, 0, 0.2, 0, 0, 0, -0.38, 0], 3));
    g.computeVertexNormals();
    const mesh = new THREE.InstancedMesh(g, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), flags.length);
    flags.forEach((f, i) => {
      this.m.makeTranslation(f.x, f.y, f.z);
      mesh.setMatrixAt(i, this.m);
      mesh.setColorAt(i, this.col.setHex(f.c));
    });
    this.group.add(mesh);
    // the string
    const pts = flags.map((f) => new THREE.Vector3(f.x, f.y + 0.02, f.z));
    const lg = new THREE.BufferGeometry().setFromPoints(pts);
    this.group.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x444444 })));
  }

  // ---------- per-frame ----------
  anchorVisual(): { x: number; y: number; z: number } {
    const s = this.sim;
    const a = s.anchorPoint(s.player.anchor);
    const e = s.ents[s.player.anchor];
    return { x: a.x, y: e.type === 'hydrant' ? 0.55 : 0.9, z: a.z };
  }

  update(dt: number, time: number, cam: THREE.Camera, pxScale: number) {
    const s = this.sim;
    this.groundT += dt;
    if (this.groundT >= 1 / 30 || dt === 0) {
      this.groundT = 0;
      this.ground.update(time);
    }
    this.updateHero(dt, time);
    this.updateHose(dt);
    this.updateProps(dt, time);
    this.updateChars(dt, time);
    this.lastScale = pxScale;
    this.updateFire(dt, time);
    this.glow.end(pxScale);
    this.updateWater(dt);
    this.updateRockets(dt, time);
    this.updateLights(dt);
    // truck lights
    const blink = Math.floor(time * 5) % 2;
    this.truckLights.forEach((l, i) => ((l.material as THREE.MeshBasicMaterial).color.setHex((i + blink) % 2 ? 0x2f7bff : 0x0b1a3a)));
    // hydrant rings
    for (const [id, ring] of this.hydrantRings) {
      const active = s.player.anchor === id;
      const mat = ring.material as THREE.MeshBasicMaterial;
      const connecting = s.player.connectEnt === id ? s.player.connectT / 0.6 : 0;
      mat.color.setHex(active ? 0x5cff8a : connecting > 0 ? 0xffe066 : 0xffffff);
      mat.opacity = active ? 0.7 : 0.35 + 0.25 * Math.sin(time * 4) + connecting * 0.4;
      ring.scale.setScalar(1 + connecting * 0.3);
    }
    // shockwaves
    this.shock = this.shock.filter((sh) => {
      sh.t += dt;
      const k = sh.t / 0.6;
      sh.mesh.scale.setScalar(1 + k * 7);
      (sh.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 * (1 - k));
      if (k >= 1) {
        this.group.remove(sh.mesh);
        return false;
      }
      return true;
    });
    this.flash = Math.max(0, this.flash - dt * 3);
    this.shake = Math.max(0, this.shake - dt * 2.2);

    // particles
    this.smoke.update(dt);
    this.steam.update(dt);
    this.splash.update(dt);
    this.sparks.update(dt);
    this.smokeP.begin();
    this.smoke.draw(this.smokeP, 0.15);
    this.steam.draw(this.smokeP, 0.1);
    this.smokeP.end(pxScale);
    this.sparkP.begin();
    this.sparks.draw(this.sparkP, 0.01);
    for (const e of s.embers) this.sparkP.push(e.x, e.y, e.z, 0.16 + Math.random() * 0.06, 1, 0.55 + Math.random() * 0.3, 0.15, 1);
    this.sparkP.end(pxScale);
    this.labelsUpdate(time);
    void cam;
  }

  private updateHero(dt: number, time: number) {
    const s = this.sim;
    const p = s.player;
    const h = this.hero;
    h.root.position.set(p.x, 0, p.z);
    const sp = Math.hypot(p.vx, p.vz);
    const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
    const aim = Math.atan2(p.aimZ, p.aimX);
    const k = 1 - Math.exp(-14 * dt);
    this.aimYaw += wrap(aim - this.aimYaw) * k;
    const legT = sp > 0.4 ? p.face : this.aimYaw;
    this.legYaw += wrap(legT - this.legYaw) * (1 - Math.exp(-10 * dt));
    // keep torso twist within reach, like the reference rig: legs follow when needed
    let tw = wrap(this.aimYaw - this.legYaw);
    if (Math.abs(tw) > 1.5) {
      this.legYaw += (tw - Math.sign(tw) * 1.5);
      tw = Math.sign(tw) * 1.5;
    }
    h.hips.rotation.y = -this.legYaw;
    h.torso.rotation.y = -tw;
    const prevPh = this.walkPh;
    this.walkPh += sp * dt * 3.2;
    // footstep dust puffs
    if (sp > 2 && Math.floor(prevPh / Math.PI) !== Math.floor(this.walkPh / Math.PI) && this.tier !== 'low') {
      const back = this.legYaw + Math.PI;
      this.steam.add({ x: p.x + Math.cos(back) * 0.25, y: 0.12, z: p.z + Math.sin(back) * 0.25, vy: 0.4, vx: Math.cos(back) * 0.4, vz: Math.sin(back) * 0.4, life: 0.5, s0: 0.25, s1: 0.6, r: 0.78, g: 0.72, b: 0.62, a: 0.35, drag: 2 });
    }
    const sw = Math.sin(this.walkPh) * Math.min(1, sp / 3) * 0.75;
    h.legL.rotation.z = sw;
    h.legR.rotation.z = -sw;
    h.hips.position.y = Math.abs(Math.sin(this.walkPh)) * 0.06 * Math.min(1, sp / 3);
    const spray = p.spraying ? 1 : 0;
    h.nozzle.position.x = 0.32 - spray * (0.03 + Math.sin(time * 40) * 0.01);
    h.torso.rotation.z = -spray * 0.06;
    h.armL.rotation.y = -0.35;
    h.armR.rotation.y = 0.35;
    // stun wobble / heat tint
    h.root.rotation.z = p.stun > 0 ? Math.sin(time * 18) * 0.12 : 0;
    const heat = Math.max(0, p.heat - 0.25) / 0.75;
    h.tint.color.setRGB(1 + heat * 0.25, 1 - heat * 0.35, 1 - heat * 0.45);
    if (p.stun > 0 && Math.random() < 0.3) this.sparks.add({ x: p.x + (Math.random() - 0.5) * 0.6, y: 2.0, z: p.z + (Math.random() - 0.5) * 0.6, life: 0.4, s0: 0.2, s1: 0.1, r: 1, g: 0.95, b: 0.4, vy: 0.8 });
  }

  heroHand(): { x: number; y: number; z: number } {
    const p = this.sim.player;
    const back = this.aimYaw + Math.PI;
    return { x: p.x + Math.cos(back) * 0.28, y: 0.85, z: p.z + Math.sin(back) * 0.28 };
  }

  private updateHose(dt: number) {
    const s = this.sim;
    const a = this.anchorVisual();
    const e = this.heroHand();
    if (s.player.anchor !== this.lastAnchor) {
      this.lastAnchor = s.player.anchor;
      this.hose.reset(a.x, a.y, a.z, e.x, e.y, e.z);
    }
    this.hose.update(Math.min(dt, 1 / 30), a.x, a.y, a.z, e.x, e.y, e.z);
    const taut = Math.max(0, (s.player.hoseTaut - 0.9) / 0.1);
    this.hoseMat.color.copy(this.hoseCream).lerp(this.hoseTaut, taut);
  }

  private updateProps(dt: number, time: number) {
    const s = this.sim;
    const dirty = new Set<THREE.InstancedMesh>();
    for (const pi of this.props) {
      if (!pi.burnable) continue;
      let ch = 0;
      let fire = 0;
      let n = 0;
      for (const c of pi.ent.cells) {
        const f0 = s.fuel0[c];
        if (f0 <= 0) continue;
        ch += 1 - s.fuel[c] / f0;
        fire = Math.max(fire, s.fire[c]);
        n++;
      }
      if (!n) continue;
      ch /= n;
      const k = Math.pow(Math.min(1, ch * 1.15), 0.8);
      const glow = fire * (0.5 + 0.5 * Math.sin(time * 9 + pi.ent.id));
      this.col.setRGB(1 - k * 0.78 + glow * 0.25, 1 - k * 0.8 + glow * 0.05, 1 - k * 0.8);
      pi.mesh.setColorAt(pi.idx, this.col);
      const target = ch > 0.92 && fire === 0 ? 1 : 0;
      if (Math.abs(pi.collapsed - target) > 0.001) {
        pi.collapsed += (target - pi.collapsed) * Math.min(1, dt * 3);
        const c = pi.collapsed;
        this.m.copy(pi.base).multiply(this.m2.makeScale(1 - c * 0.12, 1 - c * 0.42, 1 - c * 0.12));
        pi.mesh.setMatrixAt(pi.idx, this.m);
        pi.mesh.instanceMatrix.needsUpdate = true;
      }
      dirty.add(pi.mesh);
    }
    for (const m of dirty) if (m.instanceColor) m.instanceColor.needsUpdate = true;
    // gas bottles shake with pressure
    for (const [id, mesh] of this.cylinders) {
      const e = s.ents[id];
      if (e.state === 1) {
        mesh.visible = false;
        continue;
      }
      const a = e.alert;
      mesh.position.set(e.cx + (a > 0.4 ? (Math.random() - 0.5) * a * 0.12 : 0), 0, e.cz + (a > 0.4 ? (Math.random() - 0.5) * a * 0.12 : 0));
      const mat = (mesh as THREE.Mesh).material as THREE.MeshLambertMaterial;
      const pulse = a > 0.5 ? 0.5 + 0.5 * Math.sin(time * (8 + a * 20)) : 0;
      mat.color.setRGB(1 + pulse * a * 0.6, 1 - pulse * a * 0.5, 1 - pulse * a * 0.5);
      if (a > 0.6 && Math.random() < a * 0.3) this.steam.add({ x: e.cx, y: 0.85, z: e.cz, vy: 2.5, vx: (Math.random() - 0.5), life: 0.5, s0: 0.15, s1: 0.5, r: 0.95, g: 0.95, b: 1, a: 0.6 });
    }
    for (const [id, h] of this.levers) {
      const e = s.ents[id];
      const target = e.state === 1 ? -0.8 : 0.7;
      h.rotation.z += (target - h.rotation.z) * Math.min(1, dt * 10);
    }
    // live electrical boxes spark now and then
    for (const e of s.ents) {
      if (e.type !== 'elec' || e.state !== 1) continue;
      if (Math.random() < dt * 3) this.burstSparks(e.cx + (Math.random() - 0.5) * 0.6, 1.3 + Math.random() * 0.5, e.cz + 0.3, 6, 0.6, 0.85, 1);
    }
  }

  private updateChars(dt: number, time: number) {
    const s = this.sim;
    const truck = s.anchorPoint(s.anchors[0]);
    for (const c of this.chars) {
      const e = c.ent;
      c.t += dt;
      if (c.mode === 'idle' && e.state === 1) {
        c.mode = 'saved';
        const dx = truck.x - e.cx;
        const dz = truck.z - e.cz;
        const d = Math.hypot(dx, dz) || 1;
        c.vx = (dx / d) * 4.5;
        c.vz = (dz / d) * 4.5;
        c.t = 0;
      } else if (c.mode === 'idle' && e.state === 2) {
        c.mode = 'fled';
        // run away from the fire: pick the direction with least fire
        let bx = 0;
        let bz = 0;
        for (let z = -3; z <= 3; z++)
          for (let x = -3; x <= 3; x++) {
            const cc = s.cellAt(e.cx + x, e.cz + z);
            if (cc >= 0 && s.fire[cc] > 0) {
              bx -= x;
              bz -= z;
            }
          }
        const d = Math.hypot(bx, bz) || 1;
        c.vx = (bx / d) * 5;
        c.vz = (bz / d) * 5;
        c.t = 0;
      }
      const o = c.obj;
      if (c.mode === 'idle') {
        const alert = e.alert;
        const bob = Math.abs(Math.sin(c.t * (alert > 0.3 ? 12 : 3))) * (alert > 0.3 ? 0.12 : 0.03);
        c.hop = Math.max(0, c.hop - dt * 4);
        o.position.set(e.cx, bob + Math.sin(c.hop * Math.PI) * 0.5, e.cz);
        if (e.type === 'bystander') {
          // watch the nearest big fire
          const p = s.player;
          o.rotation.y = -Math.atan2(p.z - e.cz, p.x - e.cx) * 0.3 + o.rotation.y * 0.7;
        } else if (alert > 0.3) o.rotation.y += Math.sin(time * 6 + e.id) * dt * 4;
      } else {
        o.position.x += c.vx * dt;
        o.position.z += c.vz * dt;
        o.position.y = Math.abs(Math.sin(c.t * 14)) * 0.18;
        o.rotation.y = -Math.atan2(c.vz, c.vx);
        const life = c.mode === 'saved' ? 1.6 : 2.2;
        const k = Math.max(0, 1 - Math.max(0, c.t - life + 0.4) / 0.4);
        o.scale.setScalar(k);
        if (c.t > life) o.visible = false;
        if (c.mode === 'fled' && Math.random() < 0.4) this.smoke.add({ x: o.position.x, y: 0.6, z: o.position.z, vy: 0.8, life: 0.8, s0: 0.3, s1: 0.8, r: 0.3, g: 0.3, b: 0.3, a: 0.5 });
      }
    }
  }

  private flameBase(i: number): { y: number; big: number; type: EntType | null; ex: number; ez: number } {
    const s = this.sim;
    const oid = s.owner[i];
    if (oid < 0) return { y: 0, big: 1, type: null, ex: 0, ez: 0 };
    const e = s.ents[oid];
    return { y: TALL[e.type] ?? 0.2, big: BIG_FLAME[e.type] ?? 1, type: e.type, ex: e.cx, ez: e.cz };
  }

  private updateFire(dt: number, time: number) {
    const s = this.sim;
    const W = s.W;
    let n = 0;
    const max = 3200;
    this.glow.begin();
    const night = this.theme.night;
    this.smokeAcc += dt;
    const emitSmoke = this.smokeAcc > 0.05;
    if (emitSmoke) this.smokeAcc = 0;
    for (let i = 0; i < s.N && n < max - 3; i++) {
      const f = s.fire[i];
      if (f <= 0.01) continue;
      const x = (i % W) + 0.5;
      const z = Math.floor(i / W) + 0.5;
      const fb = this.flameBase(i);
      const h1 = hash(i);
      const h2 = hash(i + 7919);
      const grassy = fb.type === null;
      const baseS = (0.55 + f * 1.05) * fb.big * (grassy ? 0.9 : 1);
      const count = 1 + (f > 0.45 ? 1 : 0) + (fb.y > 1.5 ? 1 : 0);
      for (let k = 0; k < count; k++) {
        const ph = h1 * 20 + k * 2.1;
        const jx = (hash(i * 3 + k) - 0.5) * 0.7;
        const jz = (hash(i * 5 + k) - 0.5) * 0.7;
        const y = k === 2 ? 0.1 : fb.y * (0.85 + h2 * 0.3) * (k === 1 ? 0.8 : 1);
        const sc = baseS * (k === 1 ? 0.8 : k === 2 ? 0.7 : 1);
        const sy = sc * (1.15 + 0.22 * Math.sin(time * 13 + ph) + 0.12 * Math.sin(time * 7.3 + ph * 2));
        const sxz = sc * (0.92 + 0.1 * Math.sin(time * 11 + ph));
        this.q.setFromAxisAngle(this.v.set(0, 1, 0), ph + time * 1.7);
        this.m.compose(this.v.set(x + jx - s.windX * 0.05, y, z + jz - s.windZ * 0.05), this.q, this.s.set(sxz, sy, sxz));
        this.flames.setMatrixAt(n, this.m);
        this.col.setRGB(1, 1, 1);
        this.flames.setColorAt(n, this.col);
        n++;
        // bright core
        this.m.compose(this.v.set(x + jx * 0.8, y, z + jz * 0.8), this.q, this.s.set(sxz * 0.55, sy * 0.6, sxz * 0.55));
        this.flames.setMatrixAt(n, this.m);
        this.col.setRGB(1.4, 1.3, 1.0);
        this.flames.setColorAt(n, this.col);
        n++;
      }
      this.glow.push(x, fb.y + 0.6, z, (2.0 + f * 2.8) * fb.big, 1.0, 0.45, 0.1, (night ? 0.45 : 0.3) * f);
      if (emitSmoke && Math.random() < f * 0.09 * this.smokeRate * (s.burning > 300 ? 0.5 : 1)) {
        const dark = fb.type !== null && DARK_SMOKE.has(fb.type);
        const oil = MATS[s.mat[i]].oil;
        const g = dark || oil ? 0.16 + Math.random() * 0.08 : 0.42 + Math.random() * 0.12;
        const sm = night ? 0.6 : 1;
        this.smoke.add({
          x: x + (Math.random() - 0.5) * 0.5,
          y: fb.y + 1.0 * fb.big,
          z: z + (Math.random() - 0.5) * 0.5,
          vx: s.windX * (0.6 + s.windStrength * 2),
          vz: s.windZ * (0.6 + s.windStrength * 2),
          vy: 1.3 + Math.random() * 0.6,
          life: 3 + Math.random() * 1.5,
          s0: 0.7,
          s1: 3.4 * fb.big,
          r: g * sm,
          g: g * sm,
          b: g * sm * 1.05,
          a: dark || oil ? 0.5 : 0.36,
          drag: 0.3,
        });
      }
    }
    this.flames.count = n;
    this.flames.instanceMatrix.needsUpdate = true;
    if (this.flames.instanceColor) this.flames.instanceColor.needsUpdate = true;
    // explosion flash glow
    if (this.flash > 0) this.glow.push(this.flashX, 2, this.flashZ, 18 * this.flash, 1, 0.7, 0.3, this.flash);
  }
  private flashX = 0;
  private flashZ = 0;

  private updateWater(dt: number) {
    const s = this.sim;
    const wp = this.waterP;
    wp.begin();
    for (const d of s.drops) {
      if (d.kind === 2) {
        wp.push(d.x, d.y, d.z, 0.48, 1, 1, 0.97, 0.95);
        wp.push(d.x - d.vx * 0.02, d.y - d.vy * 0.02, d.z - d.vz * 0.02, 0.38, 0.95, 0.97, 1, 0.85);
      } else if (d.kind === 1) {
        wp.push(d.x, d.y, d.z, 0.62, 0.88, 0.96, 1, 0.42);
        wp.push(d.x - d.vx * 0.03, d.y - d.vy * 0.03, d.z - d.vz * 0.03, 0.5, 0.8, 0.93, 1, 0.3);
      } else {
        wp.push(d.x, d.y, d.z, 0.4, 0.93, 0.98, 1, 1);
        wp.push(d.x - d.vx * 0.016, d.y - d.vy * 0.016, d.z - d.vz * 0.016, 0.36, 0.72, 0.9, 1, 0.95);
        wp.push(d.x - d.vx * 0.032, d.y - d.vy * 0.032, d.z - d.vz * 0.032, 0.32, 0.6, 0.84, 1, 0.9);
        wp.push(d.x - d.vx * 0.048, d.y - d.vy * 0.048, d.z - d.vz * 0.048, 0.28, 0.55, 0.8, 1, 0.8);
      }
      // mist around the stream
      if (Math.random() < (d.kind === 1 ? 0.12 : 0.06)) {
        this.splash.add({ x: d.x, y: d.y, z: d.z, vx: d.vx * 0.2 + (Math.random() - 0.5), vy: 0.3, vz: d.vz * 0.2 + (Math.random() - 0.5), life: 0.45, s0: 0.3, s1: d.kind === 1 ? 1.1 : 0.7, r: 0.92, g: 0.97, b: 1, a: 0.28, drag: 2 });
      }
    }
    // splashes and steam at impacts
    const sp = s.splashes;
    for (let k = 0; k < sp.length; k += 4) {
      const x = sp[k];
      const y = sp[k + 1];
      const z = sp[k + 2];
      const kind = sp[k + 3];
      if (Math.random() < 0.5) {
        const a = Math.random() * Math.PI * 2;
        const v = 0.8 + Math.random() * 1.5;
        this.splash.add({ x, y: y + 0.05, z, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: 1.5 + Math.random() * 2, grav: 12, life: 0.35, s0: 0.14, s1: 0.06, r: kind === 2 ? 1 : 0.85, g: kind === 2 ? 1 : 0.94, b: 1, a: 0.9 });
      }
      const c = s.cellAt(x, z);
      if (c >= 0 && s.fire[c] > 0.05 && Math.random() < 0.18) {
        this.steam.add({ x, y: y + 0.3, z, vy: 1.4 + Math.random(), vx: s.windX * 0.5, vz: s.windZ * 0.5, life: 0.9 + Math.random() * 0.5, s0: 0.4, s1: 1.6, r: 0.95, g: 0.96, b: 0.98, a: 0.45, drag: 0.5 });
      }
    }
    sp.length = 0;
    this.splash.draw(wp, 0.01);
    wp.end(this.lastScale);
    void dt;
  }
  private lastScale = 400;
  setScale(sc: number) {
    this.lastScale = sc;
  }

  private updateRockets(dt: number, time: number) {
    const s = this.sim;
    while (this.rocketRings.length < s.rockets.length) {
      const r = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.85, 28), new THREE.MeshBasicMaterial({ color: 0xff4040, transparent: true, opacity: 0.8, depthWrite: false }));
      r.rotation.x = -Math.PI / 2;
      this.group.add(r);
      this.rocketRings.push(r);
    }
    this.rocketRings.forEach((ring, i) => {
      const r = s.rockets[i];
      ring.visible = !!r;
      if (!r) return;
      const u = 1 - r.t / r.total;
      ring.position.set(r.tx, 0.06, r.tz);
      ring.scale.setScalar(1.6 - u * 0.9 + Math.sin(time * 14) * 0.06);
      const wet = s.wet[r.cell] > 0.22;
      (ring.material as THREE.MeshBasicMaterial).color.setHex(wet ? 0x4fd0ff : 0xff4040);
      const x = r.sx + (r.tx - r.sx) * u;
      const z = r.sz + (r.tz - r.sz) * u;
      const y = 0.5 + 4 * 11 * u * (1 - u);
      this.sparks.add({ x, y, z, life: 0.35, s0: 0.35, s1: 0.1, r: 1, g: 0.8, b: 0.4, a: 1 });
      if (Math.random() < 0.5) this.sparks.add({ x, y, z, vx: (Math.random() - 0.5) * 2, vy: -1, vz: (Math.random() - 0.5) * 2, grav: 4, life: 0.5, s0: 0.12, s1: 0.05, r: 1, g: 0.6, b: 0.2 });
    });
    void dt;
  }

  private cl = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private updateLights(dt: number) {
    const s = this.sim;
    const W = s.W;
    // greedy clustering of burning cells (sampled, no allocations)
    const max = this.lights.length;
    const cl = this.cl;
    let nc = 0;
    const step = s.burning > 240 ? 3 : s.burning > 80 ? 2 : 1;
    for (let i = 0; i < s.N; i += step) {
      const f = s.fire[i];
      if (f <= 0.1) continue;
      const x = (i % W) + 0.5;
      const z = ((i / W) | 0) + 0.5;
      let hit = -1;
      for (let c = 0; c < nc; c++) {
        const dx = cl[c * 3] - x;
        const dz = cl[c * 3 + 1] - z;
        if (dx * dx + dz * dz < 49) {
          hit = c;
          break;
        }
      }
      if (hit >= 0) cl[hit * 3 + 2] += f * step;
      else if (nc < max) {
        cl[nc * 3] = x;
        cl[nc * 3 + 1] = z;
        cl[nc * 3 + 2] = f * step;
        nc++;
      }
    }
    const centers = this.centers;
    centers.length = nc;
    for (let c = 0; c < nc; c++) {
      const o = centers[c] ?? (centers[c] = { x: 0, z: 0, k: 0 });
      o.x = cl[c * 3];
      o.z = cl[c * 3 + 1];
      o.k = cl[c * 3 + 2];
    }
    this.lights.forEach((l, i) => {
      const t = this.lightTargets[i];
      const c = i < nc ? centers[i] : null;
      const kk = 1 - Math.exp(-4 * dt);
      if (c) {
        if (t.k < 0.05) {
          t.x = c.x;
          t.z = c.z;
        }
        t.x += (c.x - t.x) * kk;
        t.z += (c.z - t.z) * kk;
        t.k += (Math.min(1, c.k / 8) - t.k) * kk;
      } else t.k += (0 - t.k) * kk;
      if (!l.visible) return;
      l.position.set(t.x, 2.4, t.z);
      l.intensity = t.k * 30 * this.theme.fireLight * (0.85 + Math.random() * 0.3);
    });
  }

  private labelsUpdate(time: number) {
    const s = this.sim;
    const L: Label[] = [];
    for (const c of this.chars) {
      const e = c.ent;
      if (c.mode !== 'idle' || e.type === 'bystander') continue;
      if (e.alert > 0.15 || e.t > 0) L.push({ x: e.cx, y: 1.6, z: e.cz, kind: 'alert', v: Math.max(e.alert, e.t / 2.2), ent: e.id });
    }
    for (const e of s.ents) {
      if (e.type === 'cylinder' && e.state === 0 && e.alert > 0.08) L.push({ x: e.cx, y: 1.2, z: e.cz, kind: 'pressure', v: e.alert, ent: e.id });
      if (e.type === 'lever' && e.state === 0 && s.ents.some((o) => o.type === 'elec' && o.state === 1)) L.push({ x: e.cx, y: 1.9, z: e.cz, kind: 'lever', v: 0.5 + 0.5 * Math.sin(time * 5), ent: e.id });
    }
    this.labels = L;
  }

  // ---------- events -> effects ----------
  burstSparks(x: number, y: number, z: number, n: number, r: number, g: number, b: number, speed = 3) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random());
      this.sparks.add({ x, y, z, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: Math.random() * speed, grav: 9, life: 0.3 + Math.random() * 0.4, s0: 0.14, s1: 0.04, r, g, b });
    }
  }

  onEvent(ev: SimEvent) {
    const { x, z } = ev;
    switch (ev.type) {
      case 'extinguish':
        if (Math.random() < 0.6) this.steam.add({ x, y: 0.4, z, vy: 1.6 + Math.random(), life: 1.3, s0: 0.5, s1: 2.0, r: 0.97, g: 0.97, b: 0.98, a: 0.55, drag: 0.4 });
        break;
      case 'clusterOut':
        for (let k = 0; k < 10; k++) this.steam.add({ x: x + (Math.random() - 0.5) * 3, y: 0.3, z: z + (Math.random() - 0.5) * 3, vy: 1.5 + Math.random(), life: 1.6, s0: 0.6, s1: 2.4, r: 0.98, g: 0.98, b: 1, a: 0.5, drag: 0.4 });
        this.burstSparks(x, 1, z, 20, 0.6, 0.9, 1, 3);
        break;
      case 'flare':
        this.burstSparks(x, 0.5, z, 30, 1, 0.6, 0.15, 5);
        for (let k = 0; k < 6; k++) this.smoke.add({ x, y: 1, z, vy: 3, vx: (Math.random() - 0.5) * 2, vz: (Math.random() - 0.5) * 2, life: 2, s0: 1, s1: 3, r: 0.12, g: 0.1, b: 0.1, a: 0.6, drag: 0.5 });
        this.flash = Math.max(this.flash, 0.5);
        this.flashX = x;
        this.flashZ = z;
        this.shake = Math.max(this.shake, 0.3);
        break;
      case 'explode': {
        this.flash = 1;
        this.flashX = x;
        this.flashZ = z;
        this.shake = 1;
        this.burstSparks(x, 0.8, z, 90, 1, 0.65, 0.2, 9);
        for (let k = 0; k < 16; k++) this.smoke.add({ x: x + (Math.random() - 0.5), y: 1 + Math.random() * 2, z: z + (Math.random() - 0.5), vy: 2 + Math.random() * 3, vx: (Math.random() - 0.5) * 4, vz: (Math.random() - 0.5) * 4, life: 2.5 + Math.random(), s0: 1.2, s1: 4.5, r: 0.12, g: 0.11, b: 0.1, a: 0.7, drag: 0.8 });
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.8, 32), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.8, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.1, z);
        this.group.add(ring);
        this.shock.push({ mesh: ring, t: 0 });
        break;
      }
      case 'short':
        this.burstSparks(x, 1.4, z, 40, 0.55, 0.85, 1, 5);
        this.burstSparks(this.sim.player.x, 1.2, this.sim.player.z, 20, 0.55, 0.85, 1, 3);
        this.shake = Math.max(this.shake, 0.35);
        break;
      case 'soak':
        for (let k = 0; k < 8; k++) this.splash.add({ x, y: 1.3, z, vx: (Math.random() - 0.5) * 3, vz: (Math.random() - 0.5) * 3, vy: 1 + Math.random() * 2, grav: 12, life: 0.5, s0: 0.14, s1: 0.06, r: 0.8, g: 0.92, b: 1, a: 0.9 });
        for (const c of this.chars) if (c.ent.id === ev.ent) c.hop = 1;
        break;
      case 'rescue':
        for (let k = 0; k < 14; k++) this.sparks.add({ x, y: 1, z, vx: (Math.random() - 0.5) * 3, vz: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 2, grav: 3, life: 0.9, s0: 0.25, s1: 0.1, r: 1, g: 0.85, b: 0.3 });
        break;
      case 'connect':
        this.burstSparks(x, 0.8, z, 24, 0.4, 1, 0.55, 3);
        break;
      case 'overheat':
        this.shake = Math.max(this.shake, 0.3);
        break;
      case 'rocketHit':
        this.fireworkBurst(x, z, false);
        break;
      case 'fizzle':
        this.fireworkBurst(x, z, true);
        for (let k = 0; k < 5; k++) this.steam.add({ x, y: 0.4, z, vy: 1.8, life: 1.2, s0: 0.5, s1: 1.8, r: 0.97, g: 0.97, b: 1, a: 0.5 });
        break;
      case 'ignite':
        break;
      case 'win':
        for (let k = 0; k < 4; k++) this.fireworkBurst(x + (Math.random() - 0.5) * 8, z + (Math.random() - 0.5) * 8, false, 8 + Math.random() * 3);
        break;
    }
  }

  private fireworkBurst(x: number, z: number, blue: boolean, h = 7) {
    const palette = blue
      ? [
          [0.5, 0.85, 1],
          [0.8, 0.95, 1],
        ]
      : [
          [1, 0.3, 0.3],
          [1, 0.85, 0.3],
          [0.4, 1, 0.5],
          [0.5, 0.6, 1],
          [1, 0.5, 0.9],
        ];
    const [r, g, b] = palette[Math.floor(Math.random() * palette.length)];
    for (let k = 0; k < 60; k++) {
      const a = Math.random() * Math.PI * 2;
      const e = Math.acos(Math.random() * 2 - 1);
      const v = 4 + Math.random() * 1.5;
      this.sparks.add({ x, y: h, z, vx: Math.sin(e) * Math.cos(a) * v, vy: Math.cos(e) * v, vz: Math.sin(e) * Math.sin(a) * v, grav: 3, drag: 1.2, life: 1.1 + Math.random() * 0.5, s0: 0.3, s1: 0.08, r, g, b });
    }
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
  }
}
