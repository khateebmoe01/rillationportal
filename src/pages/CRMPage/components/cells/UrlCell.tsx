import { useState, useRef, useEffect } from 'react'
import { extractDomain, ensureProtocol } from '../../utils/formatters'
import { colors, layout, typography } from '../../config/designTokens'
import { ExternalLink } from 'lucide-react'

interface UrlCellProps {
  value: string | null
  onChange: (value: string) => void
}

export default function UrlCell({ value, onChange }: UrlCellProps) {
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
        type="url"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="https://..."
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

  const domain = extractDomain(value)
  const hasUrl = domain !== '-'

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
      {hasUrl ? (
        <a
          href={ensureProtocol(value)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: colors.accent.secondary,
            textDecoration: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          {domain}
          <ExternalLink size={11} style={{ opacity: 0.6 }} />
        </a>
      ) : (
        <span style={{ color: colors.text.placeholder }}>—</span>
      )}
    </div>
  )
}
