// ─────────────────────────────────────────────────────────────────────────
// FOOTBALL 501 — CHALLENGE DEFINITIONS (declarative, hand-authored)
//
// Each challenge is a query over the Transfermarkt fact table
// (football501.generated.json, appearances since 2012). Stage 60 of the data
// pipeline resolves these into game-ready rosters (questionCache.generated.json).
//
// Shape:
//   id           unique slug
//   group        category label for the mode selector
//   competition  GB1 | ES1 | IT1 | L1 | FR1 | CL
//   filter       null | { club: '<clubId>' } | { nationality: '<natKey>' }
//   stat         '<measure>'  OR  { a, op, b }   (measures: apps goals assists
//                yellow red minutes · op: '+' | '-')
//   title        display title
//   hint         optional strategy hint (fill from the resolver's range output)
//
// Eligibility is enforced by the resolver: a player is a valid answer iff their
// value is 1..179 (a legal single deduction). Everything else is derived — add
// a challenge here, rerun `npm run build:501-challenges`, done.
// ─────────────────────────────────────────────────────────────────────────

export const CHALLENGES = [
  // ── Top scorers (single stat, whole competition) ──────────────────
  { id: 'pl-goals',         group: 'Top Scorers', competition: 'GB1', filter: null, stat: 'goals', title: 'Premier League Goals (since 2012)', hint: 'Agüero (161) and Vardy (145) drop you fast — save Son (127) or a lower scorer to finish between 0 and −10.' },
  { id: 'laliga-goals',     group: 'Top Scorers', competition: 'ES1', filter: null, stat: 'goals', title: 'La Liga Goals (since 2012)', hint: 'Suárez (176), Benzema (171) and Aspas (169) descend quick — Gerard Moreno (124) and Oyarzabal (100) keep you in control.' },
  { id: 'seriea-goals',     group: 'Top Scorers', competition: 'IT1', filter: null, stat: 'goals', title: 'Serie A Goals (since 2012)', hint: 'Lautaro (132), Dybala (131) and Berardi (130) bring you down — line up a smaller scorer for the checkout.' },
  { id: 'bundesliga-goals', group: 'Top Scorers', competition: 'L1',  filter: null, stat: 'goals', title: 'Bundesliga Goals (since 2012)', hint: 'Kramarić (140) and Reus (120) descend fast — Müller (105) or Werner (102) then a finisher.' },
  { id: 'ligue1-goals',     group: 'Top Scorers', competition: 'FR1', filter: null, stat: 'goals', title: 'Ligue 1 Goals (since 2012)', hint: 'Ben Yedder (160) and Lacazette (155) drop you quick — Cavani (138), Ibrahimović (113) to close in.' },
  { id: 'ucl-goals',        group: 'Top Scorers', competition: 'CL',  filter: null, stat: 'goals', title: 'Champions League Goals (since 2012)', hint: 'Lewandowski (108) and Ronaldo (102) are the big drops — Messi (78), Mbappé (70) then a low scorer to finish.' },

  // ── Playmakers / discipline (other single stats) ──────────────────
  { id: 'pl-assists',       group: 'Playmakers',  competition: 'GB1', filter: null, stat: 'assists', title: 'Premier League Assists (since 2012)', hint: 'De Bruyne (122) and Salah (98) descend fast — Sterling (86), Eriksen (83) keep you in range.' },
  { id: 'pl-yellows',       group: 'Discipline',  competition: 'GB1', filter: null, stat: 'yellow',  title: 'Premier League Yellow Cards (since 2012)', hint: 'Even the worst offenders stay modest — Tarkowski (72), Shaw (71), Xhaka (63) — so this is a patient countdown.' },

  // ── Composite (Stat ⊕ Stat) ───────────────────────────────────────
  { id: 'pl-goal-contributions', group: 'Composite', competition: 'GB1', filter: null, stat: { a: 'goals', op: '+', b: 'assists' }, title: 'Premier League Goals + Assists (since 2012)', hint: 'Lukaku (163) and Mané (158) drop you fast — Mahrez (147), Hazard (146) then a low contributor to finish.' },

  // ── Club-filtered ─────────────────────────────────────────────────
  { id: 'arsenal-goal-contributions', group: 'Club Legends', competition: 'GB1', filter: { club: '11' }, stat: { a: 'goals', op: '+', b: 'assists' }, title: 'Goals + Assists · Arsenal · Premier League', hint: 'Saka (114) and Giroud (100) are the big drops — Xhaka (41), Rice (38), Havertz (37) close it out.' },

  // ── Nationality-filtered ──────────────────────────────────────────
  { id: 'pl-apps-minus-goals-spain', group: 'By Nationality', competition: 'GB1', filter: { nationality: 'spain' },  stat: { a: 'apps', op: '-', b: 'goals' },   title: 'Appearances − Goals · Spanish players · Premier League', hint: 'Defenders and keepers rack up huge values — Ayoze (178), Bellerín (175) — while forwards like Soldado (45) keep you in checkout range.' },
  { id: 'seriea-yellow-assists-brazil', group: 'By Nationality', competition: 'IT1', filter: { nationality: 'brazil' }, stat: { a: 'yellow', op: '+', b: 'assists' }, title: 'Yellow Cards + Assists · Brazilian players · Serie A', hint: 'Danilo (80), Juan Jesus (76) and Allan (73) descend quick — Bremer (44), Hernanes (42) to finish.' },
]
