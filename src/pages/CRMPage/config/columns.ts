import type { Lead } from '../types'

export type ColumnType = 'text' | 'select' | 'date' | 'currency' | 'phone' | 'url' | 'pipeline'

export interface ColumnDef {
  id: keyof Lead | 'pipeline_progress'
  label: string
  type: ColumnType
  width: number
  options?: string[]
  readOnly?: boolean
}

// Single source of truth for all column behavior
// Widths refined for better readability with 52px row height
export const COLUMNS: ColumnDef[] = [
  { id: 'full_name', label: 'Lead Name', type: 'text', width: 160 },
  { id: 'company', label: 'Organization', type: 'text', width: 140 },
  { id: 'stage', label: 'Stage', type: 'select', width: 140, options: ['new', 'contacted', 'follow_up', 'meeting_booked', 'qualified', 'demo_booked', 'demo_showed', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost', 'disqualified'] },
  { id: 'pipeline_progress', label: 'Pipeline', type: 'pipeline', width: 140 },
  { id: 'lead_source', label: 'Source', type: 'select', width: 110, options: ['Email', 'LinkedIn', 'Referral', 'Website', 'Cold Call', 'Event', 'Other'] },
  { id: 'meeting_date', label: 'Meeting Date', type: 'date', width: 120 },
  { id: 'estimated_value', label: 'Est. Value', type: 'currency', width: 100 },
  { id: 'lead_phone', label: 'Lead Phone', type: 'phone', width: 130 },
  { id: 'company_phone', label: 'Company Phone', type: 'phone', width: 130 },
  { id: 'linkedin_url', label: 'LinkedIn', type: 'url', width: 100 },
  { id: 'context', label: 'Context', type: 'text', width: 180 },
  { id: 'next_touchpoint', label: 'Next Touch', type: 'date', width: 120 },
  { id: 'industry', label: 'Industry', type: 'text', width: 120 },
  { id: 'assignee', label: 'Assignee', type: 'select', width: 100, options: ['Mo', 'Unassigned'] },
  { id: 'created_at', label: 'Created', type: 'date', width: 110 },
]

// Stage colors for pills - refined for better contrast
export const STAGE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'new': { bg: '#1e3a5f', text: '#60a5fa', label: 'New' },
  'contacted': { bg: '#3d2f5c', text: '#a78bfa', label: 'Contacted' },
  'follow_up': { bg: '#2d3748', text: '#94a3b8', label: 'Follow Up' },
  'meeting_booked': { bg: '#14532d', text: '#4ade80', label: 'Meeting Booked' },
  'qualified': { bg: '#164e3d', text: '#34d399', label: 'Qualified' },
  'demo_booked': { bg: '#422006', text: '#fbbf24', label: 'Demo Booked' },
  'demo_showed': { bg: '#431407', text: '#fb923c', label: 'Demo Showed' },
  'proposal_sent': { bg: '#3b0764', text: '#e879f9', label: 'Proposal Sent' },
  'negotiation': { bg: '#134e4a', text: '#2dd4bf', label: 'Negotiation' },
  'closed_won': { bg: '#14532d', text: '#22c55e', label: 'Closed Won' },
  'closed_lost': { bg: '#450a0a', text: '#f87171', label: 'Closed Lost' },
  'disqualified': { bg: '#262626', text: '#737373', label: 'Disqualified' },
}

// Lead source colors for pills
export const LEAD_SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  'Email': { bg: '#1e3a4d', text: '#38bdf8' },
  'LinkedIn': { bg: '#1e3a5f', text: '#60a5fa' },
  'Referral': { bg: '#3d3d1e', text: '#facc15' },
  'Website': { bg: '#2a3d1e', text: '#a3e635' },
  'Cold Call': { bg: '#3d1f4a', text: '#e879f9' },
  'Event': { bg: '#422006', text: '#fbbf24' },
  'Other': { bg: '#262626', text: '#a3a3a3' },
}

// Get color map for a specific column
export function getColorMap(columnId: keyof Lead): Record<string, { bg: string; text: string }> | undefined {
  if (columnId === 'stage') return STAGE_COLORS
  if (columnId === 'lead_source') return LEAD_SOURCE_COLORS
  return undefined
}

// Get display label for stage value
export function getStageLabel(stage: string | null): string {
  if (!stage) return '-'
  return STAGE_COLORS[stage]?.label || stage
}
