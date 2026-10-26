import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B12',
        panel: '#14141F',
        panelInner: '#1B1B28',
        border: '#2A2A3D',
        borderStrong: '#3A3A4D',
        text: '#FFFFFF',
        textSecondary: '#B8B8C7',
        textMuted: '#9A9AB0',
        solanaPurple: '#9945FF',
        solanaGreen: '#14F195',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(90deg, #9945FF 0%, #14F195 100%)',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        panel: '16px',
        btn: '12px',
        logo: '10px',
      },
    },
  },
  plugins: [],
};

export default config;