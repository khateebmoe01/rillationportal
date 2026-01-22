# Rillation Portal — Development Conventions & AI Cursor Rules

> **The Definitive Guide for Building Excellence**
> 
> This document establishes the uncompromising standards for code quality, architecture decisions, and development practices for the Rillation Portal. Every contribution must adhere to these principles—no exceptions.

---

## Table of Contents

1. [The Rillation Standard](#the-rillation-standard)
2. [Application Philosophy & Goals](#application-philosophy--goals)
3. [Cursor AI Rules & Guidelines](#cursor-ai-rules--guidelines)
4. [Architecture Principles](#architecture-principles)
5. [TypeScript Conventions](#typescript-conventions)
6. [React Patterns & Best Practices](#react-patterns--best-practices)
7. [State Management](#state-management)
8. [Custom Hooks Architecture](#custom-hooks-architecture)
9. [Component Design System](#component-design-system)
10. [Styling & Design Tokens](#styling--design-tokens)
11. [Supabase & Database Conventions](#supabase--database-conventions)
12. [Security Standards](#security-standards)
13. [Performance Optimization](#performance-optimization)
14. [Error Handling Philosophy](#error-handling-philosophy)
15. [File Structure & Organization](#file-structure--organization)
16. [Naming Conventions](#naming-conventions)
17. [Code Quality Gates](#code-quality-gates)
18. [Forbidden Patterns](#forbidden-patterns)

---

## The Rillation Standard

### Core Philosophy

**"We do not ship mediocrity."**

Every line of code in this codebase represents our commitment to excellence. This is not just a client portal—it's a precision instrument for sales and marketing intelligence. The code must reflect this precision.

### The Three Pillars

1. **Clarity** — Code should read like well-written prose. If a junior developer cannot understand it in one pass, it's too clever.

2. **Robustness** — Every edge case is considered. Every null check is intentional. Every error is gracefully handled.

3. **Performance** — Sub-100ms interactions. No unnecessary re-renders. Data fetching is surgical.

### The Quality Bar

Before any code is committed, ask yourself:

- Would I be proud to explain this to the CTO line by line?
- If this code fails at 3 AM, will the error message tell me exactly what went wrong?
- Is there any way to make this simpler without sacrificing functionality?
- Does this code make the next developer's life easier or harder?

---

## Application Philosophy & Goals

### What Rillation Portal Is

Rillation Portal is a **B2B SaaS dashboard** designed for enterprise sales and marketing teams. It provides:

- **Campaign Intelligence** — Real-time visibility into email outreach performance
- **Pipeline Management** — Full CRM capabilities with deal tracking
- **Meeting Analytics** — Firmographic insights on booked meetings
- **Multi-Tenant Security** — Complete data isolation between clients

### Target Users

Our users are:
- Sales Development Representatives (SDRs) checking daily metrics
- Sales Managers reviewing team performance
- Marketing Directors analyzing campaign ROI
- Revenue Operations teams needing pipeline visibility

### Design Goals

1. **Speed** — The dashboard should feel instantaneous. No spinners lasting more than 300ms on typical operations.

2. **Clarity** — Every metric should be immediately understandable. No ambiguous labels.

3. **Actionability** — Data without action is noise. Every view should enable a decision.

4. **Reliability** — This is a production tool. Downtime or bugs directly impact revenue operations.

### Technical Goals

1. **Type Safety** — Zero `any` types in production code. TypeScript is our first line of defense.

2. **Data Integrity** — Row Level Security (RLS) ensures clients never see each other's data.

3. **Maintainability** — The codebase should be approachable for new developers within their first week.

4. **Scalability** — Architecture decisions should support 10x growth in data volume.

---

## Cursor AI Rules & Guidelines

### Core Directive

When working with Cursor AI on this codebase, the AI must:

1. **Prioritize Understanding** — Read and analyze existing code before proposing changes. Never assume.

2. **Match Existing Patterns** — This codebase has established conventions. Follow them exactly.

3. **Explain Rationale** — Every significant change should come with a brief explanation of *why*.

4. **Verify Before Implementing** — When uncertain, search the codebase for existing solutions.

### What Cursor Must Always Do

```
✓ Read relevant files before making changes
✓ Use existing utility functions (formatNumber, formatCurrency, etc.)
✓ Follow the established hook pattern for data fetching
✓ Apply proper TypeScript types—never use `any`
✓ Include loading and error states for async operations
✓ Use Tailwind classes for styling (prefer existing design tokens)
✓ Apply Framer Motion for animations following existing patterns
✓ Consider RLS implications for any database queries
✓ Handle pagination for large data sets (1000 row limit)
✓ Use proper date formatting (formatDateForQuery, formatDateForQueryEndOfDay)
```

### What Cursor Must Never Do

```
✗ Add new dependencies without explicit approval
✗ Create duplicate utility functions
✗ Use inline styles when Tailwind classes exist
✗ Ignore TypeScript errors or use `@ts-ignore`
✗ Skip error handling in async operations
✗ Create new React contexts without clear justification
✗ Make database queries without RLS considerations
✗ Use raw SQL when Supabase query builder works
✗ Add console.log statements (use proper error handling)
✗ Create "temporary" code that bypasses conventions
```

### File Reading Protocol

Before modifying any file, Cursor must:

1. **Check for imports** — Understand what utilities and components already exist
2. **Review related files** — Look at similar components for pattern consistency
3. **Examine types** — Review `src/types/database.ts` for data structures
4. **Check hooks** — See if a custom hook already handles the data need

### Code Generation Standards

When generating new code:

```typescript
// ✗ BAD: Generic, untyped, no error handling
const fetchData = async () => {
  const { data } = await supabase.from('table').select()
  setData(data)
}

// ✓ GOOD: Typed, paginated, proper error handling
const fetchData = useCallback(async () => {
  try {
    setLoading(true)
    setError(null)
    
    let allData: TableRow[] = []
    let offset = 0
    const PAGE_SIZE = 1000
    
    while (true) {
      let query = supabase
        .from('table')
        .select('column1, column2, column3')
        .range(offset, offset + PAGE_SIZE - 1)
      
      if (client) query = query.eq('client', client)
      
      const { data, error: queryError } = await query
      
      if (queryError) throw queryError
      if (!data || data.length === 0) break
      
      allData = allData.concat(data)
      offset += PAGE_SIZE
      
      if (data.length < PAGE_SIZE) break
    }
    
    setData(allData)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch data')
  } finally {
    setLoading(false)
  }
}, [client])
```

### Component Pattern Matching

When creating components, match the existing style:

```typescript
// Follow this pattern for all new components
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ComponentNameProps {
  title: string
  value: number
  optional?: string
}

export default function ComponentName({
  title,
  value,
  optional = 'default',
}: ComponentNameProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="bg-rillation-card border border-rillation-border rounded-xl p-4"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Component content */}
    </motion.div>
  )
}
```

---

## Architecture Principles

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          PAGES                                   │
│  (Route components that compose features)                        │
│  ClientDetailView, PipelineView, AtomicCRM                       │
├─────────────────────────────────────────────────────────────────┤
│                        COMPONENTS                                │
│  (Reusable UI pieces organized by domain)                        │
│  layout/, ui/, charts/, insights/                                │
├─────────────────────────────────────────────────────────────────┤
│                          HOOKS                                   │
│  (Data fetching and business logic)                              │
│  useQuickViewData, usePipelineData, useOpportunities             │
├─────────────────────────────────────────────────────────────────┤
│                        CONTEXTS                                  │
│  (Global application state)                                      │
│  AuthContext, FilterContext, AIContext                           │
├─────────────────────────────────────────────────────────────────┤
│                       LIB/UTILS                                  │
│  (Pure functions and Supabase client)                            │
│  supabase.ts, cache.ts, pipeline-utils.ts                        │
├─────────────────────────────────────────────────────────────────┤
│                         TYPES                                    │
│  (TypeScript definitions)                                        │
│  database.ts, crm types                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action
    │
    ▼
Context (FilterContext/AuthContext)
    │
    ▼
Custom Hook (useQuickViewData)
    │
    ▼
Supabase Query (with RLS)
    │
    ▼
PostgreSQL Database
    │
    ▼
Response → Hook State Update → Component Re-render
```

### Dependency Rules

1. **Pages** can import from: components, hooks, contexts, lib, types
2. **Components** can import from: other components (same level or below), lib, types
3. **Hooks** can import from: lib, types, contexts
4. **Contexts** can import from: lib, types
5. **Lib/Utils** can import from: types only

**Never create circular dependencies.**

---

## TypeScript Conventions

### Type Definition Standards

```typescript
// ✓ REQUIRED: Explicit interface for all props
interface ComponentProps {
  // Required props first
  id: string
  title: string
  value: number
  
  // Optional props after, with defaults
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  
  // Callback functions last
  onClick?: (id: string) => void
  onHover?: () => void
}

// ✓ REQUIRED: Type all state
const [data, setData] = useState<DataType[]>([])
const [loading, setLoading] = useState<boolean>(true)
const [error, setError] = useState<string | null>(null)

// ✓ REQUIRED: Type function parameters and returns
function calculateMetric(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0)
}

// ✓ REQUIRED: Use proper generics for Supabase
const { data, error } = await supabase
  .from('replies')
  .select('*')
  .returns<Reply[]>()
```

### Forbidden Type Patterns

```typescript
// ✗ NEVER use 'any'
const data: any = response

// ✗ NEVER use type assertions to silence errors
const value = data as unknown as SomeType

// ✗ NEVER use @ts-ignore or @ts-expect-error
// @ts-ignore
const result = brokenCode()

// ✗ NEVER use implicit 'any' from missing types
function processData(data) { // Missing type!
  return data.value
}
```

### Utility Types Usage

```typescript
// Use Partial for optional updates
type LeadUpdate = Partial<EngagedLead>

// Use Pick for specific field subsets
type LeadPreview = Pick<EngagedLead, 'id' | 'full_name' | 'company'>

// Use Omit for excluding fields
type LeadWithoutId = Omit<EngagedLead, 'id'>

// Use Record for dynamic keys
type MetricsByDate = Record<string, QuickViewMetrics>
```

---

## React Patterns & Best Practices

### Component Structure

Every component should follow this structure:

```typescript
// 1. Imports - grouped by type
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'

import { useFilters } from '../../contexts/FilterContext'
import { useQuickViewData } from '../../hooks/useQuickViewData'
import { formatNumber } from '../../lib/supabase'
import type { QuickViewMetrics } from '../../types/database'

// 2. Types/Interfaces
interface DashboardProps {
  client: string
  showDetails?: boolean
}

// 3. Component definition with destructured props
export default function Dashboard({ 
  client,
  showDetails = false,
}: DashboardProps) {
  // 4. Context hooks
  const { dateRange } = useFilters()
  
  // 5. Data fetching hooks
  const { metrics, loading, error } = useQuickViewData({
    client,
    startDate: dateRange.start,
    endDate: dateRange.end,
  })
  
  // 6. Local state
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 7. Derived state / memos
  const totalValue = metrics?.totalEmailsSent ?? 0
  
  // 8. Callbacks
  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])
  
  // 9. Effects
  useEffect(() => {
    // Side effects here
  }, [dependencies])
  
  // 10. Early returns for loading/error states
  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorDisplay message={error} />
  
  // 11. Main render
  return (
    <div className="space-y-4">
      {/* Component JSX */}
    </div>
  )
}
```

### Hook Dependencies

Always include all dependencies in useEffect/useCallback/useMemo:

```typescript
// ✓ CORRECT: All dependencies listed
const fetchData = useCallback(async () => {
  await loadData(client, startDate, endDate)
}, [client, startDate, endDate])

// ✗ WRONG: Missing dependencies
const fetchData = useCallback(async () => {
  await loadData(client, startDate, endDate)
}, []) // Will use stale values!
```

### Conditional Rendering

```typescript
// ✓ PREFERRED: Early returns for major conditions
if (!data) return null
if (loading) return <Spinner />
if (error) return <Error message={error} />

return <ActualContent data={data} />

// ✓ ACCEPTABLE: Inline for minor conditions
return (
  <div>
    {showTitle && <h1>{title}</h1>}
    {items.map(item => <Item key={item.id} {...item} />)}
  </div>
)

// ✗ AVOID: Nested ternaries
return condition1 
  ? condition2 
    ? <A /> 
    : <B />
  : <C />
```

---

## State Management

### Context Usage

We use React Context for three primary concerns:

| Context | Purpose | State It Manages |
|---------|---------|------------------|
| `AuthContext` | Authentication | user, client, role, session |
| `FilterContext` | Global filters | dateRange, selectedClient |
| `AIContext` | AI assistant | isPanelOpen, chartContext, screenshots |

### When to Use Context

```typescript
// ✓ USE Context for:
// - Authentication state (user, client)
// - Global filters (date range, selected campaigns)
// - Feature flags (AI panel visibility)
// - Theme preferences

// ✗ DON'T use Context for:
// - Component-local state (modal open/closed)
// - Form state (use local useState)
// - Server-fetched data (use custom hooks)
// - Prop drilling across 2-3 levels (just pass props)
```

### Local State Guidelines

```typescript
// ✓ Simple boolean states
const [isOpen, setIsOpen] = useState(false)

// ✓ Complex state with clear updates
const [formState, setFormState] = useState<FormState>({
  name: '',
  email: '',
  company: '',
})

const updateField = (field: keyof FormState, value: string) => {
  setFormState(prev => ({ ...prev, [field]: value }))
}

// ✓ Derived state (no separate useState needed)
const isValid = formState.name.length > 0 && formState.email.includes('@')
```

---

## Custom Hooks Architecture

### Hook Design Pattern

Every data-fetching hook should follow this template:

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase, formatDateForQuery } from '../lib/supabase'

interface UseDataParams {
  client: string | null
  startDate: Date
  endDate: Date
  campaigns?: string[]
}

interface UseDataReturn {
  data: DataType | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useData({
  client,
  startDate,
  endDate,
  campaigns,
}: UseDataParams): UseDataReturn {
  const [data, setData] = useState<DataType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    // Don't fetch without a client
    if (!client) {
      setData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const startStr = formatDateForQuery(startDate)
      const endStr = formatDateForQuery(endDate)

      // Build query with pagination
      let allData: DataType[] = []
      let offset = 0
      const PAGE_SIZE = 1000

      while (true) {
        let query = supabase
          .from('table_name')
          .select('col1, col2, col3')
          .eq('client', client)
          .gte('date', startStr)
          .lte('date', endStr)
          .range(offset, offset + PAGE_SIZE - 1)

        if (campaigns?.length) {
          query = query.in('campaign_name', campaigns)
        }

        const { data: pageData, error: queryError } = await query

        if (queryError) throw queryError
        if (!pageData || pageData.length === 0) break

        allData = allData.concat(pageData)
        offset += PAGE_SIZE

        if (pageData.length < PAGE_SIZE) break
      }

      setData(processData(allData))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [client, startDate, endDate, campaigns])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

### Hook Naming Convention

```
use[Domain][Action]
    ↓       ↓
useQuickViewData     — fetches quick view metrics
usePipelineData      — fetches pipeline/funnel data
useCampaigns         — fetches campaign list
useOpportunities     — fetches opportunity data
useFirmographicInsights — fetches firmographic breakdowns
```

---

## Component Design System

### Component Categories

```
src/components/
├── layout/           # App-level layout (Sidebar, Header, Layout)
├── ui/               # Reusable primitives (Button, Modal, MetricCard)
├── charts/           # Data visualization (FunnelChart, TrendChart)
└── insights/         # Analytics panels (FirmographicInsightsPanel)

src/pages/AtomicCRM/components/
├── shared/           # CRM-specific primitives (Card, Badge, Input)
├── contacts/         # Contact management components
├── deals/            # Deal/pipeline components
└── tasks/            # Task management components
```

### Component Sizing Convention

```typescript
// Always use consistent prop interfaces for size variants
type Size = 'sm' | 'md' | 'lg'

interface ComponentProps {
  size?: Size
}

// Map sizes to specific values
const sizeMap = {
  sm: { padding: 8, fontSize: 12, height: 32 },
  md: { padding: 12, fontSize: 14, height: 40 },
  lg: { padding: 16, fontSize: 16, height: 48 },
}
```

### Animation Standards

All interactive elements should use Framer Motion:

```typescript
// Standard hover interaction
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>

// Page transitions
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25, ease: 'easeInOut' }}
>

// Staggered children
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
```

---

## Styling & Design Tokens

### Color System

Use the design tokens defined in `tailwind.config.js`:

```javascript
// Primary palette (rillation-*)
'rillation-bg'         // #000000 - Pure black background
'rillation-card'       // #141414 - Card backgrounds
'rillation-card-hover' // #1a1a1a - Card hover states
'rillation-border'     // #222222 - Borders
'rillation-green'      // #22c55e - Primary accent (success)
'rillation-magenta'    // #d946ef - Secondary accent
'rillation-cyan'       // #22d3ee - Tertiary accent
'rillation-orange'     // #f97316 - Warning states
'rillation-red'        // #ef4444 - Error states
'rillation-text'       // #ffffff - Primary text
'rillation-text-muted' // #888888 - Muted text

// CRM-specific palette (crm-*)
'crm-base'            // #0a0a0a - Deepest background
'crm-raised'          // #111111 - Raised surfaces
'crm-elevated'        // #161616 - Elevated elements
'crm-surface'         // #1a1a1a - Interactive surfaces
'crm-border'          // #2a2a2a - Standard borders
'crm-accent'          // #22c55e - CRM accent color
```

### Typography

```javascript
// Use Sora as the primary font
font-sans: ['Sora', 'system-ui', 'sans-serif']

// Font size scale (in tailwind classes)
text-xs    // 11px - Small labels
text-sm    // 12px - Secondary text
text-base  // 13px - Body text
text-md    // 14px - Emphasized body
text-lg    // 16px - Section headers
text-xl    // 18px - Page headers
```

### Spacing Scale

Use the 8px base spacing scale:

```javascript
// Standard spacing (Tailwind)
p-2    // 8px
p-3    // 12px
p-4    // 16px
p-6    // 24px
p-8    // 32px

// Custom tokens
h-row     // 52px - Table row height
h-header  // 44px - Header height
h-toolbar // 56px - Toolbar height
```

### Shadow System

```javascript
shadow-sticky   // For sticky columns
shadow-header   // For fixed headers
shadow-dropdown // For dropdowns/popovers
shadow-modal    // For modal overlays
```

### Class Composition

```typescript
// ✓ PREFERRED: Group related utilities
className="
  flex items-center justify-between
  bg-rillation-card border border-rillation-border
  rounded-xl p-4
  text-rillation-text text-sm font-medium
  transition-colors duration-150
  hover:bg-rillation-card-hover
"

// ✗ AVOID: Random ordering
className="p-4 font-medium flex bg-rillation-card items-center border text-sm"
```

---

## Supabase & Database Conventions

### Query Building

```typescript
// ✓ CORRECT: Explicit column selection (faster, more secure)
const { data } = await supabase
  .from('replies')
  .select('id, category, lead_id, date_received, client')
  .eq('client', client)

// ✗ AVOID: Select all (slower, may expose unnecessary data)
const { data } = await supabase
  .from('replies')
  .select('*')
```

### Date Filtering

```typescript
// For DATE columns (like campaign_reporting.date)
.gte('date', formatDateForQuery(startDate))  // '2025-01-15'
.lte('date', formatDateForQuery(endDate))    // '2025-01-31'

// For TIMESTAMPTZ columns (like replies.date_received)
// Use lt() with next day to include entire end date
.gte('date_received', formatDateForQuery(startDate))
.lt('date_received', formatDateForQueryEndOfDay(endDate))
```

### Pagination Pattern

Supabase has a 1000 row limit. Always paginate for potentially large datasets:

```typescript
const PAGE_SIZE = 1000
let allData: RowType[] = []
let offset = 0

while (true) {
  const { data, error } = await supabase
    .from('table')
    .select('columns')
    .eq('client', client)
    .range(offset, offset + PAGE_SIZE - 1)
  
  if (error) throw error
  if (!data || data.length === 0) break
  
  allData = allData.concat(data)
  offset += PAGE_SIZE
  
  if (data.length < PAGE_SIZE) break // Last page
}
```

### RLS-Safe Queries

Always include client filter even though RLS enforces it:

```typescript
// ✓ CORRECT: Explicit client filter (defense in depth)
.eq('client', client)

// This is important because:
// 1. Makes the query intent explicit
// 2. Allows for query optimization
// 3. Provides safety if RLS is misconfigured
```

### Insert/Update Patterns

```typescript
// Insert with returning
const { data, error } = await supabase
  .from('engaged_leads')
  .insert({
    client,
    email: newLead.email,
    full_name: newLead.name,
    company: newLead.company,
  })
  .select()
  .single()

// Update specific fields
const { error } = await supabase
  .from('engaged_leads')
  .update({ 
    stage: newStage,
    updated_at: new Date().toISOString(),
  })
  .eq('id', leadId)
  .eq('client', client) // Always include client for safety
```

---

## Security Standards

### Row Level Security

All tables must have RLS policies. Example policy:

```sql
CREATE POLICY "Users can only access their client's data"
ON table_name
FOR ALL
TO authenticated
USING (client = (auth.jwt() ->> 'client'));
```

### Client Isolation

1. **Never** trust client-side client values for security
2. **Always** verify client from the JWT in RLS policies
3. **Never** expose the service role key to the frontend
4. **Always** use the anon key for frontend operations

### Sensitive Data Handling

```typescript
// ✗ NEVER log sensitive data
console.log('User data:', user)

// ✓ Log only identifiers if needed
console.log('User ID:', user.id)

// ✗ NEVER expose full error details to users
catch (err) {
  setError(err.message) // May contain sensitive info
}

// ✓ Show user-friendly messages
catch (err) {
  console.error('Operation failed:', err)
  setError('Unable to load data. Please try again.')
}
```

---

## Performance Optimization

### Render Optimization

```typescript
// ✓ Memoize expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(rawData)
}, [rawData])

// ✓ Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// ✓ Use React.memo for pure components
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return items.map(item => <ExpensiveItem key={item.id} {...item} />)
})
```

### Data Fetching Optimization

```typescript
// ✓ Fetch only needed columns
.select('id, name, value')

// ✓ Apply filters at database level
.eq('client', client)
.gte('date', startDate)
.order('date', { ascending: false })
.limit(100)

// ✓ Use indexes (these should exist in the database)
// CREATE INDEX idx_client_date ON table_name(client, date);
```

### Bundle Size

```typescript
// ✓ Import specific icons
import { ChevronDown, X, Settings } from 'lucide-react'

// ✗ Don't import entire libraries
import * as Icons from 'lucide-react'

// ✓ Lazy load heavy components
const Chart = React.lazy(() => import('./Chart'))
```

---

## Error Handling Philosophy

### The Error Handling Triangle

```
    CATCH
      │
      ├── LOG (for debugging)
      │
      ├── RECOVER (if possible)
      │
      └── INFORM (user-friendly message)
```

### Implementation

```typescript
try {
  const result = await riskyOperation()
  handleSuccess(result)
} catch (err) {
  // 1. LOG: Full details for debugging
  console.error('Operation failed:', {
    error: err,
    context: { operationId, userId },
    timestamp: new Date().toISOString(),
  })
  
  // 2. RECOVER: Try fallback if available
  const cached = getFromCache(cacheKey)
  if (cached) {
    setData(cached)
    return
  }
  
  // 3. INFORM: User-friendly message
  setError('Unable to load your data. Please try again.')
} finally {
  setLoading(false)
}
```

### Error Types

```typescript
// Network errors
if (err.name === 'TypeError' && err.message.includes('fetch')) {
  setError('Connection lost. Check your internet.')
}

// Authentication errors
if (err.code === 'PGRST301' || err.message.includes('JWT')) {
  redirectToLogin()
}

// Permission errors
if (err.code === '42501') {
  setError('You don\'t have permission to access this.')
}
```

---

## File Structure & Organization

### Directory Structure

```
src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point, provider setup
├── index.css                  # Global styles, Tailwind imports
│
├── components/
│   ├── auth/                  # Authentication components
│   │   └── ProtectedRoute.tsx
│   ├── charts/                # Data visualization
│   │   ├── FunnelChart.tsx
│   │   ├── TrendChart.tsx
│   │   └── ...
│   ├── insights/              # Analytics panels
│   │   ├── FirmographicInsightsPanel.tsx
│   │   └── ...
│   ├── layout/                # App structure
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TabNavigation.tsx
│   └── ui/                    # Reusable primitives
│       ├── Button.tsx
│       ├── MetricCard.tsx
│       ├── ModalPortal.tsx
│       └── ...
│
├── contexts/
│   ├── AuthContext.tsx        # User/client state
│   ├── FilterContext.tsx      # Date/filter state
│   └── AIContext.tsx          # AI assistant state
│
├── hooks/
│   ├── useQuickViewData.ts    # Dashboard metrics
│   ├── usePipelineData.ts     # Funnel data
│   ├── useCampaigns.ts        # Campaign list
│   └── ...
│
├── lib/
│   ├── supabase.ts            # Client + utilities
│   ├── cache.ts               # Caching utilities
│   └── pipeline-utils.ts      # Pipeline helpers
│
├── pages/
│   ├── ClientDetailView.tsx   # Performance page
│   ├── PipelineView.tsx       # Pipeline page
│   ├── DeepView.tsx           # Deep insights page
│   ├── SettingsPage.tsx       # Settings page
│   └── AtomicCRM/             # CRM module (self-contained)
│       ├── index.tsx
│       ├── components/
│       ├── context/
│       └── types/
│
└── types/
    └── database.ts            # Supabase types
```

### File Size Limits

- **Components**: Max 300 lines. Break into smaller components if larger.
- **Hooks**: Max 200 lines. Extract helper functions if larger.
- **Pages**: Max 400 lines. Compose from smaller components.

---

## Naming Conventions

### Files & Directories

```
// Components: PascalCase
MetricCard.tsx
FunnelChart.tsx
CampaignBreakdownTable.tsx

// Hooks: camelCase with 'use' prefix
useQuickViewData.ts
usePipelineData.ts
useFirmographicInsights.ts

// Utilities: camelCase
supabase.ts
cache.ts
pipeline-utils.ts

// Types: camelCase for files, PascalCase for type names
database.ts  →  interface EngagedLead { }

// Directories: lowercase kebab-case
components/
├── ui/
├── charts/
└── insights/
```

### Variables & Functions

```typescript
// Variables: camelCase
const totalEmailsSent = 1000
const isLoading = true
const dateRange = { start: new Date(), end: new Date() }

// Functions: camelCase, verb-first
function fetchData() { }
function calculateMetrics() { }
function handleClick() { }
function formatDateForQuery() { }

// Constants: UPPER_SNAKE_CASE
const PAGE_SIZE = 1000
const DEFAULT_DATE_PRESET = 'thisMonth'
const MAX_RETRIES = 3

// Boolean variables: is/has/should prefix
const isLoading = true
const hasError = false
const shouldRefetch = true
```

### Components & Props

```typescript
// Component names: PascalCase, descriptive
function CampaignBreakdownTable() { }
function MetricCard() { }
function DateRangeFilter() { }

// Props interfaces: ComponentName + 'Props'
interface MetricCardProps { }
interface DateRangeFilterProps { }

// Event handlers: handle + Event
onClick → handleClick
onSubmit → handleSubmit
onHover → handleHover
```

---

## Code Quality Gates

### Before Every Commit

1. **TypeScript Check**: Zero errors
   ```bash
   npx tsc --noEmit
   ```

2. **No Console Statements**: Remove all console.log (error logging exceptions)

3. **No Unused Variables**: Clean up imports and declarations

4. **Type Coverage**: No `any` types

5. **Component Props**: All props typed with interfaces

### Pull Request Checklist

```markdown
- [ ] TypeScript compiles without errors
- [ ] No new ESLint warnings
- [ ] All new components have TypeScript interfaces
- [ ] Loading and error states handled
- [ ] RLS considered for any database operations
- [ ] Mobile responsiveness verified
- [ ] No hardcoded client values
- [ ] Follows existing patterns in codebase
```

---

## Forbidden Patterns

### Never Do These

```typescript
// ✗ Using 'any' type
const data: any = response

// ✗ Ignoring TypeScript errors
// @ts-ignore
const value = brokenCode()

// ✗ Mutating state directly
state.items.push(newItem) // Use setState instead

// ✗ Using index as key for dynamic lists
items.map((item, index) => <Item key={index} />)

// ✗ Async in useEffect without cleanup
useEffect(async () => { // Don't do this
  await fetchData()
}, [])

// ✗ Hardcoding client values
.eq('client', 'Acme Corp') // Use context

// ✗ Storing secrets in code
const apiKey = 'sk-live-xxxxx' // Use env vars

// ✗ Direct DOM manipulation
document.getElementById('root').innerHTML = ''

// ✗ Creating god components (500+ lines)

// ✗ Prop drilling beyond 3 levels

// ✗ Business logic in components (use hooks)

// ✗ Inline anonymous functions in JSX
<button onClick={() => doSomething(id)} /> // Use useCallback

// ✗ Mixing inline styles with Tailwind
style={{ padding: 20 }} className="p-4" // Pick one
```

### Anti-Patterns to Avoid

```typescript
// ✗ Over-engineering
class AbstractFactoryBuilderManager { } // Keep it simple

// ✗ Premature optimization
const memoizedValue = useMemo(() => x + 1, [x]) // Too simple to memoize

// ✗ Comments that explain "what" instead of "why"
// Add 1 to count
count = count + 1

// ✗ Magic numbers
if (items.length > 47) { } // What's 47?

// ✓ Named constants
const MAX_ITEMS_PER_PAGE = 47
if (items.length > MAX_ITEMS_PER_PAGE) { }
```

---

## Final Words

This codebase represents the culmination of thoughtful engineering decisions. Every pattern exists for a reason. Every convention was chosen deliberately.

When you contribute code:

1. **Respect what came before** — Understand existing patterns before introducing new ones
2. **Think like an owner** — Would you stake your reputation on this code?
3. **Optimize for the reader** — You write code once but it's read dozens of times
4. **Leave it better than you found it** — Small improvements compound

**The goal is not just working software—it's software that is a joy to work with.**

---

*Rillation Portal Development Conventions v1.0*
*Last Updated: January 2026*
