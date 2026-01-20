import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { COLUMNS, getColorMap } from '../config/columns'
import { colors, layout, shadows } from '../config/designTokens'
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
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

function CRMRow({ lead, index, onUpdate, onDelete, isSelected, onToggleSelect, onRowClick, columnWidths }: CRMRowProps) {
  const handleUpdate = useCallback((field: keyof Lead) => (value: unknown) => {
    onUpdate(lead.id, field, value)
  }, [lead.id, onUpdate])

  const handleDelete = useCallback(() => {
    if (window.confirm('Delete this lead?')) {
      onDelete(lead.id)
    }
  }, [lead.id, onDelete])

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelect(lead.id)
  }, [lead.id, onToggleSelect])

  const handleRowDoubleClick = useCallback(() => {
    if (onRowClick) {
      onRowClick(lead)
    }
  }, [lead, onRowClick])

  // Handle pipeline updates (multiple fields at once)
  const handlePipelineUpdate = useCallback((field: keyof Lead, value: unknown) => {
    onUpdate(lead.id, field, value)
  }, [lead.id, onUpdate])

  const renderCell = (columnId: keyof Lead | 'pipeline_progress', type: string, options?: string[], isLeadName = false) => {
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
            isPrimary={isLeadName}
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
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.2 }}
      className="group cursor-pointer"
      style={{ 
        height: layout.rowHeight,
        backgroundColor: isSelected ? colors.selection.bg : 'transparent',
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
      data-lead-id={lead.id}
      onDoubleClick={handleRowDoubleClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.bg.surface
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      {/* Checkbox column - sticky */}
      <td 
        className="sticky left-0 z-10 transition-colors"
        style={{ 
          width: layout.checkboxColumnWidth,
          minWidth: layout.checkboxColumnWidth,
          maxWidth: layout.checkboxColumnWidth,
          backgroundColor: isSelected ? colors.selection.bg : colors.bg.raised,
        }}
      >
        <div 
          className="w-full flex items-center justify-center cursor-pointer"
          style={{ height: layout.rowHeight }}
          onClick={handleCheckboxClick}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 rounded cursor-pointer accent-[#22c55e]"
            style={{
              backgroundColor: colors.bg.surface,
              borderColor: colors.border.strong,
            }}
          />
        </div>
      </td>

      {COLUMNS.map((column, columnIndex) => {
        const width = columnWidths?.[column.id] ?? column.width
        const isLeadName = column.id === 'full_name'
        const isFirstColumn = columnIndex === 0
        
        return (
          <td
            key={column.id}
            style={{ 
              width, 
              minWidth: width, 
              maxWidth: width,
              // First data column is sticky
              ...(isFirstColumn ? {
                position: 'sticky' as const,
                left: layout.checkboxColumnWidth,
                zIndex: 10,
                backgroundColor: isSelected ? colors.selection.bg : colors.bg.raised,
                boxShadow: shadows.sticky,
              } : {}),
            }}
            className={`p-0 overflow-hidden ${isFirstColumn ? 'transition-colors' : ''}`}
          >
            {renderCell(column.id, column.type, column.options, isLeadName)}
          </td>
        )
      })}
      
      {/* Delete action column */}
      <td 
        className="p-0"
        style={{ width: layout.actionColumnWidth }}
      >
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          style={{ 
            height: layout.rowHeight,
            color: colors.text.disabled,
          }}
          title="Delete lead"
          onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.text.disabled}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </motion.tr>
  )
}

export default memo(CRMRow)
