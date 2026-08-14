import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/i18n'
import { parseList, type ParsedLine } from '../spotify/convert'
import { KARAOKE_PRESETS } from '../data/karaokePresets'
import { Logo } from './Logo'
import { DiceIcon } from './icons'

interface OfflineGuestProps {
  /** Startet das Roulette mit einer fertigen Playlist. */
  onStart: (name: string, lines: ParsedLine[]) => void
  /** Zur „Eigene Liste"-Eingabe wechseln. */
  onCustom: () => void
}

/**
 * Offline-Auswahl (der Hauptweg). Zeigt fertige Karaoke-Playlists als
 * gemütliche, sortierte Karten – ein Klick startet die Playlist. Der
 * Zurück-Weg läuft über den globalen Header-Button.
 */
export function OfflineGuest({ onStart, onCustom }: OfflineGuestProps) {
  const { t } = useI18n()
  return (
    <section className="stage fade-in offline-home">
      <header className="offline-header">
        <div className="offline-header-logo" aria-hidden="true">
          <Logo />
        </div>
        <div className="offline-header-text">
          <h2 className="offline-heading">{t('offline.title')}</h2>
          <p className="offline-subheading">{t('offline.pickHint')}</p>
        </div>
      </header>

      <h3 className="offline-section">{t('offline.sectionReady')}</h3>
      <ul className="offline-grid">
        {KARAOKE_PRESETS.map((preset) => {
          const name = t(`offline.preset.${preset.id}`)
          return (
            <li key={preset.id}>
              <button
                className="offline-card"
                onClick={() => onStart(name, parseList(preset.songs.join('\n'), false))}
                title={name}
              >
                <div className={`offline-cover offline-cover-${preset.id}`}>
                  <span className="offline-cover-emoji">{preset.emoji}</span>
                  <span className="offline-card-badge">{preset.songs.length}</span>
                </div>
                <div className="offline-card-info">
                  <span className="offline-card-name">{name}</span>
                  <span className="offline-card-desc">{t(`offline.desc.${preset.id}`)}</span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <h3 className="offline-section">{t('offline.sectionOwn')}</h3>
      <button className="offline-custom-card" onClick={onCustom}>
        <span className="offline-custom-icon" aria-hidden="true">
          ✏️
        </span>
        <span className="offline-custom-text">
          <span className="offline-custom-title">{t('offline.custom.title')}</span>
          <span className="offline-custom-hint">{t('offline.custom.hint')}</span>
        </span>
        <span className="offline-custom-arrow" aria-hidden="true">
          →
        </span>
      </button>
    </section>
  )
}

// ── Eigene Liste eintippen (separater View; Zurück über Header) ──

interface OfflineCustomProps {
  onStart: (name: string, lines: ParsedLine[]) => void
}

export function OfflineCustom({ onStart }: OfflineCustomProps) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [artistFirst, setArtistFirst] = useState(false)

  const parsed = useMemo(() => parseList(text, artistFirst), [text, artistFirst])

  return (
    <section className="stage fade-in conv">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">{t('offline.custom.title')}</h2>
          <p className="picker-subtitle">{t('offline.subtitle')}</p>
        </div>
      </header>

      <div className="conv-input">
        <p className="conv-tip">{t('offline.tip')}</p>

        <textarea
          className="conv-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('offline.placeholder')}
          rows={10}
          spellCheck={false}
          aria-label={t('offline.custom.title')}
        />
        <p className="conv-hint">{t('convert.commaHint')}</p>

        <div className="conv-row">
          <span className="conv-row-label">{t('convert.order')}</span>
          <div className="conv-seg" role="group" aria-label={t('convert.order')}>
            <button
              className={`conv-seg-btn${!artistFirst ? ' is-active' : ''}`}
              onClick={() => setArtistFirst(false)}
              aria-pressed={!artistFirst}
            >
              {t('convert.orderTitleFirst')}
            </button>
            <button
              className={`conv-seg-btn${artistFirst ? ' is-active' : ''}`}
              onClick={() => setArtistFirst(true)}
              aria-pressed={artistFirst}
            >
              {t('convert.orderArtistFirst')}
            </button>
          </div>
        </div>

        <div className="conv-row">
          <span className="conv-row-label">{t('offline.nameLabel')}</span>
          <input
            className="conv-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('offline.namePlaceholder')}
            aria-label={t('offline.nameLabel')}
          />
        </div>

        <div className="conv-actions">
          <span className="conv-parsed">
            {parsed.length > 0 ? t('convert.parsedCount', { n: parsed.length }) : ' '}
          </span>
          <button
            className="btn btn-primary btn-spin glow-strong"
            disabled={parsed.length === 0}
            onClick={() => onStart(name.trim() || t('offline.defaultName'), parsed)}
          >
            <DiceIcon className="btn-icon" />
            {t('offline.start')}
          </button>
        </div>
      </div>
    </section>
  )
}
