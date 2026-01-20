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
          'green': '#006B3F',
          'green-dark': '#005532',
          'magenta': '#d946ef',
          'cyan': '#22d3ee',
          'orange': '#f97316',
          'green': '#22c55e',
          'red': '#ef4444',
          'yellow': '#eab308',
          'text': '#ffffff',
          'text-muted': '#888888',
        },
        // CRM-specific dark blue theme
        'crm': {
          'bg': '#0d1117',
          'card': '#161b22',
          'card-hover': '#1c2128',
          'border': '#30363d',
          'text': '#f0f6fc',
          'text-muted': '#8b949e',
          'checkbox': '#238636',
          'checkbox-hover': '#2ea043',
        }
      },
      fontFamily: {
        'sans': ['Sora', 'system-ui', 'sans-serif'],
      },
      // CRM Design Tokens - consistent spacing and sizing
      spacing: {
        'row-compact': '40px',
        'row-comfortable': '48px',
        'cell-x': '12px',
        'cell-y': '12px',
      },
      minHeight: {
        'row-compact': '40px',
        'row-comfortable': '48px',
      },
      height: {
        'row-compact': '40px',
        'row-comfortable': '48px',
      },
      borderRadius: {
        'card': '12px',
        'cell': '8px',
      },
      zIndex: {
        'dropdown': '100',
        'modal': '200',
        'toast': '300',
      },
      boxShadow: {
        'sticky': '4px 0 8px -2px rgba(0, 0, 0, 0.4)',
        'dropdown': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
