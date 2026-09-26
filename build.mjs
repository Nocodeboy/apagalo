// Builds three targets from the same source:
//   dist/web/            public site (Vercel): analytics on, share link, OG image, PWA manifest, privacy page
//   dist/crazygames/     CrazyGames upload (zip): their SDK, analytics on, no external links
//   dist/android/        web assets of the Android app (Capacitor): analytics on, native share, back button
//   dist/artifact.html   page content for the Claude artifact: analytics off (CSP), share link
// Usage: node build.mjs [--dev]   (GAME_URL env overrides the public URL)
import { build } from 'esbuild';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const prod = !process.argv.includes('--dev');
const VERSION = '1.2.0';
const GAME_URL = process.env.GAME_URL ?? 'https://apagalo.vercel.app';
const ANALYTICS = { url: 'https://exlupbihqexeeyxwmveh.supabase.co', key: 'sb_publishable_oxNSon03m-m9eUhIb50usg_3EPRLg7u' };
const music = {};
for (const k of ['menu', 'game']) if (existsSync(`assets/music-${k}.mp3`)) music[k] = `music-${k}.mp3`;

const css = readFileSync('src/style.css', 'utf8');
// Google Fonts only for the Claude artifact; the web and CrazyGames builds self-host the same OFL fonts
// (no third-party request -> nothing is sent to Google, and the game works offline / inside portals).
const fonts =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Bungee&display=swap">';
const FONT_FILES = [
  ['Bungee', 400, 'node_modules/@fontsource/bungee/files/bungee-latin-400-normal.woff2', 'bungee-400.woff2'],
  ['Baloo 2', 600, 'node_modules/@fontsource/baloo-2/files/baloo-2-latin-600-normal.woff2', 'baloo2-600.woff2'],
  ['Baloo 2', 700, 'node_modules/@fontsource/baloo-2/files/baloo-2-latin-700-normal.woff2', 'baloo2-700.woff2'],
  ['Baloo 2', 800, 'node_modules/@fontsource/baloo-2/files/baloo-2-latin-800-normal.woff2', 'baloo2-800.woff2'],
];
const fontsLocal =
  FONT_FILES.map(([, , , f]) => (f.startsWith('bungee') || f.endsWith('800.woff2') ? `<link rel="preload" href="fonts/${f}" as="font" type="font/woff2" crossorigin>` : '')).join('') +
  '<style>' +
  FONT_FILES.map(([fam, w, , f]) => `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${f}) format('woff2')}`).join('') +
  '</style>';
// CrazyGames uploads a flat folder: fonts go inside index.html as data URIs (~95 KB) instead of a fonts/ subfolder
const fontsInline =
  '<style>' +
  FONT_FILES.map(([fam, w, src]) => `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${readFileSync(src).toString('base64')}) format('woff2')}`).join('') +
  '</style>';
function copyFonts(out) {
  mkdirSync(`${out}/fonts`, { recursive: true });
  for (const [, , src, f] of FONT_FILES) copyFileSync(src, `${out}/fonts/${f}`);
}
const body = `<div id="app">
<canvas id="c" aria-label="¡Apágalo!"></canvas>
<div id="touch"></div>
<div id="icons"></div>
<div id="floaters"></div>
<div id="vignette"></div>
<div id="flash"></div>
<div id="hud" hidden></div>
<div id="nozzles" hidden></div>
<div class="stick" id="stickL"><i></i></div>
<div class="stick" id="stickR"><i></i></div>
<div id="toast" aria-live="polite"></div>
<div id="screens"></div>
</div>`;
const DESC_ES = 'Eres bombero: coge la manguera y apaga incendios que se extienden con el viento en 6 escenarios y un reto diario. Gratis, en el navegador y en el móvil.';

async function bundle(target, gameUrl) {
  const res = await build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    minify: prod,
    format: 'iife',
    target: ['es2022', 'safari15'],
    write: false,
    legalComments: 'none',
    define: {
      __MUSIC__: JSON.stringify(music),
      __TARGET__: JSON.stringify(target),
      __VERSION__: JSON.stringify(VERSION),
      __GAME_URL__: JSON.stringify(gameUrl),
      __ANALYTICS__: JSON.stringify(target === 'artifact' ? null : ANALYTICS),
      __PRIVACY_URL__: JSON.stringify(target === 'artifact' ? '' : target === 'web' ? '/privacidad' : `${GAME_URL}/privacidad`),
    },
  });
  return res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
}

function page({ js, headExtra = '', lang = 'es', fontTags = fontsLocal }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#162341">
<title>¡Apágalo! · Juego de bomberos</title>
<meta name="description" content="${DESC_ES}">
${headExtra}
${fontTags}
<style>${css}</style>
</head>
<body>
${body}
<script>${js}</script>
</body>
</html>
`;
}

const kb = (n) => (n / 1024).toFixed(0) + ' KB';

// ---------- web ----------
{
  const out = 'dist/web';
  // keep the Vercel link (.vercel) so `npx vercel deploy --prod` works straight from dist/web
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(out)) if (f !== '.vercel') rmSync(`${out}/${f}`, { recursive: true, force: true });
  const js = await bundle('web', GAME_URL);
  const og = `${GAME_URL}/og.png`;
  const head = `<link rel="canonical" href="${GAME_URL}/">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta property="og:type" content="website">
<meta property="og:site_name" content="¡Apágalo!">
<meta property="og:title" content="¡Apágalo! · Juego de bomberos">
<meta property="og:description" content="${DESC_ES}">
<meta property="og:url" content="${GAME_URL}/">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@nocodeboy">
<meta name="twitter:creator" content="@nocodeboy">
<meta name="twitter:title" content="¡Apágalo! · Juego de bomberos">
<meta name="twitter:description" content="${DESC_ES}">
<meta name="twitter:image" content="${og}">`;
  writeFileSync(`${out}/index.html`, page({ js, headExtra: head }));
  copyFonts(out);
  for (const f of Object.values(music)) copyFileSync(`assets/${f}`, `${out}/${f}`);
  for (const f of ['og.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon-32.png']) if (existsSync(`assets/${f}`)) copyFileSync(`assets/${f}`, `${out}/${f}`);
  writeFileSync(
    `${out}/manifest.webmanifest`,
    JSON.stringify(
      {
        name: '¡Apágalo!',
        short_name: '¡Apágalo!',
        description: DESC_ES,
        start_url: '/',
        display: 'fullscreen',
        orientation: 'any',
        background_color: '#162341',
        theme_color: '#162341',
        lang: 'es',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      null,
      2,
    ),
  );
  writeFileSync(`${out}/privacidad.html`, readFileSync('src/privacidad.html', 'utf8'));
  // Página para captar testers de la prueba cerrada de Google Play (/testers)
  writeFileSync(`${out}/testers.html`, readFileSync('src/testers.html', 'utf8'));
  mkdirSync(`${out}/t`, { recursive: true });
  for (const f of readdirSync('assets/testers')) copyFileSync(`assets/testers/${f}`, `${out}/t/${f}`);
  writeFileSync(
    `${out}/vercel.json`,
    JSON.stringify(
      {
        cleanUrls: true,
        headers: [
          { source: '/(.*)\\.(mp3|png|webp|woff2)', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
          { source: '/', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
        ],
      },
      null,
      2,
    ),
  );
  console.log('web/index.html', kb(readFileSync(`${out}/index.html`).length));
}

// ---------- CrazyGames ----------
{
  const out = 'dist/crazygames';
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const js = await bundle('crazygames', '');
  writeFileSync(`${out}/index.html`, page({ js, headExtra: '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>', fontTags: fontsInline }));
  for (const f of Object.values(music)) copyFileSync(`assets/${f}`, `${out}/${f}`);
  rmSync('dist/apagalo-crazygames.zip', { force: true });
  execSync(`cd ${out} && zip -qr ../apagalo-crazygames.zip .`);
  console.log('crazygames zip', kb(readFileSync('dist/apagalo-crazygames.zip').length));
}

// ---------- Android app (Capacitor wraps dist/android) ----------
{
  const out = 'dist/android';
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const js = await bundle('android', GAME_URL);
  writeFileSync(`${out}/index.html`, page({ js }));
  copyFonts(out);
  for (const f of Object.values(music)) copyFileSync(`assets/${f}`, `${out}/${f}`);
  console.log('android/index.html', kb(readFileSync(`${out}/index.html`).length));
}

// ---------- Claude artifact ----------
{
  const js = await bundle('artifact', GAME_URL);
  const artifact = `<title>¡Apágalo!</title>
<meta name="description" content="${DESC_ES}">
${fonts}
<style>${css}</style>
${body}
<script>${js}</script>
`;
  writeFileSync('dist/artifact.html', artifact);
  console.log('artifact.html', kb(artifact.length), '| music', JSON.stringify(music));
}
