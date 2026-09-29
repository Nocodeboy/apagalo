# Promo video for X (vertical 1080x1920, 30 fps, 15 s) rendered frame by frame from the real game.
# The page's own loop is stopped (__apagalo.recStart) and every frame is advanced with a fixed dt, so
# the result is perfectly smooth even though headless WebGL renders at ~1 fps. Timers and CSS
# animations run on the same virtual clock.
#
# Usage: python3 tools/video.py [test|render|encode|all]
import asyncio, os, shutil, subprocess, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'http://127.0.0.1:8765/web/index.html'  # served: file:// blocks the self-hosted fonts
FR = f'{ROOT}/build/video/frames'
OUT = f'{ROOT}/build/video/apagalo-promo-x.mp4'
FPS = 30
W, H, DPR = 540, 960, 2
SIZE = (1080, 1920)
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']

SAVE = "localStorage.setItem('apagalo.v1', JSON.stringify({v:1,stars:{plaza:3,granja:3,gasolinera:3,poligono:3,castanar:3,sanjuan:3},best:{},daily:{},streak:{count:0,last:''},settings:{sfx:false,music:false,vibration:false,gfx:'high',autoTier:'high',lang:'es',stats:false},tutorialDone:true,firstOpen:false,seenTips:['plaza','granja','gasolinera','poligono','castanar','sanjuan']}))"

# Virtual clock for setTimeout + Web Animations (CSS animations/transitions), enabled by __vstart()
INIT = r'''(() => {
  const rs = window.setTimeout.bind(window), rc = window.clearTimeout.bind(window);
  const q = new Map(); let id = 1e7;
  window.__vt = null;
  window.setTimeout = (fn, ms = 0, ...a) => {
    if (window.__vt === null) return rs(fn, ms, ...a);
    const k = id++; q.set(k, { t: window.__vt + (+ms || 0) / 1000, fn, a }); return k;
  };
  window.clearTimeout = (k) => { if (q.has(k)) q.delete(k); else rc(k); };
  const born = new WeakMap();
  window.__vstart = () => { window.__vt = 0; };
  window.__vadvance = (dt) => {
    const t0 = window.__vt; window.__vt += dt;
    for (const [k, v] of [...q].sort((x, y) => x[1].t - y[1].t)) if (v.t <= window.__vt) { q.delete(k); try { if (typeof v.fn === 'function') v.fn(...v.a); } catch (e) {} }
    for (const an of document.getAnimations()) {
      if (!born.has(an)) { born.set(an, t0); an.pause(); }
      try { an.currentTime = (window.__vt - born.get(an)) * 1000; } catch (e) {}
    }
  };
})();'''

STYLE = '''<style id="vidstyle">
#toast,.tut,.stick,#screens,#touch{display:none!important}
#cap{position:fixed;left:0;right:0;top:24%;z-index:40;display:flex;justify-content:center;pointer-events:none}
#cap span{font-family:Bungee,Impact,sans-serif;font-size:40px;line-height:1.05;color:#fff;text-align:center;padding:0 18px;
 transform:rotate(-3deg);text-shadow:0 3px 0 #e23a2e,0 6px 0 #a8231b,0 10px 22px rgba(0,0,0,.55);white-space:pre-line}
#endcard{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
 background:radial-gradient(ellipse at 50% 42%,rgba(40,58,104,.72) 0%,rgba(13,21,40,.94) 70%);opacity:0}
#endcard h1{font-family:Bungee,Impact,sans-serif;font-weight:400;font-size:74px;line-height:1;margin:0;color:#fff;transform:rotate(-3deg);
 text-shadow:0 5px 0 #e23a2e,0 9px 0 #a8231b,0 16px 30px rgba(0,0,0,.5)}
#endcard h1 b{color:#ffb21f;font-weight:400}
#endcard .tape{width:330px;height:12px;margin-top:22px;transform:rotate(-3deg);border-radius:3px;
 background:linear-gradient(180deg,#cfd6df 0 25%,#f2e03a 25% 75%,#cfd6df 75% 100%)}
#endcard p{margin:34px 0 0;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:27px;color:#fff;text-align:center;line-height:1.2}
#endcard .url{margin-top:18px;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:30px;color:#162341;background:#ffb21f;
 padding:8px 22px 6px;border-radius:14px;box-shadow:0 6px 0 #c77f00}
#endcard small{margin-top:16px;font-family:"Baloo 2",sans-serif;font-weight:700;font-size:19px;color:#a9b6cf}
</style>
<div id="cap"><span></span></div>
<div id="endcard"><h1><b>¡</b>APÁGALO<b>!</b></h1><div class="tape"></div>
<p>Juega gratis<br>en el móvil o el PC</p><div class="url">apagalo.vercel.app</div><small>Sin descargas · 67 niveles + reto diario</small></div>'''

# page-side helpers: caption animation and end card, both driven by the video clock
HELPERS = r'''(() => {
  const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  window.__cap = (text, t, dur) => {
    const s = document.querySelector('#cap span');
    if (!text) { s.style.opacity = 0; return; }
    s.textContent = text;
    const inT = Math.min(1, t / 0.28), outT = Math.max(0, (t - (dur - 0.22)) / 0.22);
    const k = inT < 1 ? 1.9 - 0.9 * ease(inT) + Math.sin(inT * Math.PI) * 0.08 : 1 + 0.12 * outT;
    s.style.opacity = String(Math.min(inT * 2, 1) * (1 - outT));
    s.style.transform = `rotate(-3deg) scale(${k.toFixed(3)})`;
  };
  // advance n ticks of 1/30 s and wait for the GPU (otherwise SwiftShader work piles up behind screenshots)
  window.__step = (n) => {
    const a = window.__apagalo; a.recTick(1 / 30, n); window.__vadvance(n / 30);
    const gl = a.stage.renderer.getContext(); const px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return a.sim.state;
  };
  window.__end = (t) => {
    const c = document.getElementById('endcard');
    c.style.opacity = String(ease(t / 0.35));
    const h = c.querySelector('h1');
    const k = t < 0.45 ? 2.2 - 1.2 * ease(t / 0.45) : 1 + Math.sin((t - 0.45) * 3.2) * 0.018;
    h.style.transform = `rotate(-3deg) scale(${k.toFixed(3)})`;
    const rest = [...c.querySelectorAll('.tape,p,.url,small')];
    rest.forEach((n, i) => { const x = ease((t - 0.35 - i * 0.12) / 0.3); n.style.opacity = String(x); n.style.translate = `0 ${(1 - x) * 26}px`; });
  };
})()'''

# Each clip: level index, how to reach the moment, what to record.
#   pre: ('idle', s) lets the fire grow with nobody fighting it; ('bot', s) fast-forwards the PRO bot
#   roll: seconds of rendered pre-roll (not captured) so camera and particles settle
#   frames: list of (count, speed) segments; speed > 1 is a time-lapse
#   until_end: keep recording after the level ends for this many seconds (adaptive length)
CLIPS = [
    dict(name='granja', level=1, pre=[('idle', 13)], roll=1.4, frames=[(90, 1)], cap='¡EL PUEBLO\nARDE!', zoom=0.95),
    dict(name='castanar', level=4, pre=[('idle', 6), ('bot', 20)], roll=1.0, frames=[(88, 4)], cap='EL VIENTO\nLO EXTIENDE', zoom=1.25),
    dict(name='sanjuan', level=5, pre=[('bot', 7.6)], roll=1.0, frames=[(84, 1)], cap='¡LLUEVEN\nCOHETES!', zoom=1.05),
    # finale: the last pallet fire next to the hero, slow motion and ¡APAGADO!
    dict(name='poligono', level=3, pre=[('bot', 13.3)], roll=0.4, frames=[(210, 1)], until_end=1.4, cap=None, zoom=0.95),
]
END_FRAMES = 78
MOBILE = True

# CrazyGames preview videos: no sound, no text, no UI; the first frame matches the cover image.
CG_HIDE = '<style>#hud,#nozzles,#icons,#floaters,.banner,#minimap{display:none!important}</style>'
def cg_clips(zoom, cover_dz):
    return [
        dict(name='plaza-cover', level=0, pre=[('idle', 7), ('bot', 3.2)], roll=0.2, frames=[(105, 1)], cap=None, zoom=zoom, cover_dz=cover_dz),
        dict(name='granja', level=1, pre=[('idle', 13)], roll=1.4, frames=[(90, 1)], cap=None, zoom=zoom * 0.95),
        dict(name='castanar', level=4, pre=[('idle', 6), ('bot', 20)], roll=1.0, frames=[(90, 4)], cap=None, zoom=zoom * 1.2),
        dict(name='sanjuan', level=5, pre=[('bot', 7.6)], roll=1.0, frames=[(84, 1)], cap=None, zoom=zoom * 1.05),
        dict(name='poligono', level=3, pre=[('bot', 13.3)], roll=0.4, frames=[(210, 1)], until_end=1.3, cap=None, zoom=zoom * 0.95),
    ]

def use_profile(name):
    """x (default): 1080x1920 for X/TikTok. cg169 / cg23: CrazyGames previews 1920x1080 and 1080x1620."""
    global W, H, DPR, FR, OUT, CLIPS, END_FRAMES, STYLE, MOBILE, SIZE
    # portal previews are shown small: render at 1.5x and upscale (half the render time of 2x)
    if name == 'cg169':
        W, H, DPR, MOBILE, SIZE = 960, 540, 1.5, False, (1920, 1080)
        CLIPS, END_FRAMES = cg_clips(1.0, -1.0), 0
    elif name == 'cg23':
        W, H, DPR, SIZE = 540, 810, 1.5, (1080, 1620)
        CLIPS, END_FRAMES = cg_clips(0.8, -1.4), 0
    else:
        return
    FR = f'{ROOT}/build/video/frames-{name}'
    OUT = f'{ROOT}/build/video/apagalo-crazygames-{SIZE[0]}x{SIZE[1]}.mp4'
    STYLE = STYLE + CG_HIDE


async def open_level(b, level):
    ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=DPR, has_touch=MOBILE, is_mobile=MOBILE, locale='es-ES')
    await ctx.add_init_script(INIT)
    page = await ctx.new_page()
    page.on('pageerror', lambda e: print('PAGEERROR', e))
    await page.goto(URL); await page.wait_for_timeout(600)
    await page.evaluate(SAVE)
    await page.goto(URL); await page.wait_for_timeout(1400)
    await page.click('[data-a=levels]'); await page.wait_for_timeout(250)
    await page.click(f'.lvl[data-i="{level}"]'); await page.wait_for_timeout(250)
    await page.click('[data-a=go]'); await page.wait_for_timeout(400)
    await page.evaluate("(h)=>document.body.insertAdjacentHTML('beforeend', h)", STYLE)
    await page.evaluate(HELPERS)
    await page.evaluate("document.fonts.ready")
    return ctx, page


# same camera as tools/assets.py uses for the covers: midway between the hero and the nearest fire
COVER_FOCUS = '''(dz) => {
  const a = window.__apagalo, s = a.sim;
  let best = -1, bd = 1e9;
  for (let i = 0; i < s.N; i++) { if (s.fire[i] <= 0) continue; const x = (i % s.W) + .5, z = Math.floor(i / s.W) + .5; const d = Math.hypot(x - s.player.x, z - s.player.z); if (d > 2 && d < bd) { bd = d; best = i; } }
  if (best < 0) return;
  const x = (best % s.W) + .5, z = Math.floor(best / s.W) + .5;
  a.stage.focus = { x: x + (s.player.x - x) * 0.5, z: z + (s.player.z - z) * 0.5 + dz };
  a.stage.target.x = a.stage.focus.x; a.stage.target.z = a.stage.focus.z;
}'''


async def record_clip(b, clip, start, limit=None, out=None, tries=4):
    ctx, page = await open_level(b, clip['level'])
    for kind, s in clip['pre']:
        if kind == 'idle':
            await page.evaluate(f"window.__apagalo.advance({s}, {{}})")
        else:
            await page.evaluate(f"window.__apagalo.bot({s})")
    z = clip.get('zoom', 1.0)
    await page.evaluate(f"(()=>{{const a=window.__apagalo; a.recStart(); a.stage.zoom=a.stage.zoomTarget={z}; window.__vstart(); window.__cap('',0,1);}})()")
    if 'cover_dz' in clip:
        await page.evaluate(COVER_FOCUS, clip['cover_dz'])
    # pre-roll: rendered (every other tick) but not captured, so camera and particles settle
    for _ in range(int(clip['roll'] * FPS) // 2):
        await page.evaluate("window.__step(2)")
    # the bot has some randomness: if the level already ended before recording, retry starting earlier
    if clip.get('until_end') and tries > 0 and await page.evaluate("window.__apagalo.sim.state") != 'play':
        await ctx.close()
        pre = [(k, v - 1.2 if k == 'bot' else v) for k, v in clip['pre']]
        print(f"{clip['name']}: level already over, retrying with {pre}", flush=True)
        return await record_clip(b, {**clip, 'pre': pre}, start, limit, out, tries - 1)
    idx = start
    t = 0.0
    total = sum(c for c, _ in clip['frames'])
    dur = total / FPS
    ended_at = None
    done = False
    for count, speed in clip['frames']:
        for _ in range(count):
            if limit is not None and idx - start >= limit:
                done = True
                break
            cap = clip.get('cap') or ''
            st = await page.evaluate(
                "([n,cap,t,dur])=>{window.__cap(cap,t,dur); return window.__step(n);}",
                [speed, cap, t, dur])
            await page.screenshot(path=f'{out}/{idx:05d}.png')
            idx += 1
            t += 1 / FPS
            if st != 'play' and ended_at is None:
                ended_at = t
            if ended_at is not None and clip.get('until_end') and t - ended_at >= clip['until_end']:
                done = True
                break
        if done:
            break
    # end card can be drawn over the last clip's world
    if clip is CLIPS[-1] and limit is None:
        for i in range(END_FRAMES):
            # the world stays frozen behind the card (no WebGL work: ~4x faster per frame)
            await page.evaluate("([t])=>{window.__vadvance(1/30); window.__end(t);}", [i / FPS])
            await page.screenshot(path=f'{out}/{idx:05d}.png')
            idx += 1
    await ctx.close()
    print(f"{clip['name']}: frames {start}-{idx - 1} ({(idx - start) / FPS:.2f}s) ended_at={ended_at}", flush=True)
    return idx


async def render(limit=None, only=None):
    """Each clip renders into its own folder and is marked done, so an interrupted run resumes clip by clip."""
    if limit is not None:
        shutil.rmtree(FR, ignore_errors=True)
    os.makedirs(FR, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        for ci, clip in enumerate(CLIPS):
            if only and clip['name'] != only:
                continue
            out = f"{FR}/{ci:02d}-{clip['name']}"
            if os.path.exists(f'{out}/.done') and limit is None:
                print('skip (done)', out, flush=True)
                continue
            shutil.rmtree(out, ignore_errors=True)
            os.makedirs(out)
            await record_clip(b, clip, 0, limit, out)
            if limit is None:
                open(f'{out}/.done', 'w').write('ok')
                if os.environ.get('ONE_CLIP'):
                    break  # one clip per call keeps each run short (the cloud machine may restart)
        await b.close()


def gather():
    """Hard-links every clip's frames into one numbered sequence for ffmpeg."""
    seq = f'{FR}/_seq'
    shutil.rmtree(seq, ignore_errors=True)
    os.makedirs(seq)
    n = 0
    for d in sorted(x for x in os.listdir(FR) if x[:2].isdigit()):
        for f in sorted(x for x in os.listdir(f'{FR}/{d}') if x.endswith('.png')):
            os.link(f'{FR}/{d}/{f}', f'{seq}/{n:05d}.png')
            n += 1
    return seq, n


def encode(profile='x'):
    seq, n = gather()
    dur = n / FPS
    if profile != 'x':
        # CrazyGames: no audio and under their 10 MB upload limit -> two passes at a target bitrate (~8.8 MB)
        kbps = int(8.8e6 * 8 / dur / 1000)
        base = ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{seq}/%05d.png', '-vf', f'scale={SIZE[0]}:{SIZE[1]}:flags=lanczos,format=yuv420p',
                '-an', '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{kbps}k', '-profile:v', 'high']
        log = f'{ROOT}/build/video/x264-{profile}'
        subprocess.run(base + ['-pass', '1', '-passlogfile', log, '-f', 'mp4', os.devnull], check=True)
        subprocess.run(base + ['-pass', '2', '-passlogfile', log, '-movflags', '+faststart', OUT], check=True)
        print('video', OUT, f'{dur:.2f}s', f'{os.path.getsize(OUT) / 1e6:.1f} MB')
        return
    music = f'{ROOT}/assets/music-game.mp3'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{seq}/%05d.png', '-i', music,
           '-filter_complex', f'[0:v]scale=1080:1920:flags=lanczos,format=yuv420p[v];[1:a]atrim=0:{dur:.3f},afade=t=in:d=0.25,afade=t=out:st={dur - 1.2:.3f}:d=1.2,volume=0.9[a]',
           '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', f'{dur:.3f}', OUT]
    subprocess.run(cmd, check=True)
    print('video', OUT, f'{dur:.2f}s', f'{os.path.getsize(OUT) / 1e6:.1f} MB')


if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    prof = os.environ.get('PROFILE', 'x')
    use_profile(prof)
    if what == 'test':
        # 1 frame per clip for framing checks
        asyncio.run(render(limit=int(sys.argv[2]) if len(sys.argv) > 2 else 1, only=sys.argv[3] if len(sys.argv) > 3 else None))
    elif what == 'render':
        asyncio.run(render())
    elif what == 'encode':
        encode(prof)
    else:
        asyncio.run(render())
        encode(prof)
