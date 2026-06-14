// ─────────────────────────────────────────────────────────────────────────
// CENTRAL SEO CONFIG — single source of truth for every route.
//
// Used by BOTH the client (<Seo> head manager, for SPA navigation) and the
// build-time prerender (scripts/prerender.mjs, which writes a unique static
// HTML file per route + sitemap.xml + robots.txt). Plain JS so Node and the
// browser can both import it. Change the domain in ONE place (SITE_URL).
// ─────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://footballtriviagames.onrender.com'
export const BRAND = 'Football Trivia Games'
export const TWITTER = '@footballtrivia'
// 1200×630 social-share image. SVG works for Google; for perfect Twitter/Slack
// previews, drop a PNG at public/og/default.png and change this to .png.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.svg`

export const absolute = (path) => (path === '/' ? SITE_URL + '/' : SITE_URL + path)

// One entry per route. Titles ≤ ~60 chars, descriptions ~150–160 chars,
// keyword-rich and unique (duplicate titles/descriptions are a ranking killer).
export const ROUTES = [
  {
    path: '/',
    name: 'Home',
    title: 'Football Trivia Games — Free Daily Football Quiz Games',
    description: 'Free daily football trivia games: Football Wordle, a footy Tic-Tac-Toe grid, name the top 10, and guess the player from their teammates. Play solo or 1v1.',
    keywords: ['football trivia games', 'football quiz', 'soccer trivia', 'daily football game', 'football guessing game'],
    h1: 'Football Trivia Games',
    tagline: 'A growing collection of free daily football trivia games. No sign-up, just play.',
    howTo: [],
    faq: [
      { q: 'What is Football Trivia Games?', a: 'Football Trivia Games is a free collection of daily football quiz games — including Football Wordle, Football Tic-Tac-Toe, Football Tenable and Guess the Player — playable in your browser with no sign-up.' },
      { q: 'Are the games free to play?', a: 'Yes. Every game is completely free, runs in your browser, and needs no account or download.' },
      { q: 'Do new puzzles appear every day?', a: 'Yes. The daily games refresh at local midnight, and the guessing and 1v1 modes can be replayed as often as you like.' },
    ],
    schema: 'WebSite',
    priority: '1.0',
    changefreq: 'daily',
  },
  {
    path: '/wordle',
    name: 'Football Wordle',
    title: 'Football Wordle — Guess the Footballer | Football Trivia Games',
    description: "Play Football Wordle: guess the mystery footballer's surname in six tries. A new player every day — green is the right spot, yellow the right letter, wrong spot.",
    keywords: ['football wordle', 'soccer wordle', 'guess the footballer', 'footballer wordle', 'football word game'],
    h1: 'Football Wordle',
    tagline: "Guess the mystery footballer's surname in six tries.",
    howTo: [
      'A new famous footballer is chosen every day.',
      'Type a real surname and submit your guess.',
      'Green means the letter is in the right spot; yellow means right letter, wrong spot; grey means it is not in the surname.',
      'Solve the surname within six guesses to win.',
    ],
    faq: [
      { q: 'What is Football Wordle?', a: "Football Wordle is a daily word game where you guess a famous footballer's surname in six tries, using green and yellow colour clues just like Wordle." },
      { q: 'How many guesses do I get?', a: 'You get six guesses to find the footballer’s surname.' },
      { q: 'Does the footballer change every day?', a: 'Yes — a new footballer is selected each day and refreshes at local midnight.' },
    ],
    schema: 'VideoGame',
    priority: '0.9',
    changefreq: 'daily',
  },
  {
    path: '/tictactoe',
    name: 'Football Tic-Tac-Toe',
    title: 'Football Tic-Tac-Toe — Daily Grid & 1v1 | Football Trivia Games',
    description: 'Play Football Tic-Tac-Toe: a 3x3 grid where every row and column is a football category. Name a player who fits both to claim a square. Daily solo grid or local 1v1.',
    keywords: ['football tic tac toe', 'footy grid', 'football grid game', 'soccer tic tac toe', 'football category grid'],
    h1: 'Football Tic-Tac-Toe',
    tagline: 'Two football categories meet in every square — name a player who fits both.',
    howTo: [
      'Every row and column is a football category — a club, league, nationality or trophy.',
      'Pick a square and name a player who satisfies BOTH its row and column category.',
      'No player can be used twice on the same grid.',
      'In the daily mode, fill all nine squares before your lives run out. In 1v1, take turns and get three in a row to win.',
    ],
    faq: [
      { q: 'How does Football Tic-Tac-Toe work?', a: 'Each row and column of the 3x3 grid is a football category. To claim a square you name a player who fits both the row and the column — for example a player who played for a given club AND won a given trophy.' },
      { q: 'Can I play Football Tic-Tac-Toe with a friend?', a: 'Yes. The 1v1 mode lets two players share one device, taking turns to claim squares. The first to three in a row wins.' },
      { q: 'Does the daily grid change every day?', a: 'Yes — the daily challenge generates a fresh, solvable grid each day.' },
    ],
    schema: 'VideoGame',
    priority: '0.9',
    changefreq: 'daily',
  },
  {
    path: '/teammates',
    name: 'Guess the Player',
    title: 'Guess the Footballer from Teammates | Football Trivia Games',
    description: 'Guess the mystery footballer from their real teammates, revealed one at a time. Work out who it is in five guesses in this addictive football guessing game.',
    keywords: ['guess the footballer', 'guess the football player', 'football guessing game', 'name the footballer', 'teammates football game'],
    h1: 'Guess the Player',
    tagline: 'Identify the mystery footballer from the players they actually played with.',
    howTo: [
      'A well-known footballer is chosen at random.',
      'One of their real former teammates is revealed.',
      'Guess who the mystery player is. A wrong guess reveals another teammate.',
      'Work it out within five guesses to win.',
    ],
    faq: [
      { q: 'How do I play Guess the Player?', a: 'You are shown one real teammate of a mystery footballer. Guess who the mystery player is; each wrong guess reveals another teammate, up to five clues.' },
      { q: 'How many guesses do I get?', a: 'You get five guesses, with a new teammate revealed after each wrong answer.' },
      { q: 'Are the teammates accurate?', a: 'Yes — teammates are players who genuinely shared a club or national team during overlapping years.' },
    ],
    schema: 'VideoGame',
    priority: '0.9',
    changefreq: 'weekly',
  },
  {
    path: '/tenable',
    name: 'Football Tenable',
    title: 'Football Tenable — Name the Top 10 | Football Trivia Games',
    description: 'Play Football Tenable: a new football trivia question every day. Name as many of the top 10 answers as you can — three wrong guesses and it is game over.',
    keywords: ['football tenable', 'name the top 10 football', 'football top 10 quiz', 'football list trivia', 'football trivia daily'],
    h1: 'Football Tenable',
    tagline: 'Name as many of the top 10 as you can before three wrong guesses end it.',
    howTo: [
      'Each day brings a new "name the top 10" football question.',
      'Type answers to fill in as many of the ten as you can.',
      'Every correct answer reveals its place on the list.',
      'Three wrong guesses ends the game — how many of the ten can you name?',
    ],
    faq: [
      { q: 'What is Football Tenable?', a: 'Football Tenable is a daily football trivia game where you try to name all ten answers to a top-10 question — such as a competition’s all-time top scorers — before making three mistakes.' },
      { q: 'How many lives do I have?', a: 'You can make up to three wrong guesses before the game ends.' },
      { q: 'Is there a new question each day?', a: 'Yes — a new top-10 question appears every day.' },
    ],
    schema: 'VideoGame',
    priority: '0.9',
    changefreq: 'daily',
  },
  {
    path: '/501',
    name: 'Football 501',
    title: 'Football 501 — Coming Soon | Football Trivia Games',
    description: 'Football 501, the darts-style football trivia game, is coming soon to Football Trivia Games.',
    keywords: ['football 501', 'football darts game'],
    h1: 'Football 501',
    tagline: 'The football darts trivia game — coming soon.',
    howTo: [],
    faq: [],
    schema: null,
    noindex: true, // disabled / coming soon — keep out of the index and sitemap
  },
]

export const routeByPath = (path) => ROUTES.find(r => r.path === path) || ROUTES[0]
export const indexableRoutes = () => ROUTES.filter(r => !r.noindex)

// ── Meta tags (consumed by client <Seo> and the prerender) ──────────────────
export function metaTagsFor(route) {
  const url = absolute(route.path)
  const ogImage = route.ogImage ? absolute(route.ogImage) : DEFAULT_OG_IMAGE
  const tags = [
    { name: 'description', content: route.description },
    { name: 'keywords', content: (route.keywords || []).join(', ') },
    { name: 'robots', content: route.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large' },
    { name: 'theme-color', content: '#0a0a0a' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: BRAND },
    { property: 'og:title', content: route.title },
    { property: 'og:description', content: route.description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: route.title },
    { name: 'twitter:description', content: route.description },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:site', content: TWITTER },
  ]
  return tags
}

// ── Structured data (JSON-LD) ───────────────────────────────────────────────
export function jsonLdFor(route) {
  const url = absolute(route.path)
  const blocks = []

  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND,
    url: SITE_URL + '/',
    logo: `${SITE_URL}/favicon.svg`,
  }

  if (route.path === '/') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL + '/',
      name: BRAND,
      description: route.description,
      publisher: organization,
    })
    blocks.push({ '@context': 'https://schema.org', ...organization })
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Football trivia games',
      itemListElement: indexableRoutes().filter(r => r.path !== '/').map((r, i) => ({
        '@type': 'ListItem', position: i + 1, name: r.name, url: absolute(r.path),
      })),
    })
  } else if (route.schema === 'VideoGame') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: `${route.name} — ${BRAND}`,
      url,
      description: route.description,
      applicationCategory: 'GameApplication',
      genre: 'Trivia',
      gamePlatform: 'Web browser',
      operatingSystem: 'Any',
      inLanguage: 'en',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: organization,
    })
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Football Trivia Games', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: route.name, item: url },
      ],
    })
  }

  if (route.faq && route.faq.length) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: route.faq.map(f => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }
  return blocks
}
