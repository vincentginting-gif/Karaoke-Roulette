import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/i18n'
import { parseList, type ParsedLine } from '../spotify/convert'
import { KARAOKE_PRESETS } from '../data/karaokePresets'
import type { UserPlaylist } from '../data/userPlaylists'
import { Logo } from './Logo'
import { DiceIcon } from './icons'

interface OfflineGuestProps {
  /** Startet das Roulette mit einer fertigen Playlist. */
  onStart: (name: string, lines: ParsedLine[]) => void
  /** Neue eigene Playlist erstellen. */
  onNew: () => void
  /** Gespeicherte eigene Playlists. */
  userPlaylists: UserPlaylist[]
  onStartUser: (pl: UserPlaylist) => void
  onEditUser: (pl: UserPlaylist) => void
  onDeleteUser: (id: string) => void
}

/**
 * Offline-Auswahl (der Hauptweg). Oben die eigenen (gespeicherten) Playlists
 * inkl. „Neue Playlist erstellen", darunter die fertigen Karaoke-Playlists.
 * Der Zurück-Weg läuft über den globalen Header-Button.
 */
export function OfflineGuest({
  onStart,
  onNew,
  userPlaylists,
  onStartUser,
  onEditUser,
  onDeleteUser,
}: OfflineGuestProps) {
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

      {/* Eigene Playlists + Erstellen */}
      <h3 className="offline-section">{t('offline.sectionMine')}</h3>
      <ul className="offline-grid">
        <li>
          <button className="offline-card offline-card-create" onClick={onNew}>
            <div className="offline-cover offline-cover-custom">
              <span className="offline-cover-emoji">＋</span>
            </div>
            <div className="offline-card-info">
              <span className="offline-card-name">{t('offline.newList')}</span>
              <span className="offline-card-desc">{t('offline.custom.hint')}</span>
            </div>
          </button>
        </li>

        {userPlaylists.map((pl) => (
          <li key={pl.id}>
            <div className="offline-card offline-card-user">
              <button className="offline-card-hit" onClick={() => onStartUser(pl)} title={pl.name}>
                <div className="offline-cover offline-cover-mine">
                  <span className="offline-cover-emoji">🎵</span>
                  <span className="offline-card-badge">{pl.songs.length}</span>
                </div>
                <div className="offline-card-info">
                  <span className="offline-card-name">{pl.name}</span>
                  <span className="offline-card-desc">
                    {pl.songs.length} {t('common.songs')}
                  </span>
                </div>
              </button>
              <div className="offline-card-tools">
                <button
                  className="offline-tool"
                  onClick={() => onEditUser(pl)}
                  aria-label={t('offline.edit')}
                  title={t('offline.edit')}
                >
                  ✏️
                </button>
                <button
                  className="offline-tool"
                  onClick={() => {
                    if (window.confirm(t('offline.deleteConfirm', { name: pl.name }))) {
                      onDeleteUser(pl.id)
                    }
                  }}
                  aria-label={t('offline.delete')}
                  title={t('offline.delete')}
                >
                  🗑️
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Fertige Playlists */}
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
    </section>
  )
}

// ── Eigene Liste erstellen / bearbeiten (Zurück über Header) ──

interface OfflineCustomProps {
  /** Zu bearbeitende Playlist (sonst: neu erstellen). */
  initial: UserPlaylist | null
  /** Speichert (neu oder aktualisiert). */
  onSave: (name: string, lines: ParsedLine[]) => void
}

export function OfflineCustom({ initial, onSave }: OfflineCustomProps) {
  const { t } = useI18n()
  const [text, setText] = useState(initial ? initial.songs.join('\n') : '')
  const [name, setName] = useState(initial ? initial.name : '')
  const [artistFirst, setArtistFirst] = useState(false)

  const parsed = useMemo(() => parseList(text, artistFirst), [text, artistFirst])

  return (
    <section className="stage fade-in conv">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">
            {initial ? t('offline.editTitle') : t('offline.createTitle')}
          </h2>
          <p className="picker-subtitle">{t('offline.subtitle')}</p>
        </div>
      </header>

      <div className="conv-input">
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

        <div className="conv-actions">
          <span className="conv-parsed">
            {parsed.length > 0 ? t('convert.parsedCount', { n: parsed.length }) : ' '}
          </span>
          <button
            className="btn btn-primary btn-spin glow-strong"
            disabled={parsed.length === 0}
            onClick={() => onSave(name.trim() || t('offline.defaultName'), parsed)}
          >
            <DiceIcon className="btn-icon" />
            {initial ? t('offline.saveBtn') : t('offline.createBtn')}
          </button>
        </div>
      </div>
    </section>
  )
}
