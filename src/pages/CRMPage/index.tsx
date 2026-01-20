import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useLeads } from './hooks/useLeads'
import CRMHeader from './components/CRMHeader'
import CRMTable from './components/CRMTable'
import AddRowButton from './components/AddRowButton'
import LeadDetailSidebar from './components/LeadDetailSidebar'
import { colors, typography, radius, shadows } from './config/designTokens'
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
      if (selectedIdsRef.current.size > 0) {
        e.preventDefault()
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
      const matchingLead = leads.find(
        l => l.email?.toLowerCase() === leadEmail.toLowerCase()
      )

      if (matchingLead) {
        deepLinkProcessed.current = true
        setSelectedIds(new Set([matchingLead.id]))
        
        if (shouldOpen) {
          setSidebarLead(matchingLead)
          setIsSidebarOpen(true)
        }

        setTimeout(() => {
          const row = document.querySelector(`[data-lead-id="${matchingLead.id}"]`)
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)

        setSearchParams({}, { replace: true })
      }
    }
  }, [leads, loading, searchParams, setSearchParams])

  const handleRowClick = useCallback((lead: Lead) => {
    setSidebarLead(lead)
    setIsSidebarOpen(true)
  }, [])

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false)
    setSidebarLead(null)
  }, [])

  const handleUpdate = useCallback((id: string, field: keyof Lead, value: unknown) => {
    updateLead(id, field, value)
  }, [updateLead])

  const handleDelete = useCallback((id: string) => {
    deleteLead(id)
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [deleteLead])

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return
    
    setIsDeleting(true)
    const deletePromises = Array.from(selectedIds).map(id => deleteLead(id))
    await Promise.all(deletePromises)
    
    setSelectedIds(new Set())
    setShowDeleteModal(false)
    setIsDeleting(false)
  }, [selectedIds, deleteLead])

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

  const handleToggleSelectAll = useCallback(() => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)))
    }
  }, [leads, selectedIds.size])

  const handleAdd = useCallback(async () => {
    const newLead = await createLead({
      full_name: '',
      email: `new-${Date.now()}@example.com`,
      stage: 'new',
    })

    if (newLead) {
      setTimeout(() => {
        const firstCell = document.querySelector('tbody tr:first-child td:nth-child(2) div')
        if (firstCell instanceof HTMLElement) {
          firstCell.click()
        }
      }, 100)
    }
  }, [createLead])

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: colors.bg.base,
        color: colors.text.primary,
      }}
    >
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

      {/* Table container */}
      <div className="flex-1 px-5 py-4">
        <div 
          className="rounded-xl border overflow-hidden"
          style={{ 
            backgroundColor: colors.bg.raised,
            borderColor: colors.border.subtle,
          }}
        >
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
        </div>
        
        {/* Add row button at bottom of table */}
        {!loading && leads.length > 0 && (
          <AddRowButton onClick={handleAdd} />
        )}
      </div>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 z-40 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div 
                className="pointer-events-auto border"
                style={{
                  backgroundColor: colors.bg.overlay,
                  borderColor: colors.border.default,
                  borderRadius: radius.xl,
                  boxShadow: shadows.xl,
                  padding: 28,
                  minWidth: 380,
                }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div 
                    className="p-2.5 rounded-lg"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                  >
                    <AlertTriangle size={22} style={{ color: '#f87171' }} />
                  </div>
                  <h3 
                    style={{ 
                      fontSize: typography.size.lg,
                      fontWeight: typography.weight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    Delete selected leads
                  </h3>
                </div>
                
                <p 
                  className="mb-7"
                  style={{ 
                    fontSize: typography.size.base,
                    color: colors.text.secondary,
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  Are you sure you want to delete {selectedIds.size} selected {selectedIds.size === 1 ? 'lead' : 'leads'}? 
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: colors.bg.surface,
                      color: colors.text.primary,
                      fontSize: typography.size.base,
                      fontWeight: typography.weight.medium,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bg.overlay}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.bg.surface}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: typography.size.base,
                      fontWeight: typography.weight.medium,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  >
                    {isDeleting ? (
                      <>
                        <div 
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete {selectedIds.size} {selectedIds.size === 1 ? 'lead' : 'leads'}
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
