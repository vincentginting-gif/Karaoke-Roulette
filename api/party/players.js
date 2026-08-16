import { upstashStore } from './_store.js'
import { addPlayer, removePlayer } from './_core.js'
import { readBody, send, sendError, ensureEnabled } from './_http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' })
  if (!ensureEnabled(res)) return
  try {
    const body = await readBody(req)
    const code = String(body.code || '').trim().toUpperCase()
    const params = { ...body, code }
    const state =
      body.action === 'remove'
        ? await removePlayer(upstashStore, params)
        : await addPlayer(upstashStore, params)
    send(res, 200, { ok: true, state })
  } catch (err) {
    sendError(res, err)
  }
}
