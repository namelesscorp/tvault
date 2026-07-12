export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          fg: 'hsl(var(--primary-fg))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          fg: 'hsl(var(--secondary-fg))',
        },
      },
    },
  },
  plugins: [],
};
