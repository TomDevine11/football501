import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../seo/Seo'
import GameIcon from '../components/GameIcon'
import LanguageSwitcher from '../components/LanguageSwitcher'
import AdSlot from '../ads/AdSlot'
import { routeByPath } from '../seo/seoConfig'
import { useI18n } from '../i18n'
import { accentVars } from '../design/accents'
import { playedToday, recordVisit } from '../data/dailyStats'

// The wall of game panels. id (route without '/') keys the icon and i18n copy;
// accent keys GAME_ACCENTS; stats keys dailyStats (what each game passes to
// recordResult — 501 doesn't record dailies yet, so its FT mark stays off).
const GAMES = [
  { to: '/tenable', accent: 'tenable', stats: 'tenable' },
  { to: '/wordle', accent: 'wordle', stats: 'wordle' },
  { to: '/tictactoe', accent: 'tictactoe', stats: 'tictactoe' },
  { to: '/teammates', accent: 'teammates', stats: 'teammates' },
  { to: '/career-path', accent: 'careers', stats: 'careers' },
  { to: '/world-cup', accent: 'wcsquads', stats: 'wcsquads' },
  { to: '/connections', accent: 'connections', stats: 'connections' },
  { to: '/higher-or-lower', accent: 'higherlower', stats: 'higherlower' },
  { to: '/501', accent: '501', stats: '501' },
]

const FullTimeMark = ({ label }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-high px-2 py-1"
    title={label}
  >
    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-success-bright" aria-hidden="true">
      <path d="M2 6.2 4.8 9 10 3.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="text-overline-sm uppercase font-semibold text-secondary" aria-hidden="true">FT</span>
    <span className="sr-only">{label}</span>
  </span>
)

export default function Hub() {
  const { locale, t, lp } = useI18n()
  const home = routeByPath('/', locale)

  // Greeting data + entrance gate, computed once per mount. The entrance
  // choreography plays once per browser session — returning to the Hub
  // mid-session finds the lights already on.
  const [visit] = useState(recordVisit)
  const [playedCount] = useState(() => GAMES.filter(g => playedToday(g.stats)).length)
  const [entering] = useState(() => {
    try {
      if (sessionStorage.getItem('ftg-hub-entered')) return false
      sessionStorage.setItem('ftg-hub-entered', '1')
      return true
    } catch { return true }
  })

  const statusParts = []
  if (visit.returning) {
    statusParts.push(t('home.welcomeBack'))
    if (visit.streak > 1) statusParts.push(t('home.dayN', { n: visit.streak }))
  }
  if (playedCount > 0) {
    statusParts.push(playedCount === 1 ? t('home.dailiesPlayedOne') : t('home.dailiesPlayed', { n: playedCount }))
  } else if (visit.returning) {
    statusParts.push(t('home.dailiesWaiting'))
  }

  return (
    <div className={`hub-scene min-h-screen px-page-x pt-6 pb-16 ${entering ? 'hub-enter' : ''}`}>
      <Seo path="/" />
      <div className="w-full max-w-hub mx-auto flex justify-end mb-4"><LanguageSwitcher /></div>

      <header className="hub-head mb-10 text-center">
        <p className="text-overline uppercase font-medium text-muted mb-3">{t('home.welcome')}</p>
        <h1 className="font-display text-display-lg text-primary mb-4">{home.h1}</h1>
        <p className="text-body-lg text-secondary max-w-md mx-auto leading-relaxed">{t('home.subtitle')}</p>
        {statusParts.length > 0 && (
          <p className="mt-5 text-overline-sm uppercase tracking-widest font-semibold text-brand-bright">
            {statusParts.join(' · ')}
          </p>
        )}
      </header>

      <div className="w-full max-w-hub mx-auto">
        <div className="hub-wall grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((game, i) => {
            const id = game.to.slice(1)
            const title = t(`games.${id}.title`)
            const tagline = t(`games.${id}.tagline`)
            const description = t(`games.${id}.description`)
            const played = playedToday(game.stats)
            return (
              <Link
                key={game.to}
                to={lp(game.to)}
                aria-label={played ? `${t('home.playGame', { title })} — ${t('home.playedToday')}` : t('home.playGame', { title })}
                style={{ ...accentVars(game.accent), '--i': i }}
                className="hub-card group relative bg-surface-glass border border-border rounded-xl shadow-panel p-5 pb-16 text-left"
              >
                <span className="hub-card-wash" aria-hidden="true" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-accent-tint text-accent-bright">
                    <GameIcon id={id} className="w-icon-card h-icon-card" />
                  </div>
                  {played && <FullTimeMark label={t('home.playedToday')} />}
                </div>
                <div className="relative mt-4 text-title-lg font-bold text-primary leading-tight">{title}</div>
                <div className="relative mt-1 text-body font-medium text-secondary">{tagline}</div>
                <p className="relative mt-2.5 text-caption text-muted leading-relaxed">{description}</p>
                <span
                  className="absolute bottom-5 right-5 w-8 h-8 rounded-full border border-border-strong flex items-center justify-center text-muted transition-colors duration-fast group-hover:border-accent group-hover:text-accent-bright"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4 transition-transform duration-fast ease-out group-hover:translate-x-0.5">
                    <path d="M3 8h9.5M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            )
          })}
        </div>

        <section className="mt-14 text-left max-w-2xl mx-auto">
          <h2 className="text-primary font-semibold text-lg mb-3">{t('home.aboutHeading')}</h2>
          <p className="text-muted text-body leading-relaxed mb-8">{home.about}</p>

          <h2 className="text-primary font-semibold text-lg mb-3">{t('home.faqHeading')}</h2>
          <dl className="space-y-4">
            {home.faq.map((f, i) => (
              <div key={i}>
                <dt className="text-secondary text-body font-medium">{f.q}</dt>
                <dd className="text-muted text-body mt-1 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <AdSlot name="hub-footer" />
      </div>
    </div>
  )
}
