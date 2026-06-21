import { getStats } from '../data/dailyStats'

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
  const s = stats || getStats(game)
  const winPct = s.played ? Math.round((s.wins / s.played) * 100) : 0
  return (
    <div className="w-full max-w-xs mx-auto my-5">
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Played" value={s.played} />
        {variant === 'score'
          ? <Stat label="Best" value={s.best} />
          : <Stat label="Win %" value={winPct} />}
        <Stat label={variant === 'score' ? 'Day streak' : 'Streak'} value={s.currentStreak} />
        <Stat label="Max" value={s.maxStreak} />
      </div>
    </div>
  )
}
