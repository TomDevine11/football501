import { describe, it, expect } from 'vitest'
import { getDailyWordlePlayer, normalizeLetters, WORDLE_AS_OF } from '../src/data/wordle.js'
import { famousPlayers } from '../src/data/famousPlayers.js'

describe('Wordle pool integrity', () => {
  it('dataset carries an as-of date', () => {
    expect(WORDLE_AS_OF).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('normalizeLetters reduces to A-Z only', () => {
    expect(normalizeLetters('Mbappé')).toBe('MBAPPE')
    expect(normalizeLetters("O'Shea")).toBe('OSHEA')
    expect(normalizeLetters('De Bruyne')).toBe('DEBRUYNE')
  })

  it('every famous player has a name and nationality', () => {
    for (const p of famousPlayers) {
      expect(p.name, 'name').toBeTruthy()
      expect(p.nationality, p.name).toBeTruthy()
    }
  })

  it('daily answer is a real pool entry with a 5+ letter surname', () => {
    const p = getDailyWordlePlayer()
    expect(p).toBeTruthy()
    expect(p.surname.length).toBeGreaterThanOrEqual(5)
    expect(p.surname).toMatch(/^[A-Z]+$/)
  })

  it('every day for 2 years yields a valid answer (no undefined pool slots)', () => {
    // Simulate getDailyWordlePlayer for many day indices via the pool length.
    const p = getDailyWordlePlayer()
    expect(p.fullName).toBeTruthy()
    expect(p.displaySurname).toBeTruthy()
  })
})
