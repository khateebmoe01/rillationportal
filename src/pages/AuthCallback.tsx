import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/login?error=auth_failed')
          return
        }

        if (session?.user) {
          // Check if user has required metadata for portal access
          const role = session.user.user_metadata?.role || 'client'
          const client = session.user.user_metadata?.client

          // Portal requires client role with a client assigned
          if (role === 'client' && !client) {
            navigate('/login?error=no_client_assigned')
            return
          }

          // Redirect to CRM
          navigate('/crm')
        } else {
          navigate('/login')
        }
      } catch (err) {
        console.error('Error handling auth callback:', err)
        navigate('/login?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-rillation-bg">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-rillation-purple" />
        <p className="text-rillation-text-muted">Completing sign in...</p>
      </div>
    </div>
  )
}
