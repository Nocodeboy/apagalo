// Twin-stick touch controls + keyboard/mouse.

interface Stick {
  id: number;
  ox: number;
  oy: number;
  x: number;
  y: number;
}

const R = 58;

export class Input {
  mode: 'touch' | 'mouse' = 'ontouchstart' in window ? 'touch' : 'mouse';
  moveX = 0;
  moveY = 0;
  aimX = 0;
  aimY = 0;
  aimMag = 0;
  spray = false;
  nozzle: 0 | 1 | 2 = 0;
  mouseX = -1;
  mouseY = -1;
  private mouseDown = false;
  private keys = new Set<string>();
  private L: Stick | null = null;
  private Rs: Stick | null = null;
  enabled = false;
  onPause: () => void = () => undefined;
  onNozzle: (n: 0 | 1 | 2) => void = () => undefined;
  /** H on the keyboard: call the helicopter */
  onHeli: () => void = () => undefined;
  usedMove = false;
  usedAim = false;

  constructor(
    private layer: HTMLElement,
    private stickL: HTMLElement,
    private stickR: HTMLElement,
  ) {
    layer.addEventListener('pointerdown', (e) => this.down(e));
    window.addEventListener('pointermove', (e) => this.move(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.up(e));
    window.addEventListener('pointercancel', (e) => this.up(e));
    layer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    layer.addEventListener(
      'wheel',
      (e) => {
        if (!this.enabled) return;
        this.onNozzle(((this.nozzle + (e.deltaY > 0 ? 1 : 2)) % 3) as 0 | 1 | 2);
      },
      { passive: true },
    );
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if (!this.enabled) return;
      if (k === 'escape' || k === 'p') this.onPause();
      if (k === '1') this.onNozzle(0);
      if (k === '2') this.onNozzle(1);
      if (k === '3') this.onNozzle(2);
      if (k === 'q') this.onNozzle(((this.nozzle + 2) % 3) as 0 | 1 | 2);
      if (k === 'e') this.onNozzle(((this.nozzle + 1) % 3) as 0 | 1 | 2);
      if (k === 'h') this.onHeli();
      if (k === ' ' || k.startsWith('arrow')) e.preventDefault();
      if ('wasd'.includes(k) || k.startsWith('arrow')) {
        this.mode = 'mouse';
        this.usedMove = true;
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseDown = false;
      this.L = this.Rs = null;
      this.render();
    });
  }

  reset() {
    this.L = this.Rs = null;
    this.mouseDown = false;
    this.spray = false;
    this.moveX = this.moveY = 0;
    this.render();
  }

  private down(e: PointerEvent) {
    if (!this.enabled) return;
    if (e.pointerType === 'mouse') {
      this.mode = 'mouse';
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (e.button === 0) {
        this.mouseDown = true;
        this.usedAim = true;
      }
      if (e.button === 2) this.onNozzle(((this.nozzle + 1) % 3) as 0 | 1 | 2);
      return;
    }
    this.mode = 'touch';
    e.preventDefault();
    const w = window.innerWidth;
    const st: Stick = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY };
    if (e.clientX < w * 0.48) {
      if (!this.L) this.L = st;
    } else if (!this.Rs) {
      this.Rs = st;
      this.usedAim = true;
    }
    this.render();
  }

  private move(e: PointerEvent) {
    if (e.pointerType === 'mouse') {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      return;
    }
    for (const s of [this.L, this.Rs]) {
      if (s && s.id === e.pointerId) {
        s.x = e.clientX;
        s.y = e.clientY;
        // drag the base along when pulling far (floating stick)
        const dx = s.x - s.ox;
        const dy = s.y - s.oy;
        const d = Math.hypot(dx, dy);
        if (d > R * 1.4) {
          s.ox = s.x - (dx / d) * R * 1.4;
          s.oy = s.y - (dy / d) * R * 1.4;
        }
        if (e.cancelable) e.preventDefault();
      }
    }
    this.render();
  }

  private up(e: PointerEvent) {
    if (e.pointerType === 'mouse') {
      if (e.button === 0) this.mouseDown = false;
      return;
    }
    if (this.L && this.L.id === e.pointerId) this.L = null;
    if (this.Rs && this.Rs.id === e.pointerId) this.Rs = null;
    this.render();
  }

  private render() {
    const show = (el: HTMLElement, s: Stick | null) => {
      if (!s) {
        el.classList.remove('on');
        return;
      }
      el.classList.add('on');
      el.style.transform = `translate(${s.ox}px, ${s.oy}px)`;
      const knob = el.firstElementChild as HTMLElement;
      let dx = s.x - s.ox;
      let dy = s.y - s.oy;
      const d = Math.hypot(dx, dy);
      if (d > R) {
        dx = (dx / d) * R;
        dy = (dy / d) * R;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    show(this.stickL, this.L);
    show(this.stickR, this.Rs);
  }

  /** Refresh derived values once per frame. */
  poll() {
    let mx = 0;
    let my = 0;
    const k = this.keys;
    if (k.has('a') || k.has('arrowleft')) mx -= 1;
    if (k.has('d') || k.has('arrowright')) mx += 1;
    if (k.has('w') || k.has('arrowup')) my -= 1;
    if (k.has('s') || k.has('arrowdown')) my += 1;
    if (this.L) {
      const dx = this.L.x - this.L.ox;
      const dy = this.L.y - this.L.oy;
      const d = Math.hypot(dx, dy);
      if (d > 8) {
        const m = Math.min(1, d / R);
        mx = (dx / d) * m;
        my = (dy / d) * m;
        this.usedMove = true;
      }
    }
    const ml = Math.hypot(mx, my);
    if (ml > 1) {
      mx /= ml;
      my /= ml;
    }
    this.moveX = mx;
    this.moveY = my;
    this.spray = false;
    this.aimMag = 0;
    if (this.mode === 'touch') {
      if (this.Rs) {
        const dx = this.Rs.x - this.Rs.ox;
        const dy = this.Rs.y - this.Rs.oy;
        const d = Math.hypot(dx, dy);
        if (d > 10) {
          this.aimX = dx / d;
          this.aimY = dy / d;
          this.aimMag = Math.min(1, d / R);
        }
        this.spray = true;
      }
    } else {
      this.spray = this.mouseDown || k.has(' ');
    }
  }
}
