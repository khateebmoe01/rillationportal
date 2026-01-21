-- ============================================================================
-- UPDATE ENGAGED LEADS TO CRM SYNC TRIGGER
-- ============================================================================
-- Migration: Update sync trigger for new CRM structure (no companies table)
-- Created: 2025-01-10
-- Description: Sync all fields from engaged_leads directly to crm_contacts
-- ============================================================================

-- ============================================
-- DROP OLD HELPER FUNCTIONS
-- ============================================
DROP FUNCTION IF EXISTS get_or_create_company(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS map_lead_status_to_contact_status(BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN);

-- ============================================
-- NEW HELPER FUNCTION: Map Engaged Lead to Contact Status
-- ============================================
CREATE OR REPLACE FUNCTION map_engaged_lead_to_contact_status(
  p_stage TEXT DEFAULT NULL,
  p_meeting_booked BOOLEAN DEFAULT FALSE,
  p_qualified BOOLEAN DEFAULT FALSE,
  p_showed_up_to_disco BOOLEAN DEFAULT FALSE,
  p_demo_booked BOOLEAN DEFAULT FALSE,
  p_showed_up_to_demo BOOLEAN DEFAULT FALSE,
  p_proposal_sent BOOLEAN DEFAULT FALSE,
  p_closed BOOLEAN DEFAULT FALSE
) RETURNS TEXT AS $$
BEGIN
  -- Map engaged_lead stage/flags to contact status
  IF p_closed THEN
    RETURN 'customer';
  ELSIF p_proposal_sent THEN
    RETURN 'in-contract';
  ELSIF p_showed_up_to_demo OR p_demo_booked OR p_showed_up_to_disco THEN
    RETURN 'hot';
  ELSIF p_qualified OR p_meeting_booked THEN
    RETURN 'warm';
  ELSE
    RETURN 'cold';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATED SYNC FUNCTION: Sync Engaged Lead to CRM
-- ============================================
CREATE OR REPLACE FUNCTION sync_engaged_lead_to_crm()
RETURNS TRIGGER AS $$
DECLARE
  v_contact_id UUID;
  v_contact_status TEXT;
BEGIN
  -- Skip if email is missing (required for contacts)
  IF NEW.email IS NULL OR TRIM(NEW.email) = '' THEN
    RETURN NEW;
  END IF;

  -- Determine contact status from engaged_lead data
  v_contact_status := map_engaged_lead_to_contact_status(
    NEW.stage,
    COALESCE(NEW.meeting_booked, FALSE),
    COALESCE(NEW.qualified, FALSE),
    COALESCE(NEW.showed_up_to_disco, FALSE),
    COALESCE(NEW.demo_booked, FALSE),
    COALESCE(NEW.showed_up_to_demo, FALSE),
    COALESCE(NEW.proposal_sent, FALSE),
    COALESCE(NEW.closed, FALSE)
  );

  -- Check if contact already exists by email and client
  SELECT id INTO v_contact_id
  FROM crm_contacts
  WHERE client = NEW.client
    AND LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
    AND (deleted_at IS NULL)
  LIMIT 1;

  IF v_contact_id IS NOT NULL THEN
    -- Update existing contact with all fields from engaged_lead
    UPDATE crm_contacts
    SET
      -- Personal info
      first_name = COALESCE(NEW.first_name, first_name),
      last_name = COALESCE(NEW.last_name, last_name),
      title = COALESCE(NEW.job_title, title),
      job_title = COALESCE(NEW.job_title, job_title),
      phone = COALESCE(NEW.lead_phone, phone),
      lead_phone = COALESCE(NEW.lead_phone, lead_phone),
      seniority_level = COALESCE(NEW.seniority_level, seniority_level),
      profile_url = COALESCE(NEW.linkedin_url, profile_url),
      linkedin_url = COALESCE(NEW.linkedin_url, linkedin_url),
      
      -- Company info (embedded)
      company_name = COALESCE(NEW.company, company_name),
      company_domain = COALESCE(NEW.company_domain, company_domain),
      company_linkedin = COALESCE(NEW.company_linkedin, company_linkedin),
      company_phone = COALESCE(NEW.company_phone, company_phone),
      company_website = COALESCE(NEW.company_website, company_website),
      company_size = COALESCE(NEW.company_size, company_size),
      company_industry = COALESCE(NEW.industry, company_industry),
      annual_revenue = COALESCE(NEW.annual_revenue, annual_revenue),
      company_hq_city = COALESCE(NEW.company_hq_city, company_hq_city),
      company_hq_state = COALESCE(NEW.company_hq_state, company_hq_state),
      company_hq_country = COALESCE(NEW.company_hq_country, company_hq_country),
      year_founded = COALESCE(NEW.year_founded, year_founded),
      business_model = COALESCE(NEW.business_model, business_model),
      funding_stage = COALESCE(NEW.funding_stage, funding_stage),
      tech_stack = COALESCE(NEW.tech_stack, tech_stack),
      is_hiring = COALESCE(NEW.is_hiring, is_hiring),
      growth_score = COALESCE(NEW.growth_score::TEXT, growth_score),
      num_locations = COALESCE(NEW.num_locations, num_locations),
      
      -- Pipeline/sales fields
      status = v_contact_status,
      stage = COALESCE(NEW.stage, stage),
      epv = COALESCE(NEW.epv, epv),
      context = COALESCE(NEW.context, context),
      next_touch = COALESCE(NEW.next_touchpoint::TIMESTAMP WITH TIME ZONE, next_touch),
      notes = COALESCE(NEW.notes, notes),
      assignee = COALESCE(NEW.assignee, assignee),
      
      -- Meeting info
      meeting_date = COALESCE(NEW.meeting_date, meeting_date),
      meeting_link = COALESCE(NEW.meeting_link, meeting_link),
      rescheduling_link = COALESCE(NEW.rescheduling_link, rescheduling_link),
      
      -- Campaign info
      campaign_name = COALESCE(NEW.campaign_name, campaign_name),
      campaign_id = COALESCE(NEW.campaign_id, campaign_id),
      lead_source = COALESCE(NEW.lead_source, lead_source),
      
      -- Metadata
      custom_variables_jsonb = COALESCE(NEW.custom_variables_jsonb, custom_variables_jsonb),
      last_contacted_at = COALESCE(NEW.last_contact, last_contacted_at),
      updated_at = NOW()
    WHERE id = v_contact_id;
  ELSE
    -- Create new contact with all fields from engaged_lead
    INSERT INTO crm_contacts (
      id,
      client,
      -- Personal info
      first_name,
      last_name,
      email,
      title,
      job_title,
      phone,
      lead_phone,
      seniority_level,
      profile_url,
      linkedin_url,
      -- Company info (embedded)
      company_name,
      company_domain,
      company_linkedin,
      company_phone,
      company_website,
      company_size,
      company_industry,
      annual_revenue,
      company_hq_city,
      company_hq_state,
      company_hq_country,
      year_founded,
      business_model,
      funding_stage,
      tech_stack,
      is_hiring,
      growth_score,
      num_locations,
      -- Pipeline/sales fields
      status,
      stage,
      epv,
      context,
      next_touch,
      notes,
      assignee,
      -- Meeting info
      meeting_date,
      meeting_link,
      rescheduling_link,
      -- Campaign info
      campaign_name,
      campaign_id,
      lead_source,
      -- Metadata
      custom_variables_jsonb,
      last_contacted_at,
      tags,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      NEW.client,
      -- Personal info
      NEW.first_name,
      NEW.last_name,
      TRIM(NEW.email),
      NEW.job_title,
      NEW.job_title,
      NEW.lead_phone,
      NEW.lead_phone,
      NEW.seniority_level,
      NEW.linkedin_url,
      NEW.linkedin_url,
      -- Company info (embedded)
      NEW.company,
      NEW.company_domain,
      NEW.company_linkedin,
      NEW.company_phone,
      NEW.company_website,
      NEW.company_size,
      NEW.industry,
      NEW.annual_revenue,
      NEW.company_hq_city,
      NEW.company_hq_state,
      NEW.company_hq_country,
      NEW.year_founded,
      NEW.business_model,
      NEW.funding_stage,
      NEW.tech_stack,
      NEW.is_hiring,
      NEW.growth_score::TEXT,
      NEW.num_locations,
      -- Pipeline/sales fields
      v_contact_status,
      NEW.stage,
      NEW.epv,
      NEW.context,
      NEW.next_touchpoint::TIMESTAMP WITH TIME ZONE,
      NEW.notes,
      NEW.assignee,
      -- Meeting info
      NEW.meeting_date,
      NEW.meeting_link,
      NEW.rescheduling_link,
      -- Campaign info
      NEW.campaign_name,
      NEW.campaign_id,
      COALESCE(NEW.lead_source, 'email_campaign'),
      -- Metadata
      NEW.custom_variables_jsonb,
      NEW.last_contact,
      ARRAY[]::TEXT[],
      COALESCE(NEW.created_at, NOW()),
      NOW()
    )
    RETURNING id INTO v_contact_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RECREATE TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS sync_engaged_lead_to_crm_on_insert ON engaged_leads;
DROP TRIGGER IF EXISTS sync_engaged_lead_to_crm_on_update ON engaged_leads;

CREATE TRIGGER sync_engaged_lead_to_crm_on_insert
  AFTER INSERT ON engaged_leads
  FOR EACH ROW
  EXECUTE FUNCTION sync_engaged_lead_to_crm();

CREATE TRIGGER sync_engaged_lead_to_crm_on_update
  AFTER UPDATE ON engaged_leads
  FOR EACH ROW
  WHEN (
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name OR
    OLD.company IS DISTINCT FROM NEW.company OR
    OLD.job_title IS DISTINCT FROM NEW.job_title OR
    OLD.stage IS DISTINCT FROM NEW.stage OR
    OLD.meeting_booked IS DISTINCT FROM NEW.meeting_booked OR
    OLD.qualified IS DISTINCT FROM NEW.qualified OR
    OLD.closed IS DISTINCT FROM NEW.closed OR
    OLD.industry IS DISTINCT FROM NEW.industry OR
    OLD.annual_revenue IS DISTINCT FROM NEW.annual_revenue OR
    OLD.context IS DISTINCT FROM NEW.context OR
    OLD.next_touchpoint IS DISTINCT FROM NEW.next_touchpoint OR
    OLD.meeting_date IS DISTINCT FROM NEW.meeting_date
  )
  EXECUTE FUNCTION sync_engaged_lead_to_crm();

-- ============================================
-- NOTES
-- ============================================
-- This migration:
-- 1. Drops old helper functions (get_or_create_company)
-- 2. Creates new status mapping function for the updated pipeline
-- 3. Updates sync function to map all engaged_leads fields to crm_contacts
-- 4. Syncs company fields directly to contacts (no more companies table)
-- 5. Recreates triggers with updated field change detection
-- ============================================================================
