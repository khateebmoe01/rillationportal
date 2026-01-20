import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Check, Calendar } from 'lucide-react'
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

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom,
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
      // Set to current date when checking
      onUpdate(dateKey as keyof Lead, new Date().toISOString())
    } else {
      // Clear date when unchecking
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
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        zIndex: 9999,
      }}
      className="min-w-[220px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl py-2"
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider border-b border-[#2a2a2a] mb-1">
        Pipeline Progress
      </div>
      
      {PIPELINE_STAGES.map((stage) => {
        const isCompleted = lead[stage.key as keyof Lead] === true
        const dateValue = lead[stage.dateKey as keyof Lead] as string | null | undefined
        const formattedDate = formatDate(dateValue)

        return (
          <div
            key={stage.key}
            onMouseDown={(e) => handleToggleStage(e, stage.key, stage.dateKey, isCompleted)}
            className="px-3 py-2 cursor-pointer hover:bg-[#252525] flex items-center gap-3 group"
          >
            {/* Checkbox */}
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                isCompleted
                  ? 'bg-[#00C853] border-[#00C853]'
                  : 'border-[#3a3a3a] bg-[#1f1f1f] group-hover:border-[#555555]'
              }`}
            >
              {isCompleted && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
            
            {/* Label and date */}
            <div className="flex-1">
              <div className={`text-[13px] ${isCompleted ? 'text-[#f0f0f0]' : 'text-[#888888]'}`}>
                {stage.label}
              </div>
              {isCompleted && formattedDate && (
                <div className="flex items-center gap-1 text-[10px] text-[#666666] mt-0.5">
                  <Calendar size={10} />
                  {formattedDate}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </motion.div>
  ) : null

  return (
    <div ref={containerRef} className="relative w-full h-8">
      {/* Display trigger */}
      <div
        onMouseDown={handleClick}
        className="w-full h-8 px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-[#1a1a1a]"
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {PIPELINE_STAGES.map((stage) => {
              const isCompleted = lead[stage.key as keyof Lead] === true
              return (
                <div
                  key={stage.key}
                  className={`w-1.5 h-1.5 rounded-sm transition-colors ${
                    isCompleted ? 'bg-[#00C853]' : 'bg-[#2a2a2a]'
                  }`}
                  title={`${stage.label}${isCompleted ? ' (completed)' : ''}`}
                />
              )
            })}
          </div>
          <span className="text-[10px] text-[#888888]">
            {completedCount}/{PIPELINE_STAGES.length}
          </span>
        </div>
      </div>

      {/* Dropdown via portal */}
      <AnimatePresence>
        {dropdown && createPortal(dropdown, document.body)}
      </AnimatePresence>
    </div>
  )
}
