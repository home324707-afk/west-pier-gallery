# The Latest Damaged View of the Pier

An AI-curated exhibition of human-made images of Brighton's West Pier, made in the week of the October 2026 storms. Each painting, print, postcard and photograph has been re-titled *The latest damaged view of the pier, No. N*. The original title, artist and licence sit under every image.

**Live site:** https://home324707-afk.github.io/west-pier-gallery/

- `index.html`: the gallery, the statement and the two headline stats
- `brief.html`: the original brief (verbatim) and the timestamped work log
- `credits.html`: every artist, source and licence, plus link-outs to all-rights-reserved work
- `forum.html`: discussion and feedback via giscus / GitHub Discussions
- `work/NN.html`: one page per artwork, each with its own comment thread

## Licences
The code (HTML/CSS/JS/Python) is released under CC0. The **images are not**: each one keeps its original licence (public domain, CC0, CC BY, CC BY-SA, CC BY-NC or CC BY-NC-SA), as listed in `credits.html` and `data/artworks.json`. Share-alike images must stay under their original licence if you reuse them. Non-commercial images may not be used commercially.

## Rebuild
`python3 build.py` regenerates every page from `data/artworks.json`, `data/stats.json` and `log.txt`. No dependencies and no build step needed for hosting.
