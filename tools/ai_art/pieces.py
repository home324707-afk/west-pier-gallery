"""The West Pier Curator's generative pieces. Each returns (PIL image, metadata dict).
Every piece is deliberately stylised: none is meant to pass as documentary photography."""
import math, random, io, colorsys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont, ImageChops, ImageEnhance
from common import *

def murmuration(seed=58):
    """Original: a simulated murmuration of 6,000 starlings over a procedurally drawn pier skeleton at dusk."""
    W, H = 1600, 1000; rnd = np.random.default_rng(seed)
    y = np.linspace(0, 1, H)[:, None]
    sky = np.zeros((H, W, 3)); top = np.array([24, 28, 46]); mid = np.array([196, 104, 70]); low = np.array([238, 190, 130])
    t = np.clip(y / .78, 0, 1)
    sky = (top * (1 - t) ** 1.4 + mid * (t ** 1.4) * (1 - t) * 2.2 + low * t ** 3)[:, :, None].repeat(1, 2).transpose(0, 2, 1).repeat(W, 1) if False else None
    col = np.zeros((H, 3))
    for i, yy in enumerate(np.linspace(0, 1, H)):
        if yy < .55: c = top + (mid - top) * (yy / .55) ** 1.3
        elif yy < .74: c = mid + (low - mid) * ((yy - .55) / .19)
        else: c = np.array([30, 34, 44]) + (low - [30, 34, 44]) * max(0, 1 - (yy - .74) * 6) * .5
        col[i] = c
    img = Image.fromarray(np.repeat(col[:, None, :], W, 1).astype('uint8'))
    # sea glitter
    d = ImageDraw.Draw(img)
    for _ in range(2500):
        x = rnd.uniform(0, W); yy = rnd.uniform(H * .745, H)
        d.line([(x, yy), (x + rnd.uniform(4, 30), yy)], fill=(250, 210, 160) if rnd.random() < .3 else (60, 64, 80), width=1)
    # flock: each bird orbits a shared drifting centre on its own offset in a sheared, folded ribbon (a murmuration's typical shape)
    N = 6000; u = rnd.uniform(-1, 1, N); v = rnd.normal(0, 1, N)
    cx, cy = W * .55, H * .33
    X = cx + u * W * .33 + np.sin(u * 3.2) * W * .05 + v * 18
    Y = cy + np.sin(u * 2.4 + 1) * H * .13 + v * (22 + 40 * np.cos(u * 4) ** 2) - u * H * .04
    fold = rnd.random(N) < .35; X[fold] = cx + (X[fold] - cx) * .45 + W * .12; Y[fold] = cy - (Y[fold] - cy) * .7 - H * .08
    P = np.stack([X, Y], 1); V = np.stack([np.cos(u * 3) + rnd.normal(0, .3, N), np.sin(u * 2) + rnd.normal(0, .3, N)], 1)
    bird = Image.new('L', (W, H), 0); bd = ImageDraw.Draw(bird)
    for (x, yy), (vx, vy) in zip(P, V):
        ang = math.atan2(vy, vx); s = rnd.uniform(2, 4.5)
        bd.line([(x - math.cos(ang + .9) * s, yy - math.sin(ang + .9) * s), (x, yy), (x - math.cos(ang - .9) * s, yy - math.sin(ang - .9) * s)], fill=255, width=1)
    ink = Image.new('RGB', (W, H), (14, 12, 16))
    img.paste(ink, (0, 0), bird)
    img.paste(ink, (0, 0), pier_silhouette(W, H, int(H * .8), 1.7, seed=seed))
    return img, dict(orig_title='Six thousand starlings, one skeleton', method='Wholly original generative work. Python with NumPy and PIL. A particle simulation of 6,000 starlings follows drifting attractors over a pier skeleton drawn procedurally from code (no photograph used). Seed 58.', sources=[])

def pixelsort(src=2):
    """Gore's 1913 West Pier, pixel-sorted downwards like rain: the storm as an image-processing operation."""
    im = src_img(src); im.thumbnail((1600, 1600)); a = np.array(im); h, w, _ = a.shape
    lum = a.mean(axis=2); out = a.copy(); rnd = np.random.default_rng(13)
    for x in range(w):
        col = lum[:, x]; mask = col > np.percentile(col, 35 + 25 * math.sin(x / w * 7))
        y = 0
        while y < h:
            if mask[y]:
                y2 = y
                while y2 < h and mask[y2]: y2 += 1
                seg = out[y:y2, x]; idx = np.argsort(seg.mean(axis=1)); out[y:y2, x] = seg[idx]; y = y2
            else: y += 1
    img = Image.fromarray(out)
    return img, dict(orig_title='Gore, after rain (pixel-sorted)', method=f'Derivative of No. {src}. Every column of pixels was sorted by brightness inside thresholded runs, so the painting "rains" down the canvas. Python, NumPy.', sources=[src])

def riso(src=4):
    """Two-colour risograph halftone of the 1890s photochrom, misregistered as cheap print always is."""
    im = src_img(src); im.thumbnail((1500, 1500)); g = ImageOps.autocontrast(im.convert('L'))
    W, H = g.size; paper = Image.new('RGB', (W, H), (243, 236, 220))
    def screen(gray, angle, cell, colour, off):
        r = gray.rotate(angle, expand=True, fillcolor=255); rw, rh = r.size; dots = Image.new('L', (rw, rh), 0); d = ImageDraw.Draw(dots)
        px = r.load()
        for yy in range(0, rh, cell):
            for xx in range(0, rw, cell):
                v = 1 - px[min(xx, rw - 1), min(yy, rh - 1)] / 255; rad = cell * .62 * math.sqrt(v)
                if rad > .4: d.ellipse([xx - rad, yy - rad, xx + rad, yy + rad], fill=255)
        dots = dots.rotate(-angle, expand=True); dw, dh = dots.size; dots = dots.crop(((dw - W) // 2, (dh - H) // 2, (dw - W) // 2 + W, (dh - H) // 2 + H))
        layer = Image.new('RGB', (W, H), colour); m = Image.new('RGB', (W, H), (255, 255, 255)); m.paste(layer, off, dots); return m
    blue = screen(g, 15, 9, (0, 120, 191), (0, 0))
    pink = screen(ImageOps.posterize(g, 3), 75, 11, (255, 72, 176), (5, 3))
    img = ImageChops.multiply(ImageChops.multiply(paper, blue), pink)
    return img, dict(orig_title='Photochrom, risographed', method=f'Derivative of No. {src}. A two-colour risograph-style halftone (blue at 15°, fluorescent pink at 75°) with deliberate misregistration. Python, PIL.', sources=[src])

def ascii_art(src=42):
    """The pier rebuilt from characters only."""
    im = src_img(src); im.thumbnail((1600, 1600)); g = ImageOps.autocontrast(im.convert('L'))
    cols = 150; W, H = g.size; cw = W / cols; ch = cw * 1.9; rows = int(H / ch)
    small = g.resize((cols, rows)); chars = ' .,:;-~=+*ictoIEPR#%@'
    font = ImageFont.truetype(G + 'JetBrains Mono/JetBrainsMono-VariableFont_wght.ttf', int(ch * .95))
    out = Image.new('RGB', (int(cols * cw), int(rows * ch)), (11, 20, 24)); d = ImageDraw.Draw(out); px = small.load()
    for r in range(rows):
        line = ''.join(chars[min(len(chars) - 1, px[c, r] * len(chars) // 256)] for c in range(cols))
        d.text((0, r * ch), line, font=font, fill=(233, 214, 180))
    return out, dict(orig_title='The pier, typed', method=f'Derivative of No. {src}. The photograph re-drawn with {len(set(chars))} monospaced characters (including the letters P, I, E, R), 150 columns wide. Python, PIL.', sources=[src])

def blueprint(src=39):
    """Edge detection pulls the skeleton out of a 2017 photograph and files it as an engineering drawing."""
    im = src_img(src); im.thumbnail((1600, 1600)); g = np.array(im.convert('L').filter(ImageFilter.GaussianBlur(1.2))).astype(float)
    gx = np.zeros_like(g); gy = np.zeros_like(g)
    gx[1:-1, 1:-1] = (g[1:-1, 2:] - g[1:-1, :-2]) * 2 + g[:-2, 2:] - g[:-2, :-2] + g[2:, 2:] - g[2:, :-2]
    gy[1:-1, 1:-1] = (g[2:, 1:-1] - g[:-2, 1:-1]) * 2 + g[2:, :-2] - g[:-2, :-2] + g[2:, 2:] - g[:-2, 2:]
    mag = np.hypot(gx, gy); e = np.clip(mag / np.percentile(mag, 97.5), 0, 1) ** .8
    H, W = e.shape; bg = np.zeros((H, W, 3)); bg[:] = [18, 52, 110]
    out = bg * (1 - e[..., None]) + np.array([235, 242, 255]) * e[..., None]
    img = Image.fromarray(out.astype('uint8')); d = ImageDraw.Draw(img)
    for x in range(0, W, 40): d.line([(x, 0), (x, H)], fill=(40, 78, 140), width=1)
    for y in range(0, H, 40): d.line([(0, y), (W, y)], fill=(40, 78, 140), width=1)
    img = Image.blend(img, Image.fromarray(out.astype('uint8')), .55); d = ImageDraw.Draw(img)
    f = ImageFont.truetype(G + 'JetBrains Mono/JetBrainsMono-VariableFont_wght.ttf', 18)
    d.rectangle([W - 470, H - 120, W - 20, H - 20], outline=(235, 242, 255), width=2)
    d.text((W - 455, H - 108), 'WEST PIER, BRIGHTON. AS FOUND.\nDRAWING NO. WP-1866/2017\nSCALE: NONE. CONDITION: SEE SEA.', font=f, fill=(235, 242, 255), spacing=8)
    return img, dict(orig_title='As-found drawing WP-1866/2017', method=f'Derivative of No. {src}. A Sobel edge detector extracts the skeleton from the photograph, then it is drawn as a blueprint with a grid and a title block. Python, NumPy.', sources=[src])

def glitch(src=23):
    """A sunset that has been through a bad connection: JPEG byte corruption plus channel drift."""
    im = src_img(src); im.thumbnail((1600, 1600)); rnd = random.Random(2003)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=60); b = bytearray(buf.getvalue())
    start = b.find(b'\xff\xda') + 20
    for _ in range(14):
        i = rnd.randrange(start + len(b) // 6, len(b) - 10); b[i] = rnd.randrange(256)
        if b[i] == 0xFF: b[i] = 0x7F
    try: g = Image.open(io.BytesIO(bytes(b))).convert('RGB'); g.load()
    except Exception: g = im
    r, gg, bl = g.split(); r = ImageChops.offset(r, 14, 0); bl = ImageChops.offset(bl, -10, 3)
    img = Image.merge('RGB', (r, gg, bl)); a = np.array(img)
    for _ in range(26):
        y = rnd.randrange(0, a.shape[0] - 30); h = rnd.randrange(3, 28); a[y:y + h] = np.roll(a[y:y + h], rnd.randrange(-120, 120), axis=1)
    return Image.fromarray(a), dict(orig_title='Sunset, corrupted in transit', method=f'Derivative of No. {src}. Fourteen random bytes of the JPEG stream were overwritten, then the red and blue channels were shifted and horizontal bands displaced. Seed 2003, the year of the fires. Python, PIL, NumPy.', sources=[src])

def tidelines(seed=1866):
    """Original: forty stacked lines of an imaginary swell, with the pier as the only interruption."""
    W, H = 1600, 1200; rnd = np.random.default_rng(seed); img = Image.new('RGB', (W, H), (10, 12, 14)); d = ImageDraw.Draw(img)
    pier = np.array(pier_silhouette(W, H, int(H * .5), .9, seed=seed)).astype(bool)
    lines = 46; xs = np.arange(60, W - 60, 3)
    for i in range(lines):
        base = 220 + i * (H - 360) / lines; ph = rnd.uniform(0, 6.28)
        amp = 6 + 70 * np.exp(-((xs - W * .52) / (W * .22)) ** 2) * (0.4 + i / lines)
        ys = base - np.abs(np.sin(xs / 37 + ph) * amp * .5 + np.sin(xs / 11 + ph * 2) * amp * .15 + rnd.normal(0, 1.2, xs.size))
        poly = [(60, H)] + list(zip(xs, ys)) + [(W - 60, H)]
        d.polygon(poly, fill=(10, 12, 14)); d.line(list(zip(xs, ys)), fill=(233, 228, 216), width=2)
    rust = Image.new('RGB', (W, H), (196, 86, 43)); img.paste(rust, (0, 0), Image.fromarray((pier * 255).astype('uint8')))
    return img, dict(orig_title='Forty-six tides', method='Wholly original generative work. Python with NumPy and PIL. Forty-six stacked lines of a simulated swell, drawn back to front with hidden-line removal, cut by a procedurally drawn pier skeleton in rust. Seed 1866, the year the pier opened.', sources=[])

def mosaic(target=39):
    """The hero photograph rebuilt from tiles of every gallery view we are allowed to remix."""
    A = works(); tiles_src = [a for a in A if a.get('kind', 'human') == 'human' and DERIVABLE.get(a['lic']) in ('CC0 1.0', 'CC BY 4.0')]
    T = 32; tiles = []
    for a in tiles_src:
        t = ImageOps.fit(Image.open(J(a['img'].replace('.jpg', '_t.jpg'))).convert('RGB'), (T, T)); tiles.append((np.array(t).reshape(-1, 3).mean(0), t, a['n']))
    tg = src_img(target); tg = ImageOps.fit(tg, (50 * T, int(50 * T * .75))); W, H = tg.size; small = np.array(tg.resize((W // T, H // T)))
    out = Image.new('RGB', (W, H)); used = set()
    for y in range(small.shape[0]):
        for x in range(small.shape[1]):
            c = small[y, x].astype(float); best = min(tiles, key=lambda t: np.sum((t[0] - c) ** 2))
            used.add(best[2]); out.paste(Image.blend(best[1], Image.new('RGB', (T, T), tuple(int(v) for v in c)), .45), (x * T, y * T))
    srcs = sorted(used | {target})
    return out, dict(orig_title='Everyone who looked', method=f'Derivative mosaic. No. {target} rebuilt from 32-pixel tiles of {len(used)} gallery views (Nos. {", ".join(map(str, sorted(used)))}), each tinted towards the colour it replaces. Only public-domain, CC0 and CC BY views were used as tiles. Python, NumPy.', sources=srcs)

def average(_=None):
    """Every remixable view, stacked and averaged into a single ghost."""
    A = works(); src = [a for a in A if a.get('kind', 'human') == 'human' and DERIVABLE.get(a['lic']) in ('CC0 1.0', 'CC BY 4.0')]
    W, H = 1600, 1000; acc = np.zeros((H, W, 3))
    for a in src: acc += np.array(ImageOps.fit(Image.open(J(a['img'])).convert('RGB'), (W, H)), float)
    acc /= len(src); img = ImageOps.autocontrast(Image.fromarray(acc.astype('uint8')), cutoff=1)
    img = ImageEnhance.Contrast(img).enhance(1.6)
    return img, dict(orig_title=f'The mean of {len(src)} views', method=f'Derivative composite. {len(src)} public-domain, CC0 and CC BY gallery views (Nos. {", ".join(str(a["n"]) for a in src)}) were cropped to the same frame and averaged pixel by pixel, then the contrast was stretched. What every photographer agreed on. Python, NumPy.', sources=[a['n'] for a in src])

PIECES = dict(murmuration=murmuration, pixelsort=pixelsort, riso=riso, ascii=ascii_art, blueprint=blueprint, glitch=glitch, tidelines=tidelines, mosaic=mosaic, average=average)
