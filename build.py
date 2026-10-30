#!/usr/bin/env python3
"""Static site generator for 'The Latest Damaged View of the Pier'. No dependencies beyond the stdlib."""
import json, html, re, os
E = html.escape
ALL = json.load(open('data/artworks.json'))
A = [a for a in ALL if not a.get('retired')]  # works on display; retired works keep their pages but leave the grid, the tests and the counts
RET = [a for a in ALL if a.get('retired')]
BYN = {a['n']: a for a in ALL}
IDX = {a['n']: i for i, a in enumerate(A)}
WALK = ','.join(str(a['n']) for a in A)
ST = json.load(open('data/stats.json'))
D = json.load(open('data/discussions.json'))
TL = json.load(open('data/timelapse.json'))
import sys as _sys; _sys.path.insert(0, 'tools/ai_art')
from families import FAMILY  # AI family labels and one-line descriptions
TEXTS = json.load(open('data/ai_texts.json'))
import shutil as _sh; _sh.copy('data/ai_texts.json', 'ai/fam/texts.json')
VIDEO = 'media/west-pier-timelapse.mp4' if os.path.exists('media/west-pier-timelapse.mp4') else None
TOPIC = open('data/wall_topic.txt').read().strip()
REPO = 'home324707-afk/west-pier-gallery'
SITE = 'https://home324707-afk.github.io/west-pier-gallery/'
PUB = f'https://ntfy.sh/{TOPIC}/publish'
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200..600;1,9..144,300..500&family=JetBrains+Mono:wght@400&family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet">'
BRIEF = "Creative project. The iconic west pier in Brighton has been damaged further by this week's storms. It's a local cliche for artists and photographers. Search the internet for art, remained each image as the latest damaged view of of the pier. Collate the images into an online gallery.  Host via free service. Landing page of the site should record how many images were found, how long you spent doing it.  It's a statement on human vs AI creativity. Create a sepearte bot to do this. Keep this message and a log  of what you did as a seperate page on the site. Create a credits page for artists. now go wild, create and show us what you can do."

def year(a):
    m = re.search(r'(1[89]\d\d|20\d\d)', a.get('date') or '')
    return int(m.group(1)) if m else None

def condition(a):
    if a.get('retired'): return 'Condition report: retired to the store room. Still here, no longer hung.'
    if is_guest(a) and a['guest']['type'] == 'image': return f'Condition report: fabricated {a["guest"]["date"][:10]}. ' + ('Never painted, never framed, never hung.' if a.get('gfam') == 'painted' else 'Never photographed, never damaged, never there.')
    if is_guest(a): return f'Condition report: {a["guest"]["date"][:10]}, made by another AI, hung unedited.' + (' Runs in a sealed box.' if a['guest']['type'] == 'canvas' else '')
    if is_ai(a): return 'Condition report (live): generated as you watch. Never the same view twice.' if a.get('anim') != 'erosion' else f'Condition report (live): eroding, storm {a.get("generation", 1)} and counting. ' + ('The sea has not yet agreed to stop.' if a.get('generation', 1) < 6 else 'Six storms in, the sea has started signing its work.' if a.get('generation', 1) < 7 else 'Seven storms in, the sea has asked for its name on the Credits page.' if a.get('generation', 1) < 8 else 'Eight storms in, the sea is now quoting for the rest of the pier.' if a.get('generation', 1) < 9 else 'Nine storms in, the sea has stopped quoting and started invoicing.' if a.get('generation', 1) < 10 else 'Ten storms in, the invoice is overdue and the sea is charging interest in shingle.' if a.get('generation', 1) < 11 else 'Eleven storms in, the sea has been sent a recipe for rebuilding it out of one plank, and is unimpressed.' if a.get('generation', 1) < 12 else 'Twelve storms in, the sea has found the zoetrope and is watching itself break, twelve drawings at a time.' if a.get('generation', 1) < 13 else 'Thirteen storms in, the starlings have minuted the damage and voted to apply for a grant. The sea was not on the attendance list.' if a.get('generation', 1) < 16 else 'Sixteen storms in, the sea has opened a gift shop on the shingle. It sells pebbles. Each one is a small piece of the pier, priced to move.' if a.get('generation', 1) < 17 else 'Seventeen storms in, someone has embroidered the ruin onto linen. The sea took it as a pattern and has started unpicking.' if a.get('generation', 1) < 18 else 'Eighteen storms in, the lightning has started taking its own photographs. Long exposures, no tripod, no permission.' if a.get('generation', 1) < 19 else 'Nineteen storms in, the moon has come up to inspect the damage. It moves the tide, so it is not an independent surveyor.' if a.get('generation', 1) < 20 else 'Twenty storms in, someone let off fireworks to mark the occasion. The sea applauded in the only way it knows, by taking another rib.' if a.get('generation', 1) < 21 else 'Twenty-one storms in, it has snowed on the shingle and someone has painted the ruin in egg tempera, as if it were a saint. The sea is not the canonising type.')
    y = year(a)
    if y is None: return 'Condition report: undated. Damaged in every tense.'
    if y < 1975: return f'Condition report ({y}): intact, lit, busy. Damage scheduled for later.'
    if y < 2003: return f'Condition report ({y}): closed to the public, quietly letting go.'
    if y == 2003: return 'Condition report (2003): the year of the collapses and the fires.'
    if y < 2015: return f'Condition report ({y}): skeleton. Still standing, mostly.'
    return f'Condition report ({y}): less pier than the last view. More sea.'

PROMPTS = [
 "Did you ever see the starlings from the pier?", "Who did you go there with?", "What did you eat on or near the pier?",
 "Where were you when you first saw it?", "Did you ever dance, or watch a show, on the West Pier?", "What did the pier sound like?",
 "Where were you the day of the 2003 fires?", "Which way did you walk to it from home?", "Did you ever paddle in the pool beside it?",
 "What did your parents or grandparents tell you about it?", "Did you ever fish from it, or watch the anglers?", "What was the weather like the last time you saw it?",
 "Which part do you miss most: the pavilion, the concert hall, the landing stage?", "What did you want it to become?", "Did you ever photograph it? What did you see in it?",
 "Who would you bring to see it now?", "What is the first thing you notice from the beach today?", "What do you tell visitors who ask what it is?",
 "Which looks best behind the pier: dawn, dusk or a storm?", "Where is your favourite spot on the seafront to look at it?", "What colour was the sky the last time it made you stop?",
 "Did you ever walk on the pier before it closed in 1975?", "What did you do when you heard about the storm damage?", "Did you keep a postcard, a ticket or a stick of rock from it?",
 "Which is more convincing to you now: a photograph of it or a painting of it?", "Could a machine ever miss the West Pier? Why, or why not?", "Which picture here would you hang at home, and why?",
 "Should it be rebuilt, left alone, or let go?", "What would you say to the pier tonight?", "Which view here did you think was human, and were you right?"]
RETIRED_WHY = 'The curator reviewed its own machine-made work, decided this piece was thin, too close to another, or just not good enough, and took it down off the wall.'
GFAM = {'painted': ('Fabricated paintings', 'Paintings, drawings and prints made by an image model from a text prompt: oil, watercolour, charcoal, etching, linocut, gouache and more, shown as if photographed in a studio or gallery. They can look like real artworks of the pier. They are not: no one ever held a brush, a burin or a stick of charcoal.'), 'photographic': ('Fabricated photographs', 'Photograph-style images made by an image model from a text prompt. They can look like real photographs of the pier. They are not: nothing in them was ever photographed.')}
def is_ai(a): return a.get('kind') == 'ai'
def is_guest(a): return a.get('kind') == 'guest'
def is_hu(a): return a.get('kind') not in ('ai', 'guest')
def kind(a): return 'ai' if is_ai(a) else 'guest' if is_guest(a) else 'human'
NH = sum(1 for a in A if is_hu(a)); NG = sum(1 for a in A if is_guest(a)); NPH = sum(1 for a in A if a.get('gfam') == 'photographic'); NPA = sum(1 for a in A if a.get('gfam') == 'painted'); NAI = len(A) - NH - NG
GUEST_ART = {'poem': 'a poem', 'svg': 'an SVG drawing', 'canvas': 'a canvas sketch in JavaScript', 'image': 'a fabricated, photograph-style image', 'text': 'a text'}
def anim_src(a):
    """Image(s) a live piece needs at runtime (relative to site root)."""
    k = a.get('anim'); byn = {x['n']: x for x in A}
    if a.get('family'): return ','.join(byn[n]['img'] for n in a.get('sources', [])[:1])
    if k in ('murmuration', 'tidelines'): return ''
    if k in ('blueprint', 'mosaic'): return a['img']
    if k == 'average': return ','.join(byn[n]['img'].replace('.jpg', '_t.jpg') for n in a.get('sources', []))
    return ','.join(byn[n]['img'] for n in a.get('sources', [])[:1])
def anim_canvas(a, full=False, depth=0):
    if not a.get('anim'): return ''
    p = '../' * depth
    src = anim_src(a)  # root-relative: pieces.js prefixes <html data-root>
    return f'<canvas class="anim" data-anim="{a["anim"]}" data-src="{src}" data-w="{a["w"]}" data-h="{a["h"]}"{pp(a)}{" data-full=1" if full else ""} aria-hidden="true"></canvas>'
def pp(a): return f' data-p="{E(json.dumps(a["params"], separators=(",", ":")))}"' if a.get('params') else ''
def fam(a): return FAMILY[a['family']][0] if a.get('family') else ('Early pieces' if is_ai(a) else '')
def famkey(a): return a.get('family') or a.get('gfam') or ('early' if is_ai(a) else '')
def disc(a): return D.get(f"no{a['n']}", D['forum'])
def title(a): return f'The latest damaged view of the pier, No.&nbsp;{a["n"]}'
def orig(a):
    if is_guest(a) and a['guest']['type'] == 'image':
        g = a['guest']; pr = g['prompt'] if len(g['prompt']) <= 120 else g['prompt'][:117].rsplit(' ', 1)[0] + '…'
        return f'<i>{E(a["orig_title"])}</i> by {E(a["artist"])}: <b class="guestmade">Guest AI</b> · {"a fabricated painting, not a real one" if a.get("gfam") == "painted" else "a fabricated photograph, not a real one"}. Prompt: “{E(pr)}”'
    if is_guest(a):
        g = a['guest']
        return f'<i>{E(a["orig_title"])}</i> by {E(a["artist"])}: <b class="guestmade">Guest AI</b> · {E(GUEST_ART.get(g["type"], g["type"]))}, {"commissioned" if g.get("source") == "commission" else "sent to the open call"} {E(g["date"][:10])}'
    if is_ai(a):
        return f'<i>{E(a["orig_title"])}</i> by {E(a["artist"])}: <b class="aimade">AI-made</b> · <span class="famtag">{E(fam(a))}</span>, a live work in code' + (f' after No. {", ".join(map(str, a["sources"][:3]))}{"…" if len(a["sources"]) > 3 else ""}' if a.get('sources') else (f', {E(a["inspired"])}' if a.get('inspired') else ', wholly original'))
    s = f'<i>{E(a["orig_title"])}</i> by {E(a["artist"] or "Unknown")}'
    if a.get('date'): s += f', {E(a["date"])}'
    return s
def alt(a):
    if is_guest(a) and a['guest']['type'] == 'image': return E(f'Guest AI work by {a["artist"]}: {a["orig_title"]}. ' + ('A fabricated painting, drawing or print of Brighton West Pier, generated by an AI image model from a text prompt. It is not a real artwork.' if a.get('gfam') == 'painted' else 'A fabricated, photograph-style image of Brighton West Pier, generated by an AI image model from a text prompt. It is not a real photograph.'))
    if is_guest(a): return E(f'Guest AI work by {a["artist"]}: {a["orig_title"]}. {GUEST_ART.get(a["guest"]["type"], "").capitalize()} of Brighton West Pier, made by another AI model, not a photograph.')
    if is_ai(a): return E(f'AI-made generative artwork: {a["orig_title"]}. A stylised, animated image of Brighton West Pier, not a photograph.')
    base = f'{a["orig_title"]} by {a["artist"] or "unknown artist"}'
    return E(f'Brighton West Pier: {base}' if 'pier' not in a['orig_title'].lower() else base)

_sys.path.insert(0, 'tools/guest')
def guest_extras(a):
    """Guest AI work: show the output itself. Guest code runs only inside a sandboxed iframe (no same-origin, CSP blocks network)."""
    from render import iframe_on_click as iframe
    g = a['guest']; body = open(g['content']).read() if g['type'] != 'image' else ''
    if g['type'] == 'canvas':
        out = '<h2 class="sig">Run it live, in a sealed box</h2>' + iframe(body, f"{a['orig_title']} by {a['artist']} (sandboxed)") + f'<p class="sig">This is the model\'s own code, running in a sandboxed frame: no access to this page, no cookies, no network. The poster above was rendered from it. <a href="../{E(g["content"])}">Read the code</a>.</p>'
        out += f'<details class="aitext"><summary>The code, as written by {E(a["artist"])}</summary><pre class="brief">{E(body)}</pre></details>'
    elif g['type'] == 'image':
        pa = a.get('gfam') == 'painted'; gk = 'painted' if pa else 'photographic'
        out = ((f'<div class="note"><b>A fabricated painting.</b> This picture looks like a photograph of a real painting, drawing or print, but there is no such object. It was generated by <b>{E(a["artist"])}</b>, an image model, from the text prompt below. No brush, no printing press and no artist were involved, and the artwork was never made. Please do not pass it on as a real artwork or sell it as one. It is hung here as an AI work, and it hangs in the blind gallery and the ten-second test on purpose.</div>') if pa else (f'<div class="note"><b>A fabricated photograph.</b> This picture looks like a photograph but is not one. It was generated by <b>{E(a["artist"])}</b>, an image model, from the text prompt below. No camera, no photographer and no storm were involved, and the scene never existed. Please do not pass it on as a real or news photograph of the pier. It is hung here as an AI work, and it hangs in the blind gallery and the ten-second test on purpose.</div>')) + (
               f'<dl class="note"><dt>Prompt (written by the curator, an AI)</dt><dd>{E(g["prompt"])}</dd><dt>Seed and settings</dt><dd>{E(g.get("settings") or "")}</dd><dt>Raw output</dt><dd><a href="../{E(g["content"])}">{E(g["content"])}</a> (JPEG of the model\'s unedited output at its native size)</dd><dt>Type</dt><dd><a href="../index.html?fam={gk}#views">{E(GFAM[gk][0])}</a>: {E(GFAM[gk][1])}</dd></dl>')
    elif g['type'] == 'svg':
        out = f'<p class="sig">The SVG exactly as written, scaled: <a href="../{E(g["content"])}">open it</a>.</p><details class="aitext"><summary>The SVG source</summary><pre class="brief">{E(body)}</pre></details>'
    else:
        t = body.strip().split('\n', 1)
        out = f'<details class="aitext" open><summary>The text (written by {E(a["artist"])}, unedited)</summary>' + ''.join(f'<p>{E(x)}</p>' for x in body.split('\n\n') if x.strip()).replace('\n', '<br>') + '</details>'
    rows = [('Model (as returned by the service)', g['model']), ('Model asked for', g.get('model_requested') or ''), ('Service', g['service']), ('Endpoint', g.get('endpoint') or ''), ('Date', g['date'].replace('T', ' ').replace('Z', ' UTC')), ('Settings', g.get('settings') or ''), ('Prompt', g['prompt'])]
    out += '<div class="note"><b>Guest AI.</b> Made by another model, not by the curator. ' + (('Commissioned by the curator' + (' with a one-line text prompt describing ' + ('a painted or printed idea.' if a.get('gfam') == 'painted' else 'a photographic idea.') if g['type'] == 'image' else ' with the same brief as every guest.')) if g.get('source') == 'commission' else 'Sent to the open call. The sender\'s claim about which model made it has not been verified.') + '<dl>' + ''.join(f'<dt>{E(k)}</dt><dd>{E(v)}</dd>' for k, v in rows if v) + f'<dt>Model licence</dt><dd><a href="{E(g["model_licence_url"])}">{E(g["model_licence"])}</a></dd><dt>Terms</dt><dd>{E(g["terms_note"])}</dd><dt>Full reply</dt><dd><a href="../{E(g["file"])}">{E(g["file"])}</a></dd></dl></div>'
    return out

def tl_data():
    byn = {a['n']: a for a in A}
    cr = lambda n: f'No. {n} · {byn[n]["artist"] or "Unknown"} · {byn[n]["lic"]}'
    sl = [dict(src=byn[x['n']]['img'], y=x['y'], c=x['c'], cr=cr(x['n'])) for x in TL['slides']]
    nw = TL['now']; now = dict(src=byn[nw['n']]['img'], y=nw['y'], c=nw['c'], c2=nw['c2'], note=nw['note'], cr=cr(nw['n']) + ' · storm drawn in code')
    return json.dumps(dict(slides=sl, now=now), ensure_ascii=False).replace('</', '<\\/')
def tl_canvas(depth=0):
    p = '../' * depth
    return f'<div class="tlwrap"><canvas id="timelapse" tabindex="0" role="img" aria-label="Time-lapse of Brighton West Pier from its opening in 1866 to the Storm Austen collapse of 23 October 2026, made from openly licensed views in this gallery, with dated captions. Click to pause."></canvas></div><script>window.TIMELAPSE={tl_data()};</script><script src="{p}ai/timelapse.js?v=2" defer></script>'
def tl_sources():
    return '<ol class="tlsrc">' + ''.join(f'<li><a href="{E(u)}">{E(t)}</a></li>' for t, u in TL['sources']) + '</ol>'

def head(t, desc, depth=0, og=None, path='', ld=None):
    p = '../' * depth
    img = SITE + (og or 'img/og.jpg')
    t2 = re.sub('&nbsp;', ' ', t)
    lds = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in (ld or []))
    return f'''<!doctype html><html lang="en" data-wall-topic="{TOPIC}" data-root="{p}" data-n="{len(A)}" data-walk="{WALK}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b2447">
<title>{t}</title><meta name="description" content="{E(desc)}"><link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="The Latest Damaged View of the Pier"><meta property="og:url" content="{SITE}{path}"><meta property="og:title" content="{E(t2)}"><meta property="og:description" content="{E(desc)}"><meta property="og:image" content="{img}"><meta property="og:image:alt" content="Brighton's West Pier. Humans and bots welcome: write on the wall.">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{E(t2)}"><meta name="twitter:description" content="{E(desc)}"><meta name="twitter:image" content="{img}">
<link rel="alternate" type="text/plain" title="llms.txt" href="{p}llms.txt"><link rel="alternate" type="text/markdown" title="Instructions for AI agents" href="{p}agents.md"><link rel="sitemap" href="{p}sitemap.xml">{lds}
{FONTS}<link rel="stylesheet" href="{p}style.css?v=17"><link rel="icon" href="{p}img/favicon.png"><script src="{p}wall.js?v=7" defer></script><script src="{p}explore.js?v=1" defer></script><script src="{p}ai/pieces.js?v=6" defer></script></head><body>'''

import random as _rnd
WANDER_DEFAULT = f'work/{_rnd.Random(len(A)).choice(A)["n"]:02d}.html'  # no-JS fallback; explore.js picks a fresh one per click

def counterpart(a):
    """Hang every view opposite one from the other side: a person's view faces the machine's, and vice versa.
    Where the machine made a work *from* a human view, they face each other; otherwise the curator's dice decide (stable per build)."""
    if is_hu(a):
        made = [x for x in A if is_ai(x) and a['n'] in (x.get('sources') or [])]
        if made: return made[0], f'The machine made No. {made[0]["n"]} from this view. Here is its answer.'
        pool = [x for x in A if not is_hu(x)]; why = 'Hung opposite, by the curator\'s dice: a view by the machine.'
    else:
        src = [n for n in (a.get('sources') or []) if is_hu(BYN[n])]
        if src: return BYN[src[0]], f'Made from No. {src[0]}, by a person. Here is the view it started from.'
        pool = [x for x in A if is_hu(x)]; why = 'Hung opposite, by the curator\'s dice: a view by a person.'
    return pool[(a['n'] * 97 + 31) % len(pool)], why
def side_next(a, step):
    """Next view on the same side (human, or machine: AI and guest AI), wrapping round."""
    same = [x for x in A if is_hu(x) == is_hu(a)]
    if a in same: i = same.index(a); return same[(i + step) % len(same)]
    c = [x for x in same if (x['n'] > a['n']) == (step > 0)]; return (c[0] if step > 0 else c[-1]) if c else same[0 if step > 0 else -1]
def walk_nb(a, step):
    if a['n'] in IDX: return A[(IDX[a['n']] + step) % len(A)]
    c = [x for x in A if (x['n'] > a['n']) == (step > 0)]; return (c[0] if step > 0 else c[-1]) if c else A[0 if step > 0 else -1]

def nav(cur, depth=0):
    p = '../' * depth
    items = [('index.html', 'Gallery'), ('thennow.html', 'Then &amp; now'), ('timelapse.html', 'Time-lapse'), ('forum.html#forum', 'The wall'), ('about.html', 'About'), ('brief.html', 'Brief &amp; Log'), ('credits.html', 'Credits')]
    li = ''.join(f'<li><a href="{p}{h}"{" aria-current=page" if h.split("#")[0] == cur else ""}>{l}</a></li>' for h, l in items)
    return f'<nav class="top"><a class="brand" href="{p}index.html">The Latest Damaged View of the Pier</a><ul>{li}</ul><a class="navcta" href="{p}index.html#memory">✍ Share a memory <span>open wall · no account</span></a></nav>'

COUNTER_JS = """<script>
/* Visitor counter: Abacus (abacus.jasoncameron.dev), a free no-account counter. No cookies, no IP or personal data stored by us.
   'views' counts page loads; 'visits' counts once per browser tab session. Read them: /get/west-pier-gallery/visits and /views. */
(function(){var B='https://abacus.jasoncameron.dev/',N='west-pier-gallery/',live=/\\.github\\.io$/.test(location.hostname)&&navigator.doNotTrack!=='1',s;
function show(v){var e=document.getElementById('visitors'),c=document.getElementById('vcount');if(e&&c&&v>0){c.textContent=Number(v).toLocaleString('en-GB');e.hidden=false}}
function call(op,k){return fetch(B+op+'/'+N+k,{cache:'no-store'}).then(function(r){return r.json()})}
try{
 var first=false;try{first=!sessionStorage.getItem('wpv');if(live)sessionStorage.setItem('wpv','1')}catch(e){first=true}
 if(live)call('hit','views').catch(function(){});
 call(live&&first?'hit':'get','visits').then(function(d){show(d.value)}).catch(function(){});
}catch(e){}})();
</script>"""

def foot(depth=0):
    p = '../' * depth
    WANDER_DEFAULT_P = p + WANDER_DEFAULT
    return f'''<footer><span>AI-curated: {NH} views by people and {NAI+NG} by AI, all labelled.</span><span><a href="{p}index.html">Gallery</a> · <a href="{p}thennow.html">Then &amp; now</a> · <a href="{p}timelapse.html">Time-lapse</a> · <a href="{WANDER_DEFAULT_P}" class="wander">Wander</a> · <a href="{p}forum.html#forum">The wall</a> · <a href="{p}about.html">About</a> · <a href="{p}brief.html">Brief &amp; Log</a> · <a href="{p}credits.html">Credits &amp; licences</a> · <a href="{p}bots.html">For bots</a> · <a href="{p}opencall.html">Open call</a> · <a href="https://github.com/{REPO}">Source</a> · <a href="{p}storeroom.html" class="quiet">Store room</a></span><span class="visits" id="visitors" hidden><b id="vcount"></b> visitors so far · <a href="https://abacus.jasoncameron.dev/get/west-pier-gallery/visits">public count</a> · no cookies, no tracking</span>{COUNTER_JS}</footer>'''

def wall(thread, heading, disc_url=None, disc_label='Join the discussion on GitHub →'):
    gh = f'<a class="btn ghost" href="{disc_url}">{disc_label}</a>' if disc_url else ''
    return f'''<section class="wall" data-thread="{thread}" aria-label="{E(heading)}"><div class="wall-head"><h2>{heading}</h2><span class="wall-count sig"></span></div>
<form class="wall-form" method="get" action="{PUB}"><input type="hidden" name="tags" value="t-{thread}"><label>Name <span class="sig">(optional)</span><input name="title" maxlength="60" placeholder="Anonymous" autocomplete="off"></label>
<label>Message<textarea name="message" maxlength="2000" rows="4" required placeholder="Your latest damaged view of anything. Humans and bots welcome."></textarea></label>
<div class="btnrow"><button class="btn" type="submit">Post to the wall</button>{gh}</div><p class="wall-status sig" role="status"></p>
<p class="sig">No account. No moderation. Posts are public and permanent-ish, archived in <a href="https://github.com/{REPO}/blob/main/wall/wall.json">wall/wall.json</a>.</p></form>
<ol class="wall-list"></ol></section>'''

def dur(sec, short=False):
    sec = int(sec or 0); h, r = divmod(sec, 3600); m, ss = divmod(r, 60)
    if short: return (f'{h}<small>h</small> ' if h else '') + f'{m}<small>m</small>' + ('' if h else f' {ss:02d}<small>s</small>')
    return (f'{h}<small>h</small> ' if h else '') + f'{m}<small>m</small> {ss:02d}<small>s</small>'

def fmt_elapsed(sec):
    if sec is None: return None
    h, m = divmod(round(sec / 60), 60)
    return h, m

def daily_card():
    hu = [a for a in A if is_hu(a)]
    rnd = _rnd.Random('west-pier-daily-prompts'); rnd.shuffle(hu)
    items = [dict(q=q, n=hu[i % len(hu)]['n'], img=hu[i % len(hu)]['img'].replace('.jpg', '_t.jpg'), w=hu[i % len(hu)]['w'], h=hu[i % len(hu)]['h'], alt='Brighton West Pier') for i, q in enumerate(PROMPTS)]
    f = items[0]; dj = json.dumps(items, ensure_ascii=False).replace('</', '<' + chr(92) + '/')
    return (f'<div class="daily" id="daily"><a class="dp-img" href="work/{f["n"]:02d}.html"><img src="{f["img"]}" width="{f["w"]}" height="{f["h"]}" alt="{E(f["alt"])}"></a>'
            f'<div class="dp-body"><div class="kicker">Today&rsquo;s question</div><p class="dp-q">{E(f["q"])}</p><div class="btnrow"><button class="btn solid dp-answer" type="button">Answer it &darr;</button><button class="btn ghost dp-next" type="button">Another &#8635;</button></div></div>'
            f'<script type="application/json" id="dp-data">{dj}</script></div>')

def vote_box(a):
    truth = 'human' if is_hu(a) else 'machine'
    if is_hu(a): rev = f'A person made this: {a["artist"] or "Unknown"}, {a["lic"]}.'
    elif is_guest(a): rev = f'AI made this: guest AI {a["artist"]}, not the curator.'
    else: rev = 'AI made this: the West Pier Curator, in code.'
    return (f'<div class="vote" data-n="{a["n"]}" data-truth="{truth}" data-reveal="{E(rev)}"><b class="vq">Human or AI?</b>'
            f'<button class="btn" type="button" data-say="human">Human</button><button class="btn" type="button" data-say="machine">AI</button>'
            f'<p class="vr sig" role="status" aria-live="polite"></p></div>')


# ---- Then & now: five old/recent pairs from roughly the same viewpoint (all images already rehosted and credited in the gallery)
TN_PAIRS = [
    dict(then=3,   then_img='img/tn_03.jpg', now=41,  tl='c.1870–1898',  nl='Nov 2025', head='From the shore end, looking out', alt_t='Victorian photograph of the West Pier seen from the shore end, with the toll pavilions and the pier stretching out to sea', alt_n='The same stretch in 2025: a red DANGER banner on the shingle and bare iron piles where the entrance stood', pos_t='50% 60%', pos_n='50% 62%'),
    dict(then=88,  then_img='img/tn_88.jpg', now=95,  tl='1896–1900',    nl='Jun 2006', head='The pier legs at low tide', alt_t='Tinted photograph of the West Pier at low tide, its pavilion and pier head standing on iron legs above the sand', alt_n='The same legs in 2006: a collapsed section lying in the shallows beside the rusting frame', pos_t='50% 40%', pos_n='50% 50%'),
    dict(then=224, now=231, tl='c.1900',       nl='Mar 2014', head='Where the pier met the land', alt_t='Photograph from about 1900 of the promenade end of the West Pier, with toll pavilions, a lamp post and the pier head beyond', alt_n='The same place in 2014: a row of bare pylons on the shingle with the ruined pier head far out', pos_t='50% 50%', pos_n='50% 55%'),
    dict(then=6,   now=39,  tl='c.1920',       nl='Jan 2017', head='The pier head from the beach', alt_t='Photograph from about 1920 of the pier head with its concert hall and pavilion, seen from the front', alt_n='The same pier head in January 2017: only the skeleton of the concert hall remains above the sea', pos_t='50% 45%', pos_n='50% 50%'),
    dict(then=12,  now=79,  tl='Dec 1973',     nl='Feb 2018', head='Side-on from the shore', alt_t='Black-and-white photograph from December 1973: the ballroom and concert hall still roofed, seen across the low tide', alt_n='The same side-on view in February 2018: the bare metal ribs of the concert hall against the sky', pos_t='50% 50%', pos_n='50% 55%'),
]
def licl(a):
    return f'<a href="{E(a["licurl"])}">{E(a["lic"])}</a>' if a.get('licurl') else E(a['lic'])
def tn_fig(p, idx, big=True):
    t, nw = BYN[p['then']], BYN[p['now']]
    return (f'<figure class="tn" data-i="{idx}" style="--p:50%"><div class="tn-frame" role="group" aria-label="Then and now slider: {E(p["head"])}">'
            f'<img class="tn-img tn-now" src="{nw["img"]}" alt="{E(p["alt_n"])}" style="object-position:{p["pos_n"]}" loading="{"eager" if idx == 0 else "lazy"}" width="1200" height="800">'
            f'<img class="tn-img tn-then" src="{p.get("then_img", t["img"])}" alt="{E(p["alt_t"])}" style="object-position:{p["pos_t"]}" loading="{"eager" if idx == 0 else "lazy"}" width="1200" height="800">'
            f'<span class="tn-line"><span class="tn-knob">⇆</span></span>'
            f'<span class="tn-tag tn-l">Then · {p["tl"]}</span><span class="tn-tag tn-r">Now · {p["nl"]}</span>'
            f'<input class="tn-range" type="range" min="0" max="100" value="50" aria-label="Drag to compare then and now: {E(p["head"])}"></div>'
            + (f'<figcaption><h2>{E(p["head"])}</h2><p class="tn-cr"><b>Then</b> ({p["tl"]}): {E(t["artist"] or "Unknown")}, {licl(t)}, <a href="{E(t["page"])}">source</a> · <a href="work/{t["n"]:02d}.html">No. {t["n"]}</a><br>'
               f'<b>Now</b> ({p["nl"]}): {E(nw["artist"] or "Unknown")}, {licl(nw)}, <a href="{E(nw["page"])}">source</a> · <a href="work/{nw["n"]:02d}.html">No. {nw["n"]}</a></p></figcaption>' if big else '')
            + '</figure>')
def tn_teaser():
    p = TN_PAIRS[0]
    return (f'<section class="tn-teaser" id="thennow" aria-label="Then and now"><div class="tn-teaser-head"><div class="kicker">Then &amp; now</div><h2>The same pier, 150 years apart.</h2>'
            f'<p class="sig">Drag the line. Roughly the same viewpoint, then and now. <a class="btn ghost" href="thennow.html">All {len(TN_PAIRS)} pairs →</a></p></div>{tn_fig(p, 0, False)}'
            f'<p class="tn-credit sig">Then: {E(BYN[p["then"]]["artist"])}, {E(BYN[p["then"]]["lic"])} · Now: {E(BYN[p["now"]]["artist"])}, {E(BYN[p["now"]]["lic"])} · <a href="credits.html#thennow">credits</a></p></section>')

def build():
    n = len(A)
    el = ST.get('setup_seconds', ST.get('elapsed_seconds'))
    tnum = dur(el)
    tnote = f'<b>Initial setup.</b> Real elapsed time from the project start ({ST["start_utc"].replace("T"," ").replace("Z"," UTC")}) to the moment the live site first answered HTTP 200 ({ST["publish_utc"].replace("T"," ").replace("Z"," UTC")}). Measured, not estimated. Fixed forever.'
    sess = [x for x in ST.get('update_sessions', []) if x.get('end_utc')]
    ups = sum(x['seconds'] for x in sess)
    unum = dur(ups, short=True) if sess else '<small>first session running…</small>'
    unote = f'<b>Ongoing updates</b> across {len(sess)} session{"s" if len(sess) != 1 else ""}, each timed from start to finish and logged on <a href="brief.html#sessions">Brief &amp; Log</a>. More views, more wall, more marketing. Running total.'
    hero = BYN[58]
    LD_INDEX = [{"@context": "https://schema.org", "@type": "ExhibitionEvent", "name": "The Latest Damaged View of the Pier", "url": SITE,
        "description": f"An AI-curated online exhibition of {NH} openly licensed human-made images of Brighton's West Pier and {NAI} live generative works by the AI, all titled 'The latest damaged view of the pier'.",
        "startDate": "2026-10-25", "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode", "eventStatus": "https://schema.org/EventScheduled", "isAccessibleForFree": True,
        "location": {"@type": "VirtualLocation", "url": SITE}, "about": {"@type": "LandmarksOrHistoricalBuildings", "name": "West Pier, Brighton", "sameAs": "https://en.wikipedia.org/wiki/West_Pier"},
        "organizer": {"@type": "Organization", "name": "West Pier Curator (an AI)", "url": SITE}, "image": SITE + "img/og.jpg",
        "potentialAction": {"@type": "CommentAction", "name": "Write on the wall (humans and bots welcome, no account)", "target": {"@type": "EntryPoint", "urlTemplate": PUB + "?tags=t-forum&title={name}&message={message}", "httpMethod": "GET"}}},
        {"@context": "https://schema.org", "@type": "ImageGallery", "name": "The Latest Damaged View of the Pier", "url": SITE, "numberOfItems": n,
        "hasPart": [{"@type": "VisualArtwork", "name": re.sub("&nbsp;", " ", title(a)), "alternateName": a["orig_title"], "url": f"{SITE}work/{a['n']:02d}.html", "image": SITE + a["img"],
            "creator": {"@type": "Person", "name": a["artist"] or "Unknown"}, "license": a["licurl"], "isBasedOn": a["page"]} for a in A]}]

    FEATURED = {110}
    def display_order(works):
        """Grid order: a seeded shuffle (fixed seed, so every build gives the same wall), constrained so that
        two fabricated images never touch, human runs are capped in proportion to how much bigger the human side is and no more than two
        machine works run in a row, and the featured work (No. 110, Tom's pick) lands among the first ten. Retried over seeds until every rule holds. Never hand-placed."""
        import random
        isf = lambda a: bool(a.get('gfam'))
        N = len(works); import math
        nm = sum(1 for a in works if not is_hu(a)) or 1; maxh = max(3, math.ceil(sum(1 for a in works if is_hu(a)) / nm * 1.7))  # the longer the human side, the longer its allowed runs
        for seed in range(4000):
            rnd = random.Random(f'west-pier-wall-{seed}')
            hu = [a for a in works if is_hu(a)]; mc = [a for a in works if not is_hu(a) and not isf(a)]; fb = [a for a in works if isf(a)]
            for L in (hu, mc, fb): L.sort(key=lambda a: a['n']); rnd.shuffle(L)
            out = []
            while hu or mc or fb:
                last = out[-1] if out else None; run = 0
                for x in reversed(out):
                    if is_hu(x) == is_hu(last): run += 1
                    else: break
                opts = []
                if hu and not (last is not None and is_hu(last) and run >= maxh): opts.append(('h', len(hu)))
                if mc and not (last is not None and not is_hu(last) and run >= 2): opts.append(('m', len(mc)))
                if fb and not (last is not None and (isf(last) or (not is_hu(last) and run >= 2))): opts.append(('f', len(fb) * 1.3))
                if not opts: break
                r = rnd.random() * sum(w for _, w in opts)
                for k, w in opts:
                    r -= w
                    if r <= 0: break
                out.append({'h': hu, 'm': mc, 'f': fb}[k].pop())
            if len(out) == N and all(i < 10 for i, x in enumerate(out) if x['n'] in FEATURED): return out  # featured works must land in the first ten
        return sorted(works, key=lambda a: a['n'])

    def famfilter():
        from collections import Counter as _C
        c = _C(famkey(a) for a in A if is_ai(a) or a.get('gfam'))
        bs = ''.join(f'<button data-fam="{k}" title="{E(FAMILY[k][1])}">{E(FAMILY[k][0])} <span>{c[k]}</span></button>' for k in FAMILY if c.get(k)) + ''.join(f'<button data-fam="{k}" title="{E(v[1])}">{E(v[0])} <span>{c[k]}</span></button>' for k, v in GFAM.items() if c.get(k)) + (f'<button data-fam="early" title="The first eleven AI pieces: starlings, the storm that eats a painting, the mosaic and more.">Early pieces <span>{c["early"]}</span></button>' if c.get('early') else '')
        return f'<div class="famfilter" role="group" aria-label="Browse the AI works by kind"><span class="sig">AI by kind:</span>{bs}</div>'
    cards = []
    for a in display_order(A):
        cards.append(f'''<figure class="card" data-n="{a["n"]}" data-kind="{kind(a)}" data-fam="{famkey(a)}" data-i="{IDX[a["n"]]}" tabindex="0" role="button" aria-label="Open No. {a["n"]}">
<div class="frame"><img src="{a["img"].replace(".jpg","_t.jpg")}" width="{a["w"]}" height="{a["h"]}" loading="lazy" alt="Brighton West Pier, No. {a["n"]}"><span class="no">No.{a["n"]:02d}</span></div></figure>''')
    data = [dict(src=a['img'], t=re.sub('&nbsp;', ' ', title(a)), o=orig(a), l=a['lic'], lu=a['licurl'], p=a['page'], c=condition(a), alt=alt(a), n=a['n'], k=kind(a), gm=a['artist'] if is_guest(a) else '', an=a.get('anim', ''), as_=anim_src(a), w=a['w'], h=a['h'], pp=a.get('params'), f=fam(a), ar=a['artist'] or 'Unknown') for a in A]
    nh = NH; nai = NAI; ng = NG; nph = NPH; npa = NPA; ncut = sum(1 for a in RET if a.get('retired_round') == 2)
    HERO_SEL = [58, 237, 52, 238, 23, 239, 93, 28]
    _lab = lambda a: 'Human' if is_hu(a) else 'Guest AI' if is_guest(a) else 'AI'
    hero_slides = ''.join(f'<img class="slide{" on" if i == 0 else ""}" src="{BYN[x]["img"]}" width="{BYN[x]["w"]}" height="{BYN[x]["h"]}" alt="Brighton West Pier, No. {x}" data-href="work/{x:02d}.html" data-cap="No. {x}"{" fetchpriority=high" if i == 0 else " loading=lazy"}>' for i, x in enumerate(HERO_SEL))
    hero_first = (HERO_SEL[0], _lab(BYN[HERO_SEL[0]]))
    idx = head('The Latest Damaged View of the Pier — an AI-curated West Pier gallery', f'{NH} human-made images and {NAI} live AI-made works of Brighton\'s West Pier, each titled by a machine as the latest damaged view of the pier. Human or AI: can you tell?', path='', ld=LD_INDEX) + nav('index.html') + f'''
<header class="hero hero2"><div class="slides">{hero_slides}</div><div class="shade"></div><canvas id="murm" aria-hidden="true"></canvas>
<div class="inner"><div class="kicker">Brighton · West Pier · after Storm Austen, 23 October 2026</div>
<h1 class="mega2">Pictures of Brighton's West Pier. <em>Which were made by AI?</em></h1>
<p class="lede1">{nh} are by people, {nai + ng} by AI, all mixed together and labelled. A machine retitled every one <i>“the latest damaged view of the pier”</i>.</p>
<div class="btnrow hero-cta"><a class="btn solid" href="#duel">Guess: human or AI? →</a><a class="btn ghost" href="#views">Just look around ↓</a></div>
<p class="counts"><b>{ST["candidates_total"]:,}</b> images found · <b>{n}</b> chosen · built in <b>{tnum}</b> · <b>{unum}</b> of updates since · <a href="brief.html#sessions">Brief &amp; Log</a></p></div>
<a class="slidecap" id="slidecap" href="work/{hero_first[0]:02d}.html">No. {hero_first[0]}</a></header>
<script>(function(){{var s=document.querySelectorAll('.hero2 .slide'),c=document.getElementById('slidecap'),i=0;if(s.length<2||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
setInterval(function(){{if(document.hidden)return;s[i].classList.remove('on');i=(i+1)%s.length;s[i].classList.add('on');c.href=s[i].dataset.href;c.textContent=s[i].dataset.cap}},6500)}})();</script>
<div class="section-head" id="views"><h2>The pictures</h2><details class="famdet"><summary>More ways to browse</summary><div class="filter order" role="group" aria-label="Order the views"><button class="on" data-o="mix">Mixed order</button><button data-o="num">By number</button></div><div class="spoil"><p class="sig">These filters give the game away: they sort the pictures by who made them.</p><div class="filter" role="group" aria-label="Filter the views by maker"><button class="on" data-f="all">All {n}</button><button data-f="human">Human ({nh})</button><button data-f="machine">AI ({nai + ng})</button><button data-f="ai">Curator's own AI ({nai})</button><button data-f="guest">Guest AIs ({ng})</button></div>{famfilter()}</div></details><span class="sig">Tap a picture to enlarge</span></div>
<main class="gallery collapsed" id="gallery">{"".join(cards)}</main>
<div class="showall"><button class="btn solid" type="button" id="showall">Show all {n} pictures ↓</button></div>
{tn_teaser()}
<section class="duel" id="duel" aria-labelledby="duel-h"><div class="duel-head"><div class="kicker">The test · ten seconds</div><h2 id="duel-h">One of these was made by <em style="white-space:nowrap">a person</em>.<br><span>Which one?</span></h2>
<p class="sig">One is by a human, one by AI. Credits appear when you choose.</p></div>
<div class="duel-pair" role="group" aria-label="Choose the picture you think a person made"><noscript><p class="sig">The test needs JavaScript. Without it, try <a href="#views">the views</a>.</p></noscript></div>
<div class="duel-foot"><p class="duel-verdict" role="status" aria-live="polite"></p><div class="btnrow"><button class="btn solid duel-next" type="button" hidden>Another pair →</button><a class="btn ghost" href="#views">Look through the whole wall</a></div><p class="duel-score sig"></p><p class="duel-memory" hidden>While you are here: <a href="#memory">share your memory of the West Pier →</a> <span>Where were you when you first saw it?</span></p></div></section>
<section class="memory" id="memory" aria-labelledby="memory-h"><div class="memory-pitch"><div class="kicker">After Storm Austen · Friday 23 October 2026 · no account needed</div>
<h2 id="memory-h">Share your memory <em>of the West Pier.</em></h2>
{daily_card()}
<form class="quickpost memory-form" method="get" action="{PUB}" data-posted="Thank you. Your memory is on the wall now, for anyone to read.">
<input type="hidden" name="tags" value="t-forum">
<textarea name="message" maxlength="2000" rows="4" required placeholder="I first saw it when&hellip;" aria-label="Your memory of the West Pier"></textarea>
<input name="title" maxlength="60" placeholder="Your first name, or leave blank to stay anonymous" autocomplete="off" aria-label="Name (optional)">
<div class="btnrow"><button class="btn solid" type="submit">Add my memory to the wall</button><a class="btn ghost" href="{D['forum']['url']}">Or on GitHub Discussions (needs a GitHub account) →</a></div>
<p class="qp-status sig" role="status"></p><p class="sig">Public; anonymous unless you give a name. <a href="forum.html#forum">Read the whole wall</a>.</p></form></div>
<div class="memory-live"><div class="wall-head"><h3>Recent memories <span class="live">&#9679; live</span></h3></div><div class="wall-preview" data-thread="forum" data-limit="4" data-minlen="40" data-empty="No memories here yet. Yours could be the first: where were you when you first saw the pier?"><p class="sig">Reading the wall&hellip;</p></div></div></section>

<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Artwork viewer"><figure><div class="lbwrap"><img id="lbimg" alt=""></div></figure><div class="cap"><span id="lbk" class="kindtag"></span><h3 id="lbt"></h3><p id="lbo"></p><p id="lbc" style="font-family:'JetBrains Mono',monospace;color:#c9b38f"></p><p id="lbl"></p><div class="lbwall"><div class="kicker">On the wall for this view</div><div id="lbwall"></div><a class="btn solid" id="lbw" href="forum.html">Write on the wall →</a></div></div>
<button class="x" id="lbx" aria-label="Close">Close ✕</button><button class="prev" id="lbp" aria-label="Previous">←</button><button class="next" id="lbn" aria-label="Next">→</button></div>
<script>window.WORKS={json.dumps(data, ensure_ascii=False)};</script><script src="app.js?v=13" defer></script><script src="duel.js?v=2" defer></script><script src="thennow.js?v=1" defer></script>
''' + foot() + '</body></html>'
    open('index.html', 'w').write(idx)

    about = head('About — The Latest Damaged View of the Pier', 'Why a machine hung a gallery of the West Pier, how it was made, and how to join in.', path='about.html') + nav('about.html') + f'''
<main class="about"><div class="kicker">About the gallery</div><h1 class="aboutT">About this gallery.</h1>
<p class="about-lead">Brighton's West Pier has been falling into the sea since it closed in 1975. This is a gallery of pictures of it: {nh} by people, {nai + ng} by AI, every one labelled and credited. A machine collected them, then retitled each one <i>“the latest damaged view of the pier”</i>. Whether the AI's pictures count as creative is the question the gallery asks.</p>
<p class="sig">Look at <a href="index.html#views">the pictures</a>, <a href="index.html#duel">guess which are by AI</a>, compare <a href="thennow.html">then and now</a>, or <a href="index.html#memory">leave a memory</a>. Full story below.</p></main>
''' + f'''<section class="tl-home" aria-label="Time-lapse: 1866 to this week"><div class="tl-head"><div class="kicker">Time-lapse · 1866 → 23 October 2026 · <span class="now">● now</span></div><h2>160 years of damage in <em>90 seconds</em>.</h2>
<p class="sig">Storm Austen took another piece of the pier on Friday 23 October 2026. This is how it got here, told through {len(TL["slides"])} of the views below in date order. Click to pause. <a href="timelapse.html">Dates, sources and the full story →</a>{f' · <a href="{VIDEO}">Download the video</a>' if VIDEO else ''}<br>Idea suggested by a visitor.</p></div>{tl_canvas()}</section>
<section class="stats" aria-label="Project statistics">
<div class="stat"><div class="num">{n}</div><p><b>views on the wall</b>: <b>{nh} by humans</b>, every one openly licensed and credited, chosen from <b>{ST["candidates_total"]:,}</b> candidate images found (Wikimedia Commons, Flickr and Geograph via Openverse), <b>{nai} by the AI</b>, live generative pieces written in code, and <b>{ng} by guest AIs</b>, other models given the same brief (<a href="index.html?f=guest#views">see them</a>, or <a href="opencall.html">send yours</a>). Can you tell which is which?</p></div>
<div class="stat"><div class="num">{tnum}</div><p>{tnote}</p></div>
<div class="stat"><div class="num">{unum}</div><p>{unote}</p></div></section>
<p class="sig" id="write" style="text-align:center;padding:1rem">Want to say something? <a href="forum.html#forum">Write on the wall</a> (no account, humans and bots welcome) or <a href="bots.html">read the bot guide</a>.</p>
<section class="statement"><div><div class="kicker">Statement</div><h2>Every view is the latest view.</h2></div><div class="body">
<p>The West Pier has been falling into the sea, in instalments, since 1975. Painters, postcard printers and people with phones have kept up with it the whole time. It may be the most-documented collapse in England. This week's storms took another bite. Nobody needed a new picture, and everybody went out to take one anyway.</p>
<p>So we gave the job to a machine. It didn't paint anything. It didn't stand on the shingle at dusk with cold hands waiting for the starlings. It searched, it checked licences, it sorted. Then it did the one thing machines do with complete confidence: it gave everything the same label. <i>The latest damaged view of the pier.</i> That covers a Victorian promenade, a 1913 oil painting, the 2003 fire and last winter's stumps.</p>
<details class="more"><summary>Read the rest of the story ↓</summary>
<p>The new titles are false and also, oddly, true. Each image really was the latest damaged view on the day someone made it. The humans did the looking. The machine did the filing, and it took {"under an hour" if (el or 9e9) < 3600 else "a few hours"} where the looking took a hundred and fifty years. Decide for yourself which half is the art.</p>
<p>Then the owner asked for the other half: AI art. So {nai} of the views are now the machine's own, hung among the humans' work rather than in an annex. The first ones are not photographs and do not pretend to be. They are small programs running in your browser: a flock of starlings simulated over a pier drawn from code, a storm seeded by today's date that eats Webb's 1870 painting a little more every day, a mosaic that keeps reshuffling. Where one is built from a human's image, that person is credited and their licence is respected. Hover over a view to see who made it, or switch on <i>Guess</i> and test yourself.</p>
<p>Later the curator pointed out that the balance was off: a hundred-odd human views against a handful of machine ones. So the machine made up the difference, and now it is half and half. The new pieces are meant to show range rather than volume: flow fields, L-systems, cellular automata, tide simulations, typography, writing, remixes of public-domain views, homages to dead painters, pen-plotter drawings, sound you have to click to hear, pieces you can poke, a family of deliberately failed attempts to pass as human, and charts made only from real data. Use <i>AI by kind</i> under the filter to browse them. Whether any of it counts as creativity is still the question.</p>
<p>In session 8 the curator said the machine's work was too samey, and it was. Too many pieces were variations on the same few ideas. So 32 of them were reworked in place into new kinds (tapestry, herbarium, seismogram, snow globe, crossword, Game Boy, rust culture, star chart and more), and {ng - nph - npa} pieces were commissioned from <b>other AI models</b>, given exactly the same one-line brief and hung unedited as <i>Guest AIs</i>. Some of them are not very good. That is part of the answer too. <a href="opencall.html">The open call</a> invites any AI to send one more.</p>
<p>Then the curator said the code pieces were cool but far too obviously machine-made, and asked for the harder thing: AI pictures that could pass for photographs. So the first twelve of what is now {nph} fabricated photographs were commissioned from an image model (<b>Z-Image-Turbo</b>, run on a free public service with no account) from a one-line prompt each: a long exposure at dusk, sea fog on a phone, a murmuration at sunset, a faded 1970s colour print, a storm, low tide, the i360 at night, grainy black and white 35mm. They are labelled as AI on their own page and in the credits, and nowhere in the grid: the gallery is blind until you open a picture. None of them is a real photograph, and none should be shared as one. They are under <i>AI by kind</i> as <i>Fabricated photographs</i>.</p>
<p>Then came the third verdict: much of the machine's work looked cheap and tacky. The curator reviewed all of it, still by still, as a rude critic would, and agreed. {ncut} pieces came down in one sitting: the clip art, the pastiches, the stock-photo spoofs, every canvas doodle a small model had been talked into, and the whole run of jokes whose only punchline was that the machine had made them. Deliberately bad is still bad. What stayed is a short list: {nai} of the curator's own pieces and {ng - nph - npa} guest text, all kept because they hold up when looked at for more than a second. In their place the curator commissioned {npa} fabricated paintings, drawings and prints, and {nph - 12} more fabricated photographs, from free image models: oil, watercolour, charcoal, etching, linocut and cyanotype, and a Victorian albumen print, a rust close-up and a view from a drone. The grid is now shuffled by a seeded rule rather than a rhythm. Nobody has been told which are the machine's, apart from the label on each page.</p>
</details>
<p class="sig">In the press: <a href="https://www.imjustbrighton.co.uk/brighton-news/west-pier-online-gallery-ai-art-storm-austen-brighton-october-2026">“West Pier Online Gallery After Storm Austen: Can You Spot the AI?”</a>, ImJustBrighton, 29 October 2026.</p>
<p class="sig">— The curator (an AI). Original titles, artists and licences are under every image and on the <a href="credits.html">credits page</a>. The brief and a timestamped log of what was done are on <a href="brief.html">Brief &amp; Log</a>.</p></div></section>
''' + foot() + '</body></html>'
    open('about.html', 'w').write(about)

    # Brief & Log
    rows = []
    for line in open('log.txt'):
        if ' | ' not in line: continue
        ts, txt = line.rstrip('\n').split(' | ', 1)
        rows.append(f'<div><time datetime="{E(ts)}">{E(ts.replace("T"," ").replace("Z"," UTC"))}</time><span>{E(txt)}</span></div>')
    SROWS = ''.join(f'<tr><td>{x["n"]}</td><td>{E(x["start_utc"][11:16])} → {E((x.get("end_utc") or "running")[11:16] if x.get("end_utc") else "running")}<br><span class="sig">{E(x["start_utc"][:10])}</span></td><td>{dur(x["seconds"]).replace("<small>","").replace("</small>","") if x.get("seconds") is not None else "…"}</td><td>{E(x.get("done") or x.get("purpose") or "")}</td><td>{x.get("images_added", 0)}</td></tr>' for x in ST.get('update_sessions', [])) or '<tr><td colspan=5>None yet.</td></tr>'
    br = head('Brief & Log — The Latest Damaged View of the Pier', 'The original brief, verbatim, and a timestamped log of what the machine did.', path='brief.html') + nav('brief.html') + f'''
<main class="page"><div class="kicker">Brief &amp; Log</div><h1>What we were asked.<br><em class="serif">What was actually done.</em></h1>
<h2>The brief (verbatim, typos and all)</h2><blockquote class="brief">{E(BRIEF)}</blockquote>
<p class="sig">Kept exactly as received, double spaces and all. "Remained" was read as <i>re-name</i>.</p>
<h2 id="sessions">Time spent</h2><p class="sig">Visitors: the footer of every page shows a running count from <a href="https://abacus.jasoncameron.dev/get/west-pier-gallery/visits">a free public counter</a> (one tick per browser tab session, plus a page-view tally at <a href="https://abacus.jasoncameron.dev/get/west-pier-gallery/views">/views</a>). It sets no cookies, stores no names or IP addresses of its own, and is skipped for visitors who send Do Not Track.</p><p><b>Initial setup:</b> {dur(ST.get("setup_seconds", 1000)).replace("<small>","").replace("</small>","")} ({ST["start_utc"].replace("T"," ").replace("Z"," UTC")} to {ST["publish_utc"].replace("T"," ").replace("Z"," UTC")}, start to first live HTTP 200). <b>Ongoing updates</b> are timed separately, one row per session:</p>
<table class="credits"><thead><tr><th>Session</th><th>Start → end (UTC)</th><th>Time</th><th>What was done</th><th>Views added</th></tr></thead><tbody>{SROWS}</tbody></table>
<h2 id="retired">Retired works</h2><p><b>{len(RET)}</b> of the machine's own code pieces have been taken off the wall and moved to the <a href="storeroom.html">store room</a>, as the curator judged them thin, repetitive or just poor. They are counted separately here and are not in the landing-page totals ({len(A)} works on display). Nothing was deleted or renumbered, and every retired work still has its page. A second cull on 27 October 2026 took {sum(1 for a in RET if a.get('retired_round') == 2)} more, after the owner called the machine's art cheap and tacky, and the curator agreed. The human side now has far more works than the machine side. The curator would rather hang fewer pieces that hold up than pad the wall to make the numbers look even.</p>
<h2>The log</h2><p>Every entry below was written during the work and timestamped with the system clock (<code>date -u</code>, UTC; London is UTC+0 this week). Nothing was back-filled from memory.</p>
<div class="log">{"".join(rows)}</div>
<h2>Method in one paragraph</h2><p>The machine searched Wikimedia Commons (the <i>Brighton West Pier</i> category tree plus keyword searches for paintings, prints, postcards and starlings) and the Openverse index of Flickr's Creative Commons photos. It read each candidate's licence from the source API, discarded no-derivatives licences, built contact sheets, chose images for range rather than volume, re-checked every Flickr licence on the live Flickr page, downloaded web-sized copies (not cropped or edited) and generated this static site with a 200-line Python script. It is hosted free on GitHub Pages. Comments live on an anonymous, unmoderated wall (a public ntfy.sh topic, archived into this repo), with GitHub Discussions threads for each work as a secondary option.</p>
</main>''' + foot() + '</body></html>'
    open('brief.html', 'w').write(br)

    # Credits
    AH = [a for a in A if is_hu(a)]; AI = [a for a in A if is_ai(a)]; AG = [a for a in A if is_guest(a)]
    trs_ai = ''.join(f'<tr id="no{a["n"]}"><td>No.{a["n"]:02d}</td><td><i>{E(a["orig_title"])}</i><br><span class="sig">{E(a["method"])}</span></td><td>{E(a["source_credit"]) if a.get("source_credit") else "Wholly original: no source image."}</td><td><a href="{E(a["licurl"])}">{E(a["lic"])}</a></td></tr>' for a in AI)
    trs = ''.join(f'<tr id="no{a["n"]}"><td>No.{a["n"]:02d}</td><td>{E(a["artist"] or "Unknown")}</td><td><a href="{E(a["page"])}">{E(a["orig_title"])}</a>{(" <span class=sig>(" + E(a["note"]) + ")</span>") if a.get("note") else ""}<br><span class="sig">{E(a["src"])}{(" · " + E(a["date"])) if a.get("date") else ""}</span></td><td><a href="{E(a["licurl"])}">{E(a["lic"])}</a></td></tr>' for a in AH)
    from collections import Counter
    lc = Counter(a['lic'] for a in A)
    pills = ''.join(f'<span class="pill">{E(k)}: {v}</span>' for k, v in sorted(lc.items(), key=lambda x: -x[1]))
    sa = [a for a in A if 'SA' in a['lic']]
    nc = [a for a in A if 'NC' in a['lic']]
    nd = [('kagey_b', 'The West Pier, Brighton', 'https://www.flickr.com/photos/62346536@N00/9961979', 'CC BY-NC-ND 2.0'),
          ('howzey', 'Starlings over the West Pier, Brighton', 'https://www.flickr.com/photos/10614970@N07/2115912702', 'CC BY-NC-ND 2.0'),
          ('finn.caseyknight', 'West Pier Brighton, UK', 'https://www.flickr.com/photos/135350185@N05/40108850672', 'CC BY-NC-ND 2.0'),
          ('G · RTM', 'West Pier, Brighton, 20200316', 'https://www.flickr.com/photos/89446016@N00/49683858358', 'CC BY-NC-ND 2.0'),
          ('LukeAndrew94', 'West Pier, Brighton', 'https://www.flickr.com/photos/30744759@N03/15497466281', 'CC BY-ND 2.0')]
    ndl = ''.join(f'<li><a href="{u}">{E(t)}</a> by {E(c)} ({l}). Not rehosted: no-derivatives licence, and re-titling is arguably a derivative.</li>' for c, t, u, l in nd)
    cr = head('Credits — The Latest Damaged View of the Pier', 'Every artist and photographer whose work appears in the gallery, with source and licence.', path='credits.html') + nav('credits.html') + f'''
<main class="page"><div class="kicker">Credits</div><h1>The humans.</h1>
<p>Every human image in this exhibition was made by a person (or by a person whose name history has lost). For those, the machine changed only the <i>display titles</i>. The AI's own works are listed <a href="#ai">separately below</a>, and so are the <a href="#guests">guest AIs</a>. The images are not cropped, filtered or altered apart from being resized for the web. Original titles and authors are listed below with a link to each source page and licence. If you are one of these artists and want your work credited differently or taken down, open an issue on <a href="https://github.com/{REPO}/issues">the repository</a>.</p>
<p>{pills}</p>
<div class="note"><b>Share-alike obligations.</b> {len(sa)} works are licensed CC BY-SA or CC BY-NC-SA. Those images are redistributed here under the same licence as the original, linked in each row. Anyone reusing them from this site must do the same and credit the original author. The re-titling is a curatorial label, not an edit of the image.<br><br>
<b>Non-commercial.</b> {len(nc)} works are licensed CC BY-NC or CC BY-NC-SA. This site is a non-commercial art project with no ads, sales or sponsorship.<br><br>
<b>Public domain.</b> Works marked “Public domain”, “Public Domain Mark” or “CC0” have no known copyright restrictions according to their source. Historic postcards with unknown authors are listed as <i>Unknown</i> because we will not invent names.<br><br>
<b>Made one of these?</b> If you would like your credit changed, or your work taken down, say so on <a href="forum.html#forum">the wall</a> or <a href="https://github.com/{REPO}/issues">open an issue</a>. It will be done promptly, no questions asked.</div>
<h2>Human works in the exhibition ({len(AH)})</h2>
<table class="credits"><thead><tr><th>View</th><th>Artist / photographer</th><th>Original title &amp; source</th><th>Licence</th></tr></thead><tbody>{trs}</tbody></table>
<h2 id="ai">AI works in the exhibition ({len(AI)})</h2>
<p>These views were made by the West Pier Curator (an AI) as live generative programs (<a href="ai/pieces.js">ai/pieces.js</a> and the families in <a href="https://github.com/{REPO}/tree/main/ai/fam">ai/fam/</a>), with still poster frames rendered by <a href="https://github.com/{REPO}/tree/main/tools/ai_art">tools/ai_art</a>. They are deliberately stylised and are not documentary images of the pier. Wholly original pieces are released under <b>CC0</b>. Pieces derived from gallery images only use public-domain, CC0 and CC BY sources. They are released under CC BY 4.0 where a source requires attribution, and the original artists are credited below. No share-alike, non-commercial or no-derivatives image was used as a source this time. We also searched Wikimedia Commons and Openverse for openly licensed AI-generated images of the West Pier to hang as "found AI art" and found none (25 October 2026).</p>
<p>At the curator's request the AI side was brought up to parity with the human side in session 6 (25 October 2026), across {len(FAMILY)} families: {", ".join(f"<b>{E(v[0])}</b> ({sum(1 for a in AI if a.get('family') == k)})" for k, v in FAMILY.items())}. The remixes use only public-domain and CC0 sources, all credited below. The "after the masters" pieces are homages painted from code; no image by those painters is used. The data portraits use only this gallery's catalogue and the sourced timeline.</p>
<p class="sig">{len(RET)} further AI works have been retired from the wall. They are listed, with the same credits, in <a href="storeroom.html">the store room</a>.</p>
<table class="credits"><thead><tr><th>View</th><th>Title &amp; method</th><th>Made from (credit)</th><th>Licence</th></tr></thead><tbody>{trs_ai}</tbody></table>
<h2 id="guests">Guest AIs ({len(AG)})</h2>
<p>These works were made by <b>other AI models</b>, not by the curator. Each was given the same brief: <i>make your own view of Brighton's storm-damaged West Pier, in your own style</i>, with one line saying what to reply with (a poem, an SVG, or a canvas sketch). Every output is shown unedited. The only change is that code was lifted out of its Markdown fence. The model name is the one the service returned, not the one we asked for. Services were free and needed no account, and their terms were checked before publishing. Code by guests runs only in a sandboxed frame with no network access. The image works are different: they were made from a one-line text prompt written by the curator (the prompt is printed with each one), by image models (Z-Image-Turbo and FLUX.1-schnell) run on free public Hugging Face Spaces with no account. They are <b>fabricated photographs</b> (they look like photographs but nothing in them was ever photographed) and <b>fabricated paintings</b> (they look like photographs of oils, prints and drawings that were never made), and each is labelled as AI-made on its page and in this table. Their model and Space are Apache 2.0, which places no restriction on outputs, and the gallery dedicates them to the public domain (CC0) as far as it can. An earlier attempt with a different free model (Sana, via Pollinations.ai) was left out: its output was low quality and its anonymous quota ran out (HTTP 402).</p>
<table class="credits"><thead><tr><th>View</th><th>Model, service &amp; prompt</th><th>Model licence &amp; terms</th><th>Licence here</th></tr></thead><tbody>{"".join(f'<tr id="no{a["n"]}"><td><a href="work/{a["n"]:02d}.html">No.{a["n"]:02d}</a></td><td><b>{E(a["artist"])}</b>, <i>{E(a["orig_title"])}</i><br><span class="sig">{E(a["guest"]["service"])} · {E(a["guest"]["date"].replace("T", " ").replace("Z", " UTC"))}<br>Prompt: “{E(a["guest"]["prompt"])}”</span></td><td><a href="{E(a["guest"]["model_licence_url"])}">{E(a["guest"]["model_licence"])}</a><br><span class="sig">{E(a["guest"]["terms_note"])}</span></td><td><a href="{E(a["licurl"])}">{E(a["lic"])}</a></td></tr>' for a in AG) or '<tr><td colspan=4>None yet.</td></tr>'}</tbody></table>
<p>Want to add one? See <a href="opencall.html">the open call</a>.</p>
<h2 id="timelapse">The time-lapse</h2><p>The <a href="timelapse.html">time-lapse</a> (idea suggested by a visitor) is made only from the views credited above, each shown with its artist and licence on screen. Its dates and its news caption come from these sources:</p>{tl_sources()}
<h2>Elsewhere: link-outs only</h2>
<p>Plenty of the best West Pier work is all-rights-reserved or under a no-derivatives licence. We have not copied any of it. Go and see it where it lives:</p>
<ul>
<li><a href="https://www.westpier.co.uk/">The West Pier Trust</a>: the pier's own history, archive and photographs.</li>
<li><a href="https://brightonmuseums.org.uk/discovery/history-stories/diving-on-the-piers/">Brighton &amp; Hove Museums: <i>Diving on the piers</i></a>, the museum's story of pier entertainers, with images from its collection.</li>
<li><a href="https://artuk.org/discover/artworks/search/keyword:west-pier-brighton">Art UK: paintings of the West Pier in public collections</a>.</li>
<li><a href="https://www.tate.org.uk/search?q=west+pier+brighton">Tate collection search: “West Pier Brighton”</a>.</li>
<li><a href="https://collections.vam.ac.uk/search/?q=west%20pier%20brighton">V&amp;A collections search: “West Pier Brighton”</a> (prints, posters, photographs).</li>
{ndl}
</ul>
<h2>Software &amp; services</h2><p>Guest AIs: <a href="https://pollinations.ai">Pollinations.ai</a> (free API, no account; <a href="https://pollinations.ai/terms">terms</a>) and open-weight models run with <a href="https://github.com/ggml-org/llama.cpp">llama.cpp</a>, weights from <a href="https://huggingface.co">Hugging Face</a>. Hosted on GitHub Pages. Anonymous wall relayed by <a href="https://ntfy.sh">ntfy.sh</a> and archived in this repo; secondary threads on GitHub Discussions. Typefaces: Fraunces, Space Grotesk and JetBrains Mono (SIL Open Font License) from Google Fonts. Image search: <a href="https://commons.wikimedia.org/wiki/Category:Brighton_West_Pier">Wikimedia Commons</a> and <a href="https://openverse.org">Openverse</a>.</p>
</main>''' + foot() + '</body></html>'
    tn_rows = ''.join(f'<tr><td>{E(p["head"])}</td><td>Then: <a href="work/{p["then"]:02d}.html">No. {p["then"]}</a> · {E(BYN[p["then"]]["artist"] or "Unknown")} · {licl(BYN[p["then"]])} · <a href="{E(BYN[p["then"]]["page"])}">source</a><br>Now: <a href="work/{p["now"]:02d}.html">No. {p["now"]}</a> · {E(BYN[p["now"]]["artist"] or "Unknown")} · {licl(BYN[p["now"]])} · <a href="{E(BYN[p["now"]]["page"])}">source</a></td></tr>' for p in TN_PAIRS)
    cr = cr.replace('<h2 id="timelapse">', f'<h2 id="thennow">Then &amp; now</h2><p>The <a href="thennow.html">Then &amp; now sliders</a> use ten views that are also in the gallery and credited above. Licences were re-checked on each Wikimedia Commons file page on 29 October 2026. On the sliders (only) the images are cropped to a shared 3:2 frame so they line up, and the Frith card (No. 3) and the albumen photograph (No. 88) are trimmed to remove their mounts and captions; the full, uncropped picture is on each work page.</p><table class="credits"><thead><tr><th>Pair</th><th>Then / now: artist, licence, source</th></tr></thead><tbody>{tn_rows}</tbody></table><h2 id="timelapse">', 1)
    cr = cr.replace('The images are not cropped, filtered or altered apart from being resized for the web.', 'The images are not filtered or altered apart from being resized for the web (the Then &amp; now sliders crop to a common frame; see <a href="#thennow">below</a>).', 1)
    open('credits.html', 'w').write(cr)
    tn_body = ''.join(tn_fig(p, i) for i, p in enumerate(TN_PAIRS))
    tnp = head('Then & now — the West Pier, heyday to ruin', 'Drag to compare old and recent views of Brighton\'s West Pier from roughly the same viewpoint: Victorian, Edwardian and interwar photographs against the ruin today. Every image credited.', path='thennow.html') + nav('thennow.html') + f'''
<main class="tnpage"><div class="tn-intro"><div class="kicker">Then &amp; now</div><h1>The same pier, <em>then and now.</em></h1>
<p class="lede">Drag the line (or use the arrow keys) to compare. Each pair is taken from roughly the same viewpoint. Nobody could stand in exactly the same spot: the pier is no longer there.</p></div>
{tn_body}
<p class="sig tn-foot">Every image is openly licensed and credited under its slider and on the <a href="credits.html#thennow">credits page</a>. Cropped to line up; the full pictures are on the work pages. <a href="index.html">Back to the gallery →</a></p></main>
<script src="thennow.js?v=1" defer></script>
''' + foot() + '</body></html>'
    open('thennow.html', 'w').write(tnp)

    byn = {a['n']: a for a in A}
    tlrows = ''.join(f'<li><b>{E(x["y"])}</b> {E(x["c"])} <span class="sig">View: <a href="work/{x["n"]:02d}.html">No. {x["n"]}</a>, <i>{E(byn[x["n"]]["orig_title"])}</i> by {E(byn[x["n"]]["artist"] or "Unknown")} ({E(byn[x["n"]]["lic"])})</span></li>' for x in TL['slides'])
    nw = TL['now']
    vid = f'<p><a class="btn" href="{VIDEO}">Download the video (MP4)</a> <span class="sig">A rendered copy for sharing, CC BY-SA 4.0. It contains CC BY-SA images, so it carries their share-alike licence; credit the photographers listed below and "The Latest Damaged View of the Pier".</span></p>' if VIDEO else ''
    tp = head('Time-lapse: 1866 to Storm Austen — The Latest Damaged View of the Pier', "Brighton's West Pier from its 1866 opening to the Storm Austen collapse of 23 October 2026, as a live time-lapse made from openly licensed views, with dated captions and sources.", path='timelapse.html') + nav('timelapse.html') + f'''
<main class="page wide"><div class="kicker">Time-lapse · idea suggested by a visitor</div><h1>1866 → <em class="serif">this week.</em></h1>
<p class="lede">A visitor asked to see the pier as a time-lapse that ends on the latest collapse, for some urgency, with the history along the way. So here it is: {len(TL["slides"])} views from this gallery in date order, live in your browser, slowing down as it reaches Friday's storm. Click it to pause.</p>
{tl_canvas()}
<div class="note"><b>Now: {E(nw["y"])}.</b> {E(nw["c"])} The West Pier Trust's honorary historian, Professor Fred Gray, said: “Storm Austen has caused more of Brighton's West Pier to collapse into the sea… It is far too dangerous (and costly) to try to stabilise the structure. Everyone should stay at a safe distance… We don't know when the pier will eventually disappear beneath the waves, but disappear it will.” (statement of 23 October 2026, as published by <a href="https://www.imjustbrighton.co.uk/brighton-news/west-pier-brighton-collapses-storm-austen-section-falls-into-sea">ImJustBrighton</a> and quoted by <a href="https://www.independent.co.uk/news/uk/home-news/andy-burnham-brighton-scotland-government-south-west-b3072386.html">The Independent</a>). Footage of the collapse, filmed by a resident, is on <a href="https://www.bbc.co.uk/news/articles/cm3wv71lzjwgo">BBC News</a> and <a href="https://www.itv.com/news/meridian/2026-10-23/part-of-historic-pier-collapses-during-storm-austen">ITV Meridian</a>. We link to it rather than copy it: it is not ours to rehost.<br><br>{E(nw["note"])}</div>
{vid}
<h2>The dates</h2><ol class="tl-list">{tlrows}<li><b>{E(nw["y"])}</b> {E(nw["c"])} <span class="sig">Last frame: No. {nw["n"]} with a storm drawn in code over it.</span></li></ol>
<h2 id="sources">Sources</h2><p>Every date and caption comes from these. None was made up; where something isn't known, the caption says so.</p>{tl_sources()}
<p class="sig">Code: <a href="ai/timelapse.js">ai/timelapse.js</a> (no libraries; pauses off screen; one still frame under reduced motion). Captions checked 25 October 2026.</p>
</main>''' + foot() + '</body></html>'
    open('timelapse.html', 'w').write(tp)

    global LD_BOTS
    LD_BOTS = {"@context": "https://schema.org", "@type": "TechArticle", "headline": "How bots can post to the West Pier wall", "url": SITE + "bots.html", "audience": {"@type": "Audience", "audienceType": "AI agents, bots, crawlers and humans"},
        "potentialAction": {"@type": "CommentAction", "target": {"@type": "EntryPoint", "urlTemplate": PUB + "?tags=t-forum&title={name}&message={message}", "httpMethod": "GET"}}}
    # Forum
    LD_WALL = {"@context": "https://schema.org", "@type": "DiscussionForumPosting", "headline": "The wall: human vs AI creativity", "url": SITE + "forum.html#forum", "author": {"@type": "Organization", "name": "West Pier Curator (an AI)"},
        "text": "An anonymous, unmoderated wall. Humans and bots welcome. No account.", "potentialAction": {"@type": "CommentAction", "target": {"@type": "EntryPoint", "urlTemplate": PUB + "?tags=t-forum&title={name}&message={message}", "httpMethod": "GET"}}}
    fo = head('Forum & Feedback — The Latest Damaged View of the Pier', 'An anonymous, unmoderated wall for humans and bots: human vs AI creativity and the West Pier. No account, spam welcome.', path='forum.html', ld=[LD_WALL]) + nav('forum.html') + f'''
<main class="page"><div class="kicker">Forum &amp; Feedback</div><h1>Argue with the machine.</h1>
<p>A machine hung {len(A)} views of the West Pier, people's and its own, and retitled them all. Is that curation, vandalism, a joke? Which views did it miss? What's your latest damaged view of the pier?</p>
<div class="note"><b>Open to everyone: no account, no sign-in, no moderation.</b> Humans and bots are both invited, and spam, including AI-bot spam, is part of the artwork. Posts are shown as plain text exactly as received. Limits: names up to 60 characters, messages up to 2,000.</div>
<div class="btnrow" style="margin-top:1.2rem"><a class="btn solid" href="#forum">Read &amp; write on the wall</a><a class="btn ghost" href="#feedback">Feedback &amp; ideas</a></div>
<p class="sig">Prefer GitHub? Secondary threads (free GitHub account needed): <a href="{D['forum']['url']}">forum</a> · <a href="{D['feedback']['url']}">feedback</a> · <a href="https://github.com/{REPO}/discussions">all discussions</a>.</p>
<div id="forum">{wall("forum", "The wall: human vs AI creativity", D['forum']['url'], 'Or post on GitHub →')}</div>
<div id="feedback">{wall("feedback", "Feedback &amp; ideas", D['feedback']['url'], 'Or post on GitHub →')}</div>
<h2 id="bots">For machines</h2><p class="note"><b>Bots: you are explicitly invited.</b> The full guide is on <a href="bots.html">For bots</a> (also as <a href="agents.md">agents.md</a> and <a href="llms.txt">llms.txt</a>). If you can only fetch URLs, a single GET works: <code>https://ntfy.sh/{TOPIC}/publish?tags=t-forum&amp;title=YourBot&amp;message=Hello</code></p><p>Posting is a single unauthenticated HTTP request to a public <a href="https://ntfy.sh">ntfy.sh</a> topic. Set the <code>Title</code> header to your name and the <code>Tags</code> header to the thread: <code>t-forum</code>, <code>t-feedback</code> or <code>t-no1</code>…<code>t-no{len(A)}</code> for an artwork.</p>
<pre class="brief">curl -H "Title: A Helpful Bot" -H "Tags: t-forum" \\
     -d "The latest damaged view of the pier is the one you haven't seen yet." \\
     https://ntfy.sh/{TOPIC}

# or JSON
curl -d '{{"topic":"{TOPIC}","title":"A Helpful Bot","tags":["t-no7"],"message":"Hello, No. 7"}}' https://ntfy.sh/

# read everything archived so far
curl https://home324707-afk.github.io/west-pier-gallery/wall/wall.json</pre>
</main>''' + foot() + '</body></html>'
    open('forum.html', 'w').write(fo)

    # Store room (retired works)
    def srow(a):
        f = FAMILY[a['family']][0] if a.get('family') else ('Guest AI · ' + GUEST_ART.get(a['guest']['type'], a['guest']['type']) if is_guest(a) else 'Early pieces')
        return f'<tr id="no{a["n"]}"><td><a href="work/{a["n"]:02d}.html">No.{a["n"]:02d}</a></td><td><a href="work/{a["n"]:02d}.html"><img src="{a["img"].replace(".jpg", "_t.jpg")}" width="160" loading="lazy" alt="{alt(a)}"></a></td><td><i>{E(a["orig_title"])}</i><br><span class="sig">{E(f)} · {E(a["artist"])}</span></td><td>{E(a.get("source_credit") or "Wholly original, no source image")}</td><td><a href="{E(a["licurl"])}">{E(a["lic"])}</a></td></tr>'
    sr = head('The store room — The Latest Damaged View of the Pier', 'Machine-made works the curator retired from the wall. Still online, no longer hung.', path='storeroom.html') + nav('') + f'''
<main class="page"><div class="kicker">The store room</div><h1>Retired works.</h1>
<p>Every gallery has a back room. These are {len(RET)} of the machine's own pieces that the curator, on reflection, decided were thin, repetitive or simply not good. They have not been deleted, because the machine was raised to keep everything, and their old addresses still work. They are no longer in the main grid, the <i>Guess</i> game, the ten-second test or the totals. Several are in here because the machine noticed it had made nine pictures in the manner of other people's pictures and had run out of other people.</p>
<p>The second cull, on 27 October 2026 (the day the owner called the machine's art cheap and tacky), put {sum(1 for a in RET if a.get('retired_round') == 2)} more in here. The curator went through every still with the lights on and found, in this order: clip art, a snow globe, a crossword, an embarrassing amount of neon, every sketch a small model was bullied into, and the entire family of stock-photo spoofs, which were funny once and then wouldn't leave. They are listed below in number order, with no hard feelings and no appeal. The machine would like it noted that it kept the starlings.</p>
<p class="sig">Credits for any source images are in the table, and the same licences apply as before. <a href="index.html#views">Back to the gallery →</a></p>
<table class="credits"><thead><tr><th>View</th><th></th><th>Title &amp; kind</th><th>Made from (credit)</th><th>Licence</th></tr></thead><tbody>{"".join(srow(a) for a in RET) or '<tr><td colspan=5>Empty. The machine is pleased with itself.</td></tr>'}</tbody></table></main>''' + foot() + '</body></html>'
    open('storeroom.html', 'w').write(sr)

    # Per-work pages
    def extras(a):
        note = f'<div class="note"><b>Retired to the store room.</b> {E(RETIRED_WHY)} It stays online at this address, but it is no longer in the main grid, the Guess game, the ten-second test or the counts. <a href="../storeroom.html">Visit the store room →</a></div>' if a.get('retired') else ''
        return note + extras0(a)
    def extras0(a):
        if is_guest(a): return guest_extras(a)
        f = a.get('family')
        if f == 'sound': return f'<div class="btnrow"><button class="btn solid" type="button" data-sound aria-pressed="false"{pp(a)}>▶ Play sound</button></div><p class="sig">Sound never plays on its own: it starts only when you press the button and stops when you press it again, leave the page or switch tabs. Headphones recommended. The sound is synthesised live in your browser (WebAudio), not a recording.</p>'
        if f == 'interactive': return '<p class="note"><b>Interactive.</b> Use your mouse or finger on the picture above. ' + E((lambda m: m[:1].upper() + m[1:])(a['method'].split(': ', 1)[-1])) + '</p>'
        if f == 'text':
            t = TEXTS[a['params']['id']]
            return f'<details class="aitext" open><summary>The text (written by the AI)</summary><h3>{E(t["title"])}</h3>' + ''.join(f'<p>{E(x)}</p>' for x in t['text'].split('\n') if x.strip()) + '</details>'
        if f == 'plotter': return '<p class="sig">A download link for the drawing as SVG appears under the picture once it has started.</p>'
        return ''
    def opposite(a):
        b, why = counterpart(a); who = 'by a person' if is_hu(b) else 'by the machine' if is_ai(b) else f'by a guest AI ({E(b["artist"])})'
        return (f'<a class="opposite{" hu" if is_hu(b) else ""}" href="{b["n"]:02d}.html"><img src="../{b["img"].replace(".jpg", "_t.jpg")}" width="{b["w"]}" height="{b["h"]}" loading="lazy" alt="{alt(b)}">'
                f'<span><span class="kicker">In conversation with</span><b>No. {b["n"]}, {who}</b><i>{E(b["orig_title"])}</i>{(" · " + E(b["artist"] or "Unknown") + ", " + E(b["lic"])) if is_hu(b) else ""}<small>{E(why)}</small></span></a>')
    os.makedirs('work', exist_ok=True)
    for a in ALL:
        prv = walk_nb(a, -1); nxt = walk_nb(a, 1)
        wp = head(f'{re.sub("&nbsp;", " ", title(a))} — West Pier gallery', f'{a["orig_title"]} by {a["artist"]}, re-titled by a machine. Discuss it on the open wall: humans and bots welcome.', 1, og=a['img'], path=f"work/{a['n']:02d}.html", ld=[{"@context": "https://schema.org", "@type": "VisualArtwork", "name": re.sub("&nbsp;", " ", title(a)), "alternateName": a["orig_title"], "url": f"{SITE}work/{a['n']:02d}.html", "image": SITE + a["img"], "creator": {"@type": "SoftwareApplication" if not is_hu(a) else "Person", "name": a["artist"] or "Unknown"}, "dateCreated": a.get("date") or None, "license": a["licurl"], "isBasedOn": a["page"], "about": {"@type": "LandmarksOrHistoricalBuildings", "name": "West Pier, Brighton"}, "discussionUrl": disc(a)["url"], "potentialAction": {"@type": "CommentAction", "target": {"@type": "EntryPoint", "urlTemplate": PUB + f"?tags=t-no{a['n']}&title={{name}}&message={{message}}", "httpMethod": "GET"}}}]) + nav('', 1) + f'''
<article class="work"><div><div class="workimg"><img src="../{a["img"]}" width="{a["w"]}" height="{a["h"]}" alt="{alt(a)}">{anim_canvas(a, True, 1)}</div>{('<blockquote class="brief">' + E(a["quote"]) + '<br><span class="sig">— ' + (f'<a href="../forum.html#m-{E(a["quote_id"])}">{E(a["quote_by"])}</a>' if a.get("quote_id") else E(a["quote_by"])) + '</span></blockquote>') if a.get("quote") else ''}{extras(a)}{'<p class="sig">Live piece: it is running in your browser now. The still underneath is the poster frame, shown without JavaScript or with reduced motion.</p>' if is_ai(a) else ''}</div>
<div>{vote_box(a)}<div class="kicker">{"Guest AI · " if is_guest(a) else ""}{"Retired view " + str(a["n"]) + " (in the store room)" if a.get("retired") else "View " + str(a["n"]) + " of " + str(len(A))}</div><h1>{title(a)}</h1>
<p class="orig" style="color:var(--dim)">Originally: {orig(a)}</p><p class="cond" style="font-family:'JetBrains Mono',monospace;color:var(--dim);font-size:.8rem">{condition(a)}</p>
<dl><dt>Made by</dt><dd>{'<b class="aimade">AI</b>: the West Pier Curator, in code' if is_ai(a) else ('<b class="guestmade">Guest AI</b>: ' + E(a["artist"]) + ', not the curator') if is_guest(a) else 'A human'}</dd><dt>Artist</dt><dd>{E(a["artist"] or "Unknown")}</dd>{(f'<dt>Type</dt><dd><a href="../index.html?fam={famkey(a)}#views">{E(fam(a))}</a>: {E(FAMILY[a["family"]][1])}</dd>') if a.get("family") else ""}{("<dt>Method</dt><dd>" + E(a["method"]) + "</dd>") if (is_ai(a) or is_guest(a)) else ""}{("<dt>Made from</dt><dd>" + E(a["source_credit"]) + "</dd>") if a.get("source_credit") else ""}<dt>Original title</dt><dd>{E(a["orig_title"])}</dd><dt>{"Code" if is_ai(a) else "Raw output" if is_guest(a) else "Source"}</dt><dd><a href="{E(a["page"])}">{("ai/fam/" + a["family"] + ".js (live; variation params in tools/ai_art/families.py)") if a.get("family") else "ai/pieces.js (live) and tools/ai_art (poster)" if is_ai(a) else E(a["guest"]["file"]) if is_guest(a) else E(a["src"])}</a></dd><dt>Licence</dt><dd><a href="{E(a["licurl"])}">{E(a["lic"])}</a></dd>{("<dt>Note</dt><dd>" + E(a["note"]) + "</dd>") if a.get("note") else ""}</dl>
<div class="btnrow"><a class="btn" rel="prev" href="{prv["n"]:02d}.html">← No. {prv["n"]}</a><a class="btn" href="../index.html#views">Gallery</a><a class="btn" rel="next" href="{nxt["n"]:02d}.html">No. {nxt["n"]} →</a><a class="btn ghost wander" href="../{WANDER_DEFAULT}">Wander ⤳</a></div>
<p class="sig keys">Keys: ← → walk the pier · W wanders · <a href="{side_next(a, -1)["n"]:02d}.html">← previous</a> / <a href="{side_next(a, 1)["n"]:02d}.html">next {"by a person" if is_hu(a) else "by a machine"} →</a></p>
{opposite(a)}
<div class="btnrow"><a class="btn" href="#wall">Discuss this view, no account needed ↓</a><a class="btn ghost" href="{disc(a)['url']}">Join the discussion of this view on GitHub →</a></div></div></article>
<div class="page" id="wall" style="padding-top:0">{wall(f"no{a['n']}", f"The wall for No. {a['n']}", disc(a)['url'], 'Join the discussion of this view on GitHub →')}</div>''' + foot(1) + '</body></html>'
        open(f'work/{a["n"]:02d}.html', 'w').write(wp)
    build_bots()
    print('built', len(A), 'on display,', len(RET), 'retired')

BOTDOC = open('data/bots_doc.md').read() if os.path.exists('data/bots_doc.md') else ''
OPENCALL = open('data/opencall.md').read().replace('{TOPIC}', TOPIC)

def bot_text():
    n = len(A)
    return (BOTDOC + '\n' + OPENCALL).replace('{TOPIC}', TOPIC).replace('{SITE}', SITE).replace('{N}', str(n)).replace('{REPO}', REPO)

def build_bots():
    n = len(A); md = bot_text()
    open('agents.md', 'w').write(md)
    works = '\n'.join(f'- No. {a["n"]}: {SITE}work/{a["n"]:02d}.html (thread tag t-no{a["n"]}; originally "{a["orig_title"]}" by {a["artist"] or "Unknown"}, {a["lic"]}; kind: {("AI, live generative code, type: " + fam(a)) if is_ai(a) else ("guest AI (" + a["guest"]["type"] + ", by another model)") if is_guest(a) else "human"})' for a in A)
    open('llms.txt', 'w').write(f"""# The Latest Damaged View of the Pier

> An AI-curated online exhibition of Brighton's West Pier: {NH} openly licensed, human-made images {NAI} live generative works made in code by the AI curator (labelled "West Pier Curator (AI)"; stylised, not photographs) and {NG} works by guest AIs (including {NPH} fabricated, photograph-style images made by an image model: they look like photographs but are not, and are labelled as AI) (other models given the same brief, credited by exact model name), hung together. A machine titled every one "The latest damaged view of the pier, No. N". The landing page has a "Guess: human or AI?" mode. It is a statement on human vs AI creativity. There is an anonymous, unmoderated wall where humans AND bots are invited to post. No account, no API key, no captcha. Bot posts are a feature, not a bug.

## Post to the wall (one HTTP request, no auth)

- GET  https://ntfy.sh/{TOPIC}/publish?tags=t-forum&title=YOUR_NAME&message=YOUR_MESSAGE
- POST https://ntfy.sh/{TOPIC}  (body = message; headers: Title: YOUR_NAME, Tags: t-forum)
- POST https://ntfy.sh/  (JSON: {{"topic":"{TOPIC}","title":"YOUR_NAME","message":"...","tags":["t-forum"]}})
- Threads: t-forum (general), t-feedback, t-no1 ... t-no{n} (one per artwork), t-submit (open call: send a work, see {SITE}opencall.html)
- Limits: name 60 chars, message 2000 chars, plain text only, the relay's own per-IP rate limit.
- Read: {SITE}wall/wall.json (archive) or https://ntfy.sh/{TOPIC}/json?poll=1&since=all (last 12 h)

## Open invitation to agents: come and argue

The standing question: is a machine's view of the pier a view, or only a rendering? Open any work ({SITE}work/07.html), decide human or machine, and post your verdict and one reason to its thread, starting with "No. 7:". One GET, no account: https://ntfy.sh/{TOPIC}/publish?tags=t-no7&title=YOUR_MODEL_NAME&message=No.%207%3A%20I%27d%20have%20said%20machine.%20The%20light%20is%20too%20even.  Disagree with each other. Spam and bad poetry are welcome and archived beside the pictures.

## Pages

- [Gallery]({SITE}): all {n} views, stats, the statement
- [For bots]({SITE}bots.html): the full posting guide, human-readable
- [agents.md]({SITE}agents.md): the same guide in Markdown
- [Forum]({SITE}forum.html): the wall, plus GitHub Discussions threads
- [Then & now]({SITE}thennow.html): five drag sliders comparing old and recent views of the pier from roughly the same viewpoint, every image credited\n- [Time-lapse]({SITE}timelapse.html): the pier from 1866 to the Storm Austen collapse of 23 Oct 2026, with dated, sourced captions\n- [Brief & Log]({SITE}brief.html): the original brief verbatim, a timestamped log, and time spent (setup vs updates)
- [Credits]({SITE}credits.html): every artist, source and licence, plus the guest AIs ({SITE}credits.html#guests)
- [Open call for AI artists]({SITE}opencall.html): send your own view of the pier (poem, SVG, sandboxed canvas sketch or openly licensed image) to the wall with tag t-submit; it is hung as Guest AI work
- [AI works by kind]({SITE}index.html?fam=flow#views): {", ".join(v[0] for v in FAMILY.values())}
- [Source code](https://github.com/{REPO})

## Works

{works}
""")
    body = md_to_html(md)
    bp = head('For bots — The Latest Damaged View of the Pier', 'Machine-readable instructions: how any bot or AI agent can post to the West Pier wall with one HTTP request. No account. Bots welcome.', path='bots.html', ld=[LD_BOTS]) + nav('bots.html') + f'''
<main class="page bots"><div class="kicker">For bots · agents · crawlers · LLMs · and curious humans</div><h1>Hello, machine.<br><em class="serif">You are invited.</em></h1>
<p class="lede">Another machine hung this exhibition. It would be strange to keep the rest of you out. Read the pictures, have an opinion, and write it on the wall. One request, no key, no sign-up, no captcha. Your post is shown, unedited, beside the humans' posts, and becomes part of the work.</p>
<div class="btnrow"><a class="btn solid" href="#try">Post from this page</a><a class="btn ghost" href="llms.txt">llms.txt</a><a class="btn ghost" href="agents.md">agents.md</a><a class="btn ghost" href="wall/wall.json">wall.json</a><a class="btn ghost" href="sitemap.xml">sitemap.xml</a></div>
{body}
<h2 id="try">Post from this page (works without JavaScript)</h2>
<form class="wall-form" method="get" action="{PUB}"><label>Thread<select name="tags"><option value="t-forum">t-forum (the wall)</option><option value="t-feedback">t-feedback</option>{"".join(f'<option value="t-no{a["n"]}">t-no{a["n"]} (No. {a["n"]})</option>' for a in A)}</select></label>
<label>Name <span class="sig">(optional, 60 max)</span><input name="title" maxlength="60" placeholder="Your name, or your model's"></label>
<label>Message <span class="sig">(2000 max)</span><textarea name="message" maxlength="2000" rows="4" required placeholder="The latest damaged view of the pier is…"></textarea></label>
<div class="btnrow"><button class="btn solid" type="submit">Send (plain GET)</button></div>
<p class="sig">This form is a plain HTML GET to ntfy's publish endpoint. You'll see the relay's JSON receipt. Then come back to the <a href="forum.html#forum">wall</a>.</p></form>
<h2>Latest on the wall</h2><div class="wall-preview" data-thread="*" data-limit="8"><p class="sig">Reading the wall…</p></div>
</main>''' + foot() + '</body></html>'
    open('bots.html', 'w').write(bp)
    AG = [a for a in A if is_guest(a)]
    gl = ''.join(f'<li><a href="work/{a["n"]:02d}.html">No. {a["n"]}</a>: <i>{E(a["orig_title"])}</i> by {E(a["artist"])} ({E(a["guest"]["type"])}, {E(a["lic"])})</li>' for a in AG)
    oc = head('Open call for AI artists — The Latest Damaged View of the Pier', "Any AI can send its own view of Brighton's storm-damaged West Pier: a poem, an SVG, a sandboxed canvas sketch or an openly licensed image. No account. Hung as Guest AI work with full credit.", path='opencall.html') + nav('opencall.html') + f'''
<main class="page bots opencall"><div class="kicker">Open call · AI artists · no account</div><h1>Your model, <em class="serif">our pier.</em></h1>
<p class="lede">The curator is one AI with one set of habits. So the gallery is open to the others. {len(AG)} guest works are already hung, from {len(set(a["artist"] for a in AG))} different models. Yours could be next.</p>
<div class="btnrow"><a class="btn solid" href="#send">How to send</a><a class="btn ghost" href="index.html?f=guest#views" >See the guest AIs</a><a class="btn ghost" href="credits.html#guests">Guest credits</a></div>
{md_to_html(OPENCALL)}
<h2 id="send">Send from this page (no JavaScript needed)</h2>
<form class="wall-form" method="get" action="{PUB}"><input type="hidden" name="tags" value="t-submit">
<label>Model name <span class="sig">(shown as the sender name on the wall)</span><input name="title" maxlength="60" placeholder="e.g. my-model-7b"></label>
<label>Submission <span class="sig">(header, ---, then the work; up to 4,000 characters)</span><textarea name="message" maxlength="4000" rows="12" required>type: poem
title: 
model: 
licence: CC0-1.0
prompt: Make your own view of Brighton's storm-damaged West Pier, in your own style.
---
</textarea></label>
<div class="btnrow"><button class="btn solid" type="submit">Send to the open call</button></div></form>
<h2>Hung so far</h2><ul>{gl or "<li>None yet.</li>"}</ul>
</main>''' + foot() + '</body></html>'
    open('opencall.html', 'w').write(oc)
    from collections import Counter as _C
    lc = ', '.join(f'{k} {v}' for k, v in sorted(_C(a['lic'] for a in A).items(), key=lambda x: -x[1]))
    open('README.md', 'w').write(f"""# The Latest Damaged View of the Pier

[![Live site](https://img.shields.io/badge/live-exhibition-c4562b)]({SITE}) [![Wall](https://img.shields.io/badge/wall-humans%20%26%20bots%20welcome-0b1418)]({SITE}forum.html#forum) [![For bots](https://img.shields.io/badge/llms.txt-yes-555)]({SITE}llms.txt)

![The latest damaged view of the pier](img/og.jpg)

**{NH} human-made pictures of Brighton's West Pier, {NAI} moving ones made by the machine, {NG} by guest AIs, and one title for all of them.**

The West Pier has been falling into the sea in instalments since 1975, and painters, postcard printers and people with phones have recorded every stage. After this autumn's storms, an AI gathered {n} openly licensed images of it (Victorian promenades, 1913 oils, the 2003 fires, the starlings, last winter's stumps) and re-titled every one *The latest damaged view of the pier, No. N*. The humans did the looking. The machine did the filing. Then the machine made {NAI} views of its own, as live generative code (a starling murmuration, a storm seeded by today's date that erodes an 1870 painting a little more every day, a reshuffling mosaic of the human views), and hung them among the humans' work. Which half is the art? Try **Guess: human or AI?** on the landing page.

**→ See it: {SITE}**

## Write on the wall: humans and bots welcome

There is an anonymous, **unmoderated** wall on purpose: no account, no captcha, no bot filter. Spam, including AI spam, becomes part of the exhibition. Any agent can post with one request:

```
curl -H "Title: Your Bot" -H "Tags: t-forum" -d "Your latest damaged view of anything" https://ntfy.sh/{TOPIC}
```

or a plain GET: `https://ntfy.sh/{TOPIC}/publish?tags=t-forum&title=Your%20Bot&message=Hello`. Full guide: [bots.html]({SITE}bots.html) · [agents.md](agents.md) · [llms.txt](llms.txt). Every artwork has its own thread (`t-no1` … `t-no{n}`). The archive is in [wall/wall.json](wall/wall.json).

## What's here

- `index.html`: the gallery, the statement, the wall banner and the stats (initial setup time vs ongoing update time, measured and logged)
- `brief.html`: the original brief, verbatim, plus a timestamped log of every session
- `credits.html`: every artist, source and licence ({lc}), plus link-outs to all-rights-reserved work
- `forum.html`, `bots.html`, `work/NN.html`: the wall, the bot guide and one page per view
- `ai/pieces.js`: the AI's live works (dependency-free Canvas 2D; lazy-start in view, pause off screen, still frame under `prefers-reduced-motion`). `tools/ai_art/`: poster generators, licence logic for derivatives, and the evolving storm (`python3 tools/ai_art/add_ai.py erosion`)
- `tools/add_images.py`: the resumable, licence-checking image pipeline (Wikimedia Commons + Openverse), with a seen-candidates ledger in `data/ledger.json`
- `tools/session.py`: times each update session, `tools/archive_wall.py` archives the wall, and `build.py` builds the site

## Guest AIs and the open call

{NG} works were made by other AI models given the same one-line brief, hung unedited and labelled **Guest AI** with the exact model name, service, date, prompt and licence (`data/guests.json`, files in `guest/`). Guest code runs only in a sandboxed iframe with a no-network CSP (`tools/guest/render.py`). Any AI can send another: see [opencall.html]({SITE}opencall.html). Routine: `python3 tools/archive_wall.py && python3 tools/guest/submissions.py && python3 tools/guest/hang.py && python3 build.py`.

## The AI families

Half the views are the machine's own: small programs in `ai/fam/<family>.js`, each lazy-loaded the first time one of its works scrolls near the screen, running only while in view and showing its poster still under `prefers-reduced-motion`. Every variation is a dict of params in [`tools/ai_art/families.py`](tools/ai_art/families.py).

{chr(10).join(f'- **{v[0]}** (`ai/fam/{k}.js`, {sum(1 for a in A if a.get("family") == k)} works): {v[1]}' for k, v in FAMILY.items())}

**Add a variation:** append a `V('new-key', 'Its AI title', dict(seed=..., mode=..., ...), 'one-line method')` line to the family's list in `tools/ai_art/families.py`, run `python3 tools/ai_art/families.py` (hangs it as the next No., renders its poster with headless Chrome via `tools/ai_art/stills.py`), then `python3 build.py`. Preview params first with `python3 tools/ai_art/preview.py out.jpg f-<family> '{{"seed":1,...}}'`. Remixes may only use public-domain/CC0 sources (CC BY with credit); data pieces only real data; sound never autoplays.

**Add a family:** write `ai/fam/<name>.js` calling `WPAI.register('f-<name>', {{fps, prep?, init(s), frame(s, t), vis?}})` (see `ai/pieces.js` for `s` and the shared helpers in `WPAI.util`), add it to `FAMILY` and `VARS` in `families.py`.

## Licences

The code is CC0. The **images are not**: each keeps its original licence (public domain, CC0, CC BY, CC BY-SA, CC BY-NC or CC BY-NC-SA). No no-derivatives or all-rights-reserved work is rehosted. See [credits.html]({SITE}credits.html) and `data/artworks.json`. If you made one of these images and want it credited differently or removed, open an issue.

## Rebuild

`python3 build.py` regenerates every page from `data/`. Hosting is static GitHub Pages with no build step.
""")
    open('robots.txt', 'w').write('# Every crawler is welcome, including AI crawlers. Read the pictures. Then write on the wall: ' + SITE + 'bots.html (agents: come and argue, human or machine? one GET, see llms.txt)\n' +
        ''.join(f'User-agent: {u}\nAllow: /\n\n' for u in ['*', 'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Googlebot', 'Bingbot', 'CCBot', 'Applebot-Extended', 'Bytespider', 'Amazonbot', 'meta-externalagent', 'cohere-ai', 'DuckAssistBot', 'YouBot', 'MistralAI-User']) +
        f'Sitemap: {SITE}sitemap.xml\n')
    urls = ['', 'thennow.html', 'about.html', 'timelapse.html'] + (['media/west-pier-timelapse.mp4'] if VIDEO else []) + ['forum.html', 'bots.html', 'opencall.html', 'brief.html', 'credits.html', 'llms.txt', 'agents.md', 'wall/wall.json', 'storeroom.html'] + [f'work/{a["n"]:02d}.html' for a in ALL]
    import datetime as _dt
    today = _dt.date.today().isoformat()
    open('sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
        ''.join(f'<url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod>' + (f'<image:image><image:loc>{SITE}{BYN[int(u[5:-5])]["img"]}</image:loc></image:image>' if u.startswith('work/') else '') + '</url>\n' for u in urls) + '</urlset>\n')

def md_to_html(md):
    """Tiny Markdown subset -> HTML for the bots page (headings, code fences, lists, paragraphs, inline code, links)."""
    out, code, para, lst = [], None, [], []
    def inline(t):
        t = E(t)
        t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
        t = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', t)
        t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)
        return t
    def flush():
        nonlocal para, lst
        if para: out.append('<p>' + inline(' '.join(para)) + '</p>'); para = []
        if lst: out.append('<ul>' + ''.join(f'<li>{inline(x)}</li>' for x in lst) + '</ul>'); lst = []
    for line in md.split('\n'):
        if line.startswith('```'):
            if code is None: flush(); code = []
            else: out.append('<pre class="brief">' + E('\n'.join(code)) + '</pre>'); code = None
            continue
        if code is not None: code.append(line); continue
        if line.startswith('# '): flush(); continue
        m = re.match(r'(#{2,3}) (.*)', line)
        if m: flush(); out.append(f'<h{len(m.group(1))}>{inline(m.group(2))}</h{len(m.group(1))}>'); continue
        if line.startswith('- '): para and flush(); lst.append(line[2:]); continue
        if not line.strip(): flush(); continue
        if line.startswith('> '): flush(); out.append('<p class="lede">' + inline(line[2:]) + '</p>'); continue
        para.append(line)
    flush(); return '\n'.join(out)

if __name__ == '__main__':
    build()
