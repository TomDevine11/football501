// Custom line-icon set for the game modes. Each icon uses `currentColor`, so it
// takes whatever text colour its container sets (e.g. the card's accent colour).
// viewBox 0 0 24 24, consistent 1.75 stroke.

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ICONS = {
  // Leaderboard / podium — "name the top 10"
  tenable: (
    <>
      <rect x="3" y="13" width="5" height="8" rx="1" {...S} />
      <rect x="9.5" y="7" width="5" height="14" rx="1" {...S} />
      <rect x="16" y="16" width="5" height="5" rx="1" {...S} />
    </>
  ),
  // Wordle tiles — first one "solved"
  wordle: (
    <>
      <rect x="2.5" y="9" width="6" height="6" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="9" y="9" width="6" height="6" rx="1.2" {...S} />
      <rect x="15.5" y="9" width="6" height="6" rx="1.2" {...S} />
    </>
  ),
  // Tic-tac-toe grid with a single centered X — clean, uncrowded
  tictactoe: (
    <>
      <path d="M9 3.5v17M15 3.5v17M3.5 9h17M3.5 15h17" {...S} />
      <path d="M10.3 10.3l3.4 3.4M13.7 10.3l-3.4 3.4" {...S} />
    </>
  ),
  // Magnifier over a player silhouette — "guess the player"
  teammates: (
    <>
      <circle cx="10.5" cy="10" r="6.2" {...S} />
      <path d="M15 14.6L20.5 20.5" {...S} />
      <circle cx="10.5" cy="8.6" r="1.7" {...S} />
      <path d="M7.7 13.2a3 3 0 0 1 5.6 0" {...S} />
    </>
  ),
  // Connected path with nodes — "career path"
  'career-path': (
    <>
      <path d="M4 18l5-9 5 7 6-9" {...S} />
      <circle cx="4" cy="18" r="1.6" {...S} />
      <circle cx="14" cy="16" r="1.6" {...S} />
      <circle cx="20" cy="7" r="1.6" {...S} />
    </>
  ),
  // Trophy — "guess the world cup"
  'world-cup': (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" {...S} />
      <path d="M7 5H4.5v1.5A3.5 3.5 0 0 0 8 10M17 5h2.5v1.5A3.5 3.5 0 0 1 16 10" {...S} />
      <path d="M12 13v3.5M9 20h6M10 20l.5-3.5h3l.5 3.5" {...S} />
    </>
  ),
  // Four squares — the Connections motif
  connections: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4" fill="currentColor" stroke="none" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.4" {...S} />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.4" {...S} />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Up / down arrows — "higher or lower"
  'higher-or-lower': (
    <>
      <path d="M8 9.5L8 3.5M8 3.5L5.2 6.3M8 3.5l2.8 2.8" {...S} />
      <path d="M16 14.5L16 20.5M16 20.5l-2.8-2.8M16 20.5l2.8-2.8" {...S} />
    </>
  ),
  // Dartboard — "501"
  '501': (
    <>
      <circle cx="12" cy="12" r="9" {...S} />
      <circle cx="12" cy="12" r="5.2" {...S} />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
}

export default function GameIcon({ id, className = 'w-9 h-9' }) {
  const body = ICONS[id]
  if (!body) return null
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {body}
    </svg>
  )
}
