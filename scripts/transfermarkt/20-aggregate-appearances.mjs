// STAGE 20 — AGGREGATE APPEARANCES (the reducer; the heavy lifting).
// Streams the ~1.5–2M-row appearances.csv, keeps only allow-listed
// competitions, and sums the six measures grouped by
// (player_id, competition_id, player_club_id). Output is small (tens of
// thousands of groups) and is the finest grain the game needs.

import { CSV, COMPETITION_IDS } from './config.mjs'
import { readRows } from './lib/csv.mjs'
import { log } from './lib/log.mjs'

const num = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : 0 }

export async function aggregateAppearances(csv = CSV, compIds = COMPETITION_IDS) {
  log.stage('20', 'aggregate appearances (streaming)')

  const agg = new Map()   // `${pid}|${comp}|${club}` -> running sums
  const names = new Map() // pid -> player_name (fallback label if not in players.csv)
  let scanned = 0, kept = 0

  for await (const r of readRows(csv.appearances)) {
    scanned++
    const comp = r.competition_id
    if (!compIds.has(comp)) continue
    kept++

    const pid = r.player_id, club = r.player_club_id
    if (r.player_name && !names.has(pid)) names.set(pid, r.player_name)

    const key = `${pid}|${comp}|${club}`
    let a = agg.get(key)
    if (!a) { a = { pid, comp, club, apps: 0, goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0 }; agg.set(key, a) }
    a.apps    += 1
    a.goals   += num(r.goals)
    a.assists += num(r.assists)
    a.yellow  += num(r.yellow_cards)
    a.red     += num(r.red_cards)
    a.minutes += num(r.minutes_played)

    if (scanned % 250000 === 0) log.info(`…scanned ${scanned.toLocaleString()}, kept ${kept.toLocaleString()}`)
  }

  log.ok(`scanned ${scanned.toLocaleString()}, kept ${kept.toLocaleString()}, ${agg.size.toLocaleString()} groups`)
  return { agg, names, stats: { scanned, kept, groups: agg.size } }
}
