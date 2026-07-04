// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 — CHALLENGE DEFINITIONS (Premier League, all-time)
//
// Scope (simplified): two stats — Appearances, Goals — and three filters —
// Competition, Club, Nationality. Resolved against the all-time PL fact table
// (history.GB1.generated.json, scraped from Transfermarkt, 1992→present) by
// `npm run build:pl-history`.
//
//   stat:    'goals' | 'apps'   OR   { a, op, b }  (op '+' | '-')
//   filter:  null | { club: '<clubId>' } | { nationality: '<natKey>' }
//
// Add a challenge, rerun the build, done. Other competitions get added later by
// scraping them with the same tooling and swapping the competition id.
// ─────────────────────────────────────────────────────────────────────────

export const CHALLENGES = [
  // ── Whole competition, all-time ───────────────────────────────────
  { id: 'pl-goals', group: 'All-Time', competition: 'GB1', filter: null, stat: 'goals', title: 'Premier League Goals (all-time)', hint: 'The record-breakers bust the board — Shearer (260), Kane (213), Rooney (208) are all over 180. Descend with mid-tier scorers and finish on a low one.' },
  { id: 'pl-apps',  group: 'All-Time', competition: 'GB1', filter: null, stat: 'apps',  title: 'Premier League Appearances (all-time)', hint: 'The iron men bust — Milner (658), Barry (653), Giggs (632). Name shorter-career players to control the countdown.' },
  { id: 'pl-apps-minus-goals', group: 'All-Time', competition: 'GB1', filter: null, stat: { a: 'apps', op: '-', b: 'goals' }, title: 'Appearances − Goals · Premier League', hint: 'Long-serving defenders and keepers rack up huge values (Milner 602) — attackers keep it low for the checkout.' },

  // ── Club legends (all-time PL goals for one club) ─────────────────
  { id: 'manutd-pl-goals',    group: 'Club Legends', competition: 'GB1', filter: { club: '985' }, stat: 'goals', title: 'Manchester United — PL Goals', hint: 'Rooney (183) busts; Giggs (108) and Scholes (107) drop you fast — Hughes (35), Mata (34) to finish.' },
  { id: 'arsenal-pl-goals',   group: 'Club Legends', competition: 'GB1', filter: { club: '11' },  stat: 'goals', title: 'Arsenal — PL Goals', hint: 'Henry (175) is the big drop — Wright (104), van Persie (96), then Ramsey (40) or Fàbregas (35).' },
  { id: 'liverpool-pl-goals', group: 'Club Legends', competition: 'GB1', filter: { club: '31' },  stat: 'goals', title: 'Liverpool — PL Goals', hint: 'Salah (191) busts; Fowler (128) and Gerrard (121) descend — Rush (45), McManaman (41) to close.' },
  { id: 'chelsea-pl-goals',   group: 'Club Legends', competition: 'GB1', filter: { club: '631' }, stat: 'goals', title: 'Chelsea — PL Goals', hint: 'Lampard (147) and Drogba (104) drop you fast — Terry (41), Anelka (38) for the finish.' },
  { id: 'mancity-pl-goals',   group: 'Club Legends', competition: 'GB1', filter: { club: '281' }, stat: 'goals', title: 'Manchester City — PL Goals', hint: 'Agüero (184) busts; Haaland (112) and Sterling (91) descend — Gündoğan (45), Mahrez (43) to close.' },

  // ── By nationality ────────────────────────────────────────────────
  { id: 'french-pl-goals',   group: 'By Nationality', competition: 'GB1', filter: { nationality: 'france' }, stat: 'goals', title: 'French players — PL Goals', hint: 'Henry (175) and Anelka (125) descend fast — Nasri (36), Malouda (35) to finish.' },
  { id: 'spanish-pl-apps',   group: 'By Nationality', competition: 'GB1', filter: { nationality: 'spain' },  stat: 'apps',  title: 'Spanish players — PL Appearances', hint: 'De Gea (415) and Fàbregas (350) bust — Morientes (41), Saltor (39) keep you in checkout range.' },
  { id: 'irish-pl-apps',     group: 'By Nationality', competition: 'GB1', filter: { nationality: 'ireland' }, stat: 'apps', title: 'Irish players — PL Appearances', hint: "Given (451), O'Shea (446) and Dunne (432) all bust — Whelan (40), Quinn (43) for the finish." },
]
