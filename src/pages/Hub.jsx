import { Link } from 'react-router-dom'
import Seo from '../seo/Seo'
import GameIcon from '../components/GameIcon'
import LanguageSwitcher from '../components/LanguageSwitcher'
import AdSlot from '../ads/AdSlot'
import { routeByPath } from '../seo/seoConfig'
import { useI18n } from '../i18n'

// Game order + presentation. Titles are the (brandy) game names; the tagline and
// description come from the i18n strings so they localise. id = route without '/'.
const GAMES = [
  { to: '/tenable', title: 'Football Tenable', color: 'hover:border-yellow-500 hover:ring-yellow-500/30', accent: 'text-yellow-400' },
  { to: '/wordle', title: 'Football Wordle', color: 'hover:border-blue-500 hover:ring-blue-500/30', accent: 'text-blue-400' },
  { to: '/tictactoe', title: 'Football TicTacToe', color: 'hover:border-purple-500 hover:ring-purple-500/30', accent: 'text-purple-400' },
  { to: '/teammates', title: 'Teammates', color: 'hover:border-pink-500 hover:ring-pink-500/30', accent: 'text-pink-400' },
  { to: '/career-path', title: 'Career Path', color: 'hover:border-cyan-500 hover:ring-cyan-500/30', accent: 'text-cyan-400' },
  { to: '/world-cup', title: 'World Cup Squads', color: 'hover:border-amber-500 hover:ring-amber-500/30', accent: 'text-amber-400' },
  { to: '/connections', title: 'Football Connections', color: 'hover:border-teal-500 hover:ring-teal-500/30', accent: 'text-teal-400' },
  { to: '/higher-or-lower', title: 'Higher or Lower', color: 'hover:border-orange-500 hover:ring-orange-500/30', accent: 'text-orange-400' },
  { to: '/501', title: 'Football 501', color: 'hover:border-red-500 hover:ring-red-500/30', accent: 'text-red-400' },
]

export default function Hub() {
  const { locale, t, lp } = useI18n()
  const home = routeByPath('/', locale)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Seo path="/" />
      <div className="w-full max-w-5xl flex justify-end mb-2"><LanguageSwitcher /></div>
      <div className="mb-10 text-center">
        <div className="text-gray-500 text-sm uppercase tracking-widest mb-2 font-medium">{t('home.welcome')}</div>
        <h1 className="score-number text-5xl md:text-7xl text-white mb-4">{home.h1}</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">{t('home.subtitle')}</p>
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map(game => {
            const id = game.to.slice(1)
            const title = t(`games.${id}.title`)
            const tagline = t(`games.${id}.tagline`)
            const description = t(`games.${id}.description`)
            return game.disabled ? (
              <div
                key={game.to}
                aria-disabled="true"
                className="relative bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 text-left opacity-60 cursor-not-allowed select-none"
              >
                <div className="mb-4 text-gray-600"><GameIcon id={id} className="w-10 h-10" /></div>
                <div className="text-gray-400 font-bold text-xl leading-tight">{title}</div>
                <div className="text-gray-600 text-sm mt-1 font-medium">{tagline}</div>
                <div className="mt-3 text-gray-700 text-xs leading-relaxed">{description}</div>
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-gray-800/80 border border-gray-700 rounded-full px-2.5 py-1">
                    {t('common.comingSoon')}
                  </span>
                </div>
              </div>
            ) : (
              <Link
                key={game.to}
                to={lp(game.to)}
                className={`group relative bg-gray-900 border border-gray-800 ${game.color} rounded-xl p-6 text-left transition-all duration-200 cursor-pointer ring-1 ring-transparent`}
              >
                <div className={`mb-4 ${game.accent}`}><GameIcon id={id} className="w-10 h-10" /></div>
                <div className="text-white font-bold text-xl leading-tight">{title}</div>
                <div className={`${game.accent} text-sm mt-1 font-medium`}>{tagline}</div>
                <div className="mt-3 text-gray-600 text-xs leading-relaxed">{description}</div>
                <div className="absolute top-4 right-4 text-gray-700 group-hover:text-gray-400 transition-colors text-xl">→</div>
              </Link>
            )
          })}
        </div>

        <section className="mt-12 text-left max-w-2xl mx-auto">
          <h2 className="text-white font-semibold text-lg mb-3">{t('home.aboutHeading')}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">{home.about}</p>

          <h2 className="text-white font-semibold text-lg mb-3">{t('home.faqHeading')}</h2>
          <dl className="space-y-4">
            {home.faq.map((f, i) => (
              <div key={i}>
                <dt className="text-gray-200 text-sm font-medium">{f.q}</dt>
                <dd className="text-gray-500 text-sm mt-1 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <AdSlot name="hub-footer" />
      </div>
    </div>
  )
}
