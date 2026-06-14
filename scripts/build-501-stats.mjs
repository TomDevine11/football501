#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// BUILD 501 STAT TABLES  (authoritative, precomputed)
//
// Emits src/data/canonical/stats.generated.json from the all-time top-scorer
// leaderboards that were parsed from authoritative Wikipedia list articles
// (the same tables the legacy server preloaded into server/cache.json — Tier-1
// official records, exact goals per player). This replaces the per-guess
// StatMuse scraping with a precomputed table that ships with the app.
//
// Run:  node scripts/build-501-stats.mjs   (reads server/cache.json; offline)
// Refresh the underlying leaderboards by running the server once (it re-parses
// Wikipedia), then re-run this.
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE = path.join(__dirname, '..', 'server', 'cache.json')
const OUT = path.join(__dirname, '..', 'src', 'data', 'canonical', 'stats.generated.json')

// challengeId → { cacheKey, competition, statLabel, wikipedia }
const LEADERBOARDS = {
  'intl-goals':       { cacheKey: 'data:international-goals',     competition: 'International',    statLabel: 'international goals', wikipedia: "List of men's footballers with 50 or more international goals" },
  'ucl-goals':        { cacheKey: 'data:ucl-career-goals',       competition: 'Champions League', statLabel: 'Champions League goals', wikipedia: 'List of UEFA Champions League top scorers' },
  'prem-goals':       { cacheKey: 'data:prem-career-goals',      competition: 'Premier League',   statLabel: 'Premier League goals', wikipedia: 'List of footballers with 100 or more Premier League goals' },
  'laliga-goals':     { cacheKey: 'data:laliga-career-goals',    competition: 'La Liga',          statLabel: 'La Liga goals', wikipedia: 'List of La Liga top scorers' },
  'bundesliga-goals': { cacheKey: 'data:bundesliga-career-goals',competition: 'Bundesliga',       statLabel: 'Bundesliga goals', wikipedia: 'List of Bundesliga top scorers' },
}

const cache = JSON.parse(readFileSync(CACHE, 'utf8'))
const out = { meta: { source: 'wikipedia top-scorer lists', fetchedAt: new Date().toISOString().slice(0, 10) }, challenges: {} }

for (const [id, cfg] of Object.entries(LEADERBOARDS)) {
  const table = cache[cfg.cacheKey]
  if (!table) { console.error(`  ! missing ${cfg.cacheKey} — run the server once to preload it`); continue }
  const players = {}
  for (const [name, goals] of Object.entries(table)) {
    if (Number.isInteger(goals) && goals > 0) players[name] = goals
  }
  out.challenges[id] = { competition: cfg.competition, statLabel: cfg.statLabel, source: `wikipedia:${cfg.wikipedia}`, players }
  console.error(`  ✓ ${id}: ${Object.keys(players).length} players`)
}

writeFileSync(OUT, JSON.stringify(out, null, 1))
console.error(`\nWrote ${OUT}`)
