// "Name the Winning Squad" — pick a World Cup-winning team and recall as many of
// the squad as you can. Squads parsed from Wikipedia (see import-wc-squads.mjs).

import data from './wcsquads.generated.json'
import { normalize } from './canonical/resolve.js'

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
  for (const name of squad.players) {
    full.set(normalize(name), name)
    for (const k of surnameKeys(name)) counts.set(k, (counts.get(k) || 0) + 1)
  }
  const surname = new Map()
  for (const name of squad.players) {
    for (const k of surnameKeys(name)) if (counts.get(k) === 1) surname.set(k, name)
  }
  return { full, surname }
}

// Returns the canonical squad name the guess matches, or null.
export function matchPlayer(matcher, input) {
  const q = normalize(input)
  if (!q) return null
  return matcher.full.get(q) || matcher.surname.get(q) || null
}
