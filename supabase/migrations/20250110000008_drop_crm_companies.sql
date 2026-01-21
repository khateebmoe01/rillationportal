-- ============================================================================
-- DROP CRM_COMPANIES TABLE AND CLEAN UP FOREIGN KEYS
-- ============================================================================
-- Migration: Remove company_id FKs and drop crm_companies table
-- Created: 2025-01-10
-- Description: Complete the merger of companies into contacts
-- ============================================================================

-- ============================================
-- DROP FOREIGN KEY CONSTRAINTS
-- ============================================
-- Remove all foreign key constraints referencing crm_companies

ALTER TABLE crm_contacts DROP CONSTRAINT IF EXISTS crm_contacts_company_id_fkey;
ALTER TABLE crm_deals DROP CONSTRAINT IF EXISTS crm_deals_company_id_fkey;
ALTER TABLE crm_tasks DROP CONSTRAINT IF EXISTS crm_tasks_company_id_fkey;
ALTER TABLE crm_notes DROP CONSTRAINT IF EXISTS crm_notes_company_id_fkey;

-- ============================================
-- DROP COMPANY_ID COLUMNS
-- ============================================
-- Remove company_id from all CRM tables

ALTER TABLE crm_contacts DROP COLUMN IF EXISTS company_id;
ALTER TABLE crm_deals DROP COLUMN IF EXISTS company_id;
ALTER TABLE crm_tasks DROP COLUMN IF EXISTS company_id;
ALTER TABLE crm_notes DROP COLUMN IF EXISTS company_id;

-- ============================================
-- DROP RLS POLICIES ON CRM_COMPANIES
-- ============================================
DROP POLICY IF EXISTS "Users can only see their client's companies" ON crm_companies;
DROP POLICY IF EXISTS "Users can only insert companies for their client" ON crm_companies;
DROP POLICY IF EXISTS "Users can only update their client's companies" ON crm_companies;
DROP POLICY IF EXISTS "Users can only delete their client's companies" ON crm_companies;

-- ============================================
-- DROP CRM_COMPANIES TABLE
-- ============================================
DROP TABLE IF EXISTS crm_companies CASCADE;

-- ============================================
-- UPDATE RLS POLICIES FOR CRM_CONTACTS
-- ============================================
-- Drop old policies and create new ones using get_user_client function

DROP POLICY IF EXISTS "Users can only see their client's contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only insert contacts for their client" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only update their client's contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only delete their client's contacts" ON crm_contacts;

CREATE POLICY "Users can only see their client's contacts"
ON crm_contacts
FOR SELECT
TO authenticated
USING (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only insert contacts for their client"
ON crm_contacts
FOR INSERT
TO authenticated
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only update their client's contacts"
ON crm_contacts
FOR UPDATE
TO authenticated
USING (client = get_user_client(auth.uid()))
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only delete their client's contacts"
ON crm_contacts
FOR DELETE
TO authenticated
USING (client = get_user_client(auth.uid()));

-- ============================================
-- UPDATE RLS POLICIES FOR CRM_DEALS
-- ============================================
DROP POLICY IF EXISTS "Users can only see their client's deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can only insert deals for their client" ON crm_deals;
DROP POLICY IF EXISTS "Users can only update their client's deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can only delete their client's deals" ON crm_deals;

CREATE POLICY "Users can only see their client's deals"
ON crm_deals
FOR SELECT
TO authenticated
USING (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only insert deals for their client"
ON crm_deals
FOR INSERT
TO authenticated
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only update their client's deals"
ON crm_deals
FOR UPDATE
TO authenticated
USING (client = get_user_client(auth.uid()))
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only delete their client's deals"
ON crm_deals
FOR DELETE
TO authenticated
USING (client = get_user_client(auth.uid()));

-- ============================================
-- UPDATE RLS POLICIES FOR CRM_TASKS
-- ============================================
DROP POLICY IF EXISTS "Users can only see their client's tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only insert tasks for their client" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only update their client's tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only delete their client's tasks" ON crm_tasks;

CREATE POLICY "Users can only see their client's tasks"
ON crm_tasks
FOR SELECT
TO authenticated
USING (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only insert tasks for their client"
ON crm_tasks
FOR INSERT
TO authenticated
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only update their client's tasks"
ON crm_tasks
FOR UPDATE
TO authenticated
USING (client = get_user_client(auth.uid()))
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only delete their client's tasks"
ON crm_tasks
FOR DELETE
TO authenticated
USING (client = get_user_client(auth.uid()));

-- ============================================
-- UPDATE RLS POLICIES FOR CRM_NOTES
-- ============================================
DROP POLICY IF EXISTS "Users can only see their client's notes" ON crm_notes;
DROP POLICY IF EXISTS "Users can only insert notes for their client" ON crm_notes;
DROP POLICY IF EXISTS "Users can only update their client's notes" ON crm_notes;
DROP POLICY IF EXISTS "Users can only delete their client's notes" ON crm_notes;

CREATE POLICY "Users can only see their client's notes"
ON crm_notes
FOR SELECT
TO authenticated
USING (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only insert notes for their client"
ON crm_notes
FOR INSERT
TO authenticated
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only update their client's notes"
ON crm_notes
FOR UPDATE
TO authenticated
USING (client = get_user_client(auth.uid()))
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only delete their client's notes"
ON crm_notes
FOR DELETE
TO authenticated
USING (client = get_user_client(auth.uid()));

-- ============================================
-- NOTES
-- ============================================
-- This migration:
-- 1. Removes all foreign key constraints to crm_companies
-- 2. Drops company_id columns from all CRM tables
-- 3. Drops the crm_companies table
-- 4. Updates all RLS policies to use get_user_client(auth.uid())
-- ============================================================================
