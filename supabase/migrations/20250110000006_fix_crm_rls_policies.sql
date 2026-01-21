-- ============================================================================
-- FIX CRM RLS POLICIES TO USE DATABASE FUNCTION
-- ============================================================================
-- Migration: Fix CRM RLS policies to use get_user_client function
-- Created: 2025-01-15
-- Description: Updates RLS policies to use get_user_client() function instead
--              of auth.jwt() ->> 'client' which doesn't work because user
--              metadata is not automatically included in JWT tokens
-- ============================================================================

-- ============================================
-- CRM_COMPANIES TABLE
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can only see their client's companies" ON crm_companies;
DROP POLICY IF EXISTS "Users can only insert companies for their client" ON crm_companies;
DROP POLICY IF EXISTS "Users can only update their client's companies" ON crm_companies;
DROP POLICY IF EXISTS "Users can only delete their client's companies" ON crm_companies;

-- Create policies using get_user_client function
CREATE POLICY "Users can only see their client's companies"
ON crm_companies
FOR SELECT
TO authenticated
USING (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only insert companies for their client"
ON crm_companies
FOR INSERT
TO authenticated
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only update their client's companies"
ON crm_companies
FOR UPDATE
TO authenticated
USING (client = get_user_client(auth.uid()))
WITH CHECK (client = get_user_client(auth.uid()));

CREATE POLICY "Users can only delete their client's companies"
ON crm_companies
FOR DELETE
TO authenticated
USING (client = get_user_client(auth.uid()));

-- ============================================
-- CRM_CONTACTS TABLE
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can only see their client's contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only insert contacts for their client" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only update their client's contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can only delete their client's contacts" ON crm_contacts;

-- Create policies using get_user_client function
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
-- CRM_DEALS TABLE
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can only see their client's deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can only insert deals for their client" ON crm_deals;
DROP POLICY IF EXISTS "Users can only update their client's deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can only delete their client's deals" ON crm_deals;

-- Create policies using get_user_client function
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
-- CRM_TASKS TABLE
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can only see their client's tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only insert tasks for their client" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only update their client's tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Users can only delete their client's tasks" ON crm_tasks;

-- Create policies using get_user_client function
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
-- CRM_NOTES TABLE
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can only see their client's notes" ON crm_notes;
DROP POLICY IF EXISTS "Users can only insert notes for their client" ON crm_notes;
DROP POLICY IF EXISTS "Users can only update their client's notes" ON crm_notes;
DROP POLICY IF EXISTS "Users can only delete their client's notes" ON crm_notes;

-- Create policies using get_user_client function
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

-- ============================================================================
-- NOTES
-- ============================================================================
-- These policies now use get_user_client(auth.uid()) which queries the
-- auth.users table to get the client from raw_user_meta_data.client.
-- This is more reliable than auth.jwt() ->> 'client' because user metadata
-- is not automatically included in JWT tokens by default in Supabase.
--
-- The get_user_client function is defined in migration 20250110000001
-- and requires SECURITY DEFINER to access auth.users table.
-- ============================================================================
