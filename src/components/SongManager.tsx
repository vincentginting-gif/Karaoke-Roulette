import type { Playlist, Track } from '../spotify/types'
import { AlbumCover } from './AlbumCover'
import { ClockIcon } from './icons'

interface SongManagerProps {
  playlist: Playlist
  tracks: Track[]
  excludedIds: Set<string>
  onToggleExclude: (trackId: string) => void
  onBack: () => void
}

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

        {tracks.map((t, i) => {
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
      </div>
    </section>
  )
}
