// Motion constants shared between JS and CSS (docs/design-tokens.md §6).

// Board-settle → result modal. The product signature: every game shows its
// board payoff for this long before the ResultModal appears.
// CSS twin: --delay-result in src/index.css — change both together.
export const RESULT_REVEAL_DELAY_MS = 2500
