import { describe, it, expect } from 'vitest'
import { SQUADS, buildMatcher, matchPlayer } from '../src/data/wcsquads.js'

const squad = (label) => SQUADS.find(s => `${s.nation} ${s.year}` === label)

describe('World Cup winning squads data', () => {
  it('has a good set of recognisable winning teams', () => {
    expect(SQUADS.length).toBeGreaterThanOrEqual(10)
    expect(squad('Brazil 2002')).toBeTruthy()
    expect(squad('Argentina 2022')).toBeTruthy()
    expect(squad('England 1966')).toBeTruthy()
  })

  it('every squad is a realistic size (22–26)', () => {
    for (const s of SQUADS) {
      expect(s.players.length, `${s.nation} ${s.year}`).toBeGreaterThanOrEqual(20)
      expect(s.players.length, `${s.nation} ${s.year}`).toBeLessThanOrEqual(26)
      expect(new Set(s.players).size).toBe(s.players.length) // distinct
    }
  })
})

describe('squad answer matching', () => {
  it('matches full names and unique surnames, accent-insensitive', () => {
    const m = buildMatcher(squad('Brazil 2002'))
    expect(matchPlayer(m, 'Cafu')).toBe('Cafu')
    expect(matchPlayer(m, 'roberto carlos')).toBe('Roberto Carlos')
    expect(matchPlayer(m, 'Kaka')).toBe('Kaká')
  })

  it('a surname shared within the squad needs the full name', () => {
    const m = buildMatcher(squad('England 1966'))
    expect(matchPlayer(m, 'Hurst')).toBe('Geoff Hurst')      // unique surname
    expect(matchPlayer(m, 'Bobby Charlton')).toBe('Bobby Charlton')
    expect(matchPlayer(m, 'Jack Charlton')).toBe('Jack Charlton')
    expect(matchPlayer(m, 'Charlton')).toBeNull()            // ambiguous → needs first name
  })

  it('rejects players not in the squad and junk', () => {
    const m = buildMatcher(squad('Brazil 2002'))
    expect(matchPlayer(m, 'Lionel Messi')).toBeNull()
    expect(matchPlayer(m, '')).toBeNull()
    expect(matchPlayer(m, '###')).toBeNull()
  })
})
