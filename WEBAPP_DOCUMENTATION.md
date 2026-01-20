# Rillation Portal - Complete Web App Documentation

> **For Junior Developers** - A comprehensive guide to understanding the Rillation Portal codebase end-to-end.

---

## Table of Contents

1. [What is This App?](#what-is-this-app)
2. [The Big Picture - Architecture Overview](#the-big-picture---architecture-overview)
3. [Tech Stack Explained](#tech-stack-explained)
4. [How the App Starts Up](#how-the-app-starts-up)
5. [Understanding React Concepts Used](#understanding-react-concepts-used)
6. [Authentication System](#authentication-system)
7. [Database & Supabase](#database--supabase)
8. [The Context System (Global State)](#the-context-system-global-state)
9. [Custom Hooks Explained](#custom-hooks-explained)
10. [Pages & Features](#pages--features)
11. [Component Architecture](#component-architecture)
12. [Styling with Tailwind CSS](#styling-with-tailwind-css)
13. [Data Flow - How Everything Connects](#data-flow---how-everything-connects)
14. [Security: Row Level Security (RLS)](#security-row-level-security-rls)
15. [Key Patterns & Best Practices](#key-patterns--best-practices)
16. [Common Gotchas & Debugging](#common-gotchas--debugging)
17. [Glossary of Terms](#glossary-of-terms)

---

## What is This App?

**Rillation Portal** is a **client-facing dashboard** for managing sales and marketing data. It's a B2B SaaS tool that helps clients track:

- **Email campaign performance** (how many emails sent, opened, replied)
- **Lead management** (CRM functionality)
- **Meeting bookings** (who booked meetings, from which campaigns)
- **Sales pipeline** (opportunities and their stages)
- **Deep analytics** (firmographic data, trends, insights)

### Who Uses It?

This is a **multi-tenant** application, meaning multiple companies (clients) use the same app, but each can only see their own data. When "Acme Corp" logs in, they only see Acme Corp's data - not data from other clients.

---

## The Big Picture - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Frontend)                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     React Application                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │    │
│  │  │  Pages   │  │Components│  │  Hooks   │  │ Contexts │     │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │    │
│  │       │              │              │              │          │    │
│  │       └──────────────┴──────────────┴──────────────┘          │    │
│  │                           │                                   │    │
│  │                    Supabase Client                            │    │
│  └───────────────────────────┼───────────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SUPABASE (Backend)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐      │
│  │    Auth     │  │  Database   │  │    Edge Functions       │      │
│  │ (Login/JWT) │  │ (PostgreSQL)│  │    (AI Assistant)       │      │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘      │
│                          │                                          │
│                   Row Level Security                                │
│                   (Data Isolation)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### What This Diagram Shows:

1. **Frontend**: The React app runs in the user's browser
2. **Supabase Client**: A library that connects to your backend
3. **Supabase Backend**: Handles authentication, database, and serverless functions
4. **Row Level Security**: Database rules that ensure clients only see their own data

---

## Tech Stack Explained

### Frontend Technologies

| Technology | Version | What It Does |
|------------|---------|--------------|
| **React** | 18 | UI library - builds the interface from components |
| **TypeScript** | 5.3 | Adds types to JavaScript - catches bugs early |
| **Vite** | 5.0 | Build tool - compiles & bundles your code |
| **React Router** | 6.21 | Handles navigation between pages |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework for styling |
| **Framer Motion** | 11.0 | Animation library for smooth transitions |
| **Recharts** | 2.10 | Creates charts and graphs |
| **Lucide React** | 0.294 | Icon library |

### Backend Technologies

| Technology | What It Does |
|------------|--------------|
| **Supabase** | Backend-as-a-Service (auth, database, functions) |
| **PostgreSQL** | Relational database (runs inside Supabase) |
| **Row Level Security** | Database policies for data isolation |

### What Each Package Does

```json
// From package.json - explained:

"dependencies": {
  "@dnd-kit/core": "Drag and drop functionality (for CRM kanban)",
  "@supabase/supabase-js": "Connects React to Supabase backend",
  "framer-motion": "Makes things animate smoothly",
  "html2canvas": "Takes screenshots of page elements",
  "lucide-react": "Provides icons like <Settings />, <User />",
  "react": "The core UI library",
  "react-dom": "Renders React to the browser",
  "react-router-dom": "URL-based navigation",
  "recharts": "Creates charts (line, bar, pie, funnel)"
}
```

---

## How the App Starts Up

Understanding the startup flow helps you see how all pieces connect.

### Step 1: Entry Point (`index.html` → `main.tsx`)

```typescript
// src/main.tsx - The app's starting point

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>                    // 1. Enables extra checks in development
    <BrowserRouter>                      // 2. Enables URL-based routing
      <AuthProvider>                     // 3. Provides auth state to all components
        <FilterProvider>                 // 4. Provides filter state (dates, client)
          <AIProvider>                   // 5. Provides AI assistant context
            <App />                      // 6. The actual application
          </AIProvider>
        </FilterProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

### What's Happening Here?

The app wraps itself in multiple "Providers" - these are like global containers that make data available to any component. Think of it like layers of an onion:

```
BrowserRouter (enables /page/urls)
  └── AuthProvider (who is logged in?)
       └── FilterProvider (what date range? which client?)
            └── AIProvider (AI assistant state)
                 └── App (your actual UI)
```

### Step 2: The App Component (`App.tsx`)

```typescript
function App() {
  // 1. Check if Supabase is configured
  const configError = getSupabaseConfigError()
  if (configError) return <ConfigError />
  
  // 2. Define routes
  return (
    <Routes>
      {/* Public routes - anyone can access */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected routes - must be logged in */}
      <Route path="/*" element={
        <ProtectedRoute>           {/* Checks if user is logged in */}
          <Layout>                  {/* Adds sidebar + header */}
            <Routes>
              <Route path="/performance" element={<ClientDetailView />} />
              <Route path="/pipeline" element={<PipelineView />} />
              <Route path="/crm" element={<CRMPage />} />
              {/* ... more routes */}
            </Routes>
          </Layout>
        </ProtectedRoute>
      }>
    </Routes>
  )
}
```

### The Startup Flow Visualized

```
User opens app
       │
       ▼
┌─────────────────────┐
│ Check Supabase      │──── Missing? ──► Show ConfigError
│ Environment Vars    │
└────────┬────────────┘
         │ OK
         ▼
┌─────────────────────┐
│ AuthProvider loads  │
│ - Check for session │
│ - Get user info     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ ProtectedRoute      │──── Not logged in? ──► Redirect to /login
│ checks auth         │
└────────┬────────────┘
         │ Logged in
         ▼
┌─────────────────────┐
│ Extract client from │──── No client? ──► Show "No Client Assigned"
│ user metadata       │
└────────┬────────────┘
         │ Has client
         ▼
┌─────────────────────┐
│ Show Layout +       │
│ Requested Page      │
└─────────────────────┘
```

---

## Understanding React Concepts Used

This section explains the React patterns you'll see throughout the codebase.

### 1. Components

Components are reusable UI pieces. Think of them like LEGO blocks.

```typescript
// A simple component
function MetricCard({ title, value, percentage }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3>{title}</h3>
      <p className="text-2xl">{value}</p>
      {percentage && <span>{percentage}%</span>}
    </div>
  )
}

// Using it:
<MetricCard title="Emails Sent" value={1500} percentage={12} />
```

### 2. Props

Props are how you pass data INTO a component. They're like function arguments.

```typescript
// title, value, percentage are props
function MetricCard({ title, value, percentage }: MetricCardProps) {
  // ...
}
```

### 3. State with `useState`

State is data that can CHANGE over time. When state changes, the component re-renders.

```typescript
function Counter() {
  // count starts at 0, setCount updates it
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}
```

### 4. Effects with `useEffect`

Effects run code AFTER the component renders. Used for:
- Fetching data
- Setting up subscriptions
- Syncing with external systems

```typescript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // This runs when userId changes
    fetchUser(userId).then(data => setUser(data))
  }, [userId])  // <-- Dependency array: when should this re-run?
  
  return <div>{user?.name}</div>
}
```

### 5. Context (Global State)

Context lets you share state across many components without "prop drilling" (passing props through every level).

```typescript
// Creating context (see AuthContext.tsx)
const AuthContext = createContext()

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Using context anywhere in the app
function SomeDeepComponent() {
  const { user } = useAuth()  // Gets user from AuthContext!
  return <div>Hello, {user.name}</div>
}
```

### 6. Custom Hooks

Hooks are functions that encapsulate reusable logic. They start with `use`.

```typescript
// Custom hook that fetches campaign data
function useCampaigns(client) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchCampaigns(client)
      .then(data => setCampaigns(data))
      .finally(() => setLoading(false))
  }, [client])
  
  return { campaigns, loading }
}

// Using it in a component:
function CampaignList() {
  const { campaigns, loading } = useCampaigns('Acme Corp')
  
  if (loading) return <Spinner />
  return campaigns.map(c => <CampaignCard key={c.id} {...c} />)
}
```

---

## Authentication System

The auth system controls who can access what.

### How Login Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User enters email + password                                 │
│            │                                                     │
│            ▼                                                     │
│  2. signIn() calls Supabase Auth                                 │
│            │                                                     │
│            ▼                                                     │
│  3. Supabase verifies credentials                                │
│            │                                                     │
│            ├── Invalid? → Show error message                     │
│            │                                                     │
│            └── Valid? → Return session + JWT token               │
│                     │                                            │
│                     ▼                                            │
│  4. AuthProvider stores user in state                            │
│            │                                                     │
│            ▼                                                     │
│  5. Extract "client" from user.user_metadata                     │
│            │                                                     │
│            ▼                                                     │
│  6. Redirect to /performance                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The AuthContext Explained

```typescript
// src/contexts/AuthContext.tsx

interface AuthContextType {
  user: User | null           // The logged-in user object
  session: Session | null     // The auth session (contains JWT)
  loading: boolean            // True while checking auth status
  client: string | null       // e.g., "Acme Corp" - extracted from metadata
  role: 'admin' | 'client'    // User's role
  signIn: (email, password) => Promise
  signInWithOAuth: (provider) => Promise  // Google, GitHub, etc.
  signOut: () => Promise
}
```

### Where User's Client Comes From

When you create a user in Supabase, you set their `client` in the user metadata:

```sql
-- Setting client for a user
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{client}',
  '"Acme Corp"'
) 
WHERE email = 'user@acme.com';
```

The app then reads this:

```typescript
// In AuthContext.tsx
useEffect(() => {
  if (user?.user_metadata) {
    setClient(user.user_metadata.client)  // "Acme Corp"
    setRole(user.user_metadata.role)      // "client" or "admin"
  }
}, [user])
```

### Protected Routes

The `ProtectedRoute` component guards pages that require login:

```typescript
function ProtectedRoute({ children }) {
  const { user, loading, client, role } = useAuth()

  if (loading) return <Spinner />           // Still checking auth
  if (!user) return <Navigate to="/login" /> // Not logged in
  if (role !== 'client') return <AccessDenied /> // Wrong role
  if (!client) return <NoClientAssigned />  // No client set
  
  return children  // All good, show the page
}
```

---

## Database & Supabase

### How Supabase Works

Supabase is like a ready-made backend. It provides:

1. **PostgreSQL Database** - Where your data lives
2. **Auth** - User login/signup
3. **Row Level Security** - Data access control
4. **Edge Functions** - Serverless code (like the AI assistant)

### Connecting to Supabase

```typescript
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

// These come from environment variables (.env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create the client - this is how you talk to Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### The Database Tables

Your app uses these tables:

| Table | Purpose |
|-------|---------|
| `campaign_reporting` | Daily email campaign metrics |
| `replies` | Email replies received |
| `meetings_booked` | Booked meetings with contacts |
| `engaged_leads` | CRM leads/contacts |
| `client_opportunities` | Sales opportunities |
| `client_targets` | Performance targets |
| `client_iteration_logs` | Activity logs |

### Database Types (TypeScript)

Types help you know what data looks like:

```typescript
// src/types/database.ts

interface Reply {
  id: number
  reply_id: string
  category: string      // 'Interested', 'Not Interested', 'OOO'
  lead_id: string
  subject: string
  text_body: string
  campaign_id: string
  date_received: string
  from_email: string
  client: string        // "Acme Corp" - used for RLS
}

interface MeetingBooked {
  id: number
  full_name: string
  company: string
  email: string
  campaign_name: string
  client: string
  created_time: string
  industry?: string
  annual_revenue?: string
  // ... more fields
}
```

### Querying Data

Here's how you fetch data from Supabase:

```typescript
// Simple select
const { data, error } = await supabase
  .from('replies')
  .select('*')
  .eq('client', 'Acme Corp')

// With filters and ordering
const { data, error } = await supabase
  .from('meetings_booked')
  .select('full_name, company, created_time')
  .gte('created_time', '2025-01-01')    // Greater than or equal
  .lt('created_time', '2025-02-01')     // Less than
  .order('created_time', { ascending: false })
  .limit(50)
```

---

## The Context System (Global State)

Contexts are your app's "global variables" done the React way.

### AuthContext

**Purpose**: Track who is logged in and their permissions.

```typescript
// What it provides:
{
  user: { id: '...', email: 'user@example.com', ... },
  client: 'Acme Corp',
  role: 'client',
  signIn: async (email, password) => { ... },
  signOut: async () => { ... }
}

// How to use it:
function AnyComponent() {
  const { user, client } = useAuth()
  return <p>Welcome, {user.email} from {client}</p>
}
```

### FilterContext

**Purpose**: Track the currently selected date range and client filter.

```typescript
// What it provides:
{
  selectedClient: 'Acme Corp',      // From AuthContext
  datePreset: 'thisMonth',          // 'today', 'thisWeek', 'lastMonth', etc.
  dateRange: { start: Date, end: Date },
  setDatePreset: (preset) => { ... }
}

// How to use it:
function Dashboard() {
  const { dateRange, selectedClient } = useFilters()
  
  // Fetch data using these filters
  const { data } = useQuickViewData({
    startDate: dateRange.start,
    endDate: dateRange.end,
    client: selectedClient
  })
}
```

### AIContext

**Purpose**: Manage the AI assistant panel and context.

```typescript
// What it provides:
{
  isPanelOpen: boolean,
  togglePanel: () => void,
  askWithContext: async (question) => string,
  chartContext: { ... },       // Data about clicked charts
  firmographicData: { ... },   // Deep insights data
  screenshots: [...]           // Captured screenshots for AI
}
```

### How Contexts Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                        React Tree                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  AuthProvider (provides: user, client, role)                 │
│       │                                                      │
│       └── FilterProvider (uses: client from Auth)            │
│              │                                               │
│              └── AIProvider (uses: client, dateRange)        │
│                     │                                        │
│                     └── Layout                               │
│                           │                                  │
│                           └── ClientDetailView               │
│                                  │                           │
│                                  ├── uses useAuth()          │
│                                  ├── uses useFilters()       │
│                                  └── uses useAI()            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Custom Hooks Explained

Custom hooks encapsulate complex logic so components stay clean.

### `useQuickViewData`

**Purpose**: Fetches the main dashboard metrics (emails sent, replies, meetings).

```typescript
const { metrics, chartData, loading, error } = useQuickViewData({
  startDate: dateRange.start,
  endDate: dateRange.end,
  client: 'Acme Corp',
  campaigns: ['Campaign A', 'Campaign B']  // optional filter
})

// Returns:
metrics = {
  totalEmailsSent: 5000,
  uniqueProspects: 3000,
  totalReplies: 150,
  realReplies: 120,      // Excludes out-of-office
  positiveReplies: 45,   // "Interested" category
  bounces: 100,
  meetingsBooked: 25
}

chartData = [
  { date: 'Jan 1', sent: 200, prospects: 150, replied: 10, meetings: 2 },
  { date: 'Jan 2', sent: 180, prospects: 140, replied: 8, meetings: 1 },
  // ...
]
```

**Key Logic Inside**:
1. Fetches from `campaign_reporting` for email metrics
2. Fetches from `replies` for reply counts
3. Fetches from `meetings_booked` for meeting counts
4. Aggregates and groups data by date
5. Applies "weekend smoothing" (moves weekend data to Friday/Monday)

### `useDeepInsights`

**Purpose**: Comprehensive analytics across replies, leads, and meetings.

```typescript
const { data, loading, error } = useDeepInsights({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
  client: 'Acme Corp'
})

// Returns:
data = {
  totalReplies: 150,
  interestedCount: 45,
  notInterestedCount: 60,
  outOfOfficeCount: 30,
  engagedLeadsCount: 200,
  meetingsBookedCount: 25,
  
  repliesByDay: [...],
  campaignPerformance: [...],
  
  meetingsByIndustry: [
    { industry: 'Technology', count: 10, percentage: 40 },
    { industry: 'Healthcare', count: 8, percentage: 32 },
  ],
  meetingsByState: [...],
  meetingsByRevenue: [...]
}
```

### `useCampaigns`

**Purpose**: Get list of campaigns for filter dropdowns.

```typescript
const { campaigns, loading } = useCampaigns('Acme Corp')
// campaigns = ['Campaign A', 'Campaign B', 'Campaign C']
```

### `usePipelineData`

**Purpose**: Fetches funnel stage data for the pipeline view.

```typescript
const { funnelStages, loading, refetch } = usePipelineData({
  startDate, endDate, month, year, client
})

// funnelStages = [
//   { name: 'Meetings Booked', value: 50 },
//   { name: 'Showed Up to Disco', value: 35 },
//   { name: 'Qualified', value: 20 },
//   { name: 'Showed Up to Demo', value: 15 },
//   { name: 'Proposal Sent', value: 10 },
//   { name: 'Closed', value: 5 }
// ]
```

### `useLeads` (CRM)

**Purpose**: CRUD operations for leads in the CRM.

```typescript
const {
  leads,           // Array of lead objects
  loading,
  error,
  updateLead,      // (id, field, value) => void
  createLead,      // (data) => Promise<Lead>
  deleteLead,      // (id) => void
  refetch
} = useLeads({ filters, searchQuery })
```

---

## Pages & Features

### 1. Performance Page (`/performance`)

**File**: `src/pages/ClientDetailView.tsx`

**What it shows**:
- Key metrics (emails sent, prospects, replies, meetings)
- Trend chart over time
- Campaign breakdown table
- Firmographic insights (industry, company size, etc.)

**How it works**:
```typescript
function ClientDetailView() {
  const { dateRange, selectedClient } = useFilters()
  
  // Fetch main metrics
  const { metrics, chartData } = useQuickViewData({
    startDate: dateRange.start,
    endDate: dateRange.end,
    client: selectedClient
  })
  
  // Fetch firmographic data
  const { data: firmographicData } = useFirmographicInsights({...})
  
  return (
    <>
      <MetricCards metrics={metrics} />
      <TrendChart data={chartData} />
      <CampaignBreakdownTable client={selectedClient} />
      <FirmographicInsightsPanel data={firmographicData} />
    </>
  )
}
```

### 2. Pipeline Page (`/pipeline`)

**File**: `src/pages/PipelineView.tsx`

**What it shows**:
- Lead funnel (Meetings → Qualified → Demo → Proposal → Closed)
- Dollar-based opportunity pipeline
- Sales metrics

**Key components**:
- `FunnelChart`: Visual funnel showing lead counts at each stage
- `OpportunityPipeline`: Dollar values grouped by stage
- `InlineLeadsTable`: Shows leads when you click a funnel stage

### 3. CRM Page (`/crm`)

**File**: `src/pages/CRMPage/index.tsx`

**What it is**: A spreadsheet-like interface for managing leads.

**Features**:
- Inline editing (click a cell to edit)
- Bulk selection and deletion
- Search and filtering
- Detail sidebar for full lead info
- Deep links (URLs that open specific leads)

**How inline editing works**:
```typescript
// When you click a cell and type:
const handleUpdate = (id, field, value) => {
  updateLead(id, field, value)  // Updates local state immediately
  // The hook then syncs to Supabase
}
```

### 4. Deep Insights Page (`/deep-insights`)

**File**: `src/pages/DeepView.tsx`

**What it shows**:
- Reply insights (category breakdown, by day, by campaign)
- Engaged leads panel
- Meetings insights (by industry, state, revenue, company age)
- Expandable data tables

### 5. Settings Page (`/settings`)

**File**: `src/pages/SettingsPage.tsx`

**What it shows**:
- User profile info
- Sign out button
- (Could add more settings)

---

## Component Architecture

### Layout Components

```
Layout
├── Sidebar (left navigation)
├── Header (top bar with client name, logo)
├── TabNavigation (Performance | Pipeline tabs)
└── children (the actual page content)
```

### UI Component Examples

```
src/components/ui/
├── MetricCard.tsx       # Shows a single metric with optional percentage
├── TrendChart.tsx       # Line chart for trends
├── Button.tsx           # Reusable button
├── ModalPortal.tsx      # Renders modals at document root
├── DateRangeFilter.tsx  # Date picker dropdown
└── CampaignFilter.tsx   # Campaign multi-select
```

### Chart Components

```
src/components/charts/
├── FunnelChart.tsx           # Visual sales funnel
├── OpportunityPipeline.tsx   # Dollar-based pipeline
├── TrendChart.tsx            # Time series chart
├── SalesMetricsChart.tsx     # Sales analytics
└── TopCampaignsChart.tsx     # Campaign performance
```

### Component Composition Pattern

Instead of one giant component, break it into smaller pieces:

```typescript
// ❌ Bad: One huge component
function Dashboard() {
  return (
    <div>
      <div className="header">...</div>
      <div className="metrics">
        <div className="metric">...</div>
        <div className="metric">...</div>
      </div>
      <div className="chart">...</div>
    </div>
  )
}

// ✅ Good: Composed of smaller components
function Dashboard() {
  return (
    <div>
      <Header />
      <MetricsGrid>
        <MetricCard title="Emails" value={1000} />
        <MetricCard title="Replies" value={50} />
      </MetricsGrid>
      <TrendChart data={chartData} />
    </div>
  )
}
```

---

## Styling with Tailwind CSS

Tailwind uses utility classes instead of custom CSS.

### Basic Examples

```jsx
// Traditional CSS approach:
<div className="card">Hello</div>
// .card { background: gray; padding: 16px; border-radius: 8px; }

// Tailwind approach:
<div className="bg-gray-800 p-4 rounded-lg">Hello</div>
```

### Custom Theme Colors

Your app defines custom colors in `tailwind.config.js`:

```javascript
colors: {
  'rillation': {
    'bg': '#000000',           // Pure black background
    'card': '#141414',         // Card background
    'card-hover': '#1a1a1a',   // Card hover state
    'border': '#222222',       // Border color
    'purple': '#a855f7',       // Primary accent
    'cyan': '#22d3ee',         // Secondary accent
    'text': '#ffffff',         // Main text
    'text-muted': '#888888',   // Muted text
  }
}
```

Using them:
```jsx
<div className="bg-rillation-card border border-rillation-border">
  <h1 className="text-rillation-text">Title</h1>
  <p className="text-rillation-text-muted">Subtitle</p>
</div>
```

### Common Patterns

```jsx
// Flex layout
<div className="flex items-center justify-between gap-4">

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">

// Hover effects
<button className="bg-purple-600 hover:bg-purple-700 transition-colors">

// Conditional classes
<div className={`p-4 rounded ${isActive ? 'bg-purple-600' : 'bg-gray-800'}`}>
```

---

## Data Flow - How Everything Connects

Let's trace how data flows when you load the Performance page:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW EXAMPLE                             │
│                     (Loading Performance Page)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. USER NAVIGATES TO /performance                                   │
│            │                                                         │
│            ▼                                                         │
│  2. ProtectedRoute checks auth                                       │
│     - AuthContext.user exists? ✓                                     │
│     - AuthContext.client exists? ✓ (e.g., "Acme Corp")              │
│            │                                                         │
│            ▼                                                         │
│  3. ClientDetailView component mounts                                │
│     - Gets { dateRange, selectedClient } from FilterContext          │
│            │                                                         │
│            ▼                                                         │
│  4. useQuickViewData hook triggers                                   │
│     - Creates Supabase queries                                       │
│     - Adds .eq('client', 'Acme Corp') filter                        │
│            │                                                         │
│            ▼                                                         │
│  5. Supabase receives query                                          │
│     - Checks user's JWT token                                        │
│     - Applies RLS policies (auth.jwt() ->> 'client')                │
│     - Returns only Acme Corp data                                    │
│            │                                                         │
│            ▼                                                         │
│  6. Hook processes response                                          │
│     - Aggregates metrics                                             │
│     - Formats chart data                                             │
│     - Returns { metrics, chartData }                                 │
│            │                                                         │
│            ▼                                                         │
│  7. Component renders                                                │
│     - MetricCards show values                                        │
│     - TrendChart draws lines                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### State Updates

When you change the date range:

```
User selects "Last Month" in DateRangeFilter
         │
         ▼
FilterContext.setDatePreset('lastMonth')
         │
         ▼
FilterContext.dateRange updates
         │
         ▼
Components re-render (they use useFilters())
         │
         ▼
Hooks detect dateRange changed (in dependency array)
         │
         ▼
Hooks re-fetch data with new dates
         │
         ▼
UI updates with new data
```

---

## Security: Row Level Security (RLS)

RLS ensures users can only see their own client's data.

### How It Works

1. **User logs in** → Gets a JWT token with their `client` claim
2. **User queries data** → Supabase checks the JWT
3. **RLS policy runs** → `WHERE client = auth.jwt() ->> 'client'`
4. **Only matching rows returned** → User sees only their data

### Example Policy

```sql
-- From the migration file
CREATE POLICY "Users can only see their client's replies"
ON replies
FOR SELECT
TO authenticated
USING (client = (auth.jwt() ->> 'client'));
```

This translates to:
> "When anyone tries to SELECT from replies, only return rows where the `client` column matches the `client` value in their JWT token."

### Visual Example

```
Database: replies table
┌────┬────────────────┬─────────────┐
│ id │ subject        │ client      │
├────┼────────────────┼─────────────┤
│ 1  │ Re: Proposal   │ Acme Corp   │
│ 2  │ Re: Demo       │ Beta Inc    │
│ 3  │ Re: Pricing    │ Acme Corp   │
│ 4  │ Re: Follow up  │ Gamma LLC   │
└────┴────────────────┴─────────────┘

User from Acme Corp queries:
SELECT * FROM replies;

RLS adds filter automatically:
SELECT * FROM replies WHERE client = 'Acme Corp';

User only sees:
┌────┬────────────────┬─────────────┐
│ id │ subject        │ client      │
├────┼────────────────┼─────────────┤
│ 1  │ Re: Proposal   │ Acme Corp   │
│ 3  │ Re: Pricing    │ Acme Corp   │
└────┴────────────────┴─────────────┘
```

### Why This Matters

Even if a developer forgets to add `.eq('client', client)` in their query, RLS still protects the data. It's a safety net at the database level.

---

## Key Patterns & Best Practices

### 1. Loading States

Always show loading state while fetching:

```typescript
function DataComponent() {
  const { data, loading, error } = useMyData()
  
  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  return <ActualContent data={data} />
}
```

### 2. Error Handling

Wrap async operations in try-catch:

```typescript
async function fetchData() {
  try {
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase.from('table').select()
    if (error) throw error
    
    setData(data)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)  // Always runs
  }
}
```

### 3. Memoization with useCallback

Prevents functions from being recreated on every render:

```typescript
// ❌ Creates new function every render
const handleClick = () => doSomething(id)

// ✅ Only recreates when dependencies change
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### 4. Cleanup in useEffect

```typescript
useEffect(() => {
  // Subscribe
  const subscription = supabase.auth.onAuthStateChange(handleAuth)
  
  // Cleanup function - runs when component unmounts
  return () => subscription.unsubscribe()
}, [])
```

### 5. Pagination for Large Data

```typescript
// Supabase has a 1000 row default limit
// Use pagination for more:

let allData = []
let offset = 0
const PAGE_SIZE = 1000

while (true) {
  const { data } = await supabase
    .from('large_table')
    .select('*')
    .range(offset, offset + PAGE_SIZE - 1)
    
  if (!data || data.length === 0) break
  
  allData = allData.concat(data)
  offset += PAGE_SIZE
  
  if (data.length < PAGE_SIZE) break  // Last page
}
```

---

## Common Gotchas & Debugging

### 1. "Cannot read property 'x' of null"

**Problem**: Trying to access data before it loads.

```typescript
// ❌ Will crash if data hasn't loaded
return <div>{data.metrics.count}</div>

// ✅ Safe access
return <div>{data?.metrics?.count ?? 0}</div>

// ✅ Or guard with loading state
if (!data) return <Spinner />
return <div>{data.metrics.count}</div>
```

### 2. Infinite Re-render Loops

**Problem**: useEffect with missing/wrong dependencies.

```typescript
// ❌ This runs forever (object created fresh each render)
useEffect(() => {
  fetch(options)
}, [{ start: new Date() }])  // Object is different every time!

// ✅ Use primitive values or memoize
const startStr = format(startDate, 'yyyy-MM-dd')
useEffect(() => {
  fetch(options)
}, [startStr])
```

### 3. Supabase Queries Not Filtering

**Problem**: Client filter not working.

```typescript
// ❌ client might be null
query.eq('client', client)

// ✅ Only add filter if client exists
if (client) {
  query = query.eq('client', client)
}
```

### 4. Date Timezone Issues

**Problem**: Dates off by one day.

```typescript
// ❌ Can shift dates due to timezone
const dateStr = new Date().toISOString().split('T')[0]

// ✅ Use explicit formatting
const formatDateForQuery = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

### 5. Stale Closures

**Problem**: Old values captured in callbacks.

```typescript
// ❌ selectedIds might be stale
const handleClick = () => {
  console.log(selectedIds)  // Old value!
}

// ✅ Use a ref to always get current value
const selectedIdsRef = useRef(selectedIds)
selectedIdsRef.current = selectedIds

const handleClick = () => {
  console.log(selectedIdsRef.current)  // Current value
}
```

### Debugging Tips

1. **React DevTools**: Install the browser extension to inspect components and state

2. **Console Logging**: Add logs in hooks to see when they run
   ```typescript
   useEffect(() => {
     console.log('Effect running with:', { client, dateRange })
   }, [client, dateRange])
   ```

3. **Network Tab**: Check the browser's Network tab to see Supabase requests

4. **Supabase Dashboard**: View logs and data directly in Supabase

---

## Glossary of Terms

| Term | Definition |
|------|------------|
| **Component** | A reusable piece of UI written as a function |
| **Props** | Data passed into a component from its parent |
| **State** | Data that can change over time, triggers re-renders |
| **Context** | A way to share state across many components |
| **Hook** | A function that lets you use React features (useState, useEffect) |
| **Custom Hook** | A reusable function that uses other hooks |
| **JSX** | JavaScript + HTML syntax React uses |
| **Render** | The process of React creating/updating the DOM |
| **Mount** | When a component first appears on screen |
| **Unmount** | When a component is removed from screen |
| **Effect** | Side effect code (data fetching, subscriptions) |
| **Memoization** | Caching expensive calculations |
| **RLS** | Row Level Security - database access control |
| **JWT** | JSON Web Token - authentication token |
| **Supabase** | Backend-as-a-Service (auth, database, functions) |
| **PostgreSQL** | The database used by Supabase |
| **Vite** | Build tool that compiles your React code |
| **Tailwind** | Utility-first CSS framework |
| **TypeScript** | JavaScript with type definitions |

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## File Structure Quick Reference

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Routes and layout
├── contexts/             # Global state (Auth, Filter, AI)
├── hooks/                # Data fetching logic
├── pages/                # Route components
├── components/
│   ├── layout/           # Sidebar, Header, Layout
│   ├── ui/               # Reusable UI components
│   ├── charts/           # Chart components
│   └── insights/         # Analytics panels
├── lib/
│   ├── supabase.ts       # Supabase client + helpers
│   └── auth-helpers.ts   # Auth utilities
└── types/
    └── database.ts       # TypeScript type definitions
```

---

## Next Steps for Learning

1. **Trace a Data Flow**: Pick one metric (like "Meetings Booked") and trace it from database → hook → component → UI

2. **Add a Feature**: Try adding a new metric card or filter

3. **Read React Docs**: [react.dev](https://react.dev) has excellent tutorials

4. **Learn Supabase**: [supabase.com/docs](https://supabase.com/docs)

5. **Practice TypeScript**: Understanding types makes debugging easier

---

*Documentation generated for Rillation Portal v1.0.0*
