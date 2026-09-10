/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // One family, several weights — the "Atelier clair" rule. Jost was never
        // actually loaded (no @font-face, no <link>), so dropping it changes nothing
        // at render time and stops the stack from lying about what ships.
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      colors: {
        // --- Atelier clair (fond « Craie »), 2026-09-10 ---
        // Les deux couleurs de marque sont échantillonnées sur le logo :
        // #4540D0 (cerveau + « AI ») et #1E293B (mot-marque).
        canvas: '#FFFFFF',
        surface: '#F8F8FA',
        ink: '#1E293B',
        secondary: '#6B7280',
        muted: '#9AA1AC',
        line: '#E4E4EA',
        accent: {
          DEFAULT: '#4540D0',
          light: '#5F58DA',
          dark: '#3A35B8',
          wash: '#EEEDFC',
        },
        // La rampe `indigo` de Tailwind est utilisée plus de 1100 fois dans le code.
        // On la recentre sur le bleu du logo plutôt que de réécrire chaque occurrence :
        // même famille de teinte, valeur exacte de la marque au 600.
        indigo: {
          50: '#F1F0FD',
          100: '#E5E3FB',
          200: '#CDCAF6',
          300: '#ADA8EF',
          400: '#837CE4',
          500: '#5F58DA',
          600: '#4540D0',
          700: '#3A35B8',
          800: '#322E96',
          900: '#2C2A77',
          950: '#1B1946',
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
        'card': '1.375rem',
        'soft': '0.875rem',
        'button': '9999px',
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