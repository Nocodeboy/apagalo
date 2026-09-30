# Composes more music loops for Put It Out! from code (no samples, no licences) and writes them as MP3 in assets/:
#   music-folk.mp3     folk reel with fiddle, banjo and accordion: the farm, the chestnut forest and the campground
#   music-funk.mp3     city funk with slap bass and horns: the docks, downtown and the rail yard
#   music-rock.mp3     driving rock: the gas station and the industrial park
#   music-night.mp3    night groove: the beach on San Juan night and the museum
#   music-snow.mp3     sleigh bells and glockenspiel: the ski lodge
#   music-bigfire.mp3  drums, strings and brass: every big fire (each tenth level) and the finale
# The menu and the village square keep music-menu.mp3 and music-game.mp3. Instruments and mixing come from
# Tray Runner's generator (marchando/tools/music.py). Every loop is seamless.
# Usage: pip install numpy lameenc && python3 tools/music.py [name ...]   (no names: all of them)
# The random touches depend on which tracks are made in the same run: the shipped files are `music.py` (all) for folk,
# funk, night and snow, and `music.py rock bigfire` for those two.
# The files carry the level they play at in the game (PLAY_LEVEL): iPhones ignore the volume set from code, so a
# loud file would drown the sound effects there. The game plays them at full volume.
import os
import numpy as np
import lameenc

SR = 44100
# in-game music level (was the <audio> volume, 0.32, until 2.2)
PLAY_LEVEL = 0.32
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(7)

NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def midi(name, octave):
    return NOTE[name] + 12 * (octave + 1)


class Track:
    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)

    def add(self, t, sig, pan=0.0, gain=1.0):
        """Mix a mono signal at time t (s); anything past the end wraps to the start (seamless loop)."""
        i = int(t * SR) % self.n
        l = gain * (1 - pan) * 0.5 ** 0.5 * 1.41
        r = gain * (1 + pan) * 0.5 ** 0.5 * 1.41
        pos = 0
        while pos < len(sig):
            k = min(len(sig) - pos, self.n - i)
            self.L[i:i + k] += sig[pos:pos + k] * l / 2
            self.R[i:i + k] += sig[pos:pos + k] * r / 2
            pos += k
            i = 0


def env(n, a=0.005, d=0.3, s=0.0, r=0.05, hold=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    dec = s + (1 - s) * np.exp(-(t - a).clip(0) / max(d, 1e-4))
    e = np.where(t < a, e, dec)
    if hold is not None:
        rel = ((t - hold) / r).clip(0, 1)
        e = e * (1 - rel)
    return e


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def piano(m, dur, vel=1.0, bright=1.0):
    n = int((dur + 0.6) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    sig = np.zeros(n)
    for h, amp in [(1, 1), (2, 0.5 * bright), (3, 0.25 * bright), (4, 0.12 * bright), (5, 0.06 * bright)]:
        sig += amp * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h)) * np.exp(-t * (1.2 + h * 0.9))
    return sig * env(n, 0.003, 0.9, 0.0, 0.08, hold=dur) * vel * 0.35


def epiano(m, dur, vel=1.0):
    """Rhodes-ish: sine with a soft FM bell on the attack."""
    n = int((dur + 0.8) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    mod = np.sin(2 * np.pi * f * 7 * t) * 1.2 * np.exp(-t * 9)
    sig = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    return sig * trem * env(n, 0.004, 1.6, 0.25, 0.25, hold=dur) * vel * 0.28


def bass(m, dur, vel=1.0):
    n = int((dur + 0.15) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    ph = (f * t) % 1
    tri = 4 * np.abs(ph - 0.5) - 1
    sig = 0.8 * np.sin(2 * np.pi * f * t) + 0.35 * tri + 0.15 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6)
    return sig * env(n, 0.006, 0.45, 0.35, 0.06, hold=dur) * vel * 0.55


def sax(m, dur, vel=1.0):
    n = int((dur + 0.12) * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.25)
    phase = np.cumsum(hz(m) * vib) / SR
    saw = 2 * (phase % 1) - 1
    sq = np.sign(np.sin(2 * np.pi * phase)) * 0.3
    sig = lowpass(saw * 0.7 + sq, 2200 + 900 * vel)
    breath = rng.standard_normal(n) * 0.04 * np.exp(-t * 20)
    return (sig + breath) * env(n, 0.03, 0.4, 0.75, 0.08, hold=dur) * vel * 0.22


def kick(vel=1.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 80 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * vel * 0.9


def snare(vel=1.0, brush=False):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 1500)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    dec = 12 if brush else 22
    return (noise * np.exp(-t * dec) * (0.35 if brush else 0.6) + tone * 0.4) * vel * 0.5


def hat(vel=1.0, open_=False):
    n = int((0.18 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 7000)
    return noise * np.exp(-t * (18 if open_ else 70)) * vel * 0.22


def shaker(vel=1.0):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 5000)
    return noise * np.sin(np.pi * np.minimum(1, t / 0.09)) * vel * 0.12


def rim(vel=1.0):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1700 * t) + 0.5 * np.sin(2 * np.pi * 820 * t)) * np.exp(-t * 90) * vel * 0.18


CHORD = {  # intervals over the root
    '7': [0, 4, 7, 10],
    '6': [0, 4, 7, 9],
    'maj7': [0, 4, 7, 11],
    'm7': [0, 3, 7, 10],
    'm9': [0, 3, 7, 10, 14],
    '9': [0, 4, 7, 10, 14],
    '69': [0, 4, 7, 9, 14],
}


def chord_notes(root, kind, octave=4):
    r = midi(root, octave)
    return [r + i for i in CHORD[kind]]


def master(track, name, kbps=112, gain=1.0):
    """gain: < 1 for dense tracks, so every loop is about -14.5 LUFS before PLAY_LEVEL (about -24.4 after it)."""
    L, R = track.L, track.R
    # gentle glue: soft clip, then normalise to -1 dBFS
    L = np.tanh(L * 1.3) / np.tanh(1.3)
    R = np.tanh(R * 1.3) / np.tanh(1.3)
    peak = max(np.abs(L).max(), np.abs(R).max()) or 1
    g = 0.89 / peak * gain * PLAY_LEVEL
    pcm = np.empty(len(L) * 2, dtype=np.int16)
    pcm[0::2] = (L * g * 32767).astype(np.int16)
    pcm[1::2] = (R * g * 32767).astype(np.int16)
    enc = lameenc.Encoder()
    enc.set_bit_rate(kbps)
    enc.set_in_sample_rate(SR)
    enc.set_channels(2)
    enc.set_quality(2)
    data = enc.encode(pcm.tobytes()) + enc.flush()
    path = f'{ROOT}/assets/{name}'
    with open(path, 'wb') as f:
        f.write(data)
    print(name, f'{len(L) / SR:.1f}s', f'{len(data) // 1024} KB')


# ---------------- more instruments for the city tracks ----------------
def pluck(m, dur, vel=1.0, bright=0.5, decay=0.996, drive=0.0):
    """Karplus-Strong string: nylon guitar (soft), banjo (bright, short), electric (with drive)."""
    f = hz(m)
    N = max(2, int(SR / f))
    n = int((dur + 0.5) * SR)
    y = np.zeros(n + N + 1)
    burst = rng.uniform(-1, 1, N)
    burst = lowpass(burst, 1500 + 9000 * bright)
    y[:N] = burst
    k = N + 1
    while k < len(y):
        e = min(k + N, len(y))
        y[k:e] = decay * 0.5 * (y[k - N:e - N] + y[k - N - 1:e - N - 1])
        k = e
    sig = y[N + 1:N + 1 + n] if len(y) >= N + 1 + n else np.pad(y[N + 1:], (0, n - len(y[N + 1:])))
    if drive > 0:
        sig = np.tanh(sig * (1 + drive * 6)) / np.tanh(1 + drive * 6)
    return sig * env(n, 0.002, 2.0, 1.0, 0.06, hold=dur) * vel * 0.5


def strum(tr, t, notes, dur, vel=1.0, down=True, spread=0.012, pan=0.0, **kw):
    order = notes if down else list(reversed(notes))
    for i, nn in enumerate(order):
        tr.add(t + i * spread, pluck(nn, dur, vel * (1 - i * 0.05), **kw), pan=pan)


def accordion(m, dur, vel=1.0):
    n = int((dur + 0.1) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    bellows = 1 + 0.08 * np.sin(2 * np.pi * 5.2 * t)
    sig = 0
    for det in (0.997, 1.0, 1.004):
        ph = (f * det * t) % 1
        sig = sig + (2 * ph - 1)
    sig = lowpass(sig / 3 + 0.3 * np.sign(np.sin(2 * np.pi * f * t)), 2600)
    return sig * bellows * env(n, 0.03, 0.3, 0.85, 0.06, hold=dur) * vel * 0.2


def synth(m, dur, vel=1.0, cut=2400):
    """A warm synth lead / brass for the city pop."""
    n = int((dur + 0.15) * SR)
    t = np.arange(n) / SR
    f = hz(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.2))
    ph = np.cumsum(f) / SR
    sig = lowpass((2 * (ph % 1) - 1) + 0.5 * (2 * ((ph * 1.005) % 1) - 1), cut)
    return sig * env(n, 0.02, 0.4, 0.7, 0.1, hold=dur) * vel * 0.16


def fiddle(m, dur, vel=1.0):
    n = int((dur + 0.1) * SR)
    t = np.arange(n) / SR
    f = hz(m) * (1 + 0.008 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / 0.15))
    ph = np.cumsum(f) / SR
    sig = lowpass(2 * (ph % 1) - 1, 3200)
    return sig * env(n, 0.04, 0.3, 0.8, 0.07, hold=dur) * vel * 0.17


def clap(vel=1.0):
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 1200)
    e = np.zeros(n)
    for d in (0, 0.011, 0.022):
        e += (t >= d) * np.exp(-(t - d).clip(0) * 60) * 0.6
    return noise * e * vel * 0.3


def tambourine(vel=1.0):
    n = int(0.14 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 6000)
    return noise * np.exp(-t * 28) * (1 + 0.5 * np.sin(2 * np.pi * 7000 * t)) * vel * 0.16


def beat_kit(tr, t0, beat, bar, hats=8, open_last=False, kick_on=(0, 2), snare_on=(1, 3), vel=1.0):
    for bt in range(4):
        if bt in kick_on:
            tr.add(t0 + bt * beat, kick(0.85 * vel))
        if bt in snare_on:
            tr.add(t0 + bt * beat, snare(0.7 * vel))
    for k in range(hats):
        tr.add(t0 + k * beat * 4 / hats, hat(0.55 if k % 2 == 0 else 0.35, open_=open_last and k == hats - 1), pan=0.3)


# ---------------- instruments for Put It Out! ----------------
def bell(m, dur, vel=1.0):
    """Glockenspiel: inharmonic partials, fast decay."""
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    sig = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + 0.18 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12)
    return sig * np.exp(-t * 3.2) * env(n, 0.001, 5, 1.0, 0.05) * vel * 0.2


def jingle(vel=1.0):
    """Sleigh bells: a shake of bright metal."""
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 7500)
    ring = 1 + 0.6 * np.sin(2 * np.pi * 3100 * t) + 0.4 * np.sin(2 * np.pi * 4700 * t)
    shake = 0.55 + 0.45 * np.sin(2 * np.pi * 32 * t)
    return noise * ring * shake * np.exp(-t * 14) * vel * 0.13


def taiko(vel=1.0, f0=62):
    """Big low drum: a pitched thump with a skin slap."""
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = f0 + 55 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    noise = rng.standard_normal(n)
    slap = lowpass(noise, 1400) * np.exp(-t * 40) * 1.5
    return (body + slap) * vel * 0.8


def tom(m, vel=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = hz(m) * (1 + 0.5 * np.exp(-t * 25))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) * vel * 0.5


def brass(m, dur, vel=1.0, bright=1.0):
    """Brass section: detuned saws through a filter that opens on the attack."""
    n = int((dur + 0.15) * SR)
    t = np.arange(n) / SR
    f = hz(m) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / 0.3))
    sig = 0
    for det in (0.996, 1.0, 1.005):
        ph = np.cumsum(f * det) / SR
        sig = sig + (2 * (ph % 1) - 1)
    cut = 900 + 2600 * bright * vel
    # filter sweep: darker body after the bite of the attack
    bite = lowpass(sig / 3, cut) * (0.6 + 0.4 * np.exp(-t * 8))
    return bite * env(n, 0.025, 0.35, 0.75, 0.08, hold=dur) * vel * 0.24


def power(tr, t, root, dur, vel=1.0, pan=0.0):
    """Overdriven power chord: root, fifth and octave."""
    for i, iv in enumerate((0, 7, 12)):
        tr.add(t + i * 0.004, pluck(root + iv, dur, vel * (1 - i * 0.1), bright=0.7, decay=0.998, drive=0.8), pan=pan)


def triad(root_m, minor=False):
    return [root_m, root_m + (3 if minor else 4), root_m + 7]


# ---------------- folk reel: the farm, the chestnut forest and the campground, 144 bpm, D major ----------------
def folk():
    bpm = 144
    beat = 60 / bpm
    bars = 16
    tr = Track(bars * 4 * beat)
    prog = ['D', 'D', 'G', 'D', 'D', 'D', 'A', 'A', 'D', 'D', 'G', 'D', 'G', 'A', 'D', 'D']
    for b, root in enumerate(prog):
        t0 = b * 4 * beat
        r = midi(root, 2)
        # boom-chick bass: root on 1, fifth on 3
        tr.add(t0, bass(r, beat * 0.9, 1.0), pan=-0.1)
        tr.add(t0 + 2 * beat, bass(r + 7 if root != 'A' else r - 5, beat * 0.9, 0.85), pan=-0.1)
        # banjo rolls: eighth notes over the chord
        notes = triad(midi(root, 3)) + [midi(root, 4)]
        roll = [0, 1, 2, 3, 1, 2, 3, 2]
        for k in range(8):
            tr.add(t0 + k * beat / 2, pluck(notes[roll[k]] + 12, beat * 0.45, 0.55 if k % 2 == 0 else 0.4, bright=0.95, decay=0.992), pan=0.35)
        # accordion chords on the off-beats
        for bt in range(4):
            for nn in triad(midi(root, 4)):
                tr.add(t0 + bt * beat + beat / 2, accordion(nn, beat * 0.35, 0.5), pan=-0.3)
        # drums: kick on 1 and 3, brushed snare on 2 and 4, tambourine eighths
        for bt in range(4):
            if bt in (0, 2):
                tr.add(t0 + bt * beat, kick(0.7))
            else:
                tr.add(t0 + bt * beat, snare(0.6, brush=True))
        for k in range(8):
            tr.add(t0 + k * beat / 2, tambourine(0.8 if k % 2 else 0.5), pan=0.45)
    # fiddle reel in the second half (bars 8-15), a quieter one in the first
    reel = [('A', 4), ('D', 5), ('F#', 5), ('A', 5), ('F#', 5), ('D', 5), ('E', 5), ('F#', 5),
            ('G', 5), ('F#', 5), ('E', 5), ('D', 5), ('B', 4), ('D', 5), ('E', 5), ('C#', 5)]
    turn = [('D', 5), ('E', 5), ('F#', 5), ('G', 5), ('A', 5), ('F#', 5), ('E', 5), ('C#', 5),
            ('D', 5), ('A', 4), ('F#', 4), ('A', 4), ('D', 5), ('D', 5), ('D', 5), ('D', 5)]
    for half, v in ((0, 0.55), (8, 0.95)):
        for rep in range(2):
            phrase = reel if rep == 0 else turn
            for k, (nm, o) in enumerate(phrase):
                bar = half + rep * 4 + (k // 8) * 2
                t = (bar * 4 + (k % 8) * 0.5 * 2) * beat
                d = 0.9 if k % 8 != 7 else 1.8
                tr.add(t, fiddle(midi(nm, o), d * beat, v), pan=0.05)
    master(tr, 'music-folk.mp3')


# ---------------- city funk: the docks, downtown and the rail yard, 108 bpm, E minor ----------------
def funk():
    bpm = 108
    beat = 60 / bpm
    bars = 16
    tr = Track(bars * 4 * beat)
    prog = [('E', 'm9'), ('E', 'm9'), ('A', '9'), ('A', '9')] * 3 + [('C', 'maj7'), ('B', '7'), ('E', 'm9'), ('A', '9')]
    # sixteenth-note slap bass pattern (step, interval, velocity)
    groove = [(0, 0, 1.0), (3, 12, 0.7), (4, 0, 0.8), (6, 10, 0.6), (7, 12, 0.8), (10, 7, 0.7), (11, 10, 0.6), (14, 12, 0.8), (15, 0, 0.7)]
    for b, (root, kind) in enumerate(prog):
        t0 = b * 4 * beat
        s16 = beat / 4
        r = midi(root, 1) if root in ('E', 'C', 'B') else midi(root, 1)
        for st, iv, v in groove:
            tr.add(t0 + st * s16, bass(r + iv, s16 * 1.4, v * 1.1), pan=-0.1)
        # clav stabs (bright plucks, muted) on the upbeats
        for st in (2, 6, 9, 13):
            for nn in chord_notes(root, kind, 4)[1:4]:
                tr.add(t0 + st * s16, pluck(nn, s16 * 0.8, 0.5, bright=1.0, decay=0.97), pan=0.3)
        # drums: syncopated kick, snare on 2 and 4 with a ghost note, sixteenth hats
        for st in (0, 7, 10):
            tr.add(t0 + st * s16, kick(0.9))
        for st in (4, 12):
            tr.add(t0 + st * s16, snare(0.85))
        tr.add(t0 + 14 * s16, snare(0.25))
        for k in range(16):
            tr.add(t0 + k * s16, hat(0.45 if k % 2 == 0 else 0.25, open_=k == 14), pan=0.35)
        # warm pad
        for nn in chord_notes(root, kind, 3):
            tr.add(t0, epiano(nn, beat * 3.6, 0.28), pan=-0.25)
    # horn section hits and a riff
    hits = [(3, 1.5), (7, 1.5), (11, 1.5)]
    riff = [(0, 'B', 4, 0.5), (0.75, 'D', 5, 0.25), (1, 'E', 5, 0.5), (2, 'G', 5, 0.5), (2.75, 'E', 5, 0.25), (3, 'D', 5, 1),
            (4, 'B', 4, 0.5), (4.75, 'D', 5, 0.25), (5, 'E', 5, 0.5), (6, 'A', 5, 0.5), (6.5, 'G', 5, 0.5), (7, 'E', 5, 1)]
    for bar in (4, 8):
        for bt, nm, o, d in riff:
            for oct_shift in (0, -12):
                tr.add((bar * 4 + bt) * beat, brass(midi(nm, o) + oct_shift, d * beat, 0.8), pan=0.15 if oct_shift else -0.05)
    for bar, bt in hits:
        for nn in chord_notes('E', 'm7', 4):
            tr.add((bar * 4 + bt) * beat, brass(nn, beat * 0.3, 0.9), pan=0.1)
    for bar in (12, 13, 14, 15):
        root, kind = prog[bar]
        for nn in chord_notes(root, kind, 4)[:3]:
            tr.add((bar * 4 + 0) * beat, brass(nn, beat * 0.5, 0.75), pan=0.1)
            tr.add((bar * 4 + 2.5) * beat, brass(nn, beat * 0.3, 0.65), pan=0.1)
    master(tr, 'music-funk.mp3')


# ---------------- driving rock: the gas station and the industrial park, 150 bpm, A minor ----------------
def rock():
    bpm = 150
    beat = 60 / bpm
    bars = 16
    tr = Track(bars * 4 * beat)
    prog = ['A', 'A', 'F', 'G', 'A', 'A', 'C', 'D', 'A', 'A', 'F', 'G', 'F', 'G', 'E', 'E']
    for b, root in enumerate(prog):
        t0 = b * 4 * beat
        r2 = midi(root, 2)
        # eighth-note power chords, palm-muted except the accents
        for k in range(8):
            acc = k in (0, 3, 6)
            power(tr, t0 + k * beat / 2, midi(root, 3) if root not in ('A', 'G', 'F', 'E') else midi(root, 2) + 12, beat * (0.45 if acc else 0.2), 0.75 if acc else 0.45, pan=-0.35 if k % 2 else 0.35)
            tr.add(t0 + k * beat / 2, bass(r2, beat * 0.42, 0.95 if acc else 0.75), pan=0)
        # drums
        for bt in range(4):
            tr.add(t0 + bt * beat, kick(1.0 if bt in (0, 2) else 0.0) if bt in (0, 2) else snare(0.95))
        tr.add(t0 + 2.5 * beat, kick(0.8))
        for k in range(8):
            tr.add(t0 + k * beat / 2, hat(0.5 if k % 2 == 0 else 0.35, open_=k == 7 and b % 2 == 1), pan=0.3)
        if b % 4 == 3:
            for k, m in enumerate((50, 47, 45, 43)):
                tr.add(t0 + 3 * beat + k * beat / 4, tom(m, 0.8), pan=-0.3 + k * 0.2)
    # lead riff (synth lead, like a guitar solo) in the second half
    lead = [(0, 'A', 5, 0.5), (0.5, 'C', 6, 0.5), (1, 'D', 6, 0.5), (1.5, 'E', 6, 1.5), (3, 'D', 6, 0.5), (3.5, 'C', 6, 0.5),
            (4, 'A', 5, 1), (5, 'G', 5, 0.5), (5.5, 'A', 5, 2.5)]
    for bar in (8, 10, 12):
        for bt, nm, o, d in lead:
            tr.add((bar * 4 + bt) * beat, synth(midi(nm, o), d * beat, 1.0, cut=3000), pan=0.05)
    for bt, nm, o, d in [(0, 'E', 6, 1), (1, 'D', 6, 1), (2, 'C', 6, 1), (3, 'B', 5, 1), (4, 'G#', 5, 4)]:
        tr.add((14 * 4 + bt) * beat, synth(midi(nm, o), d * beat, 1.0, cut=3000), pan=0.05)
    master(tr, 'music-rock.mp3', gain=0.59)


# ---------------- night groove: the beach on San Juan night and the museum, 96 bpm, C minor ----------------
def night():
    bpm = 96
    beat = 60 / bpm
    bars = 16
    tr = Track(bars * 4 * beat)
    prog = [('C', 'm9'), ('C', 'm9'), ('Ab', 'maj7'), ('Ab', 'maj7'), ('F', 'm9'), ('F', 'm9'), ('G', '7'), ('G', '7')] * 2
    for b, (root, kind) in enumerate(prog):
        t0 = b * 4 * beat
        notes = chord_notes(root, kind, 3 if root in ('Ab', 'G') else 4)
        for nn in notes[1:]:
            tr.add(t0, epiano(nn, beat * 3.8, 0.4), pan=-0.2)
        # sixteenth arpeggio, soft and bright
        arp = notes + [notes[1] + 12, notes[2] + 12]
        for k in range(16):
            tr.add(t0 + k * beat / 4, pluck(arp[(k * 3) % len(arp)] + 12, beat * 0.3, 0.32 if k % 4 else 0.45, bright=0.8, decay=0.994), pan=0.4 * (1 if k % 2 else -1))
        r = midi(root, 2) if root != 'Ab' else midi(root, 1)
        tr.add(t0, bass(r, beat * 1.5, 0.95), pan=-0.05)
        tr.add(t0 + 1.75 * beat, bass(r, beat * 0.3, 0.6), pan=-0.05)
        tr.add(t0 + 2.5 * beat, bass(r + 7 if root != 'G' else r + 5, beat * 1.2, 0.8), pan=-0.05)
        # half-time drums: kick 1 and the "and" of 2, rim on 3, shaker
        tr.add(t0, kick(0.85))
        tr.add(t0 + 1.5 * beat, kick(0.55))
        tr.add(t0 + 2 * beat, rim(1.2), pan=0.2)
        tr.add(t0 + 2 * beat, snare(0.35, brush=True))
        for k in range(8):
            tr.add(t0 + k * beat / 2, shaker(0.9 if k % 2 else 0.5), pan=-0.35)
    # a sparse, sneaky melody (bars 8-15)
    mel = [(8, 0, 'G', 5, 1.5), (8, 2, 'Eb', 5, 0.5), (8, 2.5, 'F', 5, 0.5), (8, 3, 'G', 5, 1), (9, 1, 'Bb', 5, 2),
           (10, 0, 'C', 6, 1.5), (10, 2, 'G', 5, 2), (11, 0, 'Eb', 5, 3),
           (12, 0, 'F', 5, 1), (12, 1, 'Ab', 5, 1), (12, 2, 'C', 6, 2), (13, 0, 'Bb', 5, 3),
           (14, 0, 'B', 5, 1), (14, 1, 'D', 6, 1), (14, 2, 'F', 6, 1.5), (15, 0, 'D', 6, 1), (15, 1, 'B', 5, 2)]
    for bar, bt, nm, o, d in mel:
        tr.add((bar * 4 + bt) * beat, synth(midi(nm, o), d * beat, 0.8, cut=1800), pan=0.1)
    master(tr, 'music-night.mp3')


# ---------------- snow: the ski lodge, 132 bpm, F major, sleigh bells and glockenspiel ----------------
def snow():
    bpm = 132
    beat = 60 / bpm
    bars = 16
    tr = Track(bars * 4 * beat)
    prog = [('F', False), ('F', False), ('Bb', False), ('F', False), ('D', True), ('G', True), ('C', False), ('C', False),
            ('F', False), ('A', True), ('Bb', False), ('G', True), ('F', False), ('C', False), ('F', False), ('C', False)]
    for b, (root, minor) in enumerate(prog):
        t0 = b * 4 * beat
        r = midi(root, 2)
        # bouncing bass: root and fifth
        for bt in range(4):
            tr.add(t0 + bt * beat, bass(r + (0 if bt % 2 == 0 else 7), beat * 0.7, 0.9 if bt % 2 == 0 else 0.7), pan=-0.1)
        # pizzicato chords on the off-beats
        for bt in range(4):
            for nn in triad(midi(root, 4), minor):
                tr.add(t0 + bt * beat + beat / 2, pluck(nn, beat * 0.25, 0.4, bright=0.6, decay=0.985), pan=0.3)
        # sleigh bells on every eighth, accented on the beat
        for k in range(8):
            tr.add(t0 + k * beat / 2, jingle(1.0 if k % 2 == 0 else 0.6), pan=0.45)
        tr.add(t0, kick(0.7))
        tr.add(t0 + 2 * beat, kick(0.6))
        tr.add(t0 + beat, snare(0.5, brush=True))
        tr.add(t0 + 3 * beat, snare(0.5, brush=True))
    # glockenspiel melody, twice (the second time an octave up with a fiddle under it)
    mel = [(0, 0, 'A', 5, 1), (0, 1, 'C', 6, 1), (0, 2, 'F', 6, 2), (1, 0, 'E', 6, 1), (1, 1, 'D', 6, 1), (1, 2, 'C', 6, 2),
           (2, 0, 'D', 6, 1), (2, 1, 'F', 6, 1), (2, 2, 'Bb', 5, 2), (3, 0, 'A', 5, 4),
           (4, 0, 'A', 5, 1), (4, 1, 'D', 6, 1), (4, 2, 'F', 6, 2), (5, 0, 'G', 6, 1), (5, 1, 'F', 6, 1), (5, 2, 'D', 6, 2),
           (6, 0, 'E', 6, 1), (6, 1, 'G', 6, 1), (6, 2, 'C', 6, 2), (7, 0, 'C', 6, 2), (7, 2, 'E', 6, 2)]
    for half in (0, 8):
        for bar, bt, nm, o, d in mel:
            m = midi(nm, o)
            tr.add(((half + bar) * 4 + bt) * beat, bell(m + (12 if half else 0) - 12, d * beat, 1.0), pan=0.1)
            if half:
                tr.add(((half + bar) * 4 + bt) * beat, fiddle(m - 12, d * beat * 0.95, 0.45), pan=-0.1)
    master(tr, 'music-snow.mp3')


# ---------------- big fire: every tenth level and the finale, 156 bpm, D minor, drums and brass ----------------
def bigfire():
    bpm = 156
    beat = 60 / bpm
    bars = 16
    tr = Track(bars * 4 * beat)
    prog = [('D', True), ('D', True), ('Bb', False), ('C', False), ('D', True), ('D', True), ('Bb', False), ('A', False)] * 2
    for b, (root, minor) in enumerate(prog):
        t0 = b * 4 * beat
        r = midi(root, 2) if root in ('D', 'C') else midi(root, 1)
        # string ostinato: sixteenth notes
        tri = triad(midi(root, 4), minor)
        pat = [tri[0], tri[0], tri[1], tri[0], tri[2], tri[0], tri[1], tri[0]]
        for k in range(16):
            tr.add(t0 + k * beat / 4, fiddle(pat[k % 8], beat * 0.22, 0.55 if k % 4 == 0 else 0.38), pan=-0.25)
        # pedal bass in eighths
        for k in range(8):
            tr.add(t0 + k * beat / 2, bass(r, beat * 0.45, 1.0 if k % 2 == 0 else 0.75))
        # taiko pattern + snare backbeat
        for bt, v in ((0, 1.0), (0.75, 0.6), (1.5, 0.8), (2, 1.0), (3, 0.7), (3.5, 0.9)):
            tr.add(t0 + bt * beat, taiko(v), pan=0.0)
        for bt in (1, 3):
            tr.add(t0 + bt * beat, snare(0.9))
        for k in range(8):
            tr.add(t0 + k * beat / 2, hat(0.4), pan=0.3)
        if b % 4 == 3:
            for k in range(8):
                tr.add(t0 + 2 * beat + k * beat / 4, tom(43 + (7 - k), 0.5 + k * 0.06), pan=-0.4 + k * 0.1)
    # brass: the heroic call in the second half, stabs in the first
    call = [(0, 'D', 5, 1.5), (1.5, 'A', 4, 0.5), (2, 'D', 5, 1), (3, 'E', 5, 1), (4, 'F', 5, 2), (6, 'E', 5, 1), (7, 'C', 5, 1),
            (8, 'D', 5, 1.5), (9.5, 'A', 4, 0.5), (10, 'D', 5, 1), (11, 'F', 5, 1), (12, 'A', 5, 3), (15, 'G', 5, 1)]
    for rep in (8, 12):
        for bt, nm, o, d in call:
            if rep == 12 and bt >= 12:
                nm, o = {'A': ('C#', 6), 'G': ('E', 5)}[nm]
            m = midi(nm, o)
            tr.add((rep * 4 + bt) * beat, brass(m, d * beat, 0.95), pan=0.1)
            tr.add((rep * 4 + bt) * beat, brass(m - 12, d * beat, 0.7), pan=-0.1)
    for bar in range(0, 8):
        root, minor = prog[bar]
        for nn in triad(midi(root, 4), minor):
            tr.add((bar * 4) * beat, brass(nn, beat * 0.4, 0.85), pan=0.15)
            tr.add((bar * 4 + 2.5) * beat, brass(nn, beat * 0.3, 0.7), pan=0.15)
    master(tr, 'music-bigfire.mp3', gain=0.72)


TRACKS = {'folk': folk, 'funk': funk, 'rock': rock, 'night': night, 'snow': snow, 'bigfire': bigfire}

if __name__ == '__main__':
    import sys
    for name in sys.argv[1:] or list(TRACKS):
        TRACKS[name]()
