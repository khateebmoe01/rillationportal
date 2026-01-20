import { useState, useRef, useEffect } from 'react'

interface TextCellProps {
  value: string | null
  onChange: (value: string) => void
}

export default function TextCell({ value, onChange }: TextCellProps) {
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

  const handleClick = () => {
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
        className="w-full h-full bg-[#1f1f1f] text-[#f0f0f0] text-[13px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-inset rounded-none border-none"
      />
    )
  }

  return (
    <div
      onClick={handleClick}
      className="w-full h-full px-3 py-2 text-[13px] text-[#f0f0f0] truncate cursor-text hover:bg-[#1a1a1a]"
    >
      {value || <span className="text-[#888888]">-</span>}
    </div>
  )
}
