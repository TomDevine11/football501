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

// Tidy a few messy Wikidata team labels for the end-of-round reveal.
function cleanTeam(label) {
  return label
    .replace(/\bFc\b/g, 'FC')
    .replace(/\s+(Club de Fútbol|Fútbol Club|S\.?K\.?|Calcio\b.*)$/i, '')
    .replace(/\.$/, '')
    .trim()
}

// Build a playable round. Spread the clues across the DIFFERENT teams the
// mystery player turned out for — one (most-famous) teammate from each team in
// turn — so a well-travelled player's clues cover their career rather than
// clustering at one club. Then reveal least-famous first so it gets easier.
function buildClues(teammates) {
  const byTeam = new Map() // team -> teammates, most famous first
  for (const t of [...teammates].sort((a, b) => b.fame - a.fame)) {
    if (!byTeam.has(t.team)) byTeam.set(t.team, [])
    byTeam.get(t.team).push(t)
  }
  // Teams are iterated in the order their most-famous member appeared, so the
  // biggest teams lead. Round-robin one per team until we have MAX_CLUES.
  const teams = [...byTeam.keys()]
  const picked = []
  for (let round = 0; picked.length < MAX_CLUES; round++) {
    let progressed = false
    for (const team of teams) {
      const list = byTeam.get(team)
      if (round < list.length) {
        picked.push(list[round]); progressed = true
        if (picked.length >= MAX_CLUES) break
      }
    }
    if (!progressed) break
  }
  picked.sort((a, b) => a.fame - b.fame) // hardest (least famous) clue first
  return picked.map(t => ({ name: t.name, team: cleanTeam(t.team), flag: getFlagFromNationality(t.nationality) }))
}

export function getRandomTarget() {
  const p = data.players[Math.floor(Math.random() * data.players.length)]
  return { name: p.name, clues: buildClues(p.teammates) }
}
