#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// BUILD CREST MAP  →  src/data/crests.generated.json
//
// Resolves every distinct Career Path club to a team badge from TheSportsDB,
// keyed by the EXACT club name our data uses, so <Crest> can do a direct lookup.
// Clubs that don't resolve are omitted — the component shows a monogram, so the
// long tail degrades gracefully (a wrong badge would be worse than none).
//
// Crests are STATIC, so this is a one-off (not part of the monthly refresh).
// TheSportsDB's free key is Cloudflare rate-limited, so this is deliberately
// slow + INCREMENTAL: it writes after every hit and skips already-resolved
// clubs on re-run, backing off when rate-limited. Just re-run until complete.
//
//   node scripts/build-crests.mjs
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CAREERS = path.join(__dirname, '..', 'src', 'data', 'careers.generated.json')
const OUT = path.join(__dirname, '..', 'src', 'data', 'crests.generated.json')
const API = 'https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t='

const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
const TYPE = new Set(['fc', 'afc', 'cf', 'ac', 'sc', 'ssc', 'as', 'bsc', 'cd', 'sd', 'ud', 'club', 'futbol', 'football', 'calcio', 'fk', 'sk'])
const simplify = name => norm(name).split(' ').filter(w => !TYPE.has(w)).join(' ').trim()
const sleep = ms => new Promise(r => setTimeout(r, ms))

// our-label → better search term for clubs whose stored name doesn't resolve
const SEARCH_OVERRIDES = {
  'Fc Barcelona': 'Barcelona', 'AFC Ajax': 'Ajax',
  'Internazionale': 'Inter Milan', 'FC Internazionale Milano': 'Inter Milan',
  'ACF Fiorentina': 'Fiorentina', 'AS Saint-Étienne': 'Saint-Etienne',
  'Al Hilal SFC': 'Al Hilal', 'Beşiktaş J.K. (Football)': 'Besiktas',
  'Club Atlético River Plate': 'River Plate', 'Club Brugge K.V': 'Club Brugge',
  'Club Social y Deportivo Colo Colo': 'Colo-Colo', 'Fenerbahçe Istanbul': 'Fenerbahce',
  'Paris Saint-Germain': 'Paris SG', 'R.S.C. Anderlecht': 'Anderlecht',
  'RCD Espanyol de Barcelona': 'Espanyol', 'RCD Mallorca': 'Mallorca',
  'PFC CSKA Moscow': 'CSKA Moscow', 'Red Bull New York': 'New York Red Bulls',
  'En Avant de Guingamp': 'Guingamp', 'Stade Malherbe Caen': 'Caen',
  'Junior de Barranquilla': 'Atletico Junior', 'Deportivo Independiente Medellín': 'Independiente Medellin',
  'Aris Thessaloniki': 'Aris', 'VfB Stuttgart II': 'VfB Stuttgart',
  'AJ Auxerre II': 'Auxerre', 'Çaykur Rizespor': 'Rizespor',
  'Club Atlético Banfield': 'Banfield', 'K.V.C. Westerlo': 'Westerlo',
  'LB Châteauroux': 'Chateauroux', 'ES Troyes': 'Troyes',
}

class RateLimited extends Error {}

async function search(term) {
  const res = await fetch(API + encodeURIComponent(term), { headers: { 'User-Agent': 'Football501Game/1.0 (educational)' } })
  const text = await res.text()
  if (!res.ok || /error code/i.test(text)) throw new RateLimited()
  let json
  try { json = JSON.parse(text) } catch { throw new RateLimited() }
  return (json.teams || []).filter(t => t.strSport === 'Soccer' && (t.strBadge || t.strTeamBadge))
}
const badgeOf = t => t.strBadge || t.strTeamBadge

function pick(teams, target) {
  const nt = norm(target), ns = simplify(target)
  const eq = s => norm(s) === nt || (ns && simplify(s) === ns)
  let m = teams.find(t => eq(t.strTeam)); if (m) return m
  m = teams.find(t => (t.strTeamAlternate || '').split(',').some(a => eq(a))); if (m) return m
  m = teams.find(t => { const n = norm(t.strTeam); return n.startsWith(nt) || nt.startsWith(n) }); if (m) return m
  m = teams.find(t => { const s = simplify(t.strTeam); return ns && (s.startsWith(ns) || ns.startsWith(s)) }); if (m) return m
  return null
}

// Resolve one club, backing off + retrying when rate-limited.
async function resolve(name) {
  const term = SEARCH_OVERRIDES[name] || name
  const attempts = [term]
  const simp = simplify(name)
  if (simp && simp !== norm(term)) attempts.push(simp)
  let backoff = 30000
  for (let tries = 0; tries < 5; tries++) {
    try {
      for (const q of attempts) {
        const teams = await search(q)
        const m = pick(teams, name) || pick(teams, term)
        if (m) return badgeOf(m)
        await sleep(1200)
      }
      return null // searched OK, genuinely no match
    } catch (e) {
      if (!(e instanceof RateLimited)) return null
      process.stderr.write(`    …rate-limited, waiting ${backoff / 1000}s\n`)
      await sleep(backoff); backoff = Math.min(backoff * 2, 240000)
    }
  }
  throw new RateLimited() // give up this run; re-run to resume
}

async function main() {
  const careers = JSON.parse(readFileSync(CAREERS, 'utf8'))
  const names = [...new Set(careers.players.flatMap(p => p.clubs.map(c => c.name)))].sort()
  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { crests: {}, tried: [] }
  const crests = prev.crests || {}
  const tried = new Set(prev.tried || []) // names we've already attempted (hit or confirmed-miss)

  const write = () => writeFileSync(OUT, JSON.stringify({
    meta: { source: 'thesportsdb', fetchedAt: new Date().toISOString().slice(0, 10), resolved: Object.keys(crests).length, total: names.length },
    crests, tried: [...tried],
  }, null, 1) + '\n')

  const todo = names.filter(n => !tried.has(n))
  process.stderr.write(`${todo.length} clubs to resolve (${Object.keys(crests).length} already done)\n`)
  try {
    for (const name of todo) {
      const url = await resolve(name)
      tried.add(name)
      if (url) { crests[name] = url; process.stderr.write(`  ✓ ${name}\n`) }
      else process.stderr.write(`  · ${name} (monogram)\n`)
      write()
      await sleep(2500)
    }
    process.stderr.write(`\nDONE — ${Object.keys(crests).length}/${names.length} resolved.\n`)
  } catch {
    write()
    process.stderr.write(`\nStopped (rate-limited). Progress saved — re-run to resume. ${Object.keys(crests).length}/${names.length} so far.\n`)
    process.exit(2)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
