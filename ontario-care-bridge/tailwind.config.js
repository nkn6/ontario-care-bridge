/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0d2d4d',
          800: '#123d62',
          700: '#1a4f7d',
        },
        accent: {
          teal: '#0f8a8a',
          mint: '#87d7b7',
          green: '#79c7a4',
        },
        neutral: {
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#dfe8f0',
          300: '#c9d5df',
          600: '#536b7c',
          700: '#30475a',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(13, 45, 77, 0.10)',
      },
    },
  },
  plugins: [],
};
