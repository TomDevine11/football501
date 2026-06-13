import { famousPlayers } from './famousPlayers'
import { getFlagFromNationality } from '../utils/flags'

// Strip accents/punctuation and uppercase, leaving only A-Z.
export function normalizeLetters(str) {
  return str
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}

// Build a pool of unique surnames (5+ letters) from the curated "famous
// footballers" list, so the daily answer is always someone recognizable.
function buildPool() {
  const seen = new Set()
  const pool = []
  for (const p of famousPlayers) {
    const parts = p.name.trim().split(/\s+/)
    const surnameRaw = parts[parts.length - 1]
    const surname = normalizeLetters(surnameRaw)
    if (surname.length < 5) continue
    if (seen.has(surname)) continue
    seen.add(surname)
    pool.push({
      surname,
      displaySurname: surnameRaw,
      fullName: p.name,
      flag: getFlagFromNationality(p.nationality),
      nationality: p.nationality,
    })
  }
  return pool
}

const POOL = buildPool()

// Same daily-rotation pattern used by Football Tenable: changes at local midnight.
export function getDailyWordlePlayer() {
  const now = new Date()
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  return POOL[dayIndex % POOL.length]
}
