// Shop (upgrades, free coins, store) and the one-time starter pack offer.
import { CREW_INFO } from '../content';
import { crewCost, MAX_CREW, MAX_UPGRADE, UPGRADE_IDS, UPGRADE_STEP, upgradeCost, type UpgradeId, type UpgradeLevels } from '../economy';
import { num, t, tx } from '../i18n';
import { PRODUCTS, type Product, type ProductId } from '../monetize/types';
import { CREW_IDS, type CrewId } from '../sim/types';
import { CREW_ICON, IC } from './icons';
import { adLabel, el, esc, overlay, show, toast } from './ui';

const UP_ICON: Record<UpgradeId, string> = { hose: IC.reel, power: IC.gauge, speed: IC.boot, time: IC.clock };
const PRODUCT_ICON: Record<ProductId, string> = { remove_ads: IC.noAds, starter_pack: IC.gift, coins_s: IC.coins, coins_m: IC.coins, coins_l: IC.coins };

/** Total effect of a track at a level, as shown next to its pips. */
function upValue(id: UpgradeId, lvl: number): string {
  const s = UPGRADE_STEP;
  if (id === 'hose') return `+${lvl * s.hose} m`;
  if (id === 'time') return `+${lvl * s.time} s`;
  return `+${Math.round(lvl * s[id] * 100)}%`;
}

function productDesc(id: ProductId): string {
  const coins = num(PRODUCTS[id].coins);
  if (id === 'remove_ads') return t('p_remove_ads_d', { n: coins });
  if (id === 'starter_pack') return t('p_starter_pack_d', { n: coins });
  return t('coinsN', { n: coins });
}

export interface ShopOpts {
  coins: number;
  upgrades: UpgradeLevels;
  /** rewarded free coins; null hides the row (no ad ready) */
  free: { left: number; amount: number } | null;
  /** products the store returned; null when this platform has no store */
  products: Product[] | null;
  onUpgrade: (id: UpgradeId) => void;
  /** crew: levels hired (0 = not yet); null while the crew is still locked (with the level it opens at) */
  crew: Record<CrewId, number> | null;
  crewFrom: number;
  onCrew: (id: CrewId) => void;
  onFree: () => void;
  onBuy: (id: ProductId) => void;
  onRestore: () => void;
  onBack: () => void;
}

export function shopScreen(o: ShopOpts) {
  const row = (icon: string, name: string, desc: string, side: string, extra = '') =>
    `<div class="shop-row"><span class="ico">${icon}</span><div class="info"><b>${esc(name)}</b><small>${esc(desc)}</small>${extra}</div>${side}</div>`;

  const ups = UPGRADE_IDS.map((id) => {
    const lvl = o.upgrades[id];
    const cost = upgradeCost(lvl);
    const pips = Array.from({ length: MAX_UPGRADE }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('');
    const side =
      cost === null
        ? `<span class="maxed">${t('upMax')}</span>`
        : `<button class="btn amber sm buy${o.coins < cost ? ' poor' : ''}" data-up="${id}" aria-label="${esc(t('upBuy', { name: t(`up_${id}`), n: num(cost) }))}">${IC.coin}${num(cost)}</button>`;
    return row(UP_ICON[id], t(`up_${id}`), t(`up_${id}_d`), side, `<span class="lvl-line"><span class="pips">${pips}</span>${lvl ? `<span class="val">${upValue(id, lvl)}</span>` : ''}</span>`);
  }).join('');

  const crew = o.crew
    ? CREW_IDS.map((id) => {
        const lvl = o.crew![id];
        const cost = crewCost(id, lvl);
        const pips = Array.from({ length: MAX_CREW }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('');
        const info = CREW_INFO[id];
        const side =
          cost === null
            ? `<span class="maxed">${t('upMax')}</span>`
            : `<button class="btn amber sm buy${o.coins < cost ? ' poor' : ''}" data-crew="${id}" aria-label="${esc(t('crewBuy', { name: tx(info.name), n: num(cost) }))}">${IC.coin}${num(cost)}</button>`;
        return row(CREW_ICON[id], tx(info.name), lvl ? `${tx(info.desc)} · ${tx(info.step)}` : tx(info.desc), side, `<span class="lvl-line"><span class="pips">${pips}</span>${lvl ? '' : `<span class="val">${t('crewHire')}</span>`}</span>`);
      }).join('')
    : `<p class="muted note">${IC.crew.replace('<svg', '<svg style="width:18px;height:18px;vertical-align:-3px"')} ${esc(t('crewFrom', { n: o.crewFrom }))}</p>`;

  const free = o.free
    ? row(
        IC.gift,
        t('freeCoins'),
        o.free.left > 0 ? t('freeCoinsD', { n: o.free.amount, left: o.free.left }) : t('freeTomorrow'),
        o.free.left > 0 ? `<button class="btn water sm buy" data-a="free" aria-label="${esc(t('watchAria', { n: o.free.amount }))}">${IC.ad}${adLabel(t('watch'))}</button>` : '',
      )
    : '';

  const store = o.products
    ? `<div class="eyebrow">${t('purchases')}</div>
       ${o.products.map((p) => row(PRODUCT_ICON[p.id], t(`p_${p.id}`), productDesc(p.id), `<button class="btn water sm buy" data-p="${p.id}">${esc(p.price ?? '')}</button>`)).join('')}
       <button class="linkbtn" data-a="restore">${t('restore')}</button>`
    : '';

  const n = el(`
  <div class="screen dim shop-screen">
    <div class="panel shop">
      <div class="tape"></div>
      <div class="panel-head"><h2>${t('shop')}</h2><span class="wallet static">${IC.coin}<b>${num(o.coins)}</b></span></div>
      <div class="panel-body">
        <div class="eyebrow">${t('upgrades')}</div>
        ${ups}
        <p class="muted note">${t('noUpgradesNote')}</p>
        <div class="eyebrow">${t('crew')}</div>
        ${crew}
        ${free}
        ${store}
        <div class="actions"><button class="btn ghost" data-a="back" data-focus>${IC.back}${t('back')}</button></div>
      </div>
    </div>
  </div>`);
  n.querySelectorAll<HTMLElement>('[data-up]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.classList.contains('poor')) toast(t('notEnough'), 'warn');
      else o.onUpgrade(b.dataset.up as UpgradeId);
    }),
  );
  n.querySelectorAll<HTMLElement>('[data-crew]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.classList.contains('poor')) toast(t('notEnough'), 'warn');
      else o.onCrew(b.dataset.crew as CrewId);
    }),
  );
  const lock = () => n.querySelectorAll<HTMLButtonElement>('button.buy, [data-a=restore]').forEach((b) => (b.disabled = true));
  n.querySelector('[data-a=free]')?.addEventListener('click', () => {
    lock();
    o.onFree();
  });
  n.querySelectorAll<HTMLElement>('[data-p]').forEach((b) =>
    b.addEventListener('click', () => {
      lock();
      o.onBuy(b.dataset.p as ProductId);
    }),
  );
  n.querySelector('[data-a=restore]')?.addEventListener('click', () => {
    lock();
    o.onRestore();
  });
  n.querySelector('[data-a=back]')!.addEventListener('click', o.onBack);
  show(n);
}

/** One-time starter pack offer on top of the current screen. Returns a function that closes it. */
export function starterOffer(o: { price: string; onBuy: () => void; onClose: () => void }): () => void {
  const n = el(`
  <div class="screen dim">
    <div class="panel offer">
      <div class="tape"></div>
      <div class="panel-head" style="text-align:center"><div class="eyebrow">${t('offerTitle')}</div><h2>${t('p_starter_pack')}</h2></div>
      <div class="panel-body">
        <div class="offer-coins">${IC.coin}<b>${num(PRODUCTS.starter_pack.coins)}</b></div>
        <p style="text-align:center">${esc(productDesc('starter_pack'))}</p>
        <button class="btn big amber" data-a="buy" data-focus>${esc(o.price)}</button>
        <button class="btn ghost" data-a="back">${t('offerNo')}</button>
      </div>
    </div>
  </div>`);
  const close = () => n.remove();
  n.querySelector('[data-a=buy]')!.addEventListener('click', () => {
    n.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = true));
    o.onBuy();
  });
  n.querySelector('[data-a=back]')!.addEventListener('click', () => {
    close();
    o.onClose();
  });
  overlay(n);
  return close;
}
