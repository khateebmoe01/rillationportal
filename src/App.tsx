import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/layout/Layout'
import ConfigError from './components/ui/ConfigError'
import AtomicCRM from './pages/AtomicCRM'
import ClientDetailView from './pages/ClientDetailView'
import DeepView from './pages/DeepView'
import PipelineView from './pages/PipelineView'
import SettingsPage from './pages/SettingsPage'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import SetPassword from './pages/SetPassword'
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
  const navigate = useNavigate()

  // Check for recovery/password reset links in hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1))
      const type = hashParams.get('type')
      const accessToken = hashParams.get('access_token')
      
      if (type === 'recovery' && accessToken) {
        // Redirect to set-password page for recovery flows
        navigate('/set-password' + hash)
      }
    }
  }, [navigate])
  
  if (configError) {
    return <ConfigError />
  }
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/set-password" element={<SetPassword />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
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
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default App
