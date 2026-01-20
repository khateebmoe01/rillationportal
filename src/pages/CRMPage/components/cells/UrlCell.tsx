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

  const domain = extractDomain(value)
  const hasUrl = domain !== '-'

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
      {hasUrl ? (
        <a
          href={ensureProtocol(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:underline transition-colors"
          style={{ color: colors.accent.secondary }}
          onClick={(e) => e.stopPropagation()}
        >
          {domain}
          <ExternalLink size={12} className="opacity-60" />
        </a>
      ) : (
        <span style={{ color: colors.text.placeholder }}>—</span>
      )}
    </div>
  )
}
