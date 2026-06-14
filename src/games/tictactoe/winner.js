// Pure tic-tac-toe win detection, shared by the 1v1 mode and its tests.

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
]

// owners: { cellIndex: 'X' | 'O' }. Returns { mark, line } for the first
// completed line, or null if there's no winner yet.
export function getWinner(owners) {
  for (const line of LINES) {
    const [a, b, c] = line
    if (owners[a] && owners[a] === owners[b] && owners[a] === owners[c]) {
      return { mark: owners[a], line }
    }
  }
  return null
}

// True once every square is owned (used to detect a draw alongside getWinner).
export function isFull(owners) {
  return Object.keys(owners).length === 9
}
