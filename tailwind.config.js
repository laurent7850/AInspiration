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
      },
      borderRadius: {
        'card': '1.375rem',
        'soft': '0.875rem',
        'button': '9999px',
      },
      boxShadow: {
        'diffuse': '0 20px 40px -15px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
}