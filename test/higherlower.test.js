import { describe, it, expect } from 'vitest'
import { STAT_MODES, poolFor, randomFrom, isCorrect } from '../src/data/higherlower.js'

describe('Higher or Lower stat modes', () => {
  it('offers several real football stats, each with a usable pool', () => {
    expect(STAT_MODES.length).toBeGreaterThanOrEqual(3)
    for (const m of STAT_MODES) {
      const pool = poolFor(m.id)
      expect(pool.length, m.id).toBeGreaterThanOrEqual(12)
      for (const p of pool) {
        expect(p.name).toBeTruthy()
        expect(Number.isInteger(p.value)).toBe(true)
        expect(p.value).toBeGreaterThan(0)
      }
    }
  })

  it('randomFrom respects the exclude set', () => {
    const pool = poolFor(STAT_MODES[0].id)
    const a = randomFrom(pool)
    for (let i = 0; i < 50; i++) {
      expect(randomFrom(pool, new Set([a.name])).name).not.toBe(a.name)
    }
  })
})

describe('Higher or Lower scoring', () => {
  const current = { name: 'A', value: 100 }
  it('higher is correct when challenger scored more', () => {
    expect(isCorrect('higher', current, { value: 150 })).toBe(true)
    expect(isCorrect('higher', current, { value: 60 })).toBe(false)
  })
  it('lower is correct when challenger scored fewer', () => {
    expect(isCorrect('lower', current, { value: 60 })).toBe(true)
    expect(isCorrect('lower', current, { value: 150 })).toBe(false)
  })
  it('a tie is correct either way', () => {
    expect(isCorrect('higher', current, { value: 100 })).toBe(true)
    expect(isCorrect('lower', current, { value: 100 })).toBe(true)
  })
})
