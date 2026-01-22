import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  
  if (configError) {
    return <ConfigError />
  }
  
  // Demo mode: No authentication required - all routes accessible
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/performance" replace />} />
        <Route path="/performance" element={<PageTransition><ClientDetailView /></PageTransition>} />
        <Route path="/pipeline" element={<PageTransition><PipelineView /></PageTransition>} />
        <Route path="/crm/*" element={<AtomicCRM />} />
        <Route path="/deep-insights" element={<PageTransition><DeepView /></PageTransition>} />
        <Route path="/insights" element={<Navigate to="/deep-insights" replace />} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
      </Routes>
    </Layout>
  )
}

export default App
