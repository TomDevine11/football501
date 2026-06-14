// Football Connections — a daily puzzle of 16 players forming 4 hidden groups
// of 4 (e.g. "Played for Real Madrid", "Brazil internationals", "Won the Ballon
// d'Or"). Built from the canonical facts.
//
// Correctness: every one of the 16 players is EXCLUSIVE to a single group — a
// player chosen for a group is not even a broad member of any of the other
// three categories — so the puzzle always has exactly one valid solution (the
// TicTacToe lesson: guarantee solvability, never ship an ambiguous board).

import { membersOf, notableMembersOf, getPlayer, CATEGORY_KEYS } from './canonical/facts.js'

const CATEGORIES = [
  ...CATEGORY_KEYS.clubs.map(v => ({ type: 'club', value: v })),
  ...CATEGORY_KEYS.nationalities.map(v => ({ type: 'nationality', value: v })),
  ...CATEGORY_KEYS.trophies.map(v => ({ type: 'trophy', value: v })),
]

export function categoryLabel(cat) {
  switch (cat.type) {
    case 'club': return `Played for ${cat.value}`
    case 'nationality': return `${cat.value} internationals`
    case 'trophy': return `Won the ${cat.value}`
    default: return cat.value
  }
}

function seededRandom(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}
function shuffle(array, rng) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

export function getConnectionsForDay(dayIndex) {
  for (let attempt = 0; attempt < 4000; attempt++) {
    const rng = seededRandom(dayIndex * 7919 + attempt + 1)
    const cats = shuffle(CATEGORIES, rng).slice(0, 4)

    const broad = cats.map(c => membersOf(c))
    const exclusive = cats.map((c, i) => {
      const others = broad.filter((_, j) => j !== i)
      return [...notableMembersOf(c)].filter(id => !others.some(s => s.has(id)))
    })
    if (exclusive.some(ex => ex.length < 4)) continue

    const groups = cats.map((c, i) => ({
      category: c,
      label: categoryLabel(c),
      players: shuffle(exclusive[i], rng).slice(0, 4).map(id => getPlayer(id).displayName),
    }))
    const all = groups.flatMap(g => g.players)
    if (new Set(all).size !== 16) continue

    return { groups, tiles: shuffle(all, rng), dayIndex }
  }
  throw new Error('Could not generate a Football Connections puzzle')
}

// Unseeded shuffle for the in-game "Shuffle" button (kept out of the component
// so its randomness doesn't trip the React purity lint).
export function shuffleNames(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

export function getDailyConnections() {
  const now = new Date()
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  return getConnectionsForDay(dayIndex)
}
