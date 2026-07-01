import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getDailyWordlePlayer, getRandomWordlePlayer } from '../../data/wordle'
import { SITE_URL } from '../../utils/site'
import { ShareCard } from '../../components/ShareCard'
import DailyStats from '../../components/DailyStats'
import ModeToggle from '../../components/ModeToggle'
import { recordResult } from '../../data/dailyStats'

const MAX_GUESSES = 6

const COLORS = {
  green:  { bg: '#16a34a', border: '#16a34a' }, // green-600
  yellow: { bg: '#ca8a04', border: '#ca8a04' }, // yellow-600
  grey:   { bg: '#374151', border: '#374151' }, // gray-700
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]

// Standard Wordle scoring: greens first, then yellows against remaining letters.
function evaluateGuess(guess, answer) {
  const result = Array(guess.length).fill('grey')
  const answerLetters = answer.split('')
  const used = Array(answer.length).fill(false)

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answerLetters[i]) {
      result[i] = 'green'
      used[i] = true
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'green') continue
    const idx = answerLetters.findIndex((l, j) => l === guess[i] && !used[j])
    if (idx !== -1) {
      result[i] = 'yellow'
      used[idx] = true
    }
  }
  return result
}

export default function FootballWordle() {
  const [mode, setMode] = useState('daily') // 'daily' | 'unlimited'
  const [question, setQuestion] = useState(() => getDailyWordlePlayer())
  const answer = question.surname

  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')
  const [phase, setPhase] = useState('playing') // 'playing' | 'won' | 'lost'
  const [dailyStats, setDailyStats] = useState(null)
  useEffect(() => {
    // Only Daily mode records stats/streaks.
    if (phase !== 'playing' && mode === 'daily') setDailyStats(recordResult('wordle', phase === 'won'))
  }, [phase, mode])

  const newGame = (m) => {
    setMode(m)
    setQuestion(m === 'daily' ? getDailyWordlePlayer() : getRandomWordlePlayer())
    setGuesses([]); setCurrent(''); setPhase('playing'); setDailyStats(null)
  }
  const [shake, setShake] = useState(false)
  const [flippingRow, setFlippingRow] = useState(null)
  const [bounceRow, setBounceRow] = useState(null)
  const [poppedIndex, setPoppedIndex] = useState(-1)

  const submitGuess = () => {
    const guess = current
    const row = guesses.length
    const win = guess === answer

    setGuesses(prev => [...prev, guess])
    setCurrent('')
    setFlippingRow(row)

    const revealDelay = answer.length * 100 + 500
    setTimeout(() => {
      setFlippingRow(null)
      if (win) {
        setBounceRow(row)
        setPhase('won')
        setTimeout(() => setBounceRow(null), 700)
      } else if (row + 1 >= MAX_GUESSES) {
        setPhase('lost')
      }
    }, revealDelay)
  }

  const handleKey = (key) => {
    if (phase !== 'playing' || flippingRow != null) return

    if (key === 'ENTER') {
      if (current.length !== answer.length) {
        setShake(true)
        setTimeout(() => setShake(false), 400)
        return
      }
      submitGuess()
    } else if (key === 'BACKSPACE') {
      setCurrent(c => c.slice(0, -1))
    } else if (/^[A-Z]$/.test(key) && current.length < answer.length) {
      const idx = current.length
      setCurrent(c => c + key)
      setPoppedIndex(idx)
      setTimeout(() => setPoppedIndex(-1), 100)
    }
  }

  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toUpperCase()
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        e.preventDefault()
        handleKey(key)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, flippingRow, current, guesses]) // eslint-disable-line react-hooks/exhaustive-deps

  const letterStatuses = useMemo(() => {
    const map = {}
    const rank = { grey: 0, yellow: 1, green: 2 }
    for (const guess of guesses) {
      const result = evaluateGuess(guess, answer)
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i]
        const status = result[i]
        if (!(letter in map) || rank[status] > rank[map[letter]]) map[letter] = status
      }
    }
    return map
  }, [guesses, answer])

  const shareGrid = guesses
    .map(g => evaluateGuess(g, answer).map(s => s === 'green' ? '🟩' : s === 'yellow' ? '🟨' : '⬜').join(''))
    .join('\n')

  const shareText = [
    `⚽ Football Wordle`,
    phase === 'won' ? `Guessed in ${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`,
    ...(phase === 'won' && dailyStats?.currentStreak ? [`🔥 ${dailyStats.currentStreak}-day streak`] : []),
    '',
    shareGrid,
    '',
    SITE_URL,
  ].join('\n')

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
          ← All games
        </Link>
        <div className="score-number text-xl text-gray-500 tracking-wider">WORDLE</div>
        <div className="text-sm text-gray-700 tabular-nums">{guesses.length}/{MAX_GUESSES}</div>
      </div>

      <ModeToggle mode={mode} onChange={newGame} className="mb-5" />

      {/* Hint card */}
      <div className="w-full max-w-lg mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div className="text-white font-bold text-sm">{mode === 'daily' ? "Guess today's footballer" : 'Guess the footballer'}</div>
          <div className="text-gray-500 text-xs mt-0.5">{answer.length}-letter surname · {MAX_GUESSES} guesses</div>
        </div>
      </div>

      {/* Grid — responsive: tiles shrink to fit long surnames on any screen */}
      <div className="w-full flex flex-col items-center gap-1.5 mb-6 mx-auto" style={{ maxWidth: `${Math.min(answer.length * 3.5, 30)}rem` }}>
        {Array.from({ length: MAX_GUESSES }).map((_, rowIdx) => {
          const guess = guesses[rowIdx]
          const isCurrent = rowIdx === guesses.length && phase === 'playing'
          const result = guess ? evaluateGuess(guess, answer) : null
          const isFlipping = flippingRow === rowIdx
          const isBouncing = bounceRow === rowIdx

          return (
            <div key={rowIdx} className={`grid gap-1.5 w-full ${isCurrent && shake ? 'shake' : ''}`} style={{ gridTemplateColumns: `repeat(${answer.length}, minmax(0, 1fr))` }}>
              {Array.from({ length: answer.length }).map((_, colIdx) => {
                let letter = ''
                let status = null
                if (guess) { letter = guess[colIdx]; status = result[colIdx] }
                else if (isCurrent) letter = current[colIdx] || ''

                const colors = status ? COLORS[status] : null
                const style = {}
                if (colors) {
                  if (isFlipping) {
                    style['--tile-bg'] = colors.bg
                    style['--tile-border'] = colors.border
                  } else {
                    style.backgroundColor = colors.bg
                    style.borderColor = colors.border
                  }
                }
                if (isFlipping) style.animationDelay = `${colIdx * 100}ms`
                else if (isBouncing) style.animationDelay = `${colIdx * 60}ms`
                style.fontSize = `clamp(0.8rem, ${(50 / answer.length).toFixed(1)}vw, 1.5rem)`

                return (
                  <div
                    key={colIdx}
                    style={style}
                    className={`w-full aspect-square border-2 rounded-md flex items-center justify-center font-bold uppercase text-white select-none
                      ${!colors ? (letter ? 'border-gray-500' : 'border-gray-800') : ''}
                      ${isFlipping ? 'tile-flip' : ''}
                      ${isBouncing ? 'tile-bounce' : ''}
                      ${isCurrent && poppedIndex === colIdx ? 'tile-pop' : ''}`}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* On-screen keyboard */}
      <div className="w-full max-w-lg flex flex-col gap-1.5 mb-6">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="flex gap-1.5 justify-center">
            {row.map(key => {
              const status = letterStatuses[key]
              const isWide = key === 'ENTER' || key === 'BACKSPACE'
              const bg = status === 'green'
                ? 'bg-green-600 text-white'
                : status === 'yellow'
                  ? 'bg-yellow-600 text-white'
                  : status === 'grey'
                    ? 'bg-gray-800 text-gray-500'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  disabled={phase !== 'playing'}
                  className={`${isWide ? 'px-2.5 text-[10px] sm:text-xs' : 'w-8 sm:w-10 text-sm'} h-11 sm:h-12 ${bg} font-semibold rounded-md flex items-center justify-center transition-colors`}
                >
                  {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'ENTER' : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {phase === 'won' && (
        <div className="w-full max-w-lg flex flex-col items-center text-center mb-6">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="score-number text-4xl text-green-400 mb-2">CORRECT!</h2>
          <p className="text-gray-400 mb-1">
            It was <span className="text-white font-bold">{question.fullName}</span> {question.flag}
          </p>
          <p className="text-gray-500 text-sm">
            Solved in <span className="text-white font-bold">{guesses.length}</span>/{MAX_GUESSES}
          </p>
          {mode === 'daily' && <DailyStats game="wordle" stats={dailyStats} />}
          <ShareCard text={shareText} />
          {mode === 'unlimited' && (
            <button onClick={() => newGame('unlimited')} className="mt-3 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">New word →</button>
          )}
        </div>
      )}

      {phase === 'lost' && (
        <div className="w-full max-w-lg flex flex-col items-center text-center mb-6">
          <div className="text-6xl mb-3">💔</div>
          <h2 className="score-number text-4xl text-red-400 mb-2">GAME OVER</h2>
          <p className="text-gray-400 mb-2">
            It was <span className="text-white font-bold">{question.fullName}</span> {question.flag}
          </p>
          {mode === 'daily' && <DailyStats game="wordle" stats={dailyStats} />}
          <ShareCard text={shareText} />
          {mode === 'unlimited' && (
            <button onClick={() => newGame('unlimited')} className="mt-3 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">New word →</button>
          )}
        </div>
      )}
    </div>
  )
}
