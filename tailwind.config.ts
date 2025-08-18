export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent-9))',
          fg: 'hsl(var(--accent-contrast))',
        },
        gray: {
          1: 'hsl(var(--gray-1))',
          2: 'hsl(var(--gray-2))',
          6: 'hsl(var(--gray-6))',
          11: 'hsl(var(--gray-11))',
        },
      },
    },
  },
  plugins: [],
};
