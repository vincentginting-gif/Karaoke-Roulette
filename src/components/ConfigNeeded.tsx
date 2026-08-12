import { useI18n } from '../i18n/i18n'
import { MicIcon } from './icons'

/** Wird angezeigt, wenn keine Spotify Client-ID konfiguriert ist. */
export function ConfigNeeded() {
  const { t } = useI18n()
  return (
    <section className="stage stage-center fade-in">
      <div className="brand">
        <div className="brand-mic glow">
          <MicIcon className="brand-mic-icon" />
        </div>
        <h1 className="brand-title">Karaoke Roulette</h1>
      </div>

      <div className="connect-card">
        <h2 className="connect-heading">{t('config.heading')}</h2>
        <p className="connect-text">{t('config.text')}</p>
        <ol className="setup-steps">
          <li>{t('config.step1')}</li>
          <li>
            {t('config.step2pre')}{' '}
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
              Spotify Developer Dashboard
            </a>{' '}
            {t('config.step2post')}
          </li>
          <li>{t('config.step3')}</li>
          <li>{t('config.step4')}</li>
        </ol>
        <p className="connect-text muted">
          {t('config.details')} <code>README.md</code>.
        </p>
      </div>
    </section>
  )
}
