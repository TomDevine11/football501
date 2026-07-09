// Retention layer: form history, matchday points, perfect-day doubling.
import { describe, it, expect, beforeEach } from 'vitest'
import {
  recordResult, formGuide, weeklyPoints, playedToday, todayIndex, weekStart,
  DAILY_GAMES, PTS_PLAY, PTS_WIN, PTS_STREAK_PER, PERFECT_MULT,
} from '../src/data/dailyStats.js'

// Minimal localStorage for node
const store = new Map()
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
}

beforeEach(() => store.clear())

describe('form history', () => {
  it('records results and renders the last-5 form guide with gaps', () => {
    recordResult('wordle', true)
    // only today recorded → four gaps then a W
    expect(formGuide('wordle')).toBe('----W')
  })

  it('shows L for a played loss', () => {
    recordResult('tenable', false)
    expect(formGuide('tenable')).toBe('----L')
  })

  it('is idempotent per day', () => {
    recordResult('wordle', true)
    recordResult('wordle', true)
    expect(formGuide('wordle')).toBe('----W')
    expect(playedToday('wordle')).toBe(true)
  })
})

describe('matchday points', () => {
  it('awards win points plus streak bonus', () => {
    recordResult('wordle', true) // first win → streak 1
    expect(weeklyPoints()).toBe(PTS_WIN + PTS_STREAK_PER * 1)
  })

  it('awards play points for a loss (streak resets, no bonus)', () => {
    recordResult('tenable', false)
    expect(weeklyPoints()).toBe(PTS_PLAY)
  })

  it('accumulates across games', () => {
    recordResult('wordle', true)
    recordResult('tenable', false)
    expect(weeklyPoints()).toBe(PTS_WIN + PTS_STREAK_PER + PTS_PLAY)
  })

  it('doubles the day when all nine record (perfect day)', () => {
    for (const g of DAILY_GAMES) recordResult(g, false)
    expect(weeklyPoints()).toBe(DAILY_GAMES.length * PTS_PLAY * PERFECT_MULT)
  })

  it('does not double twice', () => {
    for (const g of DAILY_GAMES) recordResult(g, false)
    const after = weeklyPoints()
    recordResult('wordle', true) // idempotent — no change
    expect(weeklyPoints()).toBe(after)
  })
})

describe('week boundaries', () => {
  it('weekStart is a Monday on or before today', () => {
    const ws = weekStart()
    expect(ws).toBeLessThanOrEqual(todayIndex())
    expect(todayIndex() - ws).toBeLessThan(7)
    // day 4 (1970-01-05) was a Monday; Mondays are ≡ 4 (mod 7)
    expect(((ws % 7) + 7) % 7).toBe(4)
  })
})
