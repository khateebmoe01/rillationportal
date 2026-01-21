-- ============================================================================
-- ENHANCE CRM CONTACTS TABLE - Add Missing Fields
-- ============================================================================
-- Migration: Add company fields, pipeline fields, and sync engaged_leads fields
-- Created: 2025-01-10
-- Description: Prepare crm_contacts for companies table merger
-- ============================================================================

-- ============================================
-- ADD COMPANY FIELDS TO CRM_CONTACTS
-- ============================================
-- These fields will replace the need for crm_companies table

ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_domain TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_linkedin TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_phone TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_industry TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS annual_revenue TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_hq_city TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_hq_state TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_hq_country TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS year_founded INTEGER;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS funding_stage TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS tech_stack TEXT[];
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS is_hiring BOOLEAN DEFAULT FALSE;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS growth_score TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS num_locations INTEGER;

-- Additional company fields from crm_companies that might be useful
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_postal_code TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company_sector TEXT;

-- ============================================
-- ADD PIPELINE/SALES FIELDS TO CRM_CONTACTS
-- ============================================
-- These fields support sales workflow management

ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'new';
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS epv DECIMAL(12,2); -- Estimated Pipeline Value
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS context TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS next_touch TIMESTAMP WITH TIME ZONE;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS assignee TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS notes TEXT;

-- Meeting fields
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS meeting_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS rescheduling_link TEXT;

-- Additional contact info
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS lead_phone TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS seniority_level TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS profile_url TEXT; -- Personal LinkedIn URL

-- ============================================
-- ADD FLEXIBLE DATA STORAGE
-- ============================================
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS custom_variables_jsonb JSONB DEFAULT '{}';

-- ============================================
-- ADD MISSING FIELDS TO ENGAGED_LEADS (if not exists)
-- ============================================
-- Ensure engaged_leads has epv for sync purposes
ALTER TABLE engaged_leads ADD COLUMN IF NOT EXISTS epv DECIMAL(12,2);
ALTER TABLE engaged_leads ADD COLUMN IF NOT EXISTS company_linkedin TEXT;
ALTER TABLE engaged_leads ADD COLUMN IF NOT EXISTS custom_variables_jsonb JSONB DEFAULT '{}';

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company_name ON crm_contacts(company_name);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_stage ON crm_contacts(stage);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_next_touch ON crm_contacts(next_touch);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);

-- ============================================
-- MIGRATE DATA FROM CRM_COMPANIES TO CRM_CONTACTS
-- ============================================
-- Update existing contacts with company data from their linked companies

UPDATE crm_contacts cc
SET 
  company_name = comp.name,
  company_domain = comp.website, -- company domain often stored as website
  company_linkedin = comp.linkedin_url,
  company_phone = comp.phone,
  company_website = comp.website,
  company_size = comp.company_size,
  company_industry = comp.industry,
  annual_revenue = comp.annual_revenue,
  company_hq_city = comp.city,
  company_hq_state = comp.state,
  company_hq_country = comp.country,
  year_founded = comp.year_founded,
  company_logo_url = comp.logo_url,
  company_address = comp.address,
  company_postal_code = comp.postal_code,
  company_sector = comp.sector
FROM crm_companies comp
WHERE cc.company_id = comp.id
  AND cc.company_id IS NOT NULL;

-- ============================================
-- NOTES
-- ============================================
-- This migration:
-- 1. Adds all company-related fields to crm_contacts
-- 2. Adds pipeline/sales fields for CRM workflow
-- 3. Adds flexible JSONB storage for custom data
-- 4. Migrates existing data from crm_companies to crm_contacts
-- 
-- Next migration will:
-- - Update foreign keys in crm_deals, crm_tasks, crm_notes
-- - Drop company_id from crm_contacts
-- - Drop crm_companies table
-- ============================================================================
