// Per-day in-progress snapshot for daily games (local, no backend).
//
// The daily is one attempt: you can't replay it for a better shareable score.
// To enforce that AND survive a mid-round refresh (so bailing to the home page
// and back can't reset your lives), we persist the live game state of the daily
// as it's played. On return the same day we rehydrate it:
//   • terminal snapshot (done) → the round is locked; show its result screen
//   • non-terminal snapshot    → resume exactly where you left off
//
// Only DAILY mode is ever stored here. Unlimited/practice never touches it.
// Streaks/points still live in dailyStats.js (recordResult, idempotent per day).

import { todayIndex } from './dailyStats'

const PROGRESS_KEY = 'ftg-progress-v1'

function loadAll() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {} } catch { return {} }
}
function saveAll(all) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(all)) } catch { /* storage unavailable */ }
}

// The saved state for today, or null if there's nothing from today.
// `state` is whatever the game passed; it also carries a `done` flag.
// `sig` (optional) identifies WHICH puzzle the snapshot belongs to — pass the
// day's question/challenge id. If today's puzzle changed (e.g. the pool was
// edited), the stale snapshot is discarded so a new question starts fresh
// instead of restoring the previous question's guesses/result.
export function loadDailyProgress(game, sig = null) {
  const p = loadAll()[game]
  if (!p || p.d !== todayIndex()) return null
  if (sig != null && p.sig !== sig) return null // today's puzzle changed → stale
  return p.state
}

// Persist the daily's live state. `done` marks a finished round (won/lost/gave-up).
// `sig` is the day's puzzle id (see loadDailyProgress).
export function saveDailyProgress(game, state, done = false, sig = null) {
  const all = loadAll()
  all[game] = { d: todayIndex(), sig, state: { ...state, done } }
  saveAll(all)
}

export function clearDailyProgress(game) {
  const all = loadAll()
  if (all[game]) { delete all[game]; saveAll(all) }
}

// Hub status helpers (drive the KICK OFF / IN PLAY / FT tags):
//   • inProgressToday — a snapshot from today that isn't finished yet
//   • finishedToday   — a finished snapshot from today
// (finishedToday mirrors dailyStats.playedToday, but reads this store so a game
//  that hasn't been wired for streak-recording still reports correctly.)
export function inProgressToday(game) {
  const s = loadDailyProgress(game)
  return !!s && !s.done
}
export function finishedToday(game) {
  const s = loadDailyProgress(game)
  return !!s && !!s.done
}
