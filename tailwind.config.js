/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        hebrew: ['"Frank Ruhl Libre"', '"David Libre"', 'serif'],
      },
    },
  },
  plugins: [],
}
