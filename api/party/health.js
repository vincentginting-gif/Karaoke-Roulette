import { isConfigured } from './_store.js'
import { send } from './_http.js'

export default function handler(_req, res) {
  // Diagnose: NUR die Namen passender Env-Vars (keine Werte/Secrets),
  // damit sichtbar wird, wie die Upstash-/KV-Integration sie eingetragen hat.
  const vars = Object.keys(process.env)
    .filter((k) => /UPSTASH|KV_|REDIS/i.test(k))
    .sort()
  send(res, 200, { ok: true, enabled: isConfigured(), vars })
}
