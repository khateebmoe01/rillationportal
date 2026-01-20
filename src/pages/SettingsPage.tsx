import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  LogOut, 
  Mail, 
  Loader2, 
  UserPlus, 
  CheckCircle, 
  Trash2, 
  Clock,
  Link2,
  Link2Off,
  Settings,
  AlertCircle
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface InvitedUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  confirmed: boolean
  invited_by: string | null
}

interface CalendlyIntegration {
  id: string
  client: string
  calendly_user_email: string | null
  connected_at: string
}

// Calendly OAuth config
const CALENDLY_CLIENT_ID = import.meta.env.VITE_CALENDLY_CLIENT_ID
const CALENDLY_REDIRECT_URI = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendly-oauth-callback`

export default function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { signOut, client, session, user } = useAuth()
  
  // Users state
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [users, setUsers] = useState<InvitedUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Calendly state
  const [calendlyIntegration, setCalendlyIntegration] = useState<CalendlyIntegration | null>(null)
  const [loadingCalendly, setLoadingCalendly] = useState(true)
  const [calendlyError, setCalendlyError] = useState<string | null>(null)
  const [calendlySuccess, setCalendlySuccess] = useState(false)
  const [disconnectingCalendly, setDisconnectingCalendly] = useState(false)

  // Check for OAuth callback params
  useEffect(() => {
    const connected = searchParams.get('calendly_connected')
    const error = searchParams.get('calendly_error')
    
    if (connected === 'true') {
      setCalendlySuccess(true)
      setTimeout(() => setCalendlySuccess(false), 5000)
      // Clear params from URL
      searchParams.delete('calendly_connected')
      setSearchParams(searchParams, { replace: true })
    }
    
    if (error) {
      const errorMessages: Record<string, string> = {
        'missing_params': 'Missing OAuth parameters',
        'invalid_state': 'Invalid OAuth state',
        'token_exchange_failed': 'Failed to connect to Calendly',
        'user_fetch_failed': 'Failed to get Calendly user info',
        'db_error': 'Failed to save connection',
        'unexpected': 'An unexpected error occurred',
      }
      setCalendlyError(errorMessages[error] || error)
      setTimeout(() => setCalendlyError(null), 5000)
      // Clear params from URL
      searchParams.delete('calendly_error')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // Fetch Calendly integration status
  const fetchCalendlyIntegration = useCallback(async () => {
    if (!client) return
    setLoadingCalendly(true)
    try {
      const { data, error } = await supabase
        .from('calendly_integrations')
        .select('id, client, calendly_user_email, connected_at')
        .eq('client', client)
        .maybeSingle()
      
      if (error) {
        console.error('Error fetching Calendly integration:', error)
      } else {
        setCalendlyIntegration(data)
      }
    } catch (err) {
      console.error('Failed to fetch Calendly integration:', err)
    } finally {
      setLoadingCalendly(false)
    }
  }, [client])

  const fetchUsers = useCallback(async () => {
    if (!session) return
    setLoadingUsers(true)
    setLoadingError(null)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-users`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
        setLoadingError(null)
      } else {
        setLoadingError(data.error || 'Failed to load users')
        setUsers([])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setLoadingError(err instanceof Error ? err.message : 'Load failed')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }, [session])

  useEffect(() => {
    fetchUsers()
    fetchCalendlyIntegration()
  }, [fetchUsers, fetchCalendlyIntegration])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !session) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      setSuccess(true)
      setEmail('')
      fetchUsers() // Refresh user list
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!session) return
    setDeletingId(userId)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      )
      const data = await response.json()
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
      } else {
        setError(data.error || 'Failed to delete user')
      }
    } catch (err) {
      setError('Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  // Calendly OAuth functions
  const handleConnectCalendly = () => {
    if (!client || !user) return
    
    // Create state parameter with client info
    const state = btoa(JSON.stringify({ client, user_id: user.id }))
    
    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: CALENDLY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: CALENDLY_REDIRECT_URI,
      state,
    })
    
    window.location.href = `https://auth.calendly.com/oauth/authorize?${params.toString()}`
  }

  const handleDisconnectCalendly = async () => {
    if (!session) return
    
    setDisconnectingCalendly(true)
    setCalendlyError(null)
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendly-disconnect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )
      
      const data = await response.json()
      
      if (response.ok) {
        setCalendlyIntegration(null)
        setCalendlySuccess(true)
        setTimeout(() => setCalendlySuccess(false), 3000)
      } else {
        setCalendlyError(data.error || 'Failed to disconnect')
      }
    } catch (err) {
      setCalendlyError('Failed to disconnect Calendly')
    } finally {
      setDisconnectingCalendly(false)
    }
  }

  const pendingUsers = users.filter(u => !u.last_sign_in_at)
  const activeUsers = users.filter(u => u.last_sign_in_at)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-rillation-green/20 flex items-center justify-center">
              <Settings size={24} className="text-rillation-green" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-rillation-text">Settings</h1>
              <p className="text-sm text-rillation-text-muted">
                {client ? `${client} Portal` : 'Manage your portal settings'}
              </p>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-rillation-card border border-rillation-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-rillation-border flex items-center gap-3">
              <Users size={20} className="text-rillation-green" />
              <h2 className="text-lg font-semibold text-rillation-text">Users</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Invite Form */}
              <div>
                <h3 className="text-sm font-medium text-rillation-text mb-3 flex items-center gap-2">
                  <UserPlus size={16} />
                  Invite New User
                </h3>
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Invitation sent successfully!
                  </motion.div>
                )}

                {error && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleInvite} className="flex gap-3">
                  <div className="relative flex-1">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-rillation-text-muted"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-rillation-bg border border-rillation-border rounded-lg text-rillation-text focus:outline-none focus:ring-2 focus:ring-rillation-green focus:border-transparent"
                      placeholder="colleague@company.com"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="bg-rillation-green hover:bg-rillation-green/90 text-white font-medium py-2.5 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Invite
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* User Lists */}
              <div className="border-t border-rillation-border pt-6">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-rillation-green" />
                  </div>
                ) : loadingError ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
                    {loadingError}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-rillation-text-muted">
                    No users found. Invite someone to get started!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingUsers.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-rillation-text-muted mb-3 flex items-center gap-2">
                          <Clock size={14} />
                          Pending Invitations ({pendingUsers.length})
                        </h3>
                        <div className="space-y-2">
                          {pendingUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 bg-rillation-bg rounded-lg border border-rillation-border"
                            >
                              <div>
                                <p className="text-sm text-rillation-text">{user.email}</p>
                                <p className="text-xs text-rillation-text-muted">
                                  Invited {new Date(user.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deletingId === user.id}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete invitation"
                              >
                                {deletingId === user.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeUsers.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-rillation-text-muted mb-3 flex items-center gap-2">
                          <CheckCircle size={14} />
                          Active Users ({activeUsers.length})
                        </h3>
                        <div className="space-y-2">
                          {activeUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 bg-rillation-bg rounded-lg border border-rillation-border"
                            >
                              <div>
                                <p className="text-sm text-rillation-text">{user.email}</p>
                                <p className="text-xs text-rillation-text-muted">
                                  Last active {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deletingId === user.id}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete user"
                              >
                                {deletingId === user.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Calendly Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-rillation-card border border-rillation-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-rillation-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-rillation-green" />
                <h2 className="text-lg font-semibold text-rillation-text">Calendly</h2>
              </div>
              {calendlyIntegration && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} />
                  Connected
                </span>
              )}
            </div>
            
            <div className="p-6">
              {/* Success/Error Messages */}
              {calendlySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 text-sm flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  {calendlyIntegration ? 'Calendly connected successfully!' : 'Calendly disconnected successfully!'}
                </motion.div>
              )}
              
              {calendlyError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm flex items-center gap-2"
                >
                  <AlertCircle size={16} />
                  {calendlyError}
                </motion.div>
              )}

              {loadingCalendly ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-rillation-green" />
                </div>
              ) : calendlyIntegration ? (
                // Connected state
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-rillation-bg rounded-lg border border-rillation-border">
                    <div className="w-10 h-10 rounded-full bg-rillation-green/20 flex items-center justify-center">
                      <Calendar size={20} className="text-rillation-green" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-rillation-text">
                        {calendlyIntegration.calendly_user_email || 'Calendly Account'}
                      </p>
                      <p className="text-xs text-rillation-text-muted">
                        Connected {new Date(calendlyIntegration.connected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-rillation-text-muted">
                    Meetings booked through Calendly will automatically update leads in your CRM with the correct meeting date and timezone.
                  </p>
                  
                  <button
                    onClick={handleDisconnectCalendly}
                    disabled={disconnectingCalendly}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {disconnectingCalendly ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Link2Off size={16} />
                    )}
                    Disconnect Calendly
                  </button>
                </div>
              ) : (
                // Not connected state
                <div className="space-y-4">
                  <p className="text-sm text-rillation-text-muted">
                    Connect your Calendly account to automatically sync meeting bookings with your CRM. When a meeting is booked:
                  </p>
                  
                  <ul className="text-sm text-rillation-text-muted space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Lead is updated to "Meeting Booked" status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Meeting date is filled with correct timezone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>New leads are created automatically if not in CRM</span>
                    </li>
                  </ul>
                  
                  {CALENDLY_CLIENT_ID ? (
                    <button
                      onClick={handleConnectCalendly}
                      className="inline-flex items-center gap-2 bg-rillation-green hover:bg-rillation-green/90 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
                    >
                      <Link2 size={18} />
                      Connect Calendly
                    </button>
                  ) : (
                    <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>Calendly integration requires configuration. Please contact support.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Sign Out Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-rillation-card border border-rillation-border rounded-2xl overflow-hidden">
            <div className="p-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
