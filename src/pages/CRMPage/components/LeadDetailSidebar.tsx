import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, Building2, MapPin, Briefcase, Calendar, Link2, User, DollarSign, TrendingUp } from 'lucide-react'
import type { Lead } from '../types'

interface LeadDetailSidebarProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  if (!value) return null
  
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="p-1.5 bg-[#1f1f1f] rounded-md">
        <Icon size={14} className="text-[#888888]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#666666] mb-0.5">{label}</p>
        <p className="text-sm text-[#f0f0f0] truncate">{value}</p>
      </div>
    </div>
  )
}

function DetailLink({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: string | null | undefined; href: string }) {
  if (!value) return null
  
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="p-1.5 bg-[#1f1f1f] rounded-md">
        <Icon size={14} className="text-[#888888]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#666666] mb-0.5">{label}</p>
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 truncate block"
        >
          {value}
        </a>
      </div>
    </div>
  )
}

export default function LeadDetailSidebar({ lead, isOpen, onClose }: LeadDetailSidebarProps) {
  if (!lead) return null

  const location = [lead.company_hq_city, lead.company_hq_state, lead.company_hq_country]
    .filter(Boolean)
    .join(', ')

  const stageColors: Record<string, string> = {
    'new': 'bg-blue-500/20 text-blue-400',
    'contacted': 'bg-yellow-500/20 text-yellow-400',
    'qualified': 'bg-green-500/20 text-green-400',
    'meeting_booked': 'bg-emerald-700/20 text-emerald-400',
    'proposal_sent': 'bg-orange-500/20 text-orange-400',
    'negotiation': 'bg-pink-500/20 text-pink-400',
    'closed_won': 'bg-emerald-500/20 text-emerald-400',
    'closed_lost': 'bg-red-500/20 text-red-400',
  }

  const stageClass = stageColors[lead.stage || ''] || 'bg-[#2a2a2a] text-[#888888]'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[420px] max-w-full bg-[#141414] border-l border-[#2a2a2a] z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {(lead.full_name || lead.first_name || lead.email || 'L').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#f0f0f0]">
                    {lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead Details'}
                  </h2>
                  <p className="text-xs text-[#888888]">{lead.job_title || lead.company || 'No title'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <X size={18} className="text-[#888888]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Stage Badge */}
              {lead.stage && (
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stageClass}`}>
                    {lead.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="space-y-1">
                  <DetailRow icon={User} label="Full Name" value={lead.full_name} />
                  <DetailLink 
                    icon={Mail} 
                    label="Email" 
                    value={lead.email} 
                    href={`mailto:${lead.email}`} 
                  />
                  <DetailRow icon={Phone} label="Phone" value={lead.lead_phone} />
                  <DetailRow icon={Briefcase} label="Job Title" value={lead.job_title} />
                  <DetailLink 
                    icon={Link2} 
                    label="LinkedIn" 
                    value={lead.linkedin_url ? 'View Profile' : null}
                    href={lead.linkedin_url || ''} 
                  />
                </div>
              </div>

              {/* Company Info */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Company Information</h3>
                <div className="space-y-1">
                  <DetailRow icon={Building2} label="Company" value={lead.company} />
                  <DetailLink 
                    icon={Link2} 
                    label="Website" 
                    value={lead.company_website || lead.company_domain} 
                    href={lead.company_website || `https://${lead.company_domain}` || ''} 
                  />
                  <DetailRow icon={MapPin} label="Location" value={location || null} />
                  <DetailRow icon={TrendingUp} label="Industry" value={lead.industry} />
                  <DetailRow icon={DollarSign} label="Annual Revenue" value={lead.annual_revenue} />
                  <DetailRow icon={Building2} label="Company Size" value={lead.company_size} />
                </div>
              </div>

              {/* Pipeline Info */}
              {(lead.estimated_value || lead.meeting_date || lead.next_touchpoint) && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Pipeline</h3>
                  <div className="space-y-1">
                    {lead.estimated_value && (
                      <DetailRow 
                        icon={DollarSign} 
                        label="Estimated Value" 
                        value={`$${lead.estimated_value.toLocaleString()}`} 
                      />
                    )}
                    <DetailRow icon={Calendar} label="Meeting Date" value={lead.meeting_date} />
                    <DetailRow icon={Calendar} label="Next Touchpoint" value={lead.next_touchpoint} />
                  </div>
                </div>
              )}

              {/* Campaign Info */}
              {(lead.campaign_name || lead.lead_source) && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Source</h3>
                  <div className="space-y-1">
                    <DetailRow icon={TrendingUp} label="Campaign" value={lead.campaign_name} />
                    <DetailRow icon={TrendingUp} label="Lead Source" value={lead.lead_source} />
                  </div>
                </div>
              )}

              {/* Notes */}
              {(lead.notes || lead.context) && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Notes</h3>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                    <p className="text-sm text-[#d0d0d0] whitespace-pre-wrap">
                      {lead.notes || lead.context || 'No notes'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0f0f0f]">
              <div className="flex items-center justify-between text-xs text-[#666666]">
                <span>Created: {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</span>
                <span>Client: {lead.client}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
