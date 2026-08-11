// ─────────────────────────────────────────────────────────────
//  Local Storage – persistenter App-Zustand
//
//  Speichert: aktive Playlist + bereits gezogene Songs (No-Repeat).
//  Bewusst simpel gehalten; alles im Browser, kein Backend.
// ─────────────────────────────────────────────────────────────

import type { Playlist } from '../spotify/types'

const KEYS = {
  activePlaylist: 'kr.playlist.active',
  // History wird pro Playlist gespeichert -> Präfix + Playlist-ID.
  drawnPrefix: 'kr.drawn.',
  // Manuell entfernte (nicht ziehbare) Songs, ebenfalls pro Playlist.
  excludedPrefix: 'kr.excluded.',
} as const

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage kann voll/deaktiviert sein -> App läuft trotzdem weiter.
  }
}

// ── Aktive Playlist ──────────────────────────────────────────

export function saveActivePlaylist(playlist: Playlist): void {
  safeSet(KEYS.activePlaylist, JSON.stringify(playlist))
}

export function loadActivePlaylist(): Playlist | null {
  const raw = safeGet(KEYS.activePlaylist)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Playlist
  } catch {
    return null
  }
}

export function clearActivePlaylist(): void {
  try {
    localStorage.removeItem(KEYS.activePlaylist)
  } catch {
    /* ignore */
  }
}

// ── Bereits gezogene Songs (No-Repeat) ───────────────────────

/** Liefert das Set der bereits gezogenen Track-IDs für eine Playlist. */
export function loadDrawnIds(playlistId: string): Set<string> {
  const raw = safeGet(KEYS.drawnPrefix + playlistId)
  if (!raw) return new Set()
  try {
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

export function saveDrawnIds(playlistId: string, ids: Set<string>): void {
  safeSet(KEYS.drawnPrefix + playlistId, JSON.stringify([...ids]))
}

export function clearDrawnIds(playlistId: string): void {
  try {
    localStorage.removeItem(KEYS.drawnPrefix + playlistId)
  } catch {
    /* ignore */
  }
}

// ── Manuell entfernte Songs (nicht ziehbar) ──────────────────

/** Liefert das Set der manuell entfernten Track-IDs für eine Playlist. */
export function loadExcludedIds(playlistId: string): Set<string> {
  const raw = safeGet(KEYS.excludedPrefix + playlistId)
  if (!raw) return new Set()
  try {
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

export function saveExcludedIds(playlistId: string, ids: Set<string>): void {
  safeSet(KEYS.excludedPrefix + playlistId, JSON.stringify([...ids]))
}
