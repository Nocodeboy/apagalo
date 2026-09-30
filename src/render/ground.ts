import * as THREE from 'three';
import { M, MATS } from '../sim/materials';
import type { Sim } from '../sim/world';
import type { Theme } from './themes';

const PX = 16;

function lcg(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * k)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * k)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * k)));
  return `rgb(${r},${g},${b})`;
}

const GROUNDISH = new Set<number>([M.Grass, M.Dry, M.Leaves, M.Dirt, M.Road, M.Stone, M.Concrete, M.Sand, M.Water, M.Wood, M.Oil, M.Rail, M.Snow, M.Ice, M.Carpet, M.TallGrass]);

export class Ground {
  readonly mesh: THREE.Mesh;
  readonly outside: THREE.Group;
  private stateTex: THREE.DataTexture;
  private data: Uint8Array;
  /** the painted ground, kept to repaint cells dug with the Pulaski */
  private ctx2d: CanvasRenderingContext2D;
  private baseTex: THREE.CanvasTexture;
  private theme: Theme;
  private uniforms: { uTime: { value: number } };

  constructor(private sim: Sim, theme: Theme) {
    const { W, H } = sim;
    const canvas = document.createElement('canvas');
    canvas.width = W * PX;
    canvas.height = H * PX;
    const ctx = canvas.getContext('2d')!;
    this.paint(ctx, theme);
    const tex = new THREE.CanvasTexture(canvas);
    this.ctx2d = ctx;
    this.baseTex = tex;
    this.theme = theme;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;

    this.data = new Uint8Array(W * H * 4);
    this.stateTex = new THREE.DataTexture(this.data, W, H, THREE.RGBAFormat);
    this.stateTex.magFilter = THREE.LinearFilter;
    this.stateTex.minFilter = THREE.LinearFilter;
    this.stateTex.needsUpdate = true;
    const mask = new Uint8Array(W * H * 4);
    for (let z = 0; z < H; z++)
      for (let x = 0; x < W; x++) {
        const i = z * W + x;
        const j = ((H - 1 - z) * W + x) * 4;
        mask[j] = sim.mat[i] === M.Water || sim.mat[i] === M.Slick ? 255 : 0;
        mask[j + 1] = sim.mat[i] === M.Ice ? 255 : 0;
        mask[j + 2] = sim.mat[i] === M.Snow || (theme.id === 'nieve' && sim.mat[i] === M.Dirt) ? 255 : 0;
      }
    const maskTex = new THREE.DataTexture(mask, W, H, THREE.RGBAFormat);
    maskTex.magFilter = THREE.LinearFilter;
    maskTex.minFilter = THREE.LinearFilter;
    maskTex.needsUpdate = true;

    const mat = new THREE.MeshLambertMaterial({ map: tex });
    this.uniforms = { uTime: { value: 0 } };
    const uni = this.uniforms;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uState = { value: this.stateTex };
      sh.uniforms.uMask = { value: maskTex };
      sh.uniforms.uTime = uni.uTime;
      sh.uniforms.uGrid = { value: new THREE.Vector2(W, H) };
      sh.fragmentShader = sh.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
uniform sampler2D uState; uniform sampler2D uMask; uniform float uTime; uniform vec2 uGrid;
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`,
        )
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
vec4 st = texture2D(uState, vMapUv);
vec4 mk = texture2D(uMask, vMapUv);
float wm = mk.r;
vec2 cuv = vMapUv * uGrid;
float nn = hash2(floor(cuv * 6.0));
if (wm > 0.01) {
  float wv = sin(cuv.x * 2.1 + uTime * 1.4 + sin(cuv.y * 0.7)) * sin(cuv.y * 1.6 - uTime * 1.1);
  diffuseColor.rgb += vec3(0.07, 0.1, 0.12) * wv * wm;
  diffuseColor.rgb += vec3(0.25) * step(0.985, hash2(floor(cuv * 5.0) + floor(uTime * 2.0))) * wm;
}
// ice: a slow sheen sliding across it; snow: a few glints
if (mk.g > 0.01) diffuseColor.rgb += vec3(0.1, 0.13, 0.16) * mk.g * smoothstep(0.55, 1.0, sin(cuv.x * 0.9 + cuv.y * 0.6 - uTime * 0.8));
if (mk.b > 0.01) diffuseColor.rgb += vec3(0.5, 0.55, 0.6) * mk.b * step(0.994, hash2(floor(cuv * 9.0) + floor(uTime * 1.3)));
float chr = smoothstep(0.04, 0.75, st.r);
vec3 charC = mix(vec3(0.07, 0.062, 0.058), vec3(0.19, 0.17, 0.15), nn);
diffuseColor.rgb = mix(diffuseColor.rgb, charC, chr * 0.95);
diffuseColor.rgb *= mix(vec3(1.0), vec3(0.62, 0.68, 0.78), st.g);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.97, 0.98, 1.0), smoothstep(0.08, 0.5, st.a) * (0.7 + 0.3 * nn));`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
float fl = 0.72 + 0.28 * sin(uTime * 11.0 + nn * 20.0);
totalEmissiveRadiance += vec3(1.0, 0.36, 0.07) * st.b * st.b * fl * 1.1;`,
        );
    };
    const geo = new THREE.PlaneGeometry(W, H, 1, 1);
    geo.rotateX(-Math.PI / 2);
    geo.translate(W / 2, 0, H / 2);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;

    // surrounding land so the map is not a floating island
    this.outside = new THREE.Group();
    const og = new THREE.PlaneGeometry(420, 420);
    og.rotateX(-Math.PI / 2);
    const o = new THREE.Mesh(og, new THREE.MeshLambertMaterial({ color: theme.outside }));
    o.position.set(W / 2, -0.03, H / 2);
    o.receiveShadow = true;
    this.outside.add(o);
    if (theme.outsideNorthWater) {
      const wg = new THREE.PlaneGeometry(420, 200);
      wg.rotateX(-Math.PI / 2);
      const w = new THREE.Mesh(wg, new THREE.MeshLambertMaterial({ color: new THREE.Color(theme.water) }));
      w.position.set(W / 2, -0.02, -100 + 4);
      this.outside.add(w);
    }
  }

  private groundUnder(i: number): number {
    const s = this.sim;
    const m = s.mat[i];
    if (m === M.Slick) return M.Water;
    if (GROUNDISH.has(m)) return m;
    const x = i % s.W;
    const z = Math.floor(i / s.W);
    const counts = new Map<number, number>();
    for (let r = 1; r <= 3; r++) {
      for (let dz = -r; dz <= r; dz++)
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          const zz = z + dz;
          if (xx < 0 || zz < 0 || xx >= s.W || zz >= s.H) continue;
          const mm = s.mat[zz * s.W + xx];
          if (GROUNDISH.has(mm) && mm !== M.Water && mm !== M.Oil) counts.set(mm, (counts.get(mm) ?? 0) + 1);
        }
      if (counts.size) break;
    }
    let best: number = M.Grass;
    let bc = -1;
    for (const [k, v] of counts)
      if (v > bc) {
        bc = v;
        best = k;
      }
    return best;
  }

  private paint(ctx: CanvasRenderingContext2D, t: Theme) {
    const s = this.sim;
    const rnd = lcg(s.W * 131 + s.H * 7 + s.def.num * 1000);
    const rows = s.def.map;
    for (let z = 0; z < s.H; z++) {
      for (let x = 0; x < s.W; x++) {
        const i = z * s.W + x;
        const m = this.groundUnder(i);
        const px = x * PX;
        const pz = z * PX;
        const tint = 0.94 + rnd() * 0.12;
        const dot = (c: string, n: number, w = 2, h = 2) => {
          ctx.fillStyle = c;
          for (let k = 0; k < n; k++) ctx.fillRect(px + rnd() * (PX - w), pz + rnd() * (PX - h), w, h);
        };
        switch (m) {
          case M.Grass: {
            ctx.fillStyle = shade(t.grass[0], tint);
            ctx.fillRect(px, pz, PX, PX);
            dot(shade(t.grass[1], 0.95), 10, 1, 3);
            dot(shade(t.grass[0], 1.15), 8, 1, 3);
            if (rnd() < 0.05) dot(['#fff6d0', '#f7d24a', '#f08ab0'][Math.floor(rnd() * 3)], 3, 2, 2);
            break;
          }
          case M.Dry: {
            ctx.fillStyle = shade(t.dry[0], tint);
            ctx.fillRect(px, pz, PX, PX);
            dot(shade(t.dry[1], 0.9), 12, 1, 4);
            dot(shade(t.dry[0], 1.12), 8, 1, 3);
            break;
          }
          case M.Leaves: {
            ctx.fillStyle = shade(t.leaves[0], tint * 0.9);
            ctx.fillRect(px, pz, PX, PX);
            dot(t.leaves[1], 7, 3, 2);
            dot(t.leaves[2], 6, 2, 3);
            dot(shade(t.leaves[1], 1.2), 3, 2, 2);
            break;
          }
          case M.Dirt: {
            ctx.fillStyle = shade(t.dirt, tint);
            ctx.fillRect(px, pz, PX, PX);
            if (t.id === 'nieve') {
              // packed snow: boot prints and ski tracks
              dot(shade(t.dirt, 1.08), 5, 3, 2);
              dot(shade(t.dirt, 0.9), 3, 2, 2);
              if ((x + z * 3) % 7 === 0) {
                ctx.fillStyle = shade(t.dirt, 0.86);
                ctx.fillRect(px, pz + 5, PX, 1);
                ctx.fillRect(px, pz + 10, PX, 1);
              }
            } else {
              dot(shade(t.dirt, 0.82), 6, 2, 2);
              dot(shade(t.dirt, 1.12), 4, 2, 1);
            }
            break;
          }
          case M.Snow: {
            // deep snow: bright, with soft drifts
            ctx.fillStyle = shade('#f4f8fc', 0.97 + rnd() * 0.04);
            ctx.fillRect(px, pz, PX, PX);
            ctx.fillStyle = 'rgba(150,175,210,0.28)';
            ctx.beginPath();
            ctx.ellipse(px + rnd() * PX, pz + rnd() * PX, 5 + rnd() * 5, 2 + rnd() * 2, 0.3, 0, Math.PI * 2);
            ctx.fill();
            dot('#ffffff', 4, 2, 2);
            break;
          }
          case M.Ice: {
            // ice: pale blue, glossy streaks and a few cracks
            ctx.fillStyle = shade('#a9d4ec', 0.97 + rnd() * 0.05);
            ctx.fillRect(px, pz, PX, PX);
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fillRect(px + rnd() * 8, pz + rnd() * 12, 7, 1);
            ctx.strokeStyle = 'rgba(70,120,160,0.45)';
            ctx.lineWidth = 1;
            if (rnd() < 0.4) {
              ctx.beginPath();
              ctx.moveTo(px + rnd() * PX, pz + rnd() * PX);
              ctx.lineTo(px + rnd() * PX, pz + rnd() * PX);
              ctx.lineTo(px + rnd() * PX, pz + rnd() * PX);
              ctx.stroke();
            }
            break;
          }
          case M.Carpet: {
            // red carpet with a gold border where it meets something else
            ctx.fillStyle = shade('#a8262e', 0.95 + rnd() * 0.06);
            ctx.fillRect(px, pz, PX, PX);
            dot('#8e1d25', 5, 2, 2);
            ctx.fillStyle = '#d9b04a';
            const cm = (dx: number, dz: number) => {
              const xx = x + dx;
              const zz = z + dz;
              return xx >= 0 && zz >= 0 && xx < s.W && zz < s.H && s.mat[zz * s.W + xx] === M.Carpet;
            };
            if (!cm(0, -1)) ctx.fillRect(px, pz + 1, PX, 2);
            if (!cm(0, 1)) ctx.fillRect(px, pz + PX - 3, PX, 2);
            if (!cm(-1, 0)) ctx.fillRect(px + 1, pz, 2, PX);
            if (!cm(1, 0)) ctx.fillRect(px + PX - 3, pz, 2, PX);
            break;
          }
          case M.TallGrass: {
            // tall dry grass: golden, long strokes
            ctx.fillStyle = shade(t.dry[0], tint * 1.05);
            ctx.fillRect(px, pz, PX, PX);
            dot(shade(t.dry[1], 0.8), 9, 1, 6);
            dot(shade(t.dry[0], 1.25), 9, 1, 6);
            dot('#8a6a30', 3, 1, 4);
            break;
          }
          case M.Road: {
            ctx.fillStyle = shade(t.road, 0.97 + rnd() * 0.06);
            ctx.fillRect(px, pz, PX, PX);
            dot(shade(t.road, 1.25), 6, 1, 1);
            dot(shade(t.road, 0.8), 6, 1, 1);
            if (rows[z][x] === '+') {
              // zebra crossing: bars along the way people walk
              ctx.fillStyle = '#f2efe6';
              const vertical = (z > 0 && rows[z - 1][x] === '+') || (z < s.H - 1 && rows[z + 1][x] === '+');
              if (vertical) for (let k = 0; k < 2; k++) ctx.fillRect(px + 2 + k * 8, pz, 4, PX);
              else for (let k = 0; k < 2; k++) ctx.fillRect(px, pz + 2 + k * 8, PX, 4);
            }
            if (rows[z][x] === '-') {
              ctx.fillStyle = '#f2efe6';
              const vertical = (z > 0 && rows[z - 1][x] === '-') || (z < s.H - 1 && rows[z + 1][x] === '-');
              const horizontal = (x > 0 && rows[z][x - 1] === '-') || (x < s.W - 1 && rows[z][x + 1] === '-');
              if (horizontal && (x % 2 === 0)) ctx.fillRect(px + 2, pz + PX / 2 - 1, PX - 4, 2);
              if (vertical && !horizontal && z % 2 === 0) ctx.fillRect(px + PX / 2 - 1, pz + 2, 2, PX - 4);
            }
            break;
          }
          case M.Stone: {
            const [a, b] = t.stone;
            if (t.id === 'museo') {
              // marble: big checker tiles with faint veins
              ctx.fillStyle = shade((x + z) % 2 ? a : b, 0.98 + rnd() * 0.03);
              ctx.fillRect(px, pz, PX, PX);
              ctx.strokeStyle = 'rgba(150,140,125,0.35)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(px + rnd() * PX, pz);
              ctx.quadraticCurveTo(px + rnd() * PX, pz + PX / 2, px + rnd() * PX, pz + PX);
              ctx.stroke();
              ctx.fillStyle = 'rgba(120,110,95,0.35)';
              ctx.fillRect(px, pz, PX, 1);
              ctx.fillRect(px, pz, 1, PX);
              break;
            }
            for (let k = 0; k < 4; k++) {
              ctx.fillStyle = shade(k % 3 === 0 ? a : b, 0.95 + rnd() * 0.1);
              ctx.fillRect(px + (k % 2) * 8, pz + Math.floor(k / 2) * 8, 8, 8);
            }
            ctx.fillStyle = shade(b, 0.82);
            ctx.fillRect(px, pz, PX, 1);
            ctx.fillRect(px, pz + 8, PX, 1);
            ctx.fillRect(px, pz, 1, PX);
            ctx.fillRect(px + 8, pz, 1, PX);
            break;
          }
          case M.Concrete:
          case M.Oil: {
            ctx.fillStyle = shade(t.concrete, 0.97 + rnd() * 0.05);
            ctx.fillRect(px, pz, PX, PX);
            dot(shade(t.concrete, 0.9), 5, 2, 2);
            ctx.fillStyle = shade(t.concrete, 0.84);
            if (x % 3 === 0) ctx.fillRect(px, pz, 1, PX);
            if (z % 3 === 0) ctx.fillRect(px, pz, PX, 1);
            // quay edge: a stone kerb where the concrete meets the sea
            const up = z > 0 ? s.mat[i - s.W] : -1;
            if (up === M.Water || up === M.Slick) {
              ctx.fillStyle = shade(t.concrete, 0.7);
              ctx.fillRect(px, pz, PX, 4);
              ctx.fillStyle = 'rgba(255,255,255,0.25)';
              ctx.fillRect(px, pz + 4, PX, 1);
            }
            break;
          }
          case M.Rail: {
            // ballast, sleepers across the two rows of the track and two steel rails
            const top = z === 0 || s.mat[i - s.W] !== M.Rail;
            ctx.fillStyle = shade('#7d766c', 0.95 + rnd() * 0.08);
            ctx.fillRect(px, pz, PX, PX);
            dot('#958d80', 10, 2, 2);
            dot('#5f5950', 8, 2, 2);
            ctx.fillStyle = '#5a4332';
            for (const sx of [2, 10]) ctx.fillRect(px + sx, pz, 4, PX);
            const ry = pz + (top ? 9 : 5);
            ctx.fillStyle = '#c9ccd0';
            ctx.fillRect(px, ry, PX, 2);
            ctx.fillStyle = 'rgba(40,40,44,0.6)';
            ctx.fillRect(px, ry + 2, PX, 1);
            break;
          }
          case M.Sand: {
            ctx.fillStyle = shade(t.sand, 0.96 + rnd() * 0.07);
            ctx.fillRect(px, pz, PX, PX);
            dot(shade(t.sand, 0.88), 6, 3, 1);
            dot(shade(t.sand, 1.08), 5, 1, 1);
            break;
          }
          case M.Water: {
            ctx.fillStyle = shade(t.water, 0.97 + rnd() * 0.05);
            ctx.fillRect(px, pz, PX, PX);
            dot(shade(t.water, 1.2), 2, 5, 1);
            break;
          }
          case M.Wood: {
            if (t.id === 'museo') {
              // parquet: honey-coloured boards, laid in squares that alternate direction
              const across = (x + z) % 2 === 0;
              for (let k = 0; k < 4; k++) {
                ctx.fillStyle = shade('#c08a55', 0.9 + rnd() * 0.16);
                if (across) ctx.fillRect(px, pz + k * 4, PX, 4);
                else ctx.fillRect(px + k * 4, pz, 4, PX);
                ctx.fillStyle = 'rgba(90,50,20,0.28)';
                if (across) ctx.fillRect(px, pz + k * 4 + 3, PX, 1);
                else ctx.fillRect(px + k * 4 + 3, pz, 1, PX);
              }
              break;
            }
            for (let k = 0; k < 4; k++) {
              ctx.fillStyle = shade(t.wood, 0.9 + rnd() * 0.18);
              ctx.fillRect(px, pz + k * 4, PX, 4);
              ctx.fillStyle = shade(t.wood, 0.65);
              ctx.fillRect(px, pz + k * 4 + 3, PX, 1);
            }
            break;
          }
        }
        if (s.mat[i] === M.Oil) {
          // fuel puddle with a rainbow sheen
          const cx = px + PX / 2 + (rnd() - 0.5) * 4;
          const cz = pz + PX / 2 + (rnd() - 0.5) * 4;
          const g = ctx.createRadialGradient(cx, cz, 1, cx, cz, PX * 0.75);
          g.addColorStop(0, 'rgba(25,22,30,0.95)');
          g.addColorStop(0.55, 'rgba(40,36,60,0.9)');
          g.addColorStop(0.72, 'rgba(90,60,140,0.55)');
          g.addColorStop(0.85, 'rgba(60,140,120,0.35)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(px - 4, pz - 4, PX + 8, PX + 8);
        }
      }
    }
    // soft edges on natural ground
    for (let z = 0; z < s.H; z++)
      for (let x = 0; x < s.W; x++) {
        const m = this.groundUnder(z * s.W + x);
        let col: string | null = null;
        if (m === M.Grass) col = t.grass[0];
        else if (m === M.Dry) col = t.dry[0];
        else if (m === M.Leaves) col = t.leaves[0];
        else if (m === M.Sand) col = t.sand;
        else if (m === M.Snow) col = '#f4f8fc';
        if (!col) continue;
        ctx.fillStyle = shade(col, 0.97);
        for (let k = 0; k < 5; k++) {
          const ex = x * PX + (rnd() < 0.5 ? -2 : PX - 1) * (rnd() < 0.5 ? 1 : 0) + rnd() * PX;
          const ez = z * PX + rnd() * PX;
          ctx.beginPath();
          ctx.arc(ex, ez, 1.5 + rnd() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    // contact shadows under objects
    for (const e of s.ents) {
      const k = { tree: 0.8, pine: 0.75, palm: 0.5, house: 0.2, church: 0.2, barn: 0.2, warehouse: 0.15, stall: 0.2, churros: 0.2, car: 0.35, truck: 0.3, hay: 0.5, cabin: 0.2, chiringuito: 0.25, shop: 0.15, hedge: 0.45, pallet: 0.4, container: 0.2, tower: 0.25, wagon: 0.3, crane: 0.1, chalet: 0.25, tent: 0.3, rv: 0.35, art: 0.3 }[e.type as string];
      if (!k) continue;
      const cx = e.cx * PX;
      const cz = e.cz * PX;
      const r = Math.max(e.w, e.h) * PX * (0.55 + k * 0.3);
      const g = ctx.createRadialGradient(cx, cz, 0, cx, cz, r);
      g.addColorStop(0, `rgba(20,25,10,${0.32 * k + 0.12})`);
      g.addColorStop(1, 'rgba(20,25,10,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cz - r, r * 2, r * 2);
    }
    // curbs where roads meet other ground
    ctx.fillStyle = 'rgba(235,232,225,0.9)';
    for (let z = 0; z < s.H; z++)
      for (let x = 0; x < s.W; x++) {
        const i = z * s.W + x;
        if (s.mat[i] !== M.Road) continue;
        const other = (j: number) => j >= 0 && s.mat[j] !== M.Road && s.mat[j] !== M.Block && MATS[s.mat[j]] !== undefined;
        if (z > 0 && other(i - s.W) && s.mat[i - s.W] !== M.Road) ctx.fillRect(x * PX, z * PX, PX, 2);
        if (z < s.H - 1 && other(i + s.W)) ctx.fillRect(x * PX, z * PX + PX - 2, PX, 2);
      }
  }

  /** A cell dug with the Pulaski: bare earth with the furrows of the hoe. */
  paintDug(i: number) {
    const s = this.sim;
    const ctx = this.ctx2d;
    const t = this.theme;
    const px = (i % s.W) * PX;
    const pz = Math.floor(i / s.W) * PX;
    // freshly turned soil: darker than the paths, raked in wavy furrows, a few clods, and a ragged edge so a line of
    // dug cells reads as one strip of earth rather than a row of tiles
    let seed = (i * 2654435761) >>> 0;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    ctx.fillStyle = shade(t.dirt, 0.74);
    ctx.fillRect(px, pz, PX, PX);
    for (let k = 0; k < 10; k++) ctx.fillRect(px - 1 + rnd() * (PX + 2), pz - 1 + rnd() * (PX + 2), 2, 2);
    for (let k = 1; k < PX; k += 4) {
      const off = Math.round(rnd() * 2);
      for (let x = 0; x < PX; x += 2) {
        const y = pz + k + off + (((x + k) >> 2) & 1);
        ctx.fillStyle = shade(t.dirt, 0.58);
        ctx.fillRect(px + x, y, 2, 1);
        ctx.fillStyle = shade(t.dirt, 0.95);
        ctx.fillRect(px + x, y + 1, 2, 1);
      }
    }
    for (let k = 0; k < 5; k++) {
      ctx.fillStyle = shade(t.dirt, rnd() < 0.5 ? 1.05 : 0.5);
      ctx.fillRect(px + rnd() * (PX - 2), pz + rnd() * (PX - 2), 2, 2);
    }
    this.baseTex.needsUpdate = true;
  }

  update(time: number) {
    const s = this.sim;
    const { W, H } = s;
    const d = this.data;
    for (let z = 0; z < H; z++) {
      const row = (H - 1 - z) * W;
      for (let x = 0; x < W; x++) {
        const i = z * W + x;
        const j = (row + x) * 4;
        const f0 = s.fuel0[i];
        // fuel on the sea is a dark sheen (the same channel as charring)
        d[j] = s.mat[i] === M.Slick ? Math.round(150 + 90 * Math.min(1, s.fuel[i] / Math.max(0.01, f0))) : f0 > 0 ? Math.round((1 - s.fuel[i] / f0) * 255) : 0;
        d[j + 1] = Math.round(s.wet[i] * 255);
        d[j + 2] = Math.round(s.fire[i] * 255);
        d[j + 3] = Math.round(s.foam[i] * 255);
      }
    }
    this.stateTex.needsUpdate = true;
    this.uniforms.uTime.value = time;
  }
}
