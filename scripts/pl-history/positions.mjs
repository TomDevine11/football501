#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// PL-HISTORY — PLAYER POSITIONS (single source of truth for the badge + filter)
//
// Builds data/pl-history/positions.json = { playerId: 'GK'|'DEF'|'MID'|'FWD' }
// for every player in the scrape. Primary source is the squad scaffold (each
// player's modal position across seasons); recent players missing from the
// scaffold are backfilled from their Transfermarkt profile page. Resumable.
//
//   npm run build:pl-positions
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { DIR, DELAY_MS, BASE } from './config.mjs'
import { fetchHtml, bucketPosition, parseProfilePosition } from './lib.mjs'

const OUT = path.join(DIR.root, 'positions.json')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// Every player who actually appeared (apps > 0), from the scrape cache.
function playerUniverse() {
  const ids = new Map()
  for (const f of readdirSync(DIR.cache).filter(f => f.endsWith('.json'))) {
    for (const p of JSON.parse(readFileSync(path.join(DIR.cache, f), 'utf8')).players) {
      if (p.apps > 0) ids.set(p.id, p.name)
    }
  }
  return ids
}

// Modal GK/DEF/MID/FWD per player id from the scaffold rosters.
function scaffoldPositions() {
  const dir = path.join(DIR.root, 'DATA_JSON')
  if (!existsSync(dir)) return {}
  const counts = new Map()
  for (const sf of readdirSync(dir)) {
    for (const f of readdirSync(path.join(dir, sf))) {
      for (const p of (JSON.parse(readFileSync(path.join(dir, sf, f), 'utf8')).players || [])) {
        const b = bucketPosition(p.position); if (!b) continue
        const e = counts.get(p.id) || {}; e[b] = (e[b] || 0) + 1; counts.set(p.id, e)
      }
    }
  }
  const out = {}
  for (const [id, e] of counts) out[id] = Object.entries(e).sort((a, b) => b[1] - a[1])[0][0]
  return out
}

async function run() {
  const universe = playerUniverse()
  const scaffold = scaffoldPositions()
  const positions = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}

  // Seed from scaffold.
  let fromScaffold = 0
  for (const id of universe.keys()) {
    if (positions[id]) continue
    if (scaffold[id]) { positions[id] = scaffold[id]; fromScaffold++ }
  }

  const missing = [...universe.keys()].filter(id => !positions[id])
  console.error(`${universe.size} players · ${fromScaffold} from scaffold · ${missing.length} to backfill from profiles`)

  let done = 0
  for (const id of missing) {
    const pos = parseProfilePosition(fetchHtml(`${BASE}/-/profil/spieler/${id}`))
    if (pos) positions[id] = pos
    if (++done % 20 === 0) { writeFileSync(OUT, JSON.stringify(positions)); console.error(`  …${done}/${missing.length}`) }
    await sleep(DELAY_MS)
  }
  writeFileSync(OUT, JSON.stringify(positions))
  const covered = [...universe.keys()].filter(id => positions[id]).length
  console.error(`\n✓ positions.json — ${covered}/${universe.size} covered (${(100 * covered / universe.size).toFixed(1)}%)`)
}

run().catch(e => { console.error(`✗ ${e.message}`); process.exit(1) })
