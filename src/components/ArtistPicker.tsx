import { useState } from 'react'
import { DiceIcon } from './icons'

interface ArtistPickerProps {
  loading: boolean
  initialArtists: string[]
  onStart: (artists: string[]) => void
  onCancel: () => void
}

/** Ein paar Vorschläge zum schnellen Hinzufügen. */
const SUGGESTIONS = [
  'Taylor Swift',
  'Ed Sheeran',
  'Queen',
  'ABBA',
  'Michael Jackson',
  'Rihanna',
  'Coldplay',
  'Die Ärzte',
]

/** Auswahl von Artists: die App zieht dann zufällige Songs dieser Artists. */
export function ArtistPicker({ loading, initialArtists, onStart, onCancel }: ArtistPickerProps) {
  const [artists, setArtists] = useState<string[]>(initialArtists)
  const [input, setInput] = useState('')

  const add = (raw: string) => {
    const name = raw.trim()
    if (!name) return
    if (artists.some((a) => a.toLowerCase() === name.toLowerCase())) {
      setInput('')
      return
    }
    setArtists((prev) => [...prev, name])
    setInput('')
  }

  const remove = (name: string) => setArtists((prev) => prev.filter((a) => a !== name))

  const openSuggestions = SUGGESTIONS.filter(
    (s) => !artists.some((a) => a.toLowerCase() === s.toLowerCase()),
  )

  return (
    <section className="stage fade-in">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">Songs nach Artist</h2>
          <p className="picker-subtitle">
            Füge Artists hinzu – gezogen werden zufällige Songs von ihnen.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          Zu Playlists
        </button>
      </header>

      <form
        className="artist-add"
        onSubmit={(e) => {
          e.preventDefault()
          add(input)
        }}
      >
        <input
          className="artist-input"
          type="text"
          placeholder="Artist eingeben, z. B. Adele"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Artist hinzufügen"
        />
        <button type="submit" className="btn btn-ghost artist-add-btn" disabled={!input.trim()}>
          Hinzufügen
        </button>
      </form>

      {artists.length > 0 && (
        <div className="artist-chips">
          {artists.map((a) => (
            <span key={a} className="artist-chip">
              {a}
              <button
                className="artist-chip-x"
                onClick={() => remove(a)}
                aria-label={`${a} entfernen`}
                title="Entfernen"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {openSuggestions.length > 0 && (
        <div className="artist-suggest">
          <span className="artist-suggest-label">Vorschläge:</span>
          {openSuggestions.map((s) => (
            <button key={s} className="artist-suggest-chip" onClick={() => add(s)}>
              + {s}
            </button>
          ))}
        </div>
      )}

      <div className="discover-actions">
        <button
          className="btn btn-primary btn-spin glow-strong"
          disabled={artists.length === 0 || loading}
          onClick={() => onStart(artists)}
        >
          <DiceIcon className="btn-icon" />
          {loading
            ? 'Lädt…'
            : artists.length === 0
              ? 'Artist hinzufügen'
              : `Songs laden (${artists.length})`}
        </button>
      </div>
    </section>
  )
}
