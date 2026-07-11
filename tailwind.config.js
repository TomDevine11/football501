/** @type {import('tailwindcss').Config} */

// Floodlight design tokens — the single vocabulary for every screen.
// Contract: docs/design-tokens.md. Components reference tokens only;
// raw hex / ms / z-index values in a component are a review blocker.

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── The night ladder (deep violet-navy — the Triviverse canvas)
        canvas: {
          DEFAULT: '#0b0a14', //  page base (bottom of the ambient gradient)
          high: '#151024', //     top of the ambient gradient (.tv-scene)
        },
        surface: '#16151f', //    chips, small panels
        card: 'rgb(22 21 33 / 0.85)', // lineup/player cards (slightly translucent)
        board: '#100e1c', //      board interiors (the pitch; .tv-board adds the glow)
        border: {
          DEFAULT: '#262433', //  chips, small panels
          strong: '#2c2947', //   boards, cards
        },
        inert: '#3a3846', //      unlit states: empty form dots, unfilled trackers
        dim: '#4a4758', //        disabled-ish text ("no streak" dash)

        // ── Text ladder (muted is 5.4:1 on surface — AA with margin; faint is decorative only)
        primary: '#ecebf2',
        secondary: '#b9b8c6',
        muted: '#8c89a3',
        faint: '#57536e',

        // ── Brand (Triviverse purple) & semantics — fixed across all pages.
        // Purple = brand/primary action/focus/ready. Green = correct/FT. Red = wrong. Amber = streaks/warnings.
        brand: {
          DEFAULT: '#7c3aed',
          hover: '#8b5cf6',
          strong: '#6d28d9',
          bright: '#a78bfa',
          tint: 'rgb(124 58 237 / 0.16)',
        },
        success: {
          DEFAULT: '#22c55e',
          strong: '#16a34a',
          bright: '#4ade80',
        },
        danger: {
          DEFAULT: '#ef4444',
          strong: '#dc2626',
          bright: '#f87171',
        },
        warn: {
          DEFAULT: '#fbbf24',
          strong: '#d97706',
        },

        // ── Game accents: vivid, one per game. Allowed slots only: motif icon,
        // small badge, progress indicator, subtle gradient, hover state.
        // Bare `accent` resolves to the current game's CSS variables, set once at
        // each game's route root; defaults to brand purple (see :root in index.css).
        accent: {
          DEFAULT: 'var(--accent)',
          bright: 'var(--accent-bright)',
          tint: 'var(--accent-tint)',
          tenable: { DEFAULT: '#eab308', bright: '#facc15', tint: 'rgb(234 179 8 / 0.12)' },
          wordle: { DEFAULT: '#3b82f6', bright: '#60a5fa', tint: 'rgb(59 130 246 / 0.12)' },
          tictactoe: { DEFAULT: '#6366f1', bright: '#818cf8', tint: 'rgb(99 102 241 / 0.12)' },
          teammates: { DEFAULT: '#ec4899', bright: '#f472b6', tint: 'rgb(236 72 153 / 0.12)' },
          careers: { DEFAULT: '#06b6d4', bright: '#22d3ee', tint: 'rgb(6 182 212 / 0.12)' },
          wcsquads: { DEFAULT: '#f59e0b', bright: '#fbbf24', tint: 'rgb(245 158 11 / 0.12)' },
          connections: { DEFAULT: '#14b8a6', bright: '#2dd4bf', tint: 'rgb(20 184 166 / 0.12)' },
          higherlower: { DEFAULT: '#f97316', bright: '#fb923c', tint: 'rgb(249 115 22 / 0.12)' },
          501: { DEFAULT: '#ef4444', bright: '#f87171', tint: 'rgb(239 68 68 / 0.12)' },
        },

        // X/O are game pieces, not UI — exempt from the accent rule
        mark: {
          x: '#f87171',
          o: '#60a5fa',
        },
        // Wordle letter verdicts (board pieces, shared by tiles + keyboard)
        tile: {
          hit: '#16a34a', //  right letter, right spot
          near: '#ca8a04', // right letter, wrong spot
          miss: '#26243a', // not in the word
        },
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Arial Black', 'sans-serif'],
      },

      // Display sizes pair with `font-display`; overlines also need `uppercase`.
      fontSize: {
        'display-xl': ['clamp(5rem, 20vw, 8rem)', { lineHeight: '0.9', letterSpacing: '0.02em' }],
        'display-lg': ['clamp(3rem, 10vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1', letterSpacing: '0.02em' }],
        'display-sm': ['1.5rem', { lineHeight: '1', letterSpacing: '0.04em' }],
        'title-lg': ['1.25rem', { lineHeight: '1.3' }],
        title: ['0.875rem', { lineHeight: '1.3' }],
        body: ['0.875rem', { lineHeight: '1.5' }],
        'body-lg': ['1rem', { lineHeight: '1.5' }], // input size — 16px iOS anti-zoom floor
        caption: ['0.75rem', { lineHeight: '1.4' }],
        overline: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.1em' }],
        'overline-sm': ['0.625rem', { lineHeight: '1.2', letterSpacing: '0.05em' }],
      },

      spacing: {
        // Composition rhythm
        'page-x': '1rem',
        'page-y': '2rem',
        section: '1.5rem',
        'card-x': '1.25rem',
        'card-y': '1rem',
        row: '0.625rem',
        gap: '0.5rem',
        'gap-sm': '0.375rem',
        // Component sizes (size-touch is the minimum hit area for anything interactive)
        touch: '2.75rem', //  44px
        input: '3.25rem', //  52px
        'btn-lg': '3rem', //  48px
        btn: '2.5rem', //     40px (44px hit via padding)
        'btn-sm': '2rem', //  32px (padded to 44px hit)
        'icon-btn': '2.5rem',
        'key-w': '2.5rem', // on-screen keyboard keys, 40×46 minimum
        'key-h': '2.875rem',
        'icon-inline': '1.25rem',
        'icon-card': '1.875rem',
        'icon-hero': '2.5rem',
        cell: '4rem', //      board cells 64–80px
        'cell-lg': '5rem',
      },

      maxWidth: {
        game: '32rem', //  the game column (= max-w-lg, non-negotiable)
        entry: '42rem', // entry/menu screens
        hub: '64rem', //   Hub grid
      },

      // Radii live as --radius-* CSS variables (see index.css). Tailwind's own
      // scale already matches the token values, so use it directly:
      //   radius-sm 6px = rounded-md · radius-md 8px = rounded-lg
      //   radius-lg 12px = rounded-xl · radius-xl 16px = rounded-2xl
      // (Remapping rounded-sm/md/lg/xl keys would restyle existing markup.)

      boxShadow: {
        // Raised surfaces: soft ambient shadow + 1px top edge highlight (the "rim light")
        panel: 'inset 0 1px 0 0 rgb(255 255 255 / 0.05), 0 8px 24px -12px rgb(0 0 0 / 0.55)',
        'panel-hover': 'inset 0 1px 0 0 rgb(255 255 255 / 0.07), 0 16px 40px -16px rgb(0 0 0 / 0.65)',
        float: '0 12px 32px -8px rgb(0 0 0 / 0.6)',
        modal: '0 24px 64px -12px rgb(0 0 0 / 0.7)',
        // Gameplay verdict moments ONLY (checkout zone, active player) — never decoration or hover
        glow: '0 0 24px -4px color-mix(in srgb, var(--accent) 35%, transparent)',
      },

      transitionDuration: {
        instant: '100ms',
        fast: '180ms',
        base: '280ms',
        slow: '420ms',
        dramatic: '650ms',
      },
      transitionDelay: {
        result: '2500ms', // board-settle → result modal; JS twin in src/utils/motion.js
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)', // overlay/card entrances — the "settle"
        swing: 'ease-in-out', // loops & round-trips: shake, pulse, flip
      },

      zIndex: {
        board: '0',
        dropdown: '10',
        sticky: '20', // floating chrome (language switcher) — must never outrank a modal
        overlay: '30',
        modal: '40',
        toast: '50',
      },
    },
  },
  plugins: [],
}
