# Football 501 Data Engine

Converts the raw **Kaggle Transfermarkt** export (`davidcariboo/player-scores`,
CC0-1.0) into the JSON the Football 501 game consumes. Rerun it whenever a fresh
Kaggle export is downloaded.

## Run

```bash
# 1. Download the CSVs from Kaggle into data/transfermarkt/ (see below)
# 2. Build:
npm run build:501-data     # → node scripts/transfermarkt/build.mjs
```

## Input (never modified, never committed)

Place these four CSVs in `data/transfermarkt/` (git-ignored):

```
data/transfermarkt/
  appearances.csv     players.csv     clubs.csv     competitions.csv
  EXPORT.txt          # optional: jot the Kaggle "last updated" date; recorded in meta
```

The build **only ever reads** these. Kaggle download page:
<https://www.kaggle.com/datasets/davidcariboo/player-scores>

## Output (committed — the game imports these)

```
src/data/football501/
  football501.generated.json    per-player fact table: every qualifying player,
                                stats per competition, with a per-club breakdown
  players.index.json            { byId, byNorm } — display + name→id resolution
  clubs.index.json              clubId → { name, norm, competitionId }
  competitions.index.json       competitionId → { name, type, country }
  meta.json                     provenance: export date, counts, allow-list
  questionCache.generated.json  (deferred — Stage 6, not yet emitted)
```

Every qualifying player is kept (floor of 1 appearance) — **no top-N truncation**,
so obscure answers are accepted.

## Pipeline (each stage is a standalone, importable module)

| Stage | File | Does |
|---|---|---|
| 00 | `00-verify.mjs` | assert CSVs exist + required columns present (fails on schema drift) |
| 10 | `10-load-dimensions.mjs` | load players/clubs/competitions into id→record maps |
| 20 | `20-aggregate-appearances.mjs` | **stream** appearances → sum 6 measures per (player, comp, club) |
| 30 | `30-enrich-normalize.mjs` | join dims, normalise names/countries, roll up, build indices |
| 40 | `40-emit.mjs` | write the generated JSON (deterministic, sorted) |
| — | `build.mjs` | orchestrator: runs 00→40 in-process |

Shared: `config.mjs` (allow-list, thresholds, paths), `lib/csv.mjs` (streaming
reader), `lib/normalize.mjs` (game normaliser + country map), `lib/log.mjs`.

## Extending

- **Add a competition:** add its Transfermarkt `competition_id` to
  `COMPETITIONS` in `config.mjs`. Nothing else changes.
- **Add/change a stat:** the six measures live in Stage 20's reducer and
  Stage 30's rollup — add a field in both.
- **Change what qualifies:** `MIN_APPEARANCES` in `config.mjs` (keep at 1 to
  retain all players).

## Query model

Challenges are **expressions over `football501.generated.json`**, not new data:

```
<Stat1> <Op> <Stat2> from <Club | Nationality> players in <Competition>
```

- competition filter → `player.comps[competitionId]`
- club filter → `player.comps[competitionId].clubs[clubId]`
- nationality filter → `player.natKey`
- stats → any of `apps, goals, assists, yellow, red, minutes`

See `test/transfermarkt-pipeline.test.js` for worked examples of all three
formats against synthetic fixtures.
