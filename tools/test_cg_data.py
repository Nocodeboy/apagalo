# CrazyGames build + mocked SDK Data module: the portal copy of the save must win on load (and a copy from 1.3.0 is
# migrated to the 2.0 route with nothing lost), a first-time portal player must get their local save copied in, and new
# progress must be written back. Serve dist/ on :8765 first (or set PORT). Ends with "ALL OK" or the failures.
import asyncio
import json
import os

from playwright.async_api import async_playwright

URL = f"http://127.0.0.1:{os.environ.get('PORT', '8765')}/crazygames/index.html"
KEY = 'apagalo.v1'


def mock(cloud):
    return """window.__cg=[];window.__cloud=%s;window.CrazyGames={SDK:{environment:'crazygames',
init:async()=>{__cg.push('init')},
data:{getItem:k=>(k in __cloud?__cloud[k]:null),setItem:(k,v)=>{__cloud[k]=v;__cg.push('setItem')},removeItem:k=>{delete __cloud[k]},clear:()=>{__cloud={}}},
game:{loadingStart:()=>__cg.push('loadingStart'),loadingStop:()=>__cg.push('loadingStop'),gameplayStart:()=>__cg.push('gameplayStart'),
gameplayStop:()=>__cg.push('gameplayStop'),happytime:()=>__cg.push('happytime')}}};""" % json.dumps(cloud)


async def run(p, name, cloud, local):
    b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = await b.new_context(viewport={'width': 800, 'height': 450})
    if local is not None:
        await ctx.add_init_script(f"try{{localStorage.setItem({json.dumps(KEY)}, {json.dumps(json.dumps(local))})}}catch(e){{}}")
    page = await ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    await page.route('https://sdk.crazygames.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=mock(cloud)))
    await page.goto(URL)
    await page.wait_for_timeout(2500)
    title = await page.evaluate("(document.querySelector('.title-screen')||{}).innerText||''")
    st = await page.evaluate("({cg: window.__cg, cloud: window.__cloud[%s] ? JSON.parse(window.__cloud[%s]) : null, live: { route: __apagalo.save.route, stars: __apagalo.save.stars, open: __apagalo.save.open.length, reach: __apagalo.save.reach, coins: __apagalo.save.coins }})" % (json.dumps(KEY), json.dumps(KEY)))
    st['errs'] = errs
    await b.close()
    stars = sum((st['cloud'] or {}).get('stars', {}).values())
    print(f'[{name}] calls={st["cg"]} cloud_stars={stars} lang={(st["cloud"] or {}).get("settings", {}).get("lang")} errors={errs}')
    print('   title:', ' | '.join(title.split('\n')[:6]))
    return st, title


FAILS = []


def check(ok, what):
    print(('  ok   ' if ok else '  FAIL ') + what)
    if not ok:
        FAILS.append(what)


async def main():
    async with async_playwright() as p:
        # 1) Returning player on another device: portal copy has 7 stars and English, local is empty
        cloud_save = {'v': 1, 'stars': {'plaza': 3, 'granja': 3, 'gasolinera': 1}, 'best': {}, 'daily': {}, 'streak': {'count': 0, 'last': ''},
                      'settings': {'sfx': True, 'music': True, 'vibration': True, 'gfx': 'auto', 'autoTier': None, 'lang': 'en', 'stats': True},
                      'tutorialDone': True, 'firstOpen': False, 'seenTips': []}
        st, title = await run(p, 'cloud wins', {KEY: json.dumps(cloud_save)}, None)
        check(sum(st['live']['stars'].values()) == 7 and 'PUT IT OUT' in title and not st['errs'], 'cloud wins: the portal progress and language are loaded')
        # 2) First time on the portal build but played before in this browser: local save is copied in
        local_save = dict(cloud_save, stars={'plaza': 2}, settings=dict(cloud_save['settings'], lang='es'))
        st, title = await run(p, 'migrate local', {}, local_save)
        check('setItem' in st['cg'] and sum(st['cloud']['stars'].values()) == 2 and 'APÁGALO' in title and not st['errs'], 'migrate local: the local save is copied to the portal')
        # 3) Brand-new player: fresh save is written to the portal store
        st, title = await run(p, 'new player', {}, None)
        check('setItem' in st['cg'] and st['cloud'] is not None and not st['errs'], 'new player: a fresh save is written to the portal')
        # 4) A portal copy from 1.3.0 (20 levels won in the old order, coins): migrated to the 2.0 route, nothing lost
        ids13 = ['plaza', 'granja', 'gasolinera', 'poligono', 'castanar', 'sanjuan', 'plaza-2', 'granja-2', 'gasolinera-2', 'poligono-2', 'castanar-2',
                 'sanjuan-2', 'granja-3', 'gasolinera-3', 'poligono-3', 'castanar-3', 'sanjuan-3', 'plaza-3', 'gasolinera-4', 'poligono-4']
        old = dict(cloud_save, stars={i: 2 for i in ids13}, coins=2500)
        st, title = await run(p, 'cloud 1.3.0', {KEY: json.dumps(old)}, None)
        live = st['live']
        check(live['route'] >= 3 and sum(live['stars'].values()) == 40 and live['coins'] == 2500 and live['open'] > 0 and live['reach'] and not st['errs'],
              f'cloud 1.3.0: migrated to the 2.0 route with every star and coin (route {live["route"]}, reach {live["reach"]}, {live["open"]} opened)')
    print('ALL OK' if not FAILS else f'{len(FAILS)} FAILED: {FAILS}')


asyncio.run(main())
