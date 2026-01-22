import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Check, Calendar } from 'lucide-react'
import { useDropdown } from '../../../../contexts/DropdownContext'
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
    const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const timeFormatted = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${dateFormatted} at ${timeFormatted}`
  } catch {
    return ''
  }
}

export default function PipelineProgressCell({ lead, onUpdate }: PipelineProgressCellProps) {
  const dropdownId = useId()
  const { isOpen, toggle, close } = useDropdown(dropdownId)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

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
      const dropdownHeight = PIPELINE_STAGES.length * 48 + 60
      
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
      close()
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
  }, [isOpen, close])

  // Close on escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, close])

  const handleToggleStage = (e: React.MouseEvent, stageKey: string, dateKey: string, currentValue: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    const newValue = !currentValue
    
    onUpdate(stageKey as keyof Lead, newValue)
    
    if (newValue) {
      onUpdate(dateKey as keyof Lead, new Date().toISOString())
    } else {
      onUpdate(dateKey as keyof Lead, null)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle()
  }

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      id={dropdownId}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        zIndex: 99999,
        pointerEvents: 'auto',
        minWidth: 240,
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
          borderRadius: radius.xl,
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            padding: '12px 14px',
            borderBottom: `1px solid ${colors.border.default}`,
          }}
        >
          <div 
            style={{ 
              fontSize: typography.size.xs,
              fontWeight: typography.weight.semibold,
              color: colors.text.muted,
              textTransform: 'uppercase',
              letterSpacing: typography.tracking.wider,
            }}
          >
            Pipeline Progress
          </div>
          <div 
            style={{ 
              marginTop: 4,
              fontSize: typography.size.sm,
              color: colors.text.secondary,
            }}
          >
            {completedCount} of {PIPELINE_STAGES.length} stages
          </div>
        </div>
        
        {/* Stages list */}
        <div style={{ padding: '6px 0' }}>
          {PIPELINE_STAGES.map((stage, index) => {
            const isCompleted = lead[stage.key as keyof Lead] === true
            const dateValue = lead[stage.dateKey as keyof Lead] as string | null | undefined
            const formattedDate = formatDate(dateValue)

            return (
              <div
                key={stage.key}
                onMouseDown={(e) => handleToggleStage(e, stage.key, stage.dateKey, isCompleted)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252525'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Step number or check */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: radius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted ? colors.pipeline.fill : colors.bg.surface,
                    border: isCompleted ? 'none' : `1px solid ${colors.border.strong}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {isCompleted ? (
                    <Check size={12} style={{ color: '#fff' }} strokeWidth={2.5} />
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
                <div style={{ flex: 1 }}>
                  <div 
                    style={{ 
                      fontSize: typography.size.sm,
                      color: isCompleted ? colors.text.primary : colors.text.muted,
                      fontWeight: isCompleted ? typography.weight.medium : typography.weight.normal,
                    }}
                  >
                    {stage.label}
                  </div>
                  {isCompleted && formattedDate && (
                    <div 
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 2,
                        fontSize: typography.size.xs,
                        color: colors.text.disabled,
                      }}
                    >
                      <Calendar size={10} />
                      {formattedDate}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
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
          gap: 10,
          cursor: 'pointer',
        }}
      >
        {/* Progress bar */}
        <div 
          style={{ 
            flex: 1,
            height: 5,
            borderRadius: radius.full,
            backgroundColor: colors.pipeline.track,
            overflow: 'hidden',
          }}
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ 
              height: '100%',
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
            fontSize: typography.size.xs,
            color: colors.text.muted,
            fontVariantNumeric: 'tabular-nums',
            minWidth: 24,
            textAlign: 'right',
          }}
        >
          {completedCount}/{PIPELINE_STAGES.length}
        </span>
      </div>

      <AnimatePresence>
        {dropdown && createPortal(dropdown, document.body)}
      </AnimatePresence>
    </div>
  )
}
