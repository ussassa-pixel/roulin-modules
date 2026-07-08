/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // roulin.ai 와 동일한 세리프 스택 (Lora + 마루부리)
        serif: ['Lora', 'MaruBuri', '"Noto Serif KR"', 'Georgia', 'serif'],
        sans: ['Lora', 'MaruBuri', '"Noto Serif KR"', 'Georgia', 'serif'],
      },
      colors: {
        // roulin.ai MVP 팔레트
        cream:     '#F5F3EB',
        'cream-soft': '#FBFAF4',
        navy:      '#112338',
        ink:       '#3A3733',
        'r-gray':  '#6E6A60',
        'r-gray-soft': '#A8A294',
        amber:     '#E0A33E',
        'amber-soft': '#F3E7CC',
        line:      '#E7E2D5',
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
        'float-right': 'floatRight 12s linear forwards',
        'stop-pulse': 'stopPulse 1.8s ease-out infinite',
        'sink-away': 'sinkAway 1.4s cubic-bezier(0.5,0,0.75,0) forwards',
        'release-rise': 'releaseRise 2.6s cubic-bezier(0.33,0,0.5,1) forwards',
        'compass-settle': 'compassSettle 2.6s cubic-bezier(0.3,0.7,0.35,1) both',
        'compass-sway': 'compassSway 5.5s ease-in-out infinite',
        'tremor': 'tremor 0.12s linear infinite',
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
        floatRight: {
          '0%':   { left: '-120px', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { left: '100%', opacity: '0' },
        },
        stopPulse: {
          '0%':   { transform: 'scale(0.92)', opacity: '0.35' },
          '100%': { transform: 'scale(1.25)', opacity: '0' },
        },
        sinkAway: {
          '0%':   { transform: 'translateY(0) scale(1)', opacity: '1', filter: 'blur(0px)' },
          '30%':  { opacity: '0.9' },
          '100%': { transform: 'translateY(60px) scale(0.92)', opacity: '0', filter: 'blur(3px)' },
        },
        releaseRise: {
          '0%':   { transform: 'translate(-50%, 0) scale(1) rotate(0deg)', opacity: '1', filter: 'blur(0px)' },
          '25%':  { opacity: '1' },
          '100%': { transform: 'translate(calc(-50% + 34px), -230px) scale(0.8) rotate(7deg)', opacity: '0', filter: 'blur(2.5px)' },
        },
        compassSettle: {
          '0%':   { transform: 'rotate(-42deg)' },
          '18%':  { transform: 'rotate(25deg)' },
          '38%':  { transform: 'rotate(-15deg)' },
          '58%':  { transform: 'rotate(9deg)' },
          '78%':  { transform: 'rotate(-4deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        compassSway: {
          '0%, 100%': { transform: 'rotate(-5.5deg)' },
          '50%':      { transform: 'rotate(5.5deg)' },
        },
        tremor: {
          '0%':   { transform: 'translate(0,0) rotate(0deg)' },
          '25%':  { transform: 'translate(0.7px,-0.5px) rotate(0.5deg)' },
          '50%':  { transform: 'translate(-0.6px,0.6px) rotate(-0.4deg)' },
          '75%':  { transform: 'translate(0.5px,0.4px) rotate(0.3deg)' },
          '100%': { transform: 'translate(0,0) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
