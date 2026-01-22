# Rillation Portal — App Overview

> A comprehensive guide to understanding the Rillation Portal application, its features, and user flows.

---

## What is Rillation Portal?

**Rillation Portal** is a client-facing B2B SaaS dashboard designed for sales and marketing teams. It provides a unified platform to manage contacts, track deals, monitor campaign performance, and analyze pipeline metrics.

The application serves as a **multi-tenant** system where each client organization only sees their own data, enforced through database-level Row Level Security (RLS).

---

## Core Modules

The application is organized into three main sections accessible via the sidebar:

```
┌─────────────────────────────────────────────────────────────────┐
│                     RILLATION PORTAL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CRM ─────────────────────────────────                          │
│  │                                                              │
│  ├── Dashboard     Overview of CRM activity & metrics           │
│  ├── Contacts      Manage leads and contacts                    │
│  ├── Deals         Kanban board for deal tracking               │
│  └── Tasks         Task management for follow-ups               │
│                                                                 │
│  Analytics ────────────────────────────                         │
│  │                                                              │
│  ├── Performance   Campaign metrics & trends                    │
│  └── Pipeline      Sales funnel & opportunity tracking          │
│                                                                 │
│  Settings ─────────────────────────────                         │
│  │                                                              │
│  └── Preferences   User settings & account                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                                     │
└───────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  User Login  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            MAIN DASHBOARD                                 │
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│  │   CRM Module    │    │   Performance   │    │    Pipeline     │       │
│  │                 │    │                 │    │                 │       │
│  │  • Contacts     │    │  • Metrics      │    │  • Funnel       │       │
│  │  • Deals        │    │  • Charts       │    │  • Opportunities│       │
│  │  • Tasks        │    │  • Campaigns    │    │  • Sales Data   │       │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘       │
│           │                      │                      │                │
│           ▼                      ▼                      ▼                │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    SHARED DATA LAYER                             │     │
│  │                                                                  │     │
│  │  • Supabase PostgreSQL Database                                  │     │
│  │  • Row Level Security (Client Isolation)                         │     │
│  │  • Real-time Data Sync                                           │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Module Details

### 1. CRM Module (`/crm/*`)

The CRM (Customer Relationship Management) module provides a complete system for managing sales contacts and opportunities.

#### Dashboard (`/crm`)
- **Purpose**: High-level overview of CRM activity
- **Features**:
  - Recent activity feed
  - Key metrics at a glance (contacts, deals, tasks)
  - Quick navigation to other CRM sections

#### Contacts (`/crm/contacts`)
- **Purpose**: Manage leads and contacts
- **Features**:
  - List view with search and filtering
  - Contact details modal with editable fields
  - Pipeline progress tracking per contact
  - Engagement history
  - Company and industry information

#### Deals (`/crm/deals`)
- **Purpose**: Visual deal tracking with kanban board
- **Features**:
  - Drag-and-drop kanban interface
  - Deal stages: Lead → Qualified → Proposal → Negotiation → Won/Lost
  - Deal value and close date tracking
  - Associated contacts linking

#### Tasks (`/crm/tasks`)
- **Purpose**: Task management for sales follow-ups
- **Features**:
  - Task creation with due dates
  - Assignment to deals or contacts
  - Priority levels
  - Completion tracking

---

### 2. Analytics Module

#### Performance View (`/performance`)
- **Purpose**: Track email campaign performance and engagement metrics
- **Features**:
  - **Metric Cards**: Emails sent, unique prospects, replies, meetings booked
  - **Trend Chart**: Time-series visualization of key metrics
  - **Campaign Breakdown**: Table showing per-campaign performance
  - **Firmographic Insights**: Industry, company size, and location breakdowns
  - **Date Range Filtering**: Flexible date selection (today, this week, this month, custom)

#### Pipeline View (`/pipeline`)
- **Purpose**: Visualize the sales funnel and track opportunity progress
- **Features**:
  - **Lead Funnel Chart**: Visual funnel showing:
    - Meetings Booked
    - Showed Up to Discovery
    - Qualified
    - Showed Up to Demo
    - Proposal Sent
    - Closed
  - **Opportunity Pipeline**: Dollar-value grouped by stage
  - **Sales Metrics**: Revenue analytics and conversion rates
  - **Clickable Stages**: Drill down into specific funnel stages
  - **Inline Leads Table**: View leads at each stage

---

### 3. Settings (`/settings`)

- **Purpose**: User preferences and account management
- **Features**:
  - User profile information
  - Account settings
  - Sign out functionality

---

## Navigation Flow

```
                                    ┌─────────────┐
                                    │    Home     │
                                    │      /      │
                                    └──────┬──────┘
                                           │
                              Redirects to /performance
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
           ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
           │      CRM       │    │  Performance   │    │    Pipeline    │
           │     /crm       │    │  /performance  │    │   /pipeline    │
           └───────┬────────┘    └────────────────┘    └────────────────┘
                   │
    ┌──────────────┼──────────────┬──────────────┐
    │              │              │              │
    ▼              ▼              ▼              ▼
┌─────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐
│Dashboard│ │ Contacts  │ │  Deals   │ │  Tasks   │
│  /crm   │ │/crm/cont..│ │/crm/deals│ │/crm/tasks│
└─────────┘ └───────────┘ └──────────┘ └──────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW                                     │
└─────────────────────────────────────────────────────────────────────────┘

  USER ACTION                REACT LAYER                  DATABASE
  ───────────                ───────────                  ────────

  ┌──────────────┐
  │ User selects │
  │  date range  │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ FilterContext│────►│ Custom Hooks │────►│   Supabase   │
  │ updates state│     │ (data fetch) │     │   Queries    │
  └──────────────┘     └──────────────┘     └──────┬───────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │  PostgreSQL  │
                                            │   + RLS      │
                                            └──────┬───────┘
                                                   │
  ┌──────────────┐     ┌──────────────┐           │
  │  UI Updates  │◄────│ State Update │◄──────────┘
  │ (re-render)  │     │ (React)      │
  └──────────────┘     └──────────────┘
```

### Key Custom Hooks

| Hook | Purpose | Used In |
|------|---------|---------|
| `useQuickViewData` | Fetches main dashboard metrics (emails, replies, meetings) | Performance View |
| `usePipelineData` | Fetches funnel stage data | Pipeline View |
| `useOpportunities` | Fetches dollar-based opportunity data | Pipeline View |
| `useSalesMetrics` | Fetches sales analytics | Pipeline View |
| `useCampaigns` | Fetches campaign list for filters | All views |
| `useDeepInsights` | Comprehensive analytics data | Deep Insights |
| `useFirmographicInsights` | Industry/location breakdowns | Performance View |

---

## Database Tables

| Table | Description |
|-------|-------------|
| `campaign_reporting` | Daily email campaign metrics |
| `replies` | Email replies received |
| `meetings_booked` | Booked meetings with contacts |
| `engaged_leads` | CRM leads/contacts with pipeline stages |
| `client_opportunities` | Sales opportunities with values |
| `client_targets` | Performance targets |
| `client_iteration_logs` | Activity/iteration logs |
| `crm_contacts` | CRM contact records |
| `crm_deals` | CRM deal records |
| `crm_tasks` | CRM task records |

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     ROW LEVEL SECURITY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User logs in → JWT token issued with "client" claim         │
│                                                                 │
│  2. Every database query passes through RLS policies            │
│                                                                 │
│  3. RLS Policy Example:                                         │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ CREATE POLICY "client_isolation"                    │     │
│     │ ON table_name                                       │     │
│     │ FOR ALL                                             │     │
│     │ TO authenticated                                    │     │
│     │ USING (client = (auth.jwt() ->> 'client'));         │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                 │
│  4. Result: Users can ONLY see their own client's data          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Routing** | React Router v6 |
| **State** | React Context API |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Drag & Drop** | @dnd-kit |

---

## File Structure

```
src/
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point
│
├── pages/
│   ├── AtomicCRM/          # Full CRM module
│   │   ├── components/     # CRM-specific components
│   │   ├── context/        # CRM state management
│   │   └── types/          # CRM type definitions
│   ├── ClientDetailView.tsx # Performance page
│   ├── PipelineView.tsx    # Pipeline page
│   ├── DeepView.tsx        # Deep insights page
│   └── SettingsPage.tsx    # Settings page
│
├── components/
│   ├── layout/             # Sidebar, Header, Layout
│   ├── charts/             # Chart components
│   ├── insights/           # Analytics panels
│   └── ui/                 # Reusable UI components
│
├── contexts/
│   ├── AuthContext.tsx     # Authentication state
│   ├── FilterContext.tsx   # Date/client filters
│   └── AIContext.tsx       # AI assistant state
│
├── hooks/                  # Custom data fetching hooks
├── lib/                    # Utilities (Supabase client, cache)
└── types/                  # TypeScript definitions
```

---

## Key User Workflows

### Workflow 1: Checking Campaign Performance

```
1. Navigate to Performance (/performance)
2. Select date range using the filter dropdown
3. View metric cards for quick stats
4. Analyze trend chart for patterns
5. Scroll to campaign breakdown table for per-campaign data
6. Review firmographic insights for audience breakdown
```

### Workflow 2: Managing a Deal

```
1. Navigate to CRM → Deals (/crm/deals)
2. View deals on the kanban board
3. Drag deal card to new stage (e.g., Qualified → Proposal)
4. Click deal to open modal
5. Update deal value, close date, or notes
6. Link related contacts if needed
```

### Workflow 3: Tracking Pipeline Progress

```
1. Navigate to Pipeline (/pipeline)
2. View funnel chart for lead progression
3. Click a funnel stage to drill down
4. Review inline leads table for that stage
5. Check opportunity pipeline for dollar values
6. Configure targets if needed
```

### Workflow 4: Adding a New Contact

```
1. Navigate to CRM → Contacts (/crm/contacts)
2. Click "Add Contact" button
3. Fill in contact details (name, email, company, etc.)
4. Set initial pipeline stage
5. Save contact
6. Contact appears in list with assigned stage
```

---

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:3421` by default.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

*Documentation for Rillation Portal v1.0*
