/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Nanum Myeongjo"', 'Georgia', 'serif'],
        sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'crumple': 'crumple 0.85s cubic-bezier(0.4, 0, 1, 1) forwards',
        'breath': 'breath 10s ease-in-out infinite',
        'breath-slow': 'breath 14s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-up': 'fadeUp 1s ease-out',
        'fade-out': 'fadeOut 0.6s ease-out',
        'drift': 'drift 20s ease-in-out infinite',
        'ripple': 'ripple 3s ease-out infinite',
        'fill-up': 'fillUp 2.5s ease-out forwards',
      },
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.4)', opacity: '0.9' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -15px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 10px) scale(0.95)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        fillUp: {
          '0%': { height: '0%' },
          '100%': { height: '70%' },
        },
        crumple: {
          '0%':   { transform: 'scale(1) rotate(0deg)', opacity: '1', filter: 'blur(0px)' },
          '20%':  { transform: 'scale(0.9) rotate(-3deg) skewX(3deg)', opacity: '0.92' },
          '45%':  { transform: 'scale(0.68) rotate(6deg) skewX(-6deg) skewY(3deg)', opacity: '0.65' },
          '68%':  { transform: 'scale(0.38) rotate(-9deg) skewX(8deg) skewY(-5deg)', opacity: '0.35' },
          '85%':  { transform: 'scale(0.15) rotate(12deg) skewX(-7deg) skewY(6deg)', opacity: '0.12', filter: 'blur(1.5px)' },
          '100%': { transform: 'scale(0.02) rotate(16deg)', opacity: '0', filter: 'blur(3px)' },
        },
      },
    },
  },
  plugins: [],
}
