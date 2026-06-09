/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      colors: {
        canvas: '#F9FAFB',
        surface: '#FFFFFF',
        ink: '#18181B',
        secondary: '#71717A',
        muted: '#94A3B8',
        accent: {
          DEFAULT: '#4F46E5',
          light: '#6366F1',
          dark: '#4338CA',
        },
        whisper: 'rgba(226,232,240,0.5)',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        }
      },
      borderRadius: {
        'container': '2rem',
        'card': '1.5rem',
        'button': '0.5rem',
      },
      boxShadow: {
        'diffuse': '0 20px 40px -15px rgba(0,0,0,0.05)',
        'diffuse-lg': '0 30px 60px -20px rgba(0,0,0,0.08)',
        'lift': '0 2px 8px rgba(0,0,0,0.04)',
        'inner-glow': 'inset 0 1px 1px rgba(255,255,255,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
}