import { Fragment, useState, useRef, useEffect, useMemo } from 'react'
import { getRandomGrid, categoryLabel, resolveGuess, normalizeName } from '../../data/tictactoe'
import { usePlayerSuggestions } from './usePlayerSuggestions'
import { getWinner, isFull } from './winner'

const MARK = { X: '❌', O: '⭕' }
const MARK_COLOR = { X: 'text-red-400', O: 'text-blue-400' }

export default function TicTacToeVersus({ onBackToModes }) {
  const [grid, setGrid] = useState(() => getRandomGrid())
  const [owners, setOwners] = useState({})       // cellIndex -> 'X' | 'O'
  const [cellPlayers, setCellPlayers] = useState({}) // cellIndex -> player name
  const [turn, setTurn] = useState('X')
  const [starter, setStarter] = useState('X')
  const [selectedCell, setSelectedCell] = useState(null)
  const [input, setInput] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dismissed, setDismissed] = useState(false)
  const [result, setResult] = useState(null)     // null | {mark, line} | 'draw'
  const [scores, setScores] = useState({ X: 0, O: 0 })
  const [shake, setShake] = useState(false)
  const [lastWrong, setLastWrong] = useState(null) // { by, text, why } — why the last guess failed
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const usedNames = useMemo(() => new Set(Object.values(cellPlayers)), [cellPlayers])
  const active = result == null && selectedCell != null
  const { suggestions, isSearching } = usePlayerSuggestions(input, active, usedNames)

  useEffect(() => { setHighlightedIndex(-1); setDismissed(false) }, [input])
  const visibleSuggestions = dismissed ? [] : suggestions

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current?.contains(e.target) || inputRef.current?.contains(e.target)) return
      setDismissed(true)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectCell = (idx) => {
    if (result != null || owners[idx]) return
    setSelectedCell(idx)
    setInput('')
    setHighlightedIndex(-1)
    setLastWrong(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // Work out WHY a guess failed so we can tell the player.
  const reasonWrong = (text, cell) => {
    const norm = normalizeName(text)
    for (const used of usedNames) {
      const surname = normalizeName(used.split(' ').slice(-1)[0])
      if (normalizeName(used) === norm || surname === norm) {
        return `${used} has already been used on this grid`
      }
    }
    const rowLabel = categoryLabel(grid.rowCategories[Math.floor(cell / 3)])
    const colLabel = categoryLabel(grid.colCategories[cell % 3])
    return `doesn’t satisfy ${rowLabel} + ${colLabel}`
  }

  const endTurnWrong = (text, cell) => {
    setLastWrong({ by: turn, text: text.trim(), why: reasonWrong(text, cell) })
    setShake(true)
    setTimeout(() => setShake(false), 400)
    setTurn(t => (t === 'X' ? 'O' : 'X'))
    setSelectedCell(null)
    setInput('')
  }

  // Skip your go: pass the turn to the other player without claiming a square.
  const skipTurn = () => {
    if (result != null) return
    setLastWrong({ by: turn, skipped: true })
    setTurn(t => (t === 'X' ? 'O' : 'X'))
    setSelectedCell(null)
    setInput('')
  }

  const submitGuess = (text) => {
    if (selectedCell == null || result != null) return
    const match = resolveGuess(text, grid.candidates[selectedCell], usedNames)
    if (!match) { endTurnWrong(text, selectedCell); return }

    const nextOwners = { ...owners, [selectedCell]: turn }
    setOwners(nextOwners)
    setCellPlayers(prev => ({ ...prev, [selectedCell]: match }))
    setSelectedCell(null)
    setInput('')
    setLastWrong(null)

    const win = getWinner(nextOwners)
    if (win) {
      setResult(win)
      setScores(s => ({ ...s, [win.mark]: s[win.mark] + 1 }))
    } else if (isFull(nextOwners)) {
      setResult('draw')
    } else {
      setTurn(t => (t === 'X' ? 'O' : 'X'))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!active) return
    if (highlightedIndex >= 0 && visibleSuggestions[highlightedIndex]) {
      submitGuess(visibleSuggestions[highlightedIndex].name); return
    }
    if (input.trim()) submitGuess(input.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (visibleSuggestions.length) { setDismissed(true); setHighlightedIndex(-1) }
      else setSelectedCell(null)
      return
    }
    if (!visibleSuggestions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, visibleSuggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)) }
  }

  const playAgain = () => {
    const nextStarter = starter === 'X' ? 'O' : 'X'
    setGrid(getRandomGrid())
    setOwners({}); setCellPlayers({})
    setStarter(nextStarter); setTurn(nextStarter)
    setSelectedCell(null); setInput(''); setResult(null); setLastWrong(null)
  }

  const winningLine = result && result !== 'draw' ? result.line : []

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-5">
        <button onClick={onBackToModes} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Modes</button>
        <div className="score-number text-xl text-gray-500 tracking-wider">1v1</div>
        <div className="flex items-center gap-2 text-sm tabular-nums">
          <span className={MARK_COLOR.X}>❌ {scores.X}</span>
          <span className="text-gray-700">·</span>
          <span className={MARK_COLOR.O}>⭕ {scores.O}</span>
        </div>
      </div>

      {/* Wrong-guess alert — clear, persistent, explains why */}
      {result == null && lastWrong && (
        lastWrong.skipped ? (
          <div className={`w-full max-w-lg mb-3 rounded-xl border border-gray-700 bg-gray-800/40 px-5 py-3 text-center ${shake ? 'shake' : ''}`}>
            <div className="text-gray-300 text-sm font-semibold">Player {MARK[lastWrong.by]} skipped their go</div>
            <div className="text-gray-500 text-xs mt-0.5">Turn passes to Player {MARK[turn]}.</div>
          </div>
        ) : (
          <div className={`w-full max-w-lg mb-3 rounded-xl border border-red-800 bg-red-900/25 px-5 py-3 text-center ${shake ? 'shake' : ''}`}>
            <div className="text-red-300 text-sm font-semibold">
              ✗ Wrong — Player {MARK[lastWrong.by]} guessed “{lastWrong.text}”
            </div>
            <div className="text-red-400/90 text-xs mt-0.5">
              {lastWrong.text} {lastWrong.why}. Turn passes to Player {MARK[turn]}.
            </div>
          </div>
        )
      )}

      {/* Turn / result banner */}
      <div className="w-full max-w-lg mb-5">
        {result == null ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-center">
            <div className="text-sm">
              <span className={`font-bold ${MARK_COLOR[turn]}`}>Player {MARK[turn]}</span>
              <span className="text-gray-400"> — claim a square by naming a player who fits both categories</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 text-center">
            {result === 'draw' ? (
              <div className="text-white font-bold">It's a draw — grid full, no three in a row.</div>
            ) : (
              <div className={`font-bold text-lg ${MARK_COLOR[result.mark]}`}>Player {MARK[result.mark]} wins! 🎉</div>
            )}
            <button onClick={playAgain} className="mt-3 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-5 py-2 transition-colors">
              Play again
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="w-full max-w-lg mb-6 overflow-x-auto">
        <div className="grid gap-1.5 mx-auto" style={{ gridTemplateColumns: `minmax(70px, 1fr) repeat(3, minmax(90px, 1fr))`, width: 'fit-content', minWidth: '100%' }}>
          <div />
          {grid.colCategories.map((cat, i) => (
            <div key={`col-${i}`} className="flex items-center justify-center text-center px-1 py-2 text-[10px] sm:text-xs font-bold text-blue-400 leading-tight">
              {categoryLabel(cat)}
            </div>
          ))}
          {[0, 1, 2].map(r => (
            <Fragment key={r}>
              <div className="flex items-center justify-center text-center px-1 text-[10px] sm:text-xs font-bold text-yellow-400 leading-tight">
                {categoryLabel(grid.rowCategories[r])}
              </div>
              {[0, 1, 2].map(c => {
                const idx = r * 3 + c
                const owner = owners[idx]
                const isSelected = selectedCell === idx
                const inWin = winningLine.includes(idx)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => selectCell(idx)}
                    disabled={result != null || !!owner}
                    className={`aspect-square w-full rounded-lg border flex flex-col items-center justify-center text-center px-1 transition-colors ${
                      owner
                        ? `${inWin ? 'border-green-500 bg-green-900/30' : owner === 'X' ? 'border-red-800 bg-red-900/15' : 'border-blue-800 bg-blue-900/15'} cell-reveal`
                        : isSelected
                          ? 'border-green-600 bg-gray-800 ring-2 ring-green-600/40'
                          : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    {owner ? (
                      <>
                        <span className="text-base sm:text-lg">{MARK[owner]}</span>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight mt-1 line-clamp-2">{cellPlayers[idx]}</span>
                      </>
                    ) : (
                      <span className="text-gray-700 text-xl">+</span>
                    )}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Input */}
      {active && (
        <>
          <div className="w-full max-w-lg mb-2 text-center text-xs text-gray-500">
            <span className="text-yellow-400 font-medium">{categoryLabel(grid.rowCategories[Math.floor(selectedCell / 3)])}</span>
            {' '}+{' '}
            <span className="text-blue-400 font-medium">{categoryLabel(grid.colCategories[selectedCell % 3])}</span>
          </div>
          <form onSubmit={handleSubmit} className={`relative w-full max-w-lg ${shake ? 'shake' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Player ${MARK[turn]} — type a name...`}
              autoFocus
              className="w-full bg-gray-900 border border-gray-700 focus:border-green-600 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-base outline-none transition-colors"
              autoComplete="off" autoCorrect="off" spellCheck="false"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin" />
              </div>
            )}
            {visibleSuggestions.length > 0 && (
              <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-10 shadow-2xl">
                {visibleSuggestions.map((item, i) => (
                  <button
                    key={item.name}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); submitGuess(item.name) }}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`w-full text-left px-4 py-2.5 transition-colors border-b border-gray-800/50 last:border-0 ${i === highlightedIndex ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}
                  >
                    <div className="flex items-center gap-2">
                      {item.flag && <span className="text-base shrink-0">{item.flag}</span>}
                      <span className="text-white text-sm font-medium truncate">{item.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
          <button type="button" onClick={() => setSelectedCell(null)} className="mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Cancel
          </button>
        </>
      )}

      {result == null && selectedCell == null && (
        <p className="text-gray-600 text-xs mt-1">Tap an empty square to take your turn. A wrong answer passes the turn — no square is lost.</p>
      )}

      {result == null && (
        <button
          type="button"
          onClick={skipTurn}
          className="mt-3 w-full max-w-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
        >
          Skip {MARK[turn]}’s go →
        </button>
      )}
    </div>
  )
}
