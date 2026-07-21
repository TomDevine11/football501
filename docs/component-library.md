# Component Library

The building blocks of every screen. Part of the [Floodlight design system](./design-system.md).

Two categories below:
- **Shipped** — exists in `src/components/` today.
- **Canonical (to extract)** — a pattern that exists as copy-paste in multiple games and must become a shared component before it drifts further. Specs here are the contract for that extraction.

A new screen must be assembled from these parts. If a part is missing, add it *here* first.

---

## 1. Layout

### 1.1 `GameLayout` — canonical (to extract)
The page shell used (by hand) in every game: `min-h-screen flex flex-col items-center px-4 py-8` with children constrained to the **game column** (`w-full max-w-lg`).
- Props: `children`, optional `wide` (entry/menu screens, `max-w-2xl`).
- Centres vertically (`justify-center py-12`) only for menu/entry/result-less screens; play screens are top-aligned so the board doesn't jump as content grows.

### 1.2 `GameHeader` — canonical (to extract)
The three-slot header row currently copy-pasted in all 11 game screens:
```
[back link]        [WORDMARK]        [status]
```
- **Back link**: muted text link (`text-gray-600 hover:text-gray-400 text-sm`), label "← All games" / "Modes" / "Change stat" depending on context.
- **Wordmark**: display face (`.score-number text-xl`), muted, tracked; the game's accent tint at low intensity once tokens land. Always i18n (Tenable's is hardcoded today).
- **Status slot**: right-aligned, `tabular-nums` — lives, guess count, score, or a `w-16` spacer to keep the wordmark centred.
- Spacing below: one section gap (see design-system.md §4.3) — today it wobbles between `mb-5` and `mb-6`.

### 1.3 `ContextCard` — canonical (to extract)
The "what is this puzzle" card under the toggle: `surface` card, `rounded-xl px-5 py-4`, bold sm title + muted xs subtitle, optional leading icon (`CategoryIcon`, 30px). Used by every game; centred text in most, left + icon in Tenable/501.

---

## 2. Controls

### 2.1 Buttons — canonical (to extract as `Button`)
Current ad-hoc variants converge on four:

| Variant | Style | Use |
|---|---|---|
| `primary` | Solid brand green (`bg-green-700 hover:bg-green-600`), white semibold | The one main action per view |
| `secondary` | Solid neutral (`bg-gray-800 hover:bg-gray-700`) | Menu, cancel, alternate action |
| `ghost` | 1px neutral border, muted text, hover fill | Skip, shuffle, deselect |
| `danger-ghost` | 1px red border, red text, hover red tint | Give up & reveal (full-width, product signature) |

Sizes: `sm` (px-4 py-2, text-sm), `md` (px-5 py-2.5, text-sm — default), `lg` (full-width py-3–3.5 — board-width actions). Radius: `lg` inline, `xl` full-width. All get `focus-visible` accent ring and active scale-down (98%) once tokens land.

### 2.2 `ModeToggle` — shipped (`src/components/ModeToggle.jsx`)
Daily ⇄ Unlimited segmented control. Pill container on `surface`, active segment `bg-gray-700` white. Appears on every game directly under the header. **Known gap:** ~26px tall — below the 44px touch target; the redesign enlarges padding without changing the look.

### 2.3 `Pill` — canonical (in `Football501.jsx` today)
Selectable chip: 1px border, `rounded-lg px-3 py-2 text-sm`; selected = accent border + accent tint fill + white text. Used by the 501 custom builder and GridBuilder palette; extract and reuse for any option-picking UI.

### 2.4 `LanguageSwitcher` — shipped
EN/ES pill pair, same anatomy as ModeToggle. Floated `fixed bottom-4` centre on game pages via `GamePage`. **Known gap:** shares `z-40` with ResultModal — must sit *below* modal overlays (see z-index tokens).

---

## 3. Input & search

### 3.1 `GuessInput` — canonical (to extract; the single most duplicated block)
The text field + spinner + suggestion dropdown copy-pasted in **seven** files (501, Tenable, TicTacToe solo & versus, Teammates, CareerPath, WCSquads):
- Field: `surface`, 1px `border-strong`, `rounded-xl px-4 py-3.5`, base text (≥16px — iOS zoom guard), placeholder muted, focus border brand green.
- Loading: 16px spinner, absolute right, brand-green top arc.
- Dropdown: `surface-raised`, 1px `border-strong`, `rounded-xl`, `shadow-2xl`, `z-dropdown`; rows `px-4 py-2.5`, flag emoji + name (+ optional meta line / position badge), highlighted row = raised fill; `onMouseDown` select (keeps focus), full arrow-key/Enter/Escape handling; outside-mousedown dismiss.
- Wrong-guess shake on the whole form (`.shake`).
- ARIA target: `role="combobox"` + `aria-expanded` on the field, `role="listbox"/"option"` in the dropdown (missing everywhere today).
- Data behaviour (search TheSportsDB + local pool, 280ms debounce, abort on change) ships inside the shared hook `usePlayerSuggestions` (already exists in `src/games/tictactoe/usePlayerSuggestions.js` — promote to `src/hooks/`).

### 3.2 Position badge — canonical (in `Football501.jsx` as `POS_META`)
GK/DEF/MID/FWD chip: xs bold, 1px border, tinted fill (yellow/blue/green/red respectively). Reusable anywhere player positions show.

---

## 4. Game state display

### 4.1 `LivesIndicator` — canonical (to extract; currently three competing designs)
Today: red hearts ♥ (Tenable, TicTacToe), grey dots (Connections), plain "N left" text (Teammates, CareerPath). **Converge on one component** with `count`/`max`, rendered as filled/dimmed icons; red for classic lives, with an optional label for guess-based games. Sits in the GameHeader status slot.

### 4.2 `GuessHistory` — canonical (to extract)
The reverse-chronological log: overline label ("GUESSES (12)"), bordered `rounded-xl` container, `divide-y` rows `px-4 py-2.5`, `max-h` + scroll. Row: left = guess text (+ flag/badge), right = verdict (green `#3 ✓` / red `✗` / yellow "Already found" / grey `↷` skipped). New rows flash via `.flash-valid`/`.flash-invalid`.

### 4.3 `InfoBox` / stat tiles — canonical (in `Football501.jsx`)
Small stat card: surface, `rounded-lg`, display-face 2xl value (tone: white/green/amber), 10px overline label. Used for 501's live strategy row; same anatomy as `DailyStats`' `Stat` — unify.

### 4.4 `DailyStats` — shipped (`src/components/DailyStats.jsx`)
4-up stat grid for result modals (Played / Win% or Best / Streak / Max). Display-face numbers, overline labels. Variants: `win`, `score`.

### 4.5 `ScoreDisplay` — 501-specific (stays in-game)
The hero countdown: overline label + display-xl number, colour shifts by range (white → orange → yellow → green as checkout nears), `score-pop` on change, "CHECKOUT ZONE" pulse ≤40. Game-specific, but its colour-by-state pattern is the reference for other hero numbers (Higher/Lower streak should adopt it).

---

## 5. Overlays

### 5.1 `ResultModal` — shipped (`src/components/ResultModal.jsx`)
The end-of-game sheet: fixed overlay `bg-black/70 backdrop-blur-sm`, scrollable, centred card `max-w-md` `surface` `rounded-2xl shadow-2xl`, close ✕ top-right, backdrop click closes. Content slots by convention (see game-design.md §5): emoji/icon hero → display-md headline → supporting line → `DailyStats` → `ShareCard` → primary action → `MoreGames` → optional full-answer list.
**Known gaps:** no Escape-to-close, no focus trap, no `aria-labelledby`.

### 5.2 `ConfirmDialog` — canonical (duplicated in Tenable + TicTacToe)
Small centred confirm ("Give up?"): `max-w-sm` surface card, title + muted body, two buttons (secondary cancel / danger confirm). Extract; give it the same a11y contract as ResultModal.

### 5.3 Answer-list popover (TicTacToe `answersCell`) — game-specific
Full-answers modal for a finished cell. Fine to keep local, but must use overlay tokens (`z-overlay`, same backdrop treatment).

---

## 6. Social & cross-game

### 6.1 `ShareCard` — shipped (`src/components/ShareCard.jsx`)
Copy-result primary button + native share + WhatsApp/X/Facebook/Instagram round icon buttons + toast. Shared by every result flow. Share-text format contract lives in game-design.md §6.

### 6.2 `MoreGames` — shipped (`src/components/MoreGames.jsx`)
"Try another game" chip grid (icon + shortened title) on every result modal. Also internal-linking SEO. Chips adopt each game's accent tint once tokens land.

### 6.3 `GameIcon`, `CategoryIcon`, `Crest`, `Mark` — shipped
The custom SVG icon tier (see design-system.md §6). `CategoryIcon` resolves club crests / league logos / flags / trophies; `Crest` renders club badges (CareerPath clues); `Mark` renders the X/O glyphs.

---

## 7. Page-level

### 7.1 Hub game card (`src/pages/Hub.jsx`)
Link card: surface + border, `rounded-xl p-6`, 40px `GameIcon` in accent, bold xl title, accent tagline, muted description, → affordance. Hover: accent border + ring. Disabled variant: 60% opacity + "Coming soon" chip.
**Design intent (next redesign):** accent must be present at rest (icon plate/edge glow), not hover-only — see design-audit.md.

### 7.2 Menu option card (501 entry, TicTacToe menu/versus setup, 501 unlimited setup)
Same anatomy as the Hub card but a `<button>`: emoji/icon → bold title → accent sub-line → muted description. Converges with 7.1 into one `OptionCard` when extracted.

### 7.3 `AdSlot` (`src/ads/AdSlot.jsx`)
Reserved ad container (hub footer, game footer). Must never shift layout (fixed min-height) and never sit between the board and the input.

### 7.4 SEO content block (`src/seo/SeoContent.jsx` via `GamePage`)
Below-the-fold how-to/FAQ prose on indexable game pages. Stays in the muted ladder, `max-w-2xl`; it must read as a footer, never as part of the game.

---

## 8. Extraction priority (for the implementation phase)

1. `GuessInput` (+ promote `usePlayerSuggestions`) — 7 copies, highest drift risk
2. `Button` — every screen, unlocks token adoption
3. `GameHeader` + `GameLayout` — 11 copies
4. `ResultModal` a11y upgrade + `ConfirmDialog` — shared overlay contract
5. `LivesIndicator` — visible inconsistency today
6. `GuessHistory`, `ContextCard`, `OptionCard`, `Pill`, stat tile unification
