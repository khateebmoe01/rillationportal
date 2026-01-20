import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, ChevronDown, X } from 'lucide-react'
import { COLUMNS, STAGE_COLORS, LEAD_SOURCE_COLORS } from '../config/columns'
import type { LeadFilters } from '../types'

interface CRMHeaderProps {
  recordCount: number
  filters: LeadFilters
  onFiltersChange: (filters: LeadFilters) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddClick: () => void
  uniqueAssignees: string[]
  selectedCount?: number
}

// Dropdown component for filters
function FilterDropdown({ 
  label, 
  value, 
  options, 
  onChange, 
  colorMap 
}: { 
  label: string
  value: string | null
  options: string[]
  onChange: (value: string | null) => void
  colorMap?: Record<string, { bg: string; text: string; label?: string }>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const displayValue = value 
    ? (colorMap?.[value]?.label || value) 
    : `All ${label}`

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded border transition-colors ${
          value
            ? 'bg-[#1f1f1f] border-[#3b82f6] text-[#f0f0f0]'
            : 'bg-[#161616] border-[#2a2a2a] text-[#f0f0f0] hover:border-[#3a3a3a]'
        }`}
      >
        <span className="truncate max-w-[100px]">{displayValue}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 top-full mt-1 min-w-[160px] bg-[#1f1f1f] border border-[#2a2a2a] rounded shadow-lg py-1 max-h-[250px] overflow-y-auto"
          >
            {/* All option */}
            <div
              onClick={() => { onChange(null); setIsOpen(false) }}
              className={`px-3 py-1.5 cursor-pointer hover:bg-[#2a2a2a] text-sm ${
                !value ? 'text-[#3b82f6]' : 'text-[#f0f0f0]'
              }`}
            >
              All {label}
            </div>

            {/* Divider */}
            <div className="border-t border-[#2a2a2a] my-1" />

            {/* Options */}
            {options.map((option) => {
              const colors = colorMap?.[option]
              const optLabel = colorMap?.[option]?.label || option

              return (
                <div
                  key={option}
                  onClick={() => { onChange(option); setIsOpen(false) }}
                  className={`px-3 py-1.5 cursor-pointer hover:bg-[#2a2a2a] flex items-center ${
                    value === option ? 'bg-[#2a2a2a]' : ''
                  }`}
                >
                  {colors ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {optLabel}
                    </span>
                  ) : (
                    <span className="text-sm text-[#f0f0f0]">{optLabel}</span>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CRMHeader({
  recordCount,
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  onAddClick,
  uniqueAssignees,
  selectedCount = 0,
}: CRMHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onSearchChange(query)
    }, 300)
  }, [onSearchChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    debouncedSearch(value)
  }

  const clearSearch = () => {
    setLocalSearch('')
    onSearchChange('')
  }

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Get filter options from column config
  const stageColumn = COLUMNS.find(c => c.id === 'stage')
  const leadSourceColumn = COLUMNS.find(c => c.id === 'lead_source')

  const hasActiveFilters = filters.stage || filters.assignee || filters.lead_source

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-10 bg-[#111111] border-b border-[#2a2a2a] px-4 py-3"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Title and count */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#f0f0f0]">CRM</h1>
          <span className="text-sm text-[#d0d0d0]">
            {selectedCount > 0 ? (
              <>{selectedCount} selected</>
            ) : (
              <>{recordCount} {recordCount === 1 ? 'record' : 'records'}</>
            )}
          </span>
        </div>

        {/* Right side: Search, filters, add */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search leads..."
              className="w-[220px] pl-9 pr-8 py-1.5 bg-[#1f1f1f] border border-[#2a2a2a] rounded text-sm text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#3b82f6]"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#f0f0f0]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <FilterDropdown
            label="Stage"
            value={filters.stage || null}
            options={stageColumn?.options || []}
            onChange={(value) => onFiltersChange({ ...filters, stage: value })}
            colorMap={STAGE_COLORS}
          />

          <FilterDropdown
            label="Assignee"
            value={filters.assignee || null}
            options={uniqueAssignees.length > 0 ? uniqueAssignees : ['Mo', 'Unassigned']}
            onChange={(value) => onFiltersChange({ ...filters, assignee: value })}
          />

          <FilterDropdown
            label="Source"
            value={filters.lead_source || null}
            options={leadSourceColumn?.options || []}
            onChange={(value) => onFiltersChange({ ...filters, lead_source: value })}
            colorMap={LEAD_SOURCE_COLORS}
          />

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => onFiltersChange({})}
              className="text-xs text-[#d0d0d0] hover:text-[#f0f0f0] underline"
            >
              Clear filters
            </button>
          )}

          {/* Add button */}
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-medium rounded transition-colors"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  )
}
