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
  company?: string
  title?: string
  industry?: string
  annual_revenue?: string
  date_created?: string
  current_stage?: string
  meeting_booked?: boolean
  replied?: boolean
  interested?: boolean
  qualified?: boolean
  proposal_sent?: boolean
  negotiation?: boolean
  closed_won?: boolean
  closed_lost?: boolean
  created_at?: string
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
