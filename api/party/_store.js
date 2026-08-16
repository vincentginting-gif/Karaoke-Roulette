// ─────────────────────────────────────────────────────────────
//  Upstash-Redis-Store (REST) für den Party-Modus.
//  Reine I/O-Schicht: GET/SET/RPUSH/LRANGE/LREM/EXPIRE über die
//  Upstash-REST-API. Die Zugangsdaten kommen aus den Env-Vars, die
//  die Vercel-Integration automatisch setzt – NICHTS davon im Frontend.
// ─────────────────────────────────────────────────────────────

// Je nach Vercel-/Upstash-Integration heißen die Zugangsdaten unterschiedlich –
// beide gängigen Varianten akzeptieren (Upstash-Marketplace bzw. Vercel-KV).
const URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

/** Ist der Party-Server überhaupt eingerichtet? (sonst Feature aus) */
export function isConfigured() {
  return Boolean(URL && TOKEN)
}

async function cmd(args) {
  const r = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`redis http ${r.status}`)
  const data = await r.json()
  if (data && data.error) throw new Error(data.error)
  return data ? data.result : null
}

/** Store-Interface (async). Dieselbe Form nutzt auch der Test-/Dev-Server. */
export const upstashStore = {
  get: (k) => cmd(['GET', k]),
  set: (k, v, ttl) => (ttl ? cmd(['SET', k, v, 'EX', String(ttl)]) : cmd(['SET', k, v])),
  del: (k) => cmd(['DEL', k]),
  rpush: (k, v) => cmd(['RPUSH', k, v]),
  lrange: (k) => cmd(['LRANGE', k, '0', '-1']),
  lrem: (k, count, v) => cmd(['LREM', k, String(count), v]),
  expire: (k, ttl) => cmd(['EXPIRE', k, String(ttl)]),
}
