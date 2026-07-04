// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 — QUESTION SPEC (shared by the catalog builder AND the game)
//
// A "spec" is one procedurally-generated question:
//   { stat, filter }
//   stat:   'goals' | 'apps'  OR  { a, op, b }   (op '+' | '-')
//   filter: { club?, nationality?, position? }   (1–3 facets)
//
// resolveRoster() turns a spec + the fact table into the eligible answers with
// their darts values — the single implementation both sides use, so the game's
// validation can never disagree with what the catalog was built from.
// ─────────────────────────────────────────────────────────────────────────

const num = (v) => (Number.isFinite(v) ? v : 0)

export const STAT_LABEL = {
  goals: 'Goals', apps: 'Appearances',
}
export function evalStat(rec, stat) {
  if (typeof stat === 'string') return num(rec[stat])
  const a = num(rec[stat.a]), b = num(rec[stat.b])
  return stat.op === '-' ? a - b : a + b
}
export function statLabel(stat) {
  if (typeof stat === 'string') return STAT_LABEL[stat] || stat
  const sym = stat.op === '-' ? '−' : '+'
  return `${STAT_LABEL[stat.a]} ${sym} ${STAT_LABEL[stat.b]}`
}
function breakdownOf(rec, stat) {
  if (typeof stat === 'string') return { [stat]: num(rec[stat]) }
  return { [stat.a]: num(rec[stat.a]), [stat.b]: num(rec[stat.b]) }
}

// The competition is fixed to the Premier League for now (single fact table).
const COMP = 'GB1'

// Resolve a spec against the fact-table players → { players:{id:{name,value,breakdown}}, values:[] }.
// Nationality/position filter WHICH players count (a person property); club
// scopes WHICH apps/goals count (a context property). Eligibility: value ≥ 1
// (≥180 is a recognised bust, still included).
export function resolveRoster(spec, factPlayers) {
  const f = spec.filter || {}
  const players = {}
  const values = []
  for (const p of factPlayers) {
    if (f.nationality && p.natKey !== f.nationality) continue
    if (f.position && p.pos !== f.position) continue
    const comp = p.comps?.[COMP]
    if (!comp) continue
    const rec = f.club ? comp.clubs?.[f.club] : comp
    if (!rec) continue
    const value = evalStat(rec, spec.stat)
    if (value < 1) continue
    players[p.id] = { name: p.name, value, breakdown: breakdownOf(rec, spec.stat) }
    values.push(value)
  }
  return { players, values }
}

// ── Readable auto-title ───────────────────────────────────────────────────
const POS_PLURAL = { GK: 'goalkeepers', DEF: 'defenders', MID: 'midfielders', FWD: 'forwards' }
// nationality key → demonym adjective (common footballing nations; falls back
// to the raw nationality display when unknown).
const DEMONYM = {
  england: 'English', scotland: 'Scottish', wales: 'Welsh', 'northern ireland': 'Northern Irish', ireland: 'Irish',
  france: 'French', spain: 'Spanish', germany: 'German', italy: 'Italian', portugal: 'Portuguese', netherlands: 'Dutch',
  belgium: 'Belgian', brazil: 'Brazilian', argentina: 'Argentine', uruguay: 'Uruguayan', colombia: 'Colombian', chile: 'Chilean',
  denmark: 'Danish', sweden: 'Swedish', norway: 'Norwegian', 'ivory coast': 'Ivorian', senegal: 'Senegalese', ghana: 'Ghanaian',
  nigeria: 'Nigerian', 'united states': 'American', australia: 'Australian', croatia: 'Croatian', serbia: 'Serbian',
  poland: 'Polish', 'czech republic': 'Czech', switzerland: 'Swiss', austria: 'Austrian', greece: 'Greek', turkey: 'Turkish',
  mexico: 'Mexican', japan: 'Japanese', 'south korea': 'South Korean', egypt: 'Egyptian', morocco: 'Moroccan', algeria: 'Algerian',
  cameroon: 'Cameroonian', 'south africa': 'South African', jamaica: 'Jamaican', finland: 'Finnish', iceland: 'Icelandic',
  ukraine: 'Ukrainian', russia: 'Russian', romania: 'Romanian', hungary: 'Hungarian', slovakia: 'Slovak', slovenia: 'Slovenian',
}
export function demonym(natKey, fallbackDisplay) {
  return DEMONYM[natKey] || fallbackDisplay || natKey
}

// Build "Appearances − Goals · French Brighton midfielders" from a spec.
// ctx: { clubName, natDisplay }
export function titleFor(spec, ctx = {}) {
  const f = spec.filter || {}
  const parts = []
  if (f.nationality) parts.push(demonym(f.nationality, ctx.natDisplay))
  if (f.club) parts.push(ctx.clubName || 'club')
  parts.push(f.position ? POS_PLURAL[f.position] : 'players')
  return `${statLabel(spec.stat)} · ${parts.join(' ')}`
}
