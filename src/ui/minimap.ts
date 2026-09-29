import type { Stage } from '../render/stage';
import { M, MATS } from '../sim/materials';
import type { Sim } from '../sim/world';

const PX = 3; // canvas pixels per cell

const rgb = (h: number): [number, number, number] => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
const C = {
  ground: rgb(0x33405c),
  water: rgb(0x2f7fc0),
  veg: rgb(0x4d7a3a),
  dry: rgb(0x8a7a3a),
  tree: rgb(0x2c5a2c),
  built: rgb(0xbdb6a8),
  burnt: rgb(0x121212),
  fire: rgb(0xff5a1a),
  fireHot: rgb(0xffd23a),
  wet: rgb(0x3f6f9a),
  slick: rgb(0x1a1a22),
  rail: rgb(0x4a4550),
  train: rgb(0xe8e8ee),
};

/** Small overview of the whole map: vegetation, burnt ground, live fire, the player and who needs help. */
export class Minimap {
  private ctx: CanvasRenderingContext2D;
  private img: ImageData | null = null;
  private t = 0;
  private sim: Sim | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  setSim(s: Sim) {
    this.sim = s;
    this.canvas.width = s.W * PX;
    this.canvas.height = s.H * PX;
    const maxCss = window.innerHeight < 500 ? 70 : 96;
    const sc = maxCss / Math.max(s.W, s.H);
    this.canvas.style.width = `${Math.round(s.W * sc)}px`;
    this.canvas.style.height = `${Math.round(s.H * sc)}px`;
    this.img = this.ctx.createImageData(s.W * PX, s.H * PX);
    this.t = 1;
  }

  update(dt: number, stage: Stage, time: number) {
    const s = this.sim;
    if (!s || !this.img) return;
    this.t += dt;
    if (this.t < 0.15) return;
    this.t = 0;
    const d = this.img.data;
    const W = s.W;
    const IW = W * PX;
    const flick = Math.floor(time * 6) % 2;
    for (let i = 0; i < s.N; i++) {
      const m = s.mat[i];
      const md = MATS[m];
      let c: [number, number, number];
      const f = s.fire[i];
      if (s.trainCells[i]) c = C.train;
      else if (f > 0) c = f > 0.6 && flick ? C.fireHot : C.fire;
      else if (m === M.Slick) c = C.slick;
      else if (m === M.Rail) c = C.rail;
      else if (md.flam > 0 && s.fuel0[i] > 0 && s.fuel[i] / s.fuel0[i] < 0.4) c = C.burnt;
      else if (m === M.Water) c = C.water;
      else if (md.flam <= 0) c = C.ground;
      else if (m === M.Tree || m === M.Hedge) c = C.tree;
      else if (m === M.Dry || m === M.Hay || m === M.Leaves) c = C.dry;
      else if (m === M.Grass) c = C.veg;
      else c = C.built;
      if (f <= 0 && s.wet[i] > 0.35 && md.flam > 0) c = C.wet;
      const x0 = (i % W) * PX;
      const z0 = ((i / W) | 0) * PX;
      for (let zz = 0; zz < PX; zz++) {
        let o = ((z0 + zz) * IW + x0) * 4;
        for (let xx = 0; xx < PX; xx++) {
          d[o] = c[0];
          d[o + 1] = c[1];
          d[o + 2] = c[2];
          d[o + 3] = 255;
          o += 4;
        }
      }
    }
    const ctx = this.ctx;
    ctx.putImageData(this.img, 0, 0);
    // visible area
    const r = stage.renderer.domElement.getBoundingClientRect();
    const pts = [
      stage.toGround(r.left, r.top + 90),
      stage.toGround(r.right, r.top + 90),
      stage.toGround(r.right, r.bottom),
      stage.toGround(r.left, r.bottom),
    ];
    if (pts.every(Boolean)) {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      pts.forEach((p, k) => (k ? ctx.lineTo(p!.x * PX, p!.z * PX) : ctx.moveTo(p!.x * PX, p!.z * PX)));
      ctx.closePath();
      ctx.stroke();
    }
    const dot = (x: number, z: number, r2: number, fill: string, stroke = '#0d1528') => {
      ctx.beginPath();
      ctx.arc(x * PX, z * PX, r2, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    };
    for (const e of s.ents) {
      if (e.type === 'truck') {
        ctx.fillStyle = '#e23a2e';
        ctx.fillRect(e.x * PX, e.z * PX, e.w * PX, e.h * PX);
      } else if (e.type === 'hydrant' || e.type === 'seapump') dot(e.cx, e.cz, 2.6, s.player.anchor === e.id ? '#5cff8a' : e.type === 'seapump' ? '#ffe066' : '#7fe0ff');
      else if (e.type === 'leak' && e.state === 0) dot(e.cx, e.cz, 3, flick ? '#ff4b3a' : '#f2c21a');
      else if (e.type === 'cylinder' && e.state === 0) dot(e.cx, e.cz, 2.4, e.alert > 0.5 && flick ? '#ff4b3a' : '#f07a1a');
      else if (e.type === 'lever' && e.state === 0 && s.ents.some((o) => o.type === 'elec' && o.state === 1)) dot(e.cx, e.cz, 3, flick ? '#ff4b3a' : '#ffffff');
    }
    for (const e of s.rescuees) if (e.state === 0) dot(e.cx, e.cz, 3, e.alert > 0.3 && flick ? '#ff4b3a' : '#ffc93c');
    if (s.powerup) dot(s.powerup.x, s.powerup.z, 3.2, flick ? '#fff38a' : '#ffb21f', '#7a4a00');
    for (const h of s.helis) {
      ctx.strokeStyle = '#ff4b3a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(h.x * PX, h.z * PX, 3.3 * PX, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (s.partner) dot(s.partner.x, s.partner.z, 3, '#ffd23a', '#7a2e1e');
    if (s.dog) dot(s.dog.x, s.dog.z, 2.4, '#d8342a');
    const p = s.player;
    dot(p.x, p.z, 3.6, '#ffffff', '#1c7fc0');
  }
}
