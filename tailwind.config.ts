import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#c9941a',
          light: '#f0c040',
          pale: '#fdf6e3',
        },
        brand: {
          dark: '#1a1208',
          brown: '#6b3a1f',
        },
      },
    },
  },
  plugins: [],
};

export default config;
