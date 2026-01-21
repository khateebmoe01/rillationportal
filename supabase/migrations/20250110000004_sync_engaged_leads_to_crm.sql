-- ============================================================================
-- SYNC ENGAGED LEADS TO CRM
-- ============================================================================
-- Migration: Auto-sync engaged_leads to crm_contacts and crm_companies
-- Created: 2025-01-10
-- Description: Automatically creates/updates CRM contacts and companies 
--              when engaged_leads are inserted or updated via API
-- ============================================================================

-- ============================================
-- HELPER FUNCTION: Get or Create Company
-- ============================================
-- This function finds an existing company by name and client, or creates a new one
CREATE OR REPLACE FUNCTION get_or_create_company(
  p_client TEXT,
  p_company_name TEXT,
  p_industry TEXT DEFAULT NULL,
  p_annual_revenue TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Return NULL if company name is empty
  IF p_company_name IS NULL OR TRIM(p_company_name) = '' THEN
    RETURN NULL;
  END IF;

  -- Try to find existing company by name and client
  SELECT id INTO v_company_id
  FROM crm_companies
  WHERE client = p_client
    AND LOWER(TRIM(name)) = LOWER(TRIM(p_company_name))
  LIMIT 1;

  -- If company exists, update it with new data if provided
  IF v_company_id IS NOT NULL THEN
    UPDATE crm_companies
    SET 
      industry = COALESCE(p_industry, industry),
      annual_revenue = COALESCE(p_annual_revenue, annual_revenue),
      updated_at = NOW()
    WHERE id = v_company_id;
    
    RETURN v_company_id;
  END IF;

  -- Create new company
  INSERT INTO crm_companies (
    id,
    client,
    name,
    industry,
    annual_revenue,
    status,
    tags,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_client,
    TRIM(p_company_name),
    p_industry,
    p_annual_revenue,
    'prospect', -- Default status
    ARRAY[]::TEXT[], -- Empty tags array
    NOW(),
    NOW()
  )
  RETURNING id INTO v_company_id;

  RETURN v_company_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTION: Map Engaged Lead Status to Contact Status
-- ============================================
CREATE OR REPLACE FUNCTION map_lead_status_to_contact_status(
  p_replied BOOLEAN DEFAULT FALSE,
  p_interested BOOLEAN DEFAULT FALSE,
  p_qualified BOOLEAN DEFAULT FALSE,
  p_closed_won BOOLEAN DEFAULT FALSE,
  p_closed_lost BOOLEAN DEFAULT FALSE
) RETURNS TEXT AS $$
BEGIN
  -- Map engaged_lead boolean flags to contact status
  IF p_closed_won THEN
    RETURN 'customer';
  ELSIF p_closed_lost THEN
    RETURN 'inactive';
  ELSIF p_qualified THEN
    RETURN 'in-contract';
  ELSIF p_interested THEN
    RETURN 'hot';
  ELSIF p_replied THEN
    RETURN 'warm';
  ELSE
    RETURN 'cold';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MAIN SYNC FUNCTION: Sync Engaged Lead to CRM
-- ============================================
CREATE OR REPLACE FUNCTION sync_engaged_lead_to_crm()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
  v_contact_id UUID;
  v_contact_status TEXT;
  v_campaign_name TEXT;
  v_campaign_id TEXT;
BEGIN
  -- Skip if email is missing (required for contacts)
  IF NEW.email IS NULL OR TRIM(NEW.email) = '' THEN
    RETURN NEW;
  END IF;

  -- Get or create company if company name exists
  IF NEW.company IS NOT NULL AND TRIM(NEW.company) != '' THEN
    v_company_id := get_or_create_company(
      NEW.client,
      NEW.company,
      NEW.industry,
      NEW.annual_revenue
    );
  END IF;

  -- Determine contact status from engaged_lead flags
  v_contact_status := map_lead_status_to_contact_status(
    COALESCE(NEW.replied, FALSE),
    COALESCE(NEW.interested, FALSE),
    COALESCE(NEW.qualified, FALSE),
    COALESCE(NEW.closed_won, FALSE),
    COALESCE(NEW.closed_lost, FALSE)
  );

  -- Extract campaign_name and campaign_id from NEW record
  -- If these columns don't exist in engaged_leads, add them first:
  -- ALTER TABLE engaged_leads ADD COLUMN IF NOT EXISTS campaign_name TEXT;
  -- ALTER TABLE engaged_leads ADD COLUMN IF NOT EXISTS campaign_id TEXT;
  v_campaign_name := NEW.campaign_name;
  v_campaign_id := NEW.campaign_id;

  -- Check if contact already exists by email and client
  SELECT id INTO v_contact_id
  FROM crm_contacts
  WHERE client = NEW.client
    AND LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
    AND (deleted_at IS NULL)
  LIMIT 1;

  IF v_contact_id IS NOT NULL THEN
    -- Update existing contact
    UPDATE crm_contacts
    SET
      company_id = COALESCE(v_company_id, company_id), -- Only update if we found/created a company
      first_name = COALESCE(NEW.first_name, first_name),
      last_name = COALESCE(NEW.last_name, last_name),
      full_name = COALESCE(
        NEW.full_name,
        CASE 
          WHEN NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL 
          THEN TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''))
          ELSE full_name
        END
      ),
      title = COALESCE(NEW.title, title),
      status = v_contact_status, -- Always update status based on latest engaged_lead flags
      campaign_name = COALESCE(v_campaign_name, campaign_name),
      campaign_id = COALESCE(v_campaign_id, campaign_id),
      updated_at = NOW()
    WHERE id = v_contact_id;
  ELSE
    -- Create new contact
    INSERT INTO crm_contacts (
      id,
      client,
      company_id,
      first_name,
      last_name,
      full_name,
      email,
      title,
      status,
      lead_source,
      campaign_name,
      campaign_id,
      tags,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      NEW.client,
      v_company_id,
      NEW.first_name,
      NEW.last_name,
      COALESCE(
        NEW.full_name,
        TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''))
      ),
      TRIM(NEW.email),
      NEW.title,
      v_contact_status,
      'email_campaign', -- Default lead source
      v_campaign_name,
      v_campaign_id,
      ARRAY[]::TEXT[], -- Empty tags array
      COALESCE(NEW.created_at, NOW()),
      NOW()
    )
    RETURNING id INTO v_contact_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-sync on INSERT
-- ============================================
DROP TRIGGER IF EXISTS sync_engaged_lead_to_crm_on_insert ON engaged_leads;

CREATE TRIGGER sync_engaged_lead_to_crm_on_insert
  AFTER INSERT ON engaged_leads
  FOR EACH ROW
  EXECUTE FUNCTION sync_engaged_lead_to_crm();

-- ============================================
-- TRIGGER: Auto-sync on UPDATE (for status changes)
-- ============================================
DROP TRIGGER IF EXISTS sync_engaged_lead_to_crm_on_update ON engaged_leads;

CREATE TRIGGER sync_engaged_lead_to_crm_on_update
  AFTER UPDATE ON engaged_leads
  FOR EACH ROW
  WHEN (
    -- Only trigger if relevant fields changed
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name OR
    OLD.company IS DISTINCT FROM NEW.company OR
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.replied IS DISTINCT FROM NEW.replied OR
    OLD.interested IS DISTINCT FROM NEW.interested OR
    OLD.qualified IS DISTINCT FROM NEW.qualified OR
    OLD.closed_won IS DISTINCT FROM NEW.closed_won OR
    OLD.closed_lost IS DISTINCT FROM NEW.closed_lost OR
    OLD.industry IS DISTINCT FROM NEW.industry OR
    OLD.annual_revenue IS DISTINCT FROM NEW.annual_revenue
  )
  EXECUTE FUNCTION sync_engaged_lead_to_crm();

-- ============================================
-- NOTES
-- ============================================
-- This migration automatically syncs engaged_leads to CRM when:
-- 1. New engaged_leads are inserted via API
-- 2. Existing engaged_leads are updated (status changes, etc.)
--
-- How it works:
-- - Creates companies automatically from engaged_leads.company
-- - Creates/updates contacts from engaged_leads data
-- - Maps engaged_lead boolean flags to contact status:
--   * closed_won → 'customer'
--   * closed_lost → 'inactive'
--   * qualified → 'in-contract'
--   * interested → 'hot'
--   * replied → 'warm'
--   * default → 'cold'
--
-- IMPORTANT: If your engaged_leads table doesn't have campaign_name and campaign_id columns,
-- you need to add them first:
--
-- ALTER TABLE engaged_leads 
--   ADD COLUMN IF NOT EXISTS campaign_name TEXT,
--   ADD COLUMN IF NOT EXISTS campaign_id TEXT;
--
-- Then the sync function will automatically populate these fields in crm_contacts.
-- ============================================================================
