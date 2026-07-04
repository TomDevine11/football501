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
import { resolveRoster, statLabel } from './spec.js'
import { normalize, surnameKeys } from '../canonical/normalize.js'

const PLAYERS = fact.players
const CATALOG = cat.catalog

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

// ── A playable challenge = catalog entry + resolved roster + validator ─────
function makeChallenge(entry) {
  const { players: roster } = resolveRoster(entry, PLAYERS)
  const index = buildIndex(Object.entries(roster).map(([id, r]) => ({ id, name: r.name })))
  return {
    id: entry.id, title: entry.title, statLabel: statLabel(entry.stat),
    answers: entry.answers, maxPlayers: entry.maxPlayers,
    validate(rawName) {
      const hit = resolveIds(index, rawName)
      if (!hit.size) return { status: 'not-eligible' }
      if (hit.size > 1) return { status: 'ambiguous', options: [...hit].map(id => roster[id].name).sort() }
      const r = roster[[...hit][0]]
      return { status: 'valid', name: r.name, value: r.value, breakdown: r.breakdown }
    },
  }
}

// Deterministic question of the day (solo) — the catalog is pre-scattered, so
// consecutive days feel unrelated.
export function getDailyEntry() {
  const now = new Date()
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  const n = CATALOG.length
  return CATALOG[((day % n) + n) % n]
}
export const getDailyChallenge = () => makeChallenge(getDailyEntry())

// Random question valid for at least `minPlayers` (multiplayer capacity).
export function getRandomChallenge(minPlayers = 1) {
  const pool = CATALOG.filter(c => c.maxPlayers >= minPlayers)
  return makeChallenge(pool[Math.floor(Math.random() * pool.length)])
}

export const CATALOG_SIZE = CATALOG.length
