// Club crest lookup. Map is keyed by the EXACT club name our data uses (see
// scripts/build-crests.mjs), so callers pass the same label they display.
// Returns null when we have no crest — callers (the <Crest> component) then
// fall back to a monogram, so the long tail of clubs degrades gracefully.
import data from './crests.generated.json'

const CRESTS = data.crests || {}

export const CRESTS_AS_OF = data.meta?.fetchedAt || ''

export function crestUrl(clubName) {
  return CRESTS[clubName] || null
}
