// Phase 3: TicTacToe validation. Its resolver (resolveGuess = resolveAgainst)
// already validates by canonical registry identity (since Phase 2), and a
// picked suggestion now takes an id fast-path against the cell's candidates.
import { describe, it, expect } from 'vitest'
import { getGridForDay, resolveGuess } from '../src/data/tictactoe.js'
import { resolveNameToId } from '../src/data/canonical/resolve.js'

// Mirror of the component's picked-suggestion id fast-path.
function idFastPath(candidates, selectedId, usedNames = new Set()) {
  for (const name of candidates) {
    if (resolveNameToId(name) === selectedId && !usedNames.has(name)) return name
  }
  return null
}

describe('TicTacToe id-based validation', () => {
  const grid = getGridForDay(100)
  // Find a cell whose first candidate resolves to a stable id.
  const cell = grid.candidates.find(c => c.some(n => resolveNameToId(n)))

  it('a daily grid has cells with resolvable candidates', () => {
    expect(cell).toBeTruthy()
  })

  it('a picked candidate is accepted via the id fast-path', () => {
    const name = cell.find(n => resolveNameToId(n))
    expect(idFastPath(cell, resolveNameToId(name))).toBe(name)
  })

  it('a player NOT valid for the cell is rejected by both id path and resolver', () => {
    const intruderId = resolveNameToId('Cristiano Ronaldo')
    if (cell.some(n => resolveNameToId(n) === intruderId)) return // skip if he happens to fit
    expect(idFastPath(cell, intruderId)).toBeNull()
    expect(resolveGuess('Cristiano Ronaldo', cell, new Set())).toBeNull()
  })

  it('free-typed full name of a candidate still validates via the resolver', () => {
    const name = cell.find(n => resolveNameToId(n))
    expect(resolveGuess(name, cell, new Set())).toBe(name)
  })
})
