import { useState, useRef, useEffect } from 'react'
import { formatCurrency, parseCurrency } from '../../utils/formatters'
import { colors, layout, typography } from '../../config/designTokens'

interface CurrencyCellProps {
  value: number | null
  onChange: (value: number | null) => void
}

export default function CurrencyCell({ value, onChange }: CurrencyCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value?.toString() || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(value?.toString() || '')
  }, [value])

  const handleSave = () => {
    const parsed = parseCurrency(editValue)
    if (parsed !== value) {
      onChange(parsed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value?.toString() || '')
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
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="0"
        className="w-full outline-none border-0 text-right"
        style={{
          height: layout.rowHeight,
          padding: '0 12px',
          backgroundColor: colors.bg.overlay,
          color: colors.text.primary,
          fontSize: typography.size.base,
          fontVariantNumeric: 'tabular-nums',
          boxShadow: `inset 0 0 0 2px ${colors.accent.primary}`,
        }}
      />
    )
  }

  const displayValue = formatCurrency(value)
  const isEmpty = displayValue === '-'
  const isLargeValue = value && value >= 10000

  return (
    <div
      onMouseDown={handleClick}
      className="w-full flex items-center justify-end cursor-text transition-colors"
      style={{ 
        height: layout.rowHeight,
        padding: '0 12px',
        fontSize: typography.size.base,
        fontVariantNumeric: 'tabular-nums',
        color: isEmpty 
          ? colors.text.placeholder 
          : isLargeValue 
            ? colors.accent.primary 
            : colors.text.muted,
        fontWeight: isLargeValue ? typography.weight.medium : typography.weight.normal,
      }}
    >
      {isEmpty ? '—' : displayValue}
    </div>
  )
}
