import { useState } from 'react'
import { GENRES, type Genre } from '../spotify/genres'
import { DiceIcon } from './icons'

interface DiscoverPickerProps {
  loading: boolean
  onStart: (genre: Genre) => void
  onCancel: () => void
}

/** Auswahl eines Genres für den Entdecken-Modus. */
export function DiscoverPicker({ loading, onStart, onCancel }: DiscoverPickerProps) {
  const [genre, setGenre] = useState<Genre | null>(null)

  return (
    <section className="stage fade-in">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">Nach Genre entdecken</h2>
          <p className="picker-subtitle">Songs aus ganz Spotify – wähle ein Genre.</p>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          Zu Playlists
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
          {loading ? 'Lädt…' : genre ? `${genre.label} laden` : 'Genre wählen'}
        </button>
      </div>
    </section>
  )
}
