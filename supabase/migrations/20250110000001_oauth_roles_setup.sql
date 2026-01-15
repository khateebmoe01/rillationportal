-- ============================================================================
-- OAUTH ROLES SETUP
-- ============================================================================
-- Migration: OAuth Roles and User Metadata
-- Created: 2025-01-10
-- Description: Helper functions and documentation for OAuth role management
-- ============================================================================

-- ============================================
-- NOTES FOR OAUTH SETUP
-- ============================================================================
-- This migration provides documentation and helper functions for managing
-- OAuth users with roles (admin vs client) and client assignments.
--
-- USER METADATA STRUCTURE:
-- {
--   "role": "admin" | "client",
--   "client": "ClientName" (only for client role)
-- }
--
-- ============================================
-- SETTING UP OAUTH PROVIDERS
-- ============================================================================
-- 1. Go to Supabase Dashboard > Authentication > Providers
-- 2. Enable your OAuth providers (Google, GitHub, Azure AD, etc.)
-- 3. Configure redirect URLs:
--    - Internal Hub: https://your-internal-hub.com/auth/callback
--    - Client Portal: https://your-portal.com/auth/callback
--
-- ============================================
-- USER ROLE ASSIGNMENT
-- ============================================================================
-- Option 1: Manual Assignment (via Supabase Dashboard)
--   1. Go to Authentication > Users
--   2. Select a user
--   3. Edit User Metadata
--   4. Add:
--      {
--        "role": "client",
--        "client": "ClientName"
--      }
--      OR
--      {
--        "role": "admin"
--      }
--
-- Option 2: Automatic Assignment (via OAuth Claims)
--   Configure your OAuth provider to include role/client in claims
--   Then use a database trigger or Edge Function to map claims to metadata
--
-- Option 3: Post-Auth Hook (Recommended)
--   Create a Supabase Edge Function that runs after OAuth sign-in
--   to automatically assign role/client based on email domain or other criteria
--
-- ============================================
-- HELPER FUNCTION: Update User Role
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_role(
  user_id UUID,
  user_role TEXT,
  user_client TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(user_role)
  )
  WHERE id = user_id;

  -- If client role, also set client
  IF user_role = 'client' AND user_client IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      raw_user_meta_data,
      '{client}',
      to_jsonb(user_client)
    )
    WHERE id = user_id;
  END IF;
END;
$$;

-- ============================================
-- HELPER FUNCTION: Get User Role
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (raw_user_meta_data->>'role'),
    'client'
  )::TEXT
  FROM auth.users
  WHERE id = user_id;
$$;

-- ============================================
-- HELPER FUNCTION: Get User Client
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_client(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (raw_user_meta_data->>'client')::TEXT
  FROM auth.users
  WHERE id = user_id;
$$;

-- ============================================
-- EXAMPLE: Bulk Assign Clients to Users
-- ============================================================================
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   COALESCE(raw_user_meta_data, '{}'::jsonb),
--   '{role}',
--   '"client"'
-- )
-- WHERE email LIKE '%@clientdomain.com';
--
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   raw_user_meta_data,
--   '{client}',
--   '"ClientName"'
-- )
-- WHERE email LIKE '%@clientdomain.com';

-- ============================================================================
-- RLS POLICY UPDATES FOR ROLE-BASED ACCESS
-- ============================================================================
-- The existing RLS policies check: client = (auth.jwt() ->> 'client')
-- 
-- For admins who should see all data, you can modify policies like this:
--
-- CREATE POLICY "Admins see all, clients see their own"
-- ON replies
-- FOR SELECT
-- TO authenticated
-- USING (
--   (auth.jwt() ->> 'role') = 'admin'
--   OR
--   client = (auth.jwt() ->> 'client')
-- );
--
-- However, for the CLIENT PORTAL, we want strict isolation,
-- so we keep the existing policies that only check client.
--
-- The INTERNAL HUB should have separate policies that allow admins
-- to see all data.

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. OAuth providers must be configured in Supabase Dashboard
-- 2. Redirect URLs must match your app domains
-- 3. User metadata is set after first OAuth sign-in (manually or via hook)
-- 4. Role 'admin' = can see all clients (internal hub)
-- 5. Role 'client' = can only see their assigned client (portal)
-- ============================================================================
