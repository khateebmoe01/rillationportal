import { motion } from 'framer-motion'

interface TableSkeletonProps {
  /** Number of rows to show */
  rows?: number
  /** Number of columns to show */
  columns?: number
  /** Show the column picker placeholder */
  showColumnPicker?: boolean
}

/**
 * Skeleton loading state for the CRM table.
 * Matches the layout of ContactsTable to prevent layout shift.
 */
export default function TableSkeleton({
  rows = 8,
  columns = 6,
  showColumnPicker = true,
}: TableSkeletonProps) {
  // Column widths to match actual table layout
  const columnWidths = [220, 200, 160, 180, 150, 160]
  
  return (
    <div className="h-full min-h-0 bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 border-b border-slate-700/50 flex bg-slate-800 h-12">
        {/* Column picker placeholder */}
        {showColumnPicker && (
          <div className="flex-shrink-0 px-2 flex items-center border-r border-slate-700/50">
            <div className="skeleton w-8 h-8 rounded-lg" />
          </div>
        )}
        
        {/* Sticky first column header */}
        <div 
          className="flex-shrink-0 sticky left-0 z-20 bg-slate-800 px-3 h-full flex items-center"
          style={{ width: `${columnWidths[0]}px` }}
        >
          <div className="skeleton h-4 w-24 rounded" />
        </div>
        
        {/* Scrollable column headers */}
        <div className="flex">
          {columnWidths.slice(1, columns).map((width, idx) => (
            <div 
              key={idx}
              className="flex-shrink-0 px-3 h-12 flex items-center"
              style={{ width: `${width}px` }}
            >
              <div className="skeleton h-4 rounded" style={{ width: `${40 + Math.random() * 40}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Body skeleton */}
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="flex border-b border-slate-700/50"
          >
            {/* Spacer for column picker */}
            {showColumnPicker && (
              <div className="flex-shrink-0 px-2 py-3 flex items-center border-r border-slate-700/50 bg-slate-800">
                <div className="p-2 w-4" />
              </div>
            )}
            
            {/* Sticky first column */}
            <div 
              className="flex-shrink-0 sticky left-0 z-10 px-3 py-3 bg-slate-800 min-h-row-comfortable flex items-center"
              style={{ width: `${columnWidths[0]}px` }}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Avatar skeleton */}
                <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                {/* Name skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            </div>
            
            {/* Scrollable columns */}
            <div className="flex">
              {columnWidths.slice(1, columns).map((width, colIndex) => (
                <div 
                  key={colIndex}
                  className="flex-shrink-0 px-3 py-3 min-h-row-comfortable flex items-center"
                  style={{ width: `${width}px` }}
                >
                  {colIndex === 1 ? (
                    // Stage-like pill skeleton
                    <div className="skeleton h-6 w-20 rounded-full" />
                  ) : colIndex === 2 ? (
                    // Pipeline-like pill skeleton
                    <div className="skeleton h-6 w-24 rounded-full" />
                  ) : (
                    // Text skeleton with varying widths
                    <div 
                      className="skeleton h-4 rounded" 
                      style={{ width: `${30 + Math.random() * 50}%` }} 
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
