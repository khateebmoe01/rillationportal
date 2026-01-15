-- ============================================================================
-- AUTO ASSIGN CLIENT TO USERS
-- ============================================================================
-- Migration: Automatic Client Assignment
-- Created: 2025-01-10
-- Description: Automatically assign client to users based on email domain
-- ============================================================================

-- Create a table to map email domains to clients
CREATE TABLE IF NOT EXISTS email_client_mapping (
  id SERIAL PRIMARY KEY,
  email_domain TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your client email domains here
-- Example:
-- INSERT INTO email_client_mapping (email_domain, client_name) VALUES
--   ('@client1.com', 'Client1'),
--   ('@client2.com', 'Client2'),
--   ('@acmecorp.com', 'Acme Corp');

-- Function to automatically assign client when user signs up
CREATE OR REPLACE FUNCTION auto_assign_client()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  email_domain TEXT;
  assigned_client TEXT;
BEGIN
  -- Get user email
  user_email := NEW.email;
  
  -- Extract domain from email
  email_domain := '@' || split_part(user_email, '@', 2);
  
  -- Look up client from mapping table
  SELECT client_name INTO assigned_client
  FROM email_client_mapping
  WHERE email_domain = email_domain;
  
  -- If found, assign client
  IF assigned_client IS NOT NULL THEN
    NEW.raw_user_meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    NEW.raw_user_meta_data := jsonb_set(
      NEW.raw_user_meta_data,
      '{client}',
      to_jsonb(assigned_client)
    );
    NEW.raw_user_meta_data := jsonb_set(
      NEW.raw_user_meta_data,
      '{role}',
      '"client"'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on user creation
DROP TRIGGER IF EXISTS trigger_auto_assign_client ON auth.users;
CREATE TRIGGER trigger_auto_assign_client
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_client();

-- ============================================================================
-- HOW TO USE
-- ============================================================================
-- 1. Add your email domain mappings:
--    INSERT INTO email_client_mapping (email_domain, client_name) 
--    VALUES ('@client1.com', 'Client1');
--
-- 2. When a new user signs up with email ending in @client1.com,
--    they will automatically get client: "Client1" and role: "client"
--
-- 3. For existing users, you can bulk update:
--    UPDATE auth.users u
--    SET raw_user_meta_data = jsonb_set(
--      COALESCE(raw_user_meta_data, '{}'::jsonb),
--      '{client}',
--      to_jsonb(m.client_name)
--    )
--    FROM email_client_mapping m
--    WHERE u.email LIKE '%' || m.email_domain
--    AND (raw_user_meta_data->>'client') IS NULL;
-- ============================================================================
