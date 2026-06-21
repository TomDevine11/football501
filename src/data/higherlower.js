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

// --- Daily mode -----------------------------------------------------------
// A deterministic chain everyone gets the same day: a fixed stat + a seeded
// ordering of that stat's pool. You compare down the chain until you miss;
// your score = how far you got. (Stats/streaks only in Daily mode.)

function seededRandom(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}
function seededShuffle(array, rng) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Returns { mode, sequence } for a given day. `sequence` is the full pool in a
// fixed daily order; the game walks adjacent pairs.
export function getDailyRun(dayIndex) {
  const mode = STAT_MODES[((dayIndex % STAT_MODES.length) + STAT_MODES.length) % STAT_MODES.length]
  const rng = seededRandom(dayIndex * 7649 + 1)
  const sequence = seededShuffle(poolFor(mode.id), rng)
  return { mode, sequence }
}
