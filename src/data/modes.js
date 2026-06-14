// Football 501 challenges — each backed by an authoritative all-time
// top-scorer leaderboard (src/data/canonical/stats.generated.json, parsed from
// Wikipedia list articles). A named player's exact career goals in that
// competition are deducted from 501; land between 0 and −10 to check out.
// A single player worth more than 180 busts the board (a darts visit max),
// so the skill is naming lower scorers to control your countdown.
//
// All eligibility + stats are precomputed and validated by lookup — there is
// no runtime stat lookup and no nationality/position filtering (those couldn't
// be sourced reliably, so they were dropped rather than left fragile).
// Hint numbers below are the real values from the sourced table.

export const MODES = [
  {
    id: 'top-leagues',
    title: 'Top Leagues',
    emoji: '🏆',
    tagline: 'All-time league top scorers',
    color: 'purple',
    challenges: [
      {
        id: 'prem-goals',
        title: 'Premier League Top Scorers',
        emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        description: 'Name all-time Premier League top scorers — their career PL goals are deducted.',
        hint: 'Shearer (260) and Kane (213) bust the board — Defoe (162), Fowler (163) and Henry (175) keep you in range.',
        filters: {}, competition: 'prem', statTypes: ['goals'],
      },
      {
        id: 'laliga-goals',
        title: 'La Liga Top Scorers',
        emoji: '🇪🇸',
        description: 'Name all-time La Liga top scorers — their career La Liga goals are deducted.',
        hint: 'Messi (474) and Ronaldo (311) bust instantly — Suárez (179), Eto’o (162) and Aspas (170) are safer.',
        filters: {}, competition: 'laliga', statTypes: ['goals'],
      },
      {
        id: 'bundesliga-goals',
        title: 'Bundesliga Top Scorers',
        emoji: '🇩🇪',
        description: 'Name all-time Bundesliga top scorers — their career Bundesliga goals are deducted.',
        hint: 'Gerd Müller (365) and Lewandowski (312) bust — Gómez (170) and Dieter Müller (177) stay on the board.',
        filters: {}, competition: 'bundesliga', statTypes: ['goals'],
      },
    ],
  },
  {
    id: 'champions-league',
    title: 'Champions League',
    emoji: '⭐',
    tagline: 'All-time UCL top scorers',
    color: 'yellow',
    challenges: [
      {
        id: 'ucl-goals',
        title: 'Champions League Top Scorers',
        emoji: '⭐',
        description: 'Name all-time UEFA Champions League top scorers — their career UCL goals are deducted.',
        hint: 'Even the top names stay in range: Ronaldo (140), Messi (129), Lewandowski (109) — Raúl (71) and Müller are safer.',
        filters: {}, competition: 'ucl', statTypes: ['goals'],
      },
    ],
  },
  {
    id: 'international',
    title: 'International',
    emoji: '🌍',
    tagline: 'All-time international top scorers',
    color: 'green',
    challenges: [
      {
        id: 'intl-goals',
        title: 'International Top Scorers',
        emoji: '🌍',
        description: 'Name the men’s players with the most international goals — their tally is deducted.',
        hint: 'No one busts here: Ronaldo (143), Messi (116), Ali Daei (108) — Puskás (84) and Lukaku are safer picks.',
        filters: {}, competition: 'international', statTypes: ['goals'],
      },
    ],
  },
]
