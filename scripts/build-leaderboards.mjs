#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// BUILD LEADERBOARDS  →  src/data/canonical/stats.generated.json
//
// Standalone, build-time refresh of the all-time top-scorer leaderboards that
// power Higher or Lower (and Football 501). Fetches the authoritative Wikipedia
// list articles directly via the parse API and parses the ranked goals table —
// the same proven logic the server uses for its Tier-1 preload, but with NO
// server, NO server/cache.json, and NO runtime/StatMuse scraping.
//
// Safety guard: it loads the EXISTING stats file first and only replaces a
// leaderboard if the fresh parse looks sane (enough rows, and not a big shrink
// vs what we already have). So a Wikipedia layout change or a flaky fetch can
// never blank out or gut the data — worst case a board keeps its last-good
// values until the parser is fixed. Exits non-zero only on a real failure.
//
// Run:  node scripts/build-leaderboards.mjs   (needs network)
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import * as cheerio from 'cheerio'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'src', 'data', 'canonical', 'stats.generated.json')

const WIKI_UA = { 'User-Agent': 'Football501Game/1.0 (educational; tom.devine.tpd02@gmail.com)' }

// challengeId → page + table + display meta (must match what five01.js expects).
const LEADERBOARDS = {
  'intl-goals':       { page: "List_of_men's_footballers_with_50_or_more_international_goals", tableIndex: 1, competition: 'International',    statLabel: 'international goals' },
  'ucl-goals':        { page: 'List_of_UEFA_Champions_League_top_scorers',                     tableIndex: 0, competition: 'Champions League', statLabel: 'Champions League goals' },
  'prem-goals':       { page: 'List_of_footballers_with_100_or_more_Premier_League_goals',     tableIndex: 0, competition: 'Premier League',   statLabel: 'Premier League goals' },
  'laliga-goals':     { page: 'List_of_La_Liga_top_scorers',                                   tableIndex: 0, competition: 'La Liga',          statLabel: 'La Liga goals' },
  'bundesliga-goals': { page: 'List_of_Bundesliga_top_scorers',                                tableIndex: 0, competition: 'Bundesliga',       statLabel: 'Bundesliga goals' },
}

const MIN_ROWS = 10          // a sane board must have at least this many players
const SHRINK_FLOOR = 0.8     // reject a refresh that drops below 80% of existing size

async function fetchWikiHTML(pageTitle) {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.searchParams.set('action', 'parse')
  url.searchParams.set('page', pageTitle)
  url.searchParams.set('prop', 'text')
  url.searchParams.set('format', 'json')
  url.searchParams.set('formatversion', '2')
  url.searchParams.set('disabletoc', '1')
  const res = await fetch(url, { headers: WIKI_UA })
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error.info)
  return json.parse?.text ?? ''
}

// Strip Wikipedia disambiguation suffixes so display names are clean,
// e.g. "Raúl (footballer)" → "Raúl", "César Rodríguez (footballer, born 1920)"
// → "César Rodríguez". Only removes trailing parentheticals about the person.
function cleanName(name) {
  return name.replace(/\s*\([^)]*\b(?:footballer|football|born|soccer)\b[^)]*\)\s*$/i, '').trim()
}

// Parse a Wikipedia "rank / player / goals" table into { name: goals }.
function parseGoalsTable(html, tableIndex) {
  const $ = cheerio.load(html)
  const tables = $('table.wikitable')
  if (tableIndex >= tables.length) throw new Error(`Table ${tableIndex} out of range (found ${tables.length})`)
  const table = tables.eq(tableIndex)
  const result = {}
  const headerCells = table.find('tr').first().find('th, td')
  let playerCol = -1, goalCol = -1
  headerCells.each((i, cell) => {
    const text = $(cell).text().replace(/\[\d+\]/g, '').trim().toLowerCase()
    if (playerCol === -1 && /^player$|^name$/.test(text)) playerCol = i
    if (goalCol === -1 && /^goals?$/.test(text)) goalCol = i
  })
  if (playerCol === -1 || goalCol === -1) {
    const heads = []; headerCells.each((_, c) => heads.push($(c).text().trim()))
    throw new Error(`No Player/Goals columns. Headers: ${JSON.stringify(heads)}`)
  }
  table.find('tr').each((rowIdx, row) => {
    if (rowIdx === 0) return
    const cells = $(row).find('th, td')
    if (cells.length <= Math.max(playerCol, goalCol)) return
    const playerCell = cells.eq(playerCol)
    const playerLink = playerCell.find('a[title]').filter((_, a) => !$(a).closest('.flagicon,.flag-icon,.mw-flag').length).first()
    const raw = playerLink.attr('title')?.trim() ?? playerCell.text().replace(/\[\d+\]/g, '').trim()
    if (!raw || raw.length < 2 || /^\d/.test(raw)) return
    if (/national\s+(football|soccer)\s+team/i.test(raw)) return
    const name = cleanName(raw)
    const stat = parseInt(cells.eq(goalCol).text().replace(/[^\d]/g, ''), 10)
    if (!isNaN(stat) && stat > 0) result[name] = stat
  })
  return result
}

function loadExisting() {
  try { return JSON.parse(readFileSync(OUT, 'utf8')) } catch { return { meta: {}, challenges: {} } }
}

async function main() {
  const existing = loadExisting()
  const out = {
    meta: { source: 'wikipedia top-scorer lists', fetchedAt: new Date().toISOString().slice(0, 10) },
    challenges: {},
  }
  let refreshed = 0, kept = 0

  for (const [id, cfg] of Object.entries(LEADERBOARDS)) {
    const prev = existing.challenges?.[id]
    const prevCount = prev ? Object.keys(prev.players || {}).length : 0
    const meta = { competition: cfg.competition, statLabel: cfg.statLabel, source: `wikipedia:${cfg.page.replace(/_/g, ' ')}` }
    try {
      process.stderr.write(`  ↓ ${id} (${cfg.page})… `)
      const html = await fetchWikiHTML(cfg.page)
      const players = parseGoalsTable(html, cfg.tableIndex)
      const count = Object.keys(players).length
      if (count < MIN_ROWS) throw new Error(`only ${count} rows (< ${MIN_ROWS})`)
      if (prevCount && count < prevCount * SHRINK_FLOOR) throw new Error(`suspicious shrink ${prevCount} → ${count}`)
      out.challenges[id] = { ...meta, players }
      refreshed++
      process.stderr.write(`${count} players ✓\n`)
    } catch (err) {
      if (prev) {
        out.challenges[id] = prev // keep last-good data
        kept++
        process.stderr.write(`FAILED (${err.message}) — kept ${prevCount} existing\n`)
      } else {
        process.stderr.write(`FAILED (${err.message}) — no existing data!\n`)
      }
    }
    await new Promise(r => setTimeout(r, 600))
  }

  if (Object.keys(out.challenges).length < Object.keys(LEADERBOARDS).length) {
    console.error(`✗ Missing leaderboards (have ${Object.keys(out.challenges).length}/${Object.keys(LEADERBOARDS).length}) — not writing.`)
    process.exit(1)
  }

  writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n')
  console.error(`\nWrote ${OUT} — ${refreshed} refreshed, ${kept} kept from last-good.`)
}

main().catch(e => { console.error(e); process.exit(1) })
