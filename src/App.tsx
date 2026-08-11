import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { isConfigured } from './spotify/auth'
import { ApiError, fetchCurrentUserId, fetchPlaylists, fetchPlaylistTracks } from './spotify/api'
import type { Playlist, Track } from './spotify/types'
import {
  loadActivePlaylist,
  loadDrawnIds,
  saveActivePlaylist,
  saveDrawnIds,
} from './storage/storage'
import { buildStrip, pickWinner, WINNER_INDEX } from './roulette/engine'
import { unlockAudio } from './roulette/audio'

import { ConfigNeeded } from './components/ConfigNeeded'
import { ConnectSpotify } from './components/ConnectSpotify'
import { PlaylistPicker } from './components/PlaylistPicker'
import { Home } from './components/Home'
import { Roulette } from './components/Roulette'
import { Result } from './components/Result'
import { Spinner } from './components/Spinner'
import { ErrorToast } from './components/ErrorToast'
import { SpotifyIcon } from './components/icons'

type View = 'home' | 'picker' | 'roulette' | 'result'

const SOUND_KEY = 'kr.sound.enabled'

export function App() {
  const auth = useAuth()

  const [view, setView] = useState<View>('home')
  const [error, setError] = useState<string | null>(null)

  // Playlists (nur bei Bedarf geladen)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistsLoading, setPlaylistsLoading] = useState(false)

  // Aktive Playlist + deren Tracks
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [tracksLoading, setTracksLoading] = useState(false)

  // Eigene Spotify-User-ID (fuer Besitz-Erkennung der Playlists)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // No-Repeat-Zustand
  const [drawnIds, setDrawnIds] = useState<Set<string>>(new Set())
  const [lastWinnerId, setLastWinnerId] = useState<string | null>(null)

  // Roulette-Daten
  const [strip, setStrip] = useState<Track[]>([])
  const [winner, setWinner] = useState<Track | null>(null)

  // Sound-Einstellung (dezent, persistent)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    () => localStorage.getItem(SOUND_KEY) !== 'off',
  )

  const showError = useCallback((msg: string) => setError(msg), [])

  // ── Fehler aus Auth-Hook uebernehmen ──
  useEffect(() => {
    if (auth.error) setError(auth.error)
  }, [auth.error])

  // ── Bei Verbindung: eigene User-ID holen + letzte Playlist wiederherstellen ──
  useEffect(() => {
    if (auth.status === 'connected') {
      void fetchCurrentUserId().then((id) => setCurrentUserId(id))
      const saved = loadActivePlaylist()
      if (saved) {
        setActivePlaylist(saved)
        setDrawnIds(loadDrawnIds(saved.id))
      }
    }
  }, [auth.status])

  // ── Tracks der aktiven Playlist laden ──
  useEffect(() => {
    if (!activePlaylist) return
    let cancelled = false

    async function load(pl: Playlist) {
      setTracksLoading(true)
      setError(null)
      try {
        const loaded = await fetchPlaylistTracks(pl)
        if (cancelled) return
        setTracks(loaded)
        if (loaded.length === 0) {
          showError('Diese Playlist enthaelt keine abspielbaren Songs. Bitte eine andere waehlen.')
        }
      } catch (e) {
        if (cancelled) return
        handleApiError(e)
        setTracks([])
      } finally {
        if (!cancelled) setTracksLoading(false)
      }
    }

    void load(activePlaylist)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlaylist])

  function handleApiError(e: unknown) {
    if (e instanceof ApiError) {
      setError(e.message)
      if (e.needsReauth) auth.disconnect()
    } else {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    }
  }

  // ── Playlists laden (fuer Picker) ──
  const loadPlaylists = useCallback(async () => {
    setPlaylistsLoading(true)
    setError(null)
    try {
      // Eigene User-ID sicherstellen (falls noch nicht geladen).
      const uid = currentUserId ?? (await fetchCurrentUserId())
      if (uid && uid !== currentUserId) setCurrentUserId(uid)
      const pls = await fetchPlaylists(uid)
      setPlaylists(pls)
    } catch (e) {
      handleApiError(e)
    } finally {
      setPlaylistsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  const openPicker = useCallback(() => {
    setView('picker')
    void loadPlaylists()
  }, [loadPlaylists])

  // Auto-Load der Playlists, wenn verbunden aber noch keine aktive Playlist.
  useEffect(() => {
    if (
      auth.status === 'connected' &&
      !activePlaylist &&
      playlists.length === 0 &&
      !playlistsLoading
    ) {
      void loadPlaylists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, activePlaylist])

  const selectPlaylist = useCallback((pl: Playlist) => {
    setActivePlaylist(pl)
    saveActivePlaylist(pl)
    setDrawnIds(loadDrawnIds(pl.id))
    setLastWinnerId(null)
    setView('home')
  }, [])

  // ── Song ziehen (Roulette starten) ──
  const spin = useCallback(() => {
    if (tracks.length === 0) {
      showError('Es sind keine Songs geladen. Bitte eine Playlist mit Songs waehlen.')
      return
    }
    unlockAudio() // Audio nach User-Geste freischalten

    try {
      const { winner: picked, didReset } = pickWinner(tracks, drawnIds, lastWinnerId)

      // No-Repeat-Zustand aktualisieren (ggf. zuruecksetzen).
      const nextDrawn = didReset ? new Set<string>() : new Set(drawnIds)
      nextDrawn.add(picked.id)
      setDrawnIds(nextDrawn)
      if (activePlaylist) saveDrawnIds(activePlaylist.id, nextDrawn)

      setWinner(picked)
      setStrip(buildStrip(tracks, picked))
      setView('roulette')
    } catch {
      showError('Song konnte nicht ausgewaehlt werden. Bitte erneut versuchen.')
    }
  }, [tracks, drawnIds, lastWinnerId, activePlaylist, showError])

  const onRouletteComplete = useCallback(() => {
    if (winner) setLastWinnerId(winner.id)
    setView('result')
  }, [winner])

  const openSpotify = useCallback(() => {
    if (winner) window.open(winner.spotifyUrl, '_blank', 'noopener,noreferrer')
  }, [winner])

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off')
      return next
    })
  }, [])

  // ── Rendering ──────────────────────────────────────────────

  if (!isConfigured()) {
    return (
      <Shell soundEnabled={soundEnabled} onToggleSound={toggleSound} connected={false}>
        <ConfigNeeded />
      </Shell>
    )
  }

  let content: React.ReactNode

  if (auth.status === 'checking') {
    content = <Spinner label="Verbindung wird geprueft…" />
  } else if (auth.status === 'disconnected') {
    content = <ConnectSpotify onConnect={auth.connect} />
  } else if (view === 'picker' || !activePlaylist) {
    content = (
      <PlaylistPicker
        playlists={playlists}
        loading={playlistsLoading}
        onSelect={selectPlaylist}
        onCancel={activePlaylist ? () => setView('home') : undefined}
      />
    )
  } else if (view === 'roulette' && winner) {
    content = (
      <Roulette
        strip={strip}
        winnerIndex={WINNER_INDEX}
        soundEnabled={soundEnabled}
        onComplete={onRouletteComplete}
      />
    )
  } else if (view === 'result' && winner) {
    content = (
      <Result
        track={winner}
        onAgain={spin}
        onOpenSpotify={openSpotify}
        onChangePlaylist={openPicker}
      />
    )
  } else {
    // view === 'home'
    content = tracksLoading ? (
      <Spinner label="Songs werden geladen…" />
    ) : (
      <Home
        playlist={activePlaylist}
        onSpin={spin}
        onChangePlaylist={openPicker}
        remaining={Math.max(0, tracks.length - drawnIds.size)}
        total={tracks.length}
      />
    )
  }

  return (
    <Shell
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      connected={auth.status === 'connected'}
      onDisconnect={auth.disconnect}
    >
      {content}
      {error && <ErrorToast message={error} onDismiss={() => setError(null)} />}
    </Shell>
  )
}

// ── Layout-Huelle mit Header (Sound-Toggle, Trennen) ──────────

interface ShellProps {
  children: React.ReactNode
  soundEnabled: boolean
  onToggleSound: () => void
  connected: boolean
  onDisconnect?: () => void
}

function Shell({ children, soundEnabled, onToggleSound, connected, onDisconnect }: ShellProps) {
  return (
    <div className="app">
      <div className="bg-glow" aria-hidden="true" />
      <header className="app-header">
        <div className="app-header-actions">
          <button
            className="icon-btn"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            title={soundEnabled ? 'Ton aus' : 'Ton an'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          {connected && onDisconnect && (
            <button className="icon-btn disconnect" onClick={onDisconnect} title="Spotify trennen">
              <SpotifyIcon className="icon-btn-svg" />
              <span className="disconnect-x">✕</span>
            </button>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
