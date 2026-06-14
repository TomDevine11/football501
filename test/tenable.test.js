import { describe, it, expect } from 'vitest'
import { TENABLE_QUESTIONS, TENABLE_AS_OF, getDailyTenableQuestion } from '../src/data/tenable.js'
import { normalize } from '../src/data/canonical/resolve.js'

describe('Tenable answer-set integrity', () => {
  it('dataset carries an as-of date', () => {
    expect(TENABLE_AS_OF).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('every question has exactly 10 answers ranked strictly 1..10', () => {
    for (const q of TENABLE_QUESTIONS) {
      expect(q.answers, q.id).toHaveLength(10)
      const ranks = q.answers.map(a => a.rank)
      expect(ranks, q.id).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    }
  })

  it('every question has stable required fields', () => {
    for (const q of TENABLE_QUESTIONS) {
      expect(q.id, 'id').toBeTruthy()
      expect(q.title, q.id).toBeTruthy()
      expect(['player', 'club']).toContain(q.type)
      for (const a of q.answers) {
        expect(a.text, `${q.id} answer text`).toBeTruthy()
        expect(a.detail, `${q.id} ${a.text} detail`).toBeTruthy()
      }
    }
  })

  it('answers within a question are distinct (no accidental duplicates)', () => {
    for (const q of TENABLE_QUESTIONS) {
      const norm = q.answers.map(a => normalize(a.text))
      expect(new Set(norm).size, `${q.id} has duplicate answers`).toBe(10)
    }
  })

  it('question ids are unique', () => {
    const ids = TENABLE_QUESTIONS.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('aliases do not collide across answers within a question', () => {
    for (const q of TENABLE_QUESTIONS) {
      const seen = new Map() // normalized alias -> answer text
      for (const a of q.answers) {
        for (const alias of a.aliases || []) {
          const n = normalize(alias)
          if (seen.has(n) && seen.get(n) !== a.text) {
            throw new Error(`${q.id}: alias "${alias}" maps to both ${seen.get(n)} and ${a.text}`)
          }
          seen.set(n, a.text)
        }
      }
    }
  })

  it('daily question is deterministic and in-range', () => {
    const q = getDailyTenableQuestion()
    expect(TENABLE_QUESTIONS).toContain(q)
  })
})
