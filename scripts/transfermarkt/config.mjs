// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 DATA ENGINE — CONFIG
//
// The single place to tune the pipeline. Add a competition, change a
// threshold, or point at a different export by editing here — never by
// touching stage code. All paths are absolute, derived from repo root.
// ─────────────────────────────────────────────────────────────────────────

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(__dirname, '..', '..')

// INPUT — raw Kaggle CSVs (git-ignored, read-only, never written to).
export const RAW_DIR = path.join(ROOT, 'data', 'transfermarkt')
export const CSV = {
  appearances:  path.join(RAW_DIR, 'appearances.csv'),
  players:      path.join(RAW_DIR, 'players.csv'),
  clubs:        path.join(RAW_DIR, 'clubs.csv'),
  competitions: path.join(RAW_DIR, 'competitions.csv'),
}

// OUTPUT — generated JSON the game consumes (committed).
export const OUT_DIR = path.join(ROOT, 'src', 'data', 'football501')
export const OUT = {
  data:         path.join(OUT_DIR, 'football501.generated.json'),
  players:      path.join(OUT_DIR, 'players.index.json'),
  clubs:        path.join(OUT_DIR, 'clubs.index.json'),
  competitions: path.join(OUT_DIR, 'competitions.index.json'),
  meta:         path.join(OUT_DIR, 'meta.json'),
  // questionCache is deferred (Stage 6) — path reserved.
  questionCache: path.join(OUT_DIR, 'questionCache.generated.json'),
}

// Columns each stage relies on. Stage 00 fails the build if a CSV is missing
// any of these, so a Kaggle schema change is caught immediately, not silently.
export const REQUIRED_COLUMNS = {
  appearances:  ['player_id', 'competition_id', 'player_club_id', 'goals', 'assists', 'yellow_cards', 'red_cards', 'minutes_played'],
  players:      ['player_id', 'name', 'country_of_citizenship', 'position', 'date_of_birth'],
  clubs:        ['club_id', 'name', 'domestic_competition_id'],
  competitions: ['competition_id', 'name', 'type', 'country_name'],
}

// Competitions to build challenges for. Only appearances in these are kept.
// Extend by adding the Transfermarkt competition_id. `label` is a display
// override; if omitted the name from competitions.csv is used.
export const COMPETITIONS = [
  { id: 'GB1', label: 'Premier League' },
  { id: 'ES1', label: 'La Liga' },
  { id: 'IT1', label: 'Serie A' },
  { id: 'L1',  label: 'Bundesliga' },
  { id: 'FR1', label: 'Ligue 1' },
  { id: 'CL',  label: 'Champions League' },
]
export const COMPETITION_IDS = new Set(COMPETITIONS.map(c => c.id))
export const COMPETITION_LABELS = Object.fromEntries(COMPETITIONS.map(c => [c.id, c.label]))

// Which players qualify. KEEP EVERYONE: obscure answers must be accepted, so
// the threshold is a floor of 1 appearance, not a top-N cut. Raise only if we
// ever need to drop single-cameo noise — but the default keeps all.
export const MIN_APPEARANCES = 1

// Nationality source field (citizenship, per the agreed design).
export const NATIONALITY_FIELD = 'country_of_citizenship'

// Challenge-roster eligibility (Stage 60). A player is a valid answer for a
// challenge iff their computed stat value is a legal single deduction:
//   ELIGIBLE_MIN ≤ value < ELIGIBLE_MAX   (i.e. 1..179).
// Values of 0 (or negative, for subtractions) don't score; values ≥ 180 exceed
// a darts visit and are not offered. Runtime checkout/bust (0 to −10) is the
// game's per-turn concern, not roster membership.
export const ELIGIBLE_MIN = 1
export const ELIGIBLE_MAX = 180

// Stage 60 warns when a challenge has fewer than this many eligible answers
// (likely unplayable); it fails the build only if a challenge resolves to zero.
export const MIN_ELIGIBLE_WARN = 15
