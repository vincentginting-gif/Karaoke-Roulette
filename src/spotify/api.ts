// ─────────────────────────────────────────────────────────────
//  Spotify Web API – Datenzugriff (Playlists & Tracks)
//
//  Kapselt alle HTTP-Aufrufe. Gibt saubere Domain-Objekte zurück.
// ─────────────────────────────────────────────────────────────

import { clearTokens, getValidAccessToken } from './auth'
import type {
  Playlist,
  SpotifyPagingResponse,
  SpotifyRawPlaylist,
  SpotifyRawTrack,
  SpotifySearchResponse,
  Track,
} from './types'

const API_BASE = 'https://api.spotify.com/v1'

/** Fehlerklasse für API-Probleme, damit die UI sie klar behandeln kann. */
export class ApiError extends Error {
  constructor(
    message: string,
    /** true, wenn die Sitzung ungültig ist und ein neuer Login nötig ist. */
    public readonly needsReauth = false,
    /** HTTP-Status (0 = Netzwerkfehler), für gezielte Behandlung. */
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

  // Für die Diagnose die Antwort des Servers mitloggen (hilft bei 403 etc.).
  const bodyText = await res.text().catch(() => '')
  console.warn('[Spotify API] Fehler', res.status, path, bodyText.slice(0, 300))

  if (res.status === 401) {
    // Token ungültig -> Sitzung verwerfen.
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

/** Liefert die Spotify-User-ID des angemeldeten Nutzers (für Besitz-Erkennung). */
export async function fetchCurrentUserId(): Promise<string | null> {
  try {
    const me = await apiFetch<{ id: string }>('/me')
    return me.id ?? null
  } catch {
    // Nicht kritisch – Besitz-Erkennung ist nur ein Komfort-Feature.
    return null
  }
}

/** Wählt das erste (größte) Bild aus einer Spotify-Image-Liste. */
function firstImageUrl(images: { url: string }[] | null | undefined): string | null {
  return images && images.length > 0 ? images[0].url : null
}

// ── Playlists laden ──────────────────────────────────────────

/**
 * Lädt alle Playlists des angemeldeten Nutzers (mit Pagination).
 * @param currentUserId eigene User-ID, um "eigene" Playlists zu markieren.
 */
export async function fetchPlaylists(currentUserId: string | null): Promise<Playlist[]> {
  const playlists: Playlist[] = []
  let url: string | null = '/me/playlists?limit=50'

  while (url) {
    const page: SpotifyPagingResponse<SpotifyRawPlaylist> = await apiFetch(url)

    for (const raw of page.items) {
      // Spotify kann in seltenen Fällen null-Einträge liefern.
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

  // Eigene Playlists zuerst (die sind über die API zuverlässig ladbar).
  playlists.sort((a, b) => Number(b.isOwn) - Number(a.isOwn))
  return playlists
}

// ── Tracks einer Playlist laden ──────────────────────────────

// Ein Eintrag der Playlist. Seit der Spotify-API-Migration (Feb. 2026) heißt
// der Wrapper "item" statt "track" – wir unterstützen beide Varianten.
interface PlaylistItem {
  item?: SpotifyRawTrack | null
  track?: SpotifyRawTrack | null
}

/**
 * Lädt alle spielbaren Tracks einer Playlist (mit Pagination).
 * Filtert lokale Dateien und ungültige Einträge heraus.
 *
 * Nutzt den aktuellen Endpoint GET /playlists/{id}/items. Der frühere
 * /tracks-Endpoint wurde von Spotify im Feb. 2026 entfernt und liefert 403.
 * Fällt auf /tracks zurück, falls /items (ältere API) nicht existiert (404).
 *
 * Wichtige Spotify-Einschränkung: Inhalte gibt es nur für EIGENE Playlists
 * (oder wo man Mitbearbeiter ist). Fremde Listen liefern 403.
 */
export async function fetchPlaylistTracks(playlist: Playlist): Promise<Track[]> {
  try {
    return await loadItems(`/playlists/${playlist.id}/items?limit=100`)
  } catch (e) {
    // Aeltere API kennt /items evtl. nicht -> auf den alten Endpoint zurückfallen.
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

/** Normalisiert ein rohes Spotify-Track-Objekt in unser Domain-Modell. */
function mapTrack(t: SpotifyRawTrack): Track {
  return {
    id: t.id as string,
    title: t.name || 'Unbekannter Titel',
    artist: t.artists?.map((a) => a.name).filter(Boolean).join(', ') || 'Unbekannter Artist',
    coverUrl: firstImageUrl(t.album?.images),
    spotifyUrl: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
    album: t.album?.name ?? '',
    durationMs: t.duration_ms ?? 0,
  }
}

/** true, wenn ein Roh-Track spielbar/verwendbar ist. */
function isUsableTrack(t: SpotifyRawTrack | null | undefined): t is SpotifyRawTrack {
  return Boolean(t && t.id && !t.is_local && t.type !== 'episode')
}

/** Lädt und normalisiert die Einträge eines Playlist-Endpoints (mit Pagination). */
async function loadItems(startUrl: string): Promise<Track[]> {
  const tracks: Track[] = []
  let url: string | null = startUrl

  while (url) {
    const page: SpotifyPagingResponse<PlaylistItem> = await apiFetch(url)

    for (const entry of page.items) {
      // Neuer Wrapper "item", alter "track" – beides abdecken.
      const t = entry?.item ?? entry?.track
      if (!isUsableTrack(t)) continue
      tracks.push(mapTrack(t))
    }

    url = page.next ? page.next.replace(API_BASE, '') : null
  }

  return tracks
}

// ── Entdecken: Songs aus dem Spotify-Katalog per Suche ───────

// Seit der Migration (Feb. 2026) ist das Such-Limit max. 10 (vorher 50).
const SEARCH_PAGE_SIZE = 10
const SEARCH_PAGES = 12 // -> bis zu 120 Roh-Treffer

/** Eine Seite Track-Suche holen. */
async function searchTrackPage(q: string, offset: number): Promise<SpotifySearchResponse> {
  const url = `/search?type=track&limit=${SEARCH_PAGE_SIZE}&offset=${offset}&q=${encodeURIComponent(q)}`
  return apiFetch<SpotifySearchResponse>(url)
}

/**
 * Sucht Tracks eines Genres im gesamten Spotify-Katalog und filtert nach
 * Mindest-Beliebtheit (0–100). Nutzt den /search-Endpoint (der die im
 * Nov. 2024 abgeschaltete Recommendations-API ersetzt).
 *
 * @param genreQuery Genre-Begriff (z. B. "hip hop", "jazz")
 * @param minPopularity nur Tracks mit popularity >= diesem Wert
 */
export async function searchTracksByGenre(
  genreQuery: string,
  minPopularity: number,
): Promise<Track[]> {
  // Seite 0 mit einer Query holen; bei 400 (Filter nicht unterstützt) -> null.
  const tryFirst = async (q: string): Promise<SpotifySearchResponse | null> => {
    try {
      return await searchTrackPage(q, 0)
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) return null
      throw e
    }
  }

  // 1) Genre-Filter versuchen. 2) Wenn Fehler ODER leer -> freie Suche.
  let query = `genre:"${genreQuery}"`
  let firstPage = await tryFirst(query)
  if (!firstPage || (firstPage.tracks?.items?.length ?? 0) === 0) {
    query = genreQuery
    firstPage = await searchTrackPage(query, 0) // freie Suche; Fehler propagieren
  }

  // Restliche Seiten parallel holen (fehlertolerant).
  const rest = await Promise.allSettled(
    Array.from({ length: SEARCH_PAGES - 1 }, (_, i) =>
      searchTrackPage(query, (i + 1) * SEARCH_PAGE_SIZE),
    ),
  )
  const pages: SpotifySearchResponse[] = [firstPage]
  for (const r of rest) if (r.status === 'fulfilled') pages.push(r.value)

  // Alle Roh-Treffer + die nach Beliebtheit gefilterten sammeln (dedupliziert).
  const allRaw = new Map<string, Track>()
  const filtered = new Map<string, Track>()
  let withPopularity = 0
  let maxPopularity = 0

  for (const page of pages) {
    for (const t of page.tracks?.items ?? []) {
      if (!isUsableTrack(t)) continue
      const id = t.id as string
      if (!allRaw.has(id)) allRaw.set(id, mapTrack(t))
      if (typeof t.popularity === 'number') {
        withPopularity++
        if (t.popularity > maxPopularity) maxPopularity = t.popularity
      }
      if ((t.popularity ?? 0) >= minPopularity && !filtered.has(id)) {
        filtered.set(id, mapTrack(t))
      }
    }
  }

  console.info(
    `[Entdecken] Query "${query}" – Roh: ${allRaw.size}, mit Popularity: ${withPopularity}, ` +
      `maxPop: ${maxPopularity}, nach Beliebtheit ≥${minPopularity}: ${filtered.size}`,
  )

  if (filtered.size > 0) return [...filtered.values()]

  // Nichts nach Filter – Ursache unterscheiden:
  if (allRaw.size > 0 && withPopularity === 0) {
    // Spotify liefert für diese App keine Beliebtheit -> Filter ignorieren.
    console.info('[Entdecken] Keine Beliebtheits-Daten verfügbar – Regler wird ignoriert.')
    return [...allRaw.values()]
  }
  if (allRaw.size > 0) {
    throw new ApiError(
      `Für „${genreQuery}“ gibt es Treffer, aber keine mit Beliebtheit ≥ ${minPopularity}. ` +
        `Zieh den Beliebtheits-Regler weiter nach unten.`,
    )
  }
  throw new ApiError(
    'Spotify liefert für diese App keine Katalog-Suchergebnisse. Das ist eine ' +
      'Einschränkung des Development Mode – der Entdecken-Modus benötigt „Extended ' +
      'Quota Mode“ (im Spotify-Dashboard beantragbar). Playlists funktionieren weiter.',
  )
}

/** true, wenn `name` bei den Artists des Tracks (unscharf) vorkommt. */
function artistMatches(t: SpotifyRawTrack, name: string): boolean {
  const needle = name.trim().toLowerCase()
  return (t.artists ?? []).some((a) => a.name.toLowerCase().includes(needle))
}

/**
 * Sucht zufällige Songs bestimmter Artists im Spotify-Katalog. Für jeden
 * Artist wird mit `artist:"Name"` gesucht, die Ergebnisse werden (unscharf
 * gegen den Namen gefiltert und) über alle Artists zusammengeführt.
 *
 * @param artists Liste von Artist-Namen
 */
export async function searchTracksByArtist(artists: string[]): Promise<Track[]> {
  const names = artists.map((a) => a.trim()).filter(Boolean)
  if (names.length === 0) throw new ApiError('Bitte mindestens einen Artist angeben.')

  // Anfragen begrenzen: bei vielen Artists weniger Seiten pro Artist.
  const pagesPerArtist = names.length > 3 ? 6 : 10
  const combined = new Map<string, Track>()

  for (const name of names) {
    const query = `artist:"${name}"`
    const results = await Promise.allSettled(
      Array.from({ length: pagesPerArtist }, (_, i) =>
        searchTrackPage(query, i * SEARCH_PAGE_SIZE),
      ),
    )

    const raw = new Map<string, Track>()
    const strict = new Map<string, Track>()
    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      for (const t of r.value.tracks?.items ?? []) {
        if (!isUsableTrack(t)) continue
        const id = t.id as string
        raw.set(id, mapTrack(t))
        if (artistMatches(t, name)) strict.set(id, mapTrack(t))
      }
    }

    // Bevorzugt die exakt passenden Treffer; sonst die Roh-Treffer (z. B. bei
    // leicht abweichender Schreibweise).
    const chosen = strict.size > 0 ? strict : raw
    for (const [id, track] of chosen) if (!combined.has(id)) combined.set(id, track)
  }

  console.info(`[Artists] ${names.join(', ')} – ${combined.size} Songs`)

  if (combined.size === 0) {
    throw new ApiError(
      `Für ${names.length > 1 ? 'diese Artists' : `„${names[0]}“`} wurden keine Songs ` +
        `gefunden. Prüfe die Schreibweise. Hinweis: Der Artist-Modus nutzt die ` +
        `Spotify-Katalog-Suche – im Development Mode kann diese eingeschränkt sein ` +
        `(dann hilft „Extended Quota Mode“ im Dashboard).`,
    )
  }
  return [...combined.values()]
}

/** Wandelt einen Fehler beim Track-Laden in eine klare, handlungsleitende Meldung. */
function describeTrackError(e: unknown, playlist: Playlist): unknown {
  if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
    if (!playlist.isOwn) {
      return new ApiError(
        `»${playlist.name}« gehört nicht deinem Konto. Seit der Spotify-Migration ` +
          `(Feb. 2026) lassen sich nur noch Playlists laden, die du selbst erstellt hast ` +
          `(oder bei denen du Mitbearbeiter bist). Bitte wähle eine eigene Playlist.`,
        false,
        e.status,
      )
    }
    return new ApiError(
      `»${playlist.name}« konnte nicht geladen werden (${e.status}). Falls das bei allen ` +
        `eigenen Playlists passiert: Ist dein Account im Spotify-Dashboard unter ` +
        `„User Management“ hinzugefügt? Danach „Spotify trennen“ und neu verbinden.`,
      false,
      e.status,
    )
  }
  return e
}
