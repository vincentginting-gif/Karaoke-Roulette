import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { isConfigured } from './spotify/auth'
import {
  ApiError,
  fetchCurrentUserId,
  fetchPlaylists,
  fetchPlaylistTracks,
  searchTracksByGenre,
} from './spotify/api'
import type { Playlist, Track } from './spotify/types'
import type { Genre } from './spotify/genres'
import {
  clearDrawnIds,
  loadActivePlaylist,
  loadDrawnIds,
  loadExcludedIds,
  saveActivePlaylist,
  saveDrawnIds,
  saveExcludedIds,
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
import { SettingsPanel } from './components/SettingsPanel'
import { SongManager } from './components/SongManager'
import { DiscoverPicker } from './components/DiscoverPicker'
import { GearIcon } from './components/icons'

type View = 'home' | 'picker' | 'discover' | 'roulette' | 'result' | 'manage'

/** Baut eine synthetische "Playlist" fuer eine Entdecken-Auswahl. */
function makeDiscoverPlaylist(genre: Genre): Playlist {
  return {
    id: `discover:${genre.query}`,
    name: `${genre.emoji} ${genre.label}`,
    imageUrl: null,
    trackCount: 0,
    ownerName: 'Spotify-Katalog',
    ownerId: '',
    isOwn: true,
  }
}

const DISCOVER_PREFIX = 'discover:'

const SOUND_KEY = 'kr.sound.enabled'
const SURPRISE_KEY = 'kr.surprise.enabled'

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

  // Manuell entfernte (nicht ziehbare) Songs
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())

  // Roulette-Daten
  const [strip, setStrip] = useState<Track[]>([])
  const [winner, setWinner] = useState<Track | null>(null)

  // Einstellungen (persistent)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    () => localStorage.getItem(SOUND_KEY) !== 'off',
  )
  const [surpriseMode, setSurpriseMode] = useState<boolean>(
    () => localStorage.getItem(SURPRISE_KEY) === 'on',
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Ziehbarer Pool = alle Tracks ohne die manuell entfernten.
  const pool = useMemo(() => tracks.filter((t) => !excludedIds.has(t.id)), [tracks, excludedIds])

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
        setExcludedIds(loadExcludedIds(saved.id))
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
        const loaded = await loadTracksFor(pl)
        if (cancelled) return
        setTracks(loaded)
        if (loaded.length === 0) {
          showError(
            pl.id.startsWith(DISCOVER_PREFIX)
              ? 'Keine Songs für dieses Genre mit dieser Beliebtheit gefunden. Versuch eine niedrigere Beliebtheit.'
              : 'Diese Playlist enthaelt keine abspielbaren Songs. Bitte eine andere waehlen.',
          )
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

  /** Laedt Tracks je nach Quelle: echte Playlist oder Entdecken (Suche). */
  function loadTracksFor(pl: Playlist): Promise<Track[]> {
    if (pl.id.startsWith(DISCOVER_PREFIX)) {
      const [, query = '', minPop = '0'] = pl.id.split(':')
      return searchTracksByGenre(query, Number(minPop))
    }
    return fetchPlaylistTracks(pl)
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
    setExcludedIds(loadExcludedIds(pl.id))
    setLastWinnerId(null)
    setView('home')
  }, [])

  // ── Entdecken: Genre als Quelle waehlen ──
  const selectDiscover = useCallback((genre: Genre) => {
    const pl = makeDiscoverPlaylist(genre)
    setActivePlaylist(pl)
    saveActivePlaylist(pl)
    setDrawnIds(loadDrawnIds(pl.id))
    setExcludedIds(loadExcludedIds(pl.id))
    setLastWinnerId(null)
    setView('home') // Home zeigt den Spinner, waehrend die Suche laedt
  }, [])

  // ── Song ziehen (Roulette starten) ──
  const spin = useCallback(() => {
    if (pool.length === 0) {
      showError(
        tracks.length === 0
          ? 'Es sind keine Songs geladen. Bitte eine Playlist mit Songs waehlen.'
          : 'Alle Songs wurden aus dem Pool entfernt. Hole unter „Songs verwalten“ welche zurück.',
      )
      return
    }
    unlockAudio() // Audio nach User-Geste freischalten

    try {
      const { winner: picked, didReset } = pickWinner(pool, drawnIds, lastWinnerId)

      // No-Repeat-Zustand aktualisieren (ggf. zuruecksetzen).
      const nextDrawn = didReset ? new Set<string>() : new Set(drawnIds)
      nextDrawn.add(picked.id)
      setDrawnIds(nextDrawn)
      if (activePlaylist) saveDrawnIds(activePlaylist.id, nextDrawn)

      setWinner(picked)
      setStrip(buildStrip(pool, picked))
      setView('roulette')
    } catch {
      showError('Song konnte nicht ausgewaehlt werden. Bitte erneut versuchen.')
    }
  }, [pool, tracks.length, drawnIds, lastWinnerId, activePlaylist, showError])

  // ── Gezogene Songs zuruecksetzen (wieder in den Pool) ──
  const resetDrawn = useCallback(() => {
    setDrawnIds(new Set())
    setLastWinnerId(null)
    if (activePlaylist) clearDrawnIds(activePlaylist.id)
  }, [activePlaylist])

  // ── Song aus dem Pool entfernen / zurueckholen ──
  const toggleExclude = useCallback(
    (trackId: string) => {
      setExcludedIds((prev) => {
        const next = new Set(prev)
        if (next.has(trackId)) next.delete(trackId)
        else next.add(trackId)
        if (activePlaylist) saveExcludedIds(activePlaylist.id, next)
        return next
      })
    },
    [activePlaylist],
  )

  const toggleSurprise = useCallback(() => {
    setSurpriseMode((prev) => {
      const next = !prev
      localStorage.setItem(SURPRISE_KEY, next ? 'on' : 'off')
      return next
    })
  }, [])

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
      <Shell connected={false}>
        <ConfigNeeded />
      </Shell>
    )
  }

  // Verbleibende ziehbare Songs (im Pool, noch nicht gezogen).
  const drawnInPool = pool.filter((t) => drawnIds.has(t.id)).length
  const remaining = Math.max(0, pool.length - drawnInPool)

  let content: React.ReactNode

  if (auth.status === 'checking') {
    content = <Spinner label="Verbindung wird geprueft…" />
  } else if (auth.status === 'disconnected') {
    content = <ConnectSpotify onConnect={auth.connect} />
  } else if (view === 'discover') {
    content = (
      <DiscoverPicker
        loading={tracksLoading}
        onStart={selectDiscover}
        onCancel={() => setView('picker')}
      />
    )
  } else if (view === 'picker' || !activePlaylist) {
    content = (
      <PlaylistPicker
        playlists={playlists}
        loading={playlistsLoading}
        onSelect={selectPlaylist}
        onDiscover={() => setView('discover')}
        onCancel={activePlaylist ? () => setView('home') : undefined}
      />
    )
  } else if (view === 'manage') {
    content = (
      <SongManager
        playlistName={activePlaylist.name}
        tracks={tracks}
        excludedIds={excludedIds}
        onToggleExclude={toggleExclude}
        onBack={() => setView('home')}
      />
    )
  } else if (view === 'roulette' && winner) {
    content = (
      <Roulette
        strip={strip}
        winnerIndex={WINNER_INDEX}
        soundEnabled={soundEnabled}
        surprise={surpriseMode}
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
        onReset={resetDrawn}
        remaining={remaining}
        total={pool.length}
      />
    )
  }

  const showSettingsButton = auth.status === 'connected' && Boolean(activePlaylist)

  return (
    <Shell
      connected={auth.status === 'connected'}
      onOpenSettings={showSettingsButton ? () => setSettingsOpen(true) : undefined}
    >
      {content}
      {error && <ErrorToast message={error} onDismiss={() => setError(null)} />}
      {settingsOpen && (
        <SettingsPanel
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          surpriseMode={surpriseMode}
          onToggleSurprise={toggleSurprise}
          drawnCount={drawnInPool}
          onReset={resetDrawn}
          excludedCount={excludedIds.size}
          onManageSongs={() => {
            setSettingsOpen(false)
            setView('manage')
          }}
          onClose={() => setSettingsOpen(false)}
          onDisconnect={() => {
            setSettingsOpen(false)
            auth.disconnect()
          }}
        />
      )}
    </Shell>
  )
}

// ── Layout-Huelle mit Header (Einstellungen) ──────────────────

interface ShellProps {
  children: React.ReactNode
  connected: boolean
  onOpenSettings?: () => void
}

function Shell({ children, connected, onOpenSettings }: ShellProps) {
  return (
    <div className="app">
      <div className="bg-glow" aria-hidden="true" />
      <header className="app-header">
        <div className="app-header-actions">
          {connected && onOpenSettings && (
            <button className="icon-btn" onClick={onOpenSettings} title="Einstellungen" aria-label="Einstellungen">
              <GearIcon className="icon-btn-svg" />
            </button>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
