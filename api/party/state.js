import { upstashStore } from './_store.js'
import { getState } from './_core.js'
import { send, sendError, ensureEnabled } from './_http.js'

export default async function handler(req, res) {
  if (!ensureEnabled(res)) return
  try {
    const code = String((req.query && req.query.code) || '').trim().toUpperCase()
    const state = await getState(upstashStore, code)
    send(res, 200, { ok: true, state })
  } catch (err) {
    sendError(res, err)
  }
}
