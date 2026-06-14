import { describe, it, expect } from 'vitest'
import { getWinner, isFull, LINES } from '../src/games/tictactoe/winner.js'
import { getRandomGrid } from '../src/data/tictactoe.js'

describe('1v1 win detection', () => {
  it('detects a row win', () => {
    const r = getWinner({ 0: 'X', 1: 'X', 2: 'X' })
    expect(r.mark).toBe('X')
    expect(r.line).toEqual([0, 1, 2])
  })

  it('detects a column and a diagonal win', () => {
    expect(getWinner({ 0: 'O', 3: 'O', 6: 'O' }).mark).toBe('O')
    expect(getWinner({ 0: 'X', 4: 'X', 8: 'X' }).line).toEqual([0, 4, 8])
  })

  it('returns null when there is no completed line', () => {
    expect(getWinner({ 0: 'X', 1: 'O', 2: 'X' })).toBeNull()
    expect(getWinner({})).toBeNull()
  })

  it('a mixed line is not a win', () => {
    expect(getWinner({ 0: 'X', 1: 'O', 2: 'X', 3: 'O', 4: 'X' })).toBeNull()
  })

  it('isFull only when all nine squares are owned', () => {
    expect(isFull({})).toBe(false)
    const full = {}; for (let i = 0; i < 9; i++) full[i] = i % 2 ? 'O' : 'X'
    expect(isFull(full)).toBe(true)
  })

  it('there are exactly 8 winning lines', () => {
    expect(LINES).toHaveLength(8)
  })
})

describe('random grid for 1v1', () => {
  it('produces a solvable 9-cell grid with broad + notable sets', () => {
    const g = getRandomGrid()
    expect(g.candidates).toHaveLength(9)
    expect(g.reveal).toHaveLength(9)
    // every cell is claimable by at least one notable player
    for (const cell of g.reveal) expect(cell.length).toBeGreaterThanOrEqual(2)
  })
})
