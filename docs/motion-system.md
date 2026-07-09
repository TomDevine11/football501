# Motion System

How things move. Part of the [Triviverse design system](./design-system.md). Exact duration/easing tokens live in [design-tokens.md](./design-tokens.md); this doc is the grammar.

---

## 1. Why motion exists here

Motion in a trivia game is not decoration — it is the **referee**. It tells the player: your input registered, your answer was right/wrong, the round is over. Every animation must answer one of those three, or celebrate. Anything else is cut.

The product already has good instincts (tile flips, pyramid pulses, score pops, staged result modals). This system names them, fixes their timing to a scale, and closes the gaps (no reduced-motion support, ad-hoc durations).

---

## 2. The three beats

Every player action resolves in the same rhythm:

1. **Acknowledge (≤100ms)** — the UI proves it heard you. Tile pop on keypress (`tile-pop`, 100ms), button press states, cell selection ring.
2. **Judge (200–700ms)** — the verdict plays out *on the board*. Flip, flash, shake, pulse. This is where each game's personality lives.
3. **Conclude (staged)** — win/lose state lands, then the **result modal waits ~2.5s** before appearing so the board's payoff animation is seen. This delay is a product signature; every game implements it identically (`setTimeout(setShowResult, 2500)`).

---

## 3. Duration scale

| Token | ms | Use |
|---|---|---|
| `instant` | 100 | Acknowledgement: tile pop, key highlight |
| `fast` | 150–200 | Hovers, fades, dropdown/modal entrances (`result-modal-in` 180ms, `slide-in` 200ms) |
| `base` | 250–300 | Standard reveals: `score-pop` 250ms, `clue-reveal` 300ms |
| `slow` | 350–500 | Emphatic verdicts: `cell-reveal` 350ms, `shake` 400ms, `tile-flip` 500ms |
| `dramatic` | 600–700 | Celebrations & losses: `tile-bounce` 600ms, `flash-valid/invalid` 700ms |

Rules of thumb:
- Hover/focus feedback never exceeds `fast`.
- Anything blocking the next input (flip reveal, pyramid count) stays under ~1.2s total.
- Only celebrations may go `dramatic`.

## 4. Easing

| Token | Curve | Use |
|---|---|---|
| `ease-out` (standard) | `ease-out` | Almost everything: entrances, reveals, fades |
| `ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Cards/modals entering — the "settle" feel (`result-card` uses it today; adopt for all overlay entrances) |
| `ease-in-out` | `ease-in-out` | Loops and there-and-back moves: shake, pulse, flip |

Nothing animates with linear timing except infinite spinners.

---

## 5. The named moves (current inventory, `src/index.css`)

The shared vocabulary — reuse these before inventing new ones:

| Move | What it says | Where |
|---|---|---|
| `tile-pop` | "letter registered" | Wordle typing |
| `shake` | "wrong" — the universal rejection | All inputs, Connections grid |
| `flash-valid` / `flash-invalid` | "this row was right/wrong" | Guess history rows |
| `score-pop` | "the number changed" | 501 score |
| `cell-reveal` | "you earned this cell" | TicTacToe, WC Squads, pyramid |
| `clue-reveal` | "new information" | Teammates/Career clue rows |
| `tile-flip` | "judging…" (staggered 100ms/col) | Wordle row reveal |
| `tile-bounce` | "victory lap" (staggered 60ms/col) | Wordle win row |
| `pyramid-pulse` | "counting up to your rank" (160ms/row step) | Tenable reveal |
| `slide-in` | list entrance | misc |
| `result-modal-in` / `result-card-in` | overlay entrance (fade + rise-settle) | ResultModal |

### Choreography patterns
- **Stagger** sibling elements 60–100ms apart (Wordle columns) — one row judged left-to-right reads as a sentence.
- **Count toward the target** (Tenable's bottom-up pulse) — anticipation before reveal. This is the product's best moment; any game revealing a ranked/positioned answer should use the same build-up.
- **Colour + motion together**: a verdict always pairs movement with semantic colour (green fill, red flash) and a symbol (✓/✗) — never motion alone.

---

## 6. Reduced motion (implemented globally in `src/index.css`)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Staged sequences must remain *informationally* intact when collapsed: the Tenable count-up becomes an instant reveal; the Wordle flip becomes an instant colour set; the 2.5s modal delay shortens but the "see result" button path still exists. Never gate information behind an animation completing.

---

## 7. Rules

1. **Never animate layout of the board container** — the play surface must not shift under the player's thumb. Animate within cells/rows, or overlay.
2. **One celebration at a time.** Win = board animation, *then* modal. Not both at once.
3. **Interruptible.** Player input during a non-verdict animation wins; verdict animations briefly lock input (Wordle's `flippingRow` guard is the reference).
4. **Loops are for waiting only**: spinners, `animate-pulse` on "CHECKOUT ZONE"/"YOUR TURN". Maximum one pulsing element per screen.
5. **New moves get named, tokened, and added to §5** before use. Per-game keyframes go in the shared sheet with the shared scale — no inline magic durations.
