// STAGE 00 — VERIFY. Read-only guard: fail loudly if a raw CSV is missing or a
// Kaggle schema change dropped a column we depend on. Writes nothing.

import { existsSync } from 'node:fs'
import { CSV, REQUIRED_COLUMNS } from './config.mjs'
import { readHeader } from './lib/csv.mjs'
import { log } from './lib/log.mjs'

export async function verify(csv = CSV, required = REQUIRED_COLUMNS) {
  log.stage('00', 'verify raw CSVs')
  for (const [name, file] of Object.entries(csv)) {
    if (!existsSync(file)) {
      throw new Error(`Missing ${name}.csv at ${file}\n    → download the Kaggle export into data/transfermarkt/ (see scripts/transfermarkt/README.md).`)
    }
    const header = await readHeader(file)
    const missing = (required[name] || []).filter(c => !header.includes(c))
    if (missing.length) {
      throw new Error(`${name}.csv is missing required column(s): ${missing.join(', ')}\n    → the Transfermarkt/Kaggle schema may have changed; update config.REQUIRED_COLUMNS and the stages.`)
    }
    log.info(`${name}.csv ✓ (${header.length} columns)`)
  }
  log.ok('all CSVs present with required columns')
}
