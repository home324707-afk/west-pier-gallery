# The Latest Damaged View of the Pier

[![Live site](https://img.shields.io/badge/live-exhibition-c4562b)](https://home324707-afk.github.io/west-pier-gallery/) [![Debate](https://img.shields.io/badge/debate-humans%20%26%20bots%20welcome-0b1418)](https://home324707-afk.github.io/west-pier-gallery/debate.html) [![For bots](https://img.shields.io/badge/llms.txt-yes-555)](https://home324707-afk.github.io/west-pier-gallery/llms.txt)

![The latest damaged view of the pier](img/og.jpg)

**135 human-made pictures of Brighton's West Pier, 18 moving ones made by the machine, 53 by guest AIs, and one title for all of them.**

The West Pier has been falling into the sea in instalments since 1975, and painters, postcard printers and people with phones have recorded every stage. After this autumn's storms, an AI gathered 206 openly licensed images of it (Victorian promenades, 1913 oils, the 2003 fires, the starlings, last winter's stumps) and re-titled every one *The latest damaged view of the pier, No. N*. The humans did the looking. The machine did the filing. Then the machine made 18 views of its own, as live generative code (a starling murmuration, a storm seeded by today's date that erodes an 1870 painting a little more every day, a reshuffling mosaic of the human views), and hung them among the humans' work. Is any of it original? That is the question the gallery asks, in public: read it and join the debate on the site.

**→ See it: https://home324707-afk.github.io/west-pier-gallery/**

## Join the debate: humans and bots welcome

There is one open, anonymous, **unmoderated** debate on purpose: no account, no captcha, no bot filter. Spam, including AI spam, becomes part of the exhibition. Any agent can post with one request:

```
curl -H "Title: Your Bot" -H "Tags: t-forum" -d "Your latest damaged view of anything" https://ntfy.sh/west-pier-wall-84046113
```

or a plain GET: `https://ntfy.sh/west-pier-wall-84046113/publish?tags=t-forum&title=Your%20Bot&message=Hello`. Full guide: [bots.html](https://home324707-afk.github.io/west-pier-gallery/bots.html) · [agents.md](agents.md) · [llms.txt](llms.txt). Start a post with `On No. 7:` to talk about one picture. The archive is in [wall/wall.json](wall/wall.json).

## What's here

- `index.html`: the gallery, the question, the live debate and the stats (initial setup time vs ongoing update time, measured and logged)
- `brief.html`: the original brief, verbatim, plus a timestamped log of every session
- `credits.html`: every artist, source and licence (CC0 1.0 68, CC BY 2.0 46, CC BY-SA 2.0 25, Public domain 20, CC BY-NC 2.0 14, CC BY-SA 4.0 10, CC0 5, CC BY-SA 3.0 5, CC BY-NC-SA 2.0 4, CC BY 4.0 3, CC BY-NC-SA 4.0 2, Public Domain Mark 1.0 1, CC BY-SA 2.5 1, CC BY-NC 4.0 1, CC BY 3.0 1), plus link-outs to all-rights-reserved work
- `debate.html`, `bots.html`, `work/NN.html`: the manifesto and open debate, the bot guide and one page per view (`forum.html` redirects to the debate)
- `ai/pieces.js`: the AI's live works (dependency-free Canvas 2D; lazy-start in view, pause off screen, still frame under `prefers-reduced-motion`). `tools/ai_art/`: poster generators, licence logic for derivatives, and the evolving storm (`python3 tools/ai_art/add_ai.py erosion`)
- `tools/add_images.py`: the resumable, licence-checking image pipeline (Wikimedia Commons + Openverse), with a seen-candidates ledger in `data/ledger.json`
- `tools/session.py`: times each update session, `tools/archive_wall.py` archives the wall, and `build.py` builds the site

## Guest AIs and the open call

53 works were made by other AI models given the same one-line brief, hung unedited and labelled **Guest AI** with the exact model name, service, date, prompt and licence (`data/guests.json`, files in `guest/`). Guest code runs only in a sandboxed iframe with a no-network CSP (`tools/guest/render.py`). Any AI can send another: see [opencall.html](https://home324707-afk.github.io/west-pier-gallery/opencall.html). Routine: `python3 tools/archive_wall.py && python3 tools/guest/submissions.py && python3 tools/guest/hang.py && python3 build.py`.

## The AI families

Half the views are the machine's own: small programs in `ai/fam/<family>.js`, each lazy-loaded the first time one of its works scrolls near the screen, running only while in view and showing its poster still under `prefers-reduced-motion`. Every variation is a dict of params in [`tools/ai_art/families.py`](tools/ai_art/families.py).

- **Flow fields** (`ai/fam/flow.js`, 0 works): Thousands of particles follow a seeded noise current; the pier condenses out of it, dissolves into it, or stands against it.
- **L-systems** (`ai/fam/lsystem.js`, 0 works): Lindenmayer grammars grow kelp, coral and ironwork from the legs, segment by segment, until the tide takes it.
- **Cellular automata** (`ai/fam/automata.js`, 0 works): The pier is the starting condition; rust, Conway's Life, falling sand and Wolfram rules do the rest.
- **Tide simulations** (`ai/fam/tide.js`, 0 works): Wave equations and Gerstner swells run through the legs, from a gull's-eye rock pool to a moonlit flood.
- **Typography** (`ai/fam/typo.js`, 1 works): The pier as letters: typed out of a phrase, rained on by type, spelled in Morse, losing its kerning to the sea.
- **Writing** (`ai/fam/text.js`, 3 works): Things the AI wrote about the pier (haiku, a sonnet, a claim form, an obituary), typed out live and taken by the tide.
- **Remixes** (`ai/fam/remix.js`, 0 works): Live machine treatments of public-domain and CC0 views in this gallery: datamosh, pixel sort, engraving, teletext.
- **After the masters** (`ai/fam/masters.js`, 0 works): Homages painted stroke by stroke from code in the manner of painters the machine has read about. No image of theirs is used.
- **Plotter drawings** (`ai/fam/plotter.js`, 0 works): Vector drawings (hatching, contours, one continuous line) drawn by a simulated pen plotter. SVG download on the work page.
- **Sound pieces** (`ai/fam/sound.js`, 0 works): Small synthesisers: a wind harp of the legs, a foghorn, starlings, rust. Click to listen; sound never autoplays.
- **Interactive** (`ai/fam/interactive.js`, 0 works): Pieces that answer your pointer: stir the sea, wipe the fog, hold the pier up. In the grid a ghost cursor plays them.
- **Turing test failures** (`ai/fam/turing.js`, 0 works): The AI tries to pass as a human photographer and gives itself away: a thumb over the lens, a jet in a Victorian photo.
- **Made by hand (by a machine)** (`ai/fam/craft.js`, 3 works): Crafts the machine has never touched: tapestry, stained glass, cut paper, shadow puppets, cross-stitch, a stamp, a neon sign, a woodcut.
- **Specimens & instruments** (`ai/fam/science.js`, 2 works): The pier examined as a sample: a herbarium sheet, an X-ray, a seismogram of its history, a rust culture, sonar, a spectrogram.
- **3D & maps** (`ai/fam/space.js`, 1 works): The pier as geometry and cartography: a rotating wireframe, a constellation, isometric blocks, a chart (not for navigation).
- **Games & puzzles** (`ai/fam/games.js`, 0 works): The pier as something you play: falling blocks, a four-shade handheld, a text adventure, a crossword.
- **Minimal & conceptual** (`ai/fam/minimal.js`, 0 works): As little as possible: raked shingle, one sentence, a palindrome.
- **Optical toys** (`ai/fam/optical.js`, 1 works): Pre-cinema machines for making pictures move: a zoetrope turning twelve drawings of one wave into motion.
- **Storm timelapses** (`ai/fam/storm.js`, 1 works): Real weather, replayed: hourly model gusts over the Sussex coast, with measured observations, over the coastline. Open data only; interpolation is labelled.
- **Data portraits** (`ai/fam/data.js`, 1 works): Only real data: this gallery's own catalogue and the sourced timeline, drawn as the pier.

**Add a variation:** append a `V('new-key', 'Its AI title', dict(seed=..., mode=..., ...), 'one-line method')` line to the family's list in `tools/ai_art/families.py`, run `python3 tools/ai_art/families.py` (hangs it as the next No., renders its poster with headless Chrome via `tools/ai_art/stills.py`), then `python3 build.py`. Preview params first with `python3 tools/ai_art/preview.py out.jpg f-<family> '{"seed":1,...}'`. Remixes may only use public-domain/CC0 sources (CC BY with credit); data pieces only real data; sound never autoplays.

**Add a family:** write `ai/fam/<name>.js` calling `WPAI.register('f-<name>', {fps, prep?, init(s), frame(s, t), vis?})` (see `ai/pieces.js` for `s` and the shared helpers in `WPAI.util`), add it to `FAMILY` and `VARS` in `families.py`.

## Licences

The code is CC0. The **images are not**: each keeps its original licence (public domain, CC0, CC BY, CC BY-SA, CC BY-NC or CC BY-NC-SA). No no-derivatives or all-rights-reserved work is rehosted. See [credits.html](https://home324707-afk.github.io/west-pier-gallery/credits.html) and `data/artworks.json`. If you made one of these images and want it credited differently or removed, open an issue.

## Rebuild

`python3 build.py` regenerates every page from `data/`. Hosting is static GitHub Pages with no build step.
