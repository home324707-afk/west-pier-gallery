#!/usr/bin/env python3
"""Add the West Pier Curator's own generative works to the gallery.

  python3 tools/ai_art/add_ai.py murmuration riso ...   # make and hang new pieces (see pieces.PIECES)
  python3 tools/ai_art/add_ai.py erosion                # first run hangs the living piece; later runs add one more storm
  python3 tools/ai_art/add_ai.py --list

Each piece is recorded in data/artworks.json with kind='ai', artist 'West Pier Curator (AI)', the method, the
source views it derives from, and a licence computed from those sources (CC0 for wholly original work)."""
import sys, os, json, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import pieces, erosion
STATE = J('data', 'ai_state.json')
ARTIST = 'West Pier Curator (AI)'

def hang(img, meta, key):
    A = works(); n = len(A) + 1; path = J('img', f'{n:02d}.jpg'); img.thumbnail((1600, 1600)); w, h = save(img, path)
    lic = derived_licence(meta['sources']) if meta['sources'] else 'CC0 1.0'
    src_credit = '; '.join(f'No. {s}: "{work(s)["orig_title"]}" by {work(s)["artist"] or "Unknown"} ({work(s)["lic"]})' for s in meta['sources'])
    rec = dict(n=n, kind='ai', ai_key=key, anim=key, src='Made by the West Pier Curator (AI) for this exhibition', file=f'ai:{key}', orig_title=meta['orig_title'], artist=ARTIST,
               date=datetime.date.today().isoformat(), lic=lic, licurl=LICURL[lic], page=f'https://github.com/home324707-afk/west-pier-gallery/blob/main/tools/ai_art/{"erosion" if key == "erosion" else "pieces"}.py',
               dl='', desc='', method=meta['method'], sources=meta['sources'], source_credit=src_credit, img=f'img/{n:02d}.jpg', w=w, h=h)
    if meta['sources'] and lic != 'CC0 1.0':
        rec['note'] = f'Derivative released under {lic}. Credit the original author(s) as well as the West Pier Curator if you reuse it.'
    A.append(rec); json.dump(A, open(J('data', 'artworks.json'), 'w'), indent=1, ensure_ascii=False)
    print('hung', n, key, lic); return rec

def main(args):
    st = json.load(open(STATE)) if os.path.exists(STATE) else {}
    if args == ['--list']: print(list(pieces.PIECES) + ['erosion']); return
    for k in args:
        if k == 'erosion':
            A = works(); ex = next((a for a in A if a.get('ai_key') == 'erosion'), None)
            g = st.get('erosion_generation', 0) + 1; img = erosion.generation(g)
            meta = dict(orig_title='The storm that never ends', sources=[1], method=f'Living derivative of No. 1. Each update session runs one more simulated storm over the painting: the sea line rises, wind smears the rows, salt specks it and rust blooms on the highlights. Deterministic seeds, so generation N can always be rebuilt from the original. Currently generation {g}.')
            if ex:
                img.thumbnail((1600, 1600)); save(img, J(ex['img'])); ex['method'] = meta['method']; ex['generation'] = g; ex['date'] = datetime.date.today().isoformat()
                json.dump(A, open(J('data', 'artworks.json'), 'w'), indent=1, ensure_ascii=False); print('evolved erosion to generation', g)
            else:
                rec = hang(img, meta, 'erosion'); A = works(); A[-1]['generation'] = g; json.dump(A, open(J('data', 'artworks.json'), 'w'), indent=1, ensure_ascii=False)
            st['erosion_generation'] = g
        else:
            if any(a.get('ai_key') == k for a in works()): print('already hung', k); continue
            img, meta = pieces.PIECES[k](); hang(img, meta, k)
    json.dump(st, open(STATE, 'w'), indent=1)

if __name__ == '__main__': main(sys.argv[1:])
