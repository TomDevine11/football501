#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// PL-HISTORY SCRAPER — RUNNER
//
// Walks every PL season × club and caches each club-season's per-player
// appearances + goals (competition-scoped). Resumable: cached historical
// seasons are skipped; the current season is always re-fetched (it changes).
//
//   npm run scrape:pl-history                 # full backfill 1992 → current
//   PL_SEASONS=2013,2014,2015 npm run scrape:pl-history   # subset
//
// Run LOCALLY and acknowledge transfermarkt.com as the data source.
// ─────────────────────────────────────────────────────────────────────────

import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { FIRST_SEASON, currentSeason, DIR, DELAY_MS, COMPETITION } from './config.mjs'
import { fetchHtml, parseCompetitionClubs, competitionUrl, clubSeasonUrl, parseClubSeason } from './lib.mjs'

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const cacheFile = (season, clubId) => path.join(DIR.cache, `${season}-${clubId}.json`)

function seasonList() {
  if (process.env.PL_SEASONS) return process.env.PL_SEASONS.split(',').map(s => parseInt(s.trim(), 10))
  const out = []
  for (let s = FIRST_SEASON; s <= currentSeason(); s++) out.push(s)
  return out
}

async function run() {
  mkdirSync(DIR.cache, { recursive: true })
  const cur = currentSeason()
  const seasons = seasonList()
  console.error(`Scraping ${COMPETITION.name} — ${seasons.length} seasons (${seasons[0]}–${seasons[seasons.length - 1]})`)
  console.error('Data source: transfermarkt.com\n')

  let fetched = 0, cached = 0, players = 0
  for (const season of seasons) {
    const clubs = parseCompetitionClubs(fetchHtml(competitionUrl(season)))
    await sleep(DELAY_MS)
    console.error(`[${season}] ${clubs.length} clubs`)
    for (const club of clubs) {
      const file = cacheFile(season, club.id)
      if (existsSync(file) && season < cur) { cached++; continue } // immutable → reuse
      const rows = parseClubSeason(fetchHtml(clubSeasonUrl(club, season)))
      writeFileSync(file, JSON.stringify({ season, clubId: club.id, slug: club.slug, players: rows }))
      fetched++; players += rows.filter(r => r.apps > 0).length
      await sleep(DELAY_MS)
    }
  }
  console.error(`\nDone. Fetched ${fetched} club-seasons (${cached} reused from cache), ${players} player-seasons with apps.`)
  console.error('Next: npm run build:pl-history')
}

run().catch(e => { console.error(`\n✗ ${e.message}`); process.exit(1) })
