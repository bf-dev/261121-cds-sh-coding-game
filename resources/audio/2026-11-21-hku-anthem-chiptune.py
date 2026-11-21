#!/usr/bin/env python3
"""Chiptune of the HKU University Anthem (1912), sections B to D.

Melody: soprano line, bars 1-24 from rehearsal letter B ("Finis hic operum!") to the
fermata before the 3/4 section, read by eye from the published score
"University Anthem", orchestral version by Chan Hing-yan, May 2011
(score pages 3 and 4, https://fliphtml5.com/pxkj/sgmt/basic). Where the sopranos divide,
the upper note is used. Nothing is added to the tune: the second voice is the same line one
octave lower, plus a soft tick on each beat.

usage: chiptune.py out.wav [bpm]
"""
import struct
import sys
import wave

import numpy as np

SR = 44100
BPM = float(sys.argv[2]) if len(sys.argv) > 2 else 80.0
BEAT = 60.0 / BPM

SEMI = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def freq(name: str) -> float:
    letter, rest = name[0], name[1:]
    acc = 0
    if rest[0] == "b":
        acc, rest = -1, rest[1:]
    midi = 12 * (int(rest) + 1) + SEMI[letter] + acc
    return 440.0 * 2 ** ((midi - 69) / 12)


# (note, beats); key of B flat major, 4/4. E5 = E natural, B4 = B natural where written so.
BARS = [
    "Bb4 2, Bb4 1, Bb4 1",                    # 1  Fi-nis hic
    "Bb4 1.5, C5 .5, C5 2",                   # 2  op-er-um!
    "D5 2, D5 1, D5 1",                       # 3  Fi-nis hic
    "D5 1.5, E5 .5, E5 2",                    # 4  op-er-um! (E natural)
    "F5 2, E5 1, D5 1",                       # 5  Do-mus
    "F5 1, C5 .5, Bb4 .5, A4 2",              # 6  stat po-tens
    "Bb4 1, A4 .5, G4 .5, G4 1.5, F4 .5",     # 7  A-ca-dem-i-
    "F4 4",                                   # 8  ae
    "C5 1, C5 .5, C5 .5, C5 1, C5 .5, C5 .5",  # 9  Un-de ab oc-cid-u-
    "C5 1.5, D5 .5, Eb5 2",                   # 10 is re-cens
    "Bb4 1.5, Bb4 .5, Bb4 1, Bb4 .5, Bb4 .5",  # 11 Am-pli-o-re flu-
    "Bb4 1.5, C5 .5, Db5 2",                  # 12 et pla-gis
    "F5 1.5, B4 .5, B4 1, B4 .5, B4 .5",      # 13 Mox doc-tri-na me- (B natural)
    "D5 2, A4 2",                             # 14 a-tu
    "C5 1.5, C5 .5, C5 1, C5 .5, C5 .5",      # 15 Mox doc-tri-na me-
    "C5 2, F4 2",                             # 16 a-tu
    "Bb4 2, Bb4 1, Bb4 1",                    # 17 Fi-nis hic (letter D)
    "Bb4 1.5, C5 .5, C5 2",                   # 18 op-er-um!
    "Eb5 2, Eb5 1, Eb5 1",                    # 19 Fi-nis hic
    "Eb5 1.5, F5 .5, G5 2",                   # 20 op-er-um!
    "G5 2, C5 1, D5 1",                       # 21 Do-mus
    "F5 1, D5 .5, C5 .5, Bb4 2",              # 22 stat po-tens
    "Bb4 1, C5 .5, D5 .5, C5 1.5, Bb4 .5",    # 23 A-ca-dem-i-
    "Bb4 4",                                  # 24 ae (fermata)
]

notes = []
for bar in BARS:
    total = 0.0
    for item in bar.split(","):
        n, b = item.split()
        notes.append((n, float(b)))
        total += float(b)
    assert abs(total - 4.0) < 1e-9, bar

TAIL = 2.0  # beats of rest before the loop starts again
length = int((sum(b for _, b in notes) + TAIL) * BEAT * SR)
lead = np.zeros(length)
low = np.zeros(length)


def env(n: int, gap: int) -> np.ndarray:
    """quick attack, slight decay to a sustain level, short release, then a gap so repeats articulate"""
    e = np.zeros(n)
    on = max(1, n - gap)
    t = np.arange(on) / SR
    e[:on] = 0.72 + 0.28 * np.exp(-t / 0.09)
    a = min(on, int(0.004 * SR))
    e[:a] *= np.linspace(0, 1, a)
    r = min(on, int(0.03 * SR))
    e[on - r:on] *= np.linspace(1, 0, r)
    return e


pos = 0.0
for name, beats in notes:
    start = int(pos * BEAT * SR)
    n = int(beats * BEAT * SR)
    f = freq(name)
    t = np.arange(n) / SR
    e = env(n, int(0.035 * SR))
    # 25 % pulse wave lead with a little vibrato on long notes
    vib = 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.35) / 0.3, 0, 1)
    ph = np.cumsum(f * (1 + vib)) / SR
    lead[start:start + n] += (np.where((ph % 1.0) < 0.25, 1.0, -1.0)) * e
    # triangle one octave lower
    ph2 = (f / 2 * t) % 1.0
    low[start:start + n] += (4 * np.abs(ph2 - 0.5) - 1) * e
    pos += beats

# soft noise tick on every beat
rng = np.random.default_rng(1912)
tick = np.zeros(length)
tl = int(0.03 * SR)
for b in range(int(sum(x for _, x in notes))):
    s = int(b * BEAT * SR)
    amp = 0.5 if b % 4 == 0 else 0.28
    tick[s:s + tl] += rng.uniform(-1, 1, tl) * np.exp(-np.arange(tl) / (0.006 * SR)) * amp

mix = 0.30 * lead + 0.34 * low + 0.10 * tick
# 4-bit style quantising of the mix, like an old sound chip DAC
mix = np.round(mix * 24) / 24
mix = np.clip(mix, -1, 1) * 0.8

with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(struct.pack("<%dh" % len(mix), *(mix * 32767).astype(int)))
print("bars", len(BARS), "beats", sum(b for _, b in notes), "seconds", round(length / SR, 1), "bpm", BPM)
