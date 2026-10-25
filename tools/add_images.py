#!/usr/bin/env python3
"""Reusable, resumable image pipeline for the West Pier gallery.

  python3 tools/add_images.py gather            # find new candidates (Commons + Openverse), licence-filtered
  python3 tools/add_images.py sheet             # contact sheets of unreviewed candidates -> data/work/sheet*.jpg
  python3 tools/add_images.py add K1 K2 ...     # verify licence again, download, append to data/artworks.json
  python3 tools/add_images.py reviewed          # mark every candidate on the current sheets as reviewed

Ledger: data/ledger.json records every candidate key ever seen with a status
(rehosted / rejected:<reason> / reviewed / candidate), so later runs never re-add or re-review.
Licence rules: PD, PDM, CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA. ND is always rejected.
Attribution is copied from the source API; nothing is invented. Unknown authors stay 'Unknown'."""
import json, os, re, sys, time, io, html, subprocess
import urllib.request, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda *p: os.path.join(ROOT, *p)
UA = 'WestPierGallery/1.1 (non-commercial art project; https://github.com/home324707-afk/west-pier-gallery)'
LEDGER = J('data', 'ledger.json'); CANDS = J('data', 'work', 'candidates.json')
os.makedirs(J('data', 'work'), exist_ok=True)
OK = {'by', 'by-sa', 'by-nc', 'by-nc-sa', 'cc0', 'pdm'}
EXCLUDE_NAME = re.compile(r'\b(tom|tommy)\b', re.I)

def get(url, data=None, tries=5, raw=False):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': UA})
            r = urllib.request.urlopen(req, timeout=60).read()
            return r if raw else json.loads(r)
        except Exception as e:
            if i == tries - 1: raise
            time.sleep(5 * (i + 1))

def load(p, d): return json.load(open(p)) if os.path.exists(p) else d
def save(p, o): json.dump(o, open(p, 'w'), indent=1, ensure_ascii=False)
def clean(s): return re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', html.unescape(s or ''))).strip()

def ledger():
    L = load(LEDGER, {})
    for a in load(J('data', 'artworks.json'), []):
        k = ('c:' + a['file']) if a['src'].startswith('Wikimedia') else ('o:' + a['file'])
        L[k] = 'rehosted'
    return L

COMMONS = 'https://commons.wikimedia.org/w/api.php'
def commons_cat_files(cat, depth=0, seen=None, out=None):
    seen = seen if seen is not None else set(); out = out if out is not None else set()
    if cat in seen or depth > 3: return out
    seen.add(cat); cont = {}
    while True:
        q = dict(action='query', format='json', list='categorymembers', cmtitle=cat, cmlimit=500, **cont)
        r = get(COMMONS + '?' + urllib.parse.urlencode(q)); time.sleep(1)
        for x in r['query']['categorymembers']:
            if x['ns'] == 14: commons_cat_files(x['title'], depth + 1, seen, out)
            elif x['ns'] == 6: out.add(x['title'])
        if 'continue' in r: cont = r['continue']
        else: break
    return out

def commons_meta(titles):
    res = {}
    for i in range(0, len(titles), 10):
        b = urllib.parse.urlencode(dict(action='query', format='json', prop='imageinfo', iiprop='url|extmetadata|size|mime', iiurlwidth=1600, titles='|'.join(titles[i:i + 10]))).encode()
        r = get(COMMONS, data=b); time.sleep(2)
        for p in r['query']['pages'].values():
            ii = (p.get('imageinfo') or [{}])[0]; em = ii.get('extmetadata', {})
            g = lambda k: clean(em.get(k, {}).get('value', ''))
            res[p['title']] = dict(title=p['title'], w=ii.get('width'), h=ii.get('height'), mime=ii.get('mime'), thumb=(ii.get('thumburl') or '').split('?')[0],
                page=ii.get('descriptionurl'), artist=g('Artist'), lic=g('LicenseShortName'), licurl=em.get('LicenseUrl', {}).get('value', ''),
                objname=re.sub(r'\s*title QS:.*', '', g('ObjectName')), date=re.sub(r'date QS.*', '', g('DateTimeOriginal'))[:40], desc=g('ImageDescription')[:300])
    return res

def commons_lic_ok(m):
    l = (m.get('lic') or '').lower()
    if 'nd' in l.split('-') or '-nd' in l: return False
    return l in ('public domain', 'cc0', 'pdm') or l.startswith('cc by') or l.startswith('cc-by') or 'public domain' in l

OV_QUERIES = ['west pier brighton', 'brighton west pier', 'west pier ruin', 'west pier starlings', 'west pier brighton painting', 'west pier storm',
              'west pier sunset', 'west pier 19th century', 'west pier i360', 'west pier murmuration', 'brighton west pier postcard', 'west pier brighton 1900',
              'west pier fire', 'west pier hove', 'west pier skeleton', 'brighton old pier']

def gather():
    L = ledger(); C = load(CANDS, {})
    # Commons: walk the category tree again; fetch metadata only for titles not already known
    known = load(J('data', 'commons_meta.json'), {})
    titles = commons_cat_files('Category:Brighton West Pier')
    for q in ['"West Pier" Brighton', 'West Pier Brighton ruin', 'West Pier Brighton starlings', 'West Pier Brighton storm', 'West Pier Brighton 1900']:
        r = get(COMMONS + '?' + urllib.parse.urlencode(dict(action='query', format='json', list='search', srsearch=q, srnamespace=6, srlimit=100))); time.sleep(1)
        titles |= {x['title'] for x in r['query']['search']}
    need = [t for t in titles if t not in known and ('c:' + t) not in L]
    print('commons titles', len(titles), 'needing metadata', len(need))
    known.update(commons_meta(need)); save(J('data', 'commons_meta.json'), known)
    for t in titles:
        k = 'c:' + t; m = known.get(t)
        if not m or k in L: continue
        if not re.search(r'\.(jpe?g|png|tiff?)$', t, re.I): L[k] = 'rejected:not-an-image'; continue
        if not commons_lic_ok(m): L[k] = 'rejected:licence ' + (m.get('lic') or '?'); continue
        if EXCLUDE_NAME.search(m.get('artist') or ''): L[k] = 'rejected:name-rule'; continue
        if (m.get('w') or 0) < 800 and m.get('lic') not in ('Public domain',): L[k] = 'rejected:too-small'; continue
        C[k] = dict(src='commons', **m); L[k] = 'candidate'
    # Openverse: all sources (Flickr, Geograph, museums...)
    for q in OV_QUERIES:
        for page in range(1, 6):
            try: d = get('https://api.openverse.org/v1/images/?' + urllib.parse.urlencode(dict(q=q, page_size=20, page=page)))
            except Exception as e: print('ov fail', q, page, e); break
            for x in d['results']:
                k = 'o:' + x['id']
                if k in L: continue
                t = (x.get('title') or '') + ' ' + ' '.join(tg['name'] for tg in (x.get('tags') or []))
                if 'pier' not in t.lower(): L[k] = 'rejected:off-topic'; continue
                if x['license'] not in OK: L[k] = 'rejected:licence ' + x['license']; continue
                if EXCLUDE_NAME.search(x.get('creator') or ''): L[k] = 'rejected:name-rule'; continue
                if x.get('source') == 'wikimedia': L[k] = 'rejected:duplicate-of-commons-route'; continue
                C[k] = dict(src='openverse', **x); L[k] = 'candidate'
            time.sleep(1.5)
            if page >= d.get('page_count', 0): break
        print('ov', q, 'done; candidates', sum(1 for v in L.values() if v == 'candidate'))
    save(CANDS, C); save(LEDGER, L)
    print('candidates pending review', sum(1 for v in L.values() if v == 'candidate'))

def thumb_url(c):
    if c['src'] == 'commons':
        u = c['thumb'];  return u.replace('/1600px-', '/300px-') if '/1600px-' in u else u
    return c.get('thumbnail') or c['url']

def sheet():
    from PIL import Image, ImageDraw
    import concurrent.futures as cf
    L = ledger(); C = load(CANDS, {})
    keys = [k for k, v in L.items() if v == 'candidate' and k in C]
    def f(k):
        try:
            im = Image.open(io.BytesIO(get(thumb_url(C[k]), raw=True, tries=3))).convert('RGB'); im.thumbnail((240, 180)); return k, im
        except Exception: return k, None
    with cf.ThreadPoolExecutor(4) as ex: res = [r for r in ex.map(f, keys) if r[1]]
    save(J('data', 'work', 'sheet_index.json'), [k for k, _ in res])
    for s in range(0, len(res), 48):
        sh = Image.new('RGB', (8 * 244, 6 * 200), 'white'); d = ImageDraw.Draw(sh)
        for i, (k, im) in enumerate(res[s:s + 48]):
            x, y = (i % 8) * 244, (i // 8) * 200; sh.paste(im, (x + 2, y + 2)); d.text((x + 4, y + 184), str(s + i), fill='red')
        sh.save(J('data', 'work', f'sheet{s // 48}.jpg'), quality=80)
    print('sheets', (len(res) + 47) // 48, 'images', len(res))

def flickr_verify(page, licurl):
    t = get(page, raw=True).decode('utf-8', 'replace')
    found = set(re.findall(r'creativecommons\.org/(?:licenses/[a-z-]+/[0-9.]+|publicdomain/[a-z]+/[0-9.]+)', t))
    exp = licurl.split('creativecommons.org/')[-1].rstrip('/')
    return any(exp in f for f in found), sorted(found)

def add(keys):
    from PIL import Image
    L = ledger(); C = load(CANDS, {}); A = load(J('data', 'artworks.json'), [])
    for k in keys:
        if L.get(k) == 'rehosted': print('skip dup', k); continue
        c = C[k]; n = len(A) + 1
        if c['src'] == 'commons':
            lic = c['lic']; licurl = c['licurl'] or {'Public domain': 'https://creativecommons.org/publicdomain/mark/1.0/', 'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/'}.get(lic, '')
            artist = clean(c['artist']).replace('Unknown authorUnknown author', 'Unknown').replace('Unknown author', 'Unknown')
            artist = re.sub(r'\s*\(category\)|\s*http\S+|\(Life t.*', '', artist).strip() or 'Unknown'
            title = c['objname'] or re.sub(r'\.(jpe?g|png|tiff?)$', '', c['title'][5:], flags=re.I)
            date = re.sub(r'^Taken on ', '', c['date'] or ''); date = re.sub(r'\s+\d\d:\d\d.*$', '', date)
            if artist == 'Unknown' and date.startswith(('2023', '2024', '2025', '2026')): date = ''
            rec = dict(src='Wikimedia Commons', file=c['title'], orig_title=title, artist=artist, date=date, lic=lic, licurl=licurl, page=c['page'], dl=c['thumb'], desc=c.get('desc', ''))
        else:
            v = c; Ls = {'by': 'CC BY', 'by-sa': 'CC BY-SA', 'by-nc': 'CC BY-NC', 'by-nc-sa': 'CC BY-NC-SA', 'cc0': 'CC0', 'pdm': 'Public Domain Mark'}[v['license']] + ' ' + (v.get('license_version') or '')
            src = {'flickr': 'Flickr (via Openverse)', 'geographorguk': 'Geograph (via Openverse)'}.get(v['source'], v['source'] + ' (via Openverse)')
            rec = dict(src=src, file=v['id'], orig_title=v.get('title') or 'Untitled', artist=v.get('creator') or 'Unknown', date='', lic=Ls.strip(), licurl=v['license_url'], page=v['foreign_landing_url'], dl=v['url'], desc='')
            if v['source'] == 'flickr':
                try: ok, found = flickr_verify(v['foreign_landing_url'], v['license_url'])
                except Exception as e: L[k] = 'rejected:flickr-page-unavailable'; save(LEDGER, L); print('REJECT page unavailable', k, e); continue
                rec['flickr_check'] = found
                if not ok: L[k] = 'rejected:flickr-licence-mismatch'; print('REJECT licence mismatch', k, found); continue
        if EXCLUDE_NAME.search(rec['artist']): L[k] = 'rejected:name-rule'; continue
        rec['orig_title'] = re.sub(r'\s+\(\d{6,}\)$', '', rec['orig_title'].strip())
        try:
            im = Image.open(io.BytesIO(get(rec['dl'], raw=True))).convert('RGB')
        except Exception as e: print('download failed', k, e); continue
        im.thumbnail((1600, 1600), Image.LANCZOS)
        rec.update(kind='human', n=n, img=f'img/{n:02d}.jpg', w=im.width, h=im.height)
        im.save(J(rec['img']), quality=84, optimize=True, progressive=True)
        t = im.copy(); t.thumbnail((700, 700)); t.save(J(rec['img'].replace('.jpg', '_t.jpg')), quality=80, optimize=True, progressive=True)
        A.append(rec); L[k] = 'rehosted'; save(J('data', 'artworks.json'), A); save(LEDGER, L)
        print('added', n, rec['lic'], '|', rec['artist'], '|', rec['orig_title'][:60]); time.sleep(1.5)

def reviewed():
    L = ledger()
    for k in load(J('data', 'work', 'sheet_index.json'), []):
        if L.get(k) == 'candidate': L[k] = 'reviewed:not-selected'
    save(LEDGER, L)

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    {'gather': gather, 'sheet': sheet, 'reviewed': reviewed}.get(cmd, lambda: add(sys.argv[2:]))() if cmd != 'add' else add(sys.argv[2:])
