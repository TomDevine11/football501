import { describe, it, expect } from 'vitest'
import { getDailyEntry, getDailyChallenge, getRandomChallenge, badgeFor, CATALOG_SIZE, evaluateSpec, makeCustomChallenge, CLUBS, NATIONS, POSITIONS, STAT_OPTIONS } from '../src/data/football501/game.js'
import { resolveRoster, titleFor } from '../src/data/football501/spec.js'

describe('501 catalog + generator', () => {
  it('has a catalog of completable questions', () => {
    expect(CATALOG_SIZE).toBeGreaterThan(500)
  })

  it('daily question is deterministic', () => {
    expect(getDailyEntry().id).toBe(getDailyEntry().id)
  })

  it('daily challenge resolves with a working validator', () => {
    const c = getDailyChallenge()
    expect(c.title).toBeTruthy()
    expect(typeof c.validate).toBe('function')
    expect(c.maxPlayers).toBeGreaterThanOrEqual(1)
    expect(c.validate('zzznotaplayer').status).toBe('not-eligible')
  })

  it('random multiplayer question supports the requested player count', () => {
    for (let i = 0; i < 10; i++) expect(getRandomChallenge(3).maxPlayers).toBeGreaterThanOrEqual(3)
  })

  it('position badge is stable and comes from our data', () => {
    expect(badgeFor('Alan Shearer')).toBe('FWD')
    expect(badgeFor('Petr Cech')).toBe('GK')
    expect(badgeFor('zzznobody')).toBe(null)
  })
})

describe('501 custom builder', () => {
  it('exposes populated option lists', () => {
    expect(CLUBS.length).toBeGreaterThan(40)
    expect(NATIONS.length).toBeGreaterThan(20)
    expect(POSITIONS.length).toBe(4)
    expect(STAT_OPTIONS.length).toBe(4)
  })

  it('evaluates completability live (broad = ok, resolves a real answer)', () => {
    const broad = evaluateSpec({ stat: 'goals', filter: {} })
    expect(broad.answers).toBeGreaterThan(1000)
    expect(broad.maxPlayers).toBe(5)
    expect(broad.solvable).toBe(true)

    const c = makeCustomChallenge({ stat: 'goals', filter: { nationality: 'france' } })
    expect(c.title).toBe('Goals · French players')
    expect(c.validate('Thierry Henry')).toMatchObject({ status: 'valid', value: 175 })
  })

  it('answersList reveals the full roster, highest first', () => {
    const c = makeCustomChallenge({ stat: 'goals', filter: { nationality: 'france' } })
    const list = c.answersList()
    expect(list[0]).toMatchObject({ name: 'Thierry Henry', value: 175 })
    expect(list.length).toBeGreaterThan(50) // whole roster, not top-N
    expect(list.every((a, i) => i === 0 || list[i - 1].value >= a.value)).toBe(true) // sorted desc
  })

  it('live insight boxes: highest / checkouts / perfect, updating with used', () => {
    const c = makeCustomChallenge({ stat: 'goals', filter: { nationality: 'france' } }) // Henry 175, Anelka 125…
    expect(c.insights(500, new Set()).highest).toBe(175)            // Henry, top French scorer < 180
    const on175 = c.insights(175, new Set())
    expect(on175.perfect).toBe(1)                                    // Henry lands exactly on 0
    expect(on175.checkouts).toBeGreaterThanOrEqual(1)
    expect(c.insights(500, new Set(['Thierry Henry'])).highest).toBe(125) // Henry used → next highest
  })
})

describe('501 spec resolver (shared by build + game)', () => {
  const fact = [
    { id: '1', name: 'A Keeper',  natKey: 'england', pos: 'GK',  comps: { GB1: { apps: 400, goals: 0,  clubs: { 11: { apps: 400, goals: 0 } } } } },
    { id: '2', name: 'A Striker', natKey: 'france',  pos: 'FWD', comps: { GB1: { apps: 100, goals: 80, clubs: { 11: { apps: 100, goals: 80 } } } } },
  ]

  it('applies stat + player-property filters', () => {
    const { players } = resolveRoster({ stat: { a: 'apps', op: '-', b: 'goals' }, filter: { position: 'FWD' } }, fact)
    expect(Object.values(players)).toEqual([{ name: 'A Striker', value: 20, breakdown: { apps: 100, goals: 80 } }])
  })

  it('club filter scopes the value to that club', () => {
    const { players } = resolveRoster({ stat: 'goals', filter: { club: '11' } }, fact)
    expect(players['2'].value).toBe(80)
    expect(players['1']).toBeUndefined() // keeper: 0 goals → not eligible
  })

  it('auto-titles read naturally', () => {
    expect(titleFor({ stat: { a: 'apps', op: '-', b: 'goals' }, filter: { nationality: 'france', position: 'FWD' } }, {})).toBe('Appearances − Goals · French forwards')
  })
})
