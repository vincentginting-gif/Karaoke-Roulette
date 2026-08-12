import { useI18n } from '../i18n/i18n'
import { MicIcon, SpotifyIcon } from './icons'

interface ConnectSpotifyProps {
  onConnect: () => void
}

/** Startscreen, solange keine Spotify-Verbindung besteht. */
export function ConnectSpotify({ onConnect }: ConnectSpotifyProps) {
  const { t } = useI18n()
  return (
    <section className="stage stage-center fade-in">
      <div className="brand">
        <div className="brand-mic glow">
          <MicIcon className="brand-mic-icon" />
        </div>
        <h1 className="brand-title">Karaoke Roulette</h1>
        <p className="brand-subtitle">{t('brand.subtitle')}</p>
      </div>

      <div className="connect-card">
        <h2 className="connect-heading">{t('connect.heading')}</h2>
        <p className="connect-text">{t('connect.text')}</p>
        <button className="btn btn-spotify" onClick={onConnect}>
          <SpotifyIcon className="btn-icon" />
          {t('connect.button')}
        </button>
      </div>
    </section>
  )
}
