import { ReactNode, useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Position {
  top: number
  left: number
  transformOrigin: string
}

interface DropdownPortalProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
  children: ReactNode
  /** Preferred placement */
  placement?: 'bottom-start' | 'bottom-end' | 'bottom-center' | 'top-start' | 'top-end' | 'top-center'
  /** Minimum width - 'trigger' matches trigger width, or specify pixels */
  minWidth?: 'trigger' | number
  /** Fixed width */
  width?: number
  /** Offset from trigger in pixels */
  offset?: number
  /** Additional class names for the dropdown container */
  className?: string
}

/**
 * Portal-based dropdown component with automatic flip logic.
 * Renders dropdown to document.body to avoid overflow clipping.
 */
export default function DropdownPortal({
  isOpen,
  onClose,
  triggerRef,
  children,
  placement = 'bottom-start',
  minWidth = 'trigger',
  width,
  offset = 8,
  className = '',
}: DropdownPortalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, transformOrigin: 'top left' })

  // Calculate position with flip logic
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !dropdownRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const dropdownRect = dropdownRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Determine if we need to flip vertically
    const spaceBelow = viewportHeight - triggerRect.bottom - offset
    const spaceAbove = triggerRect.top - offset
    const dropdownHeight = dropdownRect.height || 300 // Estimate if not yet rendered

    let shouldFlipVertical = false
    if (placement.startsWith('bottom') && spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      shouldFlipVertical = true
    } else if (placement.startsWith('top') && spaceAbove < dropdownHeight && spaceBelow > spaceAbove) {
      shouldFlipVertical = true
    }

    // Calculate vertical position
    let top: number
    let transformOriginY: string
    
      if (placement.startsWith('bottom')) {
      if (shouldFlipVertical) {
        top = triggerRect.top - dropdownHeight - offset
        transformOriginY = 'bottom'
      } else {
        top = triggerRect.bottom + offset
        transformOriginY = 'top'
      }
    } else {
      if (shouldFlipVertical) {
        top = triggerRect.bottom + offset
        transformOriginY = 'top'
      } else {
        top = triggerRect.top - dropdownHeight - offset
        transformOriginY = 'bottom'
      }
    }

    // Calculate horizontal position
    let left: number
    let transformOriginX: string
    const dropdownWidth = width || dropdownRect.width || triggerRect.width

    if (placement.endsWith('start')) {
      left = triggerRect.left
      transformOriginX = 'left'
      // Clamp to viewport
      if (left + dropdownWidth > viewportWidth - 16) {
        left = viewportWidth - dropdownWidth - 16
      }
    } else if (placement.endsWith('end')) {
      left = triggerRect.right - dropdownWidth
      transformOriginX = 'right'
      // Clamp to viewport
      if (left < 16) {
        left = 16
      }
    } else {
      // center
      left = triggerRect.left + (triggerRect.width - dropdownWidth) / 2
      transformOriginX = 'center'
      // Clamp to viewport
      if (left + dropdownWidth > viewportWidth - 16) {
        left = viewportWidth - dropdownWidth - 16
      }
      if (left < 16) {
        left = 16
      }
    }

    // Ensure top is not negative
    if (top < 16) {
      top = 16
    }

    setPosition({
      top,
      left,
      transformOrigin: `${transformOriginY} ${transformOriginX}`,
    })
  }, [triggerRef, placement, width, offset])

  // Recalculate position when open or on resize/scroll
  useEffect(() => {
    if (!isOpen) return

    calculatePosition()

    const handleUpdate = () => {
      requestAnimationFrame(calculatePosition)
    }

    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)

    return () => {
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
    }
  }, [isOpen, calculatePosition])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose()
      }
    }

    // Delay to prevent immediate close on the same click that opens
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, triggerRef])

  // Close on escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Calculate width style
  const getWidthStyle = (): React.CSSProperties => {
    if (width) {
      return { width: `${width}px` }
    }
    if (minWidth === 'trigger' && triggerRef.current) {
      return { minWidth: `${triggerRef.current.offsetWidth}px` }
    }
    if (typeof minWidth === 'number') {
      return { minWidth: `${minWidth}px` }
    }
    return {}
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop to catch clicks */}
          <div className="fixed inset-0 z-dropdown" onClick={onClose} />
          
          {/* Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`fixed z-dropdown ${className}`}
            style={{
              top: position.top,
              left: position.left,
              transformOrigin: position.transformOrigin,
              ...getWidthStyle(),
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

/**
 * Hook to manage dropdown state and trigger ref
 */
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    triggerRef,
  }
}
