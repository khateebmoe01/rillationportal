-- ============================================================================
-- BULK ASSIGN CLIENTS TO EXISTING USERS
-- ============================================================================
-- Migration: Bulk Assign Clients
-- Created: 2025-01-10
-- Description: One-time script to assign clients to all existing users
-- ============================================================================

-- First, make sure email_client_mapping table exists and has your mappings
-- (This should be done in the previous migration)

-- Bulk update all existing users based on email domain
UPDATE auth.users u
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{client}',
    to_jsonb(m.client_name)
  ),
  '{role}',
  '"client"'
)
FROM email_client_mapping m
WHERE u.email LIKE '%' || m.email_domain
AND (
  (raw_user_meta_data->>'client') IS NULL 
  OR (raw_user_meta_data->>'role') IS NULL
);

-- ============================================================================
-- MANUAL ASSIGNMENTS (if email domain doesn't match)
-- ============================================================================
-- For users that don't match any domain, assign manually:
--
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(
--   jsonb_set(
--     COALESCE(raw_user_meta_data, '{}'::jsonb),
--     '{client}',
--     '"ClientName"'
--   ),
--   '{role}',
--   '"client"'
-- )
-- WHERE email = 'specific@email.com';
-- ============================================================================
