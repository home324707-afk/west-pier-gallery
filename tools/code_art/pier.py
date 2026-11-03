"""The West Pier ruin as it stands: the skeletal iron frame of the concert hall on its legs in the sea,
open to the sky (no roof, no dome, no glazing), with the pier head stub, wreckage and isolated piles; nothing joins the shore.
All geometry is written here as numbers, drawn with pencil.Hand."""
import numpy as np, math

def draw(h, cx, yw, S=1.0):
    rng = h.rng
    U = lambda u, v: (cx + u * S, yw - v * S)
    P = lambda u, v: U(u, v)
    R = lambda a, b: rng.uniform(a, b)

    DECK_B, DECK_T = 150, 188            # underside and top of the deck girders
    HALL_L, HALL_R = -300, 340           # concert hall frame, 9 bays
    NB = 14; bay = (HALL_R - HALL_L) / NB
    colx = [HALL_L + i * bay for i in range(NB + 1)]
    G1, G2 = DECK_T + 85, DECK_T + 172  # gallery rail and eave beam (v)
    ARCH0 = G2

    # ------------- water line, laid in first as a loose guide
    for k in range(3):
        a = R(-1500, -1380); b = R(1180, 1300)
        h.line(P(a, -k * 3), P(b, -k * 3 + R(-1, 1)), layer='guide', w=2.2, alpha=0.30, wobble=1.0, passes=1, step=30)

    # ------------- legs: back row (fainter, set further off), then front row
    pile_u = [u for u in np.arange(-1130, 1010, 71.0)]
    gone_back = set(rng.choice(len(pile_u), 6, replace=False).tolist())
    for i, u in enumerate(pile_u):
        if i in gone_back: continue
        u2 = u + 34 + R(-4, 4); vb = 30
        top = DECK_B + R(-2, 3)
        for dx in (-5, 5):
            h.line(P(u2 + dx, vb), P(u2 + dx * 0.9, top), layer='graphite', w=2.0, alpha=0.5, wobble=0.9, passes=1, step=18)
        if rng.random() < 0.6:
            vv = vb + R(35, 60)
            h.line(P(u2 - 35, vv), P(u2 + 36, vv + R(-2, 3)), layer='graphite', w=1.6, alpha=0.4, wobble=0.8, over=4)
    # front legs: pairs of edge lines, taper outwards at the foot, with collar bands
    missing_front = set([3, 4, 5, 14, 15, 16, 29, 30])
    for i, u in enumerate(pile_u):
        if i in missing_front and rng.random() < 0.7: continue
        top = DECK_B + R(-2, 2)
        wid = 8.5 + R(-0.8, 0.8)
        for dx in (-wid / 2, wid / 2):
            foot = dx * 1.18
            h.line(P(u + foot, -2), P(u + dx, top), layer='ink', w=3.0, alpha=0.88, wobble=1.1, passes=2 if rng.random() < 0.5 else 1, spread=1.0, step=16)
        for vv in (R(36, 46), R(98, 108)):
            h.line(P(u - wid / 2 - 2, vv), P(u + wid / 2 + 2, vv + R(-1, 2)), layer='graphite', w=2.0, alpha=0.6, wobble=0.5, step=10)
    # ties and X-braces between neighbouring legs
    for i in range(len(pile_u) - 1):
        u0, u1 = pile_u[i], pile_u[i + 1]
        if i in missing_front or (i + 1) in missing_front: continue
        for vv in (42, 102):
            if rng.random() < 0.82:
                h.line(P(u0 + 4, vv + R(-2, 2)), P(u1 - 4, vv + R(-2, 2)), layer='ink', w=2.2, alpha=0.8, wobble=1.0, step=14, over=3)
        if rng.random() < 0.62:
            h.line(P(u0 + 4, 42), P(u1 - 4, 102), layer='ink', w=1.8, alpha=0.75, wobble=1.0, step=14, over=2)
            if rng.random() < 0.6:
                h.line(P(u0 + 4, 102), P(u1 - 4, 42), layer='ink', w=1.8, alpha=0.75, wobble=1.0, step=14, over=2)
        # top diagonal knees under the girder
        if rng.random() < 0.5:
            h.line(P(u0 + 4, DECK_B - 24), P(u0 + 30, DECK_B), layer='graphite', w=1.7, alpha=0.7, wobble=0.6, step=10)

    # ------------- deck girders (a Warren truss band), with the broken stretches
    spans = [(-1130, -790), (-720, -330), (-260, 1000)]
    for (a, b) in spans:
        for vv, w_ in ((DECK_B, 3.0), (DECK_T, 3.4), (DECK_T - 7, 1.6)):
            h.line(P(a, vv + R(-1, 1)), P(b, vv + R(-1, 1)), layer='ink', w=w_, alpha=0.9, wobble=1.3, step=22, passes=2, spread=1.4, over=6)
        n = int((b - a) / 38)
        for j in range(n):
            u0 = a + j * 38; u1 = u0 + 38
            if rng.random() < 0.92:
                if j % 2 == 0: h.line(P(u0, DECK_B), P(u1, DECK_T), layer='graphite', w=1.8, alpha=0.78, wobble=0.7, step=12)
                else: h.line(P(u0, DECK_T), P(u1, DECK_B), layer='graphite', w=1.8, alpha=0.78, wobble=0.7, step=12)
        # little verticals every 4 bays
        for j in range(0, n, 2):
            h.line(P(a + j * 38, DECK_B), P(a + j * 38, DECK_T), layer='graphite', w=1.5, alpha=0.6, wobble=0.5, step=10)
    # girder ends dropping away into the sea at each break
    for (u, d, ln) in ((-1130, -1, 90), (-790, 1, 90), (-720, -1, 110), (-330, 1, 130), (-260, -1, 80), (1000, 1, 110)):
        pts = [P(u, DECK_T), P(u + d * ln * 0.45, DECK_T - ln * 0.18), P(u + d * ln * 0.8, DECK_T - ln * 0.65), P(u + d * ln, DECK_T - ln * 1.0)]
        h.path(pts, layer='ink', w=3.0, alpha=0.88, wobble=1.4, step=14)
        pts = [P(u, DECK_B), P(u + d * ln * 0.4, DECK_B - ln * 0.2), P(u + d * ln * 0.7, DECK_B - ln * 0.6)]
        h.path(pts, layer='ink', w=2.4, alpha=0.8, wobble=1.4, step=14)

    # ------------- the concert hall frame (drawn twice: the rear plane, lighter and offset, then the front)
    def hall(du, dv, front):
        lay = 'ink' if front else 'graphite'
        am = 1.0 if front else 0.55
        wm = 1.0 if front else 0.78
        keep = 1.0 if front else 0.62
        Q = lambda u, v: P(u + du, v + dv)
        def L(a_, b_, w, alpha, **kw):
            if rng.random() > keep: return
            h.line(a_, b_, layer=kw.pop('layer', lay), w=w * wm, alpha=alpha * am, **kw)
        def Arc(ux, vy, rx_, ry_, t0, t1, w, alpha, **kw):
            if rng.random() > keep and not front: return
            h.arc(cx + (ux + du) * S, yw - (vy + dv) * S, rx_ * S, ry_ * S, t0, t1, layer=kw.pop('layer', lay), w=w * wm, alpha=alpha * am, **kw)
        tops = []
        for i, u in enumerate(colx):
            top = G2 + (R(-9, 7) if 0 < i < NB else R(10, 30))
            tops.append(top)
            for dx in (-4.5, 4.5):
                L(Q(u + dx, DECK_T), Q(u + dx * 0.95 + R(-5, 5), top), 3.4, 0.9, wobble=1.3, step=18, passes=2 if (front and rng.random() < 0.6) else 1, spread=1.1)
            L(Q(u - 10, DECK_T + 3), Q(u + 10, DECK_T + 3), 2.2, 0.7, layer='graphite', wobble=0.5, step=8)
            L(Q(u - 9, top - 2), Q(u + 9, top - 2), 2.0, 0.7, layer='graphite', wobble=0.5, step=8)
        for (vv, w_) in ((G1, 2.8), (G1 - 14, 1.8)):
            for i in range(NB):
                L(Q(colx[i] + 4, vv + R(-1.5, 1.5)), Q(colx[i + 1] - 4, vv + R(-1.5, 1.5)), w_, 0.85, wobble=1.2, step=14, over=4)
        for i in range(NB):
            n = int(bay / 10)
            for j in range(1, n):
                if rng.random() < 0.72 and front:
                    uu = colx[i] + j * bay / n
                    h.line(Q(uu, G1 - 14), Q(uu, G1), layer='graphite', w=1.3, alpha=0.6, wobble=0.4, step=6, taper=False)
        for (vv, w_) in ((G2 - 2, 3.0), (G2 - 16, 2.0)):
            for i in range(NB):
                if i == 9 and vv == G2 - 2: continue
                L(Q(colx[i] + 4, vv + R(-2, 2)), Q(colx[i + 1] - 4, vv + R(-2, 2)), w_, 0.88, wobble=1.3, step=14, over=4)
        for i in range(NB):
            if rng.random() < 0.6:
                L(Q(colx[i] + 5, DECK_T + 4), Q(colx[i + 1] - 5, G1 - 14), 1.9, 0.7, layer='graphite', wobble=1.0, step=12)
                if rng.random() < 0.55: L(Q(colx[i] + 5, G1 - 14), Q(colx[i + 1] - 5, DECK_T + 4), 1.9, 0.7, layer='graphite', wobble=1.0, step=12)
            if rng.random() < 0.55:
                L(Q(colx[i] + 5, G1 + 2), Q(colx[i + 1] - 5, G2 - 18), 1.8, 0.65, layer='graphite', wobble=1.0, step=12)
        # arched ribs: concentric pairs over each pair of bays, differing heights, a few broken
        hts = []
        for i in range(0, NB, 2):
            x0, x1 = colx[i] + 3, colx[min(i + 2, NB)] - 3; cxm = (x0 + x1) / 2; rx = (x1 - x0) / 2
            edge = i == 0 or i + 2 >= NB
            ht = (R(84, 122) if not edge else R(58, 86)) * (1 if front else R(0.92, 1.08))
            hts.append((cxm, rx, ht))
            a_end = math.pi; a_st = 0.0
            if i == 2: a_end = R(1.5, 1.9)
            if i == 8: a_st = R(1.3, 1.7)
            if i == 4: a_end = R(2.3, 2.6)
            for (inset, w_) in ((0.0, 3.0), (6.0, 2.0)):
                Arc(cxm, ARCH0 + R(-3, 3), rx - inset, ht - inset, a_st, a_end, w_, 0.88, wobble=1.3, step=16, spread=0.9)
        for i in range(len(hts) - 1):
            for tfrac in (0.30, 0.62):
                if rng.random() < 0.8:
                    ca, ra, ha = hts[i]; cb, rb, hb = hts[i + 1]
                    ya = ha * tfrac; yb = hb * tfrac
                    xa = ca + ra * math.sqrt(max(0, 1 - (ya / ha) ** 2)); xb = cb - rb * math.sqrt(max(0, 1 - (yb / hb) ** 2))
                    L(Q(xa, ARCH0 + ya), Q(xb, ARCH0 + yb), 1.7, 0.7, layer='graphite', wobble=0.8, step=10)
        # larger sweep ribs over four bays, partly missing: they stand clear above the rest
        for i in (0, 4, 8, 10):
            x0, x1 = colx[i] + 3, colx[min(i + 4, NB)] - 3; cxm = (x0 + x1) / 2; rx = (x1 - x0) / 2
            base = ARCH0 + R(52, 70); ht = R(70, 100) * (0.8 if i == 10 else 1)
            a_end = math.pi if i != 8 else R(2.1, 2.5)
            Arc(cxm, base, rx, ht, 0.0, a_end, 2.9, 0.88, wobble=1.4, step=18, spread=0.8)
            Arc(cxm, base, rx - 8, ht - 8, 0.12, a_end - 0.08, 1.8, 0.7, layer='graphite', wobble=1.2, step=18)
        for i in range(NB):
            if i in (5, 11): continue
            L(Q(colx[i] + 2, ARCH0 + 50), Q(colx[i + 1] - 2, ARCH0 + 50 + R(-3, 4)), 1.9, 0.75, layer='graphite', wobble=1.0, step=12, over=5)
        for (a_, b_) in ((colx[0] + 10, colx[5]), (colx[8], colx[13] - 20)):
            L(Q(a_, ARCH0 + 128), Q(b_, ARCH0 + 128 + R(-4, 5)), 1.7, 0.6, layer='graphite', wobble=1.6, step=16, over=5)
        if front:
            h.path([Q(colx[9] + 3, ARCH0 + 100), Q(colx[9] + 18, ARCH0 + 92), Q(colx[9] + 26, ARCH0 + 64), Q(colx[9] + 24, ARCH0 + 36)], layer='ink', w=2.6, alpha=0.85, wobble=1.2, step=12)
            h.line(Q(colx[2] + 4, G2 - 4), Q(colx[2] - 44, G2 - 54), layer='ink', w=2.2, alpha=0.8, wobble=1.2, step=12)
            h.line(Q(colx[13] - 4, ARCH0 + 6), Q(colx[13] + 34, ARCH0 - 38), layer='ink', w=2.2, alpha=0.8, wobble=1.2, step=12)
    for vv in (G2 + 6, ARCH0 + 172, DECK_T + 4):
        h.line(P(HALL_L - R(30, 90), vv + R(-2, 2)), P(HALL_R + R(30, 90), vv + R(-2, 2)), layer='guide', w=2.0, alpha=0.30, wobble=1.0, step=26)
    for uu in (HALL_L, HALL_R):
        h.line(P(uu + R(-4, 4), DECK_T - 10), P(uu + R(-4, 4), ARCH0 + R(150, 200)), layer='guide', w=2.0, alpha=0.30, wobble=1.0, step=26)
    hall(46, 15, False)
    for i, u in enumerate(colx):
        if rng.random() < 0.8:
            h.hatch((cx + (u + 5) * S, yw - (G2 - 6) * S, cx + (u + 15) * S, yw - (DECK_T + 6) * S), 70, 5.0, layer='graphite', w=1.5, alpha=0.5, keep=0.8, wobble=0.5, step=10)
    # interior shade (hatch) on the hall's lower storey, then the front plane
    h.hatch((cx + (HALL_L + 8) * S, yw - (G1 - 16) * S, cx + (HALL_R - 8) * S, yw - (DECK_T + 8) * S), 62, 5.0, layer='graphite', w=1.7, alpha=0.62, keep=0.85, wobble=0.6, step=14)
    h.hatch((cx + (HALL_L + 8) * S, yw - (G1 - 16) * S, cx + (HALL_R - 8) * S, yw - (DECK_T + 8) * S), -48, 9.0, layer='graphite', w=1.5, alpha=0.5, keep=0.7, wobble=0.6, step=14)
    hall(0, 0, True)

    # ------------- pier head stub to the right: low frame, open, partly collapsed
    a0 = 440
    cols2 = [a0 + i * 31 for i in range(9)]
    hh2 = (112, 110, 116, 108, 112, 70, 112, 40, 96)
    for i, u in enumerate(cols2):
        top = DECK_T + hh2[i] + R(-4, 4)
        for dx in (-3.5, 3.5):
            h.line(P(u + dx, DECK_T), P(u + dx + R(-2, 2), top), layer='ink', w=2.8, alpha=0.88, wobble=1.0, step=16)
    for i in range(8):
        for vv in (52, 112):
            if vv == 112 and i in (5, 6): continue
            h.line(P(cols2[i] + 4, DECK_T + vv + R(-3, 3)), P(cols2[i + 1] - 4, DECK_T + vv + R(-3, 3)), layer='ink' if vv == 112 else 'graphite', w=2.4 if vv == 112 else 1.8, alpha=0.85 if vv == 112 else 0.7, wobble=1.0, step=12, over=3)
        if rng.random() < 0.6:
            h.line(P(cols2[i] + 4, DECK_T + 4), P(cols2[i + 1] - 4, DECK_T + 52), layer='graphite', w=1.7, alpha=0.65, wobble=0.8, step=10)
    for i in (0, 2, 4):
        h.arc(cx + (cols2[i] + 31) * S, yw - (DECK_T + 112) * S, 28 * S, R(26, 40) * S, 0.0, math.pi, layer='ink', w=2.3, alpha=0.85, wobble=1.0, step=14)
    h.hatch((cx + (cols2[0] + 6) * S, yw - (DECK_T + 104) * S, cx + (cols2[4]) * S, yw - (DECK_T + 6) * S), 62, 7.0, layer='graphite', w=1.5, alpha=0.45, keep=0.8, wobble=0.5, step=12)
    # far end: a lone short frame
    for u in (840, 884):
        h.line(P(u, DECK_T), P(u, DECK_T + 74 + R(-6, 6)), layer='ink', w=2.6, alpha=0.85, wobble=0.9, step=14)
    h.line(P(840, DECK_T + 70), P(884, DECK_T + 72), layer='graphite', w=1.9, alpha=0.75, wobble=0.8)
    h.line(P(840, DECK_T + 4), P(884, DECK_T + 40), layer='graphite', w=1.6, alpha=0.6, wobble=0.8)

    # ------------- wreckage on the left: tumbled girders in the water, leaning against the legs
    for k in range(15):
        u = R(-1010, -440); v = R(2, 70); ang = math.radians(R(-22, 22) if rng.random() < 0.75 else R(35, 62) * (1 if rng.random() < 0.5 else -1))
        ln = R(60, 190)
        if v + math.sin(ang) * ln < 2: ang = -ang
        a = P(u, v); b = P(u + math.cos(ang) * ln, v + math.sin(ang) * ln)
        h.line(a, b, layer='ink', w=R(2.2, 3.2), alpha=0.85, wobble=1.0, step=14, over=2)
        if rng.random() < 0.6:
            o = R(5, 9)
            h.line((a[0], a[1] + o), (b[0], b[1] + o), layer='graphite', w=1.6, alpha=0.6, wobble=0.9, step=14)
    # a bent truss, drooping from the broken girder end into the sea
    h.path([P(-790, DECK_T), P(-830, DECK_T - 40), P(-872, DECK_T - 112), P(-912, DECK_B - 140), P(-940, 4)], layer='ink', w=3.0, alpha=0.88, wobble=1.2, step=16)
    h.path([P(-784, DECK_B), P(-820, DECK_B - 40), P(-858, DECK_B - 118), P(-890, 2)], layer='graphite', w=2.0, alpha=0.7, wobble=1.2, step=16)

    # ------------- lone piles standing in the sea, tops sheared
    for (u, top, w_) in ((-1245, 262, 13), (-1214, 236, 12), (1108, 138, 11), (1160, 98, 10)):
        for dx in (-w_ / 2, w_ / 2):
            h.line(P(u + dx * 1.15, -3), P(u + dx, top + R(-8, 8)), layer='ink', w=3.2, alpha=0.9, wobble=1.0, step=18, passes=2, spread=1.1)
        # sheared top
        h.line(P(u - w_ / 2, top), P(u + w_ / 2, top + R(-12, 12)), layer='ink', w=2.4, alpha=0.85, wobble=0.5, step=10)
        for vv in (R(40, 60), R(110, 150)):
            if vv < top - 10:
                h.line(P(u - w_ / 2 - 2, vv), P(u + w_ / 2 + 2, vv + R(-1, 2)), layer='graphite', w=2.0, alpha=0.65, wobble=0.4, step=8)
        h.line(P(u + w_ / 2, 20), P(u - w_ / 2, 90), layer='graphite', w=1.4, alpha=0.5, wobble=0.5)

    # ------------- weight under the deck: loose vertical hatching between the legs
    for (a_, b_) in spans:
        h.hatch((cx + a_ * S, yw - (DECK_B - 4) * S, cx + b_ * S, yw - (DECK_B - 58) * S), 62, 5.2, layer='graphite', w=2.0, alpha=0.62, keep=0.85, wobble=0.8, step=10)
    # the waterline: a band of short flat strokes where the legs meet the sea
    for (a_, b_) in ((-1150, 1010),):
        h.hatch((cx + a_ * S, yw + 1 * S, cx + b_ * S, yw + 24 * S), 2, 5.5, layer='graphite', w=1.9, alpha=0.55, keep=0.85, wobble=1.2, step=14)
    # ------------- the water: ripple rings at the feet, broken reflections, a few long dashes
    for i, u in enumerate(pile_u):
        if rng.random() < 0.65:
            for k in range(2):
                h.arc(cx + u * S, yw + (4 + 7 * k) * S, (14 + 9 * k) * S, (3.2 + 1.6 * k) * S, 0.2, math.pi - 0.2, layer='graphite', w=1.5, alpha=0.5, wobble=0.5, step=8)
        if rng.random() < 0.45:
            ln = R(40, 130)
            h.path([(cx + u * S + R(-3, 3), yw + 8 * S), (cx + u * S + R(-4, 4), yw + (8 + ln * 0.5) * S), (cx + u * S + R(-5, 5), yw + (8 + ln) * S)], layer='graphite', w=2.2, alpha=0.34, wobble=3.2, step=12)
    for k in range(34):
        u = R(-1250, 1250); v = R(14, 175); ln = R(30, 160)
        h.line((cx + u * S, yw + v * S), (cx + (u + ln) * S, yw + (v + R(-1.5, 1.5)) * S), layer='graphite', w=1.6, alpha=0.30, wobble=1.0, step=18)

    for k in range(46):
        u = R(-1500, 1500); v = R(24 + abs(u) * 0.02, 520); ln = R(120, 420) * (1 + v / 500)
        pts = [(cx + (u + t * ln) * S, yw + (v + 6 * math.sin(t * 4 + k) * (1 + v / 300)) * S) for t in np.linspace(0, 1, 6)]
        h.path(pts, layer='graphite', w=R(1.5, 2.4), alpha=R(0.20, 0.42) * (1 - v / 640), wobble=2.0, step=26)

    return dict(HALL_L=HALL_L, HALL_R=HALL_R, DECK_T=DECK_T, DECK_B=DECK_B, G2=G2)
