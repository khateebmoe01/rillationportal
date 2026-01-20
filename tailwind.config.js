/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        // Black and white theme with purposeful color usage
        'rillation': {
          'bg': '#000000',
          'card': '#141414',
          'card-hover': '#1a1a1a',
          'border': '#222222',
          'green': '#22c55e',
          'green-dark': '#16a34a',
          'magenta': '#d946ef',
          'cyan': '#22d3ee',
          'orange': '#f97316',
          'red': '#ef4444',
          'yellow': '#eab308',
          'text': '#ffffff',
          'text-muted': '#888888',
        },
        // CRM-specific refined dark theme
        'crm': {
          // Background layers
          'base': '#0a0a0a',
          'raised': '#111111',
          'elevated': '#161616',
          'surface': '#1a1a1a',
          'overlay': '#1f1f1f',
          // Borders
          'border-subtle': '#1f1f1f',
          'border': '#2a2a2a',
          'border-strong': '#3a3a3a',
          // Text
          'text': '#f5f5f5',
          'text-secondary': '#d4d4d4',
          'text-muted': '#a3a3a3',
          'text-disabled': '#525252',
          // Accents
          'accent': '#22c55e',
          'accent-hover': '#16a34a',
          'accent-blue': '#3b82f6',
        }
      },
      fontFamily: {
        'sans': ['Sora', 'system-ui', 'sans-serif'],
      },
      // CRM Design Tokens - 8px spacing scale
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '14': '56px',
        'row': '52px',
        'header': '44px',
        'toolbar': '56px',
      },
      height: {
        'row': '52px',
        'header': '44px',
        'toolbar': '56px',
      },
      minHeight: {
        'row': '52px',
        'header': '44px',
        'toolbar': '56px',
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '1.25' }],
        'sm': ['12px', { lineHeight: '1.5' }],
        'base': ['13px', { lineHeight: '1.5' }],
        'md': ['14px', { lineHeight: '1.5' }],
        'lg': ['16px', { lineHeight: '1.5' }],
        'xl': ['18px', { lineHeight: '1.35' }],
      },
      borderRadius: {
        'card': '12px',
        'cell': '8px',
        'pill': '9999px',
      },
      zIndex: {
        'sticky': '10',
        'header': '20',
        'dropdown': '100',
        'modal': '200',
        'toast': '300',
      },
      boxShadow: {
        'sticky': '4px 0 12px -2px rgba(0, 0, 0, 0.5)',
        'header': '0 2px 8px -2px rgba(0, 0, 0, 0.4)',
        'dropdown': '0 12px 40px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05)',
        'modal': '0 20px 50px -10px rgba(0, 0, 0, 0.8)',
      },
      transitionDuration: {
        'fast': '100ms',
        'normal': '150ms',
        'slow': '250ms',
      },
    },
  },
  plugins: [],
}
