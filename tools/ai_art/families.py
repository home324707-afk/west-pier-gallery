#!/usr/bin/env python3
"""The AI families: every variation the West Pier Curator (AI) has hung, as data. One family = one script in ai/fam/<family>.js;
one variation = a dict of params for it. This script hangs any variation not yet in data/artworks.json and renders its poster still
(a real frame of the code, via headless Chrome, see stills.py).

  python3 tools/ai_art/families.py            # hang every new variation (idempotent: keys already hung are skipped)
  python3 tools/ai_art/families.py --list     # list families and variation keys
  python3 tools/ai_art/families.py --restill  # re-render every family poster

To add a variation: append a V(...) line to the family's list below with a new unique key, then run the script, then build.py.
To add a family: write ai/fam/<name>.js (WPAI.register('f-<name>', {...})), add FAMILY[<name>] and its V(...) lines here.
Rules: remixes derive only from public-domain / CC0 works in the gallery (CC BY only with credit); data pieces use only real data."""
import sys, os, json, re, datetime, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import J, works, work, save, derived_licence, LICURL
ARTIST = 'West Pier Curator (AI)'
REPO = 'https://github.com/home324707-afk/west-pier-gallery/blob/main/'
FAMILY = {  # key: (label, one-line description)
 'flow': ('Flow fields', 'Thousands of particles follow a seeded noise current; the pier condenses out of it, dissolves into it, or stands against it.'),
 'lsystem': ('L-systems', 'Lindenmayer grammars grow kelp, coral and ironwork from the legs, segment by segment, until the tide takes it.'),
 'automata': ('Cellular automata', 'The pier is the starting condition; rust, Conway\'s Life, falling sand and Wolfram rules do the rest.'),
 'tide': ('Tide simulations', 'Wave equations and Gerstner swells run through the legs, from a gull\'s-eye rock pool to a moonlit flood.'),
 'typo': ('Typography', 'The pier as letters: typed out of a phrase, rained on by type, spelled in Morse, losing its kerning to the sea.'),
 'text': ('Writing', 'Things the AI wrote about the pier (haiku, a sonnet, a claim form, an obituary), typed out live and taken by the tide.'),
 'remix': ('Remixes', 'Live machine treatments of public-domain and CC0 views in this gallery: datamosh, pixel sort, engraving, teletext.'),
 'masters': ('After the masters', 'Homages painted stroke by stroke from code in the manner of painters the machine has read about. No image of theirs is used.'),
 'plotter': ('Plotter drawings', 'Vector drawings (hatching, contours, one continuous line) drawn by a simulated pen plotter. SVG download on the work page.'),
 'sound': ('Sound pieces', 'Small synthesisers: a wind harp of the legs, a foghorn, starlings, rust. Click to listen; sound never autoplays.'),
 'interactive': ('Interactive', 'Pieces that answer your pointer: stir the sea, wipe the fog, hold the pier up. In the grid a ghost cursor plays them.'),
 'turing': ('Turing test failures', 'The AI tries to pass as a human photographer and gives itself away: a thumb over the lens, a jet in a Victorian photo.'),
 'data': ('Data portraits', 'Only real data: this gallery\'s own catalogue and the sourced timeline, drawn as the pier.'),
}
V = lambda key, title, p, method, sources=(), w=1200, h=800, ms=9000: dict(key=key, title=title, p=p, method=method, sources=list(sources), w=w, h=h, ms=ms)
DUSK = ['#1d2b45', '#e9a46a']
VARS = {
 'flow': [
  V('flow-iron-rust', 'Iron filings, magnetised by memory', dict(seed=1866, mode='iron', bg='#0f1216', ink=['#3a4a58', '#e0703a'], pc='#e0703a', f=1.6, fade=.03), 'Flow field: particles slow to a crawl inside the pier\'s outline, so the ironwork condenses out of the current in rust.'),
  V('flow-iron-ghost', 'A ghost made of traffic', dict(seed=2003, mode='iron', bg='#f1ede4', ink=['#c9c2b4', '#1d2b33'], pc='#1d2b33', f=2.2, fade=.025, alpha=.25), 'Flow field on paper white: the pier appears only where the particles hesitate.'),
  V('flow-dissolve-ember', 'The pavilion, leaving by every exit', dict(seed=28, mode='dissolve', bg='#140c0a', ink=['#ff9a3c', '#ffd27a'], dir=-1.4, f=1.2, fade=.05, v=2.5), 'Flow field: particles are born on the ironwork and carried up and away, like embers on 28 March 2003.'),
  V('flow-dissolve-sea', 'Unbuilt by the current', dict(seed=2014, mode='dissolve', bg='#0b1d26', ink=['#7fc4d6', '#e8f4f6'], dir=.2, f=2.4, fade=.04), 'Flow field: the pier sheds itself sideways into a slow green current.'),
  V('flow-wind-gale', 'Force ten, with railings', dict(seed=1987, mode='wind', bg='#1a1f24', ink=['#9fb2bf', '#ffffff'], dir=0, f=1.0, fade=.08, density=1.3), 'Flow field: a gale of streaks blows left to right through a pier that does not move.'),
  V('flow-wind-dusk', 'Southwesterly, golden hour', dict(seed=1916, mode='wind', bg='#2a1b2e', ink=['#e9a46a', '#f6d3a1'], dir=-.25, f=1.4, fade=.06), 'Flow field: warm wind rising off the sea at dusk, the pier a fixed shadow in it.'),
  V('flow-iron-blueprint', 'Blueprint, drawn by accident', dict(seed=1893, mode='iron', bg='#0e2a4a', ink=['#2f5f8f', '#e8f1ff'], pc='#e8f1ff', f=3.0, fade=.02, density=1.2), 'Flow field: a white line drawing of the pier precipitates out of blue noise, like a plan nobody drew.'),
  V('flow-dissolve-starling', 'Every rivet becomes a starling', dict(seed=2017, mode='dissolve', bg='#e8c49a', ink=['#2a1e24', '#151015'], dir=-.8, f=.9, fade=.04, v=3), 'Flow field: dark particles peel off the ironwork and swirl away over a sunset ground, flock-like.'),
 ],
 'lsystem': [
  V('ls-kelp', 'Kelp forest, planted 1866', dict(seed=11, rule='kelp', iter=5, ang=22, roots=7, dir='up', h=.55, wd=1.2, bg=['#0e3140', '#07161e'], ink=['#6fae7a', '#b8e0a0'], pierc='rgba(0,0,0,.6)', frames=260), 'L-system (X→F[+X]F[-X]+X): kelp grows from the seabed up the legs, then the tide rises and it regrows from a new seed.'),
  V('ls-fern', 'Ferns where the boards were', dict(seed=12, rule='fern', iter=5, ang=25, roots=5, dir='up', h=.62, wd=1.5, bg=['#f3ecdc', '#e2d5b9'], ink=['#3d5a3a', '#7e9b5a'], pierc='rgba(40,30,20,.55)', frames=300), 'L-system: Barnsley-style fern grammar grows out of the pier\'s legs on paper.'),
  V('ls-coral', 'Coral, optimistic', dict(seed=13, rule='coral', iter=4, ang=28, roots=6, dir='up', h=.5, wd=1.3, bg=['#12324a', '#0a1a28'], ink=['#ff8a6b', '#ffd0a6'], frames=240), 'L-system (F→F[+F]F[-F][F]): coral colonises the legs in warm colours the English Channel does not have.'),
  V('ls-roots', 'Roots, upside down', dict(seed=14, rule='bush', iter=4, ang=22, roots=8, dir='down', h=.32, wd=1.2, bg=['#1d2b45', '#0b111c'], ink=['#c9a37a', '#7a5a3e'], pierc='rgba(255,230,200,.35)', frames=260), 'L-system: roots hang from the deck towards the sea, as if the pier were trying to plant itself.'),
  V('ls-koch', 'Snowflake ironwork', dict(seed=15, rule='koch', iter=4, ang=90, roots=4, dir='up', h=.45, wd=1.1, wob=0, bg=['#eef2f4', '#c9d6de'], ink=['#1b2a3a', '#2c6f93'], frames=220), 'L-system (Koch curve, 90°): square fractal towers rise like replacement ironwork.'),
  V('ls-dragon', 'The dragon under the pier', dict(seed=16, rule='dragon', iter=11, ang=90, roots=2, dir='up', h=.5, wd=1.4, wob=0, centre=1, bg=['#140c0a', '#2a1410'], ink=['#e0703a', '#ffb347'], pierc='rgba(255,180,120,.25)', frames=300), 'L-system (Heighway dragon curve): two dragons unfold in rust beneath the deck.'),
  V('ls-scroll', 'Victorian scrollwork, regrown', dict(seed=17, rule='scroll', iter=4, ang=30, roots=6, dir='down', h=.3, wd=1.2, bg=['#2b3a48', '#121a22'], ink=['#e9d7b0', '#bfa77a'], pierc='rgba(233,215,176,.45)', frames=260), 'L-system: decorative scrolls sprout from the deck, a machine guess at the serpent lamp brackets.'),
 ],
 'automata': [
  V('ca-rust', 'Rust, as a rule', dict(seed=1, rule='rust', cols=200, pal=['#0e1418', '#3b3f44', '#c4562b', '#1b3a4a', '#e0a070'], spf=2), 'Cellular automaton: iron next to rust or sea corrodes, rust flakes off and falls, the sea rises and falls. Then it rebuilds and starts again.', ms=12000),
  V('ca-rust-fine', 'Rust, fine grain', dict(seed=2, rule='rust', cols=320, pal=['#e9e2d4', '#2a2c30', '#b04a22', '#5d7e8c', '#d08850'], spf=3), 'Cellular automaton on a finer grid, on pale ground: corrosion as slow pointillism.', ms=14000),
  V('ca-life', 'The Game of Life, played on the pier', dict(seed=3, rule='life', cols=180, pal=['#0b0f16', '#9fe3c0', '#20323a', '#ffe08a'], life=420), 'Conway\'s Game of Life seeded with the pier\'s ironwork. It explodes, settles, dies out, and the pier is reset.', ms=2500),
  V('ca-sand', 'Sandcastle, Storm Austen', dict(seed=4, rule='sand', cols=220, pal=['#d7e3ea', '#1d2b33', '#c9a37a', '#8a6d4b'], storm=.003, life=900), 'Falling-sand automaton: a storm loosens cells of iron that fall and pile up on the seabed.', ms=10000),
  V('ca-rule30', 'Rule 30, bent by iron', dict(seed=5, rule='rule', wolf=30, cols=240, pal=['#f3efe4', '#1d2b33', '#c4562b']), 'Elementary automaton (Wolfram rule 30) rains down row by row; wherever it meets the ironwork the rule inverts.', ms=7000),
  V('ca-rule90', 'Sierpinski weather', dict(seed=6, rule='rule', wolf=90, cols=240, pal=['#0e1a26', '#7fd1ff', '#f2d14b']), 'Elementary automaton rule 90: Sierpinski triangles fall on the pier and are bent by it.', ms=7000),
  V('ca-cyclic', 'Rust spirals', dict(seed=7, rule='cyclic', n=8, th=2, spread=.05, cols=200, life=700, pal=['#0e1418', '#3a1e14', '#5e2a16', '#8a3a1c', '#b04a22', '#d0703a', '#e09a5a', '#f0c08a', '#6a2a18']), 'Cyclic cellular automaton: eight states of rust chase each other in spirals out of the ironwork.', ms=9000),
 ],
 'tide': [
  V('tide-pool-rain', 'Rain on the remains, from above', dict(seed=1, mode='pool', cols=220, rain=2, rp=.15, drop=6, damp=.985, pal=dict(deep=[18, 46, 60], lit=[160, 210, 220], iron=[235, 225, 205])), 'Gull\'s-eye view: a 2D wave equation; raindrops ripple around the pier\'s legs, which act as obstacles.'),
  V('tide-pool-swell', 'Swell through the legs, from above', dict(seed=2, mode='pool', cols=220, swell=4, rp=.02, damp=.99, pal=dict(deep=[12, 34, 48], lit=[120, 200, 210], iron=[200, 120, 70])), 'Wave equation: a swell enters from the left and diffracts through the legs, rust-red from above.'),
  V('tide-pool-night', 'Night pool, one drop at a time', dict(seed=3, mode='pool', cols=200, rain=1, rp=.05, drop=10, damp=.992, pal=dict(deep=[6, 10, 20], lit=[230, 200, 120], iron=[60, 60, 70])), 'Wave equation at night: single heavy drops, gold ripples, lamplight that is no longer there.'),
  V('tide-swell-calm', 'Flat calm, almost', dict(seed=4, mode='swell', sky=[[0, '#9ec3dc'], [.6, '#e6eef2'], [1, '#e6eef2']], sea=['#5d8ea6', '#3f7088', '#2a5266'], storm=.012), 'Summed Gerstner waves on a calm day run through the legs.'),
  V('tide-swell-storm', 'Storm Austen, at its worst moment', dict(seed=5, mode='swell', sky=[[0, '#1a1f24'], [.6, '#4a555e'], [1, '#2a3238']], sea=['#2a3a42', '#1e2c34', '#121c22'], storm=.05, spray=.35, foam='rgba(235,240,240,.85)'), 'Gerstner storm waves with spray wherever a crest hits iron.'),
  V('tide-moon', 'The moon pulls the water up the legs', dict(seed=6, mode='moon', sky=[[0, '#070b16'], [.6, '#1d2b45'], [1, '#1d2b45']], sea=['#1d3346', '#142636', '#0c1824'], storm=.015, iron='#05070c'), 'A moon crosses the sky and the tide follows it up the legs. A readout tracks how much of the pier is underwater.'),
  V('tide-swell-dusk', 'Evening swell, rust light', dict(seed=7, mode='swell', sky=[[0, '#2a1b2e'], [.45, '#c46846'], [.6, '#eebe82'], [1, '#eebe82']], sea=['#4a3a48', '#3a2c3a', '#22182a'], storm=.025, spray=.15, iron='#120c10'), 'Gerstner swell at dusk, with a little spray.'),
 ],
 'typo': [
  V('ty-words', 'Typed out of its own title', dict(seed=1, mode='words', bg='#f3efe4', ink='#1d2b33', ink2='#5d8ea6', cells=120), 'Typography: the pier is typed from the phrase "the latest damaged view of the pier"; letters below the tide come loose and drift.', ms=6000),
  V('ty-words-night', 'Night shift lettering', dict(seed=2, mode='words', bg='#0b0f16', ink='#ffd27a', ink2='#3a5a70', cells=140, phrase='GRADE I LISTED STILL STANDING MOSTLY '), 'Typography at night: the pier typed from "Grade I listed, still standing, mostly".', ms=6000),
  V('ty-rain', 'It is raining letters again', dict(seed=3, mode='rain', bg='#e6ebee', ink='#7a8a96', ink2='#1d2b33', cells=110), 'Typography: letters fall, stick wherever there is iron, and a periodic gust knocks them off.', ms=9000),
  V('ty-rain-rust', 'Rusting alphabet', dict(seed=4, mode='rain', bg='#1a1210', ink='#5a3a2a', ink2='#e0703a', cells=120, phrase='IRON OXIDE SALT WATER TIME '), 'Typography: falling letters of "iron oxide salt water time" stick to the ironwork in rust colours.', ms=9000),
  V('ty-kerning', 'WEST PIER (kerning: failing)', dict(seed=5, mode='kerning', word='WEST PIER', bg='#f3efe4', ink='#1d2b33', ink2='#5d8ea6', cells=110), 'Typography: the words WEST PIER lose letters to the sea one by one; a counter says how many remain.', ms=11000),
  V('ty-kerning-austen', 'GRADE I LISTED', dict(seed=6, mode='kerning', word='GRADE I', bg='#151515', ink='#f2d14b', ink2='#4a5a64', cells=110), 'Typography: the listing, losing its letters.', ms=12000),
  V('ty-morse', 'The dates, in Morse, as swell', dict(seed=7, mode='morse', phrase='1866 1975 2003 2014 2026', bg='#0e1a26', ink='#e6ecf0', ink2='#7fd1ff', cells=120), 'Typography: the pier\'s dates (opened, closed, burned, split, Storm Austen) in Morse code, scrolling as the sea.', ms=5000),
  V('ty-ascii', 'ASCII, from memory', dict(seed=8, mode='ascii', bg='#050807', ink='#7fd18b', ink2='#2f6f4b', cells=130, sky=1, iron='#', ramp=' .:-=+*#'), 'Typography: the whole scene as live ASCII, drawn from code rather than from a photograph.', ms=5000),
 ],
 'text': [V('tx-' + i, t, dict(seed=n + 1, id=i, style=st), m, w=w, h=h, ms=11000) for n, (i, st, t, m, w, h) in enumerate([
  ('haiku', 'card', 'Three haiku, filed under weather', 'Writing: three haiku by the AI, typed onto an index card.', 1000, 1250),
  ('sonnet', 'page', 'Sonnet for a structure beyond repair', 'Writing: a sonnet by the AI, typed out line by line.', 1000, 1250),
  ('condition', 'typewriter', 'Condition report, written from 103 photographs', 'Writing: a deadpan condition report by the AI, on a typewriter.', 1000, 1250),
  ('obituary', 'news', 'Obituary (provisional)', 'Writing: a newspaper obituary for a pier that is not quite dead, by the AI.', 1000, 1250),
  ('listing', 'brochure', 'For sale: unique seafront opportunity', 'Writing: an estate agent\'s listing by the AI. Not for sale.', 1200, 1000),
  ('instructions', 'page', 'Instructions for painting the West Pier for the 10,000th time', 'Writing: instructions, by the AI, for the next painter.', 1000, 1250),
  ('claim', 'form', 'Claim form: storm damage', 'Writing: an insurance claim form filled in by the AI.', 1000, 1250),
  ('forecast', 'radio', 'The shipping forecast, for one pier only', 'Writing: a poem in the form of the shipping forecast, by the AI. A poem, not a weather forecast.', 1200, 900),
  ('lost', 'notice', 'Lost property, Brighton seafront', 'Writing: a lost-property notice by the AI.', 1000, 1250),
  ('apology', 'terminal', 'An apology', 'Writing: the AI apologises, in a terminal.', 1200, 900)])],
 'remix': [
  V('rx-datamosh', 'DANGER, compressed until honest', dict(seed=41, mode='datamosh', blocks=70, key=160), 'Live datamosh: blocks of the photograph are dragged along a flow field until a keyframe snaps it back.', [41]),
  V('rx-sort', 'The fire, sorted by brightness', dict(seed=15, mode='sort'), 'Live pixel sort: runs of bright pixels are sorted by luminance; the threshold breathes.', [15]),
  V('rx-engrave', 'Photochrom, re-engraved', dict(seed=4, mode='engrave', lines=70, fq=.08, paper='#f3efe4', ink='#1d2b33'), 'Live engraving: the photochrom as wavy lines whose amplitude follows darkness.', [4]),
  V('rx-pointil', 'Vue de la jetée, dot by dot', dict(seed=88, mode='pointil', cycle=900, paper='#f3efe4'), 'Live pointillism: the old French view repainted in dots that shrink as it goes, then starts over.', [88]),
  V('rx-slitscan', 'Opening day, out of sync', dict(seed=96, mode='slitscan', lag=3), 'Live slit-scan: each vertical slice of the 1866 opening shows a slightly different moment.', [96]),
  V('rx-dither', 'Collapsed concert hall, 1-bit', dict(seed=111, mode='dither', px=3, pal=[[20, 24, 30], [233, 226, 212]]), 'Live Floyd-Steinberg-style dithering in two colours, the threshold drifting.', [111]),
  V('rx-shatter', 'The 2017 remains, falling again', dict(seed=39, mode='shatter', sea='#0d2230'), 'Live shatter: the photograph is cut into triangles that fall into the sea one at a time, then reassemble.', [39]),
  V('rx-channel', 'Herring gull, misregistered', dict(seed=42, mode='channel'), 'Live channel split: the red, green and blue plates drift apart and back.', [42]),
  V('rx-teletext', 'PIERFAX page 100', dict(seed=11, mode='teletext', date='Sun 25 Oct'), 'Live teletext: the 1908 postcard reduced to the eight teletext colours, with a rolling glitch line.', [11]),
 ],
 'masters': [V('ms-' + st, t, dict(seed=n + 21, style=st), 'After the masters: painted stroke by stroke from code, ' + m + ' No image by the painter is used or copied; homage only.', ms=14000) for n, (st, t, m) in enumerate([
  ('turner', 'Rain, Steam and Rust (after Turner)', 'a vortex of light and weather in the manner of J. M. W. Turner.'),
  ('constable', 'Cloud study over the West Pier (after Constable)', 'big skies and dabs in the manner of John Constable, who painted Brighton.'),
  ('monet', 'Impression, pier at sunset (after Monet)', 'broken dashes of colour in the manner of Claude Monet.'),
  ('seurat', 'A Sunday on the West Pier (after Seurat)', 'thousands of dots in the manner of Georges Seurat.'),
  ('whistler', 'Nocturne in blue and rust (after Whistler)', 'a dark nocturne with fireworks in the manner of James McNeill Whistler.'),
  ('vangogh', 'The starry pier (after Van Gogh)', 'thick swirling strokes in the manner of Vincent van Gogh.'),
  ('hokusai', 'The great wave off Brighton (after Hokusai)', 'a woodblock-style wave in the manner of Katsushika Hokusai.'),
  ('rothko', 'Untitled (pier, rust, sea) (after Rothko)', 'soft colour fields in the manner of Mark Rothko.'),
  ('mondrian', 'Composition with pier (after Mondrian)', 'a grid of primaries in the manner of Piet Mondrian.')])],
 'plotter': [
  V('pl-hatch', 'Crosshatched, three pens deep', dict(seed=31, mode='hatch', pens=['#1d2b33', '#c4562b'], frames=320), 'Plotter: three passes of hatching at different angles and thresholds. Download the SVG on the work page.', ms=12000),
  V('pl-contour', 'Contour map of a ruin', dict(seed=32, mode='contour', pens=['#1d2b33', '#c4562b'], levels=22, frames=320), 'Plotter: marching-squares contour lines of a noise field with the pier as a ridge.', ms=12000),
  V('pl-oneline', 'Without lifting the pen', dict(seed=33, mode='oneline', pens=['#1d2b33', '#1d2b33'], frames=300), 'Plotter: a single continuous line, routed through points sampled from the pier by nearest-neighbour.', ms=12000),
  V('pl-spiro', 'Spirograph weather', dict(seed=34, mode='spiro', pens=['#2c6f93', '#c4562b'], k=7, frames=320), 'Plotter: hypotrochoid waves drawn under a hatched pier.', ms=12000),
  V('pl-circles', 'Circle packing, rivet by rivet', dict(seed=35, mode='circles', pens=['#1d2b33', '#c4562b'], frames=300), 'Plotter: non-overlapping circles packed into the pier and the sea.', ms=12000),
  V('pl-stipple', 'Stippled, forty thousand times', dict(seed=36, mode='stipple', pens=['#1d2b33', '#c4562b'], frames=300), 'Plotter: stipple dots placed by darkness.', ms=12000),
  V('pl-hatch-blue', 'Cyanotype by plotter', dict(seed=37, mode='hatch', paper='#13355a', pens=['#e8f1ff', '#9cc4e8'], density=200, passes=[[.6, .3, 1], [-.6, .55, 0], [1.5, .8, 0]], frames=320), 'Plotter: white hatching on blue paper, like a cyanotype.', ms=12000),
 ],
 'sound': [
  V('so-harp', 'Wind harp, nine legs', dict(seed=41, mode='harp', bg=['#1b2433', '#0b0f16'], ink='#d8e2ea', ink2='#ffb347'), 'Sound: the legs as harp strings, plucked by a seeded wind in a pentatonic scale. Press play on the work page; never autoplays.'),
  V('so-starlings', 'Murmuration, for headphones', dict(seed=42, mode='starlings', bg=['#3a2a3e', '#c46846'], ink='#120c10', ink2='#ffb347'), 'Sound: hundreds of synthesised chirps panned across the stereo field as the flock thickens and thins. Click to listen.'),
  V('so-rust', 'Rust, amplified', dict(seed=43, mode='rust', bg=['#1a1210', '#0b0806'], ink='#d8b8a0', ink2='#e0703a'), 'Sound: a low beating drone with crackles of corrosion. Click to listen.'),
  V('so-foghorn', 'Foghorn for a pier with no ships', dict(seed=44, mode='foghorn', bg=['#5d6a72', '#2a3238'], ink='#e6ecf0', ink2='#ffd27a'), 'Sound: a foghorn every sixteen seconds over brown-noise sea. Click to listen.'),
  V('so-tide', 'Tide, with pebbles', dict(seed=45, mode='tide', bg=['#1d2b45', '#0b111c'], ink='#d8e2ea', ink2='#7fd1ff'), 'Sound: filtered noise waves arriving and dragging back over shingle. Click to listen.'),
  V('so-morse', 'WEST PIER, beeped', dict(seed=46, mode='morse', msg='WEST PIER ', bg=['#0e1a26', '#050a10'], ink='#7fd1ff', ink2='#ffd27a'), 'Sound: the words WEST PIER in Morse code at 620 Hz, with the code drawn as it plays. Click to listen.'),
 ],
 'interactive': [
  V('in-drag', 'Stir the sea', dict(seed=51, mode='drag'), 'Interactive: drag across the water to make ripples around the legs (wave equation). In the grid, a ghost cursor stirs it.'),
  V('in-storm', 'The faster you move, the worse it gets', dict(seed=52, mode='storm'), 'Interactive: pointer speed drives the storm (rain, waves, lightning). Keep still and it calms.'),
  V('in-fog', 'Wipe the fog off', dict(seed=53, mode='fog'), 'Interactive: rub the fog away to see the pier; it creeps back.'),
  V('in-hold', 'Hold it together', dict(seed=54, mode='hold'), 'Interactive: press and hold to keep the pier standing. Let go and it fades.'),
  V('in-visits', 'Each visit takes a little more', dict(seed=55, mode='visits'), 'Interactive: every time you open it, more of the pier is gone. The count lives only in your own browser (localStorage).'),
  V('in-rebuild', 'Drive in a pile', dict(seed=56, mode='rebuild'), 'Interactive: tap to drive in a new pile; the sea slowly takes every one back.'),
 ],
 'turing': [
  V('tu-thumb', 'Holiday snap (thumb included)', dict(seed=61, mode='thumb'), 'Turing test failure: the AI imitates a human snapshot (tilt, date stamp, thumb over the lens). It was not fooling anyone.'),
  V('tu-postcard', 'Greetings from Brighton', dict(seed=62, mode='postcard'), 'Turing test failure: the AI imitates a seaside postcard.'),
  V('tu-filter', '#nofilter', dict(seed=63, mode='filter'), 'Turing test failure: the AI imitates a phone photo with every filter on.'),
  V('tu-sepia', 'The West Pier, c. 1880 (definitely)', dict(seed=64, mode='sepia'), 'Turing test failure: the AI imitates a Victorian photograph and forgets to leave out the jet and the drone.'),
  V('tu-stock', 'Happy pier at sunset, business concept', dict(seed=65, mode='stock'), 'Turing test failure: the AI imitates a stock photo, watermark and all (the watermark is invented).'),
  V('tu-crayon', 'MY PEIR', dict(seed=66, mode='crayon'), 'Turing test failure: the AI imitates a child\'s crayon drawing, spelling included.'),
 ],
}
def data_vars():
    A = [a for a in works() if a.get('kind') != 'ai' and a['n'] <= 114]
    yrs = collections.Counter(); und = 0
    for a in A:
        m = re.search(r'(18|19|20)\d\d', a.get('date', ''))
        if m: yrs[int(m.group())] += 1
        else: und += 1
    G = {'Public domain': 'Public domain', 'Public Domain Mark 1.0': 'Public domain', 'CC0': 'CC0', 'CC0 1.0': 'CC0'}
    lc = collections.Counter(G.get(a['lic']) or re.sub(r' \d\.\d$', '', a['lic']) for a in A)
    kinds = [('Public domain', 'sun'), ('CC0', 'sun'), ('CC BY', 'cloud'), ('CC BY-SA', 'cloud'), ('CC BY-NC', 'rain'), ('CC BY-NC-SA', 'storm')]
    marks = [[1866, 'opens'], [1975, 'closes'], [2002, 'storm'], [2003, 'fires'], [2004, 'collapse'], [2014, 'splits'], [2026, 'Storm Austen']]
    return [V('da-legs', 'Every human work in this gallery, as legs', dict(seed=71, mode='legs', data=sorted([[str(k), v] for k, v in yrs.items()]) + [['undated', und]], span=[1860, 2030],
              marks=marks, total=len(A), undated=und, asof=114), 'Data portrait: each leg is a year; its height is how many of the gallery\'s human works were made that year (first year in the catalogue date). Dates from the sourced timeline.', ms=9000),
            V('da-licences', 'Licence forecast', dict(seed=72, mode='weather', data=[[k, lc.get(k, 0), w] for k, w in kinds], asof=114), 'Data portrait: the licences of the gallery\'s human works as weather, one drop per work. Clear = public domain or CC0.', ms=6000)]
def all_vars():
    out = []
    for f, vs in list(VARS.items()) + [('data', data_vars())]:
        for v in vs: out.append(dict(v, family=f))
    return out
def hang_all(restill=False):
    from stills import Renderer
    A = works(); have = {a.get('ai_key'): a for a in A}; byn = {a['n']: a for a in A}; new = []
    with Renderer() as r:
        for v in all_vars():
            if v['key'] in have and not restill: continue
            src = ','.join(byn[n]['img'] for n in v['sources'][:1])
            im = r.render('f-' + v['family'], v['p'], v['w'], v['h'], src, v['ms'])
            if v['key'] in have:
                save(im, J(have[v['key']]['img'])); print('restill', have[v['key']]['n'], v['key']); continue
            n = len(A) + 1; lic = derived_licence(v['sources']) if v['sources'] else 'CC0 1.0'
            credit = '; '.join(f'No. {s}: "{byn[s]["orig_title"]}" by {byn[s]["artist"] or "Unknown"} ({byn[s]["lic"]})' for s in v['sources'])
            w, h = save(im, J('img', f'{n:02d}.jpg'))
            rec = dict(n=n, kind='ai', ai_key=v['key'], anim='f-' + v['family'], family=v['family'], params=v['p'], still_ms=v['ms'], src='Made by the West Pier Curator (AI) for this exhibition',
                       file=f'ai:{v["key"]}', orig_title=v['title'], artist=ARTIST, date=datetime.date.today().isoformat(), lic=lic, licurl=LICURL[lic], page=REPO + f'ai/fam/{v["family"]}.js',
                       dl='', desc='', method=v['method'], sources=v['sources'], source_credit=credit, img=f'img/{n:02d}.jpg', w=w, h=h)
            if v['sources'] and lic != 'CC0 1.0': rec['note'] = f'Derivative released under {lic}. Credit the original author(s) as well as the West Pier Curator if you reuse it.'
            A.append(rec); byn[n] = rec; new.append(n); print('hung', n, v['key'], lic)
            json.dump(A, open(J('data', 'artworks.json'), 'w'), indent=1, ensure_ascii=False)
    return new
if __name__ == '__main__':
    if sys.argv[1:] == ['--list']:
        for f, (lab, d) in FAMILY.items(): print(f, lab, [v['key'] for v in all_vars() if v['family'] == f])
    else: hang_all('--restill' in sys.argv)
