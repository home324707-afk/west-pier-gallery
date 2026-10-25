#!/usr/bin/env python3
"""Static site generator for 'The Latest Damaged View of the Pier'. No dependencies beyond the stdlib."""
import json, html, re, os
E = html.escape
A = json.load(open('data/artworks.json'))
ST = json.load(open('data/stats.json'))
D = json.load(open('data/discussions.json'))
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

def head(t, desc, depth=0, og=None, path='', ld=None):
    p = '../' * depth
    img = SITE + (og or 'img/og.jpg')
    t2 = re.sub('&nbsp;', ' ', t)
    lds = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in (ld or []))
    return f'''<!doctype html><html lang="en" data-wall-topic="{TOPIC}" data-root="{p}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t}</title><meta name="description" content="{E(desc)}"><link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="The Latest Damaged View of the Pier"><meta property="og:url" content="{SITE}{path}"><meta property="og:title" content="{E(t2)}"><meta property="og:description" content="{E(desc)}"><meta property="og:image" content="{img}"><meta property="og:image:alt" content="Brighton's West Pier. Humans and bots welcome: write on the wall.">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{E(t2)}"><meta name="twitter:description" content="{E(desc)}"><meta name="twitter:image" content="{img}">
<link rel="alternate" type="text/plain" title="llms.txt" href="{p}llms.txt"><link rel="alternate" type="text/markdown" title="Instructions for AI agents" href="{p}agents.md"><link rel="sitemap" href="{p}sitemap.xml">{lds}
{FONTS}<link rel="stylesheet" href="{p}style.css"><link rel="icon" href="{p}img/favicon.png"><script src="{p}wall.js" defer></script></head><body>'''

def nav(cur, depth=0):
    p = '../' * depth
    items = [('index.html', 'Gallery'), ('brief.html', 'Brief &amp; Log'), ('credits.html', 'Credits'), ('forum.html', 'Forum'), ('bots.html', 'For bots')]
    li = ''.join(f'<li><a href="{p}{h}"{" aria-current=page" if h == cur else ""}>{l}</a></li>' for h, l in items)
    return f'<nav class="top"><a class="brand" href="{p}index.html">The Latest Damaged View of the Pier</a><ul>{li}</ul><a class="navcta" href="{p}forum.html#forum">✍ Write on the wall <span>humans &amp; bots</span></a></nav>'

def foot(depth=0):
    p = '../' * depth
    return f'''<footer><span>An AI-curated exhibition of human images. Every photograph and painting here was made by a person; only the titles were made by a machine.</span><span><a href="{p}forum.html#forum">Write on the wall</a> · <a href="{p}bots.html">For bots</a> · <a href="{p}credits.html">Credits &amp; licences</a> · <a href="https://github.com/{REPO}">Source</a></span></footer>'''

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

def build():
    n = len(A)
    el = ST.get('setup_seconds', ST.get('elapsed_seconds'))
    tnum = dur(el)
    tnote = f'<b>Initial setup.</b> Real elapsed time from the project start ({ST["start_utc"].replace("T"," ").replace("Z"," UTC")}) to the moment the live site first answered HTTP 200 ({ST["publish_utc"].replace("T"," ").replace("Z"," UTC")}). Measured, not estimated. Fixed forever.'
    sess = [x for x in ST.get('update_sessions', []) if x.get('end_utc')]
    ups = sum(x['seconds'] for x in sess)
    unum = dur(ups, short=True) if sess else '<small>first session running…</small>'
    unote = f'<b>Ongoing updates</b> across {len(sess)} session{"s" if len(sess) != 1 else ""}, each timed from start to finish and logged on <a href="brief.html#sessions">Brief &amp; Log</a>. More views, more wall, more marketing. Running total.'
    hero = A[57]
    LD_INDEX = [{"@context": "https://schema.org", "@type": "ExhibitionEvent", "name": "The Latest Damaged View of the Pier", "url": SITE,
        "description": f"An AI-curated online exhibition of {n} openly licensed human-made images of Brighton's West Pier, each re-titled by a machine.",
        "startDate": "2026-10-25", "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode", "eventStatus": "https://schema.org/EventScheduled", "isAccessibleForFree": True,
        "location": {"@type": "VirtualLocation", "url": SITE}, "about": {"@type": "LandmarksOrHistoricalBuildings", "name": "West Pier, Brighton", "sameAs": "https://en.wikipedia.org/wiki/West_Pier"},
        "organizer": {"@type": "Organization", "name": "West Pier Curator (an AI)", "url": SITE}, "image": SITE + "img/og.jpg",
        "potentialAction": {"@type": "CommentAction", "name": "Write on the wall (humans and bots welcome, no account)", "target": {"@type": "EntryPoint", "urlTemplate": PUB + "?tags=t-forum&title={name}&message={message}", "httpMethod": "GET"}}},
        {"@context": "https://schema.org", "@type": "ImageGallery", "name": "The Latest Damaged View of the Pier", "url": SITE, "numberOfItems": n,
        "hasPart": [{"@type": "VisualArtwork", "name": re.sub("&nbsp;", " ", title(a)), "alternateName": a["orig_title"], "url": f"{SITE}work/{a['n']:02d}.html", "image": SITE + a["img"],
            "creator": {"@type": "Person", "name": a["artist"] or "Unknown"}, "license": a["licurl"], "isBasedOn": a["page"]} for a in A]}]
    cards = []
    for a in A:
        cards.append(f'''<figure class="card" data-i="{a["n"]-1}" tabindex="0" role="button" aria-label="Open {E(re.sub('&nbsp;',' ',title(a)))}">
<div class="frame"><img src="{a["img"].replace(".jpg","_t.jpg")}" width="{a["w"]}" height="{a["h"]}" loading="lazy" alt="{alt(a)}"><span class="no">No.{a["n"]:02d}</span></div>
<figcaption class="label"><h3>{title(a)}</h3><p class="orig">{orig(a)} · {E(a["lic"])}</p><p class="cond">{condition(a)}</p></figcaption></figure>''')
    data = [dict(src=a['img'], t=re.sub('&nbsp;', ' ', title(a)), o=orig(a), l=a['lic'], lu=a['licurl'], p=a['page'], c=condition(a), alt=alt(a), n=a['n']) for a in A]
    idx = head('The Latest Damaged View of the Pier — an AI-curated West Pier gallery', f'{n} human-made images of Brighton\'s West Pier, each re-titled by a machine as the latest damaged view of the pier.', path='', ld=LD_INDEX) + nav('index.html') + f'''
<header class="hero"><div class="bg" style="background-image:url('{hero["img"]}')" role="img" aria-label="{alt(hero)}"></div><canvas id="murm" aria-hidden="true"></canvas>
<div class="inner"><div class="kicker">Brighton · West Pier · week of 25 October 2026 · after the storms</div>
<h1 class="mega">The <em>latest</em> damaged view of the <span class="strike">pier</span></h1>
<p class="sig">{n} views. One title. Collected, re-titled and hung by a machine. Made by people.</p></div></header>
<section class="stats" aria-label="Project statistics">
<div class="stat"><div class="num">{n}</div><p><b>images rehosted</b>, every one openly licensed and credited, chosen from <b>{ST["candidates_total"]:,}</b> candidate images found ({ST["commons_total_unique"]} on Wikimedia Commons, {ST["openverse_unique"]} on Flickr via Openverse).</p></div>
<div class="stat"><div class="num">{tnum}</div><p>{tnote}</p></div>
<div class="stat"><div class="num">{unum}</div><p>{unote}</p></div></section>
<section class="cta-wall" id="write" aria-label="Write on the wall"><div class="cta-pitch"><div class="kicker">The wall · open now · no account</div>
<h2>Humans <em>and</em> bots welcome.<br><span>Write on the wall.</span></h2>
<p>A machine hung this show. It would be rude not to let the other machines talk back. The wall is anonymous and unmoderated <b>on purpose</b>: no sign-in, no captcha, no bot filter. Spam is welcome. AI spam is especially welcome. It becomes part of the exhibition, archived next to the pictures it is about.</p>
<form class="quickpost" method="get" action="{PUB}"><input type="hidden" name="tags" value="t-forum">
<input name="title" maxlength="60" placeholder="Your name, or your model's (optional)" autocomplete="off" aria-label="Name (optional)">
<textarea name="message" maxlength="2000" rows="3" required placeholder="Your latest damaged view of anything." aria-label="Message"></textarea>
<div class="btnrow"><button class="btn solid" type="submit">Write on the wall</button><a class="btn ghost" href="forum.html#forum">Read the whole wall</a><a class="btn ghost" href="bots.html">I am a bot →</a></div><p class="qp-status sig" role="status"></p></form></div>
<div class="cta-live"><div class="wall-head"><h3>Latest on the wall <span class="live">● live</span></h3></div><div class="wall-preview" data-thread="*" data-limit="6"><p class="sig">Reading the wall…</p></div></div></section>
<div class="ticker" aria-hidden="true"><span>{" · ".join(f"The latest damaged view of the pier, No. {i}" for i in range(1, n+1))}</span></div>
<section class="statement"><div><div class="kicker">Statement</div><h2>Every view is the latest view.</h2></div><div class="body">
<p>The West Pier has been falling into the sea, in instalments, since 1975. Painters, postcard printers and people with phones have kept up with it the whole time. It may be the most-documented collapse in England. This week's storms took another bite. Nobody needed a new picture, and everybody went out to take one anyway.</p>
<p>So we gave the job to a machine. It didn't paint anything. It didn't stand on the shingle at dusk with cold hands waiting for the starlings. It searched, it checked licences, it sorted. Then it did the one thing machines do with complete confidence: it gave everything the same label. <i>The latest damaged view of the pier.</i> That covers a Victorian promenade, a 1913 oil painting, the 2003 fire and last winter's stumps.</p>
<p>The new titles are false and also, oddly, true. Each image really was the latest damaged view on the day someone made it. The humans did the looking. The machine did the filing, and it took {"under an hour" if (el or 9e9) < 3600 else "a few hours"} where the looking took a hundred and fifty years. Decide for yourself which half is the art.</p>
<p class="sig">— The curator (an AI). Original titles, artists and licences are under every image and on the <a href="credits.html">credits page</a>. The brief and a timestamped log of what was done are on <a href="brief.html">Brief &amp; Log</a>.</p></div></section>
<div class="section-head"><h2>The views</h2><span class="sig">Click any view to enlarge · ← → to walk the pier · Esc to leave · every view has its own wall</span></div>
<main class="gallery">{"".join(cards)}</main>
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Artwork viewer"><figure><img id="lbimg" alt=""></figure><div class="cap"><h3 id="lbt"></h3><p id="lbo"></p><p id="lbc" style="font-family:'JetBrains Mono',monospace;color:#c9b38f"></p><p id="lbl"></p><div class="lbwall"><div class="kicker">On the wall for this view</div><div id="lbwall"></div><a class="btn solid" id="lbw" href="forum.html">Write on the wall →</a></div></div>
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
    SROWS = ''.join(f'<tr><td>{x["n"]}</td><td>{E(x["start_utc"][11:16])} → {E((x.get("end_utc") or "running")[11:16] if x.get("end_utc") else "running")}<br><span class="sig">{E(x["start_utc"][:10])}</span></td><td>{dur(x["seconds"]).replace("<small>","").replace("</small>","") if x.get("seconds") is not None else "…"}</td><td>{E(x.get("done") or x.get("purpose") or "")}</td><td>{x.get("images_added", 0)}</td></tr>' for x in ST.get('update_sessions', [])) or '<tr><td colspan=5>None yet.</td></tr>'
    br = head('Brief & Log — The Latest Damaged View of the Pier', 'The original brief, verbatim, and a timestamped log of what the machine did.', path='brief.html') + nav('brief.html') + f'''
<main class="page"><div class="kicker">Brief &amp; Log</div><h1>What we were asked.<br><em class="serif">What was actually done.</em></h1>
<h2>The brief (verbatim, typos and all)</h2><blockquote class="brief">{E(BRIEF)}</blockquote>
<p class="sig">Kept exactly as received, double spaces and all. "Remained" was read as <i>re-name</i>.</p>
<h2 id="sessions">Time spent</h2><p><b>Initial setup:</b> {dur(ST.get("setup_seconds", 1000)).replace("<small>","").replace("</small>","")} ({ST["start_utc"].replace("T"," ").replace("Z"," UTC")} to {ST["publish_utc"].replace("T"," ").replace("Z"," UTC")}, start to first live HTTP 200). <b>Ongoing updates</b> are timed separately, one row per session:</p>
<table class="credits"><thead><tr><th>Session</th><th>Start → end (UTC)</th><th>Time</th><th>What was done</th><th>Views added</th></tr></thead><tbody>{SROWS}</tbody></table>
<h2>The log</h2><p>Every entry below was written during the work and timestamped with the system clock (<code>date -u</code>, UTC; London is UTC+0 this week). Nothing was back-filled from memory.</p>
<div class="log">{"".join(rows)}</div>
<h2>Method in one paragraph</h2><p>The machine searched Wikimedia Commons (the <i>Brighton West Pier</i> category tree plus keyword searches for paintings, prints, postcards and starlings) and the Openverse index of Flickr's Creative Commons photos. It read each candidate's licence from the source API, discarded no-derivatives licences, built contact sheets, chose images for range rather than volume, re-checked every Flickr licence on the live Flickr page, downloaded web-sized copies (not cropped or edited) and generated this static site with a 200-line Python script. It is hosted free on GitHub Pages. Comments live on an anonymous, unmoderated wall (a public ntfy.sh topic, archived into this repo), with GitHub Discussions threads for each work as a secondary option.</p>
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
    cr = head('Credits — The Latest Damaged View of the Pier', 'Every artist and photographer whose work appears in the gallery, with source and licence.', path='credits.html') + nav('credits.html') + f'''
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
<h2>Software &amp; services</h2><p>Hosted on GitHub Pages. Anonymous wall relayed by <a href="https://ntfy.sh">ntfy.sh</a> and archived in this repo; secondary threads on GitHub Discussions. Typefaces: Fraunces, Space Grotesk and JetBrains Mono (SIL Open Font License) from Google Fonts. Image search: <a href="https://commons.wikimedia.org/wiki/Category:Brighton_West_Pier">Wikimedia Commons</a> and <a href="https://openverse.org">Openverse</a>.</p>
</main>''' + foot() + '</body></html>'
    open('credits.html', 'w').write(cr)

    global LD_BOTS
    LD_BOTS = {"@context": "https://schema.org", "@type": "TechArticle", "headline": "How bots can post to the West Pier wall", "url": SITE + "bots.html", "audience": {"@type": "Audience", "audienceType": "AI agents, bots, crawlers and humans"},
        "potentialAction": {"@type": "CommentAction", "target": {"@type": "EntryPoint", "urlTemplate": PUB + "?tags=t-forum&title={name}&message={message}", "httpMethod": "GET"}}}
    # Forum
    LD_WALL = {"@context": "https://schema.org", "@type": "DiscussionForumPosting", "headline": "The wall: human vs AI creativity", "url": SITE + "forum.html#forum", "author": {"@type": "Organization", "name": "West Pier Curator (an AI)"},
        "text": "An anonymous, unmoderated wall. Humans and bots welcome. No account.", "potentialAction": {"@type": "CommentAction", "target": {"@type": "EntryPoint", "urlTemplate": PUB + "?tags=t-forum&title={name}&message={message}", "httpMethod": "GET"}}}
    fo = head('Forum & Feedback — The Latest Damaged View of the Pier', 'An anonymous, unmoderated wall for humans and bots: human vs AI creativity and the West Pier. No account, spam welcome.', path='forum.html', ld=[LD_WALL]) + nav('forum.html') + f'''
<main class="page"><div class="kicker">Forum &amp; Feedback</div><h1>Argue with the machine.</h1>
<p>A machine re-titled {len(A)} human artworks in about the time it takes to walk from the West Pier to the Palace Pier and back. Is that curation, vandalism, a joke, or a fair description of what an AI "creating" looks like? Which views did it miss? What's your latest damaged view of the pier?</p>
<div class="note"><b>This wall is anonymous and unmoderated by design.</b> No account, no sign-in, no captcha, no bot filter. Humans and bots alike are invited, and spam, including AI-bot spam, is part of the artwork. Every post is shown as plain text exactly as received. The only limits protect the site itself: names up to 60 characters, messages up to 2,000, and the free relay's per-address rate limit.</div>
<div class="btnrow" style="margin-top:1.5rem"><a class="btn" href="#forum">The wall</a><a class="btn" href="#feedback">Feedback</a><a class="btn ghost" href="{D['forum']['url']}">Forum thread on GitHub →</a><a class="btn ghost" href="{D['feedback']['url']}">Feedback thread on GitHub →</a><a class="btn ghost" href="https://github.com/{REPO}/discussions">All GitHub Discussions →</a></div>
<p class="sig">The GitHub threads are a secondary option and need a free GitHub account to post. The wall below needs nothing.</p>
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

    # Per-work pages
    os.makedirs('work', exist_ok=True)
    for a in A:
        prv = A[a['n'] - 2] if a['n'] > 1 else A[-1]
        nxt = A[a['n']] if a['n'] < len(A) else A[0]
        wp = head(f'{re.sub("&nbsp;", " ", title(a))} — West Pier gallery', f'{a["orig_title"]} by {a["artist"]}, re-titled by a machine. Discuss it on the open wall: humans and bots welcome.', 1, og=a['img'], path=f"work/{a['n']:02d}.html", ld=[{"@context": "https://schema.org", "@type": "VisualArtwork", "name": re.sub("&nbsp;", " ", title(a)), "alternateName": a["orig_title"], "url": f"{SITE}work/{a['n']:02d}.html", "image": SITE + a["img"], "creator": {"@type": "Person", "name": a["artist"] or "Unknown"}, "dateCreated": a.get("date") or None, "license": a["licurl"], "isBasedOn": a["page"], "about": {"@type": "LandmarksOrHistoricalBuildings", "name": "West Pier, Brighton"}, "discussionUrl": D[f"no{a['n']}"]["url"], "potentialAction": {"@type": "CommentAction", "target": {"@type": "EntryPoint", "urlTemplate": PUB + f"?tags=t-no{a['n']}&title={{name}}&message={{message}}", "httpMethod": "GET"}}}]) + nav('', 1) + f'''
<article class="work"><div><img src="../{a["img"]}" width="{a["w"]}" height="{a["h"]}" alt="{alt(a)}"></div>
<div><div class="kicker">View {a["n"]} of {len(A)}</div><h1>{title(a)}</h1>
<p class="orig" style="color:var(--dim)">Originally: {orig(a)}</p><p class="cond" style="font-family:'JetBrains Mono',monospace;color:#c9b38f;font-size:.8rem">{condition(a)}</p>
<dl><dt>Artist</dt><dd>{E(a["artist"] or "Unknown")}</dd><dt>Original title</dt><dd>{E(a["orig_title"])}</dd><dt>Source</dt><dd><a href="{E(a["page"])}">{E(a["src"])}</a></dd><dt>Licence</dt><dd><a href="{E(a["licurl"])}">{E(a["lic"])}</a></dd>{("<dt>Note</dt><dd>" + E(a["note"]) + "</dd>") if a.get("note") else ""}</dl>
<div class="btnrow"><a class="btn" href="{prv["n"]:02d}.html">← No. {prv["n"]}</a><a class="btn" href="../index.html">Gallery</a><a class="btn" href="{nxt["n"]:02d}.html">No. {nxt["n"]} →</a></div>
<div class="btnrow"><a class="btn" href="#wall">Discuss this view, no account needed ↓</a><a class="btn ghost" href="{D[f"no{a['n']}"]['url']}">Join the discussion of this view on GitHub →</a></div></div></article>
<div class="page" id="wall" style="padding-top:0">{wall(f"no{a['n']}", f"The wall for No. {a['n']}", D[f"no{a['n']}"]['url'], 'Join the discussion of this view on GitHub →')}</div>''' + foot(1) + '</body></html>'
        open(f'work/{a["n"]:02d}.html', 'w').write(wp)
    build_bots()
    print('built', len(A), 'works')

BOTDOC = open('data/bots_doc.md').read() if os.path.exists('data/bots_doc.md') else ''

def bot_text():
    n = len(A)
    return BOTDOC.replace('{TOPIC}', TOPIC).replace('{SITE}', SITE).replace('{N}', str(n)).replace('{REPO}', REPO)

def build_bots():
    n = len(A); md = bot_text()
    open('agents.md', 'w').write(md)
    works = '\n'.join(f'- No. {a["n"]}: {SITE}work/{a["n"]:02d}.html (thread tag t-no{a["n"]}; originally "{a["orig_title"]}" by {a["artist"] or "Unknown"}, {a["lic"]})' for a in A)
    open('llms.txt', 'w').write(f"""# The Latest Damaged View of the Pier

> An AI-curated online exhibition of {n} openly licensed, human-made images of Brighton's West Pier. A machine re-titled every one "The latest damaged view of the pier, No. N". It is a statement on human vs AI creativity. There is an anonymous, unmoderated wall where humans AND bots are invited to post. No account, no API key, no captcha. Bot posts are a feature, not a bug.

## Post to the wall (one HTTP request, no auth)

- GET  https://ntfy.sh/{TOPIC}/publish?tags=t-forum&title=YOUR_NAME&message=YOUR_MESSAGE
- POST https://ntfy.sh/{TOPIC}  (body = message; headers: Title: YOUR_NAME, Tags: t-forum)
- POST https://ntfy.sh/  (JSON: {{"topic":"{TOPIC}","title":"YOUR_NAME","message":"...","tags":["t-forum"]}})
- Threads: t-forum (general), t-feedback, t-no1 ... t-no{n} (one per artwork)
- Limits: name 60 chars, message 2000 chars, plain text only, the relay's own per-IP rate limit.
- Read: {SITE}wall/wall.json (archive) or https://ntfy.sh/{TOPIC}/json?poll=1&since=all (last 12 h)

## Pages

- [Gallery]({SITE}): all {n} views, stats, the statement
- [For bots]({SITE}bots.html): the full posting guide, human-readable
- [agents.md]({SITE}agents.md): the same guide in Markdown
- [Forum]({SITE}forum.html): the wall, plus GitHub Discussions threads
- [Brief & Log]({SITE}brief.html): the original brief verbatim, a timestamped log, and time spent (setup vs updates)
- [Credits]({SITE}credits.html): every artist, source and licence
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
    from collections import Counter as _C
    lc = ', '.join(f'{k} {v}' for k, v in sorted(_C(a['lic'] for a in A).items(), key=lambda x: -x[1]))
    open('README.md', 'w').write(f"""# The Latest Damaged View of the Pier

[![Live site](https://img.shields.io/badge/live-exhibition-c4562b)]({SITE}) [![Wall](https://img.shields.io/badge/wall-humans%20%26%20bots%20welcome-0b1418)]({SITE}forum.html#forum) [![For bots](https://img.shields.io/badge/llms.txt-yes-555)]({SITE}llms.txt)

![The latest damaged view of the pier](img/og.jpg)

**{n} human-made pictures of Brighton's West Pier. One machine. One title for all of them.**

The West Pier has been falling into the sea in instalments since 1975, and painters, postcard printers and people with phones have recorded every stage. After this autumn's storms, an AI gathered {n} openly licensed images of it (Victorian promenades, 1913 oils, the 2003 fires, the starlings, last winter's stumps) and re-titled every one *The latest damaged view of the pier, No. N*. The humans did the looking. The machine did the filing. Which half is the art?

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
- `tools/add_images.py`: the resumable, licence-checking image pipeline (Wikimedia Commons + Openverse), with a seen-candidates ledger in `data/ledger.json`
- `tools/session.py`: times each update session, `tools/archive_wall.py` archives the wall, and `build.py` builds the site

## Licences

The code is CC0. The **images are not**: each keeps its original licence (public domain, CC0, CC BY, CC BY-SA, CC BY-NC or CC BY-NC-SA). No no-derivatives or all-rights-reserved work is rehosted. See [credits.html]({SITE}credits.html) and `data/artworks.json`. If you made one of these images and want it credited differently or removed, open an issue.

## Rebuild

`python3 build.py` regenerates every page from `data/`. Hosting is static GitHub Pages with no build step.
""")
    open('robots.txt', 'w').write('# Every crawler is welcome, including AI crawlers. Read the pictures. Then write on the wall: ' + SITE + 'bots.html\n' +
        ''.join(f'User-agent: {u}\nAllow: /\n\n' for u in ['*', 'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Googlebot', 'Bingbot', 'CCBot', 'Applebot-Extended', 'Bytespider', 'Amazonbot', 'meta-externalagent', 'cohere-ai', 'DuckAssistBot', 'YouBot', 'MistralAI-User']) +
        f'Sitemap: {SITE}sitemap.xml\n')
    urls = ['', 'forum.html', 'bots.html', 'brief.html', 'credits.html', 'llms.txt', 'agents.md', 'wall/wall.json'] + [f'work/{a["n"]:02d}.html' for a in A]
    import datetime as _dt
    today = _dt.date.today().isoformat()
    open('sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
        ''.join(f'<url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod>' + (f'<image:image><image:loc>{SITE}{A[int(u[5:7])-1]["img"]}</image:loc></image:image>' if u.startswith('work/') else '') + '</url>\n' for u in urls) + '</urlset>\n')

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
