"""Shared helpers for the West Pier Curator's own generative works."""
import json, os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J = lambda *p: os.path.join(ROOT, *p)
G = '/usr/share/fonts/truetype/sand-box/google/'
def works(): return json.load(open(J('data', 'artworks.json')))
def work(n): return next(a for a in works() if a['n'] == n)
def src_img(n): return Image.open(J(work(n)['img'])).convert('RGB')
# licences we may derive from, and what the derivative must be released under
DERIVABLE = {'Public domain': 'CC0 1.0', 'CC0': 'CC0 1.0', 'Public Domain Mark 1.0': 'CC0 1.0', 'PDM 1.0': 'CC0 1.0',
             'CC BY 2.0': 'CC BY 4.0', 'CC BY 4.0': 'CC BY 4.0', 'CC BY-NC 2.0': 'CC BY-NC 4.0', 'CC BY-NC 4.0': 'CC BY-NC 4.0',
             'CC BY-SA 2.0': 'CC BY-SA 4.0', 'CC BY-SA 3.0': 'CC BY-SA 4.0', 'CC BY-SA 4.0': 'CC BY-SA 4.0', 'CC BY-SA 2.5': 'CC BY-SA 4.0'}
LICURL = {'CC0 1.0': 'https://creativecommons.org/publicdomain/zero/1.0/', 'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
          'CC BY-NC 4.0': 'https://creativecommons.org/licenses/by-nc/4.0/', 'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/'}
RANK = ['CC0 1.0', 'CC BY 4.0', 'CC BY-NC 4.0', 'CC BY-SA 4.0']
def derived_licence(ns):
    """Licence for a work derived from gallery works ns (refuses ND / incompatible SA+NC mixes)."""
    ls = [DERIVABLE.get(work(n)['lic']) for n in ns]
    if None in ls: raise SystemExit('refusing to derive from a non-derivable licence: ' + str([work(n)['lic'] for n in ns]))
    if 'CC BY-SA 4.0' in ls and 'CC BY-NC 4.0' in ls: raise SystemExit('SA and NC sources cannot be mixed')
    return max(ls, key=RANK.index) if ls else 'CC0 1.0'

def pier_silhouette(W, H, base_y, scale=1.0, ruin=1.0, seed=7):
    """Procedural West Pier skeleton (wholly original drawing): legs, deck girders, the concert-hall cage, gaps where storms took it."""
    rnd = random.Random(seed); m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    cx = W * .52; cw = W * .34 * scale; top = base_y - H * .16 * scale; deck = base_y - H * .05 * scale
    x0, x1 = cx - cw / 2, cx + cw / 2
    lw = max(2, int(W / 500))
    # legs
    x = x0 - W * .25
    while x < x1 + W * .12:
        if rnd.random() < .85 * ruin + .15: d.line([(x, deck), (x + rnd.uniform(-2, 2), H)], fill=255, width=lw)
        x += W * .012 * scale
    # deck stubs: a broken causeway towards the shore
    x = x0 - W * .25
    while x < x0:
        if rnd.random() < .5: d.line([(x, deck + rnd.uniform(-3, 3)), (x + W * .02, deck)], fill=255, width=lw)
        x += W * .03
    d.line([(x0, deck), (x1, deck)], fill=255, width=lw * 2)
    # the cage: arched ribs and lattice
    ribs = 13
    for i in range(ribs + 1):
        xx = x0 + cw * i / ribs
        hgt = (deck - top) * (0.55 + 0.45 * math.sin(math.pi * i / ribs))
        if rnd.random() < .92: d.line([(xx, deck), (xx, deck - hgt)], fill=255, width=lw)
    pts = [(x0 + cw * t / 60, deck - (deck - top) * (0.55 + 0.45 * math.sin(math.pi * t / 60))) for t in range(61)]
    for a, b in zip(pts, pts[1:]):
        if rnd.random() < .9: d.line([a, b], fill=255, width=lw)
    for i in range(ribs):
        xa, xb = x0 + cw * i / ribs, x0 + cw * (i + 1) / ribs
        ya = deck - (deck - top) * .45
        if rnd.random() < .8: d.line([(xa, deck), (xb, ya)], fill=255, width=max(1, lw // 2))
        if rnd.random() < .8: d.line([(xa, ya), (xb, deck)], fill=255, width=max(1, lw // 2))
    d.line([(x0, deck - (deck - top) * .45), (x1, deck - (deck - top) * .45)], fill=255, width=lw)
    return m

def save(im, path):
    im = im.convert('RGB'); im.save(path, quality=88, optimize=True, progressive=True)
    t = im.copy(); t.thumbnail((700, 700)); t.save(path.replace('.jpg', '_t.jpg'), quality=82, optimize=True, progressive=True)
    return im.size
