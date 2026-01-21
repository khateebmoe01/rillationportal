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
      const dropdownHeight = Math.min(options.length * 40 + 16, 280)
      
      const spaceBelow = viewportHeight - rect.bottom
      const shouldOpenUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight
      
      setDropdownPosition({
        top: shouldOpenUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 160),
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
    <div
      ref={dropdownRef}
      id={dropdownId}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        minWidth: dropdownPosition.width,
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
          borderRadius: radius.lg,
          maxHeight: 280,
          overflowY: 'auto',
          padding: '4px 0',
        }}
      >
        {options.map((option) => {
          const optColors = getColors(option)
          const optLabel = colorMap?.[option]?.label || option
          const isSelected = value === option
          
          return (
            <div
              key={option}
              onMouseDown={(e) => handleSelect(e, option)}
              style={{ 
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: isSelected ? colors.bg.surface : 'transparent',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252525'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? colors.bg.surface : 'transparent'}
            >
              <span style={{ width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSelected && <Check size={12} style={{ color: colors.accent.primary }} />}
              </span>
              
              {optColors ? (
                <span
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 8px',
                    borderRadius: radius.full,
                    fontWeight: 500,
                    backgroundColor: optColors.bg, 
                    color: optColors.text,
                    fontSize: typography.size.xs,
                  }}
                >
                  {optLabel}
                </span>
              ) : (
                <span style={{ fontSize: typography.size.sm, color: colors.text.primary }}>
                  {optLabel}
                </span>
              )}
            </div>
          )
        })}
      </motion.div>
    </div>
  ) : null

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div
        onMouseDown={handleClick}
        style={{ 
          width: '100%',
          height: layout.rowHeight,
          padding: `0 ${layout.cellPaddingX}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {value && cellColors ? (
            <span
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 8px',
                borderRadius: radius.full,
                fontWeight: 500,
                backgroundColor: cellColors.bg, 
                color: cellColors.text,
                fontSize: typography.size.xs,
              }}
            >
              {displayValue}
            </span>
          ) : value ? (
            <span style={{ fontSize: typography.size.sm, color: colors.text.primary }}>
              {displayValue}
            </span>
          ) : (
            <span style={{ color: colors.text.placeholder, fontSize: typography.size.sm }}>—</span>
          )}
        </div>
        
        <ChevronDown 
          size={12} 
          style={{ 
            color: colors.text.disabled,
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
          className="group-hover:opacity-100"
        />
      </div>

      <AnimatePresence>
        {dropdown && createPortal(dropdown, document.body)}
      </AnimatePresence>
    </div>
  )
}
