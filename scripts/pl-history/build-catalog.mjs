#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// BUILD CATALOG — the space of valid procedurally-generated questions
//
// Enumerates {1-or-2 stats} × {1–3 filters from club/nationality/position}
// against the all-time PL fact table, keeps only the ones that are actually
// completable (checkout engine), and emits catalog.generated.json. The game
// draws the daily (deterministic) and multiplayer (random) questions from this.
//
//   npm run build:pl-catalog   (run after build:pl-history)
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveRoster, titleFor } from '../../src/data/football501/spec.js'
import { checkoutCombos, maxDisjoint, SOLO_MIN_COMBOS } from '../../src/data/football501/checkout.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const FACT = path.join(ROOT, 'src', 'data', 'football501', 'history.GB1.generated.json')
const OUT = path.join(ROOT, 'src', 'data', 'football501', 'catalog.generated.json')

// Tunable playability floors (see design discussion).
const MIN_ANSWERS = 8          // sanity floor on eligible answers
const MIN_NAT_PLAYERS = 15     // ignore nationalities too sparse to ever qualify

const STATS = ['goals', 'apps', { a: 'apps', op: '+', b: 'goals' }, { a: 'apps', op: '-', b: 'goals' }]
const POSITIONS = ['GK', 'DEF', 'MID', 'FWD']

const statSlug = (s) => (typeof s === 'string' ? s : `apps-${s.op === '-' ? 'minus' : 'plus'}-goals`)
const specId = (spec) => {
  const f = spec.filter
  const parts = [statSlug(spec.stat)]
  if (f.club) parts.push(`c${f.club}`)
  if (f.nationality) parts.push(`n-${f.nationality.replace(/\s+/g, '_')}`)
  if (f.position) parts.push(f.position)
  return parts.join('__')
}
// Stable pseudo-random order so the daily sequence is scattered, not clustered.
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }

function build() {
  const fact = JSON.parse(readFileSync(FACT, 'utf8'))
  const players = fact.players
  const clubs = fact.clubs

  const natDisplay = {}, natCount = {}
  for (const p of players) { if (!p.natKey) continue; natDisplay[p.natKey] ||= p.nat; natCount[p.natKey] = (natCount[p.natKey] || 0) + 1 }
  const clubIds = Object.keys(clubs)
  const nats = Object.keys(natCount).filter(k => natCount[k] >= MIN_NAT_PLAYERS)

  // 1–3 filter facets (one value per axis).
  const combos = []
  for (const c of clubIds) combos.push({ club: c })
  for (const n of nats) combos.push({ nationality: n })
  for (const pos of POSITIONS) combos.push({ position: pos })
  for (const c of clubIds) for (const n of nats) combos.push({ club: c, nationality: n })
  for (const c of clubIds) for (const pos of POSITIONS) combos.push({ club: c, position: pos })
  for (const n of nats) for (const pos of POSITIONS) combos.push({ nationality: n, position: pos })
  for (const c of clubIds) for (const n of nats) for (const pos of POSITIONS) combos.push({ club: c, nationality: n, position: pos })

  let considered = 0
  const catalog = []
  for (const stat of STATS) {
    for (const filter of combos) {
      considered++
      const spec = { stat, filter }
      const { players: roster, values } = resolveRoster(spec, players)
      const answers = Object.keys(roster).length
      if (answers < MIN_ANSWERS) continue
      if (checkoutCombos(values) < SOLO_MIN_COMBOS) continue // not comfortably solvable (solo)
      const maxPlayers = maxDisjoint(values)                 // multiplayer capacity
      if (maxPlayers < 1) continue
      catalog.push({
        id: specId(spec), stat, filter,
        title: titleFor(spec, { clubName: clubs[filter.club]?.name, natDisplay: natDisplay[filter.nationality] }),
        answers, maxPlayers,
      })
    }
  }

  catalog.sort((a, b) => hash(a.id) - hash(b.id)) // scattered-but-stable order
  writeFileSync(OUT, JSON.stringify({ meta: { competition: 'GB1', builtAt: new Date().toISOString().slice(0, 10), considered, valid: catalog.length }, catalog }))

  const byN = {}; for (const c of catalog) byN[c.maxPlayers] = (byN[c.maxPlayers] || 0) + 1
  console.error(`Catalog: ${catalog.length} valid questions from ${considered} considered`)
  console.error(`  by max players: ${Object.entries(byN).sort().map(([n, c]) => `${n}p:${c}`).join('  ')}`)
  console.error(`  e.g. ${catalog.slice(0, 5).map(c => '"' + c.title + '"').join(', ')}`)
}

build()
