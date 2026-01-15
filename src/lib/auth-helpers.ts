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
