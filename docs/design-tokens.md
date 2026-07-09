# Design Tokens

The single vocabulary every screen is built from. **Implemented** (July 2026): `tailwind.config.js` `theme.extend` + the `:root` CSS-variable block in `src/index.css`. This document is the contract — token changes update config, `:root`, and this doc together (§10).

Naming convention: semantic first (`surface`, `accent-wordle`), raw values never referenced in components. Rationale follows each group, because the point of every token is the same: *a decision made once, drift made impossible*.

---

## 1. Colour

### 1.1 The pitch ladder (neutrals)

Green-tinted neutrals replacing Tailwind `gray-*` everywhere:

| Token | Value | Replaces today |
|---|---|---|
| `pitch` | `#080c08` | body bg (unchanged) |
| `pitch-deep` | `#050705` | overlay backdrops, scrollbar track |
| `surface` | `#101510` | `gray-900` (cards, tiles, inputs) |
| `surface-raised` | `#1a211a` | `gray-800` (dropdowns, hovers, modal fills) |
| `surface-high` | `#242c24` | `gray-700` fills (active toggle segment, keys) |
| `border` | `#1e241e` | `gray-800` borders |
| `border-strong` | `#2e372e` | `gray-700` borders (inputs, interactive) |

Each step keeps the same ~120° hue as `#080c08`, desaturating slightly as it lightens.

**Why:** the audit's most pervasive issue. Tailwind greys are blue-tinted (`gray-900` = `#111827`), so today every card subtly fights the green-black canvas — the "cheap dark mode" feel is literally a colour-temperature clash, repeated hundreds of times. One ladder fixes it product-wide, and fixes the three-blacks problem (`theme-color` meta, route loader, body) by giving them all `pitch`.

### 1.2 Text ladder

| Token | Value | Contrast on `pitch` | Replaces |
|---|---|---|---|
| `text-primary` | `#f5f7f5` | ~17:1 | `white` |
| `text-secondary` | `#a8b3a8` | ~8:1 | `gray-400` |
| `text-muted` | `#788378` | 5.0:1 (4.7:1 on `surface`) | `gray-500`/`gray-600` |
| `text-faint` | `#586158` | ~3.5:1, **large/decorative only** | `gray-700` text |

**Why:** four levels is the minimum that expresses the hierarchy in ui-principles.md and the maximum a developer can apply without a chart. `text-muted` is tuned to *pass* AA at 4.5:1 — today's `gray-500`-on-`gray-900` hovers around the line and `gray-700` fails outright; the ladder makes the compliant choice the default. `text-faint` is explicitly restricted so the audit's contrast failures can't silently return.

### 1.3 Brand & semantics

| Token | Value | Use |
|---|---|---|
| `brand` | `#16a34a` | Primary buttons, focus borders (today's green-600) |
| `brand-strong` | `#15803d` | Primary button base (green-700) |
| `brand-bright` | `#4ade80` | Success text on dark (green-400) |
| `danger` / `danger-bright` | `#dc2626` / `#f87171` | Wrong, lives, give-up |
| `warn` / `warn-bright` | `#d97706` / `#fbbf24` | Near-miss, bust, urgency |

**Why:** these formalise what the games already do (green-700/600/400, red, amber) so semantics stop being re-picked per file. Keeping current values means zero visual regression on the things that already work.

### 1.4 Game accents (identity)

One hue per game, each with three intensities — `accent` (solid), `accent-bright` (text on dark), `accent-tint` (10–15% fill):

| Token | Base | Game |
|---|---|---|
| `accent-tenable` | `#eab308` yellow | Tenable |
| `accent-wordle` | `#3b82f6` blue | Wordle |
| `accent-tictactoe` | `#a855f7` purple | TicTacToe |
| `accent-teammates` | `#ec4899` pink | Teammates |
| `accent-careers` | `#06b6d4` cyan | Career Path |
| `accent-wcsquads` | `#f59e0b` amber | WC Squads |
| `accent-connections` | `#14b8a6` teal | Connections |
| `accent-higherlower` | `#f97316` orange | Higher/Lower |
| `accent-501` | `#ef4444` red | 501 |

Implementation intent: each game route sets `--accent` / `--accent-bright` / `--accent-tint` CSS variables once at its root; components reference `var(--accent)`. Semantic colours (§1.3) always win over accent when both could apply.

**Why:** audit finding #1 — the Hub promises nine personalities the games don't deliver, because accents live in ad-hoc class strings in `Hub.jsx`. As CSS variables, "use the game's accent" becomes a one-liner inside any shared component (wordmark tint, selection ring, stat colour), which is the only realistic way nine games stay themed through shared components. The per-game hues match today's Hub assignments to preserve learned identity.

### 1.5 Fixed collision resolutions (colour policy, not tokens)

- TicTacToe axis labels: row/col stop using yellow/blue; both use `text-muted` with icon differentiation, selection uses `--accent` (purple).
- Higher/Lower buttons: More/Fewer both use neutral `surface-high` with accent hover — direction is semantics-free, so no green/blue.
- X/O in 1v1 keep red/blue *glyphs* (`Mark` renders them; they're pieces, not UI), but banners/borders derive from the glyph colour tokens `mark-x: #f87171` / `mark-o: #60a5fa` documented as game pieces, exempt from the accent rule.

**Why:** these are the audit's "colour meaning collision" items; writing the resolution here means the token PR settles them once instead of leaving each to future judgement.

---

## 2. Typography

| Token | Font | Size / line-height | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | Bebas | `clamp(5rem, 20vw, 8rem)` / 0.9 | 0.02em | 501 score |
| `display-lg` | Bebas | `clamp(3rem, 10vw, 4.5rem)` / 0.95 | 0.02em | Hub H1, entry heroes |
| `display-md` | Bebas | 2.25rem / 1 | 0.02em | Result headlines |
| `display-sm` | Bebas | 1.5rem / 1 | 0.04em | Wordmarks, stat values |
| `title-lg` | Inter 700 | 1.25rem / 1.3 | 0 | Card titles (Hub/menu) |
| `title` | Inter 700 | 0.875rem / 1.3 | 0 | Context-card titles |
| `body` | Inter 400–500 | 0.875rem / 1.5 | 0 | Default |
| `body-lg` | Inter 400 | 1rem / 1.5 | 0 | Inputs (iOS 16px floor), intros |
| `caption` | Inter 500 | 0.75rem / 1.4 | 0 | Hints, meta |
| `overline` | Inter 500–600 | 0.75rem / 1.2, uppercase | 0.1em | Section labels |
| `overline-sm` | Inter 500 | 0.625rem / 1.2, uppercase | 0.05em | Stat labels, chips |

**Why:** today's screens use ~14 ad-hoc size/weight combos that mostly cluster around these 11 — tokenising collapses the outliers instead of inventing a new look. The two `clamp()` display sizes replace breakpoint pairs (`text-8xl md:text-9xl`) with fluid scaling, which is both smoother on mid-size phones and one less decision per hero. `body-lg` at 1rem is deliberately named as *the input size* so the 16px iOS anti-zoom floor becomes a rule with a name, not folklore. `overline` codifies the product's signature label style so it can never half-apply (today tracking varies between `tracking-wide` and `tracking-widest`).

---

## 3. Spacing

Tailwind's 4px scale stays; tokens fix the *composition* decisions:

| Token | Value | Use |
|---|---|---|
| `space-page-x` | 1rem (16px) | Page horizontal padding |
| `space-page-y` | 2rem (32px) | Play-screen top/bottom |
| `space-section` | 1.5rem (24px) | Between anatomy slots (header→toggle→card→board…) |
| `space-card-x` / `space-card-y` | 1.25rem / 1rem | Card interiors |
| `space-row` | 0.625rem (10px) | List-row vertical padding |
| `space-gap` | 0.5rem (8px) | Grid/tile gaps |
| `space-gap-sm` | 0.375rem (6px) | Dense boards (Wordle tiles, squad slots) |

**Why:** the audit's "rhythm wobble" (`mb-5` vs `mb-6` alternating per game) exists because every file re-decides the section gap. One named `space-section` ends the wobble and makes the eight-slot anatomy mechanical: each slot ends with the same margin. The rest are the values the majority of screens already use — tokenising the winner, deprecating the variants.

---

## 4. Border radii

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | Chips, badges, keyboard keys |
| `radius-md` | 8px | Inline buttons, toggle segments, small tiles |
| `radius-lg` | 12px | Cards, inputs, board cells, full-width buttons |
| `radius-xl` | 16px | Modals, hero cards |
| `radius-full` | 9999px | Icon buttons, life dots, pills |

**Why:** five steps, each mapped to a component class, replacing today's per-file choice among `md/lg/xl/2xl` (audit: same primary button ships two radii). Values match the current mode (`rounded-xl`=12px is today's card radius) so the change is consolidation, not restyling.

---

## 5. Shadows

| Token | Value | Use |
|---|---|---|
| `shadow-float` | `0 12px 32px -8px rgb(0 0 0 / 0.6)` | Dropdowns, popovers |
| `shadow-modal` | `0 24px 64px -12px rgb(0 0 0 / 0.7)` | Modals |
| `shadow-glow` | `0 0 24px -4px var(--accent)` at 25–40% | *Moments only*: active player, selected cell, checkout zone |

**Why:** on a near-black canvas, grey drop shadows are nearly invisible — depth here comes from the surface ladder + borders (design-system.md §5), so we need only two real shadows (both for floating layers, replacing scattered `shadow-2xl`). `shadow-glow` is the premium differentiator: accent-driven light is how a "floodlit" moment reads, and tokenising it with an explicit *moments-only* rule keeps it special.

---

## 6. Motion durations

| Token | Value | Use |
|---|---|---|
| `duration-instant` | 100ms | Acknowledgement (tile pop, press) |
| `duration-fast` | 180ms | Hovers, fades, overlay entrances |
| `duration-base` | 280ms | Standard reveals (clue, score pop) |
| `duration-slow` | 420ms | Verdicts (shake, cell reveal, flip half) |
| `duration-dramatic` | 650ms | Celebrations, history flashes |
| `delay-result` | 2500ms | Board-settle → result modal (product signature) |

**Why:** today's eleven keyframes use nine distinct durations (100–700ms) that cluster exactly around these five stops — the scale legitimises the cluster and forbids the ninth one-off. Naming `delay-result` protects the product's most important timing constant, currently a magic `2500` repeated in eight files.

## 7. Easing

| Token | Value | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Default: entrances, reveals |
| `ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Overlay/card entrances (the "settle") |
| `ease-swing` | `ease-in-out` | Loops & round-trips: shake, pulse, flip |

**Why:** three curves cover every existing animation (motion-system.md §4). `ease-spring` is already the modal's curve — promoting it to a token spreads the best-feeling entrance in the product to every overlay for free.

## 8. Z-index

| Token | Value | Layer |
|---|---|---|
| `z-board` | 0 | Play surface |
| `z-dropdown` | 10 | Suggestion lists |
| `z-sticky` | 20 | Floating chrome (language switcher) |
| `z-overlay` | 30 | Confirm dialogs, answer popovers |
| `z-modal` | 40 | ResultModal |
| `z-toast` | 50 | Toasts/announcements |

**Why:** current values are assigned per-file and the audit found a real collision (LanguageSwitcher and ResultModal both 40 — the switcher can float over the end-of-game sheet). The fix falls out of the naming: the switcher is *sticky chrome* (20), so it can never outrank a modal again. Six named layers is the full stacking story of this product; a seventh needs a design review by definition.

---

## 9. Component sizes

| Token | Value | Applies to |
|---|---|---|
| `size-touch` | 44px | Minimum hit area, all interactive elements |
| `size-input` | 52px | GuessInput height |
| `size-btn-lg` | 48px | Full-width actions (submit, give up) |
| `size-btn` | 40px | Inline buttons (44px hit via padding) |
| `size-btn-sm` | 32px | Compact controls (toggle segments — padded to 44px hit) |
| `size-icon-btn` | 40px | Round icon buttons (share row) |
| `size-key` | 40×46px min | On-screen keyboard keys |
| `size-icon-inline` / `-card` / `-hero` | 20 / 30 / 40px | Icon tiers |
| `size-cell` | 64–80px | Board cells (pyramid, TTT min) |
| `container-game` | 32rem | The game column (`max-w-lg`, unchanged) |
| `container-entry` | 42rem | Entry/menu screens |
| `container-hub` | 64rem | Hub grid |

**Why:** `size-touch` is the token that turns the audit's touch-target failures (ModeToggle ~26px, Wordle keys 32px wide, switcher) into lint-able violations rather than opinions. The container trio names the layout system that already exists implicitly, so "which max-width?" stops being answered per-file. Input/button heights encode the current best examples (the `py-3.5` input ≈ 52px) so every game converges on the tallest, most thumb-friendly variants already shipping.

---

## 10. Adoption rules

1. Components reference tokens only — a raw hex, ms value, or z-index in a component is a review blocker.
2. Token changes happen in one PR, alone: `tailwind.config.js` + `:root` block + this doc updated together.
3. Migration order (pending approval): tokens land → shared components extracted against them (component-library.md §8) → per-game sweep in the audit's league-table order (worst first).
4. Deletions that ride along with the token PR because they're pure debt: `src/App.css` (dead Vite template), the `#0a0a0a` theme-color (→ `pitch`), the `bg-gray-950` route loader (→ `pitch`).
