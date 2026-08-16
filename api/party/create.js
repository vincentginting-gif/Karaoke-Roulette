import { upstashStore } from './_store.js'
import { createRoom } from './_core.js'
import { readBody, send, sendError, ensureEnabled } from './_http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' })
  if (!ensureEnabled(res)) return
  try {
    const body = await readBody(req)
    const result = await createRoom(upstashStore, body)
    send(res, 200, { ok: true, ...result })
  } catch (err) {
    sendError(res, err)
  }
}
