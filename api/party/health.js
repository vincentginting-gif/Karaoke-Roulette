import { isConfigured } from './_store.js'
import { send } from './_http.js'

export default function handler(_req, res) {
  send(res, 200, { ok: true, enabled: isConfigured() })
}
