import { NavLink, useLocation } from 'react-router-dom'
import { BarChart3, Users, Settings } from 'lucide-react'

const sections = [
  {
    id: 'crm',
    icon: Users,
    label: 'CRM',
    path: '/crm',
  },
  {
    id: 'reporting',
    icon: BarChart3,
    label: 'Analytics',
    path: '/performance',
  },
]

export default function Sidebar() {
  const location = useLocation()
  const isSettingsActive = location.pathname.startsWith('/settings')
  
  return (
    <aside className="w-44 h-screen fixed left-0 top-0 bg-rillation-card border-r border-rillation-border flex flex-col py-4 z-40">
      {/* Navigation Links */}
      <div className="flex flex-col gap-2">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = section.id === 'crm'
            ? location.pathname.startsWith('/crm')
            : section.id === 'reporting'
              ? location.pathname.startsWith('/performance') || location.pathname.startsWith('/pipeline')
              : false
          
          return (
            <NavLink
              key={section.id}
              to={section.path}
              className={`
                mx-2 h-12 flex items-center gap-3 rounded-xl transition-all duration-200 px-3
                ${isActive
                  ? 'bg-rillation-card-hover border border-rillation-border text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon size={22} className="flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">
                {section.label}
              </span>
            </NavLink>
          )
        })}
      </div>
      
      {/* Spacer to push settings to bottom */}
      <div className="flex-1" />
      
      {/* Settings Button */}
      <div className="pt-2 border-t border-rillation-border/50">
        <NavLink
          to="/settings"
          className={`
            mx-2 h-12 flex items-center gap-3 rounded-xl transition-all duration-200 px-3
            ${isSettingsActive
              ? 'bg-rillation-card-hover border border-rillation-border text-white'
              : 'text-white/80 hover:text-white hover:bg-white/5'
            }
          `}
        >
          <Settings size={22} className="flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            Settings
          </span>
        </NavLink>
      </div>
    </aside>
  )
}
