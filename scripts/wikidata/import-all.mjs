#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// UNIFIED SOURCED-DATA IMPORTER
//
// Produces src/data/canonical/wikidata.generated.json from authoritative
// sources, with provenance + fame (sitelink count) on every player so the
// app can do a notable/broad split (rich validation, star-studded grids).
//
//   clubs        ← Wikidata P54 (statement nodes, all ranks)        [tier 2]
//   nationality  ← Wikidata P54 to NATIONAL TEAM (not P27)          [tier 2]
//   Ballon d'Or  ← Wikidata P166 award received                     [tier 1]
//   World Cup    ← Wikipedia "List of FIFA World Cup winning players" [tier 1]
//
// UCL & Euros have no clean consolidated machine source, so they remain
// curated (see membership.js) and are flagged as the known remaining gap.
//
// Run:  node scripts/wikidata/import-all.mjs   (needs network)
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import * as cheerio from 'cheerio'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', '..', 'src', 'data', 'canonical', 'wikidata.generated.json')

const UA = 'Football501Game/1.0 (educational; tom.devine.tpd02@gmail.com)'
const CLUB_FAME_MIN = 20   // broad validation set for clubs
const NAT_FAME_MIN = 22    // broad validation set for nationality

// Clubs grouped by the league we expose as a category. Listed by enwiki title;
// QIDs resolved automatically so this list is easy to extend.
const CLUBS_BY_LEAGUE = {
  'Premier League': ['Manchester United F.C.', 'Manchester City F.C.', 'Chelsea F.C.', 'Liverpool F.C.', 'Arsenal F.C.', 'Tottenham Hotspur F.C.', 'Everton F.C.', 'Newcastle United F.C.'],
  'La Liga': ['Real Madrid CF', 'FC Barcelona', 'Atlético Madrid', 'Valencia CF', 'Sevilla FC'],
  'Serie A': ['Juventus FC', 'AC Milan', 'Inter Milan', 'A.S. Roma', 'S.S.C. Napoli'],
  'Bundesliga': ['FC Bayern Munich', 'Borussia Dortmund', 'Bayer 04 Leverkusen'],
  'Ligue 1': ['Paris Saint-Germain F.C.', 'Olympique de Marseille', 'AS Monaco FC'],
}

// Nationality category → national-team enwiki title.
const NATION_TEAMS = {
  Argentina: 'Argentina national football team', Brazil: 'Brazil national football team',
  France: 'France national football team', Spain: 'Spain national football team',
  England: 'England national football team', Germany: 'Germany national football team',
  Netherlands: 'Netherlands national football team', Portugal: 'Portugal national football team',
  Italy: 'Italy national football team', Belgium: 'Belgium national football team',
  Croatia: 'Croatia national football team', Uruguay: 'Uruguay national football team',
}

const AWARDS = { "Ballon d'Or": 'Q166177' }

// Clubs whose enwiki title doesn't batch-resolve cleanly — pin their QIDs.
const QID_OVERRIDES = {
  'A.S. Roma': 'Q2739',
  'S.S.C. Napoli': 'Q2641',
  'Paris Saint-Germain F.C.': 'Q483020',
}

async function api(base, params) {
  const url = new URL(base)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${base} ${res.status}`)
  return res.json()
}
async function sparql(query) {
  const data = await api('https://query.wikidata.org/sparql', { query, format: 'json' })
  return data.results.bindings
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Resolve many enwiki titles → QIDs in one batch.
async function resolveQids(titles) {
  const data = await api('https://www.wikidata.org/w/api.php', {
    action: 'wbgetentities', sites: 'enwiki', titles: titles.join('|'),
    props: 'sitelinks', format: 'json', redirects: 'yes',
  })
  const out = {}
  for (const [qid, ent] of Object.entries(data.entities || {})) {
    if (qid.startsWith('Q')) {
      const title = ent.sitelinks?.enwiki?.title
      if (title) out[title] = qid
    }
  }
  return out
}

function broadenPosition(raw) {
  const lc = (raw || '').toLowerCase()
  if (/(goalkeeper|keeper)/.test(lc)) return 'goalkeeper'
  if (/(defender|back|sweeper|libero)/.test(lc)) return 'defender'
  if (/midfield/.test(lc)) return 'midfielder'
  if (/(forward|striker|wing|attack)/.test(lc)) return 'forward'
  return null
}

async function rosterByP54(qid, fameMin, withAttrs) {
  const attrs = withAttrs
    ? 'OPTIONAL { ?player wdt:P1532 ?nat. } OPTIONAL { ?player wdt:P413 ?pos. }'
    : ''
  const sel = withAttrs ? '?player ?playerLabel ?natLabel ?posLabel ?sl' : '?player ?playerLabel ?sl'
  const rows = await sparql(`SELECT ${sel} WHERE {
    ?player p:P54 ?st . ?st ps:P54 wd:${qid} .
    ?player wdt:P106 wd:Q937857 ; wikibase:sitelinks ?sl . FILTER(?sl >= ${fameMin})
    ${attrs}
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`)
  const byId = new Map()
  for (const r of rows) {
    const id = r.player.value
    if (!byId.has(id)) byId.set(id, { name: r.playerLabel.value, nats: new Set(), poss: new Set(), fame: +r.sl.value })
    const rec = byId.get(id)
    if (r.natLabel) rec.nats.add(r.natLabel.value)
    if (r.posLabel) { const p = broadenPosition(r.posLabel.value); if (p) rec.poss.add(p) }
  }
  return [...byId.values()]
    .map(r => ({ name: r.name, nationalities: [...r.nats], positions: [...r.poss], fame: r.fame }))
    .sort((a, b) => b.fame - a.fame)
}

async function awardWinners(qid) {
  const rows = await sparql(`SELECT ?playerLabel ?sl WHERE {
    ?p wdt:P166 wd:${qid} ; wdt:P106 wd:Q937857 . OPTIONAL { ?p wikibase:sitelinks ?sl. }
    ?p rdfs:label ?playerLabel . FILTER(LANG(?playerLabel)="en")
  }`)
  return rows.map(r => ({ name: r.playerLabel.value, fame: r.sl ? +r.sl.value : 0 }))
}

// Parse the authoritative Wikipedia list of every World Cup winning player.
async function worldCupWinners() {
  const data = await api('https://en.wikipedia.org/w/api.php', {
    action: 'parse', page: 'List of FIFA World Cup winning players',
    prop: 'text', format: 'json', formatversion: '2', redirects: '1',
  })
  const $ = cheerio.load(data.parse.text)
  const names = new Set()
  $('table.wikitable').each((_, table) => {
    $(table).find('tr').each((__, tr) => {
      const firstCell = $(tr).find('th, td').first()
      const link = firstCell.find('a[title]').filter((_, a) => !$(a).closest('.flagicon,.mw-flag').length).first()
      const name = link.attr('title')?.trim()
      if (name && name.length > 1 && !/^\d/.test(name) && !/national (football|soccer) team/i.test(name)) names.add(name)
    })
  })
  return [...names]
}

async function main() {
  const out = {
    meta: { sources: { clubs: 'wikidata:P54', nationality: 'wikidata:P54(national team)', 'Ballon d\'Or': 'wikidata:P166', 'FIFA World Cup': 'wikipedia:List_of_FIFA_World_Cup_winning_players' }, clubFameMin: CLUB_FAME_MIN, natFameMin: NAT_FAME_MIN, fetchedAt: new Date().toISOString().slice(0, 10) },
    clubLeague: {}, clubs: {}, nationalities: {}, trophies: {},
  }

  // Resolve all QIDs up front.
  const allTitles = [...Object.values(CLUBS_BY_LEAGUE).flat(), ...Object.values(NATION_TEAMS)]
  process.stderr.write(`Resolving ${allTitles.length} QIDs… `)
  const qids = { ...await resolveQids(allTitles), ...QID_OVERRIDES }
  process.stderr.write(`done\n`)

  // Clubs
  for (const [league, titles] of Object.entries(CLUBS_BY_LEAGUE)) {
    for (const title of titles) {
      const qid = qids[title]
      const display = title.replace(/\s+(F\.?C\.?|CF|FC|AFC|SSC|AS|AC)\b.*$/i, '').replace(/\.$/, '').trim()
      if (!qid) { process.stderr.write(`  ! no QID for ${title}\n`); continue }
      process.stderr.write(`  ↓ club ${display} (${qid})… `)
      out.clubs[display] = await rosterByP54(qid, CLUB_FAME_MIN, true)
      out.clubLeague[display] = league
      process.stderr.write(`${out.clubs[display].length}\n`)
      await sleep(800)
    }
  }
  // Nationality via national teams
  for (const [nat, title] of Object.entries(NATION_TEAMS)) {
    const qid = qids[title]
    if (!qid) { process.stderr.write(`  ! no QID for ${title}\n`); continue }
    process.stderr.write(`  ↓ nation ${nat} (${qid})… `)
    out.nationalities[nat] = (await rosterByP54(qid, NAT_FAME_MIN, false)).map(({ name, fame }) => ({ name, fame }))
    process.stderr.write(`${out.nationalities[nat].length}\n`)
    await sleep(800)
  }
  // Awards
  for (const [award, qid] of Object.entries(AWARDS)) {
    process.stderr.write(`  ↓ award ${award}… `)
    out.trophies[award] = await awardWinners(qid)
    process.stderr.write(`${out.trophies[award].length}\n`)
    await sleep(800)
  }
  // World Cup winners (Wikipedia)
  process.stderr.write(`  ↓ trophy FIFA World Cup (Wikipedia)… `)
  out.trophies['FIFA World Cup'] = (await worldCupWinners()).map(name => ({ name, fame: 0 }))
  process.stderr.write(`${out.trophies['FIFA World Cup'].length}\n`)

  writeFileSync(OUT, JSON.stringify(out, null, 1))
  const cm = Object.values(out.clubs).reduce((a, c) => a + c.length, 0)
  const nm = Object.values(out.nationalities).reduce((a, c) => a + c.length, 0)
  process.stderr.write(`\nWrote ${OUT}\n  ${Object.keys(out.clubs).length} clubs (${cm}), ${Object.keys(out.nationalities).length} nations (${nm}), ${Object.keys(out.trophies).length} trophies\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
