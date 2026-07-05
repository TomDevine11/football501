import { Fragment, useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getDailyGrid, getRandomGrid, categoryLabel, resolveGuess, findAssignment, normalizeName } from '../../data/tictactoe'
import { players as localPlayers } from '../../data/players'
import { getFlagFromNationality } from '../../utils/flags'
import { SITE_URL } from '../../utils/site'
import { ShareCard } from '../../components/ShareCard'
import DailyStats from '../../components/DailyStats'
import ModeToggle from '../../components/ModeToggle'
import MoreGames from '../../components/MoreGames'
import ResultModal from '../../components/ResultModal'
import CategoryIcon from '../../components/CategoryIcon'
import { recordResult } from '../../data/dailyStats'
import { useI18n } from '../../i18n'

const MAX_LIVES = 3

const TSDB = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p='
const EXCLUDE_SPORTS = new Set(['basketball','american football','baseball','ice hockey','tennis','golf','cricket','rugby','swimming','athletics','motorsport','cycling','boxing','mma'])

export default function FootballTicTacToe({ onBackToModes }) {
  const { t, lp } = useI18n()
  const [mode, setMode] = useState('daily') // 'daily' | 'unlimited'
  const [grid, setGrid] = useState(() => getDailyGrid())
  const [filled, setFilled] = useState({}) // cellIndex -> player name
  const [lives, setLives] = useState(MAX_LIVES)
  const [selectedCell, setSelectedCell] = useState(null)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [phase, setPhase] = useState('playing') // 'playing' | 'won' | 'lost'
  const [dailyStats, setDailyStats] = useState(null)
  useEffect(() => {
    // Only Daily mode records stats/streaks.
    if (phase !== 'playing' && mode === 'daily') setDailyStats(recordResult('tictactoe', phase === 'won'))
  }, [phase, mode])
  const [shake, setShake] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [gaveUp, setGaveUp] = useState(false)
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false)
  const [answersCell, setAnswersCell] = useState(null) // cell whose full answer list is open

  const newGame = (m) => {
    setMode(m)
    setGrid(m === 'daily' ? getDailyGrid() : getRandomGrid())
    setFilled({}); setLives(MAX_LIVES); setSelectedCell(null); setInput(''); setHistory([])
    setPhase('playing'); setDailyStats(null); setGaveUp(false); setShowGiveUpConfirm(false); setAnswersCell(null); setShowResult(false)
  }
  const [showResult, setShowResult] = useState(false)
  useEffect(() => {
    if (phase === 'playing') return
    const t = setTimeout(() => setShowResult(true), 2500) // let the revealed grid show first
    return () => clearTimeout(t)
  }, [phase])
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const usedNames = useMemo(() => new Set(Object.values(filled)), [filled])

  // ── Win / lose checks ────────────────────────────────────────────
  useEffect(() => {
    if (Object.keys(filled).length === 9 && phase === 'playing') {
      const t = setTimeout(() => setPhase('won'), 400)
      return () => clearTimeout(t)
    }
  }, [filled, phase])

  useEffect(() => {
    if (lives <= 0 && phase === 'playing') {
      const t = setTimeout(() => setPhase('lost'), 500)
      return () => clearTimeout(t)
    }
  }, [lives, phase])

  // ── Reveal assignment for unfilled cells once the game ends ───────
  const revealAssignment = useMemo(() => {
    if (phase === 'playing') return null
    // Reveal famous example answers (the NOTABLE set), not obscure ones.
    return findAssignment(grid.reveal, usedNames) || []
  }, [phase, grid.reveal, usedNames])

  // ── Suggestions dropdown ──────────────────────────────────────────
  // Searches the full player universe (TheSportsDB + local lists), NOT just
  // this cell's valid answers — otherwise the dropdown would give the puzzle
  // away. Picking from it just disambiguates spelling/surnames; whether it's
  // actually correct is checked separately against the cell's candidates.
  const [apiPlayers, setApiPlayers] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (phase !== 'playing' || selectedCell == null) {
      setApiPlayers([]); setIsSearching(false); return
    }
    if (normalizeName(input).length < 2) { setApiPlayers([]); setIsSearching(false); return }

    setIsSearching(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(TSDB + encodeURIComponent(input), { signal: controller.signal })
        const data = await res.json()
        const fetched = (data.player || [])
          .filter(p => !EXCLUDE_SPORTS.has((p.strSport || '').toLowerCase()))
          .map(p => ({ name: p.strPlayer, flag: getFlagFromNationality(p.strNationality) }))
        setApiPlayers(fetched)
      } catch (err) {
        if (err.name !== 'AbortError') setApiPlayers([])
      } finally {
        setIsSearching(false)
      }
    }, 280)
    return () => { clearTimeout(timer); controller.abort(); setIsSearching(false) }
  }, [input, phase, selectedCell])

  const suggestions = useMemo(() => {
    if (phase !== 'playing' || selectedCell == null) return []
    const norm = normalizeName(input)
    if (norm.length < 2) return []

    const localMatches = localPlayers
      .filter(p => normalizeName(p.name).includes(norm))
      .map(p => ({ name: p.name, flag: p.flag }))

    const seen = new Set()
    const merged = []
    for (const p of [...apiPlayers, ...localMatches]) {
      const key = normalizeName(p.name)
      if (seen.has(key) || usedNames.has(p.name)) continue
      seen.add(key)
      merged.push(p)
    }

    const rank = (name) => {
      const n = normalizeName(name)
      if (n.startsWith(norm)) return 0
      if (n.split(' ').some(w => w.startsWith(norm))) return 1
      return 2
    }
    merged.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))

    return merged.slice(0, 8)
  }, [input, phase, selectedCell, apiPlayers, usedNames])

  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    setHighlightedIndex(-1)
    setDismissed(false)
  }, [input])

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
    if (phase !== 'playing' || filled[idx] != null) return
    setSelectedCell(idx)
    setInput('')
    setHighlightedIndex(-1)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const submitGuess = (text) => {
    if (selectedCell == null) return
    const candidates = grid.candidates[selectedCell]
    const match = resolveGuess(text, candidates, usedNames)

    if (match) {
      setFilled(prev => ({ ...prev, [selectedCell]: match }))
      setHistory(prev => [...prev, { text, correct: true, cell: selectedCell, name: match }])
      setSelectedCell(null)
    } else {
      setHistory(prev => [...prev, { text, correct: false, cell: selectedCell }])
      setLives(l => Math.max(0, l - 1))
      setShake(true)
      setTimeout(() => setShake(false), 400)
    }
    setInput('')
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (phase !== 'playing' || selectedCell == null) return

    if (highlightedIndex >= 0 && visibleSuggestions[highlightedIndex]) {
      submitGuess(visibleSuggestions[highlightedIndex].name)
      return
    }
    if (!input.trim()) return
    submitGuess(input.trim())
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

  const confirmGiveUp = () => {
    setGaveUp(true)
    setPhase('lost')
    setShowGiveUpConfirm(false)
    setSelectedCell(null)
  }

  const filledCount = Object.keys(filled).length
  const shareGrid = Array.from({ length: 9 }, (_, i) => (filled[i] != null ? '🟩' : '⬜'))
  const shareRows = [shareGrid.slice(0, 3), shareGrid.slice(3, 6), shareGrid.slice(6, 9)].map(r => r.join(''))

  const shareText = [
    t('share.tttTitle'),
    t('share.tttScore', { n: filledCount, lost: MAX_LIVES - lives, max: MAX_LIVES }),
    ...(phase === 'won' && dailyStats?.currentStreak ? [t('share.dayStreak', { n: dailyStats.currentStreak })] : []),
    '',
    ...shareRows,
    '',
    SITE_URL,
  ].join('\n')

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        {onBackToModes ? (
          <button onClick={onBackToModes} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
            {t('tictactoe.modes')}
          </button>
        ) : (
          <Link to={lp('/')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
            {t('common.allGames')}
          </Link>
        )}
        <div className="score-number text-xl text-gray-500 tracking-wider">{t('tictactoe.wordmark')}</div>
        <div className="flex items-center gap-1 text-sm tabular-nums">
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <span key={i} className={i < lives ? 'text-red-500' : 'text-gray-700'}>♥</span>
          ))}
        </div>
      </div>

      <ModeToggle mode={mode} onChange={newGame} className="mb-5" />

      {/* Intro card */}
      <div className="w-full max-w-lg mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div className="text-white font-bold text-sm">{t('tictactoe.fillEvery')}</div>
          <div className="text-gray-500 text-xs mt-0.5">{t('tictactoe.fillEverySub')}</div>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full max-w-lg mb-6 overflow-x-auto">
        <div
          className="grid gap-1.5 mx-auto"
          style={{ gridTemplateColumns: `minmax(70px, 1fr) repeat(3, minmax(90px, 1fr))`, width: 'fit-content', minWidth: '100%' }}
        >
          {/* corner */}
          <div />
          {/* column headers */}
          {grid.colCategories.map((cat, i) => (
            <div key={`col-${i}`} className="flex flex-col items-center justify-center text-center px-1 py-2 gap-1 text-[10px] sm:text-xs font-bold text-blue-400 leading-tight">
              <CategoryIcon category={cat} size={24} />
              <span>{categoryLabel(cat, t)}</span>
            </div>
          ))}

          {/* rows */}
          {[0, 1, 2].map(r => (
            <Fragment key={r}>
              <div className="flex flex-col items-center justify-center text-center px-1 gap-1 text-[10px] sm:text-xs font-bold text-yellow-400 leading-tight">
                <CategoryIcon category={grid.rowCategories[r]} size={24} />
                <span>{categoryLabel(grid.rowCategories[r], t)}</span>
              </div>
              {[0, 1, 2].map(c => {
                const idx = r * 3 + c
                const playerName = filled[idx]
                const gameOver = phase !== 'playing'
                const revealName = !playerName && gameOver ? revealAssignment?.[idx] : null
                const isSelected = selectedCell === idx
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => gameOver ? setAnswersCell(idx) : selectCell(idx)}
                    disabled={phase === 'playing' && !!playerName}
                    className={`relative aspect-square w-full rounded-lg border flex flex-col items-center justify-center text-center px-1 transition-colors ${
                      gameOver ? 'cursor-pointer hover:ring-1 hover:ring-gray-500' : ''
                    } ${
                      playerName
                        ? 'border-green-600 bg-green-900/20 cell-reveal'
                        : revealName
                          ? 'border-red-900 bg-red-900/10'
                          : isSelected
                            ? 'border-green-600 bg-gray-800 ring-2 ring-green-600/40'
                            : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    {gameOver && <span className="absolute top-1 right-1 text-[10px] opacity-50">🔍</span>}
                    {playerName ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-green-400">
                          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[10px] sm:text-xs font-bold text-white leading-tight mt-1 line-clamp-2">{playerName}</span>
                      </>
                    ) : revealName ? (
                      <span className="text-[10px] sm:text-xs font-medium text-gray-400 leading-tight line-clamp-2">{revealName}</span>
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

      {phase !== 'playing' && (
        <div className="w-full max-w-lg -mt-3 mb-4 text-center text-xs text-gray-500">
          {t('tictactoe.tapSquare')}
        </div>
      )}

      {phase === 'playing' && selectedCell != null && (
        <>
          <div className="w-full max-w-lg mb-2 text-center text-xs text-gray-500">
            <span className="text-yellow-400 font-medium">{categoryLabel(grid.rowCategories[Math.floor(selectedCell / 3)], t)}</span>
            {' '}+{' '}
            <span className="text-blue-400 font-medium">{categoryLabel(grid.colCategories[selectedCell % 3], t)}</span>
          </div>
          <form onSubmit={handleSubmit} className={`relative w-full max-w-lg ${shake ? 'shake' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('tictactoe.placeholder')}
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
          <button
            type="button"
            onClick={() => setSelectedCell(null)}
            className="mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </>
      )}

      {phase === 'playing' && (
        <>
          <div className="w-full max-w-lg mt-3 flex justify-between items-center text-xs text-gray-700 px-1">
            <span>{t('tictactoe.squares', { n: filledCount })}</span>
            <span>{lives === 1 ? t('tictactoe.lifeLeft', { n: lives }) : t('tictactoe.livesLeft', { n: lives })}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowGiveUpConfirm(true)}
            className="mt-4 w-full max-w-lg border border-red-900/60 text-red-400 hover:bg-red-900/20 hover:border-red-700 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
          >
            {t('tictactoe.giveUp')}
          </button>
        </>
      )}

      {showGiveUpConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-20 px-4">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-white font-medium mb-1">{t('tictactoe.giveUpTitle')}</p>
            <p className="text-gray-500 text-sm mb-5">{t('tictactoe.giveUpBody')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowGiveUpConfirm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmGiveUp}
                className="flex-1 bg-red-900/60 hover:bg-red-900 text-red-200 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              >
                {t('tictactoe.giveUpConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All-answers reveal for a finished square */}
      {answersCell != null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30 px-4" onClick={() => setAnswersCell(null)}>
          <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl p-5 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-1 leading-tight">
              <span className="text-yellow-400 text-xs font-medium">{categoryLabel(grid.rowCategories[Math.floor(answersCell / 3)], t)}</span>
              <span className="text-gray-600 text-xs"> + </span>
              <span className="text-blue-400 text-xs font-medium">{categoryLabel(grid.colCategories[answersCell % 3], t)}</span>
            </div>
            <div className="text-gray-500 text-xs text-center mb-3">{t('tictactoe.possibleAnswers', { n: grid.candidates[answersCell].length })}</div>
            <div className="overflow-y-auto -mx-1 px-1">
              <div className="grid grid-cols-2 gap-1.5">
                {grid.candidates[answersCell].map(name => (
                  <div
                    key={name}
                    className={`text-xs rounded px-2 py-1.5 leading-tight ${
                      name === filled[answersCell] ? 'bg-green-900/50 text-green-300 font-semibold' : 'bg-gray-800/60 text-gray-300'
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAnswersCell(null)}
              className="mt-4 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
            >
              {t('tictactoe.close')}
            </button>
          </div>
        </div>
      )}

      {phase !== 'playing' && !showResult && (
        <button onClick={() => setShowResult(true)} className="mt-2 mb-6 text-sm text-green-400 hover:text-green-300 font-medium transition-colors">{t('common.seeResult')}</button>
      )}

      <ResultModal open={showResult} onClose={() => setShowResult(false)}>
        {phase === 'won' && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="score-number text-4xl text-green-400 mb-2">{t('tictactoe.gridComplete')}</h2>
            <p className="text-gray-400 mb-2">{lives === 1 ? t('tictactoe.filledAllLife', { n: lives }) : t('tictactoe.filledAllLives', { n: lives })}</p>
          </div>
        )}
        {phase === 'lost' && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="text-6xl mb-3">{gaveUp ? '🏳️' : '💔'}</div>
            <h2 className="score-number text-4xl text-red-400 mb-2">{gaveUp ? t('tictactoe.gaveUp') : t('tictactoe.gameOver')}</h2>
            <p className="text-gray-400 mb-2">{gaveUp ? t('tictactoe.filledBeforeGaveUp', { n: filledCount }) : t('tictactoe.filledBeforeLost', { n: filledCount })}</p>
          </div>
        )}
        {mode === 'daily' && <DailyStats game="tictactoe" stats={dailyStats} />}
        <ShareCard text={shareText} />
        <button onClick={() => newGame('unlimited')} className="mt-3 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">{mode === 'daily' ? t('common.playUnlimited') : t('tictactoe.newGrid')}</button>
        <MoreGames current="/tictactoe" />
      </ResultModal>

      {/* Guess history */}
      {history.length > 0 && (
        <div className="w-full max-w-lg mt-2">
          <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">
            {t('tictactoe.guesses', { n: history.length })}
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-800/40 max-h-56 overflow-y-auto">
              {[...history].reverse().map((g, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${g.correct === true ? 'flash-valid' : 'flash-invalid'}`}>
                  <span className="text-sm text-white truncate">{g.text}</span>
                  {g.correct === true
                    ? <span className="text-green-400 text-xs font-semibold shrink-0">{t('tictactoe.square', { n: g.cell + 1 })}</span>
                    : <span className="text-red-500 text-xs font-semibold shrink-0">✗</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

