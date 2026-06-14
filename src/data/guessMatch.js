// Shared "did the guess name this player?" matcher for the guessing modes
// (Guess the Player from teammates, Career Path). Self-contained (doesn't need
// the global registry) so the target's own name always validates: accepts full
// name or surname, accent- and particle-aware ("Mbappe", "van Dijk", "Dijk").

import { normalize } from './canonical/resolve.js'

const PARTICLES = new Set(['van', 'von', 'de', 'der', 'den', 'da', 'dos', 'das', 'di', 'del', 'la', 'le', 'el', 'al', 'ten', 'ter'])

function nameKeys(name) {
  const parts = normalize(name).split(' ')
  const keys = new Set([normalize(name), parts[parts.length - 1]])
  let i = parts.length - 2, tail = parts[parts.length - 1]
  while (i >= 0 && PARTICLES.has(parts[i])) { tail = parts[i] + ' ' + tail; keys.add(tail); i-- }
  return keys
}

export function matchesTarget(targetName, guessText) {
  const q = normalize(guessText)
  return !!q && nameKeys(targetName).has(q)
}
