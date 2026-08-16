// In-Memory-Store mit derselben Schnittstelle wie der Upstash-Store.
// Für Unit-Tests UND den lokalen Full-Stack-Party-Server (E2E).
export function createMemStore() {
  const strings = new Map() // key -> string
  const lists = new Map() // key -> string[]
  const expiry = new Map() // key -> timestamp (ms) – rein informativ, kein echtes GC

  return {
    async get(k) {
      return strings.has(k) ? strings.get(k) : null
    },
    async set(k, v, ttl) {
      strings.set(k, String(v))
      if (ttl) expiry.set(k, Date.now() + ttl * 1000)
    },
    async del(k) {
      strings.delete(k)
      lists.delete(k)
    },
    async rpush(k, v) {
      const arr = lists.get(k) || []
      arr.push(String(v))
      lists.set(k, arr)
      return arr.length
    },
    async lrange(k) {
      return (lists.get(k) || []).slice()
    },
    async lrem(k, count, v) {
      const arr = lists.get(k) || []
      let removed = 0
      const limit = count === 0 ? Infinity : Math.abs(count)
      const out = []
      for (const item of arr) {
        if (item === String(v) && removed < limit) {
          removed++
          continue
        }
        out.push(item)
      }
      lists.set(k, out)
      return removed
    },
    async expire(k, ttl) {
      if (strings.has(k) || lists.has(k)) expiry.set(k, Date.now() + ttl * 1000)
    },
  }
}
