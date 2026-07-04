// Minimal, consistent stage logging (stderr, so stdout stays pipe-clean).
const t0 = Date.now()
const ms = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`

export const log = {
  stage: (n, title) => console.error(`\n[${n}] ${title}`),
  info:  (m) => console.error(`    ${m}`),
  ok:    (m) => console.error(`  ✓ ${m}  (${ms()})`),
  warn:  (m) => console.error(`  ! ${m}`),
  done:  (m) => console.error(`\n${m}  (${ms()})`),
}
