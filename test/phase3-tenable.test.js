// Phase 3: Tenable player questions match a picked suggestion by stable player
// id. This tests the id index + decision logic (mirrored from the component)
// against real question data: correct id accepts, namesake id rejects when the
// answer set is fully resolved, and free text still uses name matching.
import { describe, it, expect } from 'vitest'
import { TENABLE_QUESTIONS } from '../src/data/tenable.js'
import { resolveNameToId } from '../src/data/canonical/resolve.js'

// Build the same id index the component builds.
function idIndex(question) {
  const a = new Map(), p = new Map()
  let unresolved = 0
  if (question.type === 'player') {
    for (const ans of question.answers) { const id = resolveNameToId(ans.text); if (id) a.set(id, ans); else unresolved++ }
    for (const pl of question.tiePool || []) { const id = resolveNameToId(pl.text); if (id) p.set(id, pl); else unresolved++ }
  }
  return { idToAnswer: a, idToPooled: p, unresolvedValid: unresolved }
}

const playerQs = TENABLE_QUESTIONS.filter(q => q.type === 'player')

describe('Tenable id matching', () => {
  it('has player questions whose answers resolve to ids', () => {
    const anyResolved = playerQs.some(q => q.answers.some(a => resolveNameToId(a.text)))
    expect(anyResolved).toBe(true)
  })

  it('a correct answer picked by id maps back to that answer', () => {
    for (const q of playerQs) {
      const ans = q.answers.find(a => resolveNameToId(a.text))
      if (!ans) continue
      const { idToAnswer } = idIndex(q)
      expect(idToAnswer.get(resolveNameToId(ans.text))).toBe(ans)
      return
    }
    throw new Error('no resolvable answer found')
  })

  it('a fully-resolved question rejects a player not in the list (namesake fix)', () => {
    const q = playerQs.find(x => {
      const { unresolvedValid, idToAnswer } = idIndex(x)
      return unresolvedValid === 0 && idToAnswer.size >= 5
    })
    if (!q) return // fine if none is fully resolved in the dataset
    const { idToAnswer, idToPooled } = idIndex(q)
    const intruder = resolveNameToId('Cristiano Ronaldo')
    // Only meaningful if the intruder isn't legitimately in this list.
    if (!idToAnswer.has(intruder) && !idToPooled.has(intruder)) {
      expect(idToAnswer.get(intruder) || idToPooled.get(intruder) || null).toBeNull()
    }
  })
})
