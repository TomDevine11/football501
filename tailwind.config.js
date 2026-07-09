/** @type {import('tailwindcss').Config} */

// Floodlight design tokens — the single vocabulary for every screen.
// Contract: docs/design-tokens.md. Components reference tokens only;
// raw hex / ms / z-index values in a component are a review blocker.

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── The canvas ladder (violet-cast graphite; never use gray-* for surfaces)
        canvas: '#0a0a10',
        'canvas-deep': '#060609',
        surface: {
          DEFAULT: '#12121a',
          raised: '#1a1a24',
          high: '#232330',
          glass: 'rgb(18 18 26 / 0.72)', // translucent card fill over the atmosphere layer
        },
        border: {
          DEFAULT: '#1f1f2b',
          strong: '#30303f',
        },

        // ── Text ladder (muted is 5.5:1 on surface — AA with margin; faint is large/decorative only)
        primary: '#f4f4f8',
        secondary: '#a9a9bc',
        muted: '#8a8a9c',
        faint: '#5d5d70',

        // ── Brand (Triviverse purple) & semantics — fixed across all games.
        // Purple = brand/primary action/focus. Green = correct only. Red = wrong. Amber = warn.
        brand: {
          DEFAULT: '#8b5cf6',
          strong: '#7c3aed',
          bright: '#a78bfa',
          tint: 'rgb(139 92 246 / 0.12)',
        },
        success: {
          DEFAULT: '#16a34a',
          strong: '#15803d',
          bright: '#4ade80',
        },
        danger: {
          DEFAULT: '#dc2626',
          bright: '#f87171',
        },
        warn: {
          DEFAULT: '#d97706',
          bright: '#fbbf24',
        },

        // ── Game accents: recognition marks, not identities. Allowed slots only:
        // icon, small badge, progress indicator, subtle gradient, hover state.
        // Bare `accent` resolves to the current game's CSS variables, set once at
        // each game's route root; defaults to brand purple (see :root in index.css).
        accent: {
          DEFAULT: 'var(--accent)',
          bright: 'var(--accent-bright)',
          tint: 'var(--accent-tint)',
          tenable: { DEFAULT: '#c6a953', bright: '#d5bd76', tint: 'rgb(198 169 83 / 0.10)' },
          wordle: { DEFAULT: '#6992d3', bright: '#8eaee1', tint: 'rgb(105 146 211 / 0.10)' },
          tictactoe: { DEFAULT: '#797ad8', bright: '#9698e3', tint: 'rgb(121 122 216 / 0.10)' },
          teammates: { DEFAULT: '#cd709e', bright: '#dc93b8', tint: 'rgb(205 112 158 / 0.10)' },
          careers: { DEFAULT: '#47afc2', bright: '#6bc2d1', tint: 'rgb(71 175 194 / 0.10)' },
          wcsquads: { DEFAULT: '#cb9d4d', bright: '#dab472', tint: 'rgb(203 157 77 / 0.10)' },
          connections: { DEFAULT: '#47aea2', bright: '#64c4b9', tint: 'rgb(71 174 162 / 0.10)' },
          higherlower: { DEFAULT: '#cf8a59', bright: '#dda67e', tint: 'rgb(207 138 89 / 0.10)' },
          501: { DEFAULT: '#cf6e6e', bright: '#dd9292', tint: 'rgb(207 110 110 / 0.10)' },
        },

        // X/O are game pieces, not UI — exempt from the accent rule
        mark: {
          x: '#f87171',
          o: '#60a5fa',
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
