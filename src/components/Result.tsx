import { useEffect, useState } from 'react'
import type { Track } from '../spotify/types'
import { useI18n } from '../i18n/i18n'
import { fetchPlatformLinks, songlinkPageUrl, type PlatformLink } from '../spotify/odesli'
import { AlbumCover } from './AlbumCover'
import { DiceIcon, ExternalIcon } from './icons'

interface ResultProps {
  track: Track
  onAgain: () => void
  onChangePlaylist: () => void
}

/** Ergebnisbereich – prominente Präsentation des Gewinner-Songs. */
export function Result({ track, onAgain, onChangePlaylist }: ResultProps) {
  const { t } = useI18n()
  const [links, setLinks] = useState<PlatformLink[]>([])

  // Echte Spotify-Track-ID? (22 Base62-Zeichen). Offline-Songs haben keine –
  // dann wird „Öffnen" zur Spotify-Suche und die Cross-Plattform-Links entfallen.
  const isRealTrack = /^[A-Za-z0-9]{22}$/.test(track.id)

  // Best-Effort: direkte Links zu anderen Plattformen laden. Bei Fehler
  // (CORS/Netzwerk) bleibt es beim universellen „song.link"-Button.
  useEffect(() => {
    if (!isRealTrack) return
    let cancelled = false
    setLinks([])
    fetchPlatformLinks(track.spotifyUrl)
      .then((l) => {
        if (!cancelled) setLinks(l)
      })
      .catch(() => {
        /* still: universeller Button reicht */
      })
    return () => {
      cancelled = true
    }
  }, [track.spotifyUrl, isRealTrack])

  return (
    <section className="stage stage-center result result-in">
      <p className="result-kicker">{t('result.kicker')}</p>

      <div className="result-cover-wrap glow-strong">
        <AlbumCover url={track.coverUrl} alt={`${track.title} – ${track.artist}`} className="result-cover" />
      </div>

      <h2 className="result-title">{track.title}</h2>
      <p className="result-artist">{track.artist}</p>

      <div className="result-actions">
        {/* Als echter Link (statt window.open) – funktioniert auf PC und Handy. */}
        <a
          className="btn btn-spotify"
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalIcon className="btn-icon" />
          {isRealTrack ? t('result.open') : t('result.search')}
        </a>
        <button className="btn btn-primary" onClick={onAgain}>
          <DiceIcon className="btn-icon" />
          {t('result.again')}
        </button>
      </div>

      {isRealTrack && (
        <div className="result-cross">
          <a
            className="result-cross-main"
            href={songlinkPageUrl(track.id)}
            target="_blank"
            rel="noreferrer"
          >
            🌐 {t('result.openElsewhere')}
          </a>
          {links.length > 0 && (
            <div className="result-cross-chips">
              {links.map((l) => (
                <a
                  key={l.key}
                  className="result-cross-chip"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <button className="btn btn-ghost result-switch" onClick={onChangePlaylist}>
        🔀 {t('result.switch')}
      </button>
    </section>
  )
}
