/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

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
          DEFAULT: withOpacity('--color-nitro-amber'),
          amber: withOpacity('--color-nitro-amber'),
          orange: withOpacity('--color-nitro-orange'),
          glow: 'rgba(var(--color-nitro-glow), 0.15)',
        },
        // 2. Primary Surface: Matte carbon fiber (dark) or crisp titanium card (light)
        carbon: {
          slate: withOpacity('--color-carbon-slate'),
          card: withOpacity('--color-carbon-card'),
          elevated: withOpacity('--color-carbon-elevated'),
          hover: withOpacity('--color-carbon-hover'),
        },
        // 3. Deep Background: Obsidian (dark) or Crisp Canvas (light)
        pitch: {
          obsidian: withOpacity('--color-pitch-obsidian'),
          deep: withOpacity('--color-pitch-deep'),
        },
        // 4. Primary Typography: Crisp readability
        machined: {
          titanium: withOpacity('--color-machined-titanium'),
          silver: withOpacity('--color-machined-silver'),
          muted: withOpacity('--color-machined-muted'),
          dim: withOpacity('--color-machined-dim'),
        },
        // 5. Hardware Details: Rivets, borders, dividers, telemetry marks
        fastener: {
          gunmetal: withOpacity('--color-fastener-gunmetal'),
          border: withOpacity('--color-fastener-border'),
          dark: withOpacity('--color-fastener-dark'),
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'nitro': '0 0 20px rgba(var(--color-nitro-amber), 0.25)',
        'nitro-sm': '0 0 10px rgba(var(--color-nitro-amber), 0.2)',
        'chassis': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
