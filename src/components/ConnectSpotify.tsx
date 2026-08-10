import { MicIcon, SpotifyIcon } from './icons'

interface ConnectSpotifyProps {
  onConnect: () => void
}

/** Startscreen, solange keine Spotify-Verbindung besteht. */
export function ConnectSpotify({ onConnect }: ConnectSpotifyProps) {
  return (
    <section className="stage stage-center fade-in">
      <div className="brand">
        <div className="brand-mic glow">
          <MicIcon className="brand-mic-icon" />
        </div>
        <h1 className="brand-title">Karaoke Roulette</h1>
        <p className="brand-subtitle">Lass den Zufall entscheiden, was du heute singst.</p>
      </div>

      <div className="connect-card">
        <h2 className="connect-heading">Verbinde Spotify</h2>
        <p className="connect-text">
          Melde dich mit Spotify an, um deine Playlists zu laden. Es wird nur
          Lesezugriff auf deine Playlists angefragt – keine Wiedergabe, keine
          Aenderungen.
        </p>
        <button className="btn btn-spotify" onClick={onConnect}>
          <SpotifyIcon className="btn-icon" />
          Mit Spotify verbinden
        </button>
      </div>
    </section>
  )
}
