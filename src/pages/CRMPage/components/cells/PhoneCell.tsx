import { useState, useRef, useEffect } from 'react'
import { formatPhone } from '../../utils/formatters'
import { colors, layout, typography } from '../../config/designTokens'

interface PhoneCellProps {
  value: string | null
  onChange: (value: string) => void
}

export default function PhoneCell({ value, onChange }: PhoneCellProps) {
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
    if (!isEditing) {
      if ((e.target as HTMLElement).tagName === 'A') {
        return
      }
      setIsEditing(true)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="tel"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="(555) 555-5555"
        className="w-full outline-none border-0"
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

  const formatted = formatPhone(value)
  const hasPhone = formatted !== '-'

  return (
    <div
      onMouseDown={handleClick}
      className="w-full flex items-center cursor-text transition-colors"
      style={{ 
        height: layout.rowHeight,
        padding: '0 12px',
        fontSize: typography.size.base,
      }}
    >
      {hasPhone ? (
        <a
          href={`tel:${value}`}
          className="hover:underline transition-colors"
          style={{ color: colors.text.muted }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.secondary}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.text.muted}
        >
          {formatted}
        </a>
      ) : (
        <span style={{ color: colors.text.placeholder }}>—</span>
      )}
    </div>
  )
}
