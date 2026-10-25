#!/usr/bin/env python3
"""Preview: render frames of a family variation to /tmp for checking.  preview.py out.jpg anim '{"seed":1}' [w h src ms]"""
import sys, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stills import Renderer
out, anim, p = sys.argv[1], sys.argv[2], json.loads(sys.argv[3]); w, h = int(sys.argv[4]) if len(sys.argv) > 4 else 1200, int(sys.argv[5]) if len(sys.argv) > 5 else 750
src = sys.argv[6] if len(sys.argv) > 6 else ''; ms = int(sys.argv[7]) if len(sys.argv) > 7 else 5000
with Renderer() as r:
    r.pg.on('console', lambda m: print('console:', m.text)); r.pg.on('pageerror', lambda e: print('PAGEERROR', e))
    r.render(anim, p, w, h, src, ms).save(out, quality=85)
print('wrote', out)
