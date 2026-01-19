import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Users, LogOut, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import InviteUserModal from '../ui/InviteUserModal'

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
  // Deep Insights hidden for now
  // {
  //   id: 'insights',
  //   icon: Sparkles,
  //   label: 'Deep Insights',
  //   path: '/deep-insights',
  // },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, client } = useAuth()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  
  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }
  
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
              : section.id === 'insights'
                ? location.pathname.startsWith('/deep-insights') || location.pathname.startsWith('/insights')
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
      
      {/* Spacer to push buttons to bottom */}
      <div className="flex-1" />
      
      {/* Bottom Actions */}
      <div className="pt-2 border-t border-rillation-border/50 space-y-1">
        {/* Invite User Button - Only show if user has a client */}
        {client && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="mx-2 h-12 w-[calc(100%-16px)] flex items-center gap-3 rounded-xl transition-all duration-200 px-3 text-white/80 hover:text-white hover:bg-white/5"
          >
            <UserPlus size={22} className="flex-shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">
              Invite User
            </span>
          </button>
        )}
        
        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="mx-2 h-12 w-[calc(100%-16px)] flex items-center gap-3 rounded-xl transition-all duration-200 px-3 text-white/80 hover:text-white hover:bg-white/5"
        >
          <LogOut size={22} className="flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            Sign Out
          </span>
        </button>
      </div>
      
      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </aside>
  )
}
