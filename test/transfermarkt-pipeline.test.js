import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

import { verify } from '../scripts/transfermarkt/00-verify.mjs'
import { loadDimensions } from '../scripts/transfermarkt/10-load-dimensions.mjs'
import { aggregateAppearances } from '../scripts/transfermarkt/20-aggregate-appearances.mjs'
import { enrichNormalize } from '../scripts/transfermarkt/30-enrich-normalize.mjs'
import { emit } from '../scripts/transfermarkt/40-emit.mjs'
import { resolveChallenge } from '../scripts/transfermarkt/60-resolve-challenges.mjs'

// ── Synthetic Kaggle-shaped fixtures ─────────────────────────────────
const toCsv = (header, rows) =>
  [header.join(','), ...rows.map(r => header.map(h => r[h] ?? '').join(','))].join('\n') + '\n'

const COMPETITIONS = toCsv(
  ['competition_id', 'competition_code', 'name', 'type', 'sub_type', 'country_id', 'country_name', 'domestic_league_code', 'confederation', 'total_clubs', 'url'],
  [
    { competition_id: 'GB1', name: 'premier-league', type: 'domestic_league', country_name: 'England' },
    { competition_id: 'IT1', name: 'serie-a', type: 'domestic_league', country_name: 'Italy' },
    { competition_id: 'GB2', name: 'championship', type: 'domestic_league', country_name: 'England' }, // NOT allow-listed
  ],
)

const CLUBS = toCsv(
  ['club_id', 'club_code', 'name', 'domestic_competition_id'],
  [
    { club_id: '281', name: 'Manchester City', domestic_competition_id: 'GB1' },
    { club_id: '11', name: 'Arsenal Football Club', domestic_competition_id: 'GB1' },
    { club_id: '506', name: 'Juventus FC', domestic_competition_id: 'IT1' },
  ],
)

const PLAYERS = toCsv(
  ['player_id', 'name', 'country_of_citizenship', 'position', 'date_of_birth'],
  [
    { player_id: '28003', name: 'David Silva', country_of_citizenship: 'Spain', position: 'Midfield', date_of_birth: '1986-01-08' },
    { player_id: '433177', name: 'Bukayo Saka', country_of_citizenship: 'England', position: 'Attack', date_of_birth: '2001-09-05' },
    { player_id: '221097', name: 'Alex Sandro', country_of_citizenship: 'Brazil', position: 'Defender', date_of_birth: '1991-01-26' },
    { player_id: '99999', name: 'Journeyman Sub', country_of_citizenship: 'England', position: 'Defender', date_of_birth: '1990-01-01' },
    { player_id: '74228', name: 'Fixture Mover', country_of_citizenship: 'England', position: 'Midfield', date_of_birth: '1988-01-01' },
  ],
)

const A = (o) => ({ yellow_cards: 0, red_cards: 0, goals: 0, assists: 0, minutes_played: 90, ...o })
const APPEARANCES = toCsv(
  ['appearance_id', 'game_id', 'player_id', 'player_club_id', 'player_current_club_id', 'date', 'player_name', 'competition_id', 'yellow_cards', 'red_cards', 'goals', 'assists', 'minutes_played'],
  [
    // David Silva — Man City, PL: apps 3, goals 2, assists 2, yellow 1
    A({ appearance_id: 'a1', player_id: '28003', player_club_id: '281', player_name: 'David Silva', competition_id: 'GB1', goals: 1, assists: 1 }),
    A({ appearance_id: 'a2', player_id: '28003', player_club_id: '281', player_name: 'David Silva', competition_id: 'GB1', goals: 0, assists: 1, yellow_cards: 1 }),
    A({ appearance_id: 'a3', player_id: '28003', player_club_id: '281', player_name: 'David Silva', competition_id: 'GB1', goals: 1, assists: 0, minutes_played: 45 }),
    // Bukayo Saka — Arsenal, PL: apps 2, goals 2, assists 1
    A({ appearance_id: 'a4', player_id: '433177', player_club_id: '11', player_name: 'Bukayo Saka', competition_id: 'GB1', goals: 1, yellow_cards: 1 }),
    A({ appearance_id: 'a5', player_id: '433177', player_club_id: '11', player_name: 'Bukayo Saka', competition_id: 'GB1', goals: 1, assists: 1 }),
    // Alex Sandro — Juventus, Serie A: apps 2, yellow 2, assists 1
    A({ appearance_id: 'a6', player_id: '221097', player_club_id: '506', player_name: 'Alex Sandro', competition_id: 'IT1', yellow_cards: 1, assists: 1 }),
    A({ appearance_id: 'a7', player_id: '221097', player_club_id: '506', player_name: 'Alex Sandro', competition_id: 'IT1', yellow_cards: 1, goals: 1 }),
    // Journeyman — 1 PL app at Arsenal (obscure, must be KEPT), + 1 excluded Championship app
    A({ appearance_id: 'a8', player_id: '99999', player_club_id: '11', player_name: 'Journeyman Sub', competition_id: 'GB1', minutes_played: 5 }),
    A({ appearance_id: 'a9', player_id: '99999', player_club_id: '999', player_name: 'Journeyman Sub', competition_id: 'GB2', goals: 5 }), // excluded comp
    // Fixture Mover — two PL clubs (per-club breakdown + rollup)
    A({ appearance_id: 'a10', player_id: '74228', player_club_id: '281', player_name: 'Fixture Mover', competition_id: 'GB1', goals: 1 }),
    A({ appearance_id: 'a11', player_id: '74228', player_club_id: '11', player_name: 'Fixture Mover', competition_id: 'GB1', goals: 2, assists: 1 }),
  ],
)

let dir, csv, built, meta
beforeAll(async () => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'tm-pipeline-'))
  writeFileSync(path.join(dir, 'competitions.csv'), COMPETITIONS)
  writeFileSync(path.join(dir, 'clubs.csv'), CLUBS)
  writeFileSync(path.join(dir, 'players.csv'), PLAYERS)
  writeFileSync(path.join(dir, 'appearances.csv'), APPEARANCES)
  csv = {
    appearances: path.join(dir, 'appearances.csv'),
    players: path.join(dir, 'players.csv'),
    clubs: path.join(dir, 'clubs.csv'),
    competitions: path.join(dir, 'competitions.csv'),
  }
  await verify(csv)
  const dims = await loadDimensions(csv)
  const { agg, names, stats } = await aggregateAppearances(csv)
  built = enrichNormalize({ agg, names, dims })
  built._stats = stats
  const out = {
    data: path.join(dir, 'football501.generated.json'),
    players: path.join(dir, 'players.index.json'),
    clubs: path.join(dir, 'clubs.index.json'),
    competitions: path.join(dir, 'competitions.index.json'),
    meta: path.join(dir, 'meta.json'),
  }
  meta = emit(built, stats, { out, outDir: dir, rawDir: dir })
  built._out = out
})
afterAll(() => rmSync(dir, { recursive: true, force: true }))

// Helper: find a player record in the built fact table by display name.
const P = (name) => built.players.find(p => p.name === name)

describe('501 data engine — aggregation', () => {
  it('sums the six measures per (player, competition, club)', () => {
    const silva = P('David Silva').comps.GB1
    expect(silva.apps).toBe(3)
    expect(silva.goals).toBe(2)
    expect(silva.assists).toBe(2)
    expect(silva.yellow).toBe(1)
    expect(silva.minutes).toBe(225)
    expect(silva.clubs['281'].goals).toBe(2) // per-club breakdown retained
  })

  it('excludes non-allow-listed competitions but keeps the player if they qualify elsewhere', () => {
    const jm = P('Journeyman Sub')
    expect(jm).toBeTruthy()               // obscure 1-app player KEPT (no top-N cut)
    expect(jm.comps.GB2).toBeUndefined()  // Championship row excluded
    expect(jm.comps.GB1.apps).toBe(1)
  })

  it('rolls multi-club spells up to a competition total while keeping the split', () => {
    const mover = P('Fixture Mover').comps.GB1
    expect(mover.apps).toBe(2)
    expect(mover.goals).toBe(3)
    expect(Object.keys(mover.clubs).sort()).toEqual(['11', '281'])
    expect(mover.clubs['11'].goals).toBe(2)
    expect(mover.clubs['281'].goals).toBe(1)
  })
})

describe('501 data engine — indices + normalisation', () => {
  it('resolves full names and surnames to player ids', () => {
    expect(built.byNorm['david silva']).toContain('28003')
    expect(built.byNorm['saka']).toContain('433177')
    expect(built.byNorm['silva']).toContain('28003')
  })
  it('nationality is carried and normalised', () => {
    expect(P('Alex Sandro').nat).toBe('Brazil')
    expect(P('Alex Sandro').natKey).toBe('brazil')
  })
  it('competitions index uses the config label', () => {
    expect(built.competitionsIndex.GB1.name).toBe('Premier League')
  })
})

// The three query formats from the spec, computed off the fact table.
describe('501 data engine — answers the <Stat> <Op> <Stat> from <filter> in <comp> format', () => {
  it('Appearances − Goals from Spanish players in the Premier League', () => {
    const rows = built.players
      .filter(p => p.natKey === 'spain' && p.comps.GB1)
      .map(p => ({ name: p.name, value: p.comps.GB1.apps - p.comps.GB1.goals }))
    expect(rows).toEqual([{ name: 'David Silva', value: 1 }]) // 3 apps − 2 goals
  })

  it('Goals + Assists from Arsenal (club 11) players in the Premier League', () => {
    const rows = built.players
      .filter(p => p.comps.GB1?.clubs['11'])
      .map(p => ({ name: p.name, value: p.comps.GB1.clubs['11'].goals + p.comps.GB1.clubs['11'].assists }))
    expect(rows.find(r => r.name === 'Bukayo Saka').value).toBe(3) // 2 goals + 1 assist
  })

  it('Yellow Cards + Assists from Brazilian players in Serie A', () => {
    const rows = built.players
      .filter(p => p.natKey === 'brazil' && p.comps.IT1)
      .map(p => ({ name: p.name, value: p.comps.IT1.yellow + p.comps.IT1.assists }))
    expect(rows).toEqual([{ name: 'Alex Sandro', value: 3 }]) // 2 yellow + 1 assist
  })
})

describe('501 challenge resolver (Stage 60)', () => {
  it('single stat over a whole competition, eligibility 1..179', () => {
    const { players, stats } = resolveChallenge({ competition: 'GB1', filter: null, stat: 'goals' }, built.players)
    // Silva 2, Saka 2, Mover 3 eligible; Journeyman (0 PL goals) excluded
    expect(Object.values(players).map(p => p.name).sort()).toEqual(['Bukayo Saka', 'David Silva', 'Fixture Mover'])
    expect(stats.eligible).toBe(3)
    expect(players['99999']).toBeUndefined() // value 0 → not a valid answer
  })

  it('club filter reads the per-club sub-record', () => {
    const { players } = resolveChallenge({ competition: 'GB1', filter: { club: '11' }, stat: { a: 'goals', op: '+', b: 'assists' } }, built.players)
    expect(players['433177'].value).toBe(3) // Saka @ Arsenal: 2 + 1
    expect(players['74228'].value).toBe(3)  // Fixture Mover @ Arsenal: 2 + 1
    expect(players['99999']).toBeUndefined() // Journeyman @ Arsenal: 0
  })

  it('nationality filter + subtraction (with breakdown)', () => {
    const { players } = resolveChallenge({ competition: 'GB1', filter: { nationality: 'spain' }, stat: { a: 'apps', op: '-', b: 'goals' } }, built.players)
    expect(Object.values(players)).toEqual([{ name: 'David Silva', value: 1, breakdown: { apps: 3, goals: 2 } }])
  })

  it('nationality filter + addition (Serie A)', () => {
    const { players } = resolveChallenge({ competition: 'IT1', filter: { nationality: 'brazil' }, stat: { a: 'yellow', op: '+', b: 'assists' } }, built.players)
    expect(players['221097'].value).toBe(3) // Alex Sandro: 2 yellow + 1 assist
  })
})

describe('501 data engine — emit', () => {
  it('writes all four generated files + meta as valid JSON', () => {
    for (const f of Object.values(built._out)) expect(existsSync(f)).toBe(true)
    const data = JSON.parse(readFileSync(built._out.data, 'utf8'))
    expect(data.players.length).toBe(5)
    expect(data.meta.counts.appearancesScanned).toBe(11)
    expect(data.meta.counts.appearancesKept).toBe(10) // one Championship row excluded
    const idx = JSON.parse(readFileSync(built._out.players, 'utf8'))
    expect(idx.byId['28003'].nat).toBe('Spain')
  })
})
