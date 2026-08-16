// Kleine Helfer für die Party-Endpunkte.
import { isConfigured } from './_store.js'

export function send(res, status, obj) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.status(status).json(obj)
}

/** Body robust lesen (Vercel parst JSON meist selbst; Fallback für Rohdaten). */
export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return {}
}

/** Sendet einen einheitlichen Fehler; nutzt err.status/err.code wenn vorhanden. */
export function sendError(res, err) {
  const status = err && err.status ? err.status : 500
  send(res, status, { ok: false, error: (err && err.code) || 'server_error' })
}

/** true, wenn der Party-Server eingerichtet ist – sonst 503 + false. */
export function ensureEnabled(res) {
  if (isConfigured()) return true
  send(res, 503, { ok: false, error: 'party_disabled', enabled: false })
  return false
}
