// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 — RUNTIME QUESTION GENERATOR (multi-competition)
//
// Ships only the small combined catalog up front; each competition's ~2 MB
// fact table is lazy-loaded on demand (Vite code-splits them), so the page
// stays light. Everything — competition included — comes from the catalog, so a
// question's club/nationality filters always belong to its own competition.
//   - getDailyChallenge()          deterministic question of the day (any comp)
//   - getRandomChallenge(minP)      random question valid for ≥ minP players
//   - loadCompetition(comp)         fact + club/nation option lists (builder)
//   - evaluateSpec(spec, fact)      live completability for the builder
//   - makeCustomChallenge(spec)     resolve a built question
//   (async where a fact table may need loading)
// ─────────────────────────────────────────────────────────────────────────

import cat from './catalog.generated.json'
import { resolveRoster, statLabel, titleFor } from './spec.js'
import { checkoutCombos, maxDisjoint, SOLO_MIN_COMBOS } from './checkout.js'
import { normalize, surnameKeys } from '../canonical/normalize.js'

const CATALOG = cat.catalog

export const COMPETITIONS = [
  { id: 'GB1', name: 'Premier League' },
  { id: 'ES1', name: 'La Liga' },
  { id: 'IT1', name: 'Serie A' },
  { id: 'L1', name: 'Bundesliga' },
  { id: 'FR1', name: 'Ligue 1' },
  { id: 'CL', name: 'Champions League' },
]
const COMP_NAME = Object.fromEntries(COMPETITIONS.map(c => [c.id, c.name]))

export const POSITIONS = [{ code: 'GK', label: 'Goalkeepers' }, { code: 'DEF', label: 'Defenders' }, { code: 'MID', label: 'Midfielders' }, { code: 'FWD', label: 'Forwards' }]
export const STAT_OPTIONS = [
  { id: 'goals', stat: 'goals', label: 'Goals' },
  { id: 'apps', stat: 'apps', label: 'Appearances' },
  { id: 'apps+goals', stat: { a: 'apps', op: '+', b: 'goals' }, label: 'Appearances + Goals' },
  { id: 'apps-goals', stat: { a: 'apps', op: '-', b: 'goals' }, label: 'Appearances − Goals' },
]

// ── Lazy fact tables (one code-split chunk per competition) ────────────────
const factLoaders = import.meta.glob('./history.*.generated.json')
const factCache = {}
async function loadFact(comp) {
  if (factCache[comp]) return factCache[comp]
  const loader = factLoaders[`./history.${comp}.generated.json`]
  if (!loader) throw new Error(`no fact table for ${comp}`)
  const mod = await loader()
  return (factCache[comp] = decorate(mod.default))
}
// Attach derived lookups (option lists, nat display) once per fact table.
function decorate(fact) {
  if (fact.__d) return fact
  const natDisplay = {}, natCount = {}
  for (const p of fact.players) { if (p.natKey) { natDisplay[p.natKey] ||= p.nat; natCount[p.natKey] = (natCount[p.natKey] || 0) + 1 } }
  fact.__d = {
    natDisplay,
    clubs: Object.entries(fact.clubs).map(([id, c]) => ({ id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name)),
    nations: Object.keys(natCount).filter(k => natCount[k] >= 15).map(k => ({ key: k, display: natDisplay[k] })).sort((a, b) => a.display.localeCompare(b.display)),
  }
  return fact
}

// ── Name → id resolution ───────────────────────────────────────────────────
function buildIndex(items) {
  const full = new Map(), sur = new Map()
  const add = (m, k, id) => { if (!k) return; if (!m.has(k)) m.set(k, new Set()); m.get(k).add(id) }
  for (const it of items) { add(full, normalize(it.name), it.id); for (const k of surnameKeys(it.name)) add(sur, k, it.id) }
  return { full, sur }
}
const resolveIds = (index, raw) => { const q = normalize(raw); if (!q) return new Set(); return index.full.get(q) || index.sur.get(q) || new Set() }

const titleOf = (spec, fact) => spec.title || titleFor(spec, { compName: COMP_NAME[spec.comp], clubName: fact.clubs[spec.filter?.club]?.name, natDisplay: fact.__d.natDisplay[spec.filter?.nationality] })

// A playable challenge (async — resolves against its competition's fact table).
async function makeChallenge(spec) {
  const fact = await loadFact(spec.comp)
  const { players: roster, values } = resolveRoster(spec, fact.players)
  const rosterIndex = buildIndex(Object.entries(roster).map(([id, r]) => ({ id, name: r.name })))
  const factIndex = buildIndex(fact.players)             // for the position badge (all comp players)
  const posById = new Map(fact.players.map(p => [p.id, p.pos]))
  return {
    id: spec.id, comp: spec.comp, title: titleOf(spec, fact), statLabel: statLabel(spec.stat),
    answers: spec.answers ?? Object.keys(roster).length,
    maxPlayers: spec.maxPlayers ?? maxDisjoint(values),
    validate(rawName) {
      const hit = resolveIds(rosterIndex, rawName)
      if (!hit.size) return { status: 'not-eligible' }
      if (hit.size > 1) return { status: 'ambiguous', options: [...hit].map(id => roster[id].name).sort() }
      const r = roster[[...hit][0]]
      return { status: 'valid', name: r.name, value: r.value, breakdown: r.breakdown }
    },
    answersList() { return Object.values(roster).map(r => ({ name: r.name, value: r.value })).sort((a, b) => b.value - a.value) },
    insights(currentScore, used) {
      let highest = 0, checkouts = 0, perfect = 0
      for (const id in roster) {
        const r = roster[id]; if (used.has(r.name)) continue
        const v = r.value; if (v > 180) continue
        if (v > highest) highest = v
        if (v >= currentScore && v <= currentScore + 10) checkouts++
        if (v === currentScore) perfect++
      }
      return { highest, checkouts, perfect }
    },
    badgeFor(name) { const hit = resolveIds(factIndex, name); return hit.size === 1 ? (posById.get([...hit][0]) || null) : null },
  }
}
export const makeCustomChallenge = (spec) => makeChallenge(spec)

// ── Daily / random selection from the catalog ──────────────────────────────
const DAILY_MIN_ANSWERS = 100
const DAILY_POOL = CATALOG.filter(c => c.answers >= DAILY_MIN_ANSWERS)

export function getDailyEntry() {
  const now = new Date()
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  const pool = DAILY_POOL.length ? DAILY_POOL : CATALOG
  return pool[((day % pool.length) + pool.length) % pool.length]
}
export const getDailyChallenge = () => makeChallenge(getDailyEntry())

export function getRandomChallenge(minPlayers = 1) {
  const pool = CATALOG.filter(c => c.maxPlayers >= minPlayers)
  return makeChallenge(pool[Math.floor(Math.random() * pool.length)])
}

// ── Builder helpers ────────────────────────────────────────────────────────
export async function loadCompetition(comp) {
  const fact = await loadFact(comp)
  return { fact, clubs: fact.__d.clubs, nations: fact.__d.nations }
}
export function evaluateSpec(spec, fact) {
  const { players: roster, values } = resolveRoster(spec, fact.players)
  return {
    answers: Object.keys(roster).length,
    maxPlayers: maxDisjoint(values),
    solvable: checkoutCombos(values) >= SOLO_MIN_COMBOS,
    title: titleOf(spec, fact),
  }
}

export const CATALOG_SIZE = CATALOG.length
