"""Poster stills for guest-AI works. Guest code never runs in the gallery's own pages: canvas sketches run inside
<iframe sandbox="allow-scripts"> (no same-origin) with a CSP that blocks all network access; SVG is shown as an <img>
(scripts in SVG never run there). This module builds that sandbox markup and renders posters with headless Chrome."""
import base64, html, io
from PIL import Image
CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:"
def srcdoc(js, w=800, h=500):
    js = js.replace('</script', '<\\/script').replace('</SCRIPT', '<\\/SCRIPT')
    return (f'<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="{CSP}">'
            f'<style>html,body{{margin:0;background:#000;overflow:hidden}}canvas{{display:block;width:100vw;height:auto}}</style></head>'
            f'<body><canvas id="c" width="{w}" height="{h}"></canvas><script>{js}</script></body></html>')
def iframe(js, title, w=800, h=500):
    return (f'<iframe class="guestframe" sandbox="allow-scripts" referrerpolicy="no-referrer" loading="lazy" title="{html.escape(title)}" '
            f'width="{w}" height="{h}" style="width:100%;aspect-ratio:{w}/{h};height:auto;border:0;background:#000" srcdoc="{html.escape(srcdoc(js, w, h), quote=True)}"></iframe>')
def iframe_on_click(js, title, w=800, h=500):
    """Nothing runs until the visitor presses the button (some guest sketches flicker). The button only copies the
    sandboxed document into the iframe's srcdoc; the guest code itself never runs in this page."""
    f = iframe(js, title, w, h).replace(' srcdoc="', ' hidden data-srcdoc="', 1)
    return ('<button class="btn solid" type="button" onclick="var f=this.nextElementSibling;f.srcdoc=f.dataset.srcdoc;f.hidden=false;this.remove()">'
            '▶ Run the model\'s code (sandboxed, may flicker)</button>' + f)
def svg_data_url(svg): return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode()
POEM = '''<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>body{margin:0;width:1200px;height:800px;background:#f4efe4;color:#1f1c19;display:flex;align-items:center;justify-content:center;font-family:Fraunces,serif}
.c{max-width:900px}h1{font-weight:300;font-style:italic;font-size:FSHpx;margin:0 0 .6em}p{white-space:pre-wrap;font-size:FSpx;line-height:1.42;margin:0}
.by{position:absolute;left:60px;bottom:40px;font:15px "JetBrains Mono",monospace;color:#7a6f60}</style></head><body><div class="c"><h1>TITLE</h1><p>BODY</p></div><div class="by">GUEST AI · BY</div></body></html>'''
class Shooter:
    def __enter__(self):
        from playwright.sync_api import sync_playwright
        self.pw = sync_playwright().start(); self.b = self.pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); return self
    def __exit__(self, *a): self.b.close(); self.pw.stop()
    def shot(self, page_html, w, h, wait=600):
        pg = self.b.new_page(viewport=dict(width=w, height=h)); pg.set_content(page_html, wait_until='load'); pg.wait_for_timeout(wait)
        try: pg.evaluate('document.fonts.ready')
        except Exception: pass
        png = pg.screenshot(); errs = []; pg.close(); return Image.open(io.BytesIO(png)).convert('RGB')
    def poem(self, title, text, by):
        lines = text.count('\n') + 1; fs = max(17, min(30, int(560 / max(lines, 10) / 1.42)))
        h = POEM.replace('FSH', str(int(fs * 1.5))).replace('FS', str(fs)).replace('TITLE', html.escape(title)).replace('BODY', html.escape(text)).replace('BY', html.escape(by))
        return self.shot(h, 1200, 800, 900)
    def svg(self, svg):
        return self.shot(f'<!doctype html><body style="margin:0;background:#fff"><img src="{svg_data_url(svg)}" style="width:1200px;height:750px;object-fit:contain;display:block"></body>', 1200, 750)
    def canvas(self, js, ms=4000):
        page = f'<!doctype html><body style="margin:0;background:#000">{iframe(js, "guest", 800, 500).replace(" loading=\"lazy\"", "")}</body>'
        pg = self.b.new_page(viewport=dict(width=1200, height=750)); errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.set_content(page.replace('style="width:100%', 'style="width:1200px'), wait_until='load'); pg.wait_for_timeout(ms)
        png = pg.screenshot(); pg.close(); return Image.open(io.BytesIO(png)).convert('RGB'), errs
