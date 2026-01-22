# Rillation Portal - UI Structure Documentation

> A comprehensive guide to the frontend architecture, components, and design system

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Project Architecture](#project-architecture)
3. [Application Entry Points](#application-entry-points)
4. [Context Providers](#context-providers)
5. [Layout System](#layout-system)
6. [Routing Structure](#routing-structure)
7. [Page Components](#page-components)
8. [Component Library](#component-library)
9. [Design System](#design-system)
10. [Data Hooks](#data-hooks)
11. [Database Types](#database-types)
12. [Styling Architecture](#styling-architecture)
13. [Animation System](#animation-system)
14. [File Structure Reference](#file-structure-reference)

---

## Tech Stack Overview

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI Framework |
| TypeScript | 5.3.3 | Type Safety |
| Vite | 5.0.10 | Build Tool & Dev Server |
| Tailwind CSS | 3.4.0 | Utility-First CSS |
| Supabase | 2.39.0 | Backend & Authentication |

### Key Dependencies

```json
{
  "@dnd-kit/core": "^6.3.1",        // Drag & drop for Kanban
  "@dnd-kit/sortable": "^10.0.0",   // Sortable lists
  "framer-motion": "^11.15.0",      // Animations
  "lucide-react": "^0.469.0",       // Icon library
  "react-router-dom": "^7.1.0",     // Routing
  "recharts": "^2.15.0",            // Charts & visualizations
  "html2canvas": "^1.4.1"           // Screenshot capture for AI
}
```

### Development Server

```bash
# Default port: 3421
npm run dev
```

---

## Project Architecture

```
src/
├── main.tsx              # Application entry point
├── App.tsx               # Root component with routing
├── index.css             # Global styles & CSS variables
├── components/           # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── charts/           # Data visualization components
│   ├── insights/         # AI & analytics components
│   ├── layout/           # Layout structure components
│   └── ui/               # Core UI primitives
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks (data fetching)
├── lib/                  # Utility libraries
├── pages/                # Page-level components
│   ├── AtomicCRM/        # CRM module (isolated)
│   └── CRMPage/          # Alternative CRM view
└── types/                # TypeScript type definitions
```

---

## Application Entry Points

### `main.tsx` - Bootstrap

The application bootstraps with a provider hierarchy:

```tsx
<React.StrictMode>
  <BrowserRouter>
    <AuthProvider>      {/* Authentication state */}
      <FilterProvider>  {/* Global filters (date, client) */}
        <AIProvider>    {/* AI Copilot state */}
          <App />
        </AIProvider>
      </FilterProvider>
    </AuthProvider>
  </BrowserRouter>
</React.StrictMode>
```

### `App.tsx` - Root Component

Handles routing and page transitions with Framer Motion:

```tsx
// Page transition wrapper
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25, ease: 'easeInOut' }}
/>
```

---

## Context Providers

### AuthContext

**Location:** `src/contexts/AuthContext.tsx`

Manages authentication state (currently in demo mode with mock user):

```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  client: string | null      // Client from user metadata
  role: 'admin' | 'client' | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithOAuth: (provider: 'google' | 'github' | 'azure') => Promise<{ error: any }>
  signOut: () => Promise<void>
}
```

**Demo Mode:** Uses mock user "Rillation Revenue" with no authentication required.

### FilterContext

**Location:** `src/contexts/FilterContext.tsx`

Manages global filtering state:

```typescript
interface FilterContextType {
  selectedClient: string | null        // Auto-set from auth
  datePreset: string                   // 'today', 'thisWeek', 'thisMonth', etc.
  setDatePreset: (preset: string) => void
  dateRange: { start: Date; end: Date }
  setDateRange: (range: { start: Date; end: Date }) => void
  clearFilters: () => void
}
```

**Presets Available:**
- `today`
- `thisWeek`
- `lastWeek`
- `thisMonth`
- `lastMonth`

### AIContext

**Location:** `src/contexts/AIContext.tsx`

Powers the AI Copilot panel with comprehensive data context:

```typescript
interface AIContextType {
  // Panel state
  isPanelOpen: boolean
  togglePanel: () => void
  panelWidth: number
  
  // Chart context (from clicked charts)
  chartContext: ChartContext | null
  setChartContext: (ctx: ChartContext | null) => void
  
  // Firmographic data for insights
  firmographicData: FirmographicInsightsData | null
  
  // Screenshot capture for visual context
  screenshots: ScreenshotContext[]
  addScreenshot: (dataUrl: string, elementInfo: string) => void
  
  // AI interaction
  askWithContext: (question: string) => Promise<string>
  askAboutChart: (chart: ChartContext, question?: string) => void
  isAsking: boolean
  
  // Element picker
  isElementPickerActive: boolean
  setElementPickerActive: (active: boolean) => void
}
```

---

## Layout System

### Layout Component

**Location:** `src/components/layout/Layout.tsx`

The main layout wrapper provides:
- Fixed sidebar (192px / `w-48`)
- Dynamic AI panel (resizable, default 620px)
- Header visibility based on route
- Tab navigation for reporting pages

```tsx
<div className="min-h-screen">
  {/* AI Co-Pilot Panel */}
  <AICopilotPanel />
  
  {/* Fixed Sidebar */}
  <Sidebar />
  
  {/* Main Content Area */}
  <div className="ml-48 flex flex-col h-screen">
    {!isCRMPage && <Header />}
    {isReportingPage && <TabNavigation />}
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
</div>
```

### Sidebar Component

**Location:** `src/components/layout/Sidebar.tsx`

Two-section navigation with visual separators:

```
┌──────────────────┐
│ CRM              │
│ ──────────────   │
│  📊 Dashboard    │
│  👥 Contacts     │
│  💰 Deals        │
│  ✅ Tasks        │
│                  │
│ Analytics        │
│ ──────────────   │
│  📈 Performance  │
│  📊 Pipeline     │
│                  │
│        ↓         │
│                  │
│ Settings         │
│ ──────────────   │
│  ⚙️  Preferences │
└──────────────────┘
```

### TabNavigation

**Location:** `src/components/layout/TabNavigation.tsx`

Horizontal tabs with filter controls for reporting pages:

- Performance / Pipeline tabs
- Client display (locked from auth)
- Date range filter with presets
- Clear filters button

---

## Routing Structure

```
/                      → Redirects to /performance
/performance           → ClientDetailView (Performance dashboard)
/pipeline              → PipelineView (Sales pipeline & funnels)
/crm/*                 → AtomicCRM (nested routes)
  /crm                 → CRM Dashboard
  /crm/contacts        → Contact List
  /crm/deals           → Deals Kanban
  /crm/tasks           → Task List
/deep-insights         → DeepView (Analytics deep dive)
/insights              → Redirects to /deep-insights
/settings              → SettingsPage (User management, integrations)
```

---

## Page Components

### ClientDetailView (Performance)

**Location:** `src/pages/ClientDetailView.tsx`

Main performance dashboard showing:

1. **Metrics Grid** (7 columns)
   - Emails Sent, Prospects, Total Replies, Real Replies
   - Interested, Bounces, Meetings

2. **Meetings Drill-Down Panel** (expandable)

3. **Trend Chart** (Recharts LineChart)
   - Multi-metric overlay or single focus mode
   - Target lines when configured

4. **Campaign Breakdown Table**
   - Sortable campaign performance data
   - Row selection filters firmographic data

5. **Firmographic Insights Panel**
   - Industry, company size, revenue distribution
   - Visual breakdowns of meeting data

### PipelineView

**Location:** `src/pages/PipelineView.tsx`

Sales pipeline visualization:

1. **Pipeline Metrics Section**
   - Meeting counts through closed deals
   - Daily pipeline chart

2. **Compact Sales Metrics**
   - Revenue summary cards

3. **Dual Funnel System**
   - Lead Count Funnel (left)
   - Dollar Opportunity Pipeline (right)

4. **Inline Leads Table**
   - Expands when clicking funnel stages

### DeepView (Deep Insights)

**Location:** `src/pages/DeepView.tsx`

Comprehensive analytics view:

1. **Summary Bar** - Key metrics with click interaction
2. **Reply Insights Panel** - Category breakdown, daily trends
3. **Engaged Leads Panel** - Lead distribution
4. **Meetings Insights Panel** - Full-width firmographic charts
5. **Expandable Detail Tables** - Paginated data views

### AtomicCRM

**Location:** `src/pages/AtomicCRM/index.tsx`

Self-contained CRM module with its own:
- Context provider (`CRMContext`)
- Layout (`CRMLayout`)
- Theme system
- Type definitions

```tsx
<CRMProvider>
  <CRMLayout>
    <Routes>
      <Route index element={<CRMDashboard />} />
      <Route path="contacts" element={<ContactList />} />
      <Route path="deals" element={<DealsKanban />} />
      <Route path="tasks" element={<TaskList />} />
    </Routes>
  </CRMLayout>
</CRMProvider>
```

### SettingsPage

**Location:** `src/pages/SettingsPage.tsx`

User & integration management:

1. **Users Section**
   - Invite new users by email
   - View pending invitations
   - Manage active users

2. **Calendly Integration**
   - OAuth connection flow
   - Auto-sync meeting bookings

---

## Component Library

### Layout Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Layout` | `layout/Layout.tsx` | Main app shell |
| `Sidebar` | `layout/Sidebar.tsx` | Navigation menu |
| `Header` | `layout/Header.tsx` | Page header (currently null) |
| `TabNavigation` | `layout/TabNavigation.tsx` | Reporting tabs + filters |

### UI Primitives

| Component | Location | Purpose |
|-----------|----------|---------|
| `Button` | `ui/Button.tsx` | Action buttons (primary/secondary/ghost) |
| `MetricCard` | `ui/MetricCard.tsx` | Display metric with hover effect |
| `ClickableMetricCard` | `ui/ClickableMetricCard.tsx` | Metric with chart control |
| `DateRangeFilter` | `ui/DateRangeFilter.tsx` | Date picker with presets |
| `CampaignFilter` | `ui/CampaignFilter.tsx` | Multi-select campaign filter |
| `ExpandableDataPanel` | `ui/ExpandableDataPanel.tsx` | Paginated data table |
| `TableSkeleton` | `ui/TableSkeleton.tsx` | Loading state for tables |

### Chart Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TrendChart` | `charts/TrendChart.tsx` | Multi-line performance chart |
| `FunnelChart` | `charts/FunnelChart.tsx` | Pipeline funnel visualization |
| `OpportunityPipeline` | `charts/OpportunityPipeline.tsx` | Dollar-based deal stages |
| `SalesPipelineFunnel` | `charts/SalesPipelineFunnel.tsx` | Alternative funnel view |
| `TopCampaignsChart` | `charts/TopCampaignsChart.tsx` | Campaign comparison |
| `SalesMetricsChart` | `charts/SalesMetricsChart.tsx` | Sales analytics |

### Insight Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AICopilotPanel` | `insights/AICopilotPanel.tsx` | AI chat interface |
| `ElementPickerOverlay` | `insights/ElementPickerOverlay.tsx` | Screen element capture |
| `FirmographicInsightsPanel` | `insights/FirmographicInsightsPanel.tsx` | Firmographic breakdowns |
| `ReplyInsightsPanel` | `insights/ReplyInsightsPanel.tsx` | Reply analytics |
| `EngagedLeadsPanel` | `insights/EngagedLeadsPanel.tsx` | Lead distribution |
| `MeetingsInsightsPanel` | `insights/MeetingsInsightsPanel.tsx` | Meeting analytics |
| `InsightsSummaryBar` | `insights/InsightsSummaryBar.tsx` | Metric summary row |
| `AnimatedMetric` | `insights/AnimatedMetric.tsx` | Counting animation |

### Modal & Overlay Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ConfigureTargetsModal` | `ui/ConfigureTargetsModal.tsx` | Target configuration |
| `IterationLogModal` | `ui/IterationLogModal.tsx` | Campaign iteration history |
| `LeadsModal` | `ui/LeadsModal.tsx` | Lead list modal |
| `ReplyDetailModal` | `ui/ReplyDetailModal.tsx` | Reply content view |
| `CampaignDetailModal` | `ui/CampaignDetailModal.tsx` | Campaign details |
| `ClientDetailModal` | `ui/ClientDetailModal.tsx` | Client info |
| `InviteUserModal` | `ui/InviteUserModal.tsx` | User invitation |
| `ModalPortal` | `ui/ModalPortal.tsx` | Portal wrapper |
| `DropdownPortal` | `ui/DropdownPortal.tsx` | Dropdown positioning |

### CRM-Specific Components

Located in `src/pages/AtomicCRM/components/`:

**Shared:**
- `Avatar`, `Badge`, `Button`, `Card`
- `GlowCard` - Card with glow effect
- `Modal`, `SlidePanel`
- `Input`, `Select`
- `StageDropdown`, `PipelineProgressDropdown`
- `EmptyState`

**Feature-Specific:**
- `CRMDashboard` - Dashboard with stats
- `ContactList`, `ContactModal` - Contact management
- `DealsKanban`, `DealModal` - Kanban board
- `TaskList`, `TaskModal` - Task management

---

## Design System

### Color Palette

#### Rillation Theme (Main)

```css
:root {
  /* Backgrounds */
  --crm-bg-base: #0a0a0a;
  --crm-bg-raised: #111111;
  --crm-bg-elevated: #161616;
  --crm-bg-surface: #1a1a1a;
  --crm-bg-overlay: #1f1f1f;
  
  /* Borders */
  --crm-border-subtle: #1f1f1f;
  --crm-border: #2a2a2a;
  --crm-border-strong: #3a3a3a;
  
  /* Text */
  --crm-text: #f5f5f5;
  --crm-text-secondary: #d4d4d4;
  --crm-text-muted: #a3a3a3;
  --crm-text-disabled: #525252;
  
  /* Accents */
  --crm-accent: #22c55e;       /* Rillation Green */
  --crm-accent-hover: #16a34a;
  --crm-accent-blue: #3b82f6;
}
```

#### Tailwind Color Extensions

```javascript
// tailwind.config.js
colors: {
  'rillation': {
    'bg': '#000000',
    'card': '#141414',
    'card-hover': '#1a1a1a',
    'border': '#222222',
    'green': '#22c55e',
    'green-dark': '#16a34a',
    'magenta': '#d946ef',
    'cyan': '#22d3ee',
    'orange': '#f97316',
    'red': '#ef4444',
    'yellow': '#eab308',
    'text': '#ffffff',
    'text-muted': '#888888',
  }
}
```

### Typography

**Primary Font:** Sora (Google Fonts)

```css
body {
  font-family: 'Sora', system-ui, sans-serif;
}
```

**Font Scale:**
```javascript
fontSize: {
  'xs': ['11px', { lineHeight: '1.25' }],
  'sm': ['12px', { lineHeight: '1.5' }],
  'base': ['13px', { lineHeight: '1.5' }],
  'md': ['14px', { lineHeight: '1.5' }],
  'lg': ['16px', { lineHeight: '1.5' }],
  'xl': ['18px', { lineHeight: '1.35' }],
}
```

### Spacing System

Based on 8px scale:

```javascript
spacing: {
  '4.5': '18px',
  '13': '52px',      // Row height
  '14': '56px',      // Toolbar height
  'row': '52px',
  'header': '44px',
  'toolbar': '56px',
}
```

### Z-Index Scale

```javascript
zIndex: {
  'sticky': '10',
  'header': '20',
  'dropdown': '100',
  'modal': '200',
  'toast': '300',
}
```

### Shadow System

```javascript
boxShadow: {
  'sticky': '4px 0 12px -2px rgba(0, 0, 0, 0.5)',
  'header': '0 2px 8px -2px rgba(0, 0, 0, 0.4)',
  'dropdown': '0 12px 40px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05)',
  'modal': '0 20px 50px -10px rgba(0, 0, 0, 0.8)',
}
```

### Border Radius

```javascript
borderRadius: {
  'card': '12px',
  'cell': '8px',
  'pill': '9999px',
}
```

---

## Data Hooks

All hooks follow a consistent pattern with loading, error, and refetch capabilities.

### Campaign & Performance Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useCampaigns` | `useCampaigns.ts` | Fetch campaign list |
| `useCampaignStats` | `useCampaignStats.ts` | Campaign performance stats |
| `useCampaignScorecardData` | `useCampaignScorecardData.ts` | Scorecard metrics |
| `useQuickViewData` | `useQuickViewData.ts` | Dashboard metrics + chart data |
| `useSequenceStats` | `useSequenceStats.ts` | Email sequence analytics |

### Pipeline & Sales Hooks

| Hook | File | Purpose |
|------|------|---------|
| `usePipelineData` | `usePipelineData.ts` | Funnel stage counts |
| `useOpportunities` | `useOpportunities.ts` | Deal pipeline data |
| `useSalesMetrics` | `useSalesMetrics.ts` | Revenue analytics |

### Insights Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useDeepInsights` | `useDeepInsights.ts` | Aggregated insight data |
| `useFirmographicInsights` | `useFirmographicInsights.ts` | Firmographic breakdowns |
| `useIterationLog` | `useIterationLog.ts` | Campaign iteration history |

### Utility Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useClients` | `useClients.ts` | Client list |
| `useSlackUsers` | `useSlackUsers.ts` | Slack user data for mentions |

### Hook Pattern Example

```typescript
interface HookOptions {
  startDate: Date
  endDate: Date
  client?: string
  campaigns?: string[]
}

interface HookReturn {
  data: DataType | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDataHook(options: HookOptions): HookReturn {
  const [data, setData] = useState<DataType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .gte('date', formatDateForQuery(options.startDate))
        .lte('date', formatDateForQuery(options.endDate))
        
      if (error) throw error
      setData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [options.startDate, options.endDate, options.client])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

---

## Database Types

### Core Tables

#### Reply

```typescript
interface Reply {
  id?: number
  reply_id: string
  type: string
  lead_id: string
  subject: string
  category: string  // 'Interested', 'Not Interested', 'OOO', etc.
  text_body: string
  campaign_id: string
  date_received: string
  from_email: string
  primary_to_email: string
  client: string
}
```

#### MeetingBooked

```typescript
interface MeetingBooked {
  id?: number
  first_name: string
  last_name: string
  full_name: string
  title: string
  company: string
  campaign_name: string
  client: string
  created_time: string
  email: string
  // Firmographic fields
  company_size?: string
  annual_revenue?: string
  industry?: string
  company_hq_state?: string
  year_founded?: string
  // ... more fields
}
```

#### EngagedLead (CRM Contact)

```typescript
interface EngagedLead {
  id?: number
  client: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  job_title?: string
  company?: string
  industry?: string
  
  // Pipeline stages (booleans)
  meeting_booked?: boolean
  qualified?: boolean
  showed_up_to_disco?: boolean
  demo_booked?: boolean
  showed_up_to_demo?: boolean
  proposal_sent?: boolean
  closed?: boolean
  
  // Stage timestamps
  meeting_booked_at?: string
  qualified_at?: string
  // ... more timestamps
  
  // Pipeline/sales fields
  stage?: string
  epv?: number
  next_touchpoint?: string
}
```

### CRM Types

Located in `src/pages/AtomicCRM/types/index.ts`:

#### Contact Status Flow

```typescript
type ContactStatus = 
  | 'new' 
  | 'engaged' 
  | 'meeting_booked' 
  | 'qualified' 
  | 'demo' 
  | 'proposal' 
  | 'closed'

function getContactStatus(contact: Contact): ContactStatus {
  if (contact.closed) return 'closed'
  if (contact.proposal_sent) return 'proposal'
  if (contact.showed_up_to_demo || contact.demo_booked) return 'demo'
  if (contact.qualified) return 'qualified'
  if (contact.meeting_booked || contact.showed_up_to_disco) return 'meeting_booked'
  if (contact.stage && contact.stage !== 'new') return 'engaged'
  return 'new'
}
```

#### Deal Stages

```typescript
type DealStage = 
  | 'interested' 
  | 'discovery' 
  | 'demo' 
  | 'negotiation' 
  | 'proposal' 
  | 'closed' 
  | 'lost'
```

#### Task Types

```typescript
type TaskType = 
  | 'task' 
  | 'call' 
  | 'email' 
  | 'meeting' 
  | 'follow_up' 
  | 'reminder'
```

---

## Styling Architecture

### CSS Structure

1. **Tailwind Base** - Reset & normalize
2. **CSS Custom Properties** - Design tokens in `:root`
3. **Component Classes** - Reusable utility classes
4. **Animation Keyframes** - Custom animations

### Key CSS Classes

```css
/* Metric card hover */
.metric-card:hover {
  border-color: #333333;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Tab active indicator */
.tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #ffffff;
}

/* Stagger children animation */
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
/* ... up to 7 children */

/* Skeleton loading */
.skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, 
    var(--crm-bg-surface) 0%, 
    var(--crm-border) 50%, 
    var(--crm-bg-surface) 100%
  );
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-thumb {
  background: var(--crm-border);
  border-radius: 5px;
}
```

### Custom Checkbox Styling

```css
input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--crm-border-strong);
  border-radius: 4px;
  background: var(--crm-bg-surface);
}

input[type="checkbox"]:checked {
  background: var(--crm-accent);
  border-color: var(--crm-accent);
}

input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
```

---

## Animation System

### Framer Motion Integration

The app uses Framer Motion extensively for:

1. **Page Transitions**
```tsx
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25, ease: 'easeInOut' }}
/>
```

2. **Component Mount Animations**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
/>
```

3. **Hover Effects**
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
/>
```

4. **Staggered Lists**
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
}
```

5. **AnimatePresence for Exit**
```tsx
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### CSS Keyframe Animations

```css
/* Pulse glow for live indicators */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
}

/* Fade in with slide */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Skeleton pulse */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
```

---

## File Structure Reference

### Complete Directory Tree

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── vite-env.d.ts
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   │
│   ├── charts/
│   │   ├── FunnelChart.tsx
│   │   ├── OpportunityPipeline.tsx
│   │   ├── SalesMetricsChart.tsx
│   │   ├── SalesPipelineFunnel.tsx
│   │   ├── TopCampaignsChart.tsx
│   │   └── TrendChart.tsx
│   │
│   ├── insights/
│   │   ├── AICopilotPanel.tsx
│   │   ├── AnimatedMetric.tsx
│   │   ├── DimensionComparisonChart.tsx
│   │   ├── ElementPickerOverlay.tsx
│   │   ├── EngagedLeadsPanel.tsx
│   │   ├── FirmographicInsightsPanel.tsx
│   │   ├── InsightsSummaryBar.tsx
│   │   ├── MeetingsInsightsPanel.tsx
│   │   └── ReplyInsightsPanel.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TabNavigation.tsx
│   │
│   └── ui/
│       ├── AnimatedSelect.tsx
│       ├── Button.tsx
│       ├── CalendarHeatmap.tsx
│       ├── CampaignBreakdownTable.tsx
│       ├── CampaignDetailModal.tsx
│       ├── CampaignFilter.tsx
│       ├── CampaignsTable.tsx
│       ├── ClickableChartWrapper.tsx
│       ├── ClickableMetricCard.tsx
│       ├── ClientBubble.tsx
│       ├── ClientDetailModal.tsx
│       ├── ClientFilter.tsx
│       ├── CompactSalesMetrics.tsx
│       ├── ConfigError.tsx
│       ├── ConfigureTargetsModal.tsx
│       ├── DateRangeFilter.tsx
│       ├── DropdownPortal.tsx
│       ├── EditableFunnelSpreadsheet.tsx
│       ├── ExpandableDataPanel.tsx
│       ├── FunnelSpreadsheet.tsx
│       ├── InlineLeadsTable.tsx
│       ├── InviteUserModal.tsx
│       ├── IterationLogModal.tsx
│       ├── LeadsModal.tsx
│       ├── MeetingsBookedEditor.tsx
│       ├── MeetingsBookedTable.tsx
│       ├── MeetingsDrillDown.tsx
│       ├── MentionInput.tsx
│       ├── MetricCard.tsx
│       ├── MiniScorecard.tsx
│       ├── ModalPortal.tsx
│       ├── OpportunityStageDropdown.tsx
│       ├── OpportunityStageModal.tsx
│       ├── PipelineMetricsSection.tsx
│       ├── ReplyDetailModal.tsx
│       ├── SalesMetricCards.tsx
│       ├── StatusFilter.tsx
│       └── TableSkeleton.tsx
│
├── contexts/
│   ├── AIContext.tsx
│   ├── AuthContext.tsx
│   └── FilterContext.tsx
│
├── hooks/
│   ├── useCampaigns.ts
│   ├── useCampaignScorecardData.ts
│   ├── useCampaignStats.ts
│   ├── useClients.ts
│   ├── useDeepInsights.ts
│   ├── useFirmographicInsights.ts
│   ├── useIterationLog.ts
│   ├── useOpportunities.ts
│   ├── usePipelineData.ts
│   ├── useQuickViewData.ts
│   ├── useSalesMetrics.ts
│   ├── useSequenceStats.ts
│   └── useSlackUsers.ts
│
├── lib/
│   ├── auth-helpers.ts
│   ├── cache.ts
│   ├── pipeline-utils.ts
│   └── supabase.ts
│
├── pages/
│   ├── AtomicCRM/
│   │   ├── index.tsx
│   │   ├── components/
│   │   │   ├── companies/
│   │   │   ├── contacts/
│   │   │   │   ├── ContactList.tsx
│   │   │   │   └── ContactModal.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── CRMDashboard.tsx
│   │   │   ├── deals/
│   │   │   │   ├── DealModal.tsx
│   │   │   │   └── DealsKanban.tsx
│   │   │   ├── layout/
│   │   │   │   └── CRMLayout.tsx
│   │   │   ├── shared/
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── GlowCard.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── PipelineProgressDropdown.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── SlidePanel.tsx
│   │   │   │   └── StageDropdown.tsx
│   │   │   └── tasks/
│   │   │       ├── TaskList.tsx
│   │   │       └── TaskModal.tsx
│   │   ├── config/
│   │   │   └── theme.ts
│   │   ├── context/
│   │   │   └── CRMContext.tsx
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── CRMPage/
│   │   ├── index.tsx
│   │   ├── components/
│   │   │   ├── AddRowButton.tsx
│   │   │   ├── cells/
│   │   │   │   ├── CurrencyCell.tsx
│   │   │   │   ├── DateCell.tsx
│   │   │   │   ├── PhoneCell.tsx
│   │   │   │   ├── PipelineProgressCell.tsx
│   │   │   │   ├── SelectCell.tsx
│   │   │   │   ├── TextCell.tsx
│   │   │   │   └── UrlCell.tsx
│   │   │   ├── CRMHeader.tsx
│   │   │   ├── CRMRow.tsx
│   │   │   ├── CRMTable.tsx
│   │   │   ├── LeadDetailSidebar.tsx
│   │   │   └── ResizableColumnHeader.tsx
│   │   ├── config/
│   │   │   ├── columns.ts
│   │   │   └── designTokens.ts
│   │   ├── hooks/
│   │   │   └── useLeads.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── formatters.ts
│   │
│   ├── AuthCallback.tsx
│   ├── ClientDetailView.tsx
│   ├── DeepView.tsx
│   ├── Login.tsx
│   ├── PipelineView.tsx
│   ├── SetPassword.tsx
│   └── SettingsPage.tsx
│
└── types/
    └── database.ts
```

---

## Configuration Files

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3421,
    host: true,
  },
})
```

### Tailwind Configuration

Key extensions in `tailwind.config.js`:
- Custom color palette (rillation, crm)
- Extended spacing scale
- Custom font sizes
- Z-index scale
- Box shadow presets
- Border radius tokens
- Transition duration presets

### PostCSS Configuration

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### TypeScript Configuration

- Strict mode enabled
- React 19 JSX transform
- Path aliases not configured (uses relative imports)

---

## Environment Variables

Required for full functionality:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CALENDLY_CLIENT_ID=your-calendly-client-id  # Optional
```

---

## Key Patterns & Conventions

### Component Patterns

1. **Default exports** for page and layout components
2. **Named exports** for shared utilities
3. **Props interfaces** defined inline or exported
4. **Framer Motion** wrappers for animated components

### State Management

1. **Context** for global state (auth, filters, AI)
2. **Local state** for component-specific UI
3. **Custom hooks** for data fetching with Supabase

### Naming Conventions

- **Components:** PascalCase (`MetricCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useQuickViewData.ts`)
- **Types:** PascalCase (`ChartDataPoint`)
- **CSS Classes:** kebab-case (`.metric-card`)
- **CSS Variables:** kebab-case (`--crm-bg-base`)

### Import Order

1. React imports
2. Third-party libraries
3. Components (absolute or relative)
4. Hooks
5. Types
6. Assets/styles

---

*Last updated: January 2026*
