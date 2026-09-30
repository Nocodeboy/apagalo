# Floating texts never cover each other: a moment of play where several pop up at once (camping-5 at 14 s, where
# "Rescued!", "Hose connected" and "Blaze out!" used to pile up) plus 5 texts fired at the same spot, sampled over their
# whole life on a 390 px and a 320 px phone. Screenshots in shots/v2/floaters-*.png.
# Usage: PORT=8791 python3 tools/test_floaters.py   (serve dist/ first)
import asyncio
import json
import os
import sys

from playwright.async_api import async_playwright

sys.path.insert(0, os.path.dirname(__file__))
import shots_b as B  # noqa: E402  (URL, SAVE, ARGS, OUT)

RECTS = """(() => [...document.querySelectorAll('#floaters .fl')].filter((n) => +getComputedStyle(n).opacity > 0.05)
  .map((n) => { const r = n.getBoundingClientRect(); return { t: n.textContent, l: r.left, r: r.right, top: r.top, bot: r.bottom }; }))()"""
FAILS = []


def overlaps(rs):
    bad = []
    for i in range(len(rs)):
        for j in range(i + 1, len(rs)):
            a, b = rs[i], rs[j]
            w = min(a['r'], b['r']) - max(a['l'], b['l'])
            h = min(a['bot'], b['bot']) - max(a['top'], b['top'])
            if w > 1 and h > 1:
                bad.append((a['t'], b['t'], round(w), round(h)))
    return bad


async def run(b, w, h, lang, lid, secs):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=True, is_mobile=True, locale=lang)
    await ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ localStorage.setItem('apagalo.v1', {json.dumps(json.dumps(B.SAVE))}); sessionStorage.setItem('seeded', '1'); }}")
    page = await ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    await page.goto(B.URL)
    await page.wait_for_timeout(1200)
    await page.evaluate(f"__apagalo.level({json.dumps(lid)}, true)")
    await page.wait_for_timeout(300)
    tag = f'{lid}-w{w}{"" if lang == "en-US" else "-" + lang[:2]}'
    worst, seen = [], 0
    # 1) the real moment of play
    await page.evaluate(f"__apagalo.bot({secs})")
    for k in range(12):
        await page.wait_for_timeout(100)
        rs = await page.evaluate(RECTS)
        seen = max(seen, len(rs))
        worst += overlaps(rs)
        if k == 2:
            os.makedirs(B.OUT, exist_ok=True)
            await page.screenshot(path=os.path.join(B.OUT, f'floaters-{tag}-t{secs}.png'))
    # 2) five texts at the same spot at once (the player's), then two more a moment later
    await page.evaluate("(() => { const p = __apagalo.sim.player; ['Rescued!', 'Hose connected', 'Blaze out!', 'Combo x3', '+ Stopwatch'].forEach((t, i) => __apagalo.float(t, p.x, p.z, ['good', 'water', 'water', 'gold', 'gold'][i])); })()")
    for k in range(14):
        await page.wait_for_timeout(100)
        if k == 3:
            await page.evaluate("(() => { const p = __apagalo.sim.player; __apagalo.float('Hey, I\\'m soaked!', p.x + 0.3, p.z, 'bad'); __apagalo.float('Blaze out!', p.x - 0.3, p.z + 0.2, 'water'); })()")
        rs = await page.evaluate(RECTS)
        seen = max(seen, len(rs))
        worst += overlaps(rs)
        if k == 4:
            await page.screenshot(path=os.path.join(B.OUT, f'floaters-{tag}-burst.png'))
    offscreen = await page.evaluate(f"(() => [...document.querySelectorAll('#floaters .fl')].some((n) => {{ const r = n.getBoundingClientRect(); return r.left < 0 || r.right > {w}; }}))()")
    ok = not worst and not errs and not offscreen
    print(('  ok  ' if ok else '  FAIL') + f' {tag}: up to {seen} texts at once, overlaps {worst[:4]}, off screen {offscreen}, errors {errs[:2]}')
    if not ok:
        FAILS.append(tag)
    await ctx.close()


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=B.ARGS)
        await run(b, 390, 844, 'en-US', 'camping-5', 14)
        await run(b, 320, 640, 'es-ES', 'camping-5', 14)
        await run(b, 390, 844, 'en-US', 'ciudad-3', 20)
        await b.close()
    print('ALL OK' if not FAILS else f'{len(FAILS)} FAILED: {FAILS}')


asyncio.run(main())
