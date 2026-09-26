# Google Play assets from the real game: phone screenshots (1080x1920, with HUD) and the feature graphic (1024x500).
# Usage: python3 tools/store_shots.py [all|shots|feature]   (serve dist/ on :8765 first, or set PORT)
# GAME_LANG=en renders the English listing into assets/play-en/ (default: Spanish into assets/play/).
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
os.environ.setdefault('GAME_LANG', 'es')  # before importing assets: it reads the language at import time
import assets as A  # reuses SAVE, SCENE and the title overlay from the cover renderer

URL = A.URL
OUT = os.path.join(A.ROOT, 'assets', 'play' if A.LANG == 'es' else 'play-en') + os.sep
HIDE = "document.head.insertAdjacentHTML('beforeend','<style>#toast,.tut,.stick,.banner,.fl.bad{display:none!important}</style>')"

async def game_shot(p, name, level, pre, zoom=1.0, dz=0.0, bot_after=0.0):
    b = await p.chromium.launch(args=A.ARGS)
    ctx = await b.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=2, has_touch=True, is_mobile=True, locale=A.LOCALE)
    page = await ctx.new_page()
    await page.goto(URL); await page.wait_for_timeout(600)
    await page.evaluate(A.SAVE); await page.goto(URL); await page.wait_for_timeout(1500)
    await page.click('[data-a=levels]'); await page.wait_for_timeout(300)
    await page.click(f'.lvl[data-i="{level}"]'); await page.wait_for_timeout(300)
    await page.click('[data-a=go]'); await page.wait_for_timeout(300)
    await page.evaluate(HIDE)
    await page.evaluate(A.SCENE + '(%s)' % ('{zoom:%s,grow:%s,bot:%s,dz:%s}' % (zoom, pre[0], pre[1], dz)))
    await page.wait_for_timeout(5000)
    await page.screenshot(path=OUT + name)
    await b.close()
    print(name, flush=True)

async def menu_shot(p, name, clicks):
    b = await p.chromium.launch(args=A.ARGS)
    ctx = await b.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=2, has_touch=True, is_mobile=True, locale=A.LOCALE)
    page = await ctx.new_page()
    await page.goto(URL); await page.wait_for_timeout(600)
    await page.evaluate(A.SAVE.replace('plaza:3,granja:3,gasolinera:3,poligono:3,castanar:3,sanjuan:3', 'plaza:3,granja:3,gasolinera:2,poligono:3,castanar:1'))
    await page.goto(URL); await page.wait_for_timeout(4000)
    for c in clicks:
        await page.click(c); await page.wait_for_timeout(700)
    await page.wait_for_timeout(1500)
    await page.screenshot(path=OUT + name)
    await b.close()
    print(name, flush=True)

async def main():
    os.makedirs(OUT, exist_ok=True)
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    async with async_playwright() as p:
        if which in ('all', 'shots'):
            await game_shot(p, '1-granja.png', 1, (12, 1.5), 0.95)
            await game_shot(p, '2-plaza.png', 0, (7, 3.2), 0.85, -1.2)
            await game_shot(p, '3-sanjuan.png', 5, (0, 9.0), 1.0)
            await game_shot(p, '4-castanar.png', 4, (8, 22), 1.2)
            await game_shot(p, '5-gasolinera.png', 2, (6, 6), 0.95)
            await menu_shot(p, '6-niveles.png', ['[data-a=levels]'])
        if which in ('all', 'feature'):
            A.OUT = OUT
            await A.shot(p, 'feature-1024x500.png', 1024, 500, 0, 1.0, 7, 3.2, 72, tag=True, top='3%', dz=-1.0)
asyncio.run(main())
