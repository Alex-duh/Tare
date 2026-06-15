import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ig: {
          purple: '#833ab4',
          pink: '#e1306c',
          red: '#fd1d1d',
          orange: '#f77737',
          yellow: '#fcb045',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ig-gradient': 'linear-gradient(135deg, #833ab4 0%, #e1306c 40%, #fd1d1d 65%, #fcb045 100%)',
        'ig-gradient-text': 'linear-gradient(90deg, #833ab4, #e1306c, #fcb045)',
      },
      animation: {
        'blob-1': 'blob1 18s ease-in-out infinite',
        'blob-2': 'blob2 22s ease-in-out infinite',
        'blob-3': 'blob3 26s ease-in-out infinite',
        'blob-4': 'blob4 20s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob1: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(8%, -12%) scale(1.1)' },
          '66%': { transform: 'translate(-6%, 8%) scale(0.95)' },
        },
        blob2: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(-10%, 10%) scale(1.05)' },
          '66%': { transform: 'translate(12%, -6%) scale(0.9)' },
        },
        blob3: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(6%, 14%) scale(0.95)' },
          '66%': { transform: 'translate(-8%, -10%) scale(1.1)' },
        },
        blob4: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '50%': { transform: 'translate(-12%, -8%) scale(1.08)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
