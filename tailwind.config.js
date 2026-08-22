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
      }
    },
  },
  plugins: [],
};
