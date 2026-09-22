/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Flexo Soft Medium"', 'system-ui', 'sans-serif'],
        mono: ['"Flexo Soft Medium"', 'system-ui', 'sans-serif'],
      },
      colors: {
        app: {
          bg: '#080B11',
          panel: '#0F131C',
          border: '#1E293B',
          text: '#CBD5E1',
          gold: '#D4AF37',
          goldHover: '#FDE08B',
          cover: '#2b1d14',
        },
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
        court: {
          dark: '#05080f',
          darkSec: '#08111f',
          gold: '#c5a059',
          goldLight: '#dfbe7e',
          lightBg: '#f6f8fb',
          lightSurface: '#ffffff',
          lightText: '#0b1b33',
        }
      },
      boxShadow: {
        'theme-glow': 'var(--glow-gold)',
        'theme-card': 'var(--card-shadow)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(2rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
