#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// WORLD CUP WINNING SQUADS IMPORTER  (for "Name the Winning Squad")
//
// Parses Wikipedia's "List of FIFA World Cup winning players" — one row per
// winner with the year(s) they won — and groups players into each tournament's
// winning squad. Limited to recognisable tournaments (1966 onward).
//
// Output: src/data/wcsquads.generated.json
// Run:    node scripts/wikidata/import-wc-squads.mjs   (needs network)
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import * as cheerio from 'cheerio'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', '..', 'src', 'data', 'wcsquads.generated.json')
const UA = 'Football501Game/1.0 (educational; tom.devine.tpd02@gmail.com)'

// Tournaments to include → winning nation (recognisable squads only).
const YEAR_WINNER = {
  1966: 'England', 1970: 'Brazil', 1974: 'West Germany', 1978: 'Argentina',
  1982: 'Italy', 1986: 'Argentina', 1990: 'West Germany', 1994: 'Brazil',
  1998: 'France', 2002: 'Brazil', 2006: 'Italy', 2010: 'Spain',
  2014: 'Germany', 2018: 'France', 2022: 'Argentina',
}

const cleanName = t => t.replace(/\s*\([^)]*\)\s*$/, '').replace(/\[\w+\]/g, '').trim()

async function main() {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.searchParams.set('action', 'parse')
  url.searchParams.set('page', 'List of FIFA World Cup winning players')
  url.searchParams.set('prop', 'text'); url.searchParams.set('format', 'json')
  url.searchParams.set('formatversion', '2'); url.searchParams.set('redirects', '1')
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  const data = await res.json()
  const $ = cheerio.load(data.parse.text)

  // The "by tournament" table: Year | Team | Squad (full player links) | …
  const byTournament = $('table.wikitable').filter((_, t) =>
    /squad/i.test($(t).find('tr').first().text())).first()
  if (!byTournament.length) throw new Error('could not find the by-tournament squad table')

  const squads = {}
  byTournament.find('tr').each((_, tr) => {
    const cells = $(tr).find('td')
    if (cells.length < 3) return
    const year = $(cells[0]).text().trim()
    if (!YEAR_WINNER[year]) return
    const names = $(cells[2]).find('a[title]')
      .filter((_, a) => !$(a).closest('.flagicon,.mw-flag').length)
      .map((_, a) => cleanName($(a).attr('title')))
      .get()
      .filter(n => n && n.length > 1 && !/^\d/.test(n))
    squads[year] = [...new Set(names)]
  })

  const out = {
    meta: { source: 'wikipedia:List_of_FIFA_World_Cup_winning_players', fetchedAt: new Date().toISOString().slice(0, 10) },
    squads: Object.keys(YEAR_WINNER).sort((a, b) => b - a)
      .filter(y => squads[y]?.length)
      .map(y => ({ year: +y, nation: YEAR_WINNER[y], players: squads[y].sort() })),
  }
  writeFileSync(OUT, JSON.stringify(out, null, 1))
  for (const s of out.squads) process.stderr.write(`  ${s.nation} ${s.year}: ${s.players.length} players\n`)
  process.stderr.write(`\nWrote ${OUT}\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
