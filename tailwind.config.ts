import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bucin: {
          bg: '#1A1A1A', // Lebih gelap agar warna cerah lebih "pop"
          card: '#2D2D2D',
          text: '#F5F0EB',
          textSecondary: '#E8E8E8',
          gold: '#FFD700', // Gold lebih cerah
          pink: '#FF69B4', // Hot Pink
          rose: '#FF1493', // Deep Pink
          orange: '#FF8C00', // Dark Orange
          hover: '#FF4500', 
          cream: '#FFF8F0',
          navy: '#1B3A4B',
        },
      },
      backgroundImage: {
        'radial-vignette': 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.8) 100%)',
      },
      animation: {
        'typewriter': 'typewriter 2s steps(20) forwards',
        'caret': 'typewriter 2s steps(20) forwards, blink 1s steps(20) infinite 2s',
        'breath': 'breath 3s ease-in-out infinite',
        'film-scroll': 'film-scroll 60s linear infinite',
      },
      keyframes: {
        'film-scroll': {
          '0%': { transform: 'translateY(-50%) translateX(0)' },
          '100%': { transform: 'translateY(-50%) translateX(-50%)' },
        },
        typewriter: {
          to: { left: '100%' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '50.1%, 100%': { opacity: '0' },
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
