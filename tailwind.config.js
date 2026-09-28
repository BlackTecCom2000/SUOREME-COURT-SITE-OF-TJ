/** @type {import('tailwindcss').Config} */

// Design tokens live in src/styles/tokens.css. This config only re-exposes them
// to Tailwind so `font-display`, `text-2xs`, `ink-700`, `gold-500` etc. resolve to
// the same custom properties the CSS uses — there is no second palette here.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        // Inter for UI/body (full Cyrillic), Cormorant for display headings,
        // a real monospace for case numbers and citations.
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        // Deliberately NOT the display face: `font-serif` is used on 12-13px
        // card titles where Cormorant's hairline strokes are illegible.
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        '2xs': ['var(--text-2xs)', { lineHeight: '1.45' }],
        xs: ['var(--text-xs)', { lineHeight: '1.5' }],
        sm: ['var(--text-sm)', { lineHeight: '1.55' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-body)' }],
        md: ['var(--text-md)', { lineHeight: '1.55' }],
        lg: ['var(--text-lg)', { lineHeight: '1.5' }],
        xl: ['var(--text-xl)', { lineHeight: '1.4' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-heading)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-heading)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-display)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-display)' }],
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--leading-display)' }],
      },
      letterSpacing: {
        display: 'var(--tracking-display)',
        tight: 'var(--tracking-tight)',
        label: 'var(--tracking-label)',
      },
      maxWidth: {
        prose: 'var(--measure-prose)',
      },
      colors: {
        // Theme roles -> semantic CSS variables (set per light/dark/a11y theme)
        theme: {
          bg: 'var(--bg-primary)',
          bgSec: 'var(--bg-secondary)',
          surface: 'var(--surface-card)',
          surfaceHover: 'var(--surface-card-hover)',
          text: 'var(--text-primary)',
          textSec: 'var(--text-secondary)',
          textMuted: 'var(--text-muted)',
          border: 'var(--border-primary)',
          borderHover: 'var(--border-hover)',
          gold: 'var(--accent-gold)',
          goldDark: 'var(--accent-gold-dark)',
          digital: 'var(--accent-digital)',
        },
        // Court gold ramp
        gold: {
          100: 'var(--gold-100)',
          200: 'var(--gold-200)',
          300: 'var(--gold-300)',
          400: 'var(--gold-400)',
          500: 'var(--gold-500)',
          600: 'var(--gold-600)',
          700: 'var(--gold-700)',
          800: 'var(--gold-800)',
          900: 'var(--gold-900)',
        },
        // Cool ink ramp, matched to the live sky
        ink: {
          50: 'var(--ink-50)',
          100: 'var(--ink-100)',
          200: 'var(--ink-200)',
          300: 'var(--ink-300)',
          400: 'var(--ink-400)',
          500: 'var(--ink-500)',
          600: 'var(--ink-600)',
          700: 'var(--ink-700)',
          800: 'var(--ink-800)',
          900: 'var(--ink-900)',
          950: 'var(--ink-950)',
        },
        // Sky accent, matches the CloudSky background
        sky: {
          300: 'var(--sky-300)',
          400: 'var(--sky-400)',
          500: 'var(--sky-500)',
          600: 'var(--sky-600)',
          700: 'var(--sky-700)',
        },
      },
      boxShadow: {
        'theme-glow': 'var(--glow-gold)',
        'theme-card': 'var(--card-shadow)',
      },
      borderRadius: {
        glass: 'var(--glass-radius-card)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(2rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'rise-in': 'rise-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
