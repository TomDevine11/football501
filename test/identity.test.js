import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildIdentity, runIntegrityChecks, slugify, SEED_AMBIGUOUS } from '../scripts/build-identity.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const REGISTRY = path.join(ROOT, 'src/data/canonical/players.registry.json')
const CROSSWALK = path.join(ROOT, 'src/data/canonical/players.crosswalk.json')

// ── pure-core tests (synthetic inputs — fast, deterministic) ────────────────
describe('identity core reconciliation', () => {
  it('running the build twice produces identical ids', () => {
    const sources = [
      { displayName: 'Robert Lewandowski', curated: true },
      { displayName: 'Xabi Alonso', fame: 80 },
      { displayName: 'Heung-min Son' },
    ]
    const first = buildIdentity({ sources, seedAmbiguous: {} })
    const second = buildIdentity({ sources, prior: { registry: first.registry, crosswalk: first.crosswalk }, seedAmbiguous: {} })
    expect(second.registry.map(r => r.id)).toEqual(first.registry.map(r => r.id))
    // and byte-stable serialisation
    expect(JSON.stringify(second.registry)).toEqual(JSON.stringify(first.registry))
  })

  it('existing ids survive a display-name change (matched via external ref)', () => {
    const first = buildIdentity({ sources: [{ displayName: 'Old Spelling', refs: { tm: '999' } }], seedAmbiguous: {} })
    const id = first.registry[0].id
    // next build: same person (same TM ref) but a different display name
    const second = buildIdentity({
      sources: [{ displayName: 'Completely Different Name', refs: { tm: '999' } }],
      prior: { registry: first.registry, crosswalk: first.crosswalk },
      seedAmbiguous: {},
    })
    expect(second.registry).toHaveLength(1)
    expect(second.registry[0].id).toBe(id)                       // id unchanged
    expect(second.registry[0].displayName).toBe('Old Spelling')  // canonical name preserved
    expect(second.registry[0].aliases.map(a => a.toLowerCase())).toContain('completely different name')
  })

  it('ids are NOT regenerated from display names (slug decoupled from stored id)', () => {
    // Two builds where the second renames the player: slug of new name != stored id.
    const first = buildIdentity({ sources: [{ displayName: 'Naldo', refs: { tm: '7' } }], seedAmbiguous: {} })
    const second = buildIdentity({
      sources: [{ displayName: 'Ronaldo Aparecido Rodrigues', refs: { tm: '7' } }],
      prior: { registry: first.registry, crosswalk: first.crosswalk },
      seedAmbiguous: {},
    })
    expect(second.registry[0].id).toBe('naldo')
    expect(slugify('Ronaldo Aparecido Rodrigues')).not.toBe(second.registry[0].id)
  })

  it('different spellings of one name resolve to the same id', () => {
    const { registry, crosswalk } = buildIdentity({
      sources: [{ displayName: 'Zlatan Ibrahimović' }, { displayName: 'Zlatan Ibrahimovic' }],
      seedAmbiguous: {},
    })
    expect(registry).toHaveLength(1)
    const id = registry[0].id
    expect(crosswalk.byAlias['zlatan ibrahimovic']).toBe(id)
  })

  it('ambiguous bare tokens remain ambiguous (never collapse to one player)', () => {
    const { crosswalk } = buildIdentity({
      sources: [{ displayName: 'Cristiano Ronaldo' }, { displayName: 'Ronaldo Nazário' }, { displayName: 'Ronaldo' }],
      seedAmbiguous: { ronaldo: ['Cristiano Ronaldo', 'Ronaldo Nazário'] },
    })
    const target = crosswalk.byAlias['ronaldo']
    expect(Array.isArray(target)).toBe(true)
    expect(target).toHaveLength(2)
  })

  it('default SEED_AMBIGUOUS keeps ronaldo ambiguous', () => {
    expect(SEED_AMBIGUOUS.ronaldo).toBeTruthy()
    const { crosswalk } = buildIdentity({ sources: [{ displayName: 'Cristiano Ronaldo' }] })
    expect(Array.isArray(crosswalk.byAlias['ronaldo'])).toBe(true)
  })

  it('reports fuzzy duplicate candidates instead of merging them', () => {
    const { registry, report } = buildIdentity({
      sources: [{ displayName: 'Ferran Torres' }, { displayName: 'Fernando Torres' }],
      seedAmbiguous: {},
    })
    expect(registry).toHaveLength(2) // NOT merged
    const group = report.duplicateCandidates.find(d => d.names.includes('Ferran Torres') && d.names.includes('Fernando Torres'))
    expect(group).toBeTruthy()
  })

  it('collides slugs get a stable discriminator', () => {
    const { registry } = buildIdentity({
      sources: [
        { displayName: 'Danny Williams', nationalities: ['United States'], refs: { tm: '1' } },
        { displayName: 'Danny Williams', nationalities: ['England'], refs: { tm: '2' } },
      ],
      seedAmbiguous: {},
    })
    // same normalized name but distinct TM refs → two identities, discriminated ids
    const ids = registry.map(r => r.id)
    expect(new Set(ids).size).toBe(2)
    expect(ids).toContain('danny-williams')
  })
})

// ── integrity-check tests ───────────────────────────────────────────────────
describe('identity integrity checks', () => {
  const ok = { meta: {}, byRef: {}, byAlias: {}, retired: {} }

  it('fails on duplicate internal ids', () => {
    const reg = [{ id: 'x', displayName: 'X', refs: {}, aliases: [] }, { id: 'x', displayName: 'Y', refs: {}, aliases: [] }]
    expect(() => runIntegrityChecks(reg, ok)).toThrow(/Duplicate internal id/)
  })

  it('fails when one external id maps to multiple players', () => {
    const reg = [{ id: 'a', displayName: 'A', refs: { tm: '5' }, aliases: [] }, { id: 'b', displayName: 'B', refs: { tm: '5' }, aliases: [] }]
    expect(() => runIntegrityChecks(reg, ok)).toThrow(/maps to multiple players/)
  })

  it('fails when an alias resolves to multiple players without ambiguity metadata', () => {
    const reg = [{ id: 'a', displayName: 'A', refs: {}, aliases: [] }, { id: 'b', displayName: 'B', refs: {}, aliases: [] }]
    const cw = { ...ok, byAlias: { ronaldo: ['a', 'b'] } }
    expect(() => runIntegrityChecks(reg, cw)).toThrow(/no ambiguity metadata/)
  })

  it('passes when the ambiguous alias has metadata', () => {
    const reg = [{ id: 'a', displayName: 'A', refs: {}, aliases: [], ambiguousTokens: ['ronaldo'] }, { id: 'b', displayName: 'B', refs: {}, aliases: [], ambiguousTokens: ['ronaldo'] }]
    const cw = { ...ok, byAlias: { ronaldo: ['a', 'b'] } }
    expect(runIntegrityChecks(reg, cw)).toBe(true)
  })

  it('fails on invalid id format', () => {
    const reg = [{ id: 'Bad_Id', displayName: 'X', refs: {}, aliases: [] }]
    expect(() => runIntegrityChecks(reg, ok)).toThrow(/Invalid id format/)
  })

  it('fails when a dataset references a missing player id', () => {
    const reg = [{ id: 'a', displayName: 'A', refs: {}, aliases: [] }]
    expect(() => runIntegrityChecks(reg, ok, { referencedIds: new Set(['a', 'ghost']) })).toThrow(/missing player id: ghost/)
  })
})

// ── generated-artifact tests (guard the committed files) ────────────────────
describe('generated identity artifacts', () => {
  it('registry + crosswalk exist and pass integrity checks', () => {
    if (!existsSync(REGISTRY) || !existsSync(CROSSWALK)) {
      // Foundation not built yet in this environment; skip rather than fail.
      return
    }
    const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'))
    const crosswalk = JSON.parse(readFileSync(CROSSWALK, 'utf8'))
    expect(registry.length).toBeGreaterThan(1000)
    expect(runIntegrityChecks(registry, crosswalk)).toBe(true)
  })
})
