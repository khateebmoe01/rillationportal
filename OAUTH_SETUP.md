# OAuth Setup Guide for Two Separate Frontends

This guide explains how to set up OAuth authentication when you have **two completely separate frontend applications**:
1. **Internal Hub** (`rillation-sb-react`) - Admin dashboard
2. **Client Portal** (`rillationportal`) - Client-facing dashboard

## Architecture Overview

Both frontends can use the **same Supabase project** but with different redirect URLs and role-based access control.

```
┌─────────────────┐         ┌─────────────────┐
│  Internal Hub   │         │  Client Portal  │
│  (Admin App)    │         │  (Client App)   │
└────────┬────────┘         └────────┬────────┘
         │                            │
         └────────────┬───────────────┘
                      │
              ┌───────▼────────┐
              │  Supabase Auth  │
              │  (Same Project) │
              └─────────────────┘
```

## Option 1: Same Supabase Project (Recommended)

### Benefits
- Single source of truth for users
- Easier user management
- Shared database with RLS policies

### Setup Steps

#### 1. Configure OAuth Providers in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable your OAuth providers (Google, GitHub, Azure, etc.)
3. For each provider, add **both redirect URLs**:
   - Internal Hub: `https://your-internal-hub.com/auth/callback`
   - Client Portal: `https://your-portal.com/auth/callback`
   - Local dev: `http://localhost:5173/auth/callback` (internal hub)
   - Local dev: `http://localhost:3000/auth/callback` (portal)

#### 2. Set Up OAuth Apps (Provider-Side)

For each OAuth provider, you need to register your apps:

**Google OAuth:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create OAuth 2.0 credentials
- Add authorized redirect URIs:
  - `https://[your-project].supabase.co/auth/v1/callback`
- Copy Client ID and Secret to Supabase

**GitHub OAuth:**
- Go to GitHub → Settings → Developer settings → OAuth Apps
- Create new OAuth App
- Set Authorization callback URL:
  - `https://[your-project].supabase.co/auth/v1/callback`
- Copy Client ID and Secret to Supabase

**Azure AD:**
- Go to Azure Portal → App Registrations
- Create new registration
- Add redirect URI:
  - `https://[your-project].supabase.co/auth/v1/callback`
- Copy Application (client) ID and Secret to Supabase

#### 3. User Metadata Structure

After OAuth sign-in, assign metadata to users:

**For Internal Hub (Admin Users):**
```json
{
  "role": "admin"
}
```

**For Client Portal (Client Users):**
```json
{
  "role": "client",
  "client": "ClientName"
}
```

#### 4. Assign Roles After OAuth Sign-In

**Option A: Manual Assignment (Supabase Dashboard)**
1. User signs in via OAuth
2. Go to **Authentication** → **Users**
3. Find the user
4. Edit **User Metadata**
5. Add role and client as shown above

**Option B: Automatic Assignment (Edge Function)**

Create a Supabase Edge Function that runs after OAuth sign-in:

```typescript
// supabase/functions/assign-user-role/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { user, app } = await req.json()
  
  // Determine role based on which app they're signing into
  // You can pass 'app' parameter in OAuth options
  if (app === 'internal-hub') {
    // Check if user should be admin (e.g., email domain)
    const isAdmin = user.email.endsWith('@yourcompany.com')
    
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { 
        role: isAdmin ? 'admin' : 'client',
        // If client, you might need to look up client from email domain
        client: isAdmin ? null : extractClientFromEmail(user.email)
      }
    })
  } else if (app === 'portal') {
    // Portal users are always clients
    const client = extractClientFromEmail(user.email) // or lookup table
    
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

function extractClientFromEmail(email: string): string {
  // Example: extract client from email domain
  // Or query a lookup table
  const domain = email.split('@')[1]
  // Map domain to client name
  return 'ClientName' // Replace with actual logic
}
```

Then configure as a webhook:
- **Database** → **Webhooks** → **New Webhook**
- Trigger: `auth.users` table, `INSERT` event
- Action: Call your Edge Function

#### 5. Update OAuth Sign-In to Pass App Identifier

In both frontends, update the OAuth sign-in to pass which app they're using:

**Internal Hub:**
```typescript
const signInWithOAuth = async (provider: 'google' | 'github' | 'azure') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        app: 'internal-hub', // Identifier for which app
      },
    },
  })
  return { error }
}
```

**Client Portal:**
```typescript
const signInWithOAuth = async (provider: 'google' | 'github' | 'azure') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        app: 'portal', // Identifier for which app
      },
    },
  })
  return { error }
}
```

#### 6. Environment Variables

**Internal Hub (.env):**
```env
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Client Portal (.env):**
```env
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both use the same Supabase project!

## Option 2: Separate Supabase Projects (Complete Isolation)

If you want complete separation between the two apps:

### Benefits
- Complete isolation
- Different security settings
- Independent scaling

### Setup

1. Create two Supabase projects:
   - Project 1: Internal Hub
   - Project 2: Client Portal

2. Configure OAuth in each project separately

3. Use different environment variables in each app

4. Sync user data between projects if needed (via Edge Functions or scripts)

## Recommended Approach: Option 1 (Same Project)

Using the same Supabase project is recommended because:
- ✅ Single user database
- ✅ Shared RLS policies
- ✅ Easier user management
- ✅ Users can potentially access both apps (if you allow it)
- ✅ Simpler setup

## Access Control Flow

### Internal Hub Flow:
1. User clicks OAuth button
2. Redirects to OAuth provider
3. User authenticates
4. Redirects to `internal-hub.com/auth/callback`
5. App checks: `role === 'admin'` ✅
6. Grants access to all clients

### Client Portal Flow:
1. User clicks OAuth button
2. Redirects to OAuth provider
3. User authenticates
4. Redirects to `portal.com/auth/callback`
5. App checks: `role === 'client'` AND `client` exists ✅
6. RLS policies enforce: only see their client's data

## RLS Policies

The client portal already has strict RLS policies that check:
```sql
client = (auth.jwt() ->> 'client')
```

For the internal hub, you can create policies that allow admins:
```sql
-- Example for internal hub
CREATE POLICY "Admins see all, clients see their own"
ON replies
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'admin'
  OR
  client = (auth.jwt() ->> 'client')
);
```

## Testing

1. **Test Internal Hub OAuth:**
   - Sign in with admin account
   - Should see all clients
   - Verify role is 'admin'

2. **Test Client Portal OAuth:**
   - Sign in with client account
   - Should only see their client's data
   - Verify role is 'client' and client is set

3. **Test Access Control:**
   - Try accessing portal with admin account → Should be blocked
   - Try accessing internal hub with client account → Should work (if policies allow)

## Troubleshooting

### "Redirect URI mismatch" Error
- Ensure redirect URLs in OAuth provider match exactly
- Check Supabase redirect URL settings
- Include both production and localhost URLs for dev

### User Can't Sign In
- Check OAuth provider credentials in Supabase
- Verify redirect URLs are correct
- Check browser console for errors

### Wrong Role Assigned
- Check user metadata in Supabase Dashboard
- Verify Edge Function (if using) is working
- Manually update user metadata if needed

### Client Portal User Sees Other Clients' Data
- RLS policies not applied correctly
- Check migration was run
- Verify user metadata has correct `client` value

## Security Best Practices

1. **Never trust client-side checks alone** - RLS policies enforce security
2. **Use different redirect URLs** for each app
3. **Validate roles on both frontend and backend**
4. **Regularly audit user roles and client assignments**
5. **Use Edge Functions for automatic role assignment** to prevent mistakes
