import { Link } from 'react-router-dom'
import { indexableRoutes } from '../seo/seoConfig'
import GameIcon from './GameIcon'
import { useI18n } from '../i18n'

// Cross-game nav shown on a game's finish screen: quick links to every other
// game so a player who's done today's puzzle can jump straight into another.
// Also strengthens internal linking between game pages (good for SEO).
export default function MoreGames({ current, title }) {
  const { t, lp } = useI18n()
  const games = indexableRoutes().filter(r => r.path !== '/' && r.path !== current)
  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <div className="text-xs text-gray-600 uppercase tracking-widest mb-3 font-medium text-center">{title || t('common.tryAnother')}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {games.map(g => {
          // Localized game name, trimmed of the "Football …"/"… de Fútbol"
          // wrapper so the compact chips stay short in both languages.
          const label = t(`games.${g.path.slice(1)}.title`).replace(/^Football /, '').replace(/ de Fútbol$/, '')
          return (
            <Link
              key={g.path}
              to={lp(g.path)}
              className="flex items-center gap-2.5 bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800/60 rounded-lg px-3 py-2.5 transition-colors"
            >
              <GameIcon id={g.path.slice(1)} className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="text-gray-300 text-xs font-medium truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
