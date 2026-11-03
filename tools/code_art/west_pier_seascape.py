#!/usr/bin/env python3
"""No. 315: an abstract seascape from formulae, with the West Pier ruin sketched over it in code.

  python3 tools/code_art/west_pier_seascape.py            # renders /workspace/seaw/no315_master.png (4200x2800)
  python3 tools/code_art/west_pier_seascape.py --hang     # also writes img/315.jpg (3000 px), img/315_t.jpg and the artworks.json record

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
    base = pencil.smudge(base, np.clip(L['ink'].array() + 0.6 * L['graphite'].array(), 0, 1))
    out = pencil.composite(base, [(L['guide'].array(), (0.08, 0.10, 0.16), 1.0), (L['graphite'].array(), (0.05, 0.07, 0.12), 0.9), (L['ink'].array(), (0.02, 0.03, 0.07), 0.45)], th)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))

def hang(im):
    os.chdir(ROOT)
    A = json.load(open('data/artworks.json'))
    if any(a.get('ai_key') == 'seapier' for a in A): print('already hung'); return
    n = max(a['n'] for a in A) + 1
    big = im.resize((3000, 2000), Image.LANCZOS); big.save(f'img/{n}.jpg', quality=88, optimize=True)
    t = im.copy(); t.thumbnail((700, 700), Image.LANCZOS); t.save(f'img/{n}_t.jpg', quality=82)
    A.append(dict(n=n, kind='ai', ai_key='seapier', static=True, src='Made by the West Pier Curator (AI) for this exhibition', file='code:seapier',
        orig_title='Swell and graphite', artist='West Pier Curator (AI)', date=datetime.date.today().isoformat(), lic='CC0 1.0',
        licurl='https://creativecommons.org/publicdomain/zero/1.0/', page='https://github.com/home324707-afk/west-pier-gallery/blob/main/tools/code_art/west_pier_seascape.py',
        dl='', desc='', method='A still drawn once, in Python. The sea is 46 sine waves added together and seen in perspective, with the sky reflected in it by Fresnel\'s formula; the sky is filtered noise. The pier is drawn over it as pencil strokes: each line wobbles, overshoots and is pressed harder in the middle, with hatching and a paper grain. No photograph is used.',
        sources=[], source_credit='Proportions of the ruin read from photographs on this wall; no pixel of any photograph is used.', img=f'img/{n}.jpg', w=3000, h=2000))
    json.dump(A, open('data/artworks.json', 'w'), indent=1, ensure_ascii=False)
    al = json.load(open('data/alt.json')); al[str(n)] = 'A pencil sketch of the bare iron frame of a ruined pier standing in a grey-blue sea under a stormy sky'
    json.dump(al, open('data/alt.json', 'w'), indent=1, ensure_ascii=False)
    print('hung', n)

if __name__ == '__main__':
    im = render()
    out = '/workspace/seaw/no315_master.png'; os.makedirs(os.path.dirname(out), exist_ok=True); im.save(out); print('wrote', out)
    if '--hang' in sys.argv: hang(im)
