"""Genera la cama musical del reel: loop de 4 compases a 118 BPM en La mayor
(A - E - F#m - D), con bombo, palmas, hi-hats, bajo y acordes cortos.
Uso: python3 scripts/generar_musica.py public/sfx/musica.wav
"""
import sys
import wave

import numpy as np

SR = 48000
BPM = 118
BEAT = 60 / BPM
BAR = 4 * BEAT
LARGO = int(4 * BAR * SR)
rng = np.random.default_rng(11)
mix = np.zeros((LARGO, 2))


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def poner(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    e = min(LARGO, i + len(sig))
    mix[i:e, 0] += sig[: e - i] * g * (1 - max(0, pan))
    mix[i:e, 1] += sig[: e - i] * g * (1 + min(0, pan))


def lp(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc)
        y[i] = acc
    return y


def saw(f, n):
    t = np.arange(n) / SR
    return 2 * ((t * f) % 1) - 1


def bombo():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.11)


def palma():
    n = int(0.18 * SR)
    x = rng.normal(0, 1, n)
    x = x - lp(x, 0.15)
    return x * env(n, 0.001, 0.05)


def hat():
    n = int(0.05 * SR)
    x = rng.normal(0, 1, n)
    x = x - lp(x, 0.35)
    return x * env(n, 0.0005, 0.012)


def nota(f, dur, brillo=0.12, a=0.004, d=0.18):
    n = int(dur * SR)
    x = 0.6 * saw(f, n) + 0.4 * saw(f * 1.005, n)
    return lp(x, brillo) * env(n, a, d)


NOTAS = {'A': 55.0, 'E': 41.2, 'F#': 46.25, 'D': 36.71}
ACORDES = [('A', [220.0, 277.18, 329.63]), ('E', [207.65, 246.94, 329.63]),
           ('F#', [220.0, 277.18, 369.99]), ('D', [220.0, 293.66, 369.99])]

for c, (raiz, triada) in enumerate(ACORDES):
    t0 = c * BAR
    for b in range(4):
        tb = t0 + b * BEAT
        poner(bombo(), tb, 0.9)
        if b in (1, 3):
            poner(palma(), tb, 0.35)
        poner(hat(), tb + BEAT / 2, 0.22, pan=0.3)
        poner(hat(), tb + BEAT * 0.75, 0.1, pan=-0.3)
        # bajo en corcheas (octava baja y alta alternadas)
        f = NOTAS[raiz] * 2
        poner(np.sin(2 * np.pi * f * np.arange(int(0.2 * SR)) / SR) * env(int(0.2 * SR), 0.003, 0.12), tb + BEAT / 2, 0.55)
        poner(nota(f, 0.2, 0.08, d=0.1), tb, 0.35)
        # acordes cortos en el contratiempo (estilo house)
        for k, fr in enumerate(triada):
            poner(nota(fr, 0.25, 0.18, d=0.09), tb + BEAT / 2, 0.11, pan=(k - 1) * 0.4)
    # arpegio suave arriba
    for k in range(8):
        fr = ACORDES[c][1][k % 3] * 2
        poner(np.sin(2 * np.pi * fr * np.arange(int(0.18 * SR)) / SR) * env(int(0.18 * SR), 0.002, 0.08), t0 + k * BEAT / 2 + BEAT / 4, 0.06, pan=0.5 if k % 2 else -0.5)

mix /= np.abs(mix).max() * 1.1
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
w = wave.open(sys.argv[1], 'wb')
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes(pcm.tobytes())
w.close()
print('ok', round(LARGO / SR, 2), 's')
