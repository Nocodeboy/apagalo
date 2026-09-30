# Google Play phone screenshots of the 2.0 content (new scenarios, route, album), 1080x1920 with HUD.
# Usage: python3 tools/store_shots_v2.py [en|es]   (serve dist/ first: npm run serve, or PORT=...)
# Output: assets/play-en/ (en, default) or assets/play/ (es), files named v2-*.png.
import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

sys.path.insert(0, os.path.dirname(__file__))
from shots_v2 import SAVE, ARGS, ROOT  # noqa: E402

PORT = os.environ.get('PORT', '8765')
URL = f'http://127.0.0.1:{PORT}/web/index.html'
LANG = (sys.argv[1] if len(sys.argv) > 1 else 'en')
LOCALE = 'en-US' if LANG == 'en' else 'es-ES'
OUT = os.path.join(ROOT, 'assets', 'play-en' if LANG == 'en' else 'play')
HIDE = "document.head.insertAdjacentHTML('beforeend','<style>#toast,.tut,.stick{display:none!important}</style>')"

# (file, level id, seconds of bot play before the shot)
SCENES = [
    ('v2-1-ciudad.png', 'ciudad-3', 16),
    ('v2-2-puerto.png', 'puerto-2', 14),
    ('v2-3-nieve.png', 'nieve-5', 12),
    ('v2-4-museo.png', 'museo-5', 12),
    ('v2-5-camping.png', 'camping-5', 14),
    ('v2-6-estacion.png', 'estacion-7', 12),
]


async def context(b):
    ctx = await b.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=2, has_touch=True,
                              is_mobile=True, locale=LOCALE)
    s = dict(SAVE)
    await ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ localStorage.setItem('apagalo.v1', {json.dumps(json.dumps(s))}); sessionStorage.setItem('seeded', '1'); }}")
    page = await ctx.new_page()
    await page.goto(URL)
    await page.wait_for_timeout(1800)
    return ctx, page


async def scene(b, name, lid, secs):
    ctx, page = await context(b)
    await page.evaluate(f"__apagalo.level({json.dumps(lid)}, true)")
    await page.wait_for_timeout(500)
    await page.evaluate(HIDE)
    await page.evaluate(f"__apagalo.bot({secs})")
    await page.wait_for_timeout(1200)
    await page.screenshot(path=os.path.join(OUT, name))
    print(name, flush=True)
    await ctx.close()


async def route(b):
    ctx, page = await context(b)
    ids = await page.evaluate('__apagalo.levels')
    await page.evaluate(f"(() => {{ const s = __apagalo.save; {json.dumps(ids[:27])}.forEach((id, k) => s.stars[id] = 2 + (k % 2)); s.pages['{ids[9]}'] = {{t: Date.now(), stars: 3, saved: 0.93, score: 1480}}; s.pages['{ids[19]}'] = {{t: Date.now(), stars: 3, saved: 0.88, score: 1390}}; }})()")
    await page.click('[data-a=levels]')
    await page.wait_for_timeout(1500)
    await page.screenshot(path=os.path.join(OUT, 'v2-7-ruta.png'))
    print('v2-7-ruta.png', flush=True)
    await page.click('[data-a=album]')
    await page.wait_for_timeout(1800)
    await page.screenshot(path=os.path.join(OUT, 'v2-8-album.png'))
    print('v2-8-album.png', flush=True)
    await ctx.close()


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        for name, lid, secs in SCENES:
            await scene(b, name, lid, secs)
        await route(b)
        await b.close()


asyncio.run(main())
