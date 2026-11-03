#!/usr/bin/env python3
"""No. 315: an abstract seascape from formulae, with the West Pier ruin sketched over it in code.

  python3 tools/code_art/west_pier_seascape.py            # renders /workspace/seaw/no315_master.png (4200x2800)
  python3 tools/code_art/west_pier_seascape.py --hang     # also writes img/315.jpg (poster still), img/315_t.jpg, the transparent pier layers img/315_pier_*.png, the loose-piece atlas img/315_frags.png/.json and the record

The live version is ai/seapier.js (WebGL port of sea.py; the pier layer lies over it, unmoving).

Sea and sky: sea.py (superposed sine waves in perspective, Fresnel reflection of a filtered-noise sky).
Pier: pier.py (the ruin as numbers) drawn by pencil.py (wobbling, overshooting, multi-pass strokes, hatching, paper tooth, smudge).
numpy, Pillow and cairocffi only. No photograph is read."""
import os, sys, json, datetime
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); sys.path.insert(0, HERE)
import numpy as np
from PIL import Image
import sea, pencil, pier

W, H = 4200, 2800
SPRITES = []      # loose pieces, cut out of the drawing: dict(kind, weight, x0, y0, rgba)
SPEC_COL = ((0.08, 0.10, 0.16), (0.05, 0.07, 0.12), (0.02, 0.03, 0.07)); GRIT = (1.0, 0.9, 0.45); NAMES = ('guide', 'graphite', 'ink')

def render():
    """Returns the poster still. Also sets OVERLAY (the pier without its loose pieces, transparent) and SPRITES."""
    base, yh = sea.render(W, H, horizon=0.46, bank_x=0.53)
    base = sea.tone(base)
    th = pencil.tooth(H, W)
    L = {k: pencil.Layer(W, H) for k in NAMES}; LF = {k: pencil.Layer(W, H) for k in NAMES}; FL = {k: pencil.Layer(W, H) for k in NAMES}
    SPRITES.clear()
    def cut(kind, weight, bb):
        pad = 10
        x0, y0 = max(0, int(bb[0]) - pad), max(0, int(bb[1]) - pad); x1, y1 = min(W, int(bb[2]) + pad + 1), min(H, int(bb[3]) + pad + 1)
        spec = [(FL[k].crop(x0, y0, x1, y1), SPEC_COL[n], GRIT[n]) for n, k in enumerate(NAMES)]
        rgba = pencil.composite_rgba(spec, th[y0:y1, x0:x1])
        for k in NAMES: FL[k].clear(x0, y0, x1, y1)
        SPRITES.append(dict(kind=kind, weight=weight, x0=x0, y0=y0, rgba=rgba))
    hand = pencil.Hand(L, seed=315, scale=2.0, full=LF, frag_layers=FL, on_frag=cut)
    pier.draw(hand, cx=2180, yw=1450, S=1.6)
    spec = lambda D: [(D[k].array(), SPEC_COL[n], GRIT[n]) for n, k in enumerate(NAMES)]
    sm_main = np.clip(L['ink'].array() + 0.6 * L['graphite'].array(), 0, 1)
    global OVERLAY; OVERLAY = Image.fromarray((pencil.composite_rgba(spec(L), th, smudge_alpha=sm_main) * 255 + 0.5).astype(np.uint8), 'RGBA')
    base = pencil.smudge(base, np.clip(LF['ink'].array() + 0.6 * LF['graphite'].array(), 0, 1))
    out = pencil.composite(base, spec(LF), th)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))

def export_sprites(root, n, aw=2400):
    """Pack the loose pieces into one transparent atlas at aw px wide (the pier layer's size) plus a json of where each belongs.
    Positions are in units of the picture's width, so they follow the canvas at any size."""
    sc = aw / W; items = []
    for k, sp in enumerate(SPRITES):
        a = sp['rgba']; im = Image.fromarray((a * 255 + 0.5).astype(np.uint8), 'RGBA')
        w2, h2 = max(2, round(im.width * sc)), max(2, round(im.height * sc)); im = im.resize((w2, h2), Image.LANCZOS)
        items.append((k, im))
    items.sort(key=lambda t: -t[1].height)
    AW = 1024; x = y = rowh = 0; place = {}
    for k, im in items:
        if x + im.width + 2 > AW: x = 0; y += rowh + 2; rowh = 0
        place[k] = (x, y); x += im.width + 2; rowh = max(rowh, im.height)
    AH = y + rowh + 2; atlas = Image.new('RGBA', (AW, AH), (0, 0, 0, 0)); meta = []
    for k, im in items:
        atlas.paste(im, place[k]); sp = SPRITES[k]
        meta.append(dict(k=sp['kind'], w=sp['weight'], ax=place[k][0], ay=place[k][1], aw=im.width, ah=im.height,
                         x=round(sp['x0'] / W, 5), y=round(sp['y0'] / W, 5), uw=round(sp['rgba'].shape[1] / W, 5), uh=round(sp['rgba'].shape[0] / W, 5)))
    atlas.save(f'{root}/img/{n}_frags.png', optimize=True)
    json.dump(dict(aw=AW, ah=AH, f=meta), open(f'{root}/img/{n}_frags.json', 'w'), separators=(',', ':'))
    print('sprites', len(meta), 'atlas', atlas.size)

def hang(im):
    """Create or refresh the No. 315 record and its images: the poster still, the thumbnail and the transparent pier layers."""
    os.chdir(ROOT)
    A = json.load(open('data/artworks.json'))
    rec = next((a for a in A if a.get('ai_key') == 'seapier'), None)
    n = rec['n'] if rec else max(a['n'] for a in A) + 1
    big = im.resize((3000, 2000), Image.LANCZOS); big.save(f'img/{n}.jpg', quality=88, optimize=True)
    t = im.copy(); t.thumbnail((700, 700), Image.LANCZOS); t.save(f'img/{n}_t.jpg', quality=82)
    export_sprites(ROOT, n)
    for w_ in (2400, 1200): OVERLAY.resize((w_, w_ * 2 // 3), Image.LANCZOS).save(f'img/{n}_pier_{w_}.png', optimize=True)
    new = dict(n=n, kind='ai', ai_key='seapier', webgl='seapier', src='Made by the West Pier Curator (AI) for this exhibition', file='code:seapier',
        orig_title='Swell and graphite', artist='West Pier Curator (AI)', date=datetime.date.today().isoformat(), lic='CC0 1.0',
        licurl='https://creativecommons.org/publicdomain/zero/1.0/', page='https://github.com/home324707-afk/west-pier-gallery/blob/main/ai/seapier.js',
        dl='', desc='', method='The sea is live: 46 sine waves added together in a WebGL shader and seen in perspective, with the sky reflected in them by Fresnel\'s formula; the sky is filtered noise. Tilt a phone (or move a mouse) and the wind turns and the swell changes; shake it and the chop builds, and a few loose pieces of the pier come away, fall and splash. The pier is a pencil drawing laid over it, still until they go, made in Python with wobbling, overshooting strokes and a paper grain. No photograph is used.',
        sources=[], source_credit='Proportions of the ruin read from photographs on this wall; no pixel of any photograph is used.', img=f'img/{n}.jpg', w=3000, h=2000)
    if rec: rec.clear(); rec.update(new)
    else: A.append(new)
    json.dump(A, open('data/artworks.json', 'w'), indent=1, ensure_ascii=False)
    al = json.load(open('data/alt.json')); al[str(n)] = 'A pencil sketch of the bare iron frame of the ruined pier standing alone in a moving grey-blue sea under a stormy sky'
    json.dump(al, open('data/alt.json', 'w'), indent=1, ensure_ascii=False)
    print('hung', n)

if __name__ == '__main__':
    im = render()
    out = '/workspace/seaw/no315_master.png'; os.makedirs(os.path.dirname(out), exist_ok=True); im.save(out); print('wrote', out)
    OVERLAY.save('/workspace/seaw/no315_pier_full.png'); print('wrote overlay')
    if '--hang' in sys.argv: hang(im)
