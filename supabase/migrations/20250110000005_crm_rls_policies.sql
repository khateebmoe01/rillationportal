-- ============================================================================
-- CRM TABLES ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- Migration: RLS policies for Atomic CRM tables
-- Created: 2025-01-10
-- Description: Ensures users can only access CRM data for their assigned client
-- ============================================================================

-- ============================================
-- CRM_COMPANIES TABLE
-- ============================================
-- Enable RLS
ALTER TABLE crm_companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only see their client's companies" ON crm_companies;
DROP POLICY IF EXISTS "Users can only insert companies for their client" ON crm_companies;
DROP POLICY IF EXISTS "Users can only update their client's companies" ON crm_companies;
DROP POLICY IF EXISTS "Users can only delete their client's companies" ON crm_companies;

-- Create policies
CREATE POLICY "Users can only see their client's companies"
ON crm_companies
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only insert companies for their client"
ON crm_companies
FOR INSERT
TO authenticated
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only update their client's companies"
ON crm_companies
FOR UPDATE
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only delete their client's companies"
ON crm_companies
FOR DELETE
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

-- ============================================
-- CRM_CONTACTS TABLE
-- ============================================
-- Enable RLS
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only see their client's contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only insert contacts for their client" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only update their client's contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only delete their client's contacts" ON crm_contacts;

-- Create policies
CREATE POLICY "Users can only see their client's contacts"
ON crm_contacts
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only insert contacts for their client"
ON crm_contacts
FOR INSERT
TO authenticated
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only update their client's contacts"
ON crm_contacts
FOR UPDATE
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only delete their client's contacts"
ON crm_contacts
FOR DELETE
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

-- ============================================
-- CRM_DEALS TABLE
-- ============================================
-- Enable RLS
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only see their client's deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can only insert deals for their client" ON crm_deals;
DROP POLICY IF EXISTS "Users can only update their client's deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can only delete their client's deals" ON crm_deals;

-- Create policies
CREATE POLICY "Users can only see their client's deals"
ON crm_deals
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only insert deals for their client"
ON crm_deals
FOR INSERT
TO authenticated
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only update their client's deals"
ON crm_deals
FOR UPDATE
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only delete their client's deals"
ON crm_deals
FOR DELETE
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

-- ============================================
-- CRM_TASKS TABLE
-- ============================================
-- Enable RLS
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only see their client's tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only insert tasks for their client" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only update their client's tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only delete their client's tasks" ON crm_tasks;

-- Create policies
CREATE POLICY "Users can only see their client's tasks"
ON crm_tasks
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only insert tasks for their client"
ON crm_tasks
FOR INSERT
TO authenticated
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only update their client's tasks"
ON crm_tasks
FOR UPDATE
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only delete their client's tasks"
ON crm_tasks
FOR DELETE
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

-- ============================================
-- CRM_NOTES TABLE
-- ============================================
-- Enable RLS
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only see their client's notes" ON crm_notes;
DROP POLICY IF EXISTS "Users can only insert notes for their client" ON crm_notes;
DROP POLICY IF EXISTS "Users can only update their client's notes" ON crm_notes;
DROP POLICY IF EXISTS "Users can only delete their client's notes" ON crm_notes;

-- Create policies
CREATE POLICY "Users can only see their client's notes"
ON crm_notes
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only insert notes for their client"
ON crm_notes
FOR INSERT
TO authenticated
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only update their client's notes"
ON crm_notes
FOR UPDATE
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only delete their client's notes"
ON crm_notes
FOR DELETE
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

-- ============================================================================
-- NOTES
-- ============================================================================
-- These policies ensure that:
-- 1. Users can only see CRM data for their assigned client
-- 2. Users can only create/update/delete CRM data for their assigned client
-- 3. The client is extracted from the JWT token metadata (auth.jwt() ->> 'client')
--
-- The sync trigger from migration 20250110000004 will automatically create
-- contacts and companies when engaged_leads are inserted, and the RLS policies
-- ensure users can only see their own client's data.
-- ============================================================================
