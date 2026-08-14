// ─────────────────────────────────────────────────────────────
//  Album-Cover ohne Login – über die iTunes Search API.
//
//  Keyless, CORS-fähig, kostenlos. Wird im Offline-Modus genutzt,
//  um zu eingetippten Songs echte Album-Cover zu laden (Platzhalter,
//  bis sie da sind). Ergebnisse werden gecacht (Speicher + localStorage).
// ─────────────────────────────────────────────────────────────

const CACHE_KEY = 'kr.covers.cache'

function loadCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Record<string, string>
  } catch {
    return {}
  }
}

let mem: Record<string, string> = loadCache()

function persist(): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(mem))
  } catch {
    /* Speicher voll o. ä. – Cache bleibt wenigstens im Speicher. */
  }
}

function keyOf(title: string, artist: string): string {
  return `${title}|${artist}`.toLowerCase().trim()
}

/** Bereits gecachtes Cover (synchron), falls vorhanden. */
export function cachedCover(title: string, artist: string): string | undefined {
  return mem[keyOf(title, artist)]
}

/** Direkter iTunes-Aufruf (Fallback, wenn der eigene Proxy nicht da ist). */
async function fetchCoverDirect(title: string, artist: string): Promise<string | null> {
  const term = encodeURIComponent(`${title} ${artist}`.trim())
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=1`)
    if (!res.ok) return null
    const data = (await res.json()) as { results?: { artworkUrl100?: string }[] }
    const art = data.results?.[0]?.artworkUrl100
    if (!art) return null
    return art.replace('100x100bb', '600x600bb')
  } catch {
    return null
  }
}

/**
 * Lädt das Album-Cover zu „Titel + Interpret".
 * Zuerst über den eigenen Proxy (/api/cover, gleiche Origin – robust gegen
 * CORS/Adblocker/Regionssperren); fällt bei fehlendem Proxy (z. B. lokaler
 * Dev-Server ohne Vercel-Funktionen) auf den direkten iTunes-Aufruf zurück.
 * Ergebnis wird gecacht. Fehlertolerant (nie throw).
 */
export async function fetchCover(title: string, artist: string): Promise<string | null> {
  const k = keyOf(title, artist)
  if (mem[k]) return mem[k]

  let cover: string | null = null
  try {
    const res = await fetch(
      `/api/cover?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
    )
    if (res.ok) {
      // Proxy hat geantwortet -> Ergebnis übernehmen (auch null = nichts gefunden).
      const data = (await res.json()) as { cover?: string | null }
      cover = data.cover ?? null
    } else {
      // Proxy nicht verfügbar (404 o. ä.) -> direkt bei iTunes versuchen.
      cover = await fetchCoverDirect(title, artist)
    }
  } catch {
    // Netzwerkfehler beim Proxy -> direkter Versuch.
    cover = await fetchCoverDirect(title, artist)
  }

  if (cover) {
    mem[k] = cover
    persist()
  }
  return cover
}

/**
 * Lädt Cover für viele Songs mit begrenzter Nebenläufigkeit (schont die API).
 * Ruft onCover(id, url) für jeden gefundenen Treffer auf.
 */
export async function prefetchCovers(
  items: { id: string; title: string; artist: string }[],
  onCover: (id: string, url: string) => void,
  concurrency = 5,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  let next = 0
  let done = 0
  async function worker() {
    while (next < items.length) {
      const it = items[next++]
      const url = await fetchCover(it.title, it.artist)
      if (url) onCover(it.id, url)
      done++
      onProgress?.(done, items.length)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
}
