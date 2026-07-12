import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SQUADS, buildMatcher, matchPlayer, getDailySquad } from '../../data/wcsquads'
import { usePlayerSuggestions } from '../tictactoe/usePlayerSuggestions'
import { ShareCard } from '../../components/ShareCard'
import DailyStats from '../../components/DailyStats'
import ModeToggle from '../../components/ModeToggle'
import ResultModal from '../../components/ResultModal'
import GameChrome from '../../components/GameChrome'
import GameMotif from '../../components/GameMotif'
import UpNext from '../../components/UpNext'
import { accentVars } from '../../design/accents'
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
      <div className="tv-scene min-h-dvh text-primary" style={accentVars('wcsquads')}>
        <div className="flex flex-col items-center px-4 pb-8 max-w-3xl mx-auto">
          <div className="w-full"><GameChrome motifId="world-cup" title={t('wcsquads.wordmark')} /></div>
          <div className="relative w-full max-w-lg flex justify-center mt-1 mb-5">
            <Link to={lp('/')} className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-secondary transition-colors">{t('common.allGames')}</Link>
            <ModeToggle mode={mode} onChange={switchMode} />
          </div>
          <div className="w-full max-w-lg text-center mb-6">
            <h1 className="score-number text-3xl text-primary mb-1">{t('wcsquads.title')}</h1>
            <p className="text-muted text-sm">{t('wcsquads.pick')}</p>
          </div>
          <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SQUADS.map(s => (
              <button key={s.year} onClick={() => pick(s)}
                className="group bg-card border border-border-strong hover:border-accent rounded-xl px-4 py-5 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-bright">
                <div className="text-primary font-bold">{s.nation}</div>
                <div className="score-number text-2xl text-accent-bright tabular-nums mt-0.5">{s.year}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Game ──────────────────────────────────────────────────────────
  const total = squad.players.length
  const pct = Math.round((named.size / total) * 100)
  const squadShareText = [
    t('share.wcsquadsNamed', { n: named.size, total, nation: squad.nation, year: squad.year }),
    SITE_URL,
  ].join('\n\n')
  return (
    <div className="tv-scene min-h-dvh text-primary" style={accentVars('wcsquads')}>
    <div className="flex flex-col items-center px-4 pb-8 max-w-3xl mx-auto">
      <div className="w-full"><GameChrome
        motifId="world-cup"
        title={t('wcsquads.wordmark')}
        right={<b className="text-secondary tabular-nums">{named.size}/{total}</b>}
      /></div>

      {/* Mode toggle centred; change-squad / all-games link is a satellite. */}
      <div className="relative w-full max-w-lg flex justify-center mt-1 mb-4">
        {mode === 'unlimited'
          ? <button onClick={back} className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-secondary transition-colors">{t('wcsquads.changeSquad')}</button>
          : <Link to={lp('/')} className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-secondary transition-colors">{t('common.allGames')}</Link>}
        <ModeToggle mode={mode} onChange={switchMode} />
      </div>

      {/* Hero: the nation + year and a live squad-completion bar */}
      <div className="w-full max-w-lg mb-4">
        <div className="bg-card border border-border-strong border-l-4 border-l-accent rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <GameMotif id="world-cup" className="w-8 h-8 text-accent-bright shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[0.55rem] font-black tracking-[0.18em] text-accent-bright">{(mode === 'daily' ? t('common.daily') : t('common.unlimited')).toUpperCase()}{dailyLocked ? ` · ${t('common.complete')}` : ''}</div>
              <div className="text-primary font-bold text-lg leading-tight">{squad.nation} {squad.year}</div>
              <div className="text-muted text-xs mt-0.5">{dailyLocked ? t('common.comeBackTomorrow') : mode === 'daily' ? t('wcsquads.subtitleDaily') : t('wcsquads.subtitleUnlimited')}</div>
            </div>
            <div className="score-number text-3xl text-accent-bright tabular-nums leading-none shrink-0">{named.size}<span className="text-muted text-base">/{total}</span></div>
          </div>
          <div className="mt-2.5 h-1.5 rounded-full bg-board overflow-hidden" role="progressbar" aria-valuenow={named.size} aria-valuemax={total}>
            <div className="h-full bg-accent rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {active && (
        <form onSubmit={handleSubmit} className={`relative w-full max-w-lg mb-2 ${shake ? 'shake' : ''}`}>
          <input
            ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={t('wcsquads.placeholder')} autoFocus
            role="combobox" aria-expanded={visibleSuggestions.length > 0} aria-controls="wc-suggestions" aria-autocomplete="list" aria-label={t('wcsquads.placeholder')}
            className="w-full bg-surface border border-border-strong focus:border-accent rounded-xl px-4 py-3.5 text-primary placeholder-faint text-base outline-none transition-colors"
            autoComplete="off" autoCorrect="off" spellCheck="false"
          />
          {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-inert border-t-accent rounded-full animate-spin" /></div>}
          {visibleSuggestions.length > 0 && (
            <div ref={dropdownRef} id="wc-suggestions" role="listbox" className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-strong rounded-xl overflow-hidden z-dropdown shadow-float">
              {visibleSuggestions.map((item, i) => (
                <button key={item.name} type="button" role="option" aria-selected={i === highlightedIndex} onMouseDown={e => { e.preventDefault(); submit(item.name) }} onMouseEnter={() => setHighlightedIndex(i)}
                  className={`w-full text-left px-4 py-2.5 transition-colors border-b border-border/50 last:border-0 ${i === highlightedIndex ? 'bg-border' : 'hover:bg-border/60'}`}>
                  <div className="flex items-center gap-2">
                    {item.flag && <span className="text-base shrink-0">{item.flag}</span>}
                    <span className="text-primary text-sm font-medium truncate">{item.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form>
      )}
      {active && <div className="w-full max-w-lg mb-4 text-center text-xs h-4 text-warn">{flash}</div>}

      {/* Squad board — slots light up in the accent as you name them */}
      <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {squad.players.map(name => {
          const got = named.has(name)
          const show = got || revealed
          return (
            <div key={name} className={`rounded-lg border px-2 py-2.5 text-center text-[11px] sm:text-xs leading-tight min-h-[2.6rem] flex items-center justify-center ${
              got ? 'border-[color-mix(in_srgb,var(--accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,#16151f)] text-primary font-semibold cell-reveal'
                : revealed ? 'border-border bg-board text-muted'
                  : 'border-border-strong bg-surface text-dim'
            }`}>
              {show ? name : <span className="text-lg" aria-hidden="true">•</span>}
            </div>
          )
        })}
      </div>

      {/* Controls / result */}
      {!over && (
        <button onClick={() => setRevealed(true)} className="mt-5 w-full max-w-lg border border-border-strong text-secondary hover:bg-surface hover:text-primary text-sm font-medium rounded-xl px-4 py-2.5 transition-colors">
          {t('wcsquads.giveUp')}
        </button>
      )}
      {/* Unlimited: the squad slots reveal every name in place — just a replay button. */}
      {mode === 'unlimited' && over && (
        <button onClick={back} className="mt-5 w-full max-w-lg bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl px-6 py-3 transition-colors">{t('wcsquads.anotherSquad')}</button>
      )}
      {mode === 'daily' && over && !showResult && (
        <button onClick={() => setShowResult(true)} className="mt-5 text-sm text-brand-bright hover:text-primary font-medium transition-colors">{t('common.seeResult')}</button>
      )}

      <ResultModal open={showResult && mode === 'daily'} onClose={() => setShowResult(false)}>
        <div className="w-full flex flex-col items-center text-center">
          <GameMotif id="world-cup" className={`w-11 h-11 mb-2 ${complete ? 'text-accent-bright' : 'text-dim'}`} />
          <h2 className={`score-number text-4xl mb-1 ${complete ? 'text-success-bright' : 'text-primary'}`}>
            {complete ? t('wcsquads.fullSquad') : `${named.size}/${total}`}
          </h2>
          <p className="text-muted text-sm mb-1">
            {complete ? t('wcsquads.namedAll', { n: total }) : t('wcsquads.namedOf', { n: named.size, total })}
          </p>
          {dailyLocked && <p className="text-[0.62rem] font-black tracking-[0.14em] uppercase text-faint mb-1">{t('common.dailyDone')}</p>}
        </div>
        {mode === 'daily' && <DailyStats game="wcsquads" stats={dailyStats} variant="score" />}
        <ShareCard text={squadShareText} card={{
          gameId: 'wcsquads',
          title: t('wcsquads.wordmark'),
          challenge: `${squad.nation} ${squad.year}`,
          result: complete ? t('wcsquads.fullSquad') : t('wcsquads.namedOf', { n: named.size, total }),
          rows: (() => {
            const cells = squad.players.map(p => named.has(p) ? TILE.hit : TILE.miss)
            return Array.from({ length: Math.ceil(cells.length / 6) }, (_, i) => cells.slice(i * 6, i * 6 + 6))
          })(),
          matchday: matchdayNumber(),
        }} />
        <button onClick={() => switchMode('unlimited')} className="mt-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-lg px-6 py-2.5 transition-colors">{t('common.playUnlimited')}</button>
        <UpNext exclude="wcsquads" />
      </ResultModal>
    </div>
    </div>
  )
}
