import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getRandomTournament, YEARS, MAX_CLUES } from '../../data/worldcup'

export default function WorldCupGuess() {
  const [target, setTarget] = useState(() => getRandomTournament())
  const [revealed, setRevealed] = useState(1)
  const [guessed, setGuessed] = useState([])      // years clicked, in order
  const [phase, setPhase] = useState('playing')   // 'playing' | 'won' | 'lost'

  const guessSet = new Set(guessed)
  const guessesLeft = MAX_CLUES - guessed.length
  const cluesToShow = phase === 'playing' ? revealed : MAX_CLUES

  const guessYear = (y) => {
    if (phase !== 'playing' || guessSet.has(y)) return
    const next = [...guessed, y]
    setGuessed(next)
    if (y === target.year) { setPhase('won'); return }
    if (revealed < MAX_CLUES) setRevealed(r => r + 1)
    else setPhase('lost')
  }

  const newGame = () => {
    setTarget(getRandomTournament())
    setRevealed(1); setGuessed([]); setPhase('playing')
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-5">
        <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← All games</Link>
        <div className="score-number text-xl text-gray-500 tracking-wider">WORLD CUP</div>
        <div className="text-sm tabular-nums text-gray-500">{phase === 'playing' ? `${guessesLeft} left` : ''}</div>
      </div>

      <div className="w-full max-w-lg mb-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div className="text-white font-bold text-sm">Which World Cup is this?</div>
          <div className="text-gray-500 text-xs mt-0.5">A new clue is revealed after each wrong guess. Pick the year — you have {MAX_CLUES} tries.</div>
        </div>
      </div>

      {/* Clues */}
      <div className="w-full max-w-lg mb-5">
        <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">Clues</div>
        <div className="space-y-2">
          {target.clues.slice(0, cluesToShow).map((clue, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 clue-reveal">
              <span className="text-gray-600 text-xs font-bold w-5 tabular-nums">{i + 1}</span>
              <div className="text-white text-sm font-medium">{clue}</div>
            </div>
          ))}
          {phase === 'playing' && revealed < MAX_CLUES && (
            <div className="text-center text-gray-700 text-xs py-1">+{MAX_CLUES - revealed} more clue{MAX_CLUES - revealed === 1 ? '' : 's'} hidden</div>
          )}
        </div>
      </div>

      {/* Year picker */}
      <div className="w-full max-w-lg mb-6">
        <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">Pick the year</div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {YEARS.map(y => {
            const isGuessed = guessSet.has(y)
            const isCorrect = isGuessed && y === target.year
            const isWrong = isGuessed && y !== target.year
            const revealCorrect = phase !== 'playing' && y === target.year
            return (
              <button
                key={y}
                type="button"
                onClick={() => guessYear(y)}
                disabled={phase !== 'playing' || isGuessed}
                className={`rounded-lg py-2 text-sm font-semibold tabular-nums border transition-colors ${
                  isCorrect || revealCorrect
                    ? 'border-green-500 bg-green-900/40 text-green-300'
                    : isWrong
                      ? 'border-red-900 bg-red-900/20 text-red-500 line-through'
                      : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-600 disabled:opacity-50'
                }`}
              >
                {y}
              </button>
            )
          })}
        </div>
      </div>

      {/* Result */}
      {phase !== 'playing' && (
        <div className="w-full max-w-lg flex flex-col items-center text-center mt-1 mb-4">
          <div className="text-5xl mb-2">{phase === 'won' ? '🏆' : '💔'}</div>
          <h2 className={`score-number text-3xl mb-1 ${phase === 'won' ? 'text-green-400' : 'text-red-400'}`}>
            {phase === 'won' ? 'CORRECT!' : 'OUT OF GUESSES'}
          </h2>
          <p className="text-gray-400 mb-1">
            It was <span className="text-white font-bold">{target.summary}</span>
            {phase === 'won' && <> — in {guessed.length} {guessed.length === 1 ? 'guess' : 'guesses'}</>}.
          </p>
          <button onClick={newGame} className="mt-4 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">
            New tournament
          </button>
        </div>
      )}
    </div>
  )
}
