// ─────────────────────────────────────────────────────────────
//  Spotify Authentifizierung – Authorization Code Flow mit PKCE
//
//  Komplett client-seitig, kein Backend, kein Client Secret.
//  Docs: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
// ─────────────────────────────────────────────────────────────

import type { AuthTokens } from './types'

const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

// Scopes: nur Lesezugriff auf die Playlists des Nutzers.
const SCOPES = ['playlist-read-private', 'playlist-read-collaborative']

const STORAGE_KEYS = {
  tokens: 'kr.auth.tokens',
  verifier: 'kr.auth.pkce_verifier',
} as const

/** Eigene Fehlerklasse, damit die UI Auth-Fehler klar behandeln kann. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

function getClientId(): string {
  const id = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  if (!id || id === 'hier_deine_client_id_eintragen') {
    throw new AuthError(
      'Keine Spotify Client-ID konfiguriert. Bitte VITE_SPOTIFY_CLIENT_ID in der .env setzen.',
    )
  }
  return id
}

/** true, wenn eine Client-ID konfiguriert ist (fuer Setup-Hinweise in der UI). */
export function isConfigured(): boolean {
  const id = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  return Boolean(id) && id !== 'hier_deine_client_id_eintragen'
}

function getRedirectUri(): string {
  const fromEnv = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
  if (fromEnv) return fromEnv
  // Fallback: aktuelle Origin + /callback
  return `${window.location.origin}/callback`
}

// ── PKCE Helfer ──────────────────────────────────────────────

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.-~'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values, (v) => chars[v % chars.length]).join('')
}

async function sha256(input: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode(input)
  return crypto.subtle.digest('SHA-256', data)
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// ── Token-Persistenz ─────────────────────────────────────────

function saveTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens))
}

export function loadTokens(): AuthTokens | null {
  const raw = localStorage.getItem(STORAGE_KEYS.tokens)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.tokens)
  localStorage.removeItem(STORAGE_KEYS.verifier)
}

export function isLoggedIn(): boolean {
  return loadTokens() !== null
}

// ── Login: Redirect zu Spotify ───────────────────────────────

/**
 * Startet den Login-Flow: erzeugt PKCE-Verifier/Challenge und
 * leitet zum Spotify-Consent-Screen weiter.
 */
export async function login(): Promise<void> {
  const clientId = getClientId()
  const verifier = randomString(64)
  const challenge = base64UrlEncode(await sha256(verifier))

  // Verifier fuer den Callback zwischenspeichern.
  localStorage.setItem(STORAGE_KEYS.verifier, verifier)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`
}

// ── Callback: Code gegen Token tauschen ──────────────────────

/**
 * Prueft, ob die aktuelle URL ein OAuth-Callback ist
 * (enthaelt ?code=... oder ?error=...).
 */
export function isAuthCallback(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.has('code') || params.has('error')
}

/**
 * Verarbeitet den OAuth-Callback: tauscht den Code gegen Tokens.
 * Wirft AuthError bei Fehlern. Nach Erfolg sind Tokens gespeichert.
 */
export async function handleCallback(): Promise<void> {
  const params = new URLSearchParams(window.location.search)

  const error = params.get('error')
  if (error) {
    throw new AuthError(`Spotify-Anmeldung abgebrochen oder fehlgeschlagen (${error}).`)
  }

  const code = params.get('code')
  if (!code) throw new AuthError('Kein Autorisierungs-Code von Spotify erhalten.')

  const verifier = localStorage.getItem(STORAGE_KEYS.verifier)
  if (!verifier) {
    throw new AuthError('PKCE-Verifier fehlt. Bitte den Login erneut starten.')
  }

  const body = new URLSearchParams({
    client_id: getClientId(),
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: verifier,
  })

  let res: Response
  try {
    res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  } catch {
    throw new AuthError('Netzwerkfehler beim Anmelden. Bitte Verbindung pruefen.')
  }

  if (!res.ok) {
    throw new AuthError('Token-Austausch mit Spotify fehlgeschlagen.')
  }

  const data = await res.json()
  saveTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  })

  localStorage.removeItem(STORAGE_KEYS.verifier)
}

// ── Token Refresh ────────────────────────────────────────────

/**
 * Liefert einen gueltigen Access-Token. Erneuert ihn bei Bedarf
 * automatisch ueber den Refresh-Token.
 * Wirft AuthError, wenn keine gueltige Sitzung (mehr) besteht.
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = loadTokens()
  if (!tokens) throw new AuthError('Nicht mit Spotify verbunden.')

  // 60s Puffer, damit ein Request nicht mitten im Ablauf scheitert.
  if (Date.now() < tokens.expiresAt - 60_000) {
    return tokens.accessToken
  }

  // Token abgelaufen -> refreshen.
  const body = new URLSearchParams({
    client_id: getClientId(),
    grant_type: 'refresh_token',
    refresh_token: tokens.refreshToken,
  })

  let res: Response
  try {
    res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  } catch {
    throw new AuthError('Netzwerkfehler beim Erneuern der Sitzung.')
  }

  if (!res.ok) {
    clearTokens()
    throw new AuthError('Sitzung abgelaufen. Bitte erneut mit Spotify verbinden.')
  }

  const data = await res.json()
  const refreshed: AuthTokens = {
    accessToken: data.access_token,
    // Spotify liefert nicht immer einen neuen Refresh-Token mit.
    refreshToken: data.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  saveTokens(refreshed)
  return refreshed.accessToken
}
