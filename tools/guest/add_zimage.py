#!/usr/bin/env python3
"""Register photograph-style images made by Z-Image-Turbo as guest-AI image works (status 'ready'; then run tools/guest/hang.py).
Generation itself: gradio_client -> Space Tongyi-MAI/Z-Image-Turbo, api /generate, anonymous, 9 steps, shift 3.0 (see guest/commissions/zimage-*.json).
Usage: python3 tools/guest/add_zimage.py <src_dir_with_PNGs> key1 key2 ...   (order = hanging order)"""
import json, sys, os, datetime
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); os.chdir(ROOT)
src = sys.argv[1]; keys = sys.argv[2:]
P = json.load(open(os.path.join(src, 'prompts.json')))
LABEL = {'dusk': 'long-exposure dusk', 'fog': 'sea fog on a phone camera', 'murmuration': 'starling murmuration at sunset', 'film70s': 'faded 1970s colour print',
         'storm': 'storm waves and spray', 'lowtide': 'low tide, wet-sand reflection', 'night': 'night with the i360', 'bw35': 'grainy black-and-white 35mm', 'frost': 'frost-white winter morning', 'flash90s': '1990s disposable-camera flash', 'i360pod': 'from inside the i360 pod', 'pano': 'wonky phone panorama', 'swimmers': 'morning swimmers', 'rainwindow': 'drizzle through a cafe window'}
G = json.load(open('data/guests.json')); have = {g['id'] for g in G}
now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
for k in keys:
    gid = f'g-zimage-{k}'
    if gid in have: print('already', gid); continue
    p = P[k]; im = Image.open(os.path.join(src, k + '.png')).convert('RGB'); jp = f'guest/commissions/zimage-{k}.jpg'; im.save(jp, quality=92)
    settings = f'resolution {p["res"].split(" ")[0]}, seed {p["seed"]}, 9 steps, shift 3.0; native output {im.size[0]}x{im.size[1]} PNG, stored as JPEG q92'
    rec = dict(id=gid, type='image', title=f'Untitled ({LABEL[k]})', model='Z-Image-Turbo', model_requested='Z-Image-Turbo (Tongyi-MAI)',
        service='Hugging Face Space Tongyi-MAI/Z-Image-Turbo, anonymous Gradio API (no account)', endpoint='https://tongyi-mai-z-image-turbo.hf.space (api /generate)',
        date=now, prompt=p['prompt'], settings=settings, source='commission', file=f'guest/commissions/zimage-{k}.json', content=jp,
        model_licence='Apache 2.0 (Tongyi-MAI/Z-Image-Turbo)', model_licence_url='https://huggingface.co/Tongyi-MAI/Z-Image-Turbo',
        terms_note='Model and Space are both Apache 2.0, which places no restriction on outputs; the Space imposes no further terms on generated images. The gallery claims no rights in the output and dedicates it to the public domain (CC0) as far as it can. Fabricated photograph: nothing in it was photographed.',
        lic='CC0 1.0', licurl='https://creativecommons.org/publicdomain/zero/1.0/', status='ready', gfam='photographic',
        note='The prompt was written by the curator, an AI; the image was generated in one pass and kept or discarded on looks alone (a first storm attempt with people standing on the closed pier was discarded for a second prompt).' if k == 'storm' else 'The prompt was written by the curator, an AI; the image was generated in one pass and chosen from the batch on looks alone.')
    json.dump({k2: v for k2, v in rec.items() if k2 not in ('status',)}, open(rec['file'], 'w'), indent=1, ensure_ascii=False); G.append(rec); print('registered', gid)
json.dump(G, open('data/guests.json', 'w'), indent=1, ensure_ascii=False)
