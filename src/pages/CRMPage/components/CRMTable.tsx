import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLUMNS } from '../config/columns'
import CRMRow from './CRMRow'
import ResizableColumnHeader from './ResizableColumnHeader'
import type { Lead } from '../types'

interface CRMTableProps {
  leads: Lead[]
  loading: boolean
  error: string | null
  onUpdate: (id: string, field: keyof Lead, value: unknown) => void
  onDelete: (id: string) => void
  onRetry: () => void
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onRowClick?: (lead: Lead) => void
}

// Skeleton row component
function SkeletonRow({ columnWidths }: { columnWidths: Record<string, number> }) {
  return (
    <tr className="border-b border-[#1f1f1f]" style={{ height: '44px' }}>
      <td className="p-0 w-10">
        <div className="px-3 py-2">
          <motion.div
            className="h-4 w-4 bg-[#1f1f1f] rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </td>
      {COLUMNS.map((column) => (
        <td
          key={column.id}
          style={{ width: columnWidths[column.id], minWidth: columnWidths[column.id] }}
          className="p-0"
        >
          <div className="px-3 py-2">
            <motion.div
              className="h-4 bg-[#1f1f1f] rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: Math.min(columnWidths[column.id] - 24, 100) }}
            />
          </div>
        </td>
      ))}
      <td className="p-0 w-10" />
    </tr>
  )
}

export default function CRMTable({ 
  leads, 
  loading, 
  error, 
  onUpdate, 
  onDelete,
  onRetry,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
}: CRMTableProps) {
  // Initialize column widths from COLUMNS config
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {}
    COLUMNS.forEach((col) => {
      widths[col.id] = col.width
    })
    return widths
  })

  // Handle column resize
  const handleColumnResize = useCallback((columnId: string) => (newWidth: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnId]: newWidth,
    }))
  }, [])

  // Calculate total width (+40 for checkbox, +40 for delete column)
  const totalWidth = useMemo(() => {
    return Object.values(columnWidths).reduce((sum, w) => sum + w, 0) + 80
  }, [columnWidths])

  const allSelected = leads.length > 0 && selectedIds.size === leads.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < leads.length

  // Error state
  if (error && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-[#3d2a2a] text-[#ef4444] px-4 py-2 rounded-md mb-4">
          {error}
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#1f1f1f] text-[#f0f0f0] rounded hover:bg-[#2a2a2a] transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table 
        className="w-full border-collapse"
        style={{ minWidth: totalWidth }}
      >
        {/* Header */}
        <thead>
          <tr className="bg-[#161616] border-b border-[#2a2a2a]" style={{ height: '36px' }}>
            {/* Checkbox header */}
            <ResizableColumnHeader
              label=""
              width={40}
              onResize={() => {}}
              isCheckbox
            >
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-[#3a3a3a] bg-[#1f1f1f] text-emerald-600 focus:ring-emerald-600 focus:ring-offset-0 cursor-pointer accent-[#006B3F]"
              />
            </ResizableColumnHeader>
            
            {COLUMNS.map((column) => (
              <ResizableColumnHeader
                key={column.id}
                label={column.label}
                width={columnWidths[column.id]}
                onResize={handleColumnResize(column.id)}
                minWidth={60}
                maxWidth={500}
              />
            ))}
            
            <th className="w-10" /> {/* Delete column header */}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {/* Loading state */}
          {loading && leads.length === 0 && (
            <>
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} columnWidths={columnWidths} />
              ))}
            </>
          )}

          {/* Empty state */}
          {!loading && leads.length === 0 && !error && (
            <tr>
              <td colSpan={COLUMNS.length + 2} className="py-16 text-center">
                <div className="text-[#f0f0f0] text-sm">No leads found</div>
                <div className="text-[#d0d0d0] text-xs mt-1">
                  Add a new lead to get started
                </div>
              </td>
            </tr>
          )}

          {/* Data rows */}
          <AnimatePresence>
            {leads.map((lead, index) => (
              <CRMRow
                key={lead.id}
                lead={lead}
                index={index}
                onUpdate={onUpdate}
                onDelete={onDelete}
                isSelected={selectedIds.has(lead.id)}
                onToggleSelect={onToggleSelect}
                onRowClick={onRowClick}
                columnWidths={columnWidths}
              />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
