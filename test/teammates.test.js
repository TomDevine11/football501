import { describe, it, expect } from 'vitest'
import { getRandomTarget, matchesTarget, MAX_CLUES, TARGET_COUNT } from '../src/data/teammates.js'

describe('teammate-guessing data', () => {
  it('has a pool of playable targets', () => {
    expect(TARGET_COUNT).toBeGreaterThan(10)
  })

  it('a random target has a name and at least MAX_CLUES clues', () => {
    for (let i = 0; i < 30; i++) {
      const t = getRandomTarget()
      expect(t.name).toBeTruthy()
      expect(t.clues.length).toBe(MAX_CLUES)
      for (const c of t.clues) expect(c.name).toBeTruthy()
    }
  })

  it('clues never include the target themselves', () => {
    for (let i = 0; i < 30; i++) {
      const t = getRandomTarget()
      expect(t.clues.some(c => c.name === t.name)).toBe(false)
    }
  })
})

describe('answer matching', () => {
  it('accepts full name and surname, accent-insensitive', () => {
    expect(matchesTarget('Lionel Messi', 'Messi')).toBe(true)
    expect(matchesTarget('Lionel Messi', 'lionel messi')).toBe(true)
    expect(matchesTarget('Kylian Mbappé', 'Mbappe')).toBe(true)
    expect(matchesTarget('Virgil van Dijk', 'van dijk')).toBe(true)
    expect(matchesTarget('Virgil van Dijk', 'Dijk')).toBe(true)
  })

  it('rejects a different player and junk', () => {
    expect(matchesTarget('Lionel Messi', 'Ronaldo')).toBe(false)
    expect(matchesTarget('Lionel Messi', '')).toBe(false)
    expect(matchesTarget('Lionel Messi', '###')).toBe(false)
  })
})
