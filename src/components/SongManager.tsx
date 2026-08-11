import type { Track } from '../spotify/types'
import { AlbumCover } from './AlbumCover'

interface SongManagerProps {
  playlistName: string
  tracks: Track[]
  excludedIds: Set<string>
  onToggleExclude: (trackId: string) => void
  onBack: () => void
}

/**
 * Liste aller Songs der Playlist. Entfernte Songs werden nicht mehr gezogen
 * (rein lokal – die Spotify-Playlist selbst bleibt unveraendert).
 */
export function SongManager({
  playlistName,
  tracks,
  excludedIds,
  onToggleExclude,
  onBack,
}: SongManagerProps) {
  const activeCount = tracks.length - excludedIds.size

  return (
    <section className="stage fade-in">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">Songs verwalten</h2>
          <p className="picker-subtitle">
            {playlistName} · {activeCount} im Pool
            {excludedIds.size > 0 ? ` · ${excludedIds.size} entfernt` : ''}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>
          Fertig
        </button>
      </header>

      <p className="manager-hint">
        Entfernte Songs werden nicht mehr gezogen. Das ändert deine Spotify-Playlist nicht –
        du kannst sie jederzeit wieder hinzufügen.
      </p>

      <ul className="song-list">
        {tracks.map((t) => {
          const excluded = excludedIds.has(t.id)
          return (
            <li key={t.id} className={`song-row${excluded ? ' song-row-excluded' : ''}`}>
              <AlbumCover url={t.coverUrl} alt={t.title} className="song-row-cover" />
              <span className="song-row-info">
                <span className="song-row-title">{t.title}</span>
                <span className="song-row-artist">{t.artist}</span>
              </span>
              <button
                className={`btn btn-ghost song-row-btn${excluded ? ' restore' : ''}`}
                onClick={() => onToggleExclude(t.id)}
              >
                {excluded ? 'Zurückholen' : 'Entfernen'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
