import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { players as localPlayers } from '../../data/players'
import { getFlagFromNationality, formatDOB, normalizeName } from '../../utils/flags'
import { SITE_URL } from '../../utils/site'
import { ShareCard } from '../../components/ShareCard'
import MoreGames from '../../components/MoreGames'
import { useI18n } from '../../i18n'
import { getDailyChallenge, getDailyEntry, getRandomChallenge, makeCustomChallenge, evaluateSpec, loadCompetition, COMPETITIONS, POSITIONS, STAT_OPTIONS } from '../../data/football501/game'

const MAX_SCORE    = 501
const CHECKOUT_MIN = -10
const DARTS_MIN    = 1
const DARTS_MAX    = 180

const TSDB = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p='
const EXCLUDE_SPORTS = new Set(['basketball','american football','baseball','ice hockey','tennis','golf','cricket','rugby','swimming','athletics','motorsport','cycling','boxing','mma'])

// Position badges use the same GK/DEF/MID/FWD codes as the challenge filter, so
// what a player shows in the dropdown is exactly what the filter tests against.
const POS_META = {
  GK:  { abbr: 'GK',  cls: 'text-yellow-400 bg-yellow-900/40 border-yellow-800/50' },
  DEF: { abbr: 'DEF', cls: 'text-blue-400   bg-blue-900/40   border-blue-800/50' },
  MID: { abbr: 'MID', cls: 'text-green-400  bg-green-900/40  border-green-800/50' },
  FWD: { abbr: 'FWD', cls: 'text-red-400    bg-red-900/40    border-red-800/50' },
}

function broadenPosition(raw) {
  if (!raw) return null
  const lc = raw.toLowerCase()
  if (lc.includes('goalkeeper') || lc.includes('keeper')) return 'GK'
  if (lc.includes('defender') || lc.includes('back') || lc.includes('sweeper') || lc.includes('libero')) return 'DEF'
  if (lc.includes('midfield')) return 'MID'
  if (lc.includes('forward') || lc.includes('striker') || lc.includes('wing') || lc.includes('attacker')) return 'FWD'
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
  const { t } = useI18n()
  const [animKey, setAnimKey] = useState(0)
  useEffect(() => { setAnimKey(k => k + 1) }, [score])
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-medium">{t('five01.score')}</div>
      <div key={animKey} className={`score-number score-pop text-8xl md:text-9xl font-black ${getScoreColor(score)} leading-none tabular-nums`}>
        {score}
      </div>
      {score <= 40 && score > 0 && (
        <div className="mt-2 text-green-400 text-sm font-semibold uppercase tracking-widest animate-pulse">{t('five01.checkoutZone')}</div>
      )}
    </div>
  )
}

// ── Scoreboard (local multiplayer) ─────────────────────────────────
function Scoreboard({ players, currentPlayerIndex }) {
  const { t } = useI18n()
  if (players.length <= 1) return null
  return (
    <div className="w-full max-w-lg mb-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
      {players.map((p, i) => {
        const active = i === currentPlayerIndex && !p.finished
        return (
          <div key={i} className={`rounded-lg border px-3 py-2 text-center transition-colors ${active ? 'border-green-500 bg-green-900/20' : 'border-gray-800 bg-gray-900'}`}>
            <div className="text-xs text-gray-400 truncate">{p.name}</div>
            <div className={`text-lg font-black tabular-nums ${p.finished ? 'text-green-400' : 'text-white'}`}>{p.score}</div>
            {p.finished && <div className="text-[10px] text-green-500 uppercase tracking-wide font-medium">{t('five01.checkedOut')}</div>}
            {active && <div className="text-[10px] text-green-400 uppercase tracking-wide font-medium animate-pulse">{t('five01.yourTurn')}</div>}
          </div>
        )
      })}
    </div>
  )
}

const scoreSquare = (deducted) => (deducted <= 25 ? '🟩' : deducted <= 75 ? '🟨' : '🟥')

function buildSoloShareText(t, challenge, score, valid) {
  const grid = valid.map(g => scoreSquare(g.scoreDeducted)).join('') + (score >= CHECKOUT_MIN && score <= 0 ? '🎯' : '')
  return [t('five01.shareTitle', { title: challenge.title }), t('five01.shareCheckedOut', { score, n: valid.length }), '', grid, '', SITE_URL].join('\n')
}
function buildMultiplayerShareText(t, challenge, ranked, winners) {
  const headline = winners.length > 1 ? t('five01.shareTie') : t('five01.shareWins', { name: winners[0].name })
  return [t('five01.shareTitle', { title: challenge.title }), headline, '', ...ranked.map((p, i) => `${i + 1}. ${p.name} — ${p.finalScore ?? t('five01.noCheckout')}`), '', SITE_URL].join('\n')
}

// Shared end-of-game reveal: who was a perfect finish from `finishingScore`,
// and every valid answer (used ones ticked). Shown for solo AND multiplayer,
// win or not.
function AnswerReveal({ challenge, finishingScore, usedNames }) {
  const { t } = useI18n()
  const answers = challenge.answersList()
  const perfect = answers.filter(a => a.value === finishingScore)
  return (
    <>
      <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest font-medium">{t('five01.perfectFrom', { score: finishingScore })}</div>
        <div className="px-4 py-3 text-sm">
          {perfect.length
            ? <span className="text-green-300">{perfect.map(p => p.name).join(', ')}</span>
            : <span className="text-gray-500">{t('five01.noExact', { score: finishingScore })}</span>}
        </div>
      </div>
      <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest font-medium">{t('five01.allAnswers', { n: answers.length })}</div>
        <div className="divide-y divide-gray-800/40 max-h-80 overflow-y-auto">
          {answers.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2">
              <span className={`text-sm ${usedNames.has(a.name) ? 'text-green-400 font-medium' : 'text-gray-300'}`}>{usedNames.has(a.name) ? '✓ ' : ''}{a.name}</span>
              <span className="text-gray-500 text-xs font-mono tabular-nums">{a.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Win screen ────────────────────────────────────────────────────
function WinScreen({ history, players, challenge, gaveUp, onPlayAgain, onExit }) {
  const { t } = useI18n()
  const isSolo = players.length === 1
  const valid = history.filter(g => g.valid)
  const usedNames = new Set(valid.map(g => g.resolvedName))
  const lastValid = valid[valid.length - 1]

  if (isSolo) {
    const score = players[0].finalScore
    // Finishing position (give up = remaining score; checkout = score before the last dart).
    const finishingScore = gaveUp ? score : (lastValid ? lastValid.scoreAtTime : MAX_SCORE)

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{gaveUp ? '🏳️' : '🎯'}</div>
          <h2 className={`score-number text-6xl mb-2 ${gaveUp ? 'text-gray-300' : 'text-green-400'}`}>{gaveUp ? t('five01.gaveUpTitle') : t('five01.checkoutTitle')}</h2>
          <p className="text-gray-400">
            {challenge.title} (<span className="text-gray-300">{challenge.statLabel}</span>)<br />
            {gaveUp
              ? t('five01.gaveUpOn', { score, n: valid.length })
              : t('five01.finishedOn', { score, n: valid.length })}
          </p>
        </div>

        {valid.length > 0 && (
          <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest font-medium">{t('five01.yourRoute')}</div>
            <div className="divide-y divide-gray-800/50 max-h-56 overflow-y-auto">
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
        )}

        <AnswerReveal challenge={challenge} finishingScore={finishingScore} usedNames={usedNames} />

        <ShareCard text={buildSoloShareText(t, challenge, score, valid)} />
        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">{t('five01.playAgain')}</button>
          <button onClick={onExit} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">{t('five01.menuBtn')}</button>
        </div>
        <MoreGames current="/501" />
      </div>
    )
  }

  // Closest-to-0 checkout wins; a player who never checked out (finalScore null,
  // e.g. beaten to it by player 2) can't win. Ties on the winning score = draw.
  const fs = (p) => (p.finalScore ?? -Infinity)
  const ranked = players.map((p, i) => ({ ...p, idx: i })).sort((a, b) => fs(b) - fs(a))
  const winnerScore = fs(ranked[0])
  const winners = ranked.filter(p => p.finished && fs(p) === winnerScore)
  const finishingScore = lastValid ? lastValid.scoreAtTime : MAX_SCORE

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="score-number text-5xl text-green-400 mb-2">{winners.length > 1 ? t('five01.tie') : t('five01.wins', { name: winners[0].name })}</h2>
        <p className="text-gray-400">{challenge.title}<br />{t('five01.closestWins')}</p>
      </div>

      <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest font-medium">{t('five01.finalScores')}</div>
        <div className="divide-y divide-gray-800/50">
          {ranked.map((p, i) => (
            <div key={p.idx} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm font-mono w-5">{i + 1}</span>
                <span className="text-white text-sm font-medium">{p.name}</span>
                {p.finished && fs(p) === winnerScore && <span className="text-base">🏆</span>}
              </div>
              {p.finished
                ? <span className="font-bold tabular-nums text-green-400">{p.finalScore}</span>
                : <span className="text-gray-500 text-xs">{t('five01.noCheckout')}</span>}
            </div>
          ))}
        </div>
      </div>

      <AnswerReveal challenge={challenge} finishingScore={finishingScore} usedNames={usedNames} />

      <ShareCard text={buildMultiplayerShareText(t, challenge, ranked, winners)} />
      <div className="flex gap-3">
        <button onClick={onPlayAgain} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">{t('five01.playAgain')}</button>
        <button onClick={onExit} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">{t('five01.menuBtn')}</button>
      </div>
      <MoreGames current="/501" />
    </div>
  )
}

// ── Guess history ─────────────────────────────────────────────────
function GuessHistory({ history, showPlayer }) {
  const { t } = useI18n()
  if (!history.length) return null
  return (
    <div className="w-full max-w-lg mt-5">
      <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">{t('five01.history', { n: history.length })}</div>
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
                    {g.player.position && POS_META[g.player.position] && <span className={`shrink-0 text-xs font-bold px-1 py-0 rounded border ${POS_META[g.player.position].cls}`}>{POS_META[g.player.position].abbr}</span>}
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
                  <span className="text-orange-400 text-xs font-semibold tabular-nums">{t('five01.bustTag', { n: g.statScore })}</span>
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
  const { t, lp } = useI18n()
  const daily = getDailyEntry()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl mb-6">
        <Link to={lp('/')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{t('common.allGames')}</Link>
      </div>
      <div className="mb-10 text-center">
        <h1 className="score-number text-6xl md:text-7xl text-white mb-4">{t('five01.wordmark')}</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">{t('five01.entryBlurb')}</p>
      </div>
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={onDaily} className="group bg-gray-900 border border-gray-800 hover:border-green-600 hover:ring-1 hover:ring-green-600/30 rounded-xl p-6 text-left transition-all">
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-white font-bold text-xl">{t('five01.dailyChallenge')}</div>
          <div className="text-green-400 text-sm mt-1 font-medium">{t('five01.solo')}</div>
          <div className="text-gray-600 text-xs mt-3 leading-relaxed">{t('five01.today', { title: daily.title })}</div>
        </button>
        <button onClick={onUnlimited} className="group bg-gray-900 border border-gray-800 hover:border-purple-500 hover:ring-1 hover:ring-purple-500/30 rounded-xl p-6 text-left transition-all">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-white font-bold text-xl">{t('five01.unlimited')}</div>
          <div className="text-purple-400 text-sm mt-1 font-medium">{t('five01.localMultiplayer')}</div>
          <div className="text-gray-600 text-xs mt-3 leading-relaxed">{t('five01.unlimitedBlurb')}</div>
        </button>
      </div>
      <div className="mt-8 text-gray-700 text-xs text-center max-w-sm leading-relaxed">{t('five01.rulesFooter')}</div>
    </div>
  )
}

// ── Unlimited setup: pick a challenge, then player count ───────────
const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${active ? 'border-green-500 bg-green-900/30 text-white' : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600'}`}>{children}</button>
)

const InfoBox = ({ label, value, tone }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-2.5 text-center">
    <div className={`score-number text-2xl tabular-nums ${tone === 'green' ? 'text-green-400' : tone === 'amber' ? 'text-amber-400' : 'text-white'}`}>{value}</div>
    <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5 leading-tight">{label}</div>
  </div>
)

function CountPicker({ title, sub, onPick, onBack }) {
  const { t } = useI18n()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-400 text-sm transition-colors mb-6">{t('common.back')}</button>
        <div className="mb-8 text-center">
          <h2 className="text-white font-black text-2xl">{title}</h2>
          {sub && <div className="text-gray-500 text-sm mt-1">{sub}</div>}
          <div className="text-gray-500 text-sm mt-1">{t('five01.howManyPlayers')}</div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => onPick(n)} className="bg-gray-900 border border-gray-800 hover:border-green-600 rounded-xl py-6 text-center text-2xl font-black text-white transition-colors">{n}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Build-your-own question — competition first, then the same parameters the
// generator uses, with live completability feedback. Emits (spec, count).
function CustomBuilder({ onStart, onBack }) {
  const { t } = useI18n()
  const [comp, setComp] = useState('GB1')
  const [statId, setStatId] = useState('goals')
  const [club, setClub] = useState('')
  const [nat, setNat] = useState('')
  const [pos, setPos] = useState('')
  const [count, setCount] = useState(2)
  const [data, setData] = useState(null) // { fact, clubs, nations } for the selected competition

  // Load the chosen competition's data; reset comp-specific filters.
  useEffect(() => {
    let cancelled = false
    setData(null); setClub(''); setNat('')
    loadCompetition(comp).then(d => { if (!cancelled) setData(d) })
    return () => { cancelled = true }
  }, [comp])

  const spec = useMemo(() => {
    const filter = {}
    if (club) filter.club = club
    if (nat) filter.nationality = nat
    if (pos) filter.position = pos
    return { comp, stat: STAT_OPTIONS.find(s => s.id === statId).stat, filter }
  }, [comp, statId, club, nat, pos])
  const ev = useMemo(() => (data ? evaluateSpec(spec, data.fact) : null), [spec, data])
  const ok = ev && ev.answers > 0 && ev.solvable && ev.maxPlayers >= count

  const selectCls = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-green-600'
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-400 text-sm transition-colors mb-6">{t('common.back')}</button>
        <h2 className="text-white font-black text-2xl mb-6">{t('five01.buildQuestion')}</h2>
        <div className="space-y-5">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{t('five01.competition')}</div>
            <select value={comp} onChange={e => setComp(e.target.value)} className={selectCls}>
              {COMPETITIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{t('five01.stat')}</div>
            <div className="flex flex-wrap gap-2">{STAT_OPTIONS.map(s => <Pill key={s.id} active={statId === s.id} onClick={() => setStatId(s.id)}>{t(`five01.statOpt.${s.id}`)}</Pill>)}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{t('five01.nationality')}</div>
              <select value={nat} onChange={e => setNat(e.target.value)} disabled={!data} className={selectCls}>
                <option value="">{t('five01.anyNationality')}</option>
                {(data?.nations || []).map(n => <option key={n.key} value={n.key}>{n.display}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{t('five01.club')}</div>
              <select value={club} onChange={e => setClub(e.target.value)} disabled={!data} className={selectCls}>
                <option value="">{t('five01.anyClub')}</option>
                {(data?.clubs || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{t('five01.position')}</div>
            <div className="flex flex-wrap gap-2">
              <Pill active={pos === ''} onClick={() => setPos('')}>{t('five01.any')}</Pill>
              {POSITIONS.map(p => <Pill key={p.code} active={pos === p.code} onClick={() => setPos(p.code)}>{t(`five01.posOpt.${p.code}`)}</Pill>)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{t('five01.players')}</div>
            <div className="flex gap-2">{[2, 3, 4, 5].map(n => <Pill key={n} active={count === n} onClick={() => setCount(n)}>{n}</Pill>)}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 min-h-[3.5rem]">
            {!ev ? <div className="text-gray-600 text-xs">{t('five01.loadingComp', { name: COMPETITIONS.find(c => c.id === comp)?.name })}</div> : (
              <>
                <div className="text-white text-sm font-semibold">{ev.title}</div>
                <div className={`text-xs mt-1 ${ok ? 'text-gray-500' : 'text-amber-400'}`}>
                  {ev.answers === 0 ? t('five01.noMatch')
                    : !ev.solvable ? t('five01.notEnough', { n: ev.answers })
                      : ev.maxPlayers < count ? t('five01.notEnoughPlayers', { max: ev.maxPlayers, count })
                        : t('five01.okInfo', { answers: ev.answers, count })}
                </div>
              </>
            )}
          </div>
          <button disabled={!ok} onClick={() => onStart(spec, count)}
            className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 transition-colors">
            {t('five01.startGame')}
          </button>
        </div>
      </div>
    </div>
  )
}

function UnlimitedSetup({ onStart, onBack }) {
  const { t } = useI18n()
  const [step, setStep] = useState('mode')
  if (step === 'random') return <CountPicker title={t('five01.randomTitle')} sub={t('five01.randomSub')} onBack={() => setStep('mode')} onPick={(n) => onStart(getRandomChallenge(n), n)} />
  if (step === 'custom') return <CustomBuilder onBack={() => setStep('mode')} onStart={(spec, count) => onStart(makeCustomChallenge(spec), count)} />
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-400 text-sm transition-colors mb-6">{t('common.back')}</button>
        <div className="mb-8 text-center">
          <h2 className="text-white font-black text-2xl">{t('five01.localMultiplayerTitle')}</h2>
          <div className="text-gray-500 text-sm mt-1">{t('five01.everyoneSame')}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => setStep('random')} className="bg-gray-900 border border-gray-800 hover:border-green-600 hover:ring-1 hover:ring-green-600/30 rounded-xl p-6 text-left transition-all">
            <div className="text-3xl mb-3">🎲</div>
            <div className="text-white font-bold text-lg">{t('five01.randomQuestion')}</div>
            <div className="text-gray-600 text-xs mt-2 leading-relaxed">{t('five01.randomQuestionBlurb')}</div>
          </button>
          <button onClick={() => setStep('custom')} className="bg-gray-900 border border-gray-800 hover:border-purple-500 hover:ring-1 hover:ring-purple-500/30 rounded-xl p-6 text-left transition-all">
            <div className="text-3xl mb-3">🛠️</div>
            <div className="text-white font-bold text-lg">{t('five01.buildYourOwn')}</div>
            <div className="text-gray-600 text-xs mt-2 leading-relaxed">{t('five01.buildYourOwnBlurb')}</div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Football501() {
  const { t } = useI18n()
  const [phase, setPhase] = useState('entry')   // entry | unlimited | playing | won
  const [challenge, setChallenge] = useState(null)
  const [isDaily, setIsDaily] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)
  const [loading, setLoading] = useState(false)
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

  // Live strategy boxes: highest available deduction, checkout & perfect counts.
  const insights = useMemo(() => {
    if (phase !== 'playing' || !challenge) return null
    const used = new Set(history.filter(g => g.valid).map(g => g.resolvedName))
    return challenge.insights(score, used)
  }, [challenge, score, history, phase])

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
      // Prefer OUR position (same source as the filter) so the badge never lies.
      return rankSuggestions([...apiPlayers, ...extra], input, knownNames).slice(0, 10)
        .map(p => ({ ...p, position: (challenge && challenge.badgeFor(p.name)) || p.position || null }))
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
    setGaveUp(false)
    setNumPlayers(count)
    setKnownNames(new Set(localPlayers.map(p => p.name)))
    setPlayers(Array.from({ length: count }, (_, i) => ({ name: count === 1 ? t('five01.you') : t('five01.playerN', { n: i + 1 }), score: MAX_SCORE, finished: false, finalScore: null })))
    setCurrentPlayerIndex(0)
    setHistory([]); setInput(''); setSuggestions([]); setHighlightedIndex(-1)
    setPhase('playing')
    setTimeout(() => inputRef.current?.focus(), 100)
  }
  // A challenge may need its competition's fact table loaded first (async).
  const startFrom = async (challengePromise, count, daily) => {
    setLoading(true)
    try { startGame(await challengePromise, count, daily) }
    finally { setLoading(false) }
  }
  const playDaily = () => startFrom(getDailyChallenge(), 1, true)
  const playAgain = () => startFrom(isDaily ? getDailyChallenge() : getRandomChallenge(numPlayers), numPlayers, isDaily)
  const skipQuestion = () => startFrom(getRandomChallenge(numPlayers), numPlayers, false) // endless: new question
  const giveUp = () => {
    setPlayers(ps => ps.map((p, i) => i === currentPlayerIndex ? { ...p, finished: true, finalScore: p.score } : p))
    setGaveUp(true)
    setPhase('won')
  }

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
      // End of game. In 2-player, player 2 (index 1) has the "last word": the
      // game ends the moment they check out — either they beat player 1 to it
      // (win), or they're responding to player 1's finish (closest to 0 wins,
      // both 0 = draw). Player 1 checking out never ends it; player 2 always
      // gets their response. For 3+ players it ends when everyone's checked out.
      const gameEnds = isCheckout && (players.length === 2 ? playerIdx === 1 : next.every(p => p.finished))
      if (gameEnds) { setTimeout(() => setPhase('won'), 500); return }
      let idx = playerIdx
      do { idx = (idx + 1) % next.length } while (next[idx].finished)
      setCurrentPlayerIndex(idx)
    }

    const result = challenge.validate(player.name)
    if (result.status !== 'valid') {
      const reason = result.status === 'ambiguous'
        ? t('five01.ambiguous', { options: result.options.join(' / ') })
        : t('five01.notValidAnswer', { name: player.name })
      recordAndAdvance({ player, valid: false, statScore: null, reason, scoreAtTime })
      return
    }

    const statScore = result.value
    // Recognised answer, but over a darts visit (>180) → bust, shown with value.
    if (statScore > DARTS_MAX) {
      recordAndAdvance({ player, valid: false, statScore, reason: t('five01.over180', { n: statScore }), scoreAtTime })
      return
    }
    if (!isValidDartsScore(statScore)) {
      recordAndAdvance({ player, valid: false, statScore, reason: t('five01.cantDeduct', { n: statScore }), scoreAtTime })
      return
    }

    const newScore = scoreAtTime - statScore
    const isCheckout = newScore >= CHECKOUT_MIN && newScore <= 0
    if (newScore < CHECKOUT_MIN) {
      recordAndAdvance({ player, valid: false, statScore, reason: t('five01.bustsDetail', { n: statScore, score: scoreAtTime, result: newScore }), scoreAtTime })
      return
    }

    recordAndAdvance({ player, valid: true, resolvedName: result.name, scoreDeducted: statScore, scoreAtTime, newScore, isCheckout, breakdown: result.breakdown }, newScore, isCheckout)
  }, [players, currentPlayerIndex, challenge, t])

  const handleKeyDown = (e) => {
    if (!suggestions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const tgt = highlightedIndex >= 0 ? suggestions[highlightedIndex] : suggestions.length === 1 ? suggestions[0] : null
      if (tgt) submitGuess(tgt)
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
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-8 h-8 border-2 border-gray-700 border-t-green-500 rounded-full animate-spin mb-4" />
      <div className="text-gray-500 text-sm">{t('five01.loading')}</div>
    </div>
  )
  if (phase === 'entry') return <EntryScreen onDaily={playDaily} onUnlimited={() => setPhase('unlimited')} />
  if (phase === 'unlimited') return <UnlimitedSetup onStart={(challengePromise, n) => startFrom(challengePromise, n, false)} onBack={() => setPhase('entry')} />
  if (phase === 'won') return <WinScreen history={history} players={players} challenge={challenge} gaveUp={gaveUp} onPlayAgain={playAgain} onExit={() => setPhase('entry')} />

  const validCount = history.filter(g => g.valid).length
  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <button onClick={() => setPhase('entry')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{t('five01.menu')}</button>
        <div className="score-number text-xl text-gray-500 tracking-wider">{t('five01.wordmark')}</div>
        <div className="text-gray-600 text-sm tabular-nums">{t('five01.dartsCount', { n: validCount })}</div>
      </div>

      {/* Challenge card */}
      <div className="w-full max-w-lg mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-white font-bold text-sm">{challenge.title}</div>
            <div className="text-gray-500 text-xs mt-0.5">{t('five01.possibleAnswers', { n: challenge.answers })}</div>
          </div>
          {!isDaily && (
            <button onClick={skipQuestion} className="shrink-0 text-xs text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-500 rounded-lg px-2.5 py-1 transition-colors">{t('five01.skip')}</button>
          )}
        </div>
      </div>

      <Scoreboard players={players} currentPlayerIndex={currentPlayerIndex} />
      {numPlayers > 1 && <div className="mb-3 text-sm font-semibold text-green-400 uppercase tracking-widest animate-pulse">{t('five01.turnOf', { name: currentPlayer.name })}</div>}

      <div className="mb-7"><ScoreDisplay score={score} /></div>

      {/* Input */}
      <div className="relative w-full max-w-lg">
        <input
          ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={t('five01.typePlayer')} autoFocus
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
                  {player.position && POS_META[player.position] && <span className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded border ${POS_META[player.position].cls}`}>{POS_META[player.position].abbr}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-lg mt-3 flex justify-between text-xs text-gray-700 px-1">
        <span>{t('five01.ruleValid')}</span><span>{t('five01.ruleCheckout')}</span><span>{t('five01.ruleBust')}</span>
      </div>

      {/* Live strategy boxes */}
      {insights && (
        <div className="w-full max-w-lg mt-4 grid grid-cols-3 gap-2">
          <InfoBox label={t('five01.highestLeft')} value={insights.highest || '—'} />
          <InfoBox label={t('five01.checkouts')} value={score <= 180 ? insights.checkouts : '—'} tone="green" />
          <InfoBox label={t('five01.perfectFinish')} value={score <= 180 ? insights.perfect : '—'} tone="amber" />
        </div>
      )}

      {/* Give up (solo) — end the round from here and reveal the answers */}
      {numPlayers === 1 && (
        <button type="button" onClick={giveUp}
          className="mt-4 w-full max-w-lg border border-red-900/60 text-red-400 hover:bg-red-900/20 hover:border-red-700 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors">
          {t('five01.giveUpReveal')}
        </button>
      )}

      <GuessHistory history={history} showPlayer={numPlayers > 1} />
    </div>
  )
}
