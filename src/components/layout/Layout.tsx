import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import TabNavigation from './TabNavigation'
import AICopilotPanel from '../insights/AICopilotPanel'
import { useAI } from '../../contexts/AIContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isPanelOpen, panelWidth } = useAI()
  const isCRMPage = location.pathname.startsWith('/crm')
  const isReportingPage = location.pathname.startsWith('/performance') || location.pathname.startsWith('/pipeline')
  
  return (
    <div className="min-h-screen">
      {/* Top border separator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-rillation-border z-50" />
      
      {/* AI Co-Pilot Panel - Available on all pages */}
      <AICopilotPanel />
      
      {/* Spacer that expands when AI panel is open */}
      <motion.div
        className="fixed left-44 top-0 bottom-0"
        animate={{ width: isPanelOpen ? panelWidth : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      
      {/* Sidebar - Fixed position */}
      <Sidebar />
      
      {/* Main Content - Offset by sidebar width */}
      <div className="ml-44 flex flex-col h-screen">
        {/* Header - Hide for CRM (has its own header) */}
        {!isCRMPage && <Header />}

        {/* Tabs + filters for reporting */}
        {isReportingPage && <TabNavigation />}
        
        {/* Page Content */}
        <main className={`flex-1 ${isCRMPage ? 'overflow-hidden p-0' : 'overflow-auto p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
