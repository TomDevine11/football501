// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 — SOURCED, PRECOMPUTED, LOOKUP-VALIDATED
//
// The architectural fix for 501. Each challenge is backed by an authoritative
// all-time top-scorer leaderboard (parsed from Wikipedia list articles, exact
// goals per player — Tier-1 official records). A guess is validated by a pure
// lookup against that challenge's roster: no StatMuse scraping, no prose
// parsing, no runtime API, no multi-source disagreement.
//
// Like dropping the unsourceable "manager" axis in TicTacToe, 501 drops the
// fuzzy position/continent filters and the multi-stat sums it could never
// source. The leaderboard IS the eligible set, so a valid answer is one that
// appears on the official list — and its exact stat is known before the user
// guesses. Real tallies are kept as-is; a player worth >180 (e.g. Messi's 474
// La Liga goals) is returned with that value and busts the board in-game,
// exactly as a darts visit over 180 would.
// ─────────────────────────────────────────────────────────────────────────

import statsData from './canonical/stats.generated.json'
import { normalize } from './canonical/resolve.js'

export const STATS_AS_OF = statsData.meta.fetchedAt

// challengeId → { playerName: { value, breakdown, source } }
export const ROSTERS = {}
export const CHALLENGE_META = {}
for (const [id, ch] of Object.entries(statsData.challenges)) {
  const roster = {}
  for (const [name, goals] of Object.entries(ch.players)) {
    roster[name] = { value: goals, breakdown: { goals }, source: ch.source }
  }
  ROSTERS[id] = roster
  CHALLENGE_META[id] = { competition: ch.competition, statLabel: ch.statLabel, source: ch.source }
}

export const SOURCED_CHALLENGES = new Set(Object.keys(ROSTERS))
export function isSourced(challengeId) { return SOURCED_CHALLENGES.has(challengeId) }
export function rosterIsEmpty(challengeId) { return !ROSTERS[challengeId] || Object.keys(ROSTERS[challengeId]).length === 0 }

// Per-roster name index (full name + surname) for self-contained resolution.
const PARTICLES = new Set(['van', 'von', 'de', 'der', 'den', 'da', 'dos', 'das', 'di', 'del', 'la', 'le', 'el', 'al', 'ten', 'ter'])
function surnameKeys(name) {
  const parts = normalize(name).split(' ')
  const keys = [parts[parts.length - 1]]
  let i = parts.length - 2, tail = parts[parts.length - 1]
  while (i >= 0 && PARTICLES.has(parts[i])) { tail = parts[i] + ' ' + tail; keys.push(tail); i-- }
  return keys
}
const indexes = {}
function indexFor(challengeId) {
  if (indexes[challengeId]) return indexes[challengeId]
  const full = new Map(), sur = new Map()
  const add = (m, k, name) => { if (!k) return; if (!m.has(k)) m.set(k, new Set()); m.get(k).add(name) }
  for (const name of Object.keys(ROSTERS[challengeId] || {})) {
    add(full, normalize(name), name)
    for (const k of surnameKeys(name)) add(sur, k, name)
  }
  return (indexes[challengeId] = { full, sur })
}

// Pure validation against the authoritative roster.
//   { status:'valid', name, value, breakdown, source }
//   { status:'ambiguous', options }
//   { status:'not-eligible' }   — not on this leaderboard
//   { status:'no-data' }        — challenge has no roster
export function validateGuess(challengeId, rawName) {
  const roster = ROSTERS[challengeId]
  if (!roster) return { status: 'no-data' }
  const q = normalize(rawName)
  if (!q) return { status: 'not-eligible' }
  const { full, sur } = indexFor(challengeId)
  const hit = full.get(q) || sur.get(q)
  if (!hit) return { status: 'not-eligible' }
  if (hit.size > 1) return { status: 'ambiguous', options: [...hit].sort() }
  const name = [...hit][0]
  return { status: 'valid', name, ...roster[name] }
}
