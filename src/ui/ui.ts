import { EVENT_INFO, PLACE_COLOR, PLACE_INFO, POWER_INFO } from '../content';
import { num, t, tx } from '../i18n';
import type { Label } from '../render/view';
import type { Stage } from '../render/stage';
import { THEMES } from '../render/themes';
import { FINALE_ID } from '../sim/campaign/finale';
import type { EventKind, LevelDef, News, PowerKind } from '../sim/types';
import type { Result } from '../sim/world';
import { CREW_ICON, EVENT_ICON, IC, PLACE_ICON, POWER_ICON } from './icons';

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;

export function el(html: string): HTMLElement {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild as HTMLElement;
}

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const counting = new WeakMap<HTMLElement, object>();
/** Animates a number in `node` from `from` to `to` (coins). `prefix` goes before it, e.g. "+". */
export function countUp(node: HTMLElement, from: number, to: number, ms: number, prefix = '', onTick?: () => void) {
  const token = {};
  counting.set(node, token);
  if (ms <= 0 || reducedMotion() || from === to) {
    node.textContent = prefix + num(to);
    return;
  }
  const t0 = performance.now();
  let lastTick = 0;
  const step = (now: number) => {
    if (counting.get(node) !== token) return; // a newer count took over
    const k = Math.min(1, (now - t0) / ms);
    node.textContent = prefix + num(Math.round(from + (to - from) * (1 - (1 - k) * (1 - k))));
    if (onTick && now - lastTick > 70 && k < 1) {
      lastTick = now;
      onTick();
    }
    if (k < 1 && node.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Coin balance pill; as a button it opens the shop. */
export function walletHtml(coins: number, id = '') {
  return `<button class="wallet" data-a="shop" aria-label="${t('shop')}">${IC.coin}<b${id ? ` id="${id}"` : ''}>${num(coins)}</b><span class="plus">+</span></button>`;
}

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
  overlay(node);
}

/** Puts a screen on top of the current one (popups); remove the node to close it. */
export function overlay(node: HTMLElement) {
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
  coins: number;
  onPlay: () => void;
  onLevels: () => void;
  onDaily: () => void;
  onSettings: () => void;
  onShop: () => void;
  /** Privacy notice for new players (CrazyGames asks for it when the game collects its own stats). */
  privacyUrl?: string;
  /** "More games" (the studio's other games): web and Android only */
  onMore?: () => void;
}
export function titleScreen(o: TitleOpts) {
  const logo = t('logo');
  const n = el(`
  <div class="screen title-screen">
    ${walletHtml(o.coins)}
    <div class="logo">
      <h1 class="${logo.length > 9 ? 'long' : ''}">${esc(logo).replace(/[¡!]/g, (c) => `<span class="ex">${c}</span>`)}</h1>
      <div class="tape"></div>
      <p>${t('tagline')}</p>
    </div>
    <div class="menu">
      <button class="btn big" data-a="play" data-focus>${IC.play}${esc(o.playLabel)}${o.playLevel ? `<span class="lvtag">${o.playLevel}</span>` : ''}</button>
      <div class="row">
        <button class="btn ghost" data-a="levels">${IC.grid}${t('levels')}</button>
        <button class="btn amber daily-btn" data-a="daily">${IC.cal}#${o.dailyNum}${o.streak > 0 ? `<span class="badge">🔥 ${o.streak}</span>` : o.dailyDone ? `<span class="badge">✓</span>` : ''}</button>
      </div>
      <div class="foot"><button class="icon-btn" data-a="settings" aria-label="${t('settings')}">${IC.gear}</button><span class="starcount"><span class="star-on">★</span> ${o.stars}/${o.maxStars}</span>${o.onMore ? `<button class="more-btn" data-a="more">${IC.grid}${t('moreGames')}</button>` : `<span>${t('credits')}</span>`}</div>
      ${o.privacyUrl ? `<p class="privacy-note">${t('privacyNote')} <a href="${o.privacyUrl}" target="_blank" rel="noopener">${t('privacyPolicy')}</a></p>` : ''}
    </div>
  </div>`);
  n.querySelector('[data-a=play]')!.addEventListener('click', o.onPlay);
  n.querySelector('[data-a=levels]')!.addEventListener('click', o.onLevels);
  n.querySelector('[data-a=daily]')!.addEventListener('click', o.onDaily);
  n.querySelector('[data-a=settings]')!.addEventListener('click', o.onSettings);
  n.querySelector('[data-a=shop]')!.addEventListener('click', o.onShop);
  if (o.onMore) n.querySelector('[data-a=more]')!.addEventListener('click', o.onMore);
  show(n);
}

/** The studio's other games: a card each, with the link to play it (opens outside the game). */
export function moreGamesModal(o: { games: { id: string; name: string; tagline: string; href: string; color: string; emoji: string }[]; onOpen: (id: string) => void; onClose: () => void }) {
  const n = el(`
  <div class="screen dim">
    <div class="panel offer more-games">
      <div class="tape"></div>
      <div class="panel-head" style="text-align:center"><div class="eyebrow">${esc(t('credits'))}</div><h2>${esc(t('moreGamesTitle'))}</h2></div>
      <div class="panel-body">
        ${o.games
          .map(
            (g) => `<a class="game-card" href="${esc(g.href)}" target="_blank" rel="noopener" data-id="${esc(g.id)}" style="--gc:${g.color}">
              <span class="gc-ic" aria-hidden="true">${g.emoji}</span>
              <span class="gc-t"><b>${esc(g.name)}</b><small>${esc(g.tagline)}</small></span>
              <span class="gc-go">${t('moreGamesPlay')}${IC.next}</span>
            </a>`,
          )
          .join('')}
        <button class="btn ghost" data-a="back" data-focus>${IC.back}${t('back')}</button>
      </div>
    </div>
  </div>`);
  n.querySelectorAll<HTMLElement>('.game-card').forEach((a) => a.addEventListener('click', () => o.onOpen(a.dataset.id!)));
  n.querySelector('[data-a=back]')!.addEventListener('click', () => {
    n.remove();
    o.onClose();
  });
  overlay(n);
}

/** Levels per chapter of the level select: 1-10, 11-20... each one ends with its big fire. */
export const LEVELS_PER_PAGE = 10;

export interface LevelsOpts {
  levels: LevelDef[];
  stars: Record<string, number>;
  best: Record<string, number>;
  unlocked: (i: number) => boolean;
  /** index of the next level to play: highlighted, and its page opens unless `focus` is given */
  next: number;
  /** open on the page of this level instead (coming back from its intro screen) */
  focus?: number;
  /** front pages won, by level id */
  pages: Record<string, unknown>;
  onPick: (i: number) => void;
  onBack: () => void;
  onAlbum: () => void;
}

/**
 * Level select, the route by chapters of 10: a pager (arrows, swipe, PageUp/PageDown) with a dot per chapter, and the
 * cards of the chapter in play order, each with the colour and icon of its place. The big fire closes the chapter.
 * Cards keep `.lvl[data-i]` (index in `levels`).
 */
export function levelsScreen(o: LevelsOpts) {
  const { levels, stars, best, unlocked } = o;
  const per = LEVELS_PER_PAGE;
  const pages = Math.max(1, Math.ceil(levels.length / per));
  const total = levels.reduce((a, L) => a + (stars[L.id] ?? 0), 0);
  const done = levels.filter((L) => (stars[L.id] ?? 0) > 0).length;
  const bigs = levels.filter((L) => L.big);
  const pagesWon = bigs.filter((L) => o.pages[L.id]).length;
  const clampPage = (p: number) => Math.max(0, Math.min(pages - 1, p));
  let page = clampPage(Math.floor((o.focus ?? o.next) / per));
  const span = (p: number) => [p * per, Math.min(levels.length, (p + 1) * per)] as const;
  const range = (p: number) => {
    const [a, b] = span(p);
    return `${levels[a].num}–${levels[b - 1].num}`;
  };
  const pageStars = (p: number) => {
    const [a, b] = span(p);
    let s = 0;
    for (let i = a; i < b; i++) s += stars[levels[i].id] ?? 0;
    return { s, max: (b - a) * 3 };
  };
  const nextPage = Math.floor(o.next / per);
  const isCur = (i: number) => i === o.next && unlocked(i) && !stars[levels[i].id];

  const card = (L: LevelDef, i: number) => {
    const th = THEMES[L.theme];
    const fin = L.id === FINALE_ID;
    const big = !!L.big;
    const place = (L.news ?? []).some((n) => n.kind === 'place');
    const col = PLACE_COLOR[L.theme];
    const bg = big ? `linear-gradient(160deg, #1a2350 0%, #5a2340 55%, #e2572e 100%)` : `linear-gradient(160deg, ${hex(th.sky)} 0%, ${hex(th.outside)} 70%, ${th.grass[1]} 100%)`;
    const lock = !unlocked(i);
    const cur = isCur(i);
    const st = stars[L.id] ?? 0;
    const label = `${t('level')} ${L.num}: ${tx(L.name)}${big ? ` (${t('bigFireTag')})` : ''}. ${lock ? t('lockedShort') : cur ? t('newTag') : t('starsN', { n: st })}`;
    const tag = big ? `<span class="bigtag">${IC.flame}${t('bigFire')}</span>` : place ? `<span class="placetag">${t('newPlace')}</span>` : '';
    const paper = big && o.pages[L.id] ? `<span class="paper" aria-hidden="true">${IC.news}</span>` : '';
    return `<button class="lvl${lock ? ' locked' : ''}${cur ? ' cur' : ''}${big ? ' big' : ''}${fin ? ' finale' : ''}" data-i="${i}" style="background:${bg};--pc:${col}" aria-label="${esc(label)}"${lock ? ' aria-disabled="true"' : ''}${cur ? ' aria-current="step" data-focus' : ''}>
        <span class="num">${L.num}</span><span class="pi" aria-hidden="true">${PLACE_ICON[L.theme] ?? ''}</span>${paper}
        ${tag}
        <span class="nm">${esc(tx(L.name))}</span>
        <span class="st">${lock ? '<span>🔒</span>' : cur ? `<span class="new">${IC.play}${t('newTag')}</span>` : `<span>${starsTxt(st)}</span>`}${best[L.id] ? `<small>${best[L.id].toLocaleString()}</small>` : ''}</span>
      </button>`;
  };

  const n = el(`
  <div class="screen dim levels-screen">
    <div class="panel wide lv-panel">
      <div class="tape"></div>
      <div class="panel-head lv-head">
        <button class="icon-btn" data-a="back" aria-label="${t('back')}">${IC.back}</button>
        <div class="lv-title"><h2>${t('levels')}</h2><div class="eyebrow"><span class="star-on">★</span> ${total}/${levels.length * 3}<span class="lv-done"> · ${t('levelsDone', { n: done, m: levels.length })}</span></div></div>
        <button class="album-btn" data-a="album" aria-label="${esc(t('album'))}">${IC.news}<b>${pagesWon}/${bigs.length}</b></button>
      </div>
      <div class="panel-body">
        <div class="pager">
          <button class="icon-btn pg" data-a="prev" aria-label="${t('prevPage')}">${IC.back}</button>
          <div class="pg-mid"><div class="pg-title" id="pg-title"></div><div class="pg-dots" role="tablist" aria-label="${t('levels')}">${Array.from({ length: pages }, (_, p) => `<button class="dot${p === nextPage ? ' has-next' : ''}" role="tab" data-p="${p}" aria-label="${esc(t('chapterAria2', { n: p + 1, r: range(p) }))}"></button>`).join('')}</div></div>
          <button class="icon-btn pg" data-a="nextp" aria-label="${t('nextPage')}">${IC.next}</button>
        </div>
        <div class="levels" id="lv-grid" role="tabpanel"></div>
      </div>
    </div>
  </div>`);
  const grid = n.querySelector<HTMLElement>('#lv-grid')!;
  const dots = [...n.querySelectorAll<HTMLElement>('.dot')];
  const title = n.querySelector<HTMLElement>('#pg-title')!;

  function render(dir: number) {
    const [a, b] = span(page);
    let html = '';
    for (let i = a; i < b; i++) html += card(levels[i], i);
    grid.innerHTML = html;
    const ps = pageStars(page);
    const bigL = levels.slice(a, b).find((L) => L.big);
    title.innerHTML = `<b>${esc(t('chapter', { n: page + 1 }))}</b> <span class="pg-r">${range(page)}</span> <span class="pg-s"><span class="star-on">★</span> ${ps.s}/${ps.max}</span>${bigL ? `<small>${IC.flame}${esc(tx(bigL.name))}</small>` : ''}`;
    dots.forEach((d, p) => {
      d.setAttribute('aria-selected', String(p === page));
      d.tabIndex = p === page ? 0 : -1;
      d.classList.toggle('locked', !unlocked(span(p)[0]));
      d.classList.toggle('full', pageStars(p).s === pageStars(p).max);
    });
    n.querySelector<HTMLButtonElement>('[data-a=prev]')!.disabled = page === 0;
    n.querySelector<HTMLButtonElement>('[data-a=nextp]')!.disabled = page === pages - 1;
    grid.setAttribute('aria-label', t('chapterAria2', { n: page + 1, r: range(page) }));
    grid.classList.remove('slide-l', 'slide-r');
    if (dir) {
      void grid.offsetWidth;
      grid.classList.add(dir > 0 ? 'slide-l' : 'slide-r');
    }
  }
  function go(p: number, focusDot = false) {
    p = clampPage(p);
    if (p !== page) {
      const dir = p > page ? 1 : -1;
      page = p;
      render(dir);
    }
    if (focusDot) dots[page]?.focus();
  }
  render(0);

  dots.forEach((d, p) => d.addEventListener('click', () => go(p)));
  n.querySelector('[data-a=prev]')!.addEventListener('click', () => go(page - 1));
  n.querySelector('[data-a=nextp]')!.addEventListener('click', () => go(page + 1));
  n.querySelector('.pg-dots')?.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    const to = k === 'ArrowRight' ? page + 1 : k === 'ArrowLeft' ? page - 1 : k === 'Home' ? 0 : k === 'End' ? pages - 1 : null;
    if (to === null) return;
    e.preventDefault();
    go(to, true);
  });
  n.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    if (k !== 'PageDown' && k !== 'PageUp') return;
    e.preventDefault();
    go(page + (k === 'PageDown' ? 1 : -1), true);
  });
  // swipe over the cards to change page (a swipe is not a tap on the card under the finger)
  let sx = 0;
  let sy = 0;
  let swiped = 0;
  grid.addEventListener('pointerdown', (e) => {
    sx = e.clientX;
    sy = e.clientY;
  });
  grid.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (pages > 1 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = performance.now();
      go(page + (dx < 0 ? 1 : -1));
    }
  });
  grid.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.lvl');
    if (!b || performance.now() - swiped < 400) return;
    const i = Number(b.dataset.i);
    if (!unlocked(i)) {
      toast(t('locked'), 'warn');
      return;
    }
    o.onPick(i);
  });
  n.querySelector('[data-a=back]')!.addEventListener('click', o.onBack);
  n.querySelector('[data-a=album]')!.addEventListener('click', o.onAlbum);
  show(n);
  // no highlighted level on this page (all done, or browsing another page): keyboard focus starts on the page dot
  if (!grid.querySelector('[data-focus]')) (dots[page] ?? n.querySelector<HTMLElement>('[data-a=back]'))?.focus({ preventScroll: true });
}

/** What a level brings for the first time, as pills for its intro screen. */
export function newsHtml(news: News[] | undefined): string {
  if (!news?.length) return '';
  const pill = (icon: string, text: string, cls = '') => `<span class="pill news ${cls}">${icon}<b>${esc(t('newThing'))}</b> ${esc(text)}</span>`;
  return `<div class="news-row">${news
    .map((nw) => {
      if (nw.kind === 'place') return pill(PLACE_ICON[nw.id] ?? IC.flag, `${tx(PLACE_INFO[nw.id as keyof typeof PLACE_INFO].name)}: ${tx(PLACE_INFO[nw.id as keyof typeof PLACE_INFO].tip)}`, 'place');
      if (nw.kind === 'power') return pill(POWER_ICON[nw.id], tx(POWER_INFO[nw.id as PowerKind].name), 'power');
      if (nw.kind === 'event') return pill(EVENT_ICON[nw.id], tx(EVENT_INFO[nw.id as EventKind].name).replace(/[¡!]/g, ''), 'event');
      if (nw.kind === 'crew') return pill(IC.crew, t(nw.id === 'crew2' ? 'newCrew2' : 'newCrew'), 'crew');
      return `<span class="pill news big">${IC.news}${esc(t('bigNews'))}</span>`;
    })
    .join('')}</div>`;
}

function windPill(angle: number, strength: number) {
  const pct = Math.round(strength * 100);
  return `<span class="pill"><span style="display:inline-grid;transform:rotate(${angle + 90}deg)">${IC.wind}</span>${pct < 20 ? t('breeze') : pct < 40 ? t('windy') : t('strongWind')}</span>`;
}

export function goalsHtml(def: LevelDef, hasRescues: boolean, saved?: number): string {
  const [s2, s3] = def.stars;
  const art = def.map.some((r) => r.includes('$'));
  const mark = (ok: boolean) => (saved === undefined ? '' : `<span class="gchk ${ok ? 'ok' : ''}">${ok ? '✓' : '·'}</span>`);
  return `<div class="goals">
    <div class="goal"><span class="stars">${starsTxt(1)}</span><span>${t('goal1')}</span>${mark(false)}</div>
    <div class="goal"><span class="stars">${starsTxt(2)}</span><span>${t('goal2', { n: Math.round(s2 * 100) })}</span>${mark(saved !== undefined && saved >= s2)}</div>
    <div class="goal"><span class="stars">${starsTxt(3)}</span><span>${art ? t('goal3art', { n: Math.round(s3 * 100) }) : hasRescues ? t('goal3', { n: Math.round(s3 * 100) }) : t('goal3b', { n: Math.round(s3 * 100) })}</span>${mark(saved !== undefined && saved >= s3)}</div>
  </div>`;
}

export interface CrewPick {
  /** places on this level */
  slots: number;
  /** hired crew members, with whether they come to this level */
  members: { id: string; name: string; lvl: number; on: boolean }[];
  onToggle: (id: string) => void;
}
export interface IntroOpts {
  def: LevelDef;
  eyebrow: string;
  title: string;
  tip: string;
  /** seconds on the clock (the level's time plus upgrades) */
  time: number;
  wind: { angle: number; strength: number };
  hasRescues: boolean;
  extra?: string;
  note?: string;
  /** what this level brings for the first time (pills) */
  news?: string;
  crew?: CrewPick;
  onGo: () => void;
  onBack: () => void;
}
function crewHtml(c: CrewPick): string {
  const on = c.members.filter((m) => m.on).length;
  const body = c.members.length
    ? c.members.map((m) => `<button class="crew-chip${m.on ? ' on' : ''}" data-crew="${m.id}" aria-pressed="${m.on}">${CREW_ICON[m.id]}<span>${esc(m.name)}</span><small>${'★'.repeat(m.lvl)}</small></button>`).join('')
    : `<span class="muted">${esc(t('crewNone'))}</span>`;
  return `<div class="crew-pick"><div class="eyebrow">${IC.crew}${esc(t('crewSlots', { n: on, m: c.slots }))}</div><div class="crew-row">${body}</div></div>`;
}
export function introScreen(o: IntroOpts) {
  const big = !!o.def.big;
  const n = el(`
  <div class="screen dim">
    <div class="panel${big ? ' bigfire' : ''}">
      <div class="tape"></div>
      <div class="panel-head">${big ? `<div class="bigbadge">${IC.flame}${t('bigFire')}</div>` : ''}<div class="eyebrow">${esc(o.eyebrow)}</div><h2>${esc(o.title)}</h2></div>
      <div class="panel-body">
        ${o.news ?? ''}
        <div class="tip">${IC.flame.replace('<svg', '<svg style="width:26px;height:26px;flex:none;color:#ffb21f"')}<p>${esc(o.tip)}</p></div>
        ${goalsHtml(o.def, o.hasRescues)}
        <div class="meta"><span class="pill">${IC.clock}${fmtTime(o.time)}</span>${windPill(o.wind.angle, o.wind.strength)}${o.extra ?? ''}</div>
        ${o.crew ? `<div id="crew-slot">${crewHtml(o.crew)}</div>` : ''}
        ${o.note ? `<p class="muted note">${esc(o.note)}</p>` : ''}
        <div class="actions">
          <button class="btn ghost" data-a="back" aria-label="${t('back')}" style="flex:0 0 60px;padding:0">${IC.back}</button>
          <button class="btn big" data-a="go" data-focus style="flex:1 1 160px">${t('go')}</button>
        </div>
      </div>
    </div>
  </div>`);
  n.querySelector('[data-a=go]')!.addEventListener('click', o.onGo);
  n.querySelector('[data-a=back]')!.addEventListener('click', o.onBack);
  if (o.crew) {
    const slot = n.querySelector<HTMLElement>('#crew-slot')!;
    slot.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-crew]');
      if (b) o.crew!.onToggle(b.dataset.crew!);
    });
  }
  show(n);
}
/** Redraws the crew picker of the intro screen after a toggle. */
export function refreshCrew(c: CrewPick) {
  const slot = document.querySelector<HTMLElement>('#crew-slot');
  if (slot) slot.innerHTML = crewHtml(c);
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
  /** coins earned at this level end (already in `balance`) */
  coins: number;
  balance: number;
  /** offer the rewarded x2 */
  canDouble: boolean;
  /** shown again after the shop: no animations */
  instant?: boolean;
  /** the finale was just won: the whole campaign is done (levels in it, stars earned and possible) */
  campaign?: { levels: number; stars: number; maxStars: number };
  /** rewarded air support after losing the level twice */
  airSupport?: boolean;
  onAirSupport?: () => void;
  /** a big fire with its front page won: button to see it (and `newPage` the first time) */
  frontPage?: boolean;
  newPage?: boolean;
  onFrontPage?: () => void;
  onNext: () => void;
  onRetry: () => void;
  onMenu: () => void;
  onShop: () => void;
  /** watches the ad; resolves with the new totals, or null if there was no reward */
  onDouble: () => Promise<{ coins: number; balance: number } | null>;
  onShared: () => void;
  onStar: (i: number) => void;
  onCoin: () => void;
}
/** Label of a small rewarded button: the action, with "Ad" / "Anuncio" written above it (not just the icon). */
export function adLabel(action: string): string {
  return `<span class="adlbl"><small>${esc(t('adWord'))}</small>${esc(action)}</span>`;
}
/** The campaign is done: a trophy line with the campaign stars, under the level's stars. */
function campaignHtml(c: NonNullable<EndOpts['campaign']>): string {
  const missing = c.maxStars - c.stars;
  return `<div class="campaign-box" role="status">
    <span class="trophy" aria-hidden="true">🏆</span>
    <div><b>${esc(t('campaignLine', { n: c.levels }))}</b>
    <small><span class="star-on">★</span> ${c.stars}/${c.maxStars} · ${esc(missing > 0 ? t('campaignMore', { n: missing }) : t('campaignPerfect'))}</small></div>
  </div>`;
}

/** Confetti over the end screen (decoration only; hidden with reduced motion). */
function confettiHtml(): string {
  const colors = ['#ffb21f', '#e23a2e', '#3fb6ff', '#f2e03a', '#3cc46e', '#ffffff'];
  let h = '';
  for (let i = 0; i < 36; i++) {
    const x = (i * 37) % 100;
    const d = 2.4 + ((i * 13) % 10) / 6;
    const dl = ((i * 7) % 12) / 8;
    h += `<i style="left:${x}%;background:${colors[i % colors.length]};animation-duration:${d.toFixed(2)}s;animation-delay:${dl.toFixed(2)}s;--r:${(i * 53) % 360}deg"></i>`;
  }
  return `<div class="confetti" aria-hidden="true">${h}</div>`;
}

export function endScreen(o: EndOpts) {
  const r = o.r;
  const camp = r.win ? o.campaign : undefined;
  const title = camp ? t('campaignDone') : r.win ? t('win') : r.reason === 'time' ? t('loseTime') : t('loseControl');
  const n = el(`
  <div class="screen dim end-screen${camp ? ' campaign' : ''}">
    ${camp && !o.instant ? confettiHtml() : ''}
    <div class="panel">
      <div class="tape"></div>
      <div class="panel-head" style="text-align:center"><div class="eyebrow">${esc(o.eyebrow)}</div></div>
      <div class="panel-body">
        <div class="end-col">
        <h2 class="end-title ${r.win ? 'win' : 'lose'}${camp ? ' camp' : ''}">${title}</h2>
        <div class="bigstars"><span>★</span><span>★</span><span>★</span></div>
        ${camp ? campaignHtml(camp) : ''}
        ${r.win ? '' : `<div class="tip"><p>${t('loseTip')}</p></div>`}
        <div class="stats" style="grid-template-columns:repeat(${r.rescueTotal ? 2 : 3}, 1fr)">
          <div class="stat"><div class="k">${t('statSaved')}</div><div class="v">${Math.round(r.saved * 100)}%</div></div>
          <div class="stat"><div class="k">${t('statTime')}</div><div class="v">${fmtTime(r.timeUsed)}</div></div>
          ${r.rescueTotal ? `<div class="stat"><div class="k">${t('statRescued')}</div><div class="v">${r.win ? r.rescueTotal - r.fled : r.rescued}/${r.rescueTotal}</div></div>` : ''}
          <div class="stat"><div class="k">${t('statCombo')}</div><div class="v">x${r.maxCombo}</div></div>
          ${r.win ? `<div class="stat wide"><div class="k">${t('statScore')}</div><div class="v">${r.score.toLocaleString()}</div></div>` : ''}
        </div>
        </div>
        <div class="end-col">
        ${o.newBest && r.win ? `<div class="newbest">${t('newBest')}</div>` : o.best > 0 ? `<div class="muted" style="text-align:center">${t('best')}: ${o.best.toLocaleString()}</div>` : ''}
        ${o.extraHtml ?? ''}
        ${o.footer ? `<div class="muted" style="text-align:center">${esc(o.footer)}</div>` : ''}
        <div class="coinbox">
          <div class="earn" aria-label="${t('coins')}">${IC.coin}<b id="end-coins">+${num(o.instant ? o.coins : 0)}</b></div>
          ${o.canDouble ? `<button class="btn amber sm" data-a="double" aria-label="${t('doubleAria')}">${IC.ad}${adLabel(t('double'))}</button>` : ''}
          ${walletHtml(o.instant ? o.balance : o.balance - o.coins, 'end-balance')}
        </div>
        ${o.frontPage ? `<button class="btn ${o.newPage ? 'amber' : 'ghost'} paper-btn" data-a="page">${IC.news}${esc(o.newPage ? t('frontPageNew') : t('frontPage'))}</button>` : ''}
        ${o.airSupport ? `<button class="btn amber air-btn" data-a="air" aria-label="${esc(t('airSupportAria'))}">${IC.ad}${adLabel(t('airSupport'))}<small class="air-d">${esc(t('airSupportD'))}</small></button>` : ''}
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
          <button class="btn ghost" data-a="menu" aria-label="${t('menu')}" style="${r.win && o.hasNext ? 'flex:0 0 60px;padding:0' : r.win ? 'flex:1 1 120px' : 'flex:1 1 100%'}">${IC.home}${r.win && o.hasNext ? '' : t('menu')}</button>
        </div>
        </div>
      </div>
    </div>
  </div>`);
  n.querySelector('[data-a=next]')?.addEventListener('click', o.onNext);
  n.querySelector('[data-a=retry]')!.addEventListener('click', o.onRetry);
  n.querySelector('[data-a=menu]')!.addEventListener('click', o.onMenu);
  n.querySelector('[data-a=share]')?.addEventListener('click', () => {
    shareText(typeof o.shareText === 'function' ? o.shareText() : o.shareText, n.querySelector('.end-col:last-child')!);
    o.onShared();
  });
  n.querySelector('[data-a=shop]')!.addEventListener('click', o.onShop);
  n.querySelector('[data-a=page]')?.addEventListener('click', () => o.onFrontPage?.());
  const air = n.querySelector<HTMLButtonElement>('[data-a=air]');
  air?.addEventListener('click', () => {
    air.disabled = true;
    o.onAirSupport?.();
  });
  const earned = n.querySelector<HTMLElement>('#end-coins')!;
  const balance = n.querySelector<HTMLElement>('#end-balance')!;
  const dbl = n.querySelector<HTMLButtonElement>('[data-a=double]');
  let doubled = false;
  dbl?.addEventListener('click', async () => {
    dbl.disabled = true;
    const res = await o.onDouble();
    if (!res) {
      dbl.disabled = false;
      return;
    }
    doubled = true;
    dbl.remove();
    countUp(earned, o.coins, res.coins, 700, '+', o.onCoin);
    countUp(balance, res.balance - res.coins + o.coins, res.balance, 700);
  });
  show(n);
  const stars = n.querySelectorAll<HTMLElement>('.bigstars span');
  stars.forEach((s, i) => {
    const on = () => {
      s.classList.add('show');
      if (i < r.stars) s.classList.add('on');
    };
    if (o.instant) on();
    else
      setTimeout(() => {
        on();
        if (i < r.stars) o.onStar(i);
      }, 350 + i * 380);
  });
  if (!o.instant)
    setTimeout(() => {
      if (doubled) return;
      countUp(earned, 0, o.coins, 700, '+', o.onCoin);
      countUp(balance, o.balance - o.coins, o.balance, 700);
    }, 350 + 3 * 380);
}

export interface ContinueOpts {
  eyebrow: string;
  secs: number;
  onYes: () => void;
  onNo: () => void;
}
/** Time ran out: rewarded "+30 s" or give up. */
export function continueScreen(o: ContinueOpts) {
  const n = el(`
  <div class="screen dim">
    <div class="panel">
      <div class="tape"></div>
      <div class="panel-head" style="text-align:center"><div class="eyebrow">${esc(o.eyebrow)}</div></div>
      <div class="panel-body">
        <h2 class="end-title lose">${t('loseTime')}</h2>
        <div class="tip">${IC.clock.replace('<svg', '<svg style="width:26px;height:26px;flex:none;color:#ffb21f"')}<p>${t('contTip', { n: o.secs })}</p></div>
        <button class="btn big amber ui-font" data-a="continue" data-focus aria-label="${t('contYesAria', { n: o.secs })}">${IC.ad}${t('contYes', { n: o.secs })}<span class="adtag">(${t('contAd')})</span></button>
        <button class="btn ghost" data-a="decline">${t('contNo')}</button>
      </div>
    </div>
  </div>`);
  const btns = n.querySelectorAll<HTMLButtonElement>('button');
  n.querySelector('[data-a=continue]')!.addEventListener('click', () => {
    btns.forEach((b) => (b.disabled = true));
    o.onYes();
  });
  n.querySelector('[data-a=decline]')!.addEventListener('click', o.onNo);
  show(n);
}

export function shareText(text: string, host: HTMLElement) {
  // Android app: native share sheet (Capacitor Share plugin). Phones on the web: Web Share API.
  const cap = (window as unknown as { Capacitor?: { Plugins?: { Share?: { share: (o: { text: string; dialogTitle?: string }) => Promise<unknown> } } } }).Capacitor;
  const nativeShare = cap?.Plugins?.Share;
  if (nativeShare) {
    nativeShare.share({ text, dialogTitle: t('gameName') }).catch(() => undefined);
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
  /** Android in the EEA/UK: reopen Google's ad consent form */
  onAdChoices?: () => void;
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
        ${o.onAdChoices ? `<button class="btn ghost" data-a="adchoices" style="width:100%">${t('adChoices')}</button>` : ''}
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
      // what goes and what stays, before the second tap
      rb.closest('.actions')!.insertAdjacentHTML('afterend', `<p class="note reset-warn" role="alert">${esc(t('resetWarn'))}</p>`);
      n.querySelector('.reset-warn')!.scrollIntoView({ block: 'nearest' });
      return;
    }
    o.onReset();
  });
  n.querySelector('[data-a=back]')!.addEventListener('click', o.onBack);
  if (o.onAdChoices) n.querySelector('[data-a=adchoices]')!.addEventListener('click', o.onAdChoices);
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
// Several can pop up at the same spot at once ("Rescued!", "Hose connected", "Blaze out!"): they stack. The newest sits
// where it belongs and pushes the older ones up, so two texts never cover each other.
interface Floater {
  node: HTMLElement;
  x: number;
  y: number;
  z: number;
  t: number;
  /** size at scale 1 (measured once) */
  w: number;
  h: number;
  /** pixels it is pushed up to clear newer texts (eased) */
  lift: number;
}
const floaters: Floater[] = [];
const FLOAT_LIFE = 1.3;
const FLOAT_GAP = 4;
export function floater(text: string, x: number, y: number, z: number, kind = '') {
  const host = $('#floaters');
  if (floaters.length > 10) {
    const f = floaters.shift()!;
    f.node.remove();
  }
  const node = el(`<div class="fl ${kind}">${esc(text)}</div>`);
  host.appendChild(node);
  // hidden until updateFloaters places it (it would flash at the top-left corner)
  node.style.opacity = '0';
  floaters.push({ node, x, y, z, t: 0, w: node.offsetWidth, h: node.offsetHeight, lift: 0 });
}
export function updateFloaters(stage: Stage, dt: number) {
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.t += dt;
    if (f.t >= FLOAT_LIFE) {
      f.node.remove();
      floaters.splice(i, 1);
    }
  }
  const sw = $('#floaters').clientWidth || innerWidth;
  // the nozzle buttons on the right: a text at their height stays clear of them
  const nz = document.getElementById('nozzles')?.getBoundingClientRect();
  const nzOn = !!nz && nz.width > 0 && nz.left > sw / 2;
  // newest first: each one is placed, then the older ones go above whatever they would overlap
  const placed: { l: number; r: number; top: number; bot: number }[] = [];
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    // (made while the HUD was hidden: measure it now)
    if (!f.w) {
      f.w = f.node.offsetWidth;
      f.h = f.node.offsetHeight;
    }
    const k = f.t / FLOAT_LIFE;
    const p = stage.toScreen(f.x, f.y, f.z);
    const sc0 = k < 0.15 ? 0.6 + (k / 0.15) * 0.5 : 1.1 - Math.min(0.1, (k - 0.15) * 0.3);
    // keep it on screen and clear of the nozzle buttons (narrow phones): shift it, and shrink it if it still won't fit
    const cy = p.y - 40 - k * 50 + f.h / 2;
    const edge = nzOn && cy + (f.h * sc0) / 2 > nz!.top && cy - (f.h * sc0) / 2 < nz!.bottom ? nz!.left - 4 : sw - 4;
    const sc = Math.min(sc0, (edge - 4) / f.w);
    const w = f.w * sc;
    const h = f.h * sc;
    const cx = Math.min(Math.max(p.x, w / 2 + 4), edge - w / 2);
    const l = cx - w / 2;
    const r = cx + w / 2;
    const hit = (lift: number) => {
      const top = cy - h / 2 - lift;
      const bot = cy + h / 2 - lift;
      return placed.find((q) => l < q.r && r > q.l && top < q.bot + FLOAT_GAP && bot > q.top - FLOAT_GAP);
    };
    // the lowest spot that is free: go above whatever it would cover until nothing is in the way
    let want = 0;
    for (let q = hit(0), n = 0; q && n <= placed.length; q = hit(want), n++) want = cy + h / 2 - (q.top - FLOAT_GAP);
    // up at once (never over the new text; it pops in small and grows, so the push is gentle), down smoothly once the
    // text under it has gone, unless that would cover another one
    const eased = f.lift + (want - f.lift) * Math.min(1, dt * 6);
    f.lift = want >= f.lift || hit(eased) ? want : eased;
    const y = cy - f.lift;
    placed.push({ l, r, top: y - h / 2, bot: y + h / 2 });
    f.node.style.transform = `translate(${cx - f.w / 2}px, ${y - f.h / 2}px) scale(${sc})`;
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
      e.dataset.pk = '';
    } else if (l.kind === 'pressure') {
      e.className = 'ic gauge';
      const c = l.v > 0.7 ? '#ff4b3a' : l.v > 0.4 ? '#ffb21f' : '#3cc46e';
      e.style.background = `conic-gradient(${c} ${Math.round(l.v * 360)}deg, rgba(255,255,255,.2) 0)`;
      e.innerHTML = `<span>${Math.round(l.v * 100)}</span>`;
      e.dataset.pk = '';
    } else if (l.kind === 'lever') {
      e.className = 'ic lever';
      e.textContent = leverText;
      e.dataset.pk = '';
    } else if (l.kind === 'power') {
      e.className = 'ic power' + (l.v < 3 ? ' ending' : '');
      if (e.dataset.pk !== l.k) {
        e.innerHTML = POWER_ICON[l.k ?? ''] ?? '';
        e.dataset.pk = l.k ?? '';
      }
    } else if (l.kind === 'lift') {
      e.className = 'ic gauge lift';
      e.style.background = `conic-gradient(#ffd23a ${Math.round(l.v * 360)}deg, rgba(255,255,255,.2) 0)`;
      e.innerHTML = '<span>⇡</span>';
      e.dataset.pk = '';
    } else if (l.kind === 'thaw') {
      e.className = 'ic gauge thaw';
      e.style.background = `conic-gradient(#8fd8ff ${Math.round(l.v * 360)}deg, rgba(255,255,255,.2) 0)`;
      e.innerHTML = '<span>❄</span>';
      e.dataset.pk = '';
    } else if (l.kind === 'sprinkler') {
      e.className = 'ic lever sprinkler';
      if (e.dataset.pk !== 'spr') {
        e.innerHTML = `${IC.sprinkler}<span>${t('tSprinklerLabel')}</span>`;
        e.dataset.pk = 'spr';
      }
    }
    e.style.transform = `translate(${p.x}px, ${p.y + (l.kind === 'lever' || l.kind === 'power' || l.kind === 'sprinkler' ? Math.sin(performance.now() / 200) * 4 : 0)}px)`;
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
export function buildHud(onPause: () => void, onNozzle: (n: 0 | 1 | 2) => void, onHeli: () => void = () => undefined) {
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
      <div class="chip cut" id="hud-cut" hidden>${IC.reel}<span>0</span></div>
      <span id="hud-buffs"></span>
    </div>
    <div class="hud-row mm-row"><canvas id="minimap" aria-hidden="true"></canvas></div>`;
  $('#hud-pause').addEventListener('click', onPause);
  const nz = $('#nozzles');
  nz.innerHTML = `
    <button class="noz sel" data-n="0" aria-label="${t('jet')}">${IC.jet}<span>${t('jet')}</span></button>
    <button class="noz" data-n="1" aria-label="${t('fog')}">${IC.fog}<span>${t('fog')}</span></button>
    <button class="noz" data-n="2" aria-label="${t('foam')}">${IC.foam}<span>${t('foam')}</span><span class="cnt"><b id="hud-foam" style="width:100%"></b></span></button>
    <button class="noz heli" id="hud-heli" aria-label="${t('heli')}" hidden>${IC.heli}<span>${t('heli')}</span><b class="hc" id="hud-heli-n">1</b></button>`;
  const hb = nz.querySelector<HTMLElement>('#hud-heli')!;
  hb.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    onHeli();
  });
  nz.querySelectorAll<HTMLElement>('.noz[data-n]').forEach((b) =>
    b.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      onNozzle(Number(b.dataset.n) as 0 | 1 | 2);
    }),
  );
}

export interface HudState {
  stars: [number, number];
  minSaved: number;
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
  /** v2: timed power-ups running, helicopter charges, hose cut countdown, blackout (no minimap) */
  buffs: { k: string; t: number }[];
  heli: number;
  heliBusy: boolean;
  cut: number;
  blackout: boolean;
  /** campground: the helicopter is on call (always shown) and comes back after `heliCd` seconds */
  heliOnCall?: boolean;
  heliCd?: number;
  heliEvery?: number;
  /** museum: the rescues are works of art; campground storm: the rockets are lightning */
  art?: boolean;
  lightning?: boolean;
}
let lastHud = '';
let lastStars = 3;
let onStarLost: () => void = () => undefined;
export function setStarLostHandler(f: () => void) {
  onStarLost = f;
}
export function updateHud(s: HudState) {
  const pct = Math.round(s.control * 100);
  const key = `${pct}|${Math.ceil(s.time)}|${Math.round(s.saved * 1000)}|${s.fled}|${s.rescue.states.join('')}|${Math.round(s.wind)}|${s.nozzle}|${s.foam.toFixed(1)}|${s.rockets}|${s.buffs.map((b) => b.k + Math.ceil(b.t)).join()}|${s.heli}|${s.heliBusy}|${Math.ceil(s.cut)}|${s.blackout}|${Math.ceil(s.heliCd ?? 0)}|${s.art}|${s.lightning}`;
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
  // Close to the out-of-control line (minSaved): pulse red so losing never comes as a surprise.
  sv.classList.toggle('danger', s.saved < s.minSaved + 0.05);
  const rc = $('#hud-resc');
  rc.hidden = s.rescue.total === 0;
  if (rc.dataset.icon !== (s.art ? 'art' : 'paw')) {
    rc.dataset.icon = s.art ? 'art' : 'paw';
    rc.firstElementChild!.outerHTML = s.art ? IC.art : IC.paw;
  }
  if (s.rescue.total) rc.querySelector('.dots')!.innerHTML = s.rescue.states.map((st) => `<i class="${st === 1 ? 'ok' : st === 2 ? 'lost' : ''}"></i>`).join('');
  $('#hud-windarrow').style.transform = `rotate(${s.wind + 90}deg) scale(${0.8 + s.windStrength * 0.6})`;
  const rk = $('#hud-rockets');
  rk.hidden = !s.hasRockets;
  if (rk.dataset.icon !== (s.lightning ? 'bolt' : 'rocket')) {
    rk.dataset.icon = s.lightning ? 'bolt' : 'rocket';
    rk.firstElementChild!.outerHTML = s.lightning ? IC.turbo : IC.rocket;
  }
  rk.lastElementChild!.textContent = String(s.rockets);
  document.querySelectorAll<HTMLElement>('.noz').forEach((b) => b.classList.toggle('sel', Number(b.dataset.n) === s.nozzle));
  const foamBtn = document.querySelector<HTMLButtonElement>('.noz[data-n="2"]');
  if (foamBtn) {
    foamBtn.hidden = s.foamMax <= 0;
    foamBtn.disabled = s.foam <= 0;
    $('#hud-foam').style.width = `${s.foamMax > 0 ? (s.foam / s.foamMax) * 100 : 0}%`;
  }
  // v2
  const heli = document.querySelector<HTMLButtonElement>('#hud-heli');
  if (heli) {
    const cd = s.heliOnCall && s.heli <= 0 && !s.heliBusy ? Math.ceil(s.heliCd ?? 0) : 0;
    heli.hidden = s.heli <= 0 && !s.heliBusy && !s.heliOnCall;
    heli.disabled = s.heliBusy || s.heli <= 0;
    heli.classList.toggle('ready', s.heli > 0 && !s.heliBusy);
    heli.classList.toggle('cooling', cd > 0);
    $('#hud-heli-n').textContent = cd > 0 ? `${cd}` : String(s.heli);
    heli.style.setProperty('--cd', cd > 0 && s.heliEvery ? String(Math.min(1, (s.heliCd ?? 0) / s.heliEvery)) : '0');
  }
  const cut = $('#hud-cut');
  cut.hidden = s.cut <= 0;
  cut.lastElementChild!.textContent = `${Math.ceil(s.cut)}`;
  $('#hud-buffs').innerHTML = s.buffs.map((b) => `<span class="chip buff ${b.t < 3 ? 'ending' : ''}">${POWER_ICON[b.k] ?? ''}<span>${Math.ceil(b.t)}</span></span>`).join('');
  const mm = document.getElementById('minimap');
  if (mm) mm.style.visibility = s.blackout ? 'hidden' : '';
}
export function resetHudCache() {
  lastHud = '';
  lastStars = 3;
}

// ---------------- v2: event banner, album, front page, what's new ----------------
/** Big banner under the HUD for a surprise event: the warning (3 s before) and the start. */
export function eventBanner(kind: EventKind, soon: boolean) {
  const host = $('#app');
  host.querySelector('.ev-banner')?.remove();
  const info = EVENT_INFO[kind];
  const n = el(`<div class="ev-banner ${soon ? 'soon' : ''} ev-${kind}" role="status"><span class="ev-ic">${EVENT_ICON[kind]}</span><div><b>${esc(tx(info.name))}</b><small>${esc(soon ? t('tEventSoon') : tx(info.tip))}</small></div></div>`);
  host.appendChild(n);
  host.classList.add('ev-on');
  setTimeout(() => n.classList.add('out'), soon ? 2600 : 3600);
  setTimeout(() => {
    n.remove();
    if (!host.querySelector('.ev-banner')) host.classList.remove('ev-on');
  }, soon ? 3000 : 4000);
}

export interface AlbumCard {
  id: string;
  num: number;
  name: string;
  theme: string;
  /** the front page thumbnail (canvas), or null while it is not won */
  canvas: HTMLCanvasElement | null;
}
/** Album of front pages: one per big fire, in route order; the missing ones show which level wins them. */
export function albumScreen(o: { cards: AlbumCard[]; onOpen: (id: string) => void; onBack: () => void }) {
  const won = o.cards.filter((c) => c.canvas).length;
  const n = el(`
  <div class="screen dim album-screen">
    <div class="panel wide">
      <div class="tape"></div>
      <div class="panel-head lv-head">
        <button class="icon-btn" data-a="back" aria-label="${t('back')}">${IC.back}</button>
        <div class="lv-title"><h2>${t('album')}</h2><div class="eyebrow">${esc(t('albumCount', { n: won, m: o.cards.length }))}</div></div>
      </div>
      <div class="panel-body">
        ${won ? '' : `<p class="muted note">${esc(t('albumHint'))}</p>`}
        <div class="album">${o.cards
          .map(
            (c) => `<button class="apage${c.canvas ? '' : ' locked'}" data-id="${c.id}" style="--pc:${PLACE_COLOR[c.theme as keyof typeof PLACE_COLOR] ?? '#888'}" aria-label="${esc(`${c.name}. ${c.canvas ? t('frontPage') : t('albumLocked', { n: c.num })}`)}"${c.canvas ? '' : ' aria-disabled="true"'}>
              <span class="thumb"></span><span class="cap"><b>${c.num}</b> ${esc(c.name)}</span>${c.canvas ? '' : `<span class="lk">${IC.news}<small>${esc(t('albumLocked', { n: c.num }))}</small></span>`}
            </button>`,
          )
          .join('')}</div>
      </div>
    </div>
  </div>`);
  o.cards.forEach((c) => {
    if (!c.canvas) return;
    const slot = n.querySelector<HTMLElement>(`.apage[data-id="${c.id}"] .thumb`)!;
    c.canvas.classList.add('thumb-cv');
    slot.appendChild(c.canvas);
  });
  n.querySelector('.album')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.apage');
    if (!b || b.classList.contains('locked')) return;
    o.onOpen(b.dataset.id!);
  });
  n.querySelector('[data-a=back]')!.addEventListener('click', o.onBack);
  show(n);
}

/** A front page, full size, over the current screen: share it (image) or close. */
export function pageModal(o: { canvas: HTMLCanvasElement; fresh: boolean; onShare: () => void; onClose: () => void }) {
  const n = el(`
  <div class="screen dim page-modal">
    <div class="page-wrap${o.fresh ? ' fresh' : ''}"></div>
    <div class="actions page-actions">
      <button class="btn water" data-a="share" data-focus>${IC.share}${t('paperShare')}</button>
      <button class="btn ghost" data-a="back" aria-label="${t('back')}">${IC.back}${t('back')}</button>
    </div>
  </div>`);
  o.canvas.classList.add('page-cv');
  n.querySelector('.page-wrap')!.appendChild(o.canvas);
  n.querySelector('[data-a=share]')!.addEventListener('click', o.onShare);
  n.querySelector('[data-a=back]')!.addEventListener('click', () => {
    n.remove();
    o.onClose();
  });
  overlay(n);
}

/** One-time notice for players coming from 1.x. */
export function whatsNewModal(onClose: () => void) {
  const n = el(`
  <div class="screen dim">
    <div class="panel offer whatsnew">
      <div class="tape"></div>
      <div class="panel-head" style="text-align:center"><div class="eyebrow">Put It Out! 2.0</div><h2>${t('whatsNewTitle')}</h2></div>
      <div class="panel-body">
        <ul class="wn">
          <li>${IC.anchor}<span>${esc(t('whatsNew1'))}</span></li>
          <li>${IC.turbo}<span>${esc(t('whatsNew2'))}</span></li>
          <li>${IC.news}<span>${esc(t('whatsNew3'))}</span></li>
          <li>${IC.flag}<span>${esc(t('whatsNew4'))}</span></li>
        </ul>
        <button class="btn big" data-a="back" data-focus>${t('gotIt')}</button>
      </div>
    </div>
  </div>`);
  n.querySelector('[data-a=back]')!.addEventListener('click', () => {
    n.remove();
    onClose();
  });
  overlay(n);
}
