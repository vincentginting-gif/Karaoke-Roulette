// ─────────────────────────────────────────────────────────────
//  Eigene Playlists (Offline) – persistent in localStorage.
//  Songs als Zeilen im Format „Titel - Interpret".
// ─────────────────────────────────────────────────────────────

export interface UserPlaylist {
  id: string
  name: string
  songs: string[]
}

const KEY = 'kr.userPlaylists'

function genId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return `up-${crypto.randomUUID()}`
  } catch {
    /* Fallback unten */
  }
  return `up-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

/** Lädt alle gespeicherten eigenen Playlists (defensiv validiert). */
export function loadUserPlaylists(): UserPlaylist[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.filter(
      (p): p is UserPlaylist =>
        p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.songs),
    )
  } catch {
    return []
  }
}

function persist(list: UserPlaylist[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* Speicher voll o. ä. – nicht kritisch */
  }
}

/** Legt eine neue eigene Playlist an (ganz oben) und gibt sie zurück. */
export function addUserPlaylist(name: string, songs: string[]): UserPlaylist {
  const pl: UserPlaylist = { id: genId(), name: name.trim() || 'Meine Playlist', songs }
  const list = loadUserPlaylists()
  list.unshift(pl)
  persist(list)
  return pl
}

/** Aktualisiert Name/Songs einer bestehenden Playlist. */
export function updateUserPlaylist(id: string, name: string, songs: string[]): void {
  const list = loadUserPlaylists().map((p) =>
    p.id === id ? { ...p, name: name.trim() || p.name, songs } : p,
  )
  persist(list)
}

/** Löscht eine eigene Playlist. */
export function deleteUserPlaylist(id: string): void {
  persist(loadUserPlaylists().filter((p) => p.id !== id))
}
