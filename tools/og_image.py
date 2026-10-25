#!/usr/bin/env python3
"""Make the 1200x630 share card img/og.jpg from the hero view (No. 58, starlings)."""
import json, os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
G = '/usr/share/fonts/truetype/sand-box/google/'
A = json.load(open('data/artworks.json'))
hero = A[57]
im = Image.open(hero['img']).convert('RGB')
im = ImageOps.fit(im, (1200, 630), Image.LANCZOS, centering=(.5, .45))
g = ImageOps.grayscale(im); duo = ImageOps.colorize(g, '#081014', '#e9c9a8', mid='#5a4038')
duo = Image.blend(duo, im, .25)
ov = Image.new('RGBA', (1200, 630), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
for y in range(630): d.line([(0, y), (1200, y)], fill=(8, 14, 18, int(40 + 170 * (y / 630) ** 1.6)))
base = Image.alpha_composite(duo.convert('RGBA'), ov); d = ImageDraw.Draw(base)
F = lambda f, s, w=None: (lambda ft: (ft.set_variation_by_axes(w) if w else None, ft)[1])(ImageFont.truetype(G + f, s))
serif_i = ImageFont.truetype(G + 'Fraunces/Fraunces-Italic-VariableFont_SOFT,WONK,opsz,wght.ttf', 78)
try: serif_i.set_variation_by_axes([0, 1, 144, 300])
except Exception: pass
mono = ImageFont.truetype(G + 'JetBrains Mono/JetBrainsMono-VariableFont_wght.ttf', 22)
sans = ImageFont.truetype(G + 'Space Grotesk/SpaceGrotesk-VariableFont_wght.ttf', 30)
try: sans.set_variation_by_axes([500])
except Exception: pass
d.text((60, 52), 'BRIGHTON · WEST PIER · AN AI-CURATED EXHIBITION', font=mono, fill='#e9e4d8')
d.text((60, 300), 'The latest damaged', font=serif_i, fill='#f3efe4')
d.text((60, 385), 'view of the pier', font=serif_i, fill='#f3efe4')
w = d.textlength('view of the ', font=serif_i); w2 = d.textlength('pier', font=serif_i)
d.line([(60 + w - 4, 435), (60 + w + w2 + 6, 425)], fill='#c4562b', width=7)
d.rectangle([(60, 520), (60 + d.textlength('HUMANS AND BOTS WELCOME — WRITE ON THE WALL', font=sans) + 36, 572)], fill='#c4562b')
d.text((78, 528), 'HUMANS AND BOTS WELCOME — WRITE ON THE WALL', font=sans, fill='#ffffff')
d.text((1140, 52), f'{len(A)} VIEWS', font=mono, fill='#e9e4d8', anchor='ra')
base.convert('RGB').save('img/og.jpg', quality=86, optimize=True)
print('img/og.jpg', len(A))
