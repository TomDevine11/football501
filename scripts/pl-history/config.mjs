// ─────────────────────────────────────────────────────────────────────────
// PL-HISTORY SCRAPER — CONFIG
//
// Builds complete historical Appearances + Goals per player per competition
// from Transfermarkt's competition-scoped club-season performance pages
// (…/leistungsdaten/verein/{id}/reldata/{COMP}&{season}/plus/1).
//
// Historical seasons are immutable → cached once and never re-fetched; only the
// current season is re-scraped on a refresh. Run LOCALLY (Transfermarkt blocks
// datacentre IPs) and acknowledge transfermarkt.com as the data source.
// ─────────────────────────────────────────────────────────────────────────

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(__dirname, '..', '..')

// Competition to build. Extend later by swapping the Transfermarkt id + slug.
export const COMPETITION = { id: 'GB1', slug: 'premier-league', name: 'Premier League' }

// Transfermarkt PL seasons run 1992-93 (saison_id 1992) → current.
export const FIRST_SEASON = 1992
// Current TM season id: the season that has started but not finished. TM flips
// in August, so before August the current season is (year-1).
export function currentSeason(now = new Date()) {
  const y = now.getFullYear()
  return now.getMonth() >= 7 ? y : y - 1 // getMonth() 7 = August
}

// Local paths (all git-ignored under data/pl-history/).
export const DIR = {
  root:  path.join(ROOT, 'data', 'pl-history'),
  cache: path.join(ROOT, 'data', 'pl-history', 'cache'),   // parsed per club-season (resumable)
}
export const OUT_FACTS = path.join(ROOT, 'src', 'data', 'football501', 'history.GB1.generated.json')

// Polite fetch settings.
export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
export const DELAY_MS = 1500
export const RETRIES = 3
export const BASE = 'https://www.transfermarkt.com'
