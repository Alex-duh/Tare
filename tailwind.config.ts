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
        'blob-1': 'blob1 14s ease-in-out infinite',
        'blob-2': 'blob2 18s ease-in-out infinite',
        'blob-3': 'blob3 22s ease-in-out infinite',
        'blob-4': 'blob4 16s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'tab-enter': 'tabEnter 0.28s ease-out both',
        'curtain-sweep': 'curtainSweep 1.6s ease-in-out infinite',
        'scan-line': 'scanLine 1.8s ease-in-out infinite',
        'list-in': 'listIn 0.22s ease-out both',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
      },
      keyframes: {
        blob1: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '25%': { transform: 'translate(14%, -18%) scale(1.15)' },
          '50%': { transform: 'translate(6%, 10%) scale(0.9)' },
          '75%': { transform: 'translate(-10%, -6%) scale(1.05)' },
        },
        blob2: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '25%': { transform: 'translate(-14%, 16%) scale(1.1)' },
          '50%': { transform: 'translate(10%, -12%) scale(0.88)' },
          '75%': { transform: 'translate(16%, 8%) scale(1.06)' },
        },
        blob3: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(12%, 20%) scale(0.92)' },
          '66%': { transform: 'translate(-14%, -16%) scale(1.12)' },
        },
        blob4: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '30%': { transform: 'translate(-18%, -14%) scale(1.14)' },
          '60%': { transform: 'translate(12%, 10%) scale(0.9)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        tabEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        curtainSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        scanLine: {
          '0%, 100%': { top: '8%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '50%': { top: '88%' },
        },
        listIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(131,58,180,0.5)' },
          '70%': { boxShadow: '0 0 0 14px rgba(131,58,180,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(131,58,180,0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
