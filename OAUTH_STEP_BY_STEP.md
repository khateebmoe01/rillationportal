# OAuth Setup - Step by Step Guide

This guide will walk you through setting up OAuth for both your Internal Hub and Client Portal, step by step.

## Understanding the Setup

You have:
- **Internal Hub** (rillation-sb-react) - Your admin dashboard
- **Client Portal** (rillationportal) - Client-facing dashboard
- **Same Supabase project** - Both apps use the same backend

Both apps will use OAuth (Google, GitHub, Azure) to sign in users.

---

## Part 1: Set Up OAuth Provider (Azure Example)

### Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for "Azure Active Directory" in the top search bar
3. Click on **Azure Active Directory** in the results
4. In the left sidebar, click **App registrations**
5. Click **+ New registration** button at the top

### Step 2: Configure Azure App

1. **Name**: Give it a name like "Rillation Portal Auth"
2. **Supported account types**: Choose "Accounts in any organizational directory and personal Microsoft accounts"
3. **Redirect URI**: 
   - Platform: **Web**
   - URI: `https://pfxgcavxdktxooiqthoi.supabase.co/auth/v1/callback`
   - (This is the callback URL from your Supabase screen)
4. Click **Register**

### Step 3: Get Your Azure Credentials

After registration, you'll see the app overview page:

1. **Copy the Application (client) ID**
   - This is shown on the overview page
   - Copy this value

2. **Create a Client Secret**:
   - In the left sidebar, click **Certificates & secrets**
   - Click **+ New client secret**
   - Description: "Supabase OAuth"
   - Expires: Choose 24 months (or your preference)
   - Click **Add**
   - **IMPORTANT**: Copy the **Value** (not the Secret ID) - you can only see it once!
   - This is your "Secret Value"

3. **Note the Tenant URL** (if needed):
   - Go back to **Overview**
   - Copy the "Directory (tenant) ID" if you need it
   - Format: `https://login.microsoftonline.com/{tenant-id}`

---

## Part 2: Configure Supabase

### Step 4: Add Azure to Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Azure** in the list and click on it
4. Toggle **Azure enabled** to ON (green)

### Step 5: Enter Azure Credentials in Supabase

1. **Application (client) ID**: Paste the Client ID you copied from Azure
2. **Secret Value**: Paste the Secret Value you copied (the one-time value)
   - ⚠️ Make sure you use the **Value**, not the Secret ID
3. **Azure Tenant URL** (Optional): 
   - Leave empty for most cases
   - Only fill if you need a specific tenant
4. **Allow users without an email**: Leave OFF (gray) unless needed

### Step 6: Save Configuration

1. Click the green **Save** button at the bottom
2. You should see a success message

---

## Part 3: Set Up Redirect URLs for Both Apps

### Step 7: Understand Redirect URLs

When a user clicks "Sign in with Azure" in your app:
1. They go to Azure to sign in
2. Azure redirects back to Supabase: `https://pfxgcavxdktxooiqthoi.supabase.co/auth/v1/callback`
3. Supabase then redirects to YOUR app's callback page

### Step 8: Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add **Site URL** for Internal Hub:
   - `https://your-internal-hub.com` (or `http://localhost:5173` for dev)
3. Add **Redirect URLs**:
   - Internal Hub: `https://your-internal-hub.com/auth/callback`
   - Client Portal: `https://your-portal.com/auth/callback`
   - Local dev (Internal Hub): `http://localhost:5173/auth/callback`
   - Local dev (Portal): `http://localhost:3000/auth/callback`

### Step 9: Update Your Apps' Environment Variables

**Internal Hub** (rillation-sb-react):
```env
VITE_SUPABASE_URL=https://pfxgcavxdktxooiqthoi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Client Portal** (rillationportal):
```env
VITE_SUPABASE_URL=https://pfxgcavxdktxooiqthoi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both use the same Supabase project!

---

## Part 4: Test OAuth Sign-In

### Step 10: Test in Client Portal

1. Start your portal: `cd rillationportal && npm run dev`
2. Go to `http://localhost:3000/login`
3. Click the Azure button
4. You should be redirected to Azure login
5. After signing in, you'll be redirected back to `/auth/callback`
6. Then redirected to `/crm`

### Step 11: Assign User Role and Client

After first OAuth sign-in:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user who just signed in (they'll have an email)
3. Click on the user
4. Scroll to **User Metadata**
5. Click **Edit** or the pencil icon
6. Add this JSON:
   ```json
   {
     "role": "client",
     "client": "ClientName"
   }
   ```
   Replace "ClientName" with the actual client name
7. Click **Save**

### Step 12: Test Again

1. Sign out and sign back in
2. You should now see the CRM with data filtered to that client only

---

## Part 5: Set Up Other OAuth Providers (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Name: "Rillation Portal"
7. Authorized redirect URIs: `https://pfxgcavxdktxooiqthoi.supabase.co/auth/v1/callback`
8. Click **Create**
9. Copy **Client ID** and **Client secret**
10. In Supabase: **Authentication** → **Providers** → **Google**
11. Enable and paste credentials
12. Save

### GitHub OAuth

1. Go to GitHub → Your profile → **Settings**
2. Scroll to **Developer settings** (bottom left)
3. Click **OAuth Apps** → **New OAuth App**
4. Application name: "Rillation Portal"
5. Homepage URL: `https://your-portal.com`
6. Authorization callback URL: `https://pfxgcavxdktxooiqthoi.supabase.co/auth/v1/callback`
7. Click **Register application**
8. Copy **Client ID**
9. Click **Generate a new client secret**
10. Copy the secret (shown once)
11. In Supabase: **Authentication** → **Providers** → **GitHub**
12. Enable and paste credentials
13. Save

---

## Part 6: Automatic Role Assignment (Advanced)

Instead of manually assigning roles, you can automate it:

### Option A: Email Domain Based

If clients have specific email domains:
- `@client1.com` → role: client, client: "Client1"
- `@client2.com` → role: client, client: "Client2"
- `@yourcompany.com` → role: admin

### Option B: Lookup Table

Create a table mapping emails to clients:
```sql
CREATE TABLE user_client_mapping (
  email TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  role TEXT DEFAULT 'client'
);
```

Then use an Edge Function to automatically assign roles.

---

## Troubleshooting

### "Redirect URI mismatch" Error
- **Problem**: Azure doesn't recognize the redirect URL
- **Solution**: Make sure the redirect URI in Azure exactly matches: `https://pfxgcavxdktxooiqthoi.supabase.co/auth/v1/callback`

### "Invalid client secret" Error
- **Problem**: Wrong secret value
- **Solution**: Make sure you copied the **Value** from Azure, not the Secret ID. If you lost it, create a new secret.

### User Can't Sign In
- **Problem**: OAuth flow fails
- **Solution**: 
  1. Check browser console for errors
  2. Verify credentials in Supabase match Azure
  3. Check redirect URLs are configured correctly

### "No Client Assigned" After Sign-In
- **Problem**: User signed in but doesn't have client metadata
- **Solution**: Follow Step 11 to manually assign role and client

### User Sees Wrong Data
- **Problem**: RLS policies not working
- **Solution**: 
  1. Verify user metadata has correct `client` value
  2. Check migration `20250110000000_client_isolation_policies.sql` was applied
  3. Test RLS policies in Supabase SQL editor

---

## Quick Reference

### Supabase Callback URL (for all OAuth providers):
```
https://pfxgcavxdktxooiqthoi.supabase.co/auth/v1/callback
```

### User Metadata Format:
```json
{
  "role": "client",
  "client": "ClientName"
}
```

### Environment Variables (both apps):
```env
VITE_SUPABASE_URL=https://pfxgcavxdktxooiqthoi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Next Steps

1. ✅ Set up Azure OAuth (Steps 1-6)
2. ✅ Configure redirect URLs (Step 8)
3. ✅ Test sign-in (Step 10)
4. ✅ Assign user roles (Step 11)
5. ⬜ Set up Google OAuth (optional)
6. ⬜ Set up GitHub OAuth (optional)
7. ⬜ Set up automatic role assignment (optional)

Need help with any specific step? Let me know!
