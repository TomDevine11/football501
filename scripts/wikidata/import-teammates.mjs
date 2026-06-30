#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// TEAMMATE IMPORTER  (for the "Guess the Player from teammates" mode)
//
// For each well-known target player, finds players they genuinely PLAYED WITH —
// i.e. shared a team (club or national side) during OVERLAPPING years. This is
// the one "played with" relationship the research said is derivable with
// confidence: Wikidata P54 carries start/end date qualifiers (P580/P582), so we
// require the date ranges to overlap rather than just sharing a club in
// different eras. Teammates are filtered to recognisable players (sitelinks).
//
// Output: src/data/teammates.generated.json
// Run:    node scripts/wikidata/import-teammates.mjs   (needs network)
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { resolveQidNames, isQid } from './fix-qid-names.mjs'
import { famousPlayers } from '../../src/data/famousPlayers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', '..', 'src', 'data', 'teammates.generated.json')

const UA = 'Football501Game/1.0 (educational; tom.devine.tpd02@gmail.com)'
const MATE_FAME_MIN = 40   // teammates must be recognisable
const MIN_MATES = 6        // targets need at least this many to be playable
const PER_TEAM_CAP = 5     // keep at most this many (most famous) mates per team

// Keep the most famous few teammates per club so the bundled file stays lean
// at scale, while preserving cross-team variety for the clue spreading.
function capMates(mates) {
  const byTeam = new Map()
  for (const m of [...mates].sort((a, b) => b.fame - a.fame)) {
    const arr = byTeam.get(m.team) || []
    if (arr.length < PER_TEAM_CAP) { arr.push(m); byTeam.set(m.team, arr) }
  }
  return [...byTeam.values()].flat()
}

// Well-known target players (enwiki titles). Filtered to those with enough
// overlapping teammates, so a few weak ones dropping out is fine.
// Seed list of well-known names, merged with the full famousPlayers pool so the
// generated set scales toward a few hundred playable targets. Only players with
// >= MIN_MATES recognisable teammates survive.
const HARDCODED = [
  'Lionel Messi', 'Cristiano Ronaldo', 'Neymar', 'Kylian Mbappé', 'Luis Suárez', 'Andrés Iniesta',
  'Xavi', 'Sergio Busquets', 'Gerard Piqué', 'Carles Puyol', 'Sergio Ramos', 'Iker Casillas',
  'Karim Benzema', 'Luka Modrić', 'Toni Kroos', 'Gareth Bale', 'Ronaldinho', 'Kaká',
  'Thierry Henry', 'Dennis Bergkamp', 'Patrick Vieira', 'Steven Gerrard', 'Frank Lampard', 'John Terry',
  'Didier Drogba', 'Petr Čech', 'Ashley Cole', 'Rio Ferdinand', 'Nemanja Vidić', 'Wayne Rooney',
  'Paul Scholes', 'Ryan Giggs', 'David Beckham', 'Mohamed Salah', 'Sadio Mané', 'Virgil van Dijk',
  'Kevin De Bruyne', 'Sergio Agüero', 'David Silva', 'Yaya Touré', 'Vincent Kompany', 'Robert Lewandowski',
  'Thomas Müller', 'Manuel Neuer', 'Philipp Lahm', 'Bastian Schweinsteiger', 'Arjen Robben', 'Franck Ribéry',
  'Zlatan Ibrahimović', 'Andrea Pirlo', 'Gianluigi Buffon', 'Francesco Totti', 'Samuel Eto\'o', 'David Villa',
  'Cesc Fàbregas', 'Eden Hazard', 'Edinson Cavani', 'Ángel Di María', 'Carlos Tevez', 'Wesley Sneijder',
]
const TARGETS = [...new Set([...HARDCODED, ...famousPlayers.map(p => p.name)])]

async function api(base, params) {
  const url = new URL(base)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${base} ${res.status}`)
  return res.json()
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function resolveQids(titles) {
  const out = {}
  for (let i = 0; i < titles.length; i += 45) {
    const batch = titles.slice(i, i + 45)
    const data = await api('https://www.wikidata.org/w/api.php', {
      action: 'wbgetentities', sites: 'enwiki', titles: batch.join('|'),
      props: 'sitelinks', format: 'json', redirects: 'yes',
    })
    for (const [qid, ent] of Object.entries(data.entities || {})) {
      const title = ent.sitelinks?.enwiki?.title
      if (qid.startsWith('Q') && title) out[title] = qid
    }
    await sleep(300)
  }
  return out
}

function cleanTeam(label) {
  const nt = label.match(/^(.*?)\s+(?:men's\s+)?national\s+(?:association\s+)?football\s+team/i)
  if (nt) return `${nt[1]} national team`
  return label.replace(/\s+(F\.?C\.?|CF|FC|AFC|SSC|S\.S\.C\.|A\.S\.|U\.C\.)\b.*$/i, '').replace(/\.$/, '').trim()
}

async function teammatesOf(qid) {
  const q = `SELECT ?mate ?mateLabel ?natLabel ?clubLabel ?sl WHERE {
    wd:${qid} p:P54 ?ts . ?ts ps:P54 ?club ; pq:P580 ?tStart . OPTIONAL { ?ts pq:P582 ?tEnd }
    ?mate p:P54 ?ms . ?ms ps:P54 ?club ; pq:P580 ?mStart . OPTIONAL { ?ms pq:P582 ?mEnd }
    ?mate wdt:P106 wd:Q937857 ; wikibase:sitelinks ?sl . FILTER(?sl >= ${MATE_FAME_MIN}) FILTER(?mate != wd:${qid})
    OPTIONAL { ?mate wdt:P1532 ?nat. }
    BIND(COALESCE(?tEnd, NOW()) AS ?tE) BIND(COALESCE(?mEnd, NOW()) AS ?mE)
    FILTER(?tStart <= ?mE && ?mStart <= ?tE)
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  } ORDER BY DESC(?sl)`
  const rows = (await api('https://query.wikidata.org/sparql', { query: q, format: 'json' })).results.bindings
  const byId = new Map()
  for (const r of rows) {
    const id = r.mate.value
    if (!byId.has(id)) byId.set(id, { name: r.mateLabel.value, nationality: r.natLabel?.value || null, team: cleanTeam(r.clubLabel.value), fame: +r.sl.value })
  }
  return [...byId.values()]
}

async function main() {
  // Incremental + resumable: keep already-processed players, skip targets already
  // attempted (hit or skip), and write after every one — so a long, flaky run can
  // just be re-run to continue.
  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null
  const out = prev || { meta: {}, players: [], tried: [] }
  out.meta = { source: 'wikidata:P54 overlapping spells', mateFameMin: MATE_FAME_MIN, fetchedAt: new Date().toISOString().slice(0, 10) }
  if (!out.tried) out.tried = []
  const done = new Set([...out.players.map(p => p.name), ...out.tried])
  const todo = TARGETS.filter(t => !done.has(t))

  const fixAndWrite = async () => {
    const fix = await resolveQidNames(out.players.flatMap(p => p.teammates.map(m => m.name)).filter(isQid))
    for (const p of out.players) for (const m of p.teammates) if (fix[m.name]) m.name = fix[m.name]
    writeFileSync(OUT, JSON.stringify(out, null, 1))
  }

  process.stderr.write(`${todo.length} new targets (${out.players.length} already playable). Resolving QIDs…\n`)
  const qids = await resolveQids(todo)

  for (const title of todo) {
    out.tried.push(title)
    const qid = qids[title]
    if (!qid) { process.stderr.write(`  ! no QID for ${title}\n`); writeFileSync(OUT, JSON.stringify(out, null, 1)); continue }
    let mates = []
    try { mates = await teammatesOf(qid) } catch (e) { process.stderr.write(`  ! query failed for ${title}: ${e.message}\n`) }
    if (mates.length >= MIN_MATES) {
      const capped = capMates(mates)
      out.players.push({ name: title.replace(/\s*\([^)]*\)$/, ''), teammates: capped })
      process.stderr.write(`  ✓ ${title}: ${mates.length} teammates (kept ${capped.length})\n`)
    } else {
      process.stderr.write(`  – ${title}: only ${mates.length} mates, skipped\n`)
    }
    writeFileSync(OUT, JSON.stringify(out, null, 1))
    await sleep(700)
  }

  await fixAndWrite()
  process.stderr.write(`\nWrote ${OUT}\n  ${out.players.length} playable targets\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
