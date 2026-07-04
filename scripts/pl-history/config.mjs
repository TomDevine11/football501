// ─────────────────────────────────────────────────────────────────────────
// TM-HISTORY SCRAPER — CONFIG (multi-competition)
//
// Builds complete historical Appearances + Goals per player per competition
// from Transfermarkt's competition-scoped club-season performance pages.
// Select the competition with the COMP env var (default GB1):
//   COMP=ES1 npm run scrape:pl-history && COMP=ES1 npm run build:pl-history
//
// Each competition writes its own cache + fact file, so they stay independent.
// Run LOCALLY (Transfermarkt blocks datacentre IPs).
// ─────────────────────────────────────────────────────────────────────────

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(__dirname, '..', '..')

// Transfermarkt competition ids/slugs + coverage start + how to enumerate the
// clubs each season ('league' table, or 'teilnehmer' participants page for cups).
export const COMPETITIONS = {
  GB1: { id: 'GB1', slug: 'premier-league',        name: 'Premier League',    first: 1992, enumerate: 'league' },
  ES1: { id: 'ES1', slug: 'laliga',                name: 'La Liga',           first: 1990, enumerate: 'league' },
  L1:  { id: 'L1',  slug: 'bundesliga',            name: 'Bundesliga',        first: 1990, enumerate: 'league' },
  IT1: { id: 'IT1', slug: 'serie-a',               name: 'Serie A',           first: 1990, enumerate: 'league' },
  FR1: { id: 'FR1', slug: 'ligue-1',               name: 'Ligue 1',           first: 1990, enumerate: 'league' },
  CL:  { id: 'CL',  slug: 'uefa-champions-league', name: 'Champions League',  first: 1992, enumerate: 'teilnehmer' },
}
export const COMPETITION = COMPETITIONS[process.env.COMP || 'GB1']
if (!COMPETITION) throw new Error(`Unknown COMP=${process.env.COMP}. Options: ${Object.keys(COMPETITIONS).join(', ')}`)

export const FIRST_SEASON = COMPETITION.first
export function currentSeason(now = new Date()) {
  const y = now.getFullYear()
  return now.getMonth() >= 7 ? y : y - 1 // TM season flips in August
}

// Local paths (git-ignored). Per-competition cache subfolder.
const RAW = path.join(ROOT, 'data', 'pl-history')
export const DIR = {
  root: RAW,
  cache: path.join(RAW, 'cache', COMPETITION.id),
}
export const OUT_FACTS = path.join(ROOT, 'src', 'data', 'football501', `history.${COMPETITION.id}.generated.json`)

// Polite fetch settings.
export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
export const DELAY_MS = 1500
export const RETRIES = 3
export const BASE = 'https://www.transfermarkt.com'
