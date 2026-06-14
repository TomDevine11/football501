import { describe, it, expect } from 'vitest'
import { POOL, POOL_SIZE, randomPlayer, isCorrect } from '../src/data/higherlower.js'

describe('Higher or Lower pool', () => {
  it('has a large pool of recognisable players with a fame value', () => {
    expect(POOL_SIZE).toBeGreaterThan(200)
    for (const p of POOL) {
      expect(p.name).toBeTruthy()
      expect(Number.isInteger(p.fame)).toBe(true)
      expect(p.fame).toBeGreaterThanOrEqual(35)
    }
  })

  it('randomPlayer respects the exclude set', () => {
    const a = randomPlayer()
    for (let i = 0; i < 50; i++) {
      const b = randomPlayer(new Set([a.name]))
      expect(b.name).not.toBe(a.name)
    }
  })
})

describe('Higher or Lower scoring', () => {
  const current = { name: 'A', fame: 50 }
  it('higher is correct when challenger has more', () => {
    expect(isCorrect('higher', current, { fame: 80 })).toBe(true)
    expect(isCorrect('higher', current, { fame: 30 })).toBe(false)
  })
  it('lower is correct when challenger has fewer', () => {
    expect(isCorrect('lower', current, { fame: 30 })).toBe(true)
    expect(isCorrect('lower', current, { fame: 80 })).toBe(false)
  })
  it('a tie is correct either way', () => {
    expect(isCorrect('higher', current, { fame: 50 })).toBe(true)
    expect(isCorrect('lower', current, { fame: 50 })).toBe(true)
  })
})
