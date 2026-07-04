import { useState } from 'react'
import { Link } from 'react-router-dom'
import FootballTicTacToe from './FootballTicTacToe'
import TicTacToeVersus from './TicTacToeVersus'
import Mark from './Mark'
import { useI18n } from '../../i18n'

export default function TicTacToeMenu() {
  const { t, lp } = useI18n()
  const [mode, setMode] = useState(null) // null | 'solo' | 'versus'

  if (mode === 'solo') return <FootballTicTacToe onBackToModes={() => setMode(null)} />
  if (mode === 'versus') return <TicTacToeVersus onBackToModes={() => setMode(null)} />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <Link to={lp('/')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{t('common.allGames')}</Link>
          <div className="score-number text-xl text-gray-500 tracking-wider">{t('tictactoe.wordmark')}</div>
          <div className="w-16" />
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3"><Mark mark="X" size={40} /><Mark mark="O" size={40} /></div>
          <h1 className="score-number text-3xl text-white mb-2">{t('games.tictactoe.title')}</h1>
          <p className="text-gray-500 text-sm">{t('tictactoe.menuSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('solo')}
            className="group bg-gray-900 border border-gray-800 hover:border-green-600 hover:ring-1 hover:ring-green-600/30 rounded-xl p-6 text-left transition-all"
          >
            <div className="text-3xl mb-3">🎯</div>
            <div className="text-white font-bold text-lg">{t('tictactoe.dailyTitle')}</div>
            <div className="text-green-400 text-sm mt-1 font-medium">{t('tictactoe.solo')}</div>
            <div className="text-gray-600 text-xs mt-3 leading-relaxed">{t('tictactoe.dailyDesc')}</div>
          </button>

          <button
            onClick={() => setMode('versus')}
            className="group bg-gray-900 border border-gray-800 hover:border-purple-500 hover:ring-1 hover:ring-purple-500/30 rounded-xl p-6 text-left transition-all"
          >
            <div className="text-3xl mb-3">⚔️</div>
            <div className="text-white font-bold text-lg">{t('tictactoe.versusTitle')}</div>
            <div className="text-purple-400 text-sm mt-1 font-medium">{t('tictactoe.versusSub')}</div>
            <div className="text-gray-600 text-xs mt-3 leading-relaxed">{t('tictactoe.versusDesc')}</div>
          </button>
        </div>
      </div>
    </div>
  )
}
