/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hd: {
          bg:          '#08090b',
          surface:     '#0e1117',
          'surface-2': '#151b24',
          border:      '#1f2a38',
          'border-2':  '#2a3a4f',
          yellow:      '#f5c518',
          'yellow-dim':'#b89012',
          'yellow-glow':'#f5c51833',
          red:         '#c0392b',
          'red-dim':   '#7f2315',
          green:       '#27ae60',
          'green-dim': '#1a7040',
          blue:        '#2980b9',
          orange:      '#e67e22',
          muted:       '#4a5568',
          faded:       '#2d3748',
          text:        '#c9d1db',
          'text-dim':  '#8899aa',
        }
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        mono:    ['Share Tech Mono', 'monospace'],
        body:    ['Barlow Condensed', 'sans-serif'],
      },
      boxShadow: {
        'hd-yellow': '0 0 12px #f5c51866',
        'hd-red':    '0 0 12px #c0392b55',
        'hd-glow':   '0 0 24px #f5c51822',
      },
      backgroundImage: {
        'scanlines': "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        pulse_yellow: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.4 },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        ticker:       'ticker 40s linear infinite',
        pulse_yellow: 'pulse_yellow 2s ease-in-out infinite',
        fadeIn:       'fadeIn 0.15s ease-out',
      }
    },
  },
  plugins: [],
}
