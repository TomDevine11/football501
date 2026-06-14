import { describe, it, expect } from 'vitest'
import { getRandomTournament, YEARS, MAX_CLUES } from '../src/data/worldcup.js'

describe('Guess the World Cup data', () => {
  it('covers every World Cup from 1930 to 2026', () => {
    expect(YEARS[0]).toBe(1930)
    expect(YEARS).toContain(2026)
    expect(YEARS.length).toBeGreaterThanOrEqual(23)
  })

  it('years are unique and chronological', () => {
    expect(new Set(YEARS).size).toBe(YEARS.length)
    const sorted = [...YEARS].sort((a, b) => a - b)
    expect(YEARS).toEqual(sorted)
  })

  it('a random tournament has a year, exactly MAX_CLUES clues, and a summary', () => {
    for (let i = 0; i < 40; i++) {
      const t = getRandomTournament()
      expect(YEARS).toContain(t.year)
      expect(t.clues.length).toBe(MAX_CLUES)
      for (const c of t.clues) expect(typeof c).toBe('string')
      expect(t.summary).toContain(String(t.year))
    }
  })

  it('completed tournaments end with the winner as the final clue', () => {
    // sample many; non-2026 tournaments reveal the winner last
    for (let i = 0; i < 60; i++) {
      const t = getRandomTournament()
      if (t.winner) expect(t.clues[MAX_CLUES - 1]).toBe(`Winners: ${t.winner}`)
    }
  })
})
