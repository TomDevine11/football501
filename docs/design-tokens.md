# Design Tokens — Triviverse v2

The single vocabulary every screen is built from. **Implemented**: `tailwind.config.js` `theme.extend` + the `:root` CSS-variable block in `src/index.css` + the `.tv-*` scene utilities. This document is the contract — token changes update config, `:root`, and this doc together. Components reference tokens only; raw hex/ms/z-index values in components are review blockers.

Reference implementation: `src/pages/Hub.jsx` (zero raw values).

---

## 1. Colour

### 1.1 The night ladder (neutrals)

| Token | Value | Use |
|---|---|---|
| `canvas` | `#0b0a14` | Page base; bottom of the `.tv-scene` gradient; scrollbar track; `theme-color` meta |
| `canvas-high` | `#151024` | Top of the `.tv-scene` gradient |
| `surface` | `#16151f` | Chips, small panels |
| `card` | `rgb(22 21 33 / 0.85)` | Lineup/player cards (slightly translucent over the board) |
| `board` | `#100e1c` | Board interiors (`.tv-board` adds the brand-light breath) |
| `border` | `#262433` | Chip/panel borders |
| `border-strong` | `#2c2947` | Board and card borders |
| `inert` | `#3a3846` | Unlit states: empty form dots, unfilled tracker segments |
| `dim` | `#4a4758` | Disabled-ish text ("no streak" dash) |

### 1.2 Text ladder

| Token | Value | Contrast on `surface` | Use |
|---|---|---|---|
| `primary` | `#ecebf2` | 15.3:1 | Headings, names, values |
| `secondary` | `#b9b8c6` | 9.2:1 | Supporting copy |
| `muted` | `#8c89a3` | 5.4:1 | Labels, hints, meta — the AA floor for body text |
| `faint` | `#57536e` | 2.5:1 — **decorative/large only, never body text** | Footnotes at display sizes, dividers |

### 1.3 Brand & semantics (fixed across all pages)

| Token | Value | Use |
|---|---|---|
| `brand` | `#7c3aed` | Primary buttons, KICK OFF/READY states, active chrome |
| `brand-hover` | `#8b5cf6` | Button hover |
| `brand-strong` | `#6d28d9` | Pressed/deep fills |
| `brand-bright` | `#a78bfa` | Brand text on dark, focus outlines, the FOOTBALL half of the lockup |
| `brand-tint` | `rgb(124 58 237 / 0.16)` | Brand fills/washes |
| `success` / `-strong` / `-bright` | `#22c55e` / `#16a34a` / `#4ade80` | Correct, FT, win dots — nothing else |
| `danger` / `-strong` / `-bright` | `#ef4444` / `#dc2626` / `#f87171` | Wrong, losses, lives, give-up |
| `warn` / `-strong` | `#fbbf24` / `#d97706` | Streak flames, perfect-day star, urgency |

### 1.4 Game accents (vivid — recognition marks only)

Allowed slots: motif icon, small badge, progress indicator, subtle gradient, hover state. Each with `DEFAULT` / `bright` / `tint` (12% fill). Runtime twin: `src/design/accents.js` (game routes set `--accent`/`--accent-bright`/`--accent-tint` once at their root; bare `accent-*` classes resolve to those variables, defaulting to brand purple).

| Token | Base | Bright | Game |
|---|---|---|---|
| `accent-tenable` | `#eab308` | `#facc15` | Tenable |
| `accent-wordle` | `#3b82f6` | `#60a5fa` | Wordle |
| `accent-tictactoe` | `#6366f1` | `#818cf8` | TicTacToe (indigo — purple is the brand) |
| `accent-teammates` | `#ec4899` | `#f472b6` | Teammates |
| `accent-careers` | `#06b6d4` | `#22d3ee` | Career Path |
| `accent-wcsquads` | `#f59e0b` | `#fbbf24` | WC Squads |
| `accent-connections` | `#a3e635` | `#bef264` | Connections (volt) |
| `accent-higherlower` | `#f97316` | `#fb923c` | Higher/Lower |
| `accent-501` | `#ef4444` | `#f87171` | 501 |

X/O glyphs in TicTacToe 1v1 remain game pieces (`mark-x #f87171` / `mark-o #60a5fa`), exempt from the accent rule.

## 2. Scene utilities (`index.css`)

| Utility | What it paints |
|---|---|
| `.tv-scene` | `linear-gradient(160deg, canvas-high 0%, canvas 60%)` — every page wrapper |
| `.tv-board` | brand-light breath over `board` — every play surface |
| `.tv-wordmark` | white→`brand-bright` gradient clipped to text — wordmarks, matchday numbers |

## 3. Typography

Bebas Neue (`.score-number` / `font-display`) for scoreboard voice; Inter (`font-sans`) for UI. The named sizes (`display-xl` … `overline-sm`) in `tailwind.config.js` are unchanged from v1 — see config for the table. Hard rules: `tabular-nums` on changing numbers; Bebas never under ~20px; brand/label caps use black weight + wide tracking.

## 4. Spacing, radii, shadows, z-index, motion

Unchanged from v1 and defined in `tailwind.config.js` / `:root`:

- **Spacing & sizes**: 4px scale + named tokens (`section`, `card-x/y`, `touch` 44px, `input` 52px, containers `game`/`entry`/`hub`).
- **Radii**: `--radius-sm/md/lg/xl` (6/8/12/16px) — use Tailwind's matching `rounded-md/lg/xl/2xl`.
- **Shadows**: `panel`, `panel-hover`, `float`, `modal`; `glow` for gameplay verdict moments only.
- **Z-index**: `board 0 · dropdown 10 · sticky 20 · overlay 30 · modal 40 · toast 50`.
- **Motion**: `--duration-instant/fast/base/slow/dramatic` (100/180/280/420/650ms), `--ease-out/spring`, `--delay-result` 2500ms (JS twin `RESULT_REVEAL_DELAY_MS`). Grammar in [motion-system.md](./motion-system.md).

## 5. Retention constants

Live in `src/data/dailyStats.js`, not CSS: `PTS_PLAY 10 · PTS_WIN 25 · PTS_STREAK_PER 5 · PTS_STREAK_CAP 25 · PERFECT_MULT 2`; `MATCHDAY_EPOCH` in `dailyStats.js`. Tune there only.
