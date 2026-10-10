export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#0f766e',
          600: '#0d5d59',
          700: '#0d4c59',
          900: '#102a43',
        },
        accent: {
          100: '#d1fae5',
          500: '#34d399',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
