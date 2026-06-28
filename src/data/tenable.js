// Football Tenable — daily "name the top 10" trivia questions.
// Each question has exactly 10 distinct ranked answers. `aliases` cover
// common spellings/nicknames so the fuzzy guess-matcher can accept them.
//
// These are precomputed CLOSED answer sets shipped with the question — the
// "GOOD" pattern from the architecture review (validate against the stored
// set, never query at runtime). AS_OF records when the rankings were last
// verified; the validator test enforces the answer-set shape in CI.

export const TENABLE_AS_OF = '2026-06-29'

export const TENABLE_QUESTIONS = [
  {
    id: 'wc-top-scorers',
    type: 'player',
    title: 'FIFA World Cup — All-Time Top Goalscorers',
    emoji: '🌍',
    description: 'Name the 10 players with the most goals in FIFA World Cup history.',
    answers: [
      { rank: 1,  text: 'Miroslav Klose',     detail: '16 goals', aliases: ['klose'] },
      { rank: 2,  text: 'Ronaldo',            detail: '15 goals', aliases: ['ronaldo nazario', 'r9', 'ronaldo nazário'] },
      { rank: 3,  text: 'Gerd Müller',        detail: '14 goals', aliases: ['gerd muller', 'muller', 'müller'] },
      { rank: 4,  text: 'Just Fontaine',      detail: '13 goals', aliases: ['fontaine'] },
      { rank: 5,  text: 'Lionel Messi',       detail: '13 goals', aliases: ['messi', 'leo messi'] },
      { rank: 6,  text: 'Pelé',               detail: '12 goals', aliases: ['pele'] },
      { rank: 7,  text: 'Kylian Mbappé',      detail: '12 goals', aliases: ['mbappe', 'kylian mbappe', 'mbappé'] },
      { rank: 8,  text: 'Sándor Kocsis',      detail: '11 goals', aliases: ['sandor kocsis', 'kocsis'] },
      { rank: 9,  text: 'Jürgen Klinsmann',   detail: '11 goals', aliases: ['jurgen klinsmann', 'klinsmann'] },
      { rank: 10, text: 'Thomas Müller',      detail: '10 goals', aliases: ['thomas muller', 'thomas müller'] },
    ],
  },
  {
    id: 'pl-top-scorers',
    type: 'player',
    title: 'Premier League — All-Time Top Goalscorers',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    description: 'Name the 10 players with the most goals in Premier League history.',
    answers: [
      { rank: 1,  text: 'Alan Shearer',     detail: '260 goals', aliases: ['shearer'] },
      { rank: 2,  text: 'Harry Kane',       detail: '213 goals', aliases: ['kane'] },
      { rank: 3,  text: 'Wayne Rooney',     detail: '208 goals', aliases: ['rooney'] },
      { rank: 4,  text: 'Mohamed Salah',    detail: '193 goals', aliases: ['salah', 'mo salah', 'mohamed salah'] },
      { rank: 5,  text: 'Andrew Cole',      detail: '187 goals', aliases: ['andy cole', 'cole'] },
      { rank: 6,  text: 'Sergio Agüero',    detail: '184 goals', aliases: ['aguero', 'sergio aguero', 'kun aguero'] },
      { rank: 7,  text: 'Frank Lampard',    detail: '177 goals', aliases: ['lampard'] },
      { rank: 8,  text: 'Thierry Henry',    detail: '175 goals', aliases: ['henry'] },
      { rank: 9,  text: 'Robbie Fowler',    detail: '163 goals', aliases: ['fowler'] },
      { rank: 10, text: 'Jermain Defoe',    detail: '162 goals', aliases: ['defoe'] },
    ],
  },
  {
    id: 'ucl-top-scorers',
    type: 'player',
    title: 'UEFA Champions League — All-Time Top Goalscorers',
    emoji: '⭐',
    description: 'Name the 10 players with the most goals in UEFA Champions League history.',
    answers: [
      { rank: 1,  text: 'Cristiano Ronaldo',  detail: '140 goals', aliases: ['ronaldo', 'cr7'] },
      { rank: 2,  text: 'Lionel Messi',       detail: '129 goals', aliases: ['messi', 'leo messi'] },
      { rank: 3,  text: 'Robert Lewandowski', detail: '109 goals', aliases: ['lewandowski'] },
      { rank: 4,  text: 'Karim Benzema',      detail: '90 goals',  aliases: ['benzema'] },
      { rank: 5,  text: 'Raúl',               detail: '71 goals',  aliases: ['raul', 'raul gonzalez'] },
      { rank: 6,  text: 'Kylian Mbappé',      detail: '70 goals',  aliases: ['mbappe', 'kylian mbappe', 'mbappé'] },
      { rank: 7,  text: 'Erling Haaland',     detail: '57 goals',  aliases: ['haaland', 'erling haaland'] },
      { rank: 8,  text: 'Thomas Müller',      detail: '57 goals',  aliases: ['thomas muller', 'muller', 'müller'] },
      { rank: 9,  text: 'Ruud van Nistelrooy',detail: '56 goals',  aliases: ['van nistelrooy', 'ruud van nistelrooy'] },
      { rank: 10, text: 'Harry Kane',         detail: '54 goals',  aliases: ['harry kane'] },
    ],
  },
  {
    id: 'ballon-dor-most-wins',
    type: 'player',
    title: "Ballon d'Or — Most Wins All-Time",
    emoji: '🏅',
    description: "Name the 10 players who have won the Ballon d'Or the most times.",
    answers: [
      { rank: 1,  text: 'Lionel Messi',          detail: '8 wins', aliases: ['messi', 'leo messi'] },
      { rank: 2,  text: 'Cristiano Ronaldo',     detail: '5 wins', aliases: ['cristiano', 'cr7'] },
      { rank: 3,  text: 'Johan Cruyff',          detail: '3 wins', aliases: ['cruyff'] },
      { rank: 4,  text: 'Michel Platini',        detail: '3 wins', aliases: ['platini'] },
      { rank: 5,  text: 'Marco van Basten',      detail: '3 wins', aliases: ['van basten'] },
      { rank: 6,  text: 'Alfredo Di Stéfano',    detail: '2 wins', aliases: ['di stefano', 'alfredo di stefano'] },
      { rank: 7,  text: 'Franz Beckenbauer',     detail: '2 wins', aliases: ['beckenbauer'] },
      { rank: 8,  text: 'Kevin Keegan',          detail: '2 wins', aliases: ['keegan'] },
      { rank: 9,  text: 'Karl-Heinz Rummenigge', detail: '2 wins', aliases: ['rummenigge'] },
      { rank: 10, text: 'Ronaldo Nazário',       detail: '2 wins', aliases: ['ronaldo nazario', 'r9', 'o fenomeno', 'o fenômeno', 'ronaldo brazil'] },
    ],
  },
  {
    id: 'england-top-scorers',
    type: 'player',
    title: 'England — All-Time Top Goalscorers',
    emoji: '🏴',
    description: 'Name the 10 players with the most goals for the England national team.',
    answers: [
      { rank: 1,  text: 'Harry Kane',     detail: '68 goals', aliases: ['kane'] },
      { rank: 2,  text: 'Wayne Rooney',   detail: '53 goals', aliases: ['rooney'] },
      { rank: 3,  text: 'Bobby Charlton', detail: '49 goals', aliases: ['charlton'] },
      { rank: 4,  text: 'Gary Lineker',   detail: '48 goals', aliases: ['lineker'] },
      { rank: 5,  text: 'Jimmy Greaves',  detail: '44 goals', aliases: ['greaves'] },
      { rank: 6,  text: 'Michael Owen',   detail: '40 goals', aliases: ['owen'] },
      { rank: 7,  text: 'Tom Finney',     detail: '30 goals', aliases: ['finney'] },
      { rank: 8,  text: 'Nat Lofthouse',  detail: '30 goals', aliases: ['lofthouse'] },
      { rank: 9,  text: 'Alan Shearer',   detail: '30 goals', aliases: ['shearer'] },
      { rank: 10, text: 'Frank Lampard',  detail: '29 goals', aliases: ['lampard'] },
    ],
  },
  {
    id: 'ecl-most-titles',
    type: 'club',
    title: 'European Cup / Champions League — Clubs With Most Titles',
    emoji: '🏆',
    description: 'Name the 10 clubs that have won the European Cup / Champions League the most times.',
    answers: [
      { rank: 1,  text: 'Real Madrid',       detail: '15 titles', value: 15, aliases: ['real madrid'] },
      { rank: 2,  text: 'AC Milan',          detail: '7 titles',  value: 7,  aliases: ['ac milan', 'milan'] },
      { rank: 3,  text: 'Bayern Munich',     detail: '6 titles',  value: 6,  aliases: ['bayern munich', 'bayern', 'fc bayern'] },
      { rank: 4,  text: 'Liverpool',         detail: '6 titles',  value: 6,  aliases: ['liverpool fc', 'liverpool'] },
      { rank: 5,  text: 'Barcelona',         detail: '5 titles',  value: 5,  aliases: ['fc barcelona', 'barca', 'barça'] },
      { rank: 6,  text: 'Ajax',              detail: '4 titles',  value: 4,  aliases: ['ajax amsterdam'] },
      { rank: 7,  text: 'Manchester United', detail: '3 titles',  value: 3,  aliases: ['man united', 'man utd', 'manchester united'] },
      { rank: 8,  text: 'Inter Milan',       detail: '3 titles',  value: 3,  aliases: ['inter milan', 'inter', 'internazionale'] },
      { rank: 9,  text: 'Chelsea',           detail: '2 titles',  value: 2,  aliases: ['chelsea fc'] },
      { rank: 10, text: 'Juventus',          detail: '2 titles',  value: 2,  aliases: ['juventus fc', 'juve'] },
    ],
    // The 10th spot is a tie: six clubs have 2 European Cups, but only two slots
    // exist — so any 2-title club counts for the joint-9th/10th places.
    tieValue: 2,
    tiePool: [
      { text: 'Benfica',             aliases: ['sl benfica', 'benfica'] },
      { text: 'Porto',               aliases: ['fc porto', 'porto'] },
      { text: 'Nottingham Forest',   aliases: ['nottingham forest', 'forest', 'nottm forest'] },
      { text: 'Paris Saint-Germain', aliases: ['psg', 'paris saint-germain', 'paris saint germain', 'paris sg'] },
    ],
  },
  {
    id: 'laliga-top-scorers',
    type: 'player',
    title: 'La Liga — All-Time Top Goalscorers',
    emoji: '🇪🇸',
    description: "Name the 10 players with the most goals in Spain's La Liga.",
    answers: [
      { rank: 1,  text: 'Lionel Messi',       detail: '474 goals', aliases: ['messi', 'leo messi'] },
      { rank: 2,  text: 'Cristiano Ronaldo',  detail: '311 goals', aliases: ['ronaldo', 'cr7'] },
      { rank: 3,  text: 'Telmo Zarra',        detail: '251 goals', aliases: ['zarra'] },
      { rank: 4,  text: 'Karim Benzema',      detail: '238 goals', aliases: ['benzema'] },
      { rank: 5,  text: 'Hugo Sánchez',       detail: '234 goals', aliases: ['hugo sanchez'] },
      { rank: 6,  text: 'Raúl',               detail: '228 goals', aliases: ['raul', 'raul gonzalez'] },
      { rank: 7,  text: 'Quini',              detail: '219 goals', aliases: ['enrique castro quini'] },
      { rank: 8,  text: 'Alfredo Di Stéfano', detail: '216 goals', aliases: ['di stefano', 'alfredo di stefano'] },
      { rank: 9,  text: 'César Rodríguez',    detail: '215 goals', aliases: ['cesar rodriguez'] },
      { rank: 10, text: 'Isidro Lángara',     detail: '193 goals', aliases: ['isidro langara', 'langara'] },
    ],
  },
  {
    id: 'pl-most-appearances',
    type: 'player',
    title: 'Premier League — Most Appearances All-Time',
    emoji: '👕',
    description: 'Name the 10 players with the most Premier League appearances.',
    answers: [
      { rank: 1,  text: 'James Milner',  detail: '658 apps', aliases: ['milner', 'james milner'] },
      { rank: 2,  text: 'Gareth Barry',  detail: '653 apps', aliases: ['barry'] },
      { rank: 3,  text: 'Ryan Giggs',    detail: '632 apps', aliases: ['giggs'] },
      { rank: 4,  text: 'Frank Lampard', detail: '609 apps', aliases: ['lampard'] },
      { rank: 5,  text: 'David James',   detail: '572 apps', aliases: ['david james'] },
      { rank: 6,  text: 'Gary Speed',    detail: '535 apps', aliases: ['speed'] },
      { rank: 7,  text: 'Emile Heskey',  detail: '516 apps', aliases: ['heskey'] },
      { rank: 8,  text: 'Mark Schwarzer',detail: '514 apps', aliases: ['schwarzer'] },
      { rank: 9,  text: 'Jamie Carragher',detail: '508 apps', aliases: ['carragher'] },
      { rank: 10, text: 'Phil Neville',  detail: '505 apps', aliases: ['phil neville'] },
    ],
  },
  {
    id: 'pl-most-hattricks',
    type: 'player',
    title: 'Premier League — Most Hat-Tricks All-Time',
    emoji: '🎩',
    description: 'Name the 10 players with the most Premier League hat-tricks.',
    answers: [
      { rank: 1,  text: 'Sergio Agüero', detail: '12 hat-tricks', aliases: ['aguero', 'sergio aguero', 'kun aguero'] },
      { rank: 2,  text: 'Alan Shearer',  detail: '11 hat-tricks', aliases: ['shearer'] },
      { rank: 3,  text: 'Harry Kane',    detail: '10 hat-tricks', aliases: ['kane'] },
      { rank: 4,  text: 'Robbie Fowler', detail: '9 hat-tricks',  aliases: ['fowler'] },
      { rank: 5,  text: 'Thierry Henry', detail: '8 hat-tricks',  aliases: ['henry'] },
      { rank: 6,  text: 'Michael Owen',  detail: '7 hat-tricks',  aliases: ['owen'] },
      { rank: 7,  text: 'Jermain Defoe', detail: '7 hat-tricks',  aliases: ['defoe'] },
      { rank: 8,  text: 'Didier Drogba', detail: '6 hat-tricks',  aliases: ['drogba'] },
      { rank: 9,  text: 'Wayne Rooney',  detail: '6 hat-tricks',  aliases: ['rooney'] },
      { rank: 10, text: 'Robin van Persie', detail: '5 hat-tricks', aliases: ['van persie', 'rvp'] },
    ],
  },
  {
    id: 'brazil-top-scorers',
    type: 'player',
    title: 'Brazil — All-Time Top Goalscorers',
    emoji: '🇧🇷',
    description: 'Name the 10 players with the most goals for the Brazil national team.',
    answers: [
      { rank: 1,  text: 'Neymar',             detail: '79 goals', aliases: ['neymar jr'] },
      { rank: 2,  text: 'Pelé',               detail: '77 goals', aliases: ['pele'] },
      { rank: 3,  text: 'Ronaldo',            detail: '62 goals', aliases: ['ronaldo nazario', 'r9'] },
      { rank: 4,  text: 'Romário',            detail: '55 goals', aliases: ['romario'] },
      { rank: 5,  text: 'Zico',               detail: '48 goals', aliases: ['zico'] },
      { rank: 6,  text: 'Bebeto',             detail: '39 goals', aliases: ['bebeto'] },
      { rank: 7,  text: 'Rivaldo',            detail: '35 goals', aliases: ['rivaldo'] },
      { rank: 8,  text: 'Jairzinho',          detail: '33 goals', aliases: ['jairzinho'] },
      { rank: 9,  text: 'Ronaldinho',         detail: '33 goals', aliases: ['ronaldinho'] },
      { rank: 10, text: 'Tostão',             detail: '32 goals', aliases: ['tostao'] },
    ],
  },
  {
    id: 'real-madrid-top-scorers',
    type: 'player',
    title: 'Real Madrid — All-Time Top Goalscorers',
    emoji: '⚪',
    description: 'Name the 10 players with the most goals for Real Madrid.',
    answers: [
      { rank: 1,  text: 'Cristiano Ronaldo', detail: '450 goals', aliases: ['ronaldo', 'cr7'] },
      { rank: 2,  text: 'Karim Benzema',     detail: '354 goals', aliases: ['benzema'] },
      { rank: 3,  text: 'Raúl',              detail: '323 goals', aliases: ['raul', 'raul gonzalez'] },
      { rank: 4,  text: 'Alfredo Di Stéfano',detail: '308 goals', aliases: ['di stefano', 'alfredo di stefano'] },
      { rank: 5,  text: 'Santillana',        detail: '290 goals', aliases: ['santillana'] },
      { rank: 6,  text: 'Ferenc Puskás',     detail: '242 goals', aliases: ['puskas', 'ferenc puskas'] },
      { rank: 7,  text: 'Hugo Sánchez',      detail: '234 goals', aliases: ['hugo sanchez'] },
      { rank: 8,  text: 'Gento',             detail: '182 goals', aliases: ['francisco gento'] },
      { rank: 9,  text: 'Pirri',             detail: '172 goals', aliases: ['jose martinez sanchez', 'pirri'] },
      { rank: 10, text: 'Amancio',           detail: '155 goals', aliases: ['amancio amaro'] },
    ],
  },
  {
    id: 'pl-titles-clubs',
    type: 'club',
    title: 'English Top Flight — Clubs With Most League Titles',
    emoji: '🥇',
    description: 'Name the 10 clubs with the most English top-flight league titles (including the old First Division).',
    answers: [
      { rank: 1,  text: 'Manchester United',   detail: '20 titles', aliases: ['man united', 'man utd', 'manchester united'] },
      { rank: 2,  text: 'Liverpool',           detail: '20 titles', aliases: ['liverpool fc', 'liverpool'] },
      { rank: 3,  text: 'Arsenal',             detail: '14 titles', aliases: ['arsenal fc', 'gunners'] },
      { rank: 4,  text: 'Manchester City',     detail: '10 titles', aliases: ['man city', 'manchester city'] },
      { rank: 5,  text: 'Everton',             detail: '9 titles',  aliases: ['everton fc'] },
      { rank: 6,  text: 'Aston Villa',         detail: '7 titles',  aliases: ['aston villa', 'villa'] },
      { rank: 7,  text: 'Sunderland',          detail: '6 titles',  aliases: ['sunderland afc'] },
      { rank: 8,  text: 'Chelsea',             detail: '6 titles',  aliases: ['chelsea fc'] },
      { rank: 9,  text: 'Sheffield Wednesday', detail: '4 titles',  aliases: ['sheff wed', 'sheffield wednesday'] },
      { rank: 10, text: 'Newcastle United',    detail: '4 titles',  aliases: ['newcastle', 'newcastle united', 'nufc'] },
    ],
  },
]

export function getTenableQuestionForDay(dayIndex) {
  const n = TENABLE_QUESTIONS.length
  return TENABLE_QUESTIONS[((dayIndex % n) + n) % n]
}

// Deterministic "question of the day" — changes at local midnight,
// cycles through the question list (repeats once exhausted).
export function getDailyTenableQuestion() {
  const now = new Date()
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
  return getTenableQuestionForDay(dayIndex)
}

// A random question for Unlimited/practice mode (never affects daily stats).
export function getRandomTenableQuestion() {
  return TENABLE_QUESTIONS[Math.floor(Math.random() * TENABLE_QUESTIONS.length)]
}
