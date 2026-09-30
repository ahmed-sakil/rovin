/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 1. Primary Accent: Brushless motor energy, nitro headers
        nitro: {
          DEFAULT: '#FFC837',
          amber: '#FFC837',
          orange: '#ED6A00',
          glow: 'rgba(255, 200, 55, 0.15)',
        },
        // 2. Primary Dark Surface: Matte carbon fiber aesthetic
        carbon: {
          slate: '#0E0F14',
          card: '#14161F',
          elevated: '#1A1D29',
          hover: '#222636',
        },
        // 3. Deep Background: High-contrast chassis backplates
        pitch: {
          obsidian: '#07070A',
          deep: '#040406',
        },
        // 4. Primary Typography & Emblem: Crisp surgical readability
        machined: {
          titanium: '#FFFFFF',
          silver: '#E2E8F0',
          muted: '#94A3B8',
          dim: '#64748B',
        },
        // 5. Hardware Details: Rivets, borders, dividers, telemetry marks
        fastener: {
          gunmetal: '#3A4054',
          border: '#242836',
          dark: '#1C202C',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'nitro': '0 0 20px rgba(255, 200, 55, 0.25)',
        'nitro-sm': '0 0 10px rgba(255, 200, 55, 0.2)',
        'chassis': '0 8px 32px 0 rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}
