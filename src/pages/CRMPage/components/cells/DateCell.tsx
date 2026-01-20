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
        className="w-full outline-none border-0 [color-scheme:dark]"
        style={{
          height: layout.rowHeight,
          padding: '0 12px',
          backgroundColor: colors.bg.overlay,
          color: colors.text.primary,
          fontSize: typography.size.base,
          boxShadow: `inset 0 0 0 2px ${colors.accent.primary}`,
        }}
      />
    )
  }

  const displayValue = formatDate(value)
  const isEmpty = displayValue === '-'

  return (
    <div
      onMouseDown={handleClick}
      className="w-full flex items-center cursor-text transition-colors"
      style={{ 
        height: layout.rowHeight,
        padding: '0 12px',
        fontSize: typography.size.base,
        color: isEmpty ? colors.text.placeholder : colors.text.muted,
      }}
    >
      {isEmpty ? '—' : displayValue}
    </div>
  )
}
