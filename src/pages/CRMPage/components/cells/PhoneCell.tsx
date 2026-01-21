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
        }}
      />
    )
  }

  const formatted = formatPhone(value)
  const hasPhone = formatted !== '-'

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
      }}
    >
      {hasPhone ? (
        <a
          href={`tel:${value}`}
          style={{ 
            color: colors.text.muted,
            textDecoration: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.accent.secondary
            e.currentTarget.style.textDecoration = 'underline'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.muted
            e.currentTarget.style.textDecoration = 'none'
          }}
        >
          {formatted}
        </a>
      ) : (
        <span style={{ color: colors.text.placeholder }}>—</span>
      )}
    </div>
  )
}
