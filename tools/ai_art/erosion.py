"""Living work: 'The storm that never ends'. James Webb's 1870 West Pier (No. 1, public domain) is eroded by one more
storm every update session. Generation N is computed deterministically from the original, so only N needs storing (data/ai_state.json)."""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont
from common import *

def storm(img, g):
    rnd = random.Random(1000 + g); W, H = img.size; a = np.array(img).astype(float)
    # 1. the sea rises: a noisy waterline eats upward from the bottom, a little higher each generation
    level = H * (1 - 0.035 * g); xs = np.arange(W)
    line = level + 18 * np.sin(xs / 41 + g) + 9 * np.sin(xs / 13 + g * 2.1)
    yy = np.arange(H)[:, None]; sea = yy > line[None, :]
    a[sea] = a[sea] * .35 + np.array([28, 58, 70]) * .65
    # 2. wind: horizontal smears whose count grows with g
    for _ in range(6 + 3 * g):
        y = rnd.randrange(0, H - 8); h = rnd.randrange(2, 10); s = rnd.randrange(8, 40 + 10 * g)
        a[y:y + h] = np.roll(a[y:y + h], s if rnd.random() < .5 else -s, axis=1) * .6 + a[y:y + h] * .4
    # 3. salt: pale specks
    n = 1500 * g; ys = np.array([rnd.randrange(H) for _ in range(n)]); xs2 = np.array([rnd.randrange(W) for _ in range(n)])
    if n: a[ys, xs2] = a[ys, xs2] * .3 + 230 * .7
    # 4. rust bloom on the brightest third
    lum = a.mean(axis=2); m = lum > np.percentile(lum, 70)
    a[m] = a[m] * (1 - .04) + np.array([196, 86, 43]) * .04
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))

def generation(g):
    img = src_img(1); img.thumbnail((1600, 1600))
    for k in range(1, g + 1): img = storm(img, k)
    d = ImageDraw.Draw(img); f = ImageFont.truetype(G + 'JetBrains Mono/JetBrainsMono-VariableFont_wght.ttf', 20)
    d.text((24, 20), f'STORM {g}', font=f, fill=(243, 239, 228))
    return img
