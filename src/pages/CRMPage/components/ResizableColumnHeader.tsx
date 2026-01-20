import { useState, useCallback, useRef, useEffect, memo } from 'react'

interface ResizableColumnHeaderProps {
  label: string
  width: number
  minWidth?: number
  maxWidth?: number
  onResize: (newWidth: number) => void
  isCheckbox?: boolean
  children?: React.ReactNode
}

function ResizableColumnHeader({
  label,
  width,
  minWidth = 60,
  maxWidth = 500,
  onResize,
  isCheckbox = false,
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
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      
      // Use requestAnimationFrame for smooth updates
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

    // Add cursor style to body during resize
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
      <th className="w-10 px-3" style={{ width: 40, minWidth: 40, maxWidth: 40 }}>
        {children}
      </th>
    )
  }

  return (
    <th
      style={{ width, minWidth: width, maxWidth: width }}
      className="relative text-left px-3 py-2 text-[12px] font-medium text-[#f0f0f0] uppercase tracking-wider select-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => !isResizing && setIsHovering(false)}
    >
      <span className="truncate block pr-2">{label}</span>
      
      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-4 h-full cursor-col-resize flex items-center justify-end"
        onMouseDown={handleMouseDown}
        style={{ zIndex: 10 }}
      >
        {/* Visual indicator line */}
        <div 
          className={`w-[2px] h-full transition-colors ${
            isResizing ? 'bg-[#006B3F]' : isHovering ? 'bg-[#555555]' : 'bg-transparent'
          }`}
        />
      </div>
    </th>
  )
}

export default memo(ResizableColumnHeader)
