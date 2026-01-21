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
  exit: { opacity: 0, transition: { duration: 0.1 } },
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

  const handleRowClick = useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't trigger row click if clicking on interactive elements
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'BUTTON' || 
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'A' ||
      target.closest('[contenteditable="true"]') ||
      target.closest('button')
    ) {
      return
    }
    
    if (onRowClick) {
      onRowClick(lead)
    }
  }, [lead, onRowClick])

  const handlePipelineUpdate = useCallback((field: keyof Lead, value: unknown) => {
    onUpdate(lead.id, field, value)
  }, [lead.id, onUpdate])

  const renderCell = (columnId: keyof Lead | 'pipeline_progress', type: string, options?: string[], isLeadName = false) => {
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
      transition={{ delay: Math.min(index * 0.015, 0.2), duration: 0.15 }}
      className="group"
      style={{ 
        height: layout.rowHeight,
        backgroundColor: isSelected ? colors.selection.bg : 'transparent',
        borderBottom: `1px solid ${colors.border.subtle}`,
        cursor: 'pointer',
      }}
      data-lead-id={lead.id}
      onClick={handleRowClick}
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
        style={{ 
          position: 'sticky',
          left: 0,
          zIndex: 10,
          width: layout.checkboxColumnWidth,
          minWidth: layout.checkboxColumnWidth,
          maxWidth: layout.checkboxColumnWidth,
          backgroundColor: isSelected ? colors.selection.bg : colors.bg.raised,
          transition: 'background-color 0.1s',
        }}
      >
        <div 
          style={{
            width: '100%',
            height: layout.rowHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={handleCheckboxClick}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            style={{
              width: 14,
              height: 14,
              cursor: 'pointer',
              accentColor: colors.accent.primary,
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
              position: isFirstColumn ? 'sticky' : undefined,
              left: isFirstColumn ? layout.checkboxColumnWidth : undefined,
              zIndex: isFirstColumn ? 10 : undefined,
              backgroundColor: isFirstColumn 
                ? (isSelected ? colors.selection.bg : colors.bg.raised)
                : undefined,
              borderRight: isFirstColumn ? `1px solid ${colors.border.subtle}` : undefined,
              boxShadow: isFirstColumn ? shadows.sticky : undefined,
              transition: isFirstColumn ? 'background-color 0.1s' : undefined,
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {renderCell(column.id, column.type, column.options, isLeadName)}
          </td>
        )
      })}
      
      {/* Delete action column */}
      <td 
        style={{ 
          width: layout.actionColumnWidth,
          minWidth: layout.actionColumnWidth,
          padding: 0,
        }}
      >
        <button
          type="button"
          onClick={handleDelete}
          style={{ 
            width: '100%',
            height: layout.rowHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.15s, color 0.15s',
            color: colors.text.disabled,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          className="group-hover:opacity-100"
          title="Delete lead"
          onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.text.disabled}
        >
          <Trash2 size={14} />
        </button>
      </td>
    </motion.tr>
  )
}

export default memo(CRMRow)
