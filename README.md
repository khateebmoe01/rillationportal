# Rillation Portal - Client Dashboard

A client-facing dashboard with CRM and Deep Insights functionality, built with React, TypeScript, and Supabase.

## Features

- **CRM**: Contact management with kanban and list views
- **Deep Insights**: Comprehensive analytics across replies, leads & meetings
- **Client Isolation**: Each user only sees data for their assigned client

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account with your project set up

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```
   
   Note: Dependencies are already installed in this project.

2. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```
   
   Add the following content to `.env`:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   Replace `your-supabase-url` and `your-anon-key` with your actual Supabase project credentials.
   You can find these in your Supabase project settings under API.

3. **Run database migrations:**
   
   Apply the client isolation policies migration:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually run the migration file:
   # supabase/migrations/20250110000000_client_isolation_policies.sql
   ```

4. **Set up user client metadata:**
   
   For each user, set their `client` in user metadata:
   - Via Supabase Dashboard: Authentication > Users > Select User > User Metadata
   - Add: `{ "client": "ClientName" }`
   
   Or via SQL:
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{client}',
     '"ClientName"'
   ) 
   WHERE id = 'user-id';
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3421` (as configured in `vite.config.ts`).

7. **Open your browser:**
   
   Navigate to `http://localhost:3421`

## Authentication & Data Isolation

This application uses Supabase Row Level Security (RLS) to ensure each user can only see data for their assigned client. The client is stored in the user's metadata (`raw_user_meta_data.client`) and is automatically extracted by the application.

### How It Works

1. User logs in with Supabase Auth
2. Application extracts `client` from `user.user_metadata.client`
3. All database queries automatically filter by this client
4. RLS policies enforce client isolation at the database level

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── crm/           # CRM components
│   ├── insights/      # Deep Insights components
│   ├── layout/        # Layout components (Sidebar, Header, Layout)
│   └── ui/            # Reusable UI components
├── contexts/
│   ├── AuthContext.tsx    # Authentication context (extracts client)
│   ├── FilterContext.tsx  # Filter context (auto-sets client from auth)
│   └── AIContext.tsx      # AI context
├── hooks/
│   ├── useCRMContacts.ts      # CRM data fetching
│   ├── useDeepInsights.ts     # Deep insights data
│   ├── useFirmographicInsights.ts
│   └── useOpportunities.ts
├── lib/
│   ├── supabase.ts    # Supabase client
│   └── cache.ts       # Data caching
├── pages/
│   ├── CRMView.tsx    # Main CRM page
│   ├── DeepView.tsx   # Deep Insights page
│   └── Login.tsx      # Login page
├── types/
│   ├── crm.ts         # CRM types
│   └── database.ts    # Database types
├── App.tsx            # Main app with routing
└── main.tsx           # Entry point
```

## Supabase Tables

The dashboard connects to the following tables (all protected by RLS):

1. **engaged_leads** - CRM contacts/leads
2. **client_opportunities** - Opportunity tracking
3. **replies** - Email reply tracking
4. **meetings_booked** - Booked meetings
5. **campaign_reporting** - Campaign metrics
6. **client_targets** - Performance targets
7. **client_iteration_logs** - Iteration logs

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

Private - Rillation Revenue
