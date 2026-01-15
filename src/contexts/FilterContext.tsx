import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getDateRange } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface FilterContextType {
  // Client filter - automatically set from auth, read-only
  selectedClient: string | null
  
  // Date filter
  datePreset: string
  setDatePreset: (preset: string) => void
  dateRange: { start: Date; end: Date }
  setDateRange: (range: { start: Date; end: Date }) => void
  
  // Clear all filters (except client)
  clearFilters: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const { client } = useAuth()
  const [datePreset, setDatePreset] = useState('thisMonth')
  const [dateRange, setDateRange] = useState(() => getDateRange('thisMonth'))
  
  // Update date range when preset changes
  useEffect(() => {
    setDateRange(getDateRange(datePreset))
  }, [datePreset])
  
  const clearFilters = () => {
    setDatePreset('thisMonth')
    setDateRange(getDateRange('thisMonth'))
  }
  
  return (
    <FilterContext.Provider
      value={{
        selectedClient: client, // Always use client from auth
        datePreset,
        setDatePreset,
        dateRange,
        setDateRange,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}
