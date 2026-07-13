// ─────────────────────────────────────────────────────────────────────────
// SHARED ENTITY RESOLUTION
//
// ONE normalisation + matching implementation for the whole platform. Replaces
// the three divergent copies of normalizeName/broadenPosition. Adjudication is
// pure (no I/O): map raw user text → a canonical player id (or AMBIGUOUS /
// UNKNOWN), then membership is a set lookup.
//
// Ambiguity is SURFACED, never silently guessed — this is the correct handling
// of "Ronaldo", duplicate surnames (Neville), etc., instead of a heuristic
// quietly picking one and scoring the wrong player.
// ─────────────────────────────────────────────────────────────────────────

import { allPlayers } from './facts.js'
// normalize/surnameKeys live in a pure, registry-free module so build scripts can
// reuse them; re-exported here so existing `from './resolve.js'` imports work.
import { normalize, surnameKeys } from './normalize.js'
export { normalize } from './normalize.js'

export const OK = 'ok'
export const AMBIGUOUS = 'ambiguous'
export const UNKNOWN = 'unknown'

// Bare tokens that genuinely refer to more than one real person — must prompt,
// never auto-resolve. Curated, small, explicit.
const AMBIGUOUS_ALIASES = {
  ronaldo: ['Cristiano Ronaldo', 'Ronaldo Nazario'],
}

// Build the indices once.
let fullIndex = null      // normalized full name/alias -> Set(displayName)
let surnameIndex = null   // normalized surname -> Set(displayName)

function build() {
  fullIndex = new Map()
  surnameIndex = new Map()
  const add = (map, key, displayName) => {
    if (!key) return
    if (!map.has(key)) map.set(key, new Set())
    map.get(key).add(displayName)
  }
  for (const p of allPlayers()) {
    add(fullIndex, normalize(p.displayName), p.displayName)
    for (const key of surnameKeys(p.displayName)) add(surnameIndex, key, p.displayName)
  }
}

function result(status, displayNames) {
  if (status === OK) return { status, displayName: [...displayNames][0] }
  if (status === AMBIGUOUS) return { status, options: [...displayNames].sort() }
  return { status }
}

// Resolve raw text against the canonical registry.
//   { status:'ok', displayName } | { status:'ambiguous', options:[…] } | { status:'unknown' }
export function resolve(rawInput) {
  if (!fullIndex) build()
  const q = normalize(rawInput)
  if (!q) return result(UNKNOWN)

  // Known ambiguous bare token (e.g. "ronaldo").
  if (AMBIGUOUS_ALIASES[q]) return result(AMBIGUOUS, AMBIGUOUS_ALIASES[q])

  // Exact full-name/alias hit.
  if (fullIndex.has(q)) {
    const set = fullIndex.get(q)
    return set.size === 1 ? result(OK, set) : result(AMBIGUOUS, set)
  }

  // Surname-only: unique → ok, otherwise ambiguous.
  if (surnameIndex.has(q)) {
    const set = surnameIndex.get(q)
    return set.size === 1 ? result(OK, set) : result(AMBIGUOUS, set)
  }

  return result(UNKNOWN)
}

// Convenience for game code that already has a closed candidate set for a cell:
// resolve the guess, then confirm membership + not-yet-used. Returns the
// canonical display name on success, else null. Mirrors the old resolveGuess
// contract but is backed by the shared resolver.
export function resolveAgainst(rawInput, candidateNames, usedNames = new Set()) {
  const candidates = new Set(candidateNames)
  const r = resolve(rawInput)
  if (r.status === OK) {
    return candidates.has(r.displayName) && !usedNames.has(r.displayName) ? r.displayName : null
  }
  if (r.status === AMBIGUOUS) {
    // If exactly one of the disambiguation options is a valid unused candidate,
    // the cell context disambiguates it — accept that one.
    const viable = r.options.filter(n => candidates.has(n) && !usedNames.has(n))
    return viable.length === 1 ? viable[0] : null
  }
  return null
}

// ── Autocomplete cleanup ──────────────────────────────────────────────────
// Suggestion dropdowns merge names from an external API + a local list, so
// near-duplicates slip through: misspellings ("Frank Ribery" vs "Franck Ribéry"),
// first-name variants ("Emil"/"Emile Smith-Rowe") and bare ambiguous tokens
// ("Ronaldo"). Run the merged list through the registry so the dropdown only
// offers clean, resolvable players:
//   • a name the registry knows     → its canonical spelling
//   • an ambiguous bare token        → the real people it could mean
//   • a spelling variant of a known  → dropped (it could never validate)
//   • a genuinely unknown name        → kept as-is (never hide a real answer)
// Deduped by canonical identity. `list` is [{ name, flag, … }]; extra fields
// (e.g. position) are preserved for resolved names.
function fuzzyKey(name) {
  const parts = normalize(name).split(' ').filter(Boolean)
  return `${parts[parts.length - 1] || ''}|${(parts[0] || '').slice(0, 3)}`
}
export function refineSuggestions(list, usedNames = new Set()) {
  const canon = new Map()       // normalized canonical name -> item
  const knownFuzzy = new Set()  // fuzzy keys already covered by a known player
  const unknowns = []
  const addCanon = (name, src) => {
    const key = normalize(name)
    if (!canon.has(key)) canon.set(key, { ...src, name })
    knownFuzzy.add(fuzzyKey(name))
  }
  for (const item of list) {
    const r = resolve(item.name)
    if (r.status === OK) addCanon(r.displayName, item)
    else if (r.status === AMBIGUOUS) r.options.forEach(opt => addCanon(opt, {}))
    else unknowns.push(item)
  }
  const out = []
  const seen = new Set()
  const push = (item) => {
    const key = normalize(item.name)
    if (!key || seen.has(key) || usedNames.has(item.name)) return
    seen.add(key); out.push(item)
  }
  for (const item of canon.values()) push(item)
  for (const item of unknowns) {
    if (knownFuzzy.has(fuzzyKey(item.name))) continue // spelling variant of a known player → drop
    push(item)                                        // genuinely non-registry player → keep
  }
  return out
}
