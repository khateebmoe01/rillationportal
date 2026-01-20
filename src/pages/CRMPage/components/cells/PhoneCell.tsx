import { useState, useRef, useEffect } from 'react'
import { formatPhone } from '../../utils/formatters'

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
    if (!isEditing) {
      // Check if clicking on the phone link
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
        placeholder="(555) 555-5555"
        className="w-full h-full bg-[#1f1f1f] text-[#f0f0f0] text-[13px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-inset rounded-none border-none"
      />
    )
  }

  const formatted = formatPhone(value)
  const hasPhone = formatted !== '-'

  return (
    <div
      onClick={handleClick}
      className="w-full h-full px-3 py-2 text-[13px] cursor-text hover:bg-[#1a1a1a]"
    >
      {hasPhone ? (
        <a
          href={`tel:${value}`}
          className="text-[#f0f0f0] hover:text-[#60a5fa] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {formatted}
        </a>
      ) : (
        <span className="text-[#888888]">-</span>
      )}
    </div>
  )
}
