// "Guess the Player from teammates" — data loader + matching.
//
// Each target carries real teammates (players who shared a team during
// OVERLAPPING years — see scripts/wikidata/import-teammates.mjs). The game
// reveals one teammate at a time; the player guesses who the mystery player is.

import data from './teammates.generated.json'
import { getFlagFromNationality } from '../utils/flags.js'

export { matchesTarget } from './guessMatch.js'

export const TEAMMATES_AS_OF = data.meta?.fetchedAt || ''
export const TARGET_COUNT = data.players.length
export const MAX_CLUES = 5

// Build a playable round: pick the most recognisable teammates, then reveal
// them LEAST-famous first so the clues get easier as the game goes on.
function buildClues(teammates) {
  const top = [...teammates].sort((a, b) => b.fame - a.fame).slice(0, MAX_CLUES)
  top.sort((a, b) => a.fame - b.fame) // ascending → hardest clue first
  return top.map(t => ({ name: t.name, team: t.team, flag: getFlagFromNationality(t.nationality) }))
}

export function getRandomTarget() {
  const p = data.players[Math.floor(Math.random() * data.players.length)]
  return { name: p.name, clues: buildClues(p.teammates) }
}
