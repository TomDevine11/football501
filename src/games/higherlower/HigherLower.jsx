import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { STAT_MODES, poolFor, randomFrom, isCorrect, getDailyRun } from '../../data/higherlower'
import { ShareCard } from '../../components/ShareCard'
import DailyStats from '../../components/DailyStats'
import ModeToggle from '../../components/ModeToggle'
import MoreGames from '../../components/MoreGames'
import ResultModal from '../../components/ResultModal'
import { recordResult, todayIndex } from '../../data/dailyStats'
import { SITE_URL } from '../../utils/site'

const BEST_KEY = 'ftg-higherlower-best'

function PlayerCard({ player, statLabel, showValue }) {
  return (
    <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-6 text-center flex flex-col items-center justify-center min-h-[150px]">
      <div className="text-white font-bold text-lg leading-tight">{player.name}</div>
      <div className="mt-3 h-10 flex items-center justify-center">
        {showValue
          ? <div className="score-number text-4xl text-amber-400 tabular-nums">{player.value}</div>
          : <div className="text-gray-700 text-4xl font-black">?</div>}
      </div>
      <div className="text-gray-600 text-[10px] uppercase tracking-wide">{statLabel}</div>
    </div>
  )
}

export default function HigherLower() {
  const [dailyMode, setDailyMode] = useState('daily')  // 'daily' | 'unlimited'
  const [run, setRun] = useState(() => getDailyRun(todayIndex())) // daily chain
  const [seqIdx, setSeqIdx] = useState(1)              // position in the daily chain
  const [mode, setMode] = useState(run.mode)           // chosen STAT_MODE (daily auto / unlimited picked)
  const [current, setCurrent] = useState(run.sequence[0])
  const [challenger, setChallenger] = useState(run.sequence[1])
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => Number((typeof localStorage !== 'undefined' && localStorage.getItem(BEST_KEY)) || 0))
  const [phase, setPhase] = useState('playing')        // 'playing' | 'reveal' | 'over'
  const [lastCorrect, setLastCorrect] = useState(null)
  const [dailyStats, setDailyStats] = useState(null)

  // Daily mode records the run's final streak as a score, once it ends.
  useEffect(() => {
    if (phase === 'over' && dailyMode === 'daily') setDailyStats(recordResult('higherlower', true, streak))
  }, [phase, dailyMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // In daily, finishing on a correct answer means the chain was exhausted (a win).
  const dailyCleared = dailyMode === 'daily' && phase === 'over' && lastCorrect === true

  const startDaily = () => {
    const r = getDailyRun(todayIndex())
    setRun(r); setSeqIdx(1); setMode(r.mode)
    setCurrent(r.sequence[0]); setChallenger(r.sequence[1])
    setStreak(0); setPhase('playing'); setLastCorrect(null); setDailyStats(null); setShowResult(false)
  }

  const startMode = (m) => {
    const pool = poolFor(m.id)
    const a = randomFrom(pool)
    setMode(m)
    setCurrent(a)
    setChallenger(randomFrom(pool, new Set([a.name])))
    setStreak(0); setPhase('playing'); setLastCorrect(null); setDailyStats(null); setShowResult(false)
  }

  const switchMode = (dm) => {
    setDailyMode(dm)
    if (dm === 'daily') startDaily()
    else { setMode(null); setPhase('playing'); setStreak(0); setLastCorrect(null); setDailyStats(null); setShowResult(false) }
  }
  const [showResult, setShowResult] = useState(false)
  useEffect(() => {
    if (phase !== 'over') return
    const t = setTimeout(() => setShowResult(true), 2500)
    return () => clearTimeout(t)
  }, [phase])

  const guess = (direction) => {
    if (phase !== 'playing') return
    const correct = isCorrect(direction, current, challenger)
    setLastCorrect(correct)
    setPhase('reveal')
    setTimeout(() => {
      if (!correct) { setPhase('over'); return }
      const newStreak = streak + 1
      setStreak(newStreak)
      if (dailyMode === 'unlimited' && newStreak > best) { setBest(newStreak); localStorage.setItem(BEST_KEY, String(newStreak)) }

      if (dailyMode === 'daily') {
        const nextIdx = seqIdx + 1
        if (nextIdx >= run.sequence.length) { setPhase('over'); return } // chain cleared
        setCurrent(challenger); setChallenger(run.sequence[nextIdx]); setSeqIdx(nextIdx); setPhase('playing')
      } else {
        const pool = poolFor(mode.id)
        setCurrent(challenger)
        setChallenger(randomFrom(pool, new Set([challenger.name, current.name])))
        setPhase('playing')
      }
    }, 1100)
  }

  // ── Stat-selection screen (Unlimited only) ────────────────────────
  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg flex items-center justify-between mb-6">
          <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← All games</Link>
          <div className="score-number text-xl text-gray-500 tracking-wider">HIGHER / LOWER</div>
          <div className="text-sm tabular-nums text-gray-500">Best {best}</div>
        </div>
        <ModeToggle mode={dailyMode} onChange={switchMode} className="mb-6" />
        <div className="w-full max-w-lg text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Higher or Lower</h1>
          <p className="text-gray-500 text-sm">Pick a stat. Then decide whether each new player scored more or fewer — build the longest streak you can.</p>
        </div>
        <div className="w-full max-w-lg grid grid-cols-1 gap-3">
          {STAT_MODES.map(m => (
            <button key={m.id} onClick={() => startMode(m)}
              className="bg-gray-900 border border-gray-800 hover:border-amber-500 hover:ring-1 hover:ring-amber-500/30 rounded-xl px-5 py-4 text-left transition-all">
              <div className="text-white font-semibold capitalize">{m.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">All-time {m.competition} top scorers</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Game screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-5">
        {dailyMode === 'unlimited'
          ? <button onClick={() => setMode(null)} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Change stat</button>
          : <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← All games</Link>}
        <div className="score-number text-xl text-gray-500 tracking-wider">HIGHER / LOWER</div>
        <div className="text-sm tabular-nums text-gray-500">Best {best}</div>
      </div>

      <ModeToggle mode={dailyMode} onChange={switchMode} className="mb-4" />

      <div className="w-full max-w-lg mb-4 text-center">
        <div className="text-white font-semibold text-sm capitalize">{mode.label}</div>
        <div className="text-gray-500 text-xs">{dailyMode === 'daily' ? "Today's chain — how far can you get?" : 'Did the second player score more or fewer?'}</div>
      </div>

      <div className="w-full max-w-lg mb-4 text-center">
        <span className="text-gray-500 text-sm">Streak: </span>
        <span className="score-number text-2xl text-green-400 tabular-nums">{streak}</span>
      </div>

      <div className="w-full max-w-lg flex gap-3 items-stretch mb-5">
        <PlayerCard player={current} statLabel={mode.label} showValue />
        <div className="flex items-center text-gray-600 font-bold text-sm">vs</div>
        <PlayerCard player={challenger} statLabel={mode.label} showValue={phase !== 'playing'} />
      </div>

      {phase === 'playing' && (
        <div className="w-full max-w-lg grid grid-cols-2 gap-3">
          <button onClick={() => guess('higher')} className="bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl py-3.5 transition-colors">▲ More</button>
          <button onClick={() => guess('lower')} className="bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-xl py-3.5 transition-colors">▼ Fewer</button>
        </div>
      )}

      {phase === 'reveal' && (
        <div className={`w-full max-w-lg text-center font-bold ${lastCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {lastCorrect ? '✓ Correct!' : '✗ Wrong'}
        </div>
      )}

      {phase === 'over' && !showResult && (
        <button onClick={() => setShowResult(true)} className="mt-1 text-sm text-green-400 hover:text-green-300 font-medium transition-colors">↑ See result &amp; more games</button>
      )}

      <ResultModal open={showResult} onClose={() => setShowResult(false)}>
        <div className="w-full flex flex-col items-center text-center">
          <div className="text-5xl mb-2">{dailyCleared ? '🏆' : '💔'}</div>
          <h2 className={`score-number text-3xl mb-1 ${dailyCleared ? 'text-green-400' : 'text-red-400'}`}>{dailyCleared ? 'CHAIN CLEARED!' : 'GAME OVER'}</h2>
          <p className="text-gray-400 mb-1">
            Streak: <span className="text-white font-bold">{streak}</span>
            {dailyMode === 'unlimited' && streak >= best && streak > 0 && <span className="text-amber-400"> — new best!</span>}
          </p>
          <p className="text-gray-600 text-xs mb-3">{challenger.name} scored {challenger.value} {mode.label}.</p>
          {dailyMode === 'daily' && <DailyStats game="higherlower" stats={dailyStats} variant="score" />}
          <ShareCard text={[
            dailyMode === 'daily'
              ? `⬆️ Higher or Lower — Daily (${mode.label}): streak of ${streak}!`
              : `⬆️ Higher or Lower (${mode.label}) — streak of ${streak}! Best: ${best}.`,
            SITE_URL,
          ].join('\n\n')} />
          {dailyMode === 'unlimited'
            ? (
              <div className="flex gap-3 mt-2">
                <button onClick={() => startMode(mode)} className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">Play again</button>
                <button onClick={() => setMode(null)} className="border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium rounded-lg px-6 py-2.5 transition-colors">Change stat</button>
              </div>
            )
            : <>
                <button onClick={() => switchMode('unlimited')} className="mt-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">Play Unlimited →</button>
                <p className="text-gray-600 text-xs mt-3">Come back tomorrow for a new daily.</p>
              </>}
        </div>
        <MoreGames current="/higher-or-lower" />
      </ResultModal>
    </div>
  )
}
