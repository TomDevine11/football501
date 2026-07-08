#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// BUILD CATALOG — the space of valid procedurally-generated questions,
// across ALL competitions.
//
// For each competition's fact table, enumerates {1-or-2 stats} × {1–3 filters
// from club/nationality/position}, keeps only completable questions (checkout
// engine), and writes a single combined catalog.generated.json. Every entry
// carries its `comp`, and its club/nationality options come only from that
// competition — so a question can never mix (no Man Utd in a La Liga question).
//
//   npm run build:pl-catalog   (after the fact tables are built)
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveRoster, titleFor } from '../../src/data/football501/spec.js'
import { checkoutCombos, maxDisjoint, SOLO_MIN_COMBOS } from '../../src/data/football501/checkout.js'
import { COMPETITIONS } from './config.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const FACT = (comp) => path.join(ROOT, 'src', 'data', 'football501', `history.${comp}.generated.json`)
const OUT = path.join(ROOT, 'src', 'data', 'football501', 'catalog.generated.json')

// ── Recognisability ("reco") ────────────────────────────────────────────────
// How many of a question's eligible players are names a moderate-to-avid fan
// would actually know — measured against the canonical fame data. Drives the
// DAILY pool so it stops serving obscure clubs/slices (e.g. Real Murcia) while
// leaving the full catalogue intact for Random/Unlimited.
const CANON = path.join(ROOT, 'src', 'data', 'canonical', 'wikidata.generated.json')
const FAME_BAR = 30 // fame floor for "recognisable" (canonical's own floor is ~20)
const normName = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const FAME = (() => {
  const m = new Map()
  try {
    const wd = JSON.parse(readFileSync(CANON, 'utf8'))
    for (const g of ['clubs', 'nationalities', 'trophies']) for (const arr of Object.values(wd[g])) for (const p of arr) { const k = normName(p.name); m.set(k, Math.max(m.get(k) || 0, p.fame || 0)) }
  } catch { /* no canonical facts → reco stays 0, daily falls back gracefully */ }
  return m
})()
const recoOf = (roster) => Object.values(roster).filter(p => (FAME.get(normName(p.name)) || 0) >= FAME_BAR).length

const MIN_ANSWERS = 8
const MIN_NAT_PLAYERS = 15   // ignore nationalities too sparse to ever qualify
const MIN_CLUB_PLAYERS = 15  // ignore tiny (qualifier) clubs — keeps CL sane

const STATS = ['goals', 'apps', { a: 'apps', op: '+', b: 'goals' }, { a: 'apps', op: '-', b: 'goals' }]
const POSITIONS = ['GK', 'DEF', 'MID', 'FWD']

const statSlug = (s) => (typeof s === 'string' ? s : `apps-${s.op === '-' ? 'minus' : 'plus'}-goals`)
const specId = (comp, spec) => {
  const f = spec.filter, parts = [comp, statSlug(spec.stat)]
  if (f.club) parts.push(`c${f.club}`)
  if (f.nationality) parts.push(`n-${f.nationality.replace(/\s+/g, '_')}`)
  if (f.position) parts.push(f.position)
  return parts.join('__')
}
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }

function buildCompetition(comp, catalog) {
  if (!existsSync(FACT(comp.id))) { console.error(`  ! ${comp.id}: no fact file — skipped`); return 0 }
  const fact = JSON.parse(readFileSync(FACT(comp.id), 'utf8'))
  const players = fact.players
  const clubs = fact.clubs

  // Player counts per club/nationality (to drop sparse ones).
  const natDisplay = {}, natCount = {}, clubCount = {}
  for (const p of players) {
    if (p.natKey) { natDisplay[p.natKey] ||= p.nat; natCount[p.natKey] = (natCount[p.natKey] || 0) + 1 }
    for (const cid of Object.keys(p.comps[comp.id]?.clubs || {})) clubCount[cid] = (clubCount[cid] || 0) + 1
  }
  const clubIds = Object.keys(clubs).filter(id => (clubCount[id] || 0) >= MIN_CLUB_PLAYERS)
  const nats = Object.keys(natCount).filter(k => natCount[k] >= MIN_NAT_PLAYERS)

  const combos = []
  for (const c of clubIds) combos.push({ club: c })
  for (const n of nats) combos.push({ nationality: n })
  for (const pos of POSITIONS) combos.push({ position: pos })
  for (const c of clubIds) for (const n of nats) combos.push({ club: c, nationality: n })
  for (const c of clubIds) for (const pos of POSITIONS) combos.push({ club: c, position: pos })
  for (const n of nats) for (const pos of POSITIONS) combos.push({ nationality: n, position: pos })
  for (const c of clubIds) for (const n of nats) for (const pos of POSITIONS) combos.push({ club: c, nationality: n, position: pos })

  let added = 0
  for (const stat of STATS) {
    for (const filter of combos) {
      const spec = { comp: comp.id, stat, filter }
      const { players: roster, values } = resolveRoster(spec, players)
      if (Object.keys(roster).length < MIN_ANSWERS) continue
      if (checkoutCombos(values) < SOLO_MIN_COMBOS) continue
      const maxPlayers = maxDisjoint(values)
      if (maxPlayers < 1) continue
      catalog.push({
        id: specId(comp.id, spec), comp: comp.id, stat, filter,
        title: titleFor(spec, { compName: comp.name, clubName: clubs[filter.club]?.name, natDisplay: natDisplay[filter.nationality] }),
        answers: Object.keys(roster).length, maxPlayers, reco: recoOf(roster),
      })
      added++
    }
  }
  console.error(`  ${comp.id.padEnd(4)} ${added} valid questions`)
  return added
}

function build() {
  const catalog = []
  for (const comp of Object.values(COMPETITIONS)) buildCompetition(comp, catalog)
  catalog.sort((a, b) => hash(a.id) - hash(b.id))
  writeFileSync(OUT, JSON.stringify({ meta: { builtAt: new Date().toISOString().slice(0, 10), valid: catalog.length }, catalog }))
  const byComp = {}; for (const c of catalog) byComp[c.comp] = (byComp[c.comp] || 0) + 1
  console.error(`\nCatalog: ${catalog.length} valid questions · ${Object.entries(byComp).map(([k, v]) => `${k}:${v}`).join('  ')}`)
  console.error(`  e.g. ${catalog.slice(0, 4).map(c => '"' + c.title + '"').join(', ')}`)
}

build()
