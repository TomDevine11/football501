// "Higher or Lower" — compare two footballers on a real stat you choose:
// all-time goals in the Premier League, La Liga, Bundesliga, the Champions
// League, or for their country. Players come from the sourced top-scorer
// leaderboards (src/data/canonical/stats.generated.json via five01), so every
// name is a genuine record-holder — no obscure tail.

import { ROSTERS, CHALLENGE_META } from './five01.js'

export const STAT_MODES = ['intl-goals', 'prem-goals', 'laliga-goals', 'ucl-goals', 'bundesliga-goals']
  .filter(id => ROSTERS[id] && Object.keys(ROSTERS[id]).length >= 12)
  .map(id => ({ id, label: CHALLENGE_META[id].statLabel, competition: CHALLENGE_META[id].competition }))

export function poolFor(modeId) {
  return Object.entries(ROSTERS[modeId] || {}).map(([name, e]) => ({ name, value: e.value }))
}

export function randomFrom(pool, exclude = new Set()) {
  if (pool.length <= exclude.size) return pool[Math.floor(Math.random() * pool.length)]
  let p
  do { p = pool[Math.floor(Math.random() * pool.length)] } while (exclude.has(p.name))
  return p
}

// Ties count as correct either way.
export function isCorrect(direction, current, challenger) {
  if (challenger.value === current.value) return true
  return direction === 'higher' ? challenger.value > current.value : challenger.value < current.value
}
