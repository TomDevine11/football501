#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// BUILD CATEGORY ICONS  →  src/data/categoryIcons.generated.json
//
// TicTacToe / Connections categories are a small, bounded set: ~24 clubs and 5
// leagues. This resolves their badges/logos from TheSportsDB once (static data,
// not in the monthly refresh). Nationalities (flags) and trophies (emoji) are
// handled statically in src/data/categoryIcons.js — no network needed.
//
// Incremental + rate-limit aware like build-crests. Re-run to fill any gaps.
//   node scripts/build-category-icons.mjs
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'src', 'data', 'categoryIcons.generated.json')
const TEAM_API = 'https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t='
const LEAGUE_API = 'https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id='

const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
const TYPE = new Set(['fc', 'afc', 'cf', 'ac', 'sc', 'ssc', 'as', 'bsc', 'cd', 'sd', 'ud', 'club'])
const simplify = name => norm(name).split(' ').filter(w => !TYPE.has(w)).join(' ').trim()
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Category club names (as our data labels them) → cleaner search term where needed.
const CLUBS = [
  'Manchester United', 'Manchester City', 'Chelsea', 'Liverpool', 'Arsenal', 'Tottenham Hotspur',
  'Everton', 'Newcastle United', 'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Valencia',
  'Sevilla', 'Juventus', 'AC Milan', 'Inter Milan', 'A.S. Roma', 'S.S.C. Napoli', 'FC Bayern Munich',
  'Borussia Dortmund', 'Bayer 04 Leverkusen', 'Paris Saint-Germain', 'Olympique de Marseille', 'AS Monaco',
  // Extra clubs referenced by Tenable questions (not TicTacToe categories).
  'Benfica', 'Nottingham Forest', 'Sheffield Wednesday',
]
const CLUB_SEARCH = {
  'A.S. Roma': 'AS Roma', 'S.S.C. Napoli': 'Napoli', 'FC Bayern Munich': 'Bayern Munich',
  'Bayer 04 Leverkusen': 'Bayer Leverkusen', 'Olympique de Marseille': 'Marseille',
  'Atlético Madrid': 'Atletico Madrid', 'Tottenham Hotspur': 'Tottenham', 'Paris Saint-Germain': 'Paris Saint Germain',
  'FC Barcelona': 'Barcelona', 'AS Monaco': 'Monaco',
}
// Stable TheSportsDB league IDs.
const LEAGUES = {
  'Premier League': '4328', 'La Liga': '4335', 'Serie A': '4332', 'Bundesliga': '4331', 'Ligue 1': '4334',
}

class RateLimited extends Error {}
async function getJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Football501Game/1.0 (educational)' } })
  const text = await res.text()
  if (!res.ok || /error code/i.test(text)) throw new RateLimited()
  try { return JSON.parse(text) } catch { throw new RateLimited() }
}
const badgeOf = t => t.strBadge || t.strTeamBadge

function pick(teams, target) {
  const nt = norm(target), ns = simplify(target)
  const eq = s => norm(s) === nt || (ns && simplify(s) === ns)
  let m = teams.find(t => eq(t.strTeam)); if (m) return m
  m = teams.find(t => (t.strTeamAlternate || '').split(',').some(a => eq(a))); if (m) return m
  m = teams.find(t => { const n = norm(t.strTeam); return n.startsWith(nt) || nt.startsWith(n) }); if (m) return m
  return null
}

async function withRetry(fn) {
  let backoff = 30000
  for (let i = 0; i < 5; i++) {
    try { return await fn() }
    catch (e) { if (!(e instanceof RateLimited)) return null; process.stderr.write(`    …rate-limited, waiting ${backoff / 1000}s\n`); await sleep(backoff); backoff = Math.min(backoff * 2, 240000) }
  }
  return null
}

async function main() {
  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { clubs: {}, leagues: {} }
  const clubs = prev.clubs || {}, leagues = prev.leagues || {}
  const write = () => writeFileSync(OUT, JSON.stringify({ meta: { source: 'thesportsdb', fetchedAt: new Date().toISOString().slice(0, 10) }, clubs, leagues }, null, 1) + '\n')

  for (const name of CLUBS) {
    if (clubs[name]) continue
    const term = CLUB_SEARCH[name] || name
    const url = await withRetry(async () => {
      const data = await getJSON(TEAM_API + encodeURIComponent(term))
      const teams = (data.teams || []).filter(t => t.strSport === 'Soccer' && badgeOf(t))
      const m = pick(teams, name) || pick(teams, term)
      return m ? badgeOf(m) : null
    })
    if (url) { clubs[name] = url; process.stderr.write(`  ✓ club ${name}\n`) }
    else process.stderr.write(`  · club ${name} (monogram)\n`)
    write(); await sleep(2500)
  }

  for (const [name, id] of Object.entries(LEAGUES)) {
    if (leagues[name]) continue
    const url = await withRetry(async () => {
      const data = await getJSON(LEAGUE_API + id)
      const l = (data.leagues || [])[0]
      return l ? (l.strBadge || l.strLogo || null) : null
    })
    if (url) { leagues[name] = url; process.stderr.write(`  ✓ league ${name}\n`) }
    else process.stderr.write(`  · league ${name} (monogram)\n`)
    write(); await sleep(2500)
  }

  process.stderr.write(`\nDONE — ${Object.keys(clubs).length}/${CLUBS.length} clubs, ${Object.keys(leagues).length}/${Object.keys(LEAGUES).length} leagues.\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
