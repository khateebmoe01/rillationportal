import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/layout/Layout'
import ConfigError from './components/ui/ConfigError'
import AtomicCRM from './pages/AtomicCRM'
import ClientDetailView from './pages/ClientDetailView'
import DeepView from './pages/DeepView'
import PipelineView from './pages/PipelineView'
import SettingsPage from './pages/SettingsPage'
import { getSupabaseConfigError } from './lib/supabase'

// Page transition wrapper component
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}

function App() {
  const configError = getSupabaseConfigError()
  const location = useLocation()
  
  if (configError) {
    return <ConfigError />
  }
  
  // Demo mode: No authentication required - all routes accessible
  return (
    <AnimatePresence mode="wait">
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/performance" replace />} />
            <Route path="/performance" element={<PageTransition><ClientDetailView /></PageTransition>} />
            <Route path="/pipeline" element={<PageTransition><PipelineView /></PageTransition>} />
            <Route path="/crm/*" element={<AtomicCRM />} />
            <Route path="/deep-insights" element={<PageTransition><DeepView /></PageTransition>} />
            <Route path="/insights" element={<Navigate to="/deep-insights" replace />} />
            <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </AnimatePresence>
  )
}

export default App
