import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

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
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: Math.max(rect.width, 160),
      })
    }
  }, [isOpen])

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
      // Use setTimeout to avoid the click that opened the dropdown from closing it
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

  const colors = getColors(value)
  const displayValue = colorMap?.[value || '']?.label || value

  const dropdown = isOpen ? (
    <motion.div
      ref={dropdownRef}
      id={dropdownId}
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        minWidth: dropdownPosition.width,
        zIndex: 9999,
      }}
      className="bg-[#1f1f1f] border border-[#2a2a2a] rounded shadow-lg py-1 max-h-[200px] overflow-y-auto"
    >
      {options.map((option) => {
        const optColors = getColors(option)
        const optLabel = colorMap?.[option]?.label || option
        
        return (
          <div
            key={option}
            onMouseDown={(e) => handleSelect(e, option)}
            className="px-3 py-1.5 cursor-pointer hover:bg-[#2a2a2a] flex items-center"
          >
            {optColors ? (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: optColors.bg, color: optColors.text }}
              >
                {optLabel}
              </span>
            ) : (
              <span className="text-[13px] text-[#f0f0f0]">{optLabel}</span>
            )}
          </div>
        )
      })}
    </motion.div>
  ) : null

  return (
    <div ref={containerRef} className="relative w-full h-11">
      <div
        onMouseDown={handleClick}
        className="w-full h-11 px-3 py-2 flex items-center cursor-pointer hover:bg-[#1a1a1a]"
      >
        {value && colors ? (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {displayValue}
          </span>
        ) : value ? (
          <span className="text-[13px] text-[#f0f0f0]">{displayValue}</span>
        ) : (
          <span className="text-[#888888] text-[13px]">-</span>
        )}
      </div>

      <AnimatePresence>
        {dropdown && createPortal(dropdown, document.body)}
      </AnimatePresence>
    </div>
  )
}
