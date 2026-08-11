import type { Playlist } from '../spotify/types'
import { AlbumCover } from './AlbumCover'
import { DiceIcon, MicIcon } from './icons'

interface HomeProps {
  playlist: Playlist
  onSpin: () => void
  onChangePlaylist: () => void
  remaining: number
  total: number
}

/** Startseite nach Verbindung + Playlist-Auswahl: der grosse Button. */
export function Home({ playlist, onSpin, onChangePlaylist, remaining, total }: HomeProps) {
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
        Song auswaehlen
      </button>

      <button className="btn btn-ghost" onClick={onChangePlaylist}>
        🔀 Playlist wechseln
      </button>

      <p className="remaining-hint">
        {total > 0 && (
          <>
            Noch {remaining} von {total} {total === 1 ? 'Song' : 'Songs'} ungezogen
          </>
        )}
      </p>
    </section>
  )
}
