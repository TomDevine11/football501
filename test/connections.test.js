import { describe, it, expect } from 'vitest'
import { getConnectionsForDay } from '../src/data/connections.js'

const DAYS = 365

describe('Football Connections daily puzzle', () => {
  it('every day for a year produces a valid 4×4 puzzle', () => {
    for (let d = 0; d < DAYS; d++) {
      const p = getConnectionsForDay(d)
      expect(p.groups).toHaveLength(4)
      for (const g of p.groups) expect(g.players).toHaveLength(4)
      expect(p.tiles).toHaveLength(16)
    }
  })

  it('all 16 players are distinct (unique solution by construction)', () => {
    for (let d = 0; d < DAYS; d++) {
      const p = getConnectionsForDay(d)
      const all = p.groups.flatMap(g => g.players)
      expect(new Set(all).size).toBe(16)
    }
  })

  it('tiles are exactly the 16 group players', () => {
    for (let d = 0; d < DAYS; d++) {
      const p = getConnectionsForDay(d)
      const all = p.groups.flatMap(g => g.players)
      expect(new Set(p.tiles)).toEqual(new Set(all))
    }
  })

  it('the four categories are distinct', () => {
    for (let d = 0; d < DAYS; d++) {
      const p = getConnectionsForDay(d)
      const keys = p.groups.map(g => `${g.category.type}:${g.category.value}`)
      expect(new Set(keys).size).toBe(4)
    }
  })

  it('is deterministic for a given day', () => {
    const a = getConnectionsForDay(42)
    const b = getConnectionsForDay(42)
    expect(a.tiles).toEqual(b.tiles)
    expect(a.groups.map(g => g.label)).toEqual(b.groups.map(g => g.label))
  })
})
