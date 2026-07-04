// STAGE 40 — EMIT. Serialises the generated JSON the game consumes. Sorts
// everything deterministically (numeric-aware) so rebuilds produce clean git
// diffs. Keeps ALL players — no top-N truncation.

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { OUT, OUT_DIR, RAW_DIR, COMPETITIONS, MIN_APPEARANCES } from './config.mjs'
import { log } from './lib/log.mjs'

const writeJson = (file, obj) => writeFileSync(file, JSON.stringify(obj, null, 1) + '\n')
const byIdNumeric = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })

// Rebuild an object with numeric-aware sorted keys (stable diffs).
const sortedKeys = (obj, mapVal = (v) => v) => {
  const out = {}
  for (const k of Object.keys(obj).sort(byIdNumeric)) out[k] = mapVal(obj[k])
  return out
}

export function emit(built, runStats = {}, targets = {}) {
  const out    = targets.out    ?? OUT
  const outDir = targets.outDir ?? OUT_DIR
  const rawDir = targets.rawDir ?? RAW_DIR
  log.stage('40', 'emit generated JSON')
  mkdirSync(outDir, { recursive: true })

  // Optional export provenance note (data/transfermarkt/EXPORT.txt).
  let exportNote = ''
  const expFile = path.join(rawDir, 'EXPORT.txt')
  if (existsSync(expFile)) exportNote = readFileSync(expFile, 'utf8').trim()

  // Deterministic player ordering + sorted comp/club keys inside each player.
  const players = [...built.players].sort((a, b) => byIdNumeric(a.id, b.id)).map(p => ({
    id: p.id, name: p.name, nat: p.nat, natKey: p.natKey, pos: p.pos,
    comps: sortedKeys(p.comps, (comp) => ({ ...comp, clubs: sortedKeys(comp.clubs) })),
  }))

  const meta = {
    source: 'kaggle:davidcariboo/player-scores',
    builtAt: new Date().toISOString().slice(0, 10),
    export: exportNote,
    competitions: COMPETITIONS,
    minAppearances: MIN_APPEARANCES,
    counts: {
      players: players.length,
      clubs: Object.keys(built.clubsIndex).length,
      competitions: Object.keys(built.competitionsIndex).length,
      appearancesScanned: runStats.scanned ?? null,
      appearancesKept: runStats.kept ?? null,
      groups: runStats.groups ?? null,
    },
  }

  writeJson(out.data,         { meta, players })
  writeJson(out.players,      { byId: sortedKeys(built.playersById), byNorm: sortSets(built.byNorm) })
  writeJson(out.clubs,        sortedKeys(built.clubsIndex))
  writeJson(out.competitions, sortedKeys(built.competitionsIndex))
  writeJson(out.meta,         meta)

  log.ok(`wrote ${players.length.toLocaleString()} players + indices → ${outDir}`)
  return meta
}

// Sort byNorm keys, and each id list numerically, for stable diffs.
const sortSets = (byNorm) => {
  const out = {}
  for (const k of Object.keys(byNorm).sort()) out[k] = [...byNorm[k]].sort(byIdNumeric)
  return out
}
