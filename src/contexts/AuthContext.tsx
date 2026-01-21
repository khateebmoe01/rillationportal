import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getAppIdentifier, getOAuthRedirectUrl } from '../lib/auth-helpers'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  client: string | null // Client extracted from user metadata
  role: 'admin' | 'client' | null // User role
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithOAuth: (provider: 'google' | 'github' | 'azure') => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for demo/development mode (no auth required)
const MOCK_USER: User = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {
    role: 'client',
    client: 'Rillation Revenue', // Default client for demo
  },
  identities: [],
  confirmed_at: new Date().toISOString(),
} as User

const MOCK_SESSION: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: MOCK_USER,
} as Session

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always use mock user for demo mode - no authentication required
  const [user] = useState<User | null>(MOCK_USER)
  const [session] = useState<Session | null>(MOCK_SESSION)
  const [loading] = useState(false) // No loading needed in demo mode
  const [client] = useState<string | null>('Rillation Revenue')
  const [role] = useState<'admin' | 'client' | null>('client')

  // No auth initialization needed - using mock user

  // Stub auth methods for demo mode (no-op)
  const signIn = async (email: string, password: string) => {
    console.log('Demo mode: Sign in stubbed')
    return { error: null }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'azure') => {
    console.log('Demo mode: OAuth sign in stubbed')
    return { error: null }
  }

  const signOut = async () => {
    console.log('Demo mode: Sign out stubbed')
    // No-op in demo mode
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        client,
        role,
        signIn,
        signInWithOAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
