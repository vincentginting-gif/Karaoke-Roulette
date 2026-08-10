// ─────────────────────────────────────────────────────────────
//  useAuth – Auth-Zustand + Callback-Handling als React-Hook
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import {
  AuthError,
  clearTokens,
  handleCallback,
  isAuthCallback,
  isLoggedIn,
  login,
} from '../spotify/auth'

type AuthStatus = 'checking' | 'connected' | 'disconnected'

export interface UseAuth {
  status: AuthStatus
  error: string | null
  connect: () => void
  disconnect: () => void
  clearError: () => void
}

export function useAuth(): UseAuth {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      // Fall 1: Wir kommen gerade vom Spotify-Redirect zurueck.
      if (isAuthCallback()) {
        try {
          await handleCallback()
          if (!cancelled) setStatus('connected')
        } catch (e) {
          if (!cancelled) {
            setStatus('disconnected')
            setError(e instanceof AuthError ? e.message : 'Anmeldung fehlgeschlagen.')
          }
        } finally {
          // URL saeubern (Code aus der Adresszeile entfernen).
          window.history.replaceState({}, '', window.location.pathname === '/callback' ? '/' : window.location.pathname)
        }
        return
      }

      // Fall 2: Normaler Start – vorhandene Sitzung pruefen.
      if (!cancelled) setStatus(isLoggedIn() ? 'connected' : 'disconnected')
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [])

  const connect = useCallback(() => {
    setError(null)
    login().catch((e) => {
      setError(e instanceof AuthError ? e.message : 'Login konnte nicht gestartet werden.')
    })
  }, [])

  const disconnect = useCallback(() => {
    clearTokens()
    setStatus('disconnected')
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { status, error, connect, disconnect, clearError }
}
