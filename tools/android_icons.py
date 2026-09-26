# Renders the Android launcher icon sources (adaptive foreground/background, legacy icon, splash) for @capacitor/assets.
import asyncio
from playwright.async_api import async_playwright
OUT = '/home/claude/apagalo/assets/android/'
FLAME = '''<path d="M256 96c38 40 62 76 62 118 0 22-8 40-20 54 6-30-4-54-24-72 2 34-14 56-36 70-20 12-34 30-34 54 0 12 3 23 9 32-40-14-64-50-64-92 0-60 44-86 60-128 4 24 14 40 30 50 4-34 14-62 17-86z" fill="#ffb21f"/>
<path d="M256 170c20 22 34 44 34 70 0 32-24 56-54 56-26 0-46-20-46-46 0-30 24-44 32-70 8 12 16 18 26 22 4-12 6-22 8-32z" fill="#fff2a0"/>
<path d="M332 214c26 30 40 54 40 76a40 40 0 0 1-80 0c0-22 14-46 40-76z" fill="#3fb6ff" stroke="#fff" stroke-width="10"/>'''
GRAD = '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef4a3a"/><stop offset="1" stop-color="#b8231b"/></linearGradient></defs>'
LEGACY = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{GRAD}<rect width="512" height="512" fill="url(#g)"/>
<rect x="0" y="372" width="512" height="44" fill="#cfd6df"/><rect x="0" y="383" width="512" height="22" fill="#f2e03a"/>{FLAME}</svg>'''
# adaptive icon: 1024 canvas = 108dp; launchers show the central 72dp (and may mask to a circle: keep art inside ~62%)
FG = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><g transform="translate(512 468) scale(1.95) translate(-270 -215)">{FLAME}</g></svg>'''
BG = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">{GRAD}<rect width="1024" height="1024" fill="url(#g)"/>
<rect x="0" y="742" width="1024" height="64" fill="#cfd6df"/><rect x="0" y="758" width="1024" height="32" fill="#f2e03a"/></svg>'''
SPLASH = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="#162341"/>
<g transform="translate(1366 1366) scale(2.1) translate(-270 -215)">{FLAME}</g></svg>'''

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, svg, size, transparent in [('icon-only.png', LEGACY, 1024, False), ('icon-foreground.png', FG, 1024, True),
                                             ('icon-background.png', BG, 1024, False), ('splash.png', SPLASH, 2732, False),
                                             ('splash-dark.png', SPLASH, 2732, False)]:
            page = await b.new_page(viewport={'width': size, 'height': size})
            await page.set_content(f'<html><body style="margin:0;background:transparent">{svg.replace("<svg ", f"<svg width={size} height={size} ", 1)}</body></html>')
            await page.screenshot(path=OUT + name, omit_background=transparent)
            await page.close()
        await b.close()
    print('ok')
asyncio.run(main())
