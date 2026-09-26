# Renders store/share assets from the real game: app icons, OG image, CrazyGames covers.
# Usage: python3 tools/assets.py
import asyncio, os
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'http://127.0.0.1:8765/web/index.html'  # served: file:// blocks the self-hosted fonts
OUT = f'{ROOT}/assets/'
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']

SAVE = "localStorage.setItem('apagalo.v1', JSON.stringify({v:1,stars:{plaza:3,granja:3,gasolinera:3,poligono:3,castanar:3,sanjuan:3},best:{},daily:{},streak:{count:0,last:''},settings:{sfx:false,music:false,vibration:false,gfx:'high',autoTier:'high',lang:'es',stats:false},tutorialDone:true,firstOpen:false,seenTips:[]}))"

ICON_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef4a3a"/><stop offset="1" stop-color="#b8231b"/></linearGradient></defs>
<rect width="512" height="512" rx="0" fill="url(#g)"/>
<rect x="0" y="372" width="512" height="44" fill="#cfd6df"/><rect x="0" y="383" width="512" height="22" fill="#f2e03a"/>
<path d="M256 96c38 40 62 76 62 118 0 22-8 40-20 54 6-30-4-54-24-72 2 34-14 56-36 70-20 12-34 30-34 54 0 12 3 23 9 32-40-14-64-50-64-92 0-60 44-86 60-128 4 24 14 40 30 50 4-34 14-62 17-86z" fill="#ffb21f"/>
<path d="M256 170c20 22 34 44 34 70 0 32-24 56-54 56-26 0-46-20-46-46 0-30 24-44 32-70 8 12 16 18 26 22 4-12 6-22 8-32z" fill="#fff2a0"/>
<path d="M332 214c26 30 40 54 40 76a40 40 0 0 1-80 0c0-22 14-46 40-76z" fill="#3fb6ff" stroke="#fff" stroke-width="10"/>
</svg>'''

HIDE_UI = "document.head.insertAdjacentHTML('beforeend','<style>#hud,#nozzles,#icons,#floaters,#toast,.tut,.stick,#screens,.banner{display:none!important}</style>')"

def title_html(size, tag=False, top='5%', shift=0):
    tagline = '<p style="margin:14px 0 0;font-family:Baloo 2,sans-serif;font-weight:800;font-size:%dpx;color:#fff;text-shadow:0 3px 8px rgba(0,0,0,.7)">Coge la manguera. Salva el pueblo.</p>' % int(size * 0.3) if tag else ''
    return f'''<div id="poster" style="position:fixed;inset:0;z-index:60;pointer-events:none;display:flex;flex-direction:column;align-items:center;padding-top:{top};background:linear-gradient(180deg,rgba(13,21,40,.55) 0%,rgba(13,21,40,0) 34%)">
<h1 style="font-family:Bungee,Impact,sans-serif;font-weight:400;font-size:{size}px;line-height:1;margin:0;color:#fff;letter-spacing:-.01em;transform:translateX({shift}px) rotate(-3deg);text-shadow:0 {size*0.06:.0f}px 0 #e23a2e,0 {size*0.11:.0f}px 0 #a8231b,0 {size*0.2:.0f}px {size*0.35:.0f}px rgba(0,0,0,.45)"><span style="color:#ffb21f">¡</span>APÁGALO<span style="color:#ffb21f">!</span></h1>
<div style="width:{size*4.2:.0f}px;height:{max(8,size*0.1):.0f}px;margin-top:{size*0.28:.0f}px;transform:translateX({shift}px) rotate(-3deg);background:linear-gradient(180deg,#cfd6df 0 25%,#f2e03a 25% 75%,#cfd6df 75% 100%);border-radius:4px"></div>
{tagline}</div>'''

SCENE = '''(async (opts) => {
  window.__poster = true;
  const a = window.__apagalo;
  a.advance(opts.grow, {});
  a.bot(opts.bot);
  const s = a.sim;
  let best = -1, bd = 1e9;
  for (let i = 0; i < s.N; i++) { if (s.fire[i] <= 0) continue; const x = (i % s.W) + .5, z = Math.floor(i / s.W) + .5; const d = Math.hypot(x - s.player.x, z - s.player.z); if (d > 2 && d < bd) { bd = d; best = i; } }
  if (best >= 0) {
    const x = (best % s.W) + .5, z = Math.floor(best / s.W) + .5;
    const dx = x - s.player.x, dz = z - s.player.z, d = Math.hypot(dx, dz);
    window.__hold = { mx: 0, mz: 0, ax: dx / d, az: dz / d, aimDist: Math.min(d, 9), spray: true, nozzle: 0 };
    a.stage.focus = { x: x + (s.player.x - x) * 0.5, z: z + (s.player.z - z) * 0.5 + opts.dz };
    a.stage.target.x = a.stage.focus.x; a.stage.target.z = a.stage.focus.z;
  }
  a.stage.zoom = a.stage.zoomTarget = opts.zoom;
  return { burning: s.burning, best };
})'''

async def shot(p, name, w, h, level, zoom, grow, bot, title_size=None, tag=False, top='5%', dz=0.0, shift=0):
    b = await p.chromium.launch(args=ARGS)
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=True, is_mobile=w < h, locale='es-ES')
    page = await ctx.new_page()
    await page.goto(URL); await page.wait_for_timeout(800)
    await page.evaluate(SAVE)
    await page.goto(URL); await page.wait_for_timeout(1500)
    await page.click('[data-a=levels]'); await page.wait_for_timeout(300)
    await page.click(f'.lvl[data-i="{level}"]'); await page.wait_for_timeout(300)
    await page.click('[data-a=go]'); await page.wait_for_timeout(300)
    await page.evaluate(HIDE_UI)
    r = await page.evaluate(SCENE + '(%s)' % ('{zoom:%s,grow:%s,bot:%s,dz:%s}' % (zoom, grow, bot, dz)))
    await page.wait_for_timeout(4500)
    if title_size:
        await page.evaluate("(h)=>document.body.insertAdjacentHTML('beforeend', h)", title_html(title_size, tag, top, shift))
        await page.wait_for_timeout(900)
    await page.screenshot(path=OUT + name)
    await b.close()
    print(name, r)

async def icons(p):
    b = await p.chromium.launch(args=ARGS)
    for size, name in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png'), (32, 'favicon-32.png')]:
        page = await b.new_page(viewport={'width': size, 'height': size})
        await page.set_content(f'<html><body style="margin:0">{ICON_SVG.replace("<svg ", f"<svg width={size} height={size} ")}</body></html>')
        await page.screenshot(path=OUT + name)
        await page.close()
    await b.close()
    print('icons ok')

async def main():
    import sys
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    async with async_playwright() as p:
        if which in ('all', 'icons'):
            await icons(p)
        if which in ('all', 'og'):
            await shot(p, 'og.png', 1200, 630, 0, 1.0, 7, 3.2, 84, tag=True, top='3%', dz=-1.0)
        if which in ('all', 'covers'):
            # CrazyGames puts labels over the top-left corner of the covers (about a third of the width by a
            # strip about 3:1 on the wide covers, taller on the square): the title stays out of it
            await shot(p, 'cg-cover-1920x1080.png', 1920, 1080, 0, 1.0, 7, 3.2, 150, top='3%', dz=-1.0, shift=220)
            await shot(p, 'cg-cover-800x1200.png', 800, 1200, 0, 0.72, 7, 3.2, 104, top='10.5%', dz=-1.6)
            await shot(p, 'cg-cover-800x800.png', 800, 800, 0, 0.8, 7, 3.2, 80, top='4%', dz=-1.2, shift=130)

if __name__ == '__main__':
    asyncio.run(main())
