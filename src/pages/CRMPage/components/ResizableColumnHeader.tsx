import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { colors, layout, typography, shadows } from '../config/designTokens'

interface ResizableColumnHeaderProps {
  label: string
  width: number
  minWidth?: number
  maxWidth?: number
  onResize: (newWidth: number) => void
  isCheckbox?: boolean
  isSticky?: boolean
  stickyLeft?: number
  children?: React.ReactNode
}

function ResizableColumnHeader({
  label,
  width,
  minWidth = layout.minColumnWidth,
  maxWidth = layout.maxColumnWidth,
  onResize,
  isCheckbox = false,
  isSticky = false,
  stickyLeft = 0,
  children,
}: ResizableColumnHeaderProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = width
    },
    [width]
  )

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      
      rafRef.current = requestAnimationFrame(() => {
        const diff = e.clientX - startXRef.current
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + diff))
        onResize(newWidth)
      })
    }

    const handleMouseUp = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isResizing, minWidth, maxWidth, onResize])

  if (isCheckbox) {
    return (
      <th 
        style={{ 
          position: 'sticky',
          left: 0,
          zIndex: 30,
          width: layout.checkboxColumnWidth,
          minWidth: layout.checkboxColumnWidth,
          maxWidth: layout.checkboxColumnWidth,
          backgroundColor: colors.bg.elevated,
          borderBottom: `1px solid ${colors.border.default}`,
        }}
      >
        {children}
      </th>
    )
  }

  return (
    <th
      style={{ 
        width, 
        minWidth: width, 
        maxWidth: width,
        position: isSticky ? 'sticky' : 'relative',
        left: isSticky ? stickyLeft : undefined,
        zIndex: isSticky ? 30 : undefined,
        backgroundColor: colors.bg.elevated,
        borderBottom: `1px solid ${colors.border.default}`,
        borderRight: isSticky ? `1px solid ${colors.border.subtle}` : undefined,
        boxShadow: isSticky ? shadows.sticky : undefined,
        textAlign: 'left',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => !isResizing && setIsHovering(false)}
    >
      <div 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          height: layout.headerHeight,
          padding: `0 ${layout.cellPaddingX}px`,
          paddingRight: 20, // Extra space for resize handle
        }}
      >
        <span 
          style={{ 
            fontSize: typography.size.xs,
            fontWeight: typography.weight.medium,
            color: colors.text.muted,
            textTransform: 'uppercase',
            letterSpacing: typography.tracking.wider,
          }}
        >
          {label}
        </span>
      </div>
      
      {/* Resize handle */}
      <div
        style={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          width: 12,
          height: '100%',
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          zIndex: 10,
        }}
        onMouseDown={handleMouseDown}
      >
        <div 
          style={{
            width: 2,
            height: 16,
            borderRadius: 1,
            backgroundColor: isResizing 
              ? colors.accent.primary 
              : isHovering 
                ? colors.border.strong 
                : 'transparent',
            transition: 'background-color 0.15s',
          }}
        />
      </div>
    </th>
  )
}

export default memo(ResizableColumnHeader)
