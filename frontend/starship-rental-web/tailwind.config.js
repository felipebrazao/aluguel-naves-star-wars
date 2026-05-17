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
        'rebel-blue': '#00e5ff',
        'empire-red': '#ff3333',
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