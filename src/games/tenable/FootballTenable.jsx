import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getDailyTenableQuestion, getRandomTenableQuestion } from '../../data/tenable'
import { players as localPlayers } from '../../data/players'
import { clubs } from '../../data/clubs'
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

// Maps each question to the club crest / league logo / flag / trophy icon that
// represents its subject (shown on the question card). Questions with no natural
// icon (transfers, all-international) keep their emoji.
const QUESTION_ICON = {
  'wc-top-scorers': { type: 'trophy', value: 'FIFA World Cup' },
  'pl-top-scorers': { type: 'league', value: 'Premier League' },
  'ucl-top-scorers': { type: 'trophy', value: 'UEFA Champions League' },
  'ballon-dor-most-wins': { type: 'trophy', value: "Ballon d'Or" },
  'england-top-scorers': { type: 'nationality', value: 'England' },
  'ecl-most-titles': { type: 'trophy', value: 'UEFA Champions League' },
  'laliga-top-scorers': { type: 'league', value: 'La Liga' },
  'pl-most-appearances': { type: 'league', value: 'Premier League' },
  'pl-most-hattricks': { type: 'league', value: 'Premier League' },
  'brazil-top-scorers': { type: 'nationality', value: 'Brazil' },
  'real-madrid-top-scorers': { type: 'club', value: 'Real Madrid' },
  'pl-titles-clubs': { type: 'league', value: 'Premier League' },
  'pl-assists': { type: 'league', value: 'Premier League' },
  'pl-clean-sheets': { type: 'league', value: 'Premier League' },
  'bundesliga-top-scorers': { type: 'league', value: 'Bundesliga' },
  'pl-red-cards': { type: 'league', value: 'Premier League' },
  'france-top-scorers': { type: 'nationality', value: 'France' },
  'liverpool-top-scorers': { type: 'club', value: 'Liverpool' },
  'barcelona-top-scorers': { type: 'club', value: 'FC Barcelona' },
  'man-utd-top-scorers': { type: 'club', value: 'Manchester United' },
  'serie-a-top-scorers': { type: 'league', value: 'Serie A' },
}

const MAX_LIVES = 3

const TSDB = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p='
const EXCLUDE_SPORTS = new Set(['basketball','american football','baseball','ice hockey','tennis','golf','cricket','rugby','swimming','athletics','motorsport','cycling','boxing','mma'])

// Pyramid shape, top to bottom: 1 → 2 → 3 → 4 cells (10 total)
const ROWS = [[1], [2, 3], [4, 5, 6], [7, 8, 9, 10]]

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function answerMatches(guessNorm, answer) {
  if (!guessNorm) return false
  const candidates = [answer.text, ...(answer.aliases || [])].map(normalize)
  if (candidates.includes(guessNorm)) return true
  // Allow surname-only guesses against the full name
  const lastWord = normalize(answer.text).split(' ').pop()
  return guessNorm === lastWord
}

export default function FootballTenable() {
  const { t, lp } = useI18n()
  const [mode, setMode] = useState('daily') // 'daily' | 'unlimited'
  const [question, setQuestion] = useState(() => getDailyTenableQuestion())
  const [revealed, setRevealed] = useState({}) // rank -> answer
  const [lives, setLives] = useState(MAX_LIVES)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [phase, setPhase] = useState('playing') // 'playing' | 'won' | 'lost'
  const [dailyStats, setDailyStats] = useState(null)
  useEffect(() => {
    // Only Daily mode records stats/streaks.
    if (phase !== 'playing' && mode === 'daily') setDailyStats(recordResult('tenable', phase === 'won'))
  }, [phase, mode])

  const newGame = (m) => {
    setMode(m)
    setQuestion(m === 'daily' ? getDailyTenableQuestion() : getRandomTenableQuestion())
    setRevealed({}); setLives(MAX_LIVES); setInput(''); setHistory([])
    setPhase('playing'); setDailyStats(null); setGaveUp(false); setShowGiveUpConfirm(false)
    setPendingRank(null); setPendingAnswer(null); setPulseRow(null); setShowResult(false)
  }
  const [showResult, setShowResult] = useState(false)
  useEffect(() => {
    if (phase === 'playing') return
    const t = setTimeout(() => setShowResult(true), 2500) // let the revealed answers show first
    return () => clearTimeout(t)
  }, [phase])
  const [pulseRow, setPulseRow] = useState(null)
  const [pendingRank, setPendingRank] = useState(null)
  const [pendingAnswer, setPendingAnswer] = useState(null) // what to reveal at pendingRank (for tie-pool fills)
  const [shake, setShake] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [gaveUp, setGaveUp] = useState(false)
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const answersByRank = Object.fromEntries(question.answers.map(a => [a.rank, a]))

  // ── Bottom-to-rank "counting" reveal animation ─────────────────
  useEffect(() => {
    if (pendingRank == null) return
    const targetRow = ROWS.findIndex(r => r.includes(pendingRank))
    let step = ROWS.length - 1
    let timer

    const tick = () => {
      setPulseRow(step)
      if (step === targetRow) {
        timer = setTimeout(() => {
          setRevealed(prev => ({ ...prev, [pendingRank]: pendingAnswer || answersByRank[pendingRank] }))
          setPulseRow(null)
          setPendingRank(null)
          setPendingAnswer(null)
        }, 350)
      } else {
        step -= 1
        timer = setTimeout(tick, 160)
      }
    }
    tick()
    return () => clearTimeout(timer)
  }, [pendingRank]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Win / lose checks ────────────────────────────────────────────
  useEffect(() => {
    if (Object.keys(revealed).length === 10 && phase === 'playing') {
      const t = setTimeout(() => setPhase('won'), 500)
      return () => clearTimeout(t)
    }
  }, [revealed, phase])

  useEffect(() => {
    if (lives <= 0 && phase === 'playing') {
      const t = setTimeout(() => setPhase('lost'), 600)
      return () => clearTimeout(t)
    }
  }, [lives, phase])

  // ── Suggestions dropdown ─────────────────────────────────────────
  // Searches the full player/club universe (TheSportsDB + local lists),
  // NOT just this question's answers — otherwise the dropdown would give
  // the puzzle away. Picking from it just disambiguates spelling/surnames.
  const [apiPlayers, setApiPlayers] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (question.type !== 'player' || phase !== 'playing' || pendingRank != null) {
      setApiPlayers([]); setIsSearching(false); return
    }
    if (normalize(input).length < 2) { setApiPlayers([]); setIsSearching(false); return }

    setIsSearching(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(TSDB + encodeURIComponent(input), { signal: controller.signal })
        const data = await res.json()
        const players = (data.player || [])
          .filter(p => !EXCLUDE_SPORTS.has((p.strSport || '').toLowerCase()))
          .map(p => ({ name: p.strPlayer, flag: getFlagFromNationality(p.strNationality) }))
        setApiPlayers(players)
      } catch (err) {
        if (err.name !== 'AbortError') setApiPlayers([])
      } finally {
        setIsSearching(false)
      }
    }, 280)
    return () => { clearTimeout(timer); controller.abort(); setIsSearching(false) }
  }, [input, phase, pendingRank, question.type])

  const suggestions = useMemo(() => {
    if (phase !== 'playing' || pendingRank != null) return []
    const norm = normalize(input)
    if (norm.length < 2) return []

    if (question.type === 'club') {
      return clubs
        .filter(c => normalize(c).includes(norm))
        .slice(0, 8)
        .map(name => ({ name }))
    }

    const localMatches = localPlayers
      .filter(p => normalize(p.name).includes(norm))
      .map(p => ({ name: p.name, flag: p.flag }))

    const seen = new Set()
    const merged = []
    for (const p of [...apiPlayers, ...localMatches]) {
      const key = normalize(p.name)
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(p)
    }

    const rank = (name) => {
      const n = normalize(name)
      if (n.startsWith(norm)) return 0
      if (n.split(' ').some(w => w.startsWith(norm))) return 1
      return 2
    }
    merged.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))

    return merged.slice(0, 8)
  }, [input, phase, pendingRank, question.type, apiPlayers])

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

  const submitGuess = (text) => {
    const norm = normalize(text)
    if (!norm) return
    const match = question.answers.find(a => answerMatches(norm, a))
    // Tie-pool match: a player/club tied at the cutoff value who isn't one of the
    // listed 10 but is equally valid for a joint slot (e.g. any club with 2
    // European Cups). They fill the lowest unfilled tied slot.
    const pooled = !match && question.tieValue != null
      ? (question.tiePool || []).find(p => answerMatches(norm, p))
      : null
    const alreadyNamed = pooled && Object.values(revealed).some(a => normalize(a.text) === normalize(pooled.text))
    const tieSlot = pooled && !alreadyNamed
      ? question.answers.find(a => a.value === question.tieValue && !revealed[a.rank] && pendingRank !== a.rank)
      : null

    if (match && revealed[match.rank]) {
      setHistory(prev => [...prev, { text, correct: 'duplicate' }])
    } else if (match) {
      setHistory(prev => [...prev, { text, correct: true, rank: match.rank }])
      setPendingRank(match.rank)
    } else if (pooled && (alreadyNamed || !tieSlot)) {
      setHistory(prev => [...prev, { text, correct: 'duplicate' }])
    } else if (tieSlot) {
      setHistory(prev => [...prev, { text, correct: true, rank: tieSlot.rank }])
      setPendingAnswer({ rank: tieSlot.rank, text: pooled.text, detail: tieSlot.detail })
      setPendingRank(tieSlot.rank)
    } else {
      setHistory(prev => [...prev, { text, correct: false }])
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
    if (phase !== 'playing' || pendingRank != null) return

    if (highlightedIndex >= 0 && visibleSuggestions[highlightedIndex]) {
      submitGuess(visibleSuggestions[highlightedIndex].name)
      return
    }
    if (!input.trim()) return
    submitGuess(input.trim())
  }

  const handleSelectSuggestion = (item) => submitGuess(item.name)

  const confirmGiveUp = () => {
    setGaveUp(true)
    setPhase('lost')
    setShowGiveUpConfirm(false)
  }

  const handleKeyDown = (e) => {
    if (!visibleSuggestions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, visibleSuggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Escape') { setDismissed(true); setHighlightedIndex(-1) }
  }

  const correctCount = Object.keys(revealed).length
  const grid = (() => {
    const cells = []
    for (let r = 1; r <= 10; r++) cells.push(revealed[r] ? '🟩' : '⬛')
    return cells.join('')
  })()

  const shareText = [
    `🔺 Football Tenable — ${question.title}`,
    `${correctCount}/10 correct · ${MAX_LIVES - lives}/${MAX_LIVES} lives lost`,
    ...(phase === 'won' && dailyStats?.currentStreak ? [`🔥 ${dailyStats.currentStreak}-day streak`] : []),
    '',
    grid,
    '',
    SITE_URL,
  ].join('\n')

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <Link to={lp('/')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
          {t('common.allGames')}
        </Link>
        <div className="score-number text-xl text-gray-500 tracking-wider">TENABLE</div>
        <div className="flex items-center gap-1 text-sm tabular-nums">
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <span key={i} className={i < lives ? 'text-red-500' : 'text-gray-700'}>♥</span>
          ))}
        </div>
      </div>

      <ModeToggle mode={mode} onChange={newGame} className="mb-5" />

      {/* Question card */}
      <div className="w-full max-w-lg mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <div className="flex items-start gap-3">
            {question.icon || QUESTION_ICON[question.id]
              ? <CategoryIcon category={question.icon || QUESTION_ICON[question.id]} size={30} className="shrink-0 mt-0.5" />
              : <span className="text-2xl shrink-0">{question.emoji}</span>}
            <div className="min-w-0 flex-1">
              <div className="text-white font-bold text-sm">{question.title}</div>
              <div className="text-gray-500 text-xs mt-0.5">{question.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pyramid */}
      <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-6">
        {ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            {row.map(rank => {
              const answer = revealed[rank]
              const wasFound = !!answer
              const gameOver = phase !== 'playing'
              const displayAnswer = answer || (gameOver ? answersByRank[rank] : null)
              const isPulsing = pulseRow === rowIdx && pendingRank != null
              return (
                <div
                  key={rank}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border flex flex-col items-center justify-center text-center px-1 transition-colors ${
                    wasFound
                      ? 'border-green-600 bg-green-900/20'
                      : displayAnswer
                        ? 'border-red-900 bg-red-900/10'
                        : 'border-gray-800 bg-gray-900'
                  } ${isPulsing ? 'pyramid-pulse' : ''} ${wasFound ? 'cell-reveal' : ''}`}
                >
                  {displayAnswer ? (
                    <>
                      {question.type === 'club' && <CategoryIcon category={{ type: 'club', value: displayAnswer.text }} size={16} className="mb-0.5" />}
                      <div className={`text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 ${wasFound ? 'text-white' : 'text-gray-400'}`}>{displayAnswer.text}</div>
                      <div className={`text-[9px] sm:text-[10px] mt-0.5 ${wasFound ? 'text-green-400' : 'text-red-500'}`}>{displayAnswer.detail}</div>
                    </>
                  ) : (
                    <div className="text-gray-600 text-xs font-bold">{rank}</div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {phase === 'playing' && (
        <>
          {/* Input */}
          <form onSubmit={handleSubmit} className={`relative w-full max-w-lg ${shake ? 'shake' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('tenable.placeholder')}
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
                    onMouseDown={e => { e.preventDefault(); handleSelectSuggestion(item) }}
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

          <div className="w-full max-w-lg mt-3 flex justify-between items-center text-xs text-gray-700 px-1">
            <span>{t('tenable.found', { n: correctCount })}</span>
            <span>{lives === 1 ? t('tenable.lifeLeft', { n: lives }) : t('tenable.livesLeft', { n: lives })}</span>
          </div>

          {mode === 'unlimited' && (
            <button
              type="button"
              onClick={() => newGame('unlimited')}
              className="mt-4 w-full max-w-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
            >
              {t('tenable.skip')}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowGiveUpConfirm(true)}
            className="mt-4 w-full max-w-lg border border-red-900/60 text-red-400 hover:bg-red-900/20 hover:border-red-700 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
          >
            {t('tenable.giveUp')}
          </button>
        </>
      )}

      {showGiveUpConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-20 px-4">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-white font-medium mb-1">{t('tenable.giveUpTitle')}</p>
            <p className="text-gray-500 text-sm mb-5">{t('tenable.giveUpBody')}</p>
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
                {t('tenable.giveUpConfirm')}
              </button>
            </div>
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
            <h2 className="score-number text-4xl text-green-400 mb-2">{t('tenable.pyramidComplete')}</h2>
            <p className="text-gray-400 mb-2">{lives === 1 ? t('tenable.foundAllLife', { n: lives }) : t('tenable.foundAllLives', { n: lives })}</p>
          </div>
        )}
        {phase === 'lost' && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="text-6xl mb-3">{gaveUp ? '🏳️' : '💔'}</div>
            <h2 className="score-number text-4xl text-red-400 mb-2">{gaveUp ? t('tenable.gaveUp') : t('tenable.gameOver')}</h2>
            <p className="text-gray-400 mb-2">{gaveUp ? t('tenable.foundBeforeGaveUp', { n: correctCount }) : t('tenable.foundBeforeLost', { n: correctCount })}</p>
          </div>
        )}
        {mode === 'daily' && <DailyStats game="tenable" stats={dailyStats} />}
        <ShareCard text={shareText} />
        <button onClick={() => newGame('unlimited')} className="mt-3 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">{mode === 'daily' ? t('common.playUnlimited') : t('tenable.newQuestion')}</button>
        <MoreGames current="/tenable" />
        {phase === 'lost' && (
          <div className="w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mt-6">
            <div className="px-4 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest font-medium">{t('tenable.fullAnswerList')}</div>
            <div className="divide-y divide-gray-800/50">
              {question.answers.map(a => (
                <div key={a.rank} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm font-mono w-5">{a.rank}</span>
                    {question.type === 'club' && <CategoryIcon category={{ type: 'club', value: a.text }} size={20} />}
                    <span className={`text-sm font-medium ${revealed[a.rank] ? 'text-green-400' : 'text-white'}`}>{a.text}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{a.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ResultModal>

      {/* Guess history */}
      {history.length > 0 && (
        <div className="w-full max-w-lg mt-2">
          <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">
            {t('tenable.guesses', { n: history.length })}
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-800/40 max-h-56 overflow-y-auto">
              {[...history].reverse().map((g, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${g.correct === true ? 'flash-valid' : g.correct === false ? 'flash-invalid' : ''}`}>
                  <span className="text-sm text-white truncate">{g.text}</span>
                  {g.correct === true
                    ? <span className="text-green-400 text-xs font-semibold shrink-0">#{g.rank} ✓</span>
                    : g.correct === 'duplicate'
                      ? <span className="text-yellow-500 text-xs font-semibold shrink-0">{t('tenable.alreadyFound')}</span>
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
