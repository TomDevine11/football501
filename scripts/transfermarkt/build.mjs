#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 DATA ENGINE — ORCHESTRATOR
//
// Converts the raw Kaggle Transfermarkt CSVs (data/transfermarkt/, input-only)
// into the JSON the game consumes (src/data/football501/). Rerun whenever a
// fresh Kaggle export is downloaded:
//
//   node scripts/transfermarkt/build.mjs
//
// Stages run in order; each is a standalone module (importable/testable on its
// own). Data passes in-process — no intermediate files to manage.
// ─────────────────────────────────────────────────────────────────────────

import { verify } from './00-verify.mjs'
import { loadDimensions } from './10-load-dimensions.mjs'
import { aggregateAppearances } from './20-aggregate-appearances.mjs'
import { enrichNormalize } from './30-enrich-normalize.mjs'
import { emit } from './40-emit.mjs'
import { log } from './lib/log.mjs'

export async function build() {
  await verify()
  const dims = await loadDimensions()
  const { agg, names, stats } = await aggregateAppearances()
  const built = enrichNormalize({ agg, names, dims })
  const meta = emit(built, stats)
  log.done(`Football 501 data engine complete — ${meta.counts.players.toLocaleString()} players across ${meta.counts.competitions} competitions.`)
  return meta
}

// Run when invoked directly (not when imported by a test).
if (import.meta.url === `file://${process.argv[1]}`) {
  build().catch(err => { console.error(`\n✗ build failed: ${err.message}`); process.exit(1) })
}
