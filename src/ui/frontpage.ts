// Newspaper front pages: won with the first victory in a big fire (every 10 levels). A photo of that fire, the
// headline of the level, the stars and the numbers, drawn on a canvas to share as an image (docs/diseno-v2.md §5.6).
// The page itself (stars, saved, score, date) is in the save; the photo is kept apart in localStorage because it does
// not fit in CrazyGames' cloud save: on another device the page is drawn with an illustration instead.
import { PLACE_COLOR } from '../content';
import { getLang, LOCALE, num, t, tx } from '../i18n';
import type { LevelDef } from '../sim/types';
import type { FrontPage } from '../storage';

const KEY = 'apagalo.page.';
const W = 1080;
const H = 1350;
const INK = '#1d1a16';
const PAPER = '#f3eee2';

export function loadPhoto(id: string): string {
  try {
    const raw = localStorage.getItem(KEY + id);
    return raw ? ((JSON.parse(raw) as { photo?: string }).photo ?? '') : '';
  } catch {
    return '';
  }
}
export function savePhoto(id: string, photo: string) {
  try {
    localStorage.setItem(KEY + id, JSON.stringify({ photo }));
  } catch {
    /* storage full or blocked: the page is drawn without the photo */
  }
}

/** Snapshot of the game canvas right after a render, as a small JPEG (or '' if the browser refuses). */
export function snapshot(src: HTMLCanvasElement): string {
  try {
    const w = 720;
    const h = Math.round((w * src.height) / Math.max(1, src.width));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = Math.min(h, 900);
    const ctx = c.getContext('2d')!;
    const sh = Math.round((c.height * src.width) / w);
    ctx.drawImage(src, 0, Math.max(0, (src.height - sh) / 2), src.width, Math.min(src.height, sh), 0, 0, c.width, c.height);
    // a WebGL canvas read outside its frame comes out black: then no photo (the page draws an illustration)
    const px = ctx.getImageData(0, 0, c.width, c.height).data;
    let lit = 0;
    for (let i = 0; i < px.length; i += 4 * 97) if (px[i] + px[i + 1] + px[i + 2] > 40) lit++;
    if (lit < 20) return '';
    return c.toDataURL('image/jpeg', 0.72);
  } catch {
    return '';
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    if (!src) return res(null);
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const tryL = line ? `${line} ${w}` : w;
    if (ctx.measureText(tryL).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = tryL;
  }
  if (line) lines.push(line);
  return lines;
}

/** Illustration when there is no photo: the place's colours, flames and a hose spray. */
function drawIllustration(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#2a2f45');
  g.addColorStop(0.55, color);
  g.addColorStop(1, '#3a2a1e');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  for (let k = 0; k < 9; k++) {
    const fx = x + w * (0.1 + 0.1 * k);
    const fh = h * (0.25 + 0.2 * Math.abs(Math.sin(k * 1.7)));
    const fg = ctx.createLinearGradient(0, y + h - fh, 0, y + h);
    fg.addColorStop(0, 'rgba(255,200,60,0)');
    fg.addColorStop(0.3, 'rgba(255,150,40,0.9)');
    fg.addColorStop(1, 'rgba(240,70,30,1)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(fx - 40, y + h);
    ctx.quadraticCurveTo(fx - 30, y + h - fh * 0.6, fx, y + h - fh);
    ctx.quadraticCurveTo(fx + 30, y + h - fh * 0.6, fx + 40, y + h);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(160,220,255,0.85)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.05, y + h * 0.95);
  ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.2, x + w * 0.6, y + h * 0.7);
  ctx.stroke();
}

/** Draws the front page of a big fire. Resolves when the photo (if any) is drawn. */
export async function drawFrontPage(def: LevelDef, page: FrontPage, gameUrl: string): Promise<HTMLCanvasElement> {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  const display = "'Bungee', 'Arial Black', Impact, sans-serif";
  const ui = "'Baloo 2', system-ui, sans-serif";
  const serif = "Georgia, 'Times New Roman', serif";
  try {
    await (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
  } catch {
    /* draw with fallback fonts */
  }
  // paper with a bit of grain
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  let seed = def.num * 97 + 13;
  const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let k = 0; k < 2600; k++) {
    ctx.fillStyle = `rgba(90,70,40,${0.03 + rnd() * 0.05})`;
    ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
  }
  // masthead
  ctx.fillStyle = INK;
  ctx.fillRect(60, 60, W - 120, 6);
  ctx.textAlign = 'center';
  let mast = 92;
  do ctx.font = `${mast}px ${display}`;
  while (ctx.measureText(t('newspaper')).width > W - 150 && (mast -= 4) > 40);
  ctx.fillText(t('newspaper'), W / 2, 170);
  ctx.fillRect(60, 196, W - 120, 3);
  ctx.font = `600 28px ${ui}`;
  const date = new Date(page.t).toLocaleDateString(LOCALE[getLang()], { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.textAlign = 'left';
  ctx.fillText(`Nº ${def.num} · ${date}`, 64, 236);
  ctx.textAlign = 'right';
  ctx.fillText(t('paperPrice'), W - 64, 236);
  ctx.fillRect(60, 254, W - 120, 6);
  // headline
  ctx.textAlign = 'center';
  const head = def.headline ? tx(def.headline) : tx(def.name).toUpperCase();
  let size = 74;
  let lines: string[] = [];
  do {
    ctx.font = `${size}px ${display}`;
    lines = wrap(ctx, head, W - 140);
    size -= 4;
  } while (lines.length > 3 && size > 40);
  let y = 340;
  for (const l of lines) {
    ctx.fillText(l, W / 2, y);
    y += size * 1.08;
  }
  // photo
  const py = y - 10;
  const ph = Math.max(420, H - py - 330);
  const px = 60;
  const pw = W - 120;
  const img = await loadImage(loadPhoto(def.id));
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  if (img) {
    const k = Math.max(pw / img.width, ph / img.height);
    const iw = img.width * k;
    const ih = img.height * k;
    ctx.filter = 'contrast(1.08) saturate(0.9)';
    ctx.drawImage(img, px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih);
    ctx.filter = 'none';
  } else drawIllustration(ctx, px, py, pw, ph, PLACE_COLOR[def.theme]);
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(px, py, pw, ph);
  // caption
  ctx.font = `italic 26px ${serif}`;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#3d372e';
  ctx.fillText(`${t('paperCaption')} · ${t('level')} ${def.num}, ${tx(def.name)}`, px, py + ph + 38);
  // numbers box
  const by = py + ph + 64;
  ctx.fillStyle = INK;
  ctx.fillRect(px, by, 330, 190);
  ctx.fillStyle = '#ffb21f';
  ctx.font = `64px ${display}`;
  ctx.textAlign = 'center';
  ctx.fillText('★'.repeat(page.stars) + '☆'.repeat(3 - page.stars), px + 165, by + 82);
  ctx.fillStyle = PAPER;
  ctx.font = `800 30px ${ui}`;
  ctx.fillText(`${Math.round(page.saved * 100)}% ${t('paperSaved')}`, px + 165, by + 130);
  ctx.font = `600 26px ${ui}`;
  ctx.fillText(`${num(page.score)} ${t('paperScore')}`, px + 165, by + 168);
  // columns of "text"
  const cx0 = px + 360;
  const cw = (W - 60 - cx0 - 30) / 2;
  for (let c = 0; c < 2; c++)
    for (let r = 0; r < 7; r++) {
      const lw = r === 6 ? cw * (0.4 + rnd() * 0.4) : cw * (0.85 + rnd() * 0.15);
      ctx.fillStyle = 'rgba(40,34,26,0.55)';
      ctx.fillRect(cx0 + c * (cw + 30), by + 8 + r * 27, lw, 9);
    }
  // footer
  ctx.fillStyle = INK;
  ctx.fillRect(60, H - 96, W - 120, 4);
  ctx.font = `34px ${display}`;
  ctx.textAlign = 'left';
  ctx.fillText(t('logo'), 64, H - 44);
  ctx.font = `700 28px ${ui}`;
  ctx.textAlign = 'right';
  ctx.fillText(gameUrl ? `${t('paperFoot')} · ${gameUrl.replace(/^https?:\/\//, '')}` : t('paperFoot'), W - 64, H - 46);
  return cv;
}

/** Small copy of a front page for the album. */
export function thumbOf(cv: HTMLCanvasElement, w = 270): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = Math.round((w * cv.height) / cv.width);
  c.getContext('2d')!.drawImage(cv, 0, 0, c.width, c.height);
  return c;
}

/** Share the front page as an image (phones), or save it (desktop). */
export async function sharePage(cv: HTMLCanvasElement, id: string, text: string): Promise<'shared' | 'saved' | 'failed'> {
  const blob = await new Promise<Blob | null>((res) => cv.toBlob(res, 'image/png'));
  if (!blob) return 'failed';
  const name = `put-it-out-${id}.png`;
  // Android app: write the image to the cache and hand it to the system share sheet (Capacitor Filesystem + Share)
  const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, Record<string, (o: unknown) => Promise<{ uri?: string }>>> } }).Capacitor?.Plugins;
  if (cap?.Share?.share) {
    try {
      if (cap.Filesystem?.writeFile) {
        const data = cv.toDataURL('image/png').split(',')[1];
        const f = await cap.Filesystem.writeFile({ path: name, data, directory: 'CACHE' });
        await cap.Share.share({ title: t('gameName'), text, files: [f.uri], dialogTitle: t('gameName') });
      } else await cap.Share.share({ title: t('gameName'), text, dialogTitle: t('gameName') });
      return 'shared';
    } catch {
      return 'failed';
    }
  }
  const file = new File([blob], name, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text });
      return 'shared';
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'shared';
    }
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'saved';
  } catch {
    return 'failed';
  }
}
