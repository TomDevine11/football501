import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { players as localPlayers } from '../../data/players'
import { getFlagFromNationality, formatDOB, normalizeName } from '../../utils/flags'
import { SITE_URL } from '../../utils/site'
import { ShareCard } from '../../components/ShareCard'
import MoreGames from '../../components/MoreGames'
import { CHALLENGES, getDailyChallenge, getRandomChallenge, validateGuess } from '../../data/football501/game'

const MAX_SCORE    = 501
const CHECKOUT_MIN = -10
const DARTS_MIN    = 1
const DARTS_MAX    = 180

const TSDB = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p='
const EXCLUDE_SPORTS = new Set(['basketball','american football','baseball','ice hockey','tennis','golf','cricket','rugby','swimming','athletics','motorsport','cycling','boxing','mma'])

const POS_ABBR = { goalkeeper: 'GK', defender: 'DEF', midfielder: 'MID', forward: 'FWD' }
const POS_COLORS = {
  goalkeeper: 'text-yellow-400 bg-yellow-900/40 border-yellow-800/50',
  defender:   'text-blue-400   bg-blue-900/40   border-blue-800/50',
  midfielder: 'text-green-400  bg-green-900/40  border-green-800/50',
  forward:    'text-red-400    bg-red-900/40    border-red-800/50',
}

function broadenPosition(raw) {
  if (!raw) return null
  const lc = raw.toLowerCase()
  if (lc.includes('goalkeeper') || lc.includes('keeper')) return 'goalkeeper'
  if (lc.includes('defender') || lc.includes('back') || lc.includes('sweeper') || lc.includes('libero')) return 'defender'
  if (lc.includes('midfield')) return 'midfielder'
  if (lc.includes('forward') || lc.includes('striker') || lc.includes('wing') || lc.includes('attacker')) return 'forward'
  return null
}

const isValidDartsScore = (n) => Number.isInteger(n) && n >= DARTS_MIN && n <= DARTS_MAX

function getScoreColor(score) {
  if (score <= 40)  return 'text-green-400'
  if (score <= 100) return 'text-yellow-400'
  if (score <= 200) return 'text-orange-400'
  return 'text-white'
}

function rankSuggestions(list, query, knownNames = new Set()) {
  const lower = query.trim().toLowerCase()
  const queryWords = lower.split(/\s+/)
  const lastWord = queryWords[queryWords.length - 1]
  const getScore = (name) => {
    const n = name.toLowerCase()
    const words = n.split(/\s+/)
    let s = 0
    if (n.startsWith(lower)) s += 100
    else if (words.some(w => w.startsWith(lastWord))) s += 60
    else if (queryWords.every(qw => words.some(w => w.startsWith(qw)))) s += 40
    else s += 10
    if (knownNames.has(name)) s += 35
    return s
  }
  return [...list]
    .map(p => ({ p, s: getScore(p.name) }))
    .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
    .map(({ p }) => p)
}

// ── Score display ─────────────────────────────────────────────────
function ScoreDisplay({ score }) {
  const [animKey, setAnimKey] = useState(0)
  useEffect(() => { setAnimKey(k => k + 1) }, [score])
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-medium">Score</div>
      <div key={animKey} className={`score-number score-pop text-8xl md:text-9xl font-black ${getScoreColor(score)} leading-none tabular-nums`}>
        {score}
      </div>
      {score <= 40 && score > 0 && (
        <div className="mt-2 text-green-400 text-sm font-semibold uppercase tracking-widest animate-pulse">Checkout zone</div>
      )}
    </div>
  )
}

// ── Scoreboard (local multiplayer) ─────────────────────────────────
function Scoreboard({ players, currentPlayerIndex }) {
  if (players.length <= 1) return null
  return (
    <div className="w-full max-w-lg mb-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
      {players.map((p, i) => {
        const active = i === currentPlayerIndex && !p.finished
        return (
          <div key={i} className={`rounded-lg border px-3 py-2 text-center transition-colors ${active ? 'border-green-500 bg-green-900/20' : 'border-gray-800 bg-gray-900'}`}>
            <div className="text-xs text-gray-400 truncate">{p.name}</div>
            <div className={`text-lg font-black tabular-nums ${p.finished ? 'text-green-400' : 'text-white'}`}>{p.score}</div>
            {p.finished && <div className="text-[10px] text-green-500 uppercase tracking-wide font-medium">checked out</div>}
            {active && <div className="text-[10px] text-green-400 uppercase tracking-wide font-medium animate-pulse">your turn</div>}
          </div>
        )
      })}
    </div>
  )
}

const scoreSquare = (deducted) => (deducted <= 25 ? '🟩' : deducted <= 75 ? '🟨' : '🟥')

function buildSoloShareText(challenge, score, valid) {
  const grid = valid.map(g => scoreSquare(g.scoreDeducted)).join('') + (score >= CHECKOUT_MIN && score <= 0 ? '🎯' : '')
  return [`⚽ Football 501 — ${challenge.title}`, `Checked out on ${score} in ${valid.length} darts`, '', grid, '', SITE_URL].join('\n')
}
function buildMultiplayerShareText(challenge, ranked, winners) {
  const headline = winners.length > 1 ? "It's a tie!" : `${winners[0].name} wins!`
  return [`⚽ Football 501 — ${challenge.title}`, headline, '', ...ranked.map((p, i) => `${i + 1}. ${p.name} — ${p.finalScore}`), '', SITE_URL].join('\n')
}

// ── Win screen ────────────────────────────────────────────────────
function WinScreen({ history, players, challenge, onPlayAgain, onExit }) {
  const isSolo = players.length === 1

  if (isSolo) {
    const score = players[0].finalScore
    const valid = history.filter(g => g.valid)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="score-number text-6xl text-green-400 mb-2">CHECKOUT!</h2>
          <p className="text-gray-400">
            {challenge.title} (<span className="text-gray-300">{challenge.statLabel}</span>)<br />
            Finished on <span className="text-white font-bold">{score}</span> in <span className="text-white font-bold">{valid.length}</span> darts
          </p>
        </div>

        <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest font-medium">Route to checkout</div>
          <div className="divide-y divide-gray-800/50 max-h-80 overflow-y-auto">
            {valid.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{g.player.flag}</span>
                  <span className="text-white text-sm font-medium">{g.player.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-mono">
                  <span className="text-red-400 font-medium">−{g.scoreDeducted}</span>
                  <span className={`font-bold tabular-nums w-10 text-right ${g.isCheckout ? 'text-green-400' : 'text-gray-300'}`}>{g.newScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ShareCard text={buildSoloShareText(challenge, score, valid)} />
        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">Play again</button>
          <button onClick={onExit} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">Menu</button>
        </div>
        <MoreGames current="/501" />
      </div>
    )
  }

  const ranked = players.map((p, i) => ({ ...p, idx: i })).sort((a, b) => b.finalScore - a.finalScore)
  const winnerScore = ranked[0].finalScore
  const winners = ranked.filter(p => p.finalScore === winnerScore)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="score-number text-5xl text-green-400 mb-2">{winners.length > 1 ? "IT'S A TIE!" : `${winners[0].name} WINS!`}</h2>
        <p className="text-gray-400">{challenge.title}<br />Closest to 0 on checkout wins</p>
      </div>

      <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest font-medium">Final scores</div>
        <div className="divide-y divide-gray-800/50">
          {ranked.map((p, i) => (
            <div key={p.idx} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm font-mono w-5">{i + 1}</span>
                <span className="text-white text-sm font-medium">{p.name}</span>
                {p.finalScore === winnerScore && <span className="text-base">🏆</span>}
              </div>
              <span className="font-bold tabular-nums text-green-400">{p.finalScore}</span>
            </div>
          ))}
        </div>
      </div>

      <ShareCard text={buildMultiplayerShareText(challenge, ranked, winners)} />
      <div className="flex gap-3">
        <button onClick={onPlayAgain} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">Play again</button>
        <button onClick={onExit} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">Menu</button>
      </div>
      <MoreGames current="/501" />
    </div>
  )
}

// ── Guess history ─────────────────────────────────────────────────
function GuessHistory({ history, showPlayer }) {
  if (!history.length) return null
  return (
    <div className="w-full max-w-lg mt-5">
      <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">History ({history.length})</div>
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <div className="divide-y divide-gray-800/40 max-h-72 overflow-y-auto">
          {[...history].reverse().map((g, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${g.valid ? 'flash-valid' : 'flash-invalid'}`}>
              <div className="flex-1 min-w-0 mr-4 flex items-center gap-2">
                <span className="text-base shrink-0">{g.player.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {showPlayer && <span className="text-xs text-gray-500 shrink-0">{g.playerName}:</span>}
                    <span className="text-sm font-medium text-white truncate">{g.player.name}</span>
                    {g.player.position && <span className={`shrink-0 text-xs font-bold px-1 py-0 rounded border ${POS_COLORS[g.player.position]}`}>{POS_ABBR[g.player.position]}</span>}
                  </div>
                  {!g.valid && <div className="text-xs text-red-400 mt-0.5 truncate">{g.reason}</div>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm font-mono shrink-0">
                {g.valid ? (
                  <>
                    <span className="text-red-400">−{g.scoreDeducted}</span>
                    <span className={`font-bold tabular-nums w-8 text-right ${g.isCheckout ? 'text-green-400' : 'text-gray-300'}`}>{g.newScore}</span>
                  </>
                ) : g.statScore != null ? (
                  <span className="text-orange-400 text-xs font-semibold tabular-nums">{g.statScore} · bust</span>
                ) : <span className="text-red-500 text-xs font-semibold">✗</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Entry: Daily (solo) vs Unlimited (multiplayer) ────────────────
function EntryScreen({ onDaily, onUnlimited }) {
  const daily = getDailyChallenge()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl mb-6">
        <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← All games</Link>
      </div>
      <div className="mb-10 text-center">
        <h1 className="score-number text-6xl md:text-7xl text-white mb-4">FOOTBALL 501</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
          Name players to count down from <span className="text-white font-bold">501</span>. Each player's stat is deducted.
          Land between <span className="text-green-400 font-bold">0 and −10</span> to check out.
        </p>
      </div>
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={onDaily} className="group bg-gray-900 border border-gray-800 hover:border-green-600 hover:ring-1 hover:ring-green-600/30 rounded-xl p-6 text-left transition-all">
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-white font-bold text-xl">Daily Challenge</div>
          <div className="text-green-400 text-sm mt-1 font-medium">Solo</div>
          <div className="text-gray-600 text-xs mt-3 leading-relaxed">Today: <span className="text-gray-400">{daily.title}</span></div>
        </button>
        <button onClick={onUnlimited} className="group bg-gray-900 border border-gray-800 hover:border-purple-500 hover:ring-1 hover:ring-purple-500/30 rounded-xl p-6 text-left transition-all">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-white font-bold text-xl">Unlimited</div>
          <div className="text-purple-400 text-sm mt-1 font-medium">Local multiplayer</div>
          <div className="text-gray-600 text-xs mt-3 leading-relaxed">Pick any challenge, 2–5 players take turns — closest to 0 on checkout wins.</div>
        </button>
      </div>
      <div className="mt-8 text-gray-700 text-xs text-center max-w-sm leading-relaxed">Valid darts scores: 1–179 · Checkout 0 to −10 · Below −10 = bust</div>
    </div>
  )
}

// ── Unlimited setup: pick a challenge, then player count ───────────
function UnlimitedSetup({ onStart, onBack }) {
  const [challenge, setChallenge] = useState(null)
  const groups = [...new Set(CHALLENGES.map(c => c.group))]

  if (!challenge) return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg mb-6"><button onClick={onBack} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Back</button></div>
      <h2 className="text-white font-black text-2xl mb-6">Choose a challenge</h2>
      <div className="w-full max-w-lg space-y-5">
        {groups.map(group => (
          <div key={group}>
            <div className="text-xs text-gray-600 uppercase tracking-widest font-medium mb-2 px-1">{group}</div>
            <div className="grid grid-cols-1 gap-2">
              {CHALLENGES.filter(c => c.group === group).map(c => (
                <button key={c.id} onClick={() => setChallenge(c)} className="bg-gray-900 border border-gray-800 hover:border-green-600 rounded-lg px-4 py-3 text-left transition-colors">
                  <div className="text-white text-sm font-semibold">{c.title}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{c.count} possible answers</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={() => setChallenge(null)} className="text-gray-600 hover:text-gray-400 text-sm transition-colors mb-6">← Back to challenges</button>
        <div className="mb-8 text-center">
          <h2 className="text-white font-black text-2xl leading-tight">{challenge.title}</h2>
          <div className="text-gray-500 text-sm mt-1">How many players?</div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => onStart(challenge, n)} className="bg-gray-900 border border-gray-800 hover:border-green-600 rounded-xl py-6 text-center text-2xl font-black text-white transition-colors">{n}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Football501() {
  const [phase, setPhase] = useState('entry')   // entry | unlimited | playing | won
  const [challenge, setChallenge] = useState(null)
  const [isDaily, setIsDaily] = useState(false)
  const [knownNames, setKnownNames] = useState(new Set())
  const [players, setPlayers] = useState([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [history, setHistory] = useState([])
  const [numPlayers, setNumPlayers] = useState(1)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const score = players[currentPlayerIndex]?.score ?? MAX_SCORE
  const usedNames = new Set(history.map(g => g.player.name))

  // ── Player search (TheSportsDB + local pool) ──────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    if (input.trim().length < 2) { setSuggestions([]); setIsSearching(false); return }

    setIsSearching(true)
    const controller = new AbortController()
    const lower = input.toLowerCase()
    const localMatches = localPlayers.filter(p => !usedNames.has(p.name) && p.name.toLowerCase().includes(lower))
    const merge = (apiPlayers) => {
      const apiNorms = new Set(apiPlayers.map(p => normalizeName(p.name)))
      const extra = localMatches.filter(p => !apiNorms.has(normalizeName(p.name)))
      return rankSuggestions([...apiPlayers, ...extra], input, knownNames).slice(0, 10)
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(TSDB + encodeURIComponent(input), { signal: controller.signal })
        const data = await res.json()
        const apiPlayers = (data.player || [])
          .filter(p => !EXCLUDE_SPORTS.has((p.strSport || '').toLowerCase()))
          .filter(p => !usedNames.has(p.strPlayer))
          .map(p => ({ name: p.strPlayer, nationality: p.strNationality || '', flag: getFlagFromNationality(p.strNationality), dob: formatDOB(p.dateBorn), position: broadenPosition(p.strPosition) }))
        setSuggestions(merge(apiPlayers))
      } catch (err) {
        if (err.name === 'AbortError') return
        setSuggestions(rankSuggestions(localMatches, input, knownNames).slice(0, 10))
      } finally { setIsSearching(false) }
    }, 280)

    setSuggestions(rankSuggestions(localMatches, input, knownNames).slice(0, 10))
    return () => { clearTimeout(timer); controller.abort(); setIsSearching(false) }
  }, [input, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start / reset ─────────────────────────────────────────────
  const startGame = (ch, count, daily) => {
    setChallenge(ch)
    setIsDaily(!!daily)
    setNumPlayers(count)
    setKnownNames(new Set(localPlayers.map(p => p.name)))
    setPlayers(Array.from({ length: count }, (_, i) => ({ name: count === 1 ? 'You' : `Player ${i + 1}`, score: MAX_SCORE, finished: false, finalScore: null })))
    setCurrentPlayerIndex(0)
    setHistory([]); setInput(''); setSuggestions([]); setHighlightedIndex(-1)
    setPhase('playing')
    setTimeout(() => inputRef.current?.focus(), 100)
  }
  const playDaily = () => startGame(getDailyChallenge(), 1, true)
  const playAgain = () => startGame(isDaily ? challenge : (numPlayers === 1 ? getRandomChallenge() : challenge), numPlayers, isDaily)

  // ── Submit a guess ────────────────────────────────────────────
  const submitGuess = useCallback((player) => {
    setInput(''); setSuggestions([]); setHighlightedIndex(-1)

    const playerIdx = currentPlayerIndex
    const playerName = players[playerIdx].name
    const scoreAtTime = players[playerIdx].score

    const recordAndAdvance = (entry, newScore = null, isCheckout = false) => {
      setHistory(prev => [...prev, { ...entry, playerIdx, playerName }])
      const next = players.map((p, i) => {
        if (i !== playerIdx || newScore === null) return p
        return isCheckout ? { ...p, score: newScore, finished: true, finalScore: newScore } : { ...p, score: newScore }
      })
      setPlayers(next)
      if (isCheckout && next.every(p => p.finished)) { setTimeout(() => setPhase('won'), 500); return }
      let idx = playerIdx
      do { idx = (idx + 1) % next.length } while (next[idx].finished)
      setCurrentPlayerIndex(idx)
    }

    const result = validateGuess(challenge.id, player.name)
    if (result.status !== 'valid') {
      const reason = result.status === 'ambiguous'
        ? `Ambiguous — did you mean ${result.options.join(' or ')}?`
        : `${player.name} isn't a valid answer for this challenge`
      recordAndAdvance({ player, valid: false, statScore: null, reason, scoreAtTime })
      return
    }

    const statScore = result.value
    // Recognised answer, but over a darts visit (>180) → bust, shown with value.
    if (statScore > DARTS_MAX) {
      recordAndAdvance({ player, valid: false, statScore, reason: `${statScore} — over 180, bust`, scoreAtTime })
      return
    }
    if (!isValidDartsScore(statScore)) {
      recordAndAdvance({ player, valid: false, statScore, reason: `${statScore} — can't be deducted`, scoreAtTime })
      return
    }

    const newScore = scoreAtTime - statScore
    const isCheckout = newScore >= CHECKOUT_MIN && newScore <= 0
    if (newScore < CHECKOUT_MIN) {
      recordAndAdvance({ player, valid: false, statScore, reason: `${statScore} — busts (${scoreAtTime} − ${statScore} = ${newScore}, below −10)`, scoreAtTime })
      return
    }

    recordAndAdvance({ player, valid: true, scoreDeducted: statScore, scoreAtTime, newScore, isCheckout, breakdown: result.breakdown }, newScore, isCheckout)
  }, [players, currentPlayerIndex, challenge])

  const handleKeyDown = (e) => {
    if (!suggestions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const t = highlightedIndex >= 0 ? suggestions[highlightedIndex] : suggestions.length === 1 ? suggestions[0] : null
      if (t) submitGuess(t)
    } else if (e.key === 'Escape') { setSuggestions([]); setHighlightedIndex(-1) }
  }

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current?.contains(e.target) || inputRef.current?.contains(e.target)) return
      setSuggestions([])
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Render ────────────────────────────────────────────────────
  if (phase === 'entry') return <EntryScreen onDaily={playDaily} onUnlimited={() => setPhase('unlimited')} />
  if (phase === 'unlimited') return <UnlimitedSetup onStart={(ch, n) => startGame(ch, n, false)} onBack={() => setPhase('entry')} />
  if (phase === 'won') return <WinScreen history={history} players={players} challenge={challenge} onPlayAgain={playAgain} onExit={() => setPhase('entry')} />

  const validCount = history.filter(g => g.valid).length
  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <button onClick={() => setPhase('entry')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Menu</button>
        <div className="score-number text-xl text-gray-500 tracking-wider">FOOTBALL 501</div>
        <div className="text-gray-600 text-sm tabular-nums">{validCount} darts</div>
      </div>

      {/* Challenge card */}
      <div className="w-full max-w-lg mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <div className="text-white font-bold text-sm">{challenge.title}</div>
          <div className="text-gray-500 text-xs mt-0.5">Deducting: <span className="text-gray-400">{challenge.statLabel}</span></div>
          {challenge.hint && <div className="text-gray-600 text-xs mt-2 leading-relaxed">{challenge.hint}</div>}
        </div>
      </div>

      <Scoreboard players={players} currentPlayerIndex={currentPlayerIndex} />
      {numPlayers > 1 && <div className="mb-3 text-sm font-semibold text-green-400 uppercase tracking-widest animate-pulse">{currentPlayer.name}'s turn</div>}

      <div className="mb-7"><ScoreDisplay score={score} /></div>

      {/* Input */}
      <div className="relative w-full max-w-lg">
        <input
          ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Type any player name..." autoFocus
          className="w-full bg-gray-900 border border-gray-700 focus:border-green-600 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-base outline-none transition-colors"
          autoComplete="off" autoCorrect="off" spellCheck="false"
        />
        {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin" /></div>}
        {suggestions.length > 0 && (
          <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-10 shadow-2xl">
            {suggestions.map((player, i) => (
              <button key={player.name} onMouseDown={e => { e.preventDefault(); submitGuess(player) }} onMouseEnter={() => setHighlightedIndex(i)}
                className={`w-full text-left px-4 py-2.5 transition-colors border-b border-gray-800/50 last:border-0 ${i === highlightedIndex ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{player.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-medium truncate">{player.name}</div>
                    <div className="text-gray-500 text-xs">{player.nationality}{player.dob ? ` · ${player.dob}` : ''}</div>
                  </div>
                  {player.position && <span className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded border ${POS_COLORS[player.position]}`}>{POS_ABBR[player.position]}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-lg mt-3 flex justify-between text-xs text-gray-700 px-1">
        <span>Valid: 1–179</span><span>Checkout: 0 to −10</span><span>Below −10 = bust</span>
      </div>

      <GuessHistory history={history} showPlayer={numPlayers > 1} />
    </div>
  )
}
