// Lead interface matching engaged_leads table schema

export interface Lead {
  id: string
  client: string
  email: string
  
  // Contact Info
  first_name: string | null
  last_name: string | null
  full_name: string | null
  lead_phone: string | null
  linkedin_url: string | null
  job_title: string | null
  seniority_level: string | null
  
  // Organization
  company: string | null
  company_domain: string | null
  company_website: string | null
  company_phone: string | null
  company_hq_city: string | null
  company_hq_state: string | null
  company_hq_country: string | null
  company_size: string | null
  industry: string | null
  annual_revenue: string | null
  year_founded: number | null
  num_locations: number | null
  main_product_service: string | null
  
  // Pipeline Stage
  stage: string | null
  current_stage: string | null
  meeting_booked: boolean | null
  meeting_booked_at: string | null
  showed_up_to_disco: boolean | null
  showed_up_to_disco_at: string | null
  qualified: boolean | null
  qualified_at: string | null
  demo_booked: boolean | null
  demo_booked_at: string | null
  showed_up_to_demo: boolean | null
  showed_up_to_demo_at: string | null
  proposal_sent: boolean | null
  proposal_sent_at: string | null
  closed: boolean | null
  closed_at: string | null
  
  // Scheduling & Communication
  meeting_date: string | null
  meeting_link: string | null
  rescheduling_link: string | null
  next_touchpoint: string | null
  last_contact: string | null
  context: string | null
  notes: string | null
  
  // Meta
  lead_source: string | null
  assignee: string | null
  campaign_id: string | null
  campaign_name: string | null
  date_created: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null // Soft delete timestamp
  
  // Additional firmographic
  tech_stack: string[] | null
  business_model: string | null
  funding_stage: string | null
  growth_score: string | null
  is_hiring: boolean | null
  
  // Pipeline Value (from client_opportunities table)
  estimated_value: number | null
  opportunity_id: string | null
}

// Filter state for CRM
export interface LeadFilters {
  stage?: string | null
  assignee?: string | null
  lead_source?: string | null
}

// Sort configuration
export interface SortConfig {
  field: keyof Lead | 'updated_at'
  direction: 'asc' | 'desc'
}

// Sort field types for contextual direction labels
export type SortFieldType = 'text' | 'date' | 'select' | 'currency' | 'number'

// Sortable column definition with field type
export interface SortableColumn {
  id: keyof Lead | 'updated_at'
  label: string
  type: SortFieldType
}

// Sortable columns for the dropdown
export const SORTABLE_COLUMNS: SortableColumn[] = [
  { id: 'updated_at', label: 'Last Activity', type: 'date' },
  { id: 'created_at', label: 'Created Time', type: 'date' },
  { id: 'stage', label: 'Stage', type: 'select' },
  { id: 'full_name', label: 'Lead Name', type: 'text' },
  { id: 'next_touchpoint', label: 'Next Touchpoint', type: 'date' },
  { id: 'company', label: 'Organization', type: 'text' },
  { id: 'lead_source', label: 'Lead Source', type: 'select' },
  { id: 'assignee', label: 'Assignee', type: 'select' },
  { id: 'meeting_date', label: 'Meeting Date', type: 'date' },
  { id: 'estimated_value', label: 'Est. Value', type: 'currency' },
  { id: 'industry', label: 'Industry', type: 'text' },
  { id: 'context', label: 'Context', type: 'text' },
  { id: 'lead_phone', label: 'Lead Phone', type: 'text' },
  { id: 'company_phone', label: 'Company Phone', type: 'text' },
  { id: 'linkedin_url', label: 'LinkedIn', type: 'text' },
]

// Get contextual direction labels based on field type
export function getDirectionLabels(type: SortFieldType): { asc: string; desc: string } {
  switch (type) {
    case 'date':
      return { asc: 'Earliest → Latest', desc: 'Latest → Earliest' }
    case 'select':
      return { asc: 'First → Last', desc: 'Last → First' }
    case 'currency':
    case 'number':
      return { asc: 'Low → High', desc: 'High → Low' }
    case 'text':
    default:
      return { asc: 'A → Z', desc: 'Z → A' }
  }
}

// Options for useLeads hook
export interface UseLeadsOptions {
  filters?: LeadFilters
  searchQuery?: string
  sort?: SortConfig
}
