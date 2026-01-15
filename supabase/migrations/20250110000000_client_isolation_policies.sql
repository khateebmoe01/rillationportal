-- ============================================================================
-- CLIENT ISOLATION POLICIES
-- ============================================================================
-- Migration: Client-Based Row Level Security
-- Created: 2025-01-10
-- Description: Update RLS policies to filter data by user's client from metadata
-- ============================================================================

-- Helper function to get client from user metadata
-- This assumes client is stored in auth.users.raw_user_meta_data.client

-- ============================================
-- REPLIES TABLE
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read replies" ON replies;
DROP POLICY IF EXISTS "Allow authenticated users to insert replies" ON replies;
DROP POLICY IF EXISTS "Allow authenticated users to update replies" ON replies;

-- Create client-based policies
CREATE POLICY "Users can only see their client's replies"
ON replies
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only insert replies for their client"
ON replies
FOR INSERT
TO authenticated
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only update their client's replies"
ON replies
FOR UPDATE
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

-- ============================================
-- MEETINGS_BOOKED TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow authenticated users to read meetings_booked" ON meetings_booked;
DROP POLICY IF EXISTS "Allow authenticated users to insert meetings_booked" ON meetings_booked;
DROP POLICY IF EXISTS "Allow authenticated users to update meetings_booked" ON meetings_booked;

CREATE POLICY "Users can only see their client's meetings"
ON meetings_booked
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only insert meetings for their client"
ON meetings_booked
FOR INSERT
TO authenticated
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only update their client's meetings"
ON meetings_booked
FOR UPDATE
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

-- ============================================
-- CLIENT_OPPORTUNITIES TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow authenticated users to read client_opportunities" ON client_opportunities;
DROP POLICY IF EXISTS "Allow authenticated users to manage client_opportunities" ON client_opportunities;

CREATE POLICY "Users can only see their client's opportunities"
ON client_opportunities
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only manage their client's opportunities"
ON client_opportunities
FOR ALL
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

-- ============================================
-- ENGAGED_LEADS TABLE
-- ============================================
-- Enable RLS if not already enabled
ALTER TABLE engaged_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only see their client's engaged leads" ON engaged_leads;
DROP POLICY IF EXISTS "Users can only manage their client's engaged leads" ON engaged_leads;

CREATE POLICY "Users can only see their client's engaged leads"
ON engaged_leads
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only manage their client's engaged leads"
ON engaged_leads
FOR ALL
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

-- ============================================
-- CAMPAIGN_REPORTING TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow authenticated users to read campaign_reporting" ON campaign_reporting;

CREATE POLICY "Users can only see their client's campaign reporting"
ON campaign_reporting
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

-- ============================================
-- CLIENT_TARGETS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow authenticated users to read client_targets" ON client_targets;
DROP POLICY IF EXISTS "Allow authenticated users to manage client_targets" ON client_targets;

CREATE POLICY "Users can only see their client's targets"
ON client_targets
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only manage their client's targets"
ON client_targets
FOR ALL
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

-- ============================================
-- CLIENT_ITERATION_LOGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow authenticated users to read client_iteration_logs" ON client_iteration_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert client_iteration_logs" ON client_iteration_logs;
DROP POLICY IF EXISTS "Allow authenticated users to update client_iteration_logs" ON client_iteration_logs;

CREATE POLICY "Users can only see their client's iteration logs"
ON client_iteration_logs
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only insert iteration logs for their client"
ON client_iteration_logs
FOR INSERT
TO authenticated
WITH CHECK (client = (auth.jwt() ->> 'client'));

CREATE POLICY "Users can only update their client's iteration logs"
ON client_iteration_logs
FOR UPDATE
TO authenticated
USING (client = (auth.jwt() ->> 'client'))
WITH CHECK (client = (auth.jwt() ->> 'client'));

-- ============================================================================
-- NOTES
-- ============================================================================
-- These policies ensure that users can only access data where:
--   client = (auth.jwt() ->> 'client')
--
-- The client value is extracted from the user's JWT token metadata.
-- To set a user's client, update their user_metadata in Supabase Auth:
--   UPDATE auth.users SET raw_user_meta_data = jsonb_set(
--     COALESCE(raw_user_meta_data, '{}'::jsonb),
--     '{client}',
--     '"ClientName"'
--   ) WHERE id = 'user-id';
--
-- Or via Supabase Dashboard:
--   Authentication > Users > Select User > User Metadata > Add "client": "ClientName"
-- ============================================================================
