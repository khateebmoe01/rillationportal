import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { colors, layout, typography, shadows, radius } from '../../config/designTokens'

interface SelectCellProps {
  value: string | null
  options: string[]
  onChange: (value: string) => void
  colorMap?: Record<string, { bg: string; text: string; label?: string }>
}

export default function SelectCell({ value, options, onChange, colorMap }: SelectCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownId = useId()

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const dropdownHeight = Math.min(options.length * 44 + 16, 300)
      
      // Check if dropdown would go below viewport
      const spaceBelow = viewportHeight - rect.bottom
      const shouldOpenUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight
      
      setDropdownPosition({
        top: shouldOpenUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 180),
      })
    }
  }, [isOpen, options.length])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (containerRef.current && containerRef.current.contains(target)) {
        return
      }
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return
      }
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
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (e: React.MouseEvent, option: string) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(option)
    setIsOpen(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const getColors = (val: string | null) => {
    if (!val || !colorMap) return null
    return colorMap[val]
  }

  const cellColors = getColors(value)
  const displayValue = colorMap?.[value || '']?.label || value

  const dropdown = isOpen ? (
    <motion.div
      ref={dropdownRef}
      id={dropdownId}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        minWidth: dropdownPosition.width,
        zIndex: 9999,
        boxShadow: shadows.dropdown,
        borderRadius: radius.lg,
      }}
      className="bg-[#1a1a1a] border border-[#2a2a2a] py-1.5 max-h-[300px] overflow-y-auto"
    >
      {options.map((option) => {
        const optColors = getColors(option)
        const optLabel = colorMap?.[option]?.label || option
        const isSelected = value === option
        
        return (
          <div
            key={option}
            onMouseDown={(e) => handleSelect(e, option)}
            className="flex items-center gap-3 cursor-pointer hover:bg-[#252525] transition-colors"
            style={{ 
              padding: '10px 14px',
              backgroundColor: isSelected ? colors.bg.surface : 'transparent',
            }}
          >
            {/* Check icon */}
            <div style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isSelected && <Check size={14} style={{ color: colors.accent.primary }} />}
            </div>
            
            {optColors ? (
              <span
                className="inline-flex items-center font-medium"
                style={{ 
                  backgroundColor: optColors.bg, 
                  color: optColors.text,
                  fontSize: typography.size.sm,
                  padding: '5px 10px',
                  borderRadius: radius.full,
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
    </motion.div>
  ) : null

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onMouseDown={handleClick}
        className="w-full flex items-center justify-between cursor-pointer group transition-colors"
        style={{ 
          height: layout.rowHeight,
          padding: '0 12px',
        }}
      >
        <div className="flex items-center gap-2">
          {value && cellColors ? (
            <span
              className="inline-flex items-center font-medium"
              style={{ 
                backgroundColor: cellColors.bg, 
                color: cellColors.text,
                fontSize: typography.size.sm,
                padding: '5px 10px',
                borderRadius: radius.full,
              }}
            >
              {displayValue}
            </span>
          ) : value ? (
            <span style={{ fontSize: typography.size.base, color: colors.text.primary }}>
              {displayValue}
            </span>
          ) : (
            <span style={{ color: colors.text.placeholder, fontSize: typography.size.base }}>—</span>
          )}
        </div>
        
        <ChevronDown 
          size={14} 
          className="opacity-0 group-hover:opacity-50 transition-opacity"
          style={{ color: colors.text.muted }}
        />
      </div>

      <AnimatePresence>
        {dropdown && createPortal(dropdown, document.body)}
      </AnimatePresence>
    </div>
  )
}
