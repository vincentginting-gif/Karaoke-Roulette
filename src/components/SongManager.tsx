import { useMemo, useState } from 'react'
import type { Playlist, Track } from '../spotify/types'
import { useI18n } from '../i18n/i18n'
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

const SORT_KEYS: SortKey[] = ['playlist', 'title', 'artist', 'album', 'duration', 'pool']

/** mm:ss aus Millisekunden. */
function formatDuration(ms: number): string {
  if (!ms) return '–'
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Gesamtdauer der Playlist menschenlesbar (lokalisierte Einheiten). */
function formatTotal(tracks: Track[], unitMin: string, unitHour: string): string {
  const ms = tracks.reduce((sum, t) => sum + (t.durationMs || 0), 0)
  if (!ms) return ''
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} ${unitMin}`
  const h = Math.floor(min / 60)
  return `${h} ${unitHour} ${min % 60} ${unitMin}`
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
  const { t } = useI18n()
  const activeCount = tracks.length - excludedIds.size
  const totalLabel = formatTotal(tracks, t('sm.min'), t('sm.hour'))

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
        ← {t('common.done')}
      </button>

      <header className="sp-header">
        <div className="sp-cover-wrap">
          <AlbumCover url={playlist.imageUrl} alt={playlist.name} className="sp-cover" />
        </div>
        <div className="sp-header-info">
          <span className="sp-kicker">{t('home.playlist')}</span>
          <h1 className="sp-title">{playlist.name}</h1>
          <p className="sp-meta">
            <span className="sp-owner">{playlist.ownerName}</span>
            <span className="sp-dot">•</span>
            <span>
              {tracks.length} {t(tracks.length === 1 ? 'common.song' : 'common.songs')}
            </span>
            {totalLabel && (
              <>
                <span className="sp-dot">•</span>
                <span className="sp-total">{totalLabel}</span>
              </>
            )}
          </p>
          <p className="sp-pool">
            <span className="sp-pool-dot" /> {t('sm.inPool', { n: activeCount })}
            {excludedIds.size > 0 && ` · ${t('sm.removed', { n: excludedIds.size })}`}
          </p>
        </div>
      </header>

      <p className="sp-hint">{t('sm.hint')}</p>

      <div className="sp-toolbar">
        <div className="sp-search">
          <SearchIcon className="sp-search-icon" />
          <input
            className="sp-search-input"
            type="search"
            inputMode="search"
            placeholder={t('sm.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('sm.search')}
          />
        </div>
        <label className="sp-sort">
          <span className="sp-sort-label">{t('sm.sort')}</span>
          <select
            className="sp-sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            {SORT_KEYS.map((k) => (
              <option key={k} value={k}>
                {t(`sm.sort.${k}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sp-list" role="list">
        <div className="sp-row sp-row-head" aria-hidden="true">
          <span className="sp-col-idx">#</span>
          <span className="sp-col-title">{t('sm.colTitle')}</span>
          <span className="sp-col-album">{t('sm.colAlbum')}</span>
          <span className="sp-col-dur">
            <ClockIcon className="sp-clock" />
          </span>
          <span className="sp-col-act" />
        </div>

        {visible.map((track, i) => {
          const excluded = excludedIds.has(track.id)
          return (
            <div
              key={track.id}
              role="listitem"
              className={`sp-row sp-track${excluded ? ' sp-track-excluded' : ''}`}
              onClick={() => onToggleExclude(track.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggleExclude(track.id)
                }
              }}
              tabIndex={0}
              title={excluded ? t('sm.restoreTitle') : t('sm.removeTitle')}
            >
              <span className="sp-col-idx">
                <span className="sp-idx-num">{i + 1}</span>
              </span>
              <span className="sp-col-title sp-title-cell">
                <AlbumCover url={track.coverUrl} alt={track.title} className="sp-track-cover" />
                <span className="sp-track-text">
                  <span className="sp-track-name">{track.title}</span>
                  <span className="sp-track-artist">{track.artist}</span>
                </span>
              </span>
              <span className="sp-col-album">{track.album || '–'}</span>
              <span className="sp-col-dur">{formatDuration(track.durationMs)}</span>
              <span className="sp-col-act">
                <span className={`sp-action${excluded ? ' restore' : ''}`}>
                  {excluded ? t('sm.restore') : t('sm.remove')}
                </span>
              </span>
            </div>
          )
        })}

        {visible.length === 0 && (
          <p className="sp-empty">
            {query.trim() ? t('sm.noResults', { q: query.trim() }) : t('sm.emptyPlaylist')}
          </p>
        )}
      </div>
    </section>
  )
}
