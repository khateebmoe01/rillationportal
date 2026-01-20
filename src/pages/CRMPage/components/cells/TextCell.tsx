import { useState, useRef, useEffect } from 'react'
import { colors, layout, typography } from '../../config/designTokens'

interface TextCellProps {
  value: string | null
  onChange: (value: string) => void
  isPrimary?: boolean
}

export default function TextCell({ value, onChange, isPrimary = false }: TextCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(value || '')
  }, [value])

  const handleSave = () => {
    if (editValue !== (value || '')) {
      onChange(editValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value || '')
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
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full outline-none border-0"
        style={{
          height: layout.rowHeight,
          padding: '0 12px',
          backgroundColor: colors.bg.overlay,
          color: colors.text.primary,
          fontSize: isPrimary ? typography.size.md : typography.size.base,
          fontWeight: isPrimary ? typography.weight.medium : typography.weight.normal,
          boxShadow: `inset 0 0 0 2px ${colors.accent.primary}`,
        }}
      />
    )
  }

  return (
    <div
      onMouseDown={handleClick}
      className="w-full flex items-center cursor-text truncate transition-colors"
      style={{ 
        height: layout.rowHeight,
        padding: '0 12px',
        fontSize: isPrimary ? typography.size.md : typography.size.base,
        fontWeight: isPrimary ? typography.weight.medium : typography.weight.normal,
        color: value ? colors.text.primary : colors.text.placeholder,
      }}
    >
      {value || <span style={{ color: colors.text.placeholder }}>—</span>}
    </div>
  )
}
