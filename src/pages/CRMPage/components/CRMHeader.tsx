import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Search, Plus, ChevronDown, X, Check } from 'lucide-react'
import { COLUMNS, STAGE_COLORS, LEAD_SOURCE_COLORS } from '../config/columns'
import { colors, layout, typography, shadows } from '../config/designTokens'
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

// Filter Dropdown rendered in portal to prevent clipping
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  // Update position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 180),
      })
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setIsOpen(false)
    }
    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const displayValue = value 
    ? (colorMap?.[value]?.label || value) 
    : `All ${label}`

  const isActive = value !== null

  const dropdown = isOpen ? createPortal(
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        minWidth: position.width,
        zIndex: 9999,
        boxShadow: shadows.dropdown,
      }}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-1.5 max-h-[280px] overflow-y-auto"
    >
      {/* All option */}
      <div
        onClick={() => { onChange(null); setIsOpen(false) }}
        className={`px-3 py-2 cursor-pointer hover:bg-[#252525] flex items-center gap-2 transition-colors ${
          !value ? 'text-[#3b82f6]' : 'text-[#d4d4d4]'
        }`}
        style={{ fontSize: typography.size.base }}
      >
        {!value && <Check size={14} className="text-[#3b82f6]" />}
        {value && <span className="w-[14px]" />}
        All {label}
      </div>

      {/* Divider */}
      <div className="border-t border-[#2a2a2a] my-1" />

      {/* Options */}
      {options.map((option) => {
        const optColors = colorMap?.[option]
        const optLabel = colorMap?.[option]?.label || option
        const isSelected = value === option

        return (
          <div
            key={option}
            onClick={() => { onChange(option); setIsOpen(false) }}
            className={`px-3 py-2 cursor-pointer hover:bg-[#252525] flex items-center gap-2 transition-colors ${
              isSelected ? 'bg-[#1f1f1f]' : ''
            }`}
          >
            {isSelected && <Check size={14} className="text-[#3b82f6]" />}
            {!isSelected && <span className="w-[14px]" />}
            {optColors ? (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full font-medium"
                style={{ 
                  backgroundColor: optColors.bg, 
                  color: optColors.text,
                  fontSize: typography.size.xs,
                }}
              >
                {optLabel}
              </span>
            ) : (
              <span style={{ fontSize: typography.size.base, color: colors.text.primary }}>
                {optLabel}
              </span>
            )}
          </div>
        )
      })}
    </motion.div>,
    document.body
  ) : null

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-all
          ${isActive
            ? 'bg-[#1a2a3a] border-[#3b82f6]/50 text-[#f5f5f5]'
            : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#d4d4d4] hover:border-[#3a3a3a] hover:bg-[#1f1f1f]'
          }
        `}
        style={{ 
          fontSize: typography.size.base,
          minHeight: 40,
        }}
      >
        <span className="truncate max-w-[120px]">{displayValue}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform text-[#737373] ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>{dropdown}</AnimatePresence>
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
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="sticky top-0 z-30 border-b"
      style={{
        backgroundColor: colors.bg.elevated,
        borderColor: colors.border.default,
        height: layout.toolbarHeight,
      }}
    >
      <div 
        className="flex items-center justify-between gap-6 h-full"
        style={{ padding: `0 ${layout.toolbarHeight / 2}px` }}
      >
        {/* Left side: Title and count */}
        <div className="flex items-center gap-4">
          <h1 
            className="font-semibold"
            style={{ 
              fontSize: typography.size.xl,
              color: colors.text.primary,
            }}
          >
            CRM
          </h1>
          <span 
            className="px-2.5 py-1 rounded-md"
            style={{ 
              fontSize: typography.size.sm,
              color: selectedCount > 0 ? colors.accent.secondary : colors.text.muted,
              backgroundColor: selectedCount > 0 ? 'rgba(59, 130, 246, 0.15)' : colors.bg.surface,
            }}
          >
            {selectedCount > 0 ? (
              <>{selectedCount} selected</>
            ) : (
              <>{recordCount.toLocaleString()} {recordCount === 1 ? 'record' : 'records'}</>
            )}
          </span>
        </div>

        {/* Right side: Search, filters, add */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: colors.text.placeholder }}
            />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search leads..."
              className="rounded-lg border transition-all focus:outline-none"
              style={{
                width: 260,
                paddingLeft: 42,
                paddingRight: 36,
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: colors.bg.surface,
                borderColor: colors.border.default,
                fontSize: typography.size.base,
                color: colors.text.primary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.border.focus
                e.currentTarget.style.backgroundColor = colors.bg.overlay
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.default
                e.currentTarget.style.backgroundColor = colors.bg.surface
              }}
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#2a2a2a] transition-colors"
                style={{ color: colors.text.muted }}
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
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => onFiltersChange({})}
                className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors px-2 py-1"
                style={{ fontSize: typography.size.sm }}
              >
                Clear
              </motion.button>
            )}
          </AnimatePresence>

          {/* Add button */}
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 font-medium rounded-lg transition-all hover:shadow-lg"
            style={{
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: colors.accent.primary,
              color: '#ffffff',
              fontSize: typography.size.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.accent.primaryHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.accent.primary
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Lead
          </button>
        </div>
      </div>
    </motion.div>
  )
}
