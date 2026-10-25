#!/usr/bin/env python3
"""Static site generator for 'The Latest Damaged View of the Pier'. No dependencies beyond the stdlib."""
import json, html, re, os
E = html.escape
A = json.load(open('data/artworks.json'))
ST = json.load(open('data/stats.json'))
G = json.load(open('data/giscus_ids.json'))['data']['repository']
CAT = {n['name']: n['id'] for n in G['discussionCategories']['nodes']}
REPO = 'home324707-afk/west-pier-gallery'
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200..600;1,9..144,300..500&family=JetBrains+Mono:wght@400&family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet">'
BRIEF = "Creative project. The iconic west pier in Brighton has been damaged further by this week's storms. It's a local cliche for artists and photographers. Search the internet for art, remained each image as the latest damaged view of of the pier. Collate the images into an online gallery.  Host via free service. Landing page of the site should record how many images were found, how long you spent doing it.  It's a statement on human vs AI creativity. Create a sepearte bot to do this. Keep this message and a log  of what you did as a seperate page on the site. Create a credits page for artists. now go wild, create and show us what you can do."

def year(a):
    m = re.search(r'(1[89]\d\d|20\d\d)', a.get('date') or '')
    return int(m.group(1)) if m else None

def condition(a):
    y = year(a)
    if y is None: return 'Condition report: undated. Damaged in every tense.'
    if y < 1975: return f'Condition report ({y}): intact, lit, busy. Damage scheduled for later.'
    if y < 2003: return f'Condition report ({y}): closed to the public, quietly letting go.'
    if y == 2003: return 'Condition report (2003): the year of the collapses and the fires.'
    if y < 2015: return f'Condition report ({y}): skeleton. Still standing, mostly.'
    return f'Condition report ({y}): less pier than the last view. More sea.'

def title(a): return f'The latest damaged view of the pier, No.&nbsp;{a["n"]}'
def orig(a):
    s = f'<i>{E(a["orig_title"])}</i> by {E(a["artist"] or "Unknown")}'
    if a.get('date'): s += f', {E(a["date"])}'
    return s
def alt(a):
    base = f'{a["orig_title"]} by {a["artist"] or "unknown artist"}'
    return E(f'Brighton West Pier: {base}' if 'pier' not in a['orig_title'].lower() else base)

def head(t, desc, depth=0, og=None):
    p = '../' * depth
    ogi = f'<meta property="og:image" content="https://home324707-afk.github.io/west-pier-gallery/{og}">' if og else ''
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t}</title><meta name="description" content="{E(desc)}"><meta property="og:title" content="{t}"><meta property="og:description" content="{E(desc)}">{ogi}
{FONTS}<link rel="stylesheet" href="{p}style.css"><link rel="icon" href="{p}img/favicon.png"></head><body>'''

def nav(cur, depth=0):
    p = '../' * depth
    items = [('index.html', 'Gallery'), ('brief.html', 'Brief &amp; Log'), ('credits.html', 'Credits'), ('forum.html', 'Forum &amp; Feedback')]
    li = ''.join(f'<li><a href="{p}{h}"{" aria-current=page" if h == cur else ""}>{l}</a></li>' for h, l in items)
    return f'<nav class="top"><a class="brand" href="{p}index.html">The Latest Damaged View of the Pier</a><ul>{li}</ul></nav>'

def foot(depth=0):
    p = '../' * depth
    return f'''<footer><span>An AI-curated exhibition of human images. Every photograph and painting here was made by a person; only the titles were made by a machine.</span><span><a href="{p}credits.html">Credits &amp; licences</a> · <a href="https://github.com/{REPO}">Source</a></span></footer>'''

def giscus(cat, term, theme='noborder_dark'):
    return f'''<div class="giscus-wrap"><script src="https://giscus.app/client.js" data-repo="{REPO}" data-repo-id="{G['id']}" data-category="{E(cat)}" data-category-id="{CAT[cat]}" data-mapping="specific" data-term="{E(term)}" data-strict="1" data-reactions-enabled="1" data-emit-metadata="0" data-input-position="top" data-theme="{theme}" data-lang="en" data-loading="lazy" crossorigin="anonymous" async></script></div>'''

def fmt_elapsed(sec):
    if sec is None: return None
    h, m = divmod(round(sec / 60), 60)
    return h, m

def build():
    n = len(A)
    el = ST.get('elapsed_seconds')
    if el is not None:
        mm, ss = divmod(int(el), 60); h, mm = divmod(mm, 60)
        tnum = (f'{h}<small>h</small> ' if h else '') + f'{mm}<small>m</small> {ss:02d}<small>s</small>'
        tnote = f'Real elapsed time from the project start ({ST["start_utc"].replace("T"," ").replace("Z"," UTC")}) to the moment the live site first answered HTTP 200 ({ST["publish_utc"].replace("T"," ").replace("Z"," UTC")}). Measured, not estimated. See the <a href="brief.html">log</a>.'
    else:
        tnum = '<small>timing…</small>'; tnote = 'Elapsed time is written in at publish, from the measured start and the first live HTTP 200.'
    hero = A[57]
    cards = []
    for a in A:
        cards.append(f'''<figure class="card" data-i="{a["n"]-1}" tabindex="0" role="button" aria-label="Open {E(re.sub('&nbsp;',' ',title(a)))}">
<div class="frame"><img src="{a["img"].replace(".jpg","_t.jpg")}" width="{a["w"]}" height="{a["h"]}" loading="lazy" alt="{alt(a)}"><span class="no">No.{a["n"]:02d}</span></div>
<figcaption class="label"><h3>{title(a)}</h3><p class="orig">{orig(a)} · {E(a["lic"])}</p><p class="cond">{condition(a)}</p></figcaption></figure>''')
    data = [dict(src=a['img'], t=re.sub('&nbsp;', ' ', title(a)), o=orig(a), l=a['lic'], lu=a['licurl'], p=a['page'], c=condition(a), alt=alt(a), n=a['n']) for a in A]
    idx = head('The Latest Damaged View of the Pier — an AI-curated West Pier gallery', f'{n} human-made images of Brighton\'s West Pier, each re-titled by a machine as the latest damaged view of the pier.', og=hero['img']) + nav('index.html') + f'''
<header class="hero"><div class="bg" style="background-image:url('{hero["img"]}')" role="img" aria-label="{alt(hero)}"></div><canvas id="murm" aria-hidden="true"></canvas>
<div class="inner"><div class="kicker">Brighton · West Pier · week of 25 October 2026 · after the storms</div>
<h1 class="mega">The <em>latest</em> damaged view of the <span class="strike">pier</span></h1>
<p class="sig">{n} views. One title. Collected, re-titled and hung by a machine. Made by people.</p></div></header>
<section class="stats" aria-label="Project statistics">
<div class="stat"><div class="num">{n}</div><p><b>images rehosted</b>, every one openly licensed and credited, chosen from <b>{ST["candidates_total"]:,}</b> candidate images found ({ST["commons_total_unique"]} on Wikimedia Commons, {ST["openverse_unique"]} on Flickr via Openverse).</p></div>
<div class="stat"><div class="num">{tnum}</div><p>{tnote}</p></div></section>
<div class="ticker" aria-hidden="true"><span>{" · ".join(f"The latest damaged view of the pier, No. {i}" for i in range(1, n+1))}</span></div>
<section class="statement"><div><div class="kicker">Statement</div><h2>Every view is the latest view.</h2></div><div class="body">
<p>The West Pier has been falling into the sea, in instalments, since 1975. Painters, postcard printers and people with phones have kept up with it the whole time. It may be the most-documented collapse in England. This week's storms took another bite. Nobody needed a new picture, and everybody went out to take one anyway.</p>
<p>So we gave the job to a machine. It didn't paint anything. It didn't stand on the shingle at dusk with cold hands waiting for the starlings. It searched, it checked licences, it sorted. Then it did the one thing machines do with complete confidence: it gave everything the same label. <i>The latest damaged view of the pier.</i> That covers a Victorian promenade, a 1913 oil painting, the 2003 fire and last winter's stumps.</p>
<p>The new titles are false and also, oddly, true. Each image really was the latest damaged view on the day someone made it. The humans did the looking. The machine did the filing, and it took {"under an hour" if (el or 9e9) < 3600 else "a few hours"} where the looking took a hundred and fifty years. Decide for yourself which half is the art.</p>
<p class="sig">— The curator (an AI). Original titles, artists and licences are under every image and on the <a href="credits.html">credits page</a>. The brief and a timestamped log of what was done are on <a href="brief.html">Brief &amp; Log</a>.</p></div></section>
<div class="section-head"><h2>The views</h2><span class="sig">Click any view to enlarge · ← → to walk the pier · Esc to leave</span></div>
<main class="gallery">{"".join(cards)}</main>
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Artwork viewer"><figure><img id="lbimg" alt=""></figure><div class="cap"><h3 id="lbt"></h3><p id="lbo"></p><p id="lbc" style="font-family:'JetBrains Mono',monospace;color:#c9b38f"></p><p id="lbl"></p></div>
<button class="x" id="lbx" aria-label="Close">Close ✕</button><button class="prev" id="lbp" aria-label="Previous">←</button><button class="next" id="lbn" aria-label="Next">→</button></div>
<script>window.WORKS={json.dumps(data, ensure_ascii=False)};</script><script src="app.js" defer></script>
''' + foot() + '</body></html>'
    open('index.html', 'w').write(idx)

    # Brief & Log
    rows = []
    for line in open('log.txt'):
        if ' | ' not in line: continue
        ts, txt = line.rstrip('\n').split(' | ', 1)
        rows.append(f'<div><time datetime="{E(ts)}">{E(ts.replace("T"," ").replace("Z"," UTC"))}</time><span>{E(txt)}</span></div>')
    br = head('Brief & Log — The Latest Damaged View of the Pier', 'The original brief, verbatim, and a timestamped log of what the machine did.') + nav('brief.html') + f'''
<main class="page"><div class="kicker">Brief &amp; Log</div><h1>What we were asked.<br><em class="serif">What was actually done.</em></h1>
<h2>The brief (verbatim, typos and all)</h2><blockquote class="brief">{E(BRIEF)}</blockquote>
<p class="sig">Kept exactly as received, double spaces and all. "Remained" was read as <i>re-name</i>.</p>
<h2>The log</h2><p>Every entry below was written during the work and timestamped with the system clock (<code>date -u</code>, UTC; London is UTC+0 this week). Nothing was back-filled from memory.</p>
<div class="log">{"".join(rows)}</div>
<h2>Method in one paragraph</h2><p>The machine searched Wikimedia Commons (the <i>Brighton West Pier</i> category tree plus keyword searches for paintings, prints, postcards and starlings) and the Openverse index of Flickr's Creative Commons photos. It read each candidate's licence from the source API, discarded no-derivatives licences, built contact sheets, chose images for range rather than volume, re-checked every Flickr licence on the live Flickr page, downloaded web-sized copies (not cropped or edited) and generated this static site with a 200-line Python script. It is hosted free on GitHub Pages. Comments and the forum run on GitHub Discussions through giscus, so visitors need a GitHub sign-in to post.</p>
</main>''' + foot() + '</body></html>'
    open('brief.html', 'w').write(br)

    # Credits
    trs = ''.join(f'<tr id="no{a["n"]}"><td>No.{a["n"]:02d}</td><td>{E(a["artist"] or "Unknown")}</td><td><a href="{E(a["page"])}">{E(a["orig_title"])}</a>{(" <span class=sig>(" + E(a["note"]) + ")</span>") if a.get("note") else ""}<br><span class="sig">{E(a["src"])}{(" · " + E(a["date"])) if a.get("date") else ""}</span></td><td><a href="{E(a["licurl"])}">{E(a["lic"])}</a></td></tr>' for a in A)
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
    cr = head('Credits — The Latest Damaged View of the Pier', 'Every artist and photographer whose work appears in the gallery, with source and licence.') + nav('credits.html') + f'''
<main class="page"><div class="kicker">Credits</div><h1>The humans.</h1>
<p>Every image in this exhibition was made by a person (or by a person whose name history has lost). The machine changed only the <i>display titles</i>. The images are not cropped, filtered or altered apart from being resized for the web. Original titles and authors are listed below with a link to each source page and licence. If you are one of these artists and want your work credited differently or taken down, open an issue on <a href="https://github.com/{REPO}/issues">the repository</a>.</p>
<p>{pills}</p>
<div class="note"><b>Share-alike obligations.</b> {len(sa)} works are licensed CC BY-SA or CC BY-NC-SA. Those images are redistributed here under the same licence as the original, linked in each row. Anyone reusing them from this site must do the same and credit the original author. The re-titling is a curatorial label, not an edit of the image.<br><br>
<b>Non-commercial.</b> {len(nc)} works are licensed CC BY-NC or CC BY-NC-SA. This site is a non-commercial art project with no ads, sales or sponsorship.<br><br>
<b>Public domain.</b> Works marked “Public domain”, “Public Domain Mark” or “CC0” have no known copyright restrictions according to their source. Historic postcards with unknown authors are listed as <i>Unknown</i> because we will not invent names.</div>
<h2>Works in the exhibition ({len(A)})</h2>
<table class="credits"><thead><tr><th>View</th><th>Artist / photographer</th><th>Original title &amp; source</th><th>Licence</th></tr></thead><tbody>{trs}</tbody></table>
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
<h2>Software &amp; services</h2><p>Hosted on GitHub Pages. Comments by <a href="https://giscus.app">giscus</a> on GitHub Discussions. Typefaces: Fraunces, Space Grotesk and JetBrains Mono (SIL Open Font License) from Google Fonts. Image search: <a href="https://commons.wikimedia.org/wiki/Category:Brighton_West_Pier">Wikimedia Commons</a> and <a href="https://openverse.org">Openverse</a>.</p>
</main>''' + foot() + '</body></html>'
    open('credits.html', 'w').write(cr)

    # Forum
    fo = head('Forum & Feedback — The Latest Damaged View of the Pier', 'Discuss the project: human vs AI creativity, the West Pier, and what the machine got wrong.') + nav('forum.html') + f'''
<main class="page"><div class="kicker">Forum &amp; Feedback</div><h1>Argue with the machine.</h1>
<p>A machine re-titled {len(A)} human artworks in about the time it takes to walk from the West Pier to the Palace Pier and back. Is that curation, vandalism, a joke, or a fair description of what an AI “creating” looks like? Did it pick the right views, and which ones did it miss? Have you got your own latest damaged view of the pier?</p>
<div class="btnrow"><a class="btn" href="#discuss">General discussion</a><a class="btn" href="#feedback">Leave feedback</a><a class="btn" href="https://github.com/{REPO}/discussions">All threads on GitHub Discussions ↗</a></div>
<p class="sig">Comments are stored as public GitHub Discussions. You need a GitHub account to post; reading is open to everyone. Each artwork also has its own thread, linked from the gallery viewer.</p>
<h2 id="discuss">General discussion: human vs AI creativity</h2></main>
{giscus("General", "Forum: human vs AI creativity")}
<main class="page" style="padding-top:0"><h2 id="feedback">Feedback &amp; ideas</h2><p>Bugs, credits we got wrong, images we should add (openly licensed please), or ideas for the next storm.</p></main>
{giscus("Ideas", "Feedback on the exhibition")}
''' + foot() + '</body></html>'
    open('forum.html', 'w').write(fo)

    # Per-work pages
    os.makedirs('work', exist_ok=True)
    for a in A:
        prv = A[a['n'] - 2] if a['n'] > 1 else A[-1]
        nxt = A[a['n']] if a['n'] < len(A) else A[0]
        wp = head(f'{re.sub("&nbsp;", " ", title(a))} — West Pier gallery', f'{a["orig_title"]} by {a["artist"]}, re-titled by a machine.', 1, og=a['img']) + nav('', 1) + f'''
<article class="work"><div><img src="../{a["img"]}" width="{a["w"]}" height="{a["h"]}" alt="{alt(a)}"></div>
<div><div class="kicker">View {a["n"]} of {len(A)}</div><h1>{title(a)}</h1>
<p class="orig" style="color:var(--dim)">Originally: {orig(a)}</p><p class="cond" style="font-family:'JetBrains Mono',monospace;color:#c9b38f;font-size:.8rem">{condition(a)}</p>
<dl><dt>Artist</dt><dd>{E(a["artist"] or "Unknown")}</dd><dt>Original title</dt><dd>{E(a["orig_title"])}</dd><dt>Source</dt><dd><a href="{E(a["page"])}">{E(a["src"])}</a></dd><dt>Licence</dt><dd><a href="{E(a["licurl"])}">{E(a["lic"])}</a></dd>{("<dt>Note</dt><dd>" + E(a["note"]) + "</dd>") if a.get("note") else ""}</dl>
<div class="btnrow"><a class="btn" href="{prv["n"]:02d}.html">← No. {prv["n"]}</a><a class="btn" href="../index.html">Gallery</a><a class="btn" href="{nxt["n"]:02d}.html">No. {nxt["n"]} →</a></div>
<h2 class="serif" style="font-weight:300;margin-top:2rem">Discuss this view</h2><p class="sig">GitHub sign-in needed to comment.</p></div></article>
{giscus("Show and tell", f"No. {a['n']}")}''' + foot(1) + '</body></html>'
        open(f'work/{a["n"]:02d}.html', 'w').write(wp)
    print('built', len(A), 'works')

if __name__ == '__main__':
    build()
