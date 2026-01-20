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

// Options for useLeads hook
export interface UseLeadsOptions {
  filters?: LeadFilters
  searchQuery?: string
}
