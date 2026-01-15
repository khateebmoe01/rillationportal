import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/layout/Layout'
import ConfigError from './components/ui/ConfigError'
import CRMView from './pages/CRMView'
import DeepView from './pages/DeepView'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import ProtectedRoute from './components/auth/ProtectedRoute'
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
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Navigate to="/crm" replace />} />
                    <Route path="/crm" element={<PageTransition><CRMView /></PageTransition>} />
                    <Route path="/deep-insights" element={<PageTransition><DeepView /></PageTransition>} />
                    <Route path="/insights" element={<Navigate to="/deep-insights" replace />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default App
