#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// BUILD THE CURATED 501 DAILY POOL
//
// Emits src/data/football501/daily.curated.generated.json — the ordered list of
// catalog spec ids used for the daily 501 question, drawn from the hand-curated
// "playable only" set (501_updated_questions.txt): every question has 25+
// checkout routes to 501 using recognisable players.
//
// Ordering: a club-cooldown schedule grouped by CLUB NAME (so a club's league
// AND Champions League questions count as the same club), guaranteeing the same
// team never returns within GAP days.
//
// Run:  node scripts/build-501-daily.mjs
// ─────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'node:fs'

const GAP = 5 // min other questions between two of the same club → returns on day 6+

const cat = JSON.parse(readFileSync('src/data/football501/catalog.generated.json', 'utf8')).catalog
const byId = new Map(cat.map(e => [e.id, e]))
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

// club (name, comp) -> catalog club id, via the catalog's own club-only titles.
const nameToId = {}
for (const e of cat) {
  const f = e.filter || {}
  if (f.club && !f.position && !f.nationality) {
    const nm = e.title.split(' · ').pop().replace(/ players$/, '')
    ;(nameToId[e.comp] ||= []).push({ norm: norm(nm), id: f.club })
  }
}
function clubId(name, comp) {
  const q = norm(name).split(' ').filter(Boolean), qset = new Set(q)
  let best = null, be = 1e9
  for (const c of nameToId[comp] || []) {
    const t = c.norm.split(' ').filter(Boolean), ts = new Set(t)
    if (!(q.every(x => ts.has(x)) || t.every(x => qset.has(x)))) continue
    const ex = Math.abs(t.length - q.length); if (ex < be) { be = ex; best = c }
  }
  return best ? best.id : null
}

const COMP = { 'Premier League': 'GB1', 'La Liga': 'ES1', 'Serie A': 'IT1', 'Ligue 1': 'FR1', 'Bundesliga': 'L1', 'Champions League': 'CL' }
const STAT = { Goals: 'goals', Appearances: 'apps', 'Appearances + Goals': 'apps-plus-goals', 'Appearances − Goals': 'apps-minus-goals' }
const NAT = { English: 'england', Spanish: 'spain', German: 'germany', French: 'france', Italian: 'italy' }
const POS = { goalkeepers: 'GK', defenders: 'DEF', midfielders: 'MID', forwards: 'FWD' }

// The curated question set (mirrors 501_updated_questions.txt).
const stats = ['Goals', 'Appearances', 'Appearances + Goals', 'Appearances − Goals']
const defMid = ['Appearances', 'Appearances + Goals', 'Appearances − Goals']
const posStats = { goalkeepers: ['Appearances'], defenders: defMid, midfielders: defMid, forwards: stats }
const positions = ['goalkeepers', 'defenders', 'midfielders', 'forwards']
const partA = [['Manchester City', 'Premier League', 'English'], ['Manchester United', 'Premier League', 'English'], ['Chelsea', 'Premier League', 'English'], ['Arsenal', 'Premier League', 'English'], ['Tottenham Hotspur', 'Premier League', 'English'], ['Liverpool', 'Premier League', 'English'], ['Barcelona', 'La Liga', 'Spanish'], ['Real Madrid', 'La Liga', 'Spanish'], ['Atlético Madrid', 'La Liga', 'Spanish'], ['Bayern Munich', 'Bundesliga', 'German'], ['Borussia Dortmund', 'Bundesliga', 'German'], ['Paris Saint-Germain', 'Ligue 1', 'French'], ['Juventus', 'Serie A', 'Italian'], ['AC Milan', 'Serie A', 'Italian'], ['Inter Milan', 'Serie A', 'Italian']]
const partB = [['Everton', 'Premier League'], ['Aston Villa', 'Premier League'], ['West Ham United', 'Premier League'], ['Newcastle United', 'Premier League'], ['Crystal Palace', 'Premier League'], ['Leicester City', 'Premier League'], ['AS Monaco', 'Ligue 1'], ['Olympique Marseille', 'Ligue 1'], ['Olympique Lyon', 'Ligue 1'], ['Sevilla', 'La Liga'], ['Athletic Bilbao', 'La Liga'], ['Lazio', 'Serie A'], ['Napoli', 'Serie A'], ['Wolfsburg', 'Bundesliga'], ['RB Leipzig', 'Bundesliga'], ['Schalke 04', 'Bundesliga'], ['Roma', 'Serie A'], ['Bayer Leverkusen', 'Bundesliga']]
const clPos = ['defenders', 'midfielders', 'forwards']
const partCA = ['Real Madrid', 'Barcelona', 'Bayern Munich', 'Liverpool', 'Manchester City', 'Manchester United', 'Chelsea', 'Juventus', 'AC Milan', 'Inter Milan']
const partCB = ['Arsenal', 'Tottenham Hotspur', 'Borussia Dortmund', 'Napoli', 'Ajax', 'Paris Saint-Germain', 'Atlético Madrid']

// Resolve a question → its catalog entry, only if DOABLE (25+ recognisable routes).
function entryFor(comp, statLabel, club, { pos, nat } = {}) {
  const cid = clubId(club, COMP[comp]); if (!cid) return null
  let id = `${COMP[comp]}__${STAT[statLabel]}__c${cid}`
  if (nat) id += `__n-${NAT[nat]}`
  if (pos) id += `__${POS[pos]}`
  const e = byId.get(id)
  return e && (e.recoCk ?? 0) >= 25 ? e : null
}

// Collect (id, club) for every doable curated question.
const questions = []
const take = (comp, s, club, o = {}) => { const e = entryFor(comp, s, club, o); if (e) questions.push({ id: e.id, club }) }
for (const [club, league, nat] of partA) { for (const p of positions) for (const s of posStats[p]) take(league, s, club, { pos: p }); for (const s of stats) take(league, s, club, { nat }) }
for (const [club, league] of partB) for (const s of stats) take(league, s, club, {})
for (const club of partCA) { for (const s of stats) take('Champions League', s, club, {}); for (const p of clPos) for (const s of posStats[p]) take('Champions League', s, club, { pos: p }) }
for (const club of partCB) for (const s of stats) take('Champions League', s, club, {})

// ── club-cooldown scheduler (greedy: most-remaining club not in cooldown) ────
function schedule(qs, gap) {
  const byClub = new Map()
  for (const q of qs) { if (!byClub.has(q.club)) byClub.set(q.club, []); byClub.get(q.club).push(q.id) }
  const rem = [...byClub.entries()].map(([club, ids]) => ({ club, ids }))
  const out = []; const recent = []
  while (out.length < qs.length) {
    let cands = rem.filter(r => r.ids.length && !recent.includes(r.club))
    if (!cands.length) cands = rem.filter(r => r.ids.length) // degrade gracefully
    cands.sort((a, b) => b.ids.length - a.ids.length || a.club.localeCompare(b.club))
    const pick = cands[0]
    out.push({ id: pick.ids.shift(), club: pick.club })
    recent.push(pick.club); if (recent.length > gap) recent.shift()
  }
  return out
}
const seq = schedule(questions, GAP)

// ── verify the achieved minimum club gap (linear AND circular/wrap) ──────────
function minGap(order) {
  const last = new Map(); let min = Infinity
  const N = order.length
  // two full passes so wrap-around gaps are measured
  for (let i = 0; i < 2 * N; i++) {
    const club = order[i % N].club
    if (last.has(club)) min = Math.min(min, i - last.get(club))
    last.set(club, i)
  }
  return min
}
const achieved = minGap(seq)

const outObj = {
  meta: { builtAt: new Date().toISOString().slice(0, 10), count: seq.length, clubGap: GAP, achievedMinGap: achieved },
  sequence: seq.map(q => q.id),
}
writeFileSync('src/data/football501/daily.curated.generated.json', JSON.stringify(outObj) + '\n')

const clubCounts = {}
for (const q of questions) clubCounts[q.club] = (clubCounts[q.club] || 0) + 1
const maxClub = Object.entries(clubCounts).sort((a, b) => b[1] - a[1])[0]
process.stderr.write(`daily-501: ${seq.length} questions, ${Object.keys(clubCounts).length} clubs; ` +
  `min club gap = ${achieved} (target ${GAP + 1}+); busiest club ${maxClub[0]} (${maxClub[1]})\n`)
