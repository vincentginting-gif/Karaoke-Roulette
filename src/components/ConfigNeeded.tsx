import { MicIcon } from './icons'

/** Wird angezeigt, wenn keine Spotify Client-ID konfiguriert ist. */
export function ConfigNeeded() {
  return (
    <section className="stage stage-center fade-in">
      <div className="brand">
        <div className="brand-mic glow">
          <MicIcon className="brand-mic-icon" />
        </div>
        <h1 className="brand-title">Karaoke Roulette</h1>
      </div>

      <div className="connect-card">
        <h2 className="connect-heading">Fast fertig – kurze Einrichtung</h2>
        <p className="connect-text">
          Es ist noch keine Spotify <strong>Client-ID</strong> hinterlegt. So
          richtest du sie ein:
        </p>
        <ol className="setup-steps">
          <li>
            Kopiere <code>.env.example</code> zu <code>.env</code>
          </li>
          <li>
            Trage deine <code>VITE_SPOTIFY_CLIENT_ID</code> aus dem{' '}
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
              Spotify Developer Dashboard
            </a>{' '}
            ein
          </li>
          <li>
            Hinterlege die Redirect-URI <code>http://127.0.0.1:5173/callback</code> im
            Dashboard
          </li>
          <li>Dev-Server neu starten</li>
        </ol>
        <p className="connect-text muted">
          Details stehen in der <code>README.md</code>.
        </p>
      </div>
    </section>
  )
}
