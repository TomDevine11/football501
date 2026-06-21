// "Career Path" — data loader + matching.
//
// Each target carries their senior club career in chronological order (from
// Wikidata P54 club spells — see scripts/wikidata/import-careers.mjs). The game
// reveals one club at a time; the player guesses who played for them all.

import data from './careers.generated.json'

export { matchesTarget } from './guessMatch.js'

export const CAREERS_AS_OF = data.meta?.fetchedAt || ''
export const TARGET_COUNT = data.players.length
export const MAX_CLUES = 5

function years(c) {
  if (!c.from) return ''
  return c.to ? `${c.from}–${c.to}` : `${c.from}–`
}

function toRound(p) {
  const clues = p.clubs.slice(0, MAX_CLUES).map(c => ({ club: c.name, years: years(c) }))
  return { name: p.name, clues }
}

export function getRandomTarget() {
  return toRound(data.players[Math.floor(Math.random() * data.players.length)])
}

// Deterministic mystery player for a given day (Daily mode → stats/streaks).
export function getTargetForDay(dayIndex) {
  const n = data.players.length
  return toRound(data.players[((dayIndex % n) + n) % n])
}

export function getDailyTarget() {
  const now = new Date()
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  return getTargetForDay(dayIndex)
}
