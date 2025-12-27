import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        'vault-dark': '#0f172a',
        'vault-darker': '#0a0f1c',
        'vault-card': '#1e293b',
        'vault-border': '#334155',
        // Accent colors
        'stacks-purple': '#5546ff',
        'stacks-purple-light': '#7c6fff',
        'stacks-purple-dark': '#3d32cc',
        'bitcoin-gold': '#f7931a',
        'bitcoin-gold-light': '#ffb84d',
        'bitcoin-gold-dark': '#c77617',
        // Status colors
        'status-open': '#22c55e',
        'status-claimed': '#8b5cf6',
        'status-locked': '#f59e0b',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'vault-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(85, 70, 255, 0.1) 0%, rgba(247, 147, 26, 0.05) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(85, 70, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(85, 70, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

