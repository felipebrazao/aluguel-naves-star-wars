/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flyonui/dist/js/*.js" // Lê os componentes JS do FlyonUI
  ],
  theme: {
    extend: {
      colors: {
        'space-black': '#050505',
        'panel-dark': '#121212',
        'panel-border': '#2a2a2a',
        'sw-yellow': '#ffe81f',
        'jedi-blue': '#2E67F8',
        'jedi-green': '#2FF924',
        'sith-red': '#EB212E',
        'windu-purple': '#9B1966',
        'surface-light': '#000000',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [
    require("flyonui"), // Habilita os componentes visuais
    require("flyonui/plugin") // Habilita a interatividade JavaScript (Modais, Dropdowns, etc)
  ],
}