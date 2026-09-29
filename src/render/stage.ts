import * as THREE from 'three';
import type { Sim } from '../sim/world';
import { nightOf, THEMES, type Theme } from './themes';
import { LevelView } from './view';

/** Rendering tiers. `auto` picks one of these at runtime from the measured frame rate. */
export type Tier = 'high' | 'medium' | 'low';

const PITCH = (56 * Math.PI) / 180;
const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(42, 1, 0.5, 260);
  private sun = new THREE.DirectionalLight(0xffffff, 2);
  private hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  view: LevelView | null = null;
  sim: Sim | null = null;
  theme: Theme = THEMES.plaza;
  private target = new THREE.Vector3();
  private dist = 30;
  private ray = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private tmpV = new THREE.Vector3();
  private tmpN = new THREE.Vector2();
  private sunDir = new THREE.Vector3();
  tier: Tier = 'high';
  pxScale = 400;
  zoom = 1;
  zoomTarget = 1;
  lookAhead = 2.2;
  /** When set, the camera frames this point instead of the player (level intro, last flame). */
  focus: { x: number; z: number } | null = null;
  readonly reducedMotion = REDUCED;
  private cssW = 1;
  private cssH = 1;
  /** blackout / rain: how far the lights are dimmed right now (smoothed) */
  private dark = 0;
  private wetK = 0;
  private skyC = new THREE.Color();
  private blackC = new THREE.Color(0x05070d);

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.near = 1;
    sc.far = 90;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.03;
    this.sun.shadow.radius = 2.5;
    this.scene.add(this.sun, this.sun.target, this.hemi);
    this.resize();
  }

  setTier(t: Tier) {
    const changedShadows = (t === 'low') !== (this.tier === 'low');
    this.tier = t;
    const dpr = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(Math.min(dpr, t === 'high' ? 2 : t === 'medium' ? 1.35 : 1));
    const shadows = t !== 'low';
    this.renderer.shadowMap.enabled = shadows;
    this.sun.castShadow = shadows;
    const size = t === 'high' ? 2048 : 1024;
    this.sun.shadow.mapSize.set(size, size);
    if (this.sun.shadow.map) {
      this.sun.shadow.map.dispose();
      this.sun.shadow.map = null as unknown as THREE.WebGLRenderTarget;
    }
    if (changedShadows) {
      // shadow on/off changes shader defines: force recompilation
      this.scene.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => (x.needsUpdate = true));
        else if (m) m.needsUpdate = true;
      });
    }
    this.view?.setTier(t);
    this.resize();
  }

  setLevel(sim: Sim, night = false) {
    if (this.view) {
      this.scene.remove(this.view.group);
      this.view.dispose();
    }
    this.sim = sim;
    let t = THEMES[sim.def.theme];
    if (night || sim.def.night) t = nightOf(t);
    this.theme = t;
    this.sunDir.set(...t.sunDir).normalize();
    this.scene.background = new THREE.Color(t.sky);
    this.scene.fog = new THREE.Fog(t.fog, t.fogNear, t.fogFar);
    this.sun.color.setHex(t.sun);
    this.sun.intensity = t.sunI;
    this.hemi.color.setHex(t.hemiSky);
    this.hemi.groundColor.setHex(t.hemiGround);
    this.hemi.intensity = t.hemiI;
    this.view = new LevelView(sim, t, this.tier);
    this.scene.add(this.view.group);
    this.dark = this.wetK = 0;
    this.skyC.setHex(t.sky);
    this.focus = null;
    this.zoom = this.zoomTarget = 1;
    this.target.set(sim.player.x, 0, sim.player.z);
    this.placeCamera(0, true);
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.cssW = w;
    this.cssH = h;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1 ? 50 : 40;
    this.camera.updateProjectionMatrix();
    const vf = (this.camera.fov * Math.PI) / 180;
    const hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
    const Wv = aspect < 1 ? 13.5 : aspect < 1.4 ? 18 : 23;
    const Dv = 11;
    this.dist = Math.max(Wv / 2 / Math.tan(hf / 2), Dv / 2 / Math.tan(vf / 2));
    const bufH = this.renderer.getDrawingBufferSize(this.tmpN).y;
    this.pxScale = (bufH * 0.5) / Math.tan(vf / 2);
    // fit the shadow box to what the camera can see (tighter box = sharper, cheaper shadows)
    const ext = aspect < 1 ? 17 : 23;
    const sc = this.sun.shadow.camera;
    sc.left = -ext;
    sc.right = ext;
    sc.top = ext;
    sc.bottom = -ext;
    sc.updateProjectionMatrix();
  }

  /** Point on the map the camera should look at right now. */
  private desired(): { x: number; z: number } {
    const s = this.sim!;
    if (this.focus) return this.focus;
    const p = s.player;
    return { x: p.x + p.aimX * this.lookAhead + p.vx * 0.25, z: p.z + p.aimZ * this.lookAhead * 0.8 + p.vz * 0.25 + 0.6 };
  }

  private placeCamera(dt: number, snap = false) {
    const s = this.sim;
    if (!s) return;
    const d0 = this.desired();
    const cx = Math.min(Math.max(d0.x, 1), s.W - 1);
    const cz = Math.min(Math.max(d0.z, 1), s.H - 1);
    const k = snap ? 1 : 1 - Math.exp(-(this.focus ? 2.4 : 3.5) * dt);
    this.target.x += (cx - this.target.x) * k;
    this.target.z += (cz - this.target.z) * k;
    this.zoom += (this.zoomTarget - this.zoom) * (snap ? 1 : 1 - Math.exp(-2.6 * dt));
    const d = this.dist * this.zoom;
    const shake = this.view && !REDUCED ? this.view.shake : 0;
    const sx = (Math.random() - 0.5) * shake * 0.6;
    const sz = (Math.random() - 0.5) * shake * 0.6;
    this.camera.position.set(this.target.x + sx, Math.sin(PITCH) * d, this.target.z + Math.cos(PITCH) * d + sz);
    this.camera.lookAt(this.target.x + sx, 0, this.target.z + sz);
    // shadow box follows the camera target, snapped to texels to avoid shimmering
    const texel = (this.sun.shadow.camera.right * 2) / this.sun.shadow.mapSize.x;
    const bx = Math.round(this.target.x / texel) * texel;
    const bz = Math.round(this.target.z / texel) * texel;
    const sd = this.sunDir;
    this.sun.position.set(bx + sd.x * 40, sd.y * 40, bz + sd.z * 40);
    this.sun.target.position.set(bx, 0, bz);
  }

  frame(dt: number, time: number) {
    if (!this.sim || !this.view) return;
    this.weather(dt);
    this.placeCamera(dt);
    this.view.update(dt, time, this.camera, this.pxScale);
    this.renderer.render(this.scene, this.camera);
  }

  /** Blackout (only the fire and your torch light the scene) and rain (a greyer, darker sky). */
  private weather(dt: number) {
    const s = this.sim!;
    const t = this.theme;
    const k = 1 - Math.exp(-2.5 * dt);
    this.dark += ((s.evT.blackout > 0 ? 1 : 0) - this.dark) * k;
    this.wetK += ((s.evT.rain > 0 ? 1 : 0) - this.wetK) * k;
    if (this.dark < 0.001 && this.wetK < 0.001 && this.sun.intensity === t.sunI) return;
    const d = this.dark;
    const w = this.wetK;
    this.sun.intensity = t.sunI * (1 - 0.8 * d - 0.35 * w);
    this.hemi.intensity = t.hemiI * (1 - 0.72 * d - 0.25 * w);
    const fog = this.scene.fog as THREE.Fog;
    fog.near = t.fogNear * (1 - 0.8 * d - 0.3 * w);
    fog.far = t.fogFar * (1 - 0.7 * d - 0.25 * w);
    const bg = this.scene.background as THREE.Color;
    bg.copy(this.skyC).lerp(this.blackC, d * 0.9).multiplyScalar(1 - 0.25 * w);
    fog.color.copy(bg);
    this.view!.torch(d);
  }

  /** World -> CSS pixel position (allocation-free result object is reused: copy what you need). */
  private sp = { x: 0, y: 0, on: false };
  toScreen(x: number, y: number, z: number): { x: number; y: number; on: boolean } {
    const v = this.tmpV.set(x, y, z).project(this.camera);
    const o = this.sp;
    o.x = (v.x * 0.5 + 0.5) * this.cssW;
    o.y = (-v.y * 0.5 + 0.5) * this.cssH;
    o.on = v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1;
    return o;
  }

  /** CSS pixel -> ground point (y = 0). */
  toGround(cx: number, cy: number): { x: number; z: number } | null {
    const r = this.canvas.getBoundingClientRect();
    this.tmpN.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.tmpN, this.camera);
    if (!this.ray.ray.intersectPlane(this.plane, this.tmpV)) return null;
    return { x: this.tmpV.x, z: this.tmpV.z };
  }
}
