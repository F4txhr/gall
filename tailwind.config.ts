import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bucin: {
          bg: '#2D2D2D',
          card: '#4A4A4A',
          text: '#F5F0EB',
          textSecondary: '#E8E8E8',
          gold: '#D4A574',
          hover: '#C97B5A',
          cream: '#FFF8F0',
          navy: '#1B3A4B',
          brown: '#8B6F47',
        },
      },
    },
  },
  plugins: [],
};

export default config;
