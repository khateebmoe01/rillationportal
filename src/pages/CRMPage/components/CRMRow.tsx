import { memo } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { COLUMNS, getColorMap } from '../config/columns'
import type { Lead } from '../types'

// Cell components
import TextCell from './cells/TextCell'
import SelectCell from './cells/SelectCell'
import DateCell from './cells/DateCell'
import CurrencyCell from './cells/CurrencyCell'
import PhoneCell from './cells/PhoneCell'
import UrlCell from './cells/UrlCell'
import PipelineProgressCell from './cells/PipelineProgressCell'

interface CRMRowProps {
  lead: Lead
  index: number
  onUpdate: (id: string, field: keyof Lead, value: unknown) => void
  onDelete: (id: string) => void
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onRowClick?: (lead: Lead) => void
  columnWidths?: Record<string, number>
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -10 },
}

function CRMRow({ lead, index, onUpdate, onDelete, isSelected, onToggleSelect, onRowClick, columnWidths }: CRMRowProps) {
  const handleUpdate = (field: keyof Lead) => (value: unknown) => {
    onUpdate(lead.id, field, value)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this lead?')) {
      onDelete(lead.id)
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelect(lead.id)
  }

  const handleRowDoubleClick = () => {
    if (onRowClick) {
      onRowClick(lead)
    }
  }

  // Handle pipeline updates (multiple fields at once)
  const handlePipelineUpdate = (field: keyof Lead, value: unknown) => {
    onUpdate(lead.id, field, value)
  }

  const renderCell = (columnId: keyof Lead | 'pipeline_progress', type: string, options?: string[]) => {
    // Special case for pipeline progress (composite column)
    if (type === 'pipeline') {
      return (
        <PipelineProgressCell
          lead={lead}
          onUpdate={handlePipelineUpdate}
        />
      )
    }

    const value = lead[columnId as keyof Lead]
    const colorMap = getColorMap(columnId as keyof Lead)

    switch (type) {
      case 'text':
        return (
          <TextCell
            value={value as string | null}
            onChange={handleUpdate(columnId as keyof Lead)}
          />
        )
      case 'select':
        return (
          <SelectCell
            value={value as string | null}
            options={options || []}
            onChange={handleUpdate(columnId as keyof Lead)}
            colorMap={colorMap}
          />
        )
      case 'date':
        return (
          <DateCell
            value={value as string | null}
            onChange={handleUpdate(columnId as keyof Lead)}
          />
        )
      case 'currency':
        return (
          <CurrencyCell
            value={value as number | null}
            onChange={handleUpdate(columnId as keyof Lead)}
          />
        )
      case 'phone':
        return (
          <PhoneCell
            value={value as string | null}
            onChange={handleUpdate(columnId as keyof Lead)}
          />
        )
      case 'url':
        return (
          <UrlCell
            value={value as string | null}
            onChange={handleUpdate(columnId as keyof Lead)}
          />
        )
      default:
        return (
          <TextCell
            value={value as string | null}
            onChange={handleUpdate(columnId as keyof Lead)}
          />
        )
    }
  }

  return (
    <motion.tr
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`group border-b border-[#1f1f1f] hover:bg-[#1a1a1a] ${isSelected ? 'bg-[#1a2a3a]' : ''}`}
      style={{ height: '44px' }}
      data-lead-id={lead.id}
      onDoubleClick={handleRowDoubleClick}
    >
      {/* Checkbox column */}
      <td className="p-0 w-10">
        <div 
          className="w-full h-11 flex items-center justify-center cursor-pointer"
          onClick={handleCheckboxClick}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 rounded border-[#3a3a3a] bg-[#1f1f1f] text-emerald-600 focus:ring-emerald-600 focus:ring-offset-0 cursor-pointer accent-[#006B3F]"
          />
        </div>
      </td>

      {COLUMNS.map((column) => {
        const width = columnWidths?.[column.id] ?? column.width
        return (
          <td
            key={column.id}
            style={{ width, minWidth: width, maxWidth: width }}
            className="p-0 overflow-hidden"
          >
            {renderCell(column.id, column.type, column.options)}
          </td>
        )
      })}
      
      {/* Delete action column */}
      <td className="p-0 w-10">
        <button
          onClick={handleDelete}
          className="w-full h-11 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#888888] hover:text-[#ef4444]"
          title="Delete lead"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </motion.tr>
  )
}

export default memo(CRMRow)
