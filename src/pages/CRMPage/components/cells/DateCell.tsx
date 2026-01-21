import { useState, useRef, useEffect } from 'react'
import { formatDate, formatDateForInput, parseDateInput } from '../../utils/formatters'
import { colors, layout, typography } from '../../config/designTokens'

interface DateCellProps {
  value: string | null
  onChange: (value: string | null) => void
}

export default function DateCell({ value, onChange }: DateCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(formatDateForInput(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(formatDateForInput(value))
  }, [value])

  const handleSave = () => {
    const parsed = parseDateInput(editValue)
    if (parsed !== value) {
      onChange(parsed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(formatDateForInput(value))
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="date"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          height: layout.rowHeight,
          padding: `0 ${layout.cellPaddingX}px`,
          backgroundColor: colors.bg.overlay,
          color: colors.text.primary,
          fontSize: typography.size.sm,
          border: 'none',
          outline: 'none',
          boxShadow: `inset 0 0 0 2px ${colors.accent.primary}`,
          colorScheme: 'dark',
        }}
      />
    )
  }

  const displayValue = formatDate(value)
  const isEmpty = displayValue === '-'

  return (
    <div
      onMouseDown={handleClick}
      style={{ 
        width: '100%',
        height: layout.rowHeight,
        padding: `0 ${layout.cellPaddingX}px`,
        display: 'flex',
        alignItems: 'center',
        cursor: 'text',
        fontSize: typography.size.sm,
        color: isEmpty ? colors.text.placeholder : colors.text.muted,
      }}
    >
      {isEmpty ? '—' : displayValue}
    </div>
  )
}
