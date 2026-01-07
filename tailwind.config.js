/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          elevated: 'var(--bg-elevated)',
          surface: 'var(--bg-surface)',
          hover: 'var(--bg-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          muted: 'var(--accent-muted)',
          'muted-solid': 'var(--accent-muted-solid)',
        },
        success: 'var(--success)',
        danger: 'var(--danger)',
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '10px',
      },
      spacing: {
        '4.5': '18px',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      boxShadow: {
        glow: '0 0 20px rgba(249, 115, 22, 0.3)',
      },
    },
  },
  plugins: [],
}
