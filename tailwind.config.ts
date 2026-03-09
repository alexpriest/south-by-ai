import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        primary: '#FF6B35',
        accent: '#00D4AA',
        'accent-readable': 'var(--accent-readable)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--text-secondary)',
        muted: 'var(--color-muted)',
        surface: 'var(--color-surface)',
        s1: 'var(--surface-1)',
        s2: 'var(--surface-2)',
        sh: 'var(--surface-hover)',
        sa: 'var(--surface-active)',
        ss: 'var(--surface-subtle)',
        b1: 'var(--border-1)',
        b2: 'var(--border-2)',
        bh: 'var(--border-hover)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        caption: ['11px', { lineHeight: '16px' }],
        micro: ['10px', { lineHeight: '14px' }],
      },
    },
  },
  plugins: [],
}
export default config
