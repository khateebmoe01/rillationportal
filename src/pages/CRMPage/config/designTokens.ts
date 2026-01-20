/**
 * CRM Design Tokens
 * Centralized design system for consistent UI
 * Following 8px spacing scale
 */

// ==============================================
// SPACING SYSTEM (8px base)
// ==============================================
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
} as const

// ==============================================
// LAYOUT DIMENSIONS
// ==============================================
export const layout = {
  // Toolbar
  toolbarHeight: 56,
  
  // Table
  rowHeight: 52,
  headerHeight: 44,
  
  // Columns
  checkboxColumnWidth: 48,
  actionColumnWidth: 48,
  
  // Min widths for columns
  minColumnWidth: 80,
  maxColumnWidth: 500,
} as const

// ==============================================
// COLORS - Dark Mode Palette
// ==============================================
export const colors = {
  // Background layers (from darkest to lightest)
  bg: {
    base: '#0a0a0a',      // Page background
    raised: '#111111',     // Cards, panels
    elevated: '#161616',   // Table header, toolbar
    surface: '#1a1a1a',    // Hover states, inputs
    overlay: '#1f1f1f',    // Dropdowns, modals
    subtle: '#252525',     // Hover in dropdowns
  },
  
  // Borders
  border: {
    subtle: '#1f1f1f',     // Subtle separators
    default: '#2a2a2a',    // Standard borders
    strong: '#3a3a3a',     // Prominent borders
    focus: '#3b82f6',      // Focus rings
  },
  
  // Text
  text: {
    primary: '#f5f5f5',    // Primary text
    secondary: '#d4d4d4',  // Secondary text
    muted: '#a3a3a3',      // Muted text
    disabled: '#525252',   // Disabled text
    placeholder: '#737373', // Placeholder text
  },
  
  // Accent colors
  accent: {
    primary: '#22c55e',    // Primary green
    primaryHover: '#16a34a',
    secondary: '#3b82f6',  // Blue
    secondaryHover: '#2563eb',
  },
  
  // Stage colors (refined)
  stage: {
    new: { bg: '#1e3a5f', text: '#60a5fa' },
    contacted: { bg: '#3d2f5c', text: '#a78bfa' },
    follow_up: { bg: '#2d3748', text: '#94a3b8' },
    meeting_booked: { bg: '#14532d', text: '#4ade80' },
    qualified: { bg: '#164e3d', text: '#34d399' },
    demo_booked: { bg: '#422006', text: '#fbbf24' },
    demo_showed: { bg: '#431407', text: '#fb923c' },
    proposal_sent: { bg: '#3b0764', text: '#e879f9' },
    negotiation: { bg: '#134e4a', text: '#2dd4bf' },
    closed_won: { bg: '#14532d', text: '#22c55e' },
    closed_lost: { bg: '#450a0a', text: '#f87171' },
    disqualified: { bg: '#262626', text: '#737373' },
  },
  
  // Pipeline progress
  pipeline: {
    track: '#262626',
    fill: '#22c55e',
    fillSecondary: '#16a34a',
  },
  
  // Selection
  selection: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
  },
} as const

// ==============================================
// TYPOGRAPHY
// ==============================================
export const typography = {
  // Font sizes
  size: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
  },
  
  // Font weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  tracking: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

// ==============================================
// BORDER RADIUS
// ==============================================
export const radius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const

// ==============================================
// SHADOWS
// ==============================================
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
  sticky: '4px 0 12px -2px rgba(0, 0, 0, 0.5)',
  dropdown: '0 12px 40px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05)',
  header: '0 2px 8px -2px rgba(0, 0, 0, 0.4)',
} as const

// ==============================================
// TRANSITIONS
// ==============================================
export const transitions = {
  fast: '100ms ease',
  normal: '150ms ease',
  slow: '250ms ease',
  spring: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// ==============================================
// Z-INDEX SCALE
// ==============================================
export const zIndex = {
  base: 0,
  sticky: 10,
  stickyHeader: 20,
  dropdown: 100,
  modal: 200,
  toast: 300,
} as const
