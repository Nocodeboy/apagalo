# Coins, shop, upgrades, rewarded ads, interstitial caps and purchases with the test-double provider
# (?fakeads=1: every ad lasts ~1 s and rewards, every purchase succeeds; ?fakeads=pending: purchases wait for
# payment until the next launch). Web build, in Spanish and English.
# Usage: python3 tools/test_monetize.py [screenshots_dir]   (serve dist/ on :8765 first)
import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

BASE = 'http://127.0.0.1:8765/web/index.html'
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
OUT = sys.argv[1] if len(sys.argv) > 1 else 'shots/monetize'
KEY = 'apagalo.v1'
fails = []

# finish the running level: put every flame out (win) or run the clock down (time's up)
WIN = '(() => { const a = window.__apagalo, s = a.sim; s.fire.fill(0); s.heat.fill(0); s.embers.length = 0; a.advance(1.5); })()'
TIME_UP = '(() => { const a = window.__apagalo; a.sim.timeLeft = 0.05; a.advance(0.3); })()'
# the interstitial caps allow one now (>= 2 level ends since the last one, >= 120 s since any full-screen ad)
DUE = 'Object.assign(__apagalo.save.ads, { lastFullscreen: Date.now() - 121000, sinceInterstitial: 9 })'
STATE = """(() => { const a = window.__apagalo, s = a.save, r = a.sim && a.sim.result;
  return { mode: a.mode, coins: s.coins, up: s.upgrades, ads: s.ads, owned: s.owned, starter: s.starterOffered, tokens: s.iapTokens,
    fake: window.__fakeads || null, result: r ? { win: r.win, stars: r.stars, saved: r.saved, reason: r.reason } : null,
    toast: (document.querySelector('#toast') || {}).innerText || '' } })()"""


def check(cond, msg):
    print(('  ok  ' if cond else '  FAIL') + ' ' + msg, flush=True)
    if not cond:
        fails.append(msg)


def level_coins(r):
    return 50 + 50 * r['stars'] + 5 * round(r['saved'] * 10)


async def st(page):
    return await page.evaluate(STATE)


async def until(page, js, timeout=6000):
    """Waits for a JS condition (async ads and purchases); False if it never holds."""
    try:
        await page.wait_for_function(js, timeout=timeout)
        return True
    except Exception:
        return False


async def shot(page, name):
    os.makedirs(OUT, exist_ok=True)
    await page.wait_for_timeout(600)  # let the screen animations finish
    await page.screenshot(path=os.path.join(OUT, name))


async def end_screen(page):
    await page.wait_for_selector('.end-screen', timeout=10000)


async def leave_end(page, action):
    """Next / Retry / Menu from the end screen; returns how many interstitials were shown meanwhile."""
    before = len((await st(page))['fake']['interstitial'])
    await page.click(f'.end-screen [data-a={action}]')
    await page.wait_for_timeout(1500)
    return len((await st(page))['fake']['interstitial']) - before


async def go_and_win(page):
    await page.click('[data-a=go]')
    await page.wait_for_timeout(300)
    await page.evaluate(WIN)
    await end_screen(page)


async def pick_level(page, i):
    """From the title: Levels -> level i (0-based) -> its intro screen."""
    await page.click('.title-screen [data-a=levels]')
    await page.click(f'.lvl[data-i="{i}"]')
    await page.wait_for_selector('[data-a=go]')


async def intro_to_title(page):
    await page.wait_for_selector('[data-a=go]')
    await page.click('#screens > .screen:last-child [data-a=back]')  # intro -> levels
    await page.wait_for_selector('.lvl')
    await page.click('#screens > .screen:last-child [data-a=back]')  # levels -> title
    try:
        await page.wait_for_selector('.title-screen', timeout=8000)
    except Exception:
        await shot(page, 'debug-intro-to-title.png')
        print('screens:', await page.evaluate("[...document.querySelectorAll('#screens > *')].map(n => n.className + ' | ' + n.innerText.slice(0, 80))"), 'mode:', (await st(page))['mode'])
        raise


async def time_up_and_decline(page):
    await page.evaluate(TIME_UP)
    await page.wait_for_selector('[data-a=decline]', timeout=5000)
    await page.click('[data-a=decline]')
    await end_screen(page)


async def new_page(b, lang, query='?fakeads=1', viewport=(360, 640), init=None):
    ctx = await b.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, has_touch=True, is_mobile=True, locale='es-ES' if lang == 'es' else 'en-US')
    if init:
        await ctx.add_init_script(init)
    page = await ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    await page.goto(BASE + query)
    await page.wait_for_timeout(1500)
    return ctx, page, errs


async def main_flow(b, lang):
    print(f'[{lang}] first session: level end, coins, x2, shop, upgrades, free coins, store, continue')
    ctx, page, errs = await new_page(b, lang)
    await shot(page, f'{lang}-01-title.png')
    check((await page.inner_text('.title-screen .wallet')).strip().startswith('0'), 'title wallet shows 0 coins')
    # level 1 (first game goes straight in), win it
    await page.click('[data-a=play]')
    await page.wait_for_timeout(400)
    await page.evaluate(WIN)
    await end_screen(page)
    check((await page.inner_text('#end-coins')) == '+0', 'coins start at +0 before the count-up')
    await page.wait_for_timeout(2600)
    s = await st(page)
    n = level_coins(s['result'])
    check(s['result']['win'] and s['coins'] == n, f'win pays {n} coins ({s["result"]["stars"]} stars, {round(s["result"]["saved"] * 100)}% saved), balance {s["coins"]}')
    check((await page.inner_text('#end-coins')).replace(',', '').replace('.', '') == f'+{n}', f'count-up ends at +{n}')
    await shot(page, f'{lang}-02-end.png')
    label = await page.inner_text('[data-a=double]')
    check(('Anuncio' if lang == 'es' else 'Ad') in label and 'x2' in label, f'x2 button says it is an ad ("{label}")')
    # rewarded x2
    await page.click('[data-a=double]')
    await page.wait_for_timeout(1900)
    s = await st(page)
    check(s['coins'] == 2 * n and s['fake']['rewarded'] == ['double_coins'], f'x2 doubles the reward: balance {s["coins"]}')
    check(not await page.query_selector('[data-a=double]'), 'x2 only once')
    # shop from the end screen
    await page.click('.end-screen [data-a=shop]')
    await page.wait_for_selector('.shop-screen')
    await shot(page, f'{lang}-03-shop.png')
    check(len(await page.query_selector_all('[data-p]')) == 5, 'store lists the 5 products')
    coins = s['coins']
    await page.click('[data-up=hose]')
    s = await st(page)
    check(s['up']['hose'] == 1 and s['coins'] == coins - 200, 'hose upgrade level 1 costs 200')
    if s['coins'] < 500:
        await page.click('[data-up=hose]')
        s2 = await st(page)
        check(s2['up']['hose'] == 1, 'cannot buy what you cannot afford')
    label = await page.inner_text('[data-a=free]')
    check(('Anuncio' if lang == 'es' else 'Ad') in label and ('Ver' if lang == 'es' else 'Watch') in label, f'free coins button says it is an ad ("{label.strip()}")')
    for _ in range(3):
        await page.click('[data-a=free]')
        await page.wait_for_timeout(1500)
    s2 = await st(page)
    check(s2['coins'] == s['coins'] + 450 and s2['ads']['freeClaims'] == 3, 'free coins: 3 x 150 per day')
    check(not await page.query_selector('[data-a=free]'), 'no 4th free claim today')
    # the phone's date changes: the per-day counter resets, the 24 h guard does not
    await page.evaluate("__apagalo.save.ads.freeDay = '2000-01-01'")
    await page.click('.shop-screen [data-a=back]')
    await end_screen(page)
    await page.click('.end-screen [data-a=shop]')
    await page.wait_for_selector('.shop-screen')
    check(not await page.query_selector('[data-a=free]'), 'date changed: still no more than 3 free claims in 24 h')
    await page.click('[data-p=coins_s]')
    await until(page, f"__apagalo.save.coins === {s2['coins'] + 1000}")
    await page.wait_for_timeout(300)
    s3 = await st(page)
    check(s3['coins'] == s2['coins'] + 1000, 'coin pack S adds 1000')
    unfinished = await page.evaluate("JSON.parse(localStorage.getItem('apagalo.fakeiap.unfinished') || '[]').length")
    check(len(s3['tokens']) == 1 and s3['fake']['finished'] == ['coins_s'] and unfinished == 0, 'granted and saved, then consumed (token remembered)')
    await page.click('[data-up=power]')
    await page.click('[data-up=speed]')
    await page.click('[data-up=time]')
    await page.evaluate("document.querySelector('.shop').scrollTop = 1e4")
    await page.wait_for_timeout(300)
    await shot(page, f'{lang}-04-shop-bottom.png')
    await page.click('.shop-screen [data-a=back]')
    await end_screen(page)
    s = await st(page)
    bal = (await page.inner_text('#end-balance')).replace(',', '').replace('.', '')
    check(bal == str(s['coins']), f'back on the end screen with the new balance {bal}')
    # next level: no interstitial in the first session
    check(await leave_end(page, 'next') == 0, 'no interstitial in the first session')
    await page.wait_for_selector('[data-a=go]')
    sim = await page.evaluate('({ hose: __apagalo.sim.hoseLen, def: __apagalo.sim.def.hose, time: __apagalo.sim.timeLeft, deft: __apagalo.sim.def.time, p: __apagalo.sim.powerMul, sp: __apagalo.sim.speedMul })')
    check(sim['hose'] == sim['def'] + 1 and sim['time'] == sim['deft'] + 5 and sim['p'] > 1 and sim['sp'] > 1, f'levels use the upgrades {sim}')
    await page.click('[data-a=go]')
    await page.wait_for_timeout(300)
    # time's up: rewarded +30 s once per attempt
    await page.evaluate(TIME_UP)
    await page.wait_for_selector('[data-a=continue]', timeout=5000)
    await shot(page, f'{lang}-05-continue.png')
    label = await page.inner_text('[data-a=continue]')
    check(('(anuncio)' if lang == 'es' else '(ad)') in label, f'+30 s button says it is an ad ("{label}")')
    await page.click('[data-a=continue]')
    await page.wait_for_timeout(1600)
    s = await st(page)
    t_left = await page.evaluate('__apagalo.sim.timeLeft')
    check(s['mode'] == 'play' and 28 < t_left <= 30, f'+30 s continue resumes play ({t_left:.1f} s left)')
    await page.evaluate(TIME_UP)
    await page.wait_for_timeout(300)
    check(not await page.query_selector('[data-a=continue]'), 'the continue is offered once per attempt')
    await end_screen(page)
    check(await leave_end(page, 'retry') == 0, 'retry: still no interstitial in the first session')
    await time_up_and_decline(page)
    s = await st(page)
    check(s['ads']['levelEnds'] == 3 and not s['result']['win'], f'declined continue ends the level (level ends {s["ads"]["levelEnds"]})')
    await leave_end(page, 'menu')
    check(not errs, f'no errors {errs}')

    print(f'[{lang}] second session: interstitial only on Next with its caps, starter pack, no ads, daily without upgrades')
    await page.goto(BASE + '?fakeads=1')
    await page.wait_for_timeout(1500)
    await page.click('[data-a=play]')  # continue: level 2
    await page.wait_for_selector('[data-a=go]')
    await page.click('[data-a=go]')
    await page.wait_for_timeout(300)
    await time_up_and_decline(page)  # end 4
    await page.evaluate(DUE)
    check(await leave_end(page, 'retry') == 0, 'Retry never shows an interstitial (it starts the level right away)')
    await time_up_and_decline(page)  # end 5
    await page.evaluate(DUE)
    check(await leave_end(page, 'menu') == 0, 'Menu never shows an interstitial')
    # second completed level: one-time starter pack offer
    await page.click('[data-a=play]')
    await page.wait_for_selector('[data-a=go]')
    await go_and_win(page)
    await page.wait_for_selector('.offer', timeout=8000)
    await shot(page, f'{lang}-06-starter.png')
    coins = (await st(page))['coins']
    await page.click('.offer [data-a=buy]')
    await until(page, '__apagalo.save.owned.starter_pack')
    s = await st(page)
    check(s['owned']['starter_pack'] and s['coins'] == coins + 3000 and s['starter'], 'starter pack: +3000 coins, owned, offered once')
    await page.evaluate(DUE)
    check(await leave_end(page, 'next') == 0, 'no interstitial after an offer on the same end screen')
    # level 3: Next with the caps met
    await go_and_win(page)
    await page.evaluate(DUE)
    check(await leave_end(page, 'next') == 1, 'Next: interstitial after >=3 level ends, >=2 since the last one, >=120 s since any full-screen ad')
    await page.wait_for_selector('[data-a=go]')
    check((await st(page))['mode'] == 'intro', 'after the interstitial comes the level intro, not gameplay')
    await go_and_win(page)  # level 4
    await page.evaluate('__apagalo.save.ads.lastFullscreen = Date.now() - 121000')
    check(await leave_end(page, 'next') == 0, 'no interstitial 1 level end after the last one')
    await page.click('[data-a=go]')  # level 5: lose, retry, win
    await page.wait_for_timeout(300)
    await time_up_and_decline(page)
    check(await leave_end(page, 'retry') == 0, 'Retry: no interstitial')
    await page.wait_for_timeout(300)
    await page.evaluate(WIN)
    await end_screen(page)
    await page.evaluate("Object.assign(__apagalo.save.ads, { lastFullscreen: Date.now() - 60000, sinceInterstitial: 9 })")
    check(await leave_end(page, 'next') == 0, 'no interstitial within 120 s of the last one')
    await intro_to_title(page)
    # a rewarded ad watched in the shop opened from the end screen counts as the last full-screen ad
    await pick_level(page, 2)
    await go_and_win(page)
    await page.evaluate(DUE + "; Object.assign(__apagalo.save.ads, { freeTimes: [], freeClaims: 0 })")
    await page.click('.end-screen [data-a=shop]')
    await page.wait_for_selector('.shop-screen [data-a=free]')
    await page.click('[data-a=free]')
    await page.wait_for_timeout(1500)
    await page.click('.shop-screen [data-a=back]')
    await end_screen(page)
    check(await leave_end(page, 'next') == 0, 'no interstitial right after a rewarded ad (free coins in the shop)')
    # the phone's clock went back (the last ad looks like it is in the future): due again, not blocked
    await go_and_win(page)  # level 4
    await page.evaluate("Object.assign(__apagalo.save.ads, { lastFullscreen: Date.now() + 3600000, sinceInterstitial: 9 })")
    check(await leave_end(page, 'next') == 1, 'clock set back: the interstitial is due again')
    # the +30 s ad counts as the ad of that transition
    await page.click('[data-a=go]')  # level 5
    await page.wait_for_timeout(300)
    await page.evaluate(TIME_UP)
    await page.wait_for_selector('[data-a=continue]', timeout=5000)
    await page.click('[data-a=continue]')
    await page.wait_for_timeout(1600)
    await page.evaluate(WIN)
    await end_screen(page)
    await page.evaluate(DUE)
    check(await leave_end(page, 'next') == 0, 'no interstitial right after a +30 s ad in the same attempt')
    await intro_to_title(page)
    # remove ads
    await page.click('.title-screen [data-a=shop]')
    await page.wait_for_selector('.shop-screen')
    check(not await page.query_selector('[data-p=starter_pack]'), 'owned starter pack is hidden in the store')
    coins = (await st(page))['coins']
    await page.click('[data-p=remove_ads]')
    await until(page, '__apagalo.save.owned.remove_ads')
    s = await st(page)
    check(s['owned']['remove_ads'] and s['coins'] == coins + 500, 'remove ads: owned and +500 coins')
    await page.click('.shop-screen [data-a=back]')
    await pick_level(page, 2)
    await go_and_win(page)
    await page.evaluate(DUE)
    check(await leave_end(page, 'next') == 0, 'no interstitials with remove ads')
    await intro_to_title(page)
    # daily: no upgrades, no continue, daily reward
    await page.click('[data-a=daily]')
    await page.wait_for_selector('[data-a=go]')
    await shot(page, f'{lang}-07-daily.png')
    d = await page.evaluate("({ hose: __apagalo.sim.hoseLen, def: __apagalo.sim.def.hose, time: __apagalo.sim.timeLeft, deft: __apagalo.sim.def.time, p: __apagalo.sim.powerMul, r: __apagalo.sim.reachMul, sp: __apagalo.sim.speedMul, note: !!document.querySelector('.note') })")
    check(d['hose'] in (d['def'], d['def'] - 3) and d['time'] == d['deft'] and d['p'] == 1 and d['r'] == 1 and d['sp'] == 1 and d['note'], f'daily ignores upgrades and says so {d}')
    coins = (await st(page))['coins']
    await page.click('[data-a=go]')
    await page.wait_for_timeout(300)
    await page.evaluate(TIME_UP)
    await page.wait_for_timeout(400)
    check(not await page.query_selector('[data-a=continue]'), 'no +30 s in the daily')
    await end_screen(page)
    s = await st(page)
    check(s['coins'] == coins + 100, 'daily lost: 100 coins')
    # reset progress: says what is lost and what is kept, on the first tap
    await page.click('.end-screen [data-a=menu]')
    await page.click('.title-screen [data-a=settings]')
    await page.click('[data-a=reset]')
    warn = await page.inner_text('.reset-warn')
    words = ['monedas', 'mejoras', 'Sin anuncios'] if lang == 'es' else ['coins', 'upgrades', 'No ads']
    check(all(w in warn for w in words) and (await st(page))['coins'] > 0, f'reset asks again, saying coins and upgrades go and "No ads" stays ("{warn}")')
    await shot(page, f'{lang}-08-reset.png')
    tokens = (await st(page))['tokens']
    await page.click('[data-a=reset]')
    await page.wait_for_selector('.title-screen')
    s = await st(page)
    check(s['coins'] == 0 and s['up']['hose'] == 0 and s['owned']['remove_ads'] and s['tokens'] == tokens, 'reset: coins and upgrades gone, "No ads" and the purchase record kept')
    check(not errs, f'no errors {errs}')
    await ctx.close()


async def other_modes(b):
    print('[en] ?fakeads=fail: failed ads and purchases never block the game')
    ctx, page, errs = await new_page(b, 'en', '?fakeads=fail')
    await page.click('[data-a=play]')
    await page.wait_for_timeout(400)
    await page.evaluate(TIME_UP)
    await page.wait_for_selector('[data-a=continue]')
    await page.click('[data-a=continue]')
    await end_screen(page)
    s = await st(page)
    check(s['mode'] == 'end' and not s['result']['win'], 'failed continue goes to the end screen')
    await page.wait_for_timeout(2600)
    await page.click('[data-a=double]')
    await page.wait_for_timeout(1600)
    s2 = await st(page)
    check(s2['coins'] == s['coins'] and await page.is_enabled('[data-a=double]'), 'failed x2: no reward, button usable again')
    await page.click('.end-screen [data-a=shop]')
    await page.wait_for_selector('.shop-screen')
    await page.click('[data-p=coins_s]')
    await until(page, "document.querySelector('#toast').innerText.toLowerCase().includes('purchase')")
    s3 = await st(page)
    check(s3['coins'] == s['coins'] and 'purchase' in s3['toast'].lower(), f'failed purchase: no coins, message "{s3["toast"]}"')
    await shot(page, 'en-08-fail.png')
    check(not errs, f'no errors {errs}')
    await ctx.close()

    print('[es] web without ads (no parameter): no rewarded buttons, no store')
    ctx, page, errs = await new_page(b, 'es', '')
    await page.click('[data-a=play]')
    await page.wait_for_timeout(400)
    await page.evaluate(TIME_UP)
    await end_screen(page)
    check(not await page.query_selector('[data-a=double]'), 'no x2 without ads, time out goes straight to the end')
    await page.click('.end-screen [data-a=shop]')
    check(not await page.query_selector('[data-a=free]') and not await page.query_selector('[data-p]'), 'shop without free coins nor store')
    await shot(page, 'es-09-noads-shop.png')
    check(not errs, f'no errors {errs}')
    await ctx.close()

    print('[es] save from 1.2.0 (no coins yet) loads fine')
    old = {'v': 1, 'stars': {'plaza': 3}, 'best': {'plaza': 1200}, 'daily': {}, 'streak': {'count': 0, 'last': ''},
           'settings': {'sfx': False, 'music': False, 'vibration': True, 'gfx': 'auto', 'autoTier': None, 'lang': 'es', 'stats': True},
           'tutorialDone': True, 'firstOpen': False, 'seenTips': []}
    init = f"if (!sessionStorage.getItem('seeded')) {{ localStorage.setItem({json.dumps(KEY)}, {json.dumps(json.dumps(old))}); sessionStorage.setItem('seeded', '1'); }}"
    ctx, page, errs = await new_page(b, 'es', '?fakeads=1', init=init)
    s = await st(page)
    check(s['coins'] == 0 and s['up'] == {'hose': 0, 'power': 0, 'speed': 0, 'time': 0} and s['owned'] == {'remove_ads': False, 'starter_pack': False}, 'old save gets coins 0, upgrades 0 and nothing owned')
    stars = await page.inner_text('.starcount')
    check('3/18' in stars, f'old progress kept ({stars.strip()})')
    check(not errs, f'no errors {errs}')
    await ctx.close()

    print('[en] purchase paid but not delivered (app closed before delivery): delivered once at launch')
    init = "if (!sessionStorage.getItem('seeded')) { localStorage.setItem('apagalo.fakeiap.unfinished', JSON.stringify([{ id: 'coins_m', token: 'tok-recover-1' }])); sessionStorage.setItem('seeded', '1'); }"
    ctx, page, errs = await new_page(b, 'en', '?fakeads=1', init=init)
    await until(page, '__apagalo.save.coins === 6000')
    s = await st(page)
    toast = await page.inner_text('#toast')
    check(s['coins'] == 6000 and s['tokens'] == ['tok-recover-1'] and 'delivered' in toast.lower(), f'coins_m delivered at launch: {s["coins"]} coins, "{toast.strip()}"')
    await shot(page, 'en-10-delivered.png')
    # the store still lists it (the consume did not go through): never granted twice
    await page.evaluate("localStorage.setItem('apagalo.fakeiap.unfinished', JSON.stringify([{ id: 'coins_m', token: 'tok-recover-1' }]))")
    await page.reload()
    await page.wait_for_timeout(1500)
    s = await st(page)
    left = await page.evaluate("JSON.parse(localStorage.getItem('apagalo.fakeiap.unfinished') || '[]').length")
    check(s['coins'] == 6000 and left == 0, f'listed again after a failed consume: not granted twice ({s["coins"]}), consumed now')
    check(not errs, f'no errors {errs}')
    await ctx.close()

    print('[es] slow payment (pending): says so, and delivers it once the payment clears')
    ctx, page, errs = await new_page(b, 'es', '?fakeads=pending')
    await page.click('.title-screen [data-a=shop]')
    await page.click('[data-p=coins_s]')
    await until(page, "document.querySelector('#toast').innerText.toLowerCase().includes('pendiente')")
    s = await st(page)
    toast = await page.inner_text('#toast')
    check(s['coins'] == 0 and 'pendiente' in toast.lower(), f'pending purchase: no coins yet, "{toast.strip()}"')
    await shot(page, 'es-11-pending.png')
    await page.goto(BASE + '?fakeads=1')  # next launch: the payment went through
    await until(page, '__apagalo.save.coins === 1000')
    s = await st(page)
    toast = await page.inner_text('#toast')
    check(s['coins'] == 1000 and 'recibida' in toast.lower(), f'delivered on the next launch: {s["coins"]} coins, "{toast.strip()}"')
    check(not errs, f'no errors {errs}')
    await ctx.close()

    print('[en] daily reward: at most 3 in 24 h, whatever the date says')
    old = {'v': 1, 'stars': {'plaza': 1}, 'best': {}, 'daily': {}, 'streak': {'count': 0, 'last': ''},
           'settings': {'sfx': False, 'music': False, 'vibration': True, 'gfx': 'auto', 'autoTier': None, 'lang': 'en', 'stats': True},
           'tutorialDone': True, 'firstOpen': False, 'seenTips': [], 'coins': 0}
    init = (f"if (!sessionStorage.getItem('seeded')) {{ const s = {json.dumps(old)}; const n = Date.now(); s.dailyTimes = [n - 3e6, n - 2e6, n - 1e6];"
            f" localStorage.setItem({json.dumps(KEY)}, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }}")
    ctx, page, errs = await new_page(b, 'en', '?fakeads=1', init=init)
    await page.click('[data-a=daily]')
    await page.wait_for_selector('[data-a=go]')
    await go_and_win(page)
    await page.wait_for_timeout(2600)
    s = await st(page)
    n = level_coins(s['result'])
    times = await page.evaluate('__apagalo.save.dailyTimes.length')
    check(s['result']['win'] and s['coins'] == n and times == 3, f'3 daily rewards in the last 24 h: this one pays like a replay ({s["coins"]} = {n}, not {150 + 50 * s["result"]["stars"]})')
    check(not errs, f'no errors {errs}')
    await ctx.close()

    print('[en] restore purchases: the store account owns "remove ads"')
    init = "localStorage.setItem('apagalo.fakeiap', JSON.stringify(['remove_ads']))"
    ctx, page, errs = await new_page(b, 'en', '?fakeads=1', init=init)
    s = await st(page)
    check(s['owned']['remove_ads'] and s['coins'] == 500, 'owned non-consumables are restored at start (once)')
    await page.click('.title-screen [data-a=shop]')
    await page.click('[data-a=restore]')
    await until(page, "document.querySelector('#toast').innerText.toLowerCase().includes('nothing')")
    s = await st(page)
    check(s['coins'] == 500 and 'nothing' in s['toast'].lower(), 'restoring again grants nothing twice')
    check(not errs, f'no errors {errs}')
    await ctx.close()


async def layouts(b):
    print('layouts: end screen, shop, +30 s offer and reset confirmation on a 320 px phone and at 640x360')
    for lang in ['es', 'en']:
        for vw in [(320, 568), (640, 360)]:
            ctx, page, _ = await new_page(b, lang, '?fakeads=1', viewport=vw)
            await page.click('[data-a=play]')
            await page.wait_for_timeout(400)
            await page.evaluate(WIN)
            await end_screen(page)
            await page.wait_for_timeout(2800)
            await shot(page, f'{lang}-end-{vw[0]}x{vw[1]}.png')
            over = await page.evaluate("[...document.querySelectorAll('.end-screen .panel *')].filter(e => e.getBoundingClientRect().right > innerWidth).length")
            await page.click('.end-screen [data-a=shop]')
            await page.wait_for_selector('.shop-screen')
            await shot(page, f'{lang}-shop-{vw[0]}x{vw[1]}.png')
            over += await page.evaluate("[...document.querySelectorAll('.shop *')].filter(e => e.getBoundingClientRect().right > innerWidth).length")
            # +30 s offer and the reset confirmation
            await page.click('.shop-screen [data-a=back]')
            await end_screen(page)
            await page.click('.end-screen [data-a=retry]')
            await page.wait_for_timeout(400)
            await page.evaluate(TIME_UP)
            await page.wait_for_selector('[data-a=continue]', timeout=5000)
            await page.wait_for_timeout(400)
            await shot(page, f'{lang}-continue-{vw[0]}x{vw[1]}.png')
            over += await page.evaluate("[...document.querySelectorAll('.screen:last-child .panel *')].filter(e => e.getBoundingClientRect().right > innerWidth).length")
            btn = await page.evaluate("(() => { const b = document.querySelector('[data-a=continue]'); return b.scrollWidth <= b.clientWidth + 1 })()")
            await page.click('[data-a=decline]')
            await end_screen(page)
            await page.click('.end-screen [data-a=menu]')
            await page.click('.title-screen [data-a=settings]')
            await page.click('[data-a=reset]')
            await shot(page, f'{lang}-reset-{vw[0]}x{vw[1]}.png')
            over += await page.evaluate("[...document.querySelectorAll('.screen:last-child .panel *')].filter(e => e.getBoundingClientRect().right > innerWidth).length")
            check(over == 0 and btn, f'{lang} {vw[0]}x{vw[1]}: nothing wider than the screen (end, shop, +30 s, reset)')
            await ctx.close()


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        for lang in ['es', 'en']:
            await main_flow(b, lang)
        await other_modes(b)
        await layouts(b)
        await b.close()
    print('\n' + ('ALL OK' if not fails else f'{len(fails)} FAILED: {fails}'))
    sys.exit(1 if fails else 0)


asyncio.run(main())
