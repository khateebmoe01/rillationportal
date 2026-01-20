/**
 * Authentication helpers for client portal
 * These functions help distinguish this app from the internal hub
 */

/**
 * Get the app identifier for OAuth
 * Used to distinguish between internal hub and client portal
 */
export function getAppIdentifier(): string {
  return 'portal'
}

/**
 * Check if current app is the client portal
 */
export function isClientPortal(): boolean {
  return getAppIdentifier() === 'portal'
}

/**
 * Get OAuth redirect URL for this app
 */
export function getOAuthRedirectUrl(): string {
  return `${window.location.origin}/auth/callback`
}

/**
 * Check if a user needs to set a password
 * Returns true if the user only has OAuth identities and no email/password identity
 */
export function userNeedsPassword(user: { identities?: Array<{ provider: string }> } | null): boolean {
  if (!user || !user.identities || user.identities.length === 0) {
    return false
  }

  // Check if user has an email/password identity
  const hasEmailPassword = user.identities.some(identity => identity.provider === 'email')
  
  // Check if user has any OAuth providers
  const hasOAuth = user.identities.some(identity => 
    ['google', 'github', 'azure', 'discord', 'facebook', 'apple'].includes(identity.provider)
  )

  // If user has OAuth but no email/password identity, they need to set a password
  return hasOAuth && !hasEmailPassword
}
