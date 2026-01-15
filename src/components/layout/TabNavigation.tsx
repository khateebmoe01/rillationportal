import { NavLink, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import DateRangeFilter from '../ui/DateRangeFilter'
import Button from '../ui/Button'
import { useFilters } from '../../contexts/FilterContext'
import { getDateRange } from '../../lib/supabase'

const tabs = [
  { path: '/performance', label: 'Performance' },
  { path: '/pipeline', label: 'Pipeline' },
]

export default function TabNavigation() {
  const location = useLocation()
  const isPipelinePage = location.pathname === '/pipeline'

  const {
    selectedClient,
    datePreset,
    setDatePreset,
    dateRange,
    setDateRange,
    clearFilters,
  } = useFilters()

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset)
    setDateRange(getDateRange(preset))
  }

  return (
    <nav className="px-6 border-b border-rillation-border">
      <div className="flex items-center justify-between gap-4 py-2">
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`
                  relative px-4 py-3 text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-white'
                    : 'text-white/80 hover:text-white'
                  }
                `}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rillation-text" />
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          {/* Client (locked to auth) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rillation-bg border border-rillation-border rounded-lg">
            <Lock size={12} className="text-white" />
            <span className="text-sm text-white">{selectedClient || 'Client'}</span>
          </div>

          {/* Date Range Filter */}
          <DateRangeFilter
            startDate={dateRange.start}
            endDate={dateRange.end}
            onStartDateChange={(date) => setDateRange({ ...dateRange, start: date })}
            onEndDateChange={(date) => setDateRange({ ...dateRange, end: date })}
            onPresetChange={handlePresetChange}
            activePreset={datePreset}
          />

          {/* Clear Button */}
          {!isPipelinePage && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
