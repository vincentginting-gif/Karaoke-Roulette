// ─────────────────────────────────────────────────────────────
//  Odesli / Songlink – plattformübergreifende Links zu einem Song.
//  Die App bleibt Spotify-basiert; hiermit lässt sich derselbe Song
//  auf Apple Music, YouTube Music, Deezer u. a. öffnen.
// ─────────────────────────────────────────────────────────────

export interface PlatformLink {
  key: string
  label: string
  url: string
}

/** Gewünschte Plattformen (Schlüssel = Odesli linksByPlatform, in Reihenfolge). */
const WANTED: { key: string; label: string }[] = [
  { key: 'appleMusic', label: 'Apple Music' },
  { key: 'youtubeMusic', label: 'YouTube Music' },
  { key: 'deezer', label: 'Deezer' },
  { key: 'tidal', label: 'Tidal' },
  { key: 'amazonMusic', label: 'Amazon Music' },
]

/**
 * Universelle Odesli-Seite für einen Spotify-Track. Braucht keinen API-Call
 * und funktioniert immer – die Seite listet alle Plattformen (inkl. Apple
 * Music & YouTube Music) zum Antippen.
 */
export function songlinkPageUrl(spotifyTrackId: string): string {
  return `https://song.link/s/${spotifyTrackId}`
}

const cache = new Map<string, PlatformLink[]>()

interface OdesliResponse {
  linksByPlatform?: Record<string, { url?: string }>
}

/**
 * Holt direkte Deep-Links zu anderen Plattformen (Best Effort). Wirft bei
 * Netzwerk-/CORS-Fehlern – Aufrufer sollen das abfangen und still auf die
 * universelle Odesli-Seite zurückfallen.
 */
export async function fetchPlatformLinks(spotifyUrl: string): Promise<PlatformLink[]> {
  const cached = cache.get(spotifyUrl)
  if (cached) return cached

  const api = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}&songIfSingle=true`
  const res = await fetch(api)
  if (!res.ok) throw new Error(`Odesli ${res.status}`)
  const data = (await res.json()) as OdesliResponse
  const byPlatform = data.linksByPlatform ?? {}

  const links: PlatformLink[] = []
  for (const w of WANTED) {
    const url = byPlatform[w.key]?.url
    if (url) links.push({ key: w.key, label: w.label, url })
  }
  cache.set(spotifyUrl, links)
  return links
}
