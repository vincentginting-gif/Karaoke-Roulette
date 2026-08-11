import { useState } from 'react'
import { DiceIcon } from './icons'

interface ChipQueryPickerProps {
  title: string
  subtitle: string
  /** Nomen im Singular für Labels, z. B. "Artist" oder "Album". */
  itemNoun: string
  placeholder: string
  suggestions: string[]
  initialItems: string[]
  initialLimit: number
  loading: boolean
  onStart: (items: string[], perItemLimit: number) => void
  onCancel: () => void
}

const LIMIT_OPTIONS = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 0, label: 'Alle' },
]

/**
 * Wiederverwendbarer Picker: Namen als Chips sammeln, ein Limit pro Name
 * wählen und laden. Wird für den Artist- und den Album-Modus genutzt.
 */
export function ChipQueryPicker({
  title,
  subtitle,
  itemNoun,
  placeholder,
  suggestions,
  initialItems,
  initialLimit,
  loading,
  onStart,
  onCancel,
}: ChipQueryPickerProps) {
  const [items, setItems] = useState<string[]>(initialItems)
  const [input, setInput] = useState('')
  const [limit, setLimit] = useState<number>(initialLimit)

  const add = (raw: string) => {
    const name = raw.trim()
    if (!name) return
    if (!items.some((a) => a.toLowerCase() === name.toLowerCase())) {
      setItems((prev) => [...prev, name])
    }
    setInput('')
  }

  const remove = (name: string) => setItems((prev) => prev.filter((a) => a !== name))

  const openSuggestions = suggestions.filter(
    (s) => !items.some((a) => a.toLowerCase() === s.toLowerCase()),
  )

  return (
    <section className="stage fade-in">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">{title}</h2>
          <p className="picker-subtitle">{subtitle}</p>
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
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label={`${itemNoun} hinzufügen`}
        />
        <button type="submit" className="btn btn-ghost artist-add-btn" disabled={!input.trim()}>
          Hinzufügen
        </button>
      </form>

      {items.length > 0 && (
        <div className="artist-chips">
          {items.map((a) => (
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

      <div className="limit-row">
        <span className="limit-label">Songs pro {itemNoun}</span>
        <div className="limit-chips" role="group" aria-label={`Songs pro ${itemNoun}`}>
          {LIMIT_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`limit-chip${limit === o.value ? ' limit-chip-active' : ''}`}
              onClick={() => setLimit(o.value)}
              aria-pressed={limit === o.value}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="discover-actions">
        <button
          className="btn btn-primary btn-spin glow-strong"
          disabled={items.length === 0 || loading}
          onClick={() => onStart(items, limit)}
        >
          <DiceIcon className="btn-icon" />
          {loading
            ? 'Lädt…'
            : items.length === 0
              ? `${itemNoun} hinzufügen`
              : `Songs laden (${items.length})`}
        </button>
      </div>
    </section>
  )
}
