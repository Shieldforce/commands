/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gh: {
          dark:    '#0d1117',
          surface: '#161b22',
          border:  '#30363d',
          muted:   '#8b949e',
          text:    '#e6edf3',
          green:   '#3fb950',
          blue:    '#58a6ff',
          orange:  '#f0883e',
          red:     '#f85149',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
