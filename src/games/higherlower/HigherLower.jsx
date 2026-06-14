import { useState } from 'react'
import { Link } from 'react-router-dom'
import { randomPlayer, isCorrect, METRIC, POOL_SIZE } from '../../data/higherlower'

const BEST_KEY = 'ftg-higherlower-best'

function PlayerCard({ player, showFame }) {
  return (
    <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-6 text-center flex flex-col items-center justify-center min-h-[150px]">
      {player.flag && <div className="text-3xl mb-2">{player.flag}</div>}
      <div className="text-white font-bold text-lg leading-tight">{player.name}</div>
      <div className="text-gray-500 text-xs mt-1">{player.nationality}</div>
      <div className="mt-3 h-9 flex items-center justify-center">
        {showFame
          ? <div className="score-number text-3xl text-amber-400 tabular-nums">{player.fame}</div>
          : <div className="text-gray-700 text-3xl font-black">?</div>}
      </div>
      <div className="text-gray-600 text-[10px] uppercase tracking-wide">Wikipedia languages</div>
    </div>
  )
}

export default function HigherLower() {
  const [start] = useState(() => { const a = randomPlayer(); return { a, b: randomPlayer(new Set([a.name])) } })
  const [current, setCurrent] = useState(start.a)
  const [challenger, setChallenger] = useState(start.b)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => Number((typeof localStorage !== 'undefined' && localStorage.getItem(BEST_KEY)) || 0))
  const [phase, setPhase] = useState('playing')  // 'playing' | 'reveal' | 'over'
  const [lastCorrect, setLastCorrect] = useState(null)

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
        setCurrent(challenger)
        setChallenger(randomPlayer(new Set([challenger.name, current.name])))
        setPhase('playing')
      } else {
        setPhase('over')
      }
    }, 1100)
  }

  const restart = () => {
    const a = randomPlayer()
    setCurrent(a)
    setChallenger(randomPlayer(new Set([a.name])))
    setStreak(0); setPhase('playing'); setLastCorrect(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-5">
        <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← All games</Link>
        <div className="score-number text-xl text-gray-500 tracking-wider">HIGHER / LOWER</div>
        <div className="text-sm tabular-nums text-gray-500">Best {best}</div>
      </div>

      <div className="w-full max-w-lg mb-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div className="text-white font-bold text-sm">Who is more famous?</div>
          <div className="text-gray-500 text-xs mt-0.5">Does the second player appear in MORE or FEWER {METRIC} than the first? Build your streak — one wrong guess ends it.</div>
        </div>
      </div>

      <div className="w-full max-w-lg mb-4 text-center">
        <span className="text-gray-500 text-sm">Streak: </span>
        <span className="score-number text-2xl text-green-400 tabular-nums">{streak}</span>
      </div>

      <div className="w-full max-w-lg flex gap-3 items-stretch mb-5">
        <PlayerCard player={current} showFame />
        <div className="flex items-center text-gray-600 font-bold text-sm">vs</div>
        <PlayerCard player={challenger} showFame={phase !== 'playing'} />
      </div>

      {phase === 'playing' && (
        <div className="w-full max-w-lg grid grid-cols-2 gap-3">
          <button onClick={() => guess('higher')} className="bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl py-3.5 transition-colors">
            ▲ More
          </button>
          <button onClick={() => guess('lower')} className="bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-xl py-3.5 transition-colors">
            ▼ Fewer
          </button>
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
          <p className="text-gray-600 text-xs mb-4">{challenger.name} appears in {challenger.fame} Wikipedia languages.</p>
          <button onClick={restart} className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">
            Play again
          </button>
        </div>
      )}

      <p className="text-gray-700 text-[11px] mt-6 text-center max-w-md">
        Fame is measured by how many of Wikipedia's {POOL_SIZE.toLocaleString()} ranked players' language editions each appears in — a proxy for global recognition.
      </p>
    </div>
  )
}
