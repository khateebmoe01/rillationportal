import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { userNeedsPassword } from '../../lib/auth-helpers'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, client, role } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rillation-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-rillation-purple" />
          <p className="text-rillation-text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if OAuth user needs to set a password
  if (userNeedsPassword(user)) {
    return <Navigate to="/set-password" replace />
  }

  // Portal only allows client role users
  if (role !== 'client') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rillation-bg">
        <div className="max-w-md w-full bg-rillation-card rounded-lg shadow-lg p-8 border border-rillation-border">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-rillation-text mb-2">
              Access Denied
            </h1>
            <p className="text-rillation-text-muted">
              This portal is for client users only. Admin users should use the internal hub.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has a client assigned
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rillation-bg">
        <div className="max-w-md w-full bg-rillation-card rounded-lg shadow-lg p-8 border border-rillation-border">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-rillation-text mb-2">
              No Client Assigned
            </h1>
            <p className="text-rillation-text-muted">
              Your account does not have a client assigned. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
