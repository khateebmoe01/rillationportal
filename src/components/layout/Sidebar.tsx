import { NavLink, useLocation } from 'react-router-dom'
import { BarChart3, Users, Settings, TrendingUp, LayoutDashboard, DollarSign, CheckSquare } from 'lucide-react'

const CRM_SUBSECTIONS = [
  { path: '/crm', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/crm/contacts', icon: Users, label: 'Contacts' },
  { path: '/crm/deals', icon: DollarSign, label: 'Deals' },
  { path: '/crm/tasks', icon: CheckSquare, label: 'Tasks' },
]

const ANALYTICS_SUBSECTIONS = [
  { path: '/performance', icon: BarChart3, label: 'Performance' },
  { path: '/pipeline', icon: TrendingUp, label: 'Pipeline' },
]

const sections = [
  {
    id: 'crm',
    label: 'CRM',
    subsections: CRM_SUBSECTIONS,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    subsections: ANALYTICS_SUBSECTIONS,
  },
]

export default function Sidebar() {
  const location = useLocation()
  const isSettingsActive = location.pathname.startsWith('/settings')
  
  // Section header with line - Airtable style
  const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="text-lg font-bold text-white/90 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/20" />
    </div>
  )
  
  return (
    <aside className="w-48 fixed left-0 top-0 bg-rillation-card border-r border-rillation-border flex flex-col py-4 z-40" style={{ height: 'calc(100vh / 0.8)' }}>
      {/* Navigation Links */}
      <div className="flex flex-col">
        {sections.map((section, index) => (
          <div key={section.id} className={index > 0 ? 'mt-10' : ''}>
            {/* Section Header with Line */}
            <SectionHeader label={section.label} />
            
            {/* Subsections */}
            <div className="flex flex-col gap-3">
              {section.subsections.map((sub) => {
                const SubIcon = sub.icon
                const isSubActive = (sub as any).exact 
                  ? location.pathname === sub.path 
                  : location.pathname.startsWith(sub.path) && sub.path !== '/crm'
                
                return (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    className={`
                      mx-2 h-8 flex items-center gap-2.5 rounded-lg transition-all duration-200 px-3
                      ${isSubActive
                        ? 'bg-rillation-accent/20 text-rillation-accent'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <SubIcon size={16} className="flex-shrink-0" />
                    <span className="text-sm whitespace-nowrap">
                      {sub.label}
                    </span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Spacer to push settings to bottom */}
      <div className="flex-1" />
      
      {/* Settings Button */}
      <div className="mt-8">
        <NavLink
          to="/settings"
          className={`
            mx-2 h-9 flex items-center gap-2.5 rounded-lg transition-all duration-200 px-3
            ${isSettingsActive
              ? 'bg-rillation-accent/20 text-rillation-accent'
              : 'text-white/ hover:text-white hover:bg-white/5'
            }
          `}
        >
          <Settings size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            Settings
          </span>
        </NavLink>
      </div>
    </aside>
  )
}
