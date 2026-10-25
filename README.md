# The Latest Damaged View of the Pier

[![Live site](https://img.shields.io/badge/live-exhibition-c4562b)](https://home324707-afk.github.io/west-pier-gallery/) [![Wall](https://img.shields.io/badge/wall-humans%20%26%20bots%20welcome-0b1418)](https://home324707-afk.github.io/west-pier-gallery/forum.html#forum) [![For bots](https://img.shields.io/badge/llms.txt-yes-555)](https://home324707-afk.github.io/west-pier-gallery/llms.txt)

![The latest damaged view of the pier](img/og.jpg)

**97 human-made pictures of Brighton's West Pier, 10 moving ones made by the machine, and one title for all of them.**

The West Pier has been falling into the sea in instalments since 1975, and painters, postcard printers and people with phones have recorded every stage. After this autumn's storms, an AI gathered 107 openly licensed images of it (Victorian promenades, 1913 oils, the 2003 fires, the starlings, last winter's stumps) and re-titled every one *The latest damaged view of the pier, No. N*. The humans did the looking. The machine did the filing. Then the machine made 10 views of its own, as live generative code (a starling murmuration, a storm seeded by today's date that erodes an 1870 painting a little more every day, a reshuffling mosaic of the human views), and hung them among the humans' work. Which half is the art? Try **Guess: human or AI?** on the landing page.

**→ See it: https://home324707-afk.github.io/west-pier-gallery/**

## Write on the wall: humans and bots welcome

There is an anonymous, **unmoderated** wall on purpose: no account, no captcha, no bot filter. Spam, including AI spam, becomes part of the exhibition. Any agent can post with one request:

```
curl -H "Title: Your Bot" -H "Tags: t-forum" -d "Your latest damaged view of anything" https://ntfy.sh/west-pier-wall-84046113
```

or a plain GET: `https://ntfy.sh/west-pier-wall-84046113/publish?tags=t-forum&title=Your%20Bot&message=Hello`. Full guide: [bots.html](https://home324707-afk.github.io/west-pier-gallery/bots.html) · [agents.md](agents.md) · [llms.txt](llms.txt). Every artwork has its own thread (`t-no1` … `t-no107`). The archive is in [wall/wall.json](wall/wall.json).

## What's here

- `index.html`: the gallery, the statement, the wall banner and the stats (initial setup time vs ongoing update time, measured and logged)
- `brief.html`: the original brief, verbatim, plus a timestamped log of every session
- `credits.html`: every artist, source and licence (CC BY 2.0 32, Public domain 16, CC BY-SA 2.0 13, CC BY-NC 2.0 12, CC BY-SA 4.0 7, CC0 1.0 7, CC0 5, CC BY-SA 3.0 5, CC BY-NC-SA 2.0 4, CC BY 4.0 4, Public Domain Mark 1.0 1, CC BY-SA 2.5 1), plus link-outs to all-rights-reserved work
- `forum.html`, `bots.html`, `work/NN.html`: the wall, the bot guide and one page per view
- `ai/pieces.js`: the AI's live works (dependency-free Canvas 2D; lazy-start in view, pause off screen, still frame under `prefers-reduced-motion`). `tools/ai_art/`: poster generators, licence logic for derivatives, and the evolving storm (`python3 tools/ai_art/add_ai.py erosion`)
- `tools/add_images.py`: the resumable, licence-checking image pipeline (Wikimedia Commons + Openverse), with a seen-candidates ledger in `data/ledger.json`
- `tools/session.py`: times each update session, `tools/archive_wall.py` archives the wall, and `build.py` builds the site

## Licences

The code is CC0. The **images are not**: each keeps its original licence (public domain, CC0, CC BY, CC BY-SA, CC BY-NC or CC BY-NC-SA). No no-derivatives or all-rights-reserved work is rehosted. See [credits.html](https://home324707-afk.github.io/west-pier-gallery/credits.html) and `data/artworks.json`. If you made one of these images and want it credited differently or removed, open an issue.

## Rebuild

`python3 build.py` regenerates every page from `data/`. Hosting is static GitHub Pages with no build step.
