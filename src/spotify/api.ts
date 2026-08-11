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
    /** HTTP-Status (0 = Netzwerkfehler), fuer gezielte Behandlung. */
    public readonly status = 0,
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

  if (res.ok) {
    return (await res.json()) as T
  }

  // Fuer die Diagnose die Antwort des Servers mitloggen (hilft bei 403 etc.).
  const bodyText = await res.text().catch(() => '')
  console.warn('[Spotify API] Fehler', res.status, path, bodyText.slice(0, 300))

  if (res.status === 401) {
    // Token ungueltig -> Sitzung verwerfen.
    clearTokens()
    throw new ApiError('Sitzung abgelaufen. Bitte erneut mit Spotify verbinden.', true, 401)
  }
  if (res.status === 403) {
    throw new ApiError('Zugriff von Spotify verweigert (403).', false, 403)
  }
  if (res.status === 404) {
    throw new ApiError('Ressource bei Spotify nicht gefunden (404).', false, 404)
  }
  if (res.status === 429) {
    throw new ApiError(
      'Zu viele Anfragen an Spotify. Bitte kurz warten und erneut versuchen.',
      false,
      429,
    )
  }
  throw new ApiError(`Spotify-Anfrage fehlgeschlagen (Status ${res.status}).`, false, res.status)
}

/** Liefert die Spotify-User-ID des angemeldeten Nutzers (fuer Besitz-Erkennung). */
export async function fetchCurrentUserId(): Promise<string | null> {
  try {
    const me = await apiFetch<{ id: string }>('/me')
    return me.id ?? null
  } catch {
    // Nicht kritisch – Besitz-Erkennung ist nur ein Komfort-Feature.
    return null
  }
}

/** Waehlt das erste (groesste) Bild aus einer Spotify-Image-Liste. */
function firstImageUrl(images: { url: string }[] | null | undefined): string | null {
  return images && images.length > 0 ? images[0].url : null
}

// ── Playlists laden ──────────────────────────────────────────

/**
 * Laedt alle Playlists des angemeldeten Nutzers (mit Pagination).
 * @param currentUserId eigene User-ID, um "eigene" Playlists zu markieren.
 */
export async function fetchPlaylists(currentUserId: string | null): Promise<Playlist[]> {
  const playlists: Playlist[] = []
  let url: string | null = '/me/playlists?limit=50'

  while (url) {
    const page: SpotifyPagingResponse<SpotifyRawPlaylist> = await apiFetch(url)

    for (const raw of page.items) {
      // Spotify kann in seltenen Faellen null-Eintraege liefern.
      if (!raw || !raw.id) continue
      const ownerId = raw.owner?.id ?? ''
      playlists.push({
        id: raw.id,
        name: raw.name || 'Unbenannte Playlist',
        imageUrl: firstImageUrl(raw.images),
        // Spotify liefert die Songzahl je nach Antwort unter "tracks" oder "items".
        trackCount: raw.tracks?.total ?? raw.items?.total ?? 0,
        ownerName: raw.owner?.display_name ?? '',
        ownerId,
        // Ohne bekannte User-ID: nur Spotify-eigene Listen als "nicht eigen" werten.
        isOwn: currentUserId ? ownerId === currentUserId : ownerId !== 'spotify',
      })
    }

    // "next" ist eine volle URL -> auf den Pfad reduzieren.
    url = page.next ? page.next.replace(API_BASE, '') : null
  }

  // Eigene Playlists zuerst (die sind ueber die API zuverlaessig ladbar).
  playlists.sort((a, b) => Number(b.isOwn) - Number(a.isOwn))
  return playlists
}

// ── Tracks einer Playlist laden ──────────────────────────────

// Ein Eintrag der Playlist. Seit der Spotify-API-Migration (Feb. 2026) heisst
// der Wrapper "item" statt "track" – wir unterstuetzen beide Varianten.
interface PlaylistItem {
  item?: SpotifyRawTrack | null
  track?: SpotifyRawTrack | null
}

/**
 * Laedt alle spielbaren Tracks einer Playlist (mit Pagination).
 * Filtert lokale Dateien und ungueltige Eintraege heraus.
 *
 * Nutzt den aktuellen Endpoint GET /playlists/{id}/items. Der fruehere
 * /tracks-Endpoint wurde von Spotify im Feb. 2026 entfernt und liefert 403.
 * Faellt auf /tracks zurueck, falls /items (aeltere API) nicht existiert (404).
 *
 * Wichtige Spotify-Einschraenkung: Inhalte gibt es nur fuer EIGENE Playlists
 * (oder wo man Mitbearbeiter ist). Fremde Listen liefern 403.
 */
export async function fetchPlaylistTracks(playlist: Playlist): Promise<Track[]> {
  try {
    return await loadItems(`/playlists/${playlist.id}/items?limit=100`)
  } catch (e) {
    // Aeltere API kennt /items evtl. nicht -> auf den alten Endpoint zurueckfallen.
    if (e instanceof ApiError && e.status === 404) {
      try {
        return await loadItems(`/playlists/${playlist.id}/tracks?limit=100`)
      } catch (e2) {
        throw describeTrackError(e2, playlist)
      }
    }
    throw describeTrackError(e, playlist)
  }
}

/** Laedt und normalisiert die Eintraege eines Playlist-Endpoints (mit Pagination). */
async function loadItems(startUrl: string): Promise<Track[]> {
  const tracks: Track[] = []
  let url: string | null = startUrl

  while (url) {
    const page: SpotifyPagingResponse<PlaylistItem> = await apiFetch(url)

    for (const entry of page.items) {
      // Neuer Wrapper "item", alter "track" – beides abdecken.
      const t = entry?.item ?? entry?.track
      // Ungueltige, lokale oder nicht abspielbare Eintraege ueberspringen.
      if (!t || !t.id || t.is_local || t.type === 'episode') continue

      const spotifyUrl = t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`

      tracks.push({
        id: t.id,
        title: t.name || 'Unbekannter Titel',
        artist:
          t.artists?.map((a) => a.name).filter(Boolean).join(', ') || 'Unbekannter Artist',
        coverUrl: firstImageUrl(t.album?.images),
        spotifyUrl,
      })
    }

    url = page.next ? page.next.replace(API_BASE, '') : null
  }

  return tracks
}

/** Wandelt einen Fehler beim Track-Laden in eine klare, handlungsleitende Meldung. */
function describeTrackError(e: unknown, playlist: Playlist): unknown {
  if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
    if (!playlist.isOwn) {
      return new ApiError(
        `»${playlist.name}« gehoert nicht deinem Konto. Seit der Spotify-Migration ` +
          `(Feb. 2026) lassen sich nur noch Playlists laden, die du selbst erstellt hast ` +
          `(oder bei denen du Mitbearbeiter bist). Bitte waehle eine eigene Playlist.`,
        false,
        e.status,
      )
    }
    return new ApiError(
      `»${playlist.name}« konnte nicht geladen werden (${e.status}). Falls das bei allen ` +
        `eigenen Playlists passiert: Ist dein Account im Spotify-Dashboard unter ` +
        `„User Management“ hinzugefuegt? Danach „Spotify trennen“ und neu verbinden.`,
      false,
      e.status,
    )
  }
  return e
}
