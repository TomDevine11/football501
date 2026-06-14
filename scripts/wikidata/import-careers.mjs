#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// CAREER-PATH IMPORTER  (for the "Career Path" guessing mode)
//
// For each well-travelled target player, builds their senior CLUB career in
// chronological order from Wikidata P54 (member of sports team) with start-date
// qualifiers (P580). National teams and youth national sides are excluded by
// requiring each team to be an association football club (P31/P279* Q476028).
// Only players with at least MIN_CLUBS distinct clubs are kept, so the game
// always has at least five teams to reveal.
//
// Output: src/data/careers.generated.json
// Run:    node scripts/wikidata/import-careers.mjs   (needs network)
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', '..', 'src', 'data', 'careers.generated.json')

const UA = 'Football501Game/1.0 (educational; tom.devine.tpd02@gmail.com)'
const MIN_CLUBS = 5

// Well-known players known for well-travelled careers (enwiki titles). Filtered
// to those with >= MIN_CLUBS dated senior clubs, so weak entries drop out.
const TARGETS = [
  'Zlatan Ibrahimović', 'Nicolas Anelka', 'Christian Vieri', 'Hernán Crespo', 'Robinho', 'Carlos Tevez',
  'Romelu Lukaku', 'Edinson Cavani', 'Radamel Falcao', 'Mario Balotelli', 'Robin van Persie', 'Wesley Sneijder',
  'Gonzalo Higuaín', 'James Rodríguez', 'Hatem Ben Arfa', 'Joe Cole', 'Ashley Young', 'Danny Welbeck',
  'Daniel Sturridge', 'Jermain Defoe', 'Peter Crouch', 'Emmanuel Adebayor', 'Didier Drogba', 'Andriy Shevchenko',
  'David Trezeguet', 'Diego Forlán', "Samuel Eto'o", 'Fernando Torres', 'Alexis Sánchez', 'Arturo Vidal',
  'Juan Cuadrado', 'Craig Bellamy', 'Gabriel Batistuta', 'Patrice Evra', 'Bacary Sagna', 'Yaya Touré',
  'Kolo Touré', 'William Gallas', 'Shaun Wright-Phillips', 'Ashley Cole', 'Wayne Rooney', 'Gervinho',
  'Klaas-Jan Huntelaar', 'Florent Malouda', 'Loïc Rémy', 'Bafétimbi Gomis', 'Mateja Kežman', 'Salomón Rondón',
  'Islam Slimani', 'Mario Gómez', 'Stephan El Shaarawy', 'Carlos Bacca', 'Seydou Keita', 'Lassana Diarra',
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function api(base, params, tries = 3) {
  const url = new URL(base)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
    if (res.ok) return res.json()
    if (attempt >= tries) throw new Error(`${base} ${res.status}`)
    await sleep(1500 * attempt) // back off and retry transient 429/504s
  }
}

// National sides (senior, youth, B, Olympic) to drop from a club career.
const NATIONAL_TEAM = /national\s+(under-?\d+\s+|amateur\s+|youth\s+)?(association\s+)?football\s+(B\s+)?team|olympic football team/i

async function resolveQids(titles) {
  const out = {}
  for (let i = 0; i < titles.length; i += 45) {
    const data = await api('https://www.wikidata.org/w/api.php', {
      action: 'wbgetentities', sites: 'enwiki', titles: titles.slice(i, i + 45).join('|'),
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

const cleanClub = label => label
  .replace(/\s+(F\.?C\.?|A\.?F\.?C\.?|CF|FC|SC|AC|S\.S\.C\.|A\.S\.|U\.C\.|B\.?C\.?)\b.*$/i, '')
  .replace(/\s+(Football Club|Club de Fútbol|Fútbol Club|Calcio\b.*|Fussball-Club.*|Sport)$/i, '')
  .replace(/\.$/, '').trim()

async function careerOf(qid) {
  // Fast query (no slow subclass traversal): all dated P54 spells, national
  // sides removed afterwards by label so the property path doesn't time out.
  const q = `SELECT ?club ?clubLabel ?start ?end WHERE {
    wd:${qid} p:P54 ?st . ?st ps:P54 ?club ; pq:P580 ?start . OPTIONAL { ?st pq:P582 ?end }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  } ORDER BY ?start`
  const rows = (await api('https://query.wikidata.org/sparql', { query: q, format: 'json' })).results.bindings
  const seen = new Set()
  const clubs = []
  for (const r of rows) {
    const label = r.clubLabel.value
    if (NATIONAL_TEAM.test(label)) continue
    if (seen.has(r.club.value)) continue
    seen.add(r.club.value)
    clubs.push({
      name: cleanClub(label),
      from: r.start.value.slice(0, 4),
      to: r.end ? r.end.value.slice(0, 4) : '',
    })
  }
  return clubs
}

async function main() {
  process.stderr.write(`Resolving ${TARGETS.length} target QIDs…\n`)
  const qids = await resolveQids(TARGETS)
  const out = { meta: { source: 'wikidata:P54 club spells', minClubs: MIN_CLUBS, fetchedAt: new Date().toISOString().slice(0, 10) }, players: [] }

  for (const title of TARGETS) {
    const qid = qids[title]
    if (!qid) { process.stderr.write(`  ! no QID for ${title}\n`); continue }
    let clubs = []
    try { clubs = await careerOf(qid) } catch (e) { process.stderr.write(`  ! query failed for ${title}: ${e.message}\n`) }
    if (clubs.length < MIN_CLUBS) { process.stderr.write(`  – ${title}: only ${clubs.length} clubs, skipped\n`); await sleep(600); continue }
    out.players.push({ name: title.replace(/\s*\([^)]*\)$/, ''), clubs })
    process.stderr.write(`  ✓ ${title}: ${clubs.length} clubs\n`)
    await sleep(600)
  }

  writeFileSync(OUT, JSON.stringify(out, null, 1))
  process.stderr.write(`\nWrote ${OUT}\n  ${out.players.length} playable targets\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
