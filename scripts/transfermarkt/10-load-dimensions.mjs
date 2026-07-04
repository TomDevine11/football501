// STAGE 10 — LOAD DIMENSIONS. The small tables (players, clubs, competitions)
// fit comfortably in memory, so we load them fully into id→record maps that
// later stages join against. appearances is deliberately NOT loaded here.

import { CSV, NATIONALITY_FIELD } from './config.mjs'
import { readRows } from './lib/csv.mjs'
import { log } from './lib/log.mjs'

export async function loadDimensions(csv = CSV, natField = NATIONALITY_FIELD) {
  log.stage('10', 'load dimension tables')

  const players = new Map()
  for await (const r of readRows(csv.players)) {
    players.set(r.player_id, {
      name: r.name,
      nat:  r[natField] || '',
      pos:  r.position || '',
      dob:  r.date_of_birth || '',
    })
  }
  log.info(`players: ${players.size.toLocaleString()}`)

  const clubs = new Map()
  for await (const r of readRows(csv.clubs)) {
    clubs.set(r.club_id, { name: r.name, domesticCompId: r.domestic_competition_id || '' })
  }
  log.info(`clubs: ${clubs.size.toLocaleString()}`)

  const competitions = new Map()
  for await (const r of readRows(csv.competitions)) {
    competitions.set(r.competition_id, { name: r.name, type: r.type || '', country: r.country_name || '' })
  }
  log.info(`competitions: ${competitions.size.toLocaleString()}`)

  log.ok('dimensions loaded')
  return { players, clubs, competitions }
}
