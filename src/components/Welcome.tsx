import { useI18n } from '../i18n/i18n'
import { DiceIcon, MicIcon, SpotifyIcon } from './icons'

interface WelcomeProps {
  connected: boolean
  onConnect: () => void
  onStart: () => void
  guestAvailable?: boolean
  onGuest?: () => void
  /** Offline-Modus starten (Songs eintippen, kein Spotify). */
  onOffline?: () => void
}

/** Homepage / Landing: erklärt die App und führt zum Start. */
export function Welcome({ connected, onConnect, onStart, guestAvailable, onGuest, onOffline }: WelcomeProps) {
  const { t } = useI18n()
  const steps = [t('welcome.step1'), t('welcome.step2'), t('welcome.step3')]

  return (
    <section className="stage stage-center fade-in welcome">
      <div className="brand">
        <div className="brand-mic glow">
          <MicIcon className="brand-mic-icon" />
        </div>
        <h1 className="brand-title">Karaoke Roulette</h1>
        <p className="brand-subtitle">{t('brand.subtitle')}</p>
      </div>

      <p className="welcome-intro">{t('welcome.intro')}</p>

      <div className="welcome-how">
        <h2 className="welcome-how-title">{t('welcome.how')}</h2>
        <ol className="welcome-steps">
          {steps.map((s, i) => (
            <li className="welcome-step" key={i}>
              <span className="welcome-step-num">{i + 1}</span>
              <span className="welcome-step-text">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {connected ? (
        <button className="btn btn-primary btn-spin glow-strong" onClick={onStart}>
          <DiceIcon className="btn-icon" />
          {t('welcome.start')}
        </button>
      ) : (
        <div className="welcome-cta">
          <button className="btn btn-spotify" onClick={onConnect}>
            <SpotifyIcon className="btn-icon" />
            {t('connect.button')}
          </button>
          {onOffline && (
            <button className="btn btn-primary" onClick={onOffline}>
              <DiceIcon className="btn-icon" />
              {t('welcome.offline')}
            </button>
          )}
          {guestAvailable && onGuest && (
            <button className="btn btn-ghost" onClick={onGuest}>
              <DiceIcon className="btn-icon" />
              {t('welcome.guest')}
            </button>
          )}
        </div>
      )}
      {!connected && onOffline && <p className="welcome-offline-hint">{t('welcome.offlineHint')}</p>}
    </section>
  )
}
