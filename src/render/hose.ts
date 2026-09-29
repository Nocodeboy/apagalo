import * as THREE from 'three';
import type { Sim } from '../sim/world';

const N = 40;

/** Verlet rope from the anchor (truck or hydrant) to the firefighter's hands. */
export class Hose {
  readonly mesh: THREE.InstancedMesh;
  private px = new Float32Array(N);
  private py = new Float32Array(N);
  private pz = new Float32Array(N);
  private ox = new Float32Array(N);
  private oy = new Float32Array(N);
  private oz = new Float32Array(N);
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private up = new THREE.Vector3(0, 1, 0);
  private dir = new THREE.Vector3();
  private s = new THREE.Vector3();
  private p = new THREE.Vector3();

  constructor(
    private sim: Sim,
    private maxLen: () => number = () => sim.hoseLen,
  ) {
    const geo = new THREE.CylinderGeometry(0.075, 0.075, 1, 6, 1, true);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0xf3e3bf });
    this.mesh = new THREE.InstancedMesh(geo, mat, N - 1);
    this.mesh.castShadow = true;
    this.mesh.frustumCulled = false;
  }

  reset(ax: number, ay: number, az: number, ex: number, ey: number, ez: number) {
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      this.px[i] = this.ox[i] = ax + (ex - ax) * t;
      this.py[i] = this.oy[i] = 0.08;
      this.pz[i] = this.oz[i] = az + (ez - az) * t;
    }
    this.py[0] = this.oy[0] = ay;
    this.py[N - 1] = this.oy[N - 1] = ey;
  }

  update(dt: number, ax: number, ay: number, az: number, ex: number, ey: number, ez: number) {
    const s = this.sim;
    const dist = Math.hypot(ex - ax, ez - az);
    const L = Math.min(this.maxLen() + 0.6, Math.max(dist + 0.4, dist * 1.12 + 1.2));
    const seg = L / (N - 1);
    const g = -22 * dt * dt;
    for (let i = 1; i < N - 1; i++) {
      const vx = (this.px[i] - this.ox[i]) * 0.9;
      const vy = (this.py[i] - this.oy[i]) * 0.9;
      const vz = (this.pz[i] - this.oz[i]) * 0.9;
      this.ox[i] = this.px[i];
      this.oy[i] = this.py[i];
      this.oz[i] = this.pz[i];
      this.px[i] += vx;
      this.py[i] += vy + g;
      this.pz[i] += vz;
    }
    for (let it = 0; it < 14; it++) {
      this.px[0] = ax;
      this.py[0] = ay;
      this.pz[0] = az;
      this.px[N - 1] = ex;
      this.py[N - 1] = ey;
      this.pz[N - 1] = ez;
      for (let i = 0; i < N - 1; i++) {
        const dx = this.px[i + 1] - this.px[i];
        const dy = this.py[i + 1] - this.py[i];
        const dz = this.pz[i + 1] - this.pz[i];
        const d = Math.hypot(dx, dy, dz) || 1e-5;
        const k = ((d - seg) / d) * 0.5;
        const wa = i === 0 ? 0 : 1;
        const wb = i + 1 === N - 1 ? 0 : 1;
        const sum = wa + wb || 1;
        this.px[i] += dx * k * (2 * wa / sum);
        this.py[i] += dy * k * (2 * wa / sum);
        this.pz[i] += dz * k * (2 * wa / sum);
        this.px[i + 1] -= dx * k * (2 * wb / sum);
        this.py[i + 1] -= dy * k * (2 * wb / sum);
        this.pz[i + 1] -= dz * k * (2 * wb / sum);
      }
      // ground + obstacles
      for (let i = 1; i < N - 1; i++) {
        if (this.py[i] < 0.08) this.py[i] = 0.08;
        const x = this.px[i];
        const z = this.pz[i];
        const c = s.cellAt(x, z);
        if (c < 0 || s.walk[c] || s.height[c] < 0.35 || this.py[i] > s.height[c]) continue;
        const cx = Math.floor(x);
        const cz = Math.floor(z);
        const fx = x - cx;
        const fz = z - cz;
        const dl = fx;
        const dr = 1 - fx;
        const dt2 = fz;
        const db = 1 - fz;
        const mn = Math.min(dl, dr, dt2, db);
        if (mn === dl) this.px[i] = cx - 0.02;
        else if (mn === dr) this.px[i] = cx + 1.02;
        else if (mn === dt2) this.pz[i] = cz - 0.02;
        else this.pz[i] = cz + 1.02;
      }
    }
    for (let i = 0; i < N - 1; i++) {
      this.p.set(this.px[i], this.py[i], this.pz[i]);
      this.dir.set(this.px[i + 1] - this.px[i], this.py[i + 1] - this.py[i], this.pz[i + 1] - this.pz[i]);
      const len = this.dir.length() || 1e-4;
      this.dir.divideScalar(len);
      this.q.setFromUnitVectors(this.up, this.dir);
      this.s.set(1, len + 0.03, 1);
      this.m.compose(this.p, this.q, this.s);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
