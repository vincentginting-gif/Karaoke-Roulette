// ─────────────────────────────────────────────────────────────
//  Gast-Modus – rollen ohne Spotify-Login.
//
//  Zwei Quellen (in dieser Reihenfolge probiert):
//   1. Live-Proxy:  /api/guest-playlist?id=<VITE_GUEST_PLAYLIST_ID>
//      (Vercel-Funktion mit Client-Credentials; immer aktuell)
//   2. Snapshot:    /guest-playlist.json  (statische Datei; zuverlässig)
//
//  Ist keine Quelle vorhanden/erreichbar, ist der Gast-Modus einfach aus.
// ─────────────────────────────────────────────────────────────

import type { Track } from '../spotify/types'

export interface GuestPlaylist {
  name: string
  tracks: Track[]
}

/** Synthetische Playlist-ID für den Gast-Modus. */
export const GUEST_ID = 'guest'

const LIVE_ID = import.meta.env.VITE_GUEST_PLAYLIST_ID as string | undefined

// undefined = noch nicht versucht, null = keine Quelle verfügbar.
let cached: GuestPlaylist | null | undefined

function normalize(data: unknown): GuestPlaylist | null {
  const d = data as { name?: string; tracks?: Track[] } | null
  if (d && Array.isArray(d.tracks) && d.tracks.length > 0) {
    return { name: d.name || 'Karaoke', tracks: d.tracks }
  }
  return null
}

async function tryLive(): Promise<GuestPlaylist | null> {
  if (!LIVE_ID) return null
  try {
    const res = await fetch(`/api/guest-playlist?id=${encodeURIComponent(LIVE_ID)}`)
    if (!res.ok) return null
    return normalize(await res.json())
  } catch {
    return null
  }
}

async function trySnapshot(): Promise<GuestPlaylist | null> {
  try {
    const res = await fetch('guest-playlist.json', { cache: 'no-cache' })
    if (!res.ok) return null
    return normalize(await res.json())
  } catch {
    return null
  }
}

/** Lädt die Gast-Playlist (Live bevorzugt, sonst Snapshot). Ergebnis wird gecacht. */
export async function loadGuestPlaylist(): Promise<GuestPlaylist | null> {
  if (cached !== undefined) return cached
  cached = (await tryLive()) ?? (await trySnapshot())
  return cached
}
