import { useState } from 'react'
import { useI18n } from '../i18n/i18n'
import { MicIcon, SpotifyIcon } from './icons'

interface PlatformPickerProps {
  onSelectSpotify: () => void
}

type PlatformId = 'spotify' | 'apple' | 'melon' | 'youtube'

const PLATFORMS: {
  id: PlatformId
  name: string
  emoji: string
  available: boolean
  bodyKey?: string
}[] = [
  { id: 'spotify', name: 'Spotify', emoji: '', available: true },
  { id: 'apple', name: 'Apple Music', emoji: '🍎', available: false, bodyKey: 'platform.apple.body' },
  { id: 'melon', name: 'Melon', emoji: '🍈', available: false, bodyKey: 'platform.melon.body' },
  { id: 'youtube', name: 'YouTube Music', emoji: '📺', available: false, bodyKey: 'platform.youtube.body' },
]

/** Erster Startscreen: Wahl des Musikdienstes (+ Sprache). */
export function PlatformPicker({ onSelectSpotify }: PlatformPickerProps) {
  const { t } = useI18n()
  const [info, setInfo] = useState<(typeof PLATFORMS)[number] | null>(null)

  return (
    <section className="stage stage-center fade-in">
      <div className="brand brand-compact">
        <div className="brand-mic glow">
          <MicIcon className="brand-mic-icon" />
        </div>
        <h1 className="brand-title">Karaoke Roulette</h1>
      </div>

      <div className="platform-head">
        <h2 className="platform-title">{t('platform.title')}</h2>
        <p className="platform-subtitle">{t('platform.subtitle')}</p>
      </div>

      <div className="platform-grid">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            className={`platform-card${p.available ? ' platform-card-on' : ''}`}
            onClick={() => (p.available ? onSelectSpotify() : setInfo(p))}
          >
            <span className="platform-icon" aria-hidden="true">
              {p.id === 'spotify' ? <SpotifyIcon className="platform-icon-svg" /> : p.emoji}
            </span>
            <span className="platform-name">{p.name}</span>
            <span className={`platform-badge${p.available ? ' on' : ''}`}>
              {p.available ? t('platform.supported') : t('platform.comingSoon')}
            </span>
          </button>
        ))}
      </div>

      {info && (
        <div className="platform-note" role="status">
          <h3 className="platform-note-title">
            {t('platform.unavailableTitle', { name: info.name })}
          </h3>
          <p className="platform-note-body">{info.bodyKey ? t(info.bodyKey) : ''}</p>
          <button className="btn btn-spotify" onClick={onSelectSpotify}>
            <SpotifyIcon className="btn-icon" />
            {t('platform.useSpotify')}
          </button>
        </div>
      )}

      {!info && (
        <button className="btn btn-primary btn-spin glow-strong" onClick={onSelectSpotify}>
          <SpotifyIcon className="btn-icon" />
          {t('platform.continue')}
        </button>
      )}
    </section>
  )
}
