import { useMemo, useState } from 'react'
import type { Playlist, Track } from '../spotify/types'
import { AlbumCover } from './AlbumCover'
import { ClockIcon, SearchIcon } from './icons'

interface SongManagerProps {
  playlist: Playlist
  tracks: Track[]
  excludedIds: Set<string>
  onToggleExclude: (trackId: string) => void
  onBack: () => void
}

type SortKey = 'playlist' | 'title' | 'artist' | 'album' | 'duration' | 'pool'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'playlist', label: 'Playlist-Reihenfolge' },
  { value: 'title', label: 'Titel A–Z' },
  { value: 'artist', label: 'Artist A–Z' },
  { value: 'album', label: 'Album A–Z' },
  { value: 'duration', label: 'Dauer (kurz → lang)' },
  { value: 'pool', label: 'Entfernte zuerst' },
]

/** mm:ss aus Millisekunden. */
function formatDuration(ms: number): string {
  if (!ms) return '–'
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Gesamtdauer der Playlist menschenlesbar. */
function formatTotal(tracks: Track[]): string {
  const ms = tracks.reduce((sum, t) => sum + (t.durationMs || 0), 0)
  if (!ms) return ''
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} Min.`
  const h = Math.floor(min / 60)
  return `${h} Std. ${min % 60} Min.`
}

/**
 * Song-Verwaltung im Stil der Spotify-Playlist-Ansicht: Cover-Header mit
 * Verlauf, darunter eine nummerierte Track-Liste. Ein Klick auf eine Zeile
 * nimmt den Song aus dem Pool (bzw. holt ihn zurück) – rein lokal, die
 * Spotify-Playlist selbst bleibt unverändert.
 */
export function SongManager({
  playlist,
  tracks,
  excludedIds,
  onToggleExclude,
  onBack,
}: SongManagerProps) {
  const activeCount = tracks.length - excludedIds.size
  const totalLabel = formatTotal(tracks)

  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('playlist')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? tracks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q) ||
            t.album.toLowerCase().includes(q),
        )
      : tracks

    if (sortKey === 'playlist') return filtered

    const withIdx = filtered.map((t, i) => ({ t, i }))
    const cmp = (a: { t: Track; i: number }, b: { t: Track; i: number }): number => {
      switch (sortKey) {
        case 'title':
          return a.t.title.localeCompare(b.t.title, 'de', { sensitivity: 'base' })
        case 'artist':
          return a.t.artist.localeCompare(b.t.artist, 'de', { sensitivity: 'base' })
        case 'album':
          return a.t.album.localeCompare(b.t.album, 'de', { sensitivity: 'base' })
        case 'duration':
          return (a.t.durationMs || 0) - (b.t.durationMs || 0)
        case 'pool': {
          const ea = excludedIds.has(a.t.id) ? 0 : 1
          const eb = excludedIds.has(b.t.id) ? 0 : 1
          return ea - eb
        }
        default:
          return 0
      }
    }
    return withIdx
      .sort((a, b) => cmp(a, b) || a.i - b.i)
      .map((x) => x.t)
  }, [tracks, query, sortKey, excludedIds])

  return (
    <section className="stage sp-view fade-in">
      <button className="btn btn-ghost sp-back" onClick={onBack}>
        ← Fertig
      </button>

      <header className="sp-header">
        <div className="sp-cover-wrap">
          <AlbumCover url={playlist.imageUrl} alt={playlist.name} className="sp-cover" />
        </div>
        <div className="sp-header-info">
          <span className="sp-kicker">Playlist</span>
          <h1 className="sp-title">{playlist.name}</h1>
          <p className="sp-meta">
            <span className="sp-owner">{playlist.ownerName}</span>
            <span className="sp-dot">•</span>
            <span>
              {tracks.length} {tracks.length === 1 ? 'Song' : 'Songs'}
            </span>
            {totalLabel && (
              <>
                <span className="sp-dot">•</span>
                <span className="sp-total">{totalLabel}</span>
              </>
            )}
          </p>
          <p className="sp-pool">
            <span className="sp-pool-dot" /> {activeCount} im Pool
            {excludedIds.size > 0 && ` · ${excludedIds.size} entfernt`}
          </p>
        </div>
      </header>

      <p className="sp-hint">
        Tippe auf einen Song, um ihn aus dem Pool zu nehmen (oder zurückzuholen). Entfernte
        Songs werden beim Roulette nicht mehr gezogen – deine Spotify-Playlist bleibt unberührt.
      </p>

      <div className="sp-toolbar">
        <div className="sp-search">
          <SearchIcon className="sp-search-icon" />
          <input
            className="sp-search-input"
            type="search"
            inputMode="search"
            placeholder="In dieser Playlist suchen…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Songs durchsuchen"
          />
        </div>
        <label className="sp-sort">
          <span className="sp-sort-label">Sortieren</span>
          <select
            className="sp-sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sp-list" role="list">
        <div className="sp-row sp-row-head" aria-hidden="true">
          <span className="sp-col-idx">#</span>
          <span className="sp-col-title">Titel</span>
          <span className="sp-col-album">Album</span>
          <span className="sp-col-dur">
            <ClockIcon className="sp-clock" />
          </span>
          <span className="sp-col-act" />
        </div>

        {visible.map((t, i) => {
          const excluded = excludedIds.has(t.id)
          return (
            <div
              key={t.id}
              role="listitem"
              className={`sp-row sp-track${excluded ? ' sp-track-excluded' : ''}`}
              onClick={() => onToggleExclude(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggleExclude(t.id)
                }
              }}
              tabIndex={0}
              title={excluded ? 'Zurück in den Pool holen' : 'Aus dem Pool entfernen'}
            >
              <span className="sp-col-idx">
                <span className="sp-idx-num">{i + 1}</span>
              </span>
              <span className="sp-col-title sp-title-cell">
                <AlbumCover url={t.coverUrl} alt={t.title} className="sp-track-cover" />
                <span className="sp-track-text">
                  <span className="sp-track-name">{t.title}</span>
                  <span className="sp-track-artist">{t.artist}</span>
                </span>
              </span>
              <span className="sp-col-album">{t.album || '–'}</span>
              <span className="sp-col-dur">{formatDuration(t.durationMs)}</span>
              <span className="sp-col-act">
                <span className={`sp-action${excluded ? ' restore' : ''}`}>
                  {excluded ? 'Zurückholen' : 'Entfernen'}
                </span>
              </span>
            </div>
          )
        })}

        {visible.length === 0 && (
          <p className="sp-empty">
            {query.trim()
              ? `Keine Treffer für „${query.trim()}“.`
              : 'Diese Playlist enthält keine Songs.'}
          </p>
        )}
      </div>
    </section>
  )
}
