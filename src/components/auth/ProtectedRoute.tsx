import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, client } = useAuth()

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
