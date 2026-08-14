import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/i18n'
import { parseList, type ParsedLine } from '../spotify/convert'
import { KARAOKE_PRESETS } from '../data/karaokePresets'
import { DiceIcon } from './icons'

interface OfflineGuestProps {
  /** Startet das Roulette mit den eingetippten Songs. */
  onStart: (name: string, lines: ParsedLine[]) => void
  onCancel: () => void
}

/**
 * Offline-Gäste-Modus: Songs + Interpreten eintippen und sofort spinnen –
 * ganz ohne Spotify-Login. Die Cover kommen aus einem geteilten Bild
 * (zufällig zugewiesen).
 */
export function OfflineGuest({ onStart, onCancel }: OfflineGuestProps) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [artistFirst, setArtistFirst] = useState(false)

  const parsed = useMemo(() => parseList(text, artistFirst), [text, artistFirst])

  return (
    <section className="stage fade-in conv">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">{t('offline.title')}</h2>
          <p className="picker-subtitle">{t('offline.subtitle')}</p>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          {t('common.back')}
        </button>
      </header>

      <div className="conv-input">
        <div className="conv-import-row offline-presets">
          <span className="conv-import-label">{t('offline.presetsIntro')}</span>
          <div className="offline-preset-btns">
            {KARAOKE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className="btn btn-ghost"
                onClick={() =>
                  setText((prev) => {
                    const block = preset.songs.join('\n')
                    return prev.trim() ? `${prev.trimEnd()}\n${block}` : block
                  })
                }
                title={t(`offline.preset.${preset.id}`, { n: preset.songs.length })}
              >
                {preset.emoji} {t(`offline.preset.${preset.id}`, { n: preset.songs.length })}
              </button>
            ))}
          </div>
        </div>

        <p className="conv-tip">{t('offline.tip')}</p>

        <textarea
          className="conv-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('offline.placeholder')}
          rows={10}
          spellCheck={false}
          aria-label={t('offline.title')}
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
