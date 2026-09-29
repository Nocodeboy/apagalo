# Screenshots of the v2 content (new places, power-ups, events, crew, route screen, album) for visual review.
# Usage: python3 tools/shots_v2.py [what] [ids...]   what: levels (default), land, at, ui, systems, crew
# Serve dist/ first (npm run serve, or PORT=8791 with your own server). Output: shots/v2/
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
VIEWS = {'portrait': (390, 844, True), 'landscape': (844, 390, True), 'desktop': (1280, 720, False)}

# a save with everything open, some crew and coins
SAVE = {'v': 1, 'stars': {}, 'best': {}, 'daily': {}, 'streak': {'count': 0, 'last': ''},
        'settings': {'sfx': False, 'music': False, 'vibration': True, 'gfx': 'high', 'autoTier': None, 'lang': None, 'stats': False},
        'tutorialDone': True, 'firstOpen': False, 'seenTips': [], 'coins': 12000, 'route': 99, 'reach': '', 'open': [],
        'crew': {'partner': 2, 'dog': 1, 'drone': 1}, 'team': ['partner', 'dog'], 'pages': {}, 'whatsNew': 2}


async def page_for(b, view, lang='en-US', save=None):
    w, h, touch = VIEWS[view]
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=touch, is_mobile=touch, locale=lang)
    s = dict(SAVE if save is None else save)
    await ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ localStorage.setItem('apagalo.v1', {json.dumps(json.dumps(s))}); sessionStorage.setItem('seeded', '1'); }}")
    page = await ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    await page.goto(URL)
    await page.wait_for_timeout(1500)
    return ctx, page, errs


async def shot(page, name, wait=900):
    await page.wait_for_timeout(wait)
    os.makedirs(OUT, exist_ok=True)
    await page.screenshot(path=os.path.join(OUT, name + '.png'))


async def level(b, lid, view='portrait', secs=10, lang='en-US', tag='', intro=False):
    ctx, page, errs = await page_for(b, view, lang)
    if intro:
        await page.evaluate(f"__apagalo.level({json.dumps(lid)})")
        await shot(page, f'{lid}-{view}-intro{tag}')
        await page.click('[data-a=go]')
    else:
        await page.evaluate(f"__apagalo.level({json.dumps(lid)}, true)")
    await page.wait_for_timeout(400)
    await page.evaluate(f"__apagalo.bot({secs})")
    await shot(page, f'{lid}-{view}{tag}')
    info = await page.evaluate("(() => { const s = __apagalo.sim; return { t: s.time.toFixed(1), burn: s.burning, saved: s.saved.toFixed(2), st: s.state, info: __apagalo.info } })()")
    print(lid, view, info, errs[:3])
    await ctx.close()


def progress_save(n_won, pages=()):
    """A save that has won the first n levels of the route (ids from the page), with front pages."""
    s = dict(SAVE)
    s['route'] = 0
    s['pages'] = {pid: {'t': 1790000000000, 'stars': 3, 'saved': 0.91, 'score': 1520} for pid in pages}
    return s


async def ui(b, view, lang):
    tag = f'{view}-{lang[:2]}'
    # route screen: a player on level 23 with two front pages
    ctx, page, errs = await page_for(b, view, lang, progress_save(0))
    ids = await page.evaluate('__apagalo.levels')
    await page.evaluate(f"(() => {{ const s = __apagalo.save; {json.dumps(ids[:22])}.forEach((id, k) => s.stars[id] = 1 + (k % 3)); s.pages['{ids[9]}'] = {{t: Date.now(), stars: 3, saved: 0.9, score: 1400}}; s.pages['{ids[19]}'] = {{t: Date.now(), stars: 2, saved: 0.8, score: 1200}}; }})()")
    await page.click('[data-a=levels]')
    await shot(page, f'ui-route-{tag}')
    await page.click('[data-a=prev]')
    await shot(page, f'ui-route-p2-{tag}', 1200)
    await page.click('[data-a=album]')
    await shot(page, f'ui-album-{tag}', 1500)
    await page.click(f'.apage[data-id="{ids[9]}"]')
    await shot(page, f'ui-page-{tag}', 1800)
    # shop with the crew
    await page.goto(URL)
    await page.wait_for_timeout(1200)
    await page.click('.title-screen [data-a=shop]')
    await page.evaluate("document.querySelector('.shop').scrollTop = 420")
    await shot(page, f'ui-shop-{tag}')
    # intro with news and the crew picker (level 11: new power-up and event)
    await page.evaluate(f"__apagalo.level({json.dumps(ids[10])})")
    await shot(page, f'ui-intro-{tag}', 2500)
    print('ui', view, lang, errs[:3])
    await ctx.close()


async def systems(b):
    # power-up on the ground, then picked up (level 8)
    ctx, page, errs = await page_for(b, 'portrait')
    ids = await page.evaluate('__apagalo.levels')
    lid = ids[7]
    await page.evaluate(f"__apagalo.level({json.dumps(lid)}, true)")
    await page.evaluate("__apagalo.advance(0.2)")
    t0 = await page.evaluate("__apagalo.sim.powerPlan ? __apagalo.sim.powerPlan[0].t : 0")
    await page.evaluate(f"__apagalo.bot({t0 + 0.5})")
    await page.evaluate("(() => { const s = __apagalo.sim, p = s.powerup; if (p) { s.player.x = p.x + (p.x > s.W / 2 ? -2.2 : 2.2); s.player.z = p.z + 1.2; } })()")
    await shot(page, 'sys-powerup-ground', 700)
    await page.evaluate("(() => { const s = __apagalo.sim, p = s.powerup; if (p) { s.player.x = p.x; s.player.z = p.z; } })()")
    await page.evaluate("__apagalo.advance(0.2)")
    await shot(page, 'sys-powerup-got', 500)
    # helicopter: a charge, called from the HUD button
    await page.evaluate("__apagalo.sim.heliCharges = 1")
    await page.evaluate("__apagalo.advance(0.1)")
    await shot(page, 'sys-heli-button', 300)
    await page.click('#hud-heli', force=True)
    await page.evaluate("__apagalo.advance(1.6)")
    await shot(page, 'sys-heli-coming', 300)
    await page.evaluate("__apagalo.advance(0.8)")
    await shot(page, 'sys-heli-drop', 200)
    print('power/heli', errs[:3])
    await ctx.close()
    # events: the warning banner and the event itself, on the level where each one first shows up
    for kind in ['neighbors', 'rain', 'gust', 'pressure', 'leak', 'onlookers', 'blackout']:
        ctx, page, errs = await page_for(b, 'portrait')
        found = await page.evaluate(f"(() => {{ const a = __apagalo; for (const id of a.levels) {{ a.level(id, true); const ev = (a.sim.def.events || []).find((e) => e.kind === '{kind}'); if (ev) return [id, ev.t]; }} return null; }})()")
        if not found:
            print('no level with', kind)
            await ctx.close()
            continue
        lid, t = found
        await page.evaluate(f"__apagalo.level({json.dumps(lid)}, true)")
        # the bot plays until the warning shows (at its planned second, or earlier if the fire is going out fast)
        st = 0
        for _ in range(400):
            await page.evaluate("__apagalo.bot(0.25)")
            st = await page.evaluate(f"(() => {{ const s = __apagalo.sim; const e = s.eventPlan.find((e) => e.kind === '{kind}'); return s.state !== 'play' ? -1 : e ? e.st : -1; }})()")
            if st != 0:
                break
        await page.evaluate("__apagalo.bot(0.5)")
        await shot(page, f'sys-event-{kind}-warn', 300)
        await page.evaluate("__apagalo.bot(4)")
        await shot(page, f'sys-event-{kind}', 300)
        print('event', kind, lid, errs[:3])
        await ctx.close()
    # trains: warning lights, the train passing
    ctx, page, errs = await page_for(b, 'portrait')
    await page.evaluate("__apagalo.level('estacion-2', true)")
    await page.evaluate("__apagalo.bot(8)")
    await shot(page, 'sys-train-warn', 300)
    await page.evaluate("__apagalo.bot(2.6)")
    await shot(page, 'sys-train-pass', 200)
    print('train', errs[:3])
    await ctx.close()


async def crew(b, view='portrait'):
    # the partner and the dog at work (a level with two crew slots and animals to rescue), then the drone
    for team, lid, tag in ((['partner', 'dog'], 'granja-5', 'partner-dog'), (['drone'], 'ciudad-4', 'drone')):
        ctx, page, errs = await page_for(b, view)
        await page.evaluate(f"(() => {{ const s = __apagalo.save; s.crew = {{ partner: 3, dog: 3, drone: 3 }}; s.team = {json.dumps(team)}; }})()")
        await page.evaluate(f"__apagalo.level({json.dumps(lid)}, true)")
        await page.evaluate("__apagalo.bot(7)")
        await shot(page, f'sys-crew-{tag}-{view}', 400)
        print('crew', team, lid, errs[:3])
        await ctx.close()
    # end screens: air support after two losses in a row, and a big fire won with its front page
    ctx, page, errs = await page_for(b, view)
    ids = await page.evaluate('__apagalo.levels')
    lid = ids[7]
    await page.evaluate(f"(() => {{ const s = __apagalo.save; s.stars['{lid}'] = 0; }})()")
    for k in range(2):
        await page.evaluate(f"__apagalo.level({json.dumps(lid)}, true)")
        await page.wait_for_timeout(300)
        await page.evaluate("(() => { const a = __apagalo; a.sim.timeLeft = 0.05; a.advance(0.3); })()")
        if await page.is_visible('[data-a=decline]'):
            await page.click('[data-a=decline]')
        await page.wait_for_selector('.end-screen', timeout=30000)
    await shot(page, f'sys-end-air-{view}', 2600)
    big = ids[9]
    await page.evaluate(f"__apagalo.level({json.dumps(big)}, true)")
    await page.evaluate("__apagalo.bot(6)")
    await page.evaluate("(() => { const a = __apagalo, s = a.sim; s.fire.fill(0); s.heat.fill(0); s.embers.length = 0; s.rockets.length = 0; s.rocketsLeft = 0; if (s.leak) s.leak.state = 2; a.advance(1.5); })()")
    await page.wait_for_selector('.end-screen', timeout=30000)
    await shot(page, f'sys-end-bigfire-{view}', 900)
    await page.wait_for_timeout(2500)
    await shot(page, f'sys-end-frontpage-{view}', 1200)
    print('ends', errs[:3])
    await ctx.close()


async def main():
    what = sys.argv[1] if len(sys.argv) > 1 else 'levels'
    ids = sys.argv[2:]
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        if what == 'levels':
            for lid in ids:
                await level(b, lid, 'portrait', 8, intro=True)
        elif what == 'land':
            for lid in ids:
                await level(b, lid, 'landscape', 10)
        elif what == 'ui':
            for view in (ids[0:1] or ['portrait', 'landscape']):
                for lang in ['en-US', 'es-ES']:
                    await ui(b, view, lang)
        elif what == 'systems':
            await systems(b)
        elif what == 'crew':
            for view in (ids[0:1] or ['portrait', 'landscape']):
                await crew(b, view)
        elif what == 'at':
            # ids: level secs
            await level(b, ids[0], ids[2] if len(ids) > 2 else 'portrait', float(ids[1]), tag=f'-t{ids[1]}')
        await b.close()


asyncio.run(main())
