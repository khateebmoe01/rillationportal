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

  // Filter input to only allow numeric characters
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Allow numbers, decimal point, and empty string
    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
      setEditValue(val)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={editValue}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="0"
        style={{
          width: '100%',
          height: layout.rowHeight,
          padding: `0 ${layout.cellPaddingX}px`,
          backgroundColor: colors.bg.overlay,
          color: colors.text.primary,
          fontSize: typography.size.base,
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
          border: 'none',
          outline: 'none',
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
      style={{ 
        width: '100%',
        height: layout.rowHeight,
        padding: `0 ${layout.cellPaddingX}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        cursor: 'text',
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
