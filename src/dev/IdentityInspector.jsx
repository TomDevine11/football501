// ─────────────────────────────────────────────────────────────────────────
// IDENTITY INSPECTOR  (dev-only — Phase 0 validation surface)
//
// A standalone route (/dev/identity) for eyeballing the new player-identity
// foundation in the browser BEFORE any game is migrated. It is deliberately
// inert: it reads ONLY the generated artifacts (players.registry.json +
// players.crosswalk.json) and the shared normaliser. It imports no game code,
// no facts.js, no resolve.js, and is not linked from the hub.
//
// This mirrors how Phase 3 search will resolve typed text → a player id, so it
// doubles as a preview of the eventual autocomplete behaviour.
// ─────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'
import registry from '../data/canonical/players.registry.json'
import crosswalk from '../data/canonical/players.crosswalk.json'
import { normalize } from '../data/canonical/normalize.js'

const byId = new Map(registry.map(r => [r.id, r]))

// Search index (built once): every record with its searchable strings.
const searchIndex = registry.map(r => ({
  rec: r,
  norm: normalize(r.displayName),
  aliasNorms: (r.aliases || []).map(normalize),
}))

function fuzzyKey(name) {
  const p = normalize(name).split(' ').filter(Boolean)
  return `${p[p.length - 1] || ''}|${(p[0] || '').slice(0, 3)}`
}

// ── exact resolution (byAlias) — the Phase-3 contract ────────────────────────
function resolveExact(query) {
  const n = normalize(query)
  if (!n) return null
  const hit = crosswalk.byAlias[n]
  if (hit === undefined) return { status: 'unknown', query: n }
  const ids = Array.isArray(hit) ? hit : [hit]
  return { status: ids.length > 1 ? 'ambiguous' : 'ok', query: n, ids }
}

// ── live substring search (preview of autocomplete) ──────────────────────────
function search(query, limit = 30) {
  const q = normalize(query)
  if (q.length < 2) return []
  const hits = []
  for (const e of searchIndex) {
    const inName = e.norm.includes(q)
    const inAlias = !inName && e.aliasNorms.some(a => a.includes(q))
    if (!inName && !inAlias) continue
    let rank
    if (e.norm === q) rank = 0
    else if (e.norm.startsWith(q)) rank = 1
    else if (e.norm.split(' ').some(w => w.startsWith(q))) rank = 2
    else if (inName) rank = 3
    else rank = 4
    hits.push({ rec: e.rec, rank })
  }
  hits.sort((a, b) => a.rank - b.rank || (b.rec.fame || 0) - (a.rec.fame || 0) || a.rec.displayName.localeCompare(b.rec.displayName))
  return hits.slice(0, limit).map(h => h.rec)
}

// ── derived stats (computed client-side from the artifacts) ──────────────────
const stats = (() => {
  const total = registry.length
  const withTm = registry.filter(r => r.refs?.tm != null).length
  const withQid = registry.filter(r => r.refs?.qid != null).length
  const noExt = registry.filter(r => r.refs?.tm == null && r.refs?.qid == null).length
  const curated = registry.filter(r => r.curated).length
  const flagged = registry.filter(r => r.reviewFlags?.length).length
  const ambiguousTokens = Object.entries(crosswalk.byAlias).filter(([, v]) => Array.isArray(v)).map(([k]) => k)
  const byFuzzy = new Map()
  for (const r of registry) { const f = fuzzyKey(r.displayName); (byFuzzy.get(f) || byFuzzy.set(f, []).get(f)).push(r.id) }
  const dupGroups = [...byFuzzy.values()].filter(ids => ids.length > 1).map(ids => ids.map(i => byId.get(i))).sort((a, b) => a[0].displayName.localeCompare(b[0].displayName))
  return { total, withTm, withQid, noExt, curated, flagged, ambiguousTokens, dupGroups }
})()

// ── tiny presentational atoms ────────────────────────────────────────────────
const Pill = ({ tone = 'muted', children }) => {
  const tones = {
    ok: 'bg-success/15 text-success-bright border-success/30',
    warn: 'bg-warn/15 text-warn border-warn/30',
    bad: 'bg-danger/15 text-danger-bright border-danger/30',
    brand: 'bg-brand-tint text-brand-bright border-brand/30',
    muted: 'bg-surface text-muted border-border',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${tones[tone]}`}>{children}</span>
}

const Mono = ({ children }) => <span className="font-mono text-[0.8rem]">{children}</span>

function IdentityCard({ rec }) {
  if (!rec) return null
  return (
    <div className="rounded-xl border border-border-strong bg-card p-4 shadow-float">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-title-lg font-display text-primary">{rec.displayName}</div>
        <Mono><span className="text-brand-bright">{rec.id}</span></Mono>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {rec.curated && <Pill tone="brand">curated</Pill>}
        <Pill tone={rec.refs?.tm ? 'ok' : 'muted'}>tm {rec.refs?.tm ?? '—'}</Pill>
        <Pill tone={rec.refs?.qid ? 'ok' : 'muted'}>qid {rec.refs?.qid ?? '—'}</Pill>
        <Pill tone="muted">fame {rec.fame ?? 0}</Pill>
        {(rec.ambiguousTokens || []).map(t => <Pill key={t} tone="warn">ambiguous: {t}</Pill>)}
        {(rec.reviewFlags || []).map(f => <Pill key={f} tone="bad">{f}</Pill>)}
      </div>
      <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-caption">
        <dt className="text-faint uppercase tracking-wider">Nationalities</dt><dd className="text-secondary">{(rec.nationalities || []).join(', ') || '—'}</dd>
        <dt className="text-faint uppercase tracking-wider">Positions</dt><dd className="text-secondary">{(rec.positions || []).join(', ') || '—'}</dd>
        <dt className="text-faint uppercase tracking-wider">Aliases</dt><dd className="text-secondary">{(rec.aliases || []).join('  ·  ')}</dd>
      </dl>
    </div>
  )
}

// ── panels ───────────────────────────────────────────────────────────────────
function Lookup() {
  const [q, setQ] = useState('')
  const results = useMemo(() => search(q), [q])
  const exact = useMemo(() => resolveExact(q), [q])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Type a player name (try: ronaldo, zlatan, fred, silva)…"
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-body-lg text-primary placeholder:text-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
        {/* Exact resolution — the Phase-3 contract */}
        {q.trim().length >= 2 && exact && (
          <div className="mt-3 rounded-lg border border-border bg-surface/60 p-3 text-caption">
            <div className="flex items-center gap-2">
              <span className="text-faint uppercase tracking-wider">byAlias[<Mono>{exact.query}</Mono>]</span>
              {exact.status === 'ok' && <Pill tone="ok">resolves → 1</Pill>}
              {exact.status === 'ambiguous' && <Pill tone="warn">ambiguous → {exact.ids.length}</Pill>}
              {exact.status === 'unknown' && <Pill tone="bad">not in registry</Pill>}
            </div>
          </div>
        )}
        <div className="mt-3 flex flex-col gap-1">
          {results.map(r => (
            <button key={r.id} onClick={() => setQ(r.displayName)} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left hover:border-brand/50">
              <span className="text-body text-primary">{r.displayName}</span>
              <Mono><span className="text-faint">{r.id}</span></Mono>
            </button>
          ))}
          {q.trim().length >= 2 && results.length === 0 && <div className="px-1 py-2 text-caption text-faint">No matches in the registry.</div>}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {exact?.status !== 'unknown' && exact?.ids?.map(id => <IdentityCard key={id} rec={byId.get(id)} />)}
        {(!exact || exact.status === 'unknown') && <div className="rounded-xl border border-dashed border-border p-6 text-center text-caption text-faint">Exact resolution appears here. Ambiguous names (e.g. “ronaldo”) show every candidate identity.</div>}
      </div>
    </div>
  )
}

function Duplicates() {
  return (
    <div className="grid gap-2">
      <p className="text-caption text-muted">{stats.dupGroups.length} fuzzy look-alike group(s), kept as <span className="text-primary font-semibold">distinct</span> identities. A human confirms which (if any) are truly the same person — false-positive merges are worse than duplicates.</p>
      {stats.dupGroups.map((group, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          {group.map((r, j) => (
            <span key={r.id} className="flex items-center gap-2">
              {j > 0 && <span className="text-danger-bright font-bold">≠</span>}
              <span className="text-body text-primary">{r.displayName}</span>
              <Mono><span className="text-faint">{r.id}</span></Mono>
              {r.refs?.tm && <Pill tone="ok">tm {r.refs.tm}</Pill>}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

const StatCard = ({ label, value, sub, tone }) => (
  <div className="rounded-xl border border-border-strong bg-card p-4">
    <div className="text-overline-sm uppercase tracking-widest text-faint">{label}</div>
    <div className={`mt-1 text-display-sm font-display ${tone || 'text-primary'}`}>{value}</div>
    {sub && <div className="text-caption text-muted">{sub}</div>}
  </div>
)

function Coverage() {
  const pct = n => stats.total ? `${(100 * n / stats.total).toFixed(1)}%` : '0%'
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Canonical identities" value={stats.total} sub={`${stats.curated} curated`} />
      <StatCard label="Transfermarkt ref" value={pct(stats.withTm)} sub={`${stats.withTm} players`} tone="text-success-bright" />
      <StatCard label="Wikidata QID" value={pct(stats.withQid)} sub="0 by design — Phase 3" tone="text-faint" />
      <StatCard label="No external ref" value={pct(stats.noExt)} sub={`${stats.noExt} players`} tone="text-warn" />
      <StatCard label="Ambiguous tokens" value={stats.ambiguousTokens.length} sub={stats.ambiguousTokens.join(', ') || '—'} />
      <StatCard label="Flagged for review" value={stats.flagged} sub="possible namesakes" tone="text-danger-bright" />
    </div>
  )
}

const TABS = [
  { id: 'lookup', label: 'Lookup', el: <Lookup /> },
  { id: 'duplicates', label: `Duplicate candidates (${stats.dupGroups.length})`, el: <Duplicates /> },
  { id: 'coverage', label: 'Coverage', el: <Coverage /> },
]

export default function IdentityInspector() {
  const [tab, setTab] = useState('lookup')
  return (
    <main className="min-h-screen bg-canvas px-4 py-8 text-primary">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <div className="text-overline uppercase tracking-widest text-brand-bright">Dev · Phase 0</div>
          <h1 className="text-display-sm font-display text-primary">Player Identity Inspector</h1>
          <p className="mt-1 text-caption text-muted">Reads only <Mono>players.registry.json</Mono> + <Mono>players.crosswalk.json</Mono>. No game code, no live search, no validation — a preview of the identity layer before migration.</p>
        </header>
        <nav className="mb-5 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full border px-3 py-1.5 text-caption font-semibold transition ${tab === t.id ? 'border-brand bg-brand-tint text-brand-bright' : 'border-border bg-surface text-muted hover:text-primary'}`}>{t.label}</button>
          ))}
        </nav>
        {TABS.find(t => t.id === tab)?.el}
      </div>
    </main>
  )
}
