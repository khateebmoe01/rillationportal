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

// Filter Dropdown - renders menu in portal to prevent clipping
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

  // Recalculate position on scroll/resize when open
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 180),
      })
    }
  }, [])

  // Update position when opened and on scroll/resize
  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  // Close on click outside - use capture phase for reliability
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      
      // Check if click is on trigger
      if (triggerRef.current?.contains(target)) {
        return
      }
      
      // Check if click is on dropdown
      if (dropdownRef.current?.contains(target)) {
        return
      }
      
      setIsOpen(false)
    }

    // Small delay to prevent the opening click from immediately closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    if (!isOpen) return
    
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }

  const handleOptionClick = (optionValue: string | null) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(optionValue)
    setIsOpen(false)
  }

  const displayValue = value 
    ? (colorMap?.[value]?.label || value) 
    : `All ${label}`

  const isActive = value !== null

  // Render dropdown in portal
  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        minWidth: position.width,
        zIndex: 99999,
        pointerEvents: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{
          boxShadow: shadows.dropdown,
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div style={{ maxHeight: 280, overflowY: 'auto', padding: '6px 0' }}>
          {/* All option */}
          <div
            onClick={handleOptionClick(null)}
            style={{
              padding: '10px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: typography.size.base,
              color: !value ? '#3b82f6' : '#d4d4d4',
              backgroundColor: 'transparent',
              transition: 'background-color 0.1s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252525'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!value && <Check size={14} style={{ color: '#3b82f6' }} />}
            </span>
            All {label}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #2a2a2a', margin: '4px 0' }} />

          {/* Options */}
          {options.map((option) => {
            const optColors = colorMap?.[option]
            const optLabel = colorMap?.[option]?.label || option
            const isSelected = value === option

            return (
              <div
                key={option}
                onClick={handleOptionClick(option)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: isSelected ? '#1f1f1f' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252525'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#1f1f1f' : 'transparent'}
              >
                <span style={{ width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isSelected && <Check size={14} style={{ color: '#3b82f6' }} />}
                </span>
                {optColors ? (
                  <span
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: 9999,
                      fontWeight: 500,
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
        </div>
      </motion.div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 8,
          border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.5)' : '#2a2a2a'}`,
          backgroundColor: isActive ? '#1a2a3a' : '#1a1a1a',
          color: isActive ? '#f5f5f5' : '#d4d4d4',
          fontSize: typography.size.base,
          minHeight: 36,
          cursor: 'pointer',
          transition: 'all 0.15s',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.borderColor = '#3a3a3a'
            e.currentTarget.style.backgroundColor = '#1f1f1f'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.borderColor = '#2a2a2a'
            e.currentTarget.style.backgroundColor = '#1a1a1a'
          }
        }}
      >
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayValue}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            color: '#737373',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {/* Portal for dropdown */}
      <AnimatePresence>
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </AnimatePresence>
    </>
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
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: colors.bg.elevated,
        borderBottom: `1px solid ${colors.border.default}`,
        height: layout.toolbarHeight,
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          height: '100%',
          padding: `0 ${layout.toolbarHeight / 2}px`,
        }}
      >
        {/* Left side: Title and count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 
            style={{ 
              fontSize: typography.size.xl,
              fontWeight: 600,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            CRM
          </h1>
          <span 
            style={{ 
              padding: '4px 10px',
              borderRadius: 6,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.text.placeholder,
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search leads..."
              style={{
                width: 260,
                paddingLeft: 42,
                paddingRight: 36,
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: colors.bg.surface,
                border: `1px solid ${colors.border.default}`,
                borderRadius: 8,
                fontSize: typography.size.base,
                color: colors.text.primary,
                outline: 'none',
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
                type="button"
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: 4,
                  borderRadius: 4,
                  border: 'none',
                  background: 'transparent',
                  color: colors.text.muted,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => onFiltersChange({})}
                style={{
                  padding: '4px 8px',
                  fontSize: typography.size.sm,
                  color: '#a3a3a3',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
              >
                Clear
              </motion.button>
            )}
          </AnimatePresence>

          {/* Add button */}
          <button
            type="button"
            onClick={onAddClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: colors.accent.primary,
              color: '#ffffff',
              fontSize: typography.size.base,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent.primary}
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Lead
          </button>
        </div>
      </div>
    </div>
  )
}
