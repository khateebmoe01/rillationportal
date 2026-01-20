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
export const COLUMNS: ColumnDef[] = [
  { id: 'full_name', label: 'Lead Name', type: 'text', width: 110 },
  { id: 'company', label: 'Organization', type: 'text', width: 100 },
  { id: 'stage', label: 'Stage', type: 'select', width: 110, options: ['new', 'contacted', 'follow_up', 'meeting_booked', 'qualified', 'demo_booked', 'demo_showed', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost', 'disqualified'] },
  { id: 'pipeline_progress', label: 'Pipeline Progress', type: 'pipeline', width: 115 },
  { id: 'lead_source', label: 'Lead Source', type: 'select', width: 90, options: ['Email', 'LinkedIn', 'Referral', 'Website', 'Cold Call', 'Event', 'Other'] },
  { id: 'meeting_date', label: 'Meeting Date', type: 'date', width: 95 },
  { id: 'estimated_value', label: 'Est. Value', type: 'currency', width: 80 },
  { id: 'lead_phone', label: 'Lead Phone', type: 'phone', width: 95 },
  { id: 'company_phone', label: 'Company Phone', type: 'phone', width: 105 },
  { id: 'linkedin_url', label: 'LinkedIn', type: 'url', width: 70 },
  { id: 'context', label: 'Context', type: 'text', width: 140 },
  { id: 'next_touchpoint', label: 'Next Touch', type: 'date', width: 90 },
  { id: 'industry', label: 'Industry', type: 'text', width: 80 },
  { id: 'assignee', label: 'Assignee', type: 'select', width: 80, options: ['Mo', 'Unassigned'] },
  { id: 'created_at', label: 'Created', type: 'date', width: 80 },
]

// Stage colors for pills
export const STAGE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'new': { bg: '#1e3a5f', text: '#60a5fa', label: 'New' },
  'contacted': { bg: '#3d2f5c', text: '#a78bfa', label: 'Contacted' },
  'follow_up': { bg: '#2d3748', text: '#cbd5e1', label: 'Follow Up' },
  'meeting_booked': { bg: '#1a4d3d', text: '#00C853', label: 'Meeting Booked' },
  'qualified': { bg: '#1e4d3d', text: '#34d399', label: 'Qualified' },
  'demo_booked': { bg: '#4a3f2a', text: '#fbbf24', label: 'Demo Booked' },
  'demo_showed': { bg: '#4a2f2a', text: '#f97316', label: 'Demo Showed' },
  'proposal_sent': { bg: '#4a2a4a', text: '#ec4899', label: 'Proposal Sent' },
  'negotiation': { bg: '#1e4a4a', text: '#14b8a6', label: 'Negotiation' },
  'closed_won': { bg: '#1e4d2a', text: '#22c55e', label: 'Closed Won' },
  'closed_lost': { bg: '#3d2a2a', text: '#ef4444', label: 'Closed Lost' },
  'disqualified': { bg: '#2d2d2d', text: '#71717a', label: 'Disqualified' },
}

// Lead source colors for pills
export const LEAD_SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  'Email': { bg: '#1e3a4d', text: '#38bdf8' },
  'LinkedIn': { bg: '#1e3a5f', text: '#60a5fa' },
  'Referral': { bg: '#3d3d1e', text: '#facc15' },
  'Website': { bg: '#2a3d1e', text: '#a3e635' },
  'Cold Call': { bg: '#3d1f4a', text: '#e879f9' },
  'Event': { bg: '#4a3f2a', text: '#fbbf24' },
  'Other': { bg: '#2d2d2d', text: '#f0f0f0' },
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
