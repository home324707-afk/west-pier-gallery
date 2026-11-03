#!/usr/bin/env python3
"""No. 315: an abstract seascape from formulae, with the West Pier ruin sketched over it in code.

  python3 tools/code_art/west_pier_seascape.py            # renders /workspace/seaw/no315_master.png (4200x2800)
  python3 tools/code_art/west_pier_seascape.py --hang     # also writes img/315.jpg (poster still), img/315_t.jpg, the transparent pier layers img/315_pier_*.png and the record

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
def render():
    base, yh = sea.render(W, H, horizon=0.46, bank_x=0.53)
    base = sea.tone(base)
    L = {k: pencil.Layer(W, H) for k in ('guide', 'graphite', 'ink')}
    hand = pencil.Hand(L, seed=315, scale=2.0)
    pier.draw(hand, cx=2180, yw=1450, S=1.6)
    th = pencil.tooth(H, W)
    spec = [(L['guide'].array(), (0.08, 0.10, 0.16), 1.0), (L['graphite'].array(), (0.05, 0.07, 0.12), 0.9), (L['ink'].array(), (0.02, 0.03, 0.07), 0.45)]
    ov = pencil.composite_rgba(spec, th, smudge_alpha=np.clip(L['ink'].array() + 0.6 * L['graphite'].array(), 0, 1))
    global OVERLAY; OVERLAY = Image.fromarray((ov * 255 + 0.5).astype(np.uint8), 'RGBA')
    base = pencil.smudge(base, np.clip(L['ink'].array() + 0.6 * L['graphite'].array(), 0, 1))
    out = pencil.composite(base, [(L['guide'].array(), (0.08, 0.10, 0.16), 1.0), (L['graphite'].array(), (0.05, 0.07, 0.12), 0.9), (L['ink'].array(), (0.02, 0.03, 0.07), 0.45)], th)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))

def hang(im):
    """Create or refresh the No. 315 record and its images: the poster still, the thumbnail and the transparent pier layers."""
    os.chdir(ROOT)
    A = json.load(open('data/artworks.json'))
    rec = next((a for a in A if a.get('ai_key') == 'seapier'), None)
    n = rec['n'] if rec else max(a['n'] for a in A) + 1
    big = im.resize((3000, 2000), Image.LANCZOS); big.save(f'img/{n}.jpg', quality=88, optimize=True)
    t = im.copy(); t.thumbnail((700, 700), Image.LANCZOS); t.save(f'img/{n}_t.jpg', quality=82)
    for w_ in (2400, 1200): OVERLAY.resize((w_, w_ * 2 // 3), Image.LANCZOS).save(f'img/{n}_pier_{w_}.png', optimize=True)
    new = dict(n=n, kind='ai', ai_key='seapier', webgl='seapier', src='Made by the West Pier Curator (AI) for this exhibition', file='code:seapier',
        orig_title='Swell and graphite', artist='West Pier Curator (AI)', date=datetime.date.today().isoformat(), lic='CC0 1.0',
        licurl='https://creativecommons.org/publicdomain/zero/1.0/', page='https://github.com/home324707-afk/west-pier-gallery/blob/main/ai/seapier.js',
        dl='', desc='', method='The sea is live: 46 sine waves added together in a WebGL shader and seen in perspective, with the sky reflected in them by Fresnel\'s formula; the sky is filtered noise. Tilt a phone (or move a mouse) and the wind turns and the swell changes; shake it and the chop builds. The pier is a still pencil drawing laid over it, made in Python with wobbling, overshooting strokes and a paper grain. No photograph is used.',
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
