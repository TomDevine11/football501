// "Higher or Lower" — compare two players by global fame, measured as the
// number of language editions of Wikipedia they appear in (the `fame` signal
// already on every canonical player). A reliable, universal number we have for
// thousands of players, so the streak never runs out and both sides are always
// recognisable.

import { allPlayers } from './canonical/facts.js'
import { getFlagFromNationality } from '../utils/flags.js'

const MIN_FAME = 35 // keep both players recognisable

export const POOL = allPlayers()
  .filter(p => p.fame >= MIN_FAME && p.displayName)
  .map(p => ({
    name: p.displayName,
    fame: p.fame,
    nationality: p.nationalities[0] || '',
    flag: getFlagFromNationality(p.nationalities[0] || ''),
  }))

export const POOL_SIZE = POOL.length
export const METRIC = 'Wikipedia language editions'

// Pick a random player, optionally excluding some names.
export function randomPlayer(exclude = new Set()) {
  if (POOL.length <= exclude.size) return POOL[Math.floor(Math.random() * POOL.length)]
  let p
  do { p = POOL[Math.floor(Math.random() * POOL.length)] } while (exclude.has(p.name))
  return p
}

// Is `challenger` a correct "higher"/"lower" call against `current`?
// Ties count as correct either way.
export function isCorrect(direction, current, challenger) {
  if (challenger.fame === current.fame) return true
  return direction === 'higher' ? challenger.fame > current.fame : challenger.fame < current.fame
}
