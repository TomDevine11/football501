import { describe, it, expect } from 'vitest'
import { getRandomTarget, matchesTarget, MAX_CLUES, TARGET_COUNT } from '../src/data/careers.js'

describe('career-path data', () => {
  it('has a pool of well-travelled targets', () => {
    expect(TARGET_COUNT).toBeGreaterThan(10)
  })

  it('a random target has a name and exactly MAX_CLUES club clues', () => {
    for (let i = 0; i < 30; i++) {
      const t = getRandomTarget()
      expect(t.name).toBeTruthy()
      expect(t.clues.length).toBe(MAX_CLUES)
      for (const c of t.clues) expect(c.club).toBeTruthy()
    }
  })

  it('no clue is a national team', () => {
    for (let i = 0; i < 40; i++) {
      const t = getRandomTarget()
      for (const c of t.clues) expect(/national.*team/i.test(c.club)).toBe(false)
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
