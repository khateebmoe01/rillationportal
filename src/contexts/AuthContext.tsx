import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<string | null>(null)
  const [role, setRole] = useState<'admin' | 'client' | null>(null)

  // Extract client and role from user metadata
  useEffect(() => {
    if (user?.user_metadata) {
      // Role: 'admin' or 'client' (defaults to 'client' for portal users)
      const userRole = user.user_metadata.role || 'client'
      setRole(userRole as 'admin' | 'client')
      
      // Client: only set for client role users
      if (userRole === 'client' && user.user_metadata.client) {
        setClient(user.user_metadata.client)
      } else {
        setClient(null)
      }
    } else {
      setClient(null)
      setRole(null)
    }
  }, [user])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'azure') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getOAuthRedirectUrl(),
        queryParams: {
          // Pass app identifier to distinguish portal vs internal hub
          // This helps with automatic role assignment in Edge Functions
          app: getAppIdentifier(),
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setClient(null)
    setRole(null)
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
