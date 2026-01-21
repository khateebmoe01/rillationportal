import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

// Demo mode: No authentication required - always allow access
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>
}
