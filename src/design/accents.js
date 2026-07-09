// Runtime twin of the game-accent tokens in tailwind.config.js (design-tokens.md §1.4).
// Keys match the token names (accent-tenable → 'tenable'). A game surface sets these
// three variables once at its root and every accent-aware style (`text-accent`,
// `border-accent`, `shadow-glow`, the Hub card wash) picks up that game's identity.
// Change values here and in tailwind.config.js together.

export const GAME_ACCENTS = {
  tenable: { accent: '#c6a953', bright: '#d5bd76', tint: 'rgb(198 169 83 / 0.10)' },
  wordle: { accent: '#6992d3', bright: '#8eaee1', tint: 'rgb(105 146 211 / 0.10)' },
  tictactoe: { accent: '#797ad8', bright: '#9698e3', tint: 'rgb(121 122 216 / 0.10)' },
  teammates: { accent: '#cd709e', bright: '#dc93b8', tint: 'rgb(205 112 158 / 0.10)' },
  careers: { accent: '#47afc2', bright: '#6bc2d1', tint: 'rgb(71 175 194 / 0.10)' },
  wcsquads: { accent: '#cb9d4d', bright: '#dab472', tint: 'rgb(203 157 77 / 0.10)' },
  connections: { accent: '#47aea2', bright: '#64c4b9', tint: 'rgb(71 174 162 / 0.10)' },
  higherlower: { accent: '#cf8a59', bright: '#dda67e', tint: 'rgb(207 138 89 / 0.10)' },
  501: { accent: '#cf6e6e', bright: '#dd9292', tint: 'rgb(207 110 110 / 0.10)' },
}

// Style object for the element that roots a game's accent scope.
export function accentVars(id) {
  const a = GAME_ACCENTS[id]
  if (!a) return {}
  return { '--accent': a.accent, '--accent-bright': a.bright, '--accent-tint': a.tint }
}
