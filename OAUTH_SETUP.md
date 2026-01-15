# OAuth Setup Guide for Client Portal

This guide explains how to set up OAuth authentication for the client portal while maintaining separation from the internal hub.

## Architecture Overview

- **Internal Hub** (`rillation-sb-react`): Admin users with `role: 'admin'` can see all clients
- **Client Portal** (`rillationportal`): Client users with `role: 'client'` and `client: 'ClientName'` can only see their own data

Both systems use the **same Supabase project** but differentiate users by metadata.

## User Metadata Structure

```json
{
  "role": "admin" | "client",
  "client": "ClientName"  // Only required for client role
}
```

## Step 1: Configure OAuth Providers in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable your OAuth providers:
   - **Google**
   - **GitHub**
   - **Azure AD** (Microsoft)
   - Any other providers you need

3. For each provider, configure:
   - **Client ID** and **Client Secret** (from your OAuth app)
   - **Redirect URLs**:
     - Internal Hub: `https://your-internal-hub.com/auth/callback`
     - Client Portal: `https://your-portal.com/auth/callback`

## Step 2: Set Up OAuth Apps

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://[your-project].supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

### GitHub OAuth
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL:
   - `https://[your-project].supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

### Azure AD OAuth
1. Go to Azure Portal → App Registrations
2. Create new registration
3. Add redirect URI:
   - `https://[your-project].supabase.co/auth/v1/callback`
4. Copy Application (client) ID and Secret to Supabase

## Step 3: Assign User Roles and Clients

After users sign in via OAuth, you need to assign their role and client.

### Option A: Manual Assignment (Supabase Dashboard)

1. Go to **Authentication** → **Users**
2. Find the user (they'll appear after first OAuth sign-in)
3. Click on the user → **User Metadata**
4. Add:
   ```json
   {
     "role": "client",
     "client": "ClientName"
   }
   ```

### Option B: Automatic Assignment via Database Function

Use the helper function from the migration:

```sql
-- Assign client role and client name
SELECT update_user_role(
  'user-id-here'::UUID,
  'client',
  'ClientName'
);

-- Or assign admin role
SELECT update_user_role(
  'user-id-here'::UUID,
  'admin',
  NULL
);
```

### Option C: Post-Auth Hook (Recommended for Production)

Create a Supabase Edge Function that runs after OAuth sign-in:

```typescript
// supabase/functions/assign-user-role/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user } = await req.json()
  
  // Determine role and client based on email domain or other criteria
  const email = user.email
  const isAdmin = email.endsWith('@yourcompany.com')
  
  if (isAdmin) {
    // Update user metadata to admin
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' }
    })
  } else {
    // Extract client from email domain or lookup table
    const client = extractClientFromEmail(email)
    
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { 
        role: 'client',
        client: client
      }
    })
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Then configure it as a webhook in Supabase:
- **Database** → **Webhooks** → **New Webhook**
- Trigger: `auth.users` table, `INSERT` event
- Action: Call your Edge Function

## Step 4: Update RLS Policies

The existing migration (`20250110000000_client_isolation_policies.sql`) already sets up client-based RLS.

**For Client Portal**: Policies are strict - users can only see their client's data.

**For Internal Hub**: You may want to add admin override. Update policies like:

```sql
-- Example: Allow admins to see all, clients to see their own
DROP POLICY IF EXISTS "Users can only see their client's replies" ON replies;

CREATE POLICY "Admins see all, clients see their own replies"
ON replies
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'admin'
  OR
  client = (auth.jwt() ->> 'client')
);
```

## Step 5: Test OAuth Flow

1. Go to your portal login page
2. Click an OAuth provider button (Google, GitHub, etc.)
3. Complete OAuth sign-in
4. You'll be redirected to `/auth/callback`
5. The callback handler checks for role and client
6. If valid, redirects to `/crm`

## Troubleshooting

### "No Client Assigned" Error
- User signed in but doesn't have `client` in metadata
- Solution: Assign client via Supabase Dashboard or database function

### "Access Denied" Error
- User has `role: 'admin'` but is trying to access portal
- Solution: Admin users should use the internal hub, not the portal

### OAuth Redirect Fails
- Check redirect URLs match exactly in OAuth provider settings
- Ensure Supabase project URL is correct
- Check browser console for errors

### User Can See Other Clients' Data
- RLS policies not applied correctly
- Check that user metadata has correct `client` value
- Verify migration `20250110000000_client_isolation_policies.sql` was applied

## Security Notes

1. **Never trust client-side role checks alone** - RLS policies enforce security at the database level
2. **Admin users** should use the internal hub, not the portal
3. **Client users** are automatically restricted by RLS policies
4. **User metadata** can be updated by admins, but RLS policies prevent unauthorized access

## Environment Variables

Both apps need:
```
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The same Supabase project can be used for both apps since RLS policies handle the separation.
