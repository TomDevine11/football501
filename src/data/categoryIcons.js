// Icons for TicTacToe / Connections categories.
//   club / league  → badge image (resolved once into categoryIcons.generated.json)
//   nationality    → flag image (flagcdn, by ISO code — static, no fetch)
//   trophy         → emoji (static; falls back to a generic trophy)
// Returns null for an unknown club/league/nationality so the <CategoryIcon>
// component can show a monogram fallback.
import gen from './categoryIcons.generated.json'

const FLAGS = {
  Argentina: 'ar', Brazil: 'br', France: 'fr', Spain: 'es', England: 'gb-eng',
  Germany: 'de', Netherlands: 'nl', Portugal: 'pt', Italy: 'it', Belgium: 'be',
  Croatia: 'hr', Uruguay: 'uy', Scotland: 'gb-sct', Wales: 'gb-wls',
}

const TROPHIES = {
  "Ballon d'Or": '🏅',
  'FIFA World Cup': '🏆',
  'UEFA Champions League': '⭐',
  'UEFA European Championship': '🇪🇺',
}

export function categoryIcon(category) {
  if (!category) return null
  switch (category.type) {
    case 'club': { const u = gen.clubs?.[category.value]; return u ? { img: u } : null }
    case 'league': { const u = gen.leagues?.[category.value]; return u ? { img: u } : null }
    case 'nationality': { const iso = FLAGS[category.value]; return iso ? { img: `https://flagcdn.com/w80/${iso}.png` } : null }
    case 'trophy': return { emoji: TROPHIES[category.value] || '🏆' }
    default: return null
  }
}
