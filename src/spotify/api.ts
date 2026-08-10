// ─────────────────────────────────────────────────────────────
//  Spotify Web API – Datenzugriff (Playlists & Tracks)
//
//  Kapselt alle HTTP-Aufrufe. Gibt saubere Domain-Objekte zurueck.
// ─────────────────────────────────────────────────────────────

import { clearTokens, getValidAccessToken } from './auth'
import type {
  Playlist,
  SpotifyPagingResponse,
  SpotifyRawPlaylist,
  SpotifyRawTrack,
  Track,
} from './types'

const API_BASE = 'https://api.spotify.com/v1'

/** Fehlerklasse fuer API-Probleme, damit die UI sie klar behandeln kann. */
export class ApiError extends Error {
  constructor(
    message: string,
    /** true, wenn die Sitzung ungueltig ist und ein neuer Login noetig ist. */
    public readonly needsReauth = false,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Kleiner Fetch-Wrapper mit Auth-Header und einheitlichem Error-Handling. */
async function apiFetch<T>(path: string): Promise<T> {
  let token: string
  try {
    token = await getValidAccessToken()
  } catch {
    throw new ApiError('Nicht mit Spotify verbunden.', true)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new ApiError('Netzwerkfehler bei der Verbindung zu Spotify.')
  }

  if (res.status === 401) {
    // Token doch ungueltig -> Sitzung verwerfen.
    clearTokens()
    throw new ApiError('Sitzung abgelaufen. Bitte erneut mit Spotify verbinden.', true)
  }

  if (res.status === 429) {
    throw new ApiError('Zu viele Anfragen an Spotify. Bitte kurz warten und erneut versuchen.')
  }

  if (!res.ok) {
    throw new ApiError(`Spotify-Anfrage fehlgeschlagen (Status ${res.status}).`)
  }

  return (await res.json()) as T
}

/** Waehlt das erste (groesste) Bild aus einer Spotify-Image-Liste. */
function firstImageUrl(images: { url: string }[] | null | undefined): string | null {
  return images && images.length > 0 ? images[0].url : null
}

// ── Playlists laden ──────────────────────────────────────────

/**
 * Laedt alle Playlists des angemeldeten Nutzers (mit Pagination).
 */
export async function fetchPlaylists(): Promise<Playlist[]> {
  const playlists: Playlist[] = []
  let url: string | null = '/me/playlists?limit=50'

  while (url) {
    const page: SpotifyPagingResponse<SpotifyRawPlaylist> = await apiFetch(url)

    for (const raw of page.items) {
      // Spotify kann in seltenen Faellen null-Eintraege liefern.
      if (!raw || !raw.id) continue
      playlists.push({
        id: raw.id,
        name: raw.name || 'Unbenannte Playlist',
        imageUrl: firstImageUrl(raw.images),
        trackCount: raw.tracks?.total ?? 0,
        ownerName: raw.owner?.display_name ?? '',
      })
    }

    // "next" ist eine volle URL -> auf den Pfad reduzieren.
    url = page.next ? page.next.replace(API_BASE, '') : null
  }

  return playlists
}

// ── Tracks einer Playlist laden ──────────────────────────────

interface PlaylistItem {
  track: SpotifyRawTrack | null
}

/**
 * Laedt alle spielbaren Tracks einer Playlist (mit Pagination).
 * Filtert lokale Dateien und ungueltige Eintraege heraus.
 */
export async function fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
  const tracks: Track[] = []
  // Nur die benoetigten Felder anfordern (schneller, weniger Daten).
  const fields =
    'items(track(id,name,artists(name),album(images),external_urls,is_local,type)),next'
  let url: string | null =
    `/playlists/${playlistId}/tracks?limit=100&fields=${encodeURIComponent(fields)}`

  while (url) {
    const page: SpotifyPagingResponse<PlaylistItem> = await apiFetch(url)

    for (const item of page.items) {
      const t = item?.track
      // Ungueltige, lokale oder nicht abspielbare Eintraege ueberspringen.
      if (!t || !t.id || t.is_local || t.type === 'episode') continue

      const spotifyUrl =
        t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`

      tracks.push({
        id: t.id,
        title: t.name || 'Unbekannter Titel',
        artist: t.artists?.map((a) => a.name).filter(Boolean).join(', ') || 'Unbekannter Artist',
        coverUrl: firstImageUrl(t.album?.images),
        spotifyUrl,
      })
    }

    url = page.next ? page.next.replace(API_BASE, '') : null
  }

  return tracks
}
