#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// FETCH PLAYER POSITIONS FROM WIKIDATA (P413)  — supplementary backfill
//
// The main import only captured positions for CLUB rosters, so players known to
// us only via a national team (Pelé, Eusébio, Garrincha…) had no position. This
// re-queries the SAME clubs + national teams for P413 and emits a name→position
// map that scripts/build-identity.mjs uses to backfill positions the games show.
//
// It does NOT touch wikidata.generated.json (no risk to rosters); it only adds a
// side file. Uses the same query shape as the import, so names match exactly.
//
// Run:  node scripts/wikidata/fetch-positions.mjs
// ─────────────────────────────────────────────────────────────────────────
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', '..', 'src', 'data', 'canonical', 'wikidata-positions.generated.json')

const UA = 'Football501Game/1.0 (educational; tom.devine.tpd02@gmail.com)'
const FAME_MIN = 20
const CLUBS = ['Manchester United F.C.', 'Manchester City F.C.', 'Chelsea F.C.', 'Liverpool F.C.', 'Arsenal F.C.', 'Tottenham Hotspur F.C.', 'Everton F.C.', 'Newcastle United F.C.', 'Real Madrid CF', 'FC Barcelona', 'Atlético Madrid', 'Valencia CF', 'Sevilla FC', 'Juventus FC', 'AC Milan', 'Inter Milan', 'A.S. Roma', 'S.S.C. Napoli', 'FC Bayern Munich', 'Borussia Dortmund', 'Bayer 04 Leverkusen', 'Paris Saint-Germain F.C.', 'Olympique de Marseille', 'AS Monaco FC']
const NATIONS = ['Argentina national football team', 'Brazil national football team', 'France national football team', 'Spain national football team', 'England national football team', 'Germany national football team', 'Netherlands national football team', 'Portugal national football team', 'Italy national football team', 'Belgium national football team', 'Croatia national football team', 'Uruguay national football team']
const QID_OVERRIDES = { 'A.S. Roma': 'Q2739', 'S.S.C. Napoli': 'Q2641', 'Paris Saint-Germain F.C.': 'Q483020' }

async function api(base, params) {
  const url = new URL(base)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${base} ${res.status}`)
  return res.json()
}
const sparql = async q => (await api('https://query.wikidata.org/sparql', { query: q, format: 'json' })).results.bindings
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function resolveQids(titles) {
  const data = await api('https://www.wikidata.org/w/api.php', { action: 'wbgetentities', sites: 'enwiki', titles: titles.join('|'), props: 'sitelinks', format: 'json', redirects: 'yes' })
  const out = {}
  for (const [qid, ent] of Object.entries(data.entities || {})) if (qid.startsWith('Q')) { const t = ent.sitelinks?.enwiki?.title; if (t) out[t] = qid }
  return out
}

// Wikidata position label → our 4-bucket vocabulary (matches the import).
function broaden(raw) {
  const lc = (raw || '').toLowerCase()
  if (/(goalkeeper|keeper)/.test(lc)) return 'goalkeeper'
  if (/(defender|back|sweeper|libero)/.test(lc)) return 'defender'
  if (/midfield/.test(lc)) return 'midfielder'
  if (/(forward|striker|wing|attack)/.test(lc)) return 'forward'
  return null
}
// A player may carry several positions; pick the primary for a single badge.
const PRIORITY = ['forward', 'midfielder', 'defender', 'goalkeeper']
const pick = set => PRIORITY.find(p => set.has(p)) || null

async function positionsFor(qid) {
  const rows = await sparql(`SELECT ?playerLabel ?posLabel WHERE {
    ?player p:P54 ?st . ?st ps:P54 wd:${qid} .
    ?player wdt:P106 wd:Q937857 ; wikibase:sitelinks ?sl . FILTER(?sl >= ${FAME_MIN})
    ?player wdt:P413 ?pos .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`)
  const byPlayer = new Map()
  for (const r of rows) {
    const name = r.playerLabel?.value; const b = broaden(r.posLabel?.value)
    if (!name || !b) continue
    if (!byPlayer.has(name)) byPlayer.set(name, new Set())
    byPlayer.get(name).add(b)
  }
  return byPlayer
}

async function main() {
  const titles = [...CLUBS, ...NATIONS]
  process.stderr.write('resolving QIDs… ')
  const qids = { ...await resolveQids(titles), ...QID_OVERRIDES }
  process.stderr.write('done\n')

  const out = {} // name -> position
  for (const title of titles) {
    const qid = qids[title]
    if (!qid) { process.stderr.write(`  ! no QID for ${title}\n`); continue }
    process.stderr.write(`  ↓ ${title} (${qid})… `)
    let n = 0
    try {
      const byPlayer = await positionsFor(qid)
      for (const [name, set] of byPlayer) { const p = pick(set); if (p && !out[name]) { out[name] = p; n++ } }
    } catch (e) { process.stderr.write(`FAILED ${e.message} `) }
    process.stderr.write(`+${n}\n`)
    await sleep(800)
  }

  const sorted = Object.fromEntries(Object.entries(out).sort((a, b) => a[0].localeCompare(b[0])))
  writeFileSync(OUT, JSON.stringify({ meta: { fetchedAt: new Date().toISOString().slice(0, 10), count: Object.keys(sorted).length }, positions: sorted }, null, 0) + '\n')
  process.stderr.write(`\nWrote ${Object.keys(sorted).length} positions → ${OUT}\n`)
}
main().catch(e => { console.error(e); process.exit(1) })
