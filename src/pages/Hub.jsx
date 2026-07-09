import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../seo/Seo'
import BrandMark from '../components/BrandMark'
import GameMotif from '../components/GameMotif'
import LanguageSwitcher from '../components/LanguageSwitcher'
import AdSlot from '../ads/AdSlot'
import { routeByPath, SITE_URL } from '../seo/seoConfig'
import { useI18n } from '../i18n'
import { playedToday, getStats, recordVisit, todayIndex, formGuide, weeklyPoints } from '../data/dailyStats'

// Matchday 1 = site launch day. Every visitor worldwide shares today's number.
const MATCHDAY_EPOCH = 20455

// The lineup. `stats` keys dailyStats (what each game passes to recordResult).
const GAMES = [
  { to: '/tenable', stats: 'tenable', color: '#eab308' },
  { to: '/wordle', stats: 'wordle', color: '#3b82f6' },
  { to: '/tictactoe', stats: 'tictactoe', color: '#6366f1' },
  { to: '/teammates', stats: 'teammates', color: '#ec4899' },
  { to: '/career-path', stats: 'careers', color: '#06b6d4' },
  { to: '/world-cup', stats: 'wcsquads', color: '#f59e0b' },
  { to: '/connections', stats: 'connections', color: '#14b8a6' },
  { to: '/higher-or-lower', stats: 'higherlower', color: '#f97316' },
  { to: '/501', stats: '501', color: '#ef4444' },
]

const FORM_DOT = { W: 'bg-green-500', L: 'bg-red-500/75', '-': 'bg-[#3a3846]' }
const FormGuide = ({ form, className = '' }) => (
  <span className={`inline-flex gap-[3px] ${className}`} aria-hidden="true">
    {form.split('').map((ch, i) => (
      <i key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-[2px] ${FORM_DOT[ch]}`} />
    ))}
  </span>
)

const StatChip = ({ value, label, accent = false }) => (
  <span className="bg-[#16151f] border border-[#262433] rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-[0.5rem] sm:text-[0.62rem] font-bold tracking-[0.1em] text-[#8c89a3] whitespace-nowrap">
    <b className={`${accent ? 'text-[#a78bfa]' : 'text-[#ecebf2]'} text-[0.72rem] sm:text-[0.85rem] mr-1 tabular-nums`}>{value}</b>
    {label}
  </span>
)

// hh:mm until local midnight, when the dailies refresh.
function untilMidnight() {
  const now = new Date()
  const mins = 24 * 60 - (now.getHours() * 60 + now.getMinutes())
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

export default function Hub() {
  const { locale, t, lp } = useI18n()
  const home = routeByPath('/', locale)
  const [visit] = useState(recordVisit)
  const [countdown, setCountdown] = useState(untilMidnight)
  const [copied, setCopied] = useState(false)
  const matchday = todayIndex() - MATCHDAY_EPOCH

  // Keep the next-dailies countdown live (minute precision).
  useEffect(() => {
    const id = setInterval(() => setCountdown(untilMidnight()), 30_000)
    return () => clearInterval(id)
  }, [])

  const lineup = GAMES.map(g => ({
    ...g,
    id: g.to.slice(1),
    played: playedToday(g.stats),
    streak: getStats(g.stats).currentStreak,
    form: formGuide(g.stats),
  }))
  const playedCount = lineup.filter(g => g.played).length
  const points = weeklyPoints()

  const shareDay = async () => {
    const squares = lineup.map(g => (g.played ? '🟪' : '⬜')).join('')
    const text = [
      `TRIVIVERSE · ${t('hub.matchday')} ${matchday}`,
      `${squares}  ${playedCount}/9${playedCount === 9 ? ` ★ ${t('hub.perfectDay')}` : ''}`,
      `🔥 ${visit.streak} · ${points} pts`,
      SITE_URL.replace('https://', ''),
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="bg-[linear-gradient(160deg,#151024_0%,#0b0a14_60%)] text-[#ecebf2]">
      <Seo path="/" />

      {/* ── The matchday dashboard: every feature in one viewport, no scroll ── */}
      <div className="h-dvh max-w-5xl mx-auto flex flex-col gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4">

        {/* top bar: brand (the page's h1 — site name + sr-only keywords) · stats · language */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="flex items-center gap-2 text-[0.66rem] sm:text-[0.85rem] font-black tracking-[0.13em] m-0">
            <BrandMark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a78bfa]" />
            <span className="text-[#ecebf2]">TRIVIVERSE</span>
            <span className="text-[#a78bfa]">FOOTBALL</span>
            <span className="sr-only">— {t('home.subtitle')}</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex gap-2">
              <StatChip value={visit.streak} label={t('hub.dayStreak')} />
              <StatChip value={`${playedCount}/9`} label={t('hub.played')} />
              <StatChip value={points} label={t('hub.ptsWeek')} />
              <StatChip value={countdown} label={t('hub.nextDailies')} accent />
            </div>
            <span className="md:hidden text-[0.6rem] font-bold tracking-[0.1em] text-[#a78bfa]">
              {t('hub.next')} {countdown}
            </span>
            <LanguageSwitcher />
          </div>
        </div>

        {/* matchday hero */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.55rem] sm:text-[0.62rem] font-extrabold tracking-[0.22em] text-[#a78bfa] m-0">
              {t('hub.kick')}
            </p>
            <div className="score-number text-[2rem] sm:text-[2.6rem] leading-none mt-0.5 bg-[linear-gradient(120deg,#fff_30%,#a78bfa_85%)] bg-clip-text text-transparent">
              {t('hub.matchday')} {matchday}
            </div>
            <div className="md:hidden flex gap-1.5 mt-2">
              <StatChip value={visit.streak} label={t('hub.streak')} />
              <StatChip value={`${playedCount}/9`} label={t('hub.played')} />
              <StatChip value={points} label={t('hub.pts')} />
            </div>
          </div>
          <span className="hidden sm:block text-[0.62rem] tracking-[0.1em] text-[#57536e] pb-1">
            {t('hub.lineupNote')}
          </span>
        </div>

        {/* the pitch — your lineup */}
        <div className="relative flex-1 min-h-0 border border-[#2c2947] rounded-xl sm:rounded-2xl p-2 sm:p-4 overflow-hidden bg-[linear-gradient(180deg,rgb(124_58_237/.07),transparent_30%),#100e1c]">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[#2c2947]" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 w-32 h-32 border border-[#2c2947] rounded-full -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <div className="relative grid grid-cols-3 grid-rows-3 gap-1.5 sm:gap-4 h-full">
            {lineup.map(g => (
              <Link
                key={g.to}
                to={lp(g.to)}
                style={{ '--g': g.color }}
                aria-label={g.played ? `${t(`games.${g.id}.title`)} — ${t('home.playedToday')}` : t(`games.${g.id}.title`)}
                className="relative flex flex-col items-center justify-center gap-0.5 sm:gap-1.5 bg-[rgb(22_21_33/.85)] border border-[#2c2947] rounded-lg sm:rounded-xl p-1 sm:p-2 transition-[transform,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--g)_55%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a78bfa] active:scale-[0.985]"
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-1 right-1 sm:top-2 sm:right-2 text-[0.45rem] sm:text-[0.56rem] font-black tracking-[0.1em] rounded px-1 py-px sm:px-1.5 sm:py-0.5 border ${
                    g.played ? 'text-green-500 border-green-500/40' : 'text-[#a78bfa] border-[#7c3aed]/55'
                  }`}
                >
                  {g.played ? 'FT' : <><span className="sm:hidden">KO</span><span className="hidden sm:inline">{t('hub.kickOff')}</span></>}
                </span>
                <GameMotif id={g.id} className="w-5 h-5 sm:w-9 sm:h-9 text-[color:var(--g)]" />
                <span className="font-extrabold uppercase tracking-[0.03em] text-[0.55rem] sm:text-[0.85rem] text-center leading-tight">
                  {t(`games.${g.id}.title`).replace(/^Football /, '').replace(/ de Fútbol$/, '')}
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5">
                  {g.streak > 0 ? (
                    <b className="text-[0.6rem] sm:text-[0.75rem] font-black text-amber-400">
                      🔥{g.streak}<em className="not-italic hidden sm:inline text-[0.55rem] tracking-[0.12em] text-[#8c89a3] font-extrabold ml-1">{t('hub.streak')}</em>
                    </b>
                  ) : (
                    <b className="text-[0.6rem] font-black text-[#4a4758]">—</b>
                  )}
                  <FormGuide form={g.form} />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* footer: perfect-day tracker + share */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1" aria-hidden="true">
              {lineup.map(g => (
                <i
                  key={g.to}
                  style={g.played ? { background: g.color, boxShadow: `0 0 8px color-mix(in srgb, ${g.color} 60%, transparent)` } : undefined}
                  className="w-4 sm:w-6 h-1.5 sm:h-2 rounded-[3px] bg-[#262433] -skew-x-[14deg]"
                />
              ))}
              <span className={`ml-1 text-base sm:text-xl leading-none ${playedCount === 9 ? 'text-amber-400' : 'text-[#3a3846]'}`}>★</span>
            </div>
            <p className="m-0 mt-1 text-[0.5rem] sm:text-[0.66rem] tracking-[0.1em] text-[#8c89a3]">
              <b className="text-amber-400">{t('hub.perfectDay')}</b> — {t('hub.perfectDayHint')}
            </p>
          </div>
          <button
            type="button"
            onClick={shareDay}
            className="bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-bold text-[0.68rem] sm:text-[0.8rem] tracking-[0.06em] rounded-lg px-3.5 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap transition-colors"
          >
            {copied ? t('hub.copied') : t('hub.shareDay')}
          </button>
        </div>
      </div>

      {/* ── Below the fold: SEO content, unchanged in substance ── */}
      <div className="max-w-2xl mx-auto px-4 pt-14 pb-16">
        <section className="text-left">
          <h2 className="text-[#ecebf2] font-semibold text-lg mb-3">{t('home.aboutHeading')}</h2>
          <p className="text-[#8c89a3] text-sm leading-relaxed mb-8">{home.about}</p>

          <h2 className="text-[#ecebf2] font-semibold text-lg mb-3">{t('home.faqHeading')}</h2>
          <dl className="space-y-4">
            {home.faq.map((f, i) => (
              <div key={i}>
                <dt className="text-[#b9b8c6] text-sm font-medium">{f.q}</dt>
                <dd className="text-[#8c89a3] text-sm mt-1 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
        <AdSlot name="hub-footer" />
      </div>
    </div>
  )
}
