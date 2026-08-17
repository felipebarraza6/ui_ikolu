/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        abyss: {
          950: '#020810',
          900: '#030c18',
          850: '#051424',
          800: '#061d38',
          700: '#0a2d4f',
          600: '#0c3d66',
          500: '#134e7d',
        },
        slate: {
          150: '#e8edf4',
        },
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        body: ['Lato', 'Roboto', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'slide-up': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up-delayed': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards',
        'slide-up-delayed-2': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
        'slide-up-delayed-3': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards',
        'fade-in': 'fade-in 1s ease forwards',
        'fade-in-delayed': 'fade-in 1s ease 0.3s forwards',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'flow-particle': 'flow-particle 20s linear infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'counter-up': 'counter-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'flow-particle': {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateX(calc(100vw + 100px))', opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'counter-up': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
