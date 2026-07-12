import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SQUADS, buildMatcher, matchPlayer, getDailySquad } from '../../data/wcsquads'
import { usePlayerSuggestions } from '../tictactoe/usePlayerSuggestions'
import { ShareCard } from '../../components/ShareCard'
import DailyStats from '../../components/DailyStats'
import ModeToggle from '../../components/ModeToggle'
import MoreGames from '../../components/MoreGames'
import ResultModal from '../../components/ResultModal'
import { recordResult, matchdayNumber } from '../../data/dailyStats'
import { loadDailyProgress, saveDailyProgress } from '../../data/dailyProgress'
import { TILE } from '../../utils/shareImage'
import { SITE_URL } from '../../utils/site'
import { useI18n } from '../../i18n'
import { RESULT_REVEAL_DELAY_MS } from '../../utils/motion'

export default function WorldCupSquads() {
  const { t, lp } = useI18n()
  // Today's daily state, if any: resume it, or lock a finished one to its result.
  const [saved] = useState(() => loadDailyProgress('wcsquads'))
  const restoredDone = !!saved?.done

  const [mode, setMode] = useState('daily')        // 'daily' | 'unlimited'
  const [squad, setSquad] = useState(() => getDailySquad())
  const [named, setNamed] = useState(() => new Set(saved?.named ?? []))
  const [input, setInput] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dismissed, setDismissed] = useState(false)
  const [revealed, setRevealed] = useState(() => saved?.revealed ?? false)
  const [flash, setFlash] = useState('')
  const [shake, setShake] = useState(false)
  const [dailyStats, setDailyStats] = useState(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const matcher = useMemo(() => (squad ? buildMatcher(squad) : null), [squad])
  const active = !!squad && !revealed
  const { suggestions, isSearching } = usePlayerSuggestions(input, active, useMemo(() => new Set(), []))

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

  const complete = squad && named.size === squad.players.length
  const over = !!squad && (complete || revealed)
  // A finished daily is locked to its result and offers Unlimited.
  const dailyLocked = mode === 'daily' && over
  // Daily mode records a score (squad members named) once the round ends.
  useEffect(() => {
    if (over && mode === 'daily') setDailyStats(recordResult('wcsquads', true, named.size))
  }, [over, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist the daily as it's played so a refresh resumes it and a finished
  // round stays locked (no bailing out to re-attempt for a higher score).
  useEffect(() => {
    if (mode !== 'daily' || !squad) return
    if (named.size === 0 && !over) return
    saveDailyProgress('wcsquads', { named: [...named], revealed }, over)
  }, [mode, squad, named, revealed, over])

  const submit = (text) => {
    if (!active || !text.trim()) return
    setInput('')
    const m = matchPlayer(matcher, text)
    if (!m) {
      setFlash(t('wcsquads.notInSquad')); setShake(true); setTimeout(() => setShake(false), 400)
    } else if (named.has(m)) {
      setFlash(t('wcsquads.alreadyNamed', { name: m }))
    } else {
      setNamed(prev => new Set(prev).add(m)); setFlash('')
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!active) return
    if (highlightedIndex >= 0 && visibleSuggestions[highlightedIndex]) { submit(visibleSuggestions[highlightedIndex].name); return }
    if (input.trim()) submit(input.trim())
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setDismissed(true); setHighlightedIndex(-1); return }
    if (!visibleSuggestions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, visibleSuggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)) }
  }

  const reset = (s) => { setSquad(s); setNamed(new Set()); setRevealed(false); setInput(''); setFlash(''); setDailyStats(null); setShowResult(false) }
  const [showResult, setShowResult] = useState(restoredDone)
  useEffect(() => {
    if (!over) return
    const t = setTimeout(() => setShowResult(true), RESULT_REVEAL_DELAY_MS)
    return () => clearTimeout(t)
  }, [over])
  const pick = (s) => reset(s)                  // unlimited: chosen squad
  const back = () => reset(null)                // unlimited: back to picker
  // Return to the daily: rehydrate today's saved squad progress (locked, resumed, or fresh).
  const restoreDaily = () => {
    const s = loadDailyProgress('wcsquads')
    setSquad(getDailySquad()); setNamed(new Set(s?.named ?? [])); setRevealed(s?.revealed ?? false)
    setInput(''); setFlash(''); setDailyStats(null); setShowResult(!!s?.done)
  }
  const switchMode = (m) => {                   // toggle daily ⇄ unlimited
    setMode(m)
    if (m === 'daily') restoreDaily()
    else reset(null)
  }

  // ── Squad picker (Unlimited only) ─────────────────────────────────
  if (!squad) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg flex items-center justify-between mb-6">
          <Link to={lp('/')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{t('common.allGames')}</Link>
          <div className="score-number text-xl text-gray-500 tracking-wider">{t('wcsquads.wordmark')}</div>
          <div className="w-16" />
        </div>
        <ModeToggle mode={mode} onChange={switchMode} className="mb-6" />
        <div className="w-full max-w-lg text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">{t('wcsquads.title')}</h1>
          <p className="text-gray-500 text-sm">{t('wcsquads.pick')}</p>
        </div>
        <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SQUADS.map(s => (
            <button key={s.year} onClick={() => pick(s)}
              className="bg-gray-900 border border-gray-800 hover:border-amber-500 hover:ring-1 hover:ring-amber-500/30 rounded-xl px-4 py-4 text-center transition-all">
              <div className="text-white font-semibold">{s.nation}</div>
              <div className="text-amber-400 text-sm font-medium tabular-nums">{s.year}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Game ──────────────────────────────────────────────────────────
  const squadShareText = [
    t('share.wcsquadsNamed', { n: named.size, total: squad.players.length, nation: squad.nation, year: squad.year }),
    SITE_URL,
  ].join('\n\n')
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-5">
        {mode === 'unlimited'
          ? <button onClick={back} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{t('wcsquads.changeSquad')}</button>
          : <Link to={lp('/')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{t('common.allGames')}</Link>}
        <div className="score-number text-xl text-gray-500 tracking-wider">{t('wcsquads.wordmark')}</div>
        <div className="text-sm tabular-nums text-gray-400">{named.size}/{squad.players.length}</div>
      </div>

      <ModeToggle mode={mode} onChange={switchMode} className="mb-4" />

      <div className="w-full max-w-lg mb-4 text-center">
        <h1 className="text-xl font-bold text-white">{squad.nation} {squad.year}</h1>
        <p className="text-gray-500 text-xs">{dailyLocked ? t('common.dailyDone') : mode === 'daily' ? t('wcsquads.subtitleDaily') : t('wcsquads.subtitleUnlimited')}</p>
      </div>

      {active && (
        <form onSubmit={handleSubmit} className={`relative w-full max-w-lg mb-2 ${shake ? 'shake' : ''}`}>
          <input
            ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={t('wcsquads.placeholder')} autoFocus
            className="w-full bg-gray-900 border border-gray-700 focus:border-green-600 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-base outline-none transition-colors"
            autoComplete="off" autoCorrect="off" spellCheck="false"
          />
          {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin" /></div>}
          {visibleSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-10 shadow-2xl">
              {visibleSuggestions.map((item, i) => (
                <button key={item.name} type="button" onMouseDown={e => { e.preventDefault(); submit(item.name) }} onMouseEnter={() => setHighlightedIndex(i)}
                  className={`w-full text-left px-4 py-2.5 transition-colors border-b border-gray-800/50 last:border-0 ${i === highlightedIndex ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}>
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
      {active && <div className="w-full max-w-lg mb-4 text-center text-xs h-4 text-amber-400">{flash}</div>}

      {/* Squad slots */}
      <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {squad.players.map(name => {
          const got = named.has(name)
          const show = got || revealed
          return (
            <div key={name} className={`rounded-lg px-2 py-2 text-center text-[11px] sm:text-xs leading-tight ${
              got ? 'bg-green-900/40 border border-green-700 text-green-200 font-medium cell-reveal'
                : revealed ? 'bg-gray-900 border border-gray-800 text-gray-500'
                  : 'bg-gray-900 border border-gray-800 text-gray-700'
            }`}>
              {show ? name : '•'}
            </div>
          )
        })}
      </div>

      {/* Controls / result */}
      {!over && (
        <button onClick={() => setRevealed(true)} className="mt-5 w-full max-w-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors">
          {t('wcsquads.giveUp')}
        </button>
      )}
      {/* Unlimited: the squad slots reveal every name in place — just a replay button. */}
      {mode === 'unlimited' && over && (
        <button onClick={back} className="mt-5 w-full max-w-lg bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-colors">{t('wcsquads.anotherSquad')}</button>
      )}
      {mode === 'daily' && over && !showResult && (
        <button onClick={() => setShowResult(true)} className="mt-5 text-sm text-green-400 hover:text-green-300 font-medium transition-colors">{t('common.seeResult')}</button>
      )}

      <ResultModal open={showResult && mode === 'daily'} onClose={() => setShowResult(false)}>
        <div className="w-full text-center">
          {complete ? (
            <>
              <div className="text-4xl mb-1">🏆</div>
              <h2 className="score-number text-2xl text-green-400 mb-1">{t('wcsquads.fullSquad')}</h2>
              <p className="text-gray-400 text-sm mb-3">{t('wcsquads.namedAll', { n: squad.players.length })}</p>
            </>
          ) : (
            <p className="text-gray-300 text-sm mb-3">{t('wcsquads.namedOf', { n: named.size, total: squad.players.length })}</p>
          )}
          {mode === 'daily' && <DailyStats game="wcsquads" stats={dailyStats} variant="score" />}
          <ShareCard text={squadShareText} card={{
            gameId: 'wcsquads',
            title: t('wcsquads.wordmark'),
            challenge: `${squad.nation} ${squad.year}`,
            result: complete ? t('wcsquads.fullSquad') : t('wcsquads.namedOf', { n: named.size, total: squad.players.length }),
            rows: (() => {
              const cells = squad.players.map(p => named.has(p) ? TILE.hit : TILE.miss)
              return Array.from({ length: Math.ceil(cells.length / 6) }, (_, i) => cells.slice(i * 6, i * 6 + 6))
            })(),
            matchday: matchdayNumber(),
          }} />
          {mode === 'unlimited'
            ? <button onClick={back} className="mt-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">{t('wcsquads.anotherSquad')}</button>
            : <>
                <button onClick={() => switchMode('unlimited')} className="mt-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">{t('common.playUnlimited')}</button>
                <p className="text-gray-600 text-xs mt-3">{t('common.comeBackTomorrow')}</p>
              </>}
        </div>
        <MoreGames current="/world-cup" />
      </ResultModal>
    </div>
  )
}
