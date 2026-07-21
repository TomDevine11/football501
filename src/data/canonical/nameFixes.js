// ─────────────────────────────────────────────────────────────────────────
// CURATED NAME FIXES  (pure, dependency-free)
//
// A few source names arrive corrupted from the Wikidata import — a stray
// lowercase fragment or nickname got appended to the real name (e.g. a
// description/alias bled into the label). These are unambiguous, single-person
// corrections, so we fix them by hand. Applied by BOTH facts.js (the search /
// board source) and scripts/build-identity.mjs (the registry), so the clean
// name is canonical everywhere and the corrupt form still resolves as an alias.
//
// NOT handled here: parenthetical disambiguation names like
// "Dida (footballer, born 1934)". Those must NOT be blindly stripped — the
// parenthetical is often the only thing distinguishing two different players,
// so collapsing them would false-merge namesakes. They are tracked as a Phase 1
// manual-review backlog (see docs/player-identity-refactor.md).
// ─────────────────────────────────────────────────────────────────────────

import generatedFixes from './nameFixes.generated.js'

// Hand-curated corrections (not derivable). These win over generated ones.
const MANUAL_FIXES = {
  'Divock Origi kolman': 'Divock Origi',              // "kolman" is not part of his name
  'Ángel Amadeo labruna': 'Ángel Amadeo Labruna',    // surname was lowercased
  'Antonio Mirante el flecheiro': 'Antonio Mirante', // "el flecheiro" is a nickname
}

// Generated: parenthetical Wikipedia disambiguation names, cleaned where safe
// (see scripts/build-name-fixes.mjs — never merges namesakes).
export const NAME_FIXES = { ...generatedFixes, ...MANUAL_FIXES }

export function fixName(name) {
  return NAME_FIXES[name] || name
}
