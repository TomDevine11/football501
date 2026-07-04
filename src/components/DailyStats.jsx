import { getStats } from '../data/dailyStats'
import { useI18n } from '../i18n'

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <div className="score-number text-2xl text-white tabular-nums leading-none">{value}</div>
      <div className="text-gray-500 text-[10px] uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}

// Daily stats / streak panel for a game's end screen. Pass the fresh `stats`
// from recordResult() so it reflects the game just finished; otherwise it reads
// the stored values. `variant`:
//   'win'   → Played / Win % / Streak / Max  (win-streak games)
//   'score' → Played / Best / Day streak / Max  (score games, no win/lose)
export default function DailyStats({ game, stats, variant = 'win' }) {
  const { t } = useI18n()
  const s = stats || getStats(game)
  const winPct = s.played ? Math.round((s.wins / s.played) * 100) : 0
  return (
    <div className="w-full max-w-xs mx-auto my-5">
      <div className="grid grid-cols-4 gap-2">
        <Stat label={t('stats.played')} value={s.played} />
        {variant === 'score'
          ? <Stat label={t('stats.best')} value={s.best} />
          : <Stat label={t('stats.winPct')} value={winPct} />}
        <Stat label={variant === 'score' ? t('stats.dayStreak') : t('stats.streak')} value={s.currentStreak} />
        <Stat label={t('stats.max')} value={s.maxStreak} />
      </div>
    </div>
  )
}
