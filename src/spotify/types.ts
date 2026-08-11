// ─────────────────────────────────────────────────────────────
//  Spotify Domain-Typen (nur was wir wirklich brauchen)
// ─────────────────────────────────────────────────────────────

/** Eine Playlist des Nutzers, reduziert auf die Felder der App. */
export interface Playlist {
  id: string
  name: string
  imageUrl: string | null
  trackCount: number
  ownerName: string
  /** Spotify-User-ID des Besitzers (z. B. "spotify" für Spotify-eigene Listen). */
  ownerId: string
  /** true, wenn die Liste dem angemeldeten Nutzer gehört (via Web API ladbar). */
  isOwn: boolean
}

/** Ein Karaoke-Song. Das ist die zentrale Datenstruktur der App. */
export interface Track {
  id: string
  title: string
  artist: string
  /** Album-Cover-URL. Kann null sein (Fehlerfall "kein Cover"). */
  coverUrl: string | null
  /** Direkter Link zur Spotify-Track-Seite. */
  spotifyUrl: string
}

/** Aktueller Auth-Zustand (nur In-Memory + localStorage-Token). */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  /** Unix-Timestamp (ms), wann der accessToken abläuft. */
  expiresAt: number
}

// ── Roh-Antworten der Spotify Web API (nur relevante Felder) ──

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyRawPlaylist {
  id: string
  name: string
  images: SpotifyImage[] | null
  // Spotify liefert die Anzahl je nach API-Antwort unter "tracks" ODER "items".
  tracks?: { total: number }
  items?: { total: number }
  owner: { display_name: string | null; id: string }
}

export interface SpotifyRawTrack {
  id: string | null
  name: string
  artists: { name: string }[]
  album: { images: SpotifyImage[] | null }
  external_urls: { spotify?: string }
  is_local?: boolean
  type?: string
  /** Beliebtheit 0–100 (bei Such-Ergebnissen vorhanden). */
  popularity?: number
}

export interface SpotifyPagingResponse<T> {
  items: T[]
  next: string | null
  total: number
}

/** Antwort des /search-Endpoints (nur Track-Teil). */
export interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyRawTrack[]
    next: string | null
    total: number
  }
}
