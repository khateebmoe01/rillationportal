import { Plus } from 'lucide-react'

interface AddRowButtonProps {
  onClick: () => void
}

export default function AddRowButton({ onClick }: AddRowButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-[#666666] hover:text-[#a3a3a3] hover:bg-[#1a1a1a] border-b border-[#1f1f1f] w-full transition-colors"
    >
      <Plus size={14} />
      <span>Add new lead</span>
    </button>
  )
}
