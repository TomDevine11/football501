// Local daily-game stats + streaks (per browser, no backend). Only DAILY mode
// records here — unlimited/practice play never touches these.
//
// Two shapes, both stored the same way:
//   • win/lose games  → streak = consecutive winning days; show Played/Win%/Streak/Max
//   • score games     → streak = consecutive days PLAYED; also track `best` score;
//                        show Played/Best/Streak/Max
// recordResult(game, won, score?): pass won=true for a "successful" day (a win,
// or simply having played a score game), and the score for score games.

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

const blank = () => ({ played: 0, wins: 0, currentStreak: 0, maxStreak: 0, best: 0, lastPlayed: null, lastWin: null })

export function getStats(game) {
  return { ...blank(), ...(load()[game] || {}) }
}

// Record today's result once (idempotent per day). Returns the updated stats.
export function recordResult(game, won, score = null) {
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
  if (score != null && score > s.best) s.best = score
  s.lastPlayed = day
  all[game] = s
  save(all)
  return s
}
