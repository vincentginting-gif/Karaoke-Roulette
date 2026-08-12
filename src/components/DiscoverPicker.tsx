import { useState } from 'react'
import { GENRES, type Genre } from '../spotify/genres'
import { useI18n } from '../i18n/i18n'
import { DiceIcon } from './icons'

interface DiscoverPickerProps {
  loading: boolean
  onStart: (genre: Genre) => void
  onCancel: () => void
}

/** Auswahl eines Genres für den Entdecken-Modus. */
export function DiscoverPicker({ loading, onStart, onCancel }: DiscoverPickerProps) {
  const { t } = useI18n()
  const [genre, setGenre] = useState<Genre | null>(null)

  return (
    <section className="stage fade-in">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">{t('discover.title')}</h2>
          <p className="picker-subtitle">{t('discover.subtitle')}</p>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          {t('common.toPlaylists')}
        </button>
      </header>

      <div className="genre-grid">
        {GENRES.map((g) => (
          <button
            key={g.query}
            className={`genre-card${genre?.query === g.query ? ' genre-card-active' : ''}`}
            onClick={() => setGenre(g)}
          >
            <span className="genre-emoji">{g.emoji}</span>
            <span className="genre-label">{g.label}</span>
          </button>
        ))}
      </div>

      <div className="discover-actions">
        <button
          className="btn btn-primary btn-spin glow-strong"
          disabled={!genre || loading}
          onClick={() => genre && onStart(genre)}
        >
          <DiceIcon className="btn-icon" />
          {loading
            ? t('common.loading')
            : genre
              ? t('discover.loadGenre', { genre: genre.label })
              : t('discover.chooseGenre')}
        </button>
      </div>
    </section>
  )
}
