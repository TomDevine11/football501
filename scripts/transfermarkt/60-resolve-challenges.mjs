// STAGE 60 — RESOLVE CHALLENGES.
// Turns the declarative challenge definitions (challenges.js) into compact,
// game-ready rosters (questionCache.generated.json) by querying the built fact
// table (football501.generated.json). This is what keeps the 7 MB fact table
// out of the browser — the game ships only these per-challenge rosters, in the
// same "pure lookup" shape five01.js already uses.
//
// Eligibility (the darts rule): a player is a valid answer iff their computed
// value is in [ELIGIBLE_MIN, ELIGIBLE_MAX) — a legal single deduction (1..179).

import { readFileSync, writeFileSync } from 'node:fs'
import { OUT, ELIGIBLE_MIN, ELIGIBLE_MAX, MIN_ELIGIBLE_WARN } from './config.mjs'
import { CHALLENGES } from '../../src/data/football501/challenges.js'
import { log } from './lib/log.mjs'

const num = (v) => (Number.isFinite(v) ? v : 0)

const NICE = { apps: 'appearances', goals: 'goals', assists: 'assists', yellow: 'yellow cards', red: 'red cards', minutes: 'minutes' }

export function evalStat(rec, stat) {
  if (typeof stat === 'string') return num(rec[stat])
  const a = num(rec[stat.a]), b = num(rec[stat.b])
  return stat.op === '-' ? a - b : a + b
}
export function statLabel(stat) {
  if (typeof stat === 'string') return NICE[stat] || stat
  return `${NICE[stat.a] || stat.a} ${stat.op} ${NICE[stat.b] || stat.b}`
}
function breakdownOf(rec, stat) {
  if (typeof stat === 'string') return { [stat]: num(rec[stat]) }
  return { [stat.a]: num(rec[stat.a]), [stat.b]: num(rec[stat.b]) }
}

// Pick the stat record a challenge's filter applies to (competition totals, or
// a club sub-record), or null if the player doesn't match the filter.
function recordFor(player, ch) {
  const comp = player.comps[ch.competition]
  if (!comp) return null
  if (!ch.filter) return comp
  if (ch.filter.nationality) return player.natKey === ch.filter.nationality ? comp : null
  if (ch.filter.club) return comp.clubs[ch.filter.club] || null
  return comp
}

// Resolve one challenge → { players, stats }. Pure; unit-testable.
export function resolveChallenge(ch, factPlayers) {
  const players = {}
  const values = []
  for (const p of factPlayers) {
    const rec = recordFor(p, ch)
    if (!rec) continue
    const value = evalStat(rec, ch.stat)
    if (value < ELIGIBLE_MIN || value >= ELIGIBLE_MAX) continue // 1..179 only
    players[p.id] = { name: p.name, value, breakdown: breakdownOf(rec, ch.stat) }
    values.push(value)
  }
  values.sort((a, b) => a - b)
  const stats = {
    eligible: values.length,
    min: values[0] ?? null,
    max: values[values.length - 1] ?? null,
    median: values.length ? values[values.length >> 1] : null,
    checkoutBand: values.filter(v => v <= 40).length, // low values that finish a leg
  }
  return { players, stats }
}

export function resolveChallenges(factPlayers, challenges = CHALLENGES) {
  log.stage('60', 'resolve challenges → rosters')
  const seen = new Set()
  const out = {}
  for (const ch of challenges) {
    if (seen.has(ch.id)) throw new Error(`duplicate challenge id: ${ch.id}`)
    seen.add(ch.id)
    const { players, stats } = resolveChallenge(ch, factPlayers)
    if (stats.eligible === 0) throw new Error(`challenge "${ch.id}" resolved to 0 eligible answers — check competition/filter/stat.`)
    if (stats.eligible < MIN_ELIGIBLE_WARN) log.warn(`${ch.id}: only ${stats.eligible} eligible answers (min≈${MIN_ELIGIBLE_WARN}) — may be thin`)
    out[ch.id] = {
      competition: ch.competition, filter: ch.filter ?? null, group: ch.group ?? '',
      stat: ch.stat, statLabel: statLabel(ch.stat), title: ch.title, hint: ch.hint ?? '',
      stats, players,
    }
    log.info(`${ch.id.padEnd(28)} ${String(stats.eligible).padStart(4)} answers · ${statLabel(ch.stat)} · range ${stats.min}–${stats.max} · ≤40: ${stats.checkoutBand}`)
  }
  log.ok(`${challenges.length} challenges resolved`)
  return out
}

// Standalone: re-resolve from the already-built fact table (fast; no CSVs).
export function resolveFromDisk() {
  const fact = JSON.parse(readFileSync(OUT.data, 'utf8'))
  const challenges = resolveChallenges(fact.players)
  const payload = { meta: { builtFrom: 'football501.generated.json', builtAt: new Date().toISOString().slice(0, 10) }, challenges }
  writeFileSync(OUT.questionCache, JSON.stringify(payload, null, 1) + '\n')
  log.ok(`wrote ${OUT.questionCache}`)
  return payload
}

if (import.meta.url === `file://${process.argv[1]}`) {
  resolveFromDisk()
}
