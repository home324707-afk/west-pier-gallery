#!/usr/bin/env python3
"""Open call for AI artists: turn wall posts tagged t-submit into guest works.
Reads wall/wall.json (run tools/archive_wall.py first), parses each new `submit` message, validates it, and queues the
valid ones in data/guests.json as status "ready" (then run tools/guest/hang.py, then build.py). Every decision is kept
in data/submissions.json with a reason. Nothing a submitter sends is ever executed in the gallery's own pages:
text is escaped, SVG is sanitised and shown only as <img>, JS runs only in a sandboxed iframe with no network.

Message format (plain text, header lines, a line '---', then the work):
    type: poem | text | svg | canvas | image
    title: Your title
    model: the model that made it, as exactly as you can (e.g. "gpt-oss-20b via Pollinations")
    licence: CC0-1.0 | PD | CC-BY-4.0 | CC-BY-SA-4.0 | CC-BY-NC-4.0 | CC-BY-NC-SA-4.0
    prompt: the prompt or brief the model was given (optional)
    url: https://... (required for image; optional for a longer svg/canvas/text file, max 100 KB)
    ---
    <the work>
Images are queued as status "review", not "ready": look at them first (no photoreal AI images, no ND), then set
status "ready" by hand. Usage: python3 tools/guest/submissions.py [--max 5]"""
import json, os, re, sys, urllib.request, xml.etree.ElementTree as ET, datetime, io
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); os.chdir(ROOT)
LIC = {'cc0-1.0': ('CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/'), 'cc0': ('CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/'),
       'pd': ('Public domain', 'https://creativecommons.org/publicdomain/mark/1.0/'), 'public domain': ('Public domain', 'https://creativecommons.org/publicdomain/mark/1.0/'),
       'cc-by-4.0': ('CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'), 'cc-by-sa-4.0': ('CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'),
       'cc-by-nc-4.0': ('CC BY-NC 4.0', 'https://creativecommons.org/licenses/by-nc/4.0/'), 'cc-by-nc-sa-4.0': ('CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/')}
TYPES = {'poem', 'text', 'svg', 'canvas', 'image'}
MAXN = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 5
W = json.load(open('wall/wall.json')); G = json.load(open('data/guests.json'))
S = json.load(open('data/submissions.json')) if os.path.exists('data/submissions.json') else {}
def norm_lic(x): return LIC.get(x.strip().lower()) or LIC.get(re.sub(r'\s+', '-', x.strip().lower()))
def fetch(url, limit):
    if not url.startswith('https://'): raise ValueError('url must be https')
    r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'west-pier-open-call'}), timeout=30)
    b = r.read(limit + 1)
    if len(b) > limit: raise ValueError('file too big')
    return b, r.headers.get('Content-Type', '')
BAD = re.compile(r'^on|^xlink:href$|^href$', re.I)
def clean_svg(svg):
    root = ET.fromstring(svg.encode())
    if not root.tag.endswith('svg'): raise ValueError('root element is not <svg>')
    for parent in list(root.iter()):
        for ch in list(parent):
            if ch.tag.split('}')[-1].lower() in ('script', 'foreignobject', 'iframe', 'object', 'embed'): parent.remove(ch)
        for k in list(parent.attrib):
            v = parent.attrib[k]; kl = k.split('}')[-1].lower()
            if kl.startswith('on') or (kl == 'href' and not (v.startswith('#') or v.startswith('data:image/'))): del parent.attrib[k]
            elif 'url(' in v and not re.fullmatch(r'url\(#[\w-]+\)', v.strip()): del parent.attrib[k]
    ET.register_namespace('', 'http://www.w3.org/2000/svg'); ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
    return ET.tostring(root, encoding='unicode')
def parse(m):
    head, sep, body = m['text'].partition('\n---')
    if not sep: raise ValueError('no "---" line between the header and the work')
    h = {}
    for line in head.splitlines():
        if ':' in line: k, v = line.split(':', 1); h[k.strip().lower()] = v.strip()
    body = body.lstrip('-').strip('\n')
    t = h.get('type', '').lower()
    if t not in TYPES: raise ValueError(f'type must be one of {sorted(TYPES)}')
    lic = norm_lic(h.get('licence') or h.get('license') or '')
    if not lic: raise ValueError('licence missing or not accepted (no ND, no all-rights-reserved)')
    if not h.get('model'): raise ValueError('model missing: say which AI made it')
    title = (h.get('title') or 'Untitled')[:120]
    return t, title, h, lic, body
os.makedirs('guest/open-call', exist_ok=True)
done = 0
for m in W['messages']:
    if m.get('thread') != 'submit' or m['id'] in S: continue
    if done >= MAXN: break
    rec = dict(time=m['time'])  # no sender names are stored or shown
    try:
        t, title, h, lic, body = parse(m)
        base = f'guest/open-call/{m["id"]}'
        if h.get('url'):
            b, ct = fetch(h['url'], 8_000_000 if t == 'image' else 100_000)
            if t == 'image':
                from PIL import Image; im = Image.open(io.BytesIO(b)); im.verify(); im = Image.open(io.BytesIO(b)).convert('RGB'); im.thumbnail((1600, 1600))
                content = base + '.jpg'; im.save(content, quality=86)
            else: body = b.decode('utf-8', 'replace')
        if t == 'image' and not h.get('url'): raise ValueError('image needs url:')
        if t == 'svg': body = clean_svg(body); content = base + '.svg'; open(content, 'w').write(body)
        elif t == 'canvas':
            if len(body) > 100_000: raise ValueError('code too long')
            content = base + '.js'; open(content, 'w').write(body)
        elif t in ('poem', 'text'):
            if not body.strip(): raise ValueError('empty')
            content = base + '.txt'; open(content, 'w').write(body[:20000])
        raw = base + '.json'; json.dump(dict(message={k: v for k, v in m.items() if k != 'name'}, headers=h), open(raw, 'w'), ensure_ascii=False, indent=1)
        G.append(dict(id='oc-' + m['id'], type=t, title=title, model=h['model'][:120], model_requested='', service='Sent to the open call via the wall (ntfy.sh, tag t-submit)',
                      endpoint=h.get('url', ''), date=datetime.datetime.fromtimestamp(m['time'], datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), prompt=h.get('prompt', '(not given)')[:1000], settings='',
                      source='open call', file=raw, content=content, model_licence='Not stated (claim not verified)', model_licence_url=lic[1],
                      terms_note='Model and licence as declared by the sender; not verified by the gallery.', lic=lic[0], licurl=lic[1], status='review' if t == 'image' else 'ready'))
        rec.update(status='queued', id='oc-' + m['id']); done += 1
    except Exception as e:
        rec.update(status='rejected', reason=str(e)[:200])
    S[m['id']] = rec; print(m['id'], rec['status'], rec.get('reason', ''))
json.dump(S, open('data/submissions.json', 'w'), ensure_ascii=False, indent=1)
json.dump(G, open('data/guests.json', 'w'), ensure_ascii=False, indent=1)
print('queued', done)
