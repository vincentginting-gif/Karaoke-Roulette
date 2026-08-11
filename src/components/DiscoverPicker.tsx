import { useState } from 'react'
import { GENRES, type Genre } from '../spotify/genres'
import { DiceIcon } from './icons'

interface DiscoverPickerProps {
  loading: boolean
  onStart: (genre: Genre, minPopularity: number) => void
  onCancel: () => void
}

/** Beschreibt eine Beliebtheits-Schwelle in Worten. */
function popularityLabel(v: number): string {
  if (v >= 75) return 'nur die größten Hits'
  if (v >= 55) return 'bekannte Songs'
  if (v >= 35) return 'ausgewogen – auch weniger Bekanntes'
  if (v >= 15) return 'viel Vielfalt, auch Geheimtipps'
  return 'alles, komplett gemischt'
}

/** Auswahl von Genre + Mindest-Beliebtheit fuer den Entdecken-Modus. */
export function DiscoverPicker({ loading, onStart, onCancel }: DiscoverPickerProps) {
  const [genre, setGenre] = useState<Genre | null>(null)
  const [minPop, setMinPop] = useState(50)

  return (
    <section className="stage fade-in">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">Nach Genre entdecken</h2>
          <p className="picker-subtitle">Songs aus ganz Spotify – wähle Genre & Beliebtheit.</p>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          Zu Playlists
        </button>
      </header>

      <p className="discover-step">1 · Genre</p>
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

      <p className="discover-step">2 · Beliebtheit</p>
      <div className="pop-control">
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={minPop}
          onChange={(e) => setMinPop(Number(e.target.value))}
          className="pop-slider"
          aria-label="Mindest-Beliebtheit"
        />
        <div className="pop-readout">
          <span className="pop-value">ab {minPop}/100</span>
          <span className="pop-desc">{popularityLabel(minPop)}</span>
        </div>
      </div>

      <div className="discover-actions">
        <button
          className="btn btn-primary btn-spin glow-strong"
          disabled={!genre || loading}
          onClick={() => genre && onStart(genre, minPop)}
        >
          <DiceIcon className="btn-icon" />
          {loading ? 'Lädt…' : genre ? `${genre.label} laden` : 'Genre wählen'}
        </button>
      </div>
    </section>
  )
}
