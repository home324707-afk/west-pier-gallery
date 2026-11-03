"""Abstract seascape from formulae only: fbm sky, superposed-wave sea in perspective. numpy, no images in."""
import numpy as np

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def fbm(shape, seed, octaves=7, base=4.0, lac=2.0, gain=0.5, aniso=(1.0, 1.0)):
    """Fractal noise by FFT-filtered white noise (spectral synthesis); anisotropic stretch for streaked cloud."""
    rng = np.random.default_rng(seed)
    h, w = shape
    fy = np.fft.fftfreq(h)[:, None] * h / aniso[1]
    fx = np.fft.fftfreq(w)[None, :] * w / aniso[0]
    r = np.sqrt(fx ** 2 + fy ** 2); r[0, 0] = 1
    spec = (np.fft.fft2(rng.standard_normal((h, w))))
    amp = (r / base) ** (-1.55) * np.exp(-(r / (base * lac ** octaves)) ** 2)
    amp[0, 0] = 0
    out = np.real(np.fft.ifft2(spec * amp))
    out -= out.mean(); out /= out.std() + 1e-9
    return out.astype(np.float32)

PRU = np.array([0.020, 0.075, 0.135])   # Prussian
NAVY = np.array([0.045, 0.105, 0.190])
STORM = np.array([0.36, 0.42, 0.48])    # storm grey
MIST = np.array([0.74, 0.76, 0.76])
IVORY = np.array([0.96, 0.93, 0.84])

def sky_color(el, wob):
    """el: elevation 0 (horizon) .. 1 (zenith). wob: cloud field (any shape like el)."""
    t = np.clip(el, 0, 1) ** 0.62
    t = np.clip(t + 0.10 * wob * (0.4 + t), 0, 1)
    c0 = MIST[None, None, :] * np.ones(el.shape + (1,))
    stops = [(0.0, np.array([0.90, 0.88, 0.80])), (0.10, MIST), (0.40, STORM), (0.75, np.array([0.12, 0.20, 0.29])), (1.0, PRU)]
    out = np.zeros(el.shape + (3,), np.float32)
    for (a, ca), (b, cb) in zip(stops[:-1], stops[1:]):
        m = (t >= a) & (t <= b); f = ((t - a) / (b - a))[m][:, None]
        f = f * f * (3 - 2 * f)
        out[m] = ca * (1 - f) + cb * f
    return out

def render(W, H, horizon=0.50, seed=315, bank_x=0.5):
    rng = np.random.default_rng(seed)
    yh = int(H * horizon)
    img = np.zeros((H, W, 3), np.float32)
    # ---- sky: gradient + streaked, domain-warped cloud field
    n1 = fbm((yh, W), seed, base=3, aniso=(5.0, 1.0)); n2 = fbm((yh, W), seed + 1, base=6, aniso=(3.0, 1.0))
    wob = 0.75 * n1 + 0.45 * n2
    yy = np.arange(yh)[:, None] * np.ones((1, W))
    el = (yh - yy) / yh
    # clouds thicken toward the zenith, a thin clear slot of light at the horizon
    sky = sky_color(el, wob * smooth(0.0, 0.5, el) * 1.15)
    slot = np.exp(-((el - 0.015) / 0.035) ** 2)[..., None]
    xs = np.arange(W)[None, :] / W
    glow = np.exp(-((xs - 0.62) / 0.28) ** 2)[..., None]
    sky = sky * (1 - 0.55 * slot * glow) + 0.55 * slot * glow * np.array([0.98, 0.93, 0.80])
    # a luminous bank of mist behind the middle distance, where the eye (and the pier) will rest
    yy2 = np.arange(yh)[:, None]; xx2 = np.arange(W)[None, :]
    bank = np.exp(-(((xx2 - bank_x * W) / (0.34 * W)) ** 2 + ((yy2 - (yh - 0.16 * H)) / (0.17 * H)) ** 2))[..., None]
    sky = sky * (1 - 0.62 * bank) + 0.62 * bank * np.array([0.70, 0.74, 0.76])
    sky = np.clip(sky, 0, 1)
    img[:yh] = sky
    # ---- sea: perspective ground plane, superposed sine/Gerstner-like swell, slopes -> mirrored sky + Fresnel
    hs = H - yh
    ys = np.arange(1, hs + 1, dtype=np.float32)[:, None]
    xp = (np.arange(W, dtype=np.float32)[None, :] - W / 2)
    cam, f = 7.0, 1.55 * W
    z = cam * f / ys                       # depth along ground (m)
    x = xp * z / f                         # lateral (m)
    pix = z / f * (1.0)                    # metres per pixel across
    pixz = z * z / (cam * f)               # metres per pixel in depth
    nw = 46
    wind = np.deg2rad(4)
    hgt = np.zeros((hs, W), np.float32); gx = np.zeros_like(hgt); gz = np.zeros_like(hgt)
    for i in range(nw):
        u = (i + rng.random()) / nw
        lam = 4.0 * (90.0 / 4.0) ** (u ** 0.7) * (1 + 0.5 * rng.random())      # ~3 m .. 90 m, long ones well represented
        ang = wind + rng.normal(0, np.deg2rad(11 if lam > 12 else 30))
        k = 2 * np.pi / lam
        slope = (0.07 + 0.07 * smooth(14, 50, lam)) * (1.0 if lam > 16 else (lam / 16.0) ** 1.7)          # steepness falls for the short chop
        a = slope / k * (0.55 + 0.9 * rng.random())
        fade = smooth(1.2, 3.0, lam / np.maximum(pix * 1.5, pixz * 1.5))   # alias guard
        ph = rng.random() * 2 * np.pi
        kx, kz = k * np.cos(ang), k * np.sin(ang)
        th = kx * x + kz * z + ph
        s_, c_ = np.sin(th), np.cos(th)
        hh = a * fade * (s_ + 0.34 * np.sin(2 * th + 0.8))
        dh = a * fade * (c_ + 0.68 * np.cos(2 * th + 0.8))
        hgt += hh; gx += dh * kx; gz += dh * kz
    # normal; reflect view ray
    nx, nz = -gx, -gz
    ny = np.ones_like(nx); nl = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2); nx /= nl; ny /= nl; nz /= nl
    vx = x / np.sqrt(x ** 2 + z ** 2 + cam ** 2); vz = z / np.sqrt(x ** 2 + z ** 2 + cam ** 2); vy = -cam / np.sqrt(x ** 2 + z ** 2 + cam ** 2)
    d = vx * nx + vy * ny + vz * nz
    rx, ry, rz = vx - 2 * d * nx, vy - 2 * d * ny, vz - 2 * d * nz
    ry = np.abs(ry)
    rel = np.clip(np.arcsin(np.clip(ry, 0, 1)) / (np.pi / 2), 0, 1)       # elevation of reflected ray
    # sample the same sky (without cloud detail, plus coarse cloud by direction)
    nf = fbm((hs, W), seed + 7, base=5, aniso=(2.0, 1.0))
    rsky = sky_color(rel ** 1.0, 0.0 * nf)
    # glow slot reflected, azimuth-dependent
    az = np.clip(0.5 + 0.5 * (rx / np.maximum(np.abs(rz) + 0.1, 0.1)) * 0.5, 0, 1)
    gl = np.exp(-((az - 0.62) / 0.28) ** 2)[..., None] * np.exp(-((rel - 0.015) / 0.04) ** 2)[..., None]
    rsky = rsky * (1 - 0.55 * gl) + 0.55 * gl * np.array([0.98, 0.93, 0.80])
    cosv = np.clip(-(vy * ny), 0, 1)
    fres = 0.02 + 0.98 * (1 - cosv) ** 5
    fres = np.clip(fres * 1.5, 0, 1) * (0.30 + 0.70 * (1 - smooth(0.0, 1.0, ys / hs) ** 0.8)); fres = fres[..., None]
    hn = hgt / (hgt.std() * 3 + 1e-6)
    deep = NAVY[None, None, :] * (0.30 + 1.1 * np.clip(0.5 + hn, 0, 1)[..., None])
    sss = np.array([0.03, 0.11, 0.16])[None, None, :] * (smooth(0.0, 0.8, hn) * 0.9)[..., None]
    sea = deep + sss + rsky * fres * 0.95
    # foam: crests whose slope is steep, broken by noise, thin lace in the middle distance only
    steep = np.sqrt(gx ** 2 + gz ** 2)
    fn = fbm((hs, W), seed + 11, base=40, aniso=(1.0, 0.5))
    foam = smooth(0.30, 0.62, steep * 0.9 + 0.12 * fn + 0.20 * (hgt / (np.abs(hgt).max() + 1e-6))) * smooth(4, 40, ys)[..., 0:1] * 0
    foam = smooth(0.50, 0.95, 0.7 * np.clip(hgt / (hgt.std() * 3 + 1e-6), -1, 1) + 0.28 * fn + 0.4 * steep) * smooth(8, 90, ys)
    sea = sea + (foam ** 6)[..., None] * np.array([0.52, 0.56, 0.58]) * 0.0
    # horizon haze
    haze = np.exp(-ys / (0.07 * hs))[..., None]
    sea = sea * (1 - 0.8 * haze) + 0.8 * haze * np.array([0.60, 0.64, 0.66])
    img[yh:] = np.clip(sea, 0, 1)
    # soften the seam
    img[yh - 2:yh + 2] = img[yh - 2:yh + 2].mean(axis=0, keepdims=True) * 0.5 + img[yh - 2:yh + 2] * 0.5
    return img, yh

def tone(img, seed=315):
    """Filmic-ish curve, vignette and a fine tooth so it prints like a wash on paper."""
    H, W, _ = img.shape
    g = np.clip(img, 0, 1)
    g = g ** 0.92
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    v = 1 - 0.34 * ((xx / W - 0.5) ** 2 * 1.6 + (yy / H - 0.5) ** 2 * 1.3)
    g = g * v[..., None]
    rng = np.random.default_rng(seed + 99)
    grain = rng.standard_normal((H, W)).astype(np.float32) * 0.012
    return np.clip(g + grain[..., None], 0, 1)
