import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/i18n'
import { parseList, type ParsedLine } from '../spotify/convert'
import { KARAOKE_PRESETS } from '../data/karaokePresets'
import { DiceIcon } from './icons'

interface OfflineGuestProps {
  /** Startet das Roulette mit den (fertigen oder eingetippten) Songs. */
  onStart: (name: string, lines: ParsedLine[]) => void
  onCancel: () => void
}

/**
 * Offline-Gäste-Modus. Zeigt fertige Karaoke-Playlists als anklickbare
 * Karten (wie die Spotify-Ansicht) – ein Klick startet die Playlist.
 * Über „Eigene Liste" lassen sich Songs auch selbst eintippen.
 */
export function OfflineGuest({ onStart, onCancel }: OfflineGuestProps) {
  const { t } = useI18n()
  const [mode, setMode] = useState<'list' | 'custom'>('list')

  // ── Auswahl der fertigen Playlists ──
  if (mode === 'list') {
    return (
      <section className="stage fade-in">
        <header className="picker-header">
          <div>
            <h2 className="picker-title">{t('offline.title')}</h2>
            <p className="picker-subtitle">{t('offline.pickHint')}</p>
          </div>
          <button className="btn btn-ghost" onClick={onCancel}>
            {t('common.back')}
          </button>
        </header>

        <ul className="playlist-grid">
          {KARAOKE_PRESETS.map((preset) => {
            const name = t(`offline.preset.${preset.id}`)
            return (
              <li key={preset.id}>
                <button
                  className="playlist-card"
                  onClick={() => onStart(name, parseList(preset.songs.join('\n'), false))}
                  title={name}
                >
                  <div className="playlist-cover-wrap">
                    <div className={`offline-cover offline-cover-${preset.id}`}>
                      <span className="offline-cover-emoji">{preset.emoji}</span>
                    </div>
                  </div>
                  <div className="playlist-info">
                    <span className="playlist-name">{name}</span>
                    <span className="playlist-count">
                      {preset.songs.length} {t('common.songs')}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}

          {/* Eigene Liste eintippen */}
          <li>
            <button className="playlist-card" onClick={() => setMode('custom')}>
              <div className="playlist-cover-wrap">
                <div className="offline-cover offline-cover-custom">
                  <span className="offline-cover-emoji">✏️</span>
                </div>
              </div>
              <div className="playlist-info">
                <span className="playlist-name">{t('offline.custom.title')}</span>
                <span className="playlist-count">{t('offline.custom.hint')}</span>
              </div>
            </button>
          </li>
        </ul>
      </section>
    )
  }

  // ── Eigene Liste eintippen ──
  return <CustomForm onStart={onStart} onBack={() => setMode('list')} />
}

// ── Formular für eine selbst eingetippte Liste ───────────────

interface CustomFormProps {
  onStart: (name: string, lines: ParsedLine[]) => void
  onBack: () => void
}

function CustomForm({ onStart, onBack }: CustomFormProps) {
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
        <button className="btn btn-ghost" onClick={onBack}>
          {t('common.back')}
        </button>
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
