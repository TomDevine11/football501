import { useState, useRef, useEffect, useCallback } from 'react'
import { players as localPlayers } from './data/players'
import { MODES } from './data/modes'
import { getFlagFromNationality, formatDOB, normalizeName } from './utils/flags'

const MAX_SCORE    = 501
const CHECKOUT_MIN = -10
const DARTS_MIN    = 1
const DARTS_MAX    = 180

const SITE_URL = 'https://football501.onrender.com'

const TSDB = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p='

// Map TheSportsDB position strings to broad categories
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
  if (lc.includes('goalkeeper') || lc.includes('goaltender') || lc.includes('keeper')) return 'goalkeeper'
  if (lc.includes('defender') || lc.includes('back') || lc.includes('sweeper') || lc.includes('centre-back') || lc.includes('center-back') || lc.includes('libero')) return 'defender'
  if (lc.includes('midfielder') || lc.includes('midfield')) return 'midfielder'
  if (lc.includes('forward') || lc.includes('striker') || lc.includes('wing') || lc.includes('attacker') || lc.includes('centre-forward') || lc.includes('center-forward')) return 'forward'
  return null  // "Manager" and other non-positions return null
}

async function fetchCategoryStat(playerName, questionId) {
  const res = await fetch(
    `/api/category-stat?playerName=${encodeURIComponent(playerName)}&questionId=${encodeURIComponent(questionId)}`
  )
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}

// Fallback position lookup (TheSportsDB "Manager"/missing entries, local
// players, etc.) — server checks Wikipedia infobox for the player's
// primary/most-common position and caches the result.
async function fetchPlayerPosition(playerName) {
  try {
    const res = await fetch(`/api/position?playerName=${encodeURIComponent(playerName)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.position ?? null
  } catch {
    return null
  }
}

function isValidDartsScore(n) {
  return Number.isInteger(n) && n >= DARTS_MIN && n <= DARTS_MAX
}

function getScoreColor(score) {
  if (score <= 0)   return 'text-green-400'
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
        <div className="mt-2 text-green-400 text-sm font-semibold uppercase tracking-widest animate-pulse">
          Checkout zone
        </div>
      )}
    </div>
  )
}

// ── Mode selector (top level) ─────────────────────────────────────
const MODE_COLORS = {
  purple: { card: 'hover:border-purple-600', accent: 'text-purple-400', ring: 'hover:ring-purple-600/30' },
  yellow: { card: 'hover:border-yellow-500', accent: 'text-yellow-400', ring: 'hover:ring-yellow-500/30' },
  blue:   { card: 'hover:border-blue-500',   accent: 'text-blue-400',   ring: 'hover:ring-blue-500/30' },
  green:  { card: 'hover:border-green-600',  accent: 'text-green-400',  ring: 'hover:ring-green-600/30' },
}

// Deterministic "challenge of the day" — changes at local midnight,
// cycles through each mode's challenge list (repeats once the list is exhausted).
function getDailyChallenge(mode) {
  const now = new Date()
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  return mode.challenges[dayIndex % mode.challenges.length]
}

function ModeSelector({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <div className="text-gray-500 text-sm uppercase tracking-widest mb-2 font-medium">Welcome to</div>
        <h1 className="score-number text-6xl md:text-7xl text-white mb-4">FOOTBALL 501</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
          Name players to count down from <span className="text-white font-bold">501</span>.
          Each player's stat is deducted. Land between{' '}
          <span className="text-green-400 font-bold">0 and −10</span> to checkout.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="text-xs text-gray-600 uppercase tracking-widest font-medium mb-3 px-1">Choose a competition</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODES.map(mode => {
            const colors = MODE_COLORS[mode.color] ?? MODE_COLORS.purple
            const daily = getDailyChallenge(mode)
            return (
              <button
                key={mode.id}
                onClick={() => onSelect(mode)}
                className={`group relative bg-gray-900 border border-gray-800 ${colors.card} rounded-xl p-6 text-left transition-all duration-200 cursor-pointer ring-1 ring-transparent ${colors.ring}`}
              >
                <div className="text-4xl mb-3">{mode.emoji}</div>
                <div className="text-white font-bold text-xl leading-tight">{mode.title}</div>
                <div className={`${colors.accent} text-sm mt-1 font-medium`}>{mode.tagline}</div>
                <div className="mt-3 text-gray-600 text-xs">
                  Today: <span className="text-gray-400">{daily.emoji} {daily.title}</span>
                </div>
                <div className="absolute top-4 right-4 text-gray-700 group-hover:text-gray-400 transition-colors text-xl">→</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 text-gray-700 text-xs text-center max-w-sm leading-relaxed">
        Valid darts scores: 1–180 · Checkout between 0 and −10 · Below −10 = bust
      </div>
    </div>
  )
}

// ── Play mode selector (solo vs local multiplayer) ────────────────
function PlayModeSelector({ mode, challenge, onSelect, onBack }) {
  const colors = MODE_COLORS[mode.color] ?? MODE_COLORS.purple
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-400 text-sm transition-colors mb-6 flex items-center gap-1">
          ← Back to modes
        </button>

        <div className="mb-8 text-center">
          <div className="text-4xl mb-2">{challenge.emoji}</div>
          <h2 className="text-white font-black text-2xl leading-tight">{challenge.title}</h2>
          <div className={`${colors.accent} text-sm font-medium mt-1`}>{mode.title}</div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onSelect('solo')}
            className={`group bg-gray-900 border border-gray-800 ${colors.card} rounded-xl px-5 py-5 text-left transition-all duration-200 cursor-pointer`}
          >
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-white font-bold text-lg">Solo Play</div>
            <div className="text-gray-500 text-sm mt-1">Play by yourself and try to land the perfect checkout</div>
          </button>
          <button
            onClick={() => onSelect('multiplayer')}
            className={`group bg-gray-900 border border-gray-800 ${colors.card} rounded-xl px-5 py-5 text-left transition-all duration-200 cursor-pointer`}
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="text-white font-bold text-lg">Local Multiplayer</div>
            <div className="text-gray-500 text-sm mt-1">2–5 players take turns — closest to 0 on checkout wins</div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Player count selector (local multiplayer) ─────────────────────
function PlayerCountSelector({ onSelect, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-400 text-sm transition-colors mb-6 flex items-center gap-1">
          ← Back
        </button>

        <div className="mb-8 text-center">
          <h2 className="text-white font-black text-2xl">How many players?</h2>
          <div className="text-gray-500 text-sm mt-1">Everyone takes turns — closest to 0 on checkout wins</div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onSelect(n)}
              className="group bg-gray-900 border border-gray-800 hover:border-green-600 rounded-xl py-6 text-center transition-all duration-200 cursor-pointer"
            >
              <div className="text-3xl font-black text-white">{n}</div>
            </button>
          ))}
        </div>
      </div>
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
          <div
            key={i}
            className={`rounded-lg border px-3 py-2 text-center transition-colors ${
              active ? 'border-green-500 bg-green-900/20' : 'border-gray-800 bg-gray-900'
            }`}
          >
            <div className="text-xs text-gray-400 truncate">{p.name}</div>
            <div className={`text-lg font-black tabular-nums ${p.finished ? 'text-green-400' : 'text-white'}`}>
              {p.score}
            </div>
            {p.finished && (
              <div className="text-[10px] text-green-500 uppercase tracking-wide font-medium">checked out</div>
            )}
            {active && (
              <div className="text-[10px] text-green-400 uppercase tracking-wide font-medium animate-pulse">your turn</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Share ─────────────────────────────────────────────────────────
// Wordle-style emoji squares: small/medium/large deduction relative to 501.
function scoreSquare(deducted) {
  if (deducted <= 25) return '🟩'
  if (deducted <= 75) return '🟨'
  return '🟥'
}

function buildSoloShareText(mode, challenge, score, valid) {
  const grid = valid.map(g => scoreSquare(g.scoreDeducted)).join('') + (score >= CHECKOUT_MIN && score <= 0 ? '🎯' : '')
  return [
    `⚽ Football 501 — ${mode.title}: ${challenge.title}`,
    `Checked out on ${score} in ${valid.length} guesses`,
    '',
    grid,
    '',
    SITE_URL,
  ].join('\n')
}

function buildMultiplayerShareText(mode, challenge, ranked, winners) {
  const headline = winners.length > 1 ? "It's a tie!" : `${winners[0].name} wins!`
  return [
    `⚽ Football 501 — ${mode.title}: ${challenge.title}`,
    headline,
    '',
    ...ranked.map((p, i) => `${i + 1}. ${p.name} — ${p.finalScore}`),
    '',
    SITE_URL,
  ].join('\n')
}

const ICON_BTN = 'w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.93.55 3.733 1.502 5.262L2 22l4.873-1.452A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.828l-5.35-6.566L4.7 22H1.44l8.034-9.18L1 2h6.998l4.835 6.012L18.244 2zm-1.197 18h1.832L7.06 4H5.13l11.917 16z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

function ShareCard({ text }) {
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const flashToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleNativeShare = () => {
    navigator.share({ text, url: SITE_URL }).catch(() => {})
  }

  const handleInstagram = () => {
    navigator.clipboard.writeText(text).then(() => {
      flashToast('Result copied — paste it into your Instagram story or DM')
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    })
  }

  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(SITE_URL)

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-3 mb-2">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={handleCopy} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">
          {copied ? 'Copied!' : 'Copy result'}
        </button>
        {canNativeShare && (
          <button onClick={handleNativeShare} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <ShareIcon /> Share
          </button>
        )}
      </div>
      <div className="flex items-center justify-center gap-2.5">
        <a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className={ICON_BTN}>
          <WhatsAppIcon />
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${encodedText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={ICON_BTN}>
          <XIcon />
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className={ICON_BTN}>
          <FacebookIcon />
        </a>
        <button onClick={handleInstagram} aria-label="Share on Instagram" className={ICON_BTN}>
          <InstagramIcon />
        </button>
      </div>
      {toast && <div className="text-xs text-gray-400 text-center">{toast}</div>}
    </div>
  )
}

// ── Win screen ────────────────────────────────────────────────────
function WinScreen({ history, players, mode, challenge, onPlayAgain, onModeSelect }) {
  const statLabel = challenge.statTypes.map(s => s.replace(/-/g, ' ')).join(' + ')
  const isSolo = players.length === 1

  if (isSolo) {
    const score = players[0].finalScore
    const valid = history.filter(g => g.valid)
    const shareText = buildSoloShareText(mode, challenge, score, valid)

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="score-number text-6xl text-green-400 mb-2">CHECKOUT!</h2>
          <p className="text-gray-400">
            {mode.title} · {challenge.title} (<span className="text-gray-300">{statLabel}</span>)<br />
            Finished on <span className="text-white font-bold">{score}</span> in{' '}
            <span className="text-white font-bold">{valid.length}</span> valid guesses
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
                  {g.player.position && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${POS_COLORS[g.player.position]}`}>
                      {POS_ABBR[g.player.position]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm font-mono">
                  <span className="text-red-400 font-medium">−{g.scoreDeducted}</span>
                  <span className={`font-bold tabular-nums w-10 text-right ${g.isCheckout ? 'text-green-400' : 'text-gray-300'}`}>{g.newScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ShareCard text={shareText} />

        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Same challenge
          </button>
          <button onClick={onModeSelect} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Change mode
          </button>
        </div>
      </div>
    )
  }

  // ── Local multiplayer results ────────────────────────────────────
  const ranked = players
    .map((p, i) => ({ ...p, idx: i }))
    .sort((a, b) => b.finalScore - a.finalScore)
  const winnerScore = ranked[0].finalScore
  const winners = ranked.filter(p => p.finalScore === winnerScore)
  const shareText = buildMultiplayerShareText(mode, challenge, ranked, winners)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="score-number text-5xl text-green-400 mb-2">
          {winners.length > 1 ? "IT'S A TIE!" : `${winners[0].name} WINS!`}
        </h2>
        <p className="text-gray-400">
          {mode.title} · {challenge.title} (<span className="text-gray-300">{statLabel}</span>)<br />
          Closest to 0 on checkout wins
        </p>
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

      <ShareCard text={shareText} />

      <div className="flex gap-3">
        <button onClick={onPlayAgain} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">
          Play Again
        </button>
        <button onClick={onModeSelect} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">
          Change mode
        </button>
      </div>
    </div>
  )
}

// ── Guess history ─────────────────────────────────────────────────
function GuessHistory({ history, showPlayer }) {
  if (!history.length) return null
  return (
    <div className="w-full max-w-lg mt-5">
      <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">
        History ({history.length})
      </div>
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
                    {g.player.position && (
                      <span className={`shrink-0 text-xs font-bold px-1 py-0 rounded border ${POS_COLORS[g.player.position]}`}>
                        {POS_ABBR[g.player.position]}
                      </span>
                    )}
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
                  <span className="text-gray-500 text-xs font-mono tabular-nums">{g.statScore}</span>
                ) : (
                  <span className="text-red-500 text-xs font-semibold">✗</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase]             = useState('mode-select')
  const [selectedMode, setSelectedMode] = useState(null)
  const [challenge, setChallenge]     = useState(null)
  const [knownNames, setKnownNames]   = useState(new Set())
  const [players, setPlayers]         = useState([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [history, setHistory]         = useState([])
  const [numPlayers, setNumPlayers]   = useState(1)
  const [input, setInput]             = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const inputRef    = useRef(null)
  const dropdownRef = useRef(null)
  const positionAttempts = useRef(new Set())

  const score      = players[currentPlayerIndex]?.score ?? MAX_SCORE
  const usedNames  = new Set(history.map(g => g.player.name))

  // ── Player search ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    if (input.trim().length < 2) { setSuggestions([]); setIsSearching(false); return }

    setIsSearching(true)
    const controller = new AbortController()
    const EXCLUDE_SPORTS = new Set(['basketball','american football','baseball','ice hockey','tennis','golf','cricket','rugby','swimming','athletics','motorsport','cycling','boxing','mma'])
    const lower = input.toLowerCase()
    const localMatches = localPlayers.filter(p => !usedNames.has(p.name) && p.name.toLowerCase().includes(lower))

    const merge = (apiPlayers) => {
      const apiNorms = new Set(apiPlayers.map(p => normalizeName(p.name)))
      const extra    = localMatches.filter(p => !apiNorms.has(normalizeName(p.name)))
      return rankSuggestions([...apiPlayers, ...extra], input, knownNames).slice(0, 10)
    }

    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(TSDB + encodeURIComponent(input), { signal: controller.signal })
        const data = await res.json()
        const apiPlayers = (data.player || [])
          .filter(p => !EXCLUDE_SPORTS.has((p.strSport || '').toLowerCase()))
          .filter(p => !usedNames.has(p.strPlayer))
          .map(p => ({
            name:        p.strPlayer,
            nationality: p.strNationality || '',
            flag:        getFlagFromNationality(p.strNationality),
            dob:         formatDOB(p.dateBorn),
            position:    broadenPosition(p.strPosition),
          }))
        setSuggestions(merge(apiPlayers))
      } catch (err) {
        if (err.name === 'AbortError') return
        setSuggestions(rankSuggestions(localMatches, input, knownNames).slice(0, 10))
      } finally {
        setIsSearching(false)
      }
    }, 280)

    setSuggestions(rankSuggestions(localMatches, input, knownNames).slice(0, 10))
    return () => { clearTimeout(timer); controller.abort(); setIsSearching(false) }
  }, [input, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Backfill positions for suggestions TheSportsDB couldn't classify ──
  // (retired players shown as "Manager", players missing from TSDB, local
  // fallback players, etc.) so every player box gets a position badge.
  // Capped + sequential + cached to avoid hammering TheSportsDB's rate
  // limit, which previously starved the main player-search requests.
  useEffect(() => {
    const missing = suggestions
      .filter(p => p.position == null && !positionAttempts.current.has(p.name))
      .slice(0, 3)
    if (!missing.length) return

    let cancelled = false
    ;(async () => {
      for (const player of missing) {
        positionAttempts.current.add(player.name)
        const position = await fetchPlayerPosition(player.name)
        if (cancelled) return
        if (position) {
          setSuggestions(prev => prev.map(p => p.name === player.name ? { ...p, position } : p))
        }
      }
    })()
    return () => { cancelled = true }
  }, [suggestions])

  // ── Mode / play-mode / player-count selection ──────────────────
  const handleModeSelect = (mode) => {
    setSelectedMode(mode)
    setChallenge(getDailyChallenge(mode))
    setPhase('play-mode-select')
  }

  const handlePlayModeSelect = (playMode) => {
    if (playMode === 'solo') startGame(1)
    else setPhase('player-count-select')
  }

  const handlePlayerCountSelect = (count) => startGame(count)

  const startGame = (count) => {
    setNumPlayers(count)
    setKnownNames(new Set(localPlayers.map(p => p.name)))
    setPlayers(Array.from({ length: count }, (_, i) => ({
      name: count === 1 ? 'You' : `Player ${i + 1}`,
      score: MAX_SCORE,
      finished: false,
      finalScore: null,
    })))
    setCurrentPlayerIndex(0)
    setHistory([])
    setInput('')
    setSuggestions([])
    setHighlightedIndex(-1)
    setPhase('playing')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── Submit guess ──────────────────────────────────────────────
  // Records the guess in the global history log and applies the result to
  // the current player. In local multiplayer, every guess (valid, invalid,
  // or busted) ends that player's turn and passes to the next player who
  // hasn't checked out yet. Once everyone has checked out, the game ends.
  const submitGuess = useCallback(async (player) => {
    setInput(''); setSuggestions([]); setHighlightedIndex(-1)
    setIsLookingUp(true)

    const statLabel    = challenge.statTypes.map(s => s.replace(/-/g, ' ')).join(' + ')
    const playerIdx    = currentPlayerIndex
    const playerName   = players[playerIdx].name
    const scoreAtTime  = players[playerIdx].score

    const recordAndAdvance = (entry, newScore = null, isCheckout = false) => {
      setHistory(prev => [...prev, { ...entry, playerIdx, playerName }])

      const next = players.map((p, i) => {
        if (i !== playerIdx) return p
        if (newScore === null) return p
        return isCheckout ? { ...p, score: newScore, finished: true, finalScore: newScore } : { ...p, score: newScore }
      })
      setPlayers(next)

      if (isCheckout && next.every(p => p.finished)) {
        setTimeout(() => setPhase('won'), 500)
      } else {
        let idx = playerIdx
        do { idx = (idx + 1) % next.length } while (next[idx].finished)
        setCurrentPlayerIndex(idx)
      }
    }

    // Every player guessed must end up with a position badge — fall back
    // to the Wikipedia-backed lookup if TheSportsDB didn't give us one
    // (e.g. retired players listed as "Manager", or local fallback players).
    if (player.position == null) {
      const fallbackPos = await fetchPlayerPosition(player.name)
      if (fallbackPos) player = { ...player, position: fallbackPos }
    }

    let statScore, breakdown
    try {
      const result = await fetchCategoryStat(player.name, challenge.id)

      if (!result.filterMatch) {
        recordAndAdvance({
          player, valid: false, statScore: null,
          reason: result.reason || 'Not eligible for this category',
          scoreAtTime,
        })
        return
      }

      statScore = result.stat ?? 0
      breakdown = result.breakdown ?? {}
    } catch (err) {
      recordAndAdvance({
        player, valid: false,
        reason: `Server error — is the stats server running? (${err.message})`,
        scoreAtTime,
      })
      return
    } finally {
      setIsLookingUp(false)
    }

    if (!isValidDartsScore(statScore)) {
      recordAndAdvance({
        player, valid: false, statScore,
        reason: statScore === 0
          ? `0 ${statLabel} — can't contribute to your score`
          : statScore > DARTS_MAX
            ? `${statScore} ${statLabel} — over 180, bust on the board!`
            : `${statScore} ${statLabel} — not a valid darts score (must be 1–180)`,
        scoreAtTime,
      })
      return
    }

    const newScore   = scoreAtTime - statScore
    const isCheckout = newScore >= CHECKOUT_MIN && newScore <= 0

    if (newScore < CHECKOUT_MIN) {
      recordAndAdvance({
        player, valid: false, statScore,
        reason: `Bust! ${scoreAtTime} − ${statScore} = ${newScore} (below −10)`,
        scoreAtTime,
      })
      return
    }

    recordAndAdvance({
      player, valid: true,
      scoreDeducted: statScore, scoreAtTime, newScore, isCheckout,
      breakdown, statLabel,
    }, newScore, isCheckout)
  }, [players, currentPlayerIndex, challenge])

  // ── Keyboard nav ──────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!suggestions.length) return
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const t = highlightedIndex >= 0 ? suggestions[highlightedIndex] : suggestions.length === 1 ? suggestions[0] : null
      if (t) submitGuess(t)
    }
    else if (e.key === 'Escape') { setSuggestions([]); setHighlightedIndex(-1) }
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
  if (phase === 'mode-select')
    return <ModeSelector onSelect={handleModeSelect} />

  if (phase === 'play-mode-select')
    return (
      <PlayModeSelector
        mode={selectedMode} challenge={challenge}
        onSelect={handlePlayModeSelect}
        onBack={() => setPhase('mode-select')}
      />
    )

  if (phase === 'player-count-select')
    return (
      <PlayerCountSelector
        onSelect={handlePlayerCountSelect}
        onBack={() => setPhase('play-mode-select')}
      />
    )

  if (phase === 'won')
    return (
      <WinScreen
        history={history} players={players} mode={selectedMode} challenge={challenge}
        onPlayAgain={() => startGame(numPlayers)}
        onModeSelect={() => setPhase('mode-select')}
      />
    )

  // ── Game screen ───────────────────────────────────────────────
  const validCount = history.filter(g => g.valid).length
  const colors = MODE_COLORS[selectedMode?.color] ?? MODE_COLORS.purple
  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <button onClick={() => setPhase('mode-select')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
          ← Back
        </button>
        <div className="score-number text-xl text-gray-500 tracking-wider">FOOTBALL 501</div>
        <div className="text-gray-600 text-sm tabular-nums">{validCount} guesses</div>
      </div>

      {/* Challenge card */}
      <div className="w-full max-w-lg mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{challenge.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-white font-bold text-sm">{selectedMode.title} — {challenge.title}</span>
              </div>
              <div className="text-gray-500 text-xs mt-0.5">{challenge.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multiplayer scoreboard */}
      <Scoreboard players={players} currentPlayerIndex={currentPlayerIndex} />

      {/* Whose turn */}
      {numPlayers > 1 && (
        <div className="mb-3 text-sm font-semibold text-green-400 uppercase tracking-widest animate-pulse">
          {currentPlayer.name}'s turn
        </div>
      )}

      {/* Score */}
      <div className="mb-7"><ScoreDisplay score={score} /></div>

      {/* Lookup spinner */}
      {isLookingUp && (
        <div className="w-full max-w-lg mb-4 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin shrink-0" />
          <span className="text-gray-400 text-sm">Looking up stat…</span>
        </div>
      )}

      {/* Input */}
      <div className="relative w-full max-w-lg">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type any player name..."
          disabled={isLookingUp}
          className="w-full bg-gray-900 border border-gray-700 focus:border-green-600 disabled:opacity-50 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-base outline-none transition-colors"
          autoComplete="off" autoCorrect="off" spellCheck="false"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin" />
          </div>
        )}
        {suggestions.length > 0 && (
          <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-10 shadow-2xl">
            {suggestions.map((player, i) => (
              <button
                key={player.name}
                onMouseDown={e => { e.preventDefault(); submitGuess(player) }}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`w-full text-left px-4 py-2.5 transition-colors border-b border-gray-800/50 last:border-0 ${i === highlightedIndex ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{player.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-medium truncate">{player.name}</div>
                    <div className="text-gray-500 text-xs flex items-center gap-1.5 flex-wrap">
                      <span>{player.nationality}{player.dob ? ` · ${player.dob}` : ''}</span>
                    </div>
                  </div>
                  {player.position && (
                    <span className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded border ${POS_COLORS[player.position]}`}>
                      {POS_ABBR[player.position]}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rules */}
      <div className="w-full max-w-lg mt-3 flex justify-between text-xs text-gray-700 px-1">
        <span>Valid: 1–180</span>
        <span>Checkout: 0 to −10</span>
        <span>Below −10 = bust</span>
      </div>

      <GuessHistory history={history} showPlayer={numPlayers > 1} />
    </div>
  )
}
