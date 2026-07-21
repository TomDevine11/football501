# UI Principles

How we make design decisions on this product. These principles are ranked — when two conflict, the earlier one wins. Part of the [Floodlight design system](./design-system.md).

---

## 1. The board is the star

Every game screen has exactly one centre of gravity: the play surface (score, pyramid, grid, tiles). Everything else — headers, toggles, hints, history — is supporting cast and must be visually quieter than the board.

**In practice**
- The board gets the largest type, the strongest contrast, and the most surrounding whitespace.
- Chrome (header, mode toggle, context card) stays in the muted text ladder; if a screenshot's brightest pixels aren't on the board, the hierarchy is wrong.
- Never stack two competing focal points (e.g. a huge score *and* a huge headline). One hero per screen.

## 2. Zero-thought input

A player should never wonder what to do next. The input affordance is always in the same place (directly under the board), always looks the same (the shared `GuessInput`), and is auto-focused when it's the player's turn.

**In practice**
- One primary action per view, in brand green. Everything else is outline/ghost.
- Destructive-ish actions (give up) are red *outline*, full-width, below the input — consistent across all games (already true; protect it).
- Disabled states explain themselves (e.g. the 501 custom builder shows *why* a question isn't playable).

## 3. Feedback is instant, verdicts are staged

Every tap/keystroke acknowledges within 100ms (press states, tile pop). But *verdicts* — right/wrong, win/lose — are staged for drama: flip the tiles, pulse the pyramid, count the reveal, **then** show the result modal (~2.5s later). Never let a modal steal the payoff animation.

**In practice**
- Acknowledge → animate → conclude. The 2.5s result-modal delay is a product signature; all games keep it.
- Wrong answers shake (400ms) and cost is shown immediately (heart lost, life dot dimmed, guess row flashes red).
- See [motion-system.md](./motion-system.md) for the exact grammar.

## 4. Same product, different modes

Consistency beats novelty. A returning player has already learned our header, toggle, input, history list, share card and result modal — every game must spend that knowledge, not reset it.

**In practice**
- The eight-slot page anatomy (design-system.md §4.2) is mandatory.
- Shared meanings never change: green = correct, red = wrong/lives, amber = warning/near miss, overline = section label.
- Lives are displayed one way product-wide (see component-library.md — currently hearts vs dots vs text; this converges).
- A game's accent colours its *identity* (wordmark, selection, key stat), never its *semantics*.

## 5. Premium is in the details

We never settle for the default: no raw Tailwind grey palette on our green-black canvas, no default focus rings, no emoji where a crafted SVG can live, no layout that looks like a to-do app with the labels swapped.

**In practice**
- Every colour/space/radius comes from a token; "eyeballed" utility values are debt.
- Numbers are tabular, uppercase labels are tracked, borders are 1px and intentional.
- If a screen would look at home in an admin dashboard, it fails Floodlight. Add the sporting layer: display type, accent identity, motion.

## 6. Accessible by default

Fun that excludes players isn't polish.

**In practice**
- Text ≥ 4.5:1 contrast on its background (audit flags today's `text-gray-700` fails).
- Never colour-only feedback: pair with icon/text (✓/✗, "1 away!", hearts count).
- All interactive elements: visible `focus-visible` ring (accent-coloured), min 44×44px touch target on mobile (keyboard keys and mode toggle currently miss this).
- Modals: `role="dialog"`, focus trap, Escape closes, focus returns to trigger.
- Autocomplete inputs expose combobox/listbox ARIA so screen readers can play too.
- Respect `prefers-reduced-motion`: reduce staged reveals to fades (see motion-system.md §6).

## 7. Mobile is the main stadium

Trivia is played on phones — on the sofa, in the pub, on the bus. Design at 375px first; desktop is the enhancement.

**In practice**
- The game column (`max-w-lg`) is a mobile layout that happens to look great centred on desktop. Keep it.
- Thumb reach: primary input and actions in the lower half where possible; history scrolls, board doesn't.
- Inputs use ≥16px font (prevents iOS zoom — already true; protect it).
- Test every board at 320px: Wordle's clamp-based tiles are the reference solution for wide content.

## 8. Excitement compounds, clutter kills

Add juice, remove noise. Every addition (a stat box, a hint row, an ad slot) must pay rent: does it make the next guess more exciting or more informed? If not, cut it or collapse it.

**In practice**
- Rules live in one faint line or the context card — never paragraphs on the play screen (the Hub's About/FAQ is where prose belongs).
- Empty states and waiting states still feel alive (spinner with brand accent, skeleton surfaces — never a blank white/black flash; the route-level `Loading` div must match the pitch background).
- Celebrate wins harder than we punish losses: victory gets the biggest type, the most motion, and the share card front-and-centre.

---

## Decision checklist (before any design change ships)

1. **Hierarchy** — is the board still the brightest, biggest thing? One hero?
2. **Spacing** — does it sit on the 4px grid and the screen's chosen section rhythm?
3. **Balance** — header/board/input weights still feel stable at 375px and 1280px?
4. **Colour** — every colour a token with the right *meaning* (semantics vs identity)?
5. **Interaction** — <100ms acknowledgement, staged verdict, focus-visible, 44px targets?
6. **Experience** — would a first-time player know what to do in 3 seconds? Would a returning player feel at home?
