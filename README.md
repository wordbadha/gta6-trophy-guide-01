# Leonida Trophy Atlas

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/wordbadha/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/wordbadha/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01). Try make.fun yourself: https://make.fun/r/czd88s7a

## What it is

- **Every trophy, exactly as PlayStation publishes it** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden. Names, descriptions and grades match the official list.
- **A guide in our own words for every trophy**, each naming its sources (PowerPyx, PlanetGTA6, KeenGamer, OutputLag, GTAVibes, GTA Zone, PSNProfiles). Sources are cited, never copied. Guides that add steps beyond the official description are marked **Details unconfirmed** — confirm them against the cited guide before you grind.
- **A three-stage roadmap to the platinum**: story first (including the game's only missable trophy, **Positive Mental Attitude** — meditate at all 18 spots during the story), Leonida cleanup second, the long grinds last.
- **A tracker that remembers**: tick trophies off, progress saves in the browser (localStorage), export it to a file and import it back. Filters by kind (story, missable, collectibles, activities, online), grade and status, plus a text search.
- **Spoiler-safe**: with the spoiler setting on, the 28 hidden trophies stay hidden — name, description and guide — until you earn them.
- **Fully offline**: static files only, no network requests, no account, no cookies. Serve `app/` with any static server and open `app/index.html`.

## Screenshots

Four renders of the app running in desktop Chrome, listed in `shots.json`:

1. `1-checklist.png` — the checklist with spoiler setting off and three story trophies earned
2. `2-guide-open.png` — the guide open on Positive Mental Attitude, the game's only missable trophy
3. `3-silver.png` — the grade filter on silver (6 trophies)
4. `4-roadmap.png` — the roadmap to the platinum and the tracker controls

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Or serve `app/` with any static file server.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide (static, no build step)
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, kind, count, roadmap stage, guide, sources and verified flag
- `screenshots/` — four renders of the app running in a browser
- `shots.json` — which views the screenshots were taken of
- `main.ts` — the entrypoint that builds the submission output
- `serve.ts` — the local static server
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE). Leonida Trophy Atlas is an unofficial fan guide. Grand Theft Auto and GTA are trademarks of Rockstar Games; this guide uses no Rockstar logo, artwork or game screenshots.
