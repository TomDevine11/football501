import { useState } from 'react'
import { Link } from 'react-router-dom'
import { STAT_MODES, poolFor, randomFrom, isCorrect } from '../../data/higherlower'

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
  const [mode, setMode] = useState(null)              // chosen STAT_MODE
  const [current, setCurrent] = useState(null)
  const [challenger, setChallenger] = useState(null)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => Number((typeof localStorage !== 'undefined' && localStorage.getItem(BEST_KEY)) || 0))
  const [phase, setPhase] = useState('playing')       // 'playing' | 'reveal' | 'over'
  const [lastCorrect, setLastCorrect] = useState(null)

  const startMode = (m) => {
    const pool = poolFor(m.id)
    const a = randomFrom(pool)
    setMode(m)
    setCurrent(a)
    setChallenger(randomFrom(pool, new Set([a.name])))
    setStreak(0); setPhase('playing'); setLastCorrect(null)
  }

  const guess = (direction) => {
    if (phase !== 'playing') return
    const correct = isCorrect(direction, current, challenger)
    setLastCorrect(correct)
    setPhase('reveal')
    setTimeout(() => {
      if (correct) {
        const newStreak = streak + 1
        setStreak(newStreak)
        if (newStreak > best) { setBest(newStreak); localStorage.setItem(BEST_KEY, String(newStreak)) }
        const pool = poolFor(mode.id)
        setCurrent(challenger)
        setChallenger(randomFrom(pool, new Set([challenger.name, current.name])))
        setPhase('playing')
      } else {
        setPhase('over')
      }
    }, 1100)
  }

  // ── Stat-selection screen ─────────────────────────────────────────
  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg flex items-center justify-between mb-6">
          <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← All games</Link>
          <div className="score-number text-xl text-gray-500 tracking-wider">HIGHER / LOWER</div>
          <div className="text-sm tabular-nums text-gray-500">Best {best}</div>
        </div>
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
        <button onClick={() => setMode(null)} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Change stat</button>
        <div className="score-number text-xl text-gray-500 tracking-wider">HIGHER / LOWER</div>
        <div className="text-sm tabular-nums text-gray-500">Best {best}</div>
      </div>

      <div className="w-full max-w-lg mb-4 text-center">
        <div className="text-white font-semibold text-sm capitalize">{mode.label}</div>
        <div className="text-gray-500 text-xs">Did the second player score more or fewer?</div>
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

      {phase === 'over' && (
        <div className="w-full max-w-lg flex flex-col items-center text-center mt-1">
          <div className="text-5xl mb-2">💔</div>
          <h2 className="score-number text-3xl text-red-400 mb-1">GAME OVER</h2>
          <p className="text-gray-400 mb-1">
            Streak: <span className="text-white font-bold">{streak}</span>
            {streak >= best && streak > 0 && <span className="text-amber-400"> — new best!</span>}
          </p>
          <p className="text-gray-600 text-xs mb-4">{challenger.name} scored {challenger.value} {mode.label}.</p>
          <div className="flex gap-3">
            <button onClick={() => startMode(mode)} className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">Play again</button>
            <button onClick={() => setMode(null)} className="border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium rounded-lg px-6 py-2.5 transition-colors">Change stat</button>
          </div>
        </div>
      )}
    </div>
  )
}
