# Scenario screenshots using the in-page test hook to fast-forward.
import asyncio, sys, json, os
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'http://127.0.0.1:8765/web/index.html'  # serve dist/ first (npm run serve)
OUT = os.path.join(ROOT, 'shots') + os.sep
ARGS = ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']

async def scenario(p, name, w, h, touch, steps, lang='es-ES'):
    b = await p.chromium.launch(args=ARGS)
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=touch, is_mobile=touch, locale=lang)
    page = await ctx.new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error','warning') else None)
    page.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
    await page.goto(URL)
    await page.wait_for_timeout(1500)
    for st in steps:
        k = st[0]
        if k == 'shot':
            await page.wait_for_timeout(st[2] if len(st) > 2 else 1200)
            await page.screenshot(path=OUT + name + '_' + st[1] + '.png')
        elif k == 'click':
            await page.click(st[1]); await page.wait_for_timeout(400)
        elif k == 'js':
            r = await page.evaluate(st[1])
            if r is not None: logs.append('JS: ' + json.dumps(r)[:400])
        elif k == 'wait':
            await page.wait_for_timeout(st[1])
    await b.close()
    return logs

LEVEL = lambda i: [('js', f"localStorage.setItem('apagalo.v1', JSON.stringify({{v:1,stars:{{plaza:3,granja:3,gasolinera:3,poligono:3,castanar:3,sanjuan:0}},best:{{}},daily:{{}},streak:{{count:0,last:''}},settings:{{sfx:true,music:true,vibration:true,quality:'high',lang:null}},tutorialDone:true,firstOpen:false,seenTips:[]}}))"), ('js','location.reload()'), ('wait', 1800), ('click','[data-a=levels]'), ('click', f'.lvl[data-i="{i}"]'), ('click','[data-a=go]')]

async def main():
    which = sys.argv[1]
    async with async_playwright() as p:
        if which == 'levels':
            for i in range(6):
                steps = LEVEL(i) + [('js', "window.__apagalo.bot(14)"), ('shot', f'L{i+1}', 1500), ('js', "(()=>{const s=window.__apagalo.sim;return {t:s.time,burn:s.burning,saved:s.saved,st:s.state, info: window.__apagalo.info}})()")]
                logs = await scenario(p, 'lv', 390, 844, True, steps)
                print(i+1, logs[-3:])
        elif which == 'spray':
            steps = LEVEL(0) + [('js', "window.__apagalo.advance(2.5, {mx:0.2, mz:-1})"), ('js', "window.__apagalo.advance(1.2, {ax:0.3, az:-1, aimDist:7, spray:true})"), ('js', "window.__hold={mx:0,mz:0,ax:0.35,az:-1,aimDist:7,spray:true,nozzle:0}"), ('shot','spray', 2500), ('js', "window.__hold={mx:0,mz:0,ax:-0.3,az:-1,aimDist:3,spray:true,nozzle:1}"), ('shot','fog', 2500)]
            print(await scenario(p, 'sp', 390, 844, True, steps))
        elif which == 'menus':
            logs = await scenario(p, 'mn', 390, 844, True, [('wait', 1500), ('shot','title'), ('click','[data-a=levels]'), ('shot','levels'), ('click','[data-a=back]'), ('click','[data-a=daily]'), ('shot','daily'), ('click','[data-a=back]'), ('click','[data-a=settings]'), ('shot','settings')])
            print(logs)
        elif which == 'end':
            steps = LEVEL(0) + [('js', "window.__apagalo.bot(100)"), ('wait', 30000), ('shot','end', 3000), ('js', "(()=>{const s=window.__apagalo.sim;return s.result})()")]
            print(await scenario(p, 'en', 390, 844, True, steps))
        elif which == 'polish':
            steps = LEVEL(4) + [('js', "window.__apagalo.advance(2, {})"), ('shot','intro_focus', 2500), ('js', "window.__apagalo.bot(12)"), ('shot', 'minimap', 1500), ('click', '#hud-pause'), ('shot', 'pause', 800)]
            print(await scenario(p, 'po', 390, 844, True, steps))
            steps = [('wait', 500), ('shot','title', 800), ('click','[data-a=levels]'), ('shot','levels', 600)]
            print(await scenario(p, 'po2', 390, 844, True, LEVEL(0)[:3] + steps))
            steps = LEVEL(0) + [('js', "window.__apagalo.bot(12)"), ('js', "document.querySelector('#app').insertAdjacentHTML('beforeend','<div class=\\'banner win\\'><span>¡APAGADO!</span></div>')"), ('shot','banner', 600)]
            print(await scenario(p, 'po3', 390, 844, True, steps))
        elif which == 'desk':
            steps = LEVEL(4) + [('js', "window.__apagalo.bot(25)"), ('shot', 'castanar', 1500)]
            print(await scenario(p, 'dk', 1280, 720, False, steps))
asyncio.run(main())
