const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',

        accent: 'var(--color-primary)',

        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',

        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-soft': 'var(--bg-soft)',

        'border-soft': 'var(--border-soft)',
        'border-muted': 'var(--border-muted)',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-primarys': { color: 'var(--color-primary)' },
        '.text-secondary': { color: 'var(--text-secondary)' },

        '.bg-primary': { 'background-color': 'var(--bg-primary)' },
        '.bg-secondary': { 'background-color': 'var(--bg-secondary)' },
        '.bg-secondary-light': { 'background-color': 'var(--bg-elevated)' },
        '.bg-accent': { 'background-color': 'var(--color-primary)' },
      }, { variants: ['responsive', 'hover'] })
    })
  ],
};
