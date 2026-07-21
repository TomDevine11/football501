#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// BUILD THE TENABLE DAILY ALLOWLIST  → src/data/tenable.daily.generated.json
//
// Makes tenable-daily-questions.txt the SOURCE OF TRUTH for the daily rotation:
// remove a line from that file, re-run this, and that question stops appearing.
//
// The txt holds question TITLES (one per numbered line). This emits the set of
// allowed titles; tenable.js filters TENABLE_DAILY_QUESTIONS by it (falling back
// to the built-in `daily` flag if the allowlist is ever empty).
//
// Run:  node scripts/build-tenable-daily.mjs
// ─────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const TXT = path.join(ROOT, 'tenable-daily-questions.txt')
const OUT = path.join(ROOT, 'src/data/tenable.daily.generated.json')

// Titles from the editable file (strip the "N. " prefix; ignore comments/blanks).
const titles = readFileSync(TXT, 'utf8').split('\n')
  .map(l => (l.match(/^\s*\d+\.\s+(.+?)\s*$/) || [])[1])
  .filter(Boolean)

// Best-effort validation: warn about titles that don't match any real question.
const known = new Set()
try {
  for (const q of JSON.parse(readFileSync(path.join(ROOT, 'src/data/tenable.generated.json'), 'utf8')).questions) known.add(q.title)
} catch { /* ignore */ }
for (const m of readFileSync(path.join(ROOT, 'src/data/tenable.js'), 'utf8').matchAll(/title:\s*(['"])(.*?)\1/g)) known.add(m[2])
const unmatched = known.size ? titles.filter(t => !known.has(t)) : []

const uniqueTitles = [...new Set(titles)]
writeFileSync(OUT, JSON.stringify({ meta: { builtFrom: 'tenable-daily-questions.txt', count: uniqueTitles.length }, titles: uniqueTitles }) + '\n')

process.stderr.write(`tenable-daily: ${uniqueTitles.length} allowed questions from tenable-daily-questions.txt\n`)
if (unmatched.length) process.stderr.write(`  ⚠ ${unmatched.length} title(s) don't match any question (typo? will be ignored):\n${unmatched.map(t => `    - ${t}`).join('\n')}\n`)
