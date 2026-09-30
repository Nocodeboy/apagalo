# Screenshots of the entrega 2 places (ski lodge, museum, campground) at a given moment of play, for visual review.
# Usage: PORT=8791 python3 tools/shots_b.py <levelId[@secs]>... [--land] [--w=320]
# Serve dist/ first. Output: shots/v2/<id>-<view>-t<secs>.png
import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = os.environ.get('PORT', '8765')
URL = f'http://127.0.0.1:{PORT}/web/index.html'
OUT = os.path.join(ROOT, 'shots', 'v2')
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
SAVE = {'v': 1, 'stars': {}, 'best': {}, 'daily': {}, 'streak': {'count': 0, 'last': ''},
        'settings': {'sfx': False, 'music': False, 'vibration': True, 'gfx': 'high', 'autoTier': None, 'lang': None, 'stats': False},
        'tutorialDone': True, 'firstOpen': False, 'seenTips': [], 'coins': 12000, 'route': 99, 'reach': '', 'open': [],
        'crew': {'partner': 0, 'dog': 0, 'drone': 0}, 'team': [], 'pages': {}, 'whatsNew': 2}


async def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    land = '--land' in sys.argv
    wopt = next((a for a in sys.argv if a.startswith('--w=')), None)
    lang = next((a[7:] for a in sys.argv if a.startswith('--lang=')), 'en-US')
    w, h = (844, 390) if land else (390, 844)
    if wopt:
        w = int(wopt[4:])
        h = 700 if not land else 320
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        for a in args:
            lid, _, secs = a.partition('@')
            secs = float(secs or 12)
            ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=True, is_mobile=True, locale=lang)
            await ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ localStorage.setItem('apagalo.v1', {json.dumps(json.dumps(SAVE))}); sessionStorage.setItem('seeded', '1'); }}")
            page = await ctx.new_page()
            errs = []
            page.on('pageerror', lambda e: errs.append(str(e)))
            page.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            await page.goto(URL)
            await page.wait_for_timeout(1200)
            await page.evaluate(f"__apagalo.level({json.dumps(lid)}, true)")
            await page.wait_for_timeout(300)
            await page.evaluate(f"__apagalo.bot({secs})")
            await page.wait_for_timeout(700)
            os.makedirs(OUT, exist_ok=True)
            tag = ('land' if land else 'portrait') + (f'-w{w}' if wopt else '') + ('' if lang == 'en-US' else '-' + lang[:2])
            await page.screenshot(path=os.path.join(OUT, f'{lid}-{tag}-t{int(secs)}.png'))
            info = await page.evaluate("(() => { const s = __apagalo.sim; return { t: s.time.toFixed(1), burn: s.burning, saved: s.saved.toFixed(2), st: s.state, info: __apagalo.info } })()")
            print(lid, tag, info, errs[:3])
            await ctx.close()
        await b.close()


asyncio.run(main())
