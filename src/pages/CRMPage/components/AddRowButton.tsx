import { Plus } from 'lucide-react'
import { colors, layout, typography } from '../config/designTokens'

interface AddRowButtonProps {
  onClick: () => void
}

export default function AddRowButton({ onClick }: AddRowButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full transition-colors border-x border-b rounded-b-lg"
      style={{
        padding: '14px 16px',
        backgroundColor: colors.bg.raised,
        borderColor: colors.border.subtle,
        color: colors.text.disabled,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg.surface
        e.currentTarget.style.color = colors.text.muted
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg.raised
        e.currentTarget.style.color = colors.text.disabled
      }}
    >
      <div 
        className="flex items-center justify-center rounded-md"
        style={{
          width: 24,
          height: 24,
          backgroundColor: colors.bg.surface,
        }}
      >
        <Plus size={14} />
      </div>
      <span 
        style={{ 
          fontSize: typography.size.base,
          fontWeight: typography.weight.medium,
        }}
      >
        Add new lead
      </span>
    </button>
  )
}
