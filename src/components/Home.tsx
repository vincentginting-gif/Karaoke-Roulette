import type { Playlist } from '../spotify/types'
import { AlbumCover } from './AlbumCover'
import { DiceIcon, MicIcon, TrashIcon, UndoIcon } from './icons'

interface HomeProps {
  playlist: Playlist
  onSpin: () => void
  onChangePlaylist: () => void
  onManageSongs: () => void
  onReset: () => void
  remaining: number
  total: number
}

/** Startseite nach Verbindung + Playlist-Auswahl: der große Button. */
export function Home({
  playlist,
  onSpin,
  onChangePlaylist,
  onManageSongs,
  onReset,
  remaining,
  total,
}: HomeProps) {
  const drawn = total - remaining
  return (
    <section className="stage stage-center fade-in">
      <div className="brand brand-compact">
        <div className="brand-mic glow">
          <MicIcon className="brand-mic-icon" />
        </div>
        <h1 className="brand-title">Karaoke Roulette</h1>
        <p className="brand-subtitle">Lass den Zufall entscheiden, was du heute singst.</p>
      </div>

      <button className="active-playlist" onClick={onChangePlaylist} title="Playlist wechseln">
        <AlbumCover url={playlist.imageUrl} alt={playlist.name} className="active-playlist-cover" />
        <span className="active-playlist-meta">
          <span className="active-playlist-label">Playlist</span>
          <span className="active-playlist-name">{playlist.name}</span>
        </span>
        <span className="active-playlist-change">wechseln</span>
      </button>

      <button className="btn btn-primary btn-spin glow-strong" onClick={onSpin}>
        <DiceIcon className="btn-icon" />
        Song auswählen
      </button>

      <div className="home-actions">
        <button className="btn btn-ghost" onClick={onChangePlaylist}>
          🔀 Playlist wechseln
        </button>
        <button className="btn btn-ghost" onClick={onManageSongs}>
          <TrashIcon className="btn-icon" />
          Songs verwalten
        </button>
      </div>

      <p className="remaining-hint">
        {total > 0 && (
          <>
            Noch {remaining} von {total} {total === 1 ? 'Song' : 'Songs'} ungezogen
          </>
        )}
      </p>

      {drawn > 0 && (
        <button className="btn btn-ghost btn-reset" onClick={onReset}>
          <UndoIcon className="btn-icon" />
          Gezogene zurücksetzen ({drawn})
        </button>
      )}
    </section>
  )
}
