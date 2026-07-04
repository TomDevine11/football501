// ─────────────────────────────────────────────────────────────────────────
// STREAMING CSV READER (zero-dependency, RFC-4180-aware)
//
// appearances.csv is ~1.5–2M rows / hundreds of MB, so we never load a whole
// file — we stream it row by row. Handles quoted fields, embedded commas and
// newlines, and doubled-quote ("") escapes. State persists across chunk
// boundaries, so large files parse correctly.
// ─────────────────────────────────────────────────────────────────────────

import { createReadStream } from 'node:fs'

// Low-level: yield one array-of-fields per record (header included as row 0).
async function* records(filePath) {
  const stream = createReadStream(filePath, { encoding: 'utf8' })
  let field = ''
  let row = []
  let inQuotes = false
  let afterQuote = false // we just consumed a closing quote — next char decides
  let sawAny = false     // guards against emitting a trailing empty record

  for await (const chunk of stream) {
    for (let i = 0; i < chunk.length; i++) {
      const c = chunk[i]
      sawAny = true
      if (inQuotes) {
        if (c === '"') { inQuotes = false; afterQuote = true }
        else field += c
        continue
      }
      if (c === '"') {
        if (afterQuote) { field += '"'; inQuotes = true; afterQuote = false } // "" → literal quote
        else inQuotes = true                                                  // opening quote
      } else if (c === ',') {
        row.push(field); field = ''; afterQuote = false
      } else if (c === '\n') {
        row.push(field); yield row; row = []; field = ''; afterQuote = false
      } else if (c === '\r') {
        // ignore — handled by the \n
      } else {
        field += c; afterQuote = false
      }
    }
  }
  // Flush a final record with no trailing newline.
  if (sawAny && (field !== '' || row.length)) { row.push(field); yield row }
}

// Public: async generator yielding one object per data row, keyed by header.
export async function* readRows(filePath) {
  let header = null
  for await (const rec of records(filePath)) {
    if (!header) { header = rec; continue }
    const obj = {}
    for (let i = 0; i < header.length; i++) obj[header[i]] = rec[i]
    yield obj
  }
}

// Public: just the header columns (reads only until the first newline).
export async function readHeader(filePath) {
  for await (const rec of records(filePath)) return rec
  return []
}
