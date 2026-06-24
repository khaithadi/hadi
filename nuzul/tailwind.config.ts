import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Original Nuzul identity — deep teal + warm sand (NOT the competitor palette)
        brand: {
          50: '#eefcfb',
          100: '#d5f6f3',
          200: '#aeece8',
          300: '#79ddd8',
          400: '#3fc4c0',
          500: '#1aa7a4',
          600: '#0f8585',
          700: '#106a6b',
          800: '#125455',
          900: '#134647',
          950: '#04282a',
        },
        sand: {
          50: '#faf7f2',
          100: '#f2ebdf',
          200: '#e4d5bf',
          300: '#d3b896',
          400: '#c19a6e',
          500: '#b4854f',
        },
        ink: '#13201f',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,40,42,.06), 0 8px 24px rgba(16,40,42,.08)',
      },
    },
  },
  plugins: [],
};

export default config;
