// STAGE 30 — ENRICH + NORMALISE (pure; no I/O).
// Turns anonymous aggregate rows into labelled, normalised player records:
// joins the dimension maps for names/nationality/position/club/competition
// labels, normalises names (game normaliser) and countries, rolls per-club
// rows up into per-(player, competition) totals WHILE retaining the per-club
// breakdown (needed for club filters), and builds the lookup indices.

import { COMPETITION_IDS, COMPETITION_LABELS, MIN_APPEARANCES } from './config.mjs'
import { normalize, surnameKeys, normalizeCountry } from './lib/normalize.mjs'
import { log } from './lib/log.mjs'

const blankComp = () => ({ apps: 0, goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0, clubs: {} })
const blankClub = () => ({ apps: 0, goals: 0, assists: 0, yellow: 0, red: 0, minutes: 0 })
const addInto = (t, a) => { t.apps += a.apps; t.goals += a.goals; t.assists += a.assists; t.yellow += a.yellow; t.red += a.red; t.minutes += a.minutes }

export function enrichNormalize({ agg, names, dims }, opts = {}) {
  const compIds    = opts.compIds    ?? COMPETITION_IDS
  const compLabels = opts.compLabels ?? COMPETITION_LABELS
  const minApps    = opts.minApps    ?? MIN_APPEARANCES
  log.stage('30', 'enrich + normalise')

  const players = new Map() // pid -> { id, name, nat, natKey, pos, comps }
  const clubIds = new Set()
  let unmatchedPlayers = 0

  for (const a of agg.values()) {
    let p = players.get(a.pid)
    if (!p) {
      const dim = dims.players.get(a.pid)
      if (!dim) unmatchedPlayers++
      const country = normalizeCountry(dim?.nat || '')
      p = { id: a.pid, name: dim?.name || names.get(a.pid) || `#${a.pid}`, nat: country.display, natKey: country.key, pos: dim?.pos || '', comps: {} }
      players.set(a.pid, p)
    }
    const comp = (p.comps[a.comp] ||= blankComp())
    addInto(comp, a)
    const club = (comp.clubs[a.club] ||= blankClub())
    addInto(club, a)
    clubIds.add(a.club)
  }

  // KEEP-ALL policy: only drop players below the appearance floor (default 1,
  // i.e. nothing dropped). Never a top-N cut — obscure answers stay eligible.
  let dropped = 0
  for (const [pid, p] of players) {
    const totalApps = Object.values(p.comps).reduce((s, c) => s + c.apps, 0)
    if (totalApps < minApps) { players.delete(pid); dropped++ }
  }

  // ── Indices ──────────────────────────────────────────────────────
  const playersById = {}
  const byNorm = {}
  const addNorm = (key, id) => { if (!key) return; (byNorm[key] ||= []).push(id) }
  for (const p of players.values()) {
    playersById[p.id] = { name: p.name, nat: p.nat, pos: p.pos, dob: dims.players.get(p.id)?.dob || '' }
    addNorm(normalize(p.name), p.id)
    for (const k of surnameKeys(p.name)) addNorm(k, p.id)
  }
  for (const k of Object.keys(byNorm)) byNorm[k] = [...new Set(byNorm[k])]

  const clubsIndex = {}
  for (const cid of clubIds) {
    const c = dims.clubs.get(cid)
    clubsIndex[cid] = { name: c?.name || `#${cid}`, norm: normalize(c?.name || ''), competitionId: c?.domesticCompId || '' }
  }

  const competitionsIndex = {}
  for (const cid of compIds) {
    const c = dims.competitions.get(cid)
    competitionsIndex[cid] = { name: compLabels[cid] || c?.name || cid, type: c?.type || '', country: c?.country || '' }
  }

  log.info(`players kept: ${players.size.toLocaleString()} · clubs: ${clubIds.size} · dropped below floor: ${dropped} · not in players.csv: ${unmatchedPlayers}`)
  log.ok('enriched')
  return {
    players: [...players.values()],
    playersById, byNorm, clubsIndex, competitionsIndex,
    stats: { kept: players.size, clubs: clubIds.size, dropped, unmatchedPlayers },
  }
}
