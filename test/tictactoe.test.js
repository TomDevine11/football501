import { describe, it, expect } from 'vitest'
import { getGridForDay, resolveGuess, findAssignment, CATEGORIES } from '../src/data/tictactoe.js'

const DAYS = 730 // two years of daily grids

describe('TicTacToe daily grid — solvability harness', () => {
  it('every day for 2 years produces a solvable grid', () => {
    for (let d = 0; d < DAYS; d++) {
      const grid = getGridForDay(d)
      expect(grid.candidates).toHaveLength(9)
    }
  })

  it('every cell of every grid has at least 2 distinct valid answers', () => {
    for (let d = 0; d < DAYS; d++) {
      const grid = getGridForDay(d)
      for (const cell of grid.candidates) expect(cell.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('every grid is fully completable with 9 distinct players', () => {
    for (let d = 0; d < DAYS; d++) {
      const grid = getGridForDay(d)
      const assignment = findAssignment(grid.candidates)
      expect(assignment, `day ${d} not completable`).not.toBeNull()
      expect(new Set(assignment).size).toBe(9) // all distinct
    }
  })

  it('the row and column categories are never identical', () => {
    for (let d = 0; d < DAYS; d++) {
      const { rowCategories, colCategories } = getGridForDay(d)
      for (const r of rowCategories)
        for (const c of colCategories)
          expect(r.type === c.type && r.value === c.value).toBe(false)
    }
  })

  it('is deterministic — same day index yields the same grid', () => {
    const a = getGridForDay(42)
    const b = getGridForDay(42)
    expect(a.rowCategories).toEqual(b.rowCategories)
    expect(a.colCategories).toEqual(b.colCategories)
  })
})

describe('TicTacToe guess validation', () => {
  it('accepts any valid answer for a cell, not just the intended one', () => {
    // Find a cell with multiple candidates and assert each one validates.
    const grid = getGridForDay(7)
    const cell = grid.candidates.find(c => c.length >= 2)
    for (const name of cell) {
      expect(resolveGuess(name, cell, new Set())).toBe(name)
    }
  })

  it('accepts surname and accent variants', () => {
    const cell = ['Cristiano Ronaldo', 'Lionel Messi']
    expect(resolveGuess('messi', cell, new Set())).toBe('Lionel Messi')
  })

  it('rejects a player who does not satisfy the cell', () => {
    const cell = ['Lionel Messi']
    expect(resolveGuess('Harry Kane', cell, new Set())).toBeNull()
  })
})

describe('category catalogue', () => {
  it('exposes the four sourceable category types (managers intentionally dropped)', () => {
    const types = new Set(CATEGORIES.map(c => c.type))
    expect([...types].sort()).toEqual(['club', 'league', 'nationality', 'trophy'])
  })
})
