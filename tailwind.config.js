/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d0d0d',
        card: '#1a1010',
        'card-alt': '#151515',
        border: '#2a2020',
        accent: '#e85d04',
        'accent-2': '#f48c06',
        muted: '#888',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
