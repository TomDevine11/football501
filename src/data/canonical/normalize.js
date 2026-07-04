// ─────────────────────────────────────────────────────────────────────────
// SHARED NAME NORMALISATION (pure, dependency-free)
//
// Extracted from resolve.js so build scripts and offline tooling can reuse the
// exact same normalisation the game uses WITHOUT loading the runtime player
// registry (facts.js). resolve.js re-exports these, so existing imports of
// `normalize` / `surnameKeys` from './canonical/resolve.js' keep working.
// ─────────────────────────────────────────────────────────────────────────

// NFD strip diacritics, drop punctuation, lowercase, collapse whitespace.
export function normalize(str) {
  return (str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’ʼ.]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Nobiliary/compound-surname particles — so "van Persie", "de Jong",
// "van der Sar", "van Dijk" resolve the way a user actually types them.
export const PARTICLES = new Set(['van', 'von', 'de', 'der', 'den', 'da', 'dos', 'das', 'di', 'del', 'della', 'la', 'le', 'el', 'al', 'bin', 'ten', 'ter'])

// Returns candidate surname keys for a name: the last token, plus a
// particle-aware tail (e.g. "robin van persie" → ["persie", "van persie"]).
export function surnameKeys(displayName) {
  const parts = normalize(displayName).split(' ')
  const keys = [parts[parts.length - 1]]
  let i = parts.length - 2
  let tail = parts[parts.length - 1]
  while (i >= 0 && PARTICLES.has(parts[i])) {
    tail = parts[i] + ' ' + tail
    keys.push(tail)
    i--
  }
  return keys
}
