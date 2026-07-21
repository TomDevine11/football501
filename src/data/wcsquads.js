// "Name the Winning Squad" — pick a World Cup-winning team and recall as many of
// the squad as you can. Squads parsed from Wikipedia (see import-wc-squads.mjs).

import data from './wcsquads.generated.json'
import { normalize, resolveNameToId } from './canonical/resolve.js'

export const WCSQUADS_AS_OF = data.meta?.fetchedAt || ''
export const SQUADS = data.squads // [{ year, nation, players: [...] }], newest first

const PARTICLES = new Set(['van', 'von', 'de', 'der', 'den', 'da', 'dos', 'das', 'di', 'del', 'la', 'le', 'el', 'al', 'ten', 'ter'])
function surnameKeys(name) {
  const parts = normalize(name).split(' ')
  const keys = [parts[parts.length - 1]]
  let i = parts.length - 2, tail = parts[parts.length - 1]
  while (i >= 0 && PARTICLES.has(parts[i])) { tail = parts[i] + ' ' + tail; keys.push(tail); i-- }
  return keys
}

// Full names always match; a surname matches only when it's unique in the squad
// (so "Charlton" in England '66 needs "Bobby"/"Jack", but "Hurst" alone works).
export function buildMatcher(squad) {
  const full = new Map()
  const counts = new Map()
  const byId = new Map() // stable player id -> squad name (Phase 3 id matching)
  let unresolved = 0
  for (const name of squad.players) {
    full.set(normalize(name), name)
    for (const k of surnameKeys(name)) counts.set(k, (counts.get(k) || 0) + 1)
    const id = resolveNameToId(name)
    if (id) byId.set(id, name); else unresolved++
  }
  const surname = new Map()
  for (const name of squad.players) {
    for (const k of surnameKeys(name)) if (counts.get(k) === 1) surname.set(k, name)
  }
  return { full, surname, byId, unresolved }
}

// Deterministic "squad of the day" — everyone names the same team today.
export function getSquadForDay(dayIndex) {
  const n = SQUADS.length
  return SQUADS[((dayIndex % n) + n) % n]
}

export function getDailySquad() {
  const now = new Date()
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  return getSquadForDay(dayIndex)
}

// Returns the canonical squad name the guess matches, or null.
// Phase 3: when the guess came from a picked suggestion (selectedId), match by
// stable player id — authoritative once the whole squad has resolved ids (so a
// namesake picked from the dropdown is correctly rejected). Free-typed text, or
// a squad with any unresolved player, falls back to name/surname matching.
export function matchPlayer(matcher, input, selectedId = null) {
  if (selectedId != null) {
    const byId = matcher.byId.get(selectedId)
    if (byId) return byId
    if (matcher.unresolved === 0) return null // fully-resolved squad, id not in it → wrong
  }
  const q = normalize(input)
  if (!q) return null
  return matcher.full.get(q) || matcher.surname.get(q) || null
}
