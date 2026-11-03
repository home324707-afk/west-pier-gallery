"""A small hand-drawn-line engine: wobbling, overshooting, multi-pass strokes of varying pressure,
filled as single polygons (no beads) into A8 layers, then broken up by a paper-tooth field."""
import numpy as np, math
import cairocffi as cairo

class Layer:
    def __init__(self, W, H):
        self.W, self.H = W, H
        self.surf = cairo.ImageSurface(cairo.FORMAT_A8, W, H)
        self.ctx = cairo.Context(self.surf)
        self.ctx.set_antialias(cairo.ANTIALIAS_BEST)
    def array(self):
        self.surf.flush()
        buf = np.frombuffer(self.surf.get_data(), np.uint8).reshape(self.H, self.surf.get_stride())[:, :self.W]
        return buf.astype(np.float32) / 255.0

def _smooth_noise(rng, n, step):
    """n samples of smooth 1D noise (cubic through random knots every `step` samples), range ~[-1,1]."""
    k = max(6, int(n / step) + 6)
    knots = rng.uniform(-1, 1, k)
    x = np.linspace(0, k - 4.001, n) + 1
    i = np.floor(x).astype(int); t = x - i
    p0, p1, p2, p3 = knots[i - 1], knots[i], knots[i + 1], knots[i + 2]
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t ** 2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)

class Hand:
    def __init__(self, layers, seed=1, scale=1.0):
        self.L = layers; self.rng = np.random.default_rng(seed); self.s = scale

    def poly_stroke(self, layer, pts, widths, alpha):
        pts = np.asarray(pts, np.float64); widths = np.asarray(widths, np.float64)
        d = np.gradient(pts, axis=0); nrm = np.stack([-d[:, 1], d[:, 0]], 1)
        nl = np.linalg.norm(nrm, axis=1, keepdims=True); nl[nl == 0] = 1; nrm /= nl
        left = pts + nrm * widths[:, None] / 2; right = pts - nrm * widths[:, None] / 2
        c = self.L[layer].ctx; c.set_source_rgba(0, 0, 0, alpha)
        c.move_to(*left[0])
        for p in left[1:]: c.line_to(*p)
        # rounded tip
        for p in right[::-1]: c.line_to(*p)
        c.close_path(); c.fill()

    def path(self, pts, layer='ink', w=3.0, alpha=0.9, wobble=1.4, press=0.35, step=9, passes=1, spread=1.3, taper=True, over=0.0):
        """pts: control polyline (resampled and hand-wobbled)."""
        rng = self.rng; s = self.s
        pts = np.asarray(pts, np.float64)
        seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); Ltot = seg.sum()
        if Ltot < 0.5: return
        for ps in range(passes):
            n = max(3, int(Ltot / (step * s)))
            cum = np.concatenate([[0], np.cumsum(seg)]); tt = np.linspace(0, Ltot, n)
            x = np.interp(tt, cum, pts[:, 0]); y = np.interp(tt, cum, pts[:, 1])
            q = np.stack([x, y], 1)
            # extend ends a little (overshoot), jitter ends
            if over:
                d0 = q[1] - q[0]; d1 = q[-1] - q[-2]
                d0 /= (np.linalg.norm(d0) + 1e-9); d1 /= (np.linalg.norm(d1) + 1e-9)
                o0 = rng.uniform(-0.4, 1.0) * over * s; o1 = rng.uniform(-0.4, 1.0) * over * s
                q[0] = q[0] - d0 * o0; q[-1] = q[-1] + d1 * o1
            d = np.gradient(q, axis=0); nl = np.linalg.norm(d, axis=1, keepdims=True); nl[nl == 0] = 1
            nrm = np.stack([-d[:, 1], d[:, 0]], 1) / nl
            off = _smooth_noise(rng, n, 7) * wobble * s + _smooth_noise(rng, n, 2.5) * wobble * 0.22 * s
            off += rng.uniform(-1, 1) * spread * s * (1 if passes > 1 else 0.4)
            tan = _smooth_noise(rng, n, 9) * wobble * 0.5 * s
            q = q + nrm * off[:, None] + (d / nl) * tan[:, None]
            t = np.linspace(0, 1, n)
            p = 0.62 + 0.38 * np.sin(np.pi * t) ** 0.6 if taper else np.ones(n)
            p = p * (1 + press * _smooth_noise(rng, n, 4) * 0.9)
            p = np.clip(p, 0.25, 1.4)
            if taper:
                p[0] *= 0.55; p[-1] *= 0.45
            wv = w * s * p * (0.9 if ps else 1.0)
            self.poly_stroke(layer, q, wv, alpha * (0.78 if ps else 1.0) * rng.uniform(0.62, 1.0))

    def line(self, a, b, **kw): self.path([a, b], **kw)

    def arc(self, cx, cy, rx, ry, a0, a1, **kw):
        n = max(6, int(abs(a1 - a0) * max(rx, ry) / 14))
        th = np.linspace(a0, a1, n)
        self.path(np.stack([cx + rx * np.cos(th), cy - ry * np.sin(th)], 1), **kw)

    def hatch(self, rect, angle_deg, gap, layer='graphite', w=1.6, alpha=0.55, jitter=0.9, wobble=0.6, keep=1.0, **kw):
        x0, y0, x1, y1 = rect; rng = self.rng; s = self.s
        a = math.radians(angle_deg); dx, dy = math.cos(a), -math.sin(a)
        diag = math.hypot(x1 - x0, y1 - y0); nx, ny = -dy, dx
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        m = int(diag / (gap * s)) + 2
        for i in range(-m, m + 1):
            if rng.random() > keep: continue
            off = i * gap * s + rng.uniform(-jitter, jitter) * s
            px, py = cx + nx * off, cy + ny * off
            # clip line p + t*(dx,dy) to rect
            ts = []
            for (lo, hi, p0_, dd) in ((x0, x1, px, dx), (y0, y1, py, dy)):
                if abs(dd) < 1e-9:
                    if p0_ < lo or p0_ > hi: ts = None; break
                else:
                    t1, t2 = (lo - p0_) / dd, (hi - p0_) / dd; ts.append((min(t1, t2), max(t1, t2)))
            if ts is None: continue
            ta = max(t[0] for t in ts); tb = min(t[1] for t in ts)
            if tb - ta < 4 * s: continue
            ta += rng.uniform(0, 5) * s; tb -= rng.uniform(0, 5) * s
            self.path([(px + dx * ta, py + dy * ta), (px + dx * tb, py + dy * tb)], layer=layer, w=w, alpha=alpha, wobble=wobble, **kw)

def tooth(H, W, seed=7):
    """Paper tooth in [0,1]: fine random + faint woven streak."""
    rng = np.random.default_rng(seed)
    a = rng.random((H, W)).astype(np.float32)
    f = np.fft.rfft2(a); fy = np.fft.fftfreq(H)[:, None]; fx = np.fft.rfftfreq(W)[None, :]
    g = np.exp(-(fx ** 2 + fy ** 2) / (2 * 0.16 ** 2)); b = np.fft.irfft2(f * g, s=(H, W)).astype(np.float32)
    b = (b - b.mean()) / (b.std() + 1e-9)
    return np.clip(0.5 + 0.40 * b, 0, 1)

def composite(base, layers_rgb, th):
    """layers_rgb: list of (alpha array, colour, grit) back to front. Alpha is broken by the tooth: grit 0 = solid ink, 1 = chalky pencil."""
    out = base.copy()
    for A, col, grit in layers_rgb:
        thr = th * grit
        e = np.clip((A * 1.15 - thr * 1.05 * (1.0 - 0.45 * A)) / 0.55, 0, 1) * np.minimum(1, A * 1.6) ** 0.5
        e = np.clip(e, 0, 1)[..., None]
        out = out * (1 - e) + np.array(col, np.float32)[None, None, :] * e
    return out

def blur(a, sigma):
    H, W = a.shape
    f = np.fft.rfft2(a); fy = np.fft.fftfreq(H)[:, None]; fx = np.fft.rfftfreq(W)[None, :]
    g = np.exp(-2 * (np.pi * sigma) ** 2 * (fx ** 2 + fy ** 2))
    return np.fft.irfft2(f * g, s=(H, W)).astype(np.float32)

def smudge(base, A, col=(0.03, 0.05, 0.10), dx=6, dy=8):
    """Soft graphite rubbed off the line work: a small offset blur and a broad, faint haze."""
    A = np.clip(A, 0, 1)
    s1 = np.roll(np.roll(blur(A, 5.0), dy, 0), dx, 1) * 0.55
    s2 = blur(A, 26.0) * 1.6
    e = np.clip(s1 * 0.30 + s2 * 0.20, 0, 0.5)[..., None]
    return base * (1 - e) + np.array(col, np.float32)[None, None, :] * e
