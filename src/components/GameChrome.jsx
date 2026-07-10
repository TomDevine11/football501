import { Link } from 'react-router-dom'
import BrandMark from './BrandMark'
import GameMotif from './GameMotif'
import { useI18n } from '../i18n'
import { matchdayNumber } from '../data/dailyStats'

// The Triviverse chrome bar — appears on every game page (design-system.md §5).
// Brand lockup links home; centre carries the game's wordmark + motif in its
// accent; `right` is the page-specific slot (darts count, lives, streak…).
export default function GameChrome({ motifId, title, right }) {
  const { t, lp } = useI18n()
  return (
    <header className="flex items-center justify-between gap-3 py-3">
      <Link to={lp('/')} className="flex items-center gap-2 text-[0.62rem] sm:text-[0.7rem] font-black tracking-[0.12em] hover:opacity-80 transition-opacity">
        <BrandMark className="w-3.5 h-3.5 text-brand-bright" />
        <span className="text-primary">TRIVIVERSE</span>
        <span className="text-brand-bright">FOOTBALL</span>
      </Link>
      <span className="hidden sm:inline-flex items-center gap-2 text-[0.7rem] font-black tracking-[0.1em] text-primary">
        <GameMotif id={motifId} className="w-4 h-4 text-accent-bright" />
        {title}
        <b className="text-faint font-extrabold text-[0.58rem] tracking-[0.16em]">{t('hub.matchday')} {matchdayNumber()}</b>
      </span>
      <span className="text-[0.6rem] font-bold tracking-[0.1em] text-muted">{right}</span>
    </header>
  )
}
