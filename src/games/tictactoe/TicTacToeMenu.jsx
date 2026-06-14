import { useState } from 'react'
import { Link } from 'react-router-dom'
import FootballTicTacToe from './FootballTicTacToe'
import TicTacToeVersus from './TicTacToeVersus'

export default function TicTacToeMenu() {
  const [mode, setMode] = useState(null) // null | 'solo' | 'versus'

  if (mode === 'solo') return <FootballTicTacToe onBackToModes={() => setMode(null)} />
  if (mode === 'versus') return <TicTacToeVersus onBackToModes={() => setMode(null)} />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← All games</Link>
          <div className="score-number text-xl text-gray-500 tracking-wider">TICTACTOE</div>
          <div className="w-16" />
        </div>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">❌⭕</div>
          <h1 className="score-number text-3xl text-white mb-2">Football TicTacToe</h1>
          <p className="text-gray-500 text-sm">Every row and column is a football category. Choose how you want to play.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('solo')}
            className="group bg-gray-900 border border-gray-800 hover:border-green-600 hover:ring-1 hover:ring-green-600/30 rounded-xl p-6 text-left transition-all"
          >
            <div className="text-3xl mb-3">🎯</div>
            <div className="text-white font-bold text-lg">Daily Challenge</div>
            <div className="text-green-400 text-sm mt-1 font-medium">Solo</div>
            <div className="text-gray-600 text-xs mt-3 leading-relaxed">Fill all 9 squares before you run out of lives. A new grid every day.</div>
          </button>

          <button
            onClick={() => setMode('versus')}
            className="group bg-gray-900 border border-gray-800 hover:border-purple-500 hover:ring-1 hover:ring-purple-500/30 rounded-xl p-6 text-left transition-all"
          >
            <div className="text-3xl mb-3">⚔️</div>
            <div className="text-white font-bold text-lg">Local 1v1</div>
            <div className="text-purple-400 text-sm mt-1 font-medium">Two players, one device</div>
            <div className="text-gray-600 text-xs mt-3 leading-relaxed">Take turns claiming squares with ❌ and ⭕. First to three in a row wins.</div>
          </button>
        </div>
      </div>
    </div>
  )
}
