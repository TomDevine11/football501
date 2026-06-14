// "Guess the World Cup" — identify a FIFA World Cup from clues revealed one at
// a time (host → Golden Boot → runner-up → final score → winner). You guess the
// year. Data is sourced from Wikipedia (List of FIFA World Cup finals + FIFA
// World Cup awards) — historical, stable facts. 2026 is included as a topical,
// fact-based entry while the tournament is current.

const TOURNAMENTS = [
  { year: 1930, host: 'Uruguay', winner: 'Uruguay', runnerUp: 'Argentina', score: '4–2', topScorer: 'Guillermo Stábile' },
  { year: 1934, host: 'Italy', winner: 'Italy', runnerUp: 'Czechoslovakia', score: '2–1 (a.e.t.)', topScorer: 'Oldřich Nejedlý' },
  { year: 1938, host: 'France', winner: 'Italy', runnerUp: 'Hungary', score: '4–2', topScorer: 'Leônidas' },
  { year: 1950, host: 'Brazil', winner: 'Uruguay', runnerUp: 'Brazil', score: '2–1', topScorer: 'Ademir' },
  { year: 1954, host: 'Switzerland', winner: 'West Germany', runnerUp: 'Hungary', score: '3–2', topScorer: 'Sándor Kocsis' },
  { year: 1958, host: 'Sweden', winner: 'Brazil', runnerUp: 'Sweden', score: '5–2', topScorer: 'Just Fontaine' },
  { year: 1962, host: 'Chile', winner: 'Brazil', runnerUp: 'Czechoslovakia', score: '3–1', topScorer: 'Flórián Albert' },
  { year: 1966, host: 'England', winner: 'England', runnerUp: 'West Germany', score: '4–2 (a.e.t.)', topScorer: 'Eusébio' },
  { year: 1970, host: 'Mexico', winner: 'Brazil', runnerUp: 'Italy', score: '4–1', topScorer: 'Gerd Müller' },
  { year: 1974, host: 'West Germany', winner: 'West Germany', runnerUp: 'Netherlands', score: '2–1', topScorer: 'Grzegorz Lato' },
  { year: 1978, host: 'Argentina', winner: 'Argentina', runnerUp: 'Netherlands', score: '3–1 (a.e.t.)', topScorer: 'Mario Kempes' },
  { year: 1982, host: 'Spain', winner: 'Italy', runnerUp: 'West Germany', score: '3–1', topScorer: 'Paolo Rossi' },
  { year: 1986, host: 'Mexico', winner: 'Argentina', runnerUp: 'West Germany', score: '3–2', topScorer: 'Gary Lineker' },
  { year: 1990, host: 'Italy', winner: 'West Germany', runnerUp: 'Argentina', score: '1–0', topScorer: 'Salvatore Schillaci' },
  { year: 1994, host: 'United States', winner: 'Brazil', runnerUp: 'Italy', score: '0–0 (a.e.t.), 3–2 (pen.)', topScorer: 'Oleg Salenko' },
  { year: 1998, host: 'France', winner: 'France', runnerUp: 'Brazil', score: '3–0', topScorer: 'Davor Šuker' },
  { year: 2002, host: 'South Korea & Japan', winner: 'Brazil', runnerUp: 'Germany', score: '2–0', topScorer: 'Ronaldo' },
  { year: 2006, host: 'Germany', winner: 'Italy', runnerUp: 'France', score: '1–1 (a.e.t.), 5–3 (pen.)', topScorer: 'Miroslav Klose' },
  { year: 2010, host: 'South Africa', winner: 'Spain', runnerUp: 'Netherlands', score: '1–0 (a.e.t.)', topScorer: 'Thomas Müller' },
  { year: 2014, host: 'Brazil', winner: 'Germany', runnerUp: 'Argentina', score: '1–0 (a.e.t.)', topScorer: 'James Rodríguez' },
  { year: 2018, host: 'Russia', winner: 'France', runnerUp: 'Croatia', score: '4–2', topScorer: 'Harry Kane' },
  { year: 2022, host: 'Qatar', winner: 'Argentina', runnerUp: 'France', score: '3–3 (a.e.t.), 4–2 (pen.)', topScorer: 'Kylian Mbappé' },
  {
    year: 2026, host: 'USA, Canada & Mexico',
    special: [
      'The first 48-team World Cup — the largest ever',
      'The first staged across three host nations',
      '104 matches in 16 cities',
      'The most recent FIFA World Cup',
    ],
  },
]

export const MAX_CLUES = 5
export const YEARS = TOURNAMENTS.map(t => t.year)

function cluesFor(t) {
  if (t.special) return [`Hosted by ${t.host}`, ...t.special].slice(0, MAX_CLUES)
  return [
    `Hosted by ${t.host}`,
    `Golden Boot: ${t.topScorer}`,
    `Runner-up: ${t.runnerUp}`,
    `Final score: ${t.score}`,
    `Winners: ${t.winner}`,
  ]
}

export function summaryOf(t) {
  if (t.special) return `the ${t.year} World Cup, hosted by ${t.host}`
  return `the ${t.year} World Cup — ${t.winner} beat ${t.runnerUp} ${t.score.split(',')[0].replace(/\s*\(.*$/, '')} in ${t.host}`
}

export function getRandomTournament() {
  const t = TOURNAMENTS[Math.floor(Math.random() * TOURNAMENTS.length)]
  return { year: t.year, host: t.host, winner: t.winner || null, clues: cluesFor(t), summary: summaryOf(t) }
}
