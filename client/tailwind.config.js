/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'whatsapp-green': {
          DEFAULT: '#00a884',
          dark: '#008069',
          light: '#d9fdd3',
        },
        'whatsapp-teal': '#128c7e',
        'whatsapp-blue': '#34b7f1',
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        chat: 'var(--bg-chat)',
        'message-sent': 'var(--bg-message-sent)',
        'message-received': 'var(--bg-message-received)',
        hover: 'var(--bg-hover)',
        selected: 'var(--bg-selected)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-accent': 'var(--text-accent)',
        'text-link': 'var(--text-link)',
        'text-white': 'var(--text-white)',
        'border-light': 'var(--border-light)',
        'border-medium': 'var(--border-medium)',
        'border-dark': 'var(--border-dark)',
        'status-online': 'var(--status-online)',
        'status-away': 'var(--status-away)',
        'status-offline': 'var(--status-offline)',
        'bubble-sent': 'var(--bubble-sent)',
        'bubble-received': 'var(--bubble-received)',
      },
      boxShadow: {
        'light': 'var(--shadow-light)',
        'medium': 'var(--shadow-medium)',
        'heavy': 'var(--shadow-heavy)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
