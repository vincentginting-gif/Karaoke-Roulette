import type { Track } from '../spotify/types'
import { AlbumCover } from './AlbumCover'
import { DiceIcon, ExternalIcon } from './icons'

interface ResultProps {
  track: Track
  onAgain: () => void
  onOpenSpotify: () => void
  onChangePlaylist: () => void
}

/** Ergebnisbereich – prominente Präsentation des Gewinner-Songs. */
export function Result({ track, onAgain, onOpenSpotify, onChangePlaylist }: ResultProps) {
  return (
    <section className="stage stage-center result result-in">
      <p className="result-kicker">Dein Song 🎤</p>

      <div className="result-cover-wrap glow-strong">
        <AlbumCover url={track.coverUrl} alt={`${track.title} – ${track.artist}`} className="result-cover" />
      </div>

      <h2 className="result-title">{track.title}</h2>
      <p className="result-artist">{track.artist}</p>

      <div className="result-actions">
        <button className="btn btn-spotify" onClick={onOpenSpotify}>
          <ExternalIcon className="btn-icon" />
          Auf Spotify öffnen
        </button>
        <button className="btn btn-primary" onClick={onAgain}>
          <DiceIcon className="btn-icon" />
          Noch einen Song
        </button>
      </div>

      <button className="btn btn-ghost result-switch" onClick={onChangePlaylist}>
        🔀 Playlist wechseln
      </button>
    </section>
  )
}
