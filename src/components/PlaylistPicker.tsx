import type { Playlist } from '../spotify/types'
import { AlbumCover } from './AlbumCover'
import { Spinner } from './Spinner'

interface PlaylistPickerProps {
  playlists: Playlist[]
  loading: boolean
  onSelect: (playlist: Playlist) => void
  onDiscover: () => void
  onCancel?: () => void
}

/** Auswahl-Grid der Nutzer-Playlists. */
export function PlaylistPicker({ playlists, loading, onSelect, onDiscover, onCancel }: PlaylistPickerProps) {
  return (
    <section className="stage fade-in">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">Waehle deine Karaoke-Playlist</h2>
          <p className="picker-subtitle">Aus dieser Playlist wird gezogen.</p>
        </div>
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel}>
            Zurueck
          </button>
        )}
      </header>

      <button className="discover-banner" onClick={onDiscover}>
        <span className="discover-banner-emoji">🎧</span>
        <span className="discover-banner-text">
          <span className="discover-banner-title">Oder nach Genre entdecken</span>
          <span className="discover-banner-hint">
            Songs aus ganz Spotify – nach Genre & Beliebtheit
          </span>
        </span>
        <span className="discover-banner-arrow">→</span>
      </button>

      {loading ? (
        <Spinner label="Playlists werden geladen…" />
      ) : playlists.length === 0 ? (
        <div className="empty-state">
          <p>Es wurden keine Playlists in deinem Spotify-Konto gefunden.</p>
        </div>
      ) : (
        <ul className="playlist-grid">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <button
                className={`playlist-card${pl.isOwn ? '' : ' playlist-card-foreign'}`}
                onClick={() => onSelect(pl)}
                title={
                  pl.isOwn
                    ? pl.name
                    : `${pl.name} – von Spotify erstellt, ueber die API evtl. nicht ladbar`
                }
              >
                <div className="playlist-cover-wrap">
                  <AlbumCover url={pl.imageUrl} alt={pl.name} className="playlist-cover" />
                  {!pl.isOwn && <span className="playlist-badge">Spotify</span>}
                </div>
                <div className="playlist-info">
                  <span className="playlist-name">{pl.name}</span>
                  <span className="playlist-count">
                    {pl.trackCount} {pl.trackCount === 1 ? 'Song' : 'Songs'}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
