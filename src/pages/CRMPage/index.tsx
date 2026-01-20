import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useLeads } from './hooks/useLeads'
import CRMHeader from './components/CRMHeader'
import CRMTable from './components/CRMTable'
import AddRowButton from './components/AddRowButton'
import LeadDetailSidebar from './components/LeadDetailSidebar'
import type { Lead, LeadFilters } from './types'

export default function CRMPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<LeadFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sidebarLead, setSidebarLead] = useState<Lead | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const deepLinkProcessed = useRef(false)

  const {
    leads,
    loading,
    error,
    updateLead,
    createLead,
    deleteLead,
    refetch,
    uniqueAssignees,
  } = useLeads({ filters, searchQuery })

  // Right-click detection using refs to access current selectedIds
  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleContextMenu = (e: MouseEvent) => {
      // Show modal if rows are selected
      if (selectedIdsRef.current.size > 0) {
        e.preventDefault() // Prevent default context menu
        setShowDeleteModal(true)
      }
    }

    container.addEventListener('contextmenu', handleContextMenu)
    return () => container.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  // Handle deep link from email notifications
  useEffect(() => {
    if (deepLinkProcessed.current || loading || leads.length === 0) return

    const leadEmail = searchParams.get('lead')
    const shouldOpen = searchParams.get('open') === 'true'

    if (leadEmail) {
      // Find the lead by email (case-insensitive)
      const matchingLead = leads.find(
        l => l.email?.toLowerCase() === leadEmail.toLowerCase()
      )

      if (matchingLead) {
        deepLinkProcessed.current = true
        
        // Highlight the row
        setSelectedIds(new Set([matchingLead.id]))
        
        // Open sidebar if requested
        if (shouldOpen) {
          setSidebarLead(matchingLead)
          setIsSidebarOpen(true)
        }

        // Scroll to the row after a short delay for render
        setTimeout(() => {
          const row = document.querySelector(`[data-lead-id="${matchingLead.id}"]`)
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)

        // Clear URL params after processing
        setSearchParams({}, { replace: true })
      }
    }
  }, [leads, loading, searchParams, setSearchParams])

  // Handle row click to open sidebar
  const handleRowClick = useCallback((lead: Lead) => {
    setSidebarLead(lead)
    setIsSidebarOpen(true)
  }, [])

  // Close sidebar
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false)
    setSidebarLead(null)
  }, [])

  // Handle update from table
  const handleUpdate = useCallback((id: string, field: keyof Lead, value: unknown) => {
    updateLead(id, field, value)
  }, [updateLead])

  // Handle delete single row
  const handleDelete = useCallback((id: string) => {
    deleteLead(id)
    // Remove from selection if deleted
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [deleteLead])

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return
    
    setIsDeleting(true)
    
    // Delete all selected leads
    const deletePromises = Array.from(selectedIds).map(id => deleteLead(id))
    await Promise.all(deletePromises)
    
    setSelectedIds(new Set())
    setShowDeleteModal(false)
    setIsDeleting(false)
  }, [selectedIds, deleteLead])

  // Handle row selection toggle
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Handle select all toggle
  const handleToggleSelectAll = useCallback(() => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)))
    }
  }, [leads, selectedIds.size])

  // Handle add new lead
  const handleAdd = useCallback(async () => {
    // Create a new lead with minimal data - auto-focuses first cell
    const newLead = await createLead({
      full_name: '',
      email: `new-${Date.now()}@example.com`, // Temporary email, required field
      stage: 'new',
    })

    // Focus the first cell of the new row after creation
    if (newLead) {
      // Small delay to let the row render
      setTimeout(() => {
        const firstCell = document.querySelector('tbody tr:first-child td:nth-child(2) div')
        if (firstCell instanceof HTMLElement) {
          firstCell.click()
        }
      }, 100)
    }
  }, [createLead])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0d0d0d] text-gray-100">
      <CRMHeader
        recordCount={leads.length}
        filters={filters}
        onFiltersChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleAdd}
        uniqueAssignees={uniqueAssignees}
        selectedCount={selectedIds.size}
      />

      <div className="px-4">
        <CRMTable
          leads={leads}
          loading={loading}
          error={error}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onRetry={refetch}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onRowClick={handleRowClick}
        />

        {/* Add row button at bottom of table */}
        {!loading && leads.length > 0 && (
          <AddRowButton onClick={handleAdd} />
        )}
      </div>

      {/* Bulk Delete Confirmation Modal - Centered */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
            />
            
            {/* Modal - Centered */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg shadow-2xl p-6 min-w-[320px] pointer-events-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Trash2 className="text-red-500" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#f0f0f0]">
                    Delete selected opportunities
                  </h3>
                </div>
                
                <p className="text-[#d0d0d0] text-sm mb-6">
                  Are you sure you want to delete {selectedIds.size} selected {selectedIds.size === 1 ? 'lead' : 'leads'}? 
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm text-[#f0f0f0] bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete all selected opportunities
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lead Detail Sidebar */}
      <LeadDetailSidebar
        lead={sidebarLead}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}
