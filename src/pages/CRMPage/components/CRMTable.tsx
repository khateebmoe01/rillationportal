import { useState, useCallback, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLUMNS } from '../config/columns'
import { colors, layout, typography, shadows } from '../config/designTokens'
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
    <tr 
      className="border-b"
      style={{ 
        height: layout.rowHeight,
        borderColor: colors.border.subtle,
      }}
    >
      <td 
        className="sticky left-0 z-10"
        style={{ 
          width: layout.checkboxColumnWidth,
          backgroundColor: colors.bg.raised,
        }}
      >
        <div className="flex items-center justify-center h-full">
          <motion.div
            className="rounded"
            style={{ 
              height: 16, 
              width: 16, 
              backgroundColor: colors.bg.surface,
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </td>
      {COLUMNS.map((column, index) => (
        <td
          key={column.id}
          style={{ 
            width: columnWidths[column.id], 
            minWidth: columnWidths[column.id],
            // First column (Lead Name) is sticky
            ...(index === 0 ? {
              position: 'sticky' as const,
              left: layout.checkboxColumnWidth,
              zIndex: 10,
              backgroundColor: colors.bg.raised,
            } : {}),
          }}
          className="p-0"
        >
          <div style={{ padding: '0 12px' }}>
            <motion.div
              className="rounded"
              style={{ 
                height: 14, 
                backgroundColor: colors.bg.surface,
                width: Math.min(columnWidths[column.id] - 24, 80),
              }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </td>
      ))}
      <td style={{ width: layout.actionColumnWidth }} />
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
  const tableContainerRef = useRef<HTMLDivElement>(null)
  
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

  // Calculate total width
  const totalWidth = useMemo(() => {
    return Object.values(columnWidths).reduce((sum, w) => sum + w, 0) + 
           layout.checkboxColumnWidth + 
           layout.actionColumnWidth
  }, [columnWidths])

  const allSelected = leads.length > 0 && selectedIds.size === leads.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < leads.length

  // Error state
  if (error && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div 
          className="px-5 py-3 rounded-lg mb-5"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            fontSize: typography.size.base,
          }}
        >
          {error}
        </div>
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-lg transition-colors"
          style={{
            backgroundColor: colors.bg.surface,
            color: colors.text.primary,
            fontSize: typography.size.base,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bg.overlay}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.bg.surface}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div 
      ref={tableContainerRef}
      className="overflow-x-auto overflow-y-visible relative"
      style={{
        // Smooth scrolling
        scrollBehavior: 'smooth',
      }}
    >
      <table 
        className="w-full border-collapse"
        style={{ minWidth: totalWidth }}
      >
        {/* Header */}
        <thead className="sticky top-0 z-20">
          <tr 
            style={{ 
              height: layout.headerHeight,
              backgroundColor: colors.bg.elevated,
              boxShadow: shadows.header,
            }}
          >
            {/* Checkbox header - sticky */}
            <th 
              className="sticky left-0 z-30 text-left"
              style={{ 
                width: layout.checkboxColumnWidth,
                minWidth: layout.checkboxColumnWidth,
                maxWidth: layout.checkboxColumnWidth,
                backgroundColor: colors.bg.elevated,
                borderBottom: `1px solid ${colors.border.default}`,
              }}
            >
              <div className="flex items-center justify-center h-full">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded cursor-pointer accent-[#22c55e]"
                  style={{
                    backgroundColor: colors.bg.surface,
                    borderColor: colors.border.strong,
                  }}
                />
              </div>
            </th>
            
            {COLUMNS.map((column, index) => (
              <ResizableColumnHeader
                key={column.id}
                label={column.label}
                width={columnWidths[column.id]}
                onResize={handleColumnResize(column.id)}
                minWidth={layout.minColumnWidth}
                maxWidth={layout.maxColumnWidth}
                isSticky={index === 0}
                stickyLeft={layout.checkboxColumnWidth}
              />
            ))}
            
            {/* Delete column header */}
            <th 
              style={{ 
                width: layout.actionColumnWidth,
                minWidth: layout.actionColumnWidth,
                borderBottom: `1px solid ${colors.border.default}`,
              }} 
            />
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {/* Loading state */}
          {loading && leads.length === 0 && (
            <>
              {[...Array(8)].map((_, i) => (
                <SkeletonRow key={i} columnWidths={columnWidths} />
              ))}
            </>
          )}

          {/* Empty state */}
          {!loading && leads.length === 0 && !error && (
            <tr>
              <td 
                colSpan={COLUMNS.length + 2} 
                className="py-20 text-center"
              >
                <div 
                  style={{ 
                    fontSize: typography.size.md,
                    color: colors.text.primary,
                    fontWeight: typography.weight.medium,
                  }}
                >
                  No leads found
                </div>
                <div 
                  className="mt-2"
                  style={{ 
                    fontSize: typography.size.base,
                    color: colors.text.muted,
                  }}
                >
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
