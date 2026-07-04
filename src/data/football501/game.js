// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 — RUNTIME DATA ACCESS
//
// Loads the precomputed challenge rosters (questionCache.generated.json, built
// by the Transfermarkt pipeline) and exposes the game's data contract:
//   - CHALLENGES        list for the pickers / daily rotation
//   - getDailyChallenge deterministic "challenge of the day"
//   - validateGuess     resolve a typed name against a challenge's roster
//
// Same status contract as five01.js, so the component stays simple.
// ─────────────────────────────────────────────────────────────────────────

import cache from './questionCache.generated.json'
import { normalize, surnameKeys } from '../canonical/normalize.js'

// Challenge metadata (no rosters) for the selector + daily rotation.
export const CHALLENGES = Object.entries(cache.challenges).map(([id, c]) => ({
  id,
  title: c.title,
  group: c.group,
  hint: c.hint,
  statLabel: c.statLabel,
  competition: c.competition,
  filter: c.filter,
  count: c.stats?.eligible ?? Object.keys(c.players).length,
}))

const META_BY_ID = Object.fromEntries(CHALLENGES.map(c => [c.id, c]))
export const getChallengeById = (id) => META_BY_ID[id]

// Deterministic challenge of the day — rotates through the list at local
// midnight (repeats once the list is exhausted).
export function getDailyChallenge() {
  const now = new Date()
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  const n = CHALLENGES.length
  return CHALLENGES[((day % n) + n) % n]
}

export function getRandomChallenge() {
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
}

// Per-challenge name index (full name + surname → player ids), built lazily
// and cached. Ambiguity is surfaced, never silently guessed.
const indexCache = {}
function indexFor(challengeId) {
  if (indexCache[challengeId]) return indexCache[challengeId]
  const roster = cache.challenges[challengeId]?.players || {}
  const full = new Map(), sur = new Map()
  const add = (m, k, id) => { if (!k) return; if (!m.has(k)) m.set(k, new Set()); m.get(k).add(id) }
  for (const [id, p] of Object.entries(roster)) {
    add(full, normalize(p.name), id)
    for (const k of surnameKeys(p.name)) add(sur, k, id)
  }
  return (indexCache[challengeId] = { full, sur, roster })
}

// Resolve a typed guess against a challenge roster.
//   { status:'valid', name, value, breakdown }
//   { status:'ambiguous', options:[names] }
//   { status:'not-eligible' }   — not a valid answer for this challenge
export function validateGuess(challengeId, rawName) {
  const q = normalize(rawName)
  if (!q) return { status: 'not-eligible' }
  const { full, sur, roster } = indexFor(challengeId)
  const hit = full.get(q) || sur.get(q)
  if (!hit) return { status: 'not-eligible' }
  if (hit.size > 1) return { status: 'ambiguous', options: [...hit].map(id => roster[id].name).sort() }
  const p = roster[[...hit][0]]
  return { status: 'valid', name: p.name, value: p.value, breakdown: p.breakdown }
}
