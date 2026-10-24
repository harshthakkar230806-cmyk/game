/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { primary: '#22d3ee', accent: '#a781fa', danger: '#f87171', space: '#0f172a', dark: '#020617' } } },
  plugins: []
};
