import { useState, useRef, useEffect } from 'react'
import { formatCurrency, parseCurrency } from '../../utils/formatters'

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
        className="w-full h-11 bg-[#1f1f1f] text-[#f0f0f0] text-[13px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B3F] focus:ring-inset rounded-none border-none"
      />
    )
  }

  return (
    <div
      onMouseDown={handleClick}
      className="w-full h-11 px-3 py-2 text-[13px] text-[#f0f0f0] cursor-text hover:bg-[#1a1a1a] flex items-center"
    >
      {formatCurrency(value) === '-' ? <span className="text-[#888888]">-</span> : formatCurrency(value)}
    </div>
  )
}
