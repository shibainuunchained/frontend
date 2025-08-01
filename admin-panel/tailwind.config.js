/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fefdf7',
          100: '#fcf8e8',
          200: '#f8f0c6',
          300: '#f1e494',
          400: '#e8d560',
          500: '#d4af37', // Main gold
          600: '#c19b2a',
          700: '#a17d22',
          800: '#856421',
          900: '#70531f',
        },
        accent: {
          50: '#fff8e1',
          100: '#ffe9b3',
          200: '#ffd966',
          300: '#ffc333',
          400: '#ffb300',
          500: '#ff9100', // Main orange
          600: '#f57c00',
          700: '#e65100',
          800: '#d84315',
          900: '#bf360c',
        },
        dark: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#0a0a0a', // Main dark
        }
      }
    },
  },
  plugins: [],
}