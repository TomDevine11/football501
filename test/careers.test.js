import { describe, it, expect } from 'vitest'
import { getRandomTarget, matchesTarget, MIN_CLUBS, TARGET_COUNT } from '../src/data/careers.js'
import { isSeniorTeam } from '../src/data/teamFilter.js'

describe('career-path data', () => {
  it('has a pool of well-travelled targets', () => {
    expect(TARGET_COUNT).toBeGreaterThan(10)
  })

  it('a random target shows their FULL senior career, at least MIN_CLUBS clubs', () => {
    // Every target qualifies with >= MIN_CLUBS senior clubs, and the whole
    // career is exposed (no upper cap) — reserve/'B'/youth sides are filtered.
    for (let i = 0; i < 30; i++) {
      const t = getRandomTarget()
      expect(t.name).toBeTruthy()
      expect(t.clues.length).toBeGreaterThanOrEqual(MIN_CLUBS)
      for (const c of t.clues) expect(c.club).toBeTruthy()
    }
  })

  it('every clue club is a senior side (no reserve / B / youth teams)', () => {
    for (let i = 0; i < 40; i++) {
      const t = getRandomTarget()
      for (const c of t.clues) {
        expect(/national.*team/i.test(c.club)).toBe(false)
        expect(isSeniorTeam(c.club), c.club).toBe(true)
      }
    }
  })
})

describe('career-path answer matching', () => {
  it('accepts full name and surname, accent-insensitive', () => {
    expect(matchesTarget('Zlatan Ibrahimović', 'Ibrahimovic')).toBe(true)
    expect(matchesTarget('Zlatan Ibrahimović', 'zlatan ibrahimovic')).toBe(true)
    expect(matchesTarget('Nicolas Anelka', 'Anelka')).toBe(true)
  })

  it('rejects a different player and junk', () => {
    expect(matchesTarget('Zlatan Ibrahimović', 'Messi')).toBe(false)
    expect(matchesTarget('Zlatan Ibrahimović', '')).toBe(false)
  })
})
