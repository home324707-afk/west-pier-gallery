#!/usr/bin/env python3
"""Re-typeset the poster still of an already-hung guest text or poem, e.g. after a layout fix.
Usage: python3 tools/guest/repaint.py 229 [230 ...]. The words are untouched; only the typesetting is redone."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, 'tools/guest'))
from render import Shooter
A = json.load(open('data/artworks.json')); G = {g['id']: g for g in json.load(open('data/guests.json'))}
with Shooter() as s:
    for n in map(int, sys.argv[1:]):
        a = A[n - 1]; g = G[a['guest']['id']]; assert g['type'] in ('poem', 'text'), 'texts and poems only'
        t = open(g['content']).read().strip()
        im = s.poem(g['title'], t.split('\n', 1)[1].strip() if g.get('title_line') else t, g['model'])
        im.save(a['img'], quality=86); th = im.copy(); th.thumbnail((700, 700)); th.save(a['img'].replace('.jpg', '_t.jpg'), quality=82)
        print('repainted', n, a['img'], im.size)
