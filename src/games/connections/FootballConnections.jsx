import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDailyConnections, getRandomConnections, shuffleNames } from '../../data/connections'
import DailyStats from '../../components/DailyStats'
import ModeToggle from '../../components/ModeToggle'
import MoreGames from '../../components/MoreGames'
import ResultModal from '../../components/ResultModal'
import CategoryIcon from '../../components/CategoryIcon'
import { recordResult } from '../../data/dailyStats'
import { ShareCard } from '../../components/ShareCard'
import { SITE_URL } from '../../utils/site'
import { useI18n } from '../../i18n'
import { RESULT_REVEAL_DELAY_MS } from '../../utils/motion'

const MAX_LIVES = 4
const SHARE_EMOJI = ['🟨', '🟩', '🟦', '🟪'] // per group index
const GROUP_COLORS = [
  'bg-amber-800/40 border-amber-600',
  'bg-green-800/40 border-green-600',
  'bg-blue-800/40 border-blue-600',
  'bg-purple-800/40 border-purple-600',
]
const keyOf = names => [...names].sort().join('|')

export default function FootballConnections() {
  const { t, lp } = useI18n()
  const [mode, setMode] = useState('daily') // 'daily' | 'unlimited'
  const [puzzle, setPuzzle] = useState(() => getDailyConnections())
  const [solved, setSolved] = useState([])        // [{ groupIndex, label, players }]
  const [selected, setSelected] = useState([])    // names
  const [lives, setLives] = useState(MAX_LIVES)
  const [order, setOrder] = useState(() => puzzle.tiles)
  const [message, setMessage] = useState('')
  const [pastGuesses, setPastGuesses] = useState(new Set())
  const [guessRows, setGuessRows] = useState([]) // each row: group index per selected tile
  const [shake, setShake] = useState(false)

  const solvedNames = useMemo(() => new Set(solved.flatMap(s => s.players)), [solved])
  const remaining = order.filter(n => !solvedNames.has(n))
  const won = solved.length === 4
  const lost = lives <= 0 && !won
  const over = won || lost

  const [dailyStats, setDailyStats] = useState(null)
  // Only Daily mode records stats/streaks.
  useEffect(() => { if (over && mode === 'daily') setDailyStats(recordResult('connections', won)) }, [over, won, mode])

  const newGame = (m) => {
    setMode(m)
    const p = m === 'daily' ? getDailyConnections() : getRandomConnections()
    setPuzzle(p); setOrder(p.tiles)
    setSolved([]); setSelected([]); setLives(MAX_LIVES); setMessage('')
    setPastGuesses(new Set()); setGuessRows([]); setDailyStats(null); setShowResult(false)
  }
  const [showResult, setShowResult] = useState(false)
  useEffect(() => {
    if (!over) return
    const t = setTimeout(() => setShowResult(true), RESULT_REVEAL_DELAY_MS) // let the solved groups show first
    return () => clearTimeout(t)
  }, [over])

  const toggle = (name) => {
    if (over) return
    setMessage('')
    setSelected(sel => sel.includes(name) ? sel.filter(n => n !== name) : sel.length < 4 ? [...sel, name] : sel)
  }

  const submit = () => {
    if (selected.length !== 4 || over) return
    const key = keyOf(selected)
    if (pastGuesses.has(key)) { setMessage(t('connections.alreadyGuessed')); return }

    // record this guess as a colour row (the group each selected tile belongs to)
    setGuessRows(rows => [...rows, selected.map(n => puzzle.groups.findIndex(g => g.players.includes(n)))])

    const match = puzzle.groups.findIndex(g => keyOf(g.players) === key)
    if (match >= 0) {
      setSolved(s => [...s, { groupIndex: match, label: puzzle.groups[match].label, players: puzzle.groups[match].players }])
      setSelected([])
      setMessage('')
      return
    }

    // wrong — record, deduct a life, hint if one away
    setPastGuesses(p => new Set(p).add(key))
    const oneAway = puzzle.groups.some(g => g.players.filter(p => selected.includes(p)).length === 3)
    setLives(l => l - 1)
    setMessage(oneAway ? t('connections.oneAway') : t('connections.notGroup'))
    setShake(true); setTimeout(() => setShake(false), 400)
    setSelected([])
  }

  const shuffleTiles = () => {
    setOrder([...solved.flatMap(s => s.players), ...shuffleNames(remaining)])
  }

  // On loss, reveal the groups not yet solved.
  const revealed = lost
    ? puzzle.groups.map((g, i) => ({ groupIndex: i, label: g.label, players: g.players }))
        .filter(g => !solved.some(s => s.groupIndex === g.groupIndex))
    : []
  const shownGroups = [...solved, ...revealed]

  const mistakes = MAX_LIVES - lives
  const shareText = [
    t('share.connTitle'),
    won ? (mistakes ? (mistakes === 1 ? t('share.connWonOne', { n: mistakes }) : t('share.connWonMany', { n: mistakes })) : t('share.connWonNo')) : t('share.connLost'),
    ...(won && dailyStats?.currentStreak ? [t('share.dayStreak', { n: dailyStats.currentStreak })] : []),
    '',
    ...guessRows.map(r => r.map(g => SHARE_EMOJI[g]).join('')),
    '',
    SITE_URL,
  ].join('\n')

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-5">
        <Link to={lp('/')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{t('common.allGames')}</Link>
        <div className="score-number text-xl text-gray-500 tracking-wider">{t('connections.wordmark')}</div>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < lives ? 'bg-gray-300' : 'bg-gray-800'}`} />
          ))}
        </div>
      </div>

      <ModeToggle mode={mode} onChange={newGame} className="mb-4" />

      <div className="w-full max-w-lg mb-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div className="text-white font-bold text-sm">{t('connections.intro')}</div>
          <div className="text-gray-500 text-xs mt-0.5">{t('connections.introSub')}</div>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-2">
        {/* Solved / revealed group bars */}
        {shownGroups.map(g => (
          <div key={g.groupIndex} className={`rounded-xl border px-4 py-3 text-center ${GROUP_COLORS[g.groupIndex]}`}>
            <div className="flex items-center justify-center gap-1.5">
              <CategoryIcon category={puzzle.groups[g.groupIndex].category} size={18} />
              <div className="text-white font-bold text-xs uppercase tracking-wide">{g.label}</div>
            </div>
            <div className="text-gray-200 text-sm mt-0.5">{g.players.join(', ')}</div>
          </div>
        ))}

        {/* Remaining tiles */}
        {!over && (
          <div className={`grid grid-cols-4 gap-2 ${shake ? 'shake' : ''}`}>
            {remaining.map(name => {
              const isSel = selected.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggle(name)}
                  className={`aspect-square rounded-lg border px-1 flex items-center justify-center text-center text-[11px] sm:text-xs font-semibold leading-tight transition-colors ${
                    isSel ? 'border-green-500 bg-gray-700 text-white' : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {message && <div className="w-full max-w-lg mt-3 text-center text-sm text-amber-400">{message}</div>}

      {!over && (
        <div className="w-full max-w-lg mt-4 flex gap-3">
          <button onClick={shuffleTiles} className="flex-1 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium rounded-xl py-3 transition-colors">{t('connections.shuffle')}</button>
          <button onClick={() => setSelected([])} disabled={!selected.length} className="flex-1 border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-40 text-sm font-medium rounded-xl py-3 transition-colors">{t('connections.deselect')}</button>
          <button onClick={submit} disabled={selected.length !== 4} className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl py-3 transition-colors">{t('connections.submit')}</button>
        </div>
      )}

      {over && !showResult && (
        <button onClick={() => setShowResult(true)} className="mt-5 text-sm text-green-400 hover:text-green-300 font-medium transition-colors">{t('common.seeResult')}</button>
      )}

      <ResultModal open={showResult} onClose={() => setShowResult(false)}>
        <div className="w-full flex flex-col items-center text-center">
          <div className="text-5xl mb-2">{won ? '🎉' : '💔'}</div>
          <h2 className={`score-number text-3xl mb-1 ${won ? 'text-green-400' : 'text-red-400'}`}>
            {won ? t('connections.solved') : t('connections.outOf')}
          </h2>
          <p className="text-gray-400">
            {won
              ? t('connections.foundAll', { n: MAX_LIVES - lives })
              : mode === 'daily' ? t('common.comeBackTomorrow') : t('connections.betterLuck')}
          </p>
          {mode === 'daily' && <DailyStats game="connections" stats={dailyStats} />}
          <ShareCard text={shareText} />
          <button onClick={() => newGame('unlimited')} className="mt-3 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg px-6 py-2.5 transition-colors">{mode === 'daily' ? t('common.playUnlimited') : t('connections.newPuzzle')}</button>
        </div>
        <MoreGames current="/connections" />
      </ResultModal>
    </div>
  )
}
