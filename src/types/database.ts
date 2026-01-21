// Supabase Database Types for Rillation Portal

export interface Database {
  public: {
    Tables: {
      replies: {
        Row: Reply
        Insert: Partial<Reply>
        Update: Partial<Reply>
      }
      meetings_booked: {
        Row: MeetingBooked
        Insert: Partial<MeetingBooked>
        Update: Partial<MeetingBooked>
      }
      client_opportunities: {
        Row: ClientOpportunity
        Insert: Partial<ClientOpportunity>
        Update: Partial<ClientOpportunity>
      }
      client_iteration_logs: {
        Row: ClientIterationLog
        Insert: Partial<ClientIterationLog>
        Update: Partial<ClientIterationLog>
      }
      engaged_leads: {
        Row: EngagedLead
        Insert: Partial<EngagedLead>
        Update: Partial<EngagedLead>
      }
      campaign_reporting: {
        Row: CampaignReporting
        Insert: Partial<CampaignReporting>
        Update: Partial<CampaignReporting>
      }
    }
  }
}

// Table Types

export interface Reply {
  id?: number
  reply_id: string
  type: string
  lead_id: string
  subject: string
  category: string // 'Interested', 'Not Interested', 'OOO', etc.
  text_body: string
  campaign_id: string
  date_received: string
  from_email: string
  primary_to_email: string
  client: string
  created_at?: string
}

export interface MeetingBooked {
  id?: number
  first_name: string
  last_name: string
  full_name: string
  title: string
  company: string
  company_linkedin: string
  company_domain: string
  campaign_name: string
  profile_url: string
  client: string
  created_time: string
  campaign_id: string
  email: string
  // Firmographic fields
  company_size?: string
  annual_revenue?: string
  industry?: string
  company_hq_state?: string
  company_hq_city?: string
  company_hq_country?: string
  year_founded?: string
  business_model?: string
  funding_stage?: string
  tech_stack?: string[]
  is_hiring?: boolean
  growth_score?: string
  // JSONB column for all custom variables (future-proofing)
  custom_variables_jsonb?: Record<string, any>
  created_at?: string
}

export interface ClientOpportunity {
  id?: number
  client: string
  opportunity_name: string
  stage: string
  value: number
  expected_close_date?: string
  contact_name?: string
  contact_email?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ClientIterationLog {
  id?: number
  client: string
  action_type: string
  description: string
  created_by: string
  campaign_name?: string
  mentioned_users?: MentionedUser[]
  created_at?: string
}

export interface MentionedUser {
  slack_id: string
  display_name: string
}

export interface EngagedLead {
  id?: number
  client: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  job_title?: string
  seniority_level?: string
  
  // Company info
  company?: string
  company_domain?: string
  company_linkedin?: string
  company_phone?: string
  company_website?: string
  company_size?: string
  industry?: string
  annual_revenue?: string
  company_hq_city?: string
  company_hq_state?: string
  company_hq_country?: string
  year_founded?: number
  business_model?: string
  funding_stage?: string
  tech_stack?: string[]
  is_hiring?: boolean
  growth_score?: number
  num_locations?: number
  
  // Contact info
  lead_phone?: string
  linkedin_url?: string
  
  // Pipeline stages (booleans)
  meeting_booked?: boolean
  qualified?: boolean
  showed_up_to_disco?: boolean
  demo_booked?: boolean
  showed_up_to_demo?: boolean
  proposal_sent?: boolean
  closed?: boolean
  
  // Stage timestamps
  meeting_booked_at?: string
  qualified_at?: string
  showed_up_to_disco_at?: string
  demo_booked_at?: string
  showed_up_to_demo_at?: string
  proposal_sent_at?: string
  closed_at?: string
  
  // Pipeline/sales fields
  stage?: string
  current_stage?: string
  date_created?: string
  epv?: number
  context?: string
  next_touchpoint?: string
  last_contact?: string
  lead_source?: string
  assignee?: string
  notes?: string
  
  // Meeting info
  meeting_date?: string
  meeting_link?: string
  rescheduling_link?: string
  
  // Campaign info
  campaign_name?: string
  campaign_id?: string
  
  // Metadata
  custom_variables_jsonb?: Record<string, unknown>
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

export interface CampaignReporting {
  id?: number
  campaign_id: string
  campaign_name: string
  client: string
  date: string
  emails_sent: number
  total_leads_contacted: number
  opened: number
  opened_percentage: number
  unique_replies_per_contact: number
  unique_replies_per_contact_percentage: number
  bounced: number
  bounced_percentage: number
  interested: number
  interested_percentage: number
  created_at?: string
}

// Aggregated Data Types for Dashboard

export interface QuickViewMetrics {
  totalEmailsSent: number
  uniqueProspects: number
  totalReplies: number
  realReplies: number
  positiveReplies: number
  bounces: number
  meetingsBooked: number
}

export interface ClientBubbleData {
  client: string
  emailsSent: number
  emailsTarget: number
  uniqueProspects: number
  prospectsTarget: number
  realReplies: number
  repliesTarget: number
  meetings: number
  meetingsTarget: number
}

export interface ChartDataPoint {
  date: string
  sent: number
  prospects: number
  replied: number
  positiveReplies: number
  meetings: number
}

export interface FunnelStage {
  name: string
  value: number
  percentage?: number
}

export interface FunnelForecast {
  id?: number
  month: number
  year: number
  metric_key: string
  estimate_low: number
  estimate_avg: number
  estimate_high: number
  estimate_1: number
  estimate_2: number
  actual: number
  projected: number
  client?: string
  created_at?: string
  updated_at?: string
}
