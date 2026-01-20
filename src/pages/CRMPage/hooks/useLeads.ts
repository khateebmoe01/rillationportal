import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useFilters } from '../../../contexts/FilterContext'
import type { Lead, UseLeadsOptions } from '../types'

// Type for Supabase operations - bypasses strict typing for tables not fully defined
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: string | null
  updateLead: (id: string, field: keyof Lead, value: unknown) => Promise<boolean>
  createLead: (leadData: Partial<Lead>) => Promise<Lead | null>
  deleteLead: (id: string) => Promise<boolean>
  restoreLead: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
  uniqueAssignees: string[]
  uniqueLeadSources: string[]
}

export function useLeads(options: UseLeadsOptions = {}): UseLeadsReturn {
  const { filters, searchQuery } = options
  const { selectedClient } = useFilters()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch leads with filters
  const fetchLeads = useCallback(async () => {
    if (!selectedClient) {
      setLeads([])
      setLoading(false)
      setError('No client selected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('engaged_leads')
        .select('*')
        .eq('client', selectedClient)
        .is('deleted_at', null) // Only fetch non-deleted records
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.stage) {
        query = query.eq('stage', filters.stage)
      }
      if (filters?.assignee) {
        query = query.eq('assignee', filters.assignee)
      }
      if (filters?.lead_source) {
        query = query.eq('lead_source', filters.lead_source)
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        setLeads([])
      } else {
        // Fetch opportunity values for leads
        const leadsWithValues = await enrichLeadsWithOpportunityValues(data as Lead[] || [], selectedClient)
        setLeads(leadsWithValues)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [selectedClient, filters?.stage, filters?.assignee, filters?.lead_source, searchQuery])

  // Enrich leads with opportunity values from client_opportunities table
  async function enrichLeadsWithOpportunityValues(leads: Lead[], client: string): Promise<Lead[]> {
    if (leads.length === 0) return leads

    try {
      const { data: opportunities } = await supabase
        .from('client_opportunities')
        .select('contact_email, value, id')
        .eq('client', client)

      if (!opportunities) return leads

      // Create email -> opportunity map
      const oppMap = new Map<string, { value: number; id: number }>()
      ;(opportunities as Array<{ contact_email: string | null; value: number; id: number }>).forEach((opp) => {
        if (opp.contact_email) {
          oppMap.set(opp.contact_email.toLowerCase(), { value: opp.value, id: opp.id })
        }
      })

      // Enrich leads
      return leads.map(lead => {
        const opp = oppMap.get(lead.email?.toLowerCase() || '')
        return {
          ...lead,
          estimated_value: opp?.value || null,
          opportunity_id: opp?.id?.toString() || null,
        }
      })
    } catch {
      return leads
    }
  }

  // Update a single field
  const updateLead = useCallback(async (id: string, field: keyof Lead, value: unknown): Promise<boolean> => {
    // Handle estimated_value separately - update client_opportunities
    if (field === 'estimated_value') {
      const lead = leads.find(l => l.id === id)
      if (!lead) return false

      // Optimistic update
      setLeads(prev => prev.map(l => 
        l.id === id ? { ...l, estimated_value: value as number } : l
      ))

      try {
        if (lead.opportunity_id) {
          // Update existing opportunity
          const { error } = await (supabase
            .from('client_opportunities') as SupabaseAny)
            .update({ value: value as number, updated_at: new Date().toISOString() })
            .eq('id', parseInt(lead.opportunity_id))

          if (error) throw error
        } else if (selectedClient) {
          // Create new opportunity
          const { data, error } = await (supabase
            .from('client_opportunities') as SupabaseAny)
            .insert({
              client: selectedClient,
              opportunity_name: lead.full_name || lead.company || 'New Opportunity',
              contact_email: lead.email,
              contact_name: lead.full_name,
              value: value as number,
              stage: 'Qualification',
            })
            .select()
            .single()

          if (error) throw error

          // Update lead with new opportunity_id
          setLeads(prev => prev.map(l => 
            l.id === id ? { ...l, estimated_value: value as number, opportunity_id: data.id.toString() } : l
          ))
        }
        return true
      } catch (err) {
        // Revert on error
        fetchLeads()
        setError(err instanceof Error ? err.message : 'Failed to update value')
        return false
      }
    }

    // Standard field update
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, [field]: value } : lead
    ))

    try {
      const { error: updateError } = await (supabase
        .from('engaged_leads') as SupabaseAny)
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (updateError) {
        fetchLeads()
        setError(updateError.message)
        return false
      }
      return true
    } catch (err) {
      fetchLeads()
      setError(err instanceof Error ? err.message : 'Failed to update lead')
      return false
    }
  }, [leads, selectedClient, fetchLeads])

  // Create new lead
  const createLead = useCallback(async (leadData: Partial<Lead>): Promise<Lead | null> => {
    if (!selectedClient) {
      setError('No client selected')
      return null
    }

    try {
      const { data, error: createError } = await (supabase
        .from('engaged_leads') as SupabaseAny)
        .insert({ 
          ...leadData, 
          client: selectedClient,
          stage: leadData.stage || 'new',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        setError(createError.message)
        return null
      }

      const newLead = data as Lead
      // Add to leads at the top
      setLeads(prev => [newLead, ...prev])
      return newLead
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead')
      return null
    }
  }, [selectedClient])

  // Soft delete lead (sets deleted_at timestamp instead of actually deleting)
  const deleteLead = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await (supabase
        .from('engaged_leads') as SupabaseAny)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (deleteError) {
        setError(deleteError.message)
        return false
      }

      // Remove from local state (it's still in DB but marked as deleted)
      setLeads(prev => prev.filter(lead => lead.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead')
      return false
    }
  }, [])

  // Restore a soft-deleted lead
  const restoreLead = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: restoreError } = await (supabase
        .from('engaged_leads') as SupabaseAny)
        .update({ deleted_at: null })
        .eq('id', id)

      if (restoreError) {
        setError(restoreError.message)
        return false
      }

      // Refetch to include the restored lead
      await fetchLeads()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore lead')
      return false
    }
  }, [fetchLeads])

  // Compute unique values for filters
  const uniqueAssignees = [...new Set(leads.map(l => l.assignee).filter(Boolean))] as string[]
  const uniqueLeadSources = [...new Set(leads.map(l => l.lead_source).filter(Boolean))] as string[]

  // Initial fetch
  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return {
    leads,
    loading,
    error,
    updateLead,
    createLead,
    deleteLead,
    restoreLead,
    refetch: fetchLeads,
    uniqueAssignees,
    uniqueLeadSources,
  }
}
