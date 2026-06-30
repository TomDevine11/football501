// Icons for TicTacToe / Connections categories.
//   club / league  → badge image (resolved once into categoryIcons.generated.json)
//   nationality    → flag image (flagcdn, by ISO code — static, no fetch)
//   trophy         → emoji (static; falls back to a generic trophy)
// Returns null for an unknown club/league/nationality so the <CategoryIcon>
// component can show a monogram fallback.
import gen from './categoryIcons.generated.json'
import careerCrests from './crests.generated.json'

// Normalised club-crest index, merging the TicTacToe category badges with the
// Career Path crest set, so a club resolves regardless of spelling ("Bayern
// Munich" ↔ "FC Bayern Munich", "Barcelona" ↔ "Fc Barcelona"). Category badges
// take precedence (cleaner art) on a collision.
const clubKey = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\b(fc|afc|cf|ac|ssc|as|cd|sc|sl|cp|ud|sd)\b/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
const CLUB_CRESTS = {}
for (const [k, v] of Object.entries({ ...(careerCrests.crests || {}), ...(gen.clubs || {}) })) CLUB_CRESTS[clubKey(k)] = v

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
    case 'club': { const u = CLUB_CRESTS[clubKey(category.value)]; return u ? { img: u } : null }
    case 'league': { const u = gen.leagues?.[category.value]; return u ? { img: u } : null }
    case 'nationality': { const iso = FLAGS[category.value]; return iso ? { img: `https://flagcdn.com/w80/${iso}.png` } : null }
    case 'trophy': return { emoji: TROPHIES[category.value] || '🏆' }
    default: return null
  }
}
