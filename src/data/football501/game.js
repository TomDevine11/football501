// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 — RUNTIME QUESTION GENERATOR
//
// Draws questions from the precomputed catalog (every entry is guaranteed
// completable) and resolves each one's roster on the fly from the all-time PL
// fact table, using the SAME spec module the catalog was built with — so the
// game's validation and the build can never disagree.
//   - getDailyChallenge()          deterministic question of the day (solo)
//   - getRandomChallenge(minP)      random question valid for ≥ minP players
//   - challenge.validate(name)      resolve a typed guess
//   - badgeFor(name)                position badge (same source as the filter)
// ─────────────────────────────────────────────────────────────────────────

import fact from './history.GB1.generated.json'
import cat from './catalog.generated.json'
import { resolveRoster, statLabel, titleFor } from './spec.js'
import { checkoutCombos, maxDisjoint, SOLO_MIN_COMBOS } from './checkout.js'
import { normalize, surnameKeys } from '../canonical/normalize.js'

const PLAYERS = fact.players
const CATALOG = cat.catalog

// ── Filter option lists + label maps (for the custom builder + titles) ─────
const CLUB_NAME = Object.fromEntries(Object.entries(fact.clubs).map(([id, c]) => [id, c.name]))
const NAT_DISPLAY = {}, NAT_COUNT = {}
for (const p of PLAYERS) { if (!p.natKey) continue; NAT_DISPLAY[p.natKey] ||= p.nat; NAT_COUNT[p.natKey] = (NAT_COUNT[p.natKey] || 0) + 1 }

export const CLUBS = Object.entries(fact.clubs).map(([id, c]) => ({ id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name))
export const NATIONS = Object.keys(NAT_COUNT).filter(k => NAT_COUNT[k] >= 15)
  .map(k => ({ key: k, display: NAT_DISPLAY[k] })).sort((a, b) => a.display.localeCompare(b.display))
export const POSITIONS = [{ code: 'GK', label: 'Goalkeepers' }, { code: 'DEF', label: 'Defenders' }, { code: 'MID', label: 'Midfielders' }, { code: 'FWD', label: 'Forwards' }]
export const STAT_OPTIONS = [
  { id: 'goals', stat: 'goals', label: 'Goals' },
  { id: 'apps', stat: 'apps', label: 'Appearances' },
  { id: 'apps+goals', stat: { a: 'apps', op: '+', b: 'goals' }, label: 'Appearances + Goals' },
  { id: 'apps-goals', stat: { a: 'apps', op: '-', b: 'goals' }, label: 'Appearances − Goals' },
]

// ── Name → id resolution (full name + surname, ambiguity-aware) ────────────
function buildIndex(items) {
  const full = new Map(), sur = new Map()
  const add = (m, k, id) => { if (!k) return; if (!m.has(k)) m.set(k, new Set()); m.get(k).add(id) }
  for (const it of items) { add(full, normalize(it.name), it.id); for (const k of surnameKeys(it.name)) add(sur, k, it.id) }
  return { full, sur }
}
const resolveIds = (index, raw) => { const q = normalize(raw); if (!q) return new Set(); return index.full.get(q) || index.sur.get(q) || new Set() }

// Global fact index (for the position badge) — one position per player id.
const POS_BY_ID = new Map(PLAYERS.map(p => [p.id, p.pos]))
const factIndex = buildIndex(PLAYERS)
export function badgeFor(name) {
  const hit = resolveIds(factIndex, name)
  if (hit.size !== 1) return null
  return POS_BY_ID.get([...hit][0]) || null // 'GK' | 'DEF' | 'MID' | 'FWD'
}

const titleOf = (spec) => spec.title || titleFor(spec, { clubName: CLUB_NAME[spec.filter?.club], natDisplay: NAT_DISPLAY[spec.filter?.nationality] })

// ── A playable challenge = spec + resolved roster + validator ──────────────
// Works for both a catalog entry (title/answers/maxPlayers precomputed) and a
// raw custom spec (computed on the fly).
function makeChallenge(spec) {
  const { players: roster, values } = resolveRoster(spec, PLAYERS)
  const index = buildIndex(Object.entries(roster).map(([id, r]) => ({ id, name: r.name })))
  return {
    id: spec.id, title: titleOf(spec), statLabel: statLabel(spec.stat),
    answers: spec.answers ?? Object.keys(roster).length,
    maxPlayers: spec.maxPlayers ?? maxDisjoint(values),
    validate(rawName) {
      const hit = resolveIds(index, rawName)
      if (!hit.size) return { status: 'not-eligible' }
      if (hit.size > 1) return { status: 'ambiguous', options: [...hit].map(id => roster[id].name).sort() }
      const r = roster[[...hit][0]]
      return { status: 'valid', name: r.name, value: r.value, breakdown: r.breakdown }
    },
    // The full eligible answer set (name + value), highest first — for the
    // end-of-game reveal.
    answersList() {
      return Object.values(roster).map(r => ({ name: r.name, value: r.value })).sort((a, b) => b.value - a.value)
    },
    // Live strategy hints for the current player, given their score and the
    // names already used. `used` is a Set of resolved (canonical) answer names.
    //   highest   — biggest still-available throwable deduction (< 180)
    //   checkouts — answers that would check you out this throw (land 0..−10)
    //   perfect   — answers that land you exactly on 0
    insights(currentScore, used) {
      let highest = 0, checkouts = 0, perfect = 0
      for (const id in roster) {
        const r = roster[id]
        if (used.has(r.name)) continue
        const v = r.value
        if (v > 180) continue // over 180 busts — not a usable deduction (180 is valid)
        if (v > highest) highest = v
        if (v >= currentScore && v <= currentScore + 10) checkouts++
        if (v === currentScore) perfect++
      }
      return { highest, checkouts, perfect }
    },
  }
}
export const makeCustomChallenge = (spec) => makeChallenge(spec)

// Live-evaluate a custom spec for the builder: how many answers, and how many
// players can it support (completability).
export function evaluateSpec(spec) {
  const { players: roster, values } = resolveRoster(spec, PLAYERS)
  const answers = Object.keys(roster).length
  const maxPlayers = maxDisjoint(values)
  const solvable = checkoutCombos(values) >= SOLO_MIN_COMBOS
  return { answers, maxPlayers, solvable, title: titleOf(spec) }
}

// The daily draws from a friendlier subset — questions with plenty of possible
// answers — so it feels approachable for everyone. Multiplayer still uses the
// full catalog. (Tunable; raise/lower DAILY_MIN_ANSWERS to taste.)
const DAILY_MIN_ANSWERS = 100
const DAILY_POOL = CATALOG.filter(c => c.answers >= DAILY_MIN_ANSWERS)

// Deterministic question of the day (solo) — the pool is pre-scattered, so
// consecutive days feel unrelated.
export function getDailyEntry() {
  const now = new Date()
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  const pool = DAILY_POOL.length ? DAILY_POOL : CATALOG
  return pool[((day % pool.length) + pool.length) % pool.length]
}
export const getDailyChallenge = () => makeChallenge(getDailyEntry())

// Random question valid for at least `minPlayers` (multiplayer capacity).
export function getRandomChallenge(minPlayers = 1) {
  const pool = CATALOG.filter(c => c.maxPlayers >= minPlayers)
  return makeChallenge(pool[Math.floor(Math.random() * pool.length)])
}

export const CATALOG_SIZE = CATALOG.length
