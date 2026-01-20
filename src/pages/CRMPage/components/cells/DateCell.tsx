import { useState, useRef, useEffect } from 'react'
import { formatDate, formatDateForInput, parseDateInput } from '../../utils/formatters'

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

  const handleClick = () => {
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
        className="w-full h-full bg-[#1f1f1f] text-[#f0f0f0] text-[13px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-inset rounded-none border-none [color-scheme:dark]"
      />
    )
  }

  return (
    <div
      onClick={handleClick}
      className="w-full h-full px-3 py-2 text-[13px] text-[#f0f0f0] cursor-text hover:bg-[#1a1a1a]"
    >
      {formatDate(value) === '-' ? <span className="text-[#888888]">-</span> : formatDate(value)}
    </div>
  )
}
