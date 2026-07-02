import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getRandomTarget, getDailyTarget, matchesTarget, MAX_CLUES } from '../../data/careers'
import { usePlayerSuggestions } from '../tictactoe/usePlayerSuggestions'
import { ShareCard } from '../../components/ShareCard'
import Crest from '../../components/Crest'
import DailyStats from '../../components/DailyStats'
import ModeToggle from '../../components/ModeToggle'
import MoreGames from '../../components/MoreGames'
import ResultModal from '../../components/ResultModal'
import { recordResult } from '../../data/dailyStats'
import { SITE_URL } from '../../utils/site'

export default function CareerPath() {
  const [mode, setMode] = useState('daily')        // 'daily' | 'unlimited'
  const [target, setTarget] = useState(() => getDailyTarget())
  const [revealed, setRevealed] = useState(1)
  const [guesses, setGuesses] = useState([])
  const [input, setInput] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dismissed, setDismissed] = useState(false)
  const [phase, setPhase] = useState('playing') // 'playing' | 'won' | 'lost'
  const [shake, setShake] = useState(false)
  const [dailyStats, setDailyStats] = useState(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const active = phase === 'playing'
  // Only Daily mode records stats/streaks.
  useEffect(() => {
    if (phase !== 'playing' && mode === 'daily') setDailyStats(recordResult('careers', phase === 'won'))
  }, [phase, mode])
  const usedNames = useMemo(() => new Set(), [])
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

  const submitGuess = (text) => {
    if (!active || !text.trim()) return
    setInput('')
    if (matchesTarget(target.name, text)) {
      setGuesses(g => [...g, { text, correct: true }])
      setPhase('won')
      return
    }
    setGuesses(g => [...g, { text, correct: false }])
    setShake(true); setTimeout(() => setShake(false), 400)
    if (revealed < MAX_CLUES) setRevealed(r => r + 1)
    else setPhase('lost')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!active) return
    if (highlightedIndex >= 0 && visibleSuggestions[highlightedIndex]) { submitGuess(visibleSuggestions[highlightedIndex].name); return }
    if (input.trim()) submitGuess(input.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setDismissed(true); setHighlightedIndex(-1); return }
    if (!visibleSuggestions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, visibleSuggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)) }
  }

  // Skip this go: reveal the next club but still use one of your tries.
  const skip = () => {
    if (!active) return
    setInput('')
    setGuesses(g => [...g, { text: 'Skipped', correct: false, skipped: true }])
    if (revealed < MAX_CLUES) setRevealed(r => r + 1)
    else setPhase('lost')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const [showResult, setShowResult] = useState(false)
  useEffect(() => {
    if (phase === 'playing') return
    const t = setTimeout(() => setShowResult(true), 2500)
    return () => clearTimeout(t)
  }, [phase])

  const newGame = (m) => {
    setMode(m)
    setTarget(m === 'daily' ? getDailyTarget() : getRandomTarget())
    setRevealed(1); setGuesses([]); setInput(''); setPhase('playing'); setHighlightedIndex(-1); setDailyStats(null); setShowResult(false)
  }

  const cluesToShow = phase === 'playing' ? revealed : MAX_CLUES
  const guessesLeft = MAX_CLUES - guesses.length

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-5">
        <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← All games</Link>
        <div className="score-number text-xl text-gray-500 tracking-wider">CAREER PATH</div>
        <div className="text-sm tabular-nums text-gray-500">{phase === 'playing' ? `${guessesLeft} left` : ''}</div>
      </div>

      <ModeToggle mode={mode} onChange={newGame} className="mb-5" />

      <div className="w-full max-w-lg mb-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div className="text-white font-bold text-sm">Whose career path is this?</div>
          <div className="text-gray-500 text-xs mt-0.5">Guess the player who played for every club shown. Each wrong guess reveals another club — you have {MAX_CLUES} tries.</div>
        </div>
      </div>

      {/* Career path */}
      <div className="w-full max-w-lg mb-5">
        <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">Has played for</div>
        <div className="space-y-2">
          {target.clues.slice(0, cluesToShow).map((clue, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 clue-reveal">
              <span className="text-gray-600 text-xs font-bold w-5 tabular-nums">{i + 1}</span>
              <Crest name={clue.club} size={30} />
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate">{clue.club}</div>
                {clue.years && <div className="text-gray-500 text-xs">{clue.years}</div>}
              </div>
            </div>
          ))}
          {phase === 'playing' && revealed < MAX_CLUES && (
            <div className="text-center text-gray-700 text-xs py-1">+{MAX_CLUES - revealed} more club{MAX_CLUES - revealed === 1 ? '' : 's'} hidden</div>
          )}
        </div>
      </div>

      {active && (
        <form onSubmit={handleSubmit} className={`relative w-full max-w-lg ${shake ? 'shake' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Who is it? Type a player's name..."
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
      )}

      {active && (
        <button
          type="button"
          onClick={skip}
          className="mt-3 w-full max-w-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
        >
          Skip this clue →
        </button>
      )}

      {phase !== 'playing' && !showResult && (
        <button onClick={() => setShowResult(true)} className="mt-1 mb-4 text-sm text-green-400 hover:text-green-300 font-medium transition-colors">↑ See result &amp; more games</button>
      )}

      <ResultModal open={showResult} onClose={() => setShowResult(false)}>
        <div className="w-full flex flex-col items-center text-center">
          <div className="text-5xl mb-2">{phase === 'won' ? '🎉' : '💔'}</div>
          <h2 className={`score-number text-3xl mb-1 ${phase === 'won' ? 'text-green-400' : 'text-red-400'}`}>
            {phase === 'won' ? 'CORRECT!' : 'OUT OF GUESSES'}
          </h2>
          <p className="text-gray-400 mb-3">
            The mystery player was <span className="text-white font-bold">{target.name}</span>
            {phase === 'won' && guesses.length > 0 && <> — in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}</>}.
          </p>
          {mode === 'daily' && <DailyStats game="careers" stats={dailyStats} />}
          <ShareCard text={[
            phase === 'won'
              ? `🧭 Career Path — I guessed the player in ${guesses.length}/${MAX_CLUES} clubs!`
              : `🧭 Career Path — it stumped me. Can you guess the player from their career?`,
            SITE_URL,
          ].join('\n\n')} />
          <button onClick={() => newGame('unlimited')} className="mt-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">{mode === 'daily' ? 'Play Unlimited →' : 'New player →'}</button>
          {mode === 'daily' && <p className="text-gray-600 text-xs mt-3">Come back tomorrow for a new daily.</p>}
        </div>
        <MoreGames current="/career-path" />
      </ResultModal>

      {guesses.length > 0 && (
        <div className="w-full max-w-lg mt-4">
          <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">Your guesses</div>
          <div className="rounded-xl border border-gray-800 overflow-hidden divide-y divide-gray-800/40">
            {guesses.map((g, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${g.correct ? 'flash-valid' : g.skipped ? '' : 'flash-invalid'}`}>
                <span className={`text-sm truncate ${g.skipped ? 'text-gray-500 italic' : 'text-white'}`}>{g.text}</span>
                <span className={`text-xs font-semibold shrink-0 ${g.correct ? 'text-green-400' : g.skipped ? 'text-gray-500' : 'text-red-500'}`}>{g.correct ? '✓' : g.skipped ? '↷' : '✗'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
