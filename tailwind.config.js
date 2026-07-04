/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
        hebrew: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
