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

export function getRandomTarget() {
  const p = data.players[Math.floor(Math.random() * data.players.length)]
  const clues = p.clubs.slice(0, MAX_CLUES).map(c => ({ club: c.name, years: years(c) }))
  return { name: p.name, clues }
}
