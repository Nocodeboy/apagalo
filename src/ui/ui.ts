import { t, tx } from '../i18n';
import type { Label } from '../render/view';
import type { Stage } from '../render/stage';
import { THEMES } from '../render/themes';
import type { LevelDef } from '../sim/types';
import type { Result } from '../sim/world';
import { IC } from './icons';

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;

export function el(html: string): HTMLElement {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild as HTMLElement;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function starsTxt(n: number, max = 3): string {
  let o = '';
  for (let i = 0; i < max; i++) o += `<span class="${i < n ? 'star-on' : 'star-off'}">★</span>`;
  return o;
}

// ---------------- screens ----------------
const screens = () => $('#screens');

export function clearScreens() {
  screens().innerHTML = '';
}

export function show(node: HTMLElement) {
  clearScreens();
  screens().appendChild(node);
  const first = node.querySelector<HTMLElement>('[data-focus]');
  first?.focus({ preventScroll: true });
}

function hex(n: number) {
  return '#' + n.toString(16).padStart(6, '0');
}

export interface TitleOpts {
  playLabel: string;
  playLevel: number | null;
  stars: number;
  maxStars: number;
  dailyNum: number;
  dailyDone: boolean;
  streak: number;
  onPlay: () => void;
  onLevels: () => void;
  onDaily: () => void;
  onSettings: () => void;
  /** Privacy notice for new players (CrazyGames asks for it when the game collects its own stats). */
  privacyUrl?: string;
}
export function titleScreen(o: TitleOpts) {
  const n = el(`
  <div class="screen title-screen">
    <div class="logo">
      <h1><span class="ex">¡</span>APÁGALO<span class="ex">!</span></h1>
      <div class="tape"></div>
      <p>${t('tagline')}</p>
    </div>
    <div class="menu">
      <button class="btn big" data-a="play" data-focus>${IC.play}${esc(o.playLabel)}${o.playLevel ? `<span class="lvtag">${o.playLevel}</span>` : ''}</button>
      <div class="row">
        <button class="btn ghost" data-a="levels">${IC.grid}${t('levels')}</button>
        <button class="btn amber daily-btn" data-a="daily">${IC.cal}#${o.dailyNum}${o.streak > 0 ? `<span class="badge">🔥 ${o.streak}</span>` : o.dailyDone ? `<span class="badge">✓</span>` : ''}</button>
      </div>
      <div class="foot"><button class="icon-btn" data-a="settings" aria-label="${t('settings')}">${IC.gear}</button><span class="starcount"><span class="star-on">★</span> ${o.stars}/${o.maxStars}</span><span>${t('credits')}</span></div>
      ${o.privacyUrl ? `<p class="privacy-note">${t('privacyNote')} <a href="${o.privacyUrl}" target="_blank" rel="noopener">${t('privacyPolicy')}</a></p>` : ''}
    </div>
  </div>`);
  n.querySelector('[data-a=play]')!.addEventListener('click', o.onPlay);
  n.querySelector('[data-a=levels]')!.addEventListener('click', o.onLevels);
  n.querySelector('[data-a=daily]')!.addEventListener('click', o.onDaily);
  n.querySelector('[data-a=settings]')!.addEventListener('click', o.onSettings);
  show(n);
}

export function levelsScreen(levels: LevelDef[], stars: Record<string, number>, best: Record<string, number>, unlocked: (i: number) => boolean, onPick: (i: number) => void, onBack: () => void) {
  const total = levels.reduce((a, L) => a + (stars[L.id] ?? 0), 0);
  const cards = levels
    .map((L, i) => {
      const th = THEMES[L.theme];
      const bg = `linear-gradient(160deg, ${hex(th.sky)} 0%, ${hex(th.outside)} 70%, ${th.grass[1]} 100%)`;
      const lock = !unlocked(i);
      return `<button class="lvl${lock ? ' locked' : ''}" data-i="${i}" style="background:${bg}" ${lock ? 'aria-disabled="true"' : ''}>
        <span class="num">${L.num}</span>${!lock && !stars[L.id] ? `<span class="new">${t('newTag')}</span>` : ''}
        <span class="nm">${esc(tx(L.name))}</span>
        <span class="st"><span>${lock ? '🔒' : starsTxt(stars[L.id] ?? 0)}</span>${best[L.id] ? `<small>${best[L.id].toLocaleString()}</small>` : ''}</span>
      </button>`;
    })
    .join('');
  const n = el(`
  <div class="screen dim">
    <div class="panel wide">
      <div class="tape"></div>
      <div class="panel-head"><div class="eyebrow"><span class="star-on">★</span> ${total}/${levels.length * 3}</div><h2>${t('levels')}</h2></div>
      <div class="panel-body">
        <div class="levels">${cards}</div>
        <div class="actions"><button class="btn ghost" data-a="back" data-focus>${IC.back}${t('back')}</button></div>
      </div>
    </div>
  </div>`);
  n.querySelectorAll<HTMLElement>('.lvl').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (!unlocked(i)) {
        toast(t('locked'), 'warn');
        return;
      }
      onPick(i);
    }),
  );
  n.querySelector('[data-a=back]')!.addEventListener('click', onBack);
  show(n);
}

function windPill(angle: number, strength: number) {
  const pct = Math.round(strength * 100);
  return `<span class="pill"><span style="display:inline-grid;transform:rotate(${angle + 90}deg)">${IC.wind}</span>${pct < 20 ? t('breeze') : pct < 40 ? t('windy') : t('strongWind')}</span>`;
}

export function goalsHtml(def: LevelDef, hasRescues: boolean, saved?: number): string {
  const [s2, s3] = def.stars;
  const mark = (ok: boolean) => (saved === undefined ? '' : `<span class="gchk ${ok ? 'ok' : ''}">${ok ? '✓' : '·'}</span>`);
  return `<div class="goals">
    <div class="goal"><span class="stars">${starsTxt(1)}</span><span>${t('goal1')}</span>${mark(false)}</div>
    <div class="goal"><span class="stars">${starsTxt(2)}</span><span>${t('goal2', { n: Math.round(s2 * 100) })}</span>${mark(saved !== undefined && saved >= s2)}</div>
    <div class="goal"><span class="stars">${starsTxt(3)}</span><span>${hasRescues ? t('goal3', { n: Math.round(s3 * 100) }) : t('goal3b', { n: Math.round(s3 * 100) })}</span>${mark(saved !== undefined && saved >= s3)}</div>
  </div>`;
}

export interface IntroOpts {
  def: LevelDef;
  eyebrow: string;
  title: string;
  tip: string;
  wind: { angle: number; strength: number };
  hasRescues: boolean;
  extra?: string;
  onGo: () => void;
  onBack: () => void;
}
export function introScreen(o: IntroOpts) {
  const n = el(`
  <div class="screen dim">
    <div class="panel">
      <div class="tape"></div>
      <div class="panel-head"><div class="eyebrow">${esc(o.eyebrow)}</div><h2>${esc(o.title)}</h2></div>
      <div class="panel-body">
        <div class="tip">${IC.flame.replace('<svg', '<svg style="width:26px;height:26px;flex:none;color:#ffb21f"')}<p>${esc(o.tip)}</p></div>
        ${goalsHtml(o.def, o.hasRescues)}
        <div class="meta"><span class="pill">${IC.clock}${fmtTime(o.def.time)}</span>${windPill(o.wind.angle, o.wind.strength)}${o.extra ?? ''}</div>
        <div class="actions">
          <button class="btn ghost" data-a="back" aria-label="${t('back')}" style="flex:0 0 60px;padding:0">${IC.back}</button>
          <button class="btn big" data-a="go" data-focus style="flex:1 1 160px">${t('go')}</button>
        </div>
      </div>
    </div>
  </div>`);
  n.querySelector('[data-a=go]')!.addEventListener('click', o.onGo);
  n.querySelector('[data-a=back]')!.addEventListener('click', o.onBack);
  show(n);
}

export interface PauseOpts {
  goals: string;
  sfx: boolean;
  music: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onSfx: (on: boolean) => void;
  onMusic: (on: boolean) => void;
}
export function pauseScreen(o: PauseOpts) {
  const n = el(`
  <div class="screen dim">
    <div class="panel">
      <div class="tape"></div>
      <div class="panel-head"><h2>${t('pause')}</h2></div>
      <div class="panel-body">
        ${o.goals}
        <button class="btn big" data-a="resume" data-focus>${IC.play}${t('resume')}</button>
        <div class="actions">
          <button class="btn ghost" data-a="restart">${IC.retry}${t('restart')}</button>
          <button class="btn ghost" data-a="menu">${IC.home}${t('menu')}</button>
        </div>
        <div class="setting"><span>${t('sound')}</span><button class="toggle${o.sfx ? ' on' : ''}" data-a="sfx">${o.sfx ? 'ON' : 'OFF'}</button></div>
        <div class="setting"><span>${t('music')}</span><button class="toggle${o.music ? ' on' : ''}" data-a="music">${o.music ? 'ON' : 'OFF'}</button></div>
      </div>
    </div>
  </div>`);
  n.querySelector('[data-a=resume]')!.addEventListener('click', o.onResume);
  n.querySelector('[data-a=restart]')!.addEventListener('click', o.onRestart);
  n.querySelector('[data-a=menu]')!.addEventListener('click', o.onMenu);
  const tg = (a: string, cb: (on: boolean) => void) => {
    const b = n.querySelector<HTMLElement>(`[data-a=${a}]`)!;
    b.addEventListener('click', () => {
      const on = !b.classList.contains('on');
      b.classList.toggle('on', on);
      b.textContent = on ? 'ON' : 'OFF';
      cb(on);
    });
  };
  tg('sfx', o.onSfx);
  tg('music', o.onMusic);
  show(n);
}

export interface EndOpts {
  r: Result;
  eyebrow: string;
  best: number;
  newBest: boolean;
  hasNext: boolean;
  shareText: string | (() => string);
  extraHtml?: string;
  footer?: string;
  onNext: () => void;
  onRetry: () => void;
  onMenu: () => void;
  onShared: () => void;
  onStar: (i: number) => void;
}
export function endScreen(o: EndOpts) {
  const r = o.r;
  const title = r.win ? t('win') : r.reason === 'time' ? t('loseTime') : t('loseControl');
  const n = el(`
  <div class="screen dim">
    <div class="panel">
      <div class="tape"></div>
      <div class="panel-head" style="text-align:center"><div class="eyebrow">${esc(o.eyebrow)}</div></div>
      <div class="panel-body">
        <h2 class="end-title ${r.win ? 'win' : 'lose'}">${title}</h2>
        <div class="bigstars"><span>★</span><span>★</span><span>★</span></div>
        ${r.win ? '' : `<div class="tip"><p>${t('loseTip')}</p></div>`}
        <div class="stats" style="grid-template-columns:repeat(${r.rescueTotal ? 2 : 3}, 1fr)">
          <div class="stat"><div class="k">${t('statSaved')}</div><div class="v">${Math.round(r.saved * 100)}%</div></div>
          <div class="stat"><div class="k">${t('statTime')}</div><div class="v">${fmtTime(r.timeUsed)}</div></div>
          ${r.rescueTotal ? `<div class="stat"><div class="k">${t('statRescued')}</div><div class="v">${r.win ? r.rescueTotal - r.fled : r.rescued}/${r.rescueTotal}</div></div>` : ''}
          <div class="stat"><div class="k">${t('statCombo')}</div><div class="v">x${r.maxCombo}</div></div>
          ${r.win ? `<div class="stat wide"><div class="k">${t('statScore')}</div><div class="v">${r.score.toLocaleString()}</div></div>` : ''}
        </div>
        ${o.newBest && r.win ? `<div class="newbest">${t('newBest')}</div>` : o.best > 0 ? `<div class="muted" style="text-align:center">${t('best')}: ${o.best.toLocaleString()}</div>` : ''}
        ${o.extraHtml ?? ''}
        ${o.footer ? `<div class="muted" style="text-align:center">${esc(o.footer)}</div>` : ''}
        <div class="actions">
          ${
            r.win && o.hasNext
              ? `<button class="btn big" data-a="next" data-focus style="flex:1 1 100%">${t('next')}${IC.next}</button>`
              : r.win
                ? `<button class="btn big water" data-a="share" data-focus style="flex:1 1 100%">${IC.share}${t('share')}</button>`
                : `<button class="btn big" data-a="retry" data-focus style="flex:1 1 100%">${IC.retry}${t('restart')}</button>`
          }
        </div>
        <div class="actions">
          ${r.win ? `<button class="btn ghost" data-a="retry" aria-label="${t('restart')}" style="flex:0 0 60px;padding:0">${IC.retry}</button>` : ''}
          ${r.win && o.hasNext ? `<button class="btn water" data-a="share" style="flex:1 1 120px">${IC.share}${t('share')}</button>` : ''}
          <button class="btn ghost" data-a="menu" aria-label="${t('menu')}" style="${r.win && o.hasNext ? 'flex:0 0 60px;padding:0' : 'flex:1 1 100%'}">${IC.home}${r.win && o.hasNext ? '' : t('menu')}</button>
        </div>
      </div>
    </div>
  </div>`);
  n.querySelector('[data-a=next]')?.addEventListener('click', o.onNext);
  n.querySelector('[data-a=retry]')!.addEventListener('click', o.onRetry);
  n.querySelector('[data-a=menu]')!.addEventListener('click', o.onMenu);
  n.querySelector('[data-a=share]')?.addEventListener('click', () => {
    shareText(typeof o.shareText === 'function' ? o.shareText() : o.shareText, n.querySelector('.panel-body')!);
    o.onShared();
  });
  show(n);
  const stars = n.querySelectorAll<HTMLElement>('.bigstars span');
  stars.forEach((s, i) => {
    setTimeout(() => {
      s.classList.add('show');
      if (i < r.stars) {
        s.classList.add('on');
        o.onStar(i);
      }
    }, 350 + i * 380);
  });
}

export function shareText(text: string, host: HTMLElement) {
  // Android app: native share sheet (Capacitor Share plugin). Phones on the web: Web Share API.
  const cap = (window as unknown as { Capacitor?: { Plugins?: { Share?: { share: (o: { text: string; dialogTitle?: string }) => Promise<unknown> } } } }).Capacitor;
  const nativeShare = cap?.Plugins?.Share;
  if (nativeShare) {
    nativeShare.share({ text, dialogTitle: '¡Apágalo!' }).catch(() => undefined);
    return;
  }
  if (typeof navigator.share === 'function' && matchMedia('(pointer: coarse)').matches) {
    navigator.share({ text }).catch(() => undefined);
    return;
  }
  const fallback = () => {
    let ta = host.querySelector<HTMLTextAreaElement>('textarea.sharebox');
    if (!ta) {
      ta = document.createElement('textarea');
      ta.className = 'sharebox';
      ta.id = 'sharebox';
      ta.readOnly = true;
      host.appendChild(ta);
    }
    ta.value = text;
    ta.focus();
    ta.select();
  };
  try {
    const p = navigator.clipboard?.writeText(text);
    if (p) p.then(() => toast(t('copied'), 'good')).catch(fallback);
    else fallback();
  } catch {
    fallback();
  }
}

export interface SettingsOpts {
  sfx: boolean;
  music: boolean;
  vibration: boolean;
  stats: boolean;
  privacyUrl?: string;
  version?: string;
  gfx: 'auto' | 'high' | 'medium' | 'low';
  lang: 'es' | 'en';
  onChange: (k: string, v: string | boolean) => void;
  onReset: () => void;
  onBack: () => void;
}
export function settingsScreen(o: SettingsOpts) {
  const tog = (k: string, on: boolean) => `<button class="toggle${on ? ' on' : ''}" data-k="${k}" id="set-${k}">${on ? 'ON' : 'OFF'}</button>`;
  const n = el(`
  <div class="screen dim">
    <div class="panel">
      <div class="tape"></div>
      <div class="panel-head"><h2>${t('settings')}</h2></div>
      <div class="panel-body">
        <div class="setting"><span>${t('sound')}</span>${tog('sfx', o.sfx)}</div>
        <div class="setting"><span>${t('music')}</span>${tog('music', o.music)}</div>
        <div class="setting"><span>${t('vibration')}</span>${tog('vibration', o.vibration)}</div>
        <div class="setting"><span>${t('stats')}<small class="muted" style="display:block;font-size:13px;font-weight:600">${t('statsNote')}</small></span>${tog('stats', o.stats)}</div>
        <div class="setting"><span>${t('quality')}</span><button class="toggle" data-k="gfx" data-v="${o.gfx}" id="set-gfx">${t(('gfx_' + o.gfx) as 'gfx_auto')}</button></div>
        <div class="setting"><span>${t('language')}</span><button class="toggle" data-k="lang" id="set-lang">${o.lang === 'es' ? 'Español' : 'English'}</button></div>
        <div class="actions">
          <button class="btn ghost" data-a="back" data-focus>${IC.back}${t('back')}</button>
          <button class="btn ghost" data-a="reset" style="color:#ffb8ae">${t('reset')}</button>
        </div>
        ${o.privacyUrl ? `<p class="muted" style="text-align:center;font-size:14px"><a href="${o.privacyUrl}" target="_blank" rel="noopener" style="color:#7fd6ff">${t('privacy')}</a> · v${o.version ?? ''}</p>` : ''}
      </div>
    </div>
  </div>`);
  n.querySelectorAll<HTMLElement>('.toggle').forEach((b) =>
    b.addEventListener('click', () => {
      const k = b.dataset.k!;
      if (k === 'gfx') {
        const order = ['auto', 'high', 'medium', 'low'] as const;
        const v = order[(order.indexOf(b.dataset.v as (typeof order)[number]) + 1) % order.length];
        b.dataset.v = v;
        b.textContent = t(('gfx_' + v) as 'gfx_auto');
        o.onChange(k, v);
      } else if (k === 'lang') {
        const v = b.textContent === 'Español' ? 'en' : 'es';
        o.onChange(k, v);
      } else {
        const on = !b.classList.contains('on');
        b.classList.toggle('on', on);
        b.textContent = on ? 'ON' : 'OFF';
        o.onChange(k, on);
      }
    }),
  );
  let armed = false;
  const rb = n.querySelector<HTMLElement>('[data-a=reset]')!;
  rb.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      rb.textContent = t('resetConfirm');
      return;
    }
    o.onReset();
  });
  n.querySelector('[data-a=back]')!.addEventListener('click', o.onBack);
  show(n);
}

// ---------------- big banner (level end) ----------------
export function banner(text: string, kind: 'win' | 'lose') {
  const host = $('#app');
  host.querySelector('.banner')?.remove();
  const n = el(`<div class="banner ${kind}"><span>${esc(text)}</span></div>`);
  host.appendChild(n);
  setTimeout(() => n.classList.add('out'), 1500);
  setTimeout(() => n.remove(), 2000);
}

// ---------------- toasts ----------------
export function toast(text: string, kind: '' | 'warn' | 'good' = '', ms = 2200) {
  const host = $('#toast');
  while (host.children.length > 1) host.firstElementChild!.remove();
  const n = el(`<div class="toast ${kind}">${esc(text)}</div>`);
  host.appendChild(n);
  setTimeout(() => n.classList.add('out'), ms);
  setTimeout(() => n.remove(), ms + 350);
}

// ---------------- floating world texts ----------------
interface Floater {
  node: HTMLElement;
  x: number;
  y: number;
  z: number;
  t: number;
}
const floaters: Floater[] = [];
export function floater(text: string, x: number, y: number, z: number, kind = '') {
  const host = $('#floaters');
  if (floaters.length > 10) {
    const f = floaters.shift()!;
    f.node.remove();
  }
  const node = el(`<div class="fl ${kind}">${esc(text)}</div>`);
  host.appendChild(node);
  floaters.push({ node, x, y, z, t: 0 });
}
export function updateFloaters(stage: Stage, dt: number) {
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.t += dt;
    const k = f.t / 1.3;
    if (k >= 1) {
      f.node.remove();
      floaters.splice(i, 1);
      continue;
    }
    const p = stage.toScreen(f.x, f.y, f.z);
    const w = f.node.offsetWidth;
    const sc = k < 0.15 ? 0.6 + (k / 0.15) * 0.5 : 1.1 - Math.min(0.1, (k - 0.15) * 0.3);
    f.node.style.transform = `translate(${p.x - w / 2}px, ${p.y - 40 - k * 50}px) scale(${sc})`;
    f.node.style.opacity = String(k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1);
  }
}
export function clearFloaters() {
  for (const f of floaters) f.node.remove();
  floaters.length = 0;
}

// ---------------- world icons ----------------
const iconPool: HTMLElement[] = [];
export function updateIcons(stage: Stage, labels: Label[], edges: { x: number; z: number }[], leverText: string) {
  const host = $('#icons');
  let n = 0;
  const get = () => {
    let e = iconPool[n];
    if (!e) {
      e = document.createElement('div');
      host.appendChild(e);
      iconPool.push(e);
    }
    n++;
    e.style.display = '';
    return e;
  };
  for (const l of labels) {
    const p = stage.toScreen(l.x, l.y, l.z);
    if (!p.on) continue;
    const e = get();
    e.dataset.k = l.kind;
    if (l.kind === 'alert') {
      e.className = 'ic alert' + (l.v > 0.6 ? ' hot' : '');
      e.textContent = '!';
    } else if (l.kind === 'pressure') {
      e.className = 'ic gauge';
      const c = l.v > 0.7 ? '#ff4b3a' : l.v > 0.4 ? '#ffb21f' : '#3cc46e';
      e.style.background = `conic-gradient(${c} ${Math.round(l.v * 360)}deg, rgba(255,255,255,.2) 0)`;
      e.innerHTML = `<span>${Math.round(l.v * 100)}</span>`;
    } else if (l.kind === 'lever') {
      e.className = 'ic lever';
      e.textContent = leverText;
    }
    e.style.transform = `translate(${p.x}px, ${p.y + (l.kind === 'lever' ? Math.sin(performance.now() / 200) * 4 : 0)}px)`;
  }
  // off-screen fire indicators, kept clear of the HUD and the minimap
  const W = window.innerWidth;
  const H = window.innerHeight;
  const mm = document.getElementById('minimap');
  const mr = mm && !$('#hud').hidden ? mm.getBoundingClientRect() : null;
  const L = 26;
  const R = W - 26;
  const T = 76;
  const B = H - 26;
  const cx = W / 2;
  const cy = (T + B) / 2;
  for (const c of edges) {
    const p = stage.toScreen(c.x, 0.5, c.z);
    if (p.on && p.x > L && p.x < R && p.y > T && p.y < B) continue;
    const dx = p.x - cx;
    const dy = p.y - cy;
    const kx = dx !== 0 ? (dx > 0 ? R - cx : L - cx) / dx : Infinity;
    const ky = dy !== 0 ? (dy > 0 ? B - cy : T - cy) / dy : Infinity;
    const k = Math.min(kx, ky, 1);
    let ex = cx + dx * k;
    let ey = cy + dy * k;
    // slide out from under the minimap
    if (mr && ex < mr.right + 24 && ey < mr.bottom + 24) {
      if (ey <= T + 2) ex = mr.right + 26;
      else ey = mr.bottom + 26;
    }
    const e = get();
    e.className = 'ic edge';
    if (e.dataset.k !== 'edge') {
      e.innerHTML = IC.flame;
      e.dataset.k = 'edge';
    }
    e.style.transform = `translate(${ex}px, ${ey}px)`;
  }
  for (let i = n; i < iconPool.length; i++) iconPool[i].style.display = 'none';
}

// ---------------- HUD ----------------
export function buildHud(onPause: () => void, onNozzle: (n: 0 | 1 | 2) => void) {
  const hud = $('#hud');
  hud.innerHTML = `
    <div class="hud-row">
      <button class="icon-btn" id="hud-pause" aria-label="${t('pause')}">${IC.pause}</button>
      <div class="bar"><div class="fill" id="hud-fill" style="width:0%"></div><div class="lbl"><span>${t('control')}</span><span id="hud-pct">0%</span></div></div>
      <div class="chip timer" id="hud-time">0:00</div>
    </div>
    <div class="hud-row" id="hud-chips">
      <div class="chip" id="hud-saved">${IC.house}<span class="hstars"></span><span class="pct">100%</span></div>
      <div class="chip" id="hud-resc" hidden>${IC.paw}<span class="dots"></span></div>
      <div class="chip" id="hud-wind"><span class="wind" id="hud-windarrow">${IC.wind}</span></div>
      <div class="chip" id="hud-rockets" hidden>${IC.rocket}<span>0</span></div>
    </div>
    <div class="hud-row mm-row"><canvas id="minimap" aria-hidden="true"></canvas></div>`;
  $('#hud-pause').addEventListener('click', onPause);
  const nz = $('#nozzles');
  nz.innerHTML = `
    <button class="noz sel" data-n="0" aria-label="${t('jet')}">${IC.jet}<span>${t('jet')}</span></button>
    <button class="noz" data-n="1" aria-label="${t('fog')}">${IC.fog}<span>${t('fog')}</span></button>
    <button class="noz" data-n="2" aria-label="${t('foam')}">${IC.foam}<span>${t('foam')}</span><span class="cnt"><b id="hud-foam" style="width:100%"></b></span></button>`;
  nz.querySelectorAll<HTMLElement>('.noz').forEach((b) =>
    b.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      onNozzle(Number(b.dataset.n) as 0 | 1 | 2);
    }),
  );
}

export interface HudState {
  stars: [number, number];
  fled: number;
  control: number;
  time: number;
  saved: number;
  rescue: { total: number; states: number[] };
  wind: number;
  windStrength: number;
  nozzle: number;
  foam: number;
  foamMax: number;
  rockets: number;
  hasRockets: boolean;
}
let lastHud = '';
let lastStars = 3;
let onStarLost: () => void = () => undefined;
export function setStarLostHandler(f: () => void) {
  onStarLost = f;
}
export function updateHud(s: HudState) {
  const pct = Math.round(s.control * 100);
  const key = `${pct}|${Math.ceil(s.time)}|${Math.round(s.saved * 1000)}|${s.fled}|${s.rescue.states.join('')}|${Math.round(s.wind)}|${s.nozzle}|${s.foam.toFixed(1)}|${s.rockets}`;
  if (key === lastHud) return;
  lastHud = key;
  $('#hud-fill').style.width = `calc(${Math.max(3, pct)}% - 8px)`;
  $('#hud-pct').textContent = `${pct}%`;
  const tm = $('#hud-time');
  tm.textContent = fmtTime(s.time);
  tm.classList.toggle('low', s.time <= 15);
  const sv = $('#hud-saved');
  sv.querySelector('.pct')!.textContent = `${Math.round(s.saved * 100)}%`;
  const nStars = 1 + (s.saved >= s.stars[0] ? 1 : 0) + (s.saved >= s.stars[1] && s.fled === 0 ? 1 : 0);
  sv.querySelector('.hstars')!.innerHTML = starsTxt(nStars);
  if (nStars < lastStars) {
    sv.classList.remove('lost');
    void sv.offsetWidth;
    sv.classList.add('lost');
    onStarLost();
  }
  lastStars = nStars;
  sv.classList.toggle('bad', nStars === 1);
  const rc = $('#hud-resc');
  rc.hidden = s.rescue.total === 0;
  if (s.rescue.total) rc.querySelector('.dots')!.innerHTML = s.rescue.states.map((st) => `<i class="${st === 1 ? 'ok' : st === 2 ? 'lost' : ''}"></i>`).join('');
  $('#hud-windarrow').style.transform = `rotate(${s.wind + 90}deg) scale(${0.8 + s.windStrength * 0.6})`;
  const rk = $('#hud-rockets');
  rk.hidden = !s.hasRockets;
  rk.lastElementChild!.textContent = String(s.rockets);
  document.querySelectorAll<HTMLElement>('.noz').forEach((b) => b.classList.toggle('sel', Number(b.dataset.n) === s.nozzle));
  const foamBtn = document.querySelector<HTMLButtonElement>('.noz[data-n="2"]');
  if (foamBtn) {
    foamBtn.hidden = s.foamMax <= 0;
    foamBtn.disabled = s.foam <= 0;
    $('#hud-foam').style.width = `${s.foamMax > 0 ? (s.foam / s.foamMax) * 100 : 0}%`;
  }
}
export function resetHudCache() {
  lastHud = '';
  lastStars = 3;
}
