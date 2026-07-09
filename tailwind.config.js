/** @type {import('tailwindcss').Config} */

// Floodlight design tokens — the single vocabulary for every screen.
// Contract: docs/design-tokens.md. Components reference tokens only;
// raw hex / ms / z-index values in a component are a review blocker.

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── The pitch ladder (green-tinted neutrals; never use gray-* for surfaces)
        pitch: '#080c08',
        'pitch-deep': '#050705',
        surface: {
          DEFAULT: '#101510',
          raised: '#1a211a',
          high: '#242c24',
        },
        border: {
          DEFAULT: '#1e241e',
          strong: '#2e372e',
        },

        // ── Text ladder (muted is tuned to pass AA on pitch; faint is large/decorative only)
        primary: '#f5f7f5',
        secondary: '#a8b3a8',
        muted: '#788378', // 4.68:1 on surface, 4.99:1 on pitch — the AA floor for body text
        faint: '#586158',

        // ── Brand & semantics (fixed across all games)
        brand: {
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

        // ── Game accents (identity, not semantics — correct/wrong stays green/red).
        // Bare `accent` resolves to the current game's CSS variables, set once at
        // each game's route root; defaults to brand green (see :root in index.css).
        accent: {
          DEFAULT: 'var(--accent)',
          bright: 'var(--accent-bright)',
          tint: 'var(--accent-tint)',
          tenable: { DEFAULT: '#eab308', bright: '#facc15', tint: 'rgb(234 179 8 / 0.12)' },
          wordle: { DEFAULT: '#3b82f6', bright: '#60a5fa', tint: 'rgb(59 130 246 / 0.12)' },
          tictactoe: { DEFAULT: '#a855f7', bright: '#c084fc', tint: 'rgb(168 85 247 / 0.12)' },
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
        float: '0 12px 32px -8px rgb(0 0 0 / 0.6)',
        modal: '0 24px 64px -12px rgb(0 0 0 / 0.7)',
        // Moments only: active player, selected cell, checkout zone — never static decoration
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
