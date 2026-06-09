/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-black': '#050505',
        'panel-dark': '#121212',
        'panel-border': '#2a2a2a',
        'sw-yellow': '#ffe81f',
        'jedi-blue': '#15f2fd',
        'jedi-green': '#2FF924',
        'sith-red': '#EB212E',
        'windu-purple': '#9B1966',
        'surface-light': '#000000',
        'text-secondary': '#94A3B8',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}