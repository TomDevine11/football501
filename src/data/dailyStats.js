// Local daily-game stats + streaks (per browser, no backend).
// Tracks, per game: games played, wins, current win streak, max streak.
// "Win" is defined by each game (Wordle solved, TicTacToe grid filled,
// Connections solved, Tenable all 10). A streak continues only across
// consecutive days; a loss or a missed day resets it.

const KEY = 'ftg-stats-v1'

export function todayIndex() {
  const now = new Date()
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
function save(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { /* storage unavailable */ }
}

const blank = () => ({ played: 0, wins: 0, currentStreak: 0, maxStreak: 0, lastPlayed: null, lastWin: null })

export function getStats(game) {
  return { ...blank(), ...(load()[game] || {}) }
}

// Record today's result once. Idempotent per day (replaying the same day's
// puzzle won't double-count). Returns the updated stats.
export function recordResult(game, won) {
  const all = load()
  const day = todayIndex()
  const s = { ...blank(), ...(all[game] || {}) }
  if (s.lastPlayed === day) return s // already recorded today

  s.played += 1
  if (won) {
    s.wins += 1
    s.currentStreak = s.lastWin === day - 1 ? s.currentStreak + 1 : 1
    s.maxStreak = Math.max(s.maxStreak, s.currentStreak)
    s.lastWin = day
  } else {
    s.currentStreak = 0
  }
  s.lastPlayed = day
  all[game] = s
  save(all)
  return s
}
