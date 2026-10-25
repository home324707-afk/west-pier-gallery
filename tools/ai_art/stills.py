#!/usr/bin/env python3
"""Render poster stills for live pieces with headless Chrome (Playwright), so the still is a real frame of the code.
   python3 tools/ai_art/stills.py N [N ...]   # re-render the given works' posters from data/artworks.json
Used by tools/ai_art/families.py when a family work is hung."""
import sys, os, json, base64, io, threading, http.server, functools, socketserver
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import J, works, save
from PIL import Image
_srv = None
def _serve():
    global _srv
    if _srv: return _srv.server_address[1]
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Q, directory=J())
    _srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), h); threading.Thread(target=_srv.serve_forever, daemon=True).start()
    return _srv.server_address[1]
class Renderer:
    def __enter__(self):
        from playwright.sync_api import sync_playwright
        self.pw = sync_playwright().start(); self.b = self.pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        self.pg = self.b.new_page(); self.pg.goto(f'http://127.0.0.1:{_serve()}/tools/ai_art/still.html'); self.pg.wait_for_function('!!(window.WPAI&&window.render)'); return self
    def render(self, anim, p, w, h, src='', ms=5000):
        url = self.pg.evaluate('o=>render(o)', dict(anim=anim, p=p, w=w, h=h, src=src, ms=ms))
        return Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1]))).convert('RGB')
    def __exit__(self, *a): self.b.close(); self.pw.stop()
def src_of(a):
    byn = {x['n']: x for x in works()}
    return ','.join(byn[n]['img'] for n in a.get('sources', [])[:1])
if __name__ == '__main__':
    ns = [int(x) for x in sys.argv[1:]]; A = {a['n']: a for a in works()}
    with Renderer() as r:
        for n in ns:
            a = A[n]; im = r.render(a['anim'], a.get('params', {}), a['w'], a['h'], src_of(a), a.get('still_ms', 5000)); save(im, J(a['img'])); print('still', n)
