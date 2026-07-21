// Phase 3: Football 501 validates a picked suggestion by identity. The roster is
// Transfermarkt-keyed, so a suggestion's internal id is mapped to its tm id via
// the crosswalk. A player on the roster validates; a real player who isn't on it
// (picked from the dropdown) is authoritatively not-eligible; free text still
// uses the name/surname resolver.
import { describe, it, expect } from 'vitest'
import { makeCustomChallenge } from '../src/data/football501/game.js'
import cat from '../src/data/football501/catalog.generated.json'
import { resolveNameToId } from '../src/data/canonical/resolve.js'

// A reasonably large Premier League roster so famous, resolvable names appear.
const spec = cat.catalog.find(s => s.comp === 'GB1' && (s.answers || 0) >= 20)

describe('Football 501 id-based validation', () => {
  it('has a usable challenge spec', () => {
    expect(spec).toBeTruthy()
  })

  it('validates a roster player picked by id, and its name matches', async () => {
    const ch = await makeCustomChallenge(spec)
    let ok = null
    for (const a of ch.answersList()) {
      const id = resolveNameToId(a.name)
      if (!id) continue
      const res = ch.validate('', id) // force the id path (empty rawName)
      if (res.status === 'valid') { ok = { a, res }; break }
    }
    expect(ok, 'at least one roster answer should validate by id').toBeTruthy()
    expect(ok.res.name).toBeTruthy()
  })

  it('rejects a real player who is not on the roster when picked by id (namesake fix)', async () => {
    const ch = await makeCustomChallenge(spec)
    // Messi never played in the Premier League → not in any GB1 roster.
    const res = ch.validate('', resolveNameToId('Lionel Messi'))
    expect(res.status).toBe('not-eligible')
  })

  it('free-typed name still validates via the resolver (fallback unchanged)', async () => {
    const ch = await makeCustomChallenge(spec)
    const name = ch.answersList()[0].name
    expect(ch.validate(name).status).toBe('valid')
  })
})
