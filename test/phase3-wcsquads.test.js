// Phase 3: World Cup Squads validates a picked suggestion by stable player id
// (namesake picked from the dropdown is rejected) while free-typed text keeps
// full-name/unique-surname matching.
import { describe, it, expect } from 'vitest'
import { SQUADS, buildMatcher, matchPlayer } from '../src/data/wcsquads.js'
import { resolveNameToId } from '../src/data/canonical/resolve.js'

// Find a squad + a member that resolves to a stable id, for realistic assertions.
function squadWithResolvedMember() {
  for (const squad of SQUADS) {
    const m = buildMatcher(squad)
    const name = squad.players.find(n => resolveNameToId(n))
    if (name) return { squad, matcher: m, name, id: resolveNameToId(name) }
  }
  return null
}

describe('World Cup Squads id matching', () => {
  const found = squadWithResolvedMember()

  it('has at least one resolvable squad member to test with', () => {
    expect(found).toBeTruthy()
  })

  it('accepts a squad member picked by id', () => {
    const { matcher, name, id } = found
    expect(matchPlayer(matcher, name, id)).toBe(name)
  })

  it('rejects a real player who is NOT in the squad when picked by id (namesake fix)', () => {
    const { squad, matcher } = found
    // Cristiano Ronaldo is in no World Cup-winning squad in this dataset.
    const intruderId = resolveNameToId('Cristiano Ronaldo')
    if (matcher.unresolved === 0 && !squad.players.some(n => resolveNameToId(n) === intruderId)) {
      expect(matchPlayer(matcher, 'Cristiano Ronaldo', intruderId)).toBeNull()
    }
  })

  it('free-typed full name still matches (fallback unchanged)', () => {
    const { matcher, name } = found
    expect(matchPlayer(matcher, name)).toBe(name)
  })

  it('unknown free text does not match', () => {
    const { matcher } = found
    expect(matchPlayer(matcher, 'Zzz Notaplayer')).toBeNull()
  })
})
