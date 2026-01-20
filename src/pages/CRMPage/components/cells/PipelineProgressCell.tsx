import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Check, Calendar } from 'lucide-react'
import { colors, layout, typography, shadows, radius } from '../../config/designTokens'
import type { Lead } from '../../types'

// Pipeline stages with their field mappings
const PIPELINE_STAGES = [
  { key: 'meeting_booked', dateKey: 'meeting_booked_at', label: 'Meeting Booked' },
  { key: 'showed_up_to_disco', dateKey: 'showed_up_to_disco_at', label: 'Disco Show' },
  { key: 'qualified', dateKey: 'qualified_at', label: 'Qualified' },
  { key: 'demo_booked', dateKey: 'demo_booked_at', label: 'Demo Booked' },
  { key: 'showed_up_to_demo', dateKey: 'showed_up_to_demo_at', label: 'Demo Show' },
  { key: 'proposal_sent', dateKey: 'proposal_sent_at', label: 'Proposal Sent' },
  { key: 'closed', dateKey: 'closed_at', label: 'Closed' },
] as const

interface PipelineProgressCellProps {
  lead: Lead
  onUpdate: (field: keyof Lead, value: unknown) => void
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function PipelineProgressCell({ lead, onUpdate }: PipelineProgressCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const dropdownId = useId()

  // Count completed stages
  const completedCount = PIPELINE_STAGES.filter(
    stage => lead[stage.key as keyof Lead] === true
  ).length

  const progressPercentage = (completedCount / PIPELINE_STAGES.length) * 100

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const dropdownHeight = PIPELINE_STAGES.length * 56 + 60
      
      const spaceBelow = viewportHeight - rect.bottom
      const shouldOpenUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight
      
      setDropdownPosition({
        top: shouldOpenUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
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

  const handleToggleStage = (e: React.MouseEvent, stageKey: string, dateKey: string, currentValue: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    const newValue = !currentValue
    
    // Update the boolean field
    onUpdate(stageKey as keyof Lead, newValue)
    
    // Update the date field
    if (newValue) {
      onUpdate(dateKey as keyof Lead, new Date().toISOString())
    } else {
      onUpdate(dateKey as keyof Lead, null)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

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
        zIndex: 9999,
        boxShadow: shadows.dropdown,
        borderRadius: radius.xl,
        minWidth: 260,
      }}
      className="bg-[#1a1a1a] border border-[#2a2a2a]"
    >
      {/* Header */}
      <div 
        className="px-4 py-3 border-b"
        style={{ 
          borderColor: colors.border.default,
        }}
      >
        <div 
          className="uppercase tracking-wider"
          style={{ 
            fontSize: typography.size.xs,
            fontWeight: typography.weight.semibold,
            color: colors.text.muted,
            letterSpacing: typography.tracking.wider,
          }}
        >
          Pipeline Progress
        </div>
        <div 
          className="mt-1"
          style={{ 
            fontSize: typography.size.sm,
            color: colors.text.secondary,
          }}
        >
          {completedCount} of {PIPELINE_STAGES.length} stages completed
        </div>
      </div>
      
      {/* Stages list */}
      <div className="py-2">
        {PIPELINE_STAGES.map((stage, index) => {
          const isCompleted = lead[stage.key as keyof Lead] === true
          const dateValue = lead[stage.dateKey as keyof Lead] as string | null | undefined
          const formattedDate = formatDate(dateValue)

          return (
            <div
              key={stage.key}
              onMouseDown={(e) => handleToggleStage(e, stage.key, stage.dateKey, isCompleted)}
              className="px-4 py-3 cursor-pointer hover:bg-[#252525] flex items-center gap-4 transition-colors"
            >
              {/* Step number or check */}
              <div
                className="flex items-center justify-center transition-all"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radius.md,
                  backgroundColor: isCompleted ? colors.pipeline.fill : colors.bg.surface,
                  border: isCompleted ? 'none' : `1px solid ${colors.border.strong}`,
                }}
              >
                {isCompleted ? (
                  <Check size={14} className="text-white" strokeWidth={2.5} />
                ) : (
                  <span 
                    style={{ 
                      fontSize: typography.size.xs,
                      color: colors.text.disabled,
                      fontWeight: typography.weight.medium,
                    }}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* Label and date */}
              <div className="flex-1">
                <div 
                  style={{ 
                    fontSize: typography.size.base,
                    color: isCompleted ? colors.text.primary : colors.text.muted,
                    fontWeight: isCompleted ? typography.weight.medium : typography.weight.normal,
                  }}
                >
                  {stage.label}
                </div>
                {isCompleted && formattedDate && (
                  <div 
                    className="flex items-center gap-1.5 mt-0.5"
                    style={{ 
                      fontSize: typography.size.xs,
                      color: colors.text.disabled,
                    }}
                  >
                    <Calendar size={11} />
                    {formattedDate}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  ) : null

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Display trigger */}
      <div
        onMouseDown={handleClick}
        className="w-full flex items-center gap-3 cursor-pointer group transition-colors"
        style={{ 
          height: layout.rowHeight,
          padding: '0 12px',
        }}
      >
        {/* Progress bar */}
        <div 
          className="flex-1 relative overflow-hidden"
          style={{ 
            height: 6,
            borderRadius: radius.full,
            backgroundColor: colors.pipeline.track,
          }}
        >
          <motion.div 
            className="absolute inset-y-0 left-0"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ 
              borderRadius: radius.full,
              background: progressPercentage > 0 
                ? `linear-gradient(90deg, ${colors.pipeline.fill} 0%, ${colors.pipeline.fillSecondary} 100%)`
                : 'transparent',
            }}
          />
        </div>
        
        {/* Fraction text */}
        <span 
          style={{ 
            fontSize: typography.size.sm,
            color: colors.text.muted,
            fontVariantNumeric: 'tabular-nums',
            minWidth: 28,
            textAlign: 'right',
          }}
        >
          {completedCount}/{PIPELINE_STAGES.length}
        </span>
      </div>

      {/* Dropdown via portal */}
      <AnimatePresence>
        {dropdown && createPortal(dropdown, document.body)}
      </AnimatePresence>
    </div>
  )
}
