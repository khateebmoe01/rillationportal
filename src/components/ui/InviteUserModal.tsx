import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader2, UserPlus, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const { client, session } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-md mx-4 bg-rillation-card border border-rillation-border rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-rillation-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rillation-purple/20 flex items-center justify-center">
                  <UserPlus size={20} className="text-rillation-purple" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-rillation-text">Invite User</h2>
                  <p className="text-sm text-rillation-text-muted">
                    {client ? `${client} Portal` : 'Client Portal'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-rillation-card-hover rounded-lg transition-colors"
              >
                <X size={20} className="text-rillation-text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-rillation-text mb-2">
                    Invitation Sent!
                  </h3>
                  <p className="text-sm text-rillation-text-muted">
                    The user will receive an email to join the portal.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-rillation-text-muted">
                    Send an invitation to give someone access to the {client || 'client'} portal.
                  </p>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="invite-email"
                      className="block text-sm font-medium text-rillation-text mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-rillation-text-muted"
                      />
                      <input
                        id="invite-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-rillation-bg border border-rillation-border rounded-lg text-rillation-text focus:outline-none focus:ring-2 focus:ring-rillation-purple focus:border-transparent"
                        placeholder="colleague@company.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full bg-rillation-purple hover:bg-rillation-purple/90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Send Invitation
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
