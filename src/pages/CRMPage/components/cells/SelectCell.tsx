import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SelectCellProps {
  value: string | null
  options: string[]
  onChange: (value: string) => void
  colorMap?: Record<string, { bg: string; text: string; label?: string }>
}

export default function SelectCell({ value, options, onChange, colorMap }: SelectCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
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

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
  }

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  const getColors = (val: string | null) => {
    if (!val || !colorMap) return null
    return colorMap[val]
  }

  const colors = getColors(value)
  const displayValue = colorMap?.[value || '']?.label || value

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div
        onClick={handleClick}
        className="w-full h-full px-3 py-2 flex items-center cursor-pointer hover:bg-[#1a1a1a]"
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
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 top-full mt-1 min-w-[140px] bg-[#1f1f1f] border border-[#2a2a2a] rounded shadow-lg py-1 max-h-[200px] overflow-y-auto"
          >
            {options.map((option) => {
              const optColors = getColors(option)
              const optLabel = colorMap?.[option]?.label || option
              
              return (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
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
        )}
      </AnimatePresence>
    </div>
  )
}
